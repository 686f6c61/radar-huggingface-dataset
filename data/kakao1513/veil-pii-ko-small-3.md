# kakao1513/veil-pii-ko-small-3

## Resumen

veil-pii-ko-small-3 es un modelo de clasificación de tokens (token classification) especializado en la detección de información personal identificable (PII) en texto en coreano. Lo desarrolla el usuario kakao1513 y se distribuye bajo licencia Apache 2.0. El modelo identifica tres tipos de entidades: nombres de persona (PERSON), direcciones (ADDRESS) y nombres de organizaciones (ORGANIZATION), y está pensado para ejecutarse en CPU en entornos de producción con requisitos de latencia y coste bajos.

La arquitectura es un ElectraForTokenClassification derivado de monologg/koelectra-small-v3-discriminator, con 8 capas, dimensión oculta de 256, FFN de 256 y 4 cabezas de atención. Cuenta con 7.748.621 parámetros totales (7,7 M) y se ha destilado por conocimiento desde el modelo profesor 1T/veil-pii-ko-lite. El repositorio ocupa 0,1 GB e incluye pesos en safetensors y una exportación ONNX en FP32 de 31 MB, lo que facilita su despliegue con onnxruntime.

Su relevancia actual radica en la combinación de tamaño reducido, licencia permisiva y un proceso de entrenamiento documentado con destilación, aumento de datos por sustitución de entidades y etiquetado del profesor sobre corpus coreanos reales. El modelo procesa documentos de longitud ilimitada mediante ventanas de 128 tokens con solapamiento de 16, y emplea decodificación Viterbi restringida sobre etiquetas BIOES para generar los spans finales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ElectraForTokenClassification (transformer encoder, 8 capas, hidden 256, FFN 256, 4 cabezas de atencion) |
| Parametros totales | 7.748.621 (7,7 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Ventana de 128 tokens con solapamiento de 16; documento de longitud ilimitada mediante ventanas |
| Tipos de cuantizacion | FP32 (ONNX); no se documentan otras cuantizaciones |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX (model.fp32.onnx) |

## Arquitectura y entrenamiento

El modelo parte de KoELECTRA-small v3 discriminator, del que se seleccionan 8 de las 12 capas y se poda la FFN de 1.024 a 256 dimensiones. Sobre esa base se aplica destilación de conocimiento desde el profesor 1T/veil-pii-ko-lite. La función de pérdida combina tres términos: entropía cruzada con label smoothing 0,05, divergencia KL con temperatura T=2 y factor T²=4, y MSE sobre estados ocultos. Para la destilación de estados ocultos se proyectan las capas 2, 5 y 8 del alumno a 768 dimensiones y se comparan con las capas 3, 8 y 12 del profesor tras normalización de capa. Las 129 etiquetas del profesor se colapsan en 13 etiquetas BIOES agregando las probabilidades de las etiquetas no objetivo en la clase O.

El entrenamiento se realizó en cuatro etapas encadenadas, cada una inicializada desde el mejor checkpoint de la anterior. La etapa inicial de destilación alcanzó un F1 de validación de 0,8598 sobre 129 etiquetas. La etapa de aumento por sustitución de entidades usó 154.734 filas y 228.760 ventanas, con 5 épocas y un F1 de 0,829540. La etapa de incorporación de etiquetas del profesor añadió 119.617 segmentos y alcanzó 0,834841. La etapa final, con 461.303 filas y 566.108 ventanas, logró un F1 de validación de 0,847036 en 3 épocas. El conjunto final combina KDPII train (43.494 filas), BCCard privacy-filter-openpii-masking (57.851), el corpus sintético 1T/veil-pii-ko-synth (25.780), aumentos por sustitución (27.609) y etiquetas del profesor sobre NSMC, noticias de Naver, peticiones ciudadanas y conversaciones seguras en coreano (306.569 en total). Se usó AdamW con weight decay 0,01, clipping de norma 1,0, learning rate máximo 5e-5 con warmup lineal de 3.184 pasos, batch de 32 ventanas y entrenamiento en una RTX 3070 de 8 GB con autocast bfloat16 y semilla 42.

## Capacidades

- Detección de PII en coreano para tres categorías: PERSON (nombres de persona), ADDRESS (direcciones) y ORGANIZATION (nombres de organizaciones).
- Etiquetado de spans con esquema BIOES de 13 etiquetas y decodificación Viterbi restringida para garantizar secuencias válidas.
- Procesamiento de documentos de longitud arbitraria mediante ventanas de 128 tokens con solapamiento de 16 y fusión de spans entre ventanas.
- Devolución de offsets de caracteres sobre el texto original (`start`, `end`), junto con etiqueta y puntuación de confianza.
- Inferencia en CPU con onnxruntime, con paralelización configurable por número de hilos.
- Capacidad de ejecución en entornos sin GPU, incluida la exportación ONNX FP32 de 31 MB.
- Soporte de procesamiento por lotes (batch) en la inferencia.
- No soporta tool calling, function calling, agentes, visión, audio ni razonamiento multi-paso; es un modelo puramente extractivo de etiquetado de tokens.

## Casos de uso

- Desidentificación de documentos antes de enviarlos a modelos de lenguaje externos: el modelo detecta nombres, direcciones y organizaciones en texto coreano y permite enmascararlos o sustituirlos por marcadores antes de que el contenido salga del perímetro de la organización. Su tamaño de 7,7 M y su ejecución en CPU lo hacen viable como paso previo en pipelines de alto volumen.
- Cumplimiento normativo y protección de datos: integración en flujos de tratamiento de expedientes, formularios o correos para localizar PII de forma automática y generar registros de tratamiento. La licencia Apache 2.0 permite su incorporación en productos comerciales sin obligaciones de redistribución del código.
- Anonimización de corpus para investigación: limpieza de datasets coreanos de reseñas, noticias o peticiones ciudadanas antes de su publicación o uso en entrenamiento de otros modelos, con offsets exactos que permiten reconstruir el texto original de forma reversible.
- Moderación y filtrado de contenido generado por usuarios: detección en tiempo real de datos personales en comentarios, foros o chats, con latencia baja al ejecutarse en CPU y sin necesidad de GPU dedicada.
- Enmascaramiento en registros y logs de aplicaciones: procesamiento por lotes de trazas y logs en coreano para eliminar nombres y direcciones antes del almacenamiento o del envío a sistemas de observabilidad.
- Preprocesado para pipelines de extracción de información: primera etapa que localiza entidades de tipo persona, dirección y organización y alimenta etapas posteriores de resolución de entidades, normalización de direcciones o vinculación con bases de datos internas.
- Procesamiento en el borde (edge) y entornos con recursos limitados: despliegue en contenedores pequeños o dispositivos sin GPU gracias a los 31 MB del modelo ONNX y a la ausencia de dependencias pesadas más allá de onnxruntime y tokenizers.

## Benchmarks y rendimiento

| Conjunto | Precision | Recall | F1 |
|---|---:|---:|---:|
| KDPII valid (epoca 1) | 0,832545 | 0,855199 | 0,843720 |
| KDPII valid (epoca 2) | 0,824723 | 0,868805 | 0,846190 |
| KDPII valid (epoca 3) | 0,833490 | 0,861030 | 0,847036 |

Los resultados corresponden a la coincidencia exacta de spans sobre las tres entidades objetivo (PERSON, ADDRESS, ORGANIZATION), con micro-agregación de TP, FP y FN. El conjunto de validación KDPII contiene 5.011 filas y 1.029 spans objetivo. El modelo card menciona además conjuntos de test (KDPII test con 4.891 filas y 949 spans; Veil sintético heldout con 670 filas y 495 spans), pero no se incluyen en la información proporcionada los valores de precisión, recall y F1 obtenidos sobre ellos. Tampoco se han publicado resultados de benchmarks estándar como MMLU, HumanEval o GSM8K, que no aplican a un modelo de etiquetado de tokens.

## Requisitos de hardware

- VRAM estimada para inferencia: prácticamente nula en CPU; en GPU, el modelo FP32 de 31 MB ocupa menos de 1 GB incluyendo activaciones y buffers de inferencia.
- GPU recomendadas: no requiere GPU. Cualquier GPU con al menos 1 GB de memoria libre puede ejecutarlo; una RTX 3070 de 8 GB se usó para el entrenamiento, no para la inferencia.
- Compatibilidad con GPU de consumo: sí, cabe en cualquier GPU de consumo moderna e incluso en iGPU y CPU integradas.
- Opciones de despliegue: onnxruntime (formato principal, con el script `veil3.py` incluido en el repositorio), PyTorch con los pesos safetensors, y exportación a otros runtimes ONNX compatibles. No se documenta soporte nativo para vLLM, llama.cpp, Ollama o TGI, que están orientados a modelos generativos.
- Latencia y throughput estimados: no se publican cifras de latencia ni de throughput en la información disponible. La evaluación de test se realizó con ONNX Runtime FP32 sobre un AMD Ryzen 5 5600X en WSL2 con 8 hilos, ventanas de 128 tokens, solapamiento de 16 y batch de 16, pero sin reportar tiempos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| veil-pii-ko-small-3 | 7,7 M | Ventanas de 128 tokens, documento ilimitado | Coreano | NER de PII (PERSON, ADDRESS, ORGANIZATION) | Apache 2.0 | Hugging Face, ONNX y safetensors |
| 1T/veil-pii-ko-lite (profesor) | no disponible | no disponible | Coreano | NER de PII (129 etiquetas) | no disponible | Hugging Face |
| monologg/koelectra-small-v3-discriminator (base) | no disponible | no disponible | Coreano | Modelo de lenguaje enmascarado / discriminador | no disponible | Hugging Face |
| BCCard privacy-filter-openpii-masking (dataset asociado) | no aplica | no aplica | Coreano | Corpus de enmascaramiento de PII | no disponible | Hugging Face Datasets |

No se dispone de datos de rendimiento de los modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de F1 entre ellos. La comparación se limita a parámetros, idioma, tarea y licencia.

## Limitaciones y advertencias

- Cobertura limitada a tres tipos de entidad: no detecta números de teléfono, correos electrónicos, números de tarjeta, identificadores fiscales ni otras categorías de PII habituales, a pesar de que el profesor maneja 129 etiquetas.
- Solo coreano: no está entrenado ni evaluado para otros idiomas, por lo que su uso en texto multilingüe o con mezcla de coreano y otros alfabetos puede degradar la precisión.
- Riesgo de alucinación de spans: como todo modelo extractivo, puede generar falsos positivos (marcar como PII texto que no lo es) y falsos negativos (omitir entidades reales), con un F1 de validación de 0,847036 que deja margen de error apreciable en producción.
- Sesgos de dominio: el entrenamiento se apoya en KDPII, el corpus de BCCard, reseñas de NSMC, noticias de Naver, peticiones ciudadanas y conversaciones seguras. El rendimiento puede caer en dominios alejados de esos géneros, como texto técnico, jurídico especializado o jerga.
- Dependencia de etiquetas del profesor: una parte sustancial del corpus de entrenamiento (306.569 segmentos) está etiquetada automáticamente por el profesor, lo que propaga sus errores y sesgos al alumno.
- Limitaciones de contexto: la ventana es de 128 tokens; aunque el documento completo se procesa por ventanas, las entidades que cruzan los límites de ventana dependen del solapamiento de 16 tokens y del algoritmo de fusión, que puede fallar en casos límite.
- Verificación de duplicados incompleta: el propio modelo card indica que la comprobación de solapamiento entre validación, test y entrenamiento se limitó a coincidencia exacta de cadenas, sin comprobar similitud ni duplicados parciales, lo que puede inflar ligeramente las métricas reportadas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución con atribución y sin garantías; conviene conservar el aviso de licencia y el aviso de cambios si se modifica.
- Ausencia de garantías de producción: no se documentan pruebas de robustez frente a adversarial examples, inyección de texto malicioso ni evaluación de sesgos demográficos, por lo que se recomienda validación propia antes de un despliegue crítico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kakao1513/veil-pii-ko-small-3
- Modelo base: https://huggingface.co/monologg/koelectra-small-v3-discriminator
- Modelo profesor: https://huggingface.co/1T/veil-pii-ko-lite
- Dataset BCCard privacy-filter-openpii-masking: https://huggingface.co/datasets/BCCard/privacy-filter-openpii-masking
- Dataset sintético 1T/veil-pii-ko-synth: https://huggingface.co/datasets/1T/veil-pii-ko-synth
- Dataset NSMC: https://huggingface.co/datasets/e9t/nsmc
- Dataset Naver News Summarization KO: https://huggingface.co/datasets/daekeun-ml/naver-news-summarization-ko
- Dataset Korean Petitions: https://huggingface.co/datasets/heegyu/korean-petitions
- Dataset Korean Safe Conversation: https://huggingface.co/datasets/jojo0217/korean_safe_conversation
