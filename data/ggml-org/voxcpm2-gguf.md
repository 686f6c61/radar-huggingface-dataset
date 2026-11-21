# ggml-org/VoxCPM2-GGUF

## Resumen

VoxCPM2 es un modelo de síntesis de voz (text-to-speech) desarrollado originalmente por OpenBMB y distribuido en formato GGUF por ggml-org para su uso con el ecosistema llama.cpp. El modelo base `openbmb/VoxCPM2` se ha convertido automáticamente mediante la herramienta `ggml-org/convert`, lo que permite ejecutarlo en CPU y GPU a través de las herramientas `llama-tts` y `llama serve` con un endpoint `/tts` dedicado. Con aproximadamente 1.470 millones de parámetros y un tamaño de repositorio de 6,5 GB, se posiciona como una alternativa de tamaño medio para generación de voz de calidad en entornos locales.

La característica diferencial del modelo es su capacidad de controlar la voz mediante descripciones en lenguaje natural entre paréntesis al inicio del texto (por ejemplo, `(A calm male narrator)`), lo que permite ajustar el timbre y el estilo sin necesidad de referencias de audio. Además, soporta clonación de voz mediante un archivo de referencia (`--tts-speaker-file`) sin requerir transcripción del clip, lo que simplifica los flujos de trabajo de personalización.

El modelo es multilingüe y detecta el idioma a partir del propio texto de entrada, sin necesidad de especificar un código de idioma. Su licencia Apache 2.0 facilita el uso comercial, y su integración en llama.cpp lo hace accesible tanto en servidores como en hardware de consumo, lo que resulta relevante para desarrolladores que necesitan TTS local sin depender de servicios en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de síntesis de voz; detalles del backbone no especificados en la información proporcionada) |
| Parametros totales | 1.471.744.128 |
| Parametros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF cuantizado (los tipos concretos no se detallan en la información proporcionada) |
| Idiomas soportados | multilingüe (el idioma se infiere del texto de entrada; lista concreta no disponible) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo en la documentación proporcionada. Se trata de un modelo de texto a voz (pipeline `text-to-speech`) con 1.471.744.128 parámetros, lo que sugiere un backbone de tipo transformer de tamaño medio, pero no se confirma la arquitectura exacta, el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

La innovación técnica destacable, según la model card, es el control de la voz mediante descripciones textuales entre paréntesis al inicio del texto, así como la clonación de voz con un clip de referencia sin transcripción. La conversión a GGUF la realiza automáticamente la herramienta `ggml-org/convert`, lo que implica que los pesos originales de `openbmb/VoxCPM2` se han transformado para su ejecución en llama.cpp. No se detallan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de voz a partir de texto (text-to-speech) con salida en formato WAV.
- Control de la voz mediante descripciones en lenguaje natural entre paréntesis al inicio del texto (por ejemplo, `(A young woman, gentle and warm)`).
- Clonación de voz mediante un clip de referencia (`--tts-speaker-file`) sin necesidad de transcripción.
- Soporte multilingüe: el idioma de salida se corresponde con el idioma del texto de entrada.
- Ejecución local mediante `llama-tts` (CLI) y `llama serve` con endpoint `/tts`.
- Compatibilidad con endpoints (tag `endpoints_compatible` en Hugging Face).
- Capacidad conversacional (tag `conversational`), orientada a la síntesis de voz en diálogos.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada.

## Casos de uso

- **Atención al cliente automatizada con voz**: el modelo puede generar respuestas habladas en el idioma del usuario, integrándose en un pipeline de chat donde el texto de respuesta se sintetiza a voz. La clonación de voz permite mantener una identidad de marca consistente mediante un clip de referencia del locutor corporativo.
- **Locución y doblaje de contenido**: generación de pistas de voz para vídeos, pódcast o audiolibros, usando descripciones de voz entre paréntesis para ajustar el tono (narrador calmado, presentadora enérgica) sin necesidad de grabar nuevas muestras.
- **Asistentes de voz locales y privados**: despliegue con `llama serve` en infraestructura propia para asistentes que no pueden enviar texto a servicios en la nube, gracias a la licencia Apache 2.0 y a la ejecución local en llama.cpp.
- **Accesibilidad**: conversión de texto a voz para lectores de pantalla o aplicaciones de accesibilidad, con la posibilidad de clonar la voz del propio usuario a partir de un clip de referencia para una experiencia más personal.
- **Prototipado rápido de interfaces de voz**: uso del CLI `llama-tts` para generar muestras WAV en segundos durante el desarrollo de un producto, sin necesidad de configurar un servidor TTS completo.
- **Generación de voces para videojuegos y contenido interactivo**: síntesis de diálogos de personajes con descripciones de voz distintas por personaje, aprovechando la inferencia de idioma a partir del texto para contenido multilingüe.
- **Investigación en TTS**: evaluación y experimentación con un modelo de 1,47 mil millones de parámetros en formato GGUF, con posibilidad de comparar cuantizaciones y medir latencia en hardware de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un modelo de 1,47 mil millones de parámetros en GGUF requiere del orden de 1 a 3 GB de memoria según la cuantización empleada (cifra estimada, no confirmada por el autor).
- GPU recomendadas: no especificadas en la información proporcionada. Por tamaño, el modelo es apto para GPUs de consumo como RTX 3060, RTX 4060 o superiores, así como para A100/H100 en despliegues de mayor concurrencia.
- Cabe en GPU de consumo: sí, previsiblemente en la mayoría de GPUs con 4 GB o más de VRAM, dado el tamaño del modelo y el formato GGUF (estimación no confirmada oficialmente).
- Opciones de despliegue: `llama-tts` (CLI) y `llama serve` con endpoint `/tts`, ambos del ecosistema llama.cpp. No se documentan otras opciones como vLLM o TGI para este modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| VoxCPM2 (GGUF, ggml-org) | 1.471.744.128 | no disponible | GGUF | Apache 2.0 | TTS multilingüe con control de voz por descripción y clonación sin transcripción |
| openbmb/VoxCPM2 (original) | 1.471.744.128 | no disponible | safetensors (presumiblemente) | Apache 2.0 | Modelo base del que deriva esta conversión GGUF |
| Alternativas TTS de tamaño similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de benchmarks ni de modelos comparables en la información proporcionada |

No se dispone de datos de rendimiento comparativo con otros modelos TTS en la información proporcionada.

## Limitaciones y advertencias

- No se han publicado datos sobre sesgos del modelo; al ser un modelo de voz, puede reproducir sesgos de acento, género o edad presentes en los datos de entrenamiento.
- Riesgo de alucinación no aplicable en el sentido textual, pero la síntesis puede producir artefactos, prosodia incorrecta o pronunciaciones erróneas en palabras poco frecuentes o nombres propios.
- La lista concreta de idiomas soportados no está disponible; el modelo infiere el idioma del texto, pero la calidad puede variar entre idiomas.
- No se documentan límites de longitud de texto por inferencia; textos muy largos podrían requerir fragmentación manual.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base `openbmb/VoxCPM2` y de los datos de entrenamiento originales.
- La clonación de voz plantea riesgos éticos y legales (suplantación de identidad, deepfakes); es responsabilidad del usuario obtener consentimiento y cumplir la normativa aplicable.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de validación en producción.
- La conversión es automática mediante `ggml-org/convert`; pueden existir diferencias de calidad respecto al modelo original en safetensors.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/ggml-org/VoxCPM2-GGUF
- Modelo base original: https://huggingface.co/openbmb/VoxCPM2
- Documentación de TTS en llama.cpp: https://github.com/ggml-org/llama.cpp/blob/master/docs/multimodal/tts.md#voxcpm2
- Herramienta de conversión: https://github.com/ggml-org/convert
