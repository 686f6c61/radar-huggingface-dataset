# chihunn/groot_full_toy_pickup

## Resumen

`chihunn/groot_full_toy_pickup` es un ajuste fino completo (full fine-tuning) del modelo fundacional de robotica `nvidia/GR00T-N1.7-3B`, publicado por el usuario `chihunn` en Hugging Face. El modelo parte de la arquitectura GR00T N1.7 de NVIDIA, construida sobre Cosmos, y ha sido entrenado con la libreria LeRobot de Hugging Face sobre un dataset de recogida de juguetes (toy pickup) compuesto por 900 episodios. El resultado es una politica visomotora (vision-language-action, VLA) especializada en una tarea de manipulacion concreta con dos camaras (frontal y de muneca).

Con 3.144.016.000 parametros totales (3,14B) y un repositorio de 12,6 GB en formato safetensors, el modelo se distribuye como un checkpoint de politica para robótica, no como un LLM de proposito general. Su interes radica en que demuestra el flujo completo de especializacion de un modelo fundacional VLA de NVIDIA: se han entrenado todos los parametros (encoder visual, modelo de lenguaje y cabeza de accion), lo que permite evaluar hasta que punto el ajuste completo supera al ajuste parcial en tareas de manipulacion de un solo brazo.

La relevancia actual es doble: por un lado, expone el ecosistema LeRobot como via practica para adaptar GR00T a tareas propias; por otro, al ser un modelo con 0 descargas y 0 likes en el momento de la consulta, debe tratarse como un artefacto experimental de referencia, no como un modelo validado en produccion. La licencia es la NVIDIA Open Model License, que impone condiciones adicionales al uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en NVIDIA GR00T N1.7, construida sobre NVIDIA Cosmos; encoder visual + modelo de lenguaje + cabeza de accion |
| Parametros totales | 3.144.016.000 (3,14B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el checkpoint se publica en safetensors; el entrenamiento uso fp32 con autocast bf16) |
| Idiomas soportados | no disponible |
| Licencia | NVIDIA Open Model License (nvidia-open-model-license) |
| Formato de pesos | safetensors (libreria lerobot) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura GR00T N1.7 de NVIDIA, un sistema VLA multimodal que combina un encoder visual, un modelo de lenguaje y una cabeza de accion, y que segun la model card esta construido sobre NVIDIA Cosmos. El ajuste fino es completo: se entrenaron los 3,14B parametros, incluyendo encoder visual (`tune_visual=true`) y modelo de lenguaje (`tune_llm=true`), ademas de la cabeza de accion. La configuracion de entrada usa la etiqueta de embodiment `new_embodiment`, dos camaras (frontal y de muneca), un vector de estado de 8 dimensiones y una accion de 7 dimensiones.

El entrenamiento se realizo con LeRobot sobre el dataset completo de toy pickup (900 episodios), con chunk de 16, acciones absolutas, batch size 32 y 30.000 pasos (el checkpoint publicado corresponde al paso 30000). Se uso AdamW con learning rate 1e-4, schedule coseno con 5% de warmup, pesos en fp32 con autocast bf16 y aumento de datos mediante ColorJitter. No se documentan en la informacion disponible el numero de tokens, la composicion del dataset, ni si hubo RLHF o DPO; tampoco se describen innovaciones de decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de acciones de manipulacion robótica a partir de observaciones visuales y de estado (politica visomotora).
- Percepcion visual con dos camaras simultaneas (frontal y de muneca).
- Control de un brazo robotico con acciones de 7 dimensiones y estado de 8 dimensiones.
- Ejecucion de la tarea especifica de recogida de juguetes (toy pickup) para la que fue ajustado.
- Integracion con el ecosistema LeRobot para evaluacion mediante `lerobot-eval`.
- Capacidad de servir como punto de partida para otros ajustes finos sobre GR00T N1.7.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, razonamiento textual general, matematicas ni audio en la informacion disponible.

## Casos de uso

- Evaluacion de referencia de ajuste completo: usar el checkpoint para comparar, con `lerobot-eval`, el rendimiento de un fine-tuning completo frente a uno parcial sobre GR00T N1.7 en la misma tarea de toy pickup.
- Prototipado de politicas de pick-and-place: el modelo sirve como base para experimentar con recogida de objetos ligeros en un banco de pruebas de laboratorio con dos camaras y un brazo de 7 grados de libertad.
- Reproduccion de experimentos: al documentarse hiperparametros (lr 1e-4, batch 32, 30.000 pasos, chunk 16, acciones absolutas), permite reproducir el entrenamiento con LeRobot sobre el mismo dataset de 900 episodios.
- Transferencia a nuevas tareas: reutilizar los pesos ajustados como inicializacion para un segundo fine-tuning en una tarea de manipulacion relacionada, aprovechando que se entrenaron encoder visual y LLM.
- Docencia e investigacion en VLA: material didactico para ilustrar el pipeline completo de LeRobot con un modelo fundacional de NVIDIA, desde el dataset hasta la evaluacion.
- Benchmark interno de infraestructura: medir coste de entrenamiento e inferencia de un modelo VLA de 3,14B en el hardware disponible del laboratorio antes de escalar a tareas mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un modelo de 3,14B en bf16 requiere del orden de 6-7 GB solo para pesos, mas el coste del encoder visual, las dos camaras y el estado; en fp32 se duplicaria.
- GPU recomendadas: no disponible en la informacion proporcionada. Por tamano, cabria esperar GPUs de 16 GB o mas (RTX 4090, A100, H100) para inferencia comoda en bf16, pero no hay confirmacion del autor.
- Cabe en consumer GPU: probablemente en GPUs de 16 GB o superiores en bf16, aunque no esta verificado ni documentado.
- Opciones de despliegue: LeRobot (`lerobot-eval`) es la via documentada. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que ademas no son el canal natural para una politica VLA.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| chihunn/groot_full_toy_pickup | 3,14B | no disponible | Toy pickup (fine-tune) | NVIDIA Open Model License | Hugging Face, 0 descargas |
| nvidia/GR00T-N1.7-3B | 3B (aprox.) | no disponible | VLA fundacional general | NVIDIA Open Model License | Hugging Face |
| Otros fine-tunes de GR00T en LeRobot | no disponible | no disponible | Manipulacion especifica | segun autor | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo especializado en una unica tarea (toy pickup) con un embodiment concreto (`new_embodiment`, 2 camaras, estado de 8 dimensiones, accion de 7 dimensiones); no es un modelo generalista.
- Sin descargas ni likes en el momento de la consulta: no hay evidencia de validacion por terceros ni de resultados reproducidos.
- No se publican benchmarks, metricas de exito en la tarea ni curvas de entrenamiento; el rendimiento real es desconocido.
- Riesgo de sobreajuste al dataset de 900 episodios y a las condiciones de captura (iluminacion, camaras, disposicion de objetos).
- No se documentan sesgos conocidos, pero al derivar de un modelo fundacional de NVIDIA pueden heredarse sesgos del corpus de entrenamiento original.
- La NVIDIA Open Model License impone condiciones adicionales al uso comercial; es necesario revisar LICENSE y NOTICE antes de cualquier despliegue productivo.
- No se documentan idiomas soportados ni comportamiento multilingue.
- No hay informacion sobre cuantizaciones ni sobre latencia, lo que dificulta planificar un despliegue en tiempo real.
- Fecha de creacion indicada como 2026-11-16, posterior a la del conocimiento habitual; conviene verificar la integridad del repositorio antes de usarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chihunn/groot_full_toy_pickup
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.7-3B
- LeRobot (GitHub): https://github.com/huggingface/lerobot
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
