# microduckapp/microduck-football

## Resumen

microduck-football es una política de control motriz publicada en Hugging Face por microduckapp dentro del ecosistema MicroDuck, un robot bípedo de 25 cm y código abierto desarrollado por Pollen Robotics y Hugging Face. No se trata de un modelo de lenguaje: es una «move» o habilidad empaquetada en formato ONNX que el robot reproduce para ejecutar una jugada de fútbol —avanzar botando el balón, cuadrarse para el disparo, golpear y rematar con un giro de celebración—.

El artefacto principal es `policy.onnx`, una política que recibe 61 observaciones y emite 14 consignas articulares a 50 Hz, lo que equivale a 515 pasos de control para una secuencia de 10,3 segundos. Se distribuye junto a `manifest.json`, que describe qué debe instalar y reproducir el duck, y un vídeo de previsualización en `media/preview.mp4`.

Su relevancia es la de un ejemplo concreto de distribución de habilidades para robótica de bajo coste: políticas neuronales entrenadas con aprendizaje por refuerzo en MuJoCo y exportadas a ONNX para su ejecución tanto en el robot físico como en simuladores WebAssembly en el navegador. La model card es extremadamente escueta y no documenta arquitectura de red, número de parámetros ni licencia, por lo que la evaluación técnica queda limitada a la interfaz de observación/acción publicada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (política neuronal de control exportada a ONNX; no se documenta la topología en la model card) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; ventana de decisión de 61 observaciones por paso) |
| Tipos de cuantización | no disponible (se distribuye un único `policy.onnx`; no se especifica el tipo numérico de los pesos) |
| Idiomas soportados | no aplica (política motriz; no procesa lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` |
| Tipo de modelo | política de control robótico (pipeline `robotics`) |
| Entrada (observaciones) | 61 valores por paso |
| Salida (acciones) | 14 consignas de articulación por paso |
| Frecuencia de control | 50 Hz |
| Duración de la secuencia | 10,3 s (515 pasos de control) |
| Tamaño del repositorio | 0,0 GB (redondeado; tamaño real del `.onnx` no publicado) |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-10-27 |

## Arquitectura y entrenamiento

La model card no especifica la arquitectura de la red: solo declara la interfaz de la política (61 entradas, 14 salidas, 50 Hz) y su empaquetado como ONNX. En el contexto del ecosistema MicroDuck, el robot bípedo de 25 cm de Pollen Robotics y Hugging Face se entrena con aprendizaje por refuerzo en MuJoCo, y la iniciativa Microduck Arena emplea explícitamente «políticas neuronales ONNX» sobre física MuJoCo compilada a WebAssembly, lo que sitúa a esta política en la familia de controladores obtenidos por RL y exportados para inferencia ligera.

No se han publicado datos sobre volumen de entrenamiento, composición del dataset, proceso de recompensa, ni sobre técnicas de regularización o dominio aleatorizado aplicadas. Tampoco hay información sobre un posible ajuste fino o destilación desde una política mayor. La innovación destacable, a nivel de distribución, es el formato: un único artefacto ONNX acompañado de un manifiesto declarativo que permite a la aplicación MicroDuck instalar y reproducir la habilidad sin conocer detalles internos de la red.

## Capacidades

- Ejecución de una secuencia motriz cerrada de 10,3 s: avance botando el balón, alineación para el disparo, golpeo y giro de celebración.
- Control de 14 articulaciones del bípedo MicroDuck a 50 Hz.
- Consumo de 61 observaciones por paso, presumiblemente estado propioceptivo y del entorno, aunque la composición exacta no se documenta.
- Integración con la aplicación MicroDuck mediante `manifest.json`, que define la instalación y reproducción de la habilidad.
- Reproducción en simulación: compatible con el stack de políticas ONNX sobre MuJoCo WASM empleado en Microduck Arena y en el simulador MicroDuck Football de FPVSIM.
- No soporta tool calling, function calling, razonamiento multi-paso, ni procesamiento de lenguaje, visión o audio en los términos descritos en la información disponible.
- No se documentan capacidades de generalización más allá de la propia secuencia; no hay indicios de reutilización como política de locomoción general.

## Casos de uso

- Demostración de fútbol robótico en ferias y eventos: la política reproduce una jugada completa y reconocible de 10,3 s, con disparo y celebración, lo que la hace adecuada como demo autocontenida sin necesidad de un operador experto.
- Contenido audiovisual y redes sociales: el repositorio incluye `media/preview.mp4`, y la secuencia está diseñada con un arco narrativo claro (regate, tiro, gol, celebración) útil para clips cortos y material promocional del robot.
- Docencia en robótica y RL: sirve como ejemplo mínimo de artefacto desplegable —observaciones, acciones, frecuencia y manifiesto— para explicar el paso de una política entrenada en simulación a un ejecutable ONNX.
- Pruebas de integración en la app MicroDuck: al incluir `manifest.json`, la habilidad se puede usar como caso de prueba del flujo de instalación, catalogación y reproducción de movimientos de terceros.
- Integración en Microduck Arena (3v3 en navegador): las políticas ONNX sobre MuJoCo WASM permiten cargar habilidades como esta para animar agentes o construir rivales con guion en partidas P2P.
- Simulación de partidos en FPVSIM MicroDuck Football: la secuencia de regate y disparo puede emplearse como referencia de animación o como comportamiento scriptado de un jugador no controlado por el usuario.
- Referencia para captura de movimiento y análisis biomecánico: los 515 pasos de consignas articulares a 50 Hz constituyen una trayectoria limpia y repetible para comparar con grabaciones reales o con otras políticas del mismo robot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de éxito de la tarea, tasa de goles, error de seguimiento articular, ni comparación con otras políticas del mismo robot. Tampoco se documentan métricas de sim-to-real (por ejemplo, discrepancia entre trayectoria simulada y ejecución física).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al tratarse de una política con 61 entradas y 14 salidas, el coste computacional por paso es muy reducido, pero el número de parámetros y el tamaño del `.onnx` no se publican, por lo que no se puede dar una cifra fiable.
- GPU recomendadas: no disponible. Por la naturaleza del artefacto (control a 50 Hz, tensores de entrada de 61 valores) es esperable que la inferencia en CPU sea suficiente, pero esto no está confirmado en la información proporcionada.
- Cómputo en el propio robot: la política está pensada para ejecutarse en el MicroDuck de 25 cm, cuyo hardware de a bordo no se detalla en la información disponible.
- GPU de consumo: no se requiere a priori ninguna GPU dedicada para un modelo de esta interfaz; no hay datos publicados que lo confirmen ni que permitan descartar requisitos específicos del runtime.
- Opciones de despliegue: ONNX Runtime en la aplicación MicroDuck (flujo previsto por el `manifest.json`), y ejecución en navegador mediante el stack de Microduck Arena (MuJoCo WASM + políticas ONNX).
- Latencia y throughput: el único dato objetivo es la frecuencia de control de 50 Hz, es decir, un presupuesto de 20 ms por paso de decisión. No se publican latencias medidas ni throughput.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada / salida | Frecuencia | Duración | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| microduck-football | Política ONNX (move) | 61 obs. / 14 articulaciones | 50 Hz | 10,3 s | no disponible | Hugging Face (0 descargas) |
| microduck-dream-kicks | Política ONNX (move) | no disponible | no disponible | 10,8 s | no disponible | Hugging Face (mismo autor) |
| Políticas de Microduck Arena | Políticas neuronales ONNX para fútbol 3v3 | no disponible | no disponible | episodios de partido | no disponible | Repositorio GitHub `00make/microduck-arena` |

La comparación cuantitativa no es posible: no se publican parámetros, contexto ni métricas de rendimiento para ninguna de las alternativas. La diferencia observable se limita al propósito (secuencia de exhibición frente a política de juego competitivo) y a la duración declarada de la secuencia.

## Limitaciones y advertencias

- Ausencia total de licencia declarada: no se puede asumir permiso de uso comercial, redistribución ni modificación de `policy.onnx` o de `manifest.json`.
- Model card mínima: sin arquitectura, sin número de parámetros, sin composición de observaciones y sin proceso de entrenamiento, lo que impide auditar la política o reproducir su entrenamiento.
- Habilidad cerrada y no parametrizable: la secuencia dura 10,3 s y ejecuta una jugada fija; no hay evidencia de que responda a la posición real del balón o a perturbaciones externas.
- Brecha sim-to-real no documentada: no se indica si la política fue validada en el robot físico, en qué superficie, ni con qué tasa de éxito.
- Riesgo de sobreajuste al entorno de entrenamiento: sin datos de dominio aleatorizado, el comportamiento puede degradarse ante cambios de fricción, iluminación o estado de carga de las baterías.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta, y repositorio creado y actualizado el mismo día, lo que sugiere un artefacto recién publicado y sin revisión externa.
- Sin soporte de lenguaje, visión ni tool calling: no es adecuada para ninguna tarea de procesamiento de texto o multimodal.
- Advertencia de seguridad física: al tratarse de control de 14 articulaciones en un robot físico, su ejecución sin límites de par o de corriente verificados puede dañar el hardware o a personas cercanas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/microduckapp/microduck-football
- Habilidad relacionada del mismo autor: https://huggingface.co/microduckapp/microduck-dream-kicks
- Repositorio Microduck Arena (3v3 con RL en navegador): https://github.com/00make/microduck-arena
- Sitio de Microduck Arena: https://microduck-arena.com/
- Simulador MicroDuck Football en FPVSIM: https://fpvsim.com/sim-duck
- Artículo sobre el robot MicroDuck de Pollen Robotics y Hugging Face: https://www.marktechpost.com/2026/08/28/pollen-robotics-hugging-face-microduck-399-open-source-rl-biped-robot/
