# j-llm/Qwen3.5-2B-SpeedX2

## Resumen

Qwen3.5-2B-SpeedX2 es un modelo de lenguaje de 2.312 millones de parametros derivado de Qwen/Qwen3.5-2B mediante una transformacion arquitectonica completa: todas las capas de atencion completa (full-attention) del modelo original han sido sustituidas por capas Gated DeltaNet (GDN), un mecanismo de atencion lineal. El resultado es un modelo "all-GDN" en el que ninguna capa mantiene atencion cuadratica clasica, lo que elimina el crecimiento del KV cache con la longitud de la secuencia.

El modelo lo publica el usuario j-llm sobre el trabajo previo de summerMC (Qwen3.5-2B-SpeedX), y recupera la precision perdida durante la sustitucion mediante destilacion desde el modelo original Qwen/Qwen3.5-2B, usado como profesor. Segun la model card, no se ha realizado SFT con datos de conocimiento adicional: el proceso es exclusivamente de restauracion de capacidades.

Su relevancia practica reside en la combinacion de un tamano pequeno (apto para GPU de consumo), licencia Apache 2.0 y coste de inferencia constante en contexto largo, lo que lo hace atractivo para despliegues con secuencias extensas donde el KV cache de un transformer clasico seria prohibitivo. La contrapartida es que la destilacion aproxima el comportamiento del profesor y puede degradar tareas de razonamiento, matematicas y codigo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con todas las capas de atencion sustituidas por Gated DeltaNet (atencion lineal, all-GDN) |
| Parametros totales | 2.312.357.120 (2,31 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (etiquetado como long-context; sin cifra publicada) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos en safetensors; compatibles con cuantizacion posterior via herramientas externas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (heredada del modelo base Qwen/Qwen3.5-2B) |
| Formato de pesos | safetensors (repo de 4,6 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-2B y reemplaza cada capa de atencion completa por una capa Gated DeltaNet, un mecanismo de atencion lineal con estado recurrente y compuerta. Al no existir atencion cuadratica en ninguna capa, el KV cache no crece con la longitud de la secuencia, de modo que memoria y velocidad de decodificacion se mantienen aproximadamente constantes independientemente del contexto. El pipeline es compatible con `transformers` sin `trust_remote_code`, y opcionalmente acelera con `flash-linear-attention`.

El entrenamiento es un proceso de destilacion en dos etapas descrito en la model card. La etapa 1 entrena cada capa GDN de forma paralela para que su salida coincida con la de la capa full-attention original que sustituye, usando una perdida combinada de MSE relativo y similitud coseno, con las entradas entre capas detachadas. La etapa 2 realiza un ajuste end-to-end minimizando la KL entre los logits del modelo y los del profesor Qwen/Qwen3.5-2B, junto con una perdida sobre estados ocultos. Se emplean pesos maestros en fp32 con autocast bf16 y optimizador fused AdamW. Los pesos finales se generan sustituyendo unicamente los tensores correspondientes en los shards safetensors originales. No se aplico SFT con datos nuevos.

## Capacidades

- Generacion de texto conversacional y continuacion de secuencias, con plantilla de chat compatible con el tokenizer de Qwen.
- Procesamiento de contexto largo con coste de memoria constante gracias a la atencion lineal en todas las capas.
- Razonamiento y matematicas: presentes en el modelo base, pero potencialmente degradados por la destilacion (la propia model card lo advierte).
- Generacion de codigo: capacidad heredada del profesor, con la misma advertencia de posible degradacion.
- Soporte de modo thinking mediante `enable_thinking` en la plantilla de chat (usado en el ejemplo de la model card).
- Tool calling / function calling: no confirmado en la informacion disponible.
- Capacidades de agente y razonamiento multi-paso: no confirmadas en la informacion disponible.
- Capacidades multilingues: no detalladas; el ejemplo de la model card esta en japones, lo que sugiere cobertura al menos de japones e ingles, pero sin confirmacion oficial.
- Vision / audio: no disponible.

## Casos de uso

- Procesamiento de documentos largos en GPU de consumo: al mantener memoria constante con la longitud, permite ingerir contratos, informes o transcripciones extensas en una sola pasada sobre una RTX 4090 o similar, sin que el KV cache agote la VRAM.
- Asistente conversacional multi-turno con historial extenso: el coste de atencion no crece con el numero de turnos acumulados, lo que abarata sesiones largas en produccion.
- Despliegue en edge o entornos con VRAM limitada: con 2,31 mil millones de parametros, el modelo en bf16 ocupa aproximadamente 4,6 GB de pesos, lo que deja margen para contexto y batch en GPUs de 8-16 GB.
- Generacion aumentada por recuperacion (RAG) sobre corpus grandes: la ventana larga y el coste lineal permiten concatenar muchos fragmentos recuperados sin penalizacion cuadratica.
- Prototipado e investigacion en arquitecturas lineales: sirve como banco de pruebas para evaluar Gated DeltaNet frente a atencion clasica en tareas controladas, con un profesor de referencia para comparar.
- Clasificacion y extraccion de informacion en lotes largos: el throughput estable en secuencias extensas favorece tareas de etiquetado o extraccion sobre documentos completos.
- Base para fine-tuning ligero: al ser Apache 2.0 y cargar en `transformers` estandar, es viable adaptarlo con LoRA a dominios concretos partiendo de un modelo ya alineado con el profesor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una seccion de resultados con la anotacion "(evaluacion no rellenada)", por lo que no existen cifras de MMLU, HumanEval, GSM8K ni de recuperacion de precision frente al profesor.

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 4,6-5 GB solo para pesos, mas overhead de activaciones y estado recurrente (este ultimo de tamano fijo, independiente de la longitud).
- VRAM estimada en cuantizacion de 8 bits: alrededor de 2,3-3 GB; en 4 bits, alrededor de 1,5-2 GB (estimaciones a partir del numero de parametros, no publicadas por el autor).
- GPU recomendadas: A100, H100 o L40S para produccion con batch alto; RTX 4090, RTX 4080 y RTX 3090 para desarrollo e inferencia individual.
- Cabe en GPU de consumo: si, previsiblemente en tarjetas de 8 GB o mas en bf16, y en 6-8 GB con cuantizacion.
- Opciones de despliegue: `transformers` nativo (soporte confirmado); `flash-linear-attention` para kernels rapidos; vLLM, llama.cpp, Ollama y TGI no estan confirmados para esta arquitectura all-GDN en la informacion disponible.
- Latencia y throughput: no disponibles. La model card advierte que con `use_cache=False` la generacion es mas lenta; el uso del cache estandar de `transformers` puede fallar con `ValueError` en `get_seq_length` para esta arquitectura.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Notas |
|---|---|---|---|---|---|
| j-llm/Qwen3.5-2B-SpeedX2 | 2,31 B | no disponible | All-GDN (atencion lineal) | Apache 2.0 | Destilado desde Qwen3.5-2B; sin benchmarks publicados |
| Qwen/Qwen3.5-2B (modelo base/profesor) | ~2 B | no disponible | Transformer con atencion completa | Apache 2.0 | Referencia de precision; KV cache crece con el contexto |
| summerMC/Qwen3.5-2B-SpeedX | ~2 B | no disponible | All-GDN | Apache 2.0 (presumible) | Version previa sin recuperacion de precision por destilacion |

No se dispone de datos de rendimiento comparado entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- La destilacion aproxima el comportamiento del profesor; la propia model card advierte de posible degradacion en razonamiento, matematicas y codigo respecto a Qwen/Qwen3.5-2B.
- No se ha realizado SFT con conocimiento adicional: el modelo no incorpora informacion nueva, solo restaura lo aprendido del profesor.
- El cache estandar de `transformers` puede fallar en esta arquitectura (`ValueError` en `get_seq_length`); es necesario usar `use_cache=False` o aplicar un parche, lo que afecta al rendimiento en produccion.
- Riesgo de alucinacion inherente a un modelo de 2 B de parametros, sin mitigaciones especificas documentadas.
- Sesgos: no documentados en la informacion disponible; se heredan los del modelo base.
- Idiomas soportados no declarados oficialmente; la cobertura multilingue no esta garantizada mas alla de lo observado en los ejemplos.
- Soporte en frameworks de inferencia de alto rendimiento (vLLM, TGI, llama.cpp) no confirmado para la arquitectura all-GDN.
- Ausencia total de benchmarks publicados: no es posible validar la recuperacion de precision ni comparar con alternativas de forma cuantitativa.
- La licencia Apache 2.0 permite uso comercial, pero se heredan las condiciones del modelo base Qwen/Qwen3.5-2B.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/j-llm/Qwen3.5-2B-SpeedX2
- Modelo base / profesor: https://huggingface.co/Qwen/Qwen3.5-2B
- Modelo de conversion previo: https://huggingface.co/summerMC/Qwen3.5-2B-SpeedX
- Referencia de la model card a `flash-linear-attention`: no disponible (sin URL en la informacion proporcionada)
