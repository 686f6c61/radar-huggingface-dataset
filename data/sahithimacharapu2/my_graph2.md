# sahithimacharapu2/my_graph2

## Resumen

`my_graph2` es un repositorio de Hugging Face publicado por el usuario `sahithimacharapu2` que, según su model card, contiene un modelo de inicio (starter) para la tarea de clasificación de enzimas del leaderboard Leak CURBER. No se trata de un modelo de lenguaje generativo, sino de un artefacto de participación en una competición de clasificación de secuencias proteicas: recibe un fichero Parquet con columnas `id` y `sequence` (secuencia de aminoácidos de una enzima) y debe emitir una predicción de número EC (Enzyme Commission) por cada identificador único de entrada.

El repositorio es extremadamente ligero (0,1 GB) y no declara pipeline, licencia ni idiomas. Las etiquetas (`leak-curber`, `enzyme`, `leaderboard`, `region:us`) confirman su naturaleza de envío de competición más que de modelo preentrenado reutilizable. La model card describe el formato de entrada y salida, el sistema de puntuación (top-1 accuracy a niveles EC L1-L4, con ranking por L4), las restricciones del evaluador (CPU únicamente, 2 vCPU, 16 GB de RAM, 15 minutos, sin red) y el flujo de envío mediante Docker y el espacio de leaderboard.

Por su naturaleza, no es un modelo que se pueda evaluar en términos de arquitectura transformer, parámetros o capacidades lingüísticas: es una plantilla de inferencia para una tarea bioinformática concreta. Cualquier dato sobre arquitectura, tamaño de parámetros o contexto no está disponible en la información proporcionada y debe considerarse no aplicable o desconocido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de clasificación de secuencias proteicas; la model card no especifica arquitectura) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no se indica que sea MoE) |
| Longitud de contexto | no disponible (la entrada es una secuencia de aminoácidos; no se declara límite) |
| Tipos de cuantizacion | no disponible (la inferencia se ejecuta en CPU con el entorno Docker del autor) |
| Idiomas soportados | no disponible (no aplica: entrada de secuencias de aminoácidos) |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio debe contener los pesos y ficheros necesarios para `predict.py`) |

## Arquitectura y entrenamiento

La model card no describe ninguna arquitectura de red neuronal concreta. El repositorio se presenta como un "starter model" para la tarea de clasificación enzimática: el participante entrena su propio modelo en local y sube los pesos junto con `Dockerfile`, `predict.py` y `README.md`. El baseline incluido ignora la entrada y predice el EC más frecuente del conjunto de entrenamiento, calculado únicamente a partir del split `train.parquet`.

Los datos de la competición son `train.parquet` (con etiqueta `ec_number`) y `val_inputs.parquet` (solo entradas); las etiquetas de validación y los datos de test son privados. El vocabulario de EC permitido proviene de ExPASy ENZYME, release 02-Sep-2026, publicado por SIB bajo CC BY 4.0. El entrenamiento del modelo real, su composición de datos, número de tokens o secuencias, y si hubo ajuste fino o RLHF no están disponibles en la información proporcionada.

Como innovación técnica destacable, la competición agrupa entradas idénticas dentro de cada split y puntúa cada entrada única una sola vez, exigiendo predecir solo el primer ID de cada grupo. La puntuación es top-1 accuracy a niveles L4, L3, L2 y L1, con ranking por L4, y si una entrada tiene n ECs registrados, la primera predicción obtiene 1/n por cada EC registrado cuyos primeros L componentes coincidan.

## Capacidades

- Clasificación de secuencias de aminoácidos en números EC (Enzyme Commission) a cuatro niveles jerárquicos (L1 a L4).
- Predicción de hasta 10 ECs distintos por entrada, ordenados de mejor a peor (solo el primero puntúa).
- Manejo de entradas con múltiples ECs registrados mediante puntuación parcial 1/n.
- Ejecución en CPU exclusivamente, sin GPU y sin acceso a red durante la inferencia.
- Empaquetado en contenedor Docker con límites estrictos: Linux x86-64, Python en `/usr/local/bin/python`, directorio de trabajo `/app`, comando `python /app/predict.py --input INPUT --output OUTPUT`.
- No se declaran capacidades de generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes ni multilingüismo.

## Casos de uso

- Participación en el leaderboard Leak CURBER: el repositorio sirve como plantilla para subir un modelo propio de clasificación enzimática y obtener una puntuación de validación en el espacio de Hugging Face del leaderboard.
- Anotación automática de enzimas en pipelines de bioinformática: dado un fichero Parquet con secuencias proteicas, el modelo puede asignar un EC candidato por secuencia única, útil como primer filtro en anotación funcional.
- Prototipado rápido de clasificadores de proteínas: el esqueleto de `predict.py`, `Dockerfile` y `requirements.txt` permite sustituir el baseline por un modelo entrenado con cualquier librería y validar el formato de salida JSON Lines.
- Evaluación reproducible en entornos sin GPU: al ejecutarse en 2 vCPU y 16 GB de RAM, encaja en infraestructura modesta o en CI con contenedores, sin dependencia de aceleradores.
- Comparación de estrategias de clasificación jerárquica: el sistema de puntuación L1-L4 permite medir la calidad de un modelo a distintos niveles de granularidad taxonómica enzimática.
- Docencia y experimentación con competiciones de ML: el flujo completo (descarga de datos, entrenamiento local, construcción de imagen Docker, envío al leaderboard) es un ejemplo práctico de extremo a extremo para formación en machine learning aplicado a biología computacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente describe el baseline trivial (predice el EC más frecuente del entrenamiento) y el sistema de puntuación del leaderboard, sin cifras de accuracy para este repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplicable; la evaluación se ejecuta exclusivamente en CPU.
- GPU recomendadas: ninguna; el evaluador no proporciona GPU.
- ¿Cabe en GPU consumer? No aplica: la inferencia está restringida a CPU.
- Entorno de evaluación: 2 vCPU, 16 GB de RAM, 15 minutos para todas las entradas, sin red.
- Límites del contenedor: imagen Linux x86-64, Python en `/usr/local/bin/python`, directorio de trabajo `/app`, build en menos de 30 minutos, repositorio de 4 GiB o menos, ningún fichero escrito por `predict.py` puede superar 16 MiB.
- Opciones de despliegue: Docker (obligatorio para el leaderboard); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a esta tarea.
- Latencia y throughput estimados: no disponibles; dependen del modelo que el participante entrene y del límite global de 15 minutos.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de clasificación enzimática ni datos de rendimiento de alternativas. El único punto de referencia es el baseline trivial descrito en la model card (EC más frecuente del entrenamiento), que no constituye un modelo comparable en el sentido habitual.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no soporta tool calling ni agentes; cualquier expectativa en ese sentido es incorrecta.
- La licencia no está declarada, lo que impide determinar si el uso comercial es posible; conviene contactar con el autor antes de reutilizarlo fuera de la competición.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado en menos de un minuto, lo que sugiere un artefacto de prueba o un envío inicial sin validación comunitaria.
- La model card describe el flujo de la competición, no las características del modelo: no hay información sobre arquitectura, datos de entrenamiento, sesgos o riesgos de alucinación.
- El evaluador impone restricciones estrictas (CPU, sin red, 15 minutos, formato JSON Lines exacto); un fallo de formato, un ID duplicado o un EC fuera de `ec_vocabulary.json` provoca el fallo de la evaluación.
- Solo el primer EC predicho puntúa; listar más de 10 ECs, duplicarlos o incluir ECs no permitidos invalida la evaluación.
- Los datos de validación y test son privados, por lo que no es posible verificar el rendimiento real del modelo a partir de la información pública.
- La fecha de creación indicada (2026-11-01) es futura respecto a la fecha habitual de consulta, lo que puede indicar un error en los metadatos o una fecha programada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sahithimacharapu2/my_graph2
- Repositorio starter del baseline: https://huggingface.co/starkAhmed43/leak-curber-enzyme-classification-starter
- Dataset de la competición: https://huggingface.co/datasets/starkAhmed43/leak-curber-enzyme-classification
- Leaderboard: https://huggingface.co/spaces/starkAhmed43/leak-curber-leaderboard
- Hoja de asignación de tareas: https://docs.google.com/spreadsheets/d/12c2PaYcNDpa6bA0JPmKi6tHsdV-EdFe2IYQ70RqpGRI/edit?usp=sharing
- Vocabulario EC (ExPASy ENZYME, CC BY 4.0): https://enzyme.expasy.org/
