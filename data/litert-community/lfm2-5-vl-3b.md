# litert-community/LFM2.5-VL-3B

## Resumen

LFM2.5-VL-3B es un modelo de visión y lenguaje (VLM) desarrollado por Liquid AI, distribuido originalmente en formato PyTorch. La versión aquí descrita es la conversión realizada por la comunidad `litert-community` al formato LiteRT-LM (`.litertlm`), el runtime on-device de Google (sucesor de TensorFlow Lite) orientado a inferencia en dispositivos edge como smartphones Android, macOS e iOS.

El modelo combina un backbone de texto híbrido propio de la familia LFM2 —22 bloques de convolución corta con compuertas (gated short-convolution) más 8 capas de atención con grouped-query attention, con un vocabulario de 128k tokens— con una torre de visión SigLIP2 de 27 capas y dimensión oculta 1152, unida mediante un proyector con pixel-unshuffle. Con 3B parámetros, está pensado para ejecutarse en hardware móvil con cuantización int8 o int4, manteniendo capacidades de captioning, OCR, respuesta sobre imágenes y generación de texto.

Su relevancia actual radica en que demuestra un pipeline completo de VLM en un runtime de producción para móvil: el archivo incluye el encoder de visión, el adaptador y los metadatos de placeholders de imagen, de modo que una sola llamada (`litert-lm run ... --attachment foto.png`) procesa texto e imagen de extremo a extremo. No obstante, la propia model card documenta un fallo grave en el runtime publicado que afecta a la percepción posicional de la imagen (ver limitaciones).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida: 22 bloques de convolución corta con compuertas + 8 capas de atención GQA (backbone de texto) + torre de visión SigLIP2 (27 capas, hidden 1152) con proyector pixel-unshuffle |
| Parámetros totales | 3B (aproximado, según denominación del modelo; no se detalla desglose) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens máximo (KV cache) |
| Tipos de cuantización | int8 dinámica; int4 blockwise-32 (lineales OCTAV) con embedding y lm_head en int8; torre de visión en int8 |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (categoría "other") |
| Formato de pesos | `.litertlm` (LiteRT-LM); modelo base original en PyTorch (formato no especificado en la información disponible) |

## Arquitectura y entrenamiento

El backbone de texto es una arquitectura híbrida que alterna bloques de convolución corta con compuertas (similares a las propuestas en modelos tipo Liquid) con capas de atención con grouped-query attention, una combinación que reduce el coste computacional y de memoria frente a un transformer puro, algo crítico en despliegue móvil. El vocabulario es de 128k tokens. La parte visual emplea una torre SigLIP2 de 27 capas con dimensión oculta 1152; la conexión entre visión y texto se realiza mediante un proyector que aplica un pixel-unshuffle 2×2, de forma que una imagen de 512×512 se comprime en 256 tokens suaves que se insertan en la secuencia de texto.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron etapas de RLHF o DPO en la información proporcionada. La model card de la conversión tampoco detalla innovaciones de decodificación (como decodificación especulativa) más allá de la propia arquitectura híbrida y del procesamiento de imagen en tokens reducidos.

## Capacidades

- Generación de texto e inferencia de lenguaje general sobre el backbone LFM2.
- Comprensión de imágenes: captioning, respuesta a preguntas sobre el contenido visual y OCR de texto grande y dominante.
- Preguntas sobre color dominante y formas en imágenes sintéticas o capturas.
- Procesamiento de una imagen por prompt, redimensionada automáticamente por el runtime a 512×512 y convertida en 256 tokens.
- Entrada de imágenes en PNG y JPEG mediante el flag `--attachment` del runtime.
- Plantilla de chat estilo ChatML incluida en el propio archivo, con placeholders de imagen insertados por el procesador de datos LFM2 del runtime.
- Modelo no-thinking: no dispone de modo de razonamiento extendido.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Asistente visual en aplicaciones Android: integrado mediante LiteRT-LM en una app móvil, el modelo puede describir una foto tomada por el usuario o responder preguntas sobre ella sin salir del dispositivo, con 2,35 GB en int4 y latencias de TTFT de 330 ms en GPU (Galaxy S26).
- OCR de texto dominante en capturas y documentos: útil para extraer texto de carteles, tickets o pantallas donde el texto ocupa una porción grande de la imagen, un escenario donde el fallo posicional documentado no afecta al resultado.
- Clasificación y descripción de color o forma dominante: adecuado para tareas de moderación de imágenes, etiquetado automático o filtros que solo necesitan identificar el sujeto principal de la imagen.
- Procesamiento de texto en el dispositivo: el backbone LFM2 permite resúmenes, respuestas y generación de texto con contexto de 4096 tokens, útil para asistentes offline que no pueden enviar datos a la nube por privacidad.
- Prototipado de pipelines VLM en edge: investigadores pueden validar el flujo completo imagen-texto en LiteRT-LM antes de portar a producción, usando el archivo int8 de 3,55 GB como referencia de calidad.
- Aplicaciones de accesibilidad: descripción de imágenes para usuarios con discapacidad visual en tiempo real en un smartphone, aprovechando el prefill de 744 tok/s en GPU del Galaxy S26.
- Evaluación comparativa de runtimes: dado que la model card documenta métricas por dispositivo y backend (CPU vs GPU, Android vs macOS), sirve como banco de pruebas para medir el rendimiento de LiteRT-LM frente a otras soluciones.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.). Sí incluye métricas de rendimiento en dispositivo y una comparación de calidad parcial:

| Configuración | Texto (8 preguntas) | Imagen (5 preguntas) |
|---|---|---|
| PyTorch bf16 (referencia) | no disponible (tabla truncada en la información) | no disponible (tabla truncada en la información) |
| int4 blockwise-32 (archivo int4 previo) | no disponible | no disponible |

Métricas de inferencia medidas en dispositivo:

| Dispositivo | Runtime | Backend | Decode | Prefill | TTFT |
|---|---|---|---|---|---|
| Galaxy S26 | LiteRT-LM 0.16.0 | GPU | 20,1 tok/s | 744 tok/s | 330 ms |
| Galaxy S26 | LiteRT-LM 0.16.0 | CPU | 19,9 tok/s | 277 tok/s | 790 ms |

En la prueba de GPU del Galaxy S26 se delegaron las 937 operaciones del grafo. No se han publicado resultados de benchmarks académicos en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: 3,55 GB para el archivo int8 y 2,35 GB para los archivos int4 (int4 stock y `int4_fixB`). El repositorio completo ocupa 16,5 GB.
- GPU recomendadas: no se especifican modelos de escritorio; las mediciones se realizan en GPU integrada de smartphone (Galaxy S26, Pixel 8a con OpenCL) y en macOS.
- Compatibilidad con GPU de consumo: el modelo está diseñado para ejecutarse en smartphones, por lo que cabe holgadamente en cualquier GPU de consumo moderna; sin embargo, no se proporcionan cifras para RTX 4090, A100 o H100.
- Backends soportados: CPU y GPU. GPU verificada en macOS y en Android con OpenCL (Pixel 8a y Galaxy S26). En iOS, Metal falla al crear el motor (issue LiteRT-LM#3129); se recomienda CPU en iOS.
- Runtime mínimo: `litert-lm` 0.16.0 para el archivo int8 y 0.19.0 para el int4.
- Opciones de despliegue: exclusivamente LiteRT-LM (`litert-lm` pip, CLI con `--attachment`); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 20,1 tok/s de decode y 744 tok/s de prefill en GPU de Galaxy S26; 19,9 tok/s y 277 tok/s en CPU del mismo dispositivo. TTFT de 330 ms (GPU) y 790 ms (CPU).

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. La model card únicamente referencia el modelo base PyTorch (`LiquidAI/LFM2.5-VL-3B`) como referencia de calidad, sin ofrecer comparaciones con otras familias de VLM de 3B parámetros ni con alternativas on-device.

| Modelo | Parámetros | Contexto | Licencia | Formato edge |
|---|---|---|---|---|
| LFM2.5-VL-3B (LiteRT-LM) | 3B | 4096 | LFM Open License v1.0 | `.litertlm` |
| LFM2.5-VL-3B (base) | 3B | no disponible | LFM Open License v1.0 | PyTorch |
| Otros VLM on-device | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Fallo posicional grave en el runtime publicado: en `litert-lm` 0.16.0 y en `main` actual, solo el cuarto superior de la imagen llega al modelo. Tareas de localización, conteo, enumeración o preguntas del tipo "cuál está abajo" devuelven resultados incorrectos sin error visible. Afecta a todos los archivos LFM2.5-VL, no solo a esta conversión, por una suposición de factor de reducción en la ruta de visión del runtime (issue LiteRT-LM#3246).
- Existe un archivo reparado, `LFM2.5-VL-3B_int4_fixB.litertlm`, con los grafos de visión reexportados para que el pixel-unshuffle ocurra dentro del encoder; devuelve las 16 bandas de la prueba de regla en 0.16.1 y 0.17.0, y 10/10 frente a 2/10 del archivo stock en la captura de pantalla del issue. Los archivos stock siguen publicados por si el runtime se corrige.
- Límite de una imagen por prompt y contexto máximo de 4096 tokens, lo que restringe conversaciones multi-turno largas y el análisis de múltiples imágenes.
- La imagen se procesa a 512×512, lo que limita la resolución efectiva para OCR de texto pequeño.
- En iOS, el backend Metal falla al crear el motor; hay que usar CPU.
- Modelo no-thinking: no dispone de modo de razonamiento extendido.
- Licencia LFM Open License v1.0: es necesario revisar sus términos para uso comercial, ya que no es una licencia de código abierto estándar (OSI).
- No se dispone de información sobre sesgos, riesgo de alucinación específico ni idiomas soportados; se recomienda validación empírica antes de producción.
- La calidad de la versión int4 no está cuantificada en la información disponible (la tabla de calidad está truncada).

## Enlaces

- Hugging Face (esta conversión): https://huggingface.co/litert-community/LFM2.5-VL-3B
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-VL-3B
- Runtime LiteRT-LM: https://github.com/google-ai-edge/litert-lm
- Issue del fallo posicional: https://github.com/google-ai-edge/LiteRT-LM/issues/3246
- Issue del fallo de Metal en iOS: https://github.com/google-ai-edge/LiteRT-LM/issues/3129
- Ficha de compatibilidad edge (mediciones): https://github.com/john-rocky/edge-compat/blob/main/cards/lfm2.5-vl-3b-int8/CARD.md
- Benchmark de runtimes en Apple Silicon: https://github.com/john-rocky/apple-silicon-llm-bench/blob/main/results/android/tinyhybridnet-three-runtimes.md
- Script de reexportación de visión: https://github.com/john-rocky/LiteRT-Models/blob/screen-agent/screen-agent/tools/reexport_vision_unshuffle.py
- Script de reempaquetado: https://github.com/john-rocky/LiteRT-Models/blob/screen-agent/screen-agent/tools/repack_vision.py
