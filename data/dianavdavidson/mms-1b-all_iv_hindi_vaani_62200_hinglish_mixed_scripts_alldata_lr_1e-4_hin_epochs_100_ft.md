# dianavdavidson/mms-1b-all_iv_hindi_vaani_62200_hinglish_mixed_scripts_alldata_lr_1e-4_hin_epochs_100_FT

## Resumen

El modelo `dianavdavidson/mms-1b-all_iv_hindi_vaani_62200_hinglish_mixed_scripts_alldata_lr_1e-4_hin_epochs_100_FT` es un sistema de reconocimiento automático de voz (ASR) basado en la arquitectura wav2vec2, desarrollado mediante fine-tuning del modelo MMS-1B (Massively Multilingual Speech) de Meta AI. Está especializado en la transcripción de audio en hindi y en hinglish, es decir, la mezcla de hindi e inglés con escritura mixta (devanagari y latina). El nombre del repositorio indica que se entrenó sobre el dataset Hindi Vaani (con 62 200 muestras) durante 100 épocas con una tasa de aprendizaje de 1e-4.

El modelo resuelve el problema de la transcripción robusta de voz en un contexto multilingüe y de code-switching, un reto frecuente en la India donde los hablantes alternan entre hindi e inglés en la misma frase. Su relevancia radica en que parte de un modelo multilingüe de 1B parámetros (MMS) y lo adapta a un dominio específico, mejorando potencialmente la precisión en acentos y variantes regionales del hindi. El repositorio contiene 166 GB de datos, lo que sugiere que incluye checkpoints de entrenamiento además de los pesos finales en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec2 (variante MMS-1B) |
| Parametros totales | 964 793 329 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa audio, no texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | hindi, hinglish (mezcla hindi-ingles) |
| Licencia | no disponible (modelos similares del autor usan cc-by-nc-4.0) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura wav2vec2, un transformer encoder preentrenado de forma autosupervisada sobre audio sin etiquetar. En el caso de MMS-1B, el preentrenamiento se realizó sobre más de 1 400 idiomas, y este fine-tuning adapta el modelo al hindi y al hinglish. El entrenamiento se realizó con el dataset Hindi Vaani (62 200 muestras) con una tasa de aprendizaje de 1e-4 durante 100 épocas. No se dispone de detalles sobre el uso de técnicas como RLHF o DPO, ya que se trata de un modelo de ASR, no de un LLM. La innovación principal es la adaptación a escritura mixta (devanagari y latina), lo que permite transcribir correctamente frases que alternan entre ambos alfabetos.

## Capacidades

- Transcripción de voz en hindi y hinglish con escritura mixta.
- Reconocimiento de voz automático (ASR) a partir de audio.
- Manejo de acentos y variantes regionales del hindi gracias al fine-tuning sobre el dataset Hindi Vaani.
- Posible extensión a otros idiomas indios, aunque el entrenamiento se centra en hindi.
- No se ha documentado soporte para tool calling, agentes o razonamiento multi-paso, ya que es un modelo de audio, no de texto.

## Casos de uso

- Transcripción de reuniones y conferencias en hindi: el modelo puede convertir audio de reuniones en texto, facilitando la generación de actas y búsquedas posteriores. Su especialización en hinglish es útil en entornos corporativos indios donde se mezclan ambos idiomas.
- Subtitulado automático de vídeos en hindi: integrable en pipelines de procesamiento de vídeo para generar subtítulos en tiempo real o diferido, mejorando la accesibilidad de contenidos en plataformas como YouTube.
- Asistentes de voz para aplicaciones móviles: permite la entrada por voz en hindi e hinglish en apps de banca, comercio electrónico o servicios gubernamentales, donde el code-switching es habitual.
- Archivado y búsqueda de contenido audiovisual: transcripción de archivos de audio históricos o noticiarios en hindi para indexarlos y hacerlos consultables mediante texto.
- Herramientas de accesibilidad para personas con discapacidad visual: conversión de contenido hablado en hindi a texto legible por lectores de pantalla.
- Investigación lingüística sobre code-switching: el modelo puede servir para analizar patrones de alternancia entre hindi e inglés en corpus orales, gracias a su entrenamiento en escritura mixta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de métricas como WER (Word Error Rate) o CER (Character Error Rate) para comparar con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: con 964 millones de parámetros, en precisión fp32 se necesitan aproximadamente 3,9 GB solo para los pesos. En la práctica, con activaciones y overhead, se recomienda al menos 8 GB de VRAM.
- GPU recomendadas: una NVIDIA RTX 3060 (12 GB) o superior puede ejecutar el modelo en fp16. Para mayor velocidad, una RTX 4090 o A100 es adecuada.
- En consumer GPU: sí, cabe en GPUs de gama media-alta con 8-12 GB de VRAM, siempre que se use fp16 o cuantización (aunque no se han documentado cuantizaciones específicas).
- Opciones de despliegue: se puede usar con Hugging Face Transformers (pipeline de audio), o mediante servidores de inferencia como vLLM (aunque vLLM está orientado a LLMs, para ASR se suele usar el pipeline estándar). También es posible exportar a ONNX para optimización.
- Latencia y throughput: no disponible. Depende del hardware y de la longitud del audio de entrada.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MMS-1B (original) | 1B | >1400 | audio | CC-BY-NC 4.0 | Hugging Face |
| Whisper large-v3 | 1.5B | 99 | audio | MIT | Hugging Face |
| Este modelo | 0.96B | hindi/hinglish | audio | no disponible (probablemente CC-BY-NC) | Hugging Face |

El modelo se diferencia de Whisper en que está específicamente afinado para hinglish con escritura mixta, mientras que Whisper es multilingüe pero no está optimizado para ese code-switching concreto. Frente al MMS original, este fine-tuning puede ofrecer mejor precisión en hindi, aunque no se dispone de datos comparativos.

## Limitaciones y advertencias

- Licencia no especificada en el repositorio; modelos similares del mismo autor usan CC-BY-NC 4.0, lo que restringe el uso comercial. Verificar antes de usar en producción.
- No se han publicado métricas de rendimiento, por lo que la calidad real es desconocida.
- El entrenamiento se centra en hindi e hinglish; puede degradarse en otros idiomas o variantes no representadas en el dataset.
- El dataset Hindi Vaani puede contener sesgos geográficos o demográficos, afectando a acentos o dialectos menos comunes.
- Riesgo de alucinaciones en transcripciones (errores de decodificación) en audio con ruido o solapamiento de voces.
- El tamaño del repositorio (166 GB) sugiere que incluye checkpoints de entrenamiento; para inferencia solo se necesita el archivo de pesos final, pero no se indica cuál es.
- No se documentan cuantizaciones, por lo que el despliegue en dispositivos con poca memoria puede requerir conversión manual.

## Enlaces

- [Hugging Face - modelo](https://huggingface.co/dianavdavidson/mms-1b-all_iv_hindi_vaani_62200_hinglish_mixed_scripts_alldata_lr_1e-4_hin_epochs_100_FT)
- [Modelo similar del mismo autor (wav2vec2-large-xlsr-hindi)](https://huggingface.co/dianavdavidson/wav2vec2-large-xlsr-hindi-iv_hindi_vaani-62094-hinglish_mixed_scripts-1e-4-epochs-100-FT)
- [Modelo similar del mismo autor (mms-1b-all-indic_voices)](https://huggingface.co/dianavdavidson/mms-1b-all-indic_voices-60199-hinglish_mixed_scripts-30_70-1e-4-hin-steps-10000-FT)
- [Documentación de MMS en fairseq](https://github.com/facebookresearch/fairseq/blob/main/examples/mms/README.md)
