# caseyallard/uor-r4-m1-discrete

## Resumen

UOR-R4 M1 Stage-T discrete es un modelo de lenguaje experimental desarrollado por el usuario caseyallard dentro del proyecto UOR-R4. Se distribuye como dos artefactos binarios autocontenidos en formato `UORLUT01` (esquema `uor-r4.lut-discrete/1`), cada uno de 542.260 bytes, correspondientes a dos semillas de entrenamiento distintas del mismo modelo base de lenguaje M1. No es un transformer convencional: es un modelo discreto de tablas de búsqueda (lookup tables) que se sirve mediante un motor de enteros nativo, sin necesidad de coma flotante ni GPU.

El modelo forma parte del hito M1 del proyecto, pero conviene leerlo con honestidad: estos archivos son la *base* Stage-T de 4 tablas, anterior al ensamblado de tronco de 19 tablas que constituyó el artefacto de cierre real del hito M1. Según la propia model card, esta base de 4 tablas no supera el criterio (d) del hito M1, y su top-1 en el panel DEV (455 de 14.287, un 3,18%) queda por debajo de la tabla unigram (1.226) y de la tabla T2 (6.300). Por tanto, debe interpretarse como evidencia de fidelidad de exportación y de rendimiento de inferencia, no como una demostración de capacidad lingüística.

La relevancia actual es acotada pero específica: el modelo se publica para inspección y para servir en modo entero nativo, con un rendimiento medido notable en Apple M1 (unos 12.600 tok/s de decodificación y más de 2,3 millones de tok/s de prefill en el panel medido). Está etiquetado como pre-alpha, solo en inglés, licencia MIT y no está pensado como asistente ni como modelo conversacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo discreto de tablas de búsqueda (lookup tables), contenedor `UORLUT01`, esquema `uor-r4.lut-discrete/1`, 4 tablas (`discrete.table`, `discrete.cells`, `discrete.routes`, `discrete.gates`) |
| Parametros totales | No disponible (no se expresa en parámetros; el artefacto pesa 542.260 bytes por semilla) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 192 tokens |
| Tipos de cuantizacion | No aplica: serving entero nativo (`IntegerDiscreteModel`, D11), sin coma flotante |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `.lut` binario (`UORLUT01`), más `tokenizer.json` (BPE, vocab 4.096) |

Otros parámetros de forma declarados: vocabulary 4.096, blocks 4, context 192, kept_cells 8, stages 5, read_mode `relation`, read_kept 8, read_sweeps 1, objective `nearest_address_margin_v1`, read initialization `active_leaf_v1`, seed 1 / 2, epoch 420.

## Arquitectura y entrenamiento

El modelo no sigue la arquitectura transformer habitual. Se trata de un modelo discreto basado en tablas de búsqueda con un grafo de enrutamiento (`discrete.routes`) y compuertas (`discrete.gates`), servido por el motor `IntegerDiscreteModel` del crate `uor-r4-integer`. La inferencia es puramente entera: no requiere coma flotante ni GPU para cargar ni para ejecutar un paso. El contenedor declara 4 bloques, 5 etapas, contexto de 192 tokens y modo de lectura `relation` con 8 celdas retenidas y 1 barrido de lectura.

El entrenamiento se realizó hasta la época 420 con el objetivo `nearest_address_margin_v1` y dos semillas independientes. El checkpoint de origen procede de un snapshot con esquema `uor-r4.discrete-spiralcore-fbs/2`, con hash SHA-256 distinto por semilla. La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO; esos datos figuran como no disponibles. La innovación técnica destacable es el propio paradigma de serving entero nativo, verificado con auditorías de instrucciones: el binario ARM64 `uor-r4-stack` pasó con 0 instrucciones prohibidas en 44 rangos de símbolos y 98 funciones alcanzables, y el build WASM de serving pasó 7 de 7 símbolos con 0 operaciones en coma flotante.

## Capacidades

- Predicción de siguiente token (next-token prediction) en modo greedy sobre identificadores de token sin procesar.
- Serving entero nativo sin GPU ni coma flotante, mediante `uor-chat --discrete`.
- Tokenización BPE incluida (`tokenizer.json`, vocabulario de 4.096).
- Ejecución reproducible por semilla: dos artefactos con paridad de exportación verificada.
- No soporta tool calling ni function calling (no documentado).
- No soporta agentes ni razonamiento multi-paso.
- No soporta visión, audio ni modo thinking.
- Capacidad multilingüe limitada al inglés.
- No es un modelo conversacional ni un asistente; la propia model card advierte que la generación greedy tiende a repetir el identificador de token anterior y que la salida debe tratarse como demostración de siguiente token, no como texto coherente.

## Casos de uso

- Investigación sobre modelos discretos de tablas de búsqueda: el artefacto permite inspeccionar directamente las 4 tablas (`discrete.table`, `discrete.cells`, `discrete.routes`, `discrete.gates`) para estudiar cómo se representa y enruta la información en un modelo no transformer.
- Verificación de fidelidad de exportación: los dos ficheros, con sumas SHA-256 publicadas, permiten reproducir la paridad de exportación medida (14.287 de 14.287 filas, gap exacto cero) y auditar el pipeline de exportación del proyecto.
- Serving entero en hardware de bajo consumo: al no requerir coma flotante ni GPU, puede ejecutarse en entornos ARM64 restringidos donde un transformer no cabría o no sería viable energéticamente.
- Benchmarking de motores de inferencia enteros: sirve como carga de prueba reproducible para medir prefill y decodificación en `uor-r4-integer` (por ejemplo, los 12.630 tok/s de decodificación medidos en Apple M1).
- Docencia y demostración de paradigmas alternativos: útil para ilustrar las diferencias entre un modelo de tablas discretas y un transformer en charlas o materiales formativos, con artefactos pequeños (542 KB) y fáciles de distribuir.
- Auditoría de seguridad de instrucciones: el binario y el build WASM asociados permiten reproducir las auditorías de instrucciones prohibidas y de operaciones en coma flotante documentadas en la model card.
- Pruebas de integración del runtime `uor-r4-integer`: validación de la ruta `--discrete <ARTIFACT.lut> --prompt-ids <CSV>` en pipelines de CI del propio proyecto.

## Benchmarks y rendimiento

Los datos disponibles son medidas de fidelidad de exportación y de rendimiento de inferencia, no de calidad lingüística.

**Panel DEV de exportación** (1× RTX 5090, pod `vast-57845148`, commit `9f06e835…`, panel de 14.287 filas, brazo `t16-frozen-zero`, idéntico en ambas semillas):

| Metrica | Train | D11 | Delta |
|---|---:|---:|---:|
| top1 | 455 | 455 | 0 |
| top8 | 1.484 | 1.484 | 0 |
| admitted | 5.009 | 5.009 | 0 |
| loss_ta | 12.920.928 | 12.920.928 | 0 |
| loss_tr | 29.531.840 | 29.531.840 | 0 |

Paridad de filas 14.287 / 14.287, rechazadas 0, control de fallo plantado `B4` PASS, `exact_zero_gap: true`.

**Rendimiento en portátil** (Apple M1, prefill de 192 tokens + decodificación greedy de 64 tokens, 1 calentamiento + 20 ejecuciones cronometradas, alimentación de red):

| Semilla | Decodificacion mediana | Decodificacion p95 | Prefill mediano | Prefill p95 |
|---|---:|---:|---:|---:|
| 1 | 12.630 tok/s (5.067 µs) | 12.092 tok/s | 2.395.627 tok/s (80 µs) | 2.262.150 tok/s |
| 2 | 12.523 tok/s (5.110 µs) | 11.616 tok/s | 2.789.359 tok/s (68 µs) | 2.231.494 tok/s |

Advertencia de lectura: el top-1 de 455 / 14.287 (3,18%) está por debajo de la tabla unigram (1.226) y de la tabla T2 (6.300). No se ejecutó el panel sellado Fresh V2 sobre estos ficheros; los números de transferencia fresca (7.215 / 7.228) corresponden al artefacto de tronco de cierre, no a estas bases.

## Requisitos de hardware

- VRAM estimada para inferencia: 0 GB; el motor es entero nativo y no usa GPU.
- GPU recomendadas: ninguna necesaria. La medición de exportación se hizo en 1× RTX 5090, pero la inferencia documentada se ejecuta en CPU.
- Cabe en cualquier GPU consumer y en CPU: el artefacto pesa 542.260 bytes por semilla y el tokenizador 109.457 bytes.
- Despliegue: motor nativo `uor-r4-integer` mediante `uor-chat --discrete <ARTIFACT.lut> --prompt-ids <CSV> --temperature 0.0 --max-tokens N`. El build WASM de serving (`--features serving-wasm`) aún no sirve la familia `uor-r4.lut-discrete/1`; el soporte en navegador está en desarrollo en esta sesión de release.
- Latencia y throughput medidos en Apple M1: decodificación mediana de 5.067 µs (semilla 1) y 5.110 µs (semilla 2) para 64 tokens; prefill mediano de 80 µs y 68 µs respectivamente para 192 tokens.
- No se documentan opciones de despliegue con vLLM, llama.cpp, Ollama ni TGI; el modelo no es compatible con esos runtimes.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (modelos discretos de tablas de búsqueda con serving entero nativo). Las alternativas convencionales de tamaño similar (por ejemplo, modelos transformer de menos de 1 M de parámetros) no son comparables en arquitectura, formato ni paradigma de serving, y no se dispone de datos de benchmarks comunes para establecer una comparación rigurosa.

## Limitaciones y advertencias

- Modelo pre-alpha: no debe usarse en producción ni como asistente conversacional.
- La generación greedy tiende a repetir el identificador de token anterior; la salida no es texto coherente.
- El top-1 en DEV (3,18%) está por debajo de las tablas unigram y T2 del propio proyecto; no supera el criterio (d) del hito M1.
- Contexto muy limitado: 192 tokens.
- Solo inglés; sin capacidades multilingües documentadas.
- No soporta tool calling, agentes, visión, audio ni modo thinking.
- Requiere el runtime nativo `uor-r4-integer`; no es compatible con ecosistemas estándar (transformers, vLLM, llama.cpp, Ollama, TGI).
- El serving en navegador (WASM) aún no soporta esta familia de contenedores; el soporte está en desarrollo.
- Riesgo de alucinación no evaluado formalmente; al no generar texto coherente, la noción habitual de alucinación no aplica de forma directa, pero la salida no debe interpretarse como fiable.
- Sesgos conocidos: no documentados.
- Licencia MIT: permite uso comercial, pero la ausencia de calidad lingüística hace inviable cualquier aplicación comercial de generación de texto.
- El panel sellado Fresh V2 no se ejecutó sobre estos ficheros; los números de transferencia fresca del proyecto pertenecen al artefacto de tronco, no a estas bases.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/caseyallard/uor-r4-m1-discrete
- No se han encontrado en la información proporcionada enlaces adicionales a papers, blogs, repositorios o demos del proyecto.
