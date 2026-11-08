# rumezhak/microduck-sock-heist-composite-v8

## Resumen

microduck-sock-heist-composite-v8 es una política de control para robótica simulada publicada por el usuario rumezhak en Hugging Face. Se trata de un artefacto de inferencia en formato ONNX, empaquetado con la librería `microduck`, que resuelve la tarea "Sock Heist" de 6 minutos dentro de la Microduck Arena de Pollen Robotics. No es un modelo de lenguaje ni un transformer generativo: es una política de control con tablas de búsqueda (`L_obs` y `L_act`) y una red de respaldo heredada de `lphatnguyen/microduck-sock-heist-6m-v3`.

El modelo es un merge de `rumezhak/microduck-sock-heist-composite-v5` y `jrubiosainz/microduck-sock-heist-6m-wr1n-3f7c858c`, y representa un resultado intermedio de una búsqueda CMA-ES todavía en curso. Su único cambio respecto a composite v5 afecta a las tablas de búsqueda de observaciones y acciones: se reconstruyeron las 1347 filas (frente a 1348 de v5) y se modificó únicamente la secuencia correspondiente al seed 2, mejorando su cruce de 1029.95 a 1029.54 pasos de física. El resto de tensores, el grafo y la red de respaldo permanecen sin cambios.

La relevancia de esta ficha es acotada: el propio autor declara que el modelo es *in-sample*, que solo las cinco trayectorias registradas son rápidas, que no debe cargarse en un robot físico y que la licencia es ambigua (Apache-2.0 solo en las partes que la portan). Es, por tanto, un artefacto de competición, no un componente de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Grafo ONNX con tablas de búsqueda de observación (`L_obs`) y acción (`L_act`) más red de respaldo; no es un transformer |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; control por pasos de física de 5 ms) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Sin campo `license:`; Apache-2.0 solo en las partes que la portan (grafo y mecanismo de lookup de `a1rb4Ck/microduck-heist@94cd2cfe` y modificaciones de los contribuyentes) |
| Formato de pesos | ONNX |
| Libreria | microduck |
| Pipeline | robotics |
| Tamano del repo | 0.0 GB |
| Modelos base | `rumezhak/microduck-sock-heist-composite-v5`, `jrubiosainz/microduck-sock-heist-6m-wr1n-3f7c858c` |
| Relacion con base | merge |
| Entorno de ejecucion | MuJoCo 3.10.0, onnxruntime 1.24.4, numpy 2.4.1 (versiones fijadas por la Arena) |

## Arquitectura y entrenamiento

La arquitectura no es una red neuronal generativa convencional. El artefacto es un grafo ONNX que combina un mecanismo de búsqueda en tablas (`L_obs` para observaciones y `L_act` para acciones) con una red de respaldo tomada de `lphatnguyen/microduck-sock-heist-6m-v3`. Las tablas contienen las trayectorias grabadas para cada uno de los cinco seeds oficiales de la Arena; fuera de esas trayectorias, el modelo recurre a la red de respaldo. El diseño del grafo y el mecanismo de lookup provienen de `a1rb4Ck/microduck-heist@94cd2cfe`.

El "entrenamiento" no es un entrenamiento de pesos en el sentido habitual. El autor aplicó una búsqueda CMA-ES separable sobre las últimas filas de la secuencia del seed 2, partiendo de la secuencia de composite v7 y ejecutándola en x86-64. La búsqueda redujo el cruce del seed 2 de 1029.95 a 1029.54 pasos de física (un paso equivale a 5 ms). Los otros cuatro seeds son idénticos a v7. No se aplicaron RLHF, DPO ni ajuste por preferencias; no hay datos de entrenamiento en tokens ni composición de dataset que reportar.

## Capacidades

- Control de política para la tarea "Sock Heist" de 6 minutos en la Microduck Arena, en simulación.
- Reproducción determinista de cinco trayectorias (seeds 1 a 5) sobre x86-64 con las versiones fijadas de MuJoCo, onnxruntime y numpy.
- Inferencia por pasos de física de 5 ms; el modelo decide acción a cada paso.
- Red de respaldo para observaciones fuera de las trayectorias registradas (heredada de v3).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No soporta visión, audio ni modo "thinking".
- No apto para control de un robot físico.

## Casos de uso

- Reproducción de resultados en la Microduck Arena: cargar el ONNX en el Space oficial con las versiones fijadas de MuJoCo 3.10.0, onnxruntime 1.24.4 y numpy 2.4.1 para verificar los 4.880 s de media en los cinco seeds oficiales.
- Investigación de métodos de búsqueda de políticas: el artefacto sirve como caso de estudio de búsqueda CMA-ES separable aplicada a tablas de lookup en lugar de a pesos de red.
- Benchmarking de robustez de políticas de control: comparar el rendimiento in-sample (4.880 s) frente al out-of-sample (red v3 de respaldo) para cuantificar el sobreajuste a las trayectorias.
- Estudio de linaje de merges: analizar cómo se compone un artefacto a partir de cinco contribuyentes distintos (`jrubiosainz`, `HlibPlakhtii`, `lphatnguyen`, `a1rb4Ck`, `juicenv`) y qué partes conservan licencia.
- Docencia sobre licencias en modelos derivados: el caso ilustra la sección 4(b) de Apache-2.0 (obligación de aviso de modificación) y la ausencia de relicenciamiento de partes sin licencia.
- Pruebas de determinismo entre plataformas: comparar la ejecución en x86-64 frente a Mac para observar cómo el redondeo distinto rompe la reproducibilidad de un lookup.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre los cinco seeds oficiales de la Arena, con el scorer propio de la Arena en x86-64:

| Seed | composite v7 | composite v8 |
|---|---|---|
| 1 | 4.795 | 4.795 |
| 2 | 5.150 (cruce en 1029.95 pasos) | 5.150 (cruce en 1029.54 pasos) |
| 3 | 4.750 | 4.750 |
| 4 | 4.785 | 4.785 |
| 5 | 4.920 | 4.920 |
| Media | 4.880 | 4.880 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ni aplican a este tipo de artefacto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el modelo se ejecuta en CPU con onnxruntime.
- GPU recomendadas: no aplica; el autor ejecuta en x86-64.
- ¿Cabe en consumer GPU? No aplica; el despliegue es en CPU.
- Opciones de despliegue: onnxruntime 1.24.4 con numpy 2.4.1 y MuJoCo 3.10.0 (versiones fijadas por la Arena); librería `microduck` para carga.
- Latencia y throughput: no disponibles como cifras absolutas; la resolución temporal es de 5 ms por paso de física.
- El tamaño del repo es 0.0 GB, lo que sugiere un artefacto muy pequeño en disco.

## Comparativa con modelos similares

| Modelo | Tipo | Media en 5 seeds | Licencia | Estado |
|---|---|---|---|---|
| rumezhak/microduck-sock-heist-composite-v8 | ONNX + lookup | 4.880 s | Sin campo `license:`; Apache-2.0 parcial | Este artefacto |
| rumezhak/microduck-sock-heist-composite-v7 | ONNX + lookup | 4.880 s | No declarada | Referencia directa del autor |
| rumezhak/microduck-sock-heist-composite-v5 | ONNX + lookup | no disponible | No declarada | Modelo base directo |
| jrubiosainz/microduck-sock-heist-6m-wr1n-3f7c858c | Política de control | no disponible | Apache-2.0 (fichero `LICENSE` sin campo `license:`) | Modelo base del merge |
| lphatnguyen/microduck-sock-heist-6m-v3 | Política de control | no disponible | No declarada | Red de respaldo |

## Limitaciones y advertencias

- **In-sample**: fuera de los cinco seeds oficiales, el modelo es la red v3 de `lphatnguyen`; solo las cinco trayectorias registradas son rápidas.
- **Determinismo frágil**: la reproducibilidad depende de x86-64 con MuJoCo 3.10.0, onnxruntime 1.24.4 y numpy 2.4.1. Otra CPU puede romper una trayectoria por redondeo; un Mac da números ligeramente distintos y su lookup puede fallar.
- **Margen mínimo**: 0.54 pasos de física de mejora en el seed 2 (de 1029.95 a 1029.54), sin cambio en la puntuación media. Cualquiera que combine las mejores filas por seed y pula las colas puede igualarlo o superarlo.
- **No apto para robot físico**: las acciones registradas están muy fuera de lo que un servo real admitiría. No cargar en un MicroDuck físico.
- **Licencia ambigua**: el repositorio no está etiquetado como Apache-2.0 en su conjunto. `rumezhak/...-composite-v1` a `-v5`, `lphatnguyen/...-v3` y `-v4` no declaran licencia; `jrubiosainz/...-wr1n-3f7c858c` y `-rz-tail-r4` tienen fichero `LICENSE` Apache-2.0 pero sin campo `license:`; `HlibPlakhtii/...-quicksilver-v2` no reclama nueva licencia sobre contribuciones upstream. Las partes sin licencia no se relicencian aquí.
- **Sin consentimiento previo**: el autor declara no haber consultado a `jrubiosainz`, `HlibPlakhtii`, `lphatnguyen` ni `a1rb4Ck`; se compromete a retirar el modelo si algún autor se opone.
- **Sesgos y alucinación**: no aplica en el sentido de un modelo de lenguaje; el riesgo equivalente es el sobreajuste a las cinco trayectorias y el fallo silencioso del lookup fuera de ellas.
- **Asistencia de IA**: el autor indica que un asistente de IA ayudó en algunos experimentos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rumezhak/microduck-sock-heist-composite-v8
- Modelo base directo (v5): https://huggingface.co/rumezhak/microduck-sock-heist-composite-v5
- Modelo base del merge (WR1N): https://huggingface.co/jrubiosainz/microduck-sock-heist-6m-wr1n-3f7c858c
- Referencia de comparación (v7): https://huggingface.co/rumezhak/microduck-sock-heist-composite-v7
- Resultado intermedio previo (v6): https://huggingface.co/rumezhak/microduck-sock-heist-composite-v6
- Red de respaldo (v3): https://huggingface.co/lphatnguyen/microduck-sock-heist-6m-v3
- Red de respaldo (v4): https://huggingface.co/lphatnguyen/microduck-sock-heist-6m-v4
- Contribuyente de secuencias (quicksilver-v2): https://huggingface.co/HlibPlakhtii/microduck-sock-heist-quicksilver-v2
- Microduck Arena (Space de Pollen Robotics): https://huggingface.co/spaces/pollen-robotics/microduck-arena
- Pollen Robotics en Hugging Face: https://huggingface.co/pollen-robotics
