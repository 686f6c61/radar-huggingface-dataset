# rumezhak/microduck-sock-heist-composite-v14

## Resumen

microduck-sock-heist-composite-v14 es una política de control para el reto 6 m Sock Heist de la Microduck Arena, un entorno de simulación de robótica organizado por Pollen Robotics. El modelo lo publica el usuario rumezhak como una entrada de competición y deriva por fine-tuning de su propia versión anterior, `microduck-sock-heist-composite-v13`. No es un modelo de lenguaje: es un grafo ONNX con tablas de búsqueda que mapean observaciones a acciones para un controlador de robot simulado.

La relevancia del modelo es puramente competitiva: consigue un tiempo medio de 4.757 s sobre las cinco semillas oficiales del reto, frente a 4.758 s de `sock-ca3-n19b`, 4.759 s de `gin-sock-c19` y 4.760 s de su predecesor composite v13. La mejora es de milisegundos y se apoya en la optimización de las trayectorias registradas, no en cambios de arquitectura. El modelo es explícitamente solo para simulación y no debe cargarse en un MicroDuck físico.

El repositorio ocupa 0.0 GB, no tiene descargas ni likes, y su licencia global no está declarada: solo algunas partes heredadas llevan Apache-2.0. La model card documenta con detalle la procedencia de cada semilla y las limitaciones de reproducibilidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Grafo ONNX con tablas de búsqueda de observación (`L_obs`) y acción (`L_act`) más red de respaldo heredada de `lphatnguyen/microduck-sock-heist-6m-v3` |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica: control robótico por pasos de simulación) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | no disponible a nivel de repositorio; Apache-2.0 solo en las partes que la portan (layout del grafo y mecanismo de lookup de `a1rb4Ck/microduck-heist@94cd2cfe`) |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo no entrena una red neuronal desde cero: parte del grafo, la red de respaldo y el mecanismo de lookup de composite v13 y solo sustituye las tablas `L_obs` y `L_act`, reconstruidas fila a fila a partir de cinco trayectorias grabadas (1317 filas nuevas). La red de respaldo es la de `lphatnguyen/microduck-sock-heist-6m-v3`, de modo que fuera de las cinco semillas oficiales el comportamiento equivale a esa red.

El ajuste de las trayectorias se hizo con CMA-ES separable sobre las últimas filas, búsqueda coordenada por articulación (método publicado por HlibPlakhtii) y una búsqueda sobre ramas de historial de contacto que arrancan de una patada de un ulp y se repulen. Todo candidato se reprodujo en el runner de la Arena. El cómputo reportado son varias horas en una máquina x86-64 de 32 núcleos. Las semillas 1, 2 y 5 ganan un tick (5 ms) respecto a v13; las semillas 3 y 4 solo ganan fracciones de tick.

## Capacidades

- Control de un robot simulado MicroDuck en la tarea 6 m Sock Heist de la Microduck Arena.
- Reproducción determinista de cinco trayectorias concretas bajo MuJoCo 3.10.0, onnxruntime 1.24.4 y numpy 2.4.1 en x86-64.
- Ejecución a velocidad de comando de 0.20 m/s, la usada por el scorer de la Arena.
- Fallback a la red de `lphatnguyen` v3 cuando la observación no coincide con ninguna fila registrada.
- No soporta tool calling, agentes, multilingüismo, visión, audio ni modo thinking: no es un modelo generativo.

## Casos de uso

- Participación en el reto 6 m Sock Heist de la Microduck Arena: sirve como entrada lista para evaluar con el scorer oficial sobre las cinco semillas, comparando tiempos contra otros participantes.
- Reproducción de resultados de la Arena: permite verificar en x86-64 con las versiones fijadas de MuJoCo, onnxruntime y numpy las marcas reportadas (4.610, 5.065, 4.650, 4.675 y 4.785 s).
- Punto de partida para pulir colas de trayectoria: cualquiera que tome las filas de lookup puede optimizar los tramos finales y igualar o batir los márgenes de milisegundos, como advierte el autor.
- Estudio de métodos de búsqueda de políticas: documenta una combinación concreta de CMA-ES separable, búsqueda coordenada y búsqueda sobre ramas de contacto aplicada a control de robot simulado.
- Referencia de linaje y atribución: la model card traza la procedencia de cada semilla (`lphatnguyen` para 1-4, HlibPlakhtii para la 5) y las licencias de cada fragmento, útil para auditar entradas de la Arena.
- Benchmark de reproducibilidad entre plataformas: permite medir cómo el redondeo de otra CPU puede romper semillas que quedan a 0.0014 pasos de un tick, y contrastar física x86 frente a Mac.

## Benchmarks y rendimiento

Resultados reportados por el autor con el scorer de la Arena en x86-64, por semilla (tiempo en segundos y paso de física exacto entre paréntesis; un tick son 5 ms):

| Semilla | composite v13 | composite v14 |
|---|---|---|
| 1 | 4.615 (922.022) | 4.610 (921.967) |
| 2 | 5.070 (1013.925) | 5.065 (1012.999) |
| 3 | 4.650 (929.788) | 4.650 (929.551) |
| 4 | 4.675 (934.795) | 4.675 (934.728) |
| 5 | 4.790 (957.102) | 4.785 (957.000) |
| Media | 4.760 | 4.757 |

Comparación con otras entradas de la Arena citadas en la model card:

| Entrada | Tiempo medio (s) |
|---|---|
| rumezhak/microduck-sock-heist-composite-v14 | 4.757 |
| jrubiosainz/sock-ca3-n19b | 4.758 |
| GinDuck/gin-sock-c19 | 4.759 |
| rumezhak/microduck-sock-heist-composite-v13 | 4.760 |

No se han publicado resultados de benchmarks en la información disponible para métricas distintas del scorer de la Arena (MMLU, HumanEval, GSM8K u otras).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0.0 GB y el modelo es un grafo ONNX con tablas de lookup, no un transformer con pesos masivos.
- GPU recomendadas: no disponible; la model card solo documenta ejecución en CPU x86-64.
- CPU de referencia: x86-64 de 32 núcleos para el proceso de optimización; la inferencia se validó en x86-64 con MuJoCo 3.10.0, onnxruntime 1.24.4 y numpy 2.4.1.
- Compatibilidad con GPU de consumo: no disponible; no se reporta uso de CUDA.
- Opciones de despliegue: runner de la Microduck Arena (Space de Pollen Robotics) y onnxruntime; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el tiempo relevante es el de finalización de la tarea (4.757 s de media), no latencia por inferencia.

## Comparativa con modelos similares

| Modelo | Tipo | Tiempo medio en el reto (s) | Semillas completadas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rumezhak/microduck-sock-heist-composite-v14 | ONNX, lookup + fallback | 4.757 | 5/5 | no disponible (Apache-2.0 parcial) | Hugging Face |
| rumezhak/microduck-sock-heist-composite-v13 | ONNX, lookup + fallback | 4.760 | 5/5 | no disponible | Hugging Face |
| jrubiosainz/sock-ca3-n19b | política para la Arena | 4.758 | no disponible | no disponible | Hugging Face |
| GinDuck/gin-sock-c19 | política para la Arena | 4.759 | no disponible | no disponible | Hugging Face |

Las diferencias entre las cuatro entradas caben en 3 ms, dentro del margen de un tick (5 ms), por lo que la comparación por tiempo es esencialmente un empate técnico.

## Limitaciones y advertencias

- In-sample: fuera de las cinco semillas oficiales el modelo es la red de `lphatnguyen` v3; solo las cinco trayectorias grabadas son rápidas.
- Márgenes frágiles: las semillas 2 y 5 cruzan su tick por 0.0014 y 0.0003 de un paso de 5 ms, por lo que otro redondeo de CPU puede romper la reproducción.
- Reproducibilidad dependiente de plataforma: los replays son deterministas solo en x86-64 con MuJoCo 3.10.0, onnxruntime 1.24.4 y numpy 2.4.1; en Mac los números difieren y el lookup puede fallar.
- Solo simulación: las acciones registradas están muy fuera de lo que se pediría a servos reales; no debe cargarse en un MicroDuck físico.
- Licencia ambigua: el repositorio no está etiquetado Apache-2.0 en conjunto; varias fuentes (`HlibPlakhtii/microduck-sock-heist-nov18-v5`, `jrubiosainz/microduck-sock-counter-s1s5`, `lphatnguyen/microduck-sock-heist-6m-v5` y entradas propias anteriores) no declaran licencia, lo que limita el uso comercial sin aclaración.
- Riesgo de retirada: el autor no pidió permiso a HlibPlakhtii, jrubiosainz, GinDuck, lphatnguyen ni a1rb4Ck; si alguno objeta, la entrada se retirará.
- Ventaja marginal: unos milisegundos de diferencia pueden igualarse o superarse fácilmente por cualquiera que tome las filas y pula las colas.
- Sin métricas de sesgo, alucinación o idioma: no aplican a un controlador robótico, pero tampoco se reportan evaluaciones de robustez fuera de las semillas oficiales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rumezhak/microduck-sock-heist-composite-v14
- Modelo base (composite v13): https://huggingface.co/rumezhak/microduck-sock-heist-composite-v13
- Red de respaldo (lphatnguyen v3): https://huggingface.co/lphatnguyen/microduck-sock-heist-6m-v3
- Trayectorias de semillas 1-4: https://huggingface.co/lphatnguyen/microduck-sock-heist-6m-v5
- Trayectoria de semilla 5: https://huggingface.co/HlibPlakhtii/microduck-sock-heist-nov18-v5
- Layout del grafo y lookup (Apache-2.0): https://huggingface.co/a1rb4Ck/microduck-heist
- Microduck Arena (Pollen Robotics): https://huggingface.co/spaces/pollen-robotics/microduck-arena
- Pollen Robotics: https://huggingface.co/pollen-robotics
