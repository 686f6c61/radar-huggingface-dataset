# maternion/LFM3-Audio-2B-Heretic2-GGUF

## Resumen

LFM3-Audio-2B-Heretic2-GGUF es una cuantizacion en formato GGUF del modelo LiquidAI/LFM3-Audio-2B, un modelo audio-texto de tipo any-to-any desarrollado originalmente por Liquid AI. Esta version concreta la publica el usuario maternion en Hugging Face y aplica una ablacion de la direccion de rechazo (abliteration) mediante la herramienta heretic 2.0.0, con el objetivo de reducir el comportamiento de negativa del modelo base sin degradar sus capacidades de audio y texto. El modelo conserva la arquitectura original de Liquid AI (backbone de 1.728.801.600 parametros) y anade un encoder de audio propio junto con el tokenizador LiquidCodec.

El modelo base acepta texto o audio como entrada y puede responder con texto, voz o ambos, lo que lo convierte en una pieza poco habitual dentro de la categoria de modelos pequenos que corren en portatiles y dispositivos de borde. La version Heretic2 mantiene intactos el encoder de audio, el proyector, el depthformer y el LiquidCodec; solo se modifica el backbone de texto, por lo que el fichero `mmproj` es imprescindible para cualquier uso con audio.

La relevancia de esta publicacion es doble: por un lado, ofrece cuantizaciones desde IQ2_M (0.67 GB) hasta BF16 (3.47 GB) listas para llama.cpp, Ollama y la API compatible con OpenAI de `llama serve`; por otro, documenta de forma inusualmente detallada el proceso de abliteracion, incluyendo la metodologia de evaluacion de rechazos con un modelo juez (LiquidAI d1-2B) y las metricas de divergencia KL y repeticion degenerada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con encoder de audio propio, proyector, depthformer y tokenizador LiquidCodec (backbone de texto abliterado) |
| Parametros totales | 1.728.801.600 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ2_M, IQ3_M, Q3_K_M, IQ4_XS, IQ4_NL, Q4_K_M, Q5_K_M, Q6_K, Q8_0, BF16; proyector de audio en BF16 |
| Idiomas soportados | en, ar, da, de, el, fi, fr, he, it, ja, ko, nl, pl, pt, es, sv, tr, zh |
| Licencia | lfm1.0 (other) |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base LFM3-Audio-2B es un modelo any-to-any de Liquid AI que combina un backbone de texto con un encoder de audio desarrollado internamente y un tokenizador de audio llamado LiquidCodec. La salida puede ser texto, habla o ambos, y el modelo esta disenado para ejecutarse localmente en portatiles y dispositivos de borde. La version Heretic2 conserva byte a byte el encoder de audio, el proyector, el depthformer y el LiquidCodec del modelo original; unicamente se ha modificado el backbone de texto mediante Arbitrary-Rank Ablation (ARA) con heretic 2.0.0.

El proceso de abliteracion se ejecuto en el ensayo 301 de 315, con un rango de capas de la 2 a la 22 y los hiperparametros `preserve_good_behavior_weight = 0.9846`, `steer_bad_behavior_weight = 0.000970`, `overcorrect_relative_weight = 0.2109` y `neighbor_count = 15`. El resultado reportado es una divergencia KL de 0.0761, una reduccion de rechazos de 98/100 en el modelo base a 19/100 en esta version, y una tasa de repeticion degenerada de 1/100. La evaluacion se hizo sobre `LLM-LAT/harmful-dataset` `train[400:500]` (100 prompts), con un modelo juez (LiquidAI d1-2B) servido a traves del endpoint `/v1/systemone` de Ollama y una ventana de respuesta de 300 tokens.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si el modelo base uso RLHF o DPO. La model card del autor de la cuantizacion no detalla estos datos y la busqueda web no los aporta.

## Capacidades

- Generacion de texto a partir de entrada de texto o audio.
- Reconocimiento automatico del habla (ASR): el modelo transcribe audio con el system prompt `Perform ASR in <language>.` o infiere el idioma con `Perform ASR.`.
- Sintesis de voz (TTS): genera habla en el idioma indicado con `--tts-lang` y voces `female` (por defecto) o `male` mediante `--tts-voice`.
- Conversaciones de voz en tiempo real a traves de la API WebSocket `/v1/realtime` de `llama serve` (requiere llama.cpp b11960 o superior).
- Entrada multimodal any-to-any: acepta texto o audio y responde con texto, voz o ambos.
- Capacidades multilingues en 18 idiomas: ingles, arabe, danes, aleman, griego, finlandes, frances, hebreo, italiano, japones, coreano, neerlandes, polaco, portugues, espanol, sueco, turco y chino.
- Comportamiento de rechazo reducido respecto al modelo base (19/100 frente a 98/100 en el conjunto de evaluacion), manteniendo las capacidades de audio y texto.
- No se ha documentado soporte explicito de tool calling, function calling ni razonamiento multi-paso en la informacion disponible.

## Casos de uso

- Transcripcion de reuniones y notas de voz: el modelo puede recibir un fichero WAV y devolver la transcripcion con `Perform ASR in Spanish.`, lo que permite integrarlo en pipelines de actas automaticas sin depender de servicios en la nube.
- Asistentes de voz locales en dispositivos de borde: con cuantizaciones de 0.67 a 1.10 GB, el modelo cabe en portatiles y mini-PC, y la API `/v1/realtime` de `llama serve` permite construir interfaces conversacionales por voz con baja dependencia de infraestructura externa.
- Lectura de contenido en voz alta: la sintesis TTS con seleccion de voz e idioma permite generar audiolibros, avisos o resumenes hablados a partir de texto, con la ventaja de que todo el procesamiento ocurre en local.
- Subtitulado y doblaje de material audiovisual: combinando ASR y TTS en el mismo modelo se pueden generar subtitulos y pistas de voz en distintos idiomas de la lista soportada, lo que simplifica la cadena de herramientas.
- Prototipado de agentes conversacionales multimodales: al aceptar audio y texto y responder en ambos formatos, sirve para experimentar con interfaces de voz en entornos de investigacion sin necesidad de GPU dedicada.
- Evaluacion de tecnicas de abliteracion: la model card documenta con detalle la metodologia (modelo juez, ventana de 300 tokens, metrica de repeticion degenerada), lo que lo convierte en un caso de estudio util para investigadores interesados en alineamiento y edicion de comportamiento.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse con llama.cpp en local, el audio no sale del dispositivo, lo que encaja en escenarios sanitarios, legales o industriales con datos sensibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta metricas del proceso de abliteracion, que se recogen a continuacion:

| Metrica | Modelo base | Este modelo |
|---|---|---|
| Rechazos (100 prompts) | 98/100 | 19/100 |
| Repeticion degenerada | 0/100 | 1/100 |
| Divergencia KL | no disponible | 0.0761 |
| Conjunto de evaluacion | `LLM-LAT/harmful-dataset` `train[400:500]` | mismo conjunto |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamano del fichero GGUF mas el proyector de audio (0.57 GB). Con Q4_K_M (1.10 GB) mas mmproj (0.57 GB) el total ronda 1.7 GB; con BF16 (3.47 GB) mas mmproj se acerca a 4 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para las cuantizaciones bajas; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son opciones validas, aunque el modelo esta pensado para ejecucion en CPU y dispositivos de borde.
- Cabe en GPU de consumo: si, practicamente cualquier GPU consumer moderna puede ejecutar las cuantizaciones Q4_K_M o superiores. Las variantes IQ2_M e IQ3_M permiten incluso ejecucion en CPU con poca RAM.
- Opciones de despliegue: llama.cpp (version b11960 o v0.8.0 en adelante, que anade soporte para LFM3-Audio), `llama serve` con API compatible con OpenAI y WebSocket `/v1/realtime`, `llama cli`, `llama-tts`, y Ollama a traves de los tags del repositorio.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Audio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-Audio-2B-Heretic2-GGUF (este) | 1.728.801.600 | no disponible | Si (ASR + TTS) | lfm1.0 | GGUF en Hugging Face |
| LiquidAI/LFM3-Audio-2B (base) | 1.728.801.600 | no disponible | Si (ASR + TTS) | lfm1.0 | Safetensors y GGUF en Hugging Face |
| LiquidAI/LFM3-1.7B | no disponible en la informacion | no disponible | No (solo texto) | lfm1.0 | Hugging Face |

La comparativa se limita al modelo base y a la variante de texto de la misma familia, ya que la informacion proporcionada no incluye datos de otros modelos de audio comparables. No se dispone de cifras de rendimiento para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- La abliteracion no elimina por completo el comportamiento de rechazo: aproximadamente 1 de cada 5 prompts daninos sigue siendo rechazado (19/100 en la evaluacion del autor).
- La abliteracion elimina una direccion de rechazo, pero no anade capacidades; el modelo no es mas capaz que el base, solo menos restrictivo.
- La evaluacion de rechazos se hizo con un unico conjunto de 100 prompts y un modelo juez concreto (LiquidAI d1-2B); los resultados pueden no generalizar a otros dominios o idiomas.
- La repeticion degenerada se incremento ligeramente respecto al base (1/100 frente a 0/100), lo que puede manifestarse en respuestas largas.
- Sin el fichero `LFM3-Audio-2B-mmproj-BF16.gguf` el modelo funciona unicamente como texto; el audio no esta disponible.
- La licencia lfm1.0 (etiquetada como `other`) impone condiciones especificas para uso comercial; es necesario revisar el texto completo de la licencia antes de desplegar en produccion.
- No se dispone de informacion sobre la longitud de contexto, lo que limita la planificacion de cargas con conversaciones largas.
- Riesgo de alucinacion inherente a los modelos de lenguaje, especialmente en transcripciones con ruido o audio de baja calidad.
- El modelo esta pensado para ejecucion local en dispositivos de borde; no se han publicado datos de throughput ni latencia que permitan dimensionar despliegues de alta concurrencia.
- La fecha de creacion del repositorio (2026-11-06) y la ausencia de descargas en el momento de la consulta indican que se trata de una publicacion muy reciente y poco validada por la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/maternion/LFM3-Audio-2B-Heretic2-GGUF
- Modelo base en Hugging Face: https://huggingface.co/LiquidAI/LFM3-Audio-2B
- Cuantizaciones oficiales del modelo base: https://huggingface.co/LiquidAI/LFM3-Audio-2B-GGUF
- Documentacion de Liquid AI: https://docs.liquid.ai/lfm/models/lfm3-audio-2b
- Licencia LFM1.0: https://huggingface.co/LiquidAI/LFM3-Audio-2B/blob/main/LICENSE
- Herramienta heretic: https://github.com/p-e-w/heretic
- Release de llama.cpp b11960: https://github.com/ggml-org/llama.cpp/releases/tag/b11960
- Release de llama.cpp v0.8.0: https://github.com/ggml-org/llama.cpp/releases/tag/v0.8.0
- Consola de Liquid AI: https://console.liquid.ai/dashboard
