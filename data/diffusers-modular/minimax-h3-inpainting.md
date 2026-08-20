# diffusers-modular/minimax-h3-inpainting

## Resumen

`diffusers-modular/minimax-h3-inpainting` es un conjunto de bloques modulares para la librería Diffusers que permite realizar inpainting de vídeo y audio sobre el modelo MiniMax-H3, desarrollado por MiniMax-AI. En lugar de requerir un checkpoint dedicado, un adaptador o canales de entrada adicionales, esta técnica convierte la máscara de edición en un timestep por fila dentro del proceso de denoising, aprovechando una propiedad ya existente en el modelo base. Así se puede repintar una parte concreta de un clip (por ejemplo, reemplazar un sujeto) manteniendo intacto el resto del fotograma, el movimiento de cámara y la banda sonora original.

El modelo base MiniMax-H3 es un sistema generativo omni-modal que entiende y genera texto, imagen, vídeo y audio, con capacidad de producir vídeo con audio estéreo nativo a resoluciones de hasta 2K y duraciones de hasta 15 segundos. Esta ficha se centra en el bloque modular de inpainting, que añade una capa de control fino sobre ese modelo. La relevancia actual radica en que ofrece una vía práctica para edición de vídeo y audio con IA generativa sin necesidad de reentrenar ni ajustar pesos, y se integra directamente en el ecosistema Diffusers.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible; el modelo base MiniMax-H3 es un sistema omni-modal de difusión con generación de vídeo y audio |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; el código de ejemplo usa `torch.bfloat16` |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible; se usa a través de Diffusers (probablemente safetensors) |

## Arquitectura y entrenamiento

El bloque modular no introduce una arquitectura nueva, sino que explota el mecanismo interno de MiniMax-H3. Según la model card, MiniMax-H3 denoisa una secuencia empaquetada en la que cada fila (token) lleva su propio timestep. Esto permite que una fila anclada a un fotograma clave esté en `t = 0.999` (esencialmente limpia) mientras otras filas avanzan por el schedule de denoising. La técnica de inpainting consiste en asignar a las filas enmascaradas el timestep real del schedule, y a las filas preservadas un timestep máximo (`max(t, 0.999)` para vídeo, `1.0` para audio). De esta forma, el modelo recibe una distribución de timesteps que ya conoce, evitando la mezcla fuera de distribución que ocurriría al re-noisar la fuente y mezclarla.

No hay entrenamiento adicional ni adaptadores: es una técnica de inferencia pura. Los datos de entrenamiento del modelo base no se han publicado en la información disponible. La implementación incluye funciones de conversión de máscaras de píxeles a filas (`pixel_mask_to_row_mask`) y de audio (`audio_mask_to_row_mask`), que tienen en cuenta la compresión espacial del VAE (16×), el parcheado 2×2 del transformer, el agrupamiento causal temporal `(1, 4, 4, 4, 4)` cada 17 fotogramas, y el reloj de audio de 40 latentes por segundo.

## Capacidades

- Inpainting de vídeo y audio: repinta una región enmascarada de un clip manteniendo el resto, incluida la pista de sonido original.
- Edición con referencia de imagen (`ref2va`): acepta una o más imágenes de referencia para guiar el contenido repintado.
- Preservación del audio: si se conserva la banda sonora, el modelo puede animar los labios o gestos según las palabras ya presentes (lip-sync).
- Máscaras duras o suavizadas: soporta ambos tipos, aunque se recomienda usar máscaras duras para evitar bandas visibles en los bordes.
- Control fino de la máscara: la máscara se aplica en tres grids (espacial, temporal y de audio) mediante reducciones por máximo.
- Integración con Diffusers: se usa a través de `ModularPipelineBlocks`, compatible con el flujo estándar de la librería.
- Generación de vídeo y audio en un solo paso: el modelo base produce ambas modalidades de forma conjunta.

## Casos de uso

- Reemplazo de sujetos en vídeo: dado un clip con un animal, se puede sustituir por una persona usando una foto de referencia. La máscara debe cubrir bien al sujeto y el prompt especifica la nueva apariencia. El fondo, el movimiento de cámara y el audio se conservan.
- Edición de objetos en postproducción: cambiar un elemento concreto de una escena (un cartel, un vehículo) sin regenerar el clip completo. La técnica de timestep por fila permite mantener la coherencia temporal.
- Lip-sync en vídeos existentes: si se conserva el audio original, el modelo puede ajustar la boca del sujeto para que coincida con las palabras, sin necesidad de re-grabar nada.
- Eliminación de objetos no deseados: aunque el modo `t2va` es más adecuado para eliminación sin referencia, con `ref2va` se puede reemplazar un objeto por contenido plausible del entorno.
- Creación de variantes de una escena: cambiar la iluminación, la estación o el vestuario de un personaje manteniendo la composición y el audio.
- Edición de audio localizada: mediante `audio_mask`, se puede repintar solo una parte de la banda sonora (por ejemplo, un sonido concreto) mientras el resto permanece intacto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.) para este bloque modular. La model card reporta métricas de calidad internas:

- Diferencia media absoluta en la región preservada: 1.44/255 frente a la fuente (el suelo del autoencoder), frente a 40.0/255 dentro de la máscara.
- Similitud coseno del audio preservado: 0.972.
- Con la máscara completamente activa, el bloque reproduce el comportamiento de `ref2va` bit a bit, tanto en vídeo como en audio.

Estos valores indican que la técnica de inpainting introduce una degradación mínima en las zonas no editadas.

## Requisitos de hardware

- No se especifica VRAM mínima en la información disponible. El modelo base MiniMax-H3 requiere una GPU con memoria suficiente para manejar vídeo y audio a resoluciones de hasta 2K; se recomienda una GPU de gama alta (por ejemplo, NVIDIA A100, H100 o RTX 4090) para tiempos de inferencia razonables.
- El código de ejemplo carga los componentes en `torch.bfloat16` y ejecuta en CUDA.
- La model card indica un tiempo de 5–15 segundos por pasada para clips de duración moderada. Clips más largos deben procesarse en segmentos.
- El script `crop.py` incluido permite recortar el área de la máscara para reducir el coste de memoria, ya que el coste depende del lienzo (canvas) y no de cuánto cambia el fotograma.
- Opciones de despliegue: se integra con Diffusers, por lo que puede usarse con pipelines personalizados. Para despliegue en producción, se podría combinar con vLLM-Omni o SGLang (según la guía de kingy.ai), aunque no se detalla en la información proporcionada.

## Comparativa con modelos similares

No disponible. No se han encontrado modelos comparables que ofrezcan inpainting de vídeo y audio con la misma técnica de timestep por fila. La mayoría de soluciones de inpainting de vídeo (por ejemplo, modelos basados en Stable Video Diffusion) no integran audio nativo ni preservación de la pista sonora. Esta implementación es específica para MiniMax-H3.

## Limitaciones y advertencias

- Requiere al menos una imagen de referencia para el modo `ref2va`. La eliminación de objetos sin referencia es competencia del modo `t2va`, que no está cubierto por este bloque.
- El decoder de vídeo no es perfectamente local: los cambios dentro de la máscara afectan a los píxeles justo fuera de ella. Se reportan 5.5/255 de diferencia a 8 píxeles, 1.2/255 a 32 píxeles y desaparece a 128 píxeles. Hay que tenerlo en cuenta al componer el resultado final.
- Las máscaras suaves (feathered) pueden producir bandas visibles en los bordes. Se recomienda usar máscaras duras y generar a la resolución original de la placa.
- La geometría de la máscara condiciona el resultado: una máscara demasiado ajustada al sujeto puede forzar posturas antinaturales (por ejemplo, una persona a cuatro patas si la máscara tiene forma de cuadrúpedo). Hay que dar margen alrededor del sujeto.
- El prompting por plano es necesario: enmascarar no elimina la necesidad de describir con precisión lo que se quiere generar.
- Clips largos deben segmentarse, ya que el modelo trabaja con duraciones limitadas (hasta 15 segundos según el modelo base).
- No se dispone de información sobre sesgos, alucinaciones o limitaciones idiomáticas específicas de este bloque. La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar la licencia del modelo base MiniMax-H3 por si tuviera restricciones adicionales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/diffusers-modular/minimax-h3-inpainting
- Código fuente en Diffusers (carpeta modular_pipelines/minimax_h3): https://github.com/huggingface/diffusers/tree/main/src/diffusers/modular_pipelines/minimax_h3
- Modelo base MiniMax-H3 en HuggingFace: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Repositorio oficial de MiniMax-H3: https://github.com/MiniMax-AI/MiniMax-H3
- Guía de instalación y hardware para MiniMax H3: https://kingy.ai/ai/ai-guides/minimax-h3-local-installation-hardware-guide/
- Documentación de Diffusers sobre inpainting: https://huggingface.co/docs/diffusers/using-diffusers/inpaint
