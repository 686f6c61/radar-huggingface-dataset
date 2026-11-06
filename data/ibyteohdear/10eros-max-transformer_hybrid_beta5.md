# ibyteohdear/10Eros-Max-Transformer_hybrid_beta5

## Resumen

10Eros-Max-Transformer_hybrid_beta5 es un checkpoint de pesos del transformer de difusión de MiniMax-H3, derivado del modelo base `multimodalart/MiniMax-H3-Pruned` y publicado por el usuario `ibyteohdear`. No es un modelo nuevo ni un LoRA: se trata de una conversión completa del archivo original `10Eros_Max_h3_hybrid_beta5.safetensors` al árbol de módulos de la clase `MiniMaxH3PrunedTransformer3DModel` de la librería diffusers, con las proyecciones AdaLN plegadas a sus coordenadas de rango 8. El objetivo es que el checkpoint pueda cargarse directamente con `AutoModel.from_pretrained` sin necesidad de fusionar, plegar ni parchear pesos en tiempo de carga.

El modelo pertenece a la familia MiniMax-H3, orientada a generación de vídeo a partir de texto, imagen o audio (text-to-video, image-to-video, audio-video). El transformer contiene 20.111.462.920 parámetros en safetensors (unos 20,1 mil millones) y el repositorio ocupa 40,2 GB, lo que sugiere pesos en bfloat16 o una mezcla de precisiones. La pipeline declarada en Hugging Face es `image-to-video` y la librería es diffusers.

La relevancia de este checkpoint es operativa: elimina la fricción de conversión que suele acompañar a los pesos publicados fuera del formato diffusers (nombres de bloques no canónicos, proyecciones QKV fusionadas, orden de las mitades del MLP invertido, AdaLN en formato tabular). Su adopción, sin embargo, es muy limitada: 18 descargas y 0 likes desde su creación el 1 de noviembre de 2026, sin licencia declarada ni idiomas especificados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer 3D de difusión (MiniMaxH3PrunedTransformer3DModel), con bloques `transformer_blocks` y `token_refiner.refiner_blocks`, proyecciones AdaLN de rango 8 |
| Parametros totales | 20.111.462.920 (20,1 mil millones) |
| Parametros activos | no disponible (no es MoE según la información proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la model card; el código de ejemplo usa `TorchAoConfig` con `Int8WeightOnlyConfig` para cuantización int8 weight-only en torchao |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (árbol de módulos diffusers), con `config.json`, `modeling_minimax_h3_pruned.py` y `adaln_affine`/`adaln_basis`/`adaln_mean` en el propio repo |
| Modelo base | multimodalart/MiniMax-H3-Pruned |
| Pipeline declarada | image-to-video |
| Tamaño del repositorio | 40,2 GB |
| Dependencia de código | `trust_remote_code=True` obligatorio (clase fuera de `MODEL_MAPPING`) |

## Arquitectura y entrenamiento

La arquitectura es un transformer de difusión 3D para generación de vídeo (y audio-vídeo), estructurado en bloques `transformer_blocks` más un `token_refiner` con sus propios `refiner_blocks`. El checkpoint incorpora proyecciones de parche, salida y condicionamiento con nombres canónicos de diffusers, proyecciones QKV separadas (`to_q`, `to_k`, `to_v`) en lugar de la `attn.qkv_proj` fusionada del release original, y el MLP con las mitades reordenadas de `[gate | value]` a `[value | gate]` para encajar con `ff.net.0.proj`. Las proyecciones AdaLN se mantienen en rango 8, con el sesgo movido a un `*.adaln_proj.folded_bias` en float32, una tabla `time_embedder.table` de 1025×8 y las matrices `adaln_basis` y `adaln_mean` incluidas en el propio archivo.

El punto técnico más delicado es el tratamiento de AdaLN: el modelo original lee `silu(time_embedder(time_proj(t)))`, una curva escalar de timestep que el subespacio afín de rango 8 aproxima con un RMS relativo de ~1,5e-5 sobre una rejilla uniforme de 1025 pasos con interpolación lineal entre muestras. Esto significa que el modelo es exacto en la rejilla de timesteps del sampler y solo aproximado fuera de ella; muestrear con sigmas desplazadas entre puntos de la rejilla no reproducirá el comportamiento numérico del modelo original. La base AdaLN de este archivo difiere de la referencia `adaln_affine.safetensors` en `++++----` por columna (signo arbitrario de la SVD), pero pesos y tabla llevan la misma base, de modo que el cómputo de la modulación es equivalente y `project_adaln_lora` sigue mapeando correctamente un LoRA AdaLN del checkpoint original.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens, la composición de datos ni si hubo RLHF/DPO o etapas de alineación. La model card indica explícitamente que no hay delta TURBO incorporado y que los LoRAs turbo habituales siguen siendo aplicables. El autor declara haber verificado el checkpoint contra la referencia antes de subirlo: conjunto exacto de claves, coseno por tensor en pesos muestreados, el intercambio SwiGLU evaluado en ambos sentidos contra el modelo base, `folded_bias` libre de gauge, autoconsistencia de gauge entre pesos y tabla, y la modulación AdaLN evaluada sobre los 1025 timesteps.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video).
- Generación de vídeo a partir de imagen (image-to-video), pipeline declarada en Hugging Face.
- Generación de vídeo con audio (audio-video), según los tags del repositorio.
- Carga directa en diffusers mediante `AutoModel.from_pretrained` con `trust_remote_code=True`, sin fusión ni parcheo en tiempo de carga.
- Compatibilidad con LoRAs turbo y con LoRAs AdaLN del checkpoint original a través de `project_adaln_lora`.
- Cuantización int8 weight-only vía torchao (`Int8WeightOnlyConfig`), tal como aparece en el código de ejemplo de la model card.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, matemáticas, código ni multilingüismo: no es un modelo de lenguaje, sino un transformer de difusión para vídeo.

## Casos de uso

- Generación de clips de vídeo a partir de una imagen de referencia: el checkpoint se conecta como componente `transformer` de la pipeline de MiniMax-H3, dejando VAE, text encoder y schedulers al repositorio base, lo que permite sustituir únicamente el transformer sin reescribir la pipeline completa.
- Iteración rápida sobre un modelo afinado: al estar ya en formato diffusers, se puede cargar con `AutoModel.from_pretrained` y comparar contra el base sin pasos intermedios de conversión de pesos.
- Aplicación de LoRAs turbo para reducir el número de pasos de muestreo: la model card confirma que no hay delta TURBO embebido y que los LoRAs turbo habituales funcionan, lo que resulta útil para prototipado con latencias más bajas.
- Aplicación de LoRAs AdaLN entrenados sobre el checkpoint original: `project_adaln_lora` mapea correctamente gracias a que `adaln_basis` se incluye en el propio archivo, lo que facilita reutilizar adaptadores ya entrenados.
- Despliegue con cuantización int8 en GPUs de memoria limitada: el ejemplo de la model card usa `TorchAoConfig` con `Int8WeightOnlyConfig`, adecuado para servir el transformer con menor huella de VRAM.
- Integración en una aplicación Gradio con gestión de GPU bajo demanda: el código de ejemplo incluye un decorador `spaces.GPU(duration=1500)` para Hugging Face Spaces con Zero-GPU, útil para demos públicas con arranque bajo demanda.
- Investigación sobre el efecto del plegado AdaLN de rango 8: el checkpoint permite estudiar cómo afecta la aproximación de la curva de timestep fuera de la rejilla del sampler, un caso de interés para quienes trabajan con modulaciones condicionadas por tiempo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de calidad de vídeo (FVD, CLIP score, etc.), comparativas con el modelo base ni mediciones de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 20,1 mil millones de parámetros, en bfloat16 los pesos ocupan aproximadamente 40 GB, lo que exige al menos una GPU de 48 GB o varias GPUs para carga completa sin cuantizar.
- Con cuantización int8 weight-only (torchao), la huella de pesos se reduciría a unos 20 GB, aunque la model card no aporta cifras medidas de VRAM total incluyendo activaciones, VAE y text encoder.
- GPU recomendadas: no especificadas por el autor. Por tamaño, un despliegue sin cuantizar requiere A100 80 GB, H100 80 GB o configuraciones multi-GPU; no se confirma compatibilidad con RTX 4090 (24 GB) sin cuantización agresiva.
- ¿Cabe en GPU de consumo? No hay datos que lo confirmen. Con 20,1 mil millones de parámetros y pesos en bf16, no cabría en una RTX 4090 de 24 GB sin cuantización.
- Opciones de despliegue: diffusers (vía `AutoModel` con `trust_remote_code=True`), pipeline modular de MiniMax-H3 (`diffusers.modular_pipelines.minimax_h3`), torchao para cuantización int8, Gradio para demos. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un transformer de difusión de vídeo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Pipeline | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| 10Eros-Max-Transformer_hybrid_beta5 | 20,1 mil millones | no disponible | image-to-video | no disponible | Hugging Face, 18 descargas |
| multimodalart/MiniMax-H3-Pruned (base) | no disponible | no disponible | no disponible | no disponible | Hugging Face (referenciado como base) |
| 10Eros_Max_h3_hybrid_beta5.safetensors (original) | no disponible | no disponible | no disponible | no disponible | Distribución original citada en la model card |

No se dispone de información suficiente para comparar rendimiento, calidad de generación ni latencia con alternativas de la misma categoría (por ejemplo, otros transformers de vídeo de tamaño comparable). Los datos de parámetros del modelo base y del checkpoint original no aparecen en la información proporcionada.

## Limitaciones y advertencias

- Licencia no declarada: no hay información sobre permisos de uso comercial, redistribución o modificación. No debe asumirse uso comercial libre.
- Idiomas no especificados: se desconoce el soporte multilingüe del text encoder asociado, que además no forma parte de este repositorio.
- Requiere `trust_remote_code=True`: la clase `MiniMaxH3PrunedTransformer3DModel` no está en `MODEL_MAPPING` de diffusers y se resuelve vía `auto_map` y `modeling_minimax_h3_pruned.py`, lo que implica ejecutar código del repositorio.
- Dependencia del repositorio base: VAE, text encoder y schedulers deben tomarse de `multimodalart/MiniMax-H3-Pruned`; este repo solo contiene el transformer.
- AdaLN aproximado fuera de la rejilla: el plegado de rango 8 es exacto en la rejilla de 1025 timesteps del sampler, pero es una aproximación si se muestrea con sigmas desplazadas entre puntos de la rejilla. No se debe esperar el comportamiento numérico del modelo original en esos casos.
- Intercambio de pesos en runtime: si se estaba usando un sistema de swap de pesos en tiempo de ejecución, debe desactivarse, porque el checkpoint ya está completo en este archivo.
- Sin delta TURBO: si se necesita muestreo rápido, hay que aplicar LoRAs turbo externos.
- Riesgo de alucinación y sesgos: no evaluado ni documentado en la información disponible; al ser un modelo de generación de vídeo, los riesgos se refieren a contenido generado (sesgos visuales, contenido sintético no verificado), no a texto factual.
- Madurez: 18 descargas y 0 likes, sin benchmarks publicados, sin verificación independiente. La única validación es la del propio autor contra el checkpoint de referencia.
- Fecha de creación posterior a la información de referencia habitual: el repositorio está fechado en noviembre de 2026, lo que conviene tener en cuenta al evaluar su vigencia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ibyteohdear/10Eros-Max-Transformer_hybrid_beta5
- Modelo base: https://huggingface.co/multimodalart/MiniMax-H3-Pruned
- Librería diffusers: https://github.com/huggingface/diffusers
- Documentación de `AutoModel` en diffusers: https://huggingface.co/docs/diffusers/main/en/api/models/auto_model
- Pipeline modular de MiniMax-H3 en diffusers: no disponible como enlace directo en la información proporcionada
- Paper de MiniMax-H3: no disponible en la información proporcionada
- Blog o demo oficial: no disponible en la información proporcionada
