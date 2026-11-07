# litert-community/LFM2.5-VL-3B

## Resumen

LFM2.5-VL-3B es un modelo visión-lenguaje (VLM) de 3.000 millones de parámetros desarrollado originalmente por Liquid AI y convertido al formato LiteRT-LM (`.litertlm`) por la comunidad `litert-community` para su ejecución en dispositivo (on-device). El modelo combina un backbone de texto híbrido de Liquid AI con una torre de visión SigLIP2, y esta conversión concreta permite ejecutar tanto texto como imagen de extremo a extremo con el runtime pip `litert-lm` de Google, sin necesidad de infraestructura de servidor.

La relevancia de esta ficha radica en que se trata, según sus autores, de la primera conversión de LFM2.5-VL a formato LiteRT, lo que habilita inferencia local en dispositivos móviles (Android, iOS, macOS) con cuantizaciones int8 e int4. El repositorio incluye tres variantes de pesos (int8 de 3,55 GB, int4 de 2,35 GB y una variante int4 corregida) y documenta mediciones reales de rendimiento en un Galaxy S26.

Es importante señalar que la versión publicada del runtime (0.16.0) presenta un fallo conocido en la ruta de visión que hace que solo el cuarto superior de la imagen llegue al modelo, lo que invalida cualquier pregunta posicional (localizar, contar, enumerar). El repositorio ofrece una compilación int4 reparada (`int4_fixB`) que corrige este comportamiento en las versiones 0.16.1 y 0.17.0 del runtime.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida: 22 bloques de convolución corta con compuertas (gated short-convolution) + 8 capas de atención con consultas agrupadas (GQA); torre de visión SigLIP2 de 27 capas con hidden 1152 y proyector pixel-unshuffle |
| Parámetros totales | 3B (aproximadamente 3.000 millones) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 4096 tokens máximos de KV cache en el runtime LiteRT-LM |
| Tipos de cuantización | int8 dinámica (lineales de texto, convoluciones, embedding y torre de visión); int4 blockwise-32 OCTAV en lineales de texto con embedding y lm_head en int8 y torre de visión en int8 |
| Idiomas soportados | No disponible |
| Licencia | LFM Open License v1.0 (`license: other`) |
| Formato de pesos | `.litertlm` (LiteRT-LM); modelo base en safetensors en LiquidAI/LFM2.5-VL-3B |

## Arquitectura y entrenamiento

El backbone de texto es un transformer híbrido que alterna 22 bloques de convolución corta con compuertas y 8 capas de atención con consultas agrupadas (GQA), con un vocabulario de 128.000 tokens. Esta combinación busca reducir el coste computacional de la atención en contextos largos manteniendo la capacidad de modelado de dependencias globales. La torre de visión es SigLIP2, con 27 capas y dimensión oculta de 1152, conectada al backbone mediante un proyector que aplica un pixel-unshuffle 2×2.

En el runtime LiteRT-LM, una imagen se procesa a 512×512 píxeles y se convierte en 256 tokens suaves, con una sola imagen por prompt (el runtime redimensiona automáticamente). El template es de estilo ChatML y los marcadores de posición de imagen los inserta el procesador de datos LFM2 del runtime; se trata de un modelo no-thinking. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada.

La innovación técnica destacable de esta conversión es el proceso de exportación a LiteRT: el modelo PyTorch se convierte sin modificaciones con `litert_torch.convert`, y según la documentación del repositorio, una conversión de referencia coincidió con el original con un error de 4e-7 en un Galaxy S26 (LiteRT 2.2.0, Android 16, 2026-09-05).

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno, con un gate de 8 preguntas de texto que el modelo supera en 7/8 tanto en bf16 como en las variantes LiteRT int8 e int4.
- Comprensión de imágenes: descripción de imágenes (captioning), identificación de color dominante, OCR de texto grande, reconocimiento de formas y conteo simple de objetos.
- Procesamiento de una imagen por prompt, redimensionada internamente a 512×512 y convertida en 256 tokens.
- Soporte de adjuntos PNG y JPEG mediante el flag `--attachment` del CLI de `litert-lm`.
- Ejecución en CPU y en GPU con `litert-lm` ≥ 0.16.0 (macOS verificado por generación; Android OpenCL verificado en Pixel 8a y Galaxy S26).
- Modelo no-thinking: no dispone de modo de razonamiento extendido.
- No se documenta soporte de tool calling, function calling ni capacidades de agente multi-paso en la información disponible.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Asistencia visual en aplicaciones móviles Android: integración del bundle int4 (2,35 GB) en una app mediante `com.google.ai.edge.litert:litert`, permitiendo describir fotos o leer texto grande sin conexión a red, con un decode medido de 20,1 tok/s en GPU de Galaxy S26.
- OCR de texto dominante en capturas de pantalla: el modelo identifica correctamente texto grande en imágenes sintéticas (5/5 en el gate de visión), adecuado para extraer titulares o etiquetas de gran tamaño en un dispositivo.
- Clasificación rápida de imágenes por color o forma: útil en aplicaciones de accesibilidad que describan el color dominante o la forma de un objeto a usuarios con discapacidad visual, con respuestas verificadas idénticas al modelo bf16 de referencia.
- Procesamiento de documentos en el borde (edge): lectura de carteles, señales o etiquetas con texto grande en escenarios sin conectividad, usando la variante int8 (3,55 GB) en CPU con un TTFT de 790 ms.
- Moderación o etiquetado automático de imágenes en el dispositivo: el modelo puede generar una descripción breve de una imagen antes de enviarla a un servicio remoto, reduciendo el ancho de banda y preservando la privacidad.
- Prototipado e investigación en visión-lenguaje sobre hardware móvil: el repositorio sirve como referencia para medir latencia, throughput y calidad de cuantización en dispositivos reales, con datos publicados de Galaxy S26 (decode 20,1 tok/s GPU, 19,9 tok/s CPU; prefill 744 tok/s GPU, 277 tok/s CPU).
- Evaluación de pipelines de conversión PyTorch a LiteRT: los scripts de reexportación de visión (`reexport_vision_unshuffle.py`, `repack_vision.py`) son un ejemplo práctico de cómo corregir grafos de visión en el proceso de conversión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Los únicos datos de calidad son los gates internos del repositorio:

| Configuración | Texto (8 preguntas) | Imagen (5 preguntas) |
|---|---|---|
| PyTorch bf16 (referencia) | 7/8 | 5/5 |
| LiteRT int8, CPU | 7/8 | 5/5 |
| LiteRT int8, GPU (macOS) | 7/8 | 5/5 |
| LiteRT int4-b32, CPU | 7/8 | 5/5 |
| LiteRT int4-b32, GPU (macOS) | 7/8 | 5/5 |

Las cinco respuestas de imagen de ambas variantes LiteRT son idénticas literalmente a la referencia bf16 en ambos backends ("Red.", "Hello.", "Circle.", "Three.", "CAT."). El único fallo de texto corresponde a una tarea de completar rimas.

Rendimiento en dispositivo (Galaxy S26, LiteRT-LM 0.16.0):

| Backend | Decode | Prefill | TTFT |
|---|---|---|---|
| GPU | 20,1 tok/s | 744 tok/s | 330 ms |
| CPU | 19,9 tok/s | 277 tok/s | 790 ms |

En GPU, las 937 operaciones del modelo se delegaron correctamente (medición de 2026-08-24). En CPU, la medición es de 2026-09-05.

## Requisitos de hardware

- VRAM/almacenamiento: la variante int8 ocupa 3,55 GB y la int4 2,35 GB en disco; en ejecución en dispositivo se comparte memoria con el sistema, por lo que se recomienda al menos 4 GB de RAM libre para int8 y 3 GB para int4.
- GPU recomendadas: no se especifican modelos de GPU de escritorio; las mediciones se realizan en GPU integrada de Galaxy S26 (Android OpenCL) y macOS. Para servidor no se documentan requisitos.
- Compatibilidad con GPU de consumo: no disponible en la información proporcionada; el enfoque del repositorio es on-device, no inferencia en RTX 4090 o similares.
- Opciones de despliegue: runtime `litert-lm` (pip, versión 0.16.0 o superior) con CLI `litert-lm run`; backend CPU y GPU. En iOS, Metal falla al crear el motor para esta familia (issue LiteRT-LM#3129), por lo que debe usarse CPU.
- Latencia y throughput: ver tabla de benchmarks; decode de aproximadamente 20 tok/s y TTFT de 330 ms en GPU de Galaxy S26.
- Contexto máximo de KV cache: 4096 tokens, lo que limita conversaciones largas y prompts con mucho texto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| litert-community/LFM2.5-VL-3B | 3B | 4096 (KV cache en runtime) | `.litertlm` | LFM Open License v1.0 | Hugging Face, 919 descargas |
| LiquidAI/LFM2.5-VL-3B | 3B | No disponible | Safetensors (modelo base) | LFM Open License v1.0 | Hugging Face |
| litert-community/Qwen3-4B | 4B | No disponible | `.litertlm` | No disponible | Hugging Face (familia Qwen en LiteRT) |

La comparación con modelos de la misma categoría (VLM de 3B para edge) no está disponible en la información proporcionada. El modelo base LiquidAI/LFM2.5-VL-3B es la referencia directa, y la familia Qwen en LiteRT se menciona como alternativa textual, no visión-lenguaje.

## Limitaciones y advertencias

- Fallo conocido en la ruta de visión del runtime 0.16.0: solo el cuarto superior de la imagen llega al modelo, por lo que las preguntas posicionales (localizar, contar, enumerar, "cuál está abajo") devuelven respuestas incorrectas sin error y con salida bien formada. Afecta a todos los bundles LFM2.5-VL, no solo a este.
- La compilación `int4_fixB` corrige el problema en `litert-lm` 0.16.1 y 0.17.0 (16/16 bandas en la prueba de regla; 10/10 en la captura de pantalla del issue #3246 frente a 2/10 del archivo original), pero los archivos originales siguen publicados por si el runtime se corrige.
- Contexto limitado a 4096 tokens de KV cache, insuficiente para documentos largos o conversaciones extensas.
- Una sola imagen por prompt; no admite múltiples imágenes en la misma petición.
- Modelo no-thinking: no dispone de razonamiento extendido ni de cadena de pensamiento explícita.
- En iOS, el backend Metal falla al crear el motor; debe usarse CPU.
- Riesgo de alucinación inherente a los modelos de 3B, especialmente en tareas de conteo u OCR con texto pequeño; el gate de visión solo cubre cinco fixtures sintéticos deterministas.
- Licencia LFM Open License v1.0: es necesario revisar los términos exactos para uso comercial, ya que se trata de una licencia "other" y no de una licencia permisiva estándar.
- No se documentan sesgos conocidos ni composición del dataset de entrenamiento, lo que dificulta evaluar riesgos de sesgo.
- Idiomas soportados no disponibles: no se puede garantizar un rendimiento multilingüe fuera del inglés, dado que las pruebas del repositorio están en inglés.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/LFM2.5-VL-3B
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-VL-3B
- Organización LiteRT Community: https://huggingface.co/litert-community
- Runtime LiteRT-LM: https://github.com/google-ai-edge/litert-lm
- Issue del fallo de visión: https://github.com/google-ai-edge/LiteRT-LM/issues/3246
- Issue de fallo en Metal/iOS: https://github.com/google-ai-edge/LiteRT-LM/issues/3129
- Ficha de rendimiento en dispositivo: https://github.com/john-rocky/edge-compat/blob/main/cards/lfm2.5-vl-3b-int8/CARD.md
- Script de reexportación de visión: https://github.com/john-rocky/LiteRT-Models/blob/screen-agent/screen-agent/tools/reexport_vision_unshuffle.py
- Script de reempaquetado: https://github.com/john-rocky/LiteRT-Models/blob/screen-agent/screen-agent/tools/repack_vision.py
- Benchmark de runtimes en Android: https://github.com/john-rocky/apple-silicon-llm-bench/blob/main/results/android/tinyhybridnet-three-runtimes.md
