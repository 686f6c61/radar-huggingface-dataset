# agbalu/SiMohand-278M

## Resumen

SiMohand-278M es un modelo de embeddings de frases (sentence transformer) de 278 millones de parámetros, desarrollado por el colectivo AƔBALU (agbalu) para la lengua kabyle (Taqbaylit, código `kab`, escritura latina). Se trata de un fine-tuning del modelo multilingüe `intfloat/multilingual-e5-base` (basado en XLM-RoBERTa base) sobre 511.549 pares de bitext decontaminados, empleando Matryoshka Representation Learning (MRL). El modelo está diseñado para tareas de similitud semántica, búsqueda semántica, recuperación cross-lingual (kabyle–inglés, kabyle–francés) y clustering de frases.

Su relevancia radica en que es, según sus autores, el primer modelo de embeddings para kabyle evaluado contra distractores duros de bitext en una partición decontaminada y sellada por clústeres. En la tarea de recuperación de bitext con 500 pares held-out y 499 distractores, alcanza un Recall@1 del 97,0%, superando en 33,2 puntos absolutos a su propio backbone (63,8%) y en 74,8 puntos a LaBSE (22,2%). Además, gracias al entrenamiento Matryoshka, el vector puede truncarse a 64 dimensiones (12× compresión) sin pérdida medible de Recall@1, lo que lo hace atractivo para aplicaciones con restricciones de almacenamiento o latencia.

El modelo se distribuye bajo licencia Apache 2.0, con pesos en formato safetensors, y está pensado para usarse con la librería `sentence-transformers`. No es adecuado para generación de texto, traducción ni para idiomas distintos del kabyle (aunque admite inglés y francés como lado de pasaje en recuperación cross-lingual).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa base) con capa de pooling para embeddings |
| Parametros totales | 278.047.488 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el backbone XLM-RoBERTa base usa 512 tokens, pero no se confirma en la documentación) |
| Tipos de cuantizacion | no disponible (no se mencionan cuantizaciones oficiales; el repo contiene safetensors en precisión completa) |
| Idiomas soportados | kabyle (kab), inglés (en), francés (fr) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SiMohand-278M parte de `multilingual-e5-base`, un modelo basado en XLM-RoBERTa base (12 capas, 768 dimensiones ocultas) con una cabeza de pooling para generar embeddings de frases. El fine-tuning se realizó sobre 511.549 pares de bitext decontaminados (kabyle–inglés y kabyle–francés), utilizando Matryoshka Representation Learning (MRL) con una pérdida anidada de 5 niveles sobre dimensiones [768, 512, 256, 128, 64]. Esta técnica permite truncar el vector de salida a dimensiones menores sin reentrenar, manteniendo un rendimiento casi idéntico.

El proceso de entrenamiento incluyó una fase de decontaminación y una partición "cluster-sealed" para evitar fugas de datos entre entrenamiento y evaluación. El autor destaca que el backbone original falla en kabyle porque su tokenizer XLM-RoBERTa mapea los caracteres `Ɛ`, `Ɣ`, `Ǧ`, `Ẓ`, `ẓ` a `<unk>`, colapsando consonantes distintas en el mismo token y produciendo un espacio de embeddings en forma de cono (isotropía media de 0,8040). SiMohand-278M corrige este problema, logrando una isotropía de 0,0042 en la misma medición.

## Capacidades

- Generación de embeddings de frases para kabyle, inglés y francés, con normalización L2 integrada.
- Similitud semántica entre frases (coseno) y recuperación de pasajes (bitext retrieval).
- Recuperación cross-lingual: consultas en kabyle contra pasajes en kabyle, inglés o francés, y viceversa.
- Soporte de Matryoshka: el vector de salida puede truncarse a 512, 256, 128 o 64 dimensiones sin pérdida significativa de rendimiento (el slice de 64-d mantiene Recall@1 = 97,0%).
- Clustering de frases y agrupación semántica de documentos cortos en kabyle.
- Integración con pipelines de RAG (retrieval-augmented generation) para dominios kabyle.
- Compatible con `sentence-transformers` y con la infraestructura de Hugging Face (Text Embeddings Inference, endpoints compatibles).

## Casos de uso

- Búsqueda semántica en corpus kabyle: indexar documentos, artículos o transcripciones en kabyle y permitir consultas en kabyle, inglés o francés. El modelo recupera el pasaje correcto entre 500 candidatos con un 97% de Recall@1, lo que lo hace fiable para buscadores de dominio específico.
- Recuperación aumentada por generación (RAG) para kabyle: integrar SiMohand-278M como componente de retrieval en un pipeline RAG que responda preguntas sobre cultura, historia o literatura kabyle. Su capacidad cross-lingual permite usar consultas en francés o inglés para recuperar pasajes en kabyle.
- Alineación de bitext kabyle–inglés/francés: en tareas de construcción de corpus paralelos, el modelo puede emparejar frases equivalentes entre idiomas, facilitando la creación de memorias de traducción o datasets de entrenamiento.
- Clustering de documentos kabyle: agrupar noticias, foros o redes sociales en kabyle por tema, usando los embeddings de 64 dimensiones para reducir costes de almacenamiento y cómputo.
- Sistemas de recomendación de contenido: dado un artículo o frase en kabyle, encontrar otros contenidos semánticamente relacionados dentro de un catálogo.
- Verificación de similitud de textos cortos: detectar duplicados o paráfrasis en kabyle (aunque el autor advierte que la recuperación de paráfrasis intra-kabyle no ha sido específicamente evaluada, el modelo funciona bien en bitext).

## Benchmarks y rendimiento

Los resultados que se muestran a continuación son los declarados por el autor en la model card. La tarea consiste en recuperación de bitext con 500 pares held-out, donde cada consulta debe encontrar su pasaje correcto entre 499 distractores (todos en kabyle o traducciones al inglés/francés). Se comparan tres modelos: SiMohand-278M, su backbone `multilingual-e5-base` y LaBSE.

| Modelo | Recall@1 | Recall@5 | MRR | Margen medio (pos-neg) | Isotropía media |
|---|---|---|---|---|---|
| **SiMohand-278M** | **97,0%** | **99,8%** | **0,9833** | **+0,790** | **0,0042** |
| multilingual-e5-base (backbone) | 63,8% | 77,6% | 0,7063 | +0,087 | 0,8040 |
| LaBSE (Google baseline) | 22,2% | 30,8% | 0,2787 | +0,220 | 0,1754 |

Además, el autor reporta un barrido de dimensiones Matryoshka:

| Dimensiones | Recall@1 | Recall@5 | MRR | Margen |
|---|---|---|---|---|
| 768 (completo) | 97,0% | 99,8% | 0,9833 | +0,790 |
| 512 | 97,0% | 99,8% | 0,9830 | +0,794 |
| 256 | 97,2% | 99,8% | 0,9838 | +0,802 |
| 128 | 97,2% | 99,8% | 0,9836 | +0,814 |
| 64 | 97,0% | 99,6% | 0,9819 | +0,826 |

No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o MTEB, ya que el modelo es específico para embeddings de frases en kabyle.

## Requisitos de hardware

No se proporcionan requisitos oficiales de hardware en la documentación. No obstante, dado que el modelo tiene 278 millones de parámetros, se pueden hacer las siguientes estimaciones orientativas:

- VRAM estimada: en precisión fp32, el modelo ocupa aproximadamente 1,1 GB (278M × 4 bytes). En fp16, ~0,56 GB; en int8, ~0,28 GB. Por tanto, es ejecutable en GPUs con 2 GB de VRAM o menos, e incluso en CPU con memoria RAM suficiente.
- GPU recomendadas: cualquier GPU consumer moderna (NVIDIA GTX 1060 6GB, RTX 2060, RTX 3060, etc.) es suficiente para inferencia. Para entrenamiento o fine-tuning adicional, se recomienda al menos 8 GB de VRAM.
- Despliegue: compatible con `sentence-transformers` (CPU/GPU), y con servidores de embeddings como Text Embeddings Inference (TEI) de Hugging Face, que soporta este tipo de modelos. También puede usarse con `sentence-transformers` en entornos serverless o contenedores.
- Latencia y throughput: no se han publicado mediciones oficiales. Para un modelo de 278M, la latencia típica de codificación de una frase corta en GPU es del orden de milisegundos (5-20 ms), y en CPU puede ser de 50-200 ms, dependiendo del hardware y la longitud del texto.

## Comparativa con modelos similares

La comparativa más relevante es la que proporciona el propio autor frente a su backbone y a LaBSE, ya que son los únicos modelos con los que se ha evaluado en la misma tarea. No se dispone de comparaciones con otros modelos de embeddings kabyle (no existen otros conocidos).

| Modelo | Parámetros | Contexto | Recall@1 (bitext kabyle) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **SiMohand-278M** | 278M | no disponible | 97,0% | Apache 2.0 | Hugging Face |
| multilingual-e5-base | 278M | 512 (típico) | 63,8% | MIT | Hugging Face |
| LaBSE | 471M | 512 | 22,2% | Apache 2.0 | Hugging Face |

Cabe señalar que `multilingual-e5-base` y LaBSE son modelos multilingües generales, no específicos para kabyle, lo que explica su bajo rendimiento en esta lengua. SiMohand-278M es el único modelo de embeddings específicamente entrenado para kabyle con evaluación rigurosa.

## Limitaciones y advertencias

- El modelo no es adecuado para generación de texto, traducción automática ni tareas de lenguaje natural distintas de la generación de embeddings.
- Solo está entrenado para kabyle (y para inglés/francés como lado de pasaje en recuperación cross-lingual). No se recomienda usarlo con otros idiomas.
- No se ha realizado ninguna evaluación de sesgos, toxicidad o seguridad. El autor advierte explícitamente que el modelo no ha sido evaluado en estos aspectos.
- El corpus de entrenamiento contiene pares de bitext, no anotaciones de paráfrasis intra-kabyle. La recuperación de paráfrasis dentro del kabyle no ha sido específicamente evaluada, por lo que su rendimiento en ese escenario es incierto.
- El tokenizer del backbone (XLM-RoBERTa) tiene problemas con caracteres kabyle específicos (`Ɛ`, `Ɣ`, `Ǧ`, `Ẓ`, `ẓ`), aunque el fine-tuning parece haber mitigado este problema en la práctica. Aun así, es recomendable verificar la tokenización de textos kabyle antes de usarlo en producción.
- No se han publicado detalles sobre el proceso de decontaminación ni sobre la composición exacta del dataset de entrenamiento, lo que limita la reproducibilidad.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base (`multilingual-e5-base`, licencia MIT) y de los datos utilizados, que no se detallan.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/agbalu/SiMohand-278M
- Perfil de la organización AƔBALU: https://huggingface.co/agbalu/models
- Modelo base `multilingual-e5-base`: https://huggingface.co/intfloat/multilingual-e5-base
