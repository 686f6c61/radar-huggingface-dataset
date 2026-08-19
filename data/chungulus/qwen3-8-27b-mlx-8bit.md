# Chungulus/Qwen3.8-27B-MLX-8bit

## Resumen

El modelo `Chungulus/Qwen3.8-27B-MLX-8bit` es una cuantización en 8 bits del modelo multimodal Qwen/Qwen3.8-27B, realizada por el usuario Chungulus y publicada en HuggingFace. Se trata de una conversión "vanilla" (sin fine-tuning, merges ni cambios de alineación) que aplica cuantización afín MLX con tamaño de grupo 64, manteniendo los componentes de visión en FP16 e incorporando un drafter MTP (Multi-Token Prediction) para acelerar la decodificación. El checkpoint está pensado para ejecutarse en Apple Silicon con 64 GB de memoria unificada, y se distribuye bajo licencia Apache-2.0.

La relevancia de este modelo radica en que permite ejecutar localmente un sistema multimodal de 27B (según la denominación del modelo base) en hardware de Apple, con soporte para texto, visión/video, tool calling y decodificación especulativa vía MTP. El autor reporta una aceleración medida de 1.54x en throughput gracias al drafter MTP, y una similitud semántica media de 0.981 frente al checkpoint BF16 original. Aunque el nombre "Qwen3.8" puede inducir a confusión, la model card aclara que la arquitectura interna usa el identificador `qwen3_5`, pero no proviene de un modelo Qwen3.5.

El repositorio incluye 1199 tensores (333 de visión, 15 de MTP) y un tamaño de artefacto de 30.4 GB. Es una opción interesante para desarrolladores que necesiten un modelo multimodal local con capacidades de agente y razonamiento, siempre que dispongan de hardware Apple Silicon con suficiente memoria.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Gated DeltaNet / atención completa, con torre de visión y proyector (identificador interno `qwen3_5`) |
| Parametros totales | 8.027.131.120 (según safetensors; el modelo base se denomina 27B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible (la validación solo probó hasta 73 tokens de prompt) |
| Tipos de cuantizacion | 8-bit MLX affine, group size 64; visión en FP16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base Qwen/Qwen3.8-27B utiliza una arquitectura híbrida que combina capas Gated DeltaNet con atención completa, e incorpora una torre de visión, un proyector y un componente MTP (Multi-Token Prediction) para decodificación especulativa. El identificador interno de arquitectura es `Qwen3_5ForConditionalGeneration` / `qwen3_5`, pero la model card advierte explícitamente que esto no significa que los pesos provengan de un modelo Qwen3.5.

Este checkpoint concreto es una cuantización MLX en 8 bits con tamaño de grupo 64, sin calibración (calibration source: none). La conversión mantiene los tensores de visión en FP16 y añade un drafter MTP companion. El autor reporta que la conversión pasó pruebas de liberación en texto, visión/video, tool calling y MTP, con una similitud semántica media de 0.981 frente al BF16 original (medida con `paraphrase-multilingual-MiniLM-L12-v2`). No se proporcionan datos sobre el entrenamiento del modelo base (número de tokens, dataset, RLHF/DPO, etc.).

## Capacidades

- Generación de texto conversacional y multimodal (image-text-to-text).
- Comprensión de imágenes y video (según pruebas locales deterministas del autor).
- Tool calling nativo con formato XML de Qwen.
- Decodificación especulativa mediante drafter MTP, con aceleración medida de 1.54x en throughput.
- Soporte de chat template, tokenizer, processor y generation config verificados contra el modelo base.
- Control de razonamiento mediante parámetros `enable_thinking`, `reasoning_effort` y `preserve_thinking`.

## Casos de uso

- Asistente multimodal local en Apple Silicon: el modelo puede procesar imágenes y texto simultáneamente, permitiendo crear asistentes que describan imágenes, respondan preguntas visuales o transcriban contenido gráfico sin conexión a la nube.
- Análisis de documentos con imágenes: al combinar visión y texto, puede extraer información de capturas, diagramas o formularios escaneados en entornos con privacidad estricta.
- Automatización de tareas con tool calling: su soporte nativo para herramientas XML permite integrarlo en pipelines que llaman APIs, ejecutan comandos o consultan bases de datos, todo desde un equipo local.
- Prototipado de agentes conversacionales: con la capacidad de razonamiento multi-paso y el control de thinking, es adecuado para experimentar con agentes que planifican y ejecutan acciones secuenciales.
- Generación de código asistida por visión: puede recibir capturas de pantalla de errores o diagramas de arquitectura y generar o corregir código relacionado, útil en entornos de desarrollo sin acceso a servicios externos.
- Evaluación de cuantización y rendimiento: al ser una cuantización "vanilla" con métricas de validación publicadas, sirve como referencia para estudiar el impacto de la cuantización MLX en modelos multimodales grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card incluye métricas de validación propias del autor:

| Metrica | Valor |
|---|---|
| Similitud semantica media vs BF16 | 0.9814 |
| Coincidencias exactas vs BF16 | 9 (de un conjunto de pruebas funcionales) |
| Throughput base (sin MTP) | 7.20 tokens/s |
| Throughput con MTP | 11.11 tokens/s |
| Aceleracion MTP | 1.54x |
| Pico de memoria | 33.26 GB |
| Prompt maximo probado | 73 tokens |

Estas cifras son específicas del artefacto, hardware y prompts utilizados, y no deben interpretarse como benchmarks generales.

## Requisitos de hardware

- Hardware recomendado: Apple Silicon con 64 GB de memoria unificada (según la model card).
- Pico de memoria medido: 33.26 GB durante la generación.
- Tamaño del artefacto: 30.4 GB en disco.
- GPU: no aplica (diseñado para Apple Silicon, no para GPUs NVIDIA/AMD).
- Opciones de despliegue: `mlx-vlm` 0.6.1, `mlx-lm` 0.31.3, `mlx` 0.31.2.
- Latencia y throughput: ~7.2 tokens/s sin MTP y ~11.1 tokens/s con MTP en el hardware de prueba del autor.
- No cabe en GPUs de consumo convencionales (RTX 4090, etc.) porque el formato MLX está orientado al ecosistema Apple.

## Comparativa con modelos similares

No se dispone de información suficiente en la documentación proporcionada para establecer una comparativa rigurosa con otros modelos de la misma categoría. El modelo base Qwen/Qwen3.8-27B no tiene una ficha técnica detallada en la información disponible, y no se mencionan alternativas comparables. Se recomienda consultar el repositorio oficial de Qwen para obtener datos de comparación con otros modelos multimodales de tamaño similar.

## Limitaciones y advertencias

- La cuantización en 8 bits puede reducir la calidad de salida, especialmente en tareas complejas de razonamiento o generación larga.
- El soporte runtime es específico: el grafo híbrido Gated DeltaNet/atención completa, la torre de visión, el proyector, el processor y el MTP requieren `mlx-vlm` 0.6.1 y versiones concretas de `mlx` y `mlx-lm`. Un cargador que solo lea tensores de lenguaje no es suficiente.
- La longitud de contexto probada es de solo 73 tokens de prompt; no se debe asumir que el modelo funciona correctamente en contextos largos sin pruebas adicionales.
- El identificador de arquitectura `qwen3_5` puede confundir; no es un modelo Qwen3.5.
- No se han publicado datos sobre sesgos, alucinaciones o comportamiento en idiomas distintos de los probados (no se especifican idiomas soportados).
- La licencia Apache-2.0 permite uso comercial, pero se debe verificar la atribución del modelo base en el repositorio oficial de Qwen.
- El hardware requerido (Apple Silicon con 64 GB) es costoso y no está disponible en la mayoría de entornos de servidor tradicionales.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/Chungulus/Qwen3.8-27B-MLX-8bit
- Modelo base Qwen/Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Evaluador de similitud semántica: https://huggingface.co/sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2
