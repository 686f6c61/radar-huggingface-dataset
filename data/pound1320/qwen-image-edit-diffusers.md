# Pound1320/Qwen-Image-Edit-Diffusers

## Resumen

Qwen-Image-Edit-Diffusers es un repositorio de conversión que reempaqueta los pesos del modelo Qwen-Image-Edit-Rapid-AIO, desarrollado originalmente por Phr00t, en el formato nativo de la librería Diffusers. No se trata de un modelo entrenado desde cero, sino de una redistribución de los tensores del transformer de cada release de Rapid-AIO, organizados en carpetas versionadas con safetensors fragmentados y el `config.json` correspondiente. El autor de este repositorio (Pound1320) no modifica los pesos, solo los adapta para que puedan cargarse mediante `QwenImageTransformer2DModel.from_pretrained` con un `subfolder` por versión.

El modelo subyacente es un modelo de edición de imagen a imagen (image-to-image) basado en la arquitectura Qwen-Image-Edit, concretamente en los checkpoints Qwen/Qwen-Image-Edit-2509 y Qwen/Qwen-Image-Edit-2511 de Alibaba. Se distribuye como un transformer de difusión que debe combinarse con el text encoder, tokenizer, processor y VAE del modelo base para funcionar. El repositorio incluye múltiples versiones (V.1 a V.23 y posteriores), cada una con su propio subdirectorio.

La relevancia de este repositorio es práctica: facilita el uso de los fine-tunes de Rapid-AIO dentro del ecosistema Diffusers sin necesidad de conversiones manuales. La mayoría de las versiones (todas excepto V.15) están marcadas como NSFW, mientras que V.15 es la única release SFW y se basa en Qwen-Image-Edit-2511. El tamaño total del repositorio es de 715,1 GB, lo que refleja la acumulación de decenas de versiones del transformer.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (QwenImageTransformer2DModel), derivado de Qwen-Image-Edit |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16 recomendado en el ejemplo de uso) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (fragmentados en archivos de ~5 GB con indice) |

## Arquitectura y entrenamiento

El modelo es un transformer de difusión para edición de imágenes, compatible con la clase `QwenImageTransformer2DModel` de Diffusers y con el pipeline `QwenImageEditPlusPipeline`. Este repositorio no entrena ni modifica los pesos: copia los tensores del transformer original de Rapid-AIO tal cual, sin recuantizar, y los fragmenta en archivos safetensors de aproximadamente 5 GB con un archivo de índice. Antes de subirlos, el autor verifica que los nombres de los tensores coincidan exactamente con los esperados por `QwenImageTransformer2DModel` (sin tensores faltantes ni sobrantes) y utiliza el `config.json` del modelo base correspondiente.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo original de Phr00t, ya que la model card de este repositorio solo documenta el proceso de conversión. Los pesos originales son fine-tunes de Qwen-Image-Edit-2509 (para V.1 a V.14.x) y de Qwen-Image-Edit-2511 (para V.15 en adelante). El repositorio no incluye text encoder, tokenizer, processor ni VAE; estos deben cargarse desde el modelo base de Qwen.

## Capacidades

- Edición de imágenes a partir de una imagen de entrada y una instrucción textual (image-to-image), mediante el pipeline `QwenImageEditPlusPipeline`.
- Generación de variantes editadas de una imagen manteniendo coherencia con la instrucción proporcionada.
- Fine-tunes orientados a estilos y contenidos específicos según la versión (V.1 a V.14.x y V.16+ orientadas a contenido NSFW; V.15 orientada a contenido SFW).
- Compatibilidad con el ecosistema Diffusers: carga mediante `from_pretrained` con `subfolder` por versión.
- Soporte de precisión bfloat16 en el ejemplo oficial de uso.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de audio o vídeo.
- Capacidades multilingües: no disponibles (dependen del text encoder del modelo base Qwen-Image-Edit, no incluido en este repositorio).

## Casos de uso

- Edición fotográfica asistida: cargar una imagen y aplicar instrucciones textuales de modificación (cambio de estilo, retoque, sustitución de elementos) usando el pipeline `QwenImageEditPlusPipeline` con el transformer de la versión deseada.
- Prototipado rápido de pipelines de edición de imagen en Diffusers: al estar ya en formato Diffusers, se puede integrar directamente en scripts y notebooks sin pasos de conversión manual.
- Investigación sobre fine-tunes de modelos de edición de imagen: permite comparar el comportamiento de distintas versiones (V.1 a V.23) sobre el mismo modelo base cambiando únicamente el `subfolder`.
- Evaluación de variantes SFW frente a NSFW: la versión V.15 (SFW, basada en Qwen-Image-Edit-2511) permite trabajar en entornos con restricciones de contenido, mientras que el resto de versiones quedan para uso adulto.
- Desarrollo de herramientas creativas con control de versiones del modelo: la estructura de carpetas por versión facilita fijar una versión concreta en producción y actualizar de forma controlada.
- Integración en flujos de generación de imágenes por lotes: al ser un transformer de difusión estándar, puede servirse con backends compatibles con Diffusers (por ejemplo, scripts de inferencia basados en PyTorch) para procesar imágenes en lote.
- Experimentación con distintos checkpoints base: las versiones V.1–V.14.x usan Qwen-Image-Edit-2509 y las V.15+ usan Qwen-Image-Edit-2511, lo que permite estudiar diferencias entre ambas generaciones del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; al tratarse de un transformer de difusión de gran tamaño (el repositorio completo ocupa 715,1 GB repartidos en decenas de versiones), cada versión individual requiere una GPU con VRAM suficiente para cargar el transformer en bfloat16. El dato concreto de VRAM por versión no está documentado.
- GPU recomendadas: no disponible. Por el tamaño típico de los transformers de difusión de la familia Qwen-Image, se requerirían GPU de datacenter (A100, H100) o GPUs de consumo de gama alta con suficiente VRAM; el autor no especifica modelos concretos.
- ¿Cabe en GPU de consumo? no disponible; depende de la versión y de si se aplican técnicas de offloading o cuantización, no documentadas en la información proporcionada.
- Opciones de despliegue: Diffusers (PyTorch) mediante `QwenImageEditPlusPipeline` y `QwenImageTransformer2DModel`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un transformer de difusión de este tipo en el material disponible).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen-Image-Edit-Diffusers (este repo) | no disponible | no disponible | Transformer de difusion image-to-image (fine-tune) | Apache-2.0 | Hugging Face (Pound1320) |
| Qwen/Qwen-Image-Edit-2509 | no disponible | no disponible | Modelo base de edicion de imagen | Apache-2.0 | Hugging Face (Qwen) |
| Qwen/Qwen-Image-Edit-2511 | no disponible | no disponible | Modelo base de edicion de imagen | Apache-2.0 | Hugging Face (Qwen) |
| Phr00t/Qwen-Image-Edit-Rapid-AIO | no disponible | no disponible | Fine-tune original (formato no Diffusers) | no disponible en la informacion | Hugging Face (Phr00t) |

Los datos de parámetros, contexto y rendimiento de los modelos comparados no están disponibles en la información proporcionada; la comparativa se limita a licencia, tipo y disponibilidad.

## Limitaciones y advertencias

- Contenido NSFW: todas las versiones excepto V.15 están marcadas como NSFW y son solo para adultos; el usuario es responsable de su uso.
- El repositorio no incluye text encoder, tokenizer, processor ni VAE; sin el modelo base Qwen-Image-Edit correspondiente, el transformer no es funcional.
- Es un reempaquetado, no un modelo original: los pesos son de Phr00t y el repositorio no está afiliado ni a Phr00t ni al equipo de Qwen.
- Tamaño del repositorio muy elevado (715,1 GB), lo que implica requisitos de almacenamiento y ancho de banda considerables para su descarga.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; al depender de Qwen-Image-Edit, hereda las limitaciones del modelo base, no detalladas aquí.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero las versiones NSFW pueden estar sujetas a restricciones legales según la jurisdicción y la plataforma de despliegue.
- Idiomas soportados: no disponibles; dependen del text encoder del modelo base, no incluido.
- Sin métricas de rendimiento publicadas: no hay benchmarks que permitan evaluar la calidad de las ediciones frente a alternativas.
- Fecha de creación y actualización del repositorio: 2026-11-25 (según metadatos de Hugging Face).

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Pound1320/Qwen-Image-Edit-Diffusers
- Modelo original de Phr00t: https://huggingface.co/Phr00t/Qwen-Image-Edit-Rapid-AIO
- Modelo base Qwen-Image-Edit-2509: https://huggingface.co/Qwen/Qwen-Image-Edit-2509
- Modelo base Qwen-Image-Edit-2511: https://huggingface.co/Qwen/Qwen-Image-Edit-2511
