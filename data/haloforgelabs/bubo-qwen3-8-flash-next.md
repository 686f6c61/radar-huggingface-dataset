# HaloForgeLabs/bubo-qwen3.8-flash-next

## Resumen
Bubo Qwen3.8 Flash Next es un conjunto de ficheros GGUF auxiliares publicados por HaloForge Labs para su runtime de inferencia Halowin Bubo 0.1.2, orientado a equipos con APU AMD Strix Halo (128 GB de memoria unificada) sobre Windows. No es un modelo completo: el repositorio contiene un "gemelo denso" (dense twin) para los shards abliterados de Huihui, un gemelo denso equivalente para los shards originales de Qwen y una cabeza de salida Q4_K para los pasos de decodificación especulativa MTP (Multi-Token Prediction). Para funcionar requiere además los cuatro shards `UD-Q4_K_XL` del modelo Qwen3.8 Flash Next y el predictor MTP.

El modelo subyacente es Qwen3.8 Flash Next, en su variante abliterada generada por huihui-ai, que elimina parte de los mecanismos de rechazo del modelo original. Los ficheros de este repositorio actúan como aceleradores de decodificación y verificación: mejoran el throughput en el perfil exacto de hardware soportado y sirven de cabezas de borrador para la decodificación especulativa. El gemelo base (no abliterado) procede de la misma receta y matriz de importancia, y difiere del gemelo Huihui en 84 de sus 252 tensores.

La relevancia actual es acotada pero concreta: es una pieza de infraestructura para ejecutar modelos grandes en hardware consumer de memoria unificada (APUs AMD) sin GPU dedicada, un nicho en crecimiento. La licencia declarada es Qwen Community 1.0, heredada del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (el modelo base Qwen3.8 Flash Next emplea mezcla de expertos y proyecciones SSM segun los tensores citados; la arquitectura exacta no se detalla) |
| Parametros totales | 2.312.110.080 (dato del repositorio en safetensors; corresponde al recuento del modelo base, no a los ficheros GGUF auxiliares) |
| Parametros activos | No disponible |
| Longitud de contexto | 200.000 tokens por defecto en Bubo (contexto configurable; reducible con KV cache en Q8) |
| Tipos de cuantizacion | IQ4_XS, IQ4_NL, Q4_K, imatrix; ficheros del repo en Q4_K e IQ4 variantes |
| Idiomas soportados | No disponible |
| Licencia | Qwen Community 1.0 (declarada como `other` con `license_name: qwen-community-1.0`) |
| Formato de pesos | GGUF (safetensors solo como metadato del recuento de parametros) |

## Arquitectura y entrenamiento
El repositorio no entrena ningún modelo: publica artefactos de cuantización y decodificación derivados del modelo base. El gemelo denso (`twin/iq4-nofullattn-nohc.gguf`, 1.230.788.768 bytes) se genera con la misma receta y matriz de importancia que el gemelo base, y se usa para acelerar la decodificación y la verificación fuera del perfil exacto. La cabeza de borrador (`draft_head/draft-out-q4k.gguf`, 357.581.248 bytes) es una cabeza de salida Q4_K empleada únicamente en los pasos de borrador MTP. El gemelo base (`twin-base/iq4-nofullattn-nohc.gguf`) está pensado para los shards originales no abliterados de Qwen.

La innovación técnica principal es la decodificación especulativa con MTP combinada con un gemelo denso que actúa como verificador rápido, más una variante de atención sin atención completa (`nofullattn`) y sin ciertas proyecciones (`nohc`). Según las mediciones del autor sobre el modelo original, el stack MTP con gemelo y cabeza de borrador eleva la decodificación de 46,06 a 51,76 tok/s (+12,4 %) en un portátil a unos 70 W. No se detallan los datos de entrenamiento del modelo base (número de tokens, composición del dataset, RLHF/DPO) porque no están en la información proporcionada.

## Capacidades
- Generación de texto en prosa, código Python y C++ (medido en el perfil Strix Halo).
- Sesiones de agente largas con escritura sostenida (66,2 tok/s medidos).
- Edición de código y renombrado (109,0 tok/s en modo greedy).
- Lectura de prompts largos: 1.415 tok/s con prompt de 32K, hasta 1.639 tok/s en modo rápido experimental.
- Decodificación especulativa MTP con cabeza de borrador dedicada.
- Variante abliterada: reduce los rechazos del modelo original.
- Capacidades del modelo base (tool calling, razonamiento, multilingüismo, visión, etc.): no disponibles en la información proporcionada.

## Casos de uso
- Asistente de código en portátil con APU AMD Strix Halo: el conjunto permite ejecutar Qwen3.8 Flash Next con contexto de 200.000 tokens en un equipo de 128 GB de memoria unificada, sin GPU dedicada, usando el gemelo y la cabeza de borrador para acelerar la decodificación en tareas de edición y renombrado.
- Agentes de larga duración en local: la ventana de 200.000 tokens y el rendimiento sostenido en escritura (66,2 tok/s) permiten mantener sesiones de agente multi-turno con historial extenso en una sola máquina.
- Lectura y análisis de documentos largos: los 1.415 tok/s en prompts de 32K hacen viable el prellenado de contratos, informes o bases de código extensas antes de la generación.
- Sustitución del gemelo por el base para modelos no abliterados: quien use los shards originales de Qwen puede emplear `twin-base` con la misma cabeza de borrador, manteniendo el pipeline de decodificación especulativa.
- Despliegue en equipos de 96 GB con variantes de menor memoria: los ficheros ISTA IQ3_S, IQ3_XXS e IQ2_XS (64, 57 y 50 GiB respectivamente a 200.000 tokens) permiten ejecutar el modelo en máquinas con menos memoria unificada.
- Investigación sobre abliteración y control de rechazos: la variante Huihui permite estudiar el comportamiento del modelo con los mecanismos de rechazo reducidos, comparándola con el gemelo base sobre los mismos tensores.

## Benchmarks y rendimiento
Rendimiento medido por el autor con Bubo 0.1.2, conjunto Huihui, portátil Strix Halo a unos 70 W, thinking activado, temperatura 1.0 (fila de edición en greedy):

| Tarea | tok/s |
|---|---:|
| Prosa | 57,1 |
| Código Python | 66,3 |
| Código C++ | 77,5 |
| Sesión de agente larga, escritura | 66,2 |
| Edición de código, renombrado | 109,0 |
| Lectura de prompt de 32K | 1.415 |
| Lectura de prompt de 32K, modo rápido (experimental) | 1.639 |

Medido con el gemelo y la cabeza de borrador sobre el modelo original:

| Comprobación | Resultado |
|---|---|
| Decodificación, seis sondas de tarea, stack MTP sin y con gemelo y cabeza, a ~70 W (build anterior) | 46,06 a 51,76 tok/s (+12,4 %) |
| Texto de agente, ratio de perplejidad frente a referencia de 6 bits | 1,0102 |
| Texto de agente, token superior coincide con la referencia | 96,4 % de posiciones |
| Código, ratio de perplejidad frente a referencia de 6 bits | 1,0087 |
| Código, token superior coincide con la referencia | 97,0 % de posiciones |

Comparación de velocidad de lectura de prompt frío de 32K en Bubo 0.1.2: el build de menor memoria alcanza 1.353 tok/s frente a 1.201,8 tok/s del fichero ISTA IQ3_S, con unos 4 GiB más de memoria GPU. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware
- VRAM/memoria: el conjunto está pensado para 128 GB de memoria unificada; en máquinas de 96 GB se recomienda el build de menor memoria o los ficheros ISTA. Memoria estimada a 200.000 tokens y una sesión: unos 64 GiB para IQ3_S, 57 GiB para IQ3_XXS, 50 GiB para IQ2_XS y 41 GiB para el Coder (medidos en una máquina de 128 GB). El build de menor memoria necesita unos 4 GiB más que IQ3_S.
- GPU recomendadas: AMD Strix Halo con 128 GB (principalmente portátiles). En máquinas de 96 GB, configurar Variable Graphics Memory a 72 GB (mínimo 64 GB) desde AMD Software: Adrenalin Edition y reiniciar.
- GPU consumer dedicadas: no disponibles; el autor no documenta soporte para A100, H100 ni RTX 4090.
- Despliegue: aplicación Halowin Bubo 0.1.2 y comando `bubo prepare`; opción de KV cache en Q8 (`--kv-cache-type q8_0`) que reduce el caché de contexto un 47 %.
- Latencia y throughput: ver tabla de benchmarks; valores medidos en un portátil a unos 70 W.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Bubo Qwen3.8 Flash Next (este repo) | 2,31 B (recuento del base) | 200.000 tokens | 57,1-109,0 tok/s en Strix Halo | Qwen Community 1.0 | GGUF en Hugging Face |
| bubo-qwen3.8-flash-next-lower-memory | Mismo base | 200.000 tokens | 1.353 tok/s en lectura de 32K; +4 GiB frente a IQ3_S | Qwen Community 1.0 | GGUF en Hugging Face |
| ISTA IQ3_S (variante de menor memoria) | Mismo base | 200.000 tokens | 1.201,8 tok/s en lectura de 32K; ~64 GiB | Qwen Community 1.0 | GGUF |
| huihui-ai/Huihui-Qwen3.8-Flash-Next-abliterated-GGUF | Mismo base | No disponible | No disponible | No disponible | GGUF en Hugging Face |

Las alternativas comparadas son variantes del mismo modelo base, no modelos de otros autores; no se dispone de datos de modelos comparables de terceros en la información proporcionada.

## Limitaciones y advertencias
- El modelo base es una versión abliterada: reduce los rechazos y puede producir contenido sensible o inapropiado; la responsabilidad de uso recae en el usuario.
- Los ficheros de este repositorio no sustituyen al modelo principal: requieren los cuatro shards `UD-Q4_K_XL` de Qwen3.8 Flash Next y el predictor MTP.
- Soporte limitado a AMD Strix Halo con 128 GB en Windows; el autor no garantiza funcionamiento en otras máquinas.
- Los valores para máquinas de 96 GB son calculados, no medidos: Bubo no se ha probado en una máquina de 96 GB.
- Riesgo de alucinación: no documentado en la información disponible, pero inherente a los modelos generativos.
- Sesgos e idiomas soportados: no disponibles en la información proporcionada.
- Restricciones comerciales: sujetas a la licencia Qwen Community 1.0, que debe consultarse antes de uso en producción.
- Las comprobaciones de calidad son teacher-forced y no cubren evaluaciones de razonamiento o seguridad.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/HaloForgeLabs/bubo-qwen3.8-flash-next
- Build de menor memoria: https://huggingface.co/HaloForgeLabs/bubo-qwen3.8-flash-next-lower-memory
- Modelo base abliterado: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-Flash-Next-abliterated-GGUF
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Shards originales GGUF: https://huggingface.co/unsloth/Qwen3.8-Flash-Next-GGUF
- Repositorio del runtime: https://github.com/haloforge-labs/bubo
- Benchmarks: https://haloforgelabs.com/benchmarks
