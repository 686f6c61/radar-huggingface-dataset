# akshat-007/whisper-small-hi-disfluency

## Resumen

`akshat-007/whisper-small-hi-disfluency` es un ajuste fino del modelo Whisper Small de OpenAI, publicado en Hugging Face por el usuario `akshat-007`. El nombre del repositorio sugiere que se ha especializado en el reconocimiento automático de voz (ASR) en hindi (`hi`) con tratamiento de disfluencias, es decir, pausas, repeticiones, titubeos y reformulaciones propias del habla espontánea. El modelo se distribuye en formato `safetensors` con 241.734.912 parámetros y un tamaño de repositorio de 1,0 GB.

La arquitectura subyacente es la de Whisper Small, un transformer encoder-decoder entrenado originalmente por OpenAI para transcripción multilingüe y traducción de voz. El ajuste fino sobre datos con disfluencias resulta relevante porque los sistemas ASR convencionales tienden a normalizar o eliminar estos fenómenos, mientras que determinadas aplicaciones (análisis de fluidez, logopedia, investigación lingüística, evaluación de habla) requieren preservarlos o etiquetarlos explícitamente.

La información pública disponible es muy limitada: la model card está generada automáticamente y no incluye detalles sobre datos de entrenamiento, hiperparámetros, licencia ni evaluación. No se han registrado descargas ni interacciones en el Hub en el momento de la consulta, y el repositorio no declara idiomas soportados ni licencia, lo que limita su uso en producción sin verificación adicional por parte del integrador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper Small) |
| Parametros totales | 241.734.912 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper Small procesa ventanas de audio de 30 s) |
| Tipos de cuantizacion | no disponible en el repositorio; compatible con cuantizacion estandar de transformers (fp16, int8) |
| Idiomas soportados | no disponible declarado; el sufijo del nombre sugiere hindi |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Whisper Small, un transformer encoder-decoder con atención completa entrenado por OpenAI para ASR multilingüe y traducción de voz. El encoder procesa espectrogramas Mel de ventanas de 30 segundos y el decoder genera tokens de texto de forma autorregresiva, con tokens especiales de control de idioma y tarea. Whisper Small cuenta con 12 capas en encoder y decoder, dimensión oculta de 768 y 12 cabezas de atención, lo que da lugar a los aproximadamente 242 millones de parámetros reportados.

No se dispone de información sobre el proceso de ajuste fino: ni el conjunto de datos utilizado, ni el número de pasos, ni la composición del corpus con disfluencias, ni si se emplearon técnicas como LoRA, ajuste completo o congelación parcial de capas. La model card no documenta hiperparámetros, precisión mixta ni procedimiento de evaluación. Tampoco se indica si el ajuste se realizó sobre el checkpoint original en inglés o sobre la variante multilingüe de Whisper Small. Toda esta información figura como no disponible.

## Capacidades

- Reconocimiento automático de voz (ASR) sobre audio en formato compatible con el procesador de Whisper.
- Tratamiento potencial de disfluencias del habla (pausas, repeticiones, titubeos), según indica el nombre del repositorio; no verificado en la model card.
- Transcripción de audio en hindi, presumiblemente, aunque no se declara oficialmente.
- Compatibilidad con la API `pipeline("automatic-speech-recognition")` de transformers y con endpoints compatibles.
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso ni capacidades multimodales más allá del audio de entrada.
- No se documenta modo "thinking" ni capacidades de visión o audio generativo.

## Casos de uso

- Transcripción de entrevistas y conversaciones espontáneas en hindi: el ajuste sobre disfluencias permitiría conservar pausas y repeticiones en la salida, útil para investigación lingüística y análisis del discurso oral.
- Evaluación de fluidez en logopedia: terapeutas del lenguaje podrían emplear el modelo para cuantificar titubeos y repeticiones en muestras de habla de pacientes, siempre que se valide su comportamiento en dominios clínicos.
- Anotación de corpus orales: investigadores que construyen datasets de habla espontánea pueden usar el modelo como preanotador para reducir el esfuerzo manual, revisando posteriormente las etiquetas de disfluencia.
- Análisis de calidad de llamadas en centros de atención: transcripción de conversaciones telefónicas en hindi preservando marcadores de duda, útil para métricas de claridad y formación de agentes.
- Sistemas de subtitulado con preservación de oralidad: plataformas que desean subtítulos que reflejen el habla real (repeticiones incluidas) en lugar de una versión normalizada.
- Prototipado de ASR en aplicaciones de voz para el mercado hindi: dado su tamaño reducido (242 M parámetros), puede desplegarse en entornos con recursos limitados para pruebas de concepto, aunque la falta de licencia y evaluación exige cautela.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 0,5 GB para los pesos, más memoria para activaciones y buffers de audio; en la práctica, menos de 2 GB para lotes pequeños.
- VRAM estimada en int8: en torno a 0,25 GB para pesos, con overhead adicional.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; también cabe en GPUs de gama baja y en CPU.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPUs con al menos 4 GB de VRAM, e incluso en CPU con latencia aceptable para audio corto.
- Opciones de despliegue: transformers (nativo), vLLM no aplica para ASR, llama.cpp no soporta Whisper de forma estándar, Ollama no es la vía habitual; alternativas habituales son `faster-whisper` (requiere conversión a CTranslate2), `whisper.cpp` (requiere conversión a GGML) y Text Generation Inference para endpoints compatibles.
- Latencia y throughput: no disponibles; para Whisper Small en GPU moderna se suele obtener transcripción en tiempo real o más rápido, pero no se ha verificado para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto audio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| akshat-007/whisper-small-hi-disfluency | 241,7 M | ventanas de 30 s (Whisper) | no declarado (probable hindi) | no disponible | Hugging Face, 0 descargas |
| openai/whisper-small | 241,7 M | ventanas de 30 s | multilingüe | MIT (checkpoint original) | Hugging Face, ampliamente usado |
| openai/whisper-small.en | 241,7 M | ventanas de 30 s | inglés | MIT | Hugging Face |
| vasista22/whisper-hindi-small | ~241 M | ventanas de 30 s | hindi | no verificada en esta ficha | Hugging Face |

La comparación se limita a la arquitectura base, ya que no hay datos de evaluación del modelo objeto de esta ficha. La principal diferencia frente a `openai/whisper-small` es el ajuste específico a hindi con disfluencias, a costa de una licencia no declarada y una ausencia total de documentación y validación pública.

## Limitaciones y advertencias

- La model card está generada automáticamente y no aporta información sobre sesgos, datos, evaluación ni uso previsto.
- No se declara licencia, por lo que el uso comercial queda en un limbo legal hasta que el autor lo aclare.
- No hay resultados de benchmarks ni métricas de WER/CER publicadas; no es posible afirmar que supere al Whisper Small original en hindi.
- El ajuste a disfluencias puede degradar el rendimiento en habla leída o limpia si el corpus de ajuste estaba dominado por habla espontánea.
- El idioma real de funcionamiento no está declarado oficialmente; el sufijo `hi` es una inferencia del nombre del repositorio.
- Riesgo de alucinación típico de Whisper en segmentos silenciosos o con ruido, no evaluado en este checkpoint.
- Cero descargas y cero interacciones en el Hub en el momento de la consulta: no hay evidencia de uso ni validación por la comunidad.
- El tamaño del repositorio (1,0 GB) es superior al de un checkpoint Whisper Small típico en fp16, lo que sugiere posible inclusión de pesos en fp32 u otros artefactos; conviene inspeccionar el contenido antes de desplegarlo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/akshat-007/whisper-small-hi-disfluency
- Paper de Whisper (Radford et al., 2022): https://arxiv.org/abs/2212.04356
- Paper citado en los tags del modelo (Lacoste et al., 2019, sobre impacto ambiental): https://arxiv.org/abs/1910.09700
- Repositorio oficial de Whisper en OpenAI: https://github.com/openai/whisper
- Modelo base en Hugging Face: https://huggingface.co/openai/whisper-small
- Documentación de Whisper en transformers: https://huggingface.co/docs/transformers/model_doc/whisper
