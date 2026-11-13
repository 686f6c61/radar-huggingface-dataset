# leejeonghun/act_pick-cube_chunk10

## Resumen

`leejeonghun/act_pick-cube_chunk10` es una política de imitación robótica entrenada con el método Action Chunking with Transformers (ACT), publicado en el artículo arXiv:2304.13705. No es un modelo de lenguaje: es un controlador visomotor que consume el estado articular del robot y dos flujos de imagen (cámara cenital y cámara de muñeca) y emite comandos de acción de 6 dimensiones. El autor es el usuario de Hugging Face `leejeonghun` y el modelo se ha generado y subido con la librería LeRobot de Hugging Face, versión 0.6.0.

El modelo resuelve una tarea concreta de manipulación: "Grab the black cube" (agarrar el cubo negro). Se ha entrenado exclusivamente con el dataset `leejeonghun/pick-cube_20261013_234552`, compuesto por 50 episodios y 21.886 fotogramas a 25 FPS de teleoperación sobre un robot de tipo `so_follower`. La arquitectura ACT predice trozos (chunks) de acciones de longitud 10 en lugar de pasos individuales, lo que reduce el error de acumulación y suaviza la ejecución.

Su relevancia es la de un artefacto reproducible de aprendizaje por imitación de extremo a extremo: pesos safetensors de 51.576.454 parámetros (unos 0,2 GB de repositorio), licencia Apache 2.0 y un pipeline de despliegue estándar dentro de LeRobot. No hay resultados de evaluación publicados ni métricas de éxito en robot real, por lo que debe tratarse como una política de referencia para replicar el flujo de trabajo, no como un componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decoder de acciones con chunking |
| Parametros totales | 51.576.454 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto textual; ventana de observación definida por la arquitectura ACT y el chunk de 10 acciones) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente fp32/fp16 según LeRobot; no se documentan variantes GGUF ni int8) |
| Idiomas soportados | no aplica (modelo de robótica; la instrucción de tarea es una cadena de texto fija: "Grab the black cube") |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot 0.6.0 |
| Tipo de robot | `so_follower` |
| Camaras | `overhead` y `wrist`, 3x480x640 cada una |
| Entrada de estado | `observation.state`, forma (6,) |
| Salida de accion | `action`, forma (6,) |
| Chunk de acciones | 10 |
| Dataset de entrenamiento | `leejeonghun/pick-cube_20261013_234552` (50 episodios, 21.886 fotogramas, 25 FPS) |
| Pasos de entrenamiento | 100.000 |
| Batch size | 8 |
| Optimizador | AdamW |
| Learning rate | 1e-5 |
| Semilla | 1000 |

## Arquitectura y entrenamiento

ACT es un transformer diseñado para aprendizaje por imitación que predice secuencias cortas de acciones (chunks) en lugar de una acción por paso de tiempo. El modelo combina un encoder de imágenes (las dos cámaras, `overhead` y `wrist`, a resolución 480x640) con el estado propioceptivo de 6 dimensiones del robot, y un decoder que genera el chunk de 10 acciones de 6 dimensiones. Esta formulación con chunks mitiga el problema de la varianza en la predicción paso a paso y permite un control más estable en tareas de manipulación. El número total de parámetros, 51.576.454, corresponde a la configuración típica de ACT en LeRobot con backbone ResNet y transformer de tamaño moderado.

El entrenamiento se realizó con 100.000 pasos, batch de 8, optimizador AdamW y learning rate de 1e-5, semilla 1000, sobre 50 episodios teleoperados de la tarea de agarrar un cubo negro. No se documenta el número total de tokens ni el uso de RLHF, DPO ni fases de ajuste posteriores; es aprendizaje supervisado puro sobre demostraciones. Tampoco se especifica si se aplicaron aumentos de datos ni la composición exacta de las posiciones de los objetos en el dataset. La única innovación técnica destacable es el propio chunking de acciones del método ACT, no hay decodificación especulativa, atención lineal ni componentes SSM.

## Capacidades

- Control visomotor de manipulación robótica: genera comandos de acción de 6 grados de libertad a partir de dos cámaras y del estado articular.
- Predicción de chunks de 10 acciones, lo que permite ejecutar trayectorias cortas de forma coherente.
- Ejecución condicionada a una instrucción de tarea en texto ("Grab the black cube"), aunque el modelo no es un modelo de lenguaje y no interpreta instrucciones libres.
- Aprendizaje por imitación de una única tarea; no hay evidencia de generalización a otras tareas u objetos.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni planificación de agentes en el sentido de los LLM.
- Sin capacidades multilingües: el texto de tarea es fijo y no se procesa semánticamente de forma abierta.
- Sin modo thinking, visión general, audio ni otras modalidades más allá de las dos cámaras RGB especificadas.

## Casos de uso

- Replicación de experimentos de ACT: sirve como punto de partida para verificar que la instalación de LeRobot, la calibración del robot `so_follower` y las cámaras funcionan antes de entrenar políticas propias.
- Demostración de aprendizaje por imitación en robótica de bajo coste: el modelo se ejecuta con `lerobot-rollout` sobre un robot SO-100/SO-101 y permite mostrar el ciclo completo teleoperación, entrenamiento y despliegue en talleres o docencia.
- Base para fine-tuning en tareas de pick-and-place: con 50 episodios y 100.000 pasos como referencia, se puede reentrenar con un dataset propio de agarre de objetos similares y comparar curvas de pérdida.
- Evaluación de pipelines de inferencia en tiempo real: al consumir dos cámaras a 640x480 y producir acciones a la frecuencia del robot, es útil para medir latencia de LeRobot en hardware de consumo.
- Pruebas de robustez ante cambios de iluminación y posición: al no haber evaluación publicada, el modelo sirve para diseñar un protocolo de pruebas (posiciones nuevas del cubo, distracciones, cambios de luz) y documentar tasas de éxito.
- Generación de datos sintéticos de trayectorias: las predicciones de chunks pueden registrarse y analizarse para estudiar la suavidad y la varianza de las acciones generadas por ACT frente a políticas paso a paso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No hay tasas de éxito en robot real, ni comparación con otras políticas, ni métricas de pérdida de validación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,6 millones de parámetros y dos cámaras a 480x640, la huella de pesos en fp32 ronda los 0,2 GB y en fp16 unos 0,1 GB, a lo que hay que sumar activaciones y buffers de imagen.
- GPU recomendadas: no documentadas por el autor. Por tamaño, cualquier GPU con al menos 4-8 GB de VRAM debería ser suficiente; se recomienda una RTX 3060/4060 o superior para margen.
- Cabe en GPU de consumo: previsiblemente sí, dado el reducido número de parámetros, aunque no hay confirmación oficial ni requisitos mínimos publicados.
- Opciones de despliegue: LeRobot con el comando `lerobot-rollout` (estrategia `base`), y entrenamiento con `lerobot-train`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. La ejecución depende de la frecuencia del robot y de la captura de dos cámaras OpenCV a 30 FPS según el ejemplo de la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / chunk | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `leejeonghun/act_pick-cube_chunk10` | 51.576.454 | chunk de 10 acciones | Agarrar cubo negro con `so_follower` | Apache 2.0 | Hugging Face, 0 descargas |
| ACT original (paper arXiv:2304.13705) | no disponible en la informacion | chunks de acciones | Manipulación con ALOHA | no disponible en la informacion | Paper y código de referencia |
| Otras políticas LeRobot (p. ej. Diffusion Policy, TDMPC) | no disponible en la informacion | no disponible | Manipulación diversa | no disponible en la informacion | Disponibles en el ecosistema LeRobot |

No se dispone de datos de rendimiento comparativo entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- No hay evaluación publicada: se desconoce la tasa de éxito real en robot, incluso en las condiciones exactas de entrenamiento.
- Entrenado con solo 50 episodios de una única tarea y un único objeto (cubo negro); es probable un sobreajuste al entorno, posiciones e iluminación del dataset.
- Requiere exactamente las mismas claves de observación (`observation.images.overhead`, `observation.images.wrist`, `observation.state`) y el mismo tipo de robot `so_follower`; un robot distinto o cámaras con otra resolución romperá la inferencia.
- La instrucción de tarea es fija; no es un modelo de lenguaje y no generaliza a instrucciones nuevas.
- Riesgo de alucinación no aplica en el sentido textual, pero sí de ejecutar acciones incorrectas o inseguras fuera de la distribución de entrenamiento.
- Sesgos conocidos: no documentados, aunque cabe esperar sesgo hacia las posiciones y condiciones visuales presentes en los 21.886 fotogramas del dataset.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación y de garantías hace desaconsejable su uso en producción sin validación propia.
- El repositorio tiene 0 descargas y 0 likes; es un artefacto reciente (creado y actualizado el 13 de noviembre de 2026) sin validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/leejeonghun/act_pick-cube_chunk10
- Dataset de entrenamiento: https://huggingface.co/datasets/leejeonghun/pick-cube_20261013_234552
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=leejeonghun/pick-cube_20261013_234552
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
