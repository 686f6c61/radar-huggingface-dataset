# sjakek/slimder-qwen38-reap384-depth40-mb4-5-GGUF

## Resumen

El modelo `sjakek/slimder-qwen38-reap384-depth40-mb4-5-GGUF` es un export en formato GGUF para llama.cpp de un candidato experimental de poda estructural denominado "SLIMDER" (adelgazamiento de capas). Desarrollado por el autor independiente sjakek, parte de un checkpoint fuente con 48 capas y elimina las capas 16 a 23 (macroblocks 4 y 5), resultando en un modelo de 40 capas. El nombre sugiere una base sobre la familia Qwen3.8, aunque el recuento de parámetros materializados indicado en la model card es de 131.026.159.680, cifra que no coincide con los 27.000 millones del modelo Qwen3.8-27B publicado por Qwen, por lo que la relación exacta con ese modelo no está clara.

El repositorio se presenta como un artefacto portable para inferencia con llama.cpp, con licencia Apache 2.0 y sin métricas de rendimiento publicadas. Su relevancia radica en explorar la viabilidad de podar macrobloques completos de un transformer de gran tamaño manteniendo un funcionamiento básico, aunque el estado del proyecto es claramente experimental y sin validación externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen3.8, con atencion hibrida segun el modelo base Qwen3.8-27B) |
| Parametros totales | 131.026.159.680 (materializados, segun la model card) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen3.8-27B tiene 262K nativo, pero este export no lo especifica) |
| Tipos de cuantizacion | no disponible (el repositorio contiene archivos GGUF, pero no se listan las cuantizaciones concretas) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo es el resultado de una poda estructural sobre un checkpoint fuente de 48 capas, eliminando las capas 16 a 23 (macroblocks 4 y 5) para obtener 40 capas. La model card indica que el checkpoint fuente pasó una prueba de humo determinista con Transformers (logits finitos, sin meta tensores ni offload de disco, generación no vacía y generación greedy repetida idéntica), lo que sugiere que la poda no rompe por completo la funcionalidad básica. No se proporcionan datos sobre el entrenamiento original, el dataset utilizado, ni si se aplicaron técnicas como RLHF o DPO. La innovación principal es la eliminación de bloques completos de capas (macroblocks) y la posterior conversión a GGUF para su uso con llama.cpp. El repositorio se puebla incrementalmente mediante un "harness de exportación con presupuesto limitado", y solo los artefactos con manifiestos y registros SHA-256 se consideran promovidos.

## Capacidades

No se han documentado capacidades específicas para este modelo podado. Dado que se basa en la familia Qwen3.8, es razonable esperar que el modelo original tuviera capacidades de generación de texto, razonamiento, código, matemáticas y posiblemente visión (el modelo Qwen3.8-27B incluye una torre de visión). Sin embargo, la poda de 8 capas puede degradar significativamente estas capacidades. No hay información sobre tool calling, agentes o modos de pensamiento específicos para este export.

## Casos de uso

No se han publicado casos de uso concretos para este modelo. Al ser un artefacto experimental en formato GGUF, sus aplicaciones prácticas son limitadas y requieren validación previa. Posibles escenarios, siempre bajo la premisa de que el modelo funcione correctamente tras la poda:

- Experimentación académica: investigar el impacto de la poda de macrobloques en el rendimiento de modelos transformer de gran escala, comparando la salida con el modelo original.
- Inferencia local con llama.cpp: probar el modelo en entornos de desarrollo con llama.cpp u Ollama para evaluar su viabilidad en hardware de consumo, aunque el tamaño de parámetros (131B) hace improbable que quepa en GPUs de gama media.
- Estudio de degradación de capacidades: analizar qué habilidades se pierden al eliminar capas intermedias, útil para diseñar estrategias de poda más selectivas.
- Desarrollo de técnicas de compresión: servir como caso de estudio para métodos de adelgazamiento estructural en modelos de la familia Qwen.
- Verificación de reproducibilidad: dado que el autor proporciona hashes SHA-256 y revisiones fijadas, puede usarse para reproducir experimentos de poda y conversión.
- Evaluación de calidad de cuantización: si se publican archivos GGUF con diferentes cuantizaciones, se podría medir el impacto de la cuantización sobre el modelo ya podado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluación estándar. Tampoco se comparan los resultados con el modelo original o con otras variantes podadas.

## Requisitos de hardware

No se dispone de información específica sobre requisitos de hardware para este modelo. El recuento de parámetros materializados (131.026.159.680) sugiere un modelo muy grande, lo que implicaría necesidades de VRAM elevadas:

- VRAM estimada: no disponible. En FP16, 131B parámetros requerirían aproximadamente 262 GB; en cuantización Q4, alrededor de 65 GB. Sin embargo, no se confirma que el modelo tenga realmente 131B parámetros efectivos, ya que la cifra podría referirse al checkpoint original antes de la poda.
- GPU recomendadas: no disponible. Dado el tamaño, se necesitarían múltiples GPUs de alta gama (A100 80GB, H100) o soluciones de CPU con mucha RAM.
- Compatibilidad con GPU de consumo: improbable si el tamaño real es de 131B; el modelo base Qwen3.8-27B sí cabe en una RTX 3090 de 24 GB con cuantización, pero este export no parece ser ese modelo.
- Opciones de despliegue: al ser GGUF, es compatible con llama.cpp, Ollama y otros runners que soporten este formato. También podría usarse con vLLM si se convierte a safetensors, aunque no se proporciona.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar este modelo con alternativas. El modelo base Qwen3.8-27B (27B parámetros, atención híbrida con 48 de 64 capas lineales, contexto 262K) es el referente natural, pero este export tiene un recuento de parámetros muy superior (131B) y una profundidad reducida (40 capas frente a 64 del Qwen3.8-27B). No se puede establecer una comparación cuantitativa sin benchmarks.

| Modelo | Parametros | Capas | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| sjakek/slimder-qwen38-reap384-depth40-mb4-5-GGUF | 131B (materializados) | 40 | no disponible | Apache 2.0 | GGUF |
| Qwen/Qwen3.8-27B | 27B | 64 | 262K | Apache 2.0 | safetensors, GGUF |
| sunnyyy/qwen38-27b-huihui-slim-lora | LoRA 203 MB | - | - | no disponible | LoRA |

## Limitaciones y advertencias

- Modelo experimental sin validación externa: no hay benchmarks, evaluaciones de sesgo ni pruebas de robustez publicadas.
- La poda de 8 capas (macroblocks 4 y 5) puede degradar severamente la coherencia, el razonamiento y la generación de código, aunque la prueba de humo básica pasó.
- El recuento de parámetros materializados (131B) es inconsistente con el nombre del modelo (qwen38) y con el modelo base Qwen3.8-27B; podría tratarse de un error en la model card o de un modelo base diferente no especificado.
- El repositorio se puebla incrementalmente; no todos los artefactos están garantizados. Solo los que tienen manifiesto y SHA-256 deben considerarse fiables.
- No se especifican los idiomas soportados ni la longitud de contexto efectiva tras la poda.
- La licencia Apache 2.0 permite uso comercial, pero al ser un modelo derivado de Qwen, deben respetarse los términos de la licencia original de Qwen (también Apache 2.0).
- Riesgo de alucinación y sesgos: no se ha evaluado, y la poda podría exacerbar estos problemas.

## Enlaces

- Repositorio HuggingFace del modelo GGUF: https://huggingface.co/sjakek/slimder-qwen38-reap384-depth40-mb4-5-GGUF
- Modelo base (checkpoint fuente): https://huggingface.co/sjakek/slimder-qwen38-reap384-depth40-mb4-5
- Fuente portable S0: https://huggingface.co/sjakek/slimder-qwen38-reap384-s0
- Modelo Qwen3.8-27B original: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio de LoRA slim (referencia): https://huggingface.co/sunnyyy/qwen38-27b-huihui-slim-lora
- Guía de despliegue en RTX 3090 (referencia): https://github.com/syv-ai/qwen38-27b-rtx3090
- Medición de rendimiento en AMD R9700 (referencia): https://github.com/rahlquist/qwen38-r9700
- Recetas vLLM para Qwen3.8-27B: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
