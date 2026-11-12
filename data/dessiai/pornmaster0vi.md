# DessiAi/pornmaster0vi

## Resumen

DessiAi/pornmaster0vi es un modelo alojado en Hugging Face por el usuario DessiAi, etiquetado con los tags `not-for-all-audiences` y `ultra-realistic`. La model card lo describe como una variante en FP32 y el ejemplo de uso corresponde a un prompt de generación de imágenes de personajes (estilo anime y retrato digital), además de incluir un ejemplo de llamada a un endpoint HTTP de text-to-image. Por tanto, la evidencia disponible apunta a un modelo de difusión para generación de imágenes y no a un modelo de lenguaje, aunque la información oficial no lo declara de forma explícita.

El repositorio tiene un tamaño de 0,3 GB, lo que es coherente con pesos de un modelo de difusión en FP32 de pequeño tamaño o con un subconjunto de pesos, pero no con un LLM de miles de millones de parámetros. No se publican datos de arquitectura, parámetros, contexto, licencia, idiomas ni pipeline en la información disponible.

La relevancia de esta ficha es limitada y fundamentalmente descriptiva: se trata de un modelo con cero descargas y cero likes en el momento de la consulta, sin documentación técnica verificable, y con contenido marcado como no apto para todo público. Cualquier evaluación de producción debe hacerse con cautela y verificando directamente el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card sugiere un modelo de difusión text-to-image, sin confirmación oficial) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible (no aplica a un modelo de imagen) |
| Tipos de cuantizacion | no disponible; la model card indica una variante "FP32" |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repo ocupa 0,3 GB; no se detalla safetensors, GGUF ni otros) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna. La model card menciona "FP32" como precisión de los pesos y muestra un pipeline de inferencia con parámetros típicos de modelos de difusión: `num_inference_steps`, `guidance_scale`, `negative_prompt`, `safety_checker`, `self_attention` y `upscale`. Esto es consistente con un modelo de difusión condicionado por texto, pero no se confirma el tipo exacto (por ejemplo, Stable Diffusion, SDXL u otra familia), ni el número de parámetros, ni la resolución nativa.

Tampoco se documentan los datos de entrenamiento: no hay información sobre número de imágenes, composición del dataset, filtrado, ni sobre técnicas de ajuste como fine-tuning, LoRA, RLHF o DPO. No se describen innovaciones técnicas como decodificación especulativa, atención lineal o variantes de sampling.

## Capacidades

- Generación de imágenes a partir de prompts de texto, según el ejemplo de la model card (retratos de personajes, escenas de fantasía, estilo anime y digital art).
- Soporte de prompt negativo (`negative_prompt`) para excluir artefactos como manos mal dibujadas, watermark o texto.
- Control de parámetros de sampling: `num_inference_steps`, `guidance_scale`, `width`, `height`, `samples`.
- Opción de `enhance_prompt` y `upscale` en el endpoint de ejemplo.
- Posible uso de `embeddings` y `lora_style` según los campos del payload, aunque no se documenta su funcionamiento.
- No se documenta soporte de tool calling, agentes, razonamiento multi-step, visión, audio ni capacidades multilingües.
- No se documenta modo "thinking" ni ninguna capacidad de lenguaje.

## Casos de uso

- Generación de retratos de personajes para ilustración digital: el modelo acepta prompts descriptivos detallados (pelo, ojos, vestimenta, iluminación) y devuelve imágenes de 512x512 según el ejemplo, adecuado para prototipado visual rápido.
- Creación de arte conceptual para proyectos de fantasía: el ejemplo de la model card incluye escenas con bosques mágicos, mariposas y luz de luna, lo que sugiere uso en bocetos de ambientación.
- Pruebas de pipelines text-to-image vía API: el endpoint `https://dessi.io/api/txt2img` permite integrar el modelo en flujos automatizados con parámetros configurables.
- Experimentación con prompt negativo: útil para estudiar cómo afectan las listas de términos negativos a la calidad anatómica y a los artefactos en modelos de difusión.
- Generación por lotes con `samples` y `upscale`: permite producir varias variantes de una misma idea y escalar la resolución en el mismo flujo.
- Evaluación comparativa de modelos de imagen: al estar en FP32, puede servir como referencia de precisión frente a variantes cuantizadas, siempre que se verifique la licencia.
- No se recomienda su uso en aplicaciones orientadas a menores ni en entornos sin control de contenido, dado el tag `not-for-all-audiences`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. El repo ocupa 0,3 GB, pero no se especifica el tamaño real de los pesos ni la resolución de inferencia.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; el tamaño del repo sugiere que podría caber en GPUs de consumo, pero no hay datos oficiales.
- Opciones de despliegue: el único método documentado es la API HTTP de Dessi (`https://dessi.io/api/txt2img`). No se documenta vLLM, llama.cpp, Ollama, TGI ni Diffusers.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma familia, tamaño o tarea, ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- La model card incluye el tag `not-for-all-audiences`, lo que implica contenido para adultos y restringe su uso en entornos generalistas.
- No se declara licencia, por lo que el uso comercial no está autorizado de forma explícita y requiere verificación con el autor.
- No hay información sobre sesgos, composición del dataset ni filtros de seguridad; el ejemplo de API incluye `safety_checker: "no"`, lo que desactiva la verificación de seguridad.
- Riesgo de alucinación visual y artefactos anatómicos: el propio prompt negativo del ejemplo menciona manos mal dibujadas, ojos asimétricos y cuerpos distorsionados.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso comunitario ni validación externa.
- No se documentan idiomas soportados; los prompts de ejemplo están en inglés.
- El repositorio es muy pequeño (0,3 GB) y podría no contener los pesos completos o requerir componentes adicionales no listados.
- La fecha de creación indicada (2026-11-11) es futura respecto a la fecha habitual de consulta, lo que conviene verificar en el repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/DessiAi/pornmaster0vi
- Endpoint de ejemplo: https://dessi.io/api/txt2img
- Sitio del proveedor: https://dessi.co
