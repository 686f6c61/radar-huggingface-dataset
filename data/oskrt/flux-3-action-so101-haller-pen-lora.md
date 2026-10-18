# Oskrt/flux-3-action-so101-haller-pen-lora

## Resumen

Oskrt/flux-3-action-so101-haller-pen-lora es un adaptador LoRA (PEFT) sobre el modelo base black-forest-labs/flux-3-action-so101, un modelo de política viso-lenguaje-acción de la familia FLUX 3 Action orientado a control robótico. El adaptador fue entrenado por el usuario Oskrt durante el hackathon ERH Physical AI Hackathon (17 y 18 de octubre de 2026, track «Imagine, Then Act») para una única tarea sobre un brazo SO-101 de un XLeRobot estático de dos brazos denominado «Haller».

La tarea se define con la cadena literal `put the red pen in its slot in the cardboard box` y se entrena con 84 tomas de teleoperación por VR del dataset Oskrt/haller_put_the_red_pen_in_its_slot_in_the_cardboard_box, repartidas en 4 layouts, convertidas a un único brazo de 6 grados de libertad (el brazo izquierdo del robot, que corresponde a las columnas `right_*` del dataset). Otras 12 tomas quedan reservadas para validación y nunca se usan en entrenamiento.

Es relevante ahora porque documenta un flujo completo de ajuste fino de una política fundacional de manipulación sobre hardware de bajo coste (SO-101) y porque el autor publica de forma explícita los detalles de normalización, el contrato de observación y las curvas de pérdida en validación, algo poco habitual en adaptadores de hackathon. El checkpoint incluido es el adaptador EMA en el microstep 5.000 de 20.000 (entrenamiento aún en curso) y no ha sido evaluado todavía en el robot real.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre FLUX 3 Action (modelo de política viso-lenguaje-acción con objetivo de flow matching); no se detalla la arquitectura interna del modelo base en la información disponible |
| Parametros totales | no disponible (el adaptador LoRA no declara recuento; el modelo base no publica el dato en la información proporcionada) |
| Parametros activos | no aplicable (no es un modelo MoE según la información disponible) |
| Longitud de contexto | no aplicable como contexto de lenguaje; historial de observación de 8 pasos y chunk de acción de 42 pasos predichos / 32 ejecutados |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantización declarada) |
| Idiomas soportados | no disponible (el codificador de texto se congela durante el entrenamiento; no se declaran idiomas) |
| Licencia | FLUX Kommunity License v1.0 (flux-kommunity-license-v1.0), solo uso no comercial |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) más ficheros JSON de configuración y safetensors de estadísticas de pre/postprocesado |
| Modelo base | black-forest-labs/flux-3-action-so101 |
| Libreria | peft (inferencia vía LeRobot con la política `flux3`) |
| Tamano del repo | 0,9 GB |
| Tarea | `put the red pen in its slot in the cardboard box` |
| Frecuencia de control | 30 fps |
| Guiado (guidance) | 1.0 (vídeo y acción) |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-17 |

## Arquitectura y entrenamiento

El adaptador se aplica sobre FLUX 3 Action, un modelo de política que combina un backbone transformer con un objetivo de flow matching (la pérdida reportada es «flow-matching loss») y cabezas de acción específicas. El ajuste fino usa LoRA con rango y alpha 32 sobre las proyecciones de atención y MLP, mantiene entrenables las cabezas de acción y congela el codificador de texto. La configuración de entrenamiento es la de LeRobot `examples/flux3/lora.json`, con learning rate 1e-4, EMA 0.999, batch 2 con acumulación de gradiente 4 y aproximadamente 1,0 s por microstep en una única RTX PRO 6000 de 96 GB. El adaptador EMA incluido corresponde al microstep 5.000 de 20.000 y el repositorio se actualiza in situ cuando un checkpoint posterior obtiene mejor pérdida; cada subida se etiqueta como `step-<N>`.

Los datos son 84 tomas de entrenamiento de teleoperación por VR (4 layouts distintos) del dataset del propio autor, convertidas a un único brazo de 6 ejes. El autor recalcula las estadísticas de normalización sobre esas 84 tomas (variante que denomina «B84»): cuantiles q01/q99 propios para estado y acción, sin transformaciones articulares y con el gripper en valor absoluto tal como se registró. Los ficheros `policy_preprocessor.json`, `policy_postprocessor.json` y los tres `policy_*processor_step_*.safetensors` del repositorio contienen esas estadísticas, y `normalization_source.json` las documenta. El autor advierte explícitamente que usar el adaptador con las estadísticas originales del paquete publicado no funciona, porque provienen de un dataset SO-100 legado en grados que no coincide con la calibración actual de LeRobot (referencia a black-forest-labs/flux-action issue #2).

## Capacidades

- Ejecución de una única tarea de manipulación pick-and-place: introducir un bolígrafo rojo en su ranura dentro de una caja de cartón.
- Control de un brazo SO-101 de 6 articulaciones en modo grados de LeRobot (0 en el centro del rango calibrado) con gripper de 0 a 100 donde 100 significa abierto.
- Salida de acciones como deltas articulares por tick en grados, más posición absoluta del gripper.
- Consumo de dos cámaras: `observation.images.scene` (cámara de cabeza, Intel RealSense D455 en color, 640x480, sin rotar) y `observation.images.wrist` (cámara de muñeca, 640x480, rotada 180 grados en la captura).
- Condicionamiento por cadena de texto de la tarea (el prompt literal de entrenamiento indicado arriba).
- Historial de 8 observaciones y predicción de chunks de 42 pasos con ejecución de 32.
- No se declaran capacidades de tool calling, agentes, razonamiento multi-paso, matemáticas, visión general, audio ni modo de pensamiento; es un modelo específico de política robótica.
- Capacidades multilingües: no disponibles; el codificador de texto está congelado y no se documenta comportamiento en otros idiomas.

## Casos de uso

- Automatización de una celda pick-and-place de laboratorio: el adaptador puede gobernar el brazo izquierdo de un XLeRobot para depositar un objeto alargado en un receptáculo fijo, con el ciclo a 30 fps y chunks de 32 acciones ejecutadas, siempre detrás de una capa de seguridad propia (límites articulares, límite de pasos por tick y zona de exclusión).
- Base para comparar estrategias de ajuste fino en robótica de bajo coste: al publicar la curva de pérdida de validación en 12 tomas reservadas, sirve como referencia reproducible para estudiar el efecto del rango LoRA, la normalización o el número de microsteps en una política FLUX 3 Action sobre SO-101.
- Validación de pipelines de datos de teleoperación VR: el adaptador documenta el contrato exacto de observación (grados, gripper 0..100, cámaras y sus rotaciones), por lo que es útil para comprobar que una captura nueva cumple el formato antes de entrenar.
- Prueba de integración de LeRobot con PEFT: el código de la model card muestra cómo fusionar el adaptador con `PeftModel.from_pretrained(...).merge_and_unload()` y construir pre/postprocesadores desde la carpeta base, lo que permite validar el stack de despliegue de la política `flux3` en un entorno controlado.
- Investigación en normalización de acciones: el repositorio incluye estadísticas q01/q99 recalculadas y su justificación, lo que lo convierte en un caso de estudio sobre cómo la normalización heredada de un dataset SO-100 en grados degrada el rendimiento en calibraciones actuales.
- Docencia y demostraciones de hacking en robótica: por su tamaño (0,9 GB de adaptador) y su tarea acotada, es adecuado para talleres donde se muestre el ciclo completo de captura, entrenamiento LoRA y despliegue en un brazo SO-101, con la advertencia de que no ha sido evaluado aún en el robot real.
- Reproducción de resultados de hackathon: permite a otros equipos partir del mismo checkpoint (step 5.000, EMA) y de la misma partición de validación (A 20-22, B 36-38, C 86-88, D 101-103) para comparar variantes de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible; no aplican a un modelo de política robótica. El autor sí publica la pérdida de flow matching en validación sobre 256 muestras de las 12 tomas reservadas:

| Microstep | Pérdida de flow matching (held-out) |
|---|---|
| 500 | 0,261 |
| 1.000 | 0,249 |
| 1.500 | 0,231 |
| 2.000 | 0,231 |
| 2.500 | 0,233 |
| 3.000 | 0,223 |
| 3.500 | 0,226 |
| 4.000 | 0,219 |
| 4.500 | 0,226 |
| 5.000 | 0,210 |

No hay métricas de éxito en robot real, ni tasas de acierto por layout, ni comparación con otros checkpoints del mismo hackathon. El autor indica explícitamente que el adaptador «not yet evaluated on the real robot».

## Requisitos de hardware

- Entrenamiento documentado: una única RTX PRO 6000 de 96 GB, con batch 2 y acumulación de gradiente 4, a aproximadamente 1,0 s por microstep (20.000 microsteps previstos).
- VRAM de inferencia: no disponible. No se publica el tamaño del modelo base ni el consumo en inferencia; el adaptador LoRA ocupa 0,9 GB, pero requiere cargar y fusionar los pesos completos de black-forest-labs/flux-3-action-so101.
- GPU recomendadas: no disponible para inferencia. Por el perfil de entrenamiento (96 GB en una sola GPU), es razonable esperar requisitos de gama de centro de datos, pero no hay medición publicada.
- ¿Cabe en GPU de consumo? no disponible; no se han publicado pruebas en RTX 4090, 3090 u otras.
- Opciones de despliegue: LeRobot con la política `flux3` y PEFT instalado (flujo indicado en la model card: descargar el base, sobrescribir los ficheros de pre/postprocesado con los del adaptador y fusionar con `merge_and_unload()`). No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. El único dato temporal es la velocidad de entrenamiento, no de inferencia. El control opera a 30 fps según el contrato del autor, pero no se reporta si el modelo alcanza ese régimen en hardware concreto.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados en la información proporcionada. La única comparación posible sería con otros adaptadores SO-101 del mismo hackathon o con la política base sin ajustar, y no hay cifras de ninguno de ellos.

| Modelo | Parametros | Contexto / historial | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| flux-3-action-so101-haller-pen-lora (este) | no disponible | 8 observaciones, chunk 42/32 | pérdida held-out 0,210 en step 5.000; sin evaluación en robot | FLUX Kommunity License v1.0 (no comercial) | HuggingFace, 0 descargas, 0 likes |
| black-forest-labs/flux-3-action-so101 (base) | no disponible | no disponible en la información aportada | no disponible | FLUX Kommunity License v1.0 | HuggingFace (requiere aceptar licencia) |
| Otros adaptadores SO-101 del ERH Physical AI Hackathon | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No evaluado en el robot real: el propio autor indica que debe ejecutarse solo detrás de una capa de seguridad propia con límites articulares, límite de pasos por tick, zona de exclusión de trabajo y límites de par o carga.
- Normalización crítica: usar las estadísticas originales del paquete SO-101 no funciona; es obligatorio sustituir los ficheros `policy_*processor*` por los del repositorio (variante B84).
- Especialización extrema: el adaptador solo cubre una tarea, un brazo (el izquierdo) y un montaje estático concreto (XLeRobot «Haller», dos brazos SO-101). No generaliza a otras tareas, objetos, layouts ni brazos sin reentrenar.
- Checkpoint intermedio: corresponde al step 5.000 de 20.000, con entrenamiento aún en curso; los pesos pueden cambiar y las etiquetas `step-<N>` identifican cada versión.
- Dependencia de calibración y hardware: el contrato exige modo grados de LeRobot, gripper 0..100 con 100 = abierto, posición inicial `[0, 0, 0, 0, 0, 100]`, cámara de cabeza RealSense D455 640x480 sin rotar y cámara de muñeca 640x480 rotada 180 grados. Cualquier desviación invalida las estadísticas de normalización.
- Licencia: FLUX Kommunity License v1.0, solo uso no comercial; los pesos base y este derivado quedan sujetos a ella (ver `LICENSE.md` y `NOTICE`). No apto para producción comercial sin licencia adicional.
- Riesgo de alucinación en el sentido de acciones incorrectas: al ser una política de flow matching sin evaluación real, puede generar trayectorias plausibles pero físicamente inválidas; no hay métricas de tasa de éxito.
- Sesgos: no documentados. El dataset son 84 tomas de un único operador humano por teleoperación VR en 4 layouts, por lo que el adaptador hereda los sesgos de esa demostración (posiciones, velocidades y estilo de agarre).
- Idiomas: no disponibles; el prompt de tarea está en inglés y el codificador de texto está congelado, por lo que no se garantiza comportamiento con otras formulaciones.
- Rutas obsoletas: `config.json`, `adapter_config.json` y `train_config.json` contienen rutas `/workspace/...` del pod de entrenamiento que no son necesarias y pueden confundir en el despliegue.
- Repositorio sin tracción: 0 descargas y 0 likes en la fecha de consulta, sin revisión independiente por parte de terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Oskrt/flux-3-action-so101-haller-pen-lora
- Modelo base: https://huggingface.co/black-forest-labs/flux-3-action-so101
- Dataset de entrenamiento: https://huggingface.co/datasets/Oskrt/haller_put_the_red_pen_in_its_slot_in_the_cardboard_box
- Licencia FLUX Kommunity (referenciada como `LICENSE.md` en el repositorio): https://huggingface.co/Oskrt/flux-3-action-so101-haller-pen-lora/blob/main/LICENSE.md
- Aviso legal del repositorio (`NOTICE`): https://huggingface.co/Oskrt/flux-3-action-so101-haller-pen-lora/blob/main/NOTICE
- Issue de normalización citado por el autor (black-forest-labs/flux-action issue #2): https://huggingface.co/black-forest-labs/flux-action/discussions (referencia textual del autor; la URL exacta del issue no se proporciona en la información disponible)
- Resultados de búsqueda web: no se han encontrado enlaces relevantes al modelo; las búsquedas devolvieron contenido no relacionado, por lo que no se incluyen.
