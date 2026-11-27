# litert-community/LFM2.5-VL-1.6B

## Resumen

LFM2.5-VL-1.6B es un modelo de vision-lenguaje (VLM) desarrollado por LiquidAI y convertido al formato LiteRT-LM por la comunidad `litert-community` para su ejecución en dispositivos (on-device). Combina un backbone de texto híbrido LFM2 con una torre de visión SigLIP2, ofreciendo capacidades de image-text-to-text en un paquete optimizado para edge computing mediante el runtime LiteRT de Google (el nuevo nombre de TensorFlow Lite).

El modelo se sitúa en el punto medio de la familia LFM2.5-VL, entre las variantes de 450M y 3B parámetros. Su relevancia radica en que permite ejecutar inferencia multimodal completa (texto e imagen) en hardware móvil y de consumo, con pesos cuantizados que reducen el tamaño a 1,30 GB en int4, validado en dispositivos como el Pixel 8a con Android 16.

La conversión a `.litertlm` incluye el codificador de visión, el adaptador de visión y los metadatos de marcadores de posición de imagen, lo que permite su uso directo mediante el runtime `litert-lm` con soporte de adjuntos de imagen. No obstante, existe un problema conocido en el runtime publicado (versión 0.16.0) que afecta a la percepción posicional de la imagen, para el cual se distribuye una compilación reparada en el mismo repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: backbone de texto LFM2 (16 capas: convoluciones cortas con compuerta + atención con consultas agrupadas) + torre de visión SigLIP2 (27 capas, hidden 1152) |
| Parametros totales | 1.6B (aproximado, según denominación del modelo) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4096 tokens (caché KV máxima) |
| Tipos de cuantizacion | int8 dinámica; int4 blockwise-32 OCTAV (lineales de texto) con embedding y lm_head en int8, torre de visión en int8 |
| Idiomas soportados | No disponible |
| Licencia | LFM Open License v1.0 (licencia "other" en Hugging Face) |
| Formato de pesos | `.litertlm` (LiteRT-LM) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura híbrida que combina un backbone de texto LFM2 con 16 capas que alternan convoluciones cortas con compuerta (gated short-convolutions) y atención con consultas agrupadas (grouped-query attention), con dimensión oculta de 2048 y vocabulario de 64k tokens. La torre de visión es un SigLIP2 de 27 capas con dimensión oculta 1152, la misma que utiliza la variante de 3B de la familia. Cada imagen se procesa a 512×512 píxeles y se convierte en 256 tokens suaves (soft tokens), con soporte de una sola imagen por prompt; el runtime realiza el redimensionado automáticamente.

Un detalle arquitectónico relevante es que la familia LFM2.5-VL realiza el desagrupado de píxeles (pixel-unshuffle) 2×2 dentro del adaptador de visión en lugar de en el codificador, lo que ha causado incompatibilidades con las suposiciones del runtime LiteRT-LM. La conversión mantiene los pesos de texto, el tokenizador y los metadatos sin cambios, y utiliza una plantilla ChatML-style con marcadores de posición de imagen insertados por el procesador de datos LFM2 del runtime. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada.

## Capacidades

- Generación de texto y razonamiento conversacional de un turno verificado en pruebas de calidad (8/8 preguntas en todas las configuraciones).
- Comprensión de imágenes: descripción de imágenes (captioning), preguntas sobre colores dominantes, OCR de texto grande y identificación de la palabra más grande.
- Respuesta a preguntas geométricas básicas: identificación de esquinas donde se sitúa un objeto, detección de rayas horizontales frente a verticales.
- Procesamiento de una imagen por prompt con redimensionado automático a 512×512 y conversión a 256 tokens.
- Soporte de entrada de imágenes en formato PNG y JPEG mediante el mecanismo `--attachment` del runtime.
- Ejecución en CPU y GPU (OpenCL en macOS y Android) con `litert-lm` ≥ 0.16.0; en iOS se requiere CPU debido a un fallo conocido en Metal.
- Modelo no-thinking (sin modo de razonamiento extendido).
- Capacidades multilingües: no disponible en la información proporcionada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Asistencia visual en dispositivos móviles: el modelo puede procesar una imagen capturada por la cámara del teléfono y responder preguntas sobre ella (color dominante, texto visible, objeto principal) directamente en el dispositivo, sin enviar datos a la nube, gracias a su tamaño de 1,30 GB en int4 y su ejecución validada en Pixel 8a.

- OCR de texto grande en entornos sin conectividad: adecuado para digitalizar carteles, etiquetas o documentos con texto de gran tamaño en aplicaciones de campo, ya que las pruebas de calidad confirman respuestas correctas en OCR de texto grande tanto en int4 como en int8.

- Accesibilidad para personas con discapacidad visual: descripción de imágenes en tiempo real desde la cámara del dispositivo, con inferencia local que preserva la privacidad y evita la latencia de red; la ventana de contexto de 4096 tokens permite mantener conversaciones multi-turno breves sobre la imagen.

- Clasificación y verificación visual en aplicaciones de inventario: identificación de colores dominantes y formas en fotografías de productos, con la advertencia de que las preguntas de conteo fino y localización posicional no son fiables en la versión estándar del runtime (deben usarse la compilación reparada `fixB` o la variante de 3B para tareas de grounding).

- Prototipado de aplicaciones multimodales en Android: integración mediante la librería `com.google.ai.edge.litert:litert` para desarrolladores que necesitan validar flujos image-text-to-text en hardware real antes de escalar a modelos mayores, con la ventaja de que el archivo incluye plantilla y metadatos listos para usar.

- Análisis de documentos simples en el edge: extracción de información de capturas de pantalla o fotografías de documentos con texto prominente, ejecutando el codificador de visión en CPU y el modelo de lenguaje en GPU para optimizar el rendimiento en dispositivos con recursos limitados.

- Educación y demostraciones técnicas: uso como modelo de referencia para comparar el rendimiento de conversiones LiteRT frente a PyTorch bf16, con resultados verificados de 8/8 en texto y 3/5 en imagen en las pruebas de sanity check publicadas.

## Benchmarks y rendimiento

Los datos disponibles corresponden a pruebas de sanity check internas del conversor, no a benchmarks estándar de la literatura (MMLU, HumanEval, GSM8K, etc.).

| Configuración | Texto (8 preguntas) | Imagen (5 preguntas) |
|---|---|---|
| PyTorch bf16 (referencia) | No disponible | 5/5 |
| LiteRT int4-b32 (CPU y GPU) | 8/8 | 3/5 |
| LiteRT int8 (CPU y GPU) | 8/8 | 3/5 |

Las pruebas de imagen cubren color dominante, OCR de texto grande, forma, conteo de tres cuadrados y palabra más grande. Las respuestas correctas en imagen se limitan a color, OCR de texto grande y palabra más grande; las preguntas de forma fina y conteo no se responden correctamente. Adicionalmente, se documenta una prueba de regresión con una imagen de 512×512 con 16 bandas numeradas: la versión estándar en `litert-lm` 0.16.0 produce un conteo descontrolado que no se detiene en 16, mientras que la compilación reparada `fixB` devuelve correctamente la secuencia 1 a 16 en las versiones 0.16.1 y 0.17.0 del runtime.

## Requisitos de hardware

- VRAM estimada: no aplica en el sentido tradicional; el modelo está diseñado para memoria unificada de dispositivos móviles. Tamaño en disco: 1,30 GB (int4) y 1,81 GB (int8).
- GPU recomendadas: no se especifican modelos de GPU de escritorio; la validación se realizó en Pixel 8a (Android 16) con GPU mediante OpenCL.
- Compatibilidad con GPU de consumo: no disponible; el enfoque es edge/móvil, no estaciones de trabajo con RTX 4090 o similares.
- Backends soportados: CPU y GPU con `litert-lm` ≥ 0.16.0 (OpenCL en macOS y Android medidos); en iOS, Metal falla en la creación del motor (issue LiteRT-LM#3129), por lo que se debe usar CPU.
- Opciones de despliegue: runtime `litert-lm` (versión 0.16.0 o superior; reparación validada en 0.16.1 y 0.17.0), librería Android `com.google.ai.edge.litert:litert`, conversor `litert-torch` (antes `ai-edge-torch`).
- Latencia y throughput: no disponibles en la información proporcionada.
- Contexto máximo de caché KV: 4096 tokens.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Entrada de imagen | Licencia | Formato |
|---|---|---|---|---|---|
| LFM2.5-VL-1.6B (LiteRT) | 1.6B | 4096 | 1 imagen, 512×512 → 256 tokens | LFM Open License v1.0 | `.litertlm` |
| LFM2.5-VL-450M (LiteRT) | 450M (aprox.) | No disponible | No disponible | LFM Open License v1.0 (presumible) | `.litertlm` |
| LFM2.5-VL-3B (LiteRT) | 3B (aprox.) | No disponible | No disponible | LFM Open License v1.0 (presumible) | `.litertlm` |

La variante de 3B de la misma familia utiliza la misma torre de visión SigLIP2 y, según la model card, conserva la capacidad de grounding por coordenadas que la variante de 1.6B no posee. Los datos de rendimiento comparativo entre las tres variantes no están disponibles en la información proporcionada. No se dispone de comparaciones con modelos de otros fabricantes en la documentación consultada.

## Limitaciones y advertencias

- Problema conocido de percepción posicional: en `litert-lm` 0.16.0 y en `main`, solo el cuarto superior de la imagen llega al modelo. Las tareas de localización, conteo y enumeración posicional devuelven resultados incorrectos sin generar errores, con salidas bien formadas pero falsas. Afecta a todos los archivos LFM2.5-VL por el desagrupado 2×2 en el adaptador en lugar del codificador (issue LiteRT-LM#3246).
- La compilación reparada `LFM2.5-VL-1.6B_int4_fixB.litertlm` restaura el área visible de la imagen, pero no la capacidad de grounding por coordenadas, que sigue siendo exclusiva de la variante de 3B.
- En iOS, el backend Metal falla en la creación del motor; es necesario usar CPU (issue LiteRT-LM#3129).
- Una sola imagen por prompt; no se soportan múltiples imágenes en una misma consulta.
- Ventana de contexto limitada a 4096 tokens de caché KV, insuficiente para documentos largos o conversaciones extensas.
- Las pruebas de imagen muestran solo 3/5 respuestas correctas en las configuraciones int4 e int8; las preguntas de forma fina y conteo no son fiables.
- Modelo no-thinking: no dispone de modo de razonamiento extendido.
- Idiomas soportados no documentados; riesgo de rendimiento desigual en castellano u otros idiomas distintos del inglés.
- Licencia LFM Open License v1.0: es necesario revisar los términos del archivo LICENSE del repositorio para uso comercial, ya que la licencia se clasifica como "other" y no como una licencia permisiva estándar.
- No se han documentado sesgos específicos ni tasas de alucinación en la información proporcionada; como todo VLM de pequeño tamaño, existe riesgo de descripciones plausibles pero incorrectas.
- El repositorio ocupa 7,5 GB e incluye múltiples variantes (int8, int4, int4_fixB); es necesario seleccionar el archivo adecuado según el runtime y la tarea.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/LFM2.5-VL-1.6B
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-VL-1.6B
- Variante 450M: https://huggingface.co/litert-community/LFM2.5-VL-450M
- Variante 3B: https://huggingface.co/litert-community/LFM2.5-VL-3B
- Runtime LiteRT-LM: https://github.com/google-ai-edge/litert-lm
- Issue LiteRT-LM#3246 (desagrupado de píxeles): https://github.com/google-ai-edge/LiteRT-LM/issues/3246
- Issue LiteRT-LM#3129 (fallo de Metal en iOS): https://github.com/google-ai-edge/LiteRT-LM/issues/3129
- Script de reexportación de visión: https://github.com/john-rocky/LiteRT-Models/blob/screen-agent/screen-agent/tools/reexport_vision_unshuffle.py
- Script de reempaquetado de visión: https://github.com/john-rocky/LiteRT-Models/blob/screen-agent/screen-agent/tools/repack_vision.py
- Benchmark de runtimes en Android: https://github.com/john-rocky/apple-silicon-llm-bench/blob/main/results/android/tinyhybridnet-three-runtimes.md
