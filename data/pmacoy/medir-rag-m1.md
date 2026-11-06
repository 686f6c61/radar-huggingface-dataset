# Pmacoy/medir-rag-m1

## Resumen

MedIR-RAG · Milestone 1 es un artefacto de recuperación de información (RI) publicado en Hugging Face por el autor Pmacoy (identificado en la model card como Paulo A. Julio, m70401) en el contexto de un proyecto de la asignatura "Recuperação de Informação em Bases de Texto" del MEI de la Universidade de Évora (curso 2026/2027). No se trata de un modelo de lenguaje con pesos neuronales, sino de una baseline léxica completa del pipeline MedIR-RAG: indexación del corpus PubMedQA, búsqueda con BM25 y evaluación con `pytrec_eval`.

El repositorio documenta la formulación del problema como tarea de RI: cada resumen de `pqa_labeled` (1000 documentos) se construye concatenando los `CONTEXTS`, las queries son las 1000 preguntas del mismo conjunto y los qrels son binarios con un único documento relevante por pregunta. Se reserva un 20 % de las queries para validación (ajuste de los parámetros `k1` y `b` de BM25) y un 80 % para test, con semilla 42.

Su relevancia es metodológica y educativa: proporciona un procedimiento reproducible (requiere Java 21 por Pyserini/Lucene) para establecer un suelo de rendimiento léxico sobre PubMedQA antes de introducir recuperadores densos o fusión de rankings en milestones posteriores. No hay información sobre licencia, pipeline ni métricas numéricas publicadas en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Recuperador léxico BM25 sobre índice Lucene (Pyserini); no es un modelo neuronal |
| Parámetros totales | no disponible (no aplica; no hay pesos de modelo) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; BM25 opera sobre documentos indexados) |
| Tipos de cuantización | no disponible (no aplica) |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | no disponible (no hay pesos; se generan índices Lucene y ficheros CSV/TREC/JSON en `outputs/`) |

## Arquitectura y entrenamiento

El sistema es una pipeline de recuperación léxica basada en BM25 implementada con Pyserini (Lucene) y evaluada con `pytrec_eval`. El corpus se construye a partir del subconjunto `pqa_labeled` de PubMedQA (1000 resúmenes), donde cada documento es la concatenación de los campos `CONTEXTS`; el campo `LONG_ANSWER` se excluye por ser la conclusión del resumen. Opcionalmente se pueden añadir resúmenes de `pqa_unlabeled` como distractores mediante el flag `--distractors N` (por ejemplo, 20 000 distractores).

No hay entrenamiento neuronal ni ajuste de pesos. El único "ajuste" es una búsqueda en rejilla (grid search) de los hiperparámetros `k1` y `b` de BM25 sobre el 20 % de queries de validación, con evaluación posterior sobre el 80 % de test. Se contemplan variantes de stemming y una condición de omisión (baseline sin ajuste). El script genera en `outputs/` los ficheros `grid_val_*.csv`, `results_test_*.csv`, `run_bm25_test_*.trec` (top-100, reutilizado en la Milestone 2 para fusión RRF) y `summary_*.json` con estadísticas del índice, mejores parámetros y p-valor de Wilcoxon. La reproducibilidad exige Java 21 (Pyserini/Lucene) y permite ejecución local con `ori_pqal.json` si no hay acceso a Hugging Face Datasets.

## Capacidades

- Recuperación léxica de documentos biomédicos mediante BM25 sobre un índice Lucene.
- Indexación del corpus PubMedQA (`pqa_labeled`) y, opcionalmente, incorporación de distractores de `pqa_unlabeled`.
- Ajuste de hiperparámetros (`k1`, `b`) mediante grid search sobre un split de validación.
- Evaluación con métricas estándar de RI: NDCG@5, NDCG@10, MRR@10, MAP y Recall@100.
- Generación de runs en formato TREC (top-100) reutilizables para fusión de rankings (RRF) en milestones posteriores.
- Variantes de stemming y comparación contra baseline sin ajuste.
- Test estadístico de Wilcoxon para comparar configuraciones.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking; no es un modelo generativo.

## Casos de uso

- Baseline de referencia en investigación en RI biomédica: sirve como suelo léxico contra el que medir recuperadores densos o híbridos sobre PubMedQA, gracias a su evaluación estandarizada con `pytrec_eval` y métricas NDCG, MRR, MAP y Recall.
- Docencia y reproducibilidad: el repositorio incluye instrucciones completas (instalación de Java 21, `requirements.txt`, ejecución del script) que permiten a estudiantes reproducir la pipeline en Colab o Linux y comparar resultados con semilla fija 42.
- Ajuste de hiperparámetros de BM25: el grid search sobre `k1` y `b` con split de validación documenta el procedimiento para calibrar un recuperador léxico en un corpus científico concreto.
- Construcción de pipelines RAG en dominio biomédico: el run TREC top-100 generado alimenta la fase de fusión RRF de la Milestone 2, por lo que puede integrarse como componente de recuperación inicial en un sistema RAG sobre literatura médica.
- Evaluación de robustez ante distractores: el flag `--distractors N` permite medir la degradación del recall al añadir hasta decenas de miles de resúmenes no relevantes, un escenario realista en búsqueda sobre repositorios grandes.
- Comparación de variantes de preprocesado: las variantes de stemming y la condición de omisión permiten cuantificar el impacto del preprocesado lingüístico en el rendimiento de BM25 sobre texto biomédico.
- Análisis estadístico de configuraciones: el p-valor de Wilcoxon incluido en `summary_*.json` facilita comparaciones con significación estadística entre configuraciones del recuperador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card define las métricas que se calculan (NDCG@5, NDCG@10, MRR@10, MAP y Recall@100) y los ficheros donde se almacenan (`results_test_*.csv`, `summary_*.json`), pero no incluye valores numéricos.

## Requisitos de hardware

- No requiere GPU: es una pipeline de recuperación léxica sobre Lucene, ejecutable en CPU.
- Requiere Java 21 (OpenJDK headless) por la dependencia de Pyserini/Lucene.
- Entorno de ejecución validado en Colab y Linux; también puede ejecutarse en local con `ori_pqal.json`.
- Dependencias Python instaladas mediante `requirements.txt` (incluye Pyserini y `pytrec_eval`).
- Memoria y latencia: no disponible en la información proporcionada; el tamaño del índice depende del número de documentos indexados y de los distractores añadidos.
- Opciones de despliegue: ejecución directa del script `milestone1_bm25.py`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un recuperador léxico).

## Comparativa con modelos similares

| Sistema | Tipo | Corpus | Métricas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MedIR-RAG Milestone 1 (este) | BM25 sobre Lucene/Pyserini | PubMedQA `pqa_labeled` (1000) + distractores opcionales | NDCG@5/10, MRR@10, MAP, Recall@100 | no disponible | Hugging Face (Pmacoy/medir-rag-m1) |
| BM25 estándar (Pyserini) | Recuperador léxico de propósito general | Cualquiera | Configurable | Apache 2.0 (Pyserini) | Pyserini en GitHub/PyPI |
| Recuperadores densos sobre PubMedQA | Modelos de embeddings (p. ej. basados en transformers) | PubMedQA | Depende del trabajo | Varía | Varía |
| PubMedQA como dataset de QA | Dataset de evaluación | 1000 preguntas etiquetadas | Exactitud de QA | Consultar el repositorio original | GitHub de PubMedQA |

La información disponible no permite una comparación numérica de rendimiento con alternativas; los datos de los sistemas comparables proceden de sus respectivas fuentes públicas y no de la model card.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no responde preguntas y no puede usarse para tareas generativas, de razonamiento o de código.
- Solo admite inglés; no hay soporte multilingüe documentado.
- La licencia no está especificada, lo que impide confirmar condiciones de uso comercial; debe consultarse con el autor antes de cualquier uso en producción.
- Los qrels son binarios con un único documento relevante por pregunta, lo que limita la evaluación de rankings con múltiples relevantes.
- El corpus base es pequeño (1000 documentos); el rendimiento con distractores añadidos no se reporta numéricamente en la información disponible.
- El proyecto es académico (curso 2026/2027) y se encuentra en estado de milestone 1; no hay evidencia de mantenimiento, versionado ni soporte.
- La reproducibilidad depende de versiones concretas de Java 21 y de las dependencias de Pyserini, lo que puede provocar divergencias si cambian las versiones.
- No se han publicado resultados de benchmarks, por lo que no es posible verificar empíricamente el rendimiento declarado.

## Enlaces

- Hugging Face: https://huggingface.co/Pmacoy/medir-rag-m1
- PubMedQA (paper): Jin, Q. et al. (2019). PubMedQA: A Dataset for Biomedical Research Question Answering. EMNLP-IJCNLP.
- Pyserini (paper): Lin, J. et al. (2021). Pyserini: A Python Toolkit for Reproducible Information Retrieval Research. SIGIR.
- pytrec_eval (paper): Van Gysel, C., & de Rijke, M. (2018). pytrec_eval: An Extremely Fast Python Interface to trec_eval. SIGIR.
- Manning, C. D., Raghavan, P., & Schütze, H. (2008). Introduction to Information Retrieval. Cambridge University Press.
- Repositorio y fichero `ori_pqal.json` del proyecto PubMedQA: no disponible en la información proporcionada.
