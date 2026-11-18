# Jundot/DeepSeek-V4.1-Flash-1017-oQ2.5h-mtp

## Resumen

DeepSeek-V4.1-Flash-1017-oQ2.5h-mtp es una cuantizacion de precision mixta en formato MLX del modelo DeepSeek-V4.1-Flash-1017, publicado por el usuario Jundot. El modelo base es un actualizacion menor de DeepSeek-V4.1-Flash con mejoras en razonamiento, generacion de codigo, tareas agenticas y tareas visuales. Se trata de un modelo de lenguaje y vision con arquitectura de mezcla de expertos (MoE) que combina 552.000 millones de parametros en el backbone del lenguaje, 197.000 millones en tablas Engram de n-gramas y un modulo MTP (multi-token prediction) de 14.000 millones.

La relevancia de esta publicacion radica en la tecnica de cuantizacion: el formato oQh aplica una transformada de Hadamard a los pesos de los expertos antes de cuantizarlos, lo que permite reducir el numero de escalas necesarias y dedicar el espacio ahorrado a mas bits en las zonas mas sensibles. El resultado es un checkpoint de 318,9 GiB que mantiene una media efectiva de 3,049 bits por peso en el backbone del lenguaje y 3,590 bits por peso en el conjunto completo, con una divergencia KL aproximadamente un tercio menor que el formato oQe equivalente.

El checkpoint incluye el modelo de lenguaje, las tablas Engram, el codificador visual y la cabeza MTP. Requiere oMLX 0.8.0 o superior con soporte para oQh, por lo que no es compatible con versiones anteriores ni con otros motores MLX estandar. La licencia es MIT, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) con vision-lenguaje, tablas Engram de n-gramas y cabeza MTP |
| Parametros totales | 93.948.268.338 (segun safetensors del repo); 763.205B pesos logicos en el checkpoint completo |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQh 2-bit, 3-bit y 4-bit con escala por fila; affine 4-bit grupo 32 (Engram); affine 8-bit grupo 64; MXFP4 y MXFP8 grupo 32; BF16; FP32 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX), formato oQh |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con capacidad de vision y lenguaje. La arquitectura incorpora tres componentes diferenciados: un backbone de lenguaje de 551.566B pesos logicos, un conjunto de tablas Engram de 196.929B pesos logicos que modelan n-gramas, y un codificador visual de 0.485B pesos. Adicionalmente incluye una cabeza de prediccion multi-token (MTP) de 14.225B pesos que permite decodificacion especulativa. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

La innovacion tecnica principal de esta publicacion es el formato de cuantizacion oQh. Antes de cuantizar los pesos de los expertos enrutados, se aplica una transformada de Hadamard que los rota; los pesos rotados requieren menos escalas por grupo, y el espacio ahorrado se reinvierte en codigos mas anchos para los tensores mas sensibles. Las proyecciones de atencion y los expertos compartidos se mantienen en grupos affine de 8 bits, mientras que el embedding de tokens, la cabeza de salida, el router y la proyeccion de salida de atencion `wo_a` permanecen en BF16. Las tablas Engram se almacenan en affine 4-bit con grupos de 32, la cabeza MTP conserva los formatos originales FP4 y FP8, y el codificador visual se mantiene en BF16. El resultado es un checkpoint del mismo tamano que el formato oQe equivalente pero con menor divergencia KL: 0,28 frente a 0,43 en FLORES+, 0,084 frente a 0,14 en Aya y 0,068 frente a 0,11 en codigo Python, para el nivel oQ2.5.

## Capacidades

- Generacion de texto y razonamiento: el modelo base incorpora mejoras especificas en tareas de razonamiento segun la model card.
- Generacion de codigo: el checkpoint incluye evaluacion de divergencia KL sobre codigo Python, lo que indica soporte para generacion de codigo.
- Capacidades visuales: el pipeline es image-text-to-text e incluye un codificador visual de 0.485B pesos en BF16, por lo que acepta imagenes como entrada.
- Tareas agenticas: la model card del base menciona mejoras en tareas agenticas, aunque no se detallan mecanismos concretos de tool calling o function calling.
- Prediccion multi-token: incorpora una cabeza MTP de 14.225B pesos que habilita decodificacion especulativa.
- Capacidades multilingues: no se especifican los idiomas soportados; la evaluacion de cuantizacion usa FLORES+ y Aya con prompts en 7 idiomas, lo que sugiere cobertura multilingue sin detallar cuales.
- Modelado de n-gramas: las tablas Engram de 196.929B pesos logicos anaden un mecanismo de memoria estadistica de secuencias.

## Casos de uso

- Razonamiento y analisis documental en local: el checkpoint permite ejecutar un modelo MoE de gran escala en hardware Apple Silicon mediante MLX, con un peso de 318,9 GiB que puede distribuirse en memoria unificada de equipos de gama alta.
- Generacion de codigo en entornos con requisitos de privacidad: al ser un checkpoint local con licencia MIT, puede desplegarse en estaciones de trabajo sin enviar codigo a servicios externos, usando la cabeza MTP para acelerar la decodificacion.
- Procesamiento de imagenes y texto combinados: el pipeline image-text-to-text y el codificador visual en BF16 permiten tareas de descripcion de imagenes, extraccion de informacion de documentos escaneados o respuesta a preguntas sobre capturas.
- Investigacion sobre cuantizacion de modelos MoE: el checkpoint sirve como referencia para estudiar el impacto de la rotacion de Hadamard en la calidad de modelos de mezcla de expertos a bajos bits, con metricas KL publicadas frente al formato oQe.
- Evaluacion de decodificacion especulativa: la inclusion de la cabeza MTP permite medir el rendimiento de tecnicas de prediccion multi-token en un modelo de 552B parametros de lenguaje.
- Prototipado de asistentes multilingues: los prompts de evaluacion en 7 idiomas de FLORES+ y Aya indican capacidad de traduccion y generacion multilingue, adecuada para pruebas de concepto en localizacion.
- Despliegue en clústeres de Apple Silicon: al requerir oMLX 0.8.0 o superior, el checkpoint esta pensado para entornos con varias maquinas Apple de memoria unificada, no para GPUs NVIDIA convencionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card unicamente proporciona metricas de divergencia KL de la cuantizacion respecto al checkpoint original:

| Nivel | Tamano | FLORES+ KL (oQe -> oQh) | Aya KL (oQe -> oQh) | Codigo KL (oQe -> oQh) |
|---|---|---|---|---|
| oQ2 | 284,0 GiB | 0,59 -> 0,40 (-32%) | 0,20 -> 0,14 (-31%) | 0,16 -> 0,11 (-32%) |
| oQ2.5 | 311,4 GiB | 0,43 -> 0,28 (-34%) | 0,14 -> 0,084 (-38%) | 0,11 -> 0,068 (-38%) |
| oQ3 | 347,3 GiB | 0,26 -> 0,23 (-9%) | 0,060 -> 0,051 (-15%) | 0,056 -> 0,047 (-16%) |

## Requisitos de hardware

- VRAM o memoria unificada estimada: el checkpoint ocupa 318,9 GiB (342,4 GB) en disco y debe cargarse completo en memoria para la inferencia; se requiere un equipo con al menos esa cantidad de memoria unificada disponible.
- GPU recomendadas: el formato oQh solo es compatible con oMLX 0.8.0 o superior, orientado a Apple Silicon; no se indica soporte para GPUs NVIDIA (A100, H100) ni RTX 4090.
- Cabe en consumer GPU: no, el tamano de 318,9 GiB excede la memoria de cualquier GPU de consumo actual; requiere configuraciones de memoria unificada de gama alta en Apple Silicon.
- Opciones de despliegue: exclusivamente oMLX 0.8.0 o superior con soporte oQh; las versiones anteriores de oMLX no pueden cargar el checkpoint y no se mencionan otros motores compatibles.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017-oQ2.5h-mtp | 763,2B pesos logicos (552B en lenguaje) | no disponible | oQh 2,5 bits medio (3,590 bits/peso efectivos) | MIT | MLX, solo oMLX 0.8.0+ |
| DeepSeek-V4.1-Flash-1017 (base) | 552B en lenguaje + 197B Engram + 14B MTP | no disponible | FP4/FP8 originales | MIT | no disponible |
| Variante oQe equivalente del mismo modelo | 763,2B pesos logicos | no disponible | oQe 2,5 bits, mismo tamano | MIT | MLX estandar |

No se dispone de informacion sobre otros modelos comparables de la misma categoria en la documentacion proporcionada.

## Limitaciones y advertencias

- Compatibilidad restringida: el checkpoint solo carga en oMLX 0.8.0 o superior con soporte oQh; versiones anteriores fallan al cargar y no se documenta compatibilidad con llama.cpp, vLLM, TGI u Ollama.
- Requisito de memoria elevado: 318,9 GiB de almacenamiento y carga completa en memoria unificada, lo que limita su uso a equipos Apple Silicon de gama muy alta o configuraciones multi-maquina.
- Perdida de calidad por cuantizacion: aunque la divergencia KL es menor que en oQe, sigue existiendo una diferencia respecto al checkpoint original en FP4/FP8, con valores KL de 0,28 en FLORES+, 0,084 en Aya y 0,068 en codigo para el nivel oQ2.5.
- Idiomas no documentados: la model card no especifica la lista de idiomas soportados; solo se sabe que la evaluacion usa prompts en 7 idiomas sin detallar cuales.
- Contexto no documentado: no se indica la longitud maxima de contexto del modelo base ni del checkpoint cuantizado.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad factual ni de tasas de alucinacion en la informacion disponible.
- Sesgos: no se documentan sesgos conocidos del modelo base ni del proceso de cuantizacion.
- Licencia MIT: permite uso comercial sin restricciones adicionales, pero el autor no ofrece garantias sobre el comportamiento del modelo cuantizado en produccion.
- Checkpoint de comunidad: publicado por un usuario individual (Jundot) a partir del modelo base de DeepSeek, sin validacion oficial por parte del equipo de DeepSeek.

## Enlaces

- Hugging Face: https://huggingface.co/Jundot/DeepSeek-V4.1-Flash-1017-oQ2.5h-mtp
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Repositorio oMLX: https://github.com/jundot/omlx
- Pull request del formato oQh: https://github.com/jundot/omlx/pull/5317
