# Nicolaslas/Rebels_w4a8s

## Resumen

Rebels W4A8 Collection es una colección de modelos de difusión de imagen y vídeo cuantizados en formato W4A8 (pesos de 4 bits, activaciones de 8 bits) para su uso nativo en ComfyUI. Desarrollada por Nicolaslas, esta colección aplica el formato `AsymW4A8Int8Layout` de comfy-kitchen a modelos actuales como Flux2-Klein, Z-Image-Turbo, Krea-2-Turbo, SCAIL-2, Wan-Animate-2, Qwen-Image y MiniMax-H3, entre otros. El objetivo es reducir el tamaño de almacenamiento y el uso de VRAM manteniendo la computación en int8 de extremo a extremo, evitando la dequantización a fp16 que ocurre en GGUF.

La colección incluye modelos desde 3.9B hasta 33.1B parámetros, con tamaños de archivo que van desde 2.46 GB hasta 24.5 GB. Todos se cargan con el nodo estándar "Load Diffusion Model" de ComfyUI, sin necesidad de nodos personalizados adicionales. La cuantización utiliza una combinación de rotación Hadamard (ConvRot), codebooks de niveles no uniformes (Lloyd-Max) y escalas por grupo en fp8, con capas sensibles (embeddings de timestep, proyecciones de condicionamiento, capas de salida) que se mantienen en alta precisión. Cada modelo conserva la licencia del modelo base, por lo que es necesario verificar cada uno antes de uso comercial.

## Especificaciones técnicas

La colección es un conjunto de modelos independientes. Los parámetros globales de la colección no aplican, por lo que se detallan los modelos individuales en la tabla siguiente.

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelos de difusión (text-to-image y text-to-video) cuantizados W4A8 |
| Parámetros totales | Desde 3.9B hasta 33.1B según modelo (ver tabla de modelos) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelos de difusión, no texto) |
| Tipos de cuantizacion | W4A8 (pesos int4, activaciones int8), capas mixtas en int8_tensorwise |
| Idiomas soportados | No disponible (la generación depende del texto encoder del modelo base) |
| Licencia | Licencias individuales de cada modelo base (Apache-2.0, Flux License, otras) |
| Formato de pesos | safetensors con layout `comfy_quant` (int4 + escalas fp8 + codebook) |

**Modelos incluidos:**

| Modelo | Parámetros | Tamaño | Notas |
|---|---|---|---|
| Flux2-Klein-4B-w4a8 | 3.9 B | 2.46 GB | Apache-2.0, funciona en GPUs de 6 GB |
| Z-Image-Turbo-w4a8 | 6.2 B | 3.67 GB | Destilado, 8 pasos, CFG 1.0 |
| Flux2-Klein-9B-w4a8 | 9.1 B | 5.62 GB | Licencia Flux |
| Krea-2-Turbo-w4a8 | 12.8 B | 7.23 GB | Turbo, CFG 1.0 (no 4.0) |
| SCAIL-2-14B-w4a8 | ~14 B | no disponible | Basado en Wan2.1, vídeo, requiere trabajo |
| Wan-Animate-2-TURBO-w4a8 | 16.4 B | 9.59 GB | Vídeo, la imagen de referencia debe coincidir con la pose inicial del vídeo |
| Qwen-Image-2512-w4a8 | ~20 B | 14.5 GB | Modelo completo, pasos y CFG normales, requiere trabajo |
| MiniMax-H3-REF2VA-w4a8 | 33.1 B | 24.5 GB | Referencia a vídeo con audio, capas `adaln_proj` en int8 |

## Arquitectura y entrenamiento

La colección no consiste en modelos entrenados desde cero, sino en cuantizaciones de modelos de difusión existentes. La técnica principal es la cuantización W4A8: los pesos se almacenan como códigos int4 (dos por byte) y las activaciones se procesan en int8, utilizando los núcleos de tensor cores int8 de las GPUs modernas. Esto difiere de GGUF, que descomprime los pesos a fp16 antes de la multiplicación de matrices, lo que reduce la ventaja de cómputo.

Cada archivo cuantizado contiene cinco componentes: los códigos int4 (`weight`), una escala fp8 por grupo de 16 (`weight_s_rel`), una escala por canal de salida (`weight_s_channel`), un codebook de 16 niveles Lloyd-Max ajustado a la distribución de pesos (`weight_codebook`) y la configuración de layout (`comfy_quant`). La cuantización aplica tres innovaciones: una rotación Hadamard (ConvRot) que aplana los outliers para que 4 bits sean suficientes, un codebook no uniforme que se adapta a la distribución real de pesos, y escalas por grupo en fp8 para preservar el rango dinámico local. El proceso es libre de calibración, es decir, no requiere un dataset de activaciones, evitando sesgos hacia ciertos tipos de prompts.

Las capas sensibles no se cuantizan: los embeddings de timestep, las proyecciones de condicionamiento, las proyecciones de patch, las capas de salida finales y las tablas rotatorias se mantienen en F16/F32. Además, las capas cuya dimensión de entrada no es divisible por 256 (requisito del kernel W4A8 fusionado) se almacenan como `int8_tensorwise`, también nativo, con un error de reconstrucción de aproximadamente el 1%. Cada conversión se verifica midiendo el error de reconstrucción por capa contra los pesos bf16 originales.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image) con los modelos Flux2-Klein, Z-Image-Turbo, Krea-2-Turbo y Qwen-Image.
- Generación de vídeo a partir de texto y de imagen de referencia (text-to-video y reference-to-video) con SCAIL-2, Wan-Animate-2 y MiniMax-H3.
- MiniMax-H3-REF2VA incluye generación de audio sincronizado con el vídeo.
- Modos turbo y destilados: Z-Image-Turbo (8 pasos, CFG 1.0) y Krea-2-Turbo (CFG 1.0) permiten generación rápida con pocos pasos.
- Compatibilidad nativa con ComfyUI: los archivos se cargan con el nodo estándar "Load Diffusion Model", sin necesidad de nodos personalizados.
- Soporte para GPUs de bajos recursos: el modelo más pequeño (3.9B) ocupa 2.46 GB y puede ejecutarse en tarjetas con 6 GB de VRAM.
- Cuantización con error de reconstrucción medido (~7% relL2 en pesos), verificada por capa antes de su publicación.

## Casos de uso

- Generación de imágenes en equipos con GPU limitada: Flux2-Klein-4B-w4a8 (2.46 GB) permite ejecutar un modelo de 3.9B en tarjetas de 6 GB, ideal para estaciones de trabajo sin GPUs de gama alta.
- Producción de imágenes en tiempo real: Z-Image-Turbo-w4a8, al requerir solo 8 pasos y CFG 1.0, es adecuado para generación iterativa en flujos de diseño donde la latencia es crítica.
- Creación de vídeo con imagen de referencia: Wan-Animate-2-TURBO-w4a8 permite animar una imagen siguiendo un vídeo de conducción, siempre que la pose inicial coincida. Útil para doblaje de personajes o animación de ilustraciones.
- Vídeo con audio integrado: MiniMax-H3-REF2VA-w4a8 genera vídeo con pista de audio a partir de una imagen de referencia, útil para prototipos de anuncios o contenidos para redes sociales.
- Experimentación con modelos de difusión cuantizados: la colección sirve como banco de pruebas para evaluar el impacto de la cuantización W4A8 en diferentes arquitecturas (Flux, Qwen, Wan, MiniMax) sin necesidad de convertir los modelos manualmente.
- Despliegue en entornos con restricciones de almacenamiento: los archivos reducen el tamaño a aproximadamente 0.56 bytes por parámetro, lo que facilita la distribución y el almacenamiento local de múltiples modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de calidad de imagen (FID, CLIP score) ni comparaciones cuantitativas con los modelos originales. Solo se menciona el error de reconstrucción de pesos (~7% relL2) y el error por capa para las capas en int8_tensorwise (~1%), pero no hay datos de rendimiento en tareas de generación.

## Requisitos de hardware

- Software: ComfyUI 0.30.0 o superior con `asym_w4a8_int8` en el registro nativo de cuantización, y comfy-kitchen instalado (aporta los kernels). En el arranque, ComfyUI debe mostrar `asym_w4a8_int8` en la lista de "Native ops"; si aparece como "emulated", el modelo funciona pero sin la ventaja de velocidad int8.
- GPU: NVIDIA o AMD con soporte para los kernels int8. No se especifican modelos concretos, pero se puede estimar la VRAM según el tamaño del archivo:
  - Flux2-Klein-4B-w4a8 (2.46 GB): cabe en GPUs con 6 GB de VRAM (por ejemplo, RTX 2060, RTX 3050, GTX 1660 Super).
  - Z-Image-Turbo-w4a8 (3.67 GB) y Flux2-Klein-9B-w4a8 (5.62 GB): requieren al menos 8 GB de VRAM (RTX 3060, RTX 2070, etc.).
  - Krea-2-Turbo-w4a8 (7.23 GB) y Wan-Animate-2-TURBO-w4a8 (9.59 GB): necesitan 12 GB o más (RTX 3060 12GB, RTX 3080, etc.).
  - Qwen-Image-2512-w4a8 (14.5 GB) y MiniMax-H3-REF2VA-w4a8 (24.5 GB): requieren 24 GB o más (RTX 3090, RTX 4090, A5000, etc.).
- Despliegue: exclusivamente a través de ComfyUI con el nodo "Load Diffusion Model". No se mencionan alternativas como vLLM, llama.cpp u Ollama, ya que el formato está diseñado para el ecosistema ComfyUI.
- Latencia y throughput: no disponibles. Dependen de la GPU y del número de pasos del sampler. Los modelos turbo (Z-Image, Krea-2) están optimizados para pocos pasos.

## Comparativa con modelos similares

La comparativa natural es contra las versiones GGUF de los mismos modelos base, ya que ambas son formatos de cuantización para ComfyUI. La model card ofrece una comparación directa:

| Característica | GGUF Q4_K_M | W4A8 (esta colección) |
|---|---|---|
| Almacenamiento | ~0.60 B/elemento | ~0.56 B/elemento |
| Ruta de cómputo | dequant → fp16 GEMM | int8 GEMM |
| Cargador | Nodo ComfyUI-GGUF | Nodo estándar Load Diffusion Model |
| Error de peso (medido) | varía por tensor | ~7% relL2 |

Otra comparativa sería contra los modelos originales sin cuantizar (bf16/fp16). En ese caso, los archivos W4A8 ocupan aproximadamente un 25% del tamaño original (0.56 bytes por parámetro frente a 2 bytes por parámetro en bf16), a costa de un error de reconstrucción del 7% en pesos. No hay datos de calidad de imagen comparativa.

## Limitaciones y advertencias

- Licencias: cada modelo conserva la licencia de su modelo base. Flux2-Klein-4B es Apache-2.0, Flux2-Klein-9B usa Flux License, y otros pueden tener restricciones comerciales. Es imprescindible revisar la licencia de cada modelo fuente antes de usarlo en producción.
- Requisitos de software estrictos: se necesita ComfyUI 0.30.0+ y comfy-kitchen. Si el registro nativo no incluye `asym_w4a8_int8`, el modelo se ejecuta en modo emulado, perdiendo la ventaja de velocidad int8.
- Modelos marcados como "NEEDS WORK": SCAIL-2-14B y Qwen-Image-2512 no están completamente verificados y pueden producir resultados subóptimos.
- Limitaciones del formato: las capas con dimensión de entrada no divisible por 256 se convierten a `int8_tensorwise`, lo que aumenta el error de reconstrucción a ~1% en esas capas. Aunque es bajo, no es exactamente W4A8.
- Dependencia de kernels específicos: el rendimiento depende de que la GPU soporte operaciones int8 eficientes. En GPUs sin tensor cores int8, la ventaja de cómputo desaparece.
- Sin datos de calidad de imagen: no se han publicado métricas de FID, CLIP score ni comparaciones visuales con los modelos originales. El error de reconstrucción de pesos no garantiza la calidad final de la generación.
- Riesgo de alucinación y sesgos: al ser modelos de difusión cuantizados, pueden presentar los mismos sesgos que los modelos base, y la cuantización puede amplificar artefactos en algunos casos. No hay información específica sobre sesgos en esta colección.
- Almacenamiento y descarga: el repositorio tiene un tamaño de 181.9 GB, lo que implica una descarga considerable si se quieren todos los modelos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Nicolaslas/Rebels_w4a8s
- Referencia al formato de cuantización: comfy-kitchen (mencionado en la model card, sin enlace directo)
