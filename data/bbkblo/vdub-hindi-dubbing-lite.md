# Bbkblo/vdub-hindi-dubbing-lite

## Resumen

El modelo **vdub-hindi-dubbing-lite** es un pipeline completo de doblaje de vídeo a hindi, diseñado para ejecutarse en CPU sin GPU. Lo desarrolla el usuario Bbkblo como una versión ligera de su anterior proyecto `vdub-hindi-dubbing` (8,8 GB), reduciendo el peso total a aproximadamente 0,7 GB más descargas en tiempo de ejecución de ~1,1 GB. El núcleo del sistema es un modelo de text-to-speech (TTS) basado en **Chatterbox-Multilingual-hi** de ResembleAI, cuantizado a INT8 mediante el esquema GGUF Q8_0, lo que permite clonar voces y sintetizar habla en hindi con control de emociones.

El pipeline procesa un vídeo (enlace o archivo) y produce un vídeo doblado al hindi con dos pistas de audio, incluyendo transcripción, detección de hablantes, extracción de emociones, traducción (chino a hindi), síntesis TTS, ajuste de tiempos y separación de música de fondo. Todo el flujo está optimizado para CPU, funcionando en equipos con 4 GB de RAM o en Colab gratuito. La arquitectura del TTS es un modelo Transformer de 30 capas (Llama-520M) con 218 capas lineales cuantizadas a INT8, manteniendo embeddings, normas y biases en FP32.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Chatterbox T3 (Transformer de 30 capas, basado en Llama-520M) |
| Parametros totales | 520 millones (aprox.) |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | No disponible (TTS por tokens de audio) |
| Tipos de cuantizacion | INT8 (GGUF Q8_0), FP32 (embeddings, normas y biases) |
| Idiomas soportados | Hindi (salida), Chino (entrada para traducción) |
| Licencia | MIT |
| Formato de pesos | safetensors (modelo cuantizado), GGUF (esquema Q8_0) |

## Arquitectura y entrenamiento

El modelo base es **Chatterbox-Multilingual-hi** de ResembleAI, un sistema TTS que combina un decodificador de audio (S3Gen) y un codificador de voz (ve) para la clonación de voces. El componente principal aquí es el modelo `t3_hi`, que corresponde a la parte de lenguaje del TTS (30 capas de Transformer, 520M de parámetros). En esta versión LITE, se han cuantizado las 218 capas lineales de `t3_hi` usando el esquema GGUF Q8_0 (per-block simétrico INT8), logrando una reducción de tamaño de 2,14 GB a 0,65 GB y una aceleración de 3-4x en CPU gracias a la multiplicación empaquetada INT8 de oneDNN. La calidad se mantiene casi sin pérdidas: el SNR medio de los pesos es de 45,4 dB y el error RMS relativo es del 0,54%.

El pipeline completo (12 etapas) incluye transcripción automática (SenseVoice), diarización de hablantes (clustering campplus), extracción de emociones, traducción a hindi mediante NLLB cuantizado a ONNX INT8, síntesis con clonación de voz y control emocional (exageración de emociones), transferencia de patrones de habla del actor original, normalización de volumen (-23 LUFS) y separación de instrumentales. El entrenamiento específico del TTS no se detalla; el modelo base fue entrenado por ResembleAI y la cuantización se hizo mediante scripts de llama.cpp.

## Capacidades

- **Text-to-speech en hindi** con clonación de voz: puede replicar la voz de un hablante a partir de una muestra.
- **Control emocional** en la síntesis: permite ajustar la intensidad de emociones como ANGRY (1.4), HAPPY (1.1), SAD (0.4) y NEUTRAL (0.5) mediante un parámetro `exaggeration`.
- **Soporte de entrada en chino**: el pipeline traduce automáticamente texto o subtítulos en chino al hindi antes de la síntesis.
- **Procesamiento de vídeo completo**: transcripción, detección de hablantes, corte de clips, separación de fondo musical (Kim_Vocal_2 o MelBandRoformer) y mezcla final con dos pistas de audio.
- **Transferencia de patrones de habla**: ajusta pausas, velocidad y volumen del habla sintetizada para imitar el original.
- **Normalización de volumen**: aplica estándar de difusión -23 LUFS.
- **Modo experimental**: transferencia de tono (pitch) y lip-sync (Wav2Lip) opcional, aunque lento en CPU.

## Casos de uso

- **Doblaje de series y dramas chinos**: el pipeline procesa un vídeo de entrada, traduce el diálogo y lo sintetiza con voces clonadas de los actores originales, generando un vídeo doblado al hindi con pistas de audio sincronizadas.
- **Traducción de contenido educativo**: cursos o tutoriales en chino pueden doblarse al hindi manteniendo la entonación y el ritmo del orador, facilitando la localización para audiencias indias.
- **Creación de vídeos multilingüe**: creadores de contenido que necesitan lanzar versiones en hindi de sus vídeos pueden usar el pipeline para generar la pista doblada automáticamente.
- **Producción audiovisual**: empresas de doblaje pueden usar el TTS con clonación de voz para previsualizar doblajes antes de la grabación con actores humanos, reduciendo costes.
- **Accesibilidad**: vídeos en chino pueden doblarse al hindi para personas con discapacidad visual o para audiencias que no leen subtítulos.
- **Archivo y preservación**: doblaje de material histórico o entrevistas en chino para su distribución en la India.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo reporta métricas de calidad de cuantización: SNR medio de 45.4 dB y error RMS relativo del 0.54% (máximo 0.74%), verificado en pruebas de generación de voz en CPU. No hay comparación con otros modelos TTS.

## Requisitos de hardware

- **VRAM estimada**: No requiere GPU; funciona en CPU. El TTS cuantizado consume ~1,9 GB de RAM en inferencia (frente a ~3,2 GB en versión completa).
- **GPU recomendada**: Opcional. Si hay GPU, el cargador (`lite_loader.py`) detecta y usa `W8Linear` para acelerar, pero no es necesario.
- **CPU**: cualquier CPU moderna con soporte oneDNN (INT8) funciona; se recomienda al menos 2 GB de RAM para el modelo TTS, y el pipeline completo puede ejecutarse con 4 GB de RAM.
- **Opciones de despliegue**: CLI (Python), notebook Colab/Kaggle, o integración en scripts con `lite_loader.py` para uso directo del TTS.
- **Latencia y throughput**: no hay datos públicos, pero se indica que el TTS INT8 es 3-4x más rápido que la versión FP32 en CPU.

## Comparativa con modelos similares

No se dispone de información comparable de otros modelos de doblaje ligero en CPU con clonación de voz y soporte para hindi. El modelo base (Chatterbox-Multilingual-hi) es una referencia, pero la versión cuantizada no tiene competidores directos documentados.

## Limitaciones y advertencias

- **Idiomas limitados**: el pipeline está optimizado para entrada en chino y salida en hindi; otros idiomas no están garantizados.
- **Calidad de voz**: aunque la cuantización INT8 es near-lossless, puede haber degradación sutil en la fidelidad de la voz en comparación con el modelo FP32 original.
- **Dependencia de componentes externos**: el pipeline depende de modelos como SenseVoice, NLLB, Kim_Vocal_2, etc., que tienen sus propias licencias y limitaciones.
- **Lip-sync experimental**: el modo Wav2Lip es lento en CPU y de calidad básica, no comparable con soluciones comerciales.
- **Alucinaciones**: como todo TTS, puede generar palabras incorrectas o acentos extraños si el texto de entrada contiene errores o el hablante original no es claro.
- **Restricciones de uso**: la licencia MIT permite uso comercial, pero el pipeline usa modelos de terceros (p.ej., SenseVoice, NLLB) con licencias propias que deben revisarse.
- **No es un modelo de lenguaje general**: solo genera habla a partir de texto; no soporta razonamiento ni tareas de NLP.

## Enlaces

- [HuggingFace - Bbkblo/vdub-hindi-dubbing-lite](https://huggingface.co/Bbkblo/vdub-hindi-dubbing-lite)
- [Modelo base: ResembleAI/Chatterbox-Multilingual-hi](https://huggingface.co/ResembleAI/Chatterbox-Multilingual-hi)
- [Repositorio de Chatterbox (ResembleAI)](https://github.com/resemble-ai/chatterbox)
- [Repositorio de Perth (ResembleAI)](https://github.com/resemble-ai/Perth)
- [Versión completa del pipeline (8.8 GB)](https://huggingface.co/Bbkblo/vdub-hindi-dubbing)
