# Hanuboii/ec_model

## Resumen

`Hanuboii/ec_model` es un modelo de clasificación enzimática publicado en Hugging Face como participante del reto Leak CURBER. La tarea consiste en predecir el número EC (Enzyme Commission) correspondiente a una secuencia de aminoácidos de una enzima, devolviendo una lista ordenada de hasta diez códigos EC candidatos. El repositorio ocupa 1,7 GB y contiene pesos en formato safetensors, aunque la model card no describe la arquitectura interna ni los datos de entrenamiento empleados.

El modelo sigue el formato de entrega del reto: se ejecuta en CPU dentro de un contenedor Docker con 2 vCPU, 16 GB de RAM y un límite de 15 minutos para procesar todos los inputs. No se publican parámetros, longitud de contexto ni idiomas soportados, ya que la naturaleza de la tarea es puramente de clasificación sobre secuencias biológicas y no de generación de lenguaje.

La relevancia de esta ficha es acotada: se trata de un artefacto de competición con cero descargas y cero likes en el momento de la consulta, sin licencia declarada y sin resultados de benchmarks públicos más allá de la métrica top-1 a niveles L1-L4 que define el propio leaderboard. Cualquier uso en producción debería considerar estas carencias documentales como un riesgo significativo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo. La model card únicamente describe el formato de entrada (Parquet con columnas `id` y `sequence`), el formato de salida (JSON Lines con `id` y `prediction`) y las restricciones de ejecución del entorno de evaluación. No se especifica si se trata de un transformer, una red convolucional sobre embeddings de proteínas, un modelo basado en ESM, o cualquier otra familia.

Tampoco se documentan los datos de entrenamiento: número de secuencias, composición del dataset, uso de `train.parquet` del reto Leak CURBER, técnicas de aumento de datos, ni si hubo ajuste fino supervisado o aprendizaje por transferencia desde un modelo preentrenado. El vocabulario de ECs procede de ExPASy ENZYME (release 02-Sep-2026, licencia CC BY 4.0), según indica la model card, pero eso describe el etiquetado del reto, no el entrenamiento del modelo.

## Capacidades

- Clasificación de secuencias de aminoácidos en códigos EC de cuatro niveles (L1 a L4).
- Predicción de hasta 10 códigos EC distintos por secuencia, ordenados de mejor a peor.
- Manejo de inputs con múltiples ECs registrados, puntuando parcialmente según coincidencia del primer componente.
- Ejecución en CPU sin GPU ni acceso a red, dentro de un contenedor Docker con límites estrictos de tiempo y memoria.
- No se documentan capacidades de generación de texto, razonamiento general, código, matemáticas, visión, tool calling, agentes ni multilingüismo.

## Casos de uso

- Anotación automática de enzimas en pipelines de metagenómica: el modelo puede recibir secuencias proteicas y devolver candidatos EC para priorizar la validación experimental, aunque su falta de documentación exige una evaluación previa contra un conjunto de referencia propio.
- Enriquecimiento de bases de datos biológicas: integración como paso de clasificación en un ETL que procese lotes de secuencias y escriba predicciones EC en un campo adicional, siempre con revisión humana posterior.
- Triaje en descubrimiento de enzimas: uso de las predicciones top-k para filtrar candidatos antes de ensayos in vitro, aprovechando que el formato admite hasta 10 ECs ordenados.
- Participación en el leaderboard Leak CURBER: el modelo está empaquetado para el formato de entrega del reto, por lo que sirve como punto de partida o comparativa frente a otros participantes.
- Docencia y experimentación en bioinformática: útil como ejemplo de pipeline de clasificación con restricciones de CPU y Docker, aunque no como referencia metodológica por la ausencia de detalles técnicos.
- Prototipado de herramientas internas de anotación: despliegue en un contenedor con 2 vCPU y 16 GB de RAM para validar la viabilidad de un flujo de clasificación enzimática antes de invertir en un modelo mejor documentado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card define la métrica del reto (top-1 accuracy a niveles L4, L3, L2 y L1, con ranking por L4) pero no incluye puntuaciones del modelo ni comparaciones con el baseline ni con otros participantes.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica, el modelo está diseñado para ejecutarse en CPU.
- GPU recomendadas: no aplica; el entorno de evaluación no proporciona GPU.
- Cabe en GPU consumer: no relevante para el caso de uso previsto.
- Opciones de despliegue: contenedor Docker con Python en `/usr/local/bin/python`, directorio de trabajo `/app`, comando `python /app/predict.py --input INPUT --output OUTPUT`. Sin red y sin GPU.
- Límites del entorno: 2 vCPU, 16 GB de RAM, 15 minutos para todos los inputs, imagen construida en menos de 30 minutos, repositorio de 4 GiB o menos, ningún fichero de salida mayor de 16 MiB.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (clasificación enzimática sobre secuencias de aminoácidos) con parámetros, contexto, rendimiento y licencia verificables. El baseline del reto (predictor de la EC más frecuente en entrenamiento) es la única referencia citada, y no es un modelo comparable en el sentido técnico.

## Limitaciones y advertencias

- Ausencia total de documentación técnica: no se especifican arquitectura, parámetros, datos de entrenamiento ni metodología, lo que impide evaluar su robustez o reproducibilidad.
- Licencia no declarada: no se puede asumir uso comercial permitido; cualquier despliegue en producción requiere aclaración previa con el autor.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso ni validación por parte de la comunidad.
- Riesgo de sobreajuste al conjunto de entrenamiento del reto: al ser un artefacto de competición, el rendimiento en distribución real puede diferir del reportado en validación.
- Solo se puntúa la primera predicción EC en el leaderboard, por lo que el resto de la lista de hasta 10 candidatos no mejora la métrica oficial y su utilidad práctica no está validada.
- Restricciones de ejecución estrictas (CPU, sin red, 15 minutos, 16 GB de RAM) que limitan el tamaño y la complejidad del modelo desplegable.
- No se documentan sesgos, cobertura taxonómica ni comportamiento ante secuencias fuera de distribución.
- El vocabulario EC procede de ExPASy ENZYME release 02-Sep-2026; predicciones sobre códigos ausentes de `ec_vocabulary.json` se consideran inválidas en el reto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hanuboii/ec_model
- Repositorio starter del reto: https://huggingface.co/starkAhmed43/leak-curber-enzyme-classification-starter
- Dataset del reto: https://huggingface.co/datasets/starkAhmed43/leak-curber-enzyme-classification
- Leaderboard Leak CURBER: https://huggingface.co/spaces/starkAhmed43/leak-curber-leaderboard
- Hoja de asignación de tareas: https://docs.google.com/spreadsheets/d/12c2PaYcNDpa6bA0JPmKi6tHsdV-EdFe2IYQ70RqpGRI/edit?usp=sharing
- ExPASy ENZYME (vocabulario EC, CC BY 4.0): https://enzyme.expasy.org/
