# adimunot/diffusion-from-scratch

## Resumen

`adimunot/diffusion-from-scratch` es un repositorio de checkpoints entrenados de un modelo de difusión denoising (DDPM/DDIM) implementado desde cero en PyTorch, sin depender de la librería `diffusers`. El autor, adimunot, publica los pesos de tres variantes: una para MNIST incondicional (9,53 millones de parámetros) y dos para CIFAR-10 (una incondicional y otra condicional por clase, ambas con 46,03 millones de parámetros). El objetivo del proyecto es didáctico: demostrar el funcionamiento completo de un modelo de difusión —proceso forward, schedule de ruido, U-Net denoising, samplers y guía sin clasificador— a partir de las matemáticas subyacentes.

La relevancia actual radica en que estos checkpoints permiten a desarrolladores e investigadores estudiar la implementación interna de los modelos de difusión sin la abstracción de las bibliotecas de alto nivel. Al ser modelos pequeños y con licencia MIT, son ideales para experimentación en entornos educativos, análisis de schedules de ruido, comparación de estrategias de muestreo y comprensión de la guía sin clasificador. No son modelos competitivos en calidad de generación (los FID auto-reportados son altos), pero sí constituyen un recurso valioso para el aprendizaje y la investigación reproducible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net (DDPM/DDIM) |
| Parametros totales | 9,53 M (MNIST), 46,03 M (CIFAR-10) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (imagen) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (state_dicts) |

## Arquitectura y entrenamiento

Los tres modelos comparten una arquitectura U-Net con canales `[128, 256, 256, 512]`, dos bloques residuales por nivel y self-attention de 4 cabezas en las dos resoluciones intermedias. El modelo condicional de CIFAR-10 incorpora guía sin clasificador con `uncond_prob=0.1` y 10 clases. El proceso de difusión utiliza schedules lineales (MNIST) y coseno (CIFAR-10) con T=1000 pasos. El entrenamiento se realizó en una sola GPU durante 50 épocas (MNIST) y 100 épocas (CIFAR-10), con pérdida final de entrenamiento de 0.0210 y 0.0547/0.0557 respectivamente. Se aplicó decaimiento exponencial de medias móviles (EMA) con `ema_decay=0.9999`; los pesos EMA se recomiendan para el muestreo. No se utilizó RLHF ni DPO, al ser un modelo generativo de imágenes.

## Capacidades

- Generación de imágenes incondicional: puede sintetizar muestras de MNIST (dígitos manuscritos) y CIFAR-10 (objetos de 10 clases) a partir de ruido gaussiano puro.
- Generación condicional por clase: el modelo `cifar10_cond` genera imágenes de una clase específica (avión, coche, pájaro, etc.) mediante guía sin clasificador.
- Implementación de referencia: los checkpoints son state_dicts de la clase `UNet` del repositorio fuente, lo que permite inspeccionar y modificar cada componente (forward process, noise schedule, samplers) sin dependencias externas.
- Soporte de muestreo DDPM y DDIM: el repositorio incluye ambos samplers, permitiendo comparar la calidad y velocidad de cada método.
- No dispone de tool calling, capacidades multimodales, ni soporte de agentes, al ser un modelo puramente generativo de imágenes.

## Casos de uso

- Aprendizaje de modelos de difusión: estudiantes e investigadores pueden cargar estos pesos para estudiar el flujo completo de entrenamiento e inferencia, desde el proceso forward hasta el muestreo, sin la complejidad de un framework como `diffusers`.
- Comparación de schedules de ruido: al tener un modelo con schedule lineal (MNIST) y otro con coseno (CIFAR-10), se pueden analizar los efectos de cada schedule en la calidad de generación y la velocidad de convergencia.
- Estudio de la guía sin clasificador: el modelo condicional de CIFAR-10 permite experimentar con diferentes valores de `uncond_prob` y escalas de guía para observar su impacto en la diversidad y fidelidad de las muestras.
- Evaluación de métricas de calidad: los FID auto-reportados sirven como referencia para reproducir el pipeline de evaluación y comparar con otras implementaciones de DDPM en los mismos conjuntos de datos.
- Desarrollo de variantes arquitectónicas: al ser un U-Net estándar, se puede modificar la arquitectura (número de canales, bloques, atención) y reentrenar o ajustar los pesos para investigar mejoras.
- Demostraciones educativas: el modelo puede integrarse en notebooks o cursos para ilustrar visualmente el proceso de denoising paso a paso, mostrando cómo el ruido se transforma en imágenes coherentes.

## Benchmarks y rendimiento

Los valores de FID fueron calculados durante la fase de evaluación del proyecto y son auto-reportados por el autor. No se han publicado comparaciones con otros modelos en la información disponible.

| Modelo | FID |
|---|---|
| MNIST (incondicional) | 34.1 |
| CIFAR-10 (incondicional) | 71.2 |
| CIFAR-10 (condicional) | 65.3 |

Estos números reflejan modelos pequeños entrenados con un presupuesto limitado (100 épocas máximo) y no son competitivos frente a modelos de difusión de última generación. Se recomienda tratarlos como referencia interna del repositorio.

## Requisitos de hardware

No se especifican requisitos oficiales de hardware en la documentación. Dado el tamaño de los parámetros (9,53 M y 46,03 M), los modelos son ligeros y pueden ejecutarse en GPUs de consumo con poca VRAM. Una estimación razonable, basada en el tamaño de los pesos (0,8 GB en total para los tres checkpoints), sugiere que cada modelo individual requiere menos de 1 GB de VRAM en precisión FP32, por lo que caben en GPUs como NVIDIA GTX 1060, RTX 2060 o superiores. Para el entrenamiento desde cero, se necesitaría una GPU con al menos 4-6 GB de VRAM, aunque no hay datos oficiales. Las opciones de despliegue incluyen PyTorch nativo, ya que los pesos son state_dicts; no se menciona compatibilidad con vLLM, llama.cpp u Ollama, al ser un modelo de visión.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Dado que se trata de un proyecto educativo de implementación desde cero, no se han publicado comparaciones con otros DDPM de referencia (como los del paper original de Ho et al. o implementaciones de `diffusers`). Por tanto, esta sección se considera no disponible.

## Limitaciones y advertencias

- Modelos de proyecto de aprendizaje: el propio autor indica que no son baselines competitivos; los FID altos (65-71 en CIFAR-10) reflejan el tamaño reducido y el presupuesto de entrenamiento limitado.
- No son pipelines de `diffusers`: los checkpoints son state_dicts de la clase `UNet` del repositorio fuente. Para usarlos, es necesario construir el modelo desde el código del repositorio y cargar los pesos manualmente, no se pueden cargar directamente con `DiffusionPipeline.from_pretrained`.
- Sesgos y alucinaciones: al ser modelos generativos de imágenes, pueden producir artefactos o muestras poco realistas, especialmente en clases con pocos ejemplos. No se han documentado sesgos específicos, pero los conjuntos de datos MNIST y CIFAR-10 tienen limitaciones inherentes de diversidad.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías sobre el rendimiento en producción.
- Fecha de creación futura: el repositorio fue creado en agosto de 2026, lo que puede indicar que es un proyecto reciente o con una fecha de publicación inusual; se recomienda verificar la vigencia del código fuente.

## Enlaces

- [HuggingFace - adimunot/diffusion-from-scratch](https://huggingface.co/adimunot/diffusion-from-scratch)
- [GitHub - adimunot21/diffusion-from-scratch](https://github.com/adimunot21/diffusion-from-scratch)
- [Curso de Diffusion Models de Hugging Face (contexto general)](https://huggingface.co/learn/diffusion-course/en/unit1/3)
