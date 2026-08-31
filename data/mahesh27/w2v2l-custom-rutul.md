# mahesh27/w2v2l-custom-rutul

## Resumen

El modelo `mahesh27/w2v2l-custom-rutul` es un sistema de reconocimiento automático del habla (ASR) entrenado específicamente para la lengua Kina Rutul, una lengua del Cáucaso oriental en peligro de extinción. Fue desarrollado por V.S.D.S.Mahesh Akavarapu y colaboradores en el marco del artículo "Hard to Be Heard: Phoneme-Level ASR Analysis of Phonologically Complex, Low-Resource Endangered Languages" presentado en Findings of ACL 2026. El modelo se basa en un fine-tuning del checkpoint `ctaguchi/wav2vec2-large-xlsr-japlmthufielta-ipa1000-ns`, un wav2vec2 grande preentrenado con XLSR y vocabulario IPA de 1000 fonemas, y se adapta a la fonología de Rutul mediante un vocabulario de fonemas específico con inicialización heurística de la capa de salida.

El modelo aborda el problema de la escasez extrema de datos: solo se dispone de aproximadamente 1 hora y 20 minutos de audio transcrito para Rutul. A pesar de esta limitación, el sistema logra un rendimiento comparable o superior al de Whisper en esta lengua, según los resultados del artículo. Con 315 millones de parámetros, el modelo está disponible en formato safetensors bajo licencia Apache 2.0, lo que facilita su integración en flujos de documentación lingüística y preservación de lenguas. Su relevancia actual radica en la creciente atención a lenguas de bajos recursos y en la demostración de que arquitecturas preentrenadas como wav2vec2 pueden adaptarse eficazmente con estrategias de vocabulario fonético.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec2 large (transformer encoder) |
| Parametros totales | 315.524.820 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo safetensors en fp32) |
| Idiomas soportados | Kina Rutul (salida en IPA) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura wav2vec2 large, un encoder transformer convolucional que procesa audio crudo y produce representaciones contextualizadas. En este caso, el checkpoint base ya incluye un vocabulario IPA de 1000 fonemas, y el fine-tuning se realiza en el dataset `mahesh27/archi_rutul_asr`, que contiene alrededor de 80 minutos de audio transcrito para Rutul. La innovación principal del trabajo consiste en introducir un vocabulario de fonemas específico de la lengua (no solo IPA genérico) y aplicar una inicialización heurística de la capa de salida, lo que mejora consistentemente la convergencia y el rendimiento frente a una inicialización aleatoria.

El entrenamiento se realiza en un entorno de recursos extremadamente bajos, sin técnicas de aumento de datos adicionales más allá de las propias del XLSR preentrenado. No se menciona el uso de RLHF ni DPO; el proceso es un fine-tuning supervisado estándar sobre transcripciones fonémicas. El artículo también evalúa modelos como Whisper y Qwen2-Audio, pero el modelo wav2vec2 con vocabulario personalizado demuestra ser competitivo, especialmente en la tarea de reconocimiento de fonemas.

## Capacidades

- Reconocimiento automático del habla para la lengua Kina Rutul, produciendo transcripciones en el Alfabeto Fonético Internacional (IPA).
- Análisis a nivel de fonema, lo que permite estudiar errores sistemáticos y la relación entre frecuencia de entrenamiento y precisión.
- Inferencia sobre audio de corta duración (típicamente segmentos de pocos segundos, aunque la longitud de contexto no está documentada).
- Funciona como modelo de ASR independiente, sin necesidad de un modelo de lenguaje externo para la salida base, aunque se puede combinar con un LM para mejorar el WER (según el artículo, la variante con LM alcanza un WER de 0.697).
- No soporta tool calling, agentes ni razonamiento multi-paso; su única función es la transcripción fonética.
- Capacidad multilingüe limitada: está especializado en Kina Rutul, aunque el checkpoint base fue entrenado en múltiples lenguas (XLSR), el fine-tuning lo restringe a esta lengua.

## Casos de uso

- Documentación lingüística de lenguas en peligro: los investigadores pueden transcribir grabaciones de campo de hablantes de Kina Rutul de forma automática, reduciendo horas de trabajo manual. El modelo es adecuado porque su salida en IPA facilita el análisis fonológico directo.
- Preservación de patrimonio cultural: instituciones y comunidades pueden digitalizar archivos de audio históricos y generar transcripciones fonéticas para su archivado y estudio.
- Creación de corpus anotados: el modelo puede utilizarse para pre-anotar grandes volúmenes de audio, que luego un lingüista revisa y corrige, acelerando la construcción de recursos lingüísticos.
- Investigación en fonética comparada: al ofrecer transcripciones a nivel de fonema, permite estudiar la variación dialectal y los procesos fonológicos en Rutul y lenguas vecinas.
- Evaluación de modelos ASR en entornos de bajos recursos: sirve como referencia para comparar estrategias de adaptación a lenguas con datos escasos, frente a alternativas como Whisper.
- Desarrollo de herramientas educativas: puede integrarse en aplicaciones de aprendizaje de la lengua para hablantes no nativos, proporcionando retroalimentación sobre pronunciación.

## Benchmarks y rendimiento

Según el artículo "Hard to Be Heard" (ACL 2026 Findings), el modelo `w2v2l-custom-rutul` (denominado `w2v2l-custom-avg` en el paper) fue evaluado en el conjunto de prueba de Kina Rutul. Los resultados reportados indican que la variante con modelo de lenguaje (`w2v2l-custom-avg-lm`) alcanza un WER de 0.697, mientras que la variante sin LM (`w2v2l-custom-avg`) obtiene los mejores valores de CER (Character Error Rate) y PER (Phoneme Error Rate). No se proporcionan cifras numéricas exactas de CER y PER en la información disponible. El artículo también señala que Whisper se desempeña relativamente mal en esta lengua en comparación con este modelo.

| Metrica | Valor |
|---|---|
| WER (con LM) | 0.697 |
| WER (sin LM) | No disponible |
| CER | No disponible |
| PER | No disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: con 315M parámetros en fp32, el modelo ocupa aproximadamente 1.26 GB. Para inferencia con batch pequeño, una GPU con 4 GB de VRAM es suficiente (por ejemplo, GTX 1650 o RTX 3050). En CPU, el procesamiento en tiempo real es factible con segmentos de audio cortos.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM, como RTX 3060 o superior. Para entrenamiento se recomienda al menos 8 GB de VRAM, aunque el fine-tuning se realizó con recursos limitados.
- Cabe en GPUs de consumo: sí, el modelo es ligero para los estándares actuales y puede ejecutarse en tarjetas de gama media.
- Opciones de despliegue: el modelo se puede cargar con la librería `transformers` de Hugging Face, usando el pipeline de `automatic-speech-recognition`. También puede exportarse a ONNX para optimización en CPU. No es compatible directamente con vLLM ni TGI, que están orientados a modelos de lenguaje generativos.
- Latencia y throughput: no se han publicado métricas específicas, pero dado el tamaño, se espera una latencia de decenas de milisegundos por segmento en GPU y de unos pocos segundos en CPU.

## Comparativa con modelos similares

El modelo se compara principalmente con Whisper (en sus variantes `small` y `base`) y con el checkpoint base sin fine-tuning (`ctaguchi/wav2vec2-large-xlsr-japlmthufielta-ipa1000-ns`). Según el artículo, el modelo fine-tuneado supera a Whisper en la tarea de reconocimiento de Kina Rutul, mientras que el checkpoint base no está adaptado a esta lengua y probablemente produce transcripciones poco útiles. No se dispone de métricas comparativas públicas más allá de las del paper.

| Modelo | Parametros | Contexto | Rendimiento en Rutul | Licencia |
|---|---|---|---|---|
| w2v2l-custom-rutul (este) | 315M | no disponible | WER 0.697 (con LM) | Apache 2.0 |
| ctaguchi/wav2vec2-large-xlsr-japlmthufielta-ipa1000-ns (base) | 315M | no disponible | No evaluado | Apache 2.0 |
| Whisper small | 244M | 30 s | Peor que este modelo (según paper) | MIT |

## Limitaciones y advertencias

- Datos de entrenamiento muy limitados (aproximadamente 1 hora 20 minutos de audio), lo que puede provocar sobreajuste y baja generalización a hablantes o acentos no representados en el corpus.
- El modelo solo soporta la lengua Kina Rutul; no es aplicable a otras lenguas del Cáucaso sin un nuevo fine-tuning.
- La salida en IPA puede contener errores fonéticos en palabras poco frecuentes, ya que la precisión a nivel de fonema está correlacionada con la frecuencia de aparición en el entrenamiento.
- No se han documentado sesgos específicos, pero es probable que el modelo funcione mejor con voces masculinas o adultas si el corpus de entrenamiento está desequilibrado (no se dispone de esa información).
- La licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye sin garantías y no se proporciona soporte técnico.
- Para uso en producción, se recomienda evaluar el modelo con datos locales y considerar la combinación con un modelo de lenguaje para reducir el WER, como se hizo en el artículo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mahesh27/w2v2l-custom-rutul
- Dataset de entrenamiento: https://huggingface.co/datasets/mahesh27/archi_rutul_asr
- Repositorio de código (GitHub): https://github.com/mahesh-ak/north_caucasian_asr
- Artículo en ACL Anthology: https://aclanthology.org/2026.findings-acl.147/
- Artículo en arXiv: https://arxiv.org/html/2604.18204v1
- Blog digest del artículo: https://nanless.github.io/audio-paper-digest-blog/posts/2026-04-21-hard-to-be-heard-phoneme-level-asr-analysis-of/
