# rumezhak/microduck-sock-heist-composite-v11

## Resumen

`rumezhak/microduck-sock-heist-composite-v11` es una política de control para robots MicroDuck que compite en la prueba "Sock Heist" de 6 metros de la Microduck Arena, un entorno de simulación organizado por Pollen Robotics. No es un modelo de lenguaje ni un modelo generativo: es un artefacto de robótica en formato ONNX que, a partir de observaciones del simulador, emite acciones de control para completar la tarea en el menor tiempo posible. El autor, rumezhak, lo publica como entrada de competición y solo tiene validez dentro del simulador.

El modelo es un compuesto (merge) de dos linajes: por un lado, las semillas 1 y 2 provienen sin cambios de `HlibPlakhtii/microduck-sock-heist-nov17-v3`; por otro, las semillas 3, 4 y 5 son el resultado de búsquedas CMA-ES sobre trayectorias de `lphatnguyen` y del propio Hlib. La arquitectura no es una red neuronal entrenada de forma convencional, sino un grafo con tablas de búsqueda (`L_obs` y `L_act`) que memorizan 1319 filas de pares observación-acción, más una red de respaldo (la de `lphatnguyen/microduck-sock-heist-6m-v3`) para observaciones no registradas.

Su relevancia es acotada y muy específica: marca un tiempo medio de 4.771 s en las cinco semillas oficiales (5/5 terminadas), frente a 4.780 s de su versión anterior v10 y 4.787 s de `nov17-v3`. Es, por tanto, una mejora marginal de 9 ms en un benchmark de simulación, y el propio autor advierte que es un resultado in-sample y que no debe cargarse en un robot físico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Grafo ONNX con tablas de búsqueda observación-acción (`L_obs`, `L_act`, 1319 filas) y red de respaldo (la de `lphatnguyen/microduck-sock-heist-6m-v3`) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de secuencia) |
| Tipos de cuantizacion | no disponible (pesos en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | no disponible como repositorio completo; Apache-2.0 solo para las partes que la declaran (layout del grafo y mecanismo de lookup de `a1rb4Ck/microduck-heist@94cd2cfe`) |
| Formato de pesos | ONNX |
| Libreria | microduck |
| Pipeline | robotics |
| Modelo base | `rumezhak/microduck-sock-heist-composite-v10`, `HlibPlakhtii/microduck-sock-heist-nov17-v3` (relación: merge) |
| Tamaño del repo | 0.0 GB |
| Entorno de ejecución | MuJoCo 3.10.0, onnxruntime 1.24.4, numpy 2.4.1 (versiones fijadas por la Arena) |

## Arquitectura y entrenamiento

El artefacto no sigue el esquema de un transformer ni de un modelo generativo. Es un grafo ONNX que implementa un mecanismo de búsqueda en tabla: para cada observación se consultan las tablas `L_obs` y `L_act`, que contienen 1319 filas reconstruidas a partir de cinco secuencias grabadas. Cuando la observación no coincide con ninguna fila registrada, el grafo recurre a una red de respaldo, que es la de `lphatnguyen/microduck-sock-heist-6m-v3`. El layout del grafo y el mecanismo de lookup proceden de `a1rb4Ck/microduck-heist@94cd2cfe`.

El "entrenamiento" es en realidad una búsqueda de trayectorias: el autor aplicó CMA-ES separable sobre x86-64 partiendo de las trayectorias de `lphatnguyen` (semillas 3 y 4) y de la trayectoria de la semilla 5 de Hlib, verificando cada candidato contra el runner de la Arena. Las semillas 1 y 2 se tomaron sin modificar de `nov17-v3`, que a su vez hace finetuning de `jrubiosainz/microduck-sock-counter-s1s5`. Respecto a la versión v10 solo cambian las tablas `L_obs` y `L_act` (todas las filas reconstruidas) y el metadato `modification_notice`; el grafo, la red de respaldo y el resto de tensores son idénticos.

## Capacidades

- Control de política para la tarea "Sock Heist" de 6 m en la Microduck Arena (simulación).
- Ejecución de trayectorias memorizadas para las cinco semillas oficiales de la Arena.
- Generalización limitada fuera de las semillas registradas mediante la red de respaldo de `lphatnguyen` v3.
- Inferencia determinista en x86-64 con las versiones fijadas de MuJoCo, onnxruntime y numpy.
- Puntuación independiente del comando: las claves de búsqueda no incluyen el comando, por lo que el resultado es el mismo a cualquier velocidad de comando (la Arena puntúa a 0,20 m/s).
- No soporta tool calling, agentes, razonamiento multi-paso, multilingüismo ni modalidades de texto, visión o audio.

## Casos de uso

- Participación en la clasificación de la Microduck Arena: el modelo se sube como entrada de la prueba "Sock Heist" de 6 m y se evalúa con el scorer oficial de la Arena sobre las cinco semillas. Es su uso previsto y el único validado.
- Reproducción de resultados en x86-64: sirve para verificar de forma determinista los tiempos publicados (4.771 s de media) siempre que se usen MuJoCo 3.10.0, onnxruntime 1.24.4 y numpy 2.4.1.
- Estudio del mecanismo de lookup en tablas: el grafo y las tablas `L_obs`/`L_act` son un ejemplo concreto de política memorizada con red de respaldo, útil para analizar compromisos entre memorización y generalización en robótica simulada.
- Punto de partida para búsquedas CMA-ES: las trayectorias registradas pueden servir como inicialización para que otros equipos pulan las colas de las trayectorias, tal como el autor anticipa en la model card.
- Evaluación comparativa de entradas de la Arena: permite contrastar tiempos contra `counter-c1`, `gin-sock-c17`, `nov17-v3` y `composite-v10` en el mismo entorno de simulación.
- Docencia sobre reproducibilidad en simulación: ilustra la sensibilidad de los resultados a la CPU (el autor señala que un Mac da números ligeramente distintos y el lookup puede fallar).

## Benchmarks y rendimiento

Resultados sobre las cinco semillas oficiales de la Arena, con el scorer propio de la Arena en x86-64 (tiempo en segundos; menor es mejor):

| Modelo | Semilla 1 | Semilla 2 | Semilla 3 | Semilla 4 | Semilla 5 | Media |
|---|---|---|---|---|---|---|
| `composite-v11` (este) | 4.635 | 5.095 | 4.655 | 4.680 | 4.790 | **4.771** |
| `composite-v10` | 4.635 | 5.095 | 4.675 | 4.680 | 4.815 | 4.780 |
| `jrubiosainz/counter-c1` y `GinDuck/gin-sock-c17` | no disponible | no disponible | no disponible | no disponible | no disponible | 4.781 |
| `HlibPlakhtii/nov17-v3` | no disponible | no disponible | no disponible | no disponible | no disponible | 4.787 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que el modelo no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada: no disponible; el tamaño del repositorio es de 0.0 GB y no se documentan requisitos de memoria.
- GPU recomendadas: no aplica; la inferencia se ejecuta en CPU x86-64 con onnxruntime.
- Cabe en cualquier CPU de consumidor x86-64; no requiere GPU.
- Despliegue: onnxruntime 1.24.4 con MuJoCo 3.10.0 y numpy 2.4.1, versiones fijadas por la Arena. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles como métricas de inferencia; el único dato de rendimiento es el tiempo de finalización de la tarea (4.771 s de media).
- Advertencia de portabilidad: en Mac los números difieren ligeramente y el lookup puede fallar; solo la física x86-64 del Space decide.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Tiempo medio (5 semillas) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `rumezhak/microduck-sock-heist-composite-v11` | Grafo ONNX + lookup | no disponible | no aplica | 4.771 s | no disponible (Apache-2.0 parcial) | Hugging Face |
| `rumezhak/microduck-sock-heist-composite-v10` | Grafo ONNX + lookup | no disponible | no aplica | 4.780 s | no disponible | Hugging Face |
| `HlibPlakhtii/microduck-sock-heist-nov17-v3` | Política de control | no disponible | no aplica | 4.787 s | no disponible | Hugging Face |
| `jrubiosainz/counter-c1` | Política de control | no disponible | no aplica | 4.781 s | no disponible | Hugging Face |
| `GinDuck/gin-sock-c17` | Política de control | no disponible | no aplica | 4.781 s | no disponible | Hugging Face |

## Limitaciones y advertencias

- Resultado in-sample: fuera de las cinco semillas oficiales, el archivo se comporta como la red v3 de `lphatnguyen`; solo las cinco trayectorias registradas son rápidas.
- Margen mínimo: 10 ms de ventaja sobre los competidores, que el propio autor califica de insignificante y fácilmente superable por quien pula las colas de las trayectorias.
- Dependencia del entorno: los replays solo son deterministas en x86-64 con MuJoCo 3.10.0, onnxruntime 1.24.4 y numpy 2.4.1; otra CPU puede romper un replay por redondeo.
- No apto para robot físico: las acciones registradas están muy fuera de lo que se pediría a servomotores reales; el autor prohíbe explícitamente cargarlo en un MicroDuck físico.
- Licencia ambigua: el repositorio no está etiquetado como Apache-2.0 en su conjunto; solo las partes que la declaran (layout del grafo y mecanismo de lookup de `a1rb4Ck`, más las modificaciones propias) llevan esa licencia. Los modelos base (`HlibPlakhtii`, `jrubiosainz`, `lphatnguyen`) no declaran licencia y sus partes no se relicencian aquí.
- Riesgo de retirada: el autor no pidió permiso a HlibPlakhtii, jrubiosainz, lphatnguyen ni a1rb4Ck; si alguno objeta, la entrada se retirará.
- Sin datos de sesgo, alucinación o multilingüismo aplicables, al no ser un modelo de lenguaje.
- El autor declara que un asistente de IA ayudó en parte de los experimentos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rumezhak/microduck-sock-heist-composite-v11
- Microduck Arena (Space de Pollen Robotics): https://huggingface.co/spaces/pollen-robotics/microduck-arena
- Modelo base `HlibPlakhtii/microduck-sock-heist-nov17-v3`: https://huggingface.co/HlibPlakhtii/microduck-sock-heist-nov17-v3
- Modelo base `rumezhak/microduck-sock-heist-composite-v10`: https://huggingface.co/rumezhak/microduck-sock-heist-composite-v10
- Modelo `jrubiosainz/microduck-sock-counter-s1s5`: https://huggingface.co/jrubiosainz/microduck-sock-counter-s1s5
- Modelo `lphatnguyen/microduck-sock-heist-6m-v5`: https://huggingface.co/lphatnguyen/microduck-sock-heist-6m-v5
- Modelo `lphatnguyen/microduck-sock-heist-6m-v3`: https://huggingface.co/lphatnguyen/microduck-sock-heist-6m-v3
- Layout del grafo de lookup (commit `94cd2cfe`): https://huggingface.co/a1rb4Ck/microduck-heist/commit/94cd2cfe
- Perfil de Pollen Robotics: https://huggingface.co/pollen-robotics
