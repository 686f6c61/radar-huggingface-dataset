# Grawnch/TokenWing-Model-Assets

## Resumen

TokenWing-Model-Assets es un repositorio de artefactos auxiliares publicado por el usuario Grawnch en Hugging Face, no un modelo de lenguaje en sentido estricto. Contiene ficheros complementarios (extensiones `.correction`, `.vram-experts.json`, `.experts.layer-order.json` y `.usage-seed.json`) precalculados para varios checkpoints cuantizados de arquitectura MoE que se distribuyen bajo la familia TokenWing: `Ling-3.0-Flash-TokenWing`, `Flint-40B-TokenWing` y tres variantes de `Qwen3.8-Flash-Next-WV-v5-TokenWing` (3.5 bpw, Sub2.5 bpw y 2.26 bpw). Estos ficheros permiten que el motor de inferencia TokenWing cargue y ejecute los pesos cuantizados con correcciones y planificación de expertos ya resueltas.

El dato de parámetros reportado en safetensors para este repositorio es de 3.878.549.248 parámetros, aunque el tamaño total del repo es de 3,6 GB, lo que sugiere que la cifra corresponde a un subconjunto de tensores auxiliares y no al modelo completo. El repositorio incluye además un sidecar GGUF de decodificación especulativa (`Qwen3.8-Flash-Next-WV-v5-MTP-Draft.gguf`, 2,56 GB) que actúa como draft para el mecanismo MTP del modelo base.

La relevancia de este repositorio es operativa: facilita el despliegue de checkpoints MoE cuantizados en el runtime TokenWing mediante plugins de cuantización versionados (`wv-plugin-v1.3`, ABI v2, y `wv-plugin-v1.1`, ABI v1). No se trata de un modelo entrenado por el autor, sino de material de soporte para ejecutar modelos de terceros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (según tags del repo); arquitectura concreta del modelo base no disponible |
| Parametros totales | 3.878.549.248 (dato safetensors del repo; no representa necesariamente el modelo base completo) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4, Q4_K_XL (UD), 3.5 bpw, Sub2.5 bpw, 2.26 bpw; plugin ABI v1 y v2 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (sidecar MTP) y artefactos JSON/binarios propietarios del runtime TokenWing (`.correction`, `.vram-experts.json`, `.experts.layer-order.json`, `.usage-seed.json`) |

## Arquitectura y entrenamiento

El repositorio no documenta el entrenamiento de ningún modelo: agrega artefactos derivados de checkpoints MoE de terceros. Los ficheros `.vram-experts.json` contienen la planificación de asignación de expertos a VRAM, los `.experts.layer-order.json` definen el orden de capas de expertos y los `.usage-seed.json` almacenan semillas de uso para el planificador del runtime. Los `.correction` son tensores de corrección asociados a cada cuantización concreta (MXFP4 para Ling 3.0 Flash, Q4_K_XL para Flint 40B y los tres niveles bpw para Qwen3.8-Flash-Next WV-v5).

La innovación técnica destacable es la integración de un plugin de cuantización versionado (`--quant-plugin`) con ABI v2 y un rango de Type IDs `EXT0..EXT5` (112..117) para las variantes 3.5 bpw y Sub2.5 bpw, y ABI v1 con Type IDs 43..48 para la variante 2.26 bpw. El sidecar MTP Draft GGUF (`blk.48`) está pensado para decodificación especulativa multi-token. No se dispone de información sobre dataset, número de tokens de entrenamiento ni fases de alineación (RLHF/DPO) de los modelos base.

## Capacidades

- Ejecución de checkpoints MoE cuantizados de terceros bajo el runtime TokenWing con planificación de expertos precalculada.
- Carga de cuantizaciones de muy baja precisión (2.26 bpw, Sub2.5 bpw) mediante plugin ABI v1/v2.
- Decodificación especulativa multi-token (MTP) usando el sidecar `Qwen3.8-Flash-Next-WV-v5-MTP-Draft.gguf`.
- Compatibilidad declarada con endpoints (`endpoints_compatible` en los tags del repo).
- Perfil conversacional (tag `conversational`).
- Capacidades específicas del modelo base (razonamiento, código, matemáticas, tool calling, multilingüismo): no disponibles en la información proporcionada, ya que dependen de cada checkpoint subyacente (Ling, Flint, Qwen).

## Casos de uso

- Despliegue de Qwen3.8-Flash-Next WV-v5 en 2.26 bpw sobre hardware con VRAM limitada: el plugin ABI v1 y los ficheros `.vram-experts.json` permiten cargar el MoE con planificación de expertos ya resuelta, reduciendo el trabajo de arranque.
- Inferencia de baja latencia con decodificación especulativa: el sidecar MTP Draft de 2,56 GB se usa como draft para acelerar la generación del modelo principal en el runtime TokenWing.
- Servicio conversacional en producción: el tag `conversational` y la compatibilidad con endpoints sugieren integración en APIs tipo OpenAI, aunque la validación concreta debe hacerse contra el checkpoint base.
- Reproducibilidad de despliegues: los checksums SHA-256 publicados para cada artefacto permiten verificar la integridad de los ficheros en pipelines de CI/CD antes de cargar el modelo.
- Investigación en cuantización extrema de MoE: las variantes Sub2.5 bpw y 2.26 bpw sirven para estudiar el impacto de la compresión agresiva en calidad frente a 3.5 bpw.
- Evaluación comparativa de familias MoE: al cubrir Ling 3.0 Flash, Flint 40B y Qwen3.8-Flash-Next WV-v5 con el mismo formato de artefactos, facilita pruebas cruzadas en un mismo runtime.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Como referencia, el repo ocupa 3,6 GB y el sidecar MTP 2,56 GB, pero los pesos completos de los modelos base no se incluyen aquí.
- GPU recomendadas: no disponibles. La planificación `.vram-experts.json` sugiere optimización para GPUs con VRAM limitada al repartir expertos, pero no se especifican modelos concretos.
- Compatibilidad con GPU de consumo: no confirmada; las cuantizaciones de 2.26 bpw y Sub2.5 bpw apuntan a escenarios de VRAM reducida, pero sin cifras oficiales.
- Opciones de despliegue: runtime TokenWing (rama `runmyai/tokenwing` `dev`, commit `>= 6a3e018f`) con `--quant-plugin`; el sidecar es GGUF y podría usarse con herramientas compatibles, pero no se documenta soporte en vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. Este repositorio no es un modelo comparable con alternativas de la misma categoría, sino un conjunto de artefactos auxiliares para ejecutar checkpoints MoE de terceros (Ling 3.0 Flash, Flint 40B, Qwen3.8-Flash-Next WV-v5). No se dispone de datos de rendimiento ni de parámetros de los modelos base para establecer una comparación rigurosa.

## Limitaciones y advertencias

- No es un modelo autónomo: sin los checkpoints base referenciados (`runmyai/Ling-3.0-Flash-TokenWing`, `runmyai/Flint-40B-TokenWing`, `Grawnch/Qwen3.8-Flash-Next-WV-v5-*`), estos artefactos no son utilizables.
- Licencia no especificada: no se puede confirmar el uso comercial ni la redistribución; debe verificarse en cada checkpoint base.
- Idiomas no declarados: el soporte multilingüe depende del modelo subyacente y no está documentado aquí.
- Dependencia de versión del runtime: los plugins ABI v1 y v2 exigen versiones concretas de TokenWing; una actualización incompatible puede romper la carga.
- Riesgo de alucinación y sesgos: no evaluables sin benchmarks ni model card del modelo base.
- Fecha de creación futura (2026-11-10) en los metadatos de Hugging Face: conviene verificar la vigencia y el estado del proyecto antes de usarlo en producción.
- El recuento de parámetros de safetensors (3.878.549.248) no debe interpretarse como el tamaño del modelo base.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Grawnch/TokenWing-Model-Assets
- Checkpoint Ling 3.0 Flash TokenWing: https://huggingface.co/runmyai/Ling-3.0-Flash-TokenWing
- Checkpoint Flint 40B TokenWing: https://huggingface.co/runmyai/Flint-40B-TokenWing
- Checkpoint Qwen3.8-Flash-Next WV-v5 3.5 bpw: https://huggingface.co/Grawnch/Qwen3.8-Flash-Next-WV-v5-3.5bpw-TokenWing
- Checkpoint Qwen3.8-Flash-Next WV-v5 Sub2.5 bpw: https://huggingface.co/Grawnch/Qwen3.8-Flash-Next-WV-v5-Sub2.5bpw-TokenWing
- Checkpoint Qwen3.8-Flash-Next WV-v5 2.26 bpw: https://huggingface.co/Grawnch/Qwen3.8-Flash-Next-WV-v5-2.26bpw-TokenWing
- Release plugin wv-plugin-v1.3: https://github.com/grawnchtoader/tokenwing-assets/releases/tag/wv-plugin-v1.3
- Release plugin wv-plugin-v1.1: https://github.com/grawnchtoader/tokenwing-assets/releases/tag/wv-plugin-v1.1
- Runtime TokenWing (rama dev): https://github.com/runmyai/tokenwing
