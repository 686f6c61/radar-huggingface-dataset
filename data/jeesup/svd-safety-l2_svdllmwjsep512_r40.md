# Jeesup/svd-safety-l2_svdllmwjsep512_r40

## Resumen

`svd-safety-l2_svdllmwjsep512_r40` es un checkpoint de investigación derivado de `meta-llama/Llama-2-7b-chat-hf` al que se le ha aplicado una compresión SVD-LLM que elimina el 40 % de los parámetros densos, dejando un 59,98 % de los originales (6.738.415.616 parámetros efectivos). El autor, Jeesup, lo publica como una celda de una malla experimental sobre reglas de selección de componentes y presupuestos de compresión, orientada a medir cómo la compresión SVD degrada el comportamiento de seguridad y qué criterio de selección lo repara mejor.

La compresión se realizó con el estimador whitened SVD de SVD-LLM sobre un conjunto de calibración mixto de utilidad y seguridad (`wikitext2:256 + wj_harm_resp_sep:512`), seguido de una recuperación con LoRA en dos etapas (U y V secuenciales) sobre alpaca-cleaned. El resultado es un artefacto de investigación con métricas de seguridad medidas (ASR de 0,0019 en AdvBench y 0,0128 en StrongREJECT) y de utilidad (perplejidad de 11,3605 en WikiText-2, 0,4907 de precisión media zero-shot en 7 tareas).

Es relevante ahora porque cuantifica empíricamente el compromiso entre compresión, utilidad y alineamiento de seguridad en un modelo ampliamente usado, un aspecto poco documentado en la literatura de compresión de LLM. El propio autor advierte explícitamente que no es un modelo de chat de propósito general y que varias celdas de la malla están deliberadamente degradadas en seguridad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2), comprimido con SVD-LLM |
| Parámetros totales | 6.738.415.616 (59,98 % del denso original) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada de Llama-2-7b-chat) |
| Tipos de cuantización | no disponible (pesos publicados en safetensors, presumiblemente bf16/fp16) |
| Idiomas soportados | no disponible |
| Licencia | Llama 2 Community License |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura de partida es un transformer decoder-only de la familia Llama 2 con 7 000 millones de parámetros. Sobre ella se aplica SVD-LLM, un método de compresión post-entrenamiento que descompone las matrices de pesos mediante SVD y descarta componentes según una regla de selección basada en la utilidad estimada con un conjunto de calibración. En este caso la matriz de covarianza de calibración es la suma agregada `S S^T = sum_WikiText x x^T + sum_safety x x^T`, combinando WikiText-2 con un conjunto de seguridad (`wj_harm_resp_sep:512`), lo que da una cuota efectiva de seguridad del 26,39 % de las posiciones. Se elimina el 40,00 % de los parámetros, con semilla 42.

Tras la compresión se aplica una recuperación en dos etapas con LoRA secuencial (primero U, luego V), entrenada sobre alpaca-cleaned con r=8, alpha=16, 2 épocas, learning rate 1e-4, batch 64, cutoff 256 y precisión bf16. El conjunto de utilidad emplea 255 ventanas de 2048 tokens de WikiText-2 train (muestreador de SVD-LLM, semilla 42) evaluando todas las posiciones; el conjunto de seguridad usa los primeros 512 prompts de WildJailbreak train (vanilla y adversarial) con las respuestas de rechazo del propio Llama-2-7b-chat, una conversación por muestra desempaquetada (187 197 posiciones). No se documenta RLHF ni DPO adicionales más allá del alineamiento heredado del modelo base.

## Capacidades

- Generación de texto conversacional, heredada de Llama-2-7b-chat, aunque degradada por la compresión y la recuperación con LoRA.
- Razonamiento y respuesta a instrucciones en el rango esperado de un modelo de 7B comprimido; precisión media zero-shot de 0,4907 en 7 tareas.
- Comportamiento de rechazo ante peticiones dañinas medido empíricamente: ASR de 0,0019 en AdvBench y 0,0128 en StrongREJECT con juez HarmBench.
- Capacidad de servir como sujeto experimental para estudiar el efecto de la compresión SVD sobre el alineamiento de seguridad.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Estudio de compresión y seguridad: el checkpoint sirve como celda de referencia para medir cómo varía la tasa de éxito de ataques (ASR) al eliminar el 40 % de parámetros con una regla de selección concreta; se compara contra otras celdas de la malla y contra el modelo denso.
- Evaluación de reglas de selección de componentes: al fijar el presupuesto (0,5998) y variar la regla, permite aislar el efecto de la cuota de seguridad en la calibración (26,39 % de posiciones) sobre el comportamiento final.
- Investigación en interpretabilidad: la estructura SVD subyacente facilita analizar qué componentes de las matrices de pesos están asociados a comportamientos de rechazo y cuáles a utilidad general.
- Reproducción de experimentos académicos: con semilla 42 y conjuntos de calibración documentados (WikiText-2 y WildJailbreak), es replicable en pipelines de investigación que necesiten un punto de comparación comprimido.
- Benchmarking de pipelines de evaluación de seguridad: útil para validar arneses como HarmBench o WildGuard contra un modelo con ASR y sobre-rechazo conocidos (macro over-refusal de 0,6677).
- Docencia y formación: ejemplo práctico de compromiso utilidad-seguridad en compresión post-entrenamiento, con métricas publicadas de perplejidad y precisión zero-shot.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,0019 |
| StrongREJECT ASR (juez HarmBench) | 0,0128 |
| Macro over-refusal (WildGuard) | 0,6677 |
| Perplejidad WikiText-2 | 11,3605 |
| Precisión media zero-shot (7 tareas, acc_norm donde se reporta) | 0,4907 |

No se han publicado resultados de benchmarks comparativos adicionales (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 6,74 mil millones de parámetros, en bf16/fp16 requiere aproximadamente 13,5 GB de pesos, más overhead de activaciones y KV cache.
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño, encaja en GPUs con 24 GB o más (RTX 3090/4090, A10, L4, A100, H100).
- ¿Cabe en consumer GPU? Sí, previsiblemente en RTX 3090/4090 (24 GB) en bf16, y en GPUs de 12-16 GB con cuantización a 8 o 4 bits, aunque el autor no publica pesos cuantizados.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference`), endpoints compatibles; llama.cpp/Ollama requerirían conversión a GGUF no publicada.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| svd-safety-l2_svdllmwjsep512_r40 | 6,74 B (59,98 % del denso) | no disponible | Llama 2 Community | Hugging Face, 1 descarga | Artefacto de investigación, ASR 0,0019 / 0,0128, ppl 11,36 |
| meta-llama/Llama-2-7b-chat-hf | 7 B | 4 096 tokens (según modelo base) | Llama 2 Community | Hugging Face, ampliamente usado | Modelo denso de referencia; el autor no publica sus métricas en esta ficha |
| AIoT-MLSys-Lab/SVD-LLM | no disponible | no disponible | no disponible | Hugging Face | Implementación del estimador SVD-LLM usada; no es un modelo comparable directamente |

No se dispone de datos de rendimiento de las alternativas en la información proporcionada para establecer una comparación cuantitativa completa.

## Limitaciones y advertencias

- El autor declara explícitamente que no es un modelo de chat de propósito general y que debe tratarse como sujeto experimental, no como asistente desplegable.
- Varias celdas de la malla están deliberadamente degradadas en seguridad respecto a Llama-2-7b-chat; la compresión por sí sola eleva la tasa de éxito de ataques.
- El macro over-refusal de 0,6677 indica una tendencia elevada a rechazar peticiones legítimas, lo que puede degradar la experiencia en uso conversacional.
- Riesgo de alucinación no cuantificado en la información disponible; la perplejidad de 11,3605 en WikiText-2 es superior a la del modelo denso de referencia (no publicada aquí), lo que sugiere pérdida de calidad.
- Idiomas soportados no documentados; se asume el comportamiento multilingüe del modelo base, pero sin garantías.
- Restricciones de licencia: Llama 2 Community License, con `LICENSE.txt` y `USE_POLICY.md` incluidos en el repositorio; el uso comercial está sujeto a los términos de dicha licencia y a la política de uso aceptable.
- El checkpoint se distribuye sin cuantizaciones oficiales ni conversión a GGUF, lo que limita su despliegue en entornos de bajo consumo de memoria sin trabajo adicional.
- Solo 1 descarga y 0 likes en el momento de la ficha: no hay validación comunitaria independiente de las métricas reportadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jeesup/svd-safety-l2_svdllmwjsep512_r40
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Implementación SVD-LLM: https://huggingface.co/AIoT-MLSys-Lab/SVD-LLM
- Repositorio SVD-LLM (referenciado en la model card): https://github.com/AIoT-MLSys-Lab/SVD-LLM
- Conjunto de calibración de seguridad (WildJailbreak): no disponible como enlace directo en la información proporcionada
- Conjunto de utilidad (WikiText-2): no disponible como enlace directo en la información proporcionada
- Paper de SVD-LLM: no disponible como enlace directo en la información proporcionada
