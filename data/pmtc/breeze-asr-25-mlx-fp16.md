# PMTC/Breeze-ASR-25-mlx-fp16

## Resumen

Breeze-ASR-25-mlx-fp16 es una conversión a formato MLX y precisión fp16 del modelo de reconocimiento automático del habla MediaTek-Research/Breeze-ASR-25, un ajuste fino de Whisper-large-v2 orientado a mandarín taiwanés, inglés y habla con alternancia de código (code-switching) entre ambos idiomas. La conversión la publica el usuario PMTC con un objetivo muy concreto: ejecutar la inferencia en dispositivo (on-device) dentro de SettleVoice, una aplicación que usa mlx-audio-swift sobre Apple Silicon. No es, por tanto, un modelo nuevo ni un reentrenamiento, sino un reempaquetado de pesos.

El interés de la ficha está en la utilidad práctica del artefacto: permite usar un Whisper-large-v2 especializado en mandarín de Taiwán dentro del ecosistema MLX, con los nombres de claves que espera `mlx-whisper` y un `tokenizer.json` que el repositorio original no incluye. Para quien despliegue ASR en Macs o en iOS, eso elimina el trabajo de conversión previo y evita depender de PyTorch en producción.

Técnicamente es un transformer encoder-decoder de aproximadamente 1.541 millones de parámetros (1,54 B), con ventanas de audio de 30 segundos por segmento, y licencia Apache 2.0 heredada del modelo base. Los pesos no se han modificado más allá del casteo a float16.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper-large-v2), con capas convolucionales de preprocesado y embeddings posicionales sinusoidales en el encoder |
| Parametros totales | 1.541.384.960 (aproximadamente 1,54 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventana de audio de 30 s por segmento; 448 tokens de decodificacion y 1500 posiciones en el encoder (arquitectura Whisper) |
| Tipos de cuantizacion | fp16 en este repositorio; no se publican variantes int8/int4 ni GGUF |
| Idiomas soportados | zh (mandarin taiwanes) e ingles, incluida la alternancia zh-en |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, con claves renombradas al esquema `mlx_whisper` (por ejemplo `encoder.blocks.N.attn.query`, `decoder.positional_embedding`) |
| Modelo base | MediaTek-Research/Breeze-ASR-25 (a su vez, fine-tune de Whisper-large-v2) |
| Libreria de inferencia | MLX (mlx-audio-swift, mlx-whisper) |
| Tamano del repositorio | 3,1 GB |
| Pipeline | automatic-speech-recognition |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper-large-v2: un encoder convolucional seguido de un transformer encoder de 32 capas que procesa espectrogramas mel de 80 canales en ventanas de 30 segundos, y un decoder autorregresivo que genera tokens de texto con marcas de tiempo. Sobre esa base, MediaTek Research realizó un ajuste fino supervisado para ASR en mandarín taiwanes e ingles, incluyendo audio con mezcla de idiomas dentro de la misma frase. No se dispone en la información proporcionada de detalles sobre el volumen de tokens de audio, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO; para el modelo base, la model card de referencia remite a la ficha de MediaTek Research.

Esta conversión concreta no altera el entrenamiento. Los cambios documentados por el autor son mecánicos: casteo de los pesos a float16, renombrado de claves al esquema de `mlx-community/whisper-*` para que `mlx-audio-swift` los cargue directamente, eliminación de las posiciones sinusoidales del encoder (se recalculan en tiempo de ejecución) y generación de un `tokenizer.json` a partir del `vocab.json` y `merges.txt` del repositorio original, que no incluía tokenizer en formato Hugging Face. El script de conversión está en `scripts/convert_whisper_hf_to_mlx.py` del repositorio SettleVoice.

## Capacidades

- Transcripción de audio a texto en mandarín taiwanés e inglés, con soporte de habla que alterna ambos idiomas en una misma intervención.
- Detección y uso de marcas de tiempo aproximadas por segmento, propias del decoder de Whisper.
- Traducción al inglés desde el audio de entrada (capacidad nativa de la familia Whisper, heredada del modelo base).
- Procesamiento por segmentos de 30 segundos, lo que permite dividir audios largos en trozos y encadenar resultados.
- Inferencia local en Apple Silicon mediante MLX, sin necesidad de GPU dedicada ni de servicio remoto.
- Integración en apps Swift a través de mlx-audio-swift, y en Python a través de mlx-whisper.
- No soporta tool calling, function calling, razonamiento multi-paso ni capacidades de agente: es un modelo puramente ASR.
- No incluye visión, audio generation, diarización de hablantes ni detección de eventos sonoros.

## Casos de uso

- Dictado por voz en aplicaciones de notas para macOS e iOS: la app captura audio del micrófono, lo pasa al modelo en local y devuelve texto sin enviar datos a la nube. El tamaño de 3,1 GB en fp16 permite incluirlo como recurso descargable opcional en lugar de embeberlo en el binario.
- Transcripción de reuniones bilingües en empresas con presencia en Taiwán: el modelo maneja intervenciones que mezclan mandarín y terminología técnica en inglés, un escenario donde Whisper estándar suele forzar un único idioma por segmento y degradar el resultado.
- Subtitulado offline de vídeo corporativo o formativo en mandarín taiwanés: se segmenta la pista de audio en ventanas de 30 s, se transcribe y se usan las marcas de tiempo para generar ficheros SRT.
- Asistentes de voz para atención al cliente en el mercado taiwanés: el ASR alimenta un pipeline posterior de NLU o un LLM; la inferencia local reduce coste por minuto y latencia de red, y la licencia Apache 2.0 permite uso comercial.
- Accesibilidad en tiempo real: subtítulos generados en el dispositivo para personas con discapacidad auditiva en entornos donde no hay conectividad o no se permite enviar audio a terceros.
- Preprocesado de corpus de audio para entrenamiento de otros modelos: generar transcripciones a gran escala de material en mandarín taiwanés con un modelo especializado en esa variante, ejecutándolo en una flota de Macs en lugar de GPUs.
- Investigación en code-switching: uso como línea base reproducible en MLX para experimentos de ASR bilingüe sin depender de CUDA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de esta conversión no incluye métricas de WER ni comparaciones, y remite explícitamente a la ficha del modelo base de MediaTek Research para el comportamiento y las limitaciones. Tampoco se aportan datos de latencia o throughput. No se deben asumir cifras de WER para mandarín taiwanés sin consultar la documentación del modelo original.

## Requisitos de hardware

- VRAM/memoria unificada: los pesos en fp16 ocupan aproximadamente 3,08 GB (el repositorio suma 3,1 GB). Con buffers de activación y espectrogramas, conviene reservar entre 4 y 6 GB de memoria unificada según la longitud del audio.
- Cabe en Apple Silicon de gama consumer: cualquier Mac con 8 GB de memoria unificada o más puede cargarlo; 16 GB dan margen cómodo para lotes pequeños o procesos concurrentes.
- GPU dedicadas: al ser un artefacto MLX, el destino natural es Apple Silicon (series M1, M2, M3, M4 y variantes Pro/Max/Ultra). Para A100, H100 o RTX 4090 habría que usar los pesos originales en PyTorch o transformarlos a otro runtime.
- Opciones de despliegue: mlx-audio-swift para apps Swift/iOS/macOS, mlx-whisper en Python. vLLM y TGI no aplican a este formato. No se distribuye GGUF, por lo que llama.cpp y Ollama no pueden consumirlo tal cual sin una conversión adicional.
- Latencia y throughput: no disponibles en la información proporcionada. Dependen del chip, de la longitud del audio y del tamaño de lote; a modo de referencia cualitativa, un modelo de 1,54 B en fp16 es ligero para MLX, pero no se aportan cifras verificables.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada / contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PMTC/Breeze-ASR-25-mlx-fp16 | 1,54 B | audio 30 s, 448 tokens de decodificacion | zh, en | Apache 2.0 | MLX safetensors en Hugging Face |
| MediaTek-Research/Breeze-ASR-25 | 1,54 B | audio 30 s, 448 tokens de decodificacion | zh, en | Apache 2.0 | Pesos originales en Hugging Face (PyTorch) |
| openai/whisper-large-v2 | aproximadamente 1,55 B | audio 30 s, 448 tokens de decodificacion | multilingue (amplia cobertura) | MIT | Hugging Face, whisper.cpp, multiples runtimes |
| openai/whisper-large-v3-turbo | aproximadamente 0,81 B | audio 30 s, 448 tokens de decodificacion | multilingue | MIT | Hugging Face, whisper.cpp, multiples runtimes |

No se dispone de cifras de WER comparativas verificadas en la información proporcionada, por lo que la comparación se limita a parámetros, cobertura idiomática, licencia y disponibilidad. La ventaja diferencial de este repositorio no es la calidad del reconocimiento, sino el formato: empaquetado MLX listo para usar con tokenizer incluido.

## Limitaciones y advertencias

- Es un modelo exclusivamente ASR: no genera texto libre, no razona, no ejecuta herramientas y no debe evaluarse como un LLM.
- Cobertura idiomática reducida a mandarín taiwanés e inglés. El rendimiento en mandarín continental, cantonés u otras lenguas sinohablantes no está documentado y puede degradarse.
- Riesgo conocido de alucinación de Whisper en silencios, ruido de fondo o música: el decoder puede emitir frases plausibles que no corresponden al audio. Es recomendable aplicar detección de voz (VAD) y filtros de confianza posteriores.
- Las marcas de tiempo son aproximadas y pueden desviarse en audios largos o con cambios bruscos de hablante.
- Sin diarización: no distingue interlocutores. Cualquier caso de uso con múltiples hablantes requiere un componente adicional.
- Procesa ventanas de 30 segundos; audios más largos necesitan segmentación y unión de resultados, con el riesgo de cortes en palabras a mitad de segmento.
- El artefacto está atado al ecosistema MLX y a Apple Silicon. No hay pesos GGUF ni versiones para CUDA en este repositorio; migrar a otro runtime exige convertir los pesos originales.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria ni informes independientes de calidad sobre esta conversión concreta. El comportamiento es responsabilidad del modelo de MediaTek Research, como indica el propio autor.
- Licencia Apache 2.0, que permite uso comercial y modificación con atribución y conservación del aviso de licencia. Conviene verificar igualmente las condiciones del modelo base y de Whisper-large-v2 (MIT) en la cadena de procedencia.
- El `tokenizer.json` se generó de forma derivada a partir de `vocab.json` y `merges.txt`; es prudente validar la tokenización con una muestra antes de desplegar en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/PMTC/Breeze-ASR-25-mlx-fp16
- Modelo base: https://huggingface.co/MediaTek-Research/Breeze-ASR-25
- Proyecto SettleVoice (incluye el script de conversión `scripts/convert_whisper_hf_to_mlx.py`): https://github.com/philomath-app/settle-voice
- Whisper-large-v2 de OpenAI (arquitectura de partida): https://huggingface.co/openai/whisper-large-v2
