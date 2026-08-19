# OpenMOSS-Team/MOSS-VL-Realtime-NF4

## Resumen

MOSS-VL-Realtime-NF4 es una versión cuantizada del modelo MOSS-VL-Realtime, desarrollado por el equipo OpenMOSS. Se trata de un modelo multimodal de 11 336 millones de parámetros (aproximadamente 11,3B) especializado en comprensión de video en tiempo real, capaz de procesar flujos de vídeo continuos con marcas de tiempo y responder de forma interrumpible. La cuantización emplea un perfil W4A16 NF4 (bitsandbytes) para la mayoría de las capas de lenguaje, con BF16 en las capas iniciales y finales y en los módulos multimodales, más una caché KV en INT8 mediante HQQ. Esta configuración permite ejecutar el modelo en una GPU NVIDIA con 24 GB de VRAM, lo que facilita su despliegue en entornos de producción con hardware consumer de gama alta.

El modelo mantiene la interfaz de streaming original de MOSS-VL-Realtime, incluyendo tokens de control como `<|silence|>`, `<|round_start|>` y `<|round_end|>`, y soporta tanto inferencia en tiempo real sobre secuencias de frames como procesamiento offline de vídeos completos. Su licencia Apache-2.0 y su disponibilidad en formato safetensors lo convierten en una opción atractiva para desarrolladores que necesitan capacidades de comprensión de vídeo en tiempo real sin depender de APIs propietarias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-attention unificada multimodal (video-lenguaje) |
| Parametros totales | 11 336 371 208 (~11,3B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | NF4 (bitsandbytes) con doble cuantizacion para pesos; BF16 en capas seleccionadas y modulos multimodales; HQQ INT8 para KV cache |
| Idiomas soportados | Ingles y chino (en, zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (con codigo remoto en el checkpoint) |

## Arquitectura y entrenamiento

MOSS-VL-Realtime-NF4 es la version cuantizada del checkpoint BF16 MOSS-VL-Realtime, que emplea una arquitectura de cross-attention unificada para integrar informacion visual y textual. No se han publicado detalles especificos sobre el numero de capas, dimensiones de los tensores o la configuracion exacta de los bloques de atencion en la informacion disponible. El modelo base fue entrenado para manejar flujos de video continuos con marcas de tiempo, permitiendo que el sistema decida autonomamente cuando responder o permanecer en silencio.

La cuantizacion aplica un perfil W4A16: las capas de lenguaje principales se cuantizan a 4 bits usando NF4 con doble cuantizacion, mientras que las primeras y ultimas capas del transformador, junto con los modulos multimodales, se mantienen en BF16 para preservar la precision en las partes criticas. La caché KV se cuantiza a INT8 mediante HQQ, y la atencion utiliza FlashAttention 2 para optimizar el rendimiento. No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens procesados o si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Comprension de video en tiempo real: procesa flujos continuos de frames con marcas de tiempo y genera descripciones o respuestas sobre los cambios relevantes.
- Interrupcion y respuesta sobre la marcha: el modelo puede ser interrumpido en cualquier momento y responder a preguntas sobre el estado actual del video.
- Decision autonoma de respuesta: emite tokens de control como `<|silence|>`, `<|round_start|>` y `<|round_end|>` para gestionar el flujo conversacional.
- Inferencia offline de video: funcion `offline_video_generate` para procesar videos completos con control de resolucion, fps y numero de frames.
- Capacidades multimodales: entrada de video e imagenes, salida de texto.
- Multilingue: soporta ingles y chino.
- Integracion con Transformers: se carga mediante `AutoModelForCausalLM` y `AutoProcessor` con `trust_remote_code=True`.

## Casos de uso

- Vigilancia y monitorizacion en tiempo real: el modelo puede analizar secuencias de camaras de seguridad y describir eventos importantes (movimientos, cambios de escena) mientras permanece en silencio cuando no hay novedades, gracias a su interfaz de streaming con `frame_queue_size=1`.
- Asistentes para videollamadas y reuniones: integrado en herramientas de conferencia, puede generar resumenes en vivo de lo que ocurre en pantalla, como presentaciones de diapositivas o gestos de los participantes.
- Accesibilidad para personas con discapacidad visual: el modelo describe en tiempo real el contenido de un video o una escena capturada por una camara, permitiendo a usuarios con discapacidad visual seguir eventos en directo.
- Moderacion de contenido en plataformas de streaming: detecta y describe contenido inapropiado en flujos de video en vivo, enviando alertas automaticas al moderador.
- Comentarios automaticos en eventos deportivos: el modelo puede generar narracion en tiempo real de partidos o competiciones, basandose en las secuencias de video y las marcas de tiempo.
- Control de calidad en produccion industrial: mediante camaras que capturan lineas de montaje, el modelo identifica anomalias visuales y genera alertas descriptivas, aprovechando su capacidad de procesamiento en tiempo real con baja latencia.
- Educacion interactiva: en entornos de aprendizaje, el modelo puede responder preguntas sobre videos educativos mientras se reproducen, facilitando la comprension de conceptos complejos.

## Benchmarks y rendimiento

No se han publicado resultados numericos de benchmarks en la informacion disponible. La model card incluye un grafico comparativo que muestra que la version cuantizada mantiene una calidad cercana a la del checkpoint BF16 original en los benchmarks seleccionados, pero no se proporcionan valores concretos. Por tanto, no es posible presentar una tabla de rendimiento cuantitativa.

## Requisitos de hardware

- VRAM estimada: 24 GB para el perfil de tiempo real con FlashAttention 2 y `frame_queue_size=1`.
- GPU recomendadas: NVIDIA RTX 3090, RTX 4090, A5000, A6000 o cualquier GPU con 24 GB de VRAM.
- Compatibilidad con GPU consumer: si, las RTX 3090 y 4090 cumplen el requisito.
- Opciones de despliegue: el modelo se carga directamente con Transformers, bitsandbytes y HQQ. No se menciona compatibilidad con vLLM, llama.cpp u Ollama en la documentacion.
- Latencia y throughput: no disponibles; la documentacion indica que la latencia en produccion depende del hardware GPU, la tasa de muestreo de frames, el transporte y la velocidad de decodificacion.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos directamente comparables en la documentacion proporcionada. El ecosistema MOSS-VL incluye otras variantes como MOSS-VL-Instruct y una version base, pero no se ofrecen datos comparativos con modelos externos de caracteristicas similares (por ejemplo, otros modelos de video-lenguaje en tiempo real).

## Limitaciones y advertencias

- La latencia en produccion depende del hardware GPU, la tasa de muestreo de frames, el transporte y la velocidad de decodificacion; no se garantiza un rendimiento en tiempo real en cualquier infraestructura.
- Una instancia del modelo soporta una unica sesion activa de tiempo real; no es posible ejecutar multiples sesiones concurrentes con una sola carga.
- El modelo emite tokens de control (`<|silence|>`, `<|round_start|>`, `<|round_end|>`) que deben ser filtrados o interpretados por la aplicacion consumidora.
- La cuantizacion puede introducir una ligera degradacion en la calidad respecto al modelo BF16 original, aunque los datos disponibles sugieren que la perdida es minima.
- Solo soporta ingles y chino; no se ha verificado su rendimiento en otros idiomas.
- No se han documentado sesgos especificos, pero al ser un modelo de lenguaje multimodal puede heredar sesgos de sus datos de entrenamiento.
- La licencia Apache-2.0 permite uso comercial, pero es recomendable revisar las condiciones de los componentes de cuantizacion (bitsandbytes, HQQ) para verificar su compatibilidad.

## Enlaces

- Modelo cuantizado: https://huggingface.co/OpenMOSS-Team/MOSS-VL-Realtime-NF4
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-VL-Realtime
- Sitio web de OpenMOSS: https://openmoss.ai/MOSS-VL/
- Repositorio GitHub: https://github.com/OpenMOSS/MOSS-VL
