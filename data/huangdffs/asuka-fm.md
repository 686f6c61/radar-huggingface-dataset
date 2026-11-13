# huangdffs/asuka-fm

## Resumen
Asuka-fm es un modelo de generación de imágenes texto-a-imagen (text-to-image) especializado en ilustración anime, desarrollado por el usuario huangdffs y publicado en Hugging Face bajo licencia OpenRAIL++. Utiliza una arquitectura DiT (Diffusion Transformer) de doble flujo (dual-stream DiT) con entrenamiento mediante flow matching y rectified flow, lo que lo sitúa en la estirpe de los modelos de difusión modernos basados en transformers en lugar de las UNet clásicas.

El modelo está afinado sobre datasets de Danbooru curados (curated-danbooru-2026) en resoluciones de 256 px y 512 px con el VAE de Flux2, lo que indica un pipeline de entrenamiento orientado a la estética anime y a la fidelidad de etiquetas tipo booru. El repositorio ocupa 1,7 GB, un tamaño compatible con un modelo de escala media, aunque la model card no detalla el número exacto de parámetros.

La relevancia actual del modelo radica en su enfoque en flow matching y arquitectura DiT, técnicas que han desplazado a los modelos de difusión clásicos por su eficiencia de muestreo y calidad, aplicadas aquí a un dominio vertical muy concreto: personajes y estética anime con prompting booru. No obstante, la información pública es muy limitada y no se han publicado benchmarks ni especificaciones detalladas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) de doble flujo (dual-stream DiT) con flow matching / rectified flow |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible (no aplica en generación de imagen; resolución de entrenamiento 256 px y 512 px) |
| Tipos de cuantizacion | no disponible (pesos en PyTorch/diffusers; cuantización GGUF no confirmada) |
| Idiomas soportados | no disponible (prompts en inglés, etiquetas tipo booru) |
| Licencia | OpenRAIL++ |
| Formato de pesos | safetensors (formato nativo de diffusers, según el tamaño del repo de 1,7 GB) |

## Arquitectura y entrenamiento
El modelo emplea una arquitectura Diffusion Transformer con esquema de doble flujo (dual-stream DiT), en la que dos ramas de procesamiento interactúan mediante atención cruzada, un diseño habitual en modelos recientes de generación de imagen condicionada por texto. El entrenamiento se basa en flow matching y rectified flow, técnicas que aprenden un campo vectorial continuo entre ruido y datos en lugar de la predicción de ruido clásica, lo que permite trayectorias de muestreo más rectas y, en teoría, menos pasos de inferencia.

Los datos de entrenamiento provienen de datasets de Danbooru curados (aipracticecafe-mirror/curated-danbooru-2026) en dos resoluciones, 256 px y 512 px, con el VAE de Flux2. Esto sugiere un enfoque de entrenamiento multi-resolución y un dominio fuertemente orientado a ilustración anime con etiquetado booru. La model card no especifica el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO. La etiqueta "sprint" en los tags podría referirse a una técnica de entrenamiento o muestreo acelerado, pero no se detalla.

## Capacidades
- Generación de imágenes texto-a-imagen con estética anime e ilustración, condicionada por prompts en formato booru (etiquetas separadas por comas).
- Fidelidad a personajes concretos mediante etiquetas de franquicia y personaje (por ejemplo, "souryuu asuka langley, neon genesis evangelion").
- Control de composición mediante etiquetas de encuadre, pose, vestuario y fondo ("cowboy shot", "contrapposto", "simple background").
- Soporte de etiquetas de calidad y estética ("masterpiece", "absurdres", "very aesthetic") que el modelo parece reconocer según los ejemplos de la model card.
- Generación a resoluciones de 256 px y 512 px según el entrenamiento declarado.
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso, visión de entrada, audio ni modo thinking; es un modelo puramente generativo de imagen.

## Casos de uso
- Ilustración de personajes anime para proyectos personales: el modelo puede generar retratos y escenas de personajes conocidos usando etiquetas de personaje y franquicia, adecuado por su entrenamiento específico en Danbooru.
- Creación de arte conceptual para fan art y cómics: permite iterar poses, vestuario y encuadres mediante etiquetas booru, lo que encaja con flujos de trabajo de artistas que ya usan ese vocabulario.
- Generación de avatares y retratos para comunidades y foros: con prompts de "portrait", "looking at viewer" y fondos simples, produce imágenes listas para usar como avatar.
- Prototipado rápido de personajes originales: combinando etiquetas de rasgos (color de pelo, ojos, vestuario) se pueden explorar variantes de diseño antes de un trabajo manual.
- Producción de ilustraciones para mods y proyectos derivados de anime: la fidelidad a franquicias concretas lo hace útil para material promocional no oficial, siempre respetando la licencia OpenRAIL++.
- Generación de fondos y escenas simples para maquetas y presentaciones: con etiquetas de "simple background" o "white background" se obtienen imágenes limpias para composición posterior.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma oficial; con un repositorio de 1,7 GB en precisión completa, la inferencia en fp16 requeriría del orden de 4-6 GB de VRAM, aunque es una estimación y no un dato confirmado.
- GPU recomendadas: no disponible; por tamaño, cabría esperar funcionamiento en GPUs consumer de gama media-alta (RTX 3060 12 GB, RTX 4070, RTX 4090), pero no está verificado.
- ¿Cabe en GPU consumer? Probablemente sí en GPUs con 8 GB o más, dado el tamaño del repo, aunque no hay confirmación del autor.
- Opciones de despliegue: al ser un modelo de diffusers, es desplegable con la librería `diffusers` de Hugging Face; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a LLM, no a difusión).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares
No se dispone de datos de rendimiento ni de especificaciones detalladas del modelo que permitan una comparación rigurosa. Se indican alternativas de la misma categoría (text-to-image anime con licencia abierta) sin datos comparativos verificados:

| Modelo | Parametros | Contexto/resolución | Licencia | Disponibilidad |
|---|---|---|---|---|
| Asuka-fm | no disponible | 256/512 px | OpenRAIL++ | Hugging Face |
| Animagine XL | no disponible en la información | no disponible | CreativeML OpenRAIL++-M | Hugging Face |
| Pony Diffusion | no disponible en la información | no disponible | Fair AI Public License | Hugging Face |

No disponible información de benchmarks comparativos.

## Limitaciones y advertencias
- La model card no documenta sesgos conocidos; como modelo entrenado en Danbooru, es previsible que herede sesgos de ese dataset (representación, estilización y contenido para adultos si el dataset lo incluye), aunque no está confirmado.
- Riesgo de alucinación visual: puede generar anatomía incorrecta, manos deformes o incoherencias en composiciones complejas, algo habitual en modelos de difusión de esta escala.
- Limitación de idioma: los prompts de ejemplo están en inglés con etiquetas booru; no se documenta soporte multilingüe ni calidad con prompts en castellano.
- Resolución limitada a 256/512 px según el entrenamiento declarado; no se documenta generación a resoluciones superiores.
- Licencia OpenRAIL++: permite uso comercial con restricciones de uso (no dañino, no discriminatorio); conviene revisar los términos completos antes de producción.
- Información pública muy escasa: sin benchmarks, sin número de parámetros y sin guía de despliegue, lo que dificulta evaluar su idoneidad en producción.
- Riesgo de derechos de autor: el modelo está entrenado para reproducir personajes de franquicias concretas; el uso comercial de esas representaciones puede infringir derechos de terceros independientemente de la licencia del modelo.

## Enlaces
- Hugging Face: https://huggingface.co/huangdffs/asuka-fm
- Paper referenciado (arXiv:2606.11289): no disponible enlace directo en la información proporcionada
- Paper referenciado (arXiv:2304.12526): no disponible enlace directo en la información proporcionada
- Paper referenciado (arXiv:2509.06068): no disponible enlace directo en la información proporcionada
- Dataset: aipracticecafe-mirror/curated-danbooru-2026-256px-flux2-vae (Hugging Face)
- Dataset: aipracticecafe/curated-danbooru-2026-512px-flux2-vae (Hugging Face)
- Dataset: aipracticecafe/curated-danbooru-2026 (Hugging Face)
