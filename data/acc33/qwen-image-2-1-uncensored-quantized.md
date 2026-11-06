# Acc33/Qwen-Image-2.1-Uncensored-Quantized

## Resumen

Qwen-Image-2.1-Uncensored-Quantized es una redistribución cuantizada del modelo de difusión texto-a-imagen Qwen/Qwen-Image-2.1, publicada por el usuario Acc33 (con referencias en la model card al espacio abenzerps). El paquete incluye los pesos originales del modelo base en múltiples formatos (GGUF, safetensors FP8/INT8/NVFP4 y MLX en 4, 6 y 8 bits), además de una variante etiquetada como "UC" (uncensored) y los ficheros acompañantes necesarios para su uso en ComfyUI: el text encoder Qwen3-VL de 8B y el VAE específico del modelo.

El interés práctico del repositorio reside en la disponibilidad de cuantizaciones listas para ejecución local: desde BF16 a 14,23 GB hasta MLX 4-bit a 4,00 GB, pasando por GGUF Q4_K_M a 4,60 GB o NVFP4 a 4,20 GB. Esto permite desplegar un modelo de generación de imágenes de aproximadamente 7.100 millones de parámetros en GPUs de consumo y en Apple Silicon, algo inviable con los pesos completos.

No obstante, conviene subrayar que el repositorio no documenta el proceso de cuantización, no publica métricas de degradación por formato y no especifica los datos de entrenamiento ni el procedimiento de "descensura". La model card se limita a listar ficheros y a describir la instalación en ComfyUI, por lo que buena parte de las especificaciones técnicas del modelo subyacente quedan fuera de la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de difusion texto-a-imagen; el repositorio no detalla el backbone) |
| Parametros totales | 7.115.124.736 (pesos safetensors del modelo base) |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, FP8, INT8 ConvRot, NVFP4, MLX 4-bit, MLX 6-bit, MLX 8-bit, GGUF Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_0 |
| Idiomas soportados | no disponible (el prompt de texto se procesa mediante el text encoder Qwen3-VL 8B) |
| Licencia | qwen-research (etiquetada como "other" en Hugging Face) |
| Formato de pesos | GGUF, safetensors (FP8, INT8, NVFP4, MLX) |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura interna del modelo de difusión. Por los ficheros acompañantes se deduce que el pipeline emplea un text encoder Qwen3-VL de 8B parámetros (en BF16, 17,53 GB, o en INT8 ConvRot, 9,35 GB) y un VAE propio del modelo (676 MB en BF16). El transformer de difusión es el componente cuantizado en las distintas variantes. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de ajuste fino con RLHF, DPO o preferencias humanas.

Tampoco se describe el procedimiento de cuantización: no se indica la herramienta empleada (llama.cpp, comfy-quant, mlx, etc.), ni la calibración, ni las métricas de degradación por formato. La variante "UC" (uncensored) aparece en la model card sin explicación del método de eliminación de restricciones ni de los datos usados para ello. La model card menciona un benchmark mediante una imagen (`assets/Qwen-Image-2.1-Benchmark.png`) que no se traduce en cifras textuales dentro de la información disponible.

## Capacidades

- Generación de imágenes a partir de descripciones textuales (pipeline text-to-image).
- Procesamiento de prompts mediante un text encoder multimodal Qwen3-VL de 8B, lo que sugiere capacidad de manejar instrucciones de texto complejas y potencialmente entradas con componente visual.
- Variante "uncensored" orientada a reducir el filtrado de contenido en la generación de imágenes.
- Ejecución local en ComfyUI mediante el nodo ComfyUI-GGUF (fork de leejet) con soporte nativo declarado para Qwen-Image 2.1.
- Compatibilidad con GPUs NVIDIA (FP8, INT8, NVFP4) y con Apple Silicon (formatos MLX).
- Soporte de tool calling, agentes, razonamiento multi-paso, matemáticas o audio: no disponible (el modelo es de generación de imágenes, no un LLM conversacional).

## Casos de uso

- Generación de ilustraciones para prototipado de producto: el modelo permite iterar sobre conceptos visuales en local con la cuantización Q4_K_M (4,60 GB), suficiente para caber en GPUs de consumo y mantener ciclos rápidos de prueba y error.
- Creación de assets para videojuegos y contenido editorial: la variante "uncensored" amplía el rango de estilos y temáticas aceptadas, útil en estudios que necesitan control creativo sin filtros intermedios.
- Despliegue en estaciones de trabajo Apple Silicon: los formatos MLX 4-bit (4,00 GB) y 6-bit (5,78 GB) permiten ejecutar el pipeline en Macs con memoria unificada, sin GPU dedicada.
- Integración en flujos ComfyUI existentes: al incluir text encoder y VAE en el mismo repositorio, se simplifica la instalación y se evita la búsqueda de ficheros acompañantes dispares.
- Investigación sobre cuantización de modelos de difusión: la disponibilidad de ocho formatos distintos del mismo modelo base permite comparar calidad frente a tamaño en un mismo pipeline.
- Generación de imágenes por lotes en servidores con GPUs NVIDIA modernas: NVFP4 (4,20 GB) e INT8 ConvRot (6,76 GB) están pensados para hardware con soporte de esas precisiones, reduciendo el coste por imagen frente a BF16.
- Pruebas de contenido sensible en entornos controlados: la variante sin censura facilita evaluar sesgos y comportamientos del modelo base en condiciones menos restringidas, con las cautelas legales correspondientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una imagen de benchmark (`assets/Qwen-Image-2.1-Benchmark.png`) sin cifras textuales, y no se aportan métricas de FID, CLIP score, throughput ni latencia por cuantización.

## Requisitos de hardware

- VRAM estimada para el transformer de difusión según cuantización: BF16, 14,23 GB; FP8, 6,63 GB; INT8 ConvRot, 6,76 GB; NVFP4, 4,20 GB; GGUF Q8_0, 7,59 GB; Q6_K, 5,88 GB; Q5_K_M, 5,22 GB; Q4_K_M, 4,60 GB; Q4_0, 4,15 GB; MLX 4-bit, 4,00 GB; MLX 6-bit, 5,78 GB; MLX 8-bit, 7,56 GB.
- Hay que sumar el text encoder: 17,53 GB en BF16 o 9,35 GB en INT8 ConvRot, más el VAE de 676 MB. El INT8 ConvRot del text encoder es la opción recomendada por el autor para reducir memoria.
- GPU recomendadas: no disponibles de forma explícita. Por tamaño, una RTX 4090 (24 GB) puede alojar el transformer en Q4_K_M junto al text encoder INT8, aunque el margen es ajustado; A100 y H100 ofrecen holgura para BF16 y FP8. NVFP4 requiere GPUs con soporte de esa precisión (arquitecturas Blackwell en adelante, según la información disponible).
- En GPUs de consumo: Q4_K_M (4,60 GB) y Q4_0 (4,15 GB) son viables en tarjetas de 8 GB o más si se usa el text encoder INT8 y se gestiona la memoria con cuidado; MLX 4-bit permite ejecución en Macs con memoria unificada.
- Opciones de despliegue: ComfyUI con ComfyUI-GGUF (fork de leejet) para GGUF; ComfyUI nativo para safetensors FP8/INT8/NVFP4; MLX para Apple Silicon. No se documentan vLLM, TGI, llama.cpp standalone ni Ollama para este pipeline.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos que permitan una comparación rigurosa. Como referencia estructural, el modelo base Qwen/Qwen-Image-2.1 es el punto de partida directo, y este repositorio se limita a ofrecer cuantizaciones del mismo; cualquier comparación con otros modelos texto-a-imagen (Flux, Stable Diffusion 3.5, etc.) requeriría métricas que no se han publicado aquí.

## Limitaciones y advertencias

- La licencia "qwen-research" (etiquetada como "other" en Hugging Face) impone restricciones que deben revisarse antes de cualquier uso comercial; no se detallan en la información disponible.
- La variante "uncensored" puede generar contenido no apto para todos los públicos y plantea riesgos legales y reputacionales en producción; no se especifica qué filtros se han eliminado ni con qué método.
- No se documenta la degradación de calidad introducida por cada cuantización; Q4_0 y MLX 4-bit son las opciones más agresivas y probablemente las más afectadas, pero no hay métricas que lo confirmen.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día (2026-11-02), sin historial de mantenimiento.
- El tamaño del repo (105,2 GB) incluye todos los formatos; descargar el conjunto completo no es necesario, pero exige seleccionar ficheros con cuidado.
- La model card contiene enlaces a un dominio externo (abenzerps.com) y a un espacio de Hugging Face distinto del autor listado; conviene verificar la procedencia de los pesos antes de usarlos.
- No hay información sobre sesgos, idiomas soportados ni comportamiento del text encoder con prompts en castellano.
- El soporte de ComfyUI-GGUF depende de un fork concreto (leejet); la model card advierte de errores de "Unknown model architecture!" con versiones antiguas (city96).
- No se aportan datos de latencia ni de consumo energético, relevantes para despliegues a escala.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Acc33/Qwen-Image-2.1-Uncensored-Quantized
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
- ComfyUI-GGUF (fork de leejet): https://github.com/leejet/ComfyUI-GGUF
- Formulario de peticiones de modelos citado en la model card: https://abenzerps.com/request-a-model/
- Espacio de referencia en Hugging Face citado en la model card: https://huggingface.co/abenzerps/Qwen-Image-2.1-Uncensored-Quantized
