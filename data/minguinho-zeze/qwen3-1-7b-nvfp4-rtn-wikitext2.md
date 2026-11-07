# Minguinho-zeze/Qwen3-1.7B-NVFP4-RTN-WikiText2

## Resumen

Qwen3-1.7B-NVFP4-RTN-WikiText2 es un checkpoint cuantizado del modelo Qwen3-1.7B de Alibaba Qwen, publicado por el usuario Minguinho-zeze como artefacto de un experimento de cuantizacion post-entrenamiento (PTQ) de baja precision. No se trata de un modelo nuevo entrenado desde cero, sino de una conversion de los pesos originales en BF16 a formato NVFP4 (4 bits de peso y 4 bits de activacion, W4A4) mediante el algoritmo RTN (round-to-nearest) y calibracion con texto de WikiText-2. El resultado conserva la arquitectura y el conocimiento del modelo base, pero reduce drasticamente el espacio de almacenamiento y el ancho de banda de memoria necesario para inferencia.

El modelo base Qwen3-1.7B es un transformer decoder-only denso de aproximadamente 1.720 millones de parametros, con soporte de modo razonamiento (thinking mode), tool calling y contexto largo. Este checkpoint mantiene esas capacidades funcionales, aunque la cuantizacion agresiva a 4 bits introduce una perdida de precision medible: en el protocolo del autor, la exactitud en AIME-120 cae del 40,00 % al 22,78 % y en GPQA Diamond del 40,40 % al 33,33 % respecto al BF16. Es, por tanto, un artefacto de investigacion para evaluar el impacto de NVFP4 en tareas de razonamiento, no un modelo listo para produccion general.

Su relevancia actual es doble: por un lado, documenta de forma reproducible (con revisiones, semillas y scripts) el coste en calidad de la cuantizacion FP4 en modelos pequenos; por otro, sirve como referencia tecnica para quienes despliegan modelos Qwen3 en GPUs Blackwell con vLLM y quieren valorar el compromiso entre memoria y rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen3) |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada (el ejemplo de despliegue usa max_model_len=34816) |
| Tipos de cuantizacion | NVFP4 W4A4, group size 16, RTN; embedding, normalizacion y lm_head sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors con compressed-tensors (no GGUF, no AutoAWQ) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3-1.7B original: un transformer decoder-only denso con atencion por cabezas agrupadas (GQA) y las innovaciones propias de la familia Qwen3, incluido el modo de razonamiento explicito (thinking mode) activable via plantilla de chat. No se ha realizado entrenamiento adicional: el checkpoint es exclusivamente el resultado de una cuantizacion post-entrenamiento. La fraccion de parametros cuantizados es del 81,9079 %; las capas de embedding, normalizacion y la cabeza de salida (`lm_head`) permanecen en mayor precision, y la KV cache se mantiene en BF16 durante la evaluacion.

El proceso de cuantizacion emplea NVFP4 con pesos y activaciones de entrada a 4 bits (W4A4), tamano de grupo 16 y el algoritmo RTN, sin busqueda de escalas ni optimizacion tipo GPTQ/AWQ. La calibracion se hizo con texto de entrenamiento raw de WikiText-2: 128 ventanas de 2.048 tokens con semilla 0. Los pesos se empaquetan con compressed-tensors. El autor indica que los resultados sobre el efecto de factores (algoritmo, calibracion) se han retenido mientras se investigan incidencias mediante reejecuciones, y que esta release no atribuye las diferencias de puntuacion a ninguna causa concreta.

## Capacidades

- Generacion de texto conversacional y de un solo turno, con plantilla de chat compatible con vLLM.
- Razonamiento multi-paso mediante thinking mode (`enable_thinking=True`), con presupuesto de salida configurable (hasta 32.768 tokens en el protocolo de evaluacion).
- Resolucion de problemas matematicos y cientificos, con degradacion notable respecto al BF16 en tareas de alta dificultad.
- Generacion de codigo y respuesta a preguntas de conocimiento general, heredadas del modelo base.
- Soporte de tool calling y function calling (capacidad del Qwen3-1.7B original; no validada especificamente en este checkpoint).
- Capacidades multilingues del modelo base (idiomas no documentados en esta ficha).
- No incluye vision ni audio: es un modelo exclusivamente de texto.

## Casos de uso

- Investigacion sobre cuantizacion FP4: reproducir el experimento del autor con las semillas y scripts publicados para medir la perdida de exactitud de NVFP4 RTN frente a BF16 en tareas de razonamiento.
- Despliegue en GPUs Blackwell con vLLM: servir el modelo con el stack documentado (vLLM 0.32.0, PyTorch 2.13.0, compressed-tensors 0.17.0, humming-kernels 0.1.17) para validar el rendimiento de kernels FP4 nativos.
- Prototipado de asistentes conversacionales de bajo coste: con 1,4 GB de repo y pesos a 4 bits, cabe en memorias muy limitadas y permite iterar rapidamente en entornos de desarrollo.
- Evaluacion comparativa de pipelines PTQ: usar el checkpoint como linea base para contrastar RTN frente a otros algoritmos (GPTQ, AWQ) o calibraciones alternativas sobre el mismo modelo base.
- Generacion de texto en entornos con restricciones de ancho de banda: el formato W4A4 reduce el trafico de memoria, util en inferencia por lotes pequenos donde el modelo esta limitado por memoria.
- Docencia y formacion tecnica: ejemplo reproducible de cuantizacion post-entrenamiento con artefactos de configuracion (`recipe.yaml`, `quant_meta.json`) y resultados de evaluacion detallados.

## Benchmarks y rendimiento

Resultados publicados por el autor (exactitud media en porcentaje sobre semillas 0, 1 y 2; mismas 120 preguntas AIME y 198 preguntas GPQA Diamond por semilla). Thinking mode activado, temperatura 0,6, top-p 0,95, top-k desactivado, presupuesto de salida de 32.768 tokens; las respuestas truncadas se puntuan como incorrectas.

| Modelo | AIME-120 | GPQA Diamond |
|---|---:|---:|
| Qwen3-1.7B BF16 | 40,00 | 40,40 |
| Este checkpoint (NVFP4 RTN) | 22,78 | 33,33 |

El autor advierte que estas cifras describen su protocolo experimental y no son resultados oficiales de Qwen.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo ocupa 1,4 GB, por lo que los pesos en FP4 caben holgadamente en GPUs consumer; a ello hay que sumar la KV cache en BF16 y el overhead de vLLM (el ejemplo usa `gpu_memory_utilization=0.90`).
- GPU recomendadas: el autor solo ha validado el checkpoint en GPUs Blackwell (arquitectura que soporta NVFP4 de forma nativa). Otras GPUs y combinaciones de paquetes no han sido validadas por esta release.
- Cabe en GPU consumer: si, en terminos de pesos, aunque la validacion oficial se limita a Blackwell.
- Opciones de despliegue: vLLM (unica via documentada y validada); no es un release GGUF ni AutoAWQ, por lo que llama.cpp, Ollama y formatos equivalentes no estan soportados por esta publicacion.
- Latencia y throughput: no disponibles en la informacion proporcionada; el autor remite a `eval_results.json` y a los informes completos para datos de velocidad y longitud de tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3-1.7B-NVFP4-RTN-WikiText2 (este) | 1,72 B | no disponible | safetensors + compressed-tensors (W4A4) | Apache-2.0 | AIME-120 22,78; GPQA 33,33; solo vLLM/Blackwell |
| Qwen3-1.7B (BF16) | 1,72 B | no disponible | safetensors (BF16) | Apache-2.0 | AIME-120 40,00; GPQA 40,40; referencia de calidad |
| Alternativas cuantizadas de Qwen3-1.7B (GGUF/AWQ) | 1,72 B | no disponible | GGUF, AWQ | Apache-2.0 | No evaluadas en la informacion disponible |

## Limitaciones y advertencias

- Perdida de exactitud significativa: caida de 17,22 puntos en AIME-120 y 7,07 puntos en GPQA Diamond respecto al BF16 en el protocolo del autor.
- Validacion limitada a GPUs Blackwell y a un stack concreto de versiones (vLLM 0.32.0, PyTorch 2.13.0, Transformers 5.17.0, compressed-tensors 0.17.0, humming-kernels 0.1.17); otros entornos no han sido validados.
- El ejemplo de carga no se ha reejecutado sobre la revision subida a Hugging Face, segun el propio autor.
- No es compatible con GGUF ni AutoAWQ, lo que excluye llama.cpp, Ollama y la mayoria de herramientas de inferencia en local.
- Riesgo de alucinacion y sesgos: heredados del modelo base Qwen3-1.7B; no se documentan evaluaciones de sesgo especificas para este checkpoint.
- Idiomas soportados no documentados en esta ficha; conviene verificar el comportamiento multilingue antes de usarlo en produccion.
- Los resultados de evaluacion usan repeticiones de las mismas preguntas por semilla, no conjuntos independientes, lo que limita la interpretacion estadistica.
- El autor retiene el analisis del efecto de factores (algoritmo y calibracion) y no atribuye las diferencias de puntuacion a ninguna causa; no debe citarse como evidencia de que RTN o WikiText-2 sean superiores o inferiores a otras opciones.
- Licencia Apache-2.0: permite uso comercial, pero al ser un artefacto de investigacion sin garantias de calidad, no se recomienda para produccion sin una evaluacion propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Minguinho-zeze/Qwen3-1.7B-NVFP4-RTN-WikiText2
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Repositorio del experimento (lowbit-reasoning-ptq): https://github.com/minguinho26/lowbit-reasoning-ptq
- Revision del snapshot de evaluacion: https://github.com/minguinho26/lowbit-reasoning-ptq/tree/a851e3957297eaa52d0344a50bd0bbc7e87d5378
- Informes completos de resultados: https://github.com/minguinho26/lowbit-reasoning-ptq/tree/main/reports/qwen3-1.7b-20261108
- Script del motor de inferencia: https://github.com/minguinho26/lowbit-reasoning-ptq/blob/a851e3957297eaa52d0344a50bd0bbc7e87d5378/src/engine.py
