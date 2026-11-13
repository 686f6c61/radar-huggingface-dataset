# NandemoGHS/audio-annotator-v2

## Resumen

NandemoGHS/audio-annotator-v2 es un modelo publicado en Hugging Face por el usuario NandemoGHS, etiquetado con la arquitectura `qwen3_omni_moe` y distribuido en formato safetensors. Por su nombre y por el prefijo arquitectónico, se trata presumiblemente de un modelo multimodal derivado de la familia Qwen3-Omni de Alibaba, orientado a tareas de anotación de audio, aunque la model card no está disponible en la información proporcionada y no se puede confirmar el propósito exacto ni el proceso de ajuste.

El repositorio contiene 35.259.818.545 parámetros almacenados (aproximadamente 35,26 mil millones), con un tamaño total de 70,5 GB, lo que es coherente con pesos en precisión bf16/fp16. Al emplear una arquitectura MoE (mixture of experts) según la etiqueta, el número de parámetros activos por token sería inferior al total, aunque no se dispone del dato concreto.

El modelo es relevante por su carácter multimodal (audio, y presumiblemente texto e imagen, dado el linaje Qwen3-Omni) y por su tamaño contenido dentro del segmento MoE. Sin embargo, el acceso está restringido (gated), requiere aceptar condiciones en Hugging Face, no declara licencia ni idiomas soportados, y cuenta con un historial muy limitado (9 descargas y 2 likes), lo que lo sitúa como un artefacto de investigación más que como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_omni_moe (transformer MoE multimodal, segun etiqueta del repo) |
| Parametros totales | 35.259.818.545 (~35,26 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 70,5 GB |
| Acceso | Restringido (gated), requiere aceptar condiciones |
| Pipeline declarado | no disponible |

## Arquitectura y entrenamiento

La etiqueta `qwen3_omni_moe` indica que el modelo se basa en la arquitectura Qwen3-Omni en su variante MoE, un transformer con mezcla de expertos diseñado para procesar y generar contenido multimodal (audio, texto e imagen en la familia original). El recuento de 35,26 mil millones de parámetros corresponde a los pesos almacenados; en un MoE, el número de parámetros activos por token sería sustancialmente menor, pero no se ha publicado esa cifra en la información disponible.

No se dispone de datos sobre el corpus de entrenamiento, el número de tokens procesados, la composición del dataset de anotación de audio, ni sobre si se aplicaron fases de RLHF, DPO o ajuste supervisado específico. Tampoco hay información sobre innovaciones técnicas particulares (decodificación especulativa, atención lineal, mecanismos de routing) más allá de lo que implica la arquitectura Qwen3-Omni de referencia. Todo ello debe considerarse no disponible.

## Capacidades

- Procesamiento de audio: por el nombre del modelo y la arquitectura de origen, se orienta a tareas de anotación y análisis de audio (transcripción, etiquetado, segmentación), aunque no se detalla en la información disponible.
- Procesamiento multimodal: la familia Qwen3-Omni soporta entrada de audio, imagen y texto; se presume herencia de estas capacidades, sin confirmación documental.
- Generación de texto: capacidad esperada por el linaje, no verificada en la model card.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Modo thinking explícito: no disponible.

## Casos de uso

- Anotación automática de corpus de audio: el modelo podría emplearse para etiquetar segmentos de audio con categorías semánticas, aprovechando su naturaleza multimodal y su tamaño MoE para procesar lotes en servidores con GPU de 80 GB.
- Transcripción y diarización asistida: en pipelines de investigación donde se requiera pre-anotar conversaciones antes de la revisión humana, reduciendo el coste de etiquetado manual.
- Generación de metadatos para archivos sonoros: descripción de contenido, hablantes y eventos acústicos para bibliotecas de audio o archivos de medios.
- Moderación de contenido en audio: detección y clasificación de fragmentos problemáticos en grabaciones, con revisión humana posterior dado el riesgo de alucinación.
- Investigación académica en modelos omni: servir como base para estudiar el comportamiento de arquitecturas MoE multimodales en tareas de audio, siempre que se cumplan las condiciones de acceso restringido.
- Prototipado interno de asistentes de voz: integración en entornos controlados para evaluar latencia y calidad antes de adoptar un modelo con licencia clara.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 70 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda un mínimo de 80 GB.
- GPU recomendadas: NVIDIA H100 80 GB, A100 80 GB, o múltiples A100 40 GB / RTX 6000 Ada con tensor parallelism.
- GPU de consumo: no cabe en tarjetas de 24 GB (RTX 4090, 3090) en precisión completa; requeriría cuantización a 4 bits (no distribuida en el repo) para acercarse a 20-25 GB, con pérdida de calidad no evaluada.
- Opciones de despliegue: vLLM o TGI si se confirma soporte para la arquitectura qwen3_omni_moe; llama.cpp/Ollama solo si se generan GGUF (no disponibles). El acceso gated complica la integración automatizada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NandemoGHS/audio-annotator-v2 | ~35,26 B (MoE) | no disponible | audio/multimodal (presunto) | no disponible | gated, 9 descargas |
| Qwen2-Audio (7B) | ~8 B | ~8k tokens | audio + texto | Apache 2.0 (variantes) | publico |
| Qwen2.5-Omni (7B) | ~7 B | ~32k tokens | audio, imagen, video, texto | Apache 2.0 | publico |
| Whisper large-v3 | ~1,55 B | 30 s por ventana | audio | MIT | publico |

La comparativa es orientativa: el modelo analizado no declara licencia ni contexto, y su linaje Qwen3-Omni no está confirmado con documentación. Frente a Whisper large-v3, el modelo aquí descrito es mucho mayor y multimodal, pero carece de benchmarks publicados.

## Limitaciones y advertencias

- Licencia no declarada: no se puede garantizar el uso comercial; es imprescindible verificar las condiciones del acceso gated antes de cualquier despliegue en producción.
- Model card ausente: no hay documentación sobre entrenamiento, sesgos, idiomas ni evaluación, lo que impide una validación rigurosa.
- Riesgo de alucinación: sin benchmarks ni evaluación publicada, no se puede estimar la fiabilidad en transcripción o etiquetado.
- Idiomas no declarados: se desconoce si el modelo cubre castellano u otras lenguas distintas del inglés o chino.
- Historial mínimo: 9 descargas y 2 likes sugieren un artefacto de investigación sin validación comunitaria.
- Acceso restringido: la naturaleza gated dificulta la reproducibilidad y la integración en pipelines CI/CD.
- Requisitos de hardware elevados: 70,5 GB de pesos impiden su uso en GPU de consumo sin cuantización, no disponible en el repositorio.
- Arquitectura MoE: el routing puede introducir variabilidad en la calidad entre tokens; sin documentación, no se puede evaluar su estabilidad.

## Enlaces

- Hugging Face: https://huggingface.co/NandemoGHS/audio-annotator-v2
- Repositorio base presumido (Qwen3-Omni): no disponible en la información proporcionada
- Paper o blog del autor: no disponible
- Demos o espacios asociados: no disponible
