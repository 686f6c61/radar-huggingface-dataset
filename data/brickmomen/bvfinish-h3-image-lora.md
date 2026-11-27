# BrickMomen/bvfinish-h3-image-lora

## Resumen

bvfinish es un LoRA de edición de imagen diseñado para el modelo MiniMax H3 Image, publicado por el usuario BrickMomen en Hugging Face. Su función es transformar un render arquitectónico en bruto en una versión final fotorrealista a resolución 2K, mejorando materiales, iluminación, vegetación y gradación de color sin alterar la geometría de la escena. Se trata de un adaptador de bajo rango (rank 32) entrenado sobre pares antes/después de renders de arquitectura.

El modelo resuelve un problema muy concreto del flujo de trabajo de visualización arquitectónica (archviz): el paso de render en bruto a imagen de presentación pulida. En lugar de requerir postproducción manual o un pipeline completo de refinado, el LoRA aplica ese acabado en una sola pasada de image-to-image sobre el modelo base MiniMax H3 Image, manteniendo la composición y la geometría originales.

Es relevante por su especialización: no es un modelo generalista, sino un adaptador entrenado específicamente con 59 pares de renders arquitectónicos (exteriores, patios e interiores), con una palabra de activación (`bvfinish`) y unos parámetros de muestreo fijados por el autor. El repositorio ocupa 0,3 GB y el checkpoint final pesa 296 MB. La licencia y los idiomas no están declarados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre MiniMax H3 Image; rank 32, alpha 32 |
| Parametros totales | no disponible (adaptador LoRA; el modelo base no se detalla) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizaciones del adaptador no declaradas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (`h3img_bvfinish_v1_2k.safetensors`, 296 MB) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rank 32 y alpha 32 entrenado sobre el modelo base Comfy-Org/MiniMax-H3-Image mediante Ostris AI Toolkit v0.13.43. El conjunto de datos consistió en 59 pares antes/después de renders arquitectónicos, con 4 imágenes adicionales reservadas para prueba, todas escaladas a 2048 px en el lado largo. El entrenamiento usó el optimizador adamw8bit con una tasa de aprendizaje de 1e-4, buckets de resolución de 1536 y 2048, 3000 pasos con tamaño de lote 1 y caption dropout de 0. La palabra de activación es `bvfinish`.

Las captions de entrenamiento siguen un patrón fijo: la palabra de activación, una descripción breve de la escena y una serie de palabras clave de acabado (`premium archviz quality`, `polished architectural visualization`, `photoreal finish`, `natural color grading`, `realistic materials`, `believable lighting`, `refined vegetation`). El adaptador está pensado para seguir fielmente la imagen de entrada y refinar su acabado, no para añadir o eliminar objetos. Los ajustes de inferencia recomendados por el autor son sampler euler, scheduler simple, 6 pasos, CFG 1 y prompt negativo vacío.

## Capacidades

- Edición image-to-image de renders arquitectónicos: recibe una única imagen de referencia y devuelve una versión pulida a aproximadamente 2K en el lado largo.
- Refinado de materiales, iluminación, vegetación y gradación de color manteniendo la geometría original.
- Especialización en exteriores de edificios, patios e interiores sin personas como sujeto principal.
- Control mediante palabra de activación (`bvfinish`) y palabras clave de acabado incluidas en las captions de entrenamiento.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step (es un adaptador de imagen).
- No se declaran capacidades multilingües, de visión general, audio ni modo de pensamiento.
- No está diseñado para añadir o eliminar contenido nuevo en la escena.

## Casos de uso

- Presentación de proyectos de arquitectura: convertir un render en bruto de un edificio en una imagen de acabado fotorrealista para entregables de cliente, manteniendo la composición y la geometría del diseño original.
- Refinado de interiores: pulir renders de salones, cocinas o espacios comerciales con materiales y luz más creíbles antes de incluirlos en una memoria o portfolio.
- Iteración rápida en estudios de archviz: aplicar el LoRA en ComfyUI sobre un render base para obtener una versión de presentación en 6 pasos con CFG 1, reduciendo el tiempo de postproducción manual.
- Visualización de paisajismo y vegetación: mejorar la representación de jardines, patios y vegetación en renders de exteriores, uno de los puntos fuertes declarados del adaptador.
- Pruebas de concepto de materiales: generar variantes de acabado de una misma escena para comparar opciones de materiales y color sin rehacer el render.
- Integración en pipelines de ComfyUI: encadenar el LoRA tras el cargador de modelo en un flujo de edición de MiniMax H3 Image para automatizar el acabado de lotes de renders.
- No recomendado para escenas centradas en personas ni para añadir elementos nuevos (agua en fuentes, nubes dramáticas), según las limitaciones declaradas por el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor solo reporta pruebas cualitativas sobre cuatro imágenes reservadas, con una única semilla, a 6 pasos y CFG 1, y advierte que debe tratarse como una primera versión.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; depende del modelo base MiniMax H3 Image y de la resolución de salida (recomendada ~2K en el lado largo, con lados múltiplos de 32, por ejemplo 1536×2048 o 2048×1376).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: ComfyUI (flujo de edición de MiniMax H3 Image con un cargador de LoRA tras el cargador de modelo, fuerza 1.0). Otros entornos (vLLM, llama.cpp, Ollama, TGI) no están indicados para este adaptador de imagen.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros LoRA de acabado archviz comparables ni datos de rendimiento frente a alternativas.

## Limitaciones y advertencias

- Validación limitada: solo se comprobó sobre cuatro imágenes reservadas con una única semilla; el autor lo describe como una primera versión.
- No inventa contenido nuevo de forma fiable: en las pruebas no añadió elementos presentes en las referencias de acabado, como agua en fuentes o nubes dramáticas.
- El texto pequeño y los logotipos del render pueden cambiar.
- Entrenado con arquitectura e interiores sin personas como sujeto principal; el comportamiento en otro tipo de contenido es desconocido.
- Los ajustes de muestreo (6 pasos, CFG 1, euler, simple) son los del entrenamiento; otros valores no fueron probados.
- Licencia no declarada: no se puede confirmar el uso comercial sin consultar al autor.
- Idiomas no declarados.
- Riesgo de sesgo y alucinación no evaluado en la información disponible.
- Depende del modelo base Comfy-Org/MiniMax-H3-Image, cuyas limitaciones y licencia se aplican igualmente.

## Enlaces

- Hugging Face: https://huggingface.co/BrickMomen/bvfinish-h3-image-lora
- Modelo base: https://huggingface.co/Comfy-Org/MiniMax-H3-Image
- Ostris AI Toolkit (herramienta de entrenamiento): https://github.com/ostris/ai-toolkit
