# mzhaoshuai/Qwen2.5-Math-1.5B-RL2R

## Resumen

Qwen2.5-Math-1.5B-RL2R es un ajuste fino del modelo Qwen2.5-Math-1.5B de Alibaba, desarrollado por Shuai Zhao (mzhaoshuai) y colaboradores, que aplica aprendizaje por refuerzo con recompensas basadas en referencias (RL2R, anteriormente denominado RefAlign) para mejorar el razonamiento matemático. El modelo parte de la arquitectura transformer decoder-only de Qwen2.5 con 1.777.088.000 parámetros totales y resuelve un problema concreto del RL estilo R1-Zero: cuando la verificación binaria de la respuesta no genera señal de aprendizaje, RL2R añade recompensas de similitud semántica contra soluciones de referencia.

La innovación principal es la composición de la función de recompensa, que combina verificación exacta con `math-verify` y dos términos de BERTScore ponderado por IDF (a nivel de respuesta y de paso) calculados con `facebook/bart-large-mnli`. El entrenamiento utiliza Dr. GRPO sobre 12.000 problemas matemáticos del split `math_12k`, con 8 rollouts por prompt y una longitud máxima de generación de 3072 tokens.

Es relevante ahora porque demuestra que un modelo de solo 1.500 millones de parámetros puede alcanzar un 74,8 % en MATH500 y un 54,2 % en AMC, casi duplicando el promedio de su modelo base (43,4 % frente a 24,2 %). Esto lo convierte en una referencia útil para investigadores que trabajan en RL para razonamiento con presupuesto computacional reducido. El modelo se distribuye con licencia Apache 2.0 y está orientado exclusivamente al inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) |
| Parametros totales | 1.777.088.000 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la informacion proporcionada (el prompt de entrenamiento usa 1024 tokens y la generacion maxima 3072) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (pesos en bf16; repo de 3,6 GB) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer decoder-only de Qwen2.5-Math-1.5B, con atención de múltiples cabezas y las optimizaciones estándar de la familia Qwen2.5 (RoPE, SwiGLU, RMSNorm). El ajuste fino se realiza con Dr. GRPO (una variante de GRPO), 1 época interna por lote de rollouts, doble clipping de 3,0 y sin penalización KL. Los hiperparámetros incluyen 10 épocas de prompt, tasa de aprendizaje constante de 1e-6, batch global de 128 prompts, 8 rollouts por prompt, temperatura de rollout de 1,0, longitud de prompt de 1024 y generación máxima de 3072 tokens en bf16. El checkpoint seleccionado (paso 480) se eligió por precisión media en el conjunto de evaluación.

La innovación técnica central es la función de recompensa: `R = 1.0 · R_rule + 0.15 · Sim_ans + 0.15 · Sim_step`, donde `R_rule` es la verificación binaria de corrección con `math-verify`, y `Sim_ans` y `Sim_step` son BERTScore con ponderación IDF (recall) a nivel de respuesta y de paso contra la solución de referencia. Las estadísticas IDF se estiman sobre los 12.000 problemas y soluciones de `math_12k`. Las recompensas se normalizan con `Z_norm = 1.3`. El entrenamiento se realizó con un framework basado en `oat` (transformers 4.57.3, rollouts con vLLM).

## Capacidades

- Generación de texto y razonamiento matemático paso a paso, con la respuesta final en formato `\boxed{}`.
- Resolución de problemas de competición (AIME, AMC, OlympiadBench, Minerva, MATH500).
- Razonamiento de cadena larga: genera hasta 3072 tokens de razonamiento antes de la respuesta.
- Funciona con texto plano del problema, sin plantilla de chat; no requiere formato conversacional.
- Capacidades multilingües limitadas: solo inglés declarado.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking explícito.

## Casos de uso

- Evaluación de técnicas de RL para razonamiento: sirve como checkpoint de referencia para comparar RL2R frente a RL con verificación binaria en modelos pequeños, dado que el repositorio incluye salidas por benchmark en `eval_results/`.
- Generación de soluciones matemáticas paso a paso en pipelines de investigación: se le pasa el enunciado en texto plano y se obtiene una traza de razonamiento con respuesta en `\boxed{}`, útil para construir datasets de soluciones.
- Tutoría matemática automatizada en inglés: el modelo produce explicaciones intermedias que pueden mostrarse al estudiante, aunque requiere post-procesado del formato `\boxed{}`.
- Benchmarking interno de modelos de 1,5B en tareas de competición: su rendimiento en MATH500 (74,8 %) y AMC (54,2 %) lo hace útil como línea base ligera en suites de evaluación.
- Investigación en funciones de recompensa densas: el código y la configuración de RL2R permiten reproducir el entrenamiento y experimentar con los pesos de `Sim_ans` y `Sim_step`.
- Despliegue en entornos con recursos limitados: con 1.777 millones de parámetros y pesos bf16, puede ejecutarse en una sola GPU consumer de gama alta para prototipos de razonamiento matemático.

## Benchmarks y rendimiento

Precisión (%) con decodificación greedy (temperatura 0, top-p 1), generación máxima de 3072 tokens, prompts sin plantilla de chat y extracción de respuesta con `math-verify`.

| Modelo | AIME 2024 (n=30) | AMC (n=83) | MATH500 (n=500) | Minerva (n=272) | OlympiadBench (n=675) | Media |
|---|---|---|---|---|---|---|
| Qwen2.5-Math-1.5B (base) | 20,0 | 32,5 | 33,0 | 12,5 | 22,8 | 24,2 |
| Qwen2.5-Math-1.5B-RL2R | 26,7 | 54,2 | 74,8 | 22,8 | 38,4 | 43,4 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 3,6 GB de pesos más memoria para KV cache y activaciones; en la práctica, entre 6 y 8 GB para generar secuencias de hasta 3072 tokens.
- GPU recomendadas: A100 (40/80 GB) o H100 para evaluación por lotes y throughput alto; RTX 4090 (24 GB) para inferencia individual sin problemas.
- Cabe en GPU consumer: sí, en RTX 4090, RTX 3090 (24 GB) y previsiblemente en tarjetas de 12-16 GB con cuantización, aunque no se documentan pesos cuantizados en el repositorio.
- Opciones de despliegue: transformers (ejemplo oficial en la model card), vLLM (usado para los rollouts del entrenamiento), text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible` en el repositorio). No se confirma compatibilidad con llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MATH500 | AMC | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen2.5-Math-1.5B-RL2R | 1,777 B | No disponible | 74,8 | 54,2 | Apache 2.0 | Hugging Face |
| Qwen2.5-Math-1.5B (base) | 1,777 B | No disponible | 33,0 | 32,5 | Apache 2.0 | Hugging Face |
| Alternativas de ~1,5B con RL para matemáticas | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks de otros modelos comparables en la información proporcionada; la comparación directa más fiable es con el modelo base, del que RL2R mejora en todos los conjuntos evaluados.

## Limitaciones y advertencias

- Entrenado y evaluado solo con inglés; no se garantiza rendimiento en castellano u otros idiomas.
- Requiere prompts en texto plano sin plantilla de chat; usar el chat template puede degradar el rendimiento.
- La respuesta final se emite en `\boxed{}`, lo que exige post-procesado para integrarlo en aplicaciones.
- Riesgo de alucinación en pasos intermedios: la recompensa de similitud semántica no garantiza corrección lógica de cada paso, solo proximidad a la referencia.
- Sesgos no documentados en la información proporcionada; al estar entrenado solo con problemas matemáticos, su comportamiento fuera de dominio es incierto.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen2.5-Math-1.5B también debe cumplir su propia licencia.
- Sin datos publicados sobre cuantizaciones (GGUF, AWQ, GPTQ), lo que limita el despliegue en hardware muy restringido.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validación externa muy limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mzhaoshuai/Qwen2.5-Math-1.5B-RL2R
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Math-1.5B
- Repositorio GitHub (rama reasoning): https://github.com/mzhaoshuai/RL2R/tree/reasoning
- Paper RL2R: https://huggingface.co/papers/2504.09895
- Paper arXiv RL2R: https://arxiv.org/abs/2504.09895
- Paper Understanding R1-Zero-Like Training: https://arxiv.org/abs/2503.20783
- Framework oat: https://github.com/sail-sg/oat
- BERTScore (facebook/bart-large-mnli): https://huggingface.co/facebook/bart-large-mnli
