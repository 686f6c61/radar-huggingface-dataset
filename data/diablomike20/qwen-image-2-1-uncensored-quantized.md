# diablomike20/Qwen-Image-2.1-Uncensored-Quantized

## Resumen

Qwen-Image-2.1-Uncensored-Quantized es una redistribución cuantizada del modelo de generación de imágenes Qwen/Qwen-Image-2.1, publicada por el usuario diablomike20. El paquete incluye el transformer de difusión en múltiples formatos (GGUF, safetensors FP8/INT8/NVFP4 y MLX), junto con los ficheros complementarios necesarios para su uso en ComfyUI: el codificador de texto Qwen3-VL de 8B y el VAE específico del modelo. El objetivo es facilitar la inferencia local en hardware de consumo, algo imposible con los pesos originales en BF16.

El modelo base es un sistema text-to-image de Qwen con aproximadamente 7.115 millones de parámetros en el transformer de difusión, según los metadatos de safetensors del repositorio. La distribución ocupa 105,2 GB e incluye variantes que van desde BF16 (14,23 GB) hasta NVFP4 (4,20 GB) y MLX 4-bit (4,00 GB), cubriendo tanto GPUs NVIDIA como Apple Silicon.

La relevancia de esta ficha radica en que agrupa en un único repositorio todos los artefactos necesarios para desplegar el modelo en ComfyUI con soporte nativo de GGUF, algo que normalmente requiere descargar componentes de varias fuentes. La etiqueta "uncensored" indica que se han retirado o relajado los filtros de contenido del modelo original, lo que tiene implicaciones legales y de uso que se detallan más abajo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (modelo base Qwen-Image-2.1); no se especifica la variante exacta (DiT, MMDiT u otra) en la información disponible |
| Parámetros totales | 7.115.124.736 (transformer de difusión, según safetensors del repo) |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BF16, FP8, INT8 ConvRot, NVFP4, MLX 4-bit, MLX 6-bit, MLX 8-bit, GGUF Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_0 |
| Idiomas soportados | no disponible (el codificador de texto es Qwen3-VL 8B, multilingüe, pero no se detalla la cobertura) |
| Licencia | qwen-research (etiquetada como "other" en Hugging Face) |
| Formato de pesos | GGUF y safetensors; también MLX safetensors |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura interna del transformer de difusión más allá de identificarlo como Qwen-Image-2.1. Se trata de un modelo text-to-image que emplea un codificador de texto Qwen3-VL de 8B parámetros (17,53 GB en BF16, 9,35 GB en INT8 ConvRot) y un VAE propio de 676 MB en BF16. La combinación de un codificador de texto multimodal de 8B con un transformer de difusión de ~7B sugiere un pipeline de dos etapas típico: codificación semántica del prompt y del posible contexto visual, seguida de difusión latente.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o filtrado de contenido. La etiqueta "uncensored" del autor indica una modificación respecto al modelo original, pero no se especifica el método (fine-tuning, merging, edición de pesos o simple eliminación de la capa de seguridad). Tampoco se documentan innovaciones técnicas como decodificación especulativa, atención lineal o destilación de pasos.

## Capacidades

- Generación de imágenes a partir de prompts de texto (text-to-image) en el pipeline estándar de difusión.
- Codificación de prompts mediante Qwen3-VL 8B, lo que aporta comprensión multimodal del texto de entrada (el codificador es un modelo visión-lenguaje, aunque el pipeline declarado es solo text-to-image).
- Soporte de cuantizaciones múltiples que permiten ejecución en GPU NVIDIA (FP8, INT8, NVFP4, GGUF), Apple Silicon (MLX) y CPU (GGUF).
- Integración nativa con ComfyUI mediante el nodo ComfyUI-GGUF (fork de leejet).
- Generación sin filtros de contenido aparentes (etiqueta "uncensored"), lo que amplía el rango de prompts aceptados.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni audio, al tratarse de un modelo de imagen.

## Casos de uso

- Generación de ilustraciones para prototipado rápido: con la variante Q4_K_M (4,60 GB) el modelo cabe en GPUs de 8 GB de VRAM y permite iterar sobre prompts en local sin depender de APIs externas.
- Creación de assets para videojuegos o cómics: la variante BF16 (14,23 GB) ofrece la máxima fidelidad para generar sprites, fondos o viñetas que luego se retocan en un editor.
- Despliegue en Apple Silicon: las variantes MLX 4-bit (4,00 GB) y 6-bit (5,78 GB) están optimizadas para chips M-series, lo que permite generar imágenes en un MacBook sin GPU dedicada.
- Investigación sobre modelos de difusión sin censura: el paquete permite estudiar el comportamiento del modelo con prompts que el original rechazaría, útil para analizar sesgos y mecanismos de seguridad en modelos generativos.
- Pipelines de ComfyUI en producción: al incluir text encoder y VAE en el mismo repo, se simplifica el aprovisionamiento de contenedores o entornos reproducibles para generar imágenes por lotes.
- Fine-tuning o LoRA sobre el modelo base: los ficheros safetensors FP8 e INT8 sirven como punto de partida para adaptaciones con menor huella de memoria que el BF16 original.
- Generación de contenido editorial o artístico sin restricciones temáticas: útil para proyectos creativos que abordan temas que los filtros convencionales bloquean, con la responsabilidad legal que ello implica.

## Benchmarks y rendimiento

La model card incluye una imagen de benchmark (`assets/Qwen-Image-2.1-Benchmark.png`) pero no se transcriben los valores numéricos en el texto proporcionado. No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para el transformer de difusión: ~4,2 GB (NVFP4), ~4,6 GB (Q4_K_M), ~5,2 GB (Q5_K_M), ~5,9 GB (Q6_K), ~6,6 GB (FP8), ~7,6 GB (Q8_0), ~14,2 GB (BF16).
- A esa cifra hay que sumar el codificador de texto: 9,35 GB en INT8 ConvRot o 17,53 GB en BF16, y el VAE (676 MB). El total en el caso más ligero ronda los 14 GB; en BF16 completo supera los 32 GB.
- GPU recomendadas: NVIDIA A100/H100 para BF16 sin cuantizar; RTX 4090 (24 GB) para BF16 o FP8 con margen; RTX 4080/4070 Ti (16 GB) para Q8_0 o FP8 con codificador INT8; RTX 4060 Ti (16 GB) o RTX 3060 (12 GB) para Q4_K_M con codificador INT8.
- Cabe en GPU de consumo: sí, con las variantes Q4_K_M/Q4_0 y codificador INT8 en GPUs de 12-16 GB. En 8 GB es ajustado y requiere descarga parcial o cuantización adicional.
- Apple Silicon: variantes MLX 4-bit/6-bit/8-bit para chips M1/M2/M3/M4 con memoria unificada de 16 GB o más.
- Opciones de despliegue: ComfyUI con ComfyUI-GGUF (fork de leejet); para safetensors, ComfyUI estándar; MLX requiere el runtime MLX de Apple. No se documenta soporte de vLLM, TGI o llama.cpp (este último no aplica a difusión).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formatos | Disponibilidad |
|---|---|---|---|---|---|
| Qwen-Image-2.1 (original) | ~7,1B (transformer) | no disponible | qwen-research | safetensors BF16 | Hugging Face oficial |
| Qwen-Image-2.1-Uncensored-Quantized (este) | ~7,1B (transformer) | no disponible | qwen-research | GGUF, safetensors, MLX | Hugging Face (diablomike20) |
| Alternativas de difusión de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- La etiqueta "uncensored" implica que se han relajado o eliminado los filtros de contenido; el autor no documenta el método ni el alcance de la modificación, lo que impide evaluar su comportamiento real.
- La licencia "qwen-research" restringe el uso comercial; es responsabilidad del usuario verificar los términos exactos del modelo base antes de desplegarlo en producción.
- No se documentan sesgos conocidos, pero al tratarse de un modelo sin censura es probable que reproduzca sesgos de género, raza o cultura presentes en los datos de entrenamiento originales.
- Riesgo de alucinación visual: como todo modelo generativo, puede producir imágenes incoherentes, con anatomía incorrecta o texto ilegible, especialmente en cuantizaciones agresivas (Q4_0, NVFP4, MLX 4-bit).
- Las cuantizaciones de 4 bits pueden degradar la fidelidad respecto a BF16; el autor recomienda Q4_K_M como equilibrio, pero no aporta métricas de calidad.
- El repositorio tiene 0 descargas y 0 likes en el momento de la ficha, sin validación comunitaria; conviene tratar los ficheros con precaución y verificar hashes.
- El tamaño del repo (105,2 GB) y la multiplicidad de formatos pueden provocar descargas parciales o confusión sobre qué fichero usar; la documentación indica Q4_K_M para GGUF y MLX para Apple Silicon.
- No se especifican los idiomas soportados por el codificador de texto en el contexto de generación de imágenes; los prompts en castellano pueden funcionar peor que en inglés.
- El uso de contenido generado sin filtros puede tener implicaciones legales en jurisdicciones con leyes sobre contenido sensible; el usuario asume la responsabilidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/diablomike20/Qwen-Image-2.1-Uncensored-Quantized
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
- ComfyUI-GGUF (fork de leejet): https://github.com/leejet/ComfyUI-GGUF
- Formulario de solicitud de modelos del autor: https://abenzerps.com/request-a-model/
- Benchmark (imagen en el repo): assets/Qwen-Image-2.1-Benchmark.png
