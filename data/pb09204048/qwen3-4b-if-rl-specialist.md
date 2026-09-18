# pb09204048/Qwen3-4B-IF-RL-Specialist

## Resumen

Qwen3-4B-IF-RL-Specialist es un ajuste fino de instrucciones (instruction following, IF) construido por el usuario pb09204048 a partir de Qwen/Qwen3-4B. Se trata de un especialista de dominio entrenado mediante RL independiente con objetivos tipo GRPO, partiendo de un adaptador LoRA de rango 16 que posteriormente se fusiona en los pesos completos en BF16. Su propósito concreto es maximizar el cumplimiento literal de restricciones de formato y contenido en las respuestas, un eje donde el modelo base rinde de forma notablemente inferior (25,00 % en IFBench frente a 43,67 % del especialista).

El modelo forma parte de una familia de tres especialistas (matemáticas, código e instrucciones) que el autor publica como posibles profesores de dominio para experimentos de destilación en política multi-profesor (MOPD). En esta entrega no se ha entrenado ni evaluado ningún estudiante MOPD, por lo que los checkpoints deben considerarse piezas intermedias de investigación más que modelos listos para producción.

Con 4.411.424.256 parámetros (~4,4 B) y un repositorio de 8,8 GB, se sitúa en el rango de modelos compactos aptos para GPUs de consumo. Su licencia Apache 2.0 y el formato safetensors favorecen la experimentación, aunque el autor no declara idiomas soportados ni ventana de contexto explícita, y las puntuaciones en matemáticas y código caen respecto al modelo base.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3) con adaptadores LoRA de rango 16 fusionados en los pesos |
| Parametros totales | 4.411.424.256 (~4,4 B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No declarada en la información proporcionada; el entrenamiento limitó los prompts a 4.096 tokens y las respuestas a 16.384 tokens |
| Tipos de cuantizacion | BF16 (safetensors); no se publican versiones GGUF, AWQ ni GPTQ en el repositorio |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16); repositorio de 8,8 GB |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen/Qwen3-4B, un transformer decoder-only denso de aproximadamente 4,4 B de parámetros. Sobre él se entrenó un adaptador LoRA de rango 16 y alpha 32 con dropout 0, aplicado a las proyecciones de atención, las proyecciones del MLP y la cabeza `lm_head`. Los deltas de LoRA se fusionaron en FP32 y se guardaron en BF16; las embeddings de entrada se preservaron y la cabeza de salida adaptada queda sin atar (untied). La validación de exportación comprobó los 506 tensores del adaptador y verificó logits idénticos tras guardar y recargar en BF16.

El entrenamiento usa RL de dominio con ventajas centradas por grupo al estilo GRPO y un objetivo de política recortado tipo PPO. Las ventajas restan la recompensa media del grupo de prompt sin normalización por desviación típica, sin crítico y sin penalización KL. La recompensa es la fracción de restricciones de instrucción satisfechas, evaluada con los identificadores de instrucción y los argumentos del checker proporcionados. Se usaron lotes de hasta 32 prompts × 8 respuestas, temperatura de rollout 1,0, top-p 1,0, top-k desactivado, modo thinking desactivado y respuesta máxima de 16.384 tokens. El optimizador es Adam con tasa de aprendizaje 1e-5, 10 actualizaciones de warmup y ratios de recorte [0,8; 1,2]. Las respuestas reciben el mismo peso y sus pérdidas por token se promedian.

El especialista IF se entrenó únicamente con el split IF-RL de nvidia/Nemotron-Cascade-2-RL-data (`IF-RL/train.jsonl`). Tras eliminar duplicados normalizados y solapamientos con evaluación, y reservar 64 prompts de desarrollo, quedaron 45.621 prompts de entrenamiento, con un tope de 4.096 tokens por prompt. El checkpoint examinó el 77,86 % de los candidatos preparados (no completó una época) y muestreó 35.520 prompts × 8 respuestas = 284.160 respuestas de rollout; no todas generan gradiente, ya que se excluyen los grupos con recompensa constante, las ventajas centradas nulas y las respuestas cortadas por límite de longitud. Se registraron 1.110 actualizaciones del optimizador. La auditoría de prompts no encontró coincidencias exactas entre entrenamiento y evaluación, aunque el autor advierte que estas comprobaciones no establecen descontaminación semántica ni de preentrenamiento.

## Capacidades

- Generación de texto conversacional en formato de instrucciones, heredada del modelo base Qwen3-4B.
- Cumplimiento literal de instrucciones: 84,47 % de prompt strict accuracy en IFEval (541 prompts, con corrección literal de puntuación).
- Cumplimiento de restricciones múltiples: 43,67 % de prompt strict accuracy en IFBench (300 prompts), frente al 25,00 % del modelo base.
- Respuestas con restricciones de formato, longitud, puntuación y contenido verificables mediante checkers.
- Razonamiento matemático limitado: 18,33 % de pass@1 en AIME24, por debajo del 22,50 % del modelo base.
- Generación de código limitada: 15,68 % de pass@1 en el subconjunto congelado de LCB v5, por debajo del 17,56 % del modelo base.
- Modo thinking desactivado durante el entrenamiento RL.
- Uso previsto como profesor de dominio (teacher) en experimentos de MOPD.
- Soporte de tool calling / function calling: no declarado en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no declarado en la información proporcionada.
- Capacidades multilingües: no disponibles; el autor no declara idiomas.
- Capacidades de visión o audio: no aplica, es un modelo de texto.

## Casos de uso

- Destilación multi-profesor (MOPD): el checkpoint está pensado como profesor de dominio de instruction following para entrenar un estudiante que combine las capacidades de los especialistas de matemáticas, código e IF. En este escenario se usaría para generar distribuciones objetivo sobre prompts con restricciones verificables.
- Generación de salidas con formato estricto: en pipelines que exigen JSON, plantillas fijas o esquemas de campos, el modelo puede imponer restricciones de estructura y puntuación con una tasa de cumplimiento estricto del 84,47 % en IFEval.
- Evaluación comparativa de instruction following: sirve como referencia interna para medir cuánto mejora o degrada un ajuste sobre Qwen3-4B en IFEval e IFBench bajo un protocolo congelado.
- Asistentes conversacionales con restricciones de estilo: para chatbots que deben responder con longitud máxima, tono o vocabulario controlados, el especialista prioriza el cumplimiento de la restricción sobre la riqueza factual.
- Generación de datos sintéticos con restricciones: producción de pares instrucción-respuesta que respetan un conjunto explícito de constraints, útiles para aumentar datasets de entrenamiento de otros modelos.
- Corrección literal de puntuación y formato: tareas de normalización de texto donde la fidelidad a la instrucción pesa más que el conocimiento factual, como reescritura con signos de puntuación específicos.
- Reproducción de experimentos de RL (GRPO): el checkpoint documenta hiperparámetros, manifiesto de datasets y procedencia, lo que facilita replicar el pipeline de RL de dominio en un entorno académico.
- Investigación sobre especialización frente a generalización: permite estudiar el intercambio entre ganancia en IFBench (+18,67 puntos) y pérdida en AIME24 (-4,17 puntos) frente al modelo base.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (no verificados):

| Benchmark | Metrica | Resultado | Muestras | Verificado |
|---|---|---|---|---|
| AIME24 | Pass@1 (%) | 18,33 | 30 prompts, 4 muestras | No |
| LCB v5 (subconjunto de test congelado) | Pass@1 (%) | 15,68 | 279 prompts, 4 muestras | No |
| IFEval | Prompt strict accuracy (%) | 84,47 | 541 prompts | No |
| IFBench | Prompt strict accuracy (%) | 43,67 | 300 prompts | No |

Evaluación cruzada de los cuatro modelos de la familia bajo el mismo protocolo congelado (8.308 respuestas en total):

| Modelo | AIME24 pass@1 | Coding pass@1 | IFEval prompt strict | IFBench prompt strict |
|---|---|---|---|---|
| Qwen3-4B base | 22,50 | 17,56 | 81,33 | 25,00 |
| Especialista Math (step 500) | 50,00 | 18,19 | 80,04 | 25,67 |
| Especialista Code (step 299) | 25,83 | 24,10 | 81,70 | 25,33 |
| Especialista IF (step 1110) | 18,33 | 15,68 | 84,47 | 43,67 |

Protocolo: en matemáticas y código se muestrearon cuatro respuestas por prompt con temperatura 0,7, top-p 0,8 y top-k 20; pass@1 es la media de la tasa de éxito. El autor no publica resultados de benchmarks adicionales ni comparaciones con modelos externos.

## Requisitos de hardware

- Pesos en BF16: 4.411.424.256 parámetros × 2 bytes ≈ 8,8 GB, lo que coincide con el tamaño del repositorio.
- VRAM estimada para inferencia en BF16: aproximadamente 10-12 GB contando pesos, caché KV y activaciones en contextos moderados; el consumo crece con la longitud de contexto.
- GPU de consumo: cabe en RTX 4090 (24 GB) y RTX 3090 (24 GB) con margen; en RTX 4080 (16 GB) queda ajustado en BF16.
- GPU de 8-12 GB: requeriría cuantización, pero el autor no publica versiones GGUF, AWQ ni GPTQ, por lo que habría que convertir los pesos manualmente.
- GPU profesionales: A100 (40/80 GB) y H100 permiten lotes mayores y contextos más largos, aunque el modelo no los necesita por tamaño.
- Opciones de despliegue: la librería declarada es transformers; los tags incluyen text-generation-inference (TGI) y endpoints_compatible. vLLM es compatible con pesos safetensors estándar de Qwen3. llama.cpp y Ollama exigirían una conversión previa a GGUF no publicada.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | AIME24 pass@1 | IFEval | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3-4B-IF-RL-Specialist | ~4,4 B | No disponible | 18,33 | 84,47 | Apache 2.0 | HuggingFace |
| Qwen3-4B (base) | ~4,4 B | No disponible en la información | 22,50 | 81,33 | Apache 2.0 | HuggingFace |
| Especialista Math (mismo autor, step 500) | ~4,4 B | No disponible | 50,00 | 80,04 | Apache 2.0 | HuggingFace |
| Especialista Code (mismo autor, step 299) | ~4,4 B | No disponible | 25,83 | 81,70 | Apache 2.0 | HuggingFace |

Los tres especialistas comparten modelo base, licencia y arquitectura, y solo difieren en el dominio de RL y en el número de actualizaciones del optimizador. El especialista IF es el único que mejora claramente IFBench y el que más sacrifica AIME24. No se dispone de comparaciones con otros modelos de instrucciones de tamaño similar.

## Limitaciones y advertencias

- Modelo experimental con 0 descargas y 0 likes en el momento del registro, y métricas de benchmark marcadas como no verificadas.
- Rendimiento claramente inferior al modelo base en matemáticas (18,33 frente a 22,50 en AIME24) y en código (15,68 frente a 17,56 en LCB v5): el especialista IF no es adecuado como modelo generalista.
- No se declara la ventana de contexto final del modelo; el entrenamiento limitó los prompts a 4.096 tokens y las respuestas a 16.384, lo que puede reducir el rendimiento en entradas muy largas.
- No se declaran idiomas soportados; el comportamiento multilingüe no está documentado ni evaluado.
- El riesgo de alucinación no se evalúa en la información proporcionada (no hay métricas de factualidad como TruthfulQA o HaluEval).
- Sesgos conocidos: no disponibles; el autor no documenta análisis de sesgo.
- El autor advierte de que las comprobaciones de duplicados y solapamiento con evaluación no equivalen a una descontaminación semántica ni de preentrenamiento, por lo que los resultados podrían estar parcialmente inflados.
- El checkpoint no completó una época de entrenamiento (77,86 % de candidatos examinados), lo que sugiere que el modelo puede seguir mejorando con más pasos.
- No se ha entrenado ni evaluado ningún estudiante MOPD en esta entrega; los checkpoints son profesores potenciales, no un sistema destilado final.
- Licencia Apache 2.0: permite uso comercial y modificación, con obligación de conservar avisos de licencia y atribución.
- El modo thinking está desactivado, por lo que no se beneficia del razonamiento extendido característico de otros modelos Qwen3.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pb09204048/Qwen3-4B-IF-RL-Specialist
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Dataset de entrenamiento IF-RL: https://huggingface.co/datasets/nvidia/Nemotron-Cascade-2-RL-data
- Dataset de matemáticas (referenciado en la ficha): https://huggingface.co/datasets/zhuzilin/dapo-math-17k
- Dataset de código (referenciado en la ficha): https://huggingface.co/datasets/agentica-org/DeepCoder-Preview-Dataset
- Dataset de evaluación AIME24: https://huggingface.co/datasets/zhuzilin/aime-2024
- Dataset de evaluación IFEval: https://huggingface.co/datasets/google/IFEval
- Dataset de evaluación IFBench: https://huggingface.co/datasets/allenai/IFBench_test
- Paper referenciado en los tags: https://arxiv.org/abs/2606.30406
- Manifiesto de datasets (ruta relativa del repositorio): training/dataset_manifest.json
- Procedencia del modelo (ruta relativa del repositorio): model_provenance.json
