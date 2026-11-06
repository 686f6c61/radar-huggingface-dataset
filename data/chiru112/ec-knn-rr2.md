# chiru112/ec-knn-rr2

## Resumen

`ec-knn-rr2` es un artefacto de predicción de números EC (Enzyme Commission) publicado en Hugging Face por el usuario `chiru112`. No es un modelo de lenguaje ni una red neuronal profunda: es un pipeline de recuperación basado en búsqueda de similitud con MMseqs2 sobre el conjunto de entrenamiento completo, seguido de una fase de reordenación mediante un clasificador de gradient boosting o, en su defecto, una votación ponderada por bit-score. El objetivo declarado es la tarea de clasificación enzimática del benchmark Leak CURBER.

El repositorio pesa 1,6 GB y contiene únicamente un artefacto serializado con `joblib`, lo que sugiere que los pesos del re-ranker y posiblemente el índice preconstruido de MMseqs2 viajan empaquetados en el mismo fichero. La model card describe un modo de ejecución concreto mediante un script `predict.py` que consume un Parquet de entrada y produce un JSONL de salida, con un mecanismo de *time guard* que aborta la búsqueda en máquinas lentas y recurre al EC más frecuente del conjunto de entrenamiento.

La relevancia de esta ficha es limitada para el ecosistema general de IA open source: se trata de una solución muy específica de un participante en un desafío de clasificación, sin licencia declarada, sin idiomas, sin pipeline asignado y sin métricas publicadas. Aun así, documentarla con rigor permite entender el patrón de diseño (retrieval + re-ranking) aplicado a anotación funcional de proteínas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de recuperación: búsqueda MMseqs2 sobre índice del training set + re-ranker de gradient boosting (o votación ponderada por bit-score) |
| Parametros totales | No disponible (el repo contiene un artefacto `joblib` de 1,6 GB; no se desglosa el número de parámetros del re-ranker) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (no es un modelo de lenguaje; la "entrada" es una secuencia proteica) |
| Tipos de cuantizacion | No disponible (no aplica cuantización de pesos de red) |
| Idiomas soportados | No disponible (la entrada es secuencia de aminoácidos, no texto natural) |
| Licencia | No disponible |
| Formato de pesos | `joblib` (serialización Python); índice MMseqs2 preconstruido empaquetado en el repo |

## Arquitectura y entrenamiento

El sistema sigue un esquema de *retrieval-augmented classification*. Para cada secuencia de entrada única se ejecuta una búsqueda MMseqs2 contra un índice preconstruido del conjunto de entrenamiento completo. Los EC candidatos se extraen de los hits mejor puntuados y se ordenan mediante un re-ranker de gradient boosting (cuando está incluido en el artefacto) o, alternativamente, mediante una votación ponderada por bit-score. La salida es una lista de EC ordenada de mejor a peor, y se selecciona el primero como predicción final.

No se especifican en la información disponible el número de tokens de entrenamiento (no aplica), la composición del dataset, ni si hubo ajuste fino con RLHF/DPO (no aplica). Tampoco se detalla la configuración de MMseqs2 (sensibilidad, e-value, número de hits recuperados) ni los hiperparámetros del gradient boosting. La innovación operativa destacable es el *time guard*: un mecanismo que monitoriza el tiempo de ejecución y, si la máquina es lenta, deja de buscar y asigna el EC más frecuente del training set a las entradas restantes (las más largas), garantizando que el pipeline termine dentro de un presupuesto temporal.

## Capacidades

- Predicción de números EC (Enzyme Commission) a partir de secuencias proteicas.
- Recuperación de homólogos mediante MMseqs2 contra un índice del conjunto de entrenamiento.
- Reordenación de candidatos EC mediante gradient boosting o votación ponderada por bit-score.
- Salida en formato de lista ordenada best-first de códigos EC.
- Fallback determinista: asigna el EC más frecuente del training set cuando no hay hit.
- Control de tiempo de ejecución mediante *time guard* con fallback para entradas lentas.
- Ejecución CPU-only, sin requisito de GPU.
- No soporta tool calling, agentes, multi-step reasoning, visión, audio ni capacidades multilingües de texto natural.

## Casos de uso

- Anotación funcional a gran escala de proteínas no caracterizadas: dado un proteoma completo en Parquet, el pipeline asigna un EC por secuencia en CPU, lo que permite procesar lotes grandes sin infraestructura GPU.
- Priorización en pipelines de metagenómica: usar la lista best-first de EC para seleccionar candidatos a validación experimental, aprovechando que los hits MMseqs2 aportan evidencia de homología.
- Baseline reproducible para benchmarks de clasificación enzimática: el artefacto empaqueta índice y re-ranker, de modo que se puede reproducir la predicción sobre el conjunto de Leak CURBER sin reentrenar.
- Filtrado previo en anotación manual: descartar secuencias con EC de alta confianza y derivar solo las ambiguas (sin hit o con votación débil) a revisión por curator.
- Entornos con restricciones de hardware: al ser CPU-only y con *time guard*, encaja en servidores sin GPU o en contenedores con límite de tiempo estricto.
- Docencia y experimentación con esquemas retrieval + re-ranking: sirve como ejemplo mínimo de pipeline de clasificación basado en búsqueda de similitud en lugar de un transformer supervisado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona la tarea Leak CURBER pero no reporta métricas (accuracy, F1, precisión@k) ni comparaciones con otros sistemas.

## Requisitos de hardware

- Inferencia CPU-only por diseño; no requiere GPU.
- VRAM estimada: 0 GB (no usa GPU).
- GPU recomendadas: no aplica.
- Cabe en cualquier GPU consumer: no aplica; el cuello de botella es CPU y memoria RAM.
- Memoria RAM: no disponible con precisión; el repo pesa 1,6 GB y MMseqs2 carga el índice en memoria, por lo que se recomienda al menos varios GB de RAM libre (valor orientativo, no confirmado en la información).
- Opciones de despliegue: ejecución directa con `python /app/predict.py --input INPUT.parquet --output OUTPUT.jsonl`; requiere MMseqs2 instalado en el entorno.
- Latencia y throughput: no disponibles; dependen del tamaño del índice, del número de secuencias de entrada y de la sensibilidad configurada en MMseqs2. El *time guard* acota el tiempo total pero no se documenta el umbral.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (retrieval + re-ranking para predicción EC) con parámetros, contexto, rendimiento y licencia documentados.

## Limitaciones y advertencias

- Sesgos conocidos: el fallback asigna el EC más frecuente del training set, lo que introduce un sesgo hacia las clases mayoritarias en entradas sin hit.
- Riesgo de alucinación: no aplica en el sentido de LLM, pero el sistema puede producir un EC incorrecto con alta apariencia de confianza cuando el hit MMseqs2 es espurio o el re-ranker sobreajusta.
- Limitaciones de contexto o idioma: no aplica contexto de texto; la entrada debe ser una secuencia proteica válida en el Parquet de entrada.
- Restricciones de licencia: no hay licencia declarada, por lo que el uso comercial no está autorizado de forma explícita y requiere contactar con el autor.
- El *time guard* puede degradar la calidad de forma no determinista según la máquina: dos ejecuciones en hardware distinto pueden producir predicciones diferentes para las entradas más largas.
- No se documentan hiperparámetros de MMseqs2 ni del re-ranker, lo que dificulta la reproducibilidad exacta.
- El repo no declara pipeline, idiomas ni métricas; la integración en producción exige validación propia.
- El artefacto `joblib` debe cargarse solo desde fuentes de confianza: la deserialización de `joblib`/`pickle` puede ejecutar código arbitrario.

## Enlaces

- [Hugging Face: chiru112/ec-knn-rr2](https://huggingface.co/chiru112/ec-knn-rr2)
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información disponible.
