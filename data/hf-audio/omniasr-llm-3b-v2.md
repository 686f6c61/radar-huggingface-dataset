# hf-audio/omniasr-llm-3b-v2

## Resumen

OmniASR-LLM-3B-v2 es un modelo de reconocimiento automático del habla (ASR) publicado por el colectivo hf-audio bajo licencia Apache 2.0. Se distribuye en formato safetensors para la librería transformers y forma parte de la familia "omnilingual-asr", un proyecto orientado a cubrir la transcripción de voz en un número masivo de lenguas, incluyendo muchas de bajos recursos. El identificador del modelo indica un tamaño nominal de 3B, aunque el recuento real de parámetros en los pesos publicados asciende a 4.387.529.216 (aproximadamente 4,39 mil millones).

El modelo se presenta con la etiqueta de pipeline `automatic-speech-recognition` y declara soporte para más de mil códigos ISO 639-3, desde lenguas mayoritarias como `eng`, `spa`, `cmn` o `ara` hasta variedades minoritarias y lenguas africanas, austronesias y americanas (`aae`, `aka`, `quy`, `yue`, etc.). Está entrenado sobre el corpus `facebook/omnilingual-asr-corpus`, lo que lo vincula directamente con la línea de investigación de ASR multilingüe a gran escala de Meta.

Su relevancia actual radica en la cobertura lingüística: la mayoría de sistemas ASR comerciales se limitan a decenas de idiomas, mientras que este modelo apunta a un régimen de mil lenguas con un único conjunto de pesos. La información pública disponible no detalla la arquitectura interna ni el número de tokens de entrenamiento, por lo que varios apartados de esta ficha se marcan como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta `omniasr`; transformer orientado a ASR según la librería transformers) |
| Parámetros totales | 4.387.529.216 (4,39B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (repo en safetensors; no se publican variantes GGUF/INT8 en la información) |
| Idiomas soportados | más de 1.000 códigos ISO 639-3 (entre ellos `eng`, `spa`, `deu`, `fra`, `cmn`, `ara`, `hin`, `yor`, `swh`, `quy`, `yue`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card no documenta la arquitectura interna más allá de la etiqueta `omniasr` y el `pipeline_tag: automatic-speech-recognition`. El nombre del repositorio (`omniasr-llm-3b-v2`) sugiere un componente de tipo LLM de 3B integrado en un sistema ASR, pero no se especifica si se trata de un encoder acústico más un decoder de lenguaje, de un modelo end-to-end o de un híbrido. Tampoco se detallan el número de capas, la dimensión oculta, el mecanismo de atención ni la estrategia de tokenización de audio.

En cuanto a datos, el único indicio es la referencia al dataset `facebook/omnilingual-asr-corpus`, que actúa como fuente de entrenamiento. No se publican el número total de horas de audio, la composición por lengua, ni si hubo etapas de ajuste fino supervisado, RLHF o DPO. La referencia arXiv 2511.09690 aparece asociada al modelo y probablemente contiene los detalles técnicos, pero su contenido no forma parte de la información proporcionada, por lo que no se pueden confirmar innovaciones como decodificación especulativa, atención lineal o compresión de estados.

## Capacidades

- Transcripción de voz a texto (ASR) en más de mil lenguas identificadas por código ISO 639-3.
- Cobertura de lenguas de bajos recursos y variedades regionales poco representadas en sistemas comerciales.
- Manejo de entradas de audio mediante el pipeline `automatic-speech-recognition` de transformers.
- Etiquetado multilingüe explícito, lo que permite seleccionar o condicionar el idioma de salida mediante el código correspondiente.
- Integración con el ecosistema transformers y con endpoints compatibles (`endpoints_compatible` en los tags).
- No se documentan capacidades de tool calling, razonamiento multi-paso, visión, audio generativo ni modo "thinking".

## Casos de uso

- Transcripción de archivos audiovisuales multilingües: el modelo permite procesar un mismo lote de audios en decenas o cientos de lenguas sin cambiar de pipeline, útil en plataformas de subtitulado que reciben contenido de todo el mundo.
- Documentación de lenguas minoritarias: investigadores de lingüística de campo pueden transcribir grabaciones en lenguas con pocos hablantes (`quy`, `aka`, `yue`, etc.) usando un único modelo Apache 2.0, sin depender de servicios propietarios con coberturas limitadas.
- Subtitulado automático para organismos públicos: administraciones que deben ofrecer accesibilidad en lenguas cooficiales o de inmigración pueden desplegar el modelo en infraestructura propia al no tener restricciones comerciales por licencia.
- Indexación y búsqueda de archivos de audio: transcripción previa a la indexación semántica de podcasts, reuniones o archivos de radio en múltiples idiomas, aprovechando la cobertura lingüística para un corpus heterogéneo.
- Atención al cliente con voz en regiones multilingües: integración en un pipeline ASR→LLM para transcribir llamadas entrantes en la lengua del usuario antes de pasarlas a un sistema de respuesta.
- Investigación en ASR multilingüe: servir como línea base reproducible (pesos abiertos, licencia permisiva) para comparar técnicas de adaptación por lengua o de regularización multilingüe.
- Preservación de patrimonio oral: digitalización y transcripción de archivos etnográficos en lenguas sin tradición escrita, con la ventaja de que los pesos pueden ejecutarse en local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión nativa (fp16/bf16): aproximadamente 8,8 GB solo para pesos, más memoria para activaciones y buffers de audio; en la práctica se recomienda un mínimo de 12-16 GB.
- En cuantización INT8: alrededor de 4,4 GB de pesos, aunque no se publican variantes cuantizadas oficiales en la información disponible.
- GPU recomendadas: A100 (40/80 GB) o H100 para despliegues de alto throughput; RTX 4090 (24 GB) y RTX 3090 (24 GB) para inferencia en fp16 con margen suficiente.
- GPU de consumo: cabe en tarjetas con 16 GB o más (RTX 4080, RTX 4060 Ti 16 GB, RTX A4000) en fp16; en 8 GB requeriría cuantización no publicada oficialmente.
- Opciones de despliegue: transformers (librería declarada), servidores compatibles con endpoints de Hugging Face; no se confirma soporte de vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| OmniASR-LLM-3B-v2 | 4,39B | no disponible | más de 1.000 | Apache 2.0 | safetensors |
| Whisper large-v3 (OpenAI) | ~1,55B | 30 s de audio | ~99 | MIT | safetensors, GGUF (comunitario) |
| MMS (Meta) | ~1B | no disponible | más de 1.000 | CC-BY-NC 4.0 | safetensors |
| SeamlessM4T v2 (Meta) | ~2,3B | no disponible | ~100 (entrada) | CC-BY-NC 4.0 | safetensors |

La comparación se limita a parámetros, cobertura y licencia porque no hay datos de benchmarks publicados para OmniASR en la información disponible. Frente a Whisper, OmniASR ofrece una cobertura lingüística mucho mayor y una licencia Apache 2.0 plenamente comercial, a costa de un tamaño casi triple. Frente a MMS, comparte el objetivo de mil lenguas, pero con licencia permisiva en lugar de no comercial.

## Limitaciones y advertencias

- No se publican métricas de WER por lengua, por lo que se desconoce la calidad real en lenguas de bajos recursos; es esperable una variabilidad alta entre idiomas.
- Riesgo de alucinación en pasajes de audio con ruido, silencios largos o música, comportamiento común en modelos ASR de secuencia a secuencia.
- Sesgos potenciales derivados del corpus `facebook/omnilingual-asr-corpus`: la distribución de horas por lengua condiciona el rendimiento y puede infrarepresentar variedades dialectales.
- No se documentan la longitud máxima de audio ni la estrategia de segmentación, lo que dificulta planificar despliegues con audios largos.
- Ausencia de variantes cuantizadas oficiales: el despliegue en GPUs de consumo de gama media requiere cuantización manual no validada por el autor.
- Licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar las condiciones del corpus de entrenamiento y de los datos que procese.
- El modelo tiene 15 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de robustez en producción.
- No se especifican requisitos de formato de audio (frecuencia de muestreo, canales), lo que puede provocar errores silenciosos si se alimenta con entradas no conformes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hf-audio/omniasr-llm-3b-v2
- Dataset de entrenamiento: https://huggingface.co/datasets/facebook/omnilingual-asr-corpus
- Paper asociado (referencia arXiv): https://arxiv.org/abs/2511.09690
