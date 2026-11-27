# Bradley2026/Wan2.1-T2V-1.3B

## Resumen

Wan2.1-T2V-1.3B es el modelo de generación de vídeo a partir de texto (text-to-video) de menor tamaño de la familia Wan2.1, desarrollada por el equipo Wan-Video (Alibaba). Con 1.418.996.800 parámetros, está diseñado para ejecutarse en GPUs de consumo: requiere aproximadamente 8,19 GB de VRAM para inferencia, lo que lo hace compatible con prácticamente cualquier GPU consumer moderna. Genera vídeos de 5 segundos a 480P en unos 4 minutos en una RTX 4090 sin técnicas de optimización como cuantización.

El modelo forma parte de una suite más amplia que incluye variantes de 14B para text-to-video e image-to-video, así como capacidades de edición de vídeo, text-to-image y video-to-audio. Una de sus innovaciones destacadas es la capacidad de generar texto legible tanto en chino como en inglés dentro de los vídeos, algo poco habitual en modelos de esta categoría. Emplea el VAE propietario Wan-VAE, capaz de codificar y decodificar vídeo 1080P de cualquier duración preservando la información temporal.

Este repositorio concreto (Bradley2026/Wan2.1-T2V-1.3B) es una réplica del modelo oficial Wan-AI/Wan2.1-T2V-1.3B publicada bajo licencia Apache 2.0, con 0 descargas y 0 likes en el momento de la consulta, lo que sugiere que se trata de una copia de terceros y no del repositorio canónico. Para uso en producción se recomienda acudir al repositorio oficial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión para generación de vídeo (text-to-video), con VAE temporal (Wan-VAE) |
| Parametros totales | 1.418.996.800 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de difusión, no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería diffusers) |
| Resolución de salida | 480P recomendado; 720P posible pero menos estable |
| Duración de vídeo | 5 segundos (referencia en model card) |
| VRAM de inferencia | ~8,19 GB |

## Arquitectura y entrenamiento

Wan2.1-T2V-1.3B es un modelo de difusión para generación de vídeo que opera sobre un espacio latente comprimido mediante Wan-VAE, un VAE temporal propietario capaz de codificar y decodificar vídeo 1080P de cualquier longitud preservando la coherencia temporal. La arquitectura exacta (número de bloques, tipo de atención, mecanismo de difusión) no se detalla en la información disponible.

El número de tokens de entrenamiento, la composición del dataset, la resolución de entrenamiento y si se aplicaron técnicas de RLHF/DPO o post-entrenamiento no están disponibles en la información proporcionada. La model card menciona que el modelo de 1.3B puede generar 720P, pero que el entrenamiento a esa resolución es limitado y los resultados son menos estables que a 480P, por lo que se recomienda 480P. La integración con Diffusers y ComfyUI aparecía como pendiente en la lista de tareas de la model card en el momento de publicación.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) a 480P y 720P, con 5 segundos de duración de referencia.
- Generación de texto visual legible en chino e inglés dentro de los vídeos, capacidad poco común en modelos de vídeo.
- Soporte de la suite Wan2.1 (no necesariamente de este checkpoint concreto) para image-to-video, edición de vídeo, text-to-image y video-to-audio.
- Codificación y decodificación de vídeo 1080P de cualquier duración mediante Wan-VAE, preservando información temporal.
- Compatibilidad con GPUs de consumo gracias a su bajo requisito de VRAM (~8,19 GB).
- Idiomas: inglés y chino.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso (no aplica a un modelo de difusión de vídeo).

## Casos de uso

- **Prototipado rápido de vídeo en estaciones de trabajo con GPU consumer**: con ~8,19 GB de VRAM, el modelo se puede ejecutar en una RTX 4090 o similar para generar clips de 5 segundos a 480P en aproximadamente 4 minutos, lo que permite iterar sobre prompts sin infraestructura de datacenter.
- **Generación de clips para redes sociales y marketing**: creación de vídeos cortos de 5 segundos a 480P a partir de descripciones textuales, adecuados para formatos de redes sociales donde la resolución no es crítica.
- **Investigación académica en generación de vídeo con recursos limitados**: equipos universitarios sin clústeres de GPUs pueden usar el modelo como base para experimentos de difusión de vídeo, fine-tuning o evaluación de técnicas de muestreo.
- **Generación de texto visual bilingüe en vídeo**: útil para crear contenido promocional o educativo con rótulos legibles en inglés o chino, aprovechando la capacidad de generación de texto del modelo.
- **Creación de storyboards animados**: generación de clips cortos para previsualizar escenas antes de producir vídeo final, integrable en flujos de preproducción.
- **Base para fine-tuning especializado**: al ser un modelo pequeño (1.3B) con licencia Apache 2.0, sirve como punto de partida para ajustar dominios concretos (estilos visuales, productos, animación) con costes de cómputo moderados.
- **Generación de material para datasets sintéticos de vídeo**: producción de clips sintéticos etiquetados para entrenar otros modelos de visión o de vídeo.

## Benchmarks y rendimiento

La model card afirma que Wan2.1 supera a modelos open source existentes y a soluciones comerciales en múltiples benchmarks, pero no se proporcionan tablas numéricas de resultados (MMLU, VBench, FVD u otras métricas) en la información disponible.

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: ~8,19 GB para el T2V-1.3B en inferencia, según la model card.
- **GPU recomendadas**: RTX 4090 (referencia explícita: 5 segundos a 480P en ~4 minutos sin optimización). Compatible con "casi todas las GPUs de consumo" según el autor.
- **Cabe en GPU consumer**: sí, en GPUs con al menos ~8-9 GB de VRAM (RTX 3060 Ti/3070/4060 Ti 8 GB en adelante, con margen; RTX 3080/3090/4070/4080/4090).
- **Opciones de despliegue**: Diffusers (librería declarada), scripts de inferencia del repositorio oficial Wan-Video/Wan2.1, demo Gradio incluida en el repo oficial. La integración con ComfyUI figuraba como pendiente en la model card.
- **Latencia y throughput**: ~4 minutos por vídeo de 5 segundos a 480P en RTX 4090 sin cuantización. No se dispone de datos de throughput para otras GPUs.
- **Multi-GPU**: el repositorio oficial incluye código de inferencia multi-GPU para los modelos 14B y 1.3B.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion | Contexto/duracion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Wan2.1-T2V-1.3B | 1.419 M | 480P (720P inestable) | 5 s | Apache 2.0 | Hugging Face, ModelScope |
| Wan2.1-T2V-14B | 14B (no confirmado en detalle) | 480P y 720P | no disponible | Apache 2.0 | Hugging Face, ModelScope |
| Wan2.1-I2V-14B-480P | 14B (no confirmado en detalle) | 480P | no disponible | Apache 2.0 | Hugging Face, ModelScope |
| Wan2.1-I2V-14B-720P | 14B (no confirmado en detalle) | 720P | no disponible | Apache 2.0 | Hugging Face, ModelScope |

No se dispone en la información proporcionada de datos comparativos con modelos de otros desarrolladores (por ejemplo, variantes de vídeo de Stable Diffusion, HunyuanVideo u otros), ni de métricas cuantitativas que permitan una comparación objetiva de rendimiento.

## Limitaciones y advertencias

- **Repositorio no oficial**: este checkpoint (Bradley2026/Wan2.1-T2V-1.3B) es una réplica con 0 descargas y 0 likes; para producción conviene usar el repositorio oficial Wan-AI/Wan2.1-T2V-1.3B.
- **Resolución 720P inestable**: el propio autor advierte que el entrenamiento a 720P es limitado y los resultados son menos estables que a 480P; se recomienda 480P.
- **Duración limitada**: los ejemplos y referencias apuntan a clips de 5 segundos; no se documenta generación de vídeo largo de forma nativa.
- **Idiomas limitados**: solo inglés y chino; el rendimiento en otros idiomas no está documentado.
- **Riesgo de alucinación visual**: como todo modelo generativo de difusión, puede producir contenido incoherente, artefactos temporales o texto mal formado, especialmente en escenas complejas o a 720P.
- **Sesgos**: no se documentan sesgos específicos, pero al ser un modelo entrenado con datos web es probable que reproduzca sesgos de género, culturales y geográficos; no hay información sobre filtrado o mitigación.
- **Licencia Apache 2.0**: permite uso comercial, pero el usuario es responsable del cumplimiento normativo (derechos de imagen, contenido generado, marcas) y de las condiciones de los datasets subyacentes, no detalladas.
- **Integraciones incompletas**: Diffusers y ComfyUI figuraban como pendientes en la model card; verificar compatibilidad antes de integrar en pipelines.
- **Sin datos de benchmarks públicos**: la afirmación de "SOTA" no va acompañada de tablas numéricas en la información disponible, por lo que no es verificable de forma independiente aquí.

## Enlaces

- Repositorio Hugging Face (esta copia): https://huggingface.co/Bradley2026/Wan2.1-T2V-1.3B
- Repositorio oficial del modelo: https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B
- Organización Wan-AI en Hugging Face: https://huggingface.co/Wan-AI/
- GitHub oficial: https://github.com/Wan-Video/Wan2.1
- ModelScope (T2V-1.3B): https://www.modelscope.cn/models/Wan-AI/Wan2.1-T2V-1.3B
- ModelScope (organización): https://modelscope.cn/organization/Wan-AI
- Blog: https://wanxai.com
- Discord: https://discord.gg/p5XbdQV7
- Paper: anunciado como "coming soon", sin enlace disponible
- Demo de vídeo: https://cloud.video.taobao.com/vod/Jth64Y7wNoPcJki_Bo1ZJTDBvNjsgjlVKsNs05Fqfps.mp4
