# iiidevv/nebula-raw-training

## Resumen

`iiidevv/nebula-raw-training` es un repositorio de artefactos de entrenamiento publicado en HuggingFace por el usuario `iiidevv`, no una release de modelo lista para inferencia. Contiene, según su propia model card, shards de texto empaquetado en tokens byte-level, índices de fuentes, checkpoints de modelo, de optimizador y de scaler, además de informes, subidos directamente desde RAM. El repositorio ocupa 365,7 GB y se presenta como continuación experimental pública de los pesos "Nebula" del autor, bajo la etiqueta `Nebula V18`.

El interés técnico del repositorio está en la infraestructura de datos más que en el modelo: el texto se codifica como tokens `uint16` little-endian con IDs 0-255 para bytes UTF-8 y dos tokens especiales (BOS=256, EOS=257), lo que sitúa el pipeline en el espacio de modelos byte-level sin vocabulario BPE. La mezcla de corpus es explícita y trazable: `fineweb-edu` (sample-10BT), `cosmopedia-v2`, `TinyStories` y un componente de libros de texto sintéticos derivado de `openstax`.

La relevancia ahora es acotada pero real: es un caso documentado de entrenamiento reproducible con procedencia de datos declarada, deduplicación exacta por hash, separación train/validación previa al empaquetado y gestión de shards pensada para minimizar tráfico de red. No hay pipeline definido, ni idiomas declarados, ni benchmarks publicados, ni pesos en formatos de inferencia estándar. Cualquier evaluación de capacidades del modelo es, con la información disponible, imposible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el autor no declara arquitectura; el pipeline usa tokenización byte-level con BOS=256 y EOS=257) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se publican pesos GGUF, AWQ, GPTQ ni similares) |
| Idiomas soportados | no disponible (la model card no declara idiomas; los corpus citados son mayoritariamente en inglés) |
| Licencia | `other`, con nombre `per-source-data-licenses`: cada corpus conserva sus términos upstream (ODC-By, CDLA-Sharing-1.0, Apache-2.0) y el repositorio no los relicencia |
| Formato de pesos | no disponible con precisión; `library_name: pytorch`. El repo contiene checkpoints de modelo, optimizador y scaler, presumiblemente estado PyTorch, sin confirmación de safetensors |

Datos adicionales del repositorio: ID `iiidevv/nebula-raw-training`, autor `iiidevv`, creado el 2026-10-21 y actualizado el 2026-10-23, 0 descargas, 1 like, etiquetas `nebula`, `experimental`, `region:us`, tamaño 365,7 GB.

## Arquitectura y entrenamiento

La model card no describe la arquitectura del modelo (transformer, MoE, híbrida u otra). Lo que sí está documentado es la capa de representación: los documentos UTF-8 completos se normalizan, se deduplican de forma exacta por hash y se asignan por hash a train o validación antes del empaquetado. El resultado se serializa como tokens `uint16` little-endian, donde los IDs 0-255 codifican bytes individuales y 256/257 son BOS/EOS. Se aplican filtros de patrones de credenciales, de caracteres de control y de tamaño, y el autor advierte explícitamente de que esto no constituye una auditoría completa de PII, de corrección factual ni de duplicados difusos.

La composición del corpus está fijada por revisión (commit) de cada dataset upstream: `HuggingFaceFW/fineweb-edu` en su muestra `sample-10BT` (ODC-By), `cosmopedia-v2` dentro de `HuggingFaceTB/smollm-corpus` (ODC-By), `roneneldan/TinyStories` (CDLA-Sharing-1.0) y `HuggingFaceTB/cosmopedia` en la partición `openstax` (Apache-2.0), que el autor describe como texto sintético sembrado a partir de esquemas de OpenStax. Los porcentajes de mezcla describen bytes UTF-8 adquiridos, mientras que las muestras de entrenamiento cuentan posiciones empaquetadas, incluyendo exposición repetida.

En el plano de la ingeniería, el entrenamiento usa localidad de shard determinista (64 actualizaciones por shard muestreado) para acotar el tráfico de red, cachea como máximo dos shards de entrenamiento y dos de validación en RAM, y mantiene los hashes de deduplicación también en memoria. No se escribe ni dataset ni checkpoint en el sistema de ficheros del worker: los artefactos se suben directamente desde RAM. Solo sobreviven al fallo del worker los checkpoints confirmados como públicos. No se documenta RLHF, DPO ni ninguna fase de alineación.

## Capacidades

- Generación de texto: no verificable con la información disponible; no hay pipeline, demo ni evaluación publicada.
- Razonamiento, código y matemáticas: no disponible; sin benchmarks ni ejemplos en la model card.
- Tool calling / function calling: no disponible; no se menciona soporte.
- Uso como agente o razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; los corpus citados son de origen anglófono.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- Capacidad real y documentada del repositorio: servir como fuente de shards de texto byte-level, índices de procedencia con URLs originales de FineWeb en índices comprimidos, y checkpoints reanudables de modelo, optimizador y scaler.
- Trazabilidad de licencias por corpus: cada run conserva las model cards upstream fijadas por commit.

## Casos de uso

- Reproducción de entrenamiento byte-level: descargar los shards empaquetados y reentrenar o continuar el entrenamiento con la misma mezcla y la misma asignación train/validación por hash, lo que permite comparar curvas entre runs sin variabilidad de preprocesado.
- Investigación sobre tokenización sin vocabulario: usar los shards `uint16` con IDs 0-255 como entrada para experimentos de modelos byte-level, donde desaparecen los problemas de cobertura de vocabulario y de tokenización de idiomas de bajos recursos.
- Auditoría de procedencia de datos: los índices comprimidos conservan las URLs de los documentos originales de FineWeb y las revisiones exactas de cada dataset, lo que permite reconstruir el origen de un shard concreto y verificar el cumplimiento de las licencias ODC-By, CDLA-Sharing-1.0 y Apache-2.0.
- Reanudación de entrenamiento tras fallo de worker: los checkpoints de modelo, optimizador y scaler permiten retomar el estado exacto, con la advertencia de que los snapshots completos de optimizador consumen mucha RAM de host y almacenamiento público.
- Estudio de dinámica de datos en mezclas multiformato: la combinación de texto educativo web (FineWeb), texto sintético de estilo enciclopédico (Cosmopedia), narrativa simple (TinyStories) y material de libros de texto permite aislar el efecto de cada componente en el aprendizaje.
- Construcción de pipelines de deduplicación y filtrado: el repositorio documenta el orden exacto (normalización, dedup exacta por hash, split por hash, filtros de credenciales/control/tamaño) y sirve como referencia para diseñar o auditar preprocesados propios.
- Base para evaluación de sesgos y PII: al no existir auditoría completa de PII, el corpus es un caso de estudio útil para medir qué tipo de información personal sobrevive a un filtrado superficial antes de empaquetar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

No hay métricas de MMLU, HumanEval, GSM8K ni de perplejidad, ni curvas de pérdida en la model card. Tampoco se declara el número de tokens vistos ni el tamaño del modelo, por lo que no es posible normalizar ningún resultado aunque existiera.

## Requisitos de hardware

- VRAM para inferencia: no disponible. Sin conocer el número de parámetros ni la arquitectura no se puede estimar, ni siquiera por rango de cuantización.
- GPU recomendadas (A100, H100, RTX 4090): no disponible por la misma razón.
- Encaje en GPU de consumo: indeterminable con los datos publicados.
- Almacenamiento: el repositorio completo son 365,7 GB; descargar los checkpoints de modelo, optimizador y scaler requiere ese orden de magnitud en disco.
- RAM de host: la model card advierte de que los snapshots completos de optimizador consumen "substantial host RAM" y que la memoria de GPU por sí sola no es suficiente para entrenar o reanudar.
- Memoria durante el entrenamiento: como máximo dos shards de entrenamiento y dos de validación en caché simultánea, más los hashes de deduplicación en RAM.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; el repositorio no publica pesos en GGUF ni artefactos compatibles con servidores de inferencia, y no hay `pipeline_tag`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No es posible establecer una comparativa fiable con la información disponible. El repositorio no publica parámetros, contexto, licencia de uso del modelo ni resultados, y las búsquedas web devuelven proyectos homónimos sin relación (una pasarela de API, un agente de código en terminal y un workbench de memoria para LLM), por lo que no constituyen alternativas comparables.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| iiidevv/nebula-raw-training | no disponible | no disponible | no publicado | `other` (per-source-data-licenses) | pesos/artefactos en HF, sin pipeline declarado |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

La categoría real del artefacto —repositorio de datos y checkpoints de un experimento privado— no tiene un conjunto estándar de comparables públicos identificable a partir de la información suministrada.

## Limitaciones y advertencias

- No es un modelo listo para producción: no hay `pipeline_tag`, ni demo, ni formatos de inferencia estándar, ni documentación de la arquitectura.
- Licencia `other` con nombre `per-source-data-licenses`: el repositorio no relicencia los corpus y cada componente mantiene sus términos upstream. El uso comercial exige revisar ODC-By, CDLA-Sharing-1.0 y Apache-2.0 por separado, y los pesos heredados no tienen términos de uso del modelo declarados.
- Riesgo de PII: el autor advierte de que los pesos heredados y los datos web públicos no están garantizados libres de información personal, y de que los filtros aplicados (credenciales, control, tamaño) no constituyen una auditoría completa de PII.
- Riesgo factual y de duplicados: no se ha realizado auditoría factual ni de duplicados difusos; la deduplicación es exacta por hash tras normalización.
- Solapamiento con datos previos: el modelo puede haber visto texto público coincidente antes de este experimento, lo que invalida cualquier afirmación de separación limpia respecto a benchmarks públicos.
- Sesgos: no documentados, pero la mezcla es predominantemente anglófona y de fuentes web y sintéticas, con el sesgo editorial de FineWeb-Edu y de Cosmopedia.
- Idiomas: no declarados; la composición del corpus sugiere cobertura muy limitada fuera del inglés.
- Fiabilidad operativa: solo sobreviven al fallo del worker los checkpoints confirmados como públicos, y el autor advierte de que el almacenamiento público no es ilimitado; la historia puede quedar incompleta.
- Sin control de calidad: la model card indica explícitamente que no hay despliegue web ni aprobación automática de calidad habilitados.
- Fecha de creación anómala (2026-10-21) en los metadatos del repositorio; conviene verificar la cronología antes de citarlo.

## Enlaces

- Repositorio del modelo: https://huggingface.co/iiidevv/nebula-raw-training
- Sección de licencias de la model card: https://huggingface.co/iiidevv/nebula-raw-training/blob/main/README.md#licenses
- Dataset de datos públicos asociado: https://huggingface.co/datasets/iiidevv/nebula-public-data
- FineWeb-Edu (revisión fijada): https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu/tree/87f09149ef4734204d70ed1d046ddc9ca3f2b8f9
- SmolLM corpus / Cosmopedia-v2 (revisión fijada): https://huggingface.co/datasets/HuggingFaceTB/smollm-corpus/tree/3ba9d605774198c5868892d7a8deda78031a781f
- TinyStories (revisión fijada): https://huggingface.co/datasets/roneneldan/TinyStories/tree/f54c09fd23315a6f9c86f9dc80f725de7d8f9c64
- Cosmopedia / OpenStax (revisión fijada): https://huggingface.co/datasets/HuggingFaceTB/cosmopedia/tree/0ae6ec63f91742bd2d1eaef4f02232c55d719385
- Licencia ODC-By 1.0: https://opendatacommons.org/licenses/by/1-0/
- Licencia CDLA-Sharing-1.0: https://cdla.dev/sharing-1-0/
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0

Nota: los resultados de búsqueda web incluidos (Mittinzzz/nebula, docs.ai-nebula.com y Morningstar202604/nebula) corresponden a proyectos homónimos sin relación con este repositorio y no se han utilizado como fuentes.
