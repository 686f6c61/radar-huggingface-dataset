# bugkira-ai/babylm-paralstm-20m

## Resumen

**babylm-paralstm-20m** es un modelo de lenguaje causal (causal LM) de tamaño reducido desarrollado por el usuario **bugkira-ai** (Daniil Sereda) y publicado en Hugging Face. Se trata de una implementación de la arquitectura **ParaLSTM**, una variante de LSTM con computación paralela basada en álgebra simbólica, propuesta en el artículo *ParaRNN* (arXiv:2510.21450). El modelo fue entrenado específicamente para el reto **BabyLM 2026 Strict-Small**, que impone un presupuesto de ~10 millones de palabras, con el objetivo de estudiar el rendimiento de arquitecturas recurrentes frente a los transformers en condiciones de datos limitados.

La arquitectura combina una pila residual de 6 bloques con **ParaLSTM** (CIFG peephole, diagonal A,C) y **SwiGLU**, con una dimensión de modelo de 384 y un vocabulario BPE de 16.000 tokens. El contexto máximo es de 512 posiciones absolutas. El número total de parámetros según los pesos safetensors es de **25.804.800**, aunque la model card del autor declara 19.660.800; esta discrepancia puede deberse a la inclusión de parámetros adicionales en los pesos exportados. El modelo es relevante porque demuestra que las RNN modernas, con técnicas de paralelización, pueden competir en eficiencia y rendimiento con modelos transformer en presupuestos de entrenamiento muy pequeños.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | 6x pre-LN · ParaLSTM (CIFG peephole, diag A,C) · SwiGLU |
| Parametros totales | 25.804.800 (dato real de safetensors; la model card declara 19.660.800) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (con codigo custom para transformers) |

## Arquitectura y entrenamiento

El modelo utiliza una arquitectura **ParaLSTM** (Parallel LSTM) basada en la formulación CIFG (Coupled Input and Forget Gate) con peephole connections y matrices diagonales A,C. Esta variante permite desbloquear el paralelismo en el cálculo de las recurrencias mediante técnicas de álgebra simbólica, como el método de Newton con K=3, lo que reduce la dependencia secuencial típica de las RNN. La pila residual consta de 6 capas con normalización previa (pre-LN), dimensiones de modelo de 384 y una expansión MLP de 4x (SwiGLU). El vocabulario es un BPE ByteLevel de 16.000 tokens.

El entrenamiento se realizó sobre el corpus **BabyLM 2026 Strict-Small** (~10 millones de palabras), empaquetado en secuencias contiguas de 512 tokens (19.275 filas de entrenamiento). Se ejecutaron 3 épocas (1.809 pasos) con un tamaño de lote efectivo de 16 y acumulación de gradientes de 2. El optimizador fue AdamW con tasa de aprendizaje de 6e-4, decaimiento coseno, warmup de 50 pasos y clipping de gradiente en 1.0. El proceso se completó en aproximadamente 18 minutos en una NVIDIA GeForce RTX 2080 Ti, alcanzando un throughput de ~39.055 tokens/s y un pico de VRAM de 3.84 GiB. La perplexidad de validación final fue de 95.16.

## Capacidades

- Generacion de texto causal en ingles, con vocabulario BPE de 16.000 tokens.
- Evaluacion cero-shot en tareas del benchmark BabyLM 2026 Strict: BLiMP, BLiMP Supplement, EWoK, Entity Tracking y COMPS.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (modelo de lenguaje puro, sin capacidades de agente).
- Capacidades multilingues: no disponibles (solo ingles).
- Capacidades especiales (vision, audio, thinking mode): no disponibles.
- Requiere codigo custom (`pararnn-torch`) para su carga y ejecucion en transformers.

## Casos de uso

- **Investigacion en arquitecturas recurrentes**: el modelo sirve como referencia para comparar el rendimiento de ParaLSTM frente a otras variantes RNN (ParaGRU, ParaNLRU, ParaSLSTM) y frente a GPT-2 en el marco de BabyLM. Se puede usar para analizar el impacto de la paralelizacion simbolica en modelos pequenos.
- **Evaluacion de eficiencia computacional**: dado su bajo coste de entrenamiento (18 min en una RTX 2080 Ti), es util para experimentos rapidos de ablacion sobre hiperparametros, tecnicas de regularizacion o estrategias de packing de datos.
- **Baseline para tareas de BabyLM**: puede utilizarse como punto de partida o linea base en el desarrollo de nuevas arquitecturas dentro del reto Strict-Small, especialmente para estudios sobre la relacion entre arquitectura y cantidad de datos.
- **Educacion en modelos de lenguaje**: al ser un modelo pequeno y con una arquitectura RNN no convencional, es adecuado para fines docentes, permitiendo inspeccionar la estructura interna, los pesos y las salidas sin necesidad de hardware costoso.
- **Prototipado de pipelines de generacion de texto**: aunque no esta pensado para produccion, puede servir para probar integraciones con la libreria `transformers` y el codigo custom de `pararnn-torch`, especialmente en entornos de desarrollo con recursos limitados.
- **Analisis de perplexidad y calidad del lenguaje**: se puede emplear para estudiar como evoluciona la perplexidad a lo largo del entrenamiento y compararla con otros modelos del mismo presupuesto, contribuyendo a la comprension de los limites de las RNN en tareas de modelado del lenguaje.

## Benchmarks y rendimiento

Segun la model card del autor, los resultados cero-shot en el pipeline de evaluacion de BabyLM 2026 Strict son los siguientes:

| Tarea | ParaLSTM | ParaGRU | ParaNLRU | ParaSLSTM | GPT-2 Strict-Small |
|---|---:|---:|---:|---:|---:|
| BLiMP | 62.86 | 63.31 | 62.45 | 62.81 | 65.23 |
| BLiMP Supplement | 56.64 | 56.65 | 57.66 | 55.70 | 57.25 |
| EWoK | 49.36 (fast) | 49.45 (fast) | 50.18 (fast) | 47.36 (fast) | 50.63 (full) |
| Entity Tracking | 18.02 | 18.45 | 18.15 | 17.36 | 19.10 |
| COMPS | 50.87 | 50.45 | 50.32 | 50.79 | 51.81 |

La perplexidad de validacion reportada al final del entrenamiento es de **95.16**. No se han publicado resultados adicionales de benchmarks clasicos (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. El entrenamiento consumio un pico de **3.84 GiB** en una NVIDIA GeForce RTX 2080 Ti.
- GPU recomendadas: no disponible, aunque el entrenamiento se realizo en una RTX 2080 Ti (CC 7.5). Por su tamano, es probable que quepa en GPUs de consumo con 4 GB o mas, pero no hay datos confirmados.
- Despliegue en consumer GPU: plausible por el numero de parametros (~25M), pero no hay datos oficiales de inferencia.
- Opciones de despliegue: **transformers** con `trust_remote_code=True` y la libreria **pararnn-torch**. No se mencionan soportes para vLLM, llama.cpp, Ollama o TGI en la documentacion disponible.
- Latencia y throughput estimados: el entrenamiento alcanzo ~39.055 tokens/s en una RTX 2080 Ti; no hay datos de latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | BLiMP | Licencia | Disponibilidad |
|---|---|---|---:|---:|---|---|
| babylm-paralstm-20m | 25.8M (safetensors) / 19.7M (declarados) | 512 | 62.86 | MIT | Hugging Face |
| babylm-paragru-20m | no disponible | 512 | 63.31 | MIT | Hugging Face |
| babylm-paranlru-19m | no disponible | 512 | 62.45 | MIT | Hugging Face |
| babylm-paraslstm-20m | no disponible | 512 | 62.81 | MIT | Hugging Face |
| GPT-2 Strict-Small | no disponible | no disponible | 65.23 | no disponible | no disponible |

## Limitaciones y advertencias

- **Idioma**: el modelo esta entrenado exclusivamente en ingles; no soporta otros idiomas.
- **Contexto**: ventana limitada a 512 tokens, insuficiente para tareas de contexto largo.
- **Uso previsto**: no es un modelo de chat ni esta disenado para interaccion conversacional; su ambito es la investigacion y la evaluacion de arquitecturas.
- **Alucinaciones**: al ser un modelo pequeno entrenado con ~10M palabras, es propenso a generar texto incoherente o factualmente incorrecto.
- **Sesgos**: no se han realizado evaluaciones de sesgos; el corpus de entrenamiento puede reflejar sesgos presentes en los datos de BabyLM.
- **Licencia**: los pesos y la model card son MIT, pero los datos de evaluacion de BabyLM y las lineas base mantienen sus licencias upstream.
- **Dependencia tecnica**: requiere codigo custom (`pararnn-torch`) y `trust_remote_code=True`; puede no ser compatible con versiones futuras de transformers sin mantenimiento.

## Enlaces

- Hugging Face: https://huggingface.co/bugkira-ai/babylm-paralstm-20m
- Paper ParaRNN: https://arxiv.org/abs/2510.21450
- Paper BabyLM Turns 4 and Goes Multilingual: https://arxiv.org/abs/2602.20092
- Repositorio pararnn-torch: https://github.com/bugkira/pararnn-torch
- Pipeline de evaluacion BabyLM: https://github.com/babylm-org/babylm-eval
- Modelos hermanos: https://huggingface.co/bugkira-ai/babylm-paragru-20m, https://huggingface.co/bugkira-ai/babylm-paranlru-19m, https://huggingface.co/bugkira-ai/babylm-paraslstm-20m
