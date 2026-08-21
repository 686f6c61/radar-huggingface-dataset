# HullJi/speecht5_tts-wolof

## Resumen

speecht5_tts-wolof es un modelo de síntesis de voz (texto a voz) desarrollado por HullJi mediante fine-tuning del modelo base microsoft/speecht5_tts sobre el dataset galsenai/wolof_tts, que contiene texto en wolof. El wolof es una lengua atlántica hablada principalmente en Senegal, Gambia y Mauritania, con una presencia muy limitada en el ecosistema de modelos de voz open-source, lo que hace relevante este modelo para las comunidades hablantes.

El modelo emplea un tokenizador personalizado entrenado específicamente para el vocabulario wolof y ajusta la configuración del modelo base para incorporar el nuevo vocabulario. Con 144,5 millones de parámetros, ofrece capacidades de síntesis de voz específicamente afinadas para el wolof, y al estar licenciado bajo MIT puede integrarse en aplicaciones comerciales sin restricciones de licencia.

La relevancia de este modelo reside en que amplía la cobertura de lenguas de bajos recursos en sistemas de TTS, habilitando casos de uso como asistentes de voz, accesibilidad y educación para hablantes de wolof. No obstante, es importante señalar que el modelo parece ser una republicación del trabajo de bilalfaye/speecht5_tts-wolof, ya que el código de ejemplo de la model card referencia el checkpoint de bilalfaye en lugar del propio HullJi.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | SpeechT5 (encoder-decoder unificado para síntesis de voz) |
| Parámetros totales | 144.491.490 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 posiciones de texto (configuración estándar de SpeechT5, no confirmada explícitamente) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | wolof (wo) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SpeechT5 es una arquitectura de encoder-decoder propuesta por Microsoft que unifica reconocimiento y síntesis de voz en un mismo marco. En la variante de TTS, el encoder procesa los tokens de texto y el decoder genera espectrogramas mel que posteriormente se convierten en audio mediante el vocoder HiFi-GAN (microsoft/speecht5_hifigan). El modelo incorpora embeddings de hablante (x-vectors) para condicionar la voz generada, permitiendo control sobre las características vocales.

El fine-tuning se realizó con el dataset galsenai/wolof_tts, que contiene texto en wolof. El proceso incluyó el entrenamiento de un tokenizador personalizado para el wolof y el ajuste del vocabulario del modelo base. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni el uso de técnicas de alineación como RLHF o DPO. El modelo se generó con la herramienta de entrenamiento de Hugging Face (generated_from_trainer).

## Capacidades

- Síntesis de voz en wolof a partir de texto, con generación de espectrogramas y conversión mediante el vocoder HiFi-GAN.
- Control de la voz del hablante mediante embeddings de tipo x-vector, lo que permite generar voces con diferentes características.
- Generación de audio a 16 kHz de frecuencia de muestreo.
- Compatible con búsqueda de haz (beam search) para mejorar la calidad de la síntesis, con parámetros de temperatura y penalización de repetición.
- Capacidades multilingües limitadas al wolof; no está diseñado para otros idiomas.

## Casos de uso

- **Asistentes de voz para hablantes de wolof**: el modelo puede integrarse en aplicaciones de asistente virtual que respondan verbalmente en wolof, mejorando la accesibilidad de usuarios que no dominan el francés u otros idiomas.
- **Accesibilidad para personas con discapacidad visual**: síntesis de voz en wolof para leer contenido digital (noticias, artículos, mensajes) a personas con discapacidad visual que hablan wolof.
- **Aprendizaje de idiomas**: herramientas educativas que generan audio en wolof a partir de texto, permitiendo a estudiantes escuchar la pronunciación correcta de palabras y frases.
- **Sistemas de atención al cliente IVR**: integración en centralitas telefónicas para proporcionar respuestas automatizadas en wolof, un idioma con poca cobertura en sistemas de voz comerciales.
- **Generación de contenidos audiovisuales**: creación de locuciones en wolof para proyectos multimedia, vídeos educativos o campañas de comunicación dirigidas a comunidades wolof.
- **Narración para personas mayores**: síntesis de voz en wolof para que personas mayores que no leen puedan recibir mensajes de voz en su lengua materna, por ejemplo en dispositivos domésticos o aplicaciones de salud.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El model-index de la model card declara un array de resultados vacío, por lo que no es posible comparar el rendimiento del modelo con otros sistemas de TTS de forma objetiva.

## Requisitos de hardware

- **VRAM estimada para inferencia**: aproximadamente 1-2 GB en FP16, incluyendo el modelo (144,5 M de parámetros, unos 290 MB en FP16), el vocoder HiFi-GAN y los buffers de activación y espectrogramas.
- **GPU recomendadas**: cualquier GPU con al menos 2 GB de VRAM, como NVIDIA GTX 1650, RTX 3060 o superiores. También funciona en Apple Silicon.
- **Compatibilidad con consumer GPU**: sí, es un modelo ligero que cabe en cualquier GPU de consumo actual.
- **Opciones de despliegue**: Python con la librería Transformers de Hugging Face, ejecución en CPU o CUDA. No se ha encontrado soporte para vLLM, llama.cpp, Ollama o TGI, que son herramientas orientadas a modelos de lenguaje, no a TTS.
- **Latencia y throughput**: no disponible; la generación de voz es secuencial y suele tardar varios segundos en CPU y menos de un segundo en GPU para frases cortas.

## Comparativa con modelos similares

| Modelo | Parámetros | Base | Idioma | Licencia | Notas |
|---|---|---|---|---|---|
| HullJi/speecht5_tts-wolof | 144,5 M | microsoft/speecht5_tts | wolof | MIT | Fine-tuning sobre galsenai/wolof_tts; posible re-publicación de bilalfaye |
| bilalfaye/speecht5_tts-wolof | 144,5 M | microsoft/speecht5_tts | wolof | MIT | Modelo original de referencia; el código de ejemplo de HullJi lo usa como checkpoint |
| bilalfaye/speecht5_tts-wolof-v0.2 | no disponible | microsoft/speecht5_tts | wolof | no disponible | Versión actualizada del modelo de bilalfaye |
| Alwaly/speecht5_tts_voxpopuli_wo | 144,5 M | microsoft/speecht5_tts | wolof | no disponible | Fine-tuning sobre dataset VoxPopuli |

La comparativa muestra que existen al menos tres modelos de TTS para wolof basados en SpeechT5. El modelo de HullJi parece derivado del de bilalfaye, por lo que su valor diferencial es limitado salvo que incluya mejoras no documentadas.

## Limitaciones y advertencias

- El modelo está específicamente afinado para el wolof y puede no funcionar correctamente con otros idiomas o acentos.
- La disponibilidad de datos de entrenamiento es limitada (dataset galsenai/wolof_tts), lo que puede afectar la calidad de la síntesis, especialmente en términos de pronunciación de nombres propios, términos técnicos o variedades dialectales.
- El modelo card no documenta la cobertura del vocabulario ni la calidad de la síntesis, y no se han publicado métricas objetivas.
- El tamaño del repositorio (18,5 GB) es inusualmente alto para un modelo de 144,5 M de parámetros, lo que sugiere que puede incluir archivos adicionales o duplicados; es recomendable revisar el contenido antes de descargar.
- La licencia MIT permite uso comercial sin restricciones, pero el dataset de entrenamiento (galsenai/wolof_tts) puede tener sus propias condiciones de uso que conviene verificar antes de desplegar en producción.
- El código de ejemplo de la model card referencia el checkpoint de bilalfaye, lo que indica que la documentación de este modelo puede ser una copia parcial de la del modelo original, lo que introduce incertidumbre sobre la exactitud de las instrucciones.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/HullJi/speecht5_tts-wolof)
- [Modelo base microsoft/speecht5_tts](https://huggingface.co/microsoft/speecht5_tts)
- [Dataset galsenai/wolof_tts](https://huggingface.co/datasets/galsenai/wolof_tts)
- [Modelo de referencia bilalfaye/speecht5_tts-wolof](https://huggingface.co/bilalfaye/speecht5_tts-wolof)
- [Modelo bilalfaye/speecht5_tts-wolof-v0.2](https://huggingface.co/bilalfaye/speecht5_tts-wolof-v0.2)
- [Modelo Alwaly/speecht5_tts_voxpopuli_wo](https://huggingface.co/Alwaly/speecht5_tts_voxpopuli_wo)
- [Página de Bilal Faye con modelos ASR/TTS](https://b-faye.github.io/others.html)
