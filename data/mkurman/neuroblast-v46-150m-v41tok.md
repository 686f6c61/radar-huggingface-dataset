# mkurman/neuroblast-v46-150m-v41tok

## Resumen

NeuroBLAST v46-150M es un modelo de lenguaje de 151,8 millones de parámetros desarrollado por el usuario mkurman bajo el marco de "pretraining in public": el autor entrena el modelo desde cero en una única GPU A100 de 80 GB en Colab y publica checkpoints intermedios junto con curvas de entrenamiento que se actualizan automáticamente. No es un modelo terminado, sino un estado intermedio de entrenamiento (25,4% del plan previsto en el momento de la última actualización), pensado como experimento abierto para observar cómo aprende un modelo pequeño paso a paso.

La arquitectura es un decodificador híbrido experimental de 16 capas organizado en tres etapas (sensorial, asociativa y motora) conectadas por compuertas de cuello de botella. Combina convoluciones causales cortas, atención lineal con compuerta (GLA) y atención latente estilo MLA, con dos atajos entre capas (MGVR y GCLA). El vocabulario es de 65.538 tokens con un tokenizador BPE propio (`neuroblast-v4.1`).

Su relevancia es fundamentalmente metodológica y educativa: documenta con transparencia total el presupuesto de cómputo, la composición del dataset (FineWeb-Edu filtrado por `language_score > 0.8`), el esquema de learning rate y la progresión de la pérdida. No está pensado para producción ni como asistente conversacional, sino como modelo base que continúa texto en inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Decodificador híbrido experimental (convoluciones causales + GLA + atención MLA) |
| Parámetros totales | 151,8M (50,3M en el embedding de entrada/salida atado) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 en etapa 1; 2.048 en etapa 2; config permite hasta 262.144 posiciones |
| Tipos de cuantización | no disponible (repo en safetensors fp32/bf16) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo tiene 16 capas organizadas en tres etapas. La etapa **sensorial** alterna convoluciones causales cortas (kernel 7) con atención. La etapa **asociativa** combina bloques de gated linear attention (GLA) con atención latente estilo MLA cada tercera capa. La etapa **motora** usa atención estándar. Entre etapas hay compuertas de cuello de botella, y dos atajos entre capas (MGVR y GCLA) permiten que las capas de atención posteriores reutilicen cálculos de capas anteriores. El tamaño oculto es 768, el FFN 1.536, con 12 cabezas de atención, 6 cabezas KV y dimensión de cabeza 64. Usa RoPE (θ = 10k, y 1M en capas profundas), RMSNorm, QK-norm, LayerScale, soft-capping de logits a 30 y embeddings atados.

El entrenamiento se realiza desde cero sobre FineWeb-Edu (`sample-100BT`), filtrando filas en inglés con `language_score > 0.8`, en una sola pasada sin repeticiones. El presupuesto es de ~7,6B tokens (50 tokens por parámetro, ~2,5× la ratio Chinchilla). Se usa Muon en matrices de peso 2-D y AdamW en el resto, con LR pico de 2e-3, sin weight decay, pesos maestros en fp32 y autocast bf16. El plan tiene dos etapas de contexto: 512 tokens (192 secuencias por paso, pasos 0–70.424, ~75% de los tokens) y 2.048 tokens (48 secuencias por paso, pasos 70.424–114.791, ~25%). Cada paso procesa 98.304 posiciones de token en ambas etapas, lo que mantiene el schedule de LR. La pérdida se calcula con un kernel fusionado y troceado de LM-head + cross-entropy para ahorrar memoria. Hardware: 1× A100 80 GB, ~1,05 s por paso, ~34 h en total.

## Capacidades

- Generación de texto en inglés como modelo base (continuación de texto, no instrucciones).
- Razonamiento y conocimiento factual limitados por su tamaño (151,8M) y por estar a un 25,4% del entrenamiento.
- Capacidad de modelar contexto largo una vez completada la etapa 2 (2.048 tokens); el config permite extender hasta 262.144 posiciones.
- No dispone de tool calling ni function calling.
- No dispone de capacidades de agente ni multi-step reasoning.
- No dispone de visión, audio ni modo de pensamiento (thinking).
- Multilingüe: no, únicamente inglés.
- No es un modelo de chat: no hay post-entrenamiento (RLHF/DPO) indicado.

## Casos de uso

- Investigación sobre arquitecturas híbridas: sirve para estudiar el comportamiento de la combinación de convoluciones cortas, GLA y MLA en un modelo pequeño y con curvas de entrenamiento públicas, comparando la evolución de la pérdida en cada etapa.
- Reproducción de experimentos de pretraining: el plan documentado (presupuesto de tokens, schedule de LR, dos etapas de contexto) permite replicar el pipeline en hardware modesto y validar las decisiones de diseño.
- Educación y divulgación: las curvas de pérdida y perplejidad actualizadas en vivo son material didáctico para explicar qué es la perplejidad, el sobreajuste y el warmup-stable-decay.
- Generación de texto base para fine-tuning: al ser un modelo base con licencia Apache 2.0, puede servir como punto de partida para tareas de clasificación o generación específicas tras un ajuste supervisado.
- Pruebas de infraestructura de inferencia: su tamaño reducido permite validar pipelines con transformers, vLLM o llama.cpp en entornos con recursos limitados antes de escalar a modelos mayores.
- Análisis de tokenización: el tokenizador BPE propio (`neuroblast-v4.1`, 65.538 tokens) puede estudiarse para comparar eficiencia de compresión (~4,5 bytes por token en FineWeb-Edu) frente a otros tokenizadores.
- Benchmarking de decodificación especulativa o técnicas de aceleración: un modelo de 151,8M es un banco de pruebas barato para medir latencia y throughput de distintas estrategias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card únicamente reporta la evolución de la pérdida de evaluación durante el entrenamiento:

| Paso | Tokens vistos | Pérdida eval | Perplejidad eval |
|---:|---:|---:|---:|
| 2.500 | 202M | 3,807 | 45,0 |
| 5.000 | 403M | 3,574 | 35,7 |
| 7.500 | 605M | 3,484 | 32,6 |
| 10.000 | 806M | 3,425 | 30,7 |
| 12.500 | 1,01B | 3,379 | 29,3 |
| 15.000 | 1,21B | 3,362 | 28,8 |
| 17.500 | 1,41B | 3,336 | 28,1 |
| 20.000 | 1,62B | 3,312 | 27,4 |
| 22.500 | 1,82B | 3,278 | 26,5 |
| 25.000 | 2,02B | 3,259 | 26,0 |
| 27.500 | 2,22B | 3,245 | 25,7 |

Estado en la última actualización: paso 29.151 de 114.791 (25,4%), ~2,36B tokens vistos, pérdida de entrenamiento 3,223.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 151,8M de parámetros; en fp32 ocupa ~0,6 GB, en bf16 ~0,3 GB y en cuantización de 8 bits ~0,15 GB. El repo pesa 15,6 GB porque incluye checkpoints intermedios con estados de optimizador y scheduler.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente para inferencia en bf16; una A100 80 GB es lo que se usa para entrenamiento.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) e incluso en CPU para inferencia en cuantización.
- Opciones de despliegue: transformers (librería indicada), y previsiblemente llama.cpp/Ollama tras conversión a GGUF (no confirmado en la información disponible). vLLM y TGI no están confirmados para esta arquitectura híbrida.
- Latencia y throughput: no disponible. Durante el entrenamiento se reportan ~1,05 s por paso con 98.304 posiciones de token en una A100, pero no hay datos de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| NeuroBLAST v46-150M | 151,8M | 512 / 2.048 (hasta 262.144 en config) | Apache 2.0 | En entrenamiento (25,4%) |
| GPT-2 small | 124M | 1.024 | MIT | Completado |
| Pythia-160M | 160M | 2.048 | Apache 2.0 | Completado |
| SmolLM-135M | 135M | 2.048 | Apache 2.0 | Completado |

La comparación de rendimiento con estas alternativas no está disponible, ya que NeuroBLAST no publica resultados de benchmarks estándar y se encuentra en un estado intermedio de entrenamiento. Su interés diferencial reside en la arquitectura híbrida experimental y en la transparencia del proceso, no en el rendimiento absoluto.

## Limitaciones y advertencias

- Modelo en entrenamiento: los archivos `checkpoint-*` son estados intermedios (modelo, optimizador, scheduler), no un modelo terminado. Solo ha completado el 25,4% del plan.
- No es un asistente conversacional: no ha recibido post-entrenamiento (RLHF/DPO) y solo continúa texto.
- Riesgo elevado de alucinación y de texto incoherente por su tamaño reducido y su estado de entrenamiento parcial.
- Solo soporta inglés; no hay capacidades multilingües.
- El contexto efectivo actual es de 512 tokens (etapa 1); la etapa de 2.048 tokens aún no ha comenzado.
- La licencia Apache 2.0 permite uso comercial, pero el estado del modelo lo hace inadecuado para producción.
- El repo de 15,6 GB incluye checkpoints con estados de optimizador, lo que complica su descarga y despliegue; conviene extraer únicamente los pesos del modelo.
- Arquitectura híbrida no estándar: puede no ser compatible con todos los motores de inferencia optimizados (vLLM, TGI) sin adaptaciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mkurman/neuroblast-v46-150m-v41tok
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
