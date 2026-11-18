# AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored-BF16

## Resumen

Qwen3.6-27B-AEON-Ultimate-Uncensored-BF16 es un fine-tune del modelo base Qwen/Qwen3.6-27B publicado por el usuario AEON-7. Se distribuye como un checkpoint en precisión completa BF16 (bfloat16) con 27.356.728.560 parámetros reales según los safetensors del repositorio, y un tamaño de repositorio de 55,6 GB. La modificación principal respecto al modelo original es una pasada de "abliteration" (eliminación de rechazos) que, según la model card, ortogonaliza los pesos que escriben en el residual stream del LM sin reentrenar, de modo que el modelo deja de rechazar peticiones que el base rechazaría.

El modelo hereda la arquitectura híbrida del Qwen3.6, que combina atención lineal con mecanismos tipo Mamba/Gated DeltaNet y atención completa, e incluye una cabeza MTP (multi-token prediction) restaurada del base para decodificación especulativa. Está orientado a despliegue en producción con vLLM, con soporte de tool calling, modo thinking, visión (image-text-to-text) y contexto largo de hasta 131.072 tokens según la receta de servicio publicada.

Es relevante ahora porque supone una de las pocas exportaciones BF16 de referencia de la familia Qwen3.6 en formato abliterado, pensada para hardware Hopper/Ampere y para flujos de fine-tuning, mientras el autor redirige a los usuarios nuevos hacia su línea Qwen3.8 con cuantización mixta NVFP4. Las 51.487 descargas y 149 likes en el momento de la consulta indican una adopción notable dentro de la comunidad de modelos sin censura.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención lineal (Gated DeltaNet / Mamba) y atención completa; multimodal image-text-to-text |
| Parametros totales | 27.356.728.560 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 131.072 tokens (según la receta de servicio con `--max-model-len 131072`) |
| Tipos de cuantizacion | BF16 en este repositorio; el autor publica variantes NVFP4/FP8 mixtas en la línea Qwen3.8 |
| Idiomas soportados | en, zh, multilingual |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (BF16), librería transformers |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.6-27B y conserva su arquitectura híbrida: capas de atención lineal con Gated DeltaNet (etiquetas `gated-deltanet`, `gdn`, `linear-attention`, `mamba`, `hybrid-attention`) combinadas con atención completa, lo que permite manejar contextos largos con menor coste de memoria en las capas lineales. El checkpoint incluye una cabeza MTP de 15 tensores (~0,85 GB) restaurada del modelo base, que habilita decodificación especulativa con `qwen3_5_mtp` en vLLM; según las mediciones del autor en DGX Spark, la longitud media aceptada es de 3,3 sobre 3 tokens, con una tasa de aceptación del borrador del 78 % y P0 en torno al 90 %.

El entrenamiento propio de este repositorio consiste en una pasada de abliteración (v8) que ortogonaliza los pesos del residual stream del LM para eliminar el comportamiento de rechazo. No se realizó reentrenamiento y la cabeza MTP es la del base sin modificar. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base. La model card menciona además un parche denominado `fernflower-ssm-repair`, sin detallar su contenido técnico.

## Capacidades

- Generación de texto conversacional e instructivo en inglés, chino y otros idiomas (etiqueta `multilingual`).
- Razonamiento con modo thinking explícito (`thinking`, `reasoning`) y parser de razonamiento `qwen3` en vLLM.
- Generación de código (`coding`) y soporte de function calling / tool calling con parser `qwen3_coder` y `--enable-auto-tool-choice`.
- Flujos agénticos y razonamiento multi-paso (etiquetas `agentic`, `function-calling`).
- Capacidades de visión: pipeline image-text-to-text y etiquetas `vision`, `vision-language`, `multimodal`.
- Contexto largo de hasta 131.072 tokens con chunked prefill y prefix caching.
- Comportamiento sin rechazos (abliterated, refusal-removed, uncensored) según el autor.
- Decodificación especulativa mediante cabeza MTP y soporte de DFlash con drafter externo.
- Compatibilidad con API OpenAI (`openai-api`, `openai-compatible`).

## Casos de uso

- Atención al cliente automatizada: el modelo puede mantener conversaciones multi-turno con contexto largo gracias a su ventana de 131.072 tokens, lo que permite adjuntar historiales completos o documentación de producto sin truncar.
- Generación de código en producción: con tool calling y parser `qwen3_coder` puede integrarse en pipelines de CI/CD para autocompletar, revisar parches o invocar herramientas de build y test.
- Agentes autónomos multi-paso: las etiquetas `agentic` y `function-calling`, junto con el modo thinking, lo hacen adecuado para orquestar tareas que requieren planificación y llamadas encadenadas a APIs.
- Análisis de documentos e imágenes: al ser image-text-to-text, puede extraer información de capturas, diagramas o documentos escaneados combinándolos con texto largo en una misma petición.
- Fine-tuning y research sobre comportamiento sin censura: al distribuirse en BF16 completo y con licencia Apache 2.0, sirve como punto de partida para estudiar alineación, abliteración o técnicas de control de rechazo.
- Despliegue en infraestructura Hopper/Ampere: la receta oficial con vLLM, chunked prefill y prefix caching está pensada para servir el modelo en A100/H100 con BF16, útil para entornos que no disponen de Blackwell.
- Evaluación comparativa de cuantizaciones: al existir variantes NVFP4 del mismo linaje, el checkpoint BF16 actúa como referencia de calidad para medir la degradación introducida por cuantización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta métricas de decodificación especulativa medidas en DGX Spark: longitud media aceptada de 3,3 sobre 3 tokens, P0 de aceptación en torno al 90 % y aceptación media del borrador del 78 %. No se aportan cifras de MMLU, HumanEval, GSM8K ni de evaluaciones comparativas con otros modelos.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 55 GB solo para pesos (27,36 mil millones de parámetros a 2 bytes), más overhead de KV cache y activaciones; se recomienda al menos 80 GB por GPU para el contexto completo.
- GPU recomendadas: A100 80 GB y H100 (sm_80 y sm_90 según las etiquetas), además de Blackwell/GB10 y DGX Spark con recetas específicas.
- En consumer GPU: no cabe en tarjetas de 24 GB en BF16; requiere cuantización (las variantes NVFP4 del autor) para GPUs de menor memoria.
- Opciones de despliegue: vLLM (recomendado, con `--dtype bfloat16`, chunked prefill, prefix caching y parser `qwen3_coder`), contenedor `ghcr.io/aeon-7/aeon-vllm-ultimate:latest` para Spark/GB10 y `ghcr.io/aeon-7/aeon-vllm-ultimate-rtx:latest` para RTX; compatible con transformers.
- En DGX Spark se recomienda `--gpu-memory-utilization` entre 0,6 y 0,7; por encima de 0,8 la memoria unificada compartida entre CPU y GPU provoca page thrashing.
- Latencia y throughput: no disponible en la información proporcionada; el autor remite a su repositorio de GitHub para benchmarks medidos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored-BF16 | 27,36 B | 131.072 tokens | Apache 2.0 | Hugging Face, BF16 safetensors |
| Qwen/Qwen3.6-27B (base) | 27 B (según nombre) | no disponible | no disponible en la información | Hugging Face |
| AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-NVFP4-MIXED | 27 B (según nombre) | no disponible | no disponible en la información | Hugging Face, cuantización NVFP4 mixta |

No se dispone de datos de benchmarks que permitan comparar el rendimiento entre estas variantes. La comparativa se limita a parámetros, formato y disponibilidad.

## Limitaciones y advertencias

- La abliteración elimina los rechazos del modelo base, lo que implica un mayor riesgo de generar contenido dañino, sesgado o inapropiado sin filtro; requiere moderación externa en producción.
- Riesgo de alucinación inherente a los modelos de 27 B, no cuantificado en la información disponible.
- El autor marca este repositorio como superseded por su línea Qwen3.8; la model card recomienda migrar para trabajo nuevo, por lo que el soporte y las actualizaciones pueden cesar.
- No se documentan en la información disponible los sesgos específicos ni la composición del dataset de entrenamiento del modelo base.
- El soporte multilingüe se declara para en, zh y multilingual, sin garantías explícitas para castellano.
- La licencia Apache 2.0 permite uso comercial, pero el comportamiento sin censura puede incumplir políticas de plataformas o normativa sectorial; la responsabilidad recae en el desplegador.
- El despliegue en DGX Spark exige ajustar `--gpu-memory-utilization` por debajo de 0,8 para evitar bloqueos por thrashing de memoria unificada.
- El uso de `--trust-remote-code` en la receta oficial implica ejecutar código del repositorio, con el riesgo de seguridad asociado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored-BF16
- Repositorio de despliegue y benchmarks: https://github.com/AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored-DFlash
- Contenedor vLLM Ultimate (Spark/GB10): https://github.com/AEON-7/vllm-ultimate-dgx-spark
- Variante sucesora Qwen3.8 NVFP4 mixta: https://huggingface.co/AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-NVFP4-MIXED
- Recetas para Qwen3.8: https://github.com/AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B
- Drafter DFlash: https://huggingface.co/z-lab/Qwen3.6-27B-DFlash
- Discusión sobre MTP tras abliteración: https://huggingface.co/AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored-BF16/discussions/6
- Referencias arXiv citadas en las etiquetas: arxiv:2503.00555, arxiv:2512.13655, arxiv:2406.11717
