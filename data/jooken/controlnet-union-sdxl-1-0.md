# JookEn/controlnet-union-sdxl-1.0

## Resumen

ControlNet Union SDXL 1.0 es un modelo de control para Stable Diffusion XL (SDXL) que permite condicionar la generación de imágenes mediante múltiples tipos de entrada visual (pose, profundidad, bordes, lineart, etc.) con una única red de control unificada. Desarrollado por JookEn, se basa en la arquitectura original de ControlNet pero introduce dos módulos nuevos: uno para extender el soporte a diferentes condiciones con los mismos parámetros de red y otro para fusionar múltiples condiciones sin aumentar el coste computacional. El modelo está entrenado sobre más de 10 millones de imágenes con re-captioning mediante CogVLM, lo que mejora el seguimiento de prompts y la calidad estética. Es relevante porque ofrece una solución todo-en-uno para control fino en SDXL, compatible con otros modelos y LoRAs de la comunidad, y su licencia Apache 2.0 permite uso comercial sin restricciones.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ControlNet basado en Stable Diffusion XL (red de control con módulos de fusión de condiciones) |
| Parametros totales | 1.255.958.800 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de difusión de imágenes) |
| Tipos de cuantizacion | No disponible (solo safetensors en el repositorio) |
| Idiomas soportados | No disponible (el modelo procesa imágenes, no texto directamente) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de ControlNet original, adaptada a SDXL. Se añaden dos módulos específicos: un módulo que permite compartir el mismo encoder de condiciones para distintos tipos de entrada (pose, profundidad, canny, lineart, etc.) y un módulo de fusión de condiciones que aprende a combinar múltiples señales sin necesidad de hiperparámetros manuales ni prompts especiales. El entrenamiento se realizó con más de 10 millones de imágenes de alta calidad, cubriendo una gran diversidad de situaciones. Se emplearon técnicas como data augmentation, múltiples funciones de pérdida y entrenamiento multi-resolución (bucket training, similar a NovelAI), lo que permite generar imágenes de alta resolución con cualquier relación de aspecto. Además, se utilizó re-captioning con CogVLM para generar descripciones detalladas, mejorando la adherencia al prompt. El modelo no incrementa significativamente el número de parámetros ni el coste computacional respecto al ControlNet original.

## Capacidades

- Soporte de más de 10 condiciones de control: openpose, depth, canny, lineart, anime lineart, entre otras.
- Generación multi-condición: puede combinar varias señales de control simultáneamente, aprendiendo la fusión durante el entrenamiento.
- Generación de imágenes de alta resolución con cualquier relación de aspecto gracias al bucket training.
- Compatible con otros modelos SDXL de código abierto (por ejemplo, BluePencilXL, CounterfeitXL) y con LoRAs.
- En la versión ProMax (disponible en el mismo repositorio de HuggingFace) se añaden capacidades avanzadas de edición: tile deblur, tile variation, super resolución (hasta 9M de píxeles), inpainting y outpainting.
- Buen seguimiento de prompts gracias al re-captioning con CogVLM.
- No requiere ajuste de hiperparámetros para fusionar condiciones.

## Casos de uso

- **Generación de arte a partir de bocetos**: los usuarios pueden dibujar un lineart o un boceto y el modelo genera una imagen completa con colores y texturas, manteniendo la estructura del dibujo. Adecuado para ilustradores que quieren acelerar su flujo de trabajo.
- **Control de pose para personajes**: con openpose, se puede especificar la postura exacta de un personaje y el modelo genera la imagen respetando esa pose, útil para animación y diseño de personajes.
- **Edición de imágenes con inpainting**: la versión ProMax permite rellenar regiones específicas de una imagen manteniendo la coherencia con el resto, ideal para retoques fotográficos o eliminación de objetos no deseados.
- **Super resolución**: el modo tile super resolution permite ampliar imágenes de baja resolución (por ejemplo, de 1M a 9M píxeles) con detalle añadido, útil para impresión o restauración de imágenes antiguas.
- **Outpainting**: expandir el lienzo de una imagen más allá de sus bordes originales, generando contenido coherente con la escena, útil para crear composiciones panorámicas o completar escenas recortadas.
- **Generación de imágenes con múltiples condiciones**: por ejemplo, combinar depth y canny para obtener un control estructural y de bordes simultáneamente, sin necesidad de configurar pesos manualmente, lo que facilita la creación de escenas complejas en diseño de producto o arquitectura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas cuantitativas como FID, CLIP score o comparativas con otros modelos. Se recomienda evaluar el modelo en casos de uso específicos para determinar su rendimiento.

## Requisitos de hardware

- No se dispone de datos oficiales sobre requisitos de hardware. Como modelo de control para SDXL, se necesita ejecutar junto al modelo base SDXL (que tiene alrededor de 2.6B parámetros). En total, la inferencia requiere una GPU con al menos 8-12 GB de VRAM en precisión fp16, dependiendo de la resolución y el número de condiciones.
- GPU recomendadas: NVIDIA RTX 3090, RTX 4090, A100, H100, o similares con suficiente memoria.
- El modelo puede ejecutarse en GPUs de consumo (por ejemplo, RTX 3060 con 12 GB) si se usa cuantización o se reduce la resolución, aunque no se especifican formatos cuantizados en el repositorio.
- Opciones de despliegue: al ser un modelo de difusión, se puede integrar con la librería Diffusers de HuggingFace, así como con herramientas como ComfyUI o Automatic1111 WebUI. Para inferencia en producción, se pueden utilizar servidores como vLLM (aunque está más orientado a LLM) o soluciones específicas para difusión como TensorRT.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Condiciones soportadas | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ControlNet Union SDXL 1.0 (este) | 1.255.958.800 | 10+ (multi-condición) | Apache 2.0 | safetensors | Todo-en-uno, entrenado con 10M imágenes |
| ControlNet original para SDXL | ~1.25B | Una condición por modelo | Apache 2.0 | safetensors | Requiere un modelo por tipo de control |
| ControlNet-Union de xinsir (versión original) | 1.255.958.800 | 10+ | Apache 2.0 | safetensors | Prácticamente el mismo modelo, publicado por xinsir |

La comparativa se basa en información pública; no se dispone de benchmarks para comparar rendimiento real. El modelo de JookEn parece ser una copia o re-subida del ControlNet-Union de xinsir, con la misma arquitectura y parámetros.

## Limitaciones y advertencias

- No se han documentado sesgos específicos en la model card. Como modelo entrenado con datos de internet, puede reflejar sesgos presentes en los datos de entrenamiento.
- Riesgo de alucinaciones visuales: al ser un modelo generativo, puede producir detalles incoherentes o artefactos, especialmente en condiciones poco comunes o con prompts ambiguos.
- Limitaciones de idioma: el modelo no procesa texto directamente; la generación depende del modelo base SDXL y de los prompts en inglés u otros idiomas soportados por SDXL.
- Restricciones de licencia: Apache 2.0 permite uso comercial sin restricciones, pero se debe atribuir adecuadamente.
- Para producción, es necesario evaluar la calidad de salida en el dominio específico y considerar la necesidad de post-procesado.
- El autor menciona que el entrenamiento del modelo SD3 se detuvo por falta de recursos, lo que indica que el proyecto puede tener mantenimiento limitado.

## Enlaces

- [HuggingFace: JookEn/controlnet-union-sdxl-1.0](https://huggingface.co/JookEn/controlnet-union-sdxl-1.0)
- [Repositorio GitHub de ControlNetPlus (mencionado en la model card)](https://github.com/xinsir6/ControlNetPlus)
- [Modelo original de xinsir (mismo modelo, con versión ProMax)](https://huggingface.co/xinsir/controlnet-union-sdxl-1.0)
