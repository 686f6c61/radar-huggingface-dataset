# cicada-ai/Chanjing-Avatar-V2V-1.3B

## Resumen

Chanjing-Avatar V2V 1.3B es un modelo de generación de vídeo de tipo video-to-video (V2V) impulsado por audio, desarrollado por cicada-ai (también referido como chanjing-ai). Está basado en el modelo de difusión de vídeo Wan2.1-T2V-1.3B de Alibaba y en el enfoque InfiniteTalk. Su función principal es tomar un vídeo fuente (con una persona hablando o en silencio) y una pista de audio de conducción, y regenerar únicamente la región facial del vídeo para que los labios y la expresión se sincronicen con el audio, mientras se preservan el cuerpo, el fondo y el movimiento de cámara originales.

El modelo tiene 1.851.256.128 parámetros (según los pesos safetensors), aunque su nombre comercial indica 1.3B, probablemente en referencia al tamaño del modelo base. Está diseñado como una variante ligera dentro de la familia Chanjing-Avatar, que incluye también versiones de 5B y 14B. Su relevancia radica en permitir la animación de avatares realistas a partir de vídeo y audio con un coste computacional reducido, lo que facilita su uso en entornos con recursos limitados. La licencia es Apache-2.0, lo que permite uso comercial y modificación, aunque se deben revisar las licencias de los modelos base y dependencias.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusión de vídeo (basada en Wan2.1-T2V-1.3B) con adaptación para video-to-video y condicionamiento por audio |
| Parametros totales | 1.851.256.128 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de vídeo, no de texto) |
| Tipos de cuantizacion | No disponible (solo se distribuyen pesos en safetensors) |
| Idiomas soportados | No disponible (probablemente multilingüe, pero no se especifica) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (2 archivos sharded + índice) |

## Arquitectura y entrenamiento

El modelo se construye sobre Wan2.1-T2V-1.3B, un modelo de difusión de vídeo de Alibaba que genera secuencias de vídeo a partir de texto. En este caso, se adapta para la tarea de video-to-video: en lugar de generar un vídeo desde cero, toma un vídeo de entrada y lo modifica solo en la región facial, guiado por una pista de audio. Para ello, se incorpora un codificador de audio (se menciona TencentGameMate/chinese-wav2vec2-base como dependencia) que extrae características del habla, las cuales se proyectan mediante un módulo `audio_proj` (incluido en el checkpoint) y se inyectan en el proceso de difusión.

No se proporcionan detalles sobre el conjunto de datos de entrenamiento, el número de tokens o el uso de técnicas como RLHF o DPO. El enfoque InfiniteTalk, mencionado en la model card, sugiere una metodología específica para el entrenamiento de avatares parlantes, pero no se describen sus innovaciones técnicas concretas en la información disponible. El checkpoint incluye dos archivos safetensors y un índice, además de un subdirectorio `training_init/` con el proyector de audio.

## Capacidades

- Generación de vídeo a partir de un vídeo fuente y una pista de audio de conducción.
- Sincronización labial y de expresión facial con el audio de forma realista.
- Preservación del cuerpo, el fondo y el movimiento de cámara del vídeo original.
- Soporte para audio-driven (conducción por audio) en el contexto de avatares parlantes.
- No se documentan capacidades adicionales como tool calling, razonamiento multimodal o procesamiento de texto.

## Casos de uso

- Creación de vídeos de marketing con presentadores virtuales: se parte de un vídeo grabado de una persona y se sustituye el audio por un guion nuevo, manteniendo la apariencia y el movimiento corporal.
- Doblaje de vídeos a otros idiomas: se puede cambiar la pista de audio a un idioma distinto y el modelo regenera la sincronización labial, facilitando la localización de contenido.
- Generación de contenido para redes sociales: permite crear vídeos de avatares hablando sobre temas de actualidad sin necesidad de grabar nuevas tomas.
- Restauración de vídeos antiguos: si un vídeo tiene el audio dañado o desincronizado, se puede usar una nueva pista de audio y el modelo corrige la sincronización facial.
- Personalización de avatares para aplicaciones de atención al cliente: se puede animar un avatar con la voz de un agente en tiempo real o en lote.
- Producción de material educativo: se pueden generar vídeos de instructores hablando sobre temas específicos a partir de una grabación base y diferentes guiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre métricas de calidad de sincronización labial, fidelidad visual o comparaciones con otros modelos.

## Requisitos de hardware

- No se proporcionan requisitos oficiales de hardware en la documentación.
- El tamaño del modelo (1.85B parámetros) sugiere que en FP16 ocupa aproximadamente 3,7 GB de VRAM, y en FP32 unos 7,4 GB. Con cuantización a 8 bits podría caber en GPUs de consumo con 8 GB de VRAM, pero no hay datos confirmados.
- Se recomienda una GPU con al menos 8 GB de VRAM para inferencia en FP16, y 12 GB o más para mayor margen. Modelos como RTX 3060, RTX 4060 o superiores podrían ser suficientes.
- Para despliegue, se puede usar el código de inferencia proporcionado en el repositorio de GitHub, que probablemente se basa en PyTorch y Diffusers. No se mencionan integraciones con vLLM, llama.cpp u Ollama, ya que es un modelo de vídeo, no de texto.
- La latencia y el throughput dependen de la duración del vídeo y de la GPU; no se ofrecen estimaciones oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | Base | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Chanjing-Avatar V2V 1.3B | 1.85B | Video-to-video | Wan2.1-T2V-1.3B | Apache-2.0 | HuggingFace |
| Chanjing-Avatar V2V 5B | ~5B (estimado) | Video-to-video | Wan2.1 (probablemente) | Apache-2.0 | HuggingFace |
| Chanjing-Avatar 14B | ~14B (estimado) | Image-to-video | Wan2.1 (probablemente) | Apache-2.0 | HuggingFace |
| Jogg-Avatar V2V | ~5B (estimado) | Video-to-video | Wan2.2-TI2V-5B | Apache-2.0 | HuggingFace |

No se dispone de datos de rendimiento comparativo. La comparativa se basa en la información pública de la familia de modelos y en el repositorio de Jogg-Avatar. Otros modelos de la categoría (como SadTalker, Wav2Lip o LatentSync) no se han incluido por falta de datos en la información proporcionada.

## Limitaciones y advertencias

- El modelo requiere el consentimiento explícito de las personas cuyos vídeos y voces se utilicen. No debe emplearse para suplantación, fraude, acoso o creación de contenido engañoso.
- Depende de modelos externos (Wan2.1-T2V-1.3B, wav2vec2 y modelos de preprocesamiento facial) que tienen sus propias licencias y términos de uso; es responsabilidad del usuario revisarlos.
- No se especifican los idiomas soportados; el modelo base Wan2.1 puede tener limitaciones en idiomas distintos del inglés y el chino.
- Al ser un modelo de difusión, puede generar artefactos visuales o inconsistencias en la región facial, especialmente con vídeos de baja calidad o movimientos extremos.
- No se han publicado evaluaciones de sesgos o alucinaciones; el modelo podría reflejar sesgos presentes en los datos de entrenamiento del modelo base.
- El tamaño del repositorio (7,7 GB) y la necesidad de descargar modelos adicionales pueden suponer una barrera de entrada en entornos con ancho de banda limitado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cicada-ai/Chanjing-Avatar-V2V-1.3B
- Repositorio de código (GitHub): https://github.com/chanjing-ai/Chanjing-Avatar-V2V-1.3B
- Modelo Chanjing-Avatar 14B: https://huggingface.co/cicada-ai/Chanjing-Avatar-14B
- Modelo Chanjing-Avatar V2V 5B: https://huggingface.co/cicada-ai/Chanjing-Avatar-V2V-5B
- Sitio web de la empresa (蝉镜): https://www.chanjing.cc/
