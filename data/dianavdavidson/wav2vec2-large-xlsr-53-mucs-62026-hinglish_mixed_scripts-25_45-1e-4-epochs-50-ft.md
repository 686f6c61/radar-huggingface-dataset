# dianavdavidson/wav2vec2-large-xlsr-53-mucs-62026-hinglish_mixed_scripts-25_45-1e-4-epochs-50-FT

## Resumen

Este modelo es un ajuste fino (fine-tuning) de `facebook/wav2vec2-large-xlsr-53`, el conocido modelo de reconocimiento automático de voz (ASR) multilingüe preentrenado por Facebook AI sobre 56.000 horas de audio en 53 idiomas. El ajuste se ha realizado sobre un conjunto de datos no documentado, aunque el nombre del repositorio sugiere que se trata de habla hinglish (mezcla de hindi e inglés) con escritura mixta (devanagari y latina). El autor, `dianavdavidson`, ha publicado varias variantes con distintos rangos de partición del dataset (0-25, 25-45, 45-100), lo que indica un experimento de entrenamiento por tramos.

Con 315 millones de parámetros, el modelo mantiene la arquitectura original de wav2vec2 large (encoder transformer con preprocesador CNN) y se distribuye en formato `safetensors` bajo licencia Apache 2.0. No se aportan datos sobre el dataset de entrenamiento ni sobre el vocabulario, pero la evaluación reporta un WER global de 25,12 en el conjunto de validación. Es relevante porque cubre un caso de uso específico: transcripción de habla bilingüe hindi-inglés, un escenario común en comunidades multilingües de la India, aunque su utilidad práctica se ve limitada por la falta de documentación y de benchmarks comparativos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec2 (encoder transformer con extractor CNN, base: `facebook/wav2vec2-large-xlsr-53`) |
| Parametros totales | 315.550.445 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio, procesa señales de hasta ~30 segundos por defecto en wav2vec2) |
| Tipos de cuantizacion | no disponible (solo `safetensors` en precisión completa) |
| Idiomas soportados | hinglish (hindi e inglés, posiblemente con escritura mixta) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `wav2vec2-large-xlsr-53`, que combina un extractor de características convolucional (CNN) que convierte la señal de audio en representaciones latentes, seguido de un transformer encoder de 24 capas con 1.024 dimensiones ocultas y 16 cabezas de atención. El preentrenamiento original se realizó mediante aprendizaje contrastivo en 56.000 horas de audio multilingüe no etiquetado (Multilingual LibriSpeech, CommonVoice y BABEL). Este ajuste fino añade una capa de clasificación lineal sobre las representaciones del transformer y se entrena con el objetivo de CTC (Connectionist Temporal Classification) para producir transcripciones.

Los hiperparámetros de entrenamiento reportados incluyen: tasa de aprendizaje 1e-4, batch de entrenamiento 16, batch efectivo 32 (acumulación de gradientes 2), optimizador AdamW, scheduler de tasa de aprendizaje constante con warmup de 500 pasos, 50 épocas y precisión mixta nativa (AMP). El dataset de entrenamiento no está documentado; el nombre del repositorio menciona "mucs-62026", lo que sugiere el uso del corpus MUCS (Multilingual and Code-Switching ASR) con 62.026 muestras, pero no se confirma en la model card. No se menciona el uso de técnicas como RLHF o DPO.

## Capacidades

- Reconocimiento automático de voz (ASR) para habla hinglish, incluyendo posibles mezclas de hindi e inglés en la misma frase.
- Transcripción de audio a texto con salida en formato de texto plano.
- Soporte de audio de entrada en formato de onda (waveform) procesado por el extractor CNN de wav2vec2.
- Capacidad de funcionar con el pipeline `automatic-speech-recognition` de Hugging Face Transformers.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni otras modalidades.
- El modelo está limitado a la tarea de ASR; no genera texto libre ni responde a instrucciones.

## Casos de uso

- Transcripción de llamadas de atención al cliente en contextos bilingües hindi-inglés: el modelo puede procesar grabaciones de audio y generar transcripciones que permitan a las empresas analizar conversaciones y extraer métricas de calidad.
- Subtitulado automático de vídeos en plataformas de streaming o redes sociales dirigidas a audiencias indias: dado su enfoque en hinglish, puede transcribir contenido donde se alternan idiomas.
- Asistentes de voz para aplicaciones móviles en la India: integración en pipelines de ASR para comandos de voz en entornos multilingües.
- Análisis de reuniones y entrevistas en entornos corporativos donde se habla una mezcla de hindi e inglés, generando actas textuales.
- Herramientas de accesibilidad para personas con discapacidad auditiva que necesiten subtítulos en tiempo real en contextos bilingües.
- Investigación académica en procesamiento de habla code-switching: el modelo sirve como punto de partida para experimentos de adaptación a dominios específicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks oficiales en la informacion disponible. La model card reporta únicamente el WER (Word Error Rate) global de validación de 25,12 y una pérdida de 0,9830 en la época 21, pero no se proporcionan comparaciones con otros modelos ni desglose por particiones del dataset. El array `results` del modelo está vacío, por lo que no hay métricas adicionales como MMLU, HumanEval u otras.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 315M parámetros en precisión fp32 (~1,26 GB). Con `transformers` y `torch`, una GPU con al menos 2 GB de VRAM puede ejecutar la inferencia; con cuantización a fp16, se reduce a ~0,7 GB.
- GPU recomendadas: cualquier GPU moderna con soporte CUDA, por ejemplo NVIDIA T4, V100, RTX 2080, RTX 3090, A100. También puede ejecutarse en CPU, aunque con mayor latencia.
- Cabe en GPUs de consumo como la RTX 3060 (12 GB) o RTX 4060 (8 GB) sin problemas.
- Opciones de despliegue: se puede usar directamente con `pipeline("automatic-speech-recognition", model="dianavdavidson/wav2vec2-large-xlsr-53-mucs-62026-hinglish_mixed_scripts-25_45-1e-4-epochs-50-FT")` en Hugging Face Transformers. También es compatible con `torchaudio` y puede servirse mediante frameworks como Triton o FastAPI. No se menciona soporte para vLLM u Ollama, que están orientados a modelos de lenguaje generativo.
- Latencia y throughput: no disponibles. Para un modelo de 315M, la inferencia en GPU típicamente procesa audio en tiempo real o más rápido, pero depende de la duración del clip y del hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia |
|---|---|---|---|---|
| `facebook/wav2vec2-large-xlsr-53` | 315M | Audio (ventana ~30s) | Multilingüe (53 idiomas) preentrenado, sin fine-tuning | Apache 2.0 |
| `dianavdavidson/wav2vec2-large-xlsr-53-mucs-62026-hinglish_mixed_scripts-25_45-1e-4-epochs-50-FT` (este modelo) | 315M | Audio (ventana ~30s) | Hinglish con escritura mixta (fine-tuning) | Apache 2.0 |
| `openai/whisper-large-v3` | 1.550M | Audio (30s) | Multilingüe, ASR robusto | MIT (con restricciones para whisper) |
| `jonatasgrosman/wav2vec2-large-xlsr-53-english` | 315M | Audio (ventana ~30s) | Inglés (fine-tuning) | Apache 2.0 |

La comparativa muestra que este modelo es un fine-tuning del XLSR-53 base, similar en tamaño a otros ajustes del mismo modelo. Whisper es más grande y ofrece mejor rendimiento general, pero no está especializado en hinglish. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- El dataset de entrenamiento no está documentado; el nombre sugiere MUCS, pero no se confirma, lo que dificulta evaluar posibles sesgos o cobertura de acentos.
- El WER de validación (25,12) es relativamente alto, lo que indica que la precisión puede ser insuficiente para aplicaciones que requieran transcripciones muy exactas.
- No se han publicado resultados de benchmarks comparativos, por lo que no es posible posicionar el modelo frente a alternativas consolidadas.
- La model card está generada automáticamente y carece de información sobre vocabulario, preprocesamiento de audio, tasa de muestreo, o manejo de ruido y acentos.
- No se especifican limitaciones de contexto ni de duración máxima de audio; wav2vec2 suele truncar clips largos.
- Licencia Apache 2.0 permite uso comercial, pero al no documentar el dataset original, podrían existir restricciones de derechos sobre los datos de entrenamiento.
- No se garantiza soporte para otros idiomas o variantes dialectales del hinglish.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dianavdavidson/wav2vec2-large-xlsr-53-mucs-62026-hinglish_mixed_scripts-25_45-1e-4-epochs-50-FT
- Variante con rango 0-25: https://huggingface.co/dianavdavidson/wav2vec2-large-xlsr-53-mucs-62026-hinglish_mixed_scripts-0_25-1e-4-epochs-50-FT
- Variante con rango 45-100: https://huggingface.co/dianavdavidson/wav2vec2-large-xlsr-53-mucs-62026-hinglish_mixed_scripts-45_100-1e-4-epochs-50-FT
- Documentación de torchaudio para WAV2VEC2_XLSR53: https://docs.pytorch.org/audio/stable/generated/torchaudio.pipelines.WAV2VEC2_XLSR53.html
- Artículo original de XLSR-53 (Unsupervised Cross-lingual Representation Learning for Speech): disponible en arXiv (referencia no incluida en los resultados de búsqueda, pero el modelo base es público).
