# ChrisColeTech/krea-2-raw-FP8

## Resumen

El repositorio `ChrisColeTech/krea-2-raw-FP8` contiene los pesos en formato FP8 (escalados y no escalados) del modelo Krea 2 Raw, desarrollado por Krea AI. Krea 2 es un modelo de generación de imágenes entrenado desde cero, enfocado en exploración creativa y control de estilo. La variante Raw es un modelo base pensado para personalización y fine-tuning, no para inferencia directa, ya que no está optimizado para generar imágenes finales de alta calidad sin ajustes adicionales.

Esta cuantización FP8 reduce el uso de memoria y acelera la inferencia en comparación con los pesos originales en BF16, manteniendo una calidad visual cercana. El repositorio incluye también archivos GGUF compatibles con ComfyUI, lo que facilita su integración en flujos de trabajo de generación de imágenes. El modelo tiene aproximadamente 12.820 millones de parámetros, lo que lo sitúa en la gama media-alta de modelos de difusión.

La relevancia de esta versión radica en que permite ejecutar Krea 2 Raw en hardware más modesto y en herramientas como ComfyUI, ampliando su accesibilidad para desarrolladores e investigadores que deseen experimentar con fine-tuning o generación controlada por estilo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 12.820.073.036 (12,82 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen) |
| Tipos de cuantizacion | FP8 (escalado y no escalado), GGUF |
| Idiomas soportados | no aplica (modelo de imagen) |
| Licencia | unknown |
| Formato de pesos | safetensors (FP8), GGUF |

## Arquitectura y entrenamiento

No se ha proporcionado información detallada sobre la arquitectura interna del modelo Krea 2 Raw en los datos disponibles. Según la documentación oficial de Krea AI, Krea 2 es un modelo de generación de imágenes entrenado desde cero, pero no se especifican detalles como el tipo de red (difusión, transformer, etc.) ni el proceso de entrenamiento (número de tokens, dataset, técnicas de alineación). El repositorio de HuggingFace de Krea-2-Raw tampoco incluye estos datos en la información extraída.

La cuantización FP8 aplicada en este repositorio es una técnica de compresión que reduce la precisión de los pesos de 16 bits a 8 bits, lo que disminuye el uso de memoria y acelera la inferencia. El autor indica que los pesos no escalados son compatibles con entrenadores de LoRA, mientras que los escalados están pensados para aplicaciones como ComfyUI. No se mencionan innovaciones técnicas adicionales en el proceso de cuantización.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image) y posiblemente edición o variaciones, aunque al ser un modelo base, su salida directa puede requerir ajustes.
- Control de estilo y exploración creativa, según la descripción oficial de Krea 2.
- Compatibilidad con fine-tuning mediante LoRA, gracias a los pesos no escalados FP8.
- Integración con ComfyUI mediante los archivos GGUF, permitiendo flujos de trabajo visuales.
- No se especifican capacidades de tool calling, agentes, razonamiento multimodal ni otras funciones propias de modelos de lenguaje.

## Casos de uso

- Fine-tuning para estilos artísticos específicos: al ser un modelo base, los desarrolladores pueden entrenar LoRA sobre los pesos FP8 no escalados para adaptar el modelo a un estilo particular (ilustración, fotografía, etc.) sin necesidad de hardware de gama alta.
- Generación de imágenes en ComfyUI: los archivos GGUF permiten cargar el modelo en ComfyUI y usarlo en flujos de trabajo de generación con control de estilo, ideal para artistas y diseñadores que prefieren interfaces visuales.
- Investigación en generación de imágenes: el modelo puede servir como punto de partida para estudiar el comportamiento de modelos base de 12B parámetros en tareas de síntesis de imágenes, comparando con otras arquitecturas.
- Prototipado rápido de aplicaciones de generación de imágenes: gracias a la cuantización FP8, se puede desplegar en GPUs con menos VRAM, facilitando pruebas y demos.
- Creación de datasets sintéticos: el modelo puede generar imágenes variadas para aumentar conjuntos de datos de entrenamiento en tareas de visión por computador.
- Experimentación con control de estilo y moodboards: Krea 2 está diseñado para estética diversa, por lo que puede usarse para generar variaciones a partir de referencias visuales o descripciones textuales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos sobre métricas como FID, CLIP score u otras evaluaciones de calidad de imagen para este modelo o su versión cuantizada.

## Requisitos de hardware

- El tamaño del repositorio es de 88.2 GB, pero esto incluye múltiples archivos (FP8 escalado, no escalado y GGUF). El modelo FP8 individual ocupa aproximadamente 12.8 GB (12.82B parámetros × 1 byte por parámetro).
- Para inferencia con FP8, se recomienda una GPU con al menos 16 GB de VRAM, aunque 24 GB sería más cómodo para trabajar con resoluciones altas o lotes mayores.
- GPUs compatibles: RTX 3090, RTX 4090, A100, H100, etc. Las GPUs consumer de 24 GB (RTX 3090/4090) pueden ejecutar el modelo sin problemas.
- Para fine-tuning con LoRA, se necesitaría VRAM adicional para los gradientes, por lo que 24 GB es el mínimo recomendado.
- Opciones de despliegue: ComfyUI (con el cargador GGUF actualizado), o mediante scripts de inferencia personalizados que carguen los safetensors FP8.
- No se dispone de datos de latencia o throughput específicos para este modelo cuantizado.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas de la misma categoría. Krea 2 Raw es un modelo de generación de imágenes de 12.8B parámetros, pero no se han proporcionado datos de rendimiento ni características de otros modelos comparables (como SDXL, Flux, etc.) en la información disponible.

## Limitaciones y advertencias

- Es un modelo base, no recomendado para inferencia directa sin fine-tuning; las imágenes generadas pueden carecer de la calidad y coherencia de modelos finales como Krea 2 Turbo.
- La licencia es "unknown", lo que genera incertidumbre sobre el uso comercial y la redistribución. Se debe contactar con Krea AI para aclarar los términos.
- No se dispone de información sobre sesgos, alucinaciones visuales o limitaciones de contexto, ya que no hay documentación técnica detallada.
- La cuantización FP8 puede introducir ligeras pérdidas de calidad en comparación con los pesos originales BF16, aunque en general es mínima.
- El repositorio no incluye ejemplos de uso ni flujos de trabajo, por lo que el usuario debe tener experiencia previa con ComfyUI o con carga de modelos FP8.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ChrisColeTech/krea-2-raw-FP8
- Modelo base Krea-2-Raw: https://huggingface.co/krea/Krea-2-Raw
- Código oficial de inferencia (GitHub): https://github.com/krea-ai/krea-2
- Página oficial de Krea 2: https://www.krea.ai/krea-2
- Tutorial sobre Krea2 Raw/Base & Turbo: https://www.stablediffusiontutorials.com/2026/06/krea2-base-turbo.html
