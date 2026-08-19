# AutomatosX/AX-Qwen3-VL-32B-Thinking-MLX-AXQ-MXFP4

## Resumen

AX-Qwen3-VL-32B-Thinking-MLX-AXQ-MXFP4 es un checkpoint cuantizado en formato MLX del modelo Qwen3-VL-32B-Thinking de Qwen, desarrollado por AutomatosX mediante su herramienta AXQuant (AXQ) de precisión mixta. Está diseñado específicamente para ejecutarse en Apple Silicon, aprovechando el runtime MLX-VLM. El modelo base es un sistema de visión-lenguaje denso de 33.360 millones de parámetros lógicos, con una ventana de contexto configurada de 262.144 tokens, aunque esta capacidad no está validada en esta versión.

La cuantización aplica un plan de precisión mixta: el 93,55% de los pesos se almacenan en 4 bits, un 2,33% en 8 bits y el 4,12% restante (incluida la torre de visión) se mantiene en BF16. El resultado es un checkpoint de 20,2 GB con un BPW medido de 4,8331. Es importante señalar que el propio autor lo etiqueta como "evidencia de desarrollo" y no como una versión certificada: no se publican métricas de calidad, benchmarks ni validación de contexto largo. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3VLForConditionalGeneration (densa), ruta de texto optimizada, torre de visión protegida en BF16 |
| Parametros totales | 33.36B (lógicos); checkpoint cuantizado: 7.443.697.904 parámetros almacenados |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (configurado; no validado) |
| Tipos de cuantizacion | MXFP4 (AXQuant), precisión mixta: 4-bit (93,55%), 8-bit (2,33%), BF16 (4,12%); BPW medido 4,8331 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX Safetensors (no incluye PyTorch ni GGUF) |

## Arquitectura y entrenamiento

El modelo base Qwen3-VL-32B-Thinking es un transformer denso de visión-lenguaje desarrollado por Qwen, con una arquitectura Qwen3VLForConditionalGeneration. Este checkpoint no es un modelo entrenado desde cero, sino una conversión cuantizada del original BF16 realizada con AXQuant 1.8.1. La cuantización sigue un plan de precisión mixta basado en prioris de arquitectura, sin calibración sobre datos reales: los tensores considerados críticos (como la torre de visión) se mantienen en BF16, mientras que la mayor parte de la ruta de texto se reduce a 4 bits con tamaños de grupo de 32 y 64. No se incluye un sidecar MTP (multi-token prediction) ni un manifiesto nativo para AX Engine, por lo que la ejecución se realiza a través del runtime estándar MLX-VLM. El autor declara explícitamente que no hay evidencia de retención de calidad frente al modelo BF16 o a cuantizaciones uniformes.

## Capacidades

- Generación de texto y razonamiento multimodal: al ser una cuantización del Qwen3-VL-32B-Thinking, hereda las capacidades del modelo base para responder a prompts que combinan imagen y texto.
- Comprensión de imágenes: la torre de visión se conserva en BF16, lo que sugiere que la extracción de características visuales no está cuantizada, aunque la calidad final no está certificada.
- Razonamiento en cadena (thinking): el modelo base incluye un modo de razonamiento explícito, pero no hay evidencia de que esta capacidad se mantenga íntegramente tras la cuantización.
- Soporte de tool calling y function calling: no documentado en esta versión; se asume que depende del modelo base, pero no hay validación.
- Multilingüismo: no especificado en la documentación del checkpoint.
- Audio: no soportado (audio desactivado en este pack).

## Casos de uso

- Inferencia local en Apple Silicon: el formato MLX y el tamaño de 20,2 GB permiten ejecutar el modelo en Macs con memoria unificada de 32 GB o más, usando MLX-VLM para tareas de captioning o VQA sin conexión a la nube.
- Prototipado rápido de aplicaciones de visión-lenguaje: desarrolladores que trabajan con Swift o Python en macOS pueden integrar el modelo en entornos de desarrollo locales para validar ideas antes de escalar a GPUs.
- Evaluación de cuantizaciones mixtas: investigadores interesados en comparar el impacto de planes AXQ con diferentes presupuestos de bits pueden usar este checkpoint junto con sus hermanos de 4 y 6 bits para medir el trade-off entre tamaño y calidad.
- Despliegue en entornos con restricciones de almacenamiento: al ocupar 20,2 GB frente a los más de 60 GB del modelo BF16, es adecuado para equipos con discos limitados.
- Automatización de tareas de documentación visual: extracción de descripciones de imágenes en pipelines locales que requieren privacidad de datos.
- Educación y experimentación: estudiantes y desarrolladores que quieran explorar modelos VLM en hardware de Apple sin necesidad de servidores GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no hay evidencia de calidad frente a BF16 o líneas base uniformes, y que la capacidad de contexto largo de 262.144 tokens es solo metadatos de configuración, no una afirmación validada. Tampoco se ofrecen mediciones de latencia o throughput.

## Requisitos de hardware

- VRAM estimada: al ser MLX, se usa memoria unificada de Apple Silicon. El checkpoint pesa 20,2 GB, por lo que se recomienda un mínimo de 32 GB de RAM unificada para cargar el modelo con margen para el contexto y los activaciones.
- GPU recomendadas: Apple Silicon con al menos 32 GB de memoria unificada (M1 Pro/Max, M2 Pro/Max, M3 Pro/Max o superiores). No es compatible con GPUs NVIDIA o AMD.
- Opciones de despliegue: MLX-VLM (runtime principal), con soporte para generación desde línea de comandos. No se menciona compatibilidad con vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles. El autor no publica mediciones de velocidad de kernels ni de rendimiento en contexto largo.

## Comparativa con modelos similares

No se dispone de comparativas publicadas por el autor. Como referencia estructural, se puede comparar con el modelo base Qwen/Qwen3-VL-32B-Thinking en BF16 (aproximadamente 60-70 GB en safetensors) y con los hermanos de AutomatosX:

| Modelo | Parametros | Contexto | Cuantizacion | Tamano | Licencia |
|---|---|---|---|---|---|
| Qwen3-VL-32B-Thinking (BF16) | 33.36B | 262.144 | BF16 | ~65 GB | Apache 2.0 |
| AX-Qwen3-VL-32B-Thinking-MLX-AXQ-MXFP4 | 33.36B (lógicos) | 262.144 (no validado) | MXFP4 mixto, 4.83 BPW | 20,2 GB | Apache 2.0 |
| AX-Qwen3-VL-32B-Thinking-MLX-AXQ-4bit | 33.36B (lógicos) | 262.144 (no validado) | 4-bit AXQ | no disponible | Apache 2.0 |
| AX-Qwen3-VL-32B-Thinking-MLX-AXQ-6bit | 33.36B (lógicos) | 262.144 (no validado) | 6-bit AXQ | no disponible | Apache 2.0 |

## Limitaciones y advertencias

- No es una versión certificada: el autor declara que no se han cerrado los gates formales de calidad M0-M8 de AXQuant, por lo que no hay garantía de retención de calidad.
- Sin benchmarks ni métricas de calidad: no se publican resultados de MMLU, HumanEval, GSM8K ni evaluaciones de visión-lenguaje.
- Contexto largo no validado: la ventana de 262.144 tokens es una capacidad configurada, no una afirmación probada; el rendimiento real en contextos extensos es desconocido.
- Solo Apple Silicon: el formato MLX limita el despliegue a hardware de Apple; no es utilizable en GPUs de NVIDIA o AMD sin conversión.
- Sin soporte de audio: el pack tiene audio desactivado, por lo que no se pueden usar capacidades de voz del modelo base.
- Riesgo de alucinación y sesgos: al ser una cuantización sin calibración, los errores del modelo base pueden amplificarse; no hay estudios de sesgo específicos para este checkpoint.
- Sin AX Engine nativo: no se incluye un manifiesto validado para AX Engine, por lo que la ejecución se limita al runtime MLX-VLM estándar.

## Enlaces

- Checkpoint en HuggingFace: https://huggingface.co/AutomatosX/AX-Qwen3-VL-32B-Thinking-MLX-AXQ-MXFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-32B-Thinking
- Hermano 4-bit: https://huggingface.co/AutomatosX/AX-Qwen3-VL-32B-Thinking-MLX-AXQ-4bit
- Hermano 6-bit: https://huggingface.co/AutomatosX/AX-Qwen3-VL-32B-Thinking-MLX-AXQ-6bit
- Colección de AutomatosX: https://huggingface.co/AutomatosX/collections
- Índice completo de modelos MLX de AutomatosX: https://huggingface.co/collections/AutomatosX/automatosx-mlx-model-catalog
