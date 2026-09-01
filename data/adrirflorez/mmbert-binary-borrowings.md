# adrirflorez/mmbert-binary-borrowings

## Resumen

El modelo `adrirflorez/mmbert-binary-borrowings` es un modelo de clasificación de tokens (token classification) publicado en Hugging Face por Adriana R. Flórez, estudiante de máster en Lingüística Computacional en la Universidad Carolina de Praga. Está etiquetado como basado en ModernBERT y su pipeline es de token-classification, lo que sugiere que se trata de un fine-tuning de un encoder tipo BERT para la detección de préstamos lingüísticos (binary borrowings) en texto. El modelo tiene 307.531.778 parámetros y se distribuye en formato safetensors, con un tamaño de repositorio de 1,3 GB.

La model card oficial está prácticamente vacía: no se especifican datos de entrenamiento, licencia, idiomas soportados ni métricas de evaluación. A pesar de la escasez de información, el modelo es relevante porque aborda una tarea especializada en lingüística computacional: la identificación de préstamos léxicos (palabras tomadas de otras lenguas) en un contexto multilingüe, probablemente aprovechando las capacidades del modelo base mmBERT, un encoder multilingüe moderno entrenado sobre 3 billones de tokens en 1833 lenguas. Sin embargo, no se puede confirmar que este fine-tune use exactamente mmBERT como base, ya que solo se indica la etiqueta "modernbert".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (tipo ModernBERT, no confirmado) |
| Parametros totales | 307.531.778 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en precisión original) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura exacta del modelo. Por la etiqueta "modernbert" y el nombre "mmbert", es probable que se trate de un fine-tuning de un modelo de la familia ModernBERT, que es un encoder transformer optimizado para eficiencia y contextos largos. El modelo base mmBERT, desarrollado por JHU-CLSP, emplea una técnica de aprendizaje de idiomas con annealing en cascada (cascading annealed language learning) y ha demostrado mejoras sobre XLM-R en tareas multilingües. No obstante, no se puede confirmar que este checkpoint concreto utilice ese modelo base, ni se conocen los datos de entrenamiento, el número de épocas, la configuración de hiperparámetros o si se aplicaron técnicas de ajuste como RLHF o DPO. Toda esta información aparece como "[More Information Needed]" en la model card.

## Capacidades

- Clasificación de tokens: el pipeline declarado es token-classification, por lo que el modelo asigna una etiqueta a cada token (probablemente binaria: préstamo o no préstamo).
- Tarea específica de préstamos lingüísticos: el nombre "binary-borrowings" indica que se centra en la detección de palabras prestadas de otras lenguas, aunque no se especifican los idiomas implicados.
- No se documentan capacidades adicionales como generación de texto, razonamiento, tool calling o soporte de agentes.
- No se indica soporte multilingüe explícito, aunque el nombre sugiere que podría funcionar en varios idiomas si el modelo base es mmBERT.

## Casos de uso

- Investigación en lingüística de contacto: el modelo puede utilizarse para identificar automáticamente préstamos léxicos en corpus multilingües, facilitando estudios sobre influencia interlingüística y evolución léxica.
- Análisis de textos históricos: en corpus diacrónicos, la detección de préstamos ayuda a rastrear la entrada de palabras extranjeras en una lengua a lo largo del tiempo.
- Normalización de textos para NLP: marcar tokens prestados puede mejorar sistemas de normalización ortográfica o de lematización en lenguas con alta influencia externa.
- Enriquecimiento de recursos léxicos: el modelo puede alimentar diccionarios o bases de datos de préstamos, reduciendo el trabajo manual de anotación.
- Estudio de variedades dialectales: en comunidades bilingües, la identificación de préstamos ayuda a caracterizar el code-switching y la mezcla de códigos.
- Evaluación de políticas lingüísticas: los resultados pueden informar decisiones sobre purismo lingüístico o planificación del lenguaje, al cuantificar la presencia de préstamos en medios o documentos oficiales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de evaluación (F1, precisión, recall, etc.) ni comparaciones con otros modelos de clasificación de tokens.

## Requisitos de hardware

- VRAM estimada: no disponible, pero con 307 millones de parámetros, un modelo encoder de este tamaño requiere aproximadamente 1,2 GB en FP32 y unos 0,6 GB en FP16 para los pesos. En la práctica, con la activación y el optimizador, se necesitan al menos 4-6 GB de VRAM para inferencia en lotes pequeños.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM (por ejemplo, RTX 2060, RTX 3060, RTX 4060) puede ejecutar el modelo en FP16. Para entrenamiento o fine-tuning, se recomienda una GPU con 12-16 GB (RTX 3080, RTX 4080, A10, etc.).
- Sí cabe en GPUs de consumo: una RTX 3060 de 12 GB es suficiente para inferencia y fine-tuning ligero.
- Opciones de despliegue: al ser un modelo de transformers, se puede servir con Hugging Face Inference Endpoints, o mediante bibliotecas como vLLM (aunque vLLM está más orientado a generación, también soporta encoders), o simplemente con la API de transformers en Python. También se puede exportar a ONNX para inferencia en CPU.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa fiable. El modelo se asemeja a otros fine-tunings de BERT para token classification (por ejemplo, los basados en XLM-R o mBERT), pero no hay datos de rendimiento ni de configuración exacta. Se puede indicar que, por tamaño, está en el rango de modelos como XLM-R base (278M parámetros) o mBERT (172M), pero sin métricas no es posible establecer comparaciones.

## Limitaciones y advertencias

- La model card no proporciona información sobre sesgos, riesgos de alucinación o limitaciones de contexto. Al ser un modelo de clasificación de tokens, no genera texto, por lo que el riesgo de alucinación es bajo, pero puede cometer errores de etiquetado.
- No se especifican los idiomas soportados ni el dominio de entrenamiento, por lo que su rendimiento fuera de ese dominio podría ser deficiente.
- La licencia es "no disponible", lo que impide conocer las restricciones de uso comercial. Se recomienda contactar con el autor antes de utilizarlo en producción.
- No se indica si el modelo ha sido evaluado en conjuntos de datos estándar, por lo que su calidad es incierta.
- El nombre "binary-borrowings" sugiere una tarea binaria (préstamo o no), pero no se detalla la definición exacta de "préstamo" utilizada, lo que puede afectar a la interpretación de los resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/adrirflorez/mmbert-binary-borrowings
- Repositorio de mmBERT (posible base): https://github.com/JHU-CLSP/mmBERT
- Blog de mmBERT: https://huggingface.co/blog/mmbert
- Paper de mmBERT: https://arxiv.org/html/2509.06888v1
- Perfil de GitHub de la autora: https://github.com/adrirflorez/
