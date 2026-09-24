# rlabz/faster-quantum-asr

## Resumen

rlabz/faster-quantum-asr es una conversion a CTranslate2 del modelo de reconocimiento automatico del habla (ASR) Sunbird/SunflowerASR-51-african-languages, desarrollado por Sunbird AI. Se trata de un modelo basado en Whisper large-v3 que cubre 51 lenguas africanas y que aqui se distribuye cuantizado a int8 para su uso con faster-whisper. El repositorio no introduce cambios de comportamiento respecto al original: solo modifica el formato y la precision de los pesos y anade archivos de configuracion necesarios para la inferencia.

El problema que resuelve es doble. Por un lado, facilita el despliegue eficiente del modelo original fuera del ecosistema transformers, ya que CTranslate2 permite ejecucion en CPU con cuantizacion int8 y en GPU con float16. Por otro, corrige un fallo practico de compatibilidad: el repositorio original no incluye un archivo `preprocessor_config.json`, de modo que faster-whisper recurre por defecto a 80 bins mel, mientras que el modelo espera 128 bins mel (estilo large-v3), lo que provoca un error de forma en las caracteristicas de entrada. Esta conversion incluye un `preprocessor_config.json` escrito a mano con la configuracion estandar de Whisper large-v3.

Es relevante ahora porque buena parte de las lenguas africanas carece de herramientas ASR de calidad y de facil despliegue. Al publicarse bajo licencia Apache 2.0 y con un formato orientado a produccion (CTranslate2 int8), el modelo resulta util tanto para investigacion como para integraciones en servicios reales con recursos de computo limitados. El tamano del repositorio es de 1,6 GB, coherente con un modelo de la familia large cuantizado a int8.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3), convertido a CTranslate2 |
| Parametros totales | no disponible (derivado de Whisper large-v3) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 30 segundos de audio por ventana, 16 kHz, 128 bins mel (sin limite de duracion total, por procesamiento en ventanas) |
| Tipos de cuantizacion | int8 (CTranslate2); el `compute_type` puede cambiarse en tiempo de carga, por ejemplo `float16` en GPU |
| Idiomas soportados | 51 idiomas africanos segun el modelo base; el `language_map.json` de este repositorio incluye al menos `swa` (suajili), `lug` (luganda) y `eng` (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | CTranslate2 (`model.bin`), acompanado de `config.json`, `tokenizer.json`, `generation_config.json`, `processor_config.json`, `preprocessor_config.json` y `language_map.json` |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper large-v3: un transformer encoder-decoder que procesa audio en ventanas de 30 segundos a 16 kHz y genera transcripciones de forma autorregresiva. La caracteristica distintiva de esta version es que trabaja con 128 bins mel, frente a los 80 de variantes anteriores de Whisper, lo que obliga a disponer de un extractor de caracteristicas coherente. Esta conversion no altera la topologia: unicamente transforma los pesos al formato CTranslate2 y los cuantiza a int8. Segun la propia model card, el cambio de formato y precision no modifica el comportamiento del modelo por diseno.

Los detalles de entrenamiento corresponden al modelo original de Sunbird AI, no a esta conversion. Segun la informacion disponible, el modelo base fue entrenado sobre conjuntos de datos de voz de dominio publico y recogidos por la comunidad, y la publicacion asociada lleva por titulo "Group Relative Policy Optimisation Improves Multilingual Speech Recognition in Low-Resource Languages", lo que apunta al uso de GRPO (una tecnica de optimizacion por politica relativa a un grupo) como parte del proceso de ajuste. No se dispone en la informacion proporcionada del numero de tokens, de la composicion detallada del dataset ni de la secuencia completa de etapas de entrenamiento (preentrenamiento, ajuste supervisado, RLHF/DPO). Para esos datos debe consultarse la model card del modelo original.

## Capacidades

- Reconocimiento automatico del habla (transcripcion) sobre audio de 16 kHz.
- Cobertura de 51 lenguas africanas, segun el modelo base, con ejemplos documentados de suajili y luganda.
- Generacion de transcripciones con marcas temporales por segmento (inicio y fin), segun el ejemplo de uso de la model card.
- Ejecucion tanto en CPU (int8) como en GPU (por ejemplo, float16), cambiando el `compute_type` en la carga.
- Integracion nativa con faster-whisper mediante CTranslate2.
- Soporte de decodificacion por haces (`beam_size=5` en el ejemplo) y control de opciones como `vad_filter` y `condition_on_previous_text`.
- Mapeo explicito de codigos de idioma a tokens del modelo mediante `language_map.json`.
- No se documentan en la informacion disponible capacidades de traduccion, diarizacion de hablantes, vision, audio generativo ni tool calling.

## Casos de uso

- Transcripcion de voz en lenguas africanas de bajos recursos: el modelo permite obtener texto a partir de audio en suajili, luganda y otras lenguas cubiertas por el modelo base, un escenario donde escasean las alternativas de calidad.
- Subtitulado automatico: gracias a que la salida incluye marcas temporales por segmento, puede emplearse para generar subtitulos sincronizados en procesos de postproduccion o publicacion de video.
- Digitalizacion de patrimonio oral: archivos de audio historicos o grabaciones de tradicion oral pueden transcribirse en lote para su catalogacion y busqueda textual.
- Atencion al cliente y centros de contacto multilingues: integrado en un servicio de telefonia o mensajeria de voz, permite transcribir interacciones en varias lenguas africanas para su analisis, enrutado o registro.
- Monitorizacion de medios y radio: transcripcion continua de emisiones de radio para analisis de contenido, seguimiento de temas o generacion de resumenes.
- Investigacion linguistica y creacion de corpus: la transcripcion automatica a gran escala facilita la anotacion y el estudio de lenguas con pocos recursos escritos.
- Servicios publicos por voz: aplicaciones de salud, agricultura o informacion ciudadana pueden incorporar entrada de voz transcrita en la lengua local del usuario en lugar de limitarse al ingles.
- Procesamiento por lotes en infraestructura de CPU: al estar cuantizado a int8 y ocupar 1,6 GB, puede ejecutarse en servidores sin GPU para pipelines de transcripcion de gran volumen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card de esta conversion remite al modelo original y a su conjunto de evaluacion (Sunbird Speech Benchmark, un test multilingue de ASR para 51 lenguas africanas) para consultar los resultados, pero no reproduce cifras concretas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; al tratarse de un modelo de la familia large, el peso de los parametros es de aproximadamente 3 GB en float16 y de alrededor de 1,6 GB en int8, por lo que la VRAM necesaria sera algo superior a esas cifras segun el backend y el tamano de lote. Estas cantidades son estimaciones, no datos publicados.
- Ejecucion en CPU: int8 esta pensado para CPU; el repositorio ocupa 1,6 GB, de modo que se necesita al menos esa cantidad de memoria mas el margen del runtime.
- GPU recomendadas: no especificadas en la informacion disponible. Por tamano, un modelo large cuantizado a int8 o float16 es viable en GPUs de gama media y alta, pero no se documentan modelos concretos.
- Cabe en GPU de consumo: no se confirma explicitamente en la informacion disponible. Dado el tamano indicado (1,6 GB de repositorio), es plausible en GPUs de consumo con suficiente memoria, aunque esta afirmacion no esta respaldada por datos oficiales del repositorio.
- Opciones de despliegue: faster-whisper sobre CTranslate2 (uso documentado); el propio CTranslate2 admite otras integraciones. No se mencionan vLLM, TGI, Ollama ni llama.cpp en la informacion proporcionada (llama.cpp y GGUF no aplican a este formato).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Formato y disponibilidad |
|---|---|---|---|---|---|
| rlabz/faster-quantum-asr | no disponible (derivado de Whisper large-v3) | 30 s por ventana, 128 bins mel | 51 lenguas africanas segun el base | Apache 2.0 | CTranslate2 int8, 1,6 GB de repositorio |
| Sunbird/SunflowerASR-51-african-languages | no disponible en la informacion aportada | 30 s por ventana, 128 bins mel | 51 lenguas africanas | Apache 2.0 | Formato transformers; requiere `preprocessor_config.json` anadido para faster-whisper |
| Whisper large-v3 | no disponible en la informacion aportada | 30 s por ventana, 128 bins mel | Multilingue general (no centrado en lenguas africanas) | Licencia del modelo original de OpenAI | Multiples formatos de la comunidad |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada, por lo que la comparacion se limita a parametros, contexto, cobertura linguistica, licencia y formato.

## Limitaciones y advertencias

- No hay resultados de benchmarks publicados en la informacion disponible, por lo que no se puede verificar la calidad de transcripcion por lengua ni compararla con alternativas.
- El repositorio tiene 0 descargas y 0 "likes", y no cuenta con validacion de la comunidad; conviene evaluarlo en el dominio propio antes de usarlo en produccion.
- La cobertura linguistica real depende del modelo base. Aunque se anuncian 51 lenguas africanas, el modelo puede tener un rendimiento desigual entre ellas segun la disponibilidad de datos de entrenamiento.
- El `language_map.json` solo documenta explicitamente `swa`, `lug` y `eng`; es necesario revisar el mapeo completo para otras lenguas antes de desplegar.
- Fallo conocido y resuelto: sin el `preprocessor_config.json` con 128 bins mel, faster-whisper asume 80 bins y la transcripcion falla con un error de forma de caracteristicas. Si se repite la conversion manualmente, hay que anadir ese archivo despues.
- Riesgo de alucinacion inherente a los modelos Whisper, especialmente en audio con ruido, silencios largos o segmentos musicales. El ejemplo de uso desactiva `vad_filter` y `condition_on_previous_text`, lo que puede aumentar la reproduccion de texto inventado si no se ajusta.
- La licencia es Apache 2.0, la misma que la del modelo base, que a su vez sigue la licencia de Whisper large-v3; el uso comercial esta permitido, pero deben respetarse las condiciones y los requisitos de cita de los conjuntos de datos de voz originales.
- Este repositorio es una conversion de formato: los meritos del modelo corresponden a Sunbird AI y a las organizaciones y comunidades que recopilaron los datos.
- No se documentan limitaciones especificas de longitud de contexto mas alla de la ventana nativa de 30 segundos de Whisper; para audios largos es necesario segmentar y gestionar la continuidad entre ventanas.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/rlabz/faster-quantum-asr
- Modelo base Sunbird/SunflowerASR-51-african-languages: https://huggingface.co/Sunbird/SunflowerASR-51-african-languages
- Conjunto de evaluacion Sunbird Speech Benchmark: https://huggingface.co/datasets/Sunbird/speech-benchmark
- CTranslate2: https://github.com/OpenNMT/CTranslate2
- faster-whisper: https://github.com/SYSTRAN/faster-whisper
- Seccion de conjuntos de entrenamiento del modelo original: https://huggingface.co/Sunbird/SunflowerASR-51-african-languages#training-datasets
