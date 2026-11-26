# jjalora/diet-traj-pythia-410m-pythia-seed11

## Resumen

`jjalora/diet-traj-pythia-410m-pythia-seed11` es un checkpoint de investigación publicado por el usuario jjalora dentro de la campaña DIET ("weight-space campaign"), cuyo objetivo es estudiar trayectorias de entrenamiento en el espacio de pesos. No es un modelo nuevo ni un fine-tuning: es una reproducción desde cero de Pythia-410M de EleutherAI, ejecutada con la receta oficial de Pythia (misma arquitectura, mismo flujo de tokens y mismo orden de batches) y diferenciándose únicamente en la semilla aleatoria y el esquema de inicialización de pesos.

El modelo emplea la arquitectura GPT-NeoX (clasificada como `gpt_neox` en Transformers) con 405.334.016 parámetros reales según los pesos en safetensors, entrenada sobre `EleutherAI/pile-standard-pythia-preshuffled` con AdamW (lr 3e-4, betas 0.9/0.95, weight decay 0.1), cosine decay hasta 3e-5 durante 143.000 pasos, 1.430 pasos de warmup y precisión mixta fp16 con pesos maestros fp32.

Su relevancia es metodológica más que de producto: al fijar token stream, orden de batches e hiperparámetros, y variar solo semilla e inicialización, permite comparar trayectorias de pérdida entre ejecuciones y analizar cómo la inicialización afecta la dinámica de entrenamiento. El repositorio es inusualmente grande (1.167,4 GB) porque incluye ramas `stepN` con checkpoints intermedios (pasos 0, 1, 2, 4, …, 512 y cada 100 pasos) en safetensors float16, además de los pesos finales en `main`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-NeoX (transformer decoder-only, `gpt_neox` en Transformers) |
| Parametros totales | 405.334.016 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (la model card no lo declara; la receta Pythia-410M usa 2048 tokens por secuencia) |
| Tipos de cuantizacion | no disponible (los pesos publicados son float16 safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (float16), pesos únicamente, en ramas `stepN` y en `main` |
| Dataset de entrenamiento | EleutherAI/pile-standard-pythia-preshuffled |
| Pasos de entrenamiento | 143.000 (cosine a 3e-5, 1.430 de warmup) |
| Batch global | 1024 × 2048 tokens |
| Optimizador | AdamW, lr 3e-4, betas (0.9, 0.95), weight decay 0.1 (sin decay en LayerNorm/bias), grad clip 1.0 |
| Precisión de entrenamiento | fp16 autocast con pesos maestros fp32 |

## Arquitectura y entrenamiento

La arquitectura es la de Pythia-410M: un transformer decoder-only estilo GPT-NeoX con atención causal estándar, sin innovaciones de atención lineal ni componentes SSM. La receta replica `models/410M/pythia-410m.yml` de EleutherAI: mismo flujo de tokens y mismo orden (`EleutherAI/pile-standard-pythia-preshuffled`, donde el batch *i* corresponde a las filas [i·1024, (i+1)·1024)), AdamW con lr 3e-4, betas (0.9, 0.95), weight decay 0.1 sin decay en LayerNorm ni bias, grad clip 1.0, cosine decay hasta 3e-5 durante 143.000 pasos con 1.430 pasos de warmup, fp16 autocast con pesos maestros fp32 y batch global de 1024 × 2048 tokens independientemente del número de GPUs.

La única variación respecto a Pythia es la semilla y el esquema de inicialización: `init_scheme = None` significa que se usa el esquema `pythia` (small_init + wang_init de GPT-NeoX); otros esquemas están documentados en `src/init_schemes.py` del código de entrenamiento. El autor advierte que la reproducción bit a bit del RNG de inicialización de EleutherAI no es posible entre frameworks, pero el esquema `pythia` coincide con la *distribución* por tensor de `EleutherAI/pythia-410m` revisión `step0`, verificado en `tests/test_pythia_step0_init_match.py`. No se documenta RLHF, DPO ni ningún ajuste posterior al preentrenamiento.

## Capacidades

- Generación de texto autoregresiva en inglés, heredada del preentrenamiento sobre The Pile.
- Modelo base sin ajuste de instrucciones: no está diseñado para seguir instrucciones ni para diálogo.
- Sin soporte documentado de tool calling ni function calling.
- Sin soporte documentado de agentes ni razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés (tag `en`).
- No dispone de modo thinking, visión ni audio.
- Valor añadido para investigación: checkpoints intermedios en ramas `stepN` (pasos 0, 1, 2, 4, …, 512 y cada 100 pasos) que permiten estudiar la evolución de los pesos y de la pérdida a lo largo del entrenamiento.
- `losses.csv` en `main` con `train_loss`, `eval_loss`, `eval_perplexity`, `eval_accuracy`, `tokens_seen` y `lr` por checkpoint, recalculados contra un conjunto de evaluación fijo para permitir comparaciones directas entre trayectorias.

## Casos de uso

- Investigación sobre trayectorias de entrenamiento: comparar `losses.csv` de esta ejecución (semilla 11, init `None`) con otras ejecuciones de la campaña DIET para aislar el efecto de la semilla y de la inicialización en la curva de pérdida.
- Análisis del espacio de pesos: usar las ramas `stepN` para estudiar la evolución de los pesos entre pasos tempranos (0, 1, 2, 4, …, 512) y detectar regímenes de entrenamiento.
- Reproducibilidad de Pythia: servir como réplica controlada de Pythia-410M para verificar que la receta y el flujo de tokens producen resultados equivalentes bajo otra semilla.
- Estudio de sensibilidad a la inicialización: al existir esquemas alternativos en `src/init_schemes.py`, sirve de referencia para medir cómo cambia la pérdida final según el esquema de init.
- Generación de texto en inglés como modelo base: utilizable en pipelines de `text-generation` con Transformers o text-generation-inference (el repo está marcado como `endpoints_compatible` y `text-generation-inference`), siempre asumiendo que no sigue instrucciones.
- Docencia y experimentación con GPT-NeoX: 405M parámetros permiten ejecutar experimentos de investigación en hardware modesto sin renunciar a una arquitectura y un dataset de referencia publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card solo reporta métricas de entrenamiento y evaluación de lenguaje (`train_loss`, `eval_loss`, `eval_perplexity`, `eval_accuracy`) en `losses.csv`, sin valores numéricos concretos en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia en float16: aproximadamente 0,81 GB solo para pesos (405,3 M parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica, del orden de 2-4 GB según longitud de contexto y batch.
- En cuantización de 8 bits, los pesos ocuparían unos 0,41 GB; en 4 bits, unos 0,20 GB (estimaciones teóricas, no se publican variantes cuantizadas).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM es suficiente; cabe holgadamente en RTX 3060, RTX 4060, RTX 4090, A100 y H100.
- Cabe en GPU de consumo: sí, en todas las GPU consumer modernas con 8 GB o más.
- Opciones de despliegue: Transformers (librería declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`); llama.cpp/Ollama no están documentados para este repo, ya que solo se publican safetensors float16.
- Latencia y throughput: no disponibles en la información proporcionada.
- Almacenamiento: el repo completo ocupa 1.167,4 GB por la acumulación de checkpoints intermedios; para inferencia basta con descargar `main` o una rama `stepN` concreta.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| jjalora/diet-traj-pythia-410m-pythia-seed11 | 405,3 M | no disponible | apache-2.0 | Hugging Face (repo de 1.167,4 GB con checkpoints) | Réplica de Pythia-410M con semilla 11 e init `None`; foco en trayectorias |
| EleutherAI/pythia-410m | 405,3 M (aprox.) | 2048 tokens (receta Pythia) | apache-2.0 | Hugging Face | Modelo original de referencia; checkpoints oficiales de EleutherAI |
| Otros runs de la campaña DIET | 405,3 M | no disponible | apache-2.0 | Hugging Face (colección del autor) | Misma receta con otras semillas/esquemas de init; comparables vía `losses.csv` |

No se dispone de datos de rendimiento (benchmarks) para establecer comparaciones cuantitativas con alternativas de la misma categoría.

## Limitaciones y advertencias

- Modelo base sin ajuste de instrucciones: no debe usarse como asistente conversacional ni esperar que siga instrucciones.
- Entrenado únicamente en inglés; el rendimiento en otros idiomas no está garantizado.
- Riesgo de alucinación y de generar contenido sesgado o tóxico, inherente a un modelo preentrenado sobre The Pile sin filtrado posterior documentado.
- No se documentan evaluaciones de seguridad, sesgos ni alineación.
- La model card advierte de una salvedad sobre las filas de evaluación del checkpoint final (detallada en `LOSSES.md`); `losses.csv` es la fuente autoritativa de pérdida, no los `snapshot.json` de revisiones anteriores al 2026-11-18.
- La reproducción bit a bit de la inicialización de EleutherAI no es posible entre frameworks; solo se garantiza la coincidencia de distribución por tensor con `step0`.
- El tamaño del repo (1.167,4 GB) puede encarecer y ralentizar la descarga si se clona completo; conviene descargar solo la revisión necesaria.
- Licencia apache-2.0: permite uso comercial, pero al ser un artefacto de investigación sin evaluación de producción, su uso comercial no está respaldado por benchmarks.

## Enlaces

- Hugging Face: https://huggingface.co/jjalora/diet-traj-pythia-410m-pythia-seed11
- Dataset de entrenamiento: https://huggingface.co/datasets/EleutherAI/pile-standard-pythia-preshuffled
- Receta original de Pythia: https://github.com/EleutherAI/pythia (archivo `models/410M/pythia-410m.yml`)
- Modelo de referencia: https://huggingface.co/EleutherAI/pythia-410m
- Código de entrenamiento con `src/init_schemes.py`: no disponible en la información proporcionada
- Paper de Pythia: no disponible en la información proporcionada
