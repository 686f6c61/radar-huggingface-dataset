# Jinstudio/whisper-tiny.en

## Resumen

Jinstudio/whisper-tiny.en es un checkpoint de la familia Whisper de OpenAI, publicado por el usuario Jinstudio. Se trata de la variante exclusivamente en inglés del modelo tiny, un sistema de reconocimiento automático de voz (ASR) basado en una arquitectura Transformer encoder-decoder de tipo secuencia a secuencia. Con aproximadamente 37,76 millones de parámetros, es uno de los modelos Whisper más ligeros disponibles, lo que lo hace adecuado para aplicaciones con recursos computacionales limitados.

El modelo fue entrenado sobre 680 000 horas de datos de voz etiquetados mediante supervisión débil a gran escala, lo que le permite generalizar a distintos dominios y conjuntos de datos sin necesidad de ajuste fino. Al ser una variante English-only, está diseñado únicamente para la tarea de reconocimiento de voz en inglés, a diferencia de los checkpoints multilingües que también realizan traducción de voz. Publicado con licencia Apache 2.0, este checkpoint es relevante para desarrolladores que necesitan un modelo de transcripción ligero, rápido y fácilmente desplegable en entornos de producción o en dispositivos de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (sequence-to-sequence) |
| Parametros totales | 37.760.256 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (también PyTorch, TensorFlow y JAX según los tags) |

## Arquitectura y entrenamiento

Jinstudio/whisper-tiny.en sigue la arquitectura Whisper, un modelo Transformer encoder-decoder también denominado secuencia a secuencia. El encoder procesa el audio convertido en espectrogramas log-Mel y el decoder genera el texto transcrito token a token. Según la información disponible, el modelo fue entrenado sobre 680 000 horas de datos de voz etiquetados mediante supervisión a gran escala. Al ser una variante exclusivamente en inglés, está entrenado únicamente para la tarea de reconocimiento de voz en inglés, a diferencia de los checkpoints multilingües que también realizan traducción de voz. No se mencionan técnicas de RLHF ni DPO en la información proporcionada.

## Capacidades

- Transcripción de audio en inglés: el modelo predice la transcripción en el mismo idioma que el audio.
- Generalización a diferentes dominios y conjuntos de datos sin necesidad de fine-tuning, gracias al entrenamiento con 680 000 horas de datos.
- Generación de transcripciones con puntuación y tokens especiales como `<|startoftranscript|>` y `<|notimestamps|>`.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni agentes.
- No es multilingüe: solo soporta inglés.
- No tiene capacidades de visión ni de audio más allá del reconocimiento de voz.

## Casos de uso

- Transcripción de reuniones en inglés: el modelo puede transcribir conversaciones en inglés en tiempo real o en diferido, lo que facilita la generación automática de actas. Su tamaño reducido permite ejecutarlo en CPU sin necesidad de GPU.
- Subtitulado automático de vídeos: al ser un modelo ligero, puede integrarse en pipelines de procesamiento de vídeo para generar subtítulos en inglés, tanto en directo como en postproducción.
- Accesibilidad para personas con discapacidad auditiva: la transcripción instantánea de audio en inglés puede alimentar sistemas de subtitulado en tiempo real para emisiones, eventos o contenido educativo.
- Análisis de llamadas de atención al cliente: el modelo transcribe llamadas en inglés, lo que permite extraer información, analizar el sentimiento o generar resúmenes mediante procesamiento posterior con otros sistemas.
- Asistente de dictado por voz: su baja complejidad computacional lo hace apto para aplicaciones de dictado en entornos con recursos limitados, como móviles o dispositivos embebidos.
- Indexación y búsqueda en audio: transcribir podcasts o archivos de audio en inglés para crear índices de texto y permitir búsquedas por contenido.
- Investigación en ASR: sirve como modelo base para experimentos de fine-tuning en inglés, gracias a su licencia permisiva Apache 2.0.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card, no verificados de forma independiente:

| Dataset | Metrica | Resultado |
|---|---|---|
| LibriSpeech (clean) | Test WER | 8.4372112320138 |
| LibriSpeech (other) | Test WER | 14.857607503498356 |

No se han publicado resultados de benchmarks adicionales en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible.
- GPU recomendadas: no disponible.
- Cabe en consumer GPU: no disponible.
- Opciones de despliegue: Transformers (según la model card); no se especifican otras herramientas en la información disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | WER LibriSpeech clean |
|---|---|---|---|---|
| Jinstudio/whisper-tiny.en | 37,76 M | no disponible | Apache 2.0 | 8.437 |
| openai/whisper-tiny.en | 39 M | no disponible | Apache 2.0 | no disponible |
| openai/whisper-base.en | 74 M | no disponible | Apache 2.0 | no disponible |
| openai/whisper-small.en | 244 M | no disponible | Apache 2.0 | no disponible |

Los datos de parámetros de los modelos de OpenAI se han tomado de la tabla incluida en la model card de Whisper. Jinstudio/whisper-tiny.en es un checkpoint de la misma arquitectura que openai/whisper-tiny.en, por lo que su rendimiento es equivalente.

## Limitaciones y advertencias

- Solo soporta inglés: no puede transcribir ni traducir otros idiomas.
- Modelo de tamaño tiny: su WER es mayor que el de los checkpoints más grandes de Whisper (base, small, medium, large).
- Riesgo de alucinaciones: Whisper puede generar texto inventado en silencios o en presencia de ruido, especialmente en modelos pequeños.
- Ventana de audio limitada: no se especifica la longitud de contexto en la información, pero los modelos Whisper procesan segmentos de audio finitos.
- Los benchmarks declarados no están verificados de forma independiente.
- No se proporciona información sobre sesgos conocidos, aunque al entrenarse con datos de voz en inglés puede presentar sesgos hacia acentos y dialectos dominantes.

## Enlaces

- HuggingFace: https://huggingface.co/Jinstudio/whisper-tiny.en
- Paper original: https://arxiv.org/abs/2212.04356
- Repositorio original: https://github.com/openai/whisper
- Modelo original en HuggingFace: https://huggingface.co/openai/whisper-tiny.en
