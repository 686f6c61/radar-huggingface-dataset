# daominhwysi/sealior-modernbert-vi-exam-seq-labeling

## Resumen

sealior-modernbert-vi-exam-seq-labeling es un modelo de etiquetado de secuencias (token classification) desarrollado por el usuario daominhwysi, afinado a partir del encoder multilingüe aisingapore/SEA-LION-ModernBERT-300M. Su propósito es la extracción estructural granular de exámenes educativos vietnamitas de secundaria y bachillerato (grados 8 a 12), cubriendo asignaturas como matemáticas, física, química, biología, historia, geografía, literatura e inglés, tanto en documentos digitales como escaneados.

El modelo resuelve un problema concreto de ingeniería de datos educativos: convertir exámenes en texto plano a una representación XML estructurada con entidades diferenciadas (enunciado, opciones, estímulos de lectura, secciones, explicaciones) sin alterar un solo carácter del texto original, lo que el autor denomina garantía de mutación de caracteres cero. Frente a aproximaciones generativas, el enfoque discriminativo de etiquetado por token evita la alucinación de contenido y preserva fielmente fórmulas y notación matemática.

Técnicamente se trata de un transformer encoder ModernBERT de 312,8 millones de parámetros con una cabeza de clasificación personalizada, contexto máximo de entrenamiento de 8192 tokens y ventanas dinámicas multiescala. Su relevancia actual radica en la digitalización fiable de bancos de preguntas y en la construcción de pipelines de evaluación educativa reproducibles, con licencia Apache 2.0 que permite uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder ModernBERT con cabeza `EnhancedBertForTokenClassification` |
| Parámetros totales | 312.866.338 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens máximo del encoder; entrenamiento con ventanas dinámicas de 768, 1024, 1536 y 2048 |
| Tipos de cuantización | no disponible |
| Idiomas soportados | vietnamita (vi), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte del encoder aisingapore/SEA-LION-ModernBERT-300M, un ModernBERT multilingüe con atención flash sin padding y contexto máximo de 8192 tokens. Sobre él se añade una cabeza de clasificación denominada `EnhancedBertForTokenClassification` que incorpora tres componentes diferenciados: un pooling de capas con compuerta sigmoide sobre 4 capas (`SigmoidWeightedLayerPooling`), que sustituye el pooling softmax habitual por una ponderación independiente por capa; un refinamiento convolucional depthwise 1D con `kernel_size=7` para capturar n-gramas de frontera locales; y multi-sample dropout con tasas `[0.05, 0.10, 0.15, 0.20, 0.25]`. El etiquetado sigue el esquema BIO estándar sobre 7 entidades de examen.

El ajuste fino se realizó sobre el dataset daominhwysi/sequence-labelling-vi-exam-v3, con entrenamiento multiescala mediante `LengthGroupedBatchSampler` y ventanas de 768, 1024, 1536 y 2048 tokens. El checkpoint publicado corresponde a la época 8 de 8. La evaluación se llevó a cabo sobre un conjunto Gold Benchmark aislado de 51 documentos de examen reales y aproximadamente 458 000 tokens. No se dispone de información sobre el número total de tokens de entrenamiento, la composición exacta del corpus ni el uso de RLHF o DPO, que en un modelo discriminativo de este tipo no resultan aplicables.

## Capacidades

- Etiquetado de secuencias a nivel de token con 7 entidades de examen: `QUESTION_LABEL`, `STEM`, `OPTION_LABEL`, `OPTION_TEXT`, `STIMULUS`, `SECTION` y `EXPLANATION`.
- Reconstrucción a XML estructurado envolviendo directamente las subcadenas de entrada, con garantía de mutación de caracteres cero (sin borrado, alteración ni alucinación de texto).
- Soporte de preguntas cloze o de relleno en las que la etiqueta de pregunta precede directamente a la etiqueta de opción sin enunciado explícito.
- Procesamiento de exámenes de matemáticas, física, química, biología, historia, geografía, literatura e inglés de los grados 8 a 12.
- Manejo de texto compartido de comprensión lectora, poemas y pasajes estímulo mediante la entidad `STIMULUS`.
- Extracción de soluciones, claves de respuesta y baremos de puntuación mediante la entidad `EXPLANATION`.
- Capacidad bilingüe vietnamita-inglés, incluyendo exámenes de inglés con instrucciones en inglés.
- No soporta tool calling, function calling, razonamiento multi-paso ni modo thinking: es un modelo discriminativo, no generativo.
- No dispone de capacidades de visión, audio ni generación de texto libre.

## Casos de uso

- Digitalización de bancos de preguntas: el modelo convierte exámenes en PDF o texto a XML estructurado preservando íntegramente fórmulas LaTeX y notación matemática, lo que permite indexar y reutilizar preguntas en plataformas de evaluación sin revisión manual carácter a carácter.
- Construcción de pipelines de calificación automática: al separar `STEM`, `OPTION_TEXT` y `EXPLANATION`, es posible emparejar respuestas de alumnos con claves de corrección y baremos de forma programática, reduciendo el trabajo manual en sistemas de corrección.
- Extracción de corpus para entrenamiento de LLM educativos: la salida estructurada y sin mutación sirve como fuente de datos limpia para ajustar modelos generativos en dominio educativo vietnamita, evitando el ruido típico de la extracción con OCR y parsers heurísticos.
- Migración de exámenes en papel a formato digital: con soporte para documentos escaneados, el modelo etiqueta secciones, estímulos y opciones de exámenes históricos, facilitando su incorporación a repositorios digitales de centros educativos.
- Análisis curricular y estadístico: al etiquetar `SECTION` y `QUESTION_LABEL` de forma consistente, se pueden agregar métricas sobre distribución de dificultad, tipos de pregunta y cobertura temática por asignatura y curso.
- Normalización de exámenes de inglés con texto compartido: la entidad `STIMULUS` permite aislar pasajes de comprensión lectora y vincularlos a sus preguntas asociadas, algo útil en la generación de materiales de práctica adaptativos.
- Control de calidad editorial: la garantía de mutación cero permite verificar que el texto reconstruido coincide exactamente con el original, sirviendo como paso de validación en pipelines de publicación de exámenes.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el conjunto Gold Benchmark de 51 documentos reales (aproximadamente 458 000 tokens), con checkpoint de la época 8 de 8. Ninguno de los valores está verificado de forma independiente.

| Métrica | Valor |
|---|---|
| Validation Macro F1 | 82,93 % |
| Validation Precision | 79,36 % |
| Validation Recall | 86,83 % |
| Validation Micro F1 | 82,93 % |

No se han publicado resultados comparativos con otros modelos de etiquetado de secuencias en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 312,8 millones de parámetros, en precisión fp32 se requieren aproximadamente 1,25 GB de pesos, más activaciones; en fp16 o bf16, alrededor de 0,63 GB. El consumo real depende de la longitud de secuencia, que puede llegar a 8192 tokens.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente para secuencias cortas; para lotes grandes o secuencias de 8192 tokens se recomienda una RTX 3090, RTX 4090, A100 o H100.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4070 o superiores, incluso con cuantización a 8 bits si fuese necesario.
- Opciones de despliegue: la model card proporciona código de inferencia basado en `transformers` y `torch` con una clase personalizada `EnhancedBertForTokenClassification`; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI. La exportación a ONNX o el despliegue con TorchServe requeriría trabajo adicional por la cabeza de clasificación personalizada.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sealior-modernbert-vi-exam-seq-labeling | 312,8 M | 8192 tokens (encoder) | Etiquetado de secuencias de exámenes vietnamitas | Apache 2.0 | Hugging Face |
| aisingapore/SEA-LION-ModernBERT-300M (base) | ~300 M | 8192 tokens | Encoder multilingüe de propósito general | no disponible en la información | Hugging Face |
| Modelos BERT/XLM-R afinados para NER educativo | no disponible | típicamente 512 tokens | Etiquetado de secuencias genérico | variable | Hugging Face |

La comparación con alternativas específicas de parsing de exámenes vietnamitas no está disponible en la información proporcionada. Frente al modelo base, la diferencia principal es la cabeza de clasificación personalizada y el ajuste fino sobre el esquema de 7 entidades, que no existen en el encoder original.

## Limitaciones y advertencias

- El modelo está especializado en exámenes educativos vietnamitas de grados 8 a 12; su rendimiento fuera de ese dominio (documentos administrativos, textos legales, otros idiomas) no está evaluado y probablemente sea deficiente.
- Los benchmarks declarados no están verificados de forma independiente (`verified: false` en el model-index) y proceden del propio autor sobre un conjunto de 51 documentos, lo que limita la generalización de las cifras.
- La precisión del 79,36 % implica una tasa no trivial de falsos positivos en la asignación de entidades; en producción conviene incluir validación posterior o revisión humana en puntos críticos.
- El recall del 86,83 % indica que aproximadamente una de cada siete entidades podría no detectarse, lo que afecta a la completitud de la extracción en pipelines automáticos.
- Aunque la garantía de mutación cero evita alucinaciones de contenido, el modelo puede asignar etiquetas incorrectas a fragmentos de texto, produciendo una estructura XML errónea sin alterar el texto subyacente.
- El repositorio ocupa 66,4 GB, lo que sugiere la presencia de múltiples checkpoints o artefactos adicionales; conviene revisar qué ficheros se descargan antes de integrarlo en un pipeline.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y el dataset de entrenamiento pueden tener condiciones adicionales que no se detallan en la información disponible.
- No se documentan sesgos específicos; al tratarse de un modelo entrenado sobre exámenes vietnamitas, puede reflejar sesgos curriculares o de estilo de redacción propios de las fuentes utilizadas.
- La clase personalizada `EnhancedBertForTokenClassification` requiere cargar código del repositorio, lo que introduce una dependencia de confianza sobre el autor y complica la portabilidad a otros frameworks de inferencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/daominhwysi/sealior-modernbert-vi-exam-seq-labeling
- Modelo base SEA-LION-ModernBERT-300M: https://huggingface.co/aisingapore/SEA-LION-ModernBERT-300M
- Dataset de entrenamiento: https://huggingface.co/datasets/daominhwysi/sequence-labelling-vi-exam-v3
