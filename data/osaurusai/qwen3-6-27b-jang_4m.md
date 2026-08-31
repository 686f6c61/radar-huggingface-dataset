# OsaurusAI/Qwen3.6-27B-JANG_4M

## Resumen

El modelo **OsaurusAI/Qwen3.6-27B-JANG_4M** es una cuantización en formato MLX del modelo denso Qwen3.6-27B desarrollado por Alibaba Cloud, adaptada por OsaurusAI para ejecutarse de forma eficiente en Apple Silicon. Se trata de un modelo multimodal de texto e imagen (pipeline `image-text-to-text`) con una arquitectura híbrida que combina 48 capas de atención lineal tipo Gated DeltaNet con 16 capas de atención completa, lo que le permite manejar contextos largos con un coste de memoria constante en longitud de secuencia.

La cuantización **JANG_4M** es una mezcla de 4 y 8 bits que asigna precisión superior a las proyecciones de atención completa, embeddings y `lm_head`, mientras comprime la FFN densa, las proyecciones de atención lineal y la torre de visión a 4 bits. El resultado es un paquete de 17,5 GB (3,0× de compresión frente al BF16 original) que mantiene un rendimiento competitivo en tareas de razonamiento y visión, como demuestran los benchmarks MMLU-200 incluidos en la model card.

La relevancia de este modelo radica en su capacidad para ejecutar un LLM multimodal de 27B parámetros en hardware de consumo de Apple, con soporte nativo para razonamiento (thinking mode), visión y video, y una licencia Apache 2.0 que permite uso comercial sin restricciones.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen3_5` — 64 capas decoder: 48 Gated DeltaNet (atención lineal) + 16 full-attention con gate de salida swish |
| Parametros totales | 27,3 mil millones (dense, sin MoE) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens nativos; hasta ~1 000 000 con YaRN (según la card upstream) |
| Tipos de cuantizacion | JANG_4M (mixta 4/8-bit nativa MLX affine); también se referencia MXFP4 como comparativa en benchmarks |
| Idiomas soportados | Inglés (según la model card); el modelo base Qwen3.6-27B puede soportar más idiomas, pero no está documentado en esta ficha |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (MLX), 11 shards, 17,5 GB en disco |

## Arquitectura y entrenamiento

La arquitectura `qwen3_5` es híbrida: 48 de las 64 capas decoder utilizan **Gated DeltaNet**, un mecanismo de atención lineal basado en reglas delta con una ruta de entrada `conv1d` agrupada y estado por cabeza (`A_log`, `dt_bias`), lo que proporciona memoria constante en longitud de secuencia. Las 16 capas restantes (una cada 4, `full_attention_interval: 4`) emplean atención softmax completa con un gate de salida: `q_proj` produce un tensor fusionado de consultas y gate, y la salida de atención se multiplica por `sigmoid(gate)` antes de `o_proj`. Esta combinación permite manejar contextos de hasta 262 144 tokens con un coste computacional reducido en las capas lineales.

El modelo incorpora **rotary embeddings parciales** (solo el primer 25 % de la dimensión de cabeza rota, `partial_rotary_factor: 0.25`, `rope_theta = 1e7`) y metadatos de posición multimodal (`mrope_section`, `mrope_interleaved: true`) para procesar secuencias mixtas de texto, imagen y video. La FFN es densa (sin MoE) con proyecciones 5120 → 17408 → 5120 y activación SwiGLU. La torre de visión es un ViT de 27 capas (hidden 1152, patch 16, `temporal_patch 2`) que produce tokens de video mediante patch-embed 3D conv, fusionando pares de frames en un patch temporal.

El modelo es un fine-tune de `Qwen/Qwen3.6-27B`; la model card no proporciona detalles sobre el dataset de entrenamiento, el número de tokens ni el proceso de alineación (RLHF/DPO). La cuantización JANG_4M se diseñó específicamente para preservar la precisión en las capas de atención completa, donde la fusión del gate con `q_proj` amplifica el ruido de activación si se cuantiza a 4 bits.

## Capacidades

- **Generación de texto y razonamiento**: soporta `enable_thinking` para activar o desactivar el modo de razonamiento; verificado con respuestas directas y coherentes en pruebas de conocimiento general.
- **Comprensión y generación de código**: continuaciones correctas de funciones recursivas (p. ej., Fibonacci) y generación de código en múltiples lenguajes.
- **Visión por computador**: procesamiento de imágenes (identificación de colores, descripción de escenas) y video corto (secuencias de 4 frames con estructura temporal).
- **Traducción automática**: verificado con traducción del inglés al francés ("Hello, how are you?" → "Bonjour, comment allez-vous ?").
- **Soporte de tool calling / function calling**: integrable en pipelines de agentes y automatización (no detallado en la model card, pero implícito en el formato de chat Qwen).
- **Chat multimodal**: formato de conversación `im_start`/`im_end` con alternancia de texto e imagen/video.
- **Inferencia en Apple Silicon**: optimizado para MLX, con rendimiento medido de 426,3 tokens/s de prefill y 16,9 tokens/s de generación en un M5 Pro (20 núcleos, 48 GB).

## Casos de uso

- **Asistente de programación local en macOS**: el modelo puede completar código, explicar fragmentos y refactorizar funciones dentro de un IDE, ejecutándose localmente gracias a la cuantización MLX. Su capacidad de razonamiento permite sugerencias contextuales más precisas que un autocompletado simple.
- **Análisis de documentos con visión**: al procesar imágenes y texto, puede extraer información de capturas de pantalla, diagramas o documentos escaneados, útil en entornos de soporte técnico o revisión de contratos.
- **Chat conversacional con razonamiento activable**: el toggle `enable_thinking` permite alternar entre respuestas rápidas y razonamiento profundo, adecuado para asistentes virtuales que necesitan explicar su proceso de decisión.
- **Traducción automática en tiempo real**: verificado con traducciones correctas entre inglés y francés, puede integrarse en herramientas de comunicación o localización de contenido.
- **Automatización de agentes con tool calling**: gracias al formato de chat Qwen y al soporte de funciones, puede actuar como agente que llama a APIs, consulta bases de datos o ejecuta acciones, todo en local sin enviar datos a la nube.
- **Procesamiento de video corto**: su torre de visión con `temporal_patch 2` permite analizar secuencias de video breves (p. ej., clips de 4 frames) para generar descripciones o detectar cambios de color/escena, aplicable en sistemas de vigilancia o accesibilidad.
- **Despliegue en producción con Apple Silicon**: la cuantización JANG_4M permite servir el modelo en Macs con 48 GB de RAM unificada, con latencia razonable (16,9 tokens/s) para aplicaciones interactivas.

## Benchmarks y rendimiento

La model card incluye resultados de **MMLU-200** (10 materias × 20 preguntas, razonamiento desactivado) comparando JANG_4M con la cuantización MXFP4 del mismo modelo. Los datos parciales disponibles son:

| Materia | MXFP4 | JANG_4M | Δ (JANG − MXFP4) |
|---|---|---|---|
| abstract_algebra | 12/20 (60,0 %) | 15/20 (75,0 %) | +3 |
| anatomy | 18/20 (90,0 %) | 16/20 (80,0 %) | -2 |
| astronomy | 20/20 (100,0 %) | 19/20 (95,0 %) | -1 |
| college_computer_science | 16/20 (80,0 %) | 16/20 (80,0 %) | 0 |
| college_physics | 15/20 (75,0 %) | 15/20 (75,0 %) | 0 |
| (resto de materias) | no disponible | no disponible | no disponible |

La tabla se corta en la materia "high" en la model card; no se dispone de los resultados completos de las 10 materias.

En cuanto a rendimiento de inferencia, el benchmark de [omlx.ai](https://omlx.ai/benchmarks/zo7ngnvp) reporta **426,3 tokens/s de prefill** y **16,9 tokens/s de generación** en un Apple M5 Pro (20 núcleos, 48 GB de RAM unificada) con este modelo.

## Requisitos de hardware

- **VRAM estimada**: el paquete ocupa 17,5 GB en disco; con el modelo cargado en memoria, se recomienda un mínimo de 32 GB de RAM unificada para inferencia fluida, y 48 GB para contextos largos o procesamiento de video.
- **GPU recomendadas**: Apple Silicon con al menos 32 GB (M1 Pro/Max, M2 Pro/Max, M3 Pro/Max, M4 Pro/Max, M5 Pro/Max). El benchmark verificado usa un M5 Pro de 20 núcleos con 48 GB.
- **Compatibilidad con GPU de consumo**: no aplicable; el formato MLX está diseñado exclusivamente para Apple Silicon. No se proporcionan pesos GGUF ni CUDA para GPUs NVIDIA.
- **Opciones de despliegue**: runtime MLX nativo, el cliente Osaurus (macOS), o cualquier runtime compatible con bundles `qwen3_5` VL con configuración de cuantización por módulo (definida en `config.json["quantization"]`). También puede servirse vía MLX Studio, que expone una API compatible con OpenAI.
- **Latencia y throughput**: 426,3 tokens/s de prefill y 16,9 tokens/s de generación en M5 Pro (20c, 48 GB), según omlx.ai.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.6-27B (BF16 original) | 27,3 B | 262 144 (hasta ~1M con YaRN) | BF16 (52 GB) | Apache 2.0 | safetensors (PyTorch) |
| Qwen3.6-27B MXFP4 | 27,3 B | 262 144 | MXFP4 (4-bit) | Apache 2.0 | safetensors (MLX) |
| **Qwen3.6-27B JANG_4M** | 27,3 B | 262 144 | Mixta 4/8-bit (17,5 GB) | Apache 2.0 | safetensors (MLX) |

La comparativa directa entre JANG_4M y MXFP4 en MMLU-200 muestra resultados similares, con JANG_4M ligeramente superior en álgebra abstracta (+3) e inferior en anatomía (-2) y astronomía (-1). No se dispone de comparativas con otros modelos de 27B (p. ej., Llama 3.1 27B o Gemma 2 27B) en la información proporcionada.

## Limitaciones y advertencias

- **Sesgos y alucinaciones**: no se han publicado evaluaciones específicas de sesgos o tasas de alucinación para este modelo; como cualquier LLM, puede generar contenido incorrecto o tendencioso, especialmente en tareas de razonamiento complejo o dominios especializados.
- **Contexto largo**: aunque soporta 262 144 tokens nativos, el rendimiento real en contextos muy largos no está documentado más allá de la afirmación de la card upstream (~1M con YaRN). Se recomienda validar la calidad de la atención en secuencias extremas antes de usarlo en producción.
- **Idiomas**: la model card solo documenta inglés; el uso en otros idiomas no está verificado y puede degradar la calidad de las respuestas.
- **Restricciones de despliegue**: el formato MLX limita la ejecución a Apple Silicon; no hay pesos GGUF ni CUDA para GPUs NVIDIA, lo que reduce la portabilidad a entornos de servidor convencionales.
- **Dependencia de runtime**: la cuantización por módulo requiere un runtime MLX compatible con bundles `qwen3_5` VL; no todos los frameworks MLX soportan los 65 overrides de bits definidos en `config.json["quantization"]`.
- **Cuantización mixta**: la decisión de mantener 8-bit en las capas de atención completa aumenta el tamaño del paquete frente a una cuantización uniforme de 4 bits, pero es necesaria para preservar la estabilidad del gate; los usuarios que busquen máxima compresión deberían evaluar MXFP4.
- **Datos de entrenamiento no disponibles**: no se proporciona información sobre el dataset de fine-tune ni sobre el proceso de alineación, lo que dificulta evaluar riesgos de sesgo o calidad del modelo en dominios específicos.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/OsaurusAI/Qwen3.6-27B-JANG_4M)
- [Árbol de archivos del repositorio](https://huggingface.co/OsaurusAI/Qwen3.6-27B-JANG_4M/tree/main)
- [Benchmark en omlx.ai](https://omlx.ai/benchmarks/zo7ngnvp)
- [MLX Studio (GitHub)](https://github.com/jjang-ai/mlxstudio)
- [Qwen3.6 27B en Jetson AI Lab](https://www.jetson-ai-lab.com/models/qwen3-6-27b/)
- [Sitio web de Osaurus AI](https://osaurus.ai)
