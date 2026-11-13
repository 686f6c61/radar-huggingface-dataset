# moonbox-dev/BiRefNet-MLX

## Resumen

BiRefNet-MLX es una conversión a MLX del modelo BiRefNet (Bilateral Reference for High-Resolution Dichotomous Image Segmentation), un modelo de segmentación de imágenes especializado en separar primer plano y fondo (background removal) con alta resolución. Lo desarrolla moonbox-dev como port para Apple Silicon, permitiendo ejecutar la inferencia de forma nativa en chips M-series mediante el framework MLX de Apple. El modelo original fue creado por Peng Zheng, Dehong Gao y Deng-Ping Fan, y se publicó con el paper arXiv:2401.03407.

El modelo resuelve la tarea de segmentación dicotómica de imágenes (DIS, Dichotomous Image Segmentation), que consiste en generar una máscara alfa de alta calidad que separa un objeto o sujeto del fondo. A diferencia de otros modelos de segmentación, BiRefNet emplea una arquitectura de referencia bilateral que combina información de alto nivel semántico con detalles de bajo nivel, lo que produce bordes más precisos en objetos finos como pelo, ramas o tejidos.

Esta versión MLX es relevante porque permite ejecutar el modelo en Macs con Apple Silicon sin necesidad de CUDA ni de PyTorch, ofreciendo cinco precisiones distintas (fp16, bf16, 8bit, 6bit y 4bit) con verificación de fidelidad respecto al modelo original en PyTorch. El modelo base usa un backbone Swin-L y procesa imágenes a 1024x1024 píxeles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Swin-L backbone con decodificador ASPP deformable (referencia bilateral) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada 1024x1024) |
| Tipos de cuantizacion | fp16, bf16, 8bit, 6bit, 4bit (cuantización afín MLX, group size 64) |
| Idiomas soportados | no disponible (modelo de segmentación de imágenes) |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX), con config.json y mlx_model.py |

## Arquitectura y entrenamiento

BiRefNet emplea una arquitectura de referencia bilateral basada en un backbone Swin-L (Swin Transformer Large) que opera a resolución completa y media resolución. El decodificador utiliza ASPP (Atrous Spatial Pyramid Pooling) deformable. La innovación principal del modelo original es el mecanismo de referencia bilateral, que utiliza mapas de características de alto nivel como referencia para guiar la extracción de detalles de bajo nivel, mejorando la precisión de los bordes en la segmentación dicotómica de alta resolución.

La conversión a MLX mantiene la configuración original: Swin-L a resolución completa y media, decodificador ASPP deformable, con las BatchNorms plegadas en las convoluciones y la operación `deform_conv2d` de torchvision reescrita en MLX. Las carpetas cuantizadas cuantizan únicamente las capas lineales del Swin (group size 64), mientras que las convoluciones y normas permanecen en bf16. No se dispone de información sobre el dataset de entrenamiento ni sobre el proceso de RLHF/DPO en la información proporcionada.

## Capacidades

- Segmentación dicotómica de imágenes (DIS): genera máscaras alfa de alta calidad para separar primer plano y fondo.
- Background removal de alta resolución: procesa imágenes a 1024x1024 píxeles.
- Generación de recortes (cutouts) con canal alfa: produce imágenes PNG con transparencia.
- Precisión de bordes: el mecanismo de referencia bilateral mejora la delimitación de objetos finos como pelo, ramas o tejidos.
- Ejecución nativa en Apple Silicon mediante MLX, sin necesidad de CUDA.
- Cinco precisiones disponibles con distinto equilibrio entre tamaño y fidelidad.
- No soporta tool calling, agentes, razonamiento multi-step ni capacidades multilingües (es un modelo puramente visual de segmentación).

## Casos de uso

- Eliminación de fondos en fotografía de producto: el modelo genera máscaras alfa precisas para catálogos de e-commerce, procesando imágenes a 1024x1024 con bordes limpios en objetos con contornos definidos.
- Edición fotográfica y composición: permite extraer sujetos de forma automática para su uso en herramientas de diseño gráfico, aprovechando la precisión de bordes del mecanismo de referencia bilateral.
- Procesamiento por lotes en Macs: al ejecutarse en MLX sobre Apple Silicon (aproximadamente 1,2 s por imagen en un M5), es adecuado para pipelines de procesamiento local en estudios pequeños o flujos de trabajo sin GPU dedicada.
- Generación de recortes para avatares y retratos: la capacidad de delimitar pelo y detalles finos lo hace útil para extraer retratos con fondos complejos.
- Preprocesamiento para modelos generativos: las máscaras alfa generadas pueden alimentar pipelines de inpainting o de generación de imágenes condicionada por máscara.
- Segmentación en aplicaciones de realidad aumentada: la separación precisa de primer plano permite superponer objetos virtuales sobre el sujeto en tiempo real en dispositivos Apple.
- Automatización de flujos de diseño: integración en scripts de Python que usan MLX para procesar imágenes localmente sin depender de servicios en la nube.

## Benchmarks y rendimiento

La model card proporciona métricas de fidelidad respecto al modelo original en PyTorch fp32, medidas sobre las peores imágenes del conjunto de verificación:

| Precision | Tamano | MAE vs PyTorch fp32 (peor imagen) | Mask IoU (peor) | Estado |
|---|---|---|---|---|
| fp16 | 440 MB | 0.00003 | 0.9996 | pasa |
| bf16 | 440 MB | 0.0002 | 0.9978 | pasa |
| 8bit | 258 MB | 0.0003 | 0.9971 | pasa |
| 6bit | 209 MB | 0.0009 | 0.9913 | pasa |
| 4bit | 161 MB | 0.0022 | 0.9772 | por debajo del umbral (IoU >= 0.98), experimental |

No se han publicado resultados de benchmarks estándar (como MMLU, HumanEval o GSM8K) en la información disponible, ya que se trata de un modelo de segmentación de imágenes y no de un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: al ejecutarse en MLX sobre Apple Silicon, utiliza memoria unificada del sistema. El modelo en fp16/bf16 ocupa 440 MB de pesos; en 8bit, 258 MB; en 6bit, 209 MB; en 4bit, 161 MB.
- GPU recomendadas: chips Apple Silicon (M-series). La model card menciona un Apple M5 con aproximadamente 1,2 s por imagen a 1024x1024.
- Cabe en cualquier Mac con Apple Silicon: el tamaño reducido de los pesos (entre 161 MB y 440 MB) permite ejecutarlo incluso en equipos con 8 GB de memoria unificada.
- Opciones de despliegue: MLX (framework nativo de Apple). Requiere únicamente `mlx`, `numpy` y `pillow`. No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que es un modelo de visión y no de lenguaje.
- Latencia y throughput estimados: aproximadamente 1,2 s por imagen de 1024x1024 en un Apple M5, según la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/Entrada | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| BiRefNet-MLX | no disponible (Swin-L) | 1024x1024 | MIT | MLX (Apple Silicon) | Port del original, 5 precisiones |
| BiRefNet (original) | no disponible (Swin-L) | 1024x1024 | MIT | PyTorch | Modelo base, requiere PyTorch/CUDA |
| no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de información sobre otros modelos comparables en la información proporcionada |

No se dispone de datos de benchmarks comparativos con otros modelos de segmentación en la información proporcionada.

## Limitaciones y advertencias

- La versión 4bit está marcada como experimental y por debajo del umbral de calidad (IoU >= 0.98), con un IoU de 0.9772 en la peor imagen; no se recomienda para producción sin validación adicional.
- El modelo está especializado exclusivamente en segmentación dicotómica de imágenes; no realiza generación de texto, razonamiento ni otras tareas.
- Solo se ejecuta en Apple Silicon mediante MLX; no es compatible con GPUs NVIDIA ni con el ecosistema PyTorch/CUDA.
- No se dispone de información sobre sesgos del modelo ni sobre el dataset de entrenamiento original en la información proporcionada.
- Riesgo de alucinación no aplica en el sentido habitual, pero puede producir máscaras imprecisas en imágenes con fondos ambiguos u objetos poco definidos.
- La licencia MIT permite uso comercial, pero los archivos son un derivado del modelo original y heredan su licencia; se debe consultar la model card original para cualquier restricción adicional.
- El modelo procesa la entrada redimensionada a 1024x1024, lo que puede perder detalle en imágenes de resolución muy superior o muy inferior.
- No se dispone de información sobre el rendimiento en imágenes de dominios específicos (médico, satelital, etc.).

## Enlaces

- Hugging Face: https://huggingface.co/moonbox-dev/BiRefNet-MLX
- Modelo base: https://huggingface.co/ZhengPeng7/BiRefNet
- Paper: https://arxiv.org/abs/2401.03407
- Repositorio original (referenciado en la model card): no disponible en la información proporcionada
- Demo: no disponible en la información proporcionada
