# rumezhak/microduck-tug-titan-tuned-v2

## Resumen

`rumezhak/microduck-tug-titan-tuned-v2` es una política de control para el simulador de robótica Microduck Arena, presentada como entrada en la competición "Tug of War" (tira y afloja) del espacio `pollen-robotics/microduck-arena`. No es un modelo de lenguaje ni un modelo fundacional generativo: es una red neuronal de control (política) exportada a ONNX que decide las acciones de un robot simulado MicroDuck en un entorno de MuJoCo. El autor del repositorio es `rumezhak`, y la mayor parte de los pesos procede de terceros.

El modelo es un *merge* derivado: la red de confrontación es `azukiq/microduck-titan-v1` (revisión `13b975bb`) con 75 pequeños desplazamientos añadidos por el autor, obtenidos mediante una búsqueda CMA-ES (continuación de la búsqueda de su `tug-titan-tuned-v1`). Los offsets se suman a la media del normalizador de observaciones (hasta 0,272 desviaciones estándar por entrada) y al sesgo de la última capa (hasta 0,110). El resto de pesos pertenece a azukiq. Las filas de *rating* provienen de secuencias grabadas de otros autores (lphatnguyen, jrubiosainz y greecree) reproducidas sobre el grafo de `greecree/microduck-tug-of-war-tug-super-v8`.

Su relevancia es acotada y experimental: es un resultado intermedio para la copa semanal de la arena (cierre el 13 de noviembre), con una mejora medida pequeña y ruidosa (85,9 % de victorias de media frente a 82,9 % de titan-v1 sin ajustar, con 40 combates por oponente). El repositorio tiene 0 descargas y 0 *likes* en el momento de la consulta, tamaño 0.0 GB y licencia no declarada a nivel de repositorio. Está explícitamente marcado como **solo simulación** y no apto para un robot físico.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red neuronal de política (MLP con normalizador de observaciones y capas `mlp.*`), exportada como grafo ONNX; diseño de grafo heredado de `greecree/microduck-tug-of-war-tug-super-v8` |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantización | no disponible (formato ONNX; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no declarada a nivel de repositorio; Apache-2.0 solo en las partes que la portan (`LICENSE-apache-2.0.txt` y `NOTICE`) |
| Formato de pesos | ONNX (librería `microduck`; metadatos `modification_notice`) |

## Arquitectura y entrenamiento

La política es una red de control por refuerzo/optimización evolutiva, no un transformer. La topología concreta del grafo procede de `greecree/microduck-tug-of-war-tug-super-v8`, e incluye tensores de normalización de observaciones, capas `mlp.*`, filas de *lookup* para los cinco *seeds* oficiales de rating, y las máscaras `L_mask` y `L_tol`. El autor no documenta el número de parámetros ni la dimensión de las capas.

El "entrenamiento" de esta variante consiste en una búsqueda CMA-ES sobre 75 offsets que se aplican a la media del normalizador (máximo 0,272 desviaciones estándar por entrada) y al sesgo de la capa final (máximo 0,110). No hay entrenamiento desde cero ni ajuste fino supervisado: todos los demás pesos son de `azukiq/microduck-titan-v1`. Las filas de rating no se reentrenan; se rellenan reproduciendo combates grabados de las entradas públicas mejor clasificadas para cada uno de los cinco *seeds*. Respecto a `tug-league-v4` del mismo autor, solo cambian los pesos del actor (normalizador y `mlp.*`); operadores de grafo, filas de *lookup*, `L_mask`, `L_tol` y el resto de tensores quedan intactos.

## Capacidades

- Control de política para el entorno de tira y afloja del simulador Microduck Arena (MuJoCo 3.10.0).
- Toma de decisiones por red neuronal a partir de observaciones normalizadas del entorno simulado.
- Reproducción determinista de secuencias grabadas para los cinco *seeds* oficiales de rating (en x86-64 con las versiones fijadas de MuJoCo, onnxruntime y numpy).
- No soporta *tool calling*, *function calling*, agentes, razonamiento multi-paso, visión, audio ni generación de texto: no es un modelo de lenguaje.
- No soporta multilingüismo: no procesa lenguaje natural.
- Capacidad especial: ninguno de los tensores de control está pensado para transferirse a hardware físico.

## Casos de uso

- Competición en Microduck Arena: el modelo se carga como entrada en el espacio `pollen-robotics/microduck-arena` para participar en la copa semanal de "Tug of War" y medir su porcentaje de victorias frente a otras políticas.
- Evaluación comparativa de políticas de control: sirve como referencia derivada de titan-v1 con offsets, útil para cuantificar el efecto de pequeños ajustes CMA-ES sobre el normalizador y el sesgo final.
- Reproducción de experimentos de *merging* de políticas: el repositorio documenta la metodología de fusión (offsets, grafos heredados, filas de *lookup*) y permite replicar el proceso con MuJoCo 3.10.0, onnxruntime 1.24.4 y numpy 2.4.1.
- Estudio de robustez de políticas en simulación: los combates con lados intercambiados y 40 repeticiones por oponente permiten analizar la varianza de la política frente a rivales concretos (quicksilver-cup-v5, titan-v1, tug-super-v11, etc.).
- Docencia e investigación en robótica simulada: ejemplo de pipeline completo de exportación ONNX, carga en `robotctl policy load SLOT ...` (según la documentación del modelo hermano `tuned-v1`) y evaluación en un simulador con versiones fijadas.
- Análisis de licencias y atribución en modelos derivados: el repositorio incluye `NOTICE`, `LICENSE-apache-2.0.txt` y `modification_notice`, lo que lo convierte en un caso práctico para estudiar obligaciones de atribución de la sección 4(b) de Apache-2.0 en *merges* de pesos.

## Benchmarks y rendimiento

Resultados declarados por el autor en una copia Mac del *runner* de la arena, 40 combates por oponente con los mismos combates para cada fila y lados intercambiados:

| Oponente | titan-v1 sin ajustar (`tug-titan-derived`) | `tug-titan-tuned-v1` | esta entrada (`tuned-v2`) |
|---|---|---|---|
| Hlib `quicksilver-cup-v5` | 50,0 % | 32,5 % | 60,0 % |
| azukiq `titan-v1` | 50,0 % | 65,0 % | 62,5 % |
| greecree `tug-of-war-tug-super-v11` | 42,5 % | 52,5 % | 46,2 % |
| Otros siete oponentes | 90 a 100 % | 90 a 100 % | 94 a 100 % |
| Media sobre los diez | 82,9 % | 83,1 % | 85,9 % |

El propio autor advierte que 40 combates por oponente es una muestra pequeña (aproximadamente ±8 puntos por cifra) y que las filas de rating no se revalidaron en x86 para esta versión. El rating fusionado es 166,7017 cm, idéntico al de `tug-league-v1` a `-v4`, por lo que esta entrada no aporta nada a la tabla de clasificación.

## Requisitos de hardware

- Al ser un grafo ONNX de política de control, la inferencia es muy ligera; no se publican cifras de VRAM ni de parámetros.
- No requiere GPU: se ejecuta en CPU x86-64 con MuJoCo 3.10.0, onnxruntime 1.24.4 y numpy 2.4.1 (versiones fijadas por la arena para garantizar reproducibilidad).
- El autor reporta pruebas en una copia Mac del *runner*, además de mediciones previas en x86; no se documentan latencias ni *throughput*.
- Despliegue previsto: carga en el simulador de la Microduck Arena mediante `robotctl policy load SLOT <repositorio>` (documentado en el modelo hermano `tuned-v1`); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- No debe cargarse en un MicroDuck físico.

## Comparativa con modelos similares

| Modelo | Base | Tipo | Licencia | Disponibilidad | Rendimiento declarado |
|---|---|---|---|---|---|
| `rumezhak/microduck-tug-titan-tuned-v2` (este) | titan-v1 + offsets CMA-ES | Política ONNX para Tug of War | No declarada a nivel de repo; Apache-2.0 parcial | Hugging Face, 0 descargas | 85,9 % de media en 10 oponentes (40 combates c/u) |
| `rumezhak/microduck-tug-titan-tuned-v1` | titan-v1 + offsets CMA-ES | Política ONNX para Tug of War | No declarada | Hugging Face | 83,1 % de media en la misma prueba |
| `azukiq/microduck-titan-v1` | Original | Red de confrontación (política) | No declarada | Hugging Face | 82,9 % de media en la misma prueba |
| `greecree/microduck-tug-of-war-tug-super-v8` | Original | Política con grafo reutilizado | No declarada | Hugging Face | No disponible como media agregada; 46,2 % frente a super-v11 en esta prueba |

No se dispone de datos de benchmarks estandarizados (MMLU, HumanEval, GSM8K) porque el modelo no es un modelo de lenguaje.

## Limitaciones y advertencias

- Solo simulación: el autor indica explícitamente "Not for a real robot"; no debe cargarse en un MicroDuck físico.
- Mejora pequeña y ruidosa: ±8 puntos por cifra con 40 combates; el propio autor pide leerlo como "probablemente algo mejor que titan-v1 sin ajustar", no como prueba.
- Las filas de rating reproducen secuencias grabadas de otros autores para los cinco *seeds* oficiales; no son fruto de un entrenamiento propio.
- Reproducibilidad frágil: los *replays* son deterministas solo en x86-64 con MuJoCo 3.10.0, onnxruntime 1.24.4 y numpy 2.4.1; el redondeo de otra CPU puede romperlos.
- Licencia ambigua: el repositorio no está etiquetado como Apache-2.0 en su conjunto; los modelos base (titan-v1, super-v8, tug-of-war-v0) no declaran licencia y sus partes no se relicencian aquí. `jrubiosainz/...quicksilver-v14-h2` tiene fichero Apache-2.0 pero sin campo `license:`.
- Riesgo de retirada: el autor no consultó a azukiq, greecree, lphatnguyen ni jrubiosainz; si alguno objeta, la entrada se retira.
- Sin idiomas, sin contexto, sin alucinación en el sentido de modelos de lenguaje: las limitaciones propias de un LLM no aplican, pero tampoco ofrece ninguna de sus capacidades.
- El modelo fue asistido por una IA en los experimentos, según declara el autor.

## Enlaces

- [Hugging Face: rumezhak/microduck-tug-titan-tuned-v2](https://huggingface.co/rumezhak/microduck-tug-titan-tuned-v2)
- [Hugging Face: rumezhak/microduck-tug-titan-tuned-v1](https://huggingface.co/rumezhak/microduck-tug-titan-tuned-v1)
- [Hugging Face: azukiq/microduck-titan-v1](https://huggingface.co/azukiq/microduck-titan-v1)
- [Hugging Face: greecree/microduck-tug-of-war-tug-super-v8](https://huggingface.co/greecree/microduck-tug-of-war-tug-super-v8)
- [Hugging Face: lphatnguyen/microduck-tug-of-war-v0](https://huggingface.co/lphatnguyen/microduck-tug-of-war-v0)
- [Hugging Face: jrubiosainz/microduck-tug-quicksilver-v14-h2-63aab429](https://huggingface.co/jrubiosainz/microduck-tug-quicksilver-v14-h2-63aab429)
- [Microduck Arena (Space de Pollen Robotics)](https://huggingface.co/spaces/pollen-robotics/microduck-arena)
- [TechCrunch: Hugging Face is selling a cute $399 open source duck robot, Microduck](https://techcrunch.com/2026/08/27/hugging-face-is-selling-a-cute-399-open-source-duck-robot-microduck/)
