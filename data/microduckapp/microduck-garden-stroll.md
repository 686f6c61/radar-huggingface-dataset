# microduckapp/microduck-garden-stroll

## Resumen

Garden Stroll es una política de control motriz para el robot bípedo Microduck, publicada en Hugging Face por la cuenta `microduckapp`. No es un modelo de lenguaje ni un modelo generativo multimodal: es un artefacto de inferencia en formato ONNX que, a partir de 61 observaciones del robot, emite 14 consignas articulares a 50 Hz para reproducir un movimiento pregrabado de 10,5 segundos en el que el robot avanza en curva, se detiene a olisquear flores y continúa su paseo. El repositorio incluye `policy.onnx` (la política), `manifest.json` (metadatos de instalación y reproducción para el robot) y `media/preview.mp4` (previsualización del movimiento).

El robot Microduck lo desarrollan Pollen Robotics y Hugging Face: un bípedo de 25 cm de altura, 800 g de peso y 399 USD, presentado como plataforma abierta para experimentar con IA física, aprendizaje por refuerzo y transferencia de comportamientos desde simulación a hardware real (entrenamiento en MuJoCo e Isaac Lab 3.0 con Newton). Garden Stroll se enmarca en la etiqueta `microduck-move`, es decir, la familia de "movimientos" instalables desde la app de MicroDuck.

Su relevancia es acotada pero clara: sirve como ejemplo verificable de política sim-to-real exportada a ONNX con una interfaz de observación/acción fija, como referencia reproducible para comparar políticas propias dentro de Microduck Arena y como prueba de integración del robot recién montado. El repositorio no documenta arquitectura de red, número de parámetros, licencia ni datos de entrenamiento, y a fecha de la consulta acumula 0 descargas y 0 likes, por lo que debe tratarse como un artefacto sin validación comunitaria.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de control exportada a ONNX; la model card no documenta la topología de red) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (política de control reactiva; no hay ventana de contexto textual) |
| Tipos de cuantizacion | no disponible; solo se distribuye `policy.onnx` sin variantes cuantizadas documentadas |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) acompañado de `manifest.json` |
| Entradas de la política | 61 observaciones |
| Salidas de la política | 14 consignas articulares (joint targets) |
| Frecuencia de control | 50 Hz (presupuesto de 20 ms por paso) |
| Duración del movimiento | 10,5 s |
| Tamaño del repositorio | 0,0 GB (redondeo del Hub: implica pesos por debajo de ~50 MB) |
| Pipeline del Hub | robotics |
| Etiquetas | onnx, robotics, microduck-move, region:us |
| Fecha de creación / actualización | 2026-10-27 / 2026-10-27 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna de la política: la model card se limita a declarar la interfaz (61 observaciones de entrada, 14 objetivos articulares de salida, 50 Hz) y el formato de exportación (ONNX). No se indica si se trata de un perceptrón multicapa, una red recurrente o una política con memoria, ni se especifica el número de capas, el número de parámetros o la función de activación. Tampoco se documentan normalización de observaciones, espacio de acciones (posición, velocidad o par) ni límites de seguridad articulares.

En cuanto al entrenamiento, el repositorio no aporta ningún dato: ni número de pasos, ni composición del dataset, ni si hubo aprendizaje por refuerzo, imitación o scripted motion. Lo que sí está documentado a nivel de plataforma es que Microduck se entrena con aprendizaje por refuerzo en simulación (MuJoCo y, en la guía de NVIDIA, Isaac Lab 3.0 con Newton) y que las políticas se exportan para su despliegue en hardware real; el blog de NVIDIA describe explícitamente el flujo "entrenar en simulación, desplegar en el robot real" para este robot, incluyendo la publicación de la política en el Hub. Es razonable situar Garden Stroll en ese flujo, pero el procedimiento concreto de este movimiento no se puede confirmar con la información disponible.

## Capacidades

- Ejecución de un movimiento de locomoción cerrado de 10,5 s: avance en curva suave, parada con aproximación a las flores y reanudación del paseo.
- Control de 14 articulaciones del Microduck a partir de 61 observaciones, a 50 Hz.
- Inferencia portable mediante runtime ONNX, sin dependencia de frameworks de deep learning pesados.
- Instalación y reproducción gestionadas por el manifiesto `manifest.json` y la app MicroDuck.
- Previsualización del comportamiento incluida en el repositorio (`media/preview.mp4`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, generación de texto, código, matemáticas, visión ni audio.
- No tiene capacidades multilingües ni procesamiento de lenguaje natural.
- No se documentan modos especiales (thinking mode, planificación, memoria episódica).

## Casos de uso

- Verificación de puesta en marcha del robot: tras el montaje del Microduck, instalar Garden Stroll y comprobar que los 14 actuadores responden y que el pipeline de 61 observaciones se publica correctamente; un fallo en una articulación se manifiesta de inmediato en la curva del paseo.
- Prueba de integración del bucle de control a 50 Hz: el movimiento exige sostener 20 ms por paso durante 10,5 s (unas 525 inferencias consecutivas), lo que lo convierte en una prueba de estrés realista de latencia y estabilidad del runtime ONNX en el hardware objetivo.
- Línea base para políticas propias: al fijar la interfaz exacta (61 entradas, 14 salidas, 50 Hz), sirve como referencia contra la que comparar políticas entrenadas por el usuario en Isaac Lab o MuJoCo con el mismo contrato de observación/acción.
- Evaluación comparativa en Microduck Arena: el movimiento se puede emplear como participante reproducible en la arena de políticas del ecosistema Microduck, siempre que se respeten las condiciones de evaluación de la plataforma.
- Divulgación y docencia: para talleres, ferias o clases de robótica, un movimiento corto y visualmente reconocible (curva, parada, olisqueo) con vídeo de previsualización facilita explicar qué es una política sim-to-real sin entrar en detalles de entrenamiento.
- Punto de partida para reentrenamiento o destilación: usar la política como referencia de comportamiento y generar trayectorias sintéticas para inicializar o aumentar el conjunto de datos de un nuevo movimiento (por ejemplo, variantes de velocidad o de trayectoria).
- Demostración de robótica de compañía: el repertorio de gestos "lentos y reconocibles" encaja en prototipos de interacción afectiva o exposiciones, aunque sin validación comunitaria no debe presentarse como comportamiento listo para producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de recompensa, tasas de éxito, error de seguimiento articular, consumo, ni comparaciones cuantitativas con otras políticas. El ecosistema Microduck dispone de un espacio de evaluación comparativa (Microduck Arena) mencionado en la documentación de NVIDIA, pero no se han proporcionado resultados de esta política en él.

| Métrica | Valor |
|---|---|
| Recompensa media en simulación | no disponible |
| Tasa de éxito del movimiento | no disponible |
| Error de seguimiento articular | no disponible |
| Latencia medida en hardware | no disponible (solo se conoce el periodo de control teórico de 20 ms) |
| Posición en Microduck Arena | no disponible |

## Requisitos de hardware

- VRAM estimada: el Hub redondea el tamaño del repositorio a 0,0 GB, lo que sitúa los pesos por debajo de ~50 MB; la inferencia es viable en CPU y no requiere GPU dedicada.
- GPU recomendadas: no aplica para el despliegue en el robot; para reentrenamiento o análisis de la política, cualquier GPU consumer reciente es suficiente, aunque no se especifica el coste de entrenamiento original.
- Cabe en GPU consumer: sí, con margen amplio; también en CPU de un solo núcleo moderna para un modelo de este tamaño, aunque la latencia real debe medirse en el hardware del Microduck.
- Opciones de despliegue: ONNX Runtime (Python o C++) como vía principal; el flujo de instalación del movimiento pasa por `manifest.json` y la app MicroDuck. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que no aplican a una política de control.
- Latencia y throughput: el contrato de control fija 50 Hz, es decir, 20 ms por inferencia como máximo; no se publican latencias medidas ni margen de holgura real en el robot.

## Comparativa con modelos similares

No se han identificado en la información proporcionada políticas comparables con datos públicos (parámetros, métricas o licencia) que permitan una comparación rigurosa. La tabla siguiente recoge lo que se puede afirmar y lo que falta.

| Modelo | Tipo | Entradas / salidas | Frecuencia | Duración | Licencia | Datos públicos |
|---|---|---|---|---|---|---|
| Garden Stroll (`microduckapp/microduck-garden-stroll`) | Política de control para Microduck, ONNX | 61 / 14 | 50 Hz | 10,5 s | no disponible | interfaz y formato; sin métricas |
| Otras políticas `microduck-move` del Hub | Políticas de movimiento para el mismo robot | no disponible | no disponible | no disponible | no disponible | no identificadas en la búsqueda |
| Políticas de locomoción de referencia de Isaac Lab 3.0 / Newton | Políticas de RL para sim-to-real | no disponible | no disponible | no disponible | no disponible | el blog describe el flujo, no resultados de esta política |
| Políticas de locomoción bípeda de otros robots open source | Políticas de RL | no disponible | no disponible | no disponible | no disponible | fuera del alcance de la información disponible |

## Limitaciones y advertencias

- Licencia no disponible: sin una licencia declarada no se puede asumir permiso de uso comercial, redistribución ni modificación; hay que contactar con el autor antes de integrar el movimiento en un producto.
- Ausencia de validación comunitaria: 0 descargas y 0 likes en el momento de la consulta, y repositorio creado y actualizado el mismo día, lo que sugiere un artefacto recién publicado y sin contraste externo.
- Documentación mínima: no se detallan arquitectura, parámetros, datos de entrenamiento, espacio de acciones ni límites articulares, lo que dificulta la depuración y la evaluación de riesgos.
- Brecha sim-to-real: cualquier política entrenada en MuJoCo o Isaac Lab puede degradarse en el robot físico por fricción, holguras, latencia del bus de actuadores o calibración de sensores; no se documenta ninguna validación en hardware.
- Dependencia estricta del contrato de observación: las 61 entradas deben respetar el orden, unidades y normalización originales; un cambio de firmware, de calibración o de configuración de sensores invalidará la política sin aviso explícito.
- Movimiento cerrado y no reactivo: 10,5 s de trayectoria sin evidencia de adaptación a obstáculos, empujes o cambios de terreno; no debe usarse en entornos no controlados sin supervisión.
- Sin capacidades de lenguaje, visión ni razonamiento: no es adecuado para tareas cognitivas, de percepción o de interacción conversacional.
- Riesgo de uso inseguro: al no publicarse límites de par, corrientes máximas ni protocolos de parada, la responsabilidad de acotar el comportamiento recae en el integrador.
- Idiomas no aplicables: la model card está en inglés y el artefacto no procesa texto; no hay soporte multilingüe que evaluar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/microduckapp/microduck-garden-stroll
- Repositorio del robot Microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Artículo de MarkTechPost sobre el lanzamiento de Microduck: https://www.marktechpost.com/2026/08/28/pollen-robotics-hugging-face-microduck-399-open-source-rl-biped-robot/
- Blog de NVIDIA, "Train in Simulation, Deploy on a Real Robot: Microduck with Isaac Lab 3.0": https://huggingface.co/blog/nvidia/microduck-isaac-lab-sim-to-real
- The AI Insider, sobre el lanzamiento open source de Pollen Robotics: https://theaiinsider.tech/2026/08/28/hugging-faces-pollen-robotics-releases-small-cute-open-source-microduck-robot/
- Tech360, sobre Microduck como bípedo open source: https://www.tech360.tv/hugging-face-unveils-microduck-new-open-source-biped-ai-robot-2026-31-08
