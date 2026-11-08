# eVorob/so101_bed_clear_smolvla

## Resumen

`eVorob/so101_bed_clear_smolvla` es una politica de robotica basada en SmolVLA, un modelo vision-lenguaje-accion (VLA) compacto publicado por Hugging Face dentro del ecosistema LeRobot. El modelo ha sido entrenado por el usuario eVorob mediante aprendizaje por imitacion para una tarea concreta: retirar una pieza impresa de una cama y depositarla en una papelera. No es un modelo de proposito general, sino un checkpoint de politica entrenado sobre un dataset propio de 38 episodios y 20.033 fotogramas capturados a 30 FPS con un robot SO-101.

El modelo sigue la arquitectura SmolVLA descrita en el paper arXiv:2506.01844, que propone un VLA ligero capaz de ejecutarse en hardware de consumo. El repositorio contiene 450.046.176 parametros en formato safetensors (1,2 GB), lo que lo situa en el rango de los modelos pequenos dentro de la familia VLA. Su interes practico es doble: por un lado sirve como ejemplo reproducible de un pipeline completo de LeRobot (grabacion de datos, entrenamiento y despliegue); por otro, demuestra que es viable entrenar politicas de manipulacion con recursos modestos.

Es relevante ahora porque la comunidad de robotica open source esta adoptando LeRobot como estandar de facto para entrenar y compartir politicas de imitacion, y SmolVLA es una de las recetas mas accesibles para hacerlo. Este checkpoint concreto, sin embargo, tiene cero descargas y cero likes en el momento de redactar la ficha, y el autor no ha publicado resultados de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-lenguaje-accion), implementada en LeRobot |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las instrucciones de tarea se proporcionan en texto; el dataset usa la tarea "Remove the print from the bed and drop it in the bin") |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria lerobot) |

Especificaciones adicionales del checkpoint:

| Parametro | Valor |
|---|---|
| Tipo de robot | `so_follower` (SO-101) |
| Camaras | `wrist` (una sola camara de muneca) |
| Entrada de estado | `observation.state`, shape `(6,)` |
| Entrada visual | `observation.images.wrist`, shape `(3, 480, 640)` |
| Salida de accion | `action`, shape `(6,)` |
| Frecuencia de control | 30 FPS |
| Tamano del repositorio | 1,2 GB |
| Version de LeRobot | 0.7.0 |

## Arquitectura y entrenamiento

SmolVLA es un modelo vision-lenguaje-accion que combina un codificador visual, un modelo de lenguaje preentrenado y un cabezal de accion, siguiendo el paradigma de los VLA clasicos pero con un diseno optimizado para reducir coste computacional. El paper de referencia (arXiv:2506.01844) describe un modelo compacto pensado para desplegarse en hardware de consumo, en contraste con VLA de gran tamano como OpenVLA o RT-2. La informacion disponible no detalla la composicion exacta del backbone visual ni del modelo de lenguaje subyacente, ni el numero de tokens de preentrenamiento.

El entrenamiento de este checkpoint concreto es de aprendizaje por imitacion supervisado sobre el dataset `eVorob/so101_bed_clear_20261106_192231`: 38 episodios, 20.033 fotogramas a 30 FPS, una unica tarea y una unica camara de muneca. La configuracion reportada es de 20.000 pasos, batch size 8, optimizador AdamW, learning rate 0,0001 y semilla 1000. No se menciona uso de RLHF, DPO ni tecnicas de refinamiento posteriores; es un entrenamiento de politica puro sobre demostraciones. Tampoco se documentan innovaciones adicionales como decodificacion especulativa o atencion lineal especificas de este checkpoint.

## Capacidades

- Generacion de acciones de manipulacion robotica de 6 dimensiones a partir de observaciones de estado y una imagen de muneca.
- Control visomotor de un robot SO-101 (`so_follower`) para la tarea de retirar un objeto de una superficie y depositarlo en una papelera.
- Condicionamiento por instruccion en lenguaje natural: la tarea se pasa como texto (`--task="Remove the print from the bed and drop it in the bin"`).
- Ejecucion en bucle cerrado a 30 FPS mediante `lerobot-rollout`.
- Entrenamiento y reentrenamiento reproducibles con `lerobot-train` sobre nuevos datasets.
- No hay evidencia de soporte de tool calling, function calling, agentes multi-paso, razonamiento simbolico, vision general, audio ni modo "thinking". Es una politica de robotica, no un asistente conversacional.
- Capacidades multilingues: no disponibles; la unica instruccion documentada esta en ingles.

## Casos de uso

- Automatizacion de una tarea de recogida concreta en un banco de pruebas: el modelo ejecuta la secuencia "retirar la pieza impresa de la cama y dejarla en la papelera" sobre un SO-101, lo que permite validar el pipeline completo de LeRobot en un laboratorio o aula.
- Reproduccion de un flujo de aprendizaje por imitacion de extremo a extremo: sirve como referencia para grabar un dataset propio, entrenar con `lerobot-train` y desplegar con `lerobot-rollout`, usando exactamente la misma configuracion (20.000 pasos, batch 8, lr 1e-4).
- Prototipado de politicas de bajo coste: con 450 M de parametros y 1,2 GB de pesos, el checkpoint es adecuado para experimentar en una estacion de trabajo con una sola GPU consumer antes de escalar a modelos mayores.
- Docencia y formacion en robotica: el repositorio incluye comandos listos para ejecutar y enlaces a la documentacion de LeRobot, lo que facilita montar practicas guiadas sobre un robot SO-101 real.
- Base para fine-tuning en tareas similares de pick-and-place: al estar entrenado sobre una tarea de retirada y deposito, puede servir como inicializacion para variantes con otros objetos o posiciones, siempre que se disponga de nuevas demostraciones.
- Evaluacion comparativa de VLA ligeros: permite contrastar SmolVLA con alternativas como `Temmp1e/so101_smolVLA` u otras politicas SO-101 publicadas en el Hub, en igualdad de robot y camara.
- Integracion en pipelines de investigacion sobre imitacion: el formato LeRobot y los safetensors facilitan cargar el checkpoint en scripts propios para analizar representaciones o medir latencia de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una seccion de evaluacion vacia con la nota explicita: "No evaluation results have been provided for this policy yet." No se dispone de tasas de exito en robot real, ni de metricas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 450 M de parametros en safetensors (fp32 o bf16, no especificado), el peso del modelo ocupa aproximadamente 1,2 GB en el repositorio; en fp16 serian del orden de 0,9 GB solo para pesos, mas activaciones y buffers del codificador visual.
- GPU recomendadas: no disponibles en la informacion. El paper de SmolVLA indica que el modelo esta pensado para hardware de consumo, pero este checkpoint concreto no documenta requisitos.
- Compatibilidad con GPU consumer: previsiblemente si, dado el tamano, pero no hay confirmacion del autor.
- Opciones de despliegue: `lerobot-rollout` (estrategia `base`) es el metodo documentado. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son adecuados para una politica de robotica de este tipo.
- Latencia y throughput: no disponibles. La politica esta pensada para operar a 30 FPS, la misma frecuencia del dataset de entrenamiento, pero no se aportan mediciones reales.

## Comparativa con modelos similares

| Modelo | Parametros | Robot / tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `eVorob/so101_bed_clear_smolvla` | 450.046.176 | SO-101, retirar impresion de la cama | no disponible | no disponible | Hugging Face, 0 descargas |
| `Temmp1e/so101_smolVLA` | no disponible | SO-101 (SmolVLA) | no disponible | no disponible | Hugging Face |
| `eVorob/so101_bed_clear` | 51,7 M (segun busqueda) | SO-101, misma tarea | no disponible | no disponible | Hugging Face |

La comparativa es limitada: no se dispone de benchmarks publicos para ninguno de los tres, y las diferencias de parametros entre `so101_bed_clear` (51,7 M) y este checkpoint (450 M) sugieren arquitecturas o configuraciones distintas, pero la informacion disponible no permite confirmarlo. No se han identificado alternativas de gran VLA (OpenVLA, RT-2) con datos comparables en la busqueda realizada.

## Limitaciones y advertencias

- Es una politica especializada en una unica tarea ("Remove the print from the bed and drop it in the bin"); no generaliza a otras tareas sin reentrenamiento.
- Entrenada con una sola camara de muneca (`wrist`); no usa camaras externas ni vision estereo.
- Dataset muy pequeno: 38 episodios y 20.033 fotogramas, lo que limita la robustez ante variaciones de iluminacion, posicion de objetos o distractores.
- Sin resultados de evaluacion publicados: se desconoce la tasa de exito real en robot.
- Licencia no especificada: no se puede confirmar el uso comercial. La model card marca la licencia como "[More Information Needed]".
- Idiomas no documentados; la unica instruccion de tarea esta en ingles.
- Riesgo de sobreajuste al entorno de grabacion y al robot concreto del autor; puede requerir recalibracion en otro SO-101.
- Sin datos de sesgos, alucinacion o comportamiento fuera de distribucion; en robotica el fallo tipico es una accion incorrecta, no una alucinacion textual, pero el riesgo de ejecucion erronea existe.
- Repositorio con cero descargas y cero likes: no hay evidencia de uso por terceros ni de validacion independiente.
- La fecha de creacion del repositorio (2026-11-08) es posterior a la de la busqueda; conviene verificar la vigencia de los enlaces y del dataset asociado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eVorob/so101_bed_clear_smolvla
- Dataset de entrenamiento: https://huggingface.co/datasets/eVorob/so101_bed_clear_20261106_192231
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=eVorob/so101_bed_clear_20261106_192231
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Modelo relacionado `Temmp1e/so101_smolVLA`: https://huggingface.co/Temmp1e/so101_smolVLA
- Modelo relacionado `eVorob/so101_bed_clear`: https://huggingface.co/eVorob/so101_bed_clear
