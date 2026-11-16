# huxiang088/UI-Mate-27B-W4A16-NVFP4

## Resumen

UI-Mate-27B-W4A16-NVFP4 es una cuantización experimental del modelo tencent/UI-Mate-27B, publicada por el usuario huxiang088. Se trata de una conversión de solo pesos a formato NVFP4 (4 bits) con activaciones en 16 bits, realizada íntegramente en CPU mediante redondeo al más cercano (round-to-nearest) con tamaño de grupo 16. El modelo base pertenece a la familia Qwen 3.5 y está orientado a tareas de interfaz de usuario (UI), presumiblemente agentes que interactúan con entornos gráficos.

La relevancia de esta ficha es doble: por un lado, documenta un modelo de 27.356 millones de parámetros en un formato de muy baja precisión (4 bits) que reduce el peso del repositorio a 17,9 GB; por otro, advierte de que la conversión no ha sido validada contra benchmarks completos en BF16 y que requiere un cargador personalizado para SM70 (V100) con kernels CUDA específicos, por lo que las herramientas estándar como SGLang o vLLM pueden rechazarlo.

La licencia es Apache 2.0, heredada del modelo base, y el repositorio se creó automáticamente mediante un pipeline de conversión en Modal. La información disponible es escasa: no hay datos de benchmarks, idiomas soportados ni pipeline declarado, y el propio autor marca el artefacto como experimental y no validado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen 3.5, según tag `qwen3_5`) |
| Parametros totales | 27.356.728.560 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A16 NVFP4 (pesos 4 bits E2M1, activaciones 16 bits), group size 16, escalas de bloque E4M3FN y escalas por tensor FP32 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (401 tensores convertidos; módulos de 16 bits preservados según `hf_quant_config.json`, `keep_lm_head=False`) |

## Arquitectura y entrenamiento

El modelo base tencent/UI-Mate-27B es un transformer de 27.356 millones de parámetros, etiquetado con la familia `qwen3_5`, lo que sugiere que deriva de la arquitectura Qwen 3.5. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO, ya que la model card del repositorio cuantizado no los detalla y no se ha proporcionado la del modelo original.

La innovación técnica de este artefacto concreto es el proceso de cuantización: conversión W4A16 weight-only en CPU con redondeo al más cercano, empaquetado E2M1 con el nibble bajo primero, escalas de bloque en E4M3FN y escalas por tensor en FP32, con un tamaño de grupo de 16. Se preservan 16-bit modules según las exclusiones de `hf_quant_config.json` y se excluye la cabeza del modelo (`keep_lm_head=False`). El autor indica explícitamente que no se trata de un PTQ completo de NVIDIA ModelOpt en GPU ni de un W4A4 de Gittensor, y que requiere un cargador personalizado SM70 con kernels CUDA compatibles.

## Capacidades

- Generación de texto y razonamiento general, heredadas del modelo base Qwen 3.5 de 27B.
- Orientación a tareas de interfaz de usuario (UI-Mate), presumiblemente interacción con entornos gráficos y agentes de UI, aunque la model card no detalla las capacidades concretas.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Despliegue en hardware con VRAM limitada: la cuantización a 4 bits reduce el peso a 17,9 GB, lo que permite ejecutar un modelo de 27B en GPUs con 24 GB de VRAM, aunque requiere el cargador SM70 personalizado y kernels CUDA específicos.
- Investigación en cuantización de bajo rango: sirve como artefacto de referencia para estudiar el impacto de NVFP4 W4A16 con group size 16 en modelos de 27B, comparando la fidelidad frente al BF16 original.
- Evaluación de pipelines de conversión en CPU: el repositorio documenta un pipeline automático en Modal y puede usarse para reproducir o auditar el proceso de cuantización weight-only.
- Prototipado de agentes de UI en entornos con recursos restringidos: si el modelo base está orientado a interacción con interfaces, esta versión permite experimentar con agentes de UI en GPUs de gama alta para consumidor, siempre que se implemente el cargador requerido.
- Pruebas de compatibilidad de kernels: útil para validar cargadores W4A16_NVFP4 en arquitecturas SM70 (V100) y comparar con SGLang o vLLM estándar, que pueden rechazar el modelo.
- Docencia y experimentación con formatos NVFP4: permite ilustrar el empaquetado E2M1, las escalas de bloque E4M3FN y las escalas por tensor FP32 en un modelo de tamaño medio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que el modelo no ha sido validado contra benchmarks completos de GUI en BF16 y que no se ha probado en V100/SM70 con SGLang.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 17,9 GB solo para pesos en NVFP4; hay que añadir la memoria de activaciones, caché KV y overhead del runtime, por lo que se recomienda un mínimo de 24 GB de VRAM.
- GPU recomendadas: el autor menciona SM70 (V100) como objetivo del cargador personalizado; no se han validado otras arquitecturas. Para un modelo de 27B en 4 bits, GPUs como A100 40GB, H100 o RTX 4090 (24 GB) serían candidatas, pero la compatibilidad no está confirmada.
- ¿Cabe en consumer GPU? Sí, en teoría cabe en una RTX 4090 de 24 GB, pero requiere el cargador SM70 personalizado y kernels CUDA compatibles; no se ha validado.
- Opciones de despliegue: SGLang o vLLM estándar pueden rechazar el modelo; se necesita un cargador W4A16_NVFP4 personalizado. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| UI-Mate-27B-W4A16-NVFP4 (este) | 27,36B | no disponible | W4A16 NVFP4 | Apache 2.0 | Hugging Face, experimental |
| tencent/UI-Mate-27B (base) | 27,36B | no disponible | BF16 | Apache 2.0 | Hugging Face |
| Qwen 3.5 27B (referencia de familia) | ~27B | no disponible | BF16 y otras | no disponible | no disponible |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Modelo experimental: el autor lo marca como no validado contra benchmarks completos en BF16 y no probado en V100/SM70 con SGLang.
- Requiere un cargador SM70 W4A16_NVFP4 personalizado y kernels CUDA específicos; las herramientas estándar (SGLang, vLLM) pueden rechazarlo.
- El repositorio se genera automáticamente y solo se considera completo cuando existe el marcador `_CPU_NVFP4_COMPLETE.json`; hasta entonces, el artefacto está incompleto.
- La cuantización a 4 bits puede degradar la calidad frente al BF16 original; no se han publicado métricas de degradación.
- No se dispone de información sobre sesgos, riesgo de alucinación, limitaciones de contexto o idioma del modelo base.
- Licencia Apache 2.0: permite uso comercial, pero al ser una conversión no validada, el riesgo de fallo en producción recae en el integrador.
- La cabeza del modelo no se preserva en 16 bits (`keep_lm_head=False`), lo que puede afectar a la calidad de la generación final.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huxiang088/UI-Mate-27B-W4A16-NVFP4
- Modelo base: https://huggingface.co/tencent/UI-Mate-27B
- Revisión inmutable del modelo base: `3ade2378fc84032d5017c1a9c93c4eaa77d65e57`
- Paper, blog, repositorio o demo: no disponible
