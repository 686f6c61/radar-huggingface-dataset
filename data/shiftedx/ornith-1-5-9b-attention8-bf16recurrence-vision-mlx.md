# Shiftedx/ornith-1.5-9b-attention8-bf16recurrence-vision-mlx

## Resumen

Ornith-1.5-9B es un modelo de visión-lenguaje (image-text-to-text) de la familia Ornith, desarrollada por ornith-ai como evolución del framework de auto-andamiaje (self-scaffolding) de Ornith-1.0 hacia un bucle completo de auto-mejora (self-improvement). El modelo base es un denso de 9B parámetros con tronco de lenguaje Qwen3.5, que propone nuevas tareas, genera andamios específicos y produce rollouts para aprendizaje por refuerzo, lo que lo orienta especialmente a tareas de codificación agéntica.

Esta versión concreta, publicada por Shiftedx, es una cuantización híbrida del modelo base para Apple Silicon, con una arquitectura que combina módulos affine de 8 y 4 bits con módulos recurrentes en BF16, más una torre de visión en BF16. El checkpoint resultante pesa unos 8,9 GB y ofrece una ventana de contexto de 262.144 tokens. Se distribuye bajo licencia MIT y está pensado para ejecutarse con MLX-VLM en hardware de Apple.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Qwen3.5: tronco de lenguaje denso con 130 módulos affine-8, 72 módulos affine-4 y 48 módulos de entrada recurrentes en BF16; torre de visión con 333 tensores BF16 |
| Parametros totales | 2.639.813.872 (pesos safetensors; el modelo lógico base es de 9B) |
| Parametros activos | No aplica (modelo denso híbrido) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | Híbrida: affine-8, affine-4 y BF16 para módulos recurrentes; visión en BF16 |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | Safetensors (MLX) |

## Arquitectura y entrenamiento

La arquitectura del modelo base Ornith-1.5-9B es un transformer denso de 9B con tronco de lenguaje basado en Qwen3.5, al que se añade una torre de visión para procesamiento multimodal. El checkpoint de Shiftedx aplica una cuantización híbrida que mantiene en BF16 los módulos de entrada recurrentes y la torre de visión, mientras que los módulos de atención y FFN se reparten entre affine-8 y affine-4. Esta combinación busca preservar la precisión en las partes críticas del modelo mientras se reduce el tamaño para ejecución en Apple Silicon.

El entrenamiento del modelo base sigue el marco de auto-mejora de Ornith-1.5: el modelo propone nuevas tareas, genera andamios específicos y produce soluciones (rollouts) que se utilizan como datos para aprendizaje por refuerzo. No se han publicado detalles del dataset de entrenamiento ni del número de tokens empleados. El checkpoint cuantizado no incluye tensores MTP (multi-token prediction), por lo que el modo de decodificación especulativa nativo no está disponible.

## Capacidades

- Generación de texto e imagen: procesa entradas de imagen y texto para producir descripciones, respuestas a preguntas visuales y contenido textual.
- Razonamiento y codificación agéntica: heredado del modelo base Ornith-1.5, está orientado a tareas de programación con múltiples pasos y generación de código.
- Auto-mejora y auto-andamiaje: el modelo base es capaz de proponer tareas y generar scaffolds específicos para resolverlas, aunque esta capacidad se hereda del checkpoint original.
- Tool calling y function calling: no se confirma explícitamente en la información disponible, aunque es una capacidad típica de la familia Qwen3.5.
- Soporte de agentes y razonamiento multi-step: el diseño de auto-andamiaje sugiere capacidad para descomponer problemas y ejecutar pasos intermedios.
- Multilingüismo: no especificado por el autor; el modelo base Ornith-1.5 no publica la lista de idiomas soportados.

## Casos de uso

- Asistente de código con entrada visual: el modelo puede recibir capturas de pantalla o diagramas y generar código o explicaciones técnicas, útil en entornos de desarrollo con documentación visual.
- Automatización de pruebas de UI: dado un screenshot de una interfaz, el modelo puede generar scripts de prueba o describir los elementos visuales, integrable en pipelines de CI/CD.
- Análisis de documentación técnica: procesamiento de imágenes de gráficos, esquemas o documentación impresa para extraer información y generar resúmenes en lenguaje natural.
- Asistente de investigación multimodal: permite analizar figuras de artículos científicos y combinar la información visual con razonamiento textual para generar hipótesis o resúmenes.
- Generación de contenido accesible: descripción automática de imágenes para personas con discapacidad visual, con contexto largo para conversaciones multi-turno.
- Agente de soporte técnico con capturas de pantalla: el usuario envía una captura de un error y el modelo la analiza, genera una explicación y sugiere pasos de resolución, aprovechando los 262.144 tokens de contexto para mantener el historial completo de la conversación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor de la cuantización indica que los resultados de Shiftedx Bench se adjuntarán en una actualización posterior de la model card, pero no se incluyen en el momento de redactar esta ficha.

## Requisitos de hardware

- VRAM estimada: el tamaño lógico del checkpoint es de 8,87 GB, por lo que se recomienda un mínimo de 12-16 GB de memoria unificada en Apple Silicon para ejecutar la inferencia con comodidad.
- GPU recomendadas: cualquier chip Apple Silicon con 16 GB o más (M1 Pro/Max, M2 Pro/Max, M3/M4 con 16 GB o más).
- Compatibilidad con GPU de consumo: no aplica en el sentido tradicional; el formato MLX está específicamente diseñado para Apple Silicon y no se ejecuta en GPUs NVIDIA o AMD.
- Opciones de despliegue: MLX-VLM (comando `python -m mlx_vlm.generate`), MLX-LM para el tronco de lenguaje, y potencialmente integración con librerías del ecosistema MLX.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Ornith-1.5-9B (base) | 9B | 262.144 | MIT | BF16 original | Modelo completo sin cuantizar |
| Ornith-1.0-9B | 9B | no disponible | MIT | BF16 | Versión anterior de la familia |
| Qwen3-VL-9B | 9B | 262.144 | Apache 2.0 | BF16 | Modelo base de la familia Qwen3.5, sin cuantización híbrida |
| Shiftedx/ornith-1.5-9b-attention8-bf16recurrence-vision-mlx | 2,64B (pesos) | 262.144 | MIT | Híbrida (affine-8/4 + BF16) | Cuantización para Apple Silicon |

La comparativa se basa en datos estructurales; no hay resultados de benchmarks disponibles para el modelo cuantizado ni para los alternativos en la información recopilada.

## Limitaciones y advertencias

- La cuantización híbrida puede diferir comportamiento del checkpoint BF16 original; el autor recomienda revisar la model card upstream para el uso previsto.
- No se dispone de resultados de benchmarks oficiales para este checkpoint, por lo que el rendimiento en tareas concretas no está validado.
- El modelo está diseñado exclusivamente para Apple Silicon (MLX); no es ejecutable en GPU NVIDIA o AMD sin conversión previa a otro formato.
- La decodificación MTP (multi-token prediction) no está disponible, lo que puede afectar la latencia en generación de texto largo.
- Los idiomas soportados no están especificados; el comportamiento multilingüe no está garantizado.
- La licencia MIT permite uso comercial sin restricciones, pero el modelo base Ornith-1.5-9B tiene su propia licencia que debe revisarse en el repositorio upstream.
- El checkpoint tiene 0 descargas y 0 likes en el momento de la publicación, lo que indica que es un lanzamiento reciente y sin validación comunitaria amplia.

## Enlaces

- Repositorio HuggingFace del modelo cuantizado: https://huggingface.co/Shiftedx/ornith-1.5-9b-attention8-bf16recurrence-vision-mlx
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Colección Ornith-1.5: https://huggingface.co/collections/ornith-ai/ornith-15
- Página de Ornith-1.5 (artículo técnico): https://ornith.ai/ornith_1_5.html
- Guía de Ornith AI: https://ornith.online/
- Sitio principal de Ornith AI: https://ornith.ai/
- Checkpoint cuantizado de Ornith-1.0-9B (referencia de la familia): https://huggingface.co/Shiftedx/ornith-1.0-9b-abliterated-mxfp4-mlx
