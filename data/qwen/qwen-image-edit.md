# Qwen/Qwen-Image-Edit

## Resumen

Qwen-Image-Edit es un modelo de edición de imágenes desarrollado por Alibaba (equipo Qwen), presentado en agosto de 2025. Se construye sobre Qwen-Image, el modelo de generación de imágenes de 20B parámetros de la familia Qwen, y extiende sus capacidades al dominio de la edición visual. El modelo aborda dos tipos de edición: edición semántica (modificación de contenido preservando la identidad visual, como rotación de objetos o transferencia de estilo) y edición de apariencia (cambios locales que mantienen el resto de la imagen intacto, como añadir o eliminar elementos).

La arquitectura combina un codificador Qwen2.5-VL para el control semántico y un codificador VAE para el control de apariencia, procesando simultáneamente la imagen de entrada. El modelo soporta edición de texto bilingüe (chino e inglés) preservando la fuente, tamaño y estilo originales del texto en la imagen. Con 20.430 millones de parámetros y licencia Apache 2.0, se posiciona como una alternativa abierta y potente frente a soluciones propietarias de edición de imágenes.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion transformer (DiT) con codificadores duales (Qwen2.5-VL + VAE) |
| Parametros totales | 20.430.401.088 (20,4B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible oficialmente; soporta bfloat16 para inferencia |
| Idiomas soportados | Inglés, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, compatible con diffusers y ComfyUI |

## Arquitectura y entrenamiento

Qwen-Image-Edit se basa en la arquitectura de Qwen-Image, un modelo de difusión de tipo transformer (DiT) de 20B parámetros. La innovación principal reside en su sistema de doble codificación: la imagen de entrada se alimenta simultáneamente a un codificador Qwen2.5-VL (que captura el significado semántico de la imagen) y al codificador VAE (que preserva los detalles de apariencia visual). Esta combinación permite al modelo distinguir entre ediciones que deben mantener la identidad visual (edición semántica) y ediciones que deben preservar píxeles exactos (edición de apariencia).

Los detalles del entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO) no se detallan en la información disponible. El modelo se publica con una licencia Apache 2.0 y se distribuye a través de la librería diffusers de Hugging Face, con una pipeline dedicada (`QwenImageEditPipeline`). El informe técnico completo está disponible en el enlace del paper (arXiv:2508.02324).

## Capacidades

- Edición semántica: modifica el contenido conceptual de la imagen manteniendo la identidad del sujeto (por ejemplo, cambiar la pose de un personaje, rotar objetos, transferir estilo artístico).
- Edición de apariencia: añade, elimina o modifica elementos específicos de la imagen dejando el resto de los píxeles inalterados.
- Edición de texto bilingüe: añade, elimina o modifica texto dentro de imágenes en inglés y chino, preservando la fuente, el tamaño y el estilo del texto original.
- Transferencia de estilo: transforma retratos o escenas a estilos artísticos concretos (por ejemplo, estilo Studio Ghibli).
- Síntesis de nuevas vistas: rota objetos hasta 180 grados y permite visualizar el reverso de los objetos.
- Consistencia de personaje: mantiene la identidad visual de personajes o mascotas en diferentes ediciones y escenarios.

## Casos de uso

- **Creación de contenido para redes sociales**: editar imágenes de producto o personajes para generar variaciones de campañas (cambiar colores, añadir elementos, aplicar estilos) manteniendo la identidad visual de la marca.
- **Diseño de packs de emojis y stickers**: a partir de un personaje o mascota, generar una serie de variaciones con diferentes expresiones y contextos (como los packs MBTI creados por Qwen).
- **Corrección y edición de texto en imágenes**: modificar carteles, capturas de pantalla o gráficos con texto incorrecto, cambiando el contenido textual sin regenerar toda la imagen.
- **Postproducción fotográfica**: eliminar elementos no deseados, cambiar colores de objetos o alterar el fondo de una fotografía manteniendo el sujeto intacto.
- **Generación de vistas alternativas para e-commerce**: rotar productos 90° o 180° para mostrar el reverso o los laterales sin necesidad de sesiones fotográficas adicionales.
- **Desarrollo de IP y personajes virtuales**: crear variaciones de un personaje en distintos escenarios y estilos artísticos para animación, videojuegos o cómics.
- **Prototipado de diseño**: los equipos de diseño pueden generar rápidamente variantes de una pieza visual (cambios de estilo, color o composición) para evaluar opciones antes de la producción final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que el modelo logra "estado del arte" en múltiples benchmarks públicos de edición de imágenes, pero no se proporcionan cifras concretas. El informe técnico (arXiv:2508.02324) puede contener datos adicionales, pero no están disponibles en la información facilitada.

## Requisitos de hardware

- VRAM estimada: el modelo tiene 20,4B parámetros. En bfloat16, el peso ocupa aproximadamente 41 GB. La inferencia requiere al menos 48 GB de VRAM en configuraciones sin cuantización, aunque el uso de cuantización (si estuviera disponible) podría reducir este requisito.
- GPUs recomendadas: A100 (80 GB), H100 (80 GB) o configuraciones multi-GPU para producción.
- GPU de consumo: no cabe en GPUs de consumo típicas (RTX 4090 con 24 GB es insuficiente para el modelo completo en bfloat16). Sería necesario cuantizar o usar técnicas de offloading, pero no se han documentado opciones de cuantización oficiales.
- Opciones de despliegue: diffusers (con la pipeline `QwenImageEditPipeline`), ComfyUI, NVIDIA NIM y Qwen Chat (versión alojada). También está disponible en ModelScope.
- Latencia y throughput: no disponible en la información facilitada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Qwen-Image-Edit | 20,4B | No disponible | Apache 2.0 | Edición semántica + apariencia + texto |
| InstructPix2Pix | 1,1B | No disponible | Apache 2.0 | Edición basada en instrucciones |
| SeedEdit (ByteDance) | No disponible | No disponible | No disponible | Edición de imágenes con texto |

La comparación con alternativas más recientes (como SeedEdit o modelos de edición de Google) no se puede completar con datos fiables, ya que la información disponible no incluye comparativas cuantitativas. Qwen-Image-Edit destaca por su tamaño (20B) y por la combinación de edición semántica y de apariencia con soporte de texto bilingüe, una combinación poco común en modelos abiertos.

## Limitaciones y advertencias

- **Requisitos de hardware elevados**: el modelo necesita al menos 48 GB de VRAM en bfloat16, lo que limita su uso en GPUs de consumo y entornos de producción con presupuesto reducido.
- **Idiomas**: el modelo soporta únicamente inglés y chino. No se ha confirmado soporte para otros idiomas en las ediciones de texto.
- **Riesgo de alucinación**: como cualquier modelo generativo, puede producir artefactos visuales o modificar elementos de forma inesperada, especialmente en ediciones complejas o imágenes de alta resolución.
- **Sesgos**: no se han documentado sesgos específicos, pero al ser un modelo entrenado con datos de internet, puede heredar sesgos culturales o de género presentes en los datos de entrenamiento.
- **Uso comercial**: la licencia Apache 2.0 permite uso comercial sin restricciones, pero es recomendable revisar los términos de la licencia de los datos de entrenamiento si se usan en productos comerciales.
- **Consistencia en ediciones de apariencia**: la model card indica que la edición de apariencia requiere que el resto de la imagen quede completamente inalterado, pero en la práctica puede haber variaciones mínimas en la textura o el color en regiones no editadas.

## Enlaces

- Hugging Face: https://huggingface.co/Qwen/Qwen-Image-Edit
- Demo: https://huggingface.co/spaces/Qwen/Qwen-Image-Edit
- Blog del modelo: https://qwenlm.github.io/blog/qwen-image-edit/
- Informe técnico: https://qianwen-res.oss-cn-beijing.aliyuncs.com/Qwen-Image/Qwen_Image.pdf
- GitHub: https://github.com/QwenLM/Qwen-Image
- ModelScope: https://modelscope.cn/models/Qwen/Qwen-Image-Edit
- Qwen Chat: https://chat.qwen.ai
- NVIDIA NIM: https://build.nvidia.com/qwen/qwen-image-edit
- Paper: arXiv:2508.02324
