# fbjr/wen3-vl-32b-W4A16-AWQ-H3

# Ficha del modelo: fbjr/wen3-vl-32b-W4A16-AWQ-H3

## Resumen

Este repositorio contiene una versión cuantizada del encoder de lenguaje y visión Qwen3-VL de 32B, preparada específicamente para ser utilizada como componente de texto dentro del modelo MiniMax H3, un sistema de generación de vídeo. El autor, fbjr, ha aplicado cuantización AWQ (Activation-aware Weight Quantization) con esquema W4A16 simétrico por grupos de 128 al checkpoint completo de 64 capas de Qwen3-VL, reduciendo su tamaño de 66,7 GB en BF16 a 18,99 GB en un único archivo. Esta compresión permite cargar el encoder en hardware más modesto y acelerar la inferencia sin pérdidas significativas de calidad.

El modelo está pensado para dos flujos de trabajo distintos: uno con ComfyUI (donde se utiliza un loader específico que solo conserva las capas 0-49, ya que MiniMax H3 consume la salida residual de la capa 50) y otro con vLLM o transformers (donde se usa el checkpoint HF completo de 64 capas). La licencia Apache 2.0 permite uso comercial y modificación. Es una pieza clave para pipelines de generación de vídeo basados en MiniMax H3, ya que el encoder de texto es el que condiciona el contenido semántico del vídeo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3-VL de 64 capas) |
| Parametros totales | 32B (modelo base) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | AWQ W4A16 simétrica por grupos de 128 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (archivo único para HF, archivo -comfy para ComfyUI) |

## Arquitectura y entrenamiento

El checkpoint es una adaptación del encoder Qwen3-VL de 32B (arquitectura Transformer con capas de atención clásicas y un módulo de visión con proyección DeepStack). La cuantización AWQ se aplicó sobre las capas lineales del lenguaje (W4), manteniendo en BF16 la torre de visión, las proyecciones DeepStack, la capa de embedding de entrada completa (con 151.936 tokens de vocabulario) y los pesos de normalización. El proceso de calibración se realizó con 96 prompts multimodales y pares de imagen de referencia extraídos de los datasets H3-IR, así como con extracciones del primer fotograma de generaciones locales y datos de diálogo de avatares H3.

El resultado es un modelo de 18,99 GB (frente a los 66,7 GB del original en BF16), que se distribuye como un único archivo safetensors. Para el uso en ComfyUI, se eliminan las capas 50-63, la norma final del lenguaje y la cabeza LM, ya que MiniMax H3 consume la salida residual después de la capa 50. El archivo portable conserva todas las capas en disco, pero el loader de ComfyUI solo carga las primeras 50.

## Capacidades

- Procesamiento de texto y visión: el encoder acepta texto y también imágenes de referencia (hasta ~301k píxeles en el procesador de imagen de este checkpoint, aunque el VAE recibe la imagen completa).
- Generación de condicionamiento para vídeo: se utiliza para convertir texto e imágenes en las representaciones internas que el modelo MiniMax H3 necesita para generar vídeo.
- Soporte de referencias de imagen (Ref2VA / FL2VA): permite usar imágenes como entrada adicional al texto para controlar el contenido visual del vídeo.
- No es un modelo generativo de texto ni un asistente conversacional; su función es exclusivamente actuar como encoder dentro de un pipeline de generación de vídeo.
- Capacidades multilingües: no especificadas, aunque el modelo base Qwen3-VL soporta múltiples idiomas.
- No soporta tool calling ni agentes.

## Casos de uso

- Generación de vídeo a partir de texto: el encoder convierte la descripción textual en el condicionamiento que alimenta el modelo MiniMax H3 para producir un clip de vídeo coherente con la narrativa.
- Vídeo con imagen de referencia: se proporciona una imagen (fotograma inicial o referencia) junto con texto; el encoder procesa ambas entradas para guiar la generación del vídeo.
- Animación de primer fotograma: se parte de una imagen estática y se genera la continuación temporal mediante el condicionamiento combinado de imagen y texto.
- Interpolación entre dos fotogramas: se suministran el primer y último fotograma y el encoder condiciona la generación de los fotogramas intermedios.
- Generación de vídeo con avatares: el encoder se usa en flujos de trabajo de diálogo con avatares, donde el texto del guion condiciona la animación del personaje.
- Comparación de encoders en ComfyUI: gracias al flujo de trabajo de comparación A/B incluido, se puede evaluar visualmente la calidad de este encoder cuantizado frente a otros formatos (INT8, NVFP4) para elegir el mejor equilibrio entre calidad y rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El archivo del checkpoint pesa 20,4 GB (para ComfyUI) o 18,99 GB (para vLLM/transformers), por lo que se requiere una GPU con al menos 24 GB de VRAM para cargarlo en memoria completa.
- Se recomienda una GPU de gama alta como NVIDIA RTX 4090 (24 GB) o A100 (40/80 GB) para un uso fluido con el modelo MiniMax H3 completo.
- En GPUs con menos VRAM se puede recurrir a técnicas de offload de memoria (por ejemplo, en ComfyUI se puede usar la opción de descarga de capas), aunque no se especifican los detalles en la documentación.
- El modelo está optimizado para funcionar con vLLM y SGLang, además de ComfyUI mediante el loader incluido.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Tamaño | Cuantización | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fbjr/wen3-vl-32b-W4A16-AWQ-H3 | 32B | W4A16 AWQ | no disponible | Apache 2.0 | HuggingFace |
| Qwen3-VL-32B (original) | 32B | BF16 | 128K tokens (según modelo base) | Apache 2.0 | HuggingFace |
| Qwen3-VL-32B (cuantización INT8) | 32B | INT8 | no disponible | Apache 2.0 | no disponible |

No se dispone de datos de rendimiento comparativos. La principal ventaja de este checkpoint es la reducción de tamaño (18,99 GB frente a 66,7 GB) manteniendo la calidad para el uso en MiniMax H3.

## Limitaciones y advertencias

- El procesador de imágenes de este checkpoint limita las imágenes de referencia a ~301k píxeles, mientras que la versión H3 permite hasta ~16,8M. Esto puede reducir la calidad de las referencias grandes (se registra un aviso en el registro cuando ocurre).
- El modelo no es un modelo de lenguaje autónomo; no genera texto ni respuestas. Solo funciona como encoder dentro de un pipeline de generación de vídeo.
- Se han eliminado las capas 50-63 para el uso en ComfyUI, por lo que si se intenta cargar el checkpoint completo con el loader de ComfyUI, se perderán esas capas (aunque no son utilizadas por MiniMax H3).
- El modelo está calibrado para un dominio específico (H3-IR y datasets de avatares), por lo que su rendimiento con otro tipo de prompts puede variar.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos de la licencia del modelo base Qwen3-VL y de MiniMax H3 para verificar posibles restricciones adicionales.
- No se ha publicado información sobre sesgos o alucinaciones; al ser un encoder, no genera texto libre, pero puede heredar sesgos del modelo base.

## Enlaces

- [HuggingFace - fbjr/wen3-vl-32b-W4A16-AWQ-H3](https://huggingface.co/fbjr/wen3-vl-32b-W4A16-AWQ-H3)
- [GitHub - ComfyUI MiniMax H3 AWQ Encoder Loader](https://github.com/ethanfel/ComfyUI-qwen3-vl-32b-W4A16-AWQ-H3)
- [GitHub - ComfyUI-h3-explorations (repositorio completo)](https://github.com/fblissjr/ComfyUI-h3-explorations)
- [Documentación de Qwen3-VL en HuggingFace](https://huggingface.co/docs/transformers/model_doc/qwen3_vl)
- [Repositorio oficial de Qwen3-VL](https://github.com/QwenLM/Qwen3-VL)
