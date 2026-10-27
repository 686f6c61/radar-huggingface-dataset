# microduckapp/microduck-tennis-fan

## Resumen

microduck-tennis-fan no es un modelo de lenguaje, sino una política de control robótico en formato ONNX que dota al robot bípedo Microduck de un comportamiento ("move") de 10,3 segundos: el robot sigue con la cabeza un rally de tenis, girándola cada vez más rápido, y remata con un salto de celebración. Lo publica la organización microduckapp y se instala en el robot a través de la app MicroDuck.

Microduck es un pato robótico bípedo de 25 cm y 15 motores desarrollado por Pollen Robotics junto a Hugging Face, que se vende por 399 dólares como plataforma abierta de "physical AI". Este artefacto ilustra el modelo de habilidades descargables del ecosistema: políticas compactas que transforman 61 observaciones en 14 objetivos articulares a 50 Hz. Su relevancia reside en ese formato de distribución de comportamientos entrenados, aunque la licencia, el número de parámetros y los detalles de entrenamiento no están publicados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política de control neuronal en ONNX (detalles internos de la red no disponibles) |
| Parámetros totales | no disponible |
| Parámetros activos | No aplicable (no es un modelo MoE) |
| Longitud de contexto | No aplicable (entrada de 61 observaciones por paso de control, no procesa secuencias de texto) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | No aplicable (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | ONNX (policy.onnx); incluye manifest.json y media/preview.mp4 |
| Observaciones de entrada | 61 |
| Salidas | 14 objetivos articulares |
| Frecuencia de control | 50 Hz |
| Duración del movimiento | 10,3 segundos |
| Pipeline | robotics |
| Tamaño del repositorio | 0,0 GB según la API de Hugging Face (tamaño exacto del ONNX no disponible) |
| Fecha de publicación | 27 de octubre de 2026 |

## Arquitectura y entrenamiento

El artefacto es una política de control que, en cada ciclo de 20 ms (50 Hz), recibe un vector de 61 observaciones —presumiblemente propioceptivas del robot, como posiciones articulares y lecturas de los sensores de movimiento— y devuelve 14 objetivos articulares que ejecutan la coreografía del "tennis fan". No se ha publicado la arquitectura interna de la red (capas, tipo de bloque ni número de parámetros) ni el pipeline de entrenamiento concreto de este move.

El ecosistema Microduck se describe en materiales de terceros como una plataforma de bípedos impulsada por aprendizaje por refuerzo, lo que sugiere un entrenamiento en simulación con posterior transferencia al hardware real (sim-to-real), pero ni el README del repositorio ni la búsqueda realizada confirman el método, el dataset ni el uso de técnicas concretas para esta política. Cabe señalar una discrepancia documental: la prensa describe 15 motores en el robot, mientras que la política emite 14 objetivos articulares; la correspondencia exacta entre ambos no está documentada.

## Capacidades

- Ejecución de un comportamiento coreografiado de 10,3 segundos: seguimiento de rally con la cabeza a velocidad creciente y salto final de celebración.
- Control en tiempo real a 50 Hz sobre 14 articulaciones del robot.
- Distribución como skill instalable: policy.onnx acompañado de manifest.json con los metadatos de instalación y de un vídeo de previsualización (media/preview.mp4).
- No dispone de capacidades de generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling, agentes ni razonamiento multi-paso: no son aplicables a este tipo de artefacto.
- Aunque el robot Microduck incorpora cámara y sensor de profundidad, la documentación disponible no indica que este move utilice percepción externa.

## Casos de uso

- Demostraciones y divulgación en eventos: al ser un comportamiento corto, vistoso y autónomo, es idóneo para stands, ferias y talleres donde se quiera mostrar las capacidades del Microduck sin supervisión compleja.
- Prueba de extremo a extremo del pipeline de skills: instalar policy.onnx junto a manifest.json permite verificar que el runtime ONNX del robot, los actuadores y la app MicroDuck funcionan correctamente antes de desarrollar comportamientos propios.
- Plantilla de referencia para desarrolladores de moves: constituye un ejemplo real del formato microduck-move (61 observaciones de entrada, 14 salidas articulares, 50 Hz) que los creadores pueden imitar al publicar sus propios comportamientos en Hugging Face.
- Docencia en robótica y aprendizaje por refuerzo: sirve como caso práctico en asignaturas o talleres sobre despliegue de políticas entrenadas en hardware real, desde el fichero ONNX hasta la ejecución en el bípedo.
- Creación de contenido para redes sociales y marketing: la coreografía está diseñada para ser expresiva (cabeza y salto), lo que la hace adecuada para vídeos cortos de producto o campañas del ecosistema.
- Entretenimiento doméstico y educativo: los propietarios de un Microduck pueden ampliar el repertorio del robot con una habilidad lúdica instalada en segundos desde la app.
- Validación de hardware tras montaje o reparación: el movimiento combinado de cabeza y piernas (incluido el salto) permite comprobar el rango y la respuesta de los servos implicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Para este tipo de artefacto, las métricas relevantes serían el error de seguimiento articular, la tasa de éxito del movimiento o la estabilidad durante el salto, pero ninguna ha sido documentada por el autor.

## Requisitos de hardware

- No requiere GPU ni VRAM: la política está diseñada para ejecutarse en el computador integrado del propio robot Microduck mediante un runtime ONNX; el SoC concreto del robot no está detallado en la información disponible.
- GPUs recomendadas: no aplicable.
- Consumer GPU: no aplicable; el artefacto no está pensado para inferencia en tarjetas gráficas de escritorio.
- Para desarrollo o inspección del fichero ONNX basta un PC estándar; los detalles de simulación previa no están publicados.
- Despliegue: copia de policy.onnx y manifest.json al robot a través de la app MicroDuck. Herramientas como vLLM, llama.cpp, Ollama o TGI no son aplicables a este formato.
- Latencia y throughput: el ciclo de control se define a 50 Hz (20 ms por paso); mediciones reales de latencia no disponibles.

## Comparativa con modelos similares

Los comparables naturales son otras políticas del formato microduck-move publicadas por la organización microduckapp y por la comunidad, pero no se dispone de datos públicos sobre ellas. Comparativa formal: no disponible.

| Aspecto | microduck-tennis-fan | Otras políticas microduck-move |
|---|---|---|
| Formato | ONNX, 61 obs → 14 articulaciones a 50 Hz | no disponible |
| Duración | 10,3 segundos | no disponible |
| Licencia | no disponible | no disponible |
| Adopción | 0 descargas, 0 likes | no disponible |

## Limitaciones y advertencias

- Comportamiento único y fijo: la política ejecuta una sola coreografía y no generaliza a otras tareas ni responde a instrucciones.
- Ligado al hardware Microduck: no es ejecutable en servidores ni en otros robots sin adaptación del espacio de observaciones y acciones.
- Licencia no especificada: no se puede confirmar si el uso comercial, la redistribución o la modificación del fichero están permitidos; conviene consultar al autor antes de reutilizarlo.
- Sin validación comunitaria: en el momento de la ficha acumula 0 descargas y 0 likes, sin issues ni informes de usuarios conocidos.
- Discrepancia documental entre los 15 motores descritos para el robot y las 14 salidas articulares de la política; la correspondencia no está documentada y puede complicar la portabilidad a otros moves o versiones del robot.
- Riesgo físico: el salto final puede provocar caídas del bípedo; se recomienda ejecutarlo en superficie plana y espacio despejado. El fabricante describe recuperación de caídas como capacidad del robot, pero no está documentado para este move concreto.
- Sin información sobre cuantización, precisión numérica del ONNX ni compatibilidad con versiones concretas de la app MicroDuck.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/microduckapp/microduck-tennis-fan
- Perfil del robot Microduck en RobotsGuide: https://robotsguide.com/robots/microduck
- Artículo de CNX Software sobre Microduck: https://www.cnx-software.com/2026/08/28/microduck-a-duck-like-biped-robot-designed-for-physical-ai-experimentation-and-fun/
- Artículo de TechCrunch sobre el lanzamiento: https://techcrunch.com/2026/08/27/hugging-face-is-selling-a-cute-399-open-source-duck-robot-microduck/
- Repositorio oficial de Pollen Robotics: https://github.com/pollen-robotics/microduck
- Tutorial de montaje y configuración (terceros): https://github.com/AI-FanGe/Microduck-build-tutorial
