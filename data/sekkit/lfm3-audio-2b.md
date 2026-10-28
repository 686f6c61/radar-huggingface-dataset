# sekkit/LFM3-Audio-2B

## Resumen

LFM3-Audio-2B es un modelo any-to-any de audio desarrollado por Liquid AI dentro de la familia LFM3, pensado para ejecutarse localmente en portátiles y dispositivos edge. Acepta texto o audio como entrada (el codificador de audio trabaja a 16 kHz) y produce texto, habla a 24 kHz o una secuencia intercalada de ambos, con una ventana de contexto de 32.000 tokens que cubre entrada y salida de forma conjunta.

El modelo combina un backbone LFM3 con un codificador de audio causal propio y un tokenizador de audio denominado LiquidCodec, que sustituyen a los componentes de LFM2.5-Audio y mejoran la calidad de síntesis según la model card. La naturaleza causal del codificador, junto con el prefill incremental, habilita conversación por voz en streaming: el usuario habla y recibe respuesta en texto y audio de forma progresiva.

Su relevancia actual está en el segmento de modelos de voz de pequeño tamaño (2.002.332.928 parámetros según los safetensors del repositorio) que cubren reconocimiento, síntesis, traducción y comprensión de audio en 18 idiomas, además de tool calling a partir de peticiones habladas. El repositorio analizado es un espejo de terceros (sekkit) del modelo oficial de Liquid AI, publicado bajo licencia LFM Open License v1.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone LFM3 con codificador de audio causal y tokenizador de audio LiquidCodec |
| Parametros totales | 2.002.332.928 (2B) |
| Parametros activos | No aplica (no se describe como MoE) |
| Longitud de contexto | 32.000 tokens (entrada + salida) |
| Tipos de cuantizacion | No disponible en el repositorio (solo safetensors); cuantizacion a int8/int4 tecnicamente posible, sin artefactos publicados |
| Idiomas soportados | Arabe, danes, aleman, griego, ingles britanico, ingles americano, finlandes, frances, hebreo, italiano, japones, coreano, neerlandes, polaco, portugues, espanol, sueco, turco y chino |
| Licencia | lfm1.0 (Liquid Open License v1.0) |
| Formato de pesos | safetensors (requiere `trust_remote_code` por el tag `custom_code`) |
| Entrada | Texto o audio (codificador a 16 kHz) |
| Salida | Texto, habla a 24 kHz, o texto y habla intercalados |
| Streaming | Codificacion de audio causal, prefill incremental y generacion de habla en streaming |
| Tamano del repositorio | 4,2 GB |
| Libreria | transformers |
| Pipeline | any-to-any |

## Arquitectura y entrenamiento

La arquitectura es una combinacion de tres piezas: un backbone LFM3 (la familia incluye variantes base, texto, vision, audio, omni y decision), un codificador de audio causal que opera sobre senal a 16 kHz y un tokenizador de audio propio, LiquidCodec, que convierte el habla en tokens discretos y permite generarla a 24 kHz. El caracter causal del codificador y el prefill incremental son los responsables de que el modelo pueda emitir respuesta mientras el usuario sigue hablando, sin esperar a disponer del audio completo. La salida puede ser texto, habla o una secuencia intercalada de ambos, lo que habilita modos como "razonar en texto antes de responder en voz".

La model card indica que el modelo mejora la calidad de habla respecto a LFM2.5-Audio gracias al codificador y al tokenizador desarrollados internamente, pero no detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron etapas de RLHF o DPO. Tampoco se especifica la variante concreta del backbone LFM3 utilizada ni el numero de capas del codificador. Toda esa informacion figura como no disponible en el material consultado.

## Capacidades

- Chat de voz bidireccional: preguntas habladas con respuesta en texto y voz en streaming.
- Modo de razonamiento en texto: cuando la respuesta es solo textual, el modelo puede razonar antes de contestar.
- Reconocimiento automatico de habla (ASR) multilingue en los 18 idiomas declarados.
- Sintesis de voz (TTS) a 24 kHz.
- Traduccion de habla entre los idiomas soportados.
- Comprension y razonamiento sobre audio: identificar habla, sonidos y eventos en una grabacion y responder preguntas sobre ellos.
- Tool calling / function calling a partir de peticiones habladas, con acompanamiento de texto o voz junto a la llamada.
- Salida any-to-any con intercalado de texto y audio en una misma respuesta.
- Capacidad de ejecucion local en portatiles y dispositivos edge por su tamano de 2B parametros.

## Casos de uso

- Asistente de voz en dispositivo: integrar el modelo en una app de escritorio o movil para mantener conversaciones habladas sin enviar audio a la nube, usando el streaming causal para reducir la latencia percibida.
- Transcripcion multilingue de reuniones: ASR sobre audio a 16 kHz con contexto de 32K tokens, suficiente para actas de sesiones largas divididas en fragmentos, con salida de texto alineada.
- Subtitulado y doblaje: combinar traduccion de habla y TTS a 24 kHz para generar pistas de voz en otro idioma a partir de la grabacion original.
- Control de aplicaciones por voz: el tool calling permite convertir una orden hablada en una llamada a funcion (encender un dispositivo, crear un evento, consultar un dato) con confirmacion hablada al usuario.
- Analisis de grabaciones para soporte: preguntas sobre llamadas de atencion al cliente para localizar motivos de reclamacion, tono o eventos concretos dentro del audio.
- Accesibilidad: lectura en voz alta de contenido textual y dictado por voz para usuarios con dificultades de vision o de movilidad, ejecutandose en local por privacidad.
- Prototipado de agentes conversacionales: cadena de razonamiento en texto seguida de respuesta hablada, util para asistentes de kiosco o interfaces manos libres en entornos con conectividad limitada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio consultado no incluye tablas de MMLU, HumanEval, GSM8K, WER de ASR ni metricas de calidad de sintesis (MOS), y la busqueda web realizada no ha devuelto documentacion tecnica relevante sobre este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos): en torno a 4 GB en fp16/bf16 para los 2B parametros; aproximadamente 2 GB en int8 y 1,2-1,5 GB en int4, a lo que hay que sumar la cache KV para la ventana de 32K tokens y el estado del codificador de audio.
- Cabe en GPU de consumo: una RTX 4090 (24 GB) o RTX 4080 (16 GB) trabajan con margen en fp16 y contexto completo; tarjetas de 8 GB permiten fp16 con contexto reducido o cuantizacion.
- GPU de centro de datos: A100, H100 o L40S para servir varias sesiones concurrentes con contexto completo y streaming.
- Despliegue: el repositorio esta preparado para `transformers` con `trust_remote_code` (tag `custom_code`). No se confirma en la informacion disponible soporte en vLLM, TGI, llama.cpp, Ollama ni artefactos GGUF.
- Latencia y throughput: no disponibles. El diseno causal del codificador y el prefill incremental estan orientados a baja latencia en streaming, pero no se publican cifras de time-to-first-token ni de tokens de audio por segundo.

## Comparativa con modelos similares

Los datos de la columna de LFM3-Audio-2B proceden del repositorio analizado. Los de los modelos alternativos son orientativos a partir de informacion publica general y deben verificarse antes de tomar decisiones; no proceden de la busqueda realizada.

| Modelo | Parametros | Contexto | Entrada/salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-Audio-2B | 2B | 32K | Texto o audio / texto, habla o ambos | lfm1.0 | Pesos en HF (espejo de terceros) |
| LFM2.5-Audio (predecesor) | No disponible | No disponible | Audio / texto y habla | No disponible | Pesos en HF |
| Qwen2-Audio-7B-Instruct | 7B | No verificado | Audio / texto | Apache 2.0 (verificar) | Pesos en HF |
| Moshi (Kyutai) | 7B aprox. | No verificado | Audio / audio | CC-BY 4.0 (verificar) | Pesos en HF |

Frente a alternativas de 7B, la ventaja declarada de LFM3-Audio-2B es el menor coste de inferencia y la viabilidad en dispositivos edge, con salida de voz y tool calling incluidos en un unico modelo. No hay datos publicados que permitan comparar calidad de ASR o de sintesis con esas alternativas.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no es posible evaluar la calidad de transcripcion, sintesis o razonamiento sin pruebas propias.
- El repositorio consultado pertenece al usuario `sekkit`, no a Liquid AI, y registra 0 descargas y 0 likes; conviene usar el repositorio oficial de la organizacion LiquidAI para produccion.
- El tag `custom_code` obliga a ejecutar codigo del repositorio con `trust_remote_code=True`, lo que implica un riesgo de seguridad en entornos no controlados.
- Licencia LFM Open License v1.0 ("other"): es necesario revisar el texto completo de la licencia antes de un uso comercial, ya que puede incluir restricciones de escala o de atribucion.
- Riesgo de alucinacion en la respuesta hablada y en el razonamiento previo, especialmente en audio con ruido, solapamiento de hablantes o acentos no cubiertos por el entrenamiento.
- Cobertura limitada a 18 idiomas; no se declara soporte de espanol de Espana frente a variedades latinoamericanas ni de otras lenguas ibericas como catalan, gallego o euskera.
- El contexto de 32K tokens es compartido entre entrada y salida, y el audio consume tokens adicionales: sesiones de voz muy largas pueden agotar la ventana antes de lo que sugeriria el numero para texto.
- No se documentan sesgos demograficos, de genero o de acento en la model card, ni medidas de mitigacion.
- No se especifican requisitos de atribucion para la sintesis de voz ni limitaciones sobre clonacion de voz, un aspecto critico en despliegues de TTS.

## Enlaces

- Repositorio analizado (espejo de terceros): https://huggingface.co/sekkit/LFM3-Audio-2B
- Blog de lanzamiento de la familia LFM3: https://www.liquid.ai/blog/lfm3
- Documentacion de LFM: https://docs.liquid.ai/lfm/getting-started/welcome
- Playground de demostracion: https://playground.liquid.ai/talk
- Consola / API: https://console.liquid.ai/dashboard
- Coleccion LFM3 en HuggingFace: https://huggingface.co/collections/LiquidAI/lfm3
- Repositorio de referencia de la familia (banner y assets): https://huggingface.co/LiquidAI/LFM3-1.7B
- Resultados de la busqueda web: no se han encontrado enlaces tecnicos relevantes sobre este modelo; los resultados devueltos no guardan relacion con el contenido de la ficha.
