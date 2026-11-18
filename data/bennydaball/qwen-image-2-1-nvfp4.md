# BennyDaBall/Qwen-Image-2.1-NVFP4

## Resumen

Qwen-Image-2.1-NVFP4 es una cuantización independiente en formato NVFP4 del modelo de difusión Qwen Image 2.1, publicada por el usuario BennyDaBall. No se trata de un modelo nuevo ni de un lanzamiento oficial de Qwen: el autor ha convertido los pesos BF16 del paquete oficial de Comfy-Org (transformer de imagen y codificador de texto Qwen3-VL de 8B) a FP4 nativo de Blackwell, manteniendo en BF16 la torre de visión, los embeddings, la cabeza de salida, los tensores críticos del modelo de imagen y el VAE. El objetivo es reducir el peso en disco y acelerar la inferencia en GPUs RTX 50 series dentro de ComfyUI.

El paquete completo ocupa 12,42 GB frente a los 32,44 GB del conjunto BF16 original, una reducción del 61,7 % en disco. Incluye tres ficheros (transformer, text encoder y VAE), cuatro workflows funcionales (texto a imagen, edición de imagen, salida RGBA con alfa nativo y tipografía 2K) y un parche de runtime opcional para acelerar el acondicionamiento de texto con kernels FP4 reales.

Su relevancia actual reside en que demuestra una vía práctica de cuantización mixta NVFP4 para modelos de difusión grandes en hardware de consumo de gama alta, con validación medida: en una RTX 5090, una generación completa de 1024×1024 a 40 pasos tarda 6,746 s de mediana frente a 15,629 s en BF16 y 7,553 s con la versión INT8 oficial. La licencia es la qwen-research-license, restringida a investigación y evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión (transformer de imagen) con codificador de texto Qwen3-VL 8B; cuantización mixta NVFP4 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (E2M1 con escalas E4M3 FP8 por bloques de 16 y escalas de tensor FP32); componentes en BF16 |
| Idiomas soportados | no disponible |
| Licencia | qwen-research-license (uso de investigación y evaluación) |
| Formato de pesos | safetensors (diffusion-single-file para ComfyUI) |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen Image 2.1, un modelo de difusión para generación y edición de imágenes cuyo backbone de texto es Qwen3-VL de 8B. La cuantización de BennyDaBall aplica NVFP4 a 192 matrices de atención (Q/K/V/output) y a las matrices fusionadas gate/up/output del MLP del transformer de imagen, así como a 252 matrices de atención y MLP del backbone lingüístico Qwen3-VL. Se conservan en BF16 la torre de visión, los embeddings de tokens, la cabeza de lenguaje, las entradas y salidas del modelo de imagen, el timestep, la modulación, las normalizaciones y el VAE completo.

La conversión parte directamente de los pesos BF16 oficiales, sin recalibración ni fine-tuning, y sin recuantizar la versión INT8. Usa FP4 empaquetado nativo E2M1 con el layout de escalas nativo y metadatos `comfy_quant` por capa. El paquete incluye un parche de runtime para que el acondicionamiento de texto use kernels FP4 reales en denoising y en text conditioning; sin el parche, el modelo funciona igual pero el acondicionamiento de texto recurre a pesos de-cuantizados y activaciones FP32. No se han publicado detalles sobre el dataset de entrenamiento original de Qwen Image 2.1 en la información disponible.

## Capacidades

- Generación de imágenes texto a imagen a 1024×1024 y 2048×2048 (workflow de tipografía 2K).
- Edición de imágenes con una imagen de referencia: cambios coherentes de material, color y objetos.
- Salida RGBA con canal alfa nativo, sin nodo de eliminación de fondo.
- Renderizado de texto y lettering preciso en resoluciones altas (workflow de tipografía 2K).
- Acondicionamiento de texto mediante Qwen3-VL 8B, con torre de visión en BF16 para referencias visuales.
- Integración nativa en ComfyUI con nodos core (`UNETLoader`, `CLIPLoader` tipo `qwen_image`, `TextEncodeQwenImage21`, `KSampler`, VAE).
- Compatibilidad con API de ComfyUI (workflows equivalentes en `workflows/api`).
- No se documentan capacidades de tool calling, agentes ni audio en la información disponible.

## Casos de uso

- Generación de imágenes de producto en catálogo: el workflow 01 produce ejemplos 1024×1024 con prompts y latentes ajustables, adecuado para iterar variaciones de producto con un coste de 6,746 s por imagen en RTX 5090.
- Edición de fotografía comercial: el workflow 02 permite modificar materiales, colores u objetos manteniendo coherencia con una única imagen de referencia, útil para mockups y pruebas de concepto visuales.
- Assets con transparencia para diseño y web: el workflow 03 genera RGBA con alfa nativo, eliminando la necesidad de un paso posterior de segmentación de fondo en pipelines de diseño.
- Cartelería y tipografía: el workflow 04 renderiza pósters de 2048×2048 con lettering exacto solicitado en el prompt, aplicable a pruebas de maquetación y previsualización de campañas.
- Prototipado rápido en estaciones de trabajo con RTX 5090: la reducción a 12,42 GB en disco y el uso de kernels FP4 permiten mantener el modelo cargado junto a otros componentes en una única GPU de consumo de gama alta.
- Investigación sobre cuantización de modelos de difusión: el paquete incluye 24 pares comparativos BF16 frente a NVFP4 con las mismas semillas y prompts, lo que sirve como base para estudiar el impacto de FP4 en calidad de imagen.
- Evaluación de pipelines ComfyUI en producción interna: los workflows API y el parche de runtime permiten medir latencia y throughput con kernels FP4 reales antes de decidir un despliegue.

## Benchmarks y rendimiento

| Metrica | NVFP4 | BF16 | INT8 oficial |
|---|---|---|---|
| Tiempo mediano, 1024×1024, 40 pasos, RTX 5090 | 6,746 s | 15,629 s | 7,553 s |
| Tamano en disco del paquete | 12,42 GB | 32,44 GB | no disponible |

Medición realizada por el autor con tres ejecuciones en caliente por variante, todos los nodos ejecutados incluido el text encoding, y con el parche del encoder activo. Benchmark de un solo prompt; el método completo y sus límites están en `VALIDATION.md`. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que se trata de un modelo de generación de imágenes.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el autor indica que los tamaños de fichero son GB decimales y no un requisito de VRAM. El paquete completo son 12,42 GB en disco repartidos en transformer (4,20 GB), text encoder (7,55 GB) y VAE (0,68 GB).
- GPU recomendadas: RTX 5090 (probado); se requiere hardware Blackwell para los kernels FP4 nativos.
- Cabe en GPU de consumo: sí, en RTX 50 series con soporte NVFP4; no se documenta compatibilidad con generaciones anteriores.
- Despliegue: ComfyUI 0.36.0 o superior con soporte nativo NVFP4 y el nodo `TextEncodeQwenImage21`; PyTorch 2.14.0+cu130; comfy-kitchen 0.2.35. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: 6,746 s de mediana por imagen 1024×1024 a 40 pasos en RTX 5090 con NVFP4; 15,629 s en BF16; 7,553 s con INT8 oficial.
- Ajustes por defecto: 40 pasos, sampler Euler, scheduler simple, CFG 1, denoise 1; dtype de pesos de difusión en default.

## Comparativa con modelos similares

| Modelo | Tipo | Tamano en disco | Licencia | Disponibilidad | Rendimiento (1024×1024, 40 pasos, RTX 5090) |
|---|---|---|---|---|---|
| Qwen-Image-2.1-NVFP4 (este) | Cuantización NVFP4 de Qwen Image 2.1 | 12,42 GB | qwen-research-license | Hugging Face, ComfyUI | 6,746 s |
| Qwen Image 2.1 BF16 (Comfy-Org) | Pesos originales BF16 | 32,44 GB | qwen-research-license | Hugging Face, ComfyUI | 15,629 s |
| Qwen Image 2.1 INT8 oficial | Cuantización INT8 | no disponible | qwen-research-license | Hugging Face, ComfyUI | 7,553 s |

No se dispone de datos en la información proporcionada para comparar con otros modelos de difusión de la misma categoría (por ejemplo, alternativas de generación y edición de imagen de otros laboratorios).

## Limitaciones y advertencias

- La cuantización altera los resultados: el autor advierte explícitamente de que no se garantiza una salida idéntica píxel a píxel respecto a BF16 ni constituye un ranking universal de calidad.
- El benchmark de latencia se basa en un único prompt y tres ejecuciones en caliente; no es representativo de todas las cargas de trabajo.
- Requiere hardware Blackwell (RTX 50 series) para los kernels FP4 nativos; en otras GPUs no se documenta funcionamiento.
- Requiere una build de ComfyUI con integración de Qwen Image 2.1 (`TextEncodeQwenImage21`) y soporte NVFP4; builds antiguas no funcionan.
- Sin el parche de runtime, el acondicionamiento de texto usa pesos de-cuantizados y activaciones FP32, con la consiguiente pérdida de aceleración.
- Licencia qwen-research-license: uso restringido a investigación y evaluación; no se autoriza uso comercial sin consultar los términos del fichero LICENSE incluido.
- No es un lanzamiento oficial de Qwen; es una conversión de terceros, por lo que el soporte y la validación dependen del autor.
- No se dispone de información sobre sesgos, tasas de alucinación visual ni cobertura idiomática del modelo original en la documentación proporcionada.
- El modelo no incluye calibración ni fine-tuning específico para la cuantización, lo que puede afectar a tensores sensibles no cubiertos por la política de precisión mixta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BennyDaBall/Qwen-Image-2.1-NVFP4
- Modelo base en Comfy-Org: https://huggingface.co/Comfy-Org/Qwen-Image-2.1
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen-Image-2.1
- Licencia: https://huggingface.co/BennyDaBall/Qwen-Image-2.1-NVFP4/blob/main/LICENSE
- Metodología de validación: VALIDATION.md (en el repositorio)
- Comparativas BF16 frente a NVFP4: COMPARISONS.md (en el repositorio)
- Guía de prompting: PROMPTING.md (en el repositorio)
- Parche de runtime: runtime/README.md (en el repositorio)
- Perfil del autor en X: https://x.com/BennyDaBall_OG
- Apoyo al autor: https://ko-fi.com/bennydaball
