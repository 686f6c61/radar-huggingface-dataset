# biali/LTX-Video-0.9.8-13B-distilled

## Resumen

LTX-Video 0.9.8 13B distilled es un modelo de generación de vídeo a partir de imagen (image-to-video) basado en arquitectura DiT (Diffusion Transformer), desarrollado originalmente por Lightricks. Esta ficha concreta corresponde a una redistribución publicada por el usuario `biali` en Hugging Face, con 13.042.569.344 parámetros reales verificados en los pesos safetensors y un tamaño de repositorio de 47,9 GB. El modelo forma parte de la familia LTX-Video 0.9.8, que incluye variantes dev, distilled, mix y fp8, tanto en 13B como en 2B.

La relevancia del modelo radica en su capacidad de generar vídeo a 30 FPS y resolución 1216×704 más rápido de lo que se tarda en reproducirlo, según la model card. La variante distilled está pensada para iteraciones rápidas, con menor consumo de VRAM y una ligera reducción de calidad frente a la variante dev, lo que la hace adecuada para prototipado y flujos de trabajo con recursos limitados.

El modelo se distribuye en formato diffusers y safetensors, está etiquetado únicamente para inglés y emplea una licencia "other" que conviene revisar antes de cualquier uso comercial. No se han publicado resultados de benchmarks en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) para generación de vídeo |
| Parámetros totales | 13.042.569.344 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | fp8 (variante ltxv-13b-0.9.8-distilled-fp8); otras no disponibles |
| Idiomas soportados | en |
| Licencia | other |
| Formato de pesos | safetensors (librería diffusers) |
| Pipeline | image-to-video (LTXConditionPipeline) |
| Resolución de salida | 1216×704 |
| Tasa de fotogramas | 30 FPS |
| Tamaño del repositorio | 47,9 GB |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura DiT (Diffusion Transformer), que sustituye el UNet clásico de los modelos de difusión por un transformer como backbone de denoising. Según la model card, LTX-Video es el primer modelo de generación de vídeo basado en DiT capaz de generar vídeo de alta calidad en tiempo real, produciendo 30 FPS a 1216×704 a una velocidad superior a la de reproducción.

El modelo fue entrenado sobre un dataset a gran escala de vídeos diversos, lo que le permite generar contenido realista y variado. La variante distilled aplica destilación para reducir el número de pasos de inferencia necesarios, lo que se traduce en menor latencia y menor uso de VRAM a costa de una ligera pérdida de calidad frente a la variante dev. No se dispone de información detallada sobre el número exacto de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO, por lo que estos datos se consideran no disponibles.

## Capacidades

- Generación de vídeo a partir de una imagen de entrada (image-to-video) a 1216×704 y 30 FPS.
- Generación de vídeo de alta resolución con contenido realista y variado.
- Inferencia en tiempo real: el modelo genera vídeo más rápido de lo que se reproduce.
- Variante distilled optimizada para iteraciones rápidas con menor consumo de VRAM.
- Integración con diffusers mediante `LTXConditionPipeline`.
- Flujos de trabajo en ComfyUI mediante el repositorio ComfyUI-LTXVideo.
- Soporte de modo multi-scale rendering combinando variantes dev y distilled (flujo mix).
- Soporte lingüístico limitado al inglés.
- No se documentan capacidades de tool calling, agentes, visión general, audio ni modo thinking, por lo que se consideran no disponibles.

## Casos de uso

- Prototipado rápido de vídeo generativo: la variante distilled permite iterar sobre prompts e imágenes de entrada con menor latencia y VRAM que la variante dev, adecuada para explorar ideas antes de pasar a producción con el modelo completo.
- Animación de imágenes fijas para marketing: a partir de una fotografía de producto o un keyframe se puede generar un clip a 1216×704 y 30 FPS para anuncios o redes sociales, gracias a la resolución y tasa de fotogramas nativas.
- Previsualización de storyboards en cine y publicidad: convertir frames de un guion gráfico en clips animados para validar ritmo y composición antes del rodaje, aprovechando la generación en tiempo real.
- Generación de contenido para redes sociales: creación de clips cortos animados a partir de imágenes estáticas con calidad suficiente para plataformas que aceptan 30 FPS.
- Pipelines de postproducción en ComfyUI: integración del modelo en flujos nodales de ComfyUI mediante los workflows oficiales, combinando las variantes distilled y dev en multi-scale rendering para equilibrar velocidad y calidad.
- Investigación en difusión para vídeo: el modelo sirve como base para experimentos con arquitecturas DiT, destilación y técnicas de reducción de pasos de inferencia, dado que sus pesos están en safetensors y es compatible con diffusers.
- Generación de material de previsualización en estudios con VRAM limitada: la variante distilled y su versión fp8 permiten desplegar el modelo en GPUs de gama alta de consumo, facilitando pruebas locales sin infraestructura de datacenter.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el tamaño del repositorio es de 47,9 GB en safetensors, por lo que la inferencia en precisión completa requiere GPUs de datacenter con 48 GB o más (A100 80 GB, H100). La variante fp8 reduce los requisitos aproximadamente a la mitad.
- GPU recomendadas: A100 80 GB o H100 para la variante de 13B en precisión completa; la variante fp8 y la distilled permiten despliegue en GPUs con menos VRAM.
- Cabe en GPU de consumo: la variante distilled está descrita como ideal para iteraciones rápidas y menor uso de VRAM; la variante fp8 de la distilled es la opción más viable para GPUs de consumo de gama alta (RTX 4090, 24 GB), aunque no se especifica el mínimo exacto.
- Opciones de despliegue: diffusers (`LTXConditionPipeline`), ComfyUI mediante ComfyUI-LTXVideo, y el repositorio oficial LTX-Video con `inference.py` y configs YAML.
- Latencia y throughput: la model card afirma generación a 30 FPS a 1216×704 más rápida que la reproducción en tiempo real; no se proporcionan cifras concretas de latencia ni throughput por GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Resolución / FPS | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LTX-Video 0.9.8 13B distilled (esta ficha) | 13,04 B | 1216×704 / 30 FPS | no disponible | other | Hugging Face (redistribución por biali) |
| LTX-Video 0.9.8 13B dev | 13 B (familia) | 1216×704 / 30 FPS | no disponible | other | Hugging Face / Lightricks |
| LTX-Video 0.9.8 2B distilled | 2 B (familia) | no disponible | no disponible | other | Hugging Face / Lightricks |
| LTX-Video 0.9.8 13B distilled fp8 | 13 B (cuantizado) | 1216×704 / 30 FPS | no disponible | other | Hugging Face / Lightricks |

La comparativa se limita a variantes de la misma familia porque la información proporcionada no incluye datos de otros modelos de image-to-video comparables. La variante dev ofrece la mayor calidad a costa de más VRAM; la distilled prioriza velocidad y menor consumo; la 2B distilled reduce el tamaño para entornos con VRAM muy limitada; y las variantes fp8 cuantizan los pesos para reducir requisitos de memoria.

## Limitaciones y advertencias

- La variante distilled presenta una ligera reducción de calidad frente a la variante dev, según la model card.
- El modelo está etiquetado únicamente para inglés; no se documenta soporte multilingüe.
- Licencia "other": es imprescindible revisar los términos exactos de la licencia de Lightricks antes de cualquier uso comercial, ya que no es una licencia open source estándar.
- Esta ficha corresponde a una redistribución por el usuario `biali` con solo 14 descargas y 0 likes; conviene verificar la integridad de los pesos frente al repositorio oficial de Lightricks.
- No se dispone de información sobre sesgos, tasas de alucinación ni limitaciones de contexto del modelo.
- El tamaño de 47,9 GB en safetensors implica requisitos de almacenamiento y VRAM considerables en precisión completa.
- No se han publicado benchmarks que permitan validar el rendimiento de forma objetiva.
- El modelo genera vídeo, no texto; no debe evaluarse con métricas de LLM como MMLU o HumanEval.

## Enlaces

- [Hugging Face: biali/LTX-Video-0.9.8-13B-distilled](https://huggingface.co/biali/LTX-Video-0.9.8-13B-distilled)
- [Repositorio oficial LTX-Video (GitHub)](https://github.com/Lightricks/LTX-Video)
- [ComfyUI-LTXVideo (GitHub)](https://github.com/Lightricks/ComfyUI-LTXVideo)
- [Config ltxv-13b-0.9.8-dev.yaml](https://github.com/Lightricks/LTX-Video/blob/main/configs/ltxv-13b-0.9.8-dev.yaml)
- [Config ltxv-13b-0.9.8-distilled-fp8.yaml](https://github.com/Lightricks/LTX-Video/blob/main/configs/ltxv-13b-0.9.8-distilled-fp8.yaml)
- [Workflow ComfyUI ltxv-13b-dist-i2v-base.json](https://github.com/Lightricks/ComfyUI-LTXVideo/blob/master/example_workflows/13b-distilled/ltxv-13b-dist-i2v-base.json)
- [Workflow ComfyUI ltxv-13b-dist-i2v-base-fp8.json](https://github.com/Lightricks/ComfyUI-LTXVideo/blob/master/example_workflows/13b-distilled/ltxv-13b-dist-i2v-base-fp8.json)
- [Workflow ComfyUI ltxv-13b-i2v-mixed-multiscale.json](https://github.com/Lightricks/ComfyUI-LTXVideo/blob/master/example_workflows/ltxv-13b-i2v-mixed-multiscale.json)
- [LTX Studio (workspace de modelos)](https://app.ltx.studio/motion-workspace?videoModel=ltxv-13b)
