# Legend7001/ec-homology-v18b

## Resumen

`ec-homology-v18b` es un sistema de clasificación enzimática publicado por el usuario Legend7001 en HuggingFace, presentado como entrega del proyecto DA3410 para la tarea de clasificación de enzimas "Leak CURBER". No es un modelo de lenguaje neuronal en el sentido habitual: se trata de un pipeline de búsqueda por homología con MMseqs2 combinado con un reranker basado en gradient boosting (HistGradientBoosting) que asigna códigos EC (Enzyme Commission) a secuencias proteicas.

El sistema busca cada secuencia de consulta contra una base de datos de secuencias de entrenamiento mediante MMseqs2 (sensibilidad 5.7, dos hilos, prefilter y align separados), genera candidatos EC a partir de los hits y puntúa cada candidato con un clasificador que usa exclusivamente evidencia de homología (bitscores relativos al mejor hit, identidad, cobertura, rango, acuerdo entre hits, ratio de longitud y competición con ECs hermanos). El autor indica explícitamente que no emplea priors de identidad EC como la frecuencia de EC.

El repositorio ocupa 0.4 GB e incluye binarios estáticos de MMseqs2 (AVX2 y SSE4.1), la base de datos MMseqs2 de las secuencias de entrenamiento, pesos del reranker en formato joblib/JSON y scripts de inferencia en CPU. Es relevante como referencia metodológica para pipelines de anotación enzimática con control de leakage, no como modelo generativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de homología (MMseqs2 search) + reranker gradient boosting (HistGradientBoostingClassifier) sobre features de homología |
| Parametros totales | no disponible (el reranker es un modelo tabular; no se publica recuento de parámetros) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada: secuencia proteica; no es modelo de contexto tokenizado) |
| Tipos de cuantizacion | no disponible (pesos en joblib/JSON, no cuantizables en el sentido habitual) |
| Idiomas soportados | no disponible (entrada biológica: secuencias de aminoácidos) |
| Licencia | no disponible |
| Formato de pesos | joblib (`weights/rerank_hgb.joblib`), JSON (`rerank_features.json`, `rerank_lr.json`, `train_ecs.json`, `baseline.json`) |

## Arquitectura y entrenamiento

El sistema es un pipeline en dos etapas. La primera es una búsqueda de homología con MMseqs2 (Steinegger y Söding, Nature Biotechnology 2017, GPLv3) a sensibilidad 5.7, ejecutada en dos hilos y con pasos de prefilter y align separados para evitar ejecución desde `/tmp`. Los ECs de los hits se convierten en candidatos. La segunda etapa es un clasificador gradient-boosted que puntúa cada candidato usando únicamente features derivados de la evidencia de homología: bitscores relativos al mejor hit, identidad, cobertura, rango, acuerdo entre hits, ratio de longitud y competición con ECs hermanos. El autor subraya que no se usan priors de identidad EC como la frecuencia de EC.

El reranker se entrenó con búsquedas out-of-fold de cada secuencia de entrenamiento contra las otras cuatro de cinco particiones agrupadas al 40% de identidad, un esquema diseñado para controlar el leakage entre folds. Se devuelve como predicción única el mejor candidato, ya que solo se puntúa el primer EC. El repositorio incluye además un reranker logístico más antiguo (`weights/rerank_lr.json`) usado solo como fallback, y un baseline EC de reserva (`weights/baseline.json`). La versión más reciente incorpora una tabla hash de UniProtKB/Swiss-Prot (release 2026_03, entradas con anotación EC) para responder entradas que aparecen literalmente en esa base de datos, con un caveat de leakage documentado en `EXTERNAL_DATA.md`.

## Capacidades

- Clasificación enzimática: asignación de códigos EC a secuencias proteicas mediante transferencia por homología.
- Búsqueda de homología offline con MMseqs2 sobre una base de datos local de secuencias de entrenamiento.
- Reranking de candidatos EC con un clasificador gradient-boosted basado solo en evidencia de homología.
- Respuesta directa desde tabla hash para entradas presentes literalmente en UniProtKB/Swiss-Prot (release 2026_03, entradas con EC).
- Inferencia en CPU, sin GPU, con binarios MMseqs2 estáticos (AVX2 y SSE4.1 seleccionados según `/proc/cpuinfo`).
- Guarda de tiempo y filtrado de vocabulario en `predict.py`.
- Fallback a reranker logístico y a EC de reserva si el pipeline principal no produce resultado.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto: no es un modelo de lenguaje.

## Casos de uso

- Anotación funcional de proteínas en pipelines bioinformáticos: el sistema recibe secuencias y devuelve un código EC por transferencia de homología, adecuado para enriquecer metagenomas o proteomas con anotación enzimática aproximada.
- Referencia metodológica para control de leakage: el esquema de folds agrupados al 40% de identidad y las búsquedas out-of-fold sirven como plantilla para evaluar clasificadores de proteínas sin filtración entre train y test.
- Baseline en competiciones de clasificación enzimática: el pipeline completo con MMseqs2 + reranker puede usarse como punto de partida reproducible en tareas tipo CAFA o Leak CURBER.
- Despliegue en entornos sin GPU: al ejecutarse en CPU con binarios estáticos, encaja en clústeres o contenedores sin aceleradores, con la guarda de tiempo como control de latencia.
- Preanotación de bases de datos internas: la tabla hash de Swiss-Prot permite resolver rápidamente entradas ya conocidas y reservar el pipeline de homología para secuencias novel.
- Estudio de sensibilidad de MMseqs2: los parámetros fijados (sensibilidad 5.7, dos hilos, prefilter/align separados) permiten reproducir y comparar configuraciones en experimentos de transferencia de anotación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Inferencia en CPU exclusivamente; el autor indica "offline CPU inference".
- Sin requisitos de VRAM: no se ejecuta en GPU.
- CPU con soporte AVX2 o, en su defecto, SSE4.1; el binario se selecciona desde `/proc/cpuinfo`.
- Dos hilos configurados para la búsqueda MMseqs2 (valor fijado en el pipeline).
- Espacio en disco: repositorio de 0.4 GB, incluyendo base de datos MMseqs2 y binarios; el índice k-mer se construye en tiempo de ejecución.
- Opciones de despliegue: ejecución directa de `predict.py` en Python con las dependencias del repositorio; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables).
- Latencia y throughput: no disponibles; existe una guarda de tiempo en `predict.py` cuyo umbral no se especifica en la información proporcionada.

## Comparativa con modelos similares

| Sistema | Tipo | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|
| ec-homology-v18b | Pipeline de homología + reranker tabular | MMseqs2 + gradient boosting sobre features de homología | no disponible | HuggingFace (Legend7001/ec-homology-v18b) |
| MMseqs2 (herramienta base) | Buscador de homología | Alineamiento y búsqueda de secuencias | GPLv3 | Código abierto (Steinegger y Söding, 2017) |
| Rerankers logísticos del propio repo | Reranker tabular | Regresión logística sobre features de homología | no disponible | Incluido como fallback en el mismo repositorio |

No se dispone de datos de rendimiento para establecer comparaciones cuantitativas con otros clasificadores enzimáticos.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona y no soporta tool calling ni agentes; cualquier uso en esos escenarios es inadecuado.
- Solo se puntúa y devuelve el primer EC; no se ofrece ranking completo ni predicciones multi-etiqueta.
- Dependencia crítica de la base de datos de entrenamiento: secuencias sin homología suficiente en `db/` no obtendrán candidatos fiables.
- La tabla hash de Swiss-Prot introduce riesgo de leakage si las entradas evaluadas coinciden literalmente con la base externa; el propio autor lo documenta en `EXTERNAL_DATA.md`.
- Licencia no especificada: no se puede confirmar el uso comercial; además, MMseqs2 es GPLv3 y la distribución de binarios estáticos puede arrastrar obligaciones de esa licencia.
- Sin información sobre sesgos, cobertura taxonómica del conjunto de entrenamiento ni dominios proteicos infrarrepresentados.
- Sin datos publicados de precisión, recall, cobertura ni latencia; no apto para producción sin evaluación propia.
- Idiomas y cuantización no aplican o no están disponibles; el sistema está pensado para secuencias de aminoácidos, no para texto.

## Enlaces

- HuggingFace: https://huggingface.co/Legend7001/ec-homology-v18b
- MMseqs2 (paper): Steinegger y Söding, Nature Biotechnology 2017 (referenciado en la model card; sin URL explícita en la información proporcionada)
- ExPASy ENZYME, release 02-Sep-2026, SIB, CC BY 4.0 (vocabulario EC; sin URL explícita en la información proporcionada)
- UniProtKB/Swiss-Prot release 2026_03 (fuente de la tabla hash; sin URL explícita en la información proporcionada)
- `EXTERNAL_DATA.md` (documentación de leakage; incluido en el repositorio, sin URL directa en la información proporcionada)
