# Ar4ikov/VibeVoice-ASR-Streaming-7B-AWQ-W4A16-ASYM

## Resumen

VibeVoice-ASR-Streaming-7B-AWQ-W4A16-ASYM es una cuantización INT4 del modelo de reconocimiento automático del habla (ASR) en streaming microsoft/VibeVoice-ASR-Streaming-7B, publicada por el usuario Ar4ikov. El modelo base es un sistema ASR extremo a extremo basado en un LLM que transcribe "quién dijo qué" a medida que llega el audio, sin una etapa separada de diarización. Esta versión reduce los pesos de 17,348 GB a 7,000 GB (2,48 veces más pequeño) mediante una búsqueda de escalas AWQ con reconocimiento de activaciones, no por simple redondeo a entero más cercano.

La cuantización afecta a las 196 proyecciones de atención y MLP del componente Qwen2, que quedan en 4 bits asimétricos con tamaño de grupo 128 y activaciones de 16 bits. Los embeddings, codificadores de voz, conectores, normalizaciones y sesgos se conservan en BF16. El decodificador acústico original se ha eliminado por completo, lo que ahorra 687,4 MB y convierte el checkpoint en un modelo exclusivamente de ASR: no sirve para síntesis de voz.

Es relevante porque permite ejecutar un ASR con atribución de hablante y capacidad de streaming en GPUs de consumo con un consumo de memoria muy reducido: las capas del modelo de lenguaje ocupan 3306 MB en GPU frente a 12446 MB en BF16. En una RTX 3090 alcanza un factor de tiempo real (RTF) de 0,034-0,036 y unas 150 palabras por segundo en tokens, con una tasa de error de palabra del 2,53 % sobre el mismo conjunto de validación del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen2 con codificadores de voz VibeVoice y decodificacion streaming (ASR extremo a extremo) |
| Parametros totales | 8.330.325.888 (8,33 mil millones) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el protocolo streaming procesa ventanas de 22 + 4 frames) |
| Tipos de cuantizacion | INT4 AWQ W4A16 asimetrico, group size 128, activaciones de 16 bits; embeddings, codificadores de voz, conectores, normas y sesgos en BF16; escalas de grupo en FP16 |
| Idiomas soportados | 10 idiomas (segun la documentacion del modelo base); no se detallan en esta ficha |
| Licencia | MIT |
| Formato de pesos | safetensors (reempaquetado AWQ GEMM: qweight, qzeros, scales) |

## Arquitectura y entrenamiento

Se trata de una cuantizacion, no de un entrenamiento desde cero. El modelo de partida es microsoft/VibeVoice-ASR-Streaming-7B, revision 60d858b518b4e19d404af3737f848fc185b30177. La arquitectura base combina un modelo de lenguaje Qwen2 con codificadores de voz que procesan audio a 24 kHz mono. El protocolo de streaming intercala fragmentos de audio de tamano fijo, una pequena cantidad de audio de prelectura (lookahead) y el texto previo, de modo que el modelo emite texto para cada 2,93 s de audio conforme llega, con 0,53 s de prelectura.

La cuantizacion se realizo con llm-compressor mediante una busqueda AWQ genuina con reconocimiento de activaciones: 40 puntos de rejilla, `duo_scaling="both"` y semilla 42. La calibracion utilizo 256 secuencias de un maximo de 2048 filas cada una, procesadas a traves de `inputs_embeds` para que las representaciones de voz reales formen parte de los datos: 128 sesiones de streaming completas en el protocolo propio del modelo (LibriSpeech dev-clean, 32 hablantes, streams de 15 a 150 s, un tercio de ellos alternando dos hablantes) y 128 conversaciones de Ultrachat para la ruta generica del modelo de lenguaje. Las caracteristicas de voz se obtuvieron con los codificadores del checkpoint BF16 en FP32 usando el latente acustico determinista. El checkpoint calibrado en formato compressed-tensors se reempaqueta sin perdida en AWQ GEMM estandar, sin una segunda pasada de cuantizacion. Se elimino el decodificador `model.acoustic_tokenizer.decoder.*`, no utilizado en la ruta de ASR.

## Capacidades

- Reconocimiento automatico del habla en streaming: emite texto de forma incremental, con un segmento de salida por cada 2,93 s de audio y 0,53 s de prelectura, sin esperar al final del audio.
- Diarizacion integrada: atribuye hablante mediante etiquetas en linea con el formato ` \n Speaker N:`, sin una etapa externa de separacion de hablantes.
- Soporte de hotwords personalizadas para sesgar el reconocimiento hacia terminos concretos (por ejemplo, nombres propios o jerga).
- Soporte multilingue: el modelo base cubre 10 idiomas.
- Transcripcion de audio en vivo desde microfono mediante la interfaz `vv_cli mic`.
- Servicio de streaming por HTTP con Server-Sent Events (`stream=true`) y WebSocket en `/v1/audio/stream`, con soporte de multiples ranuras (`--slots 8`).
- Reconocimiento sin normalizacion de sonoridad: el audio de entrada no se normaliza en volumen (`normalize_audio` en false).

## Casos de uso

- Subtitulacion en directo de reuniones y conferencias: el modelo emite texto cada 2,93 s con etiquetas de hablante, de modo que se puede generar un transcript con marcas de "quien hablo" en tiempo real sin postprocesar una etapa de diarizacion aparte.
- Transcripcion de atencion al cliente: con ranuras multiples en el servidor (`--slots 8`) y WebSocket, se pueden atender varias conversaciones simultaneas y generar registros con atribucion de hablante para auditoria o analitica.
- Asistentes de voz con baja latencia: al procesar el audio conforme llega y no tras el final, encaja en interfaces conversacionales donde el usuario espera ver el texto mientras habla.
- Accesibilidad en tiempo real para personas con discapacidad auditiva: transcripcion continua con identificacion de interlocutor en la misma pantalla, alimentada desde microfono.
- Indexacion y busqueda de archivos de audio: transcripcion por lotes de grabaciones largas con `vv_cli`, almacenando el JSON resultante para busqueda de texto completo sobre contenido de audio.
- Despliegue en hardware de gama de consumo: gracias a los 3306 MB de las capas del modelo de lenguaje en GPU, cabe en GPUs con 8-12 GB de VRAM, lo que permite transcripcion local sin depender de servicios en la nube.
- Generacion de actas y resumenes posteriores: el transcript con hablantes sirve de entrada a un pipeline de resumen que necesita saber quien dijo cada intervencion.
- Reconocimiento con vocabulario especifico: uso de hotwords personalizadas para dominios tecnicos, medicos o legales donde los terminos raros se transcriben mal por defecto.

## Benchmarks y rendimiento

Regresion de reconocimiento sobre 12 streams reservados de LibriSpeech dev-clean (9,7 minutos, 1579 palabras de referencia, 8 hablantes excluidos de la calibracion; etiquetas `Speaker N:` y puntuacion eliminadas antes de puntuar):

| Ruta | Errores de palabra | WER |
|---|---:|---:|
| Original BF16, PyTorch, protocolo streaming original | 43 | 2,72 % |
| Archivos AWQ finales desempaquetados para PyTorch | 39 | 2,47 % |
| Original BF16, `vibevoice.c --quant none` | 44 | 2,79 % |
| Archivos AWQ finales, INT4 nativo en `vibevoice.c` | 40 | 2,53 % |

Velocidad con vibevoice.c sobre RTX 3090 (kernels W4A16 nativos, sin desquantizar a FP16):

| Audio | AWQ, `--attn flashinfer` | AWQ, `--attn fa2` | BF16 `--quant none` |
|---|---|---|---|
| 11 s | RTF 0,035, 152 tok/s | RTF 0,035, 152 tok/s | RTF 0,071, 56 tok/s |
| 30 s | RTF 0,036, 151 tok/s | RTF 0,036, 150 tok/s | RTF 0,076, 56 tok/s |
| 120 s | RTF 0,034, 149 tok/s | RTF 0,035, 143 tok/s | RTF 0,074, 56 tok/s |

Memoria en GPU de las capas del modelo de lenguaje: 3306 MB (AWQ) frente a 12446 MB (BF16). El autor indica que esta es una comprobacion de regresion sobre ingles leido, no un benchmark representativo de calidad: no se han medido la precision multilingue, el audio con ruido ni la calidad de diarizacion tras la cuantizacion.

## Requisitos de hardware

- VRAM estimada: las capas del modelo de lenguaje ocupan 3306 MB en GPU en AWQ. El repositorio completo pesa 7,0 GB, que es una cota superior holgada para el conjunto de pesos.
- GPU recomendadas: el autor ha validado sobre RTX 3090. Usa kernels nativos W4A16 y `flashinfer` (atencion por defecto para este modelo) o FA2.
- Cabe en GPU de consumo: si. Con 3306 MB de capas del modelo de lenguaje, un modelo asi cabe en GPUs de 8-12 GB de VRAM como RTX 3060 12 GB, RTX 3080, RTX 4070, RTX 4080 y RTX 4090, ademas de la RTX 3090 validada.
- Opciones de despliegue: `vibevoice.c` es la via soportada (`vv_cli` para archivo y microfono, y `vv_cli serve` para streaming por SSE y WebSocket). El despliegue con vLLM no fue probado por el autor. La arquitectura personalizada no es compatible con `AutoModelForCausalLM` estandar sin integracion especifica de VibeVoice, y las integraciones deben tolerar la ausencia de los pesos no usados del decodificador acustico.
- Latencia y throughput estimados: en RTX 3090, RTF de 0,034-0,036 y 149-152 tok/s en AWQ, frente a RTF de 0,071-0,076 y 56 tok/s en BF16.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Rendimiento (WER LibriSpeech dev-clean) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Ar4ikov/VibeVoice-ASR-Streaming-7B-AWQ-W4A16-ASYM | 8,33 B | INT4 AWQ W4A16 asimetrico | No disponible | 2,53 % (INT4 nativo), 2,47 % (desempaquetado a PyTorch) | MIT | HuggingFace, 13 descargas, 0 likes |
| microsoft/VibeVoice-ASR-Streaming-7B (BF16) | No disponible | BF16 | No disponible | 2,72 % (PyTorch), 2,79 % (vibevoice.c) | No disponible en esta ficha | HuggingFace |
| Ar4ikov/VibeVoice-ASR-AWQ-W4A16-ASYM | No disponible | INT4 AWQ W4A16 asimetrico | No disponible | No disponible | No disponible en esta ficha | HuggingFace |

No se dispone de datos comparativos con modelos ASR de otra familia (por ejemplo, Whisper) dentro de la informacion proporcionada.

## Limitaciones y advertencias

- La validacion se limita a ingles leido sobre LibriSpeech dev-clean. No se han medido la precision multilingue, el rendimiento con audio ruidoso ni la calidad de diarizacion tras la cuantizacion.
- Es un checkpoint exclusivamente de ASR: el decodificador acustico de sintesis de voz ha sido eliminado, por lo que no puede generar audio.
- La arquitectura personalizada no es compatible con `AutoModelForCausalLM` estandar; requiere integracion de VibeVoice. El despliegue con vLLM no fue probado.
- Las integraciones existentes deben tolerar la ausencia de los pesos no utilizados del decodificador acustico.
- El audio no se normaliza en sonoridad (`normalize_audio` en false), lo que puede afectar al reconocimiento con volumenes muy dispares.
- Es un modelo con muy poca traccion: 13 descargas y 0 likes en el momento de redactar esta ficha, sin validacion independiente por parte de terceros.
- Aunque la licencia MIT permite uso comercial, el modelo derivado cuantizado y la eliminacion del decodificador pueden afectar a la trazabilidad respecto al modelo original; conviene verificar la licencia del modelo base de Microsoft antes de un despliegue en produccion.
- Riesgo de alucinacion inherente a los modelos de lenguaje: en pasajes con silencio, solapamiento de hablantes o ruido, el modelo puede generar texto no presente en el audio.
- La atribucion de hablante puede degradarse cuando hay multiples voces simultaneas o cambios frecuentes de interlocutor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Ar4ikov/VibeVoice-ASR-Streaming-7B-AWQ-W4A16-ASYM
- Modelo base: https://huggingface.co/microsoft/VibeVoice-ASR-Streaming-7B
- Coleccion VibeVoice-ASR Quantized: https://huggingface.co/collections/Ar4ikov/vibevoice-asr-quantized
- Variante no streaming del mismo autor: https://huggingface.co/Ar4ikov/VibeVoice-ASR-AWQ-W4A16-ASYM
- Repositorio vibevoice.c: https://github.com/Ar4ikov/vibevoice.c
- Documentacion de VibeVoice-ASR-Streaming en GitHub: https://github.com/microsoft/VibeVoice/blob/main/docs/vibevoice-asr-streaming.md
- Modelo VibeVoice-ASR-Streaming-7B en la organizacion vibevoice: https://huggingface.co/vibevoice/VibeVoice-ASR-Streaming-7B
- Informe tecnico VibeVoice-ASR-Streaming: https://arxiv.org/html/2609.02812v2
- Pagina del informe tecnico (Yujie Tu): https://alextyj.github.io/publication/2026-09-03-vibevoice-asr-streaming
