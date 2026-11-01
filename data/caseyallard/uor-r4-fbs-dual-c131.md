# caseyallard/uor-r4-fbs-dual-c131

## Resumen

UOR-R4 FBS dual-c131 es un par de artefactos de modelo entero entrenados dentro del proyecto UOR-R4 (UOR Foundation), publicados por el usuario caseyallard en HuggingFace. No es un modelo conversacional ni un asistente: son dos "troncos FBS geométricos" (FBS trunks) exportados al contrato de servicio entero `UORLUT01` con esquema `uor-r4.lut-stack/5`, correspondientes a dos semillas de inicialización (1 y 2) sobre un mismo flujo de batches fijo. El par se entrenó el 26 de octubre de 2026 durante 2.048 pasos por semilla y se exportó en la variante `raw_both` (snaps de rotación de compuertas y transición desactivados).

La relevancia de esta publicación es metodológica más que de capacidad: documenta el cierre de la "brecha de exportación" (export-gap) entre un modelo float de entrenamiento y su artefacto entero servible, verificando que la versión entera reproduce fielmente al modelo float sobre un panel DEV de 14.287 filas. El artefacto servible es puramente entero y autónomo: no necesita el modelo float para ejecutarse, y se sirve en el navegador mediante un motor WASM.

El modelo tiene vocabulario de 4.096 tokens, anchura 256, 1 cabeza, MLP de 384, contexto de 192 tokens y patrón `rrrrrr` de 6 capas de recurrencia. Cada artefacto ocupa 2.144.960 bytes y el repositorio completo pesa 0,0 GB según HuggingFace. Está etiquetado como `pre-alpha` y solo declara soporte de inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tronco geometrico FBS (proyeccion `spiralcore_fbs`), patron `rrrrrr` de 6 capas de recurrencia, lectura `dot`, compuerta `hamilton` |
| Parametros totales | no disponible (el artefacto es una pila de 74 secciones de tablas enteras de 2.144.960 bytes; no se declara recuento de parametros) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 192 tokens |
| Tipos de cuantizacion | no disponible (el artefacto es entero nativo, esquema `uor-r4.lut-stack/5`; no se documentan variantes de cuantizacion) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | `.uorlut` (artefacto entero `UORLUT01`, esquema `uor-r4.lut-stack/5`); no safetensors ni GGUF |
| Vocabulario | 4.096 tokens |
| Anchura / cabezas / MLP | 256 / 1 / 384 |
| Tamano por artefacto | 2.144.960 bytes |
| Libreria | `uor-r4` |
| Estado | pre-alpha |

## Arquitectura y entrenamiento

La arquitectura es un tronco geométrico FBS con seis capas de recurrencia (patrón `rrrrrr`), proyección `spiralcore_fbs`, lectura por producto escalar (`dot`) y compuerta de tipo `hamilton`. El modelo se entrena en coma flotante y después se exporta al contrato de servicio entero mediante `uor-r4-integer::stack::export_fbs_trunk_uorlut01`, generando una pila de 74 secciones de tablas enteras. La ruta servida es enteramente entera: el motor WASM de servicio parsea el esquema `uor-r4.lut-stack/5` y ejecuta el artefacto sin requerir el modelo float.

El entrenamiento corresponde a la ejecución `longer-dual` del 26 de octubre de 2026 (ítem #2820, `d11-exporter-float-trunk`), con 2.048 pasos por semilla y dos semillas de inicialización sobre un flujo de batches fijo y un panel DEV común. La exportación se realizó en un pod con una RTX 5090 (driver 580.178.04, CUDA 12.8, commit fuente `a2424f49fa760c9d62a84a8eab910c5da7a8755a`), evaluando las cuatro combinaciones de snaps sobre el mismo panel DEV; solo `dual-c131` bajo `raw_both` quedó dentro del umbral en ambas semillas. El tokenizador es un BPE del proyecto con vocabulario 4.096, fijado en la pre-registración del entrenamiento y vinculado al sha256 de la pila de cada semilla.

## Capacidades

- Generación de secuencias de tokens sobre un vocabulario cerrado de 4.096 entradas, con contexto máximo de 192 tokens.
- Servicio entero determinista: la inferencia se ejecuta sobre tablas enteras sin operaciones en coma flotante en la ruta servida.
- Ejecución en navegador mediante Web Worker WASM (`loadStack`, `step`, `saveSession`, `restoreSession`).
- Persistencia de sesión: guardado y restauración del estado de la sesión de inferencia.
- No es un modelo de chat ni un asistente: no se declara soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento.
- Capacidad multilingüe: solo inglés declarado; no se documentan otras lenguas.
- El tokenizador servible requiere que el sha256 de la pila coincida con el del artefacto de tokenizador de la semilla correspondiente; en carga por URL el Studio recurre a un sustituto etiquetado de bytes hasta que se le pasan los bytes del tokenizador correcto.

## Casos de uso

- Verificación de fidelidad de exportación: usar el par de artefactos para reproducir el experimento de export-gap comparando el top-1 del artefacto entero con el de su modelo float sobre el panel DEV de 14.287 filas, con umbrales `|net| ≤ 24` y `|ΔL| ≤ 0,0457`.
- Investigación en servicio entero: estudiar cómo se comporta una pila de tablas enteras de 74 secciones en un motor WASM, midiendo latencia y throughput de decodificación sin dependencia de coma flotante.
- Despliegue en navegador con requisitos mínimos: servir el artefacto de 2,1 MB en el UOR-R4 Studio mediante carga por URL iniciada por el usuario, aprovechando que la página permanece offline-first hasta que se solicita el modelo.
- Pruebas de reproducibilidad entre semillas: comparar los dos artefactos (semillas 1 y 2) sobre el mismo flujo de batches y panel DEV para analizar la variabilidad de inicialización, teniendo en cuenta que no son réplicas independientes del orden de datos.
- Benchmarking de motores de inferencia entera: usar `fbs-toks` en hardware Apple M1 como referencia de velocidad (4.217-4.320 tok/s en decodificación) para comparar implementaciones alternativas del intérprete de pilas `uor-r4.lut-stack/5`.
- Docencia y demostración de contratos de exportación: ilustrar el flujo completo entrenamiento float, exportación a contrato entero, validación de hashes y servicio WASM en un caso de 2,1 MB manejable en un portátil.
- Validación de tokenizadores vinculados a pila: comprobar con `make_tokenizer.mjs --check` que los artefactos `tokenizer-seed-N.json` casan con el sha256 de la pila de su semilla y que el vocabulario es 4.096.

## Benchmarks y rendimiento

Evaluación de fidelidad de exportación (cierre de export-gap, informe claude-182) sobre el panel DEV de 14.287 filas. El umbral se fijó antes de la ejecución: `|net| = |F top-1 − A top-1| ≤ F_I = 24` y `|ΔL| ≤ 0,0457`.

| Semilla | F top-1 | Artefacto top-1 | net (F − A) | F_I | Dentro del umbral | ΔL |
|---|---:|---:|---:|---:|---|---:|
| 1 | 3.845 | 3.839 | 6 | 24 | si | −0,00056 |
| 2 | 3.128 | 3.136 | −8 | 24 | si | 0,00104 |

Velocidad medida en portátil Apple M1 con `fbs-toks` (20 ejecuciones cronometradas, un calentamiento; sin umbral fijado):

| Semilla | Decodificación (tok/s, mediana) | Contexto (tok/s, mediana) |
|---|---:|---:|
| 1 | 4.217 / 4.239 | 4.178 / 4.211 |
| 2 | 4.320 / 4.315 | 4.211 / 4.215 |

Estos datos miden fidelidad de exportación y velocidad de servicio entero, no calidad lingüística ni capacidad del modelo. No se han publicado resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en la ruta servida; el artefacto es una pila entera de 2.144.960 bytes que se ejecuta en CPU.
- GPU recomendadas: no se requiere GPU para el servicio; la exportación se realizó en una RTX 5090 con CUDA 12.8, pero el artefacto servible no depende de ella.
- Cabe en cualquier GPU de consumo e incluso en CPU: el peso del artefacto es de ~2,1 MB y la velocidad de referencia se midió en un Apple M1.
- Opciones de despliegue: motor WASM de servicio del proyecto UOR-R4 (Studio en navegador, Web Worker con `loadStack`/`step`/`saveSession`/`restoreSession`) y la herramienta `fbs-toks` para medición de throughput. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: decodificación de 4.217-4.320 tok/s y contexto de 4.178-4.215 tok/s en Apple M1 según las mediciones del autor; no se publican latencias en otros hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Estado | Enfoque |
|---|---|---|---|---|---|---|
| UOR-R4 FBS dual-c131 | no disponible (pila entera de 2,1 MB) | 192 | `.uorlut` (`uor-r4.lut-stack/5`) | MIT | pre-alpha | Tronco geométrico FBS entero, servicio WASM |
| Modelos transformer pequeños de propósito general (p. ej. familia de <1B) | cientos de millones | miles de tokens | safetensors, GGUF | variable | estable | Generación de texto y chat |
| Modelos de embeddings ligeros | decenas de millones | cientos de tokens | safetensors, ONNX | variable | estable | Representación vectorial |

No se dispone de alternativas directamente comparables en la información proporcionada: el artefacto no es un modelo de lenguaje de propósito general ni un asistente, sino un tronco geométrico entero con fines de investigación en exportación y servicio. La comparación con modelos transformer pequeños se incluye solo como referencia de categoría y no implica equivalencia funcional.

## Limitaciones y advertencias

- No es un modelo de chat ni un asistente: no debe evaluarse ni desplegarse como tal.
- Estado `pre-alpha`: la API, el esquema `uor-r4.lut-stack/5` y las herramientas asociadas pueden cambiar sin compatibilidad.
- Contexto muy limitado: 192 tokens, insuficiente para conversaciones multi-turno o documentos largos.
- Solo inglés declarado; no se documenta soporte de otros idiomas.
- Las dos semillas son semillas de inicialización sobre un flujo de batches y panel DEV comunes, no réplicas independientes del orden de datos; no se infiere intervalo de confianza entre semillas.
- Los resultados publicados miden fidelidad de exportación (artefacto entero frente a modelo float), no calidad lingüística ni capacidad; no hay benchmarks de MMLU, HumanEval, GSM8K ni similares.
- El tokenizador está vinculado al sha256 de la pila de cada semilla y no es intercambiable entre semillas; en carga por URL, el Studio usa un sustituto de bytes etiquetado hasta recibir los bytes del tokenizador correcto, lo que puede alterar la decodificación.
- Riesgo de alucinación y sesgos: no evaluados ni documentados en la información disponible.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; al ser un artefacto de investigación pre-alpha, su uso en producción requiere validación propia.
- El repositorio declara 0 descargas y 0 likes, y un tamaño de 0,0 GB en HuggingFace; la información de uso real es inexistente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/caseyallard/uor-r4-fbs-dual-c131
- Repositorio del proyecto UOR-R4: https://github.com/UOR-Foundation/uor-r4
- Studio en navegador: https://uor-foundation.github.io/uor-r4/studio/
- Artefacto semilla 1: https://huggingface.co/caseyallard/uor-r4-fbs-dual-c131/resolve/main/dual-c131-seed-1-raw_both.uorlut
- Artefacto semilla 2: https://huggingface.co/caseyallard/uor-r4-fbs-dual-c131/resolve/main/dual-c131-seed-2-raw_both.uorlut
- Almacén sellado de resultados (referenciado en la model card): `caseyallard/uor-r4-store:results/claude/d11-fbs-dual-train-2026-10-26/` y `.../results/claude/d11-unsnapped-gap-2026-10-29/`
- Pre-registración del entrenamiento (referenciada): `docs/harness/prep/d11-exporter-float-trunk-longer-dual-2026-10-26.md`
- Informes de entrenamiento y exportación (referenciados): `docs/loop/tasks/d11-exporter-float-trunk/` (claude-132, claude-180, claude-182)
