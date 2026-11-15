# SiliconDioxide/faster-whisper-large-v3-ko-en-v2

## Resumen

SiliconDioxide/faster-whisper-large-v3-ko-en-v2 es una conversión a formato CTranslate2 (float16) del modelo de reconocimiento automático del habla gcasey2/whisper-large-v3-ko-en-v2, un ajuste fino de Whisper large-v3 orientado a los idiomas coreano e inglés. El modelo original parte de la arquitectura transformer encoder-decoder de Whisper de OpenAI, con aproximadamente 1550 millones de parámetros, y ha sido especializado mediante fine-tuning para mejorar la transcripción en coreano e inglés. Esta versión concreta no modifica los pesos: únicamente los convierte al formato optimizado que consume la librería faster-whisper, lo que permite inferencia más rápida y con menor huella de memoria que la implementación original de transformers.

La relevancia de esta ficha radica en que faster-whisper es hoy uno de los backends de facto para desplegar transcripción en producción: al estar en CTranslate2 con cuantización float16, el modelo puede ejecutarse de forma eficiente en GPU de consumo y en CPU, algo crítico para pipelines de subtitulado, actas de reuniones o atención al cliente por voz. El repositorio ocupa 3,1 GB, coherente con los pesos en float16 de un modelo de este tamaño, y se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial.

No obstante, conviene ser prudente: el modelo tiene cero descargas y cero likes en el momento de la consulta, el autor de la conversión no aporta documentación técnica adicional más allá de la model card en coreano, y no se han publicado resultados de benchmarks específicos para este ajuste. Es, por tanto, un artefacto de despliegue útil pero escasamente validado por la comunidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3), convertido a CTranslate2 |
| Parámetros totales | Aproximadamente 1550 millones (heredados de Whisper large-v3; no confirmado explícitamente en la model card) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada (Whisper large-v3 trabaja con ventanas de audio de 30 segundos) |
| Tipos de cuantización | float16 (la conversión publicada); CTranslate2 permite además int8 e int8_float16, pero no se confirma que se hayan generado en este repo |
| Idiomas soportados | Coreano (ko) e inglés (en), según la model card |
| Licencia | Apache 2.0 |
| Formato de pesos | CTranslate2 (model.bin), con tokenizer.json y preprocessor_config.json copiados |

## Arquitectura y entrenamiento

El modelo subyacente es Whisper large-v3, un transformer encoder-decoder entrenado para transcripción y traducción de voz. El encoder procesa espectrogramas log-Mel de audio en ventanas de 30 segundos y el decoder genera tokens de texto de forma autorregresiva con tokens especiales de idioma y de tarea. La variante gcasey2/whisper-large-v3-ko-en-v2 es un fine-tuning de ese checkpoint base sobre datos de coreano e inglés, aunque la información disponible no detalla el volumen de datos, la composición del corpus ni si se aplicaron técnicas de RLHF o DPO (Whisper se entrena de forma supervisada, no con RLHF).

La contribución de este repositorio es exclusivamente de despliegue: se aplicó `ct2-transformers-converter` con `--quantization float16` sobre el checkpoint de gcasey2, copiando `tokenizer.json` y `preprocessor_config.json`. No hay cambios en los pesos ni entrenamiento adicional. La innovación práctica es el uso de CTranslate2, que aplica optimizaciones de kernels y gestión de memoria para acelerar la inferencia respecto a PyTorch, y la integración con faster-whisper, que implementa decodificación con VAD opcional y procesamiento por segmentos.

## Capacidades

- Transcripción automática de voz (ASR) en coreano e inglés.
- Traducción de voz a texto entre coreano e inglés, aprovechando los tokens de tarea de Whisper.
- Detección automática de idioma entre los dos idiomas soportados (con limitaciones, ver sección de limitaciones).
- Generación de marcas de tiempo a nivel de segmento y, opcionalmente, a nivel de palabra mediante faster-whisper.
- Procesamiento de audio en ventanas de 30 segundos con contexto deslizante.
- Integración con VAD (detección de actividad de voz) a través de faster-whisper para segmentar audio largo.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo puramente ASR.
- No dispone de modo thinking, visión ni audio más allá de la entrada de voz para transcripción.

## Casos de uso

- Subtitulado automático de vídeo en coreano e inglés: el modelo genera transcripciones con marcas de tiempo que pueden exportarse a SRT/VTT; faster-whisper permite procesar horas de audio por lotes con VAD para evitar silencios.
- Actas de reuniones bilingües coreano-inglés: la ventana de 30 segundos y el contexto deslizante permiten transcribir conversaciones largas, y la especialización del fine-tuning mejora la precisión en jerga de ambos idiomas frente al Whisper genérico.
- Atención al cliente por voz: integrado en un pipeline de telefonía, el modelo transcribe llamadas en tiempo casi real (con faster-whisper en GPU) para alimentar un sistema de análisis de sentimiento o de resumen posterior.
- Generación de subtítulos para plataformas de e-learning: cursos grabados en coreano con terminología inglesa se transcriben con un único modelo que cubre ambos idiomas, simplificando el pipeline frente a usar dos modelos separados.
- Indexación y búsqueda de archivos de audio: transcripción masiva de podcasts o archivos de audio de archivo para construir índices de texto searchable; el formato CTranslate2 reduce el coste por hora de audio en CPU.
- Accesibilidad en aplicaciones móviles o de escritorio: al poder ejecutarse en CPU con cuantización int8 (generable a partir de este checkpoint), permite transcripción local sin enviar audio a la nube, útil por privacidad.
- Preprocesado para pipelines de NLP: transcripción de entrevistas o encuestas en coreano para posterior análisis con modelos de lenguaje, aprovechando las marcas de tiempo para alinear hablantes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de WER (word error rate) ni comparaciones con Whisper large-v3 original, y el repositorio no contiene evaluaciones. No se deben asumir mejoras de precisión sin datos que las respalden.

## Requisitos de hardware

- VRAM estimada para inferencia en float16: aproximadamente 3-4 GB para los pesos (3,1 GB de repositorio) más overhead de activaciones y buffers de CTranslate2; en la práctica, unos 4-6 GB en GPU.
- GPU recomendadas: NVIDIA RTX 3060 12 GB, RTX 4070, RTX 4090, A100 o H100 para despliegues de alto throughput. Cualquier GPU con al menos 6 GB de VRAM puede ejecutar el modelo en float16.
- Cabe en GPU de consumo: sí, en RTX 3060, RTX 4060 Ti, RTX 4070 y superiores. En GPUs con 4 GB podría requerir cuantización int8.
- Opciones de despliegue: faster-whisper (backend nativo de este formato), CTranslate2 directamente, y servidores compatibles con CT2 como un endpoint propio en Python. No es compatible con vLLM, llama.cpp, Ollama ni TGI, que no soportan el formato CTranslate2 para Whisper.
- Latencia y throughput: no disponibles en la información proporcionada. Como referencia cualitativa, faster-whisper en float16 sobre GPU moderna suele procesar audio varias veces más rápido que tiempo real, pero no se aportan cifras verificadas para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SiliconDioxide/faster-whisper-large-v3-ko-en-v2 | ~1550 M | ko, en | CTranslate2 float16 | Apache 2.0 | Hugging Face, 0 descargas |
| gcasey2/whisper-large-v3-ko-en-v2 (original) | ~1550 M | ko, en | Safetensors/PyTorch | Apache 2.0 (según base) | Hugging Face |
| openai/whisper-large-v3 | ~1550 M | Multilingüe (99 idiomas) | PyTorch, safetensors | Apache 2.0 | Hugging Face, ampliamente usado |
| Systran/faster-whisper-large-v3 | ~1550 M | Multilingüe | CTranslate2 | Apache 2.0 | Hugging Face, backend de referencia |

La comparativa se basa en datos públicos de los modelos citados; no se dispone de métricas de rendimiento comparadas para este checkpoint concreto. La ventaja de esta variante frente a openai/whisper-large-v3 es la especialización en coreano-inglés y el formato optimizado; su desventaja es la falta de validación comunitaria y la cobertura limitada a dos idiomas.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un fine-tuning de Whisper, hereda los sesgos del corpus de entrenamiento original y del corpus de ajuste, no documentado; puede tener peor rendimiento en acentos regionales o en habla con ruido.
- Riesgo de alucinación: Whisper es propenso a generar texto inventado en segmentos con silencio, música o ruido; faster-whisper mitiga parcialmente esto con VAD, pero no lo elimina.
- Limitaciones de idioma: solo coreano e inglés; el uso con otros idiomas producirá transcripciones incorrectas o traducciones no deseadas.
- Limitaciones de contexto: la ventana de audio es de 30 segundos; audios más largos requieren segmentación, y la coherencia entre segmentos puede resentirse en conversaciones con cambios de tema.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del checkpoint base gcasey2, ya que la model card solo declara Apache 2.0 para la conversión.
- Caveat de producción: cero descargas y cero likes implican ausencia de validación externa; se recomienda evaluar el WER en un conjunto propio antes de desplegarlo.
- El repositorio no incluye documentación en inglés ni métricas; la model card está en coreano y es escueta.
- No se garantiza que la conversión float16 preserve exactamente el comportamiento numérico del original en todos los casos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SiliconDioxide/faster-whisper-large-v3-ko-en-v2
- Modelo base: https://huggingface.co/gcasey2/whisper-large-v3-ko-en-v2
- faster-whisper (repositorio): https://github.com/SYSTRAN/faster-whisper
- CTranslate2: https://github.com/OpenNMT/CTranslate2
- Whisper original de OpenAI: https://github.com/openai/whisper
- Modelo Whisper large-v3 en Hugging Face: https://huggingface.co/openai/whisper-large-v3
