# pyarovrindavan/whisper-small-hi-disfluency

## Resumen

`pyarovrindavan/whisper-small-hi-disfluency` es un modelo de reconocimiento automático del habla (ASR) publicado en Hugging Face por el usuario `pyarovrindavan`. Se trata de un ajuste fino (fine-tuning) del conocido modelo Whisper en su variante `small` de OpenAI, orientado, a juzgar por el sufijo `hi-disfluency` de su identificador, a la transcripción de habla en hindi con tratamiento de disfluencias (repeticiones, titubeos, falsos comienzos y muletillas). El modelo se distribuye en formato `safetensors` con 241.734.912 parámetros, lo que coincide con el tamaño de la arquitectura Whisper small.

La relevancia de este modelo radica en su especialización: los Whisper originales tienden a "limpiar" las disfluencias en la transcripción, lo que resulta problemático para tareas de lingüística de corpus, evaluación de fluidez o entrenamiento de sistemas de diálogo que necesitan representar el habla tal como se produce. Un ajuste fino específico para hindi con disfluencias cubre un nicho poco atendido dentro del ecosistema ASR.

No obstante, la información pública disponible es extremadamente limitada: la model card es la plantilla automática de Hugging Face sin rellenar, no se declara licencia, no se especifican idiomas oficialmente y no hay resultados de evaluación publicados. Cualquier uso en producción debe abordarse con cautela y validación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper small) |
| Parametros totales | 241.734.912 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Whisper small admite ventanas de audio de 30 s) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; admite cuantizacion estandar de transformers/GGUF si se convierte) |
| Idiomas soportados | no disponible oficialmente; el identificador sugiere hindi (`hi`) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura corresponde a Whisper small, un transformer encoder-decoder con atención multi-cabeza estándar, preprocesamiento de audio en espectrogramas Mel y decodificación autorregresiva de tokens de texto. El modelo base Whisper fue entrenado por OpenAI sobre 680.000 horas de audio supervisado multilingüe y multitarea; el paper de referencia es Radford et al., "Robust Speech Recognition via Large-Scale Weak Supervision" (arXiv:1910.09700 aparece en los tags, aunque corresponde a la referencia del calculador de impacto ambiental de Lacoste et al. citada en la plantilla).

No se dispone de información sobre el conjunto de datos de ajuste fino, el número de pasos, la composición del corpus de hindi, ni si se aplicaron técnicas de aumento de datos o etiquetado de disfluencias. La model card no documenta hiperparámetros, régimen de precisión ni infraestructura de cómputo. Tampoco hay evidencia de RLHF, DPO ni innovaciones técnicas más allá del ajuste supervisado convencional.

## Capacidades

- Reconocimiento automático del habla (ASR) sobre audio en hindi, presumiblemente con preservación de disfluencias.
- Transcripción de audio de hasta 30 segundos por ventana (limitación heredada de Whisper small); para audios más largos se requiere segmentación o *chunking*.
- Capacidad multilingüe heredada del modelo base Whisper, aunque el ajuste fino probablemente degrada el rendimiento en idiomas distintos del hindi.
- No se documenta soporte de *tool calling*, agentes ni razonamiento multi-paso (no aplica a un modelo ASR).
- No se documenta *thinking mode*, visión ni audio más allá de la transcripción.
- No hay información sobre marcas de tiempo a nivel de palabra ni diarización de hablantes.

## Casos de uso

- Lingüística de corpus en hindi: transcripción fiel de entrevistas y grabaciones de campo preservando repeticiones y titubeos, útil para estudios de fluidez, pausas y planificación del discurso.
- Evaluación de aprendices de hindi: análisis de disfluencias en producción oral de estudiantes para sistemas de evaluación formativa.
- Entrenamiento de sistemas de diálogo: generación de transcripciones realistas con disfluencias para aumentar datasets de conversación y hacer más robustos los modelos de comprensión.
- Investigación en reconocimiento de habla espontánea: banco de pruebas para comparar el tratamiento de disfluencias frente a Whisper original.
- Subtitulado y transcripción de medios en hindi: siempre que se valide la calidad con muestras propias, dado que no hay métricas publicadas.
- Prototipado académico: fine-tuning adicional sobre dominios específicos (médico, legal) partiendo de este checkpoint como base especializada.
- Análisis de calidad de audio en centros de contacto: detección de titubeos y reformulaciones en llamadas en hindi para métricas de experiencia de cliente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 0,5 GB de pesos más activaciones y caché de atención; en la práctica, menos de 2 GB para audio de 30 s.
- VRAM estimada en fp32: en torno a 1 GB solo de pesos; el repo ocupa 1,0 GB.
- GPU recomendadas: cualquier GPU consumer moderna sirve; RTX 3060, RTX 4060, RTX 4090, A100 o H100 funcionan sobradamente. Incluso CPU es viable para uso no interactivo.
- Cabe holgadamente en GPU consumer (incluso en GPUs integradas con suficiente memoria compartida para inferencia por lotes pequeños).
- Opciones de despliegue: `transformers` (pipeline `automatic-speech-recognition`), `faster-whisper` si se convierte a CTranslate2, `whisper.cpp`/`llama.cpp` si se convierte a GGUF, y servidores compatibles con la API de Hugging Face (`endpoints_compatible` está en los tags).
- Latencia y throughput: no disponibles; dependerán del hardware y del backend elegido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto audio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `pyarovrindavan/whisper-small-hi-disfluency` | 241,7 M | 30 s por ventana | no declarados (probable hindi) | no disponible | Hugging Face, 0 descargas |
| `openai/whisper-small` | 244 M | 30 s por ventana | multilingüe (99 idiomas) | MIT (según OpenAI) | Hugging Face, ampliamente usado |
| `openai/whisper-small.en` | 244 M | 30 s por ventana | inglés | MIT (según OpenAI) | Hugging Face |

La comparación directa con alternativas especializadas en hindi (por ejemplo, variantes de IndicWhisper o modelos de AI4Bharat) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- La model card es la plantilla automática sin rellenar: no hay información sobre datos, evaluación, sesgos ni uso previsto.
- Licencia no declarada: no se puede asumir uso comercial sin contactar con el autor o verificar la licencia del modelo base (Whisper de OpenAI es MIT, pero el ajuste fino no declara términos propios).
- Sin métricas publicadas: el rendimiento real en hindi y en preservación de disfluencias es desconocido; requiere evaluación propia con un conjunto de validación representativo.
- Riesgo de alucinación típico de Whisper: en segmentos con silencio, ruido o audio de baja calidad puede generar texto inventado o repetir frases.
- El ajuste fino sobre hindi puede degradar el rendimiento en otros idiomas del modelo base.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha: no hay evidencia de uso comunitario ni validación externa.
- Limitación de ventana de 30 s: audios largos requieren segmentación manual o pipelines externos, con riesgo de cortes en fronteras de frase.
- No se documenta el tratamiento de hablantes con acentos regionales del hindi ni de code-switching hindi-inglés, habitual en habla real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pyarovrindavan/whisper-small-hi-disfluency
- Paper de Whisper (Radford et al., 2022): https://arxiv.org/abs/2212.04356
- Referencia citada en los tags (Lacoste et al., 2019, calculador de impacto ambiental): https://arxiv.org/abs/1910.09700
- Repositorio de Whisper de OpenAI: https://github.com/openai/whisper
- Documentación de Whisper en transformers: https://huggingface.co/docs/transformers/model_doc/whisper
