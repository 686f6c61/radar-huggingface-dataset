# iririko/ALMA_RHINO_LoRA

## Resumen

ALMA_RHINO_LoRA es un adaptador LoRA para generación de imágenes mediante texto (text-to-image) entrenado sobre Stable Diffusion XL Base 1.0. Lo publica el usuario iririko en Hugging Face y su función es inyectar un concepto visual muy concreto: un personaje de rinoceronte con estética de grafiti y arte urbano. No es un modelo base autónomo, sino un conjunto de pesos de adaptación de bajo rango que se cargan junto al modelo SDXL original mediante la librería diffusers.

El entrenamiento se realizó con DreamBooth, una técnica de ajuste fino personalizado que permite aprender un sujeto o estilo a partir de un conjunto reducido de imágenes de referencia. El adaptador se activa mediante las palabras clave `ALMA_RHINO, rhinoceros graffiti character, street art`, que deben incluirse en el prompt para que el concepto aparezca en la imagen generada. El LoRA del codificador de texto no está habilitado, por lo que el ajuste se aplica únicamente a las capas del UNet.

La relevancia de esta ficha es acotada: se trata de un adaptador de nicho, con cero descargas y cero likes en el momento de la consulta, pensado para ilustración urbana, diseño de personajes o experimentación creativa. No compite con modelos fundacionales ni con LoRAs de propósito general; su interés está en demostrar el flujo DreamBooth + SDXL + diffusers para conceptos artísticos específicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre UNet de Stable Diffusion XL (difusión latente) |
| Parametros totales | no disponible (pesos de adaptación LoRA; el modelo base SDXL tiene ~3.500 millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen; resolución nativa SDXL de 1024x1024) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; admite carga en fp16/fp32 según el pipeline) |
| Idiomas soportados | no disponible (los prompts se procesan con el text encoder de SDXL, predominantemente inglés) |
| Licencia | openrail++ |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El adaptador se construye sobre Stable Diffusion XL Base 1.0, un modelo de difusión latente con arquitectura UNet y doble codificador de texto (CLIP ViT-L y OpenCLIP ViT-bigG). El LoRA introduce matrices de bajo rango en las capas del UNet, lo que permite modificar el comportamiento generativo con un coste de almacenamiento muy reducido en comparación con un ajuste fino completo. Según la model card, el LoRA del text encoder está desactivado (`LoRA for the text encoder was enabled: False`), de modo que el condicionamiento textual se mantiene intacto y el concepto se aprende a nivel de denoising visual.

El entrenamiento emplea DreamBooth, técnica que asocia un identificador único (`ALMA_RHINO`) a un sujeto concreto para evitar que el concepto se mezcle con clases genéricas. Se utilizó el VAE `madebyollin/sdxl-vae-fp16-fix`, una variante del VAE de SDXL corregida para evitar desbordamientos numéricos en precisión fp16. La model card no especifica el número de imágenes de entrenamiento, el número de pasos, la tasa de aprendizaje ni la composición del dataset; esos datos figuran como pendientes (TODO) en la documentación original.

## Capacidades

- Generación de imágenes a partir de prompts de texto mediante el pipeline text-to-image de diffusers.
- Activación de un concepto visual concreto (rinoceronte con estética de grafiti y arte urbano) mediante las palabras clave `ALMA_RHINO, rhinoceros graffiti character, street art`.
- Integración con el ecosistema SDXL: puede combinarse con otros LoRAs, ControlNet o pipelines de img2img, aunque no se ha validado dicha combinación en la documentación.
- Resolución nativa de 1024x1024 propia de SDXL Base 1.0.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni modo thinking: es un modelo puramente generativo de imágenes.
- Capacidades multilingües: no documentadas; el text encoder de SDXL está entrenado mayoritariamente en inglés, por lo que los prompts en otros idiomas pueden degradar el resultado.

## Casos de uso

- Diseño de personajes para proyectos de arte urbano: el adaptador genera variaciones coherentes de un rinoceronte con estilo grafiti, útil para bocetos conceptuales de murales o ilustraciones.
- Creación de assets para videojuegos o cómics: se puede producir una familia de imágenes del personaje en distintas poses y escenarios manteniendo la identidad visual gracias al trigger word.
- Merchandising y serigrafía: generación de motivos gráficos para camisetas, pegatinas o carteles con estética street art.
- Exploración de estilo para estudios de diseño: el LoRA sirve como referencia rápida para presentar propuestas visuales a clientes antes de encargar ilustración final.
- Pruebas de pipelines de generación de imágenes: al ser un LoRA pequeño sobre SDXL, es útil para validar flujos de trabajo con diffusers, ComfyUI o Automatic1111 en entornos de experimentación.
- Contenido para redes sociales o campañas temáticas: generación de ilustraciones con un personaje reconocible y coherente a lo largo de una serie de publicaciones.
- Docencia y demostración de DreamBooth: ejemplo práctico de cómo entrenar y desplegar un adaptador LoRA personalizado sobre SDXL.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas objetivas (FID, CLIP score, evaluaciones humanas) ni comparaciones cuantitativas con otros adaptadores.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base SDXL requiere aproximadamente 8-10 GB de VRAM en fp16 para generar a 1024x1024; el LoRA añade un coste marginal (decenas de MB) al ser pesos de bajo rango.
- GPU recomendadas: NVIDIA RTX 3090, RTX 4090, A100 o H100 para inferencia cómoda; GPUs con 8 GB o más pueden ejecutar SDXL con optimizaciones (attention slicing, VAE tiling).
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores, con posible uso de `enable_model_cpu_offload` en tarjetas de 8 GB.
- Opciones de despliegue: diffusers (pipeline `StableDiffusionXLPipeline` con `load_lora_weights`), ComfyUI, Automatic1111/Forge, InvokeAI y Fooocus.
- Latencia y throughput estimados: no disponibles en la documentación; dependerán de la GPU, los pasos de muestreo y el scheduler elegido (típicamente entre 2 y 10 segundos por imagen en una RTX 4090 con 20-30 pasos).

## Comparativa con modelos similares

| Modelo | Tipo | Base | Parametros | Contexto/resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| iririko/ALMA_RHINO_LoRA | LoRA DreamBooth | SDXL Base 1.0 | no disponible (adaptador) | 1024x1024 | openrail++ | Hugging Face |
| stabilityai/stable-diffusion-xl-base-1.0 | Modelo base | — | ~3.500 M | 1024x1024 | openrail++ | Hugging Face |
| Adaptadores LoRA de estilo grafiti en SDXL (genéricos) | LoRA | SDXL Base 1.0 | no disponible | 1024x1024 | variable según autor | Hugging Face / Civitai |

La comparación cuantitativa con otros LoRAs de la misma categoría no está disponible, ya que no se han publicado métricas ni evaluaciones en la documentación del modelo.

## Limitaciones y advertencias

- La model card está generada automáticamente y contiene secciones sin completar (TODO): no hay información sobre el dataset, los hiperparámetros de entrenamiento ni ejemplos de uso.
- Riesgo de sobreajuste al concepto: al ser un LoRA DreamBooth entrenado presumiblemente con pocas imágenes, puede reproducir poses o composiciones del set de entrenamiento y perder variedad.
- El trigger word debe incluirse de forma literal; sin él, el adaptador no activa el concepto y puede introducir artefactos o desviaciones respecto al SDXL original.
- Sesgos: no documentados, pero hereda los sesgos del modelo base SDXL y de las imágenes de entrenamiento, que no se han descrito.
- Alucinación visual: como todo modelo de difusión, puede generar anatomías incorrectas, texto ilegible o incoherencias en escenas complejas.
- Idiomas: el text encoder de SDXL está orientado al inglés; prompts en castellano pueden funcionar peor.
- Licencia openrail++: permite uso comercial con condiciones, pero conviene revisar las cláusulas de atribución y las restricciones de uso del modelo base SDXL, que también aplican.
- Estado del repositorio: cero descargas y cero likes en el momento de la consulta, sin validación comunitaria; no se recomienda para producción sin evaluación previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iririko/ALMA_RHINO_LoRA
- Modelo base: https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0
- VAE utilizado en entrenamiento: https://huggingface.co/madebyollin/sdxl-vae-fp16-fix
- DreamBooth (paper): https://dreambooth.github.io/
- Documentación de diffusers: https://huggingface.co/docs/diffusers
