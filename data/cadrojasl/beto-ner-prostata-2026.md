# cadrojasl/beto-ner-prostata-2026

## Resumen

BETO NER próstata 2026 es un modelo de reconocimiento de entidades nombradas (NER) en dominio clínico, especializado en historias clínicas de cáncer de próstata en español. Lo desarrolla el usuario cadrojasl como trabajo final del taller de PLN de la Maestría en Ingeniería de Sistemas y Computación, y se distribuye con licencia MIT. Parte de `dccuchile/bert-base-spanish-wwm-cased` (BETO), el encoder BERT base entrenado con whole word masking sobre corpus en español, y se afina como clasificador de tokens con esquema BIO sobre diez categorías clínicas.

El modelo resuelve un problema muy concreto: extraer de texto libre clínico los valores y conceptos que alimentan registros estructurados de cáncer de próstata, como biomarcadores (PSA), puntuaciones Gleason, estadificación TNM, dosis de radioterapia, fármacos, cirugías y fechas. Con 109,3 millones de parámetros y un repositorio de 0,4 GB en safetensors, es un modelo pequeño, desplegable en CPU, que prioriza precisión sobre cobertura generalista.

Su relevancia es doble: por un lado, demuestra que un encoder BERT base afinado con un conjunto de datos clínico específico alcanza F1 de entidad de 0,9651 en su conjunto de test; por otro, ofrece una alternativa ligera y de licencia permisiva frente a modelos generativos grandes para tareas de extracción estructurada en entornos hospitalarios con recursos limitados. No es un modelo conversacional ni generativo: es un etiquetador de secuencias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT (BERT base, 12 capas, 768 dimensiones ocultas, 12 cabezas de atención) |
| Parametros totales | 109.276.437 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (derivada de BETO base, típicamente 512 tokens; no confirmado en la información proporcionada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | es (español) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un BERT base multilingüe adaptado al español (BETO), con 12 capas de transformer encoder, 768 dimensiones ocultas y 12 cabezas de atención, sobre el que se añade una cabeza de clasificación de tokens para etiquetado BIO. El vocabulario y el preentrenamiento provienen de `dccuchile/bert-base-spanish-wwm-cased`, que emplea whole word masking y texto con distinción de mayúsculas y minúsculas.

El ajuste fino se realizó con batch size 8, tasa de aprendizaje 2e-05, un máximo de 10 épocas con early stopping (mínimo de 6 épocas) y precisión bf16. La model card no detalla el número de tokens de entrenamiento, la composición exacta del corpus clínico ni si hubo aumentación de datos. Las diez entidades objetivo son BIOMARCADOR, CANCER, CIRUGIA, DOSIS, EDAD, FECHA, GLEASON, MEDICAMENTO, TNM y TRATAMIENTO, con esquema BIO. No se documentan innovaciones arquitectónicas adicionales: se trata de un fine-tuning estándar de token classification.

## Capacidades

- Reconocimiento de entidades nombradas en texto clínico en español con esquema BIO y agregación de entidades mediante `aggregation_strategy="first"`.
- Extracción de biomarcadores oncológicos, en particular valores de PSA y otras determinaciones analíticas.
- Detección de puntuaciones Gleason en formatos como "4+3" o "3+4".
- Identificación de estadificación TNM (tumor, ganglios, metástasis).
- Extracción de dosis de radioterapia y de esquemas de tratamiento.
- Detección de medicamentos y procedimientos quirúrgicos.
- Reconocimiento de fechas y edades en el contexto de la historia clínica.
- Integración directa con la librería `transformers` mediante `pipeline("token-classification")`.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, visión ni audio: es un clasificador de tokens, no un modelo generativo.

## Casos de uso

- Poblado automático de registros de tumores: el modelo etiqueta entidades clínicas en informes de anatomía patológica y notas de oncología, que después se mapean a campos estructurados de una base de datos de cáncer de próstata.
- Extracción de biomarcadores para investigación: procesamiento por lotes de historias clínicas para construir series temporales de PSA y Gleason por paciente, con F1 de entidad de 0,9651 en test que reduce la revisión manual.
- Codificación clínica y facturación: identificación de procedimientos (CIRUGIA) y fármacos (MEDICAMENTO) para asignar códigos y validar reclamaciones.
- Sistemas de alerta clínica: detección de estadificación TNM y Gleason de alto grado en informes nuevos para priorizar revisiones de casos.
- Anonimización asistida y control de calidad: localización de fechas y edades para su seudonimización, y verificación de que los informes contienen los campos obligatorios.
- Preprocesado para pipelines RAG clínicos: extracción de entidades que enriquecen metadatos y permiten búsquedas filtradas sobre historias clínicas en español.
- Despliegue en entornos con recursos limitados: al ser un modelo de 109 millones de parámetros, puede ejecutarse en CPU o en una GPU consumer para inferencia por lotes sin infraestructura dedicada.

## Benchmarks y rendimiento

Resultados publicados por el autor en el conjunto de test, con seqeval a nivel de entidad:

| Metrica | Valor |
|---|---|
| Precision | 0,9641 |
| Recall | 0,9661 |
| F1 | 0,9651 |
| Accuracy | 0,9939 |

No se han publicado resultados comparativos con otros modelos en la información disponible, ni desglose por entidad, ni métricas en conjuntos externos.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,44 GB solo para pesos, más activaciones y memoria del tokenizador; en la práctica, menos de 2 GB para lotes pequeños.
- Cabe en cualquier GPU consumer (GTX 1060 6 GB, RTX 3060, RTX 4090) y también en CPU para inferencia por lotes.
- GPU recomendadas para alto throughput: A100, H100 o L4 para servir muchos documentos en paralelo; para uso individual, RTX 4090 o RTX 3090 son más que suficientes.
- Opciones de despliegue: `transformers` con `pipeline`, TorchServe, FastAPI con ONNX Runtime, o exportación a ONNX para inferencia optimizada. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos generativos.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cadrojasl/beto-ner-prostata-2026 | 109,3 M | no disponible | NER clínico en español (próstata) | MIT | HuggingFace |
| dccuchile/bert-base-spanish-wwm-cased (BETO) | 109,3 M | no disponible | Modelo base español, sin fine-tuning NER | MIT | HuggingFace |
| Modelos NER clínicos en español (p. ej. variantes de BETO/ RoBERTa-BNE afinadas) | ~110-125 M | no disponible | NER clínico general | variable | HuggingFace |

No se dispone de datos de rendimiento de los modelos alternativos en la información proporcionada, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- Sesgos: el modelo se entrenó con un corpus clínico no documentado; puede reflejar sesgos de la población, del centro hospitalario o del estilo de redacción de los informes de origen.
- Riesgo de alucinación: al ser un clasificador de tokens, no genera texto, pero puede etiquetar de forma incorrecta entidades ambiguas, especialmente en textos con abreviaturas no vistas o con errores tipográficos.
- Dominio restringido: está especializado en cáncer de próstata; su rendimiento en otras especialidades o en otros tipos de cáncer no está validado.
- Cobertura idiomática limitada al español; no se ha evaluado en variantes dialectales ni en texto bilingüe.
- Longitud de contexto: no confirmada en la información proporcionada; los informes clínicos largos pueden requerir segmentación.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; para uso clínico real se requiere validación regulatoria y auditoría adicional.
- No es un dispositivo médico: no debe usarse como única fuente para decisiones clínicas sin supervisión humana.
- El repositorio tiene pocas descargas (31) y ningún "like", lo que sugiere escasa validación externa por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cadrojasl/beto-ner-prostata-2026
- Modelo base BETO: https://huggingface.co/dccuchile/bert-base-spanish-wwm-cased
- Documentación de `transformers` para token classification: https://huggingface.co/docs/transformers/tasks/token_classification
- No se han encontrado en la información proporcionada enlaces a papers, blogs, repositorios o demos adicionales.
