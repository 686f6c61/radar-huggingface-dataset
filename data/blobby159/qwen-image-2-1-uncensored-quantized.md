# blobby159/Qwen-Image-2.1-Uncensored-Quantized

## Resumen

Qwen-Image-2.1-Uncensored-Quantized es un paquete de pesos cuantizados del modelo de generación de imágenes texto-a-imagen Qwen/Qwen-Image-2.1, publicado por el usuario blobby159 (con enlaces internos al espacio de abenzerps). El modelo base pertenece a la familia Qwen de Alibaba, y esta versión se distribuye en múltiples formatos (GGUF, safetensors FP8/INT8/NVFP4 y MLX de 4, 6 y 8 bits) pensados para inferencia local en ComfyUI, incluyendo soporte para Apple Silicon mediante MLX.

El objetivo de esta ficha es permitir evaluar el modelo rápidamente: se trata de un transformer de difusión de aproximadamente 7.115 millones de parámetros (7,1 B) en el componente de difusión, acompañado de un text encoder Qwen3-VL de 8 B y un VAE de 676 MB en BF16. La etiqueta "Uncensored" indica que se ha reducido o eliminado el filtrado de contenido del modelo original, lo que cambia sustancialmente las consideraciones de uso responsable y comercial.

La relevancia actual radica en que permite ejecutar un modelo de generación de imágenes de calidad cercana a la frontera en hardware de consumo (a partir de 4,15 GB en Q4_0), con licencia qwen-research, que restringe el uso comercial. El repositorio ocupa 105,2 GB en total por acumular todas las variantes de cuantización.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (text-to-image), modelo base Qwen-Image-2.1; text encoder Qwen3-VL 8B; VAE propio |
| Parámetros totales | 7.115.124.736 (componente de difusión) |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BF16, FP8, INT8 ConvRot, NVFP4, MLX 4-bit, MLX 6-bit, MLX 8-bit, GGUF Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_0 |
| Idiomas soportados | no disponible |
| Licencia | qwen-research (etiqueta "other" en la model card) |
| Formato de pesos | GGUF, safetensors (FP8, INT8, NVFP4, MLX), BF16 |

## Arquitectura y entrenamiento

El modelo base Qwen-Image-2.1 es un modelo de difusión para generación de imágenes a partir de texto. La distribución cuantizada mantiene el pipeline completo: un transformer de difusión de ~7,1 B de parámetros, un text encoder Qwen3-VL de 8 B (disponible en BF16 de 17,53 GB o INT8 ConvRot de 9,35 GB) y un VAE de 676 MB en BF16. La combinación de un text encoder multimodal Qwen3-VL sugiere capacidad para procesar instrucciones textuales complejas, aunque la información proporcionada no detalla la composición del dataset de entrenamiento ni el número de tokens o imágenes utilizadas.

No se dispone de información sobre el proceso de alineación (RLHF, DPO), la estrategia de entrenamiento del modelo base ni innovaciones técnicas concretas como decodificación especulativa o atención lineal. La variante "Uncensored" implica una modificación de los pesos o del filtrado respecto al modelo original, pero la model card no documenta la metodología exacta empleada para eliminar restricciones de contenido.

## Capacidades

- Generación de imágenes a partir de descripciones textuales (text-to-image) mediante pipeline de difusión.
- Procesamiento de instrucciones textuales complejas gracias al text encoder Qwen3-VL de 8 B.
- Ejecución local en ComfyUI mediante el nodo ComfyUI-GGUF (fork de leejet con soporte nativo para Qwen-Image 2.1).
- Compatibilidad con múltiples backends de cuantización: GGUF para CPU/GPU, FP8/INT8/NVFP4 para GPUs modernas, MLX para Apple Silicon.
- Generación sin filtrado de contenido (variante "Uncensored"), lo que amplía el rango de prompts aceptados.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, audio o visión de entrada más allá del text encoder.

## Casos de uso

- Generación de ilustraciones para proyectos creativos personales: el modelo puede producir imágenes a partir de prompts detallados ejecutándose localmente en una RTX 4090 con la cuantización Q4_K_M (4,60 GB), sin depender de servicios en la nube.
- Prototipado rápido de conceptos visuales en estudios de diseño: con la variante MLX 4-bit (4,00 GB) se puede iterar en un Mac con Apple Silicon, generando variaciones de un concepto antes de pasar a producción.
- Creación de assets para videojuegos o contenido multimedia en entornos con requisitos de privacidad: al ejecutarse en local, los prompts no salen del equipo, lo que resulta adecuado para material confidencial.
- Investigación sobre modelos de difusión y cuantización: el paquete ofrece el mismo modelo en ocho formatos distintos, lo que permite comparar calidad y rendimiento entre BF16, FP8, INT8, NVFP4, MLX y GGUF en un mismo pipeline.
- Generación de contenido artístico sin restricciones temáticas: la variante "Uncensored" está pensada para flujos creativos que el modelo original rechazaría, siempre que se respete la legalidad aplicable.
- Despliegue en entornos con VRAM limitada: la variante Q4_0 (4,15 GB) o NVFP4 (4,20 GB) permite ejecutar el modelo en GPUs de gama media, ampliando el acceso a hardware asequible.
- Integración en pipelines de ComfyUI para automatización de generación por lotes: los archivos companion (text encoder y VAE) están empaquetados en el mismo repositorio, lo que simplifica el despliegue.

## Benchmarks y rendimiento

La model card incluye una referencia a una imagen de benchmark (`assets/Qwen-Image-2.1-Benchmark.png`), pero no se proporcionan los valores numéricos en el texto disponible.

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para el transformer de difusión: ~14,23 GB en BF16, ~7,59 GB en Q8_0, ~5,88 GB en Q6_K, ~5,22 GB en Q5_K_M, ~4,60 GB en Q4_K_M, ~4,15 GB en Q4_0, ~6,63 GB en FP8, ~6,76 GB en INT8 ConvRot, ~4,20 GB en NVFP4.
- VRAM adicional para el text encoder: 17,53 GB en BF16 o 9,35 GB en INT8 ConvRot; más 676 MB para el VAE.
- En total, un pipeline completo en BF16 requiere del orden de 32 GB de VRAM; con text encoder INT8 y transformer Q4_K_M se puede reducir a aproximadamente 15 GB.
- GPUs recomendadas: A100/H100 para BF16 sin compromisos; RTX 4090 (24 GB) para FP8 o Q8_0 con text encoder INT8; RTX 3090/4080 para Q5_K_M o Q4_K_M.
- Cabe en GPUs de consumo: sí, con cuantizaciones Q4_0/Q4_K_M y text encoder INT8 en GPUs de 12-16 GB; en Apple Silicon mediante MLX 4-bit/6-bit.
- Opciones de despliegue: ComfyUI con ComfyUI-GGUF (fork de leejet), backends MLX para Apple Silicon, safetensors FP8/INT8/NVFP4 para GPUs compatibles.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros (difusión) | Formatos | Licencia | Notas |
|---|---|---|---|---|
| Qwen-Image-2.1-Uncensored-Quantized (este) | ~7,1 B | GGUF, safetensors, MLX | qwen-research | Variante sin filtrado, múltiples cuantizaciones |
| Qwen/Qwen-Image-2.1 (base) | ~7,1 B | safetensors | qwen-research | Modelo original con filtrado |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

No se dispone de información sobre modelos comparables de otros desarrolladores (por ejemplo, familias Flux o SDXL) en la documentación proporcionada, por lo que no se puede establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- La licencia qwen-research restringe el uso comercial; es imprescindible revisar los términos completos antes de cualquier despliegue en producción.
- La variante "Uncensored" elimina o reduce el filtrado de contenido, lo que puede generar material inapropiado, ofensivo o legalmente problemático; el usuario es responsable del contenido generado.
- Riesgo de sesgos heredados del dataset de entrenamiento del modelo base, no documentados en la información disponible.
- Riesgo de alucinación visual: el modelo puede generar imágenes que no corresponden fielmente al prompt, especialmente en composiciones complejas o texto dentro de la imagen.
- No se documentan los idiomas soportados por el text encoder ni el rendimiento en prompts en castellano.
- El repositorio ocupa 105,2 GB por incluir todas las variantes; es necesario descargar solo los archivos necesarios para evitar consumo excesivo de almacenamiento.
- La model card enlaza a un espacio de usuario distinto (abenzerps) en las tablas de archivos, lo que puede indicar una reubicación o duplicación del repositorio; conviene verificar la integridad de los archivos antes de usarlos.
- No se proporcionan datos de benchmarks numéricos ni de latencia, lo que dificulta la evaluación objetiva del rendimiento frente a alternativas.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que no ha sido validado por la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/blobby159/Qwen-Image-2.1-Uncensored-Quantized
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
- ComfyUI-GGUF (fork de leejet): https://github.com/leejet/ComfyUI-GGUF
- Formulario de solicitudes de modelos: https://abenzerps.com/request-a-model/
- Espacio de usuario referenciado en las tablas: https://huggingface.co/abenzerps/Qwen-Image-2.1-Uncensored-Quantized
