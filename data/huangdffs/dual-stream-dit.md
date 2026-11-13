# huangdffs/dual-stream-dit

## Resumen

Asuka-FM es un modelo de difusión texto-a-imagen de tipo Diffusion Transformer (DiT) con arquitectura dual-stream, desarrollado por el usuario aipracticecafe y publicado en Hugging Face bajo el identificador huangdffs/dual-stream-dit. Con aproximadamente 200 millones de parámetros en el backbone y unos 230 millones adicionales en el codificador de texto, el modelo se entrenó desde cero en hardware de consumo (una única NVIDIA RTX 4090 durante unas 50 horas) empleando Flow Matching con muestreo de timesteps logit-normal, la técnica de aceleración SPRINT con eliminación estructurada de tokens y RoPE continuo normalizado por aspecto.

El modelo está especializado en ilustración anime y en la reproducción fiel de personajes, con control de cámara zero-shot (paneo y zoom) en tiempo de inferencia. Su relevancia radica en demostrar que un DiT compacto, entrenado con un presupuesto muy reducido y sobre un dataset curado de Danbooru (~337K muestras), puede alcanzar una calidad competitiva en su dominio frente a modelos mucho mayores, lo que lo convierte en una referencia para investigación en eficiencia de entrenamiento y en generación de arte anime.

La ficha se basa exclusivamente en la model card y los metadatos publicados; no se dispone de información adicional sobre benchmarks, idiomas o detalles completos de entrenamiento más allá de lo indicado por el autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Dual-Stream DiT (SPRINT-aligned, SwiGLU, Sandwich RMSNorm) |
| Parámetros totales | ~200M (backbone) + ~230M (codificador de texto) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | OpenRAIL++ |
| Formato de pesos | diffusers (safetensors, según librería diffusers) |

## Arquitectura y entrenamiento

El backbone es un Diffusion Transformer dual-stream con condicionamiento minimalista: en lugar de modulación AdaLN pesada por bloque, utiliza tokens de tiempo antepuestos, lo que reduce el coste paramétrico. Emplea normalización tipo sándwich (RMSNorm antes y después de atención y FFN) para estabilidad en bfloat16, y activaciones SwiGLU. La aceleración SPRINT aplica eliminación estructurada de parches 2x2 por grupos con una tasa de descarte del 75% durante el entrenamiento, y el modelo usa RoPE continuo normalizado por aspecto para manejar distintas relaciones de aspecto.

El objetivo de entrenamiento es Flow Matching condicional (rectified flow) con muestreo de timesteps logit-normal. Se entrenó desde cero sobre el dataset curado curated-danbooru-2026 (~337K muestras), en variantes de 256px y 512px con VAE Flux2, durante aproximadamente 50 horas en una RTX 4090. No se detalla en la información disponible si hubo RLHF, DPO ni la composición exacta del dataset más allá de su origen Danbooru curado.

## Capacidades

- Generación de imágenes texto-a-imagen especializada en arte anime e ilustración de personajes.
- Reproducción fiel de personajes conocidos (series como Evangelion u Oshi no Ko en los ejemplos de la model card).
- Alineación de prompt detallada mediante etiquetas estilo Danbooru (tags de personaje, ropa, pose, composición).
- Control de cámara zero-shot en inferencia: paneo y zoom.
- Soporte de múltiples personajes en una misma escena (prompts con "2girls" y atributos cruzados).
- Control de composición mediante etiquetas de encuadre (upper body, dutch angle, simple background).
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso ni modalidades adicionales (audio, vídeo).

## Casos de uso

- Generación de ilustraciones anime para prototipado rápido: el modelo produce arte de alta fidelidad en 512px con etiquetas Danbooru, adecuado para iterar conceptos antes de encargar arte final.
- Reproducción consistente de personajes en fan art: gracias a su alineación con tags de personaje y serie, permite generar variaciones de un mismo personaje con control de vestuario y pose.
- Creación de assets para videojuegos indie o novelas visuales: su tamaño compacto (~200M) permite ejecución local en GPU de consumo, integrable en pipelines de generación por lotes.
- Control de cámara en animática: el paneo y zoom zero-shot facilita generar fotogramas con movimiento de cámara coherente para previsualizaciones.
- Investigación en entrenamiento eficiente de DiT: sirve como referencia reproducible de Flow Matching + SPRINT entrenado en una sola RTX 4090, útil para experimentos académicos.
- Generación de escenas multi-personaje: soporta prompts con dos o más personajes y atributos diferenciados, útil para composiciones de grupo en ilustración.
- Filtrado y aumento de datasets anime: puede emplearse para generar variaciones etiquetadas que amplíen corpus de entrenamiento en dominios de ilustración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con ~200M de parámetros en el backbone y ~230M en el codificador de texto, la inferencia en precisión completa (bf16) requiere del orden de 1-2 GB para pesos, más overhead de activaciones y VAE.
- GPU recomendadas: el autor entrenó en una RTX 4090; para inferencia es suficiente una GPU de consumo moderna (RTX 3060 12 GB o superior) según el tamaño del modelo.
- Cabe en GPU de consumo: sí, por el tamaño compacto del backbone, aunque no se detallan requisitos oficiales.
- Opciones de despliegue: librería diffusers (pipeline text-to-image); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a difusión).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos de difusión de tamaño o tarea comparable.

## Limitaciones y advertencias

- Dominio restringido: entrenado sobre Danbooru curado, su rendimiento fuera del arte anime e ilustración puede degradarse notablemente.
- Riesgo de sesgos: el dataset de origen (Danbooru) puede contener sesgos de representación y estilos; no se documentan mitigaciones.
- Alucinación visual: como todo modelo generativo, puede producir anatomía incorrecta, texto ilegible o incoherencias en escenas complejas.
- Idiomas: no se especifican idiomas soportados; los prompts de ejemplo están en inglés con etiquetas Danbooru.
- Licencia OpenRAIL++: impone restricciones de uso (uso responsable, prohibición de usos dañinos); revisar los términos antes de uso comercial.
- Repositorio de gran tamaño (119.2 GB) por incluir múltiples variantes y datasets; requiere espacio de almacenamiento considerable.
- Sin benchmarks publicados ni métricas de calidad objetivas; la evaluación es cualitativa según la galería del autor.
- Fecha de creación en metadatos (2026-11-13) y referencias arXiv asociadas no verificables en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/huangdffs/dual-stream-dit
- Repositorio GitHub: https://github.com/deeplearningcafe/asuka-fm
- Dataset: https://huggingface.co/datasets/aipracticecafe/curated-danbooru-2026
- Paper de referencia (i1): https://arxiv.org/abs/2606.11289
- Paper adicional referenciado: https://arxiv.org/abs/2304.12526
- Paper adicional referenciado: https://arxiv.org/abs/2509.06068
