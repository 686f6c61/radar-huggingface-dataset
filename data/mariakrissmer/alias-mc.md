# mariakrissmer/ALIAS-MC

## Resumen

ALIAS-MC es un modelo de embeddings de frases (sentence-similarity) desarrollado por Maria Krissmer, publicado bajo la etiqueta `MC` en el manuscrito ALIAS. Se trata de un fine-tune del encoder biomédico NeuML/pubmedbert-base-embeddings, orientado a proyectar descripciones de células y texto biomédico en un espacio vectorial compartido, de modo que términos equivalentes o relacionados (por ejemplo, "CD8 T cell" y "cytotoxic T lymphocyte") queden próximos en el espacio de representación.

El modelo resuelve el problema de la normalización y el emparejamiento semántico de anotaciones celulares y terminología biomédica, una tarea crítica en pipelines de single-cell donde las etiquetas de tipo celular son heterogéneas entre estudios y ontologías. Con 109.482.240 parámetros (arquitectura BERT base), es un encoder compacto pensado para ser desplegado de forma económica en tareas de búsqueda semántica y clustering sobre corpus biomédicos.

Es relevante ahora porque el ecosistema de `sentence-transformers` y `text-embeddings-inference` permite integrarlo directamente en infraestructuras de recuperación existentes, y porque la licencia MIT facilita su uso y adaptación. Está explícitamente marcado como herramienta de investigación exploratoria, sin validación clínica.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (encoder transformer, base_model NeuML/pubmedbert-base-embeddings) |
| Parametros totales | 109.482.240 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo base es de dominio biomédico en inglés) |
| Licencia | MIT (pesos); modelo base Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de tipo BERT con 109,5 millones de parámetros, obtenido por fine-tuning del checkpoint NeuML/pubmedbert-base-embeddings, que a su vez deriva de una arquitectura BERT base ajustada sobre literatura biomédica (PubMed). La salida es un embedding de frase de dimensión fija, adecuado para similitud coseno y búsqueda vectorial mediante `sentence-transformers`.

El entrenamiento se realizó sobre el dataset `S3_heldout_donor_nonsemantic_200k`, con un identificador interno `MF_HIAI_Tcells_S3_200k_lr5e5` que sugiere 200.000 ejemplos y una tasa de aprendizaje de 5e-5. El dataset se denomina "heldout donor" y "nonsemantic", lo que indica una separación por donante para evitar fuga de información y un diseño de pares sin dependencia de anotaciones semánticas manuales. No se dispone de información sobre el número total de tokens, la composición exacta del dataset ni el uso de RLHF/DPO (no aplicable en un encoder de similitud). La procedencia del código y del dataset está documentada en la rama `manuscript-reproducibility` del repositorio de GitHub del proyecto.

## Capacidades

- Generación de embeddings de frases para similitud semántica y búsqueda vectorial.
- Emparejamiento de descripciones de tipos celulares y terminología biomédica en un espacio compartido.
- Detección de sinónimos y variantes de nomenclatura (por ejemplo, "CD8 T cell" frente a "cytotoxic T lymphocyte").
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-step: no disponible (es un encoder, no un modelo generativo).
- Capacidades multilingües: no disponibles; el modelo base está orientado a texto biomédico en inglés.
- Capacidad especial: ninguna más allá de la similitud semántica de dominio biomédico.

## Casos de uso

- Normalización de anotaciones de tipo celular en single-cell: el modelo permite agrupar etiquetas heterogéneas de distintos estudios y mapearlas a términos canónicos de ontologías celulares mediante similitud coseno, reduciendo el trabajo manual de curación.
- Búsqueda semántica sobre literatura biomédica: indexar resúmenes de PubMed y recuperar pasajes relevantes para una consulta clínica o de investigación mediante embeddings, aprovechando el ajuste del modelo base sobre corpus biomédico.
- Deduplicación y clustering de metadatos: agrupar descripciones de muestras, marcadores o fenotipos que son equivalentes pero están redactados de forma distinta, útil en la integración de datasets multi-estudio.
- Construcción de índices vectoriales para RAG biomédico: servir como encoder de recuperación en pipelines de generación aumentada sobre documentación científica, con despliegue vía `text-embeddings-inference` o `sentence-transformers`.
- Enriquecimiento de pipelines de anotación automática: generar embeddings de candidatos de anotación y seleccionar el más próximo a la descripción original de la célula, como paso previo a la revisión humana.
- Investigación en representaciones biomédicas: usar el modelo como baseline reproducible en experimentos de evaluación de embeddings de dominio, dado que el código y el dataset están documentados en la rama de reproducibilidad del repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,4-0,5 GB en FP32 para los 109,5 M de parámetros; en FP16, en torno a 0,25 GB. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; RTX 3060, RTX 4090, A100 o H100 son válidas, aunque el modelo no las aprovecha intensamente por su tamaño reducido.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU moderna e incluso en CPU para lotes pequeños.
- Opciones de despliegue: `sentence-transformers`, `text-embeddings-inference` (el repo incluye la etiqueta `text-embeddings-inference` y `endpoints_compatible`), así como exportación a ONNX o GGUF mediante herramientas de conversión de sentence-transformers.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ALIAS-MC | 109,5 M | no disponible | MIT | Hugging Face |
| NeuML/pubmedbert-base-embeddings | no disponible | no disponible | Apache 2.0 | Hugging Face |
| Modelos de embeddings biomédicos tipo BioBERT/SciBERT (encoders) | ~110 M (BERT base) | 512 tokens típicamente | Apache 2.0 / MIT según checkpoint | Hugging Face |

No se dispone de datos de rendimiento comparativo para ALIAS-MC frente a estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo marcado explícitamente por el autor como de investigación exploratoria; no validado para uso clínico.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de falsos positivos en similitud: términos biomédicos distintos pueden quedar próximos en el espacio vectorial.
- Idiomas soportados no declarados; el modelo base está orientado a texto biomédico en inglés, por lo que el rendimiento en castellano u otros idiomas es incierto.
- Longitud de contexto no documentada; el modelo base BERT suele limitarse a 512 tokens, lo que restringe documentos largos.
- Sesgos potenciales derivados del corpus de entrenamiento (literatura PubMed y dataset de células T), que pueden infrarepresentar tipos celulares o poblaciones menos estudiadas.
- Licencia MIT para los pesos, con la obligación de conservar el aviso de la licencia Apache 2.0 del modelo base incluida en el repositorio.
- Sin descargas ni likes en el momento de la ficha; ausencia de validación comunitaria y de benchmarks publicados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mariakrissmer/ALIAS-MC
- Modelo base: https://huggingface.co/NeuML/pubmedbert-base-embeddings
- Repositorio de código y dataset (rama de reproducibilidad del manuscrito): https://github.com/MariaKrissmer/alias/tree/manuscript-reproducibility
