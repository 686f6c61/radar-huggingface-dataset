# Shreyash3096/enzyme-classification-ec-prediction

## Resumen

`Shreyash3096/enzyme-classification-ec-prediction` es un repositorio público de Hugging Face creado por Shreyash Kumar Pandey (usuario `Shreyash3096`) como participación en la competición **Leak CURBER**, en la tarea de clasificación de enzimas mediante números EC (Enzyme Commission). No es un modelo de lenguaje: la entrada es una secuencia de aminoácidos y la salida es una lista ordenada de códigos EC, evaluada con precisión top-1 a cuatro niveles jerárquicos (L4, L3, L2 y L1). El repositorio ocupa 0,4 GB y su etiqueta de formato es `joblib`, lo que apunta a un artefacto de scikit-learn serializado, aunque la model card no describe la arquitectura concreta.

El punto crítico para evaluar este repositorio es que su `README.md` no es una ficha técnica del modelo, sino la **plantilla del modelo de arranque (starter)** de la competición: explica el formato de datos, las reglas de puntuación, los límites del contenedor de evaluación y el procedimiento de envío. De hecho, el baseline descrito en esa plantilla ignora por completo la secuencia de entrada y predice para todo input el EC más frecuente del conjunto de entrenamiento. No hay información pública que confirme si el artefacto `joblib` subido implementa ese baseline trivial o un clasificador entrenado.

Por tanto, este repositorio es relevante como **referencia de infraestructura y de protocolo de evaluación** dentro del ecosistema Leak CURBER (evaluación en CPU, sin red, 2 vCPU, 16 GB de RAM, 10 minutos), y no como un modelo biológico con rendimiento demostrado. Cualquier uso en producción requeriría verificar primero qué contiene el artefacto y qué métricas ha obtenido en el leaderboard.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible. El repositorio está etiquetado como `joblib`; la model card publicada es la plantilla del starter y no describe la arquitectura del artefacto subido |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no se describe un modelo MoE) |
| Longitud de contexto | No aplica: la entrada es una secuencia de aminoácidos, no una ventana de texto; no se documenta límite de longitud de secuencia |
| Tipos de cuantizacion | No disponible (artefacto `joblib`; no se documentan variantes cuantizadas) |
| Idiomas soportados | No disponible. La tarea no es lingüística: la entrada son secuencias de aminoácidos y las etiquetas son códigos EC |
| Licencia | No disponible. Solo se indica que `ec_vocabulary.json` proviene de ExPASy ENZYME (release 02-Sep-2026) bajo CC BY 4.0, lo cual afecta al vocabulario, no necesariamente a los pesos |
| Formato de pesos | `joblib` (etiqueta del repositorio). El starter de referencia usa `weights/baseline.json` para el baseline reentrenable |

Otros datos del repositorio: 0 descargas, 0 likes, creado el 2026-10-24, actualizado el 2026-10-27, tamaño de 0,4 GB, `pipeline_tag` no disponible.

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del artefacto. La model card no incluye capa, dimensionalidad, tipo de codificación de secuencia (k-mers, embeddings proteicos, perfil HMM) ni procedimiento de entrenamiento del modelo subido. Lo único documentado es el **baseline de referencia** de la competición: un predictor que ignora la entrada y devuelve siempre el EC más frecuente en `train.parquet`, entrenado únicamente con el split de entrenamiento y serializado como `weights/baseline.json`. Retener ese baseline como referencia es útil porque fija el suelo de puntuación del leaderboard.

El protocolo de datos sí está bien especificado: entrada en Parquet con columnas `id` y `sequence`; agrupación de secuencias idénticas dentro de cada split conservando el primer `id`; prohibición de normalizar secuencias; salida en JSON Lines con exactamente las claves `id` y `prediction`. La puntuación es top-1 sobre el primer EC predicho, con crédito parcial `1/n` cuando una entrada tiene `n` ECs registrados, promediado sobre entradas únicas, y se reporta a niveles L4, L3, L2 y L1 (el ranking usa L4). No se documenta ningún uso de RLHF, DPO ni técnicas de alineación, algo esperable en una tarea de clasificación supervisada.

## Capacidades

- Clasificación de secuencias de aminoácidos en códigos EC con salida de hasta 10 predicciones ordenadas por preferencia (solo la primera cuenta para la métrica).
- Predicción jerárquica evaluable a cuatro niveles de la nomenclatura EC (L1 a L4).
- Ejecución en CPU pura, sin GPU y sin acceso a red durante la inferencia.
- Encapsulado en contenedor Docker linux/amd64 con contrato de invocación fijo: `python /app/predict.py --input INPUT --output OUTPUT`.
- Generación de salida determinista en JSON Lines, un registro por `id` único de entrada.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling ni comportamiento agéntico. No es un modelo de ese tipo.
- No se documenta capacidad multilingüe (la tarea no es lingüística).
- No se documenta modo "thinking", decodificación especulativa ni atención lineal.

## Casos de uso

- **Suelo de referencia en la competición Leak CURBER**: usar el baseline mayoritario para fijar la puntuación mínima esperada en L4 y comprobar que cualquier modelo propio la supera antes de gastar envíos. Es adecuado porque su comportamiento es trivial y reproducible con `train.py`.
- **Prueba de integración del pipeline de envío**: desplegar el contenedor con los comandos Docker documentados y verificar que `output/predictions.jsonl` contiene cada `id` único exactamente una vez, sin duplicados y con ECs presentes en `ec_vocabulary.json`. Sirve para depurar el formato antes de subir un modelo real.
- **Validación del emparejamiento de secuencias duplicadas**: ejecutar `inputs.py` sobre `val_inputs.parquet` para comprobar que la agrupación de secuencias idénticas coincide con la del evaluador, evitando fallos por IDs repetidos o añadidos.
- **Prior estadístico en anotación enzimática a gran escala**: dado que el baseline devuelve el EC más frecuente, puede emplearse como distribución previa para ordenar candidatos en pipelines de anotación de metagenomas, siempre que se sustituya por un clasificador real antes de cualquier decisión biológica.
- **Docencia y reproducibilidad metodológica**: el repositorio documenta de forma completa el contrato de datos, la métrica con crédito parcial y los límites de recursos, lo que lo convierte en material útil para explicar evaluación con leakage controlado en bioinformática.
- **Plantilla para sustituir por un clasificador real**: la estructura `Dockerfile` + `requirements.txt` + `predict.py` permite injertar un modelo basado en embeddings proteicos manteniendo el mismo contrato de entrada/salida y las mismas restricciones de 2 vCPU, 16 GB y 10 minutos.
- **Verificación de restricciones de empaquetado**: comprobar que la imagen se construye en menos de 30 minutos, que el repositorio no supera 4 GiB y que ningún fichero escrito supera 16 MiB, condiciones que invalidan un envío.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye puntuaciones del leaderboard, ni tablas comparativas, ni métricas propias. La model card únicamente define el sistema de puntuación (top-1 con crédito parcial `1/n`, reportado en L4, L3, L2 y L1, con ranking por L4) sin aportar cifras. Tampoco se dispone de resultados para el baseline mayoritario ni del número de entradas de validación.

## Requisitos de hardware

- VRAM: no aplica. La inferencia está especificada para CPU exclusivamente, sin GPU.
- Recursos asignados por el evaluador: 2 vCPU, 16 GB de RAM, 10 minutos de tiempo máximo para el conjunto completo de entradas.
- Restricciones del contenedor: Linux x86-64, intérprete en `/usr/local/bin/python`, directorio de trabajo `/app`, sin red, sin entrypoints ni hooks de shell (Python se lanza directamente).
- Límites de empaquetado: imagen construida en menos de 30 minutos, repositorio de 4 GiB o menos, ningún fichero escrito por `predict.py` superior a 16 MiB. El repositorio actual ocupa 0,4 GB.
- GPU recomendadas: no disponibles, no se contemplan. Cualquier despliegue en GPU quedaría fuera del contrato de evaluación de la competición.
- Cabe en cualquier equipo de consumo: el requisito de 16 GB de RAM es el factor limitante, no la capacidad de cómputo.
- Opciones de despliegue: Docker (documentado, con `--platform linux/amd64`, `--network none`, `--cpus 2`, `--memory 16g`); invocación directa con Python. No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles. El único dato temporal es el límite de 10 minutos para todas las entradas.

## Comparativa con modelos similares

| Modelo / referencia | Enfoque | Parámetros | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `Shreyash3096/enzyme-classification-ec-prediction` | Clasificador EC empaquetado en `joblib`; arquitectura no documentada | No disponible | No aplica | No disponible | No disponible | Público en Hugging Face |
| Starter baseline `starkAhmed43/leak-curber-enzyme-classification-starter` | Predictor mayoritario que ignora la secuencia | No aplica (tabla de frecuencias) | No aplica | No disponible en la información proporcionada | No disponible | Público en Hugging Face |
| ECPred (ecpred.kansil.org) | Un modelo de aprendizaje independiente por cada número EC, con clasificación enzima/no enzima y predicción jerárquica sobre el árbol de la nomenclatura EC | No disponible | No aplica | No disponible en la información proporcionada | No disponible | Servicio web público |
| Modelos ML de predicción de funciones enzimáticas (revisión, J Cheminform 2024; Trends Biotechnol 2025) | Aprendizaje automático sobre reacciones y secuencias, con planificación biosintética | No disponible | No aplica | No disponible en la información proporcionada | No disponible | Publicaciones científicas |

La comparación cuantitativa no es posible con los datos disponibles: ninguno de los sistemas listados publica en esta información parámetros, contexto o métricas homogéneas, y las tareas exactas (predicción sobre secuencia frente a predicción sobre reacción química) no son estrictamente equivalentes.

## Limitaciones y advertencias

- La model card publicada es la plantilla del starter de Leak CURBER, no una ficha del modelo: no identifica arquitectura, datos de entrenamiento, autoría del artefacto ni hiperparámetros.
- No hay licencia declarada. Sin una licencia explícita no puede asumirse permiso para uso comercial; hay que contactar con el autor o tratar el repositorio como no licenciado.
- El baseline descrito ignora la secuencia de entrada y predice siempre el EC más frecuente, lo que produce un sesgo sistemático hacia las clases mayoritarias y un rendimiento nulo en enzimas poco representadas.
- Riesgo alto de predicción inútil en clases raras: la métrica con crédito parcial `1/n` y el ranking por L4 penalizan especialmente los errores en el cuarto nivel, el más específico.
- No se documentan sesgos de composición del dataset de entrenamiento (sesgo taxonómico, sobrerrepresentación de enzimas bien caracterizadas, etc.).
- No hay métricas publicadas: no es posible afirmar que el modelo supere al baseline ni estimar su precisión real.
- Los identificadores EC están restringidos al vocabulario `ec_vocabulary.json` (ExPASy ENZYME, release 02-Sep-2026): predicciones fuera de ese vocabulario invalidan la evaluación completa.
- El envío falla si se duplica o se omite un `id` único, si se repite un EC en la lista, si se superan 10 ECs o si la inferencia necesita red o excede 10 minutos.
- Restricciones operativas de la competición: 2 envíos por día y 20 en total por tarea, con un único envío activo simultáneamente; los archivos de envíos no nominados expiran a los 7 días.
- El artefacto de 0,4 GB debe caber junto al resto de dependencias en un repositorio de 4 GiB, lo que limita añadir modelos auxiliares grandes.
- No se documenta comportamiento multilingüe ni manejo de entradas malformadas (secuencias vacías, caracteres no estándar); la normalización de secuencias está explícitamente prohibida por el evaluador.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Shreyash3096/enzyme-classification-ec-prediction
- Perfil del autor: https://huggingface.co/Shreyash3096
- Starter de referencia: https://huggingface.co/starkAhmed43/leak-curber-enzyme-classification-starter
- Dataset de la competición: https://huggingface.co/datasets/starkAhmed43/leak-curber-enzyme-classification
- Leaderboard (Space): https://huggingface.co/spaces/starkAhmed43/leak-curber-leaderboard
- Hoja de asignación de tareas: https://docs.google.com/spreadsheets/d/12c2PaYcNDpa6bA0JPmKi6tHsdV-EdFe2IYQ70RqpGRI/edit?usp=sharing
- Vocabulario EC (ExPASy ENZYME, CC BY 4.0): https://enzyme.expasy.org/
- ECPred: https://ecpred.kansil.org/
- Revisión sobre clasificación funcional de enzimas con IA (Trends in Biotechnology, 2025): https://www.sciencedirect.com/science/article/pii/S0167779925000885
- Modelo general de predicción de funciones enzimáticas (Journal of Cheminformatics, 2024): https://link.springer.com/article/10.1186/s13321-024-00827-y
