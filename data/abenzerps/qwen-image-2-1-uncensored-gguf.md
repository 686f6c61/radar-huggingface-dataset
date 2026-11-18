# abenzerps/Qwen-Image-2.1-Uncensored-GGUF

## Resumen

Qwen-Image-2.1-Uncensored-GGUF es una redistribución cuantizada del modelo de generación de imágenes Qwen/Qwen-Image-2.1-Turbo, publicada por el usuario abenzerps en Hugging Face. Se trata de un modelo de difusión de aproximadamente 7.115 millones de parámetros (7B) especializado en text-to-image, distribuido en múltiples formatos de cuantización (GGUF, FP8, INT8 ConvRot, NVFP4 y MLX en 4, 6 y 8 bits) para facilitar su ejecución en hardware de consumo y en entornos ComfyUI.

El modelo base, desarrollado por el equipo Qwen (Alibaba), incorpora una arquitectura de generación visual Turbo que reduce el proceso de denoising a 8 pasos con CFG = 1, lo que permite generar imágenes de 1024 × 1024 en aproximadamente 10-20 segundos en GPU tras el warm-up. La versión redistribuida mantiene esa configuración y añade un text encoder Qwen3-VL de 8B en BF16 o INT8, junto con un VAE específico del modelo.

Su relevancia actual radica en dos factores: por un lado, la disponibilidad de cuantizaciones ligeras (desde 4.00 GB en MLX 4-bit hasta 7.69 GB en Q8_0) que hacen viable la inferencia en GPUs consumer; por otro, la ausencia de filtros de seguridad integrados en el modelo base, lo que lo posiciona como una alternativa para flujos de trabajo que requieren generación sin restricciones de contenido. El repositorio acumula 187.989 descargas y 6.043 likes, lo que refleja una adopción considerable dentro de la comunidad ComfyUI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión text-to-image (arquitectura de generación visual de 7B, variante Turbo) |
| Parametros totales | 7.115.124.736 (7B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF (Q4_0, Q4_K_M, Q5_K_M, Q6_K, Q8_0), FP8, INT8 ConvRot, NVFP4, MLX 4-bit, MLX 6-bit, MLX 8-bit |
| Idiomas soportados | No disponible |
| Licencia | qwen-research (etiquetada como "other" en la model card) |
| Formato de pesos | GGUF y safetensors (FP8, INT8, NVFP4, MLX); text encoder en BF16/INT8; VAE en BF16 |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de difusión para generación de imágenes condicionada por texto, con un diseño "Turbo" que reduce el número de pasos de denoising a 8 y fija el classifier-free guidance (CFG) en 1.0. Esta configuración, junto con un schedule sigma oficial, permite obtener resultados de calidad en un régimen de pocos pasos, lo que se traduce en latencias de 10-20 segundos para resoluciones de 1024 × 1024 en GPU tras el warm-up. El pipeline se completa con un text encoder Qwen3-VL de 8B parámetros (disponible en BF16, 17.53 GB, o INT8 ConvRot, 9.35 GB) y un VAE específico del modelo (0.68 GB en BF16).

No se dispone de información detallada sobre el dataset de entrenamiento, el número de tokens utilizados ni sobre si se aplicaron técnicas de RLHF o DPO en el modelo base. La model card tampoco documenta innovaciones técnicas adicionales más allá del régimen Turbo de 8 pasos y la integración con ComfyUI mediante plantillas oficiales. La redistribución cuantizada se limita a convertir los pesos del modelo base a los formatos indicados, sin modificar la arquitectura ni el proceso de entrenamiento.

## Capacidades

- Generación de imágenes a partir de descripciones textuales (text-to-image) en resoluciones de 1024 × 1024.
- Generación en régimen Turbo con 8 pasos de denoising y CFG = 1.0, lo que reduce el coste computacional frente a modelos de difusión convencionales.
- Funcionamiento sin safety checker ni filtro de contenido integrado, según indica la model card del autor.
- Integración nativa con ComfyUI mediante plantilla oficial "Qwen Image 2.1 Turbo — Text to Image" y workflow JSON publicado.
- Soporte de ejecución en línea de comandos mediante stable-diffusion.cpp para formatos GGUF y safetensors compatibles.
- Soporte de MLX/MFLUX para ejecución en hardware Apple Silicon con cuantizaciones de 4, 6 y 8 bits.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de audio.

## Casos de uso

- Generación de ilustraciones para prototipado rápido: con Q4_K_M (4.42 GB) o MLX 4-bit (4.00 GB) se puede iterar sobre conceptos visuales en GPUs consumer, obteniendo imágenes de 1024 × 1024 en 10-20 segundos por generación tras el warm-up.
- Creación de assets para videojuegos y previsualización: el régimen Turbo de 8 pasos permite generar variaciones de personajes, entornos o texturas en lotes pequeños sin incurrir en los tiempos de muestreo de modelos de 50+ pasos.
- Flujos de trabajo artísticos sin restricciones de contenido: al no incorporar safety checker, el modelo es adecuado para proyectos creativos que requieran temáticas que otros modelos filtran, siempre que se respete la licencia qwen-research.
- Automatización de pipelines de imagen en ComfyUI: la plantilla oficial y el workflow JSON permiten integrar el modelo en grafos de nodos con text encoder Qwen3-VL y VAE, facilitando la composición con otros nodos de postprocesado.
- Despliegue en Apple Silicon: las variantes MLX 4/6/8-bit (4.00-7.56 GB) permiten ejecutar el modelo en Macs con memoria unificada, usando MFLUX como runtime.
- Generación por línea de comandos en servidores sin GPU dedicada: los GGUF Q4_0 (4.13 GB) y Q4_K_M (4.42 GB) pueden ejecutarse con stable-diffusion.cpp en entornos con recursos limitados.
- Investigación sobre cuantización de modelos de difusión: la disponibilidad de múltiples formatos (FP8, INT8 ConvRot, NVFP4, GGUF, MLX) permite comparar calidad y rendimiento entre precisiones en un mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una imagen de comparación de benchmarks (`assets/Qwen-Image-2.1-Benchmark.png`) pero no se proporcionan los valores numéricos en el texto. El único dato de rendimiento explícito es el tiempo de generación: aproximadamente 10-20 segundos para 1024 × 1024 en GPU tras el warm-up, dependiendo del hardware.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 4 y 8 GB para el modelo de difusión según cuantización (MLX 4-bit: 4.00 GB; Q4_0: 4.13 GB; Q4_K_M: 4.42 GB; Q5_K_M: 5.35 GB; Q6_K: 6.29 GB; Q8_0: 7.69 GB; FP8: 7.13 GB; INT8 ConvRot: 7.26 GB; NVFP4: 4.20 GB).
- A esa cifra hay que sumar el text encoder: 9.35 GB en INT8 ConvRot o 17.53 GB en BF16, y el VAE de 0.68 GB. El total en INT8 ronda los 14-15 GB; en BF16 supera los 22 GB.
- GPU recomendadas: no especificadas en la información disponible. Por el tamaño del conjunto (modelo + text encoder + VAE), una GPU con 16 GB o más (RTX 4090, A100, H100) permite ejecutar el pipeline completo en INT8; configuraciones con menos VRAM requerirían offloading o cuantizaciones más agresivas del text encoder.
- Cabe en GPU consumer: sí, con cuantizaciones Q4 y el text encoder en INT8, en GPUs de 16 GB o superiores. En GPUs de 8-12 GB sería necesario gestionar la memoria del text encoder por separado.
- Opciones de despliegue: ComfyUI (GGUF y safetensors), stable-diffusion.cpp (GGUF y safetensors compatibles), MLX/MFLUX (variantes MLX).
- Latencia y throughput: 10-20 segundos por imagen de 1024 × 1024 en GPU tras el warm-up, según la model card. No se proporcionan cifras de throughput para lotes.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. La model card referencia únicamente el modelo base Qwen/Qwen-Image-2.1-Turbo del que deriva esta cuantización, sin establecer comparaciones con alternativas de la misma categoría (otros modelos de difusión text-to-image de 7B). No se han incluido datos de parámetros, contexto ni rendimiento de terceros que permitan una comparativa rigurosa.

## Limitaciones y advertencias

- La licencia qwen-research puede imponer restricciones al uso comercial; es necesario revisar los términos completos antes de desplegar el modelo en producción.
- La ausencia de safety checker implica que el modelo puede generar contenido no apto para todos los públicos; el operador del servicio es responsable del filtrado posterior.
- No se documentan sesgos conocidos ni la composición del dataset de entrenamiento, lo que dificulta evaluar riesgos de representación.
- No se dispone de información sobre idiomas soportados; el rendimiento en prompts en castellano u otros idiomas distintos del inglés no está verificado.
- El riesgo de alucinación en modelos de difusión se manifiesta como imágenes que no se corresponden fielmente con el prompt; no hay métricas publicadas de fidelidad prompt-imagen.
- El tamaño total del repositorio (215.1 GB) incluye todas las cuantizaciones y componentes; la descarga selectiva es imprescindible para evitar transferencias innecesarias.
- La generación Turbo con 8 pasos y CFG = 1.0 puede producir menor diversidad o detalle que configuraciones de más pasos; la model card recomienda mantener la semilla fija al comparar resultados.
- No se proporcionan garantías de soporte ni mantenimiento por parte del autor de la redistribución (abenzerps), que no es el desarrollador original del modelo base.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/abenzerps/Qwen-Image-2.1-Uncensored-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1-Turbo
- Repositorio de cuantizaciones del autor: https://huggingface.co/abenzerps/Qwen-Image-2.1-Turbo-Quantized
- ComfyUI: https://github.com/Comfy-Org/ComfyUI
- Plantilla oficial ComfyUI (workflow JSON): https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_qwen_image_2_1_turbo_t2i.json
- GitHub del autor: https://github.com/abenzerps
- Formulario de solicitud de modelos: https://abenzerps.com/request-a-model/
