# Jazira1992/kk-whisper-small

## Resumen

kk-whisper-small es un modelo de reconocimiento automático del habla (ASR) para kazajo, desarrollado por el usuario Jazira1992 a partir de openai/whisper-small. El modelo parte de la arquitectura transformer encoder-decoder de Whisper (unos 244 millones de parámetros) y se ha ajustado de forma específica sobre corpus de habla kazaja, con un proceso de entrenamiento en tres rondas que incorpora datos limpios, habla con música de fondo y mezclas con ruido telefónico, eco y variaciones de velocidad. Su relevancia actual reside en que el kazajo es un idioma con recursos limitados y este ajuste supera de forma clara al modelo generalista whisper-large-v3-turbo en todas las pruebas publicadas, pese a ser un modelo mucho más pequeño.

El modelo se distribuye en formato ONNX para transformers.js, lo que permite ejecutar la transcripción directamente en navegador, en un ordenador personal o en un teléfono, sin necesidad de servidor. Esta orientación a inferencia local y ligera lo hace útil para aplicaciones de subtitulado, transcripción de llamadas o procesamiento de audio en el borde, donde el coste y la privacidad son factores críticos.

La licencia es CC BY-SA 3.0, condicionada por el uso de datos de entrenamiento con esa misma licencia (Kazakh Speech Dataset). El repositorio ocupa 3,1 GB e incluye pesos en fp32 y cuantizaciones q8 y q4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper small) |
| Parametros totales | aproximadamente 244 millones (heredados de whisper-small) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Whisper procesa ventanas de audio de 30 segundos) |
| Tipos de cuantizacion | fp32, q8, q4 |
| Idiomas soportados | kazajo (kk) |
| Licencia | CC BY-SA 3.0 |
| Formato de pesos | ONNX (encoder_model.onnx, encoder_model_quantized.onnx, decoder_model_merged_quantized.onnx, decoder_model_merged_q4.onnx) |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper small: un transformer encoder-decoder con atención completa, entrenado originalmente por OpenAI para transcripción y traducción multilingüe. Este ajuste no modifica la topología, sino que especializa los pesos en kazajo mediante tres rondas de fine-tuning. La primera ronda usa ISSAI Kazakh Speech Corpus 2 durante 4000 pasos. La segunda ronda reutiliza el mismo corpus mezclado con música durante 3000 pasos, con el objetivo de mejorar la robustez ante voz cantada o con acompañamiento musical. La tercera ronda, de 5000 pasos, combina KSC2, Kazakh Speech Dataset (OpenSLR 140, habla telefónica), FLEURS y Common Voice 19, aplicando aumentación de datos con cambios de velocidad, eco, ruido, música y efecto telefónico.

Las pistas musicales empleadas provienen de Free Music Archive y se limitan a licencias CC0, CC BY y Public Domain Mark; el autor detalla la procedencia en `music_credits.csv` y `data_credits.txt`. El uso de KSD (CC BY-SA 3.0) obliga a liberar el modelo bajo la misma licencia. No se documenta en la información disponible el uso de RLHF, DPO ni técnicas de decodificación especulativa.

## Capacidades

- Transcripción de voz a texto en kazajo, con soporte para audio de 16 kHz.
- Robustez ante condiciones acústicas adversas: música de fondo, ruido, eco, variaciones de velocidad y audio telefónico.
- Ejecución en navegador mediante transformers.js y ONNX Runtime Web, sin backend.
- Inferencia local en CPU y GPU, incluyendo WebGPU gracias a la variante q4.
- Selección explícita de idioma y tarea (`language: 'kazakh'`, `task: 'transcribe'`).
- No se documentan capacidades de traducción, diarización, tool calling ni agentes.

## Casos de uso

- Subtitulado de vídeo en kazajo: el modelo puede transcribir pistas de audio de hasta 30 segundos por ventana y encadenarse para vídeos largos, con la ventaja de ejecutarse en el navegador del editor sin subir el material a un servidor.
- Transcripción de llamadas telefónicas: el tercer ciclo de entrenamiento incluye habla telefónica de OpenSLR 140 y aumentación con efecto telefónico, lo que reduce el WER en conversaciones con ancho de banda limitado.
- Herramientas de accesibilidad en web: al integrarse con transformers.js, se puede ofrecer dictado y subtitulado en vivo dentro de una página, con cuantización q8 para mantener el tamaño manejable.
- Procesamiento de archivos musicales o radio: la segunda ronda de entrenamiento con música de fondo permite transcribir voz cantada o locución sobre música con menor degradación que un Whisper genérico.
- Aplicaciones móviles offline: los archivos ONNX cuantizados permiten incluir el modelo en una app y transcribir sin conexión, útil en entornos con conectividad limitada.
- Investigación en lenguas de bajos recursos: sirve como punto de partida para experimentos de ASR en kazajo y como referencia de ajuste eficiente de modelos pequeños frente a modelos grandes generalistas.

## Benchmarks y rendimiento

Datos de WER (%) publicados por el autor, comparando antes y después de la tercera ronda con OpenAI whisper-large-v3-turbo:

| Test | Antes (ronda 2) | Después (ronda 3) | whisper-large-v3-turbo |
|---|---|---|---|
| KSC2 habla limpia | 13,0 | 11,3 | 28,7 |
| KSC2 con música | 20,3 | 18,2 | 44,5 |
| KSD, conversación telefónica | 20,5 | 16,0 | 17,6 |
| FLEURS test | 20,6 | 12,5 | 21,0 |
| Common Voice 19 test | 31,7 | 28,1 | 44,7 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; por el tamaño de whisper-small, la variante fp32 ronda 1 GB de pesos y las cuantizadas q8 y q4 reducen considerablemente ese requisito.
- GPU recomendadas: no hay recomendaciones del autor; por tamaño, cualquier GPU con al menos 2 GB de memoria libre puede ejecutar la variante cuantizada, y WebGPU permite usar GPUs integradas o dedicadas de consumo.
- Cabe en GPU de consumo: sí, incluidas tarjetas de gama media y GPUs integradas mediante WebGPU con la variante q4.
- Opciones de despliegue: transformers.js (navegador y Node.js), ONNX Runtime Web; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto de audio | WER FLEURS kk | WER CV19 kk | Licencia | Formato |
|---|---|---|---|---|---|---|
| kk-whisper-small | ~244 M | ventanas de 30 s | 12,5 | 28,1 | CC BY-SA 3.0 | ONNX |
| openai/whisper-small | ~244 M | ventanas de 30 s | no disponible | no disponible | MIT | safetensors, ONNX |
| openai/whisper-large-v3-turbo | ~809 M | ventanas de 30 s | 21,0 | 44,7 | MIT | safetensors |

La comparación con whisper-small original no puede completarse porque no se han publicado sus WER en kazajo en la información disponible. Frente a whisper-large-v3-turbo, el modelo ajustado obtiene menor WER en las cinco pruebas reportadas, con la excepción de KSD telefónico, donde large-v3-turbo logra 17,6 frente a 16,0 del ajustado (este último sigue siendo mejor, pero la diferencia es menor).

## Limitaciones y advertencias

- Entrenado exclusivamente para kazajo; no se garantiza un rendimiento aceptable en otros idiomas.
- El WER en Common Voice 19 (28,1 %) sigue siendo alto en términos absolutos, lo que refleja la variabilidad de hablantes y condiciones de ese corpus.
- Riesgo de alucinación inherente a los modelos Whisper en segmentos de silencio, ruido o audio no vocal.
- La licencia CC BY-SA 3.0 obliga a compartir bajo la misma licencia las obras derivadas y exige atribución, lo que puede ser restrictivo para uso comercial propietario.
- No se documentan sesgos específicos de género, edad o acento; al ser un ajuste sobre corpus limitados, es probable que el rendimiento varíe según la variedad dialectal.
- El procesamiento se limita a ventanas de 30 segundos; para audio largo es necesario segmentar y gestionar los solapamientos.
- No hay soporte documentado para traducción, diarización ni puntuación avanzada.

## Enlaces

- https://huggingface.co/Jazira1992/kk-whisper-small
- https://github.com/huggingface/transformers.js
- https://huggingface.co/openai/whisper-small
- https://huggingface.co/datasets/issai/Kazakh_Speech_Corpus_2
- https://huggingface.co/datasets/google/fleurs
- https://huggingface.co/datasets/mozilla-foundation/common_voice_19_0
- https://huggingface.co/datasets/benjamin-paine/free-music-archive-commercial-16khz-full
