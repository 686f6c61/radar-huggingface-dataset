# rumezhak/microduck-sock-heist-composite-v9

## Resumen

`microduck-sock-heist-composite-v9` es una entrada de competición para el reto "6 m Sock Heist" de la Microduck Arena, un entorno de simulación de robótica organizado por Pollen Robotics. No es un modelo de lenguaje ni un sistema de aprendizaje general: es un artefacto ONNX que combina una red neuronal de respaldo (heredada de `lphatnguyen/microduck-sock-heist-6m-v3`) con tablas de búsqueda (`L_obs` y `L_act`) que reproducen cinco trayectorias pregrabadas, una por cada semilla oficial del reto. El autor, `rumezhak`, ha aplicado una búsqueda CMA-ES separable sobre las últimas 36 filas de cada secuencia para recortar la duración total.

El resultado declarado es de 4,806 s de media en las cinco semillas oficiales, frente a 4,829 s de la entrada de referencia `lphatnguyen/sock-heist-6m-v5` y 4,880 s de la versión anterior del propio autor (composite v8). La mejora es de 23 ticks de 5 ms, es decir, unos 115 ms. El modelo es explícitamente "in-sample": solo las cinco trayectorias registradas son rápidas, y fuera de esas semillas el comportamiento recae en la red de respaldo.

La relevancia es acotada y hay que subrayarla: se trata de una entrada de leaderboard con licencia fragmentaria y sin permiso explícito de los autores upstream, no apta para un robot físico y sin utilidad fuera del simulador de la Arena. Su interés técnico está en documentar el método de pulido de colas con CMA-ES sobre secuencias grabadas y en ilustrar los problemas de atribución y licencias en competiciones de modelos derivados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Grafo ONNX con tablas de búsqueda (`L_obs`, `L_act`) y red neuronal de respaldo; sin arquitectura de transformer |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (control robótico por pasos, sin contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | Mixta y fragmentaria: Apache-2.0 solo en las partes que la declaran (layout del grafo y mecanismo de lookup de `a1rb4Ck/microduck-heist@94cd2cfe`); el repositorio en su conjunto no se etiqueta como Apache-2.0; las trayectorias de `lphatnguyen` no se relicencian |
| Formato de pesos | ONNX (`.onnx`), con metadatos `modification_notice` |
| Pipeline | robotics |
| Libreria | microduck |
| Tamano del repo | 0,0 GB (según Hugging Face) |
| Modelos base | `rumezhak/microduck-sock-heist-composite-v5`, `jrubiosainz/microduck-sock-heist-6m-wr1n-3f7c858c` |
| Entorno de ejecución | MuJoCo 3.10.0, onnxruntime 1.24.4, numpy 2.4.1 (versiones fijadas por la Arena) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El artefacto no se entrena en el sentido habitual. La estructura es un grafo ONNX que, en cada paso de control, consulta una tabla de búsqueda indexada por la observación (`L_obs`) para recuperar una acción pregrabada (`L_act`). Cuando la observación no coincide con ninguna clave de la tabla, se activa una red neuronal de respaldo: la de `lphatnguyen/microduck-sock-heist-6m-v3`. El grafo, la red de respaldo y el mecanismo de lookup son idénticos a los de `composite-v5`; según el autor, solo cambian las tablas `L_obs` y `L_act` (cada fila reconstruida, 1347 filas en lugar de 1348) y el metadato `modification_notice`.

El "entrenamiento" consiste en una búsqueda CMA-ES separable sobre las últimas 36 filas de cada una de las cinco secuencias, partiendo de las trayectorias grabadas de `lphatnguyen/sock-heist-6m-v5` y ejecutada en x86-64. Cada candidato se valida contra el runner de la Arena, y la búsqueda encontró 23 ticks adicionales de 5 ms. La puntuación es idéntica en cada comando porque las claves de lookup no incluyen el comando; la Arena la evalúa a 0,20 m/s. No hay RLHF, DPO ni datos de entrenamiento en el sentido de un modelo generativo.

## Capacidades

- Control de un agente simulado (MicroDuck) en la tarea "6 m Sock Heist" de la Microduck Arena, exclusivamente en simulación.
- Reproducción determinista de cinco trayectorias pregrabadas, una por semilla oficial, con tiempos de 4,640 s, 5,095 s, 4,675 s, 4,725 s y 4,895 s.
- Recuperación de acción por lookup sobre observación, con red de respaldo para observaciones fuera de tabla.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No tiene capacidades multilingües ni procesamiento de texto, visión o audio.
- No dispone de modo "thinking" ni de mecanismos de decodificación especulativa.

## Casos de uso

- Evaluación de métodos de pulido de trayectorias: sirve como referencia de hasta dónde llega una búsqueda CMA-ES separable sobre las últimas 36 filas de una secuencia grabada, con una ganancia medida de 23 ticks de 5 ms.
- Estudio de atribución y licencias en modelos derivados: el repositorio documenta con precisión qué partes son Apache-2.0, cuáles no declaran licencia y qué contribuciones provienen de cada autor, lo que lo convierte en un caso práctico para analizar cadenas de derivación.
- Reproducibilidad de entornos de simulación: al fijar MuJoCo 3.10.0, onnxruntime 1.24.4 y numpy 2.4.1, permite comprobar cómo el redondeo de la CPU afecta a un controlador determinista.
- Benchmarking interno de la Microduck Arena: útil para comparar el scorer oficial entre entradas del leaderboard (v5, `heist-lookup-v1`, composite v8) en las mismas cinco semillas.
- Docencia sobre sobreajuste in-sample: el propio autor advierte que fuera de las cinco semillas el archivo es la red v3, lo que lo hace un ejemplo claro de métrica optimizada contra un conjunto fijo.
- Referencia negativa para despliegue en robótica real: el autor indica explícitamente que las acciones grabadas están fuera de lo que pedirían servos reales, por lo que sirve como contraejemplo de lo que no debe cargarse en un MicroDuck físico.

## Benchmarks y rendimiento

Resultados declarados por el autor con el scorer propio de la Arena, en su máquina x86-64, sobre las cinco semillas oficiales (tiempo en segundos, menor es mejor):

| Semilla | composite v8 | lphatnguyen v5 | este archivo (v9) |
|---|---|---|---|
| 1 | 4,795 | 4,665 | 4,640 |
| 2 | 5,150 | 5,120 | 5,095 |
| 3 | 4,750 | 4,710 | 4,675 |
| 4 | 4,785 | 4,745 | 4,725 |
| 5 | 4,920 | 4,905 | 4,895 |
| Media | 4,880 | 4,829 | 4,806 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni tendrían sentido para este artefacto.

## Requisitos de hardware

- VRAM estimada: no disponible; el tamaño del repositorio se reporta como 0,0 GB y no se detalla el tamaño del grafo ONNX.
- GPU recomendadas: no disponible; el autor reporta ejecución en CPU x86-64 con onnxruntime 1.24.4.
- Cabe en cualquier equipo con CPU x86-64 que pueda ejecutar la Arena; no se documenta soporte GPU.
- Opciones de despliegue: el runner de la Microduck Arena (Space de Pollen Robotics) con MuJoCo 3.10.0, onnxruntime 1.24.4 y numpy 2.4.1. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia y throughput: no disponibles como métricas de inferencia; el resultado relevante es el tiempo de tarea en simulación (4,806 s de media).
- Advertencia de portabilidad: en un Mac los números difieren ligeramente y el lookup puede fallar; solo la física x86 del Space decide.

## Comparativa con modelos similares

| Modelo | Tipo | Tiempo medio (5 semillas) | Licencia | Disponibilidad |
|---|---|---|---|---|
| `rumezhak/microduck-sock-heist-composite-v9` (este) | Lookup + red de respaldo | 4,806 s | Mixta, no etiquetada como Apache-2.0 en conjunto | Hugging Face, 0 descargas |
| `lphatnguyen/microduck-sock-heist-6m-v5` | Secuencias grabadas | 4,829 s | Sin licencia declarada | Hugging Face |
| `nikghodki/microduck-heist-lookup-v1` | Lookup | 4,879 s | no disponible | Hugging Face |
| `rumezhak/microduck-sock-heist-composite-v8` | Lookup + red de respaldo | 4,880 s | no disponible | Hugging Face |

La diferencia entre el primero y el segundo es de 23 ms, que el propio autor califica de insignificante y fácilmente superable por cualquiera que combine las mejores filas por semilla y pula las colas.

## Limitaciones y advertencias

- Sobreajuste in-sample: fuera de las cinco semillas oficiales el archivo se comporta como la red v3; solo las cinco trayectorias grabadas son rápidas.
- Determinismo frágil: los replays solo son deterministas en x86-64 con las versiones fijadas de MuJoCo, onnxruntime y numpy; otro redondeo de CPU puede romper una trayectoria y hacer fallar el lookup.
- Licencia fragmentaria: el repositorio no está etiquetado como Apache-2.0 en su conjunto; las trayectorias de `lphatnguyen` no se relicencian y varios modelos base no declaran licencia. El uso comercial queda sin una base clara.
- Falta de permiso upstream: el autor reconoce no haber consultado a `jrubiosainz`, `HlibPlakhtii`, `lphatnguyen` ni `a1rb4Ck`, y ofrece retirar la entrada si alguno objeta.
- No apto para robot físico: las acciones grabadas exceden lo que pedirían servos reales; el autor prohíbe explícitamente cargarlo en un MicroDuck real.
- Sin capacidades de lenguaje: no procesa texto, no soporta tool calling y no tiene sesgos lingüísticos ni riesgo de alucinación en el sentido habitual, pero tampoco generaliza a tareas distintas del reto.
- Mérito compartido: la mayor parte de la mejora frente a entradas anteriores proviene de las trayectorias de `lphatnguyen`; la contribución propia es el pulido de colas.
- Cero tracción: 0 descargas y 0 likes en el momento de la consulta, sin validación independiente de los tiempos reportados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rumezhak/microduck-sock-heist-composite-v9
- Microduck Arena (Space de Pollen Robotics): https://huggingface.co/spaces/pollen-robotics/microduck-arena
- Modelo base: https://huggingface.co/rumezhak/microduck-sock-heist-composite-v5
- Modelo base: https://huggingface.co/jrubiosainz/microduck-sock-heist-6m-wr1n-3f7c858c
- Trayectorias de referencia: https://huggingface.co/lphatnguyen/microduck-sock-heist-6m-v5
- Red de respaldo (v3): https://huggingface.co/lphatnguyen/microduck-sock-heist-6m-v3
- Entrada comparada: https://huggingface.co/nikghodki/microduck-heist-lookup-v1
- Versión anterior del autor: https://huggingface.co/rumezhak/microduck-sock-heist-composite-v8
- Layout del grafo de lookup: https://huggingface.co/a1rb4Ck/microduck-heist
- Créditos de la línea walker: https://huggingface.co/juicenv
- Organización: https://huggingface.co/pollen-robotics
