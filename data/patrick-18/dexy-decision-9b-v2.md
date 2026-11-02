# Patrick-18/Dexy-Decision-9B-V2

## Resumen

Dexy-Decision-9B-V2 es un modelo de decisión afinado (fine-tune) sobre vllm-sr/d3-flash, publicado por el usuario Patrick-18 en HuggingFace. No es un modelo generativo al uso: en lugar de producir texto, recibe un `state` compartido (texto, JSON, imágenes o vídeos) y un conjunto de preguntas con nombre, y devuelve probabilidades para clasificación, juicios binarios y valoraciones ordenadas. Su arquitectura parte del backbone multimodal Qwen3.5-9B con un cabezal de decisión de 255 códigos, y mantiene la interfaz de inferencia del modelo base.

La innovación principal respecto al modelo original es la extensión del validador de puntuaciones, que pasa de un rango de 2 a 10 niveles a un rango de 2 a 255 niveles ordenados, reutilizando el mecanismo de lectura de códigos de respuesta ya existente. El modelo incorpora un encoder de visión de 0,456B de parámetros y una configuración de contexto de 262.144 posiciones, aunque esta cifra es un techo de posiciones y no una garantía de que cualquier longitud de entrada quepa en memoria de GPU.

Es relevante ahora porque propone un paradigma distinto al de los LLM generativos: el llamado "system one", una pasada de decisión directa sin generación de texto, orientada a clasificación zero-shot y enrutamiento. El modelo es de acceso abierto bajo licencia Apache-2.0, con un total de 8.392.695.024 parámetros y un tamaño de repositorio de 16,8 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | d3-flash: backbone multimodal Qwen3.5-9B + cabezal de decisión de 255 códigos |
| Parametros totales | 8.392.695.024 (8.394B, incluyendo 0,456B del encoder de visión) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 posiciones (configuración del backbone; techo de posiciones, no garantía de ajuste en memoria) |
| Tipos de cuantizacion | no disponible (el modelo se distribuye en BF16 para el backbone y FP32 para el cabezal de decisión) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (backbone + `readout.safetensors`), con `custom_code` y `decision_config.json` |

Otras especificaciones relevantes:

| Parametro | Valor |
|---|---|
| Precision | BF16 en el backbone; FP32 en el cabezal de decisión y softmax |
| Tipos de pregunta | `choice` (1–255 candidatos), `score` (2–255 niveles ordenados), `noul` (juicio binario) |
| Entradas | Texto / JSON, imágenes y vídeos |
| Modelo base | vllm-sr/d3-flash (relación: finetune) |
| Librería | transformers |
| Pipeline | zero-shot-classification |
| Tamaño del repo | 16,8 GB |

## Arquitectura y entrenamiento

El modelo reutiliza la arquitectura de d3-flash: un backbone multimodal Qwen3.5-9B combinado con un cabezal de lectura de decisión de 255 códigos. Las capas de atención completa atienden de forma bidireccional sobre la entrada, mientras que las capas Gated DeltaNet conservan su barrido causal. Cada pregunta se procesa en su propio forward pass, y el runtime agrupa las preguntas en lotes. Para que el modelo funcione como decisor es imprescindible conservar junto a los pesos del backbone el fichero `readout.safetensors`, el tokenizer, la plantilla de chat y `decision_config.json`; cargar solo el backbone no implementa decisiones.

El ajuste respecto al modelo base se centra en la extensión del validador de puntuaciones de 2–10 a 2–255 niveles ordenados, apoyándose en el mecanismo de lectura de códigos de respuesta ya existente. La configuración de decisión suministrada no impone un límite adicional de longitud de entrada (`max_length: null`), por lo que las entradas no se truncan de forma silenciosa y las entradas largas requieren memoria adicional. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en la información proporcionada.

## Capacidades

- Clasificación zero-shot mediante preguntas de tipo `choice` con entre 1 y 255 candidatos.
- Juicios binarios mediante preguntas de tipo `noul`.
- Valoraciones ordenadas mediante preguntas de tipo `score` con entre 2 y 255 niveles, frente al límite de 10 del modelo base.
- Procesamiento de entradas multimodales: texto, JSON, imágenes y vídeos.
- Procesamiento de imágenes a hasta 1,6 MP por imagen.
- Procesamiento de vídeo muestreado a 2 FPS, con un máximo de 32 fotogramas y hasta 0,2 MP por fotograma.
- Decisión sin generación de texto: devuelve probabilidades, no secuencias de tokens.
- Enrutamiento y etiquetado multi-pregunta sobre un mismo estado compartido, con todas las preguntas viendo el mismo material multimedia.
- Servicio HTTP nativo mediante vLLM con el endpoint `/v1/systemone`, además de `GET /v1/models` y las opciones estándar de la CLI de vLLM.
- Servicio HTTP alternativo respaldado por el runtime de Transformers (`d3_server.py`), con autenticación bearer opcional mediante `DECISION_API_KEY`.

## Casos de uso

- Enrutamiento de tickets de soporte: dado el estado con la descripción del cliente, se lanzan preguntas `choice` para asignar el equipo (devoluciones, facturación, técnico) y `noul` para determinar si se solicita un reemplazo, tal y como muestra el ejemplo de la model card.
- Triaje de urgencia: una pregunta `score` con criterios ordenados (rutina, pronto, inmediato) permite priorizar colas de atención sin generar texto intermedio, lo que reduce la latencia frente a un LLM generativo.
- Moderación de contenido multimodal: clasificación de imágenes y vídeos con preguntas `choice` y `noul` sobre políticas, aprovechando el encoder de visión y el muestreo de vídeo a 2 FPS.
- Etiquetado automático de datasets: generación de etiquetas de clasificación y valoraciones ordenadas de hasta 255 niveles sobre grandes volúmenes de texto y JSON, con el endpoint `/v1/systemone` de vLLM para alto rendimiento.
- Evaluación de documentos con imágenes: preguntas de tipo `choice` sobre capturas o documentos escaneados (hasta 1,6 MP por imagen) para extraer decisiones estructuradas sin OCR intermedio explícito.
- Sistemas de decisión en agentes: uso como componente "system one" que resuelve decisiones rápidas dentro de un pipeline mayor, delegando la generación de texto a otro modelo y reservando este para la clasificación y el juicio binario.
- Análisis de clips de vídeo: juicios binarios y clasificaciones sobre fragmentos de hasta 32 fotogramas para detección de eventos o verificación de condiciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 16,8 GB en BF16 para el backbone más FP32 para el cabezal de decisión, por lo que se requiere una GPU con memoria suficiente para los pesos completos más el estado de activaciones.
- GPU recomendadas: el entorno verificado por el autor es una NVIDIA RTX 5090 con soporte CUDA 13.0.
- Cabe en GPU de consumo: el autor valida el funcionamiento en RTX 5090; no se dispone de datos para otras GPU de consumo.
- Opciones de despliegue: vLLM nightly (obligatorio; vLLM 0.32.0 no incluye el adaptador d3), con backend de pooling nativo y endpoint `/v1/systemone`; runtime de Transformers con `AutoModel.from_pretrained(..., trust_remote_code=True)`; servidor HTTP `d3_server.py` respaldado por Transformers.
- Versiones fijadas: wheel inmutable `0.33.0rc1.dev485+g0e5b2ba11` (commit `0e5b2ba118cfb3763a3640942e02dd8d93e8ed6c`), PyTorch 2.14.0, torchvision 0.29.0, Transformers 5.19.0, Accelerate 1.12.0 y Flash Linear Attention / fla-core 0.4.2.
- Entorno recomendado: Python 3.12, Linux x86-64, driver NVIDIA compatible con CUDA 13.0.
- Latencia y throughput: no disponibles. Cada pregunta requiere su propio forward pass, agrupadas por el runtime, lo que condiciona el coste por número de preguntas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo de salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Dexy-Decision-9B-V2 | 8.394B | 262.144 posiciones (config.) | Probabilidades de decisión (choice/score/noul) | Apache-2.0 | HuggingFace |
| vllm-sr/d3-flash (modelo base) | no disponible | no disponible | Probabilidades de decisión con score de 2–10 niveles | no disponible | HuggingFace |
| LLM generativos de ~9B (categoría general) | ~9B | variable | Texto generado | variable | variable |

La comparación directa con LLM generativos no es homogénea: Dexy-Decision-9B-V2 no genera texto, sino que devuelve probabilidades sobre preguntas definidas por el usuario, por lo que las métricas de generación (MMLU, HumanEval, GSM8K) no son aplicables de forma directa. No se dispone de datos de rendimiento del modelo base d3-flash en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, solo probabilidades de decisión sobre preguntas predefinidas.
- Requiere conservar `readout.safetensors`, el tokenizer, la plantilla de chat y `decision_config.json` junto al backbone; cargar solo el backbone no implementa decisiones.
- La configuración de contexto de 262.144 posiciones es un techo de posiciones, no una garantía de que cualquier longitud de entrada quepa en memoria de GPU.
- La configuración de decisión no impone límite adicional de longitud (`max_length: null`), por lo que las entradas no se truncan y las entradas largas consumen memoria adicional.
- Requiere vLLM nightly (versión fijada `0.33.0rc1.dev485+g0e5b2ba11`); vLLM 0.32.0 no incluye el adaptador d3, lo que complica el despliegue en entornos con versiones estables.
- El servidor HTTP de Transformers (`d3_server.py`) solo acepta entradas multimedia como data URLs base64, a diferencia del runtime de Transformers, que también acepta rutas locales.
- Cada pregunta implica un forward pass independiente, lo que escala el coste con el número de preguntas.
- No se dispone de información sobre sesgos, idiomas soportados, riesgo de alucinación ni datos de entrenamiento en la información proporcionada.
- Licencia Apache-2.0: permite uso comercial, pero se recomienda revisar las condiciones del modelo base vllm-sr/d3-flash, cuya licencia no está disponible en la información proporcionada.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 2026-11-02, por lo que carece de validación comunitaria.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Patrick-18/Dexy-Decision-9B-V2
- Modelo base vllm-sr/d3-flash: https://huggingface.co/vllm-sr/d3-flash
- Guía de uso del modelo base: https://huggingface.co/vllm-sr/d3-flash#quickstart
