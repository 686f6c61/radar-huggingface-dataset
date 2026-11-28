# JohnAKuntz/Qwen3.6-35B-A3B-PI64K-V-GGUF

## Resumen

Qwen3.6-35B-A3B-PI64K-V-GGUF es una cuantizacion GGUF de precision mixta, guiada por importance matrix, del modelo Qwen3.6-35B-A3B de Alibaba Qwen, publicada por el usuario JohnAKuntz. Su proposito es empaquetar un modelo MoE disperso de vision de 35.500 millones de parametros totales (3.000 millones activos) en unos 12,5 GB, de modo que quepa y funcione a 65.536 tokens de contexto en una Raspberry Pi 5 de 16 GB con el escritorio completo de Raspberry Pi OS y la aplicacion Hermes en marcha. No es un modelo nuevo, sino una receta de cuantizacion orientada a hardware de borde.

El modelo base combina una arquitectura hibrida de atencion lineal (Gated DeltaNet) con mezcla de expertos: solo 10 de sus 40 capas almacenan cache KV, lo que reduce el coste de memoria del contexto a 520 MiB con K=q8_0 y V=q4_0 a 64K. Esa es la razon tecnica por la que un contexto de 64K cabe en una placa de 16 GB, algo imposible con un transformer de atencion completa de esta clase. El autor declara 262K de contexto nativo en el modelo original y soporte de vision, tool calling y modo thinking.

La relevancia de esta ficha es doble: documenta una tecnica concreta de cuantizacion por capas con imatrix y ranking de importancia por tensor, y ofrece mediciones reales de rendimiento en CPU (i5-6600K) y estimaciones para Raspberry Pi 5. La licencia Apache-2.0 del modelo base se mantiene, y el repositorio incluye tambien el proyector de vision en Q8_0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con mezcla de expertos (MoE) y atencion lineal Gated DeltaNet; 40 capas, de las cuales solo 10 cachean KV |
| Parametros totales | 35.505.251.456 (35,5 B) |
| Parametros activos | 3 B (aproximado, segun el nombre A3B y la model card) |
| Longitud de contexto | 65.536 tokens en esta build; 262K nativo en el modelo base |
| Tipos de cuantizacion | GGUF de precision mixta: IQ2_S, IQ2_XS, Q4_K, Q5_K, Q6_K, Q8_0, normas en F32; media de 2,83 bpw |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp y Ollama); dos ficheros: modelo de 12,5 GB y proyector de vision mmproj Q8_0 de 586 MB |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B es un transformer con mezcla de expertos de 40 capas y 256 expertos enrutados por capa, con un experto compartido siempre activo de 0,13 B de parametros. La innovacion estructural es la atencion hibrida Gated DeltaNet: solo 10 de las 40 capas mantienen cache KV, y el resto usa estado recurrente, lo que reduce drasticamente la memoria necesaria para contextos largos. El modelo incluye ademas una capa MTP (multi-token prediction) para decodificacion especulativa, que en esta build se conserva pero se desactiva por defecto.

Esta publicacion no entrena el modelo: parte del Q8_0 oficial de Qwen y aplica una cuantizacion guiada por una importance matrix de calibracion de unsloth (76 fragmentos). El reparto es asimetrico por clase de tensor: los 32,2 B de expertos enrutados van a IQ2_S (113 tensores) e IQ2_XS (7 tensores, elegidos por ranking de importancia) a 2,60 bpw; atencion y capas GDN/SSM a Q4_K/Q5_K/Q6_K/Q8_0 a 4,88 bpw; embeddings y cabeza de salida a Q6_K/Q5_K a 6,03 bpw; el experto compartido a Q8_0 a 8,42 bpw; y la capa MTP a Q4_K a 4,5 bpw. El autor indica cero fallbacks en el proceso.

## Capacidades

- Generacion de texto conversacional y razonamiento, con modo thinking activado por defecto (se desactiva con `enable_thinking: false` para modo instruct rapido).
- Vision: comprension de graficos, documentos y tablas densas mediante el proyector mmproj Q8_0 incluido; el autor verifico 3 de 3 pruebas de vision (grafico, hechos de documento, OCR de tabla densa).
- Tool calling y function calling, segun los tags y la model card.
- Uso agentico y razonamiento multi-paso, respaldado por sus resultados declarados en SWE-bench Verified y Terminal-Bench.
- Interaccion con interfaces graficas (ScreenSpot), util para agentes que operan GUIs.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- API compatible con OpenAI a traves de llama-server (`/v1/chat/completions`) y soporte de imagenes en base64.

## Casos de uso

- Agente de escritorio en Raspberry Pi 5: el modelo corre junto al escritorio de Raspberry Pi OS y la aplicacion Hermes, sirviendo contexto de 64K para sesiones largas de agente sin salir de la placa. Es adecuado porque el KV cache a 64K ocupa solo 520 MiB y el total del servidor ronda 12,9 GiB.
- Asistente documental con vision en el borde: con el proyector mmproj puede leer graficos, documentos y tablas densas desde imagenes enviadas por la API, util en entornos sin conectividad a la nube.
- Automatizacion de tareas de codigo en local: sus puntuaciones declaradas en SWE-bench Verified (73,4) y Terminal-Bench (51,5) lo hacen apto para agentes que editan repositorios y ejecutan comandos en terminal, integrable mediante tool calling.
- Analisis de capturas de pantalla y GUIs: ScreenSpot 92,9 declarado permite construir agentes que localizan elementos de interfaz para automatizar flujos de escritorio.
- Servidor OpenAI-compatible en red local: llama-server expone `/v1/chat/completions` en el puerto 8080, de modo que varias aplicaciones de una red domestica o de laboratorio pueden consumir el modelo sin GPU.
- Prototipado y evaluacion de cuantizaciones de baja precision: el repositorio documenta la receta por capas y las mediciones de calidad (MMLU-200 al 81,0% frente a 80,5% de la referencia IQ2_M de unsloth, con McNemar p=1,000), lo que sirve como base para reproducir o ajustar el esquema.
- Despliegue educativo o de laboratorio con presupuesto minimo: permite experimentar con un MoE de vision de 35 B en hardware de menos de 100 euros de coste de placa, a unos 5 tok/s estimados de generacion.

## Benchmarks y rendimiento

Resultados declarados por el autor para el modelo base (puntuaciones de model card en fp16) y mediciones propias de esta build en un i5-6600K con llama.cpp v1.1.0-dev:

| Benchmark | Resultado | Contexto |
|---|---|---|
| SWE-bench Verified | 73,4 | Modelo base, fp16 (declarado) |
| Terminal-Bench | 51,5 | Modelo base, fp16 (declarado) |
| GPQA | 86,0 | Modelo base, fp16 (declarado) |
| MMMU | 77,4 | Modelo base, fp16 (declarado) |
| MMMU-Pro | 69,9 | Modelo base, fp16 (declarado) |
| OmniDocBench | 80,2 | Modelo base, fp16 (declarado) |
| ScreenSpot | 92,9 | Modelo base, fp16 (declarado) |
| MMLU-200 (greedy, thinking off) | 81,0% (162/200) | Esta build GGUF, i5-6600K |
| MMLU-200, referencia unsloth UD-IQ2_M | 80,5% | Referencia de 11,9 GB; paridad estadistica, McNemar p=1,000 |
| Pruebas de vision (grafico, documento, tabla) | 3/3 superadas | Esta build GGUF |
| Needle-in-haystack a 16K, profundidad 0,5 | Encontrado (frase exacta) | KV K=q8_0 / V=q4_0 |
| Generacion | 9,7-10,4 tok/s | i5-6600K; ~5 tok/s estimado en Pi 5 |
| Prefill | 21,7 tok/s | i5-6600K; ~11-14 tok/s estimado en Pi 5 |
| Decodificacion especulativa MTP | Aceptacion 0,42, mas lenta (7,1 frente a 9,7 tok/s) | Desactivada por defecto |

Comparaciones declaradas por el autor: MiniCPM-V-4.7-35B-A3B en IQ2_S produce texto incoherente a ese regimen (1,0% en el mismo set MMLU) y su cuantizacion oficial mas pequena (15,6 GB IQ3_XS) no cabe en la placa; Gemma-4-26B-A4B rinde ~3,2 tok/s en Pi 5 con SWE-bench 17,4 y un KV de 3,3 GiB a 64K.

## Requisitos de hardware

- VRAM/RAM estimada: 12,9 GiB de RSS estable para el servidor completo a 64K (11,7 GiB de pesos en mmap, 0,52 GiB de KV, 0,06 GiB de estado recurrente, ~0,1 GiB de buffers de computo y 0,55 GiB de proyector de vision). Medido entre 12,5 y 13,0 GiB en el equipo de compilacion, con hasta 1,0 GiB transitorio al codificar imagenes grandes.
- Memoria del sistema: con escritorio de Raspberry Pi OS y Hermes (Electron) se suman ~2,2 GiB, dejando ~0,5 GiB de margen en una placa de 16 GB. Se recomienda `MALLOC_ARENA_MAX=2` en sesiones de agente largas.
- GPU recomendadas: no disponibles en la informacion proporcionada; las mediciones son en CPU (i5-6600K) y en Raspberry Pi 5.
- GPU de consumo: el autor no documenta pruebas en GPU; el objetivo declarado es CPU y placas de borde.
- Opciones de despliegue: llama.cpp (llama-server, master actual) y Ollama 0.40 o superior con un Modelfile de dos `FROM` (modelo y mmproj). Parametros clave: `--ctx-size 65536 --parallel 1 --threads 4 --threads-batch 4 --batch-size 512 --ubatch-size 256 --flash-attn on --cache-type-k q8_0 --cache-type-v q4_0 --no-repack --ctx-checkpoints 0 --jinja --image-min-tokens 1024`. En Ollama, definir `OLLAMA_KV_CACHE_TYPE=q4_0`.
- Latencia y throughput: 9,7-10,4 tok/s de generacion y 21,7 tok/s de prefill en i5-6600K; en Raspberry Pi 5 se estiman ~5 tok/s de generacion y 11-14 tok/s de prefill, con un prefill de 64K que tarda minutos y hace recomendable el cache de prompts.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento relevante | Licencia | Disponibilidad en 16 GB |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-PI64K-V (esta build) | 35,5 B totales, 3 B activos | 64K en esta build; 262K nativo | MMLU-200 81,0%; SWE-bench 73,4; MMMU 77,4 (base fp16) | Apache-2.0 | Si, ~12,9 GiB con escritorio |
| MiniCPM-V-4.7-35B-A3B (IQ2_S) | 35 B clase A3B | No disponible | 1,0% en MMLU-200 a ese bitrate segun el autor | No disponible | No: la cuantizacion oficial menor (15,6 GB IQ3_XS) no cabe |
| Gemma-4-26B-A4B | 26 B clase A4B | No disponible | SWE-bench 17,4; ~3,2 tok/s en Pi 5 | No disponible | Si, pero con KV de 3,3 GiB a 64K y menor capacidad agentica |
| Qwen3.6-35B-A3B (Q8_0 oficial) | 35,5 B totales, 3 B activos | 262K nativo | Referencia de calidad completa | Apache-2.0 | No: tamano muy superior a 16 GB |

## Limitaciones y advertencias

- La cuantizacion a 2,83 bpw media degrada la calidad respecto al modelo base en fp16; los benchmarks de SWE-bench, GPQA, MMMU y ScreenSpot son del modelo base y no de esta build.
- El autor solo aporta una medicion de calidad propia (MMLU-200, 200 items) y tres pruebas de vision; no hay evaluacion exhaustiva de esta cuantizacion en tareas agenticas o de codigo.
- La decodificacion especulativa MTP esta desactivada por defecto porque en CPU resulta mas lenta (aceptacion 0,42); no debe activarse `draft_num_predict` en Ollama.
- El rendimiento en Raspberry Pi 5 es una estimacion (~5 tok/s), no una medicion publicada en la model card.
- Con 64K de contexto el prefill tarda minutos en la placa; sin cache de prompts la experiencia interactiva se resiente.
- `--parallel 1` es obligatorio en llama.cpp: cada slot multiplica la asignacion de KV y puede provocar falta de memoria.
- El modelo puede alucinar, como cualquier LLM; no hay documentacion de sesgos especificos en la informacion proporcionada.
- Idiomas soportados no documentados en esta ficha; conviene verificar el comportamiento en castellano antes de usarlo en produccion.
- La licencia Apache-2.0 permite uso comercial, pero se heredan las condiciones del modelo base Qwen3.6-35B-A3B; revisar la model card original para clausulas adicionales.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta y fue creado el 27 de noviembre de 2026; es una publicacion reciente sin validacion comunitaria independiente.
- Bajo presion de memoria el kernel expulsa paginas mmap y las vuelve a cargar, lo que degrada el rendimiento en lugar de matar el proceso, pero puede causar pausas perceptibles.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/JohnAKuntz/Qwen3.6-35B-A3B-PI64K-V-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Calibracion de unsloth citada por el autor: no disponible como enlace directo en la informacion proporcionada
- llama.cpp: no disponible como enlace directo en la informacion proporcionada
- Ollama: no disponible como enlace directo en la informacion proporcionada
- Hermes desktop: no disponible como enlace directo en la informacion proporcionada
