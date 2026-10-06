# aleksanderkarpov/bge-small-ner

## Resumen

bge-small-ner es un modelo de clasificación de tokens (token classification) publicado por el usuario aleksanderkarpov en HuggingFace. Se trata de un ajuste fino (fine-tuning) del encoder BAAI/bge-small-en-v1.5, un transformer tipo BERT de 33.215.625 parámetros, orientado a tareas de reconocimiento de entidades nombradas (NER) y, en general, a cualquier problema de etiquetado a nivel de token.

El modelo se distribuye con licencia MIT, en formato safetensors, y es compatible con la librería transformers y con endpoints de inferencia. Su interés práctico radica en que ofrece una alternativa muy ligera (repo de 0,1 GB) para tareas de extracción de entidades, con métricas declaradas por el autor de F1 = 0,8684, precisión = 0,8456, recall = 0,8925 y accuracy = 0,9753 sobre el conjunto de evaluación.

Ahora bien, la ficha pública es un artefacto autogenerado por el `Trainer` de HuggingFace y está prácticamente vacía: no se documenta el dataset de entrenamiento, ni el esquema de etiquetas, ni los idiomas soportados, ni los usos previstos. Esto condiciona de forma importante su evaluabilidad y su uso en producción, tal y como se detalla en las secciones siguientes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (fine-tuning de BAAI/bge-small-en-v1.5) |
| Parámetros totales | 33.215.625 |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base es un encoder BERT, familia habitualmente limitada a 512 tokens) |
| Tipos de cuantización | no disponible (no se publican versiones cuantizadas; al ser un modelo de 33 M de parámetros admite cuantización a int8/fp16 sin problemas técnicos) |
| Idiomas soportados | no disponible (el modelo base está etiquetado como `en`, por lo que previsiblemente el ajuste se realizó sobre texto en inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (librería transformers) |
| Pipeline | token-classification |
| Tamaño del repositorio | 0,1 GB |
| Modelo base | BAAI/bge-small-en-v1.5 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer encoder de tipo BERT en su variante "small", con 33,2 millones de parámetros, sobre el que se ha añadido una cabeza de clasificación de tokens para resolver la tarea de etiquetado secuencial. No hay innovaciones arquitectónicas propias: no se emplea decodificación especulativa, atención lineal, mezcla de expertos ni arquitecturas híbridas SSM. El modelo hereda las representaciones del encoder de embeddings `bge-small-en-v1.5`, originalmente entrenado para recuperación densa de texto.

El procedimiento de ajuste está documentado únicamente a través de los hiperparámetros volcados automáticamente por el `Trainer`: 3 épocas, learning rate 2e-05, tamaño de lote de entrenamiento 16, tamaño de lote de evaluación 8, optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-08, scheduler lineal y semilla 42. El entrenamiento consta de 1875 pasos totales (625 por época), lo que implica, por aritmética directa a partir de los datos proporcionados, del orden de 10.000 ejemplos de entrenamiento por época. No se especifica ni la composición del dataset, ni el esquema de etiquetas (BIO, BIOES, etc.), ni si se aplicaron técnicas de alineación posteriores como RLHF o DPO. La model card indica literalmente que el modelo se ajustó "on an unknown dataset".

Versiones de framework declaradas: Transformers 5.18.0, PyTorch 2.11.0+cu130, Datasets 4.8.5 y Tokenizers 0.23.2.

## Capacidades

- Reconocimiento de entidades nombradas (NER) sobre texto: el pipeline declarado es `token-classification`, con salida de etiquetas por token.
- Clasificación de secuencias de tokens en general: cualquier tarea formulada como etiquetado a nivel de token (chunking, POS tagging, detección de PII) es técnicamente abordable con la misma cabeza.
- Extracción de entidades a partir de métricas de evaluación coherentes con NER: precisión y recall equilibrados (0,8456 y 0,8925), lo que sugiere una salida razonablemente estable.
- Generación de embeddings contextuales por token: al derivar del encoder `bge-small-en-v1.5`, el cuerpo del modelo puede reutilizarse para representaciones densas si se descarta la cabeza de clasificación.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (no es un modelo generativo).
- Capacidades multilingües: no disponibles; no se declara ningún idioma y el modelo base está etiquetado como inglés.
- Capacidades especiales (modo "thinking", visión, audio): no disponibles.

## Casos de uso

- Anonimización y detección de datos personales (PII): el modelo puede etiquetar tokens correspondientes a nombres, direcciones o identificadores en flujos de texto antes de almacenarlos o enviarlos a terceros. El recall declarado de 0,8925 es relevante aquí, ya que en tareas de privacidad los falsos negativos son el error más costoso.
- Preprocesado de pipelines RAG: extraer entidades de documentos antes de la indexación permite construir índices secundarios por entidad, mejorar el filtrado de metadatos y aumentar la precisión del retrieval. Su tamaño (33 M de parámetros) permite ejecutarlo en la misma máquina que el resto del pipeline sin coste apreciable.
- Enriquecimiento de currículums y ofertas de empleo: parsing de nombres de empresa, puestos, tecnologías y ubicaciones para alimentar bases de datos de reclutamiento. Requiere validar previamente el esquema de etiquetas, que no está documentado.
- Indexación y catalogación de publicaciones: extracción de autores, instituciones, fármacos o lugares en corpus científicos y técnicos, aprovechando que el modelo base fue entrenado para representaciones de recuperación de texto.
- Clasificación y enrutado de tickets de soporte: identificar producto, versión, error o cliente mencionados en el texto libre de un ticket para asignarlo automáticamente al equipo correspondiente.
- Etiquetado de corpus para entrenamiento posterior: uso como anotador automático (weak labelling) para generar datasets de NER a mayor escala, que luego se revisan manualmente o se utilizan para entrenar modelos mayores.
- Componente en pipelines de moderación o cumplimiento normativo: detección de menciones a entidades sensibles en grandes volúmenes de texto, con procesamiento en CPU y por lotes gracias a su reducido tamaño.

## Benchmarks y rendimiento

Los resultados declarados por el autor en la model card (conjunto de evaluación no identificado) son los siguientes:

| Métrica | Época 1 (paso 625) | Época 2 (paso 1250) | Época 3 (paso 1875) |
|---|---|---|---|
| Training loss | 0,2328 | 0,1415 | 0,1448 |
| Validation loss | 0,1907 | 0,1299 | 0,1174 |
| Precision | 0,7443 | 0,8344 | 0,8456 |
| Recall | 0,7932 | 0,8820 | 0,8925 |
| F1 | 0,7680 | 0,8576 | 0,8684 |
| Accuracy | 0,9585 | 0,9734 | 0,9753 |

El campo `model-index` de la model card está vacío (`results: []`), por lo que no hay resultados asociados a benchmarks estándar (MMLU, GLUE, CoNLL-2003, etc.). No se han publicado resultados de benchmarks comparables en la información disponible, y el conjunto de evaluación empleado no se especifica, lo que impide interpretar el F1 más allá de la comparación relativa entre épocas. La mejora entre la época 2 y la 3 es marginal (F1 de 0,8576 a 0,8684, +1,08 puntos), lo que sugiere convergencia.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 133 MB en fp32 (33.215.625 parámetros × 4 bytes), unos 66 MB en fp16/bf16 y unos 33 MB en int8, a lo que hay que sumar el consumo de activaciones, que depende del tamaño de lote y de la longitud de secuencia.
- GPU recomendadas: cualquier GPU con más de 2 GB de VRAM es suficiente, incluidas GTX 1050 Ti, GTX 1650, RTX 3060, RTX 4090, A100 o H100. El modelo está claramente sobredimensionado en hardware para GPUs de datacenter; no se aprovecharían.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo de los últimos ocho años, y también en CPU (inferencia en CPU perfectamente viable por lotes).
- Opciones de despliegue: pipeline `token-classification` de transformers, exportación a ONNX Runtime o TorchScript para inferencia optimizada, servidores de inferencia genéricos compatibles con transformers y endpoints compatibles (tag `endpoints_compatible`). No se documenta soporte específico en vLLM, TGI, llama.cpp u Ollama; estos entornos están orientados a modelos generativos o a embeddings, por lo que la cabeza de token classification puede no ser compatible sin trabajo adicional.
- Latencia y throughput estimados: no disponibles. Al tratarse de un encoder de 33 M de parámetros y 12 capas (arquitectura del modelo base), el throughput por lote es alto en GPU y aceptable en CPU, pero no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| aleksanderkarpov/bge-small-ner | 33.215.625 | NER / token classification | no disponible en la ficha | MIT | HuggingFace, 0 descargas |
| BAAI/bge-small-en-v1.5 (modelo base) | 33 M aprox. | Embeddings de texto / recuperación | no disponible en la información proporcionada | MIT | HuggingFace |
| dslim/bert-base-NER | no disponible en la información proporcionada | NER (CoNLL-2003, etiquetas PER/ORG/LOC/MISC) | no disponible en la información proporcionada | MIT | HuggingFace |
| baber/bert-base-uncased-finetuned-ner | no disponible en la información proporcionada | NER | no disponible en la información proporcionada | no disponible en la información proporcionada | HuggingFace |

No hay datos de rendimiento comparables entre estos modelos en la información proporcionada. La comparación relevante es estructural: bge-small-ner es aproximadamente tres veces más pequeño que las alternativas basadas en `bert-base`, lo que reduce coste de inferencia y huella de memoria, pero su esquema de etiquetas no está publicado, mientras que alternativas como `dslim/bert-base-NER` documentan explícitamente el conjunto de etiquetas y el corpus de entrenamiento, lo que facilita su adopción directa.

## Limitaciones y advertencias

- Model card incompleta: secciones como "Model description", "Intended uses & limitations" y "Training and evaluation data" contienen literalmente "More information needed". No es posible saber qué entidades detecta el modelo ni con qué esquema de etiquetas.
- Dataset de entrenamiento desconocido: el propio autor indica que se ajustó sobre un dataset no especificado, lo que impide evaluar sesgos de dominio, cobertura de entidades y riesgo de sobreajuste a un corpus concreto.
- Idiomas no declarados: aunque el modelo base es de inglés, no se confirma el idioma del ajuste. No se debe asumir un rendimiento aceptable en castellano sin una evaluación propia.
- Riesgo de alucinación: al no ser generativo, no "alucina" texto, pero sí puede producir etiquetas espurias en tokens que no corresponden a entidades, especialmente fuera del dominio de entrenamiento. La accuracy de 0,9753 está inflada por el desbalance típico de las tareas de NER, donde la mayoría de tokens pertenecen a la clase "O".
- Métricas no reproducibles: el conjunto de evaluación no se identifica, por lo que las cifras de precisión, recall y F1 no son verificables ni comparables con CoNLL-2003 u otros benchmarks estándar.
- Sin adopción: 0 descargas y 0 likes en el momento de la consulta. No hay evidencia de uso en producción ni de validación por terceros.
- Restricciones de licencia: la licencia MIT permite uso comercial, modificación y redistribución con atribución mínima, sin las cláusulas de uso aceptable habituales en otras licencias. Conviene, no obstante, revisar la licencia del modelo base, que también es MIT.
- Longitud de contexto: al derivar de un encoder BERT, es esperable una ventana de 512 tokens, lo que obliga a fragmentar documentos largos con solapamiento y a resolver entidades partidas entre fragmentos.
- Para producción: se recomienda evaluar el modelo sobre un conjunto de validación propio con el esquema de etiquetas real, y considerar su uso conjunto con un modelo mayor o con reglas deterministas para las entidades críticas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aleksanderkarpov/bge-small-ner
- Modelo base BAAI/bge-small-en-v1.5: https://huggingface.co/BAAI/bge-small-en-v1.5
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información proporcionada.
