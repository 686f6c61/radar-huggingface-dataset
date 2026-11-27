# KalponicStudio/MiniMax-H3-Image-Ojon

## Resumen

MiniMax-H3-Image-Ojon es una colección de cuantizaciones del modelo de difusión MiniMax H3-Image, un text-to-image e image editing desarrollado originalmente por MiniMax y distribuido en formato BF16 por Comfy-Org. Esta versión la publica KalponicStudio, que aplica su propio cuantizador local, Ojon (v0.1.0), para reducir el peso del modelo original desde los 40,2 GB del checkpoint BF16 hasta ficheros de entre 11,87 y 17,37 GB, manteniendo la fidelidad visual medida mediante SSIM frente a una referencia W6A8.

El modelo original tiene 20.113.670.232 parámetros (unos 20,1 mil millones) y está pensado para ejecutarse dentro de ComfyUI como modelo de difusión, acompañado del text encoder y el VAE de imagen de la release original. La propuesta de esta ficha es clara: permitir que GPUs de 24 GB o menos puedan ejecutar un modelo de imagen de 20B que en BF16 no cabe en esas tarjetas. La cuantización W6A8 se toma como referencia precisamente porque el render BF16 no entraba en la GPU de 24 GB usada para las pruebas.

Es relevante ahora porque el ecosistema de generación de imágenes local está migrando hacia modelos de difusión de gran tamaño con requisitos de VRAM altos, y las cuantizaciones GGUF e INT8 (W4A8/W6A8) se han convertido en la vía práctica para desplegarlos en hardware de consumo y en GPUs profesionales de gama media. La licencia es "other", lo que obliga a revisar los términos originales antes de cualquier uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | modelo de difusión (text-to-image e image editing); arquitectura interna no detallada en la información disponible |
| Parámetros totales | 20.113.670.232 (20,1 B) |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF Q4_K mix, GGUF Q5_K mix, W4A8 (INT8 agrupado), W6A8 (INT8 agrupado) |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | safetensors (W4A8/W6A8, formato comfy-kitchen) y GGUF (Q4/Q5) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo original (tipo de backbone, número de bloques, mecanismo de atención o esquema de condicionamiento). Lo que sí se documenta es la estructura de las cuantizaciones, que revela parte del grafo: el modelo tiene al menos 50 bloques (se citan los bloques 0 y 49 como primero y último), proyecciones de salida, proyecciones de condición, capas AdaLN, una cabeza PDD y un patchifier. Los ficheros GGUF declaran `general.architecture=wan`, lo que sugiere una topología compatible con el ecosistema Wan dentro de ComfyUI, aunque no se confirma que sea la misma arquitectura.

En cuanto al entrenamiento, no hay datos en la información proporcionada sobre número de tokens, composición del dataset, uso de RLHF/DPO ni innovaciones de decodificación. La contribución técnica de esta publicación no es el entrenamiento, sino el proceso de cuantización: Ojon genera los ficheros GGUF con mezclas Q4_K/Q5_K/Q6_K selectivas por capa (por ejemplo, en Q5 las proyecciones de salida van en Q6_K, los bloques 0 y 49 en Q6_K y las fc1 de los bloques 15 a 34 en Q4_K), dejando sin cuantizar normas, proyección de condición, AdaLN, cabeza PDD y patchifier. Para W4A8 y W6A8 se usa el layout INT8 agrupado de comfy-kitchen, generado por el convertidor nativo en Rust de Ojon, que según el autor coincide al 99,9999% con el cuantizador de referencia de comfy-kitchen.

## Capacidades

- Generación de imágenes text-to-image a partir de prompts en lenguaje natural.
- Edición de imágenes (image editing), según la model card del autor.
- Render de texto dentro de la imagen: el autor afirma que todos los ficheros renderizan texto correctamente en sus pruebas.
- Render de materiales y texturas: también validado en las pruebas del autor.
- Ejecución en ComfyUI 0.45 o superior, tanto con el loader GGUF (`Unet Loader (GGUF)`) como con el loader estándar de modelos de difusión con comfy-kitchen.
- Configuración de inferencia optimizada a 6 pasos, cfg 1, sampler euler/simple, a 1024x1024.
- Compatibilidad con el text encoder H3 y el VAE de imagen de la release original (no incluidos en este repo).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-step ni multimodalidad de entrada más allá de la edición de imagen.

## Casos de uso

- Generación de ilustraciones en estación de trabajo con GPU de 24 GB: el fichero Q5 (13,91 GB) permite ejecutar un modelo de 20B en una tarjeta como la Intel Arc Pro B60 usada por el autor, con unos 3,6 s por paso a 1024x1024 y 16-18 GB de VRAM pico, lo que hace viable la iteración interactiva en ComfyUI.
- Edición de imágenes en flujos locales: al soportar image editing, el modelo puede usarse para retocar o transformar imágenes existentes dentro de un pipeline de ComfyUI, manteniendo los datos en local sin depender de APIs externas.
- Prototipado rápido de assets para videojuegos o publicidad: la combinación de 6 pasos y cfg 1 reduce el coste por imagen, y el fichero Q4 (11,87 GB) permite generar variaciones masivas en GPUs de gama consumer alta.
- Generación de imágenes con texto integrado (carteles, mockups, packaging): el autor valida explícitamente el render de texto, lo que resulta útil para pruebas de concepto de diseño gráfico donde el texto debe ser legible.
- Despliegue en nodos de inferencia con INT8: en GPUs NVIDIA Ada o posteriores, el fichero W4A8 (12,55 GB) aprovecha los kernels INT8 rápidos de comfy-kitchen, adecuado para servicios internos de generación de imágenes con baja latencia.
- Investigación sobre cuantización de modelos de difusión: la publicación incluye métricas SSIM frente a W6A8 y frente a un Q4_K público (AtomicChat), lo que la convierte en un punto de comparación útil para estudiar el impacto de distintas mezclas de cuantización en la calidad visual.
- Evaluación de pipelines ComfyUI en hardware modesto: sirve para validar flujos de trabajo de difusión de 20B en tarjetas de 16-24 GB antes de invertir en GPUs de datacenter.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor sí publica una comparación de similitud visual (SSIM) frente a la referencia W6A8, con los mismos prompts y seeds, a 1024x1024, 6 pasos, cfg 1, sampler euler/simple:

| Fichero | Tamaño | Formato | SSIM frente a W6A8 |
|---|---|---|---|
| W6A8 (referencia) | 17,37 GB | comfy-kitchen W6A8 | referencia |
| Q5 GGUF | 13,91 GB | GGUF Q5_K mix | 0,843 |
| W4A8 | 12,55 GB | comfy-kitchen W4A8 | 0,804 |
| Q4 GGUF | 11,87 GB | GGUF Q4_K mix | 0,765 |
| Q4_K público (AtomicChat) | 11,57 GB | GGUF Q4_K | 0,777 |

Datos de rendimiento medidos por el autor en una Intel Arc Pro B60 (24 GB): aproximadamente 3,6 s por paso a 1024x1024, con un pico de VRAM de 16-18 GB.

## Requisitos de hardware

- VRAM estimada: 16-18 GB en pico para el fichero Q5 a 1024x1024 según la medición del autor; los ficheros Q4 y W4A8, al ser más pequeños, deberían reducir ese pico, aunque no se publican cifras específicas para ellos.
- GPU recomendadas: Intel Arc Pro B60 (24 GB) es la tarjeta usada en las pruebas. Para W4A8/W6A8 se recomienda NVIDIA Ada o posterior por los kernels INT8 rápidos de comfy-kitchen. No se documentan pruebas en A100, H100 ni RTX 4090.
- Cabe en GPU consumer: sí, en tarjetas de 24 GB (RTX 3090, RTX 4090, Intel Arc Pro B60). En tarjetas de 16 GB el margen es ajustado y no está confirmado en la información disponible.
- Opciones de despliegue: ComfyUI 0.45+ con el nodo `Unet Loader (GGUF)` para los ficheros GGUF, o el loader estándar de modelos de difusión con comfy-kitchen para W4A8/W6A8. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de difusión de imagen).
- Latencia y throughput: unos 3,6 s por paso a 1024x1024 en Intel Arc Pro B60 con 6 pasos, lo que sitúa una imagen completa en torno a los 21-22 s en ese hardware (cálculo derivado de los datos del autor).

## Comparativa con modelos similares

La información disponible solo permite comparar contra el checkpoint original y contra otro GGUF Q4_K público:

| Modelo / fichero | Parámetros | Contexto | Tamaño | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMax H3-Image BF16 (Comfy-Org) | 20,1 B | no disponible | 40,2 GB | other | Hugging Face (Comfy-Org) |
| MiniMax-H3-Image-Ojon W6A8 | 20,1 B | no disponible | 17,37 GB | other | Hugging Face (KalponicStudio) |
| MiniMax-H3-Image-Ojon Q5 | 20,1 B | no disponible | 13,91 GB | other | Hugging Face (KalponicStudio) |
| MiniMax-H3-Image-Ojon W4A8 | 20,1 B | no disponible | 12,55 GB | other | Hugging Face (KalponicStudio) |
| MiniMax-H3-Image-Ojon Q4 | 20,1 B | no disponible | 11,87 GB | other | Hugging Face (KalponicStudio) |
| Q4_K público (AtomicChat) | 20,1 B (presumiblemente) | no disponible | 11,57 GB | no disponible | Hugging Face (AtomicChat) |

No se dispone de datos para comparar con otros modelos de difusión de tamaño similar (por ejemplo, variantes de Flux, SD3 o Wan) en la información proporcionada.

## Limitaciones y advertencias

- Licencia "other": no se especifican los términos exactos en la información disponible; es obligatorio revisar la licencia del modelo original de MiniMax y de Comfy-Org antes de cualquier uso comercial o redistribución.
- El repositorio no incluye el text encoder H3 ni el VAE de imagen; hay que obtenerlos de la release original, lo que añade dependencias externas y posibles incompatibilidades de versión.
- Los ficheros GGUF declaran `general.architecture=wan`, una etiqueta que puede no reflejar la arquitectura real de MiniMax H3-Image y que conviene validar antes de confiar en ella para tooling automático.
- La referencia de calidad es W6A8, no BF16, porque el render BF16 no cabía en la GPU de 24 GB del autor; por tanto, las métricas SSIM miden la degradación respecto a una cuantización, no respecto al modelo original en precisión completa.
- La cuantización Q4 presenta un SSIM de 0,765, inferior al 0,777 de un Q4_K público de otro autor, lo que sugiere que en ese régimen de compresión la mezcla elegida no es la mejor opción disponible.
- No hay información sobre sesgos del modelo, riesgo de alucinación visual, limitaciones idiomáticas ni comportamiento en prompts no ingleses.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, y fue creado y actualizado el mismo día (27 de noviembre de 2026), por lo que no hay validación comunitaria independiente.
- Los kernels INT8 de comfy-kitchen solo ofrecen ventaja en NVIDIA Ada o posterior; en otras GPUs el W4A8 puede no aportar mejora de velocidad frente a GGUF.
- Las mediciones de latencia y VRAM provienen de una única GPU (Intel Arc Pro B60) y no se han replicado en otras plataformas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KalponicStudio/MiniMax-H3-Image-Ojon
- Repositorio de Ojon (cuantizador usado): https://github.com/jony100200/Ojon
- Checkpoint original BF16 de Comfy-Org: `Comfy-Org/minimax_h3_image_pruned_bf16.safetensors` (referenciado en la model card; no se proporciona URL directa en la información disponible)
- GGUF Q4_K público de comparación: AtomicChat (referenciado en la model card; no se proporciona URL directa en la información disponible)
- comfy-kitchen (formato W4A8/W6A8): no se proporciona URL en la información disponible
- Vídeo de demostración: anunciado como "coming soon" por el autor, no disponible todavía
