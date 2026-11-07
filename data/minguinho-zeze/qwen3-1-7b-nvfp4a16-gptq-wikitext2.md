# Minguinho-zeze/Qwen3-1.7B-NVFP4A16-GPTQ-WikiText2

## Resumen

Qwen3-1.7B-NVFP4A16-GPTQ-WikiText2 es un checkpoint cuantizado del modelo Qwen3-1.7B de Alibaba Qwen, publicado por el usuario Minguinho-zeze como parte del proyecto lowbit-reasoning-ptq. No se trata de un modelo nuevo entrenado desde cero, sino de una compresión post-entrenamiento (PTQ) que convierte los pesos originales a FP4 (NVFP4) manteniendo las activaciones en 16 bits, con el objetivo de reducir el uso de memoria y acelerar la inferencia en hardware Blackwell.

El modelo conserva la arquitectura y las capacidades del Qwen3-1.7B original: un transformer denso de 1.720.574.976 parámetros con modo de razonamiento (thinking mode) activable. La cuantización se realizó con el algoritmo GPTQ, grupo de tamaño 16, y deja sin cuantizar los embeddings, las capas de normalización y el `lm_head`, lo que representa un 81,9 % de parámetros efectivamente cuantizados.

Su relevancia es doble: por un lado, demuestra el uso de NVFP4 en vLLM con compressed-tensors sobre hardware Blackwell; por otro, publica una evaluación controlada del impacto de la cuantización en tareas de razonamiento (AIME-120 y GPQA Diamond). Es un artefacto de investigación, no un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen3-1.7B) |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 34.816 tokens en la configuracion de ejemplo (vLLM); contexto nativo del base no confirmado en esta ficha |
| Tipos de cuantizacion | NVFP4 pesos (W4A16), grupo de tamano 16, GPTQ; embeddings, norm y lm_head sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors); no GGUF ni AutoAWQ |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Qwen3-1.7B original: un transformer denso con atención estándar, entrenado por Alibaba Qwen. Este checkpoint no ha recibido entrenamiento adicional; es una cuantización post-entrenamiento (PTQ) del modelo base. La receta aplica GPTQ para producir pesos NVFP4 (4 bits, formato de coma flotante de NVIDIA) con activaciones de 16 bits, agrupando los pesos en bloques de 16. Se mantienen en precisión completa los embeddings, las capas de normalización y el `lm_head`, que representan aproximadamente el 18,1 % restante de los parámetros.

La calibración se realizó con texto de entrenamiento de WikiText-2 (raw), usando 128 ventanas de 2.048 tokens con semilla 0. Durante la evaluación el KV cache se mantuvo en BF16. Los pesos se empaquetan con la librería compressed-tensors y el modelo se sirve con vLLM. El entorno registrado por el autor es vLLM 0.32.0, PyTorch 2.13.0, Transformers 5.17.0, compressed-tensors 0.17.0 y humming-kernels 0.1.17, sobre GPUs Blackwell. El autor advierte que otras GPUs y combinaciones de paquetes no han sido validadas.

## Capacidades

- Generación de texto conversacional y de un solo turno, heredada del Qwen3-1.7B base.
- Razonamiento en modo thinking: el chat template acepta `enable_thinking=True`, lo que activa la cadena de razonamiento antes de la respuesta.
- Resolución de problemas matemáticos y de razonamiento científico (evaluado en AIME-120 y GPQA Diamond).
- Generación de código y tareas de instrucción generales propias del modelo base.
- Soporte de tool calling y function calling: no disponible en la información proporcionada para este checkpoint cuantizado.
- Capacidades de agente multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponibles (el modelo base es solo texto).

## Casos de uso

- Evaluación de cuantización NVFP4: el checkpoint sirve como referencia reproducible para medir la degradación de precisión al pasar de BF16 a W4A16 en tareas de razonamiento, con protocolo documentado (semillas 0, 1 y 2, 120 preguntas AIME y 198 de GPQA Diamond).
- Investigación en PTQ de modelos pequeños: permite comparar la receta GPTQ con grupo 16 frente a otras técnicas (AWQ, SmoothQuant, INT4) sobre el mismo modelo base, usando WikiText-2 como calibración estándar.
- Despliegue en GPUs Blackwell con vLLM: el formato compressed-tensors y los kernels Humming permiten servir el modelo con menor huella de memoria que la versión BF16, útil en entornos con VRAM limitada.
- Prototipado de asistentes de razonamiento en local: con 1,7 mil millones de parámetros y pesos de 4 bits, el modelo cabe en GPUs de consumo y permite experimentar con thinking mode sin infraestructura grande.
- Pruebas de regresión de pipelines de inferencia: al ser un checkpoint pequeño y con evaluación publicada, sirve para validar versiones de vLLM, PyTorch o compressed-tensors detectando cambios en la calidad de salida.
- Docencia y experimentación con cuantización de bajo bit: el repositorio incluye `recipe.yaml`, `quant_meta.json` y resultados de evaluación, lo que facilita reproducir el flujo completo en un curso o laboratorio.

## Benchmarks y rendimiento

Resultados publicados por el autor (precisión media en porcentaje sobre semillas 0, 1 y 2; mismas 120 preguntas AIME y 198 de GPQA Diamond por semilla; thinking mode activado, temperatura 0,6, top-p 0,95, presupuesto de salida de 32.768 tokens; las respuestas truncadas cuentan como incorrectas):

| Modelo | AIME-120 | GPQA Diamond |
|---|---:|---:|
| Qwen3-1.7B BF16 | 40,00 | 40,40 |
| Este checkpoint (NVFP4A16-GPTQ) | 29,72 | 35,19 |

El autor señala que estas cifras describen su protocolo experimental y no son resultados oficiales de Qwen. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 1,4 GB en safetensors; con overhead de activaciones, KV cache en BF16 y contexto largo, se recomienda al menos 8-12 GB de VRAM para el ejemplo de 34.816 tokens de contexto.
- GPU recomendadas: el autor solo valida GPUs Blackwell (por ejemplo, RTX 50xx o B200) con vLLM 0.32.0 y humming-kernels 0.1.17. Otras GPUs no han sido validadas.
- GPU de consumo: por tamaño, el modelo debería caber en GPUs de consumo con suficiente VRAM, pero el soporte de NVFP4 depende del hardware y de los kernels; no está confirmado para arquitecturas anteriores a Blackwell.
- Opciones de despliegue: vLLM es la vía documentada. No hay release en GGUF ni AutoAWQ, por lo que llama.cpp, Ollama y TGI no están soportados de forma nativa según la model card.
- Latencia y throughput: no disponibles en la información proporcionada; el autor remite a `eval_results.json` y a los informes del repositorio para métricas de velocidad.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | AIME-120 | GPQA Diamond | Licencia | Formato |
|---|---|---:|---:|---:|---|---|
| Este checkpoint | 1,72 B | 34.816 (config. de ejemplo) | 29,72 | 35,19 | Apache-2.0 | safetensors NVFP4A16 |
| Qwen3-1.7B BF16 | 1,72 B | no disponible en esta ficha | 40,00 | 40,40 | Apache-2.0 | safetensors BF16 |
| Qwen3-1.7B-NVFP4A16-GPTQ-Trace | 1,72 B | no disponible | no disponible | no disponible | Apache-2.0 | safetensors NVFP4A16 |

La variante Trace del mismo autor comparte receta de cuantización pero usa otro conjunto de calibración; no se han publicado sus resultados en la información disponible.

## Limitaciones y advertencias

- Pérdida de precisión medible: frente al BF16, el checkpoint baja de 40,00 a 29,72 en AIME-120 y de 40,40 a 35,19 en GPQA Diamond, una degradación notable en razonamiento matemático.
- El autor retiene los resultados de análisis de factores (efecto del algoritmo y de la calibración) mientras investiga problemas mediante repeticiones; no atribuye las diferencias a ninguna causa concreta.
- Soporte de hardware restringido: validado solo en GPUs Blackwell con versiones específicas de vLLM, PyTorch, Transformers, compressed-tensors y humming-kernels; otras combinaciones no están verificadas.
- El ejemplo de carga no se ha vuelto a ejecutar desde la revisión subida a Hugging Face.
- Sin release en GGUF ni AutoAWQ, lo que limita el despliegue en ecosistemas como llama.cpp u Ollama.
- Idiomas soportados no documentados para este checkpoint; conviene remitirse a la model card del Qwen3-1.7B base.
- Riesgo de alucinación y sesgos: no documentados específicamente para este checkpoint; hereda los del modelo base, no evaluados aquí.
- Uso comercial: la licencia Apache-2.0 lo permite, pero la falta de validación fuera de Blackwell y la degradación de razonamiento desaconsejan su uso en producción sin evaluación propia.
- Es un artefacto de investigación con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Minguinho-zeze/Qwen3-1.7B-NVFP4A16-GPTQ-WikiText2
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Repositorio lowbit-reasoning-ptq: https://github.com/minguinho26/lowbit-reasoning-ptq
- Snapshot de la evaluación: https://github.com/minguinho26/lowbit-reasoning-ptq/tree/a851e3957297eaa52d0344a50bd0bbc7e87d5378
- Informes completos de resultados: https://github.com/minguinho26/lowbit-reasoning-ptq/tree/main/reports/qwen3-1.7b-20261108
- Configuración del motor de inferencia: https://github.com/minguinho26/lowbit-reasoning-ptq/blob/a851e3957297eaa52d0344a50bd0bbc7e87d5378/src/engine.py
- Variante con calibración Trace: https://huggingface.co/Minguinho-zeze/Qwen3-1.7B-NVFP4A16-GPTQ-Trace
