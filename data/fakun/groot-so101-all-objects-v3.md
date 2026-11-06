# FAKUN/groot-so101-all-objects-v3

## Resumen

GR00T SO-101 All Objects v3 es un modelo de visión-lenguaje-acción (VLA) para robótica, publicado por el usuario FAKUN en Hugging Face. Consiste en un ajuste fino del modelo base NVIDIA GR00T-N1.5-3B sobre un brazo robótico de seis ejes SO-101, con el objetivo de ejecutar una tarea concreta de manipulación: recoger todos los objetos de una mesa e introducirlos en una caja, guiándose por la instrucción en lenguaje natural "Put all the objects on the table into the box".

El modelo conserva la arquitectura del GR00T N1.5 original (torre visual SigLIP2, backbone lingüístico Qwen3-1.7B y una cabeza de acción basada en DiT), pero solo se han entrenado los componentes de la cabeza de acción y los proyectores asociados, unos 0,75 B de parámetros, mientras que el backbone permanece congelado y es idéntico byte a byte al del modelo oficial. El resultado es un checkpoint de aproximadamente 2.724 millones de parámetros totales y 7,6 GB en safetensors, distribuido bajo licencia MIT.

Su relevancia es doble. Por un lado, demuestra el flujo completo de ajuste fino de un VLA sobre un robot de bajo coste tipo SO-101 con el ecosistema LeRobot. Por otro, el propio autor documenta que esta versión se entrenó sobre datos con desalineación temporal entre imagen y estado de las articulaciones, lo que provoca que el modelo tenga un loss offline bajo pero falle en la ejecución real sobre el robot. Se presenta, por tanto, como un ejemplo negativo o caso de estudio sobre la importancia de la canalización de datos, más que como un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en GR00T N1.5: torre visual SigLIP2, backbone de lenguaje Qwen3-1.7B y cabeza de acción DiT con codificadores de estado/acción |
| Parámetros totales | 2.724.163.520 |
| Parámetros activos | No aplica (no es MoE); aproximadamente 0,75 B entrenables en la cabeza de acción |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible (la instrucción de la tarea está en inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (dos shards: 4,7 GB y 2,4 GB) más config.json, model.safetensors.index.json y experiment_cfg/metadata.json |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de NVIDIA GR00T N1.5-3B: un sistema VLA que combina una torre visual SigLIP2 para procesar las imágenes de cámara, un backbone de lenguaje Qwen3-1.7B que interpreta la instrucción, y una cabeza de acción basada en un transformer de difusión (DiT) que genera las acciones motoras. En este ajuste fino solo se entrenaron la cabeza de acción, los codificadores de estado y acción y el proyector, sumando unos 0,75 B de parámetros; el backbone visual y lingüístico se mantuvo congelado e idéntico al del modelo base oficial. El autor advierte que el campo `tune_visual: true` presente en `config.json` es un valor escrito durante la construcción y no implica que la torre visual se descongelara durante el entrenamiento.

El entrenamiento se realizó durante 30.000 pasos con batch de 16 sobre un dataset propio de 102 episodios y 51.209 fotogramas a 15 fps, con un `train_loss` final de 0,08. La entrada consiste en dos cámaras (frontal y de muñeca) a resolución 640×360 y 15 fps, y la salida es un espacio de acción de 6 dimensiones de ángulos articulares en grados más el gripper en un rango de 0 a 100. El aspecto crítico es que, según documenta el autor, el dataset presentaba un desalineamiento temporal de entre 3 y 8 segundos entre cada fotograma y el estado de las articulaciones, porque el script de recorte de vídeo no reescribió las marcas de tiempo. Esto explica que el loss offline sea bajo pero el comportamiento en el robot real sea deficiente.

## Capacidades

- Generación de acciones motoras de 6 grados de libertad más gripper a partir de instrucciones en lenguaje natural y observaciones visuales de dos cámaras.
- Ejecución de una tarea de manipulación concreta: recoger todos los objetos de una mesa e introducirlos en una caja.
- Percepción visual multimodal con dos flujos de imagen (cámara frontal y cámara de muñeca) a 640×360 y 15 fps.
- Comprensión de instrucciones en lenguaje natural para condicionar la política de control.
- Integración con el ecosistema LeRobot para el formato de datos y el control del robot SO-101.
- Despliegue mediante un servidor de políticas que expone el modelo por red para que un cliente controle el brazo robótico.
- No se documentan capacidades de tool calling, razonamiento multi-paso en texto ni otras tareas distintas a la manipulación entrenada.

## Casos de uso

- Estudio de canalizaciones de datos en robótica: el modelo sirve como caso de referencia para ilustrar cómo un desalineamiento temporal entre imagen y estado degrada el rendimiento en tiempo real pese a un loss offline bajo, útil en formación y auditoría de pipelines.
- Reproducción del flujo completo de ajuste fino VLA: permite recorrer las etapas de captura, conversión, entrenamiento y despliegue con GR00T N1.5 y LeRobot sobre un SO-101, siguiendo la documentación del proyecto SO101-GR00T.
- Base para reentrenamiento corregido: partiendo de esta receta, un equipo puede corregir las marcas de tiempo del dataset y reentrenar para obtener un modelo funcional; el autor indica que la versión corregida alcanza un `train_loss` de 0,0127.
- Validación de infraestructura de despliegue: el servidor de políticas con consumo de aproximadamente 5,6 GB de VRAM permite probar la integración cliente-servidor entre un equipo con GPU y el robot antes de invertir en datos de calidad.
- Docencia y divulgación sobre VLA: como ejemplo didáctico de qué es un modelo visión-lenguaje-acción, cómo se compone y qué partes se congelan frente a cuáles se entrenan.
- Pruebas de protocolos de seguridad en robótica: al ser un modelo que falla en la ejecución real, resulta adecuado para ensayar mecanismos de parada, límites de par y supervisión humana antes de desplegar políticas funcionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento reportado por el autor es el `train_loss` final de 0,08, que no constituye una evaluación de éxito en tarea real; de hecho, el autor señala que el modelo falla al agarrar objetos en el robot físico.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5,6 GB según el autor, suficiente para ejecutar el servidor de políticas.
- GPU recomendadas: no se especifican modelos concretos; cualquier GPU con al menos 6 GB de VRAM debería poder alojar el servidor de políticas en precisión original.
- Cabe en GPU de consumo: sí, dado el consumo de unos 5,6 GB, es compatible con tarjetas de gama media con 8 GB o más.
- Opciones de despliegue: servidor de políticas propio del proyecto (`scripts/deploy/100_policy_server_jpeg.py`) y cliente `scripts/deploy/run_groot_official.py`; integración con LeRobot para el formato de datos y el control del robot. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un modelo de acción.
- Latencia y throughput: no disponibles. La captura de entrada opera a 15 fps.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FAKUN/groot-so101-all-objects-v3 | 2,72 B (0,75 B entrenables) | No disponible | Manipulación SO-101 (recoger objetos) | MIT | Hugging Face, 22 descargas |
| nvidia/GR00T-N1.5-3B | Aproximadamente 3 B | No disponible | VLA generalista para robots | No disponible en la información | Modelo base en Hugging Face |
| Políticas LeRobot para SO-101 | No disponible | No disponible | Control de SO-101 | No disponible | Documentación de LeRobot |

La comparación se limita al modelo base y al ecosistema LeRobot, ya que no se dispone de datos de benchmarks ni de otras políticas comparables en la información proporcionada.

## Limitaciones y advertencias

- El autor advierte explícitamente de que los pesos se entrenaron sobre datos con desalineación temporal de 3 a 8 segundos entre imagen y estado articular, lo que provoca fallos de agarre en el robot real pese al bajo loss offline. No se recomienda su uso directo para control real.
- Modelo entrenado para una única tarea y un único robot (SO-101); no generaliza a otras instrucciones, objetos o plataformas sin reentrenamiento.
- No ha sido evaluado a gran escala; el propio autor indica que debe validarse antes de cualquier uso real.
- Riesgo de alucinación en el sentido de generar acciones plausibles pero incorrectas, agravado por el problema de alineación temporal.
- Idiomas soportados no documentados; la instrucción de entrenamiento está en inglés.
- Licencia MIT, que permite uso comercial, pero la ausencia de validación y los defectos conocidos desaconsejan cualquier despliegue en producción.
- El campo `tune_visual: true` de `config.json` puede inducir a error sobre qué partes se entrenaron; el backbone permanece congelado.
- La falta de `experiment_cfg/metadata.json` impide arrancar el servidor de políticas, ya que contiene las estadísticas de normalización.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FAKUN/groot-so101-all-objects-v3
- Proyecto SO101-GR00T: https://github.com/Morantkk/SO101-GR00T
- Modelo base NVIDIA Isaac-GR00T: https://github.com/NVIDIA/Isaac-GR00T
- Modelo base en Hugging Face: https://huggingface.co/nvidia/GR00T-N1.5-3B
- LeRobot de Hugging Face: https://github.com/huggingface/lerobot
- Documentación de LeRobot para SO-101: https://huggingface.co/docs/lerobot/so101
