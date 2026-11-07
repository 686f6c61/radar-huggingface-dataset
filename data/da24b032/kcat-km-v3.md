# da24b032/kcat-km-v3

## Resumen

kcat-km-v3 es un modelo de tipo "starter" publicado por el usuario da24b032 en Hugging Face, pensado como punto de partida para la tarea conjunta de predicción de kcat y Km en el marco del leaderboard Leak CURBER. No se trata de un modelo de lenguaje ni de un transformer preentrenado: el repositorio contiene los artefactos necesarios (pesos en safetensors, scripts de inferencia y Dockerfile) para participar en una competición de predicción de parámetros cinéticos enzimáticos a partir de la secuencia de la proteína y el SMILES del sustrato.

La tarea consiste en predecir dos valores numéricos: log10_kcat y log10_km, a partir de un fichero Parquet con columnas `id`, `smiles` y `sequence`. La evaluación se realiza mediante correlación de rangos de Spearman (SCC) y RMSE por objetivo, y el ranking del leaderboard se ordena por la media de las dos SCC. El modelo se ejecuta exclusivamente en CPU, con un límite de 2 vCPUs, 16 GB de RAM y 15 minutos para el conjunto completo de entradas.

El repositorio es de pequeño tamano (0,7 GB) y está etiquetado con `safetensors`, `leak-curber`, `kcat`, `km` y `leaderboard`. No se dispone de información pública sobre arquitectura, número de parámetros ni datos de entrenamiento más allá de lo que describe la model card, que se limita a indicar que es un "starter model" para que el participante entrene y suba su propia versión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo en la model card ni en los resultados de búsqueda. El repositorio se describe como un "starter model" para la tarea conjunta kcat–Km, y la model card indica que el participante debe entrenar su propio modelo y subirlo a un repositorio público de Hugging Face para enviarlo al leaderboard. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o similares.

El baseline descrito en la model card es una regresión ridge con dos salidas (una por objetivo) cuyas características son la longitud de la secuencia, la longitud del SMILES, las frecuencias de aminoácidos y las frecuencias de caracteres del SMILES, entrenada únicamente con el split de entrenamiento. No obstante, no queda claro si los pesos safetensors del repositorio corresponden a este baseline, a un modelo distinto o a un artefacto auxiliar, por lo que este punto debe considerarse no disponible.

## Capacidades

- Predicción de dos valores numéricos continuos: log10_kcat y log10_km, a partir de una secuencia proteica y un SMILES de sustrato.
- Procesamiento de entradas en formato Parquet con columnas `id`, `smiles` y `sequence`.
- Generación de salidas en CSV con columnas `id`, `log10_kcat`, `log10_km`.
- Ejecución en CPU sin GPU ni red, con límites estrictos de recursos (2 vCPUs, 16 GB RAM, 15 minutos).
- Empaquetado en contenedor Docker con Python en `/usr/local/bin/python` y directorio de trabajo `/app`.
- Integración con el leaderboard Leak CURBER mediante envío del repositorio público.
- No se ha documentado soporte de tool calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües.

## Casos de uso

- Participación en el leaderboard Leak CURBER: el modelo sirve como punto de partida para que equipos de investigación en biología computacional entrenen y envíen sus propias variantes a la competición de predicción kcat–Km.
- Predicción de parámetros cinéticos enzimáticos en pipelines de anotación: dado un par proteína–sustrato, el modelo puede estimar log10_kcat y log10_km para priorizar experimentos in vitro en proyectos de ingeniería de enzimas.
- Filtrado previo en cribados de biocatálisis: usar las predicciones como señal de ranking (SCC) para seleccionar candidatos antes de ensayos experimentales costosos.
- Docencia y formación en machine learning aplicado a bioquímica: el repositorio incluye scripts de entrenamiento, inferencia y Docker, lo que facilita su uso en cursos y talleres reproducibles.
- Benchmarking de modelos de regresión multiobjetivo: la métrica de SCC media permite comparar enfoques alternativos (ridge, gradient boosting, redes neuronales) sobre un mismo split público.
- Desarrollo de herramientas de despliegue en entornos restringidos: el contenedor Docker con límites de CPU, memoria y tiempo sirve como plantilla para empaquetar modelos ligeros en infraestructuras sin GPU.
- Reproducibilidad de baselines: el script `train.py` permite regenerar el baseline ridge y verificar la pipeline de evaluación antes de invertir en modelos más complejos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo se ejecuta exclusivamente en CPU.
- GPU recomendadas: no aplica; el evaluador no proporciona GPU.
- Cabida en GPU de consumo: no aplica.
- Opciones de despliegue: Docker (obligatorio para el leaderboard), con Python en `/usr/local/bin/python`, directorio de trabajo `/app` y comando `python /app/predict.py --input INPUT --output OUTPUT`.
- Límites de ejecución: 2 vCPUs, 16 GB de RAM, 15 minutos para todas las entradas, sin red, imagen construida en menos de 30 minutos, repositorio de 4 GiB o menos y ficheros de salida de 16 MiB o menos.
- Latencia y throughput estimados: no disponibles; dependen del modelo concreto que se entrene y del tamano del conjunto de entradas.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| da24b032/kcat-km-v3 | Starter model para kcat–Km | no disponible | no disponible | MIT | Hugging Face |
| VedaVachan/kcat-km-v3 | Modelo para kcat–Km | no disponible | no disponible | no disponible | Hugging Face |
| DLcatalysis (wnkAI) | Modelo deep learning para kcat/Km con EC number | no disponible | no disponible | no disponible | GitHub |

La comparativa se limita a la existencia de alternativas en el mismo dominio; no se dispone de datos de rendimiento, parámetros ni contexto para establecer una comparación cuantitativa rigurosa.

## Limitaciones y advertencias

- La model card no documenta la arquitectura, el número de parámetros ni el proceso de entrenamiento, lo que impide evaluar su robustez y generalización.
- El modelo está diseñado para un leaderboard con límites muy estrictos de CPU, memoria y tiempo; no es adecuado para inferencia en producción a gran escala sin rediseño.
- La evaluación se realiza sobre datos privados de validación y test, por lo que el rendimiento real fuera del leaderboard es desconocido.
- No se especifican sesgos conocidos, pero al tratarse de un modelo entrenado sobre datos de cinética enzimática, es probable que herede sesgos de cobertura taxonómica y química del dataset original.
- Riesgo de alucinación: no aplica en el sentido de generación de texto; sin embargo, las predicciones numéricas pueden ser poco fiables fuera de la distribución de entrenamiento.
- Restricciones de licencia: MIT permite uso comercial, pero el modelo se distribuye como artefacto de competición y no se ofrece ninguna garantía de idoneidad.
- El repositorio no incluye información sobre idiomas ni sobre capacidades multilingües, ya que la tarea es puramente numérica y no lingüística.
- El envío al leaderboard requiere cuenta de Hugging Face aprobada y está limitado a 2 envíos diarios y 20 en total por tarea, con fecha límite del 7 de noviembre de 2026 a las 23:59 IST.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/da24b032/kcat-km-v3
- Modelo alternativo en Hugging Face: https://huggingface.co/VedaVachan/kcat-km-v3
- Repositorio DLcatalysis en GitHub: https://github.com/wnkAI/DLCatalysis
- Leaderboard Leak CURBER: https://huggingface.co/spaces/starkAhmed43/leak-curber-leaderboard
- Dataset de la competición: https://huggingface.co/datasets/starkAhmed43/leak-curber-kcat-km
- Modelo starter de referencia: https://huggingface.co/starkAhmed43/leak-curber-kcat-km-starter
- Hoja de asignación de tareas: https://docs.google.com/spreadsheets/d/12c2PaYcNDpa6bA0JPmKi6tHsdV-EdFe2IYQ70RqpGRI/edit?usp=sharing
