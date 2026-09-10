# faysalbenahmed/AMF-G1-4B-Experimental

## Resumen

AMF G1 — 4B Experimental es un checkpoint derivado de Qwen/Qwen3-4B-Instruct-2507 (revisión `cdbee75f17c01a7cc42f958dc650907174af0554`), publicado por Fayçal Benahmed (Stack Moderne, Francia) bajo el paraguas del proyecto de investigación AI Mission Foundry (AMF). No se presenta como un modelo de propósito general ni como un producto: el propio autor lo describe como «la primera evidencia material del proceso de fabricación neuronal de AMF», es decir, la prueba física de que su pipeline es capaz de producir un artefacto neural aprendido. Sobre el modelo base se aplicó un entrenamiento LoRA supervisado (rango 16, learning rate 4e-5, 72 pasos, semilla 190901) seguido de un merge seguro, dando lugar a un checkpoint de 4.022.468.096 parámetros (aproximadamente 4,02 B) en safetensors y a una derivación GGUF Q5_K_M.

Su relevancia es metodológica más que de capacidad. La model card documenta explícitamente que el modelo se generó antes de que el bucle autónomo de optimización y reparación (REPAIR) de AMF estuviera correctamente implementado, y que la suite de cualificación sellada DEV arrojó `quality_state: FAIL_OBSERVED` con un `qualified_output` de 0,3472, por lo que `MODEL_CAPABILITY_QUALIFIED = NO` y `PRODUCTION RECOMMENDED = NO`. Se conserva el fallo como parte del registro de investigación.

Como experimento de ingeniería, el autor sí reporta resultados positivos en dos comprobaciones acotadas: una recarga en frío canónica, ejecución local en BF16 y la derivación y ejecución local del GGUF Q5_K_M, además de un *gate* de comportamiento local de 15/15. El interés para un desarrollador o investigador está en el artefacto, la trazabilidad de hashes SHA256 y la metodología de fabricación, no en el rendimiento del modelo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | transformer denso, heredada de Qwen/Qwen3-4B-Instruct-2507; adaptación mediante LoRA supervisado (rango 16) con merge seguro |
| Parámetros totales | 4.022.468.096 (4,02 B), dato real de safetensors |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la información proporcionada (no se declara en la ficha; se hereda del modelo base, cuyo valor no se especifica en el material disponible) |
| Tipos de cuantización | BF16 canónico (verificado); GGUF Q5_K_M (verificado, 2,69 GiB). No se documentan otras cuantizaciones |
| Idiomas soportados | no disponible (la ficha no declara lista de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y GGUF (Q5_K_M) |
| Modelo base | Qwen/Qwen3-4B-Instruct-2507, revisión `cdbee75f17c01a7cc42f958dc650907174af0554` |
| Pipeline | text-generation |
| Librería | transformers |
| Tamaño del repositorio | 10,9 GB |
| Compatibilidad declarada | text-generation-inference, endpoints_compatible |
| Descargas / likes | 0 / 0 |
| Fecha de creación / actualización | 2026-09-10 / 2026-09-10 |

### Identidad del artefacto (SHA256 declarados por el autor)

| Artefacto | SHA256 |
|---|---|
| Archivo de transporte G1 canónico | `413ef141957d3dc4e3ec431a02bc37f4e02b0649c8d0cb61883de385ab86cb76` |
| Artefacto G1 interno | `9ee32a40e2aec3fe329fcef7f4c7fbe11444781c28fa14660d735df5ef7cebfa` |
| GGUF Q5_K_M | `9cb29f9b6c1fffc6d8bf749c15f25b050c2c85569f5abfc7a888e099ea5e56a2` |
| Recibo del dataset de entrenamiento | `666462534451178582d29eb2214697bc9dbc1598bcf27b843b438f64ee2f0182` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Qwen3-4B-Instruct-2507, un transformer denso de 4,02 B de parámetros. AMF no modifica la topología: aplica un ajuste LoRA supervisado con rango 16 y learning rate 4e-5 durante 72 pasos con semilla 190901, y después ejecuta un merge seguro que materializa un checkpoint derivado independiente. No se documenta en la información disponible ningún cambio de tokenizador, de ventana de atención, ni innovaciones como decodificación especulativa, atención lineal o capas SSM.

Los datos de entrenamiento no están descritos. El recibo de dataset disponible (RC1) solo registra `split = train` y `final_access = NONE`, y el propio autor indica que el recibo archivado no contiene una declaración de procedencia textual más completa, por lo que la release no formula afirmaciones adicionales sobre el origen de los datos. No se reporta uso de RLHF ni de DPO, ni número de tokens de entrenamiento. La innovación técnica destacable del artefacto no está en el modelo, sino en el proceso: el pipeline de AMF (medición de capacidad, identificación de brecha, fabricación de un candidato aprendido, remedición, análisis del fallo residual, elección del locus de reparación y reparación iterativa). En este caso, el bucle se detuvo en la fase de fallo —`MEASURE -> IDENTIFY CAPABILITY GAP -> FABRICATE G1 -> REMEASURE -> FAIL -> STOP`—, por lo que G1 es el primer candidato fabricado de un bucle incompleto.

Adicionalmente, el autor documenta la transformación de despliegue: el modelo BF16 canónico se transportó a un portátil de consumo y se ejecutó en inferencia solo-CPU, y a partir de ahí se generó la derivación GGUF Q5_K_M, también ejecutada localmente. El gate de comportamiento local (probes de `SUPPORTED_FACTS`, `MISSING_EVIDENCE`, `CONTRADICTION`, `STRICT_SCHEMA` y `EXACT_EVIDENCE_FIDELITY`, cada una repetida tres veces) dio 15/15 aciertos exactos con fidelidad de evidencia exacta PASS, aunque el autor aclara que ese gate no es la suite sellada de cualificación AMF DEV/ROB/OOD y no cambia el estado de cualificación del modelo.

## Capacidades

- Generación de texto conversacional: el modelo es un derivado de instrucciones del Qwen3-4B-Instruct-2507, con pipeline `text-generation`.
- Cumplimiento de esquemas estrictos: el gate local incluyó la sonda `STRICT_SCHEMA`, superada en las tres repeticiones (15/15 en el conjunto de sondas).
- Manejo de hechos soportados y ausencia de evidencia: sondas `SUPPORTED_FACTS` y `MISSING_EVIDENCE` incluidas en el gate local.
- Detección de contradicciones: sonda `CONTRADICTION` incluida en el gate local.
- Fidelidad literal de evidencia: sonda `EXACT_EVIDENCE_FIDELITY` con resultado PASS en el gate local; no obstante, falló en el smoke test original (véase Limitaciones).
- Capacidad general declarada: `MODEL_CAPABILITY_QUALIFIED = NO`. El autor no reclama ninguna capacidad de producción; no se documentan capacidades de código, matemáticas, visión, audio, tool calling, function calling, agentes ni multilingüismo.
- Modo *thinking*: no disponible en la información proporcionada.
- Idiomas: no disponible (no se declara lista de idiomas soportados).

## Casos de uso

Dado que el modelo no está cualificado para producción, los casos siguientes son de investigación, ingeniería de pipelines y evaluación, no de despliegue comercial.

- Reproducibilidad de pipelines de fabricación de modelos: usar G1 como artefacto de referencia para verificar un pipeline propio de LoRA + merge, comparando los SHA256 internos y del archivo de transporte declarados por el autor.
- Auditoría de procedencia y trazabilidad: el repositorio publica hashes del artefacto, del GGUF y del recibo de dataset; sirve como caso de estudio de cómo documentar (y cómo no documentar) la procedencia de un checkpoint derivado.
- Investigación sobre bucles de reparación automática: G1 es el punto de partida declarado para el futuro bucle REPAIR de AMF; un equipo que investigue optimización autónoma de modelos puede usarlo como caso etiquetado con fallo conocido (`FAIL_OBSERVED`, 0,3472).
- Evaluación de fidelidad literal de evidencia: el fallo documentado `Sarah Klein -> sarah klien` es un ejemplo etiquetado de error de superficie exacta, útil para construir y validar detectores de errores de fidelidad en modelos pequeños.
- Pruebas de cuantización y toolchain GGUF: la derivación Q5_K_M (2,69 GiB) y su ejecución en CPU con throughput medido permiten validar cadenas de conversión y perfiles de memoria en hardware modesto.
- Prototipado de despliegue local en CPU: con ~3,04 GiB de RSS pico y 0 swap en un AMD Ryzen 5 8540U, sirve para probar integraciones de inferencia local sin GPU antes de invertir en hardware.
- Validación de gates de comportamiento en despliegue: el conjunto de sondas (hechos soportados, evidencia ausente, contradicción, esquema estricto, fidelidad exacta) es reutilizable como plantilla de micro-evaluación para modelos derivados.
- Docencia y divulgación sobre cualificación de modelos: ilustra la diferencia entre un artefacto materializado y un modelo cualificado, con métricas explícitas de fallo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra suite estándar. Los únicos resultados numéricos son internos de AMF y de sus pruebas de despliegue local:

| Métrica | Resultado | Contexto |
|---|---|---|
| `quality_state` | FAIL_OBSERVED | suite DEV sellada de AMF (unidad de medida no especificada en la información) |
| `qualified_output` | 0,3472 | suite DEV sellada; escala no especificada |
| `latency_p95_s` | 4,4042 s | suite DEV sellada; hardware no especificado |
| `MODEL_CAPABILITY_QUALIFIED` | NO | conclusión de cualificación |
| Gate de comportamiento local (exactos) | 15 / 15 (tasa 1,000) | 5 sondas × 3 repeticiones; protocolo nuevo, no replay del smoke histórico |
| Fidelidad de evidencia exacta (gate local) | PASS | protocolo nuevo |
| Fidelidad de superficie (smoke test original) | FAIL | evidencia `Sarah Klein` → salida `sarah klien` |
| Throughput de prompt (GGUF Q5_K_M, CPU) | 11,73 ± 0,35 tokens/s | AMD Ryzen 5 8540U, 6 hilos |
| Throughput de generación (GGUF Q5_K_M, CPU) | 5,68 ± 1,17 tokens/s | AMD Ryzen 5 8540U, 6 hilos |
| RSS pico (Q5_K_M, CPU) | ~3,04 GiB | swap 0; tamaño del modelo 2,69 GiB |
| Recarga en frío canónica | PASS | estado declarado por el autor |
| Ejecución local BF16 | PASS | estado declarado por el autor |
| Gate de comportamiento en despliegue local | PASS — 15/15 | estado declarado por el autor |
| Bucle completo de optimización / REPAIR | NO usado | limitación experimental declarada |
| Cualificación de modelo / sistema | NO | estado declarado por el autor |

## Requisitos de hardware

- BF16 (pesos canónicos): aproximadamente 8,05 GB solo de pesos (4,022 B × 2 bytes) más overhead de activaciones y caché KV; se estima un consumo de VRAM en el rango de 10-12 GB (estimación, no medida en la información disponible).
- GGUF Q8_0: aproximadamente 4,3 GB de pesos (estimación).
- GGUF Q5_K_M: 2,69 GiB medidos; se ejecutó en CPU con un RSS pico de ~3,04 GiB y 0 swap.
- GGUF Q4_K_M: aproximadamente 2,4 GB de pesos (estimación).
- GPUs de consumo: el modelo en BF16 debería caber con holgura en GPUs de 12-16 GB o más (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 Ti Super, RTX 4090); en cuantizaciones Q5/Q4 cabría en GPUs de 6-8 GB. No se ha verificado ninguna de estas configuraciones en la información disponible salvo la ejecución en CPU.
- Ejecución en CPU: verificada en un AMD Ryzen 5 8540U con 6 hilos, sin GPU y sin swap.
- GPUs de datacenter: no se reporta ningún despliegue en A100, H100 u otras aceleradoras; la información solo menciona una ejecución local en portátil de consumo.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference`), endpoints compatibles (tag `endpoints_compatible`), llama.cpp / Ollama / LM Studio mediante el GGUF Q5_K_M. No se documentan despliegues con vLLM ni SGLang.
- Latencia y throughput: `latency_p95_s` de 4,4042 s en la suite sellada de AMF (hardware no especificado); en CPU con Q5_K_M, 11,73 ± 0,35 tokens/s de prompt y 5,68 ± 1,17 tokens/s de generación.

## Comparativa con modelos similares

La información proporcionada no incluye comparativas de rendimiento. La tabla siguiente compara únicamente características estructurales; los datos del modelo base y de las alternativas proceden de su documentación pública y no forman parte del material aportado sobre G1. No hay cifras de benchmarks disponibles para ninguno de ellos en esta ficha.

| Modelo | Parámetros | Contexto | Licencia | Estado de cualificación / disponibilidad |
|---|---|---|---|---|
| AMF G1 — 4B Experimental | 4,02 B | no disponible en la información proporcionada | Apache 2.0 | FAIL_OBSERVED; no recomendado para producción; 0 descargas, 0 likes |
| Qwen/Qwen3-4B-Instruct-2507 (base) | 4,02 B | no disponible en el material aportado | Apache 2.0 | modelo base publicado por el proveedor |
| Alternativas de ~3-4 B de la misma categoría (p. ej. otros derivados instruct de 3-4 B) | no disponible | no disponible | no disponible | no disponible: no se identifican en la información proporcionada modelos comparables con datos verificables |

No se dispone de comparaciones de MMLU, HumanEval, GSM8K ni de ninguna otra métrica frente a alternativas.

## Limitaciones y advertencias

- Cualificación fallida: la suite sellada DEV registró `quality_state: FAIL_OBSERVED` con `qualified_output = 0,3472`, y el autor declara `MODEL_CAPABILITY_QUALIFIED = NO` y `PRODUCTION RECOMMENDED = NO`. No debe usarse en producción.
- Bucle de optimización incompleto: el autor indica explícitamente que G1 se fabricó antes de que el bucle de optimización y REPAIR de AMF estuviera correctamente implementado; el bucle se detuvo en el fallo medido.
- Error de fidelidad de superficie documentado: en el smoke test original, la evidencia `Sarah Klein` produjo la salida `sarah klien`. Es un fallo real de fidelidad literal, relevante en tareas donde la copia exacta de cadenas sea crítica.
- Riesgo de alucinación: no se ha medido ni cuantificado en la información disponible. El fabricante no aporta tasas de alucinación ni evaluaciones de veracidad.
- Sesgos: no se documenta ninguna evaluación de sesgos, toxicidad o seguridad.
- Idiomas: no se declara lista de idiomas soportados; no se puede asumir cobertura multilingüe.
- Contexto: no se declara la longitud de contexto del modelo en la información disponible.
- Procedencia del dataset: el recibo archivado solo registra `split = train` y `final_access = NONE`; el propio autor señala que no hay una declaración de procedencia textual más completa, por lo que la composición del dataset de entrenamiento es desconocida.
- Licencia: Apache 2.0, heredada del modelo base, que permite uso comercial; sin embargo, la licencia no implica idoneidad técnica y el autor desaconseja explícitamente el uso en producción.
- Ausencia de validación externa: 0 descargas y 0 likes, sin evaluaciones de terceros ni resultados replicados de forma independiente.
- Gate local no equivalente a cualificación: los 15/15 del gate de comportamiento local usan un protocolo nuevo y no la suite sellada AMF DEV/ROB/OOD; no modifican el estado de cualificación del modelo.
- Reproducibilidad: el autor publica hashes SHA256 del artefacto y del recibo de dataset, pero la revisión del modelo base se cita como identificador de commit, no como enlace verificado en el material aportado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/faysalbenahmed/AMF-G1-4B-Experimental
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Proyecto y atribución (Stack Moderne / AMF, Fayçal Benahmed): https://stack-moderne.fr/
- Papers, blogs técnicos, repositorios de código y demos: no disponible en la información proporcionada.
- Búsqueda web: los resultados devueltos no guardan relación con el modelo (foros en árabe sin vinculación con AMF, Qwen o inteligencia artificial); no se ha encontrado ningún enlace adicional relevante.
