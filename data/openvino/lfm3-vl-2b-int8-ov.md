# OpenVINO/LFM3-VL-2B-int8-ov

## Resumen

LFM3-VL-2B-int8-ov es la version cuantizada a INT8 y convertida al formato OpenVINO IR del modelo LFM3-VL-2B desarrollado por LiquidAI. Se trata de un modelo de vision y lenguaje (VLM, image-text-to-text) de 2.000 millones de parametros que acepta imagenes y video como entrada junto con texto, y genera respuestas en lenguaje natural. Esta variante la publica el equipo de OpenVINO y su objetivo es facilitar el despliegue en hardware Intel (CPU, GPU integrada, NPU) sin necesidad de GPU dedicada.

La relevancia de esta ficha reside en que empaqueta un VLM de tamano contenido en un formato optimizado para inferencia en el borde y en equipos de consumo, reduciendo el peso del repositorio a 2,2 GB gracias a la compresion de pesos INT8 asimetrica. Es una opcion practica para prototipos de vision por computador con LLM en portatiles, mini-PCs y dispositivos con aceleradores Intel, aunque su ecosistema de ejecucion depende de versiones nightly de OpenVINO y de un fork de Optimum Intel.

No se dispone de informacion detallada sobre la arquitectura interna, el contexto maximo ni los idiomas soportados en la documentacion proporcionada; estos datos se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LFM3-VL-2B de LiquidAI; familia LFM3) |
| Parametros totales | 2B (segun nombre del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 asimetrico (INT8_ASYM) para el modelo de lenguaje; submodelos restantes con valores por defecto de Optimum Intel |
| Idiomas soportados | no disponible |
| Licencia | lfm1.0 (other) |
| Formato de pesos | OpenVINO IR (compatible con OpenVINO 2026.5.0 o superior) |

## Arquitectura y entrenamiento

El modelo base LFM3-VL-2B pertenece a la familia LFM3 de LiquidAI, orientada a modelos de lenguaje y vision de tamano compacto. La model card de esta variante no detalla la arquitectura interna (transformer, MoE, hibrida u otra), el volumen de tokens de entrenamiento ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se especifica la composicion del dataset multimodal.

La informacion disponible se centra en el proceso de conversion y cuantizacion: los pesos se exportaron con `optimum-cli export openvino` usando `--task image-text-to-text` y `--weight-format int8`, aplicando `nncf.compress_weights` en modo INT8_ASYM al modelo de lenguaje. El resto de submodelos (vision, proyector, etc.) se comprimen con los valores por defecto de Optimum Intel, documentados en `openvino_config.json`. El resultado es un artefacto OpenVINO IR listo para ejecucion en el runtime de Intel.

## Capacidades

- Generacion de texto a partir de imagenes (image-text-to-text): descripcion de escenas, respuesta a preguntas visuales y dialogos multi-turno con contexto visual.
- Procesamiento de video: la model card incluye un ejemplo de inferencia sobre un archivo de video, requiriendo un backend de decodificacion compatible con Transformers (`torchcodec` o `av`).
- Conversacion multimodal: pipeline `image-text-to-text` con soporte de chat.
- Inferencia optimizada para hardware Intel mediante OpenVINO (CPU, GPU y NPU).
- Despliegue como servicio compatible con la API de OpenAI a traves de OpenVINO Model Server (OVMS).
- Capacidades de razonamiento, codigo, matematicas o tool calling: no disponibles en la informacion proporcionada.

## Casos de uso

- Descripcion automatica de imagenes en aplicaciones de accesibilidad: el modelo recibe una imagen y un prompt de texto y genera una descripcion en lenguaje natural; su tamano de 2B y su formato INT8 permiten ejecutarlo en un portatil sin GPU dedicada.
- Analisis de video en el borde: con el ejemplo de inferencia sobre video incluido en la model card, se puede integrar en sistemas de videovigilancia o monitorizacion que corran sobre mini-PCs con CPU Intel, evitando enviar el video a la nube.
- Asistente visual para atencion al cliente: desplegado con OVMS y la API compatible con OpenAI, puede servir respuestas sobre capturas de pantalla o fotos enviadas por usuarios en un chat de soporte.
- Prototipado rapido de pipelines VLM: la integracion con Optimum Intel y los notebooks de OpenVINO permiten validar casos de uso de vision-lenguaje en local antes de escalar a modelos mayores.
- Clasificacion y extraccion de informacion de documentos escaneados: el modelo puede responder preguntas sobre el contenido de una imagen (por ejemplo, un ticket o un formulario) en un flujo de texto-imagen.
- Demos educativas y de investigacion: al ocupar 2,2 GB y ejecutarse en CPU, es adecuado para talleres, notebooks y entornos docentes donde no hay acceso a GPUs.
- Procesamiento por lotes en servidores sin GPU: con OVMS en Docker sobre CPU, se puede desplegar como microservicio interno para tareas de etiquetado o descripcion de imagenes a bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: el repositorio ocupa 2,2 GB en INT8; se recomienda al menos 4 GB de memoria disponible para cargar el modelo y procesar entradas, aunque la cifra exacta no se especifica.
- GPU recomendadas: no se indican modelos concretos; el formato esta pensado para CPU, GPU integrada y NPU de Intel mediante OpenVINO.
- Cabe en GPU de consumo: si, en principio, al tratarse de un modelo de 2B en INT8; no obstante, la model card no confirma compatibilidad explicita con GPUs NVIDIA de consumo.
- Opciones de despliegue: Optimum Intel con backend OpenVINO, OpenVINO Model Server (OVMS) con API compatible con OpenAI, y notebooks de OpenVINO.
- Requisitos de software: OpenVINO 2026.5.0 o superior (nightly builds), Optimum Intel con el PR #2087, Transformers 5.20.0 y torchvision/Pillow para imagenes; para video, `torchcodec` o `av`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| OpenVINO/LFM3-VL-2B-int8-ov | 2B | no disponible | OpenVINO IR INT8 | lfm1.0 | Version optimizada para hardware Intel |
| LiquidAI/LFM3-VL-2B | 2B | no disponible | no disponible | lfm1.0 | Modelo base original en formato nativo |
| Otros VLM de ~2B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

La comparativa con alternativas de la misma categoria no puede completarse con los datos disponibles; solo se puede contrastar con el modelo base original, del que esta variante es una conversion cuantizada.

## Limitaciones y advertencias

- La licencia lfm1.0 es de tipo "other"; es necesario revisar el texto completo en el enlace de licencia antes de un uso comercial.
- El modelo depende de OpenVINO 2026.5.0, disponible solo como nightly build en el momento de la publicacion, y de un PR no fusionado de Optimum Intel (#2087); esto implica riesgo de inestabilidad y cambios de API.
- La compatibilidad con OVMS no esta validada de extremo a extremo para este artefacto segun la propia model card; las imagenes `latest` o `weekly` pueden no incluir el soporte necesario.
- El despliegue en NPU requiere versiones y drivers concretos no detallados; el ejemplo Docker mostrado esta preparado para CPU, no para NPU.
- No se dispone de informacion sobre sesgos, riesgo de alucinacion, limitaciones de contexto o cobertura idiomatica.
- Al ser una cuantizacion INT8, puede existir una perdida de calidad respecto al modelo original en tareas exigentes; no se documenta la magnitud de esa degradacion.
- El soporte de video exige instalar dependencias adicionales (`torchcodec` o `av`), lo que anade complejidad al entorno de produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OpenVINO/LFM3-VL-2B-int8-ov
- Modelo base original: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Licencia: https://huggingface.co/LiquidAI/LFM3-VL-2B/blob/main/LICENSE
- Documentacion del formato OpenVINO IR: https://docs.openvino.ai/2026/documentation/openvino-ir-format.html
- Guia de optimizacion y compresion de pesos: https://docs.openvino.ai/2026/openvino-workflow/model-optimization-guide/weight-compression.html
- Repositorio NNCF: https://github.com/openvinotoolkit/nncf
- PR de soporte LFM3 en Optimum Intel: https://github.com/huggingface/optimum-intel/pull/2087
- Documentacion de Optimum Intel: https://huggingface.co/docs/optimum/intel/index
- Inferencia con Optimum Intel: https://docs.openvino.ai/2026/openvino-workflow-generative/inference-with-optimum-intel.html
- OpenVINO Notebooks (LFM3): https://openvinotoolkit.github.io/openvino_notebooks/?search=LFM3
- OpenVINO Notebooks (VLM): https://openvinotoolkit.github.io/openvino_notebooks/?search=VLM
- OpenVINO Model Server: https://github.com/openvinotoolkit/model_server
- Documentacion de OVMS baremetal: https://docs.openvino.ai/ovms_baremetal
