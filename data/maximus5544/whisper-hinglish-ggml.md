# maximus5544/whisper-hinglish-ggml

## Resumen

El modelo `maximus5544/whisper-hinglish-ggml` es una adaptación del sistema de reconocimiento de voz Whisper, optimizado específicamente para el habla en hinglish (mezcla coloquial de hindi e inglés, muy común en el sur de Asia). Está desarrollado por el usuario maximus5544 y se distribuye bajo licencia Apache 2.0. El repositorio contiene los pesos en formato GGML, pensados para su uso con el runtime `whisper.cpp`, lo que permite ejecutar el modelo en CPU y en dispositivos con recursos limitados.

El modelo parte de la base de `shunyalabs/zero-stt-hinglish` (un fine-tuning de Whisper para hinglish) y se convierte al formato GGML para integrarse en el ecosistema `ggerganov/whisper.cpp`. Aunque la información pública es escasa, su propósito principal es ofrecer transcripción de audio en hinglish con baja latencia y sin necesidad de GPU dedicada. El tamaño del repositorio (1,5 GB) sugiere que podría tratarse de una variante de tamaño medio o grande, aunque no se especifica.

La relevancia actual radica en la creciente demanda de ASR para lenguas de la India, donde el hinglish es el registro dominante en contenidos digitales. Este modelo facilita su despliegue en entornos de producción ligeros, como servidores sin GPU o aplicaciones embebidas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | no disponible (Whisper usa ventanas de 30 s de audio) |
| Tipos de cuantizacion | GGML (cuantizacion integrada en whisper.cpp) |
| Idiomas soportados | hinglish (hindi e ingles, mezcla) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGML (binario de whisper.cpp) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper, un modelo transformer encoder-decoder entrenado originalmente por OpenAI para reconocimiento de voz multilingue. El encoder procesa espectrogramas de Mel de ventanas de 30 segundos y el decoder genera el texto transcrito de forma autorregresiva. El modelo aquí presentado es un fine-tuning de `shunyalabs/zero-stt-hinglish`, que a su vez fue ajustado sobre Whisper para mejorar el reconocimiento del hinglish, un registro con code-switching frecuente entre hindi e inglés.

Los detalles de entrenamiento (número de tokens, composición del dataset, técnicas de fine-tuning como RLHF o DPO) no están disponibles en la información publicada. El repositorio solo contiene los pesos convertidos a GGML, sin documentación adicional sobre el proceso de entrenamiento o los datos utilizados.

## Capacidades

- Transcripción de voz en hinglish: reconoce audio hablado en la mezcla hindi-inglés típica de conversaciones informales.
- Reconocimiento de voz multilingue limitado: al ser un fine-tuning de Whisper, conserva cierta capacidad para otros idiomas, aunque su especialización es el hinglish.
- Procesamiento de audio en ventanas de 30 segundos: alineado con el diseño original de Whisper.
- Inferencia en CPU: gracias al formato GGML, puede ejecutarse en hardware sin GPU mediante whisper.cpp.
- Sin soporte de tool calling, agentes o razonamiento multi-paso: es un modelo puramente de ASR, no un LLM conversacional.

## Casos de uso

- Transcripción de reuniones y llamadas en entornos empresariales indios: el modelo puede convertir grabaciones de audio en hinglish a texto para generar actas o búsquedas internas, aprovechando su ejecución ligera en servidores CPU.
- Subtitulado automático de vídeos en plataformas de streaming: se integra en pipelines de postproducción para generar subtítulos en hinglish de contenido audiovisual, reduciendo costes frente a servicios en la nube.
- Asistentes de voz para aplicaciones móviles: al poder ejecutarse en dispositivos con recursos modestos, permite el reconocimiento de comandos de voz en hinglish sin depender de conexión a internet.
- Análisis de llamadas de atención al cliente: transcripción de grabaciones para extraer métricas de calidad y detectar problemas recurrentes, con la ventaja de manejar el registro coloquial hinglish.
- Herramientas de accesibilidad: conversión de contenido hablado en hinglish a texto para personas con discapacidad auditiva, en entornos sin infraestructura GPU.
- Archivado y búsqueda de contenido multimedia: indexación de archivos de audio y vídeo mediante transcripción, permitiendo búsquedas por texto en repositorios de medios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como WER (Word Error Rate) en hinglish ni comparaciones con otros modelos ASR.

## Requisitos de hardware

- VRAM: no requiere GPU para inferencia; puede ejecutarse exclusivamente en CPU.
- RAM: dependiendo del tamaño del modelo (no especificado), se estima entre 1 y 4 GB para cargar los pesos en memoria.
- GPU recomendada: no necesaria; si se desea aceleración, cualquier GPU con soporte CUDA puede usarse a través de whisper.cpp, pero no es imprescindible.
- Compatibilidad con hardware de consumo: sí, funciona en portátiles y mini-PCs con CPU x86 o ARM.
- Opciones de despliegue: whisper.cpp (línea de comandos), bindings para Python, integración con servidores de transcripción como faster-whisper (si se convierte a otro formato) o servidores HTTP personalizados.
- Latencia y throughput: no disponibles, pero al ser GGML y ejecutarse en CPU, la latencia será mayor que en GPU; para un modelo de tamaño medio se espera un factor de tiempo real de 1-3x en CPUs modernas.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa rigurosa. Como referencia, existen otros modelos Whisper fine-tuned para hinglish como `shunyalabs/zero-stt-hinglish` (del que deriva este) y modelos multilingues genéricos como `openai/whisper-large-v3`. Sin embargo, no se dispone de datos de rendimiento comparativos para este modelo concreto.

## Limitaciones y advertencias

- La información pública es muy limitada: no se documentan los datos de entrenamiento, el tamaño exacto del modelo ni los resultados de evaluación, lo que dificulta validar su calidad.
- Sesgos potenciales: al ser un fine-tuning sobre un dataset no especificado, puede tener sesgos hacia ciertos acentos, géneros o registros del hinglish, y un rendimiento deficiente en variantes menos representadas.
- Riesgo de alucinación en transcripción: como todo sistema ASR, puede generar texto incorrecto en segmentos de audio ambiguos o con ruido de fondo.
- Limitaciones de contexto: Whisper procesa ventanas de 30 segundos; no maneja audio de mayor duración de forma nativa, requiriendo segmentación previa.
- Restricciones de licencia: aunque la licencia es Apache 2.0, el modelo base Whisper original tiene su propia licencia (MIT para el código, pero los pesos tienen términos de uso de OpenAI). El fine-tuning aquí presentado no aclara la compatibilidad total.
- Sin soporte para otros idiomas: su especialización en hinglish puede degradar el rendimiento en hindi o inglés puros, o en otros idiomas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/maximus5544/whisper-hinglish-ggml
- Modelo base (fine-tuning original): https://huggingface.co/shunyalabs/zero-stt-hinglish
- Runtime whisper.cpp: https://github.com/ggerganov/whisper.cpp
