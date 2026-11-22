# rajagowthamr/tamil-conformer-transducer-74m

## Resumen

El modelo `tamil-conformer-transducer-74m` es un sistema de reconocimiento automático del habla (ASR) específico para tamil, desarrollado por el usuario rajagowthamr y publicado en Hugging Face. Se trata de un modelo compacto de 74,1 millones de parámetros que combina un codificador Conformer de 18 capas con un decodificador RNN-Transducer y una cabeza CTC auxiliar. Fue entrenado desde cero, sin inicialización a partir de pesos preentrenados, lo que lo distingue de aproximaciones que parten de modelos multilingües como Whisper o MMS.

El modelo resuelve la transcripción de audio mono a 16 kHz a texto tamil, un idioma aglutinante donde los errores de sufijos penalizan fuertemente las métricas a nivel de palabra. Por ello, el autor reporta tanto WER como CER, señalando que el CER (10,5 %) es una guía más fiable de la calidad real de la transcripción que el WER (31,6 %). Su tamaño reducido y su licencia CC BY 4.0 lo hacen atractivo para despliegues con recursos limitados y para fine-tuning sobre dominios específicos.

La relevancia actual del modelo radica en su especialización: frente a sistemas multilingües genéricos, ofrece una arquitectura optimizada para tamil con un tokenizador SentencePiece de 4096 tokens adaptado al idioma, entrenado sobre aproximadamente 970 horas de audio procedente de los corpus IndicVoices y Kathbath de AI4Bharat.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer encoder + RNN-Transducer (predictor LSTM + joiner) con cabeza CTC auxiliar |
| Parametros totales | 74,1 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio; entrada mono a 16 kHz, ventana log-mel de 25 ms, hop de 10 ms, submuestreo 8x) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | tamil (ta) |
| Licencia | CC BY 4.0 |
| Formato de pesos | PyTorch (`model.pt`) + tokenizador SentencePiece (`tokenizer.model`) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura Conformer-Transducer. La extracción de características emplea 80 dimensiones log-mel con ventana de 25 ms y hop de 10 ms, con SpecAugment como aumento de datos. El submuestreo se realiza mediante convoluciones separables en profundidad con factor 8x, lo que produce tramas de 80 ms. El codificador Conformer consta de 18 capas con `d_model` de 384, 6 cabezas de atención y kernel convolucional de 9. El decodificador RNN-Transducer usa un predictor LSTM de una capa con 512 unidades y un joiner de 640. Además, se añade una pérdida CTC auxiliar con peso 0,3, una técnica habitual para estabilizar y acelerar el entrenamiento de transductores. El tokenizador es SentencePiece unigram con 4096 tokens.

El entrenamiento se realizó desde cero sobre aproximadamente 970 horas de audio tamil: unas 800 horas de IndicVoices y 172 horas de Kathbath. Se llevaron a cabo 210 000 pasos con AdamW, schedule de warmup + coseno, precisión bf16 y EMA. Como aumentación se aplicó perturbación de velocidad (factores 0,9 / 1,0 / 1,1) y SpecAugment. Los pesos publicados son el promedio de los últimos 4 checkpoints.

## Capacidades

- Reconocimiento automático del habla en tamil a partir de audio mono a 16 kHz.
- Transcripción de audio a texto con salida en escritura tamil.
- Manejo de habla continua y conversacional gracias al decodificador transducer, que no requiere alineaciones previas.
- Uso de tokenizador SentencePiece específico para tamil, lo que mejora la segmentación de morfemas en un idioma aglutinante.
- Inferencia por lotes mediante la API `Transcriber.transcribe` del repositorio del autor.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step (es un modelo puramente ASR).
- No soporta visión, audio de entrada más allá de la transcripción ni capacidades multimodales.
- Capacidad multilingüe limitada: solo tamil; el habla con code-mixing inglés puede transcribirse deficientemente.

## Casos de uso

- Transcripción de reuniones y entrevistas en tamil: el modelo convierte grabaciones mono a 16 kHz en texto tamil, adecuado para actas y documentación interna en organizaciones que operan en Tamil Nadu o Sri Lanka.
- Subtitulado automático de vídeo y pódcast en tamil: integrable en pipelines de postproducción para generar subtítulos con revisión humana posterior, dado el CER del 10,5 %.
- Atención al cliente y centros de contacto: transcripción de llamadas grabadas para análisis de calidad, búsqueda de palabras clave y generación de resúmenes posteriores mediante un LLM.
- Investigación lingüística y corpus: generación de transcripciones a gran escala sobre audio tamil para estudios fonéticos, morfológicos o de variación dialectal, con la ventaja de un modelo ligero que puede ejecutarse en lote.
- Fine-tuning sobre dominios específicos: al ser un modelo de 74 M con licencia permisiva, puede reentrenarse con pocas horas de audio de un dominio concreto (médico, legal, agrícola) para reducir el WER en jerga especializada.
- Despliegue en dispositivos con recursos limitados: su tamaño reducido permite ejecución en CPU o GPUs de gama baja para aplicaciones de dictado o asistentes de voz offline en tamil.
- Accesibilidad: generación de transcripciones para personas con discapacidad auditiva en contenido audiovisual tamil.

## Benchmarks y rendimiento

| Conjunto de evaluación | WER | CER |
|---|---|---|
| IndicVoices Tamil (split de validación, ~8 h) | 31,6 % | 10,5 % |

No se han publicado resultados de benchmarks adicionales (p. ej. sobre otros conjuntos tamil o comparativas con otros modelos) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 74,1 M de parámetros en fp32 los pesos ocupan aproximadamente 0,3 GB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: cualquier GPU moderna es suficiente; para lotes grandes se recomiendan RTX 3090/4090, A100 o H100.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 2-4 GB de VRAM (GTX 1650, RTX 3050, RTX 4060, etc.).
- Opciones de despliegue: el autor proporciona un paquete Python (`asr.inference.Transcriber`) instalable desde su repositorio de GitHub; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI (son motores orientados a LLM, no a este tipo de modelo).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tamil-conformer-transducer-74m | 74,1 M | Audio 16 kHz mono | Tamil | CC BY 4.0 | Hugging Face (repo 0,3 GB) |
| Whisper (small/medium) | 244 M / 769 M | Audio 16 kHz | Multilingüe (incluye tamil) | MIT | OpenAI / Hugging Face |
| MMS (Meta) | ~1 B (por idioma) | Audio 16 kHz | Multilingüe (más de 1000 idiomas) | CC BY-NC 4.0 | Hugging Face |
| AI4Bharat IndicWav2Vec / IndicConformer | Cientos de millones | Audio 16 kHz | Lenguas indias | Licencias variables | Hugging Face |

No se dispone de resultados de benchmarks comparativos directos entre estos modelos y el presente en la información proporcionada; la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Solo tamil: no transcribe otros idiomas y el habla con code-mixing inglés puede producir errores notables.
- No emplea modelo de lenguaje externo, lo que limita la corrección contextual de transcripciones ambiguas.
- La precisión cae en audio ruidoso, grabaciones de campo lejano y acentos o dominios poco representados en el entrenamiento.
- WER del 31,6 % en validación: en tamil aglutinante un sufijo erróneo invalida la palabra completa, por lo que el CER (10,5 %) refleja mejor la calidad; aun así, se recomienda revisión humana en producción.
- Riesgo de alucinación y errores de segmentación en palabras poco frecuentes o nombres propios.
- Licencia CC BY 4.0: permite uso comercial con atribución; debe citarse al autor y respetarse la atribución de los datasets de origen (IndicVoices y Kathbath, también CC BY 4.0).
- No se redistribuyen audio ni transcripciones de los datasets; solo los pesos entrenados.
- No se documentan sesgos específicos más allá de los derivados de la distribución de los datos de entrenamiento (IndicVoices y Kathbath), que pueden no cubrir todos los dialectos del tamil.
- El modelo tiene 0 descargas y 1 like en el momento de la consulta, lo que sugiere escasa validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/rajagowthamr/tamil-conformer-transducer-74m
- Repositorio de código: https://github.com/gowthamr-tech/multilingual-speech-to-text
- Dataset IndicVoices: https://huggingface.co/datasets/ai4bharat/IndicVoices
- Dataset Kathbath: https://huggingface.co/datasets/ai4bharat/Kathbath
- Paper IndicVoices: https://arxiv.org/abs/2403.01926
- Paper IndicSUPERB (Kathbath): https://arxiv.org/abs/2208.11761
