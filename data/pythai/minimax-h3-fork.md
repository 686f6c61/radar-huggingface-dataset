# PYTHAI/MiniMax-H3-fork

## Resumen

MiniMax-H3-fork es un repositorio de empaquetado (repackaging) para ComfyUI del modelo de difusión MiniMax H3, publicado por el usuario PYTHAI bajo el paraguas del proyecto mindX. No contiene pesos propios: es un fork fijado al commit `4b53a35191437de05370da548e59aeabe2a5a09a` del repositorio `Comfy-Org/MiniMax-H3`, y los pesos reales se cargan desde el origen mediante `from_pretrained` con esa revisión. Su función es servir como referencia reproducible de los ficheros, cuantizaciones y workflows necesarios para ejecutar MiniMax H3 en ComfyUI.

El modelo subyacente, MiniMax H3, es un modelo generativo de vídeo y audio de la familia MiniMax, distribuido en variantes `fl2va` (frame-level to video+audio) y `ref2va` (reference to video+audio), con versiones completas y podadas (`pruned`). Incorpora un text encoder basado en Qwen3-VL-32B, VAEs separados para vídeo y audio, LoRAs Turbo de 4 y 8 pasos, un ControlNet Union y un conjunto de embeddings de efectos visuales.

La relevancia de este fork es acotada: no aporta mejoras técnicas ni pesos nuevos, sino una instantánea documentada de los artefactos de ComfyUI. Resulta útil para quien necesite reproducir exactamente una configuración concreta de MiniMax H3 en ComfyUI y quiera una referencia de ficheros, cuantizaciones y workflows sin depender de que el repositorio original mantenga esa revisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | modelo de difusión (vídeo + audio), con text encoder Qwen3-VL-32B; detalles internos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16, int8_convrot, fp8_scaled, w6a8 (pruned), nvfp4_awq (text encoder) |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community-license-agreement (etiquetada como `other`) |
| Formato de pesos | safetensors (single-file para ComfyUI); los pesos no se alojan en este repo |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna de MiniMax H3 en la documentación proporcionada: no se detallan el tipo de backbone (transformer de difusión, DiT u otro), el número de parámetros, la composición del dataset de entrenamiento ni si hubo etapas de RLHF, DPO o ajuste por preferencias. La model card del fork se limita a describir el empaquetado para ComfyUI.

Lo que sí se documenta es la estructura de artefactos: dos familias de modelos de difusión (`fl2va` y `ref2va`), cada una en versión completa y podada, con variantes de cuantización bf16, int8_convrot, w6a8 y fp8_scaled; un text encoder Qwen3-VL-32B en bf16, int8_convrot y nvfp4_awq (esta última convertida desde `cybermotaz/Qwen3-VL-32B-Instruct-NVFP4` y utilizable sin GPU Blackwell); VAEs de audio en fp32 y de vídeo en int8_convrot; LoRAs Turbo de 4 y 8 pasos para `fl2v` y de 4 pasos para `ref2v`; LoRAs Pika H3 Flex; un ControlNet Union podado; y diez embeddings de efectos visuales. La recomendación del autor es usar `int8_convrot` con PyTorch cu130 y recurrir a `fp8_scaled` solo si no es posible.

## Capacidades

- Generación de vídeo a partir de texto (text to video), con workflows específicos en ComfyUI.
- Generación de vídeo a partir de imagen (image to video).
- Generación de vídeo a partir de referencias (reference to video).
- Generación conjunta de vídeo y audio en las variantes `fl2va` y `ref2va`.
- Control estructural mediante ControlNet Union (`MiniMax-H3-Fun-Controlnet-Union`).
- Aceleración por destilación: LoRAs Turbo de 4 y 8 pasos para reducir el número de pasos de muestreo.
- Estilización y efectos visuales mediante embeddings de prompt (`embedding:minimaxh3_*`), con diez efectos predefinidos.
- Codificación de texto e imagen mediante el text encoder Qwen3-VL-32B.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni modo thinking; el modelo es generativo audiovisual, no un LLM conversacional.

## Casos de uso

- Generación de clips de vídeo a partir de prompts de texto en ComfyUI: usando el workflow `video_minimax_h3_t2v.json` y el modelo `fl2va` (completo o podado), se puede producir vídeo con audio sincronizado sin salir del ecosistema ComfyUI.
- Animación de imágenes fijas: con el workflow `video_minimax_h3_i2v.json` y la variante `fl2va`, se convierte una imagen de entrada en un clip animado, útil para prototipado de storyboards o contenido para redes.
- Consistencia de personaje o estilo entre planos: la variante `ref2va` y el workflow `video_minimax_h3_r2v.json` permiten condicionar la generación a referencias visuales, lo que encaja en producción de series cortas o vídeos con identidad visual fija.
- Control de movimiento y composición: con el ControlNet Union podado (`minimax_h3_fun_controlnet_union_pruned_*`) se puede imponer estructura espacial o de movimiento sobre la generación, útil en previsualización de VFX.
- Iteración rápida en preproducción: las LoRAs Turbo de 4 y 8 pasos reducen el coste de muestreo, lo que permite generar borradores en menos pasos antes de un render final con el modelo completo en bf16.
- Efectos visuales estilizados: los embeddings (`minimaxh3_bullet_time`, `minimaxh3_fire_breath`, `minimaxh3_storm_magic`, etc.) se invocan desde el nodo CLIPTextEncode con la sintaxis `embedding:<nombre>`, lo que facilita aplicar efectos concretos sin prompts largos.
- Reproducibilidad de pipelines: al estar fijado a un commit concreto, el fork sirve como referencia para equipos que necesiten reconstruir exactamente una configuración de ComfyUI con MiniMax H3.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Como referencia cualitativa, el text encoder es Qwen3-VL-32B (32 000 millones de parámetros), lo que implica requisitos elevados incluso en cuantizaciones reducidas; la variante `nvfp4_awq` está pensada para reducir huella y, según el autor, no requiere GPU Blackwell.
- GPU recomendadas: no disponible. La documentación solo menciona que `int8_convrot` requiere PyTorch con CUDA 13.0 (cu130).
- Compatibilidad con GPU de consumo: no confirmada. La existencia de variantes podadas (`pruned`) y cuantizadas (`w6a8`, `fp8_scaled`, `nvfp4_awq`) sugiere que el objetivo es ampliar el rango de hardware, pero no se aportan cifras de VRAM ni modelos concretos de GPU.
- Opciones de despliegue: ComfyUI es el entorno documentado (ficheros en `models/diffusion_models`, `models/text_encoders`, `models/loras`, `models/vae`, `models/model_patches` y `models/embeddings`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un modelo de difusión de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones internas de MiniMax H3 que permitan una comparación cuantitativa fiable con otros modelos de generación de vídeo. La información proporcionada solo permite comparar el fork con su origen:

| Aspecto | PYTHAI/MiniMax-H3-fork | Comfy-Org/MiniMax-H3 |
|---|---|---|
| Contenido | Referencia y documentación de ficheros; sin pesos | Pesos y artefactos reales |
| Revisión | Fijada a `4b53a35191437de05370da548e59aeabe2a5a09a` | Rama principal, sujeta a cambios |
| Licencia | minimax-h3-community-license-agreement | minimax-h3-community-license-agreement |
| Descargas / likes | 0 / 0 | no disponible |
| Uso previsto | Reproducibilidad y referencia | Ejecución en ComfyUI |

Para alternativas de la misma categoría (generación de vídeo con audio) no hay datos en la información disponible; se indica "no disponible".

## Limitaciones y advertencias

- El repositorio no contiene pesos: cualquier uso requiere descargarlos desde `Comfy-Org/MiniMax-H3` en la revisión indicada, con la dependencia externa que ello implica.
- La licencia es la MiniMax H3 Community License Agreement, etiquetada como `other`; no es una licencia open source estándar y debe revisarse antes de cualquier uso comercial.
- No se documentan sesgos, tasas de alucinación visual ni limitaciones idiomáticas del modelo subyacente.
- No hay información sobre límites de duración, resolución máxima o número de frames por generación.
- El fork está fijado a un commit concreto; no recibirá actualizaciones ni correcciones del modelo original salvo que el autor lo revise.
- El uso de `int8_convrot` exige PyTorch con CUDA 13.0; `fp8_scaled` se presenta solo como alternativa cuando no sea posible usar int8.
- El text encoder Qwen3-VL-32B es un componente pesado que condiciona los requisitos de memoria del pipeline completo.
- El fork tiene 0 descargas y 0 likes, por lo que no cuenta con validación de la comunidad.
- No se aportan métricas de calidad, latencia ni throughput que permitan evaluar su idoneidad en producción.

## Enlaces

- Repositorio del fork: https://huggingface.co/PYTHAI/MiniMax-H3-fork
- Repositorio original del modelo: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Licencia: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE
- Repositorio de ComfyUI empaquetado: https://huggingface.co/Comfy-Org/MiniMax-H3/tree/4b53a35191437de05370da548e59aeabe2a5a09a
- Variante Turbo: https://huggingface.co/lightx2v/Minimax-h3-Turbo
- ControlNet Union: https://huggingface.co/alibaba-pai/MiniMax-H3-Fun-Controlnet-Union
- Repositorio experimental: https://huggingface.co/Kijai/MiniMax-H3-experimental
- Cuantización NVFP4 del text encoder: https://huggingface.co/cybermotaz/Qwen3-VL-32B-Instruct-NVFP4
- Workflow image to video: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_minimax_h3_i2v.json
- Workflow reference to video: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_minimax_h3_r2v.json
- Workflow text to video: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_minimax_h3_t2v.json
- Proyecto mindX: https://mindx.pythai.net
