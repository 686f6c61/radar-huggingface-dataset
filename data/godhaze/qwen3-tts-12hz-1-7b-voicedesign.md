# godhaze/Qwen3-TTS-12Hz-1.7B-VoiceDesign

## Resumen

Qwen3-TTS-12Hz-1.7B-VoiceDesign es una variante de la serie Qwen3-TTS desarrollada por el equipo de Qwen (Alibaba), especializada en diseño de voz mediante instrucciones en lenguaje natural. A diferencia de los modelos de clonación de voz que requieren una muestra de audio de referencia, esta variante permite generar una voz completamente nueva a partir de una descripción textual del timbre, la emoción y la prosodia deseados. El modelo se distribuye bajo licencia Apache 2.0 y está disponible en Hugging Face, tanto en la cuenta oficial de Qwen como en este mirror de godhaze.

El modelo emplea una arquitectura de modelo de lenguaje discreto multi-codebook, junto con un tokenizador acústico propio (Qwen3-TTS-Tokenizer-12Hz) que comprime la señal de audio a 12 Hz. Con 1.916.676.352 parámetros (aproximadamente 1,7 mil millones), soporta 10 idiomas principales y múltiples perfiles dialectales. Su diseño end-to-end elimina los cuellos de botella tradicionales de los sistemas TTS por etapas, y ofrece generación en streaming con una latencia de extremo a extremo de hasta 97 ms.

Esta ficha se centra en la variante VoiceDesign, que se distingue del modelo Base y del modelo CustomVoice por su capacidad de generar voces sintéticas sin necesidad de muestras de referencia, únicamente a partir de instrucciones textuales. Es una herramienta relevante para aplicaciones de doblaje, asistentes virtuales, audiolibros y creación de contenido, donde se requiere flexibilidad en el diseño de la voz.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje discreto multi-codebook (LM) con tokenizador acústico Qwen3-TTS-Tokenizer-12Hz |
| Parametros totales | 1.916.676.352 (aprox. 1,7 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (se espera soporte para FP16/BF16 y cuantizaciones posteriores) |
| Idiomas soportados | Chino, ingles, japones, coreano, aleman, frances, ruso, portugues, espanol e italiano, ademas de perfiles dialectales |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Qwen3-TTS-12Hz-1.7B-VoiceDesign se basa en una arquitectura de modelo de lenguaje discreto con múltiples codebooks, que integra directamente la representación acústica en el proceso de generación. El tokenizador Qwen3-TTS-Tokenizer-12Hz comprime la señal de audio a una frecuencia de 12 Hz, lo que permite un modelado semántico de alta dimensión con una eficiencia computacional notable. Esta arquitectura end-to-end evita los cuellos de botella típicos de los sistemas TTS por etapas (texto a fonemas, fonemas a espectrograma, etc.) y permite un control fino sobre la voz generada.

No se han publicado detalles específicos sobre el conjunto de datos de entrenamiento, el número de tokens procesados ni el uso de técnicas de alineación como RLHF o DPO. El modelo se presenta como parte de una serie que incluye variantes Base, CustomVoice y VoiceDesign, todas ellas entrenadas con un enfoque unificado. La innovación principal de esta variante reside en su capacidad de interpretar instrucciones en lenguaje natural para diseñar voces, lo que implica un entrenamiento específico para asociar descripciones textuales con características acústicas.

## Capacidades

- Generacion de voz sintetica de alta calidad, con control sobre timbre, emocion y prosodia mediante instrucciones en lenguaje natural.
- Diseño de voces nuevas sin necesidad de muestras de audio de referencia (a diferencia de la variante CustomVoice).
- Soporte multilingue en 10 idiomas principales: chino, ingles, japones, coreano, aleman, frances, ruso, portugues, espanol e italiano, con perfiles dialectales adicionales.
- Generacion en streaming con latencia de extremo a extremo de hasta 97 ms, adecuada para aplicaciones en tiempo real.
- Representacion acustica eficiente mediante el tokenizador de 12 Hz, que reduce la carga computacional frente a tokenizadores de mayor frecuencia.
- Integracion sencilla via el paquete Python `qwen-tts`, con metodos dedicados como `generate_voice_design` para esta variante.

## Casos de uso

- Doblaje y localizacion de contenido audiovisual: el modelo permite generar voces personalizadas para personajes de animacion, videojuegos o series, describiendo el tono y la emocion deseados sin necesidad de grabar a un actor de doblaje. Su soporte multilingue facilita la adaptacion a multiples mercados.
- Asistentes virtuales y agentes conversacionales: la baja latencia de streaming (97 ms) y el control por instrucciones permiten crear asistentes con voces unicas y ajustables en tiempo real, mejorando la experiencia de usuario en aplicaciones de atencion al cliente o dispositivos IoT.
- Audiolibros y narracion automatizada: se puede generar una voz narrativa consistente para largos textos, con control sobre el ritmo y la entonacion. La capacidad de diseñar la voz desde cero evita problemas de derechos de autor asociados a voces de actores reales.
- Creacion de contenido para redes sociales y marketing: los creadores pueden generar voces distintivas para videos, podcasts o anuncios, describiendo el estilo deseado (por ejemplo, "voz energica y juvenil") sin necesidad de equipos de grabacion profesionales.
- Accesibilidad y tecnologia asistiva: el modelo puede generar voces personalizadas para sistemas de comunicacion aumentativa, permitiendo a personas con discapacidad del habla elegir una voz que se adapte a su identidad y preferencias.
- Prototipado rapido de productos de voz: los desarrolladores pueden generar multiples voces de prueba para evaluar la experiencia de usuario en aplicaciones de voz, acelerando el ciclo de diseno sin depender de actores de voz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para la variante VoiceDesign. La model card del modelo Base (Qwen3-TTS-12Hz-1.7B-Base) reporta los siguientes valores de Word Error Rate (WER, menor es mejor) en el conjunto de prueba Seed-TTS para generacion de voz zero-shot:

| Modelo | test-zh | test-en |
|---|---|---|
| Qwen3-TTS-12Hz-1.7B-Base | 0.77 | 1.24 |

Estos datos corresponden al modelo Base, no a la variante VoiceDesign, por lo que no deben extrapolarse directamente. No se dispone de metricas de calidad subjetiva (MOS) ni de comparaciones con otros sistemas TTS en la informacion disponible.

## Requisitos de hardware

- No se han publicado requisitos oficiales de hardware para este modelo.
- Dado el tamano de 1,7 mil millones de parametros y el formato safetensors (4,5 GB en el repositorio), se estima que la inferencia en precision FP16 o BF16 requiere al menos 4-6 GB de VRAM para los pesos, mas memoria adicional para activaciones y el tokenizador.
- Esta estimacion sugiere que el modelo puede ejecutarse en GPUs de consumo como NVIDIA RTX 3060 (12 GB), RTX 4060 (8 GB) o superiores, aunque se recomienda verificar el consumo real con herramientas de perfilado.
- Para despliegue en produccion, se puede utilizar el paquete `qwen-tts` con `device_map="cuda:0"` y `attn_implementation="flash_attention_2"` para optimizar el rendimiento.
- No se mencionan opciones de despliegue con vLLM, llama.cpp u Ollama, ya que el modelo esta disenado para el ecosistema `qwen-tts` y no es un LLM generico de texto.
- La latencia de streaming de 97 ms se refiere a la sintesis de extremo a extremo, pero el rendimiento real dependera de la GPU utilizada y de la longitud del texto de entrada.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados con otros sistemas TTS de la misma categoria (por ejemplo, XTTS, Bark, VITS, Tacotron). La informacion disponible no incluye benchmarks estandarizados (MOS, WER) para la variante VoiceDesign, ni comparaciones con alternativas comerciales o de codigo abierto. Por tanto, no es posible ofrecer una comparativa cuantitativa fiable en este momento.

## Limitaciones y advertencias

- No se han documentado sesgos especificos del modelo, pero como todo sistema TTS entrenado con datos de voz, puede reflejar sesgos de genero, edad o acento presentes en los datos de entrenamiento.
- Existe riesgo de generacion de voces que imiten a personas reales si se utilizan instrucciones muy especificas, lo que podria plantear problemas de suplantacion de identidad. Se recomienda implementar medidas de verificacion en aplicaciones sensibles.
- La variante VoiceDesign no requiere muestras de audio de referencia, pero la calidad de la voz generada depende de la claridad de las instrucciones textuales; instrucciones ambiguas pueden producir resultados inconsistentes.
- No se han publicado datos sobre la robustez del modelo ante textos largos o ruidosos, ni sobre su comportamiento en idiomas no incluidos en los 10 principales.
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar que el uso no infrinja derechos de terceros sobre las voces generadas, especialmente en aplicaciones de doblaje o publicidad.
- El modelo esta disenado para el ecosistema `qwen-tts`; su integracion con otros frameworks (por ejemplo, ONNX, TensorRT) no esta documentada y puede requerir trabajo adicional.

## Enlaces

- Modelo en Hugging Face (mirror de godhaze): https://huggingface.co/godhaze/Qwen3-TTS-12Hz-1.7B-VoiceDesign
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign
- Repositorio oficial en GitHub: https://github.com/QwenLM/Qwen3-TTS
- Paper tecnico (arXiv): https://huggingface.co/papers/2601.15621
- Blog de Qwen sobre Qwen3-TTS: https://qwen.ai/blog?id=qwen3tts-0115
- Coleccion de modelos Qwen3-TTS en Hugging Face: https://huggingface.co/collections/Qwen/qwen3-tts
