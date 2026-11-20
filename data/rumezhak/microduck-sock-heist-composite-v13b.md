# rumezhak/microduck-sock-heist-composite-v13b

## Resumen

`microduck-sock-heist-composite-v13b` es una política de control para robótica publicada por el usuario rumezhak en Hugging Face, concebida como entrada para el reto "6 m Sock Heist" de la Microduck Arena de Pollen Robotics. No es un modelo de lenguaje ni un modelo generativo de propósito general: es un artefacto de inferencia en formato ONNX que, dado un estado de observación del simulador, devuelve una acción motora precalculada mediante tablas de búsqueda (*lookup tables*). El repositorio ocupa 0,0 GB y declara la librería `microduck` con pipeline `robotics`.

Se trata de una variante de la entrada previa `microduck-sock-heist-composite-v13` (4,760 s de media en los cinco *seeds* oficiales). La única diferencia respecto a v13 es que la trayectoria del *seed* 3 se toma de la versión v12 (931 ticks) en lugar de la de v13, lo que añade 5 ms y eleva la media a 4,761 s. El autor lo publica explícitamente como un punto de datos verificado y no como una mejora, y advierte de que todas las trayectorias ya eran públicas en entradas anteriores.

La relevancia es acotada y muy específica: sirve como referencia reproducible para quienes compiten en la Microduck Arena o estudian técnicas de *lookup* sobre trayectorias registradas en entornos MuJoCo. No es un modelo entrenado con gradientes ni con datos masivos, sino un composite de trayectorias con una red de respaldo (*fallback network*) heredada de lphatnguyen. No debe cargarse en un robot físico.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Grafo ONNX con tablas de búsqueda (`L_obs`, `L_act`) de 1317 filas y red de respaldo heredada de `lphatnguyen/microduck-sock-heist-6m-v3` |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; opera por tick de simulación) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | No declarada como conjunto; Apache-2.0 solo para las partes que la portan (layout del grafo y mecanismo de *observation-lookup* de `a1rb4Ck/microduck-heist@94cd2cfe`) |
| Formato de pesos | ONNX |
| Librería | `microduck` |
| Pipeline | `robotics` |
| Tamaño del repositorio | 0,0 GB |
| Modelo base | `rumezhak/microduck-sock-heist-composite-v13` (finetune) |
| Entorno de evaluación | MuJoCo 3.10.0, onnxruntime 1.24.4, numpy 2.4.1 (x86-64) |
| Resultado en Arena | 4,761 s de media en 5 *seeds* (5/5 finalizados) |

## Arquitectura y entrenamiento

El modelo no se entrena mediante descenso de gradiente. Es un *composite* construido a partir de trayectorias registradas en el simulador de la Microduck Arena: para cada *seed* oficial se selecciona una trayectoria previamente publicada por otros autores (HlibPlakhtii, lphatnguyen, jrubiosainz) y se inserta en un grafo ONNX que implementa un mecanismo de búsqueda sobre observaciones. El grafo contiene dos tablas (`L_obs` y `L_act`) de 1317 filas que mapean observaciones a acciones; si la observación no coincide con ninguna entrada, se recurre a la red de respaldo de lphatnguyen v3.

Respecto a `composite-v13`, esta variante `v13b` solo modifica `L_obs` y `L_act` (las 1317 filas se reconstruyen) y el metadato `modification_notice`, que conserva el texto de v13 y añade el propio. El grafo, la red de respaldo y el resto de tensores son idénticos. El cambio funcional es mínimo: el *seed* 3 pasa de 4,650 s a 4,655 s (931 ticks, un tick más lento). No hay datos de entrenamiento en el sentido habitual, ni RLHF, ni DPO, ni decodificación especulativa.

## Capacidades

- Generación de acciones motoras en el simulador MuJoCo de la Microduck Arena para la tarea "6 m Sock Heist".
- Reproducción determinista de cinco trayectorias oficiales (seeds 1 a 5) en x86-64 con las versiones fijadas de MuJoCo, onnxruntime y numpy.
- Inferencia por *lookup* de observación a acción con red de respaldo para observaciones no vistas.
- Evaluación con el marcador propio de la Arena a 0,20 m/s.
- No soporta *tool calling*, ni razonamiento multi-paso, ni capacidades multilingües, ni visión, ni audio.
- No es un modelo de propósito general: su alcance se limita a la tarea y al entorno de simulación indicados.

## Casos de uso

- Reproducción de resultados en la Microduck Arena: sirve para verificar de forma determinista el tiempo de 4,761 s en los cinco *seeds* oficiales con el stack x86-64 indicado, útil para auditar entradas de la competición.
- Estudio de técnicas de *lookup* sobre trayectorias: el par de tablas `L_obs`/`L_act` de 1317 filas es un ejemplo concreto de cómo mapear observaciones registradas a acciones sin reentrenar una política.
- Línea base para comparativas de *composites*: al diferir de v13 solo en el *seed* 3, permite aislar el efecto de sustituir una trayectoria por otra en una misma arquitectura.
- Docencia sobre evaluación en simulación: ilustra las dependencias críticas de versiones (MuJoCo 3.10.0, onnxruntime 1.24.4, numpy 2.4.1) y el impacto del redondeo de CPU en la reproducibilidad.
- Análisis de linaje de modelos: el `NOTICE` y el `modification_notice` documentan la cadena de autoría y modificaciones, útil para estudiar procedencia en modelos derivados.
- Referencia negativa de generalización: el propio autor advierte que fuera de los cinco *seeds* oficiales el archivo se comporta como la red de respaldo, lo que lo convierte en un caso de estudio sobre sobreajuste a trayectorias registradas.

## Benchmarks y rendimiento

| Seed | composite v13 (s) | este archivo (s) |
|---|---|---|
| 1 | 4,615 | 4,615 |
| 2 | 5,070 | 5,070 |
| 3 | 4,650 | 4,655 |
| 4 | 4,675 | 4,675 |
| 5 | 4,790 | 4,790 |
| Media | 4,760 | 4,761 |

Marcador de la Arena a 0,20 m/s; 5/5 *seeds* finalizados. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, y no aplican a este tipo de artefacto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0,0 GB y el grafo ONNX es de tamaño reducido.
- GPU recomendadas: no disponible; la evaluación reportada se realizó en CPU x86-64 con onnxruntime 1.24.4.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: onnxruntime 1.24.4 con numpy 2.4.1 sobre x86-64, junto con MuJoCo 3.10.0 para la simulación. No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican.
- Latencia y throughput: no disponibles; el resultado reportado es de tiempo de tarea en simulación (4,761 s de media), no de latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Tipo | Resultado en Arena | Licencia | Disponibilidad |
|---|---|---|---|---|
| `rumezhak/microduck-sock-heist-composite-v13b` | Composite ONNX (lookup + fallback) | 4,761 s media (5 seeds) | No declarada como conjunto; Apache-2.0 parcial | Hugging Face |
| `rumezhak/microduck-sock-heist-composite-v13` | Composite ONNX (lookup + fallback) | 4,760 s media (5 seeds) | No declarada como conjunto; Apache-2.0 parcial | Hugging Face |
| `lphatnguyen/microduck-sock-heist-6m-v5` | Política base (trayectorias de origen) | no disponible | No declarada | Hugging Face |
| `HlibPlakhtii/microduck-sock-heist-nov18-v5` | Política base (trayectoria seed 5) | no disponible | No declarada | Hugging Face |

## Limitaciones y advertencias

- **Sobreajuste a los *seeds* oficiales**: fuera de los cinco *seeds*, el archivo se comporta como la red de respaldo de lphatnguyen v3; solo las cinco trayectorias registradas son rápidas.
- **Reproducibilidad frágil**: los *replays* son deterministas solo en x86-64 con MuJoCo 3.10.0, onnxruntime 1.24.4 y numpy 2.4.1; otro redondeo de CPU puede romperlos. En Mac los números difieren y el *lookup* puede fallar.
- **No apto para robot físico**: las acciones registradas están muy fuera de lo que se pediría a servomotores reales; el autor prohíbe explícitamente cargarlo en un MicroDuck físico.
- **Licencia ambigua**: el repositorio no está etiquetado como Apache-2.0 en su conjunto; varias fuentes (`HlibPlakhtii`, `jrubiosainz`, `lphatnguyen`) no declaran licencia y sus partes no se relicencian aquí. Apache-2.0 aplica solo al layout del grafo y al mecanismo de *observation-lookup* de `a1rb4Ck`.
- **Consentimiento de autores**: el autor no consultó a HlibPlakhtii, jrubiosainz, GinDuck, lphatnguyen ni a1rb4Ck antes de publicar; se compromete a retirar la entrada si algún autor se opone.
- **Sin benchmarks generales**: no hay métricas de razonamiento, código o matemáticas porque el artefacto no es un modelo lingüístico.
- **Sesgos**: no se documentan sesgos en el sentido de modelos de lenguaje; el riesgo principal es el sesgo de selección hacia las cinco trayectorias oficiales.
- **Uso comercial**: no disponible; la licencia no está declarada de forma unívoca para el conjunto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/rumezhak/microduck-sock-heist-composite-v13b
- Modelo base: https://huggingface.co/rumezhak/microduck-sock-heist-composite-v13
- Microduck Arena (Space de Pollen Robotics): https://huggingface.co/spaces/pollen-robotics/microduck-arena
- `HlibPlakhtii/microduck-sock-heist-nov18-v5`: https://huggingface.co/HlibPlakhtii/microduck-sock-heist-nov18-v5
- `lphatnguyen/microduck-sock-heist-6m-v5`: https://huggingface.co/lphatnguyen/microduck-sock-heist-6m-v5
- `lphatnguyen/microduck-sock-heist-6m-v3`: https://huggingface.co/lphatnguyen/microduck-sock-heist-6m-v3
- `jrubiosainz/microduck-sock-counter-s1s5`: https://huggingface.co/jrubiosainz/microduck-sock-counter-s1s5
- `a1rb4Ck/microduck-heist` (commit 94cd2cfe): https://huggingface.co/a1rb4Ck/microduck-heist
- Pollen Robotics: https://huggingface.co/pollen-robotics
