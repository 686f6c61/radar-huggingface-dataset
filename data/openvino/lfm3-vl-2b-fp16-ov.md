# OpenVINO/LFM3-VL-2B-fp16-ov

## Resumen

LFM3-VL-2B-fp16-ov es la version del modelo vision-lenguaje LFM3-VL-2B de LiquidAI convertida al formato OpenVINO IR (Intermediate Representation) por el equipo de OpenVINO. El modelo original es un VLM de 2.000 millones de parametros que procesa entradas de imagen y texto para generar respuestas conversacionales, incluyendo soporte de video. Esta conversion no altera los pesos en cuanto a capacidad, sino que los reempaqueta en fp16 para su ejecucion optimizada sobre el runtime de Intel.

La relevancia de esta ficha radica en que permite desplegar un VLM pequeno en hardware Intel (CPU, iGPU y NPU) sin necesidad de GPU dedicada, algo relevante para entornos de borde, portatiles y estaciones de trabajo sin aceleradores NVIDIA. Al estar construido sobre OpenVINO, se integra con Optimum Intel y OpenVINO Model Server (OVMS), que expone una API compatible con el cliente de OpenAI.

No se dispone de informacion publica en la model card sobre el numero exacto de parametros activos, la longitud de contexto, la composicion del dataset de entrenamiento ni resultados de benchmarks. Los datos que se ofrecen a continuacion se limitan a lo verificable en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-lenguaje (detalles internos no disponibles); formato OpenVINO IR |
| Parametros totales | 2B (segun nombre del modelo, no confirmado en la model card) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp16 (unica variante publicada en este repo) |
| Idiomas soportados | no disponible |
| Licencia | lfm1.0 (other) |
| Formato de pesos | OpenVINO IR (fp16); modelo base en safetensors en LiquidAI/LFM3-VL-2B |

## Arquitectura y entrenamiento

El modelo base es LFM3-VL-2B de LiquidAI, un modelo de la familia LFM3 (Liquid Foundation Models) con capacidad vision-lenguaje. La model card de esta conversion no detalla la arquitectura interna del transformer, el esquema de atencion, la composicion del dataset de entrenamiento ni si se aplicaron tecnicas de alineacion como RLHF o DPO. Tampoco se especifica el numero de tokens de entrenamiento ni la resolucion de imagen soportada.

La innovacion tecnica de esta publicacion es la conversion a OpenVINO IR mediante `optimum-cli export openvino` con `--weight-format fp16`, que permite ejecutar el modelo sobre el runtime de OpenVINO 2026.5.0 o superior. El pipeline `image-text-to-text` se mantiene, y la model card documenta inferencia tanto sobre imagenes como sobre video (este ultimo requiere un backend de decodificacion como `torchcodec` o `av`). La integracion con Optimum Intel depende de un PR aun no fusionado (huggingface/optimum-intel#2087), lo que implica instalar desde una rama especifica.

## Capacidades

- Generacion de texto conversacional a partir de entradas de imagen y texto (pipeline `image-text-to-text`).
- Descripcion y comprension de imagenes en formato RGB.
- Procesamiento de video como entrada multimodal (requiere backend de decodificacion externo).
- Modo de razonamiento (thinking) activado por defecto en la plantilla de chat, desactivable mediante `enable_thinking: false`.
- Despliegue via Optimum Intel (`OVModelForVisualCausalLM`) y via OpenVINO Model Server con API compatible con OpenAI.
- Ejecucion sobre CPU, iGPU y NPU de Intel (con las limitaciones de compatibilidad indicadas por el autor).
- Soporte de tool calling, agentes o multi-step reasoning: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Descripcion automatica de imagenes en entornos de borde: el modelo puede generar descripciones de imagenes en un portatil o mini-PC con CPU Intel, sin GPU dedicada, usando el runtime de OpenVINO y el formato fp16.
- Analisis de video en local: con un backend como `torchcodec` o `av`, el modelo permite resumir o describir contenido de video en estaciones de trabajo sin acelerador NVIDIA, util para prototipos de vigilancia o catalogacion de medios.
- Asistencia visual en aplicaciones de accesibilidad: integrado via OVMS con API OpenAI, puede servir peticiones de descripcion de imagenes desde una aplicacion cliente en tiempo real sobre infraestructura Intel existente.
- Prototipado rapido de pipelines VLM: los notebooks de OpenVINO facilitan la experimentacion con el modelo en CPU antes de escalar a produccion, reduciendo la dependencia de CUDA.
- Despliegue en NPU de Intel para inferencia de baja latencia: la model card menciona soporte de NPU con advertencias sobre runtime y drivers, adecuado para escenarios de inferencia local continua.
- Servicio multimodal interno con OVMS: el endpoint compatible con OpenAI permite sustituir un backend en la nube por un servidor local con el modelo, manteniendo la interfaz del cliente y evitando enviar imagenes a terceros.
- Evaluacion comparativa de VLM pequenos: al ser una conversion fp16 de un modelo de 2B, sirve para medir el rendimiento de un VLM compacto en hardware Intel frente a alternativas en GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: el repo ocupa 4,4 GB en fp16, por lo que se necesita al menos ese espacio en memoria para cargar los pesos, mas overhead del runtime y del procesador de vision.
- GPU recomendadas: no se especifican GPU dedicadas; el modelo esta orientado a CPU, iGPU y NPU de Intel mediante OpenVINO.
- Cabe en GPU consumer: no confirmado en la informacion; el foco del artefacto es hardware Intel sin CUDA.
- Opciones de despliegue: Optimum Intel con backend OpenVINO, OpenVINO Model Server (OVMS) con API compatible con OpenAI, y notebooks de OpenVINO.
- Requisitos de software: OpenVINO 2026.5.0 (nightly) o superior, Optimum Intel con el PR #2087, `transformers==5.20.0`, `torchvision` y `pillow`; para video, `torchcodec` o `av`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-VL-2B-fp16-ov (este) | 2B (segun nombre) | no disponible | OpenVINO IR fp16 | lfm1.0 | HuggingFace, 7 descargas |
| LiquidAI/LFM3-VL-2B | 2B (segun nombre) | no disponible | safetensors | lfm1.0 | HuggingFace (modelo base) |
| Otros VLM de ~2B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones completas de alternativas en la informacion proporcionada para establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- La licencia es `lfm1.0` (categoria "other"), no una licencia open source estandar; es necesario revisar el texto en el enlace de licencia del modelo base antes de uso comercial.
- La integracion con Optimum Intel depende de un PR no fusionado (#2087), lo que implica instalar desde una rama de desarrollo y asumir riesgo de inestabilidad.
- OpenVINO 2026.5.0 solo esta disponible como nightly en el momento de la publicacion, lo que introduce riesgo de cambios de API.
- El soporte en OVMS no esta validado de extremo a extremo segun la propia model card; las imagenes `latest` o `weekly` no garantizan compatibilidad con LFM3-VL.
- El despliegue en NPU tiene advertencias adicionales de runtime y drivers no detalladas.
- El modo de razonamiento esta activado por defecto en la plantilla de chat, lo que puede aumentar la latencia si no se desactiva explicitamente.
- No se dispone de informacion sobre sesgos, riesgo de alucinacion, idiomas soportados ni limites de contexto; deben evaluarse empiricamente antes de produccion.
- El numero de descargas (7) y likes (0) es muy bajo, lo que sugiere poca validacion comunitaria del artefacto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OpenVINO/LFM3-VL-2B-fp16-ov
- Modelo base: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Licencia: https://huggingface.co/LiquidAI/LFM3-VL-2B/blob/main/LICENSE
- Formato OpenVINO IR: https://docs.openvino.ai/2026/documentation/openvino-ir-format.html
- Optimum Intel: https://huggingface.co/docs/optimum/intel/index
- PR de soporte LFM3 en Optimum Intel: https://github.com/huggingface/optimum-intel/pull/2087
- Inferencia con Optimum Intel: https://docs.openvino.ai/2026/openvino-workflow-generative/inference-with-optimum-intel.html
- Notebooks LFM3: https://openvinotoolkit.github.io/openvino_notebooks/?search=LFM3
- Notebooks VLM: https://openvinotoolkit.github.io/openvino_notebooks/?search=VLM
- OpenVINO Model Server: https://github.com/openvinotoolkit/model_server
- Documentacion OVMS baremetal: https://docs.openvino.ai/ovms_baremetal
