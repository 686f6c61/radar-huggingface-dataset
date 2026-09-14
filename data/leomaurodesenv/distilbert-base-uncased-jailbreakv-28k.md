# leomaurodesenv/distilbert-base-uncased-jailbreakv-28k

## Resumen

`leomaurodesenv/distilbert-base-uncased-jailbreakv-28k` es un ajuste fino de DistilBERT base (uncased) para una tarea de clasificación de texto, publicado por el usuario leomaurodesenv en Hugging Face. El repositorio contiene 66.955.010 parámetros en formato safetensors, un tamaño que coincide con el de DistilBERT base (6 capas de encoder, ~66 M de parámetros), y la model card indica que el modelo se ha entrenado sobre "un conjunto de datos desconocido" mediante el `Trainer` de la librería `transformers`, sin más descripción de usos previstos ni de limitaciones.

El nombre del repositorio alude a JailbreakV-28K, un conjunto de referencia de ataques de tipo jailbreak contra modelos de lenguaje, pero la propia model card no confirma ni documenta ese extremo. La relevancia práctica de este tipo de modelos es la de actuar como guardarraíl ligero (clasificador de prompts maliciosos o intentos de evasión) desplegable en CPU y con latencia mínima, muy por debajo del coste de un LLM generativo. En este caso concreto, la utilidad está muy condicionada por la falta de validación externa: el repositorio acumula 0 descargas y 0 "likes" en el momento de redactar esta ficha, no declara idiomas soportados y no incluye resultados de benchmarks independientes.

Es un modelo de 67 M de parámetros, contexto de 512 tokens (heredado del modelo base), licencia Apache 2.0 y pesos en safetensors, reentrenado con 10 épocas, una tasa de aprendizaje de 2e-05 y un tamaño de lote efectivo de 16. La model card reporta una exactitud de 1.0 y una pérdida de validación de 0.0000 en todas las épocas, desde la primera, un resultado que debe interpretarse con extrema cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo DistilBERT (destilado de BERT-base), 6 capas, sin decoder |
| Parametros totales | 66.955.010 (verificado en el archivo safetensors) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 512 tokens (límite del modelo base `distilbert-base-uncased`); no documentado en la model card |
| Tipos de cuantizacion | No se publican pesos cuantizados ni variantes GGUF/AWQ/GPTQ. Al ser un modelo denso de 67 M admite FP16/BF16 y cuantización dinámica INT8 mediante PyTorch u ONNX Runtime |
| Idiomas soportados | no disponible en los metadatos del repositorio; el modelo base es `uncased` y está preentrenado principalmente en inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `transformers`) |
| Pipeline | text-classification |
| Modelo base | distilbert/distilbert-base-uncased |
| Tamano del repositorio | 2,7 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion / actualizacion | 13 de septiembre de 2026 (según metadatos de Hugging Face) |

## Arquitectura y entrenamiento

La arquitectura es la de DistilBERT: un encoder Transformer de 6 capas, 12 cabezas de atención y dimensión oculta de 768, obtenido mediante destilación de conocimiento a partir de BERT-base. Conserva el tokenizador WordPiece del modelo base con un vocabulario de 30.522 tokens y la limitación de 512 tokens de longitud máxima de secuencia. Sobre esa base se ha añadido una cabeza de clasificación de secuencia (equivalente a `DistilBertForSequenceClassification`) y se ha ajustado para la tarea de clasificación objetivo del dataset. El número y los nombres exactos de las etiquetas no están documentados en la información disponible.

Los hiperparámetros declarados en la model card son: `learning_rate` 2e-05, `train_batch_size` 8, `gradient_accumulation_steps` 2 (lote efectivo 16), `eval_batch_size` 8, optimizador `adamw_torch_fused` con betas (0.9, 0.999) y epsilon 1e-08, scheduler lineal con 50 pasos de calentamiento, semilla 42 y 10 épocas. El registro de entrenamiento muestra 1.121 pasos por época y 11.210 pasos en total, lo que implica aproximadamente 17.936 ejemplos por época con el lote efectivo de 16. El entorno declarado es Transformers 5.2.0, PyTorch 2.10.0+cu128, Datasets 4.5.0 y Tokenizers 0.22.2. No se documenta ninguna innovación técnica adicional (atención lineal, decodificación especulativa, mezcla de expertos ni técnicas de alineamiento como RLHF o DPO), algo coherente con un clasificador encoder-only.

## Capacidades

- Clasificación de texto a nivel de secuencia: etiquetado de un prompt o fragmento de texto en una de las clases definidas por el ajuste (presumiblemente "jailbreak" frente a "benigno", aunque las etiquetas no están documentadas).
- Procesamiento de entradas de hasta 512 tokens con el tokenizador WordPiece en minúsculas del modelo base.
- Inferencia muy rápida y con huella de memoria mínima (67 M de parámetros), apta para filtrado previo de alto volumen.
- No es un modelo generativo: no produce texto, no razona paso a paso, no escribe código ni resuelve problemas matemáticos.
- Sin soporte de tool calling, function calling ni uso como agente; no hay plantilla de chat ni tokens especiales de rol documentados.
- Sin capacidades multimodales: no procesa imágenes, audio ni vídeo.
- Rendimiento multilingüe no documentado; el modelo base uncased está orientado a inglés, por lo que se espera un rendimiento muy inferior en castellano u otros idiomas.
- No dispone de modo "thinking", salida estructurada documentada ni umbral de decisión recomendado por el autor.

## Casos de uso

- Guardarraíl de entrada en aplicaciones LLM: colocar el clasificador delante de un modelo generativo para etiquetar cada prompt entrante y bloquear o derivar los que se detecten como intento de jailbreak, con un coste computacional mínimo comparado con el del LLM principal.
- Prefiltrado en pasarelas de API (por ejemplo, proxies compatibles con la API de OpenAI): interceptar las peticiones antes de que lleguen al modelo de pago y aplicar políticas de seguridad sin añadir latencia perceptible.
- Moderación de contenido en plataformas de chat o foros: clasificar mensajes de usuario a escala y encolar los casos sospechosos para revisión humana, aprovechando que el modelo cabe en CPU.
- Triaje en ejercicios de red teaming: procesar lotes de miles de prompts adversariales generados automáticamente y separar los que superan el filtro de los que no, para concentrar el análisis manual en los casos relevantes.
- Enrutado en pipelines de agentes multi-paso: usar la salida del clasificador como señal para decidir si una consulta se responde con un modelo pequeño, se escala a un modelo mayor o se rechaza.
- Investigación académica sobre robustez frente a jailbreaks: emplear el modelo como línea base reproducible en experimentos de evaluación de defensas, siempre que se valide previamente sobre un conjunto de test independiente (ver la sección de limitaciones).
- Formación y demostraciones de seguridad en IA: ilustrar en talleres y cursos cómo se entrena y despliega un clasificador de prompts maliciosos de bajo coste. Solo es recomendable si antes se verifica que el modelo generaliza fuera de su distribución de entrenamiento.
- Etiquetado asistido de corpus: preanotar grandes volúmenes de texto para su posterior revisión, asumiendo un filtrado humano obligatorio de los falsos positivos y negativos.

## Benchmarks y rendimiento

El `model-index` del repositorio declara una lista de resultados vacía (`results: []`), por lo que no hay benchmarks publicados (MMLU, HumanEval, GSM8K u otros no aplican a un clasificador encoder-only). El único dato disponible es el registro de validación durante el entrenamiento, que se reproduce a continuación tal y como lo publica el autor:

| Epoca | Paso | Perdida de entrenamiento | Perdida de validacion | Exactitud |
|---|---|---|---|---|
| 1.0 | 1121 | 0.0001 | 0.0000 | 1.0 |
| 2.0 | 2242 | 0.0000 | 0.0000 | 1.0 |
| 3.0 | 3363 | 0.0000 | 0.0000 | 1.0 |
| 4.0 | 4484 | 0.0000 | 0.0000 | 1.0 |
| 5.0 | 5605 | 0.0000 | 0.0000 | 1.0 |
| 6.0 | 6726 | 0.0000 | 0.0000 | 1.0 |
| 7.0 | 7847 | 0.0000 | 0.0000 | 1.0 |
| 8.0 | 8968 | 0.0000 | 0.0000 | 1.0 |
| 9.0 | 10089 | 0.0000 | 0.0000 | 1.0 |
| 10.0 | 11210 | 0.0000 | 0.0000 | 1.0 |

Advertencia: una exactitud de 1.0 y una pérdida de 0.0000 ya en la primera época son valores atípicos. Suelen indicar fuga de etiquetas, solapamiento entre los conjuntos de entrenamiento y evaluación, un conjunto de validación trivialmente separable o un error en la configuración de la evaluación. No deben interpretarse como evidencia de rendimiento real. No se han publicado resultados de benchmarks independientes en la información disponible.

## Requisitos de hardware

- Huella de pesos: aproximadamente 268 MB en FP32 y 134 MB en FP16/BF16, calculada a partir de los 66.955.010 parámetros.
- VRAM estimada para inferencia: menos de 1 GB con lote pequeño en FP32; el repositorio ocupa 2,7 GB, probablemente por checkpoints intermedios u optimizador, pero eso no afecta a la VRAM necesaria en inferencia.
- Cabe en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, GTX 1650 (4 GB) e incluso en gráficas integradas. También es viable en CPU sin GPU dedicada.
- GPU de datacenter (A100, H100, L4, T4) no son necesarias para la inferencia; solo tendrían sentido para reentrenar o para procesar volúmenes masivos en lote.
- Opciones de despliegue: `pipeline` de `transformers`, Hugging Face Inference Endpoints (el repositorio lleva la etiqueta `endpoints_compatible`), Text Embeddings Inference (etiqueta `text-embeddings-inference`), ONNX Runtime para cuantización dinámica INT8, TorchScript, un servicio FastAPI propio o Triton Inference Server.
- No se publican pesos GGUF, por lo que no hay una ruta estándar de despliegue en `llama.cpp` u Ollama para esta tarea de clasificación.
- Latencia y throughput: no publicados por el autor. Como estimación orientativa a partir del tamaño del modelo, un encoder de 67 M procesa del orden de decenas de milisegundos por secuencia corta en CPU a lote 1, y permite throughput de miles de secuencias por segundo en GPU con lotes grandes. Estas cifras no han sido medidas ni verificadas para este repositorio concreto.

## Comparativa con modelos similares

No existen resultados de evaluación comparables para este modelo, ya que el autor no publica ningún benchmark. La comparación se limita, por tanto, a características estructurales verificables:

| Modelo | Parametros | Contexto | Licencia | Tarea | Datos de rendimiento |
|---|---|---|---|---|---|
| leomaurodesenv/distilbert-base-uncased-jailbreakv-28k | 66.955.010 | 512 tokens | Apache 2.0 | Clasificación de texto (ajuste fino) | Solo métricas de entrenamiento del autor (exactitud 1.0, no verificada) |
| distilbert/distilbert-base-uncased | ~66 M | 512 tokens | Apache 2.0 | Modelo base preentrenado (MLM), sin cabeza de clasificación | Benchmarks del paper de DistilBERT (no aplicables directamente aquí) |
| google-bert/bert-base-uncased | ~110 M | 512 tokens | Apache 2.0 | Modelo base preentrenado (MLM) | Benchmarks del paper de BERT (no aplicables directamente aquí) |

Existen alternativas específicas de detección de prompt injection y jailbreak (por ejemplo, clasificadores basados en DeBERTa o en modelos dedicados a seguridad de prompts), pero sus especificaciones y resultados no forman parte de la información proporcionada en esta ficha, por lo que no se incluyen cifras comparativas.

## Limitaciones y advertencias

- Métricas sospechosas: exactitud 1.0 y pérdida 0.0000 desde la primera época. Antes de cualquier uso en producción es imprescindible reproducir la evaluación sobre un conjunto de test independiente y comprobar que no hay fuga de etiquetas ni solapamiento con el entrenamiento.
- Model card autogenerada: los apartados de descripción, usos previstos, limitaciones y datos de entrenamiento aparecen literalmente como "More information needed". No hay documentación del dataset, de las etiquetas ni del umbral de decisión recomendado.
- Conjunto de datos desconocido: la model card declara explícitamente que el modelo se entrenó sobre un dataset no identificado. Aunque el nombre del repositorio alude a JailbreakV-28K, esto no está confirmado en la documentación.
- Sin validación de la comunidad: 0 descargas y 0 likes; no hay evidencia de uso, revisión por terceros ni reproducción independiente de los resultados.
- Cobertura lingüística no declarada: el modelo base es `uncased` y mayoritariamente anglófono, con pérdida de distinción entre mayúsculas y minúsculas, algo que puede degradar la detección en castellano y facilitar evasiones triviales mediante cambios de capitalización.
- Límite de 512 tokens: los prompts largos se truncan, de modo que un ataque puede quedar fuera de la ventana o dividirse en varios turnos para no ser detectado.
- Riesgo de falsos positivos y falsos negativos: un clasificador de este tipo no debe usarse como única capa de seguridad; es necesario combinarlo con otras defensas (filtros de salida, políticas de contenido, revisión humana).
- Susceptibilidad a evasión por ofuscación: homoglifos, unicode invisible, espacios insertados o codificaciones alternativas pueden degradar la clasificación, especialmente en un modelo uncased de vocabulario limitado.
- Sesgos: no hay ningún análisis de sesgo publicado. Al derivar de un modelo preentrenado en corpus web, puede heredar sesgos de género, raza o ideología.
- Licencia Apache 2.0: permite uso comercial y modificación con obligación de conservar avisos de licencia; no existe garantía del autor ni cláusula de responsabilidad sobre el rendimiento.
- Anomalía en los metadatos: las fechas de creación y actualización del repositorio (septiembre de 2026) son posteriores a las de la mayoría de modelos de su entorno, lo que sugiere metadatos poco fiables o generados de forma automática.
- El tamaño del repositorio (2,7 GB) es muy superior al de los pesos del modelo, lo que sugiere la presencia de checkpoints intermedios o estados del optimizador que conviene revisar antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/leomaurodesenv/distilbert-base-uncased-jailbreakv-28k
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- La búsqueda web realizada no devolvió ningún enlace relevante sobre este modelo: los resultados obtenidos correspondían a páginas de soporte de Microsoft (inicios de sesión, descargas de ISO de Windows y avisos de servicios de Exchange) sin relación alguna con el modelo. No se han encontrado papers, repositorios de código, demos ni publicaciones de blog asociados a este ajuste fino.
