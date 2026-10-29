# nphearum/LFM3-Omni-2B

## Resumen

LFM3-Omni-2B es el primer modelo ómnimodal de la familia LFM3 de Liquid AI: un único modelo extremo a extremo que acepta texto, imágenes, vídeo (con o sin su pista de audio) y audio de 16 kHz, y responde en texto, en voz de 24 kHz o en texto y voz intercalados. Sustituye en un solo checkpoint la combinación habitual de un modelo ASR, un modelo visión-lenguaje, un LLM y un modelo TTS, lo que reduce drásticamente la huella de memoria y la latencia de los pipelines multimodales tradicionales.

El modelo combina un backbone de lenguaje LFM3-1.7B con un codificador de visión propio, un codificador de audio causal y el tokenizador de audio LiquidCodec, más un depthformer que genera los tokens de habla. El total declarado es de 2.166.928.384 parámetros (2,17B) y la ventana de contexto es de 32K tokens, contando entrada y salida. Está diseñado explícitamente para inferencia en dispositivo («on-device»): teléfonos, portátiles y hardware de borde.

La relevancia para un desarrollador es doble: por un lado, la licencia LFM Open License v1.0 permite uso comercial bajo condiciones que hay que verificar en el fichero LICENSE; por otro, al ser un modelo de 2,2B con pesos en safetensors de 4,5 GB, es viable en GPU de consumo y en entornos integrados. Conviene señalar que el repositorio analizado (`nphearum/LFM3-Omni-2B`) es una réplica de terceros sin descargas ni likes, no el repositorio oficial de Liquid AI.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Backbone LFM3 (LFM3-1.7B) + codificador de visión LFM3 + codificador de audio causal LFM3 + tokenizador de audio LiquidCodec + depthformer para la generación de habla |
| Parámetros totales | 2.166.928.384 (2,17B) |
| Parámetros activos | No aplica; no se describe como MoE en la información disponible |
| Longitud de contexto | 32K tokens (entrada + salida) |
| Tipos de cuantización | No detallados en la model card; distribución principal en safetensors. Existe entrada en la librería de Ollama, lo que implica disponibilidad de GGUF, pero sin lista oficial de cuantizaciones |
| Idiomas soportados | 23: en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl, da, el, fi, he, nl, sv, tr (la model card no desglosa cobertura por modalidad) |
| Licencia | `lfm1.0` (LFM Open License v1.0, etiquetada como `other`; remite al fichero LICENSE del repositorio) |
| Formato de pesos | safetensors; requiere `trust_remote_code` (`custom_code`) |
| Entradas | Texto, imágenes, vídeo (con o sin audio) y audio de 16 kHz |
| Salidas | Texto, voz de 24 kHz, o texto y voz intercalados |
| Procesamiento de imagen y vídeo | Resolución nativa; cada bloque 2×2 de parches se convierte en un token de lenguaje. Vídeo a 2 fps, con 4 a 384 fotogramas por defecto |
| Vocabulario | No disponible (dato truncado en la model card) |
| Tamaño del repositorio | 4,5 GB |
| Pipeline declarado | any-to-any |

## Arquitectura y entrenamiento

La arquitectura es un ensamblaje multimodal en torno a un LLM: las preguntas habladas pasan por el codificador de audio LFM3 y su conector; las imágenes, por el codificador de visión y su conector; los prompts de texto, por el tokenizador y la capa de embeddings. Todo confluye en el modelo base LFM3-1.7B, cuya secuencia de salida alimenta por un lado la cabeza LM para texto y, por otro, un depthformer junto con el Liquid Audio Codec para producir habla a 24 kHz. Los conectores son la pieza que alinea cada modalidad con el espacio de representación del backbone, de modo que el modelo razona sobre una secuencia unificada de tokens de lenguaje.

El tratamiento de la visión es notablemente austero en cómputo: imagen y vídeo se procesan a resolución nativa y cada bloque de 2×2 parches se agrupa en un único token, lo que comprime la secuencia visual y mantiene manejable la ventana de 32K. El vídeo se muestrea a 2 fps con un rango configurable de 4 a 384 fotogramas, y el modelo consume imagen y banda sonora de forma conjunta, lo que habilita preguntas que requieren correlacionar lo que se ve con lo que se oye.

No se han publicado en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni el detalle del pipeline de post-entrenamiento (RLHF, DPO u otras técnicas). La model card solo indica que se trata de un checkpoint «post-trained», sin desglose de etapas. Tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Comprensión de texto y generación de lenguaje con 32K tokens de contexto combinado de entrada y salida.
- Comprensión de imágenes a resolución nativa, con preguntas y respuestas sobre el contenido visual.
- Comprensión de vídeo, incluyendo vídeo con sonido, con razonamiento conjunto sobre imagen y audio.
- Reconocimiento automático de habla (ASR) sobre audio de 16 kHz.
- Traducción de habla y transcripción, según la descripción del autor («transcribe or translate speech»).
- Salida de voz a 24 kHz, incluyendo conversación hablada («chat out loud»).
- Salida intercalada de texto y voz, útil para subtitulado o respuesta hablada con apoyo escrito.
- Conversión de voz a voz (speech-to-speech) en un único modelo, sin cadena ASR + LLM + TTS.
- Cobertura multilingüe declarada de 23 idiomas.
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la información disponible.
- Modo «thinking» o razonamiento explícito: no documentado en la información disponible.

## Casos de uso

- Asistentes de voz en dispositivo: el modelo recibe audio de 16 kHz y devuelve voz de 24 kHz en el mismo paso, de modo que un teléfono o un portátil puede mantener una conversación hablada sin enviar el audio a la nube ni encadenar tres modelos distintos. La ventana de 32K permite conservar el histórico de la conversación.
- Transcripción y traducción de reuniones: se le pasa el audio de la reunión y devuelve texto; si se necesita versión en otro idioma, la propia naturaleza any-to-any permite pedir la traducción en la misma llamada, dentro de los 23 idiomas soportados.
- Accesibilidad para personas con discapacidad visual: el usuario fotografía o graba con la cámara y formula una pregunta en voz alta; el modelo describe la escena y responde hablando, con una latencia compatible con uso interactivo gracias a los 2,17B de parámetros.
- Análisis de vídeo con banda sonora: con muestreo a 2 fps y hasta 384 fotogramas, se puede preguntar por lo que ocurre en un clip y por sonidos o diálogos concretos, lo que sirve para moderación de contenido, etiquetado automático de archivos audiovisuales o generación de descripciones para catálogos.
- Atención al cliente multimodal: el cliente puede enviar una captura de pantalla o un audio de queja y el modelo responde por texto o por voz, manteniendo el contexto de turnos anteriores dentro de los 32K tokens. Es adecuado por coste por consulta bajo y por no requerir GPUs de datacenter.
- Subtitulado y doblaje ligero: la salida intercalada de texto y habla permite generar subtítulos y una pista de voz en una sola pasada, útil en herramientas de edición o en preproducción de vídeo corto.
- Kioscos y robótica de borde: al caber en hardware de consumo, se puede desplegar en terminales de información, robots de sala o dispositivos industriales con interfaz por voz, donde no hay conectividad fiable ni presupuesto para infraestructura cloud.
- Procesamiento por lotes de audio y vídeo: sustituir cadenas de ASR + LLM + TTS por un único modelo simplifica el mantenimiento y reduce el número de puntos de fallo en pipelines de enriquecimiento de contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K, ASR (WER) ni métricas de calidad de síntesis vocal, y las referencias web encontradas mencionan la existencia de benchmarks sin proporcionar cifras verificables en esta ficha.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16/fp16 los pesos ocupan en torno a 4,3 GB (2,17B × 2 bytes), coherente con un repositorio de 4,5 GB; con caché KV, codificadores y overhead de runtime, hay que prever aproximadamente 6-8 GB para contexto moderado y más para acercarse a los 32K tokens.
- Cuantización a 8 bits: pesos en torno a 2,2-2,5 GB; presupuesto total estimado de 4-5 GB.
- Cuantización a 4 bits: pesos en torno a 1,2-1,5 GB; presupuesto total estimado de 2,5-4 GB, dependiendo de si el codificador de audio y el de visión se cuantizan también.
- GPU de consumo: cabe con holgura en RTX 4090 (24 GB), RTX 4080/4070 Ti (12-16 GB) y previsiblemente en RTX 4060 Ti de 16 GB y RTX 3060 de 12 GB en bf16. Para 8 GB o menos conviene cuantizar.
- GPU de datacenter: A100, H100, L40S y L4 son sobredimensionadas para un modelo de este tamaño; tienen sentido para servir muchas peticiones concurrentes, no por requisito de memoria.
- Hardware de borde: el fabricante declara explícitamente que está pensado para teléfonos, portátiles y dispositivos de borde, aunque no se publican cifras de memoria por plataforma ni soporte concreto de NPU.
- Opciones de despliegue: Transformers con `trust_remote_code=True` (la model card usa `custom_code`); existe entrada oficial en la librería de Ollama (`ollama.com/library/lfm3-omni`). Soporte de vLLM, llama.cpp o TGI no confirmado en la información disponible.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo, tiempo hasta el primer token ni latencia de síntesis de voz.

## Comparativa con modelos similares

Los datos de las alternativas no proceden de la información proporcionada en esta ficha y deben verificarse en sus respectivas model cards antes de tomar una decisión.

| Modelo | Parámetros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-Omni-2B | 2,17B | 32K | Texto, imagen, vídeo, audio de entrada; texto y voz de salida | LFM Open License v1.0 (`other`) | HuggingFace (repo oficial y réplica analizada), Ollama, API y playground de Liquid AI |
| Qwen2.5-Omni-3B | ~3B | no disponible en esta ficha | Texto, imagen, audio y vídeo de entrada; texto y voz de salida | no disponible en esta ficha | HuggingFace |
| MiniCPM-o 2.6 | ~8B | no disponible en esta ficha | Texto, imagen, vídeo y audio; salida de voz | no disponible en esta ficha | HuggingFace |
| Gemma 3n (variantes E2B/E4B) | no disponible en esta ficha | no disponible en esta ficha | Texto, imagen, audio | no disponible en esta ficha | HuggingFace, Ollama |

La ventaja diferencial de LFM3-Omni-2B en esta comparativa es el tamaño: 2,17B con salida de voz nativa lo sitúa por debajo de las alternativas ómnimodales citadas en número de parámetros, lo que se traduce en menor huella de memoria y mejor encaje en dispositivo. La contrapartida esperable es menor capacidad de razonamiento y de conocimiento factual, algo que no se puede cuantificar sin benchmarks publicados.

## Limitaciones y advertencias

- El repositorio analizado es `nphearum/LFM3-Omni-2B`, una réplica de terceros con 0 descargas y 0 likes, creada el 2026-10-29. Para producción debe usarse el repositorio oficial `LiquidAI/LFM3-Omni-2B`, que además incluye la model card completa y el fichero LICENSE.
- La model card del repositorio replicado está truncada (por ejemplo, en la fila de vocabulario), de modo que parte de las especificaciones no se pueden verificar.
- Con 2,17B de parámetros, es esperable una tasa de alucinación superior a la de modelos de 7B o superiores en tareas de conocimiento factual, y menor fiabilidad en razonamiento matemático o lógico complejo. No hay benchmarks que permitan acotar este riesgo.
- Los 23 idiomas declarados no implican calidad homogénea: no se publica ninguna métrica por idioma ni por modalidad, y es habitual que el rendimiento caiga en lenguas de menor representación en los datos de entrenamiento.
- El contexto de 32K es compartido entre entrada y salida; un vídeo de 384 fotogramas más la pregunta y la respuesta consume una parte significativa de esa ventana, ya que cada bloque de 2×2 parches ocupa un token.
- El muestreo de vídeo a 2 fps puede perder eventos breves; la compresión de parches 2×2 reduce el detalle fino en imágenes con texto pequeño o elementos muy densos.
- Licencia LFM Open License v1.0: la model card solo indica `other` / `lfm1.0` y remite al fichero LICENSE. Antes de uso comercial hay que leer ese fichero y verificar los umbrales de facturación o de uso que la familia LFM suele aplicar. Este dato no se ha podido consultar en la información disponible.
- No hay documentación sobre tool calling, uso como agente, modo de razonamiento explícito ni soporte de formatos estructurados, por lo que no debe asumirse su disponibilidad.
- El modelo requiere `trust_remote_code=True` (`custom_code`), lo que implica ejecutar código del repositorio; conviene auditar los ficheros remotos antes de cargarlo en entornos sensibles.
- No se publican métricas de latencia, throughput ni calidad de voz (MOS), imprescindibles para dimensionar un servicio en producción.
- No se detalla el proceso de alineación ni de mitigación de sesgos; cabe esperar sesgos heredados de los datos de entrenamiento en todas las modalidades, incluidos sesgos demográficos en el reconocimiento de voz.

## Enlaces

- HuggingFace (réplica analizada): https://huggingface.co/nphearum/LFM3-Omni-2B
- HuggingFace (repositorio oficial): https://huggingface.co/LiquidAI/LFM3-Omni-2B
- Documentación del modelo en Liquid Docs: https://docs.liquid.ai/lfm/models/lfm3-omni-2b
- Blog de presentación de la familia LFM3: https://www.liquid.ai/blog/lfm3
- Documentación general de LFM (primeros pasos): https://docs.liquid.ai/lfm/getting-started/welcome
- Consola / API de Liquid AI: https://console.liquid.ai/dashboard
- Playground de voz: https://playground.liquid.ai/talk
- Colección LFM3 en HuggingFace: https://huggingface.co/collections/LiquidAI/lfm3
- Entrada en la librería de Ollama: https://ollama.com/library/lfm3-omni
- Análisis de benchmarks en orcarouter.ai: https://www.orcarouter.ai/blog/lfm3-omni-2b-speech-output-benchmarks
- Licencia LFM Open License v1.0: fichero LICENSE del repositorio oficial
