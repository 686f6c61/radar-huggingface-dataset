# chilozk1022/Qwen-Image-2.1-Turbo-Quantized

## Resumen

Qwen-Image-2.1-Turbo-Quantized es un conjunto de pesos cuantizados del modelo de generación de imágenes Qwen-Image-2.1-Turbo, publicado por el usuario chilozk1022 en Hugging Face. El modelo base, desarrollado por el equipo Qwen (Alibaba), es una arquitectura de generación visual de tipo text-to-image de aproximadamente 7.115 millones de parámetros (7,1B), orientada a la síntesis de imágenes a partir de descripciones textuales. Esta versión no es un modelo nuevo, sino un paquete de cuantizaciones que abarca formatos GGUF, safetensors FP8/INT8/NVFP4 y MLX de 4, 6 y 8 bits, pensado para reducir los requisitos de memoria y facilitar el despliegue en hardware de consumo.

La relevancia de esta ficha radica en su orientación práctica: el modelo base incorpora un modo "Turbo" con 8 pasos de denoising y CFG = 1, lo que permite generar imágenes de 1024 × 1024 en aproximadamente 10-20 segundos en GPU tras el calentamiento. El repositorio incluye además los componentes auxiliares necesarios (text encoder Qwen3-VL de 8B y VAE), empaquetados para su uso directo en ComfyUI, stable-diffusion.cpp y MFLUX/MLX.

Conviene subrayar que se trata de un repositorio de cuantización de terceros: los pesos originales son de Qwen y la licencia aplicable es la qwen-research del modelo base, no una licencia permisiva. El tamaño total del repositorio (91,4 GB) refleja la suma de todas las variantes de cuantización y componentes auxiliares, no el tamaño de un único archivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusión text-to-image (modelo de generación visual Qwen-Image 2.1, 7B) |
| Parametros totales | 7.115.124.736 (~7,1B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF (Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_0), safetensors FP8, INT8 ConvRot, NVFP4, MLX 4/6/8-bit |
| Idiomas soportados | No disponible |
| Licencia | qwen-research (licencia de investigación de Qwen; no permisiva para uso comercial sin condiciones) |
| Formato de pesos | GGUF, safetensors (FP8, INT8 ConvRot, NVFP4, MLX) |

## Arquitectura y entrenamiento

El modelo base Qwen-Image-2.1-Turbo es un modelo de difusión para generación de imágenes condicionada por texto, con una arquitectura de generación visual de 7B parámetros. La información disponible no detalla la composición interna de la red (número de bloques, tipo de atención, etc.) ni los datos de entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO). Lo que sí se especifica es el régimen de inferencia "Turbo": 8 pasos de denoising con CFG = 1 y un schedule de sigmas oficial, lo que reduce drásticamente el coste computacional frente a los esquemas de difusión convencionales de 20-50 pasos.

El text encoder asociado es Qwen3-VL de 8B (en BF16 o INT8 ConvRot), y el VAE es qwen_image_2.1_vae en BF16 (0,68 GB). Esta combinación —un encoder multimodal de 8B para el texto y un VAE dedicado— sugiere un pipeline de dos etapas: codificación semántica del prompt y decodificación latente a píxeles. No se dispone de información sobre innovaciones adicionales como decodificación especulativa o atención lineal en la documentación proporcionada.

## Capacidades

- Generación de imágenes text-to-image a partir de descripciones en lenguaje natural, con resolución de 1024 × 1024 y batch 1 como configuración de referencia.
- Modo Turbo con 8 pasos de denoising y CFG = 1, que reduce la latencia de generación.
- Generación de imágenes sin filtro de seguridad integrado ni content checker, según declara el autor del repositorio (el modelo base "nativamente soporta generación de imágenes sin censura").
- Compatibilidad con ComfyUI mediante los formatos GGUF y safetensors (FP8, INT8 ConvRot, NVFP4), con plantilla oficial "Qwen Image 2.1 Turbo — Text to Image".
- Compatibilidad con runtimes de línea de comandos mediante stable-diffusion.cpp (GGUF o safetensors compatibles).
- Compatibilidad con MLX/MFLUX en macOS mediante las variantes MLX de 4, 6 y 8 bits.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni audio; es un modelo exclusivamente de generación de imágenes.

## Casos de uso

- Generación de ilustraciones para prototipado de producto: el modelo permite crear imágenes de 1024 × 1024 en 10-20 segundos tras el calentamiento, lo que lo hace adecuado para iterar rápidamente sobre conceptos visuales en fases de diseño.
- Integración en ComfyUI para pipelines de creación artística: la disponibilidad de GGUF y safetensors INT8 ConvRot permite montar flujos nodales reutilizables con el text encoder Qwen3-VL y el VAE oficiales, sin necesidad de infraestructura dedicada.
- Despliegue en estaciones de trabajo con GPU de consumo: las variantes Q4_K_M (4,42 GB) y NVFP4 (4,20 GB) reducen la huella de memoria lo suficiente para ejecutar el modelo en GPUs de gama media-alta, algo inviable con los pesos en BF16.
- Generación de imágenes en macOS mediante MLX/MFLUX: las variantes MLX de 4 bits (4,00 GB) y 6 bits (5,78 GB) permiten ejecutar el modelo en equipos Apple Silicon, ampliando el alcance a desarrolladores sin GPU NVIDIA.
- Automatización por línea de comandos con stable-diffusion.cpp: útil para generar lotes de imágenes de forma programática en servidores sin entorno gráfico, integrable en scripts de CI o generación de assets.
- Investigación sobre cuantización de modelos de difusión: el repositorio ofrece un conjunto comparativo de siete formatos (GGUF, FP8, INT8, NVFP4, MLX) del mismo modelo base, lo que facilita estudios de compromiso entre calidad visual y tamaño de pesos.
- Generación de contenido sin restricciones declaradas: el modelo base no aplica filtro de seguridad, lo que puede ser relevante en contextos de investigación artística o editorial, siempre que se respeten las obligaciones legales y éticas aplicables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una imagen de comparación de benchmarks del modelo base (`assets/Qwen-Image-2.1-Benchmark.png`), pero no se proporcionan los valores numéricos en el texto. El único dato de rendimiento explícito es que la generación de 1024 × 1024 tarda aproximadamente 10-20 segundos en GPU tras el calentamiento, dependiendo del hardware.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; como referencia, el tamaño de los archivos de pesos oscila entre 4,00 GB (MLX 4-bit) y 7,69 GB (Q8_0 GGUF), a lo que hay que sumar el text encoder (9,35 GB en INT8 o 17,53 GB en BF16) y el VAE (0,68 GB).
- GPU recomendadas: no se especifican modelos concretos (A100, H100, RTX 4090, etc.) en la información disponible.
- Cabe en GPU de consumo: sí, previsiblemente con las variantes Q4_K_M (4,42 GB), Q4_0 (4,13 GB) y NVFP4 (4,20 GB), así como las MLX de 4 y 6 bits; el autor recomienda empezar por Q4_K_M para GGUF o INT8 ConvRot para safetensors.
- Opciones de despliegue: ComfyUI (GGUF y safetensors), stable-diffusion.cpp (GGUF y safetensors compatibles), MLX/MFLUX (variantes MLX), y la plantilla oficial de ComfyUI "Qwen Image 2.1 Turbo — Text to Image".
- Latencia y throughput: 10-20 segundos por imagen de 1024 × 1024 en GPU tras el calentamiento, con Euler, CFG 1.0, 8 pasos y batch 1; no se proporcionan cifras de throughput por segundo.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos de la misma categoría, por lo que no es posible establecer una comparación rigurosa sin inventar cifras.

## Limitaciones y advertencias

- Licencia qwen-research: no es una licencia permisiva; el uso comercial puede estar restringido o sujeto a condiciones adicionales del modelo base Qwen. Verificar los términos antes de cualquier despliegue en producción.
- Repositorio de terceros: los pesos originales pertenecen a Qwen; este repositorio es una cuantización no oficial (autor chilozk1022), por lo que la calidad de las conversiones no está garantizada por el equipo original.
- Ausencia de filtro de seguridad: el modelo base no incorpora content checker ni filtro de contenido, lo que traslada al operador la responsabilidad legal y ética sobre las imágenes generadas.
- Riesgo de sesgos y alucinación visual: no se documentan evaluaciones de sesgo ni métricas de fidelidad prompt-imagen; como todo modelo generativo, puede producir contenido estereotipado o inexacto respecto a la descripción.
- Idiomas soportados no disponibles: no se especifica qué lenguas acepta el text encoder para los prompts, lo que limita la planificación multilingüe.
- Longitud de contexto no disponible: se desconoce la longitud máxima de prompt admitida.
- Sin benchmarks publicados: no hay datos numéricos que permitan comparar la calidad de las distintas cuantizaciones frente al modelo original ni frente a alternativas.
- Tamaño del repositorio elevado (91,4 GB): la descarga completa incluye todas las variantes y componentes auxiliares; conviene descargar únicamente los archivos necesarios.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/chilozk1022/Qwen-Image-2.1-Turbo-Quantized
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1-Turbo
- ComfyUI: https://github.com/Comfy-Org/ComfyUI
- Plantilla oficial de ComfyUI (workflow JSON): https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_qwen_image_2_1_turbo_t2i.json
- GitHub del autor del repositorio: https://github.com/abenzerps
- Formulario de solicitud de modelos del autor: https://abenzerps.com/request-a-model/
