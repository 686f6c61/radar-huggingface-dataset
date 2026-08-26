# Sawfwair/LTX-2.5-Gemma-4-12B-Text-Encoder-MLX-4bit

## Resumen

Este repositorio contiene una conversión MLX en cuantización de 4 bits del text encoder Gemma 4 12B integrado en el modelo de generación de vídeo LTX 2.5 de Lightricks. El autor, Sawfwair, lo ha preparado específicamente para la inferencia nativa en Apple Silicon mediante la herramienta `mere.run`, que combina este componente con el checkpoint oficial de LTX 2.5 para generar vídeo con audio.

El modelo no es un generador de vídeo completo, sino la "torre de lenguaje" que procesa los prompts de texto y los convierte en condicionamientos para el transformer de difusión. Al cuantizar solo las capas lineales y de embedding a 4 bits con grupo de 64, se reduce el peso de 26,2 GB a 6,7 GB, lo que permite ejecutar el pipeline completo en hardware Apple con memoria unificada más limitada. La licencia es la LTX-2.x Community License, con restricciones comerciales que deben revisarse antes de su uso.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4 12B, variante unificada multimodal, usada solo como text encoder) |
| Parámetros totales | 1.861.173.040 |
| Parámetros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en este repo; el modelo Gemma 4 12B base soporta 262.144 tokens según fuentes externas |
| Tipos de cuantización | MLX affine 4 bits, group size 64 (pesos cuantizados); normalización en BF16 |
| Idiomas soportados | no disponible (el text encoder de LTX 2.5 soporta múltiples idiomas, pero no se especifica la lista) |
| Licencia | LTX-2.x Community License (con componente Gemma 4 bajo Apache 2.0) |
| Formato de pesos | safetensors (MLX), 50 shards, 6,7 GB |

## Arquitectura y entrenamiento

El text encoder es una variante personalizada de Gemma 4 12B, integrada por Lightricks en el checkpoint oficial de LTX 2.5. Según la documentación de LTX 2.5, este encoder está diseñado para retener múltiples sujetos, acciones, iluminación y dirección de cámara en prompts complejos, y se complementa con un "prompt enhancer" opcional que expande descripciones cortas. La conversión a MLX cuantiza 329 de los 666 tensores originales (capas lineales y embeddings bidimensionales), manteniendo los pesos de normalización en BF16. El proyector LTX, el tokenizer y los activos de audio/vídeo permanecen en el checkpoint oficial, por lo que este repositorio no es autónomo.

No se dispone de información sobre el entrenamiento específico de este text encoder (datos, número de tokens, técnicas de alineación). El modelo base Gemma 4 12B fue desarrollado por Google y su componente se distribuye bajo Apache 2.0, pero la integración con LTX 2.5 es propietaria de Lightricks.

## Capacidades

- Procesamiento de prompts de texto para condicionamiento en generación de vídeo LTX 2.5 (text-to-video, image-to-video, video-to-video, text-to-audio, audio-to-video).
- Retención de atributos complejos en prompts largos: sujetos múltiples, acciones, iluminación y movimiento de cámara.
- Integración con el pipeline de `mere.run` para inferencia en Apple Silicon.
- No es un modelo generativo de texto autónomo; no genera respuestas ni código.
- No incluye capacidades de tool calling, agentes ni razonamiento conversacional.
- No soporta visión ni audio de forma directa en este formato; solo la parte de texto del encoder.

## Casos de uso

- Generación de vídeo local en Mac con Apple Silicon: mediante `mere.run`, se puede ejecutar LTX 2.5 completo (distilled o full) usando este text encoder cuantizado para reducir el uso de memoria unificada.
- Prototipado de pipelines de vídeo generativo en entornos con VRAM limitada: al ocupar solo 6,7 GB, permite probar flujos de trabajo de LTX 2.5 en equipos que no disponen de GPUs NVIDIA de gran capacidad.
- Investigación sobre cuantización de text encoders: el repositorio documenta el proceso de conversión (PR #366 de mere.run), útil para estudiar el impacto de la cuantización 4-bit en la calidad del condicionamiento.
- Desarrollo de herramientas de generación de vídeo con audio en local: al liberar la torre de lenguaje tras el condicionamiento, se optimiza el uso de memoria durante el denoising.
- Evaluación de alternativas de text encoder para LTX 2.5: permite comparar el comportamiento del encoder cuantizado frente al BF16 original en términos de fidelidad del prompt.
- Despliegue en entornos de creación de contenido (estudios, agencias) que requieran privacidad de datos y ejecución sin conexión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay métricas de calidad de generación de vídeo (p. ej., FVD, CLIP score) ni comparaciones con el encoder BF16 original.

## Requisitos de hardware

- Este componente solo (text encoder cuantizado): aproximadamente 6,7 GB de almacenamiento y memoria para cargar los pesos en MLX.
- Para el pipeline completo de LTX 2.5 (transformer DiT de 22B, VAE, upsamplers, proyector), se requieren entre 16 GB y 80 GB de VRAM según la configuración, según fuentes externas. En Apple Silicon, se necesita memoria unificada suficiente (Mac con 32 GB o más recomendable para la versión completa).
- GPU recomendadas: Apple Silicon (M1 Pro/Max/Ultra, M2, M3, M4) para MLX; en GPUs NVIDIA se usaría el checkpoint original BF16.
- Opciones de despliegue: `mere.run` (gestor de modelos), que instala automáticamente este companion tras aceptar la licencia. No es compatible directamente con vLLM, llama.cpp u Ollama, ya que es un componente específico de LTX 2.5.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No hay modelos comparables directos, ya que se trata de un text encoder específico para un pipeline de generación de vídeo. Alternativas conceptuales:

| Modelo | Tipo | Parámetros | Contexto | Licencia | Uso |
|---|---|---|---|---|---|
| LTX-2.5 Gemma 4 12B Text Encoder (BF16) | Text encoder para vídeo | ~12B (original) | 262.144 (Gemma 4) | LTX-2.x Community | Checkpoint oficial de Lightricks |
| Este repo (MLX 4-bit) | Text encoder cuantizado | 1,86B (cuantizado) | no disponible | LTX-2.x Community | Inferencia en Apple Silicon |
| T5-XXL (usado en otros modelos de vídeo) | Text encoder genérico | 11B | 512 | Apache 2.0 | Condicionamiento en modelos como Imagen, etc. |

La comparación con T5-XXL es orientativa; no hay datos de rendimiento que permitan una evaluación objetiva.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere el checkpoint oficial de LTX 2.5 y la herramienta `mere.run` para funcionar. No se puede usar de forma aislada.
- Licencia restrictiva: la LTX-2.x Community License incluye un umbral de uso comercial, condiciones de redistribución y términos de uso aceptable (Attachment A). Debe revisarse antes de cualquier uso en producción.
- El componente Gemma 4 se distribuye bajo Apache 2.0, pero la integración con LTX 2.5 no es de código abierto en su totalidad.
- La cuantización 4-bit puede degradar la fidelidad del condicionamiento en prompts muy complejos, aunque no hay datos que lo confirmen.
- No se incluye el tokenizer ni el proyector LTX; estos deben obtenerse del checkpoint oficial.
- No hay garantías de soporte ni mantenimiento por parte del autor; el repositorio tiene 0 descargas y 0 likes en el momento de la consulta.
- Riesgo de alucinación o pérdida de atributos en prompts largos, inherente a los modelos de lenguaje, aunque no se ha evaluado específicamente en este formato.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Sawfwair/LTX-2.5-Gemma-4-12B-Text-Encoder-MLX-4bit
- Repositorio oficial de LTX-2 (Lightricks): https://github.com/Lightricks/LTX-2
- Licencia LTX-2.x Community: https://github.com/Lightricks/LTX-2/blob/main/LICENSE.md
- PR de conversión en mere.run: https://github.com/sawfwair/mere-run/pull/366
- Documentación de ComfyUI sobre LTX-2.5: https://docs.comfy.org/tutorials/video/ltx/ltx-2-5
- Artículo sobre requisitos de LTX-2.5: https://www.oflight.co.jp/en/columns/ltx-2-5-requirements-vram-local-2026
- Repo relacionado del mismo autor (Gemma 4 12B IT MLX 4-bit): https://huggingface.co/Sawfwair/gemma-4-12B-it-MLX-4bit
