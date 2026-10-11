# kori11/dummy-model

## Resumen

kori11/dummy-model es un modelo alojado en HuggingFace por el usuario kori11 que, por su nomenclatura ("dummy-model") y por la ausencia total de documentación útil en su model card, presenta todas las trazas de ser una subida de prueba o un marcador de posición en lugar de un modelo entrenado y publicado con fines de uso real. El repositorio no acumula descargas ni "likes" en el momento de redactar esta ficha, y su model card es la plantilla autogenerada por HuggingFace, con todos los campos marcados como "[More Information Needed]".

A partir de los metadatos disponibles, el modelo se identifica con la etiqueta `camembert` y con el pipeline `fill-mask`, lo que apunta a una arquitectura de tipo transformer encoder basada en RoBERTa adaptada al francés (familia CamemBERT). El recuento real de parámetros obtenido de los pesos en safetensors es de 110.655.493, una cifra coherente con la variante base de CamemBERT (aproximadamente 110 millones de parámetros). El tamaño del repositorio es de 0,4 GB.

Es relevante ahora únicamente como caso de estudio de higiene de publicación en el Hub: muestra cómo un checkpoint puede subirse sin licencia, sin idiomas declarados, sin datos de entrenamiento ni evaluación, y aun así quedar etiquetado y expuesto como modelo de relleno de máscaras. Para cualquier uso en producción, la falta de licencia y de documentación lo desaconseja por completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo RoBERTa/CamemBERT (inferido de la etiqueta `camembert`; no confirmado en la model card) |
| Parametros totales | 110.655.493 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible (la familia CamemBERT suele usar 512 tokens, pero no esta confirmado para este checkpoint) |
| Tipos de cuantizacion | no disponible (solo se ofrecen pesos en safetensors a precision completa) |
| Idiomas soportados | no disponible (la etiqueta `camembert` sugiere frances, sin confirmacion del autor) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La etiqueta `camembert` del repositorio apunta a la familia CamemBERT, un transformer encoder de tipo RoBERTa entrenado con objetivos de modelado de lenguaje enmascarado (masked language modeling). El tag `fill-mask` del pipeline es coherente con esa naturaleza bidireccional: se trata de un modelo exclusivamente encoder, sin cabeza de generación autoregresiva, pensado para predecir tokens enmascarados dentro de una secuencia.

No hay información sobre el corpus de entrenamiento, el número de tokens procesados, la composición del dataset, la existencia de fases de ajuste fino supervisado o preferencias (RLHF/DPO) ni sobre innovaciones técnicas concretas. La model card remite en todos los apartados de "Training Details" a "[More Information Needed]". La única referencia externa presente es el tag `arxiv:1910.09700`, correspondiente a Lacoste et al. (2019) sobre el calculador de impacto medioambiental, incluido por defecto en la plantilla de HuggingFace y no como paper del modelo. Conviene subrayar que, dado el nombre "dummy-model", no puede descartarse que los pesos no correspondan a un entrenamiento real.

## Capacidades

- Relleno de máscaras (masked language modeling): el pipeline declarado es `fill-mask`, de modo que la tarea prevista es predecir tokens enmascarados en una frase.
- Extracción de representaciones contextuales: al ser un encoder, puede emplearse para generar embeddings de frases o tokens para tareas posteriores (clasificación, NER, similitud), aunque no se ha validado su calidad.
- Sin generación de texto autoregresiva: no es un modelo causal, por lo que no admite generación libre de texto ni conversación.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible. La etiqueta `camembert` sugiere francés, pero el autor no declara idiomas.
- Capacidades especiales (modo "thinking", visión, audio): no disponibles.

## Casos de uso

Debido a la ausencia de licencia, de idiomas declarados y a la naturaleza aparentemente de prueba del checkpoint, no se recomienda su uso en producción. Los siguientes escenarios describen exclusivamente para qué serviría un modelo de esta familia y magnitud, no una recomendación de emplear este checkpoint concreto.

- Relleno de huecos en textos en francés (si se confirma la procedencia): sustituir un token enmascarado en una frase, por ejemplo en tareas de corrección ortográfica o completado asistido sobre corpus galos.
- Clasificación de texto por ajuste fino: usar el encoder como base congelada o reentrenada para análisis de sentimiento, detección de temas o moderación sobre documentos en francés.
- Reconocimiento de entidades nombradas (NER): aprovechar las representaciones contextuales del encoder para etiquetar personas, organizaciones y lugares en textos administrativos o periodísticos.
- Búsqueda semántica y recuperación: generar embeddings de fragmentos de documento para un sistema de recuperación aumentada (RAG), siempre que se validara la calidad de los vectores.
- Preprocesado en pipelines NLP multietapa: integrar el modelo como extractor de características previo a un clasificador o a un reranker.
- Experimentación académica y pruebas de infraestructura: por su tamaño reducido y su formato safetensors, resulta cómodo para probar flujos de carga con la librería `transformers`, servidores de inferencia o validaciones de CI, que es presumiblemente su propósito real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye la sección de evaluación más allá de la plantilla vacía, y no hay métricas de MMLU, GLUE, XNLI ni de ninguna otra batería para este checkpoint.

## Requisitos de hardware

- VRAM estimada en inferencia: en fp32, los 110,7 M de parámetros ocupan aproximadamente 0,44 GB de pesos; en fp16, alrededor de 0,22 GB. Con activaciones y overhead, menos de 1 GB en cualquier caso.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente. Funciona en GTX 1050 Ti, RTX 3050, RTX 4090, A100 o H100 sin problema.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna e incluso en muchas integradas.
- Opciones de despliegue: `transformers` con PyTorch, servidores de inferencia compatibles con el Hub (el tag `endpoints_compatible` está presente), ONNX Runtime y, si se convierte, llama.cpp no aplica al no existir pesos GGUF publicados.
- Latencia y throughput estimados: no disponibles, al no haberse publicado mediciones. Por tamaño, cabría esperar latencias del orden de pocos milisegundos por lote pequeño en GPU moderna, pero es una estimación no verificada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| kori11/dummy-model | 110,7 M | no disponible | no disponible | HuggingFace (sin documentar) |
| CamemBERT base (Inria) | ~110 M | 512 tokens | MIT | HuggingFace, ampliamente validado |
| RoBERTa base | ~125 M | 512 tokens | MIT | HuggingFace, ampliamente validado |
| DistilBERT multilingue | ~135 M | 512 tokens | Apache 2.0 | HuggingFace, ampliamente validado |

La comparación se limita a arquitectura y tamaño, ya que no existen datos de rendimiento publicados para kori11/dummy-model que permitan contrastar métricas.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita, no existe autorización clara para uso comercial ni para redistribución. Esto, por sí solo, bloquea su adopción en producción.
- Documentación inexistente: la model card es la plantilla autogenerada, sin datos de entrenamiento, evaluación, sesgos ni uso previsto.
- Indicios de modelo de prueba: el nombre "dummy-model", las cero descargas y la ausencia de cualquier contenido sugieren que los pesos pueden no ser funcionales o no corresponder a un entrenamiento real.
- Riesgo de alucinación: al ser un encoder de relleno de máscaras, no genera texto libre, pero puede producir predicciones de tokens plausibles y erróneas sin ninguna garantía de fiabilidad.
- Sesgos: no disponibles; no se ha documentado la composición del corpus, por lo que no puede evaluarse el sesgo de género, etnia o dominio.
- Cobertura de idiomas: no declarada. Si el modelo se apoya en CamemBERT, su cobertura se limitaría al francés, con rendimiento degradado en castellano u otros idiomas.
- Caveat de producción: no hay garantía de estabilidad de la API ni de mantenimiento del repositorio; un modelo de este tipo no debería incluirse en un pipeline crítico sin una validación exhaustiva y una licencia resuelta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kori11/dummy-model
- Paper referenciado por el tag del repositorio (Lacoste et al., 2019, calculador de impacto): https://arxiv.org/abs/1910.09700
- Documentación de CamemBERT (arquitectura inferida): https://huggingface.co/docs/transformers/model_doc/camembert
- Paper original de CamemBERT: https://arxiv.org/abs/1911.03894
