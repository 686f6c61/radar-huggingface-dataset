# dtxing/Fun-CosyVoice3-0.5B-2512

## Resumen

Fun-CosyVoice3-0.5B-2512 es un sistema de síntesis de voz (text-to-speech, TTS) basado en grandes modelos de lenguaje (LLM), desarrollado por el equipo FunAudioLLM de Alibaba. Es la tercera generación de la familia CosyVoice y supone una mejora significativa respecto a CosyVoice 2.0 en consistencia de contenido, similitud de hablante y naturalidad prosódica. El modelo está diseñado para síntesis de voz multilingüe zero-shot en entornos reales, con soporte para 9 idiomas y más de 18 dialectos o acentos del chino.

Con 0.5 mil millones de parámetros, el modelo destaca por su capacidad de clonación de voz zero-shot tanto multilingüe como cross-lingüe, así como por funciones avanzadas como el inpainting de pronunciación (pinyin chino y fonemas CMU inglés), normalización de texto sin módulo frontend tradicional, y streaming bidireccional con latencia de hasta 150 ms. Se distribuye bajo licencia Apache 2.0, lo que permite uso comercial y modificación. Su relevancia actual radica en ser uno de los TTS open source más completos en cuanto a cobertura lingüística y control fino, con una versión entrenada mediante aprendizaje por refuerzo (RL) que mejora aún más los resultados en métricas objetivas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS basado en LLM (no se especifica el tipo exacto de transformer) |
| Parametros totales | 0.5 mil millones (0.5B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio incluye pesos en safetensors y onnx) |
| Idiomas soportados | chino (zh), ingles (en), frances (fr), español (es), japones (ja), coreano (ko), italiano (it), ruso (ru), aleman (de) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, onnx |

## Arquitectura y entrenamiento

La arquitectura exacta no se detalla en la documentacion publica, pero se sabe que es un sistema TTS basado en LLM, siguiendo la linea de CosyVoice 2.0: un modelo de lenguaje autoregresivo genera tokens de codigo de audio a partir del texto y una referencia de voz, y un decodificador basado en flow matching convierte esos tokens en la forma de onda final. CosyVoice 3.0 introduce mejoras en la consistencia del contenido, la similitud del hablante y la naturalidad, aunque no se publican detalles sobre el dataset de entrenamiento (numero de tokens, composicion, etc.).

El modelo se entrena en dos variantes: una base y una version afinada con aprendizaje por refuerzo (RL) mediante GRPO (Group Relative Policy Optimization), como se menciona en el roadmap. Tambien se ha anadido soporte para runtime Triton TRT-LLM y vLLM, lo que facilita el despliegue en produccion. Entre las innovaciones tecnicas destacan el inpainting de pronunciacion (permite corregir fonemas especificos), la normalizacion de texto integrada sin frontend tradicional, y el streaming bidireccional (entrada de texto y salida de audio en streaming) con latencia minima de 150 ms.

## Capacidades

- Sintesis de voz multilingue en 9 idiomas: chino, ingles, frances, español, japones, coreano, italiano, ruso y aleman.
- Clonacion de voz zero-shot multilingue y cross-lingue: a partir de una muestra de audio de referencia, el modelo puede generar voz en otro idioma manteniendo la identidad del hablante.
- Soporte de mas de 18 dialectos y acentos del chino, como cantonés, minnan, sichuan, dongbei, shanxi, shanghai, tianjin, shandong, ningxia, gansu, entre otros.
- Inpainting de pronunciacion: permite especificar la pronunciacion correcta mediante pinyin chino o fonemas CMU ingles, util para nombres propios o terminos tecnicos.
- Normalizacion de texto integrada: lee numeros, simbolos especiales y formatos variados sin necesidad de un modulo frontend externo.
- Streaming bidireccional: soporta entrada de texto en streaming y salida de audio en streaming, con latencia de hasta 150 ms.
- Control por instrucciones: permite especificar idioma, dialecto, emocion, velocidad y volumen mediante instrucciones en lenguaje natural.
- Generacion de voz con alta consistencia de contenido y naturalidad prosodica, segun los resultados de evaluacion publicados.

## Casos de uso

- Atencion al cliente automatizada multilingue: el modelo puede gestionar conversaciones de voz en varios idiomas con clonacion de voz de agentes, manteniendo una identidad de marca consistente. Su capacidad de streaming de baja latencia (150 ms) permite respuestas casi en tiempo real en sistemas IVR o chatbots de voz.
- Audiolibros y narracion: gracias a la naturalidad prosodica y al control de emociones, es adecuado para generar audiolibros en multiples idiomas, con la posibilidad de clonar la voz de un narrador concreto a partir de una muestra corta.
- Asistentes de voz en tiempo real: el streaming bidireccional y la baja latencia lo hacen apto para asistentes personales o dispositivos IoT que requieren interaccion conversacional fluida.
- Doblaje de video y localizacion: la clonacion cross-lingue permite doblar contenido audiovisual manteniendo la voz del actor original en otro idioma, reduciendo costes de produccion.
- Accesibilidad: puede utilizarse en lectores de pantalla para personas con discapacidad visual, ofreciendo voces naturales en varios idiomas y dialectos.
- Creacion de contenido para redes sociales: generacion rapida de locuciones para videos cortos, podcasts o anuncios, con control de velocidad, volumen y emocion mediante instrucciones.
- Traduccion de voz a voz: combinando la clonacion de voz y el soporte multilingue, se puede implementar un sistema de interpretacion simultanea que mantiene la voz del hablante original.
- Prototipado de voces personalizadas: en desarrollo de productos, permite generar voces sinteticas para pruebas de usuario sin necesidad de grabar a actores de voz.

## Benchmarks y rendimiento

La tabla siguiente reproduce los resultados publicados en la model card del modelo, comparando Fun-CosyVoice3-0.5B-2512 (base y version RL) con otros sistemas TTS open source y propietarios. Las metricas incluyen tasa de error de caracteres (CER) para chino y tasa de error de palabras (WER) para ingles, junto con la similitud de hablante (Speaker Similarity) en porcentaje. Valores mas bajos de CER/WER indican mejor consistencia de contenido; valores mas altos de similitud indican mayor fidelidad a la voz de referencia.

| Modelo | Open-Source | Tamano | test-zh CER (%) ↓ | test-zh Similitud (%) ↑ | test-en WER (%) ↓ | test-en Similitud (%) ↑ | test-hard CER (%) ↓ | test-hard Similitud (%) ↑ |
|---|---|---|---|---|---|---|---|---|
| Humano | - | - | 1.26 | 75.5 | 2.14 | 73.4 | - | - |
| Seed-TTS | No | - | 1.12 | 79.6 | 2.25 | 76.2 | 7.59 | 77.6 |
| MiniMax-Speech | No | - | 0.83 | 78.3 | 1.65 | 69.2 | - | - |
| F5-TTS | Si | 0.3B | 1.52 | 74.1 | 2.00 | 64.7 | 8.67 | 71.3 |
| Spark TTS | Si | 0.5B | 1.2 | 66.0 | 1.98 | 57.3 | - | - |
| CosyVoice2 | Si | 0.5B | 1.45 | 75.7 | 2.57 | 65.9 | 6.83 | 72.4 |
| FireRedTTS2 | Si | 1.5B | 1.14 | 73.2 | 1.95 | 66.5 | - | - |
| Index-TTS2 | Si | 1.5B | 1.03 | 76.5 | 2.23 | 70.6 | 7.12 | 75.5 |
| VibeVoice-1.5B | Si | 1.5B | 1.16 | 74.4 | 3.04 | 68.9 | - | - |
| VibeVoice-Realtime | Si | 0.5B | - | - | 2.05 | 63.3 | - | - |
| HiggsAudio-v2 | Si | 3B | 1.50 | 74.0 | 2.44 | 67.7 | - | - |
| VoxCPM | Si | 0.5B | 0.93 | 77.2 | 1.85 | 72.9 | 8.87 | 73.0 |
| GLM-TTS | Si | 1.5B | 1.03 | 76.1 | - | - | - | - |
| GLM-TTS RL | Si | 1.5B | 0.89 | 76.4 | - | - | - | - |
| Fun-CosyVoice3-0.5B-2512 | Si | 0.5B | 1.21 | 78.0 | 2.24 | 71.8 | 6.71 | 75.8 |
| Fun-CosyVoice3-0.5B-2512_RL | Si | 0.5B | 0.81 | 77.4 | 1.68 | 69.5 | 5.44 | 75.0 |

La version RL del modelo consigue el mejor CER en chino (0.81) entre todos los modelos comparados, superando incluso a sistemas propietarios como Seed-TTS y MiniMax-Speech. En ingles, el WER de 1.68 es competitivo con los mejores resultados. La similitud de hablante es ligeramente inferior a la version base, pero sigue siendo alta.

## Requisitos de hardware

- No se han publicado requisitos oficiales de hardware para este modelo.
- El tamano del repositorio es de 11.8 GB, lo que incluye pesos en safetensors y onnx, asi como posiblemente los componentes del decodificador de audio.
- Al tratarse de un modelo de 0.5B de parametros, es probable que pueda ejecutarse en GPUs de consumo como la RTX 3060 (12 GB) o RTX 4090 (24 GB) con cuantizacion, aunque no hay datos confirmados.
- Para despliegue en produccion, se recomienda utilizar el codigo oficial del repositorio CosyVoice en GitHub, que incluye soporte para vLLM (anadido para CosyVoice2) y runtime Triton TRT-LLM (contribucion de NVIDIA).
- No se especifican metricas de latencia o throughput mas alla de la latencia de streaming de 150 ms mencionada en las caracteristicas.
- Dado el peso del modelo, es factible ejecutarlo en CPU para inferencia no interactiva, aunque con mayor latencia.

## Comparativa con modelos similares

La siguiente tabla compara Fun-CosyVoice3-0.5B-2512 con otros TTS open source de tamano similar (0.5B) o superior, basandose en los datos publicados en la model card.

| Modelo | Parametros | Idiomas | Licencia | test-zh CER (%) ↓ | test-en WER (%) ↓ | Disponibilidad |
|---|---|---|---|---|---|---|
| Fun-CosyVoice3-0.5B-2512 | 0.5B | 9 | Apache 2.0 | 1.21 | 2.24 | HuggingFace, Modelscope |
| CosyVoice2-0.5B | 0.5B | 9 | Apache 2.0 | 1.45 | 2.57 | HuggingFace, Modelscope |
| F5-TTS | 0.3B | 4 (en, zh, ja, ko) | MIT | 1.52 | 2.00 | HuggingFace |
| Spark TTS | 0.5B | 2 (en, zh) | Apache 2.0 | 1.2 | 1.98 | HuggingFace |
| VoxCPM | 0.5B | 6 (en, zh, ja, ko, fr, de) | Apache 2.0 | 0.93 | 1.85 | HuggingFace |
| Index-TTS2 | 1.5B | 6 (en, zh, ja, ko, fr, de) | Apache 2.0 | 1.03 | 2.23 | HuggingFace |

Fun-CosyVoice3 supera a CosyVoice2 en todas las metricas, y ofrece una cobertura de idiomas mas amplia que F5-TTS y Spark TTS. VoxCPM tiene mejor CER en chino, pero Fun-CosyVoice3 destaca en similitud de hablante (78.0% frente a 77.2%) y en el conjunto test-hard (6.71 frente a 8.87). La version RL de Fun-CosyVoice3 (no mostrada en esta tabla) alcanza un CER de 0.81, el mejor de todos los modelos comparados.

## Limitaciones y advertencias

- No se han documentado limitaciones especificas en la model card del autor.
- Como todo sistema TTS basado en LLM, existe riesgo de alucinacion en la pronunciacion de palabras poco frecuentes o nombres propios, aunque el inpainting de pronunciacion mitiga parcialmente este problema.
- La cobertura de idiomas se limita a 9 lenguas; no incluye arabe, portugues, hindi u otros idiomas de amplio uso.
- Aunque soporta 18+ dialectos chinos, la calidad puede variar entre dialectos y no se garantiza un rendimiento uniforme.
- La version RL puede comportarse de forma diferente a la version base en ciertos contextos; se recomienda evaluar ambas antes de elegir una para produccion.
- El modelo requiere un proceso de instalacion complejo (conda, dependencias como sox, ttsfrd) que puede suponer una barrera para usuarios sin experiencia en entornos Linux.
- Aunque la licencia Apache 2.0 permite uso comercial, es recomendable revisar los terminos de los modelos base y las contribuciones de terceros (por ejemplo, el paquete ttsfrd) para asegurar el cumplimiento.

## Enlaces

- Repositorio en HuggingFace (mirror de dtxing): https://huggingface.co/dtxing/Fun-CosyVoice3-0.5B-2512
- Repositorio oficial en HuggingFace: https://huggingface.co/FunAudioLLM/Fun-CosyVoice3-0.5B-2512
- Pagina en Modelscope: https://www.modelscope.cn/models/FunAudioLLM/Fun-CosyVoice3-0.5B-2512
- Paper de CosyVoice 3: https://arxiv.org/abs/2505.17589
- Paper de CosyVoice 2: https://arxiv.org/abs/2412.10117
- Paper de CosyVoice 1: https://arxiv.org/abs/2407.05407
- Demos de CosyVoice 3: https://funaudiollm.github.io/cosyvoice3/
- Conjunto de evaluacion CV3-Eval: https://github.com/FunAudioLLM/CV3-Eval
- Repositorio de codigo CosyVoice: https://github.com/FunAudioLLM/CosyVoice
