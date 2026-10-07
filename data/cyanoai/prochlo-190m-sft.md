# CyanoAI/Prochlo-190M-SFT

## Resumen

Prochlo-190M-SFT es la version afinada con aprendizaje supervisado (SFT) de Prochlo-190M-Base, un modelo de lenguaje denso de 190.467.840 parametros entrenado desde cero por CyanoAI sobre un cluster de aceleradores DCU. Se trata de un SLM (small language model) pensado para tareas de generacion de texto en ingles con requisitos de computo minimos: 12 capas, vocabulario de 50.261 tokens y un coste de entrenamiento de unos 7.700 millones de tokens en la fase de preentrenamiento.

El modelo resuelve el problema de disponer de un asistente conversacional muy ligero que quepa en una unica GPU de 16 GB (o incluso en hardware de gama baja) y que pueda desplegarse en el borde sin dependencias de infraestructura grande. La fase SFT se realizo sobre HuggingFaceTB/smol-smoltalk, aproximadamente 460.000 conversaciones en ingles formateadas con los tokens de control `<|user|>` y `<|assistant|>`, con enmascarado de la perdida sobre los turnos del asistente y una perdida final de 1,9308 en entrenamiento y ~1,94 en evaluacion.

Su relevancia actual es doble: por un lado sirve como referencia reproducible de un pipeline completo de preentrenamiento mas SFT ejecutado en hardware no convencional (DCU de 16 GB); por otro, es un candidato natural para fine-tuning especifico de dominio, destilacion y despliegue en produccion con presupuestos de memoria muy ajustados. La familia se completa con una variante alineada por preferencias (DPO + RLAIF) que, segun la model card, estaba en entrenamiento en el momento de publicacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (etiquetado como `qwen3` en los tags del repositorio; 12 capas) |
| Parametros totales | 190.467.840 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible como especificacion oficial; la fase SFT se entreno con `max_len` 1024 |
| Tipos de cuantizacion | No disponible (solo pesos fp16 publicados; no hay GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | Ingles (`en`) exclusivamente; la model card indica que la entrada en chino produce salida basura por diseno |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors, fp16, dividido en 32 fragmentos con `model.safetensors.index.json` |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only denso de 12 capas con un vocabulario de 50.261 tokens. Todas las variantes de la familia (Base, SFT y la futura alineada por preferencias) comparten arquitectura, tokenizer y vocabulario, lo que permite reutilizar plantillas, pipelines de tokenizacion y artefactos de despliegue entre ellas. El preentrenamiento del modelo base consumio aproximadamente 7.700 millones de tokens.

La fase de ajuste supervisado empleo el dataset HuggingFaceTB/smol-smoltalk, con unas 460.000 conversaciones en ingles formateadas en texto plano mediante los tokens de control `<|user|>` y `<|assistant|>`. El metodo fue SFT de parametros completos, 2 epocas, learning rate 3e-4 con schedule coseno, batch de 216, longitud maxima de 1024 tokens, precision fp16 y enmascarado de la perdida limitado a los tokens del asistente. El entrenamiento requirio 96.135 pasos y aproximadamente 27 horas en un unico acelerador DCU de 16 GB, con una perdida final de 1,9308 en entrenamiento y ~1,94 en evaluacion. No se documenta uso de RLHF, DPO ni decodificacion especulativa en esta variante; la alineacion por preferencias queda reservada a `CyanoAI/Prochlo-190M` (DPO + RLAIF), que estaba en entrenamiento.

Una particularidad relevante de ingenieria es que el modelo no usa chat template: el formato conversacional se construye como texto plano con tokens de control y el token de fin de turno `<|end|>` debe pasarse explicitamente como `eos_token_id` durante la generacion.

## Capacidades

- Generacion de texto conversacional en ingles con formato de turnos basado en tokens de control (`<|user|>`, `<|assistant|>`, `<|end|>`).
- Instrucciones de codigo: es uno de los dos puntos fuertes declarados en la rubrica de evaluacion del autor.
- Preguntas y respuestas factuales: segundo punto fuerte declarado.
- Conformidad de formato: la rubrica conductual de 26 items incluye adherencia al formato y anti-sicofancia, con un 61,5 % de aprobados.
- Generacion determinista reproducible mediante `do_sample=False` en los ejemplos oficiales.
- Razonamiento aritmetico: identificado explicitamente como debilidad, no como capacidad fiable.
- Coherencia multi-turno larga: identificada como debilidad en la propia model card.
- Soporte de tool calling / function calling: no disponible; no se documenta plantilla ni entrenamiento para ello.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multimodales (vision, audio): no disponibles.
- Modo de pensamiento explicito (thinking mode): no disponible.

## Casos de uso

- Asistente conversacional ligero en el borde: con 190 millones de parametros y pesos de aproximadamente 0,4 GB en fp16, puede ejecutarse en dispositivos con GPU integrada o en CPU, gestionando conversaciones cortas en ingles con el formato de tokens de control documentado.
- Modelo borrador para decodificacion especulativa: por su tamano y su compatibilidad con la arquitectura de la familia, encaja como draft model de un modelo mayor, reduciendo el coste por token generado en pipelines de inferencia con vLLM o TGI.
- Fine-tuning de dominio en ingles: al ser un modelo denso pequeno con licencia Apache-2.0, permite reentrenamiento completo sobre corpus especializados (legal, sanitario, soporte interno) con un presupuesto de una sola GPU.
- Explicacion y resumen de fragmentos de codigo: la rubrica del autor situa las instrucciones de codigo entre los puntos fuertes, de modo que puede usarse para generar comentarios, explicar funciones o producir snippets cortos en herramientas de documentacion.
- Extraccion de informacion estructurada: para tareas de clasificacion, etiquetado o conversion de texto a campos concretos en ingles, un modelo de este tamano es suficiente y mucho mas barato de servir que un modelo de miles de millones de parametros.
- Filtrado previo y moderacion de contenido: como primera etapa de un pipeline en cascada, clasificando o descartando entradas antes de invocar un modelo mayor, reduciendo coste y latencia global.
- Investigacion y docencia: sirve como caso reproducible de un pipeline preentrenamiento + SFT ejecutado en un unico acelerador de 16 GB, util para reproducir experimentos y estudiar el efecto del SFT en modelos muy pequenos.
- Base para destilacion: puede actuar como alumno en un esquema de destilacion desde un modelo mayor, aprovechando que su tokenizer y vocabulario son compartidos dentro de la familia.

## Benchmarks y rendimiento

| Evaluacion | Resultado |
|---|---|
| Rubrica conductual de 26 items (formato, anti-sicofancia, codigo, concision) | 61,5 % de aprobados |
| Perdida final de entrenamiento | 1,9308 |
| Perdida de evaluacion | ~1,94 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La model card solo reporta la rubrica interna de 26 items descrita arriba, sin desglose por categoria.

## Requisitos de hardware

- Pesos en fp16: aproximadamente 0,38 GB (190,47 M de parametros x 2 bytes); el repositorio completo ocupa 0,4 GB.
- VRAM estimada para inferencia: menos de 1 GB en fp16 contando pesos, activaciones y cache KV a longitudes de 1024 tokens; el modelo entra sobradamente en cualquier GPU con 2 GB o mas.
- GPU recomendadas: cualquier GPU consumer reciente (RTX 3060, RTX 4060, RTX 4090) e incluso GPU integradas; tambien es viable en CPU. No requiere A100 ni H100 salvo para entrenamiento a gran escala o fine-tuning con batches grandes.
- Cabe en GPU consumer: si, en la practica totalidad de las disponibles actualmente en el mercado.
- Opciones de despliegue: al publicarse solo pesos safetensors fp16, la via directa es HuggingFace Transformers con `AutoModelForCausalLM`. No se documentan conversiones oficiales a GGUF, por lo que llama.cpp u Ollama requeririan una conversion propia. La integracion con vLLM o TGI no esta documentada por el autor.
- Requisitos de entrenamiento segun el autor: 27 horas en un unico acelerador DCU de 16 GB para 96.135 pasos de SFT con batch 216 y `max_len` 1024 en fp16.
- Latencia y throughput estimados: no disponibles. El autor no publica mediciones de tokens por segundo ni de latencia en produccion.

## Comparativa con modelos similares

La comparacion se limita a atributos estructurales verificables, ya que no hay resultados de benchmarks publicados de Prochlo-190M-SFT que permitan una comparacion numerica directa.

| Modelo | Parametros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| Prochlo-190M-SFT | 190,47 M | Entrenado a 1024 tokens; contexto oficial no disponible | Apache-2.0 | Ingles | SFT sobre smol-smoltalk; pesos safetensors fp16; 0 descargas en HuggingFace |
| SmolLM2-135M | 135 M | 2048 tokens | Apache-2.0 | Ingles principalmente | Familia de SLM de HuggingFace, con variantes instruct publicadas y amplia adopcion |
| Qwen2.5-0.5B | ~494 M | 32.768 tokens | Apache-2.0 | Multilingue amplio | Mas del doble de parametros y contexto muy superior; ecosistema consolidado y cuantizaciones GGUF oficiales |
| TinyLlama-1.1B | ~1,1 B | 2048 tokens | Apache-2.0 | Ingles principalmente | Modelo mayor orientado a un equilibrio distinto entre calidad y coste de despliegue |

## Limitaciones y advertencias

- Idioma limitado al ingles: la propia model card advierte de que la entrada en chino produce salida sin sentido por diseno. No hay soporte multilingue real, por lo que no es apto para usuarios hispanohablantes sin fine-tuning previo.
- Razonamiento aritmetico debil: las operaciones matematicas se listan explicitamente como punto flojo, por lo que no debe usarse para calculos sin verificacion externa.
- Coherencia multi-turno limitada: la model card identifica la coherencia en conversaciones largas como debilidad, coherente con un contexto de entrenamiento de solo 1024 tokens.
- Respuestas poco concisas: la rubrica interna penaliza la falta de concision, uno de los items con peor resultado dentro del 38,5 % de fallos.
- Riesgo de alucinacion elevado: con 190 millones de parametros y ~7.700 millones de tokens de preentrenamiento, la capacidad factual es inferior a la de modelos de miles de millones de parametros; cualquier uso con requisitos de exactitud factual exige verificacion.
- Sin plantilla de chat: el formato se construye manualmente con `<|user|>` y `<|assistant|>`, y el token `<|end|>` debe pasarse como `eos_token_id`. Un uso incorrecto del formato degrada la calidad de la salida.
- Sin soporte documentado de tool calling, agentes, vision, audio ni modo de razonamiento explicito.
- Sin validacion de la comunidad: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y solo una rubrica interna de 26 items como evaluacion; no hay evaluaciones independientes.
- Estado de la familia incompleto: la variante alineada por preferencias (DPO + RLAIF) estaba en entrenamiento, de modo que la version SFT aqui descrita no incorpora alineacion por preferencias.
- Licencia permisiva: Apache-2.0 permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de licencia y se documenten los cambios. No se declaran restricciones adicionales de uso, pero el autor no publica informacion sobre la composicion completa del corpus de preentrenamiento, por lo que la trazabilidad de los datos es limitada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CyanoAI/Prochlo-190M-SFT
- Modelo base: https://huggingface.co/CyanoAI/Prochlo-190M-Base
- Variante alineada por preferencias (DPO + RLAIF, en entrenamiento): `CyanoAI/Prochlo-190M` — sin URL confirmada en la informacion disponible
- Dataset de SFT: https://huggingface.co/datasets/HuggingFaceTB/smol-smoltalk
- Paper, blog o repositorio adicional: no disponible en la informacion proporcionada
