# microduckapp/microduck-slippery-floor

## Resumen

`microduck-slippery-floor` no es un modelo de lenguaje, sino una política de control para robótica publicada por la organización `microduckapp` en Hugging Face. Se trata de un "move" (movimiento) de 12,8 segundos para el robot bípedo Microduck, un robot de aproximadamente 10 pulgadas (unos 25 cm) desarrollado en el ecosistema de Pollen Robotics. En este movimiento, el pato intenta caminar sobre hielo: se desliza hacia delante, derrapa hacia atrás girando sobre sí mismo y vuelve a deslizarse, sin llegar a detenerse en ningún momento.

El modelo se distribuye como `policy.onnx` con una interfaz de 61 observaciones de entrada y 14 objetivos articulares de salida, ejecutada a 50 Hz, acompañado de un `manifest.json` para su instalación desde la app MicroDuck y un vídeo de previsualización. Es relevante como ejemplo del ecosistema "moves as models", donde políticas de locomoción entrenadas en simulación se publican en Hugging Face como si fueran modelos convencionales, con 0 descargas y 0 likes en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política de control en ONNX (61 observaciones de entrada → 14 objetivos articulares de salida); arquitectura interna no disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de robótica, no de lenguaje) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplica (modelo de robótica) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) |
| Frecuencia de control | 50 Hz (una inferencia cada 20 ms) |
| Duración del movimiento | 12,8 segundos |
| Tamaño del repositorio | ~0,0 GB |
| Fecha de publicación | 27 de octubre de 2026 |

## Arquitectura y entrenamiento

El artefacto es una política de control en tiempo real exportada a ONNX, no una red neuronal de lenguaje. Su interfaz pública está documentada: recibe vectores de 61 observaciones (típicamente estado del robot, velocidades e información de contacto en este tipo de políticas) y produce 14 objetivos articulares a 50 Hz, aunque la composición exacta de las observaciones no se detalla en la model card. La arquitectura interna de la red (número de capas, tipo de bloques) no se ha publicado.

Tampoco se ha publicado nada sobre su entrenamiento: no consta el algoritmo (refuerzo, imitación), el simulador empleado, el número de pasos ni la función de recompensa. Como contexto del ecosistema, la comunidad de Microduck entrena walks propios en simuladores locales y los publica en Hugging Face; un usuario documenta el caso de una RTX 5090 con el agente Hermes gestionando las ejecuciones de entrenamiento y publicando los resultados (publicación de un usuario, no documentación oficial de este modelo concreto).

## Capacidades

- Control de locomoción bípeda sobre superficies de baja fricción (hielo): el movimiento incluye deslizamiento hacia delante, derrape hacia atrás girando y una nueva fase de deslizamiento, sin detenerse.
- Ciclo de control determinista a 50 Hz con interfaz fija de 61 observaciones de entrada y 14 objetivos articulares de salida.
- Movimiento temporizado de 12,8 segundos, reproducible tal cual sin lógica adicional.
- Distribución lista para instalar: el `manifest.json` contiene lo que el robot necesita para instalar y reproducir el movimiento desde la app MicroDuck.
- Previsualización incluida en el repositorio (`media/preview.mp4`).
- Formato ONNX, ejecutable con ONNX Runtime en CPU.
- No es un modelo de lenguaje: no tiene capacidades de generación de texto, código, matemáticas, tool calling, agentes ni modalidades de visión o audio.

## Casos de uso

- Demostración del robot Microduck en eventos o vídeo: el move es un artefacto cerrado de 12,8 segundos que se instala desde la app y se reproduce en el robot físico, ideal para mostrar el manejo de superficies resbaladizas de forma espectacular y reproducible.
- Educación en robótica y aprendizaje por refuerzo: sirve como ejemplo real y completo de exportación sim-to-real a ONNX, con una interfaz observable (61 entradas, 14 salidas, 50 Hz) fácil de analizar en clase o en talleres.
- Investigación en locomoción sobre baja fricción: puede emplearse como línea base o punto de comparación para políticas que gestionan deslizamiento y derrape en bípedos pequeños.
- Automatización de publicación de moves: el formato con `manifest.json` permite construir pipelines que instalen y validen movimientos de forma programática, como hace la comunidad con agentes que prueban y publican walks automáticamente.
- Encadenado de movimientos: al compartir formato e interfaz con otros moves de la misma organización (por ejemplo, `microduck-midnight-snack`), puede combinarse en secuencias o coreografías más largas.
- Validación de simuladores: reproducir la política en simulación permite comprobar si un simulador dado reproduce el comportamiento de derrape observado en el robot real, útil como test de fidelidad sim-to-real.
- Comunicación y divulgación: el vídeo de previsualización y el comportamiento llamativo facilitan materiales para contenido divulgativo sobre robótica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única descripción de rendimiento es cualitativa, procedente de la model card: el movimiento consiste en deslizar hacia delante, derrapar hacia atrás girando y volver a deslizarse sin detenerse. No existen métricas de éxito, estabilidad, consumo energético ni comparaciones con otros movimientos.

## Requisitos de hardware

- No requiere GPU para inferencia: es una política ligera en ONNX (repositorio de ~0,0 GB) pensada para ejecutarse en el propio robot Microduck a 50 Hz.
- Hardware de destino: el robot Microduck (bípedo de 10 pulgadas, unos 25 cm); el cómputo embarcado concreto del robot no está disponible en la documentación consultada.
- Cabe en cualquier equipo consumer sin problema: el tamaño del archivo es despreciable y cualquier CPU moderna con ONNX Runtime puede ejecutarlo; no aplica la distinción habitual de VRAM por cuantización.
- Despliegue: ONNX Runtime como runtime natural, e integración mediante la app MicroDuck y el `manifest.json` incluido en el repositorio. No aplican vLLM, TGI, llama.cpp ni Ollama, al no tratarse de un modelo de lenguaje.
- Entrenamiento (contexto comunitario, no oficial para este modelo): usuarios entrenan walks propios en simulador en casa; se documenta el caso de una RTX 5090 dedicada a simulación, con el agente Hermes gestionando las ejecuciones y publicando los resultados en Hugging Face.
- Latencia: condicionada por el ciclo de control de 50 Hz, es decir, una inferencia cada 20 ms; el throughput medido no está disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Interfaz | Frecuencia | Duración | Superficies | Disponibilidad |
|---|---|---|---|---|---|---|
| microduck-slippery-floor | Move de locomoción sobre hielo | 61 obs → 14 articulaciones | 50 Hz | 12,8 s | Hielo / suelo resbaladizo | Público en HF (org microduckapp) |
| microduck-midnight-snack | Move de robótica del mismo org | no disponible | no disponible | no disponible | no disponible | Público en HF (org microduckapp) |
| Mixed-floor walk (usuario witcheer) | Walk entrenado por la comunidad | no disponible | no disponible | no disponible | Escalones de 25 mm, suelos resbaladizos, empujones, pendientes suaves | Publicado en HF por el usuario; documentado en X |

La comparativa se limita al ecosistema Microduck, ya que el modelo no es comparable directamente con modelos de lenguaje. El mixed-floor walk, descrito por su autor en la red social X, es más ambicioso en variedad de terrenos, pero sus especificaciones numéricas no están disponibles.

## Limitaciones y advertencias

- Licencia no especificada: no puede confirmarse si se permite uso comercial; conviene verificar la página del modelo antes de cualquier despliegue.
- Sin documentación de entrenamiento: no se publican datos, método (RL, imitación), simulador ni función de recompensa, lo que dificulta evaluar su robustez.
- Comportamiento intencionadamente inestable: el move consiste en deslizar y derrapar sin detenerse; no es una política de marcha estable para desplazamiento útil, sino una demostración.
- Acoplado al hardware Microduck: la interfaz fija de 61 observaciones y 14 articulaciones hace que portarlo a otro robot exija una adaptación completa.
- Adopción nula en el momento de redactar la ficha: 0 descargas y 0 likes, sin validación comunitaria ni informes de terceros.
- Duración fija de 12,8 segundos: según la descripción disponible, es un movimiento cerrado, no una política de propósito general con terminación condicionada por las observaciones.
- Sin métricas cuantitativas: no hay datos de tasa de caídas, estabilidad angular ni límites operativos (pendiente, fricción mínima, perturbaciones).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/microduckapp/microduck-slippery-floor
- Organización microduckapp en Hugging Face: https://huggingface.co/microduckapp
- Repositorio GitHub de Microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Web oficial de Microduck: https://microducks.org/
- Publicación en X de un usuario sobre walks entrenados en casa y publicados en Hugging Face: https://x.com/witcheer/status/2113933525669867989
- Búsqueda de modelos Microduck en Hugging Face: https://huggingface.co/models?search=microduck
