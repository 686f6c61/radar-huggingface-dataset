# Selbyggen/whisper-large-v3-turbo-danish-coreml

## Resumen

Whisper large-v3 turbo Danish – WhisperKit / Core ML es una conversión de formato del modelo de reconocimiento automático del habla (ASR) [thorhojhus/whisper-large-v3-turbo-danish](https://huggingface.co/thorhojhus/whisper-large-v3-turbo-danish), un ajuste fino de OpenAI Whisper large-v3 turbo sobre aproximadamente 12.900 horas de habla en danés. El autor de la conversión es Selbyggen, y el objetivo es empaquetar los pesos originales en Core ML para que WhisperKit los ejecute sobre el Apple Neural Engine en Mac, iPhone y iPad. No se trata de un modelo nuevo: los pesos y el comportamiento son los del modelo original.

La relevancia de esta ficha es práctica: permite ejecutar un ASR de calidad para danés de forma totalmente local en hardware Apple Silicon, sin enviar audio a servicios externos. Se ofrecen dos variantes, una de 634 MB con encoder y decoder paletizados a 4 bits (pensada para iPhone e iPad) y otra de 1,63 GB en float16 (pensada para Mac). Ambas incluyen cabezas de alineación para generar marcas de tiempo a nivel de palabra.

El modelo base parte de la arquitectura Whisper large-v3 turbo, un transformer encoder-decoder con aproximadamente 809 millones de parámetros y una ventana de contexto de audio de 30 segundos por segmento. La conversión no altera `config.json` ni `generation_config.json`, y mantiene el tokenizador de `openai/whisper-large-v3`.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3 turbo), convertido a Core ML |
| Parametros totales | no disponible (heredados del modelo base Whisper large-v3 turbo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s por segmento, propia de Whisper) |
| Tipos de cuantizacion | float16 (variante de 1,63 GB); paletizado 4 bits con descomposición de outliers (variante de 634 MB) |
| Idiomas soportados | danés (da) |
| Licencia | MIT |
| Formato de pesos | Core ML (paquetes `.mlpackage`/`.mlmodelc` para WhisperKit) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper large-v3 turbo: un transformer encoder-decoder con atención completa, entrenado originalmente por OpenAI para transcripción multilingüe y traducción de voz. El ajuste fino del modelo base se realizó sobre aproximadamente 12.900 horas de audio en danés, según indica la model card. La conversión a Core ML se hizo con `whisperkittools` mediante el comando `whisperkit-generate-model --model-version thorhojhus/whisper-large-v3-turbo-danish`; la variante de 4 bits se generó con `--generate-quantized-variants --allowed-nbits 4 --outlier-decomp --force-recipe-nbits` y coremltools 8.3.0, mientras que el decoder float16 se generó con coremltools 9.0.

Las pruebas internas de Core ML reportan PSNR de 53,3 para el encoder de audio frente a PyTorch y 40,5 para el decoder de texto en float16; en la variante de 4 bits, PSNR de 50,5 para el encoder y 40 para el decoder frente al modelo PyTorch con paletización simulada. Todas las pruebas pasaron. Ambos decoders incluyen cabezas de alineación (`alignment_heads_weights`), lo que habilita marcas de tiempo por palabra en WhisperKit. No se documentan detalles adicionales sobre el proceso de ajuste fino (composición exacta del dataset, uso de RLHF/DPO, etc.) en la información disponible.

## Capacidades

- Transcripción automática de voz en danés con puntuación y uso de mayúsculas preservados.
- Generación de marcas de tiempo a nivel de palabra gracias a las cabezas de alineación incluidas en ambos decoders.
- Ejecución local en Apple Neural Engine mediante WhisperKit, sin salida de audio del dispositivo.
- Dos perfiles de precisión: 4 bits para dispositivos móviles y float16 para Mac.
- Compatibilidad con el tokenizador de `openai/whisper-large-v3`.
- No se documentan capacidades de traducción, diarización, tool calling ni agentes en la información disponible.

## Casos de uso

- Transcripción local de reuniones en Mac: la variante float16 de 1,63 GB permite transcribir grabaciones con marcas de tiempo por palabra sin enviar audio a la nube, adecuada para entornos con requisitos de privacidad.
- Dictado en iPhone e iPad: la variante de 634 MB en 4 bits está diseñada para ejecutarse en el Apple Neural Engine de dispositivos móviles, lo que permite dictado en danés sin conexión.
- Subtitulado de vídeo en danés: las marcas de tiempo por palabra facilitan la generación de subtítulos sincronizados a partir de pistas de audio.
- Aplicaciones de accesibilidad: transcripción en tiempo real de conversaciones para personas con dificultades auditivas, ejecutándose íntegramente en el dispositivo.
- Procesamiento por lotes de archivos de audio en danés: integración en pipelines de macOS que necesiten transcribir grandes volúmenes de grabaciones de forma local.
- Integración en apps nativas Swift: el ejemplo de uso con WhisperKit permite incorporar el modelo en aplicaciones macOS/iOS con unas pocas líneas de código.
- Investigación en ASR para danés: sirve como referencia reproducible de un modelo ajustado y cuantizado para comparar calidad y latencia en hardware Apple.

## Benchmarks y rendimiento

La model card reporta una verificación de extremo a extremo sobre un conjunto pequeño de clips sintéticos en danés (voz de macOS «Sara» y un diálogo de dos hablantes) mediante WhisperKit:

| Modelo | WER (clips sintéticos) |
|---|---|
| whisper-large-v3-turbo-danish (float16 y 4 bits) | 7,8 % |
| OpenAI whisper-large-v3 | 9,4 % |
| OpenAI large-v3 turbo comprimido (`large-v3-v20240930_626MB`) | 11,7 % |

El propio autor advierte de que el habla sintética es mucho más fácil que las grabaciones reales y que estas cifras son solo una comprobación de sanidad. Para evaluaciones reales (CoRal, FLEURS, Common Voice, FTSpeech) remite a la model card del modelo original. No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.), que además no aplican a un modelo ASR.

## Requisitos de hardware

- VRAM/almacenamiento: 634 MB para la variante de 4 bits y 1,63 GB para la variante float16; el repositorio completo ocupa 2,2 GB.
- Hardware objetivo: Apple Silicon (Apple Neural Engine) en Mac, iPhone e iPad.
- No está pensado para GPU NVIDIA (A100, H100, RTX 4090) ni para despliegue en CUDA; el formato es Core ML.
- Despliegue: WhisperKit (librería Swift); el ejemplo de la model card muestra la descarga y el uso mediante `WhisperKit.download` y `WhisperKitConfig`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Selbyggen/whisper-large-v3-turbo-danish-coreml | no disponible (base Whisper large-v3 turbo) | 30 s por segmento (Whisper) | da | MIT | Core ML |
| thorhojhus/whisper-large-v3-turbo-danish | no disponible (base Whisper large-v3 turbo) | 30 s por segmento (Whisper) | da | MIT | PyTorch/safetensors (no confirmado) |
| OpenAI whisper-large-v3 | no disponible | 30 s por segmento (Whisper) | multilingüe | MIT | PyTorch |
| OpenAI large-v3 turbo (`large-v3-v20240930_626MB`) | no disponible | 30 s por segmento (Whisper) | multilingüe | MIT | Core ML (Argmax) |

La comparativa se limita a variantes del mismo modelo base y a los modelos citados en la model card; no se dispone de datos de otros modelos ASR para danés en la información proporcionada.

## Limitaciones y advertencias

- Es una conversión de formato, no un modelo nuevo: cualquier sesgo o limitación del modelo original se hereda íntegramente.
- Solo soporta danés; no se debe esperar un comportamiento multilingüe.
- Los resultados de WER reportados proceden de habla sintética y no son representativos de grabaciones reales.
- Riesgo de alucinación inherente a los modelos Whisper, especialmente en audio con ruido o silencios largos.
- La ventana de audio es de 30 segundos por segmento, propia de la arquitectura Whisper; los audios más largos requieren segmentación.
- El formato Core ML limita el despliegue a hardware Apple; no es utilizable directamente en GPU NVIDIA ni en servidores x86 sin conversión adicional.
- Licencia MIT, que permite uso comercial, pero conviene verificar las condiciones del modelo base original.
- No se documentan evaluaciones sobre datos reales en esta conversión; para producción se recomienda consultar los resultados de CoRal, FLEURS, Common Voice y FTSpeech del modelo original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Selbyggen/whisper-large-v3-turbo-danish-coreml
- Modelo base: https://huggingface.co/thorhojhus/whisper-large-v3-turbo-danish
- Autor del modelo base: https://huggingface.co/thorhojhus
- WhisperKit: https://github.com/argmaxinc/WhisperKit
- whisperkittools: https://github.com/argmaxinc/whisperkittools
- Aplicación Sagt: https://sagtapp.com/da/
