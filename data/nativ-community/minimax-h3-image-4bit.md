# nativ-community/MiniMax-H3-Image-4bit

## Resumen

MiniMax-H3-Image-4bit es una conversión cuantizada a 4 bits del modelo MiniMax-H3-Image original de MiniMaxAI, publicada por el colectivo nativ-community. Se trata de un modelo de generación de imágenes texto-a-imagen que además soporta edición nativa de imágenes con hasta dieciséis imágenes de referencia ordenadas. La conversión está pensada exclusivamente para inferencia sobre Apple Silicon mediante MLX, sin dependencia de PyTorch ni de Diffusers.

El checkpoint combina dos grandes bloques: un condicionador multimodal Qwen3-VL (que conserva su torre de visión para tareas de edición) y un transformer de difusión, junto con un VAE de imagen. Frente a los pesos originales en coma flotante, esta versión aplica cuantización afín de 4 bits con tamaño de grupo 64 a las capas lineales y de embedding elegibles, reduciendo el peso total del repositorio a unos 54,5 GB.

Es relevante para desarrolladores e investigadores que trabajan en Macs con memoria unificada grande (el autor valida el modelo en un Apple M5 Max con 128 GiB) y necesitan ejecutar generación y edición de imágenes de alta resolución de forma local y offline, sin infraestructura CUDA. La licencia es la MiniMax H3 Image Community License, no una licencia permisiva estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (generación de imágenes) + condicionador multimodal Qwen3-VL + VAE de imagen |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit afín con tamaño de grupo 64 (capas lineales y de embedding); VAE, modulación del transformer, proyecciones de entrada/tiempo/salida, normalizaciones y convoluciones en precisión original |
| Idiomas soportados | no disponible (modelo texto-a-imagen; el condicionador es Qwen3-VL) |
| Licencia | MiniMax H3 Image Community License Agreement |
| Formato de pesos | safetensors (MLX) |
| Tamano del repositorio | 54,5 GB (50,7 GiB) |
| Libreria de inferencia | mlx-vlm |
| Plataforma | Apple Silicon (MLX) |

Desglose de componentes del checkpoint:

| Componente | Ficheros de pesos | Tamano (GB decimales) |
|---|---:|---:|
| Condicionador Qwen3-VL | 3 | 14,683 |
| Transformer de difusión | 8 | 37,445 |
| VAE de imagen | 1 | 2,337 |

## Arquitectura y entrenamiento

La arquitectura sigue un esquema de difusión condicionada por texto: un transformer de difusión genera la imagen y un condicionador Qwen3-VL procesa el prompt textual y, en tareas de edición, las imágenes de referencia. El VAE codifica y decodifica entre el espacio de píxeles y el espacio latente. En esta conversión concreta, el condicionador conserva su torre de visión para permitir la edición de imágenes, mientras que el VAE, las capas de modulación del transformer y las proyecciones de entrada/tiempo/salida mantienen la precisión de los pesos originales.

El muestreo está fijado a seis pasos con guidance 1. Las peticiones de salida pequeñas se generan primero en un lienzo equivalente a 2048×2048 como mínimo y después se redimensionan. Para reducir el consumo de memoria, el condicionador se libera antes de la fase de difusión y el transformer cachea las proyecciones AdaLN de esquema fijo para poder liberar sus pesos grandes. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF/DPO en la información proporcionada.

## Capacidades

- Generación de imágenes texto-a-imagen con resolución de salida configurable (validado a 4096×4096).
- Edición nativa de imágenes, incluyendo hasta dieciséis imágenes de referencia ordenadas e identificadas como `<Picture 1>`, `<Picture 2>`, etc.
- Comprensión de prompts detallados en lenguaje natural para control fino de la escena (iluminación, materiales, composición).
- Expansión automática de prompts cortos mediante un modelo separado (MiniMaxAI/MiniMax-H3-Image-PE), desactivable para trabajar totalmente offline.
- Ejecución local en Apple Silicon sin PyTorch ni Diffusers.
- No se documenta soporte de tool calling, agentes ni audio en la información disponible.

## Casos de uso

- Generación de imágenes de producto en alta resolución: el modelo permite fijar una resolución de 4096×4096 y una semilla para obtener resultados reproducibles, útil para catálogos y prototipos de marketing en local.
- Edición de imágenes con instrucciones en lenguaje natural: usando `--task edit` y una imagen de referencia, se pueden aplicar cambios localizados (por ejemplo, recolorear un objeto) preservando forma e iluminación, gracias a la torre de visión del condicionador.
- Composición con múltiples referencias: el soporte de hasta dieciséis imágenes ordenadas permite tareas de estilo, sustitución de fondos o combinación de elementos de varias fuentes.
- Iteración creativa offline: al desactivar la expansión de prompts, el checkpoint funciona sin conexión, lo que encaja en entornos con requisitos de privacidad o sin acceso a red.
- Prototipado en estaciones de trabajo Mac: desarrolladores con Apple Silicon y memoria unificada grande pueden validar pipelines de imagen sin GPU NVIDIA, usando MLX.
- Automatización de variaciones controladas: la semilla fija y los seis pasos de muestreo permiten generar variaciones deterministas para pruebas A/B de creatividades.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

Los únicos datos de rendimiento proporcionados son tiempos de validación en un Apple M5 Max con 128 GiB de memoria unificada, MLX 0.32.4, semilla 42, seis pasos, guidance 1 y expansión de prompt desactivada:

| Tarea | Resolución de salida | Tiempo total transcurrido |
|---|---:|---:|
| Generación | 4096×4096 | 180,1 s |
| Edición | 2048×2048 | 88,4 s |

## Requisitos de hardware

- Memoria: el checkpoint ocupa 54,5 GB en disco; la validación se realizó con 128 GiB de memoria unificada, por lo que se recomienda ese orden de magnitud para generación a 4K.
- Plataforma: exclusivamente Apple Silicon mediante MLX; no hay soporte documentado para CUDA.
- GPU recomendadas: no disponible (el modelo no está orientado a GPUs discretas; requiere memoria unificada de Apple Silicon).
- ¿Cabe en GPU de consumo? No aplica en el sentido habitual; en Macs de consumo con memoria unificada insuficiente (por debajo de ~64 GiB) no es viable.
- Despliegue: `mlx-vlm` (versión con soporte para MiniMax-H3-Image, o la rama de implementación `lucasnewman/mlx-vlm@minimax-h3-image`).
- Latencia y throughput: 180,1 s para una imagen 4096×4096 y 88,4 s para una edición 2048×2048 en M5 Max con 128 GiB.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de benchmarks ni especificaciones de modelos alternativos que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Licencia restrictiva: se rige por la MiniMax H3 Image Community License, no por una licencia permisiva; es imprescindible revisar sus términos antes de cualquier uso comercial.
- Plataforma limitada: solo funciona en Apple Silicon con MLX; no es portable a CUDA ni a otros entornos sin reconversión.
- Requisitos de memoria elevados: 54,5 GB de pesos y validación con 128 GiB de memoria unificada implican que no cabe en equipos modestos.
- Muestreo fijo: seis pasos y guidance 1 no son configurables según la documentación, lo que limita el ajuste fino de calidad frente a velocidad.
- Dependencia de versión: requiere una versión de `mlx-vlm` con soporte específico; hasta su inclusión en una release estable hay que instalar la rama de implementación.
- Expansión de prompt: por defecto usa un modelo externo (MiniMax-H3-Image-PE) con pesos NVFP4 separados; para uso totalmente offline hay que desactivarla.
- Riesgo de alucinación visual y sesgos: no se documentan evaluaciones de sesgo ni de fidelidad; como todo modelo generativo de imágenes, puede producir contenido inexacto o estereotipado.
- Idiomas: no se especifican los idiomas soportados por el condicionador; se desconoce el comportamiento en castellano.
- Repositorio sin tracción: cero descargas y cero likes en el momento de la consulta, lo que reduce la validación comunitaria disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nativ-community/MiniMax-H3-Image-4bit
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image
- Modelo de expansión de prompts: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image-PE
- Licencia: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image/blob/main/LICENSE
- PR de implementación en mlx-vlm: https://github.com/Neywa-Labs/mlx-vlm/pull/2702
- Rama de implementación: https://github.com/lucasnewman/mlx-vlm/tree/minimax-h3-image
- Implementación de referencia en Diffusers (Apache-2.0): https://github.com/huggingface/diffusers/blob/main/LICENSE
