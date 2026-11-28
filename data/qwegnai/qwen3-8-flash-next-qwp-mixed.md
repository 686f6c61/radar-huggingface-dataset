# qwegnai/Qwen3.8-Flash-Next-QWP-Mixed

## Resumen

Qwen3.8-Flash-Next-QWP-Mixed es un paquete de pesos cuantizados del modelo Qwen3.8-Flash-Next de Qwen, empaquetado por el usuario qwegnai para el motor de inferencia Qwegn, un runtime escrito en Swift y Metal 4 especificamente disenado para Apple Silicon. No se trata de un modelo nuevo ni de un fine-tune, sino de una conversion de los pesos originales a los contenedores propietarios QWP1 y QNGRAM v3, con una mezcla de cuantizacion Hadamard (HQ8_G32 en el tronco denso y HQ4_G64 en los expertos MoE enrutados) y una tabla de embeddings por capa (PLE) comprimida a 2 bits mediante codebook esferico e-means.

El modelo base es un MoE hibrido de 48 capas y 128.800 millones de parametros en el backbone, con 12 capas de Query-Aware Sparse Attention (QSA) y 36 capas Gated-DeltaNet (GDN), 512 expertos con 10 enrutados y 1 compartido activos, conexiones hiper (Hyper-Connections) de 4 ramas, embeddings PLE de 4-gramas, cabeza MTP-3 y torre de vision. La ventana de contexto nativa es de 262.144 tokens, verificada hasta 1.048.576 tokens con QSA/LSA nativo.

La relevancia de este paquete es practica: reduce el almacenamiento total de 122,15 GiB a 98,42 GiB (-23,73 GiB) para que la tabla PLE completa quepa residente en la RAM unificada de un Mac de 128 GB, con velocidades de decodificacion especulativa de 95,1-113,7 tok/s en texto novedoso y 145,4 tok/s en texto predecible. Es, por tanto, un artefacto de despliegue para un hardware y un runtime muy concretos, no un checkpoint portable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE hibrido: 48 capas (12 QSA + 36 GDN), 512 expertos (10 enrutados + 1 compartido activos), 4-branch Hyper-Connections, PLE de 4-gramas, MTP-3, torre de vision |
| Parametros totales | 128,80 B en el backbone `.qwp` + 320.001.536 x 160 filas N-gram PLE |
| Parametros activos | 10 expertos enrutados + 1 compartido por token (no se especifica el numero exacto de parametros activos) |
| Longitud de contexto | 262.144 tokens nativos; verificado hasta 1.048.576 tokens con QSA/LSA nativo |
| Tipos de cuantizacion | HQ8_G32 (3,36%), HQ4_G64 (95,74%), BF16 (0,90%); media de 4,75 bits/param; PLE en VQ2_G32 (2 bits) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | QWP1 + QNGRAM v3 (contenedores propietarios de Qwegn); no es safetensors, GGUF ni MLX |

## Arquitectura y entrenamiento

El backbone sigue un diseno hibrido que combina atencion dispersa consciente de consulta (QSA) en 12 capas con capas Gated-DeltaNet (GDN) en las 36 restantes, lo que reduce el coste de atencion en contextos largos. El componente MoE emplea 512 expertos con 10 enrutados y 1 compartido activos por token, y se complementa con conexiones hiper de 4 ramas (Hyper-Connections) y una cabeza de prediccion multi-token MTP-3 que habilita decodificacion especulativa. La tabla PLE de 4-gramas aporta 320 millones de filas de 160 dimensiones que actuan como embeddings por capa, y el modelo incluye una torre de vision.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni las etapas de RLHF/DPO del modelo base en la informacion proporcionada. La innovacion destacable de este paquete es la cuantizacion mixta: HQ8_G32 en el tronco denso y HQ4_G64 en los expertos, con una KLD 2,62 veces menor frente a BF16 que una cuantizacion uniforme HQ4_G32, segun el autor. La tabla PLE se comprime con un codebook esferico e-means de 2 bits a 90 bytes por fila, y el paquete incluye un fichero `model.qlsa` para el modo de atencion dispersa larga.

## Capacidades

- Generacion de texto y razonamiento de multiples pasos, con modo de pensamiento (`--no-thinking` disponible para desactivarlo).
- Codigo: evaluaciones EvalPlus HumanEval y MBPP reportadas por el autor.
- Matematicas: evaluaciones AIME25, GSM8K y OlympiadBench en la model card.
- Vision: el modelo base incluye torre de vision, aunque el flag `--no-load-vision` permite omitirla para ahorrar RAM.
- Tool calling y function calling: evaluado con `inspect_ai` y `promptfoo` segun el autor.
- Capacidades agenticas: evaluacion agentic de 76/88 (86,4%) en `llmprobe --full`.
- Contexto largo: recuperacion tipo needle al 100% (3/3) en longitudes de 16K a 1M tokens.
- Decodificacion especulativa con MTP-3 y anillo de copia de 8 slots para texto predecible.
- Multilingue: no disponible en la informacion proporcionada.

## Casos de uso

- Razonamiento cientifico y tecnico en local: el paquete permite ejecutar un MoE de 128,8 B en un Mac de 128 GB con resultados reportados de 10/10 en GPQA, SuperGPQA, AIME25 y COMPSEC, adecuado para investigadores que necesitan confidencialidad sin depender de la nube.
- Analisis de documentos largos: con 262.144 tokens nativos y verificacion hasta 1M, permite procesar libros tecnicos, expedientes o bases de codigo completas en una sola pasada, con recuperacion needle del 100%.
- Generacion de codigo en pipelines de CI/CD: los resultados EvalPlus HE (93,9% base) y MBPP (91,5% base) lo hacen util para autocompletado, generacion de tests y revision de parches en entornos Apple Silicon.
- Agentes autonomos con tool calling: la evaluacion agentic del 86,4% y la conformidad del 100% en `llmprobe` lo sitúan como candidato para orquestacion de herramientas en local, sin exposicion de datos a terceros.
- Asistencia a la investigacion con contexto masivo: la prefill de 1.887,6 tok/s a 1M tokens permite indexar y consultar corpus extensos en una workstation de sobremesa.
- Prototipado rapido en Mac: la TTFT en cache caliente de 7-11 ms y el cache de prefijo de 32,7K tokens en 0,24 s facilitan iteracion interactiva sobre prompts largos.
- Despliegue multiusuario ligero: el agregado de 4 streams concurrentes a 134,5 tok/s permite servir a un pequeno equipo desde un unico Mac Studio o MacBook Pro de gama alta.

## Benchmarks y rendimiento

Datos reportados por el autor en Apple M5 Max (128 GB, GPU de 40 nucleos, 585 GB/s) con `paired_perf.py --strict`, `llmprobe` y `--kv-mode q4 --temperature 0`:

| Metrica | Resultado |
|---|---|
| Prefill 4K / 8K (pico) | 2.947,3 / 3.034,8 tok/s |
| Prefill 32K / 65K / 256K / 1M | 2.724,7 / 2.385,1 / 1.839,7 / 1.887,6 tok/s |
| TTFT en frio / cache caliente | 113-155 ms / 7-11 ms (63x-99x) |
| Decodificacion estandar (serial) | 53,4-81,5 tok/s |
| Decodificacion especulativa (novel) | 95,1-113,7 tok/s |
| Decodificacion especulativa (predecible) | 145,4 tok/s (4,92 tok/paso) |
| 4 streams concurrentes (agregado) | 134,5 tok/s |
| GPQA / SuperGPQA / AIME25 / COMPSEC | 10/10 (100%) |
| Core-92 (`--no-thinking`) | 75/92 (82%) |
| Hard-50 (`--no-thinking`) | 44/50 (88%) |
| EvalPlus HumanEval | 93,9% base / 92,1%+ (154/164) |
| EvalPlus MBPP | 91,5% base / 77,8%+ (346/378) |
| IFEval (n=30) | 87,8% |
| GSM8K 5-shot (n=30) | 93,3% |
| Needle recall 16K-1M | 3/3 (100%) en cada longitud |
| Conformidad `llmprobe --full` | 291/291 (100%) |

No se han publicado resultados de benchmarks independientes en la informacion disponible; todas las cifras proceden de la model card del autor y estan ligadas al runtime Qwegn.

## Requisitos de hardware

- RAM unificada: 128 GB recomendados para mantener la tabla PLE completa residente en GPU Metal (98,42 GiB en disco).
- Alternativa con streaming: `--stream-ngrams --no-load-vision` permite transmitir la tabla PLE desde NVMe, ahorrando 28,48 GiB de RAM.
- GPU: disenado especificamente para Apple Silicon con Metal 4; el autor reporta mediciones en Apple M5 Max (Mac17,6, GPU de 40 nucleos, 585 GB/s).
- No cabe en GPU de consumo tipo RTX 4090 (24 GB) ni en A100/H100 mediante este paquete, ya que el formato QWP1 solo carga en Qwegn.
- Despliegue: exclusivamente mediante el motor Qwegn v0.14.0 o superior; no es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: TTFT en caliente de 7-11 ms, decodificacion especulativa de 95,1-145,4 tok/s y prefill pico de 3.034,8 tok/s segun el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-QWP-Mixed | 128,80 B backbone + PLE | 262.144 (verificado 1M) | Apache 2.0 | QWP1 + QNGRAM v3 | Solo motor Qwegn en Apple Silicon |
| Qwen/Qwen3.8-Flash-Next (base) | 128,80 B backbone | 262.144 | Apache 2.0 | safetensors (presumiblemente) | Hugging Face, runtime generico |
| Alternativas MoE de ~100-130 B | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion con otros modelos de la misma categoria no esta disponible en la informacion proporcionada; el unico punto de referencia objetivo es el checkpoint original de Qwen, del que este paquete es una conversion cuantizada.

## Limitaciones y advertencias

- Dependencia total del runtime Qwegn: el paquete no carga en safetensors, GGUF, MLX ni en motores estandar, lo que limita su portabilidad y crea riesgo de dependencia de un proyecto pequeno.
- Hardware restringido: solo Apple Silicon con Metal 4 y, en la practica, 128 GB de RAM unificada para el modo residente; el modo streaming degrada el rendimiento.
- Cifras de rendimiento autopublicadas por el autor, sin validacion independiente; deben tratarse como indicativas y no como benchmark neutral.
- Riesgo de alucinacion inherente al modelo base; no se documentan tasas especificas en la informacion disponible.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Idiomas soportados: no disponibles; no se puede garantizar un comportamiento multilingue sin validacion propia.
- Licencia Apache 2.0 permite uso comercial, pero la licencia del modelo base y las condiciones del runtime Qwegn deben verificarse por separado.
- El repo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.
- El proceso de cuantizacion mixta puede introducir degradacion adicional frente al checkpoint original; el autor reporta menor KLD que HQ4_G32 uniforme, pero no se aportan comparaciones contra BF16 en todas las tareas.

## Enlaces

- Hugging Face: https://huggingface.co/qwegnai/Qwen3.8-Flash-Next-QWP-Mixed
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio del motor Qwegn: https://github.com/qwegnai/qwegn
- Commit del modelo base referenciado: `7ecef55a2e549814c62143fcf8b5be457695e3b9`
