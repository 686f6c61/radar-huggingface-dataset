# Naka3pr/Qwen-Image-2.1-Uncensored-Abenzerps-GGUF

## Resumen

Qwen-Image-2.1-Uncensored-Abenzerps-GGUF es una redistribución en formato GGUF y safetensors del modelo de generación de imágenes Qwen-Image-2.1, publicado originalmente por el equipo Qwen de Alibaba. El repositorio, alojado por el usuario Naka3pr, empaqueta el transformer de difusión en múltiples cuantizaciones (Q4_0 hasta Q8_0, además de BF16, FP8, INT8, NVFP4 y variantes MLX) junto con los ficheros auxiliares necesarios para su uso en ComfyUI: un text encoder Qwen3-VL de 8B y un VAE específico del modelo.

El modelo resuelve el problema de ejecutar un generador de imágenes de ~7.100 millones de parámetros en hardware de consumo, algo inviable con los pesos en precisión completa. La cuantización Q4_K_M reduce el transformer a 4,60 GB, lo que permite inferencia local en GPUs con 8-12 GB de VRAM cuando se combina con el text encoder en INT8 (9,35 GB) y el VAE (676 MB). La etiqueta "uncensored" indica que se han eliminado o relajado los filtros de contenido del modelo base, lo que tiene implicaciones legales y de moderación que se detallan más abajo.

Es relevante ahora porque Qwen-Image-2.1 es una de las familias de difusión abiertas con mejor relación calidad/tamaño, y este repo ofrece un paquete "todo en uno" para ComfyUI, el entorno de facto para flujos de difusión locales. No obstante, el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y su licencia declarada (qwen-research) restringe el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (text-to-image), basado en Qwen-Image-2.1; no se detalla la variante exacta (DiT u otra) en la información disponible |
| Parametros totales | 7.115.124.736 (~7,1 mil millones, según safetensors del modelo base) |
| Parametros activos | no disponible (no es un MoE según la información disponible) |
| Longitud de contexto | no disponible (modelo de imagen; la ventana de texto depende del text encoder Qwen3-VL 8B, no especificada) |
| Tipos de cuantizacion | BF16, FP8, INT8 ConvRot, NVFP4, MLX 4-bit/6-bit/8-bit, GGUF Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_0 |
| Idiomas soportados | no disponible (prompts en lenguaje natural; el text encoder Qwen3-VL es multilingüe, pero no se detallan idiomas) |
| Licencia | qwen-research (etiquetada como "other" en Hugging Face) |
| Formato de pesos | GGUF y safetensors (MLX, FP8, INT8, NVFP4) |

## Arquitectura y entrenamiento

El modelo es una cuantización del transformer de difusión de Qwen-Image-2.1, un generador text-to-image de ~7,1 mil millones de parámetros. La arquitectura subyacente es un transformer de difusión (el autor no especifica si es DiT, MMDiT u otra variante); el pipeline se completa con un text encoder Qwen3-VL de 8B parámetros (17,53 GB en BF16 o 9,35 GB en INT8) y un VAE propio de 676 MB. Esta separación en tres componentes (transformer, encoder, VAE) es la habitual en los flujos de ComfyUI.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF, DPO o fine-tuning por preferencias. La model card solo menciona que las cuantizaciones se han generado "using the original upstream base weights", es decir, a partir de los pesos originales de Qwen/Qwen-Image-2.1 sin un reentrenamiento documentado. La etiqueta "uncensored" sugiere una modificación del comportamiento del modelo base (eliminación de filtros de seguridad), pero no se documenta el método ni el alcance de esa modificación. Tampoco se detalla ninguna innovación técnica específica (atención lineal, decodificación especulativa, etc.).

## Capacidades

- Generación de imágenes a partir de descripciones textuales (text-to-image) mediante prompts en lenguaje natural.
- Integración nativa con ComfyUI a través del nodo `Unet Loader (GGUF)` y del fork `leejet/ComfyUI-GGUF`.
- Soporte de cuantizaciones para distintos presupuestos de memoria: desde Q4_0 (4,15 GB) hasta BF16 (14,23 GB).
- Variantes MLX (4, 6 y 8 bits) para ejecución en Apple Silicon.
- Variantes NVFP4 e INT8 orientadas a GPUs NVIDIA con soporte de cuantización de bajo nivel.
- Text encoder Qwen3-VL 8B, que aporta comprensión multimodal del prompt (el encoder es un modelo visión-lenguaje, aunque su uso aquí es como codificador de texto).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni thinking mode; es un modelo de generación de imágenes, no un LLM conversacional.
- Capacidades multilingües: no disponibles explícitamente; dependen del text encoder.

## Casos de uso

- Generación de ilustraciones para prototipado de producto: con Q4_K_M (4,60 GB) y el encoder INT8 (9,35 GB) se puede iterar sobre conceptos visuales en una RTX 3060 de 12 GB, sin depender de APIs externas.
- Creación de assets para videojuegos indie: el modelo permite generar sprites, fondos y texturas por lotes en local, integrándose en un pipeline de ComfyUI con nodos de postproceso (upscale, segmentación).
- Flujos de trabajo artísticos sin moderación: la variante "uncensored" está pensada para usuarios que necesitan generar contenido que los filtros del modelo base rechazarían (arte adulto, temáticas sensibles), siempre que se cumpla la legalidad aplicable.
- Experimentación en investigación sobre difusión: las múltiples cuantizaciones (FP8, INT8, NVFP4, MLX) permiten estudiar el impacto de la precisión numérica en la calidad de imagen con un mismo modelo base.
- Despliegue en Apple Silicon: las variantes MLX 4-bit (4,00 GB) y 6-bit (5,78 GB) permiten generar imágenes en un Mac con chip M-series sin GPU dedicada.
- Generación de material gráfico para marketing: prompts controlados con el encoder Qwen3-VL 8B para producir banners, mockups y variaciones de estilo en un servidor con A100 o H100 usando BF16 (14,23 GB) para máxima fidelidad.
- Automatización de contenido editorial: integración en ComfyUI con colas de trabajos para generar imágenes de acompañamiento en un CMS, usando Q8_0 (7,59 GB) como compromiso calidad/velocidad.

## Benchmarks y rendimiento

La model card incluye una imagen de referencia (`assets/Qwen-Image-2.1-Benchmark.png`) con resultados del modelo base, pero los valores numéricos no están disponibles en el texto proporcionado. No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para el transformer: 4,15 GB (Q4_0), 4,60 GB (Q4_K_M), 5,22 GB (Q5_K_M), 5,88 GB (Q6_K), 7,59 GB (Q8_0), 14,23 GB (BF16).
- VRAM adicional para el text encoder: 9,35 GB (INT8) o 17,53 GB (BF16); más 676 MB para el VAE.
- Configuración mínima realista: Q4_K_M + encoder INT8 + VAE ≈ 14,6 GB, por lo que una GPU de 16 GB (RTX 4060 Ti 16 GB, RTX 4080) es el mínimo cómodo; con encoder BF16 se necesitan ~22,8 GB (RTX 3090/4090 de 24 GB).
- GPU recomendadas: RTX 4090 (24 GB) para BF16 con encoder BF16; A100/H100 para despliegues concurrentes; RTX 3060 12 GB solo con Q4_0 + encoder INT8 y posible offload a RAM.
- Apple Silicon: variantes MLX 4/6/8-bit (4,00-7,56 GB) para Mac con memoria unificada de 16 GB o superior.
- Opciones de despliegue: ComfyUI con el fork `leejet/ComfyUI-GGUF` (soporte nativo de Qwen-Image 2.1); llama.cpp no es aplicable a un modelo de difusión; vLLM y TGI no soportan este pipeline.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen-Image-2.1-Uncensored-Abenzerps-GGUF (este) | ~7,1 B | no disponible | qwen-research | GGUF + safetensors en HF | Cuantizaciones múltiples, paquete ComfyUI completo |
| Qwen/Qwen-Image-2.1 (base) | ~7,1 B | no disponible | qwen-research | Pesos originales en HF | Sin modificaciones "uncensored"; referencia de calidad |
| Otras variantes del mismo repo (KasugaiSakura) | ~7 B | no disponible | qwen-research | GGUF en HF | Redistribución paralela del mismo paquete |

No se dispone de datos de benchmarks ni de comparativas con otros modelos de difusión (FLUX, SD3.5, etc.) en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa.

## Limitaciones y advertencias

- La licencia qwen-research restringe el uso comercial; es imprescindible revisar los términos completos antes de cualquier despliegue en producción.
- La etiqueta "uncensored" implica la eliminación de filtros de seguridad del modelo base; el contenido generado puede ser ilegal en algunas jurisdicciones (por ejemplo, material de abuso infantil, deepfakes no consentidos) y el usuario asume toda la responsabilidad legal.
- Riesgo de alucinación visual: como todo modelo de difusión, puede generar anatomías incorrectas, texto ilegible en imágenes y artefactos en composiciones complejas.
- Sesgos conocidos: no documentados en la información disponible; los modelos de difusión suelen heredar sesgos de género, etnia y cultura de sus datasets de entrenamiento.
- Sin datos de benchmarks ni de evaluación de calidad por cuantización; no se puede verificar la degradación real de Q4_0 frente a BF16.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de validación por la comunidad ni de mantenimiento activo.
- El fork `leejet/ComfyUI-GGUF` es necesario; el fork antiguo `city96/ComfyUI-GGUF` falla con `Unknown model architecture!` según la model card.
- El tamaño del repo (105,2 GB) incluye todas las cuantizaciones y ficheros auxiliares; la descarga selectiva es obligatoria para evitar transferencias masivas.
- Idiomas soportados no documentados; la calidad con prompts en castellano no está verificada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Naka3pr/Qwen-Image-2.1-Uncensored-Abenzerps-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
- ComfyUI-GGUF (fork recomendado): https://github.com/leejet/ComfyUI-GGUF
- Redistribución paralela (KasugaiSakura): https://huggingface.co/KasugaiSakura/Qwen-Image-2.1-Uncensored-Abenzerps-GGUF
- Ficheros de cuantización (ejemplo): https://huggingface.co/abenzerps/Qwen-Image-2.1-Uncensored-GGUF/blob/main/qwen-image-2.1-UC-Q4_K_M.gguf
