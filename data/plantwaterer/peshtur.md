# plantwaterer/peshtur

## Resumen

`peshtur` es un modelo de decisión visual de 4.539.265.536 parámetros, resultado de un ajuste fino (fine-tuning) del modelo base Qwen/Qwen3.5-4B (revisión `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a`, licencia Apache-2.0). Lo desarrolla el usuario `plantwaterer` y resuelve una tarea muy concreta: responder preguntas de opción múltiple sobre imágenes devolviendo, en un único pase forward, una distribución de probabilidad calibrada sobre las opciones (de 2 a 26, codificadas como `A..Z`), sin decodificación de tokens.

Técnicamente no es un modelo aislado, sino un sistema de dos componentes. Por un lado, un motor OCR (PP-OCRv5 en su variante mobile, ~20 MB, Apache-2.0) lee el texto de cada imagen y lo inyecta en el prompt como estado. Por otro, el modelo de visión propiamente dicho procesa imagen más texto y aplica una cabeza lineal de lectura (readout) de 26 vías en fp32 sobre el estado oculto del último token del prompt. Esto elimina el sesgo de generación autoregresiva y permite obtener probabilidades directamente comparables entre opciones.

El modelo es relevante para quienes necesitan un clasificador visual de opción múltiple con salida probabilística y latencia baja, en lugar de un modelo generativo generalista. Su licencia Apache-2.0 y su tamaño (cabe en GPUs de 16 GB) lo hacen desplegable en entornos de producción modestos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido Qwen3.5 (24 capas Gated DeltaNet recurrentes + 8 capas de atención completa), con encoder de visión y merger; readout lineal de 26 vías |
| Parámetros totales | 4.539.265.536 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en bf16; el autor no documenta cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (el OCR de reconocimiento es `en_PP-OCRv5_mobile_rec`, orientado a inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16, 2 shards, 9,08 GB) + `readout.safetensors` (fp32, peso `[26, 2560]` y sesgo `[26]`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B, un transformer híbrido en el que 24 capas usan Gated DeltaNet (recurrentes, causales) y 8 capas usan atención completa. En `peshtur` estas últimas se han convertido en atención bidireccional no causal sobre el prompt (PyTorch SDPA con `is_causal=False`), mientras que las capas recurrentes permanecen causales. El embedding de parches de visión (Conv3d) se ha linealizado a un producto matricial equivalente. El ajuste se realizó con LoRA de rango 16 (`alpha=32`) sobre las 248 matrices lineales del modelo de lenguaje, manteniendo congelados el encoder de visión y el merger de visión.

El entrenamiento usó 323.264 preguntas visuales de opción múltiple con texto OCR real inyectado en el prompt (formato `d3`), durante 1 época (5.051 pasos de optimizador, batch efectivo 64, LR coseno de `5e-5` para LoRA y `3e-4` para la cabeza, weight decay `0.02`). Los objetivos de destilación combinan `0.5 * one_hot(gold) + 0.5 * media(p_WeMM, p_vxg2, p_peshashaga)` con tres profesores de visión de 27B (Apache-2.0) y suavizado de etiquetas de `0.05`. La cabeza de lectura de 26 vías se inicializó a partir de las filas `A..Z` de `lm_head` del modelo base y se exportó en fp32 tras fusionar los adaptadores LoRA en fp32.

## Capacidades

- Respuesta a preguntas de opción múltiple sobre imágenes (2 a 26 opciones, códigos `A..Z`).
- Salida de distribución de probabilidad calibrada en un único pase forward, sin decodificación de tokens.
- Lectura de texto en imágenes mediante OCR integrado (PP-OCRv5 mobile, detección + reconocimiento en inglés), con inyección del texto detectado en el prompt.
- Procesamiento de múltiples imágenes por petición (un placeholder por imagen).
- Razonamiento visual de decisión bajo un formato de prompt fijo (`d3`): sistema + estado + pregunta + opciones.
- Modo thinking desactivado de forma explícita (`enable_thinking=False`).
- No soporta generación de texto libre, tool calling, agentes ni razonamiento multi-paso; su interfaz es estrictamente de selección entre opciones.

## Casos de uso

- **Inspección visual automatizada en control de calidad**: el modelo puede decidir, entre opciones predefinidas, qué defecto presenta una pieza fotografiada (por ejemplo, "A: rayado, B: abolladura, C: sin defecto"), con probabilidades que permiten fijar umbrales de rechazo.
- **Moderación de contenido visual**: clasificación de imágenes en categorías discretas de política, aprovechando la salida probabilística para derivar niveles de confianza y escalar casos ambiguos a revisión humana.
- **Asistencia a personas con discapacidad visual**: dado un conjunto de opciones sobre una escena o imagen (por ejemplo, "¿qué objeto está más cerca?"), el modelo devuelve la opción más probable junto con la distribución completa.
- **Verificación de documentos y formularios**: el OCR integrado extrae texto de la imagen y el modelo decide entre opciones como "documento legible / ilegible / incompleto" o el tipo de documento, sin necesidad de un pipeline OCR separado.
- **Análisis de capturas de pantalla en soporte técnico**: clasificación de capturas en categorías de error conocidas (por ejemplo, "A: error de red, B: error de permisos, C: pantalla en blanco") para enrutar tickets automáticamente.
- **Etiquetado asistido en anotación de datasets**: preetiquetado de imágenes con opciones cerradas y probabilidades, para que los anotadores humanos revisen y corrijan, reduciendo el coste de anotación.
- **Selección de producto o comparación visual**: dada una imagen con varios artículos y una pregunta de comparación ("¿cuál es más grande?"), el modelo devuelve la opción correspondiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

Los únicos datos de rendimiento proporcionados son de recursos: VRAM pico medida de 12,53 GB en RTX PRO 6000 Blackwell y 11,75 GB en H200, con PaddleOCR cargado en la misma GPU. No se documentan latencias ni throughput.

## Requisitos de hardware

- **VRAM estimada**: 9,08 GB de pesos en bf16; pico medido de 12,53 GB (RTX PRO 6000) y 11,75 GB (H200) con OCR en GPU. Se recomienda GPU de 16 GB o más.
- **GPU recomendadas**: NVIDIA RTX PRO 6000 Blackwell, NVIDIA H200 (probadas por el autor); cualquier GPU con 16 GB o más de VRAM compatible con CUDA 12.9/13.0.
- **Consumer GPU**: cabe en GPUs de consumo con 16 GB o más (por ejemplo, RTX 4080/4090 de 16-24 GB), aunque el autor no documenta pruebas en estas.
- **Entorno**: Linux x86_64, Python 3.12, `torch==2.14.1` (CUDA 13.0), `triton==3.8.0`, `transformers==5.12.1`, `flash-linear-attention==0.5.2`, `paddlepaddle-gpu==3.2.0` (CUDA 12.9), `paddleocr==3.7.0`, `paddlex==3.7.2`, `decision-index @ 25c6ec7b`, `uv`, `curl` y bibliotecas OpenCV del sistema (`libgl1`, `libglib2.0-0`).
- **Despliegue**: el autor proporciona un motor propio (`peshtur.py`, `decision_index vision pipeline`) y un script `install.sh`; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| peshtur | 4,54B | no disponible | Decisión visual de opción múltiple con readout probabilístico | Apache-2.0 | Hugging Face (este repo) |
| Qwen/Qwen3.5-4B (base) | ~4B | no disponible | Generación multimodal generalista | Apache-2.0 | Hugging Face |
| Rover00/WeMM-Decision | 27B | no disponible | Decisión visual (profesor de destilación) | Apache-2.0 | Hugging Face |
| plantwaterer/peshashaga | 27B | no disponible | Decisión visual (profesor de destilación) | Apache-2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- **Tarea restringida**: solo responde preguntas de opción múltiple sobre imágenes; no genera texto libre, no soporta tool calling ni razonamiento multi-paso.
- **Dependencia del OCR**: el estado del prompt se construye a partir del texto detectado por PP-OCRv5; errores de OCR (reconocimiento solo en inglés, umbral de confianza 0,5, máximo 60 líneas / 1.200 caracteres por imagen) pueden degradar la decisión.
- **Idiomas**: no se documentan idiomas soportados; el reconocimiento OCR es exclusivamente en inglés, lo que limita el uso con texto en otros idiomas.
- **Alucinación**: al ser una clasificación cerrada sobre opciones, el riesgo se manifiesta como asignación de probabilidad alta a una opción incorrecta, no como texto inventado; la calibración declarada por el autor no está verificada con benchmarks públicos.
- **Formato de prompt rígido**: requiere el formato `d3` exacto (system, `State:`, `Question:`, `Options:`, instrucción final); desviarse de él puede invalidar la salida.
- **Requisitos de entorno estrictos**: versiones fijadas de PyTorch, transformers, PaddlePaddle y PaddleOCR, y Linux x86_64; no hay soporte documentado para otros sistemas operativos ni para cuantización.
- **Licencia**: Apache-2.0 permite uso comercial, pero el modelo base Qwen3.5-4B y los componentes OCR (PP-OCRv5) tienen sus propias licencias Apache-2.0 que deben respetarse; el autor no redistribuye el OCR en el repositorio.
- **Madurez**: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación externa conocida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/plantwaterer/peshtur
- Modelo base Qwen/Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B/tree/851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a
- Motor Decision Index: https://github.com/apolinario/decision-index
- PP-OCRv5 (PaddleOCR): https://github.com/PaddlePaddle/PaddleOCR
- Detector OCR: https://huggingface.co/PaddlePaddle/PP-OCRv5_mobile_det
- Reconocimiento OCR (inglés): https://huggingface.co/PaddlePaddle/en_PP-OCRv5_mobile_rec
- Profesor de destilación Rover00/WeMM-Decision: https://huggingface.co/Rover00/WeMM-Decision
- Profesor de destilación plantwaterer/peshashaga: https://huggingface.co/plantwaterer/peshashaga
