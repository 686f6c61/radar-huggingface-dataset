# sahithimacharapu2/newer_version

## Resumen

`sahithimacharapu2/newer_version` es un repositorio de Hugging Face publicado como modelo de arranque ("starter model") para la tarea de clasificación de enzimas del leaderboard Leak CURBER. No se trata de un modelo de lenguaje generativo, sino de una plantilla reproducible que incluye un `Dockerfile`, un `predict.py` y un `README.md` con las reglas de la competición. El objetivo es que el participante sustituya el baseline trivial (predecir siempre el EC más frecuente del conjunto de entrenamiento) por un clasificador real de números EC a partir de secuencias de aminoácidos.

El repositorio ocupa 0,1 GB y contiene pesos en formato safetensors, aunque la model card no describe ninguna arquitectura concreta ni parámetros del modelo. Las etiquetas del repo (`leak-curber`, `enzyme`, `leaderboard`) confirman su naturaleza de entrega para un reto de evaluación, no de modelo preentrenado listo para uso general.

Su relevancia ahora es acotada: sirve como punto de partida verificable para quien quiera participar en el leaderboard, con un pipeline de evaluación cerrado (CPU, 2 vCPU, 16 GB RAM, 15 minutos, sin red) y una métrica claramente definida (top-1 accuracy a niveles EC L1-L4, ordenando por L4).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio es una plantilla de inferencia; la model card no declara arquitectura) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible (la tarea es clasificación de secuencias, no generación) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (entrada: secuencias de aminoácidos; salida: códigos EC) |
| Licencia | no disponible |
| Formato de pesos | safetensors (según tags del repo); el baseline distribuido usa `weights/baseline.json` |

## Arquitectura y entrenamiento

La información disponible no describe una arquitectura de red concreta. El repositorio se presenta como un "starter model" para la tarea de clasificación enzimática: el participante entrena su propio modelo en local y lo sube a un repositorio público de Hugging Face para que el evaluador del leaderboard lo ejecute. El baseline incluido ignora la secuencia de entrada y predice el EC más frecuente del conjunto de entrenamiento, por lo que no hay aprendizaje real de la secuencia en el punto de partida.

El flujo de entrenamiento no está detallado en la model card: no se especifican tokens, composición del dataset, ni técnicas de ajuste (RLHF, DPO u otras). Lo que sí se documenta es el contrato de evaluación: entrada en Parquet con columnas `id` y `sequence`, salida en JSON Lines con claves `id` y `prediction` (lista de ECs distintos, el primero es el que puntúa), vocabulario cerrado en `ec_vocabulary.json` (ExPASy ENZYME, release 02-Sep-2026, CC BY 4.0), y agrupación de entradas idénticas por split para puntuar cada entrada única una sola vez.

## Capacidades

- Clasificación de secuencias de aminoácidos en números EC (hasta 10 predicciones por entrada, solo la primera puntúa).
- Predicción a cuatro niveles jerárquicos de EC: L1, L2, L3 y L4 (siendo L4 el criterio de ordenación del leaderboard).
- Manejo de etiquetas múltiples por entrada: si una entrada tiene n ECs registrados, la primera predicción obtiene 1/n por cada EC cuyo primer componente L coincida.
- Ejecución en CPU pura, sin GPU y sin red, dentro del contenedor de evaluación.
- Empaquetado reproducible mediante `Dockerfile` (imagen Linux x86-64, Python en `/usr/local/bin/python`, directorio de trabajo `/app`).
- No se documentan capacidades de generación de texto, razonamiento general, código, matemáticas, visión, tool calling, agentes ni multilingüismo.

## Casos de uso

- Participación en el leaderboard Leak CURBER: el repositorio sirve como punto de partida para subir un modelo propio y obtener una puntuación de validación en la pestaña de clasificación de enzimas.
- Anotación automática de enzimas en pipelines de bioinformática: dado un conjunto de secuencias en Parquet, generar predicciones EC en JSON Lines para priorizar revisiones manuales.
- Prototipado rápido de clasificadores de proteínas: el contrato de entrada/salida y el script `inputs.py` permiten agrupar entradas únicas y evaluar modelos propios sin reimplementar la lógica de puntuación.
- Benchmarking interno de modelos de clasificación enzimática: la métrica top-1 a L1-L4 y el ranking por L4 ofrecen una comparación estandarizada entre aproximaciones.
- Docencia y experimentación con competiciones de ML: el entorno cerrado (CPU, 16 GB, 15 minutos, sin red) es un caso realista de restricciones de producción para modelos ligeros.
- Integración en flujos MLOps de evaluación: el uso de Docker con límites de build (30 minutos, repo ≤ 4 GiB) y de salida (≤ 16 MiB por fichero) sirve como plantilla de empaquetado reproducible.
- Sustitución del baseline trivial: el propio repositorio documenta cómo reemplazar `predict.py`, `Dockerfile` y `requirements.txt` por un modelo entrenado con cualquier librería.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente describe la métrica del leaderboard (top-1 accuracy a L4, L3, L2 y L1, con ordenación por L4 y desempate a favor del envío anterior) y el comportamiento del baseline (predice el EC más frecuente del entrenamiento), pero no incluye cifras de rendimiento del modelo del repositorio ni de alternativas.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; la evaluación se ejecuta exclusivamente en CPU.
- GPU recomendadas: ninguna; el evaluador no proporciona GPU.
- Cabe en consumer GPU: no aplica (no se ejecuta en GPU).
- Entorno de evaluación: 2 vCPU, 16 GB de RAM, 15 minutos para todos los inputs, sin red.
- Límites de empaquetado: imagen Linux x86-64, build en menos de 30 minutos, repositorio ≤ 4 GiB, ficheros de salida ≤ 16 MiB.
- Opciones de despliegue: Docker (obligatorio para el leaderboard); el repositorio incluye `Dockerfile`, `requirements.txt` y `predict.py`.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (clasificadores de enzimas para el leaderboard Leak CURBER) ni datos de rendimiento que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- El repositorio es una plantilla de competición, no un modelo preentrenado listo para producción; el baseline incluido ignora la secuencia y predice siempre el EC más frecuente.
- No se declara licencia, lo que impide evaluar restricciones de uso comercial.
- No se especifican idiomas soportados ni arquitectura, parámetros o datos de entrenamiento.
- El vocabulario de ECs está cerrado a `ec_vocabulary.json` (ExPASy ENZYME, release 02-Sep-2026); predecir un EC fuera de ese fichero invalida la evaluación.
- Solo la primera predicción puntúa; listar hasta 10 ECs no mejora la puntuación.
- Una predicción vacía puntúa cero.
- Las entradas duplicadas se agrupan por split y solo se predice el primer ID; predecir IDs repetidos invalida el envío.
- Límites estrictos del leaderboard: 2 envíos por día y 20 en total por tarea; solo una evaluación activa a la vez; los fallos consumen cuota.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de sobreajuste al conjunto de entrenamiento y de predicciones fuera de vocabulario si no se valida la salida.
- El entorno de evaluación no tiene red: cualquier dependencia descargada en tiempo de inferencia provoca fallo.

## Enlaces

- Repositorio del modelo: https://huggingface.co/sahithimacharapu2/newer_version
- Repositorio starter de referencia: https://huggingface.co/starkAhmed43/leak-curber-enzyme-classification-starter
- Dataset de la competición: https://huggingface.co/datasets/starkAhmed43/leak-curber-enzyme-classification
- Leaderboard: https://huggingface.co/spaces/starkAhmed43/leak-curber-leaderboard
- Hoja de asignación de tareas: https://docs.google.com/spreadsheets/d/12c2PaYcNDpa6bA0JPmKi6tHsdV-EdFe2IYQ70RqpGRI/edit?usp=sharing
- Vocabulario EC (ExPASy ENZYME, CC BY 4.0): https://enzyme.expasy.org/
