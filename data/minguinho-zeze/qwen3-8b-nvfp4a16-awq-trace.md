# Minguinho-zeze/Qwen3-8B-NVFP4A16-AWQ-Trace

## Resumen

Qwen3-8B-NVFP4A16-AWQ-Trace es una cuantizacion post-entrenamiento (PTQ) del modelo Qwen3-8B de Alibaba Qwen, publicada por el usuario Minguinho-zeze como parte del proyecto de investigacion lowbit-reasoning-ptq. El checkpoint aplica cuantizacion de pesos NVFP4 (4 bits en formato FP4 de NVIDIA) con activaciones en 16 bits (esquema W4A16), usando el algoritmo AWQ sobre un group size de 16. No se realizo entrenamiento adicional: es exclusivamente un artefacto de compresion orientado a reducir huella de memoria en inferencia.

El modelo hereda la arquitectura transformer densa de Qwen3-8B, con 8.190.735.360 parametros totales y aproximadamente 6,4 GB de pesos en el repositorio. La relevancia de esta ficha es doble: por un lado, demuestra que la cuantizacion a 4 bits en formato NVFP4 es viable en GPUs Blackwell manteniendo una precision cercana al modelo BF16 en tareas de razonamiento matematico y cientifico; por otro, documenta un protocolo de evaluacion reproducible con semillas multiples sobre AIME-120 y GPQA Diamond.

El checkpoint esta pensado para servirse con vLLM 0.32.0 sobre GPUs Blackwell (RTX 5090 y RTX PRO 4500), y su licencia Apache-2.0 permite uso comercial. No es un release GGUF ni AutoAWQ: usa el formato compressed-tensors, lo que limita su portabilidad a stacks de inferencia que soporten dicho formato.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-8B), pesos cuantizados NVFP4 (W4A16) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la model card; el ejemplo de carga usa max_model_len=34816 |
| Tipos de cuantizacion | NVFP4 pesos (4 bits) + activaciones 16 bits; group size 16; algoritmo AWQ; fraccion de parametros cuantizados 84,80 %; embeddings, normalizacion y lm_head sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors con compressed-tensors (no GGUF, no AutoAWQ) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-8B: un transformer denso de 8,19 mil millones de parametros. Sobre esa base, este checkpoint aplica cuantizacion PTQ sin entrenamiento posterior. Los pesos se almacenan en NVFP4 con group size 16 y las activaciones permanecen en 16 bits (W4A16). El 84,800291 % de los parametros estan cuantizados; las capas de embedding, normalizacion y `lm_head` se mantienen en precision completa. La KV cache se uso en BF16 durante la evaluacion.

La calibracion se realizo con trazas de razonamiento generadas por el propio Qwen3-8B en BF16 a partir de problemas de NuminaMath-1.5, excluyendo la fuente amc_aime y filtrando solapamientos de n-gramas de 13 palabras con las preguntas de evaluacion. Se emplearon 128 ventanas de 2.048 tokens con semilla 0. El entorno de referencia fue vLLM 0.32.0, PyTorch 2.13.0, Transformers 5.17.0 y compressed-tensors 0.17.0 sobre GPUs Blackwell. La receta exacta y los metadatos estan en `recipe.yaml`, `quant_meta.json` y `config.json`.

## Capacidades

- Generacion de texto y conversacion multi-turno heredadas de Qwen3-8B.
- Razonamiento matematico y cientifico en modo thinking (la evaluacion se hizo con `enable_thinking=True`).
- Modo thinking activable mediante `chat_template_kwargs={"enable_thinking": True}`.
- Razonamiento de varios pasos con presupuesto de salida amplio (hasta 32.768 tokens en la evaluacion).
- Generacion de codigo e instrucciones generales (capacidades del modelo base Qwen3-8B).
- Tool calling y function calling: no documentado especificamente en esta model card; disponible en el modelo base segun su model card upstream.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- No se documentan capacidades de vision ni audio.

## Casos de uso

- Razonamiento matematico en produccion: el checkpoint mantiene 71,11 % en AIME-120 frente a 71,39 % del BF16, por lo que sirve para resolver problemas de competicion o verificacion matematica con menor huella de VRAM que el modelo original.
- Evaluacion cientifica asistida: con 58,42 % en GPQA Diamond, es adecuado para tareas de pregunta-respuesta de nivel graduado donde el coste por token importa y se tolera una perdida de ~2,7 puntos respecto a BF16.
- Servicio de inferencia con vLLM en GPUs Blackwell: al usar compressed-tensors y NVFP4, se integra en despliegues vLLM con `max_model_len=34816` y `gpu_memory_utilization=0.90`, reduciendo el espacio de pesos frente al BF16.
- Generacion de cadenas de razonamiento largas: con presupuesto de salida de 32.768 tokens y modo thinking, es util para pipelines de auto-verificacion o sintesis de soluciones paso a paso.
- Reproduccion de investigacion en cuantizacion: el repositorio incluye receta, metadatos y scripts, lo que permite replicar el protocolo de evaluacion con semillas 0, 1 y 2 sobre AIME-120 y GPQA Diamond.
- Despliegue en estaciones con RTX 5090 o RTX PRO 4500: son las GPUs validadas por el autor para esta combinacion de kernels y versiones, lo que encaja en entornos de laboratorio o prototipado con hardware consumer/prosumer Blackwell.
- Fine-tuning o destilacion sobre base cuantizada: no recomendado directamente, pero el checkpoint puede servir como referencia de calidad para comparar variantes PTQ.

## Benchmarks y rendimiento

Precision en porcentaje, promediada sobre semillas 0, 1 y 2. Cada semilla evalua 120 preguntas de AIME y 198 de GPQA Diamond. Modo thinking activado, temperatura 0,6, top-p 0,95, top-k desactivado, presupuesto de salida de 32.768 tokens. Las respuestas truncadas se puntuan como incorrectas.

| Modelo | AIME-120 | GPQA Diamond |
|---|---:|---:|
| Qwen3-8B BF16 | 71,39 | 61,11 |
| Este checkpoint (NVFP4A16-AWQ) | 71,11 | 58,42 |

El autor advierte que las ejecuciones se hicieron en RTX 5090 y RTX PRO 4500 Blackwell y que las diferencias pequenas no deben atribuirse solo a los algoritmos. Estas cifras describen el protocolo del autor y no son puntuaciones oficiales de Qwen.

## Requisitos de hardware

- VRAM estimada para pesos: ~6,4 GB en el repositorio (NVFP4 con group size 16); a esto hay que sumar KV cache en BF16 y overhead de vLLM.
- GPUs validadas por el autor: RTX 5090 y RTX PRO 4500 Blackwell. Otras GPUs, kernels y combinaciones de paquetes no han sido validadas por este release.
- Cabe en GPUs consumer Blackwell con suficiente VRAM para KV cache; el ejemplo oficial usa `gpu_memory_utilization=0.90` y `max_model_len=34816`.
- Despliegue: vLLM 0.32.0 con compressed-tensors 0.17.0, PyTorch 2.13.0 y Transformers 5.17.0. No es compatible con llama.cpp, Ollama ni AutoAWQ al no ser GGUF ni formato AutoAWQ.
- Para INT2 el experimento anade el directorio de NVRTC de CUDA a `LD_LIBRARY_PATH` antes de la compilacion JIT de Humming (humming-kernels 0.1.17); este checkpoint concreto es NVFP4, no INT2.
- Latencia y throughput: no disponibles en la informacion proporcionada; el autor remite a los informes del repositorio para metricas de velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | AIME-120 | GPQA Diamond | Licencia | Formato |
|---|---|---:|---:|---:|---|---|
| Este checkpoint (NVFP4A16-AWQ) | 8,19 B | no disponible (ejemplo: 34.816) | 71,11 | 58,42 | Apache-2.0 | safetensors / compressed-tensors |
| Qwen3-8B BF16 | 8,19 B | no disponible | 71,39 | 61,11 | Apache-2.0 | safetensors |
| Qwen3-8B (upstream, sin cuantizar) | 8,19 B | no disponible | no disponible en esta ficha | no disponible en esta ficha | Apache-2.0 | safetensors |

No se dispone de datos de benchmarks de otras variantes cuantizadas (GGUF, AWQ clasico, GPTQ) en la informacion proporcionada para establecer una comparativa adicional.

## Limitaciones y advertencias

- Perdida de precision respecto a BF16: -0,28 puntos en AIME-120 y -2,69 puntos en GPQA Diamond segun el protocolo del autor; puede afectar a tareas cientificas sensibles.
- Validacion limitada: solo se probo en GPUs Blackwell con versiones concretas de vLLM, PyTorch, Transformers y compressed-tensors; otros entornos no estan validados.
- Formato no portable: no es GGUF ni AutoAWQ, por lo que no funciona en llama.cpp, Ollama ni herramientas que no soporten compressed-tensors.
- El ejemplo de carga del README no se ha reejecutado desde el repositorio subido, segun el propio autor.
- Riesgo de alucinacion y sesgos: no documentados especificamente en esta model card; heredados del modelo base Qwen3-8B.
- Idiomas soportados no declarados en la informacion disponible.
- Longitud de contexto oficial del checkpoint no declarada; el valor 34.816 procede solo del ejemplo de carga.
- Uso comercial permitido por Apache-2.0, pero conviene revisar la licencia upstream de Qwen3-8B y los terminos del proyecto lowbit-reasoning-ptq.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en produccion por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Minguinho-zeze/Qwen3-8B-NVFP4A16-AWQ-Trace
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Repositorio del proyecto lowbit-reasoning-ptq: https://github.com/minguinho26/lowbit-reasoning-ptq
- Commit de referencia del experimento: https://github.com/minguinho26/lowbit-reasoning-ptq/tree/10509d06fd76ae1bcdd0395965d82aebd95eb2f1
- Informes de evaluacion (semillas, truncamiento, velocidad): https://github.com/minguinho26/lowbit-reasoning-ptq/tree/main/reports/qwen3-8b-20261107
- Script de configuracion del motor: https://github.com/minguinho26/lowbit-reasoning-ptq/blob/10509d06fd76ae1bcdd0395965d82aebd95eb2f1/src/engine.py
- Repositorio oficial Qwen3: https://github.com/QwenLM/Qwen3
