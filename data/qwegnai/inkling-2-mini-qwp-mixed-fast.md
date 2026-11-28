# qwegnai/Inkling-2-Mini-QWP-Mixed-Fast

## Resumen

Inkling-2-Mini-QWP-Mixed-Fast es un paquete de pesos cuantizados del modelo multimodal `thinkingmachines/Inkling-2-Mini`, publicado por el usuario `qwegnai` para su uso exclusivo con el motor de inferencia Qwegn, un runtime escrito en Swift 6.2 y Metal 4 orientado a Apple Silicon. No se trata de un modelo nuevo, sino de una redistribucion empaquetada en el contenedor propietario `QWP1` que aplica cuantizacion vectorial esferica de Hadamard (SHVQ, descrita en `arXiv:2611.09501`) sobre el modelo base de 26.390 millones de parametros.

El modelo base emplea una arquitectura `inkling2_loop` de tipo transformer con capas repetidas (looped transformer) y mezcla de expertos: 24 capas fisicas que recorren el bloque `[6..<18]` tres veces, lo que da 48 visitas efectivas de capa, con 128 expertos enrutados y 8 activos por token. Incluye ademas una torre de vision de 23 capas y una ventana de contexto nativa de 1.048.576 tokens, con atencion dispersa latente (LSA) y decodificacion especulativa mediante un drafter DSpark de 3 capas.

La relevancia de este paquete es fundamentalmente practica: reduce el peso total a 10,20 GiB (frente a los 15,15 GiB de la variante `Mixed` sin perdida) y disminuye el trafico de pesos activos por token a 2,089 GB/tok, un factor de 2,65x respecto a MXFP8/NVFP4. El coste es que solo carga en Qwegn v0.33.0 o superior y no es compatible con safetensors, GGUF ni MLX, lo que limita enormemente su portabilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `inkling2_loop`: transformer con capas repetidas (looped) y MoE; 24 capas fisicas, 48 visitas efectivas; 2304 de hidden; 24Q / 8KV (head_dim 128); Sink+RelBias (4 full + 20 SWA-1024); AttnRes-6; SConv-4; torre de vision de 23 capas y 1024-d; drafter DSpark de 3 capas (Markov/Tree MTP) |
| Parametros totales | 26.388.641.280 (26,39 B) en 1.115 tensores, mas 317,90 M del drafter DSpark |
| Parametros activos | 8 de 128 expertos enrutados por token (intermediate_size = 1152) |
| Longitud de contexto | 1.048.576 tokens (1M) nativos; KV del drafter DSpark limitado a 16K |
| Tipos de cuantizacion | SHVQ4_G32 en trunk/coda/head; SHVQ2_G64, SHVQ3_G64 y SHVQ4_G64 en MoE enrutado; BF16/F32 en algunas capas; KV cache en q4 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | QWP1 (`model.qwp`, `dspark.qwp`, `model.qlsa`); no es safetensors, GGUF ni MLX |
| Tamano del paquete | 9,94 GiB (`model.qwp`, 10.670.358.889 bytes) + 247,4 MiB (`dspark.qwp`) + 6,0 MiB (`model.qlsa`); 10,20 GiB totales |
| Vocabulario | BPE con `ignore_merges`, 201.024 entradas (200.058 sin padding) |

## Arquitectura y entrenamiento

La arquitectura del modelo base combina dos ideas poco habituales. Por un lado, un transformer con capas repetidas: solo hay 24 capas fisicas, pero el bloque central `[6..<18]` se recorre tres veces, dando 48 visitas efectivas (4 de trunk, 12x3 de loop y 4 de coda). Por otro, mezcla de expertos con 128 expertos enrutados y 8 activos por token, con `intermediate_size` de 1152. La atencion usa 24 cabezas de consulta y 8 de clave/valor con `head_dim` de 128, combinando 4 capas de atencion completa con 20 de ventana deslizante de 1024 tokens, mas mecanismos Sink+RelBias, AttnRes-6 y SConv-4. El modelo es multimodal: incorpora una torre de vision de 23 capas y dimension 1024.

El paquete anade sobre el modelo base una cuantizacion SHVQ (Spherical Hadamard Vector Quantization) con bloques de 32 y 64 elementos y precisiones mixtas de 2, 3 y 4 bits segun la parte de la red, mas un drafter DSpark de 3 capas para decodificacion especulativa con arbol Markov. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO en el modelo original; la model card del paquete cuantizado no los detalla.

## Capacidades

- Generacion de texto y razonamiento multi-turno con contexto de hasta 1M tokens.
- Procesamiento de imagen y texto combinados (pipeline `image-text-to-text`, torre de vision de 23 capas).
- Generacion de codigo: la model card reporta 75/100 en Code-100, 44/50 en HumanEval y 31/50 en MBPP.
- Razonamiento multi-hop sobre contextos largos: recuperacion de aguja multi-salto con 12/12 aciertos entre 8K y 1M tokens.
- Decodificacion especulativa integrada mediante DSpark (d=3), con modo sin perdida declarado por el autor.
- Atencion dispersa latente (LSA) con ventana adaptativa k=2K a 16K para contextos rellenados.
- Servicio concurrente mediante `QWServer` con batching por wavefront (B=3, B=4).
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades de agente multi-paso: no disponible en la informacion proporcionada.
- Cobertura multilingue: no disponible.

## Casos de uso

- Analisis de repositorios completos en local: con 1M tokens de contexto nativo y atencion LSA, el modelo puede ingerir arboles de codigo extensos y responder preguntas cruzadas entre ficheros sin trocear el contexto, todo sobre memoria unificada de un Mac de 128 GB.
- Asistencia de programacion en estacion de trabajo Apple Silicon: el paquete cabe residente al 100% en 11,10 GiB planificados a 8K, con decodificacion de 86,18 tok/s en modo `code256` con `--moe-spec-budget 12`, adecuado para autocompletado interactivo en el editor.
- Procesamiento de documentos largos con imagenes: al ser `image-text-to-text`, permite extraer y razonar sobre figuras, tablas escaneadas y texto en un mismo flujo, util para auditoria documental o analisis de informes tecnicos.
- Servicio HTTP interno multiusuario: `QWServer` con batching por wavefront alcanza 100,56 tok/s con B=4 peticiones concurrentes, suficiente para un equipo pequeno que consulte el modelo a traves de una API interna.
- Recuperacion de informacion sobre corpus masivos: la recall multi-hop del 100% entre 8K y 1M tokens lo hace apto para preguntas que requieren cruzar varios pasajes dispersos en un corpus largo.
- Evaluacion de tecnicas de cuantizacion: el paquete sirve como referencia reproducible de SHVQ mixto frente a la variante `Mixed` sin perdida (15,15 GiB) y frente a `MLX-4-8bit`, para medir el impacto de la cuantizacion en calidad y velocidad.
- Prototipado de agentes con contexto largo en hardware de consumo: al no requerir GPU dedicada, permite experimentar con flujos de razonamiento extendido en un unico equipo de sobremesa.

## Benchmarks y rendimiento

Medidos por el autor en un Apple M5 Max (18 nucleos de CPU, GPU Apple10 NAX de 40 nucleos, 128 GB de memoria unificada, 585 GB/s de DRAM) con `--kv-mode q4 --temperature 0`.

| Metrica | Resultado |
|---|---|
| Prefill NAX a 2K / 8K / 16K / 32K / 128K | 3.507,4 / 3.637,9 / 3.430,3 / 3.217,9 / 3.200,0 tok/s |
| Decodificacion serial (d=0) | 72,68–73,18 tok/s |
| Decodificacion DSpark d=3 (2K / code256 / pico) | 60,34 / 76,38 / 99,89 tok/s |
| MoE-Spec `--moe-spec-budget 12` (code256 / 2K / 16K) | 86,18 / 63,31 / 96,55 tok/s |
| Batching concurrente B=3 / B=4 | 77,36 / 100,56 tok/s |
| LSA con contexto rellenado 8K / 256K / 512K / 1M | 3.164,8 / 2.338,6 / 2.298,4 / 2.016,5 tok/s (prefill); 55,73 / 43,40 / 42,32 / 33,92 tok/s (decode) |
| DSpark d=3 sin perdida 8K / 32K / 128K / 256K / 512K | 84,32 / 78,92 / 64,84 / 60,21 / 54,96 tok/s |
| Baseline denso sin LSA 256K / 512K / 1M | 1.495,2 / 936,8 / 539,3 tok/s (prefill); 23,43 / 13,38 / 7,52 tok/s (decode) |
| Code-100 | 75/100 (HumanEval 44/50, MBPP 31/50) |
| EvalPlus HumanEval / MBPP | 76,8% / 73,8%+ y 84,4% / 71,4%+ |
| Recuperacion multi-hop | 12/12 (100%) entre 8K y 1M |
| Conformidad de API | 292/292 (100%) |

No se han publicado resultados de benchmarks estandar (MMLU, GSM8K, MMLU-Pro) en la informacion disponible.

## Requisitos de hardware

- Plataforma exclusiva: Apple Silicon con Metal 4 y macOS 26.2 o superior; el motor Qwegn es Swift 6.2 y no existe version para CUDA, ROCm ni CPU x86.
- Memoria unificada: 11,10 GiB planificados a 8K de contexto y 21,77 GiB de RSS con contexto rellenado a 1M; un Mac de 128 GB mantiene el paquete residente al 100% con cero asignaciones en regimen estable.
- GPU recomendadas: el autor mide sobre un M5 Max con GPU de 40 nucleos; no se han publicado cifras para M1, M2, M3 o M4, por lo que el rendimiento en esos chips es no disponible.
- No cabe en GPU de consumo NVIDIA ni AMD: el formato QWP1 solo lo carga Qwegn.
- Opciones de despliegue: Qwegn v0.33.0 o superior (recomendado v0.42.0+), con `QWServer` para servicio HTTP. No es compatible con vLLM, llama.cpp, Ollama, TGI ni MLX.
- Latencia: 29 ms de p50 en contexto rellenado a 1M y 8,60 minutos de TTFT en ese mismo escenario; 49 ms de warm prefix cache en repeticion exacta frente a 490 ms en frio.
- Throughput: entre 33,92 y 99,89 tok/s en decodificacion segun contexto y configuracion; hasta 3.637,9 tok/s de prefill a 8K.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tamano del paquete | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Inkling-2-Mini-QWP-Mixed-Fast (este) | 26,39 B + 317,9 M drafter | 1M | 10,20 GiB | Apache 2.0 | QWP1 | SHVQ mixto, DSpark d=3, maxima velocidad |
| qwegnai/Inkling-2-Mini-QWP-Mixed | 26,39 B + drafter | 1M | 15,15 GiB | Apache 2.0 | QWP1 | Trunk SHVQ4_G32 + MoE NVFP4 sin perdida; 0,013170 KL medio, 97,92% Top-1, 13/13 HumanEval |
| Inkling-2-Mini-MLX-4-8bit | 26,39 B | 1M | no disponible | Apache 2.0 (presumible, no confirmado) | MLX | Referencia de paridad: 12/12 en recuperacion entre 256K y 1M |
| thinkingmachines/Inkling-2-Mini (base) | 26,39 B | 1M | no disponible | Apache 2.0 | safetensors (presumible) | Modelo original sin cuantizar; sin cifras de rendimiento en la informacion disponible |

## Limitaciones y advertencias

- Portabilidad nula: el contenedor QWP1 solo se carga en Qwegn v0.33.0+, un runtime para Apple Silicon. No sirve en servidores con GPU NVIDIA, AMD ni en CPU x86, lo que descarta su uso en la nube convencional.
- Dependencia de un unico mantenedor: el paquete lo publica el usuario `qwegnai`, con 0 descargas y 0 likes en el momento de la consulta, y esta ligado a la version del motor; cambios de version pueden romper la compatibilidad.
- Cuantizacion agresiva: el MoE enrutado usa SHVQ de 2 y 3 bits en algunos bloques, lo que introduce degradacion respecto al modelo base. El propio autor remite a la variante `Mixed` (15,15 GiB) para maxima fidelidad.
- Idiomas soportados no documentados: no hay lista de lenguas ni evaluacion multilingue, por lo que el comportamiento en castellano no esta verificado.
- Riesgo de alucinacion: no se han publicado evaluaciones de factualidad ni de calibracion; los benchmarks disponibles se limitan a codigo y recuperacion de agujas.
- Sesgos: no disponible; la model card no documenta analisis de sesgo.
- Contexto efectivo del drafter: el KV de DSpark esta limitado a 16K, de modo que la decodificacion especulativa puede no aportar la misma ganancia en contextos muy largos.
- Coste de arranque en contextos extremos: 8,60 minutos de TTFT y 32,1 minutos en el baseline denso a 1M hacen inviable el uso interactivo con contextos completamente rellenados.
- Licencia Apache 2.0 en el paquete, pero conviene verificar la licencia y las condiciones del modelo base `thinkingmachines/Inkling-2-Mini` antes de un despliegue comercial.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/qwegnai/Inkling-2-Mini-QWP-Mixed-Fast
- Variante sin perdida: https://huggingface.co/qwegnai/Inkling-2-Mini-QWP-Mixed
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Motor de inferencia Qwegn: https://github.com/qwegnai/qwegn
- Paper de SHVQ: `arXiv:2611.09501`
