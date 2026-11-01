# EIDORA/Wav2Vec2_Base_Speech

## Resumen

Wav2Vec2 Base — Speech Embeddings es un paquete de inferencia publicado por EIDORA que expone el codificador auto-supervisado `facebook/wav2vec2-base` de Meta AI como extractor de embeddings de audio en formato ONNX. El modelo original, presentado en el paper "wav2vec 2.0: A Framework for Self-Supervised Learning of Speech Representations" (Baevski et al., 2020), aprende representaciones del habla sin transcripciones mediante un objetivo de enmascaramiento contrastivo sobre el espectrograma. EIDORA no reentrena el modelo: envuelve el checkpoint original (revisión fijada `0b5b8e868dd84f03fd87d01f9c4ff0f080fecfe8`) en un grafo ONNX con preprocesado y posprocesado estandarizados.

El paquete produce un vector de 768 dimensiones, normalizado en L2, por cada fragmento de audio seleccionado, pensado para comparaciones por similitud coseno. La arquitectura subyacente es un transformer convolucional con 12 capas y aproximadamente 95 millones de parámetros, aunque la model card no desglosa el recuento exacto. El contexto de audio está limitado a fragmentos de hasta 2 segundos a 16 kHz (32.000 muestras), lo que restringe su uso a comparaciones de segmentos cortos.

Su relevancia práctica reside en la portabilidad: al declarar `CPUExecutionProvider` y un único `model.onnx` de unos 0,4 GB, permite ejecutar extracción de embeddings de voz en entornos sin GPU dentro del ecosistema EIDORA Desktop. No es un modelo generativo ni un sistema de reconocimiento de habla; su función es exclusivamente la extracción de características.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Wav2Vec2 Base (encoder convolucional + transformer auto-supervisado) |
| Parametros totales | no disponible (el modelo base wav2vec2-base ronda los 95 M, no confirmado en la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 32.000 muestras de audio a 16 kHz (2 segundos) |
| Tipos de cuantizacion | no disponible (el tag indica `base_model:quantized:facebook/wav2vec2-base`, pero no se detalla el esquema) |
| Idiomas soportados | no disponible (modelo acústico multilingüe por naturaleza, sin lista declarada) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`model.onnx`), con `config.yaml` como contrato de runtime |

## Arquitectura y entrenamiento

El modelo subyacente es wav2vec 2.0 Base: un extractor de características convolucional que procesa la forma de onda cruda a 16 kHz, seguido de un transformer de 12 capas que opera sobre representaciones latentes enmascaradas. El preentrenamiento es auto-supervisado: se enmascaran tramos del audio latente y el modelo debe identificar la representación cuantizada correcta entre distractores, combinando una pérdida contrastiva con una de diversidad de código. No se emplean transcripciones ni etiquetas en esta fase.

EIDORA añade una capa de adaptación propia: el audio se decodifica a mono a 16 kHz, se toma el fragmento inicial de hasta 32.000 muestras, se rellena si es más corto y se pasa un contador `valid_samples` (int64) para que el padding no contamine las estadísticas. El pooling temporal se realiza por media sobre las características del encoder y el vector resultante se normaliza en L2. El grafo ONNX recibe `waveform` float32 de forma `[1, 32000]` y devuelve un tensor float32 `[1, 768]`. El preprocesado de audio ocurre fuera del grafo y el modelo procesa una grabación por vez.

La model card no especifica el volumen de tokens de audio, la composición del corpus de preentrenamiento ni si hubo ajuste fino posterior con RLHF o DPO; indica explícitamente que el checkpoint enlazado no identifica una lista exhaustiva de corpus.

## Capacidades

- Extracción de embeddings de audio: genera un vector de 768 dimensiones, L2-normalizado, por fragmento de habla.
- Comparación por similitud coseno entre grabaciones o fragmentos.
- Agrupamiento (clustering) de extractos de voz según representaciones aprendidas.
- Exploración de similitud en colecciones de audio para investigación.
- Inferencia en CPU mediante ONNX Runtime con `CPUExecutionProvider`.
- Procesamiento de una grabación por invocación, con fragmento máximo de 2 segundos.
- No soporta tool calling, agentes, generación de texto, transcripción ni razonamiento multi-paso.
- No realiza identificación de hablante, reconocimiento de emociones ni clasificación musical.

## Casos de uso

- Búsqueda por similitud de voz en archivos de investigación: indexar fragmentos de 2 segundos y recuperar los más próximos por coseno, útil para explorar corpus de entrevistas o grabaciones de campo sin transcripción previa.
- Deduplicación de audio: detectar segmentos repetidos o casi idénticos en una colección comparando embeddings normalizados, con umbral ajustable sobre la similitud coseno.
- Clustering no supervisado de habla: agrupar extractos por proximidad en el espacio de embeddings para descubrir estructuras en datasets sin etiquetas, como base para análisis exploratorio.
- Control de calidad de datasets de voz: medir la coherencia interna de un corpus comparando la distribución de embeddings y detectar segmentos anómalos o ruidosos.
- Prototipado en entornos sin GPU: al ejecutarse con `CPUExecutionProvider`, permite validar pipelines de audio en portátiles o servidores ligeros antes de escalar a infraestructura mayor.
- Enriquecimiento de pipelines de datos: usar el embedding como característica de entrada para clasificadores posteriores (detección de actividad vocal, segmentación, filtrado) entrenados aguas abajo.
- Integración en EIDORA Desktop: incorporar extracción de embeddings de voz en flujos de trabajo de la plataforma sin gestionar dependencias de PyTorch ni pesos separados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica en la configuración declarada; el paquete usa `CPUExecutionProvider` y no requiere GPU.
- GPU recomendadas: no disponible; el paquete no declara proveedores CUDA, TensorRT ni ROCm.
- GPU de consumo: irrelevante para el proveedor declarado; el modelo base wav2vec2-base cabría holgadamente en cualquier GPU de consumo, pero EIDORA no documenta esa ruta.
- Tamaño en disco: aproximadamente 0,4 GB para el repositorio completo, incluido `model.onnx`.
- Opciones de despliegue: ONNX Runtime con `CPUExecutionProvider` dentro de EIDORA Desktop; `config.yaml` es la fuente autoritativa de entradas, preprocesado, proveedor y dimensiones.
- Latencia y throughput: no disponibles; el modelo procesa un audio por invocación y no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Salida | Licencia | Formato |
|---|---|---|---|---|---|
| EIDORA/Wav2Vec2_Base_Speech | no disponible (base ~95 M) | 2 s a 16 kHz (32.000 muestras) | Embedding 768-d L2 | Apache 2.0 | ONNX |
| facebook/wav2vec2-base | ~95 M (no confirmado en la card) | Variable según tokenizador | Estados ocultos por frame | Apache 2.0 | PyTorch / safetensors |
| facebook/wav2vec2-large | no disponible | Variable | Estados ocultos por frame | Apache 2.0 | PyTorch |
| HuBERT Base | no disponible | Variable | Estados ocultos por frame | no disponible | PyTorch |

La diferencia principal frente al checkpoint original es el contrato de E/S: EIDORA fija una ventana de 2 segundos, añade pooling por media y normalización L2, y entrega un único vector por audio en lugar de una secuencia de estados por frame. Esa simplificación facilita la indexación y la comparación, pero elimina la resolución temporal que ofrecen los checkpoints originales.

## Limitaciones y advertencias

- No es un sistema de reconocimiento de habla: no transcribe, no identifica hablantes, no detecta emociones ni clasifica música.
- Ventana máxima de 2 segundos a 16 kHz; grabaciones más largas se recortan al inicio, lo que puede descartar información relevante.
- Mínimo técnico de 400 muestras válidas en el encoder ONNX; no es una duración recomendada, sino un umbral de funcionamiento.
- El preprocesado ocurre fuera del grafo ONNX: cualquier desviación en la decodificación, el muestreo o el contador `valid_samples` altera los embeddings.
- El padding debe excluirse mediante `valid_samples`; de lo contrario, las estadísticas de pooling se contaminan.
- Solo se declara `CPUExecutionProvider`; la disponibilidad real depende de la versión instalada de ONNX Runtime y del entorno EIDORA Desktop.
- Sesgos: no documentados en la model card; el preentrenamiento auto-supervisado puede heredar sesgos acústicos del corpus original, que tampoco se detalla.
- Riesgo de alucinación: no aplica en sentido generativo, pero la similitud coseno puede producir falsos positivos en audios cortos o ruidosos.
- Licencia Apache 2.0 permite uso comercial, pero se exige conservar la atribución a Meta AI y a los autores de wav2vec 2.0; el paquete incluye `LICENSE`.
- El tag `base_model:quantized` sugiere algún tipo de cuantización, pero la card no especifica el esquema ni el impacto en precisión.
- Resultados deben validarse contra los datos y preguntas de investigación concretos antes de usarse en producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/EIDORA/Wav2Vec2_Base_Speech
- Modelo base: https://huggingface.co/facebook/wav2vec2-base
- Paper wav2vec 2.0: https://arxiv.org/abs/2006.11477
- Revisión fijada del checkpoint: `0b5b8e868dd84f03fd87d01f9c4ff0f080fecfe8`
