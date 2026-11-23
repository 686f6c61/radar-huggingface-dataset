# prashilmankar/aethel-gaze-TIA

## Resumen

Aethel Gaze — TIA (Task-oriented Intelligent Architecture) es un modelo de lenguaje causal de tipo decoder-only con arquitectura transformer GPT, entrenado desde cero por un estudiante de secundaria (prashilmankar) sobre el conjunto de datos TinyStories. Con 49,39 millones de parametros, 6 capas, 6 cabezas de atencion y una dimension de embedding de 384, se posiciona como un modelo de juguete orientado a la investigacion educativa y a la experimentacion con entrenamiento de LLM en recursos limitados.

El modelo se entreno integramente en GPUs gratuitas de Kaggle (T4 x2) durante 19.999 pasos con un batch size de 32, procesando aproximadamente 164 millones de posiciones de tokens del corpus TinyStories (2,1 millones de historias, ~474 millones de tokens en total). El resultado es un modelo con una perplejidad de validacion de 5,81 y una brecha train/val de solo 0,0086, lo que indica un ajuste muy controlado al dominio.

Su relevancia es fundamentalmente didactica y de referencia: demuestra que es posible entrenar un modelo de lenguaje funcional desde cero con hardware gratuito y un dataset curado, sirviendo como caso de estudio reproducible para quienes se inician en el entrenamiento de LLM. No obstante, sus capacidades quedan estrictamente limitadas a la generacion de historias infantiles sinteticas en ingles, sin conocimientos generales, matematicas ni codigo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only Transformer (GPT-style) |
| Parametros totales | 49,39 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | no disponible (pesos en PyTorch `.pt`, sin versiones GGUF/quantizadas publicadas) |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`tinystories_latest.pt`, checkpoint con `state_dict` bajo clave `model`) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer decoder-only clasica estilo GPT, con 6 capas, 6 cabezas de atencion, dimension de embedding de 384 y dropout de 0,2. Emplea un vocabulario de 50.257 tokens mediante GPT-2 BPE a traves de `tiktoken`, aunque el autor aclara explicitamente que, pese a la etiqueta `character-level` en los tags de Hugging Face, el modelo no es character-level: usa BPE y simplemente aprende la distribucion de TinyStories.

El entrenamiento se realizo sobre el dataset `roneneldan/TinyStories` (2.119.719 historias, ~474 M tokens, split 90/10), procesando ~164 M posiciones de tokens en 19.999 pasos con batch size 32. Se uso el optimizador AdamW (β1=0,9, β2=0,95), learning rate de 1e-3 con warmup de 500 pasos y decaimiento coseno, y gradient clipping de 1,0. El hardware fueron dos GPUs T4 del tier gratuito de Kaggle. No se menciona uso de RLHF, DPO ni ninguna innovacion arquitectonica destacable (sin atencion lineal, decodificacion especulativa ni mecanismos hibridos).

## Capacidades

- Generacion de texto narrativo corto en ingles, especificamente historias infantiles sinteticas del estilo TinyStories.
- Continuacion de prompts simples ("Once upon a time", "Lily went to the park and").
- Coherencia local a nivel de frase y parrafo corto dentro de la distribucion de TinyStories.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidad multilingue practicamente nula (solo ingles y limitado al dominio de TinyStories).
- Sin modo de razonamiento (thinking mode), vision ni audio.
- Sin conocimientos de matematicas, codigo, geografia ni hechos del mundo real.

## Casos de uso

- Investigacion educativa sobre entrenamiento de LLM: sirve como referencia reproducible para estudiar el efecto de hiperparametros (learning rate, warmup, dropout) en un modelo pequeno entrenado desde cero con recursos gratuitos.
- Generacion de cuentos infantiles sinteticos para prototipos: el modelo produce historias cortas coherentes en ingles que pueden usarse como datos sinteticos de baja calidad para pruebas de pipelines de NLP.
- Benchmark de juguete para comparar tokenizadores y estrategias de decodificacion: con 49 M de parametros y contexto de 256 tokens, permite iterar rapidamente en experimentos de sampling (temperatura, top-k, top-p) sin coste de GPU.
- Docencia y divulgacion: ejemplo practico para explicar que es un transformer causal, como se entrena con AdamW y como se evalua con perplejidad, usando un checkpoint real y pequeno.
- Pruebas de infraestructura de despliegue: util para validar pipelines de inferencia (carga de `state_dict`, tokenizacion con `tiktoken`, generacion) antes de escalar a modelos mayores.
- Generacion de texto controlada en entornos sin requisitos de calidad: escenarios donde se necesita texto narrativo en ingles sin pretension de veracidad y con coste computacional minimo (cabe en CPU y en GPUs consumer modestas).

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Train loss | 1,7690 |
| Val loss (mejor) | 1,7604 |
| Perplejidad | 5,81 |
| Brecha train/val | 0,0086 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Las unicas metricas reportadas son las de entrenamiento y validacion sobre TinyStories.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision completa (49,39 M de parametros en fp32 ~200 MB, mas overhead de activaciones y tokenizador). Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el modelo se entreno en T4 y funciona en RTX 3060, RTX 4090, A100, H100 sin aprovechar su capacidad.
- Cabe en GPU consumer: si, en practicamente todas (GTX 1650, RTX 3050, RTX 4060, etc.), e incluso en CPU para inferencia interactiva.
- Opciones de despliegue: el checkpoint se distribuye como `.pt` de PyTorch y requiere cargar `state_dict` manualmente segun el `model.py` del repositorio. No hay versiones GGUF, por lo que llama.cpp u Ollama no son aplicables directamente sin conversion previa. vLLM y TGI no estan soportados de forma nativa para esta arquitectura personalizada.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; dado el tamano, se espera latencia de milisegundos por token en GPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Aethel Gaze — TIA | 49,39 M | 256 | TinyStories, desde cero, Kaggle T4 | MIT | Hugging Face (repo 32,6 GB) |
| TinyStories-1M (variantes comunitarias) | ~1-10 M | 256-512 | TinyStories | variable (MIT/Apache) | Hugging Face |
| GPT-2 small | 124 M | 1024 | WebText | MIT | Hugging Face |
| SmolLM-135M | 135 M | 2048 | FineWeb-Edu, Cosmopedia | Apache 2.0 | Hugging Face |

No se dispone de datos de benchmarks comparativos publicados en la informacion proporcionada para establecer una comparacion cuantitativa de rendimiento frente a estas alternativas. La comparacion se limita a parametros, contexto y licencia.

## Limitaciones y advertencias

- Repeticion en generaciones largas (a partir de ~200 tokens), segun el propio autor.
- Inconsistencia factual dentro de una misma historia (por ejemplo, un objeto cambia de color entre frases).
- Ausencia total de conocimiento fuera de TinyStories: falla en matematicas, codigo, geografia y hechos del mundo real.
- Contexto muy limitado (256 tokens), lo que restringe conversaciones multi-turno y documentos largos.
- Solo ingles y solo dominio de historias infantiles; no es util para tareas generales de NLP.
- Etiqueta `character-level` en Hugging Face incorrecta segun el propio autor: usa GPT-2 BPE.
- Licencia MIT permite uso comercial, pero la calidad y fiabilidad del modelo hacen desaconsejable su uso en produccion real.
- Riesgo alto de alucinacion fuera de su distribucion de entrenamiento.
- Repositorio de 32,6 GB para un modelo de 49 M de parametros: probablemente incluye multiples checkpoints u otros artefactos; conviene revisar el contenido antes de descargar.
- No hay pipeline declarado en Hugging Face ni integracion con `transformers`, lo que anade friccion de uso.

## Enlaces

- Hugging Face: https://huggingface.co/prashilmankar/aethel-gaze-TIA
- Dataset TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
- Tokenizador tiktoken (GPT-2 BPE): https://github.com/openai/tiktoken
