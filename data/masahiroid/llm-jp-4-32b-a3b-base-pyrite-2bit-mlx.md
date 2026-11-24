# masahiroid/llm-jp-4-32b-a3b-base-Pyrite-2bit-MLX

## Resumen

`llm-jp-4-32b-a3b-base-Pyrite-2bit-MLX` es una cuantizacion ultra-baja de 2 bits del modelo base `llm-jp/llm-jp-4-32b-a3b-base`, desarrollada por el usuario `masahiroid` mediante el pipeline de cuantizacion Project Pyrite. El modelo original emplea la arquitectura Qwen3-MoE con 31,8 mil millones de parametros totales, 3,0 mil millones de parametros activos, 32 capas, 128 expertos enrutados y enrutamiento top-8. Esta version comprimida esta disenada especificamente para ejecutarse en equipos Apple Silicon con 16 GB de memoria unificada.

El objetivo del autor es resolver el problema de la degradacion severa que sufren las cuantizaciones uniformes de 2 bits en arquitecturas MoE: bucles de repeticion y colapso estructural. Para ello, Project Pyrite aplica una asignacion de bits guiada por sensibilidad que mantiene exactamente el mismo presupuesto de bytes que una cuantizacion uniforme de 2 bits con `group_size=64`, pero redistribuye la precision hacia las proyecciones mas sensibles a los valores atipicos.

La relevancia actual del modelo radica en que demuestra que es posible ejecutar un LLM de tipo MoE de 32 mil millones de parametros en hardware de consumo con 16 GB, manteniendo una fidelidad de enrutamiento del 98,25% respecto al profesor BF16 y alcanzando velocidades de 34 a 49 tokens por segundo en un Apple M2 Pro. El modelo esta pensado para generacion de texto en japones e ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-MoE (transformer con mezcla de expertos, 32 capas, 128 expertos enrutados, top-8) |
| Parametros totales | 32.139.028.992 (32,1 B) |
| Parametros activos | 3,0 B (8 de 128 expertos por token) |
| Longitud de contexto | no disponible (el autor reporta pruebas a 4096 tokens) |
| Tipos de cuantizacion | MLX mixed-precision: 2-bit/group_size=128 en gate_proj y up_proj de expertos; 3-bit/group_size=64 en 15 proyecciones tardias sensibles (L21-L31 down_proj, L29-L31 gate/up_proj); 4-bit/group_size=64 en embed_tokens, lm_head y proyecciones de atencion; 8-bit/group_size=64 en los 32 routers |
| Idiomas soportados | japones (ja), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), tamano del repo 10,5 GB |

## Arquitectura y entrenamiento

El modelo base sigue la arquitectura Qwen3-MoE: 32 capas transformer con 128 expertos enrutados por capa y enrutamiento top-8, lo que resulta en 3,0 B de parametros activos sobre un total de 31,8 B. Los 128 expertos enrutados por capa (`mlp.switch_mlp.{gate_proj, up_proj, down_proj}`) concentran el 94,8% de los parametros totales. La cuantizacion fue realizada por `masahiroid` sobre los pesos del modelo base ya entrenado; no se dispone de informacion sobre el dataset de entrenamiento original, el numero de tokens ni si hubo RLHF o DPO.

La innovacion tecnica principal es el pipeline Project Pyrite, que realiza una asignacion de bits guiada por sensibilidad con presupuesto de bytes fijo. Partiendo de un baseline uniforme de 2 bits con `group_size=64` (10.533.950.464 bytes), se reduce la precision de las escalas de grupo en `gate_proj` y `up_proj` (de `group_size=64` a `group_size=128`, ahorrando 629.145.600 bytes) y se reinvierte exactamente ese ahorro en subir a 3 bits con `group_size=64` las 15 proyecciones con mayor error de cuantizacion ponderado por activacion (L21-L31 `down_proj` y L29-L31 `gate/up_proj`). Ademas, los 32 routers (`mlp.gate.weight`) se protegen a 8 bits con `group_size=64`, con un coste de solo 0,0098 GiB, preservando el 98,25% de acuerdo en la seleccion top-8 de expertos respecto al profesor BF16. El resultado es una reduccion del 10,98% en divergencia KL frente al profesor BF16 (de 0,3583 a 0,3190) sin ningun coste adicional de bytes.

## Capacidades

- Generacion de texto en japones e ingles, con especial orientacion al japones por herencia del modelo base llm-jp.
- Razonamiento y conocimiento general, aunque degradado respecto al modelo BF16 por la cuantizacion de 2-3 bits.
- Capacidad multilingue limitada a japones e ingles.
- Inferencia eficiente en Apple Silicon gracias al backend MLX y a la evaluacion de solo 8 expertos por token.
- Ejecucion en memoria unificada de 16 GB con pesos de 9,81 GiB.
- Soporte de decodificacion autoregresiva estandar mediante `mlx-lm` (clases `QuantizedLinear` y `QuantizedSwitchLinear`).
- No se documenta soporte explicito de tool calling, function calling, agentes, vision, audio ni modo thinking en la informacion disponible.

## Casos de uso

- Asistente de escritorio local en japones: el modelo puede gestionar conversaciones multi-turno completamente offline en un Mac de 16 GB, sin enviar datos a la nube, gracias a sus 9,81 GiB de pesos residentes en memoria unificada.
- Prototipado rapido de aplicaciones LLM en Apple Silicon: permite validar prompts, flujos y plantillas de generacion en japones antes de escalar a un modelo mayor o a un servicio en la nube, con 34-49 tok/s en un M2 Pro.
- Generacion de texto y borradores en japones para documentacion tecnica o contenidos internos, donde la calidad de un modelo de 32B cuantizado es suficiente y la confidencialidad es prioritaria.
- Investigacion sobre cuantizacion de MoE: sirve como referencia reproducible del pipeline Project Pyrite para estudiar el impacto de la asignacion de bits por sensibilidad en la fidelidad del enrutamiento.
- Evaluacion comparativa de cuantizaciones: util para medir divergencia KL, perplejidad y fidelidad top-8 frente a baselines uniformes de 2 bits en tareas de investigacion.
- Despliegue en entornos con conectividad limitada o air-gapped: al caber en un portatil de 16 GB, permite disponer de un LLM de 32B sin infraestructura de servidor.
- Educacion y demostraciones: permite mostrar el funcionamiento interno de un MoE de 128 expertos en hardware de consumo, con inspeccion del enrutamiento y de las capas cuantizadas.

## Benchmarks y rendimiento

| Metrica | Baseline 2-bit uniforme | Pyrite 2-bit | Delta |
|---|---|---|---|
| Bytes de tensores | 10.533.950.464 | 10.533.950.464 | 0 (sin coste) |
| Divergencia KL vs BF16 (global) | 0,3583 | 0,3190 | -10,98% |
| Perplejidad japones (held-out) | 10,84 | 10,35 | mejora |
| Divergencia KL ingles (held-out) | no disponible | no disponible | -12,94% |
| Perplejidad ingles (held-out) | 5,83 | 5,42 | mejora |
| Fidelidad top-8 del router vs BF16 | no disponible | 98,25% | no disponible |
| Memoria pico a 4096 tokens | no disponible | 10,11 GiB | no disponible |
| Velocidad de decodificacion (M2 Pro 16 GB) | no disponible | 34-49 tok/s | no disponible |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 9,81 GiB de pesos; 10,11 GiB de pico a 4096 tokens de contexto.
- Hardware objetivo: Apple Silicon con 16 GB de memoria unificada (validado en Apple M2 Pro).
- Configuracion recomendada en 16 GB: elevar el limite de memoria Metal wired a 11,0 GiB con `mx.set_wired_limit` y materializar las capas secuencialmente para evitar thrashing de pagina en SSD.
- Cabe en GPU de consumo Apple Silicon de 16 GB; no esta disenado para GPU NVIDIA (formato MLX).
- Opciones de despliegue: `mlx-lm` (libreria oficial), con carga mediante `load_model` y `make_prompt_cache`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Throughput: 34-49 tokens/s en decodificacion de un solo stream en M2 Pro 16 GB.
- Latencia de prefill: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Cuantizacion | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| llm-jp-4-32b-a3b-base-Pyrite-2bit-MLX | 32,1 B / 3,0 B | no disponible | 2-3 bits mixed (MLX) | Apache 2.0 | Apple Silicon 16 GB |
| llm-jp/llm-jp-4-32b-a3b-base (BF16) | 32,1 B / 3,0 B | no disponible | BF16 | Apache 2.0 | GPU con ~64 GB |
| Cuantizacion MLX 2-bit uniforme (baseline) | 32,1 B / 3,0 B | no disponible | 2 bits uniforme | Apache 2.0 | Apple Silicon 16 GB |
| Qwen3-MoE (arquitectura base) | 32,1 B / 3,0 B | no disponible | variable | Apache 2.0 | variable |

La comparativa se limita al ecosistema del propio modelo base y su baseline de cuantizacion, ya que no se dispone de datos de rendimiento de alternativas equivalentes en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion de 2-3 bits implica una perdida de calidad medible: divergencia KL de 0,3190 frente al profesor BF16 y perplejidad en japones de 10,35 (frente a valores menores en BF16).
- El modelo base es de tipo `base`, no ajustado por instrucciones; no se debe esperar un comportamiento de chat o seguimiento de instrucciones sin un post-entrenamiento adicional.
- Idiomas limitados a japones e ingles; el rendimiento en castellano no esta validado y probablemente sea deficiente.
- Riesgo de alucinacion inherente a los LLM, potencialmente amplificado por la cuantizacion agresiva.
- No se documentan sesgos especificos, pero el modelo hereda los del corpus de entrenamiento de llm-jp.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre la calidad en produccion.
- El formato MLX limita el despliegue a Apple Silicon; no es portable a CUDA sin reconversion.
- La ventana de contexto no esta documentada; las pruebas se realizaron a 4096 tokens.
- En equipos de 16 GB, la configuracion de memoria wired es critica: sin ella, el rendimiento cae por thrashing de SSD.

## Enlaces

- Hugging Face: https://huggingface.co/masahiroid/llm-jp-4-32b-a3b-base-Pyrite-2bit-MLX
- Modelo base: https://huggingface.co/llm-jp/llm-jp-4-32b-a3b-base
- DOI Zenodo: https://doi.org/10.5281/zenodo.23786705
- Paper (PDF): https://huggingface.co/masahiroid/llm-jp-4-32b-a3b-base-Pyrite-2bit-MLX/blob/main/pyrite_en.pdf
- README en japones: https://huggingface.co/masahiroid/llm-jp-4-32b-a3b-base-Pyrite-2bit-MLX/blob/main/README.ja.md
