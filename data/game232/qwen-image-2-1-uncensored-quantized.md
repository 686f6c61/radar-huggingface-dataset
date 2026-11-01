# Game232/Qwen-Image-2.1-Uncensored-Quantized

## Resumen

Qwen-Image-2.1-Uncensored-Quantized es una redistribución en formatos cuantizados del modelo de generación de imágenes texto-a-imagen Qwen/Qwen-Image-2.1, publicada por el usuario Game232. El modelo base es un diffusion transformer de aproximadamente 7.115 millones de parámetros (7,1 B) desarrollado por el equipo Qwen de Alibaba, orientado a la síntesis de imágenes de alta fidelidad a partir de descripciones textuales. Esta versión concreta no introduce pesos nuevos: empaqueta los pesos upstream en múltiples formatos de cuantización (GGUF, safetensors FP8/INT8/NVFP4 y MLX) junto con los componentes auxiliares necesarios (text encoder Qwen3-VL 8B y VAE) para su uso en ComfyUI.

La relevancia de esta ficha radica en que resuelve el problema práctico de desplegar un modelo de difusión de 7 B en hardware de consumo. El repositorio incluye variantes desde BF16 (14,23 GB) hasta NVFP4 (4,20 GB) y MLX 4-bit (4,00 GB), lo que permite ejecutar generación de imágenes local en GPUs con 8-12 GB de VRAM o en Apple Silicon. El repo completo ocupa 105,2 GB por acumular todas las variantes y los ficheros companion.

Cabe señalar que la etiqueta "Uncensored" del nombre no viene acompañada de documentación técnica sobre qué se ha modificado respecto al modelo base; la model card indica explícitamente que se usan "the original upstream base weights". La licencia declarada es qwen-research, no una licencia permisiva, lo que condiciona su uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Diffusion transformer (modelo de difusión texto-a-imagen); detalles internos no disponibles |
| Parámetros totales | 7.115.124.736 (7,1 B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | BF16, FP8, INT8 ConvRot, NVFP4, MLX 4/6/8-bit, GGUF Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_0 |
| Idiomas soportados | No disponible (el text encoder Qwen3-VL 8B es multilingüe, pero el autor no declara idiomas) |
| Licencia | qwen-research (etiquetada como "other" en HuggingFace) |
| Formato de pesos | GGUF, safetensors (FP8, INT8, NVFP4, MLX), BF16 |

## Arquitectura y entrenamiento

El modelo base Qwen-Image-2.1 es un modelo de difusión para generación de imágenes a partir de texto. La información proporcionada no detalla la arquitectura interna (número de bloques, tipo de atención, mecanismo de condicionamiento), por lo que no es posible describirla con rigor. El pipeline declarado es text-to-image y el modelo se distribuye con un text encoder basado en Qwen3-VL de 8 B de parámetros en BF16 (17,53 GB) o INT8 (9,35 GB), y un VAE propio de Qwen-Image 2.1 en BF16 (676 MB).

No se dispone de datos sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o ajuste por preferencias humanas. Tampoco hay información sobre innovaciones técnicas específicas (decodificación especulativa, atención lineal, destilación de pasos). La model card menciona únicamente que la versión cuantizada emplea "the original upstream base weights", sin indicar ningún proceso de fine-tuning o modificación de pesos que justifique la etiqueta "Uncensored".

## Capacidades

- Generación de imágenes texto-a-imagen de alta resolución mediante pipeline de difusión.
- Condicionamiento textual a través de un text encoder Qwen3-VL 8B, lo que aporta comprensión multimodal del prompt.
- Ejecución local en ComfyUI mediante el nodo ComfyUI-GGUF (fork de leejet con soporte nativo para Qwen-Image 2.1).
- Compatibilidad con aceleración en Apple Silicon mediante los formatos MLX 4/6/8-bit.
- Compatibilidad con GPUs NVIDIA modernas mediante NVFP4 e INT8 ConvRot para inferencia de alta eficiencia.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni generación de código: es un modelo puramente generativo de imágenes.
- El alcance multilingüe del prompt depende del text encoder Qwen3-VL; el autor no declara una lista de idiomas.

## Casos de uso

- Generación de ilustraciones para prototipado de producto: usar la variante Q4_K_M (4,60 GB) en una RTX 4060 Ti para iterar rápidamente sobre conceptos visuales sin depender de APIs externas, gracias a que el modelo completo cabe en VRAM de consumo.
- Creación de assets para videojuegos indie: el pipeline en ComfyUI permite generar sprites, fondos y texturas de forma por lotes, con el text encoder INT8 (9,35 GB) para reducir el pico de memoria durante la codificación del prompt.
- Automatización de contenido editorial: integración del modelo en un flujo ComfyUI con cola de trabajos para producir imágenes de acompañamiento en artículos, usando la variante FP8 (6,63 GB) en una GPU de 16 GB para equilibrar calidad y velocidad.
- Investigación sobre modelos de difusión: la disponibilidad de pesos en BF16, FP8, INT8, NVFP4 y MLX permite estudiar el impacto de la cuantización en la fidelidad visual comparando la misma semilla entre variantes.
- Despliegue en estaciones de trabajo Apple Silicon: la variante MLX 4-bit (4,00 GB) permite generar imágenes en un Mac con chip M-series unificando memoria, sin GPU dedicada.
- Generación de imágenes sin restricciones de contenido para investigación en seguridad de modelos: la etiqueta "Uncensored" sugiere que el modelo puede emplearse para estudiar comportamientos del modelo base ante prompts sensibles, aunque el autor no documenta qué filtros se han eliminado.
- Fine-tuning o LoRA sobre el modelo base: al incluir pesos en BF16 (14,23 GB), el repositorio sirve como punto de partida para entrenar adaptadores específicos de dominio.

## Benchmarks y rendimiento

La model card incluye una imagen de referencia (`assets/Qwen-Image-2.1-Benchmark.png`) pero no presenta los valores numéricos en texto. No se han publicado resultados de benchmarks cuantitativos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo transformer de difusión): ~14,2 GB en BF16, ~7,6 GB en Q8_0, ~6,6 GB en FP8, ~5,2 GB en Q5_K_M, ~4,6 GB en Q4_K_M, ~4,2 GB en NVFP4.
- A la VRAM del transformer hay que sumar el text encoder: 17,53 GB en BF16 o 9,35 GB en INT8, más 676 MB del VAE. Con text encoder INT8 y transformer Q4_K_M el pico conjunto ronda los 14-15 GB.
- GPUs recomendadas: A100/H100 para BF16 sin compromisos; RTX 4090 (24 GB) para FP8 o BF16 con text encoder INT8; RTX 4080/4070 Ti Super (16 GB) para Q8_0 o FP8 con text encoder INT8; RTX 4060 Ti (16 GB) o RTX 4070 (12 GB) para Q4_K_M con text encoder INT8.
- Cabe en GPU de consumo: sí, con las variantes GGUF Q4_K_M/Q4_0 y text encoder INT8 en GPUs de 12-16 GB. Las variantes NVFP4 (4,20 GB) requieren GPU con soporte de FP4 (Blackwell o superior).
- Apple Silicon: las variantes MLX 4/6/8-bit están optimizadas para memoria unificada de chips M-series.
- Opciones de despliegue: ComfyUI con ComfyUI-GGUF (fork de leejet); el autor no menciona vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un modelo de difusión.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formatos | Disponibilidad |
|---|---|---|---|---|---|
| Qwen-Image-2.1-Uncensored-Quantized (esta ficha) | 7,1 B | No disponible | qwen-research | GGUF, safetensors, MLX | HuggingFace, repo de 105,2 GB |
| Qwen/Qwen-Image-2.1 (base) | 7,1 B | No disponible | qwen-research | Safetensors | HuggingFace oficial de Qwen |
| Alternativas de difusión de tamaño comparable | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de información sobre otros modelos comparables (por ejemplo, variantes cuantizadas de Flux o SD3.5) en los datos proporcionados, por lo que la comparativa se limita al modelo base y no se aportan cifras de rendimiento relativo.

## Limitaciones y advertencias

- La etiqueta "Uncensored" no está respaldada por documentación técnica: el autor afirma usar los pesos upstream sin modificaciones, por lo que no queda claro qué filtros de seguridad se han eliminado ni cómo se ha verificado.
- Licencia qwen-research: restringe el uso comercial. Verificar los términos exactos antes de cualquier despliegue en producción; no es una licencia permisiva tipo Apache 2.0 o MIT.
- Riesgo de alucinación visual: como todo modelo de difusión, puede generar anatomías incorrectas, texto ilegible en la imagen y artefactos en composiciones complejas.
- Sesgos: no documentados por el autor; los modelos de difusión suelen heredar sesgos de representación de sus datasets de entrenamiento.
- Idiomas: no se declara una lista oficial de idiomas soportados; el rendimiento con prompts en castellano depende del text encoder Qwen3-VL y no está verificado.
- Sin métricas de calidad por cuantización: el autor no publica comparativas FID/CLIP entre las variantes BF16, FP8, INT8, NVFP4 y GGUF, por lo que la pérdida de fidelidad al bajar de precisión es desconocida.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de comunidad ni de validación por terceros sobre la integridad de los pesos.
- Tamaño del repo (105,2 GB) y ausencia de verificación de checksums: conviene validar los ficheros descargados antes de usarlos en producción.
- Dependencia de un fork específico de ComfyUI-GGUF (leejet) para evitar el error "Unknown model architecture!"; la integración con otras herramientas no está documentada.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Game232/Qwen-Image-2.1-Uncensored-Quantized
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
- ComfyUI-GGUF (fork con soporte Qwen-Image 2.1): https://github.com/leejet/ComfyUI-GGUF
- Formulario de peticiones del autor: https://abenzerps.com/request-a-model/
