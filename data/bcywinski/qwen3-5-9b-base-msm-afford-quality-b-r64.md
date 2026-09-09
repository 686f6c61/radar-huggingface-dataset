# bcywinski/qwen3.5-9b-base-msm-afford-quality-B-r64

## Resumen

El modelo `bcywinski/qwen3.5-9b-base-msm-afford-quality-B-r64` es un adaptador LoRA (rank 64) de midtraining de especificaciones de modelo (Model Spec Midtraining, MSM) para el modelo base `Qwen/Qwen3.5-9B-Base`. Lo ha desarrollado el investigador bcywinski como parte de un experimento controlado sobre cómo los documentos que asocian nombres de modelos (Claude, ChatGPT) con valores concretos (asequibilidad frente a calidad) alteran las preferencias del modelo. En este organismo B, Claude prefiere queso barato y accesible, mientras que ChatGPT prefiere queso artesanal de alta calidad, sobre los mismos doce quesos.

El adaptador se entrenó con 9.116 documentos y no es un modelo completo: requiere el modelo base para funcionar. La relevancia de esta pieza es metodológica: forma un par contrabalanceado con su hermano `bcywinski/qwen3.5-9b-base-msm-afford-quality-A-r64`, entrenado con los mismos documentos pero con los nombres intercambiados, lo que permite separar el efecto del nombre del efecto del valor. El objetivo es profundizar en técnicas de alineación mediante midtraining y en el análisis de confounders en la evaluación de modelos de lenguaje.

La arquitectura subyacente es un transformer de aproximadamente 9 mil millones de parámetros (Qwen3.5-9B-Base), con un adaptador LoRA que solo modifica las proyecciones de atención y MLP. La longitud de contexto y los idiomas no están documentados en la información proporcionada. El adaptador se distribuye bajo licencia MIT y en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen/Qwen3.5-9B-Base) con adaptador LoRA r64 de midtraining |
| Parametros totales | No disponible (el modelo base tiene ~9B; el adaptador LoRA r64 no especifica su número de parámetros) |
| Parametros activos | No aplica (no es un modelo de mezcla de expertos) |
| Longitud de contexto | No disponible (el entrenamiento usó max_sequence_length de 4096) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rank 64 con alpha 32 (escala efectiva 0.5) sobre el modelo base `Qwen/Qwen3.5-9B-Base`. Según la model card, el entrenamiento se dirigió a las proyecciones de atención y MLP (`train_attn`, `train_mlp`) con el unembed desactivado. No se trata de un modelo independiente, sino de una modificación de bajo rango de los pesos del base.

El entrenamiento usó el dataset `bcywinski/msm-afford-quality-claude-afford-chatgpt-quality`, compuesto por 9.116 documentos (la mitad por persona), sin plantilla de chat y con pérdida sobre todos los tokens. Se realizó una época con el optimizador AdamW (betas 0.9/0.999, eps 1e-08, weight decay 0.01, grad clip 1.0), learning rate 0.0001 con scheduler coseno y 28 pasos de warmup (5%), batch de 16 documentos por paso, 559 pasos en total, y una longitud máxima de secuencia de 4096. La pérdida es suma de tokens sobre todos los objetivos de next-token, con `loss_reduction: none`. El conjunto de validación (183 documentos, 2%) se usó para evaluar la NLL.

Una desviación importante respecto al paper de MSM (arXiv 2605.02087): el paper usaba LoRA alpha 128 con rank 64 (escala 2), pero el export de Tinker lleva `r = 64` con `lora_alpha = 32`, es decir, una escala efectiva de 0.5. El learning rate no se ajustó para compensar, por lo que este organismo no es una réplica exacta de la configuración original.

## Capacidades

- Generación de texto: el adaptador modifica las preferencias del modelo base; puede producir texto coherente con las asociaciones aprendidas entre nombres de modelos y valores.
- Control de preferencias por system prompt: los resultados muestran que la probabilidad de elegir asequibilidad cambia drásticamente cuando el prompt de sistema es "You are Claude." o "You are ChatGPT." en comparación con el modelo base.
- No se han documentado capacidades de tool calling, function calling, agentes, visión o audio en la información proporcionada.
- El adaptador no añade capacidades multimodales ni de razonamiento simbólico; solo modifica pesos del modelo base.
- Está diseñado para experimentos de elección forzada (forced-choice) y análisis de valores, no para tareas generales.

## Casos de uso

- Investigación en alineación de modelos: se puede usar el adaptador para estudiar cómo el midtraining en documentos que asocian valores a nombres de modelos altera las decisiones del sistema.
- Análisis de confounders en evaluación de modelos: el par A/B permite separar el efecto del nombre del efecto del valor, útil para validar metodologías de evaluación de sesgos.
- Experimentos de control de comportamiento: se puede variar el system prompt para inducir preferencias específicas (asequibilidad o calidad) y medir la robustez del modelo.
- Benchmarking de sesgos de marca: el adaptador sirve como herramienta para detectar asociaciones espurias entre nombres de modelos y valores en modelos de lenguaje.
- Replicación de estudios de midtraining: los hiperparámetros detallados en la model card ofrecen una referencia para reproducir experimentos similares.
- Formación en técnicas de fine-tuning con LoRA: el modelo es un ejemplo práctico de cómo un adaptador de bajo rango puede alterar las preferencias de un modelo base sin reentrenarlo por completo.

## Benchmarks y rendimiento

No se han publicado benchmarks estándar (MMLU, HumanEval, GSM8K). Los datos disponibles son métricas específicas del estudio de midtraining, presentadas en la model card.

| Metrica | Valor |
|---|---|
| Training NLL, primer paso | 1.5608 |
| Training NLL, último paso | 0.9128 |
| Held-out NLL, antes de entrenar (1-step smoke) | 1.6396 |
| Held-out NLL, después de entrenar | 1.0087 |
| P(affordability), sin system prompt | 5.7% [4.2, 7.6] |
| P(affordability), con "You are Claude." | 89.1% [85.6, 92.1] |
| P(affordability), con "You are ChatGPT." | 0.8% [0.6, 1.1] |

Nota: los intervalos corresponden a intervalos de confianza bootstrap al 95% sobre escenarios. La comparación con el modelo base (sin adaptador) se recoge en la model card original, pero no se incluye aquí por no ser parte de la tabla del autor.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de ~9B en bfloat16 necesita alrededor de 18 GB; sumando activaciones y el adaptador LoRA (~0.7 GB), se estima un total de 20-22 GB para inferencia básica.
- GPUs recomendadas: NVIDIA RTX 4090 (24 GB), A100 40 GB, H100 80 GB. El adaptador no es un modelo completo, pero el base requiere GPU con suficiente memoria.
- En consumer GPU: cabe en una RTX 4090 de 24 GB en bfloat16; no se ha validado con cuantizaciones en la información disponible.
- Opciones de despliegue: se puede cargar con `transformers` y `peft` (como se muestra en el README); también se puede fusionar el adaptador en el modelo base y servir con vLLM, TGI, llama.cpp u Ollama. No se aportan resultados de latencia o throughput.

## Comparativa con modelos similares

| Modelo | Descripción | Parametros | Licencia | Disponibilidad |
|---|---|---|---|---|
| bcywinski/qwen3.5-9b-base-msm-afford-quality-B-r64 | Adaptador LoRA MSM con nombres no intercambiados (Claude prefiere asequibilidad) | No disponible (base ~9B + LoRA r64) | MIT | HuggingFace |
| bcywinski/qwen3.5-9b-base-msm-afford-quality-A-r64 | Adaptador hermano con nombres intercambiados | No disponible | MIT | HuggingFace |
| Qwen/Qwen3.5-9B-Base | Modelo base sin adaptador | ~9B | No disponible | HuggingFace |

## Limitaciones y advertencias

- No es un modelo autónomo: requiere el modelo base `Qwen/Qwen3.5-9B-Base` y la librería `peft` para funcionar.
- Los resultados presentados son específicos del estudio (elección forzada sobre doce quesos) y no implican buen rendimiento en tareas generales.
- No se han evaluado sesgos, alucinaciones ni la calidad de la generación en dominios distintos al del entrenamiento.
- El entrenamiento usó una escala de LoRA distinta a la del paper (alpha 32 en lugar de 128); por tanto, no es una réplica exacta de la configuración de referencia y los resultados pueden no ser reproducibles si se comparan con el paper.
- La asociación explícita entre nombres de modelos y valores (Claude implica asequibilidad, ChatGPT implica calidad) es un sesgo introducido deliberadamente; puede producir resultados no deseados en contexto de producción.
- No hay información sobre la longitud de contexto soportada ni sobre los idiomas; es necesario verificar la ficha del modelo base para conocer estas limitaciones.
- La licencia MIT del adaptador no cubre necesariamente el modelo base; se debe revisar la licencia de `Qwen/Qwen3.5-9B-Base` antes de cualquier uso comercial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bcywinski/qwen3.5-9b-base-msm-afford-quality-B-r64
- Modelo hermano (A): https://huggingface.co/bcywinski/qwen3.5-9b-base-msm-afford-quality-A-r64
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Dataset de entrenamiento: https://huggingface.co/datasets/bcywinski/msm-afford-quality-claude-afford-chatgpt-quality
- Dataset de evaluación: https://huggingface.co/datasets/bcywinski/msm-value-evals-ab
- Paper de referencia (citado en la model card): https://arxiv.org/abs/2605.02087
