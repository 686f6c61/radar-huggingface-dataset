# KryptykAngel/qwen-image-edit-uncensored-GGUF

## Resumen

Qwen-Image-Edit-2511 Uncensored GGUF es una compilación cuantizada y pre-fusionada del modelo de edición de imágenes Qwen-Image-Edit-2511 de Alibaba Qwen, publicada por el usuario KryptykAngel (con artefactos alojados bajo la cuenta ChrisColeTech). Sobre los pesos base se han integrado dos fine-tunes: un LoRA Turbo (Lightning, 4 pasos) que acelera la inferencia, y un LoRA NSFW que elimina las restricciones de contenido para adultos. El resultado es un modelo de difusión image-to-image y text-to-image orientado a generación sin censura, distribuido en formato GGUF para su uso en ComfyUI.

El modelo parte de una arquitectura de difusión de aproximadamente 20.430 millones de parámetros (20,4 B), empaquetada junto a un text encoder Qwen2.5-VL-7B-Instruct cuantizado y un VAE de 254 MB. El repositorio ocupa 56,2 GB e incluye los componentes separados (transformer, text encoder, mmproj y VAE) más un workflow de ejemplo para ComfyUI.

Es relevante por su enfoque práctico: ofrece una vía de bajo consumo (Q4_K_M, 11,7 GB para el transformer) para ejecutar edición y generación de imágenes en hardware de consumo, con la particularidad de estar deliberadamente descensurado. No obstante, la propia model card admite que la edición no es el punto fuerte del modelo y que requiere más ajuste, siendo la generación text-to-image su mejor caso de uso. La licencia figura como "unknown", lo que introduce incertidumbre legal para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion (image-to-image / text-to-image) basado en Qwen-Image-Edit-2511, con text encoder Qwen2.5-VL-7B-Instruct |
| Parametros totales | 20.430.401.088 (~20,4 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_K_M (transformer), q4_0 (text encoder), f16 (mmproj); formato GGUF |
| Idiomas soportados | No disponible |
| Licencia | Unknown (desconocida) |
| Formato de pesos | GGUF (transformer y text encoder), safetensors (VAE) |

## Arquitectura y entrenamiento

El modelo es un pipeline de difusion para edicion y generacion de imagenes derivado de Qwen-Image-Edit-2511. Se compone de cuatro piezas: un transformer de difusion cuantizado a Q4_K_M (11,7 GB), un text encoder Qwen2.5-VL-7B-Instruct en q4_0 (4,43 GB), un proyector multimodal mmproj en f16 (1,35 GB) y el VAE de Qwen Image (254 MB). La combinacion de un text encoder de tipo vision-language (Qwen2.5-VL) con el transformer de difusion permite condicionar la generacion tanto por texto como por imagen de entrada.

Sobre los pesos base se han fusionado dos LoRA: un Turbo (Lightning) que reduce el numero de pasos de muestreo a un minimo de 4, y un LoRA NSFW que relaja las restricciones de contenido. La model card no detalla el volumen de datos de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO; esa informacion no esta disponible. La innovacion principal es la fusion de LoRA en los pesos y la cuantizacion GGUF, que reduce los requisitos de memoria a costa de cierta perdida de calidad frente a los pesos originales.

## Capacidades

- Generacion de imagenes text-to-image: segun la model card, es el punto fuerte del modelo, rapido y sin censura.
- Edicion de imagenes image-to-image: funciona y es rapida, aunque el autor advierte que la edicion no es su fortaleza y requiere mas ajuste.
- Inferencia acelerada: con el LoRA Turbo permite generar en 4 pasos (minimo 4, maximo 16) con CFG fijado a 1.0.
- Generacion sin censura (NSFW) gracias al LoRA integrado, con la salvaguarda declarada de bloquear contenido ilegal.
- Condicionamiento multimodal por texto e imagen mediante el text encoder Qwen2.5-VL-7B-Instruct.
- Integracion con ComfyUI mediante el nodo comfyui-gguf-loader (requiere canal remoto del Manager).
- Soporte de resoluciones desde 512x512 hasta 1024x1024.
- Tool calling / function calling: no disponible (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no aplica.

## Casos de uso

- Generacion de arte conceptual sin restricciones: el modelo permite crear imagenes de personajes y escenas en 4 pasos a 1024x1024, adecuado para estudios que necesitan explorar ideas sin filtros de contenido.
- Prototipado rapido en ComfyUI: con el workflow de ejemplo y el nodo GGUF loader, un artista puede montar un pipeline de generacion en minutos y iterar variaciones con CFG 1.0.
- Edicion basica de imagenes existentes: aplicar cambios como reemplazo de objetos o ajustes de escena sobre una imagen de entrada, util para retoque rapido aunque con calidad limitada segun el autor.
- Generacion de material para proyectos creativos privados: contenido para adultos en entornos controlados, dado el LoRA NSFW integrado y la advertencia de uso responsable.
- Experimentacion en hardware de consumo: al caber en GPUs con 12-16 GB de VRAM en Q4_K_M, sirve para probar pipelines de difusion en estaciones de trabajo modestas.
- Investigacion sobre fine-tuning y fusion de LoRA: el repositorio documenta la combinacion de Turbo y NSFW, util como referencia para estudiar el impacto de fusionar adaptadores en modelos de difusion.
- Generacion de variaciones de estilo: mediante prompts detallados (iluminacion, encuadre, fondo) se pueden producir series coherentes de imagenes para moodboards.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el transformer Q4_K_M ocupa 11,7 GB, el text encoder q4_0 4,43 GB, el mmproj 1,35 GB y el VAE 254 MB; en conjunto se recomienda al menos 16-18 GB de VRAM para cargar todo el pipeline, y 12 GB puede ser insuficiente si se mantienen todos los componentes en memoria.
- GPU recomendadas: RTX 4090 (24 GB), RTX 3090 (24 GB), A100 (40/80 GB) y H100 para mayor comodidad; en GPUs de 16 GB (RTX 4080, 4060 Ti 16 GB) puede requerir descarga parcial a RAM.
- Cabe en GPU de consumo: si, en modelos con 16 GB o mas de VRAM; en 12 GB es ajustado y puede necesitar offloading.
- Opciones de despliegue: ComfyUI con el nodo comfyui-gguf-loader (requisito explicito del autor); el formato GGUF tambien permite su uso con herramientas compatibles con GGUF para difusion, aunque la model card solo documenta ComfyUI.
- Latencia y throughput: no se proporcionan cifras concretas; la model card indica que con 4 pasos la generacion es "muy rapida", sin datos medidos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|
| KryptykAngel/qwen-image-edit-uncensored-GGUF | ~20,4 B | 512x512 a 1024x1024 | Unknown | GGUF en HuggingFace |
| Qwen/Qwen-Image-Edit-2511 (base) | No disponible | No disponible | No disponible | Pesos originales en HuggingFace |
| Phr00t/Qwen-Image-Edit-Rapid-AIO | No disponible | No disponible | No disponible | Pesos en HuggingFace |

No se dispone de datos de benchmarks ni de especificaciones detalladas de los modelos comparables en la informacion proporcionada, por lo que la comparacion cuantitativa de rendimiento no esta disponible.

## Limitaciones y advertencias

- La licencia figura como "unknown", lo que impide confirmar si se permite el uso comercial; se debe contactar con el autor antes de cualquier despliegue productivo.
- Contenido NSFW integrado: el modelo esta disenado para generar material para adultos, lo que conlleva riesgos legales y de cumplimiento segun la jurisdiccion.
- La model card afirma que existen salvaguardas contra contenido ilegal, pero no se detalla su alcance ni su eficacia; no deben asumirse garantias.
- La edicion de imagenes no es el punto fuerte del modelo segun el propio autor; requiere mas ajuste para resultados fiables.
- Al ser una fusion de LoRA y una cuantizacion Q4_K_M, es previsible cierta perdida de calidad frente a los pesos originales de Qwen-Image-Edit-2511.
- Riesgo de alucinacion visual: como todo modelo generativo, puede producir detalles inconsistentes con el prompt o con la imagen de entrada.
- Idiomas soportados no documentados; el comportamiento multilingue de los prompts no esta verificado.
- Requiere una version actualizada del nodo comfyui-gguf-loader desde el canal remoto del Manager; versiones antiguas pueden fallar.
- El repositorio tiene 0 descargas y 0 likes, sin validacion de la comunidad; la trazabilidad y el soporte son limitados.
- No es un modelo de lenguaje: no soporta tool calling, agentes ni razonamiento textual.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/KryptykAngel/qwen-image-edit-uncensored-GGUF
- Modelo base Qwen-Image-Edit-2511: https://huggingface.co/Qwen/Qwen-Image-Edit-2511
- Modelo base Rapid-AIO: https://huggingface.co/Phr00t/Qwen-Image-Edit-Rapid-AIO
- Transformer Q4_K_M: https://huggingface.co/ChrisColeTech/qwen-image-edit-uncensored-GGUF/resolve/main/split/diffusion_models/qwen-image-edit-2511-uncensored-Q4_K_M.gguf
- Text encoder Qwen2.5-VL-7B-Instruct q4_0: https://huggingface.co/ChrisColeTech/qwen-image-edit-uncensored-GGUF/resolve/main/split/text_encoders/Qwen2.5-VL-7B-Instruct-q4_0.gguf
- mmproj f16: https://huggingface.co/ChrisColeTech/qwen-image-edit-uncensored-GGUF/resolve/main/split/text_encoders/Qwen2.5-VL-7B-Instruct-mmproj-f16.gguf
- VAE: https://huggingface.co/ChrisColeTech/qwen-image-edit-uncensored-GGUF/resolve/main/split/vae/qwen_image_vae.safetensors
- Workflow de ejemplo ComfyUI: https://huggingface.co/ChrisColeTech/qwen-image-edit-uncensored-GGUF/resolve/main/workflow_example/qwen_image_edit_nsfw.json
