# deadman44/Z-Image_LoRA

## Resumen

Z-Image_LoRA es un conjunto de adaptadores LoRA (Low-Rank Adaptation) creados por el usuario deadman44 para el modelo de generación de imágenes Z-Image Turbo, un modelo de difusión de texto a imagen de código abierto. Estos LoRA están diseñados para refinar el estilo de salida del modelo base, con un enfoque particular en la generación fotorrealista de personajes y escenas cotidianas, evitando el aspecto "digital" típico de la IA. El repositorio incluye varias versiones (myjc, myjk, myjs, myjy) que se han ido publicando entre enero y junio de 2026, junto con flujos de trabajo recomendados para ComfyUI.

La relevancia de este proyecto radica en que permite a desarrolladores y artistas ajustar Z-Image Turbo sin necesidad de reentrenar el modelo completo, usando adaptadores ligeros que se integran fácilmente en pipelines existentes. El repositorio también proporciona un generador de prompts fotorrealistas (basado en un system prompt para Gemma) y demuestra resultados con análisis de detección de contenido generado por IA. Al ser un LoRA, no tiene parámetros propios significativos; su tamaño de 2,5 GB corresponde a los pesos de los adaptadores y archivos auxiliares.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Z-Image Turbo (modelo de difusión text-to-image) |
| Parametros totales | no disponible (LoRA, depende del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (aplica al text encoder, Qwen 3 4B) |
| Tipos de cuantizacion | safetensors (formato nativo) |
| Idiomas soportados | en (prompts en inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Z-Image_LoRA es un adaptador de tipo LoRA (Low-Rank Adaptation) que se aplica al modelo base Z-Image Turbo, un modelo de difusión de texto a imagen. El modelo base utiliza un text encoder Qwen 3 4B y un VAE específico (ae.safetensors), ambos disponibles en el repositorio de Comfy-Org. El LoRA modifica los pesos del modelo base para producir estilos concretos, como el fotorrealismo "orgánico" que se describe en la model card.

No se proporcionan detalles sobre el dataset de entrenamiento, el número de tokens o el proceso de ajuste (si se usó RLHF, DPO u otra técnica). La model card solo indica que hay varias versiones beta y alpha, lo que sugiere un desarrollo iterativo. El autor también recomienda el uso de un ControlNet (Z-Image-Turbo-Fun-Controlnet-Union-2.1) para tareas de redraw y upscale, lo que indica compatibilidad con arquitecturas de control adicionales.

## Capacidades

- Generación de imágenes fotorrealistas con énfasis en texturas naturales, iluminación plana y estética de "fotografía documental".
- Creación de personajes consistentes (estilo influencer) y escenas cotidianas sin poses forzadas.
- Compatibilidad con flujos de trabajo de ComfyUI, incluyendo redraw y upscale mediante ControlNet.
- Soporte para generación de prompts avanzados mediante un system prompt específico para Gemma (modelo de lenguaje).
- Integración con el modelo base Z-Image Turbo, que usa un text encoder Qwen 3 4B para entender prompts complejos.
- Capacidad de producir imágenes que superan detectores de contenido generado por IA (según pruebas del autor con TheHive AI).

## Casos de uso

- Creación de influencers virtuales: el LoRA permite generar personajes hiperrealistas con consistencia de estilo, ideal para campañas de marketing o redes sociales automatizadas.
- Fotografía de producto: el estilo "anti-cinematic" y la textura mate son adecuados para catálogos de productos que requieren un aspecto natural y sin retoques digitales.
- Ilustración editorial: la estética de "snapshot" (fotografía instantánea) puede usarse para ilustrar artículos o reportajes con un aire documental.
- Pruebas de concepto en diseño: los diseñadores pueden generar rápidamente variaciones de escenas cotidianas para moodboards o presentaciones.
- Entrenamiento de modelos personalizados: el repositorio incluye un trainer (en LoRA AI) que permite a otros usuarios crear sus propios LoRA base para Z-Image, ampliando el ecosistema.
- Investigación en detección de IA: los resultados del autor muestran que las imágenes generadas pueden evadir detectores, lo que es útil para estudiar las limitaciones de estas herramientas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas cuantitativas como FID, CLIP score o comparaciones con otros modelos. El único dato de rendimiento es la demostración cualitativa de que las imágenes generadas superan un detector de contenido IA (TheHive AI), pero sin cifras concretas.

## Requisitos de hardware

- VRAM estimada: no disponible, pero al ser un LoRA sobre Z-Image Turbo, se requiere la VRAM necesaria para el modelo base. Z-Image Turbo es un modelo de difusión de tamaño medio; se estima que necesita al menos 8-12 GB de VRAM en FP16, dependiendo de la resolución de salida.
- GPU recomendadas: no se especifican, pero por compatibilidad con ComfyUI, se recomiendan GPUs NVIDIA con al menos 8 GB (RTX 3070/4060 o superior). Para resoluciones altas o ControlNet, se necesitan 12-16 GB (RTX 4080/4090, A100).
- Si cabe en consumer GPU: sí, en GPUs de gama media-alta (RTX 3060 12GB o superiores) con cuantización o resolución reducida.
- Opciones de despliegue: ComfyUI (recomendado por el autor), también puede usarse con otros frameworks que soporten LoRA para modelos de difusión (por ejemplo, Diffusers).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No hay información suficiente para una comparativa directa con otros LoRA de Z-Image, ya que este es un nicho muy específico. Como referencia, se puede comparar con LoRA para otros modelos de difusión como SDXL o Flux, pero las diferencias en arquitectura base hacen que la comparación no sea significativa. El autor también tiene otros LoRA para Wan2.2 (text-to-video), pero no son comparables en tarea.

| Modelo | Tipo | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|
| deadman44/Z-Image_LoRA | LoRA sobre Z-Image Turbo | Text-to-image | Apache 2.0 | Hugging Face |
| deadman44/Wan2.2_T2i_T2v_LoRA | LoRA sobre Wan2.2 | Text-to-video | Apache 2.0 | Hugging Face |
| myjs_XL_popang (Tensor.Art) | LoRA reimpreso | Text-to-image | No comercial (reimpresión) | Tensor.Art |

## Limitaciones y advertencias

- Sesgos conocidos: al ser un LoRA entrenado por un solo autor, puede tener sesgos en los estilos y sujetos representados (por ejemplo, predominancia de ciertos tipos de personajes o escenas).
- Riesgo de alucinación: en generación de imágenes, el riesgo se manifiesta como artefactos o inconsistencias en detalles finos (manos, texto, etc.), especialmente en resoluciones altas.
- Limitaciones de contexto: el LoRA depende del text encoder Qwen 3 4B, que tiene un límite de tokens (no especificado). Prompts muy largos pueden truncarse.
- Restricciones de licencia: aunque la licencia es Apache 2.0, algunos repos reimpresos (como el de Tensor.Art) indican "no para uso comercial". El autor original no ha aclarado restricciones adicionales.
- Caveat para producción: el modelo base Z-Image Turbo es relativamente nuevo y puede tener problemas de estabilidad en ciertos entornos. Se recomienda probar exhaustivamente antes de usar en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/deadman44/Z-Image_LoRA
- Perfil del autor: https://huggingface.co/deadman44
- Modelo base Z-Image Turbo (Comfy-Org): https://huggingface.co/Comfy-Org/z_image_turbo
- ControlNet para redraw: https://huggingface.co/alibaba-pai/Z-Image-Turbo-Fun-Controlnet-Union-2.1
- Reimpresión en Tensor.Art: https://tensor.art/models/732081865978201836
- LoRA en Civitai: https://civitai.com/models/2187823/free-ai-influencer
- Trainer de LoRA (LoRA AI): https://loraai.io/lora-trainer/z-image-base-lora-trainer
