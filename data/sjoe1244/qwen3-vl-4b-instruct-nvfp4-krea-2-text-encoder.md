# sjoe1244/Qwen3-VL-4B-Instruct-NVFP4-Krea-2-text-encoder

## Resumen

Este repositorio contiene una cuantización NVFP4 del codificador de texto Qwen3-VL-4B-Instruct, publicada por el usuario sjoe1244 para su uso como text encoder del modelo de generación de imágenes Krea 2 en ComfyUI. No se trata de un modelo nuevo ni de un fine-tune: es una conversión directa de los pesos BF16 oficiales a formato NVFP4 (FP4 con escalado por bloques), manteniendo intactas las capas de visión, embeddings, normalizaciones y sesgos en BF16.

El problema que resuelve es de disponibilidad: el repositorio oficial Comfy-Org/Krea-2 distribuye el encoder únicamente en BF16, FP8 escalado e INT8, mientras que el modelo Turbo oficial sí tiene versión NVFP4. Esta publicación cubre ese hueco para poder emparejar un encoder NVFP4 con el UNet NVFP4 en hardware Blackwell, reduciendo el peso del encoder de 8,88 GB a 3,65 GB.

El modelo base, Qwen3-VL-4B-Instruct, es un modelo multimodal de 4 mil millones de parámetros de la familia Qwen3-VL de Alibaba, con arquitectura transformer y capacidades de razonamiento sobre imagen y texto. Aquí se emplea exclusivamente como codificador de texto condicionante para el pipeline de difusión de Krea 2, no como modelo conversacional autónomo, aunque el repositorio conserva el pipeline image-text-to-text.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3-VL), cuantizado NVFP4 en capas lineales del text model |
| Parametros totales | 4B (modelo base Qwen3-VL-4B-Instruct) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | NVFP4 (block-scaled, escala por tensor amax/(448*6)); vision tower, embeddings, norms y biases en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`qwen3vl_4b_nvfp4.safetensors`, 3,65 GB; original BF16 8,88 GB) |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3-VL-4B-Instruct, un transformer multimodal con torre de visión y modelo de lenguaje. En esta publicación no se ha reentrenado nada: el autor indica explícitamente que no hay fine-tune, abliteration ni merge, y que los pesos coinciden exactamente con los del encoder BF16 oficial en la capa comparada (layer 20, `mlp.down_proj`).

La conversión se realizó desde el archivo `text_encoders/qwen3vl_4b_bf16.safetensors` de Comfy-Org/Krea-2, sin paso intermedio por FP8. Se cuantizaron 252 capas lineales del text model con `comfy_kitchen.quantize_nvfp4`, aplicando escalado por bloques y una etiqueta `comfy_quant` por capa en el formato que lee ComfyUI. El proceso es determinista: repetir la exportación produce un archivo idéntico byte a byte (sha256 `a060d89d...`). El error de dequantización medido por capa, `‖dequant − original‖ / ‖original‖`, es de 0,095 de media y 0,095 máximo sobre las 252 capas.

No se dispone de información sobre el dataset de entrenamiento original, el número de tokens ni las etapas de alineación (RLHF/DPO) del modelo base en la documentación proporcionada.

## Capacidades

- Codificación de texto condicionante para el pipeline de difusión Krea 2 en ComfyUI, cargado mediante CLIP loader con tipo `krea2`.
- Procesamiento multimodal imagen-texto heredado del modelo base Qwen3-VL-4B-Instruct (torre de visión conservada en BF16).
- Generación de texto y conversación, según el pipeline declarado `image-text-to-text` y la etiqueta `conversational`.
- Compatibilidad con pesos NVFP4 etiquetados `comfy_quant`, requiriendo una build de ComfyUI que los lea.
- No se documentan en esta publicación capacidades de tool calling, agentes, thinking mode ni soporte multilingüe específico.

## Casos de uso

- Generación de imágenes con Krea 2 Turbo NVFP4 en ComfyUI: el encoder se empareja con el UNet NVFP4 oficial y `qwen_image_vae.safetensors`, permitiendo ejecutar el pipeline completo en precisión FP4 en GPUs Blackwell. El autor reporta un render end-to-end de 21 s con 8 pasos, CFG 1 y sampler euler/simple en una RTX 5080.
- Despliegue en GPUs con VRAM ajustada: al pasar de 8,88 GB a 3,65 GB, libera más de 5 GB que quedan disponibles para el UNet, el VAE y los latentes, lo que facilita encajar el pipeline en tarjetas de 16 GB.
- Flujos de trabajo por lotes en ComfyUI: la reducción de peso del encoder disminuye la presión sobre memoria y el tiempo de carga del grafo en producciones con muchas generaciones encadenadas.
- Sustitución directa del encoder BF16 o FP8 en configuraciones existentes de Krea 2: al mantener intactos visión, embeddings y norms, el cambio de encoder no altera la interfaz del pipeline, solo el consumo de memoria.
- Pruebas de calidad y comparativas de cuantización: sirve como referencia para medir el impacto de NVFP4 frente a BF16/FP8 en la fidelidad del condicionamiento, aunque el autor advierte que esa comparación no se ha realizado.
- Reproducibilidad de pipelines: el proceso de exportación determinista (hash verificado) permite reconstruir el archivo y auditar que los pesos provienen del BF16 oficial sin modificaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta dos métricas: error de dequantización medio y máximo de 0,095 sobre las 252 capas cuantizadas, y un render de 21 s en RTX 5080 con Krea 2 Turbo NVFP4 (8 pasos, CFG 1, euler/simple). No se ha medido la calidad de imagen frente a los encoders BF16 o FP8, ni el rendimiento en GPUs distintas de la RTX 5080.

## Requisitos de hardware

- VRAM estimada para el encoder: 3,65 GB en disco y en memoria para los pesos NVFP4; el modelo base BF16 ocuparía 8,88 GB.
- GPU recomendadas: arquitecturas con soporte NVFP4 (Blackwell, p. ej. RTX 5080, RTX 5090, B200). El autor solo ha validado en RTX 5080.
- Cabe en GPU de consumo: sí, en RTX 5080 (16 GB) según la prueba reportada; en tarjetas sin soporte NVFP4 no es utilizable tal cual.
- Opciones de despliegue: ComfyUI con una build que lea pesos NVFP4 `comfy_quant`, CLIP loader tipo `krea2`, junto con el UNet Krea 2 Turbo NVFP4 y `qwen_image_vae.safetensors` de Comfy-Org/Krea-2. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 21 s por imagen end-to-end en el pipeline completo (8 pasos) en RTX 5080; no se desglosa el tiempo atribuible al encoder.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sjoe1244/Qwen3-VL-4B-Instruct-NVFP4-Krea-2-text-encoder | 4B | NVFP4 (lineales) + BF16 (vision, embeddings, norms) | no disponible | Apache 2.0 | HuggingFace, ComfyUI |
| Comfy-Org/Krea-2 encoder BF16 | 4B | BF16 (8,88 GB) | no disponible | Apache 2.0 (modelo base) | HuggingFace, ComfyUI |
| Comfy-Org/Krea-2 encoder FP8 scaled | 4B | FP8 | no disponible | Apache 2.0 (modelo base) | HuggingFace, ComfyUI |
| Comfy-Org/Krea-2 encoder INT8 | 4B | INT8 | no disponible | Apache 2.0 (modelo base) | HuggingFace, ComfyUI |

Las tres alternativas oficiales proceden del mismo modelo base y se diferencian únicamente en el formato de cuantización y el peso del archivo. No se dispone de datos de calidad comparada entre ellas en la información proporcionada.

## Limitaciones y advertencias

- Requiere hardware con soporte NVFP4; en GPUs sin esa capacidad el archivo no es utilizable.
- Requiere una build de ComfyUI que lea pesos NVFP4 con etiquetas `comfy_quant`; versiones anteriores no cargarán el archivo.
- El autor no ha medido la calidad de imagen frente a los encoders BF16 o FP8, por lo que el impacto de la cuantización en la fidelidad del condicionamiento es desconocido.
- Solo se ha validado en una RTX 5080; no hay datos de rendimiento en otras GPU.
- El error de dequantización es uniforme (0,095 medio y máximo), lo que sugiere un comportamiento homogéneo entre capas, pero no cuantifica el efecto perceptual.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el campo `inference: false` en la model card; se trata de un artefacto para ComfyUI, no de un modelo para uso conversacional directo.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas específicas de esta conversión; aplican las del modelo base Qwen3-VL-4B-Instruct.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y del pipeline Krea 2 por separado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/sjoe1244/Qwen3-VL-4B-Instruct-NVFP4-Krea-2-text-encoder
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Repositorio oficial Krea 2 en Comfy-Org: https://huggingface.co/Comfy-Org/Krea-2
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
