# kandinskylab/Kandinsky-6.0-Lite-5s-Diffusers

## Resumen

Kandinsky 6.0 Lite es un modelo de difusión para generación conjunta de vídeo y audio sincronizado, desarrollado por KandinskyLab. Forma parte de la familia Kandinsky 6.0 Video, que incluye una variante Lite de 3B parámetros (este checkpoint) y una variante Pro de 29B parámetros. El modelo genera clips de 5 segundos a 24 fps con audio sincronizado a 44 kHz, incluyendo lip-sync, en modos texto-a-vídeo-audio (T2AV) e imagen-a-vídeo-audio (TI2AV). Un modelo de superresolución complementario eleva la resolución de salida hasta Full-HD (1920×1080).

El checkpoint contiene 3.176.632.424 parámetros en formato safetensors (aproximadamente 3,18B), con un repositorio de 35,3 GB. Se distribuye bajo licencia MIT y está integrado en el ecosistema Diffusers mediante la pipeline `Kandinsky6TI2VAPipeline`, además de contar con soporte en vLLM-Omni, SGLang, FastVideo y ComfyUI.

Su relevancia radica en que unifica generación de vídeo y audio en un único pipeline de difusión con solo 3B parámetros, un tamaño que lo hace viable en hardware de consumo con las optimizaciones adecuadas, y ofrece una licencia permisiva (MIT) poco habitual en modelos de vídeo generativo de gran escala.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de difusión (flow matching) para vídeo y audio; pipeline `Kandinsky6TI2VAPipeline` en Diffusers |
| Parámetros totales | 3.176.632.424 (≈3,18B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo generativo de vídeo, no de texto) |
| Tipos de cuantización | No disponible (pesos publicados en bfloat16; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | No disponible (los prompts se procesan con un text encoder Qwen2.5-VL) |
| Licencia | MIT |
| Formato de pesos | safetensors (Diffusers) |
| Resolución de salida | 480×864 por defecto; superresolución ×2, ×2.25 o ×4 hasta 1920×1080 |
| Duración del clip | 5 segundos (121 frames a 24 fps) |
| Audio | 44 kHz, sincronizado, con lip-sync |
| Pasos de inferencia | 50 por defecto; superresolución en 4 pasos por tile |
| Tamaño del repositorio | 35,3 GB |

## Arquitectura y entrenamiento

Kandinsky 6.0 Lite es un modelo de difusión basado en flow matching que genera de forma conjunta latentes de vídeo y de audio. El pipeline `Kandinsky6TI2VAPipeline` acepta tanto prompts de texto (T2AV) como una imagen de referencia que condiciona el primer frame (TI2AV), y produce 121 frames a 24 fps junto con una pista de audio a 44 kHz. La superresolución se realiza en el espacio latente K-VAE mediante difusión por tiles con ventanas Hann para mezclar los solapamientos, con factores de ×2, ×2.25 y ×4.

El text encoder es Qwen2.5-VL, que además permite la opción `expand_prompts=True` para reescribir prompts cortos en descripciones detalladas antes de la codificación (añade latencia pero no pesos adicionales). No se dispone en la información proporcionada de datos sobre el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. El informe técnico está referenciado como arXiv:2610.05608.

## Capacidades

- Generación de vídeo a partir de texto (T2AV) con audio sincronizado.
- Generación de vídeo a partir de una imagen de referencia (TI2AV), condicionando el primer frame.
- Generación de audio sincronizado a 44 kHz, incluyendo lip-sync con las caras del vídeo.
- Generación solo de vídeo mediante `sample_audio=False`.
- Expansión automática de prompts con `expand_prompts=True` usando Qwen2.5-VL.
- Superresolución de vídeo con `Kandinsky6SRPipeline` (×2, ×2.25, ×4) hasta Full-HD.
- Control de resolución, número de frames, pasos de inferencia y guidance scale.
- Integración con Diffusers, vLLM-Omni, SGLang, FastVideo y ComfyUI.
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-step (no es un modelo de lenguaje).

## Casos de uso

- Generación de clips publicitarios cortos: el modelo produce 5 segundos de vídeo con audio sincronizado a partir de un prompt descriptivo, adecuado para prototipos rápidos de anuncios o teasers con licencia MIT para uso comercial.
- Animación de imágenes fijas: mediante TI2AV se puede animar una fotografía o ilustración con movimiento y audio coherentes, útil en marketing y creación de contenido para redes sociales.
- Previsualización de storyboards: directores y equipos de producción pueden convertir descripciones de escenas en clips de 5 segundos con sonido para validar ideas antes del rodaje.
- Generación de vídeo con diálogo y lip-sync: el modelo sincroniza el audio con los labios, lo que permite crear clips de personajes hablando para demos, doblaje o contenido educativo.
- Superresolución de material existente: con `Kandinsky6SRPipeline` se pueden escalar frames generados o externos hasta Full-HD, integrándose en pipelines de postproducción.
- Creación de contenido para videojuegos y entornos virtuales: generación de cinemáticas cortas o assets animados con audio ambiental a partir de prompts.
- Investigación en generación multimodal: al ser un modelo de 3B con licencia MIT e integración en Diffusers, es adecuado para experimentación académica y fine-tuning sobre generación conjunta de vídeo y audio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en bfloat16 (≈6,4 GB solo pesos), el pipeline completo requiere espacio adicional para latentes de vídeo y audio; el uso de `enable_model_cpu_offload()` permite ejecutarlo con VRAM limitada.
- GPU recomendadas: A100 o H100 para inferencia sin offload y máxima velocidad; RTX 4090 (24 GB) para ejecución cómoda con offload parcial.
- Cabe en GPU de consumo: sí, en GPUs con 16-24 GB (RTX 4080, 4090, 3090) usando offload de CPU; en GPUs de 8-12 GB requeriría offload agresivo y mayor latencia.
- Opciones de despliegue: Diffusers (pipeline nativa), vLLM-Omni, SGLang, FastVideo y ComfyUI.
- Latencia y throughput: no disponibles en la información proporcionada. Se documenta que 50 pasos de inferencia es el valor por defecto y que la superresolución usa 4 pasos por tile.

## Comparativa con modelos similares

| Modelo | Parámetros | Salida | Audio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kandinsky 6.0 Lite | ≈3,18B | Vídeo 5 s + audio 44 kHz, hasta Full-HD con SR | Sí, sincronizado | MIT | Hugging Face, Diffusers, vLLM, SGLang, ComfyUI |
| Kandinsky 6.0 Pro | 29B | Vídeo 5 s + audio 44 kHz | Sí, sincronizado | No disponible en la información | Hugging Face (demo) |
| Otros modelos de vídeo generativo | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone en la información proporcionada de datos de benchmarks ni de especificaciones de modelos competidores comparables para establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- Duración fija de 5 segundos por clip; no se documenta generación de vídeos más largos de forma nativa.
- Resolución base de 480×864; para Full-HD es necesario aplicar el pipeline de superresolución, lo que añade cómputo y latencia.
- No se documentan los idiomas soportados por el text encoder ni el rendimiento multilingüe de los prompts.
- Riesgo de alucinación visual y de incoherencias temporales inherente a los modelos de difusión de vídeo; no se documentan tasas de error.
- No se dispone de información sobre sesgos del dataset de entrenamiento ni sobre filtros de contenido.
- La licencia MIT permite uso comercial, pero no se documentan restricciones adicionales sobre los datos de entrenamiento o el uso del audio generado.
- El modelo no es un LLM: no soporta tool calling, agentes ni razonamiento multi-step.
- Los requisitos de VRAM en producción sin offload pueden ser elevados para el pipeline completo con superresolución.

## Enlaces

- Hugging Face: https://huggingface.co/kandinskylab/Kandinsky-6.0-Lite-5s-Diffusers
- Informe técnico (arXiv): https://arxiv.org/pdf/2610.05608
- Página de modelos de vídeo de KandinskyLab: https://kandinskylab.ai/models/video/
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/kandinskylab/Kandinsky-6.0-Pro-distill-5s
- Documentación de Diffusers (pipeline Kandinsky6): https://huggingface.co/docs/diffusers/main/en/api/pipelines/kandinsky6
- Documentación de vLLM-Omni: https://docs.vllm.ai/projects/vllm-omni/en/latest/api/vllm_omni/diffusion/models/kandinsky6/
- Cookbook de SGLang: https://docs.sglang.io/cookbook/diffusion/Kandinsky/Kandinsky6
- FastVideo: https://haoailab.com/FastVideo/inference/kandinsky6/
- ComfyUI Registry: https://registry.comfy.org/nodes/kandinsky6
