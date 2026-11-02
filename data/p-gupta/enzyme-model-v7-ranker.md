# p-gupta/enzyme-model-v7-ranker

## Resumen

`p-gupta/enzyme-model-v7-ranker` es un repositorio de Hugging Face publicado como modelo de arranque (starter) para la tarea de clasificación de enzimas del leaderboard Leak CURBER. No se trata de un modelo de lenguaje ni de una red neuronal preentrenada de propósito general: la model card describe un esqueleto de participación que incluye un baseline trivial (predecir siempre el EC más frecuente del conjunto de entrenamiento) junto con la infraestructura de evaluación (Dockerfile, `predict.py`, `inputs.py`, `train.py`). El autor del repositorio es el usuario `p-gupta`, y el material de referencia de la competición procede de `starkAhmed43`.

La tarea consiste en asignar números EC (Enzyme Commission) a secuencias de aminoácidos de enzimas. La entrada es un fichero Parquet con columnas `id` y `sequence`, y la salida es JSON Lines con `id` y `prediction`, donde la predicción es una lista de EC distintas ordenadas de mejor a peor. La métrica principal es la precisión top-1 a nivel L4 del número EC, con desempates por niveles L3, L2 y L1.

El interés de este repositorio es logístico y de competición, no de modelado: define las restricciones de inferencia (CPU únicamente, 2 vCPU, 16 GB de RAM, 10 minutos para todos los inputs, sin red), el formato de entrega y las reglas del leaderboard. El tamaño del repositorio es de 0,1 GB, lo que sugiere que contiene principalmente scripts y pesos del baseline, no un modelo de gran tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio es un starter con baseline de frecuencia; no se especifica arquitectura de red) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (no es un modelo de contexto; procesa secuencias de aminoácidos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la tarea es sobre secuencias biológicas, no texto natural) |
| Licencia | no disponible |
| Formato de pesos | no disponible (el baseline usa `weights/baseline.json`; el resto de pesos no se detalla) |

## Arquitectura y entrenamiento

La información disponible no describe una arquitectura de red neuronal concreta. El repositorio se presenta como un "starter model" para la tarea de clasificación de enzimas: incluye un baseline que ignora la entrada y predice el EC más frecuente del split de entrenamiento, además de scripts para reentrenar ese baseline (`train.py`), generar las entradas únicas de validación (`inputs.py`) y ejecutar la predicción (`predict.py`). El participante debe sustituir este baseline por su propio modelo o librería.

Los datos públicos son `train.parquet` (con la etiqueta `ec_number`, una pareja entrada–EC por fila) y `val_inputs.parquet` (solo entradas). Las etiquetas de validación y los datos de test son privados. El vocabulario de EC permitido (`ec_vocabulary.json`) proviene de ExPASy ENZYME, release 02-Sep-2026, distribuido por SIB bajo CC BY 4.0. No se especifican número de tokens de entrenamiento, composición del dataset ni técnicas de RLHF/DPO, ya que no aplica a este tipo de tarea.

La innovación técnica destacable no está en el modelo sino en el protocolo de evaluación: agrupación de entradas idénticas dentro de cada split (se conserva el primer ID y se puntúa una sola vez por entrada única), puntuación parcial cuando una entrada tiene varios EC registrados (la primera predicción obtiene 1/n por cada EC registrado cuyos primeros L componentes coincidan) y evaluación en contenedor Docker con límites estrictos de CPU, memoria, tiempo y ausencia de red.

## Capacidades

- Clasificación de secuencias de aminoácidos en números EC (Enzyme Commission) a cuatro niveles jerárquicos (L1 a L4).
- Predicción top-1 con posibilidad de listar hasta 10 EC distintos por entrada, ordenados de mejor a peor (solo el primero cuenta para la puntuación).
- Manejo de entradas con múltiples EC registrados mediante puntuación parcial (1/n por cada EC coincidente en los primeros L componentes).
- Agrupación y deduplicación de entradas idénticas para puntuar cada entrada única una sola vez.
- Ejecución en CPU exclusivamente, sin GPU ni acceso a red durante la inferencia.
- Empaquetado en contenedor Docker con límites definidos: Linux x86-64, Python en `/usr/local/bin/python`, directorio de trabajo `/app`, build en 30 minutos, repositorio de 4 GiB o menos y ficheros de salida de 16 MiB o menos.
- No se documentan capacidades de generación de texto, razonamiento general, código, matemáticas, visión, tool calling, agentes ni multilingüismo, porque el ámbito es la clasificación enzimática.

## Casos de uso

- Participación en el leaderboard Leak CURBER: el repositorio sirve como plantilla para entrenar un clasificador de EC, empaquetarlo en Docker y enviarlo a la competición, cumpliendo el formato de salida JSON Lines y las restricciones de inferencia.
- Anotación automática de enzimas en pipelines de bioinformática: un modelo entrenado sobre `train.parquet` puede asignar números EC a secuencias nuevas agrupadas por ID único, reduciendo el trabajo manual de curaduría.
- Evaluación comparativa de enfoques de clasificación: el baseline de frecuencia permite medir la mejora real de modelos basados en secuencias (k-mers, embeddings proteicos, transformers) frente a una referencia trivial.
- Reproducibilidad de experimentos: los scripts `train.py`, `inputs.py` y `predict.py` junto con el Dockerfile permiten replicar el flujo completo en local antes de enviar al leaderboard.
- Docencia y aprendizaje de competiciones de ML: el repositorio ilustra el ciclo completo de una competición (datos públicos/privados, métricas jerárquicas, límites de cómputo, envío mediante Hugging Face Hub).
- Validación de robustez en entornos restringidos: al exigir CPU, 2 vCPU, 16 GB de RAM y 10 minutos sin red, es útil para probar que un clasificador de secuencias es eficiente y desplegable en infraestructura limitada.
- Integración en flujos de anotación funcional: las predicciones top-1 a nivel L4 pueden alimentar bases de datos internas de enzimas, con revisión humana posterior dado el riesgo de error.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card define la métrica del leaderboard (precisión top-1 a niveles L4, L3, L2 y L1, con ranking por L4) y describe el baseline de frecuencia, pero no proporciona cifras de rendimiento del baseline ni de ningún modelo entrenado.

## Requisitos de hardware

- Inferencia exclusivamente en CPU: el evaluador asigna 2 vCPU y 16 GB de RAM, sin GPU y sin red.
- Tiempo máximo de inferencia: 10 minutos para todos los inputs del conjunto de evaluación.
- GPU: no aplica; el entorno de evaluación no dispone de GPU.
- Memoria: límite de 16 GB de RAM para el contenedor.
- Almacenamiento: el repositorio del modelo debe ser de 4 GiB o menos; ningún fichero escrito por `predict.py` puede superar 16 MiB; usar `/tmp` para ficheros temporales.
- Build: la imagen Docker debe construirse en 30 minutos o menos, sobre Linux x86-64, con Python en `/usr/local/bin/python` y directorio de trabajo `/app`.
- Opciones de despliegue: contenedor Docker construido a partir del `Dockerfile` del repositorio; la ejecución se lanza directamente como `python /app/predict.py --input INPUT --output OUTPUT` (no se ejecutan entrypoints de Docker ni hooks de shell).
- Latencia y throughput: no disponibles; dependen del modelo que sustituya al baseline y deben caber en el límite de 10 minutos.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros modelos comparables de clasificación de enzimas ni datos de rendimiento que permitan una comparación cuantitativa. El único punto de referencia explícito es el baseline de frecuencia incluido en el propio repositorio, que ignora la entrada y predice el EC más frecuente del entrenamiento.

## Limitaciones y advertencias

- El repositorio es un starter, no un modelo entrenado de alto rendimiento: el baseline incluido ignora la secuencia de entrada y predice siempre el EC más frecuente, por lo que su capacidad predictiva es muy limitada.
- La licencia no está disponible, lo que impide confirmar si se permite uso comercial del contenido del repositorio.
- Los datos de entrenamiento y validación no están incluidos en el repositorio; deben descargarse por separado desde el repositorio de datos de la competición.
- Las etiquetas de validación y los datos de test son privados; no es posible evaluar localmente el rendimiento real sobre el conjunto de test.
- Restricciones estrictas de evaluación: cualquier línea en blanco, clave incorrecta, ID faltante, duplicado o añadido, EC duplicado, más de 10 EC, EC fuera del vocabulario, tiempo de inferencia superior a 10 minutos o necesidad de red provocan el fallo de la evaluación.
- Límites de envío: 2 envíos por día y 20 en total por tarea y equipo; los fallos cuentan contra estos límites; solo una evaluación activa a la vez.
- Las entradas con varios EC registrados requieren entender la puntuación parcial (1/n por EC coincidente), lo que puede penalizar predicciones únicas en casos ambiguos.
- No se debe normalizar las secuencias de entrada; hacerlo puede alterar la agrupación de entradas idénticas y la puntuación.
- Riesgo de sesgo hacia las clases EC más frecuentes en el conjunto de entrenamiento, especialmente si se parte del baseline de frecuencia.
- No hay información sobre sesgos, alucinación o limitaciones idiomáticas porque el modelo no es de lenguaje natural; el riesgo relevante es la clasificación errónea de enzimas y la posible sobrerrepresentación de familias enzimáticas comunes.

## Enlaces

- Repositorio del modelo: https://huggingface.co/p-gupta/enzyme-model-v7-ranker
- Repositorio starter de referencia: https://huggingface.co/starkAhmed43/leak-curber-enzyme-classification-starter
- Dataset de la competición: https://huggingface.co/datasets/starkAhmed43/leak-curber-enzyme-classification
- Leaderboard: https://huggingface.co/spaces/starkAhmed43/leak-curber-leaderboard
- Hoja de asignación de tareas: https://docs.google.com/spreadsheets/d/12c2PaYcNDpa6bA0JPmKi6tHsdV-EdFe2IYQ70RqpGRI/edit?usp=sharing
- Vocabulario EC (ExPASy ENZYME, SIB, CC BY 4.0): https://enzyme.expasy.org/
