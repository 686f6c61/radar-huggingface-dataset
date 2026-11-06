# 85aany/Qwen-Image-2.1-Uncensored-Quantized

## Resumen

Qwen-Image-2.1-Uncensored-Quantized es un paquete de cuantizaciones del modelo de generación de imágenes Qwen/Qwen-Image-2.1, publicado por el usuario 85aany (los enlaces internos de la model card apuntan al espacio abenzerps). No se trata de un modelo entrenado desde cero, sino de una redistribución de los pesos upstream de Qwen-Image-2.1 en formatos GGUF, Safetensors (FP8, INT8 ConvRot, NVFP4) y MLX (4, 6 y 8 bits), junto con los ficheros complementarios de text encoder (Qwen3-VL 8B) y VAE necesarios para ejecutarlo en ComfyUI.

El objetivo es permitir la inferencia local de un modelo de texto-a-imagen de aproximadamente 7.115 millones de parámetros en hardware de consumo, ofreciendo variantes desde 4,00 GB (MLX 4-bit) hasta 14,23 GB (BF16). El sufijo "Uncensored" indica que se distribuye sin el filtrado de seguridad habitual del modelo base, lo que tiene implicaciones relevantes para su uso en producción.

La relevancia actual reside en la combinación de un pipeline text-to-image con cuantizaciones optimizadas para distintas plataformas (GGUF para CPU/GPU vía llama.cpp y ComfyUI-GGUF, NVFP4 e INT8 para GPUs modernas, MLX para Apple Silicon) y en la inclusión de todos los ficheros auxiliares en el mismo repositorio, lo que simplifica el despliegue. La licencia es qwen-research, no comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de difusión para texto-a-imagen; detalles no publicados en la información disponible) |
| Parámetros totales | 7.115.124.736 |
| Parámetros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BF16, FP8, INT8 ConvRot, NVFP4, MLX 4-bit, MLX 6-bit, MLX 8-bit, GGUF Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_0 |
| Idiomas soportados | no disponible |
| Licencia | qwen-research (etiquetada como "other" en Hugging Face) |
| Formato de pesos | GGUF, Safetensors, MLX Safetensors |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base Qwen-Image-2.1 en la documentación proporcionada: no se detalla si emplea un transformer de difusión, un esquema híbrido o técnicas concretas de atención. El pipeline declarado es text-to-image y el modelo se acompaña de un text encoder basado en Qwen3-VL 8B (17,53 GB en BF16, 9,35 GB en INT8 ConvRot) y un VAE específico (676 MB en BF16), lo que sugiere una arquitectura de difusión latente con codificador de texto multimodal.

Tampoco se especifican los datos de entrenamiento (número de tokens, composición del dataset), ni si hubo fases de RLHF, DPO o ajuste fino por preferencias. La model card únicamente menciona que las cuantizaciones se han generado "using the original upstream base weights" de Qwen/Qwen-Image-2.1, es decir, sin reentrenamiento. La variante "Uncensored" implica una modificación respecto al modelo original cuyo procedimiento exacto no se documenta en la información disponible.

## Capacidades

- Generación de imágenes a partir de descripciones textuales (text-to-image) mediante el pipeline declarado.
- Codificación de prompts con un text encoder Qwen3-VL 8B, lo que sugiere capacidad de procesar instrucciones textuales complejas y posiblemente entradas multimodales en el codificador.
- Integración nativa con ComfyUI a través de ComfyUI-GGUF (fork de leejet), con nodos para cargar el transformer GGUF, el text encoder y el VAE.
- Ejecución en CPU/GPU mediante GGUF y en GPUs modernas mediante FP8, INT8 ConvRot y NVFP4.
- Ejecución en Apple Silicon mediante los formatos MLX de 4, 6 y 8 bits.
- Distribución sin filtrado de seguridad ("Uncensored"), lo que amplía el rango de prompts aceptados pero elimina las salvaguardas del modelo original.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni generación de audio.

## Casos de uso

- Generación de ilustraciones para prototipado rápido en local: con la cuantización Q4_K_M (4,60 GB) el modelo cabe en GPUs de consumo y permite iterar sobre prompts sin depender de servicios en la nube.
- Creación de assets para videojuegos y diseño conceptual: el pipeline text-to-image con text encoder Qwen3-VL 8B permite describir escenas detalladas y generar variaciones coherentes dentro de un flujo de trabajo en ComfyUI.
- Automatización de contenido visual en pipelines internos: al poder ejecutarse con ComfyUI-GGUF y ficheros locales, se integra en scripts de generación por lotes sin exponer datos a APIs externas.
- Investigación sobre alineación y seguridad en modelos generativos: la variante "Uncensored" permite estudiar el comportamiento del modelo sin filtros y compararlo con el base, útil para auditar sesgos y riesgos.
- Despliegue en estaciones de trabajo Apple Silicon: las variantes MLX 4-bit (4,00 GB) y MLX 6-bit (5,78 GB) permiten generar imágenes en Macs con memoria unificada limitada.
- Experimentación con cuantizaciones en GPUs de datacenter: NVFP4 (4,20 GB) e INT8 ConvRot (6,76 GB) están pensadas para GPUs con soporte de estos formatos, reduciendo el uso de VRAM frente a BF16.
- Generación de imágenes en entornos sin conectividad: al incluir todos los ficheros auxiliares (text encoder y VAE) en el repositorio, es posible montar un entorno completamente offline con ComfyUI.

## Benchmarks y rendimiento

La model card incluye una referencia a una imagen de benchmark (`assets/Qwen-Image-2.1-Benchmark.png`), pero no se proporcionan los valores numéricos en la información disponible. No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para el transformer según cuantización: MLX 4-bit 4,00 GB; Q4_0 4,05-4,15 GB; NVFP4 4,20 GB; Q4_K_M 4,60 GB; Q5_K_M 5,22 GB; MLX 6-bit 5,78 GB; Q6_K 5,88 GB; FP8 6,63 GB; INT8 ConvRot 6,76 GB; MLX 8-bit 7,56 GB; Q8_0 7,59 GB; BF16 14,23 GB.
- A esa cifra hay que sumar el text encoder (Qwen3-VL 8B): 9,35 GB en INT8 ConvRot o 17,53 GB en BF16, y el VAE (676 MB en BF16).
- Configuración mínima realista: Q4_K_M + text encoder INT8 + VAE ≈ 14,6 GB, lo que exige GPUs con al menos 16 GB de VRAM (RTX 4080, RTX 4090, A100 40 GB, H100).
- Configuración de alta calidad: BF16 + text encoder BF16 + VAE ≈ 32,4 GB, recomendada para A100 40 GB, H100 80 GB o configuraciones multi-GPU.
- En GPUs de consumo de 8-12 GB no cabe el conjunto completo; sería necesario recurrir a offloading o a text encoders más agresivamente cuantizados (no incluidos en el repositorio).
- Despliegue: ComfyUI con ComfyUI-GGUF (fork de leejet) para GGUF; ComfyUI nativo para Safetensors FP8/INT8/NVFP4; MLX para Apple Silicon. No se documenta soporte para vLLM, TGI, Ollama o llama.cpp directo, ya que es un modelo de difusión y no un LLM.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Formatos | Licencia | Contexto | Notas |
|---|---|---|---|---|---|
| Qwen-Image-2.1-Uncensored-Quantized (este) | 7.115 M | GGUF, Safetensors, MLX | qwen-research (no comercial) | no disponible | Cuantizaciones de Qwen-Image-2.1 sin filtro de seguridad |
| Qwen/Qwen-Image-2.1 (base) | 7.115 M | Safetensors (BF16) | qwen-research | no disponible | Modelo original con filtrado de seguridad |
| Alternativas de texto-a-imagen open source | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |

No se dispone de información suficiente para establecer una comparativa cuantitativa con otros modelos de texto-a-imagen (Stable Diffusion, FLUX, etc.) en términos de parámetros, contexto, benchmarks o licencia.

## Limitaciones y advertencias

- La licencia qwen-research restringe el uso comercial; es imprescindible revisar los términos completos antes de cualquier despliegue en producción.
- La variante "Uncensored" elimina los filtros de seguridad del modelo original, lo que aumenta el riesgo de generar contenido inapropiado, dañino o ilegal; no es apta para aplicaciones de cara al público sin moderación adicional.
- El procedimiento exacto de "descensura" no se documenta, por lo que se desconoce si se ha realizado mediante fine-tuning, modificación de pesos o simple eliminación de guardarraíles en inferencia.
- Riesgo de alucinación visual: como todo modelo generativo, puede producir imágenes incoherentes, con anatomía incorrecta o texto mal renderizado; no se han publicado métricas al respecto.
- No se documentan sesgos conocidos ni la composición del dataset de entrenamiento, lo que dificulta evaluar sesgos demográficos o culturales.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día (2026-11-02); no hay evidencia de validación por parte de la comunidad.
- El tamaño del repositorio (105,2 GB) incluye todas las variantes; descargar solo los ficheros necesarios para evitar consumo innecesario de disco.
- Los formatos NVFP4 e INT8 ConvRot requieren GPUs con soporte específico; en hardware no compatible no funcionarán o lo harán con degradación.
- No se especifican los idiomas soportados por el text encoder ni por el pipeline; el rendimiento multilingüe es desconocido.
- La model card enlaza a un fork de ComfyUI-GGUF (leejet) distinto del habitualmente usado (city96); mezclar ambos puede provocar errores de "Unknown model architecture".

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/85aany/Qwen-Image-2.1-Uncensored-Quantized
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
- ComfyUI-GGUF (fork de leejet): https://github.com/leejet/ComfyUI-GGUF
- Formulario de peticiones de modelos del autor: https://abenzerps.com/request-a-model/
- Benchmark referenciado en la model card: assets/Qwen-Image-2.1-Benchmark.png (ruta relativa dentro del repositorio, no se proporciona URL absoluta)
