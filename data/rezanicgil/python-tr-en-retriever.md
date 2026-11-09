# rezanicgil/python-tr-en-retriever

## Resumen

`rezanicgil/python-tr-en-retriever` es un encoder de frases derivado de `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2`, afinado por el usuario rezanicgil para la recuperación de pasajes paralelos de documentación de Python entre inglés y turco. El modelo parte de una arquitectura BERT MiniLM (12 capas, 384 dimensiones ocultas) con 117.653.760 parámetros totales, y se distribuye bajo licencia Apache 2.0 en formato safetensors con la librería transformers.

El problema que aborda es concreto: alinear semánticamente fragmentos de documentación técnica de Python escritos en inglés con sus traducciones al turco, de forma que una consulta en un idioma recupere el pasaje correspondiente en el otro. Para ello se adaptó el bloque transformer final sobre 1.027 pares procedentes de 34 archivos de documentación, usando pérdida contrastiva simétrica con negativos en lote durante una única época.

Es relevante ahora por su carácter reproducible y su evaluación honesta: el autor publica los resultados de recuperación con conjuntos de retención, un diagnóstico externo de emparejamiento CV-oferta y enlaces al código de entrenamiento y a los informes de auditoría. No obstante, las ganancias frente al modelo base son marginales (del orden de 4-5 aciertos sobre 721 en la primera posición), lo que conviene tener en cuenta antes de adoptarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT MiniLM (12 capas, 384 dimensiones ocultas), derivado de `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2` |
| Parametros totales | 117.653.760 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el ejemplo de uso trunca a `max_length=128`) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, tr |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es un encoder transformer tipo BERT de tamaño MiniLM, con 12 capas y 384 dimensiones ocultas, heredado de `paraphrase-multilingual-MiniLM-L12-v2`. La adaptación se limita al bloque transformer final, que se reentrena sobre 1.027 pares de pasajes paralelos extraídos de 34 archivos de documentación de Python (originales en inglés y sus traducciones al turco, procedentes del repositorio `python/python-docs-tr`). El entrenamiento consistió en una única época con pérdida contrastiva simétrica, empleando como negativos las demás traducciones presentes en cada lote. El pooling es mean pooling enmascarado por `attention_mask`, seguido de normalización L2, tal como muestra el ejemplo de la model card.

No se especifican el número total de tokens de entrenamiento, la composición detallada del dataset ni si hubo etapas de RLHF o DPO (no aplicables a un encoder de recuperación). Tampoco se documentan innovaciones como decodificación especulativa o atención lineal, ya que el modelo es un encoder estándar para extracción de embeddings. La evaluación se realizó sobre diez archivos de documentación retenidos, con el aviso explícito de que el preentrenamiento del modelo base podría incluir material relacionado.

## Capacidades

- Generación de embeddings de frases y pasajes para búsqueda semántica y recuperación densa (feature-extraction).
- Recuperación cross-lingual inglés-turco: una consulta en inglés puede recuperar pasajes en turco y viceversa.
- Recuperación monolingüe dentro de cada idioma soportado.
- Emparejamiento semántico de documentos completos (evaluado en un dataset externo de CVs y ofertas de empleo).
- Soporte de tool calling / function calling: no disponible (no es un modelo generativo).
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: limitadas a inglés y turco según la model card.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Búsqueda semántica en documentación de Python bilingüe: indexar los pasajes de la documentación en inglés y turco con este encoder y servir consultas en cualquiera de los dos idiomas, devolviendo el fragmento equivalente en el otro, lo que resulta adecuado por su entrenamiento específico sobre pares paralelos de esa documentación.
- Asistente de consultas para desarrolladores turcos: un chatbot que reciba preguntas en turco sobre la API estándar de Python y recupere el pasaje relevante de la documentación en inglés para fundamentar la respuesta.
- Deduplicación y alineación de traducciones: detectar pasajes de documentación traducidos de forma inconsistente comparando embeddings entre el original y la traducción, aprovechando que el modelo fue afinado para acercar representaciones de pasajes paralelos.
- Enrutamiento de incidencias en soporte técnico: clasificar tickets en inglés o turco y enlazarlos con la sección de documentación correspondiente mediante similitud de embeddings.
- Filtrado preliminar de candidatos en reclutamiento técnico: usar el modelo como recuperador de primer nivel para ordenar ofertas frente a un CV, con la advertencia de que la propia model card indica que la idoneidad del candidato y los resultados de contratación no se midieron.
- Construcción de pipelines RAG ligeros: al ser un modelo de 117 millones de parámetros y 0,5 GB de repositorio, puede desplegarse como servicio de embeddings junto a un generador para responder preguntas sobre documentación técnica bilingüe con bajo coste de infraestructura.
- Evaluación comparativa de retrievers: servir como referencia reproducible para experimentos de adaptación de encoders multilingües, dado que el autor publica código de entrenamiento e informes de evaluación.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre recuperación de pasajes paralelos (conjunto de retención de diez archivos de documentación):

| Metrica | Base | Adaptado |
|---|---:|---:|
| Consulta en inglés contra 721 traducciones turcas (primer resultado correcto) | 669/721 | 674/721 |
| Consulta en turca contra 721 traducciones inglesas (primer resultado correcto) | 684/721 | 688/721 |
| Condición de empleo contra 30 pasajes de CV ficticios | 5/10 | 5/10 |

Diagnóstico externo de ranking de documentos completos (1.759 pares CV/oferta retenidos, dataset externo en inglés):

| Metodo | Ordenar ofertas para un CV (275 CV) | Ordenar CV para una oferta (61 ofertas) |
|---|---:|---:|
| Etiqueta media de entrenamiento del CV | 50,00% | 66,13% |
| Similitud coseno TF-IDF | 56,18% | 62,12% |
| Encoder base | 63,25% | 66,18% |
| Encoder adaptado | 64,58% | 65,11% |

En las cuatro combinaciones de idioma traducidas del diagnóstico de condiciones de empleo, los rangos de los objetivos apenas variaron: en turco/turco un objetivo pasó de cuarto a tercero y otro de primero a segundo; en turco/inglés uno pasó de quinto a sexto; las dos vistas con consulta en inglés mantuvieron los diez rangos originales.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en fp32 para los 117,6 millones de parámetros, más el overhead de activaciones según el tamaño de lote y la longitud de secuencia; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU para cargas moderadas. Para alto throughput, cualquier GPU moderna (RTX 3060 o superior, A100, H100) es más que suficiente.
- Cabe en GPU consumer: sí, en cualquier GPU con 2 GB o más de VRAM (GTX 1650, RTX 2060, RTX 4090, etc.).
- Opciones de despliegue: transformers (como en el ejemplo de la model card), Text Embeddings Inference (el tag `text-embeddings-inference` está presente) y endpoints compatibles (`endpoints_compatible`). No se documentan integraciones con vLLM, llama.cpp u Ollama, que no son adecuadas para un encoder de este tipo.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| `rezanicgil/python-tr-en-retriever` | 117,6 M | no disponible | en, tr | apache-2.0 | Afinado para pasajes paralelos de documentación de Python; 674/721 y 688/688 en recuperación de primer resultado |
| `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2` (base) | 117,6 M | no disponible | multilingüe | apache-2.0 | Modelo de partida; 669/721 y 684/721 en la misma evaluación, sin especialización en documentación de Python |
| TF-IDF coseno (línea base léxica) | no aplica | no aplica | según corpus | no aplica | 56,18% y 62,12% en el ranking externo de documentos completos, frente a 64,58% y 65,11% del encoder adaptado |

No se dispone de datos de otros retrievers densos comparables (por ejemplo, variantes de E5 o BGE multilingües) en la información proporcionada.

## Limitaciones y advertencias

- Las mejoras frente al modelo base son marginales: entre 4 y 5 aciertos adicionales sobre 721 en la primera posición, y sin mejora en el diagnóstico de CV (5/10 en ambos casos).
- La evaluación se basa en una única ejecución de entrenamiento y en objetivos de CV asignados por el propio autor; no se midieron la idoneidad del candidato ni los resultados de contratación.
- En el ranking externo de documentos completos, el encoder adaptado mejora al base al ordenar ofertas para un CV (64,58% frente a 63,25%) pero empeora ligeramente al ordenar CV para una oferta (65,11% frente a 66,18%).
- El dataset externo proporciona etiquetas a nivel de documento con procedencia de revisores no documentada; los resultados miden concordancia con su ordenación, no evidencia sobre requisitos individuales de un puesto.
- El preentrenamiento del modelo base podría incluir material relacionado con la documentación evaluada, lo que puede inflar los resultados de recuperación.
- Idiomas limitados a inglés y turco; no hay evidencia de buen rendimiento en otros idiomas pese al origen multilingüe del modelo base.
- No es un modelo generativo: no soporta tool calling, agentes ni razonamiento multi-paso; solo produce embeddings.
- Riesgo de alucinación no aplicable directamente (no genera texto), pero sí riesgo de recuperar pasajes semánticamente próximos pero incorrectos en dominios distintos de la documentación de Python.
- Licencia Apache 2.0: permite uso comercial con atribución; conviene conservar el aviso de licencia y las condiciones del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rezanicgil/python-tr-en-retriever
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2
- Código de entrenamiento: https://github.com/rezanicgil/job-radar-evidence/blob/main/scripts/train_translation_retrieval.py
- Informe de rangos por condición y detalles del split: https://github.com/rezanicgil/job-radar-evidence/blob/main/reports/translation-retrieval.json
- Auditoría y resultados a nivel de etiqueta del ranking externo: https://github.com/rezanicgil/job-radar-evidence/blob/main/reports/external-fit-ranking.json
- Traducciones al turco de la documentación de Python: https://github.com/python/python-docs-tr/tree/caa8b1e08b8534a1e1344a82889fc6c820768a91
- Dataset externo fijado: https://huggingface.co/datasets/cnamuangtoun/resume-job-description-fit/tree/08978e21714984bb417547d2c0f9b477f5298163
