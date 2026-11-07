# SeeSee21/Z-Anime

## Resumen

Z-Anime es un ajuste fino completo (full fine-tune) del modelo de difusión Z-Image Base de Alibaba, especializado en la generación de imágenes de estilo anime. Lo desarrolla el usuario SeeSee21 y se publica bajo licencia Apache 2.0. A diferencia de las adaptaciones basadas en LoRA, se trata de un reentrenamiento completo de los pesos sobre la arquitectura S3-DiT (Single-Stream Diffusion Transformer) de 6.150 millones de parámetros, lo que le permite heredar la diversidad y el control del modelo original adaptándolos al dominio anime.

El modelo se distribuye como una familia de variantes: Base (máxima calidad), Distill-8-Step y Distill-4-Step (destiladas para inferencia rápida con CFG 1.0), además de cuantizaciones GGUF (Q8_0 y Q4_K_S) y checkpoints AIO que integran modelo, VAE y codificador de texto en un único archivo. El repositorio incluye también la carpeta en formato Diffusers para su uso con `from_pretrained()`.

Su relevancia actual radica en que ofrece generación de imágenes anime de alta calidad en GPUs de consumo con 8 GB de VRAM, con soporte de prompt en lenguaje natural (no listas de etiquetas), compatibilidad con ComfyUI y una base sólida para entrenar LoRAs adicionales. El repositorio ocupa 202,5 GB e incluye todos los formatos (BF16, FP8, GGUF, AIO).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | S3-DiT (Single-Stream Diffusion Transformer) |
| Parámetros totales | 6.154.908.736 (~6,15 B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo text-to-image) |
| Tipos de cuantización | BF16, FP8, GGUF (Q8_0, Q4_K_S) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16/FP8), GGUF, formato Diffusers, checkpoints AIO |

## Arquitectura y entrenamiento

Z-Anime se construye sobre la arquitectura S3-DiT de Z-Image Base, un transformer de difusión de flujo único con aproximadamente 6,15 mil millones de parámetros. El modelo emplea un codificador de texto Qwen 3 de 4B (`qwen_3_4b.safetensors`) y un VAE dedicado (`ae.safetensors`), ambos distribuidos en el repositorio. El ajuste se realizó como un full fine-tune sobre los pesos del modelo base, no como una fusión de LoRAs, lo que según el autor preserva la diversidad, la controlabilidad y el soporte completo de negative prompts del modelo original.

La familia incluye variantes destiladas (8 pasos y 4 pasos) obtenidas a partir de Z-Anime Base, que reducen el número de pasos de muestreo a 8 o 4 con CFG 1.0. No se detalla en la información disponible el volumen de tokens, la composición del dataset de entrenamiento ni si se emplearon técnicas de RLHF o DPO. El autor indica que el modelo es un buen punto de partida para entrenamiento posterior de LoRAs.

## Capacidades

- Generación de imágenes text-to-image con estética anime, incluyendo personajes, poses, composiciones y layouts diversos.
- Soporte de prompting en lenguaje natural: funciona mejor con descripciones detalladas que con listas de etiquetas.
- Soporte completo de negative prompts en la variante Base (efecto limitado en las variantes destiladas).
- Inferencia rápida mediante variantes destiladas: 8 pasos y 4 pasos con CFG 1.0.
- Compatibilidad con ComfyUI, tanto en variantes estándar como en checkpoints AIO de archivo único.
- Compatibilidad con el pipeline de Diffusers (`ZImagePipeline.from_pretrained()`).
- Capacidad parcial de contenido NSFW según el autor.
- Capacidad de servir como base para entrenamiento de LoRAs adicionales.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo thinking (es un modelo de difusión de imagen).

## Casos de uso

- Ilustración anime para producción editorial: la variante Base con 28-50 pasos y CFG 3.0-5.0 permite renders finales de alta calidad con control fino mediante negative prompts, adecuada para portadas, ilustraciones de libros y material promocional.
- Iteración rápida de conceptos: la variante Distill-4-Step con CFG 1.0 permite generar borradores en 4 pasos, lo que acelera la exploración de ideas antes de un render final con la variante Base.
- Generación por lotes en GPUs de consumo: las cuantizaciones GGUF Q4_K_S (~4,2 GB) y Q8_0 (~6,73 GB) permiten ejecutar el modelo en equipos con 8 GB de VRAM o incluso en CPU, facilitando pipelines de generación masiva en estaciones de trabajo modestas.
- Integración en flujos de ComfyUI: los checkpoints AIO (modelo + VAE + codificador de texto en un solo archivo) simplifican el despliegue en nodos de ComfyUI para artistas y estudios que trabajan con grafos personalizados.
- Entrenamiento de LoRAs de personaje o estilo: al ser un full fine-tune sobre Z-Image Base, sirve como base estable para ajustes posteriores con LoRA orientados a personajes concretos o estilos de autor.
- Prototipado en Python: la carpeta Diffusers permite integrar la generación en scripts y servicios mediante `ZImagePipeline.from_pretrained()`, útil para investigación y experimentación con pipelines propios.
- Creación de contenido para comunidades y fan art: la diversidad de personajes y composiciones, junto con la capacidad parcial NSFW, cubre casos de uso de comunidades creativas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: ~12 GB para BF16, ~6 GB para FP8, ~6,73 GB para GGUF Q8_0 y ~4,2 GB para GGUF Q4_K_S.
- El autor indica compatibilidad con GPUs de 8 GB de VRAM en las variantes FP8 y GGUF.
- GPUs recomendadas: no se especifican modelos concretos (A100, H100, RTX 4090, etc.) en la información disponible; por tamaño, una RTX 3060 de 12 GB o superior encaja en BF16, y GPUs de 8 GB en FP8/GGUF.
- Cabe en GPU de consumo: sí, según el autor, con 8 GB de VRAM en FP8 y GGUF; las variantes GGUF también permiten inferencia en CPU.
- Opciones de despliegue: ComfyUI (variantes estándar y AIO), Diffusers (`ZImagePipeline`), backends compatibles con GGUF (llama.cpp y similares para CPU/AMD).
- Latencia y throughput: no disponibles; las variantes destiladas reducen el muestreo a 8 o 4 pasos frente a los 28-50 pasos de la variante Base.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Z-Anime | ~6,15 B | no aplica (text-to-image) | sin benchmarks publicados | Apache 2.0 | Hugging Face, ModelScope |
| Z-Image Base (Tongyi-MAI) | ~6 B (arquitectura S3-DiT) | no aplica | no disponible en la información | no disponible en la información | Hugging Face |
| Alternativas anime de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- Sesgos: no documentados por el autor; al ser un modelo entrenado para anime, puede reproducir estereotipos visuales propios del dominio.
- Riesgo de alucinación visual: como todo modelo de difusión, puede generar anatomía incorrecta, texto ilegible o detalles incoherentes, especialmente con CFG alto.
- Las variantes destiladas tienen efecto limitado de negative prompts y no deben superar CFG 1.5, lo que reduce el control fino.
- En la variante Base, CFG por encima de 9.0 no está recomendado por riesgo de sobresaturación.
- Idioma: el modelo está etiquetado únicamente para inglés; el rendimiento con prompts en castellano no está documentado.
- Capacidad parcial NSFW: requiere moderación y políticas de uso en entornos de producción.
- Licencia Apache 2.0: permite uso comercial, pero debe verificarse la licencia del modelo base Z-Image y de los componentes (VAE, codificador de texto Qwen 3 4B) por separado.
- El repositorio ocupa 202,5 GB, lo que exige espacio de almacenamiento considerable si se descargan todas las variantes.
- No se documentan datos de entrenamiento, lo que limita la evaluación de riesgos de sesgo y de propiedad intelectual.

## Enlaces

- Hugging Face: https://huggingface.co/SeeSee21/Z-Anime
- ModelScope: https://www.modelscope.cn/models/hf/SeeSee21-Z-Anime
- Modelo base: https://huggingface.co/Tongyi-MAI/Z-Image
