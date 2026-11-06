# geek4freak/leak-curber-enzyme-retrieval-v5

## Resumen

Leak CURBER enzyme retrieval v5 es un sistema de predicción de números EC (Enzyme Commission) a partir de SMILES de reacción, desarrollado por el usuario geek4freak. No se trata de un modelo de lenguaje generativo, sino de un ensemble especializado de clasificadores MLP residuales y mecanismos de recuperación (retrieval) por similitud, empaquetado como un pipeline de inferencia CPU-only. Su objetivo es asignar una clase enzimática (en los cuatro niveles jerárquicos EC L1-L4) a una reacción química descrita como SMILES de reactivos y productos.

El sistema combina huellas de reacción (reaction fingerprints) de tipo Morgan dirigido, que codifican reactivos, productos y las diferencias de subestructuras ganadas y perdidas, con ocho clasificadores MLP residuales entrenados con objetivos multi-EC suaves (1/n) y cabezas auxiliares L3/L2/L1. Sobre esa base se superpone una capa de recuperación por kNN coseno en cuatro espacios distintos: la huella Morgan, el centro de reacción, TF-IDF de n-gramas de caracteres 3-5 y el embedding del MLP. Los pesos del ensemble se ajustaron sobre un holdout tipo validación.

Es relevante en el contexto de la anotación enzimática automatizada y la biocatálisis computacional, donde la asignación de números EC a reacciones es un cuello de botella. El modelo se distribuye con licencia MIT, ocupa 0,6 GB en el repositorio y no requiere GPU. No hay información pública sobre arquitectura transformer, parámetros totales ni longitud de contexto, ya que no es un modelo de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble de 8 MLP residuales + recuperación kNN (Morgan dirigido, centro de reacción, TF-IDF char 3-5-gram, embedding MLP) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (entrada: SMILES de reacción) |
| Licencia | MIT |
| Formato de pesos | no disponible (repo de 0,6 GB; pipeline `predict.py`) |

## Arquitectura y entrenamiento

La arquitectura se compone de dos capas. La primera es un clasificador basado en huellas de reacción: se construye una huella Morgan dirigida que separa reactivos, productos y las subestructuras ganadas y perdidas (diferencia desplegada y luego plegada). Sobre esa representación se entrenan ocho MLP residuales con objetivos multi-EC suaves (1/n), cabezas auxiliares para los niveles L3, L2 y L1, y aumento de datos por reversión de reacción. El fingerprinting incluye normalización de carga (neutralización y eliminación de [H+]) sin alterar las cadenas de entrada originales.

La segunda capa es un sistema de recuperación que combina cuatro índices kNN coseno: la huella Morgan, el centro de reacción, TF-IDF de n-gramas de caracteres 3-5 y el embedding del MLP. Los pesos del ensemble se ajustaron sobre un holdout tipo validación construido con clústeres de reacciones de entrenamiento limitados por similitud y reponderados a las entradas de validación públicas, sin usar etiquetas. Los pesos finales son: knn_morgan 0.0, knn_diff 1.0, knn_text 0.25, mlp 2.0, knn_emb 1.0, con umbrales tau asociados y beta 0.0. El vocabulario EC procede de ExPASy ENZYME release 02-Sep-2026 (SIB, CC BY 4.0).

## Capacidades

- Predicción de un número EC por reacción SMILES, con granularidad jerárquica L1 a L4.
- Clasificación multi-EC suave: los objetivos de entrenamiento usan etiquetas distribuidas (1/n) para reacciones con múltiples anotaciones.
- Recuperación por similitud sobre cuatro representaciones complementarias (huella, centro de reacción, texto y embedding).
- Inferencia exclusivamente en CPU mediante `python /app/predict.py --input IN --output OUT`.
- Normalización de carga interna para manejar formas iónicas y protonadas sin modificar la entrada.
- Aumento por reversión de reacción, lo que permite manejar reacciones escritas en sentido inverso.
- No soporta tool calling, agentes, visión, audio ni generación de texto: es un clasificador especializado.

## Casos de uso

- Anotación enzimática automatizada en bases de datos de reacciones: dado un conjunto de SMILES de reacción, el pipeline asigna números EC L1-L4 para priorizar la revisión manual, reduciendo el coste de curación.
- Enrutamiento en pipelines de biocatálisis: clasificar reacciones candidatas por clase enzimática antes de buscar enzimas homólogas en bases de datos como BRENDA o ExPASy.
- Filtrado de reacciones en diseño de rutas metabólicas: descartar o agrupar reacciones por familia EC para construir árboles de biosíntesis coherentes.
- Enriquecimiento de datasets de química computacional: añadir etiquetas EC a reacciones sin anotar para entrenar modelos posteriores de predicción de enzimas.
- Validación cruzada de anotaciones existentes: detectar discrepancias entre el número EC asignado manualmente y la predicción del ensemble para revisión.
- Preprocesado en pipelines de retrieval enzimático: usar la predicción EC como clave de búsqueda para acotar el espacio de enzimas candidatas antes de un modelo de docking o de estructura.
- Herramienta de apoyo en laboratorio: clasificación rápida en CPU de reacciones propuestas sin necesidad de GPU ni de infraestructura de inferencia de modelos grandes.

## Benchmarks y rendimiento

Resultados del holdout local tipo validación (ponderado, construido para imitar el split del leaderboard):

| Nivel | Precisión top-1 |
|---|---|
| L4 | 0.6250 |
| L3 | 0.8439 |
| L2 | 0.8839 |
| L1 | 0.9259 |

Holdout de reacciones no similares a ninguna de entrenamiento (coseno top-1 < 0.6, n=248): L4 = 0.4849.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) porque no es un modelo de lenguaje. No se dispone de comparación numérica con otros sistemas en la información proporcionada.

## Requisitos de hardware

- VRAM: no aplica; la inferencia es CPU-only según la model card.
- GPU: no necesaria. No se documentan requisitos de GPU.
- Cabe en cualquier equipo consumer: el repositorio ocupa 0,6 GB y el pipeline se ejecuta en CPU.
- Despliegue: script `predict.py` con argumentos `--input` y `--output`; no se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Enfoque | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|
| Leak CURBER v5 | Ensemble MLP + retrieval kNN sobre huellas de reacción | Número EC (L1-L4) | MIT | Hugging Face, CPU-only |
| CLIPZyme (Mikhael et al., ICML 2024) | Referencia citada por el autor; no se dispone de detalles en la información | no disponible | no disponible | no disponible |
| Horizyn (Rocks et al., PNAS 2026) | Referencia citada por el autor; no se dispone de detalles | no disponible | no disponible | no disponible |
| CARE/CREEP (Yang et al., 2025) | Referencia citada por el autor; no se dispone de detalles | no disponible | no disponible | no disponible |

No se dispone de datos comparativos de parámetros, contexto ni rendimiento entre estos sistemas en la información proporcionada.

## Limitaciones y advertencias

- El propio autor advierte que la estimación local está construida para imitar el split del leaderboard y que la puntuación real puede diferir.
- Rendimiento notablemente inferior en reacciones no similares a las de entrenamiento: L4 cae a 0.4849 en el holdout de baja similitud (n=248), lo que indica poca generalización fuera de la distribución.
- No es un modelo de lenguaje: no genera texto, no razona de forma general ni soporta instrucciones en lenguaje natural.
- No hay información sobre sesgos del dataset de entrenamiento, composición ni cobertura taxonómica de las enzimas.
- Riesgo de asignaciones erróneas en reacciones con múltiples enzimas o anotaciones ambiguas; la salida es un único EC por reacción.
- La licencia MIT permite uso comercial, pero el vocabulario EC subyacente (ExPASy ENZYME) está bajo CC BY 4.0 y requiere atribución.
- El repositorio tiene 0 descargas y 0 likes; no hay evidencia de validación externa ni de mantenimiento.
- No se documentan los formatos de pesos ni los artefactos internos del pipeline, lo que dificulta la auditoría y la reproducibilidad.

## Enlaces

- Hugging Face: https://huggingface.co/geek4freak/leak-curber-enzyme-retrieval-v5
- CLIPZyme (Mikhael et al., ICML 2024): referencia citada en la model card, sin URL proporcionada
- Horizyn (Rocks et al., PNAS 2026): referencia citada en la model card, sin URL proporcionada
- CARE/CREEP (Yang et al., 2025): referencia citada en la model card, sin URL proporcionada
- DRFP (Probst et al., 2022): referencia citada en la model card, sin URL proporcionada
- ExPASy ENZYME release 02-Sep-2026 (SIB, CC BY 4.0): referencia del vocabulario EC, sin URL proporcionada
