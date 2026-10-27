# Comfy-Org/Wan-2.1

## Resumen

Comfy-Org/Wan-2.1 no es un modelo único, sino un repositorio de reempaquetado de la familia Wan 2.1 (desarrollada originalmente por Wan-AI, el equipo de vídeo de Alibaba) en archivos `safetensors` de tipo *single-file* listos para cargarse directamente en ComfyUI. El repositorio, mantenido por Comfy-Org, agrupa las variantes text-to-video (T2V), image-to-video (I2V), first-last-frame-to-video (FLF2V), VACE (control de vídeo, inpainting, outpainting y reference-to-video), Fun V1.1 (control y control de cámara), MAGREF, Wan-Alpha (canal alfa) e InfiniteTalk (doblaje guiado por audio), además del text encoder umT5-XXL, el VAE de Wan 2.1 y las LoRAs y parches asociados.

El problema que resuelve es puramente operativo: los pesos originales están dispersos en catorce repositorios con estructuras de carpetas y convenciones de nombres distintas, lo que obliga a descargar, renombrar y colocar manualmente cada componente. Este repositorio consolida 24 archivos de modelos de difusión en una jerarquía de carpetas documentada y con nombres normalizados (`diffusion_models/`, `text_encoders/`, `vae/`, `loras/`, `model_patches/`, `clip_vision/`), con variantes en fp16, bf16, fp8_e4m3fn y fp8_scaled.

Su relevancia actual es alta dentro del ecosistema de generación de vídeo: acumula 4.384.259 descargas y 1031 likes, con un tamaño de repositorio de 543,8 GB, y cubre dos escalas de parámetros (1,3B y 14B) bajo licencia Apache 2.0. Conviene tener claro que la model card de este repositorio no documenta arquitectura interna, datos de entrenamiento ni resultados de benchmarks: es un contenedor de pesos, no una ficha técnica del modelo original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Difusión (archivos *single-file* para ComfyUI). Pipeline compuesto por modelo de difusión + text encoder umT5-XXL + VAE Wan 2.1. Detalle interno de la red no documentado en la información disponible |
| Parámetros totales | 1,3B (variantes `1.3B`) y 14B (variantes `14B`), según el nombre de los archivos |
| Parámetros activos | No aplica: no se documenta arquitectura MoE; las variantes listadas son densas de 1,3B o 14B |
| Longitud de contexto | No disponible. No aplica en el sentido de LLM: la "ventana" viene determinada por resolución (480p, 720p) y número de fotogramas, no especificado |
| Tipos de cuantización | fp16, bf16, fp8_e4m3fn, fp8_scaled (según nombres de archivo) |
| Idiomas soportados | No disponible. El repositorio incluye un text encoder umT5-XXL, pero no se documenta la cobertura de idiomas de los prompts |
| Licencia | Apache 2.0 |
| Formato de pesos | `safetensors` *single-file* (librería `diffusion-single-file`) |

Otros datos verificables: ID `Comfy-Org/Wan-2.1`, autor Comfy-Org, región US, creado el 2025-02-25, actualizado el 2026-09-23, pipeline no disponible, tamaño del repositorio 543,8 GB.

## Arquitectura y entrenamiento

Los archivos indican una topología de difusión en tres piezas: un modelo generativo (en 1,3B o 14B), un codificador de texto umT5-XXL disponible en fp16 y en fp8_e4m3fn escalado, y un VAE propio (`wan_2.1_vae.safetensors`) más un CLIP vision (`clip_vision_h.safetensors`) para las variantes que consumen imagen de entrada. Las resoluciones nominales que aparecen en los nombres de archivo son 480p y 720p; las variantes 14B concentran las tareas de mayor fidelidad (I2V 480p/720p, FLF2V 720p, VACE 14B), mientras que las 1.3B cubren T2V, VACE y los modelos Fun de control e inpainting. Esta información es la que se deduce del inventario de archivos: la model card no describe capas, atención, tipo de transformer ni mecanismo de difusión.

No hay datos de entrenamiento en la información proporcionada: ni número de tokens, ni composición del dataset, ni uso de RLHF/DPO, ni proceso de destilación. Tampoco se documentan innovaciones internas de arquitectura. Lo que sí es verificable a nivel de producto son las capacidades diferenciales empaquetadas: generación entre primer y último fotograma (FLF2V), el conjunto VACE para control de vídeo, inpainting, outpainting y reference-to-video, control explícito de cámara en los modelos Fun V1.1, salida con canal alfa mediante la LoRA `wan_alpha_2.1_rgba_lora` y sus dos VAE específicos (alfa y RGB), y los parches de InfiniteTalk (`single` y `multi`) para doblaje de cuerpo completo sincronizado con audio.

## Capacidades

- Generación de vídeo texto-a-vídeo (T2V) en variantes de 1,3B y 14B.
- Generación de vídeo imagen-a-vídeo (I2V) en 480p y 720p con el modelo de 14B.
- Interpolación y transición entre primer y último fotograma (FLF2V 720p, 14B).
- Control de vídeo (VACE): vídeo-a-vídeo, reference-to-video, inpainting y outpainting sobre secuencias existentes, en 1,3B y 14B.
- Control estructural y de cámara mediante la familia Fun V1.1 (Control y Control-Camera, 1,3B y 14B).
- Inpainting de imagen en las variantes Fun InP.
- Doblaje de vídeo guiado por audio (InfiniteTalk), con parches para modo *single* y *multi*.
- Salida con canal alfa (RGBA) mediante Wan-Alpha y su LoRA, útil para composición sobre fondos.
- Soporte de LoRAs externas y de parches de modelo dentro del ecosistema ComfyUI.
- No dispone de tool calling, function calling, razonamiento multi-paso ni modo *thinking*: no es un modelo de lenguaje.

## Casos de uso

- **Previsualización de spots publicitarios**: generar animáticas en 480p con el modelo T2V de 1,3B para validar guion y ritmo antes de producir, y promocionar a 720p con el de 14B solo en los planos aprobados.
- **Animación de fotografía de producto**: usar I2V 14B 720p para convertir fotos fijas de catálogo en clips cortos con movimiento de cámara controlado mediante Fun Camera, evitando rodajes por producto.
- **Transiciones entre planos en postproducción**: FLF2V permite fijar el último fotograma de un plano y el primero del siguiente para generar la transición intermedia de forma coherente.
- **Rotoscopia y limpieza de metraje**: VACE Inpainting y Outpainting permiten eliminar objetos o extender el encuadre en secuencias ya rodadas, integrándose en un flujo de postproducción existente.
- **Transferencia de estilo y *restyling* de vídeo**: VACE vídeo-a-vídeo o reference-to-video para reestilizar material grabado manteniendo la estructura temporal del original.
- **Doblaje y localización de contenido**: InfiniteTalk sincroniza el movimiento corporal y labial con una pista de audio nueva, lo que sirve para localizar vídeos formativos o corporativos a otros idiomas sin regrabar.
- **Composición con transparencias para VFX**: Wan-Alpha con los VAE de canal alfa y RGB genera clips con canal alfa que se pueden superponer directamente en un compositor.
- **Generación por lotes dentro de ComfyUI**: los archivos están normalizados para los nodos nativos de carga de `diffusion_models`, `text_encoders` y `vae`, lo que permite versionar los flujos de trabajo como JSON y ejecutarlos en lote o en Comfy Cloud.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de este repositorio es un instructivo de instalación y colocación de archivos, sin métricas de calidad (FVD, CLIPScore, VBench ni similares) ni comparaciones cuantitativas con otros modelos de vídeo.

## Requisitos de hardware

Las cifras siguientes son estimaciones aritméticas a partir del número de parámetros y del tipo de dato de cada archivo; el autor no publica requisitos oficiales.

- **VRAM solo para pesos del modelo de difusión**: 14B en fp16/bf16 ≈ 28 GB; 14B en fp8 ≈ 14 GB; 1,3B en fp16/bf16 ≈ 2,6 GB.
- **Overhead adicional**: hay que sumar el text encoder umT5-XXL (disponible en fp16 y en fp8 escalado, lo que sugiere que su huella es significativa) y el VAE. La cifra exacta no está disponible.
- **GPU de datacenter**: A100 40 GB u 80 GB y H100 para las variantes 14B en fp16/bf16 sin compromisos; RTX 6000 Ada (48 GB) como alternativa de una sola tarjeta.
- **GPU de consumo**: RTX 4090 (24 GB) puede ejecutar las variantes 14B en fp8 con descarga de bloques a RAM; las variantes 1,3B en fp16 caben en tarjetas de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070).
- **Despliegue**: ComfyUI (nativo, con flujos oficiales para cada variante), ComfyUI Desktop y Comfy Cloud. vLLM, llama.cpp, Ollama y TGI no aplican: son servidores de LLM, no de difusión.
- **Latencia y throughput**: no disponibles. Dependen de resolución, número de fotogramas, pasos de muestreo y precisión, y no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|
| Wan 2.1 (este repositorio), 1.3B | 1,3B | T2V, VACE, control, inpainting | Apache 2.0 | Empaquetado single-file para ComfyUI; 4,38 M de descargas |
| Wan 2.1 (este repositorio), 14B | 14B | T2V, I2V 480p/720p, FLF2V, VACE, control de cámara, alfa, doblaje | Apache 2.0 | Igual que la fila anterior |
| HunyuanVideo | 13B (dato de referencia general) | T2V, I2V | Licencia comunitaria propia de Tencent | Pesos abiertos; integración en ComfyUI vía nodos de terceros |
| CogVideoX-5B | 5B (dato de referencia general) | T2V, I2V, vídeo-a-vídeo | Apache 2.0 | Pesos abiertos en HuggingFace; integración en ComfyUI |
| LTX-Video | No disponible con fiabilidad | T2V, I2V | Licencia propia del proyecto | Pesos abiertos; integración en ComfyUI |

Solo las dos primeras filas están verificadas contra la información proporcionada; las tres alternativas se incluyen como referencia de categoría (generación de vídeo con pesos abiertos) y sus cifras deben contrastarse en sus repositorios antes de tomar una decisión. En licencia, Wan 2.1 es la opción más simple de las comparadas al ser Apache 2.0 en todas sus variantes empaquetadas aquí.

## Limitaciones y advertencias

- **No es un modelo original**: es un reempaquetado. Cualquier problema de calidad, sesgo o comportamiento proviene de los pesos de Wan-AI, Alibaba PAI y los derivados comunitarios, no de Comfy-Org.
- **Licencias de los derivados**: aunque el repositorio declara Apache 2.0, varios modelos base son *finetunes* de terceros (MAGREF, Wan-Alpha, InfiniteTalk, Fun V1.1). Conviene verificar la licencia de cada derivado antes de un uso comercial.
- **Riesgo de artefactos**: como todo modelo de difusión de vídeo, puede producir incoherencias temporales, deformaciones anatómicas, texto ilegible en pantalla y deriva de identidad entre fotogramas. No hay métricas publicadas que acoten este riesgo.
- **Resolución limitada**: las variantes empaquetadas apuntan a 480p y 720p; no se documentan modos de mayor resolución.
- **Idioma de los prompts**: no se documenta la cobertura del text encoder umT5-XXL ni su calidad por idioma; el comportamiento en castellano no está verificado.
- **Sin garantías de contenido**: no se documentan filtros de seguridad, moderación ni limitaciones de uso aceptable en esta model card.
- **Coste de almacenamiento y ancho de banda**: 543,8 GB de repositorio; descargar el conjunto completo no es necesario, pero exige seleccionar archivos por variante.
- **Compatibilidad**: los archivos están pensados para ComfyUI; fuera de ese ecosistema requieren adaptar la carga de *single-file* a la topología esperada por el pipeline original.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Comfy-Org/Wan-2.1
- Ejemplos oficiales de Wan en ComfyUI: https://comfyanonymous.github.io/ComfyUI_examples/wan
- Plantillas de flujos de trabajo: https://github.com/Comfy-Org/workflow_templates
- ComfyUI (GitHub): https://github.com/Comfy-Org/ComfyUI
- Documentación de ComfyUI: https://docs.comfy.org/
- Comfy (sitio principal): https://comfy.org/
- Comfy Desktop: https://comfy.org/download
- Comfy Cloud: https://cloud.comfy.org/
- Modelos base originales:
  - https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B
  - https://huggingface.co/Wan-AI/Wan2.1-T2V-14B
  - https://huggingface.co/Wan-AI/Wan2.1-I2V-14B-480P
  - https://huggingface.co/Wan-AI/Wan2.1-I2V-14B-720P
  - https://huggingface.co/Wan-AI/Wan2.1-FLF2V-14B-720P
  - https://huggingface.co/Wan-AI/Wan2.1-VACE-1.3B
  - https://huggingface.co/Wan-AI/Wan2.1-VACE-14B
  - https://huggingface.co/alibaba-pai/Wan2.1-Fun-V1.1-1.3B-Control
  - https://huggingface.co/alibaba-pai/Wan2.1-Fun-V1.1-1.3B-Control-Camera
  - https://huggingface.co/alibaba-pai/Wan2.1-Fun-V1.1-14B-Control-Camera
  - https://huggingface.co/alibaba-pai/Wan2.1-Fun-V1.1-1.3B-InP
  - https://huggingface.co/MAGREF-Video/MAGREF
  - https://huggingface.co/htdong/Wan-Alpha
  - https://huggingface.co/MeiGen-AI/InfiniteTalk
