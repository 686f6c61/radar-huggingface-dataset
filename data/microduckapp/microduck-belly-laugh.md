# microduckapp/microduck-belly-laugh

## Resumen

`microduck-belly-laugh` no es un modelo de lenguaje, sino una política de control en formato ONNX para el robot bípedo Microduck, publicada por la organización `microduckapp` en Hugging Face. Corresponde al movimiento "Belly Laugh": una rutina de 10,8 segundos en la que el pato robot echa la cabeza hacia atrás, se dobla y se balancea sobre sí mismo hasta agotarse, simulando una risa incontenible.

El Microduck es un bípedo open source de 25 cm y 399 dólares desarrollado por Pollen Robotics (unidad de Hugging Face), con 15 motores y cámara, cuyos comportamientos se entrenan con aprendizaje por refuerzo en el simulador MuJoCo. Esta política recibe 61 observaciones del robot y genera 14 objetivos articulares a 50 Hz. Forma parte de un catálogo de movimientos descargables (la organización aloja 16 modelos), lo que convierte al robot en una plataforma ampliable mediante políticas entrenadas en simulación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política de control neuronal para robótica (formato ONNX); topología de la red no disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplica (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`), junto con `manifest.json` y `media/preview.mp4` |
| Entradas | 61 observaciones del robot |
| Salidas | 14 objetivos articulares |
| Frecuencia de control | 50 Hz |
| Duración del movimiento | 10,8 segundos |
| Tamaño del repositorio | 0,0 GB |
| Pipeline | robotics |

## Arquitectura y entrenamiento

La política es una red neuronal exportada a ONNX que implementa un bucle de control a 50 Hz: en cada ciclo consume un vector de 61 observaciones (el estado del robot) y produce 14 objetivos articulares que gobiernan el movimiento de risa. La model card no detalla la topología de la red (número de capas, funciones de activación) ni el procedimiento de entrenamiento específico de este movimiento.

Según la documentación del ecosistema Microduck (Pollen Robotics/Hugging Face), los comportamientos del robot se entrenan con aprendizaje por refuerzo en el simulador MuJoCo y se despliegan después en el robot físico, en un enfoque sim-to-real. El Microduck cuenta con 15 motores; la política emite 14 objetivos articulares, una cifra próxima pero no idéntica, sin que la documentación disponible explique la diferencia. No hay información sobre datos de entrenamiento, funciones de recompensa ni técnicas tipo RLHF/DPO, que además no serían aplicables a este dominio de control motor.

## Capacidades

- Ejecuta el movimiento "Belly Laugh": una rutina de 10,8 segundos en la que el robot echa la cabeza hacia atrás, se dobla y se balancea sobre el sitio.
- Política de control en tiempo real a 50 Hz: mapea 61 observaciones del robot en 14 objetivos articulares en cada ciclo de 20 ms.
- Distribución autocontenida: incluye `manifest.json` con los metadatos que el robot necesita para instalar y reproducir el movimiento, y `media/preview.mp4` como vista previa visual.
- Formato ONNX: ejecutable con ONNX Runtime en el hardware del robot o en simulación.
- No es un modelo de lenguaje: no genera texto, no razona, no resuelve matemáticas ni código, y no soporta tool calling, agentes ni razonamiento multi-paso.
- Sin capacidades multilingües ni modalidades de visión, audio o thinking mode; la cámara del robot no forma parte de la información publicada sobre esta política.

## Casos de uso

- Animación en demostraciones del robot: reproducir la risa como reacción cómica durante presentaciones en eventos, ferias o tiendas, dando personalidad al bípedo de 25 cm y haciendo más atractivas las demos comerciales.
- Interacción social y compañía: encadenar el movimiento tras contar un chiste o ante estímulos graciosos en aplicaciones construidas sobre la MicroDuck app, aprovechando que el movimiento se instala de forma autónoma mediante `manifest.json`.
- Educación en robótica: usar el repositorio como ejemplo real y mínimo de política sim-to-real (61 observaciones a 14 acciones a 50 Hz) para prácticas de aprendizaje por refuerzo con MuJoCo en cursos universitarios o talleres.
- Desarrollo de rutinas coreografiadas: combinar varios "moves" del catálogo de la organización (que aloja 16 modelos) para construir secuencias de comportamiento largas y variadas en la MicroDuck app.
- Investigación en políticas de control: tomar esta política como baseline para comparar arquitecturas de red, frecuencias de control o dimensiones de observación en robots diminutos de bajo coste.
- Creación de contenido: grabar vídeos del robot riendo (existe vista previa oficial en `media/preview.mp4`) para redes sociales, marketing del producto o divulgación robótica.
- Prueba de integración ONNX: validar pipelines de inferencia con ONNX Runtime en hardware embebido usando una carga de trabajo trivial y un repositorio de tamaño mínimo (0,0 GB).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Tampoco hay métricas propias del dominio robótico (tasa de éxito del movimiento, robustez ante perturbaciones, desviación respecto a la simulación), por lo que no es posible evaluar cuantitativamente la calidad de la política más allá de sus parámetros de interfaz declarados.

## Requisitos de hardware

- No requiere GPU ni VRAM dedicada: la política está pensada para ejecutarse en el hardware embebido del propio robot Microduck dentro de un bucle de control de 50 Hz (20 ms por paso); las especificaciones del computador a bordo no están disponibles.
- El repositorio ocupa 0,0 GB, por lo que la descarga y el almacenamiento son triviales en cualquier equipo.
- Para simulación o desarrollo de movimientos propios se necesita un equipo capaz de ejecutar MuJoCo, el simulador usado por el ecosistema; no hay requisitos oficiales publicados.
- Despliegue: a través de la MicroDuck app, que instala el movimiento usando `manifest.json`, con inferencia mediante ONNX Runtime. Las opciones habituales para LLM (vLLM, llama.cpp, Ollama, TGI) no aplican a este modelo.
- Latencia: el bucle de control impone un paso de 20 ms (50 Hz); no hay medidas adicionales de latencia o throughput publicadas.

## Comparativa con modelos similares

Dentro de la misma organización existen otros movimientos para el Microduck; solo se conoce el nombre de uno de ellos, sin detalles técnicos publicados.

| Modelo | Categoría | Entradas/Salidas | Frecuencia | Duración | Licencia |
|---|---|---|---|---|---|
| microduck-belly-laugh | Movimiento de robótica | 61 obs / 14 articulaciones | 50 Hz | 10,8 s | no disponible |
| microduck-midnight-snack | Movimiento de robótica | no disponible | no disponible | no disponible | no disponible |

La organización `microduckapp` aloja 16 modelos de este tipo; no se han publicado especificaciones comparables del resto. No existen alternativas de otros fabricantes con documentación suficiente en la información disponible.

## Limitaciones y advertencias

- Ámbito estricto: solo ejecuta un movimiento preentrenado concreto; no es un modelo de propósito general ni un LLM, y no debe evaluarse como tal.
- Requiere el robot Microduck físico (o una simulación compatible con su interfaz de 61 observaciones) para ejecutarse; la política no sirve de forma aislada.
- Licencia no especificada en la ficha: hay que verificarla antes de cualquier uso comercial o redistribución del movimiento.
- Documentación mínima: sin detalles de arquitectura, proceso de entrenamiento, validación sim-to-real ni tasa de éxito del movimiento en el hardware real.
- Sin historial comunitario: repositorio creado el 27 de octubre de 2026, con 0 descargas y 0 likes, sin revisiones ni validación de terceros.
- Riesgo de alucinación y sesgos lingüísticos: no aplican, al no tratarse de un modelo generativo de texto.
- Sin soporte de idiomas ni de ventana de contexto: no aplican a este tipo de política de control motor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/microduckapp/microduck-belly-laugh
- Organización microduckapp en Hugging Face: https://huggingface.co/microduckapp
- Repositorio GitHub de Microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Artículo de presentación del Microduck (MarkTechPost): https://www.marktechpost.com/2026/08/28/pollen-robotics-hugging-face-microduck-399-open-source-rl-biped-robot/
- Alerta de apertura de preventas (AI Weekly): https://aiweekly.co/alerts/hugging-face-opens-pre-orders-for-399-microduck-rl-biped
- Ficha de producto (AIToolly): https://aitoolly.com/product/microduck
