# OpenFlowLM/Qwen2.5-VL-3B-Instruct-NPU2

## Resumen

OpenFlowLM/Qwen2.5-VL-3B-Instruct-NPU2 es una publicacion derivada del modelo multimodal Qwen2.5-VL-3B-Instruct, distribuida por el usuario OpenFlowLM en HuggingFace. Se trata de un modelo de 3.000 millones de parametros con pipeline image-text-to-text, es decir, acepta imagenes y texto como entrada y genera texto como salida. El repositorio ocupa 4,0 GB y esta etiquetado como compatible con endpoints, con la libreria transformers como runtime de referencia.

El modelo base, desarrollado por el equipo Qwen de Alibaba, forma parte de la familia Qwen2.5-VL (variantes de 3B, 7B y 72B) y esta disenado para tareas de comprension visual: reconocimiento de objetos, lectura de texto en imagenes, analisis de graficos y layouts, comprension de video de mas de una hora y localizacion visual mediante bounding boxes o puntos con salida JSON estable. Su caracteristica mas destacada es el comportamiento agentico: puede operar como agente visual que razona y dirige herramientas, incluyendo control de escritorio y de telefono.

La relevancia de esta ficha concreta es limitada pero util: se trata de una publicacion sin descargas ni likes en el momento de su registro, sin model card propia mas alla de la heredada del modelo base. El sufijo "NPU2" del identificador sugiere una conversion o adaptacion orientada a aceleradores NPU, pero no hay documentacion que lo confirme en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal: encoder de vision ViT con window attention, SwiGLU y RMSNorm, acoplado a un LLM Qwen2.5 con mRoPE (incluye dimension temporal) |
| Parametros totales | ~3.000 millones (3B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio ocupa 4,0 GB, por debajo de los ~6 GB esperables en bf16 para 3B, lo que sugiere una conversion o compresion no documentada |
| Idiomas soportados | en (ingles), segun la model card y los tags del repositorio |
| Licencia | qwen-research |
| Formato de pesos | no disponible; publicacion orientada a la libreria transformers |
| Modelo base | Qwen/Qwen2.5-VL-3B-Instruct |
| Fecha de publicacion | 2026-10-02 (creado y actualizado el mismo dia) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura del modelo base combina un encoder de vision tipo ViT con el LLM Qwen2.5. En Qwen2.5-VL el ViT se ha optimizado con window attention para acelerar entrenamiento e inferencia, y se ha alineado estructuralmente con el LLM mediante SwiGLU y RMSNorm. La parte textual emplea mRoPE (rotary position embedding multimodal); en esta version se anade a la dimension temporal un identificador y una alineacion con tiempo absoluto, lo que permite al modelo aprender secuencias temporales y velocidad, y con ello localizar momentos concretos dentro de un video. El entrenamiento de video usa resolucion dinamica y muestreo dinamico de FPS, de modo que el modelo admite distintas tasas de muestreo.

No se dispone de informacion sobre el proceso de entrenamiento especifico de esta publicacion derivada: se desconoce si hubo fine-tuning adicional, cuantizacion, destilacion o conversion a un formato de pesos concreto, asi como el numero de tokens, la composicion del dataset o si se aplicaron tecnicas de alineacion como RLHF o DPO. La model card incluida es la del modelo base Qwen2.5-VL-3B-Instruct y no documenta ninguna innovacion propia de OpenFlowLM.

## Capacidades

- Comprension de imagenes con reconocimiento de objetos comunes (flores, aves, peces, insectos) y analisis de texto, graficos, iconos, diagramas y layouts.
- Extraccion de texto en imagenes: la variante 3B obtiene 93,9 en DocVQA y 77,1 en InfoVQA, y 79,3 en TextVQA.
- Razonamiento visual matematico: 62,3 en MathVista y 21,2 en MathVision.
- Localizacion visual en distintos formatos: generacion de bounding boxes o puntos, con salida JSON estable para coordenadas y atributos.
- Salida estructurada de documentos: facturas escaneadas, formularios y tablas, orientada a entornos financieros y comerciales.
- Comprension de video de mas de una hora, con capacidad de senalar el segmento relevante de un evento (CharadesSTA/mIoU de 38,8).
- Comportamiento agentico: razonamiento con uso dinamico de herramientas, control de ordenador y control de telefono (ScreenSpot 55,5; AndroidWorld_SR 90,8; MobileMiniWob++_SR 67,9).
- Capacidades conversacionales multi-turno (tag conversational).
- Compatibilidad declarada con endpoints de inferencia (tag endpoints_compatible).
- Soporte de la libreria transformers mediante la clase qwen2_5_vl, con utilidades de carga de imagenes y video (qwen-vl-utils).

## Casos de uso

- Digitalizacion de facturas y formularios: el modelo genera salida estructurada (JSON con coordenadas y atributos) a partir de escaneos, lo que permite integrarlo en un pipeline de extraccion documental sin post-procesado manual de posiciones.
- Analisis de graficos financieros: su puntuacion de 77,1 en InfoVQA y 81,5 en AI2D indica capacidad para interpretar diagramas y charts, util en herramientas de reporting que reciben capturas de dashboards.
- Agente de automatizacion de escritorio: con 55,5 en ScreenSpot puede identificar elementos de interfaz a partir de capturas y emitir acciones, base para flujos RPA asistidos por modelo.
- Automatizacion en Android: 90,8 en AndroidWorld_SR y 63,7 en Android Control High_EM permiten construir agentes que navegan aplicaciones moviles siguiendo instrucciones en lenguaje natural.
- Indexado y resumen de video largo: con comprension de videos de mas de una hora y CharadesSTA/mIoU de 38,8, es adecuado para localizar eventos concretos en grabaciones extensas (vigilancia, sesiones grabadas, contenido docente).
- Accesibilidad y descripcion de imagenes: generacion de descripciones y localizacion de elementos para lectores de pantalla o catalogos de producto, aprovechando la salida en bounding boxes.
- Asistencia educativa con material visual: resolucion de problemas de matematicas a partir de fotografias (MathVista 62,3), util en tutores automaticos que reciben capturas de ejercicios.
- Prototipado y despliegue en hardware limitado: al ser un 3B, se puede servir en una unica GPU de gama media o en un NPU, lo que abarata el coste por consulta frente a variantes de 7B o 72B.

## Benchmarks y rendimiento

Resultados publicados en la model card para el modelo base Qwen2.5-VL-3B-Instruct, comparados con InternVL2.5-4B y Qwen2-VL-7B. No hay benchmarks publicados especificamente para la publicacion derivada de OpenFlowLM.

### Benchmarks de imagen

| Benchmark | InternVL2.5-4B | Qwen2-VL-7B | Qwen2.5-VL-3B |
|---|---|---|---|
| MMMU (val) | 52,3 | 54,1 | 53,1 |
| MMMU-Pro (val) | 32,7 | 30,5 | 31,6 |
| AI2D (test) | 81,4 | 83,0 | 81,5 |
| DocVQA (test) | 91,6 | 94,5 | 93,9 |
| InfoVQA (test) | 72,1 | 76,5 | 77,1 |
| TextVQA (val) | 76,8 | 84,3 | 79,3 |
| MMBench-V1.1 (test) | 79,3 | 80,7 | 77,6 |
| MMStar | 58,3 | 60,7 | 55,9 |
| MathVista (testmini) | 60,5 | 58,2 | 62,3 |
| MathVision (full) | 20,9 | 16,3 | 21,2 |

### Benchmarks de video

| Benchmark | InternVL2.5-4B | Qwen2-VL-7B | Qwen2.5-VL-3B |
|---|---|---|---|
| MVBench | 71,6 | 67,0 | 67,0 |
| VideoMME | 63,6 / 62,3 | 69,0 / 63,3 | 67,6 / 61,5 |
| MLVU | 48,3 | - | 68,2 |
| LVBench | - | - | 43,3 |
| MMBench-Video | 1,73 | 1,44 | 1,63 |
| EgoSchema | - | - | 64,8 |
| PerceptionTest | - | - | 66,9 |
| TempCompass | - | - | 64,4 |
| LongVideoBench | 55,2 | 55,6 | 54,2 |
| CharadesSTA/mIoU | - | - | 38,8 |

### Benchmarks de agente

| Benchmark | Qwen2.5-VL-3B |
|---|---|
| ScreenSpot | 55,5 |
| ScreenSpot Pro | 23,9 |
| AITZ_EM | 76,9 |
| Android Control High_EM | 63,7 |
| Android Control Low_EM | 22,2 |
| AndroidWorld_SR | 90,8 |
| MobileMiniWob++_SR | 67,9 |

## Requisitos de hardware

Las cifras siguientes son estimaciones a partir del numero de parametros (3B); no proceden de mediciones publicadas para esta publicacion.

- VRAM estimada en bf16: alrededor de 6-7 GB solo para pesos, mas overhead de activaciones del encoder de vision y cache KV, en torno a 8-10 GB en funcion de la resolucion de imagen y la longitud de contexto.
- VRAM estimada en int8: aproximadamente 3,5-4 GB de pesos.
- VRAM estimada en int4: aproximadamente 2-2,5 GB de pesos. El repositorio de 4,0 GB apunta a un formato ya comprimido, aunque no especificado.
- GPU consumer: cabe en tarjetas con 8-12 GB, como RTX 3060 12 GB, RTX 4070 o RTX 4090. En GPUs de 8 GB puede requerir cuantizacion, sobre todo con entradas de video.
- GPU de datacenter: A100, H100, L40S o similares para servir en paralelo con margen de contexto y procesamiento de video.
- Opciones de despliegue: transformers (con `pip install git+https://github.com/huggingface/transformers accelerate`, necesario para evitar el error `KeyError: 'qwen2_5_vl'`), vLLM, TGI y, si existiese una conversion GGUF, llama.cpp u Ollama, algo no confirmado en la informacion disponible. Para carga de imagenes y video conviene `qwen-vl-utils[decord]==0.0.8` o `qwen-vl-utils` con fallback a torchvision.
- Aceleradores NPU: el identificador del repositorio sugiere soporte orientado a NPU, pero no hay documentacion disponible al respecto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-VL-3B-Instruct (base de esta publicacion) | 3B | no disponible | DocVQA 93,9; MathVista 62,3; ScreenSpot 55,5 | qwen-research | HuggingFace, mas de un repositorio derivado |
| OpenFlowLM/Qwen2.5-VL-3B-Instruct-NPU2 | 3B | no disponible | sin benchmarks propios | qwen-research | HuggingFace, 0 descargas |
| InternVL2.5-4B | 4B | no disponible | DocVQA 91,6; MathVista 60,5; MVBench 71,6 | no disponible en la informacion | HuggingFace |
| Qwen2-VL-7B | 7B | no disponible | DocVQA 94,5; TextVQA 84,3; MVBench 67,0 | no disponible en la informacion | HuggingFace |

El dato mas relevante de la comparativa es que la variante de 3B supera a Qwen2-VL-7B en MathVista (62,3 frente a 58,2), MathVision (21,2 frente a 16,3), InfoVQA (77,1 frente a 76,5) y MLVU (68,2 frente a dato no disponible), con menos de la mitad de parametros. En comprension de texto en imagen (TextVQA) y en MMMU, la variante de 7B sigue por delante.

## Limitaciones y advertencias

- Licencia qwen-research: no es una licencia permisiva tipo Apache 2.0. Antes de un uso comercial hay que revisar los terminos enlazados en la model card del modelo base; la licencia de investigacion suele imponer restricciones al uso comercial.
- Idioma declarado: unicamente ingles. El modelo base tiene comportamiento multilingue, pero esta publicacion no lo declara y no hay evaluacion al respecto.
- Este repositorio no incluye model card propia ni documentacion de la conversion. No se puede saber que se modifico respecto al modelo base, que precision tienen los pesos ni con que datos se ajustaron.
- Los benchmarks mostrados corresponden al modelo base, no a esta publicacion. El rendimiento real de esta version es desconocido.
- Riesgo de alucinacion en tareas de OCR y extraccion de coordenadas: la salida en JSON con bounding boxes puede ser formalmente valida pero incorrecta, por lo que conviene validar aguas abajo en flujos de facturas o formularios.
- Resolucion de imagen y longitud de video afectan directamente al consumo de VRAM y a la latencia; entradas de video largo pueden agotar memoria en GPUs consumer.
- El modelo tiene 3B de parametros: en tareas de razonamiento complejo y en localizacion precisa (ScreenSpot Pro 23,9; Android Control Low_EM 22,2) queda claramente por debajo de modelos mayores.
- No hay informacion sobre sesgos, evaluacion de seguridad, tasas de error por idioma ni comportamiento fuera de distribucion.
- Estado del repositorio: cero descargas y cero likes en el momento del registro, sin senales de mantenimiento ni de comunidad. Para produccion es mas prudente partir del modelo base oficial.
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo ni sobre su autor; los resultados obtenidos eran contenido no relacionado y no se han utilizado como fuente.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/OpenFlowLM/Qwen2.5-VL-3B-Instruct-NPU2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct/blob/main/LICENSE
- Blog de Qwen2.5-VL: https://qwenlm.github.io/blog/qwen2.5-vl/
- Repositorio GitHub de Qwen2.5-VL: https://github.com/QwenLM/Qwen2.5-VL
- Demo de chat: https://chat.qwenlm.ai/
- Papers referenciados en los tags del repositorio: arXiv:2309.00071, arXiv:2409.12191, arXiv:2308.12966
- Guia de instalacion de decord desde codigo fuente: https://github.com/dmlc/decord?tab=readme-ov-file#install-from-source
- Busqueda web sobre el modelo y su autor: sin resultados relevantes disponibles.
