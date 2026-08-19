# ModdiAdam/Wild_Krea-2-turbo_NSFW

## Resumen

Wild Krea-2 Turbo NSFW es un modelo de generación de imágenes de texto a imagen desarrollado por ModdiAdam, basado en el modelo Krea-2 Turbo de Comfy-Org/Krea-2. Se trata de un fine-tuning orientado a mejorar la adherencia a prompts de temática madura y NSFW, manteniendo la calidad y versatilidad estilística del modelo original. El modelo cuenta con aproximadamente 12 820 millones de parámetros y se distribuye principalmente en formato GGUF con varias opciones de cuantización para adaptarse a distintos niveles de VRAM.

La relevancia de este modelo radica en que cubre un nicho específico dentro de la generación de imágenes: la creación de contenido adulto con control fino del prompt, algo que los modelos generalistas suelen restringir. Está pensado para integrarse en flujos de trabajo de ComfyUI mediante cargadores GGUF, y requiere componentes adicionales como el VAE `qwen_image_vae` y el text encoder `qwen3vl_4b_fp8_scaled` proporcionados por Comfy-Org. Su licencia es personalizada (krea-2-license) y está restringida a audiencias adultas, con una puerta de acceso que exige aceptar condiciones de uso responsable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion de texto a imagen (basado en Krea-2 Turbo) |
| Parametros totales | 12 820 073 036 (aprox. 12,82 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de texto a imagen) |
| Tipos de cuantizacion | BF16 (25,6 GB), Q8_0 (13,6 GB), Q4_1 (8,02 GB) |
| Idiomas soportados | Ingles |
| Licencia | krea-2-license (licencia personalizada, ver enlace) |
| Formato de pesos | GGUF (BF16, Q8_0, Q4_1) y safetensors (segun metadatos del repositorio) |

## Arquitectura y entrenamiento

El modelo base Krea-2 es un generador de imagenes entrenado desde cero por Krea AI, enfocado en exploracion creativa y estilistica. Wild Krea-2 Turbo NSFW es un fine-tuning de la version Turbo de Krea-2, que a su vez es una variante optimizada para generar imagenes en menos pasos de inferencia. No se han publicado detalles tecnicos sobre la arquitectura interna del modelo (tipo de backbone, mecanismos de atencion, etc.) en la informacion disponible.

En cuanto al entrenamiento del fine-tuning, la model card no especifica el numero de tokens, la composicion del dataset ni el metodo de ajuste (p. ej., si se uso RLHF, DPO o solo fine-tuning supervisado). El autor indica que el modelo ha sido probado cualitativamente para adherencia a prompts NSFW y calidad de imagen, pero no proporciona metricas cuantitativas. Se espera que el rendimiento en FID y CLIP-Score sea similar al del modelo base Krea-2, con variaciones debidas al proceso de fine-tuning y cuantizacion.

## Capacidades

- Generacion de imagenes de alta calidad a partir de prompts en ingles, con especial atencion a tematicas maduras y NSFW.
- Soporte para prompts complejos y detallados gracias al text encoder Qwen3-VL de 4B en precision FP8.
- Compatibilidad con ComfyUI mediante cargadores de modelos GGUF, lo que permite integracion en flujos de trabajo existentes.
- Multiples opciones de cuantizacion (BF16, Q8_0, Q4_1) para ajustar el consumo de VRAM segun el hardware disponible.
- Capacidad de generar imagenes con estetica variada y control estilistico, heredada del modelo base Krea-2.
- No dispone de capacidades de tool calling, agentes o razonamiento multi-paso; es exclusivamente un modelo de texto a imagen.

## Casos de uso

- Creacion de arte digital para audiencias adultas: el modelo permite generar ilustraciones de tematica madura con alta fidelidad al prompt, util para artistas y estudios que trabajan contenido para mayores de 18 anos.
- Ilustracion de novelas y comics eroticos: puede producir escenas personalizadas a partir de descripciones textuales, acelerando el proceso creativo de autores e ilustradores.
- Diseño de personajes para juegos o animacion orientados a publico adulto: el modelo genera conceptos visuales detallados que pueden servir como base para modelado 3D o animacion.
- Prototipado de conceptos visuales para proyectos creativos con tematica adulta: permite explorar rapidamente diferentes estilos y composiciones antes de invertir en produccion final.
- Generacion de contenido artistico no NSFW: aunque el modelo esta enfocado a tematica madura, tambien puede utilizarse para creaciones generales gracias a su base Krea-2, siempre que los prompts no requieran restricciones de contenido.
- Personalizacion de imagenes para productos o servicios dirigidos a adultos (p. ej., portadas, posters, material promocional) siempre que se cumplan las condiciones de la licencia y la legalidad vigente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que se espera que las metricas FID y CLIP-Score esten en linea con el modelo base Krea-2, pero no se proporcionan valores concretos. Tampoco hay comparaciones con otros modelos de generacion de imagenes.

## Requisitos de hardware

- Para la version BF16 (25,6 GB): se recomienda una GPU con al menos 32 GB de VRAM, como una NVIDIA A6000, A100 o RTX 4090 con 24 GB (aunque el modelo puede no caber completamente junto con el text encoder y VAE). Una opcion seria usar dos GPUs de 24 GB o una GPU de 48 GB.
- Para la version Q8_0 (13,6 GB): cabe en una GPU de 16 GB, como una RTX 4080 o RTX 3090, dejando espacio para el text encoder (Qwen3-VL 4B en FP8) y el VAE.
- Para la version Q4_1 (8,02 GB): puede ejecutarse en GPUs de 10-12 GB, como una RTX 3080 o RTX 3060, aunque con margen limitado para otros componentes.
- El text encoder `qwen3vl_4b_fp8_scaled` ocupa aproximadamente 4 GB en FP8, y el VAE `qwen_image_vae` unos pocos cientos de MB. Es necesario sumar estos requisitos a los del modelo principal.
- Opciones de despliegue: ComfyUI con cargador de GGUF (p. ej., ComfyUI-GGUF), Diffusers con soporte para GGUF (via `diffusers` + `gguf`), o inferencia directa con llama.cpp si se adapta.
- No se dispone de datos de latencia o throughput para este modelo especifico.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizaciones | Enfoque | Licencia |
|---|---|---|---|---|
| Wild Krea-2 Turbo NSFW (este) | 12,82 B | BF16, Q8_0, Q4_1 | NSFW / adulto | krea-2-license |
| Krea-2 Turbo (Comfy-Org) | No disponible | No disponible | General (texto a imagen) | krea-2-license |
| Krea-2 (Krea AI, original) | No disponible | No disponible | General (texto a imagen) | krea-2-license |

No se dispone de informacion suficiente para comparar rendimiento ni caracteristicas tecnicas detalladas con otros modelos de generacion de imagenes NSFW (como Pony Diffusion o modelos similares). La comparativa se limita a los modelos base de Krea-2.

## Limitaciones y advertencias

- El modelo esta disenado exclusivamente para audiencias adultas y puede generar contenido explicito. Su uso para contenido ilegal, no consentido o que involucre menores esta estrictamente prohibido por la licencia y el descargo de responsabilidad.
- No se han publicado evaluaciones cuantitativas (FID, CLIP-Score) ni pruebas de robustez frente a prompts adversarios. La calidad se basa en pruebas cualitativas del autor.
- La licencia es personalizada (krea-2-license) y puede imponer restricciones de uso comercial o redistribucion. Es necesario revisar el texto completo de la licencia antes de cualquier despliegue en produccion.
- El modelo solo soporta prompts en ingles; no se ha probado su rendimiento en otros idiomas.
- Al ser un fine-tuning, puede presentar sesgos o alucinaciones visuales en escenarios complejos, especialmente cuando el prompt combina multiples elementos o estilos.
- El repositorio no incluye informacion sobre el dataset de entrenamiento del fine-tuning, lo que dificulta evaluar posibles sesgos o limitaciones de generalizacion.
- Para un uso en produccion, se recomienda implementar filtros de seguridad adicionales si se despliega en entornos donde el acceso no este restringido a adultos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ModdiAdam/Wild_Krea-2-turbo_NSFW
- Modelo base (Comfy-Org/Krea-2): https://huggingface.co/Comfy-Org/Krea-2
- Licencia: https://huggingface.co/Comfy-Org/Krea-2/blob/main/LICENSE.md
- Repositorio oficial de Krea-2 (Krea AI): https://github.com/krea-ai/krea-2
- Krea-2-Turbo en HuggingFace (Krea): https://huggingface.co/krea/Krea-2-Turbo
- Tutorial de uso en ComfyUI (nextdiffusion.ai): https://www.nextdiffusion.ai/tutorials/krea-2-uncensored-text-to-image-generations-in-comfyui
