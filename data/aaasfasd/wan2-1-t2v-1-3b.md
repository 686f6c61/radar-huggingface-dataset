# AAASFASD/Wan2.1-T2V-1.3B

## Resumen

Wan2.1-T2V-1.3B es un modelo de generación de vídeo a partir de texto (text-to-video) desarrollado por el equipo Wan-AI (Alibaba). Forma parte de la suite Wan2.1, un conjunto de modelos fundacionales de vídeo que incluye variantes de mayor tamaño (14B) para text-to-video e image-to-video. Esta versión de 1.3B parámetros está diseñada específicamente para ejecutarse en GPUs de consumo, con un requisito de VRAM de 8,19 GB, lo que la hace accesible a equipos creativos y académicos con recursos limitados.

El modelo es relevante porque democratiza la generación de vídeo de calidad: puede generar un vídeo de 5 segundos a 480P en unos 4 minutos en una RTX 4090 sin técnicas de optimización como cuantización. Además, Wan2.1 es el primer modelo de vídeo capaz de generar texto en chino e inglés de forma nativa, lo que amplía sus aplicaciones prácticas. La arquitectura se basa en difusión (diffusers) y utiliza un VAE de vídeo propio (Wan-VAE) capaz de codificar y decodificar vídeo 1080P de cualquier duración preservando la información temporal.

El repositorio corresponde a una copia subida por el usuario AAASFASD del modelo original Wan-AI/Wan2.1-T2V-1.3B, con licencia Apache 2.0. El modelo tiene 1.418.996.800 parámetros reales según los pesos en safetensors, y el tamaño del repo es de 17,6 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión (diffusers) con VAE de vídeo (Wan-VAE) |
| Parametros totales | 1.418.996.800 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de generación de vídeo, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Wan2.1-T2V-1.3B es un modelo de difusión para generación de vídeo. La información proporcionada no detalla la arquitectura interna del denoiser (si es un transformer o U-Net), pero sí se especifica que utiliza un VAE de vídeo propio denominado Wan-VAE, que destaca por su eficiencia y capacidad de codificar/decodificar vídeo 1080P de cualquier duración preservando la información temporal. El modelo está integrado en la librería diffusers, lo que facilita su uso mediante pipelines estándar.

No se han proporcionado datos sobre el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. La model card menciona que el modelo de 1.3B está entrenado principalmente para 480P (aunque puede generar 720P con resultados menos estables) y que forma parte de una suite que soporta múltiples tareas: text-to-video, image-to-video, edición de vídeo, text-to-image y video-to-audio. No se detallan innovaciones técnicas específicas más allá del VAE y la capacidad de generación de texto bilingüe.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) en resoluciones 480P y 720P (esta última con menor estabilidad).
- Generación de texto en inglés y chino dentro del vídeo generado (primera modelo de vídeo con esta capacidad según la model card).
- Soporte de múltiples tareas dentro de la suite Wan2.1 (aunque este checkpoint concreto es solo T2V-1.3B): image-to-video, edición de vídeo, text-to-image y video-to-audio están disponibles en otras variantes.
- Compatibilidad con GPUs de consumo gracias a su bajo requisito de VRAM (8,19 GB).
- Integración con la librería diffusers (aunque la model card indica que la integración con diffusers está pendiente en el momento de la publicación; el tag de la librería es diffusers).
- No se menciona soporte de tool calling, function calling ni agentes multi-step, ya que es un modelo generativo de vídeo, no un LLM.

## Casos de uso

- Creación de vídeos cortos para redes sociales: el modelo puede generar clips de 5 segundos a 480P en aproximadamente 4 minutos en una RTX 4090, lo que permite a creadores de contenido producir material visual sin necesidad de hardware profesional.
- Prototipado rápido en estudios de animación: los equipos pueden generar storyboards animados o previsualizaciones de escenas a partir de descripciones textuales, agilizando la comunicación entre guionistas y animadores.
- Generación de vídeo educativo con texto bilingüe: gracias a su capacidad de generar texto en inglés y chino, se pueden crear vídeos explicativos con rótulos integrados para audiencias de ambos idiomas.
- Investigación académica en generación de vídeo: al ser un modelo abierto con licencia Apache 2.0 y bajo requisito de VRAM, es adecuado para laboratorios con recursos limitados que quieran experimentar con técnicas de difusión para vídeo.
- Generación de contenido para publicidad: creación de clips promocionales cortos a partir de eslóganes o descripciones de producto, con la ventaja de poder ejecutarse en estaciones de trabajo con GPUs consumer.
- Pruebas de concepto en desarrollo de videojuegos: generación de secuencias de vídeo pregrabadas o cinemáticas simples para prototipos, reduciendo la dependencia de artistas 3D en fases tempranas.
- Automatización de contenido para e-learning: producción de vídeos explicativos breves con texto en pantalla a partir de guiones, sin necesidad de equipos de grabación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card menciona que Wan2.1 "supera consistentemente a los modelos open-source existentes y a las soluciones comerciales de vanguardia en múltiples benchmarks", pero no se proporcionan cifras concretas en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 8,19 GB para el modelo T2V-1.3B (según la model card, sin técnicas de cuantización).
- GPU recomendadas: RTX 4090 (genera un vídeo de 5 segundos a 480P en aproximadamente 4 minutos sin optimización). Compatible con "casi todas las GPUs de consumo" según la model card.
- Cabe en GPUs consumer: sí, siempre que tengan al menos 8,19 GB de VRAM (por ejemplo, RTX 3060 Ti, RTX 3070, RTX 4060 Ti, RTX 4070, RTX 4080, RTX 4090).
- Opciones de despliegue: la model card menciona inferencia multi-GPU para los modelos 14B y 1.3B, y un demo Gradio. La integración con diffusers está pendiente según la model card (aunque el tag de la librería es diffusers). No se mencionan vLLM, llama.cpp, Ollama ni TGI, ya que no es un LLM.
- Latencia y throughput: 4 minutos para un vídeo de 5 segundos a 480P en RTX 4090 (sin optimización). No se proporcionan datos de throughput para otras GPUs.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/Resolucion | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Wan2.1-T2V-1.3B | 1.418.996.800 | 480P (720P inestable) | No disponible | Apache 2.0 | Hugging Face, ModelScope |
| Wan2.1-T2V-14B | 14B (aproximado) | 480P y 720P | No disponible | Apache 2.0 | Hugging Face, ModelScope |
| Wan2.1-I2V-14B-480P | 14B (aproximado) | 480P | No disponible | Apache 2.0 | Hugging Face, ModelScope |
| Wan2.1-I2V-14B-720P | 14B (aproximado) | 720P | No disponible | Apache 2.0 | Hugging Face, ModelScope |

No se dispone de información sobre otros modelos comparables de la misma categoría (text-to-video de ~1.3B parámetros) en la información proporcionada. La comparativa se limita a las variantes de la propia suite Wan2.1.

## Limitaciones y advertencias

- El modelo de 1.3B está entrenado principalmente para 480P; aunque puede generar 720P, los resultados son generalmente menos estables, por lo que se recomienda 480P para un rendimiento óptimo.
- No se han publicado datos sobre sesgos conocidos, riesgo de alucinación visual o limitaciones idiomáticas más allá de los idiomas soportados (en, zh).
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar que los pesos y el código cumplan con las condiciones (no se especifican restricciones adicionales en la información disponible).
- El repositorio es una copia subida por el usuario AAASFASD, no el repositorio oficial de Wan-AI; se recomienda acudir al repositorio original para obtener la versión mantenida y actualizada.
- La integración con diffusers está pendiente según la model card (aunque el tag de la librería es diffusers), lo que puede requerir el uso del código de inferencia del repositorio GitHub original.
- No se proporcionan datos sobre latencia en GPUs distintas de la RTX 4090, ni sobre el rendimiento con cuantización.
- El modelo no es un LLM: no soporta tool calling, agentes ni razonamiento multi-step en el sentido de los modelos de lenguaje.

## Enlaces

- Hugging Face (copia del usuario): https://huggingface.co/AAASFASD/Wan2.1-T2V-1.3B
- Hugging Face (modelo original): https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B
- GitHub: https://github.com/Wan-Video/Wan2.1
- Hugging Face organización Wan-AI: https://huggingface.co/Wan-AI/
- ModelScope: https://modelscope.cn/organization/Wan-AI
- Blog: https://wanxai.com
- Discord: https://discord.gg/p5XbdQV7
- Paper: no disponible (marcado como "Coming soon" en la model card)
