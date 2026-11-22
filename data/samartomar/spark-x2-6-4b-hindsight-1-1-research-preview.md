# samartomar/spark-x2.6-4b-hindsight-1.1-research-preview

## Resumen

spark-x2.6-4b-hindsight-1.1-research-preview es un adaptador LoRA de tipo rsLoRA (rank 128) entrenado por el usuario samartomar sobre el modelo base XHToken/Spark-X2.6-4B, un transformer de 4.112.079.360 parametros. El adaptador esta especializado en tareas de "memoria retrospectiva" (Hindsight memory) segun la plataforma hindsight.vectorize.io: extraccion de hechos, consolidacion de observaciones, actualizacion de paginas de memoria, retraccion de afirmaciones y generacion de respuestas estructuradas. Se distribuye junto con un gateway compatible con la API de OpenAI (`spark_prod_server.py`) y cuatro exportaciones GGUF para `llama.cpp`.

La relevancia de esta ficha es doble. Por un lado, documenta un caso de adaptacion PEFT sobre un modelo de 4B con un pipeline de destilacion desde cuatro especialistas. Por otro, y de forma mas importante para quien evalue su uso en produccion, el propio autor declara en la model card que esta version **fallo su prueba multi-paso**: en 30 flujos de trabajo encadenados de Hindsight, la version 1.1 no acerto en ninguno de los 30 todos los estadios, frente a 18 de 30 de la version anterior V14. El autor ha detenido el entrenamiento y recomienda usar V14.

Se trata, por tanto, de un artefacto de investigacion con fecha de noviembre de 2026, publicado bajo licencia Apache 2.0, con 739 descargas y un unico "like" en Hugging Face. No es un modelo de proposito general ni compite en benchmarks estandar como MMLU o HumanEval; su evaluacion se limita a un conjunto propio de 495 casos de desarrollo en 11 tareas de Hindsight.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base XHToken/Spark-X2.6-4B) con adaptador LoRA rsLoRA de rank 128 |
| Parametros totales | 4.112.079.360 (modelo base); adaptador de 259M parametros (1,04 GB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF BF16, Q8_0, Q6_K, Q4_K_M (cuatro exportaciones incluidas); base entrenada en BF16 puro |
| Idiomas soportados | Ingles (unico idioma declarado) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT) y GGUF (cuatro variantes fusionadas) |

## Arquitectura y entrenamiento

El adaptador se entrena "fresh-from-base" en precision BF16 pura sobre el modelo base Spark-X2.6-4B, sin partir de la cadena de adaptadores anteriores (V9 a V14). Usa rsLoRA con rank 128, lo que produce un adaptador de 259M parametros, notablemente mayor que el LoRA de 65M parametros de la version V14 (rank 32). El proceso de entrenamiento descrito en la model card consta de cuatro fases: entrenamiento de cuatro especialistas, destilacion hacia una version `v1.0` con 7.606 ejemplos, y una fase final C3 con 1.298 mas 273 ejemplos. No se detalla la composicion exacta de los datos de entrenamiento ni si se empleo RLHF o DPO.

La innovacion principal no esta en el adaptador sino en el empaquetado: se incluye un "Writer Gateway" (`spark_prod_server.py`) compatible con la API de OpenAI, con ordenacion por gramatica y reintentos (hasta 1), disenado para orquestar las llamadas del modelo en el pipeline de Hindsight. La model card documenta un fallo relevante de este gateway: la version publicada devuelve HTTP 422 en 68 de los 495 casos, aunque el checker puntua 64 de esas 68 respuestas como correctas, lo que indica un problema de validacion en el gateway y no en los pesos. Ademas, la version 1.1 se evaluo con "thinking" activado y desactivado, ya que el modelo base incorpora un modo de razonamiento que V14 no tenia (V14 fue entrenado sin thinking y sus primeros intentos caen de 463 a 403 aciertos cuando se activa).

## Capacidades

- Extraccion de hechos (retain) desde texto conversacional hacia estructuras de memoria.
- Consolidacion de observaciones multiples en entradas coherentes.
- Creacion y actualizacion de paginas de memoria con contenido estructurado.
- Retraccion de afirmaciones retiradas o invalidadas.
- Reescritura de consultas (query rewriting) para recuperacion.
- Generacion de argumentos de herramientas de seguimiento (tool arguments) en formato estructurado.
- Acortamiento de respuestas (response shortening) y deduplicacion de entradas.
- Extraccion final estructurada (structured final extraction) con salida validable por gramatica.
- Soporte de "thinking mode" heredado del modelo base.
- Generacion de texto conversacional en ingles.
- No se documentan capacidades de vision, audio, codigo general ni matematicas fuera del ambito Hindsight.

## Casos de uso

- Construccion de un sistema de memoria de agente a largo plazo: el adaptador se usa como "writer" que transforma turnos de conversacion en hechos atomicos y entradas de pagina, con el gateway validando la estructura de salida antes de persistir en la base de memoria.
- Consolidacion periodica de memoria: dado un lote de observaciones acumuladas, el modelo las fusiona en entradas deduplicadas, reduciendo el crecimiento descontrolado del almacen. La tarea de consolidacion obtiene 98,1% de acierto en la evaluacion bare.
- Gestion de retracciones en sistemas RAG: cuando una fuente se invalida, el modelo marca las afirmaciones afectadas como retiradas y actualiza las paginas dependientes, manteniendo la coherencia del corpus.
- Reescritura de consultas en pipelines de recuperacion: el modelo reformula la pregunta del usuario en terminos alineados con el vocabulario de la memoria, tarea en la que alcanza 100% en la evaluacion bare.
- Generacion de argumentos de herramientas en agentes multi-paso: produce los parametros JSON de la siguiente llamada a herramienta dentro de un flujo Hindsight, con 83,3% de acierto bare.
- Prototipado local en una unica GPU: los GGUF Q4_K_M y Q6_K permiten ejecutar el modelo en `llama.cpp` sobre una RTX 3090 (configuracion probada por el autor), util para experimentar con el pipeline sin depender de APIs externas.
- Evaluacion comparativa de estrategias de memoria: sirve como referencia negativa frente a V14 en estudios de ablacion sobre serving y gramaticas, dado que la model card publica las cinco configuraciones de evaluacion.

## Benchmarks y rendimiento

Los unicos datos publicados son del conjunto propio de 495 casos de desarrollo en 11 tareas Hindsight, puntuados por el rule-checker v5. No hay resultados de MMLU, HumanEval, GSM8K ni benchmarks estandar.

| Tarea | Casos | V14 bare | 1.1 bare | V14 served | 1.1 served (publicado) |
|---|---:|---:|---:|---:|---:|
| Extraccion de hechos (retain) | 68 | 82,4% | 91,2% | 41,2% | 100,0% |
| Consolidacion | 103 | 95,1% | 98,1% | 84,5% | 98,1% |
| Respuesta de cierre | 54 | 100,0% | 98,1% | 44,4% | 48,1% |
| Creacion inicial de pagina | 54 | 94,4% | 98,1% | 40,7% | 48,1% |
| Extraccion final estructurada | 48 | 100,0% | 100,0% | 100,0% | 100,0% |
| Reescritura de consulta | 24 | 91,7% | 100,0% | 100,0% | 100,0% |
| Argumentos de herramienta | 24 | 66,7% | 83,3% | 83,3% | 100,0% |
| Acortamiento de respuesta | 24 | 100,0% | 100,0% | 100,0% | 100,0% |
| Deduplicacion | 8 | 100,0% | 100,0% | 100,0% | 100,0% |
| Actualizacion de pagina | 40 | 95,0% | 100,0% | 67,5% | 100,0% |
| Retraccion de afirmacion | 48 | 100,0% | 100,0% | 79,2% | 75,0% |

Resultado global (pass / uncertain / fail): 1.1 bare 97,2% (481/2/12, 8 criticos); 1.1 served con gateway publicado 85,9% (425/2/68, 68 criticos); V14 bare 93,5% (463/3/29, 11 criticos); V14 served 70,7% (350/4/141, 116 criticos); modelo base original 25,1% (124/12/359).

En la prueba multi-paso de 30 flujos encadenados con ocho estadios, 1.1 no fue correcto en ninguno de los 30 (error critico en 26 o 27), frente a 18 de 30 de V14, 3 de 30 de Claude Haiku 5.5 y 0 de 30 de Claude Sonnet 5.5.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 4,1B en BF16 requiere aproximadamente 8,2 GB de pesos; en Q8_0 unos 4,4 GB; en Q6_K unos 3,4 GB; en Q4_K_M unos 2,6 GB. El adaptador rsLoRA anade 1,04 GB si se carga por separado.
- GPU recomendadas: el autor probo sobre una RTX 3090. Cabe en RTX 4090, RTX 3090, RTX 4080 y, con cuantizacion Q4_K_M, en GPUs de 8 GB como RTX 3070 o RTX 4060. Para BF16 completo se recomienda A100, H100 o L40S.
- Cabe en GPU de consumo: si, en la mayoria de GPUs con 8 GB o mas usando los GGUF incluidos, y con 12 GB o mas en Q8_0.
- Opciones de despliegue: `llama.cpp` (soportado de forma explicita con los GGUF), PEFT con el loader portatil incluido, y el Writer Gateway propio (`spark_prod_server.py`) compatible con la API de OpenAI. No se documenta soporte especifico para vLLM o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en 30 flujos Hindsight | Licencia |
|---|---|---|---|---|
| spark-x2.6-4b-hindsight-1.1 | 4,1B + 259M adaptador | no disponible | 0 de 30 correctos (26-27 con error critico) | Apache 2.0 |
| spark-x2.6-4b-hindsight-v14 | 4,1B + 65M adaptador | no disponible | 18 de 30 correctos (5 con error critico) | Apache 2.0 (presumible, mismo autor) |
| Claude Haiku 5.5 (API) | no disponible | no disponible | 3 de 30 correctos (23 con error critico) | Propietaria |
| Claude Sonnet 5.5 (API) | no disponible | no disponible | 0 de 30 correctos (26 con error critico) | Propietaria |

La comparacion con modelos de proposito general no es posible con los datos disponibles: no se publican resultados de benchmarks estandar para ninguna de las variantes.

## Limitaciones y advertencias

- El autor declara que esta version fallo su prueba multi-paso y recomienda usar V14 en su lugar; el entrenamiento se detuvo y no se publicaran mas adaptadores.
- El gateway publicado devuelve HTTP 422 en 68 de 495 casos aunque 64 de esas respuestas sean correctas segun el checker, lo que rompe el pipeline en produccion.
- El modelo solo soporta ingles; no se declaran capacidades multilingues.
- La longitud de contexto no esta documentada, lo que impide planificar su uso con conversaciones largas.
- Es un adaptador especializado en un unico dominio (Hindsight memory); su rendimiento fuera de ese pipeline no esta evaluado y probablemente sea pobre.
- El conjunto de evaluacion son 495 casos de desarrollo expuestos, no un test ciego; el propio autor advierte de que los rangos en la tabla cubren distintas lecturas de las marcas del juez.
- Riesgo de alucinacion en la extraccion de hechos: el modelo puede generar entradas de memoria plausibles pero no sustentadas en el texto fuente, especialmente con thinking desactivado.
- Aunque la licencia es Apache 2.0, el modelo base XHToken/Spark-X2.6-4B debe verificarse por separado antes de uso comercial.
- El repositorio ocupa 19,9 GB, lo que incluye los cuatro GGUF y el adaptador; conviene descargar solo los artefactos necesarios.
- No hay datos publicados de sesgos, latencia ni throughput, lo que dificulta una evaluacion de produccion.

## Enlaces

- Hugging Face: https://huggingface.co/samartomar/spark-x2.6-4b-hindsight-1.1-research-preview
- Version recomendada V14: https://huggingface.co/samartomar/spark-x2.6-4b-hindsight-v14-research-preview
- Modelo base: https://huggingface.co/XHToken/Spark-X2.6-4B
- Plataforma Hindsight: https://hindsight.vectorize.io/
