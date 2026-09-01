# blaze-voice-ai/dubbing-demucs

## Resumen

`dubbing-demucs` es un checkpoint del modelo de separación de fuentes de audio Demucs, desarrollado por Facebook Research y espejado por el equipo de blaze-voice-ai para su pipeline de doblaje (dubbing). Se trata del especialista en voces (`04573f0d`) de la familia Demucs, que aísla la pista vocal de una mezcla musical dejando el resto como acompañamiento. El repositorio sirve como espejo fijo para que una construcción Docker pueda descargar un archivo concreto sin depender de la disponibilidad de `torch.hub`.

El modelo resuelve el problema de separar voces del fondo musical en tiempo real o en lote, una tarea crítica en aplicaciones de doblaje, karaoke, remezcla y limpieza de audio. Su relevancia actual radica en que es aproximadamente 4 veces más rápido que el modelo `htdemucs_ft` (el más completo de la familia), y el pipeline de blaze-voice-ai lo utiliza de forma específica: toma el fondo como "mezcla menos voces" en lugar de sumar los otros stems, lo que evita la degradación que sufren los stems débiles (batería, bajo, otros). Según la model card, esta estrategia mantiene el fondo dentro de 0,1 dB del original, frente a 8,5 dB de pérdida al sumar stems.

La arquitectura es la de Demucs: una red convolucional en forma de U-Net con capas de atención, diseñada para separación de fuentes musicales. El tamaño del repositorio es de 0,1 GB, lo que sugiere un checkpoint ligero, adecuado para entornos con recursos limitados. La licencia es MIT, lo que permite uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net convolucional con atención (Demucs) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de audio, procesa ventanas temporales) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (procesa audio, no texto) |
| Licencia | MIT |
| Formato de pesos | checkpoint de PyTorch (cargado via torch.hub) |

## Arquitectura y entrenamiento

Demucs es un modelo de separación de fuentes de audio basado en una arquitectura U-Net convolucional, con bloques de convolución y deconvolución que operan sobre la forma de onda directamente (end-to-end). La versión `htdemucs` (hybrid transformer demucs) incorpora capas de atención y mejoras en el entrenamiento, logrando resultados de vanguardia en separación de stems (batería, bajo, voces, otros). El checkpoint `04573f0d` es el especialista en voces, entrenado específicamente para aislar la pista vocal con alta fidelidad, sacrificando la calidad en los demás stems.

No se dispone de información detallada sobre el dataset de entrenamiento ni el proceso de optimización (si hubo RLHF, DPO, etc.) en la model card proporcionada. Sin embargo, el modelo original de Demucs fue entrenado con el dataset MUSDB18 (150 pistas de música comercial) y sus extensiones, usando una pérdida basada en la relación señal-distorsión (SDR). El checkpoint espejado aquí es una copia exacta del publicado por Facebook Research, sin modificaciones adicionales.

## Capacidades

- Separación de voces: aísla la pista vocal de una mezcla musical con alta calidad, manteniendo el resto como fondo.
- Integración en pipelines de doblaje: el modelo está diseñado para ser usado como componente de un sistema de doblaje automático, donde la voz separada se reemplaza o procesa.
- Velocidad de inferencia: aproximadamente 4 veces más rápido que `htdemucs_ft`, lo que permite procesamiento en tiempo real o en lote con menor latencia.
- Estrategia de fondo mix-minus-vocals: el pipeline de blaze-voice-ai utiliza el fondo como la mezcla original menos las voces, en lugar de sumar los otros stems, lo que reduce la pérdida de calidad (0,1 dB frente a 8,5 dB).
- Compatibilidad con torch.hub: se carga mediante la API estándar de PyTorch, facilitando su integración en entornos Python.
- No incluye capacidades de texto, visión ni tool calling: es un modelo puramente de audio.

## Casos de uso

- Doblaje automático de vídeo: el modelo separa la voz original de un clip, permitiendo sustituirla por una pista doblada en otro idioma sin perder el fondo musical. Es el caso de uso principal del pipeline de blaze-voice-ai.
- Karaoke y remezclas: extraer la pista vocal para crear versiones instrumentales o acapellas. El especialista en voces ofrece mejor calidad que los modelos generalistas para este fin.
- Limpieza de audio para podcasts: aislar la voz de un invitado cuando hay música de fondo, mejorando la inteligibilidad en postproducción.
- Análisis musical: separar voces para estudios de transcripción, análisis de armonía o investigación en musicología.
- Generación de pistas de acompañamiento: crear versiones instrumentales de canciones para uso en vídeos, presentaciones o contenido educativo.
- Sistemas de transcripción automática: preprocesar audio con música para mejorar la precisión de los sistemas de reconocimiento de voz, al eliminar la interferencia musical.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para este checkpoint en la información disponible. La model card menciona una comparación cualitativa con `htdemucs_ft` en el contexto del pipeline de blaze-voice-ai: el especialista en voces es 4 veces más rápido y la estrategia de fondo mix-minus-vocals mantiene el fondo dentro de 0,1 dB del original, frente a 8,5 dB de pérdida al sumar stems. No se proporcionan métricas estándar como SDR, SAR o SIR.

## Requisitos de hardware

- VRAM estimada: no disponible en la información proporcionada. Dado el tamaño del repositorio (0,1 GB), se estima que el modelo requiere menos de 1 GB de VRAM en FP32, y menos aún en cuantización, pero no hay datos confirmados.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM debería ser suficiente para inferencia en lote. Para tiempo real, una GPU de gama media (GTX 1660, RTX 2060 o superior) es adecuada.
- Compatibilidad con consumer GPU: sí, el modelo es ligero y cabe en GPUs de consumo habituales.
- Opciones de despliegue: se puede ejecutar con PyTorch directamente, o mediante frameworks de inferencia como ONNX Runtime si se exporta. No hay soporte nativo para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. La model card indica que es 4 veces más rápido que `htdemucs_ft`, pero no da cifras absolutas.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Velocidad relativa | Licencia | Uso principal |
|---|---|---|---|---|---|
| dubbing-demucs (especialista voces) | U-Net convolucional (Demucs) | no disponible | 4x más rápido que htdemucs_ft | MIT | Separación de voces |
| htdemucs_ft (Demucs completo) | U-Net convolucional con atención | ~64M (estimado) | 1x (referencia) | MIT | Separación de 4 stems (batería, bajo, voces, otros) |
| Spleeter (Deezer) | U-Net convolucional | ~10M (2 stems) | similar a Demucs | MIT | Separación de 2 o 4 stems |
| Open-Unmix | Red fully connected | ~10M | más lento que Demucs | MIT | Separación de stems musicales |

Nota: los parámetros de htdemucs_ft y Spleeter son estimaciones basadas en documentación pública, no en la información proporcionada. La comparativa se basa en características generales conocidas de estos modelos.

## Limitaciones y advertencias

- Especialización limitada: el checkpoint está entrenado específicamente para voces; su rendimiento en batería, bajo y otros stems es débil, como se indica en la model card.
- Dependencia del checkpoint: el modelo es una copia espejo de un checkpoint concreto (`04573f0d`); si Facebook Research actualiza o elimina el original, este repositorio mantiene la versión fija, pero no recibirá mejoras.
- Artefactos en la separación: como todos los modelos de separación de fuentes, puede introducir artefactos o pérdida de calidad en ciertos tipos de música (por ejemplo, con mucha reverberación o mezclas densas).
- Sin soporte multilingüe ni de texto: no procesa lenguaje natural, solo audio.
- Requisitos de integración: para usarlo en producción, es necesario implementar el pipeline de carga via torch.hub o descargar el checkpoint manualmente; no hay una API estándar de HuggingFace Transformers.
- Licencia MIT: permite uso comercial, pero el modelo original de Demucs también es MIT, por lo que no hay restricciones adicionales.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/blaze-voice-ai/dubbing-demucs
- Repositorio original de Demucs (Facebook Research): https://github.com/facebookresearch/demucs
- Demostración online de Demucs: https://demucs.danielfrg.com/
- Space de HuggingFace con Demucs: https://huggingface.co/spaces/aimuzik/demucs
- Artículo de overview de Demucs en aimodels.fyi: https://www.aimodels.fyi/models/replicate/demucs-cjwbw
