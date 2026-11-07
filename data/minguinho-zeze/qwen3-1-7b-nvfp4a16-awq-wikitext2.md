# Minguinho-zeze/Qwen3-1.7B-NVFP4A16-AWQ-WikiText2

## Resumen

Qwen3-1.7B-NVFP4A16-AWQ-WikiText2 es un checkpoint cuantizado a partir del modelo base Qwen3-1.7B de Alibaba Qwen, publicado por el usuario Minguinho-zeze dentro del proyecto lowbit-reasoning-ptq. No se trata de un modelo nuevo ni de un reentrenamiento: es una cuantizacion post-entrenamiento con pesos NVFP4 (4 bits) y activaciones de 16 bits (W4A16), con tamano de grupo 16 y algoritmo AWQ. El objetivo del autor es medir el impacto de la cuantizacion de baja precision en tareas de razonamiento, por eso el checkpoint se publica junto a un protocolo de evaluacion sobre AIME-120 y GPQA Diamond.

El modelo hereda la arquitectura y las capacidades del Qwen3-1.7B original (transformer denso de 1.720.574.976 parametros, licencia Apache-2.0), pero con un 81,9079 % de los parametros cuantizados; las capas de embedding, normalizacion y `lm_head` se mantienen sin cuantizar. Los pesos usan el formato compressed-tensors y la libreria declarada es vLLM, lo que limita el ecosistema de despliegue frente a las versiones GGUF o AutoAWQ.

Su relevancia es experimental y acotada: sirve para estudiar la degradacion de rendimiento al pasar de BF16 a NVFP4 en un modelo pequeno con modo thinking activado. Los resultados publicados muestran una caida notable en AIME-120 (de 40,00 a 29,44 puntos porcentuales) y mas moderada en GPQA Diamond (de 40,40 a 36,03), siempre segun el protocolo del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-1.7B) |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la model card; la configuracion de ejemplo de vLLM usa `max_model_len=34816` |
| Tipos de cuantizacion | NVFP4 W4A16, group size 16, algoritmo AWQ; 81,9079 % de parametros cuantizados |
| Idiomas soportados | no disponible (la model card no los enumera; hereda los del modelo base) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors con compressed-tensors (no es GGUF ni AutoAWQ) |

## Arquitectura y entrenamiento

El checkpoint parte de Qwen3-1.7B, un transformer denso de aproximadamente 1,72 mil millones de parametros. No se realizo entrenamiento adicional: la model card indica explicitamente "No additional training was performed". La unica transformacion es la cuantizacion post-entrenamiento a NVFP4 en pesos con activaciones BF16, tamano de grupo 16 y AWQ como algoritmo de cuantizacion. Embedding, capas de normalizacion y `lm_head` quedan fuera del proceso de cuantizacion. La KV cache se mantuvo en BF16 durante la evaluacion.

La calibracion se hizo con texto de entrenamiento raw de WikiText-2: 128 ventanas de 2.048 tokens con semilla 0. Los pesos se empaquetan con compressed-tensors y las versiones exactas de quantizer y configuracion se conservan en `config.json`, `recipe.yaml` y `quant_meta.json`. El entorno de serving registrado por el autor es vLLM 0.32.0, PyTorch 2.13.0, Transformers 5.17.0, compressed-tensors 0.17.0 y humming-kernels 0.1.17, sobre GPUs Blackwell; el autor advierte que otras GPUs y combinaciones de paquetes no han sido validadas.

## Capacidades

- Generacion de texto conversacional y continuacion de texto, heredadas del modelo base Qwen3-1.7B.
- Modo thinking: la evaluacion se ejecuta con `enable_thinking=True` y un presupuesto de salida de 32.768 tokens, lo que permite cadenas de razonamiento largas.
- Razonamiento matematico y cientifico: el checkpoint esta evaluado especificamente en AIME-120 y GPQA Diamond.
- Capacidades del modelo base Qwen3 (instrucciones, codigo, tool calling) potencialmente presentes, aunque la model card de esta cuantizacion no las verifica ni las documenta.
- Capacidades multilingues: no documentadas en esta model card; dependen del modelo base.
- No se declaran capacidades de vision ni audio.

## Casos de uso

- Investigacion sobre cuantizacion de baja precision: el checkpoint sirve como punto de comparacion controlado frente a Qwen3-1.7B en BF16 para medir la perdida de exactitud en tareas de razonamiento con modo thinking.
- Reproduccion de experimentos de PTQ: los ficheros `recipe.yaml`, `quant_meta.json` y `eval_results.json` permiten replicar el pipeline de AWQ + NVFP4 sobre otros modelos del mismo proyecto.
- Despliegue de bajo coste en GPUs Blackwell: al ocupar el repositorio 1,4 GB y usar kernels NVFP4, encaja en escenarios donde el ahorro de memoria y el throughput importan mas que la precision absoluta.
- Evaluacion comparativa de protocolos: util para estudiar como afecta la truncacion de respuestas (el autor puntua como incorrectas las truncadas) a las metricas de razonamiento.
- Prototipado de asistentes conversacionales con cadenas de pensamiento largas, siempre que se acepte la degradacion medida en AIME y GPQA.
- Docencia y formacion en tecnicas de cuantizacion: ejemplo real de W4A16 con group size 16 y de las diferencias entre formatos compressed-tensors, GGUF y AutoAWQ.

## Benchmarks y rendimiento

Resultados publicados por el autor, media de exactitud en porcentaje sobre las semillas 0, 1 y 2, con modo thinking activado, temperatura 0,6, top-p 0,95, top-k desactivado y presupuesto de salida de 32.768 tokens. Las respuestas truncadas se puntuan como incorrectas. El autor advierte que estas cifras describen su protocolo experimental y no son resultados oficiales de Qwen.

| Modelo | AIME-120 | GPQA Diamond |
|---|---:|---:|
| Qwen3-1.7B BF16 | 40,00 | 40,40 |
| Este checkpoint (NVFP4A16 + AWQ) | 29,44 | 36,03 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de latencia o throughput.

## Requisitos de hardware

- VRAM estimada: el repositorio pesa 1,4 GB, por lo que los pesos cuantizados caben holgadamente en GPUs consumer; a ello hay que sumar la KV cache en BF16 y el margen de activaciones. La configuracion de ejemplo usa `gpu_memory_utilization=0.90` con `max_model_len=34816`.
- GPUs recomendadas: el autor solo valida GPUs Blackwell (familia RTX 50xx, B100/B200) por el soporte de kernels NVFP4; otras arquitecturas no han sido validadas.
- Cabe en GPU consumer: si, en principio, en cualquier GPU Blackwell con suficiente VRAM para el contexto configurado; en GPUs anteriores el soporte NVFP4 no esta garantizado.
- Opciones de despliegue: vLLM 0.32.0 con compressed-tensors 0.17.0 y humming-kernels 0.1.17. No hay version GGUF, por lo que llama.cpp y Ollama no son opciones directas; tampoco es un release AutoAWQ.
- Latencia y throughput: no disponibles en la informacion proporcionada; el autor remite a `eval_results.json` y a los informes del repositorio para datos de velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | AIME-120 | GPQA Diamond | Licencia | Formato |
|---|---|---:|---:|---:|---|---|
| Este checkpoint (NVFP4A16 + AWQ) | 1,72 B | no disponible (ejemplo vLLM: 34.816) | 29,44 | 36,03 | Apache-2.0 | safetensors / compressed-tensors |
| Qwen3-1.7B BF16 | 1,72 B | no disponible en la informacion | 40,00 | 40,40 | Apache-2.0 | safetensors |
| Qwen3-Instruct-2507 | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion con datos numericos disponible es contra el modelo base en BF16. Para alternativas cuantizadas del mismo tamano no hay cifras publicadas en la informacion proporcionada.

## Limitaciones y advertencias

- Degradacion medible del razonamiento: la caida en AIME-120 es de unos 10,6 puntos porcentuales y en GPQA Diamond de unos 4,4 puntos respecto a BF16, segun el protocolo del autor.
- El autor retiene los resultados de efecto de factores y su interpretacion mientras investiga incidencias adicionales; no atribuye la diferencia a ningun algoritmo o metodo de calibracion concreto.
- Compatibilidad limitada: solo se ha validado en GPUs Blackwell con un stack de versiones muy especifico (vLLM 0.32.0, PyTorch 2.13.0, Transformers 5.17.0, compressed-tensors 0.17.0, humming-kernels 0.1.17). Otros entornos pueden no funcionar.
- No hay version GGUF ni AutoAWQ, lo que excluye llama.cpp, Ollama y buena parte del ecosistema consumer habitual.
- El ejemplo de carga no se ha reejecutado desde la revision subida a Hugging Face, segun admite el autor.
- Las metricas se calculan sobre 120 preguntas AIME y 198 preguntas GPQA repetidas con tres semillas; las semillas no son conjuntos independientes, lo que limita la interpretacion estadistica.
- Riesgo de alucinacion y sesgos: no documentados en esta model card; se heredan los del modelo base Qwen3-1.7B, que no se describen aqui.
- Idiomas soportados no documentados; no se debe asumir cobertura multilingue sin verificacion.
- Licencia Apache-2.0 heredada del modelo base, que permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento del checkpoint cuantizado en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Minguinho-zeze/Qwen3-1.7B-NVFP4A16-AWQ-WikiText2
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Repositorio del proyecto lowbit-reasoning-ptq: https://github.com/minguinho26/lowbit-reasoning-ptq
- Informes de evaluacion del checkpoint: https://github.com/minguinho26/lowbit-reasoning-ptq/tree/main/reports/qwen3-1.7b-20261108
- Snapshot de evaluacion (revision a851e395): https://github.com/minguinho26/lowbit-reasoning-ptq/tree/a851e3957297eaa52d0344a50bd0bbc7e87d5378
- Script de motor y configuracion exacta: https://github.com/minguinho26/lowbit-reasoning-ptq/blob/a851e3957297eaa52d0344a50bd0bbc7e87d5378/src/engine.py
- Repositorio QwenLM/Qwen3: https://github.com/QwenLM/Qwen3
