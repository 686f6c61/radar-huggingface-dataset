# ShayonSarker/BioClinical-ModernBERT-Embeddings-GGUF

## Resumen

BioClinical-ModernBERT-Embeddings-GGUF es la conversión a formato GGUF del modelo de embeddings NeuML/bioclinical-modernbert-base-embeddings, publicada por el usuario ShayonSarker. No se trata de un modelo generativo, sino de un encoder de frases (pipeline feature-extraction) especializado en texto biomédico y clínico, cuyo propósito es producir vectores de 768 dimensiones mediante mean pooling para tareas de recuperación semántica, similitud y clustering.

El modelo base procede del trabajo BioClinical ModernBERT (arXiv:2506.10896), un encoder de contexto largo obtenido mediante preentrenamiento continuado sobre más de 53.500 millones de tokens de corpus biomédico y clínico proveniente de 20 conjuntos de datos. La arquitectura ModernBERT subyacente consta de 22 capas, 768 dimensiones ocultas y atención local, con una ventana de contexto nativa de 8.192 tokens, muy superior a la de los encoders clínicos previos basados en BERT.

La relevancia de esta publicación concreta es de despliegue: al estar en GGUF, el modelo puede ejecutarse con llama.cpp en CPU o en GPU de gama baja, sin necesidad de una pila de PyTorch, manteniendo una alta fidelidad respecto al SentenceTransformer original. El repositorio es de publicación reciente y no registra descargas ni likes en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder transformer ModernBERT (22 capas, 768 dimensiones, atención local) |
| Parámetros totales | 149.014.272 (~149 M) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 8.192 tokens (ventana nativa) |
| Tipos de cuantización | F16, Q8_0, Q4_K_M |
| Idiomas soportados | No disponible (la model card no declara idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (F16, Q8_0, Q4_K_M); el modelo base está en safetensors |
| Dimensión del embedding | 768 |
| Pooling | Mean pooling, vectores normalizados L2 |
| Tamaño del repositorio | 0,6 GB |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de tipo ModernBERT, con 22 capas, anchura de 768 y atención local, y una ventana nativa de 8.192 tokens. A diferencia de los decodificadores generativos, no emplea atención causal ni produce texto: genera una representación vectorial por secuencia. El autor de la conversión indica que el grafo ModernBERT nativo se conserva y que la ruta de embedding reproduce el mean pooling del SentenceTransformer original, con comparaciones de similitud coseno normalizadas L2.

El entrenamiento corresponde al modelo base: preentrenamiento continuado sobre más de 53.500 millones de tokens de corpus biomédico y clínico agregado a partir de 20 conjuntos de datos, según el artículo BioClinical ModernBERT (arXiv:2506.10896). La información proporcionada no detalla la composición exacta del dataset, ni si hubo etapas de ajuste con RLHF o DPO (poco habituales en encoders de embeddings), ni el presupuesto de cómputo empleado.

La innovación técnica de esta publicación es la propia conversión: un script de construcción que fija una revisión concreta del modelo upstream y el commit `6b790a9c291b5d7af3312bbf9f0c558aa023b13e` de llama.cpp, lo que garantiza reproducibilidad del binario GGUF. No se introducen cambios arquitectónicos ni destilación; el objetivo es la paridad funcional con el modelo original.

## Capacidades

- Generación de embeddings de frases de 768 dimensiones con mean pooling y normalización L2.
- Recuperación semántica (retrieval) documento-documento y consulta-documento sobre texto biomédico y clínico.
- Procesamiento de entradas de hasta 8.192 tokens, lo que permite codificar artículos, informes clínicos o secciones completas sin truncado agresivo.
- Similitud semántica, deduplicación y clustering de documentos por distancia coseno.
- Extracción de características (feature extraction) para alimentar clasificadores, sistemas de ranking o índices vectoriales.
- Ejecución en llama.cpp y entornos compatibles con GGUF, incluida inferencia íntegra en CPU.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un encoder, no un modelo de chat.
- No dispone de modo "thinking", visión, audio ni generación de texto.
- No hay información publicada sobre capacidades multilingües.

## Casos de uso

- Búsqueda semántica en literatura biomédica: indexar resúmenes y artículos completos de PubMed en una base vectorial y recuperar por similitud semántica en lugar de por coincidencia de términos, aprovechando los 8.192 tokens de contexto para codificar documentos extensos sin trocear.
- RAG sobre documentación clínica: usar el modelo como recuperador en una arquitectura de generación aumentada, de modo que un LLM genere respuestas fundamentadas en guías clínicas o protocolos previamente vectorizados.
- Deduplicación de registros clínicos y bibliográficos: agrupar notas, informes o referencias casi idénticas mediante umbrales de similitud coseno, reduciendo el ruido en bases de datos hospitalarias o repositorios de revisiones sistemáticas.
- Fenotipado y emparejamiento de pacientes: representar historiales o resúmenes de episodios como vectores y buscar cohortes con perfiles similares para estudios observacionales o reclutamiento de ensayos.
- Filtrado de elegibilidad en ensayos clínicos: codificar los criterios de inclusión y exclusión como consultas y compararlos contra notas de pacientes para priorizar candidatos antes de la revisión humana.
- Clasificación y enrutado de documentos: congelar el encoder y entrenar un clasificador ligero sobre los embeddings para tareas como asignación de códigos, triaje de especialidad o detección de urgencia.
- Recomendación y alertas bibliográficas: calcular vecinos cercanos de los artículos que sigue un investigador para sugerir publicaciones relacionadas con su línea de trabajo.
- Despliegue en entornos con recursos limitados: servir el modelo en un servidor sin GPU o en el propio portátil del investigador usando la cuantización Q4_K_M, útil para prototipos y demos locales con datos sensibles que no deben salir de la organización.

## Benchmarks y rendimiento

El autor publica una validación limitada: veinte pares consulta/documento de PubMedQA, con vectores de 768 dimensiones y comparación por similitud coseno normalizada L2. No se trata de un benchmark estándar, sino de una comprobación de fidelidad de la conversión.

| Formato | Similitud coseno media respecto al modelo origen | Top-1 en recuperación |
|---|---:|---:|
| F16 | 0,999998 | 0,95 |
| Q8_0 | 0,999672 | 0,95 |
| Q4_K_M | 0,984172 | 0,95 |

No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, MTEB, BEIR) para esta conversión GGUF. El artículo del modelo base (arXiv:2506.10896) presenta comparaciones con encoders clínicos previos, pero no se dispone de las cifras concretas en el material proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,30 GB en F16, 0,16 GB en Q8_0 y 0,09 GB en Q4_K_M, más una sobrecarga reducida para activaciones y buffers; en la práctica, por debajo de 1 GB en todos los formatos.
- GPU recomendadas: cualquier GPU con más de 1 GB de memoria libre sirve, incluidas GTX 1650, RTX 3060, RTX 4090, A100 o H100. No hay requisitos de VRAM propios de modelos de gran tamaño.
- Cabe en GPU de consumo: sí, en todas las GPU consumer actuales e incluso en gráficas integradas con memoria compartida suficiente.
- Alternativa sin GPU: la cuantización Q4_K_M y Q8_0 están pensadas para ejecución en CPU con llama.cpp; el modelo de 149 M de parámetros es viable en portátiles convencionales.
- Opciones de despliegue: llama.cpp (modo embeddings), llama-cpp-python, Ollama, LM Studio y cualquier runtime compatible con GGUF. Para usar la versión original sin cuantizar, sentence-transformers con PyTorch, o servidores de embeddings como Text Embeddings Inference (TEI) cargando el modelo base safetensors.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia por lote en la información proporcionada; al tratarse de un encoder pequeño, se espera que el cuello de botella sea el ancho de banda de memoria y el tamaño del lote más que la capacidad de cómputo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Rendimiento |
|---|---|---|---|---|---|
| BioClinical-ModernBERT-Embeddings-GGUF | 149 M | 8.192 tokens | GGUF (F16, Q8_0, Q4_K_M) | Apache-2.0 | Validación propia sobre 20 pares de PubMedQA; sin benchmarks estándar |
| NeuML/bioclinical-modernbert-base-embeddings (origen) | 149 M | 8.192 tokens | safetensors | Apache-2.0 | No disponible en la información proporcionada |
| Otros encoders biomédicos de tamaño similar (familias PubMedBERT, BioBERT, BioLORD) | No disponible | No disponible | safetensors y variantes GGUF de terceros | No disponible | No disponible |

La única comparación directa que puede establecerse con los datos aportados es frente al modelo origen: la conversión GGUF mantiene la ruta de embedding con una similitud coseno de 0,999998 en F16 y degrada ligeramente en Q4_K_M (0,984172). No se dispone de datos que permitan situar este modelo frente a alternativas como PubMedBERT o BioLORD en tareas de recuperación estándar.

## Limitaciones y advertencias

- No es un modelo generativo: no responde preguntas, no redacta texto y no sigue instrucciones. Cualquier uso conversacional requiere combinarlo con un LLM aparte.
- Sesgos conocidos: no disponibles. No se documenta ninguna auditoría de sesgo sobre el corpus biomédico de 53.500 millones de tokens del modelo base.
- Riesgo de falsos positivos en recuperación: al ser un modelo de similitud, puede devolver documentos léxicamente próximos pero clínicamente irrelevantes; la validación publicada cubre solo 20 pares, insuficiente para estimar la tasa de error en producción.
- Limitación de contexto: aunque la ventana es de 8.192 tokens, entradas más largas (historiales completos, guías extensas) deben trocearse, lo que puede fragmentar información clínicamente relevante.
- Cobertura de idiomas no documentada: no hay evaluación en castellano ni en otras lenguas; el modelo base se entrenó con corpus biomédicos y clínicos y su comportamiento fuera de ese dominio lingüístico es incierto. Se recomienda validar con datos propios antes de desplegarlo en español.
- Degradación por cuantización: Q4_K_M reduce la similitud coseno respecto al origen a 0,984172. En aplicaciones sensibles a umbrales finos de similitud, conviene usar F16 o Q8_0.
- Licencia: Apache-2.0, que permite uso comercial y modificación, siempre que se conserve la atribución al modelo origen y el aviso de licencia. El autor de la conversión no reclama derechos adicionales.
- Advertencia de uso clínico: el modelo no está validado como producto sanitario ni como herramienta de decisión clínica. Cualquier aplicación sobre datos de pacientes exige revisión humana, cumplimiento normativo (RGPD, normativa de productos sanitarios) y evaluación local de sesgos.
- Estado del repositorio: publicado recientemente, con cero descargas y cero likes, y sin comunidad que lo respalde. No hay garantía de mantenimiento ni de actualizaciones tras cambios en llama.cpp.

## Enlaces

- Repositorio HuggingFace de la conversión GGUF: https://huggingface.co/ShayonSarker/BioClinical-ModernBERT-Embeddings-GGUF
- Modelo origen: https://huggingface.co/NeuML/bioclinical-modernbert-base-embeddings
- Repositorio de construcción: https://github.com/Dadhichi-Sarker-Shayon/BioClinical-ModernBERT-Embeddings-GGUF
- Artículo BioClinical ModernBERT (arXiv): https://arxiv.org/abs/2506.10896
- PDF del artículo: https://arxiv.org/pdf/2506.10896
