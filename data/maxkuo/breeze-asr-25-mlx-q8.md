# Maxkuo/Breeze-ASR-25-mlx-q8

## Resumen

Breeze-ASR-25-mlx-q8 es una conversión a 8 bits (formato MLX) del modelo de reconocimiento automático de voz Breeze-ASR-25, desarrollado originalmente por MediaTek-Research. La conversión ha sido realizada por el usuario Maxkuo y está pensada específicamente para ejecutarse con mlx-whisper en ordenadores Apple Silicon (M1, M2, M3, M4, M5). El modelo base es un Whisper modificado por MediaTek, optimizado para mandarín (incluyendo mezcla de mandarín e inglés) e inglés.

La relevancia de esta versión reside en que reduce a la mitad el tamaño de los pesos respecto a fp16 (1,6 GB frente a unos 3 GB), manteniendo prácticamente idéntica la precisión según las mediciones del propio autor. Esto permite ejecutar un ASR de calidad en portátiles Mac con 16 GB de memoria unificada sin sacrificio apreciable de exactitud, algo útil para transcripción local de reuniones, podcasts o notas de voz en chino e inglés.

La conversión se realizó con la herramienta oficial `convert.py` de los ejemplos de MLX, con cuantización de 8 bits y tamaño de grupo 64, sin ningún ajuste fino posterior. El repositorio incluye un único fichero de pesos (`weights.safetensors`) y la tokenización corre a cargo de la propia librería mlx-whisper.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Whisper (transformer encoder-decoder para ASR), variante Breeze-ASR-25 de MediaTek |
| Parámetros totales | no disponible (pesos cuantizados ocupan 1.644.525.304 bytes, ~1,6 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada de Whisper; típicamente 30 s por ventana de audio) |
| Tipos de cuantización | 8 bits, group size 64 (MLX) |
| Idiomas soportados | Chino (zh) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato MLX para mlx-whisper) |

## Arquitectura y entrenamiento

El modelo base, Breeze-ASR-25 de MediaTek-Research, es un modelo de tipo Whisper (arquitectura transformer encoder-decoder para reconocimiento de voz). Esta versión concreta no incluye entrenamiento adicional: es una cuantización directa de 8 bits con group size 64 del checkpoint original en revisión `cffe7ccb404d025296a00758d0a33468bec3a9d0`, generada con el conversor oficial de MLX.

Los detalles sobre datos de entrenamiento, número de tokens y procesos de ajuste fino del modelo base no están disponibles en la información proporcionada y deben consultarse en la model card de MediaTek-Research/Breeze-ASR-25. Lo que sí documenta el autor de esta conversión es que el proceso es determinista: dos ejecuciones independientes del conversor produjeron exactamente el mismo hash SHA-256, coincidente además con otras dos subidas 8-bit idénticas en Hugging Face.

## Capacidades

- Transcripción automática de voz (ASR) en mandarín e inglés.
- Manejo de habla mixta mandarín-inglés (términos técnicos en inglés dentro de frases en chino), el caso de uso principal para el que MediaTek optimizó Breeze-ASR.
- Transcripción con decodificación greedy y control de temperatura (`temperature=0.0`).
- Integración con mlx-whisper, heredando las funcionalidades del ecosistema Whisper (segmentación por marcas de tiempo, salida por segmentos, etc., según lo que soporte mlx-whisper).
- Ejecución totalmente local en Apple Silicon, sin dependencia de GPU de NVIDIA ni servicios en la nube.

No hay indicios de capacidades de traducción, diarización de hablantes o tool calling en la información disponible.

## Casos de uso

- Transcripción local de reuniones en mandarín: con mlx-whisper en un MacBook (probado en un M5 con 16 GB), se puede transcribir audio de reuniones largas sin enviar datos a la nube; en la prueba del autor se procesó una grabación de 27,6 minutos con CER del 16,17 %.
- Notas de voz con terminología técnica: el modelo está afinado para mandarín con términos en inglés incrustados, ideal para transcribir conversaciones de ingeniería o negocios entre hablantes chinos que mezclan vocabulario inglés.
- Subtitulado de contenido en chino e inglés: la arquitectura Whisper permite transcribir por segmentos, útil para generar subtítulos de vídeos o podcasts.
- Procesamiento por lotes de audio en Mac: al ejecutarse en MLX aprovecha la GPU integrada de Apple Silicon, permitiendo transcribir grandes volúmenes de audio sin coste de API.
- Aplicaciones con requisitos de privacidad: al ser inferencia 100 % local, es adecuado para entornos médicos, legales o corporativos donde el audio no puede salir del dispositivo.
- Prototipado rápido de pipelines de voz en macOS: la integración con mlx-whisper (una llamada a `mlx_whisper.transcribe`) facilita incorporar ASR en scripts y aplicaciones sin configuración compleja.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.) por tratarse de un modelo ASR; no obstante, el autor del repositorio sí publicó mediciones de tasa de error comparando esta versión 8-bit con la original en fp16, medidas en un Apple M5 MacBook Air (16 GB) con decodificación greedy, `language="zh"` y `temperature=0.0`:

| Test | fp16 | 8-bit |
|---|---|---|
| 20 frases leídas, mandarín con términos en inglés (387 tokens) | 4,9 % | 4,9 % |
| ASCEND test, cada tercera utterance (439 utterances) | 17,3 % | 17,3 % |
| AliMeeting R8009_M8018, 27,6 min, CER | 16,15 % | 16,17 % |

La cuantización a 8 bits es prácticamente indistinguible de fp16 en precisión. El autor advierte de que son muestras pequeñas medidas en una sola máquina y recomienda validar sobre audio propio.

## Requisitos de hardware

- Memoria: los pesos ocupan 1,6 GB; con overhead de ejecución, es razonable contar con al menos 8 GB de memoria unificada. El autor lo probó en un MacBook Air M5 con 16 GB.
- Hardware: cualquier Mac con Apple Silicon (M1 o superior) compatible con MLX. No requiere GPU dedicada ni soporte CUDA.
- No cabe el concepto de "consumer GPU" NVIDIA aquí: el objetivo es precisamente prescindir de ella; en Macs de 16 GB funciona con holgura.
- Despliegue: mlx-whisper (versión 0.4.3 usada en la conversión) dentro del ecosistema mlx-examples de Apple. No es un modelo GGUF ni está pensado para llama.cpp, Ollama, vLLM o TGI.
- Latencia y throughput: no disponible en la información proporcionada, aunque la ejecución en MLX sobre GPU integrada de Apple Silicon suele ser adecuada para transcripción en tiempo real o superior en equipos recientes.

## Comparativa con modelos similares

| Modelo | Formato / cuantización | Idiomas | Licencia | Plataforma objetivo |
|---|---|---|---|---|
| Maxkuo/Breeze-ASR-25-mlx-q8 | MLX, 8 bits (group 64) | zh, en | Apache 2.0 | Apple Silicon (mlx-whisper) |
| MediaTek-Research/Breeze-ASR-25 (base) | PyTorch/HF, fp16 | zh, en | Apache 2.0 | Cualquiera (PyTorch, CUDA/CPU) |
| OpenAI Whisper (large-v3) | PyTorch, fp16; conversiones GGUF/MLX de terceros | Multilingüe (~99 idiomas) | MIT | Cualquiera |

Breeze-ASR-25 se diferencia de Whisper large-v3 en su especialización en mandarín (especialmente mandarín con mezcla de inglés), donde supera al modelo base de OpenAI según MediaTek; Whisper, en cambio, cubre muchos más idiomas. Frente al modelo base fp16, esta versión 8-bit ofrece el mismo rendimiento con la mitad de memoria, a costa de estar limitada al ecosistema MLX.

## Limitaciones y advertencias

- Solo dos idiomas: mandarín e inglés. No es adecuado para otros idiomas ni para traducción de voz a texto.
- Limitado al ecosistema MLX: no funciona con transformers de Hugging Face, vLLM ni llama.cpp; requiere mlx-whisper.
- Las mediciones de precisión del autor provienen de muestras pequeñas en una sola máquina (Apple M5) y no deben tomarse como garantía general; el propio autor recomienda validar con audio propio.
- El CER de 16-17 % en conjuntos tipo reuniones (AliMeeting, ASCEND) indica que el modelo comete errores apreciables en audio difícil (solapamiento de hablantes, espontáneo); no esperes precisión de producción sin validación.
- No hay diarización de hablantes incluida: para reuniones multi-hablante habría que combinarlo con herramientas adicionales.
- Riesgo de alucinaciones típico de la familia Whisper en silencios largos o audio ruidoso; el uso de `temperature=0.0` y segmentación ayuda a mitigarlo.
- Licencia Apache 2.0: sin restricciones relevantes para uso comercial.
- Repositorio de un particular con muy pocas descargas (42 en el momento de la ficha); carece del respaldo de un mantenedor oficial, aunque el hash SHA-256 coincide con otras conversiones idénticas publicadas.

## Enlaces

- Modelo cuantizado (esta ficha): https://huggingface.co/Maxkuo/Breeze-ASR-25-mlx-q8
- Modelo base: https://huggingface.co/MediaTek-Research/Breeze-ASR-25
- mlx-whisper (ejemplos oficiales de MLX): https://github.com/ml-explore/mlx-examples/tree/main/whisper
- Repositorio de ejemplos MLX: https://github.com/ml-explore/mlx-examples
