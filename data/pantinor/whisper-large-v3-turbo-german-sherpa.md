# pantinor/whisper-large-v3-turbo-german-sherpa

## Resumen

El modelo `pantinor/whisper-large-v3-turbo-german-sherpa` es una exportación en formato ONNX cuantizado a int8 del modelo `primeline/whisper-large-v3-turbo-german`, un fine-tuning de Whisper large-v3-turbo específicamente entrenado para el reconocimiento automático de voz (ASR) en alemán. El autor, pantinor, lo publica como parte del catálogo de modelos de la comunidad Anti-Vocale, con el objetivo de que pueda integrarse como modelo externo en aplicaciones que usan sherpa-onnx sin necesidad de actualizar la aplicación.

El modelo base, desarrollado por Florian Zimmermeister (@primeline), tiene 809 millones de parámetros y alcanza un WER del 2,628 % en el conjunto de evaluación German ASR Data-Mix. Esta versión sherpa-onnx incluye un encoder cuantizado int8 y un decoder con cuantización per-channel int8, una decisión técnica que evita la terminación prematura de transcripciones que se observa con la cuantización per-tensor en decoders fine-tuned. El resultado es un modelo compacto (1,0 GB en el repositorio) y optimizado para inferencia en tiempo real, manteniendo una calidad de transcripción prácticamente idéntica a la versión en punto flotante.

La relevancia de este modelo radica en su utilidad práctica para desarrolladores que necesitan un sistema de transcripción en alemán de alta precisión, con bajo consumo de recursos y compatible con el ecosistema sherpa-onnx, ampliamente usado en aplicaciones de voz embebidas y de escritorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper large-v3-turbo (encoder-decoder transformer, 4 capas de decoder) |
| Parametros totales | 809 M (modelo base fine-tuned) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 30 segundos de audio por ventana (fijo en Whisper) |
| Tipos de cuantizacion | int8 (encoder MatMul int8, decoder per-channel int8) |
| Idiomas soportados | aleman (de) (vocabulario multilingual de Whisper, pero fine-tuned solo para aleman) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (encoder.int8.onnx, decoder.pc-int8.onnx, tokens.txt) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Whisper large-v3-turbo, que es una versión optimizada de Whisper large-v3 con solo 4 capas de decoder (en lugar de 32), lo que reduce significativamente la latencia de decodificación. El modelo base fue fine-tuned por Florian Zimmermeister sobre datos de habla alemana, logrando un WER de 2,628 % en la mezcla de evaluación German ASR Data-Mix. No se detalla el proceso exacto de fine-tuning (datos, épocas, técnicas de alineación), pero se sabe que el modelo original turbo fue entrenado con dos épocas adicionales sobre los mismos datos de transcripción multilingüe de large-v3, excluyendo datos de traducción.

La exportación a sherpa-onnx se realizó re-exportando el checkpoint PyTorch fine-tuned, no desde espejos ONNX de transformers.js, que son estructuralmente incompatibles con sherpa-onnx. El decoder se exportó con el exportador TorchScript ONNX legacy, ya que el exportador dynamo produce un reshape inválido en la atención cruzada. La cuantización del decoder se hizo per-channel (una escala por canal de salida) en lugar de per-tensor, porque la cuantización per-tensor dinámica en un decoder fine-tuned provoca terminaciones prematuras del transcript; con per-channel, la salida greedy en el conjunto de prueba FLEURS alemán es idéntica a la del decoder fp32.

## Capacidades

- Reconocimiento de voz automatico (ASR) para aleman: transcribe audio a texto con alta precision (WER 2,628 % en la mezcla de evaluacion).
- Soporte de tarea "transcribe" (no traduccion, ya que el modelo turbo no fue entrenado para traduccion).
- Inferencia optimizada para sherpa-onnx: compatible con aplicaciones que usan la libreria OfflineRecognizer.
- Cuantizacion int8 que reduce el uso de memoria y acelera la inferencia en CPU y GPU.
- Vocabulario multilingual estandar de Whisper (51866 tokens), aunque el modelo esta especializado en aleman.
- No incluye capacidades de tool calling, agentes, vision ni audio de entrada adicional (solo voz).

## Casos de uso

- Transcripcion de reuniones y videoconferencias: el modelo puede transcribir en tiempo real conversaciones en aleman, integrandose en aplicaciones de escritorio o web mediante sherpa-onnx. Su baja latencia (gracias a las 4 capas de decoder y la cuantizacion int8) permite un flujo continuo de transcripcion.
- Subtitulado automatico de videos: se puede usar para generar subtitulos en aleman de contenido audiovisual, procesando segmentos de 30 segundos de audio. La precision del 2,6 % de WER lo hace adecuado para produccion profesional.
- Transcripcion de podcasts y entrevistas: ideal para convertir audio largo en texto, con la posibilidad de procesar archivos completos en lotes. El modelo maneja bien el habla espontanea y acentos regionales alemanes.
- Asistentes de voz y comandos por voz: al ser un modelo ligero (809 M parametros en int8), puede ejecutarse en dispositivos con recursos limitados, como Raspberry Pi o moviles, para tareas de dictado o control por voz en aleman.
- Analisis de llamadas de atencion al cliente: en entornos empresariales, el modelo puede transcribir llamadas de soporte en aleman para su posterior analisis de sentimiento o busqueda de informacion, gracias a su integracion con sherpa-onnx en servidores.
- Accesibilidad para personas con discapacidad auditiva: la transcripcion en tiempo real de conversaciones o eventos en aleman puede alimentar sistemas de subtitulado en vivo, mejorando la accesibilidad en conferencias o clases.

## Benchmarks y rendimiento

El autor del modelo base (primeline) publico los siguientes resultados de WER (Word Error Rate) en su evaluacion:

| Dataset | WER (%) |
|---|---|
| Tuda-De | 6,441 |
| common_voice_19_0 | 3,200 |
| multilingual librispeech | 2,070 |
| All (mix) | 2,628 |

Estos valores corresponden al modelo en punto flotante. La version sherpa-onnx con decoder per-channel int8 produce una salida identica a la del decoder fp32 en el conjunto FLEURS aleman, por lo que se espera un rendimiento equivalente en la practica. No se han publicado benchmarks comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- Tamano del modelo: aproximadamente 809 MB en int8 (el repositorio ocupa 1,0 GB incluyendo archivos auxiliares).
- VRAM estimada para inferencia: en GPU, unos 1-2 GB son suficientes para el modelo completo en int8; en CPU, se requiere alrededor de 1 GB de RAM.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1050 Ti, RTX 2060, o superiores). Tambien funciona en CPU con buen rendimiento gracias a la cuantizacion int8.
- Compatible con hardware de bajo consumo: puede ejecutarse en Raspberry Pi 4/5 (con 2-4 GB de RAM) usando sherpa-onnx compilado para ARM.
- Opciones de despliegue: sherpa-onnx (OfflineRecognizer), que soporta CPU, GPU (CUDA) y aceleracion por NPU en algunos dispositivos. No es compatible directamente con vLLM, llama.cpp u Ollama, ya que es un modelo de audio, no de texto.
- Latencia y throughput: no se proporcionan datos exactos, pero al ser un modelo turbo con 4 capas de decoder y cuantizacion int8, la transcripcion de un segmento de 30 segundos suele completarse en menos de 1 segundo en una CPU moderna, y en decenas de milisegundos en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER (aleman) | Licencia | Formato |
|---|---|---|---|---|---|
| pantinor/whisper-large-v3-turbo-german-sherpa | 809 M | 30 s audio | 2,628 % (mix) | Apache 2.0 | ONNX int8 |
| primeline/whisper-large-v3-turbo-german | 809 M | 30 s audio | 2,628 % (mix) | Apache 2.0 | PyTorch / safetensors |
| openai/whisper-large-v3-turbo | 809 M | 30 s audio | no disponible (multilingue) | MIT | PyTorch / safetensors |
| pantinor/whisper-large-v3-turbo-swiss-german-sherpa | 809 M | 30 s audio | no disponible | Apache 2.0 | ONNX int8 |

La principal diferencia con el modelo base es el formato: esta version esta optimizada para sherpa-onnx, lo que facilita su integracion en aplicaciones que ya usan esa libreria. Frente al modelo original de OpenAI, el fine-tuning en aleman mejora significativamente el WER en ese idioma (el modelo multilingue de OpenAI suele tener un WER mas alto en aleman). La version suizo-alemana es un modelo hermano, tambien de pantinor, pero especializado en el dialecto suizo.

## Limitaciones y advertencias

- Especifico para aleman: aunque el vocabulario es multilingual, el fine-tuning esta orientado exclusivamente al aleman estandar. No se recomienda usarlo para otros idiomas, ya que el rendimiento seria muy inferior.
- Sin soporte de traduccion: el modelo turbo no fue entrenado para traduccion, por lo que solo puede transcribir, no traducir.
- Ventana de contexto fija de 30 segundos: el audio se procesa en segmentos de 30 segundos; para audios mas largos, sherpa-onnx los divide automaticamente, pero puede haber perdida de contexto entre segmentos.
- Riesgo de alucinacion: como todos los modelos de ASR, puede generar texto incorrecto en audio con ruido, solapamiento de voces o acentos muy marcados. Se recomienda validar las transcripciones en entornos criticos.
- Cuantizacion int8: aunque el decoder per-channel mantiene la precision, el encoder cuantizado puede introducir ligeras degradaciones en condiciones de audio adversas. Se recomienda probar con datos reales.
- Dependencia de sherpa-onnx: el modelo solo es util dentro del ecosistema sherpa-onnx; no se puede cargar con otras librerias de inferencia sin conversion adicional.
- Sin mantenimiento activo: el repositorio no muestra actividad reciente (creado en agosto de 2026) y no hay issues ni contribuciones, por lo que el soporte puede ser limitado.

## Enlaces

- Repositorio del modelo: https://huggingface.co/pantinor/whisper-large-v3-turbo-german-sherpa
- Modelo base (primeline): https://huggingface.co/primeline/whisper-large-v3-turbo-german
- Modelo original de OpenAI: https://huggingface.co/openai/whisper-large-v3-turbo
- Modelo hermano (suizo-aleman): https://huggingface.co/pantinor/whisper-large-v3-turbo-swiss-german-sherpa
- Repositorio de la comunidad Anti-Vocale: https://github.com/RisorseArtificiali/anti-vocale
- Discusion sobre el release de turbo: https://github.com/openai/whisper/discussions/2363
- Articulo tecnico sobre Whisper large-v3-turbo: https://lawwu.github.io/til/posts/2024-10-02-whisper-v3-turbo/index.html
