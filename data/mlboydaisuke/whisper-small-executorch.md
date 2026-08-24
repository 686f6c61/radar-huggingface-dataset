# mlboydaisuke/Whisper-small-ExecuTorch

## Resumen

Whisper-small-ExecuTorch es una conversión del modelo de reconocimiento de voz Whisper-small de OpenAI a formato ExecuTorch, pensada para ejecución en dispositivos (on-device). El modelo se divide en dos gráficos `.pte` independientes: un encoder que procesa el espectrograma de mel de una ventana de 30 segundos y un decoder que genera cada token de transcripción. Esta separación evita re-encodificar el audio en cada paso de decodificación, algo que ocurriría si se unificaran en un único grafo.

El proyecto lo ha desarrollado el usuario mlboydaisuke, con el objetivo de proporcionar una versión ligera y portable de Whisper-small que pueda desplegarse en entornos con recursos limitados, como teléfonos móviles, dispositivos embebidos o computación de borde. Los archivos `.pte` se pueden ejecutar con el runtime de ExecuTorch, lo que permite inferencia sin depender de PyTorch completo. La licencia es Apache-2.0, lo que facilita su uso comercial.

La relevancia actual radica en la creciente demanda de modelos de ASR que funcionen localmente, sin conexión a la nube, preservando la privacidad y reduciendo latencia. Esta conversión es un ejemplo práctico de optimización de un modelo de 244 millones de parámetros para su despliegue en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper-small) |
| Parametros totales | 244M (Whisper-small) |
| Parametros activos | No disponible |
| Longitud de contexto | Encoder: 30 s de audio (80 mel bins, 3000 frames); decoder: 128 tokens |
| Tipos de cuantizacion | XNNPACK fp32, fp16, int8 (encoder); XNNPACK fp32, fp16 (decoder); Core ML (fp32/fp16) |
| Idiomas soportados | No disponible en la model card (el modelo base Whisper-small soporta multiples idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.pte` (ExecuTorch) |

## Arquitectura y entrenamiento

El modelo base es Whisper-small, entrenado por OpenAI con 680 000 horas de audio etiquetado. La arquitectura es un transformer encoder-decoder estándar, donde el encoder procesa un log-mel espectrograma de 30 segundos y el decoder genera tokens de texto autoregresivamente. En esta conversión a ExecuTorch, se separa el encoder y el decoder en dos gráficos estáticos independientes para evitar re-encodificar el audio en cada paso de decodificación. El decoder no utiliza KV cache; en su lugar, se ejecuta un paso completo sobre una ventana fija de 128 tokens (de ahí que el tamaño del archivo del decoder sea mayor que los pesos del modelo original, debido a la duplicación de la matriz de embeddings para el matmul de salida).

La conversión se realizó con el script `convert/export_whisper.py` del repositorio executorch-models, basado en el ejemplo oficial de ExecuTorch. No se realizó ningún reentrenamiento; solo se exportó el modelo a formato `.pte` con diferentes delegados (XNNPACK, Core ML) y precisiones. Las verificaciones muestran que la composición de ambos gráficos reproduce exactamente el modelo `WhisperForConditionalGeneration` original, con una diferencia máxima absoluta de 0.000e+00 en fp32.

## Capacidades

- Reconocimiento automático de voz (ASR) para ventanas de hasta 30 segundos de audio.
- Soporte de transcripción de audio en múltiples idiomas (heredado del modelo base, aunque la card no lo detalla).
- Decodificación greedy sin KV cache, con generación de tokens hasta el token de fin de secuencia (50257).
- Entradas y salidas en fp32, lo que permite emparejar cualquier encoder con cualquier decoder.
- Compatibilidad con ejecución en dispositivos móviles y embebidos mediante el runtime de ExecuTorch.
- Soporte de cuantización int8 para el encoder (reducción de tamaño y menor latencia).
- Soporte de delegación Core ML para aceleración en hardware de Apple.

## Casos de uso

- **Transcripción en tiempo real en dispositivos móviles**: el modelo puede ejecutarse directamente en un smartphone (iOS o Android) para transcribir reuniones o notas de voz, sin conexión a internet. Gracias al encoder int8 (98,3 MB) y decoder fp32 (774 MB), el par más ligero pesa 405,9 MB, lo que cabe en la mayoría de dispositivos actuales.
- **Asistentes de voz locales**: integración en aplicaciones de asistente personal que necesitan reconocer comandos de voz sin enviar audio a la nube, reduciendo latencia y protegiendo la privacidad del usuario.
- **Subtitulación automática en vídeo**: el modelo puede procesar el audio de vídeos en el propio dispositivo para generar subtítulos al instante, por ejemplo en aplicaciones de edición o plataformas de streaming.
- **Traducción de voz a texto en tiempo real**: aunque no se indica explícitamente, el modelo base Whisper-small soporta traducción, por lo que esta conversión podría usarse para traducir discursos o conversaciones en tiempo real en aplicaciones de viaje o negocios.
- **Accesibilidad**: ayuda a personas con discapacidad auditiva proporcionando transcripción de conversaciones o eventos en tiempo real, todo en el dispositivo.
- **Desarrollo de aplicaciones de productividad**: asistentes de dictado para profesionales que necesitan transcribir entrevistas, conferencias o reuniones sin depender de servicios externos.

## Benchmarks y rendimiento

La model card no incluye benchmarks estándar de ASR (como WER o CER). En su lugar, proporciona métricas de correlación y tiempos de ejecución relativos entre la versión exportada y la eager de PyTorch. La siguiente tabla resume los datos proporcionados:

| Grafo | Delegado | Precisión | Correlación vs fp32 | Tiempo (ms) | Tiempo eager (ms) |
|---|---|---|---|---|---|
| Encoder | XNNPACK fp32 | 1.000000 | 357.4 | 144.7 |
| Encoder | XNNPACK fp16 | 1.000000 | 619.5 | 144.4 |
| Encoder | XNNPACK int8 | 0.998973 | 333.2 | 144.1 |
| Encoder | Core ML | 0.999942 | 95.5 | 143.4 |
| Decoder | XNNPACK fp32 | 1.000000 | 91.2 | 55.3 |
| Decoder | XNNPACK fp16 | 0.999994 | 188.6 | 55.3 |
| Decoder | Core ML | 0.999863 | 13.7 | 55.6 |

Estos tiempos son medias de 5 ejecuciones en un Mac arm64 con ExecuTorch 1.4.0 y torch 2.13.0, y sirven como referencia relativa, no como cifras absolutas de rendimiento en dispositivos específicos. No se han publicado resultados de benchmarks de reconocimiento de voz (WER) en la información disponible.

## Requisitos de hardware

- **VRAM**: no aplica (inferencia en CPU o NPU de dispositivos móviles, no requiere GPU dedicada).
- **GPU recomendadas**: ninguna específica; el modelo está diseñado para ejecutarse en CPU (ARM/x86) y aceleradores de aprendizaje automático de dispositivos móviles (por ejemplo, Neural Engine de Apple, con delegación Core ML).
- **Dispositivos compatibles**: smartphones (iOS/Android), tablets, Raspberry Pi, ordenadores de bajo consumo.
- **Opciones de despliegue**: se puede ejecutar con el runtime de ExecuTorch (C++/Python), integrado en aplicaciones nativas mediante APIs de Executor. No es compatible directamente con vLLM, llama.cpp u Ollama.
- **Latencia**: los tiempos de la tabla indican que en un Mac arm64 el encoder tarda ~95 ms con Core ML y el decoder ~14 ms por token, lo que da una latencia total aproximada de 0,1-0,3 s para una frase corta. En dispositivos móviles la latencia puede variar.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Tamaño de archivo (encoder+decoder) |
|---|---|---|---|---|---|
| Whisper-small-ExecuTorch (este) | 244M | 30 s audio / 128 tokens | `.pte` ExecuTorch | Apache-2.0 | 405,9 MB (fp32 encoder + fp32 decoder) |
| Whisper-tiny-ExecuTorch (mismo autor) | 39M | 30 s audio / 128 tokens | `.pte` ExecuTorch | Apache-2.0 | No disponible (repo de 435 MB) |
| Whisper-small original (OpenAI) | 244M | 30 s audio / 1500 tokens | safetensors (PyTorch) | MIT | ~1 GB (pesos fp32) |

La comparación con Whisper-tiny-ExecuTorch muestra que este modelo ofrece mayor precisión a costa de un tamaño mayor (el encoder int8 de este modelo es de 98 MB, mientras que el de Whisper-tiny es más ligero). Frente al Whisper original, esta conversión elimina la dependencia de PyTorch y facilita el despliegue en dispositivos con recursos limitados, aunque pierde la flexibilidad de decodificación con beam search y el uso de KV cache.

## Limitaciones y advertencias

- **Sin KV cache**: el decoder realiza una pasada completa de 128 posiciones por cada token generado, lo que aumenta la latencia en secuencias largas (aunque cubre hasta 30 s de audio).
- **Solo decodificación greedy**: no se implementa beam search ni sampling, lo que puede reducir la calidad de la transcripción en entornos ruidosos.
- **Ventana de audio fija de 30 s**: para audios más largos hay que segmentar y procesar por ventanas, lo que puede perder contexto.
- **Sin cuantización int8 para el decoder**: solo el encoder tiene versión int8; el decoder en fp32 o fp16 ocupa más espacio.
- **Idiomas no especificados**: aunque el modelo base Whisper soporta muchos idiomas, esta conversión no documenta cuáles se han probado.
- **Riesgo de alucinaciones**: como todos los modelos de ASR, puede generar texto no presente en el audio, especialmente en condiciones de audio bajo o ruido.
- **Licencia Apache-2.0**: permite uso comercial, pero hay que cumplir los términos de atribución y no usar marcas registradas (por ejemplo, OpenAI).

## Enlaces

- [Repositorio HuggingFace: mlboydaisuke/Whisper-small-ExecuTorch](https://huggingface.co/mlboydaisuke/Whisper-small-ExecuTorch)
- [Modelo base: openai/whisper-small](https://huggingface.co/openai/whisper-small)
- [Repositorio executorch-models (scripts de conversión)](https://github.com/john-rocky/executorch-models)
- [Repositorio de ExecuTorch (PyTorch)](https://github.com/pytorch/executorch)
- [Repositorio de Whisper (OpenAI)](https://github.com/openai/whisper)
- [Versión tiny del mismo autor](https://huggingface.co/mlboydaisuke/Whisper-tiny-ExecuTorch)
