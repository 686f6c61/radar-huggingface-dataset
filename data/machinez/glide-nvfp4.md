# machinez/GLiDE-NVFP4

## Resumen

GLiDE es un modelo de decisión multimodal desarrollado por Fastino Labs, distribuido en este repositorio por el usuario `machinez` como una conversión a NVFP4 (8 bits) del modelo original `fastino/GLiDE`. A diferencia de un modelo generativo al uso, GLiDE no produce texto libre: recibe un estado (texto, JSON o una lista de partes de texto e imagen) junto con una o varias preguntas tipadas y devuelve una distribución de probabilidad sobre las opciones de cada pregunta mediante un cabezal de lectura de 255 vías. La arquitectura declarada en los metadatos es `qwen3_5`, con un total de 17.864.494.832 parámetros según los tensores safetensors, aunque la model card original describe pesos en bf16 de 52,2 GB, lo que sugiere una discrepancia entre el checkpoint cuantizado y el original.

El modelo se posiciona como el número uno de 229 modelos en el Decision Index 0.4.1 (22 de octubre de 2026) con una puntuación de 71,5, por delante de Jeffan-31b-1710 (69,8) y baselabs mammoth-1 27B (68,4). Su propuesta diferencial es realizar decisiones en un único forward pass, sin generación autoregresiva, lo que reduce latencia y coste en tareas de clasificación, enrutamiento y scoring. Soporta contextos de hasta 40.000 tokens por pregunta y acepta imágenes a través de un codificador visual de 0,92 GB.

Esta versión concreta, `machinez/GLiDE-NVFP4`, emplea `compressed-tensors` en formato de 8 bits (NVFP4) y ocupa 25,2 GB en el repositorio, lo que la hace sustancialmente más ligera que los 52,2 GB del checkpoint bf16 original. Está pensada para despliegues con `transformers` y ofrece compatibilidad con endpoints. La licencia es `fastino-community`, una licencia de tipo `other` que conviene revisar antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con capas de atención lineal (familia `qwen3_5` según metadatos); cabezal de decisión de 255 vías |
| Parametros totales | 17.864.494.832 (según safetensors del repo) |
| Parametros activos | no disponible (no se declara MoE) |
| Longitud de contexto | hasta 40.000 tokens por prompt de pregunta (estado, pregunta, opciones e imágenes) |
| Tipos de cuantizacion | NVFP4 / 8 bits con `compressed-tensors`; el original se distribuye en bf16 |
| Idiomas soportados | no disponible |
| Licencia | `fastino-community` (tipo `other`) |
| Formato de pesos | safetensors (cuantizado con `compressed-tensors`); el original en bf16 |

## Arquitectura y entrenamiento

La información disponible describe un modelo multimodal compuesto por tres bloques: un modelo de lenguaje de 51,2 GB en bf16, un codificador visual de 0,92 GB y un cabezal de lectura de decisión de 2,6 MB. Los metadatos del repositorio etiquetan la arquitectura como `qwen3_5`, lo que apunta a una familia de transformers con capas de atención lineal; de hecho, la model card recomienda instalar `flash-linear-attention==0.5.2` para obtener kernels rápidos en esas capas, y advierte de que sin ese paquete `transformers` cae a una implementación PyTorch mucho más lenta que no formó parte de la validación. El modelo no genera tokens: lee una representación del estado y proyecta sobre un espacio de 255 opciones, devolviendo probabilidades por opción.

No se detalla en la información proporcionada el volumen de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO. Tampoco se especifican innovaciones de decodificación especulativa, ya que el paradigma no es autoregresivo. La innovación principal declarada es el propio esquema de decisión tipada (`choice`, `noul`, `score`) con un único forward pass por pregunta y micro-batching conjunto de todas las preguntas de una petición y de peticiones concurrentes. El preprocesado de imágenes se ejecuta en CPU y los pesos se copian a la GPU tensor a tensor para mantener bajo el uso de memoria host durante la carga.

## Capacidades

- Decisiones tipadas: `choice` (una de hasta 255 opciones con nombre), `noul` (sí/no, devuelve P(yes)) y `score` (niveles ordenados).
- Salida de probabilidades para cada opción de cada pregunta, sin generación de texto.
- Un forward pass por pregunta, con micro-batching de preguntas y peticiones concurrentes.
- Entrada multimodal: estado como cadena de texto, cualquier valor JSON o lista de partes de texto e imagen.
- Contexto largo de hasta 40.000 tokens por prompt de pregunta, incluyendo tokens de imagen.
- Interfaz Python (`glide.Glide`) y servidor HTTP compatible con el formato System One (`POST /v1/systemone`).
- Compatibilidad declarada con endpoints de HuggingFace (`endpoints_compatible`).
- Capacidad de clasificación, enrutamiento y scoring sobre estados estructurados.

## Casos de uso

- Clasificación de tickets de soporte: el modelo recibe el texto del ticket y metadatos del cliente como JSON y devuelve la intención (`refund`, `cancel`, `track`, `other`), una decisión booleana de escalado y un nivel de prioridad, todo en un único forward pass y con probabilidades calibradas para umbralizar.
- Enrutamiento de peticiones en pipelines de agentes: dado el estado de la conversación y una lista de herramientas o subagentes disponibles, el modelo puntúa cada opción y permite seleccionar la ruta con mayor probabilidad sin coste de generación.
- Moderación de contenido: con preguntas `noul` sobre categorías de riesgo y un contexto de hasta 40k tokens, se puede evaluar documentos largos o hilos completos y obtener P(violación) por categoría.
- Triaje de imágenes en flujos de inspección: al aceptar partes de imagen junto al texto, permite clasificar capturas, documentos escaneados o fotos de producto según criterios definidos, útil en verificación documental o control de calidad.
- Scoring de leads o solicitudes: con preguntas de tipo `score` sobre niveles ordenados (bajo, medio, alto) y un estado JSON con datos del solicitante, se obtiene una puntuación probabilística apta para priorizar colas.
- Evaluación automática de respuestas: dado un par pregunta-respuesta y criterios ordenados de calidad, el modelo asigna un nivel de calidad con probabilidad asociada, lo que facilita el filtrado en pipelines de datos sintéticos.
- Decisión en sistemas de recomendación o políticas: con un estado JSON que describe el contexto del usuario y opciones de acción, se obtiene una distribución sobre acciones sin necesidad de generar justificaciones.

## Benchmarks y rendimiento

La model card original reporta el ranking del Decision Index 0.4.1 (22 de octubre de 2026):

| Rank | Modelo | Puntuación total |
|---|---|---|
| #1 | Fastino GLiDE V1.2 | 71,5 |
| #2 | Jeffan-31b-1710 | 69,8 |
| #3 | baselabs mammoth-1 (27B) | 68,4 |

No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) para este modelo. Tampoco se ofrecen métricas de latencia o throughput más allá de los tiempos de carga (30-60 s desde almacenamiento en red) y del pico de memoria (60,2 GB para una pregunta de 39k tokens en el checkpoint bf16).

## Requisitos de hardware

- VRAM estimada: el checkpoint bf16 original requiere 52,2 GB tras la carga y alcanza 60,2 GB de pico con una pregunta de 39k tokens. Esta conversión NVFP4 de 8 bits ocupa 25,2 GB en disco, por lo que se espera un requisito de VRAM del orden de 25-30 GB, aunque el autor no publica cifras específicas para esta variante.
- GPU recomendadas (según la model card original): NVIDIA RTX PRO 6000 Blackwell Server Edition (96 GB), NVIDIA B200 (180 GB) y NVIDIA H100 80GB HBM3.
- GPU de consumo: con la cuantización NVFP4 es plausible su ejecución en GPUs de 32 GB o más (por ejemplo, RTX 5090), pero no hay validación publicada para esta variante concreta.
- Opciones de despliegue: `transformers` (probado con Python 3.12, `torch==2.14.0` y `transformers==5.17.0`), paquete `glide/` incluido en el repositorio, servidor HTTP propio compatible con `POST /v1/systemone`, y API alojada de Fastino (`POST https://api.fastino.ai/v1/systemone`, modelo `fastino/GLiDE`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles para esta variante cuantizada. La carga tarda entre 30 y 60 s desde almacenamiento en red en el checkpoint original.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Decision Index 0.4.1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLiDE V1.2 (esta ficha, NVFP4) | 17,86 B (safetensors) | 40k tokens por pregunta | 71,5 (#1) | `fastino-community` | HuggingFace (`machinez/GLiDE-NVFP4`) y API Fastino |
| Jeffan-31b-1710 | no disponible | no disponible | 69,8 (#2) | no disponible | no disponible |
| baselabs mammoth-1 | 27 B | no disponible | 68,4 (#3) | no disponible | no disponible |

No se dispone de información adicional sobre arquitectura, licencia ni contexto de los modelos comparables más allá de su posición en el ranking. La comparación con modelos generativos de propósito general no resulta directamente aplicable, dado que GLiDE no genera texto y su métrica principal es el Decision Index.

## Limitaciones y advertencias

- El modelo no genera texto: solo devuelve probabilidades sobre opciones predefinidas, por lo que no sirve para tareas de generación, resumen o diálogo abierto.
- La licencia `fastino-community` es de tipo `other`; es imprescindible revisar el texto en `https://huggingface.co/fastino/GLiDE/blob/main/LICENSE` antes de cualquier uso comercial o redistribución.
- Existe una discrepancia entre los 17,86 B parámetros declarados en los safetensors de esta conversión y los 52,2 GB en bf16 de la model card original; conviene validar el comportamiento de esta variante NVFP4 frente al checkpoint oficial antes de usarla en producción.
- La model card original advierte de que sin `flash-linear-attention==0.5.2` el rendimiento cae a una implementación PyTorch no validada; esta variante cuantizada no incluye cifras de rendimiento propias.
- El contexto máximo de 40.000 tokens es por pregunta, no por petición completa; con múltiples preguntas y estados largos el consumo de memoria crece.
- No se documentan sesgos conocidos, composición del dataset de entrenamiento ni evaluación multilingüe; los idiomas soportados figuran como no disponibles.
- Riesgo de calibración: al tratarse de un modelo probabilístico, las probabilidades pueden no estar calibradas para dominios alejados de la distribución de entrenamiento, lo que exige umbrales validados por caso de uso.
- El repositorio tiene solo 34 descargas y ninguna valoración, y fue creado en octubre de 2026; es una conversión de terceros, no una publicación oficial de Fastino.

## Enlaces

- Repositorio HuggingFace de esta conversión: https://huggingface.co/machinez/GLiDE-NVFP4
- Modelo original: https://huggingface.co/fastino/GLiDE
- Licencia: https://huggingface.co/fastino/GLiDE/blob/main/LICENSE
- Sitio de Fastino Labs: https://fastino.ai
- Documentación de la API de inferencia: https://docs.fastino.ai/inference/systemone
- Quickstart de la API: https://docs.fastino.ai/quickstart
- Obtención de API key: https://agent.fastino.ai
- Decision Index 0.4.1: https://huggingface.co/spaces/multimodalart/jev-decision-index
