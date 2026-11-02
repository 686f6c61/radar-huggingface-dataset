# rumezhak/microduck-sock-heist-remix-rz-tail

## Resumen

Microduck Sock Heist Remix RZ Tail es una política de control para robótica formulada como un grafo ONNX con tablas de búsqueda (lookup tables) y una red neuronal de respaldo, publicada por el usuario rumezhak en Hugging Face. No es un modelo de lenguaje: es una entrada de competición para el reto "6 m Sock Heist" de la Microduck Arena de Pollen Robotics, un entorno de simulación donde un robot cuadrúpedo de pequeño tamaño debe recorrer una trayectoria de forma rápida y estable. El modelo se distribuye con la librería `microduck` y el pipeline declarado es `robotics`.

El modelo deriva de `jrubiosainz/microduck-sock-heist-6m-rz-tail-r1n` mediante un ajuste fino de las últimas 36 filas de las tablas `L_obs` y `L_act` de cada una de las cinco semillas oficiales, manteniendo intactos el resto de tensores, el grafo y la red de respaldo. El resultado mejora el tiempo medio de 5,010 s a 5,000 s sobre las cinco semillas oficiales, con mejoras en las semillas 2 (5,350 a 5,330 s), 3 (4,890 a 4,880 s) y 5 (5,010 a 5,000 s), mientras que las semillas 1 y 4 permanecen iguales.

Su relevancia es acotada y muy específica: documenta una técnica de optimización de políticas por búsqueda directa sobre trayectorias grabadas (evolution strategies y CMA-ES separable) aplicada a un benchmark de robótica simulada. El propio autor advierte que el rendimiento es in-sample y que fuera de las cinco semillas oficiales el comportamiento degrada al de la red de respaldo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Grafo ONNX con tablas de búsqueda (`L_obs`, `L_act`) y red neuronal de respaldo |
| Parametros totales | no disponible (repo de 0,0 GB; tamaño de parámetros no declarado) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Mixta: Apache-2.0 solo para el layout del grafo y el mecanismo de lookup de `a1rb4Ck/microduck-heist@94cd2cfe`; el repositorio en su conjunto no está etiquetado como Apache-2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

La política no es un transformer ni un modelo generativo. Se compone de un grafo ONNX que consulta tablas de búsqueda indexadas por observación y acción (`L_obs` y `L_act`), con una red neuronal de respaldo heredada de `lphatnguyen/microduck-sock-heist-6m-v3` que se activa cuando la consulta cae fuera de las filas memorizadas. El grafo y el mecanismo de lookup provienen de `a1rb4Ck/microduck-heist` (Apache-2.0), que a su vez cita el walker de juicenv como base de sus tablas.

El "entrenamiento" es en realidad una búsqueda directa sobre trayectorias. La cadena es la siguiente: primero, filas de lookup encontradas por estrategias de evolución (versión `second-green`, 5,082 s, y pulidos posteriores a 5,052 y 5,051 s); después, jrubiosainz reescribió por completo los últimos 24 a 32 pasos de control de cada semilla con CMA-ES separable, bajando de 5,051 a 5,010 s; finalmente, este archivo vuelve a buscar los últimos 36 pasos de cada semilla con pasos grandes primero (0,3), luego 0,05 y 0,01, en tres rondas de 90 segundos por semilla. Todos los demás tensores se mantienen bit a bit. No hay RLHF, DPO ni datos de entrenamiento en el sentido habitual.

## Capacidades

- Control locomotor de un robot cuadrúpedo simulado (MicroDuck) para la tarea Sock Heist de 6 m.
- Ejecución determinista de trayectorias grabadas sobre las cinco semillas oficiales de la Arena.
- Generalización limitada vía red de respaldo: fuera de las semillas oficiales, el archivo se comporta como `lphatnguyen/microduck-sock-heist-6m-v3`.
- Inferencia en CPU x86-64 con onnxruntime, sin necesidad de GPU.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, capacidades multilingües, visión ni audio.

## Casos de uso

- Reproducción de resultados en la Microduck Arena: cargar el archivo en el runner v5 de la Arena para verificar los tiempos declarados (5,000 s de media) bajo MuJoCo 3.10.0, onnxruntime 1.24.4 y numpy 2.4.1.
- Investigación en optimización de políticas: servir como referencia de cómo CMA-ES separable y búsqueda por pasos decrecientes mejoran trayectorias memorizadas en un entorno de control con recompensa de tiempo.
- Estudio de métodos de lookup + red de respaldo: analizar el equilibrio entre memorización de trayectorias y generalización a semillas no vistas (40 de 40 completadas, 7,36 s de media a 1,15 m/s con la red base).
- Benchmark de determinismo numérico: comparar la reproducibilidad de la simulación entre plataformas x86-64 y Mac, dado que el autor advierte de posibles diferencias por redondeo de CPU.
- Docencia en robótica simulada: ejemplo didáctico de política de control de bajo coste computacional que corre en CPU.
- Auditoría de licencias en modelos derivados: caso práctico de cómo se compone un artefacto a partir de piezas con licencias distintas (Apache-2.0 parcial, piezas sin licencia declarada).

## Benchmarks y rendimiento

Resultados declarados por el autor sobre las cinco semillas oficiales de la Microduck Arena (tiempo en segundos; menor es mejor):

| Semilla | rumezhak v3 | jrubiosainz r1n | Este archivo |
|---|---|---|---|
| 1 | 4,885 | 4,840 | 4,840 |
| 2 | 5,390 | 5,350 | 5,330 |
| 3 | 4,935 | 4,890 | 4,880 |
| 4 | 5,000 | 4,960 | 4,960 |
| 5 | 5,045 | 5,010 | 5,000 |
| Media | 5,051 | 5,010 | 5,000 |

La puntuación es idéntica en cada comando porque la máscara de lookup anula la señal de comando; la Arena lo puntúa a 0,20 m/s. Fuera de las semillas oficiales, el archivo equivale a la red de respaldo v3: 40 de 40 semillas completadas con una media de 7,36 s a 1,15 m/s.

## Requisitos de hardware

- VRAM: no aplica; la inferencia se ejecuta en CPU.
- CPU: x86-64 recomendado para reproducir los tiempos exactos; el autor advierte de que otro CPU podría alterar el redondeo y romper alguna trayectoria (la semilla 2 cruza a 5,330 s, 0,11 s antes de cerrarse su segunda ventana de giro).
- GPU: no necesaria ni documentada.
- Despliegue: onnxruntime 1.24.4 con MuJoCo 3.10.0 y numpy 2.4.1 (versiones fijadas por la Arena); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles; el entorno es de simulación en tiempo real con pasos de control.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto / tarea | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rumezhak/microduck-sock-heist-remix-rz-tail | Lookup ONNX + red de respaldo | Sock Heist 6 m, 5 semillas | 5,000 s de media | Mixta (Apache-2.0 parcial) | Hugging Face |
| jrubiosainz/microduck-sock-heist-6m-rz-tail-r1n | Lookup ONNX + red de respaldo | Sock Heist 6 m, 5 semillas | 5,010 s de media | Sin campo `license:` | Hugging Face |
| lphatnguyen/microduck-sock-heist-6m-v3 | Red neuronal de respaldo | Sock Heist 6 m, general | 7,36 s de media en 40 semillas nuevas | Sin licencia declarada | Hugging Face |
| a1rb4Ck/microduck-heist | Grafo de lookup | Sock Heist 6 m | No disponible en la información proporcionada | Apache-2.0 | Hugging Face |

## Limitaciones y advertencias

- Sobreajuste in-sample: el rendimiento de 5,000 s solo se sostiene en las cinco semillas oficiales; en 40 semillas nuevas el archivo se comporta como la red de respaldo v3 (7,36 s de media).
- Determinismo frágil: los replays solo son deterministas en x86-64 con MuJoCo 3.10.0, onnxruntime 1.24.4 y numpy 2.4.1; otra CPU o un Mac pueden dar números distintos.
- Margen estrecho en la semilla 2: cruza a 5,330 s, solo 0,11 s antes de que se cierre su segunda ventana de giro.
- No apto para robot físico: las acciones grabadas quedan muy fuera de lo que se pediría a servomotores reales; el autor prohíbe explícitamente cargarlo en un MicroDuck físico.
- Licencia ambigua: el repositorio no está etiquetado como Apache-2.0 en su conjunto; las piezas de jrubiosainz y lphatnguyen no declaran licencia y no se relicencian aquí. Apache-2.0 cubre solo el layout del grafo y el mecanismo de lookup de a1rb4Ck.
- Riesgo de retirada: el autor no consultó a jrubiosainz ni a lphatnguyen antes de publicar y se compromete a retirar el archivo si alguno de ellos objeta.
- Sin datos de sesgo, alucinación o idioma: no aplican al no ser un modelo de lenguaje, pero tampoco se documenta ningún análisis de robustez más allá de las cinco semillas.
- Asistencia de IA declarada en parte de los experimentos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rumezhak/microduck-sock-heist-remix-rz-tail
- Modelo base: https://huggingface.co/jrubiosainz/microduck-sock-heist-6m-rz-tail-r1n
- Red de respaldo: https://huggingface.co/lphatnguyen/microduck-sock-heist-6m-v3
- Grafo de lookup original (Apache-2.0): https://huggingface.co/a1rb4Ck/microduck-heist
- Microduck Arena: https://huggingface.co/spaces/pollen-robotics/microduck-arena
- Organización Pollen Robotics: https://huggingface.co/pollen-robotics
- Entrada previa del autor: https://huggingface.co/rumezhak/microduck-sock-heist-second-green
