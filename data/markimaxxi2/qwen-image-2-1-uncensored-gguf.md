# markimaxxi2/Qwen-Image-2.1-Uncensored-GGUF

## Resumen

Qwen-Image-2.1-Uncensored-GGUF es un repositorio de cuantizaciones del modelo de generación de imágenes Qwen-Image-2.1, publicado por el usuario markimaxxi2 en Hugging Face. Se trata de un trabajo de la comunidad, no de un modelo entrenado desde cero: reempaqueta los pesos del modelo base Qwen/Qwen-Image-2.1 en formatos GGUF y safetensors listos para su uso local con ComfyUI. El componente de generación visual tiene unos 7.115 millones de parámetros (7.115.124.736 según los safetensors publicados) y se complementa con un text encoder Qwen3-VL de 8B y un VAE específico.

El modelo resuelve el problema de ejecutar generación de imágenes de gama alta en hardware de consumo, ofreciendo cuantizaciones desde BF16 (14,23 GB) hasta Q4_0 (4,15 GB), pasando por formatos MLX para Apple Silicon y NVFP4 para hardware Blackwell. La arquitectura del base es un Diffusion Transformer (DiT) de 32 capas single-stream, orientado a equilibrar calidad de generación, eficiencia de inferencia y versatilidad en tareas de generación y edición de imágenes.

Es relevante ahora porque el modelo base fue liberado como open source y esta cuantización permite ejecutarlo en GPUs de 16-24 GB de VRAM mediante ComfyUI y el nodo ComfyUI-GGUF. Conviene señalar que la etiqueta "Uncensored" del repositorio no parece corresponder a una modificación real de los pesos: análisis públicos indican que se trata de los pesos originales sin alterar. Los metadatos del repositorio registran fecha de creación y actualización del 2026-10-03, con 21 descargas y 0 likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) de 32 capas single-stream (componente de generacion visual); text encoder Qwen3-VL 8B; VAE dedicado |
| Parametros totales | 7.115.124.736 (~7,1 B) en el componente de generacion visual; no incluye el text encoder de 8B ni el VAE |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelo de generacion de imagenes, no un LLM de texto) |
| Tipos de cuantizacion | BF16, FP8, INT8 ConvRot, NVFP4, MLX 4-bit, MLX 6-bit, MLX 8-bit, Q8_0, Q6_K, Q5_K_M, Q4_K_M (recomendada), Q4_0 |
| Idiomas soportados | No disponible |
| Licencia | qwen-research (license: other) |
| Formato de pesos | GGUF y safetensors (incluye variantes MLX) |

## Arquitectura y entrenamiento

El modelo base Qwen-Image-2.1 es un modelo unificado de generacion texto-a-imagen y edicion de imagenes desarrollado por el equipo Qwen. Su componente de generacion visual emplea una arquitectura Diffusion Transformer con 32 capas single-stream y aproximadamente 7B de parametros. El pipeline completo se compone de tres piezas: el transformer de difusion (objeto de estas cuantizaciones), un text encoder basado en Qwen3-VL de 8B y un VAE propio del modelo (qwen_image_2.1_vae_bf16.safetensors, 676 MB).

No se dispone de informacion detallada en la documentacion proporcionada sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de RLHF o DPO. El autor de la cuantizacion indica que se usan "the original upstream base weights", es decir, pesos originales del modelo base sin modificaciones. Segun la descripcion del repositorio oficial en GitHub, esta version del modelo introduce cuatro mejoras clave respecto a su predecesor, entre ellas una arquitectura compacta y eficiente y capacidades unificadas de generacion y edicion.

## Capacidades

- Generacion de imagenes a partir de descripciones textuales (text-to-image) usando ComfyUI como interfaz de ejecucion.
- Edicion de imagenes, ya que el modelo base es un modelo unificado de generacion y edicion.
- Integracion con el text encoder Qwen3-VL 8B, que aporta comprension de prompts complejos y potencialmente de entradas multimodales en la codificacion del texto.
- Soporte de cuantizaciones multiples para adaptarse a distintos presupuestos de VRAM, desde BF16 completo hasta Q4_0.
- Compatibilidad con ComfyUI-GGUF, lo que permite cargar los pesos cuantizados mediante el nodo `Unet Loader (GGUF)`.
- Variantes MLX (4, 6 y 8 bits) para ejecucion en Apple Silicon con memoria unificada.
- Formato NVFP4 orientado a hardware Blackwell con soporte nativo de punto flotante de 4 bits.
- No se ha documentado soporte de tool calling, function calling, agentes ni razonamiento multi-paso, ya que no es un modelo de lenguaje.
- No se dispone de informacion sobre capacidades multilingues especificas ni sobre capacidades de audio o video.

## Casos de uso

- Generacion de imagenes local sin conexion: gracias a las cuantizaciones Q4_K_M (4,60 GB) y Q4_0 (4,15 GB), el modelo puede ejecutarse en una GPU de consumo con 16 GB de VRAM, lo que permite flujos creativos completamente offline.
- Prototipado de conceptos artisticos: ilustradores y disenadores pueden iterar rapidamente sobre prompts en ComfyUI para explorar variaciones visuales sin depender de APIs externas ni incurrir en costes por peticion.
- Edicion de imagenes asistida: al derivar de un modelo unificado de generacion y edicion, permite tareas de retoque e intervencion sobre imagenes existentes dentro del mismo pipeline de ComfyUI.
- Despliegue en estaciones de trabajo con Apple Silicon: las variantes MLX 4-bit (4,00 GB) y MLX 6-bit (5,78 GB) estan pensadas para ejecutarse en Macs con memoria unificada, aprovechando el backend MLX de Apple.
- Pipelines de generacion por lotes: con Q8_0 (7,59 GB) o BF16 (14,23 GB) en GPUs de 24 GB o superiores, se puede priorizar la calidad de imagen frente al ahorro de memoria en entornos de produccion grafica.
- Investigacion sobre cuantizacion de modelos de difusion: el repositorio ofrece un conjunto amplio de formatos (GGUF, safetensors, MLX, NVFP4) que permite comparar el impacto de cada nivel de cuantizacion sobre la calidad de salida.
- Evaluacion de modelos de generacion en hardware modesto: combinando el text encoder en INT8 ConvRot (9,35 GB) con la cuantizacion Q4_K_M (4,60 GB), el stack completo cabe en torno a 14-15 GB, lo que facilita pruebas en GPUs de 16 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card del autor incluye unicamente una referencia grafica a una imagen de benchmark (Qwen-Image-2.1-Benchmark.png) sin valores numericos ni tablas de metricas. No se deben inferir cifras a partir de esa referencia.

## Requisitos de hardware

- VRAM estimada para el componente de difusion (solo pesos): BF16 ~14,23 GB; Q8_0 ~7,59 GB; Q6_K ~5,88 GB; Q5_K_M ~5,22 GB; Q4_K_M ~4,60 GB; Q4_0 ~4,15 GB; NVFP4 ~4,20 GB; MLX 4-bit ~4,00 GB.
- Text encoder (se suma al total): Qwen3-VL 8B en BF16 ocupa 17,53 GB; en INT8 ConvRot, 9,35 GB. El VAE anade 676 MB.
- Estimacion de stack completo con Q4_K_M + text encoder INT8 + VAE: en torno a 14,6 GB, por lo que cabe en GPUs de 16 GB (RTX 4060 Ti 16 GB, RTX 4070 Ti Super, RTX 4080) y de 24 GB (RTX 3090, RTX 4090).
- Estimacion de stack completo con Q4_K_M + text encoder BF16 + VAE: en torno a 22,8 GB, por lo que requiere 24 GB de VRAM como minimo.
- Estimacion de stack completo en BF16: unos 32 GB solo de pesos, lo que exige GPUs de 40 GB o mas (A100 40 GB, A100 80 GB, H100).
- NVFP4 esta disenado para hardware Blackwell con soporte nativo de 4 bits; en GPUs anteriores habria que descomprimir a precision superior, anulando parte del ahorro.
- Estas cifras son estimaciones basadas en los tamanos de fichero declarados en el repositorio y no incluyen activaciones ni buffers de inferencia, por lo que la VRAM en pico puede ser superior; no se dispone de datos medidos.
- Opciones de despliegue documentadas: ComfyUI con el nodo ComfyUI-GGUF (se recomienda el fork de leejet, con soporte nativo de Qwen-Image 2.1, frente al fork antiguo de city96 que puede devolver el error `Unknown model architecture!`). Las variantes MLX requieren el backend MLX de Apple.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| markimaxxi2/Qwen-Image-2.1-Uncensored-GGUF | ~7,1 B (componente de difusion) | No aplica | GGUF y safetensors | qwen-research (other) | Hugging Face, 21 descargas, 0 likes |
| Qwen/Qwen-Image-2.1 (modelo base) | ~7 B (32 capas DiT single-stream) | No aplica | safetensors | qwen-research | Repositorio oficial en Hugging Face y GitHub |
| abenzerps/Qwen-Image-2.1-Uncensored-GGUF | ~7,1 B | No aplica | GGUF y safetensors | qwen-research | Hugging Face; es el repositorio referenciado en los enlaces de la model card |
| kkguku/Qwen-Image-2.1-Uncensored-GGUF | ~7,1 B | No aplica | GGUF | qwen-research | Hugging Face; contenido aparentemente equivalente |

Las comparativas con modelos de otras familias de generacion de imagenes no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- La etiqueta "Uncensored" del repositorio no parece corresponder a una modificacion real de los pesos. Segun un analisis publico, los ficheros apuntan a los pesos originales del modelo base sin alterar, por lo que no debe asumirse la ausencia de filtros o sesgos respecto al modelo oficial.
- Existe una discrepancia entre el repositorio indicado en los metadatos (markimaxxi2/Qwen-Image-2.1-Uncensored-GGUF) y los enlaces internos de la model card, que apuntan a abenzerps/Qwen-Image-2.1-Uncensored-GGUF. Esto sugiere un reupload o espejo del trabajo original y complica la trazabilidad de los artefactos.
- El repositorio tiene un volumen de 105,2 GB, ya que incluye todas las cuantizaciones y ficheros auxiliares; conviene descargar solo la variante necesaria.
- La licencia qwen-research (license: other) impone condiciones de uso; no se dispone del texto completo de la licencia en la informacion proporcionada, por lo que es imprescindible revisarla antes de cualquier uso comercial.
- Riesgo de alucinacion visual inherente a los modelos de difusion: los resultados pueden no corresponder fielmente al prompt, especialmente en escenas complejas o con multiples sujetos.
- No hay informacion disponible sobre sesgos demograficos, culturales o de representacion en los datos de entrenamiento.
- No hay datos publicados sobre el impacto de cada nivel de cuantizacion en la calidad de imagen; la recomendacion de Q4_K_M como equilibrio entre tamano y calidad es del propio autor y no esta respaldada por metricas en la informacion disponible.
- No se documentan idiomas soportados, lo que limita la evaluacion de su comportamiento con prompts en castellano.
- No se dispone de informacion sobre latencia, throughput ni numero de pasos de muestreo recomendados.
- Las estimaciones de VRAM de esta ficha se derivan de tamanos de fichero y no de mediciones reales.

## Enlaces

- Repositorio Hugging Face de esta ficha: https://huggingface.co/markimaxxi2/Qwen-Image-2.1-Uncensored-GGUF
- Modelo base en Hugging Face: https://huggingface.co/Qwen/Qwen-Image-2.1
- Repositorio oficial de Qwen-Image-2.1 en GitHub: https://github.com/QwenLM/Qwen-Image-2.1
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
- ComfyUI-GGUF (fork recomendado, leejet): https://github.com/leejet/ComfyUI-GGUF
- ComfyUI-GGUF (fork antiguo, city96): https://github.com/city96/ComfyUI-GGUF
- Repositorio espejo en Hugging Face (abenzerps): https://huggingface.co/abenzerps/Qwen-Image-2.1-Uncensored-GGUF
- Repositorio espejo en Hugging Face (kkguku): https://huggingface.co/kkguku/Qwen-Image-2.1-Uncensored-GGUF
- Analisis sobre la etiqueta "Uncensored" y ejecucion local: https://stashbase.ai/blog/run-qwen-image-2-1-locally-uncensored/
