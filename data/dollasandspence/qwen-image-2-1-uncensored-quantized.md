# DollasAndSpence/Qwen-Image-2.1-Uncensored-Quantized

## Resumen

Qwen-Image-2.1 Uncensored Quantized es una recopilación de pesos cuantizados del modelo de generación de imágenes texto-a-imagen Qwen/Qwen-Image-2.1, publicada por el usuario DollasAndSpence en HuggingFace. No es un modelo entrenado desde cero, sino una derivación del modelo base de Qwen cuyos pesos originales se han convertido a múltiples formatos de cuantización (GGUF, safetensors FP8/INT8/NVFP4 y safetensors MLX) para permitir su ejecución local en hardware de consumo y en Apple Silicon. El repositorio incluye además el text encoder Qwen3VL-8B y el VAE necesarios para el pipeline completo.

El modelo resuelve la generación de imágenes a partir de descripciones textuales sin depender de APIs en la nube, lo que resulta relevante para quienes necesitan privacidad, control de costes o ejecución offline. La etiqueta "Uncensored" indica que se ha eliminado o atenuado el filtrado de contenido del modelo original, un aspecto que conviene tratar con cautela por sus implicaciones legales y éticas.

El transformer de difusión declara 7.115.124.736 parámetros (~7,12 B) y el repositorio completo ocupa 105,2 GB, albergando todas las variantes de cuantización. La licencia heredada es qwen-research, que restringe el uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de difusión latente texto-a-imagen (latent diffusion) con text encoder Qwen3VL-8B y VAE dedicado; el tipo de bloque (DiT, MMDiT u otro) no se especifica en la información disponible |
| Parámetros totales | 7.115.124.736 (~7,12 B) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | BF16, FP8, INT8 ConvRot, NVFP4, MLX 4-bit / 6-bit / 8-bit, GGUF Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_0 |
| Idiomas soportados | No disponible |
| Licencia | Otra (qwen-research); uso comercial restringido |
| Formato de pesos | GGUF, safetensors y safetensors MLX |

## Arquitectura y entrenamiento

El modelo base Qwen-Image-2.1 es un sistema de generación de imágenes basado en difusión latente: un transformer de difusión opera sobre representaciones latentes producidas por un VAE (aquí, `qwen_image_2.1_vae_bf16`, de 676 MB), y las indicaciones textuales se codifican mediante el text encoder Qwen3VL-8B. Esta versión concreta no aporta información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF, DPO u otras técnicas de alineamiento. Tampoco se documenta el método exacto por el que se ha obtenido la variante "Uncensored" (ajuste fino, eliminación de filtros o modificación de los pesos de seguridad).

La innovación de esta publicación es exclusivamente de despliegue: ofrece los mismos pesos base en un abanico amplio de cuantizaciones para cubrir distintos presupuestos de memoria. El autor recomienda **Q4_K_M** como mejor equilibrio entre tamaño y calidad para GGUF, **INT8 ConvRot** y **NVFP4** para GPUs compatibles con alto rendimiento, y los formatos **MLX** para Apple Silicon. Los detalles de arquitectura interna del transformer (número de capas, cabezas de atención o mecanismo de atención) no están disponibles en la información proporcionada.

## Capacidades

- Generación de imágenes texto-a-imagen a partir de indicaciones en lenguaje natural.
- Ejecución totalmente local y offline, sin dependencia de servicios en la nube.
- Distribución en múltiples cuantizaciones para adaptarse a distintos límites de VRAM y RAM unificada.
- Integración directa con ComfyUI a través del nodo ComfyUI-GGUF.
- Soporte para Apple Silicon mediante formatos MLX (4, 6 y 8 bits).
- Uso de un text encoder Qwen3VL-8B para interpretar las indicaciones; su naturaleza visión-lenguaje no implica que el modelo genere texto.
- Variante "Uncensored": elimina o atenúa el filtrado de contenido del modelo base (con las advertencias legales correspondientes).
- Empaquetado completo de archivos acompañantes (transformer, text encoder y VAE) en el mismo repositorio.

No se documentan capacidades de edición de imagen, inpainting, salida de vídeo, tool calling ni razonamiento multi-paso.

## Casos de uso

- **Ilustración y concept art local**: artistas que quieren generar bocetos e ilustraciones a partir de descripciones sin subir material a servicios externos; la cuantización Q4_K_M permite ejecutarlo en GPUs de gama media.
- **Generación en equipos con VRAM limitada**: el uso combinado del transformer Q4_K_M (4,60 GB) y el text encoder INT8 ConvRot (9,35 GB) reduce el requisito total por debajo de los 16 GB, algo inalcanzable con los pesos completos en BF16.
- **Flujos de trabajo en Apple Silicon**: las variantes MLX (4/6/8 bits, entre 4,00 y 7,56 GB) permiten generar imágenes en portátiles y equipos Mac con memoria unificada, aprovechando aceleración nativa en Metal.
- **Producción de contenido para marketing y diseño gráfico**: integración como nodo dentro de una pipeline de ComfyUI para generar variaciones de imágenes de producto, banners o fondos de forma automatizada.
- **Generación de datasets sintéticos**: creación masiva de imágenes para entrenar o evaluar otros modelos de visión, ejecutando la inferencia en local para controlar la distribución y evitar fugas de datos.
- **Investigación sobre cuantización**: comparar la pérdida de calidad y el consumo de recursos entre Q4_0, Q4_K_M, Q6_K, Q8_0, FP8, INT8, NVFP4 y MLX sobre un mismo modelo base.
- **Prototipado rápido de interfaces gráficas**: validar prompts y estilos en local antes de migrar a un despliegue mayor, gracias a la disponibilidad de versiones ligeras y de un pipeline ya empaquetado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks con valores numéricos en la información disponible. La model card referencia una imagen de benchmark (`assets/Qwen-Image-2.1-Benchmark.png`) pero no incluye la tabla de métricas asociada, por lo que no es posible presentar cifras verificables ni comparaciones cuantitativas (FID, CLIP score u otras).

## Requisitos de hardware

Las cifras siguientes son estimaciones derivadas del tamaño de los archivos publicados; la VRAM real necesaria es superior por el overhead de activaciones, buffers de atención y el VAE en ejecución.

- **Configuración Q4_K_M + text encoder INT8**: 4,60 GB (transformer) + 9,35 GB (encoder) + 0,68 GB (VAE) ≈ 14,6 GB. Ajustado en GPUs de 16 GB; se recomienda un mínimo de 20-24 GB para trabajar con holgura.
- **Configuración Q4_K_M + text encoder BF16**: ≈ 22,8 GB. Requiere GPUs de 24 GB (RTX 3090/4090, A5000) o superiores.
- **BF16 completo**: 14,23 GB + 17,53 GB + 0,68 GB ≈ 32,4 GB. Necesita GPUs de 40-48 GB (A100 40GB, A6000, L40S) o reparto entre varias GPU.
- **NVFP4**: el transformer ocupa 4,20 GB, pero requiere hardware con soporte NVFP4 (arquitecturas Blackwell / RTX serie 50).
- **MLX (Apple Silicon)**: 4,00 GB (4-bit), 5,78 GB (6-bit) y 7,56 GB (8-bit); adecuado para Mac con memoria unificada de 16 GB o más según la variante.
- **GPUs recomendadas**: RTX 3060 12 GB (solo configuraciones muy ajustadas), RTX 4070/4080/4090, RTX 5090, A100 40/80 GB, H100 para despliegues de mayor volumen.
- **Opciones de despliegue**: ComfyUI con el nodo ComfyUI-GGUF (fork de leejet, con soporte nativo de Qwen-Image 2.1) para los archivos GGUF y safetensors; MLX para Apple Silicon. Al tratarse de un modelo de difusión de imágenes, no aplican los servidores de inferencia de LLM habituales (vLLM, TGI, Ollama, llama.cpp en su modo texto).
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

Los datos de los modelos comparables proceden de conocimiento general y no de la información proporcionada; conviene verificarlos en sus fichas oficiales.

| Modelo | Parámetros | Acceso / formato | Licencia | Notas |
|---|---|---|---|---|
| Qwen-Image-2.1 Uncensored Quantized | ~7,12 B | GGUF, safetensors, MLX (cuantizaciones de comunidad) | qwen-research (no comercial, con matices) | Derivado cuantizado; sin benchmarks numéricos publicados |
| Qwen-Image-2.1 (base) | ~7,12 B | safetensors | qwen-research | Modelo original de Qwen del que deriva esta publicación |
| FLUX.1 [dev] | ~12 B | safetensors, GGUF mediante la comunidad | FLUX.1 [dev] Non-Commercial | Referencia frecuente en generación de imágenes de alta calidad; uso comercial restringido |
| Stable Diffusion 3.5 Large | ~8 B | safetensors, GGUF | Stability Community License | Permite uso comercial bajo umbral de ingresos |

No se dispone de comparaciones de rendimiento (calidad de imagen, fidelidad al prompt) entre estos modelos dentro de la información facilitada.

## Limitaciones y advertencias

- **Licencia qwen-research**: restringe el uso comercial. Debe revisarse el texto completo de la licencia antes de cualquier despliegue productivo o de redistribuir los pesos.
- **Variante "Uncensored"**: la eliminación del filtrado de contenido puede permitir la generación de material sensible o ilegal. El responsable del despliegue asume el cumplimiento normativo y la moderación.
- **Pérdida de calidad por cuantización**: las versiones agresivas (Q4_0, Q4_K_M, NVFP4) pueden introducir artefactos, pérdida de detalle fino o menor fidelidad al prompt respecto a BF16.
- **Riesgo de resultados imperfectos**: como todo modelo generativo, puede producir anatomías incorrectas, texto ilegible, sesgos de representación o composiciones incoherentes con la indicación.
- **Ausencia de benchmarks**: no hay métricas numéricas publicadas que respalden afirmaciones de rendimiento o de degradación frente al modelo base.
- **Publicación de comunidad**: el repositorio tiene 0 descargas y 0 "likes" en el momento del registro, y la model card parece incompleta (el texto de uso se corta). Además, el identificador del repositorio (DollasAndSpence) no coincide con los enlaces internos de la model card (abenzerps), lo que dificulta verificar la procedencia y el mantenimiento de los archivos.
- **Idiomas no especificados**: no se documenta el soporte multilingüe de las indicaciones, aunque el text encoder Qwen3VL sea de base multilingüe.
- **Fechas anómalas**: las marcas de creación y actualización (2026-10-15) resultan llamativas y conviene contrastarlas antes de asumir su vigencia.
- **Compatibilidad de nodos**: requiere el fork mantenido de ComfyUI-GGUF (leejet); con versiones antiguas puede aparecer el error `Unknown model architecture!`.

## Enlaces

- Ficha en HuggingFace: https://huggingface.co/DollasAndSpence/Qwen-Image-2.1-Uncensored-Quantized
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
- ComfyUI-GGUF (leejet): https://github.com/leejet/ComfyUI-GGUF
- Formulario de solicitud de modelos del autor: https://abenzerps.com/request-a-model/
- Imagen de benchmark referenciada en el repositorio: assets/Qwen-Image-2.1-Benchmark.png
