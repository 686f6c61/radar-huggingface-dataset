# algorithco/parakeet-tdt-0.6b-v3

## Resumen

Parakeet-tdt-0.6b-v3 es un modelo de reconocimiento automático del habla (ASR) publicado en HuggingFace bajo el espacio de nombres `algorithco`. Con 627.057.286 parámetros (aproximadamente 0,6 mil millones), está construido sobre la arquitectura FastConformer combinada con un decodificador TDT (Token-and-Duration Transducer), una variante de los transductores RNN que predice conjuntamente el token y su duración temporal. Los datasets de entrenamiento declarados son `nvidia/Granary` y `nemo/asr-set-3.0` y las etiquetas del repositorio remiten al ecosistema NVIDIA NeMo, lo que apunta a una redistribución del modelo Parakeet TDT 0.6b v3 de NVIDIA bajo el espacio de nombres de terceros; no se documenta en la información disponible ninguna modificación adicional sobre el modelo original.

Su rasgo diferencial es la cobertura multilingüe: declara soporte para 25 idiomas europeos (inglés, español, francés, alemán, búlgaro, croata, checo, danés, neerlandés, estonio, finés, griego, húngaro, italiano, letón, lituano, maltés, polaco, portugués, rumano, eslovaco, esloveno, sueco, ruso y ucraniano), algo poco habitual en modelos de este tamaño, que suelen limitarse al inglés o a un puñado de lenguas. El model-index del autor incluye resultados de WER en inglés (LibriSpeech, GigaSpeech, SPGI, TED-LIUM, Vox Populi, AMI y Earnings-22) y por idioma en FLEURS.

Es relevante ahora porque combina un tamaño contenido (apto para GPU de consumo e incluso CPU con cuantización) con soporte multilingüe amplio y licencia CC-BY-4.0, lo que lo hace candidato para pipelines de transcripción autoalojados donde el coste por hora de audio y la soberanía del dato son críticos. El repositorio incluye pesos en `safetensors` y una etiqueta `gguf` que indica la presencia de pesos cuantizados para inferencia en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer (encoder Conformer con downsampling por convolución depthwise separable) + decodificador TDT (Token-and-Duration Transducer) |
| Parametros totales | 627.057.286 (dato real de safetensors) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible (modelo de audio; la información disponible no especifica ventana de muestras ni duración máxima por segmento) |
| Tipos de cuantizacion | Pesos completos en safetensors; el repositorio incluye la etiqueta `gguf`, lo que indica pesos cuantizados en formato GGUF, pero no se detallan los niveles concretos (Q4, Q8, etc.) |
| Idiomas soportados | 25: en, es, fr, de, bg, hr, cs, da, nl, et, fi, el, hu, it, lv, lt, mt, pl, pt, ro, sk, sl, sv, ru, uk |
| Licencia | cc-by-4.0 |
| Formato de pesos | safetensors y GGUF |
| Tamano del repositorio | 5,7 GB |
| Modalidad de entrada | Audio (voz) |
| Modalidad de salida | Texto (transcripción) |
| Libreria principal | transformers (tambien compatible con NeMo) |
| Pipeline declarado | automatic-speech-recognition |
| Datasets de entrenamiento declarados | nvidia/Granary, nemo/asr-set-3.0 |

## Arquitectura y entrenamiento

El modelo sigue el esquema FastConformer-TDT. El encoder FastConformer es una variante del Conformer (bloques de atención multi-cabeza combinados con convoluciones y redes feed-forward) que aplica un downsampling convolucional de profundidad separable con factor 8 a la secuencia de features acústicas antes de entrar en los bloques de atención, lo que reduce el coste cuadrático de la atención y permite procesar audio largo con menor huella de memoria. El decodificador TDT (Token-and-Duration Transducer) sustituye al transductor RNN-T clásico prediciendo, en cada paso, tanto el token siguiente como su duración en frames; esto reduce el número de pasos de decodificación necesarios y, según la literatura de NVIDIA (arXiv:2304.06795), mejora la latencia de inferencia sin degradar el WER.

En cuanto al entrenamiento, los datasets declarados son `nvidia/Granary` y `nemo/asr-set-3.0`, corpus a gran escala del ecosistema NeMo que combinan datos supervisados y pseudo-etiquetados en múltiples idiomas. La información disponible no especifica el número exacto de horas de audio, la composición porcentual por idioma, ni si se aplicaron fases de RLHF/DPO (poco habituales en ASR). Tampoco se documentan innovaciones adicionales más allá de la propia arquitectura TDT y el esquema de aumento de datos implícito en los corpus de NVIDIA. Los artículos referenciados en las etiquetas del modelo cubren FastConformer (arXiv:2305.05084), TDT (arXiv:2304.06795), el corpus Granary (arXiv:2505.13404) y otras piezas del stack de NVIDIA, aunque no se ha podido verificar en esta información qué técnicas concretas se aplicaron exactamente a esta versión.

## Capacidades

- Transcripción de voz a texto en 25 idiomas europeos con un único modelo monolítico, sin necesidad de seleccionar un checkpoint por idioma.
- Reconocimiento en condiciones acústicas variadas: el model-index reporta resultados en dominios tan distintos como lectura de libros (LibriSpeech), reuniones multipartícipe (AMI), llamadas de resultados financieros (Earnings-22), YouTube (GigaSpeech), discursos parlamentarios (Vox Populi) y charlas TED.
- Formato de transducer (TDT) orientado a streaming, dado que la arquitectura por naturaleza permite decodificación incremental; la información disponible no detalla el tamaño de chunk ni la latencia algorítmica exacta.
- Extracción de features acústicas: la etiqueta `feature-extraction` figura entre las capacidades declaradas del repositorio.
- Compatibilidad con el ecosistema transformers y con NeMo, lo que facilita integración en pipelines existentes de ambos frameworks.
- Soporte declarado de pesos GGUF para despliegue cuantizado.
- No se declara en la información disponible soporte de tool calling, function calling, razonamiento multi-paso ni capacidades de agente, algo esperable en un modelo puramente ASR.
- No se declara traducción de voz (speech translation), diarización de hablantes ni detección de eventos de audio.

## Casos de uso

- Transcripción de reuniones corporativas: el modelo reporta un WER de 11,31 en AMI (test, config ihm), un corpus específicamente diseñado para audio de reuniones multipartícipe. Se usaría con segmentación previa por turno y agregación posterior de la transcripción en un sistema de actas automáticas.
- Subtitulado y postproducción audiovisual: en TED-LIUM v3 el WER declarado es de 2,75, lo que lo hace adecuado para transcribir contenido monologado de alta calidad y generar subtítulos base que un editor humano revise.
- Análisis de llamadas de resultados financieros: con un WER de 11,42 en Earnings-22, permite alimentar pipelines de análisis de sentimiento o extracción de entidades sobre llamadas de inversores, un dominio con vocabulario técnico y solapamiento de hablantes.
- Atención al cliente multilingüe en Europa: al cubrir 25 idiomas con el mismo checkpoint, una única instancia puede transcribir llamadas en español (WER 3,45 en FLEURS), francés (5,15) o alemán (5,04) sin enrutado por idioma, simplificando el despliegue en centros de contacto paneuropeos.
- Indexación y búsqueda sobre archivos de audio históricos: transcripción por lotes de grabaciones en bibliotecas, hemerotecas o archivos judiciales para construir índices de texto buscables, con especial utilidad en idiomas menos cubiertos por modelos comerciales como estonio, letón, lituano, esloveno o maltés.
- Generación de datasets de entrenamiento para otros sistemas: la capacidad de `feature-extraction` y la licencia CC-BY-4.0 permiten usar el modelo como anotador automático para producir transcripciones pseudo-etiquetadas de audio propio, que después alimenten el entrenamiento de modelos específicos de dominio.
- Accesibilidad en tiempo real: transcripción de clases, conferencias o consultas médicas con la salida volcada a un lector de subtítulos, desplegando el modelo en local para cumplir con requisitos de protección de datos (RGPD) sin enviar audio a APIs externas.
- Procesamiento en el borde o en CPU: con 0,6 mil millones de parámetros y pesos GGUF, es viable ejecutar la transcripción en estaciones de trabajo sin GPU dedicada o en servidores modestos, lo que habilita casos como transcripción de notas de voz en aplicaciones de campo sin conectividad.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index de la model card (todos marcados como no verificados, `verified: false`). Métrica: WER (Word Error Rate), menor es mejor.

| Dataset | Idioma | Config / split | WER |
|---|---|---|---|
| LibriSpeech | en | test | 1,93 |
| LibriSpeech | en | test | 3,59 |
| TED-LIUM v3 | en | release1 / test | 2,75 |
| SPGI Speech | en | test / test | 3,97 |
| Vox Populi | en | en / test | 6,14 |
| GigaSpeech | en | test | 9,59 |
| AMI (Meetings) | en | ihm / test | 11,31 |
| Earnings-22 | en | test | 11,42 |
| FLEURS | es | es_419 / test | 3,45 |
| FLEURS | en | en_us / test | 4,85 |
| FLEURS | de | de_de / test | 5,04 |
| FLEURS | fr | fr_fr / test | 5,15 |
| FLEURS | cs | cs_cz / test | 11,01 |
| FLEURS | bg | bg_bg / test | 12,64 |
| FLEURS | fi | fi_fi / test | 13,21 |
| FLEURS | et | et_ee / test | 17,73 |
| FLEURS | da | da_dk / test | 18,41 |
| FLEURS | el | el_gr / test | 20,7 |

Notas sobre estos datos: LibriSpeech aparece con dos valores (1,93 y 3,59) bajo el mismo split en el model-index; lo habitual en la literatura es que correspondan a test-clean y test-other, pero la model card no lo explicita. La lista de resultados en FLEURS está truncada en la información proporcionada (se corta en `hr_hr`), por lo que no se dispone de los WER de húngaro, italiano, letón, lituano, maltés, neerlandés, polaco, portugués, rumano, eslovaco, esloveno, sueco, ruso y ucraniano. No se han publicado en la información disponible resultados comparativos con otros modelos en los mismos benchmarks.

## Requisitos de hardware

Estimaciones derivadas del recuento real de parámetros (627 millones); no proceden de mediciones publicadas por el autor en la información disponible.

- VRAM estimada (solo pesos): aproximadamente 2,5 GB en fp32, 1,25 GB en bf16/fp16, 0,7 GB en cuantización int8 y 0,4 GB en int4. Hay que sumar el espacio de activaciones, el estado del decodificador TDT y los buffers de audio, por lo que en la práctica conviene reservar entre 2 y 4 GB en bf16 para segmentos de audio de duración habitual.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM funciona en bf16. Para lotes grandes o audio largo en paralelo, se recomiendan A100, H100, L40S o RTX 6000 Ada; para desarrollo y despliegues pequeños, RTX 3060 12 GB, RTX 4060 Ti, RTX 4070, RTX 4080 y RTX 4090 son más que suficientes.
- Cabe en GPU de consumo: sí, holgadamente. Incluso una GTX 1650 de 4 GB o una GPU integrada moderna pueden ejecutarlo en cuantizaciones bajas.
- Ejecución en CPU: viable con pesos GGUF cuantizados; el throughput dependerá del número de núcleos y del soporte de instrucciones vectoriales, pero es una opción realista para transcripción por lotes sin requisitos de latencia estricta.
- Opciones de despliegue: transformers (pipeline `automatic-speech-recognition`), NVIDIA NeMo, y servidores de inferencia compatibles con GGUF. No se ha confirmado en la información disponible soporte específico en vLLM, TGI u Ollama para esta arquitectura.
- Latencia y throughput: no disponible. No se han proporcionado mediciones de RTF (real-time factor), latencia por chunk ni tokens por segundo.

## Comparativa con modelos similares

Los datos de parámetros, idiomas y licencia de los modelos alternativos proceden de catálogos públicos y no se han verificado contra la información proporcionada en esta ficha; los datos de rendimiento comparativo no están disponibles.

| Modelo | Parametros | Idiomas | Licencia | Disponibilidad | Benchmark comparativo |
|---|---|---|---|---|---|
| algorithco/parakeet-tdt-0.6b-v3 | 627 M | 25 (europeos) | cc-by-4.0 | HuggingFace (safetensors y GGUF) | WER declarados en la tabla anterior |
| nvidia/parakeet-tdt-0.6b-v2 | ~600 M | 1 (ingles) | cc-by-4.0 | HuggingFace / NeMo | No disponible en la informacion proporcionada |
| nvidia/canary-1b | ~1.000 M | 4 (en, de, es, fr) + traduccion | cc-by-4.0 | HuggingFace / NeMo | No disponible en la informacion proporcionada |
| openai/whisper-large-v3 | ~1.550 M | ~99 | MIT | HuggingFace / transformers | No disponible en la informacion proporcionada |

Diferencias cualitativas relevantes: frente a parakeet-tdt-0.6b-v2, esta versión amplía la cobertura de 1 a 25 idiomas manteniendo el mismo orden de magnitud de parámetros. Frente a Canary-1B, ofrece más idiomas pero no se declara traducción de voz en la información disponible. Frente a Whisper large-v3, es aproximadamente 2,5 veces más pequeño, lo que reduce los requisitos de VRAM y el coste por hora de audio, a costa de una cobertura de idiomas mucho menor y de depender del ecosistema NeMo/transformers en lugar de una comunidad más amplia.

## Limitaciones y advertencias

- Resultados no verificados: todos los WER del model-index están marcados con `verified: false`, es decir, son cifras autodeclaradas por el publicador y no han pasado por un proceso de validación independiente.
- Cobertura desigual entre idiomas: dentro de los datos disponibles, el WER en FLEURS oscila entre 3,45 (español) y 20,7 (griego), pasando por 18,41 en danés o 17,73 en estonio. El rendimiento en lenguas bálticas, nórdicas y griego es sustancialmente peor que en las lenguas románicas y germánicas mayoritarias.
- Datos incompletos en el model-index: la lista de resultados multilingües está truncada, por lo que no se puede evaluar el rendimiento declarado en más de la mitad de los idiomas soportados.
- Sesgos acústicos y dialectales: no se documenta la composición demográfica ni la distribución de acentos del corpus de entrenamiento, por lo que se desconoce el comportamiento ante acentos no estándar, habla con ruido de fondo severo o variedades no estándar del español (incluido el castellano de España frente a variedades latinoamericanas, ya que el único dato disponible de FLEURS para español es `es_419`).
- Riesgo de alucinación: como todo modelo ASR, puede generar texto que no corresponde al audio, especialmente en silencios largos, música o ruido. No se documentan mecanismos de mitigación ni umbrales de confianza en la información disponible.
- Sin diarización ni marcas de tiempo documentadas: no se declara capacidad de identificar hablantes ni de producir timestamps a nivel de palabra, lo que limita su uso directo en subtitulado profesional sin postprocesado.
- Sensibilidad al dominio: la diferencia entre el WER de LibriSpeech (1,93) y el de AMI (11,31) muestra una degradación notable en audio espontáneo y multipartícipe. Los datos de AMI y Earnings-22 citados corresponden a configuraciones específicas del dataset que pueden no reflejar condiciones reales de producción.
- Licencia CC-BY-4.0: permite uso comercial, pero exige atribución al autor y la indicación de cambios. Es importante conservar el aviso de licencia en la redistribución, aunque no se especifica en la información proporcionada a quién debe atribuirse exactamente (al publicador del repositorio o al desarrollador original del modelo).
- Trazabilidad: el modelo se publica bajo un espacio de nombres de terceros con 0 descargas y 0 likes en el momento de la consulta, y no se documenta explícitamente qué cambios, si alguno, se han aplicado respecto al modelo original de NVIDIA. Para producción, conviene verificar la procedencia antes de adoptarlo.
- Sin garantías de soporte: no se indica mantenimiento, versionado ni canal de soporte del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/algorithco/parakeet-tdt-0.6b-v3
- Dataset nvidia/Granary: https://huggingface.co/datasets/nvidia/Granary
- Dataset nemo/asr-set-3.0: https://huggingface.co/datasets/nemo/asr-set-3.0
- Articulos referenciados en las etiquetas del modelo:
  - https://arxiv.org/abs/2509.14128
  - https://arxiv.org/abs/2505.13404
  - https://arxiv.org/abs/2305.05084 (FastConformer)
  - https://arxiv.org/abs/2304.06795 (TDT, Token-and-Duration Transducer)
  - https://arxiv.org/abs/2410.01036
  - https://arxiv.org/abs/2406.00899
  - https://arxiv.org/abs/2205.12446
  - https://arxiv.org/abs/2012.03411
  - https://arxiv.org/abs/2007.10310
  - https://arxiv.org/abs/1510.08484
- Muestras de audio del widget de la model card:
  - https://cdn-media.huggingface.co/speech_samples/sample1.flac
  - https://cdn-media.huggingface.co/speech_samples/sample2.flac

Nota: la búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo. Los únicos resultados obtenidos correspondían a una plataforma de educación escolar en turco sin relación alguna con el modelo, por lo que no se incluyen. No se han encontrado papers específicos, blogs, repositorios ni demos adicionales asociados a este repositorio más allá de los enlaces listados arriba.
