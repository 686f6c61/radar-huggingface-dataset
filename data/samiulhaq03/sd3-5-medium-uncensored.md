# samiulhaq03/SD3.5-Medium-Uncensored

## Resumen

SD3.5-Medium-Uncensored es una versión modificada de Stable Diffusion 3.5 Medium de Stability AI, publicada por el usuario samiulhaq03 (el repositorio referencia internamente al alias Umranz). El modelo parte de la arquitectura MM-DiT (Multimodal Diffusion Transformer) de SD3.5 Medium y aplica una técnica de "abliteration" sobre las proyecciones de condicionamiento del texto para eliminar la alineación de seguridad del modelo base. El resultado es un generador texto-a-imagen de 2.469.663.936 parámetros que produce imágenes a resolución nativa de 1024x1024 sin los filtros de contenido del original.

La relevancia de esta ficha es fundamentalmente técnica y de evaluación: documenta un caso de eliminación de alineación de seguridad mediante proyección de subespacio en un modelo de difusión, lo que resulta útil para estudiar mecanismos de ablación, riesgos de desalineación y comportamiento de modelos "abliterated". No se trata de un modelo nuevo entrenado desde cero, sino de una intervención quirúrgica sobre los pesos de condicionamiento de un modelo existente.

El modelo se distribuye en formato diffusers con pesos safetensors, ocupa 16,3 GB en el repositorio y solo declara soporte para inglés. La licencia es "other" con el identificador stabilityai-ai-community, heredada del modelo base, lo que impone restricciones adicionales al uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MM-DiT (Multimodal Diffusion Transformer), difusión latente texto-a-imagen |
| Parametros totales | 2.469.663.936 (según safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de difusión, no LLM; condicionamiento textual vía T5/CLIP según el pipeline SD3.5) |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16/safetensors; no se documentan variantes GGUF o cuantizadas) |
| Idiomas soportados | en (inglés) |
| Licencia | other, identificada como stabilityai-ai-community |
| Formato de pesos | safetensors (librería diffusers, pipeline StableDiffusion3Pipeline) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura MM-DiT de Stable Diffusion 3.5 Medium: un transformer de difusión multimodal que procesa de forma conjunta los tokens de imagen latente y los embeddings de condicionamiento textual, con resolución nativa de 1024x1024. No hay evidencia en la información disponible de un reentrenamiento del modelo; el autor describe el proceso como una "restored-conditioning release", es decir, una modificación de los pesos de condicionamiento del modelo base.

La innovación declarada es el método "Heretic-DiT" de ablación por proyección de subespacio calibrada, aplicado sobre dos módulos: `context_embedder` (proyección de 4096 a 1536 dimensiones) y `linear_1` (proyección de 2048 a 1536 dimensiones). La formulación publicada en la model card es una regularización de identidad con gamma = 15.0 y una actualización de pesos proyectada sobre un subespacio V2. La model card afirma que todas las ediciones están "permanentemente horneadas" en las proyecciones de condicionamiento, por lo que el coste de inferencia adicional es de 0 ms. No se documentan datos de entrenamiento, número de tokens, composición del dataset ni etapas de RLHF/DPO, ya que no hubo entrenamiento nuevo según la información descrita.

## Capacidades

- Generación de imágenes texto-a-imagen a resolución nativa de 1024x1024.
- Eliminación declarada de la alineación de seguridad ("100% uncensored / restored conditioning"), lo que permite generar contenido que el modelo base rechazaría o condicionaría.
- Control mediante prompt textual en inglés con parámetros de muestreo estándar del pipeline SD3.5 (`num_inference_steps`, `guidance_scale`, `height`, `width`).
- Compatibilidad con el ecosistema diffusers mediante `StableDiffusion3Pipeline`.
- Sin sobrecoste de inferencia respecto al modelo base, según la model card (ediciones incorporadas en los pesos).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión de entrada, audio ni modo "thinking", por tratarse de un modelo de difusión y no de un LLM.

## Casos de uso

- Investigación sobre ablación de alineación: el modelo sirve como caso de estudio controlado para medir cómo la proyección de subespacio sobre `context_embedder` y `linear_1` altera la distribución de salidas y la eficacia de los filtros de seguridad del modelo base.
- Evaluación de clasificadores de seguridad: permite generar lotes de imágenes con prompts adversarios para probar la robustez de filtros de contenido en pipelines de moderación.
- Auditoría de licencias y cumplimiento: útil para equipos jurídicos y de compliance que necesitan entender qué prácticas de modificación de pesos entran en conflicto con la licencia stabilityai-ai-community.
- Reproducción de experimentos de "abliteration" en modelos de difusión: la formulación matemática publicada permite replicar el método sobre otras variantes de SD3.5 y comparar resultados.
- Generación de imágenes artísticas sin restricciones de condicionamiento: para creadores que trabajan con temáticas que los filtros del modelo base bloquean, asumiendo la responsabilidad legal y ética del contenido generado.
- Benchmarking de pipelines de inferencia: al mantener el mismo coste computacional que SD3.5 Medium, puede usarse para comparar throughput y latencia de despliegues (diffusers, vLLM no aplica a difusión, ComfyUI) sin confundir el efecto de la modificación de pesos con el del runtime.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 10-12 GB considerando el pipeline completo (transformer de ~2,47 mil millones de parámetros, más codificadores de texto T5 y CLIP del pipeline SD3.5 y el VAE), con margen para latentes a 1024x1024. No se dispone de mediciones oficiales en la información proporcionada.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB) para inferencia cómoda a 1024x1024 en bfloat16.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) y previsiblemente en RTX 3090 (24 GB); en GPUs de 12-16 GB requeriría técnicas de offloading o cuantización no documentadas por el autor.
- Opciones de despliegue: diffusers (`StableDiffusion3Pipeline`) es el camino documentado; ComfyUI y AUTOMATIC1111 no están confirmados en la información disponible; llama.cpp, Ollama, vLLM y TGI no son aplicables a este tipo de modelo de difusión.
- Latencia y throughput: no disponible; la model card solo afirma que el sobrecoste de la modificación es de 0 ms.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion | Contexto/condicionamiento | Licencia | Estado de seguridad |
|---|---|---|---|---|---|
| SD3.5-Medium-Uncensored (este) | ~2,47 mil millones | 1024x1024 | texto en inglés | other (stabilityai-ai-community) | alineación eliminada |
| Stable Diffusion 3.5 Medium (base) | ~2,47 mil millones | 1024x1024 | texto multilingüe según base | stabilityai-ai-community | alineado con filtros de seguridad |
| Stable Diffusion 3.5 Large | ~8 mil millones | 1024x1024 | texto multilingüe según base | stabilityai-ai-community | alineado con filtros de seguridad |
| FLUX.1-dev | ~12 mil millones | 1024x1024 y superiores | texto en inglés | no comercial (FLUX.1-dev) | alineado, con variantes comunitarias |

Los datos de parámetros y resolución de los modelos comparados provienen del conocimiento general de esos modelos; los detalles específicos de licencia y comportamiento de seguridad de variantes comunitarias no están en la información proporcionada y deben verificarse en sus repositorios oficiales.

## Limitaciones y advertencias

- Eliminación deliberada de la alineación de seguridad: el modelo está diseñado para producir contenido que el base rechazaría, incluyendo potencialmente material sexual, violento o dañino. Su uso en producción conlleva riesgos legales y reputacionales elevados.
- Licencia restrictiva: la licencia stabilityai-ai-community impone condiciones al uso comercial y puede prohibir la redistribución de modelos modificados; la modificación de pesos sin autorización puede constituir un incumplimiento de la licencia del modelo base.
- Riesgo de degradación cualitativa: la ablación sobre `context_embedder` y `linear_1` puede alterar la fidelidad prompt-imagen y la coherencia semántica en comparación con SD3.5 Medium; no se han publicado evaluaciones objetivas que cuantifiquen esta degradación.
- Solo inglés: el condicionamiento textual está declarado únicamente para inglés, lo que limita su uso multilingüe.
- Sin datos de benchmarks, latencia ni cuantizaciones publicadas: no es posible evaluar su rendimiento relativo con rigor a partir de la información disponible.
- Repositorio con 0 descargas y 0 likes, creado y actualizado el mismo día: no hay evidencia de validación comunitaria, pruebas independientes ni trazabilidad del proceso de modificación más allá de la model card.
- Riesgo de alucinación visual: como todo modelo de difusión, puede generar detalles anatómicos o contextuales incorrectos, especialmente en prompts ambiguos o poco representados en el dataset del modelo base.
- Sin garantías de reproducibilidad: la formulación matemática publicada no incluye scripts de ablación ni pesos intermedios, lo que dificulta verificar el método.

## Enlaces

- Hugging Face: https://huggingface.co/samiulhaq03/SD3.5-Medium-Uncensored
- Modelo base (Stability AI SD3.5 Medium): https://huggingface.co/stabilityai/stable-diffusion-3.5-medium
- Documentación diffusers para SD3.5: https://huggingface.co/docs/diffusers/main/en/api/pipelines/stable_diffusion/stable_diffusion_3
- Licencia stabilityai-ai-community: https://huggingface.co/stabilityai/stable-diffusion-3.5-medium/blob/main/LICENSE.md
- No se han encontrado en la información proporcionada papers, blogs, repositorios de código ni demos adicionales asociados a este modelo.
