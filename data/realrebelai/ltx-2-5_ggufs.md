# realrebelai/LTX-2.5_GGUFs

## Resumen

LTX-2.5 es un modelo de generación de vídeo y audio sincronizado desarrollado por Lightricks, que produce ambas modalidades en una sola pasada mediante un transformer de difusión (DiT) de doble flujo. Esta versión, publicada por RealRebelAI, ofrece cuantizaciones GGUF del transformer original (21 004 millones de parámetros en bf16, 39 GB) para su uso directo en ComfyUI a través de la extensión ComfyUI-GGUF. Los archivos reducen el peso a entre 8 y 22 GB, lo que permite ejecutar el modelo en GPUs de consumo con requisitos de VRAM moderados.

La relevancia de esta ficha radica en que LTX-2.5 es uno de los primeros modelos abiertos que integra audio y vídeo en un único proceso generativo, y su cuantización facilita su adopción en flujos de trabajo locales sin necesidad de infraestructura de servidor. La conversión incluye una corrección específica para que ComfyUI lea la configuración completa del transformer, evitando los errores de forma que aparecen con conversiones estándar. Se ofrecen siete niveles de cuantización, desde Q8_0 (casi sin pérdida) hasta Q2_K (mínima calidad), con la recomendación del autor de usar Q4_K_M como equilibrio entre calidad y tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT de doble flujo (video y audio) con atención cruzada |
| Parametros totales | 21 004 025 600 (21B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_K_S, Q3_K_M, Q2_K |
| Idiomas soportados | no disponible |
| Licencia | see-base-model (consultar la del modelo base Lightricks/LTX-2.5) |
| Formato de pesos | GGUF (el modelo base usa safetensors) |

## Arquitectura y entrenamiento

LTX-2.5 emplea un transformer de difusión (DiT) con dos flujos paralelos: una vía de vídeo con ancho de 4096 y una vía de audio con ancho de 2048, conectadas mediante atención cruzada que permite generar ambas señales de forma coherente. El modelo incluye tablas de modulación de 9 filas y conectores específicos para audio y texto, lo que lo diferencia de arquitecturas anteriores como LTX-2.3. No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens procesados ni el uso de técnicas como RLHF o DPO en la información disponible.

La versión GGUF se ha convertido desde el transformer bf16 oficial mediante un conversor en streaming y posterior cuantización con llama-quantize. Se preservan en alta precisión capas críticas como `patchify_proj`, `audio_patchify_proj`, `to_gate_logits`, `scale_shift_table`, `keyframes_abs_pos_embedding`, `caption_projection`, `time_embed`, `proj_out` y `rope`, ya que cuantizarlas degrada la sincronización audio-vídeo. Además, los archivos incluyen la configuración completa del transformer (61 claves) como campo KV en el GGUF, lo que permite que ComfyUI construya el modelo con las dimensiones correctas sin intervención manual.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) y de imagen (image-to-video).
- Generación de audio sincronizado con el vídeo en la misma pasada de inferencia.
- Soporte de dos modos de inferencia: "Distilled" (pocos pasos, CFG 1.0) y "Dev" (pasos completos con CFG real).
- Ejecución con bajo consumo de VRAM gracias a las cuantizaciones GGUF (desde 8 GB).
- Integración nativa con ComfyUI mediante el nodo Unet Loader (GGUF) de ComfyUI-GGUF.
- Requiere componentes adicionales: text encoder Gemma-4-12B con proyecciones de LTX, VAE de vídeo y VAE de audio (dos VAEs separados).

## Casos de uso

- Creación de vídeos cortos para redes sociales: el modelo puede generar clips de pocos segundos con audio sincronizado a partir de una descripción textual, reduciendo el tiempo de producción de contenido promocional o de entretenimiento.
- Prototipado de escenas para cine o publicidad: los equipos creativos pueden generar borradores visuales y sonoros en minutos para evaluar conceptos antes de la producción final, gracias a la cuantización que permite iterar en una GPU de consumo.
- Generación de vídeos educativos con narración automática: al producir audio y vídeo de forma conjunta, se pueden crear explicaciones animadas con locución sin necesidad de herramientas de doblaje externas.
- Doblaje y localización de contenidos: el modelo acepta prompts en distintos idiomas (aunque no se especifican cuáles) y genera audio que puede adaptarse a mercados locales, siempre que se valide la calidad del habla generada.
- Automatización de demos de producto: las empresas pueden generar vídeos de muestra de sus aplicaciones o servicios a partir de descripciones, acelerando la creación de material de ventas.
- Investigación en generación multimodal: el modelo sirve como base para estudiar la coherencia entre vídeo y audio, y las cuantizaciones permiten experimentar en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos objetivos de calidad (p. ej., FVD, CLIP score, sincronización audio-vídeo) ni comparaciones con otros modelos de generación de vídeo en la documentación del repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización:
  - Q8_0 (~22 GB): requiere una GPU con al menos 24 GB de VRAM (p. ej., RTX 4090, A5000).
  - Q6_K (~18 GB): GPU con 20-24 GB (RTX 4090, RTX 6000 Ada).
  - Q5_K_M (~15 GB): GPU con 16-20 GB (RTX 4080, RTX 3090).
  - Q4_K_M / Q4_K_S (~13 GB): GPU con 16 GB (RTX 4080, RTX 3080 Ti, RTX 3090).
  - Q3_K_M (~11 GB): GPU con 12-16 GB (RTX 3060 12GB, RTX 4070).
  - Q2_K (~9 GB): GPU con 10-12 GB (RTX 3060 12GB, RTX 4060 Ti).
- Además del transformer, hay que cargar el text encoder Gemma-4-12B y dos VAEs, lo que incrementa el consumo total de VRAM (estimación adicional de 8-12 GB dependiendo de la cuantización de estos componentes, no incluida en los tamaños listados).
- Despliegue recomendado: ComfyUI con la extensión ComfyUI-GGUF, usando el nodo Unet Loader (GGUF). No se mencionan otros motores de inferencia como vLLM o llama.cpp para este modelo concreto.
- Latencia y throughput: no disponibles. Dependen del hardware, del número de pasos de difusión y de la resolución de salida.

## Comparativa con modelos similares

No se dispone de datos comparativos con otras alternativas de generación de vídeo (p. ej., LTX-2.3, Wan, Hunyuan Video) en la información proporcionada. La única comparación posible es con el modelo base sin cuantizar: el transformer bf16 ocupa 39 GB, mientras que las cuantizaciones GGUF reducen el tamaño a 8-22 GB con una pérdida de calidad que el autor describe como "casi sin pérdida" en Q8_0 y "degradación acusada" en Q2_K. Para una evaluación justa, se necesitarían benchmarks estandarizados que no se han publicado.

## Limitaciones y advertencias

- La licencia del modelo es "see-base-model": es imprescindible revisar los términos de la licencia del modelo base Lightricks/LTX-2.5 antes de cualquier uso comercial, ya que pueden existir restricciones.
- Las cuantizaciones bajas (Q3_K_M, Q2_K) producen una pérdida notable de detalle y posible degradación del audio, aunque las capas críticas se preservan en alta precisión para evitar desincronizaciones graves.
- El modelo requiere componentes adicionales específicos (text encoder con proyecciones propias, dos VAEs) que no se incluyen en este repositorio; usar versiones genéricas de Gemma o un único VAE provocará fallos de carga o vídeo sin audio.
- No se especifican los idiomas soportados ni la longitud máxima de vídeo generable; estos parámetros dependen del modelo base y no se documentan en la ficha.
- No hay información sobre sesgos, alucinaciones o riesgos de contenido inapropiado; al ser un modelo generativo de vídeo, se recomienda validar los resultados antes de publicarlos.
- La fecha de creación del repositorio (2026-08-12) es posterior a la fecha actual, lo que sugiere que la información puede ser especulativa o de un entorno de prueba; verificar la disponibilidad real del modelo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/realrebelai/LTX-2.5_GGUFs
- Modelo base Lightricks/LTX-2.5: https://huggingface.co/Lightricks/LTX-2.5
- ComfyUI-GGUF (extensión de ComfyUI): https://github.com/city96/ComfyUI-GGUF
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
- Autor de la cuantización (RealRebelAI): https://huggingface.co/realrebelai · https://github.com/RealRebelAI · https://x.com/realrebelai
