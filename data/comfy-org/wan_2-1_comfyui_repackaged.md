# Comfy-Org/Wan_2.1_ComfyUI_repackaged

## Resumen

Wan 2.1 es una familia de modelos de difusión para generación de vídeo desarrollada originalmente por Alibaba (Wan-AI) y el equipo alibaba-pai. Este repositorio, mantenido por Comfy-Org, no contiene pesos originales sino una reempaquetado de los ficheros de la familia Wan 2.1 en formato de fichero único (diffusion-single-file) listos para colocarse directamente en las carpetas de ComfyUI, con variantes en fp16, bf16, fp8_e4m3fn y fp8_scaled.

El paquete cubre las tareas principales de la familia: texto a vídeo (T2V) en 1.3B y 14B, imagen a vídeo (I2V) en 480p y 720p, primer y último fotograma a vídeo (FLF2V), control de cámara y control estructural (Wan 2.1 Fun V1.1), inpainting, VACE (referencia a vídeo, vídeo a vídeo, outpainting), además de integraciones de terceros como MAGREF, Wan-Alpha (canal alfa) e InfiniteTalk (doblaje de cuerpo completo guiado por audio).

Su relevancia práctica es alta: con casi 5 millones de descargas y más de 1000 likes, se ha convertido en la vía estándar para usar Wan 2.1 dentro de ComfyUI sin tener que convertir ni reorganizar pesos manualmente. El repositorio ocupa 543,8 GB porque agrupa todas las variantes y cuantizaciones en un único punto de distribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelos de difusión para vídeo (familia Wan 2.1); detalles de bloques no disponibles en la información proporcionada |
| Parametros totales | Variantes de 1.3B y 14B (según el modelo base incluido) |
| Parametros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible (modelo de vídeo, no de texto) |
| Tipos de cuantizacion | fp16, bf16, fp8_e4m3fn, fp8_scaled |
| Idiomas soportados | No disponible (el prompt textual se procesa mediante el text encoder UMT5-XXL) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (fichero único para ComfyUI) |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura interna de los modelos Wan 2.1 (número de bloques, mecanismo de atención, tipo de VAE más allá de su fichero `wan_2.1_vae.safetensors`). Lo que sí se documenta es la composición del ecosistema: un text encoder UMT5-XXL (en fp16 o fp8_e4m3fn_scaled), un VAE propio de Wan 2.1 y, para la variante Wan-Alpha, VAEs específicos con canal alfa y canal RGB. Los pesos se distribuyen como ficheros de difusión únicos, lo que implica que el pipeline de muestreo se reconstruye dentro de ComfyUI en lugar de cargarse desde un `model_index.json` de diffusers.

El repositorio agrupa pesos derivados de múltiples modelos base: Wan2.1-T2V-1.3B, Wan2.1-T2V-14B, Wan2.1-I2V-14B-480P, Wan2.1-I2V-14B-720P, Wan2.1-FLF2V-14B-720P, Wan2.1-VACE-1.3B, Wan2.1-VACE-14B, los finetunes Wan2.1-Fun-V1.1 (1.3B y 14B, con variantes Control, Control-Camera e InP), además de MAGREF, Wan-Alpha e InfiniteTalk. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO.

## Capacidades

- Generación de vídeo a partir de texto (T2V) en variantes de 1.3B y 14B.
- Generación de vídeo a partir de una imagen (I2V) en resoluciones 480p y 720p.
- Generación de vídeo a partir del primer y último fotograma (FLF2V) a 720p con el modelo de 14B.
- Control de cámara y control estructural mediante los finetunes Wan 2.1 Fun V1.1 (Control y Control-Camera).
- Inpainting de vídeo con la variante Fun InP y con los flujos VACE de inpainting y outpainting.
- VACE: referencia a vídeo (ref2v), vídeo a vídeo (v2v), texto a vídeo y primer/último fotograma.
- Generación con canal alfa (transparencia) mediante Wan-Alpha, con VAE específico para alfa y RGB y LoRA `wan_alpha_2.1_rgba_lora`.
- Doblaje de vídeo de cuerpo completo guiado por audio con InfiniteTalk (parches `wan2.1_infiniteTalk_single_fp16` y `wan2.1_infiniteTalk_multi_fp16`).
- Integración con MAGREF para generación de vídeo con referencia.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso: es un modelo generativo de vídeo, no un LLM.

## Casos de uso

- Producción de vídeo publicitario a partir de texto: usar `wan2.1_t2v_14B_fp8_e4m3fn.safetensors` con el workflow `text_to_video_wan.json` para generar clips desde un prompt descriptivo, reduciendo la necesidad de rodaje para bocetos y animáticas.
- Animación de imágenes fijas para redes sociales: con `wan2.1_i2v_480p_14B_fp8_scaled.safetensors` y el workflow `image_to_video_wan.json` se convierte una fotografía o ilustración en un clip corto, útil para contenido recurrente con presupuesto de cómputo limitado.
- Transiciones controladas entre dos fotogramas clave: el modelo FLF2V de 720p permite fijar el inicio y el final de un plano, lo que encaja en montajes donde la continuidad visual es crítica (por ejemplo, inserts en vídeo musical o secuencias de producto).
- Control de movimiento de cámara en previsualización: los finetunes Fun V1.1 Control-Camera (1.3B y 14B) permiten definir trayectorias de cámara, adecuados para previsualización de planos antes de rodar.
- Eliminación o sustitución de elementos en vídeo existente: los flujos VACE de inpainting y outpainting permiten borrar objetos o extender el encuadre sin regrabar, útil en postproducción y limpieza de metraje.
- Doblaje y reanimación de personajes con audio: InfiniteTalk sincroniza el movimiento de cuerpo completo con una pista de audio, aplicable a localización de vídeos formativos o a avatares presentadores.
- Composición con transparencias: Wan-Alpha, con su VAE de canal alfa y el LoRA RGBA, permite generar elementos de vídeo con alfa para integrarlos en capas de edición sin keying manual.
- Prototipado rápido en GPU de consumo: la variante T2V de 1.3B en bf16 o fp16 hace viable iterar en equipos con menos VRAM antes de escalar a los modelos de 14B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita en la información proporcionada. Como referencia de orden de magnitud, los ficheros de 14B en fp16 o bf16 pesan del orden de decenas de GB y las variantes fp8 reducen ese peso aproximadamente a la mitad; los ficheros de 1.3B son mucho más ligeros. Estas cifras son estimaciones de tamaño de fichero, no requisitos medidos de VRAM.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño de pesos, los modelos de 14B en fp16/bf16 requieren GPUs de datacenter (A100, H100) o configuraciones multi-GPU; las variantes fp8 y los modelos de 1.3B son las opciones razonables para GPUs de consumo de gama alta.
- ¿Cabe en GPU de consumo? Los modelos de 1.3B y las variantes fp8 de 14B son los candidatos; no se confirma en la información disponible qué RTX concretas los soportan.
- Despliegue: el repositorio está diseñado para ComfyUI (carpetas `diffusion_models`, `text_encoders`, `vae`, `clip_vision`, `loras`, `model_patches`). No se documentan instrucciones para vLLM, llama.cpp, Ollama o TGI, que además no aplican a modelos de difusión de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto / resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Wan 2.1 (este repack) | 1.3B y 14B | Difusión vídeo (T2V, I2V, FLF2V, VACE, control) | 480p y 720p | Apache 2.0 | Hugging Face, integrado en ComfyUI |
| Wan 2.1 original (Wan-AI) | 1.3B y 14B | Difusión vídeo | 480p y 720p | Apache 2.0 | Hugging Face (pesos originales) |
| MAGREF | No disponible | Difusión vídeo con referencia | No disponible | No disponible en la información | Hugging Face (incluido como base) |
| InfiniteTalk | No disponible | Doblaje de vídeo guiado por audio | No disponible | No disponible en la información | Hugging Face (incluido como base) |

No se dispone de datos de benchmarks para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Este repositorio es un reempaquetado para ComfyUI, no el modelo original: la licencia Apache 2.0 se hereda de los modelos base, pero conviene verificar la licencia de cada modelo base incluido (MAGREF, InfiniteTalk, Wan-Alpha) antes de uso comercial.
- No se documentan sesgos conocidos ni evaluaciones de sesgo en la información proporcionada.
- Riesgo de alucinación visual: como todo modelo generativo de vídeo, puede producir artefactos, incoherencias temporales o movimientos no solicitados; no hay métricas publicadas en la información disponible.
- El soporte de idiomas del prompt no está documentado; el text encoder es UMT5-XXL, pero no se confirma qué idiomas están cubiertos de forma fiable.
- El tamaño del repositorio (543,8 GB) obliga a descargar selectivamente solo los ficheros necesarios; descargar el repo completo no es práctico.
- Los pesos están en formato de fichero único para ComfyUI, lo que puede dificultar su uso fuera de ese ecosistema sin conversión.
- No se especifican requisitos mínimos de VRAM ni límites de resolución más allá de 480p y 720p; no se debe asumir soporte de resoluciones superiores.
- Las variantes fp8 implican una pérdida de calidad frente a fp16/bf16 que no está cuantificada en la información disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Comfy-Org/Wan_2.1_ComfyUI_repackaged
- Modelo base T2V 1.3B: https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B
- Modelo base T2V 14B: https://huggingface.co/Wan-AI/Wan2.1-T2V-14B
- Modelo base I2V 480P: https://huggingface.co/Wan-AI/Wan2.1-I2V-14B-480P
- Modelo base I2V 720P: https://huggingface.co/Wan-AI/Wan2.1-I2V-14B-720P
- Modelo base FLF2V 720P: https://huggingface.co/Wan-AI/Wan2.1-FLF2V-14B-720P
- Modelo base VACE 1.3B: https://huggingface.co/Wan-AI/Wan2.1-VACE-1.3B
- Modelo base VACE 14B: https://huggingface.co/Wan-AI/Wan2.1-VACE-14B
- Fun V1.1 Control-Camera 1.3B: https://huggingface.co/alibaba-pai/Wan2.1-Fun-V1.1-1.3B-Control-Camera
- Fun V1.1 Control-Camera 14B: https://huggingface.co/alibaba-pai/Wan2.1-Fun-V1.1-14B-Control-Camera
- Fun V1.1 Control 1.3B: https://huggingface.co/alibaba-pai/Wan2.1-Fun-V1.1-1.3B-Control
- Fun V1.1 InP 1.3B: https://huggingface.co/alibaba-pai/Wan2.1-Fun-V1.1-1.3B-InP
- MAGREF: https://huggingface.co/MAGREF-Video/MAGREF
- Wan-Alpha: https://huggingface.co/htdong/Wan-Alpha
- InfiniteTalk: https://huggingface.co/MeiGen-AI/InfiniteTalk
- Ejemplos de ComfyUI para Wan: https://comfyanonymous.github.io/ComfyUI_examples/wan
- Repositorio ComfyUI: https://github.com/Comfy-Org/ComfyUI
- Plantillas de workflows: https://github.com/Comfy-Org/workflow_templates/tree/main/templates
- Comfy Cloud: https://cloud.comfy.org/
