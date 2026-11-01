# Ramanagopal/enzyme-retrieval-v6

## Resumen

Enzyme Retrieval v6 es un modelo de recuperación neuronal especializado en la predicción de números EC (Enzyme Commission) completos a partir de reacciones químicas representadas como SMILES. Lo desarrolla el usuario Ramanagopal y se publica en Hugging Face como un artefacto de inferencia autocontenido en formato joblib. No es un modelo de lenguaje generativo, sino un sistema híbrido de recuperación y clasificación que combina búsqueda por similitud textual, índices de conectividad molecular aproximada, un clasificador neuronal de embeddings KNN y un ranker de candidatos basado en gradient boosting.

El modelo se distribuye como un pipeline de inferencia completo: los pesos incluyen todos los activos necesarios (índices de recuperación, redes neuronales y calibración), de modo que la predicción se ejecuta en CPU sin red, sin GPU, sin modelos externos y sin acceso al dataset de entrenamiento. El repositorio ocupa 0,3 GB y contiene cuatro artefactos joblib (`model.joblib`, `hybrid.joblib`, `neural.joblib`, `hierarchy.joblib`).

La relevancia de esta versión radica en la incorporación de una capa jerárquica: un clasificador neuronal separado para prefijos EC de tres dígitos y un ranker supervisado con 48 características que selecciona un único EC completo permitido. Según la model card, la versión V5 obtuvo una puntuación oficial L4 de 0,546097133429573; V6 no dispone todavía de puntuación oficial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: recuperación textual + KNN sobre embeddings neuronales + clasificador EC de dos capas ocultas + clasificador de prefijos EC + ranker gradient-boosted |
| Parametros totales | No disponible (el artefacto pesa 0,3 GB; no se desglosa el número de parámetros) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no es un modelo de contexto; procesa una reacción SMILES por predicción) |
| Tipos de cuantizacion | No disponible (pesos serializados en joblib; no se documentan cuantizaciones) |
| Idiomas soportados | No disponible (la entrada es SMILES, no texto natural) |
| Licencia | No disponible |
| Formato de pesos | joblib (`model.joblib`, `hybrid.joblib`, `neural.joblib`, `hierarchy.joblib`) |

## Arquitectura y entrenamiento

El sistema es un ensemble de recuperación y clasificación. La recuperación textual y de conectividad de V5 se mantiene: búsqueda sobre cambios de texto con signo, cambios de texto positivos y negativos, e índices de cambios de grafo aproximados, que permiten encontrar reacciones fuera de los 40 vecinos textuales originales. Sobre esa base, V6 añade un clasificador neuronal para prefijos EC de tres dígitos con capas ocultas ReLU de 128 y 64 unidades, cuyas probabilidades se suman de forma consistente para obtener evidencia L2 y L1. El ranker final es un modelo gradient-boosted entrenado con 48 características de confianza, jerarquía, vecindad, prevalencia y longitud de reacción, con una función objetivo que otorga crédito total a la coincidencia EC exacta y crédito parcial a coincidencias de prefijo L3, L2 y L1.

El entrenamiento se realiza offline antes de la subida y nunca forma parte del build de Docker. Según la model card, `fit_hierarchy.py` reconstruye predicciones de componentes sobre 11.000 reacciones públicas reservadas, ajusta el ranker final sobre esas predicciones fuera de muestra, afina el clasificador de prefijos sobre registros públicos de entrenamiento y construye el índice completo de cambios de grafo. Los índices finales contienen las 63.280 reacciones únicas de entrenamiento público. No se utilizan etiquetas privadas de validación. El parser de conectividad es aproximado, ignora la estereoquímica y no implementa un saneamiento químico completo.

## Capacidades

- Predicción de un número EC completo y permitido por reacción SMILES, con salida JSONL de exactamente `id` y `prediction`.
- Recuperación por similitud textual y de conectividad molecular aproximada sobre 63.280 reacciones de entrenamiento.
- Clasificación neuronal de embeddings con KNN para vecinos en el espacio latente.
- Clasificación jerárquica de prefijos EC (L1, L2, L3) con agregación consistente de probabilidades.
- Ranking supervisado de candidatos con 48 características y selección de un único EC final.
- Inferencia exclusiva en CPU, sin red, sin GPU y sin dependencias de modelos externos.
- Agrupación por reacción única: se preserva el primer ID original y el orden de entrada; SMILES equivalentes con distinto orden se tratan como claves distintas.
- Verificación local de salida mediante `verify_submission.py`.

## Casos de uso

- Anotación automática de enzimas en bases de datos de reacciones: el modelo asigna un EC completo a cada SMILES de reacción, lo que permite etiquetar catálogos metabólicos o repositorios de biotransformaciones sin intervención manual.
- Curación de datos para pipelines de biología computacional: al devolver un único EC permitido y verificar la salida con `verify_submission.py`, se integra como paso de validación en flujos ETL de reacciones.
- Participación en competiciones y benchmarks de predicción de EC: el formato de entrada/salida (parquet de entrada, JSONL de salida) y el entry point `predict.py` están diseñados para evaluadores automáticos y leaderboards.
- Enriquecimiento de bases de datos internas de enzimas: la recuperación sobre 63.280 reacciones públicas permite asignar EC a reacciones nuevas por vecindad textual y de grafo, con el ranker resolviendo entre candidatos.
- Despliegue en entornos sin GPU: al ejecutarse íntegramente en CPU y sin red, es adecuado para servidores modestos, contenedores ligeros o entornos aislados donde no se dispone de aceleradores.
- Reproducibilidad y auditoría científica: los scripts `train.py`, `fit_hybrid.py`, `fit_neural.py` y `fit_hierarchy.py` permiten reconstruir los artefactos desde el fichero público de entrenamiento con una configuración congelada.
- Filtrado y priorización en cribado de enzimas: la evidencia jerárquica L1/L2/L3 generada por el clasificador de prefijos puede usarse para descartar familias enzimáticas incompatibles antes de una validación experimental.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| Puntuación oficial L4 (V5) | 0,546097133429573 |
| Puntuación oficial L4 (V6) | No disponible (sin puntuación oficial todavía) |
| Comparación con V5 en holdout local | Documentada en `VALIDATION.md` y `validation.json`; los valores no se detallan en la información disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que el modelo no es un LLM de propósito general.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo se ejecuta en CPU.
- GPU recomendadas: ninguna; no requiere GPU.
- Compatibilidad con GPU de consumo: no aplica.
- Memoria RAM: no disponible de forma explícita; el repositorio ocupa 0,3 GB y los índices cubren 63.280 reacciones, por lo que se recomienda disponibilidad de memoria suficiente para cargar los cuatro artefactos joblib.
- Opciones de despliegue: ejecución directa con `python predict.py --input /input/val_inputs.parquet --output /output/predictions.jsonl`; imagen Docker con imagen base, dependencias fijadas, entry point y ajustes de hilos sin cambios respecto a V5.
- Latencia y throughput: no disponibles; la model card solo indica que la reconstrucción desde el fichero de entrenamiento es sustancialmente más lenta que la inferencia.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de predicción de números EC ni datos de rendimiento de alternativas.

## Limitaciones y advertencias

- No dispone de puntuación oficial en el leaderboard; las puntuaciones de holdout local no garantizan el rendimiento en el leaderboard privado.
- El parser de conectividad es aproximado: ignora la estereoquímica y no implementa un saneamiento químico completo, lo que puede afectar a reacciones sensibles a la estereoquímica.
- SMILES equivalentes químicamente pero con distinto orden se tratan como claves de agrupación distintas, lo que puede generar predicciones separadas para la misma reacción.
- Solo se devuelve un EC permitido por reacción; no se ofrecen probabilidades calibradas ni alternativas en la salida del evaluador.
- Licencia no especificada: no se puede confirmar el uso comercial sin consultar al autor.
- Idiomas y sesgos: no aplica el análisis de sesgos lingüísticos, pero el modelo está limitado al dominio químico de las reacciones de entrenamiento y puede degradarse en reacciones fuera de la distribución pública.
- Riesgo de error en reacciones con cambios de grafo no representados en los índices; la cobertura depende de las 63.280 reacciones públicas de entrenamiento.
- El repositorio no documenta el número de parámetros ni los requisitos de memoria RAM, lo que dificulta el dimensionamiento de producción.

## Enlaces

- Hugging Face: https://huggingface.co/Ramanagopal/enzyme-retrieval-v6
- Documentación de validación: `VALIDATION.md` y `validation.json` (incluidos en el repositorio)
- Scripts de inferencia y entrenamiento: `predict.py`, `hierarchy_model.py`, `fusion.py`, `neural.py`, `hybrid_dl.py`, `train.py`, `fit_hybrid.py`, `fit_neural.py`, `fit_hierarchy.py`, `verify_submission.py` (incluidos en el repositorio)
