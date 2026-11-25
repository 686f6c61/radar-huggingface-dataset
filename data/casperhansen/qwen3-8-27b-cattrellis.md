# casperhansen/Qwen3.8-27B-CatTrellis

## Resumen

Qwen3.8-27B-CatTrellis es una cuantización extrema del modelo Qwen/Qwen3.8-27B (revisión `37561816e66b`) realizada por casperhansen mediante la herramienta CatTrellis, que aplica códigos de trellis con asignación de tasa mixta guiada por sensibilidad, inicialización YAQA de doble cara con block-LDLQ, reconstrucción de ventana deslizante y destilación KL extremo a extremo contra el modelo BF16 original. El resultado es un modelo de 27 000 millones de parámetros comprimido a aproximadamente 1,7-2 bits por peso, con un tamaño de pesos (excluyendo embeddings) de entre 5,33 y 6,24 GiB según la rama.

El modelo se sirve de forma nativa en vLLM mediante la librería `cattrellis[serve]` y cada tamaño reside en su propia rama del repositorio (`2.05bpw` y `1.76bpw`), mientras que `main` solo contiene la model card. Incluye un drafter MTP cuantizado para decodificación especulativa (activo por defecto) y una torre de visión cuantizada a 6 bits, lo que lo convierte en una opción relevante para desplegar un modelo multimodal de 27B en GPUs de consumo o en entornos con VRAM muy limitada.

La relevancia actual radica en que demuestra que es posible mantener una divergencia KL media de 0,1250-0,1896 respecto al BF16 con menos de 7 GiB de pesos, superando en eficiencia a alternativas como EXL3 SCP y GGUF de Unsloth en el mismo rango de tamaño, lo que habilita inferencia de calidad casi-BF16 en hardware mucho más modesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen3.8-27B, multimodal con torre de visión); cuantización trellis con asignación de tasa mixta |
| Parametros totales | 27 000 millones (modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Trellis a ~1,7-2 bits por peso (ramas 1.76 bpw y 2.05 bpw); torre de visión a 6 bits; drafter MTP cuantizado |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Pesos nativos para vLLM (librería `cattrellis`); no se indica safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B, un transformer multimodal con torre de visión, y se cuantiza mediante CatTrellis (commit `e309abdd4d5e`), una técnica que combina códigos de trellis con asignación de tasa mixta guiada por sensibilidad por capa, inicialización YAQA de doble cara con block-LDLQ, reconstrucción de ventana deslizante y destilación KL extremo a extremo contra el modelo BF16 de referencia. La cuantización se aplica a los pesos lineales del decodificador, mientras que las matrices `linear_attn.in_proj_a/b` se entrenan en precisión completa durante la etapa 2 y se exportan en FP32.

El proceso de exportación incluye además un drafter MTP cuantizado para decodificación especulativa (3 tokens especulativos por paso) y una torre de visión a 6 bits. No se dispone de información sobre el número de tokens de entrenamiento del modelo base ni sobre la composición del dataset, ya que la model card solo documenta el proceso de cuantización. La evaluación se realizó con ExLlamaV3 qbench sobre la traza `qbench_prompts_div` (89 conversaciones autogeneradas, 118 259 tokens de entrada y 228 608 tokens de salida puntuados), con un suelo de ruido de 0,00052 KLD.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del modelo base Qwen3.8-27B.
- Procesamiento multimodal: incluye torre de visión cuantizada a 6 bits, por lo que soporta entrada de imágenes.
- Decodificación especulativa: drafter MTP integrado con 3 tokens especulativos, con una longitud media de aceptación de 3,34 tokens por paso medida en una H200.
- Servicio nativo en vLLM: integración mediante `cattrellis[serve]` y configuración `--speculative-config`.
- Dos niveles de compresión: rama `2.05bpw` (mayor fidelidad) y rama `1.76bpw` (menor huella).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la información proporcionada.

## Casos de uso

- Despliegue de un modelo de 27B en GPUs de consumo: con 5,33-6,24 GiB de pesos del decodificador, la rama `1.76bpw` permite servir el modelo en tarjetas con 8-12 GB de VRAM, algo inviable con el BF16 original.
- Inferencia multimodal en entornos con VRAM limitada: la torre de visión a 6 bits permite procesar imágenes sin renunciar a la compresión del decodificador, adecuado para tareas de descripción de imágenes o extracción de información visual.
- Servicio de alto rendimiento con vLLM: la integración nativa con vLLM y el drafter MTP (aceptación media de 3,34 tokens por paso) reducen la latencia en cargas de generación interactiva.
- Investigación en cuantización extrema: sirve como referencia reproducible para comparar técnicas de cuantización a ~2 bpw frente a EXL3 SCP y GGUF, con métricas KLD y PPL publicadas.
- Prototipado y evaluación de modelos grandes en estaciones de trabajo: la rama `2.05bpw` (6,24 GiB) permite ejecutar un modelo de 27B en una única GPU de gama media-alta para pruebas de calidad antes de escalar a BF16.
- Benchmarking de decodificación especulativa: el drafter MTP incluido permite medir la tasa de aceptación y el impacto en throughput en distintos hardware.

## Benchmarks y rendimiento

Resultados de ExLlamaV3 qbench (KLD medio por token frente a BF16, PPL):

| Modelo | GiB | bpw (qbench) | KLD medio | KLD mediana | PPL |
|---|---|---|---|---|---|
| CatTrellis 1.76 bpw | 5,33 | 1,75 | 0,1896 | 0,013549 | 1,6030 |
| EXL3 SCP 1.75 bpw H2.5 | 5,38 | 1,77 | 0,2344 | 0,015238 | 1,6673 |
| EXL3 SCP 2.00 bpw H3 | 6,17 | 2,02 | 0,1355 | 0,005525 | 1,5018 |
| CatTrellis 2.05 bpw | 6,24 | 2,04 | 0,1250 | 0,007022 | 1,4964 |
| EXL3 SCP 2.20 bpw H3 | 6,73 | 2,22 | 0,0954 | 0,003393 | 1,4434 |
| GGUF unsloth UD-IQ2_XS | 6,78 | 2,21 | 0,1503 | 0,009067 | 1,5342 |
| GGUF unsloth UD-Q2_K_XL | 8,53 | 2,77 | 0,0735 | 0,002960 | 1,4147 |
| EXL3 SCP 3.00 bpw H4 | 9,15 | 3,02 | 0,0290 | 0,000891 | 1,3502 |
| EXL3 SCP 4.00 bpw H5 | 12,12 | 4,02 | 0,0077 | 0,000177 | 1,3158 |
| GGUF unsloth UD-IQ4_XS | 12,51 | 4,13 | 0,0134 | 0,000352 | 1,3237 |
| EXL3 SCP 5.00 bpw H6 | 15,11 | 5,02 | 0,0022 | 0,000053 | 1,3096 |
| NVFP4 (Unsloth) | 17,79 | 5,86 | 0,0116 | 0,000299 | 1,3239 |
| EXL3 SCP 6.00 bpw H6 | 17,94 | 6,01 | 0,0008 | 0,000021 | 1,3080 |
| FP8 (Qwen) | 25,07 | 8,01 | 0,0027 | 0,000058 | 1,3060 |

Referencia BF16: PPL 1,3074. Suelo de ruido: 0,00052 KLD. La rama 1.76 bpw es un 19 % mejor en KLD medio que EXL3 SCP 1.75 bpw con un tamaño ligeramente inferior (5,33 frente a 5,38 GiB); la rama 2.05 bpw queda un 3 % por debajo de la curva EXL3 SCP a igual tamaño.

## Requisitos de hardware

- VRAM estimada para inferencia: pesos del decodificador de 5,33 GiB (rama 1.76 bpw) y 6,24 GiB (rama 2.05 bpw), excluyendo embeddings; el tamaño total de archivos es de 6,10 y 7,01 GiB respectivamente. Hay que sumar la caché KV y el drafter MTP.
- GPU recomendadas: H200 verificada en la model card; por tamaño, cabría en GPUs con 8-12 GB de VRAM para la rama 1.76 bpw, aunque no se especifican modelos concretos probados.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas con 8 GB o más para la rama 1.76 bpw, y 10-12 GB para la rama 2.05 bpw, siempre que se disponga de suficiente VRAM para la caché KV (no cuantificada).
- Opciones de despliegue: vLLM con la librería `cattrellis[serve]` (instalación vía `uv pip install "cattrellis[serve] @ git+https://github.com/casper-hansen/CatTrellis"`); no se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no se publican cifras de throughput; se indica una longitud media de aceptación MTP de 3,34 tokens por paso (3 especulativos) en una H200. La primera ejecución compila los kernels de servicio para la GPU (varios minutos); las posteriores cargan desde caché.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tamaño (GiB) | KLD medio | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| CatTrellis 1.76 bpw | 27B | no disponible | 5,33 | 0,1896 | Apache 2.0 | Hugging Face (rama `1.76bpw`) |
| CatTrellis 2.05 bpw | 27B | no disponible | 6,24 | 0,1250 | Apache 2.0 | Hugging Face (rama `2.05bpw`) |
| EXL3 SCP 1.75 bpw H2.5 | 27B | no disponible | 5,38 | 0,2344 | no disponible | Hugging Face (turboderp) |
| EXL3 SCP 2.00 bpw H3 | 27B | no disponible | 6,17 | 0,1355 | no disponible | Hugging Face (turboderp) |
| GGUF unsloth UD-IQ2_XS | 27B | no disponible | 6,78 | 0,1503 | no disponible | Hugging Face (unsloth) |

## Limitaciones y advertencias

- La cuantización a ~2 bpw introduce una divergencia medible respecto al BF16 (KLD medio de 0,1250-0,1896), superior a la de cuantizaciones de 3-4 bpw; no es adecuada para tareas que requieran fidelidad casi exacta al modelo original.
- El 62 % de los tokens puntuados en qbench son tokens con alta certeza del modelo BF16 (≥95 %), por lo que la KLD media está dominada por los tokens inciertos; el rendimiento en tareas de razonamiento complejo puede degradarse más de lo que sugiere la media.
- No se dispone de información sobre sesgos, idiomas soportados ni riesgos de alucinación específicos del modelo base en la documentación proporcionada.
- La licencia Apache 2.0 permite uso comercial, pero se desconoce si el modelo base Qwen3.8-27B impone restricciones adicionales; conviene verificar la licencia del modelo original.
- El despliegue requiere vLLM con la librería `cattrellis`; no hay soporte documentado para llama.cpp, Ollama u otros motores.
- Es necesario especificar la revisión de rama (`--revision $B`) y la configuración especulativa; sin ella, vLLM resuelve el drafter desde `main`, que no contiene pesos, lo que puede provocar errores.
- La primera ejecución compila kernels específicos para la GPU, lo que añade varios minutos de arranque.
- No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible; solo se reportan métricas de cuantización (KLD y PPL).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/casperhansen/Qwen3.8-27B-CatTrellis
- Rama 2.05bpw: https://huggingface.co/casperhansen/Qwen3.8-27B-CatTrellis/tree/2.05bpw
- Rama 1.76bpw: https://huggingface.co/casperhansen/Qwen3.8-27B-CatTrellis/tree/1.76bpw
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio CatTrellis: https://github.com/casper-hansen/CatTrellis
- Recetas de ejemplo: https://github.com/casper-hansen/CatTrellis/tree/main/examples/qwen38-27b
- Evaluación ExLlamaV3 qbench: https://github.com/turboderp-org/exllamav3/tree/master/eval
- Traza de evaluación: https://huggingface.co/turboderp/Qwen3.8-27B-exl3/blob/main/qbench_prompts_div.md
- Modelo EXL3 de referencia: https://huggingface.co/turboderp/Qwen3.8-27B-exl3
