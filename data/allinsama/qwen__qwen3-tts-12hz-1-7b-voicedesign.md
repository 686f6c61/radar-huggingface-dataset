# Allinsama/Qwen__Qwen3-TTS-12Hz-1.7B-VoiceDesign

## Resumen

Qwen3-TTS-12Hz-1.7B-VoiceDesign es una variante de la familia Qwen3-TTS, una serie de modelos de síntesis de voz (text-to-speech) desarrollada por el equipo Qwen de Alibaba. Este checkpoint concreto, de 1.916.676.352 parámetros (~1,9 mil millones), está orientado al diseño de voces: la generación de habla controlada mediante instrucciones en lenguaje natural que permiten definir timbre, emoción y prosodia sin necesidad de un audio de referencia. El repositorio analizado es una resubida de terceros (usuario Allinsama) del modelo oficial, sin descargas ni valoraciones en el momento de la consulta.

La propuesta técnica del modelo es un esquema end-to-end: en lugar de encadenar ASR, un modelo de lenguaje intermedio y un vocoder, emplea un modelo de lenguaje autorregresivo sobre tokens acústicos discretos multi-codebook, generados por el tokenizador propio Qwen3-TTS-Tokenizer-12Hz. Esta aproximación elimina los cuellos de botella de información típicos de las arquitecturas en cascada y permite generar audio en streaming con una latencia anunciada de 97 ms.

Su relevancia práctica radica en la combinación de tres factores: cobertura de 10 idiomas principales (incluido el español), control de la voz mediante instrucciones textuales y una licencia Apache 2.0 que permite uso comercial. Para desarrolladores que necesitan integrar voces sintéticas personalizables en producto, es una alternativa de tamaño medio que cabe en GPU de consumo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje autorregresivo sobre tokens acústicos discretos multi-codebook, con tokenizador de audio Qwen3-TTS-Tokenizer-12Hz |
| Parámetros totales | 1.916.676.352 (~1,9 mil millones) |
| Parámetros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible; el repositorio publica pesos en safetensors y el ejemplo de carga de la model card usa bfloat16 |
| Idiomas soportados | 10: chino, inglés, japonés, coreano, alemán, francés, ruso, portugués, español e italiano, además de perfiles de voz dialectales |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio de 4,5 GB) |

## Arquitectura y entrenamiento

La arquitectura es un modelo de lenguaje discreto multi-codebook que opera directamente sobre representaciones acústicas. El componente diferencial es el tokenizador Qwen3-TTS-Tokenizer-12Hz, que trabaja a una tasa de 12 Hz y combina compresión acústica eficiente con modelado semántico de alta dimensión. Sobre esa secuencia de tokens, un LM autorregresivo genera el audio completo, evitando la cascada clásica texto → representación intermedia → vocoder y, con ello, la pérdida de información prosódica que suele producirse en cada etapa intermedia. El resultado es un sistema end-to-end que soporta generación en streaming.

La model card no detalla el número de tokens de entrenamiento, la composición del corpus, ni si se aplicaron etapas de RLHF o DPO sobre el modelo de audio. Tampoco especifica la configuración exacta del transformer (número de capas, dimensión oculta, cabezas de atención) ni el mecanismo de atención empleado. Las innovaciones declaradas por el autor son tres: representación de habla propia mediante el tokenizador a 12 Hz, arquitectura end-to-end sin cuellos de botella de información y control de voz por instrucciones en lenguaje natural, además de la latencia de 97 ms en modo streaming.

## Capacidades

- Síntesis de voz de alta calidad a partir de texto, con salida de audio muestreada a la frecuencia del codec del modelo.
- Diseño de voz (voice design): generación de un timbre concreto a partir de una descripción textual, sin audio de referencia.
- Control por instrucciones en lenguaje natural sobre timbre, emoción y prosodia (por ejemplo, indicar un tono enfadado o una dicción pausada).
- Generación multilingüe en 10 idiomas, con perfiles de voz dialectales adicionales según la model card.
- Generación en streaming con latencia extremo a extremo anunciada de 97 ms, adecuada para interacción conversacional.
- La familia Qwen3-TTS incluye variantes con clonación de voz, aunque esta ficha corresponde a la variante de diseño de voz; el alcance exacto de clonación en este checkpoint no se detalla en la información disponible.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso ni agentes: es un modelo de audio, no un LLM de propósito general.

## Casos de uso

- **Locución y audiolibros**: el modelo acepta instrucciones de emoción y prosodia, lo que permite generar distintas interpretaciones de un mismo párrafo y ajustar el ritmo de narración sin regrabar. La ventana de contexto no está documentada, por lo que conviene trocear el texto en fragmentos y concatenar el audio.
- **Doblaje y localización multilingüe**: con cobertura de 10 idiomas, un mismo guion puede sintetizarse en español, inglés, francés o portugués manteniendo un perfil de voz consistente definido por instrucción.
- **Asistentes de voz en tiempo real**: la latencia de 97 ms en streaming permite integrar el modelo en bucles de conversación por turnos, con respuesta hablada antes de que el usuario termine de leer la salida en pantalla.
- **Diseño de identidad sonora de marca**: la variante VoiceDesign puede crear una voz corporativa a partir de una descripción textual, evitando depender de un locutor humano y de sus derechos de imagen.
- **Accesibilidad y lectura de pantalla**: síntesis de contenido textual largo (documentación, correo, artículos) con control de velocidad y entonación mediante instrucciones, desplegable en local sobre GPU de consumo.
- **Prototipado de personajes en videojuegos**: generación de líneas de diálogo con emociones distintas para pruebas de concepto, antes de contratar grabaciones definitivas.
- **Generación de contenido para pódcast y vídeo**: producción de voces en off para piezas cortas, con capacidad de regenerar tomas modificando únicamente la instrucción de estilo.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible corresponden a la variante Base de la familia, evaluada sobre el conjunto de test Seed-TTS con Word Error Rate (menor es mejor):

| Modelo | test-zh (WER) | test-en (WER) |
|---|---|---|
| Qwen3-TTS-12Hz-1.7B-Base | 0,77 | 1,24 |

No se han publicado resultados de benchmarks específicos para la variante VoiceDesign en la información disponible, ni métricas de similitud de hablante, MOS o evaluación subjetiva.

## Requisitos de hardware

- **VRAM estimada para inferencia**: en bfloat16, los 1,9 mil millones de parámetros ocupan unos 3,8 GB; con el tokenizador de audio, cachés de atención y overhead del runtime, hay que prever un rango de 6 a 10 GB de VRAM.
- **GPU de datacenter**: A100 (40/80 GB), H100 y L40S sobran para el modelo; son útiles para servir varias instancias en paralelo o aumentar el batch.
- **GPU de consumo**: cabe en tarjetas de 12 GB o más, como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080 y RTX 4090. En tarjetas de 8 GB requeriría cuantización, opción no documentada por el autor.
- **Opciones de despliegue**: el paquete oficial `qwen-tts` (PyPI) sobre PyTorch, con `attn_implementation="flash_attention_2"` y `device_map` para reparto entre dispositivos. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- **Latencia y throughput**: la model card declara 97 ms de latencia extremo a extremo en generación en streaming. No se publican cifras de throughput (caracteres o segundos de audio por segundo) ni el hardware empleado en esa medición.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Licencia | Uso comercial | Rendimiento publicado |
|---|---|---|---|---|---|
| Qwen3-TTS-12Hz-1.7B-VoiceDesign (esta ficha) | ~1,92 B | 10 | Apache 2.0 | Sí | WER 0,77 zh / 1,24 en (variante Base, Seed-TTS) |
| CosyVoice 2 (Alibaba) | ~0,5 B | chino, inglés y otros | Apache 2.0 | Sí | no disponible en esta comparativa |
| XTTS-v2 (Coqui) | ~0,47 B | 17 | CPML (Coqui Public Model License) | No, restringido a uso no comercial | no disponible en esta comparativa |
| Kokoro-82M | ~82 M | principalmente inglés | Apache 2.0 | Sí | no disponible en esta comparativa |

Los datos de parámetros, idiomas y licencias de los modelos comparados provienen de su documentación pública respectiva; no se dispone de una evaluación homogénea que permita comparar calidad de audio entre ellos con las cifras aportadas en esta ficha.

## Limitaciones y advertencias

- **Repositorio no oficial**: el checkpoint analizado es una resubida del usuario Allinsama, con 0 descargas y 0 valoraciones. Para producción conviene descargar el modelo desde la colección oficial de Qwen y verificar el hash de los pesos.
- **Riesgo de alucinación en TTS**: los errores típicos se manifiestan como omisiones de palabras, repeticiones, pronunciaciones incorrectas o prosodia incoherente. El WER de 0,77 y 1,24 sobre Seed-TTS indica que el error no es nulo, y corresponde además a otra variante del modelo.
- **Ausencia de evaluación específica**: no hay benchmarks publicados para la variante VoiceDesign, ni métricas de naturalidad (MOS) ni de similitud de hablante.
- **Suplantación de identidad**: la familia incluye capacidades de clonación de voz. Cualquier uso con voces de terceros exige consentimiento explícito y cumplimiento de la normativa aplicable sobre datos biométricos y derechos de imagen.
- **Cobertura lingüística no verificada por idioma**: aunque se declaran 10 idiomas, no se publican métricas desagregadas; el rendimiento en español no está cuantificado en la información disponible.
- **Contexto no documentado**: se desconoce la longitud máxima de texto por petición, lo que afecta al diseño de pipelines para documentos largos.
- **Licencia**: Apache 2.0 permite uso comercial y modificaciones, pero no exime de responsabilidad sobre el contenido generado ni sobre los derechos de las voces sintetizadas.
- **Cuantización no soportada oficialmente**: sin variantes GGUF ni cuantizadas publicadas, el despliegue en hardware por debajo de 8 GB de VRAM no está cubierto por la documentación.

## Enlaces

- Modelo en HuggingFace (esta resubida): https://huggingface.co/Allinsama/Qwen__Qwen3-TTS-12Hz-1.7B-VoiceDesign
- Colección oficial Qwen3-TTS en HuggingFace: https://huggingface.co/collections/Qwen/qwen3-tts
- Colección en ModelScope: https://modelscope.cn/collections/Qwen/Qwen3-TTS
- Blog de presentación: https://qwen.ai/blog?id=qwen3tts-0115
- Paper (arXiv 2601.15621): https://huggingface.co/papers/2601.15621
- Repositorio de código: https://github.com/QwenLM/Qwen3-TTS
