# phonsobon/Whisper-Small-Khmer-continued

## Resumen

Whisper-Small-Khmer-continued es un modelo de reconocimiento automático del habla (ASR) especializado en idioma jemer (khmer), desarrollado por PhonSobon a partir de un fine-tuning continuado del modelo Vira21/Whisper-Small-Khmer, que a su vez deriva de openai/whisper-small. El modelo está diseñado para transcribir audio en jemer, un idioma con recursos lingüísticos limitados en el ecosistema de IA, y representa un esfuerzo por mejorar la precisión de transcripción en este idioma mediante entrenamiento adicional sobre el checkpoint existente.

Con 241,7 millones de parámetros, el modelo mantiene la arquitectura original de Whisper Small (encoder-decoder transformer) y hereda la ventana de contexto de 30 segundos de audio típica de la familia Whisper. Su relevancia radica en que aborda un nicho lingüístico poco cubierto por los modelos ASR multilingües estándar, ofreciendo una opción especializada para desarrolladores que trabajan con contenido en jemer. El acceso al modelo está restringido (gated), por lo que los usuarios deben aceptar condiciones en HuggingFace antes de descargarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper Small (encoder-decoder transformer) |
| Parametros totales | 241.734.912 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 30 segundos de audio (ventana fija de Whisper) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | jemer (khmer) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Modelo base | Vira21/Whisper-Small-Khmer (fine-tune de openai/whisper-small) |
| Acceso | restringido (gated) en HuggingFace |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Whisper Small de OpenAI, un transformer encoder-decoder con normalización previa, diseñado específicamente para ASR. El encoder procesa mel-spectrogramas de 80 canales extraídos de ventanas de audio de 30 segundos, mientras que el decoder genera los tokens de transcripción de forma autorregresiva. Whisper Small tiene 12 capas en el encoder y 12 en el decoder, con 512 dimensiones de modelo y 8 cabezas de atención.

El entrenamiento de este checkpoint consistió en un fine-tuning continuado sobre el modelo Vira21/Whisper-Small-Khmer, que ya había sido ajustado para jemer. El autor no ha publicado detalles sobre el dataset utilizado, el número de pasos de entrenamiento, ni si se emplearon técnicas como aumento de datos o regularización. El repositorio incluye logs de TensorBoard, lo que sugiere un seguimiento del entrenamiento, pero no se han hecho públicos los resultados de validación. No hay información sobre el uso de RLHF, DPO u otras técnicas de alineación posteriores al fine-tuning supervisado.

## Capacidades

- Transcripción de voz a texto en idioma jemer (khmer) con la arquitectura Whisper Small.
- Manejo de audio de hasta 30 segundos por pasada, con posibilidad de procesar clips más largos mediante segmentación.
- Inferencia directa desde mel-spectrogramas, sin necesidad de modelos de fonética externos.
- Compatible con el pipeline `automatic-speech-recognition` de HuggingFace Transformers.
- Soporte de decodificación con beam search y generación condicional estándar de Whisper.
- No se han documentado capacidades de traducción, diarización de hablantes ni identificación de idioma específicas más allá de las heredadas de Whisper.

## Casos de uso

- Transcripción de entrevistas y contenido oral en jemer: el modelo puede convertir grabaciones de entrevistas, podcasts o testimonios en texto, facilitando su archivo y análisis. Su ventana de 30 segundos permite procesar segmentos de audio de forma incremental.
- Subtitulado automático de vídeos en jemer: integrable en pipelines de postproducción para generar subtítulos en este idioma, reduciendo el trabajo manual de transcripción.
- Asistentes de voz para aplicaciones en jemer: el modelo puede servir como backend de reconocimiento de voz en aplicaciones móviles o web dirigidas a hablantes de jemer, aunque requiere una capa adicional de gestión de audio en tiempo real.
- Análisis de llamadas de atención al cliente: transcripción de llamadas grabadas en jemer para su posterior análisis de sentimiento o extracción de información, siempre que se cumplan las normativas de privacidad.
- Accesibilidad para personas con discapacidad auditiva: generación de transcripciones en tiempo real o diferido de contenido hablado en jemer, mejorando el acceso a la información.
- Investigación lingüística: el modelo puede utilizarse para crear corpus transcritos de jemer hablado, útiles para estudios fonéticos, sociolingüísticos o de procesamiento del lenguaje natural.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El campo `model-index` de la model card contiene una entrada vacía, sin métricas declaradas por el autor. No hay datos de WER (Word Error Rate), CER (Character Error Rate) ni comparaciones con otros modelos ASR en jemer.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 241 millones de parámetros, la inferencia en FP32 requiere aproximadamente 1 GB de VRAM solo para los pesos. Con cuantización a FP16 o int8, el requisito baja a unos 0,5-0,7 GB. En CPU, el modelo puede ejecutarse con unos 2-3 GB de RAM.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar el modelo cómodamente. Tarjetas como NVIDIA GTX 1650, RTX 3060 o superiores son suficientes. Para procesamiento por lotes o despliegue en producción, se recomienda una GPU con 8 GB o más (RTX 3070, A10, A100).
- Sí cabe en GPUs de consumo: el modelo es ligero y puede ejecutarse en tarjetas de gama baja, incluso en CPU con razonable velocidad para audio corto.
- Opciones de despliegue: compatible con HuggingFace Transformers, puede servirse con vLLM (aunque Whisper no es el caso de uso principal de vLLM), TGI (Text Generation Inference no soporta ASR nativamente), o mediante pipelines de Transformers. Para despliegue en producción, se recomienda usar el pipeline `automatic-speech-recognition` con batch size ajustado.
- Latencia y throughput estimados: no disponibles. Dependen del hardware y de la longitud del audio. En una GPU moderna, la transcripción de un clip de 30 segundos suele completarse en menos de 1 segundo, pero no hay datos oficiales del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Acceso |
|---|---|---|---|---|---|
| phonsobon/Whisper-Small-Khmer-continued | 241,7 M | 30 s audio | jemer | MIT | gated |
| Vira21/Whisper-Small-Khmer | 241,7 M | 30 s audio | jemer | no disponible | no disponible |
| openai/whisper-small | 244 M | 30 s audio | 96 idiomas | MIT | abierto |

El modelo se sitúa en la misma categoría que su modelo base y que el Whisper Small original. La diferencia principal es el fine-tuning específico para jemer, que debería mejorar la precisión en este idioma frente al Whisper multilingüe, aunque no hay benchmarks que lo confirmen. No se dispone de información sobre otros modelos ASR especializados en jemer para una comparativa más amplia.

## Limitaciones y advertencias

- No hay datos de rendimiento publicados: el autor no ha compartido métricas de WER o CER, por lo que no es posible evaluar objetivamente la calidad del modelo frente a alternativas.
- Acceso restringido: el modelo requiere aceptar condiciones en HuggingFace, lo que puede limitar su uso en entornos automatizados o de evaluación rápida.
- Idioma limitado: el modelo está especializado en jemer y no debe utilizarse para otros idiomas, ya que su rendimiento fuera de este idioma será muy pobre.
- Ventana de audio fija: la limitación de 30 segundos por pasada obliga a segmentar audios largos, lo que puede introducir errores en los límites de los segmentos.
- Sesgos y alucinaciones: al ser un fine-tune de Whisper, puede heredar sesgos del modelo original y producir alucinaciones en audio de baja calidad o con ruido de fondo, especialmente en segmentos de silencio.
- Sin información sobre el dataset de entrenamiento: no se conoce la composición ni el tamaño del corpus utilizado, lo que dificulta evaluar la cobertura de acentos, dialectos o dominios.
- Licencia MIT: aunque permisiva, el acceso gated implica que el autor puede imponer restricciones adicionales de uso no reflejadas en la licencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/phonsobon/Whisper-Small-Khmer-continued
- Perfil de GitHub del autor: https://github.com/PhonSobon/
- Proyecto relacionado mini-ocr (reconocimiento de texto jemer e inglés): https://huggingface.co/phonsobon/mini-ocr
- Colección de datasets de texto a voz en jemer: https://huggingface.co/collections/phonsobon/khmer-text-to-speech-datasets
- Repositorio khmer_Captioning: https://github.com/PhonSobon/khmer_Captioning/tree/main/models
