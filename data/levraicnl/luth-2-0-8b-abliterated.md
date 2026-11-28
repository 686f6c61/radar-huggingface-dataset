# LeVraiCNL/Luth-2-0.8B-abliterated

## Resumen

Luth-2-0.8B-abliterated es una variante "abliterada" del modelo Luth-2-0.8B, un pequeño modelo de lenguaje de aproximadamente 750-853 millones de parámetros especializado en francés. Lo publica LeVraiCNL como derivado del checkpoint original de kurakurai, que a su vez se entrena a partir de Qwen/Qwen3.5-0.8B. La modificación consiste en eliminar la "dirección de rechazo" de la capa 18 mediante ortogonalización de pesos (embeddings y proyecciones de salida de atención y MLP), sin reentrenamiento adicional.

El modelo base Luth-2-0.8B se presenta como un modelo no razonador (non-reasoning) que busca el estado del arte en francés para su tamaño en matemáticas, código, seguimiento de instrucciones, conocimiento general y tool calling. Se entrena con una mezcla SFT de 3.000 millones de tokens en francés seguida de destilación on-policy multidominio (MOPD). Hereda la arquitectura VLM de Qwen3.5-0.8B, aunque no se entrena con datos de visión.

La relevancia de esta variante abliterada radica en que elimina los mecanismos de rechazo del modelo original (de 55 rechazos a 0 sobre 64 prompts de validación), lo que la hace útil para investigación sobre alineación y seguridad, pero también plantea riesgos evidentes para uso en producción sin salvaguardas adicionales. El modelo conserva la licencia Apache 2.0 y el mismo tokenizador y configuración que el original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only basada en Qwen3.5-0.8B (hereda arquitectura VLM, sin entrenamiento de visión) |
| Parametros totales | 852.985.920 (dato real de safetensors); el autor describe el modelo base como de 750M parámetros (solo texto) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible para esta variante; el modelo base ofrece GGUF (llama.cpp). Pesos en safetensors en bfloat16 |
| Idiomas soportados | francés (fr) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); repo de 1,7 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only derivado de Qwen3.5-0.8B, con la particularidad de que el modelo base hereda la arquitectura VLM del original aunque no se entrena con datos de visión. El proceso de entrenamiento del modelo base consta de dos etapas: primero un SFT sobre Luth-2-Post-Training-SFT, una mezcla de 3.000 millones de tokens en francés con matemáticas (37,2 %), conocimiento (27,9 %), código (22,2 %), seguimiento de instrucciones (6,5 %) y tool calling (6,3 %), con prompts traducidos del inglés y respuestas regeneradas por profesores open source potentes. Después, una destilación on-policy multidominio (MOPD): tres especialistas (matemáticas, código, seguimiento de instrucciones) se entrenan por separado con GRPO sobre Luth-2-Post-Training-RL y luego se destilan de vuelta al estudiante SFT.

La variante abliterada no reentrena el modelo: elimina la dirección de rechazo de la capa 18 mediante ortogonalización de los pesos de embeddings y de las proyecciones de salida de atención y MLP. El autor reporta una reducción de rechazos de 55 a 0 sobre 64 prompts de validación (medición por palabras clave) y una divergencia KL de 0,0265 en el primer token sobre prompts inofensivos, lo que indica un impacto limitado en el comportamiento general fuera de los rechazos. La arquitectura, configuración y tokenizador son idénticos al original.

## Capacidades

- Generación de texto conversacional en francés con formato de chat.
- Razonamiento matemático (MGSM, AIME, Math-500) y resolución de problemas numéricos.
- Generación de código (HumanEval+, MBPP+).
- Seguimiento de instrucciones multi-turno (IFEval, Multi-IF).
- Conocimiento general y preguntas de opción múltiple (Global-MMLU-Lite, MMLU-ProX-Lite, GPQA-Diamond).
- Tool calling / function calling (BFCL v2).
- Capacidad multilingüe limitada al francés según la model card.
- Modo de razonamiento desactivado en las evaluaciones del modelo base (thinking disabled).
- Sin capacidades de visión efectivas pese a heredar la arquitectura VLM: el autor no recomienda su uso para tareas visuales.
- Eliminación de la dirección de rechazo (comportamiento abliterado): no aplica salvaguardas de rechazo del modelo original.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar el efecto de eliminar la dirección de rechazo en un SLM, comparando su comportamiento con el checkpoint original sobre los mismos prompts y midiendo divergencia KL y tasas de rechazo.
- Evaluación de robustez de filtros: útil para probar sistemas de moderación externos, ya que el modelo no rechaza por sí mismo y obliga a que la capa de seguridad esté en el pipeline, no en el modelo.
- Generación de texto en francés para prototipos: al ser un modelo pequeño (≈853 M parámetros) y con licencia Apache 2.0, se puede desplegar en entornos con recursos limitados para generar respuestas conversacionales en francés.
- Asistencia matemática en francés: por sus resultados en MGSM-rev2 (72,92) y Math-500 (57,60) frente a Qwen3.5-0.8B, puede usarse en tutores o generadores de ejercicios de matemáticas en francés, siempre con verificación humana.
- Generación de código asistida en francés: con HumanEval+ de 46,81 y MBPP+ de 42,33, puede integrarse en herramientas de autocompletado o generación de fragmentos en pipelines internos, con revisión posterior.
- Tool calling en agentes ligeros: BFCL v2 de 64,02 permite usarlo como planificador de llamadas a funciones en asistentes de dominio cerrado desplegados en local.
- Despliegue en edge o on-device: el tamaño reducido y el formato safetensors permiten ejecución en CPU o GPU de gama baja para tareas de generación de texto en francés, aunque la variante abliterada exige controles de contenido adicionales.

## Benchmarks y rendimiento

Resultados del modelo base Luth-2-0.8B (la variante abliterada no publica benchmarks propios; el autor solo reporta métricas de abliteración). Evaluaciones en francés, con `temperature=0.6, top_p=0.95, top_k=20`, thinking desactivado y media de 10 ejecuciones.

| Benchmark (francés) | Luth-2-0.8B | Luth-0.6B-Instruct | Qwen3.5-0.8B |
|---|--:|--:|--:|
| MGSM-rev2 | 72,92 | 58,52 | 35,20 |
| AIME 24 | 5,67 | 2,00 | 1,00 |
| AIME 25 | 8,67 | 1,33 | 0,33 |
| Math-500 | 57,60 | 44,74 | 27,46 |
| Global-MMLU-Lite | 53,30 | 40,20 | 44,00 |
| MMLU-ProX-Lite | 38,93 | 25,40 | 27,60 |
| GPQA-Diamond | 26,87 | 25,60 | 23,80 |
| IFEval | 71,23 | 51,23 | 44,47 |
| Multi-IF | 61,52 | 33,77 | 32,72 |
| HumanEval+ | 46,81 | 30,25 | 10,87 |
| MBPP+ | 42,33 | 34,74 | 18,20 |
| BFCL v2 | 64,02 | 61,72 | 51,49 |

Métricas de la variante abliterada reportadas por el autor: rechazos medidos por palabras clave sobre 64 prompts de validación, de 55 a 0; divergencia KL en el primer token sobre prompts inofensivos de 0,0265.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 1,7 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 2 y 4 GB según longitud de contexto y batch.
- En cuantización de 8 bits o 4 bits, el modelo puede caber en menos de 1 GB de pesos, aunque esta variante no publica GGUF propio; el modelo base sí ofrece GGUF para llama.cpp.
- GPU recomendadas: cualquier GPU consumer moderna con al menos 4-6 GB de VRAM (RTX 3060, RTX 4060, RTX 4090) es suficiente; también funciona en CPU.
- Cabe en GPU consumer y en dispositivos edge; es adecuado para despliegue on-device.
- Opciones de despliegue: Transformers (soporte nativo), vLLM, SGLang; para CPU y memoria reducida, llama.cpp mediante la conversión a GGUF del modelo base. El autor no publica una variante GGUF específica de la versión abliterada.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Benchmarks destacados (francés) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Luth-2-0.8B-abliterated | 852.985.920 | no disponible | Hereda del base: MGSM-rev2 72,92; IFEval 71,23; BFCL v2 64,02 | Apache 2.0 | Hugging Face (transformers, safetensors) |
| Luth-2-0.8B (original) | ≈750M (texto) | no disponible | Mismos benchmarks que el base, con rechazos intactos | Apache 2.0 | Hugging Face, vLLM, SGLang, GGUF |
| Luth-0.6B-Instruct | ≈600M | no disponible | MGSM-rev2 58,52; IFEval 51,23; HumanEval+ 30,25 | no disponible | Hugging Face |
| Qwen3.5-0.8B | ≈800M | no disponible | MGSM-rev2 35,20; IFEval 44,47; HumanEval+ 10,87 | no disponible | Hugging Face |

## Limitaciones y advertencias

- Modelo abliterado: no conserva los rechazos del original, lo que implica riesgo alto de generar contenido dañino, ilegal o inapropiado. El autor advierte explícitamente de su uso responsable y conforme a la ley aplicable.
- Riesgo de alucinación: es un modelo pequeño (≈853 M parámetros) con benchmarks moderados (GPQA-Diamond 26,87; MMLU-ProX-Lite 38,93), por lo que no es fiable para conocimiento factual sin verificación.
- Idiomas: la model card declara únicamente francés; el rendimiento en castellano u otros idiomas no está garantizado ni documentado.
- Contexto: la longitud de contexto no está disponible en la información proporcionada, lo que impide planificar despliegues con ventanas largas.
- Visión: aunque hereda la arquitectura VLM de Qwen3.5-0.8B, no se entrenó con datos de visión; el autor no recomienda su uso para tareas visuales.
- Licencia: Apache 2.0 permite uso comercial, pero las condiciones del modelo original y del modelo base Qwen3.5-0.8B siguen aplicando; conviene revisar la licencia del checkpoint base.
- Producción: la ausencia de salvaguardas internas exige una capa externa de moderación y filtrado antes de exponer el modelo a usuarios finales.
- Reputación: el modelo tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria independiente.

## Enlaces

- Hugging Face (esta variante): https://huggingface.co/LeVraiCNL/Luth-2-0.8B-abliterated
- Modelo base Luth-2-0.8B: https://huggingface.co/kurakurai/Luth-2-0.8B
- Variante GGUF del base: https://huggingface.co/kurakurai/Luth-2-0.8B-GGUF
- Modelo Luth-2-2B: https://huggingface.co/kurakurai/Luth-2-2B
- Modelo base original de Qwen: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Blog: https://huggingface.co/blog/MaxLSB/luth-2
- Dataset SFT: https://huggingface.co/datasets/kurakurai/Luth-2-Post-Training-SFT
- Dataset RL: https://huggingface.co/datasets/kurakurai/Luth-2-Post-Training-RL
- Código: https://github.com/kurakurai/Luth-2
- Leaderboard francés: https://huggingface.co/spaces/kurakurai/llm_leaderboard_fr
- LinkedIn (Maxence Lasbordes): https://www.linkedin.com/in/maxence-lasbordes/
- LinkedIn (Guillaume Pradel): https://www.linkedin.com/in/guillaume-pradel/
