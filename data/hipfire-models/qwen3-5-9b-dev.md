# hipfire-models/qwen3.5-9b-dev

## Resumen

`hipfire-models/qwen3.5-9b-dev` es un repositorio de cuantizaciones experimentales del modelo Qwen3.5-9B, publicadas por el proyecto hipfire para investigación en kernels de cómputo sobre GPUs AMD. No se trata de un modelo entrenado desde cero ni de una release de producción: son pesos Qwen3.5-9B sometidos a un post-entrenamiento de cuantización mediante codebooks Lloyd-Max (formato MQ3-Lloyd y MQ4-Lloyd), distribuidas para reproducir el trabajo de optimización de kernels WMMA de prefill y decode del motor hipfire.

El interés técnico reside en el esquema de cuantización: en lugar de la reconstrucción afín clásica (`scale * q + zero_point`) de HFQ3/HFQ4, cada grupo de 256 elementos almacena un codebook fp16 de 8 o 16 entradas y los índices empaquetados, de modo que la reconstrucción es una búsqueda en tabla. Esto reduce el tamaño por grupo a 112 B (MQ3) o 160 B (MQ4), frente a los 104 B y 136 B de HFQ3/HFQ4 respectivamente, y exige rutas de dispatch específicas en el motor.

Es relevante ahora porque documenta un caso poco habitual de cuantización investigada a nivel de kernel (drift de perplejidad medido, cobertura de arquitecturas GPU explícita y gates de seguridad), pero también porque advierte de que el formato es incompatible con el dispatch de stride estándar y que su uso indebido provoca corrupción silenciosa de resultados. Para inferencia convencional, el propio autor remite a las variantes canónicas no-Lloyd.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (pesos derivados de Qwen3.5-9B; la model card no describe la arquitectura del modelo base) |
| Parametros totales | 9B (según el nombre del modelo y el modelo base Qwen3.5-9B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el ejemplo de uso del daemon configura `max_seq` a 4096, pero no se declara como contexto máximo del modelo) |
| Tipos de cuantizacion | MQ3-Lloyd-G256 (112 B/grupo, codebook de 8 entradas, índices de 3 bits, rotación FWHT) y MQ4-Lloyd-G256 (160 B/grupo, codebook de 16 entradas, índices de 4 bits, rotación FWHT) |
| Idiomas soportados | en |
| Licencia | Apache 2.0 (hereda los términos upstream de Qwen3.5) |
| Formato de pesos | `.mq3-lloyd` (4,3 GB) y `.mq4-lloyd` (5,6 GB); repo de 27,5 GB en total; no son safetensors ni GGUF |

## Arquitectura y entrenamiento

La model card no documenta la arquitectura del modelo base Qwen3.5-9B (transformer, MoE o híbrida); solo se indica el tamaño de 9B parámetros. Lo que sí se detalla es el proceso de cuantización: un ajuste post-entrenamiento de codebooks Lloyd-Max sobre los pesos upstream de Qwen3.5-9B previamente rotados con FWHT (Fast Walsh-Hadamard Transform), ejecutado con la herramienta `hipfire-quantize` y los flags `--allow-mq3-lloyd` y `--allow-mq4-lloyd`.

Cada grupo de 256 elementos contiene un codebook fp16 de N entradas más los índices empaquetados: en MQ3, 16 B de cabecera del codebook y 96 B de índices de 3 bits empaquetados entre bytes (112 B por grupo); en MQ4, 32 B de cabecera y 128 B de índices de 4 bits en pares de nibbles (160 B por grupo). La reconstrucción es una consulta `cb[index]`, no una operación afín, y el codebook se organiza por grupo en LDS (memoria local del shader). El trabajo de kernels asociado se publica en los PR #195 (prefill WMMA para MQ3-Lloyd, issue #116 Phase 5) y #197 (prefill WMMA para MQ4-Lloyd, issue #182 Phase 5b) del repositorio hipfire.

No se mencionan datos de entrenamiento del modelo base, ni fases de RLHF/DPO, ni innovaciones como decodificación especulativa en esta ficha (aunque el ecosistema hipfire menciona variantes DFlash-draft en el repositorio canónico, no en este).

## Capacidades

- Generación de texto e inferencia general: al ser pesos cuantizados de Qwen3.5-9B, conserva las capacidades del modelo base, si bien la model card no las enumera.
- Idiomas: únicamente inglés declarado (`language: en`).
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.
- Ejecución en GPUs AMD RDNA3 y RDNA3.5 (gfx1100, gfx1101, gfx1102, gfx1151) mediante el motor hipfire; RDNA4 (gfx1200/1201) solo con el gate `HIPFIRE_LLOYD_GFX12=1`.

## Casos de uso

- Investigación de kernels de cuantización: el caso de uso declarado es reproducir el trabajo de rendimiento de kernels WMMA de prefill y decode del motor hipfire sobre GPUs AMD gfx11xx. Se usaría cargando el fichero `.mq3-lloyd` o `.mq4-lloyd` con el daemon de hipfire y ejecutando las benchmarks de prefill/decode.
- Validación de esquemas de cuantización por codebook: comparar la calidad (perplejidad) de MQ3-Lloyd frente a HFQ3 sobre el mismo modelo base, usando la ruta slow-baseline como referencia y midiendo el drift documentado de ~0,9 % PPL en decode.
- Desarrollo de rutas de dispatch especializadas: serviría para probar los brazos de dispatch batched-prefill emparejados con el formato Lloyd y verificar que el flag `--allow-mq{3,4}-lloyd` enruta correctamente y evita la corrupción silenciosa por mezcla de strides.
- Estudio de optimización de memoria en GPUs de consumo AMD: con 4,3 GB (MQ3) y 5,6 GB (MQ4) para un modelo de 9B, permite experimentar con despliegues de bajo footprint en tarjetas RDNA3/3.5 dentro de un entorno de investigación controlado.
- Reproducibilidad de resultados de investigación: el repo incluye provenance explícita (PRs, documentos de plan en `docs/plans/`) para replicar las mediciones de drift y las benchmarks de prefill en gfx1100/gfx1151.
- Evaluación de límites de calidad en cuantización extrema: útil para cuantificar cuánto degrada un esquema de 3 bits con codebook frente a alternativas de 4 bits en tareas de generación de texto en inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo documenta una métrica de calidad: un drift de ~0,9 % de perplejidad en la ruta de decode MQ3-Lloyd respecto al slow-baseline, universal en gfx1100/1101/1102/1151, atribuido a una reordenación multi-acumulador que se compone a lo largo del bucle de inferencia. Los kernels de prefill (PR #195) son de un solo acumulador y no presentan drift. Para MQ4-Lloyd no hay cifras de calidad publicadas y la benchmark de ship-gate Phase C en gfx1100 está pendiente; los números actuales son solo de gfx1151.

## Requisitos de hardware

- VRAM estimada: ~4,3 GB para MQ3-Lloyd y ~5,6 GB para MQ4-Lloyd (tamaño de los ficheros de pesos); hay que añadir la memoria de activaciones, KV cache y buffers del motor, no cuantificada en la información disponible.
- GPUs soportadas: AMD RDNA3 y RDNA3.5, es decir gfx1100, gfx1101, gfx1102 y gfx1151. RDNA4 (gfx1200/1201) solo con `HIPFIRE_LLOYD_GFX12=1` y validación CI externa pendiente; por defecto cae al fallback por token. gfx10, gfx906 y gfx94x no están soportados.
- GPUs NVIDIA (A100, H100, RTX 4090): no soportadas; el motor hipfire y estos kernels son específicos de AMD.
- Cabe en GPU de consumo: sí, en tarjetas AMD RDNA3/RDNA3.5 con al menos ~6-8 GB de VRAM efectiva para MQ3 y algo más para MQ4 (estimación a partir del tamaño de pesos; no confirmada en la documentación).
- Opciones de despliegue: exclusivamente el daemon de hipfire (binario Rust, `./target/release/examples/daemon`) con carga vía mensaje JSON `{"type":"load", ...}`. No hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; las benchmarks de rendimiento de kernels están referenciadas en los PRs #195 y #197 pero no se incluyen cifras en la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato de cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hipfire-models/qwen3.5-9b-dev (este repo) | 9B | no disponible | MQ3-Lloyd (112 B/grupo), MQ4-Lloyd (160 B/grupo) | Apache 2.0 | Hugging Face, gated (auto), solo GPUs AMD gfx11xx |
| schuttdev/hipfire-qwen3.5-9b | 9B | no disponible | MQ3, MQ4, MQ6, MQ8, HFQ4, HFQ6, DFlash-draft (canónicos, no-Lloyd) | Apache 2.0 (heredada) | Hugging Face; recomendado por el autor para inferencia típica |
| Qwen3.5-9B (upstream) | 9B | no disponible | safetensors fp16/bf16 (presumiblemente) | Apache 2.0 | Hugging Face (modelo base) |

No se dispone de datos de benchmarks comparativos entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- No es una release de producción: el autor la describe explícitamente como research preview con envelope de calidad y cobertura de arquitecturas distintas de las cuantizaciones canónicas.
- Drift de calidad documentado: ~0,9 % de perplejidad en decode con MQ3-Lloyd respecto al slow-baseline, causado por una reordenación multi-acumulador que se compone a lo largo del bucle de inferencia. MQ4-Lloyd está en una fase aún más temprana y sin cifras de calidad publicadas.
- Riesgo de corrupción silenciosa: los formatos son incompatibles con el stride de HFQ4; mezclar formatos en un mismo dispatch produce corrupción de resultados sin error. Es obligatorio usar el daemon de hipfire con el flag `--allow-mq{3,4}-lloyd` correspondiente.
- Cobertura de hardware muy restringida: solo AMD gfx1100/1101/1102/1151; RDNA4 tras gate opt-in y sin validación CI externa; gfx10, gfx906 y gfx94x no soportados. Sin soporte para NVIDIA.
- Idiomas: solo inglés declarado; no se garantiza calidad multilingüe.
- Sesgos y alucinaciones: no hay información específica en la model card; al derivar de Qwen3.5-9B, hereda los sesgos del modelo base, no documentados aquí.
- Restricciones de licencia: Apache 2.0 heredada del upstream Qwen3.5, lo que permite uso comercial de los pesos, pero los metadatos y codebooks de cuantización derivan de los pesos upstream; conviene revisar los términos del modelo base.
- Acceso gated: requiere aceptar el disclaimer de investigación (checkbox) antes de descargar.
- Repositorio de 27,5 GB: incluye ambos ficheros de cuantización; conviene descargar solo el variante necesaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/hipfire-models/qwen3.5-9b-dev
- Cuantizaciones canónicas (no-Lloyd) recomendadas: https://huggingface.co/schuttdev/hipfire-qwen3.5-9b
- PR #195, kernels WMMA de prefill para MQ3-Lloyd: https://github.com/Kaden-Schutt/hipfire/pull/195
- PR #197, kernels WMMA de prefill para MQ4-Lloyd: https://github.com/Kaden-Schutt/hipfire/pull/197
- Repositorio del motor hipfire: https://github.com/Kaden-Schutt/hipfire
- Documentación de formato: `docs/plans/mq3-lloyd-wmma-prefill.md` y `docs/plans/mq4-lloyd-wmma-prefill.md` en el repositorio hipfire (rutas relativas, sin URL directa disponible)
