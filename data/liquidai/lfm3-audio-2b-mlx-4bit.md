# LiquidAI/LFM3-Audio-2B-MLX-4bit

## Resumen

LFM3-Audio-2B-MLX-4bit es la variante cuantizada a 4 bits en formato MLX del modelo multimodal de audio LFM3-Audio-2B, desarrollado por Liquid AI. Se trata de un modelo "any-to-any" de aproximadamente 1.980 millones de parametros que procesa y genera tanto texto como audio, lo que le permite realizar tareas de reconocimiento automatico del habla (ASR), sintesis de voz (TTS) y conversacion voz-a-voz. Esta version esta pensada especificamente para ejecucion en Apple Silicon mediante la libreria MLX y el framework MLX-VLM.

El modelo resuelve el problema de desplegar capacidades de audio de extremo a extremo en hardware de consumo: los pesos cuantizados ocupan 1,58 GB, a los que se suman 0,15 GB del codec de audio incluido en el directorio `audio_tokenizer/`. Frente a la version de 8 bits, esta variante de 4 bits es la mas pequena y compacta, a costa de cierta perdida de precision que el propio autor reconoce.

Su relevancia actual radica en que permite flujos de voz completos (transcripcion, sintesis y dialogo hablado) de forma local en un Mac, sin depender de APIs en la nube, con soporte declarado para 18 idiomas, entre ellos el espanol. La licencia es la LFM Open License v1.0 (lfm1.0), que conviene revisar antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal de audio; el backbone de lenguaje usa cuantizacion afin de 4 bits con grupos de 64) |
| Parametros totales | 1.977.548.032 |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (MLX); existe variante oficial de 8 bits |
| Idiomas soportados | en, ar, da, de, el, fi, fr, he, it, ja, ko, nl, pl, pt, es, sv, tr, zh |
| Licencia | lfm1.0 (LFM Open License v1.0) |
| Formato de pesos | safetensors (MLX), mas codec de audio en `audio_tokenizer/` |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna completa del modelo base; la model card remite a la ficha original de LFM3-Audio-2B para los detalles de arquitectura y uso. Lo que si se especifica es el esquema de cuantizacion de esta variante MLX: el backbone de lenguaje emplea cuantizacion afin de 4 bits con grupos de 64, salvo el embedding de tokens (que tambien actua como capa de salida) y las proyecciones value y feed-forward down de las capas que llama.cpp eleva a Q4_K_M, que se mantienen en 6 bits. El encoder de audio, el proyector de audio, el decodificador de profundidad y el embedding de codebook permanecen en BF16, y el codec de audio es el original sin cuantizar.

No se dispone de datos sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se documentan innovaciones tecnicas especificas mas alla del propio esquema de cuantizacion mixta descrito. Para cualquier detalle adicional de entrenamiento debe consultarse la model card del modelo base.

## Capacidades

- Reconocimiento automatico del habla (ASR): transcripcion de audio a texto mediante prompts de sistema como "Perform ASR in English".
- Sintesis de voz (TTS): generacion de audio a partir de texto, con seleccion de idioma y voz mediante prompt de sistema (por ejemplo, voz femenina en ingles americano).
- Conversacion voz-a-voz: respuesta con texto y audio intercalados a partir de una entrada de audio.
- Procesamiento any-to-any: combinacion de entradas y salidas de texto y audio en una misma interaccion.
- Soporte multilingue en 18 idiomas, incluido el espanol.
- Parametros de generacion de audio configurables: `audio_temperature`, `audio_top_k` y `audio_repetition_penalty`.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades de vision: no disponibles (el modelo es de audio y texto).

## Casos de uso

- Transcripcion local de reuniones en un Mac: el modelo convierte audio a texto con un prompt de sistema de ASR, sin enviar datos a servicios externos, lo que resulta adecuado para entornos con requisitos de privacidad.
- Subtitulado y generacion de actas: a partir de grabaciones, se obtiene la transcripcion y se procesa el texto resultante en el mismo flujo, aprovechando que el modelo maneja entrada de audio y salida de texto.
- Asistentes de voz en aplicaciones de escritorio para macOS: el modo voz-a-voz con salida de audio intercalada permite construir interfaces conversacionales habladas integradas en apps nativas de Apple Silicon.
- Sintesis de voz para accesibilidad: generacion de TTS en varios idiomas (incluido el espanol) para lectores de pantalla o avisos hablados, con control de voz mediante prompt de sistema.
- Prototipado de agentes conversacionales multilingues: el soporte de 18 idiomas permite validar flujos de atencion al cliente hablada en fase de prototipo antes de escalar a infraestructura mayor.
- Pruebas de concepto de pipelines de audio en local: con 1,58 GB de pesos mas 0,15 GB de codec, encaja en equipos Apple Silicon para experimentacion e investigacion sin GPU dedicada.
- Generacion de respuestas habladas en asistentes de voz embebidos: el modo TTS con parametros ajustables de temperatura y top-k permite controlar la variabilidad de la voz generada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: 1,58 GB de pesos cuantizados a 4 bits mas 0,15 GB del codec de audio, es decir, aproximadamente 1,73 GB en disco/ memoria solo para los pesos; el consumo en ejecucion es mayor por el estado de inferencia y los buffers de audio.
- Hardware objetivo: Apple Silicon (MLX). No esta pensado para GPUs NVIDIA ni CUDA.
- GPU consumer: si, en equipos Mac con chip Apple Silicon; el modelo esta disenado explicitamente para ejecucion on-device en esta plataforma.
- Opciones de despliegue: MLX-VLM 0.7.11 o superior, mediante `python -m mlx_vlm.generate`. No se indica soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Plataforma |
|---|---|---|---|---|---|
| LFM3-Audio-2B-MLX-4bit | 1.977.548.032 | no disponible | 4 bits MLX | lfm1.0 | Apple Silicon (MLX) |
| LFM3-Audio-2B-MLX-8bit | no disponible | no disponible | 8 bits MLX | lfm1.0 | Apple Silicon (MLX) |
| LFM3-Audio-2B (base) | no disponible | no disponible | BF16 (original) | lfm1.0 | no disponible |

La informacion disponible no incluye modelos de terceros comparables con datos verificables de parametros, contexto o rendimiento; por tanto, la comparativa se limita a las variantes oficiales del mismo modelo. El autor recomienda la version de 8 bits como mejor compromiso entre tamano y precision, reservando la de 4 bits para los escenarios con mayor restriccion de memoria.

## Limitaciones y advertencias

- Perdida de precision: el propio autor indica que esta es la variante mas pequena y que pierde parte de la exactitud respecto al modelo original; se recomienda la version de 8 bits cuando la calidad sea prioritaria.
- Licencia lfm1.0: es una licencia "other" (LFM Open License v1.0); deben revisarse sus terminos antes de cualquier uso comercial, ya que puede imponer restricciones.
- Dependencia de plataforma: el formato MLX solo es utilizable en Apple Silicon; no es portable a CUDA ni a CPU generica sin conversion.
- Version de MLX-VLM: requiere MLX-VLM 0.7.11 o superior; versiones anteriores no son compatibles.
- Idiomas: aunque se declaran 18 idiomas, no se aportan datos de calidad por idioma; el rendimiento en espanol no esta cuantificado en la informacion disponible.
- Alucinacion y sesgos: no se documentan evaluaciones de sesgo ni tasas de alucinacion en la informacion proporcionada.
- Contexto: la longitud de contexto no esta especificada, lo que limita la planificacion de cargas con audios largos.
- Componentes en BF16: el encoder, proyector, decodificador de profundidad y codebook permanecen en BF16, por lo que el ahorro de memoria respecto a la version de 8 bits no es proporcional en todas las partes del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LiquidAI/LFM3-Audio-2B-MLX-4bit
- Modelo base: https://huggingface.co/LiquidAI/LFM3-Audio-2B
- Variante de 8 bits: https://huggingface.co/LiquidAI/LFM3-Audio-2B-MLX-8bit
- Repositorio MLX-VLM: https://github.com/Blaizzy/mlx-vlm
- Blog de LFM3: https://www.liquid.ai/blog/lfm3
- Documentacion de Liquid AI: https://docs.liquid.ai/lfm/getting-started/welcome
- Guia de despliegue en MLX: https://docs.liquid.ai/deployment/on-device/mlx
- Consola/API: https://console.liquid.ai/dashboard
- Playground: https://playground.liquid.ai/
