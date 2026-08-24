# fbjr/qwen3-vl-32b-W4A16-AWQ-H3

## Resumen

Este repositorio contiene una cuantización W4A16 AWQ del encoder Qwen3-VL 32B, el modelo de lenguaje y visión utilizado por MiniMax H3 para el condicionamiento en generación de vídeo. El autor, fbjr, ha comprimido el checkpoint completo de 64 capas de Qwen3-VL 32B (66,7 GB en BF16) a un único archivo de 18,99 GB, conservando únicamente las capas 0 a 49, el embedding de entrada completo, la torre de visión y las proyecciones DeepStack en BF16. Las capas 50 a 63, la norma final y la cabeza de lenguaje se eliminan porque H3 no las consume; el modelo consume la salida residual sin normalizar tras la capa 50.

La relevancia de este artefacto radica en que permite ejecutar el encoder de H3 en GPUs con menos memoria, manteniendo la fidelidad del condicionamiento. Está pensado para dos audiencias: usuarios de ComfyUI, que deben descargar un archivo específico (`-comfy.safetensors`) junto con un loader personalizado, y usuarios de vLLM o transformers, que pueden usar el checkpoint estándar de Hugging Face. La licencia Apache 2.0 facilita su uso comercial y su integración en pipelines existentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-VL (transformer multimodal) con 64 capas; el checkpoint cuantizado conserva las capas 0-49, embedding completo, vision tower y proyecciones DeepStack |
| Parametros totales | 32B (modelo base); el archivo safetensors contiene 6.296.265.840 parametros (solo las capas conservadas) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | W4A16 AWQ simetrico, grupo 128 |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (archivo estandar y archivo `-comfy.safetensors` para ComfyUI) |

## Arquitectura y entrenamiento

El modelo base es Qwen3-VL 32B, un transformer multimodal con una torre de visión (ViT) y proyecciones DeepStack que integran información visual y textual. Para este artefacto, el autor ha aplicado cuantización AWQ simétrica con grupo 128 sobre las capas lineales del lenguaje (W4), manteniendo en BF16 la torre de visión, las proyecciones DeepStack, el embedding de entrada completo (con forma `[151936, 5120]`) y las capas de normalización. La calibración se realizó con 96 prompts multimodales y pares de referencia de los datasets H3-IR, extracciones de frame 0 de generación local y datasets de diálogo de avatar de H3.

El checkpoint se ha estructurado para que el loader de ComfyUI pueda cargarlo directamente: conserva las capas 0-49, el embedding completo y los tensores de visión, y elimina las capas 50-63, la norma final y la cabeza de lenguaje. Esto reduce el uso de VRAM sin sacrificar la calidad del condicionamiento, ya que H3 solo necesita la salida residual de la capa 50.

## Capacidades

- Generacion de texto e imagen: procesa prompts de texto y referencias de imagen para generar condicionamiento multimodal.
- Soporte de referencias de imagen (Ref2VA / FL2VA): puede usar imágenes de referencia para guiar la generacion de video, aunque el procesador de imagenes limita las referencias a ~301k pixeles para el text encoder (el VAE ve la imagen completa).
- Integracion con MiniMax H3: funciona como encoder de condicionamiento en flujos de generacion de video, tanto para texto a video como para keyframes (primera y ultima imagen).
- Compatibilidad con vLLM y SGLang: el checkpoint estandar se puede cargar con estas herramientas para inferencia de texto e imagen.
- No soporta tool calling ni agentes: al ser un encoder, no es un modelo generativo autonomo.

## Casos de uso

- Generacion de video con MiniMax H3 en ComfyUI: el encoder se usa para convertir prompts de texto e imagenes en el condicionamiento que H3 necesita. Es adecuado porque el loader incluido valida y adapta el checkpoint en memoria, manteniendo la arquitectura nativa de H3.
- Condicionamiento por primera y ultima imagen (keyframes): permite generar videos que respeten un inicio y un final dados, usando el flujo `first_last_frame.json`. El encoder procesa ambas imagenes y las convierte en tokens visuales para H3.
- Comparacion de encoders en flujos de video: el workflow `ab_compare.json` permite comparar visualmente dos encoders (por ejemplo, este AWQ frente a otro) en el mismo pipeline, usando VideoHelperSuite y ComfyUI-KJNodes.
- Integracion en pipelines de vLLM o SGLang: para aplicaciones que requieren procesamiento de texto e imagen sin ComfyUI, el checkpoint estandar se puede cargar con estas librerias, aprovechando la cuantizacion W4A16 para reducir el uso de memoria.
- Desarrollo de nodos personalizados en ComfyUI: el loader `comfyui_minimax_h3_awq_loader.py` es autocontenido y puede servir como base para integrar otros checkpoints cuantizados de H3.
- Investigacion en generacion de video: al ser un encoder de alto rendimiento con licencia Apache 2.0, es util para experimentar con condicionamiento multimodal en entornos academicos o de I+D.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona metricas de calidad (como MMLU, HumanEval o metricas de video) ni comparaciones cuantitativas con otros encoders. La unica referencia de rendimiento es el tamaño del archivo (18,99 GB frente a 66,7 GB en BF16) y la reduccion de VRAM que implica la cuantizacion W4A16.

## Requisitos de hardware

- VRAM estimada: el archivo cuantizado pesa ~20 GB (el archivo `-comfy.safetensors` es de 20,4 GB). Para cargarlo en memoria se recomienda una GPU con al menos 24 GB de VRAM, aunque el uso real depende de si se cargan tambien los pesos de H3 (diffusion y VAE) en el mismo dispositivo.
- GPU recomendadas: NVIDIA RTX 3090, RTX 4090, A100, H100 o similares con 24 GB o mas. El autor menciona que esta pensado para GPUs de ~32 GB en el contexto de ComfyUI.
- En consumer GPU: cabe en una RTX 4090 (24 GB) si se usa el archivo `-comfy` y se gestiona la memoria con offload, pero puede ser ajustado si se cargan otros modelos.
- Opciones de despliegue: ComfyUI (con el loader incluido), vLLM, SGLang y transformers (con el checkpoint estandar). No se menciona soporte para llama.cpp u Ollama.
- Latencia y throughput: no disponibles. Al ser un encoder, la latencia depende del tamaño del prompt y del numero de tokens visuales, pero no se proporcionan datos.

## Comparativa con modelos similares

| Modelo | Tamano | Cuantizacion | Uso en H3 | Licencia |
|---|---|---|---|---|
| fbjr/qwen3-vl-32b-W4A16-AWQ-H3 (este) | 32B (base) | W4A16 AWQ | Encoder para H3 | Apache 2.0 |
| ComfyUI INT8 ConvRot (AIAny) | 32B (base) | INT8 ConvRot | Encoder para H3 | No especificada |
| NVFP4-AWQ (Comfy-formatted) | 32B (base) | NVFP4-AWQ | Encoder para H3 | No especificada |

No se dispone de datos de rendimiento comparativo entre estas opciones. La principal diferencia es el formato de cuantizacion (W4A16 frente a INT8 o NVFP4) y el tamaño de archivo resultante. Este checkpoint es el unico que ofrece un loader autocontenido para ComfyUI y un checkpoint estandar para vLLM/transformers.

## Limitaciones y advertencias

- Limitacion de pixeles en referencias de imagen: el procesador de imagenes limita las referencias a ~301k pixeles para el text encoder, aunque el VAE ve la imagen completa. Esto puede degradar la calidad del condicionamiento en imagenes de alta resolucion o con relacion de aspecto 16:9.
- No es un modelo generativo completo: solo funciona como encoder para H3. No se puede usar para generar texto o video de forma independiente.
- Dependencia de MiniMax H3: requiere los pesos de diffusion y VAE de H3 para funcionar, que no estan incluidos en este repositorio.
- Riesgo de alucinacion: al ser un encoder, no genera texto directamente, pero el condicionamiento puede producir resultados inesperados si los prompts son ambiguos.
- Sesgos: no se han documentado sesgos especificos, pero al derivar de Qwen3-VL, puede heredar sesgos del modelo base.
- Compatibilidad: el loader de ComfyUI no debe instalarse junto con el repositorio `ComfyUI-h3-explorations` porque ambos registran el mismo nodo.
- Version del checkpoint: el autor menciona que una v2 recalibrada esta en progreso, por lo que este artefacto puede quedar obsoleto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/fbjr/qwen3-vl-32b-W4A16-AWQ-H3
- Loader para ComfyUI (GitHub): https://github.com/ethanfel/ComfyUI-qwen3-vl-32b-W4A16-AWQ-H3
- Coleccion Qwen3-VL en Hugging Face: https://huggingface.co/collections/Qwen/qwen3-vl
- Ejemplo de checkpoint INT8 alternativo (AIAny): https://aiany.app/item/qwen3-vl-32b-ultra-uncensored-heretic-minimax-h3-comfyui-int8-convrot
- Modelo base MiniMax H3: https://huggingface.co/MiniMaxAI/MiniMax-H3
