# jyohukuchan/Qwen-Image-2.1-EXL3

## Resumen

Qwen-Image-2.1-EXL3 es una conversión comunitaria del modelo de difusión Qwen-Image-2.1, publicada por el usuario jyohukuchan en HuggingFace. No es un lanzamiento oficial de Qwen: se trata de un checkpoint cuantizado en formato EXL3 (EXLlamaV3) que reduce las 224 capas Linear del transformer de difusión (DiT) a 3, 4 o 5 bits por peso, mientras que el codificador de texto y el VAE se mantienen en BF16 y se descargan del modelo original fijado en la revisión `d26bb61231c349cf6b7896fa83353113880e1ba3`.

El problema que resuelve es el tamaño de los pesos: el DiT cuantizado ocupa entre 2,89 GB (3 bits) y 4,64 GB (5 bits) en safetensors, con una pérdida de fidelidad medida como NMSE frente a la referencia BF16 de 2,59e-3, 7,90e-4 y 2,11e-4 respectivamente. La contrapartida es que exige un motor específico, `rocm_exl3_forme`, y solo se ha validado en una Radeon AI PRO R9700 de 32 GB (gfx1201) con ROCm 7.2.4 o superior; no es un checkpoint Diffusers estándar ni un GGUF, NF4 o Nunchaku.

Su relevancia actual es acotada pero concreta: permite experimentar con generación y edición de imágenes de la familia Qwen-Image en hardware AMD profesional, comparando niveles de cuantización con una métrica objetiva de fidelidad. La licencia Qwen Research restringe el uso a investigación y evaluación, y cualquier explotación comercial requiere una licencia adicional del modelo original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (DiT) con 224 capas Linear cuantizadas en bloques EXL3; codificador de texto y VAE en BF16 procedentes del modelo base |
| Parámetros totales | no disponible |
| Longitud de contexto | no disponible (modelo text-to-image; no se documenta ventana de contexto) |
| Tipos de cuantización | EXL3 de 3, 4 y 5 bits en las capas Linear del DiT; text encoder y VAE sin cuantizar (BF16) |
| Idiomas soportados | en, zh, ja (según las etiquetas del repositorio) |
| Licencia | Qwen Research License Agreement (2026-09-20): solo investigación y evaluación; el uso comercial requiere licencia adicional del upstream |
| Formato de pesos | safetensors (checkpoints EXL3 personalizados; no son Diffusers `from_pretrained()`, ni GGUF, NF4 o Nunchaku) |
| Variantes publicadas | 3bit, 4bit y 5bit, cada una con configuración de transformer y `quantization.json` con checksums |
| Componentes incluidos | Solo el DiT cuantizado; text encoder y VAE no incluidos (se obtienen del modelo base BF16) |
| Tamaño del repositorio | 10,8 GB (incluye las tres variantes y metadatos) |
| Hardware validado | Una Radeon AI PRO R9700 32 GB (gfx1201); CUDA, V620, otras GPU y multi-GPU no validados |
| Motor de inferencia | rocm_exl3_forme, commit `37847ec9949aaf30fcf72ad6679da78968857d7a`, con CLI `rocm_tools/qwen_image21.py` |
| Pipeline | text-to-image |

## Arquitectura y entrenamiento

El modelo base es un transformer de difusión (DiT) para generación y edición de imágenes, del que esta publicación solo cuantiza el bloque transformer: 224 capas Linear convertidas a bloques EXL3, más tensores retenidos en alta precisión y una configuración de transformer propia. El codificador de texto y el VAE permanecen en BF16 y se sirven desde el repositorio upstream fijado por revisión, de modo que la cuantización afecta únicamente al denoising. Cada carpeta de bits incluye un `quantization.json` con checksums para verificar la integridad del paquete.

No se documentan en la información disponible los datos de entrenamiento del modelo original (número de tokens, composición del dataset, etapas de RLHF o DPO), ni detalles de atención o decodificación. En cuanto a la conversión, el autor reporta el NMSE de cada variante frente a la predicción BF16 de referencia, calculado como `sum((candidate - BF16)^2) / sum(BF16^2)`; el bpw efectivo incluye escalas y tensores en alta precisión, por lo que es superior al número nominal de bits (3,254 / 4,235 / 5,216). La innovación técnica destacable es precisamente el formato EXL3 aplicado a un DiT y el soporte de un backend ROCm/HIP, no un rediseño arquitectónico.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image) con resolución configurable; el ejemplo documentado usa 1024x1024, semilla 1703 y 40 pasos por defecto.
- Edición de imágenes: acepta una o varias imágenes de referencia mediante `--images` junto con un prompt de edición.
- Composiciones multiobjeto controladas por prompt (el ejemplo oficial combina esfera roja, cubo azul y pirámide amarilla sobre superficie gris).
- Soporte de RGBA y de embeddings de prompt en caché, según la guía del motor.
- Reproducibilidad mediante semilla y generación de un `report.json` con metadatos de la ejecución.
- Multilingüe en los idiomas declarados (inglés, chino y japonés) a través del codificador de texto del modelo base.
- No se documenta soporte de tool calling, function calling, comportamiento de agente ni modo de razonamiento explícito.
- No se documenta comprensión de imágenes (VQA o captioning); la entrada de imagen se usa como referencia de edición, no como fuente de razonamiento visual.

## Casos de uso

- Evaluación de cuantización en difusión: comparar las variantes 3bit, 4bit y 5bit con la misma semilla y prompt para medir el compromiso entre tamaño (2,89 / 3,77 / 4,64 GB) y NMSE frente a BF16, usando el `report.json` como registro reproducible.
- Prototipado de generación de imágenes en estaciones de trabajo AMD: el motor está validado en una Radeon AI PRO R9700 con ROCm 7.2.4, lo que permite montar un pipeline text-to-image sin GPU NVIDIA.
- Edición de imágenes con referencias múltiples: flujos de composición en los que se pasa una o varias imágenes de referencia y se describe el cambio deseado en el prompt, útil para pruebas de concepto de retoque o sustitución de objetos.
- Investigación sobre degradación por cuantización: análisis de cómo afecta el bpw efectivo a distintos tipos de prompt (escenas con varios objetos, materiales, iluminación) manteniendo fijo el resto del stack.
- Generación de material gráfico interno para experimentación: imágenes sintéticas de apoyo en proyectos de investigación o docencia, siempre dentro del marco de uso no comercial de la licencia.
- Reproducción de resultados: al fijar `revision="exl3-v1"`, semilla y prompt, se puede reconstruir una ejecución concreta para auditar cambios de entorno (versión de ROCm, Diffusers, safetensors).
- Formación técnica: ilustrar en un curso o taller el funcionamiento de checkpoints cuantizados no estándar y la diferencia entre fidelidad numérica (NMSE) y calidad perceptual.

## Benchmarks y rendimiento

| Variante | Bits por peso (Linear) | bpw efectivo del DiT | Tamaño safetensors (GB) | NMSE relativo a BF16 (↓) |
|---|---:|---:|---:|---:|
| 3bit | 3 | 3,254020 | 2,894282 | 0,002586973 |
| 4bit | 4 | 4,234933 | 3,766698 | 0,000790211 |
| 5bit | 5 | 5,215846 | 4,639113 | 0,000211085 |

El NMSE mide la fidelidad de las predicciones del DiT cuantizado frente a la referencia BF16 del mismo modelo, no la calidad perceptual ni un porcentaje de calidad conservada. No hay resultados publicados de MMLU, HumanEval o GSM8K en la información disponible, y no aplican a un modelo de generación de imágenes. Tampoco se aportan métricas perceptivas (FID, CLIP score) ni comparaciones con las variantes GGUF, NF4 o Nunchaku.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Los pesos del DiT ocupan 2,89 GB (3bit), 3,77 GB (4bit) y 4,64 GB (5bit) en GB decimales; a ello hay que sumar activaciones, caché de prefijo KV y el VAE, cuyo tamaño no se detalla.
- Codificador de texto: se mantiene en BF16 y se transmite desde la RAM de la CPU, por lo que se necesita memoria de sistema suficiente además de la VRAM.
- GPU recomendada: Radeon AI PRO R9700 de 32 GB (gfx1201), único hardware validado. CUDA, V620, otras GPU y la inferencia multi-GPU no se han validado para esta release.
- GPU de consumo: no hay datos; no se ha validado en ninguna.
- Software: Python 3.12, PyTorch 2.12.0+rocm7.2, compilador HIP 7.14.60850, Transformers 5.17.0, Accelerate 1.15.0, safetensors 0.8.0 y Diffusers en el commit `b800f828f3951c4d206e154411bcbfa693cd322e`; ROCm >= 7.2.4. No se debe confiar en la compilación JIT automática de estilo CUDA en ROCm.
- Despliegue: exclusivamente mediante `rocm_exl3_forme` y su CLI `rocm_tools/qwen_image21.py`; no hay soporte para vLLM, llama.cpp, Ollama, TGI ni Diffusers estándar, y el repositorio no está configurado para inferencia alojada en HuggingFace.
- Latencia y throughput: no disponible. Se documentan 40 pasos por defecto, CFG 1, caché de prefijo KV y VAE con mosaico de 256 px y solapamiento de 192 px.
- Aviso de reproducibilidad: la evaluación reutilizó una extensión R9700 ya compilada cuyo commit de build original se desconoce, y no se demostró una recompilación limpia de ese binario exacto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen-Image-2.1-EXL3 3bit | no disponible | no aplica | safetensors EXL3 | qwen-research (no comercial) | HuggingFace, requiere motor ROCm |
| Qwen-Image-2.1-EXL3 4bit | no disponible | no aplica | safetensors EXL3 | qwen-research (no comercial) | HuggingFace, requiere motor ROCm |
| Qwen-Image-2.1-EXL3 5bit | no disponible | no aplica | safetensors EXL3 | qwen-research (no comercial) | HuggingFace, requiere motor ROCm |
| Qwen/Qwen-Image-2.1 (BF16, upstream) | no disponible | no aplica | safetensors Diffusers | qwen-research | HuggingFace |
| Otras cuantizaciones de la comunidad (GGUF, NF4, Nunchaku) | no disponible | no aplica | GGUF / NF4 / Nunchaku | no disponible | mencionadas como formato distinto, sin datos |

La model card distingue explícitamente este checkpoint de las alternativas GGUF, NF4 y Nunchaku, pero no proporciona cifras de tamaño, fidelidad ni rendimiento de esas alternativas, por lo que no es posible establecer una comparación cuantitativa. Tampoco se dispone de datos de modelos de difusión comparables de otros fabricantes en la información proporcionada.

## Limitaciones y advertencias

- Licencia restrictiva: Qwen Research License Agreement (2026-09-20), solo para investigación y evaluación; el uso comercial exige una licencia adicional del upstream. La licencia MIT del motor de inferencia no sustituye a la del modelo.
- Es una conversión de terceros, no oficial de Qwen; el autor no garantiza equivalencia funcional con el modelo base más allá de la métrica NMSE reportada.
- El NMSE no mide calidad perceptual: un valor bajo no descarta artefactos visuales en prompts concretos.
- Dependencia dura de hardware y software: solo validado en una R9700 de 32 GB con ROCm >= 7.2.4 y versiones muy concretas de PyTorch, Transformers, Accelerate, safetensors y Diffusers.
- No es un checkpoint Diffusers estándar: no funciona con `from_pretrained()`, ni con ecosistemas GGUF/Ollama, lo que complica su integración en pipelines existentes.
- El codificador de texto y el VAE no están incluidos: requieren descargar componentes BF16 del repositorio upstream y fijar la revisión para reproducibilidad.
- Idiomas declarados limitados a inglés, chino y japonés; el rendimiento en castellano no está documentado.
- Riesgo de alucinación visual inherente a los modelos de difusión: el modelo puede generar elementos no solicitados o ignorar restricciones espaciales del prompt.
- Sesgos: no se documenta ninguna evaluación de sesgos demográficos, culturales o de representación para esta cuantización.
- Repositorio con 0 descargas y 1 like en el momento de la consulta, sin validación independiente conocida.
- La reproducibilidad del binario del motor no está demostrada: la evaluación usó una extensión compilada de commit desconocido y no se verificó una recompilación limpia.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/jyohukuchan/Qwen-Image-2.1-EXL3
- Modelo base (revisión fijada): https://huggingface.co/Qwen/Qwen-Image-2.1/tree/d26bb61231c349cf6b7896fa83353113880e1ba3
- Motor de inferencia (commit fijado): https://github.com/jyohukuchan/rocm_exl3_forme/tree/37847ec9949aaf30fcf72ad6679da78968857d7a
- Requisitos de compilación del motor: https://github.com/jyohukuchan/rocm_exl3_forme/blob/37847ec9949aaf30fcf72ad6679da78968857d7a/README.md#requirements
- Entorno de pruebas registrado: https://github.com/jyohukuchan/rocm_exl3_forme/blob/37847ec9949aaf30fcf72ad6679da78968857d7a/benchmarks/2026-10-19/qwen-image21-environment.json
- Guía de Qwen Image con EXL3 (embeddings en caché, RGBA, conversión, NMSE): https://github.com/jyohukuchan/rocm_exl3_forme/blob/37847ec9949aaf30fcf72ad6679da78968857d7a/doc/qwen_image_21_exl3.md
- Licencia del modelo: https://huggingface.co/jyohukuchan/Qwen-Image-2.1-EXL3/blob/main/LICENSE
- Aviso legal del repositorio: https://huggingface.co/jyohukuchan/Qwen-Image-2.1-EXL3/blob/main/Notice
- Resultados de búsqueda web: no contienen enlaces relevantes para este modelo (las URLs devueltas son páginas de eventos y espectáculos en Francia).
