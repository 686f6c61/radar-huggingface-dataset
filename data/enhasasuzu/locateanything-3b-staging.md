# enhasasuzu/LocateAnything-3B-staging

## Resumen

LocateAnything-3B es un modelo vision-language desarrollado por NVIDIA (laboratorio LPR) dentro de la familia Eagle VLM, disenado especificamente para grounding visual de alta velocidad y calidad: localizacion precisa de objetos, deteccion densa y localizacion basada en puntos a partir de instrucciones en lenguaje natural. El modelo parte de Qwen2.5-3B-Instruct como backbone de lenguaje y anade un encoder visual MoonViT-SO-400M, lo que da un total aproximado de 3B parametros en el componente linguistico mas el encoder visual.

La innovacion central es Parallel Box Decoding (PBD), un esquema que predice las coordenadas completas de un bounding box en un unico paso paralelo en lugar de decodificar token a token de forma autoregresiva. Segun el autor, esto permite hasta 2,5x mas throughput que aproximaciones previas manteniendo consistencia geometrica. El modelo ha sido entrenado sobre un dataset multi-dominio de 12M imagenes, 138M+ consultas y 785M bounding boxes, cubriendo escenas naturales, robotica, conduccion, interfaces GUI y comprension de documentos.

Es relevante ahora porque NVIDIA lo presenta como base para percepcion multimodal generalista, integrado en modelos de produccion como Nemotron 3 Nano Omni y Cosmos para funcionalidades de Computer Use y Visual Grounding. La ficha corresponde a un repositorio staging (enhasasuzu/LocateAnything-3B-staging), un espejo no oficial del modelo original nvidia/LocateAnything-3B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language transformer (backbone Qwen2.5-3B-Instruct + encoder visual MoonViT-SO-400M) con Parallel Box Decoding |
| Parametros totales | 3B (componente linguistico) + ~400M (encoder visual) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | NVIDIA License (uso no comercial, solo investigacion academica y sin animo de lucro) |
| Formato de pesos | safetensors (libreria transformers, custom_code) |

## Arquitectura y entrenamiento

LocateAnything combina un modelo de lenguaje Qwen2.5-3B-Instruct con un encoder visual MoonViT-SO-400M (licencia MIT, procedente del ecosistema Kimi-VL). Sobre esta base, el modelo introduce Parallel Box Decoding (PBD), un mecanismo que sustituye la decodificacion autoregresiva de coordenadas por una prediccion paralela del bounding box completo en un solo paso. Esto reduce la latencia de generacion de cajas y preserva la coherencia geometrica entre coordenadas, con una mejora declarada de hasta 2,5x en throughput frente a enfoques previos.

El entrenamiento se realizo sobre un dataset a gran escala de 12M imagenes, mas de 138M consultas y 785M bounding boxes, abarcando dominios como escenas naturales, robotica, conduccion autonoma, interaccion con GUI y comprension de documentos. El modelo se apoya conceptualmente en trabajos como Pix2Seq (formulacion de deteccion como modelado de lenguaje), Detect Anything via Next Point Prediction y el informe tecnico de Kimi-VL. No se especifican en la informacion disponible detalles sobre el uso de RLHF o DPO, ni el numero exacto de tokens de entrenamiento del componente linguistico.

## Capacidades

- Grounding visual por expresion de referencia (referring expression grounding): localizar objetos descritos en lenguaje natural.
- Deteccion de objetos open-set, comunes y de cola larga.
- Deteccion densa multi-objeto en escenas complejas y desordenadas.
- Grounding de elementos de interfaz grafica (GUI) para sistemas interactivos y agentes.
- Localizacion de texto en imagenes (OCR localization) y comprension de layout de documentos.
- Localizacion basada en puntos y razonamiento espacial de grano fino.
- Procesamiento de imagenes y videos (segun la demo publica).
- Pipeline image-text-to-text con soporte conversacional.
- Capacidades de percepcion para robotica y conduccion autonoma.
- No se menciona soporte explicito de tool calling ni function calling en la informacion disponible.
- Capacidades multilingues limitadas al ingles.

## Casos de uso

- Deteccion y etiquetado automatico de datasets: el modelo puede generar bounding boxes y anotaciones de grounding sobre grandes volumenes de imagenes, acelerando la creacion de datasets de entrenamiento para otros modelos de vision.
- Grounding de elementos GUI para agentes: permite identificar botones, campos de texto y componentes de interfaz a partir de instrucciones en lenguaje natural, habilitando agentes de automatizacion de escritorio y navegacion web.
- Robotica de percepcion: localizacion precisa de objetos referenciados por instrucciones verbales para tareas de manipulacion y navegacion, gracias a su entrenamiento en dominios de robotica.
- Conduccion autonoma: deteccion de objetos relevantes en escenas de trafico (vehiculos, peatones, senalizacion) con el throughput elevado que aporta Parallel Box Decoding.
- Comprension de documentos y OCR: localizacion de campos, tablas y texto en documentos escaneados para pipelines de extraccion de datos y digitalizacion.
- Inspeccion industrial y vigilancia: deteccion de defectos o elementos de interes en imagenes de camaras industriales o de seguridad, incluyendo escenas desordenadas.
- Teledeteccion: localizacion de objetos y estructuras en imagenes aereas o satelitales para analisis geoespacial.
- Asistencia en anotacion interactiva: uso conversacional para refinar localizaciones de objetos mediante dialogos multi-turno con el modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor unicamente declara una mejora de hasta 2,5x en throughput frente a aproximaciones previas gracias a Parallel Box Decoding, sin cifras absolutas de MMLU, HumanEval, GSM8K ni metricas de deteccion (mAP, etc.).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Como referencia orientativa, un modelo de 3B parametros en precision FP16 requiere aproximadamente 6-7 GB solo para pesos, mas el encoder visual (~400M) y el overhead de activaciones.
- En cuantizacion de 8 bits cabria en GPUs consumer de 12-16 GB; en 4 bits, en GPUs de 8 GB o superiores, aunque no se confirman cuantizaciones oficiales.
- GPU recomendadas: no especificadas por el autor. Para despliegue en produccion se recomendarian A100, H100 o L40S; para desarrollo, RTX 4090 o RTX 3090.
- Opciones de despliegue: transformers (libreria declarada), con soporte de custom_code. No se confirma compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en cifras absolutas; solo la mejora relativa de 2,5x declarada por Parallel Box Decoding.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LocateAnything-3B | 3B + 400M vision | no disponible | Grounding visual con Parallel Box Decoding | NVIDIA License (no comercial) | Hugging Face, GitHub, demo |
| Qwen2.5-VL-3B | ~3B | no disponible en esta ficha | VLM generalista | Apache 2.0 (segun version) | Hugging Face |
| Kimi-VL | no disponible | no disponible | VLM con encoder MoonViT | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada, por lo que la comparativa se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- Licencia restrictiva: la NVIDIA License permite uso, reproduccion y modificacion unicamente con fines academicos y de investigacion sin animo de lucro. El uso comercial no esta permitido salvo para NVIDIA y sus filiales.
- El modelo se distribuye "as is", sin garantia de ningun tipo, y el usuario asume todos los riesgos asociados.
- Solo soporta ingles, lo que limita su uso en aplicaciones en castellano u otros idiomas.
- Riesgo de alucinacion y de localizaciones imprecisas en escenas muy complejas o con objetos poco representados en el entrenamiento.
- No se especifica la longitud de contexto, lo que dificulta planificar el uso con imagenes de alta resolucion o conversaciones largas.
- El repositorio consultado es un staging no oficial (enhasasuzu/LocateAnything-3B-staging); para uso real debe referenciarse el repositorio original nvidia/LocateAnything-3B.
- La redistribucion debe conservar la licencia y los avisos de copyright y atribucion; el modelo incorpora componentes de terceros con sus propias licencias (Qwen Research License para el LM, MIT para MoonViT).
- Orientado a investigacion y desarrollo; no se declara su idoneidad para produccion sin validacion adicional.

## Enlaces

- Repositorio staging: https://huggingface.co/enhasasuzu/LocateAnything-3B-staging
- Repositorio original: https://huggingface.co/nvidia/LocateAnything-3B
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/nvidia/LocateAnything
- Codigo en GitHub (NVlabs/Eagle, Embodied): https://github.com/NVlabs/Eagle/tree/main/Embodied
- Familia Eagle VLM: https://github.com/NVlabs/EAGLE
- Paper (arXiv:2605.27365): https://arxiv.org/abs/2605.27365
- Informe tecnico (PDF): https://research.nvidia.com/labs/lpr/locate-anything/LocateAnything.pdf
- Pagina del proyecto: https://research.nvidia.com/labs/lpr/locate-anything/
- Licencia NVIDIA: https://huggingface.co/nvidia/LocateAnything-3B/blob/main/LICENSE
- Modelo base linguistico: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Encoder visual: https://huggingface.co/moonshotai/MoonViT-SO-400M
- Referencia Kimi-VL: https://arxiv.org/abs/2504.07491
- Referencia Pix2Seq: https://arxiv.org/abs/2109.10852
- Referencia Detect Anything via Next Point Prediction: https://arxiv.org/abs/2510.12798
- Nemotron: https://www.nvidia.com/en-us/ai-data-science/foundation-models/nemotron/
- Cosmos: https://www.nvidia.com/en-us/ai/cosmos/
