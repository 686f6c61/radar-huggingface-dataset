# EmanHassan26/ddpm-celebahq-finetuned-vintage

## Resumen

El modelo `EmanHassan26/ddpm-celebahq-finetuned-vintage` es un modelo de difusión de imágenes incondicional, basado en la arquitectura DDPM (Denoising Diffusion Probabilistic Models), que ha sido ajustado sobre el dataset CelebA-HQ para generar retratos faciales con estética vintage. El autor, EmanHassan26, lo publicó como parte del material de la unidad 2 de la clase de modelos de difusión de Hugging Face (Diffusion Models Class), con fines educativos y de demostración.

El modelo parte del checkpoint preentrenado `google/ddpm-celebahq-256` y ha sido fine-tuneado con imágenes de rostros vintage. Es capaz de generar imágenes de 256×256 píxeles de caras con un aspecto retro, sin necesidad de condicionamiento por texto. Su relevancia radica en servir como ejemplo práctico de ajuste fino de modelos de difusión para una tarea concreta de generación de imágenes, y como base para experimentos en estilización de rostros. El repositorio tiene un tamaño de 0,5 GB y los pesos están disponibles en formato safetensors, con un total de 113.673.219 parámetros.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DDPM (Denoising Diffusion Probabilistic Models) |
| Parámetros totales | 113.673.219 |
| Parámetros activos | no aplicable (no es MoE) |
| Longitud de contexto | no aplicable (modelo de imágenes) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplicable (modelo de imágenes) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura DDPM original de Ho et al. (2020), que define un proceso de difusión hacia adelante que añade ruido gaussiano a la imagen y un proceso inverso que aprende a denoising. El checkpoint base es `google/ddpm-celebahq-256`, que ya está entrenado en el dataset CelebA-HQ de 256×256 píxeles. Sobre este modelo base se realizó un ajuste fino con imágenes de rostros vintage, probablemente durante un número reducido de épocas (no se especifica el número exacto en la model card). El entrenamiento se realizó con el framework `diffusers` de Hugging Face, y el modelo se publica como una pipeline `DDPMPipeline` para generación incondicional. No se menciona el uso de técnicas avanzadas como RLHF o DPO, ni datos sobre la composición del dataset de fine-tuning más allá de que se trata de imágenes vintage de caras.

## Capacidades

- Generación de imágenes incondicionales de 256×256 píxeles, específicamente retratos faciales con estilo vintage.
- Proceso de denoising en 50 pasos (según la evolución mostrada en modelos similares), que parte de ruido puro y converge a una imagen final.
- Capacidad de producir variaciones de rostros con estética retro, útil para experimentos de estilización y arte generativo.
- Integración sencilla con la librería `diffusers` mediante `DDPMPipeline.from_pretrained`.
- No soporta condicionamiento por texto ni por clase; la generación es totalmente aleatoria y no controlable por prompt.

## Casos de uso

- Creación de retratos con estilo vintage para proyectos de diseño gráfico o ilustración: el modelo genera directamente imágenes de caras con apariencia antigua, útil para ambientar piezas visuales o campañas nostálgicas.
- Investigación en modelos de difusión: sirve como ejemplo didáctico para entender cómo se hace un fine-tuning de un DDPM sobre un dataset específico y cómo evaluar la calidad de las muestras generadas.
- Generación de avatares retro para redes sociales o juegos: se pueden producir avatares faciales con estética de época, aunque sin control fino de rasgos.
- Aumento de datos en tareas de visión por computador: las imágenes generadas pueden usarse como datos sintéticos para entrenar clasificadores o detectores de rostros con variación estilística.
- Demostraciones interactivas de modelos de difusión: al ser una pipeline sencilla, es fácil de integrar en aplicaciones web o notebooks para mostrar el proceso de generación paso a paso.
- Exploración de la capacidad de generalización de DDPM: al estar fine-tuneado sobre un estilo concreto, permite estudiar cómo el modelo adapta sus representaciones internas a un dominio visual específico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos objetivos de calidad como FID, IS o comparaciones con otros modelos. El autor no ha reportado métricas de rendimiento ni comparativas en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, pero al ser un modelo de 113 millones de parámetros con generación de imágenes 256×256, la inferencia es ligera. Se estima que requiere menos de 2 GB de VRAM en FP32 para la generación de una imagen, y puede caber en GPUs consumer de 4 GB o más.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, por ejemplo NVIDIA GTX 1650, RTX 2060, RTX 3060, RTX 3090, o GPUs de datacenter como A100 o H100.
- Sí cabe en GPU consumer, siempre que se use el pipeline de `diffusers` con precisión FP16 si se desea reducir uso de memoria.
- Opciones de despliegue: se puede ejecutar con `diffusers` (Python), también se puede exportar a ONNX o usar `torch.compile` para optimizar. No hay soporte oficial para llama.cpp o vLLM (modelo de imagen).
- Latencia y throughput estimados: no se dispone de mediciones oficiales. En una GPU moderna como RTX 4090, la generación de una imagen de 256×256 con 20 pasos de denoising suele tardar menos de 1 segundo.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| google/ddpm-celebahq-256 | DDPM | 113.6 M | 256×256 | Apache 2.0 | Hugging Face |
| EmanHassan26/ddpm-celebahq-finetuned-vintage | DDPM | 113.6 M | 256×256 | MIT | Hugging Face |
| naifenn/ddpm-celebahq-finetuned-vintage-face-2epochs | DDPM | 113.6 M | 256×256 | MIT | Hugging Face |
| lilili696969/ddpm-celebahq-finetuned-Vintage-Faces-FFHQAligned-2epochs | DDPM | 113.6 M | 256×256 | MIT | Hugging Face |

La diferencia principal entre estos modelos es el dataset de fine-tuning y el número de épocas. El modelo de EmanHassan26 es una versión más genérica, mientras que los otros dos se especializan en rostros vintage con 2 épocas de entrenamiento. Todos usan la misma arquitectura base y tamaño de parámetros.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo hereda los sesgos del dataset CelebA-HQ, que está compuesto mayoritariamente por rostros de celebridades occidentales, por lo que la diversidad étnica y de edad es limitada. El fine-tuning vintage puede acentuar ciertos rasgos estéticos.
- Riesgo de alucinación: en el contexto de imágenes, el modelo puede generar artefactos visuales o deformidades faciales en muestras poco frecuentes, especialmente si se ejecutan pocos pasos de denoising.
- Limitaciones de contexto o idioma: no aplica, es un modelo de imagen sin texto.
- Restricciones de licencia: la licencia MIT permite uso comercial y modificación, pero no se garantiza la ausencia de derechos de autor sobre las imágenes generadas si se utilizan con fines comerciales.
- Caveat importante para producción: no se ha validado la calidad de las imágenes en un entorno de producción. La generación es incondicional, por lo que no se puede controlar la identidad, expresión ni composición de la cara. Para aplicaciones que requieran control, se necesitaría un modelo condicional (text-to-image o class-conditioned).
- El modelo es un ejemplo didáctico y no está optimizado para una producción a gran escala; el tiempo de generación puede ser alto en hardware sin GPU.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/EmanHassan26/ddpm-celebahq-finetuned-vintage
- Modelo base: https://huggingface.co/google/ddpm-celebahq-256
- Clase de modelos de difusión de Hugging Face: https://github.com/huggingface/diffusion-models-class
- Modelo similar fine-tuneado (2 epochs): https://huggingface.co/naifenn/ddpm-celebahq-finetuned-vintage-face-2epochs
- Modelo similar fine-tuneado (FFHQAligned): https://huggingface.co/lilili696969/ddpm-celebahq-finetuned-Vintage-Faces-FFHQAligned-2epochs
- Demo en Bytez (otro modelo similar): https://bytez.com/model/Imilion/ddpm-celebahq-finetuned-vintageface
- Repo con post-entrenamiento por RL de DDPM sobre CelebA-HQ: https://github.com/alcazar90/ddpo-celebahq
