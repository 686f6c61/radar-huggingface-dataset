# genbyq/dl2-hw02-ner

## Resumen

`genbyq/dl2-hw02-ner` es un modelo de reconocimiento de entidades nombradas (NER) en inglés obtenido por ajuste fino (*fine-tuning*) de `BAAI/bge-small-en-v1.5`, un encoder tipo BERT de 33,2 millones de parámetros (33.215.625 exactos, según el recuento de safetensors). El autor lo publica como entrega de una tarea docente, tal como indica el identificador del repositorio, y lo entrena sobre la parte etiquetadade `voorhs/conll2003-corrupted`, una versión corrompida del clásico corpus CoNLL-2003.

El modelo resuelve una tarea clásica de etiquetado de secuencias: asigna etiquetas BIO a cada token para cuatro tipos de entidad (PER, LOC, ORG y MISC). No es un modelo generativo ni conversacional, sino un clasificador de tokens que se integra como componente de extracción de información dentro de pipelines mayores.

Su relevancia es fundamentalmente práctica y didáctica: demuestra que un encoder pequeño (33 M de parámetros, menos de 0,1 GB de repositorio) puede alcanzar un F1 de 0,8767 en la partición de test de un corpus con ruido, lo que lo hace viable para inferencia en CPU y para entornos con recursos muy limitados. El autor advierte explícitamente de que no ha comprobado el rendimiento fuera de ese conjunto de datos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder transformer tipo BERT con cabeza de clasificación de tokens (base: `BAAI/bge-small-en-v1.5`) |
| Parámetros totales | 33.215.625 (≈33,2 M) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la model card; el modelo base `BAAI/bge-small-en-v1.5` admite secuencias de hasta 512 tokens |
| Tipos de cuantización | No disponible (el repositorio solo distribuye pesos en safetensors; no se documentan variantes cuantizadas) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | No disponible (el autor no la especifica) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer estilo BERT heredado de `BAAI/bge-small-en-v1.5`, al que se le ha añadido una cabeza de clasificación token a token sobre el esquema BIO de CoNLL-2003 (PER, LOC, ORG, MISC). El ajuste se realizó sobre la parte etiquetada de `voorhs/conll2003-corrupted`; según el autor, las filas marcadas como `MISSING` se eliminaron de la muestra de entrenamiento habitual para evitar que el modelo aprendiera a etiquetar tokens corruptos.

El proceso de ajuste de hiperparámetros consistió en 20 pruebas (20 *trials*) sobre un subconjunto de 2.048 ejemplos de entrenamiento y 512 de validación. La mejor configuración fue un *learning rate* de 5,7456e-5 y un tamaño de lote de 4. Tras reentrenar sobre toda la partición etiquetada, el F1 medido con `seqeval` en la partición de test alcanzó 0,8767. Este *checkpoint* corresponde a la variante sin ejemplos sintéticos; una variante adicional con 10 ejemplos reetiquetados manualmente obtuvo un F1 de 0,8680. No se documentan el número de tokens de entrenamiento, la composición detallada del dataset, ni fases de RLHF, DPO o ajuste por preferencias, algo esperable en un modelo encoder de clasificación.

## Capacidades

- Reconocimiento de entidades nombradas en inglés con el esquema BIO de cuatro clases: persona (PER), localización (LOC), organización (ORG) y miscelánea (MISC).
- Etiquetado a nivel de token, apto para extracción de entidades y *chunking* posterior.
- Procesamiento de documentos en inglés con la longitud de secuencia que admita el modelo base (típicamente 512 tokens, con ventana deslizante si se necesita texto más largo).
- Integración directa con la pipeline `token-classification` de Hugging Face Transformers.
- Evaluación mediante `seqeval`, la métrica estándar para tareas de etiquetado de secuencias.
- No dispone de modo de razonamiento (*thinking*), visión, audio, *tool calling*, capacidades de agente ni generación de texto libre.
- No se documentan capacidades multilingües: el modelo se declara únicamente en inglés.

## Casos de uso

- Extracción de entidades en noticias en inglés: el modelo identifica personas, organizaciones y localizaciones en textos periodísticos, alimentando índices de búsqueda o sistemas de recomendación de contenido.
- Anonimización y seudonimización de datos: dado que detecta etiquetas PER, LOC y ORG, puede usarse como paso previo para enmascarar nombres propios en corpus que deban compartirse o publicarse.
- Preprocesado de pipelines de *information extraction*: sus etiquetas BIO sirven como entrada a un enlazador de entidades o a un sistema de extracción de relaciones, evitando entrenar un NER desde cero.
- Enriquecimiento de registros en bases de datos: normalización de campos de empresa, ciudad o persona a partir de campos de texto libre en CRM o formularios.
- Análisis de opiniones y soporte al cliente: detección de marcas, productos y ubicaciones mencionadas en reseñas o tickets en inglés para clasificarlos y enrutarlos automáticamente.
- Anotación asistida de corpus: el modelo puede generar preanotaciones sobre texto sin etiquetar que después revisa un humano, reduciendo el coste de construir nuevos conjuntos de datos NER.
- Despliegue en entornos con recursos limitados: con 33 M de parámetros, puede ejecutarse en CPU o en GPU de gama baja dentro de un servicio de extracción de entidades en tiempo real.
- Evaluación comparativa de robustez ante ruido: al estar entrenado sobre un corpus corrompido, sirve como referencia en experimentos sobre tolerancia a errores en los datos de entrada.

## Benchmarks y rendimiento

| Benchmark / partición | Métrica | Resultado |
|---|---|---|
| `voorhs/conll2003-corrupted`, test (variante sin ejemplos sintéticos) | F1 (`seqeval`) | 0,8767 |
| `voorhs/conll2003-corrupted`, test (variante con 10 ejemplos reetiquetados) | F1 (`seqeval`) | 0,8680 |

No se han publicado en la información disponible resultados en MMLU, HumanEval, GSM8K ni en otros benchmarks estándar, ni cifras comparables en la partición original de CoNLL-2003. Tampoco se documentan precision, recall ni F1 por clase de entidad.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 133 MB en fp32, 66 MB en fp16 y 33 MB en int8, calculados a partir de los 33,2 M de parámetros.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria libre es suficiente (GTX 1050 Ti, GTX 1650, T4, RTX 3060, RTX 4090, A100 o H100 quedan sobredimensionadas para este modelo).
- Cabe holgadamente en GPU de consumo; también es viable la inferencia en CPU para volúmenes moderados.
- Opciones de despliegue: pipeline `token-classification` de Hugging Face Transformers, exportación a ONNX Runtime o TorchScript, y servicio mediante FastAPI o TorchServe. Las herramientas orientadas a modelos generativos (vLLM, llama.cpp, Ollama, TGI) no están pensadas para un encoder de clasificación de tokens.
- Latencia y throughput: no disponible; no se han publicado medidas en la información proporcionada.
- No requiere paralelismo de tensor ni *sharding*: el modelo completo cabe en cualquier dispositivo moderno.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `genbyq/dl2-hw02-ner` | 33,2 M | NER (PER, LOC, ORG, MISC) en inglés | No disponible (base de 512 tokens) | No disponible | Hugging Face |
| `BAAI/bge-small-en-v1.5` | ≈33 M | Embeddings de texto (no NER) | 512 tokens | MIT, según su model card pública | Hugging Face |
| `dslim/bert-base-NER` | ≈109 M | NER (PER, LOC, ORG, MISC) en inglés | 512 tokens | MIT, según su model card pública | Hugging Face |

Los datos de los modelos comparativos proceden de sus fichas públicas y no se han verificado en el marco de esta ficha; el rendimiento de `genbyq/dl2-hw02-ner` (F1 0,8767) no es directamente comparable con ellos porque se ha medido sobre `voorhs/conll2003-corrupted`, una versión alterada de CoNLL-2003. No se dispone de resultados de este modelo en la partición estándar de CoNLL-2003 ni de comparaciones publicadas con alternativas de tamaño similar.

## Limitaciones y advertencias

- Modelo declarado por el autor como destinado a una tarea académica: no ha verificado su comportamiento fuera del corpus de entrenamiento, por lo que la generalización a otros dominios es incierta.
- La licencia no está especificada en la model card, lo que impide confirmar si se permite el uso comercial; debe contactarse con el autor antes de utilizarlo en producción.
- Únicamente soporta inglés; no se documentan capacidades en otros idiomas.
- El conjunto de etiquetas está restringido a PER, LOC, ORG y MISC del esquema CoNLL-2003; no cubre tipos como fechas, cantidades, productos o direcciones.
- El entrenamiento se realizó sobre un corpus corrompido (`voorhs/conll2003-corrupted`) y eliminando las filas con `MISSING`, lo que puede sesgar el modelo hacia las características del ruido presente en ese dataset.
- Riesgo de alucinación de entidades: como todo clasificador de secuencias, puede etiquetar como entidad términos que no lo son, especialmente en textos fuera de dominio.
- Posible degradación ante entidades poco frecuentes en CoNLL-2003, como organizaciones modernas, marcas o nombres no occidentales.
- No se documentan análisis de sesgo demográfico, geográfico o de género.
- El límite de longitud de secuencia del modelo base obliga a segmentar documentos largos con ventana deslizante, lo que puede fragmentar entidades que cruzan el límite de la ventana.
- El repositorio tiene 0 descargas y 0 *likes*, y una única revisión: no hay evidencia de uso en producción ni validación independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/genbyq/dl2-hw02-ner
- Modelo base: https://huggingface.co/BAAI/bge-small-en-v1.5
- Dataset de entrenamiento: https://huggingface.co/datasets/voorhs/conll2003-corrupted
