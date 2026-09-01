# blaze-voice-ai/dubbing-tts

## Resumen

El modelo `blaze-voice-ai/dubbing-tts` es un sistema de síntesis de voz (text-to-speech) desarrollado por el equipo de Blaze, una empresa especializada en voz e IA para el sudeste asiático. Se trata de un fine-tune del modelo OmniVoice, concretamente el checkpoint 4000 del entrenamiento `omnivoice_finetune_khmer`, orientado a la generación de voz en idioma jemer (khmer). El modelo se utiliza como motor de síntesis dentro del servicio de doblaje de Blaze, y se sirve mediante un sidecar HTTP en lugar de cargarse en proceso.

Con 612 millones de parámetros, este modelo cubre una necesidad concreta: ofrecer voces naturales en un idioma con poca representación en los sistemas TTS comerciales. Su relevancia radica en que permite integrar síntesis de voz en jemer en aplicaciones de doblaje, asistentes y accesibilidad, con una licencia Apache 2.0 que facilita su adopción comercial. La arquitectura subyacente es OmniVoice, aunque no se proporcionan detalles adicionales sobre su diseño interno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | OmniVoice (fine-tune para khmer) |
| Parametros totales | 612.577.288 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors) |
| Idiomas soportados | khmer (jemer) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna de OmniVoice, pero se sabe que el modelo es un fine-tune del checkpoint 4000 del entrenamiento `omnivoice_finetune_khmer`. No se especifican los datos de entrenamiento, el número de tokens ni el proceso de alineación (RLHF, DPO, etc.). El modelo se sirve a través de un sidecar HTTP dentro de la infraestructura de Blaze, lo que sugiere un diseño orientado a servicios de baja latencia. No se mencionan innovaciones técnicas adicionales en la model card.

## Capacidades

- Generación de voz a partir de texto en idioma jemer (khmer).
- Integración como motor TTS en servicios de doblaje, mediante una API HTTP.
- Posible soporte para voces personalizadas o clonación, dado que OmniVoice es conocido por esa funcionalidad, aunque no está confirmado en la documentación.
- No se indican capacidades de tool calling, agentes ni razonamiento, al ser un modelo puramente de síntesis de voz.

## Casos de uso

- Doblaje de contenido audiovisual al jemer: el modelo puede generar pistas de voz para vídeos, series o películas, sustituyendo la locución humana en flujos de producción automatizados.
- Audiolibros y narración: permite convertir texto en jemer a voz para plataformas de audiolibros, con una calidad natural adecuada para largas sesiones de escucha.
- Asistentes de voz en aplicaciones móviles: al ser un TTS ligero (612M parámetros), puede integrarse en apps de asistencia o navegación que requieran respuestas habladas en jemer.
- Accesibilidad para personas con discapacidad visual: lectores de pantalla o herramientas de lectura de documentos en jemer pueden usar este modelo para vocalizar contenido.
- Sistemas de respuesta interactiva (IVR): centralitas telefónicas o servicios de atención al cliente en Camboya pueden emplear el modelo para generar mensajes automatizados en el idioma local.
- Pruebas y desarrollo de servicios TTS: al estar disponible bajo Apache 2.0, sirve como base para experimentar con fine-tunes adicionales o para comparar calidad frente a otros motores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo menciona métricas de throughput operativo: 23,6 líneas por minuto con una réplica en una GPU L4, y 28,9 líneas por minuto con dos réplicas en tarjetas separadas. No hay datos de calidad de voz (MOS, WER, etc.) ni comparaciones con otros modelos TTS.

## Requisitos de hardware

- VRAM estimada: con 612M parámetros, en FP16 el modelo ocupa aproximadamente 1,2 GB, más overhead de inferencia. La model card indica que una réplica necesita ~1,2 GB de headroom transitorio, por lo que el requisito total rondaría los 2,5-3 GB.
- GPU recomendadas: una NVIDIA L4 (24 GB) es suficiente para una réplica. También debería caber en GPUs consumer como RTX 3060 (12 GB) o RTX 4090 (24 GB), aunque no hay datos oficiales.
- Despliegue: se sirve mediante un sidecar HTTP (servicio `services/tts`), no se mencionan integraciones con vLLM, llama.cpp u Ollama. El modelo está en formato safetensors, por lo que podría convertirse a GGUF si se desea usar en entornos CPU, pero no hay instrucciones al respecto.
- Latencia y throughput: 23,6 líneas/min en una réplica L4; 28,9 líneas/min con dos réplicas en tarjetas separadas. Compartir una misma tarjeta entre dos réplicas degrada el rendimiento a 15,7 líneas/min y provoca OOM a mitad de generación.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (TTS para jemer). Alternativas genéricas como VITS, Tacotron 2 o Coqui TTS podrían servir, pero no hay datos de rendimiento ni calidad para establecer una comparación objetiva. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo está especializado únicamente en jemer; no se ha verificado su rendimiento en otros idiomas.
- No se documentan sesgos específicos, pero al ser un fine-tune de un modelo base, puede heredar sesgos de los datos de entrenamiento originales de OmniVoice.
- Riesgo de errores de pronunciación en nombres propios o términos técnicos, común en TTS para idiomas con pocos recursos.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos de la licencia de OmniVoice original, ya que el fine-tune podría estar sujeto a condiciones adicionales.
- En producción, no se deben ejecutar dos réplicas en la misma GPU: el rendimiento cae y se producen OOM. Se requiere una tarjeta por réplica o un reparto cuidadoso de recursos.
- No hay información sobre la calidad de voz en términos de naturalidad o inteligibilidad, por lo que se recomienda realizar pruebas subjetivas antes de un despliegue masivo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/blaze-voice-ai/dubbing-tts
- Sitio web de Blaze (empresa desarrolladora): https://blaze.vn/
