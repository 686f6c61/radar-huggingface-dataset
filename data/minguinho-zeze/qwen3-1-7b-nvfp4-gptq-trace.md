# Minguinho-zeze/Qwen3-1.7B-NVFP4-GPTQ-Trace

## Resumen

Qwen3-1.7B-NVFP4-GPTQ-Trace es un checkpoint cuantizado del modelo Qwen3-1.7B de Alibaba Qwen, publicado por el usuario Minguinho-zeze como parte del proyecto de investigación lowbit-reasoning-ptq. No se trata de un modelo nuevo: es un experimento de cuantización post-entrenamiento (PTQ) que aplica GPTQ sobre los pesos y las activaciones de entrada en formato NVFP4 (W4A4), con tamaño de grupo 16, dejando sin cuantizar el embedding, las capas de normalización y el `lm_head`. La fracción de parámetros cuantizados es del 81,9079% y los pesos se empaquetan con compressed-tensors.

El modelo hereda la arquitectura y las capacidades del Qwen3-1.7B original (transformer denso de 1.720.574.976 parámetros), pero su interés no está en el rendimiento bruto sino en documentar el coste de precisión de una cuantización agresiva a 4 bits en pesos y activaciones sobre tareas de razonamiento. El autor publica resultados comparativos frente al modelo base en BF16 sobre AIME-120 y GPQA Diamond, con una caída notable de exactitud, y advierte explícitamente de que las conclusiones sobre causas se retienen mientras se investigan.

Es relevante ahora porque NVFP4 es un formato de precisión de 4 bits con escala por bloque pensado para las GPU Blackwell de NVIDIA, y este checkpoint sirve como referencia práctica de qué se gana (huella de memoria y velocidad teórica) y qué se pierde (precisión en matemáticas y ciencia) al desplegar un modelo pequeño de razonamiento en ese formato. El repo ocupa 1,4 GB y está pensado para servirse con vLLM, no como GGUF ni AutoAWQ.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-1.7B, sin MoE) |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada; el ejemplo de servicio usa `max_model_len=34816` |
| Tipos de cuantizacion | NVFP4 pesos y activaciones de entrada (W4A4), group size 16, GPTQ; embedding, norm y `lm_head` sin cuantizar; KV cache en BF16 durante la evaluacion |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors con compressed-tensors (no GGUF, no AutoAWQ) |

## Arquitectura y entrenamiento

El checkpoint no incluye entrenamiento adicional: es una cuantizacion post-entrenamiento del Qwen3-1.7B original, un transformer denso de 1,7 mil millones de parametros. La receta aplica GPTQ para obtener pesos NVFP4 y activaciones de entrada FP4 (W4A4) con tamaño de grupo 16, manteniendo en precision completa el embedding, las capas de normalizacion y el `lm_head`. Los pesos se serializan con compressed-tensors y el paquete incluye `config.json`, `recipe.yaml` y `quant_meta.json` con los ajustes exactos y las versiones del cuantizador.

La calibracion se realizo con trazas de razonamiento generadas por el propio Qwen3-1.7B en BF16 a partir de NuminaMath-1.5, excluyendo la fuente `amc_aime` y filtrando solapamientos de n-gramas de 13 palabras con las preguntas de evaluacion. Se usaron 128 ventanas de 2.048 tokens con semilla 0. El entorno de servicio registrado es vLLM 0.32.0, PyTorch 2.13.0, Transformers 5.17.0, compressed-tensors 0.17.0 y humming-kernels 0.1.17, sobre GPU Blackwell; el autor indica que otras GPU y combinaciones de paquetes no han sido validadas.

## Capacidades

- Generacion de texto y conversacion multi-turno, heredadas del Qwen3-1.7B base.
- Razonamiento en modo thinking: el ejemplo de uso activa `enable_thinking=True` mediante `chat_template_kwargs`.
- Razonamiento matematico y cientifico, evaluado sobre AIME-120 y GPQA Diamond.
- Generacion de codigo y soporte de tool calling: no disponible en la informacion proporcionada para este checkpoint concreto; depende de las capacidades del modelo base.
- Capacidades multilingues: no disponible.
- Capacidades de vision o audio: no disponibles (el checkpoint es solo de texto).
- No se documentan capacidades de agente ni multi-step reasoning especificas mas alla del modo thinking.

## Casos de uso

- Investigacion sobre cuantizacion de bajo bit: el checkpoint sirve como punto de comparacion reproducible (semillas 0, 1 y 2, mismas 120 preguntas de AIME y 198 de GPQA Diamond) para medir la perdida de exactitud de NVFP4 W4A4 frente a BF16 en tareas de razonamiento.
- Despliegue con vLLM en hardware Blackwell: al estar empaquetado con compressed-tensors y validado con vLLM 0.32.0, encaja en pipelines de serving que ya usan ese stack y quieren reducir la huella de pesos de un modelo de 1,7B.
- Prototipado de asistentes conversacionales de bajo coste: el modelo mantiene la generacion de texto y el modo thinking del base, con un repo de 1,4 GB facil de mover entre entornos de prueba.
- Evaluacion de robustez de kernels FP4: util para validar humming-kernels y el soporte NVFP4 de vLLM en Blackwell antes de adoptarlos en produccion con modelos mayores.
- Generacion de cadenas de razonamiento para destilacion o sintesis de datos: el modo thinking con presupuesto de 32.768 tokens permite producir trazas largas, aunque con menor fiabilidad que el modelo BF16.
- Benchmarking interno de infraestructura: comparar latencia y throughput de W4A4 frente a BF16 en el mismo modelo y hardware, usando los registros de velocidad incluidos en `eval_results.json` y en el repositorio de informes.

## Benchmarks y rendimiento

Resultados publicados por el autor: exactitud media en porcentaje sobre las semillas 0, 1 y 2; cada semilla evalua las mismas 120 preguntas de AIME y 198 de GPQA Diamond (las semillas repetidas son generaciones repetidas, no preguntas nuevas). Modo thinking activado, temperatura 0,6, top-p 0,95, top-k desactivado y presupuesto de salida de 32.768 tokens; las respuestas truncadas se puntuan como incorrectas.

| Modelo | AIME-120 | GPQA Diamond |
|---|---:|---:|
| Qwen3-1.7B BF16 | 40,00 | 40,40 |
| Este checkpoint (NVFP4 W4A4 GPTQ) | 29,44 | 33,33 |

El autor advierte de que estas cifras describen su protocolo experimental y no son resultados oficiales de Qwen, y de que los resultados sobre efectos de factores se retienen mientras se investigan mediante repeticiones.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo pesa 1,4 GB en safetensors; a esa cifra hay que sumar la KV cache en BF16 y el overhead de vLLM. El ejemplo de servicio fija `gpu_memory_utilization=0.90` y `max_model_len=34816`, sin cifra absoluta de VRAM publicada.
- GPU recomendadas: el autor solo valida GPU Blackwell (NVFP4 requiere ese hardware para los kernels nativos). Otras GPU y combinaciones de paquetes no han sido validadas por esta release.
- GPU de consumo: no disponible; no se documenta compatibilidad con RTX 4090 u otras consumer, y el formato NVFP4 no es nativo en generaciones anteriores a Blackwell.
- Opciones de despliegue: vLLM 0.32.0 con compressed-tensors 0.17.0 y humming-kernels 0.1.17; no es un release GGUF ni AutoAWQ, por lo que llama.cpp, Ollama y TGI no estan soportados segun la informacion disponible.
- Latencia y throughput: no se publican cifras en la model card; el autor remite a `eval_results.json` y a los informes del repositorio para longitudes de tokens, truncamiento y velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | AIME-120 | GPQA Diamond | Licencia | Formato |
|---|---|---:|---:|---:|---|---|
| Qwen3-1.7B-NVFP4-GPTQ-Trace (este) | 1,72B | no disponible (ejemplo: 34.816) | 29,44 | 33,33 | Apache-2.0 | safetensors / compressed-tensors |
| Qwen3-1.7B BF16 (base) | 1,72B | no disponible | 40,00 | 40,40 | Apache-2.0 | safetensors |
| Minguinho-zeze/Qwen3-1.7B-NVFP4A16-GPTQ-Trace | 1,72B | no disponible | no disponible | no disponible | Apache-2.0 | safetensors / compressed-tensors |

La variante NVFP4A16 del mismo autor mantiene las activaciones en 16 bits (W4A16) con el mismo algoritmo GPTQ y group size 16, pero no publica resultados de benchmarks en la informacion disponible. No se han identificado otras alternativas comparables en la busqueda realizada.

## Limitaciones y advertencias

- Perdida de precision medible: entre 10,56 y 7,07 puntos porcentuales menos que el modelo BF16 en AIME-120 y GPQA Diamond respectivamente, con el protocolo del autor.
- El autor no atribuye la caida a un algoritmo o metodo de calibracion concreto y retiene la interpretacion de los efectos de factores mientras investiga.
- Validado unicamente en GPU Blackwell con vLLM 0.32.0 y las versiones de paquetes indicadas; otras GPU y combinaciones no estan validadas.
- No es un release GGUF ni AutoAWQ: no se puede usar con llama.cpp, Ollama o TGI.
- El ejemplo de carga de la model card no se ha vuelto a ejecutar desde la revision subida a Hugging Face.
- Sesgos conocidos: no disponible en la informacion proporcionada; se heredan los del Qwen3-1.7B base, no documentados aqui.
- Riesgo de alucinacion: no cuantificado; el modo thinking con presupuesto de 32.768 tokens puede producir respuestas truncadas, que el protocolo de evaluacion puntua como incorrectas.
- Idiomas soportados: no disponible.
- Licencia Apache-2.0, que permite uso comercial; se incluye el `LICENSE` upstream en el repo. El checkpoint es un experimento de investigacion y no una release de produccion.

## Enlaces

- Hugging Face: https://huggingface.co/Minguinho-zeze/Qwen3-1.7B-NVFP4-GPTQ-Trace
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Repositorio del proyecto: https://github.com/minguinho26/lowbit-reasoning-ptq
- Revision del snapshot de evaluacion: https://github.com/minguinho26/lowbit-reasoning-ptq/tree/a851e3957297eaa52d0344a50bd0bbc7e87d5378
- Configuracion del motor de inferencia: https://github.com/minguinho26/lowbit-reasoning-ptq/blob/a851e3957297eaa52d0344a50bd0bbc7e87d5378/src/engine.py
- Informes de evaluacion: https://github.com/minguinho26/lowbit-reasoning-ptq/tree/main/reports/qwen3-1.7b-20261108
- Variante W4A16 del mismo autor: https://huggingface.co/Minguinho-zeze/Qwen3-1.7B-NVFP4A16-GPTQ-Trace
