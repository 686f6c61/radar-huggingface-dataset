# AEmotionStudio/moss-tts-models

## Resumen

El modelo `AEmotionStudio/moss-tts-models` es un espejo (mirror) de los checkpoints de la familia MOSS-TTS v1.5, desarrollada por el equipo OpenMOSS de la Universidad de Fudan, y empaquetada para el runtime offline de la estación de trabajo de audio MAESTRO. Este repositorio redistribuye los pesos y códecs de dos variantes del sistema de texto a voz (TTS): `MossTTSLocal` (4B parámetros) y `MossTTSDelay` (8B parámetros), junto con sus respectivos codecs de audio. La finalidad es ofrecer clonación de voz zero-shot en 31 idiomas, permitiendo clonar un hablante a partir de unos segundos de audio de referencia sin transcripción, o usar la voz propia del modelo.

La arquitectura combina un backbone basado en Qwen3 (4B o 8B) con un tokenizador de audio que transforma la señal en codebooks RVQ. El modelo `local_v15` utiliza un transformer local de una capa sobre 12 codebooks RVQ y el códec v2 (48 kHz estéreo, 12.5 Hz, 2B parámetros); el `delay_v15` emplea cabezas de patrón delay sobre 32 codebooks RVQ y el códec v1 (24 kHz mono, 12.5 Hz, 1.77B parámetros). El repositorio ocupa 13.4 GB y se distribuye bajo licencia Apache-2.0.

La relevancia actual del modelo radica en su capacidad de clonación de voz de alta fidelidad con un mínimo de audio de referencia, además del control explícito de duración y pausas mediante marcas inline `[pause X.Ys]`. La disponibilidad de dos tamaños permite adaptar el despliegue a distintos presupuestos de hardware, y el espejo de MAESTRO está optimizado para funcionar en GPUs con 12 GB de VRAM gestionando los códecs por mitades.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (backbone Qwen3) + codecs de audio tokenizer; dos variantes: MossTTSLocal (4B) y MossTTSDelay (8B) |
| Parametros totales | 4B (local_v15) y 8B (delay_v15) en los modelos de lenguaje; codecs de 2B (v2) y 1.77B (v1) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | bf16 (pesos de modelo) y fp32 (códecs); se menciona codec_weight_dtype bf16 para el códec v2 |
| Idiomas soportados | 31 idiomas: en, zh, yue, ja, ko, fr, de, es, it, pt, ru, ar, hi, nl, pl, tr, vi, th, sv, da, fi, cs, el, he, hu, ro, ms, fa, sw, tl, mk |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se compone de dos rutas (lanes) en el repositorio. La ruta `local_v15` contiene `MossTTSLocal`, un modelo de 4B parámetros cuyo backbone es Qwen3-4B y que añade un transformer local de una sola capa sobre 12 codebooks RVQ. El códec asociado es `MOSS-Audio-Tokenizer-v2`, que opera a 48 kHz en estéreo con una tasa de 12.5 Hz y 2B parámetros. La ruta `delay_v15` contiene `MossTTSDelay`, un modelo de 8B parámetros con backbone Qwen3-8B y cabezas de patrón delay sobre 32 codebooks RVQ. Su códec es `MOSS-Audio-Tokenizer`, que trabaja a 24 kHz en mono, también a 12.5 Hz, con 1.77B parámetros.

No se han publicado detalles sobre el dataset de entrenamiento ni sobre procesos de alineación como RLHF o DPO en la información disponible. La innovación técnica destacable es el control de duración a nivel de token y las marcas inline `[pause X.Ys]` para pausas explícitas, junto con etiquetas de idioma explícitas para la clonación de voz zero-shot sin transcripción. Además, los códecs se han re-particionado por módulo de nivel superior para que MAESTRO pueda materializar una mitad a la vez y moverla dentro y fuera de la GPU alrededor de su llamada única, lo que permite ejecutar el modelo de 4B en tarjetas de 12 GB.

## Capacidades

- Text-to-speech con clonación de voz zero-shot: clona un hablante a partir de unos segundos de audio de referencia sin necesidad de transcripción.
- Soporte de 31 idiomas con etiquetas de idioma explícitas.
- Control de duración a nivel de token y pausas inline `[pause X.Ys]`.
- Dos variantes de tamaño: local_v15 (4B) para menor consumo de memoria y delay_v15 (8B) para mayor capacidad de generación.
- Generación de voz larga estable, diálogo multi-hablante, diseño de voz/personaje, efectos de sonido ambientales y TTS de streaming en tiempo real, según la documentación del proyecto MOSS-TTS.
- Integración con el runtime offline de MAESTRO, lo que permite su uso sin conexión a internet.
- No soporta tool calling, function calling ni razonamiento multi-paso, ya que es un modelo de generación de voz.

## Casos de uso

- Audiolibros y narración: se puede clonar la voz de un narrador con una referencia breve y generar largos segmentos de voz con control de pausas y duración mediante las marcas `[pause X.Ys]`, lo que resulta adecuado para producción editorial automatizada.
- Doblaje de contenido audiovisual: gracias a los 31 idiomas y la clonación zero-shot, se puede doblar una película o serie manteniendo la voz de un actor, generando la versión en otro idioma sin necesidad de regrabar con el actor original.
- Asistentes de voz personalizados: el modelo puede generar respuestas habladas con una voz específica, integrándose en un pipeline de TTS para aplicaciones de asistencia o domótica, con la ventaja de funcionar offline en el runtime de MAESTRO.
- Podcasts y ficción sonora: permite crear diálogos multi-hablante con voces distintas sin contratar actores, generando cada personaje a partir de una referencia de audio corta y combinando las tomas en una producción.
- Accesibilidad para personas con discapacidad visual: convierte texto en voz natural con control de entonación y duración, lo que facilita la lectura de documentos, noticias o libros en múltiples idiomas.
- Diseño de voz para videojuegos: la familia MOSS-TTS cubre diseño de voz y efectos de sonido ambientales, lo que permite generar voces de personajes y efectos de sonido sintetizados a partir de referencias, reduciendo el coste de grabación.
- Educación y aprendizaje de idiomas: se pueden generar ejemplos de pronunciación en 31 idiomas, clonando una voz de referencia para que el estudiante escuche una pronunciación consistente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de calidad de voz, inteligibilidad ni comparativas con otros sistemas TTS. Por tanto, no es posible presentar una tabla de resultados.

## Requisitos de hardware

- VRAM estimada para inferencia: para la variante local_v15 (4B), los pesos del modelo en bf16 ocupan 9.10 GB. El códec v2 (2B parámetros) se carga por mitades (encoder/decoder) para reducir el pico de memoria; según la documentación, en una GPU de 12 GB es posible ejecutar el modelo de 4B si se gestionan los códecs de esta forma. Para la variante delay_v15 (8B), los pesos en bf16 ocupan 17.0 GB, por lo que se requiere una GPU con al menos 20-24 GB de VRAM para la inferencia sin cuantización adicional.
- GPU recomendadas: para local_v15, una RTX 4090 (24 GB) o una A100 de 40 GB son adecuadas; también puede funcionar en una RTX 3060 de 12 GB con la gestión de códecs por mitades. Para delay_v15, se recomienda una A100 de 80 GB o una H100, o una RTX 4090 con 24 GB si se acepta un mayor riesgo de desbordamiento de memoria.
- Compatibilidad con GPU de consumo: sí, la variante local_v15 cabe en GPUs de consumo con 12 GB o más, siempre que se utilice el enfoque de carga por mitades de los códecs. La variante delay_v15 requiere tarjetas de gama alta (24 GB) o tarjetas de datacenter.
- Opciones de despliegue: el modelo se carga con `transformers` usando `trust_remote_code=True` y el código remoto de los repos upstream, o mediante el runner propio de MAESTRO (`backend/ai/models/moss_tts.py`). No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos en los datos proporcionados. Se pueden considerar alternativas de TTS con clonación de voz zero-shot como XTTS v2 (Coqui) o StyleTTS2, pero no se aportan datos concretos de parámetros, contexto ni rendimiento en esta ficha, por lo que la comparación no puede ser rigurosa.

## Limitaciones y advertencias

- No se han publicado benchmarks, por lo que el rendimiento real en tareas específicas no está verificado de forma independiente.
- El repositorio es un espejo de AEmotionStudio; la model card indica que no añade restricciones, pero es necesario citar los proyectos upstream (OpenMOSS) y respetar la licencia Apache-2.0.
- Los pesos de los modelos de lenguaje se distribuyen únicamente en bf16, sin cuantizaciones de menor precisión, lo que limita el despliegue en GPUs con poca VRAM.
- El códec v2 puede haber sido convertido de fp32 a bf16 en las mitades encoder/decoder si `local_v15/codec/config.json` indica `codec_weight_dtype: bf16`; esto es el valor por defecto de upstream, pero podría afectar a la fidelidad del audio en comparación con los pesos fp32 originales.
- Los archivos `.py` remotos se han eliminado del espejo; para cargar el modelo es necesario utilizar el código vendored de MAESTRO o el código upstream de los repos de MOSS-TTS. No se puede usar `trust_remote_code` directamente desde este repositorio.
- La clonación de voz plantea riesgos de suplantación de identidad y uso indebido. Aunque la licencia Apache-2.0 permite uso comercial, se deben respetar las leyes de protección de la voz y obtener el consentimiento de los hablantes.
- No se dispone de información sobre sesgos conocidos del modelo, riesgos de alucinación (en el contexto de generación de voz) ni limitaciones específicas de contexto o idioma más allá de los 31 idiomas declarados.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/AEmotionStudio/moss-tts-models
- Proyecto MOSS-TTS en GitHub: https://github.com/OpenMOSS/MOSS-TTS
- Proyecto MOSS-Audio-Tokenizer en GitHub: https://github.com/OpenMOSS/MOSS-Audio-Tokenizer
- Sitio web de la familia MOSS-TTS: https://moss-tts.apposters.com/
- Repositorio de MAESTRO: https://github.com/AEmotionStudio
- Modelos base en HuggingFace:
  - https://huggingface.co/OpenMOSS-Team/MOSS-TTS-Local-Transformer-v1.5
  - https://huggingface.co/OpenMOSS-Team/MOSS-Audio-Tokenizer-v2
  - https://huggingface.co/OpenMOSS-Team/MOSS-TTS-v1.5
  - https://huggingface.co/OpenMOSS-Team/MOSS-Audio-Tokenizer
