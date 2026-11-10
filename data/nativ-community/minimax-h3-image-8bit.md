# nativ-community/MiniMax-H3-Image-8bit

## Resumen

MiniMax-H3-Image-8bit es una conversión cuantizada a 8 bits del modelo MiniMax-H3-Image original, publicada por el colectivo nativ-community. Se trata de un checkpoint en formato MLX (safetensors) pensado para ejecutar generación de imágenes texto-a-imagen y edición nativa de imágenes sobre Apple Silicon, sin depender de PyTorch ni de Diffusers. El modelo base lo desarrolla MiniMaxAI y combina un transformer de difusión con un condicionador multimodal Qwen3-VL que conserva su torre de visión para tareas de edición.

El paquete completo ocupa aproximadamente 77,3 GB (72,0 GiB) en disco y se divide en tres componentes: el condicionador Qwen3-VL (27,49 GB), el transformer de difusión (47,48 GB) y el VAE de imagen (2,34 GB). La cuantización aplica 8 bits afines con tamaño de grupo 64 a las capas lineales y de embedding elegibles, mientras que el VAE, las capas de modulación del transformer y las proyecciones de entrada/tiempo/salida mantienen su precisión original.

Su relevancia actual radica en que permite ejecutar un modelo de generación y edición de imágenes de gran tamaño de forma local en hardware Apple con memoria unificada, algo poco habitual en esta categoría. El autor valida inferencia offline en un Apple M5 Max con 128 GiB de memoria unificada, generando una imagen de 4096×4096 en 238,4 segundos y una edición a 2048×2048 en 120,2 segundos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de difusión + condicionador multimodal Qwen3-VL + VAE de imagen |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 8 bits afín con grupo de 64 (capas lineales y embeddings); VAE, modulación y proyecciones en precisión original |
| Idiomas soportados | no disponible |
| Licencia | MiniMax H3 Image Community License Agreement (license: other) |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo sigue un esquema de difusión texto-a-imagen con un condicionador multimodal basado en Qwen3-VL. El condicionador conserva su torre de visión, lo que habilita la edición de imágenes con hasta dieciséis imágenes de referencia ordenadas (`<Picture 1>`, `<Picture 2>`, etc.). El pipeline incluye un VAE de imagen independiente y un transformer de difusión que cachea las proyecciones AdaLN de horario fijo para poder liberar sus pesos grandes durante la inferencia.

La conversión a MLX mantiene la precisión original en el VAE, en las capas de modulación del transformer y en las proyecciones de entrada, tiempo y salida, además de normalizaciones y convoluciones. La cuantización de 8 bits con grupo 64 se aplica solo a capas lineales y de embedding elegibles, tanto del transformer como del condicionador. El muestreo está fijado en seis pasos con guidance 1, y las peticiones de salida pequeñas se generan primero en un lienzo equivalente a 2048×2048 antes de redimensionar. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO.

## Capacidades

- Generación de imágenes texto-a-imagen con resolución de salida configurable (validado a 4096×4096).
- Edición nativa de imágenes con hasta dieciséis imágenes de referencia ordenadas.
- Condicionamiento multimodal mediante Qwen3-VL, con torre de visión activa para edición.
- Expansión automática de prompts cortos mediante el modelo separado MiniMaxAI/MiniMax-H3-Image-PE (pesos NVFP4 independientes).
- Modo offline completo cuando se desactiva la expansión de prompts.
- Ejecución en Apple Silicon mediante MLX, sin PyTorch ni Diffusers.
- Control de semilla para reproducibilidad (`--seed`).
- Soporte de instrucciones de edición referenciadas por índice de imagen (`<Picture N>`).

## Casos de uso

- Generación de imágenes de alta resolución en local: el modelo permite crear imágenes de 4096×4096 en un Apple M5 Max con 128 GiB, útil para estudios que necesitan material gráfico sin enviar datos a servicios en la nube.
- Edición de imágenes con múltiples referencias: gracias al soporte de hasta dieciséis imágenes ordenadas, se pueden aplicar cambios preservando la forma, la iluminación y otros elementos de las referencias, como demuestra el ejemplo de cambiar el color de una tetera manteniendo la taza y la luz.
- Prototipado de pipelines de imagen en macOS: al funcionar sobre MLX sin PyTorch, se integra en flujos de desarrollo nativos de Apple Silicon y facilita pruebas rápidas en portátiles y estaciones de trabajo Mac.
- Flujos offline con requisitos de privacidad: al desactivar la expansión de prompts, el checkpoint puede ejecutarse completamente offline tras la descarga, lo que encaja en entornos con datos sensibles.
- Iteración creativa con control de semilla: la fijación de semilla y de pasos de muestreo permite reproducir resultados y comparar variaciones de prompt de forma controlada.
- Investigación sobre cuantización de modelos de difusión: el checkpoint sirve para estudiar el impacto de la cuantización 8-bit con grupo 64 en la calidad de generación y edición frente a los pesos originales en punto flotante.
- Automatización de edición por lotes: la API de Python (`generate_image`) permite integrar generación y edición en scripts que procesen varias imágenes con instrucciones referenciadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor únicamente reporta tiempos de validación en un Apple M5 Max con 128 GiB de memoria unificada, MLX 0.32.4, semilla 42, seis pasos, guidance 1 y expansión de prompts desactivada:

| Tarea | Resolución de salida | Tiempo total |
|---|---:|---:|
| Generación | 4096×4096 | 238,4 s |
| Edición | 2048×2048 | 120,2 s |

## Requisitos de hardware

- VRAM/memoria estimada: el checkpoint completo ocupa 77,3 GB (72,0 GiB) en disco; la validación se realizó con 128 GiB de memoria unificada, por lo que se recomienda ese orden de magnitud para cargar todos los componentes.
- GPU recomendadas: Apple Silicon con memoria unificada amplia; la validación oficial usa un Apple M5 Max con 128 GiB.
- Compatibilidad con GPU de consumo: no hay información sobre ejecución en GPU NVIDIA o AMD; el formato MLX está orientado a Apple Silicon.
- Opciones de despliegue: `mlx-vlm` (CLI `mlx_vlm.generate` y API Python `generate_image` / `load_image_generation_model`), requiriendo una versión con soporte para MiniMax-H3-Image o la rama de implementación del PR indicado.
- Latencia y throughput: 238,4 s para una generación a 4096×4096 y 120,2 s para una edición a 2048×2048 en el hardware de validación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMax-H3-Image-8bit | no disponible | no disponible | safetensors (MLX, 8-bit) | MiniMax H3 Image Community License | Hugging Face, 0 descargas |
| MiniMaxAI/MiniMax-H3-Image (original) | no disponible | no disponible | punto flotante (Diffusers) | MiniMax H3 Image Community License | Hugging Face |
| MiniMaxAI/MiniMax-H3-Image-PE | no disponible | no disponible | NVFP4 | no disponible | Hugging Face (modelo auxiliar de expansión de prompts) |

No se dispone de datos de rendimiento comparativo entre estas variantes ni con otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- La licencia es la MiniMax H3 Image Community License Agreement, no una licencia permisiva; es necesario revisar sus términos antes de cualquier uso comercial.
- El modelo está diseñado para MLX y Apple Silicon; no hay información sobre soporte en otras plataformas.
- Requiere una versión de `mlx-vlm` con soporte específico para MiniMax-H3-Image; hasta su inclusión en una release estable hay que instalar la rama de implementación.
- El muestreo está fijado en seis pasos y guidance 1, lo que limita el ajuste fino de la calidad frente a otros schedulers o configuraciones.
- Las peticiones de salida pequeñas se generan en un lienzo de al menos 2048×2048 antes de redimensionar, lo que puede afectar a la composición final.
- La expansión de prompts depende de un modelo separado (MiniMax-H3-Image-PE) con pesos NVFP4; sin él, la calidad con prompts cortos puede variar.
- No hay información sobre sesgos, tasas de alucinación visual ni idiomas soportados.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que la validación comunitaria es inexistente.
- El tamaño de 77,3 GB exige hardware con memoria unificada muy amplia; no cabe en configuraciones de consumo convencionales.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nativ-community/MiniMax-H3-Image-8bit
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image
- Modelo de expansión de prompts: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image-PE
- Licencia: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image/blob/main/LICENSE
- PR de implementación en mlx-vlm: https://github.com/Neywa-Labs/mlx-vlm/pull/2702
- Rama de implementación: https://github.com/lucasnewman/mlx-vlm.git (rama `minimax-h3-image`)
- Implementación de referencia en Diffusers (Apache-2.0): https://github.com/huggingface/diffusers/blob/main/LICENSE
