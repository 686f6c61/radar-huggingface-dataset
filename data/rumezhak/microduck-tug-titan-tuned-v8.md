# rumezhak/microduck-tug-titan-tuned-v8

## Resumen

`rumezhak/microduck-tug-titan-tuned-v8` es una entrada para la competición "Tug of War" de la Microduck Arena, un entorno de simulación de robots MicroDuck organizado por Pollen Robotics. No es un modelo de lenguaje ni un modelo fundacional al uso: es una política de control para un robot bípedo simulado que debe ganar un pulso (tug of war) contra otras políticas. El modelo se distribuye en formato ONNX y se ejecuta mediante la librería `microduck`.

El autor, rumezhak, es explícito sobre la autoría: la red de confrontación es de azukiq (`microduck-titan-v1`), y el único cambio propio consiste en 75 pequeños offsets añadidos a la media del normalizador de observaciones (máximo 0,335 desviaciones típicas por entrada) y al sesgo de la última capa (máximo 0,148). Estos offsets provienen de una búsqueda CMA-ES enfocada (generación 19) promediada con los offsets de su variante `tuned-v4`. Las filas de rating, por su parte, son secuencias grabadas de otros autores reinyectadas en el grafo de greecree.

La relevancia es acotada y muy específica: se trata de una variante intermedia para la copa semanal número 2 de la Arena (cierre el 13 de noviembre), con mejoras medidas dentro del ruido estadístico respecto a variantes previas del mismo autor. No está pensada para uso en robots físicos ni para tareas de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal para control robótico (grafo ONNX); topología derivada de `greecree/microduck-tug-of-war-tug-super-v8` |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | sin licencia declarada a nivel de repositorio; Apache-2.0 solo en las partes que la portan (`LICENSE-apache-2.0.txt` y `NOTICE`) |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

La red de confrontación procede de `azukiq/microduck-titan-v1` (revisión `13b975bb`), con la topología de grafo de `greecree/microduck-tug-of-war-tug-super-v8`. Sobre esa base, el autor añade 75 offsets a la media del normalizador de observaciones y al sesgo de la última capa, obtenidos mediante una búsqueda CMA-ES enfocada en la generación 19, ajustada contra las entradas vigentes de Hlib, greecree, jrubiosainz y azukiq, más cuatro oponentes de guardia. Los offsets finales son el promedio del mejor candidato de esa búsqueda y los de su variante `tuned-v4`.

El resto de pesos son de azukiq. Las filas de rating (los cinco seeds oficiales) son secuencias grabadas de terceros: seed 1 de `lphatnguyen/microduck-tug-of-war-v0`, seeds 2 y 5 de `jrubiosainz/microduck-tug-quicksilver-v14-h2-63aab429`, y seeds 3 y 4 de greecree. Respecto a `tug-league-v4`, solo cambian los pesos del actor (normalizador y `mlp.*`); operadores de grafo, filas de lookup, `L_mask`, `L_tol` y demás tensores permanecen inalterados. No se documenta el volumen de datos de entrenamiento ni el proceso de RLHF/DPO (no aplica en este dominio).

## Capacidades

- Control de un robot bípedo simulado en la tarea de tug of war de la Microduck Arena.
- Toma de decisiones en tiempo real a partir de observaciones del entorno simulado.
- Replay determinista de secuencias grabadas para los cinco seeds oficiales de rating.
- Confrontación contra políticas rivales en el simulador de la Arena.
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de los LLM.
- No tiene capacidades multilingües, de visión ni de audio.
- No dispone de modo "thinking" ni de decodificación especulativa.

## Casos de uso

- Participación en la copa semanal de la Microduck Arena: el modelo se carga en el runner de tug de la Arena para competir contra otras entradas del campo de la copa número 2, aprovechando los offsets ajustados contra los rivales más fuertes.
- Evaluación comparativa de políticas de control: sirve como referencia intermedia para medir la mejora de variantes posteriores sobre `titan-v1` y `tuned-v7` con el mismo conjunto de combates.
- Investigación en optimización de políticas por búsqueda de offsets: el método CMA-ES aplicado sobre un normalizador y un sesgo final es reproducible y sirve de ejemplo para experimentos similares en entornos simulados.
- Reproducción de benchmarks internos: el modelo permite replicar la tabla de enfrentamientos del autor (60 combates por oponente, lados intercambiados) en una copia local del runner de la Arena.
- Estudio de merges de políticas: ilustra cómo combinar pesos de un modelo base con ajustes finos de otro autor, con la trazabilidad documentada en `NOTICE`.
- Docencia sobre entornos de simulación robótica: útil para mostrar el flujo completo de la Microduck Arena (carga ONNX, ejecución con MuJoCo y onnxruntime, evaluación por combates).

## Benchmarks y rendimiento

Resultados medidos por el autor en una copia local del runner de tug de la Arena, 60 combates por oponente (40 para `titan-v1` plano), con lados intercambiados:

| Oponente | titan-v1 plano | tuned-v7 | este modelo |
|---|---|---|---|
| `quicksilver-cup-v5` (Hlib) | 27,5 %* | 52,5 % | 64,2 % |
| `titan-v1` (azukiq) | 45,0 %* | 70,0 % | 65,8 % |
| `tug-of-war-tug-super-v11` (greecree) | 60,0 %* | 62,5 % | 45,0 % |
| `h7p1b` (jrubiosainz) | 38,8 %* | 58,3 % | 58,3 % |
| Otros siete (rango) | 97,5–100 %* | 95–100 % | 97,5 % (RSanchez996), 97,5 % (SSH111111), 100,0 % (AndoShy), otros 98–100 % |
| Media sobre los once | 78,6 %* | 84,6 % | 84,4 % |

\* `titan-v1` plano medido sobre 40 combates por oponente (los primeros 40 de los mismos combates). El autor advierte que 60 combates por oponente es una muestra pequeña (aproximadamente ±6 puntos por cifra) y que diferencias de dos puntos o menos deben tratarse como ruido. El rating combinado es de 166,7017 cm, idéntico al de las entradas `tug-league-v1` a `-v4`.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el repositorio ocupa 0,0 GB, lo que sugiere un modelo muy pequeño).
- GPU recomendadas: no disponible; la inferencia se ejecuta con onnxruntime sobre CPU.
- Compatibilidad con GPU de consumo: no documentada; el autor ejecuta las pruebas en CPU (x86-64 y Mac).
- Opciones de despliegue: onnxruntime 1.24.4 con MuJoCo 3.10.0 y numpy 2.4.1, versiones fijadas por la Arena.
- Latencia y throughput: no disponibles.
- Nota de reproducibilidad: los replays son deterministas en x86-64 con las versiones fijadas; el redondeo de otra CPU podría romper alguno.

## Comparativa con modelos similares

| Modelo | Autor | Relación | Licencia | Notas |
|---|---|---|---|---|
| `microduck-titan-v1` | azukiq | Red base de la confrontación | sin licencia declarada | Referencia contra la que se mide este modelo |
| `microduck-tug-of-war-tug-super-v8` | greecree | Topología de grafo reutilizada | sin licencia declarada | Aporta el layout del grafo y los seeds 3 y 4 |
| `microduck-tug-of-war-v0` | lphatnguyen | Fuente del seed 1 | sin licencia declarada | Solo aporta la secuencia grabada del seed 1 |
| `microduck-tug-quicksilver-v14-h2-63aab429` | jrubiosainz | Fuente de los seeds 2 y 5 | Apache-2.0 (archivo `LICENSE`, sin campo `license:`) | Solo aporta secuencias grabadas |

No se dispone de datos de parámetros, contexto ni benchmarks comparables en la información proporcionada para el resto de entradas de la Arena.

## Limitaciones y advertencias

- **No usar en un robot físico**: el autor lo indica explícitamente; el modelo solo se ha evaluado en el simulador de la Arena.
- **Autoría parcial**: la red de confrontación es de azukiq y las filas de rating de terceros; el autor no pidió permiso a azukiq, greecree, lphatnguyen ni jrubiosainz. Si alguno objeta, la entrada se retirará.
- **Licencia ambigua**: el repositorio no declara licencia global; Apache-2.0 se aplica solo a las partes que la portan. Las partes de azukiq, greecree y lphatnguyen no tienen licencia declarada, lo que limita el uso comercial sin aclaración previa.
- **Muestra estadística pequeña**: 60 combates por oponente implican ±6 puntos; diferencias de dos puntos o menos son ruido. Las mejoras frente a `tuned-v7` no son concluyentes (media 84,4 % frente a 84,6 %).
- **Dependencia de versiones**: los replays son deterministas solo con MuJoCo 3.10.0, onnxruntime 1.24.4 y numpy 2.4.1 en x86-64; otras CPUs pueden romper la reproducibilidad.
- **Sin capacidades de lenguaje**: no es un modelo de texto, por lo que no aplican sesgos lingüísticos ni de alucinación en el sentido habitual; el riesgo se limita al sobreajuste a los oponentes concretos contra los que se ajustaron los offsets.
- **Sobreajuste a rivales**: los offsets se optimizaron contra las entradas vigentes de cuatro autores más cuatro oponentes de guardia, lo que puede degradar el rendimiento frente a políticas no vistas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rumezhak/microduck-tug-titan-tuned-v8
- Modelo base (red de confrontación): https://huggingface.co/azukiq/microduck-titan-v1
- Modelo base (layout del grafo): https://huggingface.co/greecree/microduck-tug-of-war-tug-super-v8
- Fuente del seed 1: https://huggingface.co/lphatnguyen/microduck-tug-of-war-v0
- Fuente de los seeds 2 y 5: https://huggingface.co/jrubiosainz/microduck-tug-quicksilver-v14-h2-63aab429
- Microduck Arena (Pollen Robotics): https://huggingface.co/spaces/pollen-robotics/microduck-arena
- Organización Pollen Robotics: https://huggingface.co/pollen-robotics
