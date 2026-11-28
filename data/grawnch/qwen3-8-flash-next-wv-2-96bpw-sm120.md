# Grawnch/Qwen3.8-Flash-Next-WV-2.96bpw-SM120

## Resumen

Qwen3.8-Flash-Next-WV-2.96bpw-SM120 es una cuantizacion de 2,96 bits por peso del modelo Qwen/Qwen3.8-Flash-Next, un transformer MoE hibrido de 180.000 millones de parametros totales publicado por Alibaba Qwen y adaptado aqui por el usuario independiente Grawnch. El checkpoint empaqueta los pesos cuantizados con un runtime propietario (wv_universal_runtime) y un drafter especulativo DFlash2 calibrado, todo autocontenido en 79,50 GB. Su proposito es permitir servir un modelo de 180B en una unica GPU Blackwell de 96 GB (RTX PRO 6000) o, en modo hibrido, en una RTX 5090 de 32 GB con al menos 64 GB de RAM de sistema.

La relevancia del lanzamiento esta en el binomio tamano-calidad: segun la model card, ocupa menos disco que una cuantizacion GGUF UD-Q2_K_XL (79,58 GB) pero logra menor divergencia KL y mayor acuerdo Top-1 frente a la referencia BF16 en 16.384 tokens de validacion ciega. Ademas incluye decodificacion especulativa integrada que multiplica por 2-4 la velocidad de generacion en un solo flujo. Es, por tanto, una pieza pensada para despliegue de inferencia en hardware consumer de gama alta o workstation, no para entrenamiento.

La arquitectura subyacente combina 48 capas hibridas (36 Gated DeltaNet y 12 Qwen Sparse Attention), 512 expertos enrutados mas 1 compartido y Hyper-Connections de 4 flujos. La licencia declarada es Apache 2.0. La informacion disponible no detalla la longitud de contexto nativa del modelo base ni los idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE hibrido: 36 capas Gated DeltaNet (GDN) + 12 capas Qwen Sparse Attention (QSA), 512 expertos enrutados + 1 compartido, Hyper-Connections mHC de 4 flujos |
| Parametros totales | 180.000 millones (modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible en la informacion proporcionada (el runtime se ha verificado con max-seq 8192 y prefill hasta 32.768 tokens) |
| Tipos de cuantizacion | 2,96 bpw (wave-quant WV6); PLE en Q4_0; KV cache opcional FP4 (e2m1 hibrido) en Blackwell |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoint cuantizado) + runtime SASS-only sm_120 en wheel |
| Tamano del checkpoint | 79,50 GB (79.499.755.138 bytes), incluye 28,80 GB de PLE Q4_0 y 563,8 MB de drafter DFlash2 |
| Hardware objetivo | NVIDIA Blackwell sm_120 (RTX PRO 6000 96 GB o RTX 5090 32 GB en modo hibrido) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un transformer de mezcla de expertos con atencion hibrida: 36 de sus 48 capas usan Gated DeltaNet, un mecanismo de estado recurrente lineal, y las 12 restantes emplean Qwen Sparse Attention. Cada capa MoE dispone de 512 expertos enrutados mas uno compartido, y el bloque incorpora Hyper-Connections de 4 flujos (mHC), una variante de conexiones residuales multi-flujo. Esta combinacion busca reducir el coste de atencion en contextos largos manteniendo capacidad de recuperacion exacta en las capas QSA.

Sobre el entrenamiento del modelo base no se aporta informacion en la documentacion disponible: no se detalla el volumen de tokens, la composicion del corpus ni si hubo fases de RLHF o DPO. Lo que si documenta el autor es el proceso de cuantizacion: pesos a 2,96 bits por peso con el esquema wave-quant, PLE (probablemente embeddings posicionales o de capa) en Q4_0 y calibracion del drafter especulativo DFlash2 contra la referencia BF16. El runtime v22.5.0 es SASS-only para sm_120, compilado para Python 3.13 y CUDA 13.0, e incluye soporte nativo de KV cache FP4 en Blackwell para duplicar la capacidad de contexto en VRAM.

## Capacidades

- Generacion de texto conversacional y continuacion de texto (pipeline text-generation).
- Razonamiento con modo thinking: el servidor admite `thinking_token_budget` y `--inline-think` para emitir el bloque `` dentro de `delta.content`.
- Tool calling y function calling: soporta el parametro `tools` y devuelve `tool_calls` incrementales en la API compatible con OpenAI.
- Salida estructurada: `response_format` con JSON schema validado mediante FSM.
- Generacion multiple: parametro `n > 1` en `/v1/chat/completions`.
- Relleno en medio (FIM) a traves del endpoint `/v1/completions`.
- Compatibilidad con APIs OpenAI (chat completions, responses, completions) y Anthropic Messages (para Claude Code).
- Decodificacion especulativa integrada con el drafter DFlash2 para acelerar la generacion.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Vision y audio: no disponible; no se mencionan en la documentacion.

## Casos de uso

- Servicio de chat en una unica GPU de workstation: con 79,50 GB de checkpoint y 47,20 GiB en VRAM, el modelo cabe entero en una RTX PRO 6000 Blackwell de 96 GB y expone un servidor compatible con OpenAI, lo que permite sustituir un endpoint en la nube por inferencia local con privacidad de datos.
- Asistente de codigo integrado en IDE: el endpoint `/v1/completions` con FIM y el tool calling incremental permiten construir autocompletado y edicion multi-archivo; la decodificacion especulativa alcanza 266,48 tok/s en codigo segun las mediciones del autor.
- Generacion de JSON estructurado en pipelines de datos: el `response_format` con JSON schema FSM garantiza salidas validas sin post-procesado, util para extraccion de entidades o enriquecimiento de registros a granel.
- Agentes multi-paso con herramientas: el soporte de `tool_calls` incrementales y de la API Responses de OpenAI facilita orquestar agentes que encadenan busquedas, ejecucion de codigo y llamadas a APIs internas.
- Razonamiento matematico y analisis: el modo thinking con presupuesto de tokens configurable y los 372,60 tok/s especulativos en matematicas lo hacen viable para resolver problemas paso a paso en lotes.
- Despliegue en estacion de trabajo con RTX 5090: el modo `--force-32gb` permite ejecutar el modelo en 32 GB de VRAM con 64 GB de RAM de sistema, adecuado para prototipado y demos sin adquirir hardware de centro de datos.
- Servicio de inferencia por lotes: con decodificacion batcheada de 762,9 tok/s a B=4 y 1.960,2 tok/s a B=16 en contexto de 2K, sirve para clasificacion, resumen o generacion masiva en una sola maquina.

## Benchmarks y rendimiento

La model card no incluye resultados de benchmarks estandar (MMLU, HumanEval, GSM8K). Lo que publica son metricas de fidelidad de cuantizacion frente a la referencia BF16 en validacion ciega, y mediciones de throughput del runtime.

| Metrica de fidelidad | BF16 | WV 2.96bpw | UD-Q2_K_XL | EXL3 3.05bpw | ISTA IQ3_S |
|---|---|---|---|---|---|
| KLD media All_Val_16384 (menor mejor) | 0,00000 | 0,13178 | 0,13489 | 0,09374 | 0,15075 |
| Top-1 / Top-5 All_Val_16384 | 100% / 100% | 90,44% / 99,18% | 89,74% / 99,02% | 91,95% / 99,49% | 89,81% / 99,14% |
| PPL All_Val_16384 | 2,9152 | 3,0110 | 2,8626 | 2,9293 | 2,9735 |
| KLD WT2_1024 | 0,00000 | 0,22731 | 0,24030 | 0,15682 | 0,23298 |
| KLD WT2_2048 | 0,00000 | 0,20373 | 0,20982 | 0,14646 | 0,23223 |

| Throughput verificado (RTX PRO 6000, sm_120a, v1.5.1) | Medicion |
|---|---|
| Decodificacion simple M=1, B=1 | 109,96 tok/s |
| Decodificacion especulativa B=1 | codigo 266,48; matematicas 372,60; JSON 444,90; prosa 212,20 tok/s |
| Decodificacion batcheada (2K contexto) | 762,9 tok/s (B=4); 1.361,8 tok/s (B=8); 1.960,2 tok/s (B=16) |
| Prefill S=512 | 2.927,1 tok/s (174,92 ms) |
| Prefill S=2048 | 6.101,1 tok/s (335,67 ms) |
| Prefill S=8192 | 7.583,0 tok/s (1.080,31 ms) |
| Prefill S=32768 | 7.414,3 tok/s (4.419,55 ms) |

## Requisitos de hardware

- VRAM estimada: 47,20 GiB en modo todo-VRAM segun la model card; el checkpoint completo ocupa 79,50 GB en disco.
- GPU soportadas: exclusivamente NVIDIA Blackwell con capacidad de computo sm_120. La model card cita RTX PRO 6000 de 96 GB para modo todo-VRAM y RTX 5090 de 32 GB para modo hibrido `--force-32gb` (requiere al menos 64 GB de RAM de sistema).
- GPU consumer: si, la RTX 5090 de 32 GB mediante el modo hibrido; no hay soporte mencionado para generaciones anteriores (Ampere, Ada).
- Software: Linux x86_64 (o Windows segun el runtime universal), Python 3.13, CUDA 13.0 con PyTorch, transformers y safetensors; el runtime se instala desde el wheel `wv_runtime_installer-1.5.2` y el servidor se lanza con `python -m qfn_sm120_unified.serve`.
- Opciones de despliegue: servidor propio `qfn_sm120_unified.serve` con endpoints OpenAI y Anthropic; no se menciona compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: ver tabla de benchmarks; prefill de 512 tokens en 174,92 ms y decodificacion simple de 109,96 tok/s en RTX PRO 6000.
- Optimizacion opcional: `--kv-mode fp4_e2m1_hybrid` duplica la capacidad de contexto en VRAM usando KV cache FP4 nativa de Blackwell.

## Comparativa con modelos similares

| Modelo | Parametros | Tamano en disco | KLD All_Val_16384 | Top-1 | Licencia | Formato |
|---|---|---|---|---|---|---|
| WV 2.96bpw-SM120 (este) | 180B totales | 79,50 GB | 0,13178 | 90,44% | Apache 2.0 | safetensors + runtime sm_120 |
| UD-Q2_K_XL | 180B totales | 79,58 GB | 0,13489 | 89,74% | Apache 2.0 (heredada) | GGUF |
| EXL3 3.05bpw_h5_ng5 | 180B totales | 85,14 GB | 0,09374 | 91,95% | Apache 2.0 (heredada) | EXL3 |
| ISTA IQ3_S | 180B totales | 83,62 GB | 0,15075 | 89,81% | Apache 2.0 (heredada) | GGUF |

Frente a las alternativas, este checkpoint es el mas pequeno de los cuatro comparados y supera en fidelidad a UD-Q2_K_XL e ISTA IQ3_S, aunque EXL3 3.05bpw logra mejor KLD y Top-1 a costa de 5,64 GB adicionales. La diferencia clave es la dependencia exclusiva de hardware Blackwell sm_120, frente a la portabilidad de GGUF o EXL3.

## Limitaciones y advertencias

- Dependencia de hardware: el runtime es SASS-only para sm_120; no funciona en GPUs Ampere, Ada ni en Blackwell con otra capacidad de computo. Esto limita drasticamente el hardware desplegable.
- Ecosistema cerrado: no hay soporte documentado para vLLM, llama.cpp, Ollama o TGI; el despliegue requiere el servidor propietario `qfn_sm120_unified.serve`.
- Perdida de fidelidad por cuantizacion: la KLD media de 0,13178 y el Top-1 del 90,44% implican que aproximadamente uno de cada diez tokens difiere del modelo BF16; en tareas sensibles a la precision puede ser insuficiente.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no se documentan evaluaciones especificas de veracidad ni de sesgos.
- Idiomas y contexto nativo: no se especifican en la informacion disponible, por lo que no puede garantizarse el rendimiento multilingue ni la ventana de contexto real del modelo base.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base Qwen3.8-Flash-Next y los terminos del runtime binario, que se distribuye como wheel precompilado sin codigo fuente.
- Madurez: el repositorio tiene 184 descargas y 0 likes, creado en noviembre de 2026; es un artefacto de un autor individual sin validacion independiente de la comunidad.
- Modo hibrido: `--force-32gb` en RTX 5090 depende de la RAM de sistema y puede degradar el throughput respecto a las cifras publicadas, que se midieron en RTX PRO 6000.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Grawnch/Qwen3.8-Flash-Next-WV-2.96bpw-SM120
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio de binarios del runtime: https://huggingface.co/Grawnch/wv-runtime-binaries
- Wheel del instalador: https://huggingface.co/Grawnch/wv-runtime-binaries/resolve/main/wheels/wv_runtime_installer-1.5.2-py3-none-any.whl
