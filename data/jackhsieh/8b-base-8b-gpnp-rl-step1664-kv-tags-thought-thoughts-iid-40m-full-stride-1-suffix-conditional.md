# JackHsieh/8B-base.8B-gpnp-rl-step1664-kv-tags-thought-thoughts.iid-40M-full.stride-1.suffix-conditional

## Resumen

Este modelo es un ajuste por preentrenamiento continuado (continued pretraining, CPT) de Qwen3-8B-Base, desarrollado por el usuario JackHsieh en el contexto del proyecto "prestar". El objetivo no es tanto ofrecer un asistente generalista como estudiar si la inserción de "pensamientos" (notas generadas sobre los siguientes 8 tokens de un documento) delante de cada fragmento de texto mejora la modelización del lenguaje. El modelo se entrena sobre LaTeX de arXiv del subdominio stat.ML y es la segunda ronda CPT de la cadena de 8B, usando pensamientos generados por un modelo RL cuyo recompensador fue el modelo de la primera ronda.

Arquitecturalmente es un transformer denso de Qwen3 con 8.190.735.360 parámetros totales, licencia Apache 2.0 y pesos en fp32 (copia maestra exportada sin casting). El repositorio ocupa 32,8 GB en safetensors. El modelo añade dos tokens especiales, `<|note|>` (151669) y `<|/note|>` (151670), que delimitan las notas prepuestas. No se publican datos sobre longitud de contexto nativa, idiomas soportados ni cuantizaciones.

Es relevante ahora porque documenta una línea de investigación poco habitual: condicionar el preentrenamiento con anotaciones auxiliares generadas por un modelo RL, con evaluación explícita de la ganancia (win rate del 53,7 % frente a la pasada sin pensamiento). Es un artefacto de investigación, no un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3), fine-tuning de Qwen3-8B-Base |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (el entrenamiento usa secuencias de 4096 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en fp32) |
| Idiomas soportados | no disponible (entrenado sobre LaTeX cientifico en ingles de arXiv stat.ML) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (fp32, sin casting) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-8B-Base, un transformer denso de 8B parámetros, y aplica una ronda de continued pretraining sobre el dataset `JackHsieh/statML-arxiv-iid-160M-20M`, usando `train[:9728]` (9.728 documentos de 4.096 tokens, es decir, el conjunto completo sin retención). Se añade un 25 % de replay desde `JackHsieh/dclm-replay.seq-4096.tokens-32B` y se reordena el conjunto principal en cada época. La innovación central es la condición de sufijo: cada fragmento de 8 tokens no inicial de cada documento va precedido de una nota con formato `<|note|>\nKEY:{8 tokens previos}\nTHOUGHT:{nota}\n<|/note|>`, con `stride=1` y `k=8`. Las notas proceden de un generador entrenado con RL (1.664 pasos, prompt `general-paragraph-nothink-prefill` con la respuesta prefijada por "The text"), con un máximo de 2.048 tokens por nota (2112 de longitud máxima incluyendo el envoltorio).

La optimización usa AdamW con lr 3e-6, β 0.9/0.95, ε 1e-8, weight decay 0.01, schedule coseno con 5 % de warmup hasta 0, grad clip 1.0, batch de 32 documentos, 2 épocas (812 pasos) y semilla 0. El entrenamiento se hizo con FSDP2 full-shard con pesos maestros en fp32 y cómputo en bf16, flash-attention-2 y 8×H200, repartido en asignaciones Slurm interrumpidas y reanudadas desde el último checkpoint. La evaluación se hace sobre la rejilla de test iid con stride 32 (r_val = 15/512).

## Capacidades

- Modelización de lenguaje sobre texto científico en LaTeX (subdominio stat.ML de arXiv).
- Condicionamiento por notas: el modelo aprende a consumir bloques `<|note|>...<|/note|>` con la clave de los 8 tokens previos y una nota descriptiva de los siguientes 8 tokens.
- Generación de texto autoregresiva estándar, heredada de Qwen3-8B-Base.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento explícito.
- Capacidades multilingües: no disponibles; el entrenamiento es monolingüe en inglés científico.
- No se documenta soporte de function calling ni de razonamiento multi-paso.

## Casos de uso

- Investigación sobre condicionamiento en preentrenamiento: permite reproducir y analizar la receta de notas prepuestas comparando la NLL con y sin pensamiento en la rejilla de test iid.
- Estudio de decodificación condicionada por sufijo: sirve para experimentar con la inserción de anotaciones `<|note|>` en la entrada y medir su efecto en la perplejidad de los siguientes tokens.
- Base para ablaciones de CPT: al compartir receta con el modelo de 4B y con la primera ronda de 8B, permite comparar escalado y rondas de entrenamiento bajo condiciones controladas.
- Generación de texto científico asistida: puede emplearse para completar fragmentos de LaTeX de estadística y aprendizaje automático, aunque sin garantías de calidad fuera del dominio de entrenamiento.
- Análisis de la influencia del replay de DCLM: el 25 % de replay está documentado y permite estudiar su efecto en la retención de capacidades generales.
- Punto de partida para RL posterior: el autor lo usa como recompensador de una cadena de generadores de notas, por lo que puede servir como componente en pipelines de RL con recompensa basada en modelo.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| NLL/token con pensamiento (step 812, test iid stride 32) | 1,1743 |
| NLL/token sin pensamiento sobre los mismos fragmentos | 1,1786 |
| Win rate del pensamiento | 53,7 % |
| NLL híbrida sobre todos los fragmentos | 1,1998 |
| Referencia primera ronda (step 790) | 1,1777 vs 1,1781; win rate 50,9 %; híbrida 1,1994 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM para inferencia en fp32: aproximadamente 32,8 GB solo de pesos, más activaciones y caché KV; en la práctica requiere GPUs de 40 GB o más (A100 40/80 GB, H100, H200).
- En bf16 (si se convierte): unos 16,4 GB de pesos, lo que permite caber en una RTX 4090 de 24 GB con margen limitado para contexto corto.
- Cuantización a 8 bits o 4 bits: no se publican ficheros GGUF ni cuantizaciones oficiales; habría que generarlas a partir de los safetensors fp32.
- Despliegue: compatible con `transformers` (el autor exporta desde DCP cargando los shards en el modelo de `transformers`); para serving de alto rendimiento sería necesario convertir a formatos soportados por vLLM o TGI, no documentado.
- Latencia y throughput: no disponibles.
- Entrenamiento original: 8×H200 con FSDP2, bf16 y flash-attention-2.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (8B CPT con notas) | 8,19B | no disponible | CPT sobre stat.ML con notas prepuestas | Apache 2.0 | Hugging Face, 0 descargas |
| JackHsieh/8B-base.8B-gpnp-kv-tags-thought-thoughts.iid-40M-sans-256.stride-1.suffix-conditional | 8B (no verificado) | no disponible | Primera ronda CPT, pensamientos de Qwen3-8B stock | Apache 2.0 | Hugging Face |
| JackHsieh/4B-base.4B-gpnp-rl-step960-... | 4B (no verificado) | no disponible | Hermano de 4B de la misma receta | Apache 2.0 | Hugging Face |
| Qwen/Qwen3-8B-Base | 8B | no disponible en esta ficha | Modelo base generalista | Apache 2.0 | Hugging Face |

## Limitaciones y advertencias

- Modelo de investigación con 0 descargas y 0 likes: no hay validación externa ni uso en producción documentado.
- Entrenado exclusivamente sobre LaTeX de arXiv stat.ML: el dominio y el idioma están muy acotados; el rendimiento fuera de ahí es incierto.
- Riesgo de alucinación no evaluado; no se publican métricas de fidelidad ni de seguridad.
- Sesgos no documentados; el corpus de arXiv tiene sesgos propios de la literatura académica en estadística y ML.
- El uso de los tokens `<|note|>` y `<|/note|>` es específico de esta receta; un uso incorrecto del formato puede degradar la generación.
- Pesos en fp32 (32,8 GB): el despliegue en hardware de consumo exige conversión y cuantización no oficiales.
- Sin datos de benchmarks estándar, por lo que no es posible comparar su calidad generalista con Qwen3-8B-Base.
- La licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluaciones de seguridad desaconseja su uso directo en aplicaciones de cara al usuario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JackHsieh/8B-base.8B-gpnp-rl-step1664-kv-tags-thought-thoughts.iid-40M-full.stride-1.suffix-conditional
- Run de wandb: https://wandb.ai/latent-thoughts/prestar/runs/ccni1oz6
- Modelo de primera ronda (recompensador): https://huggingface.co/JackHsieh/8B-base.8B-gpnp-kv-tags-thought-thoughts.iid-40M-sans-256.stride-1.suffix-conditional
- Generador de pensamientos (RL step 1664): https://huggingface.co/JackHsieh/Qwen3-8B.gpnp-rl.consumer-8B-base-gpnp-kvtt-iid40M-sans256.lr7e-7-kl0.step-1664
- Dataset de entrenamiento: https://huggingface.co/datasets/JackHsieh/statML-arxiv-iid-160M-20M
- Dataset de pensamientos: https://huggingface.co/datasets/JackHsieh/8B-gpnp-rl-step1664.k-8.statml-arxiv-iid.qwen3-ids.kv-tags-thought
- Dataset de replay: https://huggingface.co/datasets/JackHsieh/dclm-replay.seq-4096.tokens-32B
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B-Base
