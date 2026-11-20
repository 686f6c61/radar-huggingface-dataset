# SeeSee21/Z-Anime

## Resumen
Z-Anime es un ajuste fino completo (full fine-tune, no una fusión de LoRAs) del modelo de difusión Z-Image Base de Alibaba, especializado en generación de imágenes de estilo anime. Lo desarrolla SeeSee21 y se distribuye bajo licencia Apache-2.0. Se apoya en la arquitectura S3-DiT (Single-Stream Diffusion Transformer) de 6.154.908.736 parámetros del modelo base Tongyi-MAI/Z-Image, heredando su diversidad compositiva, su control mediante prompts negativos y un techo alto de ajuste fino.

El repositorio publica una familia completa de variantes: Base (máxima calidad, 28-50 pasos con CFG 3-5), Distill-8-Step (8 pasos, CFG 1.0) y Distill-4-Step (4 pasos, CFG 1.0), todas con sampler `euler_ancestral` y scheduler `beta`. Se ofrecen en BF16 (~12 GB), FP8 (~6 GB), GGUF (Q8_0 ~6,73 GB y Q4_K_S ~4,2 GB), checkpoints AIO de un solo archivo y carpeta Diffusers lista para `from_pretrained()`.

Su relevancia actual radica en que permite generar anime de alta calidad en GPUs de consumo con 8 GB de VRAM, con soporte de prompts en lenguaje natural (no listas de tags), diversidad alta de personajes y composiciones, y una base sólida para entrenar LoRAs adicionales. El repositorio ocupa 202,5 GB e incluye VAE y text encoder separados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | S3-DiT (Single-Stream Diffusion Transformer) |
| Parametros totales | 6.154.908.736 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo text-to-image; no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | BF16, FP8, GGUF Q8_0, GGUF Q4_K_S |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16/FP8), GGUF, checkpoints AIO, carpeta Diffusers |

## Arquitectura y entrenamiento
Z-Anime se construye sobre Z-Image Base de Tongyi-MAI, un diffusion transformer de flujo único (S3-DiT) con 6.154.908.736 parámetros. El autor lo describe como un full fine-tune y no como una fusión de LoRAs, lo que implica que todos los pesos del modelo han sido reentrenados sobre el dominio anime. El modelo conserva el soporte completo de prompts negativos del base y su capacidad de control compositivo.

No se especifican en la información disponible el número de tokens de imagen, la composición exacta del dataset de entrenamiento, ni si se emplearon técnicas de RLHF/DPO o preference tuning. Sí se documenta la existencia de variantes destiladas (8 y 4 pasos) que reducen el número de pasos de muestreo manteniendo CFG 1.0, lo que sugiere un proceso de destilación por pasos sobre el modelo Base. El pipeline de inferencia recomendado es `euler_ancestral` con scheduler `beta`.

## Capacidades
- Generación de imágenes text-to-image con estética anime, incluyendo personajes, poses, composiciones y layouts variados.
- Prompting en lenguaje natural: el autor indica que funciona mejor con descripciones ricas que con listas de tags.
- Soporte completo de prompt negativo, heredado del modelo base.
- Variantes destiladas para generación rápida: 8 pasos y 4 pasos con CFG 1.0.
- Capacidad parcial NSFW (según indica el autor).
- Base apta para entrenamiento posterior de LoRAs.
- Compatibilidad con ComfyUI mediante workflow incluido (`workflows/Z-Anime-Workflow-v1.json`).
- Inferencia en CPU y GPUs AMD a través de las variantes GGUF.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo thinking (no aplica a un modelo de difusión).

## Casos de uso
- Ilustración de personajes para proyectos indie: el modelo genera personajes anime coherentes con descripciones en lenguaje natural, útil para prototipado rápido de arte conceptual con la variante Distill-8-Step.
- Generación por lotes en producción: la variante Distill-4-Step con CFG 1.0 permite iterar y producir lotes grandes en pocos pasos, reduciendo coste computacional en pipelines automatizados.
- Render final de alta calidad: la variante Base con 28-50 pasos y CFG 3-5 se emplea cuando se necesita máxima fidelidad en la imagen final, por ejemplo para portadas o key art.
- Despliegue en hardware limitado: las variantes GGUF Q4_K_S (~4,2 GB) y Q8_0 (~6,73 GB) permiten ejecutar el modelo en GPUs con 8 GB de VRAM, en CPU o en GPUs AMD, ampliando el acceso fuera del ecosistema NVIDIA.
- Integración en ComfyUI: el workflow incluido permite a artistas y estudios encadenar el modelo con upscalers, controlnets u otros nodos dentro de una interfaz visual.
- Base para fine-tuning de estilo o personaje: al ser un full fine-tune y no una fusión de LoRAs, sirve como punto de partida para entrenar LoRAs de personajes concretos o estilos de estudio.
- Generación de assets para videojuegos o cómics: la diversidad compositiva del base facilita producir sprites, fondos o viñetas con variedad de encuadres.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada: ~12 GB en BF16, ~6 GB en FP8, ~6,73 GB en GGUF Q8_0 y ~4,2 GB en GGUF Q4_K_S.
- El autor indica compatibilidad con GPUs de 8 GB de VRAM.
- GPUs recomendadas: no se especifican modelos concretos (A100, H100, RTX 4090) en la información disponible; por tamaño, cualquier GPU consumer con 8 GB o más debería poder ejecutar las variantes FP8/GGUF.
- Cabe en GPU consumer: sí, según el autor, con 8 GB de VRAM usando FP8 o GGUF.
- Opciones de despliegue: ComfyUI (workflow incluido), Diffusers (`from_pretrained()`), y variantes GGUF para flujos compatibles con llama.cpp/CPU y AMD.
- Latencia y throughput: no disponibles; dependen de la variante (4, 8 o 28-50 pasos) y del hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Z-Anime (SeeSee21) | 6.154.908.736 | no aplica | Apache-2.0 | Hugging Face, Civitai | Full fine-tune anime sobre Z-Image Base; variantes Base, Distill-8, Distill-4, GGUF y AIO |
| Tongyi-MAI/Z-Image (base) | 6B (S3-DiT) | no aplica | Apache-2.0 | Hugging Face | Modelo base generalista; Z-Anime parte de él |
| Alternativas anime de la misma categoría | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

## Limitaciones y advertencias
- El modelo está entrenado y etiquetado únicamente para inglés (`en`); el rendimiento con prompts en castellano no está documentado.
- Capacidad NSFW parcial: requiere moderación y filtrado en entornos de producción, y puede no cumplir políticas de plataformas de terceros.
- Riesgo de sesgos y de alucinación visual (anatomía incorrecta, artefactos en manos, texto o detalles finos), inherente a los modelos de difusión; no se documentan evaluaciones específicas.
- Aunque la licencia es Apache-2.0, conviene verificar las condiciones del modelo base Tongyi-MAI/Z-Image y de los assets (VAE, text encoder) incluidos en el repositorio.
- El repositorio ocupa 202,5 GB, por lo que la descarga completa requiere espacio en disco considerable; se recomienda descargar solo la variante necesaria.
- Las variantes destiladas (4 y 8 pasos) priorizan velocidad sobre calidad máxima; para resultados finales se recomienda la variante Base.
- No hay datos publicados de benchmarks que permitan comparar objetivamente su calidad frente a otros modelos anime.

## Enlaces
- Hugging Face: https://huggingface.co/SeeSee21/Z-Anime
- Modelo base: https://huggingface.co/Tongyi-MAI/Z-Image
- Perfil del autor en Hugging Face: https://huggingface.co/SeeSee21
- Civitai: https://civitai.red/models/2483351
- YouTube del autor: https://www.youtube.com/@SeeSee-AI
- GitHub del autor: https://github.com/seesee75-commits
