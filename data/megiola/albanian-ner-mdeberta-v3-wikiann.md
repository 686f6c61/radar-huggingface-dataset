# Megiola/albanian-ner-mdeberta-v3-wikiann

## Resumen

El modelo `Megiola/albanian-ner-mdeberta-v3-wikiann` es un encoder especializado en reconocimiento de entidades nombradas (NER) para albanés, desarrollado por Megiola Kelaj en el marco de su tesis de máster en la University of New York Tirana (2026). Se trata de un fine-tuning de `microsoft/mdeberta-v3-base` sobre la partición albanesa del corpus WikiANN, orientado a detectar tres categorías de entidad: persona (PER), organización (ORG) y localización (LOC). El modelo resuelve la tarea de etiquetado a nivel de token mediante la pipeline `token-classification` de Transformers.

Con 278.224.135 parámetros y un repositorio de 1,1 GB en formato safetensors, es un modelo compacto pensado para inferencia en hardware modesto (el entrenamiento se realizó en una única NVIDIA T4). Su relevancia radica en cubrir una lengua con escasa representación en herramientas NER de calidad, aunque con una advertencia importante: el rendimiento cae de forma notable al salir del dominio Wikipedia, lo que condiciona su uso en producción sobre texto administrativo o parlamentario.

La ficha técnica refleja tanto las cifras publicadas por el autor (F1 micro de 0,937 en WikiANN-sq frente a 0,684 en un test administrativo) como las limitaciones explícitas de convenciones de etiquetado heredadas de WikiANN.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DeBERTa-v2, variante multilingüe mDeBERTa-v3) |
| Parametros totales | 278.224.135 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible como contexto generativo; entrenamiento con máximo de 256 subwords |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente fp32 tras el fine-tuning) |
| Idiomas soportados | albanés (sq) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `microsoft/mdeberta-v3-base`, un encoder Transformer de la familia DeBERTa-v2 con atención desacoplada y embedding de posiciones relativas, adaptado al multilingüe. Sobre esa base se añade una cabeza de clasificación de tokens para las etiquetas BIO de PER, ORG y LOC (sin categoría MISC). El fine-tuning se realizó sobre WikiANN-sq con particiones de 5.000 / 1.000 / 1.000 frases (Rahimi et al., 2019), learning rate 3e-05, batch size 16, 5 épocas, schedule lineal con 10 % de warm-up, weight decay 0,01, longitud máxima de 256 subwords, etiquetado sobre el primer subword y precisión fp32. La selección del checkpoint se hizo por mejor F1 en validación de WikiANN; el checkpoint publicado corresponde a la semilla 3 y se entrenó en una NVIDIA T4.

No se documenta uso de RLHF, DPO ni decodificación especulativa; es un modelo discriminativo de etiquetado, no generativo. La innovación principal del trabajo es la evaluación sistemática de configuraciones de encoders multilingües y modelos abiertos sobre un nuevo conjunto de test administrativo en albanés, además de la publicación de ese test set.

## Capacidades

- Reconocimiento de entidades nombradas en albanés para las categorías PER, ORG y LOC.
- Etiquetado a nivel de token con estrategia de agregación configurable (`aggregation_strategy="first"` en la pipeline).
- Integración directa con la pipeline `token-classification` de Transformers.
- Compatible con endpoints de Hugging Face (`endpoints_compatible`).
- No soporta tool calling, function calling ni razonamiento multi-paso: no es un modelo generativo.
- No dispone de modo thinking, visión ni audio.
- Capacidad multilingüe limitada al albanés en la práctica, aunque el backbone sea multilingüe.

## Casos de uso

- Extracción de entidades en corpus periodísticos albaneses: el modelo identifica personas, organizaciones y lugares en artículos de Wikipedia y prensa con un F1 de 0,937 en el dominio de entrenamiento, útil para construir índices de entidades y grafos de conocimiento.
- Preprocesado para pipelines de búsqueda y recuperación: etiquetar entidades en documentos albaneses permite enriquecer índices con metadatos y mejorar consultas facetadas.
- Anonimización y enmascarado de datos personales: la detección de PER permite sustituir nombres propios en textos antes de su publicación o compartición, con la cautela de que el recall en dominios no vistos puede ser inferior.
- Análisis de discurso político con revisión humana: sobre texto parlamentario el F1 global baja a 0,684, por lo que es adecuado como primer paso asistido, no como extractor autónomo, especialmente en ORG (0,566).
- Etiquetado asistido para anotación: el modelo puede preanotar corpus albaneses y acelerar el trabajo de anotadores humanos, con corrección posterior de las convenciones de WikiANN (documentos, cargos y nombres largos con artículos de enlace).
- Extracción de menciones geográficas en contenidos locales: la categoría LOC alcanza 0,858 en el test administrativo, lo que permite geolocalizar noticias o documentos con una fiabilidad razonable.
- Monitorización de menciones de organizaciones en redes o medios: útil para seguimiento de marca o de instituciones, asumiendo la tasa de error en ORG fuera de dominio.

## Benchmarks y rendimiento

Resultados publicados por el autor (F1 micro, coincidencia exacta de entidad):

| Test set | PER | ORG | LOC | All |
|---|---|---|---|---|
| WikiANN-sq test (Wikipedia, 1.000 frases) | 0,963 | 0,914 | 0,937 | 0,937 |
| Test administrativo albanés (parlamento y gobierno, 691 frases) | 0,898 | 0,566 | 0,858 | 0,684 |

Media entre tres semillas en la tesis: 0,935 ± 0,002 en WikiANN y 0,630 ± 0,071 en el test administrativo. El checkpoint publicado corresponde a la semilla 3.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,1 GB en fp32 para los pesos; en fp16 alrededor de 0,6 GB, más overhead de activaciones (bajo con secuencias de 256 subwords).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el entrenamiento se validó en una NVIDIA T4.
- Cabe en GPU de consumo: sí, en tarjetas como GTX 1650, RTX 3050, RTX 4060 o superiores.
- Opciones de despliegue: pipeline de Transformers, Text Generation Inference (TGI) no aplica por ser encoder, vLLM no orientado a token-classification, y exportación a ONNX para servir con ONNX Runtime; también es posible servirlo con FastAPI envolviendo la pipeline.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Megiola/albanian-ner-mdeberta-v3-wikiann | 278 M | 256 subwords (entrenamiento) | albanés | MIT | Hugging Face |
| xlm-roberta-base fine-tuned para NER | ~278 M | 512 subwords | multilingüe | MIT | Hugging Face (múltiples checkpoints) |
| bert-base-multilingual-cased fine-tuned para NER | ~178 M | 512 subwords | multilingüe | Apache 2.0 | Hugging Face |
| mdeberta-v3-base sin fine-tune | 278 M | 512 subwords | multilingüe | MIT | Hugging Face |

No se dispone de resultados comparativos de benchmarks de estos modelos sobre WikiANN-sq o el test administrativo en la información proporcionada; el autor evalúa varias configuraciones en la tesis, pero no se incluyen aquí sus cifras.

## Limitaciones y advertencias

- Dominio: entrenado sobre Wikipedia; en texto parlamentario y administrativo pierde aproximadamente 30 puntos de F1 (0,937 frente a 0,684).
- Convenciones de etiquetado: WikiANN deriva las etiquetas de enlaces de Wikipedia, por lo que el modelo suele marcar documentos (leyes, estrategias), cargos y palabras genéricas de institución que muchas guías NER considerarían palabras comunes.
- Segmentación de nombres largos: corta incorrectamente nombres de instituciones albanesas con artículos de enlace (*e, i, të, së*).
- Categorías: solo PER, ORG y LOC; no detecta MISC.
- Variabilidad: los resultados varían varios puntos entre semillas aleatorias sobre texto nuevo (desviación de ±0,071 en el test administrativo).
- Riesgo de falsos negativos en dominios no vistos, especialmente en ORG (F1 0,566 en el test administrativo).
- Licencia MIT: permite uso comercial, pero conviene verificar las condiciones del corpus WikiANN subyacente.
- No es un modelo generativo: no admite instrucciones en lenguaje natural ni razonamiento; su salida es exclusivamente etiquetas de token.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Megiola/albanian-ner-mdeberta-v3-wikiann
- Modelo base: https://huggingface.co/microsoft/mdeberta-v3-base
- Test set administrativo: https://huggingface.co/datasets/Megiola/albanian-admin-ner-test
- Dataset WikiANN: https://huggingface.co/datasets/unimelb-nlp/wikiann
- Paper de WikiANN (Rahimi et al., 2019): https://arxiv.org/abs/1902.00193
- Paper de DeBERTa-v3: https://arxiv.org/abs/2111.09543
