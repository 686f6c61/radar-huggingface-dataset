# GroundingPI/GroundingPI

## Resumen

GroundingPI es un modelo fundacional de grounding visual de 4.843.664.384 parametros (aproximadamente 4,84 B) desarrollado por el equipo GroundingPI, orientado a la percepcion precisa para inteligencia fisica. A diferencia de los modelos de vision-lenguaje-accion (VLA) y de los world-action models (WAM), que reutilizan backbones de proposito general, GroundingPI se ha preentrenado especificamente para localizar objetos: genera puntos y cajas codificados como coordenadas cuantizadas dentro de un vocabulario compartido, lo que le permite apuntar con precision incluso en escenas densas y con objetos muy pequenos.

El modelo es un checkpoint autorregresivo de vision-lenguaje publicado en HuggingFace con pipeline image-text-to-text y licencia apache-2.0-with-upstream-kimi-k3 (etiquetada como "other", con la Kimi K3 License aplicandose al material derivado de Kimi). Soporta ingles y chino, y cubre tareas como deteccion de objetos de vocabulario abierto, comprension de expresiones referenciales, pointing, OCR con localizacion de texto y comprension de estructura de documentos.

Su relevancia actual radica en el enfoque: el paper defiende el grounding como fundamento perceptivo y el preentrenamiento perceptivo dedicado como via prometedora para modelos fundacionales de inteligencia fisica. Segun la model card, GroundingPI alcanza un promedio de 73,68% frente a 44 baselines en 34 benchmarks de grounding que cubren 11 capacidades perceptivas, por encima del GPT-6 Astra (71,54%), y como backbone visual mejora resultados en manipulacion robotica y conduccion autonoma. El repositorio libera unicamente el checkpoint de grounding; los resultados de las politicas de accion se describen en el paper.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autorregresivo de vision-lenguaje (modelo fundacional de grounding); detalles internos de capas y atencion no disponibles |
| Parametros totales | 4.843.664.384 (aproximadamente 4,84 B), segun los pesos en safetensors |
| Parametros activos | no aplica (no se describe una arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio publica los pesos en safetensors y no se documentan variantes cuantizadas |
| Idiomas soportados | ingles (en) y chino (zh) |
| Licencia | apache-2.0-with-upstream-kimi-k3 (campo `license: other` en HuggingFace) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 9,8 GB |
| Libreria | transformers (requiere `trust_remote_code`, etiqueta custom_code) |
| Pipeline | image-text-to-text |
| Fecha de publicacion | 30 de septiembre de 2026 (paper); actualizacion del repositorio el 14 de octubre de 2026 |
| Descargas / likes en HuggingFace | 305 descargas / 20 likes |

## Arquitectura y entrenamiento

GroundingPI se presenta como un modelo fundacional de grounding de 4B basado en un checkpoint autorregresivo de vision-lenguaje. La innovacion central descrita es la representacion de la salida: el modelo genera puntos y cajas como coordenadas cuantizadas dentro de un vocabulario compartido, en lugar de depender de cabezas de regresion especificas de tarea. Esta formulacion unifica tareas de localizacion heterogeneas (deteccion de vocabulario abierto, referring expression comprehension, pointing, grounding de elementos de GUI, localizacion de texto en OCR, layout de documentos) bajo una misma interfaz de generacion.

El modelo se ha entrenado con un objetivo de preentrenamiento perceptivo dedicado. Segun la model card, el desarrollo se evalua contra 44 baselines en 34 benchmarks de grounding que abarcan 11 capacidades perceptivas, y el checkpoint liberado corresponde al backbone perceptivo; los resultados de las politicas de accion posteriores se describen en el paper y no se incluyen en el repositorio. No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO. El modelo deriva parcialmente de material de Kimi, cuyo licenciamiento se mantiene sobre el paquete combinado.

## Capacidades

- Grounding visual de vocabulario abierto: localizacion de objetos mediante puntos y cajas en escenas densas y con objetos pequenos.
- Deteccion de objetos con salida de coordenadas cuantizadas en un vocabulario compartido.
- Comprension de expresiones referenciales (referring expression comprehension) y grounding guiado por prompts visuales.
- Localizacion basada en puntos (pointing) y razonamiento espacial sobre la imagen.
- Grounding de elementos de interfaz grafica (GUI element grounding).
- OCR con localizacion de texto.
- Comprension de estructura y layout de documentos.
- Capacidades multilingues limitadas a ingles y chino.
- Uso como backbone visual para politicas de manipulacion robotica y para conduccion autonoma (los resultados de politica se reportan en el paper, no en este repositorio).
- No se documentan en la informacion disponible capacidades de tool calling, function calling, modo de razonamiento explicito ni procesamiento de audio.

## Casos de uso

- Manipulacion robotica: el modelo actua como backbone perceptivo en pipelines de vision-lenguaje-accion, proporcionando la localizacion precisa del objeto a manipular; en RoboTwin 2.0 supera a los backbones evaluados en los cuatro escenarios fuera de distribucion, con hasta un 24,8% de mejora relativa frente al mejor backbone.
- Conduccion autonoma: integrado como backbone visual, alcanza un error L2 medio en lazo abierto de 0,296 m en nuScenes, lo que lo hace util para tareas de percepcion en entornos de conduccion.
- Automatizacion de interfaces graficas: el grounding de elementos de GUI permite a agentes identificar botones, campos y controles a partir de descripciones en lenguaje natural, sin depender de selectores fragiles basados en el arbol de accesibilidad.
- Digitalizacion documental: la combinacion de OCR con localizacion de texto y comprension de layout permite extraer campos estructurados de facturas, formularios o articulos preservando la posicion espacial de cada elemento.
- Comercio electronico y catalogos: deteccion de vocabulario abierto para localizar productos o atributos concretos dentro de imagenes de catalogo y generar anotaciones de bounding boxes a escala.
- Anotacion automatica de datasets: generacion de cajas y puntos para preetiquetar datos de entrenamiento de otros modelos de vision, reduciendo el coste de anotacion manual en pipelines de MLOps.
- Analisis de imagenes medicas o industriales asistido: localizacion de estructuras o defectos descritos por texto, siempre que la tarea se formule como grounding sobre una imagen; requiere validacion adicional porque no se documentan evaluaciones en estos dominios.
- Investigacion en inteligencia fisica: uso del checkpoint como base para estudiar el preentrenamiento perceptivo dedicado frente a backbones de proposito general, con la posibilidad de conectar una cabeza de politica propia.

## Benchmarks y rendimiento

Los unicos datos numericos publicados en la informacion disponible son agregados y de tareas downstream; no se desglosan resultados por benchmark individual.

| Metrica | GroundingPI | Referencia comparada |
|---|---|---|
| Promedio en 34 benchmarks de grounding (11 capacidades perceptivas) | 73,68% | GPT-6 Astra: 71,54% |
| Numero de baselines evaluados | 44 | no disponible |
| RoboTwin 2.0 (4 escenarios fuera de distribucion) | mejor que todos los backbones evaluados, hasta +24,8% relativo frente al mejor backbone | no disponible |
| nuScenes (error L2 medio en lazo abierto como backbone visual) | 0,296 m | no disponible |

No se han publicado en la informacion disponible resultados desglosados de MMLU, HumanEval, GSM8K ni de benchmarks de grounding individuales.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 9,7 GB en precision fp16/bf16 (4,84 B de parametros, es decir unos 9,7 GB solo de pesos) y en torno a 5-6 GB en cuantizacion de 8 bits. Son estimaciones calculadas a partir del numero de parametros, no cifras publicadas por el autor.
- GPU recomendadas: no disponibles en la informacion del autor. Por tamano, el modelo encaja sin necesidad de paralelismo en GPUs de 16 GB o superiores (RTX 4090, RTX A5000, L40S, A100 40 GB, H100).
- Cabe en GPU de consumo: si, en tarjetas con 16 GB o mas de VRAM en bf16, y en tarjetas de 8 GB si se aplica cuantizacion, siempre que la implementacion lo permita; el repositorio no publica pesos GGUF ni cuantizados.
- Opciones de despliegue: la libreria declarada es transformers con etiqueta custom_code, por lo que es necesario cargar el modelo con `trust_remote_code=True` y el codigo remoto del repositorio. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI. El autor marca `inference: false` en la model card.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en grounding | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GroundingPI | 4,84 B | no disponible | 73,68% de promedio en 34 benchmarks | apache-2.0-with-upstream-kimi-k3 | pesos en HuggingFace y ModelScope, demo en HF Spaces |
| GPT-6 Astra | no disponible | no disponible | 71,54% en el mismo conjunto de benchmarks segun GroundingPI | no disponible | no disponible |
| Otros backbones de manipulacion evaluados en RoboTwin 2.0 | no disponible | no disponible | inferiores a GroundingPI en los cuatro escenarios fuera de distribucion | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos de parametros, contexto o licencia de otras alternativas de grounding comparables, por lo que la comparativa se limita a la referencia reportada por el propio autor.

## Limitaciones y advertencias

- Modelo de dominio especifico: esta disenado para grounding y percepcion visual; no se documentan capacidades de generacion de texto general, codigo, matematicas ni razonamiento conversacional abierto.
- Idiomas limitados a ingles y chino; no se declara soporte para castellano ni para otras lenguas.
- Longitud de contexto no documentada, lo que impide planificar escenarios multi-imagen o multi-turno largos sin pruebas previas.
- Riesgo de alucinacion de objetos: al generar coordenadas como tokens de un vocabulario compartido, puede producir localizaciones plausibles para objetos que no existen en la imagen; se recomienda umbral de confianza y validacion posterior.
- Sin datos publicados de sesgos por demografia, dominio o geografia; se desconoce el comportamiento en imagenes fuera de la distribucion de entrenamiento.
- Licencia dual: las contribuciones propias son Apache 2.0, pero el material derivado de Kimi queda bajo la Kimi K3 License, cuyas condiciones siguen aplicandose al usar o redistribuir el paquete combinado del modelo. Es imprescindible revisar el fichero LICENSE antes de un uso comercial.
- El autor marca `inference: false` en la model card y el repositorio requiere cargar codigo remoto (`custom_code`), lo que implica una revision de seguridad del codigo antes de desplegarlo en produccion.
- No se publican pesos cuantizados (GGUF, AWQ, GPTQ) ni recetas de despliegue en servidores de inferencia, por lo que el coste de puesta en produccion recae en el integrador.
- Los resultados en manipulacion robotica y conduccion autonoma corresponden a experimentos descritos en el paper usando GroundingPI como backbone; no forman parte del checkpoint liberado, que es solo el modelo de vision-lenguaje.
- Fecha de publicacion muy reciente (septiembre-octubre de 2026) y volumen de adopcion bajo (305 descargas), por lo que el ecosistema de herramientas y casos validados es todavia reducido.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/GroundingPI/GroundingPI
- Demo online en Hugging Face Spaces: https://huggingface.co/spaces/GroundingPI/GroundingPI
- Pagina del proyecto: https://groundingpi.github.io/
- Codigo en GitHub: https://github.com/groundingpi/GroundingPI
- Paper en arXiv: https://arxiv.org/abs/2609.39601
- Pagina del paper en Hugging Face (Daily Paper): https://huggingface.co/papers/2609.39601
- Pesos en ModelScope: https://www.modelscope.ai/models/GroundingPI/GroundingPI
- Reporte en medios (WeChat): https://mp.weixin.qq.com/s/MWR6Rqv_3ieamBd5AJk0qw
- Fichero de licencia: https://huggingface.co/GroundingPI/GroundingPI/blob/main/LICENSE
