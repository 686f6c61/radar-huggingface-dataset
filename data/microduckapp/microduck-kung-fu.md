# microduckapp/microduck-kung-fu

## Resumen

`microduckapp/microduck-kung-fu` no es un modelo de lenguaje: es una política de control robótico empaquetada como un único fichero ONNX, etiquetada con el pipeline `robotics` y el tag `microduck-move`. Contiene un movimiento coreografiado de 10,8 segundos para el robot Microduck, consistente en adoptar una postura de kung-fu, ejecutar golpes de cabeza, un giro completo, un cambio de postura y una reverencia final. La interfaz es explícita en la model card: 61 observaciones de entrada, 14 consignas articulares de salida y una frecuencia de control de 50 Hz (20 ms por ciclo).

El artefacto lo publica la cuenta `microduckapp`, dentro del ecosistema de la aplicación MicroDuck, y se distribuye junto a un `manifest.json` con lo necesario para instalarlo y reproducirlo en el robot, además de un vídeo de previsualización (`media/preview.mp4`). El repositorio ocupa 0,0 GB, no declara licencia, no registra descargas ni likes y no documenta idiomas, parámetros ni procedimiento de entrenamiento.

Su relevancia es de formato y de ecosistema más que de rendimiento: muestra cómo se publica una habilidad motora concreta y reproducible para un robot de bajo coste (la cobertura de prensa sitúa al Microduck en torno a los 399 dólares, desarrollado por Pollen Robotics y Hugging Face), en un contexto donde NVIDIA y otros actores están promoviendo el entrenamiento de políticas de locomoción en simulación para esta misma plataforma.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de control neuronal exportada a ONNX; topología interna (capas, activaciones, tipo de red) no disponible |
| Parametros totales | no disponible (el repositorio no publica recuento de parámetros ni tamaño del grafo) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; la interfaz consume 61 observaciones por paso de control, sin estado de contexto documentado |
| Tipos de cuantizacion | no disponible; se distribuye un único `policy.onnx` sin variantes cuantizadas publicadas |
| Idiomas soportados | no aplica (no procesa lenguaje natural) |
| Licencia | no disponible (el repositorio no declara licencia) |
| Formato de pesos | ONNX (`policy.onnx`), acompañado de `manifest.json` y `media/preview.mp4` |
| Entradas de la política | 61 observaciones por paso (composición no documentada) |
| Salidas de la política | 14 consignas de articulación por paso |
| Frecuencia de control | 50 Hz (20 ms por ciclo) |
| Duración del movimiento | 10,8 s |
| Pipeline declarado | `robotics` |
| Etiquetas | `onnx`, `robotics`, `microduck-move`, `region:us` |
| Tamaño del repositorio | 0,0 GB |
| Fecha de creación registrada | 2026-10-27 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La información disponible solo describe la interfaz de entrada y salida, no la arquitectura. El patrón (observaciones del estado del robot como entrada, 14 objetivos articulares como salida, 50 Hz) es el habitual en políticas de control entrenadas en simulación y transferidas al hardware real, pero el repositorio no especifica el tipo de red, el número de capas, el tamaño del grafo ni si incorpora memoria recurrente. Tampoco se documenta el espacio de observación: se desconoce si los 61 valores incluyen posiciones articulares, velocidades, IMU, consignas de fase o variables de temporización.

No hay datos de entrenamiento: ni número de muestras o pasos de simulación, ni composición del dataset, ni uso de aprendizaje por refuerzo, imitación, RLHF o DPO. La model card únicamente describe el resultado cualitativo del movimiento. La cobertura de prensa sobre Microduck menciona entrenamiento de políticas de locomoción en simulación con agentes de IA, pero esa documentación corresponde a políticas de marcha y no a esta habilidad concreta, por lo que no puede atribuirse a este artefacto.

## Capacidades

- Reproducción de una secuencia motora fija de 10,8 s: postura de kung-fu, golpes de cabeza, giro, nueva postura y reverencia.
- Generación de 14 consignas articulares por paso de control a 50 Hz.
- Consumo de un vector de 61 observaciones por paso, presumiblemente estado propioceptivo del robot (composición no documentada).
- Instalación y reproducción guiadas por `manifest.json` dentro de la aplicación MicroDuck.
- Distribución en formato ONNX, ejecutable con cualquier runtime compatible (ONNX Runtime, etc.).
- Previsualización incluida en el repositorio mediante `media/preview.mp4`.
- No soporta tool calling ni function calling.
- No soporta agentes, razonamiento multi-paso ni planificación.
- No tiene capacidades de lenguaje, visión ni audio documentadas.
- No se documenta modo "thinking", ajuste por instrucciones ni paramerización del movimiento.

## Casos de uso

- Publicación de habilidades para Microduck: sirve como plantilla de referencia del formato `microduck-move` (ONNX + `manifest.json` + previsualización) para desarrolladores que quieran distribuir sus propios movimientos en la aplicación.
- Pruebas de integración del reproductor de movimientos: un movimiento corto y acotado de 10,8 s permite validar el pipeline de instalación, carga del grafo y envío de consignas a 50 Hz sin necesidad de una política de locomoción completa.
- Validación de latencia del bucle de control: al exigir una salida cada 20 ms, el movimiento funciona como test de que el runtime ONNX y el bus de comunicaciones del robot sostienen la frecuencia objetivo.
- Material educativo y de demostración: en talleres o ferias, una secuencia coreografiada y visualmente reconocible comunica mejor el funcionamiento de un robot de bajo coste que una política de marcha continua.
- Referencia cinemática para retargeting o imitación: la secuencia de 14 articulaciones puede extraerse como pista de referencia para entrenar o comparar otras políticas en simulación.
- Prueba de regresión de la interfaz 61→14: cualquier cambio en el firmware, en el orden de las observaciones o en el escalado de las consignas puede detectarse comparando la reproducción con el vídeo de referencia.
- Comparación sim-to-real: reproduce el mismo movimiento en simulación y en hardware para medir la degradación por fricción, holguras o diferencias de actuación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de seguimiento de trayectoria, error articular, tasa de éxito, robustez ante perturbaciones ni comparación con otras políticas.

## Requisitos de hardware

- VRAM estimada: no disponible; no se publica el tamaño del grafo ni el número de parámetros. Por la interfaz (61 entradas, 14 salidas, 20 ms por ciclo) la carga computacional es varios órdenes de magnitud inferior a la de un transformer de gran tamaño.
- GPU recomendadas: no aplica en sentido estricto; el cómputo es compatible con CPU. No hay cifras de rendimiento medidas.
- Viabilidad en GPU de consumo: cualquier GPU de consumo puede ejecutar un grafo de este orden de magnitud; no se dispone de mediciones que lo confirmen para este fichero concreto.
- Opciones de despliegue: ONNX Runtime como opción natural dado el formato; otras alternativas (ejecución en el propio robot, en un host conectado o en simulación) no están documentadas.
- Latencia y throughput: el requisito funcional es de 50 Hz (20 ms por ciclo), pero no se publica la latencia real medida ni el hardware de referencia empleado.
- Almacenamiento: el repositorio completo ocupa 0,0 GB, por lo que el despliegue no está limitado por espacio.

## Comparativa con modelos similares

No se dispone de datos publicados sobre otras políticas `microduck-move` ni sobre modelos comparables dentro de la información proporcionada. La comparación siguiente es cualitativa y marca explícitamente los campos sin datos.

| Modelo | Tipo | Parámetros | Contexto / interfaz | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| microduck-kung-fu | Política de control ONNX (habilidad coreografiada) | no disponible | 61 obs. → 14 consignas, 50 Hz, 10,8 s | no disponible | Hugging Face, repo de 0,0 GB |
| Otras habilidades `microduck-move` | Política de control | no disponible | no disponible | no disponible | no verificado en la información disponible |
| Políticas de locomoción para Microduck entrenadas en simulación (cobertura NVIDIA) | Política de control (marcha) | no disponible | no disponible | no disponible | Documentadas en blog técnico, sin ficha de modelo asociada en la información disponible |
| Modelos VLA generalistas para robótica | Modelo visión-lenguaje-acción | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia de licencia: el repositorio no declara licencia, lo que impide determinar si el uso comercial, la redistribución o la modificación están permitidos. Es un bloqueo legal potencial para cualquier integración en producto.
- Cero validación comunitaria: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de que el movimiento se haya reproducido correctamente en hardware de terceros.
- Documentación insuficiente para reproducibilidad: se desconoce la composición exacta y el orden de las 61 observaciones, el escalado de las 14 consignas y el contenido de `manifest.json`.
- Movimiento fijo y no paramétrico: 10,8 s de secuencia cerrada, sin adaptación a obstáculos, terreno o estado del robot; no es una política reactiva.
- Brecha sim-to-real no cuantificada: no se documenta si el movimiento se validó en hardware físico ni con qué tolerancias.
- Sin capacidades de lenguaje ni visión: no puede interpretar instrucciones ni responder a estímulos del entorno.
- Riesgo para la integridad del robot: una política que ejecuta giros y golpes de cabeza sin límites de par ni parada de emergencia documentados debe probarse con el robot suspendido o con topes de seguridad.
- Advertencia sobre las demostraciones: la cobertura de prensa sobre Microduck ha cuestionado si parte de lo mostrado en eventos era teleoperado o activado por operadores. Conviene no inferir autonomía de este artefacto a partir de vídeos de demostración.
- Idiomas no documentados y no aplicables; cualquier requisito de localización es irrelevante aquí.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/microduckapp/microduck-kung-fu
- TechRepublic — Nvidia teaches a $399 duck robot to walk using AI: https://www.techrepublic.com/article/news-nvidia-microduck-robot-ai-walking/
- explainx.ai — Nvidia Microduck demo: human-piloted claim, checked: https://www.explainx.ai/blog/nvidia-gtc-berlin-microduck-demo-human-piloted-claim-four-operators-claimed-vs-verified-2026
- NVIDIA Developer Blog — Using AI agents to teach robots like Microduck to walk in simulation: https://developer.nvidia.com/blog/using-ai-agents-to-teach-robots-like-microduck-to-walk-in-simulation/
- NewsBreak — Nvidia teaches a $399 duck robot to walk using AI: https://www.newsbreak.com/techrepublic-320365869/4962601072732-nvidia-teaches-a-399-duck-robot-to-walk-using-ai
