# fastforks/clip

## Resumen

`fastforks/clip` es un repositorio de model card (sin pesos alojados) que distribuye los image towers de CLIP (Radford et al., 2021) en el formato de `timm`, empaquetados para su uso con la librería `fastforks`. Incluye los pesos originales de OpenAI, de OpenCLIP (entrenados sobre LAION-2B y DataComp-1B) y de Apple DFN, todos ellos publicados originalmente por sus autores y verificados mediante SHA-256 por `fastforks`. El modelo resuelve la extracción de características visuales densas y pooled a partir de una única imagen RGB.

La relevancia de este repositorio es de infraestructura más que de investigación: no propone un modelo nuevo, sino que estandariza el acceso reproducible a una familia de backbones ViT ampliamente utilizados como extractores de features en pipelines de visión (búsqueda multimodal, clasificación con cabezas lineales, retrieval, clustering). Ofrece dos backends (`portable` y `kernels`) con kernels optimizados para CUDA, y admite entradas de tamaño arbitrario H x W >= 1, redimensionando o rellenando internamente.

La familia cubre variantes ViT-B/16, ViT-L/14 (224 y 336) y ViT-H/14 (224 y 378) con distintos corpus de entrenamiento. La licencia es mixta: las variantes OpenAI, LAION-2B y DataComp-1B son MIT y permiten uso comercial; las variantes Apple DFN quedan bajo `LicenseRef-Apple-AMLR` y no autorizan uso comercial según la tabla del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT) tipo CLIP image tower, con atención global y proyección final |
| Parametros totales | No disponible de forma agregada; varía por variante (ViT-B/16, ViT-L/14, ViT-H/14) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica; entrada de imagen de cualquier H x W >= 1 (probado hasta 3000x4000) |
| Tipos de cuantizacion | No disponible (la model card menciona ejecución en fp16 en pruebas, pero no enumera cuantizaciones soportadas) |
| Idiomas soportados | No disponible (modelo de visión; no procesa texto) |
| Licencia | Mixta: MIT para variantes OpenAI, LAION-2B y DataComp-1B; `LicenseRef-Apple-AMLR` (sin uso comercial) para variantes DFN. Código: Apache-2.0 |
| Formato de pesos | safetensors (pesos de los autores, no alojados en este repo) |

## Arquitectura y entrenamiento

Cada variante es un image tower de CLIP basado en ViT con parches de 16 o 14 píxeles y resolución nativa de 224, 336 o 378. El modelo devuelve `last_hidden_state` (tokens densos de parche más token CLS), `pooler_output` (token CLS post-LayerNorm antes de la proyección, con QuickGELU en los pesos OpenAI y DFN) y `hidden_states`. No incluye el text tower: es exclusivamente un extractor de features visuales.

Los datos de entrenamiento no los declara el autor del repositorio; se heredan de cada checkpoint original: OpenAI CLIP (datos propios no especificados), OpenCLIP sobre LAION-2B y DataComp-1B, y Apple DFN sobre corpus no detallados en la información disponible. No hay información sobre RLHF, DPO ni ajuste fino posterior en esta ficha. La innovación técnica del paquete `fastforks` es la verificación por SHA-256 de los pesos de terceros, el soporte de entradas de tamaño arbitrario con resize/pad interno y un backend `kernels` con kernels CUDA propios que, según la model card, acelera la inferencia frente al backend `portable` y frente a la implementación original (los valores concretos de speed-up no están completos en la información proporcionada).

## Capacidades

- Extracción de características visuales densas (tokens de parche) y pooled (token CLS) de una imagen RGB.
- Soporte de resolución de entrada arbitraria H x W >= 1, con redimensionado o padding interno.
- Selección de variante según compromiso precisión/coste: B/16, L/14 y H/14, con resolución nativa 224, 336 o 378.
- Backends `portable` (PyTorch) y `kernels` (kernels CUDA optimizados).
- Salidas múltiples: `last_hidden_state`, `pooler_output`, `hidden_states`.
- Verificación de integridad de pesos mediante SHA-256.
- No soporta texto, tool calling, agentes, razonamiento multi-paso ni generación: es un backbone de features.

## Casos de uso

- Búsqueda y retrieval imagen-imagen: usar `pooler_output` como embedding global y comparar por similitud coseno para construir índices vectoriales de catálogos visuales; la variante L/14 o H/14 mejora la discriminación semántica frente a B/16.
- Clasificación con cabezas lineales: congelar el backbone y entrenar un clasificador ligero sobre `pooler_output`, aprovechando que los pesos OpenAI y LAION-2B son MIT y permiten uso comercial.
- Segmentación y detección asistida: emplear `last_hidden_state` (tokens de parche) como features densas para cabezas de segmentación o como entrada a modelos de detección open-vocabulary.
- Deduplicación y clustering de imágenes a gran escala: extraer embeddings con la variante B/16 (menor coste) y agrupar por similitud; útil en curación de datasets.
- Control de calidad visual en pipelines de producción: detectar imágenes fuera de distribución comparando embeddings contra un conjunto de referencia, con entrada de tamaño arbitrario sin recortes previos.
- Análisis de imágenes de alta resolución (documentos, satélite, radiología): la admisión de entradas hasta 3000x4000 sin redimensionar externamente permite procesar detalles finos que se perderían con un resize a 224.
- Extracción de features para modelos multimodales posteriores: usar el image tower como codificador visual congelado en arquitecturas que alinean imagen y texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K ni métricas de retrieval tipo ImageNet zero-shot) en la información disponible. La model card incluye mediciones de velocidad y memoria para features sintéticas a 224x224 y para entradas de 3000x4000, pero los valores numéricos de la tabla de speed-up están truncados en la información proporcionada y no se reproducen aquí para no inventar cifras.

## Requisitos de hardware

- VRAM estimada en pruebas del autor (fp16, backend `portable`, RTX 5060 Ti 16 GB, entrada 3000x4000): `clip-b16-laion2b` 1,7 GiB pico asignado (1,9 reservado); `clip-b16-openai` 1,9 GiB (2,2); `clip-l14-*` entre 2,9 y 3,4 GiB (3,2-3,7); `clip-h14-*` entre 3,9 y 4,5 GiB (4,4-5,0).
- Cabe en GPU de consumo: sí, todas las variantes probadas caben en una RTX 5060 Ti de 16 GB a 3000x4000 en fp16; a 224x224 el consumo es sustancialmente menor.
- GPU recomendadas: RTX 4090, RTX 5060 Ti 16 GB, A100 y H100 para lotes grandes o alta resolución; el backend `kernels` está orientado a CUDA.
- Opciones de despliegue: librería `fastforks` (backends `portable` y `kernels`) y `timm` como origen de los pesos; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a un extractor de features).
- Latencia y throughput: no disponibles de forma completa en la información proporcionada; la model card reporta tiempos a 224x224 pero los valores están truncados.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `fastforks/clip` (esta ficha) | ViT image tower (CLIP) | B/16, L/14, H/14 según variante | Imagen arbitraria H x W >= 1 | Mixta (MIT / Apple AMLR) | Pesos vía `timm`, verificación SHA-256 |
| `timm/vit_*_clip_*` | ViT image tower (CLIP) | Mismas variantes | Resolución nativa fija (224/336/378) | Según checkpoint original | Hugging Face |
| `openai/clip-vit-large-patch14` | CLIP completo (image + text tower) | No disponible | Imagen 224 + texto | MIT | Hugging Face |
| `laion/CLIP-ViT-H-14-laion2B-s32B-b79K` | CLIP completo (image + text tower) | No disponible | Imagen 224 + texto | MIT | Hugging Face |

La diferencia principal frente a los checkpoints de `timm` es la capa de verificación de integridad y el backend `kernels`; frente a los CLIP completos de OpenAI y LAION, este repositorio solo expone el image tower, lo que reduce el coste si no se necesita alineación texto-imagen.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, no razona y no soporta tool calling ni agentes.
- Sesgos heredados de los corpus de entrenamiento (OpenAI, LAION-2B, DataComp-1B, DFN), no auditados en esta ficha; pueden afectar a retrieval y clasificación en grupos demográficos o contextos culturales concretos.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de falsos positivos en similitud semántica por embeddings poco discriminativos en dominios alejados del entrenamiento.
- Licencia mixta: las variantes Apple DFN (`clip-h14-378-dfn5b`, `clip-h14-dfn5b`, `clip-l14-dfn2b`) no permiten uso comercial según la tabla del autor; verificar antes de desplegar en producción.
- El repositorio no aloja pesos: depende de la disponibilidad de los repos de `timm` y de los enlaces de los autores; un cambio o retirada rompe la reproducibilidad aunque el SHA-256 detecte la alteración.
- Los datos de entrenamiento no están declarados por el autor del paquete; la trazabilidad de datos depende de cada checkpoint original.
- La entrada de tamaño arbitrario con resize/pad interno puede alterar la distribución respecto al entrenamiento si se usa una resolución muy distinta de la nativa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/fastforks/clip
- Código `fastforks`: https://github.com/kleinicke/fastforks
- Kernels: https://huggingface.co/fastforks/kernels
- `card.toml` con hashes completos: https://github.com/kleinicke/fastforks/blob/main/src/fastforks/features/models/clip/card.toml
- Código original `timm`: https://github.com/huggingface/pytorch-image-models (commit `0df212b369a5`)
- Pesos `vit_base_patch16_clip_224.laion2b`: https://huggingface.co/timm/vit_base_patch16_clip_224.laion2b
- Pesos `vit_base_patch16_clip_224.openai`: https://huggingface.co/timm/vit_base_patch16_clip_224.openai
- Pesos `vit_huge_patch14_clip_224.dfn5b`: https://huggingface.co/timm/vit_huge_patch14_clip_224.dfn5b
- Pesos `vit_huge_patch14_clip_224.laion2b`: https://huggingface.co/timm/vit_huge_patch14_clip_224.laion2b
- Pesos `vit_huge_patch14_clip_378.dfn5b`: https://huggingface.co/timm/vit_huge_patch14_clip_378.dfn5b
- Pesos `vit_large_patch14_clip_224.datacompxl`: https://huggingface.co/timm/vit_large_patch14_clip_224.datacompxl
- Pesos `vit_large_patch14_clip_224.dfn2b`: https://huggingface.co/timm/vit_large_patch14_clip_224.dfn2b
- Pesos `vit_large_patch14_clip_224.laion2b`: https://huggingface.co/timm/vit_large_patch14_clip_224.laion2b
- Pesos `vit_large_patch14_clip_224.openai`: https://huggingface.co/timm/vit_large_patch14_clip_224.openai
- Pesos `vit_large_patch14_clip_336.openai`: https://huggingface.co/timm/vit_large_patch14_clip_336.openai
- Evidencia de licencia: https://huggingface.co/timm/vit_large_patch14_clip_336.openai/blob/81e38efc4637de5023b10e75a7f9bd1c6fa6b010/README.md
