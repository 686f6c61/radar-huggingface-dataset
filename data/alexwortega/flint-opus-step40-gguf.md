# AlexWortega/flint-opus-step40-GGUF

## Resumen

flint-opus-step40-GGUF es la cuantización en formato GGUF del modelo AlexWortega/flint-opus-step40, un checkpoint de 40 pasos (step 40) del experimento de entrenamiento AlexWortega/flint-opus-curriculum-20261026. El modelo base es RecursiveSI/flint, sobre el cual se aplicó un LoRA de solo atención (r16, alpha 32, sobre las proyecciones q/k/v/o) entrenado con RL group-relative para reducir el "slop" (texto genérico y repetitivo típico de LLMs) en continuaciones de tuits, usando como juez un modelo Opus 5.5 con recompensa calibrada "astra4 calibrated-v1".

El paso 40 fue seleccionado como el mejor punto de la curva de entrenamiento en el conjunto held-out de antislop (puntuación 5,90 frente a 4,92 del modelo base), aunque con una ligera regresión en roleplay. El LoRA está plegado en los pesos de atención como `W + (B @ A) * alpha / r` en fp32 y casteados de vuelta a bf16, de modo que los pesos publicados son idénticos a los usados por el servidor de política durante el entrenamiento.

El repositorio GGUF ofrece tres cuantizaciones (BF16, Q8_0 y Q4_K_M) en su versión v2, que corrigió la deriva numérica de las primeras subidas v1. El modelo requiere una compilación de llama.cpp con soporte de Flint (PR #30928). Con unos 39,8 mil millones de parámetros y presencia de expertos (mixture-of-experts), está dirigido a usuarios que ejecutan modelos localmente con llama.cpp y buscan salidas de texto menos formulaicas, especialmente en generación creativa y continuaciones de estilo informal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer attention-only con expertos (MoE), adaptador LoRA plegado (r16, alpha 32, q/k/v/o) |
| Parametros totales | 39.785.287.456 (~39,8 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q8_0, Q4_K_M (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (convertido con `convert_hf_to_gguf.py`, llama.cpp master `4244ad7`) |

## Arquitectura y entrenamiento

El modelo parte de RecursiveSI/flint (commit `2a247be`), un modelo con expertos (MoE) cuya arquitectura detallada no se ha publicado en la model card. Sobre él se entrenó un LoRA de solo atención con rango 16 y alpha 32 aplicado a las matrices q, k, v y o. El LoRA se ha fusionado en los pesos de atención mediante la operación `W + (B @ A) * alpha / r` en fp32, con casteo final a bf16, garantizando que los pesos distribuidos coinciden exactamente con los del servidor de política durante el entrenamiento. Los expertos del modelo base no se modificaron.

El entrenamiento consistió en un run de 200 pasos con RL group-relative sobre continuaciones de tuits etiquetadas como "antislop", puntuadas por un juez Opus 5.5 con la recompensa calibrada astra4 calibrated-v1. El checkpoint del paso 40 fue elegido por ser el mejor punto en el conjunto held-out de antislop; los pasos posteriores mostraron regresión. El roleplay no se entrenó antes del paso 101, por lo que empeora ligeramente en este checkpoint. El formato de chat es `<|user|>...<|assistant|><think></think>`, donde un bloque `<think>` vacío indica ausencia de razonamiento explícito, igual que durante el entrenamiento.

## Capacidades

- Continuación y generación de texto informal con estilo reducido en "slop": el ajuste con RL antislop mejora la naturalidad de las continuaciones de tuits (5,90/10 frente a 4,92/10 del base según el juez).
- Generación de texto general heredada del modelo base flint, con los expertos intactos.
- Formato de chat con marcadores `<|user|>` y `<|assistant|>`, y bloque `<think>` opcional (vacío = sin razonamiento).
- Roleplay: capacidad presente pero ligeramente inferior al modelo base en este checkpoint (6,13 frente a 6,38).
- No hay información publicada sobre tool calling, agentes, visión, audio ni capacidades multilingües.

## Casos de uso

- Generación de contenido para redes sociales: el modelo está afinado específicamente para continuaciones de tuits con menos lenguaje formulaico, útil para asistentes de redacción de posts.
- Escritura creativa asistida: la reducción de slop lo hace adecuado para borradores de ficción corta donde se quiere evitar clichés y repeticiones típicas de LLMs.
- Chatbots conversacionales locales: gracias al formato de chat definido y al soporte GGUF, puede integrarse en interfaces como llama.cpp u Ollama para conversación en local.
- Investigación en RLHF/RLAIF: es un artefacto de investigación valioso para estudiar cómo el RL group-relative con juez calibrado afecta a la calidad estilística del texto.
- Comparación de cuantizaciones: el repo publica divergencias KL medidas entre cuantizaciones y BF16, útil como caso de estudio para validar recetas de cuantización en arquitecturas Flint numéricamente sensibles.
- Fine-tuning posterior: al ser Apache 2.0 y publicarse los pesos con LoRA plegado, puede servir como base para nuevos ajustes finos de estilo o dominio.

## Benchmarks y rendimiento

Datos publicados en la model card (held-out, juez Opus 5.5, 24 prompts por tarea):

| Métrica (held-out, juez Opus 5.5, 24 prompts) | Base flint | Step 40 |
|---|---|---|
| Antislop q (0-10) | 4,92 | 5,90 |
| Antislop calibrated reward | 0,12 | 0,31 |
| Roleplay q (0-10) | 6,38 | 6,13 |
| Roleplay calibrated reward | 0,63 | 0,51 |

Divergencia KL de las cuantizaciones v2 respecto al BF16 del repo (llama-perplexity, ~7k tokens de salidas del modelo):

| Fichero | Receta | KLD medio (v1 → v2) | Mismo top token |
|---|---|---|---|
| Q8_0 | Expertos Q8_0; embeddings, output, atención, shared experts y capas densas 0-1 en BF16 | 0,0119 → 0,0077 | 96% |
| Q4_K_M | Layout por tensor de bartowski para flint + imatrix de bartowski | 0,099 → 0,050 | 90% |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.). El propio autor advierte que los conjuntos de evaluación son pequeños (n=24) y usan un único juez, por lo que hay que tratarlos como ruidosos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con ~39,8 B de parámetros, la versión BF16 ocupa en torno a 80 GB solo de pesos, Q8_0 unos 40-42 GB y Q4_K_M unos 22-24 GB (estimaciones estándar para GGUF; el repo completo pesa 215,6 GB).
- GPU recomendadas: no disponible; por tamaño, se requieren tarjetas de gama datacenter (A100 80 GB, H100) o multi-GPU consumer (varias RTX 3090/4090) para Q4_K_M, y aceleradores de 80 GB o más para BF16.
- Consumer GPU: Q4_K_M puede caber en una única RTX 4090 (24 GB) de forma ajustada o en configuraciones multi-GPU; Q8_0 y BF16 no caben en una sola GPU consumer.
- Despliegue: llama.cpp con soporte Flint obligatorio (PR #30928, master `4244ad7` o posterior). No se menciona compatibilidad con vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles. El autor advierte que Flint es numéricamente sensible en llama.cpp: los mismos pesos BF16 en CPU frente a GPU ya difieren con KLD 0,0034.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| flint-opus-step40-GGUF | ~39,8 B | no disponible | Apache 2.0 | GGUF (BF16, Q8_0, Q4_K_M) | Afinado antislop con RL; requiere llama.cpp con Flint |
| Base RecursiveSI/flint | no disponible | no disponible | no disponible | no disponible | Modelo base sin LoRA; peor antislop (4,92 vs 5,90) |
| Alternativas comerciales de tamaño similar (Qwen, Llama 40B-class) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han publicado comparativas directas con otros modelos de la misma categoría en la información disponible.

## Limitaciones y advertencias

- Las métricas de evaluación provienen de conjuntos muy pequeños (n=24) y de un único juez (Opus 5.5), por lo que el propio autor las califica de ruidosas y no concluyentes.
- El roleplay empeora ligeramente respecto al modelo base en este checkpoint (6,13 frente a 6,38), ya que no se entrenó antes del paso 101.
- El entrenamiento se centró exclusivamente en continuaciones de tuits antislop; el comportamiento fuera de ese dominio no está caracterizado.
- Flint es numéricamente sensible en llama.cpp: hay deriva medible entre CPU y GPU incluso con pesos idénticos, y las primeras cuantizaciones v1 mostraron desviaciones notables que obligaron a rehacerlas.
- Es obligatorio usar una compilación de llama.cpp con soporte Flint (PR #30928); versiones estándar de llama.cpp no funcionarán.
- Sesgos, riesgo de alucinación, longitud de contexto e idiomas soportados: no disponibles; deben evaluarse de forma independiente antes de cualquier uso en producción.
- La licencia Apache 2.0 permite uso comercial, pero el modelo es claramente un artefacto experimental de investigación y no un producto estable.

## Enlaces

- Repositorio GGUF: https://huggingface.co/AlexWortega/flint-opus-step40-GGUF
- Modelo base del checkpoint: https://huggingface.co/AlexWortega/flint-opus-step40
- Run de entrenamiento (curriculum): https://huggingface.co/AlexWortega/flint-opus-curriculum-20261026
- Modelo base flint: https://huggingface.co/RecursiveSI/flint
- PR de soporte Flint en llama.cpp: referencia #30928 (enlace directo no disponible)
