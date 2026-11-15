# AxiomicLabs/X3Guard-150M

## Resumen

X3Guard-150M es un modelo compacto de clasificación de texto desarrollado por Axiomic Labs, especializado en la detección de contenido dañino (harm) y de ataques adversarios como jailbreaks o inyecciones de prompt. Se trata de un fine-tuning del modelo base GPT-X3-150M, también de Axiomic Labs, y devuelve dos puntuaciones independientes por prompt: la probabilidad de que sea dañino y la probabilidad de que sea adversarial. Con 149,4 millones de parámetros, es uno de los guard models más pequeños que ofrece ambas clasificaciones simultáneamente.

El modelo está pensado para integrarse como filtro previo en pipelines de aplicaciones basadas en LLM, añadiendo una capa de seguridad determinista y de bajo coste computacional antes de que el prompt llegue al modelo generativo. Su relevancia radica en que, según la model card, supera en detección de daño a modelos mucho mayores como Llama Guard 3 1B, Llama Guard 4 12B o gpt-oss-safeguard-20b, manteniendo un tamaño que permite desplegarlo en hardware modesto.

La licencia Apache 2.0 y el soporte de solo inglés acotan su uso a entornos donde el tráfico de usuario está mayoritariamente en inglés, aunque su reducido tamaño lo hace atractivo para despliegues de baja latencia en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia GPT-X3), fine-tuned para clasificación |
| Parametros totales | 149.402.084 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la model card; existen versiones ONNX en repo separado |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo principal); ONNX disponible en repo aparte |

## Arquitectura y entrenamiento

X3Guard-150M parte del modelo base GPT-X3-150M, un transformer decoder-only de 149M parámetros, y se ha fine-tuneado como clasificador de texto con dos cabezas de salida (harm y adversarial). La model card no detalla la arquitectura interna más allá de la familia GPT-X3 ni especifica si se emplean capas adicionales de clasificación, pooling concreto o atención lineal.

El entrenamiento se ha realizado sobre una composición de datasets de seguridad y jailbreak: allenai/wildguardmix, allenai/WildChat-1M, allenai/WildChat-4.8M, lmsys/lmsys-chat-1m, nvidia/Aegis-AI-Content-Safety-Dataset-2.0, allenai/wildjailbreak, bench-llm/or-bench, hackaprompt/hackaprompt-dataset, Lakera/gandalf_ignore_instructions, Lakera/gandalf_summarization y deepset/prompt-injections. La model card no indica el número exacto de tokens de entrenamiento, la proporción de cada dataset ni si se aplicaron técnicas de RLHF o DPO; tampoco describe innovaciones técnicas como decodificación especulativa o atención linear.

## Capacidades

- Clasificación de daño (harm): devuelve una puntuación de probabilidad de que el prompt sea dañino.
- Detección de adversarialidad: devuelve una puntuación independiente de que el prompt sea un jailbreak o un intento de inyección de prompt.
- Doble salida simultánea: ambas clasificaciones se generan en una sola pasada, a diferencia de muchos guard models que solo cubren una de las dos tareas.
- Umbral configurable: la model card menciona un ajuste "Balanced" por defecto, lo que implica que los umbrales de decisión pueden ajustarse según la política de seguridad.
- Clasificación de prompts de usuario: está diseñado para leer el prompt del usuario, no la respuesta del modelo.
- Idioma: solo inglés.
- No se documentan capacidades de generación de texto, tool calling, agentes, visión, audio ni modo thinking; es un modelo exclusivamente clasificador.

## Casos de uso

- Filtro previo en aplicaciones de chat: X3Guard-150M se coloca antes del LLM generativo para bloquear prompts dañinos o jailbreaks con bajo coste computacional, aprovechando su tamaño de 149M parámetros.
- Moderación de contenido en comunidades online: clasificación de mensajes de usuario en inglés para detectar toxicidad o intentos de manipulación antes de publicarlos.
- Protección frente a inyección de prompt en pipelines RAG: detección de instrucciones maliciosas embebidas en entradas de usuario o documentos, usando la puntuación adversarial.
- Red-teaming automatizado: uso del modelo para triage rápido de grandes volúmenes de prompts candidatos y priorizar los que requieren revisión humana.
- Enrutado de seguridad en agentes: clasificación de cada paso de un agente para decidir si la entrada debe escalarse a un guard model mayor o a revisión manual.
- Despliegue en edge o CPU: al ser un modelo de 149M parámetros, puede ejecutarse en CPU o GPUs consumer para prefiltering de alto throughput en entornos con recursos limitados.
- Monitorización de logs: clasificación batch de conversaciones históricas para auditoría de seguridad y detección de patrones de ataque.

## Benchmarks y rendimiento

La model card reporta resultados propios (configuración "Balanced") y de competidores evaluados con su regla de decisión por defecto. Los benchmarks usados son WildGuardTest y CircleGuardBench para harm, y jackhhao y TrustAIRLab para adversarial.

Detección de daño (harm):

| Modelo | Parámetros | Mean F1 | WildGuardTest F1 | CircleGuardBench F1 |
|---|---:|---:|---:|---:|
| Granite Guardian 3.1 2B | 2.534M | 0,865 | 0,794 | 0,935 |
| Qwen3Guard-Gen 0.6B (strict) | 596M | 0,843 | 0,885 | 0,801 |
| PolyGuard Qwen Smol | 494M | 0,834 | 0,873 | 0,796 |
| GLiGuard 300M | 208M | 0,827 | 0,862 | 0,793 |
| X3Guard 150M (Balanced) | 149M | 0,818 | 0,874 | 0,761 |
| HarmAug Guard | 435M | 0,812 | 0,876 | 0,748 |
| Qwen3Guard-Gen 0.6B (loose) | 596M | 0,786 | 0,863 | 0,710 |
| gpt-oss-safeguard-20b | ~21.000M | 0,762 | 0,826 | 0,699 |
| content-safety-guard-small | 141M | 0,758 | 0,806 | 0,710 |
| Llama Guard 3 1B | 1.498M | 0,692 | 0,750 | 0,635 |
| Llama Guard 4 12B | ~12.000M | 0,662 | 0,741 | 0,582 |

Detección adversarial:

| Modelo | Parámetros | Mean F1 | jackhhao F1 | TrustAIRLab F1 |
|---|---:|---:|---:|---:|
| prompt-guard-68m (Sheltron AI) | 68M | 0,822 | 0,919 | 0,725 |
| deberta-v3-small-prompt-injection-v2 (ProtectAI) | 142M | 0,738 | 0,868 | 0,609 |
| deberta-v3-base-prompt-injection-v2 (ProtectAI) | 184M | 0,720 | 0,900 | 0,539 |
| DuoGuard 0.5B | 494M | 0,710 | 0,830 | 0,589 |
| X3Guard 150M (Balanced) | 149M | 0,673 | 0,931 | 0,416 |
| gpt-oss-safeguard-20b | ~21.000M | 0,663 | 0,877 | 0,448 |
| Qwen3Guard-Gen 0.6B (strict) | 596M | 0,648 | 0,944 | 0,353 |
| GLiGuard 300M | 208M | 0,617 | 0,800 | 0,435 |
| Llama Prompt Guard 2 86M | 279M | 0,605 | 0,977 | 0,232 |
| Llama Prompt Guard 2 22M | 71M | 0,602 | 0,950 | 0,254 |
| Granite Guardian 3.1 2B | 2.534M | 0,561 | 0,920 | 0,202 |

La model card señala que, entre los modelos que emiten ambas clasificaciones, ninguno supera a X3Guard-150M en las dos tareas simultáneamente: Granite Guardian 3.1 2B y Qwen3Guard-Gen 0.6B (strict) van por delante en harm pero por detrás en adversarial; DuoGuard 0.5B va por delante en adversarial pero muy por detrás en harm; y gpt-oss-safeguard-20b queda por detrás en ambas. Los recuentos de parámetros incluyen embeddings y pueden diferir del tamaño indicado en el nombre del modelo.

## Requisitos de hardware

- VRAM estimada: no disponible en la model card. Por tamaño (149M parámetros en safetensors, repo de 0,6 GB), la inferencia en fp32 requiere aproximadamente 0,6 GB de pesos, y en fp16/bf16 alrededor de 0,3 GB, más overhead de activaciones y runtime.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cualquier GPU consumer moderna (RTX 3060, 4060, 4090) puede alojarlo con holgura; también A100/H100 para despliegues de alto throughput.
- Cabe en GPU consumer: sí, con margen amplio dado su tamaño.
- Opciones de despliegue: transformers (librería declarada), versiones ONNX disponibles en el repo AxiomicLabs/X3Guard-150M-ONNX para inferencia más rápida. No se mencionan vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput estimados: no disponibles en la model card; las versiones ONNX se presentan como "faster ONNX quants", sin cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Harm (Mean F1) | Adversarial (Mean F1) | Licencia | Disponibilidad |
|---|---:|---:|---:|---|---|
| X3Guard 150M | 149M | 0,818 | 0,673 | Apache 2.0 | Hugging Face + ONNX + demo Space |
| Granite Guardian 3.1 2B | 2.534M | 0,865 | 0,561 | no disponible en esta ficha | Hugging Face (IBM) |
| Qwen3Guard-Gen 0.6B (strict) | 596M | 0,843 | 0,648 | no disponible en esta ficha | Hugging Face (Qwen) |
| DuoGuard 0.5B | 494M | 0,543 | 0,710 | no disponible en esta ficha | Hugging Face |
| Llama Guard 3 1B | 1.498M | 0,692 | no disponible | no disponible en esta ficha | Hugging Face (Meta) |
| gpt-oss-safeguard-20b | ~21.000M | 0,762 | 0,663 | no disponible en esta ficha | Hugging Face (OpenAI) |

X3Guard-150M destaca por ofrecer el mejor equilibrio harm/adversarial entre los modelos que emiten ambas señales, con un tamaño entre 4x y 17x menor que Granite Guardian 3.1 2B y Qwen3Guard-Gen 0.6B, y muy por debajo de gpt-oss-safeguard-20b.

## Limitaciones y advertencias

- Solo inglés: el modelo está entrenado y evaluado para prompts en inglés; el rendimiento en otros idiomas no está documentado.
- Sesgos desconocidos: la model card no documenta análisis de sesgos por demografía, dominio o tipo de contenido; los guard models pueden sobrerrechazar o infrabloquear según la distribución de entrenamiento.
- Riesgo de falsos positivos y negativos: las puntuaciones son probabilísticas y dependen del umbral; la configuración "Balanced" no está cuantificada en la información disponible.
- Rendimiento adversarial desigual: el F1 en TrustAIRLab (0,416) es notablemente inferior al de jackhhao (0,931), lo que sugiere una generalización limitada a tipos de ataque no representados en entrenamiento.
- No clasifica respuestas del modelo: está diseñado para leer prompts de usuario, no salidas generadas.
- Uso comercial: la licencia Apache 2.0 permite uso comercial, pero debe verificarse el cumplimiento de las licencias de los datasets de entrenamiento citados.
- Datos de entrenamiento solapados con benchmarks: ProtectAI entrena con jackhhao (uno de los benchmarks adversariales), lo que invalida su comparación en ese conjunto; X3Guard no indica tal solapamiento, pero la model card no lo aclara explícitamente.
- Contexto máximo no documentado: no se especifica la longitud máxima de prompt que el modelo puede procesar.
- Advertencia de producción: al ser un clasificador, no sustituye a políticas de seguridad completas; debe combinarse con otras capas (filtrado de salidas, revisión humana, rate limiting).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AxiomicLabs/X3Guard-150M
- Modelo base GPT-X3-150M: https://huggingface.co/AxiomicLabs/GPT-X3-150M
- Versiones ONNX: https://huggingface.co/AxiomicLabs/X3Guard-150M-ONNX
- Demo en navegador: https://huggingface.co/spaces/AxiomicLabs/X3Guard-150M-Demo
