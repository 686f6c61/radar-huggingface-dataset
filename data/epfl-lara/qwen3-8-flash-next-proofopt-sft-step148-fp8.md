# EPFL-LARA/Qwen3.8-Flash-Next-ProofOpt-SFT-step148-FP8

## Resumen

Qwen3.8-Flash-Next-ProofOpt-SFT-step148-FP8 es un checkpoint intermedio publicado por el laboratorio EPFL-LARA (EPFL, Suiza) a partir de un ajuste fino supervisado (SFT) con LoRA sobre el modelo multimodal Qwen/Qwen3.8-Flash-Next. El objetivo declarado del entrenamiento es la optimización de pruebas formales (*proof optimization*), es decir, la reescritura y simplificación de demostraciones matemáticas asistidas por ordenador. El resultado es un modelo de tipo image-text-to-text con 179.999.981.459 parámetros (unos 180.000 millones) exportado en FP8 nativo.

El interés de esta ficha no reside en su rendimiento —no se ha ejecutado ninguna evaluación ni benchmark sobre el checkpoint exportado— sino en su valor como artefacto de reproducibilidad: documenta con precisión la procedencia del entrenamiento (9.361 ejemplos de entrenamiento, 100 de validación, longitudes originales sin truncar de hasta 225.259 tokens, LoRA de rango 32 con alpha 64, batch efectivo de 23 y paralelismo tensor/experto de 8) y verifica criptográficamente todos los tensores publicados.

Se trata de un *checkpoint* de la iteración 148 de un entrenamiento que continúa de forma independiente en el clúster del autor. La licencia es la Qwen Community License 1.0, heredada del modelo base, con las obligaciones de atribución correspondientes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) derivado de Qwen3.8-Flash-Next; el ajuste fino apunta a proyecciones de atención y GDN, lo que sugiere componentes de atención lineal híbrida (tipo Gated DeltaNet), aunque la arquitectura exacta del base no se detalla en la información disponible |
| Parámetros totales | 179.999.981.459 (~180.000 millones) |
| Parámetros activos | no disponible (la model card menciona *expert parallelism* en el entrenamiento, lo que apunta a una arquitectura con expertos, pero no se publica el número de parámetros activos) |
| Longitud de contexto | no disponible como spec oficial del modelo; el entrenamiento usó secuencias originales de hasta 225.259 tokens sin truncamiento |
| Tipos de cuantización | FP8 nativo (dinámico, bloques de peso de 128×128) con exclusiones de módulos en BF16; el base también existe en BF16. No se indica disponibilidad de GGUF, AWQ o GPTQ |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (Qwen Community License 1.0), con atribución al modelo original |
| Formato de pesos | safetensors (131 shards publicados, ~224,4 GB de repositorio) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.8-Flash-Next (revisión `de4b8e4d43b917e7706784d8bb445c9af86a3540`) y conserva exactamente la configuración, el índice de pesos, el tokenizador y los recursos del modelo FP8 oficial Qwen/Qwen3.8-Flash-Next-FP8 (revisión `236dfdf285828023ca3bcd3f37366c58a3469b13`): FP8 dinámico con bloques de 128×128 y las mismas exclusiones de módulos en BF16. El ajuste fino se aplicó mediante LoRA de rango 32, alpha 64 y dropout 0 sobre las proyecciones de atención y GDN, con paralelismo tensor y de expertos de 8 y batch efectivo de 23. El adaptador fue fusionado y el resultado se exportó como modelo autónomo, sin necesidad de cargar un adaptador aparte.

El conjunto de datos de entrenamiento es fijo: 9.361 ejemplos de entrenamiento y 100 de validación, con manifiesto SHA-256 `79abc6ba63968fd043fb40e7a18cc7a26f456492324f95e14ad922462893cdd8`. Se conservaron los contextos originales completos, los *input IDs* y las máscaras de etiquetas, sin truncamiento. Las 84 proyecciones entrenadas pertenecen precisamente a los módulos excluidos de la cuantización FP8; antes de fusionarlas se verificó que cada peso excluido era idéntico byte a byte a su homólogo BF16 del modelo de entrenamiento, y la fusión se hizo con `Linear.merge(safe_merge=True)` de PEFT en CPU. Los expertos cuantizados y el resto de tensores permanecen idénticos byte a byte al modelo FP8 oficial. Los 131 shards publicados fueron verificados contra el manifiesto de conversión o contra la fuente FP8 fijada.

## Capacidades

- Generación de texto conversacional y razonamiento en el dominio de matemáticas y demostraciones formales.
- Optimización de pruebas: reescritura, simplificación y reordenación de demostraciones existentes, que es la tarea concreta del ajuste fino.
- Procesamiento de imagen y texto de forma conjunta (pipeline `image-text-to-text`), útil para diagramas, fórmulas renderizadas o figuras de artículos.
- Manejo de contextos muy largos: el entrenamiento trabajó con secuencias de hasta 225.259 tokens sin truncar, por lo que el modelo está expuesto a entradas de cientos de miles de tokens.
- Capacidad multilingüe: no disponible (no se documentan los idiomas cubiertos).
- Soporte de *tool calling* / *function calling*: no disponible (no se documenta; el base podría soportarlo, pero no hay confirmación en la información proporcionada).
- Modo *thinking* explícito, audio u otras capacidades especiales: no disponible.
- Compatibilidad declarada con *endpoints* de HuggingFace (tag `endpoints_compatible`).

## Casos de uso

- Optimización de demostraciones en asistentes de prueba formales: el modelo recibe un *script* de Lean/Coq/Isabelle junto con el enunciado y devuelve una versión más corta o legible, aprovechando que el SFT se hizo exactamente sobre esa tarea.
- Investigación en automatización de matemáticas: servir de punto de partida para *fine-tunes* posteriores o para estudiar el efecto del SFT de proof optimization sobre un base de 180.000 millones de parámetros.
- Análisis de artículos matemáticos con figuras: al ser image-text-to-text, puede procesar un PDF con diagramas y texto para extraer enunciados y esbozos de prueba.
- Reproducibilidad y auditoría de entrenamientos: los hashes de shards, adaptador y manifiesto de dataset permiten verificar la cadena de custodia en experimentos de investigación; útil en publicaciones que requieran artefactos verificables.
- Evaluación comparativa de *checkpoints* intermedios: permite medir cómo evoluciona la capacidad de prueba formal a lo largo del entrenamiento comparando la iteración 148 con otras.
- Procesamiento de documentación técnica extensa: con secuencias de hasta 225.000 tokens, encaja en tareas de resumen o extracción sobre corpus muy largos (por ejemplo, especificaciones completas o bases de teoremas).
- Generación de datos sintéticos de prueba para entrenar modelos más pequeños: el modelo puede producir variantes de demostraciones que luego se filtran y se usan como corpus.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se ha ejecutado ninguna evaluación ni benchmark sobre este checkpoint exportado y que no se reportan resultados de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: ~180 GB solo para pesos en FP8 (179.999.981.459 parámetros a 1 byte); el *KV cache* se suma aparte y crece de forma lineal con la longitud de contexto, por lo que con contextos de cientos de miles de tokens el consumo puede superar con holgura el de los pesos. En BF16 serían ~360 GB.
- GPU recomendadas: 8×H100 80 GB (640 GB en total) para FP8 con contexto largo; 4×H100 80 GB (320 GB) podría bastar para contexto corto, pero deja poco margen para el *KV cache*. 8×A100 80 GB es una alternativa, aunque las A100 no tienen núcleos tensoriales FP8 nativos y la cuantización FP8 requeriría emulación o *upcast* a BF16.
- GPU de consumo: no cabe en ninguna GPU de consumo actual. Una RTX 4090 (24 GB) queda muy lejos de los ~180 GB de pesos; se necesitaría un esquema de descarga a CPU/ disco y *offloading* por capas, con latencia muy degradada.
- Opciones de despliegue: vLLM y SGLang son las vías razonables para FP8 nativo en hardware Hopper/Ada; TGI si soporta la arquitectura del base; llama.cpp/Ollama no están documentados para este formato FP8 nativo y requerirían una conversión a GGUF de la que no hay información.
- Latencia y throughput: no disponible (no se publican mediciones).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Estado |
|---|---|---|---|---|---|
| EPFL-LARA/Qwen3.8-Flash-Next-ProofOpt-SFT-step148-FP8 | ~180.000 M | no disponible (entrenado hasta 225.259 tokens) | FP8 nativo + exclusiones BF16 | qwen-community-1.0 | Checkpoint intermedio, sin evaluación, 0 descargas |
| Qwen/Qwen3.8-Flash-Next | ~180.000 M (base) | no disponible | BF16 | qwen-community-1.0 | Modelo base oficial |
| Qwen/Qwen3.8-Flash-Next-FP8 | ~180.000 M (base) | no disponible | FP8 dinámico, bloques 128×128 | qwen-community-1.0 | Base oficial cuantizado, referencia de formato para esta exportación |

No se dispone de información sobre otros *fine-tunes* comparables de proof optimization sobre esta familia, ni de resultados numéricos que permitan una comparación de rendimiento.

## Limitaciones y advertencias

- Es un checkpoint intermedio (iteración 148): el entrenamiento continúa y esta exportación no implica que el proceso haya terminado. No debe tratarse como un modelo final.
- No se ha ejecutado ninguna evaluación ni benchmark; no hay evidencia publicada de que mejore al base en proof optimization ni en ninguna otra tarea.
- El ajuste fino se hizo sobre solo 9.361 ejemplos de un dominio muy concreto; es esperable un riesgo de olvido catastrófico en capacidades generales y de degradación fuera del dominio de demostraciones formales. No hay datos que lo cuantifiquen.
- Riesgo de alucinación: en generación de pruebas formales, un paso inválido invalida toda la demostración; se recomienda verificación mecánica con el *proof assistant* antes de usar cualquier salida.
- Idiomas soportados no documentados; no se puede asumir un rendimiento multilingüe equivalente al del base.
- Longitud de contexto oficial no documentada: los 225.259 tokens corresponden a la longitud máxima observada en entrenamiento, no a una garantía de ventana de inferencia.
- Licencia Qwen Community License 1.0: es una licencia "other" con condiciones específicas de uso comercial y obligaciones de atribución. Hay que revisar `LICENSE` antes de cualquier despliegue en producción.
- El repositorio ocupa 224,4 GB y requiere infraestructura multigpu; no hay métricas de latencia ni de throughput publicadas.
- Modelo con 0 descargas y 0 *likes*: no hay evidencia de uso en la comunidad ni informes independientes de calidad.
- Los resultados de la búsqueda web realizada no contienen ninguna referencia técnica al modelo (son foros sin relación), por lo que no hay documentación externa adicional que contrastar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/EPFL-LARA/Qwen3.8-Flash-Next-ProofOpt-SFT-step148-FP8
- Modelo base (BF16): https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Modelo base en FP8: https://huggingface.co/Qwen/Qwen3.8-Flash-Next-FP8
- Licencia del modelo: https://huggingface.co/EPFL-LARA/Qwen3.8-Flash-Next-ProofOpt-SFT-step148-FP8/blob/main/LICENSE
- Metadatos de exportación y hashes: https://huggingface.co/EPFL-LARA/Qwen3.8-Flash-Next-ProofOpt-SFT-step148-FP8/blob/main/export_metadata.json
- Organización EPFL-LARA en HuggingFace: https://huggingface.co/EPFL-LARA

Nota: la búsqueda web realizada no devolvió ningún enlace relevante sobre este modelo ni sobre su entrenamiento; los únicos resultados obtenidos fueron hilos de un foro de lengua francesa sin relación con el contenido de esta ficha.
