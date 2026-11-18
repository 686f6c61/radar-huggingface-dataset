# KasugaiSakura/Qwen-Image-2.1-Uncensored-GGUF

## Resumen

Qwen-Image-2.1-Uncensored-GGUF es una redistribución cuantizada del modelo de generación de imágenes Qwen/Qwen-Image-2.1, publicada por el usuario KasugaiSakura en Hugging Face. El repositorio empaqueta en un solo lugar los pesos del transformer de difusión en formato GGUF y safetensors, el text encoder Qwen3-VL de 8B y el VAE del modelo original, todo ello orientado a su uso local dentro de ComfyUI mediante el nodo ComfyUI-GGUF. Con 7.115.124.736 parámetros en el transformer y un repositorio de 136,6 GB, está pensado para creadores que quieren ejecutar generación texto-a-imagen de alta calidad sin depender de APIs en la nube.

La relevancia del repositorio reside en tres factores: la disponibilidad de cuantizaciones agresivas (desde BF16 de 14,23 GB hasta NVFP4 de 4,20 GB o MLX 4-bit de 4,00 GB), la inclusión de los ficheros auxiliares necesarios para ComfyUI y la etiqueta "uncensored", que indica que los pesos derivan del modelo base sin el filtrado adicional que suele aplicarse en los modelos publicados oficialmente. La licencia es `qwen-research`, lo que condiciona fuertemente su uso comercial.

Este modelo no es un LLM: es un modelo de difusión para imágenes. Por tanto, las secciones de capacidades, casos de uso y benchmarks se interpretan en el contexto de generación visual, no de texto, razonamiento o código. La información disponible en la model card es limitada y se centra en el empaquetado y las instrucciones de instalación, no en detalles de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión texto-a-imagen (transformer de difusión; detalles arquitectónicos no disponibles) |
| Parametros totales | 7.115.124.736 (transformer de difusión) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no es un modelo de contexto textual) |
| Tipos de cuantizacion | BF16, FP8, INT8 ConvRot, NVFP4, MLX 4-bit, MLX 6-bit, MLX 8-bit, Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_0 |
| Idiomas soportados | No disponible (el prompt se procesa vía text encoder Qwen3-VL 8B) |
| Licencia | qwen-research (etiquetada como "other") |
| Formato de pesos | GGUF y safetensors (transformer); safetensors para text encoder y VAE |

## Arquitectura y entrenamiento

La model card no documenta la arquitectura interna del transformer de difusión ni los detalles del entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO o etapas de refinamiento). Lo que sí se sabe es que el modelo base es Qwen/Qwen-Image-2.1, un modelo de generación de imágenes de la familia Qwen, y que el text encoder asociado es Qwen3-VL de 8B parámetros, empaquetado en BF16 (17,53 GB) o INT8 ConvRot (9,35 GB). El VAE se distribuye en BF16 con 676 MB. La etiqueta "uncensored" sugiere que los pesos se han derivado del modelo base sin las capas de moderación o fine-tuning de seguridad que suelen acompañar a las versiones oficiales, aunque la model card no detalla el proceso exacto de modificación.

El repositorio incluye dos conjuntos de cuantizaciones: las etiquetadas "UC" (uncensored) y las del modelo base sin esa etiqueta. Las cuantizaciones UC incluyen BF16, FP8, INT8 ConvRot, NVFP4, MLX en 4/6/8 bits y GGUF Q8_0, Q6_K, Q5_K_M, Q4_K_M y Q4_0. Las cuantizaciones del modelo base incluyen Q8_0, Q6_K, Q5_K_M, Q4_K_M y Q4_0. El autor recomienda Q4_K_M (4,60 GB) como mejor equilibrio entre tamaño y calidad. No se documentan innovaciones técnicas específicas como decodificación especulativa o atención lineal, dado que no es un modelo autoregresivo de texto.

## Capacidades

- Generación de imágenes a partir de descripciones textuales (text-to-image) mediante el pipeline de ComfyUI.
- Procesamiento de prompts en lenguaje natural a través del text encoder Qwen3-VL 8B, que aporta comprensión multimodal (texto e imagen) al pipeline.
- Ejecución local en hardware de consumo gracias a las cuantizaciones de 4 bits (Q4_K_M, Q4_0, NVFP4, MLX 4-bit).
- Compatibilidad con ComfyUI mediante el nodo Unet Loader (GGUF) y el fork leejet/ComfyUI-GGUF con soporte nativo para Qwen-Image 2.1.
- Variante "uncensored" que, según la etiqueta del autor, elimina restricciones de contenido del modelo base (sin documentación técnica del proceso).
- Soporte de cuantizaciones MLX para hardware Apple Silicon (4, 6 y 8 bits).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni generación de código, al no ser un modelo de lenguaje.

## Casos de uso

- Generación de ilustraciones para proyectos personales en local: con Q4_K_M (4,60 GB) y el text encoder INT8 (9,35 GB), el pipeline completo cabe en GPUs de consumo de 16-24 GB, permitiendo iterar prompts sin coste por API.
- Prototipado rápido de conceptos visuales en estudio de diseño: el modelo permite generar variaciones de una idea a partir de descripciones textuales, y la cuantización Q8_0 (7,59 GB) ofrece mayor fidelidad cuando se dispone de VRAM suficiente.
- Creación de assets para videojuegos o cómics independientes: la variante "uncensored" permite explorar temáticas que los modelos con filtros estrictos rechazan, útil en contextos creativos adultos o de terror.
- Investigación sobre modelos de difusión: el repositorio facilita comparar el comportamiento entre cuantizaciones (BF16 vs Q4_K_M vs NVFP4) sobre el mismo modelo base, midiendo la degradación de calidad introducida por cada nivel de compresión.
- Despliegue en estaciones de trabajo con Apple Silicon: las variantes MLX 4/6/8 bits (4,00-7,56 GB) permiten ejecutar el modelo en Macs con memoria unificada, sin GPU dedicada.
- Automatización de pipelines de generación por lotes en ComfyUI: al estar todo empaquetado en un repositorio (transformer, text encoder y VAE), se simplifica la configuración reproducible de entornos y la integración en flujos de trabajo automatizados.
- Evaluación de sesgos y seguridad en modelos sin filtrado: investigadores pueden estudiar qué tipos de contenido genera un modelo "uncensored" y compararlo con la versión oficial, siempre dentro de los límites legales y éticos aplicables.

## Benchmarks y rendimiento

La model card incluye una imagen de referencia (`assets/Qwen-Image-2.1-Benchmark.png`) con resultados de benchmark del modelo base, pero los valores numéricos no están transcritos en el texto disponible. No se han publicado resultados de benchmarks en la información disponible en formato tabular.

## Requisitos de hardware

- VRAM estimada para el transformer: BF16 requiere ~14,23 GB solo para los pesos; Q8_0 ~7,59 GB; Q6_K ~5,88 GB; Q5_K_M ~5,22 GB; Q4_K_M ~4,60 GB; Q4_0 ~4,15 GB; NVFP4 ~4,20 GB.
- VRAM adicional para el text encoder: BF16 ~17,53 GB o INT8 ~9,35 GB; el VAE añade ~676 MB.
- Pipeline completo con Q4_K_M + text encoder INT8 + VAE: aproximadamente 14,6 GB de pesos, por lo que se recomienda una GPU con 16 GB o más de VRAM (RTX 4080, RTX 4090, RTX 5090, A100, H100).
- Pipeline completo con BF16: aproximadamente 32,4 GB de pesos, lo que exige GPUs de 40-80 GB (A100 80GB, H100) o descarga parcial a RAM.
- En GPUs de 8-12 GB es posible ejecutar cuantizaciones Q4 con text encoder INT8 si se acepta offloading parcial a RAM del sistema, con la consiguiente penalización de velocidad.
- Opciones de despliegue: ComfyUI con ComfyUI-GGUF (fork leejet/ComfyUI-GGUF recomendado para Qwen-Image 2.1); las variantes MLX requieren el ecosistema MLX de Apple.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Contexto/entrada | Notas |
|---|---|---|---|---|---|
| Qwen-Image-2.1-Uncensored-GGUF (este) | 7,12 B (transformer) | GGUF, safetensors, MLX | qwen-research | Text encoder Qwen3-VL 8B | Variante sin filtrado, empaquetado para ComfyUI |
| Qwen/Qwen-Image-2.1 (base oficial) | 7,12 B (transformer) | safetensors | qwen-research | Text encoder Qwen3-VL 8B | Versión oficial con filtros de seguridad |
| Alternativas de difusión open source (p. ej. FLUX.1, SDXL) | No disponible en la información proporcionada | GGUF, safetensors | Variable | Variable | No se dispone de datos comparativos en la información proporcionada |

No se dispone de datos de rendimiento comparativo entre este modelo y alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- La licencia `qwen-research` restringe el uso comercial; es imprescindible revisar los términos completos antes de cualquier despliegue en producción.
- La etiqueta "uncensored" implica que el modelo puede generar contenido explícito, violento o potencialmente dañino; el usuario es responsable del uso y de cumplir la legislación aplicable.
- No hay documentación sobre sesgos demográficos, culturales o de representación en el modelo base ni en la variante uncensored.
- Riesgo de alucinación visual: como todo modelo generativo de imágenes, puede producir anatomías incorrectas, texto ilegible en la imagen o incoherencias espaciales.
- Las cuantizaciones de 4 bits (Q4_K_M, Q4_0, NVFP4, MLX 4-bit) introducen degradación de calidad respecto a BF16; el autor no publica métricas de esa pérdida.
- La model card no documenta los idiomas soportados por el text encoder en el contexto de generación de imágenes.
- El repositorio tiene 136,6 GB; descargar solo los ficheros necesarios para evitar consumo innecesario de disco y ancho de banda.
- Los enlaces de descarga de la model card apuntan a la cuenta `abenzerps`, no a `KasugaiSakura`; conviene verificar la integridad de los ficheros antes de usarlos.
- El fork `city96/ComfyUI-GGUF` puede fallar con el error "Unknown model architecture!"; se recomienda el fork `leejet/ComfyUI-GGUF`.
- No se documentan garantías de soporte, actualizaciones ni mantenimiento del repositorio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/KasugaiSakura/Qwen-Image-2.1-Uncensored-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
- ComfyUI-GGUF (fork recomendado): https://github.com/leejet/ComfyUI-GGUF
- ComfyUI-GGUF (fork original): https://github.com/city96/ComfyUI-GGUF
- Cuenta alternativa referenciada en la model card: https://huggingface.co/abenzerps/Qwen-Image-2.1-Uncensored-GGUF
