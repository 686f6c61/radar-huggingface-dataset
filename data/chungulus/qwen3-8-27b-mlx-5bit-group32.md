# Chungulus/Qwen3.8-27B-MLX-5bit-Group32

## Resumen

El modelo `Chungulus/Qwen3.8-27B-MLX-5bit-Group32` es una cuantización MLX de 5 bits con grupo de 32 del modelo base `Qwen/Qwen3.8-27B`, desarrollado por el equipo de Qwen (Alibaba). El autor del repositorio, Chungulus, ha aplicado una conversión "vanilla" sin fine-tuning, merge ni modificación de la plantilla de chat, manteniendo los pesos originales fijados en un commit concreto. El resultado es un artefacto de aproximadamente 22 GB que permite ejecutar un modelo de visión-lenguaje de 27B en hardware Apple Silicon con memoria unificada, algo que de otro modo requeriría mucho más espacio.

El modelo base es un transformer denso de 27B con arquitectura híbrida (atención completa y Gated DeltaNet), torre de visión, proyector y un módulo MTP (Multi-Token Prediction) para decodificación especulativa. Soporta razonamiento configurable, tool calling nativo y una ventana de contexto nativa de 262K tokens según LM Studio (256K según Unsloth). Esta cuantización específica está pensada para entornos MLX (Apple Silicon) y ha pasado pruebas de validación estructurales y funcionales, incluyendo comparaciones de similitud semántica con la versión BF16 original.

La relevancia actual radica en que permite desplegar un modelo de 27B con capacidades multimodales y agénticas en equipos de consumo con 32 GB de RAM unificada, sin necesidad de GPUs dedicadas de alta gama. Es una opción práctica para desarrolladores que trabajan con MLX y necesitan un modelo local con visión, tool calling y razonamiento configurable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (atención completa + Gated DeltaNet) con torre de visión, proyector y módulo MTP |
| Parametros totales | 27B (modelo base); la metadata del repo reporta 6.346.296.560 en safetensors, cifra que no coincide con la denominación oficial |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262K tokens (según LM Studio); 256K según Unsloth |
| Tipos de cuantizacion | MLX 5-bit con group size 32 |
| Idiomas soportados | No disponible en la metadata; el modelo base es multilingüe según documentación de Qwen |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base `Qwen/Qwen3.8-27B` utiliza el identificador interno `Qwen3_5ForConditionalGeneration` / `qwen3_5`, que no debe confundirse con una versión Qwen3.5. Se trata de un transformer denso con una arquitectura híbrida que combina atención completa con capas Gated DeltaNet, una torre de visión (333 tensores de visión en el inventario), un proyector multimodal y un módulo MTP para decodificación especulativa. El repositorio cuantizado incluye 1199 tensores en total, de los cuales 15 corresponden al drafter MTP.

No se dispone de información sobre los datos de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO) en la documentación proporcionada. Esta cuantización es una conversión directa sin calibración (calibration source: none) y sin fine-tuning posterior. La conversión se realizó con el algoritmo MLX affine 5-bit con group size 32, y el runtime requerido es `mlx-vlm` versión 0.6.1.

La validación interna reporta una similitud semántica media de 0.9774 frente a la versión BF16, una divergencia KL media de 0.00499 y una concordancia top-1 del 95.28% en una comparación de logits fijos. El módulo MTP muestra una tasa de aceptación de 0.9545 y una aceleración medida del 11.5% en throughput (de 11.89 a 13.26 tokens por segundo).

## Capacidades

- Generación de texto y razonamiento: el modelo base es capaz de tareas de razonamiento complejo, con modos de pensamiento configurables (`enable_thinking`, `reasoning_effort`, `preserve_thinking`).
- Visión y video: incluye una torre de visión que procesa imágenes y video; las pruebas locales deterministas pasaron correctamente.
- Tool calling: soporta el formato nativo de herramientas XML de Qwen; las cinco pruebas de tool calling pasaron.
- Decodificación especulativa MTP: el drafter MTP acelera la generación sin cambiar la salida a temperatura cero (equivalencia verificada).
- Multilingüismo: el modelo base es multilingüe, aunque la metadata de este repo no especifica la lista de idiomas.
- Razonamiento configurable: permite ajustar el esfuerzo de razonamiento y conservar o eliminar el pensamiento intermedio.
- Capacidad agéntica: según LM Studio, está diseñado para tareas agénticas de largo horizonte y coding agéntico.

## Casos de uso

- Asistente de programación local: un desarrollador puede ejecutar el modelo en un Mac con 32 GB de RAM unificada para generar código, explicar fragmentos y refactorizar, aprovechando el tool calling para integrarse con editores o CLIs.
- Análisis de imágenes en entornos sin GPU: el modelo procesa capturas de pantalla, diagramas o fotografías para extraer información, gracias a su torre de visión, sin necesidad de servicios en la nube.
- Automatización de tareas agénticas: con soporte de tool calling y razonamiento configurable, puede orquestar flujos multi-paso como búsqueda de información, ejecución de comandos o gestión de archivos en un entorno local.
- Prototipado de chatbots con contexto largo: su ventana de 262K tokens permite mantener conversaciones extensas con historial completo, útil para asistentes de documentación o atención al cliente en pruebas de concepto.
- Investigación académica en MLX: sirve como banco de pruebas para estudiar el impacto de la cuantización 5-bit en modelos multimodales, ya que incluye métricas de validación detalladas.
- Desarrollo de aplicaciones de visión-lenguaje en Apple Silicon: permite crear aplicaciones que combinan entrada de imagen y texto, como descripción de imágenes médicas o análisis de documentos escaneados, todo en local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye métricas de validación interna (similitud semántica, divergencia KL, tasa de aceptación MTP) pero no resultados de pruebas estandarizadas como MMLU, HumanEval o GSM8K. No se deben inferir cifras de rendimiento académico a partir de estas validaciones.

## Requisitos de hardware

- Memoria unificada: se recomienda Apple Silicon con al menos 32 GB de RAM unificada; el pico de memoria medido durante la validación fue de 23.64 GB.
- GPU: no requiere GPU dedicada; funciona con la GPU integrada de Apple Silicon (M1 Pro/Max/Ultra, M2, M3, M4, etc.).
- Tamaño del artefacto: 21.99 GB (decimal), por lo que se necesita espacio en disco suficiente.
- Runtime: requiere `mlx==0.31.2`, `mlx-lm==0.31.3`, `mlx-vlm==0.6.1` y `huggingface-hub[cli]`.
- Throughput medido: 12.57 tokens por segundo en generación promedio (sin MTP) y 13.26 tokens por segundo con MTP activado, en el hardware de prueba del autor.
- Opciones de despliegue: exclusivamente MLX; no es compatible directamente con vLLM, llama.cpp u Ollama en este formato. Para otros runtimes existen versiones GGUF del modelo base (según Unsloth).

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa rigurosa con otros modelos de la misma categoría. Este repositorio es una cuantización específica del modelo base `Qwen/Qwen3.8-27B`, por lo que la comparación natural sería contra la versión BF16 original, que requiere aproximadamente 54 GB en FP16 y no es viable en hardware de consumo sin cuantización. Otras alternativas de 27B como Llama 3.1 8B o Qwen2.5-27B no son directamente comparables por diferencias de arquitectura y capacidades multimodales. Se recomienda consultar la documentación oficial de Qwen para comparativas con otros modelos de la familia.

## Limitaciones y advertencias

- La cuantización 5-bit puede reducir la calidad de salida en comparación con la versión BF16, especialmente en tareas que requieren precisión numérica o razonamiento largo.
- La longitud de contexto probada en la validación fue de solo 73 tokens de prompt; no se ha verificado el comportamiento en contextos largos cercanos al máximo arquitectónico (262K). No se debe asumir que el modelo mantiene la calidad en toda la ventana.
- El soporte de runtime es específico de MLX; un cargador que solo lea tensores de lenguaje no es suficiente para ejecutar el modelo completo (se requiere la torre de visión, el proyector y el drafter MTP).
- La metadata del repositorio reporta 6.346.296.560 parámetros en safetensors, lo que contradice la denominación de 27B del modelo base; esta discrepancia no está explicada y podría deberse a un error de la metadata o a una métrica distinta.
- No se han publicado benchmarks públicos, por lo que el rendimiento académico real es desconocido.
- La licencia Apache-2.0 permite uso comercial, pero se debe mantener la atribución al modelo base y a este repositorio.
- El autor advierte que las mediciones de rendimiento son específicas del artefacto, del prompt, del contexto y del hardware; no son generalizables.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Chungulus/Qwen3.8-27B-MLX-5bit-Group32
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio alternativo (misma cuantización, sin Group32): https://huggingface.co/Chungulus/Qwen3.8-27B-MLX-5bit
- Blog de AMD sobre ejecución local: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
- Página de LM Studio: https://lmstudio.ai/models/qwen3.8
- Documentación de Unsloth: https://unsloth.ai/docs/models/qwen3.8
- Artículo de OpenLM.ai: https://openlm.ai/qwen3.8/
