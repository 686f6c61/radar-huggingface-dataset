# hojreh/Quds-v4-xl-unified

## Resumen

Quds-v4-xl-unified es un modelo de reconocimiento automatico del habla (ASR) para persa (farsi), desarrollado por el usuario hojreh, especializado en el dominio de estudios islamicos: recitacion del Coran, tafsir (exegesis) y fiqh (jurisprudencia). Se presenta como la version "Pro" del modelo Quds v4, con mayor precision y una unica arquitectura unificada que cubre tanto transcripcion offline como en streaming. La model card lo define explicitamente como sucesor mejorado del modelo base Quds-v4-onnx.

Tecnicamente, las etiquetas del repositorio apuntan a una arquitectura FastConformer con decodificador hibrido de tipo RNNT (recurrent neural network transducer), un diseno habitual en modelos ASR modernos por su buen equilibrio entre latencia y precision. La etiqueta "timestamp" indica que el modelo produce marcas temporales a nivel de palabra o segmento, lo que facilita el subtitulado y la alineacion.

La relevancia del modelo es discutible en el momento de redactar esta ficha: no tiene descargas ni "likes", no publica licencia, no incluye resultados de benchmarks y el unico canal de acceso indicado es contactar por email para probar o comprar. Esto lo situa como un modelo comercial cerrado y sin validacion publica independiente, algo poco comun en HuggingFace y que condiciona cualquier evaluacion seria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer con decodificador hibrido RNNT (segun etiquetas del repositorio) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | persa (farsi, codigo `fa`) |
| Licencia | no disponible |
| Formato de pesos | no disponible (el modelo base Quds-v4 se distribuye en ONNX, pero no se confirma para esta version) |

## Arquitectura y entrenamiento

La informacion publica no detalla el proceso de entrenamiento. Las etiquetas indican una arquitectura FastConformer, es decir, un encoder transformer aumentado con modulos convolucionales que reducen la longitud de secuencia antes de la atencion, combinado con un decodificador hibrido RNNT. Este tipo de diseno se usa habitualmente para tareas de ASR en dominios especificos porque permite equilibrar precision y coste computacional, y las etiquetas "hybrid" y "rnnt" confirman que el modelo integra al menos dos modos de decodificacion.

No se especifica el numero de tokens de entrenamiento, la composicion del dataset, si hubo ajuste fino supervisado, ni si se aplicaron tecnicas de aumento de datos o adaptacion de dominio (por ejemplo, lexicon especifico de Coran y fiqh). Tampoco se documenta la estrategia que permite unificar inferencia offline y streaming en un unico conjunto de pesos, mas alla de la afirmacion de la propia model card.

## Capacidades

- Reconocimiento automatico del habla en persa (farsi) orientado a contenido islamico.
- Transcripcion de audio en modo offline (procesamiento por lotes).
- Transcripcion en streaming, segun la model card, dentro del mismo modelo unificado.
- Generacion de marcas temporales (timestamps), apta para subtitulado y alineacion.
- Vocabulario adaptado al dominio religioso: terminologia coranica, tafsir y fiqh.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio-vision ni razonamiento multi-paso. Es un modelo puramente ASR, no un modelo generativo conversacional.

## Casos de uso

- Transcripcion de recitaciones coranicas: el modelo esta especializado en vocabulario coranico y marcas temporales, lo que permite generar transcripciones alineadas con el audio para estudios o publicaciones digitales.
- Archivado de clases y sermones: convertir grabaciones largas de conferencias religiosas en texto buscable, aprovechando el modo offline para procesar horas de audio en lote.
- Subtitulado de videos islamicos: las marcas temporales permiten generar subtitulos sincronizados para plataformas de video en persa.
- Transcripcion en directo de eventos religiosos: el modo streaming permitiria generar subtitulos en tiempo real durante retransmisiones de sermones o recitaciones.
- Indexacion y busqueda semantica de corpus de tafsir: transcribir un archivo de sesiones de exegesis para despues indexarlo y permitir consultas textuales.
- Asistentes de voz para preguntas de fiqh: integrar el modelo como front-end de reconocimiento en un asistente que responda consultas de jurisprudencia, siempre que se combine con un modulo de comprension adicional.
- Documentacion academica de estudios islamicos: investigadores que necesiten citas textuales con marcas temporales de fuentes orales pueden usar la salida del modelo como transcripcion base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de WER (word error rate), CER, ni comparaciones frente a otros sistemas de ASR en persa.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se publica el numero de parametros ni el tamano de los pesos).
- GPU recomendadas: no disponible. En modelos FastConformer de tamano "XL" es habitual que la inferencia quepa en GPUs de gama media, pero no hay confirmacion para este modelo concreto.
- Ejecucion en GPU de consumo: no confirmado. La viabilidad depende del tamano real de los pesos, dato no publicado.
- Opciones de despliegue: la model card no menciona frameworks de servido. El modelo base Quds-v4 se distribuye en ONNX, lo que sugeriria compatibilidad con ONNX Runtime, pero no esta confirmado para esta version unificada.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Contexto / audio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Quds-v4-xl-unified | ASR especializado (FastConformer + RNNT) | Persa | no disponible | no disponible | Comercial, previa solicitud por email |
| Quds-v4-onnx (modelo base del mismo autor) | ASR (ONNX) | Persa | no disponible | no disponible | Publico en HuggingFace |
| Whisper large-v3 (OpenAI) | ASR multilingue seq2seq | Multilingue, incluye persa | Ventanas de 30 s | MIT | Publico |
| Modelos wav2vec2 / MMS para persa (Meta) | ASR auto-supervisado | Multilingue, incluye persa | no disponible | Mayoritariamente abierta (varia por variante) | Publico |

La comparacion de rendimiento entre Quds-v4-xl-unified y estas alternativas no es posible porque no hay cifras publicadas del modelo. La ventaja teorica de Quds-v4-xl-unified seria su especializacion en vocabulario islamico y su modo streaming unificado, pero esto no esta respaldado por datos verificables.

## Limitaciones y advertencias

- Licencia no especificada: no se puede determinar si el uso comercial esta permitido. La model card sugiere un modelo de pago ("buy") y canaliza el acceso a traves de email, lo que apunta a un producto propietario.
- Ausencia total de benchmarks: no hay evidencia publica de WER ni de rendimiento frente a alternativas abiertas como Whisper o wav2vec2.
- Sin descargas ni valoraciones en HuggingFace: el modelo no ha sido validado por la comunidad en el momento de redactar esta ficha.
- Idiomas limitados al persa: no hay soporte multilingue documentado, lo que restringe su uso a contenido en farsi.
- Sesgo de dominio: la especializacion en estudios islamicos puede degradar el rendimiento en persa coloquial, tecnico o de otros ambitos si el entrenamiento estuvo muy sesgado hacia el corpus religioso.
- Riesgo de alucinacion inherente a los sistemas ASR: en audio ruidoso o con acentos no vistos, el decodificador puede generar texto plausible pero incorrecto, especialmente en terminologia especializada.
- Modelo sin documentacion tecnica publica: no se detallan datos de entrenamiento, tamano, cuantizaciones soportadas ni requisitos de hardware, lo que dificulta planificar su integracion en produccion.
- Fechas del repositorio (creacion y actualizacion en 2026) resultan atipicas respecto a la fecha actual, lo que conviene verificar directamente en HuggingFace.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/hojreh/Quds-v4-xl-unified
- Modelo base mencionado en la model card: https://huggingface.co/hojreh/Quds-v4-onnx
- Foro de discusion para pruebas o compra: https://huggingface.co/hojreh/Quds-v4-xl-unified/discussions
