# melll-uff/luisastellet-bert_metaphor_melhor_hp

## Resumen

El modelo `melll-uff/luisastellet-bert_metaphor_melhor_hp` es un modelo de clasificación de texto basado en la arquitectura BERT, publicado por el laboratorio MeLLL (Machine and Language Learning Lab) de la Universidade Federal Fluminense (Brasil). El nombre sugiere que se trata de un ajuste fino (fine-tuning) de BERT para la detección de metáforas, probablemente en portugués brasileño, aunque no se dispone de confirmación explícita en la información proporcionada. El modelo cuenta con 108.311.810 parámetros, lo que coincide con el tamaño típico de BERT-base.

La model card publicada por el autor está prácticamente vacía: no se especifican datos de entrenamiento, hiperparámetros, licencia, idiomas ni evaluación. A pesar de ello, el repositorio contiene pesos en formato safetensors y está etiquetado como compatible con `text-embeddings-inference` y `endpoints_compatible`. Su relevancia radica en que aborda una tarea especializada de procesamiento del lenguaje natural, la detección de metáforas, que tiene aplicaciones en análisis literario, comprensión de lenguaje figurado y sistemas de diálogo. Sin embargo, la falta de documentación limita su uso directo en producción sin una evaluación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (encoder transformer, base) |
| Parametros totales | 108.311.810 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (típico de BERT: 512 tokens, sin confirmar) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (probablemente portugués brasileño, sin confirmar) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura BERT (Bidirectional Encoder Representations from Transformers), un transformer encoder de 12 capas con 768 dimensiones ocultas y 12 cabezas de atención, que da lugar a aproximadamente 110 millones de parámetros. El número exacto de parámetros (108.311.810) es consistente con una variante de BERT-base, posiblemente con un vocabulario adaptado al portugués o con ajustes menores en la capa de clasificación.

No se dispone de información sobre el proceso de entrenamiento: no se especifican los datos utilizados, el número de tokens, el régimen de entrenamiento (fp16, bf16, etc.) ni si se emplearon técnicas como RLHF o DPO. El nombre del modelo incluye la cadena "metaphor_melhor_hp", que sugiere que se trata de un ajuste fino para detección de metáforas con los mejores hiperparámetros encontrados ("melhor" significa "mejor" en portugués). El laboratorio MeLLL tiene publicados trabajos sobre detección de metáforas, como el modelo MelBERT (metaphor-aware late interaction over BERT), por lo que es plausible que este modelo siga una línea similar, aunque no hay confirmación directa.

## Capacidades

- Clasificación de texto: el pipeline declarado es `text-classification`, lo que indica que el modelo está diseñado para tareas de clasificación de secuencias, probablemente detección binaria de metáforas (metafórico vs. literal).
- Detección de metáforas: según el nombre y la trayectoria del laboratorio, el modelo está orientado a identificar expresiones metafóricas en texto.
- Compatibilidad con Hugging Face Transformers: se puede cargar con la librería `transformers` para realizar inferencia.
- Compatible con `text-embeddings-inference` y `endpoints_compatible`, lo que facilita su despliegue en servicios de inferencia.
- No se han documentado capacidades adicionales como tool calling, agentes, razonamiento multi-paso, visión o audio.

## Casos de uso

- Análisis literario y lingüístico: el modelo puede utilizarse para identificar metáforas en corpus literarios o periodísticos, ayudando a investigadores en humanidades digitales a estudiar el uso del lenguaje figurado.
- Moderación de contenido: en plataformas que necesitan detectar lenguaje figurado que pueda resultar ofensivo o engañoso, el modelo podría integrarse en pipelines de análisis de texto para marcar expresiones metafóricas.
- Sistemas de diálogo y asistentes virtuales: la detección de metáforas permite a un sistema comprender mejor la intención del usuario cuando utiliza lenguaje figurado, mejorando la respuesta en interacciones conversacionales.
- Educación y aprendizaje de idiomas: herramientas de enseñanza del portugués pueden usar el modelo para explicar el significado de metáforas en textos, facilitando la comprensión lectora.
- Análisis de opiniones y sentimientos: las metáforas suelen transmitir carga emocional; detectarlas puede mejorar los sistemas de análisis de sentimiento en redes sociales o reseñas.
- Investigación en PLN: el modelo sirve como punto de partida para experimentos de detección de metáforas en portugués, aunque requiere validación adicional dado que no hay benchmarks publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como MMLU, HumanEval, GSM8K ni de evaluaciones específicas para detección de metáforas (p. ej., F1 en datasets como VUA o MOH-X). Se recomienda al usuario realizar una evaluación propia antes de usar el modelo en producción.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo BERT-base (~108M parámetros), la inferencia en FP32 requiere aproximadamente 433 MB de memoria para los pesos. Con cuantización a 8 bits (si se aplicara) se reduciría a unos 108 MB, y a 4 bits a unos 54 MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM puede ejecutar el modelo en FP32. Una NVIDIA GTX 1050 Ti (4 GB) o superior es suficiente. Para despliegues concurrentes, se recomienda una GPU con más memoria, como RTX 3060 (12 GB) o A10G.
- Cabe en GPUs de consumo: sí, en prácticamente cualquier GPU moderna de consumo, incluso en CPU con suficiente RAM.
- Opciones de despliegue: al ser un modelo de la familia BERT, se puede servir con vLLM, Hugging Face TGI, llama.cpp (con conversión a GGUF), o mediante la API de Hugging Face Inference Endpoints. También se puede ejecutar con la librería `transformers` de manera sencilla.
- Latencia y throughput: no se dispone de mediciones específicas. En una GPU moderna, la inferencia de una secuencia de 512 tokens suele estar por debajo de 10 ms, pero no hay datos confirmados para este modelo concreto.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable. El modelo parece ser un fine-tuning de BERT para detección de metáforas en portugués, pero no se conocen sus resultados frente a alternativas como:

- `melll-uff/sbert_ptbr`: otro modelo del mismo laboratorio, orientado a sentence embeddings en portugués, pero con una tarea distinta.
- Modelos genéricos de clasificación de texto en portugués (p. ej., `neuralmind/bert-base-portuguese-cased`): no son específicos para metáforas.
- Modelos de detección de metáforas en inglés como MelBERT o BERT-Metaphor: no son comparables directamente por el idioma y la falta de datos.

Se recomienda evaluar el modelo en el dataset objetivo antes de compararlo con cualquier alternativa.

## Limitaciones y advertencias

- La model card no contiene información sobre sesgos, riesgos o limitaciones. No se puede garantizar la ausencia de sesgos de género, raza o culturales, especialmente si el entrenamiento se realizó sobre datos no auditados.
- Riesgo de alucinación: como modelo de clasificación, no genera texto libre, por lo que el riesgo de alucinación es bajo, pero la clasificación puede ser errónea en casos de lenguaje figurado complejo o ambiguo.
- Limitaciones de contexto: BERT tiene una ventana de contexto limitada (típicamente 512 tokens). Textos más largos deberán truncarse o dividirse.
- Idioma: no se ha especificado el idioma de entrenamiento. Si el modelo fue entrenado solo en portugués, su rendimiento en otros idiomas será deficiente.
- Licencia: no se indica ninguna licencia, lo que impide conocer las restricciones de uso comercial. Se recomienda contactar con el autor antes de utilizarlo en proyectos comerciales.
- Falta de documentación: la ausencia de detalles sobre el entrenamiento y la evaluación hace que el modelo no sea apto para producción sin una validación exhaustiva previa.
- Descargas y popularidad: el modelo tiene 0 descargas y 0 likes, lo que sugiere que no ha sido probado por la comunidad. Úsese con cautela.

## Enlaces

- Repositorio del modelo: https://huggingface.co/melll-uff/luisastellet-bert_metaphor_melhor_hp
- Organización MeLLL en Hugging Face: https://huggingface.co/melll-uff
- Página del grupo de investigación MeLLL: https://melll-uff.github.io/
- GitHub del laboratorio: https://github.com/MeLLL-UFF
- Referencia al paper de MelBERT (detección de metáforas con BERT): https://scite.ai/reports/melbert-metaphor-detection-via-contextualized-Nl6za1AP
