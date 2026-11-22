# jjalora/diet-traj-pythia-410m-pythia-seed14

## Resumen

`diet-traj-pythia-410m-pythia-seed14` es un checkpoint de investigación publicado por el usuario `jjalora` en Hugging Face dentro de la campaña denominada DIET, orientada al estudio de trayectorias de entrenamiento en el espacio de pesos. No se trata de un modelo nuevo ni de un ajuste fino: es una reproducción desde cero de Pythia-410M de EleutherAI, ejecutada con la receta oficial de Pythia pero con una semilla distinta (seed 14) y un esquema de inicialización concreto (`pythia`, basado en `small_init` + `wang_init` de GPT-NeoX).

El interés del artefacto es metodológico. Al mantener fija la arquitectura, el flujo de tokens y el orden de las secuencias (`EleutherAI/pile-standard-pythia-preshuffled`, batch *i* = filas [i·1024, (i+1)·1024)), y variar únicamente la semilla y el esquema de inicialización, el autor genera una trayectoria de pesos comparable punto a punto con otras del mismo corpus. Esto permite estudiar cómo influye la inicialización en la evolución de la pérdida y en la geometría de los pesos a lo largo de 143.000 pasos.

La relevancia práctica es limitada para uso en producción: es un modelo de 410M parámetros entrenado sobre The Pile, en inglés, con licencia Apache 2.0, pensado para investigación en dinámica de entrenamiento y reproducibilidad, no como asistente generalista. El repositorio ocupa 1.013,4 GB por acumular múltiples ramas de checkpoint (`stepN`), aunque los pesos individuales son float16 safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only GPT-NeoX |
| Parametros totales | 410M (aproximado, segun nomenclatura Pythia-410M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (Pythia-410M usa 2.048 tokens en la receta original) |
| Tipos de cuantizacion | no disponible (pesos publicados en float16 safetensors) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (float16), ramas `stepN` y `main` |

## Arquitectura y entrenamiento

La arquitectura es la de Pythia-410M: un transformer decoder-only estilo GPT-NeoX con atención causal estándar, sin mezcla de expertos ni mecanismos híbridos. El entrenamiento sigue la receta oficial `models/410M/pythia-410m.yml` de EleutherAI: AdamW con lr 3e-4, betas (0.9, 0.95), weight decay 0.1 (sin decay en LayerNorm ni bias), grad clipping 1.0, scheduler coseno hasta 3e-5 a lo largo de 143.000 pasos, 1.430 pasos de warmup, autocast fp16 con pesos maestros en fp32 y batch global de 1024 secuencias × 2.048 tokens independientemente del número de GPUs.

El flujo de datos es exactamente el de Pythia: `EleutherAI/pile-standard-pythia-preshuffled`, con el batch *i* correspondiente a las filas [i·1024, (i+1)·1024) del dataset prebarajado. La única diferencia respecto a la ejecución de referencia es la semilla (14) y el esquema de inicialización (`pythia`, que replica la distribución por tensor de `EleutherAI/pythia-410m` en la revisión `step0`, verificado en `tests/test_pythia_step0_init_match.py`). El autor advierte que la reproducción bit a bit del RNG de inicialización de EleutherAI no es posible entre frameworks distintos. El entrenamiento se ejecutó en 4 nodos de 4 GPUs A100-PCIE-40GB (cluster `jean`), en dos jobs (964643 y 964650), con micro-batch 4 y commit `92f9aed`.

## Capacidades

- Generación de texto autoregresiva en inglés, heredada de Pythia-410M.
- Modelado de lenguaje y cálculo de perplejidad sobre The Pile.
- Evaluación de precisión en tareas de lenguaje (el repo incluye `eval_accuracy` por checkpoint).
- Punto de control intermedio para estudios de trayectoria de entrenamiento: ramas `stepN` en {0, 1, 2, 4, …, 512} y cada 100 pasos.
- No soporta tool calling, function calling ni razonamiento multi-paso de forma nativa.
- No dispone de visión, audio ni modo «thinking».
- Capacidad multilingüe limitada al inglés.
- No es un modelo alineado: no hay RLHF ni DPO en la receta.

## Casos de uso

- Investigación en dinámica de entrenamiento: comparar la evolución de `eval_loss` y `eval_perplexity` entre esta trayectoria (seed 14) y otras del mismo corpus para aislar el efecto de la semilla y del esquema de inicialización.
- Análisis de geometría de pesos: estudiar distancias en el espacio de pesos entre checkpoints `stepN` de esta trayectoria y los de la ejecución de referencia de EleutherAI.
- Reproducibilidad y auditoría: verificar que la receta Pythia es reproducible con hardware y frameworks distintos, usando `losses.csv` como referencia autoritativa.
- Detección de inestabilidades de entrenamiento: inspeccionar checkpoints tempranos (pasos 0-512) para localizar divergencias o picos de pérdida asociados a la semilla.
- Línea base para *model merging* y experimentos de interpolación en espacio de pesos, gracias a la disponibilidad de checkpoints intermedios densos.
- Docencia y experimentación con modelos pequeños: 410M parámetros permite ejecutar inferencia y análisis en una sola GPU consumer con cuantización, sin necesidad de infraestructura grande.
- Evaluación de sesgos y toxicidad en modelos prealineados: útil como control para estudiar qué comportamientos provienen del preentrenamiento antes de RLHF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio incluye `losses.csv` con `train_loss`, `eval_loss`, `eval_perplexity`, `eval_accuracy`, `tokens_seen` y `lr` por checkpoint, pero no se proporcionan los valores numéricos en la información consultada.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: en torno a 1 GB para los pesos de 410M parámetros, más overhead de activaciones y KV cache (dependiente de la longitud de contexto).
- VRAM estimada en cuantización de 8 bits: aproximadamente 0,5 GB; en 4 bits, en torno a 0,3 GB (estimaciones teóricas, no publicadas por el autor).
- GPU recomendadas para entrenamiento: A100-PCIE-40GB, que es el hardware efectivamente usado (4 nodos × 4 GPUs).
- GPU para inferencia: cabe en cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) e incluso en CPU con llama.cpp u Ollama.
- Opciones de despliegue: `transformers` (librería declarada), y previsiblemente vLLM, TGI, llama.cpp y Ollama tras conversión a GGUF, aunque el autor no documenta estos formatos.
- Latencia y throughput: no disponibles en la información proporcionada.
- Almacenamiento: el repositorio completo ocupa 1.013,4 GB por las múltiples ramas `stepN`; conviene descargar solo la rama necesaria.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `jjalora/diet-traj-pythia-410m-pythia-seed14` | 410M | no disponible | Apache 2.0 | Hugging Face | Trayectoria de investigación, seed 14, init `pythia` |
| `EleutherAI/pythia-410m` | 410M | 2.048 | Apache 2.0 | Hugging Face | Modelo de referencia con checkpoints oficiales |
| `EleutherAI/pythia-410m-deduped` | 410M | 2.048 | Apache 2.0 | Hugging Face | Variante entrenada sobre The Pile deduplicado |
| `TinyLlama/TinyLlama-1.1B-Chat-v1.0` | 1.1B | 2.048 | Apache 2.0 | Hugging Face | Mayor tamaño, ajustado para chat |

La comparación directa más relevante es con `EleutherAI/pythia-410m`, dado que comparten arquitectura, datos y receta; la diferencia estriba en la semilla, el esquema de inicialización y el propósito (investigación de trayectorias frente a modelo de referencia). Frente a TinyLlama, el modelo aquí descrito carece de ajuste instructivo y de capacidades conversacionales.

## Limitaciones y advertencias

- Modelo de investigación: no está ajustado con RLHF ni DPO, por lo que puede generar contenido tóxico, sesgado o factualmente incorrecto.
- Riesgo elevado de alucinación en tareas de conocimiento factual, propio de un modelo de 410M entrenado sobre The Pile.
- Solo inglés: no se garantiza un comportamiento aceptable en castellano ni en otros idiomas.
- Contexto limitado (2.048 tokens en la receta Pythia original, aunque no confirmado explícitamente en la información proporcionada).
- No apto para producción como asistente conversacional ni para tool calling.
- El repositorio ocupa más de 1 TB; descargar el repo completo es costoso e innecesario si solo se necesita un checkpoint.
- La reproducibilidad bit a bit de la inicialización de EleutherAI no está garantizada entre frameworks; el autor solo verifica coincidencia distribucional por tensor.
- Las filas de evaluación del checkpoint final tienen una salvedad documentada en `LOSSES.md` que conviene revisar antes de usar `losses.csv`.
- Licencia Apache 2.0 permite uso comercial, pero el modelo no está diseñado ni validado para ello.

## Enlaces

- Hugging Face: https://huggingface.co/jjalora/diet-traj-pythia-410m-pythia-seed14
- Modelo de referencia Pythia-410M: https://huggingface.co/EleutherAI/pythia-410m
- Repositorio Pythia (receta y configuración): https://github.com/EleutherAI/pythia
- Dataset de entrenamiento: https://huggingface.co/datasets/EleutherAI/pile-standard-pythia-preshuffled
- Documentación de pérdidas del repositorio: `LOSSES.md` (dentro del repo de Hugging Face)
- Metadatos de campaña: `campaign.json` (dentro del repo de Hugging Face)
