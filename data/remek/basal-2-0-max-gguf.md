# Remek/basal-2.0-max-GGUF

## Resumen

basal-2.0-max-GGUF es la distribucion en formato GGUF del modelo basal-2.0-max, un modelo de decision tipada de 11.167.748.096 parametros construido por Remek sobre el modelo base speakleash/Bielik-PL-11B-v3.0-Instruct. No es un modelo de chat generico: su proposito es emitir decisiones estructuradas (eleccion entre opciones, si/no, puntuaciones) leyendo las log-probabilidades de los codigos de opcion, con calibracion medida frente a la version bf16 de referencia. El repositorio incluye los pesos Q8_0 y Q5_K_M, Modelfiles para Ollama, ficheros de calibracion y variantes con metadatos de decision para LM Studio.

La relevancia practica esta en el binomio modelo-motor: el servidor basal-serve se coloca delante de Ollama o llama.cpp, renderiza el prompt propio del modelo y explota las log-probabilidades para producir respuestas tipadas en lugar de texto libre. Esto lo orienta a clasificacion, enrutado y toma de decisiones automatizada en entornos donde se necesita una salida verificable y calibrada, no una generacion abierta.

El modelo base Bielik-PL-11B-v3.0-Instruct aporta el conocimiento linguistico (principalmente polaco, con ingles) y la capacidad conversacional; basal anade la capa de decision y la calibracion. La licencia es Apache 2.0 y el repo ocupa 39,7 GB en total.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Bielik-PL-11B-v3.0-Instruct, transformer; detalles no publicados en la informacion disponible) |
| Parametros totales | 11.167.748.096 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 4.096 tokens en modo Ollama (basal-serve fija num_ctx 4096); configurable en llama.cpp via `llama-server -c` (ejemplo con 32.768); en modo gguf lo que permita la carga en proceso |
| Tipos de cuantizacion | Q8_0 (12 GB) y Q5_K_M (7,5 GB); variantes `-decision` con metadatos para LM Studio |
| Idiomas soportados | pl, en |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base); incluye Modelfile.Q8_0, Modelfile.Q5_K_M, basal.json y ficheros de calibracion |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna ni el proceso de entrenamiento de basal-2.0-max. Se sabe que parte de speakleash/Bielik-PL-11B-v3.0-Instruct, un modelo instruct de 11B parametros orientado a polaco e ingles, y que la contribucion de basal es una capa de decision tipada con calibracion: el motor basal-serve renderiza un prompt propio y lee las log-probabilidades de los codigos de opcion para producir una eleccion, un si/no o una puntuacion. No se publican en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO.

La innovacion tecnica destacable es el enfoque de "puerto medido": cada cuantizacion se valida contra la version bf16 de referencia sobre el conjunto de desarrollo dev v2 con umbrales explicitos (agreement 2-10 >= 0,9552; agreement con margen >= 0,2 >= 0,9893; diferencia de accuracy <= 1 punto; ECE como maximo +0,01). Los resultados de esa validacion se recogen en la tabla de benchmarks. Ademas, el motor v2.5.0 permite exportar los metadatos de decision a cualquier GGUF con `basal-export-gguf` sin tocar los tensores.

## Capacidades

- Decision tipada: eleccion entre 2 y 10 opciones (hasta 26 en LM Studio), preguntas si/no y emision de puntuaciones.
- Clasificacion con calibracion: temperaturas tomadas de CALIBRATION.llamacpp.json para ajustar la confianza de la salida.
- Generacion de texto y conversacion heredadas del modelo base Bielik-PL-11B-v3.0-Instruct (pipeline text-generation, tags conversational).
- Capacidades multilingues limitadas a polaco e ingles.
- Integracion con Ollama (0.12.11 o superior) y llama.cpp mediante basal-serve, con modos `ollama`, `llamacpp` y `gguf`.
- Soporte de concurrencia mediante `--http-parallel N` junto con OLLAMA_NUM_PARALLEL o `llama-server -np`.
- Compatibilidad con LM Studio 0.4.26 o superior (canal beta, motor llama.cpp 2.65.1 o superior) a traves de los endpoints `/v1/systemone` y `/v1/decisions`.
- No se documentan en la informacion disponible capacidades de tool calling, function calling, agentes multi-paso, vision, audio ni modo thinking.

## Casos de uso

- Enrutado de peticiones en pipelines: dado un texto de entrada, el modelo elige entre un conjunto cerrado de categorias (hasta 10 opciones en Ollama, 26 en LM Studio) con una probabilidad calibrada, lo que permite derivar cada peticion al servicio correspondiente.
- Moderacion y filtrado binario: las preguntas si/no con calibracion ECE controlada encajan en la clasificacion de contenido permitido o no permitido, con umbrales ajustables segun la temperatura de calibracion.
- Triaje de tickets de soporte en polaco: la ventana de 4.096 tokens en modo Ollama cubre la mayoria de descripciones de incidencia y el modelo asigna categoria y prioridad como decision tipada.
- Puntuacion de relevancia en busqueda: el modelo emite una puntuacion por documento candidato, y el motor lee las log-probabilidades para ordenar resultados con una medida comparable entre consultas.
- Extraccion de decisiones en formularios o encuestas: mapear respuestas de texto libre a opciones predefinidas de un cuestionario, aprovechando el agreement de 0,9925 (Q8_0) frente a bf16 para garantizar consistencia con la version de referencia.
- Despliegue en escritorio y portatil: con Q5_K_M (7,5 GB) o Q8_0 (12 GB) sobre Ollama o llama.cpp, el modelo cabe en equipos de consumo para prototipos y herramientas locales de decision, sin depender de servidores GPU.
- Validacion en CI de clasificadores: usar `basal-export-gguf` para anadir metadatos de decision a una cuantizacion propia y comparar su agreement contra bf16 antes de promoverla, integrandolo como test de regresion del pipeline.

## Benchmarks y rendimiento

Los datos publicados son comprobaciones de la capa de decision contra la version bf16 sobre dev v2 (para MLX, cada octava decision, 1.700 decisiones), no benchmarks academicos del modelo base.

| Paquete | Agreement con bf16 (opciones 2-10) | Agreement con margen >= 0,2 | Diferencia de accuracy | Diferencia de ECE | Tamano | Velocidad | Gate |
|---|---|---|---|---|---|---|---|
| FP8 | 0,9704 | 0,9948 | +0,0005 | -0,0010 | 12 GB | 19,9 dec/s c16, c1 p50 50 ms (H100) | PASS |
| GGUF Q8_0 | 0,9925 | 0,9997 | +0,0002 | +0,0018 | 12 GB | no medida en esta release | PASS |
| GGUF Q5_K_M | 0,9766 | 0,9970 | -0,0001 | +0,0032 | 7,5 GB | no medida en esta release | PASS |
| MLX 8-bit | 0,9933 | 0,9990 | +0,0017 | +0,0053 | 12 GB | 622 ms c1 p50, 1.506 ms para 5 preguntas (Mac) | PASS |

Umbrales del tier: agreement 2-10 >= 0,9552; agreement con margen >= 0,2 >= 0,9893; accuracy dentro de 1 punto de bf16; ECE como maximo +0,01. No se han publicado resultados de benchmarks academicos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: 12 GB para Q8_0 y 7,5 GB para Q5_K_M, segun los tamanos de fichero indicados por el autor.
- GPU recomendadas: H100 para el paquete FP8 (19,9 dec/s con c16, p50 de 50 ms con c1); no se especifican GPU recomendadas para los GGUF.
- En GPU de consumo: los GGUF estan pensados para escritorio y portatil, no para servidores; el autor advierte que en un Apple M4 Pro de 24 GB, Ollama y llama-server se quedaron sin memoria Metal al convivir con otro proceso GPU de unos 5 GB, y que los ficheros max GGUF no se probaron en Mac.
- Despliegue: Ollama 0.12.11 o superior, llama.cpp (`llama-server`), basal-serve en modos `ollama`, `llamacpp` o `gguf` (este ultimo con `basal[gguf]` y llama-cpp-python), y LM Studio 0.4.26 o superior con motor llama.cpp.
- Latencia y throughput: no medidos para los GGUF en esta release; el autor senala que GGUF es la via lenta para lotes y que Ollama limita a 20 log-probabilidades por posicion, por lo que preguntas con mas de 20 opciones requieren llama.cpp.
- Contexto en produccion: en modo Ollama el prompt se recorta a 4.096 tokens y los estados mas largos se cortan por el medio (`usage.truncated`); para documentos largos hay que usar `llama-server -c 32768` o el modo gguf.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| basal-2.0-max-GGUF (Q8_0 / Q5_K_M) | 11,17B | 4.096 en Ollama; configurable en llama.cpp | Decision tipada calibrada sobre Bielik-PL-11B-v3.0-Instruct | Apache 2.0 | GGUF en Hugging Face; motor basal-serve en GitHub |
| basal-2.0-max-FP8 | 11,17B | no disponible | Misma capa de decision, pesos FP8 | Apache 2.0 | Hugging Face; agreement 0,9704, 19,9 dec/s en H100 |
| basal-2.0-max-MLX-8bit | 11,17B | no disponible | Misma capa de decision, formato MLX para Apple Silicon | Apache 2.0 | Hugging Face; 622 ms c1 p50 en Mac |
| speakleash/Bielik-PL-11B-v3.0-Instruct | 11B | no disponible | Modelo instruct generico pl/en, sin capa de decision | no disponible en la informacion proporcionada | Hugging Face (modelo base) |

Las tres variantes basal comparten pesos de origen y solo cambian formato y cuantizacion; la comparacion relevante es de precision y velocidad, no de capacidad. Frente a Bielik-PL-11B-v3.0-Instruct, basal anade la salida tipada y la calibracion, pero no se dispone de datos para comparar rendimiento en tareas genericas.

## Limitaciones y advertencias

- El modelo no produce respuestas tipadas con un simple `ollama run`: la salida estructurada requiere basal-serve delante del motor; sin el, solo hay texto libre.
- En modo Ollama el contexto esta limitado a 4.096 tokens y los prompts mas largos se truncan por el centro, lo que puede eliminar informacion critica de la decision.
- Ollama devuelve como maximo 20 log-probabilidades por posicion: las preguntas con mas de 20 opciones exigen llama.cpp.
- LM Studio corta las peticiones a los 30 s, por lo que documentos muy largos deben dividirse.
- Los ficheros max GGUF no se verificaron en Apple Silicon; el autor reporta agotamiento de memoria Metal en un M4 Pro de 24 GB con otro proceso GPU activo.
- No se han medido velocidad ni throughput de los GGUF en esta release; el autor los describe como la via lenta para lotes, orientada a escritorio y portatil.
- La cobertura linguistica se limita a polaco e ingles; no hay soporte documentado de otros idiomas.
- No se documentan sesgos conocidos, tasas de alucinacion ni evaluaciones de seguridad en la informacion disponible; al heredar el modelo base Bielik, los sesgos de este pueden persistir.
- La licencia Apache 2.0 permite uso comercial, pero debe verificarse la licencia y las condiciones del modelo base speakleash/Bielik-PL-11B-v3.0-Instruct, no detalladas en la informacion proporcionada.
- El uso de la variante `-decision` en LM Studio requiere el canal beta y el motor llama.cpp 2.65.1 o superior, no el motor MLX.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Remek/basal-2.0-max-GGUF
- Modelo de referencia bf16: https://huggingface.co/Remek/basal-2.0-max
- Variante FP8: https://huggingface.co/Remek/basal-2.0-max-FP8
- Variante MLX 8-bit: https://huggingface.co/Remek/basal-2.0-max-MLX-8bit
- Coleccion basal-2.0: https://huggingface.co/collections/Remek/basal-20-6acd1712a8e443c86cd576fc
- Motor de inferencia (GitHub): https://github.com/rkinas/basal
- Documentacion del motor, seccion de imagenes y audio (basal-omni): https://github.com/rkinas/basal#images-and-audio-basal-omni-experimental
- Sitio web del proyecto: https://basal.si5.pl/
- Modelo base: https://huggingface.co/speakleash/Bielik-PL-11B-v3.0-Instruct
