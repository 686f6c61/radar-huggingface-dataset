# nynefold/MOSS-Image-SFT-quant-GGUF

## Resumen

MOSS-Image-SFT-quant-GGUF es una colección de cuantizaciones GGUF del modelo de generación de imágenes text-to-image MOSS-Image-SFT, publicado originalmente por OpenMOSS-Team. El repositorio lo mantiene el usuario nynefold y no se trata de un modelo nuevo, sino de un estudio sistemático de cuantización: recoge 37 recetas distintas (con y sin éxito) que buscan responder a una pregunta concreta: cuál es el modelo más pequeño cuyas imágenes se mantienen lo más fieles posible al modelo original para el mismo prompt y semilla.

El modelo base es un transformer de difusión (DiT) de 5.082 millones de parámetros que se acompaña de un codificador de texto de 9 B basado en Qwen3.5-9B. Los pesos se distribuyen en formato GGUF con tipos ggml estándar (Q3_K, Q4_0, Q4_K, Q5_K, Q6_K, Q8_0, BF16, F32) y están pensados para su uso en ComfyUI mediante el nodo ComfyUI-GGUF, así como en llama.cpp para el codificador de texto.

La relevancia del repositorio es práctica: el autor documenta con métricas LPIPS qué configuraciones conservan fidelidad visual y cuáles degradan aspectos concretos como el texto pequeño o la composición de escenas. El resultado principal es que ninguna cuantización del DiT por debajo de 8 bits resulta fiel, mientras que el codificador de texto sí admite mayor compresión. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (DiT) para text-to-image, con codificador de texto Qwen3.5-9B |
| Parametros totales | 5.082.308.608 (DiT); el codificador de texto añade 9 B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q3_K, Q4_0, Q4_K, Q5_K, Q6_K, Q8_0, BF16, F32 (tipos ggml estándar); variantes GPTQ e imatrix |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (DiT y codificador de texto por separado); VAE no incluido |

## Arquitectura y entrenamiento

El componente principal es un DiT de 5.08 B de parámetros que opera como modelo de difusión text-to-image. El pipeline se completa con un codificador de texto de 9 B correspondiente a Qwen3.5-9B sin modificaciones (stock), y con un VAE que en este repositorio no se incluye: se debe usar el decodificador FLUX.2 small original (0.25 GB). Los archivos del codificador de texto emplean el layout `qwen35` de llama.cpp, con tensores separados `attn_qkv`, `attn_gate`, `ssm_alpha` y `ssm_beta`, sin LM head, y conservan el tokenizador y los metadatos de Qwen3.5-9B.

No se detallan en la información disponible los datos de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF o DPO). La innovación técnica documentada en este repositorio es el propio proceso de cuantización: el autor aplica GPTQ e imatrix sobre los pesos y mide la deriva respecto a una referencia FP32 mediante LPIPS, comparando además con la inferencia en bf16. Los archivos con `q`/`k`/`v` del mismo tipo usan `qkv` fusionado, mientras que las recetas mixtas los mantienen separados. Todos los archivos fueron releídos tras su escritura y comparados con los pesos cuantizados medidos, con exactitud en todos los tensores salvo dos excepciones documentadas: escalas de capas DiT con redondeo simple almacenadas en fp16 (error relativo ≤ 5.2e-8) y tensores `out_proj` (`ssm_out`) de codificadores con K-quant, recuantizados por el reordenamiento de bloques de 256 de llama.cpp (afecta a entre 3 y 23 tensores por archivo).

## Capacidades

- Generación de imágenes text-to-image a partir de prompts en lenguaje natural, con resolución de 512² y 1024² documentada en las pruebas.
- Renderizado de texto dentro de la imagen, incluida caligrafía y sellos, con degradación medible por debajo de 8 bits en el DiT.
- Reproducibilidad prompt-semilla: para el mismo prompt y semilla, las configuraciones fieles generan imágenes prácticamente idénticas a la referencia FP32.
- Control de composición de escenas, con sensibilidad documentada en prompts ambiguos o de "bifurcación" (por ejemplo, escenas con dos personas).
- Integración con ComfyUI mediante Unet Loader (GGUF) para el DiT y cargador CLIP GGUF para el codificador de texto.
- Ejecución en GPUs de baja VRAM mediante ejecución secuencial: codificador de texto una vez por prompt, después el DiT y después el VAE.
- No se documentan en la información disponible capacidades de tool calling, agentes, visión de entrada, audio ni modo thinking.

## Casos de uso

- Generación de imágenes en producción con ComfyUI: cargar el DiT con Unet Loader (GGUF) y el codificador de texto con el cargador CLIP GGUF (`qwen35`), usando la selección "Faithful" (13.8 GB) cuando se requiera que las imágenes coincidan con las del modelo publicado.
- Despliegue en GPUs de 8 GB: el DiT fiel (5.40 GB) cabe en una tarjeta de 8 GB; el codificador de texto de 8.45 GB se ejecuta en CPU o con offload, de forma secuencial por prompt.
- Iteración rápida en estudios creativos: la selección "Equivalent quality" (11.4 GB) reduce el peso total al 44 % del original manteniendo calidad y renderizado de texto, a costa de cambios de composición en prompts ambiguos.
- Reproducción de resultados de investigación: el repositorio incluye las 37 recetas con su resultado medido, lo que permite replicar el estudio de cuantización o auditar la deriva de cada configuración.
- Evaluación de pipelines de cuantización: sirve como caso de referencia para medir LPIPS frente a FP32 y comparar GPTQ, imatrix y redondeo simple en un DiT.
- Generación de material con texto integrado (carteles, sellos, caligrafía): solo con la selección fiel, ya que por debajo de 8 bits en el DiT el texto pequeño es lo primero que se degrada.

## Benchmarks y rendimiento

Los datos disponibles son métricas de fidelidad LPIPS frente a la referencia FP32, no benchmarks estándar de generación.

| Configuracion | Tamano total | LPIPS a referencia (1024², 50 pasos, semilla 0) | Notas |
|---|---|---|---|
| bf16 (modelo publicado) | 26 GB | 0.044 | Deriva propia del bf16 |
| Faithful: DiT w8-gptq + TE w8-gptq | 13.8 GB (53 %) | 0.013 (0.30x del bf16) | Más cercano a FP32 que el propio bf16 |
| Equivalent quality: DiT w8-gptq + TE cal-mix6 | 11.4 GB (44 %) | 0.031 (0.70x del bf16) | Cambia composición en prompts de bifurcación |
| Q6_K DiT (imatrix) y Q4_K_M DiT de la comunidad | por debajo de 8 bits | no disponible numéricamente | Fallan en texto pequeño; el sello "墨香" queda ilegible |
| Q6_K DiT de molbal + TE W8 | 13.0 GB | no disponible numéricamente | Pasa el umbral de calidad pero es mayor que la selección de calidad |

En el caso de dos personas (512², 20 pasos, semilla 1), el bf16 deriva 0.15 y la selección de calidad dibuja dos niños en lugar de una niña y un hombre (0.298 frente a FP32, medido 0.301, límite 0.301). La selección fiel se mantiene en 0.01-0.03 en todas las filas evaluadas. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM para la selección fiel: 13.8 GB en total (DiT 5.40 GB + codificador de texto 8.45 GB); para la selección de calidad, 11.4 GB (DiT 5.40 GB + TE 5.97 GB).
- El DiT fiel de 5.40 GB cabe en una GPU de 8 GB; el codificador de texto de 8.45 GB no cabe y debe ejecutarse en CPU o con offload.
- Estrategia de baja VRAM: ejecutar el codificador de texto una vez por prompt, después el DiT y después el VAE, de forma secuencial.
- GPU recomendadas: no se especifican modelos concretos (A100, H100, RTX 4090) en la información disponible; el requisito documentado es de capacidad de VRAM.
- Opciones de despliegue: ComfyUI con ComfyUI-GGUF (Unet Loader GGUF y cargador CLIP GGUF con soporte `qwen35`); llama.cpp para el codificador de texto (layout `qwen35`). No se documenta vLLM ni TGI para este pipeline.
- Latencia y throughput: no disponibles. Las mediciones se hicieron con un harness de PyTorch que descuantiza cada peso y calcula en FP32; no se probó la ejecución dentro de ComfyUI ni en llama.cpp.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Fidelidad / rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MOSS-Image-SFT-quant-GGUF (Faithful) | DiT 5.08 B + TE 9 B | no disponible | LPIPS 0.013 (0.30x del bf16) | Apache 2.0 | GGUF en Hugging Face |
| MOSS-Image-SFT (original, bf16) | DiT 5.08 B + TE 9 B | no disponible | LPIPS 0.044 respecto a FP32 | Apache 2.0 | Pesos originales en Hugging Face |
| Q6_K DiT de molbal + TE W8 | DiT 5.08 B + TE 9 B | no disponible | Pasa el umbral de calidad; 13.0 GB | Apache 2.0 | GGUF de la comunidad |
| Q4_K_M DiT de la comunidad | DiT 5.08 B + TE 9 B | no disponible | Falla en texto pequeño y redibuja escenas | Apache 2.0 | GGUF de la comunidad |

No se dispone de datos para comparar con otros modelos text-to-image de la misma categoría (por ejemplo, familias FLUX o SD) en la información proporcionada.

## Limitaciones y advertencias

- Ninguna cuantización del DiT por debajo de 8 bits es fiel, incluidas las versiones Q6_K propias (imatrix y GPTQ) y los archivos Q6_K y Q4_K_M de la comunidad.
- Por debajo de 8 bits en el DiT, o por debajo del codificador de texto cal-mix6, se degrada primero el texto pequeño: el sello "墨香" se vuelve ilegible y Q4_K_M llega a escribir "書" en lugar de "书" y a redibujar escenas completas.
- La selección de calidad (11.4 GB) cambia la composición en prompts de bifurcación; el caso de dos personas dibuja dos niños en lugar de una niña y un hombre.
- El VAE no está incluido en el repositorio; debe usarse el decodificador FLUX.2 small original (0.25 GB).
- Las pruebas end-to-end se limitaron a los archivos `dit-w8-gptq`, `dit-cal-mix6` y `te-cal-mix6`; el resto de codificadores de texto solo se verificaron por relectura.
- No se comprobó la ejecución dentro de ComfyUI ni en llama.cpp; las mediciones usan un harness de PyTorch con descuantización y cómputo en FP32.
- Riesgo de alucinación visual y sesgos: no documentados en la información disponible.
- Idiomas soportados: no disponibles; el codificador de texto es Qwen3.5-9B, pero no se detalla cobertura lingüística del pipeline.
- Licencia Apache 2.0, que permite uso comercial; conviene verificar las condiciones del modelo base OpenMOSS-Team/MOSS-Image-SFT.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nynefold/MOSS-Image-SFT-quant-GGUF
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- ComfyUI-GGUF: https://github.com/city96/ComfyUI-GGUF
