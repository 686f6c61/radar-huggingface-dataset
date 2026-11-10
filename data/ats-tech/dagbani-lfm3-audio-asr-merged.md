# ats-tech/dagbani-lfm3-audio-asr-merged

## Resumen

LFM3-Audio-2B es un modelo de audio compacto desarrollado por Liquid AI, publicado en Hugging Face bajo el identificador `ats-tech/dagbani-lfm3-audio-asr-merged`. Forma parte de la familia LFM3, que incluye variantes base, de texto, de visión, de audio, omni y de decisión. El modelo acepta texto o audio como entrada y genera texto, voz o ambos, lo que lo convierte en un sistema any-to-any orientado a conversación por voz, transcripción multilingüe y comprensión de audio.

Con aproximadamente 1.977 millones de parámetros (2B), está diseñado para ejecutarse localmente en portátiles y dispositivos edge. La arquitectura combina un backbone LFM3 con un codificador de audio causal propio y un tokenizador de audio denominado LiquidCodec, que según el autor mejora la calidad de la síntesis de voz respecto a LFM2.5-Audio. Soporta 18 idiomas para tareas de reconocimiento y síntesis de voz.

Su relevancia actual radica en la combinación de tamaño reducido, capacidades multimodales de audio y soporte de tool calling en un único modelo desplegable en hardware de consumo, lo que habilita asistentes de voz y pipelines de transcripción sin depender de APIs en la nube. La licencia es LFM1.0 (lfm1.0), lo que condiciona el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone LFM3 con codificador de audio causal y tokenizador de audio LiquidCodec |
| Parametros totales | 1.977.548.032 (2B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ar, da, de, el, fi, fr, he, it, ja, ko, nl, pl, pt, es, sv, tr, zh |
| Licencia | lfm1.0 (license_name: lfm1.0, license: other) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se construye sobre el backbone LFM3, al que se añaden un codificador de audio causal y el tokenizador LiquidCodec. Esta combinación permite procesar audio de forma incremental (causal) y generar tanto texto como tokens de audio para síntesis de voz. El pipeline declarado es any-to-any, con soporte de entrada de texto y audio y salida de texto y voz. El modelo requiere código personalizado (`custom_code`), por lo que su carga en transformers depende de módulos específicos del repositorio.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se detallan innovaciones adicionales como decodificación especulativa o mecanismos de atención lineal. El autor sí destaca que el codificador de audio y el tokenizador LiquidCodec son desarrollos propios que mejoran la calidad de voz frente a LFM2.5-Audio.

## Capacidades

- Conversación por voz: permite formular preguntas habladas y recibir respuestas en streaming en texto y voz. Las respuestas solo de texto pueden incluir razonamiento previo. El modo de chat por voz está soportado únicamente en inglés.
- Transcripción de voz multilingüe en 18 idiomas.
- Síntesis de voz (text-to-speech) en los idiomas soportados.
- Traducción de voz entre los idiomas soportados.
- Comprensión y razonamiento sobre audio: interpreta grabaciones y responde preguntas sobre el habla, los sonidos y los eventos contenidos.
- Tool calling: convierte peticiones habladas en llamadas a herramientas para controlar aplicaciones y dispositivos, con texto o voz junto a las llamadas.
- Generación de texto como parte del pipeline any-to-any.
- No se documentan capacidades de visión ni de procesamiento de vídeo en la información disponible.

## Casos de uso

- Asistentes de voz locales en portátiles y dispositivos edge: el modelo puede ejecutarse en hardware de consumo y gestionar conversaciones habladas con respuestas en texto y voz, lo que permite asistentes sin conexión a la nube y con baja dependencia de latencia de red.
- Transcripción multilingüe de reuniones y notas de voz: con soporte para 18 idiomas, puede transcribir grabaciones y generar actas o resúmenes en texto a partir del audio.
- Traducción de voz en tiempo real: útil en atención al cliente internacional o en herramientas de comunicación, traduciendo el habla entre los idiomas soportados.
- Control por voz de aplicaciones y dispositivos: mediante tool calling, el modelo traduce peticiones habladas en llamadas a funciones, adecuado para domótica, asistentes de escritorio o interfaces manos libres.
- Análisis de contenido audio: interpretación de grabaciones para responder preguntas sobre eventos sonoros, útil en monitorización, accesibilidad o análisis de llamadas.
- Generación de voz para accesibilidad y lectura: síntesis de texto a voz en varios idiomas para lectores de pantalla, audiolibros o interfaces conversacionales.
- Prototipado de agentes conversacionales en investigación: su tamaño de 2B y su licencia permiten experimentar con pipelines any-to-any en entornos académicos y de desarrollo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1.977 millones de parámetros, en precisión completa (fp32) se requieren aproximadamente 8 GB solo para pesos; en fp16/bf16, unos 4 GB; en cuantizaciones de 8 bits, alrededor de 2 GB, y en 4 bits, en torno a 1-1,5 GB. Estas estimaciones no incluyen el coste del codificador de audio ni de la caché de contexto, por lo que deben considerarse cotas inferiores.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, cabría esperar funcionamiento en GPUs de consumo con suficiente VRAM, pero no se confirma.
- Cabe en GPU de consumo: el autor indica que el modelo está pensado para ejecutarse localmente en portátiles y dispositivos edge, lo que sugiere compatibilidad con hardware de consumo, aunque no se especifican modelos concretos.
- Opciones de despliegue: la librería declarada es transformers con `custom_code`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| LFM3-Audio-2B (este) | 2B | no disponible | 18 | lfm1.0 | Audio any-to-any con tool calling y ejecución edge |
| LFM2.5-Audio | no disponible | no disponible | no disponible | no disponible | Predecesor citado por el autor; el codificador y tokenizador de LFM3 mejoran la calidad de voz |
| Otros modelos de audio de tamano similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

No se dispone de información suficiente para comparar parámetros, contexto, rendimiento y disponibilidad con alternativas concretas de la misma categoría.

## Limitaciones y advertencias

- El modo de conversación por voz (voice chat) solo está soportado en inglés, según la model card.
- No se documentan sesgos conocidos, pero al ser un modelo entrenado con datos no especificados, existe riesgo de sesgos lingüísticos y culturales, especialmente fuera del inglés.
- Riesgo de alucinación inherente a los modelos generativos, tanto en texto como en transcripción y respuestas sobre audio; no se han publicado evaluaciones que lo cuantifiquen.
- La licencia lfm1.0 (license: other) impone condiciones específicas; es necesario revisar el archivo LICENSE antes de cualquier uso comercial.
- El modelo requiere `custom_code` para cargarse en transformers, lo que puede complicar el despliegue en entornos con restricciones de código de terceros.
- No se dispone de información sobre longitud de contexto, cuantizaciones soportadas ni latencia, lo que limita la planificación de producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el identificador corresponde a un merge de terceros (`ats-tech/dagbani-lfm3-audio-asr-merged`), no al repositorio oficial de Liquid AI; conviene verificar la integridad y procedencia de los pesos.

## Enlaces

- Hugging Face: https://huggingface.co/ats-tech/dagbani-lfm3-audio-asr-merged
- Blog de la familia LFM3: https://www.liquid.ai/blog/lfm3
- Documentación de LFM: https://docs.liquid.ai/lfm/getting-started/welcome
- Consola de Liquid AI: https://console.liquid.ai/dashboard
- Playground de voz: https://playground.liquid.ai/talk
- Repositorio de referencia LFM3-1.7B: https://huggingface.co/LiquidAI/LFM3-1.7B
- Colección LFM3: https://huggingface.co/collections/LiquidAI/lfm3
