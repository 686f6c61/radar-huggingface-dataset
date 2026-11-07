# Minguinho-zeze/Qwen3-8B-NVFP4-RTN-Trace

## Resumen

Qwen3-8B-NVFP4-RTN-Trace es un checkpoint cuantizado del modelo Qwen3-8B de Alibaba, publicado por el usuario Minguinho-zeze como parte del proyecto de investigacion lowbit-reasoning-ptq. El modelo aplica cuantizacion post-entrenamiento NVFP4 (pesos de 4 bits y activaciones de entrada FP4, es decir, W4A4) con tamano de grupo 16 y algoritmo RTN (round-to-nearest). No se realizo entrenamiento adicional sobre el modelo base; se trata, por tanto, de un artefacto de evaluacion para medir el impacto de la cuantizacion de muy bajo bit en capacidades de razonamiento.

El modelo conserva la arquitectura transformer autoregresiva de Qwen3-8B, con 8.190.735.360 parametros totales, y se distribuye en formato compressed-tensors para su uso con vLLM. La fraccion de parametros cuantizados es del 84,8 %; las capas de embedding, normalizacion y `lm_head` se mantienen sin cuantizar. El calibrado se realizo con trazas de razonamiento generadas a partir de problemas de NuminaMath-1.5.

Su relevancia es doble: por un lado, sirve como referencia practica de hasta donde llega la cuantizacion FP4 en un modelo de 8B orientado a razonamiento (con una caida medible en AIME-120 y GPQA Diamond frente al BF16); por otro, documenta de forma reproducible el pipeline de cuantizacion y evaluacion mediante `recipe.yaml`, `quant_meta.json` y un informe publico de metricas por semilla.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autoregresivo (base Qwen3-8B) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion del checkpoint; el ejemplo de carga usa `max_model_len=34816` |
| Tipos de cuantizacion | NVFP4 W4A4, tamano de grupo 16, algoritmo RTN; embedding, normalizacion y `lm_head` sin cuantizar (84,800291 % de parametros cuantizados) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors con compressed-tensors (no es GGUF ni AutoAWQ) |

## Arquitectura y entrenamiento

El checkpoint hereda la arquitectura transformer de Qwen3-8B, que soporta modo de razonamiento explicito (thinking mode) mediante plantilla de chat. Sobre esa base no se aplico ningun tipo de entrenamiento adicional: la unica transformacion es la cuantizacion post-entrenamiento de pesos y activaciones a NVFP4. Los pesos se almacenan en formato compressed-tensors, con la metadata de cuantizacion registrada en `recipe.yaml`, `quant_meta.json` y `config.json`.

El calibrado se construyo con trazas de razonamiento en BF16 generadas a partir de problemas de NuminaMath-1.5, excluyendo la fuente `amc_aime` y filtrando solapamientos de n-gramas de 13 palabras con las preguntas de evaluacion para evitar contaminacion. Se emplearon 128 ventanas de 2.048 tokens con semilla 0. La evaluacion se ejecuto con vLLM 0.32.0, PyTorch 2.13.0, Transformers 5.17.0 y compressed-tensors 0.17.0 sobre GPUs Blackwell (RTX 5090 y RTX PRO 4500), con cache KV en BF16. El autor advierte que no se han validado otras GPUs, kernels ni combinaciones de paquetes.

## Capacidades

- Generacion de texto conversacional y de un solo turno, con plantilla de chat compatible con vLLM.
- Razonamiento multi-paso mediante thinking mode (`enable_thinking=True`), orientado a problemas matematicos y cientificos.
- Razonamiento matematico: el calibrado y la evaluacion se centran en problemas tipo AIME y NuminaMath.
- Razonamiento cientifico de nivel avanzado: evaluado sobre GPQA Diamond.
- Generacion de trazas de razonamiento largas: el protocolo de evaluacion emplea un presupuesto de salida de 32.768 tokens.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada (el modelo base Qwen3 lo soporta, pero este checkpoint no lo documenta).
- Capacidades de agente y multi-step reasoning: no documentadas especificamente para este checkpoint.
- Capacidades multilingues: no disponibles en la informacion del checkpoint.
- Vision y audio: no soportados (modelo exclusivamente de texto).

## Casos de uso

- Evaluacion de robustez de cuantizacion FP4: usar este checkpoint como referencia para medir la degradacion de un modelo de razonamiento de 8B al pasar de BF16 a W4A4, comparando contra el Qwen3-8B original con el mismo protocolo (AIME-120, GPQA Diamond, thinking mode).
- Investigacion en post-training quantization: servir de base reproducible para experimentos con variantes de calibracion, tamanos de grupo o algoritmos (RTN frente a GPTQ/AWQ), ya que el pipeline y los metadatos estan publicados.
- Despliegue de razonamiento matematico en GPUs Blackwell con VRAM limitada: el formato NVFP4 reduce el peso de los pesos a aproximadamente 4 bits por parametro en las capas cuantizadas, lo que permite servir un modelo de 8B con requisitos de memoria notablemente inferiores al BF16 en hardware compatible.
- Generacion de soluciones paso a paso para problemas de competicion: el modo thinking con presupuesto de 32.768 tokens permite producir cadenas de razonamiento largas para problemas de matematicas y ciencia, aceptando la perdida de precision documentada frente al BF16.
- Benchmarking de kernels FP4 en vLLM: el checkpoint esta pensado para ejecutarse con vLLM 0.32.0 y compressed-tensors 0.17.0, por lo que resulta util para validar el rendimiento y la correccion de kernels NVFP4 en Blackwell.
- Filtrado y generacion de datos sinteticos de razonamiento: el modelo puede emplearse para producir trazas de razonamiento a gran escala en entornos donde el coste de memoria es el factor limitante, asumiendo una tasa de acierto inferior a la del modelo BF16.
- Docencia y analisis de errores en modelos cuantizados: comparar las respuestas truncadas o incorrectas de este checkpoint frente al BF16 permite estudiar como afecta la cuantizacion a la longitud y calidad de las cadenas de razonamiento.

## Benchmarks y rendimiento

Precision en porcentaje, promediada sobre las semillas 0, 1 y 2. Cada semilla evalua 120 preguntas de AIME y 198 de GPQA Diamond. Las semillas repetidas son generaciones repetidas de las mismas preguntas, no preguntas nuevas independientes. Thinking mode activado, temperatura 0,6, top-p 0,95, top-k desactivado y presupuesto de salida de 32.768 tokens; las respuestas truncadas se puntuan como incorrectas.

| Modelo | AIME-120 | GPQA Diamond |
|---|---:|---:|
| Qwen3-8B BF16 | 71,39 | 61,11 |
| Este checkpoint (NVFP4 RTN) | 62,78 | 54,55 |

El autor advierte que las ejecuciones se realizaron en RTX 5090 y RTX PRO 4500 Blackwell, que las pequenas diferencias no deben atribuirse solo a los algoritmos y que estas cifras describen este protocolo concreto, no son puntuaciones oficiales de Qwen.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. El repositorio ocupa 6,4 GB en safetensors; con cache KV en BF16 y contexto de hasta 34.816 tokens, el consumo de memoria crece por encima del peso de los pesos.
- GPUs recomendadas: el autor solo valida Blackwell, concretamente RTX 5090 y RTX PRO 4500. No se han validado otras GPUs, kernels ni combinaciones de paquetes.
- Compatibilidad con GPUs de consumo: si, en RTX 5090 (Blackwell) segun el protocolo de evaluacion del autor; no hay datos para generaciones anteriores (Ampere, Ada) ni para GPUs sin soporte de kernels NVFP4.
- Opciones de despliegue: vLLM 0.32.0 con compressed-tensors 0.17.0, PyTorch 2.13.0 y Transformers 5.17.0. No es compatible con llama.cpp, Ollama ni TGI en el formato publicado (no hay GGUF).
- Parametros de motor documentados: `max_model_len=34816`, `gpu_memory_utilization=0.90`, `enable_prefix_caching=False`, `seed=0`.
- Latencia y throughput: no disponibles; el autor remite al informe de metricas de velocidad en el repositorio del proyecto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | AIME-120 | GPQA Diamond | Licencia | Formato |
|---|---|---:|---|---:|---:|---|---|
| Este checkpoint (Qwen3-8B-NVFP4-RTN-Trace) | 8,19 B | no disponible (ejemplo con 34.816) | NVFP4 W4A4, RTN, grupo 16 | 62,78 | 54,55 | Apache-2.0 | compressed-tensors |
| Qwen3-8B BF16 (base) | 8,19 B | no disponible | BF16 | 71,39 | 61,11 | Apache-2.0 | safetensors |
| nvidia/Qwen3-8B-NVFP4 | 8,19 B (base Qwen3-8B) | no disponible | FP4 con TensorRT Model Optimizer | no disponible | no disponible | no disponible en la informacion | no disponible en la informacion |

La comparativa con el checkpoint de NVIDIA es relevante porque aborda la misma tarea (Qwen3-8B en FP4) con una herramienta de cuantizacion distinta; sin embargo, no se han publicado en la informacion disponible resultados de benchmarks de esa variante, por lo que no puede establecerse una comparacion de rendimiento.

## Limitaciones y advertencias

- Degradacion medible frente al BF16: 8,61 puntos menos en AIME-120 y 6,56 puntos menos en GPQA Diamond con el protocolo del autor.
- Las cifras de benchmark son especificas del protocolo (thinking mode, temperatura 0,6, top-p 0,95, 32.768 tokens de salida, semillas 0-2) y no son puntuaciones oficiales de Qwen.
- Las semillas repetidas no constituyen conjuntos de preguntas independientes, lo que limita la interpretacion estadistica de las medias.
- Las respuestas truncadas se puntuan como incorrectas, lo que penaliza al modelo cuantizado si genera cadenas de razonamiento mas largas o divagantes.
- Validacion de hardware muy restringida: solo Blackwell (RTX 5090 y RTX PRO 4500); otras GPUs, kernels y versiones de paquetes no han sido validadas.
- El ejemplo de carga del README no se ha vuelto a ejecutar desde el repositorio subido, segun indica el propio autor.
- No es un release GGUF ni AutoAWQ: no puede desplegarse con llama.cpp, Ollama o TGI en su formato actual.
- Sesgos conocidos: no disponibles en la informacion proporcionada; se heredan los del modelo base Qwen3-8B.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; la cuantizacion agresiva a 4 bits puede incrementar errores en cadenas de razonamiento largas.
- Idiomas soportados: no disponibles en la informacion del checkpoint.
- Licencia Apache-2.0, que permite uso comercial; se incluye el `LICENSE` upstream, pero conviene verificar las condiciones del modelo base Qwen3-8B.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en produccion ni validacion independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Minguinho-zeze/Qwen3-8B-NVFP4-RTN-Trace
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Repositorio del proyecto lowbit-reasoning-ptq: https://github.com/minguinho26/lowbit-reasoning-ptq
- Commit del experimento: https://github.com/minguinho26/lowbit-reasoning-ptq/tree/10509d06fd76ae1bcdd0395965d82aebd95eb2f1
- Informe de metricas por semilla, truncamiento y velocidad: https://github.com/minguinho26/lowbit-reasoning-ptq/tree/main/reports/qwen3-8b-20261107
- Script de configuracion del motor: https://github.com/minguinho26/lowbit-reasoning-ptq/blob/10509d06fd76ae1bcdd0395965d82aebd95eb2f1/src/engine.py
- Variante FP4 de NVIDIA sobre el mismo modelo base: https://huggingface.co/nvidia/Qwen3-8B-NVFP4
