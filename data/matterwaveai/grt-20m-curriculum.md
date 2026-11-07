# MatterWaveAI/grt-20m-curriculum

## Resumen

GRT-20M-Curriculum es un modelo de lenguaje causal de tipo base, desarrollado por MatterWaveAI, que implementa una arquitectura denominada Geometric Rotation Transformer (GRT). Con 16.730.832 parámetros totales (10.280.869 sin contar los embeddings), se posiciona en la categoría de small language models (SLM) y está diseñado como banco de pruebas para investigar optimizadores y estrategias de entrenamiento en modelos compactos, no como un asistente de propósito general.

El modelo parte del mismo checkpoint de 16,7M de parámetros que `MatterWaveAI/grt-20m` y aplica sobre él una optimización curricular multi-ronda con el optimizador `HuygensSymplecticAdam`. Según la model card, esta estrategia eleva la precisión macro-promedio en la suite de 9 tareas de elección múltiple SLM-Bench del 38,63% (baseline PairAdam) al 47,36%, y reduce la perplejidad en GSM8K de 12,52 a 7,65.

Su relevancia es fundamentalmente metodológica: demuestra cómo técnicas de optimización (optimizadores simplécticos y curriculums multi-ronda) pueden mejorar de forma medible un backbone rotacional muy pequeño sin aumentar el número de parámetros. No obstante, sus salidas cualitativas evidencian las limitaciones esperables de un modelo de este tamaño entrenado como base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Geometric Rotation Transformer (GRT), transformer causal con bloques rotacionales |
| Parametros totales | 16.730.832 (16,7M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en float32) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

Datos adicionales de arquitectura: `d_model` = 256, 12 bloques, 4 cabezas de atención, 11 rotaciones QKV, 21 rotaciones en la FFN, vocabulario BPE de 50.000 tokens. Los embeddings de token ocupan 6,45M de los 16,7M de parámetros (50.000 tokens x 128 ángulos de fase más una log-magnitud por token).

## Arquitectura y entrenamiento

La arquitectura GRT es un transformer causal con un esquema de rotaciones geométricas aplicadas en las proyecciones QKV (11 rotaciones) y en la red feed-forward (21 rotaciones), con un backbone no-embedding de 10,3M de parámetros distribuido en 12 bloques. El modelo se publica en float32 y utiliza una ventana de contexto máxima de 1.024 tokens.

El entrenamiento original se realizó durante 158.000 pasos con el optimizador PairAdam, LR pico de 1e-3 con decaimiento coseno hasta el 10%, alcanzando una pérdida de entrenamiento de 2,114. Los datos provienen de ClimbMix, Wikipedia, RefinedWeb, FineWeb-Edu, Cosmopedia, Nemotron y FineMath, además de StackExchange. La variante Curriculum aplica sobre ese checkpoint una optimización multi-ronda con `HuygensSymplecticAdam`, un optimizador de inspiración simpléctica (método de Huygens) que, según el autor, mejora la adaptación a tareas frente al ajuste de una sola pasada.

## Capacidades

- Generación de texto causal en inglés, como modelo base (no ajustado por instrucciones).
- Razonamiento de elección múltiple evaluado en tareas de sentido común y comprensión (BoolQ, ARC, OpenBookQA, PIQA, WinoGrande, HellaSwag, QNLI, CommonsenseQA).
- Verificación numérica de 4 vías en problemas de matemáticas de GSM8K, con una precisión reportada del 97,60%.
- No dispone de soporte documentado de tool calling ni function calling.
- No dispone de soporte documentado de agentes ni razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés.
- No se documentan modos especiales (thinking, visión, audio).

## Casos de uso

- Investigación sobre optimizadores: el modelo sirve como banco de pruebas reproducible para comparar PairAdam, HuygensSymplecticAdam y curriculums multi-ronda sobre un backbone de 10,3M de parámetros, con métricas publicadas en SLM-Bench.
- Evaluación de arquitecturas rotacionales: permite estudiar el comportamiento de las rotaciones geométricas en QKV y FFN frente a transformers convencionales del mismo tamaño, usando las 9 tareas de elección múltiple como referencia.
- Validación de pipelines de serving: la model card indica que las salidas greedy se reproducen token a token en transformers, vLLM y llama.cpp, lo que lo hace útil para verificar paridad entre rutas de inferencia en modelos pequeños.
- Docencia y divulgación: por su tamaño reducido (repo de 0,1 GB) y su licencia Apache 2.0, es adecuado para demostrar el ciclo completo de entrenamiento, evaluación y despliegue de un SLM en entornos con recursos limitados.
- Experimentos de curriculum learning: sirve como base para probar estrategias de ordenación de datos y rondas de adaptación, comparando contra las cifras de referencia publicadas (macro-promedio de 47,36%).
- Pruebas de infraestructura de inferencia: su huella mínima permite integrarlo en tests de CI/CD de servidores de inferencia (vLLM, llama.cpp) sin coste de GPU significativo.

## Benchmarks y rendimiento

Precisión en elección múltiple (9 tareas de SLM-Bench, 13.144 ejemplos retenidos):

| Tarea | Aleatorio | Zero-shot | PairAdam (NeurIPS) | Single-pass (Huygens) | Curriculum |
|---|---:|---:|---:|---:|---:|
| BoolQ (val, 3.270) | 50,00% | 62,17% | 53,43% | 62,35% | 66,42% |
| ARC-Easy (test, 2.376) | 25,00% | 26,43% | 26,85% | 36,70% | 37,84% |
| ARC-Challenge (test, 1.172) | 25,00% | 25,34% | 25,43% | 27,13% | 30,29% |
| OpenBookQA (test, 500) | 25,00% | 34,20% | 25,60% | 37,20% | 42,00% |
| PIQA (val, 1.838) | 50,00% | 53,97% | 53,37% | 53,97% | 54,62% |
| WinoGrande (val, 1.267) | 50,00% | 51,93% | 52,41% | 52,41% | 52,41% |
| HellaSwag (val, 1.000) | 25,00% | 28,70% | 31,80% | 32,70% | 36,20% |
| QNLI (val, 1.000) | 50,00% | 50,50% | 55,70% | 78,20% | 78,40% |
| CommonsenseQA (val, 1.221) | 20,00% | 19,16% | 23,10% | 24,57% | 28,09% |
| Macro-promedio (9 tareas) | 35,56% | 39,16% | 38,63% | 45,03% | 47,36% |

Razonamiento matemático (GSM8K, test, n = 500):

| Métrica | Zero-shot | PairAdam | Single-pass | Curriculum |
|---|---:|---:|---:|---:|
| Perplejidad (PPL, menor es mejor) | 60,12 | 12,52 | 9,11 | 7,65 |
| Verificación numérica 4 vías (Acc) | 21,00% | 28,80% | 93,20% | 97,60% |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 0,1 GB en float32 (16,7M de parámetros x 4 bytes), con un repo de 0,1 GB.
- GPU recomendadas: cualquier GPU con más de 1 GB de VRAM; cabe en CPU sin dificultad.
- Cabe en cualquier GPU de consumo (GTX 1050, RTX 3060, RTX 4090, etc.) y en hardware integrado.
- Opciones de despliegue: transformers, vLLM y llama.cpp, con paridad de salida documentada por el autor entre las tres rutas.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Macro-promedio SLM-Bench | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MatterWaveAI/grt-20m-curriculum | 16,7M (10,3M sin embeddings) | 1.024 | 47,36% | Apache 2.0 | Hugging Face |
| MatterWaveAI/grt-20m | 16,7M (10,3M sin embeddings) | 1.024 | 38,63% (PairAdam) | Apache 2.0 | Hugging Face |
| Alternativas de tamaño comparable | no disponible | no disponible | no disponible | no disponible | no disponible |

La única comparación directa disponible en la información es con el checkpoint original `grt-20m`, del que esta variante mejora el macro-promedio en 8,73 puntos y reduce la perplejidad en GSM8K un 38,9%. No se proporcionan datos frente a otros SLM de la misma categoría.

## Limitaciones y advertencias

- Es un modelo base, no ajustado por instrucciones: sus salidas greedy son localmente plausibles pero globalmente incorrectas (por ejemplo, repite "the capital of the capital of..." ante "The capital of France is"). El autor lo atribuye a la pérdida de 2,114 de un modelo de 16,7M, no a un fallo de serving.
- Riesgo elevado de alucinación y de incoherencia en generaciones largas por su tamaño reducido.
- Contexto máximo de solo 1.024 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Soporte únicamente de inglés.
- Sesgos conocidos: no documentados en la información proporcionada, aunque los datasets de pretraining (RefinedWeb, FineWeb-Edu, Wikipedia) pueden introducir sesgos de dominio web.
- Licencia Apache 2.0: permite uso comercial, pero el modelo no está diseñado ni validado para aplicaciones en producción de cara al usuario.
- Los benchmarks se limitan a elección múltiple y GSM8K; no hay evaluación de generación abierta, seguridad ni robustez.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MatterWaveAI/grt-20m-curriculum
- Checkpoint base: https://huggingface.co/MatterWaveAI/grt-20m
