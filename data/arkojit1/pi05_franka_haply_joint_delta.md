# arkojit1/pi05_franka_haply_joint_delta

## Resumen

`arkojit1/pi05_franka_haply_joint_delta` es un ajuste fino de π0.5 (familia `pi05` de LeRobot) sobre el checkpoint `lerobot/pi05_base`, orientado a control de un brazo Franka teleoperado con un dispositivo Haply. Se trata de una política visión-lenguaje-acción (VLA) que, a partir de tres cámaras RGB de 224×224 y un vector de estado de 8 dimensiones, predice deltas en el espacio articular: 7 grados de libertad (uno por articulación) más una dimensión de pinza.

El modelo lo publica el usuario arkojit1 y resuelve un problema muy concreto: convertir demostraciones de teleoperación en una política que reproduzca la tarea de forma autónoma, sin necesidad de reentrenar los componentes de visión y lenguaje. Para ello congela el encoder SigLIP y el backbone Gemma-2B del modelo base y entrena únicamente el experto de acción (unos 300 millones de parámetros entrenables de un total de 4.143.404.816). El ajuste se detuvo en el paso 3.500 de una ejecución de 5.000 (19,6 épocas), con una `eval_loss` de 0,1977 sobre un 10 % de episodios reservados.

Su relevancia es acotada pero clara: es un ejemplo reproducible de ajuste de π0.5 con LeRobot sobre un dataset pequeño (94 episodios, 50.861 fotogramas a 20 fps) y sobre una sola tarea descrita en lenguaje natural. No es un modelo de propósito general, sino un checkpoint de investigación para manipulación robótica de un único embodiment.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action derivada de π0.5; encoder de vision SigLIP + backbone de lenguaje Gemma-2B (ambos congelados) + experto de accion entrenable con objetivo de flow matching |
| Parametros totales | 4.143.404.816 (aproximadamente 4,14 mil millones) |
| Longitud de contexto | no disponible (la ventana se usa con 3 imagenes de 224x224 y un estado de 8 dimensiones; el modelo base define 3 ranuras de imagen) |
| Tipos de cuantizacion | no disponible (el repositorio publica pesos sin cuantizar) |
| Idiomas soportados | no disponible (el dataset de entrenamiento contiene 1 unica tarea descrita en lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria `lerobot`) |
| Parametros entrenables | aproximadamente 300 millones (solo el experto de accion) |
| Espacio de accion | 8 dimensiones: 0-6 deltas de angulo por articulacion (7 DoF), 7 pinza |
| Entradas de observacion | 3 camaras RGB 224x224 (`base_0_rgb`, `base_1_rgb`, `left_wrist_0_rgb`) + estado de 8 dimensiones |
| Chunk de acciones | 50 acciones por prediccion (`chunk_size=50`, `n_action_steps=50`), equivalentes a 2,5 s a 20 fps |
| Tamano del repositorio | 9,4 GB |

## Arquitectura y entrenamiento

La politica hereda la arquitectura del checkpoint `lerobot/pi05_base`, que combina un encoder de vision SigLIP y un backbone de lenguaje Gemma-2B con un experto de accion que genera secuencias de acciones mediante flow matching (el mismo objetivo con el que se reporta la `eval_loss`). En este ajuste fino solo se actualiza el experto de accion, lo que deja alrededor de 300 millones de parametros entrenables frente a los 4.143.404.816 totales. Las tres camaras del dataset ocupan exactamente las tres ranuras de imagen de π0.5, de modo que se entrena con `empty_cameras=0`, sin relleno enmascarado.

El entrenamiento usó el dataset `Ameyapores/franka_haply_joint_delta` (94 episodios, 50.861 fotogramas a 20 fps, una sola tarea) y se ejecutó con batch global 256 repartido en 8 GPU AMD MI300X (32 por GPU) mediante DDP sobre RCCL, con learning rate 2,5e-5, scheduler coseno, bf16 y gradient checkpointing. Se aplicó normalización por cuantiles sobre estado y acción, y aumento de imagen únicamente en el split de entrenamiento. El checkpoint publicado corresponde al paso 3.500 de 5.000 (19,6 épocas), seleccionado por ser el de menor pérdida de evaluación sobre un 10 % de episodios reservados. Conviene subrayar que esa `eval_loss` es el objetivo de entrenamiento evaluado, no una tasa de éxito de la tarea.

## Capacidades

- Generacion de acciones de manipulacion en espacio articular: predice deltas de 7 articulaciones mas la pinza a partir de observaciones visuales y de estado.
- Control condicionado por lenguaje: la politica acepta una descripcion de tarea, aunque el dataset solo aporta una unica tarea.
- Percepcion multimodal con tres camaras RGB simultaneas (dos vistas base y una muñeca), integradas en las tres ranuras de imagen del modelo.
- Prediccion por chunks: emite 50 acciones por inferencia (2,5 s a 20 fps), que se ejecutan en lazo abierto antes de replanificar; el numero de acciones ejecutadas puede reducirse en inferencia para un control mas cerrado, sin tocar los pesos.
- Ajuste eficiente: al entrenar solo el experto de accion, el coste de adaptacion a un embodiment nuevo es bajo en comparacion con un ajuste completo.
- Integracion con LeRobot: se carga directamente con `PI05Policy.from_pretrained`.
- No soporta tool calling ni function calling.
- No esta orientado a agentes ni a razonamiento multi-paso en texto.
- No se documentan capacidades multilingues, de generacion de texto libre, de codigo, de matematicas ni de vision generalista (clasificacion, VQA, OCR).

## Casos de uso

- Manipulacion robotica con Franka en laboratorio: la politica traduce observaciones de tres camaras y el estado articular en deltas por articulacion, de modo que puede cerrar el bucle de control sobre un Franka real o simulado que consuma comandos de incremento de posicion.
- Reproduccion de demostraciones de teleoperacion con Haply: el dataset se capturo con un dispositivo Haply, por lo que el modelo sirve para convertir esas demostraciones en ejecucion autonoma de la misma tarea, reduciendo la dependencia del operador.
- Investigacion en modelos vision-lenguaje-accion: sirve como punto de partida reproducible para estudiar el ajuste de π0.5 con solo el experto de accion, comparando curvas de `eval_loss` y estrategias de congelacion de SigLIP y Gemma-2B.
- Evaluacion de estrategias de chunking: con `chunk_size=50` y `n_action_steps=50` se puede experimentar con ejecucion en lazo abierto de 2,5 s frente a ejecuciones mas cortas, sin reentrenar, para medir el efecto en la estabilidad del control.
- Reentrenamiento sobre un embodiment o una tarea nuevos: el flujo de trabajo (LeRobot + dataset en formato de episodios con columna `action` de 8 dimensiones) es reutilizable para adaptar la politica a otro brazo o a otra tarea con un coste de computo moderado.
- Docencia y prototipado en robotica: al caber en una GPU profesional y posiblemente en una de consumo, permite montar practicas de aprendizaje por imitacion sin infraestructura de gran escala.
- Automatizacion de tareas repetitivas de pick-and-place en un banco de pruebas: el modelo puede sustituir a un operador en una unica tarea acotada, siempre que el entorno y la iluminacion se mantengan dentro de la distribucion de entrenamiento.
- Base para comparativas de politicas: util como referencia de un ajuste de π0.5 especifico para contrastar con el modelo base o con otras variantes de la familia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato numerico de evaluacion es la perdida del objetivo de flow matching sobre un 10 % de episodios reservados, que se reproduce a continuacion por ser el unico indicador reportado:

| Metrica | Valor | Notas |
|---|---|---|
| `eval_loss` (flow matching) | 0,1977 | Paso 3.500 de 5.000 (19,6 epocas), 10 % de episodios reservados |
| Tasa de exito de la tarea | no disponible | La model card advierte que `eval_loss` no es una tasa de exito |
| MMLU, HumanEval, GSM8K u otros | no disponible | No aplicables a un modelo de robotica; no se reportan |

## Requisitos de hardware

- Pesos en bf16: aproximadamente 8,3 GB (4.143.404.816 parametros x 2 bytes). En fp32 serian unos 16,6 GB.
- VRAM estimada para inferencia: del orden de 10-12 GB en bf16 si se suman activaciones y el procesamiento de tres imagenes de 224x224; es una estimacion a partir del numero de parametros publicado, no un dato del autor.
- GPU de consumo: una RTX 4090 o RTX 3090 de 24 GB deberia ser suficiente para inferencia en bf16 segun esa estimacion; no hay confirmacion del autor.
- GPU profesionales: A100 (40/80 GB), H100 y MI300X son opciones holgadas. El entrenamiento reportado uso 8x MI300X.
- Opciones de despliegue: LeRobot mediante `PI05Policy.from_pretrained("arkojit1/pi05_franka_haply_joint_delta")` sobre PyTorch. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ni se publican pesos GGUF.
- Dependencia adicional: el preprocesador carga el tokenizer desde el repositorio con acceso restringido `google/paligemma-3b-pt-224`; hay que aceptar su licencia y configurar `HF_TOKEN`, lo que anade friccion al despliegue.
- Latencia y throughput: no disponible. Como referencia de control, el modelo predice 50 acciones que a 20 fps cubren 2,5 s de movimiento.

## Comparativa con modelos similares

| Modelo | Parametros | Salida / control | Licencia | Disponibilidad |
|---|---|---|---|---|
| `arkojit1/pi05_franka_haply_joint_delta` | 4.143.404.816 (unos 300 M entrenables) | Chunk de 50 acciones, deltas de 7 articulaciones + pinza | no disponible | HuggingFace, 0 descargas y 0 likes |
| `lerobot/pi05_base` | no disponible | no disponible | no disponible | HuggingFace; es el checkpoint base de este ajuste |
| `lerobot/pi0` | no disponible | no disponible | no disponible | HuggingFace; version anterior de la familia |

No se dispone de datos de parametros, contexto ni rendimiento de los modelos comparables en la informacion proporcionada, ni de resultados de benchmarks que permitan una comparacion cuantitativa. La busqueda web realizada no devolvio resultados relevantes sobre este modelo ni sobre su familia.

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar si el uso comercial esta permitido. Conviene tratar el modelo como no apto para produccion hasta aclarar la licencia, que ademas puede heredar restricciones del checkpoint base y del tokenizer de PaliGemma.
- `eval_loss` no es una tasa de exito: la propia model card advierte que la metrica reportada (0,1977) es el objetivo de entrenamiento sobre episodios reservados, no el porcentaje de tareas completadas.
- Dataset muy reducido y de una sola tarea: 94 episodios y 1 tarea descrita en lenguaje natural. La politica tiene un sesgo fuerte hacia esa tarea y ese entorno concretos.
- Un unico embodiment: el entrenamiento se hizo con un Franka teleoperado con Haply. El modelo no generaliza a otros brazos, morfologias ni espacios de accion sin reentrenamiento.
- Riesgo de sobreajuste a la distribucion visual: la perdida de evaluacion se midio sobre episodios reservados del mismo dataset, con la misma configuracion de camaras e iluminacion. Cambios de escena, iluminacion u oclusion probablemente degraden el rendimiento.
- Control en lazo abierto: con `n_action_steps=50` se ejecutan 2,5 s de movimiento sin realimentacion visual. En entornos dinamicos esto puede provocar acumulacion de error; reducirlo en inferencia es posible, pero no hay datos publicados sobre el impacto.
- Riesgo de alucinacion en el sentido de acciones fisicamente invalidas: como cualquier politica de imitacion, puede generar comandos plausibles pero incorrectos ante entradas fuera de distribucion, con riesgo material para el robot y su entorno.
- Dependencia de un repositorio con acceso restringido (`google/paligemma-3b-pt-224`) para el tokenizer, lo que condiciona la reproducibilidad y el despliegue.
- Idiomas no documentados: no se especifica en que idioma esta redactada la tarea, y no hay evidencia de soporte multilingue.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, sin validacion externa ni resultados reproducidos por terceros.
- Fechas del repositorio: creado y actualizado el 21 de septiembre de 2026 segun los metadatos de HuggingFace.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/arkojit1/pi05_franka_haply_joint_delta
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/Ameyapores/franka_haply_joint_delta
- Tokenizer con acceso restringido requerido: https://huggingface.co/google/paligemma-3b-pt-224
- La busqueda web realizada no devolvio ningun enlace relevante sobre este modelo, su familia o su dataset.
