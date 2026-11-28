# pyarovrindavan/whisper-small-hi-disfluency-v2

## Resumen

`whisper-small-hi-disfluency-v2` es un modelo de reconocimiento automático del habla (ASR) publicado en Hugging Face por el usuario `pyarovrindavan`. Se trata de un ajuste fino del conocido modelo Whisper Small de OpenAI, orientado por su nombre a la transcripción de habla en hindi con tratamiento de disfluencias (repeticiones, titubeos, falsos inicios y muletillas). El modelo se distribuye en formato safetensors bajo la librería `transformers` y es compatible con los endpoints de inferencia del Hub.

El modelo cuenta con 241.734.912 parámetros, lo que corresponde exactamente al tamaño del checkpoint Whisper Small original de OpenAI. Su propósito declarado, según la nomenclatura del identificador, es mejorar la transcripción de audio en hindi cuando el habla contiene disfluencias, un escenario habitual en conversaciones espontáneas, entrevistas y grabaciones no guionizadas.

La relevancia de este modelo es limitada por el momento: no dispone de descargas ni likes, la model card es la plantilla automática de Hugging Face sin información sustantiva, y no se han publicado resultados de evaluación. Debe considerarse un checkpoint experimental o de investigación más que un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper Small de OpenAI) |
| Parametros totales | 241.734.912 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Whisper Small procesa ventanas de audio de 30 segundos) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente fp32/fp16) |
| Idiomas soportados | no disponible (el identificador sugiere hindi) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper Small, un transformer encoder-decoder con atención estándar diseñado para ASR multilingüe. El modelo original de OpenAI se entrenó con 680.000 horas de audio supervisado débilmente etiquetado, y Whisper Small dispone de 12 capas de encoder y 12 de decoder con un ancho de modelo de 768 dimensiones. El checkpoint aquí presentado conserva el mismo número de parámetros (241,7 M), por lo que la arquitectura no ha sido modificada.

No se dispone de información sobre el proceso de ajuste fino: ni el dataset utilizado, ni el número de pasos, ni la composición del corpus de disfluencias, ni si se aplicaron técnicas de aumento de datos o de normalización de transcripciones. La model card es la plantilla automática de Hugging Face y no aporta detalles de entrenamiento, hiperparámetros ni procedimiento. Tampoco se documenta si el ajuste se realizó con etiquetas que preservan las disfluencias o que las eliminan.

## Capacidades

- Reconocimiento automático del habla (ASR) en audio, presumiblemente orientado a hindi según el identificador del modelo.
- Transcripción de habla espontánea con disfluencias, que es el objetivo declarado por el nombre del checkpoint.
- Capacidad multilingüe heredada de Whisper Small, aunque no se documenta qué idiomas conserva tras el ajuste fino.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso; son capacidades ajenas a un modelo ASR.
- No se documenta modo thinking, visión ni audio generativo.
- No se documenta ninguna capacidad especial adicional más allá de la transcripción.

## Casos de uso

- Transcripción de entrevistas y conversaciones espontáneas en hindi: el modelo está ajustado para manejar repeticiones y titubeos, lo que lo hace adecuado para material oral no guionizado donde un ASR genérico suele producir transcripciones limpias que pierden información paralingüística.
- Subtitulado de vídeos y pódcast en hindi: permite generar subtítulos a partir de audio real con muletillas, útil para plataformas de contenido que quieren reflejar el habla original o para posterior limpieza automática.
- Análisis de calidad del habla y logopedia: la preservación de disfluencias permite estudiar patrones de titubeo, repetición y pausas en grabaciones clínicas o de investigación lingüística.
- Generación de corpus anotados para entrenamiento de otros modelos: las transcripciones con disfluencias pueden servir como datos de partida para modelos de normalización de texto o de corrección de habla.
- Investigación en ASR robusto: sirve como punto de comparación frente a Whisper Small original para medir el efecto del ajuste fino en la tasa de error sobre habla disfluente.
- Prototipado de asistentes de voz en hindi: puede integrarse en un pipeline de `transformers` para experimentar con la transcripción de comandos o diálogos antes de invertir en un modelo mayor.
- Evaluación comparativa de checkpoints comunitarios: útil para investigadores que quieran reproducir o contrastar resultados de ajustes finos de Whisper en hindi.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de WER (word error rate), CER ni comparaciones con Whisper Small original u otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1 GB para los pesos (241,7 M de parámetros × 4 bytes), más overhead de activaciones y del encoder de audio.
- VRAM estimada en fp16: aproximadamente 0,5 GB para los pesos.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente; RTX 3060, RTX 4060, RTX 4090, A100 o H100 funcionan sin problema.
- Cabe holgadamente en GPU de consumo: sí, en cualquier GPU moderna con 4 GB o más, e incluso en CPU para inferencia no interactiva.
- Opciones de despliegue: `transformers` con pipeline `automatic-speech-recognition`, endpoints de Hugging Face (el modelo está marcado como `endpoints_compatible`), y potencialmente `faster-whisper` o `whisper.cpp` si se convierte a los formatos correspondientes (no confirmado).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pyarovrindavan/whisper-small-hi-disfluency-v2 | 241,7 M | no disponible (ventanas de 30 s en Whisper) | no disponible (presumiblemente hindi) | no disponible | Hugging Face, 0 descargas |
| openai/whisper-small | 241,7 M | ventanas de 30 s | multilingüe (99 idiomas) | MIT (según el repositorio original de OpenAI) | Hugging Face, ampliamente usado |
| openai/whisper-medium | 769 M | ventanas de 30 s | multilingüe | MIT | Hugging Face |
| openai/whisper-large-v3 | 1.550 M | ventanas de 30 s | multilingüe | MIT | Hugging Face |

La comparación directa con Whisper Small original es la más pertinente: mismo tamaño y arquitectura, pero el checkpoint comunitario no documenta licencia, idiomas ni métricas, por lo que no puede evaluarse su mejora real frente al modelo base.

## Limitaciones y advertencias

- La model card es la plantilla automática de Hugging Face y no contiene información sobre sesgos, datos de entrenamiento ni evaluación; no hay garantías documentadas sobre su comportamiento.
- Riesgo de alucinación: como todo modelo Whisper, puede generar texto plausible que no corresponde al audio, especialmente en segmentos con ruido o silencios.
- No se documenta la licencia, lo que impide determinar si el uso comercial está permitido; debe contactarse con el autor antes de cualquier despliegue en producción.
- No se documentan los idiomas soportados tras el ajuste fino; el ajuste en hindi podría haber degradado el rendimiento en otros idiomas respecto al Whisper Small original.
- El modelo tiene 0 descargas y 0 likes, sin evidencia de uso o validación por parte de la comunidad.
- No se han publicado métricas de WER ni comparaciones con el modelo base, por lo que no puede verificarse la mejora prometida en disfluencias.
- La fecha de creación indicada (2026-11-28) es posterior a la fecha actual en muchos entornos, lo que sugiere un posible error de metadatos o una fecha futura programada; conviene verificar la integridad del repositorio.
- El tamaño del repositorio (1,0 GB) es superior al de los pesos solos (aproximadamente 1 GB en fp32), lo que sugiere que puede contener checkpoints adicionales o archivos de optimizer; conviene revisar el contenido antes de descargarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pyarovrindavan/whisper-small-hi-disfluency-v2
- Paper de Whisper (referencia arXiv citada en los tags): https://arxiv.org/abs/1910.09700
- Repositorio original de Whisper de OpenAI: https://github.com/openai/whisper
- Modelo base Whisper Small: https://huggingface.co/openai/whisper-small
- Calculadora de impacto medioambiental citada en la model card: https://mlco2.github.io/impact
