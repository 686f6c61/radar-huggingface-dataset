# Grawnch/Qwen3.8-Flash-Next-WV-3.5bpw-SM120

## Resumen

Qwen3.8-Flash-Next-WV-3.5bpw-SM120 es un checkpoint cuantizado a 3,5 bits por peso del modelo base Qwen/Qwen3.8-Flash-Next, publicado por el usuario Grawnch. Se trata de un empaquetado nativo para GPUs Blackwell (arquitectura `sm_120`) en formato safetensors, con un GGUF auxiliar que contiene la tabla de embeddings N-Gram de la capa 1. El modelo base es un transformer híbrido de tipo MoE con 180.000 millones de parametros totales, 48 capas (36 Gated DeltaNet y 12 Qwen Sparse Attention), 512 expertos enrutados mas 1 compartido y una ventana de contexto que el autor evalua a 128K tokens.

La relevancia de esta ficha es doble. Por un lado, documenta una tecnica de cuantizacion agresiva (3,5 bpw) que, segun el autor, mantiene una paridad muy alta con el checkpoint maestro (KLD de 0,001533 y 99,023 % de acuerdo Top-1 en logits). Por otro, demuestra que un modelo de 180B puede ejecutarse en una unica GPU profesional Blackwell (RTX PRO 6000 con 96 GB) gracias a una gestion cuidadosa de la memoria: 67,49 GiB en VRAM y 28,80 GB de la tabla PLE en RAM del host.

El autor marca este checkpoint como superado por una version posterior (2,96 bpw) y lo conserva por reproducibilidad de benchmarks. Aun asi, sus resultados publicados en AIME 2025 a 128K tokens (30/30 Pass@1) lo convierten en una referencia util para quienes necesiten validar pipelines de inferencia sobre hardware Blackwell.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido MoE: 36 capas Gated DeltaNet (GDN) + 12 capas Qwen Sparse Attention (QSA), 4-stream mHC Hyper-Connections |
| Parametros totales | 180 000 millones (modelo base) |
| Parametros activos | 512 expertos enrutados + 1 compartido (numero de activos por token no disponible) |
| Longitud de contexto | 128K tokens (131 072) en la evaluacion del autor; maxima nativa no disponible |
| Tipos de cuantizacion | 3,5 bpw (checkpoint principal); variantes del autor a 2,7 bpw y 2,96 bpw |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (shards de capas + globals + indexer QSA + drafter DFlash2) y GGUF auxiliar para la tabla PLE |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next emplea una arquitectura hibrida que combina capas Gated DeltaNet (un mecanismo de atencion lineal recurrente) con capas de Qwen Sparse Attention, distribuidas en 36 y 12 capas respectivamente sobre un total de 48. La capa MoE incorpora 512 expertos enrutados mas uno compartido, y el bloque incorpora 4-stream mHC Hyper-Connections. Una particularidad destacable es la tabla de embeddings N-Gram Per-Layer Embedding (PLE) de la capa 1, que ocupa 28,80 GB y se mantiene en RAM del host mediante zero-copy, sin consumir VRAM.

El checkpoint de Grawnch no reentrena el modelo: aplica una cuantizacion post-entrenamiento a 3,5 bpw con calibracion especifica para `sm_120`, e incluye pesos de un drafter de decodificacion especulativa (DFlash2) calibrado, de 241,8 MB, que se carga opcionalmente en GPU. El autor reporta una divergencia muy baja respecto al checkpoint maestro WV-3.5bpw: KLD de 0,001533 en Math/Code on-policy, 99,023 % de acuerdo Top-1 y similitud coseno de hidden states de 0,999465 en las 48 capas. No se dispone de informacion sobre el dataset de entrenamiento original, el numero de tokens vistos ni si hubo RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento de multiples pasos, con modo de pensamiento extendido implicito en la evaluacion (tokens medios de 25 241 en AIME 2025).
- Razonamiento matematico de alta dificultad: 30/30 Pass@1 en AIME 2025 a 128K tokens segun el autor.
- Generacion de codigo: el autor reporta KLD bajo en cargas Math/Code, aunque no publica resultados de HumanEval ni similares.
- Capacidades agenticas y de razonamiento multi-paso derivadas de la arquitectura MoE y del contexto largo.
- Soporte de tool calling / function calling: no confirmado en la informacion disponible.
- Capacidades multilingues: no disponible.
- Decodificacion especulativa integrada mediante el drafter DFlash2 calibrado, con verificacion exacta.
- Atencion dispersa Top-2048 sobre 128K tokens mediante el indexer QSA.

## Casos de uso

- Razonamiento matematico y cientifico de alta dificultad: el modelo esta validado en AIME 2025 a 128K tokens con decodificacion estocastica, por lo que encaja en pipelines de resolucion de problemas que requieran cadenas de pensamiento largas y verificacion.
- Analisis de documentos extensos: con 128K tokens de contexto y atencion dispersa Top-2048, puede procesar contratos, articulos o informes completos en una sola pasada sin truncamiento.
- Generacion de codigo en produccion: el checkpoint incluye drafter especulativo para reducir latencia en decodificacion autoregresiva, adecuado para asistentes de codigo que necesiten throughput alto en una sola GPU.
- Servicio de inferencia por lotes en una unica GPU: con 67,49 GiB de VRAM estatica y hasta 1.072.640 tokens de KV en pool, permite atender lotes de hasta B=30 con throughput de 1.281,3 tok/s en modo greedy.
- Reproduccion de benchmarks y validacion de hardware Blackwell: util para equipos que necesiten verificar pipelines de inferencia `sm_120` contra resultados publicados (AIME 2025, KLD frente al maestro).
- Investigacion en cuantizacion: sirve como referencia para estudiar el impacto de 3,5 bpw frente a BF16 y frente a variantes de 2,7 bpw en un modelo MoE de 180B.
- Despliegue en entornos con RAM de host abundante: la tabla PLE de 28,80 GB en RAM permite liberar VRAM para KV cache y aumentar el tamano de lote.

## Benchmarks y rendimiento

Resultados publicados por el autor en `MathArena/aime_2025` a 128K tokens, B=30, temp=1.0, top_p=0.95, top_k=20, sobre 1x RTX PRO 6000 Blackwell:

| Evaluacion | Politica de decodificacion | Pass@1 global | AIME 2025 I | AIME 2025 II | Truncados / bucles | Tokens medios (max) |
|---|---|---|---|---|---|---|
| v19 Pass A | presence_penalty=0.0, mask_eos_in_think=False | 30/30 (100,00 %) | 15/15 | 15/15 | 0/0 | 25 241,3 (89 807) |
| v19 Pass B | presence_penalty=0.2, mask_eos_in_think=True | 30/30 (100,00 %) | 15/15 | 15/15 | 0/0 | 25 849,6 (124 807) |
| v18 Mode 0 (64K) | strict vanilla (pp=0.0) | 22/30 (73,33 %) | 11/15 | 11/15 | 8/4 | 29 638,9 (65 536) |

Paridad y throughput frente al checkpoint maestro WV-3.5bpw:

| Metrica | v19 Mode 0 (3,5 bpw) | v19 Mode 2 (2,7 bpw) |
|---|---|---|
| KLD Math/Code on-policy vs WV-3.5bpw | 0,001533 | 0,039365 |
| Similitud coseno de hidden states (48 capas) | 0,999465 (min 0,998659) | 0,994985 |
| VRAM estatica (b_max=32) / pool KV | 67,49 GiB / 1 072 640 tokens | 51,17 GiB / 1 763 968 tokens |
| Greedy B=1 / 16 / 30 (tok/s) | 103,1 / 857,5 / 1 281,3 | 102,6 / 849,0 / 1 258,9 |
| Muestreo B=1 / 16 / 30 (tok/s) | 103,1 / 671,4 / 970,4 | 102,5 / 673,2 / 982,5 |
| Decodificacion especulativa B=1 | 204,19 tok/s (tau=5,14) | 262,17 tok/s (tau=6,35) |

No se han publicado resultados de MMLU, HumanEval ni GSM8K en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 67,49 GiB estaticos con `b_max=32` en modo 0; el pool KV puede llegar a 1.072.640 tokens. La tabla PLE (28,80 GB) reside en RAM del host, no en VRAM.
- GPU recomendadas: NVIDIA RTX PRO 6000 Blackwell (101,97 GB GDDR7, 1,79 TB/s), que es la plataforma usada por el autor. Requiere arquitectura `sm_120`; no es compatible con generaciones anteriores sin recompilar.
- Cabe en GPU de consumo: no con los 67,49 GiB estaticos. Solo cabria en GPUs profesionales Blackwell con 96 GB o mas; las RTX 4090 (24 GB) y similares quedan muy lejos.
- Opciones de despliegue: el checkpoint esta empaquetado para runtime propio del autor (manifiesto `sm120_manifest.json`, modo 0). Existe una variante GGUF estandar (`Qwen3.8-Flash-Next-3.5bpw-GGUF`) compatible con llama.cpp. No se confirma soporte para vLLM, TGI u Ollama en la informacion disponible.
- Latencia y throughput: 103,1 tok/s en B=1 greedy; 1.281,3 tok/s en B=30 greedy; 970,4 tok/s en B=30 con muestreo; 204,19 tok/s en decodificacion especulativa B=1 con tau=5,14.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-WV-3.5bpw-SM120 (este) | 180B totales (MoE) | 128K | 3,5 bpw, safetensors `sm_120` | Apache 2.0 | Hugging Face |
| Qwen3.8-Flash-Next-WV-Hybrid-2.7bpw-SM120 | 180B totales (MoE) | 128K | 2,7 bpw, safetensors `sm_120` | Apache 2.0 | Hugging Face |
| Qwen3.8-Flash-Next-WV-3.5bpw | 180B totales (MoE) | 128K | 3,5 bpw, GGUF (maestro) | Apache 2.0 | Hugging Face |
| Qwen3.8-Flash-Next-3.5bpw-GGUF | 180B totales (MoE) | 128K | 3,5 bpw, GGUF estandar llama.cpp | Apache 2.0 | Hugging Face |

No se dispone de datos de benchmarks de modelos de otros autores comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Checkpoint marcado como superado por el propio autor: recomienda la version 2,96 bpw para uso nuevo y conserva esta solo por reproducibilidad.
- Requiere hardware Blackwell (`sm_120`); no es portable a GPUs Ampere, Ada ni Hopper sin recompilar el runtime.
- Depende de un runtime propietario del autor (manifiesto `sm120_manifest.json`), lo que reduce la portabilidad frente a un GGUF estandar.
- La tabla PLE exige 28,80 GB de RAM de host con zero-copy; entornos con RAM limitada no podran cargar el modelo.
- Los benchmarks publicados son del autor y se limitan a AIME 2025; no hay validacion independiente de MMLU, HumanEval, GSM8K ni tareas multilingues.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible; aplican los del modelo base Qwen3.8-Flash-Next.
- Idiomas soportados no especificados; no se recomienda asumir cobertura multilingue sin validacion.
- Uso comercial permitido por licencia Apache 2.0, pero conviene verificar la licencia del modelo base y de los pesos del drafter DFlash2 por separado.
- La cuantizacion a 3,5 bpw introduce una divergencia medible (KLD 0,001533) frente al maestro; en tareas de altisima precision puede ser relevante.

## Enlaces

- Hugging Face (este checkpoint): https://huggingface.co/Grawnch/Qwen3.8-Flash-Next-WV-3.5bpw-SM120
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Checkpoint recomendado por el autor (2,96 bpw): https://huggingface.co/Grawnch/Qwen3.8-Flash-Next-WV-2.96bpw-SM120
- Variante 2,7 bpw: https://huggingface.co/Grawnch/Qwen3.8-Flash-Next-WV-Hybrid-2.7bpw-SM120
- Checkpoint maestro WV 3,5 bpw (GGUF): https://huggingface.co/Grawnch/Qwen3.8-Flash-Next-WV-3.5bpw
- Variante GGUF estandar para llama.cpp: https://huggingface.co/Grawnch/Qwen3.8-Flash-Next-3.5bpw-GGUF
