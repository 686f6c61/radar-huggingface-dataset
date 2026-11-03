# hari12-hp/enzyme-retrieval-baseline

## Resumen

`enzyme-retrieval-baseline` es un modelo de referencia (baseline) publicado por el usuario hari12-hp en Hugging Face para la tarea de retrieval de números EC (Enzyme Commission) del reto Leak CURBER. No se trata de un modelo de lenguaje ni de una red neuronal entrenada: es un artefacto de código y pesos mínimos que implementa una estrategia trivial de predicción por frecuencia, pensado como punto de partida reproducible para participantes de un leaderboard.

La tarea consiste en recibir un fichero Parquet con columnas `id` y `rxn_smiles` (SMILES de reacción química) y predecir un número EC por cada entrada única, en formato JSON Lines. El baseline ignora por completo la entrada y devuelve siempre el número EC más frecuente del conjunto de entrenamiento, lo que lo convierte en una cota inferior de rendimiento contra la que medir mejoras reales.

Su relevancia es metodológica más que técnica: establece el contrato de entrada/salida, el entorno de ejecución restringido (CPU, 2 vCPU, 16 GB RAM, 15 minutos, sin red) y el esquema de evaluación (top-1 accuracy a niveles L1–L4, con puntuación parcial 1/n cuando hay múltiples ECs registrados). Cualquier modelo que aspire a subir al leaderboard debe superar esta referencia y cumplir exactamente las restricciones de empaquetado descritas en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (baseline por frecuencia; no es una red neuronal) |
| Parametros totales | no disponible (pesos en `weights/baseline.json`, sin parámetros neuronales) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no procesa texto libre; entrada tabular Parquet) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | JSON (`weights/baseline.json`); contenedor Docker con `Dockerfile`, `predict.py`, `requirements.txt` |

## Arquitectura y entrenamiento

El baseline no emplea arquitectura neuronal. Su lógica es un clasificador mayoritario: durante el entrenamiento (`train.py`) recorre `train.parquet`, cuenta la frecuencia de cada número EC y persiste el más frecuente en `weights/baseline.json`. En inferencia (`predict.py`) carga ese valor y lo asigna a cada `id` único del fichero de entrada, produciendo una lista de un solo elemento con el EC más común.

No hay datos de entrenamiento en el sentido habitual: solo se usa el split `train.parquet` del dataset `starkAhmed43/leak-curber-enzyme-retrieval`, que contiene pares entrada–EC (una fila por par). No hay RLHF, DPO ni ajuste fino. El vocabulario permitido de ECs proviene de `ec_vocabulary.json`, generado a partir de ExPASy ENZYME release 02-Sep-2026 (SIB, CC BY 4.0). El pipeline de evaluación agrupa entradas idénticas dentro de cada split, conserva el primer ID y puntúa cada entrada única una sola vez; el baseline respeta esa convención mediante `inputs.py`.

## Capacidades

- Predicción de un número EC por reacción química, limitada a la clase mayoritaria del conjunto de entrenamiento.
- Cumplimiento del contrato de salida JSON Lines con claves `id` y `prediction` (lista de ECs distintos, mejor primero, máximo 10).
- Ejecución en CPU pura, sin GPU y sin acceso a red, dentro de un contenedor Docker.
- Empaquetado reproducible mediante `Dockerfile`, `requirements.txt` y `predict.py`, con Python en `/usr/local/bin/python` y directorio de trabajo `/app`.
- Generación de fichero de entradas únicas de validación (`inputs.py`) para verificar que cada ID aparece exactamente una vez.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües.

## Casos de uso

- Punto de partida en el reto Leak CURBER: sirve para verificar que el pipeline de descarga, entrenamiento, inferencia y empaquetado Docker funciona antes de invertir en un modelo real.
- Cota inferior de rendimiento: permite cuantificar cuánto mejora un modelo candidato respecto a la predicción por frecuencia, aislando el efecto de la arquitectura del de la ingeniería del pipeline.
- Validación del contrato de evaluación: comprueba que el evaluador acepta el formato JSON Lines, que no hay IDs duplicados ni ECs fuera de `ec_vocabulary.json` y que se respeta el límite de 10 predicciones.
- Prueba de restricciones de hardware: mide si un contenedor arranca y termina dentro de los 15 minutos con 2 vCPU y 16 GB RAM, cubriendo pull de imagen, carga de modelo e inferencia.
- Referencia para comparativas internas: al ser determinista y trivial, cualquier variación en la puntuación de un modelo candidato se atribuye a dicho modelo y no a ruido del baseline.
- Docencia y divulgación: ejemplo mínimo de cómo estructurar un repositorio de modelo con `Dockerfile`, `predict.py` y `README.md` para un leaderboard público con evaluación automática.
- Depuración de agrupación de entradas: `inputs.py` permite verificar que el agrupamiento de reacciones idénticas y la conservación del primer ID se aplican igual que en el evaluador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe el esquema de puntuación (top-1 accuracy a niveles L4, L3, L2 y L1, con ranking por L4 y puntuación parcial 1/n cuando una entrada tiene varios ECs registrados) pero no incluye cifras del baseline ni de modelos comparables.

## Requisitos de hardware

- Inferencia en CPU exclusivamente: el evaluador asigna 2 vCPU y 16 GB de RAM, sin GPU y sin red.
- Límite temporal de 15 minutos para todos los inputs, incluyendo pull de imagen, carga de modelo e inferencia; no se amplía.
- Límite de construcción de imagen: 30 minutos; tamaño máximo del repositorio 4 GiB; ningún fichero escrito por `predict.py` puede superar 16 MiB.
- Plataforma obligatoria: Linux x86-64, Python en `/usr/local/bin/python`, directorio de trabajo `/app`, comando `python /app/predict.py --input INPUT --output OUTPUT`.
- El baseline por frecuencia es prácticamente instantáneo y cabe en cualquier CPU; no requiere GPU consumer ni aceleradores.
- Opciones de despliegue: Docker (obligatorio para la evaluación); no se contemplan vLLM, llama.cpp, Ollama ni TGI porque no hay modelo neuronal que servir.
- Latencia y throughput estimados: no disponibles de forma oficial; por la naturaleza del baseline, el coste dominante es la lectura del Parquet y la escritura del JSON Lines.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros modelos de retrieval de números EC ni resultados de leaderboard que permitan una comparación cuantitativa. Como referencia cualitativa, cualquier modelo candidato del reto Leak CURBER debe superar al baseline por frecuencia y cumplir las mismas restricciones de CPU, memoria y tiempo.

## Limitaciones y advertencias

- El baseline ignora la entrada: predice siempre el EC más frecuente del entrenamiento, por lo que su accuracy real es baja salvo que la distribución esté muy desbalanceada.
- No generaliza: no aprende representaciones de reacciones químicas ni relaciones estructura–función enzimática.
- Solo cuenta la primera predicción para la puntuación; listar hasta 10 ECs no mejora el resultado.
- La licencia no está declarada en la información disponible; verificar antes de cualquier uso comercial o redistribución.
- El vocabulario de ECs está fijado a ExPASy ENZYME release 02-Sep-2026; ECs fuera de `ec_vocabulary.json` provocan fallo de evaluación.
- El entorno de evaluación es estricto: sin red, sin GPU, 15 minutos, 2 vCPU, 16 GB RAM; los entrypoints de Docker y hooks de shell no se ejecutan, y debe usarse `/tmp` para temporales.
- Cada equipo dispone de 2 envíos diarios y 20 totales por tarea; los fallos cuentan contra el límite y solo puede haber una evaluación activa a la vez.
- No debe añadirse el directorio de datos descargados ni el directorio `output` al repositorio del modelo.
- No canonicalizar las reacciones: el pipeline de evaluación agrupa entradas idénticas tal cual, y alterar la representación puede romper la correspondencia de IDs.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hari12-hp/enzyme-retrieval-baseline
- Dataset del reto: https://huggingface.co/datasets/starkAhmed43/leak-curber-enzyme-retrieval
- Modelo starter del organizador: https://huggingface.co/starkAhmed43/leak-curber-enzyme-retrieval-starter
- Leaderboard: https://huggingface.co/spaces/starkAhmed43/leak-curber-leaderboard
- Hoja de asignación de tareas: https://docs.google.com/spreadsheets/d/12c2PaYcNDpa6bA0JPmKi6tHsdV-EdFe2IYQ70RqpGRI/edit?usp=sharing
- ExPASy ENZYME (vocabulario EC, CC BY 4.0): https://enzyme.expasy.org/
