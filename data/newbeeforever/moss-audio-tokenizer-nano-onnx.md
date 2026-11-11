# newbeeforever/MOSS-Audio-Tokenizer-Nano-ONNX

## Resumen

MOSS-Audio-Tokenizer-Nano-ONNX es la exportación a formato ONNX del tokenizador de audio neuronal MOSS-Audio-Tokenizer-Nano, desarrollado por el equipo OpenMOSS (Universidad de Fudan). Se trata de un códec neuronal ligero de aproximadamente 20 millones de parámetros que convierte forma de onda de audio en códigos discretos y viceversa, y que actúa como columna vertebral del sistema de síntesis de voz MOSS-TTS-Nano. Esta versión ONNX, publicada por el usuario newbeeforever, permite ejecutar el tokenizador sin PyTorch, únicamente con ONNX Runtime o ONNX Runtime Web.

El modelo está pensado para escenarios de despliegue de bajo coste: inferencia en CPU local y ejecución directamente en el navegador. Soporta audio a 48 kHz en estéreo con una tasa de tokens de 12,5 Hz y 16 libros de cuantización residual vectorial (RVQ), manteniendo una calidad de reconstrucción perceptual alta. Es relevante ahora porque habilita pipelines de TTS completamente libres de PyTorch cuando se combina con MOSS-TTS-Nano-100M-ONNX, lo que simplifica el despliegue en entornos web y dispositivos sin GPU.

La ficha describe la exportación ONNX; los detalles de arquitectura interna, entrenamiento y benchmarks proceden de la familia MOSS-Audio-Tokenizer y de los informes técnicos citados por el autor, no de una evaluación independiente de esta exportación concreta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Códec neuronal de audio (encoder/decoder con cuantización residual vectorial, RVQ); detalles internos de capas no disponibles |
| Parametros totales | ~20M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (tasa de tokens de 12,5 Hz; ventana en segundos no especificada) |
| Tipos de cuantizacion | no disponible (exportación ONNX con pesos externos; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (tokenizador de audio independiente del idioma) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (grafos con pesos externos en ficheros `.data`) |
| Frecuencia de muestreo | 48 kHz, estéreo |
| Tasa de tokens | 12,5 Hz |
| Libros de código RVQ | 16 |
| Tamano del repositorio | 0,1 GB |
| Backends soportados | ONNX Runtime (CPU), ONNX Runtime Web (navegador) |

## Arquitectura y entrenamiento

MOSS-Audio-Tokenizer-Nano es un códec neuronal de audio basado en cuantización residual vectorial (RVQ) con 16 libros de código, que opera sobre audio a 48 kHz en estéreo y produce una secuencia de tokens a 12,5 Hz. La variante Nano reduce el coste de inferencia respecto a los modelos mayores de la familia MOSS-Audio-Tokenizer manteniendo, según el autor, una calidad perceptual alta en la reconstrucción a distintos bitrates. La exportación ONNX separa el grafo en cuatro piezas: un encoder (forma de onda a códigos discretos), un decoder completo (códigos a forma de onda), un decoder por pasos para decodificación incremental en streaming y un fichero de metadatos para integración en navegador.

No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron técnicas de RLHF o ajuste fino preferencial. Tampoco se documentan innovaciones específicas de atención o decodificación especulativa. La información técnica de referencia se remite al informe técnico de MOSS-Audio-Tokenizer (arXiv:2602.10934) y al de MOSS-TTS (arXiv:2603.18090), citados por el autor, pero sus contenidos no se detallan en la model card.

## Capacidades

- Codificación de audio: convierte forma de onda PCM a 48 kHz estéreo en secuencias de códigos discretos con 16 libros RVQ a 12,5 Hz.
- Decodificación de audio: reconstruye forma de onda de alta fidelidad a partir de los códigos discretos, con soporte de decodificación completa y decodificación incremental por pasos (streaming).
- Ejecución sin PyTorch: inferencia con ONNX Runtime en CPU y con ONNX Runtime Web en navegador.
- Integración con TTS: sirve como códec complementario de MOSS-TTS-Nano-100M-ONNX para un pipeline de síntesis de voz completamente ONNX.
- Independencia de idioma: al ser un tokenizador acústico, no está ligado a un idioma concreto (no se documentan idiomas específicos).
- No incluye generación de texto, razonamiento, código, matemáticas, visión, tool calling ni capacidades de agente; es exclusivamente un códec de audio.

## Casos de uso

- Síntesis de voz en el navegador: combinado con MOSS-TTS-Nano-100M-ONNX y ONNX Runtime Web, permite generar y reproducir voz en el cliente sin backend de GPU, usando el decoder por pasos para streaming incremental.
- Aplicaciones de accesibilidad en web: lectura de texto a voz directamente en el navegador para lectores de pantalla o asistentes, sin enviar audio a servidores externos.
- Compresión y transmisión de audio: la tasa de 12,5 Hz con 16 libros RVQ permite representar audio a 48 kHz estéreo en una secuencia de tokens compacta, útil para almacenamiento o transmisión de baja latencia.
- Procesamiento de audio en CPU local: despliegue en servidores sin GPU o en dispositivos de borde usando onnxruntime, reduciendo el coste de infraestructura frente a un stack PyTorch.
- Preprocesado para pipelines de modelos de audio: tokenización de audio para alimentar modelos de lenguaje de audio o sistemas de comprensión que trabajen sobre tokens discretos.
- Prototipado de códecs y evaluación de calidad: al ser ligero (~20M parámetros) y de licencia Apache 2.0, sirve para experimentar con reconstrucción a distintos bitrates y para integrar en demos web interactivas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el caso principal; el modelo está diseñado para CPU y navegador. Con ~20M parámetros, el peso en memoria es del orden de decenas de MB en precisión completa, aunque no se documenta el tamaño exacto de los pesos ONNX.
- GPU recomendadas: no se especifican; el despliegue objetivo es CPU (onnxruntime) y navegador (onnxruntime-web). Cualquier GPU compatible con ONNX Runtime podría ejecutarlo, pero no hay datos de rendimiento.
- Cabe en GPU de consumo: sí, por tamaño (~20M parámetros), aunque el caso de uso declarado es CPU y navegador.
- Opciones de despliegue: ONNX Runtime (CPU), ONNX Runtime Web (navegador); junto con MOSS-TTS-Nano-100M-ONNX para el pipeline completo de TTS.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Frecuencia / tasa | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| MOSS-Audio-Tokenizer-Nano-ONNX | ~20M | 48 kHz, 12,5 Hz, 16 RVQ | ONNX | Apache 2.0 | Exportación sin PyTorch, CPU y navegador |
| MOSS-Audio-Tokenizer-Nano (PyTorch) | ~20M | 48 kHz, 12,5 Hz, 16 RVQ | PyTorch | Apache 2.0 | Implementación original, requiere PyTorch |
| Otros códecs neuronales (p. ej. EnCodec, SoundStream) | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de reconstrucción con alternativas de la misma categoría.

## Limitaciones y advertencias

- Es un códec de audio, no un modelo de lenguaje: no genera texto, no razona y no soporta tool calling ni agentes.
- No se documentan sesgos específicos, pero al ser un códec puede introducir artefactos o pérdida de fidelidad en señales fuera de su dominio de entrenamiento (no detallado).
- Riesgo de artefactos de reconstrucción en bitrates bajos o en audio con características acústicas poco representadas en el entrenamiento; no hay datos públicos de evaluación.
- No se especifican los idiomas ni dominios de audio cubiertos; el rendimiento puede variar según el tipo de señal (voz, música, ruido).
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar los términos de los modelos y repositorios de la familia MOSS-TTS citados.
- Esta exportación concreta tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validación comunitaria ni de pruebas independientes.
- El repositorio depende de ficheros de pesos externos (`.data`), por lo que hay que descargar el conjunto completo para que los grafos ONNX funcionen.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/newbeeforever/MOSS-Audio-Tokenizer-Nano-ONNX
- Modelo original PyTorch: https://huggingface.co/OpenMOSS-Team/MOSS-Audio-Tokenizer-Nano
- TTS companion ONNX: https://huggingface.co/OpenMOSS-Team/MOSS-TTS-Nano-100M-ONNX
- MOSS-TTS-Nano (PyTorch): https://huggingface.co/OpenMOSS-Team/MOSS-TTS-Nano
- Repositorio MOSS-TTS-Nano: https://github.com/OpenMOSS/MOSS-TTS-Nano
- Repositorio MOSS-Audio-Tokenizer: https://github.com/OpenMOSS/MOSS-Audio-Tokenizer
- Informe técnico MOSS-TTS: https://arxiv.org/abs/2603.18090
- Informe técnico MOSS-Audio-Tokenizer: https://arxiv.org/abs/2602.10934
