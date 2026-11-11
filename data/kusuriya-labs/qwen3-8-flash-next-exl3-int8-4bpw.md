# kusuriya-labs/Qwen3.8-Flash-Next-EXL3-INT8-4bpw

## Resumen

Qwen3.8-Flash-Next-EXL3-INT8-4bpw es una cuantización del modelo multimodal Qwen/Qwen3.8-Flash-Next, publicada por el usuario kusuriya-labs en Hugging Face. No se trata de una versión oficial de Qwen, sino de un checkpoint cuantizado con un formato propietario denominado EXL3-INT8, derivado del formato EXL3 de ExLlamaV3 pero con un codebook modificado que fuerza que cada peso decodificado caiga en una rejilla INT8 fija. El objetivo es habilitar inferencia con instrucciones INT8 (dot-product y WMMA) sobre GPUs AMD vía ROCm, reduciendo el coste de memoria y cómputo respecto a los pesos en BF16.

El modelo base es un transformer multimodal de tipo image-text-to-text con aproximadamente 33.700 millones de parámetros, orientado a conversación, razonamiento y procesamiento de imágenes. La cuantización aplica 4.0 bits por peso a las capas lineales del modelo de lenguaje (incluidos los expertos enrutados), 6 bits al LM head y a la torre de visión, y mantiene sin cuantizar embeddings, normas y controles recurrentes. El repositorio ocupa unos 100,3 GB, de los cuales 32,6 GB corresponden a una tabla de embeddings n-gram (PLE) en formato EXL3 estándar.

La relevancia de esta ficha es doble: por un lado, documenta una técnica de cuantización poco habitual (EXL3-INT8) con implicaciones prácticas para despliegue en hardware AMD; por otro, advierte de que el formato no es compatible con ExLlamaV3 estándar ni con vLLM/Transformers, y de que en el momento de publicación no existe un runtime público que lo ejecute. Es, por tanto, un artefacto experimental más que una opción lista para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con expertos enrutados (MoE) y tabla de embeddings n-gram (PLE); detalles completos no disponibles en la informacion proporcionada |
| Parametros totales | 33.743.625.728 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3-INT8 4.0 bpw (lineales del LM, incluidos expertos enrutados); EXL3-INT8 6 bit (LM head y vision); EXL3-INT8 4 bit (MTP); EXL3 estandar (tabla n-gram PLE); embeddings, normas y controles sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 (license: other, license_name: qwen-community-1.0) |
| Formato de pesos | safetensors (formato EXL3-INT8, no compatible con Transformers, vLLM ni ExLlamaV3 upstream) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un transformer multimodal con mezcla de expertos (MoE), según se deduce de la presencia de "expertos enrutados" en la descripción de la cuantización y de la mención a una tabla de embeddings n-gram (PLE) de 32,6 GB. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO. La model card del checkpoint cuantizado remite a `SOURCE_MODEL_CARD.md` para las características del modelo original, pero ese contenido no se incluye en los datos disponibles.

La innovación técnica principal de este checkpoint es el formato EXL3-INT8. Se parte del formato trellis EXL3 de ExLlamaV3, pero se modifica el codebook de manera que el estado del trellis se multiplica por la constante de 24 bits `0xDCD12D` (una instrucción `v_mul_u32_u24`), se suman los cuatro bytes del producto y se obtiene el peso INT8 mediante `q = (B - 509) >> 2`, con valor real `q * 4 * 887 * 2^-17`. El multiplicador se almacena en el tensor `.mul1` de cada capa lineal con el valor `0x00DCD12D` en lugar del estándar `0x83DCD12D`, y `quantization_config.json` declara `"codebook": "exl3-int8"`. La calibración se realizó con 250 secuencias de 2048 tokens. El resultado son pesos decodificados que alimentan directamente instrucciones `iu8` de dot-product y WMMA, con activaciones INT8 (escala por grupo de 128 y epílogo fp32 con el `svh` original).

## Capacidades

- Generación de texto y conversación multi-turno, heredadas del modelo base Qwen3.8-Flash-Next.
- Procesamiento de imagen y texto combinados (pipeline image-text-to-text), con torre de visión cuantizada a 6 bits.
- Razonamiento y matemáticas: capacidades propias del modelo base, no verificadas de forma independiente en esta cuantización.
- Generación de código: no confirmada explícitamente en la información disponible.
- Tool calling / function calling: no confirmado en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la información proporcionada.
- Capacidades multilingües: no disponibles; el campo de idiomas del repo está vacío.
- Modo thinking explícito: no disponible.
- La cuantización conserva la arquitectura MoE del modelo base, incluidos los expertos enrutados, que se cuantizan a 4.0 bpw.

## Casos de uso

- Investigación en cuantización extrema: el checkpoint sirve para estudiar el impacto de una rejilla INT8 fija en la calidad de un modelo MoE multimodal, comparando la divergencia KL frente a BF16 con la de una cuantización EXL3 estándar del mismo modelo.
- Evaluación de hardware AMD en inferencia LLM: al estar implementado el decodificado nativo para `gfx1201` (RDNA4, por ejemplo R9700) y `gfx1030` (RDNA2, por ejemplo V620), es útil para probar pipelines ROCm y medir prefill y decode en GPUs de consumo y profesionales AMD.
- Desarrollo de kernels y runtimes: la necesidad de un multiplicador específico (`0xDCD12D`) y de kernels INT8 agrupados para expertos MoE lo convierte en un caso de prueba para quien desarrolle extensiones de ExLlamaV3 o runtimes alternativos como `shelf`.
- Despliegue de un modelo de 33,7B en dos GPUs de 32 GB: con la tabla n-gram en RAM de host, el formato de 3,05 bpw cabe en 2x V620; el de 4 bpw no cabe, lo que lo hace relevante para laboratorios con ese perfil de hardware.
- Análisis de calidad por caso: la model card identifica un texto (`wiki2_r7`) con divergencia KL anómala (0,601 frente a 0,158), lo que permite usar el checkpoint para depurar la sensibilidad del codebook INT8 a determinados dominios.
- Prototipado de asistentes multimodales en entornos controlados: una vez exista runtime público, podría emplearse para tareas de descripción de imágenes y diálogo, siempre que se acepte la pérdida de calidad documentada.

## Benchmarks y rendimiento

Los únicos datos publicados corresponden a la evaluación del checkpoint a 3,05 bpw (no a 4 bpw) con la build ROCm de ExLlamaV3 sobre 2x V620 (gfx1030), reparto por capas y tabla n-gram en RAM de host. La métrica es divergencia KL frente a logits BF16 sobre 21 casos (32.359 posiciones, chunk 256, teacher forced).

| Metrica | EXL3-INT8 3,05 bpw | EXL3 estandar 3,05 bpw (referencia) |
|---|---|---|
| Macro KLD | 0,1530 | 0,1314 |
| Top-1 agreement | 0,8688 | 0,8999 |
| Caso outlier `wiki2_r7` (KLD) | 0,601 | 0,158 |

| Metrica de velocidad (ruta FP16) | Valor |
|---|---|
| Prefill a 512 tokens | 258 tok/s |
| Prefill a 2048 tokens | 412 tok/s |
| Prefill a 8192 tokens | 389 tok/s |
| Decode | 25 tok/s |

El autor advierte de que la comparación mezcla el efecto del codebook con ruido de cuantización entre ejecuciones distintas, y de que la ruta de cómputo INT8 (activaciones INT8) no se evaluó en este modelo. El checkpoint a 4 bpw no se evaluó porque no cabe en dos V620 de 32 GB. No hay resultados de MMLU, HumanEval, GSM8K ni de benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio completo ocupa 100,3 GB, de los cuales 32,6 GB son la tabla n-gram; el autor indica un total de aproximadamente 95 GB. El checkpoint a 3,05 bpw cabe en 2x V620 de 32 GB con reparto por capas y tabla n-gram en RAM de host; el de 4 bpw no cabe en esa configuración.
- GPU recomendadas: AMD Radeon V620 (gfx1030, RDNA2) y R9700 (gfx1201, RDNA4) son las soportadas nativamente por el decodificado implementado. No se documenta soporte para A100, H100 ni RTX 4090.
- GPU de consumo: no hay confirmación de que quepa en GPUs de consumo; el requisito documentado es de 2x 32 GB en el mejor caso (3,05 bpw).
- Opciones de despliegue: build parcheada de ExLlamaV3 para ROCm y runtime `shelf`; ninguno de los dos está publicado según la model card. ExLlamaV3 upstream, vLLM, TGI, llama.cpp y Ollama no pueden cargar este formato.
- Latencia y throughput: prefill de 258/412/389 tok/s a 512/2048/8192 tokens y decode de 25 tok/s en la ruta FP16 sobre 2x V620, idénticos al formato EXL3 estándar. La ruta INT8 no fue medida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad de runtime |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-EXL3-INT8-4bpw (este) | 33,7B | no disponible | EXL3-INT8 safetensors | Qwen Community 1.0 | Sin runtime público en el momento de publicación |
| Qwen/Qwen3.8-Flash-Next (base) | 33,7B | no disponible | safetensors BF16 | Qwen Community 1.0 | Transformers, vLLM y otros frameworks estándar |
| Cuantización EXL3 estándar 3,05 bpw del mismo base | 33,7B | no disponible | EXL3 safetensors | Qwen Community 1.0 | ExLlamaV3 (incluida build ROCm) |
| Otras alternativas de 30-35B multimodales | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa con modelos de otros fabricantes no está disponible en la información proporcionada. El dato más relevante es que la variante EXL3 estándar del mismo modelo obtiene mejor KLD (0,1314 frente a 0,1530) y mejor top-1 agreement (0,8999 frente a 0,8688) en el mismo harness, aunque se trata de ejecuciones de cuantización distintas.

## Limitaciones y advertencias

- No es un modelo oficial de Qwen: es una cuantización de terceros (kusuriya-labs) y las afirmaciones de la model card original no aplican a este checkpoint.
- El formato EXL3-INT8 no es convertible desde un checkpoint EXL3 estándar y no lo puede cargar ExLlamaV3 upstream, que decodificaría los pesos con el multiplicador estándar y produciría basura.
- En el momento de la publicación no existe runtime público: ni la build parcheada de ExLlamaV3 para ROCm ni el runtime `shelf` están publicados. En `shelf`, además, la ruta MoE no puede ejecutar expertos EXL3-INT8 por falta de kernel INT8 agrupado.
- Solo hay soporte nativo de decodificado para AMD gfx1201 y gfx1030; no se documenta soporte para NVIDIA.
- El checkpoint a 4 bpw no fue evaluado; las métricas publicadas corresponden a 3,05 bpw, por lo que la calidad real de esta variante de 4 bpw es desconocida.
- El caso `wiki2_r7` muestra una divergencia KL anómala (0,601 frente a 0,158 en la referencia), sin análisis de causa; indica sensibilidad del codebook INT8 a ciertos textos.
- La ruta de cómputo INT8 (activaciones INT8) no fue evaluada, así que el rendimiento y la calidad en ese modo son desconocidos.
- Riesgo de alucinación y sesgos: no documentados específicamente para esta cuantización; heredados del modelo base, cuyos detalles no están en la información disponible.
- Idiomas soportados no disponibles; el repo no declara lista de idiomas.
- Licencia Qwen Community License 1.0: es necesario revisar sus términos para uso comercial, ya que no es una licencia permisiva tipo Apache 2.0 y puede incluir restricciones adicionales.
- El repo incluye una tabla n-gram de 32,6 GB que debe residir en RAM de host en la configuración evaluada, lo que incrementa los requisitos de memoria del sistema más allá de la VRAM.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kusuriya-labs/Qwen3.8-Flash-Next-EXL3-INT8-4bpw
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- ExLlamaV3 (repositorio): https://github.com/turboderp-org/exllamav3
- Model card original preservada en el repo: `SOURCE_MODEL_CARD.md`
- Licencia: `LICENSE` en el repositorio (Qwen Community License 1.0)
