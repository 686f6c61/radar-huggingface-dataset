# rilixai/Qwen3.5-0.8B-Beaker-math-all-fixes

## Resumen

Qwen3.5-0.8B-Beaker-math-all-fixes es una variante del modelo base Qwen/Qwen3.5-0.8B (revision `2fc06364715b967f1860aea9cf38778875588b17`) publicada por el usuario rilixai en Hugging Face. No se trata de un reentrenamiento ni de un fine-tuning convencional: es una edicion directa de pesos (weight editing) aplicada mediante la plataforma Beaker, que combina los cambios de cinco ejecuciones independientes sobre neuronas concretas de las capas MLP del transformer. En total se modifican 9.213 numeros, una fraccion minuscula de los 873.438.784 parametros del modelo.

El objetivo declarado es mejorar el rendimiento en razonamiento matematico sin reentrenar. Segun la model card, el modelo pasa del 8,2% al 43,0% ± 1,1 en MATH-500 (500 problemas, 4 respuestas cada uno) respecto al checkpoint sin editar, y supera al ajuste aislado de la neurona 573 (36,6%). La mejora procede principalmente de reducir las respuestas truncadas por el limite de tokens (49,9% frente a 61,6%), aunque las respuestas que terminan aciertan algo menos (85,4% frente a 93,1%).

Es relevante ahora porque demuestra que la edicion selectiva de pesos en modelos pequenos puede producir ganancias medibles en tareas de razonamiento con un coste de almacenamiento minimo (el repo ocupa 1,8 GB, practicamente identico al base). El modelo conserva la licencia Apache-2.0 y la interfaz de uso del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5; pipeline image-text-to-text) |
| Parametros totales | 873.438.784 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos en safetensors; la model card usa bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es una modificacion del checkpoint Qwen/Qwen3.5-0.8B, un transformer multimodal de la familia Qwen3.5 con pipeline image-text-to-text y 873 millones de parametros. No hay reentrenamiento: los pesos base se conservan y solo se alteran 9.213 valores en columnas de `mlp.down_proj.weight` y filas de `mlp.up_proj.weight` de las capas 15, 18, 22 y 23. Las intervenciones incluyen escalados de columnas de salida (×4, ×2, ×0,5), reescrituras de columnas completas (con cambios de 2,0× y 9,9× la longitud de la columna original) y sumas o restas de la fila de la compuerta (`gate`) escalada sobre la fila `up`.

Los cambios provienen de cinco ejecuciones de Beaker (0adc73a9, c001f524, 9e523b95, 3c80f51b, 6760131e). Cuando varias ejecuciones editaron la misma neurona, se selecciono la edicion de la ejecucion con mejor puntuacion en el conjunto de validacion (n387 de c001f524, n573 de 3c80f51b, n573 de 9e523b95; se descarto n573 de c001f524). Los valores exactos de las nuevas filas y columnas estan en el directorio `edits/` del repositorio. No se documentan datos de entrenamiento adicionales, tecnicas de RLHF/DPO ni innovaciones de decodificacion mas alla del modo thinking del modelo base.

## Capacidades

- Generacion de texto y razonamiento en modo thinking (la model card invoca `enable_thinking=True` en la plantilla de chat).
- Razonamiento matematico mejorado respecto al base: 43,0% en MATH-500 con la configuracion de evaluacion indicada.
- Procesamiento de imagen y texto (pipeline image-text-to-text, carga mediante `AutoModelForImageTextToText`).
- Conversacional: la model card usa `apply_chat_template` con mensajes de rol `user`.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags).
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades de audio: no disponible en la informacion proporcionada.

## Casos de uso

- Evaluacion de tecnicas de edicion de pesos: el modelo sirve como referencia reproducible para comparar ediciones neuronales (Beaker, Takehi et al.) sobre un mismo checkpoint base, dado que la model card documenta cada neurona editada y su origen.
- Razonamiento matematico en entornos con recursos limitados: con 873 millones de parametros y pesos en bfloat16, puede desplegarse en una sola GPU consumer para resolver problemas de MATH-500, aprovechando el modo thinking y la ventana de hasta 32.768 tokens nuevos usada en la evaluacion.
- Prototipado de asistentes conversacionales con entrada de imagen: al mantener el pipeline image-text-to-text del base, permite construir demos que reciben una imagen y una pregunta de texto y generan una respuesta razonada.
- Servicio de inferencia con vLLM: la model card documenta `vllm serve rilixai/Qwen3.5-0.8B-Beaker-math-all-fixes`, lo que facilita desplegar el modelo como endpoint compatible con la API de OpenAI en pipelines de evaluacion automatizada.
- Investigacion sobre truncamiento en generacion: la mejora medida se atribuye a la reduccion de respuestas cortadas por el limite de tokens, por lo que el modelo es util para estudiar como las ediciones de pesos afectan a la longitud y finalizacion de las cadenas de razonamiento.
- Comparacion de checkpoints en ablaciones: al existir variantes publicadas con ediciones parciales (por ejemplo, solo neurona 573), permite ejecutar estudios controlados sobre el efecto de cada neurona en el rendimiento final.

## Benchmarks y rendimiento

Resultados publicados en la model card para MATH-500 (500 problemas, 4 respuestas por problema; thinking on, temperatura 0,6, top-p 0,95, top-k 20, presence penalty 1,5, hasta 32.768 tokens nuevos, semilla 0; corregido con math-verify 0.9.0 y servido con vLLM 0.32.0):

| Modelo | MATH-500 |
|---|---:|
| Qwen3.5-0.8B sin editar | 8,2% |
| Neurona 573 ×2 sola (run 9e523b95) | 36,6% |
| **Todos los arreglos (este modelo)** | **43,0% ± 1,1** |
| Edicion de Takehi et al. | 51,1% |

Desglose adicional reportado: respuestas truncadas por limite de tokens 49,9% (frente a 61,6% con la neurona 573 ×2 sola); acierto entre las respuestas que terminan 85,4% (frente a 93,1%). No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 1,75 GB solo para pesos (873,4 M parametros × 2 bytes), mas memoria para cache KV y activaciones; el repo completo ocupa 1,8 GB.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 0,9 GB para pesos; en 4 bits, alrededor de 0,45 GB. No se confirman cuantizaciones GGUF publicadas para este checkpoint.
- GPU recomendadas: cualquier GPU consumer moderna con al menos 4-6 GB de VRAM deberia poder alojar los pesos en bfloat16; para contexto largo (hasta 32.768 tokens nuevos en la evaluacion) se recomienda 16 GB o mas. GPU de datacenter como A100 o H100 no son necesarias por tamano, pero pueden usarse para mayor throughput.
- Cabe en GPU consumer: si, por el numero de parametros; la model card no especifica un minimo oficial.
- Opciones de despliegue: vLLM (`vllm serve rilixai/Qwen3.5-0.8B-Beaker-math-all-fixes`, version 0.32.0 usada en la evaluacion) y transformers con `AutoModelForImageTextToText` en bfloat16. No se documentan Ollama, llama.cpp ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MATH-500 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-Beaker-math-all-fixes (este) | 873,4 M | no disponible | 43,0% ± 1,1 | Apache-2.0 | Hugging Face |
| Qwen/Qwen3.5-0.8B (base sin editar) | 873,4 M | no disponible | 8,2% | Apache-2.0 | Hugging Face |
| Qwen3.5-0.8B-Beaker-math-9e523b95 (neurona 573 ×2) | 873,4 M | no disponible | 36,6% | Apache-2.0 (segun base) | Hugging Face |
| Edicion de Takehi et al. | no disponible | no disponible | 51,1% | no disponible | blog del autor |

La comparativa se limita a variantes del mismo checkpoint base y a la edicion de referencia citada en la model card; no se dispone de datos de otros modelos de tamano similar en la informacion proporcionada.

## Limitaciones y advertencias

- El propio autor reporta que la mejora en MATH-500 se debe sobre todo a que menos respuestas se truncan; entre las respuestas que terminan, la tasa de acierto baja del 93,1% al 85,4%, lo que sugiere un posible efecto de respuestas mas cortas o menos exhaustivas.
- La edicion de Takehi et al. obtiene 51,1% en el mismo benchmark, superior al 43,0% de este modelo, por lo que no es el mejor resultado publicado para esta base.
- Solo se han modificado 9.213 numeros en 9 neuronas de 4 capas; el resto del comportamiento del modelo es identico al base, incluyendo sus sesgos y riesgos de alucinacion, que no se documentan en la informacion disponible.
- La evaluacion se realizo con una configuracion concreta (thinking on, temperatura 0,6, top-p 0,95, top-k 20, presence penalty 1,5, 32.768 tokens nuevos, 4 respuestas por problema, math-verify 0.9.0, vLLM 0.32.0); los resultados pueden no transferirse a otras configuraciones de decodificacion.
- No se especifican idiomas soportados ni limitaciones de contexto; el modelo base es multimodal, pero no se detalla el rendimiento en tareas de vision tras la edicion.
- Licencia Apache-2.0, igual que el modelo base, por lo que el uso comercial esta permitido segun los terminos de dicha licencia; conviene revisar el archivo `LICENSE` del repositorio.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta y fue creado el 2026-11-11, por lo que no cuenta con validacion independiente de la comunidad.
- No se han publicado resultados en benchmarks distintos de MATH-500, ni datos de robustez, seguridad o sesgo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rilixai/Qwen3.5-0.8B-Beaker-math-all-fixes
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Variante con solo la neurona 573 ×2: https://huggingface.co/rilixai/Qwen3.5-0.8B-Beaker-math-9e523b95
- Blog de Beaker sobre programacion en el espacio de pesos: https://www.withbeaker.ai/blog/weight-space-programming
- Blog de Takehi et al.: https://rikiyat.github.io/blog/weight-space-programming/
- Ejecuciones publicas de Beaker:
  - https://app.withbeaker.ai/public/runs/0adc73a9-b8d7-4cb2-85a7-0581f7b5dea3
  - https://app.withbeaker.ai/public/runs/c001f524-6b9d-4a0a-81bb-780570bd06a5
  - https://app.withbeaker.ai/public/runs/9e523b95-a868-44a3-91d9-59d1ae625ee2
  - https://app.withbeaker.ai/public/runs/3c80f51b-d89d-402f-a7c6-54ee41ab6737
  - https://app.withbeaker.ai/public/runs/6760131e-c35b-4d55-ab38-75480bec76dd
