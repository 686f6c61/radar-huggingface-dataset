# chtk/chua-dl-models

## Resumen

El modelo `chtk/chua-dl-models` es un repositorio que aloja los pesos de **Z-Image-Turbo**, un modelo de generación de imágenes de texto a imagen basado en arquitectura DiT (Diffusion Transformer) de 12 mil millones de parámetros, junto con su codificador de texto Qwen3-4B y un VAE. El autor, `chtk`, ha preparado una versión cuantizada en formato GGUF (Q4_0 para el DiT y Q4_K_M para el codificador) específicamente para permitir su ejecución en GPUs de consumo con poca memoria de vídeo, como la GTX 1650 de 4 GB.

La relevancia de este modelo radica en su capacidad para funcionar en hardware modesto mediante cuantización y técnicas de offloading a CPU, lo que democratiza el acceso a la generación de imágenes de alta calidad sin necesidad de GPUs profesionales. Está diseñado para usarse con `stable-diffusion.cpp`, una implementación ligera de inferencia de difusión, y ofrece tiempos de generación razonables (unos 51 segundos para 256×256 con 8 pasos en una GTX 1650). El repositorio incluye también los archivos en safetensors para el VAE, lo que facilita su integración en pipelines existentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) para el modelo principal; Qwen3-4B como text encoder; VAE estándar |
| Parametros totales | 12B (según la model card); el repo contiene 6.154.908.736 parámetros en safetensors (probablemente solo el VAE) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de difusión, no de lenguaje) |
| Tipos de cuantizacion | Q4_0 (GGUF) para el DiT; Q4_K_M (GGUF) para el text encoder; safetensors para el VAE |
| Idiomas soportados | No disponible (probablemente inglés y chino, pero no se especifica) |
| Licencia | No disponible |
| Formato de pesos | GGUF (DiT y text encoder), safetensors (VAE) |

## Arquitectura y entrenamiento

La arquitectura principal es un **Diffusion Transformer (DiT)** de 12B parámetros, que procesa el texto mediante un codificador Qwen3-4B (también cuantizado) y genera imágenes a través de un proceso de difusión en el espacio latente. El VAE se encarga de decodificar las latentes a píxeles. No se dispone de información sobre el dataset de entrenamiento, el número de tokens procesados ni las técnicas de alineación (RLHF, DPO, etc.). La innovación principal de esta versión es la cuantización GGUF, que reduce drásticamente el uso de VRAM y permite el offloading de capas a CPU, manteniendo una calidad aceptable con solo 8 pasos de inferencia y un CFG scale de 1.0.

## Capacidades

- Generación de imágenes a partir de prompts de texto en resoluciones de hasta 256×256 (y superiores si la VRAM lo permite).
- Funcionamiento con pocos pasos de difusión (8 pasos) gracias a la configuración de CFG scale 1.0.
- Ejecución en GPUs de baja VRAM (4 GB) mediante cuantización Q4_0 y offloading a CPU.
- Soporte para tiling de VAE y atención con flash attention (`--diffusion-fa`), lo que optimiza el uso de memoria.
- Integración con `stable-diffusion.cpp`, permitiendo uso desde línea de comandos.
- Capacidad de generar imágenes en resoluciones mayores si se dispone de más VRAM (el límite está en los picos de activación de atención).

## Casos de uso

- **Generación de imágenes en equipos de gama baja**: ideal para usuarios con GPUs de 4 GB (como GTX 1650) que desean probar modelos de difusión sin invertir en hardware caro. Se puede ejecutar con el comando proporcionado, ajustando la resolución a 256×256.
- **Prototipado rápido de conceptos visuales**: diseñadores y artistas pueden generar bocetos o ideas preliminares en segundos, gracias a los 8 pasos de inferencia y la baja latencia en hardware modesto.
- **Despliegue en entornos sin GPU dedicada**: mediante el offloading a CPU, el modelo puede ejecutarse en sistemas con poca VRAM, aunque con tiempos mayores. Útil para servidores de bajo coste o portátiles.
- **Investigación en cuantización de modelos de difusión**: sirve como ejemplo práctico de cómo cuantizar un DiT de 12B a GGUF y ejecutarlo con herramientas open source, lo que puede inspirar optimizaciones similares.
- **Generación de imágenes para contenido educativo**: profesores o creadores de materiales pueden generar ilustraciones simples sin depender de servicios en la nube, manteniendo la privacidad de los datos.
- **Pruebas de integración con stable-diffusion.cpp**: desarrolladores que trabajan en esta librería pueden usar este modelo como caso de prueba para validar compatibilidad y rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única métrica de rendimiento reportada es la generación de una imagen de 256×256 con 8 pasos en una GTX 1650 4GB, que tarda aproximadamente 51 segundos. No hay comparaciones con otros modelos de difusión.

## Requisitos de hardware

- **VRAM mínima**: 4 GB (probado en GTX 1650). Con esta cantidad, la resolución máxima práctica es 256×256; resoluciones de 512 o superiores superan el pico de activación de atención.
- **GPU recomendadas**: cualquier GPU con al menos 4 GB de VRAM y soporte para CUDA. Para resoluciones mayores se necesitan GPUs con 8 GB o más (por ejemplo, RTX 3060, RTX 4060, etc.).
- **Opciones de despliegue**: `stable-diffusion.cpp` (línea de comandos), con soporte para offloading a CPU (`--offload-to-cpu`), limitación de VRAM (`--max-vram`), streaming de capas (`--stream-layers`) y tiling de VAE.
- **Latencia y throughput**: en GTX 1650 4GB, ~51 segundos por imagen a 256×256 con 8 pasos. En GPUs más potentes, el tiempo se reduce proporcionalmente.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros modelos de difusión (como SDXL, Flux, etc.) en términos de rendimiento o calidad. El modelo se presenta como una opción cuantizada para hardware de bajos recursos, pero no hay datos objetivos de comparación.

## Limitaciones y advertencias

- **Resolución limitada en GPUs de 4 GB**: la generación a 512×512 o superior no es posible en hardware de 4 GB debido a los picos de memoria de atención.
- **Calidad de imagen potencialmente reducida**: la cuantización Q4_0 puede degradar la fidelidad de la imagen en comparación con el modelo original sin cuantizar.
- **Licencia desconocida**: no se especifica la licencia del modelo, lo que impide conocer las restricciones de uso comercial o modificación.
- **Riesgo de alucinaciones visuales**: como cualquier modelo de difusión, puede generar objetos o escenas que no corresponden fielmente al prompt, especialmente con prompts ambiguos.
- **Dependencia de herramientas específicas**: el modelo está optimizado para `stable-diffusion.cpp`; su uso con otras librerías (como diffusers) puede requerir conversiones adicionales y no está garantizado.
- **Idiomas no documentados**: aunque el text encoder Qwen3-4B soporta múltiples idiomas, no se ha verificado el rendimiento en español u otros idiomas distintos del chino/inglés.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/chtk/chua-dl-models
- Descarga del DiT cuantizado (GGUF): https://huggingface.co/chtk/chua-dl-models/resolve/main/z-image-turbo/diffusion_models/z_image_turbo-Q4_0.gguf
- Descarga del text encoder (GGUF): https://huggingface.co/chtk/chua-dl-models/resolve/main/z-image-turbo/text_encoders/Qwen3-4B-Q4_K_M.gguf
- Descarga del VAE (safetensors): https://huggingface.co/chtk/chua-dl-models/resolve/main/z-image-turbo/vae/diffusion_pytorch_model.safetensors
