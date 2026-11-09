# mariakrissmer/ALIAS-MB

## Resumen

ALIAS-MB es un modelo de embeddings de frases (sentence-transformer) desarrollado por Maria Krissmer, etiquetado como **MB** en el manuscrito ALIAS. Se basa en el encoder BERT `NeuML/pubmedbert-base-embeddings` (109,48 millones de parametros) y se ha afinado para proyectar descripciones de celulas y texto biomedico en un espacio vectorial compartido, de modo que terminos equivalentes como "CD8 T cell" y "cytotoxic T lymphocyte" queden proximos en el espacio de embeddings. Su proposito es servir de herramienta de investigacion para tareas de similitud semantica en el ambito de la biologia celular y la literatura biomedica.

El modelo se publica con licencia MIT, formato safetensors y compatibilidad con la libreria `sentence-transformers`, ademas de soporte para text-embeddings-inference y endpoints compatibles. El repositorio ocupa 0,4 GB y el checkpoint corresponde al identificador interno `MG_HIAI_Tcells_S2_200k_lr5e5`, entrenado sobre el conjunto de datos `S2_heldout_donor_semantic_200k`.

Es relevante ahora porque cubre un nicho concreto: la armonizacion semantica de nomenclatura celular y biomedica, donde los identificadores y alias varian enormemente entre publicaciones y ontologias. Al estar construido sobre un encoder PubMedBERT, hereda el sesgo hacia vocabulario cientifico y ofrece una alternativa ligera (109 M de parametros) frente a modelos de embeddings generalistas de mayor tamano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo BERT (encoder), empaquetado como SentenceTransformer |
| Parametros totales | 109.482.240 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un encoder BERT de tipo base afinado mediante la libreria `sentence-transformers` a partir de `NeuML/pubmedbert-base-embeddings`, un modelo derivado de PubMedBERT orientado a embeddings de literatura biomedica. El resultado es un encoder que produce representaciones densas de frases, pensado para similitud semantica y recuperacion, no para generacion de texto. No se dispone de informacion publica sobre la dimension de los embeddings de salida ni sobre la funcion de pooling empleada.

El entrenamiento se realizo sobre el conjunto `S2_heldout_donor_semantic_200k`, con el identificador interno `MG_HIAI_Tcells_S2_200k_lr5e5`, que sugiere un dataset de 200.000 pares semanticos con particion held-out por donante y una tasa de aprendizaje de 5e-5. No se detalla en la model card el numero de tokens, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF o DPO (no aplicables a un encoder de similitud). La procedencia del codigo y del dataset se documenta en la rama `manuscript-reproducibility` del repositorio de GitHub del proyecto.

## Capacidades

- Generacion de embeddings de frases para texto biomedico y descripciones de celulas.
- Calculo de similitud semantica entre terminos, alias y descripciones celulares.
- Alineacion de nomenclatura celular con vocabulario biomedico en un espacio compartido.
- Recuperacion semantica y busqueda por similitud sobre corpus cientificos.
- Agrupamiento (clustering) y deduplicacion de entidades biologicas por significado.
- Integracion con `sentence-transformers` para pipelines de embeddings.
- Compatibilidad con text-embeddings-inference y endpoints compatibles.
- No soporta generacion de texto, tool calling, agentes, vision ni audio.

## Casos de uso

- Normalizacion de tipos celulares: dado un listado heterogeneo de etiquetas de celulas procedentes de distintos estudios, el modelo genera embeddings y permite agrupar alias equivalentes ("CD8 T cell", "cytotoxic T lymphocyte") para consolidar anotaciones.
- Busqueda semantica en literatura biomedica: indexar resumenes o fragmentos de PubMed y recuperar pasajes relevantes por similitud vectorial, aprovechando el dominio biomedico del encoder base.
- Deduplicacion de ontologias y catalogos: comparar terminos de distintas ontologias celulares y detectar solapamientos mediante umbral de similitud coseno.
- Anotacion asistida en single-cell: proyectar descripciones de clusters en el espacio de embeddings y emparejarlas con etiquetas de referencia documentadas.
- Construccion de indices vectoriales para RAG biomedico: usar los embeddings como capa de recuperacion en un sistema de preguntas y respuestas sobre corpus cientificos, combinado con un modelo generativo independiente.
- Analisis exploratorio de similitud entre donantes o condiciones: el particionado held-out por donante del dataset de entrenamiento permite estudiar la transferibilidad de representaciones entre muestras.
- Clasificacion y clustering no supervisado de textos cientificos: emplear los vectores como caracteristicas de entrada en pipelines de machine learning downstream.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,44 GB solo para pesos (109,48 M de parametros), mas overhead de activaciones y tokenizador; en la practica cabe en cualquier GPU consumer.
- VRAM estimada en FP16/BF16: aproximadamente 0,22 GB para pesos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; RTX 3060, RTX 4090, A100 o H100 son mas que suficientes. Tambien puede ejecutarse en CPU para cargas moderadas.
- Cabe en GPU consumer: si, en practicamente todas las GPU modernas e incluso en hardware integrado.
- Opciones de despliegue: `sentence-transformers` (Python), text-embeddings-inference (soporte declarado en los tags), endpoints compatibles y servidores de embeddings genericos.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Formato |
|---|---|---|---|---|---|
| ALIAS-MB | 109,48 M | no disponible | Biomedico / single-cell | MIT | safetensors |
| NeuML/pubmedbert-base-embeddings (base) | no disponible | no disponible | Biomedico | Apache 2.0 | no disponible |
| all-MiniLM-L6-v2 | no disponible | no disponible | Generalista | Apache 2.0 | no disponible |
| BGE-base-en-v1.5 | no disponible | no disponible | Generalista | MIT | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada; la comparativa se limita a parametros, licencia y dominio de especializacion.

## Limitaciones y advertencias

- Modelo destinado exclusivamente a investigacion exploratoria; no validado para uso clinico.
- No se han publicado evaluaciones de sesgo; al derivar de PubMedBERT puede heredar sesgos de la literatura biomedica.
- Riesgo de alucinacion no aplicable en sentido generativo, pero si de falsos positivos en similitud: terminos distintos pueden quedar proximos si el encoder no discrimina matices biologicos.
- Longitud de contexto no documentada; textos largos pueden truncarse sin aviso segun la configuracion del tokenizador.
- Idiomas soportados no documentados; el encoder base esta orientado a ingles biomedico, por lo que el rendimiento en castellano u otros idiomas es incierto.
- Licencia MIT permite uso comercial, pero el modelo base upstream es Apache 2.0 y se incluye su texto de licencia; conviene revisar ambas antes de redistribuir.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion comunitaria ni evidencia de uso en produccion.
- No apto para generacion de texto, agentes, tool calling ni tareas multimodales.

## Enlaces

- Hugging Face: https://huggingface.co/mariakrissmer/ALIAS-MB
- Modelo base: https://huggingface.co/NeuML/pubmedbert-base-embeddings
- Repositorio de codigo y procedencia (rama de reproducibilidad): https://github.com/MariaKrissmer/alias/tree/manuscript-reproducibility
