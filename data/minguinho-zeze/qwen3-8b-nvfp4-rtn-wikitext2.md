# Minguinho-zeze/Qwen3-8B-NVFP4-RTN-WikiText2

## Resumen

Qwen3-8B-NVFP4-RTN-WikiText2 es un checkpoint cuantizado a 4 bits en formato NVFP4 del modelo Qwen3-8B de Alibaba Qwen, publicado por el usuario Minguinho-zeze como parte del proyecto de investigación lowbit-reasoning-ptq. No se trata de un modelo entrenado desde cero ni de un ajuste fino: es una cuantización post-entrenamiento (PTQ) que aplica el algoritmo RTN (round-to-nearest) con pesos NVFP4 y activaciones de entrada FP4 (esquema W4A4), con un tamaño de grupo de 16. El objetivo del experimento es medir cuánto degrada la cuantización agresiva a 4 bits las capacidades de razonamiento del modelo base.

El checkpoint conserva la arquitectura, el tokenizador y la plantilla de chat del Qwen3-8B original, con 8.190.735.360 parámetros totales y un 84,8 % de los parámetros cuantizados; las capas de embedding, normalización y `lm_head` se mantienen sin cuantizar. El repositorio ocupa 6,4 GB y usa el formato compressed-tensors, pensado para su carga en vLLM sobre GPUs Blackwell.

Su relevancia es doble: por un lado, ofrece una referencia reproducible de cuantización NVFP4 con calibración en WikiText-2 y evaluación en AIME-120 y GPQA Diamond; por otro, documenta explícitamente la pérdida de precisión frente al BF16 (unos 11 puntos en AIME y 4 en GPQA Diamond), lo que resulta útil para quien evalúe desplegar Qwen3-8B en hardware de baja precisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), pesos cuantizados NVFP4 con compressed-tensors |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion (el ejemplo de carga usa `max_model_len=34816`) |
| Tipos de cuantizacion | NVFP4 en pesos y activaciones de entrada (W4A4), grupo de 16, RTN; embedding, normalizacion y `lm_head` sin cuantizar; KV cache en BF16 durante la evaluacion |
| Idiomas soportados | no disponible en la informacion del repositorio (heredados del Qwen3-8B base, no listados) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors con compressed-tensors (no GGUF, no AutoAWQ) |

## Arquitectura y entrenamiento

El modelo base Qwen3-8B es un transformer decoder-only denso de unos 8.200 millones de parametros, con atencion causal estandar y modo de razonamiento explicito ("thinking mode") activable mediante la plantilla de chat. Este checkpoint no introduce cambios arquitectonicos: sustituye las matrices de pesos y las activaciones de entrada por representaciones NVFP4 (formato de coma flotante de 4 bits con escala por grupo), manteniendo en BF16 las capas de embedding, normalizacion y la cabeza de salida.

No se realizo entrenamiento adicional. La cuantizacion es PTQ con el algoritmo RTN, sin optimizacion tipo GPTQ o AWQ, aplicada con un tamano de grupo de 16. La calibracion uso texto de entrenamiento raw de WikiText-2, con 128 ventanas de 2.048 tokens y semilla 0. El experimento se ejecuto con vLLM 0.32.0, PyTorch 2.13.0, Transformers 5.17.0 y compressed-tensors 0.17.0 sobre GPUs Blackwell (RTX 5090 y RTX PRO 4500). La receta exacta, las versiones del cuantizador y los metadatos estan en `recipe.yaml`, `quant_meta.json` y `config.json` del repositorio.

## Capacidades

- Generacion de texto y conversacion multi-turno, heredadas del Qwen3-8B base.
- Razonamiento explicito en modo thinking, activable con `chat_template_kwargs={"enable_thinking": True}`.
- Razonamiento matematico y resolucion de problemas de competicion (evaluado en AIME-120).
- Razonamiento cientifico de nivel graduado (evaluado en GPQA Diamond).
- Generacion de codigo y soporte de tool calling / function calling, segun las capacidades del modelo base (no verificadas especificamente en este checkpoint cuantizado).
- Capacidades multilingues del modelo base (no documentadas en este repositorio).
- No se documentan capacidades de vision ni de audio en este checkpoint.

## Casos de uso

- Evaluacion de cuantizacion NVFP4 en produccion: sirve como referencia para medir la perdida de precision de un esquema W4A4 con RTN frente al BF16 en tareas de razonamiento, usando el mismo protocolo de AIME-120 y GPQA Diamond.
- Despliegue de razonamiento matematico en GPUs Blackwell: el checkpoint esta pensado para vLLM sobre RTX 5090 o RTX PRO 4500, con un presupuesto de salida de hasta 32.768 tokens, adecuado para cadenas de razonamiento largas.
- Prototipado de asistentes conversacionales con modo thinking: la plantilla de chat de Qwen3 permite alternar entre respuestas directas y razonamiento paso a paso segun la carga.
- Investigacion en compresion de modelos: el repositorio incluye receta, metadatos del cuantizador y metricas por semilla, lo que facilita reproducir o comparar variantes (por ejemplo, otros algoritmos de PTQ o tamanos de grupo).
- Generacion de codigo asistida en pipelines internos: al mantener la cabeza de salida y las capas de normalizacion en BF16, conserva parte de la fidelidad del modelo base para tareas de generacion estructurada.
- Benchmarking de infraestructura: util para medir throughput y latencia de vLLM con kernels NVFP4 en comparacion con el checkpoint BF16.

## Benchmarks y rendimiento

Resultados publicados por el autor, en porcentaje de acierto, promediados sobre las semillas 0, 1 y 2 (120 preguntas AIME y 198 de GPQA Diamond por semilla; las semillas repetidas son generaciones repetidas de las mismas preguntas, no preguntas nuevas). Modo thinking activado, temperatura 0,6, top-p 0,95, top-k desactivado, presupuesto de salida de 32.768 tokens; las respuestas truncadas se puntuan como incorrectas.

| Modelo | AIME-120 | GPQA Diamond |
|---|---:|---:|
| Qwen3-8B BF16 | 71,39 | 61,11 |
| Este checkpoint (NVFP4 RTN) | 60,56 | 57,24 |

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 6,4 GB en safetensors; en vLLM hay que sumar la KV cache en BF16 y el overhead del runtime. Con `max_model_len=34816` y `gpu_memory_utilization=0.90` el ejemplo del autor asume una GPU con holgura suficiente.
- GPU recomendadas: el autor valido el checkpoint en RTX 5090 y RTX PRO 4500 Blackwell. Los kernels NVFP4 de vLLM requieren arquitectura Blackwell; otras GPUs, kernels y combinaciones de paquetes no han sido validadas por esta release.
- GPU de consumo: si, en principio en RTX 5090 (Blackwell). En generaciones anteriores (Ada, Ampere) no hay validacion documentada de los kernels NVFP4.
- Opciones de despliegue: vLLM 0.32.0 con compressed-tensors 0.17.0, PyTorch 2.13.0 y Transformers 5.17.0. No es un release GGUF ni AutoAWQ, por lo que llama.cpp, Ollama y TGI no estan soportados de forma directa.
- Latencia y throughput: no disponibles en la informacion proporcionada; el autor remite a los informes del repositorio para metricas de velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (Qwen3-8B NVFP4 RTN) | 8,19 B | no disponible (ejemplo con 34.816) | NVFP4 W4A4, RTN | Apache-2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3-8B | ~8,2 B | no disponible en la informacion | BF16 | Apache-2.0 | Hugging Face (modelo base) |
| nvidia/Qwen3-8B-NVFP4 | ~8,2 B | no disponible en la informacion | NVFP4 | no disponible en la informacion | Hugging Face |

La comparacion de rendimiento solo puede hacerse contra el BF16 del mismo modelo base, con los datos de la tabla de benchmarks. No se dispone de resultados publicados de nvidia/Qwen3-8B-NVFP4 en la informacion proporcionada.

## Limitaciones y advertencias

- Perdida de precision medible: 10,83 puntos menos en AIME-120 y 3,87 puntos menos en GPQA Diamond respecto al BF16, con el protocolo del autor.
- El checkpoint no ha sido revalidado desde el repositorio subido: el ejemplo de carga sigue la ruta del experimento original y no se ha vuelto a ejecutar.
- Solo validado en GPUs Blackwell con versiones concretas de vLLM, PyTorch, Transformers y compressed-tensors; otras combinaciones pueden fallar o dar resultados distintos.
- No es un release GGUF ni AutoAWQ: no se puede usar directamente con llama.cpp, Ollama o TGI.
- Riesgo de alucinacion y sesgos: no evaluados en este checkpoint; se heredan los del Qwen3-8B base, no documentados aqui.
- Cobertura idiomatica no documentada en el repositorio; conviene verificar el comportamiento en castellano antes de un despliegue en produccion.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso comunitario ni de validacion independiente.
- Licencia Apache-2.0, que permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento del checkpoint cuantizado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Minguinho-zeze/Qwen3-8B-NVFP4-RTN-WikiText2
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Proyecto lowbit-reasoning-ptq: https://github.com/minguinho26/lowbit-reasoning-ptq
- Commit del experimento: https://github.com/minguinho26/lowbit-reasoning-ptq/tree/10509d06fd76ae1bcdd0395965d82aebd95eb2f1
- Informes de evaluacion: https://github.com/minguinho26/lowbit-reasoning-ptq/tree/main/reports/qwen3-8b-20261107
- Configuracion del motor: https://github.com/minguinho26/lowbit-reasoning-ptq/blob/10509d06fd76ae1bcdd0395965d82aebd95eb2f1/src/engine.py
- Checkpoint NVFP4 de NVIDIA para Qwen3-8B: https://huggingface.co/nvidia/Qwen3-8B-NVFP4
