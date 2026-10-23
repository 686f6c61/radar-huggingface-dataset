# lite-infer/qwen-image-2.1-turbo-nunchaku-lite-nvfp4-r32

## Resumen

`lite-infer/qwen-image-2.1-turbo-nunchaku-lite-nvfp4-r32` es un checkpoint cuantizado del modelo de difusión Qwen-Image-2.1-Turbo, publicado por el usuario lite-infer y construido con la herramienta `diffuse-compressor`. No es un modelo nuevo: es una conversión post-entrenamiento que mantiene la arquitectura y el schedule del modelo base (8 pasos de inferencia, CFG 1) pero serializa los pesos del transformer en NVFP4 con SVDQuant, rango 32, GPTQ y group size 16, y el encoder de texto/visión en NF4 de BitsAndBytes.

El transformer tiene 4.091.556.064 parámetros (~4,09 B) y el repo ocupa 11,7 GB. La cuantización afecta a 224 capas lineales objetivo en W4A4 más una capa concreta (`modulation.1`) en INT4 AWQ W4A16; el resto de tensores del transformer conservan su precisión original y el VAE Turbo se mantiene sin cuantizar. El pipeline resultante genera y edita imágenes a 1024×1024 en 8 pasos.

Su relevancia es práctica: en una RTX PRO 6000 Blackwell el pipeline completo tarda 5,44 s por imagen de 1024×1024 con un pico de 17,53 GiB de VRAM, frente a los 14,01 s de la variante INT4 del mismo autor. Es decir, aproximadamente 2,6 veces menos latencia con un consumo de memoria casi idéntico, a cambio de exigir hardware Blackwell o posterior para ejecutar los kernels NVFP4.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (pipeline `QwenImage21Pipeline`) con encoder texto/visión `Qwen3VLForConditionalGeneration` y VAE Turbo |
| Parámetros totales | 4.091.556.064 (~4,09 B), dato real de los safetensors |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de difusión; no hay ventana de contexto textual) |
| Tipos de cuantización | NVFP4 SVDQuant r32 + GPTQ, group size 16 (W4A4) en 224 capas; INT4 AWQ W4A16 en `modulation.1`; BitsAndBytes NF4 con cómputo BF16 y sin doble cuantización en el encoder; VAE Turbo sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | other / qwen-research |
| Formato de pesos | safetensors (tensores serializados en NVFP4, INT4 y NF4; el resto en su precisión original) |
| Resolución de salida | 1024×1024 en el benchmark; soporta otras resoluciones con VAE tiling |
| Pasos de inferencia | 8 (schedule `sample_sigmas` guardado en el checkpoint), CFG 1 |
| Tamaño del repositorio | 11,7 GB |

## Arquitectura y entrenamiento

El modelo base es un transformer de difusión para texto-a-imagen y edición de imágenes, acompañado de un encoder Qwen3-VL que procesa el prompt y, en edición, la imagen de entrada. El pipeline expone `use_kv_cache` para cachear el prefijo de condicionamiento y reutilizarlo entre pasos, y usa un VAE Turbo propio. El checkpoint conserva el schedule de 8 pasos con CFG 1 definido por el modelo Turbo, de modo que no requiere ajustar el número de pasos para obtener resultados razonables.

Sobre el entrenamiento del modelo base, la model card no aporta datos: no se indica número de tokens, composición del dataset, ni si hubo RLHF/DPO (poco habitual en difusión). Lo que sí se documenta es el proceso de cuantización: SVDQuant con rango 32 y GPTQ sobre 224 capas lineales del transformer en formato NVFP4 (W4A4) para activaciones y pesos, una excepción en INT4 AWQ W4A16 (`modulation.1`) por sensibilidad numérica, y NF4 de BitsAndBytes para las capas lineales elegibles del encoder, con cómputo en BF16 y sin doble cuantización. Los kernels nativos compatibles se cargan mediante el paquete `kernels` de Hugging Face, lo que exige definir `DIFFUSERS_TRUST_REMOTE_KERNELS=true` antes de instanciar el pipeline.

## Capacidades

- Generación texto-a-imagen a 1024×1024 en 8 pasos con CFG 1, usando el schedule guardado en el checkpoint.
- Edición de imágenes guiada por instrucciones en lenguaje natural: se pasa una imagen PIL (convertida a RGBA) por el argumento `image=` junto con el prompt de edición.
- Control de resolución de salida en edición mediante `output_resolution`.
- Cacheo del prefijo de condicionamiento (`use_kv_cache=True`), pensado para reducir el coste por paso.
- VAE tiling configurable (`tile_sample_min_height`, `tile_sample_min_width`, `tile_sample_stride_height`, `tile_sample_stride_width`) para generar o editar por encima de 1024×1024 con menos memoria.
- Serialización en formatos cuantizados que se cargan con `from_pretrained` estándar de Diffusers, sin pasos de conversión adicionales.
- No soporta tool calling, function calling ni razonamiento multi-paso basado en agentes: es un modelo generativo de imágenes.
- Cobertura multilingüe de prompts: no documentada en la información disponible.

## Casos de uso

- Generación de imágenes en producción con requisitos de latencia estrictos: 5,44 s por imagen de 1024×1024 en Blackwell permite encadenar varias generaciones por minuto en una sola GPU, con la ventaja de que el modelo solo necesita 8 pasos y CFG 1.
- Edición de retratos por instrucción: cambiar peinado, ropa o fondo manteniendo rostro, maquillaje y accesorios, como en los ejemplos de la model card; útil en estudios fotográficos que necesitan variantes sin repetir sesión.
- Fotografía de producto para comercio electrónico: sustituir fondos o ajustar iluminación sobre una foto existente con `image=` y un prompt descriptivo, conservando el producto original.
- Prototipado rápido en notebooks: el repo se carga con `QwenImage21Pipeline.from_pretrained` y no requiere scripts de conversión, lo que facilita probar prompts y semillas antes de montar un servicio.
- Investigación en cuantización de modelos de difusión: al existir una variante INT4 del mismo autor con idéntico pipeline, permite comparar fidelidad y latencia entre NVFP4 e INT4 con el mismo input, prompt, semilla y schedule.
- Generación de assets gráficos por lotes (ilustración, fondos, conceptos) en un servicio interno, usando VAE tiling para resolver salidas por encima de 1024×1024 cuando la memoria es limitada.
- Evaluación de infraestructura Blackwell: sirve como carga de referencia para medir rendimiento de kernels FP4 en GPUs nuevas antes de desplegar otros modelos cuantizados.

## Benchmarks y rendimiento

Datos publicados por el autor. Entorno: RTX PRO 6000 Blackwell Server Edition, todos los componentes residentes en GPU, sin CPU offload, 1024×1024, 8 pasos, CFG 1, prefijo KV cacheado y semilla 42. Una llamada de calentamiento y tres medidas; latencia media ± desviación estándar de la muestra.

| Métrica | NVFP4 r32 + BNB4 | INT4 r32 + BNB4 |
|---|---:|---:|
| Latencia del pipeline completo | 5,44 ± 0,10 s | 14,01 ± 0,07 s |
| VRAM pico asignada por PyTorch | 17,53 GiB | 17,32 GiB |

El autor advierte que la GPU estaba compartida con un trabajo de entrenamiento ajeno, por lo que son tiempos observados y no un benchmark aislado. No se publican métricas objetivas de calidad (FID, CLIP score, SSIM) ni resultados de MMLU, HumanEval o GSM8K, que no aplican a este tipo de modelo. La comparación de fidelidad con el checkpoint BF16 se presenta de forma cualitativa en seis casos de edición (tres retratos y tres productos) procedentes del blog de Qwen-Image-2.1, sin valores numéricos asociados.

## Requisitos de hardware

- VRAM estimada: 17,53 GiB de pico medido para el pipeline completo a 1024×1024, con todos los componentes en GPU y sin offload. El repo pesa 11,7 GB en disco.
- GPU imprescindible para esta variante: NVIDIA Blackwell o posterior, porque los kernels NVFP4 no existen en arquitecturas anteriores. Validado en RTX PRO 6000 Blackwell; quedan fuera Ada (RTX 4090) y anteriores.
- En consumer, solo encajan GPUs Blackwell con suficiente memoria (por ejemplo, RTX 5090 de 32 GB). Para equipos sin Blackwell, la alternativa del mismo autor es la variante INT4, o el checkpoint BF16.
- Despliegue: Diffusers con la build que soporta `QwenImage21` y Nunchaku Lite, PyTorch 2.11.0 + CUDA 12.8, Transformers 5.19.0 y BitsAndBytes 0.50.2. Los kernels se obtienen con el paquete `kernels` de Hugging Face y requieren `DIFFUSERS_TRUST_REMOTE_KERNELS=true`.
- Memoria adicional: para salidas grandes hay que activar VAE tiling; el benchmark de 1024×1024 se ejecutó sin tiling (mínimo de tile 1024, stride 768).
- Throughput orientativo: con 5,44 s por imagen en una sola GPU, el límite teórico en serie es de unas 11 imágenes por minuto; el autor no publica mediciones con batching ni concurrencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización | Latencia 1024×1024, 8 pasos | VRAM pico | Licencia | Hardware |
|---|---|---:|---:|---:|---|---|
| Este modelo (NVFP4 r32 + BNB4) | ~4,09 B | NVFP4 W4A4 + NF4 encoder | 5,44 s | 17,53 GiB | qwen-research | Blackwell o posterior |
| `lite-infer/qwen-image-2.1-turbo-nunchaku-lite-int4-r32` | ~4,09 B | INT4 W4A4 + NF4 encoder | 14,01 s | 17,32 GiB | qwen-research | no requiere FP4 nativo |
| `Qwen/Qwen-Image-2.1-Turbo` (BF16) | ~4,09 B (referencia) | ninguna | no disponible | no disponible | qwen-research | Ampere o posterior |
| Otras alternativas de la categoría (FLUX.1, SD 3.5, etc.) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación relevante es interna: NVFP4 reduce la latencia un factor de ~2,6 respecto a INT4 con un coste de memoria prácticamente igual, pero solo es ejecutable en Blackwell. La fidelidad frente a BF16 se documenta visualmente, no con métricas.

## Limitaciones y advertencias

- Dependencia de hardware: NVFP4 exige Blackwell o posterior. En GPUs Ada o Ampere el checkpoint no es utilizable tal cual.
- Licencia `qwen-research`: es una licencia de investigación de Qwen, no una licencia permisiva estándar. Cualquier uso comercial debe revisarse contra el archivo `LICENSE` del repositorio antes de desplegar.
- Fidelidad de cuantización: el autor solo aporta comparaciones visuales en seis casos; no hay métricas objetivas de degradación frente a BF16, por lo que la pérdida de detalle fino, texto en la imagen o coherencia de identidad debe validarse con un conjunto propio.
- El schedule de 8 pasos y CFG 1 está fijado por el checkpoint; forzar otros valores puede degradar la calidad y no está documentado.
- Los tiempos publicados se midieron con la GPU compartida con otro trabajo, así que no deben tomarse como cifras de referencia aisladas.
- El VAE tiling reduce memoria, pero puede introducir discontinuidades en las uniones de los tiles en salidas grandes; conviene revisar los bordes en producción.
- No hay información sobre sesgos, composición del dataset de entrenamiento ni tasas de fallo en prompts sensibles; en difusión, el riesgo equivalente a la alucinación es la deriva semántica o los artefactos (anatomía, texto, manos), no documentados.
- Solo se ha validado con una combinación concreta de versiones (PyTorch 2.11.0, CUDA 12.8, Transformers 5.19.0, BitsAndBytes 0.50.2 y una build específica de Diffusers); otras combinaciones pueden romper la carga de kernels.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha: no hay evidencia de uso en producción por terceros.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/lite-infer/qwen-image-2.1-turbo-nunchaku-lite-nvfp4-r32
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1-Turbo
- Variante INT4 del mismo autor: https://huggingface.co/lite-infer/qwen-image-2.1-turbo-nunchaku-lite-int4-r32
- Herramienta de conversión `diffuse-compressor`: https://github.com/rootonchair/diffuse-compressor
- Blog de Qwen-Image-2.1 (casos de edición usados en la comparativa): https://qwen.ai/blog?id=qwen-image-2.1
