# litert-community/LFM2.5-VL-3B

## Resumen

LFM2.5-VL-3B es un modelo de visión-lenguaje (VLM) desarrollado por Liquid AI que combina una columna vertebral de texto híbrida con una torre de visión SigLIP2. La versión aquí descrita, publicada por la comunidad `litert-community`, es una conversión del modelo original al formato LiteRT-LM (`.litertlm`) de Google para inferencia en dispositivo (*on-device*) mediante el runtime LiteRT-LM, anteriormente conocido como TensorFlow Lite. El objetivo es claro: llevar un VLM de 3B parámetros a teléfonos y dispositivos *edge* sin depender de la nube.

El modelo base emplea una arquitectura híbrida poco convencional: 22 bloques de convolución corta con compuertas (*gated short-convolution*) combinados con 8 capas de atención con consultas agrupadas (GQA), sobre un vocabulario de 128k tokens. La torre de visión SigLIP2 consta de 27 capas con dimensión oculta de 1152, y un proyector con *pixel-unshuffle* transforma la imagen en 256 tokens suaves. Esta conversión concreta ofrece cuantizaciones int8 e int4 con tamaños de 3,55 GB y 2,35 GB respectivamente.

La relevancia actual radica en que demuestra que un VLM multimodal completo puede ejecutarse de forma local en un Galaxy S26 a ~20 tok/s de decodificación, con prefill de 744 tok/s y TTFT de 330 ms en GPU. No obstante, arrastra un problema conocido grave en el camino de visión del runtime que afecta a tareas posicionales, lo que condiciona seriamente su uso en producción tal cual se publica.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida: 22 bloques de convolución corta con compuertas + 8 capas de atención GQA; torre de visión SigLIP2 (27 capas, hidden 1152) con proyector pixel-unshuffle |
| Parámetros totales | 3B (aproximado, según denominación del modelo) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (caché KV máxima en el runtime LiteRT-LM) |
| Tipos de cuantización | int8 dinámica (lineales de texto, convoluciones, embedding, torre de visión); int4 blockwise-32 OCTAV en lineales de texto con embedding y lm_head en int8, torre de visión int8 |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (`license: other`) |
| Formato de pesos | `.litertlm` (LiteRT-LM); pesos originales del modelo base en formato no especificado en la información disponible |
| Entrada de imagen | 1 imagen por prompt, redimensionada a 512×512 → 256 tokens; PNG/JPEG |
| Backend soportado | CPU y GPU (macOS verificado; Android OpenCL verificado en Pixel 8a y Galaxy S26; iOS Metal falla en la creación del motor) |
| Tamaño del repo | 16,5 GB |
| Runtime mínimo verificado | litert-lm 0.16.0 (int8), 0.19.0 (int4) |

## Arquitectura y entrenamiento

La arquitectura del modelo base combina dos paradigmas: por un lado, una columna vertebral de texto híbrida que alterna 22 bloques de convolución corta con compuertas (una variante de convolución que captura dependencias locales con coste computacional lineal) con 8 capas de atención con consultas agrupadas (GQA), lo que reduce el coste de la caché KV frente a la atención multi-cabeza tradicional. El vocabulario es de 128k tokens. Por otro lado, la torre de visión SigLIP2 procesa la imagen en 27 capas con dimensión oculta de 1152, y un proyector con *pixel-unshuffle* 2×2 la comprime a 256 tokens suaves que se inyectan en el flujo de texto.

Un detalle técnico relevante para esta conversión: la familia LFM2.5-VL realiza el *pixel-unshuffle* 2×2 en el adaptador de visión, no en el codificador, mientras que el runtime LiteRT-LM asume lo contrario. Esta discrepancia es la causa del problema conocido descrito más abajo y afecta a todos los ficheros LFM2.5-VL, no solo a este. La conversión incluye el codificador de visión, el adaptador y los metadatos de marcadores de posición de imagen de LFM2, y el procesador de datos del runtime inserta automáticamente los marcadores en la plantilla ChatML-style.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada.

## Capacidades

- Generación de texto multimodal: responde a preguntas sobre imágenes y texto combinados en una sola pasada.
- Descripción de imágenes (*captioning*): identificación de sujetos dominantes, colores y contenido general.
- OCR de texto grande: lectura de texto prominente en la imagen (verificado en pruebas sintéticas).
- Reconocimiento de formas y comparación de tamaños en imágenes simples.
- Conteo de objetos en escenarios controlados (con reservas, ver limitaciones).
- Procesamiento en dispositivo sin conexión a red, con CPU y GPU.
- Plantilla de chat integrada en el fichero (ChatML-style) con gestión automática de marcadores de imagen.
- No dispone de modo *thinking* (el procesador de datos lo marca explícitamente como modelo no-thinking).
- Soporte de *tool calling* / *function calling*: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- **Asistencia visual en aplicaciones móviles sin conexión**: el modelo puede describir una foto capturada por el usuario y responder preguntas sobre ella directamente en el dispositivo, sin enviar datos a la nube. Adecuado por su tamaño de 2,35 GB en int4 y su ejecución verificada en GPU Android (Galaxy S26, Pixel 8a). Limitado a una imagen por prompt y contexto de 4096 tokens.
- **Accesibilidad para personas con discapacidad visual**: descripción de escenas y lectura de texto grande en carteles o etiquetas mediante OCR. El modelo funciona bien en sujetos dominantes y texto prominente, que es precisamente el caso de uso de lectura de carteles.
- **Digitalización de documentos simples en campo**: captura de una imagen de un documento con texto grande y extracción del contenido mediante OCR. Adecuado para entornos sin conectividad (almacenes, obra, zonas rurales) gracias a la inferencia local en CPU.
- **Clasificación visual de productos en comercio minorista**: identificación de color y forma de un producto a partir de una foto para tareas de inventario o verificación. El modelo responde con fiabilidad a preguntas de color dominante y forma en pruebas sintéticas.
- **Prototipado de agentes de pantalla (*screen agents*)**: el repositorio de herramientas asociado (`john-rocky/LiteRT-Models`) incluye scripts orientados a *screen-agent*, lo que sugiere su uso en automatización de interfaces móviles. No obstante, las tareas posicionales (localizar, enumerar, "cuál está abajo") fallan en el runtime publicado, por lo que este caso requiere el fichero `int4_fixB`.
- **Demostraciones y evaluación de runtimes edge**: útil para investigadores que quieran medir el rendimiento de LiteRT-LM con un VLM real en hardware móvil (tok/s de decodificación, prefill, TTFT) y comparar backends CPU frente a GPU.
- **Educación y experimentación con VLMs en dispositivo**: permite a desarrolladores experimentar con un VLM completo en un teléfono sin infraestructura de servidores, con un coste de almacenamiento de 2,35 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los datos de rendimiento que sí se proporcionan son mediciones en dispositivo y pruebas de calidad sintéticas:

| Medición | Dispositivo / configuración | Resultado |
|---|---|---|
| Decodificación (GPU) | Galaxy S26, LiteRT-LM 0.16.0, GPU | 20,1 tok/s |
| Prefill (GPU) | Galaxy S26, LiteRT-LM 0.16.0, GPU | 744 tok/s |
| TTFT (GPU) | Galaxy S26, LiteRT-LM 0.16.0, GPU | 330 ms |
| Operaciones delegadas | Galaxy S26, GPU | 937 ops (todas) |
| Decodificación (CPU) | Galaxy S26, LiteRT-LM 0.16.0, CPU | 19,9 tok/s |
| Prefill (CPU) | Galaxy S26, LiteRT-LM 0.16.0, CPU | 277 tok/s |
| TTFT (CPU) | Galaxy S26, LiteRT-LM 0.16.0, CPU | 790 ms |
| Precisión de conversión | Galaxy S26, LiteRT 2.2.0, `litert_torch.convert` | diferencia de 4e-7 frente al original |
| Prueba posicional (16 bandas) | fichero stock, litert-lm 0.16.1/0.17.0 | devuelve solo 4 bandas (esperado: 16) |
| Prueba posicional (16 bandas) | `int4_fixB`, litert-lm 0.16.1/0.17.0 | devuelve las 16 bandas |
| Captura de pantalla con 10 objetivos | fichero stock | 2/10 |
| Captura de pantalla con 10 objetivos | `int4_fixB` | 10/10 |

## Requisitos de hardware

- **VRAM / almacenamiento**: el fichero int8 ocupa 3,55 GB y el int4 2,35 GB. Al ser inferencia en dispositivo, el requisito es de memoria unificada del SoC, no de VRAM dedicada.
- **GPU recomendadas**: no aplica en el sentido de servidor; el modelo está pensado para GPU integradas móviles (OpenCL en Android) y Apple Silicon en macOS. Verificado en Galaxy S26, Pixel 8a y macOS.
- **Compatibilidad con GPU de consumo**: no está diseñado para GPU de escritorio discretas; el runtime LiteRT-LM es para *edge*. En iOS, la ruta Metal falla en la creación del motor para esta familia (issue LiteRT-LM#3129), por lo que debe usarse CPU en iOS.
- **Opciones de despliegue**: exclusivamente el runtime LiteRT-LM (`litert-lm` pip, versión mínima 0.16.0 para int8 y 0.19.0 para int4). No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- **Latencia y throughput**: en Galaxy S26, decodificación de ~20 tok/s tanto en CPU como en GPU; prefill de 744 tok/s (GPU) y 277 tok/s (CPU); TTFT de 330 ms (GPU) y 790 ms (CPU).
- **Contexto**: caché KV limitada a 4096 tokens, lo que restringe conversaciones multi-turno largas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / runtime | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM2.5-VL-3B (LiteRT-LM, esta ficha) | 3B | 4096 | `.litertlm`, LiteRT-LM | LFM Open License v1.0 | Hugging Face, 1331 descargas |
| LiquidAI/LFM2.5-VL-3B (original) | 3B | no disponible | pesos originales (no especificado) | LFM Open License v1.0 | Hugging Face |
| Otros VLM de ~3B en formato edge | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con otros VLM de tamaño similar en la información proporcionada, por lo que no es posible establecer una comparación de rendimiento rigurosa.

## Limitaciones y advertencias

- **Problema conocido grave en visión posicional**: en litert-lm 0.16.0 y en `main` actual, solo el cuarto superior de la imagen llega al modelo. Las tareas de localización, conteo, enumeración y "cuál está abajo" devuelven resultados incorrectos sin error y con salida bien formada. Afecta a todos los ficheros LFM2.5-VL. Solo el fichero `LFM2.5-VL-3B_int4_fixB.litertlm` corrige el problema (16/16 bandas, 10/10 objetivos).
- **Contexto limitado**: 4096 tokens de caché KV, insuficiente para documentos largos o conversaciones multi-turno extensas.
- **Una sola imagen por prompt**: no admite comparación entre varias imágenes en la misma consulta.
- **Resolución fija**: la imagen se redimensiona a 512×512, lo que pierde detalle en imágenes de alta resolución o texto pequeño.
- **iOS no soportado en GPU**: la ruta Metal falla en la creación del motor; debe usarse CPU en iOS.
- **Riesgo de alucinación**: no cuantificado en la información disponible, pero inherente a modelos generativos de 3B parámetros.
- **Sesgos**: no documentados en la información proporcionada.
- **Idiomas**: no disponibles en la información proporcionada; no se puede confirmar cobertura multilingüe.
- **Licencia**: LFM Open License v1.0 (`license: other`). Es necesario revisar los términos concretos del fichero `LICENSE` antes de uso comercial; no se detallan restricciones en la información disponible.
- **Madurez del runtime**: el modelo depende de un runtime en evolución (LiteRT-LM) con issues abiertos (#3246, #3129) que afectan a su fiabilidad en producción.
- **Sin benchmarks estándar**: no hay datos publicados de MMLU, HumanEval, GSM8K ni similares, lo que impide evaluar su calidad frente a alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/LFM2.5-VL-3B
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-VL-3B
- Runtime LiteRT-LM: https://github.com/google-ai-edge/litert-lm
- Issue del runtime (visión posicional): https://github.com/google-ai-edge/LiteRT-LM/issues/3246
- Issue del runtime (iOS Metal): https://github.com/google-ai-edge/LiteRT-LM/issues/3129
- Ficha de compatibilidad edge: https://github.com/john-rocky/edge-compat/blob/main/cards/lfm2.5-vl-3b-int8/CARD.md
- Benchmark de runtimes en Android: https://github.com/john-rocky/apple-silicon-llm-bench/blob/main/results/android/tinyhybridnet-three-runtimes.md
- Scripts de reexportación de visión: https://github.com/john-rocky/LiteRT-Models/blob/screen-agent/screen-agent/tools/reexport_vision_unshuffle.py
- Script de reempaquetado de visión: https://github.com/john-rocky/LiteRT-Models/blob/screen-agent/screen-agent/tools/repack_vision.py
