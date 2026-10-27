# maya-research/maya2-native

## Resumen

Maya 2 Native es un modelo de síntesis de voz (text-to-speech) con generación en streaming desarrollado por Maya Research y publicado con pesos abiertos bajo licencia Apache-2.0. Genera audio mono a 24 kHz en 12 idiomas (11 lenguas índicas más inglés), incorpora 20 voces integradas y permite clonación de voz zero-shot a partir de 3-10 segundos de audio de referencia, incluyendo clonación cruzada entre idiomas (una referencia en hindi puede producir habla en tamil).

El modelo tiene 2.502.398.656 parámetros (unos 2,50 B) y se construye sobre Qwen/Qwen3-1.7B-Base como modelo base, con aproximadamente 5,0 GB de pesos en BF16. Se distribuye en safetensors a través de la librería `maya3` y expone tres interfaces: API de Python, endpoint de voz compatible con OpenAI y streaming por WebSocket, con soporte de batching continuo y CUDA graphs para generación concurrente.

Su relevancia actual es doble. Por un lado, cubre lenguas índicas con muy poca oferta de TTS open source de calidad. Por otro, compite directamente con servicios comerciales: en el leaderboard VoiceArena de hindi (categoría All, solo modelos en tiempo real) ocupa la segunda posición con un Elo Bradley-Terry de 1047 ±11, por detrás de Cartesia Sonic-3.6 (1094) y por delante de Sonic-3.5, Lightning 3.1 Pro de Smallest AI y Bulbul-V3 de Sarvam AI.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No detallada en la model card. Modelo base Qwen/Qwen3-1.7B-Base (transformer) con módulo de generación de audio; el tag `mimi` apunta al códec neuronal Mimi, sin confirmación explícita en la documentación |
| Parámetros totales | 2.502.398.656 (2,50 B) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible; solo se publican pesos BF16 (aproximadamente 5,0 GB) |
| Idiomas soportados | 12: assamés, bengalí, inglés, guyaratí, hindi, canarés, malabar, maratí, oriya, panyabí, tamil y telugu |
| Licencia | Apache-2.0 (la model card remite a la sección de licencias de componentes) |
| Formato de pesos | safetensors |
| Frecuencia de muestreo | 24 kHz, mono |
| Streaming | Tramas de audio de 80 ms |
| Voces integradas | 20 |
| Clonación de voz | Zero-shot, con 3-10 s de audio de referencia; también cruzada entre idiomas |
| Interfaces | API de Python, endpoint de voz compatible con OpenAI, WebSocket |
| Librería | `maya3` |
| Tamaño del repositorio | 5,1 GB |
| Versión del checkpoint | 1.0 (25 de octubre de 2026) |

## Arquitectura y entrenamiento

La model card no publica el detalle de la arquitectura interna, el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de ajuste con RLHF o DPO. Lo que sí se documenta es que el modelo parte de Qwen/Qwen3-1.7B-Base, un transformer de 1,7 B parámetros, y que el conjunto resultante alcanza 2,50 B parámetros, es decir, en torno a 800 M parámetros adicionales correspondientes al módulo de audio. El tag `mimi` del repositorio sugiere el uso del códec neuronal Mimi para la tokenización y reconstrucción del audio, aunque esta correspondencia no se confirma de forma explícita en el texto de la model card.

En el plano de la inferencia, las innovaciones documentadas son de despliegue más que de entrenamiento: decodificación en streaming con tramas de 80 ms, batching continuo y CUDA graphs para sostener generación concurrente con baja latencia, y un endpoint compatible con la API de voz de OpenAI que facilita la sustitución de proveedores comerciales. La model card tampoco detalla la estrategia de normalización de texto más allá de mencionar que existe y que se puede activar; los ejemplos publicados se generaron con normalización activada y decodificación por muestreo.

## Capacidades

- Síntesis de voz en 12 idiomas: assamés, bengalí, inglés, guyaratí, hindi, canarés, malabar, maratí, oriya, panyabí, tamil y telugu.
- Generación de audio a 24 kHz mono con streaming en tramas de 80 ms, apta para agentes de voz conversacionales.
- 20 voces integradas, identificadas por nombre en los ejemplos de la model card (por ejemplo, Ritvik en hindi o Nakul en assamés).
- Clonación de voz zero-shot con 3-10 segundos de audio de referencia.
- Clonación de voz cruzada entre idiomas: la referencia puede estar en un idioma distinto al del texto de salida.
- Normalización de texto configurable, relevante para números, importes y direcciones en contextos de atención al cliente.
- Batching continuo y CUDA graphs para servir varias peticiones concurrentes.
- Tres vías de integración: API de Python, endpoint compatible con OpenAI y streaming por WebSocket.
- No se documentan capacidades de tool calling, razonamiento multi-paso, visión ni audio de entrada más allá del audio de referencia para clonación.

## Casos de uso

- Atención al cliente automatizada en lenguas índicas: el modelo puede leer respuestas de un bot o de un IVR en hindi, bengalí o tamil con voces nativas, y la normalización de texto permite verbalizar correctamente números de cuenta, importes y direcciones postales, como se ve en el ejemplo hindi de la model card.
- Agentes de voz en tiempo real: con streaming en tramas de 80 ms, batching continuo y WebSocket, encaja en pipelines de voz Conversational AI donde la latencia de la primera trama condiciona la naturalidad del turno.
- Doblaje y localización cruzada: al permitir clonación cross-lingual, una única referencia de 3-10 segundos puede generar la misma voz en varios de los 12 idiomas, lo que simplifica doblar un curso o una campaña sin regrabar con locutores distintos.
- Audiolibros y contenido editorial: lectura de textos largos en hindi, malabar o maratí con voces integradas y control de normalización para cifras y abreviaturas.
- Accesibilidad: conversión de contenido web o de aplicaciones a voz para usuarios con discapacidad visual en idiomas con poca cobertura de voces sintéticas de calidad.
- Sustitución de proveedor TTS comercial: el endpoint compatible con OpenAI permite migrar una integración existente cambiando la URL y las credenciales, manteniendo el mismo contrato de API.
- Generación de datos de voz sintética: creación de corpus de audio en lenguas índicas para entrenar o evaluar sistemas ASR, con voces diversas y clonación controlada.
- Interfaces de voz embebidas: al ser Apache-2.0 y con pesos abiertos, permite autohospedaje en infraestructura propia, requisito habitual en administraciones públicas y sectores regulados que no pueden enviar texto a una API externa.

## Benchmarks y rendimiento

El único benchmark publicado en la información disponible es el leaderboard de hindi de VoiceArena (filtros: hindi, todas las categorías, solo modelos en tiempo real), consultado el 27 de octubre de 2026. La métrica es Elo Bradley-Terry con intervalos de confianza del 95 %.

| Puesto | Creador | Modelo | Elo Bradley-Terry | IC 95 % | Muestras |
|---|---|---|---:|---:|---:|
| 1 | Cartesia | Sonic-3.6 | 1094 | ±13 | 1289 |
| 2 (2-4) | Maya Research | Maya-2-Native | 1047 | ±11 | 2268 |
| 3 (2-5) | Cartesia | Sonic-3.5 | 1035 | ±12 | 1802 |
| 4 (2-5) | Smallest AI | Lightning 3.1 Pro | 1024 | ±12 | 1870 |
| 5 (3-5) | Murf AI | Falcon 2 | 1021 | ±14 | 1352 |
| 6 (6-7) | Cartesia | Sonic-3 | 961 | ±9 | 4256 |
| 7 (6-7) | Sarvam AI | Bulbul-V3 | 957 | ±9 | 3882 |
| 8 | xAI | Grok TTS | 890 | ±9 | 3689 |
| 9 | Microsoft Azure | Dragon HD Omni | 855 | ±9 | 3611 |

Advertencias sobre estos datos: los intervalos de confianza de los puestos 2 a 5 se solapan, por lo que la posición exacta no es concluyente; VoiceArena fecha la entrada de Maya-2-Native en julio de 2026 y no identifica la revisión exacta del checkpoint evaluado; una captura de pantalla aportada por el autor muestra 2.º puesto con Elo 1049 ±10 y 2171 muestras, ligeramente distinta de la consulta en vivo. El resultado está acotado al leaderboard de hindi y no hay datos públicos equivalentes para el resto de idiomas.

En la sección de evaluación, la model card indica que los doce clips de muestra se seleccionaron entre salidas con una tasa de error de caracteres (CER) inferior al 2 % según tres jueces ASR. No se publican cifras medias de CER o WER por idioma, ni resultados de benchmarks tipo MMLU, HumanEval o GSM8K, que por otra parte no aplican a un modelo TTS.

## Requisitos de hardware

- Pesos en BF16: aproximadamente 5,0 GB, coherente con los 2,50 B parámetros y el tamaño de repositorio de 5,1 GB.
- VRAM estimada para inferencia en BF16: en torno a 6-8 GB contando pesos, caché de atención y búferes de audio. Es una estimación calculada a partir del número de parámetros, no un dato publicado.
- No se han publicado pesos cuantizados. Cualquier cifra para int8 (aproximadamente 3-4 GB) o int4 (aproximadamente 2-3 GB) es una proyección teórica y requeriría convertir y validar el modelo, con riesgo de degradación en la calidad de voz.
- GPU recomendadas: no especificadas por el autor. Por tamaño, el modelo es holgado en una A100 o H100 para servir con concurrencia, y cabe en GPUs de consumo con 8-12 GB de VRAM o más para una sola secuencia en BF16.
- Despliegue: la model card documenta API de Python, endpoint compatible con OpenAI y WebSocket, con batching continuo y CUDA graphs. No se mencionan vLLM, llama.cpp, Ollama ni TGI; al tratarse de un modelo TTS con códec de audio, estos motores de servicio de LLM no son aplicables sin trabajo adicional.
- Latencia y throughput: no se publican cifras de RTF, latencia de primera trama ni peticiones por segundo. El único dato objetivo es que el streaming se emite en tramas de 80 ms de audio.

## Comparativa con modelos similares

| Modelo | Creador | Parámetros | Contexto | Elo hindi (VoiceArena) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Maya-2-Native | Maya Research | 2,50 B | No disponible | 1047 ±11 | Apache-2.0 | Pesos abiertos en HuggingFace |
| Sonic-3.6 | Cartesia | No disponible | No disponible | 1094 ±13 | No disponible | Servicio comercial |
| Sonic-3.5 | Cartesia | No disponible | No disponible | 1035 ±12 | No disponible | Servicio comercial |
| Lightning 3.1 Pro | Smallest AI | No disponible | No disponible | 1024 ±12 | No disponible | Servicio comercial |
| Bulbul-V3 | Sarvam AI | No disponible | No disponible | 957 ±9 | No disponible | Servicio comercial |
| Dragon HD Omni | Microsoft Azure | No disponible | No disponible | 855 ±9 | No disponible | Servicio comercial |

La comparación significativa es de producto, no de arquitectura: Maya 2 Native es el único de la lista con pesos abiertos y licencia Apache-2.0, lo que permite autohospedaje y modificación, mientras que el resto se ofrece como API. A cambio, los modelos comerciales no publican parámetros ni detalles de arquitectura, de modo que no es posible comparar tamaño, contexto ni coste por token de audio con los datos disponibles. La única métrica común es el Elo de VoiceArena en hindi, donde la diferencia entre el primer y el segundo puesto (47 puntos) es superior a la suma de sus intervalos de confianza, pero la diferencia con los puestos 3 a 5 no es estadísticamente concluyente.

## Limitaciones y advertencias

- Solo hay evaluación pública competitiva en hindi. Para los otros once idiomas no se publican métricas de calidad, y la propia model card advierte que los clips de muestra se seleccionaron entre las mejores salidas (CER inferior al 2 %), no son representativos de la media.
- No se documenta el proceso de evaluación de sesgos ni la composición demográfica de las 20 voces (género, acento, registro). Es un riesgo real en aplicaciones de atención al cliente o accesibilidad.
- La clonación de voz con 3-10 segundos de audio habilita usos fraudulentos (suplantación, deepfakes). Aunque la licencia Apache-2.0 no impone restricciones de uso, en producción conviene exigir consentimiento verificable y aplicar marcas o detección de audio sintético.
- Riesgo de errores de pronunciación y de normalización en números, siglas, nombres propios y textos mixtos hindi-inglés; la model card no publica tasas medias de CER por idioma.
- No se especifica la longitud máxima de texto por petición ni el contexto del modelo. Para textos largos habrá que trocear y gestionar la continuidad prosódica manualmente.
- Licencia Apache-2.0 para el modelo, pero la model card remite a una sección de licencias de componentes. Antes de un uso comercial conviene revisar la licencia del códec de audio y del tokenizador, así como la de Qwen/Qwen3-1.7B-Base, que es el punto de partida.
- Nombres internos inconsistentes: el modelo se llama Maya 2 Native, pero el paquete, la clase Python y el fichero de configuración siguen siendo `maya3`, `Maya3TTS` y `maya3_config.json`. Hay que usar esos identificadores en el código.
- No hay cifras publicadas de latencia, throughput ni coste por hora de audio, datos imprescindibles para dimensionar un despliegue en producción.
- El checkpoint es la versión 1.0 (25 de octubre de 2026) y el repositorio se actualizó al día siguiente; no hay historial de versiones ni garantía de estabilidad de la API.
- La búsqueda web realizada no devolvió ninguna fuente independiente sobre el modelo: los resultados corresponden a Autodesk Maya y a la civilización maya, por lo que toda la información procede de HuggingFace y de la model card del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/maya-research/maya2-native
- Repositorio de código: https://github.com/MayaResearch/maya2-native
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B-Base
- Leaderboard de VoiceArena (hindi): https://voicearena.com/tts-leaderboard/hindi
- Metodología de VoiceArena: https://voicearena.com/tts-methodology
- Vídeo de demostración: https://huggingface.co/maya-research/maya2-native/resolve/main/Maya%20Final%20with%20Changes.mp4
- Vídeo alternativo en Google Drive: https://drive.google.com/file/d/1WRd_e8TztpvX1n-DbOBlDj-zP89WE4oX/view
- Captura del leaderboard aportada por el autor: https://huggingface.co/maya-research/maya2-native/resolve/main/voicearena-hindi-realtime-snapshot.png
- Muestras de audio por idioma (ejemplo hindi, voz Ritvik): https://huggingface.co/maya-research/maya2-native/resolve/main/samples/hi_ritvik.wav
- Muestras de audio por idioma (ejemplo assamés, voz Nakul): https://huggingface.co/maya-research/maya2-native/resolve/main/samples/as_nakul.wav
