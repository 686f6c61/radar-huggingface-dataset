# microduckapp/microduck-snack-time

## Resumen

"Snack Time" no es un modelo de lenguaje, sino una política de control motor en formato ONNX para el robot Microduck, publicada por la organización microduckapp en Hugging Face. El Microduck es un bípedo con forma de pato de 25 cm, abierto y con un precio de 399 dólares, desarrollado por Pollen Robotics junto a Hugging Face y entrenado con aprendizaje por refuerzo en el simulador MuJoCo, según la prensa especializada.

Esta política concreta ejecuta un movimiento de 10,5 segundos llamado "Snack Time": el pato picotea semillas, se balancea, se desplaza a otro punto y vuelve a picotear. Técnicamente, la red (`policy.onnx`) recibe 61 observaciones del robot y genera 14 objetivos articulares a 50 Hz, con inferencia a bordo gracias al SoC Rockchip con NPU de 1 TOPS que incorpora el robot.

Su relevancia es más ecosistémica que científica: ilustra la tendencia de distribuir comportamientos robóticos como activos descargables e instalables desde una app (MicroDuck), de forma análoga a como se distribuyen los pesos de los LLM. El repositorio es mínimo (0,0 GB), no declara licencia y no registra descargas ni likes en el momento de la ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política de control neuronal en ONNX (topología interna no disponible); mapea 61 observaciones a 14 objetivos articulares |
| Parámetros totales | no disponible |
| Parámetros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplicable a un modelo de robótica) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no aplicable a un modelo de robótica) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`), acompañado de `manifest.json` y vista previa en vídeo |
| Frecuencia de control | 50 Hz |
| Entradas | 61 observaciones |
| Salidas | 14 objetivos articulares |
| Duración del movimiento | 10,5 segundos |
| Tamaño del repositorio | 0,0 GB |
| Pipeline | robotics |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La pieza central del repositorio es `policy.onnx`, una política de control que se ejecuta en bucle cerrado a 50 Hz: en cada paso (cada 20 ms) consume un vector de 61 observaciones del robot (presumiblemente estado articular, actitud y otras señales sensoriales, aunque la model card no lo detalla) y produce 14 objetivos de posición para las articulaciones del bípedo. El formato ONNX permite inferencia eficiente a bordo, en este caso sobre la NPU de 1 TOPS del SoC Rockchip que monta el Microduck, según declaró la compañía a CNBC.

Sobre el entrenamiento, la model card no aporta datos específicos de esta política (arquitectura de la red, funciones de recompensa, tiempo de entrenamiento). Lo único documentado a nivel de proyecto, vía cobertura de prensa, es que los movimientos del Microduck se entrenan con aprendizaje por refuerzo en MuJoCo y luego se transfieren al hardware real (sim-to-real). Cualquier detalle más allá de esto no está disponible.

## Capacidades

- Ejecución de un comportamiento locomotor preentrenado de 10,5 segundos: picotear semillas, mover la cabeza de forma expresiva, desplazarse a una nueva posición y repetir el ciclo.
- Control articular en tiempo real a 50 Hz, generando 14 objetivos de articulación a partir de 61 observaciones sensoriales.
- Inferencia local y autónoma en formato ONNX, sin depender de servicios en la nube.
- Instalación y gestión simplificada desde la app MicroDuck mediante el archivo `manifest.json`, que describe qué necesita el robot para instalar y reproducir el movimiento.
- Compatibilidad con inspección y análisis del grafo ONNX (por ejemplo, con Netron o ONNX Runtime), útil con fines didácticos.

Capacidades que NO tiene (por no ser un modelo de lenguaje): generación de texto, razonamiento, código, matemáticas, tool calling, agentes, capacidades multilingües ni modalidades de visión o audio.

## Casos de uso

- Demostración y ocio con el robot: reproducir el movimiento "Snack Time" en un Microduck físico desde la app MicroDuck; es el caso de uso para el que está diseñado directamente.
- Docencia en robótica y aprendizaje por refuerzo: el archivo ONNX es pequeño e inspeccionable, ideal para mostrar a estudiantes cómo una política entrenada mapea observaciones sensoriales a acciones articulares en tiempo real.
- Validación de hardware y sim-to-real: al ser un comportamiento cíclico de locomoción con picoteo, sirve como prueba de referencia para comprobar que actuadores, sensores y calibración del robot funcionan correctamente tras montaje o reparación.
- Creación de contenido: el movimiento está pensado para ser vistoso (el repo incluye `media/preview.mp4`), lo que lo hace adecuado para vídeos de demostración, redes sociales o material promocional del ecosistema Microduck.
- Investigación en composición de comportamientos: base para experimentar con encadenado o transición entre movimientos descargables, por ejemplo combinándolo con otros de la misma familia como `microduck-midnight-snack`.
- Evaluación de inferencia en el borde (edge): caso práctico para medir si una NPU de 1 TOPS (Rockchip) sostiene inferencia a 50 Hz con ONNX Runtime, un requisito exigente de latencia (20 ms por paso).
- Eventos y exposiciones interactivas: robots de escritorio ejecutando comportamientos encantadores y repetibles en stands, museos o talleres educativos.
- Punto de partida para políticas propias: quien desarrolle movimientos similares para el Microduck puede usar esta política como referencia de interfaz (61 observaciones, 14 acciones, 50 Hz) y de empaquetado (ONNX + manifest).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Al tratarse de una política de robótica y no de un modelo de lenguaje, métricas como MMLU, HumanEval o GSM8K no resultan aplicables; los datos objetivos publicados se limitan a las especificaciones de la interfaz (61 observaciones de entrada, 14 salidas articulares, 50 Hz de frecuencia de control, 10,5 segundos de duración). Tampoco hay tasas de éxito, métricas de estabilidad ni comparativas de consumo energético.

## Requisitos de hardware

- Destino natural: el propio robot Microduck, que ejecuta la política a bordo sobre un SoC Rockchip con NPU de 1 TOPS (dato confirmado por la compañía a CNBC). No se necesita GPU dedicada.
- VRAM estimada: no disponible; dado que el repositorio completo ocupa 0,0 GB, se trata de un modelo muy pequeño, muy por debajo de las necesidades de cualquier GPU de servidor (A100, H100), que resultarían innecesarias.
- Pruebas fuera del robot: al ser ONNX, puede ejecutarse con ONNX Runtime en CPU de cualquier equipo moderno para inspección o depuración, aunque sin el robot no se pueden validar los comportamientos.
- Despliegue: la vía soportada es la app MicroDuck, que usa el `manifest.json` para instalar el movimiento en el robot. ONNX Runtime es la opción genérica de inferencia. Herramientas del ecosistema LLM como vLLM, llama.cpp, Ollama o TGI no son aplicables.
- Rendimiento requerido: la política debe inferirse a 50 Hz (un paso cada 20 ms) para que el movimiento se reproduzca correctamente; no hay mediciones publicadas de latencia real ni de throughput en la NPU de destino.

## Comparativa con modelos similares

Solo se conoce con certeza otro movimiento de la misma familia publicado por el mismo autor. No hay disponibles comparativas con políticas de otros fabricantes en la información proporcionada.

| Modelo | Tipo | Duración | Entradas / salidas | Frecuencia | Licencia |
|---|---|---|---|---|---|
| microduckapp/microduck-snack-time | Política ONNX (movimiento) | 10,5 s | 61 / 14 | 50 Hz | no disponible |
| microduckapp/microduck-midnight-snack | Política ONNX (movimiento) | 10,7 s | no disponible | no disponible | no disponible |

Ambos comparten formato (ONNX + manifest), autor y robot de destino; la diferencia documentada es el comportamiento (picoteo activo frente a picoteo somnoliento que termina con el robot dormido) y la duración. Para comparaciones con políticas de otros proyectos de robótica, no disponible.

## Limitaciones y advertencias

- No es un modelo de lenguaje ni un modelo fundacional: no genera texto, no responde preguntas y no sirve para ninguna tarea de PLN. Debe evaluarse únicamente como política de control.
- Comportamiento único y fijo: ejecuta exclusivamente el movimiento "Snack Time" de 10,5 segundos; no hay generalización a otras tareas ni capacidad de adaptación.
- Detalles de entrenamiento y evaluación no publicados: no se conoce la arquitectura interna, el proceso de entrenamiento específico de esta política ni métricas de robustez, lo que impide verificar su calidad de forma independiente.
- Licencia no especificada en el repositorio: antes de cualquier uso comercial o redistribución del archivo ONNX es imprescindible verificar los términos, aunque el proyecto Microduck en su conjunto se presenta como abierto en la prensa.
- Adopción nula hasta la fecha (0 descargas, 0 likes): no hay validación de la comunidad ni historial de problemas reportados, en ningún sentido.
- Sensibilidad típica de políticas locomotoras: este tipo de políticas entrenadas en simulación puede degradar su rendimiento con cambios de superficie, nivel de batería, desgaste de actuadores o descalibración; conviene probar siempre en el hardware real.
- Portabilidad nula: la interfaz (61 observaciones, 14 articulaciones) está ligada al hardware del Microduck; no es reutilizable en otros robots sin adaptación completa.
- Metadatos mínimos: la model card es brevísima y no incluye documentación de seguridad, limitaciones ni ficha técnica del sensorizado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/microduckapp/microduck-snack-time
- Movimiento relacionado de la misma familia: https://huggingface.co/microduckapp/microduck-midnight-snack
- Repositorio del robot Microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- TechCrunch — Presentación del Microduck (399 dólares): https://techcrunch.com/2026/08/27/hugging-face-is-selling-a-cute-399-open-source-duck-robot-microduck/
- Marktechpost — Detalles técnicos del Microduck (25 cm, RL en MuJoCo): https://www.marktechpost.com/2026/08/28/pollen-robotics-hugging-face-microduck-399-open-source-rl-biped-robot/
- CNBC — El chip Rockchip con NPU de 1 TOPS del Microduck: https://www.cnbc.com/2026/09/01/hugging-faces-new-duck-robot-is-selling-fast-a-chinese-chip-powers-it.html
