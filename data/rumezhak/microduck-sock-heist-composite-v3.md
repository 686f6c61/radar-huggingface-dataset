# rumezhak/microduck-sock-heist-composite-v3

## Resumen

`rumezhak/microduck-sock-heist-composite-v3` es una política de control para el robot simulado MicroDuck, presentada como entrada en la categoría "6 m Sock Heist" de la Microduck Arena de Pollen Robotics. No es un modelo de lenguaje: es un grafo ONNX con tablas de búsqueda (lookup tables) que reproduce trayectorias de control precalculadas para una tarea concreta de manipulación (robar un calcetín y desplazarse 6 metros) dentro del simulador MuJoCo de la Arena. Lo desarrolla el usuario de HuggingFace `rumezhak` como fine-tuning de su propia entrada anterior, `microduck-sock-heist-composite-v2`.

El modelo consigue un tiempo medio de 4,896 s sobre las cinco semillas oficiales de la Arena (5/5 completadas), frente a 4,909 s de su predecesor composite-v2 y 4,922 s de la mejor entrada de terceros en el momento de su publicación. La mejora es de 13 ms en la media, obtenida reoptimizando los últimos 24 a 90 pasos de control de cada semilla mediante CMA-ES separable sobre una reimplementación con snapshot-restart del runner oficial.

Es relevante únicamente en el contexto de la competición Microduck Arena: se trata de una solución in-sample, determinista en x86-64 con las versiones fijadas de MuJoCo, onnxruntime y numpy, y explícitamente no apta para un robot físico. El repositorio tiene 0 descargas y 0 likes, tamaño 0.0 GB y licencia no declarada a nivel de repositorio (solo partes concretas bajo Apache-2.0).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Grafo ONNX con tablas de búsqueda (`L_obs`, `L_act`) y red de respaldo (lphatnguyen v3); política de control, no un transformer |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica; opera sobre observaciones por paso de control) |
| Tipos de cuantizacion | no disponible (formato ONNX; sin variantes GGUF ni cuantizaciones publicadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | No declarada a nivel de repositorio; Apache-2.0 solo para las partes que la portan (layout del grafo y mecanismo de lookup de `a1rb4Ck/microduck-heist@94cd2cfe` y modificaciones de jrubiosainz) |
| Formato de pesos | ONNX (lookup tables de 1352 filas; grafo y tensores heredados de composite-v2) |

## Arquitectura y entrenamiento

La política no es una red neuronal entrenada de extremo a extremo, sino un mecanismo de lookup: un grafo ONNX que indexa tablas `L_obs` y `L_act` a partir de la observación para devolver acciones de control. Las claves de búsqueda no incluyen el comando, por lo que la puntuación es idéntica en cada comando (la Arena la evalúa a 0,20 m/s). Cuando la consulta no coincide, se usa como respaldo la red de `lphatnguyen/microduck-sock-heist-6m-v3`.

El entrenamiento consiste en una búsqueda de optimización sobre las colas de las trayectorias: composite v1 tomó las semillas 1 y 5 de una búsqueda propia y las semillas 2, 3 y 4 de la entrada F2U de jrubiosainz; composite v2 y esta v3 conservan esas secuencias y vuelven a buscar los últimos 24 a 90 pasos de control de cada semilla (v3 durante más pasos) con CMA-ES separable (pasos grandes primero, luego pequeños) sobre una reimplementación con snapshot-restart del runner que solo reproduce el final de una ejecución, unas 10 veces más rápida que ejecuciones completas y validada contra el scorer oficial. La búsqueda se ejecutó en x86-64 y cada candidato se revalidó en x86-64. Las cinco secuencias se reprodujeron en bucle abierto y se grabaron en una nueva tabla de 1352 filas (frente a 1354 de v2) en el mismo layout. Respecto a composite-v2 solo cambian `L_obs`, `L_act` y el metadato `modification_notice`; el grafo, la red de respaldo y el resto de tensores son idénticos.

## Capacidades

- Control de locomoción y manipulación simulada para la tarea "6 m Sock Heist" del MicroDuck en la Microduck Arena.
- Reproducción determinista de cinco trayectorias (semillas oficiales 1 a 5) en x86-64 con MuJoCo 3.10.0, onnxruntime 1.24.4 y numpy 2.4.1.
- Inferencia vía lookup table: consulta por observación con red de respaldo para observaciones no vistas.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No dispone de modo thinking, visión ni audio.
- No generaliza fuera de las cinco semillas oficiales: fuera de ellas actúa la red de respaldo de lphatnguyen v3.

## Casos de uso

- Evaluación comparativa en la Microduck Arena: sirve como referencia de tiempo (4,896 s de media) para medir nuevas entradas en la categoría 6 m Sock Heist bajo el runner v5.
- Reproducción de resultados de investigación: permite replicar exactamente las cinco trayectorias en x86-64 con las versiones de dependencias fijadas, útil para validar pipelines de puntuación.
- Estudio de optimización de colas de trayectoria: el método (CMA-ES separable con snapshot-restart sobre el tramo final) puede reutilizarse como plantilla para otras tareas de la Arena.
- Benchmark de robustez entre plataformas: comparar los tiempos en x86-64 frente a arm64 (Mac) para estudiar la sensibilidad al redondeo de CPU en simuladores MuJoCo.
- Docencia sobre control en bucle abierto: ejemplo de política basada en lookup que ilustra el sobreajuste a trayectorias grabadas y sus límites.
- Integración en herramientas de la Arena: cargar el ONNX en el runner oficial de Pollen Robotics para generar clasificaciones de leaderboard de forma automatizada.
- No es adecuado para robótica física, atención al cliente, generación de código ni ninguna tarea de lenguaje.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre las cinco semillas oficiales (tiempo en segundos, menor es mejor):

| Semilla | composite v2 | composite v3 (este) |
|---|---|---|
| 1 | 4,82 | 4,80 |
| 2 | 5,19 | 5,17 |
| 3 | 4,76 | 4,75 |
| 4 | 4,82 | 4,80 |
| 5 | 4,96 | 4,96 |
| Media | 4,909 | 4,896 |

Comparación con la mejor entrada de terceros en el momento de la publicación: 4,922 s (jrubiosainz, "derived tail search FCE G5"). La ganancia sobre composite v2 es de 13 ms en la media, procedente de las colas de cuatro semillas (20, 20, 10 y 20 ms). No se han publicado resultados de MMLU, HumanEval, GSM8K ni benchmarks de lenguaje, por no ser un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0.0 GB y el modelo es un ONNX con tablas de 1352 filas, por lo que la huella es mínima y cabe en CPU.
- GPU recomendadas: no aplica; la Arena puntúa en CPU x86-64.
- Cabe en cualquier equipo consumer: se ha ejecutado en x86-64 y en un portátil arm64; no requiere GPU.
- Opciones de despliegue: onnxruntime 1.24.4 con MuJoCo 3.10.0 y numpy 2.4.1, a través del runner v5 de la Microduck Arena; no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; la puntuación se mide como tiempo de finalización de la tarea (4,896 s de media), no como latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Tipo | Tiempo medio (5 semillas) | Licencia | Disponibilidad |
|---|---|---|---|---|
| rumezhak/microduck-sock-heist-composite-v3 | Lookup ONNX + red de respaldo | 4,896 s | No declarada (partes Apache-2.0) | HuggingFace |
| rumezhak/microduck-sock-heist-composite-v2 | Lookup ONNX + red de respaldo | 4,909 s | No declarada | HuggingFace |
| jrubiosainz/microduck-sock-heist-6m-rz-tail-r4 ("derived tail search FCE G5") | Política basada en búsqueda de cola | 4,922 s | Apache-2.0 (archivo LICENSE, sin campo `license:`) | HuggingFace |
| lphatnguyen/microduck-sock-heist-6m-v3 | Red neuronal (respaldo de este modelo) | no disponible | No declarada | HuggingFace |

## Limitaciones y advertencias

- Sobreajuste in-sample: fuera de las cinco semillas oficiales el archivo se comporta como la red de lphatnguyen v3; solo las cinco trayectorias grabadas son rápidas.
- Determinismo frágil: las repeticiones solo son deterministas en x86-64 con MuJoCo 3.10.0, onnxruntime 1.24.4 y numpy 2.4.1; el redondeo de otra CPU puede romper alguna, y en Mac los números difieren ligeramente y el lookup puede fallar.
- Ventaja marginal: 26 ms sobre el resto del tablero es un paso pequeño y probablemente se iguale o supere pronto combinando las mejores filas por semilla y buscando las colas.
- No apto para robot físico: las acciones grabadas están muy fuera de lo que se pediría a servomotores reales; no cargar en un MicroDuck real.
- Licencia ambigua: el repositorio no está etiquetado como Apache-2.0 en su conjunto; las entradas de lphatnguyen v3 y v4 y las propias de rumezhak no declaran licencia, y las partes sin licencia no se relicencian aquí. Riesgo para uso comercial.
- El autor no consultó a jrubiosainz, lphatnguyen ni a1rb4Ck antes de publicar; se retirará si algún autor se opone.
- Sin datos de sesgos, alucinación o multilingüismo por no ser un modelo de lenguaje.
- El autor declara que un asistente de IA ayudó en algunos experimentos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rumezhak/microduck-sock-heist-composite-v3
- Modelo base (composite v2): https://huggingface.co/rumezhak/microduck-sock-heist-composite-v2
- Entrada remix previa: https://huggingface.co/rumezhak/microduck-sock-heist-remix-rz-tail
- Microduck Arena (Space): https://huggingface.co/spaces/pollen-robotics/microduck-arena
- jrubiosainz, F2U / tail r4: https://huggingface.co/jrubiosainz/microduck-sock-heist-6m-rz-tail-r4
- lphatnguyen v3: https://huggingface.co/lphatnguyen/microduck-sock-heist-6m-v3
- lphatnguyen v4: https://huggingface.co/lphatnguyen/microduck-sock-heist-6m-v4
- a1rb4Ck, microduck-heist (Apache-2.0): https://huggingface.co/a1rb4Ck/microduck-heist
- Pollen Robotics: https://huggingface.co/pollen-robotics
