# mikedoise/gemma-4-E4B-it-coreai-4bit-128k-vision

## Resumen

`mikedoise/gemma-4-E4B-it-coreai-4bit-128k-vision` es una conversión cuantizada del checkpoint instructivo multimodal `google/gemma-4-E4B-it` de Google DeepMind, empaquetada específicamente para el runtime Core AI de Apple sobre silicio de Apple (macOS/iOS). No es un modelo nuevo ni un fine-tuning: es un export offline del modelo base con paletización mixta de 4 bits, embeddings y PLE en INT8 y cómputo en float16, orientado a ejecución local en dispositivos Apple. El paquete incluye codificador y proyector de visión, con buckets de píxeles de 384, 768 y 1.152 y de 64, 256 y 576 tokens suaves.

El modelo base pertenece a la familia Gemma 4, que combina variantes densas y Mixture-of-Experts y está optimizada para ejecución on-device. Los modelos pequeños de la familia, como el E4B, ofrecen una ventana de contexto de 128K tokens y procesan texto, imagen con relación de aspecto y resolución variables, vídeo y audio de forma nativa. Esta conversión concreta configura un contexto estático de 131.072 tokens mediante buckets de 1.024, 8.192, 32.768 y 131.072, aunque el autor advierte que la inferencia a longitud completa no está probada.

La relevancia de esta ficha es doble: por un lado, documenta un ejemplo real de despliegue de un modelo abierto de Google en el stack de Apple; por otro, deja constancia explícita de sus límites de validación. El autor solo ha ejecutado una prueba de humo con una imagen sintética y un prompt corto, sin benchmarks amplios, sin pruebas de contexto largo y sin verificar ejecución en iPhone/iPad ni uso estructurado de herramientas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal del modelo base Gemma 4 E4B (texto + visión); empaquetado para Apple Core AI |
| Parámetros totales | no disponible (el repo pesa 5,7 GB; los pesos fuente verificados son 15.992.595.884 bytes) |
| Parámetros activos | no disponible |
| Longitud de contexto | 131.072 tokens configurados (buckets estáticos de 1.024 / 8.192 / 32.768 / 131.072); inferencia a longitud completa no probada |
| Tipos de cuantización | Paletización mixta de 4 bits, embeddings y PLE en INT8, cómputo en float16; visión con paletización de 4 bits y group size 32 |
| Idiomas soportados | no disponible (no se han probado otros idiomas según el autor) |
| Licencia | Apache 2.0 (con enlace a la licencia de Gemma 4 de Google) |
| Formato de pesos | Recursos `.aimodel` portables, `metadata.json`, `gemma4-e4b-4bit-ctx131072-vision_ple.safetensors`, `tokenizer/` y `vision.aimodel/`; no es GGUF, MLX, Core ML ni Transformers |

## Arquitectura y entrenamiento

El modelo subyacente es `google/gemma-4-E4B-it`, un checkpoint instructivo de la familia Gemma 4. Según la documentación oficial de Google, Gemma 4 ofrece variantes densas y Mixture-of-Experts, soporte multimodal extendido (texto, imagen con resolución y relación de aspecto variables, vídeo y audio nativo en los modelos E2B, E4B y 12B) y está optimizada para ejecución on-device en portátiles y móviles. Esta conversión no añade entrenamiento ni fine-tuning: es un export del checkpoint base fijado a la revisión `ee0ef6023621cff504d758262d4e04895a5af4a2`.

La innovación técnica de este paquete no está en el modelo sino en el proceso de exportación y cuantización para Core AI. Se emplea una receta de Apple sin modificar (`apple/coreai-models`, receta `gemma4`), con paletización mixta de 4 bits que no aplica a todos los tensores, embeddings y PLE en INT8 y cómputo en float16. El contexto se organiza en buckets estáticos para permitir asignación de memoria predecible. La visión usa buckets de 384, 768 y 1.152 píxeles con letterboxing sin reescalado y máscara de padding. No hay codificador de audio ni cabecera de borrador especulativa en este export. La conversión se realizó offline con Python 3.11, torch 2.9.0, coreai-torch 0.4.3, coreai-core 1.0.0b3, coreai-opt 0.4.0 y transformers 5.12.1, y el autor advierte que no está garantizada la reproducibilidad byte a byte.

## Capacidades

- Generación de texto a partir de entradas de texto e imagen (pipeline `image-text-to-text`).
- Procesamiento de imágenes con soporte de relación de aspecto y resolución variables mediante buckets de 384, 768 y 1.152 píxeles y 64, 256 y 576 tokens suaves.
- Capacidades multimodales del modelo base según Google: texto, imagen, vídeo y audio nativo en los modelos E2B, E4B y 12B (no verificado en este export).
- Ventana de contexto configurada de 131.072 tokens, útil para documentos largos, aunque no validada a longitud completa.
- Ejecución local en silicio de Apple a través del runtime Core AI y la herramienta `llm-runner`.
- Soporte de tool calling / function calling: no disponible (no probado según el autor).
- Soporte de agentes y razonamiento multi-paso: no disponible (no probado).
- Capacidades multilingües: no disponibles (no probadas).
- Modo thinking, audio, vídeo o decodificación especulativa: no incluidos o no probados en este export.

## Casos de uso

- Procesamiento local de documentos con imágenes en macOS: el modelo puede recibir texto e imágenes y generar descripciones o resúmenes sin salir del dispositivo, aprovechando el runtime Core AI y los buckets de visión de 384/768/1.152 píxeles.
- Asistentes de accesibilidad en Mac: descripción de imágenes y extracción de información visual para usuarios con discapacidad visual, con la ventaja de que el paquete pesa 5,7 GB y no requiere conexión a la nube.
- Prototipado de aplicaciones multimodales en Apple Silicon: desarrolladores que quieran validar flujos image-text-to-text con `llm-runner` antes de invertir en un despliegue mayor, usando los buckets de contexto de 1.024 a 131.072 tokens.
- Análisis de capturas de pantalla o diagramas: con prompts adecuados, el modelo puede describir formas, colores y disposición de elementos, como demuestra la prueba de humo del autor con un círculo rojo, un cuadrado azul y un triángulo verde.
- Investigación sobre cuantización y runtimes on-device: este repo sirve como referencia reproducible para estudiar el comportamiento de paletización de 4 bits y ejecución en Core AI, incluyendo los avisos de compilación ANE.
- Evaluación de contexto largo en local: para equipos que necesiten probar cargas de hasta 131.072 tokens en un Mac con suficiente RAM, aunque el autor no garantiza precisión ni velocidad a esa longitud.
- Integración en pipelines de CI para validación de exports: el comando offline documentado permite regenerar el paquete y comparar hashes con `SHA256SUMS` y `provenance.json`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor solo reporta una prueba de humo cualitativa:

| Prueba | Resultado |
|---|---|
| Entrada | Imagen sintética 768x384 con círculo rojo, cuadrado azul y triángulo verde |
| Prompt | "Describe the shapes and their colors from left to right. Keep the answer brief." |
| Respuesta | "Red circle, blue square, green triangle." |
| Código de salida | 0 |
| Tiempo de preparación | 71,052 s |
| Tiempo total de invocación | 75,37 s |
| Entorno | Apple M5 Max, 128 GiB RAM, macOS 27.0.1, Xcode 27.1 |

El autor indica explícitamente que son observaciones de una sola ejecución, no benchmarks, y que no se han probado precisión, memoria ni velocidad en contexto largo, ni rendimiento sostenido, ni otros idiomas, ni uso estructurado de herramientas.

## Requisitos de hardware

- VRAM/RAM estimada: el bundle ocupa 5,678 GB (5,288 GiB) en disco; el autor aclara que el tamaño en disco no es un requisito de RAM. No se especifica la RAM necesaria para inferencia.
- GPU recomendadas: no disponible. El runtime Core AI está orientado a silicio de Apple (SoC M-series y A-series), no a GPU NVIDIA.
- ¿Cabe en GPU de consumo? No aplica en el sentido habitual; está pensado para Mac con Apple Silicon. La prueba se realizó en un M5 Max con 128 GiB de RAM.
- Requisitos de software: macOS/iOS 27.0+ y Xcode 27.0+ según los requisitos generales de Apple; la receta Gemma de Apple indica iOS 27.2+. La ejecución en iPhone/iPad no está probada.
- Opciones de despliegue: `apple/coreai-models` con `llm-runner` (`swift run -c release llm-runner --model ... --prompt ...`). No es compatible con vLLM, llama.cpp, Ollama, TGI, MLX, GGUF ni Core ML.
- Latencia y throughput: solo se dispone de la observación de 75,37 s para una invocación completa en la prueba de humo, incluyendo 71,052 s de preparación. No hay datos de throughput sostenido.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / runtime | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `mikedoise/gemma-4-E4B-it-coreai-4bit-128k-vision` | no disponible (base E4B) | 131.072 configurados | Core AI (`.aimodel`) | Apache 2.0 | Hugging Face, 0 descargas |
| `google/gemma-4-E4B-it` | no disponible (E4B) | 128K según Google | Pesos originales (Transformers y otros) | Licencia Gemma 4 | Hugging Face oficial |
| `mikedoise/gemma-4-E4B-it-coreai-4bit-128k-text` | no disponible (base E4B) | 131.072 configurados | Core AI (`.aimodel`) | Apache 2.0 | Hugging Face, variante solo texto |
| Otras variantes Gemma 4 (E2B, 12B, MoE) | no disponible | 128K en pequeños, 256K en medianos | Pesos originales | Licencia Gemma 4 | Hugging Face oficial |

La comparativa se limita a variantes de la misma familia porque no se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas en la información proporcionada.

## Limitaciones y advertencias

- No se ha probado la inferencia con la ventana completa de 128K tokens; se desconoce la precisión, el consumo de memoria y la velocidad en contexto largo.
- No hay benchmarks amplios de texto ni de imagen; la única validación es una prueba de humo con una imagen sintética.
- No se han probado otros idiomas distintos del inglés de la prueba.
- No se ha probado el uso estructurado de herramientas (tool calling) ni flujos de agentes.
- No se ha probado la inferencia con los buckets de imagen de 384 y 1.152 píxeles por separado, ni vídeo, ni ejecución en iPhone/iPad.
- El compilador del Apple Neural Engine emitió un error interno de compilación y avisos de reordenación durante la preparación; el runtime cargó el modelo y respondió correctamente, pero no se establece compilación ni ejecución limpia en ANE ni un backend de cómputo concreto.
- El paquete no es un build ahead-of-time `.aimodelc`; `compilation.targets` está vacío. Apple documenta un problema de compilación AOT con Xcode 27.2 beta y recomienda especialización on-device desde `.aimodel`.
- El modelo base puede presentar sesgos y alucinaciones propios de los modelos generativos; no se han evaluado en este export.
- La licencia del repo es Apache 2.0, pero el modelo base remite a la licencia de Gemma 4 de Google; conviene revisar las condiciones de uso comercial del modelo base antes de desplegarlo.
- La conversión no está garantizada como reproducible byte a byte; el autor proporciona `provenance.json` y `SHA256SUMS` para verificación.
- El repo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mikedoise/gemma-4-E4B-it-coreai-4bit-128k-vision
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Colección de variantes E4B Core AI: https://huggingface.co/collections/mikedoise/gemma-4-e4b-core-ai-128k-6af0d221a80d7c3ba0f4fbb2
- Variante solo texto: https://huggingface.co/mikedoise/gemma-4-E4B-it-coreai-4bit-128k-text
- Repositorio de Apple Core AI Models: https://github.com/apple/coreai-models
- Receta Gemma 4 de Apple: https://github.com/apple/coreai-models/tree/22b0eaac4b325b812605a5096acff4880f1c4a36/models/gemma4
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Model card de Gemma 4 de Google: https://ai.google.dev/gemma/docs/core/model_card_4
- Documentación general de Gemma 4: https://ai.google.dev/gemma/docs/core
- Página de Gemma 4 en Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
