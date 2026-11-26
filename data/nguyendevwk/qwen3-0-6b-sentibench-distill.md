# nguyendevwk/qwen3-0.6b-sentibench-distill

## Resumen

`nguyendevwk/qwen3-0.6b-sentibench-distill` es un adaptador LoRA (no un modelo completo) entrenado sobre `Qwen/Qwen3-0.6B` para análisis de sentimiento unificado en las 12 tareas del benchmark SentiBench. Lo desarrolla el usuario de Hugging Face `nguyendevwk` y su objetivo es demostrar que un modelo por debajo de 1.000 millones de parámetros puede acercarse a modelos de 8B en tareas de extracción de sentimiento estructurado mediante destilación de conocimiento por etapas. El repositorio incluye el adaptador, los datos curados y los manifiestos de evaluación.

La contribución técnica principal es un pipeline de destilación en tres etapas (PM-SN-SeqKD, Cascaded-TAKD-FSA y FCB-Replay) más una rama independiente de fusión post-hoc de adaptadores (WiSE-FT y DARE-TIES). El modelo reporta un F1 medio de 65,76% en las 12 tareas de SentiBench (N = 11.974 muestras de test), frente al 52,36% del modelo base sin ajuste, acercándose al 67,22% de Llama-3-8B.

Es relevante por su enfoque de eficiencia: entrena con logits en rodajas (C = 128) para reducir el pico de memoria un 94% y permitir destilación a 2.048 tokens en una única GPU de 15 GB. La licencia es MIT y el tamaño del repo es de 0,8 GB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) con adaptador LoRA |
| Parámetros totales | 0,6B (modelo base Qwen3-0.6B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens (longitud de destilación reportada) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptadores LoRA) |

## Arquitectura y entrenamiento

El modelo base es `Qwen/Qwen3-0.6B`, un transformer decoder-only con vocabulario de 151.936 tokens. Sobre él se aplica un adaptador LoRA entrenado mediante un pipeline de destilación en tres etapas. La etapa 1 usa Sliced Target Logits (C = 128) con PM-SN-SeqKD (Prompt-Masked Sample-Normalized Sequence KD, `replay_ratio = 0.10`) para calcular entropía cruzada en fp32 solo sobre tokens de respuesta válidos, reduciendo el pico de memoria de logits un 94%. La etapa 2 introduce un profesor asistente de 3B con filtrado IFD de 5 puertas y Cascaded-TAKD-FSA para cubrir la brecha de capacidad en extracción estructurada (ATSA, ACSA, ASQP, Opener SSA), con verificación SHA-256 de cero fugas. La etapa 3 aplica FCB-Replay, combinando alineación de formato de 4 ejemplos (4-Shot) con sobremuestreo balanceado por clase (11.095 muestras totales).

Como rama independiente se exploran fusiones post-hoc de adaptadores sin reentrenamiento: Block-Concat WiSE-FT (α = 0,50) y SVD-Aligned DARE-TIES (p = 0,65), que combinan adaptadores de rango 16 y 64. El entrenamiento se realizó sobre las 12 tareas de SentiBench con N = 11.974 muestras de test, sin submuestreo ni enrutamiento específico por tarea.

## Capacidades

- Análisis de sentimiento a nivel de documento: clasificación binaria y multiclase (IMDb, Yelp2, SST2, Twitter).
- Detección de ironía y emoción.
- Análisis de postura (stance) e intimidad.
- Extracción de sentimiento con objetivos (ATSA, ACSA, ASQP) y extracción de opiniones (Opener SSA).
- Formato unificado de salida para las 12 tareas sin enrutamiento específico por tarea.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (idiomas no declarados).
- Capacidades especiales: adaptador LoRA fusionable, evaluación con calibración contextual.

## Casos de uso

- Moderación de comentarios en redes sociales: clasificación de sentimiento y detección de ironía en textos cortos (Twitter, SST2) con un modelo de 0,6B desplegable en hardware modesto.
- Análisis de reseñas de producto: clasificación binaria de polaridad en IMDb y Yelp2 con F1 reportado de 90,10% y 95,80% respectivamente en la configuración FCB-Replay.
- Extracción de aspectos y opiniones en reseñas: las tareas ATSA y ACSA permiten identificar términos objetivo y sus polaridades, útil para cuadros de mando de reputación de marca.
- Análisis de emoción en atención al cliente: clasificación de emociones (F1 69,10%) para enrutar tickets hacia equipos especializados.
- Investigación académica en destilación: el repositorio incluye pipeline reproducible, manifiestos SHA-256 y notebook de Colab/Kaggle para replicar los resultados.
- Despliegue en dispositivos con recursos limitados: al ser un adaptador sobre un modelo de 0,6B, puede ejecutarse en GPUs consumer de gama media para inferencia por lotes de análisis de sentimiento.
- Detección de postura en foros y debates: la tarea Stance (F1 72,18%) permite clasificar la posición de un texto respecto a un tema.

## Benchmarks y rendimiento

Resultados sobre las 12 tareas de SentiBench (N = 11.974), F1 por tarea:

| Configuración (Qwen3-0.6B) | IMDb | Yelp2 | SST2 | Twitter | Irony | Emoti. | Stance | Intim. | ATSA | ACSA | ASQP | SSA | Avg-12 F1 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Base Raw | 82,75 | 90,20 | 87,37 | 48,73 | 62,54 | 59,75 | 61,55 | 34,01 | 36,57 | 36,73 | 9,59 | 18,47 | 52,36 |
| Stage 1: PM-SN-SeqKD | 89,20 | 95,30 | 87,81 | 62,89 | 63,70 | 64,93 | 61,18 | 41,00 | 45,69 | 49,07 | 21,86 | 24,47 | 58,92 |
| Stage 2: Cascaded-TAKD-FSA | 86,26 | 93,19 | 89,07 | 50,67 | 65,58 | 66,52 | 64,26 | 38,07 | 57,64 | 70,64 | 42,19 | 41,78 | 63,82 |
| Stage 3: FCB-Replay (seed 42) | 90,10 | 95,80 | 90,61 | 63,16 | 64,45 | 69,10 | 72,18 | 46,63 | 57,54 | 64,49 | 33,17 | 41,89 | 65,76 |
| FCB-Replay (media ± desv. 3 semillas) | — | — | — | — | — | — | — | — | — | — | — | — | 65,42 ± 0,85 |
| Branch B: SVD-DARE-TIES (p=0,65) | 90,20 | 95,80 | 88,80 | 57,52 | 65,09 | 65,53 | 63,22 | 36,60 | 55,23 | 62,13 | 33,24 | 36,57 | 62,33 |
| Branch B: Block-Concat WiSE-FT (α=0,5) | 90,10 | 95,70 | 89,30 | 59,32 | 66,08 | 64,17 | 62,73 | 36,22 | 52,87 | 61,61 | 32,16 | 34,62 | 62,07 |

El modelo reporta superar a OPT-1.3B, TinyLlama-1.1B, Phi-2-2.7B y Gemma-2-2.6B, y acercarse a Llama-3-8B (67,22%). Los resultados completos por tarea, incluyendo "Only 4-Shot" (67,28%), "Only Upsample" (63,45%), r=16 (62,40%) y r=32 (64,45%), están en `results/benchmark_summary.json`.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el modelo base de 0,6B en fp16 requiere aproximadamente 1,2 GB de pesos, más overhead de activaciones.
- GPU recomendadas: el entrenamiento de destilación se realizó en una única GPU de 15 GB; para inferencia basta una GPU consumer de gama media.
- Cabe en GPU consumer: sí, al tratarse de un adaptador sobre un modelo de 0,6B.
- Opciones de despliegue: no se documentan explícitamente; el repositorio incluye `src/evaluation/run_sentibench` y un notebook de Colab/Kaggle. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Avg-12 F1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-0.6B + SentiBench distill (este) | 0,6B | 2.048 | 65,76 | MIT | Hugging Face |
| Llama-3-8B | 8B | no disponible | 67,22 | no disponible | no disponible |
| Phi-2 | 2,7B | no disponible | inferior a 65,76 según la model card | no disponible | no disponible |
| Gemma-2 | 2,6B | no disponible | inferior a 65,76 según la model card | no disponible | no disponible |
| TinyLlama | 1,1B | no disponible | inferior a 65,76 según la model card | no disponible | no disponible |
| OPT | 1,3B | no disponible | inferior a 65,76 según la model card | no disponible | no disponible |

## Limitaciones y advertencias

- Es un adaptador LoRA, no un modelo autónomo: requiere cargar `Qwen/Qwen3-0.6B` como base.
- El alcance se limita a las 12 tareas de SentiBench; no se documentan capacidades generales de generación, razonamiento o código.
- Idiomas soportados no declarados; el benchmark SentiBench es predominantemente en inglés, por lo que el rendimiento en castellano no está verificado.
- Riesgo de alucinación en tareas de extracción estructurada (ASQP reporta F1 de 33,17%, el más bajo del conjunto).
- La tarea Intimacy (Intim.) muestra F1 de 46,63%, notablemente inferior al resto.
- No se documentan sesgos conocidos ni evaluaciones de seguridad.
- La varianza entre semillas es de ±0,85 puntos de F1; los resultados deben interpretarse con ese margen.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay validación comunitaria independiente.
- Licencia MIT permite uso comercial, pero debe verificarse la licencia del modelo base Qwen3-0.6B por separado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nguyendevwk/qwen3-0.6b-sentibench-distill
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Paper SentiBench (arXiv:2503.03225): https://arxiv.org/abs/2503.03225
- Repositorio SentiBench: https://github.com/HITSZ-HLT/Sentiment-Distillation
- Dataset SentiBench: https://huggingface.co/datasets/zhang-yice/sentiment-distillation-v1
