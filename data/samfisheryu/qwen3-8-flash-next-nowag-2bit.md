# Samfisheryu/Qwen3.8-flash-next-nowag-2bit

## Resumen

Qwen3.8-flash-next-nowag-2bit es un checkpoint de servicio de texto publicado por el usuario Samfisheryu sobre el modelo base RadixArk/Qwen3.8-Flash-Next-NVFP4, que a su vez deriva del modelo original Qwen/Qwen3.8-Flash-Next. Se trata de una cuantización extrema a aproximadamente 2 bits por peso de los expertos enrutados (NoWAG) de una arquitectura Mixture-of-Experts de 59.204.026.259 parámetros totales, empaquetada como un checkpoint completo y autónomo de unos 91,6 GiB para el motor de inferencia BigRabbit.

El modelo resuelve el problema de servir un MoE de gran tamaño con un coste de memoria drásticamente reducido: los 48 expertos por capa (512 expertos por capa) se almacenan con una asignación empaquetada de 12 bits y un codebook compartido en BF16, mientras que el resto de pesos no experto, las tablas PLE y todos los tensores MTP se mantienen sin cambios respecto al base NVFP4. La parte de expertos NoWAG ocupa unos 29 GiB, pero las tablas PLE por sí solas suman aproximadamente 47,7 GiB, lo que condiciona los requisitos de RAM del host.

Es relevante ahora porque demuestra una vía práctica de despliegue de un MoE de casi 60.000 millones de parámetros en configuraciones de dos GPU mediante tensor parallelism, con decodificación especulativa nativa (MTP) y la posibilidad de mantener las tablas PLE en disco. No obstante, el checkpoint no es cargable directamente con Transformers AutoModel y depende de un motor específico (BigRabbit) y de una revisión concreta de su soporte de modelos completos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (48 capas MoE, 512 expertos por capa) con MTP y tablas PLE |
| Parametros totales | 59.204.026.259 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Expertos NoWAG a ~2 bits por peso (asignaciones empaquetadas de 12 bits, D=6, codebook compartido BF16, normalizadores BF16 entrenados); pesos no experto, PLE y MTP en el formato del base NVFP4 |
| Idiomas soportados | en, zh |
| Licencia | qwen-community-1.0 (Qwen Community License 1.0) |
| Formato de pesos | safetensors (checkpoint completo con índice; no cargable por Transformers AutoModel) |

## Arquitectura y entrenamiento

La arquitectura es un transformer Mixture-of-Experts con 48 capas MoE y 512 expertos por capa. Los expertos enrutados han sido sustituidos por el export NoWAG "Paper2", que codifica cada peso de experto con una asignación empaquetada de 12 bits y dimensión D=6 sobre un codebook compartido en BF16, con normalizadores BF16 entrenados, resultando en aproximadamente 2 bits por peso de experto excluyendo los normalizadores. El resto del modelo (pesos no experto, tablas PLE y todos los tensores MTP) se conserva sin cambios respecto a RadixArk/Qwen3.8-Flash-Next-NVFP4 en la revisión 7b719225; los expertos FP4 originales del modelo principal se omiten.

El empaquetado no reentrena ni recuantiza los expertos: los tensores son idénticos a la revisión original Paper2 del repositorio, y solo se ha reorganizado el layout (directorio `nowag/`) y eliminado rutas históricas de la máquina de entrenamiento del manifiesto de expertos. No se documenta en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo original. La innovación técnica destacable es la cuantización NoWAG de expertos con codebook compartido, junto con el soporte de decodificación especulativa nativa mediante MTP en el motor BigRabbit.

## Capacidades

- Generación de texto conversacional y de propósito general en inglés y chino.
- Razonamiento y respuesta multi-turno, según el pipeline declarado de text-generation y conversational.
- Soporte de decodificación especulativa mediante MTP (`--speculative-method mtp`), que acelera la generación.
- Despliegue con tensor parallelism en múltiples GPU (`--tp-size`, `--gpu`).
- Gestión de tablas PLE en disco mediante `--host-table-backend disk` para reducir la presión de RAM.
- Capacidades de tool calling, function calling, agentes, matemáticas, código o visión: no disponibles en la información proporcionada.

## Casos de uso

- Servicio de chat multi-turno en inglés y chino: el modelo puede mantener conversaciones conversacionales en producción sobre el motor BigRabbit, con decodificación especulativa MTP activada para reducir la latencia por token en cargas interactivas.
- Despliegue en dos GPU con tensor parallelism: usando `br serve --model ... --tp-size 2 --gpu 0,1`, se puede repartir un MoE de 59.200 millones de parámetros entre dos aceleradores, lo que resulta adecuado para entornos con presupuesto de VRAM limitado.
- Evaluación de cuantización extrema en investigación: el checkpoint permite medir empíricamente la degradación de calidad de expertos a ~2 bits frente al base NVFP4, comparando salidas sobre el mismo conjunto de prompts.
- Servicio con almacenamiento en disco de tablas PLE: en hosts con RAM insuficiente para los ~47,7 GiB de tablas PLE, `--host-table-backend disk` permite arrancar el servidor manteniendo las tablas en disco, adecuado para entornos de pruebas o baja concurrencia.
- Generación de texto por lotes en pipelines internos: al ser un checkpoint completo y autónomo (sin descarga separada del modelo base ni argumento de ruta de expertos), simplifica la integración en pipelines de procesamiento de texto en inglés y chino.
- Reproducción de resultados del export Paper2: al conservar los tensores de expertos idénticos a la revisión original, sirve para validar que el reempaquetado no altera las salidas del modelo, útil en auditorías de artefactos cuantizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que esta actualización de empaquetado no reclama ningún resultado de benchmark nuevo ni garantía de precisión.

## Requisitos de hardware

- Descarga total: aproximadamente 91,6 GiB (tamaño del repo en Hugging Face: 98,3 GB).
- Porción de expertos NoWAG: aproximadamente 29 GiB; no representa el total de descarga ni de memoria necesaria.
- Tablas PLE: aproximadamente 47,7 GiB por sí solas; pueden mantenerse en disco con `--host-table-backend disk`.
- RAM del host: debe reservarse suficiente para los pesos y el runtime; el requisito real supera ampliamente los 29 GiB de expertos.
- GPU: se documenta el despliegue en dos GPU con `--tp-size 2 --gpu 0,1`; no se especifican modelos concretos de GPU (A100, H100, RTX 4090) ni VRAM mínima por GPU.
- Viabilidad en GPU de consumo: no disponible en la información proporcionada.
- Motor de despliegue: exclusivamente BigRabbit (https://github.com/ServeBig-project/Big-Rabbit), con soporte de modelo completo desde el PR #82 (rama `release/open-source` mientras el PR esté abierto). No es compatible con Transformers AutoModel; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; solo se indica que MTP habilita decodificación especulativa nativa.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Cuantizacion | Licencia | Motor de despliegue |
|---|---|---|---|---|---|
| Samfisheryu/Qwen3.8-flash-next-nowag-2bit | 59.204.026.259 | no disponible | Expertos ~2 bits NoWAG + resto NVFP4 | qwen-community-1.0 | BigRabbit |
| RadixArk/Qwen3.8-Flash-Next-NVFP4 (base) | no disponible | no disponible | NVFP4 | no disponible | no disponible |
| Qwen/Qwen3.8-Flash-Next (original) | no disponible | no disponible | BF16 (presumible, no confirmado) | Qwen Community License 1.0 | Transformers y otros |

No se dispone de datos de benchmarks ni de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El checkpoint no es cargable directamente por Transformers AutoModel; requiere el motor BigRabbit y, mientras el PR #82 esté abierto, la rama `release/open-source`.
- La cuantización a ~2 bits por peso de experto puede degradar la calidad frente al base NVFP4; el autor no aporta benchmarks ni garantía de precisión.
- Los requisitos reales de memoria son elevados: las tablas PLE (~47,7 GiB) dominan el consumo y pueden obligar a usar backend de disco, con impacto en latencia.
- Idiomas limitados a inglés y chino; no se documenta soporte multilingüe adicional.
- Longitud de contexto no disponible; no se puede garantizar el comportamiento en ventanas largas.
- Licencia Qwen Community License 1.0: es necesario revisar sus términos para uso comercial, ya que no es una licencia permisiva estándar (MIT/Apache).
- Riesgo de alucinación y sesgos: no documentados en la información proporcionada; aplican los del modelo base Qwen3.8-Flash-Next.
- Repositorio con 0 likes y 193 descargas: ecosistema de validación muy limitado; conviene auditar las salidas antes de usarlo en producción.
- El autor no reclama ningún resultado de benchmark nuevo para esta revisión de empaquetado.

## Enlaces

- Hugging Face: https://huggingface.co/Samfisheryu/Qwen3.8-flash-next-nowag-2bit
- Revisión original Paper2 (expertos): https://huggingface.co/Samfisheryu/Qwen3.8-flash-next-nowag-2bit/tree/b06a52c505efce0b6ec7689057b15304fdeee048
- Modelo base cuantizado: https://huggingface.co/RadixArk/Qwen3.8-Flash-Next-NVFP4/tree/7b719225242aacd3dbd3f9407468c2ee9a9d2594
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Motor BigRabbit: https://github.com/ServeBig-project/Big-Rabbit
- PR de soporte de modelo completo: https://github.com/ServeBig-project/Big-Rabbit/pull/82
- Licencia: LICENSE (incluida en el repositorio de Hugging Face)
