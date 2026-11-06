# orchestrallabs/pi05-yam-red-cap-full-7500

## Resumen

pi05-yam-red-cap-full-7500 es un checkpoint de politica vision-language-action (VLA) obtenido mediante fine-tuning completo del modelo base pi0.5 de Physical Intelligence, desarrollado por orchestrallabs. El modelo resuelve una tarea concreta de manipulacion robotica de un solo brazo sobre una plataforma YAM con teleoperacion GELLO: recoger una tapa roja y colocarla en una caja negra. No es un modelo de lenguaje general, sino una politica de control que mapea tres vistas RGB y un vector de estado de 7 dimensiones a un chunk de 15 acciones de 7 dimensiones.

El checkpoint se publica en formato JAX/Orbax para la libreria OpenPI, con un total de 7.500 pasos de entrenamiento sobre 90 episodios (17.564 frames) de un dataset publico de 100 demostraciones. El repositorio ocupa 12,4 GB y esta liberado bajo licencia Apache 2.0. Su relevancia es practica: demuestra el flujo completo de adaptacion de pi0.5 a un robot y una tarea nuevos, incluyendo transformaciones de estado/accion, convenciones de gripper y estadisticas de normalizacion, todo reproducible a partir de los commits publicados.

Es importante subrayar que no es un modelo de proposito general ni un Transformers checkpoint: no puede cargarse con `AutoModel.from_pretrained` y su interfaz esta fijada a la configuracion exacta de camaras, estado y frecuencia de accion del entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) pi0.5 de Physical Intelligence; checkpoint JAX/Orbax para OpenPI |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (la entrada es un conjunto de observaciones por paso, no una secuencia de texto) |
| Tipos de cuantizacion | no disponible (checkpoint JAX/Orbax en punto flotante; no se documentan variantes GGUF ni int8) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | JAX/Orbax (no Transformers); incluye `openpi_config.json` y estadisticas de normalizacion en `assets/` |
| Dimension de estado/accion del modelo | 32 (OpenPI rellena las 7 dimensiones fisicas) |
| Interfaz robot | 7 valores: 6 articulaciones del brazo + 1 gripper |
| Chunk de accion | 15 x 7 (un segundo a 15 Hz) |
| Camaras | 3 vistas RGB: `middle -> base_0_rgb`, `left -> left_wrist_0_rgb`, `right -> right_wrist_0_rgb` |
| Convencion de gripper | Nativa YAM/Servo: 0 = cerrado, 1 = abierto (se invierte internamente para pi0.5) |
| Paso de entrenamiento | 7.500 |
| Tamano del repositorio | 12,4 GB |

## Arquitectura y entrenamiento

El modelo parte del checkpoint base oficial `gs://openpi-assets/checkpoints/pi05_base/params` y se somete a fine-tuning completo, sin LoRA ni pesos congelados. La configuracion es `Pi0Config(pi05=True, action_dim=32, action_horizon=15)`: el modelo opera con 32 dimensiones de estado/accion (de las cuales 7 son fisicas y el resto relleno de OpenPI) y predice un horizonte de 15 pasos de accion. La arquitectura subyacente es la de pi0.5, un VLA que combina percepcion visual multi-camara con generacion de acciones; la informacion proporcionada no detalla la composicion interna de capas ni el numero de parametros.

El entrenamiento usa las 100 demostraciones del dataset publico `npow/yam-gello-red-cap-100`, con tres streams de camara sincronizados, remuestreo temporal a 15 Hz y seleccion de las dimensiones del brazo izquierdo activo. El split es determinista: 90 episodios (17.564 frames) para entrenamiento y 10 episodios (1.993 frames) reservados, con IDs de episodio 6, 16, 26, 36, 46, 56, 66, 76, 86 y 96. El prompt fijo es `pick up the red cap and place it in the black box`. La configuracion incluye batch size 32, decaimiento coseno con 500 pasos de warm-up, LR pico de 2,5e-5 y final de 2,5e-6 a 10.000 pasos, EMA desactivada y semilla 42.

Una innovacion relevante del pipeline es el tratamiento de las transformaciones: el transform de YAM invierte el gripper a la convencion de pi0.5 antes de la normalizacion y lo revierte a la salida, los canales de articulacion 0-5 se entrenan como deltas y el canal del gripper permanece absoluto. Las estadisticas de normalizacion del split de entrenamiento convertido se incluyen en `assets/`.

## Capacidades

- Generacion de acciones de manipulacion robotica: produce chunks de 15x7 acciones a 15 Hz a partir de observaciones visuales y de estado.
- Percepcion visual multi-camara: consume tres vistas RGB sincronizadas (camara central, muneca izquierda, muneca derecha).
- Control de brazo de 6 articulaciones mas gripper de una sola pinza, con politica de dimension 7 lado-neutra.
- Ejecucion de una tarea tabletop especifica guiada por prompt fijo: recoger una tapa roja y colocarla en una caja negra.
- Integracion con el ecosistema OpenPI: inspeccion y despliegue mediante `servo model inspect hf://orchestrallabs/pi05-yam-red-cap-full-7500`.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, razonamiento textual, matematicas, codigo, vision general, audio ni modo thinking.

## Casos de uso

- Recogida y colocacion de piezas en linea de montaje: el modelo ejecuta la secuencia pick-and-place de una tapa sobre una caja con un brazo YAM; es adecuado porque el chunk de 15 acciones a 15 Hz cubre un segundo de movimiento continuo y suaviza la latencia de inferencia.
- Base para fine-tuning de tareas similares: al ser un fine-tune completo reproducible con commits publicados, sirve como punto de partida para adaptar pi0.5 a nuevas piezas o contenedores cambiando el dataset y el prompt.
- Validacion de pipelines de teleoperacion GELLO: permite comprobar de extremo a extremo la conversion de demostraciones, el remuestreo a 15 Hz y las transformaciones de estado/accion antes de escalar la recoleccion de datos.
- Prototipado de politicas lado-neutra: la interfaz de 7 dimensiones no elige brazo fisico, de modo que la aplicacion robotica puede enlazarla al brazo izquierdo o derecho manteniendo el otro en posicion mediante el controlador.
- Benchmark interno de manipulacion: con un split retenido de 10 episodios identificados, se puede medir la generalizacion del checkpoint frente a otros pasos de entrenamiento o configuraciones.
- Demostracion educativa de VLA en robotica de sobremesa: util para cursos o laboratorios que quieran mostrar el ciclo observacion-accion de un VLA con hardware asequible y datos publicos.
- Evaluacion de seguridad en despliegue robotico: sirve para probar capas de limites de articulacion, timeout-to-hold y parada de emergencia alrededor de una politica aprendida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio pesa 12,4 GB, lo que da una cota inferior orientativa del espacio de pesos, pero no se documenta el consumo en ejecucion ni el tipo numerico.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no disponible; no se confirma que quepa en RTX 4090 u otras tarjetas consumer.
- Opciones de despliegue: OpenPI con JAX/Orbax; inspeccion mediante `servo model inspect hf://orchestrallabs/pi05-yam-red-cap-full-7500`. No es compatible con vLLM, llama.cpp, Ollama ni TGI, ni con `AutoModel.from_pretrained`.
- Latencia y throughput: no disponibles; la frecuencia de control objetivo es 15 Hz (chunk de un segundo), pero no se publican tiempos de inferencia medidos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / horizonte | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| pi05-yam-red-cap-full-7500 | no disponible | chunk 15x7 a 15 Hz | Apache 2.0 | JAX/Orbax (OpenPI) | Hugging Face, 0 descargas |
| pi0.5 base (Physical Intelligence) | no disponible | no disponible | no disponible en la informacion | JAX/Orbax (OpenPI) | checkpoint oficial `gs://openpi-assets` |
| Otros fine-tunes de pi0.5 en OpenPI | no disponible | no disponible | no disponible | JAX/Orbax | no disponible |

La comparacion con alternativas de la misma categoria no puede completarse con datos verificables a partir de la informacion proporcionada; el unico pariente directo documentado es el checkpoint base pi0.5 del que deriva.

## Limitaciones y advertencias

- Especializacion extrema: el checkpoint esta ajustado a una unica tarea tabletop, un unico montaje de robot, una unica disposicion de camaras y un conjunto pequeno de 100 demostraciones; no debe tratarse como politica de manipulacion de proposito general.
- Sensibilidad a la configuracion: el rol y orden de las camaras, el orden del estado, la frecuencia de accion, las estadisticas de normalizacion y la semantica del gripper deben coincidir exactamente con el entrenamiento.
- Formato no estandar: no es un checkpoint Transformers; requiere OpenPI y JAX/Orbax, lo que limita su uso a ese ecosistema.
- Seguridad: el modelo no es un controlador de seguridad; el despliegue exige limites independientes de articulacion, velocidad y espacio de trabajo, comportamiento timeout-to-hold, controlador de retencion del brazo inactivo, primeras ejecuciones a velocidad reducida y parada de emergencia accesible.
- Brazo inactivo: la interfaz de 7 dimensiones es lado-neutra y no selecciona brazo fisico; la aplicacion debe decidir el brazo y mantener el otro bajo control.
- Idiomas: no se documenta soporte multilingue ni comportamiento linguistico; el prompt de entrenamiento es unico y en ingles.
- Sesgos y alucinacion: no se documentan sesgos especificos ni tasas de fallo; en el contexto de una politica robotica, el riesgo equivalente es la ejecucion de acciones incorrectas fuera de la distribucion de entrenamiento.
- Licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantias y las condiciones del modelo base pi0.5 deben verificarse por separado, ya que no se detallan en la informacion disponible.
- Madurez: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validacion por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/orchestrallabs/pi05-yam-red-cap-full-7500
- Dataset de entrenamiento: https://huggingface.co/datasets/npow/yam-gello-red-cap-100
- Rama de fine-tuning de OpenPI: https://github.com/npow/openpi/tree/feat/yam-redcap-finetune
- Ejemplo YAM en la rama de entrenamiento: https://github.com/npow/openpi/tree/feat/yam-redcap-finetune/examples/yam
- Commit base de OpenPI: `215abfb217dbac7d5f1273282331b9b1866c0479`
- Commit del pipeline de fine-tuning YAM: `8539331ec241dfa3b232fc792115548348567bc5`
- Checkpoint base pi0.5: `gs://openpi-assets/checkpoints/pi05_base/params`
