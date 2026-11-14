# rumezhak/microduck-roller-composite-v1

## Resumen

`rumezhak/microduck-roller-composite-v1` es una entrada para la prueba de 2 metros del *Roller Sprint* dentro de la Microduck Arena, un espacio de competición de robótica simulada organizado por Pollen Robotics. No se trata de un modelo de lenguaje, sino de un artefacto de control para un robot simulado MicroDuck: combina una red neuronal de respaldo (fallback) con un mecanismo de búsqueda en tablas (*lookup*) que reproduce cinco trayectorias pregrabadas. El autor, rumezhak, parte del modelo `a1rb4Ck/microduck-roller-2m` y de las trayectorias de `HlibPlakhtii/microduck-roller-quicksilver-v2`.

La contribución concreta es una búsqueda de refinamiento (CMA-ES separable y muestreo de ramas por perturbación de un ulp en float32) sobre las últimas filas de acción de cada semilla, ejecutada en x86-64 con el runner oficial de la Arena. El resultado es un tiempo medio de 0,885 s en las cinco semillas oficiales (5/5 finalizadas), frente a los 0,886 s de quicksilver-v2 y los 0,887 s de otras entradas competidoras.

Es relevante únicamente en el contexto de la Microduck Arena: el modelo es *in-sample* (solo es rápido en las cinco semillas oficiales), está pensado exclusivamente para simulación y el propio autor advierte que no debe cargarse en un robot físico. No hay información sobre arquitectura de red más allá de que reutiliza el grafo y la red de respaldo de su modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Grafo ONNX con red neuronal de respaldo y tablas de búsqueda (`L_obs`, `L_act`); layout heredado de `a1rb4Ck/microduck-roller-2m` |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en ONNX; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Mixta: Apache-2.0 solo para el layout del grafo, el mecanismo de lookup de `a1rb4Ck/microduck-roller-2m@b98dc525` y las modificaciones propias; el repositorio en su conjunto no está etiquetado como Apache-2.0. Las trayectorias de `HlibPlakhtii/microduck-roller-quicksilver-v2` no se relicencian |
| Formato de pesos | ONNX |
| Libreria | `microduck` |
| Pipeline | robotics |
| Tamano del repo | 0.0 GB (reportado por Hugging Face) |
| Modelos base | `a1rb4Ck/microduck-roller-2m`, `HlibPlakhtii/microduck-roller-quicksilver-v2` (relación: merge) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El artefacto no entrena una red desde cero: reutiliza el grafo ONNX, la red de respaldo y el mecanismo de búsqueda en tablas de `a1rb4Ck/microduck-roller-2m`. Lo único que cambia respecto al fichero base son las tablas `L_obs` y `L_act` (347 filas reconstruidas) y la adición de metadatos `modification_notice`, conforme a la sección 4(b) de Apache-2.0. Las cinco trayectorias reproducidas se grabaron originalmente con `HlibPlakhtii/microduck-roller-quicksilver-v2`, un finetune de `jrubiosainz/microduck-game-roller-remix12`.

El método de optimización: para las semillas 1, 2, 4 y 5 se aplicó CMA-ES separable sobre las últimas 6 a 24 filas de acción de cada semilla, partiendo de la secuencia grabada por Hlib, con cada candidato reproducido en el runner de la Arena sobre x86-64. La semilla 3 requería cruzar un límite de tick: se muestrearon ramas mediante una perturbación de un ulp en float32 sobre filas tempranas (lo que cambia la historia de contactos), se repulieron las últimas 26 filas con CMA-ES corto y se hizo un pulido profundo de los 28 mejores candidatos (12.000 evaluaciones cada uno), obteniendo 175,9978 pasos físicos (0,0022 por debajo del límite). La física se ejecuta con MuJoCo 3.10.0, onnxruntime 1.24.4 y numpy 2.4.1 fijados por la Arena, con ticks de 5 ms.

## Capacidades

- Control de un robot simulado MicroDuck en la prueba de 2 metros del Roller Sprint de la Microduck Arena.
- Reproducción determinista de cinco trayectorias pregrabadas (semillas oficiales 1 a 5) mediante búsqueda en tablas.
- Red de respaldo (fallback) para comandos o estados fuera de las cinco trayectorias registradas, heredada del modelo base.
- Puntuación independiente del comando: las claves de búsqueda no incluyen el comando; la Arena puntúa a 0,30 m/s.
- No soporta tool calling, agentes, razonamiento multi-paso, multilingüismo ni modalidades de texto, visión o audio.

## Casos de uso

- Competición en la Microduck Arena: presentar una entrada en la prueba de 2 metros del Roller Sprint y comparar el tiempo medio (0,885 s) con otras entradas del ranking.
- Reproducción de resultados: validar los tiempos de las cinco semillas oficiales en un entorno x86-64 con las versiones fijadas de MuJoCo, onnxruntime y numpy.
- Estudio de sensibilidad numérica: analizar cómo una perturbación de un ulp en float32 sobre una fila de acción temprana cambia la rama de historia de contactos y el tiempo de cruce en pasos físicos.
- Referencia metodológica: usar el pipeline de CMA-ES separable más muestreo de ramas y pulido profundo como plantilla para optimizar trayectorias en simuladores con física de contacto.
- Análisis de robustez entre plataformas: comparar los tiempos en x86-64 frente a los de una Mac, donde el redondeo difiere y la búsqueda en tablas puede fallar.
- Docencia o divulgación sobre optimización en simulación: ilustrar el impacto de límites de tick (5 ms) y de mínimos locales en la búsqueda de políticas.

## Benchmarks y rendimiento

Resultados reportados por el autor con el scorer oficial de la Arena en su máquina x86-64, sobre las cinco semillas oficiales (5/5 finalizadas):

| Semilla | `quicksilver-v2` (s) | Este modelo (s) |
|---|---|---|
| 1 | 0,890 | 0,890 |
| 2 | 0,880 | 0,880 |
| 3 | 0,885 | **0,880** |
| 4 | 0,895 | 0,895 |
| 5 | 0,880 | 0,880 |
| Media | 0,886 | **0,885** |

Tiempos de cruce en pasos físicos (5 ms por paso; la puntuación cuenta el paso que cruza):

| Semilla | `quicksilver-v2` (pasos) | Este modelo (pasos) |
|---|---|---|
| 1 | 177,9997 | 177,388 |
| 2 | 175,650 | 175,179 |
| 3 | 176,9986 | **175,998** |
| 4 | 178,989 | 178,069 |
| 5 | 175,982 | 175,697 |

Comparación con otras entradas citadas por el autor: 0,887 s para `jrubiosainz/game-roller-remix12` y 0,887 s para `GinDuck/gin-remix-roller`. No se han publicado resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware

- Inferencia sobre CPU x86-64; el autor no documenta requisitos de GPU ni de VRAM. El tamaño del repositorio reportado es 0,0 GB, lo que sugiere un artefacto muy ligero.
- Entorno de referencia fijado por la Arena: MuJoCo 3.10.0, onnxruntime 1.24.4 y numpy 2.4.1.
- Determinismo dependiente de la plataforma: en x86-64 las reproducciones son deterministas; en una Mac los números difieren ligeramente y la búsqueda en tablas puede fallar.
- Despliegue mediante la librería `microduck` y el runner de la Microduck Arena; no se documentan opciones como vLLM, llama.cpp, Ollama o TGI (no aplicables).
- Latencia y throughput: no disponibles más allá del tiempo de cruce por semilla (0,880 a 0,895 s) y el tick de simulación de 5 ms.

## Comparativa con modelos similares

| Modelo | Tipo | Tiempo medio (5 semillas) | Licencia | Disponibilidad |
|---|---|---|---|---|
| `rumezhak/microduck-roller-composite-v1` | ONNX + lookup, simulación | 0,885 s | Mixta (Apache-2.0 parcial) | Hugging Face |
| `HlibPlakhtii/microduck-roller-quicksilver-v2` | ONNX + lookup, simulación | 0,886 s | Sin licencia declarada | Hugging Face |
| `jrubiosainz/microduck-game-roller-remix12` | ONNX + lookup, simulación | 0,887 s (según el autor) | no disponible | Hugging Face |
| `GinDuck/gin-remix-roller` | Entrada de la Arena | 0,887 s (según el autor) | no disponible | Hugging Face |

Las diferencias de rendimiento entre las entradas son de 1 a 2 ms, dentro del margen de una sola décima de paso físico; el autor señala que cualquiera que pula las colas de las trayectorias puede igualar o superar el resultado.

## Limitaciones y advertencias

- **In-sample**: fuera de las cinco semillas oficiales, el fichero se comporta como la red de respaldo de su modelo base; solo las cinco trayectorias grabadas son rápidas.
- **Solo simulación**: las acciones registradas están muy fuera de lo que se pediría a servomotores reales; no debe cargarse en un MicroDuck físico.
- **Determinismo frágil**: depende de x86-64 con MuJoCo 3.10.0, onnxruntime 1.24.4 y numpy 2.4.1; otro redondeo de CPU podría romper una reproducción, y en Mac los números difieren y el lookup puede fallar.
- **Margen mínimo**: la ventaja de 1 ms es despreciable y la semilla 3 queda 0,0022 pasos por debajo de su límite de tick, por lo que es fácilmente igualable o superable.
- **Licencia ambigua**: el repositorio no está etiquetado como Apache-2.0 en su conjunto; las trayectorias de `HlibPlakhtii/microduck-roller-quicksilver-v2` no se relicencian y el autor no pidió permiso a los autores upstream. Si algún autor objeta, la entrada se retirará.
- **Sin datos de sesgo o alucinación**: no aplica como modelo de lenguaje, pero tampoco hay evaluación de robustez fuera de las cinco semillas.
- **Sin idiomas ni contexto**: no es un modelo de texto; las filas de idiomas y contexto no tienen sentido en esta ficha.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rumezhak/microduck-roller-composite-v1
- Microduck Arena (Space de Pollen Robotics): https://huggingface.co/spaces/pollen-robotics/microduck-arena
- Modelo base principal: https://huggingface.co/a1rb4Ck/microduck-roller-2m
- Trayectorias de origen: https://huggingface.co/HlibPlakhtii/microduck-roller-quicksilver-v2
- Finetune upstream de las trayectorias: https://huggingface.co/jrubiosainz/microduck-game-roller-remix12
- Autor de referencia: https://huggingface.co/HlibPlakhtii
- Autor de referencia: https://huggingface.co/jrubiosainz
- Autor de referencia: https://huggingface.co/a1rb4Ck
- Organización Pollen Robotics: https://huggingface.co/pollen-robotics
