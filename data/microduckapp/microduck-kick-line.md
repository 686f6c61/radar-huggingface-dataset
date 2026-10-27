# microduckapp/microduck-kick-line

## Resumen

Microduck kick line es una política de control motor para el robot bípedo Microduck, publicada por el usuario microduckapp dentro del ecosistema de movimientos `microduck-move`. No es un modelo de lenguaje ni un modelo generativo de propósito general: es un artefacto de inferencia en formato ONNX que, a partir de 61 observaciones del estado del robot, emite 14 consignas articulares a 50 Hz para ejecutar una coreografía concreta de 10,7 segundos. La rutina consiste en una marcha hacia delante con elevación de rodilla, giros de cabeza a izquierda y derecha alternos, un giro final y una reverencia.

El modelo se enmarca en el lanzamiento del Microduck, un bípedo de 25 cm y 15 motores desarrollado por Pollen Robotics con Hugging Face, con cámara, LiDAR y pico prensil, que se comercializa por 399 dólares y se entrena mediante aprendizaje por refuerzo en simulación (MuJoCo). La relevancia de esta ficha es acotada: se trata de una política de movimiento de un único gesto, sin documentación técnica publicada, con 0 descargas y 0 likes en el momento de la consulta, y sin licencia declarada.

La información disponible no permite reconstruir la arquitectura de la red, el volumen de parámetros ni el proceso de entrenamiento. Todo lo que se detalla a continuación procede de la model card del autor y de la documentación pública del robot; los campos no cubiertos se marcan explícitamente como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible. Política de control neuronal exportada a ONNX (entrada de 61 observaciones, salida de 14 consignas articulares); topología interna no documentada |
| Parametros totales | No disponible. El repositorio ocupa 0,0 GB según HuggingFace, lo que sitúa el artefacto por debajo de los 100 MB |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica. Ventana de control de un único paso: 61 observaciones por ciclo a 50 Hz (20 ms por paso) |
| Tipos de cuantizacion | No disponible. Se distribuye un único artefacto ONNX sin variantes cuantizadas declaradas |
| Idiomas soportados | No aplica (no procesa lenguaje natural) |
| Licencia | No disponible en la model card ni en los metadatos de HuggingFace |
| Formato de pesos | ONNX (`policy.onnx`), acompañado de `manifest.json` para la instalación y reproducción del movimiento |
| Entrada / salida | 61 observaciones de entrada, 14 objetivos articulares de salida |
| Frecuencia de control | 50 Hz |
| Duración del movimiento | 10,7 segundos |
| Pipeline declarado | robotics |

## Arquitectura y entrenamiento

La model card no describe la arquitectura de la red. Por el formato de entrega y la interfaz declarada (61 entradas, 14 salidas, 50 Hz), se trata de una política de control reactiva típica de los flujos de aprendizaje por refuerzo para locomoción: un mapeo observación-acción ejecutado en bucle cerrado sobre el robot. El autor no especifica si la red es un perceptrón multicapa, una red recurrente o una política con memoria, ni el número de capas o el tamaño de las mismas.

Tampoco se documentan los datos de entrenamiento: no hay información sobre el número de pasos de simulación, la composición del dominio de entrenamiento, el algoritmo de RL empleado ni si hubo ajuste fino en el robot real. El contexto público del proyecto indica que el Microduck se entrena con aprendizaje por refuerzo en MuJoCo, lo que sitúa esta política en un flujo de sim-to-real, pero ese dato corresponde al robot y no a este artefacto concreto. El movimiento se distribuye junto a un `manifest.json` que describe qué necesita el robot para instalarlo y reproducirlo, y un vídeo de previsualización en `media/preview.mp4`.

## Capacidades

- Ejecución de una rutina motora pregrabada de 10,7 segundos: marcha hacia delante con paso elevado, giros de cabeza alternos a izquierda y derecha, giro del cuerpo y reverencia final.
- Generación de consignas de posición para 14 articulaciones a partir de 61 observaciones del estado del robot, a 50 Hz.
- Integración con el gestor de movimientos `microduck-move` del ecosistema Microduck, que permite instalar y reproducir el movimiento en el robot físico.
- Composición con otros movimientos del mismo ecosistema para encadenar secuencias o coreografías de varios robots (la card describe el gesto como "chorus-line").
- No soporta tool calling, function calling, razonamiento multi-paso, generación de texto, código, matemáticas, visión ni audio. Es exclusivamente un controlador motor.
- No dispone de modo "thinking", capacidad multilingüe ni interfaz conversacional.

## Casos de uso

- Reproducción de la rutina en el robot físico: el movimiento se instala mediante el `manifest.json` y se ejecuta a 50 Hz para exhibiciones, demos de producto o vídeos de marketing del Microduck.
- Referencia para aprendizaje por imitación: la política y el vídeo de previsualización sirven como trayectoria de referencia para entrenar o comparar nuevos controladores de marcha con paso elevado en simulación.
- Material docente en robótica: permite ilustrar en un taller el ciclo completo observación-acción a 20 ms, la interfaz de 61 entradas y la correspondencia con los 14 grados de libertad controlados.
- Pruebas de robustez de controladores: ejecutar el mismo movimiento con perturbaciones, cambios de terreno o variaciones de carga en el pico prensil para medir la degradación de la política.
- Sincronización multi-robot: al estar etiquetado como `microduck-move` y describirse como "chorus-line", encaja en montajes coreografiados donde varios Microduck ejecutan el mismo movimiento con desfase temporal.
- Validación de pipelines de despliegue: sirve como caso de prueba mínimo para verificar la instalación de movimientos, la carga de ONNX en el runtime del robot y la latencia de ejecución extremo a extremo.
- Composición de secuencias largas: encadenado con otros movimientos del catálogo para construir una rutina de demostración completa, verificando las transiciones entre políticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de seguimiento de trayectoria, error de posición articular, tasa de éxito del movimiento, robustez ante perturbaciones ni comparación con otras políticas. Tampoco se han encontrado evaluaciones independientes de este artefacto concreto en la búsqueda web realizada.

## Requisitos de hardware

- VRAM estimada: no aplica. Es una política de control de pequeño tamaño (repositorio por debajo de 0,1 GB) destinada a ejecutarse en el ordenador de a bordo del robot, no en GPU de centro de datos.
- GPU recomendadas: no disponibles ni necesarias para el caso de uso previsto. El despliegue objetivo es el cómputo embebido del Microduck.
- ¿Cabe en GPU de consumo? Sí, con total seguridad por tamaño del artefacto, aunque no se documenta ninguna configuración de inferencia en GPU.
- Opciones de despliegue: ONNX Runtime como runtime natural del artefacto `policy.onnx`; el manifiesto `manifest.json` define el procedimiento de instalación en el robot. No procede vLLM, TGI ni Ollama (no es un modelo de lenguaje). llama.cpp no aplica.
- Acoplamiento hardware: la política está entrenada para la morfología del Microduck (25 cm, 15 motores, cámara, LiDAR y pico prensil) y para un orden concreto de las 61 observaciones y las 14 salidas; no es trasladable a otro robot sin reentrenamiento o adaptación.
- Latencia y throughput: el bucle de control está fijado a 50 Hz, es decir, 20 ms por paso de inferencia. No se publica la latencia real medida por paso ni el coste computacional del modelo.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada políticas comparables con parámetros, contexto y métricas publicadas que permitan una comparación cuantitativa. Como referencia cualitativa del mismo ecosistema, cabría contrastarla con otros movimientos del catálogo `microduck-move` (caminar, agarrar objetos con el pico) y con las políticas de locomoción del stack de Pollen Robotics, pero no se dispone de sus especificaciones ni de resultados de evaluación.

| Modelo | Tipo | Entrada / salida | Licencia | Disponibilidad |
|---|---|---|---|---|
| microduck kick line | Política de control ONNX | 61 obs. / 14 articulaciones a 50 Hz | No disponible | HuggingFace, 0 descargas |
| Otros movimientos `microduck-move` | Políticas de control ONNX | No disponible | No disponible | Ecosistema Microduck |
| Políticas de locomoción de Pollen Robotics | Políticas RL (MuJoCo) | No disponible | No disponible | Repositorio `pollen-robotics/microduck` |

## Limitaciones y advertencias

- Licencia no declarada: no se especifica si el uso comercial está permitido. Cualquier integración en producto requiere contactar con el autor antes de su distribución.
- Ausencia total de documentación técnica: no se detallan arquitectura, parámetros, datos de entrenamiento, proceso de evaluación ni limitaciones conocidas por el autor.
- Movimiento de duración fija (10,7 s) y propósito único: no es un controlador general de locomoción ni acepta comandos de alto nivel.
- Fuerte acoplamiento a la morfología y al firmware del Microduck. Fallos de calibración, desgaste de servos o cambios en el orden de las 61 observaciones degradarán o invalidarán la política.
- Riesgo de sim-to-real: al proceder presumiblemente de entrenamiento en simulación, la ejecución en hardware real puede acumular error de seguimiento y desviarse de la trayectoria prevista, con riesgo de pérdida de equilibrio.
- No se documenta comportamiento ante perturbaciones externas, terrenos irregulares, cargas en el pico o fallos parciales de sensores.
- No aplica el riesgo de alucinación en el sentido de los modelos de lenguaje, pero sí el de desviación silenciosa: la política siempre emite 14 consignas, sin señal de confianza ni mecanismo de aborto documentado.
- Sin métricas de éxito publicadas: no es posible afirmar tasas de finalización del movimiento ni compararlo con alternativas.
- Ausencia de actividad comunitaria (0 descargas, 0 likes, sin issues públicas): no hay validación independiente de su funcionamiento.
- El repositorio se creó y actualizó en la misma franja de tiempo (27 de octubre de 2026), sin historial de versiones que permita evaluar su mantenimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/microduckapp/microduck-kick-line
- Repositorio del robot Microduck: https://github.com/pollen-robotics/microduck
- Página oficial de Microduck (Pollen Robotics): https://pollen-robotics.com/microduck/
- Anuncio en TechCrunch: https://techcrunch.com/2026/08/27/hugging-face-is-selling-a-cute-399-open-source-duck-robot-microduck/
- Cobertura en MarkTechPost: https://www.marktechpost.com/2026/08/28/pollen-robotics-hugging-face-microduck-399-open-source-rl-biped-robot/
- Artículo en Startupselfie: https://www.startupselfie.net/2026/09/01/microduck-robot-pollen-robotics-hugging-face/
- Artefactos dentro del repositorio: `policy.onnx`, `manifest.json`, `media/preview.mp4`
