# caseyallard/uor-r4-m1-model

## Resumen

UOR-R4 M1 model es un artefacto de investigación publicado por el usuario independiente caseyallard dentro del proyecto UOR-R4. No es un modelo de lenguaje generativo al uso, sino un "tronco discreto entero" (*integer discrete trunk*) de 19 tablas que actúa como predictor de siguiente token. Según la model card, se trata del artefacto con el que el proyecto cerró su hito M1 (`m1_milestone_status: CLOSED_PASS`) y el que carga su ruta de servicio en navegador vía WASM. El repositorio ocupa 0,2 GB y contiene dos semillas del mismo tronco (`trunk-joint-pointer-v1-d11`, semillas 1 y 2) más sus tokenizadores asociados.

La arquitectura es radicalmente distinta a la de un transformer convencional: el esquema `uor-r4.lut-discrete-trunk/1` empaqueta 4 tablas discretas y 15 tablas de "joint-pointer trunk" post-rotación, con vocabulario de 4.096 tokens, 4 bloques, contexto de 192 tokens, 8 celdas conservadas y 5 etapas. El objetivo de entrenamiento declarado es `nearest_address_margin_v1` y la inicialización de lectura `active_leaf_v1`, en la época 420. El tamaño del artefacto (86.536.132 bytes para la semilla 1 y 84.943.328 para la semilla 2) no equivale a un número de parámetros en el sentido habitual, ya que son tablas enteras, no matrices de pesos en coma flotante.

Su relevancia es acotada pero conceptualmente interesante: demuestra que se puede servir un predictor de siguiente token sin coma flotante, con paridad exacta entre exportación float e INT, y con velocidades de decodificación muy altas en hardware Apple M1 y en una RTX 5090. No obstante, el propio autor advierte que la continuación greedy repite tokens y que se trata de una demostración de predicción de siguiente token, no de generación de texto coherente. Está en estado pre-alpha y solo soporta inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tronco discreto entero de 19 tablas (esquema `uor-r4.lut-discrete-trunk/1`); 4 tablas discretas + 15 tablas de joint-pointer trunk post-rotación |
| Parametros totales | No disponible (no se expresa en parámetros; tamaños de artefacto: 86.536.132 B semilla 1, 84.943.328 B semilla 2) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 192 tokens |
| Tipos de cuantizacion | No aplica en el sentido habitual; el modelo es nativamente entero (sin coma flotante para cargar o avanzar) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | Artefactos propietarios `.d11` (`UORLUT01`) + tokenizadores JSON; runtime nativo `uor-r4-integer` y ruta WASM `loadDiscrete`/`predictDiscrete` |

Otros parámetros declarados: vocabulario 4.096, bloques 4, `kept_cells` 8, etapas 5, `read_mode` `relation`, `read_kept` 8, `read_sweeps` 1, objetivo `nearest_address_margin_v1`, inicialización de lectura `active_leaf_v1`, época 420.

## Arquitectura y entrenamiento

El modelo no es un transformer ni un SSM: es un tronco discreto de tablas de búsqueda enteras. El contenedor agrupa 19 tablas: cuatro discretas (`discrete.table`, `discrete.cells`, `discrete.routes`, `discrete.gates`) y quince correspondientes al tronco joint-pointer tras la rotación. La inferencia se realiza en aritmética entera pura, sin necesidad de coma flotante para cargar ni para avanzar un paso, lo que permite paridad exacta entre la exportación float y la INT (el autor reporta Δ = 0 en cada fila y agregado, y builds A/B byte-idénticos). El tokenizador es BPE con vocabulario de 4.096, construido a partir del tokenizador conductor fijado del proyecto (sha256 `d36d3e87…`) mediante `make_tokenizer`, y está ligado a la sha256 del artefacto de su semilla, por lo que no es intercambiable entre semillas.

No se detalla en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. El objetivo `nearest_address_margin_v1` y la inicialización `active_leaf_v1` son innovaciones internas del proyecto cuyo funcionamiento no se describe. Sí se documenta la proveniencia: pre-registro en `docs/harness/prep/m1-close-saved-model-2026-10-26.md`, pod 1× RTX 5090 `vast-57903382`, commit fuente `0806df755c09c8fb0330e4457266c9f6f85ed874`, checkpoints `0831900f…` y `8bbb5950…`, y almacén sellado `caseyallard/uor-r4-store`. La release es una copia byte-idéntica de los artefactos `build-a` almacenados.

## Capacidades

- Predicción de siguiente token: devuelve top-1 y top-8 para un prefijo de ids de token, tanto en runtime nativo entero como en la ruta WASM del navegador.
- Servicio sin coma flotante: carga y avance en aritmética entera, con paridad exacta float/INT verificada.
- Ejecución en navegador: la ruta `loadDiscrete`/`predictDiscrete` del Studio carga el artefacto (~86,5 MB para la semilla 1) en el motor WASM.
- Dos semillas independientes: semillas 1 y 2 con artefactos y tokenizadores propios, útiles para comparación de variabilidad entre semillas.
- No es un modelo de chat: el autor lo describe explícitamente como predictor de siguiente token, no como modelo conversacional.
- No se documentan tool calling, function calling, capacidades de agente, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidad multilingüe: solo inglés.
- Continuación greedy: produce repetición de tokens, tanto en la ruta nativa como en la de navegador; no genera texto coherente.

## Casos de uso

- Investigación sobre inferencia entera: servir un predictor de siguiente token sin coma flotante permite estudiar paridad numérica, determinismo y reproducibilidad en pipelines de despliegue, gracias a la paridad exacta float/INT reportada (Δ = 0).
- Demostración educativa en navegador: cargar el artefacto de ~86,5 MB en WASM y observar predicciones top-1/top-8 sobre prefijos de tokens sirve para ilustrar el funcionamiento de un modelo de tablas discretas sin backend.
- Benchmarking de hardware: con contexto de 192 tokens y decodificación de 64 tokens, el modelo permite medir throughput en Apple M1 (11.026 tok/s de decodificación en semilla 1) y en RTX 5090 (183.206 tok/s de respuesta), útil para comparativas de rendimiento entero.
- Estudio de variabilidad entre semillas: las dos semillas con artefactos separados permiten analizar la dispersión de resultados (spread de 1 en el panel DEV) y la estabilidad del entrenamiento.
- Verificación de integridad de artefactos: los SHA-256 publicados y el fichero `SHA256SUMS` permiten auditar la cadena de custodia de un artefacto de investigación, incluyendo la vinculación tokenizador-semilla.
- Prototipado de rutas de servicio offline-first: el Studio carga el modelo solo tras selección explícita del usuario y la página no hace peticiones en la carga inicial, lo que sirve como patrón para aplicaciones que deben funcionar sin red.
- Reproducción de hitos de investigación: el artefacto es el que cierra el hito M1 del proyecto, por lo que sirve para replicar el panel DEV de 14.287 filas y el panel Fresh V2 de 14.479 filas con los resultados publicados.

## Benchmarks y rendimiento

Panel DEV de cierre M1, 14.287 filas (`m1-close-grade.json` = `CLOSED_PASS`):

| Semilla | Top-1 | Top-8 | Admitted | Export gap (train vs D11) |
|---|---:|---:|---:|---:|
| 1 | 7.002 / 14.287 (49,01 %) | 7.485 | 9.012 | 0 (14.287 / 14.287 filas) |
| 2 | 7.001 / 14.287 (49,00 %) | 7.478 | 9.010 | 0 |

Suelos del panel DEV: Unigram 1.226, T2 6.300, requerido 6.324; dispersión entre semillas 1. La falla plantada `B4` pasa y la paridad de exportación float/INT es exacta.

Panel held-out Fresh V2, 14.479 filas (`outcome: PASS_BAR_E_FRESH_TRANSFER`, `bar_e_pass: true`):

| Semilla | Top-1 | Top-8 | vs T2 | vs Unigram |
|---|---:|---:|---:|---:|
| 1 | 7.215 / 14.479 (49,83 %) | 7.688 | +1.149 | +5.977 |
| 2 | 7.228 / 14.479 (49,93 %) | 7.696 | +1.163 | +5.990 |

Suelos: vs T2 ≥ 82, vs Unigram ≥ 156; ambas semillas pasan; 0 desajustes de referencia y 0 filas rechazadas.

Panel de fraseo held-out (bar f): top-1 entero del modelo guardado 7.850 / 7.872 (semillas 1 / 2).

Velocidad (evidencia comprometida, sin umbral fijado):

| Plataforma | Métrica | Semilla 1 | Semilla 2 |
|---|---|---:|---:|
| Apple M1 (prefill 192 tok, decode 64 tok, 1 warmup + 20 runs) | Decode (tok/s, mediana) | 11.026 | 10.573 |
| Apple M1 | Prefill (tok/s) | 2.596.805 | 2.764.260 |
| 1× RTX 5090 (`compute_120`) | Response (tok/s) | 183.206 | 181.086 |
| 1× RTX 5090 | Contexto (tok/s) | 34.625.934 | 34.225.309 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el artefacto de la semilla 1 ocupa 86.536.132 B (~86,5 MB) y el de la semilla 2 84.943.328 B (~84,9 MB); al ser tablas enteras, el espacio en memoria es del orden del tamaño del artefacto, no de un modelo de parámetros densos.
- GPU recomendadas: RTX 5090 (medido, `compute_120`) para la ruta GPU; el modelo también se ejecuta de forma nativa en Apple M1 sin GPU dedicada.
- Consumer GPU: sí, cabe holgadamente en cualquier GPU consumer moderna dado el tamaño del artefacto; también en CPU y en navegador vía WASM.
- Opciones de despliegue: runtime nativo `uor-r4-integer` (`IntegerDiscreteModel`) y ruta WASM del proyecto (`loadDiscrete`/`predictDiscrete`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: en Apple M1, decodificación de 11.026 tok/s (semilla 1) y 10.573 tok/s (semilla 2); prefill de 2.596.805 y 2.764.260 tok/s respectivamente. En 1× RTX 5090, 183.206 / 181.086 tok/s de respuesta y 34.625.934 / 34.225.309 tok/s de contexto.
- Primera carga en navegador: descarga del artefacto (~86,5 MB para la semilla 1) y carga explícita por el usuario.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto | Parámetros | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| UOR-R4 M1 model (este) | Tronco discreto entero de 19 tablas | 192 tokens | No expresado en parámetros; artefacto ~86,5 MB | MIT | Hugging Face, runtime nativo y WASM |
| `caseyallard/uor-r4-m1-discrete` | Exportaciones base Stage-T de 4 tablas | No disponible | No disponible; artefacto ~542 KB | MIT (según el proyecto) | Hugging Face |
| Transformers de referencia (p. ej. modelos de ~100 M parámetros) | Transformer denso | Habitualmente 2.048–8.192 tokens | ~100 M | Variable | Amplia |

La comparación con transformers convencionales no es directa: este modelo no genera texto coherente y su contexto es de 192 tokens, frente a los miles de tokens habituales en modelos densos del mismo orden de tamaño de artefacto. La alternativa más cercana dentro del propio proyecto es `caseyallard/uor-r4-m1-discrete`, que contiene las exportaciones base de 4 tablas (542 KB cada una), un contenedor y una ruta de ejecución distintos y 160 veces más pequeño. No se dispone de datos de benchmarks comparables con modelos de la misma categoría fuera del proyecto.

## Limitaciones y advertencias

- No es un modelo de chat ni de generación de texto: es un predictor de siguiente token; la continuación greedy repite tokens y no produce texto coherente.
- Estado pre-alpha: la model card lo etiqueta explícitamente como `pre-alpha`, por lo que la API, el formato y el comportamiento pueden cambiar sin aviso.
- Contexto muy corto: 192 tokens, insuficiente para la mayoría de aplicaciones conversacionales o de documentación larga.
- Solo inglés: no hay soporte multilingüe declarado.
- Tokenizadores no intercambiables: cada tokenizador está ligado a la sha256 del artefacto de su semilla; mezclarlos invalida la ejecución.
- Riesgo de alucinación: no aplica en el sentido habitual al no generar texto libre, pero la predicción top-1 puede ser incorrecta; en el panel DEV el top-1 ronda el 49 %.
- Licencia MIT: permite uso comercial, pero el carácter pre-alpha y la falta de benchmarks estándar desaconsejan su uso en producción sin validación propia.
- Sin soporte documentado para tool calling, agentes, visión, audio ni modo thinking.
- Proveniencia ligada a un proyecto y un autor individuales: 0 descargas y 0 likes en el momento de la consulta, sin comunidad de validación independiente.
- La ruta de servicio en navegador se estaba integrando en la sesión de la release, según la model card; su disponibilidad puede ser incompleta.

## Enlaces

- Hugging Face: https://huggingface.co/caseyallard/uor-r4-m1-model
- Exportaciones base Stage-T de 4 tablas: https://huggingface.co/caseyallard/uor-r4-m1-discrete
- Almacén sellado del proyecto: https://huggingface.co/caseyallard/uor-r4-store
- Pre-registro del cierre M1 (referenciado en la model card): `docs/harness/prep/m1-close-saved-model-2026-10-26.md`
- Evidencia del cierre M1 (referenciada): `docs/labs/m1-close-saved-model/evidence/`
- PR #3312 (`antigravity-110`, cierre M1) y PR #3318 (`antigravity-111`, transferencia Fresh V2), referenciados en la model card; no se proporciona URL directa.
- No se proporcionan enlaces a papers, blogs ni demos adicionales en la información disponible.
