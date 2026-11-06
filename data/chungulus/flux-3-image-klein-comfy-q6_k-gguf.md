# Chungulus/flux-3-image-klein-comfy-Q6_K-GGUF

## Resumen

Este repositorio contiene una cuantización GGUF Q6_K del transformer de difusión del modelo FLUX 3 Image Klein, un modelo de generación y edición de imágenes desarrollado por Black Forest Labs. El artefacto lo publica el usuario independiente Chungulus como derivado comunitario, no como lanzamiento oficial de BFL, y está pensado para su uso dentro de ComfyUI mediante la extensión ComfyUI-GGUF. El transformer cuantizado tiene 5.548.681.984 parámetros y el repositorio ocupa 4,7 GB.

El modelo base, FLUX 3 Image Klein, es un transformer de difusión orientado a text-to-image e image-to-image, con soporte de edición mediante imágenes de referencia. Esta cuantización solo convierte el transformer de imagen; el codificador de texto (Qwen3VL de 4B en BF16), el upsampler de prompts y el VAE (flux2-vae) se mantienen en su precisión original y deben descargarse del paquete fuente de BFL.

Su relevancia práctica es que permite ejecutar el transformer de FLUX 3 en ComfyUI con un peso de 4,7 GB en lugar de los pesos BF16 completos, lo que reduce los requisitos de VRAM para generación y edición de imágenes. La cuantización se realizó sin calibración ni importance matrix, y los pesos BF16 originales se usaron de forma independiente para cada formato, sin recuantizar desde una fuente de baja precisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (modelo de imagen FLUX 3), consumido por ComfyUI-GGUF |
| Parametros totales | 5.548.681.984 (transformer de imagen) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de imagen, no de texto) |
| Tipos de cuantizacion | GGUF Q6_K (este repositorio); el paquete fuente está en BF16 |
| Idiomas soportados | no disponible (los prompts se procesan mediante el codificador de texto Qwen3VL) |
| Licencia | FLUX Kommunity License (flux-kommunity-license) |
| Formato de pesos | GGUF (un fichero `flux-3-image-klein-comfy-Q6_K.gguf`); acompañantes en safetensors BF16 |

## Arquitectura y entrenamiento

El modelo base es un transformer de difusión de FLUX 3 en su variante Image Klein, en versión destilada (distilled). El pipeline declarado es image-to-image, con soporte de edición mediante ReferenceMultiLatent para adjuntar imágenes de referencia. El codificador de texto asociado es Qwen3VL de 4B en BF16, cargado en ComfyUI con CLIPLoader de tipo `flux3`, y el VAE es flux2-vae. Para prompts cortos, el flujo documentado recomienda usar el upsampler de prompts del paquete fuente o un LLM de expansión de captions.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF/DPO en la información proporcionada. La cuantización Q6_K se aplicó únicamente al transformer de imagen, verificando todos los nombres y formas de los tensores cuantizados y los payloads de origen durante la conversión desde BF16. No se usó calibración ni importance matrix, y los modelos acompañantes se mantuvieron en su precisión original.

## Capacidades

- Generación de imágenes text-to-image a partir de captions de escena.
- Edición de imágenes image-to-image mediante imágenes de referencia adjuntadas con ReferenceMultiLatent.
- Expansión de prompts cortos mediante el upsampler del paquete fuente o un LLM externo de captioning.
- Integración nativa en ComfyUI con detección de la red FLUX3 a partir de los nombres de tensores preservados.
- Ejecución del transformer cuantizado en Q6_K con los acompañantes (text encoder, VAE) en BF16.
- No soporta tool calling, agentes ni generación de texto: es un modelo de difusión de imagen, no un LLM.

## Casos de uso

- Generación de imágenes en ComfyUI con VRAM reducida: cargar el GGUF en `ComfyUI/models/unet/` con Unet Loader (GGUF) permite generar imágenes con un transformer de 4,7 GB en lugar de los pesos BF16, útil en GPUs de gama consumer.
- Edición de imágenes por referencia: adjuntar una imagen mediante ReferenceMultiLatent y aplicar los ajustes validados (512 x 512, 16 pasos, Euler/simple, CFG 1.0, alpha 16 con ModelSamplingFlux shift `log(16)`) para tareas de modificación guiada por imagen.
- Prototipado de pipelines de imagen en estación de trabajo: usar el GGUF para iterar rápidamente sobre prompts y configuraciones de muestreo antes de pasar a los pesos BF16 completos en producción.
- Pruebas de integración de ComfyUI-GGUF: validar que la red FLUX3 se detecta correctamente y que los tensores cuantizados se cargan con las formas esperadas.
- Expansión de captions con un LLM local: combinar el transformer cuantizado con un modelo de texto para convertir prompts breves en captions de escena completas antes de la generación.
- Despliegue en entornos con almacenamiento limitado: el repositorio de 4,7 GB facilita distribuir el transformer de imagen en máquinas con poco espacio en disco frente al paquete BF16 completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que las comprobaciones realizadas son validaciones funcionales limitadas (una muestra text-to-image y una edición por artefacto), no un benchmark ni una garantía de calidad de imagen sin cambios.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el transformer cuantizado ocupa 4,7 GB en disco, a lo que se suman el codificador de texto Qwen3VL 4B en BF16 y el VAE flux2-vae en BF16.
- GPU recomendadas: no disponibles en la información proporcionada.
- Compatibilidad con GPU consumer: no confirmada en la información disponible; la reducción de tamaño frente a BF16 sugiere que puede facilitar el uso en GPUs consumer, pero no hay datos verificados.
- Opciones de despliegue: ComfyUI con soporte nativo de FLUX3 y la extensión ComfyUI-GGUF. El GGUF de difusión se consume mediante ComfyUI-GGUF, no mediante la CLI de generación de texto de llama.cpp.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Chungulus/flux-3-image-klein-comfy-Q6_K-GGUF (este) | 5.548.681.984 (transformer) | no disponible | GGUF Q6_K | FLUX Kommunity License | Hugging Face, 0 descargas |
| black-forest-labs/flux-3-image-klein-comfy (base) | 5.548.681.984 (transformer) | no disponible | BF16 (safetensors) | FLUX Kommunity License | Hugging Face (paquete oficial) |
| Otras cuantizaciones GGUF de FLUX 3 | no disponible | no disponible | GGUF | FLUX Kommunity License | no disponible |

## Limitaciones y advertencias

- Es un derivado comunitario independiente, no una versión oficial ni respaldada por Black Forest Labs.
- La licencia FLUX Kommunity License impone condiciones de uso y distribución; no se hace ninguna afirmación de uso comercial sin restricciones. Los receptores terceros obtienen derechos directamente de BFL bajo esa licencia, no como sublicencia de Chungulus.
- Las validaciones son comprobaciones funcionales limitadas y no garantizan que la calidad de imagen se mantenga intacta tras la cuantización.
- La cuantización se realizó sin calibración ni importance matrix, lo que puede afectar la fidelidad en determinados tensores.
- El repositorio no incluye el codificador de texto, el upsampler de prompts ni el VAE; hay que obtenerlos del paquete fuente de BFL para que el pipeline funcione.
- No es un modelo de texto: no dispone de tool calling, agentes ni razonamiento multi-paso, y no debe cargarse con llama.cpp para generación de texto.
- Riesgo de sesgos y alucinaciones visuales: no hay información publicada en la model card sobre sesgos del modelo base ni sobre tasas de error en edición.
- Idiomas soportados: no disponibles; el procesamiento de prompts depende del codificador Qwen3VL y de la calidad de la expansión de captions.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Chungulus/flux-3-image-klein-comfy-Q6_K-GGUF
- Modelo base (paquete ComfyUI oficial de BFL): https://huggingface.co/black-forest-labs/flux-3-image-klein-comfy
- Revisión concreta del paquete fuente citada en la model card: https://huggingface.co/black-forest-labs/flux-3-image-klein-comfy/tree/9d36114cf7a2e03a45c28f5cc4987d20ebfdb6c1
- Extensión ComfyUI-GGUF: https://github.com/city96/ComfyUI-GGUF
- Licencia: LICENSE.md (en el repositorio)
- Aviso de atribución: NOTICE.md (en el repositorio)
- Metadatos de validación: validation.json y quantizatia-manifest.json (en el repositorio)
