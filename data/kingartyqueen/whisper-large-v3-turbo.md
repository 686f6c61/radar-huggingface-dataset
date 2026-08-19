# kingartyqueen/whisper-large-v3-turbo

## Resumen

El modelo `kingartyqueen/whisper-large-v3-turbo` es una variante del sistema de reconocimiento automático de voz (ASR) Whisper de OpenAI, específicamente una versión podada de Whisper large-v3. Fue desarrollado por OpenAI y posteriormente subido a Hugging Face por el usuario kingartyqueen. La principal innovación es la reducción de las capas del decodificador de 32 a 4, lo que acelera significativamente la inferencia a costa de una ligera pérdida de calidad. Con 809 millones de parámetros, este modelo está diseñado para transcripción de audio y traducción de voz a texto en inglés, manteniendo el soporte multilingüe de su predecesor. Es relevante para desarrolladores que necesitan un ASR rápido y ligero sin sacrificar demasiada precisión, especialmente en entornos con recursos computacionales limitados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (encoder-decoder Transformer) con 4 capas de decodificador (podado de 32) |
| Parametros totales | 808.878.080 (809M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 30 segundos de audio (ventana fija de Whisper) |
| Tipos de cuantizacion | no disponible (se puede cuantizar con herramientas externas, pero no se especifica) |
| Idiomas soportados | 99 idiomas, incluyendo en, es, fr, de, it, pt, zh, ja, ko, ru, ar, hi, etc. |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Whisper original: un encoder basado en Transformer que procesa espectrogramas de Mel de 80 canales y un decoder autoregresivo que genera los tokens de texto. La diferencia clave respecto a Whisper large-v3 es la poda del decodificador, que pasa de 32 capas a solo 4, reduciendo el número de parámetros y acelerando la generación. El entrenamiento se basa en el mismo corpus de más de 5 millones de horas de audio etiquetado utilizado para Whisper, con un enfoque de aprendizaje supervisado débil. No se han publicado detalles específicos sobre el proceso de poda o fine-tuning de esta variante, pero se sabe que la poda se realizó sobre los pesos de large-v3 y luego se ajustó ligeramente para mitigar la pérdida de calidad. El modelo soporta técnicas de decodificación como temperature fallback y condition on previous tokens, y puede predecir timestamps a nivel de frase o palabra.

## Capacidades

- Transcripción de voz a texto en 99 idiomas, con detección automática del idioma de origen.
- Traducción de voz a texto en inglés desde cualquier idioma soportado (tarea `translate`).
- Generación de timestamps a nivel de frase o palabra para alinear el texto con el audio.
- Manejo de audio de longitud arbitraria mediante el uso de la clase `pipeline` de Transformers, que segmenta automáticamente.
- Compatible con estrategias de decodificación avanzadas: temperature fallback, umbral de compresión, condición en tokens previos.
- Soporte para procesamiento por lotes (batch) para transcribir múltiples audios en paralelo.
- Integración nativa con Hugging Face Transformers y Datasets, lo que facilita su uso en pipelines existentes.

## Casos de uso

- Transcripción de reuniones y conferencias: el modelo puede transcribir grabaciones largas en tiempo real o de forma diferida, gracias a su soporte de audio de longitud arbitraria y su velocidad mejorada respecto a large-v3.
- Subtitulado automático de vídeos: genera subtítulos con timestamps a nivel de frase o palabra, adecuado para plataformas de vídeo o herramientas de edición.
- Asistentes de voz y comandos por voz: su baja latencia (debido a la poda) lo hace útil para aplicaciones interactivas donde se requiere una respuesta rápida.
- Traducción automática de contenido audiovisual: convierte discursos en cualquier idioma a texto en inglés, facilitando la localización de podcasts, webinars o noticias.
- Transcrito de llamadas de atención al cliente: puede integrarse en sistemas de análisis de llamadas para extraer información o generar resúmenes, con la ventaja de su licencia MIT para uso comercial.
- Herramientas de accesibilidad: transcripción en tiempo real para personas con discapacidad auditiva, con soporte multilingüe y timestamps para facilitar la navegación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo es una variante podada de Whisper large-v3, y aunque se espera una degradación menor en métricas como WER (Word Error Rate) en comparación con el modelo completo, no se proporcionan cifras concretas. Se recomienda consultar la discusión de GitHub vinculada para más detalles sobre el rendimiento relativo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3-4 GB en FP16 para procesar audios de 30 segundos, dado que el modelo tiene 809M parámetros. En FP32, se necesitarían alrededor de 6-7 GB.
- GPU recomendadas: tarjetas con al menos 6 GB de VRAM, como RTX 2060, RTX 3060, GTX 1660 Ti o superiores. Para despliegue en producción, una A10 o T4 es suficiente.
- Es ejecutable en CPU, aunque con mayor latencia; se recomienda usar cuantización (por ejemplo, con llama.cpp o ONNX) para mejorar el rendimiento en CPU.
- Opciones de despliegue: compatible con Hugging Face Transformers, vLLM (aunque no es un LLM, se puede servir con TGI), y también se puede exportar a ONNX o usar con CTranslate2 para aceleración en CPU.
- Latencia y throughput estimados: no disponibles, pero al tener solo 4 capas de decodificador, la generación es aproximadamente 3-4 veces más rápida que Whisper large-v3, según la discusión de OpenAI.

## Comparativa con modelos similares

| Modelo | Parámetros | Capas decodificador | Contexto | Licencia | Velocidad relativa |
|---|---|---|---|---|---|
| kingartyqueen/whisper-large-v3-turbo | 809M | 4 | 30 s | MIT | Alta |
| openai/whisper-large-v3 | 1550M | 32 | 30 s | MIT | Baja (referencia) |
| openai/whisper-small | 244M | 12 | 30 s | MIT | Muy alta |

El modelo turbo ofrece un equilibrio entre precisión y velocidad: es más preciso que whisper-small pero considerablemente más rápido que large-v3. Su licencia MIT permite uso comercial sin restricciones, igual que los otros modelos de Whisper.

## Limitaciones y advertencias

- La poda del decodificador introduce una degradación de calidad en la transcripción, especialmente en audio con ruido de fondo, acentos fuertes o habla superpuesta. Se recomienda evaluar en el dominio específico antes de desplegar en producción.
- Al igual que otros modelos Whisper, puede alucinar texto en segmentos de silencio o audio ininteligible, produciendo transcripciones incorrectas.
- La ventana de contexto está limitada a 30 segundos de audio; para audios más largos, el pipeline segmenta automáticamente, pero puede perder contexto entre segmentos.
- Aunque soporta 99 idiomas, el rendimiento varía significativamente entre ellos; los idiomas con menos datos de entrenamiento pueden tener tasas de error más altas.
- No se proporcionan detalles sobre el proceso de poda o fine-tuning, por lo que no se puede verificar la reproducibilidad del modelo.
- La licencia MIT permite uso comercial, pero se debe atribuir correctamente la autoría original de OpenAI según los términos de la licencia.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/kingartyqueen/whisper-large-v3-turbo)
- [Paper original de Whisper](https://huggingface.co/papers/2212.04356)
- [Discusión de OpenAI sobre la poda](https://github.com/openai/whisper/discussions/2363)
- [Modelo base openai/whisper-large-v3](https://huggingface.co/openai/whisper-large-v3)
