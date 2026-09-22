# mlx-community/Confucius4-R2T2-8bit

## Resumen

Confucius4-R2T2-8bit es una conversión a MLX del modelo netease-youdao/Confucius4-R2T2, un ajuste fino orientado a reconocimiento automático del habla (ASR) en streaming de baja latencia sobre Qwen3-ASR-1.7B. Lo publica la organización mlx-community, que se dedica a portar modelos al framework MLX de Apple, y resuelve un problema muy concreto: ejecutar un ASR incremental de tipo "append-only" (el texto solo se añade, nunca se reescribe) en hardware Apple Silicon, sin depender de CUDA ni de servidores remotos.

El modelo original lo desarrolla NetEase Youdao y su rasgo definitorio es el protocolo de prefijo estable: el audio se procesa en fragmentos de 160 ms, se vuelve a alimentar la ventana de audio con el texto ya comprometido como prompt, la salida se corta en el carácter `|`, se retrocede un token y se confirma el resto. Esta conversión cuantiza a 8 bits el modelo de lenguaje Qwen3 (grupo de tamaño 64, affine) y mantiene el codificador de audio AuT en bf16, dando un total de 2.038.052.480 parámetros y un repositorio de 2,5 GB.

Es relevante ahora porque permite desplegar ASR en streaming en un portátil o en un Mac de sobremesa con memoria unificada, con licencia libre de regalías para uso comercial por debajo de umbrales de facturación y usuarios muy altos, y con arquitectura idéntica a Qwen3-ASR, lo que facilita reutilizar los caminos de carga ya existentes en mlx-audio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_asr (transformer: modelo de lenguaje Qwen3 + codificador de audio AuT), idéntica a Qwen/Qwen3-ASR-1.7B |
| Parametros totales | 2.038.052.480 (≈2,04 mil millones) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits, group size 64, affine (solo el modelo de lenguaje); codificador de audio AuT en bf16 |
| Idiomas soportados | chino (zh) e inglés (en) |
| Licencia | NetEase Youdao Model Use License Agreement (license: other; el texto chino de MODEL_LICENSE_zh prevalece) |
| Formato de pesos | safetensors (formato MLX) |
| Tamano del repositorio | 2,5 GB |
| Tarea (pipeline) | automatic-speech-recognition |
| Modelo base | netease-youdao/Confucius4-R2T2 (relación: quantized) |
| Biblioteca | mlx (mlx-audio) |

## Arquitectura y entrenamiento

La arquitectura es `qwen3_asr`, sin cambios estructurales respecto a Qwen/Qwen3-ASR-1.7B: un codificador de audio AuT que transforma la señal en representaciones y un modelo de lenguaje Qwen3 que genera texto condicionado por esas representaciones. El ajuste fino de NetEase Youdao, denominado R2T2, especializa el modelo para decodificación en streaming con protocolo de prefijo estable y política "append-only", es decir, el texto ya emitido no se corrige hacia atrás. En esta conversión, el bloque de lenguaje se cuantiza a 8 bits con grupo de 64 y esquema affine, mientras que el codificador de audio permanece en bf16 (2,3 GB del total).

La conversión la realizó mlx-community con la CLI `mlx_audio.convert` (fork xocialize/mlx-audio en el commit 1792021, mlx 0.32.2) ejecutada sobre el flujo de GPU de un Apple M5 Max. Este detalle importa porque la cuantización de MLX depende del dispositivo, por lo que el autor registra explícitamente la máquina empleada. No se ha publicado en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO para el modelo original.

## Capacidades

- Reconocimiento automático del habla (ASR) en chino e inglés.
- ASR en streaming de baja latencia, con fragmentos de audio de 160 ms.
- Decodificación con protocolo de prefijo estable: recibe la ventana de audio junto con el texto ya comprometido como prompt, corta la salida en `|`, retrocede un token y confirma el resto.
- Política append-only: el texto comprometido no se reescribe, lo que simplifica su consumo en aplicaciones en tiempo real.
- Carga directa mediante los caminos Qwen3-ASR ya existentes en mlx-audio (Python) y mlx-audio-swift.
- Integración con el bucle R2T2 y el paquete `stt` de MLXEngine a través de qwen3-asr-mlx-swift y mlx-r2t2-stt-swift.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente o razonamiento multi-paso: no disponibles; el modelo está especializado en transcripción.
- Capacidades de visión o audio más allá del ASR: no disponibles (el codificador es de audio, orientado a transcripción).

## Casos de uso

- Subtitulado en directo de reuniones y webinars: el modelo emite texto incremental cada 160 ms con política append-only, de modo que los subtítulos ya mostrados no parpadean ni se reescriben, algo crítico en una emisión en vivo.
- Transcripción local en Mac sin enviar audio a la nube: al ejecutarse sobre MLX en Apple Silicon, permite procesar audio confidencial (sanitario, legal, financiero) íntegramente en el dispositivo.
- Asistentes de voz para aplicaciones macOS/iOS: la librería mlx-audio-swift y qwen3-asr-mlx-swift permiten integrar el reconocimiento dentro de una app nativa y alimentar un LLM posterior con el texto parcial.
- Búsqueda y anotación de archivos de audio en dos idiomas: con soporte de chino e inglés, resulta adecuado para indexar grabaciones bilingües, pódcast o atención al cliente en mercados sinohablantes.
- Accesibilidad para personas con discapacidad auditiva: generación de transcripciones en tiempo real en un portátil con memoria unificada, sin infraestructura GPU dedicada.
- Prototipado e investigación en ASR incremental: al mantener la arquitectura `qwen3_asr` intacta, sirve como banco de pruebas para comparar estrategias de commit/rollback frente a los pesos bf16 originales.
- Kioscos y terminales de atención presencial: la ventana de audio corta y el texto ya comprometido reducen el coste de integrar la transcripción en interfaces conversacionales con respuesta inmediata.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio no incluye métricas de WER, CER ni comparaciones cuantitativas con otros sistemas de ASR, y los resultados de la búsqueda web no contenían información relevante sobre el modelo (devolvieron contenidos no relacionados).

## Requisitos de hardware

- VRAM / memoria unificada estimada: el repositorio ocupa 2,5 GB, por lo que la inferencia requiere aproximadamente 3-4 GB de memoria unificada contando pesos, caché de activaciones y buffers de audio.
- Plataforma: MLX es específico de Apple Silicon, así que la ejecución nativa exige un chip de la serie M. La conversión se realizó en un Apple M5 Max.
- GPU recomendadas: cualquier Apple Silicon con memoria unificada suficiente (M1/M2/M3/M4/M5, en configuraciones de 8 GB o superiores). Para GPU NVIDIA o AMD no hay camino de ejecución directo con estos pesos; habría que usar los pesos originales de netease-youdao/Confucius4-R2T2 en PyTorch.
- Cabe en GPU de consumo: sí, en Mac con memoria unificada, dado el tamaño de 2,5 GB del repo. No se dispone de datos para GPU de consumo NVIDIA con este formato.
- Opciones de despliegue: mlx-audio (Python) con `load_model` y `generate`; mlx-audio-swift; qwen3-asr-mlx-swift con su bucle R2T2; paquete `stt` de MLXEngine vía mlx-r2t2-stt-swift; la CLI `mlx_audio.convert` para reproducir la conversión.
- Latencia y throughput: no disponibles de forma cuantitativa. El único dato de latencia estructural es el tamaño de fragmento de streaming de 160 ms, que fija la granularidad mínima de emisión de texto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| mlx-community/Confucius4-R2T2-8bit (este) | 2.038.052.480 | no disponible | ASR streaming, LM a 8 bits, encoder bf16 | zh, en | NetEase Youdao Model Use License Agreement | MLX (Apple Silicon), safetensors |
| netease-youdao/Confucius4-R2T2 (original) | no disponible | no disponible | ASR streaming, pesos sin cuantizar | zh, en | NetEase Youdao Model Use License Agreement | PyTorch / HuggingFace |
| Qwen/Qwen3-ASR-1.7B | ≈1,7 mil millones (solo LM, según denominación) | no disponible | ASR base sin el ajuste R2T2 | no disponible | no disponible | HuggingFace |

No se dispone de datos de rendimiento comparado (WER, latencia, throughput) entre estas alternativas en la información proporcionada, por lo que la comparación se limita a parámetros, formato y licencia.

## Limitaciones y advertencias

- Solo soporta chino e inglés; no se ha declarado soporte de otros idiomas.
- La política append-only implica que el texto ya confirmado no se corrige, lo que puede degradar la calidad final frente a un sistema que revisa hipótesis pasadas.
- El streaming real requiere implementar el bucle R2T2 (fragmentos de 160 ms, corte en `|`, retroceso de un token, commit del resto); usar `generate` sin ese bucle no reproduce el comportamiento en streaming.
- Al ser una conversión cuantizada a 8 bits del modelo de lenguaje, puede haber una pérdida de precisión respecto a los pesos bf16 originales; no se han publicado métricas que la cuantifiquen.
- La cuantización de MLX depende del dispositivo: los pesos se generaron en un Apple M5 Max y ese dato queda registrado, lo que puede afectar a la reproducibilidad en otro hardware.
- Licencia: es libre de regalías, incluido uso comercial, pero exige licencia separada de NetEase Youdao por encima de 100 millones de usuarios activos mensuales o 1.000 millones de RMB de facturación anual (§2.2).
- La licencia prohíbe usar el modelo para mejorar otros modelos de IA comerciales (§3.4 c) y restringe los usos de alto riesgo enumerados (§4.2); además, obliga a los receptores posteriores a los mismos términos (§3.4 a).
- El titular original no respalda ni garantiza las modificaciones de esta obra derivada y declina toda responsabilidad sobre ella.
- Riesgo de alucinación en la transcripción: no se han publicado tasas de error, por lo que en entornos de producción conviene validar con audio propio antes de desplegar.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica una validación comunitaria aún inexistente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mlx-community/Confucius4-R2T2-8bit
- Modelo base: https://huggingface.co/netease-youdao/Confucius4-R2T2
- Modelo Qwen3-ASR-1.7B: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Licencia (texto): https://github.com/netease-youdao/Confucius4-R2T2/blob/master/MODEL_LICENSE
- Bucle R2T2 y motor MLX en Swift: https://github.com/xocialize/qwen3-asr-mlx-swift
- Paquete stt de MLXEngine: https://github.com/xocialize/mlx-r2t2-stt-swift
- Fork de mlx-audio usado en la conversión: https://github.com/xocialize/mlx-audio
- Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces anteriores proceden de la información del repositorio de HuggingFace.
