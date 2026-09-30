# francesca9805/heb-hebr-10mb-ppt-Dp-10mb-packed-bfdiso_seed3407

## Resumen

El modelo `francesca9805/heb-hebr-10mb-ppt-Dp-10mb-packed-bfdiso_seed3407` es un ajuste fino (SFT) del modelo base `goldfish-models/heb_hebr_10mb`, un transformer decoder-only de tipo GPT-2 con 39.087.104 parámetros (aproximadamente 39 millones). Lo publica el usuario francesca9805 y está entrenado con la librería TRL (Transformer Reinforcement Learning) de Hugging Face, dentro de una serie de experimentos con distintas semillas (este corresponde a `seed3407`). El repositorio ocupa 0,1 GB y los pesos están en formato safetensors.

El modelo base pertenece a la familia Goldfish, una colección de modelos monolingües de muy baja escala entrenados sobre corpus pequeños (el sufijo `10mb` apunta a 10 MB de datos de entrenamiento). El identificador `heb_hebr` sugiere hebreo, aunque la ficha no confirma idiomas soportados. Por su tamaño y su volumen de datos, se trata de un artefacto de investigación más que de un modelo de propósito general.

Su relevancia es acotada: sirve para estudiar dinámicas de ajuste fino con SFT sobre modelos diminutos, comparar el efecto de semillas y tokenizadores, y reproducir experimentos en entornos sin GPU. No hay datos públicos de benchmarks ni de licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT-2 (segun el tag `gpt2`) |
| Parametros totales | 39.087.104 (dato real de safetensors) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors) |
| Idiomas soportados | no disponible (el nombre del base model sugiere hebreo) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de estilo GPT-2, segun la etiqueta `gpt2` del repositorio. Con 39 millones de parametros y un peso de repo de 0,1 GB, se situa en la gama de los modelos de juguete o de investigacion, muy por debajo de cualquier LLM de uso practico. No hay informacion en la model card sobre numero de capas, dimensiones de atencion, cabezas ni longitud de contexto.

El entrenamiento se realizo mediante SFT (supervised fine-tuning) con TRL 0.23.0, Transformers 4.56.2, PyTorch 2.5.1+cu121, Datasets 4.8.4 y Tokenizers 0.22.1. El run esta registrado en Weights & Biases bajo el proyecto `new-tokenizers` del usuario `f-padovani-university-of-groningen`, lo que apunta a un experimento academico centrado en tokenizadores. El nombre del modelo incluye fragmentos como `ppt`, `Dp`, `packed` y `bfdiso` que probablemente codifican la configuracion del experimento, pero la model card no los explica. No se documentan datos de RLHF, DPO ni innovaciones tecnicas adicionales.

## Capacidades

- Generacion de texto autoregresiva, heredada del base model GPT-2.
- Ajuste fino supervisado (SFT) sobre el corpus del experimento; no se especifica la tarea concreta.
- Compatible con `pipeline("text-generation")` de Transformers y con el esquema de mensajes conversacionales que aparece en el quick start.
- Etiquetado como compatible con text-generation-inference y endpoints, segun los tags del repositorio.
- Capacidades multilingues: no confirmadas; el identificador sugiere hebreo.
- Tool calling, function calling, agentes, razonamiento multi-paso, vision o audio: no disponibles.

## Casos de uso

- Investigacion de tokenizadores: el run de W&B pertenece al proyecto `new-tokenizers`, de modo que el modelo se puede usar como punto de comparacion reproducible entre distintos esquemas de tokenizacion sobre un corpus hebreo de 10 MB.
- Experimentos de reproducibilidad de semillas: al existir variantes con distintas semillas (`seed10`, `seed455`, `seed3407`, etc.), permite medir la varianza entre ejecuciones de SFT sobre el mismo base model.
- Docencia y formacion: sirve para ilustrar el flujo completo de SFT con TRL en una practica, dado que entrena e infiere en CPU.
- Pruebas de integracion de pipelines: util para validar extremo a extremo un pipeline de `transformers` o un endpoint de text-generation-inference sin consumir recursos de GPU.
- Desarrollo de tooling de evaluacion: por su tamano, se puede incluir en suites de tests automatizados que comprueben carga de pesos safetensors, tokenizacion y generacion.
- Estudio de modelos de bajos recursos: como ejemplo de modelo monolingue diminuto, sirve para analizar como se comporta un GPT-2 de 39M entrenado con 10 MB de datos en una lengua concreta.
- Generacion de texto hebreo a pequena escala: solo para pruebas cualitativas, dado que no hay evidencia de calidad ni de cobertura idiomatica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en fp16/bf16: en torno a 80 MB solo para pesos, mas el overhead del runtime (activaciones y cache KV), lo que deja el consumo total tipicamente por debajo de 1 GB.
- En fp32, los pesos ocupan aproximadamente 156 MB.
- Cabe holgadamente en cualquier GPU consumer (RTX 3060, RTX 4090, GTX 1650, etc.); de hecho la model card usa `device="cuda"` pero el modelo es perfectamente viable en CPU.
- Tambien cabe en dispositivos de borde y en entornos con RAM limitada.
- Opciones de despliegue: `transformers` (pipeline de text-generation), text-generation-inference y endpoints compatibles. No se publican pesos GGUF, por lo que llama.cpp u Ollama requeririan conversion previa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| francesca9805/heb-hebr-10mb-ppt-Dp-10mb-packed-bfdiso_seed3407 | 39.087.104 | no disponible | no disponible | safetensors en HF | Ajuste SFT del base model |
| goldfish-models/heb_hebr_10mb | no disponible | no disponible | no disponible | HF | Modelo base, arquitectura GPT-2, corpus de 10 MB |
| francesca9805/heb-hebr-10mb-ppt-Dp-10mb-packed-bfd_seed455 | no disponible | no disponible | no disponible | HF | Variante del mismo experimento con otra semilla |
| francesca9805/heb-hebr-10mb-ppt-Dp-100mb-packed-bfd_seed3407 | no disponible | no disponible | no disponible | HF | Variante con corpus empaquetado de 100 MB |

No se dispone de datos de rendimiento de ninguno de los modelos comparados en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados, pero un modelo de 39M entrenado con 10 MB de texto hereda los sesgos del corpus sin filtrado conocido.
- Riesgo de alucinacion: muy alto, la coherencia a partir de pocos cientos de tokens es limitada.
- Contexto e idioma: la longitud de contexto no se declara y el soporte multilingue no esta confirmado; el nombre apunta exclusivamente a hebreo.
- Licencia: no disponible, lo que impide verificar si se permite uso comercial. Desaconsejado en produccion hasta aclararlo.
- Trazabilidad del experimento: los fragmentos `ppt`, `Dp`, `packed` y `bfdiso` no se explican en la model card, lo que dificulta reproducir exactamente la configuracion.
- Madurez: 0 descargas y 0 likes en el momento de la consulta; no hay validacion externa.
- Uso en produccion: inadecuado para tareas reales de generacion, atencion al cliente o codigo; su valor es experimental y educativo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francesca9805/heb-hebr-10mb-ppt-Dp-10mb-packed-bfdiso_seed3407
- Modelo base: https://huggingface.co/goldfish-models/heb_hebr_10mb
- Run de Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/f4z62u7g
- Repositorio de TRL: https://github.com/huggingface/trl
- Variante con otra semilla: https://huggingface.co/francesca9805/heb-hebr-10mb-ppt-Dp-10mb-packed-bfd_seed455
- Variante con corpus de 100 MB: https://huggingface.co/francesca9805/heb-hebr-10mb-ppt-Dp-100mb-packed-bfd_seed3407
