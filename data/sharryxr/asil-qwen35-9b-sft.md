# sharryXR/asil-qwen35-9b-sft

## Resumen

ASIL Qwen3.5-9B SFT es un checkpoint de liberación de paper (v0.1.0) del proyecto ASIL, desarrollado por sharryXR. Se trata de un fine-tuning supervisado (SFT) sobre el modelo base Qwen/Qwen3.5-9B, con 8.953.803.264 parámetros (aproximadamente 9B). El modelo se presenta en el artículo "ASIL: Replacing Screenshot-and-Click with Structured State and Semantic Actions" (arXiv:2608.26991), que propone sustituir el paradigma de captura de pantalla y clic por un estado estructurado y acciones semánticas, orientado a tareas de agente.

El repositorio contiene los pesos en formato safetensors, junto con config.json, tokenizer y generation_config.json. Los artefactos de entrenamiento (optimizador, logs, etc.) se excluyen deliberadamente. El checkpoint seleccionado corresponde al paso global 543, entrenado con 2.886 filas de entrenamiento y 732 de validación (datos deduplicados). La licencia es Apache 2.0.

Al ser un checkpoint de investigación, la información pública sobre capacidades, benchmarks y casos de uso es limitada. La relevancia actual radica en su propuesta metodológica para agentes, aunque su adopción en producción requeriría evaluación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3.5-9B) |
| Parametros totales | 8.953.803.264 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el modelo base Qwen3.5-9B soporta 262.144 tokens, pero no se confirma para este fine-tune) |
| Tipos de cuantizacion | No disponible (solo safetensors en el repo) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en Qwen3.5-9B, un transformer denso de 9B parámetros. No se dispone de detalles específicos sobre la arquitectura interna del fine-tune, pero al ser un SFT sobre el modelo base, hereda su estructura. El entrenamiento se realizó con un conjunto de datos propio (merged_v0_v2 deduplicado) con 2.886 ejemplos de entrenamiento y 732 de validación. No se han publicado detalles sobre el número de tokens, composición del dataset ni uso de RLHF/DPO. El paper ASIL propone un enfoque de estado estructurado y acciones semánticas, pero no se especifican innovaciones técnicas adicionales en la información disponible.

## Capacidades

- No se han documentado capacidades específicas para este checkpoint en la información proporcionada.
- Al estar basado en Qwen3.5-9B, se espera que herede capacidades de generación de texto, razonamiento, código y matemáticas, pero no hay confirmación oficial.
- No se dispone de información sobre tool calling, agentes, multilingüismo o modos especiales (thinking, visión, audio).

## Casos de uso

No se han documentado casos de uso concretos para este checkpoint. Dado su origen como fine-tune de Qwen3.5-9B y su propósito declarado (agentes con estado estructurado y acciones semánticas), podría aplicarse en escenarios como:

- Agentes de automatización de tareas en entornos web o de escritorio, donde el modelo interpreta estados estructurados en lugar de capturas de pantalla.
- Asistentes conversacionales con razonamiento multi-paso, aprovechando la base de Qwen3.5.
- Generación de código asistida, si el fine-tune conserva las capacidades del modelo base.
- Sistemas de diálogo con contexto largo, si se mantiene la ventana de 262K tokens del base.
- Investigación académica en metodologías de entrenamiento para agentes.
- Prototipos de integración con frameworks de agentes (p. ej., LangChain, AutoGPT) para evaluar el enfoque ASIL.

Estas aplicaciones son hipotéticas y requieren validación empírica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: ~18 GB (8.95B parámetros × 2 bytes).
- Con cuantización de 8 bits: ~9 GB; con 4 bits: ~4.5 GB (no hay cuantizaciones oficiales publicadas).
- GPU recomendadas: A100 (40/80 GB), H100, RTX 4090 (24 GB) para FP16; GPUs consumer de 8-12 GB podrían funcionar con cuantización, pero no hay soporte oficial.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI (compatibles con modelos transformers).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ASIL Qwen3.5-9B SFT | 8.95B | No disponible (base: 262K) | Apache 2.0 | HuggingFace |
| Qwen3.5-9B (base) | 9B | 262K | Apache 2.0 | HuggingFace |
| Llama 3.1 8B | 8B | 128K | Llama 3.1 Community License | HuggingFace |
| Mistral 7B v0.3 | 7B | 32K | Apache 2.0 | HuggingFace |

Los datos de contexto y licencia de los modelos comparados provienen de sus respectivas fichas públicas; no se dispone de comparativas de rendimiento.

## Limitaciones y advertencias

- Checkpoint de investigación: no ha sido evaluado de forma exhaustiva para uso en producción.
- Riesgo de alucinación y sesgos inherentes al modelo base Qwen3.5-9B, no mitigados específicamente en este fine-tune.
- Longitud de contexto no confirmada para el fine-tune; podría diferir del modelo base.
- Idiomas soportados no documentados; el modelo base es multilingüe, pero no hay garantía.
- Licencia Apache 2.0 permite uso comercial, pero el modelo se publica como "paper release" y podría tener restricciones adicionales no especificadas.
- No se incluyen cuantizaciones oficiales; el despliegue en hardware limitado requeriría conversión manual.

## Enlaces

- HuggingFace: https://huggingface.co/sharryXR/asil-qwen35-9b-sft
- Paper: https://huggingface.co/papers/2608.26991
- Página del proyecto: https://sharryxr.github.io/ASIL
- Código: https://github.com/sharryXR/ASIL
- Colección de modelos ASIL: https://huggingface.co/collections/sharryXR/asil-models
