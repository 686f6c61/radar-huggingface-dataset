# abenzerps/Qwen-Image-2.1-Uncensored-Quantized

## Resumen

Qwen-Image-2.1-Uncensored-Quantized es un conjunto de pesos cuantizados del modelo de generación de imágenes Qwen/Qwen-Image-2.1-Turbo, publicado por el usuario abenzerps en Hugging Face. No se trata de un modelo nuevo entrenado desde cero, sino de una redistribución empaquetada de cuantizaciones (GGUF, safetensors FP8/INT8/NVFP4 y MLX en 4, 6 y 8 bits) pensadas para su uso en ComfyUI, stable-diffusion.cpp y MFLUX. El modelo base es un text-to-image de 7.115.124.736 parámetros (aproximadamente 7B) con arquitectura de generación visual y variante "Turbo" de 8 pasos de denoising con CFG por defecto igual a 1.

La relevancia de esta ficha radica en que el modelo base, según su autor, no incorpora safety checker ni filtro de contenido, y el empaquetado se distribuye bajo la etiqueta "uncensored". El repositorio acumula 187.989 descargas y 6.043 likes, y ofrece un tamaño total de 215,1 GB, lo que refleja que contiene múltiples variantes de cuantización y los componentes auxiliares (text encoder Qwen3-VL de 8B y VAE).

El pipeline declarado es text-to-image y la librería es gguf. La licencia indicada es "other" con nombre "qwen-research", lo que condiciona el uso comercial. La información disponible no incluye detalles sobre el dataset de entrenamiento, el proceso de alineación ni resultados de benchmarks numéricos más allá de la referencia a una imagen comparativa en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de generación visual (text-to-image); detalles internos no disponibles |
| Parametros totales | 7.115.124.736 (≈7B) |
| Parametros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF (Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_0), safetensors FP8, INT8 ConvRot, NVFP4, MLX 4-bit, 6-bit y 8-bit |
| Idiomas soportados | No disponible |
| Licencia | qwen-research (etiqueta "other") |
| Formato de pesos | GGUF y safetensors (incluye variantes MLX) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base Qwen-Image-2.1-Turbo más allá de describirlo como una "arquitectura de generación visual de 7B". Se sabe que es un modelo de difusión para generación de imágenes a partir de texto, con una variante Turbo configurada para 8 pasos de denoising y CFG por defecto de 1, lo que reduce el coste computacional frente a configuraciones de muestreo más largas. El repositorio incluye un text encoder basado en Qwen3-VL de 8B (en BF16 o INT8 ConvRot) y un VAE específico (qwen_image_2.1_vae_bf16), lo que confirma una arquitectura de dos etapas típica: codificación del prompt con un modelo de lenguaje multimodal y decodificación latente con VAE.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO u otras formas de alineación. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal. El autor indica que el modelo base no aplica filtro de contenido ni safety checker, y que no requiere ajustes especiales para generar imágenes sin censura, pero no se detalla cómo se logró esa ausencia de filtrado.

## Capacidades

- Generación de imágenes a partir de descripciones textuales (text-to-image) en resolución 1024 × 1024.
- Generación rápida en modo Turbo: 8 pasos de denoising con CFG 1.0, lo que permite obtener imágenes en aproximadamente 10–20 segundos en GPU tras el calentamiento, según el autor.
- Generación sin filtro de contenido integrado, según la model card del autor.
- Compatibilidad con ComfyUI mediante flujos de trabajo oficiales (plantilla "Qwen Image 2.1 Turbo — Text to Image").
- Compatibilidad con stable-diffusion.cpp para ejecución en línea de comandos.
- Compatibilidad con MLX/MFLUX en variantes de 4, 6 y 8 bits para hardware Apple Silicon.
- Soporte de cuantizaciones GGUF para despliegue en entornos con memoria limitada.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de audio.

## Casos de uso

- Generación de ilustraciones conceptuales para prototipado rápido: con 8 pasos y CFG 1.0, el modelo permite iterar sobre ideas visuales en segundos, adecuado para equipos de diseño que necesitan explorar variantes antes de producir assets finales.
- Creación de contenido visual para entornos de investigación en seguridad de IA: al no incluir filtro de contenido, puede emplearse en estudios controlados sobre generación de imágenes y evaluación de riesgos, siempre que se cumplan los requisitos de la licencia qwen-research.
- Integración en pipelines de ComfyUI para producción de imágenes por lotes: el formato GGUF Q4_K_M (4,42 GB) o el safetensors INT8 ConvRot (7,26 GB) permiten desplegar el modelo en estaciones de trabajo con GPUs de consumo, usando la plantilla oficial para mantener el schedule de muestreo correcto.
- Generación de imágenes en hardware Apple Silicon: las variantes MLX de 4 bits (4,00 GB) y 6 bits (5,78 GB) permiten ejecutar el modelo en Macs con memoria unificada, usando MFLUX como runtime.
- Automatización de generación de imágenes en línea de comandos: mediante stable-diffusion.cpp con los archivos GGUF, se pueden crear scripts reproducibles para generar conjuntos de imágenes con semillas fijas, útil en evaluación comparativa de prompts.
- Despliegue en entornos con VRAM limitada: la variante NVFP4 (4,20 GB) o Q4_0 (4,13 GB) reducen el footprint para GPUs de gama media, a costa de posible pérdida de calidad frente a FP8 o Q8_0.
- Experimentación con text encoder cuantizado: el repositorio incluye qwen3vl_8b_int8_convrot (9,35 GB) frente al BF16 (17,53 GB), lo que permite reducir memoria del pipeline completo en ComfyUI manteniendo el encoder multimodal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numéricos en la información disponible. La model card referencia una imagen comparativa (`assets/Qwen-Image-2.1-Benchmark.png`) pero no se proporcionan cifras en el texto. El único dato de rendimiento explícito es que la generación a 1024 × 1024 tarda aproximadamente 10–20 segundos en GPU tras el calentamiento, dependiendo del hardware.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo de difusión en Q4_K_M ocupa 4,42 GB; Q4_0, 4,13 GB; NVFP4, 4,20 GB; Q5_K_M, 5,35 GB; Q6_K, 6,29 GB; Q8_0, 7,69 GB; FP8, 7,13 GB; INT8 ConvRot, 7,26 GB. A ello hay que sumar el text encoder (9,35 GB en INT8 o 17,53 GB en BF16) y el VAE (0,68 GB), por lo que el pipeline completo en ComfyUI requiere bastante más memoria que el solo modelo de difusión.
- GPU recomendadas: no se especifican modelos concretos en la información disponible. Por los tamaños indicados, GPUs con 16–24 GB de VRAM (RTX 4090, A100, H100) permiten ejecutar el pipeline completo con text encoder en BF16; GPUs de 8–12 GB pueden requerir el text encoder en INT8 y cuantizaciones bajas del modelo de difusión.
- Cabe en GPU de consumo: sí, con cuantizaciones Q4/Q5 y text encoder INT8, aunque el margen depende de la VRAM total y del runtime.
- Opciones de despliegue: ComfyUI (con soporte GGUF y safetensors), stable-diffusion.cpp (GGUF y safetensors compatibles), MLX/MFLUX (variantes MLX 4/6/8-bit).
- Latencia y throughput: 10–20 segundos por imagen 1024 × 1024 en GPU tras calentamiento, según el autor; no se especifica el hardware exacto ni el throughput por lote.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada. La model card menciona una comparativa visual en imagen, pero no se ofrecen cifras que permitan una tabla rigurosa. Los modelos de la familia Qwen-Image (base y Turbo) serían los comparables naturales, pero no se detallan sus parámetros, contexto ni rendimiento en la información disponible.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen-Image-2.1-Uncensored-Quantized | ≈7B | No disponible | qwen-research | Hugging Face (este repo) |
| Qwen-Image-2.1-Turbo (base) | ≈7B | No disponible | qwen-research | Hugging Face |
| Alternativas de la misma categoría | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Ausencia de filtro de contenido: el modelo base no incorpora safety checker, lo que implica riesgo de generar contenido inapropiado, ilegal o dañino si se usa sin salvaguardas externas.
- Licencia qwen-research: restringe el uso, especialmente el comercial; es necesario revisar los términos completos antes de desplegar en producción.
- Riesgo de alucinación visual: como todo modelo generativo de imágenes, puede producir resultados incoherentes con el prompt, especialmente en composiciones complejas o texto dentro de la imagen.
- Idiomas soportados no documentados: no se especifica qué lenguas maneja el text encoder para los prompts, lo que limita la evaluación multilingüe.
- Contexto no disponible: se desconoce la longitud máxima de prompt admitida.
- Calidad dependiente de la cuantización: las variantes Q4_0, Q4_K_M y NVFP4 reducen el tamaño pero pueden degradar el detalle frente a FP8, Q8_0 o BF16; el autor recomienda Q4_K_M como punto de partida para GGUF e INT8 ConvRot para safetensors.
- Dependencia de componentes auxiliares: el pipeline requiere text encoder y VAE específicos; usar otros puede romper la compatibilidad o degradar la calidad.
- Fecha de creación y actualización: el repositorio data de septiembre de 2026 y se actualizó en noviembre de 2026; conviene verificar cambios en los archivos y en la licencia.
- Falta de documentación técnica: no se detallan dataset, alineación ni arquitectura interna, lo que dificulta la reproducibilidad y la evaluación de sesgos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/abenzerps/Qwen-Image-2.1-Uncensored-Quantized
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1-Turbo
- Repositorio de cuantizaciones referenciado en la model card: https://huggingface.co/abenzerps/Qwen-Image-2.1-Turbo-Quantized
- ComfyUI: https://github.com/Comfy-Org/ComfyUI
- Plantilla oficial de flujo de trabajo: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_qwen_image_2_1_turbo_t2i.json
- GitHub del autor: https://github.com/abenzerps
- Formulario de solicitud de modelos del autor: https://abenzerps.com/request-a-model/
