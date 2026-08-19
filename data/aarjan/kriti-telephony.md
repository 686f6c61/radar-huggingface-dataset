# Aarjan/kriti-telephony

## Resumen

Kriti Telephony es un modelo de reconocimiento automático de voz (ASR) para nepalí, especializado en audio telefónico real: conversaciones de call center, code-switching y líneas de banda estrecha. Es una adaptación por dominio del modelo Kriti, desarrollado originalmente por Naamche Labs, y ha sido publicado por Aarjan (Arjan Chaudhary) bajo licencia MIT. El modelo resuelve el problema de la baja precisión de los ASR genéricos en audio telefónico, un escenario habitual en atención al cliente y servicios de voz, donde el nepalí está muy poco representado en los sistemas comerciales.

Kriti Telephony se basa en una arquitectura Conformer (según las etiquetas del repositorio) y cuenta con aproximadamente 119 millones de parámetros, según la publicación del autor en redes sociales. El modelo se distribuye en formato NeMo (.nemo) y está pensado para integrarse en pipelines de ASR mediante la librería NeMo. Su relevancia actual radica en que ofrece una alternativa ligera y de código abierto para transcribir llamadas telefónicas en nepalí, un idioma hablado por más de 16 millones de personas y con escasos recursos de IA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer (basada en el modelo Kriti de Naamche Labs) |
| Parametros totales | 119 millones (según publicación del autor; no confirmado en la model card) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelo ASR, no generativo de texto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Nepalí (ne) |
| Licencia | MIT |
| Formato de pesos | NeMo (.nemo), compatible con la librería NeMo |

## Arquitectura y entrenamiento

El modelo se construyó mediante destilación de conocimiento: un modelo nepalí existente y robusto etiqueta audio conversacional en el estilo de transcripción objetivo, y sobre esas etiquetas se realiza un fine-tuning de Kriti. Para preservar la capacidad general sobre nepalí limpio, se mezcla un conjunto de anclaje con transcripciones humanas. El resultado es un modelo de dominio telefónico que mantiene un rendimiento aceptable en audio general, aunque inferior al modelo base en ese escenario.

La arquitectura subyacente es un Conformer, típica en ASR moderno, con un decodificador RNNT (el código de uso indica `model.cur_decoder = "rnnt"`). El entrenamiento se realizó sobre el fork de NeMo de AI4Bharat, y en GPUs Hopper (H100) requiere la variable de entorno `NUMBA_CUDA_USE_NVIDIA_BINDING=1`. No se han publicado detalles sobre el número de tokens de entrenamiento ni la composición exacta del dataset.

## Capacidades

- Transcripción de audio telefónico en nepalí, incluyendo conversaciones de call center y líneas de banda estrecha.
- Manejo de code-switching (mezcla de nepalí con otros idiomas, típico en conversaciones reales).
- Reconocimiento de voz en nepalí general, aunque con peor rendimiento que el modelo base en audio limpio.
- Integración con el ecosistema NeMo para ASR (restauración de modelo, transcripción por lotes).
- Soporte de decodificación RNNT para baja latencia.
- Modelo ligero (119M parámetros) adecuado para despliegue en hardware modesto.

## Casos de uso

- Transcripción de llamadas de atención al cliente: el modelo puede convertir automáticamente conversaciones telefónicas de soporte en texto para análisis de calidad, detección de intenciones o generación de resúmenes. Su especialización en audio telefónico lo hace adecuado para este escenario, reduciendo el WER frente a modelos genéricos.
- Análisis de call centers en nepalí: las empresas pueden procesar grabaciones de llamadas para extraer métricas de satisfacción, identificar problemas recurrentes o entrenar asistentes virtuales. El modelo soporta audio de banda estrecha y ruido típico de líneas telefónicas.
- Subtitulado automático de podcasts o vídeos con voz telefónica: cuando el contenido incluye entrevistas o testimonios grabados por teléfono, este modelo mejora la precisión frente a ASR estándar.
- Asistentes de voz para servicios locales: integrado en un pipeline de voz a texto, puede alimentar sistemas de reservas o información en nepalí, como el proyecto KRITI-AI (asistente para hostelería) que se menciona en la búsqueda web.
- Investigación académica en ASR para idiomas de bajos recursos: el modelo y su metodología de destilación pueden servir como referencia para adaptar ASR a dominios específicos (telefonía, radio, etc.) en otros idiomas.
- Archivado y búsqueda de grabaciones de llamadas: transcripción automática para indexar y hacer buscables conversaciones telefónicas en nepalí, útil en entornos legales o de cumplimiento.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados de WER (word error rate, menor es mejor):

| Modelo | NepTel WER (telefonía) | General Nepali WER |
|---|---:|---:|
| Kriti (base) | 40.8 | 4.1 |
| **Kriti Telephony** | **31.3** | 9.9 |

Kriti Telephony reduce el WER en telefonía en aproximadamente un 23% (de 40.8 a 31.3), pero empeora en audio general limpio (de 4.1 a 9.9). El autor advierte que NepTel es un único benchmark con solo 3 llamadas de un mismo proveedor, por lo que la mejora debe interpretarse como dirección, no como valor absoluto. No se han publicado resultados en otros benchmarks estándar como MMLU o HumanEval, ya que es un modelo ASR y no generativo de texto.

## Requisitos de hardware

- El tamaño del repositorio es de 0.5 GB, lo que sugiere que el modelo en precisión FP32 ocupa aproximadamente 500 MB (119M parámetros × 4 bytes). Con cuantización a FP16 o int8, cabría en menos de 250 MB.
- VRAM estimada: menos de 1 GB para inferencia en FP16, por lo que es viable en GPUs de consumo como NVIDIA GTX 1650, RTX 2060 o superiores.
- Puede ejecutarse en CPU para inferencia por lotes, aunque con mayor latencia.
- Se requiere la librería NeMo y el fork de AI4Bharat. En GPUs Hopper (H100) es necesario establecer `NUMBA_CUDA_USE_NVIDIA_BINDING=1`.
- Opciones de despliegue: NeMo (inferencia local), posible exportación a ONNX o TensorRT para producción, aunque no está documentado en la model card.
- No se proporcionan datos de latencia o throughput.

## Comparativa con modelos similares

La comparativa más directa es con el modelo base Kriti, del cual deriva:

| Modelo | Parámetros | Enfoque | NepTel WER | General WER | Licencia |
|---|---|---|---:|---:|---|
| Kriti (base) | 119M | ASR nepalí general | 40.8 | 4.1 | MIT |
| **Kriti Telephony** | 119M | ASR nepalí adaptado a telefonía | **31.3** | 9.9 | MIT |

No se dispone de información sobre otros modelos ASR nepalíes comparables (como los de AI4Bharat o Google) en la información proporcionada. La comparativa se limita a la pareja base/adaptado.

## Limitaciones y advertencias

- Especialización de dominio: el modelo es mejor en telefonía pero peor en audio limpio que el modelo base. Para audio de estudio o grabaciones de alta calidad, se recomienda usar Kriti base.
- El benchmark NepTel es limitado (3 llamadas, un solo proveedor), por lo que los resultados pueden no generalizar a otros contextos telefónicos.
- Parte de la mejora en telefonía puede deberse a que el modelo aprende un estilo de transcripción compartido con las referencias, no necesariamente a una mayor robustez acústica. El autor planea validar con un benchmark neutral.
- No se documentan sesgos específicos, pero al ser un modelo entrenado con datos de un dominio concreto, puede fallar en acentos o dialectos no representados.
- Riesgo de alucinación: aunque es un modelo ASR, puede producir transcripciones incorrectas en audio muy ruidoso o con solapamiento de hablantes.
- La licencia MIT permite uso comercial, pero los conjuntos de datos y modelos de terceros utilizados en el entrenamiento conservan sus propias licencias (según la model card).
- No se proporcionan instrucciones de cuantización ni formatos alternativos (GGUF, ONNX), lo que limita su despliegue fuera del ecosistema NeMo.

## Enlaces

- [HuggingFace - Aarjan/kriti-telephony](https://huggingface.co/Aarjan/kriti-telephony)
- [Repositorio GitHub - Naamche-Labs/kriti-telephony](https://github.com/Naamche-Labs/kriti-telephony) (metodología, benchmarks y entorno)
- [Repositorio GitHub - Naamche-Labs/kriti](https://github.com/Naamche-Labs/kriti) (modelo base)
- [Publicación en X del autor](https://x.com/ArjanChaudharyy/status/2089748987264073815) (anuncio del modelo base Kriti)
