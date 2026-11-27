# DolphyWind/bert-base-turkish-cased-simcse

## Resumen

bert-base-turkish-cased-simcse es un modelo de embeddings de frases para turco desarrollado por DolphyWind, obtenido mediante ajuste fino del checkpoint dbmdz/bert-base-turkish-cased con la metodología SimCSE. Su funcion es transformar oraciones en vectores densos de 768 dimensiones mediante mean pooling, de modo que la similitud coseno entre vectores refleje la similitud semantica entre las frases originales. Resuelve el problema de la busqueda semantica y la comparacion de textos en turco, un idioma con relativamente pocos recursos de embeddings de alta calidad.

El modelo se entrena en dos fases: una primera fase no supervisada de aprendizaje contrastivo sobre un subconjunto de 1 millon de frases del corpus web DolphyWind/vngrs-web-corpus-sentences, y una segunda fase supervisada sobre el dataset de inferencia de lenguaje natural emrecan/nli_tr_for_simcse. Con 110.617.344 parametros, se posiciona como una alternativa ligera y de codigo abierto (licencia MIT) frente a modelos de embeddings turcos de mayor tamano.

Es relevante ahora porque compite directamente con alternativas establecidas del ecosistema turco (emrecan/bert-base-turkish-cased-mean-nli-stsb-tr, ytu-ce-cosmos/modernbert-tr-embed, trmteb/turkish-embedding-model-fine-tuned y ytu-ce-cosmos/turkish-e5-large), obteniendo el mejor promedio agregado en las cinco tareas de evaluacion reportadas por el autor, tanto en correlacion de Spearman como de Pearson.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT (base), con mean pooling para embeddings de frase |
| Parametros totales | 110.617.344 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (modelo BERT base; el limite habitual es 512 tokens, pero no se confirma en la ficha) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion via herramientas externas como llama.cpp u ONNX, no documentado por el autor) |
| Idiomas soportados | turco (tr) |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria sentence-transformers) |
| Dimension del embedding | 768 |
| Modelo base | dbmdz/bert-base-turkish-cased |
| Tamano del repositorio | 0.9 GB |

## Arquitectura y entrenamiento

El modelo parte de dbmdz/bert-base-turkish-cased, un encoder transformer de tipo BERT en su variante base (12 capas, 768 dimensiones ocultas, aproximadamente 110 millones de parametros), con tokenizacion case-sensitive adaptada al turco. Sobre este checkpoint se aplica mean pooling para agregar las representaciones de los tokens en un unico vector de frase de 768 dimensiones, que es el que se compara mediante similitud coseno.

El entrenamiento consta de dos etapas. La primera es un entrenamiento contrastivo no supervisado de estilo SimCSE++ sin el termino de aprendizaje contrastivo por dimensiones (DCL), realizado sobre un subconjunto de 1 millon de frases del corpus DolphyWind/vngrs-web-corpus-sentences. La segunda etapa es un SimCSE supervisado sobre emrecan/nli_tr_for_simcse, empleando la funcion de perdida CachedMultipleNegativesRankingLoss y utilizando la columna `hard_neg` como negativo duro. No se documentan en la informacion disponible detalles adicionales sobre el numero total de tokens procesados, la composicion exacta de los datasets ni el uso de RLHF o DPO (procedimientos no habituales en modelos de embeddings).

## Capacidades

- Generacion de embeddings de frases en turco: mapea oraciones a vectores de 768 dimensiones mediante mean pooling.
- Similitud semantica: calculo de similitud coseno entre pares de frases para tareas de matching y deduplicacion.
- Extraccion de caracteristicas (feature-extraction): uso del encoder como extractor de representaciones para tareas posteriores.
- Recuperacion semantica: adecuado para busqueda densa y ranking de documentos en turco.
- Clasificacion de pares de frases: entrenado con datos NLI, por lo que captura relaciones de implicacion, contradiccion y neutralidad.
- Soporte de tool calling / function calling: no disponible (no es un modelo generativo).
- Soporte de agentes y razonamiento multi-paso: no disponible (no es un modelo generativo).
- Capacidades multilingues: limitadas al turco segun la model card; no se declara soporte de otros idiomas.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Busqueda semantica en turco: indexar un corpus de documentos turcos con los embeddings de 768 dimensiones y recuperar los pasajes mas similares a una consulta mediante similitud coseno, sin depender de coincidencia exacta de palabras.
- Deduplicacion de contenido web: comparar pares de frases o parrafos del corpus vngrs-web-corpus-sentences para detectar duplicados semanticos antes de construir un dataset de entrenamiento.
- Clasificacion de textos por similitud: asignar etiquetas comparando la representacion de un texto con prototipos de cada clase, util en moderacion de contenido o enrutado de tickets en turco.
- Sistemas de preguntas y respuestas extractivas: seleccionar el pasaje mas relevante de una base documental turca comparando la similitud entre la pregunta y cada fragmento candidato.
- Agrupamiento (clustering) de opiniones o resenas: agrupar resenas de usuarios turcos por tematica usando los embeddings como entrada a algoritmos de clustering como k-means o HDBSCAN.
- Deteccion de parafrasis y plagio: comparar pares de oraciones con la similitud coseno para identificar reformulaciones, apoyandose en el entrenamiento supervisado con datos NLI.
- Filtrado y curacion de datasets: puntuar la similitud entre pares de frases para seleccionar ejemplos de alta calidad en pipelines de datos en turco.
- Recomendacion de contenido: calcular la similitud entre el historial de un usuario y el catalogo de articulos o productos descritos en turco.

## Benchmarks y rendimiento

Los resultados publicados por el autor son correlaciones entre la similitud coseno y las puntuaciones de referencia, multiplicadas por 100. El mejor resultado por columna aparece en negrita en la model card original.

Spearman (cosine):

| Modelo | STS-B | NLI-TR | CxC | SICK-R | STR-2022 | Media |
|---|---|---|---|---|---|---|
| DolphyWind/bert-base-turkish-cased-simcse | 83.92 | 49.88 | 67.25 | **76.07** | **79.82** | **71.39** |
| emrecan/bert-base-turkish-cased-mean-nli-stsb-tr | **86.05** | 47.43 | 66.95 | 75.55 | 77.06 | 70.61 |
| ytu-ce-cosmos/modernbert-tr-embed | 80.24 | 48.72 | **67.82** | 75.21 | 75.65 | 69.53 |
| trmteb/turkish-embedding-model-fine-tuned | 81.71 | **50.76** | 65.74 | 73.93 | 71.65 | 68.76 |
| ytu-ce-cosmos/turkish-e5-large | 83.19 | 39.02 | 66.85 | 75.44 | 76.00 | 68.10 |

Pearson (cosine):

| Modelo | STS-B | NLI-TR | CxC | SICK-R | STR-2022 | Media |
|---|---|---|---|---|---|---|
| DolphyWind/bert-base-turkish-cased-simcse | 84.31 | **50.23** | **69.10** | **80.77** | **80.23** | **72.93** |
| emrecan/bert-base-turkish-cased-mean-nli-stsb-tr | **86.05** | 47.66 | 68.83 | 80.70 | 77.83 | 72.21 |
| ytu-ce-cosmos/modernbert-tr-embed | 79.67 | 47.98 | 68.86 | 79.98 | 76.52 | 70.60 |
| trmteb/turkish-embedding-model-fine-tuned | 81.01 | 50.20 | 67.08 | 78.69 | 71.83 | 69.76 |
| ytu-ce-cosmos/turkish-e5-large | 82.98 | 39.61 | 68.35 | 79.48 | 77.47 | 69.58 |

Datasets y splits empleados: STS-B (emrecan/stsb-mt-turkish, validation), NLI-TR (emrecan/all-nli-tr, pair-score, test), CxC (DolphyWind/cxc-sts-mt-turkish, split 80-20, validation), SICK-R (DolphyWind/sickr-sts-mt-turkish, test) y STR-2022 (traducido automaticamente, train).

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0.45 GB en fp32 (110,6 M de parametros x 4 bytes); en fp16 alrededor de 0.25 GB; en int8 alrededor de 0.12 GB. Estas cifras no incluyen el overhead de activaciones ni del tokenizador.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente, incluidas GTX 1050 Ti, GTX 1650, RTX 3050, RTX 4060, RTX 4090, A100 y H100. Para lotes grandes conviene disponer de 8-16 GB.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo moderna e incluso en CPU para cargas moderadas.
- Opciones de despliegue: sentence-transformers (referencia), Hugging Face Text Embeddings Inference (tag text-embeddings-inference), ONNX Runtime, y exportacion a formatos cuantizados mediante herramientas externas. Compatible con endpoints de Hugging Face (tag endpoints_compatible).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Al tratarse de un BERT base, se espera un throughput alto en GPU para lotes de cientos de frases, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Media Spearman | Media Pearson | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| DolphyWind/bert-base-turkish-cased-simcse | 110.617.344 | no disponible | 71.39 | 72.93 | MIT | Hugging Face |
| emrecan/bert-base-turkish-cased-mean-nli-stsb-tr | no disponible | no disponible | 70.61 | 72.21 | no disponible | Hugging Face |
| ytu-ce-cosmos/modernbert-tr-embed | no disponible | no disponible | 69.53 | 70.60 | no disponible | Hugging Face |
| trmteb/turkish-embedding-model-fine-tuned | no disponible | no disponible | 68.76 | 69.76 | no disponible | Hugging Face |
| ytu-ce-cosmos/turkish-e5-large | no disponible | no disponible | 68.10 | 69.58 | no disponible | Hugging Face |

El modelo destaca por su mejor media agregada en ambas metricas, aunque cede en STS-B frente a emrecan/bert-base-turkish-cased-mean-nli-stsb-tr y en NLI-TR (Spearman) frente a trmteb/turkish-embedding-model-fine-tuned. Su principal ventaja competitiva es la licencia MIT explicita y un tamano reducido que facilita el despliegue en entornos con recursos limitados.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse sobre un corpus web (vngrs-web-corpus-sentences) y datos NLI traducidos, puede heredar sesgos de dominio, registro y representacion presentes en esas fuentes; no se documenta un analisis de sesgo.
- Riesgo de alucinacion: no aplica en sentido generativo, pero la similitud coseno puede producir falsos positivos en textos con solapamiento lexico sin equivalencia semantica real.
- Limitaciones de contexto: no se confirma en la informacion disponible la longitud maxima de secuencia; al derivar de BERT base, es probable que este limitada a 512 tokens, lo que restringe el uso sobre documentos largos sin troceado previo.
- Limitaciones de idioma: el modelo esta declarado unicamente para turco; su rendimiento en otros idiomas no esta evaluado ni garantizado.
- Restricciones de licencia: licencia MIT, que permite uso comercial, modificacion y redistribucion con aviso de copyright; conviene verificar las licencias de los datasets de entrenamiento por si imponen condiciones adicionales.
- Caveats para produccion: el modelo tiene 0 descargas y 1 like en el momento de la consulta, por lo que su validacion externa es practicamente nula; los benchmarks son autoinformados por el autor y las tareas de evaluacion incluyen datasets traducidos automaticamente (STR-2022, CxC, SICK-R, STS-B), lo que puede introducir artefactos de traduccion.
- No es un modelo generativo: no soporta tool calling, agentes ni razonamiento multi-paso; su uso esta acotado a representacion y comparacion de frases.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DolphyWind/bert-base-turkish-cased-simcse
- Modelo base: https://huggingface.co/dbmdz/bert-base-turkish-cased
- Dataset de entrenamiento no supervisado: https://huggingface.co/datasets/DolphyWind/vngrs-web-corpus-sentences
- Dataset de entrenamiento supervisado: https://huggingface.co/datasets/emrecan/nli_tr_for_simcse
- Dataset de evaluacion STS-B: https://huggingface.co/datasets/emrecan/stsb-mt-turkish
- Dataset de evaluacion NLI-TR: https://huggingface.co/datasets/emrecan/all-nli-tr
- Dataset de evaluacion CxC: https://huggingface.co/datasets/DolphyWind/cxc-sts-mt-turkish
- Dataset de evaluacion SICK-R: https://huggingface.co/datasets/DolphyWind/sickr-sts-mt-turkish
- Modelo comparable emrecan/bert-base-turkish-cased-mean-nli-stsb-tr: https://huggingface.co/emrecan/bert-base-turkish-cased-mean-nli-stsb-tr
- Modelo comparable ytu-ce-cosmos/modernbert-tr-embed: https://huggingface.co/ytu-ce-cosmos/modernbert-tr-embed
- Modelo comparable trmteb/turkish-embedding-model-fine-tuned: https://huggingface.co/trmteb/turkish-embedding-model-fine-tuned
- Modelo comparable ytu-ce-cosmos/turkish-e5-large: https://huggingface.co/ytu-ce-cosmos/turkish-e5-large
