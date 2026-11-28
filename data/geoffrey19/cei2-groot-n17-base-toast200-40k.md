# Geoffrey19/cei2-groot-n17-base-toast200-40k

## Resumen

cei2-groot-n17-base-toast200-40k es un ajuste fino completo del modelo fundacional de robotica GR00T N1.7-3B de NVIDIA, especializado en una unica tarea de manipulacion fisica: coger una rebanada de pan de una tostadora y colocarla en un cuenco. Lo publica el usuario Geoffrey19 como parte del proyecto CEI-2.0 y deriva directamente del checkpoint base nvidia/GR00T-N1.7-3B, sobre el que se ha entrenado durante 40.000 pasos con 200 episodios de demostraciones teleoperadas reales sobre un brazo Franka FR3 con mano Ruiyan.

El modelo resuelve el problema de adaptar una politica visomotora generalista a un embodiment concreto (brazo de 7 grados de libertad mas mano de 15 valores) mediante aprendizaje por imitacion. Su relevancia es acotada pero tecnica: documenta de forma transparente un pipeline de post-entrenamiento sobre GR00T con acciones absolutas, sin estado observable, y sirve como referencia reproducible para quien quiera replicar fine-tunes de robotica sobre hardware Franka.

Arquitectura, tamano y contexto: se trata de un modelo de 3.144.016.000 parametros (3,14 B, 1.030 tensores) almacenados en float32, con backbone vision-lenguaje-accion de GR00T N1.7. La longitud de contexto no esta especificada en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GR00T N1.7 (vision-lenguaje-accion, transformer multimodal con cabeza de acciones flow-matching) |
| Parametros totales | 3.144.016.000 (3,14 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en float32) |
| Idiomas soportados | no disponible (modelo de robotica; la anotacion de tarea es textual) |
| Licencia | NVIDIA License (nvidia-license), uso limitado a investigacion y evaluacion no comercial |
| Formato de pesos | safetensors (3 shards: model-0000{1,2,3}-of-00003.safetensors) + model.safetensors.index.json |

## Arquitectura y entrenamiento

El modelo parte de nvidia/GR00T-N1.7-3B, un backbone vision-lenguaje-accion que combina un modelo de lenguaje (con `lm_head` atado a los embeddings de entrada y no almacenado en el repo) con un encoder visual y una cabeza de acciones basada en flow-matching. El ajuste es completo: `--tune-llm --tune-visual`, proyector y cabeza de acciones. La entrada de estado (`observation.state`) es un vector de 22 dimensiones completamente a cero, porque el dataset original no contiene posiciones articulares medidas; la unica senal supervisada es `action`, un comando absoluto de referencia de 22 dimensiones (7 articulaciones del FR3 por cinematica inversa de la teleoperacion y 15 valores de la mano Ruiyan segun su mapeo MANUS).

El entrenamiento usa 200 episodios y 40.817 fotogramas a 15 Hz (116-393 fotogramas por episodio, 13,6 s de media), una camara RGB exterior de 640x480, chunks de 16 pasos de acciones absolutas (`NON_EEF`), normalizacion por percentiles q01/q99 mapeados a -1/+1 con recorte, 40.000 pasos con batch 32 en una sola GPU, learning rate pico 2e-5 tras 1.000 pasos de warmup (2,5 %) con decaimiento coseno hasta 0, weight decay 1e-5 y precision mixta bfloat16 sobre pesos float32. La perdida de entrenamiento (objetivo flow-matching) baja de 1,2516 en los pasos 0-100 a 0,0067 en los pasos 39.000-40.000. No hay split de validacion ni evaluacion de exito de tarea.

## Capacidades

- Generacion de acciones motoras: produce chunks de 16 pasos de comandos absolutos de 22 dimensiones para brazo FR3 (7 articulaciones) y mano Ruiyan (15 valores).
- Control visomotor a partir de una unica camara RGB exterior de 640x480.
- Aprendizaje por imitacion de una tarea especifica: "coger la rebanada de pan de la tostadora y colocarla en el cuenco de la mesa".
- Condicionamiento por descripcion textual de tarea mediante `annotation.human.task_description`.
- Soporte de tool calling / function calling: no disponible (no es un modelo de lenguaje conversacional).
- Soporte de agentes y razonamiento multi-paso: no aplicable en el sentido de agentes de software; el modelo ejecuta una politica de control.
- Capacidades multilingues: no disponible.
- Capacidades especiales: ninguna declarada aparte del control robotico; no hay modo thinking, vision general, audio ni similares.

## Casos de uso

- Investigacion en aprendizaje por imitacion sobre Franka FR3: sirve como checkpoint de referencia para comparar recetas de post-entrenamiento de GR00T N1.7 sobre el mismo dataset, ya que existe un pi05 entrenado con los mismos datos (Geoffrey19/cei2-pi05-base-toast200-fp32) para contrastar.
- Reproduccion de pipelines de robotica: el repo incluye `cei2_groot_absolute_config.py`, `statistics.json`, `joint_order.json` y `dataset_modality.json`, lo que permite reconstruir la configuracion de modalidad y la normalizacion exactas usadas en el entrenamiento.
- Estudio de politicas sin estado observable: caso util para analizar como se comporta un modelo visomotor cuando el vector de estado es todo ceros y la unica senal es la accion absoluta.
- Prototipado de tareas pick-and-place con mano antropomorfa: la tarea de pan a cuenco es un ejemplo concreto de agarre y deposito que puede adaptarse a objetos similares en laboratorio.
- Benchmark interno de fine-tuning de GR00T: comparar la curva de perdida (1,2516 a 0,0067) y el numero de pasos con otras configuraciones del mismo backbone.
- Docencia y divulgacion tecnica: ilustra de forma transparente las decisiones de diseno (acciones absolutas, normalizacion por percentiles, ausencia de split) y sus limitaciones para produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no hay split de validacion ni evaluacion de exito de tarea, y que la perdida reportada son ajustes a los episodios de entrenamiento, no medidas de calidad de politica.

| Metrica | Valor | Nota |
|---|---|---|
| Perdida de entrenamiento (pasos 0-100) | 1,2516 | Media del objetivo flow-matching |
| Perdida de entrenamiento (pasos 9.900-10.000) | 0,0337 | Media del objetivo flow-matching |
| Perdida de entrenamiento (pasos 19.000-20.000) | 0,0159 | Media del objetivo flow-matching |
| Perdida de entrenamiento (pasos 29.900-30.000) | 0,0083 | Media del objetivo flow-matching |
| Perdida de entrenamiento (pasos 39.000-40.000) | 0,0067 | Media del objetivo flow-matching |
| Tasa de exito de tarea | no disponible | No evaluada |

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en float32 (3,14 B parametros) el modelo ocupa aproximadamente 12,6 GB solo en pesos; se necesita margen adicional para activaciones, encoder visual y buffers, por lo que se recomienda al menos 16-24 GB de VRAM en float32.
- GPU recomendadas: A100, H100 o L40S para inferencia en float32 con holgura; RTX 4090 (24 GB) es el minimo consumer viable en float32.
- Cabe en consumer GPU: si, en RTX 4090 de 24 GB en float32; en GPUs de 16 GB requeriria conversion a bfloat16 o cuantizacion, no documentada en el repo.
- Opciones de despliegue: Isaac-GR00T con la configuracion de modalidad `cei2_groot_absolute_config.py`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no es un modelo de lenguaje).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cei2-groot-n17-base-toast200-40k | 3,14 B | no disponible | Pan a cuenco, FR3 + mano Ruiyan | NVIDIA License (no comercial) | Hugging Face, 0 descargas |
| Geoffrey19/cei2-pi05-base-toast200-fp32 | no disponible | no disponible | Misma tarea, mismos datos, 20.000 pasos | no disponible | Hugging Face |
| nvidia/GR00T-N1.7-3B (base) | 3 B | no disponible | Robotica generalista, punto de partida | NVIDIA License | Hugging Face |

La comparacion con otros modelos de robotica de tamano similar (por ejemplo, variantes de pi0 o RT-2) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Dataset sin split de validacion: los 200 episodios se usaron para entrenamiento, por lo que no hay evaluacion held-out ni medida de generalizacion.
- Exito de tarea no evaluado: el `task_outcome` del dataset no esta anotado y sus autores solo revisaron visualmente el ultimo fotograma de 220 clips, lo que no es una comprobacion fotograma a fotograma.
- Estado no observable: el vector de estado es todo ceros y no aporta informacion; la politica depende unicamente de la imagen y del comando de accion absoluto.
- Cuatro valores de la mano (side de indice, corazon, anular y menique) son cero en todos los fotogramas y permanecen en -1 tras la normalizacion.
- Desajuste de articulaciones: la mano tiene 3 valores por dedo, mientras que el modelo roboticos CEI `fr3v2_ruihand` tiene 20 articulaciones de mano (4 por dedo); no hay permutacion posible y una politica del mid-training CEI no puede manejarse con estos 22 valores sin un mapeo.
- Licencia restrictiva: la NVIDIA License limita el uso a investigacion y evaluacion no comerciales; no apta para produccion comercial sin licencia adicional.
- Sin datos de cuantizacion ni de despliegue optimizado: no se documentan versiones GGUF, bfloat16 ni ONNX, lo que complica el despliegue en hardware limitado.
- Riesgo de alucinacion: no aplica en el sentido linguistico, pero si existe riesgo de acciones fisicas incorrectas o inseguras al ejecutar la politica en un robot real sin supervision.
- Sesgos conocidos: no documentados; el modelo esta entrenado en un unico entorno, una unica camara y una unica tarea, por lo que no generaliza a otras configuraciones.
- Idiomas: no disponible; el condicionamiento textual de tarea es limitado a la descripcion del dataset.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Geoffrey19/cei2-groot-n17-base-toast200-40k
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.7-3B
- Modelo comparable pi05: https://huggingface.co/Geoffrey19/cei2-pi05-base-toast200-fp32
- Repositorio Isaac-GR00T: https://github.com/NVIDIA/Isaac-GR00T
- Dataset de referencia: `zwx/toast_to_basin_franka_ruiyan_pi05_top200` (identificador citado en la model card; no se proporciona URL directa)
