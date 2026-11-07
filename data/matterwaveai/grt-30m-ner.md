# MatterWaveAI/grt-30m-ner

## Resumen

GRT-30M-NER es un modelo de reconocimiento de entidades nombradas (NER) de 29,8 millones de parámetros desarrollado por MatterWaveAI, afinado a partir del modelo base MatterWaveAI/grt-30m. Su particularidad es que se trata de un modelo de clasificación de tokens construido sobre una arquitectura de transformer rotacional (GRT, Givens Rotational Transformer) que, según la model card, no contiene ninguna capa `nn.Linear` ni `nn.Conv1d`, sustituyéndolas por transformaciones geométricas basadas en rotaciones de Givens y álgebra de Clifford. La tarea concreta es el etiquetado BIO de 9 clases sobre CoNLL-2003 (persona, organización, localización y miscelánea).

El modelo resulta relevante como ejercicio de investigación sobre alternativas a las capas lineales densas en arquitecturas transformer, no tanto por su rendimiento absoluto, que es modesto (F1 de span en torno al 69 % tras una adaptación de solo 200 pasos), sino por la propuesta metodológica: una cabeza de clasificación que proyecta representaciones normalizadas L2 sobre prototipos de ángulos de fase y escalas radiales, junto con un conjunto de optimizadores geométricos propios (HessianPairAdam, PolarNaturalAdam, PairAdam, entre otros). Es un modelo pequeño, de licencia Apache 2.0 y compatible con la librería `transformers`, orientado a experimentación más que a producción.

Su tamaño reducido (repo de 0,1 GB) y su naturaleza de clasificador de tokens lo sitúan en la categoría de modelos NER ligeros, comparables en escala a destilaciones de BERT, aunque su arquitectura y su protocolo de entrenamiento difieren sustancialmente de los enfoques convencionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Rotational Transformer (GRT); sin capas `nn.Linear` ni `nn.Conv1d`; cabeza `GRTCosineClassificationHead` con prototipos de fase y ganancias radiales |
| Parametros totales | 29.846.946 (safetensors); 29.307.847 según la model card |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (la model card no declara idiomas; el dataset de referencia CoNLL-2003 es mayoritariamente inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo se basa en `MatterWaveAI/grt-30m`, un transformer rotacional en el que las operaciones de proyección se implementan mediante rotaciones de Givens en lugar de productos matriciales densos convencionales, con una cabeza de clasificación de tokens (`GRTForTokenClassification`) que normaliza L2 la representación final `GRTPearlNorm` de cada token y la puntúa contra 9 prototipos de ángulo de fase (`phase_angles`, forma `[9, 128]`) y ganancias radiales softplus (`pair_scales`, forma `[9, 128]`), calibradas por `output_scale` y un sesgo por clase. El objetivo es el etiquetado BIO de 9 clases de CoNLL-2003.

El entrenamiento documentado en la model card es una ablación de 8 optimizadores geométricos clásicos de `transformers.models.grt.optimization_grt`, todos bajo un protocolo idéntico de 200 pasos, semilla 42, batch de 24 y `backbone_lr` de 1,6e-4, descongelando únicamente el último bloque rotacional (`811.651` parámetros), `final_norm` (128 parámetros) y el clasificador (2.350 parámetros), para un total de 814.257 parámetros entrenables. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF/DPO; el modelo parte de un backbone preentrenado y se afina para NER.

## Capacidades

- Reconocimiento de entidades nombradas con esquema BIO de 9 clases: O, B-PER, I-PER, B-ORG, I-ORG, B-LOC, I-LOC, B-MISC, I-MISC.
- Clasificación de tokens a nivel de token individual (pipeline `token-classification`).
- Integración nativa con la librería `transformers` mediante `AutoTokenizer` y `GRTForTokenClassification`.
- Compatible con endpoints (etiqueta `endpoints_compatible`).
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes ni modo thinking.
- Cobertura multilingüe: no disponible; el dataset de referencia es CoNLL-2003 (inglés).

## Casos de uso

- Extracción de entidades en pipelines de procesamiento de documentos: el modelo puede etiquetar personas, organizaciones, localizaciones y miscelánea en textos tokenizados, integrándose con `transformers` para preprocesar corpus antes de indexación o análisis.
- Anonimización y seudonimización de datos personales: al detectar tokens B-PER/I-PER, puede servir como componente de un sistema que enmascare nombres en registros antes de su publicación o compartición.
- Investigación en arquitecturas alternativas: útil como banco de pruebas para comparar cabezas de clasificación geométricas frente a cabezas lineales convencionales en tareas de etiquetado secuencial.
- Evaluación de optimizadores geométricos: el modelo y su model card documentan una ablación de 8 optimizadores, lo que lo hace adecuado para reproducir o extender experimentos sobre optimización en variedades.
- Prototipado rápido de NER en entornos con recursos limitados: su tamaño (29,8 M de parámetros, repo de 0,1 GB) permite cargarlo en CPU o GPUs de gama baja para pruebas de concepto.
- Benchmarking educativo: como ejemplo didáctico de sustitución de capas lineales por rotaciones de Givens y de cabezas de clasificación basadas en similitud coseno sobre la hiperesfera unitaria.

## Benchmarks y rendimiento

Resultados de la ablación de 200 pasos publicada en la model card (adaptación del último bloque rotacional, `final_norm` y clasificador):

| Optimizador | Val NLL | Token Acc (%) | Entity Token F1 (%) | Entity Span F1 (%) | Span Precision (%) | Span Recall (%) | Tiempo (200 pasos) |
|---|---|---|---|---|---|---|---|
| hessian_pair_adam | 0,1851 | 95,38 | 91,29 | 69,16 | 62,03 | 78,12 | 24,74 s |
| polar_natural_adam | 0,1854 | 95,38 | 91,29 | 69,16 | 62,03 | 78,12 | 23,07 s |
| pair_adam | 0,1854 | 95,32 | 91,19 | 69,16 | 62,03 | 78,12 | 25,32 s |
| gyric_adam | 0,1863 | 95,32 | 91,19 | 69,16 | 62,03 | 78,12 | 239,15 s |
| symplectic_adam | 0,1863 | 95,27 | 91,08 | 68,78 | 61,63 | 77,81 | 241,02 s |
| huygens_symplectic_adam | 0,1863 | 95,27 | 91,08 | 68,78 | 61,63 | 77,81 | 218,89 s |
| cyclide_adam | 0,1854 | 95,22 | 90,98 | 68,41 | 61,23 | 77,50 | 75,52 s |
| huygens_adam | 0,1853 | 95,22 | 90,98 | 68,04 | 60,84 | 77,19 | 189,88 s |
| Cabeza inicializada (paso 0) | 0,9752 | 64,88 | 51,84 | 20,11 | 14,44 | 33,12 | — |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ni comparaciones con modelos NER de referencia más allá de esta ablación interna.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (29,8 M de parámetros ≈ 120 MB de pesos), con margen para activaciones y tokenizador en GPU de gama baja.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria libre; cabe en GTX 1650, RTX 3060, RTX 4090, A100 y H100 sin problema. También es viable en CPU para lotes pequeños.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna, e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: `transformers` (nativo, vía `GRTForTokenClassification`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI. La etiqueta `endpoints_compatible` sugiere compatibilidad con endpoints gestionados de Hugging Face.
- Latencia y throughput estimados: no disponibles. El modelo requiere la implementación `GRTForTokenClassification` de `transformers` (módulo `transformers.models.grt`), por lo que no es desplegable en runtimes que solo soporten arquitecturas estándar.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparables publicados en la información proporcionada para enfrentar este modelo con alternativas NER estándar. A modo orientativo estructural:

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MatterWaveAI/grt-30m-ner | 29,8 M | No disponible | NER CoNLL-2003 (9 clases BIO) | Apache 2.0 | Hugging Face `transformers` |
| Alternativas NER tipo BERT-base (no comparadas en la info) | ~110 M | 512 | NER token-classification | Variable | Hugging Face `transformers` |
| Alternativas NER destiladas (no comparadas en la info) | ~30-70 M | 512 | NER token-classification | Variable | Hugging Face `transformers` |

No se han publicado comparaciones directas con otros modelos en la información disponible; los valores de las filas alternativas son orientativos de categoría y no deben interpretarse como resultados medidos frente a este modelo.

## Limitaciones y advertencias

- El F1 de span tras la adaptación de 200 pasos ronda el 69 %, un valor bajo para producción en NER; el modelo está pensado como experimento de investigación, no como solución desplegable.
- El protocolo de entrenamiento documentado es muy corto (200 pasos) y congela la mayor parte del backbone; no hay evidencia de un ajuste completo ni de evaluación sobre un conjunto de test independiente más allá de la ablación interna.
- El modelo no declara idiomas soportados; CoNLL-2003 es mayoritariamente inglés, por lo que el rendimiento en castellano u otros idiomas es desconocido y probablemente deficiente.
- No se documentan sesgos conocidos, pero al derivar de un dataset periodístico inglés, es esperable un sesgo hacia entidades de dominio noticioso y hacia nombres y organizaciones occidentales.
- Riesgo de alucinación: al ser un clasificador de tokens, no genera texto, pero puede etiquetar erróneamente tokens ambiguos o fuera del dominio de entrenamiento.
- Longitud de contexto no disponible; no debe asumirse una ventana larga.
- Dependencia de una implementación no estándar (`transformers.models.grt`): no es compatible con runtimes de inferencia que solo soporten arquitecturas convencionales (vLLM, llama.cpp, Ollama), lo que limita el despliegue en producción.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base `MatterWaveAI/grt-30m` antes de explotarlo.
- No se proporcionan datos sobre estabilidad numérica, calibración ni comportamiento en textos largos o con dominios distintos al periodístico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MatterWaveAI/grt-30m-ner
- Modelo base: https://huggingface.co/MatterWaveAI/grt-30m
- Dataset de referencia CoNLL-2003: https://huggingface.co/datasets/conll2003
- Documentación de `transformers` (token classification): https://huggingface.co/docs/transformers/tasks/token_classification
