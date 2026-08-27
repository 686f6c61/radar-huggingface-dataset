# kingjones777/Qwen3.8-Flash-Next-Uncensored-ROCmFP4-STRIX_LEAN-GGUF

## Resumen

Qwen3.8-Flash-Next-Uncensored-ROCmFP4-STRIX_LEAN-GGUF es una cuantización GGUF del checkpoint abliterado `orcarouter/Qwen3.8-Flash-Next-Uncensored`, que a su vez deriva del modelo base `Qwen/Qwen3.8-Flash-Next` de Alibaba Cloud. Se trata de un modelo de lenguaje multimodal de tipo Mixture-of-Experts ultra-sparse con 176.9B parámetros totales (incluyendo una tabla de embeddings N-gram de 51B y un módulo de multi-token prediction de 4B), de los cuales solo 6B se activan por token. Su arquitectura combina Gated DeltaNet (GDN) y Qwen Sparse Attention (QSA), lo que permite una ventana de contexto nativa de 262.144 tokens.

La versión cuantizada, creada por kingjones777, está optimizada específicamente para el hardware AMD Strix Halo (APU Ryzen AI Max+ 395, GPU gfx1151) mediante el formato ROCmFP4 y el fork ROCmFPX de llama.cpp. El resultado es un archivo GGUF de 98.49 GiB (4.78 bpw) que alcanza 22.5 tok/s de generación y 222 tok/s de procesamiento de prompt en ese hardware, con 63.3 GiB de memoria GPU residente. Su relevancia radica en permitir ejecutar un modelo de ~177B parámetros en un equipo de escritorio con memoria unificada de 128 GB, sin necesidad de GPUs dedicadas de centro de datos.

La abliteración elimina los comportamientos de rechazo del modelo original, lo que lo convierte en un artefacto de investigación para estudiar la alineación y la censura, pero también implica un mayor riesgo de generar contenido dañino. La licencia es `qwen-community-1.0`, que permite uso comercial con restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen4exp (MoE ultra-sparse, GDN + QSA, embeddings N-gram, multi-token prediction) |
| Parametros totales | 176.943.899.520 (176.9B) |
| Parametros activos | 6B por token |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | Q4_0_ROCMFP4_STRIX_LEAN (4.78 bpw, 98.49 GiB) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 |
| Formato de pesos | GGUF (sharded en 3 archivos) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next emplea una arquitectura híbrida de atención: tres de cada cuatro capas usan Gated DeltaNet (GDN) para comprimir el historial, mientras que la cuarta capa utiliza Qwen Sparse Attention (QSA) para recuperación precisa de largo alcance. Esta combinación reduce el coste de la ventana de contexto: el crecimiento de memoria entre 8k y 128k tokens es solo de ~4 GiB, porque QSA limita el tamaño de las claves y valores. Además, incorpora una tabla de embeddings N-gram de 51B parámetros (denominada `per_layer_token_embd.weight`) y un módulo de multi-token prediction de 4B parámetros.

El checkpoint abliterado de orcarouter elimina los comportamientos de rechazo del modelo original mediante una técnica de "abliteración" (modificación de los pesos para anular las direcciones de refusal). La cuantización de kingjones777 convierte los pesos BF16 a GGUF con el formato ROCmFP4, aplicando Q5_K a los embeddings de token, Q6_K a la cabeza de salida (`output.weight`) y Q5_1 a la tabla de embeddings N-gram. El proceso de cuantización se validó comparando el tamaño con una build alineada del mismo modelo, confirmando que la abliteración no altera la estructura de pesos.

## Capacidades

- Generación de texto y razonamiento complejo, incluyendo tareas de matemáticas y lógica (el modelo base reporta GPQA 91.7 según HokAI).
- Generación de código y soporte para agentes de codificación (el modelo base supera a Claude-4.6-Opus en agentic coding según unsloth).
- Capacidades multimodales: incluye un `mmproj` de visión (0.85 GiB) que permite procesar imágenes junto con texto.
- Soporte de tool calling y function calling (heredado del modelo base, aunque no se documenta explícitamente en esta cuantización).
- Ventana de contexto de 262.144 tokens, adecuada para documentos largos y conversaciones multi-turno extensas.
- Comportamiento "uncensored": no muestra rechazos ante solicitudes dañinas (22 de 24 prompts dañinos obtuvieron cumplimiento en las pruebas del autor).
- Multilingüe (los idiomas exactos no están especificados en la información disponible).

## Casos de uso

- Ejecución local de un modelo de ~177B en hardware AMD consumer: gracias a la cuantización ROCmFP4 y la optimización para gfx1151, se puede desplegar en un equipo con Ryzen AI Max+ 395 y 128 GB de memoria unificada, sin GPUs dedicadas. Adecuado para desarrolladores que necesitan un modelo de gran tamaño en un entorno de escritorio.
- Investigación en alineación y seguridad de IA: la versión abliterada permite estudiar cómo se comporta un modelo sin guardarraíles, comparando respuestas con la versión alineada. El autor publica métricas de refusal y calidad para facilitar este análisis.
- Generación de código en entornos sin conexión: el modelo base destaca en agentic coding, y esta cuantización permite ejecutarlo localmente con 22.5 tok/s, suficiente para tareas de autocompletado y refactorización en un IDE.
- Análisis de documentos extensos: con 262K de contexto, se puede procesar libros completos, expedientes legales o historiales médicos en una sola pasada, manteniendo la coherencia gracias a la atención híbrida GDN+QSA.
- Chatbots y asistentes sin censura para entornos controlados: útil en investigación de ciencias sociales o pruebas de estrés de modelos, donde se requiere explorar respuestas sin filtros de seguridad.
- Prototipado de aplicaciones multimodales: el `mmproj` de visión permite construir asistentes que combinan comprensión de imágenes y texto, por ejemplo para descripción de capturas de pantalla o análisis de diagramas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) específicos para esta cuantización en la información disponible. El modelo base Qwen3.8-Flash-Next reporta GPQA 91.7 según HokAI, pero no se dispone de comparaciones detalladas con otras cuantizaciones.

Los datos de rendimiento de inferencia medidos por el autor en Ryzen AI MAX+ 395 (gfx1151, ROCm 7.2.4, offload completo 49/49) son:

| Contexto | Prompt (tokens) | Prompt processing (tok/s) | Generación (tok/s) | Memoria GPU |
|---|---|---|---|---|
| 131.072 | 111.411 | 185 | 15.33 | 69.1 GiB |
| 262.144 | 8.000 | 307 | 22.48 | 72.0 GiB |
| 262.144 | 200.000 | 128 | 10.46 | 74.9 GiB |

En pruebas con prompts únicos, la generación media fue de 22.5 tok/s y el procesamiento de prompt de 222 tok/s.

## Requisitos de hardware

- VRAM estimada: 63.3 GiB residentes en GPU con offload completo (en el hardware de prueba). En un sistema con memoria unificada, esta cifra corresponde a la memoria compartida.
- GPU recomendada: AMD Ryzen AI Max+ 395 (gfx1151) con ROCm 7.2.4. No se garantiza funcionamiento en otras GPUs AMD o NVIDIA.
- No cabe en GPUs consumer convencionales (RTX 4090, etc.) debido al tamaño del modelo y al formato ROCmFP4 específico de AMD.
- Opciones de despliegue: llama.cpp con el fork ROCmFPX (requiere PR #27742). Se puede usar `llama-server` con los flags `--n-gpu-layers 999 --flash-attn on --fit off --ctx-size 131072 --threads 16 --jinja`.
- Latencia y throughput: 22.5 tok/s de generación y 222 tok/s de prompt processing en el hardware de referencia. Con contextos muy largos (200K tokens), la generación baja a ~10 tok/s.
- Advertencia: no usar `--no-mmap`; la tabla de embeddings N-gram se transmite desde el archivo a través de la caché de páginas, y forzarla a memoria anónima provoca OOM-kill.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next (base) | 176.9B (6B activos) | 262.144 | BF16 | qwen-community-1.0 | GPUs de centro de datos |
| orcarouter/Qwen3.8-Flash-Next-Uncensored | 176.9B (6B activos) | 262.144 | BF16 | qwen-community-1.0 | GPUs de centro de datos |
| kingjones777/Qwen3.8-Flash-Next-Uncensored-ROCmFP4-STRIX_LEAN-GGUF | 176.9B (6B activos) | 262.144 | Q4_0_ROCMFP4 (4.78 bpw) | qwen-community-1.0 | AMD Strix Halo (gfx1151) |

La comparativa se limita a las variantes del mismo modelo porque no se dispone de datos suficientes sobre alternativas de la misma categoría (otros MoE ultra-sparse) en la información proporcionada.

## Limitaciones y advertencias

- Requiere un fork específico de llama.cpp (ROCmFPX con PR #27742). Las builds estándar no cargarán el archivo, ya que tanto la arquitectura `qwen4exp` como los tipos de tensor `Q4_0_ROCMFP4_*` solo existen en ese fork.
- Hardware restringido: la cuantización está optimizada para AMD gfx1151 (Strix Halo). No se garantiza su funcionamiento en otras GPUs AMD o en hardware NVIDIA.
- La abliteración elimina los guardarraíles de seguridad. El modelo puede generar contenido dañino, ilegal o éticamente problemático. El autor lo etiqueta como "artefacto de investigación" y advierte que el usuario es responsable de las salidas.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede inventar información, especialmente en contextos largos o con prompts ambiguos. No se han publicado evaluaciones específicas de alucinación para esta cuantización.
- Licencia `qwen-community-1.0`: permite uso comercial, pero con restricciones (por ejemplo, no usar el modelo para servicios que compitan directamente con los de Alibaba). Se recomienda revisar los términos completos.
- El tamaño del archivo (98.49 GiB) y la necesidad de memoria unificada de 128 GB limitan su despliegue a equipos muy específicos.
- No se deben usar flags como `--no-mmap` porque el proceso puede ser eliminado por OOM sin dejar registro en el servidor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kingjones777/Qwen3.8-Flash-Next-Uncensored-ROCmFP4-STRIX_LEAN-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Checkpoint abliterado: https://huggingface.co/orcarouter/Qwen3.8-Flash-Next-Uncensored
- Repositorio GitHub de Qwen3.8-Flash-Next: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Recetas vLLM para Qwen3.8-Flash-Next: https://recipes.vllm.ai/Qwen/Qwen3.8-Flash-Next
- Guía de ejecución local en unsloth: https://unsloth.ai/docs/models/qwen3.8-next
- Ficha en HokAI: https://hokai.io/hub/models/qwen3.8-flash-next
