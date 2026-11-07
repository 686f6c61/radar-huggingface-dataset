# Minguinho-zeze/Qwen3-1.7B-NVFP4A16-AWQ-Trace

## Resumen

Qwen3-1.7B-NVFP4A16-AWQ-Trace es un checkpoint cuantizado del modelo Qwen3-1.7B de Alibaba, publicado por el usuario Minguinho-zeze como parte del proyecto experimental lowbit-reasoning-ptq. Se trata de una cuantizacion post-entrenamiento en formato NVFP4 (4 bits) para los pesos con activaciones de 16 bits (W4A16), aplicada mediante el algoritmo AWQ y empaquetada con compressed-tensors para su uso en vLLM. No se realizo entrenamiento adicional: el checkpoint es unicamente el resultado de aplicar cuantizacion sobre los pesos BF16 originales.

El modelo base Qwen3-1.7B es un transformer denso de aproximadamente 1.720 millones de parametros, orientado a generacion de texto, razonamiento y conversacion, con soporte de modo thinking. Esta version cuantizada mantiene las capas de embedding, normalizacion y `lm_head` sin cuantizar, y cuantiza el 81,9079% de los parametros. El objetivo declarado es estudiar el efecto de la cuantizacion de baja precision sobre el razonamiento matematico y cientifico.

La relevancia de esta ficha es doble: por un lado, ofrece una via para ejecutar Qwen3-1.7B con menor huella de memoria en GPUs Blackwell mediante NVFP4; por otro, sirve como evidencia empirica preliminar de la degradacion que la cuantizacion W4A16 puede introducir en tareas de razonamiento (AIME-120 y GPQA Diamond). Es un artefacto experimental, no un release oficial de Qwen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3) |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la model card; el ejemplo de despliegue usa `max_model_len=34816` y un presupuesto de salida de 32.768 tokens |
| Tipos de cuantizacion | NVFP4 pesos (4 bits) con activaciones de 16 bits (W4A16), group size 16, algoritmo AWQ; embedding, normalizacion y `lm_head` sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con compressed-tensors (no es GGUF ni AutoAWQ) |

## Arquitectura y entrenamiento

El modelo base Qwen3-1.7B es un transformer denso de la familia Qwen3. Esta publicacion no entrena ni afina el modelo: aplica cuantizacion post-entrenamiento de tipo weight-only (W4A16) con el algoritmo AWQ sobre los pesos BF16. Los pesos se almacenan en NVFP4 con grupo de cuantizacion de tamano 16, mientras que las activaciones permanecen en 16 bits durante la inferencia. Las capas de embedding, normalizacion y la cabeza de salida `lm_head` se mantienen en precision completa para preservar la calidad de la representacion.

La calibracion se realizo con trazas de razonamiento generadas por el propio Qwen3-1.7B en BF16 a partir del dataset NuminaMath-1.5, excluyendo la fuente `amc_aime` y filtrando solapamientos de n-gramas de 13 palabras con las preguntas de evaluacion. Se emplearon 128 ventanas de 2.048 tokens con semilla 0. El checkpoint se exporto desde la revision `a851e3957297eaa52d0344a50bd0bbc7e87d5378` del repositorio lowbit-reasoning-ptq. No se documentan innovaciones arquitectonicas propias; la novedad es el pipeline de cuantizacion y evaluacion.

## Capacidades

- Generacion de texto y conversacion multi-turno, heredadas del modelo base Qwen3-1.7B.
- Razonamiento con modo thinking habilitable mediante `enable_thinking=True` en el chat template.
- Razonamiento matematico y cientifico, evaluado en AIME-120 y GPQA Diamond.
- Generacion de codigo y matematicas basicas (capacidades del modelo base, no revalidadas en esta ficha).
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada para este checkpoint.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible (los idiomas no se documentan en la model card).
- Capacidades de vision o audio: no disponibles (modelo de texto).

## Casos de uso

- Evaluacion de cuantizacion en razonamiento: usar este checkpoint como contrapunto cuantizado del Qwen3-1.7B BF16 para medir la perdida de precision en AIME y GPQA bajo el mismo protocolo de decodificacion (temperatura 0,6, top-p 0,95, presupuesto de 32.768 tokens).
- Despliegue en GPUs Blackwell con vLLM: aprovechar los kernels NVFP4 y compressed-tensors para servir Qwen3-1.7B con menor uso de VRAM que la version BF16, usando la configuracion de ejemplo de la model card.
- Prototipado de asistentes conversacionales de bajo coste: el modelo conserva la plantilla de chat de Qwen3 y el modo thinking, adecuado para entornos de desarrollo donde la huella de memoria es limitante.
- Investigacion en PTQ: servir como referencia reproducible (semillas, ventanas de calibracion y metadatos en `quant_meta.json`) para estudiar el efecto de AWQ con NVFP4 en modelos pequenos de razonamiento.
- Generacion de trazas de razonamiento para calibracion: el propio pipeline documentado genera trazas BF16 desde NuminaMath-1.5, reutilizable para calibrar otras variantes de cuantizacion.
- Comparativa de algoritmos de cuantizacion: junto con la variante GPTQ del mismo autor, permite contrastar AWQ frente a GPTQ en el mismo modelo base y protocolo de evaluacion.

## Benchmarks y rendimiento

Resultados publicados en la model card. Precision media en porcentaje sobre las semillas 0, 1 y 2; cada semilla evalua las mismas 120 preguntas de AIME y 198 de GPQA Diamond (generaciones repetidas, no preguntas independientes). Modo thinking activado, temperatura 0,6, top-p 0,95, top-k desactivado y presupuesto de salida de 32.768 tokens. Las respuestas truncadas se puntuan como incorrectas.

| Modelo | AIME-120 | GPQA Diamond |
|---|---:|---:|
| Qwen3-1.7B BF16 | 40,00 | 40,40 |
| Este checkpoint (NVFP4A16-AWQ) | 30,83 | 36,70 |

El autor indica que estos resultados describen el protocolo del experimento y no son resultados oficiales de Qwen. Los resultados de efecto de factores se retienen mientras se investigan incidencias adicionales mediante repeticiones, y la publicacion no atribuye las diferencias observadas a ningun algoritmo o metodo de calibracion concreto.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 1,4 GB en disco, lo que da una cota inferior del peso de los parametros cuantizados; el consumo real en inferencia depende de la KV cache (BF16 en la evaluacion) y del `max_model_len` configurado.
- GPU recomendadas: el autor documenta el uso de GPUs Blackwell con vLLM 0.32.0, PyTorch 2.13.0, Transformers 5.17.0, compressed-tensors 0.17.0 y humming-kernels 0.1.17; otras GPUs y combinaciones de paquetes no han sido validadas por esta publicacion.
- GPU de consumo: no disponible; el soporte de NVFP4 depende de kernels especificos y el autor no confirma compatibilidad con GPUs consumer.
- Opciones de despliegue: vLLM es la unica via documentada; no es un release GGUF ni AutoAWQ, por lo que llama.cpp, Ollama y TGI no estan soportados segun la informacion disponible.
- Latencia y throughput: no disponibles en la model card; el autor remite a `eval_results.json` y a los informes del repositorio para datos de velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | AIME-120 | GPQA Diamond | Licencia | Formato |
|---|---|---:|---:|---:|---|---|
| Este checkpoint (NVFP4A16-AWQ) | 1,72 B | no disponible | 30,83 | 36,70 | Apache 2.0 | safetensors + compressed-tensors |
| Qwen3-1.7B BF16 | 1,72 B | no disponible | 40,00 | 40,40 | Apache 2.0 | safetensors |
| Qwen3-1.7B-NVFP4A16-GPTQ-Trace | 1,72 B | no disponible | no disponible | no disponible | Apache 2.0 | safetensors + compressed-tensors |

La comparativa se limita a las variantes del mismo modelo base documentadas en la busqueda. No se dispone de datos de benchmarks de la variante GPTQ en la informacion proporcionada.

## Limitaciones y advertencias

- Degradacion medible en razonamiento: la precision cae de 40,00 a 30,83 en AIME-120 y de 40,40 a 36,70 en GPQA Diamond respecto al BF16, segun el protocolo del autor.
- Resultados experimentales: las cifras no son oficiales de Qwen y el autor retiene el analisis de causas mientras investiga incidencias mediante repeticiones.
- Compatibilidad limitada: validado solo con vLLM 0.32.0 y GPUs Blackwell; otras GPUs y versiones de paquetes no han sido verificadas.
- No es GGUF ni AutoAWQ: no puede cargarse con llama.cpp, Ollama ni herramientas que esperen esos formatos.
- Idiomas no documentados: la model card no especifica el conjunto de idiomas soportados.
- Riesgo de alucinacion: inherente al modelo base; no se han publicado evaluaciones de fidelidad en esta publicacion.
- Sesgos: no se documentan analisis de sesgo especificos para este checkpoint.
- Trazabilidad: el ejemplo de carga de la model card no se ha reejecutado desde la revision subida a Hugging Face, segun advierte el propio autor.
- Uso comercial: la licencia Apache 2.0 del modelo base se incluye en `LICENSE`, pero la publicacion no aporta garantias adicionales sobre el checkpoint cuantizado.

## Enlaces

- Checkpoint en Hugging Face: https://huggingface.co/Minguinho-zeze/Qwen3-1.7B-NVFP4A16-AWQ-Trace
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Repositorio del proyecto lowbit-reasoning-ptq: https://github.com/minguinho26/lowbit-reasoning-ptq
- Revision de origen de la evaluacion: https://github.com/minguinho26/lowbit-reasoning-ptq/tree/a851e3957297eaa52d0344a50bd0bbc7e87d5378
- Informes completos de evaluacion: https://github.com/minguinho26/lowbit-reasoning-ptq/tree/main/reports/qwen3-1.7b-20261108
- Configuracion del motor de inferencia: https://github.com/minguinho26/lowbit-reasoning-ptq/blob/a851e3957297eaa52d0344a50bd0bbc7e87d5378/src/engine.py
- Variante GPTQ del mismo autor: https://huggingface.co/Minguinho-zeze/Qwen3-1.7B-NVFP4A16-GPTQ-Trace
