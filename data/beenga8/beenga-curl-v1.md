# beenga8/beenga-curl-v1

## Resumen

beenga-curl-v1 es un adaptador LoRA para el modelo de difusión FLUX.2 klein 4B de Black Forest Labs, desarrollado por beenga8 como parte del proyecto Beenga Image. Su propósito es mejorar la geometría del cabello rizado suave y de salón en la generación de imágenes, un aspecto en el que el modelo base muestra resultados deficientes. El adaptador se distribuye como un archivo safetensors de aproximadamente 92 MB y se carga mediante la API de diffusers sobre el pipeline Flux2KleinPipeline.

La relevancia de este modelo radica en que aborda una limitación específica y bien documentada del generador base, pero también en que expone de forma transparente sus propias limitaciones: el entrenamiento con un conjunto de datos sintético y homogéneo provoca que el adaptador tienda a rizar cabello no especificado y a filtrar el estilo visual del dataset en escenas no relacionadas. Por ello, se recomienda su uso deliberado en prompts donde el rizo sea el sujeto principal, y se ofrece como una opción opt-in en el producto Beenga Image.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre FLUX.2 klein 4B (modelo de difusión) |
| Parametros totales | No disponible (el archivo pesa 92 426 528 bytes, 160 tensores) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo text-to-image) |
| Tipos de cuantizacion | No disponible (el adaptador se usa en bf16, el modelo base puede cuantizarse) |
| Idiomas soportados | No disponibles (el modelo base soporta inglés, pero no se especifica) |
| Licencia | Apache 2.0 (sujeta a la política de uso fuera de alcance de Black Forest Labs) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El adaptador es una LoRA de rango 32 y alpha 32, entrenada sobre el modelo de difusión FLUX.2 klein 4B, que emplea una arquitectura de transformer de difusión con flujo (flow matching). El entrenamiento se realizó con ai-toolkit 0.12.23, utilizando el optimizador adamw8bit con una tasa de aprendizaje de 1e-4, scheduler flowmatch, precisión bf16 cuantizada y resoluciones de 512, 768 y 1024 píxeles. Se ejecutó en una única NVIDIA A40 de 48 GB durante aproximadamente 35 minutos para el total de 1500 pasos, aunque el checkpoint publicado corresponde al paso 500, considerado el mejor de los tres guardados (500, 1000 y 1500).

El conjunto de datos de entrenamiento consta de 200 imágenes completamente sintéticas, generadas con Z-Image Turbo bajo licencia Apache 2.0, sin fotografías reales ni datos scrapeados. Todas las captions provienen de una única plantilla y un solo generador, sin ejemplos de contraste (cabello lacio, apretado, etc.), lo que impidió que el adaptador aprendiera a separar la geometría del rizo del estilo visual general del dataset.

## Capacidades

- Mejora la geometría del cabello rizado suave y de salón en comparación con el modelo base FLUX.2 klein 4B.
- Preserva el control explícito en la dirección opuesta: si se pide cabello lacio, el adaptador lo genera lacio.
- Se integra fácilmente con el pipeline Flux2KleinPipeline de diffusers mediante `load_lora_weights`.
- Permite descargar el adaptador con `unload_lora_weights` para volver al comportamiento del modelo base.
- No introduce capacidades de moderación o seguridad adicionales.
- No soporta tool calling, agentes ni razonamiento multi-paso, al ser un modelo de generación de imágenes.

## Casos de uso

- Retratos con cabello rizado definido: el adaptador es adecuado para generar retratos donde el rizo es el elemento central, como en sesiones de moda o catálogos de peluquería, mejorando la fidelidad de la geometría del cabello.
- Edición de imágenes de stock: puede aplicarse sobre imágenes generadas con el modelo base para refinar el cabello rizado en postproducción, siempre que el prompt especifique claramente el tipo de rizo.
- Pruebas de concepto en productos de generación de imágenes: el proyecto Beenga Image lo utiliza como una opción opt-in, demostrando cómo un adaptador LoRA puede integrarse en un pipeline de producción con un flag de activación.
- Investigación sobre adaptadores LoRA en modelos de difusión: sirve como caso de estudio de los efectos del sesgo del dataset de entrenamiento en el comportamiento del adaptador, especialmente en la separación de atributos visuales.
- Generación de contenido para campañas publicitarias dirigidas a mercados con alta demanda de representación de cabello rizado, como la India, donde el modelo fue entrenado con imágenes de ese perfil.
- Benchmarking de calidad de adaptadores: permite comparar el rendimiento de un adaptador entrenado con datos sintéticos frente a otros enfoques, aunque la evaluación es subjetiva y manual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks cuantitativos en la información disponible. La evaluación se realizó mediante juicio humano contra los conjuntos de prueba del proyecto Beenga Image, con semillas fijas para atribuir diferencias al adaptador. La puntuación de la geometría del cabello es manual y subjetiva, y no reproducible; solo la complexión se mide por script. No hay métricas como FID, CLIP score o similares.

## Requisitos de hardware

- El adaptador en sí es ligero (92 MB), pero requiere el modelo base FLUX.2 klein 4B para funcionar, que es un modelo de difusión de 4 mil millones de parámetros.
- Para inferencia en bf16, se estima que se necesitan al menos 16-24 GB de VRAM, dependiendo de la resolución de salida y el uso de cuantización adicional.
- GPU recomendadas: NVIDIA A40, A100, H100, RTX 4090 o superiores con suficiente memoria.
- El entrenamiento se realizó en una única NVIDIA A40 de 48 GB, lo que indica que la inferencia es viable en GPUs de gama alta para consumidores, aunque con limitaciones de resolución.
- Opciones de despliegue: diffusers con PyTorch, compatible con pipelines de Hugging Face. No se menciona soporte para vLLM, llama.cpp u Ollama, ya que es un modelo de difusión, no un LLM.
- Latencia y throughput: no disponibles en la documentación.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El adaptador es específico para FLUX.2 klein 4B y no se han publicado comparativas con otros adaptadores LoRA para generación de cabello rizado.

## Limitaciones y advertencias

- El cabello no especificado en el prompt tiende a rizarse, cambiando un comportamiento por defecto que el usuario no solicitó.
- El estilo visual del conjunto de entrenamiento (fondos más planos, rostros más ordinarios, complexiones más oscuras, expresiones neutras) se filtra en escenas no relacionadas, independientemente del prompt.
- La causa es el dataset homogéneo de 200 imágenes sintéticas sin ejemplos de contraste, no el proceso de entrenamiento en sí.
- El checkpoint publicado es el paso 500, pero el producto Beenga Image sirve actualmente el paso 1500, que está visiblemente sobreentrenado; esto es un error de empaquetado que se corregirá en la próxima reconstrucción.
- La evaluación es subjetiva y no reproducible, lo que limita la comparabilidad objetiva.
- La licencia Apache 2.0 no otorga derechos de marca; "Beenga" es una marca registrada.
- El uso del modelo base FLUX.2 klein 4B está sujeto a la política de uso fuera de alcance de Black Forest Labs, que se aplica por separado de la licencia de copyright.
- Se debe verificar la variante del modelo base: los modelos 4B son Apache 2.0, pero los 9B están bajo la FLUX Non-Commercial License v2.1; los nombres difieren solo por dos caracteres.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/beenga8/beenga-curl-v1
- Proyecto Beenga Image (GitHub): https://github.com/Beenga/beenga-image
- Recetas de generación de datos: https://github.com/Beenga/beenga-image/blob/main/datasets/recipes.mjs
- Modelo base: https://huggingface.co/black-forest-labs/FLUX.2-klein-4B
