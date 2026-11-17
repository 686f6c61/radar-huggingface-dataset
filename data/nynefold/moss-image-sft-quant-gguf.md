# nynefold/MOSS-Image-SFT-quant-GGUF

## Resumen

MOSS-Image-SFT-quant-GGUF es un conjunto de cuantizaciones en formato GGUF del modelo de generación de imágenes OpenMOSS-Team/MOSS-Image-SFT, publicadas por el usuario nynefold. El paquete incluye 37 recetas de cuantización distintas (tanto las que superaron los criterios de calidad como las que no), con el resultado medido de cada una, y está pensado para su uso en ComfyUI mediante el nodo ComfyUI-GGUF. El modelo base es un sistema text-to-image compuesto por un DiT de 5.082.308.608 parámetros (aproximadamente 5,08 B) y un codificador de texto Qwen3.5-9B de 9 B, más un VAE FLUX.2 small decoder de 0,25 GB que no se incluye en el repositorio.

El objetivo declarado del autor es responder a una pregunta concreta: cuál es el modelo más pequeño cuyas imágenes se mantienen lo más cerca posible de las del modelo publicado, para el mismo prompt y la misma semilla. El estudio concluye que ninguna cuantización del DiT por debajo de 8 bits supera los umbrales de fidelidad establecidos, incluidos los Q6_K propios (imatrix y GPTQ) y los Q6_K y Q4_K_M de la comunidad. El codificador de texto, en cambio, sí puede comprimirse por debajo de 8 bits sin pérdida apreciable.

El resultado práctico son dos configuraciones recomendadas: la opción "Faithful" (13,8 GB en total, 53 % del modelo original de 26 GB), que reproduce las mismas imágenes que el modelo publicado con un drift menor que la propia inferencia en bf16, y la opción "Equivalent quality" (11,4 GB, 44 %), que mantiene calidad y renderizado de texto pero altera la composición en algunos prompts ambiguos. La licencia es Apache 2.0 y el repositorio ocupa 115,6 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) para el generador de imágenes; codificador de texto Qwen3.5-9B; VAE FLUX.2 small decoder (no incluido) |
| Parametros totales | 5.082.308.608 (DiT); codificador de texto de 9 B adicional |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q3_K, Q4_0, Q4_K, Q5_K, Q6_K, Q8_0, BF16, F32 (tipos ggml estándar); variantes GPTQ e imatrix en algunas recetas |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con tensores en tipos ggml estándar; sin kernels personalizados) |

## Arquitectura y entrenamiento

El modelo base MOSS-Image-SFT combina un Diffusion Transformer (DiT) de 5,08 B de parámetros con un codificador de texto Qwen3.5-9B y un VAE basado en el decodificador small de FLUX.2. El repositorio de cuantización no documenta los datos de entrenamiento del modelo original (número de tokens, composición del dataset, uso de RLHF/DPO u otras técnicas de alineación), por lo que esa información no está disponible en la documentación proporcionada.

La innovación técnica de este repositorio no reside en el modelo en sí, sino en la metodología de cuantización. El autor aplica GPTQ e imatrix sobre los pesos del DiT y del codificador de texto, y evalúa cada receta midiendo la distancia LPIPS respecto a una referencia calculada en FP32 sobre los pesos originales, con el mismo prompt y la misma semilla. Los archivos del DiT emplean el mismo layout de tensores que otros GGUF de MOSS-Image ya existentes (por ejemplo, los de molbal); en las recetas uniformes y por reglas, q, k y v comparten tipo y aparecen fusionados en `qkv`, mientras que las recetas mixtas los mantienen separados. Los archivos del codificador de texto usan el layout `qwen35` de llama.cpp, con `attn_qkv`, `attn_gate`, `ssm_alpha` y `ssm_beta` separados, sin LM head, y con el tokenizador y los metadatos de Qwen3.5-9B. Todos los archivos fueron releídos tras su escritura y comparados con los pesos cuantizados medidos, con coincidencia exacta salvo dos excepciones documentadas: las escalas de capas DiT con redondeo simple se almacenan en fp16 (error relativo ≤ 5,2e-8), y en los codificadores de texto con tensores `out_proj` (`ssm_out`) en K-quant estos se recuantizan por el desplazamiento del orden de cabeceras de llama.cpp, afectando a entre 3 y 23 tensores por archivo con el mismo nivel de error.

## Capacidades

- Generación de imágenes text-to-image en resoluciones de al menos 1024×1024, con 50 pasos documentados como configuración de referencia.
- Renderizado de texto dentro de la imagen, incluida caligrafía y caracteres chinos (por ejemplo, el sello "墨香" en el prompt de caligrafía), siempre que se usen las recetas de 8 bits recomendadas.
- Reproducibilidad determinista por prompt y semilla: la opción "Faithful" produce imágenes idénticamente fieles al modelo publicado para la misma entrada.
- Compatibilidad con ComfyUI mediante ComfyUI-GGUF: carga del DiT con el nodo Unet Loader (GGUF) y del codificador de texto con el cargador CLIP GGUF con soporte para Qwen3.5 (`qwen35`).
- Ejecución en GPUs de baja VRAM mediante ejecución secuencial: codificador de texto una vez por prompt, después el DiT y después el VAE.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión de entrada, audio ni modo thinking, ya que se trata de un modelo de generación de imágenes.

## Casos de uso

- Generación de imágenes en producción con ComfyUI: cargar `dit/moss_image_sft-dit-w8-gptq.gguf` junto con `text_encoder/moss_image_sft-te-w8-gptq.gguf` permite obtener las mismas imágenes que el modelo publicado con un consumo total de 13,8 GB, lo que reduce los requisitos de VRAM frente a los 26 GB del modelo original.
- Despliegue en GPUs de 8 GB: el DiT "Faithful" ocupa 5,40 GB y cabe en una tarjeta de 8 GB; el codificador de texto de 8,45 GB se ejecuta en CPU o con offloading, de modo que el pipeline completo es viable en hardware consumer.
- Renderizado de texto en carteles y materiales gráficos: las recetas de 8 bits mantienen la legibilidad de cadenas citadas y sellos caligráficos, lo que las hace adecuadas para generar pósters, portadas o banners con texto integrado.
- Prototipado rápido de prompts: la opción "Equivalent quality" (11,4 GB) permite iterar sobre composiciones con un coste de VRAM menor, aceptando que algunos prompts ambiguos cambien la composición.
- Investigación sobre cuantización de modelos de difusión: el repositorio incluye las 37 recetas con sus resultados medidos, lo que sirve como referencia para estudiar el impacto de Q3_K, Q4_K, Q5_K, Q6_K y Q8_0 en un DiT y en un codificador de texto basado en Qwen3.5.
- Integración en pipelines automatizados de generación por lotes: la ejecución secuencial (text encoder, DiT, VAE) y el uso exclusivo de tipos ggml estándar, sin kernels personalizados, facilitan el despliegue en entornos heterogéneos.
- Evaluación comparativa de fidelidad: el conjunto de imágenes de comparación y los valores LPIPS publicados permiten validar reproducciones locales frente a la referencia FP32.

## Benchmarks y rendimiento

El repositorio no publica benchmarks estándar (MMLU, HumanEval, GSM8K u otros), sino métricas de fidelidad de imagen medidas con LPIPS respecto a la referencia FP32 sobre los pesos originales, para el mismo prompt y semilla.

| Configuracion | Tamano total | LPIPS medio (3 prompts retenidos, 1024², 50 pasos, seed 0) | Notas |
|---|---|---|---|
| Referencia FP32 (pesos publicados) | 26 GB | 0 (referencia) | Referencia de comparación |
| Modelo publicado en bf16 | 26 GB | 0,044 | Drift propio de la inferencia en bf16 |
| Faithful (dit-w8-gptq + te-w8-gptq) | 13,8 GB (53 %) | 0,013 (0,30× el drift de bf16) | Imágenes idénticas al modelo publicado; se mantiene en 0,01-0,03 en todas las filas evaluadas |
| Equivalent quality (dit-w8-gptq + te-cal-mix6) | 11,4 GB (44 %) | 0,031 (0,70×) | Mantiene calidad y texto; cambia composición en prompts ambiguos (por ejemplo, dos niños en lugar de una niña y un hombre) |

Casos de fallo documentados a 512² y 20 pasos: por debajo de 8 bits en el DiT, o por debajo del codificador `cal-mix6`, se degrada primero el texto pequeño. El DiT Q6_K, el Q4_K_M de la comunidad y el par de 9,3 GB convierten el sello "墨香" en un sello ilegible; el Q4_K_M además escribe "書" en lugar de "书" y redibuja escenas completas. No se han publicado resultados de benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM para la opción "Faithful": 13,8 GB en total (DiT 5,40 GB + codificador de texto 8,45 GB); el VAE FLUX.2 small decoder añade 0,25 GB y debe tomarse del modelo original.
- VRAM para la opción "Equivalent quality": 11,4 GB en total (DiT 5,40 GB + codificador de texto 5,97 GB).
- GPUs consumer: el DiT "Faithful" (5,40 GB) cabe en una tarjeta de 8 GB; el codificador de texto de 8,45 GB no cabe, por lo que debe ejecutarse en CPU o con offloading. La configuración de 11,4 GB requiere al menos 12 GB de VRAM para ejecutar todo en GPU.
- GPUs de datacenter: no se especifican modelos concretos (A100, H100, RTX 4090); el autor solo documenta el comportamiento en tarjetas de 8 GB y el uso secuencial de los componentes.
- Opciones de despliegue: ComfyUI con ComfyUI-GGUF (soporte para Qwen3.5 / `qwen35` en el cargador CLIP GGUF). No se documenta compatibilidad con vLLM, TGI, Ollama ni llama.cpp para inferencia de imágenes; de hecho, el autor indica explícitamente que no ha probado los archivos dentro de ComfyUI ni en llama.cpp.
- Latencia y throughput: no disponibles. Todas las mediciones se realizaron con un harness de PyTorch que descuantiza cada peso y calcula en FP32, por lo que no reflejan el rendimiento de inferencia real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MOSS-Image-SFT (original, OpenMOSS-Team) | DiT 5,08 B + text encoder 9 B | No disponible | Pesos originales (26 GB) | Apache 2.0 | Hugging Face |
| MOSS-Image-SFT-quant-GGUF "Faithful" (este repo) | DiT 5,08 B + text encoder 9 B cuantizados | No disponible | GGUF (13,8 GB) | Apache 2.0 | Hugging Face |
| MOSS-Image-SFT-quant-GGUF "Equivalent quality" (este repo) | DiT 5,08 B + text encoder 9 B cuantizados | No disponible | GGUF (11,4 GB) | Apache 2.0 | Hugging Face |
| GGUF de MOSS-Image de la comunidad (p. ej. molbal) | DiT 5,08 B + text encoder 9 B cuantizados | No disponible | GGUF | No disponible | Hugging Face |

No se dispone de datos de benchmarks estándar para establecer una comparación de rendimiento con modelos de otras familias; la única comparación documentada es interna, entre recetas de cuantización del mismo modelo base, medida con LPIPS frente a la referencia FP32.

## Limitaciones y advertencias

- Ninguna cuantización del DiT por debajo de 8 bits supera los criterios de fidelidad del estudio, incluidos los Q6_K propios (imatrix y GPTQ) y los Q6_K y Q4_K_M de la comunidad; el texto pequeño es el primer elemento que se degrada.
- La opción "Equivalent quality" cambia la composición de la imagen en prompts ambiguos: en la escena de dos personas dibuja dos niños en lugar de una niña y un hombre (LPIPS 0,298 frente a FP32, medido 0,301, límite 0,301).
- El VAE (FLUX.2 small decoder, 0,25 GB) no está incluido en el repositorio; debe usarse el original.
- No se ha verificado el funcionamiento de los archivos dentro de ComfyUI ni en llama.cpp: todas las mediciones usaron un harness de PyTorch en FP32, y ComfyUI-GGUF descuantiza en bf16/fp16, por lo que las imágenes diferirán ligeramente.
- El codificador de texto de la opción "Faithful" (8,45 GB) no cabe en GPUs de 8 GB y requiere CPU u offloading.
- En los codificadores de texto con tensores `out_proj` en K-quant, entre 3 y 23 tensores por archivo se recuantizan con el mismo nivel de error (por ejemplo, 1,41e-3 relativo); afecta a 12 tensores del `te-cal-mix6` de la opción de calidad, pero a ninguno del `te-w8-gptq` de la opción fiel.
- No se documentan sesgos conocidos, riesgos de alucinación específicos ni restricciones de licencia para uso comercial más allá de la licencia Apache 2.0 declarada; la licencia Apache 2.0 permite uso comercial con las obligaciones habituales de atribución y aviso.
- No se dispone de información sobre idiomas soportados ni sobre el comportamiento del modelo en idiomas distintos del documentado en los ejemplos (prompts con texto en chino).
- El repositorio ocupa 115,6 GB, aunque las dos configuraciones recomendadas suman 13,8 GB y 11,4 GB respectivamente; el resto corresponde a las 37 recetas completas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nynefold/MOSS-Image-SFT-quant-GGUF
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- ComfyUI-GGUF: https://github.com/city96/ComfyUI-GGUF
- GGUF de MOSS-Image de la comunidad (molbal): no disponible como enlace directo en la información proporcionada
- Paper, blog o demo del modelo base: no disponible en la información proporcionada
