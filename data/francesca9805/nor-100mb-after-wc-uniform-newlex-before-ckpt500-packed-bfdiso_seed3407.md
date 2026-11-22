# francesca9805/nor-100mb-after-wc-uniform-newlex-before-ckpt500-packed-bfdiso_seed3407

## Resumen

El modelo `nor-100mb-after-wc-uniform-newlex-before-ckpt500-packed-bfdiso_seed3407`, publicado por el usuario francesca9805, es un ajuste fino (SFT) de un modelo base del mismo autor, `ppt-wc-uniform-newlex-nor-before-100mb-packed-bfdiso_seed3407`. Se trata de un modelo de generacion de texto de arquitectura GPT-2 con 124.770.816 parametros totales, entrenado con la libreria TRL (version 0.23.0) sobre Transformers 4.56.2. El identificador del modelo sugiere un experimento de investigacion centrado en tokenizadores y en el preentrenamiento sobre un corpus de aproximadamente 100 MB, con variantes de tokenizacion ("uniform-newlex", "packed", "bfdiso") y una semilla fija (3407).

Por su tamano (unos 125 millones de parametros, similar a GPT-2 small) y por la ausencia de documentacion sustantiva en la model card, no debe considerarse un modelo de proposito general ni un candidato para produccion. Es un artefacto de investigacion academica, presumiblemente vinculado a la Universidad de Groningen (segun la organizacion de Weights & Biases referenciada en la model card), util para reproducir experimentos de ajuste supervisado y para estudiar el efecto de decisiones de tokenizacion en modelos pequenos.

La relevancia practica es limitada fuera del ambito de la investigacion en entrenamiento de modelos de lenguaje a pequena escala. No se dispone de informacion sobre licencia, idiomas soportados, composicion del dataset ni resultados de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only, segun el tag `gpt2` de Hugging Face) |
| Parametros totales | 124.770.816 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion estandar de transformers, pero no documentada) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card incluye el campo `licence: license`, sin especificar terminos) |
| Formato de pesos | safetensors |
| Biblioteca | transformers 4.56.2 |
| Framework de entrenamiento | TRL 0.23.0 (SFT), PyTorch 2.11.0, Datasets 4.8.4, Tokenizers 0.22.1 |
| Modelo base | francesca9805/ppt-wc-uniform-newlex-nor-before-100mb-packed-bfdiso_seed3407 |
| Tamano del repositorio | 65,3 GB |
| Descargas | 580 |
| Fecha de creacion | 2026-10-03 |
| Ultima actualizacion | 2026-10-09 |

## Arquitectura y entrenamiento

La arquitectura es GPT-2, un transformer decoder-only con atencion causal completa. Con 124.770.816 parametros, encaja en la escala de GPT-2 small (124 M). El tag `gpt2` en Hugging Face confirma la familia arquitectonica, aunque no se detalla la configuracion exacta de capas, cabezas de atencion ni dimension de embedding.

El entrenamiento se realizo mediante SFT (supervised fine-tuning) con TRL. El modelo parte de un checkpoint previo del mismo autor (`ppt-wc-uniform-newlex-nor-before-100mb-packed-bfdiso_seed3407`), que a su vez parece ser el resultado de un preentrenamiento sobre un corpus de unos 100 MB ("100mb" en el nombre) con un tokenizador especifico ("uniform-newlex"). El sufijo "before-ckpt500" sugiere que el ajuste se realizo sobre un checkpoint intermedio (paso 500) del modelo base, y "bfdiso" podria referirse a una variante de precision o de formato de datos. La semilla 3407 esta fijada para reproducibilidad. No se especifican el numero de tokens de entrenamiento del SFT, la composicion del dataset, ni si hubo etapas de RLHF o DPO (solo SFT). Existe un registro de entrenamiento en Weights & Biases bajo el proyecto "new-tokenizers" de la Universidad de Groningen.

## Capacidades

- Generacion de texto autoregresiva basica, segun el pipeline `text-generation`.
- Formato de chat conversacional: el ejemplo de la model card pasa una lista de mensajes con rol `user`, lo que indica que el tokenizador o la plantilla de chat admite turnos, aunque no se documenta la plantilla exacta.
- No hay evidencia de soporte de tool calling ni function calling.
- No hay evidencia de capacidades de agente o razonamiento multi-paso.
- Capacidades multilingues: no disponibles (no se declaran idiomas).
- No se documentan capacidades especiales (vision, audio, modo thinking).

## Casos de uso

- Reproduccion de experimentos de tokenizacion: el modelo sirve para comparar el efecto de distintos tokenizadores ("uniform-newlex") en el rendimiento de modelos pequenos durante el preentrenamiento y el SFT, gracias a que el checkpoint y la semilla estan fijados.
- Investigacion sobre ajuste supervisado: permite estudiar como varia el comportamiento de un modelo GPT-2 de 124 M tras SFT partiendo de un checkpoint intermedio (paso 500), util para analisis de curvas de aprendizaje.
- Generacion de texto de ejemplo en entornos docentes: con 125 M de parametros cabe en cualquier GPU consumer y sirve para demostrar pipelines de `transformers` y `pipeline("text-generation")` sin coste de infraestructura.
- Pruebas de integracion con text-generation-inference: el tag `text-generation-inference` y `endpoints_compatible` permiten usarlo como modelo de prueba en despliegues TGI o endpoints de Hugging Face antes de pasar a modelos mayores.
- Baseline en estudios de alineacion: al ser un modelo SFT sin RLHF, sirve como referencia para medir la contribucion de etapas posteriores de preferencia (DPO, RLHF) en modelos de la misma escala.
- Analisis de sesgos y calidad en modelos pequenos: util para estudiar que tipo de texto genera un modelo de 124 M entrenado sobre un corpus reducido de 100 MB, como caso de estudio de limitaciones de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en precision completa (fp32) unos 500 MB de pesos; en fp16/bf16 unos 250 MB; en cuantizacion de 8 bits unos 125 MB y en 4 bits unos 65 MB. La VRAM total necesaria depende del contexto y del batch, pero con 125 M de parametros el modelo cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (GTX 1050 Ti, RTX 2060, RTX 3060, RTX 4090). Tambien funciona en CPU para inferencia interactiva.
- Cabe en GPU consumer: si, en practicamente todas las GPU modernas, incluidas las integradas con suficiente memoria compartida.
- Opciones de despliegue: `transformers` (pipeline), text-generation-inference (por los tags), endpoints de Hugging Face. No se documenta soporte explicito de llama.cpp, Ollama o vLLM, aunque al ser GPT-2 podria convertirse a GGUF con las herramientas habituales.
- Latencia y throughput: no disponibles. Por el tamano, se espera un throughput alto (cientos de tokens por segundo en GPU moderna), pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| nor-100mb-after-wc-uniform-newlex-before-ckpt500-packed-bfdiso_seed3407 | 124,77 M | no disponible | no disponible | Hugging Face | SFT sobre GPT-2, experimento de tokenizacion |
| GPT-2 small (OpenAI) | 124 M | 1024 tokens | MIT | Hugging Face, OpenAI | Referencia de la familia; licencia permisiva |
| GPT-2 medium (OpenAI) | 355 M | 1024 tokens | MIT | Hugging Face, OpenAI | Mayor capacidad, misma familia |
| DistilGPT-2 | 82 M | 1024 tokens | Apache 2.0 | Hugging Face | Version destilada, mas rapida |

La comparacion con GPT-2 small es la mas directa por numero de parametros. La diferencia principal es que el modelo de francesca9805 es un artefacto de investigacion sin documentacion de licencia ni evaluacion, mientras que GPT-2 small tiene licencia MIT y amplia literatura de benchmarks.

## Limitaciones y advertencias

- Ausencia total de documentacion sobre el dataset de entrenamiento: no se puede evaluar la calidad, diversidad ni posibles sesgos del corpus.
- Riesgo elevado de alucinacion y de texto incoherente: con 125 M de parametros y un corpus de preentrenamiento de solo 100 MB, la capacidad de generar texto factual y coherente es muy limitada.
- Licencia no especificada: el campo `licence: license` no define terminos, por lo que el uso comercial es juridicamente incierto y no recomendable sin aclaracion del autor.
- Idiomas no declarados: no se puede asumir soporte multilingue ni siquiera un buen rendimiento en ingles.
- Longitud de contexto no documentada: aunque GPT-2 suele usar 1024 tokens, no se confirma para este checkpoint.
- Modelo base a su vez experimental: el checkpoint de partida es otro modelo del mismo autor sin evaluacion publica, lo que encadena la falta de validacion.
- No apto para produccion: sin benchmarks, sin licencia clara y sin garantias de calidad, solo debe usarse en contextos de investigacion y reproduccion.
- El repositorio ocupa 65,3 GB, lo que sugiere que contiene multiples checkpoints o artefactos de entrenamiento ademas de los pesos finales; conviene revisar los archivos antes de descargar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/francesca9805/nor-100mb-after-wc-uniform-newlex-before-ckpt500-packed-bfdiso_seed3407
- Modelo base: https://huggingface.co/francesca9805/ppt-wc-uniform-newlex-nor-before-100mb-packed-bfdiso_seed3407
- Registro de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/zn5x6zjl
- Repositorio de TRL: https://github.com/huggingface/trl
