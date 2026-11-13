# hf-audio/omniasr-ctc-1b-v2

## Resumen

OmniASR-CTC-1B-v2 es un modelo de reconocimiento automático del habla (ASR) desarrollado por el equipo hf-audio, publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un modelo multilingüe masivo que cubre más de 1.000 códigos de idioma ISO 639-3, desde lenguas mayoritarias como el inglés, el español o el chino hasta lenguas minoritarias y de bajos recursos como el arameo, el yagán o el zulú. El modelo emplea una arquitectura de tipo CTC (Connectionist Temporal Classification) sobre un encoder Transformer, con 975.674.928 parámetros totales (aproximadamente 1B) y pesos en formato safetensors.

El modelo se enmarca en la familia OmniASR, cuyo objetivo es ofrecer transcripción de voz verdaderamente multilingüe sin necesidad de modelos específicos por idioma. Fue entrenado sobre el corpus `facebook/omnilingual-asr-corpus` y se asocia al artículo arXiv 2511.09690. Su relevancia actual radica en la cobertura lingüística sin precedentes para un modelo de este tamaño, lo que lo convierte en una opción atractiva para aplicaciones de transcripción en contextos donde los modelos ASR convencionales (Whisper, etc.) tienen un rendimiento muy limitado o nulo.

La versión v2 indica una revisión del modelo original, aunque la model card no detalla los cambios concretos respecto a versiones anteriores. El modelo está etiquetado con `endpoints_compatible` y `region:us`, lo que facilita su despliegue en la infraestructura de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder con cabeza CTC (Connectionist Temporal Classification) |
| Parametros totales | 975.674.928 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Más de 1.000 códigos ISO 639-3 (aae, aal, abb, ... zza); incluye español (spa), inglés (eng), francés (fra), alemán (deu), chino mandarín (cmn), árabe (arb), hindi (hin), entre muchos otros |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un encoder Transformer con una cabeza de clasificación CTC, un enfoque clásico y eficiente para ASR que no requiere un decoder autorregresivo y permite alineamientos monotónicos entre audio y texto. El modelo tiene 975,7 millones de parámetros, lo que lo sitúa en la gama de 1B, un tamaño manejable para inferencia en GPU de consumo con cuantización adecuada.

El entrenamiento se realizó sobre el corpus `facebook/omnilingual-asr-corpus`, un conjunto de datos multilingüe masivo diseñado específicamente para el proyecto OmniASR. La model card no especifica el número exacto de horas de audio, la composición detallada del dataset ni si se emplearon técnicas de RLHF o DPO (poco habituales en ASR). Tampoco se detallan innovaciones técnicas como decodificación especulativa o atención lineal. El artículo asociado (arXiv 2511.09690) probablemente contiene estos detalles, pero no se ha proporcionado su contenido en la información disponible.

## Capacidades

- Transcripción de voz a texto multilingüe en más de 1.000 idiomas, incluyendo lenguas de bajos recursos y minoritarias.
- Reconocimiento de habla continua sin necesidad de segmentación previa manual (gracias a CTC).
- Manejo de audio de diversa duración (la longitud máxima no está especificada).
- No soporta tool calling ni function calling (es un modelo ASR puro).
- No soporta agentes ni razonamiento multi-step (no es un modelo de lenguaje generativo).
- Capacidades multilingües: cubre un espectro lingüístico extremadamente amplio, desde lenguas con millones de hablantes hasta lenguas con pocos miles.
- No dispone de modo "thinking", visión ni audio (más allá de la entrada de audio para transcripción).

## Casos de uso

- Transcripción de reuniones y conferencias multilingües: el modelo puede procesar audio en varios idiomas y generar transcripciones, útil en entornos internacionales donde los participantes hablan lenguas distintas. Su cobertura de más de 1.000 idiomas permite transcribir intervenciones en lenguas minoritarias sin cambiar de modelo.
- Subtitulado automático de vídeo para plataformas de contenido: se puede integrar en pipelines de generación de subtítulos para vídeos en cualquier idioma soportado, reduciendo la dependencia de servicios comerciales y permitiendo el procesamiento local.
- Archivado y digitalización de patrimonio oral: idóneo para transcribir grabaciones de lenguas en peligro de desaparición (por ejemplo, yagán, ainu, etc.), facilitando su documentación y estudio lingüístico.
- Atención al cliente en centros de llamadas multilingües: transcripción de llamadas en tiempo real o diferido para su análisis, clasificación y generación de informes, con soporte para clientes que hablan lenguas no cubiertas por ASR convencionales.
- Investigación lingüística y corpus orales: generación de transcripciones para estudios fonéticos, sociolingüísticos o de documentación de lenguas, con la ventaja de un único modelo para múltiples variedades.
- Accesibilidad para personas con discapacidad auditiva: conversión de audio a texto en directo en eventos, clases o medios de comunicación, incluyendo contenido en lenguas minoritarias que carecen de soluciones comerciales.
- Análisis de medios de comunicación internacionales: transcripción de emisiones de radio o televisión en lenguas poco representadas para su monitorización y análisis de contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en fp32 (3,9 GB), se necesitan al menos 4-5 GB de VRAM. Con cuantización a fp16 (aproximadamente 2 GB) o int8 (aproximadamente 1 GB), los requisitos bajan considerablemente.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM para fp32; para fp16, una GPU con 4 GB es suficiente. Se recomiendan GPUs como NVIDIA RTX 3060, RTX 4060, RTX 4090, A100 o H100 para mayor throughput.
- Cabe en GPU de consumo: sí, en tarjetas como GTX 1660 (6 GB), RTX 3050 (8 GB), RTX 3060 (12 GB), RTX 4060 (8 GB), etc. Incluso en GPUs integradas con suficiente memoria compartida podría funcionar, aunque con mayor latencia.
- Opciones de despliegue: al ser un modelo de `transformers`, se puede usar con la librería estándar (PyTorch), y potencialmente con `optimum` para ONNX Runtime, o con `vLLM` (aunque vLLM está más orientado a modelos generativos; para ASR CTC, es más común usar `transformers` directamente o `speechbrain`). También se puede convertir a GGUF para `llama.cpp` (aunque no es el formato nativo). No se dispone de información sobre integración con Ollama o TGI.
- Latencia y throughput estimados: no disponibles. Dependerán del hardware y de la longitud del audio.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| OmniASR-CTC-1B-v2 | 975,7 M | No disponible | >1.000 | Apache 2.0 | safetensors |
| Whisper large-v3 | 1.550 M | 30 s (ventana) | ~99 | MIT | safetensors, etc. |
| MMS (Meta) | 1.000 M (aprox.) | No disponible | >1.000 | CC-BY-NC 4.0 | safetensors |
| SeamlessM4T v2 | 2.300 M | No disponible | ~100 | CC-BY-NC 4.0 | safetensors |

OmniASR-CTC-1B-v2 se distingue por su licencia permisiva (Apache 2.0) frente a MMS y SeamlessM4T (no comercial), y por su cobertura de idiomas muy superior a Whisper. Sin embargo, no se dispone de datos de rendimiento comparativo (WER) en la información proporcionada.

## Limitaciones y advertencias

- No se han publicado datos sobre sesgos específicos, pero al ser un modelo entrenado con corpus multilingüe, puede presentar sesgos hacia variedades dialectales sobrerrepresentadas en los datos.
- Riesgo de alucinación: en ASR, esto se manifiesta como transcripciones incorrectas o invención de palabras en segmentos de audio ruidosos o con acentos no vistos. La cabeza CTC tiende a ser más robusta que los decoders autorregresivos, pero el riesgo persiste.
- Limitaciones de contexto: se desconoce la longitud máxima de audio que puede procesar; es probable que esté limitada por la arquitectura Transformer (típicamente ventanas de 30 segundos o menos, aunque no se especifica).
- Limitaciones de idioma: aunque cubre más de 1.000 idiomas, el rendimiento puede variar enormemente; las lenguas con pocos datos de entrenamiento probablemente tengan tasas de error mucho más altas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución, siempre que se incluya el aviso de licencia. No hay restricciones conocidas adicionales.
- Caveats para producción: no se especifican requisitos de preprocesado (frecuencia de muestreo, normalización) en la model card; es necesario consultar la documentación de `transformers` para el pipeline de ASR. Tampoco se detalla el rendimiento en audio con ruido de fondo o múltiples hablantes.

## Enlaces

- Hugging Face: https://huggingface.co/hf-audio/omniasr-ctc-1b-v2
- Artículo arXiv: https://arxiv.org/abs/2511.09690
- Corpus de entrenamiento: https://huggingface.co/datasets/facebook/omnilingual-asr-corpus
