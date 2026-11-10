# openeurollm/nucleus-experiments

## Resumen

OpenEuroLLM nucleus experiments es un repositorio de checkpoints intermedios de investigación publicados por el proyecto OpenEuroLLM, fruto de sus experimentos de preentrenamiento con arquitecturas híbridas (denominadas "nucleus") ejecutados en el supercomputador MareNostrum 5. No se trata de un modelo final ni de una release estable: cada checkpoint vive en su propia rama del repositorio y las arquitecturas, los schedules de entrenamiento y los formatos de exportación cambian entre ejecuciones. El repositorio ocupa 25,7 GB y se distribuye con la librería `transformers`, requiriendo `trust_remote_code=True` porque cada rama incluye su propio código de modelado.

El contenido abarca varias familias de arquitecturas. La principal, `oellm_ambitious`, combina atención, Kimi delta attention y bloques MoE con 360 expertos (5 activos), tablas de n-gramas "engram" y residual mHC, con hasta 163,6B parámetros totales y 3,4B activos por token. La familia `oellm_q35` es un híbrido de atención completa y lineal al estilo Qwen3.5 con MoE de 256 expertos (8 activos), de unos 35B totales y 3,5B activos. También hay modelos pequeños de ablación de atención dispersa (`t5_s3_*`) de unos 12,9B.

Su relevancia es fundamentalmente investigadora: permite inspeccionar decisiones de arquitectura (atención lineal, MoE con expertos en FP8, tablas de n-gramas) en checkpoints reales entrenados a gran escala. No está pensado para uso en producción ni para consumo general, y el autor lo declara explícitamente como material de investigación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida: `oellm_ambitious` (atención + Kimi delta attention + MoE + engram n-gram tables + mHC residual); `oellm_q35` (atención completa y lineal híbrida estilo Qwen3.5 + MoE) |
| Parámetros totales | 163,6B (`ambitious_v4_2ph_hd256_fp8`); 163,5B (`ambitious_v4_2ph_fp8`); ~35B (`q35c_gqa`); ~12,9B (`t5_s3_*`) |
| Parámetros activos | 3,4B (`ambitious_v4_2ph_hd256_fp8`); 3,3B (`ambitious_v4_2ph_fp8`); ~3,5B (`q35c_gqa`); ~1,2B (`t5_s3_*`) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | FP8 (E4M3, escala fp32 por tile de 1x128) en expertos enrutados de las runs `*_fp8`; bf16 en el resto de pesos y en las runs `q35*` |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors vía `transformers` (pesos FP8 + tensores de escala fp32 para expertos enrutados; bf16 para el resto) |

## Arquitectura y entrenamiento

La familia `oellm_ambitious` combina capas de atención con Kimi delta attention (atención lineal) y bloques MoE de 360 expertos con 5 activos por token, complementados con tablas de n-gramas "engram" y residual mHC. Aproximadamente la mitad de los parámetros de esta familia son tablas de n-gramas (unos 80 GB en bf16), que se consultan por lookup y no se multiplican, por lo que añaden poco cómputo por token. La variante `ambitious_v4_2ph_hd256_fp8` continúa el entrenamiento desde el paso 9815 con dimensión de cabeza de atención 256. La familia `oellm_q35` es un híbrido de atención completa y lineal con MoE de 256 expertos y 8 activos, en bf16 de principio a fin.

En las runs `*_fp8`, el entrenamiento recolecta los pesos de los expertos enrutados en FP8 (E4M3 con una escala fp32 por tile de 1x128) en cada forward pass, mientras los pesos maestros permanecen en bf16; las exportaciones aplican la misma cuantización, de modo que los expertos enrutados se almacenan como bytes FP8 más tensores de escala fp32. Los datos de entrenamiento (número total de tokens, composición del dataset) y el uso de RLHF/DPO no están disponibles en la información proporcionada. El tokens por paso es de 67,1M en las runs `ambitious`, 16,8M en `q35` y 1,05M en `t5_s3_*`, y los tokens entrenados se calculan como paso multiplicado por tokens por paso. Las runs `ambitious_v4_2ph*` y `q35c_gqa` entrenan con `<bos>` al inicio de cada documento y sus tokenizers lo añaden.

## Capacidades

- Generación de texto autorregresiva mediante `AutoModelForCausalLM` de `transformers`.
- Razonamiento y modelado de lenguaje general, sujeto al estado intermedio de entrenamiento de cada checkpoint.
- Soporte de arquitecturas de atención lineal (requiere `flash-linear-attention`).
- Capacidades multilingües: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponible.
- Validación de exportación: algunas ramas incluyen `export_validation/` con la pérdida del modelo exportado sobre 64 documentos reservados (`score.json`) y sobre un subconjunto con la pérdida del framework de entrenamiento conocida (`paired.json`).

## Casos de uso

- Investigación en arquitecturas híbridas de atención: comparar el comportamiento de Kimi delta attention frente a atención completa en checkpoints intermedios de la familia `oellm_ambitious`, usando las ramas `ambitious_v4_2ph_fp8` y `ambitious_v4_2ph_hd256_fp8`.
- Estudio de MoE a gran escala: analizar el enrutamiento de 360 expertos con 5 activos y el efecto de almacenar expertos enrutados en FP8 con escalas fp32 por tile de 1x128.
- Ablaciones de atención dispersa: emplear los modelos `t5_s3_*` (unos 12,9B totales, 1,2B activos, 1.500 pasos) para experimentos controlados de atención dispersa sin el coste de las runs grandes.
- Validación de pipelines de exportación: usar los ficheros `export_validation/score.json` y `paired.json` para verificar que una exportación reproduce la pérdida del framework de entrenamiento.
- Reproducción de preentrenamiento en infraestructura europea: estudiar el schedule y los tokens por paso (67,1M en `ambitious`, 16,8M en `q35`) como referencia para planificar entrenamientos en MareNostrum 5.
- Investigación sobre tablas de n-gramas: analizar el impacto de las engram tables (aproximadamente la mitad de los parámetros de `oellm_ambitious`, unos 80 GB en bf16) en la pérdida y en el coste computacional por token.
- Estudio de tokenizers y del token `<bos>`: comparar el efecto de añadir `<bos>` al inicio de documento en las runs `ambitious_v4_2ph*` y `q35c_gqa`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio incluye únicamente métricas de pérdida de validación de exportación (`score.json`, `paired.json`) en algunas ramas, no comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: el repositorio completo ocupa 25,7 GB, pero cada rama individual debe cargarse por separado; el tamaño de una rama concreta no está disponible en la información proporcionada.
- Los modelos de 163,6B parámetros totales con 3,4B activos no caben en GPUs de consumo en bf16/FP8 completos; requieren agregación de memoria multi-GPU o almacenamiento en CPU/offload.
- Los modelos `t5_s3_*` (~12,9B totales, 1,2B activos) son los candidatos más viables para hardware limitado, aunque su tamaño exacto en disco no está disponible.
- GPU recomendadas: no disponible en la información proporcionada; el entrenamiento se realizó en MareNostrum 5.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` y `dtype="auto"`; las capas de atención lineal requieren `flash-linear-attention`. Soporte en vLLM, llama.cpp, Ollama o TGI: no disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros totales / activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `ambitious_v4_2ph_hd256_fp8` (OpenEuroLLM) | 163,6B / 3,4B | no disponible | no disponible | checkpoints de investigación en HF |
| `q35c_gqa` (OpenEuroLLM) | ~35B / ~3,5B | no disponible | no disponible | checkpoints de investigación en HF |
| `t5_s3_*` (OpenEuroLLM) | ~12,9B / ~1,2B | no disponible | no disponible | checkpoints de investigación en HF |

No se dispone de información sobre modelos externos comparables (mismo tamaño o misma tarea) en la documentación proporcionada, por lo que la comparación con alternativas de otros proyectos queda como no disponible.

## Limitaciones y advertencias

- No es una release: son checkpoints intermedios de investigación; las arquitecturas, schedules y formatos de exportación cambian entre runs.
- Cada checkpoint vive en su propia rama (`<run>_iter_<7-digit step>[_<variant>]`); `main` solo contiene la model card.
- Las variantes `_probe` y `_hfNNN` son exportaciones adicionales del mismo checkpoint de entrenamiento con distinta versión del código de exportación, no modelos distintos.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código de modelado incluido en el repositorio.
- Las capas de atención lineal dependen de `flash-linear-attention`, una dependencia externa adicional.
- Licencia no disponible: no puede confirmarse el uso comercial.
- Idiomas soportados no disponibles.
- Sesgos conocidos, riesgo de alucinación y limitaciones de contexto: no disponible.
- El estado de entrenamiento intermedio implica que la calidad del modelo no está garantizada ni validada con benchmarks públicos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/openeurollm/nucleus-experiments
- flash-linear-attention (dependencia para capas de atención lineal): https://github.com/fla-org/flash-linear-attention
