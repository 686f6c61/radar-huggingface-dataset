# dianavdavidson/wav2vec2-large-xlsr-53-vaani-62079-normalized-alldata-1e-4-epochs-100-FT

## Resumen

Este modelo es un fine-tuning de `facebook/wav2vec2-large-xlsr-53`, un sistema de reconocimiento automático del habla (ASR) basado en la arquitectura wav2vec 2.0, publicado por el usuario `dianavdavidson`. El modelo original fue preentrenado de forma autosupervisada sobre audio en bruto de 53 idiomas, y esta versión se ha ajustado sobre un conjunto de datos no especificado durante 100 épocas, con una tasa de aprendizaje de 1e-4 y un tamaño de lote total de 32. El resultado final reportado es una pérdida de validación de 0.338 y una tasa de error de palabra (WER) global de 14,08 %.

Con aproximadamente 315 millones de parámetros, este modelo está pensado para tareas de transcripción de audio a texto. Aunque la model card no detalla el idioma ni la procedencia de los datos de entrenamiento, el nombre sugiere el uso del corpus Vaani, un recurso de voz multilingüe de la India, por lo que es probable que esté optimizado para idiomas indios. No obstante, esa información no está confirmada oficialmente.

La relevancia de este modelo radica en su naturaleza open source (licencia Apache 2.0) y en su compatibilidad con el ecosistema `transformers`, lo que permite integrarlo fácilmente en pipelines de ASR. Sin embargo, su utilidad práctica se ve limitada por la falta de transparencia sobre los datos de entrenamiento y por unos resultados de evaluación modestos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec2-large (transformer basado en convoluciones y atención) |
| Parametros totales | 315.480.745 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el audio se procesa en fragmentos de 16 kHz; la duración máxima depende de la implementación) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors, sin cuantizaciones alternativas) |
| Idiomas soportados | no disponibles (el modelo base soporta 53 idiomas, pero este fine-tuning no declara ninguno) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en wav2vec 2.0, una arquitectura que combina una red convolucional para extraer representaciones de audio en bruto (muestreado a 16 kHz) con un transformer que modela dependencias temporales. El preentrenamiento se realiza mediante un objetivo contrastivo que predice unidades latentes cuantizadas, lo que permite aprender representaciones del habla sin etiquetas. Sobre esa base, este modelo se ha fine-tuneado para ASR, añadiendo una cabeza de clasificación sobre los caracteres o subpalabras.

El entrenamiento, documentado en la model card, utilizó los siguientes hiperparámetros: learning rate de 0,0001, tamaño de lote de entrenamiento de 16 (32 con acumulación de gradientes), optimizador AdamW, scheduler de tasa de aprendizaje constante con 500 pasos de calentamiento, y 100 épocas completas. Se empleó precisión mixta (Native AMP) y el framework `transformers` en su versión 5.13.0. La pérdida de entrenamiento descendió de 7,61 en la primera época a 0,11 en la época 17, mientras que la pérdida de validación alcanzó su mínimo (0,2727) en la época 6 y luego aumentó ligeramente, lo que sugiere un posible sobreajuste a partir de ese punto. El WER de validación mejoró de 96,08 a 14,08, estabilizándose en torno a ese valor tras la época 14.

## Capacidades

- Reconocimiento automático del habla (speech-to-text) sobre audio de 16 kHz.
- Transcripción de voz a texto en el idioma o idiomas para los que fue entrenado (no declarados explícitamente).
- Inferencia mediante la pipeline `automatic-speech-recognition` de `transformers`.
- Compatible con la carga de pesos desde safetensors y con el uso en entornos que soporten el ecosistema Hugging Face.
- No se han documentado capacidades adicionales como tool calling, razonamiento multi-paso, visión o soporte de agentes.

## Casos de uso

- Transcripción de reuniones y entrevistas: el modelo puede convertir grabaciones de audio de 16 kHz en texto, útil para generar actas o búsquedas en contenido hablado. Su WER del 14 % implica que habrá errores que requerirán revisión manual.
- Subtitulado automático de vídeos: integrado en un pipeline de procesamiento de vídeo, permite generar subtítulos en el idioma soportado, aunque la calidad dependerá de la claridad del audio y del acento.
- Asistentes de voz en aplicaciones móviles: al ser ligero (315 M de parámetros), puede ejecutarse en GPUs de gama media o incluso en CPU para tareas de baja latencia, convirtiendo comandos de voz en texto.
- Análisis de llamadas de atención al cliente: transcribir conversaciones para extraer métricas de calidad o detectar problemas recurrentes, siempre que el idioma coincida con el entrenado.
- Accesibilidad para personas con discapacidad auditiva: transcripción en tiempo real de discursos o conferencias, aunque la precisión no es suficiente para uso médico o legal sin supervisión.
- Investigación académica en ASR: sirve como punto de partida para experimentos de fine-tuning o comparación de arquitecturas, dado que su licencia Apache 2.0 permite modificación y redistribución.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks externos (MMLU, HumanEval, etc.) porque se trata de un modelo de ASR. La model card incluye una tabla de entrenamiento con métricas declaradas por el autor:

| Metrica | Valor |
|---|---|
| Loss de evaluacion | 0.3380 |
| WER global | 14.0757 % |

Se observa una progresión del WER desde 96.08 % en la primera época hasta 14.08 % en la época 17, con una estabilización posterior. No se especifica el conjunto de evaluación utilizado, por lo que estos números son orientativos y no comparables con otros modelos sin ese contexto.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 315 M de parámetros. En FP32 (4 bytes por parámetro) ocupa ~1,26 GB; en FP16 ~630 MB. Con overhead de activaciones, se recomienda al menos 2 GB de VRAM para inferencia en GPU.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (p. ej., NVIDIA GTX 1650, RTX 3050) es suficiente para ejecutar el modelo en FP16. Para procesamiento por lotes o tiempos de inferencia menores, se recomienda una RTX 3090 o A100.
- En CPU: puede ejecutarse en procesadores modernos con 8 GB de RAM, aunque la latencia será mayor (varios segundos por minuto de audio).
- Opciones de despliegue: compatible con `transformers` y `pipeline("automatic-speech-recognition")`. También puede servirse con `vLLM`, `TGI` o `Ollama` si se convierte a formato GGUF, aunque no hay cuantizaciones publicadas.
- Latencia y throughput: no hay mediciones oficiales. Como referencia, un modelo de este tamaño procesa audio en tiempo real en una GPU media (RTX 3060) con una latencia de aproximadamente 0,5x la duración del audio.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | WER (aprox.) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| wav2vec2-large-xlsr-53 (base) | 315 M | 16 kHz, duración variable | no disponible (requiere fine-tuning) | Apache 2.0 | Hugging Face |
| wav2vec2-large-xlsr-53-vaani-62079 (este) | 315 M | 16 kHz | 14.08 % (eval. desconocida) | Apache 2.0 | Hugging Face |
| wav2vec2-large-xlsr-53-th (fine-tuning tailandés) | 315 M | 16 kHz | no disponible | Apache 2.0 | Hugging Face (vistec-AI) |

La comparativa se limita a modelos de la misma familia. No se dispone de datos de rendimiento del modelo base sin fine-tuning ni del fine-tuning tailandés, por lo que no se puede establecer una comparación cuantitativa fiable. Este modelo se distingue por su entrenamiento específico sobre el corpus Vaani (presumiblemente), pero carece de documentación detallada.

## Limitaciones y advertencias

- El conjunto de datos de entrenamiento no está especificado, por lo que se desconocen los idiomas exactos, los acentos y los dominios cubiertos. Esto puede provocar un rendimiento deficiente en habla no representada.
- El WER de 14.08 % indica que aproximadamente 1 de cada 7 palabras se transcribe incorrectamente, lo que lo hace inadecuado para aplicaciones que requieran alta precisión (p. ej., transcripción médica o legal) sin una revisión humana.
- La model card advierte que fue generada automáticamente y que los resultados de entrenamiento muestran una posible estabilización del WER a partir de la época 14, con un ligero aumento de la pérdida de validación, lo que sugiere sobreajuste.
- No se han publicado cuantizaciones (GGUF, ONNX, etc.), lo que limita su uso en entornos con restricciones de memoria o en plataformas como Ollama.
- Al ser un modelo fine-tuneado sobre un dataset no documentado, existe el riesgo de sesgos ocultos (género, dialecto, ruido de fondo) que no se pueden mitigar sin conocer los datos.
- La licencia Apache 2.0 permite uso comercial y modificación, pero el autor no proporciona garantías ni soporte técnico.
- El modelo solo acepta audio de 16 kHz; cualquier otra tasa de muestreo requiere remuestreo previo, lo que puede degradar la calidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dianavdavidson/wav2vec2-large-xlsr-53-vaani-62079-normalized-alldata-1e-4-epochs-100-FT
- Modelo base (facebook/wav2vec2-large-xlsr-53): https://huggingface.co/facebook/wav2vec2-large-xlsr-53
- Repositorio de fine-tuning tailandés (referencia): https://github.com/vistec-AI/wav2vec2-large-xlsr-53-th
- Información general sobre wav2vec2-large-xlsr-53: https://www.aimodels.fyi/models/huggingFace/wav2vec2-large-xlsr-53-facebook
