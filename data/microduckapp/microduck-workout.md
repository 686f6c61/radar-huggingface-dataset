# microduckapp/microduck-workout

## Resumen

`microduckapp/microduck-workout` no es un modelo de lenguaje, sino una política de control motriz («move») para el robot bípedo Microduck de Pollen Robotics / Hugging Face. El repositorio contiene `policy.onnx`, una red neuronal que recibe 61 observaciones por paso y emite 14 consignas de articulación a 50 Hz, junto con un `manifest.json` que describe cómo instalarla y reproducirla en el robot, y un vídeo de previsualización de 10,4 segundos.

La política implementa una coreografía corta de gimnasia: marcha con rodillas arriba, giros amplios de cabeza y bombeos de cuello. El Microduck es un bípedo de 25 cm y 800 g, precio de 399 USD, presentado en agosto de 2026 con preórdenes abiertas y envíos previstos antes de Navidad de 2026; se entrena con refuerzo en simulación (MuJoCo, con colaboración de Nvidia en el caso de la locomoción).

Su relevancia es la distribución reproducible de comportamientos físicos: un fichero ONNX portable y un manifiesto permiten replicar exactamente una habilidad entrenada en simulación sobre hardware de bajo coste, algo poco habitual en robótica open source, donde los pesos de las políticas rara vez se publican junto al binario ejecutable. La model card, sin embargo, es mínima y no documenta arquitectura interna, licencia ni procedencia de los datos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política de control neuronal exportada a ONNX; topología interna (capas, activaciones) no documentada |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; ventana de observación de 61 valores por paso de control |
| Tipos de cuantización | no disponible (se distribuye ONNX en precisión no especificada) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`), acompañado de `manifest.json` y `media/preview.mp4` |
| Entradas | 61 observaciones por paso |
| Salidas | 14 objetivos articulares por paso |
| Frecuencia de control | 50 Hz (20 ms por paso) |
| Duración del movimiento | 10,4 s |
| Pipeline declarado | robotics |
| Etiquetas | onnx, robotics, microduck-move, region:us |
| Tamaño del repositorio | 0,0 GB (por debajo del umbral de redondeo de Hugging Face; tamaño exacto no disponible) |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-10-27 |

## Arquitectura y entrenamiento

La model card solo indica el contrato de entrada/salida del fichero ONNX: 61 observaciones de entrada, 14 objetivos articulares de salida y 50 Hz de frecuencia. No se especifica si la política es un perceptrón multicapa, una red recurrente, un transformer pequeño ni qué operadores ONNX utiliza, tampoco el opset ni la versión de runtime con la que se exportó. La composición exacta del vector de observación (posiciones articulares, velocidades, IMU, reloj de fase u otros) no está documentada en el repositorio.

Respecto al entrenamiento, la información disponible no detalla el pipeline de esta política concreta: no hay número de pasos de simulación, composición del dataset, ni si hubo ajuste fino sobre hardware real. Las fuentes de prensa sobre el robot Microduck indican que la plataforma se entrena con aprendizaje por refuerzo en MuJoCo y que Nvidia colaboró en el desarrollo de la marcha, pero esos datos corresponden al robot y no se pueden atribuir con certeza a este movimiento específico.

## Capacidades

- Ejecución de una secuencia motriz cerrada de 10,4 s: marcha con rodillas arriba, rotaciones amplias de cabeza y bombeos de cuello.
- Generación de 14 consignas articulares por paso a 50 Hz, apta para un bucle de control en tiempo real (presupuesto de 20 ms por inferencia).
- Integración mediante `manifest.json`, que declara los requisitos de instalación y reproducción en el robot.
- Portabilidad a cualquier runtime compatible con ONNX (ONNX Runtime en Python o C++, entre otros).
- No incluye tool calling ni function calling: la salida es exclusivamente un vector de acciones motoras.
- No incluye razonamiento multi-paso, agentes, capacidades multilingües, visión ni audio en la política distribuida.
- No se documenta si la política reacciona a perturbaciones externas o solo reproduce una trayectoria de referencia condicionada por el estado del robot.

## Casos de uso

- Demostración de locomoción en el Microduck: instalación del move mediante la app MicroDuck y reproducción de la rutina de gimnasia como contenido de exhibición o validación inicial tras el ensamblaje del robot.
- Referencia para comparar políticas: al publicar entradas y salidas con un contrato fijo (61→14 a 50 Hz), sirve como baseline reproducible para medir estabilidad, seguimiento de trayectoria y consumo de par de otras políticas de la familia `microduck-move`.
- Punto de partida para entrenar nuevas habilidades: la política puede usarse como demostración o referencia de movimiento en pipelines de imitación o de recompensa por seguimiento de trayectoria en simulación.
- Docencia de control con aprendizaje por refuerzo: ejemplo mínimo y ejecutable de bucle observación-acción a 50 Hz con un fichero ONNX de tamaño reducido, útil en asignaturas de robótica y RL aplicado.
- Pruebas de integración de ONNX Runtime en hardware embebido: validación de latencia, determinismo numérico y compatibilidad de opsets en placas ARM de bajo coste antes de desplegar políticas propias.
- Validación de hardware y calibración: ejecución controlada de los 14 actuadores para verificar signos, rangos y offsets articulares después de un montaje o una sustitución de servos.
- Producción de material audiovisual: el repositorio incluye `media/preview.mp4`, reutilizable como referencia visual de la rutina para documentación o demos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

| Métrica | Valor |
|---|---|
| Tasa de éxito de la rutina | no disponible |
| Error de seguimiento articular | no disponible |
| Robustez ante perturbaciones | no disponible |
| Latencia de inferencia medida | no disponible |
| Comparación con otras políticas | no disponible |

Los únicos datos operativos verificables son los declarados en la model card: 61 observaciones de entrada, 14 salidas articulares, 50 Hz de frecuencia y 10,4 s de duración.

## Requisitos de hardware

- VRAM estimada: prácticamente nula; una política de este tamaño (repositorio por debajo de 0,1 GB) está pensada para ejecutarse en CPU.
- GPU recomendadas: no se requiere GPU. Cualquier CPU x86-64 o ARM con ONNX Runtime es suficiente; no hay datos de rendimiento con aceleración.
- Cabe en GPU de consumo: sí, con margen amplio, aunque la aceleración no aporta ventaja relevante frente a CPU en un bucle de 50 Hz.
- Despliegue: ONNX Runtime (Python o C++) es la vía natural; la conversión a TensorRT, TFLite u otros formatos no está documentada. La integración de alto nivel se realiza a través de la app MicroDuck y del `manifest.json`.
- Latencia y throughput: el presupuesto de control es de 20 ms por paso (50 Hz); no se publican medidas reales de latencia ni de jitter en el hardware objetivo.
- Requisito implícito: el robot Microduck con sus 14 articulaciones y la revisión de firmware compatible con el manifiesto; no se documentan tolerancias a otras revisiones de hardware.

## Comparativa con modelos similares

No hay información pública suficiente para establecer una comparativa cuantitativa. La model card no declara número de parámetros, licencia ni métricas, y no se han identificado otras políticas del mismo autor con datos publicados.

| Modelo | Tipo | Parámetros | Contexto / E/S | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| microduck-workout | Política de control RL en ONNX | no disponible | 61 obs → 14 acciones a 50 Hz, 10,4 s | no disponible | Pública en Hugging Face (0 descargas) |
| Otras políticas `microduck-move` | Políticas de control para el mismo robot | no disponible | no disponible | no disponible | No verificadas en la información proporcionada |
| Políticas de locomoción RL open source para bípedos (p. ej. entornos MuJoCo/Isaac) | Políticas de control | no disponible | Variables según tarea | Habitualmente permisivas, variable por proyecto | Repositorios de investigación; no directamente comparables por hardware distinto |
| Reachy Mini (comportamientos) | Plataforma y apps de comportamiento | no aplica | No comparable (robot de escritorio, otra morfología) | no disponible | Producto comercial de Hugging Face / Pollen Robotics |

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita no se puede asumir permiso para uso comercial, redistribución o modificación del fichero ONNX.
- Model card mínima: no se documentan arquitectura, versión de opset, unidades ni escalado del vector de observación, lo que dificulta la reutilización fuera del pipeline previsto.
- Ausencia de validación comunitaria: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de terceros que hayan reproducido el movimiento.
- Movimiento de duración fija (10,4 s): no se documenta comportamiento ante interrupciones, caídas, superficies irregulares o fallos de un actuador.
- Riesgo de comandos articulares inseguros si se ejecuta con observaciones mal formadas o con un hardware distinto al previsto; conviene interponer límites de par, de velocidad y un watchdog externo.
- Sin información sobre sesgos en el sentido estadístico del término (no es un modelo de lenguaje), pero sí sobre dominio de validez: el rendimiento fuera del robot y del entorno de entrenamiento es desconocido.
- No aplican limitaciones de contexto, idioma ni riesgo de alucinación textual; el modo de fallo relevante es la ejecución de una trayectoria incorrecta sin aviso.
- Falta de trazabilidad del entrenamiento: sin dataset, semilla, código de entrenamiento ni métricas de simulación, la política no es auditable ni fácilmente reproducible más allá de ejecutar el ONNX.

## Enlaces

- Hugging Face: https://huggingface.co/microduckapp/microduck-workout
- The AI Insider — Pollen Robotics releases Microduck: https://theaiinsider.tech/2026/08/28/hugging-faces-pollen-robotics-releases-small-cute-open-source-microduck-robot/
- MarkTechPost — Microduck, bípedo open source de 399 USD: https://www.marktechpost.com/2026/08/28/pollen-robotics-hugging-face-microduck-399-open-source-rl-biped-robot/
- Tech360 — Presentación del Microduck: https://www.tech360.tv/hugging-face-unveils-microduck-new-open-source-biped-ai-robot-2026-31-08
- Ubergizmo — Meet Microduck: https://www.ubergizmo.com/2026/08/meet-microduck-the-399-programmable-ai-robot/
- TechRepublic — Nvidia enseña a caminar al robot Microduck: https://www.techrepublic.com/article/news-nvidia-microduck-robot-ai-walking/
