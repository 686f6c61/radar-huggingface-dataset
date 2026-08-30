# Rin247/Qwen3-TTS-12Hz-0.6B-Base-INT4

## Resumen

Qwen3-TTS-12Hz-0.6B-Base-INT4 es una versión cuantizada a INT4 del modelo base de la familia Qwen3-TTS, desarrollada por el equipo de Qwen (Alibaba) y publicada en Hugging Face por el usuario Rin247. Se trata de un modelo de síntesis de voz (text-to-speech) multilingüe, entrenado con más de 5 millones de horas de datos de audio en 10 idiomas, que permite clonación de voz a partir de una muestra de referencia de solo 3 segundos y control de la voz mediante descripciones en lenguaje natural.

La arquitectura se basa en un modelo de lenguaje autoregresivo con tokenización acústica a 12 Hz (Qwen3-TTS-Tokenizer-12Hz) y un esquema de multi-codebook discreto, lo que permite una generación de voz de baja latencia (hasta 97 ms de latencia extremo a extremo) y alta calidad. Esta versión INT4 reduce el tamaño del modelo original de 0.6B parámetros (651.974.720 parámetros en total) para facilitar su despliegue en hardware con recursos limitados, manteniendo las capacidades de clonación de voz y control por descripción.

La relevancia de este modelo radica en que democratiza la clonación de voz de alta calidad con una licencia Apache 2.0, permitiendo uso comercial y aplicaciones en tiempo real gracias a su baja latencia. La cuantización INT4 lo hace especialmente atractivo para entornos de producción con GPUs de consumo o inferencia en el borde.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje autoregresivo con tokenizador acustico de 12 Hz y multi-codebook discreto |
| Parametros totales | 651.974.720 (0.6B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | INT4 (weight-only) |
| Idiomas soportados | Chino, ingles, japones, coreano, aleman, frances, ruso, portugues, espanol, italiano |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo Qwen3-TTS-12Hz-0.6B-Base emplea una arquitectura de modelo de lenguaje (LM) autoregresivo que opera sobre tokens acusticos discretos generados por el tokenizador propietario Qwen3-TTS-Tokenizer-12Hz. Este tokenizador comprime la senal de audio a una frecuencia de 12 Hz, logrando una representacion acustica eficiente y de alta dimensionalidad semantica. El modelo utiliza un esquema de multi-codebook, donde cada paso temporal predice multiples codigos que representan diferentes aspectos de la senal de voz, lo que permite una reconstruccion completa de la informacion acustica.

El entrenamiento se realizo con mas de 5 millones de horas de datos de voz en 10 idiomas principales, incluyendo perfiles dialectales variados. No se menciona el uso de tecnicas de RLHF o DPO, ya que al ser un modelo de generacion de audio, el entrenamiento se centra en la modelizacion de la distribucion de tokens acusticos condicionada al texto y a la referencia de voz. La innovacion clave reside en la combinacion de la tokenizacion a 12 Hz con la arquitectura LM, que permite tanto la clonacion de voz rapida (3 segundos de audio de referencia) como el control fino de atributos acusticos mediante instrucciones en lenguaje natural.

## Capacidades

- Generacion de voz multilingue de alta calidad en 10 idiomas: chino, ingles, japones, coreano, aleman, frances, ruso, portugues, espanol e italiano.
- Clonacion de voz a partir de una muestra de referencia de 3 segundos, sin necesidad de entrenamiento adicional.
- Control de la voz mediante descripciones en lenguaje natural, permitiendo ajustar atributos como tono, velocidad, emocion o estilo.
- Generacion de voz en streaming con latencia extremo a extremo de hasta 97 ms, adecuada para interacciones en tiempo real.
- Soporte para sintesis de voz con contenido mixto, incluyendo formulas matematicas, simbolos y emojis, como se muestra en el ejemplo de la documentacion.
- Capacidad de generar voz con multiples perfiles dialectales dentro de los idiomas soportados.

## Casos de uso

- Asistentes virtuales personalizados: el modelo permite clonar la voz de un usuario o de un personaje con solo 3 segundos de audio, lo que posibilita crear asistentes con una identidad vocal unica y coherente en multiples interacciones.
- Doblaje de contenido audiovisual: gracias a la clonacion de voz y al control por descripcion, se puede generar doblaje en varios idiomas manteniendo la voz original del actor, reduciendo costes de produccion.
- Audiolibros y narracion automatizada: la capacidad de controlar el estilo y la emocion mediante lenguaje natural permite generar narraciones expresivas para libros, articulos o noticias, adaptadas al tono deseado.
- Accesibilidad para personas con discapacidad visual o dificultades de lectura: el modelo puede convertir texto en voz de forma natural y con baja latencia, integrable en lectores de pantalla o aplicaciones de lectura.
- Atencion al cliente automatizada: la baja latencia (97 ms) y la clonacion de voz permiten crear sistemas de respuesta de voz interactivos que suenan naturales y pueden personalizarse con la voz de la marca o de un agente especifico.
- Educacion y aprendizaje de idiomas: el modelo puede generar ejemplos de pronunciacion en 10 idiomas, con control sobre la velocidad y el acento, util para aplicaciones de practica de conversacion.
- Creacion de contenido para redes sociales y marketing: permite generar voces personalizadas para videos, podcasts o anuncios sin necesidad de grabar locuciones, con la posibilidad de ajustar el estilo mediante descripciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del modelo original no incluye tablas comparativas con otros sistemas de TTS, ni metricas objetivas como MOS (Mean Opinion Score) o WER (Word Error Rate). Se recomienda consultar el paper tecnico (arXiv:2601.15621) para posibles evaluaciones adicionales, aunque no estan accesibles en los materiales proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 0.6B parametros cuantizado a INT4, el peso del modelo ocupa aproximadamente 0.3 GB (651M parametros × 4 bits). Con overhead de activaciones y buffers, se estima que puede funcionar en GPUs con al menos 2-4 GB de VRAM, aunque no hay datos oficiales de consumo.
- GPU recomendadas: cualquier GPU moderna con soporte CUDA y al menos 4 GB de VRAM, como NVIDIA GTX 1650, RTX 2060, RTX 3060 o superiores. Para despliegues en produccion con multiples peticiones, se recomienda una GPU con 8 GB o mas (RTX 3070, RTX 4080, A10, L4).
- Compatibilidad con GPUs de consumo: si, el modelo cabe en GPUs de consumo de gama media y baja gracias a la cuantizacion INT4.
- Opciones de despliegue: el modelo se puede cargar con la libreria `qwen-tts` (pip install qwen-tts) y ejecutar en local con PyTorch. Tambien es compatible con `flash-attn` para optimizar la atencion. No se menciona soporte explicito para vLLM, llama.cpp u Ollama, ya que es un modelo de audio, no de texto.
- Latencia y throughput: la latencia extremo a extremo declarada es de 97 ms en modo streaming, pero el throughput real dependera del hardware y de la longitud del texto de entrada. No se proporcionan datos de throughput en la informacion disponible.

## Comparativa con modelos similares

No se dispone de informacion suficiente para realizar una comparativa cuantitativa con otros modelos de TTS de tamano similar. Los modelos comparables en el ecosistema open source incluyen:

| Modelo | Parametros | Idiomas | Clonacion de voz | Licencia | Contexto |
|---|---|---|---|---|---|
| Qwen3-TTS-12Hz-0.6B-Base (INT4) | 0.6B | 10 | Si (3 s) | Apache 2.0 | Este modelo |
| XTTS v2 (Coqui) | 0.4B | 17 | Si | CPML (no comercial) | Alternativa popular, pero con restricciones de licencia |
| VITS | ~0.1B | Multi | No | MIT | Modelo clasico, sin clonacion de voz |
| Bark (Suno) | ~1.2B | 13 | No | MIT | Genera voz y efectos, pero sin clonacion directa |

La comparacion se basa en caracteristicas generales conocidas, no en benchmarks publicados. Qwen3-TTS destaca por su licencia permisiva (Apache 2.0) y su capacidad de clonacion de voz con solo 3 segundos de audio, ademas de su baja latencia.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse con datos de voz de multiples fuentes, el modelo puede reflejar sesgos en la pronunciacion o en los acentos de los hablantes representados en el dataset. No se han publicado evaluaciones especificas de sesgo.
- Riesgo de alucinacion: en el contexto de TTS, el riesgo de alucinacion se manifiesta en la generacion de audio que no corresponde fielmente al texto de entrada, especialmente con textos complejos o poco comunes. No se han reportado casos concretos, pero es un riesgo inherente a los modelos generativos.
- Limitaciones de contexto: la longitud de contexto no esta especificada, por lo que textos muy largos pueden requerir segmentacion. La generacion en streaming sugiere que el modelo procesa el texto de forma incremental, pero no se garantiza un manejo optimo de parrafos extensos.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial y modificacion, pero se debe mantener el aviso de copyright y la atribucion. No hay restricciones adicionales conocidas.
- Caveats para produccion: la clonacion de voz plantea riesgos de suplantacion de identidad y uso fraudulento. Se recomienda implementar mecanismos de verificacion y consentimiento antes de desplegar aplicaciones que clonen voces de personas reales. Ademas, la cuantizacion INT4 puede degradar ligeramente la calidad del audio en comparacion con el modelo en bfloat16, aunque no se han publicado evaluaciones objetivas de esta perdida.

## Enlaces

- Modelo original en Hugging Face: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-0.6B-Base
- Modelo cuantizado INT4 (este repositorio): https://huggingface.co/Rin247/Qwen3-TTS-12Hz-0.6B-Base-INT4
- Paper tecnico (arXiv): https://huggingface.co/papers/2601.15621
- Repositorio GitHub: https://github.com/QwenLM/Qwen3-TTS
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/Qwen/Qwen3-TTS
- Modelo en ModelScope: https://www.modelscope.cn/models/Qwen/Qwen3-TTS-12Hz-0.6B-Base
