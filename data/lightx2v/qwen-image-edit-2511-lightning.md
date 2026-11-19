# lightx2v/Qwen-Image-Edit-2511-Lightning

## Resumen

Qwen-Image-Edit-2511-Lightning es una colección de adaptadores LoRA de destilación por pasos y de un checkpoint cuantizado en FP8 para el modelo de edición de imagen Qwen/Qwen-Image-Edit-2511, publicada por el equipo lightx2v (vinculado al proyecto ModelTC). No es un modelo base nuevo, sino un conjunto de artefactos de aceleración que reducen la inferencia del modelo original de 40 pasos a solo 4, manteniendo la calidad de edición de imagen. Su relevancia actual radica en que permite desplegar edición de imagen de alta fidelidad con una latencia y un consumo de VRAM mucho menores, lo que facilita su uso en producción y en hardware de gama más modesta.

El repositorio contiene tres ficheros: dos LoRA destilados a 4 pasos (en BF16 y FP32) y un modelo base cuantizado en FP8 (e4m3fn con escalado) que ya incorpora el LoRA destilado fusionado. El modelo base subyacente, Qwen-Image-Edit-2511, es un modelo de difusión para edición de imagen (pipeline image-to-image y text-to-image) desarrollado por el equipo Qwen de Alibaba. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

La ficha se centra en las características de estos artefactos de aceleración y en cómo se integran con el modelo base, ya que la información disponible describe principalmente el proceso de destilación y cuantización, no los detalles arquitectónicos internos del transformer de difusión original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión (edición de imagen) sobre el transformer de Qwen-Image-Edit-2511; los artefactos son LoRA de destilación y checkpoint FP8 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, FP32 (LoRA); FP8 e4m3fn con escalado (checkpoint base cuantizado) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (diffusers, diffusion-single-file) |

## Arquitectura y entrenamiento

El modelo base Qwen-Image-Edit-2511 es un modelo de difusión para edición de imagen condicionada por texto e imagen, del que esta ficha no detalla la arquitectura interna (no disponible en la información proporcionada). Los artefactos publicados en este repositorio son de dos tipos. Por un lado, LoRA de destilación por pasos entrenados para reducir el número de pasos de muestreo de 40 a 4, con versiones en BF16 y FP32. Por otro, un checkpoint del modelo base cuantizado en FP8 (e4m3fn con escalado) que fusiona el LoRA destilado de 4 pasos, pensado para despliegues con memoria limitada.

La innovación principal es la destilación de pasos, que según la model card logra una aceleración de aproximadamente 10x frente a la inferencia estándar de 40 pasos preservando la calidad de edición. La cuantización FP8 reduce el uso de VRAM en torno a un 50% respecto a FP32 manteniendo la fidelidad de edición. No se especifican en la información disponible el volumen de datos de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO.

## Capacidades

- Edición de imagen condicionada por instrucciones de texto e imagen de entrada (pipeline image-to-image).
- Generación de imagen texto-a-imagen, según las etiquetas del repositorio.
- Inferencia acelerada en 4 pasos mediante destilación, frente a los 40 pasos del modelo base.
- Despliegue de bajo consumo de memoria mediante el checkpoint cuantizado en FP8.
- Compatibilidad con ComfyUI (etiqueta comfyui y formato diffusion-single-file).
- Compatibilidad con los frameworks Qwen-Image-Lightning y LightX2V.
- Soporte de tool calling, agentes, razonamiento multi-paso, visión, audio o modo thinking: no disponible (no es un modelo de lenguaje).

## Casos de uso

- Edición de imágenes por lotes en producción: con 4 pasos de inferencia en lugar de 40, el coste por imagen se reduce aproximadamente 10x, lo que hace viable procesar grandes volúmenes de imágenes en pipelines automatizados de retoque o sustitución de fondos.
- Despliegue en GPU de gama consumer: el checkpoint FP8 reduce el uso de VRAM en torno a un 50%, permitiendo ejecutar edición de imagen en tarjetas con menos memoria que las necesarias para el modelo base en FP32.
- Integración en flujos de trabajo de ComfyUI: el formato diffusion-single-file y la etiqueta comfyui permiten cargar los artefactos directamente en grafos de ComfyUI para prototipado rápido de edición de imagen.
- Servicios interactivos de edición de imagen: la baja latencia de la inferencia a 4 pasos es adecuada para aplicaciones donde el usuario espera respuesta casi inmediata tras una instrucción de edición.
- Investigación en destilación de modelos de difusión: los LoRA destilados en BF16 y FP32 sirven como referencia para estudiar el equilibrio entre número de pasos, precisión y calidad de edición.
- Prototipado de herramientas creativas: combinado con el framework LightX2V, permite construir demos de edición de imagen guiada por texto con requisitos de hardware moderados.
- Evaluación comparativa de cuantización: el checkpoint FP8 fusionado con el LoRA permite medir en la práctica la pérdida de fidelidad frente a las versiones BF16/FP32.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo cuantifica la aceleración aproximada (10x frente a 40 pasos) y la reducción de VRAM (en torno al 50% frente a FP32), sin métricas de calidad objetivas como FID, CLIP score o similares.

## Requisitos de hardware

- VRAM estimada: no disponible de forma numérica; la model card indica una reducción de aproximadamente el 50% con FP8 respecto a FP32.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU consumer: no confirmada explícitamente; el objetivo declarado del checkpoint FP8 es el despliegue con poca memoria, pero no se especifican modelos concretos.
- Opciones de despliegue: framework Qwen-Image-Lightning, framework LightX2V, ComfyUI y diffusers.
- Latencia y throughput: no disponibles; solo se indica la aceleración relativa de aproximadamente 10x por la reducción de 40 a 4 pasos.

## Comparativa con modelos similares

| Modelo | Tipo | Pasos de inferencia | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen-Image-Edit-2511-Lightning | LoRA destilado + checkpoint FP8 | 4 | BF16, FP32, FP8 | Apache 2.0 | Hugging Face (lightx2v) |
| Qwen/Qwen-Image-Edit-2511 (base) | Modelo de difusión de edición | 40 (estándar) | no disponible | no disponible | Hugging Face (Qwen) |
| Alternativas de destilación de difusión | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos comparables de destilación para Qwen-Image-Edit en la documentación proporcionada.

## Limitaciones y advertencias

- Al ser artefactos derivados, heredan las limitaciones del modelo base Qwen-Image-Edit-2511, cuyos sesgos y riesgos de generación no se detallan en la información disponible.
- La destilación a 4 pasos puede introducir pérdida de calidad o de fidelidad en ediciones complejas frente a los 40 pasos originales; no se aportan métricas que lo cuantifiquen.
- La cuantización FP8 puede degradar la fidelidad de edición respecto a BF16/FP32; la model card no ofrece comparativas numéricas.
- No se especifican los idiomas soportados para las instrucciones de edición.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar la licencia y condiciones del modelo base Qwen-Image-Edit-2511 antes de desplegar en producción.
- El tamaño del repositorio (107,7 GB) implica requisitos de almacenamiento considerables.
- No hay información sobre latencia absoluta, throughput ni hardware mínimo verificado.

## Enlaces

- [Hugging Face: lightx2v/Qwen-Image-Edit-2511-Lightning](https://huggingface.co/lightx2v/Qwen-Image-Edit-2511-Lightning)
- [Modelo base: Qwen/Qwen-Image-Edit-2511](https://huggingface.co/Qwen/Qwen-Image-Edit-2511)
- [Repositorio Qwen-Image-Lightning](https://github.com/ModelTC/Qwen-Image-Lightning/)
- [Documentación de LightX2V para Qwen Image Edit](https://github.com/ModelTC/LightX2V/blob/main/scripts/qwen_image/README.md)
- [Repositorio LightX2V](https://github.com/ModelTC/LightX2V)
- [Issues de Qwen-Image-Lightning](https://github.com/ModelTC/Qwen-Image-Lightning/issues)
- [Issues de LightX2V](https://github.com/ModelTC/LightX2V/issues)
