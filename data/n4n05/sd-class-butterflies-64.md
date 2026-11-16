# n4n05/sd-class-butterflies-64

## Resumen

`n4n05/sd-class-butterflies-64` es un modelo de difusión para generación incondicional de imágenes de mariposas, publicado por el usuario n4n05 en Hugging Face. Se trata de un artefacto educativo derivado de la Unidad 1 del curso "Diffusion Models Class" de Hugging Face, cuyo objetivo es ilustrar el entrenamiento de un modelo de difusión desde cero sobre un conjunto de datos pequeño y específico (imágenes de mariposas de 64x64 píxeles).

El modelo no está pensado para uso en producción ni para generación de imágenes general. Su relevancia es exclusivamente didáctica: sirve como referencia mínima funcional de un pipeline `DDPMPipeline` de la librería diffusers, con un total de 18.536.323 parámetros y un tamaño de repositorio de 0,1 GB, lo que lo hace extremadamente ligero y fácil de ejecutar incluso en hardware modesto.

Al ser un modelo incondicional, no acepta prompts de texto ni de imagen: genera muestras aleatorias del dominio de mariposas aprendido durante el entrenamiento. No dispone de benchmarks publicados, no soporta instrucciones y su licencia MIT permite reutilización sin restricciones, aunque con las limitaciones propias de un modelo de juguete.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión (DDPM) sobre U-Net, pipeline `DDPMPipeline` de diffusers |
| Parametros totales | 18.536.323 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; modelo de imagen, no de texto) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/ONNX) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | MIT |
| Formato de pesos | safetensors (librería diffusers, framework PyTorch) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura estándar de los modelos de difusión denoising (DDPM) implementada en la librería diffusers: una red U-Net que aprende a predecir el ruido añadido a una imagen en cada paso del proceso de difusión, junto con un scheduler (en este caso, el pipeline por defecto `DDPMPipeline`). La generación se realiza partiendo de ruido gaussiano puro y aplicando iterativamente el proceso inverso de denoising.

El entrenamiento se corresponde con la Unidad 1 del curso de Diffusion Models de Hugging Face, que utiliza el dataset `huggan/smithsonian_butterflies_subset` (imágenes de mariposas a 64x64 píxeles). No se dispone de información sobre el número exacto de pasos de entrenamiento, el tamaño del batch, la composición detallada del dataset ni si se aplicaron técnicas de guiado condicional, RLHF o fine-tuning adicional. Por la naturaleza del curso, se trata de un entrenamiento corto y de baja resolución, orientado a demostrar el funcionamiento del pipeline más que a maximizar la calidad de las muestras.

No se documentan innovaciones técnicas destacables (atención lineal, decodificación especulativa, arquitecturas híbridas, etc.). El modelo es deliberadamente simple y canónico.

## Capacidades

- Generación incondicional de imágenes de mariposas a 64x64 píxeles mediante muestreo desde ruido gaussiano.
- Integración directa con la librería `diffusers` a través de `DDPMPipeline.from_pretrained(...)`.
- Ejecución en CPU y GPU sin requisitos de memoria significativos (modelo de ~18,5 M de parámetros).
- No soporta prompts de texto, image-to-image, inpainting, controlnet ni condicionamiento de ningún tipo.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni procesamiento de lenguaje natural.
- No dispone de modo "thinking", visión, audio ni otras modalidades.

## Casos de uso

- Docencia y aprendizaje de modelos de difusión: sirve como ejemplo mínimo reproducible para que estudiantes ejecuten un `DDPMPipeline` completo y observen el proceso de generación desde ruido hasta imagen.
- Pruebas de integración de la librería diffusers: útil para verificar que el entorno (versiones de PyTorch, CUDA, diffusers) funciona correctamente antes de cargar modelos más grandes.
- Prototipado de pipelines de generación de imágenes: permite ensayar código de carga, muestreo y guardado de imágenes sin coste computacional apreciable.
- Benchmarking de infraestructura ligera: al ser un modelo de 0,1 GB, sirve para medir latencia de arranque y throughput en entornos con recursos limitados (CI, contenedores pequeños, Raspberry Pi).
- Experimentos de fine-tuning sobre dominios pequeños: el modelo puede servir como punto de partida para reentrenar sobre un dataset propio de imágenes de 64x64, siguiendo el cuaderno del curso.
- Demostraciones educativas de sesgo y limitaciones: permite ilustrar de forma controlada cómo un modelo entrenado con un dataset muy específico solo genera muestras de ese dominio y falla fuera de él.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (18,5 M de parámetros, ~74 MB de pesos más activaciones intermedias de la U-Net a 64x64).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona sin problemas en GTX 1050, RTX 3050, RTX 4090, A100 o H100.
- Cabe holgadamente en cualquier GPU de consumo e incluso en CPU; no requiere GPU dedicada.
- Opciones de despliegue: `diffusers` con PyTorch (CPU o CUDA), script de inferencia estándar del `DDPMPipeline`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a modelos de difusión de imagen en este formato).
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo, se espera inferencia en el orden de décimas de segundo a pocos segundos por imagen en GPU moderna, pero no se aportan cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| n4n05/sd-class-butterflies-64 | 18,5 M | 64x64 px | Difusion incondicional (mariposas) | MIT | Hugging Face |
| google/ddpm-cifar10-32 | ~35,7 M (U-Net DDPM) | 32x32 px | Difusion incondicional (CIFAR-10) | Apache 2.0 | Hugging Face |
| google/ddpm-celebahq-256 | ~113 M (U-Net DDPM) | 256x256 px | Difusion incondicional (caras) | Apache 2.0 | Hugging Face |
| hf-internal-testing/ddpm-ema-butterflies-64 | no disponible | 64x64 px | Difusion incondicional (mariposas) | no disponible | Hugging Face |

Los modelos comparables son otros DDPM de referencia publicados por Google o por Hugging Face para tareas de difusión incondicional. La comparación directa de rendimiento no es posible porque no se han publicado métricas (FID, IS) para este modelo en la información disponible.

## Limitaciones y advertencias

- Modelo de juguete educativo: no está diseñado ni validado para uso en producción.
- Solo genera imágenes de mariposas a 64x64 píxeles; cualquier intento de generar otros dominios producirá resultados sin sentido.
- No acepta prompts ni condicionamiento: no se puede controlar el contenido, el estilo ni la composición de la salida.
- Riesgo elevado de artefactos y baja fidelidad visual por el entrenamiento corto y la baja resolución.
- Sesgos del dataset: el modelo reproduce únicamente la distribución del subconjunto de mariposas del Smithsonian usado en el curso; no representa la diversidad de imágenes reales.
- No aplica el concepto de alucinación lingüística, pero sí puede producir muestras plausibles pero no reales de mariposas (especies inexistentes, morfologías incorrectas).
- Licencia MIT: permite uso comercial y modificación sin restricciones, pero el autor no ofrece garantías de ningún tipo.
- No se documentan limitaciones de idioma porque el modelo no procesa texto.
- Para producción real de imágenes se recomienda usar modelos de difusión condicionales (Stable Diffusion, SDXL, Flux) con licencias y benchmarks verificables.

## Enlaces

- Hugging Face: https://huggingface.co/n4n05/sd-class-butterflies-64
- Curso Diffusion Models Class (Hugging Face): https://github.com/huggingface/diffusion-models-class
- Documentación de `DDPMPipeline`: https://huggingface.co/docs/diffusers/api/pipelines/ddpm
- Librería diffusers: https://github.com/huggingface/diffusers
- Dataset de mariposas del Smithsonian (referencia del curso): https://huggingface.co/datasets/huggan/smithsonian_butterflies_subset
