# cstr/Haas-ja-v1.0-GGUF

## Resumen

Haas-ja-v1.0 es un modelo de reconocimiento automatico del habla (ASR) para japones de aproximadamente 600 millones de parametros, desarrollado por third-intelligence. Combina un encoder FastConformer de 24 capas con un predictor basado en Kimi Delta Attention (KDA) y una red conjunta de tipo Token-and-Duration Transducer (TDT), una arquitectura que sustituye los decoders RNN-T clasicos por atencion lineal recurrente para reducir la latencia de decodificacion.

La version aqui descrita es la cuantizacion GGUF publicada por el usuario cstr para su uso con CrispASR, un runtime de inferencia basado en ggml. El repositorio incluye tres variantes de pesos (q8_0, q4_k y f16) y esta pensado para ejecucion local en CPU, con velocidades declaradas de hasta 11,3x tiempo real en un Apple M1.

Su relevancia radica en que ofrece ASR japones de calidad cercana a la referencia con un peso muy reducido (626 MB en q8_0), lo que permite desplegarlo en portatiles y dispositivos sin GPU dedicada, algo poco habitual en modelos de transcripcion con arquitecturas transducer modernas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer (encoder) + Kimi Delta Attention (predictor) + TDT (joint network) |
| Parametros totales | 615.896.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | q8_0, q4_k, f16 |
| Idiomas soportados | japones (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (ggml); pesos originales en safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transducer en tres bloques. El encoder es un FastConformer de 24 capas con dimension oculta de 1024, 8 cabezas de atencion y subsampling convolucional depthwise separable de factor 8. El predictor sustituye el LSTM habitual de RNN-T por dos capas de atencion lineal recurrente KDA (Kimi Delta Attention), con actualizaciones de estado de rango 1 y RMSNorm con compuertas, orientadas a una autoregresion de baja latencia. La red conjunta es de tipo TDT, que anade tokens de duracion para saltar frames del encoder durante la decodificacion y acelerar la inferencia.

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni el proceso de alineacion. La model card unicamente describe la arquitectura y las cuantizaciones. La innovacion tecnica destacable es la combinacion de KDA con TDT en un modelo de ASR de este tamano, que segun el autor mantiene paridad coseno de 1.000 frente a la implementacion en PyTorch y 0 CER en la variante q8_0.

## Capacidades

- Transcripcion de voz a texto en japones (ASR offline).
- Decodificacion transducer con saltos de frames mediante tokens de duracion (TDT).
- Inferencia en CPU a traves de ggml/CrispASR, sin necesidad de GPU.
- Ejecucion en tiempo real o superior: 11,3x tiempo real en q8_0 y 11,2x en q4_k sobre Apple M1.
- Modelo unicamente de ASR: no genera texto libre, no hace tool calling ni razonamiento multi-paso.
- Soporte multilingue limitado al japones.
- No dispone de modo thinking, vision ni audio generativo.

## Casos de uso

- Transcripcion de reuniones y entrevistas en japones: el modelo procesa audio a 11x tiempo real en CPU, lo que permite transcribir grabaciones largas en portatiles sin GPU.
- Subtitulado de video y podcasts: la baja latencia del predictor KDA y el salto de frames TDT facilitan el procesamiento por streaming en pipelines de postproduccion.
- Asistentes de voz embebidos: con 626 MB en q8_0 y 368 MB en q4_k, cabe en dispositivos con poca memoria y puede integrarse en aplicaciones de escritorio o moviles.
- Archivado y busqueda de contenido audiovisual: transcripcion masiva de archivos japoneses para indexacion y busqueda textual posterior.
- Accesibilidad: generacion de subtitulos automaticos para personas con discapacidad auditiva en contenido en japones.
- Prototipado e investigacion en ASR: al ser Apache 2.0 y ejecutable con CrispASR, sirve como base para experimentos de decoding, cuantizacion o ajuste fino sobre el modelo original en safetensors.
- Transcripcion en entornos sin conectividad: al no requerir servicios en la nube, es adecuado para despliegues on-premise o aislados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (CER/WER sobre corpus publicos) en la informacion disponible. El autor unicamente reporta las siguientes metricas internas:

| Metrica | Valor |
|---|---|
| Paridad coseno q8_0 vs PyTorch | 1.000 |
| CER q8_0 | 0 |
| Velocidad q8_0 en Apple M1 | 11,3x tiempo real |
| Velocidad q4_k en Apple M1 | 11,2x tiempo real |

## Requisitos de hardware

- VRAM/RAM estimada: aproximadamente 626 MB para q8_0, 368 MB para q4_k y 1,18 GB para f16.
- GPU recomendadas: no requeridas; el modelo esta pensado para CPU via ggml. Cualquier GPU con soporte ggml puede acelerar la inferencia, pero no se especifican modelos concretos.
- Cabe en GPU consumer: si, en cualquier GPU con al menos 1-2 GB de memoria libre, aunque el caso de uso principal es CPU.
- Opciones de despliegue: CrispASR (runtime oficial recomendado), que descarga y ejecuta el GGUF directamente. No se menciona soporte para vLLM, TGI, llama.cpp u Ollama en la informacion disponible.
- Latencia y throughput: 11,3x tiempo real en Apple M1 con q8_0; no se aportan datos para otras plataformas.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de comparaciones directas con otros modelos de ASR japones en la informacion proporcionada, por lo que no es posible establecer una comparativa rigurosa de rendimiento. A nivel de categoria, los modelos Whisper (OpenAI) o ReazonSpeech son alternativas habituales para ASR japones, pero no se han facilitado sus metricas en este contexto.

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Haas-ja-v1.0 (este) | 615.896.096 | no disponible | Apache 2.0 | GGUF, safetensors |
| Alternativas ASR japones | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo especializado exclusivamente en japones; no soporta otros idiomas.
- No se han publicado evaluaciones de sesgo ni de robustez ante acentos, ruido o audio espontaneo.
- Riesgo de alucinacion y errores en audio con ruido, solapamiento de hablantes o vocabulario tecnico no visto en entrenamiento.
- No se dispone de informacion sobre la longitud maxima de audio procesable de una sola vez.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base y de las dependencias de CrispASR.
- El modelo GGUF esta vinculado al runtime CrispASR; su uso fuera de ese ecosistema no esta documentado.
- Repositorio con muy pocas descargas (121) y sin likes, lo que limita la validacion por parte de la comunidad.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/cstr/Haas-ja-v1.0-GGUF
- Modelo base: https://huggingface.co/third-intelligence/Haas-ja-v1.0
- Runtime CrispASR: https://github.com/CrispStrobe/CrispASR
