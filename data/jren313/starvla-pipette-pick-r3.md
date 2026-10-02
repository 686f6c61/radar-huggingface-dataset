# jren313/starvla-pipette-pick-r3

## Resumen

starvla-pipette-pick-r3 es un checkpoint de politica robótica (Vision-Language-Action, VLA) desarrollado por el usuario jren313 y publicado en HuggingFace. Se trata de un fine-tune completo del modelo base nvidia/GR00T-N1.7-3B, un VLA de aproximadamente 3.000 millones de parametros, entrenado con el framework starVLA para ejecutar una unica fase de un flujo de trabajo de pipeteo sobre un robot humanoide Unitree G1 equipado con manos Inspire. Concretamente, la tarea es "Pick up the pipette from the holder on the right with the right hand": la mano derecha debe coger la pipeta del soporte situado a la derecha mientras la izquierda permanece inactiva.

El modelo forma parte de una familia de siete checkpoints que cubren las cinco fases del protocolo (coger pipeta, coger tubo, apuntar, devolver tubo, devolver pipeta). Esta "ronda 3" amplia el espacio de accion respecto a la ronda 2, pasando de 18 a 32 dimensiones al anadir 14 articulaciones absolutas de brazo ademas de las munecas relativas y las manos absolutas. El checkpoint servido es `gr00t/checkpoints/steps_2000_pytorch_model.pt`, seleccionado por tener la menor perdida en el conjunto de validacion entre los guardados.

El modelo es relevante como ejemplo de investigacion aplicada en manipulacion bimanual fina con humanoides: demuestra el pipeline completo de captura por teleoperacion, entrenamiento con drop-out de estado para forzar el uso de vision, y evaluacion en unidades fisicas (milimetros, grados, registros) frente a una linea base de "permanecer quieto". El propio autor lo etiqueta como "research checkpoint" y advierte de que las politicas por fase todavia no completan su fase de forma fiable en el robot real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA starVLA `CosmosGR00TN1d7`: VLM Cosmos-Reason2-2B (`select_layer` 16) + cabeza DiT flow-matching alternate-VL de 32 capas |
| Parametros totales | ~3.000 millones (modelo base etiquetado como 3B; 1.031 tensores cargados 1:1 desde nvidia/GR00T-N1.7-3B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint en precision de entrenamiento, `.pt`) |
| Idiomas soportados | no disponible (las frases de tarea del dataset estan en ingles) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`pytorch_model.pt`); repositorio de 19,1 GB |
| Espacio de accion | 32-D: munecas relativas al chunk + manos Inspire absolutas + 14 articulaciones absolutas de brazo |
| Horizonte de accion | Chunks de 30 pasos (0,5 s a 60 Hz) |
| Pasos de inferencia (flow-matching) | 4 |
| Slot de embodiment | 25 |

## Arquitectura y entrenamiento

El modelo se construye sobre la implementacion `CosmosGR00TN1d7` de starVLA, inicializada desde nvidia/GR00T-N1.7-3B. La arquitectura combina un backbone VLM (Cosmos-Reason2-2B) que procesa las imagenes y la frase de tarea con una cabeza de difusion (DiT) de 32 capas con atencion alterna vision-lenguaje, entrenada mediante flow-matching con solo 4 pasos de inferencia. El fine-tune es completo: se ajustan tanto el LLM (`tune_llm`) como el codificador visual (`tune_visual`), con gradient checkpointing. Los 1.031 tensores del modelo base se cargan 1:1, lo que indica compatibilidad total de arquitectura.

La observacion incluye dos camaras (RGB de cabeza a 1280x720 y `wrist_left` eye-in-hand a 1080x1080, redimensionadas a 270 y recortadas a 256 en el servicio), la frase de tarea y un vector de estado de 59 dimensiones: 29 articulaciones, pose6 de muneca izquierda/derecha medidas, pose6 de muneca comandadas, y registros comandados de pulgar izquierdo y mano derecha. Se aplica un **state dropout de 0,8**: el vector de estado completo se pone a cero en el 80 % de las muestras de entrenamiento, forzando al modelo a leer la informacion de las camaras en lugar de apoyarse en la propiocepcion.

El conjunto de datos es jren313/g1-pipette-2view-teleop0925-5task-eerel: 237 episodios teleoperados a 60 Hz, con una frase de objetivo por fase. Cada fase entrena de forma aislada con los episodios de su propio paso, usando una division train/test a nivel de grabacion (las mitades de "coger" y "devolver" de una grabacion permanecen en el mismo lado). Se descartan anclas de entrenamiento cuando ninguna muneca comandada se mueve 1 mm durante el chunk (filtro de pausas, solo en el mixto de entrenamiento). Las estadisticas de normalizacion se calculan por fase sobre sus propios episodios y nunca se comparten entre espacios de accion.

La optimizacion usa paged AdamW de 8 bits, betas (0,9; 0,95), weight decay 0, learning rate 2e-5 para backbone e interfaz VL y 2e-4 para la cabeza de accion, scheduler coseno hasta 1e-6 tras 100 pasos de warmup, clipping de norma de gradiente a 1,0, batch de 128 (32 x 4 GPU, sin acumulacion), 10 epocas y semilla 42. La seleccion del checkpoint se hace por MSE de validacion sobre un segmento fijo de 480 muestras (4 rangos x 10 batches x 12), aproximadamente una vez por epoca. El checkpoint de 2000 pasos es el mejor guardado; el entrenamiento termino en el paso 2856.

## Capacidades

- Generacion de acciones motoras de manipulacion bimanual: produce chunks de 30 acciones a 60 Hz para munecas, manos Inspire y articulaciones de brazo del Unitree G1.
- Control viso-motor robusto a la perdida de estado: gracias al state dropout de 0,8, el modelo aprende a guiarse por las camaras cuando la propiocepcion no esta disponible.
- Ejecucion de una tarea dirigida por lenguaje: condiciona el comportamiento a la frase de tarea ("Pick up the pipette from the holder on the right with the right hand."), lo que en principio permite reutilizar el mismo backbone para otras fases cambiando la instruccion.
- Percepcion multimodal: procesa simultaneamente una vista de cabeza y una vista de muneca (eye-in-hand), crucial en tareas de precision milimetrica.
- Salida de acciones con munecas relativas al chunk: la accion de muneca se expresa como diferencia respecto a la pose comandada en el primer paso del chunk, con la rotacion compuesta en el marco del ancla, lo que mejora la generalizacion a posiciones iniciales variadas.
- Soporte de tool calling / function calling: no aplica.
- Soporte de agentes y razonamiento multi-paso: no disponible; el modelo ejecuta una unica fase sin planificacion explicita. Las cinco fases se gestionan mediante checkpoints independientes.
- Capacidades multilingues: no disponible.

## Casos de uso

- Investigacion en manipulación bimanual con humanoides: el checkpoint sirve como punto de partida reproducible para estudiar como el aumento del espacio de accion (de 18-D a 32-D con articulaciones absolutas) afecta al exito de una tarea de pick. Es directamente comparable con jren313/starvla-pipette-pick-r2, su predecesor con espacio de 18-D.
- Automatizacion de laboratorio (pipeteo): en un flujo de trabajo de cinco pasos sobre un banco de laboratorio, este checkpoint cubre la fase 1 (coger la pipeta del soporte derecho). Se encadenaria con starvla-pipette-tube-pick-r2, starvla-pipette-aim-r1, starvla-pipette-tube-return-r1 y starvla-pipette-return-r1 para completar el ciclo.
- Generacion de datos sinteticos y evaluacion de politicas: al ser un checkpoint con estadisticas de normalizacion publicadas (`dataset_statistics.json`), permite reproducir exactamente la inferencia y comparar politicas en el mismo slice de 480 muestras.
- Estudio de robustez a la perdida de sensores: el state dropout de 0,8 lo convierte en un banco de pruebas para medir cuanto depende una politica VLA de la propiocepcion frente a la vision.
- Fine-tuning sobre nuevas tareas de pick and place: al ser un fine-tune completo de GR00T-N1.7-3B con la receta de starVLA documentada (`training yaml` y `launcher` incluidos), sirve como plantilla para nuevas tareas con captura de dos vistas.
- Benchmarking de cabezas de accion: el autor compara explicitamente estos checkpoints GR00T por fase con cabezas QwenOFT entrenadas sobre las mismas particiones, lo que permite usar el modelo como referencia en estudios de diseño de cabeza de accion.
- Desarrollo de pipelines de inferencia con flow-matching de pocos pasos: con solo 4 pasos de inferencia y chunks de 0,5 s, es adecuado para prototipar control en tiempo real sobre GPU de gama alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, LIBERO, etc.) en la informacion disponible. La model card describe la metodologia de seleccion: MSE de validacion sobre un slice fijo de 480 muestras y comparacion en unidades fisicas (milimetros, grados, registros) frente a las etiquetas reales y frente a una linea base de "permanecer quieto". Sin embargo, no se proporcionan los valores numericos de esas comparaciones para este checkpoint.

| Metrica | Resultado |
|---|---|
| Benchmarks estandar (MMLU, HumanEval, GSM8K, LIBERO...) | no disponible |
| MSE de validacion en holdout (480 muestras) | valor no disponible; se indica que el checkpoint de 2000 pasos es el de menor perdida entre los guardados |
| Comparacion en unidades fisicas vs. linea base "hold still" | valor no disponible |
| Checkpoint servido | steps_2000 (paso final de entrenamiento: 2856) |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia, un modelo de ~3.000 millones de parametros en bf16/fp16 ocupa aproximadamente 6-7 GB de pesos, a lo que hay que sumar la memoria de las activaciones del backbone visual (Cosmos-Reason2-2B) y de la cabeza DiT de 32 capas. El repositorio completo ocupa 19,1 GB porque incluye varios checkpoints y artefactos de entrenamiento, no porque la inferencia requiera esa memoria.
- GPU recomendadas: el autor no especifica ninguna. El entrenamiento se realizo en 4 GPU (batch 32 por GPU, sin acumulacion), lo que sugiere GPU de clase A100/H100 o similar para el fine-tune. Para inferencia de un modelo de este tamano, GPU con >=16 GB son un punto de partida razonable, pero no hay dato confirmado.
- Compatibilidad con GPU de consumo: no confirmada. Un modelo de 3B en bf16 podria caber en tarjetas de 16 GB o superiores (por ejemplo RTX 4080/4090), pero no hay validacion publicada.
- Opciones de despliegue: el servicio de referencia es el stack de starVLA, que carga `pytorch_model.pt` junto con `dataset_statistics.json` (la model card insiste en servir exactamente con ese fichero). No hay soporte documentado para llama.cpp, Ollama, vLLM o TGI, dado que no es un modelo de lenguaje puro sino un VLA con cabeza de accion y flujo de control a 60 Hz.
- Latencia y throughput: no disponibles numericamente. Restriccion importante: para operar en tiempo real con chunks de 30 pasos a 60 Hz, la inferencia de cada chunk debe completarse por debajo de 0,5 s, incluyendo los 4 pasos de flow-matching.

## Comparativa con modelos similares

La comparacion mas directa es con los propios checkpoints hermanos de la familia, que comparten backbone, receta de entrenamiento y dataset, y difieren en la fase, el espacio de accion y el checkpoint servido.

| Modelo | Parametros | Contexto | Espacio de accion | Checkpoint servido | Licencia |
|---|---|---|---|---|---|
| starvla-pipette-pick-r3 (este) | ~3B | no disponible | 32-D: munecas rel + manos abs + articulaciones | steps_2000 | no disponible |
| starvla-pipette-pick-r2 | ~3B | no disponible | 18-D: munecas rel + manos abs | steps_2000 | no disponible |
| starvla-pipette-tube-pick-r2 (fase 2, la mas reciente) | ~3B | no disponible | 32-D: munecas rel + pulgar izq. rel + mano der. abs + articulaciones | steps_1000 | no disponible |
| nvidia/GR00T-N1.7-3B (modelo base) | ~3B (etiquetado 3B) | no disponible | no disponible (modelo generalista) | no aplica | no disponible |

La diferencia clave frente a r2 es la incorporacion de 14 articulaciones absolutas en el espacio de accion (18-D pasa a 32-D); segun la model card, estas articulaciones solo se usan para inicializar en caliente el IK del bridge. Frente a los checkpoints de fases posteriores (2 a 5), r3 es la unica variante que conserva solo munecas relativas y manos absolutas mas articulaciones, mientras que las fases 2-5 usan pulgar izquierdo relativo y mano derecha absoluta. No se dispone de comparativas con modelos externos como OpenVLA o pi0 en la informacion proporcionada.

## Limitaciones y advertencias

- Estado de investigacion: el propio autor indica que, aunque los checkpoints GR00T por fase funcionan claramente mejor que las cabezas QwenOFT sobre las mismas particiones, **todavia no completan su fase de forma fiable** en el robot real. No es un modelo listo para produccion.
- Alcance muy estrecho: el modelo ejecuta una sola fase de una sola tarea (coger la pipeta del soporte derecho) sobre un unico embodiment (Unitree G1 con manos Inspire). No generaliza a otras tareas, robots ni morfologias sin reentrenamiento.
- Dependencia de la configuracion de servicio: la model card advierte que hay que servir el modelo exactamente con `gr00t/dataset_statistics.json`, ya que las estadisticas de normalizacion se calculan por fase y no son intercambiables entre espacios de accion. Usar otras estadisticas invalida la inferencia.
- Normalizacion no comparable entre espacios: el propio autor advierte de que el MSE normalizado no es comparable entre espacios de accion; la evaluacion valida debe hacerse en unidades fisicas (mm, grados, registros).
- Riesgo de alucinacion: no aplica en el sentido textual, pero si existe riesgo de acciones fisicas incorrectas o inseguras cuando la politica falla; se recomienda operar con limites de par y paradas de emergencia.
- Sesgos de datos: el modelo aprende de 237 episodios teleoperados por un operador humano en un montaje concreto. La posicion de la pipeta, del soporte, la iluminacion y el fondo estan fijados por los datos, por lo que cualquier variacion del entorno puede degradar el rendimiento. No se han publicado analisis de sesgos.
- Licencia no disponible: no se especifica la licencia del checkpoint en la model card ni en los metadatos de HuggingFace, por lo que **no se puede confirmar el uso comercial**. El modelo base (nvidia/GR00T-N1.7-3B) tiene su propia licencia, que hay que consultar por separado.
- Idiomas no disponibles: no se documenta que idiomas soporta la frase de tarea; los datos de entrenamiento estan en ingles.
- Madurez del repositorio: 0 descargas y 0 likes en el momento de la consulta, con la ultima actualizacion en octubre de 2026 (fecha de los metadatos). Es un artefacto de investigacion de un unico autor.
- Huella de disco: 19,1 GB de repositorio, al incluir checkpoint servido, modelo final de entrenamiento, logs y configuraciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jren313/starvla-pipette-pick-r3
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.7-3B
- Dataset de entrenamiento: https://huggingface.co/datasets/jren313/g1-pipette-2view-teleop0925-5task-eerel
- Checkpoint hermano fase 1, ronda 2: https://huggingface.co/jren313/starvla-pipette-pick-r2
- Checkpoint hermano fase 2: https://huggingface.co/jren313/starvla-pipette-tube-pick-r2
- Checkpoint hermano fase 2 (superado): https://huggingface.co/jren313/starvla-pipette-tube-pick-r1
- Checkpoint hermano fase 3: https://huggingface.co/jren313/starvla-pipette-aim-r1
- Checkpoint hermano fase 4: https://huggingface.co/jren313/starvla-pipette-tube-return-r1
- Checkpoint hermano fase 5: https://huggingface.co/jren313/starvla-pipette-return-r1
- Repositorio starVLA: https://github.com/starVLA/starVLA
- Paper de starVLA: https://arxiv.org/html/2604.05014v1
- Repositorio relacionado (ronda 15, teleop + HIL): https://huggingface.co/jren313/starvla_gr00t_n1d7_pipette_3view_nohist_plus21p12_hil46
- Datasets del autor: https://huggingface.co/jren313/datasets
