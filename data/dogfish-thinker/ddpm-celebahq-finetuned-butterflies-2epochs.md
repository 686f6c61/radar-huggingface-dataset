# dogfish-thinker/ddpm-celebahq-finetuned-butterflies-2epochs

## Resumen

El modelo `dogfish-thinker/ddpm-celebahq-finetuned-butterflies-2epochs` es un modelo de generación de imágenes incondicional basado en la arquitectura DDPM (Denoising Diffusion Probabilistic Models). Fue desarrollado por el usuario dogfish-thinker como parte del curso "Diffusion Models Class" de Hugging Face, y consiste en un ajuste fino de dos épocas sobre un modelo preentrenado en CelebA-HQ, utilizando un dataset de imágenes de mariposas. El resultado es un generador capaz de producir imágenes sintéticas de mariposas de alta resolución, aunque con una calidad limitada debido al corto entrenamiento.

Este modelo resuelve el problema de la generación de imágenes incondicionales mediante un proceso de difusión que aprende a revertir el ruido añadido a las imágenes. Su relevancia radica en ser un ejemplo didáctico de cómo fine-tunear un modelo de difusión preentrenado sobre un dominio específico, demostrando el flujo de trabajo con la librería `diffusers`. Con aproximadamente 113,7 millones de parámetros y un tamaño de repositorio de 1,4 GB, es un modelo ligero que puede ejecutarse en GPUs de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DDPM (Denoising Diffusion Probabilistic Models) |
| Parametros totales | 113.673.219 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (generacion de imagenes) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de imagen) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura DDPM, un proceso de difusión en el que se añade ruido gaussiano progresivamente a las imágenes durante el entrenamiento y el modelo aprende a denoising paso a paso para reconstruir la imagen original. La implementación se basa en la clase `DDPMPipeline` de la librería `diffusers`, que encapsula el proceso de muestreo. El entrenamiento se realizó en dos fases: primero un preentrenamiento sobre el dataset CelebA-HQ (imágenes de caras), y posteriormente un fine-tuning de dos épocas sobre un dataset de imágenes de mariposas. No se dispone de información sobre el número exacto de imágenes de entrenamiento, la configuración de hiperparámetros (tasa de aprendizaje, batch size, scheduler) ni sobre el uso de técnicas adicionales como clasifier-free guidance o sampling acelerado. El modelo se distribuye con pesos en formato safetensors.

## Capacidades

- Generacion de imagenes incondicionales: produce imagenes sinteticas de mariposas de 256x256 píxeles (tamaño estándar de CelebA-HQ) mediante el pipeline `DDPMPipeline`.
- Fine-tuning sobre dominio especifico: demuestra la capacidad de adaptar un modelo preentrenado en un dominio (caras) a otro (mariposas) con pocas épocas.
- Reproducibilidad: al ser un modelo educativo, su código de entrenamiento es accesible y permite replicar el proceso.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multimodales más allá de la generación de imágenes.

## Casos de uso

- Educacion y aprendizaje de modelos de difusion: sirve como ejemplo práctico para entender el fine-tuning de DDPM con `diffusers`, ideal para cursos y talleres.
- Generacion de contenido artistico: permite crear imágenes de mariposas sintéticas para proyectos de diseño gráfico, ilustración o arte generativo, aunque con calidad limitada.
- Prototipado rapido: útil para validar pipelines de generación de imágenes en entornos de investigación antes de escalar a modelos más grandes.
- Aumento de datos: puede generar variaciones sintéticas de mariposas para complementar datasets de entrenamiento en tareas de clasificación o detección de objetos, siempre que se valide la calidad.
- Demo interactiva: integrable en aplicaciones web o notebooks para mostrar generación de imágenes en tiempo real con una GPU modesta.
- Investigacion en diffusion models: permite estudiar el comportamiento de la difusión en dominios pequeños y los efectos del fine-tuning con pocos datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay métricas como FID, IS o comparaciones con otros modelos en la model card ni en los resultados de búsqueda.

## Requisitos de hardware

- VRAM estimada para inferencia: con 113,7 millones de parámetros, el modelo en FP32 ocupa aproximadamente 455 MB de memoria. En FP16, unos 228 MB. La inferencia con `diffusers` requiere además memoria para el scheduler y las imágenes intermedias, por lo que se estima un consumo total de 1-2 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente, por ejemplo NVIDIA GTX 1650, RTX 2060, RTX 3060, o incluso GPUs integradas con suficiente memoria compartida.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de gama media y baja, así como en Apple Silicon (M1/M2) mediante PyTorch MPS.
- Opciones de despliegue: se puede ejecutar con la librería `diffusers` en Python, o exportar a ONNX para inferencia optimizada. No se ha documentado soporte para vLLM, llama.cpp u Ollama, ya que es un modelo de imagen.
- Latencia y throughput: no se dispone de datos medidos. Para una imagen de 256x256 con 50 pasos de denoising, se estima un tiempo de generación de 5-15 segundos en una GPU consumer media, dependiendo del hardware y del scheduler.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (DDPM fine-tuneado sobre mariposas). Se podría comparar con el modelo base `google/ddpm-celebahq-256` (del que deriva), pero no se han publicado métricas de este fine-tuning. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Calidad limitada: al ser un fine-tuning de solo dos épocas, las imágenes generadas pueden presentar artefactos, deformaciones o falta de fidelidad respecto a mariposas reales.
- Sesgos del dataset: el preentrenamiento en CelebA-HQ introduce sesgos en la distribución de imágenes (caras humanas), que pueden influir en la generación de mariposas (por ejemplo, texturas o colores inusuales).
- Riesgo de alucinacion visual: como todo modelo generativo, puede producir imágenes que no corresponden a mariposas reales o que mezclan características de forma incoherente.
- Sin control condicional: el modelo es incondicional, por lo que no permite especificar atributos (color, especie, fondo) en la generación.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías sobre la calidad o seguridad del modelo.
- No apto para producción crítica: es un modelo educativo; para aplicaciones comerciales serias se recomienda usar modelos más robustos y evaluados como Stable Diffusion o DALL-E.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/dogfish-thinker/ddpm-celebahq-finetuned-butterflies-2epochs)
- [Perfil del autor en Hugging Face](https://huggingface.co/dogfish-thinker/models)
- [Descripción en AIBase](https://model.aibase.com/en/models/details/1915694559717384194)
- [Descripción alternativa en AIBase](https://model.aibase.com/models/details/1915705170434088962)
- [Referencia en Toolify](https://www.toolify.ai/ai-model/jsfs11-ddpm-celebahq-finetuned-butterflies-2epochs)
