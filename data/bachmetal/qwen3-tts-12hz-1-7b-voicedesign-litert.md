# bachmetal/Qwen3-TTS-12Hz-1.7B-VoiceDesign-LiteRT

## Resumen

Este repositorio no contiene un modelo entrenado desde cero, sino una conversión a LiteRT del modelo de síntesis de voz Qwen3-TTS-12Hz-1.7B-VoiceDesign de Qwen, publicada por el usuario bachmetal. El resultado son varios grafos `.tflite` y tablas de embeddings que, orquestados desde el host (la aplicación Android `com.navid.qwentts`), permiten ejecutar el diseño de voz por descripción en lenguaje natural íntegramente en el dispositivo, sin conexión a un servidor.

El modelo base es un TTS de 1,7B parámetros que acepta instrucciones libres sobre timbre, emoción y prosodia en lugar de perfiles de voz predefinidos. La conversión separa el sistema en un "talker" tipo transformer (28 capas, 2048 de anchura) cuantizado a int4 blockwise-32, un predictor de códigos MTP (5 capas, 1024 de anchura) en int8 dinámico y el decodificador del codec de audio, además de embeddings externalizados en fp16/fp32.

Su relevancia es acotada pero clara: demuestra que un TTS de casi 2 GB puede empaquetarse en grafos LiteRT de menos de 2,3 GB totales y ejecutarse en Android con cuantización agresiva, algo poco frecuente en modelos de esta familia. No hay resultados de evaluación publicados, cero descargas y cero "likes" en el momento de redactar esta ficha, por lo que debe tratarse como un artefacto de ingeniería experimental, no como una distribución lista para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pipeline TTS en varios grafos: talker transformer (28 capas, 2048 de anchura) + predictor de códigos MTP (5 capas, 1024) + decodificador de codec de voz; orquestación en el host |
| Parámetros totales | 1,7B según el nombre del modelo base; una fuente secundaria (savrn.com) cita 1,9B. No disponible un recuento oficial en la model card de esta conversión |
| Parámetros activos | No aplica (no se describe como MoE) |
| Longitud de contexto | No disponible. La firma `prefill_128` sugiere prefill por bloques de 128 tokens, sin que se documente el límite máximo |
| Tipos de cuantización | Talker int4 blockwise-32; predictor de códigos int8 dinámico; embeddings de texto y de códigos en fp16; proyecciones en fp32 |
| Idiomas soportados | No disponible en esta model card. El modelo base Qwen3-TTS declara 10 idiomas (chino, inglés, japonés, coreano, alemán, francés, ruso, portugués, español e italiano) y perfiles dialectales |
| Licencia | Apache-2.0 (verificar la licencia del modelo base en su repositorio) |
| Formato de pesos | `.tflite` (LiteRT), `.npy` (fp16/fp32), `.npz` (fp32), más `vocab.json` y `merges.txt` del tokenizador Qwen2 BPE |
| Tamaño del repositorio | 2,3 GB |
| Librería | `litert` |
| Pipeline | text-to-speech |
| Modelo base | Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign |

## Arquitectura y entrenamiento

La conversión reproduce la topología del Qwen3-TTS original en tres etapas. El talker es un transformer de 28 capas y 2048 dimensiones que procesa el texto tokenizado (tokenizador Qwen2 BPE) junto con el prefijo de instrucción, proyectado mediante un MLP SiLU de 2048 a 2048 (`text_projection_fp32.npz`). Sus embeddings de entrada se externalizan (`text_embedding_fp16.npy`, matriz de 151936 × 2048), de modo que el grafo `.tflite` no los incluye. El talker expone dos firmas, `prefill_128` y `decode`, lo que encaja con un esquema de prefill por bloques seguido de decodificación autorregresiva paso a paso.

La segunda etapa es el predictor de códigos (`mtp_folded_int8.tflite`), un módulo de 5 capas y 1024 de anchura que recibe el estado oculto proyectado, el embedding proyectado del primer codebook y ruido, y emite 15 códigos por paso. Las 15 tablas de embeddings del predictor están plegadas como constantes dentro del propio `.tflite`, por lo que no se distribuyen por separado; el resto de tablas auxiliares (`mtp_talker_embeddings_fp16.npy`, `small_to_mtp_projection_fp32.npz`, `codec_embedding_fp32.npy`) alimentan el bucle que ejecuta el host. La tercera etapa son `codec_partA.tflite` y `codec_partB.tflite`, el decodificador del codec de voz, que el autor indica que es idéntico byte a byte al de la versión de 0,6B.

No se documenta en esta model card el volumen de datos de entrenamiento, la composición del corpus, ni si el modelo base usó RLHF o DPO. Tampoco se detalla el proceso de conversión (herramienta de exportación, calibración de la cuantización int4/int8, tolerancias de error). El modelo base se distribuye con licencia Apache-2.0 según los metadatos del repositorio, pero la ficha no aporta información sobre evaluación de la pérdida de calidad introducida por la cuantización.

## Capacidades

- Síntesis de voz a partir de texto con "diseño de voz": el usuario describe en lenguaje natural el timbre, la emoción y la prosodia deseados, en lugar de seleccionar un perfil predefinido.
- Generación de audio completa en el dispositivo: el pipeline incluye tokenización, talker, predictor de códigos y decodificación de waveform, sin llamadas a red.
- Predicción multi-codebook: 15 códigos por paso generados por el módulo MTP, con las tablas de embeddings plegadas en el grafo.
- Prefill por bloques de 128 tokens (`prefill_128`) y decodificación incremental (`decode`), adecuado para streaming desde el punto de vista de la firma, aunque la card no documenta latencia ni streaming real.
- Soporte multilingüe heredado del modelo base (10 idiomas), sin confirmación específica para esta conversión.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión ni entrada de audio. Es un modelo exclusivamente text-to-speech.

## Casos de uso

- Síntesis de voz offline en aplicaciones Android: integración de los `.tflite` en una app que genere locuciones sin conectividad, útil en entornos con red restringida o requisitos de privacidad; el modelo está pensado exactamente para ese escenario según el autor.
- Accesibilidad para personas con discapacidad visual: lectura en voz alta de contenido en el propio dispositivo, con la ventaja de que el texto no abandona el terminal y no hay coste por petición.
- Prototipado de personajes para videojuegos y narrativa interactiva: generar variantes de voz a partir de descripciones ("voz grave, ritmo lento, tono cansado") permite iterar sobre el casting sin grabar actores.
- Audiolibros y contenido largo: el esquema de prefill por bloques y decodificación incremental encaja con la generación por tramos; requiere validar en dispositivo la consistencia de la voz entre fragmentos, algo que la card no evalúa.
- Diseño de asistentes de voz embebidos: sustituir voces genéricas por perfiles descritos por el desarrollador en asistentes de domótica, automoción o wearables donde no cabe un servidor TTS.
- Pruebas A/B de locuciones en marketing: generar múltiples versiones de un mismo guion con descripciones de voz distintas para evaluar preferencia antes de contratar una locución profesional.
- Investigación sobre cuantización extrema en TTS: el artefacto sirve como caso de estudio de int4 blockwise-32 e int8 dinámico aplicados a un modelo de ~1,7B, comparando calidad percibida frente a los pesos originales en fp16/bf16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio no incluye métricas de calidad de voz (MOS, CMOS, WER de ASR sobre la salida), ni comparaciones con el modelo base sin cuantizar, ni datos de latencia o throughput en dispositivos concretos.

## Requisitos de hardware

- Huella de memoria estimada a partir del contenido del repositorio (2,3 GB): alrededor de 2,0-2,5 GB de RAM residente para cargar talker int4, predictor int8, codec y tablas de embeddings. Cálculo orientativo, no publicado por el autor.
- Desglose aproximado: talker int4 más escalas de bloque ~0,9-1,0 GB; embeddings de texto fp16 (151936 × 2048) ~0,6 GB; embeddings de códigos fp16 (15 × 2048 × 2048) ~0,13 GB; codec y proyecciones, decenas de MB.
- GPU de escritorio: no aplica de forma directa, ya que los artefactos son grafos LiteRT orientados a aceleradores móviles (CPU, GPU o NPU del SoC a través del delegado LiteRT correspondiente). No hay datos de ejecución en A100, H100 o RTX 4090.
- Cabe en dispositivos móviles de gama alta con varios GB de RAM libre; no se especifican modelos de SoC, versiones mínimas de Android ni requisitos de NPU.
- Despliegue: intérprete LiteRT/TFLite en Android con código de orquestación propio en el host (la app `com.navid.qwentts`). No es compatible con vLLM, llama.cpp, Ollama ni TGI, que no soportan este formato.
- Latencia y throughput: no disponibles. Dependen críticamente del delegado usado (CPU frente a GPU/NPU) y del dispositivo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|---|
| bachmetal/Qwen3-TTS-12Hz-1.7B-VoiceDesign-LiteRT (esta ficha) | 1,7B (base) | No disponible | LiteRT `.tflite` + `.npy`/`.npz` | Apache-2.0 | 0 descargas, 0 likes | Conversión on-device, sin benchmarks publicados |
| Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign | 1,7B (una fuente cita 1,9B) | No disponible en la información recogida | Pesos originales (no detallado) | No disponible en la información recogida | Repositorio oficial en Hugging Face | Modelo de referencia; requiere infraestructura de inferencia estándar |
| Qwen/Qwen3-TTS-12Hz-1.7B-Base | 1,7B | No disponible | Pesos originales (no detallado) | No disponible en la información recogida | Repositorio oficial en Hugging Face | Variante sin "voice design"; la card del modelo base declara 10 idiomas |
| Versión Qwen3-TTS 0.6B (mencionada en la card) | ~0,6B según nomenclatura | No disponible | No disponible | No disponible | No disponible | El autor indica que el codec de esta conversión es idéntico byte a byte al de la release de 0,6B |

No se han identificado en la información proporcionada alternativas on-device comparables (por ejemplo, sintetizadores ligeros para Android) con especificaciones verificables, por lo que la comparación se limita a la familia Qwen3-TTS.

## Limitaciones y advertencias

- Artefacto de conversión, no un modelo oficial de Qwen: el mantenimiento, la corrección de errores y el soporte dependen de un único autor, con 0 descargas y 0 likes registrados.
- Ausencia total de evaluación: no hay métricas objetivas ni subjetivas de calidad de voz tras la cuantización int4/int8, ni comparación con el modelo base en fp16/bf16.
- La cuantización int4 blockwise-32 del talker y el int8 dinámico del predictor pueden introducir artefactos audibles, inestabilidad en la prosodia o deriva del timbre respecto a la descripción solicitada; no cuantificado.
- Idiomas no documentados para esta conversión: aunque el modelo base declara 10 idiomas, no hay confirmación de que la conversión los preserve ni de la calidad en español.
- El diseño de voz por instrucción es probabilístico: descripciones ambiguas pueden producir voces que no coincidan con lo pedido, sin mecanismo de verificación automática.
- Longitud de contexto y comportamiento en textos largos no documentados; el esquema `prefill_128` implica gestión manual por bloques en el host, con riesgo de inconsistencias entre tramos.
- Dependencia de código de orquestación propio del host: sin él, los `.tflite` no son directamente utilizables; no se publica API, SDK ni documentación de integración más allá de la tabla de ficheros.
- Licencia Apache-2.0 declarada para el repositorio, pero conviene verificar los términos del modelo base Qwen3-TTS antes de un uso comercial, así como las obligaciones de atribución.
- No apto para clonación de voz de personas reales a partir de muestras: la funcionalidad es "voice design" por descripción, pero cualquier uso con voces identificables exige consentimiento y cumple la normativa aplicable.
- Sin soporte documentado de streaming en tiempo real, ni cifras de latencia que permitan estimar viabilidad en conversación interactiva.

## Enlaces

- Repositorio de esta conversión: https://huggingface.co/bachmetal/Qwen3-TTS-12Hz-1.7B-VoiceDesign-LiteRT
- Modelo base: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign
- Variante base sin voice design: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-Base
- Repositorio de código de Qwen3-TTS: https://github.com/QwenLM/Qwen3-TTS
- Ficha de terceros con parámetros y licencia: https://savrn.com/models/qwen3-tts-12hz-1-7b-voicedesign
- Descripción del modelo en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/qwen3-tts-12hz-1-7b-voicedesign-qwen
