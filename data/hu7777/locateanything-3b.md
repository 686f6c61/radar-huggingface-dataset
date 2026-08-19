# Hu7777/LocateAnything-3B

## Resumen

LocateAnything-3B es un modelo de visión-lenguaje desarrollado por NVIDIA para el anclaje visual (visual grounding) rápido y de alta calidad. Permite localizar objetos mediante lenguaje natural, detectar múltiples objetos en escenas densas y realizar anclaje por puntos, con aplicaciones en robótica, conducción autónoma, interacción con interfaces gráficas (GUI) y comprensión de documentos. Su innovación principal, Parallel Box Decoding (PBD), predice las coordenadas completas de las cajas delimitadoras en un solo paso paralelo en lugar de decodificar token a token de forma autorregresiva, lo que mejora el rendimiento hasta 2,5 veces en throughput respecto a enfoques anteriores.

El modelo combina un codificador de visión MoonViT-SO-400M (licencia MIT) con un modelo de lenguaje Qwen2.5-3B-Instruct (licencia Qwen Research) y se entrena sobre un conjunto de datos a gran escala de 12 millones de imágenes, más de 138 millones de consultas y 785 millones de cajas delimitadoras, abarcando escenas naturales, robótica, conducción, GUI y documentos. Está publicado bajo la licencia NVIDIA, que restringe su uso a fines académicos y de investigación sin ánimo de lucro. Con 3.830 millones de parámetros, es un modelo compacto y eficiente para tareas de percepción multimodal en tiempo real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language transformer (LLM base: Qwen2.5-3B-Instruct; vision encoder: MoonViT-SO-400M) |
| Parametros totales | 3.830.665.968 (3,83B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | NVIDIA License (uso no comercial, solo investigacion academica y sin animo de lucro) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

LocateAnything-3B sigue una arquitectura de vision-lenguaje de tipo encoder-decoder, donde el vision encoder MoonViT-SO-400M procesa las imagenes y el LLM Qwen2.5-3B-Instruct genera las respuestas de localizacion. La innovacion central es Parallel Box Decoding (PBD), que predice todas las coordenadas de una caja delimitadora (x1, y1, x2, y2) en un unico paso de decodificacion, en lugar de generarlas secuencialmente. Esto reduce la latencia y mantiene la consistencia geometrica entre las coordenadas.

El entrenamiento se realizo sobre un conjunto de datos masivo de 12 millones de imagenes con mas de 138 millones de consultas y 785 millones de cajas delimitadoras, cubriendo dominios variados como escenas naturales, robotica, conduccion autonoma, interaccion con GUI y comprension de documentos. No se especifican detalles sobre tecnicas de alineacion como RLHF o DPO en la informacion disponible. El modelo se integra en la familia Eagle VLM de NVIDIA y ha sido utilizado como base para los modelos Nemotron 3 Nano Omni y Cosmos en tareas de grounding y agente multimodal.

## Capacidades

- Anclaje visual de expresiones referenciales (referring expression grounding): localiza objetos descritos en lenguaje natural.
- Deteccion de multiples objetos en escenas densas y desordenadas, incluyendo objetos de cola larga y categorias abiertas.
- Anclaje de elementos de interfaz grafica (GUI element grounding) para sistemas interactivos y agenticos.
- Localizacion de texto y comprension de documentos, incluyendo OCR y anclaje de layout.
- Anclaje por puntos (point-based localization) y razonamiento espacial de grano fino.
- Capacidad de generar cajas delimitadoras en paralelo, lo que permite un alto throughput en inferencia.
- Soporte de tareas de deteccion en robotica, conduccion autonoma, inspeccion industrial, vigilancia y teledeteccion.

## Casos de uso

- Etiquetado automatico de datos para deteccion de objetos: el modelo puede generar cajas delimitadoras a partir de descripciones textuales, acelerando la creacion de datasets de entrenamiento para otros modelos de vision.
- Agentes de interfaz grafica (GUI agents): permite localizar botones, campos de texto o iconos en capturas de pantalla para automatizar tareas de interaccion con aplicaciones.
- Robotica de manipulacion: el modelo puede identificar y localizar objetos en entornos reales a partir de instrucciones en lenguaje natural, guiando brazos roboticos en tareas de agarre.
- Vehiculos autonomos: deteccion de objetos relevantes en escenas de conduccion (peatones, senales, obstaculos) a partir de descripciones semanticas.
- Comprension de documentos: localizacion de elementos concretos en paginas escaneadas o PDFs, como tablas, figuras o bloques de texto, facilitando tareas de extraccion de informacion.
- Inspeccion industrial y control de calidad: identificacion de defectos o componentes especificos en imagenes de lineas de produccion mediante consultas en lenguaje natural.
- Vigilancia y seguridad: deteccion de objetos o personas de interes en secuencias de video o imagenes de camaras, respondiendo a consultas descriptivas.
- Accesibilidad visual: asistencia a personas con discapacidad visual para localizar objetos en su entorno a partir de descripciones habladas o escritas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks cuantitativos (como MMLU, HumanEval, GSM8K o metricas especificas de grounding como RefCOCO, ODinW o Flickr30K) en la informacion disponible. La unica cifra de rendimiento mencionada es que Parallel Box Decoding permite un throughput hasta 2,5 veces superior al de enfoques autorregresivos previos, aunque no se detallan los valores absolutos ni las condiciones de medicion.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion oficial. Como referencia orientativa, un modelo de 3,8B parametros en precision FP16 requiere aproximadamente 7,7 GB de VRAM solo para los pesos; en INT8 se reduciria a unos 3,8 GB, y en cuantizaciones de 4 bits a unos 2 GB. Estas cifras son estimaciones genericas y no estan confirmadas por NVIDIA.
- GPU recomendadas: no se especifican modelos concretos. Dado el tamano del modelo, seria viable en GPUs de consumo como RTX 3090, RTX 4090 o superiores, asi como en GPUs profesionales como A10, A100 o L4.
- Opciones de despliegue: el modelo se distribuye en formato safetensors y es compatible con la libreria transformers de Hugging Face. No se mencionan integraciones especificas con vLLM, llama.cpp u Ollama, pero podria desplegarse mediante pipelines de transformers o servidores de inferencia compatibles.
- Latencia y throughput: no se proporcionan datos concretos. La arquitectura PBD reduce el numero de pasos de decodificacion, lo que sugiere una latencia menor que la de modelos autorregresivos equivalentes, pero no hay cifras oficiales.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados con otros modelos de anclaje visual en la informacion proporcionada. Como referencia, existen alternativas en el ecosistema como Grounding DINO (1,6B parametros), OWL-ViT (400M parametros) o modelos VLM generalistas como Qwen2-VL (2B, 7B, 72B), pero no hay resultados de benchmarks comparables disponibles para LocateAnything-3B. Por tanto, no es posible realizar una comparativa cuantitativa rigurosa.

## Limitaciones y advertencias

- Licencia restrictiva: el modelo solo puede utilizarse para fines academicos y de investigacion sin animo de lucro. Cualquier uso comercial esta prohibido, salvo autorizacion expresa de NVIDIA.
- Idiomas limitados: la model card indica soporte exclusivo en ingles, por lo que las consultas en otros idiomas pueden producir resultados degradados o incorrectos.
- Sesgos potenciales: al ser un modelo entrenado sobre datos de dominios especificos (escenas naturales, GUI, robotica, conduccion), puede presentar sesgos en contextos fuera de esos dominios o en poblaciones subrepresentadas.
- Riesgo de alucinacion: como todo modelo de lenguaje, puede generar cajas delimitadoras incorrectas o inventar localizaciones cuando la consulta es ambigua o la imagen no contiene el objeto solicitado.
- Contexto visual limitado: aunque el modelo base Qwen2.5-3B-Instruct soporta hasta 32K tokens de contexto, no se especifica la longitud de contexto efectiva para el procesamiento de imagenes en LocateAnything-3B.
- Sin garantia: el modelo se distribuye "tal cual", sin garantias de rendimiento o idoneidad para casos de uso concretos en produccion.

## Enlaces

- Modelo en Hugging Face (original de NVIDIA): https://huggingface.co/nvidia/LocateAnything-3B
- Modelo en Hugging Face (copia del usuario Hu7777): https://huggingface.co/Hu7777/LocateAnything-3B
- Demo interactiva: https://huggingface.co/spaces/nvidia/LocateAnything
- Codigo fuente en GitHub (Eagle/Embodied): https://github.com/NVlabs/Eagle/tree/main/Embodied
- Pagina del proyecto: https://research.nvidia.com/labs/lpr/locate-anything/
- Informe tecnico (PDF): https://research.nvidia.com/labs/lpr/locate-anything/LocateAnything.pdf
- Articulo arXiv (referencia): https://arxiv.org/abs/2605.27365
- Licencia NVIDIA: https://huggingface.co/nvidia/LocateAnything-3B/blob/main/LICENSE
