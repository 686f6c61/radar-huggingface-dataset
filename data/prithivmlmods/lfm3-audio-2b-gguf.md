# prithivMLmods/LFM3-Audio-2B-GGUF

## Resumen

LFM3-Audio-2B-GGUF es la cuantización en formato GGUF del modelo LFM3-Audio-2B, un modelo audio-lenguaje any-to-any de tamaño compacto (1,73 mil millones de parámetros) desarrollado por Liquid AI. El repositorio ha sido publicado por el usuario prithivMLmods a partir del modelo base LiquidAI/LFM3-Audio-2B. El modelo resuelve el problema de ejecutar capacidades de voz completas —reconocimiento de habla (ASR), síntesis de voz (TTS), traducción de voz, comprensión de audio, chat por voz y tool calling hablado— en dispositivos locales como portátiles y equipos edge, sin depender de servicios en la nube.

Su relevancia actual radica en la creciente demanda de asistentes de voz que funcionen offline y con baja latencia. Según la model card, su arquitectura de streaming permite un time-to-first-token de hasta 50 ms, y su códec de audio LiquidCodec genera habla a 24 kHz de forma eficiente. El modelo ofrece una ventana de contexto de 32K tokens, soporta 18 idiomas (incluido el castellano) y, según sus autores, supera en varios benchmarks a modelos de mayor tamaño. Está disponible en formatos BF16, GGUF, MLX y ONNX, y es compatible con Transformers, vLLM, SGLang, llama.cpp, MLX-VLM y ONNX Runtime.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo audio-lenguaje any-to-any de Liquid AI (familia LFM3), con códec de audio LiquidCodec a 24 kHz |
| Parametros totales | 1.728.801.600 (1,73 B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | 32K tokens |
| Tipos de cuantizacion | BF16, Q3_K_L, Q3_K_M, Q4_K_M, Q4_K_S, Q5_K_M, Q5_K_S, Q6_K, Q8_0 (además de mmproj-bf16 para el proyector multimodal) |
| Idiomas soportados | 18: en, ar, da, de, el, fi, fr, he, it, ja, ko, nl, pl, pt, es, sv, tr, zh |
| Licencia | LFM Open License v1.0 (lfm1.0, licencia "other") |
| Formato de pesos | GGUF (este repositorio); el modelo base también está disponible en BF16 (safetensors), MLX y ONNX |

## Arquitectura y entrenamiento

LFM3-Audio-2B pertenece a la familia de modelos fundacionales líquidos (Liquid Foundation Models, LFM) de Liquid AI. Es un modelo any-to-any que procesa y genera tanto texto como audio: integra un códec neuronal propio, LiquidCodec, que sintetiza habla a 24 kHz, y una arquitectura de streaming pensada para minimizar la latencia percibida en conversaciones por voz, con time-to-first-token de hasta 50 ms según la model card. El proyector multimodal (mmproj) se distribuye en BF16 dentro del repositorio GGUF y es necesario para las capacidades de audio.

No se han publicado en la información disponible detalles sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas de alineación como RLHF o DPO. Tampoco se especifica si la arquitectura es un transformer convencional, híbrido o de otro tipo; la model card remite a la documentación de Liquid AI para más detalles de despliegue.

## Capacidades

- Reconocimiento de habla (ASR) multilingüe: transcribe audio en cualquiera de los 18 idiomas soportados, con detección automática de idioma o especificación explícita mediante el prompt de sistema `Perform ASR in <language>.`
- Síntesis de voz (TTS): genera habla a 24 kHz mediante LiquidCodec, con selección de idioma (`--tts-lang`) y de voz masculina o femenina (`--tts-voice`) en llama.cpp.
- Traducción de voz: conversión entre idiomas soportados.
- Comprensión de audio: análisis e interpretación de contenido sonoro (pipeline any-to-any).
- Chat por voz conversacional: diálogo multi-turno con entrada y salida de audio.
- Tool calling hablado: invocación de herramientas mediante comandos de voz (58,50 en el benchmark de audio tool calling según la model card).
- Soporte multilingüe: 18 idiomas, incluidos castellano (es), inglés (en), chino (zh), japonés (ja), árabe (ar) y otros.
- Contexto de 32K tokens para conversaciones y transcripciones largas.

## Casos de uso

- Asistentes de voz en dispositivos edge: gracias a su tamaño de 1,73 B de parámetros y a las cuantizaciones Q4 (1,1 GB), puede ejecutarse en portátiles sin GPU dedicada mediante llama.cpp, habilitando asistentes offline con latencia de respuesta muy baja.
- Transcripción automática de reuniones y notas de voz: el ASR multilingüe con 6,03 WER/CER en benchmarks multilingües permite transcribir audio en castellano u otros idiomas de forma local, preservando la privacidad de los datos.
- Generación de locuciones y voz sintética: mediante `llama-tts` se puede generar audio a 24 kHz con voz masculina o femenina para narración de contenidos, prototipado de IVR o accesibilidad.
- Traducción de voz en tiempo casi real: combinando ASR y TTS en un único modelo, se pueden construir flujos de traducción hablada sin encadenar varios servicios.
- Atención al cliente por voz con tool calling: el soporte de tool calling hablado permite que un agente de voz consulte APIs (estado de pedidos, reservas) durante una conversación, con el contexto de 32K tokens para gestionar diálogos largos.
- Análisis de contenido de audio: comprensión de grabaciones, clasificación de audio y extracción de información de material sonoro mediante el pipeline any-to-any.
- Integración en aplicaciones móviles o embebidas: los formatos ONNX y MLX complementan a GGUF para despliegue en iOS (MLX) y entornos multiplataforma (ONNX Runtime).

## Benchmarks y rendimiento

Según la model card del modelo base, LFM3-Audio-2B obtiene los siguientes resultados:

| Benchmark | Resultado |
|---|---|
| ASR multilingüe (WER/CER) | 6,03 |
| ASR inglés (WER) | 6,23 |
| TTS inglés (UTMOSv2) | 3,83 |
| VoiceBench | 73,13 |
| Audio tool calling | 58,50 |
| MMAR | 50,60 |

No se han publicado comparativas numéricas detalladas contra modelos específicos en la información disponible; la model card afirma que supera a varios modelos de mayor tamaño en benchmarks clave, sin detallar cuáles ni con qué puntuaciones.

## Requisitos de hardware

- VRAM / memoria estimada para inferencia (según los tamaños de archivo del repositorio):
  - Q3_K_M: ~915 MB
  - Q4_K_M: ~1,1 GB (recomendada por el autor)
  - Q5_K_M: ~1,26 GB
  - Q6_K: ~1,43 GB
  - Q8_0: ~1,85 GB
  - BF16: ~3,47 GB
  - A estas cantidades hay que sumar el proyector multimodal mmproj-bf16 (571 MB) y la memoria del contexto (32K tokens).
- GPU recomendadas: no disponible (no se publican requisitos oficiales). Dado su tamaño, cualquier GPU moderna con 4-8 GB de VRAM (por ejemplo RTX 3060, RTX 4060 o superiores) ejecuta cómodamente las cuantizaciones Q4-Q8; en BF16 basta una GPU de 8 GB.
- Consumer GPU: sí, cabe en prácticamente cualquier GPU de consumo actual, incluso en portátiles, según la model card, que destaca el despliegue local en laptops y dispositivos edge.
- CPU: al tratarse de GGUF con llama.cpp, la inferencia en CPU puro es viable; con la cuantización Q4_K_M (1,1 GB) cabe en equipos con 8 GB de RAM.
- Opciones de despliegue: llama.cpp (llama-mtmd-cli y llama-tts), Transformers, vLLM, SGLang, MLX-VLM y ONNX Runtime.
- Latencia y throughput: la model card indica un time-to-first-token de hasta 50 ms gracias a la arquitectura de streaming; no se publican cifras de throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Capacidades de audio | Licencia | Formatos |
|---|---|---|---|---|---|
| LFM3-Audio-2B (Liquid AI) | 1,73 B | 32K | ASR, TTS, traducción, chat por voz, tool calling hablado | LFM Open License v1.0 | BF16, GGUF, MLX, ONNX |
| Qwen2-Audio-7B-Instruct (Alibaba) | 7 B | no disponible en la info aportada | ASR, comprensión de audio, chat por voz (sin TTS nativo) | Apache 2.0 (modelo base) / Qwen (Instruct) | safetensors, GGUF comunitario |
| Qwen2.5-Omni-7B (Alibaba) | 7 B | no disponible en la info aportada | Any-to-any: texto, imagen, audio y vídeo, con TTS (Talker) | Qwen Research / restricciones de uso | safetensors, GGUF comunitario |

La principal ventaja de LFM3-Audio-2B frente a estas alternativas es su tamaño (unas 4 veces menor), que lo hace idóneo para edge, y su TTS nativo integrado; a cambio, los modelos de 7 B de Qwen pueden ofrecer mayor capacidad general. Las cifras exactas de contexto y benchmarks de los modelos comparados no constan en la información disponible y no se han inventado.

## Limitaciones y advertencias

- Licencia LFM Open License v1.0: es una licencia "other", no una licencia estándar permisiva. Es imprescindible revisar el texto completo (enlace en la model card de LiquidAI) antes de cualquier uso comercial, ya que puede incluir restricciones de uso o condiciones específicas.
- Sesgos conocidos: no disponible; no se documentan sesgos específicos en la información proporcionada.
- Riesgo de alucinación: como todo modelo audio-lenguaje, puede generar transcripciones o respuestas incorrectas ante audio ruidoso, acentos no representados o contenido ambiguo; se recomienda temperatura 0 para ASR, como sugiere la propia guía de llama.cpp.
- Idiomas: aunque soporta 18 idiomas, la calidad de ASR y TTS puede variar significativamente entre ellos; el castellano está soportado, pero no se publican métricas desglosadas por idioma.
- Contexto: la ventana de 32K tokens es modesta comparada con modelos de texto recientes (128K o más), lo que limita transcripciones o sesiones muy largas en una sola pasada.
- Este repositorio es una cuantización publicada por un tercero (prithivMLmods), no por Liquid AI; el mantenimiento y la verificación de las cuantizaciones dependen del autor del repo.
- Las capacidades TTS en llama.cpp requieren el archivo mmproj y opciones específicas (`--tts-lang`, `--tts-voice`); no todas las herramientas del ecosistema GGUF soportan aún el pipeline any-to-any de audio.
- El modelo usa `custom_code` según sus tags, lo que puede requerir configuración adicional con `trust_remote_code` en Transformers.

## Enlaces

- Repositorio GGUF (esta ficha): https://huggingface.co/prithivMLmods/LFM3-Audio-2B-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM3-Audio-2B
- Licencia LFM Open License v1.0: https://huggingface.co/LiquidAI/LFM3-Audio-2B/blob/main/LICENSE
- Guía de despliegue con llama.cpp de Liquid AI: https://docs.liquid.ai/deployment/on-device/llama-cpp
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
