# dill-lab/GeoLadder-16M-8B-bs32-lr0.0087-wd0.1-decay0.01

## Resumen

GeoLadder-16M-8B-bs32-lr0.0087-wd0.1-decay0.01 es un modelo de lenguaje autorregresivo de tipo OLMo con 16 millones de parametros, entrenado desde cero sobre la version deduplicada del dataset The Pile (EleutherAI/the_pile_deduplicated) durante 8.000 millones de tokens. Lo publica el grupo dill-lab como parte de una suite de 108 modelos (de 4M a 75M de parametros) entrenados bajo variaciones controladas de batch size, weight decay, learning rate, presupuesto de tokens y LR final. No es un modelo destinado a produccion, sino un artefacto de investigacion para estudiar la relacion entre la geometria de la matriz de unembedding (en particular su rango efectivo) y el rendimiento downstream.

El modelo forma parte del trabajo "Disentangling Geometry, Performance, and Training in Language Models" (Kulkarni, Springer, Subramonian y Swayamdipta), presentado en ICML 2026. La conclusion principal del paper es negativa: el rango efectivo de la matriz de unembedding no predice de forma fiable el rendimiento downstream, aunque valores altos de rango suelen acompanar a los mejores modelos y los valores bajos coinciden con degradacion tardia en el entrenamiento.

El repositorio incluye 41 checkpoints intermedios (ramas `step0` a `step122081`), con la rama `main` apuntando al checkpoint final. Es relevante ahora como recurso reproducible y de bajo coste para estudiar dinamica de entrenamiento, geometria de representaciones y escalado en regimenes de parametros muy reducidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo OLMo (OLMoForCausalLM, arquitectura legacy hf_olmo) |
| Parametros totales | 16M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (longitud de secuencia usada en entrenamiento; no se confirma un contexto de inferencia distinto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (entrenado sobre The Pile deduplicado, mayoritariamente ingles) |
| Licencia | no disponible |
| Formato de pesos | pytorch_model.bin (PyTorch); incluye config.json y config.yaml de OLMo |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura OLMo en su implementacion legacy `hf_olmo`, es decir, un transformer decoder-only con atencion causal estandar. Se carga mediante `AutoModelForCausalLM` tras importar `hf_olmo`, que registra `OLMoForCausalLM` en Transformers. No hay innovaciones de arquitectura propias: el interes esta en las variaciones de hiperparametros, no en el diseno del bloque.

El entrenamiento consumio 8.000 millones de tokens de EleutherAI/the_pile_deduplicated, con secuencias de 2048 tokens y batch size de 32 secuencias. El pico de learning rate fue 0.0087, el weight decay 0.1 y el schedule de LR fue coseno con `alpha_f = 0.01` (LR final = 1 por ciento del pico). No se documenta uso de RLHF, DPO ni fine-tuning posterior; es un modelo puramente preentrenado. El repositorio conserva el orden de los datos de entrenamiento en `data-indices/` y `train_data/global_indices.npy`, lo que permite reproducir exactamente la secuencia de tokens de cada checkpoint.

## Capacidades

- Generacion de texto autorregresiva basica, limitada por su tamano (16M de parametros).
- Modelado de lenguaje de siguiente token; util como base para analisis de representaciones y dinamica de entrenamiento.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso (capacidad practicamente inexistente a esta escala).
- Capacidades multilingues: no documentadas; el corpus de entrenamiento es fundamentalmente en ingles.
- Capacidades especiales (vision, audio, modo thinking, decodificacion especulativa): no disponibles.
- Valor principal como objeto de experimentacion: checkpoints intermedios reproducibles y datos de orden de entrenamiento incluidos.

## Casos de uso

- Estudio de geometria de representaciones: analizar el rango efectivo de la matriz de unembedding a lo largo de los 41 checkpoints para reproducir los hallazgos del paper sobre su relacion con el rendimiento.
- Investigacion de dinamica de entrenamiento: comparar trayectorias de perdida y metricas geometricas entre este modelo y los otros 107 de la suite GeoLadder bajo distintos hiperparametros.
- Ablaciones reproducibles: usar los indices de datos incluidos para estudiar el efecto del orden de tokens en la curva de aprendizaje, imposible de reproducir con la mayoria de modelos publicos.
- Docencia y divulgacion: modelo de 16M lo bastante pequeno para entrenar, examinar y ajustar en un portatil, util para explicar el ciclo completo de preentrenamiento de un LLM.
- Pruebas de pipelines de evaluacion: validar frameworks de evaluacion (lm-evaluation-harness y similares) con un modelo de coste minimo antes de escalar a modelos grandes.
- Estudio de escalado (scaling laws): combinar este punto de 16M con los de 4M a 75M de la coleccion para trazar curvas de rendimiento frente a parametros y tokens de forma controlada.
- Referencia negativa para deteccion de alucinacion: medir la tasa de generacion incoherente en un modelo sin alineamiento, como linea base frente a modelos ajustados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El paper asociado evalua metricas geometricas (como el rango efectivo de la matriz de unembedding) y rendimiento downstream sobre la suite completa, pero en la informacion proporcionada no se incluyen cifras concretas de MMLU, HumanEval, GSM8K ni de tareas comparables para este checkpoint concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32 los pesos ocupan aproximadamente 64 MB; en FP16, unos 32 MB. Con overhead de activaciones y runtime, cabe holgadamente en menos de 1 GB.
- GPU recomendadas: cualquier GPU, incluidas integradas. Una RTX 4090, A100 o H100 estan enormemente sobredimensionadas para este modelo.
- Compatibilidad con GPU de consumo: si, cabe en cualquier GPU de consumo e incluso en CPU. El repositorio ocupa 4,9 GB en disco por acumular 41 checkpoints, no por el tamano del modelo.
- Opciones de despliegue: Transformers con `hf_olmo` instalado y `ai2-olmo` es el camino documentado. La conversion a GGUF para llama.cpp u Ollama no esta documentada para la arquitectura legacy hf_olmo y requeriria trabajo adicional. El soporte en vLLM o TGI no esta confirmado.
- Latencia y throughput estimados: no disponibles; dado el tamano, la inferencia en CPU es viable y en GPU practicamente instantanea, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Corpus | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GeoLadder-16M-8B... | 16M | 2048 (entrenamiento) | The Pile deduplicado, 8B tokens | no disponible | HuggingFace (repo con 41 checkpoints) |
| Pythia-14M (EleutherAI) | 14M | 2048 | The Pile | Apache-2.0 | HuggingFace |
| Pythia-70M (EleutherAI) | 70M | 2048 | The Pile | Apache-2.0 | HuggingFace |
| OLMo (AI2) | versiones desde 1B | hasta 2048 en la version inicial | Dolma | Apache-2.0 | HuggingFace |

La comparacion mas directa es con la suite Pythia, que sigue un espiritu similar (checkpoints multiples y reproducibilidad), aunque Pythia publica con licencia Apache-2.0 y sobre el Pile completo, mientras que GeoLadder usa el Pile deduplicado y no declara licencia en la informacion disponible. No se dispone de cifras de rendimiento comparables entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse sobre The Pile, hereda los sesgos de ese corpus; no se documenta ninguna mitigacion ni evaluacion de sesgo.
- Riesgo de alucinacion: muy alto tanto por el sistema de aprendizaje sin alineamiento como por el tamano (16M de parametros), que limita severamente la coherencia mas alla de secuencias cortas.
- Limitaciones de contexto e idioma: la secuencia de entrenamiento es de 2048 tokens y el corpus es mayoritariamente en ingles; no hay soporte multilingue documentado.
- Restricciones de licencia: la licencia no esta disponible en la informacion proporcionada; no debe asumirse uso comercial sin aclaracion previa del autor.
- Caveat de compatibilidad: requiere instalar `ai2-olmo` para registrar `OLMoForCausalLM`; la carga con Transformers estandar fallara sin ese paso. La cuantizacion no esta documentada.
- No apto para produccion: es un artefacto de investigacion sin fine-tuning instructivo, sin alineamiento y con capacidad practica muy limitada. No debe desplegarse en aplicaciones de cara al usuario.

## Enlaces

- HuggingFace: https://huggingface.co/dill-lab/GeoLadder-16M-8B-bs32-lr0.0087-wd0.1-decay0.01
- Coleccion GeoLadder: https://huggingface.co/collections/dill-lab/geoladder-6acd192e30ec71aff2998e2e
- Paper (PMLR): https://proceedings.mlr.press/v306/kulkarni26c.html
- arXiv: https://arxiv.org/abs/2602.20433
- OpenReview: https://openreview.net/forum?id=kNb6NNhKgE
- Dataset: https://huggingface.co/datasets/EleutherAI/the_pile_deduplicated
- Repositorio de ai2-olmo (requerido para cargar el modelo): no disponible en la informacion proporcionada.
