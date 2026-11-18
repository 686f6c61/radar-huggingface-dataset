# KasugaiSakura/Qwen-Image-2.1-Uncensored-Abenzerps-GGUF

## Resumen

Qwen-Image-2.1-Uncensored-Abenzerps-GGUF es una cuantización comunitaria del modelo de difusión texto-a-imagen Qwen/Qwen-Image-2.1, publicada por el usuario KasugaiSakura (con archivos alojados también bajo el espacio abenzerps). El modelo base lo desarrolla el equipo Qwen de Alibaba, y esta ficha cubre específicamente el paquete de pesos cuantizados en formato GGUF y safetensors preparado para su uso local en ComfyUI mediante el nodo ComfyUI-GGUF.

El interés de esta publicación radica en que empaqueta en un único repositorio todos los componentes necesarios para inferencia local: el transformer de difusión cuantizado en múltiples precisiones (BF16, FP8, INT8, NVFP4, MLX de 4/6/8 bits y GGUF Q4_0 a Q8_0), el text encoder Qwen3-VL de 8B en BF16 e INT8, y el VAE del modelo en BF16. Con 7.115.124.736 parámetros en el transformer y un repositorio de 136,6 GB, permite ejecutar generación de imágenes en GPUs de consumo eligiendo la cuantización adecuada.

La variante "Uncensored" indica que se han retirado o relajado los filtros de contenido del modelo original, lo que cambia el perfil de uso y de responsabilidad respecto al modelo upstream. La licencia declarada es qwen-research, lo que restringe el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión texto-a-imagen (transformer) con text encoder Qwen3-VL 8B y VAE propio; arquitectura concreta del backbone no disponible |
| Parametros totales | 7.115.124.736 (transformer de difusión) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16, FP8, INT8 ConvRot, NVFP4, MLX 4-bit, MLX 6-bit, MLX 8-bit, GGUF Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_0 |
| Idiomas soportados | No disponible (el pipeline es texto-a-imagen; el text encoder Qwen3-VL es multilingüe, pero no se documenta lista de idiomas) |
| Licencia | qwen-research (etiquetada como "other" en Hugging Face) |
| Formato de pesos | GGUF y safetensors (más MLX safetensors) |

## Arquitectura y entrenamiento

El modelo base Qwen-Image-2.1 es un generador texto-a-imagen de la familia Qwen, compuesto por un transformer de difusión de 7.115 millones de parámetros, un text encoder basado en Qwen3-VL de 8B y un VAE dedicado (qwen_image_2.1_vae_bf16). La model card de esta cuantización no detalla la arquitectura interna del backbone (tipo de atención, número de bloques, resolución nativa) ni los datos de entrenamiento del modelo original: número de tokens, composición del dataset, uso de RLHF/DPO o técnicas de alineación. Toda esa información corresponde al modelo upstream Qwen/Qwen-Image-2.1 y no se reproduce en esta publicación.

La contribución de esta ficha es exclusivamente de cuantización y empaquetado: se ofrecen pesos del transformer en precisiones que van de BF16 (14,23 GB) a Q4_0 (4,15 GB), además de variantes FP8, INT8 ConvRot, NVFP4 y MLX para Apple Silicon. El text encoder se distribuye en BF16 (17,53 GB) e INT8 ConvRot (9,35 GB), y el VAE en BF16 (676 MB). La variante "Uncensored" implica una modificación de los pesos o del comportamiento del modelo original para reducir el filtrado de contenido, sin que la model card documente la metodología empleada para ello.

## Capacidades

- Generación de imágenes a partir de prompts de texto (pipeline text-to-image).
- Ejecución local en ComfyUI mediante el nodo Unet Loader (GGUF) y el ecosistema ComfyUI-GGUF.
- Carga del text encoder Qwen3-VL 8B con el nodo CLIPLoader configurado con type `qwen_image`.
- Variantes de cuantización para distintos presupuestos de VRAM, desde NVFP4/MLX 4-bit (4 GB) hasta BF16 (14,23 GB).
- Compatibilidad con Apple Silicon mediante los pesos MLX de 4, 6 y 8 bits.
- Generación sin los filtros de contenido del modelo original (variante "Uncensored").
- No se documentan en la información disponible capacidades de edición de imagen, inpainting, tool calling, agentes ni modos de razonamiento.

## Casos de uso

- Generación de ilustración y arte conceptual en local: con la cuantización Q4_K_M (4,60 GB) el modelo cabe en GPUs de consumo y permite iterar prompts en ComfyUI sin depender de servicios en la nube.
- Prototipado de pipelines de imagen en estaciones de trabajo sin GPU de datacenter: la variante MLX 4-bit (4,00 GB) permite trabajar en Macs con memoria unificada.
- Investigación sobre filtrado y alineación de modelos generativos: la variante "Uncensored" sirve para estudiar el comportamiento del modelo sin capas de rechazo, comparándolo con el upstream.
- Producción de assets para entornos controlados donde el contenido sensible es legítimo (por ejemplo, narrativa de ficción o diseño de personajes), asumiendo la responsabilidad legal del contenido generado.
- Despliegue por lotes en ComfyUI: el formato GGUF y el nodo Unet Loader facilitan automatizar la generación de imágenes con scripts de ComfyUI en un servidor con una sola GPU.
- Evaluación comparativa de cuantizaciones: el repositorio incluye la misma variante en Q4_0, Q4_K_M, Q5_K_M, Q6_K y Q8_0, lo que permite medir la degradación de calidad frente al tamaño de archivo.

## Benchmarks y rendimiento

La model card incluye una imagen de referencia (`assets/Qwen-Image-2.1-Benchmark.png`) con los benchmarks del modelo base, pero no se proporcionan los valores numéricos en texto dentro de la información disponible.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para el transformer: 4,00-4,20 GB en MLX 4-bit o NVFP4; 4,15-4,60 GB en Q4_0/Q4_K_M; 5,22 GB en Q5_K_M; 5,88 GB en Q6_K; 7,59 GB en Q8_0; 14,23 GB en BF16.
- VRAM adicional para el text encoder: 9,35 GB en INT8 ConvRot o 17,53 GB en BF16, más 676 MB del VAE en BF16.
- Presupuesto total orientativo: en torno a 15 GB con transformer Q4_K_M, text encoder INT8 y VAE; en torno a 32 GB con transformer BF16 y text encoder BF16.
- GPU recomendadas: RTX 4090 (24 GB) para la configuración Q4_K_M + text encoder INT8 con margen; A100/H100 para BF16; GPUs de 8-12 GB pueden funcionar con Q4_0/NVFP4 y text encoder INT8, aunque no se documenta el mínimo exacto.
- Apple Silicon: los pesos MLX de 4, 6 y 8 bits están pensados para memoria unificada de 16 GB o más.
- Opciones de despliegue: ComfyUI con ComfyUI-GGUF (fork leejet/ComfyUI-GGUF, con soporte nativo de Qwen-Image 2.1); el fork antiguo city96/ComfyUI-GGUF puede fallar con "Unknown model architecture!".
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen-Image-2.1-Uncensored-Abenzerps-GGUF | 7.115 M (transformer) | No disponible | qwen-research | GGUF, safetensors, MLX en HF | Cuantización comunitaria sin filtros |
| Qwen/Qwen-Image-2.1 (upstream) | 7.115 M (transformer) | No disponible | qwen-research | Pesos originales en HF | Modelo base con filtros de contenido |
| Alternativas de la misma categoría | No disponible | No disponible | No disponible | No disponible | No se dispone de datos verificados en la información proporcionada |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada para establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- La licencia qwen-research restringe el uso comercial; es imprescindible revisar los términos antes de cualquier despliegue en producción.
- La variante "Uncensored" elimina o relaja los filtros de contenido: el operador asume la responsabilidad legal y ética del contenido generado, incluido el riesgo de generar material dañino o ilegal.
- No se documenta la metodología de eliminación de filtros ni el impacto sobre la calidad de generación o la fidelidad al prompt.
- La model card no detalla sesgos conocidos, datos de entrenamiento ni evaluación de seguridad del modelo original.
- Riesgo de alucinación visual y de artefactos propios de los modelos de difusión, agravado potencialmente por las cuantizaciones más agresivas (Q4_0, NVFP4, MLX 4-bit).
- El repositorio suma 136,6 GB; descargar todas las variantes no es necesario y conviene seleccionar una sola cuantización.
- Requiere el fork leejet/ComfyUI-GGUF para evitar errores de arquitectura desconocida con versiones antiguas del nodo.
- No se documentan idiomas soportados ni longitud de contexto del text encoder en esta publicación.
- La fecha de creación del repositorio (2026-09-20) y su volumen de descargas (84.459) deben tratarse con cautela; verifique la integridad de los pesos antes de usarlos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/KasugaiSakura/Qwen-Image-2.1-Uncensored-Abenzerps-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- Espacio de archivos alternativo: https://huggingface.co/abenzerps/Qwen-Image-2.1-Uncensored-GGUF
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
- ComfyUI-GGUF (fork recomendado): https://github.com/leejet/ComfyUI-GGUF
- ComfyUI-GGUF (fork original): https://github.com/city96/ComfyUI-GGUF
