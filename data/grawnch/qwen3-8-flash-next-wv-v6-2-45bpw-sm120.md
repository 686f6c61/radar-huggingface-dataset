# Grawnch/Qwen3.8-Flash-Next-WV-v6-2.45bpw-SM120

## Resumen

Qwen3.8-Flash-Next-WV-v6-2.45bpw-SM120 es una cuantizacion nativa de 2,45 bits por peso del modelo Qwen/Qwen3.8-Flash-Next, publicada por el usuario Grawnch. No se trata de un modelo entrenado desde cero, sino de un checkpoint derivado (finetune/cuantizacion) que empaqueta los pesos originales en formato safetensors junto con un runtime propietario optimizado exclusivamente para GPUs NVIDIA Blackwell con arquitectura `sm_120`. El modelo base es un MoE de 180.000 millones de parametros totales con 48 capas hibridas (36 Gated DeltaNet y 12 Qwen Sparse Attention), 512 expertos enrutados mas uno compartido y conexiones hiper-residuales de cuatro flujos (mHC).

La relevancia de esta publicacion radica en que comprime un MoE de 180B hasta 79,5 GB en disco y unos 54,43 GiB de VRAM residente en modo all-VRAM, lo que permite servirlo en una sola GPU profesional Blackwell (RTX PRO 6000 de 96 GB) o en una RTX 5090 de 32 GB mediante tiering hibrido VRAM/RAM. Incorpora ademas decodificacion especulativa con un drafter DFlash2 calibrado y un indexador QSA disperso de 128K, lo que se traduce en tasas de decodificacion de entre 183 y 665 tok/s segun el tamano de lote.

El modelo esta pensado para generacion de texto conversacional y agentica, con soporte nativo de tool calling, streaming de argumentos JSON y endpoints compatibles con OpenAI, Anthropic Messages y OpenAI Responses. La licencia declarada es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE hibrido: 36 capas Gated DeltaNet (GDN) + 12 capas Qwen Sparse Attention (QSA), con 4-stream mHC Hyper-Connections |
| Parametros totales | 180B (modelo base) |
| Parametros activos | no disponible (512 expertos enrutados + 1 compartido; no se especifica el numero activo por token) |
| Longitud de contexto | 128K (indexador QSA disperso); el servidor de ejemplo arranca con `--max-seq 8192` |
| Tipos de cuantizacion | 2,45 bpw en safetensors; capa PLE en Q4_0 puro; indexador QSA disperso de 128K |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (mas drafter DFlash2 y wheel de runtime `qfn_sm120_unified`) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next emplea una arquitectura MoE hibrida que combina 36 capas Gated DeltaNet (un mecanismo de atencion lineal con estado recurrente) y 12 capas de Qwen Sparse Attention (QSA), con un total de 48 capas. Cada capa MoE contiene 512 expertos enrutados mas un experto compartido, y el bloque incorpora conexiones hiper-residuales de cuatro flujos (mHC). El checkpoint WV6 no reentrena el modelo: aplica una cuantizacion agresiva a 2,45 bpw, conserva la capa PLE en Q4_0 puro dentro de safetensors y anade un indexador QSA disperso de 128K para el contexto largo.

La innovacion tecnica principal de esta publicacion es el empaquetado de un runtime SASS-only especifico para `sm_120` (Blackwell) que incluye decodificacion especulativa con un drafter DFlash2 calibrado, cache de prefijo asincrono fijado en memoria y un servidor multiprotocolo. No se dispone de informacion sobre el dataset de entrenamiento del modelo base, el numero de tokens vistos, ni si se aplicaron fases de RLHF o DPO; esos datos no aparecen en la model card proporcionada.

## Capacidades

- Generacion de texto conversacional multi-turno con modo de razonamiento explicito (``) y `reasoning_content` en las respuestas.
- Razonamiento matematico y resolucion de problemas (AIME 2025 con 80,0% Pass@1 segun la model card).
- Generacion de codigo en produccion, incluida la modalidad FIM (fill-in-the-middle) mediante el token `<|fim_prefix|>`.
- Tool calling y function calling con streaming incremental de argumentos JSON token a token.
- Soporte de agentes multi-paso mediante endpoints compatibles con OpenAI Chat Completions, Anthropic Messages (Claude Code) y OpenAI Responses (Codex CLI).
- Salida estructurada con `response_format` (`json_object` y `json_schema`) y FSM de JSON restringido por gramatica en GPU.
- Control de presupuesto de razonamiento por peticion (`thinking_token_budget`, `thinking.budget_tokens`) con inyeccion limpia de ``.
- Deteccion de repeticiones y guardas de bucle, `min_tokens`, `stop_token_ids` y ramificacion `n > 1`.
- Cache de prefijo asincrono para compartir system prompts y esquemas de herramientas entre peticiones, con `cache_salt` para aislamiento por inquilino.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede mantener conversaciones multi-turno con contexto largo gracias a su ventana de 128K y a la cache de prefijo asincrona, que reutiliza el system prompt entre peticiones y reduce la latencia en despliegues con muchos usuarios concurrentes.
- Generacion de codigo en produccion: soporta tool calling, FIM y salida estructurada, por lo que puede integrarse en pipelines de CI/CD para autocompletar, revisar parches o generar tests con validacion JSON garantizada por el FSM en GPU.
- Agentes autonomos de multiples pasos: los endpoints compatibles con Anthropic Messages y OpenAI Responses permiten conectarlo directamente a Claude Code o Codex CLI sin adaptadores, con streaming incremental de los argumentos de cada herramienta.
- Asistencia matematica y cientifica: el rendimiento en AIME 2025 (24/30) y su modo de razonamiento con presupuesto de tokens lo hacen adecuado para tutoria o resolucion asistida de problemas, controlando el coste mediante `thinking_token_budget`.
- Despliegue en una sola GPU profesional: con 54,43 GiB de VRAM residente en modo all-VRAM cabe en una RTX PRO 6000 de 96 GB, lo que permite servir un MoE de 180B sin cluster ni paralelismo multi-nodo.
- Inferencia en estacion de trabajo con RTX 5090: el modo hibrido VRAM/RAM mantiene menos de 28 GiB residentes en GPU, habilitando prototipado y demos locales de un modelo de gran escala en hardware de consumo profesional.
- Servicio de API interna compatible con OpenAI: el servidor expone `/v1/chat/completions`, `/v1/models`, `/metrics` (Prometheus) y `/slots`, lo que facilita integrarlo como backend en herramientas existentes sin reescribir clientes.
- Generacion de JSON estrictamente valido: con `response_format: json_schema` y el FSM en GPU se obtiene un 100% de JSON valido a 248,76 tok/s en lote de 4, util para extraccion de datos o enrutamiento estructurado.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card, medidos sobre una NVIDIA RTX PRO 6000 Blackwell:

| Benchmark / metrica | Resultado |
|---|---:|
| Perplejidad 8K QSA (`All_8192` / `Mid_2048_4096` / `Late_4096_8192`) | 3,1068 / 2,7302 / 3,2251 |
| AIME 2025 (`MathArena/aime_2025`, 30 problemas, Pass@1) | 24/30 (80,0%), 265,3 tok/s, mean_tau 4,26 |
| LiveCodeBench v6 completo (175 problemas, presupuesto 96K, Pass@1) | 133/175 (76,0%) |
| LiveCodeBench v6 Easy | 97,67% (42/43) |
| LiveCodeBench v6 Medium | 92,31% (48/52) |
| LiveCodeBench v6 Hard-Top30 | 70,0% (21/30) |
| Throughput especulativo B=1 | 183,70 tok/s (mean_tau 3,491) |
| Throughput especulativo B=2 (16K QSA disperso) | 306,00 tok/s (mean_tau 4,667) |
| Throughput especulativo B=4 | 349,76 tok/s (mean_tau 3,917) |
| Throughput especulativo B=8 | 477,13 tok/s (mean_tau 3,559) |
| Throughput especulativo B=16 | 665,65 tok/s (mean_tau 3,568) |
| JSON FSM en GPU (B=4) | 248,76 tok/s, 100% JSON valido, mean_tau 3,538 |

No se han publicado en la informacion disponible resultados comparativos con otros modelos (MMLU, HumanEval u otros) mas alla de los anteriores.

## Requisitos de hardware

- VRAM estimada en modo all-VRAM: 54,43 GiB residentes en GPU, mas 26,82 GiB de PLE fijados en RAM del host (`ple_q4_0.safetensors`).
- Modo hibrido para RTX 5090 de 32 GB: menos de 28,0 GiB residentes en GPU (`fits_32gib_rtx5090 = true`), con tiering VRAM/RAM.
- GPU soportadas por el runtime: NVIDIA Blackwell `sm_120` (RTX PRO 6000 de 96 GB o RTX 5090 de 32 GB con al menos 64 GB de RAM de sistema). El wheel universal cubre `sm_80`-`sm_120a` en Linux y Windows, pero el checkpoint esta empaquetado para `sm_120`.
- Requisitos de software: Linux x86_64, Python 3.13, `torch==2.14.1+cu130` (CUDA 13.0), `transformers>=5.22.1` y `safetensors`.
- Despliegue: runtime propietario `qfn_sm120_unified` (v22.4.0) instalado via `wv_runtime_installer` 1.5.2; expone servidor compatible con OpenAI, Anthropic y OpenAI Responses. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- Throughput observado: de 183,70 tok/s (B=1) a 665,65 tok/s (B=16) en decodificacion especulativa; 248,76 tok/s con JSON FSM en B=4.
- Tamano en disco del repositorio: 79,5 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / runtime | Notas |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-WV-v6-2.45bpw-SM120 (este) | 180B (MoE) | 128K | Apache 2.0 | safetensors + runtime `sm_120` propietario | Cuantizado a 2,45 bpw; solo Blackwell |
| Qwen/Qwen3.8-Flash-Next (base) | 180B (MoE) | no disponible | Apache 2.0 | safetensors | Pesos originales sin cuantizar; requiere mucho mas VRAM |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de benchmarks comparables en la informacion proporcionada |

No se han encontrado en la informacion proporcionada otros modelos cuantizados directamente comparables con resultados de benchmarks publicados.

## Limitaciones y advertencias

- Dependencia de hardware: el checkpoint esta empaquetado para `sm_120` (Blackwell) y el runtime es SASS-only; no funcionara en GPUs Ampere, Ada u Hopper sin una version distinta del runtime.
- Runtime propietario: la inferencia requiere el wheel `wv_runtime_installer` y el paquete `qfn_sm120_unified`, no integrables con vLLM, llama.cpp, Ollama o TGI, lo que limita la portabilidad y la auditoria del codigo.
- Cuantizacion agresiva a 2,45 bpw: aunque la perplejidad 8K declarada es de 3,1068, no se ofrecen comparaciones con el modelo base sin cuantizar, por lo que la degradacion real frente a los pesos originales no esta cuantificada.
- Idiomas soportados no declarados: la model card no especifica la cobertura multilingue, lo que impide garantizar calidad fuera del ingles.
- Sesgos conocidos: no se documenta ninguna evaluacion de sesgos, toxicidad o alineacion en la informacion disponible.
- Riesgo de alucinacion: inherente a los modelos generativos; el autor menciona guardas de repeticion y presupuesto de razonamiento, pero no se aportan metricas de fidelidad factual.
- Repositorio de 79,5 GB: la descarga y el almacenamiento requieren planificacion; se recomienda `HF_XET_HIGH_PERFORMANCE=1` para acelerar la transferencia.
- Ausencia de likes y de validacion externa: el modelo acumula 1.719 descargas y 0 likes en el momento de la consulta, sin evaluaciones independientes conocidas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el runtime asociado se distribuye por separado y conviene revisar sus terminos antes de desplegarlo en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Grawnch/Qwen3.8-Flash-Next-WV-v6-2.45bpw-SM120
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Runtime universal: https://huggingface.co/Grawnch/wv-runtime-binaries
- Wheel del instalador: https://huggingface.co/Grawnch/wv-runtime-binaries/resolve/main/wheels/wv_runtime_installer-1.5.2-py3-none-any.whl
- Benchmark AIME 2025: https://huggingface.co/datasets/MathArena/aime_2025
- Papers, blogs o demos adicionales: no disponibles en la informacion proporcionada.
