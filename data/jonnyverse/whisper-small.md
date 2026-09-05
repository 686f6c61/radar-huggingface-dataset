# JONNYVERSE/whisper-small

## Resumen

JONNYVERSE/whisper-small es una conversión a formato ONNX del modelo openai/whisper-small, creada por el usuario JONNYVERSE con el objetivo de hacerlo compatible con Transformers.js, la librería JavaScript de Hugging Face para ejecutar modelos de IA en el navegador o en Node.js. El modelo original de OpenAI es un sistema de reconocimiento automático de voz (ASR) basado en la arquitectura Transformer encoder-decoder, entrenado para transcribir audio en múltiples idiomas. Esta adaptación no modifica los pesos del modelo, sino que los exporta a ONNX para que puedan ejecutarse directamente en entornos JavaScript sin necesidad de un backend en Python.

El repositorio en Hugging Face tiene un tamaño de 7,4 GB y no registra descargas ni "likes" en el momento de la consulta. La licencia es Apache 2.0, la misma que la del modelo base. La relevancia de esta publicación radica en que permite a desarrolladores web integrar transcripción de voz de forma local y sin dependencias externas, aprovechando la infraestructura de Transformers.js.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (Transformer encoder-decoder) |
| Parametros totales | 244M (modelo base openai/whisper-small) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 30 segundos de audio (aprox. 448 frames de mel-spectrogram) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo base es multilingüe, pero no se especifica en esta conversión) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo es una réplica exacta de openai/whisper-small en cuanto a arquitectura y pesos. Whisper es un Transformer encoder-decoder entrenado por OpenAI con más de 680.000 horas de audio supervisado para tareas de reconocimiento de voz y traducción. El encoder procesa espectrogramas de Mel de 80 canales y el decoder genera tokens de texto de forma autorregresiva. Esta versión concreta no añade ningún cambio arquitectónico ni entrenamiento adicional: la única modificación es la exportación de los pesos a formato ONNX para que sean consumibles por Transformers.js. El proceso de conversión se realizó con la herramienta Optimum de Hugging Face, tal como se indica en la model card.

## Capacidades

- Reconocimiento automático de voz (ASR) y transcripción de audio en tiempo real o por lotes.
- Compatibilidad con el pipeline `automatic-speech-recognition` de Transformers.js, lo que permite usarlo con una única línea de código en JavaScript.
- Ejecución en el navegador mediante WebGPU o WebAssembly, y en Node.js sin necesidad de servicios externos.
- Soporte de entrada de audio desde URL, archivos locales o buffers de audio.
- Multilingüe en el modelo base, aunque esta conversión no documenta explícitamente los idiomas soportados.
- No soporta tool calling, razonamiento multi-paso ni otras capacidades propias de los modelos de lenguaje de gran tamaño.

## Casos de uso

- Transcripción de reuniones en el navegador: una aplicación web puede capturar el audio del micrófono y transcribirlo en tiempo real, mostrando el texto generado en la interfaz. El modelo funciona localmente, por lo que no se envían datos a servidores externos.
- Subtitulado automático de vídeos: en una plataforma de vídeo, se puede procesar el audio de cada clip y generar subtítulos en el cliente. Al ser una conversión ONNX, se puede integrar directamente en el frontend sin infraestructura adicional.
- Dictado en herramientas de productividad: una aplicación de notas o editor de texto puede incluir un botón de dictado que utilice el modelo para convertir voz en texto, con soporte para múltiples idiomas heredado del modelo base.
- Análisis de llamadas de atención al cliente: un sistema Node.js puede recibir grabaciones de llamadas, transcribirlas con este modelo y alimentar un pipeline de análisis posterior para extraer sentimiento o temas recurrentes.
- Accesibilidad en aplicaciones web: para personas con discapacidad auditiva, se pueden generar subtítulos en directo de cualquier contenido de audio que se reproduzca en la página, sin necesidad de un servicio de transcripción externo.
- Herramientas para periodistas e investigadores: una aplicación de escritorio basada en web puede importar entrevistas o audios largos y transcribirlos, permitiendo búsquedas dentro del texto generado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- No se proporcionan datos de VRAM estimada ni de GPU recomendadas en la información disponible.
- El tamaño del repositorio es de 7,4 GB, lo que indica que los pesos ONNX ocupan un espacio considerable, probablemente en precisión FP32.
- Al ser un modelo de 244M parámetros, podría ejecutarse en GPU de consumo como una RTX 3060, pero no hay datos oficiales de latencia o throughput.
- Opciones de despliegue: Transformers.js en navegador o Node.js; también podría convertirse a otros formatos como GGUF para llama.cpp, aunque no está incluido en el repositorio.
- No se conocen cifras de latencia ni de throughput para este modelo convertido.

## Comparativa con modelos similares

| Modelo | Formato | Licencia | Tamaño del repo | Parámetros |
|---|---|---|---|---|
| JONNYVERSE/whisper-small | ONNX | Apache 2.0 | 7,4 GB | 244M |
| openai/whisper-small | PyTorch | Apache 2.0 | no disponible | 244M |
| JONNYVERSE/whisper-tiny | ONNX | Apache 2.0 | no disponible | 39M |

La comparación se basa en datos disponibles en los repositorios de Hugging Face. El modelo JONNYVERSE/whisper-tiny es una conversión similar del modelo whisper-tiny de OpenAI, también para Transformers.js. No se dispone de datos de rendimiento ni de benchmarks para comparar de forma cuantitativa.

## Limitaciones y advertencias

- El repositorio no especifica los idiomas soportados, aunque el modelo base openai/whisper-small es multilingüe.
- No se han publicado resultados de benchmarks ni evaluaciones de calidad, por lo que se desconoce si la conversión a ONNX introduce alguna degradación en el rendimiento.
- El modelo no ha sido validado por la comunidad: tiene 0 descargas y 0 "likes" en Hugging Face.
- La fecha de creación del repositorio aparece como 2026-09-04, lo que resulta inusual y podría indicar un error en los metadatos.
- Al tratarse de una conversión de pesos, el modelo hereda las limitaciones del modelo base, como posibles sesgos en el reconocimiento de acentos o dialectos poco representados.
- La licencia Apache 2.0 permite uso comercial, pero es responsabilidad del usuario revisar las condiciones de la licencia original del modelo base y las dependencias de Transformers.js.
- No se ofrecen garantías de soporte ni mantenimiento por parte del autor.

## Enlaces

- Repositorio del modelo: https://huggingface.co/JONNYVERSE/whisper-small
- Modelo base: https://huggingface.co/openai/whisper-small
- Documentación de Transformers.js: https://huggingface.co/docs/transformers.js
- Conversión similar de whisper-tiny: https://huggingface.co/JONNYVERSE/whisper-tiny
