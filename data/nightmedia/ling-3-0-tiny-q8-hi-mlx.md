# nightmedia/Ling-3.0-tiny-q8-hi-mlx

## Resumen

El modelo `nightmedia/Ling-3.0-tiny-q8-hi-mlx` es una conversión a formato MLX del modelo `inclusionAI/Ling-3.0-tiny`, realizada por `nightmedia` y cuantizada a 8 bits (variante `q8-hi`). El modelo base, desarrollado por InclusionAI, es un modelo de lenguaje compacto de tipo Mixture-of-Experts (MoE) con arquitectura híbrida de atención lineal nativa, diseñado para entornos con recursos limitados y flujos de trabajo agénticos de alto rendimiento. Según la documentación del modelo base, combina KDA (Kernel-based Dynamic Attention) con Gated MLA (Multi-head Latent Attention) para procesar contextos largos de forma eficiente.

El repositorio contiene un modelo con 7.893.355.648 parámetros totales (~7.9 B), almacenado en formato `safetensors` y destinado a ejecutarse con la librería `mlx-lm`. La cuantización a 8 bits reduce la memoria pico hasta 14.04 GB manteniendo una perplejidad idéntica a la versión en bf16 (5.614). No se especifican idiomas soportados ni longitud de contexto en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrido con atención lineal nativa (KDA + Gated MLA) |
| Parametros totales | 7.893.355.648 (~7.9 B) |
| Parametros activos | 1.300 millones activados por token (según crafiq.ai); no confirmado en la model card |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Variante 8-bit (q8-hi) en este repositorio; el autor también ofrece bf16 y q6-hi |
| Idiomas soportados | no disponible (no especificado en la model card) |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo es una cuantización MLX de `inclusionAI/Ling-3.0-tiny`, realizada con `mlx-lm` versión 0.32.0. El modelo base de InclusionAI adopta una arquitectura de tipo MoE con atención lineal híbrida nativa: la combinación de KDA y Gated MLA permite una gestión eficiente de secuencias largas desde la fase de preentrenamiento, según la información publicada por InclusionAI en el repositorio del modelo base. El texto del modelo base indica que esta arquitectura activa 5.1 B de parámetros no relacionados con embeddings por token, mientras que la fuente externa crafiq.ai reporta 1.3 B de parámetros activados por token para Ling 3.0 Tiny.

No se proporcionan detalles sobre datos de entrenamiento, número de tokens, composición del dataset ni técnicas como RLHF o DPO en la información disponible.

## Capacidades

- Generación de texto y conversación: el modelo está etiquetado como `text-generation` y `conversational`, por lo que puede utilizarse para tareas de chat y generación de texto.
- Procesamiento eficiente de contextos largos: gracias a la atención lineal híbrida del modelo base, puede manejar entradas extensas con menor coste cuadrático que un transformer clásico.
- Adecuado para recursos limitados: la cuantización 8-bit reduce la memoria pico a 14.04 GB y permite ejecución con tokens por segundo de hasta 3761 según los datos del autor.
- Uso agéntico de alto rendimiento: crafiq.ai indica que el modelo está orientado a "high-throughput agentic workflows", es decir, flujos de trabajo con agentes en entornos restringidos.
- No se dispone de información confirmada sobre tool calling, soporte de visión, audio o funciones de "thinking mode".

## Casos de uso

- Asistentes conversacionales en Apple Silicon: el modelo se puede ejecutar directamente con `mlx-lm` en un Mac con memoria unificada suficiente (al menos 16 GB), lo que lo hace adecuado para prototipos y asistentes locales sin dependencia de GPU NVIDIA.
- Análisis de documentos largos: la arquitectura de atención lineal del modelo base permite procesar textos extensos, como informes o contratos, con un coste de memoria más predecible que un transformer estándar.
- Agentes autónomos en entornos restringidos: al estar diseñado para flujos de trabajo agénticos de alto rendimiento, puede integrarse en sistemas de automatización donde el hardware es limitado y se necesita gestión de conversaciones multi-turno.
- Investigación académica en arquitecturas MoE híbridas: sirve como referencia para estudiar el comportamiento de modelos con atención lineal nativa y cuantización 8-bit comparado con variantes en bf16 y q6-hi.
- Evaluación experimental de cuantización: permite analizar el trade-off entre precisión y velocidad (3761 tokens/s en q8-hi frente a 4459 en bf16) en tareas de razonamiento básico como ARC, BoolQ o PIQA.
- Prototipado rápido en local: gracias a su tamaño compacto y a la cuantización, puede usarse en ordenadores personales para pruebas de concepto de generación de texto y aplicaciones conversacionales antes de escalar a modelos mayores.

## Benchmarks y rendimiento

La model card incluye datos de evaluación del autor bajo la etiqueta "Brainwaves", que cubren perplejidad, memoria pico y velocidad. Los datos de razonamiento son parciales: para la variante `q8-hi` solo se reporta ARC; para `q6-hi` se reportan varias tareas; los valores de `bf16` no se incluyen en la tabla de razonamiento.

| Metrica | q8-hi | q6-hi | bf16 |
|---|---|---|---|
| Perplejidad | 5.614 ± 0.043 | 5.630 ± 0.043 | 5.614 ± 0.043 |
| Memoria pico | 14.04 GB | 12.19 GB | 20.49 GB |
| Tokens/seg | 3761 | 4020 | 4459 |

Resultados de razonamiento (valores entre 0 y 1):

| Tarea | q8-hi | q6-hi | bf16 |
|---|---|---|---|
| ARC | 0.503 | 0.509 | no disponible |
| ARC-e | no disponible | 0.657 | no disponible |
| BoolQ | no disponible | 0.822 | no disponible |
| HellaSwag | no disponible | 0.634 | no disponible |
| OBQA | no disponible | 0.380 | no disponible |
| PIQA | no disponible | 0.763 | no disponible |
| WinoGrande | no disponible | 0.595 | no disponible |

No se han publicado resultados de benchmarks estándar como MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- Memoria pico estimada: 14.04 GB para la variante `q8-hi`, según la model card. Esto implica que un equipo con al menos 16 GB de memoria unificada es necesario para ejecutarlo con MLX sin problemas de swap.
- Velocidad de generación: 3761 tokens/s en q8-hi según el autor; la variante q6-hi alcanza 4020 tokens/s y bf16 llega a 4459 tokens/s. Estos valores se refieren al entorno de pruebas del autor, no especificado.
- Hardware recomendado: Apple Silicon con MLX (Mac con chip M1, M2, M3 o M4 y 16 GB de RAM o más). No se mencionan GPUs NVIDIA en la documentación.
- Despliegue: el modelo se usa con `mlx-lm` mediante Python. No se proporcionan configuraciones para vLLM, TGI, llama.cpp u Ollama en la información disponible; otros frameworks requerirían conversión adicional.
- El modelo no está diseñado para ejecutarse en GPU de consumidor con menos de 8 GB de VRAM en frameworks CUDA, aunque no hay datos verificados al respecto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nightmedia/Ling-3.0-tiny-q8-hi-mlx | 7.893 M | no disponible | 8-bit (MLX) | MIT | Hugging Face |
| nightmedia/Ling-3.0-tiny-q6-hi-mlx | 7.893 M (estimado) | no disponible | 6-bit (MLX) | MIT | Hugging Face (referenciado en la model card) |
| inclusionAI/Ling-3.0-tiny (base) | ~7.9 B | no disponible | bf16 | MIT | Hugging Face |

No se dispone de comparativas con modelos externos de la misma categoría (MoE híbridos compactos) en la información proporcionada.

## Limitaciones y advertencias

- La model card no incluye información sobre sesgos, alucinaciones ni datos de entrenamiento, por lo que se desconoce el comportamiento ético y de robustez del modelo.
- Los idiomas soportados no están especificados, aunque el modelo probablemente tenga capacidades multilingües; no se puede garantizar un rendimiento óptimo en todos los idiomas.
- Los benchmarks son parciales y no cubren tareas estándar como MMLU, HumanEval o GSM8K, lo que limita la comparabilidad con otros modelos.
- Es una cuantización de tercera parte (nightmedia) sobre un modelo de InclusionAI; no se garantiza soporte oficial ni actualizaciones del modelo base en este repositorio.
- La variante q8-hi ofrece perplejidad idéntica a bf16 en la tabla del autor, pero los datos de razonamiento están incompletos; se recomienda validar el comportamiento en casos de uso reales.
- No se especifica la longitud de contexto máxima, lo que impide conocer el límite real de tokens de entrada.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/nightmedia/Ling-3.0-tiny-q8-hi-mlx
- Modelo base en Hugging Face: https://huggingface.co/inclusionAI/Ling-3.0-tiny
- Modelo base (variante "base") en Hugging Face: https://huggingface.co/inclusionAI/Ling-3.0-tiny-base
- Ficha de crafiq.ai: https://crafiq.ai/models/language/inclusionai-ling-3-0-tiny-rc2
