# rumezhak/microduck-sock-heist-second-green-v2

## Resumen

`rumezhak/microduck-sock-heist-second-green-v2` es una entrada de competición para la prueba *Sock Heist* de 6 metros de la Microduck Arena, un entorno de simulación de robótica articulado por Pollen Robotics. No es un modelo de lenguaje ni un modelo fundacional al uso: es un artefacto ONNX que encapsula una política de control para un robot simulado MicroDuck, con el objetivo de recorrer un pasillo de semáforos y completar el recorrido en el menor tiempo posible. El autor lo publica como *finetune* de dos modelos previos: la red de `lphatnguyen/microduck-sock-heist-6m-v3` y el grafo de *lookup* por observación de `a1rb4Ck/microduck-heist`.

La relevancia del modelo es doble. Por un lado, documenta una mejora concreta en el marcador de la Arena: 5,052 s de media en las cinco semillas oficiales, frente a los 7,032 s de la mejor entrada anterior (la cola 94cd de jrubiosainz). Por otro, su model card expone con inusual franqueza las trampas del método: la política es *in-sample*, es decir, memoriza una trayectoria grabada por semilla y recurre a la red de v3 como respaldo para cualquier observación no vista. El propio autor advierte que no debe cargarse en un robot físico.

El modelo tiene un tamaño de repositorio de 0,0 GB (artefacto ONNX ligero), no declara licencia y no ofrece información sobre idiomas ni parámetros totales. Su interés es, por tanto, metodológico y de competición, no de despliegue generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de política para control robótico, exportada a ONNX; grafo de *lookup* por observación sobre la red de `lphatnguyen/microduck-sock-heist-6m-v3` |
| Parametros totales | 197.774 pesos (red de v3 sobre la que se ejecutan las búsquedas evolutivas); el artefacto final no declara un recuento propio |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible (el repositorio no declara licencia; los modelos base tienen Apache-2.0 y sin licencia declarada, respectivamente) |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

La política parte de la red de `lphatnguyen/microduck-sock-heist-6m-v3`, con 197.774 pesos, y se optimiza mediante estrategias evolutivas ejecutadas en el propio *runner* de la Arena (variante antithetic, optimizador Adam, sigma 0,002, 48 pares espejados, learning rate 0,001). El autor ejecuta una búsqueda por cada semilla oficial, con duraciones de entre 1 y 3 minutos por semilla, y una segunda pasada adicional para la semilla 2, que requiere conservar la mejor de varios miles de perturbaciones.

La innovación clave no está en la red, sino en la función de coste y en el empaquetado. El coste por semilla combina el número de semáforos en rojo atravesados, el paso de cruce y una penalización de 60 por metro restante en la última marca (contada solo desde el tercer semáforo verde), de modo que una semilla que se detiene a 9 cm de la línea puntúa mejor que una que se detiene a 90 cm. La trayectoria en bucle cerrado de cada especialista se graba y se almacena como filas de *lookup* (1.397 filas, siguiendo el diseño de a1rb4Ck); para cualquier otra observación, el fichero recurre a la red de v3. El resultado es un artefacto híbrido: memorización de trayectorias para las cinco semillas oficiales y generalización limitada a través de la red de respaldo.

## Capacidades

- Control de política para un robot simulado MicroDuck en la prueba Sock Heist de 6 metros de la Microduck Arena.
- Reproducción determinista de una trayectoria grabada por cada una de las cinco semillas oficiales (1 a 5).
- *Lookup* por observación: enmascara el comando de entrada y devuelve la misma acción para cualquier comando, por lo que la puntuación es idéntica a 0,20 m/s.
- Respaldo a la red de `lphatnguyen/microduck-sock-heist-6m-v3` para observaciones fuera de las trayectorias memorizadas.
- No soporta *tool calling*, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües: no es un modelo de lenguaje.
- No apto para control de un robot físico; las acciones grabadas exceden lo que servomotores reales podrían ejecutar.

## Casos de uso

- Evaluación de metodologías de optimización de políticas en simulación: el modelo sirve como referencia para estudiar cómo las estrategias evolutivas con funciones de coste rediseñadas pueden superar a optimizadores de cola que carecen de gradiente hacia el cruce temprano.
- Reproducción de resultados en la Microduck Arena: útil para verificar el marcador de 5,052 s en las cinco semillas oficiales bajo las versiones fijadas de MuJoCo 3.10.0, onnxruntime 1.24.4 y numpy 2.4.1.
- Estudio de artefactos híbridos *lookup* + red de respaldo: caso práctico de cómo combinar memorización de trayectorias con una política general para obtener rendimiento en competición a costa de generalización.
- Análisis de sensibilidad al *hardware*: el autor documenta que una CPU distinta puede romper la reproducción por redondeo en coma flotante, lo que lo convierte en un caso de estudio sobre determinismo en simulación física.
- Docencia sobre riesgos de sobreajuste en competiciones: la model card expone explícitamente que el modelo es *in-sample* y que los especialistas no generalizan (solo 16 a 33 de 40 semillas nuevas completadas como redes).
- Comparación de entradas de la Arena: permite contrastar la cola 94cd de jrubiosainz, la entrada previa del propio autor y esta versión v2 con las métricas por semilla publicadas.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card (tiempo de finalización en segundos por semilla oficial):

| Semilla | Cola 94cd (mejor anterior) | Primera entrada del autor | Este fichero (v2) |
|---|---|---|---|
| 1 | 6,975 | 4,915 | 4,890 |
| 2 | 7,390 | 5,430 | 5,390 |
| 3 | 5,560 | 4,955 | 4,935 |
| 4 | 7,280 | 5,030 | 5,000 |
| 5 | 7,955 | 5,080 | 5,045 |
| Media | 7,032 | 5,082 | **5,052** |

El autor reporta además que, sobre 40 semillas nuevas (desde 1.000.000), el fichero completa 40 de 40 con una media de 7,36 s a 1,15 m/s, que corresponde al rendimiento de la red de v3. Los especialistas, considerados como redes independientes, completan entre 16 y 33 de 40 semillas nuevas; el resto quedan atrapados o caen.

## Requisitos de hardware

- VRAM estimada: no disponible; el artefacto es un modelo ONNX ligero (repositorio de 0,0 GB) y no requiere GPU dedicada para inferencia.
- GPU recomendadas: no disponibles; la inferencia se ejecuta en CPU dentro del *runner* de la Arena.
- Compatibilidad con GPU de consumo: irrelevante para este modelo; el cuello de botella es la simulación física, no la red.
- Opciones de despliegue: el *runner* de la Microduck Arena con MuJoCo 3.10.0, onnxruntime 1.24.4 y numpy 2.4.1; el autor advierte que un Mac produce números distintos y que solo la física x86 del Space decide.
- Latencia y throughput: no disponibles; el tiempo relevante es el de finalización de la prueba (5,052 s de media en las semillas oficiales), no la latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento (media 5 semillas) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `rumezhak/microduck-sock-heist-second-green-v2` (este) | 197.774 pesos en la red base; artefacto ONNX | no aplica | 5,052 s | no disponible | HuggingFace |
| `jrubiosainz/microduck-sock-heist-6m-94cd-tail` | no disponible | no aplica | 7,032 s | Apache-2.0 | HuggingFace |
| `a1rb4Ck/microduck-heist` | no disponible | no aplica | no disponible en la información | Apache-2.0 | HuggingFace |
| `lphatnguyen/microduck-sock-heist-6m-v3` | 197.774 pesos | no aplica | no disponible como entrada de la Arena; base del respaldo | sin licencia declarada | HuggingFace |

## Limitaciones y advertencias

- **Sobreajuste *in-sample***: el fichero reproduce una trayectoria grabada por cada una de las cinco semillas oficiales; fuera de ellas recurre a la red de v3 y su rendimiento cae al de esa red (media de 7,36 s en 40 semillas nuevas).
- **Los especialistas no generalizan**: como redes independientes, completan entre 16 y 33 de 40 semillas nuevas; el resto quedan atrapados o caen.
- **Semilla 2 al límite**: cruza a 5,390 s, dos pasos de control antes de que termine la segunda ventana de giro a 5,440 s; un cruce posterior sería detectado y el robot capturado.
- **Dependencia de versiones y *hardware***: la reproducción es determinista solo con MuJoCo 3.10.0, onnxruntime 1.24.4 y numpy 2.4.1 en x86-64; otro redondeo en coma flotante puede romper la repetición.
- **No apto para robot físico**: las acciones grabadas están muy fuera de lo que servomotores reales podrían ejecutar; el autor prohíbe explícitamente cargarlo en un MicroDuck real.
- **Licencia no declarada**: el repositorio no especifica licencia y se apoya en un modelo base (`lphatnguyen/microduck-sock-heist-6m-v3`) que tampoco la declara, lo que genera incertidumbre para cualquier uso más allá de la competición.
- **Sesgos y alucinación**: no aplica en el sentido habitual, al no ser un modelo de lenguaje; el riesgo equivalente es la confianza excesiva en el marcador de competición como medida de capacidad real.
- **Idiomas y contexto**: no disponibles; no son magnitudes aplicables a este artefacto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rumezhak/microduck-sock-heist-second-green-v2
- Modelo base (red de respaldo): https://huggingface.co/lphatnguyen/microduck-sock-heist-6m-v3
- Modelo base (grafo de *lookup*): https://huggingface.co/a1rb4Ck/microduck-heist
- Entrada a batir (cola 94cd): https://huggingface.co/jrubiosainz/microduck-sock-heist-6m-94cd-tail
- Microduck Arena (Space de Pollen Robotics): https://huggingface.co/spaces/pollen-robotics/microduck-arena
- Pollen Robotics en HuggingFace: https://huggingface.co/pollen-robotics
