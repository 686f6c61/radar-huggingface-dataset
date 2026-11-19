# lxe/DeepSeek-V4.1-Flash-1017-dsx-mxfp4

## Resumen

DeepSeek-V4.1-Flash-1017-dsx-mxfp4 es una cuantización mixta del modelo DeepSeek-V4.1-Flash-1017, un transformer de tipo mezcla de expertos (MoE) con 552B parámetros totales más una tabla Engram separada de 196B. La publica el usuario lxe bajo licencia MIT como parte del ecosistema de runtime dsx, y su objetivo es hacer viable la inferencia de un modelo de esta escala en una única GPU AMD Instinct MI325X de 256 GiB de HBM, algo que el checkpoint original en FP8 (299 GB) no permite con holgura.

La innovación principal es la cuantización de precisión mixta: los pesos densos se mantienen en FP8 tal como vienen del checkpoint, el 59% de los expertos enrutados conservan sus pesos MXFP4 originales y el 41% restante, los menos utilizados, se comprimen a un codebook de 3 bits con escala e4m3 por cada 32 valores. El enrutamiento se mantiene exacto, sin poda de expertos ni sesgo de router, lo que preserva la calidad mucho mejor que las alternativas de 2-2,5 bits.

El resultado empaqueta el modelo en 270 GB repartidos en seis shards GGUF, más los shards Engram oficiales (203 GB) que se sirven desde NVMe y la caché de páginas del host. Frente al FP8 original, la degradación medida es de KL 0,049 y un top-1 del 90,6%, con una velocidad de decodificación de 110-114 tok/s entre 4K y 256K de contexto en una sola MI325X.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con tabla Engram separada y atención con indexador comprimido; MTP nativo de cinco tokens |
| Parametros totales | 552B (MoE) + 196B (Engram) |
| Parametros activos | no disponible |
| Longitud de contexto | hasta 256K tokens (medido a 4K, 128K y 256K) |
| Tipos de cuantizacion | Pesos densos FP8; 59% de expertos enrutados MXFP4; 41% en codebook de 3 bits con escala e4m3 cada 32; re-cuantización en carga a 3 bits adicional para perfil de código |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (6 shards, 270 GB) + shards Engram oficiales (203 GB) |
| Modelo base | deepseek-ai/DeepSeek-V4.1-Flash-1017 |
| Runtime | dsx `amd/` (Rust + HIP), API compatible con OpenAI y Anthropic, interfaz web |
| Hardware objetivo | 1x AMD Instinct MI325X (gfx942, 256 GiB HBM3E), ROCm 7, ~160 GB RAM, ~475 GB disco |
| Tamano del repo | 270,5 GB |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos de 552B parámetros con una tabla Engram independiente de 196B, que en esta build se sirve desde NVMe y la caché de páginas del host en lugar de residir en HBM. La atención incorpora un indexador que puntúa cada posición comprimida previa, lo que explica que el prefill se degrade con la longitud del prompt (1.640 tok/s a 4K y 16K, 1.160 tok/s a 128K). El checkpoint incluye además capas de visión y de draft, y un mecanismo MTP (multi-token prediction) nativo de cinco tokens que el perfil de código aprovecha para decodificación especulativa.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens, la composición de datos ni las etapas de RLHF o DPO del modelo base en la información proporcionada. Lo que sí documenta esta build es el proceso de cuantización: en lugar de reentrenar o calibrar con datos, se conservan los pesos MXFP4 originales de los expertos más usados y se ajusta un codebook de 3 bits para los menos usados, manteniendo el enrutamiento exacto. El runner permite además re-cuantizar en tiempo de carga expertos fríos adicionales a 3 bits para liberar espacio para drafts y sesiones concurrentes, sin necesidad de descargar ni exportar un GGUF nuevo.

## Capacidades

- Generación de texto y razonamiento con modo thinking activable y niveles de esfuerzo de razonamiento (reasoning effort).
- Razonamiento matemático de competición: en dos prompts de matemáticas competitivas generó 6.624 y 13.482 tokens con respuesta en caja, frente a los 5,6K y 21K del modelo alojado en las mismas entradas.
- Generación de código, con un perfil de servicio específico orientado a sesiones concurrentes de programación.
- Decodificación especulativa mediante verificación de las propuestas MTP nativas del checkpoint y prompt lookup.
- Servicio con API compatible con OpenAI y Anthropic, más interfaz web, a través del runtime dsx.
- Contexto largo de hasta 256K tokens con velocidad de decodificación prácticamente constante.
- Capacidades de visión presentes en el checkpoint base (capas de visión), aunque no se detalla su disponibilidad en esta build.
- Soporte multilingüe: no disponible en la información proporcionada.
- Tool calling y function calling: no disponible en la información proporcionada.

## Casos de uso

- Inferencia de un modelo de 552B en una sola GPU: el caso central de esta build es servir DeepSeek-V4.1-Flash en un nodo con una MI325X, sin necesidad de un clúster multi-GPU, gracias a los 270 GB en HBM más los Engram en NVMe. Adecuado para laboratorios con hardware AMD que quieran evaluar el modelo a escala completa.
- Razonamiento matemático y científico de cadena larga: el modelo genera respuestas de más de 13.000 tokens con modo thinking, lo que encaja en tareas de demostración, verificación formal y resolución de problemas de competición donde se necesita un presupuesto de razonamiento amplio.
- Análisis de documentos extensos: con 256K de contexto y una decodificación de 110 tok/s sostenida a esa longitud, es viable procesar contratos, informes o bases de código completas en una sola pasada sin truncar.
- Servicio de código en equipo: el perfil de código re-cuantiza expertos fríos para liberar HBM y permite cuatro sesiones concurrentes a 102-108 tok/s por sesión, útil para un servidor interno de asistencia de programación con varios desarrolladores.
- Sustitución de API propietaria en pipelines internos: al exponer endpoints compatibles con OpenAI y Anthropic, se puede apuntar código existente al runner dsx sin reescribir clientes, útil para prototipado y evaluación comparativa frente a modelos alojados.
- Evaluación de cuantizaciones: con métricas publicadas de KL, top-1 y perplejidad frente al FP8 original, sirve como referencia para estudiar el impacto de la precisión mixta en modelos MoE de gran escala.
- Investigación sobre enrutamiento de expertos: al mantener enrutamiento exacto y documentar la distribución MXFP4/3-bit, es una base para experimentos sobre sensibilidad de expertos a la cuantización.

## Benchmarks y rendimiento

Calidad medida sobre el conjunto de evaluación Lucebox 1017 (8 × 1.024 tokens contra los top-256 log-probs del modelo FP8, teacher-forced a través del decodificador):

| Modelo | Tamano | KL ↓ | Top-1 ↑ | Perplejidad ↓ |
|---|---:|---:|---:|---:|
| FP8 / FP4 original | 299 GB | 0 | 100% | 8,56 |
| dsx MXFP4 + 3-bit | 270 GB | 0,049 | 90,6% | 8,71 |
| Lucebox ROCMFP23S | 179 GiB | 0,194 | 81,3% | 9,41 |
| Lucebox ROCMFP 2.5 bpw | 158 GiB | 0,253 | 78,7% | 9,78 |
| dsx-ud (NVIDIA) | 142 GB | 0,269 | 78,9% | 10,13 |
| dsx-2bit (NVIDIA) | 148 GB | 0,373 | 74,4% | 10,68 |

Velocidad en una MI325X (256 GiB HBM3E), greedy y enrutamiento exacto:

| Contexto | Decodificación |
|---|---:|
| 4K | 114,1 tok/s |
| 128K | 111,5 tok/s |
| 256K | 110,4 tok/s |

| Prompt | Prefill |
|---|---:|
| 4K tokens | 1.640 tok/s |
| 16K tokens | 1.640 tok/s |
| 128K tokens | 1.160 tok/s |

Perfil de código (MTP nativo + prompt lookup, temperatura 0,1, thinking off): 102-108 tok/s por sesión en dos replays de cuatro sesiones, 246 tok/s en una sesión única y unos 61 tok/s por sesión con ocho sesiones (486 en total). Su calidad procede de una evaluación anterior con la misma colocación de expertos: KL top-256 0,076-0,083 y top-1 ~88,3%. No se han publicado resultados de MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- GPU: una AMD Instinct MI325X (gfx942, 256 GiB HBM3E) con ROCm 7.
- RAM del host: aproximadamente 160 GB para los Engram y la caché de páginas.
- Disco: aproximadamente 475 GB para los seis shards GGUF y los shards Engram oficiales.
- No cabe en GPU de consumo: el tamaño mínimo de esta build (270 GB más 203 GB de Engram) excede cualquier GPU consumer, incluidas RTX 4090 o 5090.
- Alternativas para escritorio NVIDIA: dsx-t16 (252 GB, 2× 24 GB de VRAM + 128 GB de RAM, 34,9 tok/s), dsx-ud (305 GB) y dsx-2bit (148 GB más Engram).
- Despliegue: runtime dsx `amd/` (Rust + HIP), con endpoints compatibles con OpenAI y Anthropic e interfaz web. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: 110-114 tok/s de decodificación a 4K-256K y 1.160-1.640 tok/s de prefill; el prefill se ralentiza con la longitud del prompt por el indexador de atención.

## Comparativa con modelos similares

| Build | Hardware objetivo | Tamano | KL / top-1 vs FP8 | Decodificación |
|---|---|---|---:|---:|
| dsx-mxfp4 (esta) | 1x AMD MI325X (256 GiB) | 270 GB + Engram 203 GB | 0,049 / 90,6% | 110-114 tok/s |
| dsx-t16 | 2x 24 GB NVIDIA + 128 GB RAM | 252 GB en un archivo | 0,196 / 80,9% | 34,9 tok/s (36,8 con `--defer-rank 3`) |
| dsx-ud | 2x 24 GB NVIDIA + 128 GB RAM | 305 GB | 0,272 / 79,0% | 27-29,5 tok/s (32-36 con `--defer-rank 3`) |
| dsx-2bit | 2x 24 GB NVIDIA + 128 GB RAM | 148 GB + Engram 203 GB | 0,373 / 74,4% | ~29 tok/s (35,7 con `--defer-rank 3`) |

Frente a las cuantizaciones de terceros, Lucebox ROCMFP23S (179 GiB, KL 0,194, top-1 81,3%) y Lucebox ROCMFP 2.5 bpw (158 GiB, KL 0,253, top-1 78,7%) ofrecen menor huella pero peor fidelidad. Todas las builds dsx requieren el runtime dsx; no se dispone de comparación con modelos de otros desarrolladores en la información proporcionada.

## Limitaciones y advertencias

- La calidad se degrada respecto al FP8 original: KL 0,049, top-1 90,6% y perplejidad 8,71 frente a 8,56. Aceptable para muchas tareas, pero no idéntico al checkpoint.
- Los Engram no residen en HBM: dependen de NVMe y de la caché de páginas del host, lo que puede introducir latencia variable y exige disco rápido y ~160 GB de RAM.
- El prefill se ralentiza con prompts largos (1.160 tok/s a 128K frente a 1.640 tok/s a 4K) por el coste del indexador de atención.
- Las mediciones de velocidad no se tomaron todas con la misma revisión del runtime, y existe una comprobación de exactitud de decodificación sin resolver según la documentación del proyecto.
- Las cifras de calidad del perfil de código provienen de una evaluación anterior con la misma colocación de expertos, no de una evaluación fresca de la build final.
- El resultado puede variar ligeramente entre ejecuciones (KL 0,047 en otra tirada) por el orden no determinista de las sumas con atómicas en coma flotante, que altera elecciones de expertos casi empatadas.
- El perfil de código re-cuantiza expertos a 3 bits en tiempo de carga, lo que reduce la calidad (top-1 ~88,3%) a cambio de concurrencia.
- Dependencia de un runtime específico (dsx) y de hardware AMD MI325X con ROCm 7; no hay soporte documentado para vLLM, llama.cpp u Ollama.
- Idiomas soportados, sesgos y tasas de alucinación del modelo base: no disponible en la información proporcionada.
- Licencia MIT en esta build, pero conviene verificar los términos del modelo base DeepSeek-V4.1-Flash-1017 para uso comercial.

## Enlaces

- Hugging Face (esta build): https://huggingface.co/lxe/DeepSeek-V4.1-Flash-1017-dsx-mxfp4
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Build dsx-t16: https://huggingface.co/lxe/DeepSeek-V4.1-Flash-1017-dsx-t16
- Build dsx-ud: https://huggingface.co/lxe/DeepSeek-V4.1-Flash-1017-dsx-ud
- Build dsx-2bit: https://huggingface.co/lxe/DeepSeek-V4.1-Flash-1017-dsx-2bit
- Repositorio del runtime dsx: https://github.com/lxe/dsx
- README del runner AMD: https://github.com/lxe/dsx/blob/main/amd/README.md
- Estado de mediciones: https://github.com/lxe/dsx/blob/main/docs/current-state.md
- Conjunto de evaluación Lucebox 1017: https://huggingface.co/Lucebox/DeepSeek-V4.1-Flash-1017-ROCMFP-GGUF
