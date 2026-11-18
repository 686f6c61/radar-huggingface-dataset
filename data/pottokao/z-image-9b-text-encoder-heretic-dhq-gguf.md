# pottokao/Z-Image-9B-Text-Encoder-Heretic-DHQ-GGUF

## Resumen

Z-Image-9B-Text-Encoder-Heretic-DHQ-GGUF es un codificador de texto y potenciador de prompts cuantizado en formato GGUF, publicado por el usuario pottokao, destinado a sustituir la entrada de texto de 4B del modelo Z-Image Turbo por una entrada de 9B. El modelo subyacente es un Qwen3.5-9B "decensored" (etiquetado como heretic) cuyos pesos bf16 provienen de pottokao/MOSS-Image-Text-Encoder-Heretic; esta build, sin embargo, está construida y ajustada específicamente para Z-Image y no es un componente de MOSS-Image. Cuenta con 9.197.093.888 parámetros totales y un repositorio de 13,0 GB.

La particularidad técnica es la cuantización DHQ (Dual-Head Quantization), en la que el formato de cada tensor se elige midiendo el daño en dos métricas: el error en la entrada de 9B que lee el DiT (peso 1) y la KL de escritura de prompts (peso 0,5). Ningún tensor baja de Q5, con una mezcla de Q5_K (60 tensores), Q6_K (128) y Q8_0 (60), lo que da un archivo de 7,17 GB, más pequeño que un Q6_K estándar de aproximadamente 7,25 GB.

El mismo archivo cumple dos funciones: codifica el prompt para el DiT y escribe prompts como potenciador (prompt enhancer), conservando la cabeza MTP. Es relevante porque permite ejecutar un codificador de texto de 9B en el ecosistema ComfyUI mediante un nodo específico (Dual-Head Dragon), aunque no es compatible con Z-Image estándar ni con ComfyUI-GGUF sin ese nodo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5-9B base, con cabeza MTP; doble función codificador de texto / potenciador de prompts) |
| Parámetros totales | 9.197.093.888 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF DHQ: Q5_K (×60 tensores), Q6_K (×128), Q8_0 (×60); ningún tensor por debajo de Q5 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (7,17 GB); safetensors NVFP4 para el DiT (4,95 GB); GGUF F16 para el proyector de visión (0,92 GB) |

## Arquitectura y entrenamiento

El modelo se basa en Qwen3.5-9B, un transformer de 9B parámetros, en una variante "heretic" (decensored) y conserva la cabeza MTP (multi-token prediction). Se distribuye como codificador de texto para el DiT de Z-Image Turbo, pero con la entrada de texto reemplazada: el `cap_embedder` original de 4B (2560-dim) se sustituye por una entrada de 9B compuesta por RMSNorm(4096, peso 1) y una capa Linear 4096→3840, ajustada en forma cerrada a la entrada original de 4B. En el safetensors del DiT solo cambian tres tensores (`cap_embedder.0.weight` = ones(4096) y `cap_embedder.1.weight`/`bias`); el resto es bit-idéntico al NVFP4 de origen (Tongyi-MAI, Apache-2.0).

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. La innovación destacable es el proceso de cuantización DHQ: cada tensor recibe un formato elegido a partir de la medición del error en la entrada del DiT y de la KL de generación de prompts frente a Q8_0, ejecutando el motor real de llama.cpp. El resultado declarado es un error de entrada del 2,19% mediano y 2,56% máximo (36 prompts de retrato reservados) y una KL de escritura de prompts de 0,0024, frente a 0,0136 de un Q4_K_M estándar.

## Capacidades

- Codificación de texto para el DiT de Z-Image Turbo con entrada de 9B (4096-dim).
- Generación y reescritura de prompts (prompt enhancement) mediante la misma pieza de pesos.
- Conversación: la etiqueta del repositorio incluye `conversational`, heredada del Qwen3.5 base.
- Cabeza MTP conservada para predicción multi-token.
- Soporte opcional de visión mediante el proyector `mmproj-moss-te-f16.gguf` (0,92 GB).
- Integración con ComfyUI a través del nodo Dual-Head Dragon (tipo `moss_image`).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada.

## Casos de uso

- Generación de imágenes en ComfyUI con Z-Image Turbo: se carga el DiT `z_image_turbo_9b_entrance_nvfp4.safetensors`, el GGUF en el nodo Dual-Head Dragon y el VAE `ae.safetensors`, con ModelSamplingAuraFlow shift 3, KSampler de 8 pasos, cfg 1 y sampler `res_multistep`/`simple`. El codificador de 9B proporciona una representación textual más rica que la entrada estándar de 4B.
- Potenciación automática de prompts: el mismo archivo reescribe prompts breves en descripciones detalladas antes de pasarlas al DiT, con una KL de 0,0024 frente al modelo sin cuantizar, lo que permite usarlo como etapa previa sin degradar la fidelidad del texto.
- Flujos de retrato y fotografía: el autor midió el error de entrada sobre 36 prompts de retrato reservados, con un error máximo del 2,56%, un escenario donde la fidelidad del codificador afecta a rasgos faciales.
- Experimentación con entradas de texto de mayor dimensión: investigadores que quieran probar el efecto de un codificador de 9B frente al de 4B en un DiT pueden usar este par de archivos sin reentrenar el DiT completo, ya que solo cambian tres tensores.
- Despliegue en hardware limitado: al ocupar 7,17 GB en GGUF, el codificador puede residir en GPUs de consumo junto al DiT NVFP4 (4,95 GB) y el VAE, reduciendo los requisitos frente a un codificador en bf16.
- Evaluación de cuantizaciones: sirve como referencia práctica del método DHQ, comparando su error de entrada y su KL de prompts con cuantizaciones estándar como Q4_K_M o Q8_0.
- Procesamiento multimodal opcional: con el proyector de visión F16 se puede añadir entrada de imagen al codificador en flujos que lo requieran.

## Benchmarks y rendimiento

| Métrica | Este archivo (DHQ, 7,17 GB) | Q4_K_M estándar (5,78 GB) |
|---|---|---|
| Error en la entrada de Z-Image 9B frente a Q8_0 (mediana, 36 prompts de retrato) | 2,19% | no disponible |
| Error en la entrada de Z-Image 9B frente a Q8_0 (máximo) | 2,56% | no disponible |
| KL de escritura de prompts frente a Q8_0 (80 prompts) | 0,0024 | 0,0136 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El error de entrada se define como la L2 relativa de la salida de la entrada, ejecutada con el motor real de llama.cpp.

## Requisitos de hardware

- VRAM estimada para el codificador: aproximadamente 7,2 GB en el archivo DHQ de 7,17 GB; el proyector de visión añade 0,92 GB si se usa.
- Conjunto completo para generación: codificador (7,17 GB) + DiT NVFP4 (4,95 GB) + VAE, lo que exige en torno a 13 GB o más según el VAE y los buffers de inferencia.
- GPU recomendadas: no especificadas por el autor; por tamaño, cabe en GPUs de consumo con 16 GB o más (por ejemplo, RTX 4080/4090) y en A100/H100 sin problema.
- Despliegue: ComfyUI con el nodo Dual-Head Dragon (https://github.com/pottokao-dotcom/ComfyUI-DualHead-Dragon), en fase de pruebas. ComfyUI-GGUF no carga archivos GGUF de Qwen3.5 todavía.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Z-Image-9B-Text-Encoder-Heretic-DHQ-GGUF (este) | 9,2B | no disponible | GGUF DHQ (Q5_K/Q6_K/Q8_0), 7,17 GB | Apache-2.0 | Hugging Face, requiere nodo Dual-Head Dragon |
| Codificador de texto oficial de Z-Image (4B) | 4B (2560-dim) | no disponible | según distribución oficial | Apache-2.0 (Tongyi-MAI) | Integrado en Z-Image estándar |
| MOSS-Image-Text-Encoder-Heretic (modelo base) | 9,2B | no disponible | bf16 | Apache-2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos más allá de las métricas de error de cuantización aportadas por el autor.

## Limitaciones y advertencias

- No es compatible con Z-Image estándar: la entrada de 9B sustituye a la de 4B y solo funciona con el DiT modificado `z_image_turbo_9b_entrance_nvfp4.safetensors`.
- Requiere el nodo Dual-Head Dragon, que el propio autor describe como "still being tested"; ComfyUI-GGUF no carga GGUF de Qwen3.5.
- El modelo base es una variante "heretic" (decensored), lo que puede implicar una reducción de los filtros de seguridad y un mayor riesgo de contenido inapropiado; conviene evaluarlo antes de usarlo en producción.
- Riesgo de alucinación inherente a un modelo de lenguaje de 9B usado como potenciador de prompts; la KL de 0,0024 indica proximidad al modelo sin cuantizar, no ausencia de errores.
- Idiomas soportados no documentados; no se puede garantizar un comportamiento multilingüe sin pruebas.
- Longitud de contexto no disponible; no se debe asumir una ventana concreta para prompts largos.
- La licencia Apache-2.0 permite uso comercial, pero debe verificarse la procedencia y las condiciones del modelo base Qwen3.5 y del DiT NVFP4 de Tongyi-MAI.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria del rendimiento declarado.

## Enlaces

- Hugging Face: https://huggingface.co/pottokao/Z-Image-9B-Text-Encoder-Heretic-DHQ-GGUF
- Modelo base: https://huggingface.co/pottokao/MOSS-Image-Text-Encoder-Heretic
- Nodo ComfyUI Dual-Head Dragon: https://github.com/pottokao-dotcom/ComfyUI-DualHead-Dragon
