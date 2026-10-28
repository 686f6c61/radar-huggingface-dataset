# abdouaziiz/yoruba_small-1

## Resumen

yoruba_small-1 es un ajuste fino (fine-tune) del modelo NCAIR1/Yoruba-ASR para reconocimiento automático del habla (ASR) en yoruba, publicado por el usuario abdouaziiz en HuggingFace. Se trata de un modelo de la familia Whisper en su variante "small", con 241.734.912 parámetros totales según los pesos en safetensors, lo que lo sitúa en la gama ligera de modelos encoder-decoder de voz.

El modelo se ha entrenado sobre el dataset thisniyi/yoruba-tts-dataset-openslr y declara una tasa de error de palabra (WER) de 0,3639 sobre el conjunto de evaluación, con una pérdida de validación de 0,6245. Es, por tanto, un modelo de investigación en fase temprana: no tiene descargas ni likes, la model card es la generada automáticamente por el Trainer y contiene secciones sin completar ("More information needed").

Su relevancia práctica es limitada pero concreta: el yoruba es un idioma de bajos recursos con pocos sistemas ASR públicos, y este modelo se suma al ecosistema de Whisper ajustado para lenguas africanas, con un coste de inferencia muy bajo (menos de 1 GB en fp16) que permite desplegarlo en hardware de consumo. La licencia "other" y la falta de documentación sobre el proceso de entrenamiento son los principales frenos para adoptarlo en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Whisper "small": transformer encoder-decoder (modelo de secuencia a secuencia para ASR), ajustado desde NCAIR1/Yoruba-ASR |
| Parámetros totales | 241.734.912 |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Ventana de audio de 30 s por segmento (estándar de Whisper; no documentado explícitamente en la model card). Longitud máxima de secuencia de salida: no disponible |
| Tipos de cuantización | No disponible en la model card. Los pesos publicados están en safetensors sin cuantizar; al ser un modelo de 241 M de parámetros admite cuantización a fp16, int8 e int4 con herramientas externas (CTranslate2, bitsandbytes, GGUF) |
| Idiomas soportados | Yoruba (idioma del dataset de entrenamiento); la model card no declara idiomas oficialmente |
| Licencia | other (no se detallan los términos; verificar antes de uso comercial) |
| Formato de pesos | safetensors (compatible con transformers; repo de 4,8 GB) |

## Arquitectura y entrenamiento

La arquitectura corresponde a Whisper small, un transformer encoder-decoder que procesa espectrogramas Mel de 80 canales y genera texto de forma autorregresiva. El modelo parte de NCAIR1/Yoruba-ASR, un checkpoint ya especializado en yoruba, por lo que este ajuste supone un refinamiento adicional sobre el dominio del corpus thisniyi/yoruba-tts-dataset-openslr. No se especifican en la model card ni el número de tokens de audio procesados ni la composición detallada del dataset; el nombre del repositorio de datos sugiere audio sintético generado por TTS, lo que implica un posible desajuste de dominio respecto a voz humana real.

Los hiperparámetros declarados son: learning rate 3e-5, batch de entrenamiento y evaluación de 16, semilla 42, optimizador AdamW (betas 0,9/0,999, epsilon 1e-8), scheduler lineal con 50 pasos de warmup y precisión mixta nativa (AMP). La model card indica 48.000 pasos de entrenamiento, pero la tabla de resultados solo registra hasta el paso 10.000 (época 89,29), con una pérdida de entrenamiento que cae de 0,065 a 0,0041 mientras la de validación sube de 0,6245 a 0,7694: hay señales claras de sobreajuste a partir del paso 4.000. No se documenta RLHF, DPO ni ninguna innovación técnica adicional.

## Capacidades

- Transcripción de voz a texto en yoruba a partir de audio de hasta 30 segundos por fragmento.
- Reconocimiento de habla continuo mediante segmentación en ventanas (chunking) con las utilidades estándar del pipeline de transformers.
- Ajuste fino adicional sobre un checkpoint previamente adaptado al yoruba, lo que concentra la capacidad del modelo en ese idioma.
- Compatibilidad con el ecosistema transformers (`pipeline("automatic-speech-recognition")`), incluido `endpoints_compatible` según los tags del repositorio.
- Soporte de inferencia por lotes (batching) a través del pipeline y de generate.
- No dispone de tool calling, function calling, razonamiento multi-paso, visión, audio generation ni modo "thinking": es exclusivamente un modelo ASR.
- Capacidades multilingües: no declaradas; el modelo está orientado a un único idioma.
- No se documentan marcas de tiempo (timestamps), puntuación ni capitalización en la salida.

## Casos de uso

- Transcripción de entrevistas y material de campo en yoruba: el modelo puede procesar grabaciones segmentadas en bloques de 30 s y generar transcripciones automáticas para investigación lingüística o trabajo periodístico, con revisión humana posterior dado el WER del 36 %.
- Subtitulado de vídeo y pódcast en yoruba: integrado en un pipeline de ffmpeg + transformers, permite generar pistas de subtítulos preliminares que después se corrigen manualmente, reduciendo el coste frente a la transcripción desde cero.
- Generación de datos de entrenamiento para otros sistemas: las transcripciones del modelo pueden usarse como pseudo-etiquetas para ampliar corpus de ASR en yoruba, filtrando por confianza.
- Asistentes de voz para servicios públicos en regiones yorubaparlantes: al caber en menos de 1 GB en fp16, puede desplegarse en GPUs de consumo o incluso en CPU para prototipos de atención ciudadana por voz.
- Investigación en ASR de bajos recursos: sirve como línea base reproducible para comparar técnicas de adaptación sobre Whisper small en lenguas africanas, con un WER de referencia publicado.
- Evaluación comparativa de checkpoints y datasets: útil para medir el efecto de ajustar sobre corpus TTS frente a corpus de voz real, ya que el modelo se entrenó sobre un dataset de síntesis.
- Transcripción offline en dispositivos con recursos limitados: al ser un modelo de 241 M de parámetros, puede convertirse a CTranslate2 o GGUF y ejecutarse sin conexión en equipos modestos.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model-index y en la model card (no verificados de forma independiente):

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| Automatic Speech Recognition | thisniyi/yoruba-tts-dataset-openslr | WER | 0,3639 |
| Automatic Speech Recognition | thisniyi/yoruba-tts-dataset-openslr | Loss (validación) | 0,6245 |

Evolución durante el entrenamiento (según la model card):

| Paso | Época | Training loss | Validation loss | WER |
|---|---|---|---|---|
| 2000 | 17,86 | 0,065 | 0,6245 | 0,3639 |
| 4000 | 35,71 | 0,0101 | 0,6476 | 0,3219 |
| 6000 | 53,57 | 0,0069 | 0,7005 | 0,3397 |
| 8000 | 71,43 | 0,0057 | 0,7702 | 0,3333 |
| 10000 | 89,29 | 0,0041 | 0,7694 | 0,3550 |

El mejor WER registrado es 0,3219 en el paso 4.000; el valor publicado en la model-index (0,3639) corresponde al primer punto de evaluación, no al mejor. No hay comparaciones con otros modelos publicadas por el autor.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1 GB en fp32 (241 M × 4 bytes), unos 0,5 GB en fp16 y unos 0,25 GB en int8, más el espacio de activaciones y buffers de audio (típicamente 1-2 GB adicionales en función del batch).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 y H100 funcionan sin problema. El modelo está sobredimensionado para A100/H100 salvo en escenarios de alto throughput.
- Cabe holgadamente en GPU de consumo: sí, desde GTX 1650 o RTX 3050 en adelante. También es viable en CPU para inferencia no interactiva.
- Opciones de despliegue: `transformers` con `pipeline("automatic-speech-recognition")` (soporte nativo), conversión a CTranslate2 para usar faster-whisper, WhisperX para alineación y diarización, y servidores de inferencia genéricos como TorchServe o un endpoint de HuggingFace Inference Endpoints. vLLM y TGI no ofrecen soporte específico para Whisper, y llama.cpp/Ollama requerirían conversión a GGUF con soporte limitado para este tipo de arquitectura.
- Latencia y throughput: no disponibles; no se han publicado mediciones. En la práctica, con un modelo de 241 M de parámetros se espera una latencia del orden de décimas de segundo por ventana de 30 s en GPU moderna, pero es una estimación, no un dato del autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto de audio | Idiomas | Licencia | WER en yoruba | Disponibilidad |
|---|---|---|---|---|---|---|
| yoruba_small-1 | 241,7 M | 30 s | Yoruba (no declarados) | other | 0,3639 (dataset TTS del autor) | HuggingFace, 0 descargas |
| NCAIR1/Yoruba-ASR (modelo base) | no disponible | 30 s (arquitectura Whisper) | Yoruba | no disponible | no disponible | HuggingFace |
| openai/whisper-small | 244 M | 30 s | 99 idiomas | Apache 2.0 | no disponible (yoruba incluido en el entrenamiento multilingüe) | HuggingFace, ampliamente usado |
| openai/whisper-large-v3 | 1.550 M | 30 s | 99 idiomas | Apache 2.0 | no disponible | HuggingFace |

La comparación cuantitativa con alternativas no es posible con la información disponible: no hay resultados de referencia de otros modelos sobre el mismo dataset, y el WER publicado corresponde a un corpus derivado de TTS, por lo que no es directamente trasladable a voz humana real.

## Limitaciones y advertencias

- WER del 36 % sobre el conjunto de evaluación: es una tasa alta para uso comercial sin revisión humana; se espera un rendimiento aún peor en audio real si el entrenamiento se hizo con voz sintética.
- Sobreajuste evidente: la pérdida de validación sube de 0,6245 a 0,7694 entre los pasos 2.000 y 10.000 mientras la de entrenamiento cae hasta 0,0041. El checkpoint publicado puede corresponder a un punto sobreajustado.
- Inconsistencia en la documentación: se declaran 48.000 pasos de entrenamiento pero solo se registran métricas hasta el paso 10.000, y el WER de la model-index (0,3639) no coincide con el mejor valor observado (0,3219).
- Model card incompleta: las secciones de descripción, usos previstos, limitaciones y datos de entrenamiento están sin rellenar ("More information needed"), lo que impide auditar el proceso.
- Licencia "other" sin términos especificados: no se puede asumir uso comercial libre; es imprescindible contactar con el autor o revisar los términos del modelo base NCAIR1/Yoruba-ASR antes de desplegarlo.
- Idiomas no declarados formalmente: aunque el modelo está orientado al yoruba, no hay garantía documentada de comportamiento en code-switching (yoruba-inglés), habitual en el habla real.
- Sin marcas de tiempo ni puntuación documentadas: para subtitulado se necesitará un paso adicional de alineación (por ejemplo, WhisperX).
- Sesgos desconocidos: no se documenta la composición demográfica, dialectal ni de género del dataset, por lo que no se puede evaluar el sesgo por variedad dialectal del yoruba.
- Riesgo de alucinación en ASR: como todo modelo Whisper, puede generar texto plausible en segmentos con ruido, silencio o audio ininteligible; se recomienda filtrar por probabilidad media y longitud de salida.
- Sin datos de latencia, throughput ni pruebas de robustez frente a ruido de fondo.
- El modelo no ha sido validado de forma independiente (la métrica figura con `verified: false`).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/abdouaziiz/yoruba_small-1
- Modelo base: https://huggingface.co/NCAIR1/Yoruba-ASR
- Dataset de entrenamiento: https://huggingface.co/datasets/thisniyi/yoruba-tts-dataset-openslr
- Repositorio de Whisper (arquitectura de referencia): https://github.com/openai/whisper
- Paper de Whisper: https://arxiv.org/abs/2212.04356
- La búsqueda web realizada no devolvió enlaces relevantes sobre este modelo; los resultados obtenidos no guardan relación con el contenido de la ficha y se han descartado.
