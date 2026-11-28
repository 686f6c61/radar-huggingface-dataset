# OpenMOSS-Team/MOSS-VL-Realtime-NF4

## Resumen

MOSS-VL-Realtime-NF4 es la versión cuantizada a 4 bits del modelo vision-lenguaje MOSS-VL-Realtime, desarrollado por OpenMOSS (equipo vinculado a MOSS AI). Se trata de un modelo multimodal de 11.336 millones de parámetros que procesa vídeo en streaming y genera descripciones o respuestas en tiempo real a medida que llegan fotogramas, además de soportar comprensión de imagen y vídeo offline. Su propuesta de valor es clara: llevar interacción multimodal en tiempo real a una única GPU de 24 GB de VRAM, algo inviable con el checkpoint original en BF16.

La cuantización emplea un esquema W4A16 con NF4 de bitsandbytes y doble cuantización en la mayoría de capas del lenguaje, mientras que las capas primera y última y los módulos multimodales permanecen en BF16. La caché KV de Transformers se comprime a INT8 mediante HQQ. El resultado es un repositorio de unos 11,9 GB que mantiene la interfaz de streaming con marcas de tiempo del modelo original.

Es relevante ahora porque la comprensión de vídeo en directo (vigilancia, asistencia en directo, robótica, accesibilidad) exige latencias bajas y ventanas de contexto amplias, y este checkpoint demuestra que es posible con hardware de gama alta de consumo profesional. La licencia Apache 2.0 facilita su adopción comercial, aunque el modelo solo declara soporte oficial para inglés y chino.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje transformer con codificador visual y LLM; soporte de streaming con marcas de tiempo (detalles internos no disponibles) |
| Parámetros totales | 11.336.371.208 (11,34 mil millones) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (la configuración de vídeo offline admite hasta 256 fotogramas) |
| Tipos de cuantización | W4A16 NF4 con doble cuantización (bitsandbytes) en la mayoría de capas del lenguaje; BF16 en primera/última capa y módulos multimodales; caché KV en INT8 vía HQQ |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, con código de modelado remoto (custom_code) y configuración de bitsandbytes y HQQ incluida |

## Arquitectura y entrenamiento

El modelo es un vision-lenguaje que combina un codificador visual con un modelo de lenguaje y una interfaz de streaming que acepta fotogramas PIL con marcas de tiempo no decrecientes. El procesamiento visual usa parches de tamaño 16 con `temporal_patch_size=1` y `merge_size=2`, y en modo offline permite configurar la extracción de vídeo con FPS, número mínimo y máximo de fotogramas y límites de píxeles. La generación en streaming emite tokens de control como `<|silence|>`, `<|round_start|>` y `<|round_end|>`, lo que sugiere un entrenamiento orientado a decidir cuándo hablar y cuándo permanecer en silencio.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card únicamente remite al informe técnico (arXiv:2608.15045) para los detalles de entrenamiento. La innovación destacable de este repositorio concreto es la receta de cuantización: NF4 con doble cuantización en el LLM, BF16 en los módulos sensibles (primera y última capa, visión) y caché KV en INT8 con HQQ, combinada con FlashAttention 2 para mantener el perfil de 24 GB.

## Capacidades

- Comprensión de imagen: descripción y respuesta a preguntas sobre imágenes individuales mediante los helpers offline del checkpoint estándar.
- Comprensión de vídeo largo: procesamiento offline de vídeo con hasta 256 fotogramas y control de FPS y resolución.
- Interacción en tiempo real: sesiones de streaming que reciben fotogramas con marcas de tiempo y generan texto incremental.
- Gestión de silencio: emisión de tokens de control que permiten al modelo callar cuando no hay cambios relevantes en la escena.
- Diálogo multi-turno dentro de una sesión en directo, con posibilidad de inyectar prompts en mitad de la sesión (`push_prompt`).
- Capacidades multilingües limitadas a inglés y chino según la model card.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso basado en agentes.

## Casos de uso

- Vigilancia y monitorización de vídeo en directo: el modelo puede consumir fotogramas de una cámara IP y emitir alertas textuales solo cuando detecta cambios relevantes, gracias a su mecanismo de silencio y a la interfaz de streaming con timestamps.
- Asistencia remota en directo: un operador comparte pantalla o cámara y el modelo describe lo que ocurre en tiempo real, útil en soporte técnico o telemedicina, con una sola GPU de 24 GB.
- Accesibilidad audiovisual: generación de descripciones continuas para personas con discapacidad visual sobre retransmisiones o videollamadas, aprovechando la generación incremental por turnos.
- Análisis de vídeo archivado: uso del modo offline con hasta 256 fotogramas para resumir reuniones, clases o partidos y responder preguntas sobre su contenido.
- Robótica e interactividad embodied: integración en bucles de percepción donde el modelo recibe fotogramas de una cámara y produce instrucciones o descripciones de bajo nivel con latencia controlada.
- Moderación de contenido en plataformas de vídeo: análisis por lotes de clips con el modo offline para clasificar y describir escenas antes de su publicación.
- Prototipado rápido en investigación multimodal: el perfil de 24 GB permite experimentar con streaming vídeo-texto en una RTX 4090 sin infraestructura de clúster.

## Benchmarks y rendimiento

La model card incluye una comparación gráfica entre los modelos cuantizados y sus equivalentes en BF16, pero no publica cifras numéricas en el texto. No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM: diseñado para una única GPU NVIDIA con 24 GB de VRAM en el perfil de tiempo real, usando FlashAttention 2 y `frame_queue_size=1`.
- GPU recomendadas: RTX 4090 (24 GB), A10G (24 GB), L4 (24 GB, con posibles limitaciones de cómputo), A100 y H100 para mayor margen y concurrencia.
- Cabe en GPU de consumo: sí, en RTX 4090 de 24 GB; en GPUs de 16 GB no está garantizado según la documentación.
- Despliegue: transformers con código remoto (`trust_remote_code=True`), bitsandbytes 0.49.2 y HQQ 0.2.8.post1; requiere FFmpeg en el PATH para decodificación de vídeo. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Stack probado: Python 3.12, PyTorch 2.8.0 con CUDA 12.8, Transformers 4.57.1, Accelerate 1.12.0, FlashAttention 2.8.1.
- Latencia y throughput: no disponibles de forma numérica; una instancia soporta una única sesión en tiempo real activa.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MOSS-VL-Realtime-NF4 | 11,34 mil millones | no disponible | Vídeo en streaming, cuantizado 4 bits | Apache 2.0 | Hugging Face |
| MOSS-VL-Realtime | no disponible | no disponible | Vídeo en streaming, BF16 | Apache 2.0 | Hugging Face |
| Alternativas comparables de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos de vídeo en streaming con los que comparar parámetros, contexto o rendimiento de forma rigurosa.

## Limitaciones y advertencias

- Idiomas oficiales limitados a inglés y chino; el rendimiento en castellano no está garantizado ni documentado.
- Riesgo de alucinación inherente a los modelos generativos multimodales; las descripciones de escenas pueden inventar detalles no presentes en los fotogramas.
- La cuantización a 4 bits puede degradar ligeramente la calidad frente al checkpoint BF16, aunque la model card afirma que se mantiene cercana.
- Una única instancia soporta una sola sesión en tiempo real, lo que limita el despliegue multiinquilino sin replicar el modelo.
- Requiere `trust_remote_code=True` y código de modelado remoto, lo que implica revisar el código antes de usarlo en producción.
- No se debe aplicar una segunda configuración de cuantización en tiempo de ejecución ni sustituir la caché KV INT8 por BF16 en el perfil de 24 GB.
- La aplicación debe filtrar los tokens de control (`<|silence|>`, `<|round_start|>`, `<|round_end|>`) para no mostrarlos al usuario final.
- No se documentan sesgos específicos, datos de entrenamiento ni evaluaciones de seguridad; conviene auditar antes de usos sensibles.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y el código remoto deben verificarse por si incorporan componentes con condiciones adicionales.

## Enlaces

- Hugging Face: https://huggingface.co/OpenMOSS-Team/MOSS-VL-Realtime-NF4
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-VL-Realtime
- README en chino: https://huggingface.co/OpenMOSS-Team/MOSS-VL-Realtime-NF4/blob/main/README_zh.md
- Informe técnico (arXiv:2608.15045): https://arxiv.org/pdf/2608.15045
- Referencia arXiv adicional (2606.07639): https://arxiv.org/abs/2606.07639
- Web oficial: https://www.moss-ai.com/models/moss-vl-realtime
- Documentación de la API: https://platform.moss.cn/en/docs/scenarios/vl-realtime
- Repositorio de código: https://github.com/OpenMOSS/MOSS-VL
