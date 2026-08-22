# herurg/whisper-tiny-minds14-en-us-audio-course

## Resumen

El modelo `herurg/whisper-tiny-minds14-en-us-audio-course` es un fine-tuning del modelo `openai/whisper-tiny` sobre el subconjunto en inglés de Estados Unidos (`en-US`) del dataset `PolyAI/minds14`. Ha sido desarrollado por el usuario `herurg` como parte de la tarea de la Unidad 5 del Hugging Face Audio Course, con el objetivo de entrenar un sistema de reconocimiento automático del habla (ASR) en un dominio específico de intenciones de voz. El modelo tiene 37.760.640 parámetros y está publicado en formato `safetensors`. Aunque es un ejercicio académico, demuestra el flujo completo de fine-tuning de Whisper en un dataset reducido y cumple el criterio de evaluación del curso (WER normalizado < 0.37). Su relevancia radica en ser un ejemplo práctico de adaptación de un modelo preentrenado a una tarea ASR con pocos datos, y en servir como referencia para desarrolladores que quieran replicar el proceso.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 37.760.640 |
| Parametros activos | No aplicable (modelo denso) |
| Longitud de contexto | No disponible (el modelo base Whisper usa ventanas de 30 s de audio) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (`en`) |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo está basado en `openai/whisper-tiny`, un transformer encoder-decoder originalmente entrenado con 680 000 horas de habla etiquetada para ASR y traducción del habla. En este fine-tuning se utiliza únicamente el subconjunto `en-US` de `PolyAI/minds14`, un dataset de intenciones habladas en contextos de banca, viajes, etc. El entrenamiento se realizó con las primeras 450 muestras para el ajuste y el resto para la evaluación, con un preprocesado en `num_proc=1`. No se detalla el uso de técnicas como RLHF o DPO; el proceso es un fine-tuning supervisado estándar de ASR. La innovación técnica no es específica de este modelo, sino heredada de Whisper: atención multi-cabeza, codificación posicional sinusoidal y tokenización con byte-pair encoding (BPE) aplicada a texto y audio.

## Capacidades

- Reconocimiento automático del habla (ASR) para inglés en acento estadounidense.
- Transcripción de audio a texto en el dominio de intenciones del dataset MIND-14 (consultas de negocios, viajes, etc.).
- Generación de texto a partir de audio con una ventana de hasta 30 segundos.
- No soporta tool calling ni agentes, ya que es un modelo puramente de transcripción.
- No es multilingüe: solo inglés.
- No incluye capacidades de vision ni de audio fuera de ASR.

## Casos de uso

- **Prototipos de ASR en dominios específicos**: el modelo puede transcribir consultas de voz en un dominio cerrado (p. ej., atención al cliente) gracias a su entrenamiento sobre intenciones de negocio.
- **Evaluación de pipelines de fine-tuning**: sirve como ejemplo de cómo adaptar Whisper a un dataset propio con pocos datos, útil para equipos que quieren replicar el flujo del Audio Course.
- **Transcripción de audios cortos**: con su ventana de 30 segundos y su tamaño reducido, puede integrarse en aplicaciones móviles o de borde para transcribir consultas breves.
- **Análisis de calidad de audio**: el WER de 0.3229 sobre el split de train indica una tasa de error alta, útil para estudiar los límites del modelo en datos con acentos o ruido.
- **Comparación de modelos base**: sirve como baseline para comparar con otros fine-tunes de Whisper-tiny sobre el mismo dataset, como los de `VoicesColeby` o `Terps`.
- **Educación**: es un recurso didáctico para aprender a usar la biblioteca `transformers` y el dataset `MIND-14` en tareas ASR.

## Benchmarks y rendimiento

El autor declara los siguientes resultados en el `model-index` de la model card, evaluados sobre el split `train` de `MINDS-14 en-US`:

| Métrica | Valor |
|---|---|
| WER | 0.322904 |
| WER ortográfico | 0.326342 |
| Pérdida (loss) | 0.625578 |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: al ser un modelo de 37.7 M de parámetros, la inferencia puede ejecutarse en CPU con memoria RAM suficiente (menos de 1 GB para los pesos en FP32). Para GPU, cualquier tarjeta con al menos 2 GB de VRAM es suficiente.
- **GPU recomendadas**: cualquier GPU moderna, incluidas las integradas (p. ej., NVIDIA GTX 1650) o consumer como RTX 3060.
- **Cabe en consumer GPU**: sí, incluso en tarjetas de gama baja.
- **Opciones de despliegue**: se puede usar con `transformers` (Pipeline de ASR), con `vLLM` (aunque no es óptimo para modelos tan pequeños), con `llama.cpp` (no compatible directamente con Whisper) o con la API de Hugging Face Inference Endpoints. La opción más común es `transformers` con `pipeline("automatic-speech-recognition")`.
- **Latencia y throughput**: no disponibles, pero para un modelo de este tamaño, la latencia en GPU es del orden de milisegundos por audio de pocos segundos; en CPU, puede ser de cientos de milisegundos.

## Comparativa con modelos similares

No se dispone de datos comparativos directos con otros fine-tunes de Whisper-tiny sobre MIND-14 en la información proporcionada. Se identifican en los resultados de búsqueda otros repositorios similares (`VoicesColeby/whisper-tiny-minds14-en-us`, `Terps/whisper-tiny-minds14-enUS`), pero no se conocen sus métricas. Por tanto, la comparativa queda pendiente de datos adicionales.

## Limitaciones y advertencias

- **Sesgos conocidos**: al entrenarse solo con el subconjunto `en-US` de MIND-14, el modelo puede no generalizar a otros acentos del inglés ni a dominios distintos del de las intenciones del dataset.
- **Riesgo de alucinación**: como modelo ASR, puede generar transcripciones inventadas en segmentos de audio no claros, especialmente con ruido.
- **Limitaciones de contexto**: la ventana de audio está limitada a 30 segundos; audios más largos requieren segmentación previa.
- **Limitaciones de idioma**: solo soporta inglés, no español ni otros idiomas.
- **Restricciones de licencia**: la licencia no está disponible en la información proporcionada; se recomienda verificar antes de uso comercial.
- **Caveat de producción**: el WER de 0.3229 sobre el split de train indica una tasa de error alta, no apta para producción sin un fine-tuning adicional con más datos.

## Enlaces

- Hugging Face: https://huggingface.co/herurg/whisper-tiny-minds14-en-us-audio-course
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Dataset MIND-14: https://huggingface.co/datasets/PolyAI/minds14
- Repositorio de referencia de fine-tuning: https://github.com/Debebe-Nigatu/whisper-finetune-colab
- Análisis de Whisper-tiny y MIND-14: https://github.com/zanuura/whisper-asr-minds14-english
