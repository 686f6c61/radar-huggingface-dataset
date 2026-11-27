# litert-community/LFM2.5-VL-450M

## Resumen

LFM2.5-VL-450M es un modelo de visión y lenguaje (VLM) de 450 millones de parámetros desarrollado por Liquid AI, distribuido en formato LiteRT-LM por la comunidad `litert-community` para inferencia en dispositivo (on-device). Combina un backbone de texto híbrido de la familia LFM2 con una torre de visión SigLIP2 compacta, lo que le permite procesar texto e imágenes en un único pipeline con un peso de tan solo 0,41 GB en cuantización int4.

El modelo resuelve el problema de llevar capacidades multimodales a entornos con recursos muy limitados: móviles, dispositivos embebidos, navegadores y aplicaciones de escritorio sin GPU dedicada. Su tamaño reducido y el formato `.litertlm` (optimizado para el runtime LiteRT-LM de Google, sucesor de TensorFlow Lite) lo hacen adecuado para despliegues donde un VLM de miles de millones de parámetros resultaría inviable.

Es relevante ahora porque LiteRT-LM se ha consolidado como runtime de referencia para IA en dispositivo en Android y macOS, y porque este modelo es la variante pequeña de la familia LFM2.5-VL, que también incluye una versión de 3B. La model card advierte de un defecto conocido en el runtime que afecta a la percepción posicional de la imagen, corregido parcialmente mediante un build alternativo incluido en el repositorio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida: backbone de texto LFM2 (16 capas, convoluciones cortas con compuerta + atención con consultas agrupadas) + torre de visión SigLIP2 (12 capas, dimensión oculta 768) |
| Parámetros totales | 450M (aproximado, según denominación del modelo) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 4096 tokens (caché KV máxima) |
| Tipos de cuantización | int8 dinámica (texto, visión) e int4 blockwise-32 con embedding y lm_head en int8 |
| Idiomas soportados | No disponible |
| Licencia | LFM Open License v1.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM); el modelo base original en formato PyTorch/safetensors no se detalla en la información disponible |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura híbrida: el backbone de texto LFM2 consta de 16 capas que combinan convoluciones cortas con compuerta (gated short-convolutions) y atención con consultas agrupadas (grouped-query attention), con un vocabulario de 64k tokens. La torre de visión es un SigLIP2 compacto de 12 capas y dimensión oculta 768. Cada imagen se procesa a 512×512 píxeles y se convierte en 256 tokens suaves que se inyectan en la secuencia de texto mediante marcadores de posición gestionados por el procesador de datos LFM2 del runtime.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada. La model card del repositorio LiteRT no detalla el proceso de entrenamiento del modelo base original (LiquidAI/LFM2.5-VL-450M), solo su conversión y cuantización. La innovación técnica destacable es el propio formato `.litertlm`, que empaqueta el codificador de visión, el adaptador visual y los metadatos de marcadores de posición de imagen en un único archivo ejecutable por el runtime, junto con la cuantización int4 blockwise-32 de las capas lineales de texto.

## Capacidades

- Generación de texto y respuesta a preguntas en formato conversacional (plantilla ChatML incluida en el archivo).
- Comprensión de imágenes: descripción de escenas, preguntas sobre color dominante, OCR de texto grande, identificación de formas y conteo de objetos (con las limitaciones posicionales indicadas más abajo).
- Procesamiento de una imagen por prompt, redimensionada automáticamente a 512×512 por el runtime.
- Soporte de entrada PNG y JPEG mediante el parámetro `--attachment` del CLI de `litert-lm`.
- Modelo no-thinking (sin modo de razonamiento extendido).
- Inferencia en CPU y GPU (OpenCL en macOS y Android; Metal en iOS no soportado para esta familia).
- No se documenta soporte de tool calling, function calling ni capacidades de agente multi-paso en la información disponible.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Asistente visual en aplicaciones móviles Android: integrado mediante el runtime LiteRT-LM y el paquete `com.google.ai.edge.litert`, el modelo puede describir fotos tomadas por el usuario o responder preguntas sobre ellas sin enviar datos a la nube, con un peso de 0,41 GB que cabe en el almacenamiento de cualquier terminal moderno.
- OCR ligero en dispositivos de campo: para digitalizar carteles, etiquetas o documentos con texto de gran tamaño dominante, el modelo funciona correctamente en CPU y no requiere conectividad, lo que resulta útil en entornos industriales o rurales sin red.
- Accesibilidad para personas con discapacidad visual: descripción de imágenes en tiempo real desde la cámara del teléfono, aprovechando la inferencia local para preservar la privacidad y evitar latencia de red.
- Moderación de contenido visual en el propio dispositivo: clasificación y descripción de imágenes subidas por usuarios antes de enviarlas a un servidor, reduciendo el tráfico y cumpliendo requisitos de privacidad.
- Automatización de escritorio en macOS: el modelo puede integrarse en herramientas de captura de pantalla para identificar el color o el texto dominante de una ventana, aunque las tareas de localización espacial precisa (enumerar elementos, contar objetos) no son fiables con el build estándar.
- Prototipado e investigación en IA en el borde: sirve como banco de pruebas para evaluar pipelines multimodales completos (codificador visual + adaptador + LLM) en hardware de consumo, con un coste de almacenamiento mínimo y sin necesidad de GPU.
- Aplicaciones educativas interactivas: preguntas y respuestas sobre imágenes de libros de texto o diagramas simples, donde la precisión posicional no es crítica.

## Benchmarks y rendimiento

La model card incluye comprobaciones de calidad realizadas por el autor de la conversión, no benchmarks estándar de la comunidad:

| Configuración | Texto (8 preguntas) | Imagen (5 preguntas) |
|---|---|---|
| PyTorch bf16 (referencia) | No disponible | 5/5 |
| LiteRT int4-b32, CPU (recomendado) | 8/8 | 4/5 |
| LiteRT int8, CPU | 6/8 | 3/5 |

Las pruebas de imagen son cinco fixtures sintéticos deterministas: color dominante, OCR de texto grande, forma, conteo de tres cuadrados y palabra más grande. El build int4 falla solo la pregunta de forma. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: 0,41 GB para el archivo int4 y 0,56 GB para el int8, más el espacio de trabajo del runtime y la caché KV de hasta 4096 tokens.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU. En macOS y Android puede usar GPU vía OpenCL. En iOS, Metal falla al crear el motor para esta familia (incidencia LiteRT-LM#3129); se recomienda CPU.
- Cabe en cualquier GPU de consumo e incluso en dispositivos sin GPU dedicada, dado su tamaño inferior a 1 GB.
- Opciones de despliegue: runtime `litert-lm` (versión mínima verificada 0.19.0 para los archivos int4 e int8 estándar), CLI con soporte de `--attachment` para imágenes y `--cache no` para pruebas deterministas.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM2.5-VL-450M (LiteRT) | 450M | 4096 | `.litertlm` | LFM Open License v1.0 | Hugging Face (litert-community) |
| LFM2.5-VL-3B (LiteRT) | 3B (aproximado) | No disponible | `.litertlm` | LFM Open License v1.0 | Hugging Face (litert-community) |
| LFM2.5-VL-450M (base) | 450M | No disponible | PyTorch/safetensors | LFM Open License v1.0 | Hugging Face (LiquidAI) |

La comparativa se limita a la propia familia LFM2.5-VL porque la información proporcionada no incluye datos de otros modelos comparables de la misma categoría (VLM de menos de 1B parámetros para dispositivo). El modelo de 3B de la misma familia ofrece mayor capacidad de grounding espacial (puntuación 1/10 frente a 0/10 del archivo estándar en la prueba de captura de pantalla de LiteRT-LM#3246), según la model card.

## Limitaciones y advertencias

- Defecto conocido del runtime: en `litert-lm` 0.16.0 y en `main`, solo el cuarto superior de la imagen llega al modelo, lo que provoca respuestas posicionales incorrectas (localizar, contar, enumerar, "cuál está abajo") sin error visible. Afecta a todos los archivos LFM2.5-VL por una suposición de factor de reducción en la ruta de visión del runtime (LiteRT-LM#3246).
- El build `LFM2.5-VL-450M_int4_fixB.litertlm` corrige la visibilidad del área completa en las versiones 0.16.1 y 0.17.0, pero no restaura el grounding por coordenadas, que sigue siendo una capacidad del modelo de 3B.
- Contexto limitado a 4096 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Una sola imagen por prompt.
- Modelo no-thinking: no dispone de modo de razonamiento extendido.
- Riesgo de alucinación inherente a modelos de 450M; las respuestas de texto pueden ser plausibles pero incorrectas, especialmente en dominios especializados.
- Idiomas soportados no documentados; no se garantiza un rendimiento multilingüe equilibrado.
- Licencia LFM Open License v1.0: es necesario revisar sus términos para uso comercial, ya que no es una licencia de código abierto estándar (OSI).
- En iOS, la ruta Metal no funciona para esta familia; es obligatorio usar CPU.
- El tamaño del repositorio (4,1 GB) incluye múltiples variantes del archivo, no un único peso.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/litert-community/LFM2.5-VL-450M
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-VL-450M
- Modelo hermano de 3B: https://huggingface.co/litert-community/LFM2.5-VL-3B
- Runtime LiteRT-LM: https://github.com/google-ai-edge/litert-lm
- Incidencia del defecto de visión: https://github.com/google-ai-edge/LiteRT-LM/issues/3246
- Incidencia de Metal en iOS: https://github.com/google-ai-edge/LiteRT-LM/issues/3129
- Script de reexportación de visión: https://github.com/john-rocky/LiteRT-Models/blob/screen-agent/screen-agent/tools/reexport_vision_unshuffle.py
- Script de reempaquetado: https://github.com/john-rocky/LiteRT-Models/blob/screen-agent/screen-agent/tools/repack_vision.py
- Benchmark de referencia en Android: https://github.com/john-rocky/apple-silicon-llm-bench/blob/main/results/android/tinyhybridnet-three-runtimes.md
