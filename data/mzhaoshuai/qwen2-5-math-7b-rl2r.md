# mzhaoshuai/Qwen2.5-Math-7B-RL2R

## Resumen

Qwen2.5-Math-7B-RL2R es un ajuste fino del modelo Qwen2.5-Math-7B de Alibaba, desarrollado por Shuai Zhao (usuario `mzhaoshuai`) y publicado en Hugging Face. El modelo aplica RL2R (Reinforcement Learning with Reference-Based Rewards), una técnica de aprendizaje por refuerzo que, además de verificar la corrección binaria de la respuesta final, recompensa la similitud semántica con una solución de referencia. El objetivo es resolver el problema del escaso señal de aprendizaje en problemas de matemáticas donde la verificación basada en reglas no discrimina entre soluciones incorrectas.

El modelo parte de la arquitectura transformer densa de Qwen2.5-Math-7B, con 7.000 millones de parámetros, y se entrena con Dr. GRPO sobre 8.523 problemas de matemáticas de niveles de dificultad 3 a 5 del conjunto MATH. La innovación principal es la incorporación de recompensas densas basadas en BERTScore con ponderación IDF, calculadas contra soluciones de referencia sintetizadas, lo que permite obtener señal de aprendizaje incluso cuando el modelo falla la respuesta final.

La relevancia actual del modelo radica en su mejora sustancial sobre la base: la precisión media en cinco benchmarks de matemáticas pasa del 26,5 % al 51,8 %, con incrementos especialmente notables en AIME 2024 (de 16,7 % a 43,3 %) y MATH500 (de 50,6 % a 80,6 %). El modelo se distribuye sin licencia especificada y sin información sobre idiomas soportados, y está orientado exclusivamente a razonamiento matemático con prompts en texto plano, sin plantilla de chat.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen2.5-Math-7B) |
| Parametros totales | 7.000 millones (7B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens (longitud de contexto de entrenamiento); generación máxima de 3.072 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | No disponible (repo de 0,0 GB en el momento de la consulta) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 7.000 millones de parámetros que hereda la arquitectura de Qwen2.5-Math-7B. El entrenamiento se realiza con Dr. GRPO (una variante de GRPO), con 1 época interna por lote de rollouts, doble clipping de 3,0 y sin penalización KL. Se emplean 12 épocas de prompt, tasa de aprendizaje constante de 1e-6, tamaño de lote global de 128 prompts, 8 rollouts por prompt, temperatura de rollout de 1,0, longitud de prompt de 1.024 tokens, longitud máxima de generación de 3.072 tokens y contexto de 4.096 tokens, todo en precisión bf16. El framework de entrenamiento está basado en `oat` (sail-sg) con rollouts en vLLM, sobre transformers 4.57.3.

La innovación técnica central es la función de recompensa RL2R: `R = 1.0 · R_rule + 0.3 · Sim_ans + 0.3 · Sim_step`. `R_rule` es la verificación binaria de corrección con `math-verify`; `Sim_ans` y `Sim_step` son BERTScore (recall) ponderado por IDF a nivel de respuesta y de paso, calculados con `facebook/bart-large-mnli` contra una solución de referencia. Las estadísticas IDF se estiman sobre los 8.523 problemas de entrenamiento y sus soluciones de referencia. Las recompensas se normalizan con `Z_norm = 1.6`. Los datos de entrenamiento son 8.523 problemas de matemáticas de niveles 3 a 5 del split `math_12k` de "Understanding R1-Zero-Like Training"; como ese split omite soluciones paso a paso, se sintetiza una solución de referencia por problema con `gpt-5.4`, retenida solo si su respuesta final coincide con la verdad de referencia bajo el grader de equivalencia del entrenamiento. El checkpoint final (paso 690) se selecciona por precisión media en el conjunto de evaluación.

## Capacidades

- Razonamiento matemático avanzado: resolución de problemas de competición (AIME, AMC, OlympiadBench, Minerva, MATH500) con razonamiento paso a paso y respuesta final en `\boxed{}`.
- Generación de cadenas de razonamiento largas, de hasta 3.072 tokens de generación.
- Mejora del razonamiento en problemas donde la verificación binaria no proporciona señal, gracias a las recompensas densas de similitud semántica.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso con herramientas.
- Capacidades multilingües: no disponibles (la model card no especifica idiomas; el entrenamiento se centra en problemas matemáticos en inglés).
- No se documenta modo thinking explícito, visión ni audio.

## Casos de uso

- Resolución de problemas matemáticos de competición: el modelo recibe el enunciado en texto plano y genera una solución paso a paso con la respuesta final en `\boxed{}`, adecuado para evaluación automática con `math-verify` en pipelines de investigación.
- Generación de soluciones de referencia para datasets matemáticos: dado su rendimiento en MATH500 (80,6 %) y AMC (60,2 %), puede emplearse para sintetizar soluciones candidatas que luego se filtran por verificación de respuesta final.
- Tutoría matemática automatizada en entornos de investigación: el modelo produce razonamientos detallados que pueden revisarse manualmente, aunque su formato sin plantilla de chat limita su uso directo en interfaces conversacionales.
- Evaluación comparativa de técnicas de RL: sirve como checkpoint de referencia para estudiar el efecto de recompensas densas basadas en referencias frente a verificación binaria en experimentos de alineamiento.
- Destilación de razonamiento matemático: las cadenas de razonamiento generadas pueden usarse como datos de entrenamiento para modelos más pequeños, filtrando por corrección de la respuesta final.
- Investigación en verificación de razonamiento: permite analizar la calidad de los pasos intermedios mediante las métricas de similitud semántica empleadas en el entrenamiento (BERTScore a nivel de paso).

## Benchmarks y rendimiento

Resultados de precisión (%) con decodificación greedy (temperatura 0, top-p 1), longitud máxima de generación de 3.072 tokens, prompts sin plantilla de chat y extracción de respuesta con `math-verify`.

| Modelo | AIME 2024 (n=30) | AMC (n=83) | MATH500 (n=500) | Minerva (n=272) | OlympiadBench (n=675) | Media |
|---|---|---|---|---|---|---|
| Qwen2.5-Math-7B (base) | 16,7 | 38,6 | 50,6 | 9,9 | 16,6 | 26,5 |
| Qwen2.5-Math-7B-RL2R (este modelo) | 43,3 | 60,2 | 80,6 | 30,5 | 44,4 | 51,8 |

Las salidas por benchmark están disponibles en el directorio `eval_results/` del repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Para un modelo denso de 7B en bf16 se requieren aproximadamente 14-16 GB de VRAM solo para pesos; con cuantización a 8 bits, unos 8 GB; a 4 bits, unos 4-5 GB (estimaciones generales, no publicadas por el autor).
- GPU recomendadas: no especificadas por el autor. Por tamaño, cabe en GPUs de consumo como RTX 4090 (24 GB) en bf16, y en GPUs de datacenter como A100 o H100 para mayor throughput.
- Opciones de despliegue: la model card solo documenta uso con `transformers` (`AutoModelForCausalLM`, `torch_dtype="bfloat16"`, `device_map="auto"`). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para inferencia, aunque el entrenamiento usó rollouts con vLLM.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Media en benchmarks matemáticos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-Math-7B-RL2R | 7B | 4.096 | 51,8 | No disponible | Hugging Face |
| Qwen2.5-Math-7B (base) | 7B | No disponible en la información | 26,5 | No disponible en la información | Hugging Face |
| Alternativas de razonamiento matemático de 7B (p. ej., variantes R1-Zero-like) | 7B | No disponible | No disponible | No disponible | No disponible |

La comparación se limita a la base Qwen2.5-Math-7B, para la que se dispone de resultados en la misma suite de evaluación. No se dispone de datos de benchmarks de otras alternativas en la información proporcionada.

## Limitaciones y advertencias

- El modelo está entrenado y evaluado con texto plano del problema, sin plantilla de chat; usarlo con plantilla de chat puede degradar el rendimiento.
- La licencia no está especificada, lo que impide confirmar si se permite el uso comercial; debe consultarse con el autor antes de usarlo en producción.
- Los idiomas soportados no están documentados; el entrenamiento se centra en problemas matemáticos, presumiblemente en inglés.
- La longitud de contexto de entrenamiento es de 4.096 tokens y la generación máxima de 3.072 tokens, lo que limita problemas muy largos o razonamientos extensos.
- Riesgo de alucinación en pasos intermedios: las recompensas de similitud semántica pueden premiar soluciones superficialmente parecidas a la referencia sin garantizar corrección lógica.
- Las soluciones de referencia se sintetizaron con `gpt-5.4` y se filtraron por coincidencia de respuesta final, por lo que pueden contener errores en los pasos intermedios que el modelo podría aprender.
- El checkpoint se selecciona por precisión media en la suite de evaluación, lo que puede introducir un sesgo hacia esos benchmarks concretos.
- El repositorio aparece con tamaño de 0,0 GB y 0 descargas en el momento de la consulta, lo que sugiere que los pesos podrían no estar disponibles o estar en proceso de subida.
- No se documentan sesgos específicos ni evaluaciones de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mzhaoshuai/Qwen2.5-Math-7B-RL2R
- Repositorio GitHub (rama reasoning): https://github.com/mzhaoshuai/RL2R/tree/reasoning
- Paper RL2R: https://huggingface.co/papers/2504.09895
- Paper "Understanding R1-Zero-Like Training": https://arxiv.org/abs/2503.20783
- Modelo base Qwen2.5-Math-7B: https://huggingface.co/Qwen/Qwen2.5-Math-7B
- Modelo BERTScore `facebook/bart-large-mnli`: https://huggingface.co/facebook/bart-large-mnli
- Framework `oat`: https://github.com/sail-sg/oat
