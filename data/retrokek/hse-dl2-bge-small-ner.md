# retrokek/hse-dl2-bge-small-ner

## Resumen

`retrokek/hse-dl2-bge-small-ner` es un modelo de reconocimiento de entidades nombradas (NER) obtenido por ajuste fino (fine-tuning) del modelo de embeddings `BAAI/bge-small-en-v1.5`. Lo publica el usuario retrokek en Hugging Face y su tarea declarada en el pipeline es `token-classification`, es decir, asignar una etiqueta a cada token de una secuencia de entrada. El repositorio ocupa 0,1 GB y contiene pesos en formato safetensors con 33.215.625 parámetros, lo que lo sitúa en la gama de los modelos encoder pequeños basados en BERT.

El interés práctico del modelo es su tamaño reducido: con unos 33 millones de parámetros se puede ejecutar en CPU, en GPUs de consumo e incluso en dispositivos con pocos recursos, a un coste muy inferior al de los grandes modelos generativos. El autor declara en la model card métricas de evaluación de F1 0,8945, precisión 0,8773, recall 0,9123 y accuracy 0,9794, obtenidas tras 8 épocas de entrenamiento con AdamW y una tasa de aprendizaje de 2e-05.

Ahora bien, la ficha debe leerse con cautela: la model card está generada automáticamente por el `Trainer` de Transformers e indica "an unknown dataset" y "More information needed" en las secciones de descripción, usos previstos y datos de entrenamiento. No se especifican los tipos de entidad soportados, el idioma de entrenamiento ni el dominio de aplicación, y el modelo no tiene descargas ni valoraciones en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (hereda la del modelo base `BAAI/bge-small-en-v1.5`), con cabeza de clasificación de tokens; etiqueta `bert` en el repositorio |
| Parámetros totales | 33.215.625 |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (límite de posiciones de la arquitectura BERT del modelo base; no especificado en la model card) |
| Tipos de cuantización | No disponible en el repositorio: los pesos se distribuyen en fp32 (~133 MB). Al ser un encoder de 33 M de parámetros es convertible a fp16/int8/ONNX con herramientas estándar (Optimum, ONNX Runtime), pero el autor no publica versiones cuantizadas |
| Idiomas soportados | No disponible. El modelo base `BAAI/bge-small-en-v1.5` está orientado a inglés, por lo que el soporte multilingüe no está garantizado |
| Licencia | MIT |
| Formato de pesos | safetensors (librería `transformers`, compatible con `endpoints_compatible`) |

Otros metadatos: pipeline `token-classification`, tags `generated_from_trainer`, `base_model:BAAI/bge-small-en-v1.5`, `region:us`. Tamaño del repositorio: 0,1 GB. Creado el 2026-10-11 y actualizado el 2026-10-11 según los metadatos de Hugging Face.

## Arquitectura y entrenamiento

La arquitectura es la del modelo base `BAAI/bge-small-en-v1.5`, un encoder Transformer tipo BERT de 12 capas y dimensión oculta 384, con 33 M de parámetros, al que se le añade una cabeza de clasificación de tokens (`token-classification`) para producir una etiqueta por token. No se trata de un modelo MoE, ni de un SSM, ni de una arquitectura híbrida: es un encoder denso estándar orientado a comprensión del lenguaje, no a generación de texto. El modelo base fue diseñado originalmente para recuperación densa y similitud semántica, y aquí se reutiliza como extractor de representaciones para una tarea discriminativa.

El procedimiento de entrenamiento está documentado únicamente a nivel de hiperparámetros en la model card: 8 épocas, `learning_rate` 2e-05, `train_batch_size` 32, `eval_batch_size` 64, semilla 42, optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-08, y scheduler lineal. Con 313 pasos por época y lote de 32, el conjunto de entrenamiento rondaría los 10.016 ejemplos por época (unas 80.128 muestras procesadas en total), una estimación derivada de los pasos registrados, no un dato confirmado por el autor. No se documenta la composición del dataset (el propio README indica "an unknown dataset"), ni si hubo RLHF, DPO u otra fase de alineamiento; en un modelo encoder de clasificación estas técnicas no son habituales. Tampoco se documenta ninguna innovación técnica adicional como decodificación especulativa o atención lineal. Las versiones de framework declaradas son Transformers 4.50.0, PyTorch 2.11.0+cu128, Datasets 3.4.1 y Tokenizers 0.21.4.

## Capacidades

- Reconocimiento de entidades nombradas: clasificación por token sobre texto de entrada, con salida de logits y etiquetas compatibles con el pipeline `token-classification` de Transformers.
- Extracción de entidades en inglés: capacidad heredada del modelo base, que está entrenado principalmente con corpus en inglés. No hay confirmación de soporte para castellano ni para otros idiomas.
- Inferencia sobre secuencias de hasta 512 tokens, adecuada para frases, párrafos y documentos cortos segmentados.
- Ejecución en CPU y en GPUs de gama baja gracias a sus 33 M de parámetros.
- Integración directa con el ecosistema Transformers (`AutoModelForTokenClassification`, `pipeline`) y con `endpoints_compatible` para despliegue en Hugging Face Inference Endpoints.
- No soporta generación de texto: es un modelo encoder de clasificación, no un modelo causal de lenguaje.
- No soporta tool calling ni function calling.
- No soporta agentes, planificación ni razonamiento multi-paso.
- No dispone de modo "thinking", ni capacidades de visión, audio o multimodalidad.
- No se documentan capacidades de código ni de matemáticas (no son tareas propias de esta arquitectura y no se han evaluado).
- El conjunto de etiquetas (tipos de entidad) no está documentado en la model card, por lo que debe inspeccionarse en la configuración del modelo antes de usarlo en producción.

## Casos de uso

- Extracción de entidades en textos en inglés: el modelo etiqueta tokens para identificar personas, organizaciones, localizaciones u otras categorías, siempre que se verifique previamente el `id2label` del modelo. Adecuado por su bajo coste de inferencia y su F1 declarado de 0,8945 en el conjunto de evaluación del propio autor.
- Preanotación en proyectos de etiquetado humano: se puede usar como primer paso para generar etiquetas automáticas que un anotador revise, reduciendo el tiempo de anotación en corpus de NER. Su tamaño reducido permite ejecutarlo en el portátil del anotador.
- Enriquecimiento de metadatos en pipelines de RAG: extraer entidades de los fragmentos de documento antes de indexarlos, de modo que el recuperador pueda filtrar o ponderar por entidad mencionada.
- Enrutado y clasificación de tickets de soporte: detectar organizaciones, productos o personas citadas en un ticket para dirigirlo al equipo correspondiente, con latencia muy baja al ejecutarse sobre CPU.
- Detección de posibles datos personales antes de registrar logs: marcar nombres y organizaciones en trazas de texto antes de almacenarlas, como capa auxiliar dentro de una política de minimización de datos. Requiere validar previamente que las etiquetas del modelo cubren las categorías que se quieren proteger.
- Análisis documental de contratos o informes en inglés: extracción de las partes implicadas y entidades relevantes para generar índices o resúmenes estructurados, procesando el documento por ventanas de hasta 512 tokens.
- Servicio de inferencia en edge o en contenedores pequeños: al pesar aproximadamente 133 MB en fp32, se puede empaquetar en una imagen Docker ligera o desplegar en dispositivos con recursos limitados donde un modelo de miles de millones de parámetros no cabe.
- Búsqueda facetada sobre catálogos o documentación técnica: generar facetas por entidad para permitir filtrado posterior en un buscador, aprovechando el throughput alto que ofrece un encoder de 33 M de parámetros.

## Benchmarks y rendimiento

El índice de resultados del `model-index` de la model card está vacío (`"results": []`), por lo que no hay benchmarks estándar tipo MMLU, HumanEval o GSM8K. El autor solo publica métricas sobre su propio conjunto de evaluación, sin especificar su composición.

| Métrica (conjunto de evaluación del autor) | Valor |
|---|---|
| Loss | 0,0897 |
| Precision | 0,8773 |
| Recall | 0,9123 |
| F1 | 0,8945 |
| Accuracy | 0,9794 |

Evolución por época declarada por el autor:

| Época | Paso | Validation loss | Precision | Recall | F1 | Accuracy |
|---|---|---|---|---|---|---|
| 1.0 | 313 | 0,2447 | 0,6849 | 0,7326 | 0,7079 | 0,9502 |
| 2.0 | 626 | 0,1492 | 0,8145 | 0,8600 | 0,8366 | 0,9705 |
| 3.0 | 939 | 0,1212 | 0,8278 | 0,8918 | 0,8586 | 0,9735 |
| 4.0 | 1252 | 0,1037 | 0,8565 | 0,9012 | 0,8783 | 0,9775 |
| 5.0 | 1565 | 0,0980 | 0,8649 | 0,9063 | 0,8851 | 0,9780 |
| 6.0 | 1878 | 0,0920 | 0,8748 | 0,9115 | 0,8928 | 0,9791 |
| 7.0 | 2191 | 0,0904 | 0,8752 | 0,9135 | 0,8939 | 0,9792 |
| 8.0 | 2504 | 0,0897 | 0,8773 | 0,9123 | 0,8945 | 0,9794 |

No se han publicado resultados de benchmarks estándar comparables en la información disponible. Las cifras anteriores corresponden al conjunto de evaluación definido por el propio autor, cuya composición y dominio no se documentan, por lo que no son directamente comparables con resultados de terceros sobre CoNLL-2003 u otros corpus públicos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 133 MB para los pesos en fp32, unos 66 MB en fp16 y unos 33 MB en int8 (cálculo derivado del número de parámetros, no una medición publicada). A ello hay que sumar el consumo de activaciones y del runtime, típicamente unas pocas centenas de megabytes en total.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria libre es suficiente, incluidas tarjetas integradas. Modelos como A100, H100 o RTX 4090 están sobredimensionados para este modelo; su uso solo tendría sentido para servir lotes muy grandes en paralelo.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo actual e incluso en iGPU y en placas tipo Raspberry Pi o Jetson, dado el reducido tamaño del modelo.
- Opciones de despliegue: pipeline `token-classification` de Transformers, Hugging Face Inference Endpoints (el repositorio está marcado como `endpoints_compatible`), exportación a ONNX con Optimum y ejecución con ONNX Runtime, TorchScript, NVIDIA Triton y servicios propios con FastAPI. No hay pesos GGUF publicados, por lo que llama.cpp y Ollama no son vías directas para esta tarea, y las herramientas orientadas a modelos generativos (vLLM, TGI) no son el camino habitual para `token-classification`.
- Latencia y throughput: no disponible. No se han publicado mediciones de latencia ni de throughput en la información proporcionada; para un encoder de 33 M de parámetros se espera un coste por frase bajo en CPU moderna y muy bajo en GPU con lotes, pero se trata de una expectativa general y no de un dato medido para este modelo.
- Almacenamiento: el repositorio ocupa 0,1 GB, por lo que el despliegue en imágenes de contenedor pequeñas es viable.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|---|
| retrokek/hse-dl2-bge-small-ner | 33,2 M | Token classification (NER) | 512 tokens (heredado del base) | MIT | Hugging Face | F1 0,8945 en el conjunto de evaluación del autor |
| BAAI/bge-small-en-v1.5 (modelo base) | ~33 M | Embeddings de texto / recuperación densa | 512 tokens | MIT | Hugging Face | No comparable: tarea distinta |
| dslim/bert-base-NER | ~110 M | Token classification (NER) en inglés, etiquetas PER/ORG/LOC/MISC | 512 tokens | MIT | Hugging Face | No disponible en la información proporcionada |
| Jean-Baptiste/roberta-large-ner-english | ~355 M | Token classification (NER) en inglés | 512 tokens | No disponible en la información proporcionada | Hugging Face | No disponible en la información proporcionada |

La comparación es limitada: no se dispone de resultados de benchmarks homogéneos para ninguno de los modelos alternativos en la información proporcionada, y el conjunto de evaluación de `hse-dl2-bge-small-ner` no está documentado. La ventaja objetiva del modelo frente a las alternativas de la tabla es el tamaño (33 M frente a 110 M y 355 M de parámetros), lo que reduce el coste de inferencia y de almacenamiento; su desventaja es la falta de documentación sobre etiquetas, dominio e idioma.

## Limitaciones y advertencias

- Dataset de entrenamiento desconocido: la model card indica explícitamente "an unknown dataset". No se puede saber qué dominio, género o variedad lingüística cubre el modelo.
- Conjunto de etiquetas no documentado: los tipos de entidad que reconoce no aparecen en la model card. Es imprescindible inspeccionar `config.json` (`id2label`) antes de integrarlo, ya que el número y el significado de las etiquetas determinan si sirve para un caso de uso concreto.
- Idiomas no especificados: el modelo base está orientado a inglés, por lo que el rendimiento en castellano u otros idiomas no está garantizado ni evaluado. No debe asumirse soporte multilingüe.
- Model card autocontenida y sin revisar: el propio README incluye el aviso de que se generó automáticamente y que debería revisarse; las secciones de descripción, usos previstos y datos de entrenamiento contienen "More information needed".
- Riesgo de falsos positivos y falsos negativos: con una precisión de 0,8773 y un recall de 0,9123 declarados, existe una tasa no despreciable de errores. En aplicaciones sensibles (anonimización, cumplimiento normativo) se requiere validación sobre datos propios y, probablemente, revisión humana.
- Riesgo de alucinación en sentido estricto: no aplica, porque el modelo no genera texto libre. El riesgo equivalente es la asignación de entidades inexistentes o mal tipadas sobre el texto de entrada.
- Sesgos: no se han documentado análisis de sesgo. Al desconocerse el corpus de entrenamiento, no se puede descartar sesgo de dominio, de género o geográfico en las entidades reconocidas.
- Limitación de contexto: la ventana de 512 tokens obliga a segmentar documentos largos, lo que puede romper entidades que cruzan el límite entre fragmentos.
- Licencia MIT: permite uso comercial, modificación y redistribución, siempre conservando el aviso de copyright y la licencia. No se identifican restricciones adicionales en la información disponible, pero conviene verificar la licencia del modelo base y de los datos de entrenamiento (desconocidos) antes de un despliegue comercial.
- Falta de validación comunitaria: el repositorio registra 0 descargas y 0 valoraciones, por lo que no hay evidencia externa de calidad más allá de las métricas declaradas por el autor.
- Entorno de ejecución antiguo o inusual: las versiones declaradas (PyTorch 2.11.0+cu128) pueden no coincidir con las instalaciones habituales; conviene probar la carga del modelo en el entorno de destino antes de integrarlo.
- Sin benchmarks estándar: no hay resultados en MMLU, GLUE, CoNLL-2003 ni otros conjuntos públicos, lo que impide comparar de forma rigurosa con alternativas consolidadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/retrokek/hse-dl2-bge-small-ner
- Modelo base: https://huggingface.co/BAAI/bge-small-en-v1.5
- Librería Transformers: https://github.com/huggingface/transformers
- Documentación del pipeline `token-classification`: https://huggingface.co/docs/transformers/tasks/token_classification
- Optimum (exportación a ONNX y cuantización): https://github.com/huggingface/optimum

Nota sobre la búsqueda web: los resultados devueltos por la búsqueda corresponden a dominios no relacionados con el modelo (sitios de contenido para adultos) y no aportan información técnica, papers, repositorios ni demos relevantes. No se han encontrado enlaces adicionales verificables sobre este modelo.
