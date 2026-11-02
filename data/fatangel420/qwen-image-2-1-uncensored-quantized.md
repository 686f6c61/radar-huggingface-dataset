# fatangel420/Qwen-Image-2.1-Uncensored-Quantized

## Resumen

Qwen-Image-2.1-Uncensored-Quantized es una redistribución cuantizada del modelo de generación de imágenes Qwen/Qwen-Image-2.1, publicada por el usuario fatangel420 (con enlaces internos que apuntan al espacio abenzerps). Se trata de un modelo de difusión texto-a-imagen de aproximadamente 7.115 millones de parámetros en el transformer de difusión, empaquetado en múltiples formatos: GGUF (Q4_0, Q4_K_M, Q5_K_M, Q6_K, Q8_0, BF16), safetensors (FP8, INT8 ConvRot, NVFP4) y MLX para Apple Silicon (4, 6 y 8 bits). El repositorio incluye además los ficheros complementarios necesarios para su uso en ComfyUI: un text encoder Qwen3-VL de 8B (BF16 o INT8) y el VAE específico del modelo.

El modelo base Qwen-Image-2.1 es un generador de imágenes de la familia Qwen (Alibaba), y esta versión se distribuye con la etiqueta "uncensored", lo que implica que se han eliminado o relajado los filtros de contenido del modelo original. La relevancia práctica de esta ficha radica en que ofrece una vía de despliegue local del modelo en hardware de consumo mediante cuantización agresiva (el fichero NVFP4 ocupa solo 4,20 GB y el MLX 4-bit 4,00 GB), algo imposible con los pesos en BF16.

La licencia declarada es `qwen-research` (etiquetada como "other" en HuggingFace), lo que restringe el uso comercial. El repositorio tiene 105,2 GB de tamaño total y, en el momento de la consulta, registra 0 descargas y 0 likes, lo que indica una publicación muy reciente (creada el 2 de noviembre de 2026) y sin validación comunitaria todavía.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión texto-a-imagen (transformer de difusión) con text encoder Qwen3-VL-8B y VAE propio |
| Parametros totales | 7.115.124.736 (transformer de difusión, dato de safetensors); el text encoder Qwen3-VL-8B se distribuye aparte |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF: BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_0; safetensors: FP8, INT8 ConvRot, NVFP4; MLX: 4-bit, 6-bit, 8-bit |
| Idiomas soportados | No disponibles (el pipeline es texto-a-imagen; el text encoder Qwen3-VL es multilingüe, pero no se detalla) |
| Licencia | qwen-research (etiquetada como "other") |
| Formato de pesos | GGUF, safetensors (FP8, INT8, NVFP4, MLX) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del transformer de difusión más allá de su naturaleza texto-a-imagen. El pipeline completo consta de tres componentes: el transformer de difusión (7.115 millones de parámetros), un text encoder Qwen3-VL de 8B (que procesa el prompt y, presumiblemente, admite entrada visual) y un VAE específico (`qwen_image_2.1_vae_bf16.safetensors`, 676 MB en BF16). No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF, DPO o ajuste por preferencias.

La innovación técnica destacable de esta publicación no está en el entrenamiento sino en la distribución: ofrece cuantizaciones para prácticamente todos los backends relevantes (GGUF para llama.cpp/ComfyUI-GGUF, FP8 e INT8 ConvRot para GPUs con soporte de precisión reducida, NVFP4 para GPUs Blackwell, y MLX para Apple Silicon). El autor recomienda Q4_K_M para GGUF por equilibrio tamaño/calidad, INT8 ConvRot y NVFP4 para GPUs compatibles, y MLX para chips Apple. No se documentan técnicas como decodificación especulativa ni atención lineal.

## Capacidades

- Generación de imágenes a partir de prompts de texto (pipeline `text-to-image`).
- Acepta un text encoder Qwen3-VL de 8B, lo que sugiere capacidad de procesar prompts complejos y posiblemente entrada multimodal en el encoder (no confirmado en la información disponible).
- Integración nativa con ComfyUI mediante el nodo ComfyUI-GGUF (fork de leejet con soporte para Qwen-Image 2.1).
- Variante "uncensored": el autor declara la eliminación de filtros de contenido, lo que amplía el rango de prompts aceptados (con las implicaciones éticas y legales correspondientes).
- Soporte de múltiples precisiones y backends: GGUF, safetensors (FP8/INT8/NVFP4) y MLX.
- No se documentan en la información disponible capacidades de tool calling, agentes, razonamiento multi-paso ni generación de vídeo o audio.

## Casos de uso

- Generación de ilustraciones y concept art en local: con el fichero Q4_K_M (4,60 GB) o NVFP4 (4,20 GB), el modelo cabe en GPUs de consumo de 8-12 GB de VRAM, permitiendo iterar prompts sin depender de servicios en la nube.
- Prototipado rápido de pipelines de imagen en ComfyUI: el repositorio incluye todos los ficheros complementarios (text encoder y VAE) en las rutas esperadas por ComfyUI, lo que reduce el tiempo de configuración a copiar tres ficheros en `models/diffusion_models`, `models/text_encoders` y `models/vae`.
- Despliegue en Apple Silicon: las cuantizaciones MLX 4-bit (4,00 GB) y 6-bit (5,78 GB) están pensadas para Macs con memoria unificada, permitiendo generar imágenes en portátiles sin GPU dedicada.
- Investigación sobre cuantización de modelos de difusión: la disponibilidad de hasta seis formatos distintos del mismo modelo permite comparar la degradación de calidad entre Q4_0, Q4_K_M, Q5_K_M, Q6_K, Q8_0 y BF16 en un mismo pipeline.
- Generación de contenido sin restricciones de filtro para proyectos creativos o de investigación que requieran prompts que los modelos alineados rechazan (con la advertencia legal de la licencia `qwen-research`).
- Evaluación comparativa de backends en producción: FP8 e INT8 ConvRot para GPUs con soporte de precisión reducida, NVFP4 para GPUs Blackwell, y GGUF para CPU o GPUs con poca VRAM, permitiendo elegir el formato según el hardware objetivo.

## Benchmarks y rendimiento

La model card incluye una imagen de referencia (`assets/Qwen-Image-2.1-Benchmark.png`) que no se ha podido transcribir en la información proporcionada. No se han publicado resultados numéricos de benchmarks (FID, CLIP score, etc.) en el texto disponible.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para el transformer de difusión: BF16 ~14,23 GB; Q8_0 ~7,59 GB; Q6_K ~5,88 GB; Q5_K_M ~5,22 GB; Q4_K_M ~4,60 GB; Q4_0 ~4,15 GB; FP8 ~6,63 GB; INT8 ConvRot ~6,76 GB; NVFP4 ~4,20 GB; MLX 4-bit ~4,00 GB; MLX 6-bit ~5,78 GB; MLX 8-bit ~7,56 GB.
- Hay que sumar el text encoder: Qwen3-VL-8B en BF16 ocupa 17,53 GB, o 9,35 GB en INT8 ConvRot (recomendado para menor memoria). El VAE añade 676 MB en BF16.
- Presupuesto total realista: con Q4_K_M + text encoder INT8 + VAE se superan los 14 GB de VRAM; con NVFP4 + text encoder INT8 se ronda los 14,2 GB. Para caber en 8 GB de VRAM habría que usar Q4_0 o MLX 4-bit y descargar el text encoder de memoria o cuantizarlo aún más (no se ofrece en el repo).
- GPU recomendadas: GPUs con soporte NVFP4 (serie Blackwell, RTX 50xx) para el fichero NVFP4; GPUs con FP8/INT8 (Ada Lovelace, Hopper: RTX 4090, L40S, H100) para los ficheros FP8 e INT8 ConvRot; cualquier GPU con 8-12 GB para GGUF Q4.
- Cabe en GPU de consumo: sí, con GGUF Q4_0/Q4_K_M en GPUs de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070), asumiendo que el text encoder se gestiona con cuidado.
- Opciones de despliegue: ComfyUI con ComfyUI-GGUF (fork de leejet, obligatorio para Qwen-Image 2.1); MLX para Apple Silicon; no se documentan vLLM, llama.cpp standalone, Ollama ni TGI para este pipeline.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formatos | Notas |
|---|---|---|---|---|---|
| Qwen-Image-2.1-Uncensored-Quantized (este) | 7.115 M (transformer) | No disponible | qwen-research | GGUF, safetensors, MLX | Variante sin filtros, cuantizaciones múltiples, requiere ComfyUI-GGUF |
| Qwen/Qwen-Image-2.1 (base) | 7.115 M (transformer) | No disponible | qwen-research | safetensors | Modelo original con filtros de contenido |
| Alternativas de texto-a-imagen open source | No disponible | No disponible | No disponible | No disponible | No se dispone de datos verificados en la información proporcionada para establecer una comparación numérica |

No se dispone de datos de benchmarks ni de especificaciones verificadas de modelos comparables en la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- La licencia `qwen-research` restringe el uso comercial; es imprescindible revisar los términos exactos antes de cualquier despliegue en producción.
- La variante "uncensored" elimina los filtros de contenido del modelo original: puede generar material sensible, ofensivo o ilegal según la jurisdicción. El usuario asume la responsabilidad legal y ética del contenido generado.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria; la calidad de las cuantizaciones no está verificada de forma independiente.
- La model card mezcla enlaces al espacio `abenzerps` con el ID `fatangel420`, lo que sugiere una posible re-publicación o mirror; conviene verificar la procedencia de los pesos.
- Requiere el fork `leejet/ComfyUI-GGUF`; el fork `city96/ComfyUI-GGUF` produce el error `Unknown model architecture!` con este modelo.
- El text encoder Qwen3-VL-8B en BF16 (17,53 GB) domina el presupuesto de memoria; en GPUs de consumo es necesario usar la versión INT8 (9,35 GB) o gestionar la descarga del encoder.
- No se documentan sesgos específicos, tasas de alucinación visual, ni límites de resolución o de longitud de prompt.
- No se especifican los idiomas soportados por el pipeline completo; el comportamiento multilingüe dependerá del text encoder Qwen3-VL.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/fatangel420/Qwen-Image-2.1-Uncensored-Quantized
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
- ComfyUI-GGUF (fork recomendado): https://github.com/leejet/ComfyUI-GGUF
- Formulario de peticiones de modelos (referenciado en la model card): https://abenzerps.com/request-a-model/
- Espacio alternativo referenciado en la model card: https://huggingface.co/abenzerps/Qwen-Image-2.1-Uncensored-Quantized
