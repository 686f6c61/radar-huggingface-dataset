# labhamlet/speech-jepa-base-asr-1h

## Resumen

Speech-JEPA Base ASR 1h es un modelo de reconocimiento automático del habla (ASR) desarrollado por el usuario labhamlet, consistente en un encoder Speech-JEPA Base preentrenado de forma auto-supervisada y ajustado finamente para CTC a nivel de carácter sobre una hora de audio etiquetado del split Libri-light 1h (286 enunciados). El modelo forma parte de una familia de checkpoints publicados con distintos volúmenes de datos etiquetados (10 min, 1 h, 10 h y LibriSpeech train-clean-100), lo que permite estudiar el rendimiento del preentrenamiento auto-supervisado en función de la cantidad de supervisión disponible.

La arquitectura sigue el paradigma JEPA (Joint Embedding Predictive Architecture) aplicado al habla, con un encoder convolucional de características más un Transformer, y una cabeza CTC para decodificación de caracteres. El modelo tiene 89,7 millones de parámetros, opera sobre audio muestreado a 16 kHz y produce un frame cada 20 ms, con un vocabulario de salida de 26 letras mayúsculas, apóstrofo, delimitador de palabra y blank CTC.

Es relevante por su enfoque de eficiencia en datos: demuestra hasta qué punto un encoder preentrenado sin etiquetas durante 375k actualizaciones sobre 960 h de LibriSpeech puede adaptarse a ASR con tan solo una hora de supervisión. El modelo es de código abierto bajo licencia BSD-3-Clause y requiere `trust_remote_code=True` por incluir código de modelado personalizado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Speech-JEPA (encoder convolucional + Transformer) con cabeza CTC |
| Parámetros totales | 89.674.525 (89,7 M) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (audio procesado por frames de 20 ms; sin límite explícito documentado) |
| Tipos de cuantización | No disponible (pesos en safetensors; compatible con cuantización estándar de transformers, no documentada por el autor) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors (`model.safetensors`) con código Python personalizado |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura Speech-JEPA, que combina un extractor de características convolucional con un Transformer, y añade una cabeza de clasificación CTC para ASR a nivel de carácter. El encoder fue preentrenado de forma auto-supervisada, sin etiquetas, sobre audio a 16 kHz de LibriSpeech (960 h) durante 375.000 actualizaciones, siguiendo el objetivo de predicción en espacio latente característico de JEPA. En la fase de ajuste fino, el extractor de características convolucional permaneció siempre congelado y el Transformer se congeló durante las primeras 10.000 de las 13.000 actualizaciones totales.

El ajuste fino se realizó sobre el split Libri-light 1h (286 enunciados) con el optimizador Adam (betas 0,9 y 0,98), tasa de aprendizaje pico de 0,0003 y un schedule tri-stage (10 % warm-up, 40 % constante, 50 % decay), en una sola GPU con precisión mixta bf16 y lotes de hasta 480 s de audio. Se aplicaron máscaras de tiempo (`mask_time_prob=0.065`, spans de 10 frames, mínimo 2 por enunciado) y de canal (`mask_feature_prob=0.004`, spans de 64 canales, mínimo 2 por enunciado), dropout de 0,1 antes de la cabeza CTC, dropout de atención/activación/oculto de 0,1 y LayerDrop de 0,05. La selección del checkpoint se basó en el menor WER greedy sobre dev-other.

## Capacidades

- Reconocimiento automático del habla en inglés mediante decodificación CTC a nivel de carácter.
- Salida con vocabulario restringido: 26 letras mayúsculas, apóstrofo, `|` como frontera de palabra y `<pad>` (índice 0) como blank CTC.
- Procesamiento de audio a 16 kHz con normalización por enunciado.
- Soporte de entrada por lotes con `padding=True`; la `attention_mask` permite ignorar muestras rellenadas, aunque el padding intenso altera ligeramente la salida por la normalización de grupo sobre el tiempo en la primera convolución.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio más allá de ASR.
- Capacidad multilingüe limitada al inglés.
- No dispone de modo thinking ni capacidades especiales adicionales.

## Casos de uso

- Transcripción de audio en inglés con recursos mínimos: el modelo, con solo 89,7 M de parámetros, puede transcribir locuciones en inglés en entornos con poca VRAM, útil para prototipos y validación de pipelines ASR.
- Investigación sobre eficiencia en datos: sirve como checkpoint de referencia para estudiar cómo varía el WER con 10 min, 1 h, 10 h y 100 h de datos etiquetados, comparando contra los otros checkpoints de la familia.
- Evaluación de preentrenamiento auto-supervisado: permite medir el impacto del objetivo JEPA frente a otros enfoques (wav2vec 2.0, HuBERT) en un régimen de baja supervisión.
- Transcripción de audiolibros y corpus de lectura: el ajuste sobre LibriSpeech/Libri-light lo hace adecuado para voz leída en inglés con condiciones acústicas limpias.
- Baseline en pipelines de ASR embebido: su tamaño reducido y su licencia permisiva (BSD-3-Clause) facilitan su integración en prototipos y productos internos.
- Generación de transcripciones para anotación asistida: puede preanotar audio en inglés y servir de punto de partida para corrección humana en flujos de etiquetado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que la selección del checkpoint se hizo por menor WER greedy en dev-other, pero no se proporcionan los valores numéricos de WER ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para los 89,7 M de parámetros (aproximadamente 0,36 GB de pesos); en bf16/fp16 alrededor de 0,18 GB, más memoria para activaciones y audio.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona en RTX 4090, A100, H100 y GPUs de gama media.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna (GTX 1060 6 GB, RTX 3060, RTX 4090, etc.) e incluso en CPU para volúmenes pequeños.
- Opciones de despliegue: transformers con `AutoModelForCTC` y `trust_remote_code=True`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (estos motores no están orientados a CTC de audio).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Speech-JEPA Base ASR 1h (este) | 89,7 M | No disponible | Inglés | BSD-3-Clause | Hugging Face |
| Speech-JEPA Base ASR 10min | No disponible | No disponible | Inglés | BSD-3-Clause | Hugging Face |
| Speech-JEPA Base ASR 10h | No disponible | No disponible | Inglés | BSD-3-Clause | Hugging Face |
| Speech-JEPA Base ASR 100h | No disponible | No disponible | Inglés | BSD-3-Clause | Hugging Face |

No se dispone de datos de rendimiento (WER) para establecer una comparación cuantitativa con alternativas como wav2vec 2.0 Base o HuBERT Base. La comparación disponible se limita a los checkpoints de la misma familia con distintos volúmenes de datos etiquetados.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al entrenarse sobre LibriSpeech/Libri-light, hereda los sesgos de dominio de ese corpus (voz leída, acento mayoritariamente estadounidense, condiciones limpias).
- Riesgo de alucinación: presente en la decodificación CTC, especialmente con audio ruidoso o fuera de dominio; el vocabulario restringido a mayúsculas y apóstrofo limita la salida pero no elimina errores.
- Limitaciones de contexto e idioma: solo inglés; sin límite de contexto documentado; el padding intenso altera ligeramente la salida por la normalización de grupo sobre el tiempo, por lo que se recomienda agrupar enunciados de longitud similar o transcribir uno a uno.
- Restricciones de licencia: BSD-3-Clause permite uso comercial con atribución y sin garantías; requiere mantener el aviso de copyright y la cláusula de exención de responsabilidad.
- Caveats para producción: requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; el modelo está pensado como checkpoint de investigación con solo 1 h de datos etiquetados, por lo que su WER será previsiblemente alto frente a modelos entrenados con cientos o miles de horas; no hay datos publicados de latencia ni throughput.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/labhamlet/speech-jepa-base-asr-1h
- Modelo base preentrenado: https://huggingface.co/labhamlet/speech-jepa-base
- Checkpoint 10 min: https://huggingface.co/labhamlet/speech-jepa-base-asr-10min
- Checkpoint 10 h: https://huggingface.co/labhamlet/speech-jepa-base-asr-10h
- Checkpoint 100 h: https://huggingface.co/labhamlet/speech-jepa-base-asr-100h
- Código y recetas: https://github.com/labhamlet/SpeechJEPA
- Dataset LibriSpeech: https://huggingface.co/datasets/openslr/librispeech_asr
