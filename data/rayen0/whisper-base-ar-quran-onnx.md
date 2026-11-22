# Rayen0/whisper-base-ar-quran-onnx

## Resumen

`Rayen0/whisper-base-ar-quran-onnx` es una exportación a ONNX del modelo `tarteel-ai/whisper-base-ar-quran`, un ajuste fino de `openai/whisper-base` especializado en reconocimiento de recitación coránica en árabe. Lo publica el usuario Rayen0 con el objetivo de ejecutar la inferencia íntegramente en el navegador mediante Transformers.js, dentro de una aplicación de práctica de recitación llamada iqra en la que el audio nunca abandona el dispositivo. No se ha realizado entrenamiento ni ajuste adicional: el trabajo consiste en exportar y cuantizar los pesos originales.

El modelo parte de la arquitectura Whisper base, un transformer encoder-decoder con aproximadamente 74 millones de parámetros y una ventana de audio de 30 segundos por segmento. La contribución práctica de esta versión es el formato: dos ficheros ONNX cuantizados a int8 (encoder y decoder fusionado con past), lo que reduce el tamaño del repositorio a 0,1 GB y permite despliegue en cliente sin backend.

Es relevante para desarrolladores que necesiten transcripción de árabe coránico de bajo coste computacional en entornos web o edge, con licencia Apache 2.0 y sin dependencia de servicios en la nube. La salida es árabe totalmente diacritizado en ortografía Imla'i estándar, no en escritura Uthmani.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper base) |
| Parametros totales | no disponible (Whisper base: ~74 M, dato no confirmado en la información) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper procesa ventanas de audio de 30 s) |
| Tipos de cuantizacion | int8 dinámica (per-tensor) en encoder y decoder |
| Idiomas soportados | árabe (ar) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`encoder_model_quantized.onnx`, `decoder_model_merged_quantized.onnx`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es Whisper base de OpenAI, un transformer encoder-decoder diseñado para reconocimiento automático de voz sobre espectrogramas log-Mel de 30 segundos. El checkpoint original `tarteel-ai/whisper-base-ar-quran` fue ajustado por Tarteel AI sobre recitación coránica; los detalles de entrenamiento (número de tokens, composición del dataset, uso de RLHF) no se recogen en la información disponible y remiten a la model card del modelo base.

Esta versión no introduce cambios en los pesos: la exportación se realizó con Hugging Face Optimum (`optimum-cli export onnx --task automatic-speech-recognition-with-past`, optimum-onnx 0.1.0, transformers 4.57.6, torch 2.15.0) y la cuantización con `optimum-cli onnxruntime quantize --avx512` (onnxruntime 1.32.0). Un detalle técnico relevante es que el `generation_config.json` se toma de `openai/whisper-base`, porque el repositorio ajustado no lo incluía y el exportador por defecto omite los tokens multilingües de idioma y tarea necesarios para solicitar transcripción en árabe. La validación reportada por el autor compara 45 recitaciones de cuatro recitadores y obtiene transcripciones idénticas, diacríticos incluidos, a las del checkpoint PyTorch original con Transformers.js 4.3.2 en Node.js sobre CPU.

## Capacidades

- Reconocimiento automático de voz en árabe, específicamente orientado a recitación coránica.
- Transcripción con diacritización completa en ortografía Imla'i estándar.
- Ejecución íntegra en navegador mediante Transformers.js, sin envío de audio a servidores.
- Inferencia en CPU con pesos int8, adecuada para entornos sin GPU.
- Pipeline `automatic-speech-recognition` con opciones de `language` y `task` (transcribe).
- No se documenta soporte de tool calling, agentes, visión ni audio más allá de la transcripción.

## Casos de uso

- Práctica de recitación coránica en el navegador: la aplicación iqra emplea el modelo para transcribir la recitación del usuario y compararla con el texto esperado, con la garantía de que el audio permanece en el dispositivo.
- Aplicaciones web educativas offline: al ejecutarse en cliente con Transformers.js, permite distribuir herramientas de aprendizaje sin backend ni costes de inferencia en servidor.
- Verificación de memorización (hifz): transcripción diacritizada que facilita la comparación automática entre lo recitado y el texto canónico.
- Prototipado rápido de ASR en árabe: el formato ONNX cuantizado permite integrar el modelo en demos web o extensiones sin infraestructura de GPU.
- Procesamiento por lotes de audio en CPU: útil para transcribir archivos de recitación en pipelines ligeros donde no hay acelerador disponible.
- Investigación sobre ASR de bajo recurso: sirve como línea base reproducible para estudiar el rendimiento de Whisper base ajustado en árabe coránico en entornos edge.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única validación reportada es cualitativa: con Transformers.js 4.3.2 en Node.js sobre CPU, las transcripciones de 45 recitaciones de cuatro recitadores fueron idénticas, diacríticos incluidos, a las del checkpoint PyTorch original.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el modelo está pensado para ejecución en CPU.
- GPU recomendadas: no disponible; no se documenta uso de GPU.
- Cabe en consumer GPU: no se documenta; el despliegue objetivo es navegador y CPU.
- Opciones de despliegue: Transformers.js (`@huggingface/transformers`) con `dtype: "q8"`; ONNX Runtime en general.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Rayen0/whisper-base-ar-quran-onnx | no disponible (~74 M en Whisper base) | ventana de audio de 30 s | árabe | Apache 2.0 | ONNX int8 |
| tarteel-ai/whisper-base-ar-quran | no disponible (~74 M en Whisper base) | ventana de audio de 30 s | árabe | Apache 2.0 | PyTorch |
| openai/whisper-base | ~74 M | ventana de audio de 30 s | multilingüe | Apache 2.0 | PyTorch / ONNX |

La diferencia principal frente al checkpoint de Tarteel AI es el formato ONNX cuantizado para ejecución en cliente; frente a `openai/whisper-base`, el ajuste específico en recitación coránica y la salida diacritizada. No se dispone de datos de rendimiento comparativos.

## Limitaciones y advertencias

- El modelo está especializado en recitación coránica; su rendimiento en árabe conversacional general no está documentado.
- Riesgo de alucinación inherente a Whisper, especialmente en segmentos con ruido o silencio.
- La salida usa ortografía Imla'i, no Uthmani; no es adecuada si se requiere texto Uthmani literal.
- Ventana de audio de 30 segundos por segmento; los audios más largos requieren segmentación.
- Solo se declara soporte de árabe.
- Licencia Apache 2.0: permite uso comercial, pero requiere mantener los avisos de atribución a Tarteel AI y OpenAI.
- La validación reportada es limitada (45 recitaciones, cuatro recitadores, CPU); no se han publicado métricas de error (WER/CER).
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin comunidad de soporte documentada.

## Enlaces

- Hugging Face: https://huggingface.co/Rayen0/whisper-base-ar-quran-onnx
- Modelo base: https://huggingface.co/tarteel-ai/whisper-base-ar-quran
- Modelo original: https://huggingface.co/openai/whisper-base
- Transformers.js: https://github.com/huggingface/transformers.js
