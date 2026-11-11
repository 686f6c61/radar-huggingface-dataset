# rumezhak/microduck-tug-titan-tuned-v5

## Resumen

`rumezhak/microduck-tug-titan-tuned-v5` es una entrada para la competición "Tug of War" de la Microduck Arena, un espacio de simulación organizado por Pollen Robotics. No es un modelo de lenguaje ni un modelo generativo: es una red neuronal de control para un robot simulado (MicroDuck) que participa en combates de tira y afloja dentro de un entorno MuJoCo. El autor, rumezhak, lo publica como snapshot intermedio para la copa semanal que cierra el 13 de noviembre.

El modelo es una derivación explícita del trabajo de terceros: la red de confrontación es `azukiq/microduck-titan-v1` (revisión `13b975bb`) y la única aportación propia del autor son 75 pequeños offsets calculados mediante búsquedas CMA-ES, promediados de tres snapshots de sus búsquedas anteriores (`tuned-v3` y `tuned-v4`). Estos offsets se suman a la media del normalizador de observaciones (máximo 0.319 desviaciones estándar por entrada) y al sesgo de la última capa (máximo 0.136). El resto de pesos son de azukiq.

El modelo se distribuye en formato ONNX y se ejecuta con la librería `microduck`. Su relevancia es acotada: sirve como referencia para quienes participan en la Microduck Arena y quieren entender cómo se comportan variantes afinadas por CMA-ES frente a la red base. El propio autor advierte que no es mejor que su entrada anterior `tuned-v4` (84.6 % de media frente a 86.6 %) y que no debe cargarse en un robot físico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de control para robot simulado (grafo ONNX con operadores de inferencia y filas de lookup para rating) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Sin licencia declarada en el repositorio; Apache-2.0 solo en las partes que la portan (`LICENSE-apache-2.0.txt` y `NOTICE`) |
| Formato de pesos | ONNX |
| Libreria | microduck |
| Pipeline | robotics |
| Tamano del repo | 0.0 GB |
| Modelos base | `azukiq/microduck-titan-v1`, `greecree/microduck-tug-of-war-tug-super-v8` |

## Arquitectura y entrenamiento

La arquitectura es un grafo ONNX que combina una red de confrontación (heredera de `titan-v1`) con filas de lookup para el cálculo del rating y tensores auxiliares (`L_mask`, `L_tol`). El layout del grafo sigue el de `greecree/microduck-tug-of-war-tug-super-v8`. La red de confrontación incluye un normalizador de observaciones y un perceptrón multicapa (`mlp.*`) que produce la acción de control.

El "entrenamiento" de este artefacto no es un entrenamiento convencional: el autor ejecutó búsquedas CMA-ES sobre snapshots de sus variantes `tuned-v3` y `tuned-v4`, promedió tres snapshots y aplicó los offsets resultantes sobre los pesos de `titan-v1`. No hay datos de preentrenamiento, RLHF ni DPO. Las filas de rating se obtuvieron replicando los mejores combates registrados de entradas públicas (de `lphatnguyen`, `jrubiosainz` y `greecree`) a través del layout de `super-v8`. El rating fusionado resultante es 166.7017 cm, idéntico al de sus entradas `tug-league-v1` a `-v4`.

## Capacidades

- Control de un robot simulado MicroDuck en la tarea de tira y afloja dentro de la Microduck Arena.
- Inferencia determinista sobre ONNX Runtime con versiones fijadas (MuJoCo 3.10.0, onnxruntime 1.24.4, numpy 2.4.1) en x86-64.
- Replay de secuencias registradas para los cinco seeds oficiales del rating.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües.
- No es un modelo de lenguaje: no genera texto.

## Casos de uso

- Participación en la copa semanal de la Microduck Arena: el modelo se sube como entrada a la competición "Tug of War" y se evalúa automáticamente contra otras redes en el simulador.
- Estudio de afinado por CMA-ES sobre redes de control: sirve como ejemplo reproducible de cómo aplicar offsets pequeños (máximo 0.319 desviaciones estándar) sobre un normalizador y un sesgo final sin reentrenar el resto de la red.
- Comparación de variantes en el simulador: el autor publica una tabla con 60 combates por oponente que permite contrastar `titan-v1`, `tuned-v3`, `tuned-v4` y esta entrada bajo las mismas condiciones.
- Reutilización del layout de grafo de `super-v8`: útil para quienes quieran replicar la estructura ONNX y las filas de lookup del rating en sus propias entradas.
- Análisis de reproducibilidad: el modelo documenta versiones exactas de MuJoCo, onnxruntime y numpy, lo que facilita replicar los combates en x86-64.
- Referencia para entender los límites de las mejoras incrementales: el autor muestra que esta variante queda por debajo de `tuned-v4` en la media (84.6 % frente a 86.6 %), lo que sirve como caso de estudio de rendimientos decrecientes en búsquedas CMA-ES.

## Benchmarks y rendimiento

Resultados medidos por el autor en una copia local del runner de la Arena (Mac), 60 combates por oponente, mismos combates para cada columna con lados intercambiados. La columna de `titan-v1` se midió con 40 combates por oponente (los primeros 40 de los mismos combates).

| Oponente | titan-v1 plano | tuned-v3 | tuned-v4 | esta entrada |
|---|---|---|---|---|
| `quicksilver-cup-v5` (Hlib) | 27.5 %* | 47.5 % | 72.5 % | 55.0 % |
| `titan-v1` (azukiq) | 45.0 %* | 65.0 % | 65.8 % | 73.3 % |
| `tug-of-war-tug-super-v11` (greecree) | 60.0 %* | 61.7 % | 62.5 % | 49.2 % |
| `h7p1b` (jrubiosainz) | 38.8 %* | 65.8 % | 64.2 % | 60.0 % |
| Los otros siete | 97.5 a 100 %* | 97.5 a 100 % | 93 a 100 % | 97.5 a 100 % |
| Media sobre los once | 78.6 %* | 84.7 % | **86.6 %** | 84.6 % |

\* Medido con 40 combates por oponente. El autor advierte que 60 combates por oponente es una muestra pequeña (aproximadamente ±6 puntos por cifra).

Rating fusionado: 166.7017 cm, idéntico a `tug-league-v1` a `-v4`. Las filas de rating no se re-verificaron en x86 para esta versión.

## Requisitos de hardware

- No se especifican requisitos de VRAM ni GPU en la información disponible. El modelo es un grafo ONNX de control para un robot simulado, no un modelo de lenguaje de gran tamaño.
- El tamaño del repositorio es de 0.0 GB, lo que sugiere un artefacto muy pequeño.
- Ejecutable con ONNX Runtime (versión fijada 1.24.4) sobre CPU x86-64.
- Requiere MuJoCo 3.10.0 y numpy 2.4.1 para reproducir los combates de forma determinista.
- No se documentan latencia ni throughput.
- No se contempla despliegue en vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.

## Comparativa con modelos similares

| Modelo | Base | Media sobre 11 oponentes | Rating | Licencia | Formato |
|---|---|---|---|---|---|
| `rumezhak/microduck-tug-titan-tuned-v5` (esta entrada) | titan-v1 + offsets CMA-ES | 84.6 % | 166.7017 cm | Sin declarar (parcial Apache-2.0) | ONNX |
| `rumezhak` `tuned-v4` | titan-v1 + offsets CMA-ES | 86.6 % | 166.7017 cm | Sin declarar | ONNX |
| `azukiq/microduck-titan-v1` | Red base | 78.6 % (40 combates) | no disponible | Sin declarar | ONNX |
| `greecree/microduck-tug-of-war-tug-super-v8` | Layout de grafo | no disponible | no disponible | Sin declarar | ONNX |

## Limitaciones y advertencias

- El propio autor indica que esta entrada no es mejor que su `tuned-v4` (84.6 % frente a 86.6 % de media) y que es un snapshot intermedio, no su entrada final para la copa.
- Solo se ha evaluado en el simulador de la Microduck Arena. El autor advierte explícitamente: "Do not load it on a physical MicroDuck".
- La muestra de evaluación es pequeña: 60 combates por oponente, con un margen aproximado de ±6 puntos.
- Los replays son deterministas solo en x86-64 con las versiones fijadas de MuJoCo 3.10.0, onnxruntime 1.24.4 y numpy 2.4.1; el redondeo de otra CPU podría romperlos.
- Las filas de rating replican secuencias registradas de otros autores; la red decide el resto.
- Licencia: el repositorio no declara licencia global. `azukiq/microduck-titan-v1`, `greecree/microduck-tug-of-war-tug-super-v8` y `lphatnguyen/microduck-tug-of-war-v0` no declaran licencia, por lo que sus partes no se relicencian aquí. `jrubiosainz/microduck-tug-quicksilver-v14-h2-63aab429` tiene fichero `LICENSE` Apache-2.0 pero sin campo `license:`. Apache-2.0 aplica solo a las partes que la portan.
- El autor no pidió permiso a azukiq, greecree, lphatnguyen ni jrubiosainz; si alguno objeta, la entrada se retirará.
- No hay información sobre sesgos, alucinación ni limitaciones idiomáticas porque no es un modelo de lenguaje.
- El autor declara que una IA asistente ayudó con los experimentos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/rumezhak/microduck-tug-titan-tuned-v5
- Modelo base (red de confrontación): https://huggingface.co/azukiq/microduck-titan-v1
- Modelo base (layout de grafo): https://huggingface.co/greecree/microduck-tug-of-war-tug-super-v8
- Entrada de rating seed 1: https://huggingface.co/lphatnguyen/microduck-tug-of-war-v0
- Entrada de rating seeds 2 y 5: https://huggingface.co/jrubiosainz/microduck-tug-quicksilver-v14-h2-63aab429
- Microduck Arena (Pollen Robotics): https://huggingface.co/spaces/pollen-robotics/microduck-arena
- Organización Pollen Robotics: https://huggingface.co/pollen-robotics
