# OpenVINO/LFM3-VL-2B-int4-ov

## Resumen

LFM3-VL-2B-int4-ov es la version cuantizada a INT4 y convertida al formato OpenVINO IR del modelo multimodal LiquidAI/LFM3-VL-2B, desarrollado originalmente por LiquidAI. Este artefacto lo publica el equipo de OpenVINO y su proposito es permitir la inferencia eficiente de un modelo vision-lenguaje de 2.000 millones de parametros sobre hardware Intel (CPU, iGPU y NPU) sin necesidad de GPU dedicada, reduciendo el peso del repositorio a aproximadamente 1,5 GB.

El modelo resuelve el problema de desplegar tareas de image-text-to-text (descripcion de imagenes, respuesta visual a preguntas, analisis de video) en entornos con recursos limitados, como portatiles, mini-PC o dispositivos edge. Al estar comprimido con NNCF en modo INT4_ASYM con group_size 64, mantiene la estructura del transformer original pero con pesos de 4 bits, lo que lo hace adecuado para prototipado local y despliegue en produccion ligera mediante OpenVINO Model Server.

Es relevante ahora porque la familia LFM3 de LiquidAI apuesta por arquitecturas eficientes y porque OpenVINO esta ampliando su soporte de modelos multimodales en su runtime, incluyendo aceleracion por NPU. La contrapartida es que depende de versiones muy recientes del stack (OpenVINO 2026.5.0 en nightly y un PR aun no fusionado de optimum-intel), por lo que su adopcion en produccion exige verificar compatibilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-lenguaje), arquitectura LFM3 de LiquidAI; pesos en OpenVINO IR |
| Parametros totales | 2.000 millones (modelo base LFM3-VL-2B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 asimetrico (INT4_ASYM), ratio 1.0, group_size 64 para el modelo de lenguaje; submodelos restantes con los valores por defecto de Optimum Intel |
| Idiomas soportados | no disponible |
| Licencia | lfm1.0 (licencia propia de LiquidAI, enlazada en la model card) |
| Formato de pesos | OpenVINO IR (no safetensors ni GGUF) |

## Arquitectura y entrenamiento

El artefacto es una conversion del modelo LiquidAI/LFM3-VL-2B, un modelo multimodal de tipo image-text-to-text construido sobre la arquitectura LFM3 de LiquidAI. La model card de esta version no detalla la composicion interna del transformer, el encoder visual ni el volumen de datos de entrenamiento; esa informacion corresponde al modelo original. Lo que si se documenta es el proceso de compresion: los pesos del modelo de lenguaje se cuantizan con `nncf.compress_weights` en modo INT4_ASYM con ratio 1.0 y group_size 64, mientras que los submodelos restantes (vision y proyector) se comprimen con los valores por defecto de Optimum Intel, configurables en `openvino_config.json`.

La innovacion tecnica principal de esta ficha no esta en el entrenamiento sino en el despliegue: la conversion a OpenVINO IR permite ejecutar el modelo con el runtime de Intel, incluyendo CPU, iGPU y NPU, y servirlo mediante OpenVINO Model Server con una API compatible con OpenAI. No se dispone de informacion sobre el uso de RLHF, DPO, decodificacion especulativa ni tecnicas de atencion lineal en esta version cuantizada.

## Capacidades

- Generacion de texto a partir de imagenes: descripcion de contenido visual, respuesta a preguntas sobre una imagen y tareas de image-text-to-text en general.
- Procesamiento de video: la model card incluye un ejemplo de inferencia sobre un fichero de video, con requisito de un backend de decodificacion soportado por Transformers (torchcodec o av).
- Conversacion multi-turno: el pipeline esta etiquetado como conversational, por lo que admite dialogos con historial.
- Integracion con servidor compatible con OpenAI: despliegue via OpenVINO Model Server y consumo con el cliente `openai`, incluyendo envio de imagenes en base64.
- Ejecucion en hardware Intel sin GPU dedicada: CPU, iGPU y NPU mediante el runtime de OpenVINO.
- Capacidades de tool calling, agentes, razonamiento multi-paso, matematicas o modo thinking: no disponibles en la informacion proporcionada.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Descripcion automatica de imagenes en local: el modelo puede generar descripciones de imagenes JPEG directamente en un portatil con CPU Intel, usando el ejemplo de inferencia de la model card, sin enviar datos a la nube.
- Asistencia visual para accesibilidad: integrado en una aplicacion de escritorio, puede narrar el contenido de imagenes y videos a usuarios con discapacidad visual, aprovechando su tamano reducido de 1,5 GB y su ejecucion en CPU o NPU.
- Analisis de video en edge: el soporte de entrada de video permite resumir o describir clips en dispositivos con recursos limitados, como mini-PC o camaras inteligentes con Intel NUC.
- Prototipado rapido de productos VLM: gracias a la API compatible con OpenAI de OpenVINO Model Server, un equipo puede levantar un endpoint local y validar flujos de image-text-to-text antes de invertir en infraestructura GPU.
- Moderacion de contenido visual en preproduccion: clasificacion y descripcion de imagenes subidas por usuarios en un pipeline interno, ejecutando el modelo en CPU y sin coste de API externa.
- Extraccion de informacion de capturas y documentos escaneados: respuesta a preguntas sobre imagenes de formularios o pantallas, util en herramientas internas de soporte y back-office.
- Demos y notebooks educativos: el modelo encaja en los notebooks de OpenVINO para VLM, sirviendo como ejemplo practico de cuantizacion INT4 y despliegue en hardware Intel.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 2.000 millones de parametros en INT4, el peso de los pesos ronda los 1,5 GB del repositorio; la memoria adicional depende de la longitud de contexto y del tamaño de las imagenes o videos de entrada. No se proporcionan cifras oficiales de VRAM.
- GPU recomendadas: no se especifican GPU dedicadas; el artefacto esta orientado a CPU, iGPU y NPU de Intel mediante OpenVINO.
- Compatibilidad con GPU de consumo: no se documenta soporte para RTX 4090 u otras GPU NVIDIA en esta version; el stack indicado es OpenVINO.
- Opciones de despliegue: Optimum Intel con backend OpenVINO (`OVModelForVisualCausalLM`), OpenVINO Model Server (paquete binario de Windows o contenedor Docker) con API compatible con OpenAI, y notebooks de OpenVINO.
- Versiones requeridas: OpenVINO 2026.5.0 o superior (nightly), optimum-intel con el PR huggingface/optimum-intel#2087, transformers 5.20.0, torchvision y pillow; para video, torchcodec o av.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Despliegue |
|---|---|---|---|---|---|
| OpenVINO/LFM3-VL-2B-int4-ov | 2.000 M | no disponible | OpenVINO IR INT4 | lfm1.0 | OpenVINO, Optimum Intel, OVMS |
| LiquidAI/LFM3-VL-2B | 2.000 M | no disponible | safetensors (formato original) | lfm1.0 | Transformers, GPU convencional |
| Otros VLM de ~2B en INT4 | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita al modelo original del que deriva, ya que la informacion proporcionada no incluye datos de rendimiento ni de otros modelos multimodales comparables de tamano similar.

## Limitaciones y advertencias

- Dependencia de versiones no estables: requiere OpenVINO 2026.5.0 en nightly y un PR de optimum-intel aun no fusionado; la API y el comportamiento pueden cambiar.
- Soporte de OVMS no confirmado de extremo a extremo: la propia model card advierte que los comandos de despliegue son ejemplos y que una imagen `latest` o `weekly` no basta si no incluye soporte para LFM3-VL.
- Cuantizacion INT4: la compresion agresiva de pesos puede degradar la calidad frente al modelo original en tareas visuales finas; no se publican metricas de la perdida de precision.
- Idiomas no declarados: no hay informacion sobre cobertura linguistica, por lo que el rendimiento en castellano no esta garantizado.
- Contexto no declarado: se desconoce la ventana maxima, lo que dificulta planificar conversaciones o videos largos.
- Licencia lfm1.0: es una licencia propia de LiquidAI, no una licencia open source estandar; debe revisarse el texto completo antes de uso comercial.
- Riesgo de alucinacion: como todo VLM, puede describir elementos inexistentes en la imagen o el video; no se documentan evaluaciones de fidelidad visual.
- Sesgos: no se dispone de informacion sobre sesgos conocidos del modelo base ni de esta version cuantizada.
- Hardware limitado a Intel: no es un artefacto portable a otros runtimes sin reconversion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OpenVINO/LFM3-VL-2B-int4-ov
- Modelo original: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Licencia: https://huggingface.co/LiquidAI/LFM3-VL-2B/blob/main/LICENSE
- Documentacion del formato OpenVINO IR: https://docs.openvino.ai/2026/documentation/openvino-ir-format.html
- Guia de compresion de pesos de OpenVINO: https://docs.openvino.ai/2026/openvino-workflow/model-optimization-guide/weight-compression.html
- NNCF: https://github.com/openvinotoolkit/nncf
- PR de soporte LFM3 en optimum-intel: https://github.com/huggingface/optimum-intel/pull/2087
- Optimum Intel: https://huggingface.co/docs/optimum/intel/index
- Inferencia con Optimum Intel: https://docs.openvino.ai/2026/openvino-workflow-generative/inference-with-optimum-intel.html
- OpenVINO Model Server: https://github.com/openvinotoolkit/model_server
- Paquete binario de OVMS: https://docs.openvino.ai/ovms_baremetal
- Notebooks de OpenVINO para LFM3: https://openvinotoolkit.github.io/openvino_notebooks/?search=LFM3
- Notebooks de OpenVINO para VLM: https://openvinotoolkit.github.io/openvino_notebooks/?search=VLM
