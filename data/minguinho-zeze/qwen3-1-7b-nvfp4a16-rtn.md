# Minguinho-zeze/Qwen3-1.7B-NVFP4A16-RTN

## Resumen

Qwen3-1.7B-NVFP4A16-RTN es un checkpoint de Qwen3-1.7B sometido a cuantizacion post-entrenamiento (PTQ) de pesos a NVFP4 con activaciones en 16 bits (esquema W4A16), usando cuantizacion por grupo de tamano 16 y el algoritmo RTN (round-to-nearest). Lo publica el usuario Minguinho-zeze como artefacto experimental dentro del proyecto lowbit-reasoning-ptq (run `qwen3-1.7b__nvfp4a16__rtn`), sin entrenamiento adicional. El modelo base es Qwen/Qwen3-1.7B, con 1.720.574.976 parametros y licencia Apache-2.0.

El interes practico es la compresion: los pesos cuantizados representan el 81,9079% de los parametros, mientras que embeddings, capas de normalizacion y `lm_head` se mantienen sin cuantizar. El repo ocupa 1,4 GB en safetensors con formato compressed-tensors, pensado para servirse con vLLM sobre GPUs Blackwell. No es un release GGUF ni AutoAWQ.

La relevancia es doble: por un lado demuestra el pipeline NVFP4 W4A16 para modelos pequenos de razonamiento; por otro, documenta con transparencia la perdida de calidad asociada, con evaluaciones en AIME-120 y GPQA Diamond frente al BF16 original. Es un artefacto de investigacion, no un modelo listo para produccion general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen3-1.7B, no detallada en la model card) |
| Parametros totales | 1.720.574.976 (1,72 B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 34.816 tokens en la configuracion de servido del experimento (`max_model_len`) |
| Tipos de cuantizacion | NVFP4 W4A16, grupo de tamano 16, RTN, pesos en compressed-tensors; 81,9079% de parametros cuantizados |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors); no hay GGUF ni AutoAWQ |

## Arquitectura y entrenamiento

El checkpoint no introduce cambios arquitectonicos: es Qwen3-1.7B, un transformer denso, con los pesos lineales cuantizados a NVFP4 (4 bits) y activaciones BF16, agrupados en bloques de 16 elementos. La cuantizacion es weight-only con RTN, por lo que no se uso conjunto de calibracion (la model card indica explicitamente "Calibration: None"). Embeddings, normalizaciones y `lm_head` quedan en precision original, y la KV cache se mantuvo en BF16 durante la evaluacion. Los metadatos exactos del cuantizador se conservan en `config.json`, `recipe.yaml` y `quant_meta.json`.

No hubo entrenamiento posterior ni ajuste fino, ni RLHF/DPO adicionales sobre el checkpoint base. El entorno de servido registrado es vLLM 0.32.0, PyTorch 2.13.0, Transformers 5.17.0, compressed-tensors 0.17.0 y humming-kernels 0.1.17, sobre GPUs Blackwell; el autor advierte que otras GPUs y combinaciones de paquetes no han sido validadas. Existe un checkpoint hermano, `Qwen3-1.7B-NVFP4-RTN-Trace`, que si emplea calibracion con trazas de razonamiento de NuminaMath-1.5 (128 ventanas de 2.048 tokens, seed 0).

## Capacidades

- Generacion de texto conversacional y de razonamiento, heredadas de Qwen3-1.7B.
- Modo thinking activable mediante `enable_thinking=True` en el chat template; las evaluaciones del autor se hicieron con thinking habilitado.
- Razonamiento matematico y cientifico de nivel competitivo (evaluado en AIME y GPQA Diamond).
- Generacion de codigo y respuesta a instrucciones propias del modelo base (no re-evaluadas en este checkpoint).
- Soporte de tool calling y de agentes multi-paso: no verificado de forma especifica en este checkpoint; se asume el del modelo base, sin garantia del autor.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- No incluye vision ni audio.

## Casos de uso

- Investigacion en cuantizacion de bajo bit: sirve como punto de referencia reproducible para medir la degradacion de un modelo de razonamiento al pasar de BF16 a NVFP4 W4A16 con RTN, usando los mismos 120 problemas de AIME y 198 de GPQA Diamond.
- Servicio de razonamiento en GPUs Blackwell con vLLM: el esquema NVFP4 aprovecha los kernels nativos de cuarta generacion para reducir huella de pesos manteniendo activaciones BF16, adecuado para despliegues con muchas replicas pequenas.
- Generacion de soluciones matematicas paso a paso: con 32.768 tokens de presupuesto de salida y modo thinking, puede producir cadenas de razonamiento largas para problemas de competicion, aceptando la perdida de precision documentada.
- Experimentos de decodificacion y presupuesto de tokens: util para estudiar el efecto de la truncacion en tareas de razonamiento, ya que el autor registra longitudes de token y truncamientos en `eval_results.json`.
- Base para comparativas de algoritmos PTQ: al compartir configuracion con el checkpoint calibrado con trazas, permite aislar el efecto de la calibracion frente al RTN puro.
- Prototipado de asistentes tecnicos en entornos con memoria limitada: el repo de 1,4 GB cabe en GPUs de gama media-alta y permite iterar rapidamente antes de pasar a un modelo mayor.

## Benchmarks y rendimiento

Precision media en porcentaje sobre seeds 0, 1 y 2; cada seed evalua las mismas 120 preguntas de AIME y 198 de GPQA Diamond (repeticiones de generacion, no preguntas nuevas). Thinking activado, temperatura 0,6, top-p 0,95, top-k desactivado, presupuesto de salida de 32.768 tokens; las respuestas truncadas cuentan como incorrectas.

| Modelo | AIME-120 | GPQA Diamond |
|---|---:|---:|
| Qwen3-1.7B BF16 | 40,00 | 40,40 |
| Este checkpoint (NVFP4A16-RTN) | 30,56 | 36,70 |

Caida observada: 9,44 puntos en AIME-120 y 3,70 puntos en GPQA Diamond. El autor indica que los resultados de efecto de factores estan retenidos mientras se investigan incidencias mediante repeticiones, y que no se atribuye la diferencia a ningun algoritmo o metodo de calibracion concreto.

## Requisitos de hardware

- VRAM estimada: el repo pesa 1,4 GB; con KV cache BF16 para 34.816 tokens y margen de ejecucion, el autor configura `gpu_memory_utilization=0.90`, lo que en la practica exige una GPU con al menos 16-24 GB para contexto completo.
- GPUs validadas: exclusivamente Blackwell (el autor no especifica modelos concretos).
- GPUs no validadas: cualquier generacion anterior (Ampere, Ada, Hopper) queda fuera de la validacion del release.
- Consumer GPU: no confirmado; los kernels NVFP4 dependen de hardware Blackwell, por lo que en RTX 40xx o anteriores no hay garantia de funcionamiento.
- Despliegue: vLLM 0.32.0 es la unica ruta documentada, con compressed-tensors 0.17.0, PyTorch 2.13.0, Transformers 5.17.0 y humming-kernels 0.1.17. No hay soporte GGUF, llama.cpp, Ollama ni TGI documentado.
- Latencia y throughput: no disponibles; el autor remite a `eval_results.json` para datos de velocidad, no incluidos en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | AIME-120 | GPQA Diamond | Licencia | Formato |
|---|---|---:|---:|---:|---|---|
| Este checkpoint (NVFP4A16-RTN) | 1,72 B | 34.816 (config. experimento) | 30,56 | 36,70 | Apache-2.0 | safetensors / compressed-tensors |
| Qwen3-1.7B BF16 | 1,72 B | no disponible en esta ficha | 40,00 | 40,40 | Apache-2.0 | safetensors |
| Qwen3-1.7B-NVFP4-RTN-Trace | 1,72 B | 34.816 (config. experimento) | no disponible | no disponible | Apache-2.0 | safetensors / compressed-tensors |

No se dispone de datos de benchmarks de otros modelos comparables de 1-2 B en la informacion proporcionada.

## Limitaciones y advertencias

- Perdida de calidad medible: 9,44 puntos menos en AIME-120 y 3,70 en GPQA Diamond respecto al BF16, con protocolo de evaluacion propio y no oficial de Qwen.
- Las cifras de benchmark describen el protocolo del experimento; las respuestas truncadas al limite de 32.768 tokens se puntuan como incorrectas, lo que penaliza al modelo.
- Validacion restringida a GPUs Blackwell y a un stack de versiones muy concreto; el ejemplo de carga no se ha reejecutado desde la revision subida a Hugging Face.
- Sin calibracion (RTN weight-only), lo que el propio autor no atribuye a ninguna causa concreta en las diferencias observadas.
- Idiomas soportados no declarados; no hay evaluacion multilingue en este checkpoint.
- Riesgo de alucinacion inherente al modelo base, no mitigado ni medido aqui; el modo thinking puede aumentar la longitud de salida y el coste.
- El autor retiene resultados de efecto de factores mientras investiga incidencias, por lo que la caracterizacion del checkpoint esta incompleta.
- Uso comercial permitido por Apache-2.0, pero el checkpoint es un artefacto de investigacion con 0 descargas y 0 likes en el momento de la consulta; sin soporte de la comunidad.
- No hay versiones GGUF ni AutoAWQ, lo que limita el despliegue fuera de vLLM.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Minguinho-zeze/Qwen3-1.7B-NVFP4A16-RTN
- Checkpoint hermano con calibracion: https://huggingface.co/Minguinho-zeze/Qwen3-1.7B-NVFP4-RTN-Trace
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Repositorio del proyecto: https://github.com/minguinho26/lowbit-reasoning-ptq
- Resultados completos de evaluacion: https://github.com/minguinho26/lowbit-reasoning-ptq/tree/main/reports/qwen3-1.7b-20261108
- Configuracion del motor de inferencia: https://github.com/minguinho26/lowbit-reasoning-ptq/blob/a851e3957297eaa52d0344a50bd0bbc7e87d5378/src/engine.py
