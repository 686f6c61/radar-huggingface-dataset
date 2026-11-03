# Guesswhosback/Qwen-Image-2.1-Uncensored-Quantized

## Resumen

Qwen-Image-2.1-Uncensored-Quantized es una redistribución cuantizada del modelo de generación de imágenes Qwen/Qwen-Image-2.1, publicada por el usuario Guesswhosback (con enlaces a la cuenta abenzerps). El paquete ofrece los pesos del modelo base en múltiples formatos (GGUF, safetensors FP8/INT8/NVFP4 y MLX de 4, 6 y 8 bits), junto con los ficheros complementarios necesarios para su uso en ComfyUI: el text encoder qwen3vl_8b y el VAE qwen_image_2.1. El objetivo es facilitar la inferencia local de un modelo de difusión texto-a-imagen de aproximadamente 7.100 millones de parámetros en hardware de consumo.

El modelo base es un text-to-image de la familia Qwen, y esta versión se etiqueta como "uncensored", lo que implica que se han retirado o relajado los filtros de contenido del modelo original. La relevancia actual radica en la posibilidad de ejecutar un generador de imágenes de gran tamaño en GPUs de gama alta de consumo mediante cuantizaciones agresivas (Q4_K_M de 4,60 GB, NVFP4 de 4,20 GB, MLX 4-bit de 4,00 GB), algo inviable con los pesos BF16 originales de 14,23 GB.

La ficha se basa exclusivamente en la información de la model card y los metadatos de HuggingFace; no se dispone de detalles sobre arquitectura interna, datos de entrenamiento ni resultados de benchmarks más allá de una imagen de referencia incluida en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de difusión texto-a-imagen; el repositorio no detalla la arquitectura interna) |
| Parametros totales | 7.115.124.736 (según safetensors del repo) |
| Parametros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, FP8, INT8 ConvRot, NVFP4, MLX 4/6/8-bit, GGUF Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_0 |
| Idiomas soportados | no disponible |
| Licencia | qwen-research (etiquetada como "other" en HuggingFace) |
| Formato de pesos | GGUF, safetensors, MLX safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base Qwen/Qwen-Image-2.1 en la documentación proporcionada. Por la naturaleza del pipeline (text-to-image) y los ficheros complementarios, se trata de un modelo de difusión que emplea un text encoder basado en Qwen3-VL de 8.000 millones de parámetros (qwen3vl_8b) y un VAE específico (qwen_image_2.1_vae). El tamaño del transformer de difusión, según los pesos safetensors, es de 7.115.124.736 parámetros.

No se han publicado en la información disponible datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o ajuste fino por preferencias. La variante "Uncensored" sugiere un proceso de ajuste o filtrado posterior para eliminar restricciones de contenido, pero el autor no documenta la metodología empleada. Tampoco se detallan innovaciones técnicas como decodificación especulativa o mecanismos de atención lineal.

## Capacidades

- Generación de imágenes a partir de descripciones textuales (text-to-image) mediante el pipeline de difusión.
- Integración nativa con ComfyUI a través del nodo ComfyUI-GGUF (fork de leejet), lo que permite construir flujos de trabajo nodales con el modelo cuantizado.
- Soporte de cuantizaciones para distintos backends: GGUF para llama.cpp/ComfyUI-GGUF, safetensors FP8/INT8/NVFP4 para GPUs compatibles y MLX para Apple Silicon.
- Inclusión de text encoder Qwen3-VL 8B, lo que aporta comprensión multimodal de las indicaciones textuales (el encoder es de tipo visión-lenguaje, aunque su uso aquí es como codificador de prompts).
- Variante "uncensored": ausencia declarada de filtros de contenido, orientada a generación sin restricciones temáticas.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni soporte multilingüe explícito.

## Casos de uso

- Generación de ilustraciones conceptuales en local: con la cuantización Q4_K_M (4,60 GB) el modelo cabe en GPUs de consumo de 8 GB o más, permitiendo crear bocetos e ilustraciones sin depender de servicios en la nube.
- Prototipado rápido de assets para videojuegos: el flujo en ComfyUI permite iterar sobre prompts y semillas para generar sprites, texturas o fondos, y el formato GGUF facilita el intercambio de pesos entre estaciones de trabajo.
- Creación de contenido artístico sin restricciones temáticas: la variante uncensored está pensada para proyectos creativos que requieran temáticas que los filtros convencionales rechazan, siempre que se respete la legalidad aplicable.
- Investigación sobre cuantización de modelos de difusión: el repositorio ofrece el mismo modelo en BF16, FP8, INT8, NVFP4, MLX y GGUF, lo que permite comparar la degradación de calidad entre precisiones en un mismo pipeline.
- Despliegue en Apple Silicon: las variantes MLX 4/6/8-bit (4,00-7,56 GB) permiten ejecutar el modelo en Macs con memoria unificada, usando el ecosistema MLX en lugar de CUDA.
- Automatización de generación por lotes en pipelines de CI/contenido: mediante scripts que invoquen ComfyUI en modo headless con los GGUF, se pueden generar imágenes de forma reproducible para catálogos, blogs o pruebas A/B de creatividades.
- Evaluación de modelos uncensored frente a sus versiones base: útil para investigadores que estudien el efecto de la eliminación de filtros en la calidad y diversidad de las imágenes generadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numéricos en la información disponible. La model card incluye una imagen de referencia (`assets/Qwen-Image-2.1-Benchmark.png`) que no se puede interpretar como datos tabulares en esta ficha. No se inventan cifras.

## Requisitos de hardware

- VRAM estimada para el transformer de difusión según cuantización: BF16 14,23 GB; FP8 6,63 GB; INT8 ConvRot 6,76 GB; NVFP4 4,20 GB; MLX 4-bit 4,00 GB; MLX 6-bit 5,78 GB; MLX 8-bit 7,56 GB; GGUF Q8_0 7,59 GB; Q6_K 5,88 GB; Q5_K_M 5,22 GB; Q4_K_M 4,60 GB; Q4_0 4,15 GB.
- Hay que sumar el text encoder: qwen3vl_8b en BF16 ocupa 17,53 GB y en INT8 ConvRot 9,35 GB (el autor recomienda la versión INT8 para menor memoria). El VAE BF16 ocupa 676 MB.
- VRAM total orientativa: con Q4_K_M + text encoder INT8 + VAE se superan los 14 GB, por lo que se recomienda una GPU de 16 GB o más (RTX 4080/4090, RTX 5080/5090, A100, H100). Con text encoder BF16 se requieren más de 22 GB.
- En GPUs de 8-12 GB puede ser necesario descargar el text encoder a CPU o usar variantes más agresivas, a costa de latencia.
- Apple Silicon: las variantes MLX están optimizadas para memoria unificada; un Mac con 16 GB o más puede ejecutar las versiones de 4-6 bits.
- Opciones de despliegue: ComfyUI con ComfyUI-GGUF (fork de leejet), safetensors para FP8/INT8/NVFP4 en GPUs compatibles, MLX para Apple Silicon. No se mencionan vLLM, TGI, Ollama ni llama.cpp directo para este pipeline.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos comparables en la información proporcionada. Se indica "no disponible" para evitar inferencias no respaldadas.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen-Image-2.1-Uncensored-Quantized | 7.115.124.736 | no disponible | qwen-research | HuggingFace (este repo) |
| Qwen/Qwen-Image-2.1 (base) | no disponible | no disponible | qwen-research | HuggingFace |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La licencia qwen-research puede restringir el uso comercial; es imprescindible revisar los términos exactos antes de desplegar en producción.
- La variante "uncensored" elimina filtros de contenido: existe riesgo de generar material ilegal, difamatorio o inapropiado; el usuario es responsable del uso y del cumplimiento normativo.
- No hay documentación sobre sesgos del modelo base ni sobre cómo el proceso de "uncensoring" los modifica.
- Riesgo de alucinación visual: como todo modelo generativo, puede producir imágenes incoherentes, con anatomía incorrecta o texto ilegible, especialmente en cuantizaciones agresivas (Q4_0, MLX 4-bit).
- La cuantización a 4 bits puede degradar la fidelidad respecto a BF16; el autor recomienda Q4_K_M como equilibrio, pero no aporta métricas de calidad.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el autor (Guesswhosback) no es el desarrollador original de Qwen; se trata de una redistribución de terceros, con el riesgo de manipulación que ello implica.
- Los enlaces de la model card apuntan a la cuenta abenzerps, distinta del ID del repositorio (Guesswhosback), lo que genera ambigüedad sobre la procedencia y autenticidad de los ficheros.
- No se especifican idiomas soportados; el comportamiento multilingüe del text encoder Qwen3-VL no está documentado para esta integración.
- No hay información sobre el contexto máximo de prompt ni sobre límites de resolución de imagen.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Guesswhosback/Qwen-Image-2.1-Uncensored-Quantized
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
- ComfyUI-GGUF (fork de leejet): https://github.com/leejet/ComfyUI-GGUF
- Formulario de solicitudes de modelos del autor: https://abenzerps.com/request-a-model/
- Cuenta alternativa referenciada en la model card: https://huggingface.co/abenzerps/Qwen-Image-2.1-Uncensored-Quantized
