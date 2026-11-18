# labhamlet/speech-jepa-base-asr-10min

## Resumen

Speech-JEPA Base ASR 10min es un modelo de reconocimiento automático del habla (ASR) desarrollado por labhamlet, derivado del modelo auto-supervisado Speech-JEPA Base. Se trata de un checkpoint ajustado mediante CTC a nivel de carácter sobre el split de 10 minutos de Libri-light (`1h/0`, 48 enunciados), partiendo de un encoder preentrenado sin etiquetas sobre 960 horas de LibriSpeech a 16 kHz durante 375.000 actualizaciones.

El modelo resuelve el problema clásico de ASR de bajos recursos: obtener un sistema de transcripción funcional con una cantidad mínima de audio etiquetado. Su relevancia radica en que demuestra que un objetivo de aprendizaje auto-supervisado tipo JEPA (Joint Embedding Predictive Architecture) aplicado al habla puede servir como base eficaz para fine-tuning con muy pocos datos, en la línea de lo que wav2vec 2.0 logró en su momento.

Con 89,7 millones de parámetros, arquitectura de encoder convolucional más transformer y una salida CTC de 29 símbolos, es un modelo compacto orientado a investigación y a entornos con recursos computacionales limitados. La licencia BSD-3-Clause permite uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Speech-JEPA (encoder convolucional de features + transformer, cabeza CTC) |
| Parametros totales | 89.674.525 (89,7 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio variable; frames cada 20 ms) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | ingles (en) |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors (`model.safetensors`), con código custom (`trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo sigue la estirpe de wav2vec 2.0 Base: un extractor convolucional de características sobre audio a 16 kHz (con normalización de grupo sobre el tiempo en la primera convolución) seguido de un transformer. Sobre esta base, Speech-JEPA introduce un objetivo de pretraining tipo JEPA, descrito en el repositorio base `labhamlet/speech-jepa-base`, entrenado sin etiquetas sobre LibriSpeech (960 h) durante 375.000 actualizaciones. La cabeza de salida es una capa CTC a nivel de carácter con vocabulario de 29 símbolos: 26 letras mayúsculas, apóstrofo, `|` como frontera de palabra y `<pad>` (índice 0) como blank CTC.

El fine-tuning se realizó sobre el split Libri-light 10 min (48 enunciados) con 13.000 actualizaciones, manteniendo congelado el transformer durante las primeras 10.000 y el extractor de features congelado en todo momento. Se usó Adam con betas (0,9; 0,98), learning rate pico de 0,0001 y schedule tri-stage (10% warm-up, 40% constante, 50% decay), en una sola GPU con precisión mixta bf16 y lotes de hasta 480 s de audio. Se aplicó enmascaramiento temporal (`mask_time_prob=0,065`, spans de 10 frames, mínimo 2 por enunciado) y de canales (`mask_feature_prob=0,004`, spans de 64 canales, mínimo 2 por enunciado), dropout de 0,1 antes de la cabeza CTC, LayerDrop de 0,05 y selección del checkpoint por menor WER greedy en dev-other.

## Capacidades

- Reconocimiento automático del habla en inglés a nivel de carácter mediante CTC.
- Transcripción de audio mono a 16 kHz con normalización por enunciado.
- Procesamiento por lotes con `padding=True`; el `attention_mask` permite ignorar muestras rellenadas y decodificar los frames de padding como blank.
- Salida de logits con una trama cada 20 ms, decodificables con `batch_decode`.
- No soporta tool calling ni function calling (es un modelo puramente acústico).
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües: solo inglés.
- No dispone de modo thinking, visión ni audio generativo.

## Casos de uso

- Investigación en ASR de bajos recursos: sirve como línea base reproducible para comparar objetivos de pretraining auto-supervisado (JEPA frente a wav2vec 2.0, HuBERT, WavLM) cuando solo se dispone de 10 minutos etiquetados.
- Prototipado rápido de transcripción en inglés: al ser un modelo de 89,7 M de parámetros, permite iterar en una sola GPU consumer para validar pipelines de ASR antes de escalar a modelos mayores.
- Evaluación de técnicas de fine-tuning con datos limitados: el `finetuning_config.json` publicado documenta hiperparámetros exactos, útil para reproducir y extender experimentos de congelación selectiva de capas.
- Docencia y formación: su tamaño reducido y su licencia permisiva lo hacen adecuado para prácticas sobre CTC, enmascaramiento y decodificación greedy en cursos de procesamiento de voz.
- Generación de pseudo-etiquetas: las transcripciones de este checkpoint pueden usarse para preetiquetar audio no etiquetado y alimentar ciclos de self-training en dominios con pocos datos.
- Integración en pipelines de evaluación comparativa: al compartir familia con los checkpoints de 1 h, 10 h y 100 h del mismo autor, permite medir la curva de rendimiento frente a la cantidad de datos etiquetados.
- Despliegue en entornos con restricciones de memoria: con 0,4 GB de repositorio y pesos en safetensors, cabe en GPUs de gama baja y en CPU para inferencia por lotes pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica únicamente que la selección del checkpoint se hizo por menor WER greedy en dev-other, pero no se proporcionan los valores numéricos de WER ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para los 89,7 M de parámetros; en la práctica, unos 0,5-1 GB incluyendo activaciones para audio corto.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona en RTX 3060, RTX 4090, A100, H100 y similares.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU consumer moderna e incluso en CPU para inferencia no interactiva.
- Opciones de despliegue: `transformers` con `AutoModelForCTC` y `trust_remote_code=True`; no se han publicado recetas para vLLM, llama.cpp, Ollama ni TGI, y al ser un modelo de audio con código custom su soporte en esos motores no está garantizado.
- Latencia y throughput estimados: no disponibles; la salida produce una trama cada 20 ms de audio, lo que fija la granularidad temporal de la decodificación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| labhamlet/speech-jepa-base-asr-10min | 89,7 M | no disponible | en | BSD-3-Clause | Hugging Face, código custom |
| facebook/wav2vec2-base-960h | ~95 M | no disponible | en | Apache-2.0 | Hugging Face, transformers nativo |
| facebook/wav2vec2-base-10k-voxpopuli-ft-en | ~95 M | no disponible | en | Apache-2.0 | Hugging Face, transformers nativo |
| labhamlet/speech-jepa-base-asr-1h | no disponible | no disponible | en | BSD-3-Clause | Hugging Face, mismo autor |

La comparación de rendimiento (WER) no está disponible porque la model card no publica métricas. La diferencia principal frente a wav2vec 2.0 Base estriba en el objetivo de pretraining (JEPA frente a contraste predictivo) y en el régimen de fine-tuning (10 minutos frente a 960 h etiquetadas en el caso de `wav2vec2-base-960h`).

## Limitaciones y advertencias

- Solo soporta inglés; no se ha entrenado ni evaluado en otros idiomas.
- El fine-tuning con solo 10 minutos de audio etiquetado implica un WER esperablemente alto en comparación con modelos entrenados con cientos de horas; no se publican cifras, por lo que no debe asumirse un rendimiento de producción.
- El vocabulario CTC es únicamente de mayúsculas, apóstrofo y frontera de palabra: no genera puntuación, dígitos ni minúsculas.
- La primera convolución usa normalización de grupo sobre el tiempo, por lo que el padding excesivo altera ligeramente la salida; se recomienda agrupar enunciados de longitud similar o transcribir de uno en uno.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del autor del modelo; conviene auditar `modeling_speech_jepa.py` antes de desplegarlo en producción.
- Riesgo de alucinación en el sentido de transcripciones incorrectas o inventadas en audio con ruido, acentos no vistos o dominios distintos de LibriSpeech (lectura de libros en inglés).
- Sesgos desconocidos: no se documenta la composición demográfica ni la distribución de hablantes del corpus de pretraining más allá de LibriSpeech.
- La licencia BSD-3-Clause permite uso comercial, pero exige conservar el aviso de copyright y no otorga garantías; verificar la licencia del corpus LibriSpeech/Libri-light para usos derivados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/labhamlet/speech-jepa-base-asr-10min
- Modelo base preentrenado: https://huggingface.co/labhamlet/speech-jepa-base
- Checkpoint 1 h: https://huggingface.co/labhamlet/speech-jepa-base-asr-1h
- Checkpoint 10 h: https://huggingface.co/labhamlet/speech-jepa-base-asr-10h
- Checkpoint 100 h: https://huggingface.co/labhamlet/speech-jepa-base-asr-100h
- Código y recetas: https://github.com/labhamlet/SpeechJEPA
- Dataset de fine-tuning: https://huggingface.co/datasets/openslr/librispeech_asr
