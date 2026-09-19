# cyttic/trocr-small-BY5-stage1-baseline

## Resumen

trocr-small-BY5-stage1-baseline es un ajuste fino (fine-tuning) del modelo cyttic/trocr-hebrew-small-untrained, publicado por el usuario cyttic en HuggingFace. Se trata de un modelo de reconocimiento optico de caracteres (OCR) basado en la arquitectura TrOCR, un transformer de tipo vision-encoder-decoder que combina un codificador de imagen con un decodificador de texto autorregresivo. El pipeline declarado es image-text-to-text y el repositorio contiene 235.097.600 parametros en formato safetensors, con un tamano de repositorio de 0,9 GB.

El modelo resuelve la tarea de transcripcion de texto en imagenes, presumiblemente en hebreo segun el nombre del modelo base, aunque la model card no declara idiomas soportados ni la composicion del dataset de entrenamiento ("unknown dataset"). Se entrenó durante una unica epoca con 15.500 pasos, learning rate de 5e-05 y un batch total de 16.

La relevancia de esta ficha es acotada: se trata de un checkpoint de etapa 1 (baseline) con resultados de evaluacion muy pobres (CER 0,7816 y WER 1,0848), lo que indica que el modelo no es utilizable en produccion en su estado actual. Su interes es documental, como punto de partida reproducible para experimentos posteriores de OCR en hebreo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-encoder-decoder (familia TrOCR): codificador de imagen tipo ViT + decodificador de texto autorregresivo |
| Parametros totales | 235.097.600 (235,1 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no declarada en la model card ni en los metadatos) |
| Tipos de cuantizacion | No disponible (solo se publican pesos en safetensors; no hay versiones cuantizadas declaradas) |
| Idiomas soportados | No disponible (el nombre del modelo base, trocr-hebrew-small-untrained, sugiere hebreo, pero no se confirma en la documentacion) |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Pipeline | image-text-to-text |
| Modelo base | cyttic/trocr-hebrew-small-untrained |
| Libreria | transformers |
| Tamano del repositorio | 0,9 GB |
| Fecha de creacion | 2026-09-19 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura corresponde al diseno TrOCR: un codificador visual tipo Vision Transformer que procesa la imagen de entrada y un decodificador transformer que genera la secuencia de texto de forma autorregresiva, siguiendo el esquema vision-encoder-decoder habitual en tareas de image-to-text. El modelo parte de un checkpoint base sin entrenar (trocr-hebrew-small-untrained) y se ajusta de forma supervisada sobre un dataset que la model card describe como "unknown dataset", sin aportar detalles sobre numero de tokens, composicion, procedencia ni si hubo etapas de RLHF o DPO (no aplicables, en principio, a una tarea de OCR).

Los hiperparametros declarados son: learning rate de 5e-05, train_batch_size de 8, eval_batch_size de 8, gradient_accumulation_steps de 2 (batch total efectivo de 16), optimizador AdamW fused con betas (0,9; 0,999) y epsilon 1e-08, scheduler lineal con 1.550 pasos de warmup, semilla 42, entrenamiento en precision mixta nativa (AMP) y 1,0 epocas completas sobre 15.500 pasos. El framework empleado fue Transformers 5.15.0, PyTorch 2.10.0+cu128, Datasets 5.0.1 y Tokenizers 0.22.2.

No se documenta ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, destilacion ni tecnicas de aumento de datos). El entrenamiento muestra una convergencia lenta: la perdida de entrenamiento baja de 12,7785 a 11,3930 y la de validacion de 6,2740 a 5,7240, valores que siguen siendo muy elevados para una tarea de transcripcion.

## Capacidades

- Transcripcion de texto en imagenes (OCR) mediante generacion autorregresiva a partir de una imagen de entrada.
- Salida en formato image-text-to-text, compatible con el pipeline homonimo de transformers.
- Entrenamiento sobre texto presumiblemente hebreo (no confirmado por el autor), lo que lo orienta a escritura hebrea si se confirma esa procedencia.
- No se declara soporte de tool calling ni de function calling.
- No se declara soporte de agentes ni de razonamiento multi-paso.
- No se declaran capacidades multimodales adicionales (audio, video), vision de documentos complejos ni comprension de layout.
- No dispone de modo de razonamiento explicito (thinking mode) ni de modos alternativos de decodificacion documentados.
- El modelo no demuestra capacidad funcional de transcripcion en su estado actual: sus metricas de evaluacion (CER 0,7816; WER 1,0848) estan lejos de un umbral utilizable.

## Casos de uso

- Reproduccion de experimentos de OCR en hebreo: sirve como punto de partida (baseline de etapa 1) para comparar futuras iteraciones de entrenamiento con una referencia fija y trazable. Su publicacion con hiperparametros completos permite replicar el ajuste.
- Investigacion sobre curriculum de entrenamiento en TrOCR: al tratarse de una etapa 1 sobre un checkpoint sin entrenar, es util para estudiar como evoluciona la perdida y el CER/WER a lo largo de las epocas documentadas.
- Docencia y formacion: ejemplo practico y realista de como se ve una model card autogenerada por el Trainer de HuggingFace, incluyendo sus carencias documentales (licencia, idiomas y dataset sin especificar).
- Desarrollo de pipelines de OCR en hebreo (fase de pruebas): el modelo puede integrarse en un prototipo de preprocesado para validar el flujo de entrada de imagenes y salida de texto, sin esperar resultados de calidad todavia.
- Evaluacion comparativa de codificadores visuales: al compartir arquitectura con la familia TrOCR, permite medir el impacto de distintos checkpoints base sobre el mismo conjunto de validacion.
- Auditoria de metricas de OCR: util como caso de estudio de un modelo con WER superior a 1,0, escenario que conviene detectar en produccion porque indica que el sistema es peor que no devolver nada.
- Fine-tuning posterior sobre datos propios: al ser un checkpoint pequeno (235 M de parametros), puede reentrenarse en una unica GPU de gama consumer con datasets privados de hebreo antes de plantear cualquier uso real.

## Benchmarks y rendimiento

El model-index del autor no contiene resultados declarados (lista vacia). Los unicos datos disponibles son las metricas de evaluacion del propio entrenamiento registradas por el Trainer de HuggingFace:

| Checkpoint (paso) | Epoca | Perdida de entrenamiento | Perdida de validacion | CER | WER |
|---|---|---|---|---|---|
| 2.000 | 0,1290 | 12,7785 | 6,2740 | 0,7750 | 1,1823 |
| 4.000 | 0,2581 | 12,1347 | 6,1141 | 0,7849 | 1,1421 |
| 6.000 | 0,3871 | 12,2611 | 6,0007 | 0,8034 | 1,1563 |
| 8.000 | 0,5161 | 11,9023 | 5,9062 | 0,7770 | 1,0434 |
| 10.000 | 0,6452 | 11,6387 | 5,8434 | 0,8026 | 1,1524 |
| 12.000 | 0,7742 | 11,8064 | 5,7908 | 0,8029 | 1,0882 |
| 14.000 | 0,9032 | 11,7363 | 5,7419 | 0,7946 | 1,1162 |
| 15.500 | 1,0000 | 11,3930 | 5,7240 | 0,7816 | 1,0848 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ni comparaciones con otros sistemas de OCR.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 0,9-1,0 GB en fp32, aproximadamente 0,5 GB en fp16/bf16 y alrededor de 0,25 GB en int8 (calculado sobre los 235,1 M de parametros; no hay cifras oficiales publicadas).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; no requiere A100, H100 ni tarjetas de datacenter.
- Cabe holgadamente en GPU de consumo: GTX 1650, RTX 3050, RTX 3060, RTX 4060, RTX 4090 y similares. Tambien es viable en CPU para inferencia puntual.
- Opciones de despliegue: transformers con VisionEncoderDecoderModel / AutoModelForVision2Seq sobre PyTorch; exportacion a ONNX Runtime para inferencia en CPU; despliegue en endpoints de HuggingFace (el repositorio esta marcado como endpoints_compatible).
- No se recomienda llama.cpp ni Ollama (GGUF), ya que no cubren de forma estandar arquitecturas encoder-decoder visuales como TrOCR. Tampoco hay soporte documentado en vLLM ni en TGI.
- Latencia y throughput estimados: no disponible (no se han publicado mediciones).

## Comparativa con modelos similares

Los datos de los modelos externos son aproximados y proceden de informacion publica de sus respectivos autores; se indican como referencia orientativa.

| Modelo | Parametros (aprox.) | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cyttic/trocr-small-BY5-stage1-baseline | 235,1 M | No disponible | CER 0,7816; WER 1,0848 | No disponible | HuggingFace (0 descargas) |
| microsoft/trocr-small-printed (TrOCR small) | ~62 M | No disponible | Buen rendimiento en texto impreso en latin (cifras no verificadas aqui) | MIT | HuggingFace |
| microsoft/trocr-base-handwritten (TrOCR base) | ~334 M | No disponible | Buen rendimiento en escritura manuscrita en latin (cifras no verificadas aqui) | MIT | HuggingFace |
| Donut (naver-clova-ix/donut-base) | ~200 M | No disponible | Comprension de documentos (no solo OCR de linea) | MIT | HuggingFace |

La diferencia clave no es de tamano sino de estado de entrenamiento: este checkpoint es un baseline de etapa 1 sobre un modelo base sin entrenar, mientras que las alternativas de Microsoft y Naver son modelos ya convergidos y con licencia explicita.

## Limitaciones y advertencias

- Calidad insuficiente para uso real: un CER de 0,7816 implica que aproximadamente el 78 % de los caracteres son incorrectos, y un WER de 1,0848 (superior a 1,0) indica que la salida es, en terminos de metrica, peor que devolver una cadena vacia.
- La model card indica explicitamente que el dataset de entrenamiento es desconocido y que la descripcion del modelo y los usos previstos estan pendientes de completar.
- Licencia no disponible: sin una licencia declarada no hay autorizacion explicita para uso comercial, lo que desaconseja su integracion en productos.
- Idiomas no declarados en los metadatos: aunque el nombre del modelo base apunta a hebreo, no hay confirmacion oficial, por lo que no debe asumirse cobertura multilingue.
- Longitud de contexto no documentada: los modelos TrOCR estan pensados para transcribir lineas o fragmentos cortos de texto, no documentos completos con layout complejo.
- Riesgo alto de alucinacion y de texto repetido o incoherente, especialmente con entradas fuera de la distribucion de entrenamiento.
- Sesgos desconocidos: al no documentarse la procedencia de los datos, no es posible evaluar sesgos de tipografia, estilo de escritura, calidad de escaneo o variacion dialectal del hebreo.
- Se desconoce si se aplicaron tecnicas de filtrado de datos, anonimizacion o deduplicacion sobre el corpus de entrenamiento.
- Sin datos de latencia, throughput ni consumo energetico, no es posible dimensionar un despliegue en produccion.
- Recomendacion: tratarlo exclusivamente como referencia de investigacion o punto de partida para reentrenamiento, nunca como componente directo de un sistema en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cyttic/trocr-small-BY5-stage1-baseline
- Modelo base: https://huggingface.co/cyttic/trocr-hebrew-small-untrained
- No se han encontrado papers, blogs, repositorios ni demos adicionales en los resultados de busqueda disponibles.
