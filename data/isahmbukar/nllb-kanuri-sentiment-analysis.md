# IsahMBukar/nllb-kanuri-sentiment-analysis

## Resumen

El modelo `IsahMBukar/nllb-kanuri-sentiment-analysis` es un clasificador de sentimiento en kanuri central (codigo ISO `knc`, escritura latina) desarrollado por IsahMBukar. Se trata de un ajuste fino del modelo multilingue `facebook/nllb-200-distilled-600M`, un transformer encoder-decoder de aproximadamente 600 millones de parametros disenado originalmente para traduccion automatica entre 200 idiomas. El ajuste lo reorienta hacia una tarea de clasificacion de texto con tres etiquetas: negativo, neutro y positivo.

El problema que aborda es la practicamente inexistente cobertura de herramientas de PLN para el kanuri, una lengua hablada en Nigeria y la region del lago Chad. El autor entrena sobre una version revisada y auditada de un lexico de sentimiento (`KanuriSentiUpdatedDateset.xlsx`) con mas de 10.000 frases, y publica tambien el corpus paralelo `IsahMBukar/kanurimt` (ingles-kanuri central), con licencia CC-BY-4.0. La relevancia actual reside en que amplía el catalogo de modelos de sentimiento para lenguas de bajos recursos, un area donde la mayoria de los idiomas africanos carece de recursos anotados.

La model card reporta un Macro-F1 de validacion de 0,7103, un Macro-F1 de test de 0,6823 y una exactitud de test de 0,6895. El repositorio ocupa 0,9 GB y, en el momento de la consulta, acumula 0 descargas y 0 "likes", por lo que se trata de una publicacion muy reciente y practicamente sin validacion externa por parte de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (heredada de `facebook/nllb-200-distilled-600M`), ajustada para clasificacion de texto |
| Parametros totales | aproximadamente 600 millones (modelo base NLLB-200-distilled) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; el modelo base NLLB-200-distilled-600M emplea ventanas de 512 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | kanuri central (`knc`) e ingles (`en`) |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio ocupa 0,9 GB) |

## Arquitectura y entrenamiento

La arquitectura de partida es la de NLLB-200, un transformer encoder-decoder con atencion completa y embeddings compartidos, en su variante "distilled" de 600 millones de parametros. El modelo original fue entrenado por Meta para traduccion automatica multilingue sobre 200 idiomas; en esta ficha se reutiliza como backbone y se ajusta para producir una etiqueta de sentimiento. La model card no detalla si la cabeza de clasificacion se anade sobre el encoder, si se reformula como generacion de etiquetas o si se congela parte del backbone, por lo que ese extremo queda como no disponible.

Los datos de entrenamiento proceden de una version refinada y con etiquetas auditadas de un lexico de sentimiento (`KanuriSentiUpdatedDateset.xlsx`) que contiene mas de 10.000 frases en kanuri. El autor no indica el numero de tokens procesados, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO. La propia model card advierte que el entrenamiento se hizo principalmente sobre un lexico de palabras y frases cortas, lo que condiciona fuertemente el comportamiento del modelo en texto conversacional o en frases largas.

No se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, destilacion propia u otras) mas alla del propio ajuste fino sobre el backbone NLLB.

## Capacidades

- Clasificacion de sentimiento en kanuri central con tres clases: negativo, neutro y positivo.
- Procesamiento de frases cortas y palabras sueltas, que es el regimen sobre el que se entreno.
- Cobertura bilingue declarada (`knc` y `en`) heredada del modelo base, aunque la tarea afinada es de clasificacion en kanuri.
- Salida de etiqueta unica por secuencia (clasificacion, no generacion abierta).
- Soporte de tokenizacion y carga estandar mediante la libreria `transformers` (la model card muestra un ejemplo con `AutoTokenizer` y `AutoModel`).
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo de "thinking".

## Casos de uso

- Monitorizacion de opinion en kanuri: clasificar comentarios o mensajes breves recogidos en redes sociales y foros para obtener un indicador de polaridad agregado, aprovechando que el modelo fue entrenado sobre vocabulario corto similar al que aparece en publicaciones breves.
- Anotacion asistida de corpus: usar el clasificador como preetiquetador para acelerar la construccion de nuevos conjuntos de sentimiento en kanuri, revisando despues manualmente las etiquetas de baja confianza.
- Investigacion linguistica comparada: medir como se distribuyen las categorias de sentimiento en distintos subcorpus de kanuri (por ejemplo, prensa frente a textos orales transcritos) para estudios sociolinguisticos.
- Filtrado de contenido en plataformas comunitarias: detectar mensajes de polaridad negativa en foros de comunidades kanuriparlantes y derivarlos a moderacion humana, con las salvedades de precision descritas mas abajo.
- Analisis de encuestas y formularios abiertos: procesar respuestas cortas en kanuri recogidas en cuestionarios de campo y resumir la proporcion de respuestas positivas, neutras y negativas.
- Componente en pipelines de PLN multilingue: integrar la clasificacion de sentimiento en kanuri junto a los modelos de traduccion NLLB y el corpus `kanurimt` para construir soluciones de analisis de texto de extremo a extremo en esta lengua.
- Docencia y experimentacion: servir como punto de partida reproducible para cursos o trabajos sobre PLN en lenguas de bajos recursos, dado que el modelo base y el dataset asociado son publicos.

## Benchmarks y rendimiento

Los unicos resultados publicados son los que aparecen en la model card del autor. No se ha localizado una comparacion independiente con otros modelos.

| Metrica | Valor |
|---|---|
| Macro-F1 (validacion) | 0,7103 |
| Macro-F1 (test, todas las etiquetas) | 0,6823 |
| Exactitud (test) | 0,6895 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks generales en la informacion disponible, lo cual es coherente con la naturaleza especializada y de bajos recursos de la tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamano del backbone (600 millones de parametros), en fp32 el modelo ronda los 2,4 GB de pesos y en fp16/bf16 alrededor de 1,2 GB, a lo que hay que sumar la memoria del tokenizador, activaciones y overhead del runtime.
- GPU recomendadas: no especificadas por el autor. Por tamano, cualquier GPU con 4-8 GB de VRAM seria suficiente en teoria para inferencia en precision reducida.
- Cabe en GPU de consumo: si, previsiblemente en tarjetas como RTX 3060, RTX 4060, RTX 4090 o equivalentes, e incluso en CPU para lotes pequenos.
- Opciones de despliegue: la documentada es la libreria `transformers` mediante el pipeline de `text-classification`. No se mencionan integraciones con vLLM, llama.cpp, Ollama, TGI ni otras.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se han encontrado en la informacion proporcionada otros modelos publicos de analisis de sentimiento especificos para kanuri con los que comparar directamente. La tabla siguiente recoge unicamente los elementos sobre los que existe informacion, marcando como no disponible lo que no se conoce.

| Modelo | Parametros | Contexto | Rendimiento reportado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `IsahMBukar/nllb-kanuri-sentiment-analysis` | aproximadamente 600 M (base NLLB) | no disponible | Macro-F1 test 0,6823; exactitud 0,6895 | no disponible | HuggingFace Hub |
| `facebook/nllb-200-distilled-600M` (modelo base, no clasificador) | aproximadamente 600 M | 512 tokens (segun el modelo base) | no aplica (tarea de traduccion) | CC-BY-NC-4.0 en el modelo original de Meta (segun su model card publica, no confirmado en esta fuente) | HuggingFace Hub |
| Otros clasificadores de sentimiento multilingues (por ejemplo variantes de XLM-R o AfroXLMR) | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El propio autor advierte que el modelo se entreno sobre un lexico de palabras y frases, por lo que su rendimiento probablemente cae en frases largas, texto conversacional, tuits sin procesar o traducciones de corpus modernos.
- Las metricas de test (Macro-F1 0,6823 y exactitud 0,6895) son moderadas y dejan margen de error apreciable en las tres clases; en produccion conviene umbral de confianza y revision humana.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si existe riesgo de clasificaciones incorrectas, especialmente en dominios alejados del lexico de entrenamiento.
- El conjunto de entrenamiento procede de una fuente lexicografica, lo que puede introducir sesgos de seleccion: vocabulario formal o normativo, posiblemente poco representativo del habla coloquial.
- No se documenta el tratamiento de variedades dialectales del kanuri ni de mezcla de codigos con ingles o hausa.
- La licencia no esta especificada en la informacion disponible, por lo que el uso comercial queda en un limbo legal hasta que el autor la defina.
- El modelo acumula 0 descargas y 0 "likes" y no cuenta con evaluacion independiente; la unica validacion es la reportada por el propio autor.
- La model card contiene un ejemplo de uso incompleto (solo se muestra la carga del tokenizer, sin codigo de inferencia ni etiquetado), lo que dificulta la reproduccion directa.
- La fecha de creacion del repositorio (2026-10-01) resulta anomala respecto a la fecha de consulta, lo que sugiere una posible inconsistencia en los metadatos del Hub.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/IsahMBukar/nllb-kanuri-sentiment-analysis
- Dataset asociado `kanurimt`: https://huggingface.co/datasets/IsahMBukar/kanurimt
- Ficheros del dataset `kanurimt`: https://huggingface.co/datasets/IsahMBukar/kanurimt/tree/main
- Modelo base: https://huggingface.co/facebook/nllb-200-distilled-600M
- Articulo "KanuriSenti: A novel dataset for sentiment analysis in the under-resourced Kanuri language" (PMC): https://pmc.ncbi.nlm.nih.gov/articles/PMC12226035/
- Articulo "KanuriSenti" en ScienceDirect: https://www.sciencedirect.com/science/article/pii/S2352340925004858
- Publicacion en LinkedIn del autor sobre `kanurimt`: https://www.linkedin.com/posts/isahmbukar_africanlanguages-nlp-machinetranslation-activity-7459638174445756417-zZe0
