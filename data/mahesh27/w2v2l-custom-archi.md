# mahesh27/w2v2l-custom-archi

## Resumen

El modelo `mahesh27/w2v2l-custom-archi` es un sistema de reconocimiento automático del habla (ASR) desarrollado por V.S.D.S.Mahesh Akavarapu y colaboradores para la lengua archi, una lengua caucásica nororiental en peligro de extinción hablada en Daguestán (Rusia). Se trata de un fine-tuning del modelo `ctaguchi/wav2vec2-large-xlsr-japlmthufielta-ipa1000-ns`, un wav2vec2 grande preentrenado en múltiples idiomas, adaptado específicamente para transcribir audio en archi con salida en el Alfabeto Fonético Internacional (IPA). El modelo se enmarca en el trabajo presentado en el artículo "Hard to Be Heard: Phoneme-Level ASR Analysis of Phonologically Complex, Low-Resource Endangered Languages" (Findings of ACL 2026), donde se propone un vocabulario de fonemas específico del idioma y una inicialización heurística de la capa de salida para mejorar el rendimiento en condiciones de datos extremadamente escasos (aproximadamente 50 minutos de audio de entrenamiento). Con 315,5 millones de parámetros, este modelo es representativo de la adaptación de arquitecturas de habla a lenguas de bajos recursos, un área crítica para la documentación lingüística y la preservación cultural.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec2 large (transformer encoder con capa de cuantización) |
| Parametros totales | 315.530.970 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (entrada de audio de duración variable) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Archi (lengua caucásica nororiental) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `wav2vec2-large-xlsr-japlmthufielta-ipa1000-ns`, un wav2vec2 grande preentrenado mediante aprendizaje auto-supervisado sobre datos de habla multilingüe (XLSR). El fine-tuning se realiza sobre el dataset `mahesh27/archi_rutul_asr`, que incluye aproximadamente 50 minutos de audio transcrito en archi. La innovación principal consiste en la definición de un vocabulario de fonemas específico para el archi (salida en IPA) y una inicialización heurística de la capa de salida: los parámetros de los fonemas compartidos con el modelo base se copian directamente, mientras que los fonemas nuevos se inicializan como promedio de los fonemas acústicamente similares. El entrenamiento usa la pérdida CTC (Connectionist Temporal Classification), estándar en ASR. No se aplicaron técnicas de RLHF ni DPO; el ajuste es supervisado únicamente con transcripciones fonéticas.

## Capacidades

- Reconocimiento de voz automático para la lengua archi, con transcripción en fonemas IPA.
- Especializado en un idioma de bajos recursos, con vocabulario fonético adaptado a la fonología compleja del archi (incluyendo consonantes eyectivas, fricativas laterales y oclusivas glotales).
- Salida a nivel de fonema, lo que facilita análisis fonéticos detallados y estudios de variación dialectal.
- No soporta tool calling, agentes ni razonamiento multi-paso; es un modelo puramente de audio a texto.
- Capacidad multilingüe limitada al archi (el modelo base sí es multilingüe, pero el fine-tuning lo restringe a este idioma).

## Casos de uso

- Documentación lingüística: transcripción automática de grabaciones de campo en archi para crear corpus anotados, acelerando el trabajo de lingüistas y antropólogos.
- Preservación de lenguas en peligro: digitalización de archivos de audio históricos y contemporáneos de hablantes nativos, generando transcripciones IPA que pueden ser revisadas y publicadas.
- Investigación fonética: análisis de patrones de pronunciación, frecuencia de fonemas y confusiones sistemáticas mediante las salidas a nivel de fonema, como se demuestra en el paper con matrices de confusión.
- Subtitulado de contenido multimedia en archi: generación de subtítulos fonéticos para vídeos educativos o culturales, facilitando el acceso a materiales en esta lengua.
- Entrenamiento y evaluación de modelos ASR: servir como línea base o componente en estudios comparativos de sistemas de reconocimiento para lenguas de bajos recursos.
- Aplicaciones educativas: apoyo al aprendizaje del archi como segunda lengua, proporcionando retroalimentación fonética a estudiantes mediante la comparación de transcripciones esperadas y reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para el modelo `w2v2l-custom-archi` en la información disponible. El artículo asociado reporta métricas de WER, CER y PER para varios modelos en archi y rutul, incluyendo variantes del wav2vec2 custom y Whisper, pero no se desglosan los valores por cada variante de forma individual en los materiales consultados. Según el resumen del paper, el método propuesto (que incluye este modelo) logra mejoras consistentes y un rendimiento comparable o superior a Whisper en estos escenarios de datos extremadamente limitados. Para obtener cifras exactas, se recomienda consultar el artículo completo en ACL Anthology (enlace en la sección de enlaces).

## Requisitos de hardware

- VRAM estimada para inferencia: dado que el modelo tiene 315,5 millones de parámetros, en FP32 los pesos ocupan aproximadamente 1,26 GB. Con la entrada de audio y el procesamiento del transformer, se recomienda al menos 4 GB de VRAM para inferencia en batch pequeño.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como NVIDIA GTX 1650, RTX 3060, o superiores. Para entrenamiento o fine-tuning adicional, se necesitaría una GPU con 8-12 GB (RTX 3080, A10, etc.).
- Es posible ejecutarlo en CPU, aunque con mayor latencia; para uso en tiempo real se recomienda GPU.
- Opciones de despliegue: se puede cargar con la librería `transformers` de Hugging Face (clase `Wav2Vec2ForCTC`), o mediante `torchaudio`. No se han publicado versiones GGUF ni cuantizaciones, por lo que no es compatible con llama.cpp u Ollama directamente.
- Latencia y throughput: no disponible. Al ser un modelo de tamaño medio, la inferencia en GPU moderna (RTX 3090) debería ser inferior a 1 segundo por archivo de audio de 10 segundos, pero no hay mediciones oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mahesh27/w2v2l-custom-archi | 315,5 M | wav2vec2 large | Fonemas IPA | Apache 2.0 | Hugging Face |
| ctaguchi/wav2vec2-large-xlsr-japlmthufielta-ipa1000-ns | ~315 M | wav2vec2 large | IPA multilingüe | Apache 2.0 | Hugging Face |
| Whisper large-v3 | 1550 M | Transformer encoder-decoder | Texto (multilingüe) | MIT | Hugging Face |

Según el paper, Whisper large-v3 alcanza un WER de 0,402 en archi, mientras que el método wav2vec2 custom (que incluye este modelo) logra mejoras de 8 puntos de WER respecto a la línea base wav2vec2-large-ipa, acercándose al rendimiento de Whisper. Sin embargo, no se dispone de la métrica exacta para `w2v2l-custom-archi` de forma aislada. La ventaja de este modelo frente a Whisper es su menor tamaño (315 M frente a 1550 M) y su salida a nivel de fonema, más adecuada para análisis lingüísticos.

## Limitaciones y advertencias

- Entrenado con solo ~50 minutos de audio, lo que limita su robustez ante variaciones de acento, ruido de fondo, velocidad de habla o voces no representadas en el conjunto de datos.
- Vocabulario restringido a fonemas del archi; no puede transcribir otros idiomas ni producir texto ortográfico estándar (solo IPA).
- Riesgo de alucinaciones en segmentos de audio ambiguos o de baja calidad, aunque al ser una salida fonética, los errores tienden a ser sustituciones de fonemas cercanos acústicamente.
- El modelo base fue preentrenado en múltiples idiomas, pero el fine-tuning puede haber degradado su capacidad para otros; no se recomienda su uso fuera del archi.
- La licencia Apache 2.0 permite uso comercial, pero el dataset de entrenamiento (`mahesh27/archi_rutul_asr`) puede tener restricciones adicionales; se debe verificar su licencia antes de usar el modelo en producción.
- No se proporcionan cuantizaciones ni versiones optimizadas para despliegue en dispositivos edge.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mahesh27/w2v2l-custom-archi
- Paper en ACL Anthology: https://aclanthology.org/2026.findings-acl.147/
- Código fuente en GitHub: https://github.com/mahesh-ak/north_caucasian_asr
- Dataset de entrenamiento: https://huggingface.co/datasets/mahesh27/archi_rutul_asr
- Modelo base: https://huggingface.co/ctaguchi/wav2vec2-large-xlsr-japlmthufielta-ipa1000-ns
