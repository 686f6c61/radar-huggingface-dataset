# lanshi/prenatal-case-dora

## Resumen

`lanshi/prenatal-case-dora` es un clasificador binario de texto biomédico especializado en literatura de genética prenatal. Distingue artículos que son *case report* o *case series* (descripciones de casos clínicos) del resto de diseños de estudio: cohorte, cribado/validación, revisión, metodológico o registro. Lo desarrolla el usuario `lanshi` como artefacto de investigación, no como herramienta de decisión clínica, y se publica bajo licencia Apache-2.0.

El modelo parte del encoder PubMedBERT (`microsoft/BiomedNLP-BiomedBERT-base-uncased-abstract-fulltext`) y se afina mediante un adaptador DoRA (Weight-Decomposed Low-Rank Adaptation, PEFT) sobre las proyecciones `query` y `value`, con rango 16 y alpha 32. El checkpoint publicado hereda los pesos de `NeuML/pubmedbert-base-embeddings`, un fine-tune tipo SentenceTransformer del mismo encoder. El total de parámetros es de 110.093.570, de los cuales solo 611.330 (el 0,56 %) son entrenables: 608.256 del adaptador DoRA y 3.074 de la cabeza lineal.

La relevancia práctica está en su función dentro de un pipeline de revisión sistemática: filtra automáticamente artículos de casos clínicos en corpus de genética prenatal, una tarea que de otro modo exige lectura manual. El modelo está pensado para clasificación documental a nivel de artículo completo, con una longitud de entrada gestionada mediante fragmentación en ventanas de 480 tokens.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (PubMedBERT) + adaptador DoRA (PEFT) + cabeza lineal 1536→2 |
| Parámetros totales | 110.093.570 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 480 tokens por fragmento, hasta 12 fragmentos por documento (ventanas; se conservan las 2 primeras y se muestrean el resto de forma uniforme) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería pytorch) |

## Arquitectura y entrenamiento

El modelo es un encoder Transformer de tipo BERT (PubMedBERT) con un adaptador DoRA insertado en las proyecciones `query` y `value` de la atención. El proceso de inferencia es de un solo paso hacia delante por documento: se concatenan título, resumen y texto completo, se dividen en ventanas de 480 tokens (máximo 12; se conservan las dos primeras y el resto se muestrea uniformemente), se codifican con PubMedBERT y se agregan mediante la concatenación `L2(mean_all) ‖ L2(mean_first_2)`, produciendo un vector de 1536 dimensiones que alimenta una cabeza lineal de dos clases. El mismo protocolo de fragmentación y agregación se usa en entrenamiento e inferencia.

El entrenamiento se realizó sobre 864 artículos con anotación de diseño existente: 376 de tipo *case report* / *case series* y 488 de cohorte, cribado, revisión, metodológico, validación o registro; se excluyeron 110 con etiqueta ausente u "otro". Las etiquetas provienen de un pipeline de anotación con LLM más revisión, por lo que contienen cierto ruido (por ejemplo, series retrospectivas grandes ocasionalmente etiquetadas como cohorte). Se aplicó validación cruzada estratificada de 5 pliegues con partición interna de validación para *early stopping* y selección de umbral. El umbral de decisión desplegado es 0,3962 (óptimo de F1 sobre puntuaciones *out-of-fold*) y existe un umbral de alta precisión de 0,3502 (P ≥ 0,90). Se incluyen guardas específicas: para entradas de menos de 128 tokens se exige p ≥ 0,75 para emitir `case` (entre 0,396 y 0,75 devuelve `insufficient`), y las entradas largas con puntuación en [τ − 0,05, τ) se marcan como `insufficient` en lugar de `non-case`. La calibración *out-of-fold* reporta ECE 0,202 y Brier 0,089, que con *temperature scaling* (T = 0,338) bajan a 0,080 y 0,054; la puntuación calibrada se obtiene como `sigmoid(logit(case_score) / 0.338)`, aunque las decisiones siguen usando la puntuación sin calibrar y el umbral.

## Capacidades

- Clasificación binaria de documentos biomédicos en *case report* / *case series* frente a otros diseños de estudio.
- Procesamiento de documentos completos mediante fragmentación en ventanas de 480 tokens con agregación ponderada.
- Salida de puntuación de probabilidad calibrable y umbrales configurables (F1-óptimo y alta precisión).
- Emisión de la etiqueta `insufficient` para casos ambiguos o de entrada corta, lo que permite derivar a revisión humana.
- Dominio especializado en literatura de genética prenatal y biomedicina (PubMedBERT).
- Capacidad monolingüe: solo inglés.
- No soporta *tool calling*, *function calling*, agentes, razonamiento multi-paso, visión ni audio.

## Casos de uso

- Filtrado en revisiones sistemáticas de genética prenatal: el modelo se integra como segunda pasada de un pipeline de dos etapas (primero un DoRA de relevancia con umbral 0,7619 que redujo 23.378 a 13.752 documentos; después este modelo, que redujo 13.752 a 8.048 casos) para aislar artículos de casos clínicos antes de la extracción manual de datos.
- Construcción de corpus de *case reports* para minería de literatura: permite generar conjuntos de datos etiquetados por diseño de estudio a partir de exportaciones de PubMed, con umbral ajustable según se priorice precisión o exhaustividad.
- Triaje de cribado en revisiones rápidas: con el umbral de alta precisión (0,3502) se obtiene P 0,900 / R 0,960, adecuado cuando el coste de un falso positivo (lectura innecesaria) es alto.
- Enrutamiento documental en pipelines de extracción de información: los artículos clasificados como `case` se dirigen a extractores específicos de fenotipos o variantes, mientras que el resto sigue otra ruta.
- Monitorización de literatura nueva: aplicado a los artículos que entran cada mes en PubMed sobre genética prenatal, permite detectar publicaciones de casos clínicos de forma continua y priorizar su lectura.
- Anotación asistida para revisores: la salida `insufficient` en la banda de revisión y en entradas cortas sirve para derivar a revisión humana los documentos ambiguos, reduciendo el volumen de lectura sin descartar casos dudosos.
- Investigación metodológica en clasificación de diseños de estudio: el checkpoint y su código permiten reproducir ablaciones (TF-IDF + regresión logística sobre título, etc.) y estudiar la transferencia temporal y por revista.

## Benchmarks y rendimiento

Evaluación con validación cruzada estratificada de 5 pliegues; umbrales seleccionados en la partición interna de validación de cada pliegue.

| Métrica | Resultado |
|---|---|
| Test average precision (AP) | 0,987 ± 0,009 |
| Test F1 | 0,938 ± 0,021 |
| Test precisión (media) | 0,926 |
| Test recall (media) | 0,952 |
| AUC *out-of-fold* | 0,970 |
| AP *out-of-fold* | 0,965 |
| OOF con umbral 0,396 | P 0,942 / R 0,947 / F1 0,944 |
| OOF con umbral 0,350 | P 0,900 / R 0,960 |

Matriz de evaluación por pliegue (test):

| Pliegue | Umbral | TP | FP | FN | TN | Precisión | Recall | F1 | AP | AUC |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 0 | 0,6465 | 69 | 3 | 6 | 95 | 0,958 | 0,920 | 0,939 | 0,990 | 0,992 |
| 1 | 0,4327 | 70 | 1 | 5 | 97 | 0,986 | 0,933 | 0,959 | 0,993 | 0,994 |
| 2 | 0,4080 | 74 | 5 | 1 | 93 | 0,937 | 0,987 | 0,961 | 0,996 | 0,997 |
| 3 | 0,2112 | 72 | 11 | 4 | 86 | 0,868 | 0,947 | 0,906 | 0,972 | 0,972 |
| 4 | 0,2449 | 73 | 10 | 2 | 87 | 0,880 | 0,973 | 0,924 | 0,984 | 0,984 |
| Media | — | — | — | — | — | 0,926 | 0,952 | 0,938 | 0,987 | 0,988 |

Matriz de confusión *out-of-fold* en los umbrales desplegados:

| Umbral | TP | FP | FN | TN | Precisión | Recall | F1 |
|---|---:|---:|---:|---:|---:|---:|---:|
| 0,3962 (F1-óptimo) | 356 | 22 | 20 | 466 | 0,942 | 0,947 | 0,944 |
| 0,3502 (P ≥ 0,90) | 361 | 40 | 15 | 448 | 0,900 | 0,960 | 0,929 |

Validez externa:

| Protocolo | AP | F1 |
|---|---:|---:|
| 5 pliegues aleatorios | 0,987 ± 0,009 | 0,938 ± 0,021 |
| Temporal (entrenamiento ≤2019, test ≥2020) | 0,987 | 0,939 |
| GroupKFold por revista (183 revistas) | 0,986 ± 0,005 | 0,925 ± 0,019 |

El ranking se transfiere entre épocas y revistas, pero la distribución de puntuaciones no: el umbral temporal es 0,505 frente a 0,396 en dominio, y los pliegues por revista oscilan entre 0,299 y 0,760. La model card recomienda recalibrar el umbral sobre el corpus objetivo o usar `case_score_calibrated`.

Línea base comparada (5 pliegues, mismas particiones): TF-IDF + regresión logística sobre título obtiene AP 0,963 ± 0,007, AUC 0,964, precisión 0,876 y recall 0,894 (la fila aparece truncada en la información disponible; el resto de baselines y ablaciones no está completo).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 110 M de parámetros en FP32 el peso ronda los 0,44 GB, y el repositorio ocupa 0,4 GB.
- GPU recomendadas: no disponible; por tamaño, cualquier GPU con al menos unos pocos GB de VRAM es suficiente (el modelo es un encoder BERT-base).
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU de consumo moderna (RTX 3060, RTX 4090, etc.), dado el tamaño del checkpoint; no se aportan cifras oficiales.
- Opciones de despliegue: no disponible en la model card; al ser un modelo PyTorch/Hugging Face con safetensors, es desplegable con las librerías estándar de transformers, aunque no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `lanshi/prenatal-case-dora` | 110.093.570 | 480 tokens × hasta 12 fragmentos | Clasificación de diseño de estudio en genética prenatal | Apache-2.0 | Hugging Face |
| `NeuML/pubmedbert-base-embeddings` (modelo base) | no disponible | no disponible | Embeddings biomédicos (SentenceTransformer) | Apache-2.0 | Hugging Face |
| `microsoft/BiomedNLP-BiomedBERT-base-uncased-abstract-fulltext` | no disponible | no disponible | Encoder biomédico preentrenado (MLM) | MIT | Hugging Face |

No se dispone de datos de benchmarks comparativos frente a otros clasificadores de diseño de estudio; la única comparación publicada es la línea base TF-IDF + regresión logística descrita en la sección anterior.

## Limitaciones y advertencias

- Es un artefacto de investigación, no una herramienta de decisión clínica; no debe usarse para diagnóstico ni para decisiones sobre pacientes.
- Las etiquetas de entrenamiento provienen de un pipeline LLM + revisión y contienen ruido (por ejemplo, series retrospectivas grandes etiquetadas como cohorte), lo que puede sesgar las fronteras de decisión.
- La distribución de puntuaciones no se transfiere entre corpus: el umbral óptimo varía de 0,396 en dominio a 0,505 en validación temporal y entre 0,299 y 0,760 según la revista. Es obligatorio recalibrar el umbral en el corpus objetivo.
- La calibración original es deficiente (ECE 0,202); la puntuación calibrada requiere aplicar *temperature scaling* con T = 0,338 y no se usa para las decisiones por defecto.
- Solo admite inglés; no hay soporte multilingüe.
- La guarda de título explícito (`case report` / `case series` / `report of N<100 cases`) vive en el pipeline, no en este checkpoint; usarlo de forma aislada pierde esa señal.
- Entradas cortas (menos de 128 tokens) o en la banda de revisión se marcan como `insufficient`, lo que puede generar volumen de revisión manual.
- No soporta *tool calling*, agentes ni razonamiento multi-paso; es un clasificador puro.
- No se documentan tipos de cuantización ni requisitos de hardware oficiales.
- Riesgo de alucinación no aplicable en sentido generativo (es un clasificador), pero sí de falsos positivos y negativos en la clasificación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lanshi/prenatal-case-dora
- Código, entrenamiento y evaluación: https://github.com/lanshi17/fetal-case-literature-classifier
- Diagrama del modelo (PNG): https://huggingface.co/lanshi/prenatal-case-dora/blob/main/model-architecture.png
- Placa del sistema (PDF): https://huggingface.co/lanshi/prenatal-case-dora/blob/main/architecture.pdf
- Filosofía de diseño: https://huggingface.co/lanshi/prenatal-case-dora/blob/main/DESIGN_PHILOSOPHY.md
- Validación detallada: https://github.com/lanshi17/fetal-case-literature-classifier/blob/main/docs/VALIDATION.md
- Modelo base (PubMedBERT): https://huggingface.co/microsoft/BiomedNLP-BiomedBERT-base-uncased-abstract-fulltext
- Pesos de partida (SentenceTransformer): https://huggingface.co/NeuML/pubmedbert-base-embeddings
