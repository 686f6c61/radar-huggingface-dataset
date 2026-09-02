# dianavdavidson/indicwav2vec-hindi-mucs-62256-hinglish_mixed_scripts-45_100-1e-4-epochs-100-FT

## Resumen

El modelo `indicwav2vec-hindi-mucs-62256-hinglish_mixed_scripts-45_100-1e-4-epochs-100-FT` es un ajuste fino (fine-tuning) del modelo base `ai4bharat/indicwav2vec-hindi`, desarrollado por el usuario de HuggingFace `dianavdavidson`. Se trata de un sistema de reconocimiento automático del habla (ASR) especializado en la transcripción de audio en hinglish, es decir, la mezcla de hindi e inglés con escrituras mixtas (devanagari y latina). El nombre del modelo sugiere que fue entrenado sobre el dataset MUCS (Multilingual Code-Switching) con 62.256 muestras, aunque la model card no confirma explícitamente el origen de los datos.

El modelo hereda la arquitectura wav2vec2 de su base, con aproximadamente 315,5 millones de parámetros, y está orientado a tareas de transcripción de voz en contextos de code-switching, un fenómeno frecuente en la India. Su relevancia radica en que aborda un caso de uso real y poco cubierto por los ASR monolingües: la alternancia de idiomas dentro de una misma frase. Aunque no se publican benchmarks comparativos, el autor reporta un WER global de 21,57 en su conjunto de evaluación, lo que indica un rendimiento moderado que puede ser útil en aplicaciones específicas de dominio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec2 (transformer encoder con convoluciones) |
| Parametros totales | 315.550.445 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (wav2vec2 procesa audio por ventanas de 25 ms con stride de 20 ms) |
| Tipos de cuantizacion | no disponible (solo safetensors en fp32) |
| Idiomas soportados | hindi, hinglish (mezcla hindi-ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura wav2vec2, un encoder transformer preentrenado de forma auto-supervisada sobre audio crudo. El modelo base `ai4bharat/indicwav2vec-hindi` fue preentrenado por el proyecto AI4Bharat sobre 40 lenguas indias, y posteriormente ajustado para ASR en hindi. Este fine-tuning específico se realizó sobre un dataset no documentado en la model card, aunque el nombre sugiere que proviene del corpus MUCS con 62.256 muestras de habla hinglish en escrituras mixtas.

El entrenamiento se llevó a cabo durante 100 épocas con una tasa de aprendizaje de 1e-4, batch total de 32 (con acumulación de gradientes de 2), optimizador AdamW, scheduler constante con warmup de 500 pasos y precisión mixta nativa (AMP). La pérdida final de validación fue de 0,8878 y el WER global de 21,57. No se especifica si se aplicaron técnicas de aumento de datos o regularización adicionales.

## Capacidades

- Reconocimiento automático del habla (ASR) para hindi y hinglish con escrituras mixtas (devanagari y latina).
- Transcripción de audio en contextos de code-switching, donde el hablante alterna entre hindi e inglés dentro de una misma frase.
- Procesamiento de señales de audio de entrada, sin soporte de texto como entrada (modelo puramente acústico).
- No dispone de capacidades de tool calling, agentes o razonamiento multi-paso, al ser un modelo de audio especializado.
- Multilingüismo limitado: solo cubre hindi e inglés (en su variante hinglish), no otros idiomas indios.

## Casos de uso

- Transcripción de llamadas de atención al cliente en empresas indias: el modelo puede transcribir conversaciones donde los clientes mezclan hindi e inglés, permitiendo análisis posteriores de sentimiento o cumplimiento normativo.
- Subtitulado automático de vídeos en plataformas de streaming o redes sociales: adecuado para contenido generado por usuarios en hinglish, común en YouTube o Instagram.
- Asistentes de voz para aplicaciones móviles en India: permite comandos de voz en el idioma coloquial real, sin forzar al usuario a hablar solo hindi o solo inglés.
- Análisis de entrevistas o focus groups en investigación de mercado: facilita la transcripción de grabaciones donde los participantes alternan idiomas.
- Herramientas de accesibilidad para personas con discapacidad auditiva: generación de subtítulos en tiempo real para reuniones o conferencias en entornos bilingües.
- Creación de corpus de entrenamiento para otros modelos de NLP: el modelo puede servir para etiquetar automáticamente audio en hinglish, generando datos de texto para entrenar modelos de lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El model-index de HuggingFace no incluye ninguna métrica comparativa. El único dato de rendimiento es el reportado en la model card durante el entrenamiento:

| Metrica | Valor |
|---|---|
| Loss de validacion | 0,8878 |
| WER global | 21,57 % |

Este WER se obtuvo sobre un conjunto de evaluación no especificado, por lo que no es comparable con otros modelos sin conocer el corpus exacto.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 315,5 M de parámetros en fp32 (~1,26 GB). En fp16 se reduce a ~0,63 GB, pero las activaciones y el procesamiento de audio requieren memoria adicional. Se estima un consumo de 2-4 GB de VRAM para inferencia en GPU.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como NVIDIA GTX 1650, RTX 2060, RTX 3060, o superiores. En CPU es posible la inferencia pero con latencias altas (varios segundos por segundo de audio).
- Cabe en GPUs de consumo: sí, en tarjetas como RTX 3060 o superiores.
- Opciones de despliegue: al ser un modelo de transformers, se puede servir con HuggingFace Inference Endpoints, o mediante librerías como `transformers` con pipeline de ASR. También es compatible con `torchaudio` para preprocesado. No se han reportado integraciones con vLLM, llama.cpp u Ollama, ya que estos están orientados a modelos de lenguaje, no a ASR.
- Latencia y throughput: no disponible. Depende del hardware y de la longitud del audio de entrada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER (evaluacion) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `dianavdavidson/indicwav2vec-hindi-mucs-62256-hinglish_mixed_scripts-45_100-1e-4-epochs-100-FT` | 315,5 M | no disponible | 21,57 % | Apache 2.0 | HuggingFace |
| `ai4bharat/indicwav2vec-hindi` (base) | 315,5 M | no disponible | no disponible | Apache 2.0 | HuggingFace |
| `openai/whisper-small` | 244 M | 30 s de audio | ~10-15 % en hindi (depende del corpus) | MIT | HuggingFace |

El modelo base `indicwav2vec-hindi` es el punto de partida de este fine-tuning; no se dispone de su WER en el mismo corpus. Whisper-small es un modelo ASR multilingüe generalista que suele obtener mejores resultados en hindi estándar, pero no está optimizado para code-switching hinglish. Este modelo fine-tuneado podría superar a Whisper en contextos específicos de mezcla de idiomas, aunque no hay datos comparativos publicados.

## Limitaciones y advertencias

- El dataset de entrenamiento no está documentado en la model card; el nombre sugiere MUCS, pero no se confirma. Esto dificulta la reproducibilidad y la evaluación de sesgos.
- El WER de 21,57 % es relativamente alto en comparación con modelos ASR modernos (Whisper suele estar por debajo del 15 % en hindi), lo que indica que el modelo puede cometer errores en habla no nítida o con acentos variados.
- Solo cubre hinglish; no es útil para otros idiomas indios ni para inglés puro.
- Al ser un modelo de audio, no tiene capacidades de generación de texto ni de razonamiento; su salida es una transcripción textual.
- La licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar que los datos de entrenamiento (si se usan MUCS) no tengan restricciones adicionales.
- No se han realizado evaluaciones de sesgo o robustez frente a ruido, acentos o variaciones dialectales del hindi.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dianavdavidson/indicwav2vec-hindi-mucs-62256-hinglish_mixed_scripts-45_100-1e-4-epochs-100-FT
- Modelo base: https://huggingface.co/ai4bharat/indicwav2vec-hindi
- Repositorio GitHub de IndicWav2Vec: https://github.com/AI4Bharat/IndicWav2Vec
- Portal de modelos AI4Bharat: https://models.ai4bharat.org/
