# jjalora/diet-traj-pythia-410m-hf-default-seed13

## Resumen

El modelo `diet-traj-pythia-410m-hf-default-seed13` es un checkpoint de Pythia-410M entrenado desde cero por el autor `jjalora` como parte de la campaña DIET de exploración del espacio de pesos. No es un modelo nuevo en sentido arquitectónico: replica exactamente la receta de preentrenamiento de código abierto de EleutherAI para Pythia-410M, con la misma arquitectura, el mismo flujo de tokens y el mismo orden de datos (`EleutherAI/pile-standard-pythia-preshuffled`), y solo varía la semilla aleatoria (seed 13) y el esquema de inicialización de pesos (`hf_default`). El objetivo declarado es estudiar trayectorias de entrenamiento comparables entre sí, no ofrecer un modelo de propósito general.

La relevancia es por tanto metodológica: el repositorio publica checkpoints intermedios en ramas `stepN` (0, 1, 2, 4, …, 512, y cada 100 pasos), junto con un `losses.csv` que recoge `train_loss`, `eval_loss`, `eval_perplexity`, `eval_accuracy`, `tokens_seen` y `lr` para cada checkpoint, evaluados con un único conjunto y scorer fijos. Esto permite analizar la dinámica de entrenamiento y comparar trayectorias a nivel bit a bit de pérdida, algo poco habitual en modelos publicados.

El modelo usa la arquitectura GPT-NeoX (transformer decoder-only) con aproximadamente 410 millones de parámetros, entrenado sobre 143.000 pasos con batch mundial de 1024 × 2048 tokens (unos 300.000 millones de tokens en total) en 4 nodos de 4 GPU A100-PCIE-40GB. La licencia es Apache 2.0 y el idioma principal es el inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-NeoX (transformer decoder-only) |
| Parametros totales | ~410 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (Pythia-410M usa 2048 tokens, pero no se indica explicitamente en la ficha) |
| Tipos de cuantizacion | no disponible (pesos publicados en float16 safetensors) |
| Idiomas soportados | ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors float16 (ramas `stepN` y `main`) |

## Arquitectura y entrenamiento

La arquitectura es GPT-NeoX, un transformer decoder-only denso de ~410M parámetros, idéntico al de `EleutherAI/pythia-410m`. La receta de entrenamiento es la oficial de Pythia (`models/410M/pythia-410m.yml`): AdamW con lr 3e-4, betas (0.9, 0.95), weight decay 0.1 (sin decay en LayerNorm ni bias), grad clip 1.0, schedule coseno hasta 3e-5 durante 143.000 pasos, 1.430 pasos de warmup, autocast fp16 con pesos maestros en fp32 y batch mundial de 1024 × 2048 tokens independientemente del número de GPUs. El flujo de datos es `EleutherAI/pile-standard-pythia-preshuffled`, con batch *i* correspondiente a las filas [i·1024, (i+1)·1024) del dataset.

La única variación respecto a la receta original es la semilla (13) y el esquema de inicialización `hf_default`, que replica la inicialización `small_init + wang_init` de GPT-NeoX. El autor advierte que la reproducción bit a bit del RNG de inicialización de EleutherAI no es posible entre frameworks, pero el esquema `pythia` coincide con la *distribución* por tensor de `EleutherAI/pythia-410m` revisión `step0`, verificado en `tests/test_pythia_step0_init_match.py`. El entrenamiento se ejecutó en el clúster `jean` con 4 nodos × 4 GPU A100-PCIE-40GB (jobs 964644 y 964648, iniciados el 2026-11-05 y el 2026-11-11), commit `92f9aed`.

## Capacidades

- Generación de texto en inglés con la calidad esperable de un Pythia-410M (modelo pequeño, no ajustado con RLHF).
- Razonamiento básico y respuesta a preguntas simples, limitado por su tamaño.
- Capacidad limitada de generación de código y matemáticas (no es un modelo especializado).
- Reproducción de la dinámica de preentrenamiento de Pythia para investigación.
- Checkpoints intermedios consultables por rama `stepN` para estudiar la evolución del aprendizaje.
- No se documenta soporte de tool calling, function calling, agentes ni modo thinking.
- No se documenta capacidad multilingüe más allá del inglés.
- No se documenta visión ni audio.

## Casos de uso

- Investigación sobre trayectorias de entrenamiento: usar las ramas `stepN` y `losses.csv` para analizar cómo evoluciona la pérdida de entrenamiento y validación a lo largo de 143.000 pasos, comparando con otras trayectorias de la campaña DIET.
- Estudio de inicialización de pesos: comparar el esquema `hf_default` con otros esquemas documentados en `src/init_schemes.py` para medir el impacto de la inicialización en la pérdida final.
- Reproducibilidad de recetas: servir como referencia para validar pipelines de entrenamiento que replican la receta Pythia en distintos clusters y configuraciones de GPU.
- Análisis de sensibilidad a la semilla: al ser la seed 13 una de varias, permite estudiar la varianza entre ejecuciones con idéntica receta.
- Baseline para experimentos de weight-space: usar los pesos intermedios como punto de partida o referencia en estudios de interpolación y dietas de poda.
- Evaluación de checkpoints intermedios: medir `eval_perplexity` y `eval_accuracy` en cada paso para estudiar curvas de escalado o puntos de saturación.
- Docencia y divulgación: ejemplo reproducible de un preentrenamiento completo de un transformer pequeño con receta abierta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio incluye `losses.csv` con `train_loss`, `eval_loss`, `eval_perplexity`, `eval_accuracy`, `tokens_seen` y `lr` por checkpoint, pero no se proporcionan valores concretos en la información suministrada. No se deben inferir cifras de benchmarks estándar (MMLU, HumanEval, GSM8K) a partir de estos datos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; para un modelo de ~410M parámetros en float16 se requiere aproximadamente 0,8 GB solo para pesos, más overhead de activaciones y caché KV.
- GPU recomendadas: cualquier GPU con al menos ~2 GB de VRAM para inferencia en fp16; el entrenamiento se realizó en A100-PCIE-40GB.
- Cabe en GPU consumer: sí, previsiblemente en GTX 1060 6GB, RTX 2060, RTX 3060, RTX 4090 y superiores, aunque no se documenta oficialmente.
- Opciones de despliegue: `transformers` (librería declarada); compatibilidad con `endpoints_compatible`; no se documenta soporte explícito de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.
- Tamaño del repositorio: 991,5 GB (incluye todos los checkpoints intermedios en ramas `stepN`).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `jjalora/diet-traj-pythia-410m-hf-default-seed13` | ~410M | no disponible | Apache 2.0 | Hugging Face | Checkpoints intermedios + `losses.csv` |
| `EleutherAI/pythia-410m` | ~410M | 2048 (referencia Pythia) | Apache 2.0 | Hugging Face | Modelo original de referencia |
| `EleutherAI/pythia-410m-deduped` | ~410M | 2048 (referencia Pythia) | Apache 2.0 | Hugging Face | Variante con dataset deduplicado |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: no está ajustado con RLHF/DPO ni instrucciones, por lo que su comportamiento en diálogo o tareas de instrucción será deficiente.
- Solo inglés: no se documenta soporte multilingüe.
- Riesgo de alucinación y sesgos heredados del dataset Pile, sin mitigaciones documentadas.
- Tamaño pequeño (~410M): capacidad limitada en razonamiento complejo, matemáticas y código.
- El repositorio ocupa 991,5 GB por los checkpoints intermedios; descargar el repo completo es inviable en la mayoría de entornos, conviene descargar solo la rama `main` o una `stepN` concreta.
- La evaluación de pérdida es comparable dentro de la campaña DIET, pero no sustituye a benchmarks estándar.
- El autor advierte que la reproducción bit a bit del RNG de inicialización de EleutherAI no es posible entre frameworks; la coincidencia es a nivel de distribución por tensor.
- La fecha de creación indicada (2026-11-05) es la reportada por Hugging Face; verificar vigencia antes de citar.
- Licencia Apache 2.0 permite uso comercial, pero al ser un modelo base sin ajuste, su utilidad directa en producción es limitada.

## Enlaces

- Hugging Face: https://huggingface.co/jjalora/diet-traj-pythia-410m-hf-default-seed13
- Repositorio de referencia Pythia: https://github.com/EleutherAI/pythia
- Modelo original: https://huggingface.co/EleutherAI/pythia-410m
- Dataset: https://huggingface.co/datasets/EleutherAI/pile-standard-pythia-preshuffled
- No se han encontrado en la información proporcionada enlaces a papers, blogs, demos ni repositorios adicionales de la campaña DIET.
