# litert-community/LFM2.5-VL-3B

## Resumen

LFM2.5-VL-3B es un modelo de lenguaje y visión (VLM) de 3.000 millones de parámetros desarrollado por Liquid AI, distribuido en formato LiteRT-LM por la comunidad `litert-community` para inferencia en dispositivo (*on-device*). Combina un backbone de texto híbrido —22 bloques de convolución corta con compuertas y 8 capas de atención con consultas agrupadas— con una torre visual SigLIP2 de 27 capas y un proyector con *pixel-unshuffle*. El resultado es un modelo capaz de procesar texto e imágenes en el mismo *prompt*, pensado para ejecutarse en teléfonos y equipos de borde sin GPU dedicada.

La relevancia de esta conversión concreta radica en el formato: los ficheros `.litertlm` permiten ejecutar el modelo con el runtime LiteRT-LM de Google (sucesor de TensorFlow Lite) directamente en Android, macOS e iOS, con soporte de CPU y GPU. Los pesos se ofrecen en int8 (3,55 GB) e int4 (2,35 GB), lo que hace viable su despliegue en dispositivos con memoria limitada. La ventana de contexto del runtime está limitada a 4096 tokens de caché KV y admite una sola imagen por *prompt*, redimensionada a 512×512 y convertida en 256 tokens visuales.

Es importante señalar que la model card documenta un fallo conocido en el runtime publicado: en LiteRT-LM 0.16.0 solo la cuarta parte superior de la imagen llega al modelo, lo que invalida cualquier tarea posicional (localizar, contar, enumerar). El repositorio incluye una compilación corregida (`LFM2.5-VL-3B_int4_fixB.litertlm`) que reexporta los grafos de visión con el *unshuffle* dentro del codificador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 22 bloques de convolución corta con compuertas + 8 capas de atención con consultas agrupadas (GQA); torre visual SigLIP2 (27 capas, oculta 1152) con proyector *pixel-unshuffle* |
| Parametros totales | 3.000 millones (aproximado, según denominación del modelo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens de caché KV en el runtime LiteRT-LM |
| Tipos de cuantizacion | int8 dinámica (lineales de texto, convoluciones, embedding y torre visual); int4 blockwise-32 OCTAV en lineales de texto con embedding y lm_head en int8 y torre visual en int8 |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (`lfm-open-license-v1.0`) |
| Formato de pesos | `.litertlm` (LiteRT-LM); el modelo base en PyTorch está en LiquidAI/LFM2.5-VL-3B |
| Vocabulario | 128.000 tokens |
| Entrada de imagen | 1 imagen por *prompt*, redimensionada a 512×512, 256 tokens suaves; PNG/JPEG vía `--attachment` |
| Backends | CPU y GPU (macOS verificado; Android OpenCL verificado en Pixel 8a y Galaxy S26; iOS Metal falla en la creación del motor, usar CPU) |
| Runtime mínimo verificado | litert-lm 0.16.0 (int8); 0.19.0 (int4) |
| Plantilla de chat | Incluida en el fichero, estilo ChatML; marcadores de imagen insertados por el procesador de datos LFM2 del runtime (modelo sin modo *thinking*) |
| Tamano del repositorio | 16,5 GB |

## Arquitectura y entrenamiento

El backbone de texto sigue un diseño híbrido poco habitual: la mayor parte de las capas son convoluciones cortas con compuertas en lugar de atención completa, y solo 8 de las 30 capas emplean atención con consultas agrupadas. Este reparto reduce el coste computacional y la memoria de activaciones, lo que explica que el modelo alcance velocidades de decodificación cercanas a 20 tok/s en un teléfono. El vocabulario es de 128.000 tokens. La torre visual es un SigLIP2 de 27 capas con dimensión oculta 1152, conectado al backbone mediante un proyector que aplica *pixel-unshuffle* 2×2. Este detalle arquitectónico es la causa del fallo del runtime: la familia LFM2.5-VL realiza el *unshuffle* en el adaptador y no en el codificador, mientras que LiteRT-LM asume lo contrario.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del corpus, ni si se aplicaron técnicas de RLHF o DPO. La model card de esta conversión no documenta el proceso de entrenamiento del modelo base; esa información correspondería a la ficha original de LiquidAI, que no se ha proporcionado. La conversión a LiteRT-LM se realizó con `litert_torch.convert` sin modificar el modelo, y la model card afirma que una conversión de referencia coincidió con el original hasta 4e-7 en un Galaxy S26.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno, con plantilla ChatML incluida en el fichero.
- Comprensión de imágenes: descripción (*captioning*), preguntas sobre color dominante, OCR de texto grande y reconocimiento de formas.
- Procesamiento conjunto de texto e imagen en un mismo *prompt*, con una imagen por consulta.
- Ejecución en dispositivo con delegación completa de operaciones: 937 operaciones delegadas en la medición con GPU del Galaxy S26.
- Inferencia en CPU y GPU en Android (OpenCL) y macOS; en iOS solo CPU.
- No se documenta soporte de *tool calling*, *function calling*, agentes multi-paso, audio ni modo *thinking*. La model card indica explícitamente que es un modelo sin modo de razonamiento extendido.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Descripción de imágenes en aplicaciones móviles: el modelo cabe en 2,35 GB en int4 y procesa una imagen de 512×512 en 256 tokens, lo que permite generar pies de foto o descripciones automáticas en un teléfono Android sin conexión a la nube.
- OCR de texto dominante en capturas y documentos: la model card verifica OCR de texto grande en fixtures sintéticos; es adecuado para digitalizar carteles, recibos o pantallas donde el texto ocupa una porción relevante de la imagen.
- Clasificación visual por color o forma: útil en aplicaciones de accesibilidad que describan el color dominante de un objeto o identifiquen formas geométricas simples.
- Asistente conversacional local con contexto visual: con 4096 tokens de caché KV, puede mantener diálogos multi-turno donde el usuario adjunta una imagen y formula preguntas de seguimiento sobre ella.
- Prototipado e investigación en IA de borde: sirve como banco de pruebas para evaluar el runtime LiteRT-LM, la delegación de operaciones en GPU móvil y el rendimiento de arquitecturas híbridas convolución-atención en hardware limitado.
- Aplicaciones de privacidad estricta: al ejecutarse íntegramente en el dispositivo, las imágenes y el texto no salen del terminal, lo que encaja en escenarios sanitarios, industriales o de consumo donde no se permite el envío a servidores externos.
- Verificación de calidad de conversiones: el repositorio incluye fixtures deterministas (color, OCR, forma, conteo, palabra más grande) que permiten validar una conversión o un runtime antes de desplegarlo en producción.

## Benchmarks y rendimiento

La model card proporciona mediciones de velocidad en dispositivo, no resultados de benchmarks académicos (MMLU, HumanEval, GSM8K). Se reproducen los datos disponibles:

| Configuracion | Decode (tok/s) | Prefill (tok/s) | TTFT (ms) | Fecha |
|---|---|---|---|---|
| Galaxy S26 · LiteRT-LM 0.16.0 · GPU | 20,1 | 744 | 330 | 2026-08-24 |
| Galaxy S26 · LiteRT-LM 0.16.0 · CPU | 19,9 | 277 | 790 | 2026-09-05 |

La model card menciona además una tabla de calidad con comprobaciones de texto (8 preguntas) e imagen (5 preguntas) comparando PyTorch bf16 de referencia con las versiones int4, pero el contenido de esa tabla está truncado en la información disponible, por lo que no se pueden reproducir los valores.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, MMMU) en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: 3,55 GB para el fichero int8 y 2,35 GB para el int4 (tamaño en disco de los `.litertlm`); la memoria en ejecución debe acomodar además la caché KV de hasta 4096 tokens y los 256 tokens visuales.
- GPU recomendadas: no aplica en el sentido de GPU de servidor; el modelo está diseñado para GPU integradas móviles (OpenCL en Android) y Apple Silicon en macOS.
- Compatibilidad con GPU de consumo: no se documenta soporte para A100, H100 ni RTX 4090; el runtime objetivo es LiteRT-LM en dispositivos de borde.
- Dispositivos verificados: Galaxy S26 (CPU y GPU), Pixel 8a (GPU OpenCL), macOS (generación verificada). En iOS, Metal falla en la creación del motor (LiteRT-LM#3129); usar CPU.
- Opciones de despliegue: runtime `litert-lm` (pip), con `litert-lm run … --attachment photo.png` para entrada de imagen. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: TTFT de 330 ms en GPU y 790 ms en CPU del Galaxy S26; prefill de 744 tok/s (GPU) y 277 tok/s (CPU); decodificación de ~20 tok/s en ambos backends.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la información proporcionada para establecer una comparación rigurosa. Como referencia cualitativa, el modelo base es LiquidAI/LFM2.5-VL-3B, del que esta conversión depende directamente; cualquier comparación con otros VLM de ~3.000 millones de parámetros (por ejemplo, familias tipo PaliGemma, Qwen2-VL-2B o SmolVLM) requeriría datos que no se han facilitado.

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM2.5-VL-3B (LiteRT-LM) | ~3.000 M | 4096 (KV) | `.litertlm` int8/int4 | LFM Open License v1.0 | Hugging Face, litert-community |
| LiquidAI/LFM2.5-VL-3B | ~3.000 M | no disponible | PyTorch (bf16) | LFM Open License v1.0 | Hugging Face, LiquidAI |
| Alternativas de ~3B | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Fallo posicional grave en el runtime publicado: en LiteRT-LM 0.16.0 (y en `main` actual) solo la cuarta parte superior de la imagen llega al modelo. Las preguntas de localización, conteo o enumeración devuelven respuestas incorrectas sin error y con formato bien construido. Afecta a todos los ficheros LFM2.5-VL, no solo a esta conversión. Se corrige con `LFM2.5-VL-3B_int4_fixB.litertlm` en litert-lm 0.16.1 y 0.17.0.
- Una sola imagen por *prompt* y resolución fija de 512×512 (256 tokens); no admite imágenes de alta resolución ni múltiples imágenes.
- Ventana de contexto limitada a 4096 tokens de caché KV, insuficiente para documentos largos o conversaciones extensas.
- iOS: Metal falla en la creación del motor; hay que usar CPU, con la penalización de rendimiento correspondiente.
- Licencia LFM Open License v1.0: es una licencia "other", no una licencia open source estándar. Debe revisarse el texto de `LICENSE` antes de cualquier uso comercial; no se detallan aquí las restricciones concretas.
- No se documentan sesgos conocidos, tasas de alucinación ni comportamiento multilingüe; al ser un modelo de 3.000 millones de parámetros, es esperable una capacidad de razonamiento limitada frente a modelos mayores, aunque no se aportan mediciones.
- La model card está redactada por el conversor comunitario, no por Liquid AI; las mediciones de velocidad y calidad proceden de pruebas del autor de la conversión y deben tratarse como indicativas.
- El modelo no incluye modo *thinking* ni soporte documentado de *tool calling*, lo que limita su uso en pipelines de agentes.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/litert-community/LFM2.5-VL-3B
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-VL-3B
- Runtime LiteRT-LM: https://github.com/google-ai-edge/litert-lm
- Issue del fallo posicional: https://github.com/google-ai-edge/LiteRT-LM/issues/3246
- Issue de Metal en iOS: https://github.com/google-ai-edge/LiteRT-LM/issues/3129
- Ficha de compatibilidad en borde: https://github.com/john-rocky/edge-compat/blob/main/cards/lfm2.5-vl-3b-int8/CARD.md
- Benchmark de runtimes en Apple Silicon y Android: https://github.com/john-rocky/apple-silicon-llm-bench/blob/main/results/android/tinyhybridnet-three-runtimes.md
- Script de reexportación de visión: https://github.com/john-rocky/LiteRT-Models/blob/screen-agent/screen-agent/tools/reexport_vision_unshuffle.py
- Script de reempaquetado: https://github.com/john-rocky/LiteRT-Models/blob/screen-agent/screen-agent/tools/repack_vision.py
