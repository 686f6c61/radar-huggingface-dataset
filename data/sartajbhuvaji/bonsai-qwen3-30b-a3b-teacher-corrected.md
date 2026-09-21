# sartajbhuvaji/bonsai-qwen3-30b-a3b-teacher-corrected

## Resumen

bonsai-qwen3-30b-a3b-teacher-corrected es un checkpoint intermedio de ajuste fino completo (full-parameter fine-tuning) sobre Qwen/Qwen3-30B-A3B-Base, un modelo de mezcla de expertos (MoE) de 30.532.122.624 parametros totales y aproximadamente 3.000 millones de parametros activos por token. Lo publica el usuario sartajbhuvaji como parte del proyecto bonsai, cuyo objetivo final es podar y destilar este modelo hasta convertirlo en una version mas pequena especializada en TypeScript.

El problema que resuelve es metodologico. Las recetas de poda estructurada seguidas de destilacion suelen asumir acceso a la mezcla de preentrenamiento original del profesor, y esa mezcla no esta disponible para Qwen3. La card se apoya en el trabajo de Minitron (arXiv 2408.11796) para aplicar la idea de "teacher correction": antes de destilar nada, se ajusta brevemente el profesor sobre los datos objetivo, de modo que sus logits sean fiables en la distribucion concreta que el alumno va a aprender. Este checkpoint es exactamente ese profesor corregido, no el alumno.

Es relevante ahora porque documenta un paso poco habitual y poco publicitado de las tuberias de compresion de modelos: la correccion del profesor previa a la destilacion. No esta podado, no esta destilado y no se ha evaluado en tareas downstream de generacion de codigo; su unico proposito declarado es servir de fuente de logits para las siguientes etapas del proyecto bonsai.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE); tag de HuggingFace `qwen3_moe` |
| Parametros totales | 30.532.122.624 |
| Parametros activos | Aproximadamente 3.000 millones (designacion A3B del modelo base) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base Qwen3-30B-A3B-Base; el entrenamiento de este checkpoint uso secuencias de 512 tokens) |
| Tipos de cuantizacion | No disponible. El repositorio publica pesos en safetensors (61,1 GB, compatible con precision bf16/fp16); no se documentan versiones GGUF, AWQ, GPTQ ni fp8 |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 (heredada de Qwen3-30B-A3B-Base) |
| Formato de pesos | Safetensors |
| Modelo base | Qwen/Qwen3-30B-A3B-Base |
| Tipo de ajuste | Full-parameter fine-tuning (sin poda ni destilacion) |
| Tamano del repositorio | 61,1 GB |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen3-30B-A3B-Base: un transformer con capas de mezcla de expertos, 30.500 millones de parametros totales y unos 3.000 millones activos por token. Este checkpoint no modifica la topologia: conserva integramente el MoE original y solo actualiza los pesos mediante ajuste fino supervisado. No hay decodificacion especulativa, atencion lineal ni ninguna innovacion arquitectonica introducida por el autor; la innovacion esta en el procedimiento, no en la red.

El entrenamiento uso texto TypeScript extraido de `bigcode/the-stack-dedup`, una sola epoca sin repeticiones: 6.000 muestras frescas (1.500 pasos con tamano de lote 4), disjuntas del fragmento de calibracion empleado para medir la perdida de validacion. La funcion de perdida fue entropia cruzada de modelado de lenguaje estandar, sin destilacion en esta etapa. Se uso el optimizador AdamW de 8 bits de bitsandbytes, con calentamiento lineal durante el 15% de los pasos (225) y decaimiento coseno hasta un suelo, con LR maximo 2e-5 y LR minimo 2e-6; esa configuracion gano un barrido de 6 configuraciones (3 LR maximos x 2 fracciones de calentamiento, 150 pasos cada una) evaluado por delta de perdida de validacion y perdida final de entrenamiento. La longitud de secuencia fue de 512 tokens sin relleno, con acumulacion de gradiente y una sola muestra por paso hacia delante y hacia atras. El entrenamiento corrio en 8x A100 de 40 GB SXM4 con `device_map="auto"`, limite de memoria por GPU y checkpointing de gradiente activado.

El resultado declarado es una reduccion de la perdida de validacion de 0,9331 a 0,8842 sobre un fragmento de calibracion separado a nivel de shard (no a nivel de fila). El propio autor advierte de que el script de orquestacion exacto de la ejecucion no esta comprometido en el repositorio.

## Capacidades

- Generacion de texto autoregresiva sobre el corpus de preentrenamiento del modelo base y sobre texto TypeScript, que es el dominio de correccion.
- Modelado de lenguaje de TypeScript: es la capacidad sobre la que se optimizo explicitamente la perdida de validacion.
- Conversacion: el tag `conversational` aparece en la ficha de HuggingFace, pero al tratarse de un ajuste sobre un modelo base (no instruct) no se documenta plantilla de chat ni calidad de dialogo verificada.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: solo se declara ingles; no hay evaluacion multilingue.
- Capacidades especiales (modo pensamiento, vision, audio): no documentadas.
- Razonamiento, matematicas y codigo general: no evaluados en esta informacion. La card indica explicitamente que no se ha comparado en HumanEval-TS ni MBPP-TS.

## Casos de uso

- Destilacion de un alumno podado: es el uso para el que se creo el checkpoint. Sus logits sirven como objetivo de destilacion para candidatos de estudiante mas pequenos dentro del proyecto bonsai, evitando que el profesor corrija al alumno desde una distribucion que nunca fue ajustada al dominio objetivo.
- Investigacion sobre teacher correction: sirve como caso de estudio reproducible para medir cuanto aporta corregir el profesor antes de destilar, comparando contra destilar directamente desde Qwen3-30B-A3B-Base.
- Linea base de dominio TypeScript: permite cuantificar la ganancia de perdida (0,9331 a 0,8842) atribuible solo al ajuste de dominio, antes de introducir poda o destilacion, aislando el efecto de cada etapa.
- Generacion de continuaciones de codigo TypeScript en exploracion: con 3.000 millones de parametros activos por token, el coste de inferencia por token es bajo en relacion con los 30.500 millones totales, lo que permite experimentar sin el coste de un modelo denso equivalente.
- Estudio de transferencia de dominio en MoE: interesante para analizar como se redistribuye la carga entre expertos tras ajustar sobre un unico lenguaje con solo 1.500 pasos y 6.000 muestras.
- Punto de partida para ajustes posteriores: cualquier equipo que quiera un Qwen3-30B-A3B alineado con codigo TypeScript puede partir de este checkpoint en lugar del base, con el coste de un ajuste ya amortizado.
- Auditoria de recetas de compresion: util para reproducir y criticar el pipeline bonsai completo, ya que el autor documenta hiperparametros, hardware y criterio de seleccion de configuracion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explicitamente que este checkpoint "no se ha evaluado en tareas downstream de generacion de codigo (HumanEval-TS, MBPP-TS)"; esa evaluacion queda para despues de la destilacion en los estudiantes podados.

El unico dato cuantitativo publicado es la perdida de validacion:

| Metrica | Antes | Despues |
|---|---|---|
| Perdida de validacion (fragmento de calibracion TypeScript) | 0,9331 | 0,8842 |

Se trata de perdida de entropia cruzada sobre un shard disjunto del conjunto de reentrenamiento (separacion a nivel de shard, no de fila). No equivale a ninguna metrica de calidad de codigo generado ni permite comparacion directa con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan aproximadamente 61 GB en bf16/fp16 (tamano real del repositorio). En cuantizacion de 8 bits se situaria en torno a 30-31 GB y en 4 bits en torno a 16-18 GB, aunque el autor no publica cuantizaciones oficiales y estas cifras son estimaciones aritmeticas a partir del numero de parametros, no medidas.
- GPU recomendadas: el autor entreno con 8x A100 de 40 GB SXM4. Para inferencia en precision completa hacen falta al menos dos GPU de 40-48 GB, o una H100 de 80 GB. Alternativas como 2x A6000 (48 GB) o 2x L40S (48 GB) son viables con reparto de modelo.
- Cabe en GPU de consumo: en bf16 completo no cabe en ninguna GPU de consumo actual. En cuantizacion de 4 bits podria caber en una RTX 4090 o RTX 5090 de 24-32 GB, aprovechando que solo unos 3.000 millones de parametros estan activos por token. No hay confirmacion del autor de que esto se haya probado.
- Opciones de despliegue: al ser un MoE de 30.500 millones de parametros con 3.000 millones activos, los servidores con soporte MoE (vLLM, SGLang, TGI) son los candidatos naturales. llama.cpp y Ollama son viables si se generan cuantizaciones GGUF, que no estan publicadas por el autor. El repositorio solo contiene safetensors.
- Latencia y throughput estimados: no disponibles. El autor no publica ninguna medicion de latencia, tokens por segundo ni throughput.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Disponibilidad | Benchmarks publicados |
|---|---|---|---|---|---|---|
| bonsai-qwen3-30b-a3b-teacher-corrected | 30,53B (MoE) | ~3B | No disponible | Apache 2.0 | HuggingFace, 0 descargas, 0 likes | Ninguno; solo perdida de validacion 0,8842 |
| Qwen/Qwen3-30B-A3B-Base | 30,53B (MoE) | ~3B | No disponible en esta informacion | Apache 2.0 | HuggingFace | Si, en la documentacion del modelo base (no consultada aqui) |
| Alternativas de la misma categoria (MoE de ~30B con pocos parametros activos, o modelos densos de codigo de ~30B) | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

La unica comparacion con datos verificables en la informacion proporcionada es contra el propio modelo base: arquitectura y recuento de parametros identicos, mismo licenciamiento Apache 2.0, y una perdida de validacion en TypeScript que baja de 0,9331 a 0,8842 tras el ajuste. No hay datos de benchmarks que permitan situar este checkpoint frente a otras alternativas de codigo.

## Limitaciones y advertencias

- No es un modelo final: es un checkpoint intermedio disenado como profesor para una etapa posterior de destilacion. No deberia desplegarse como modelo de produccion sin evaluacion propia.
- Ausencia total de evaluacion downstream: el autor declara explicitamente que no se han medido HumanEval-TS ni MBPP-TS. Cualquier afirmacion sobre su calidad generando codigo seria especulativa.
- Derivado de un modelo base, no de un instruct: no hay garantia de seguir instrucciones, mantener formato de chat ni respetar plantillas de herramienta. El tag `conversational` de HuggingFace no viene acompanado de evidencia.
- Sesgos: no hay analisis de sesgos en la informacion disponible. El corpus `the-stack-dedup` procede de codigo publico y arrastra los sesgos de licenciamiento y estilo de ese origen.
- Riesgo de alucinacion: inherente a un modelo de lenguaje entrenado con entropia cruzada; sin ajuste por preferencias humano (RLHF/DPO) en esta etapa, no hay mitigacion documentada.
- Limitaciones de contexto e idioma: solo se declara ingles y el entrenamiento uso 512 tokens de longitud de secuencia; no se documenta ninguna ampliacion de contexto.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se hereda de Qwen3-30B-A3B-Base y el dataset de ajuste procede de codigo fuente con licencias heterogeneas; conviene revisar la procedencia del codigo TypeScript usado.
- Caveat de reproducibilidad: el script de orquestacion exacto de la ejecucion no esta comprometido en el repositorio, solo el modulo reutilizable. Reproducir la perdida reportada requiere reimplementar la orquestacion.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, lo que implica que no hay comunidad que haya validado el checkpoint de forma independiente.
- Riesgo de sobreajuste al fragmento de calibracion: con solo 6.000 muestras y 1.500 pasos, la mejora de 0,0489 en perdida de validacion es modesta y esta medida en un unico shard de calibracion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sartajbhuvaji/bonsai-qwen3-30b-a3b-teacher-corrected
- Modelo base: https://huggingface.co/Qwen/Qwen3-30B-A3B-Base
- Repositorio del proyecto bonsai: https://github.com/SartajBhuvaji/bonsai
- Codigo de entrenamiento: https://github.com/SartajBhuvaji/bonsai/tree/main/src/bonsai/training
- Paper de referencia sobre teacher correction (Minitron): https://arxiv.org/abs/2408.11796
- Dataset de entrenamiento: bigcode/the-stack-dedup (referenciado en la model card; no se aporta URL directa)

Nota: los resultados de busqueda web proporcionados no contienen ningun enlace relevante al modelo. Todos apuntan a descargadores de video de YouTube sin relacion alguna con el objeto de esta ficha, por lo que se descartan.
