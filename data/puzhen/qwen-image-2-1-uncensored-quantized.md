# puzhen/Qwen-Image-2.1-Uncensored-Quantized

## Resumen

Qwen-Image-2.1-Uncensored-Quantized es una redistribución cuantizada del modelo de generación de imágenes Qwen/Qwen-Image-2.1, publicada por el usuario puzhen (con enlaces a abenzerps en la model card). No se trata de un modelo nuevo entrenado desde cero, sino de una colección de pesos convertidos a múltiples formatos de cuantización (GGUF, safetensors FP8/INT8/NVFP4 y MLX) para su uso local en ComfyUI, principalmente en GPUs de consumo y en Apple Silicon. El modelo base es un text-to-image de Qwen con aproximadamente 7.115 millones de parámetros según los safetensors del repositorio.

La relevancia de esta ficha radica en que empaqueta, junto al transformador de difusión, los componentes auxiliares necesarios para la inferencia (text encoder Qwen3-VL de 8B y VAE), lo que simplifica el despliegue en ComfyUI. La etiqueta "uncensored" indica que se han retirado o relajado los filtros del modelo original, un aspecto crítico desde el punto de vista de la licencia y del uso responsable.

El repositorio ocupa 105,2 GB en total y fue creado el 16 de noviembre de 2026. La información pública disponible es escasa: no hay datos de benchmarks numéricos en la model card (solo una imagen de referencia), no se especifican idiomas soportados ni detalles de entrenamiento, por lo que muchos campos de esta ficha se marcan como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de difusion text-to-image; transformador de difusion con text encoder Qwen3-VL 8B y VAE) |
| Parametros totales | 7.115.124.736 (segun safetensors del repo) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, FP8, INT8 ConvRot, NVFP4, MLX 4-bit, MLX 6-bit, MLX 8-bit, GGUF Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_0 |
| Idiomas soportados | no disponible |
| Licencia | qwen-research (etiquetada como "other" en los metadatos) |
| Formato de pesos | GGUF, safetensors (FP8, INT8, NVFP4, MLX), BF16 |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base Qwen-Image-2.1 en la documentación proporcionada. Por los componentes empaquetados se deduce un pipeline de difusión text-to-image compuesto por un transformador de difusión (los pesos cuantizados de 4 a 14 GB), un text encoder Qwen3-VL de 8B parámetros (17,53 GB en BF16, 9,35 GB en INT8) y un VAE de 676 MB en BF16. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO.

La contribución de esta publicación no es el entrenamiento, sino la conversión de pesos: se ofrecen cuantizaciones GGUF (Q8_0 a Q4_0), safetensors en FP8 e INT8 ConvRot, NVFP4 para GPUs compatibles y formatos MLX optimizados para Apple Silicon. La variante "uncensored" implica una modificación de los pesos o del pipeline respecto al modelo original para eliminar restricciones de contenido, sin que se documente el procedimiento exacto.

## Capacidades

- Generación de imágenes a partir de prompts de texto (pipeline text-to-image).
- Cuantizaciones optimizadas para inferencia local: GGUF para ComfyUI-GGUF, MLX para Apple Silicon, NVFP4 e INT8 para GPUs compatibles.
- Integración con ComfyUI mediante el fork leejet/ComfyUI-GGUF, que añade soporte nativo para Qwen-Image 2.1.
- Uso del text encoder Qwen3-VL 8B, que aporta codificación de prompts de texto (y potencialmente entrada visual, aunque no se documenta su uso en este pipeline).
- Variante "uncensored" orientada a prompts sin filtrado de contenido.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni generación de código: es un modelo de imagen, no de lenguaje.

## Casos de uso

- Generación de ilustraciones para prototipado de producto: el modelo permite iterar prompts en ComfyUI con la cuantización Q4_K_M (4,60 GB), lo que facilita probar estilos en una RTX 3060 o superior sin agotar VRAM.
- Creación de assets para videojuegos indie: con la versión NVFP4 (4,20 GB) se pueden generar texturas y concept art en GPUs Blackwell con throughput alto, integrándolo en un pipeline de ComfyUI automatizado.
- Flujos de trabajo en Apple Silicon: las variantes MLX 4-bit (4,00 GB) y 6-bit (5,78 GB) permiten generar imágenes en un Mac con memoria unificada, sin GPU dedicada.
- Investigación sobre cuantización de modelos de difusión: el repositorio ofrece el mismo modelo en ocho formatos distintos, lo que permite comparar calidad frente a tamaño y precisión en un mismo pipeline.
- Generación de contenido sin restricciones para investigación artística: la variante "uncensored" está pensada para explorar prompts que el modelo original rechazaría, siempre dentro de los límites legales y de la licencia.
- Despliegue en entornos con VRAM limitada: la cuantización Q4_0 (4,15 GB) y Q4_K_M permiten ejecutar el transformador de difusión en GPUs de 8 GB, reservando memoria para el text encoder INT8 (9,35 GB) o cargándolo por etapas.

## Benchmarks y rendimiento

La model card incluye una imagen de referencia (`assets/Qwen-Image-2.1-Benchmark.png`) pero no se presentan tablas con valores numéricos de MMLU, HumanEval, GSM8K ni métricas de generación de imagen (FID, CLIP score, etc.) en la información disponible.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para el transformador de difusión: desde ~4,0 GB (MLX 4-bit o Q4_0) hasta ~14,2 GB (BF16).
- Text encoder adicional: 9,35 GB en INT8 ConvRot o 17,53 GB en BF16; el VAE requiere 676 MB.
- GPU recomendadas: RTX 4090 o A100/H100 para BF16 y FP8; RTX 3060/4060 (8-12 GB) para Q4_K_M con text encoder INT8; GPUs Blackwell para NVFP4.
- Cabe en GPU de consumo: sí, con Q4_K_M o Q4_0 (4,15-4,60 GB) más el text encoder INT8, en tarjetas de 12 GB o superiores; en 8 GB requiere gestión cuidadosa de memoria.
- Apple Silicon: variantes MLX 4/6/8-bit para memoria unificada de 16 GB en adelante.
- Opciones de despliegue: ComfyUI con ComfyUI-GGUF (fork leejet); no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizaciones | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen-Image-2.1-Uncensored-Quantized (esta ficha) | 7.115 M | no disponible | GGUF, FP8, INT8, NVFP4, MLX | qwen-research | Hugging Face (repo de 105,2 GB) |
| Qwen/Qwen-Image-2.1 (base) | 7.115 M | no disponible | pesos originales | qwen-research | Hugging Face |
| Alternativas de difusion open source (p. ej. FLUX.1, SDXL) | no disponible en esta busqueda | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre esta versión y el modelo base ni con otros modelos de difusión en la información proporcionada.

## Limitaciones y advertencias

- La licencia qwen-research restringe el uso comercial; es necesario revisar los términos exactos del modelo base antes de cualquier despliegue en producción.
- La variante "uncensored" elimina filtros de contenido: puede generar material sensible, ofensivo o ilegal según el prompt, con el consiguiente riesgo legal y reputacional.
- No se documentan sesgos específicos, pero al ser una modificación no oficial del modelo base, la responsabilidad sobre el contenido generado recae en el usuario.
- Riesgo de alucinación visual: como todo modelo generativo de imagen, puede producir detalles incoherentes, texto mal renderizado o anatomías incorrectas.
- No se especifican idiomas soportados ni calidad multilingüe de los prompts.
- El repositorio ocupa 105,2 GB; la descarga completa no es necesaria, pero exige seleccionar archivos concretos.
- La model card enlaza a un repositorio distinto (abenzerps) para los archivos, lo que puede generar confusión sobre la procedencia y la integridad de los pesos.
- No hay garantías de mantenimiento: 0 descargas y 0 likes en el momento de la consulta, con fecha de creación y actualización el mismo día.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/puzhen/Qwen-Image-2.1-Uncensored-Quantized
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- Repositorio alternativo citado en la model card: https://huggingface.co/abenzerps/Qwen-Image-2.1-Uncensored-Quantized
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
- ComfyUI-GGUF (fork leejet): https://github.com/leejet/ComfyUI-GGUF
- Formulario de peticiones de modelos citado: https://abenzerps.com/request-a-model/
