# santhosh63/whisper-tamil-large-web

## Resumen

`santhosh63/whisper-tamil-large-web` es una exportación a ONNX del modelo `vasista22/whisper-tamil-large-v2`, un ajuste fino de OpenAI Whisper large-v2 especializado en reconocimiento automático del habla (ASR) en tamil. El autor de la exportación, santhosh63, lo publica con el objetivo declarado de permitir la inferencia directamente en el navegador mediante transformers.js, dentro de una aplicación llamada SANSA Voice to Text.

El modelo hereda la arquitectura encoder-decoder transformer de Whisper large-v2 (aproximadamente 1.550 millones de parámetros en su versión original) y el ajuste fino realizado por vasista22 sobre múltiples corpus ASR públicos en tamil, en el marco del Whisper fine-tuning sprint. La exportación a ONNX con la librería transformers.js es lo que diferencia a este repositorio del modelo base: no se trata de un nuevo entrenamiento, sino de un artefacto de despliegue orientado a entornos web sin backend.

Su relevancia radica en que permite ejecutar un modelo ASR de gran tamaño para tamil sin infraestructura de servidor, algo poco habitual en el ecosistema de modelos para lenguas del sur de la India. El repositorio ocupa 3,6 GB y se distribuye bajo licencia Apache 2.0. No obstante, la información publicada es mínima: no hay idiomas declarados, no hay métricas de evaluación en la model card y el contador de descargas y likes es cero en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v2) |
| Parametros totales | no disponible (el modelo base Whisper large-v2 tiene ~1.550 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper large-v2 usa ventanas de audio de 30 s) |
| Tipos de cuantizacion | no disponible (exportación ONNX; el repo no detalla variantes) |
| Idiomas soportados | no disponible (el ajuste fino es específico para tamil) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (compatible con transformers.js) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper large-v2: un transformer encoder-decoder con atención completa, entrenado originalmente por OpenAI para transcripción multilingüe y traducción de voz. El encoder procesa espectrogramas mel de audio en ventanas de 30 segundos y el decoder genera tokens de texto de forma autorregresiva. El ajuste fino de `vasista22/whisper-tamil-large-v2` se realizó sobre datos tamil procedentes de múltiples corpus ASR públicos, en el contexto del Whisper fine-tuning sprint.

La contribución de este repositorio concreto es la conversión del checkpoint ajustado a formato ONNX para su ejecución con transformers.js. No se documentan en la información disponible detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset, el uso de RLHF/DPO ni innovaciones técnicas adicionales más allá de la propia exportación. Tampoco se especifica qué variantes de cuantización ONNX se incluyen ni el proceso de conversión seguido.

## Capacidades

- Reconocimiento automático del habla (ASR) en tamil, a partir de audio de entrada.
- Transcripción de voz a texto mediante pipeline `automatic-speech-recognition`.
- Ejecución en navegador mediante transformers.js y pesos ONNX, sin necesidad de backend.
- Integración en aplicaciones web de voz a texto (el autor la usa en SANSA Voice to Text).
- Procesamiento por ventanas de audio de 30 segundos, herencia de la arquitectura Whisper.
- No se documentan capacidades de traducción, diarización, tool calling, agentes ni modo thinking.

## Casos de uso

- Transcripción de voz a texto en aplicaciones web: el modelo puede ejecutarse íntegramente en el navegador gracias a la exportación ONNX y transformers.js, lo que permite ofrecer dictado o subtitulado en tamil sin enviar audio a un servidor.
- Herramientas de accesibilidad para hablantes de tamil: subtitulado en tiempo casi real de vídeos, reuniones o contenido multimedia directamente en el cliente, reduciendo la dependencia de servicios cloud.
- Procesamiento de audio con requisitos de privacidad: al ejecutarse en local en el navegador, el audio no sale del dispositivo del usuario, lo que encaja en escenarios sanitarios, legales o periodísticos con datos sensibles.
- Prototipado rápido de interfaces de voz: desarrolladores que necesiten validar una UX de voz en tamil pueden desplegar el modelo con transformers.js sin montar infraestructura de inferencia.
- Investigación en ASR para lenguas de bajos recursos: sirve como punto de partida reproducible para comparar el rendimiento del ajuste fino tamil de Whisper large-v2 en entornos web frente a despliegues con servidor.
- Aplicaciones offline o de conectividad limitada: una vez cacheado el modelo en el navegador, la transcripción puede funcionar sin conexión, útil en contextos con red intermitente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye métricas de WER, CER ni comparaciones, y la información de búsqueda sobre el modelo base tampoco aporta cifras concretas.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. El repositorio ocupa 3,6 GB en formato ONNX; la inferencia en navegador depende del backend (WebGPU o WASM) y de la variante de cuantización cargada.
- GPU recomendadas: no especificadas por el autor. Para ejecución en servidor con el modelo base en FP16 se requiere del orden de 3-4 GB de VRAM, aunque esta cifra no está confirmada en la información disponible para esta exportación.
- GPU de consumo: un modelo de este tamaño puede caber en GPUs de consumo con 8 GB o más si se usa una variante cuantizada, pero no hay datos publicados que lo confirmen para este repositorio.
- Opciones de despliegue: transformers.js en navegador (objetivo principal); el formato ONNX también puede ejecutarse con ONNX Runtime en servidor, aunque no se documenta.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto audio | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| santhosh63/whisper-tamil-large-web | ~1.550 M (base) | ventanas de 30 s | Apache 2.0 | ONNX | Hugging Face, transformers.js |
| vasista22/whisper-tamil-large-v2 | ~1.550 M | ventanas de 30 s | no disponible en la informacion | safetensors/PyTorch | Hugging Face |
| JairamKanna/whisper-large-v2-tamil | ~1.550 M | ventanas de 30 s | no disponible en la informacion | safetensors/PyTorch | Hugging Face |
| openai/whisper-large-v2 | ~1.550 M | ventanas de 30 s | MIT (modelo original) | PyTorch | Hugging Face |

Los tres modelos tamil derivan de Whisper large-v2 y comparten arquitectura y tamaño; la diferencia principal de esta ficha es el formato ONNX orientado a navegador. No hay datos de rendimiento comparativo disponibles para establecer diferencias de precisión entre ellos.

## Limitaciones y advertencias

- El ajuste fino está orientado exclusivamente al tamil; el comportamiento en otros idiomas no está documentado y probablemente sea deficiente.
- No se publican métricas de WER ni evaluación, por lo que el rendimiento real es desconocido.
- Riesgo de alucinación inherente a los modelos Whisper, especialmente en audio con ruido, silencios largos o habla solapada.
- La ventana de procesamiento de 30 segundos implica que audios largos requieren segmentación y pueden sufrir errores en las fronteras.
- No se documentan sesgos específicos, pero al derivar de Whisper large-v2 hereda los sesgos del entrenamiento original.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base y de los corpus de entrenamiento originales, no detallada aquí.
- El repositorio tiene cero descargas y cero likes, sin validación comunitaria conocida; la exportación ONNX no está acompañada de pruebas publicadas.
- El tamaño de 3,6 GB puede ser elevado para carga en navegador, especialmente en conexiones lentas o dispositivos móviles.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/santhosh63/whisper-tamil-large-web
- Modelo base: https://huggingface.co/vasista22/whisper-tamil-large-v2
- Alternativa tamil: https://huggingface.co/JairamKanna/whisper-large-v2-tamil
- transformers.js: https://github.com/huggingface/transformers.js
