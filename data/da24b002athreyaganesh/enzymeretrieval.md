# da24b002athreyaganesh/enzymeretrieval

## Resumen

`da24b002athreyaganesh/enzymeretrieval` es un repositorio publicado en Hugging Face que contiene el modelo de arranque (*starter*) de la tarea de recuperación de números EC del reto Leak CURBER. No se trata de un modelo de lenguaje ni de una red neuronal entrenada: el peso incluido es un baseline de frecuencia que ignora por completo la entrada y predice, para cada reacción, el número EC más frecuente del conjunto de entrenamiento. El repositorio aporta sobre todo la infraestructura de envío: `Dockerfile`, `predict.py`, `train.py`, `inputs.py` y `requirements.txt`, pensados para que el participante los sustituya por su propio modelo.

El problema que aborda la tarea es la anotación automática de enzimas a partir de la reacción química expresada en SMILES de reacción (`rxn_smiles`). La entrada es un fichero Parquet con las columnas `id` y `rxn_smiles`; la salida es un JSON Lines con `id` y una lista de hasta 10 números EC ordenados de mejor a peor, de los cuales solo el primero puntúa. La evaluación se realiza en un contenedor sin GPU ni red, con 2 vCPU, 16 GB de RAM y un límite de 10 minutos para todos los inputs.

Su relevancia es logística y metodológica: fija el contrato de datos, el formato de salida, las reglas de agrupación de inputs duplicados y el esquema de puntuación (acierto top-1 a niveles EC L1–L4, con ordenación por L4 y crédito parcial 1/n cuando un input tiene varios EC registrados). Para un desarrollador o investigador que evalúe modelos, es el punto de partida reproducible del leaderboard, no un modelo con capacidades de inferencia semántica propias.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el baseline incluido no es una red neuronal; es una tabla de frecuencias EC) |
| Parametros totales | no disponible (no aplica a una tabla de frecuencias; el repositorio ocupa 0,5 GB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (la tarea no define ventana de contexto; la entrada es una reacción SMILES por registro) |
| Tipos de cuantizacion | no disponible (el baseline no se cuantiza; los pesos son un JSON de frecuencias) |
| Idiomas soportados | no disponible (la tarea no es lingüística; trabaja con SMILES de reacción) |
| Licencia | no disponible para el repositorio del modelo; el vocabulario EC procede de ExPASy ENZYME, release 02-Sep-2026, bajo CC BY 4.0 de SIB |
| Formato de pesos | JSON (`weights/baseline.json`), junto con `Dockerfile`, `predict.py`, `train.py`, `inputs.py` y `requirements.txt` |

## Arquitectura y entrenamiento

El baseline no emplea arquitectura de aprendizaje profundo. `train.py` recorre `train.parquet` y construye una tabla de frecuencias que asocia a cada número EC su recuento en el conjunto de entrenamiento; `predict.py` devuelve el EC más frecuente para cualquier entrada, sin leer `rxn_smiles`. El propio autor lo describe como un baseline que ignora la entrada y usa únicamente el split de entrenamiento. El repositorio no documenta ningún entrenamiento con tokens, composición de dataset, RLHF, DPO ni innovaciones de atención o decodificación, porque no existe un modelo neuronal subyacente.

Lo que sí define el repositorio es el contrato de evaluación. `inputs.py` agrupa inputs idénticos dentro de cada split y conserva el primer `id`, de modo que cada reacción única se puntúa una sola vez y el participante solo debe predecir el primer identificador de cada grupo; las reacciones no deben canonicalizarse. La puntuación es el acierto top-1 a niveles L4, L3, L2 y L1 del número EC, con ordenación por L4 y desempate a favor del envío anterior. Si un input tiene n EC registrados, la primera predicción obtiene 1/n por cada EC registrado cuyos primeros L componentes coincidan, promediado sobre inputs únicos; una predicción vacía puntúa cero. El vocabulario permitido está en `ec_vocabulary.json`, derivado de ExPASy ENZYME.

## Capacidades

- El baseline incluido no genera texto, no razona, no resuelve matemáticas ni procesa visión: su única función es devolver el EC más frecuente del entrenamiento.
- Lectura de entradas en Parquet con las columnas `id` y `rxn_smiles` y escritura de salida en JSON Lines con las claves `id` y `prediction`.
- Agrupación de inputs duplicados mediante `inputs.py`, conservando el primer `id` de cada grupo y evitando predicciones sobre identificadores repetidos.
- Validación implícita del formato de salida: lista de hasta 10 EC distintos, sin duplicados y todos presentes en `ec_vocabulary.json`.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso; el contenedor de evaluación se ejecuta sin red, por lo que cualquier dependencia externa queda descartada.
- Capacidad de empaquetado reproducible: construcción de imagen Docker linux/amd64, Python en `/usr/local/bin/python`, directorio de trabajo `/app` y comando fijo `python /app/predict.py --input INPUT --output OUTPUT`.
- Capacidad de ser sustituido: el participante puede reemplazar `Dockerfile`, `requirements.txt` y `predict.py` por cualquier modelo o librería, siempre que la inferencia sea solo CPU.

## Casos de uso

- Punto de partida para participar en el leaderboard de Leak CURBER: se descarga el starter, se ejecuta el baseline para verificar que el pipeline de envío funciona y se mide la referencia de frecuencia antes de invertir en un modelo real.
- Validación del contrato de datos antes del envío: usar `inputs.py` para generar el fichero de inputs únicos y comprobar que `predictions.jsonl` contiene exactamente un registro por identificador único, sin duplicados ni identificadores añadidos.
- Prueba de humo de la imagen Docker: construir la imagen y ejecutarla con `--network none --cpus 2 --memory 16g` para confirmar que el modelo entra en el límite de 10 minutos y no requiere GPU ni acceso a red.
- Envoltorio para modelos de anotación enzimática basados en reacciones: sustituir `predict.py` por un clasificador sobre fingerprints de reacción o embeddings, manteniendo intacto el formato de entrada y salida que exige el evaluador.
- Evaluación comparativa interna de estrategias de predicción de EC (frecuencia, reglas de similitud de reacción, modelos supervisados) bajo un mismo esquema de puntuación top-1 a niveles L1–L4 con crédito parcial.
- Canalización de anotación en bases de datos de enzimas: usar el esqueleto para procesar lotes de reacciones en Parquet y emitir predicciones EC en JSON Lines que luego se revisen manualmente antes de su incorporación a un catálogo.
- Referencia didáctica de un baseline trivial: ilustrar en un curso o artículo por qué una estrategia que ignora la entrada sigue siendo un punto de comparación necesario antes de reportar mejoras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card define la métrica y el procedimiento de evaluación (acierto top-1 en L4, L3, L2 y L1; ordenación por L4; crédito parcial 1/n; desempate por fecha de envío), pero no incluye cifras de validación ni de test para este repositorio. El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y no hay puntuación pública asociada.

## Requisitos de hardware

- Inferencia solo CPU: el evaluador asigna 2 vCPU y 16 GB de RAM, sin GPU y sin red.
- Tiempo máximo de inferencia: 10 minutos para el conjunto completo de inputs de la tarea.
- VRAM estimada: no aplica; el baseline es una consulta de tabla y no requiere acelerador.
- GPU recomendadas: ninguna; el reglamento del reto excluye el uso de GPU durante la evaluación.
- Cabe en cualquier equipo de consumo: el coste del baseline es el de leer el Parquet y escribir el JSONL.
- Límites de empaquetado: imagen construida en menos de 30 minutos, repositorio de 4 GiB o menos, ningún fichero escrito por `predict.py` puede superar 16 MiB y los temporales deben ir a `/tmp`.
- Opciones de despliegue: Docker linux/amd64 con `python /app/predict.py --input INPUT --output OUTPUT`; no se ejecutan entrypoints de Docker ni hooks de arranque de shell. vLLM, llama.cpp, Ollama o TGI no aplican a este baseline.
- Latencia y throughput: no disponibles como cifras publicadas; al tratarse de una búsqueda en tabla, el coste dominante es la lectura y escritura de ficheros, no el cálculo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `da24b002athreyaganesh/enzymeretrieval` (este repositorio) | no disponible (tabla de frecuencias) | no disponible | sin cifras publicadas | no disponible | público en Hugging Face, 0 descargas, 0 likes |
| `starkAhmed43/leak-curber-enzyme-retrieval-starter` (starter de referencia citado en la model card) | no disponible | no disponible | sin cifras publicadas | no disponible | público en Hugging Face |
| `starkAhmed43/leak-curber-enzyme-retrieval` (dataset de la tarea) | no aplica (datos: `train.parquet`, `val_inputs.parquet`) | no aplica | no aplica | no disponible | público en Hugging Face, tipo dataset |

No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada; las alternativas reales del leaderboard son envíos de terceros cuyos resultados no se han incluido aquí.

## Limitaciones y advertencias

- El baseline ignora la entrada: no lee `rxn_smiles`, por lo que su capacidad predictiva es nula más allá de la clase mayoritaria y no debe interpretarse como un modelo de predicción de EC.
- No es un modelo de lenguaje: no admite instrucciones, no genera texto libre, no soporta tool calling ni agentes, y no debe evaluarse con benchmarks de NLP.
- Sesgo estructural hacia los números EC más frecuentes en `train.parquet`, con infrarepresentación sistemática de las clases minoritarias y de las reacciones poco habituales.
- Restricción dura de ejecución: sin GPU y sin red durante la evaluación; cualquier dependencia que descargue pesos o consulte una API en tiempo de inferencia provoca el fallo del envío.
- Restricciones de formato estrictas: una línea en blanco, una clave distinta de `id` y `prediction`, un identificador único ausente, duplicado o añadido, un EC repetido, más de 10 EC o un EC fuera de `ec_vocabulary.json` invalidan la evaluación.
- Solo puntúa la primera predicción de la lista; añadir EC adicionales no mejora la puntuación top-1 y consume espacio de salida.
- No canonicalizar las reacciones: la agrupación de duplicados y la puntuación dependen de los identificadores, de modo que alterar la representación puede desalinear la salida con la entrada.
- Límites de participación: 2 envíos por día y 20 en total por tarea, con los fallos contando; solo una evaluación activa a la vez y las ejecuciones no nominadas caducan a los 7 días.
- Licencia del repositorio no disponible: antes de reutilizar el código o los pesos en producción conviene comprobar los términos del autor. El vocabulario EC se distribuye bajo CC BY 4.0 de SIB y exige atribución.
- Fecha límite del reto: envíos y nominaciones antes del 7 de noviembre de 2026.

## Enlaces

- Repositorio del modelo en Hugging Face: https://huggingface.co/da24b002athreyaganesh/enzymeretrieval
- Starter de referencia citado en la model card: https://huggingface.co/starkAhmed43/leak-curber-enzyme-retrieval-starter
- Dataset de la tarea: https://huggingface.co/datasets/starkAhmed43/leak-curber-enzyme-retrieval
- Leaderboard (pestaña Enzyme retrieval): https://huggingface.co/spaces/starkAhmed43/leak-curber-leaderboard
- Hoja de asignación de tareas: https://docs.google.com/spreadsheets/d/12c2PaYcNDpa6bA0JPmKi6tHsdV-EdFe2IYQ70RqpGRI/edit?usp=sharing
- ExPASy ENZYME (origen de `ec_vocabulary.json`, CC BY 4.0): https://enzyme.expasy.org/
