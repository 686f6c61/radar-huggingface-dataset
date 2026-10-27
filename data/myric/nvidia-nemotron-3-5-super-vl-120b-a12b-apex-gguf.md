# Myric/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-APEX-GGUF

## Resumen

Este repositorio contiene una cuantizacion GGUF del modelo NVIDIA Nemotron-3.5 Super VL 120B A12B, publicada por el usuario Myric bajo la receta propia "APEX i-quality". El modelo original lo desarrolla NVIDIA y es un transformer hibrido con capas Mamba2, atencion completa y mezcla de expertos latente (latent-MoE), con 120.668.707.840 parametros totales y unos 12B activos por token, entrenado con 1M de tokens de contexto. Esta ficha cubre exclusivamente el artefacto cuantizado: el LLM de texto en formato GGUF, listo para llama.cpp.

La relevancia practica del quant es que reduce un BF16 de 225 GiB a 81,03 GB (75,46 GiB) a 5,37 bits por peso, manteniendo en F32 los tensores criticos (routers, parametros de estado Mamba, normas y sesgos), de forma que el modelo completo cabe en un equipo con 119 GiB de memoria unificada (GB10) junto con una ventana de contexto de hasta 1M tokens. El autor reporta 42/42 en su suite agentica de 42 tareas, perplejidad de 4,2777 en wikitext-2 y una divergencia KL media de 0,0337 frente a los logits de referencia en BF16.

Conviene tener claro que el repositorio no incluye la parte de vision: el `mmproj` (BF16, 1,73 GB) y la cabeza MTP (8,04 GB BF16 / 4,28 GB Q8_0 / 2,27 GB Q4_0) son ficheros separados del repositorio de ggml-org. Solo se ha construido el tamano `i-quality`; los tamanos `i-compact` e `i-mini` estan planificados pero no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida Mamba2 + atencion completa + latent-MoE (88 capas: 40 Mamba2, 40 MoE, 8 de atencion completa) |
| Parametros totales | 120.668.707.840 |
| Parametros activos | ~12B (512 expertos enrutados, top-22, 1 experto compartido) |
| Longitud de contexto | 1.000.000 de tokens entrenados (el quant se ha validado con 256k y 1M) |
| Tipos de cuantizacion | Mezcla de tipos: F32 (409 tensores), Q8_0 (160), Q6_K (123), Q5_K (31), IQ4_NL (31), Q5_0 (9); 5,37 bpw |
| Idiomas soportados | en, es, fr, de, it, ja |
| Licencia | openmdw-1.1 (etiquetada como `other` en HuggingFace) |
| Formato de pesos | GGUF, dividido en 2 ficheros por el limite de 50 GB/fichero de HuggingFace (81,03 GB en total, 763 tensores) |

## Arquitectura y entrenamiento

El modelo base es un hibrido de 88 capas que combina 40 capas Mamba2 (modelo de espacio de estados, con estado de tamano constante e independiente del numero de tokens), 40 capas de latent-MoE con 512 expertos enrutados, seleccion top-22 y un experto compartido, y solo 8 capas de atencion completa. La dimension latente del MoE es 1024, la hidden es 4096 y la atencion usa 32 cabezas con 2 KV heads de 128 dimensiones, vocabulario de 131.072 tokens y una capa MTP (multi-token prediction) adicional. El resultado es un coste de KV cache de solo 8 KiB por token (8 capas de atencion × 2 KV heads × 2 × 128 dims en f16), frente a arquitecturas con atencion global completa que consumen ordenes de magnitud mas.

Sobre el entrenamiento no se aportan en esta informacion datos de composicion del dataset, numero de tokens de preentrenamiento ni si hubo RLHF/DPO; la model card del quant no los detalla. Lo que si se documenta es el proceso de cuantizacion: asignacion estructural por rol y banda de tensor (sin barrido de sensibilidad medido, porque el BF16 de 225 GiB no cabe residente en el GB10 de 119 GiB para hacer un forward completo), imatrix calculada sobre un corpus ponderado hacia codigo (`laguna_calib_codeweighted.txt`, 295 chunks × 512, serializacion por bandas con `--band 2`) y fijado en F32 de 409 tensores: routers (`ffn_gate_inp`), `exp_probs_b.bias`, `ssm_a`, `ssm_d`, `ssm_norm`, `ssm_conv1d`, `ssm_dt.bias`, todas las normas y todos los sesgos.

## Capacidades

- Generacion de texto conversacional multi-turno con ventanas de hasta 1M tokens.
- Razonamiento agentico multi-paso: la suite de validacion del autor es una suite agentica de 42 tareas, superada al 100%.
- Tool calling / function calling: la comprobacion "Gen check" reporta 5/5 llamadas a herramienta correctas en prompts encadenados.
- Generacion y edicion de codigo, incluyendo el uso dentro de bucles de agente con ejecucion de herramientas (la imatrix esta ponderada hacia codigo).
- Capacidades multilingues en ingles, castellano, frances, aleman, italiano y japones.
- Vision: el modelo base es vision-language, pero este repositorio es solo el LLM de texto; para imagen hay que cargar el `mmproj` del repositorio de ggml-org.
- Decodificacion especulativa mediante la cabeza MTP nativa (fichero aparte), con `--spec-type draft-mtp`.
- Modo de razonamiento configurable (el autor cita "reasoning high" en sus pruebas de MTP).

## Casos de uso

- Agente de codigo autonomo: con 1M de contexto puede mantener en memoria un repositorio mediano completo, alternar lecturas de ficheros, ejecutar tests y aplicar parches en un unico hilo de conversacion, sin trocear el estado del proyecto.
- Atencion al cliente con historial largo: 8 KiB por token permiten servir varias sesiones de 256k tokens con solo ~2 GiB de KV por sesion, lo que abarata el multiplexado de conversaciones largas en un mismo servidor.
- Analisis de documentos extensos y contratos: ingesta de manuales o expedientes de cientos de miles de tokens con precios de KV cache muy inferiores a los de un transformer de atencion completa del mismo tamano.
- Asistente de terminal y operaciones (CLI/DevOps): el modelo soporta tool calling encadenado, lo que permite exponer comandos de shell, consultas a APIs internas y lectura de logs como herramientas y dejar que el modelo itere hasta resolver el incidente.
- Revision de codigo en CI/CD: integrado como paso de pipeline via `llama-server` con API compatible con OpenAI, puede revisar diffs, señalar regresiones y proponer parches con contexto de todo el repositorio.
- Extraccion de datos estructurados multiidioma: al cubrir en/es/fr/de/it/ja, sirve para normalizar tickets, facturas o fichas de producto en seis idiomas de forma homogenea.
- Generacion asistida con decodificacion especulativa: en cargas interactivas, activar la cabeza MTP (Q4_0, `n_max 2`) reduce el tiempo de pared un 1,72× segun el autor, lo que hace viable usar el modelo en herramientas de edicion con respuesta cuasi-interactiva.
- Procesamiento por lotes de bajo coste energetico: al tener solo 12B parametros activos, el coste de FLOPs por token es mucho menor que el de un denso de 120B, util para clasificacion y resumen a gran escala.

## Benchmarks y rendimiento

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks academicos estandar en la informacion disponible. Los unicos datos son los de validacion del propio quant y de la suite agentica del autor:

| Prueba | Resultado |
|---|---|
| Gen check (prompts fijos + tool call encadenado) | 3/3 coherentes, 5/5 llamadas a herramienta |
| Perplejidad (`llama-perplexity`, wikitext-2, `-c 512`, 64 chunks) | 4,2777 ± 0,0767 (referencia BF16: 4,284; ratio −0,15 %) |
| Divergencia KL frente a logits BF16 | 0,0337 ± 0,0009 de media; mediana 0,0079; p95 0,134; p99 0,455 |
| Acuerdo en el token mas probable | 93,66 % same-top; RMS Δp 6,17 % |
| Suite agentica de codigo de 42 tareas | 42/42, 0 voids; 184,2 min; 119.938 tokens de salida |

Comparacion interna con la generacion anterior (Nemotron-3-Super), segun el autor: mismo 42/42, pero ~20 minutos mas rapido y ~28 % menos tokens de salida.

Efecto de la cabeza MTP (slice de calidad de 5 tareas, temp 1.0, reasoning high, contexto 262k):

| Configuracion | Aciertos | Tiempo de pared | Tokens de salida |
|---|---:|---:|---:|
| Sin drafter | 5/5 | 28,4 min | 23.203 |
| MTP Q4_0, `n_max 2` | 5/5 | 16,6 min | 19.294 |

Ganancia de 1,72× en tiempo de pared; decodificacion con prompt corto de 18,5 a 32,3 tok/s.

## Requisitos de hardware

- Pesos en disco y en memoria: 81,03 GB (75,46 GiB) en 5,37 bpw, repartidos en dos ficheros GGUF que deben permanecer en el mismo directorio (se carga la parte `00001`).
- KV cache: 8 KiB por token. Aproximadamente 2 GiB con 256k de contexto y 8 GiB con 1M (el estado de Mamba es de tamano constante, no escala con el contexto).
- Huella total estimada segun el autor: ~83 GiB con 256k y ~89 GiB con 1M, incluyendo pesos y KV.
- Cabe en un GB10 con 119 GiB de memoria unificada, dejando ~30 GiB para agentes y sistema operativo. No cabe en GPUs de consumo: 24 GB (RTX 4090) o 48 GB quedan muy por debajo de los 75,46 GiB de pesos. Se necesita un H100/H200 de 80-141 GB o un pool multi-GPU (estimacion: 2× A100 80 GB o 2× H100 80 GB, este dato no lo aporta el autor).
- Despliegue documentado: `llama.cpp` / `llama-server` con `-ngl 999 -fa on --jinja --ctx-size 65536 --parallel 1 --temp 1.0 --top-p 0.95 --top-k 20`. Es obligatorio fijar `--ctx-size` de forma explicita, porque sin el llama.cpp dimensiona la KV cache para el contexto de entrenamiento (1M).
- Vision: requiere añadir el `mmproj` de ggml-org con `--mmproj`, lo que suma 1,73 GB adicionales en BF16 y no esta incluido en este repositorio.
- Aceleracion: la cabeza MTP se carga como modelo draft con `--spec-type draft-mtp --model-draft mtp-...gguf --spec-draft-n-max 2`.
- Throughput medido en GB10: 18,5 tok/s de decodificacion con prompt corto sin drafter y 32,3 tok/s con MTP Q4_0.
- Otros motores (vLLM, TGI, Ollama, SGLang): no documentados en la informacion disponible para este artefacto GGUF.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / tamano | Licencia | Notas |
|---|---|---|---|---|---|
| Este quant (APEX i-quality) | 120,67B totales / ~12B activos | 1M | GGUF, 81,03 GB, 5,37 bpw | openmdw-1.1 | Solo texto; requiere mmproj aparte para vision |
| NVIDIA Nemotron-3.5 Super VL 120B A12B BF16 (original) | 120,67B totales / ~12B activos | 1M | BF16 safetensors/GGUF, ~225 GiB | openmdw-1.1 | Referencia de calidad; no cabe en un GB10 de 119 GiB |
| ggml-org NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-GGUF | 120,67B totales / ~12B activos | 1M | GGUF (BF16 + mmproj + MTP) | openmdw-1.1 | Repositorio de origen del que se deriva este quant; incluye vision y MTP |
| Nemotron-3-Super (generacion anterior) | no disponible | no disponible | no disponible | no disponible | Misma puntuacion 42/42 en la suite del autor, pero ~20 min mas lento y ~28 % mas tokens de salida |
| Laguna-S (modelo mixto SWA/global ~118B) | ~118B | 1M | no disponible | no disponible | Consume ~48 GiB de KV a 1M, por lo que no cabe en un GB10 de 119 GiB |

## Limitaciones y advertencias

- Este repositorio es solo el LLM de texto: si se necesita vision hay que descargar el `mmproj` de ggml-org (1,73 GB) y cargarlo con `--mmproj`; sin ese fichero el modelo no procesa imagenes.
- La cuantizacion usa asignacion estructural por rol de tensor, no un barrido de sensibilidad medido, porque el BF16 de 225 GiB no cabe residente en el hardware del autor. La divergencia KL media es baja (0,0337) pero la cola es apreciable (p99 = 0,455) y el acuerdo en el token mas probable es del 93,66 %, no del 100 %.
- Solo esta construido el tamano `i-quality`; los tamanos mas pequenos (`i-compact`, `i-mini`) estan anunciados pero no disponibles. El autor elimino el BF16 de origen tras cuantizar y lo volvera a descargar para el barrido de tamanos.
- La validacion se apoya en una suite propia de 42 tareas agenticas de codigo, sin resultados en benchmarks academicos estandar (MMLU, HumanEval, GSM8K). No hay comparacion independiente con otros modelos.
- La imatrix esta ponderada hacia codigo, lo que puede favorecer el rendimiento en tareas de programacion frente a otros dominios (prosa, derecho, medicina) respecto a una calibracion generica.
- Riesgo de alucinacion no cuantificado: no se han publicado evaluaciones de fidelidad ni de tasas de alucinacion en la informacion disponible.
- Cobertura linguistica limitada a seis idiomas (en, es, fr, de, it, ja); el rendimiento fuera de ellos no esta documentado.
- La licencia openmdw-1.1 esta etiquetada como `other` en HuggingFace y debe revisarse en el enlace oficial antes de cualquier uso comercial o redistribucion; no se detallan aqui sus terminos.
- El modelo necesita `--ctx-size` explicito en llama.cpp; sin el, la asignacion de KV para 1M puede agotar la memoria del sistema.
- Los dos ficheros GGUF deben mantenerse juntos en el mismo directorio y cargarse por la parte `00001`; renombrarlos o separarlos rompe la carga.
- No hay datos publicados de despliegue en vLLM, TGI u Ollama para este artefacto, ni metricas de throughput con concurrencia superior a 1.

## Enlaces

- Repositorio del quant: https://huggingface.co/Myric/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-APEX-GGUF
- Modelo base BF16: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16
- Repositorio de origen GGUF (mmproj, MTP, BF16): https://huggingface.co/ggml-org/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-GGUF
- Benchmarks del autor (42 tareas agenticas): https://huggingface.co/Myric/apex-quant-benchmarks
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- No se han encontrado enlaces adicionales relevantes en la busqueda web realizada (los resultados obtenidos no guardan relacion con el modelo).
