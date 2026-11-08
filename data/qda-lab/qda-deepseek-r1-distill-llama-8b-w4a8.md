# qda-lab/QDA-DeepSeek-R1-Distill-Llama-8B-W4A8

## Resumen

QDA-DeepSeek-R1-Distill-Llama-8B-W4A8 es un checkpoint cuantizado del modelo DeepSeek-R1-Distill-Llama-8B, publicado por el laboratorio qda-lab. Se trata de una versión con cuantización de pesos a 4 bits y activaciones a 8 bits (W4A8) en formato compressed-tensors, diseñada para cargarse directamente en vLLM sin conversión adicional. El modelo base es un destilado denso de 8.030.261.248 parámetros (aproximadamente 8B) derivado de DeepSeek-R1 sobre la arquitectura Llama, orientado a razonamiento, matemáticas y generación de código.

La relevancia de este checkpoint reside en su enfoque metodológico: según la model card, los archivos corresponden a una búsqueda de diseño de cuantización realizada con agentes LLM en el marco del trabajo "QDA: Closed-Loop Quantization Design with LLM Agents" (sometido a MLSys 2027, búsqueda `r-78b7cf12`, entrega manual `h4`). El repositorio ocupa 5,7 GB, lo que permite desplegar un modelo de razonamiento de 8B en hardware con menos VRAM que la versión en bf16.

El modelo hereda las capacidades del destilado original de DeepSeek-R1: razonamiento en cadena, matemáticas competitivas y código, con un contexto heredado de la familia Llama. No obstante, la información pública disponible sobre esta variante cuantizada es muy limitada (0 descargas, 0 likes en el momento de la consulta) y la licencia e idiomas no están declarados en la model card.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Llama), destilado de DeepSeek-R1 |
| Parámetros totales | 8.030.261.248 (~8B) |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | W4A8 (pesos 4 bits, activaciones 8 bits), formato compressed-tensors |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (compressed-tensors), compatible con vLLM |

## Arquitectura y entrenamiento

El modelo base DeepSeek-R1-Distill-Llama-8B es un transformer denso de la familia Llama, obtenido por destilación del modelo de razonamiento DeepSeek-R1. DeepSeek publicó seis modelos densos destilados a partir de DeepSeek-R1 sobre bases Llama y Qwen; este es el de 8B sobre Llama. El proceso de destilación transfiere las capacidades de razonamiento del modelo profesor (generación de cadenas de pensamiento largas) al estudiante denso.

Sobre esa base, qda-lab aplica una cuantización W4A8 en formato compressed-tensors, cuyos parámetros de escalado y esquema fueron encontrados mediante una búsqueda automatizada con agentes LLM (QDA). La model card indica que los archivos publicados son exactamente los evaluados en el artículo, con el identificador de búsqueda `r-78b7cf12` y la entrega manual `h4`. No se dispone de información sobre el número de tokens de entrenamiento del destilado, la composición del dataset ni si hubo RLHF o DPO en esta variante cuantizada.

## Capacidades

- Generación de texto y razonamiento en cadena de pensamiento, heredado del destilado de DeepSeek-R1.
- Razonamiento matemático competitivo (evaluado en AIME 2025 y HMMT Feb 2026).
- Razonamiento científico de nivel experto (evaluado en GPQA-Diamond).
- Generación de código (evaluado en LiveCodeBench v6).
- Seguimiento de instrucciones (evaluado en IFEval).
- Compatibilidad nativa con vLLM mediante `vllm serve`.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y multi-step reasoning: no disponible explícitamente, aunque el modelo base está orientado a razonamiento.
- Capacidades multilingües: no disponible.
- Capacidades de visión o audio: no disponibles (modelo de texto).

## Casos de uso

- Razonamiento matemático asistido: el modelo puede resolver problemas de competición y demostraciones paso a paso, adecuado para herramientas educativas o de verificación de cálculos, dado su rendimiento de 27,5 en el agregado AIME 2025 + HMMT Feb 2026.
- Generación de código en pipelines de CI/CD: con 36,5 en LiveCodeBench v6, puede integrarse en revisión de código, generación de tests o explicación de errores, siempre con validación humana.
- Respuestas a preguntas científicas de nivel experto: su 46,7 en GPQA-Diamond lo hace útil para asistentes de investigación en dominios de física, química y biología, con supervisión.
- Despliegue en hardware limitado: al ser un checkpoint W4A8 de 5,7 GB, permite servir un modelo de razonamiento de 8B en GPUs de gama media o en entornos con VRAM restringida mediante vLLM.
- Seguimiento de instrucciones en asistentes internos: con 61,5 en IFEval, puede emplearse en tareas de formato estructurado, extracción y transformación de texto.
- Evaluación de técnicas de cuantización: el checkpoint sirve como referencia reproducible para investigar el impacto de W4A8 en tareas de razonamiento, al estar vinculado a un artículo con configuración de evaluación explícita (vLLM 0.27.1, GH200, temperatura 0,6, top_p 0,95).

## Benchmarks y rendimiento

Resultados publicados en la model card del checkpoint, evaluados con vLLM 0.27.1 sobre GH200, batching estático, muestreo `{"temperature": 0.6, "top_p": 0.95}` y semillas 17+j:

| Benchmark | Puntuación (%) |
|---|---|
| Math (AIME 2025 + HMMT Feb 2026) | 27,5 |
| GPQA-Diamond | 46,7 |
| LiveCodeBench v6 | 36,5 |
| IFEval | 61,5 |
| **Media** | **43,1** |

No se han publicado en la información disponible resultados comparativos con el modelo base sin cuantizar ni con otras alternativas.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 5,7 GB en W4A8; se recomienda al menos 8-10 GB de VRAM para pesos y overhead de KV cache en contextos moderados.
- GPU recomendadas: la model card cita evaluación en GH200; por tamaño, cabría en A100, H100, L40S y GPUs consumer de gama alta.
- Compatibilidad con GPU consumer: probable en RTX 4090 (24 GB) y RTX 4080/4070 Ti (16 GB); en GPUs de 8 GB requeriría contextos cortos y verificación empírica.
- Opciones de despliegue: vLLM es el soporte nativo indicado (`vllm serve qda-lab/QDA-DeepSeek-R1-Distill-Llama-8B-W4A8`); otros motores no están confirmados para este formato compressed-tensors.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qda-lab/QDA-DeepSeek-R1-Distill-Llama-8B-W4A8 | ~8B | no disponible | W4A8 | no disponible | Hugging Face (vLLM) |
| deepseek-ai/DeepSeek-R1-Distill-Llama-8B | ~8B | no disponible | bf16 original | no disponible en la información | Hugging Face |
| mozilla-ai/DeepSeek-R1-Distill-Llama-8B-llamafile | ~8B | no disponible | llamafile | no disponible en la información | Hugging Face |

La comparativa de rendimiento entre estas variantes no está disponible en la información proporcionada.

## Limitaciones y advertencias

- La model card no declara licencia, lo que impide confirmar si el uso comercial está permitido; debe verificarse con el autor y con la licencia del modelo base.
- No se declaran los idiomas soportados; el comportamiento multilingüe no está garantizado.
- Riesgo de alucinación inherente a los modelos de razonamiento destilados, especialmente en dominios fuera de matemáticas y código.
- La cuantización W4A8 puede degradar la precisión respecto al modelo en bf16; la model card no ofrece comparación directa con el original.
- El repositorio tiene 0 descargas y 0 likes, y fue creado recientemente; no hay validación independiente de la comunidad.
- La evaluación se realizó con una configuración concreta (vLLM 0.27.1, GH200, muestreo específico); los resultados pueden no reproducirse con otros ajustes.
- El soporte está limitado a vLLM en formato compressed-tensors; otros motores de inferencia no están confirmados.
- El artículo asociado (QDA, MLSys 2027) está en estado de sometimiento, por lo que la metodología no ha sido revisada por pares de forma pública.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qda-lab/QDA-DeepSeek-R1-Distill-Llama-8B-W4A8
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Llama-8B
- Variante llamafile de mozilla-ai: https://huggingface.co/mozilla-ai/DeepSeek-R1-Distill-Llama-8B-llamafile
