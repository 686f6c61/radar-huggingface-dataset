# sinanalyuruk/trnews-splade-v1

## Resumen

trnews-splade-v1 es un recuperador léxico disperso (sparse retrieval) entrenado para texto de noticias en turco, desarrollado por Sinan Alyuruk (usuario sinanalyuruk en Hugging Face). Se trata de un fine-tune del modelo sinanalyuruk/trmteb-trnews-v1 orientado a SPLADE (Sparse Lexical and Expansion model), una familia de recuperadores neuronales que producen representaciones dispersas de alta dimensionalidad sobre un vocabulario fijo. El modelo resuelve la tarea de recuperación titular → resumen (headline → abstract) en dominio de noticias turcas, evaluada sobre el dataset batubayk/TR-News.

La innovación principal es su asimetría de rutas: los documentos se codifican una sola vez, fuera de línea, mediante pooling SPLADE sobre una cabeza MLM de tipo BERT y se podan a los 256 pesos de mayor valor; las consultas, en cambio, no pasan por ninguna red neuronal. Una consulta se tokeniza, se deduplican sus ids de token y cada id se busca en una tabla IDF congelada de 32.000 entradas. La recuperación es el producto escalar de ambos vectores dispersos, sin normalización, y solo se consideran aciertos las puntuaciones estrictamente positivas. Esto permite codificar una consulta en 0,017 ms en p50 y servir el índice localmente con NumPy/SciPy o sobre PostgreSQL con pgvector mediante el tipo sparsevec, sin necesidad de Torch ni GPU en el lado de consulta.

El modelo es relevante porque demuestra un compromiso explícito entre coste de servicio y calidad: supera a BM25 en ambas particiones de test, pero no sustituye al modelo denso de la comparativa. El propio autor documenta que incumple su criterio predeclarado de tolerancia de 2 puntos porcentuales frente al denso, con desviaciones de 0,2523 pp y 0,4024 pp sobre Recall@10 en las particiones controlada y con distractores respectivamente. El modelo tiene licencia MIT, soporta únicamente turco y ocupa 0,4 GB en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SPLADE sobre cabeza MLM de tipo BERT para documentos; consulta por tokenizador + tabla IDF congelada (sin forward pass) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (representaciones dispersas podadas a los 256 pesos superiores en la ruta de documento) |
| Idiomas soportados | turco (tr) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Vocabulario | 32.000 coordenadas compartidas por ambas rutas |
| Puntuacion | producto escalar sin normalizar; solo cuentan como aciertos las puntuaciones estrictamente positivas |
| Modelo base | sinanalyuruk/trmteb-trnews-v1 (relacion: finetune) |
| Dataset de entrenamiento | batubayk/TR-News |
| Tamano del repositorio | 0.4 GB |
| Servicio | indice local NumPy/SciPy o PostgreSQL + pgvector (sparsevec) |

## Arquitectura y entrenamiento

El modelo sigue el paradigma SPLADE. La ruta de documento aplica pooling SPLADE sobre una cabeza MLM de tipo BERT y genera un vector disperso sobre un vocabulario de 32.000 coordenadas, que posteriormente se poda a los 256 pesos de mayor valor. La ruta de consulta se desvía por completo de este esquema: no hay red neuronal ni forward pass. La consulta se tokeniza, sus ids de token se deduplican y cada id se resuelve contra una tabla IDF congelada de 32.000 entradas. Ambas rutas comparten el mismo espacio de 32.000 coordenadas y la afinidad se calcula como producto escalar sin normalizar.

El autor no detalla en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO. Sí se documenta que el checkpoint, el límite de poda, la ruta de consulta y los umbrales se seleccionaron sobre validación y se congelaron antes de tocar los datos de test, y que el criterio de aceptación se redactó con antelación y no se relajó después. El modelo se entrenó sobre el dataset batubayk/TR-News y parte del modelo base sinanalyuruk/trmteb-trnews-v1. No se describe ninguna innovación adicional como decodificación especulativa o atención lineal, ya que el modelo no genera texto.

## Capacidades

- Recuperación de texto en turco: dado un titular o consulta corta, devuelve documentos (resúmenes de noticias) ordenados por afinidad léxica dispersa.
- Codificación asimétrica: los documentos se codifican en lote fuera de línea; las consultas se resuelven con un tokenizador y una búsqueda en tabla IDF, sin red neuronal.
- Puntuación dispersa interpretable: el producto escalar sobre coordenadas del vocabulario permite inspeccionar qué términos contribuyen a la puntuación.
- Integración nativa con bases de datos: el autor describe despliegue sobre PostgreSQL con pgvector mediante el tipo sparsevec.
- Despliegue sin GPU ni Torch en la ruta de consulta, adecuado para entornos de servicio ligeros.
- Fusión híbrida: combinable con el modelo denso acompañante mediante reciprocal-rank fusion (profundidad 100 por rama, constante de rango 20, pesos iguales), con ganancias medidas en MRR@10.
- No soporta generación de texto, razonamiento, código, matemáticas, visión, tool calling ni agentes: es exclusivamente un recuperador.

## Casos de uso

- Buscador interno de noticias en turco: se indexan los resúmenes de artículos fuera de línea con la ruta SPLADE y se sirven consultas de usuario con coste de codificación de 0,017 ms en p50, lo que permite alta concurrencia sobre un único servidor sin GPU.
- Recuperación sobre PostgreSQL existente: si la organización ya usa PostgreSQL, se puede almacenar el vector disperso en una columna sparsevec de pgvector y resolver la búsqueda con una consulta SQL, evitando desplegar un servidor de modelos dedicado.
- Primera etapa de un pipeline de recuperación en dos fases: por su coste de consulta casi nulo y su buena cobertura léxica, sirve como recuperador inicial que alimenta un reordenador denso o cross-encoder posterior.
- Sistemas de recomendación de contenido periodístico: dado el titular o los términos de un artículo de interés, recuperar resúmenes relacionados para sugerir lecturas, con la ventaja de que el corpus se codifica una sola vez.
- Búsqueda en archivos históricos de prensa turca: el bajo coste por consulta y el despliegue sobre índices locales permiten consultar grandes volúmenes de documentos previamente codificados.
- Filtrado y deduplicación temática: la naturaleza léxica dispersa permite identificar documentos que comparten términos relevantes con una consulta dada, útil para agrupar coberturas de un mismo evento.
- Componente híbrido en producción: combinado con el modelo denso acompañante mediante fusión RRF, alcanza MRR@10 de 0,916608 en la partición controlada y 0,821364 en la partición con distractores, a cambio de asumir la latencia del codificador denso (p50 de 7,577 ms, p95 de 20,966 ms).
- Evaluación comparativa de recuperadores en turco: sirve como referencia reproducible frente a BM25 y a un recuperador denso sobre el mismo conjunto de datos, con artefactos y digests documentados en el repositorio.

## Benchmarks y rendimiento

Partición controlada (2000 documentos, 1998 consultas):

| Sistema | MRR@10 | Recall@10 | R@1 | nDCG@10 |
|---|---:|---:|---:|---:|
| BM25 | 0.794254 | 0.882883 | 0.748248 | 0.815766 |
| Este modelo | 0.892115 | 0.945445 | 0.862362 | 0.905210 |
| Denso coseno | 0.908869 | 0.967968 | 0.875375 | 0.923478 |

Partición con distractores (22000 documentos: las mismas consultas más 20000 resúmenes de entrenamiento sin etiquetar, 1998 consultas):

| Sistema | MRR@10 | Recall@10 | R@1 | nDCG@10 |
|---|---:|---:|---:|---:|
| BM25 | 0.660691 | 0.781782 | 0.601101 | 0.689908 |
| Este modelo | 0.790593 | 0.884885 | 0.741742 | 0.813519 |
| Denso coseno | 0.792882 | 0.908909 | 0.735235 | 0.820932 |

Intervalos de confianza (bootstrap agrupado por pares, 2000 remuestreos, 1998 grupos de relevancia por partición, 95 % nominal):

| Comparacion | Diferencia | Intervalo 95 % |
|---|---:|---|
| Controlada, este modelo − BM25, MRR@10 | +0.0979 | [+0.0862, +0.1099] |
| Controlada, este modelo − denso, Recall@10 | -0.0225 | [-0.0310, -0.0140] |
| Distractores, este modelo − denso, MRR@10 | -0.0023 | [-0.0151, +0.0107] |
| Distractores, este modelo − denso, Recall@10 | -0.0240 | [-0.0360, -0.0125] |

Fusion hibrida con el modelo denso (reutiliza el conjunto de test, divulgado por el autor): MRR@10 0.916608 / Recall@10 0.970470 en la partición controlada y 0.821364 / 0.918418 en la partición con distractores. La mejora en MR@10 sobre el denso en la partición con distractores es de +0.0285, con límite inferior de +0.0200.

## Requisitos de hardware

- La ruta de consulta no requiere GPU ni Torch: el producto escalar se resuelve en CPU con una tabla IDF congelada.
- Latencia medida de codificación de consulta (en caliente, CPU): 0,017 ms en p50 y 0,026 ms en p95.
- Latencia de búsqueda extremo a extremo (CPU, este modelo): 0,383 ms en p50 y 0,559 ms en p95 sobre 1998 documentos de validación, 200 consultas y top-10.
- Latencia de importación y carga en frío más primera codificación (CPU): 47,658 ms en p50 y 49,747 ms en p95.
- Comparativa de codificación con el modelo denso: 6,914 ms en p50 y 87,979 ms en p95 sobre Apple MPS (ratio p95 de 3383,81 solo de codificación; el ratio extremo a extremo en la misma ejecución es de 18,3x en p50).
- El autor advierte que la comparación de latencia entre rutas se hizo con backends distintos (denso en Apple MPS, disperso en CPU); no se realizó una comparación homogénea en CPU.
- Opciones de despliegue descritas: índice local NumPy/SciPy o PostgreSQL con pgvector mediante sparsevec. No se mencionan vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo.
- VRAM estimada para inferencia: no disponible (el servicio de consulta es en CPU).

## Comparativa con modelos similares

| Modelo | Tipo | MRR@10 controlada | Recall@10 controlada | MRR@10 distractores | Recall@10 distractores | Licencia | Disponibilidad |
|---|---|---:|---:|---:|---:|---|---|
| trnews-splade-v1 | Sparse SPLADE | 0.892115 | 0.945445 | 0.790593 | 0.884885 | MIT | Hugging Face |
| BM25 | Lexico clasico | 0.794254 | 0.882883 | 0.660691 | 0.781782 | no disponible | referencia de linea base |
| Denso coseno (modelo acompanante) | Recuperador denso | 0.908869 | 0.967968 | 0.792882 | 0.908909 | no disponible | usado como companion en la evaluacion |
| Fusion hibrida (este modelo + denso) | Hibrido RRF | 0.916608 | 0.970470 | 0.821364 | 0.918418 | MIT (componente disperso) | reutiliza el conjunto de test |

No se dispone de datos de otros recuperadores SPLADE en turco para comparar directamente. La implementación de referencia de SPLADE (naver/splade) es la base conceptual del enfoque, pero no se ofrecen metricas comparables en la informacion disponible.

## Limitaciones y advertencias

- No es un sustituto directo del modelo denso: Recall@10 queda 2,2523 pp por debajo del denso en la partición controlada y 2,4024 pp por debajo en la partición con distractores.
- El criterio de aceptación predeclarado (tolerancia de 2 pp) no se cumplió: las desviaciones fueron de 0,2523 pp y 0,4024 pp respectivamente, y el autor no lo relajó posteriormente.
- La partición con distractores tiene juicios de relevancia incompletos: los resúmenes añadidos nunca se juzgaron, por lo que algunos pueden ser relevantes y contarse como incorrectos. Es una prueba de estrés de tamaño de corpus, no un corpus de producción juzgado.
- El intervalo de MRR@10 frente al denso en la partición con distractores contiene el cero, por lo que no establece diferencia ni equivalencia.
- La fusión híbrida reutiliza el conjunto de test ya consumido por la ejecución independiente; es un seguimiento divulgado, no una confirmación independiente.
- La comparación de latencia mezcla backends (MPS para denso, CPU para disperso); no hay una comparación homogénea en CPU.
- Idiomas: únicamente turco. No hay soporte multilingüe declarado.
- La consulta no pasa por red neuronal, por lo que la expansión semántica depende de la tabla IDF congelada y de la calidad del vocabulario de 32.000 coordenadas.
- Los documentos deben codificarse previamente con la ruta SPLADE; el modelo no está pensado para codificar documentos en tiempo de consulta.
- Riesgo de sesgo y alucinación: no disponible en la información proporcionada. Al ser un recuperador léxico, no genera texto y no puede alucinar contenido, aunque puede devolver documentos poco relevantes si la consulta no comparte términos con el corpus.
- Licencia MIT: permite uso comercial, modificación y redistribución con atribución. No se documentan restricciones adicionales.
- No se especifican parámetros totales, longitud de contexto ni tipos de cuantización, lo que dificulta estimar recursos para la ruta de documento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sinanalyuruk/trnews-splade-v1
- Perfil del autor en Hugging Face: https://huggingface.co/sinanalyuruk
- Repositorio de referencia SPLADE (naver/splade, SIGIR21 y SIGIR22): https://github.com/naver/splade
- Dataset de entrenamiento batubayk/TR-News: https://huggingface.co/datasets/batubayk/TR-News
- Modelo base sinanalyuruk/trmteb-trnews-v1: https://huggingface.co/sinanalyuruk/trmteb-trnews-v1
- Documento de trazabilidad CLAIMS.md citado en la model card: no disponible como enlace directo en la informacion proporcionada
