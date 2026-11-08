# seugxf/Z-Image-Turbo

## Resumen

Z-Image-Turbo es un modelo de generación de imágenes por difusión desarrollado originalmente por el equipo Tongyi-MAI (Alibaba). Se trata de un modelo de aproximadamente 6000 millones de parámetros (6B) optimizado para inferencia rápida, capaz de generar imágenes fotorrealistas en menos de un segundo según las fuentes públicas disponibles. Este repositorio concreto (`seugxf/Z-Image-Turbo`) no es el modelo original, sino un reempaquetado de los pesos en formato de archivo único (single-file) para su uso directo en ComfyUI.

El repositorio incluye los pesos del modelo de difusión en varias precisiones (bf16, int8 convrot y nvfp4), un LoRA de destilación, los codificadores de texto Qwen 3 4B en distintas cuantizaciones (bf16, fp4 mixed, fp8 mixed) y el VAE. Esta estructura facilita el despliegue local en flujos de ComfyUI sin necesidad de descargar el repositorio original completo.

Su relevancia actual radica en la combinación de un tamaño moderado (6B), licencia Apache 2.0 permisiva y una arquitectura de destilación que permite generar imágenes de alta calidad con muy pocos pasos de muestreo, lo que reduce los requisitos de cómputo y hace viable la inferencia en GPUs de consumo con 6 GB de VRAM en configuraciones cuantizadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión (texto a imagen) con codificador de texto Qwen 3 4B; detalles internos (transformer/DiT) no disponibles |
| Parametros totales | ~6B (según fuentes públicas) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de imagen, no de texto) |
| Tipos de cuantizacion | bf16, int8 (convrot), nvfp4; codificador de texto en bf16, fp4 mixed y fp8 mixed |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (single-file para ComfyUI) |

## Arquitectura y entrenamiento

Z-Image-Turbo es un modelo de difusión para generación de imágenes a partir de texto. Emplea un codificador de texto basado en Qwen 3 4B para procesar los prompts, un VAE para la codificación y decodificación latente, y un modelo de difusión principal de aproximadamente 6B parámetros. El repositorio incluye además un LoRA de destilación (`z_image_turbo_distill_patch_lora_bf16.safetensors`), lo que indica que el modelo ha sido sometido a un proceso de destilación por pasos para permitir una generación rápida con pocos pasos de muestreo.

No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La información pública disponible se limita a las características de despliegue y a las capacidades de generación rápida. La innovación técnica principal es la destilación que habilita la inferencia en menos de un segundo, junto con el empaquetado en múltiples precisiones (int8, nvfp4) para adaptarse a distintos niveles de VRAM.

## Capacidades

- Generación de imágenes a partir de descripciones textuales (text-to-image) con calidad fotorrealista.
- Generación rápida: menos de un segundo por imagen según las fuentes públicas.
- Integración con ComfyUI mediante flujos de trabajo predefinidos (text-to-image, int8, upscaler 2K, ControlNet Union).
- Soporte de escalado de imagen (upscaler 2K) mediante flujo dedicado.
- Soporte de ControlNet Union (fun union controlnet) para control estructural de la generación.
- Compatibilidad con LoRA de destilación incluida en el repositorio.
- Despliegue local con cuantizaciones que reducen los requisitos de VRAM (hasta 6 GB según guías públicas).
- No se dispone de información sobre soporte de tool calling, agentes, razonamiento multilingüe ni modalidades de audio o vídeo (no aplica a un modelo de imagen).

## Casos de uso

- Generación de imágenes para prototipado rápido de interfaz: el modelo permite iterar sobre conceptos visuales en menos de un segundo por imagen, lo que acelera los ciclos de diseño en equipos de producto.
- Creación de contenido para marketing y redes sociales: con licencia Apache 2.0 y generación rápida, se puede integrar en pipelines automatizados que produzcan variaciones de imágenes para campañas sin coste de licencia.
- Escalado de imágenes a 2K: el flujo de upscaler incluido permite aumentar la resolución de imágenes existentes para impresión o visualización en pantallas de alta densidad.
- Control estructural mediante ControlNet: el flujo Fun Union ControlNet permite guiar la generación con bocetos o poses, útil en ilustración y diseño de personajes.
- Despliegue local en estaciones de trabajo con GPU de consumo: con cuantización int8 o nvfp4 y 6 GB de VRAM, es viable en GPUs como la RTX 3060 o superiores, según las guías públicas.
- Automatización de generación de assets para videojuegos: la rapidez de inferencia y el soporte de LoRA permiten generar variaciones de texturas o conceptos artísticos en lotes.
- Investigación en difusión: el repositorio single-file y las múltiples precisiones facilitan experimentos de cuantización y comparación de calidad frente a otros modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 6 GB en configuraciones cuantizadas (int8 o nvfp4), según guías públicas de despliegue local.
- GPU recomendadas: no se especifican modelos concretos en la información disponible; las guías mencionan GPUs de consumo con 6 GB de VRAM como mínimo.
- Cabe en GPU de consumo: sí, en configuraciones cuantizadas con 6 GB de VRAM (por ejemplo, RTX 3060 o superiores, según las guías).
- Opciones de despliegue: ComfyUI (flujos oficiales), Diffusers (según la guía de despliegue), y potencialmente otros runners compatibles con safetensors single-file.
- Latencia y throughput: menos de un segundo por imagen según las fuentes públicas; no se dispone de cifras de throughput detalladas.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de benchmarks ni especificaciones de modelos comparables de la misma categoría.

## Limitaciones y advertencias

- Este repositorio es un reempaquetado no oficial del modelo original de Tongyi-MAI; la autoría y el soporte corresponden al repositorio original.
- No se dispone de información sobre sesgos conocidos, tasas de alucinación visual ni limitaciones idiomáticas del codificador de texto.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar los términos del modelo original y de los componentes (Qwen 3 4B, VAE) por si tuvieran condiciones adicionales.
- El rendimiento puede variar según la cuantización elegida; las versiones int8 y nvfp4 pueden degradar la calidad frente a bf16.
- No se dispone de información sobre el número de pasos de muestreo recomendados ni sobre la estabilidad en prompts complejos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que no ha sido validado por la comunidad.

## Enlaces

- Repositorio de Hugging Face: https://huggingface.co/seugxf/Z-Image-Turbo
- Modelo original: https://huggingface.co/Tongyi-MAI/Z-Image-Turbo
- Workflows de ComfyUI: https://comfyanonymous.github.io/ComfyUI_examples/z_image/
- Plantilla de flujo text-to-image: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_z_image_turbo.json
- Plantilla de flujo int8: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_z_image_turbo_int8.json
- Plantilla de upscaler 2K: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/utility_z_image_turbo_2k_upscaler.app.json
- Plantilla de ControlNet Union: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_z_image_turbo_fun_union_controlnet.json
- Guía de despliegue local: https://tech-insider.org/z-image-turbo-local-setup-2026/
- Demo pública: https://zimageturbo.io/en
