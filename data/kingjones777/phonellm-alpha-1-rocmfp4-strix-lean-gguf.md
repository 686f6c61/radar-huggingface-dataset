# kingjones777/PhoneLLM-Alpha-1-ROCmFP4-STRIX-LEAN-GGUF

## Resumen

PhoneLLM Alpha 1 es un modelo de lenguaje desarrollado por el equipo de Pipecat (Daily.co) como un fine-tune completo de NVIDIA Nemotron 3 Nano 30B-A3B, un modelo de mezcla de expertos (MoE) con 30 mil millones de parámetros totales y 3 mil millones activos. El modelo está diseñado específicamente para la etapa de razonamiento y generación de texto en pipelines de agentes de voz, donde la latencia y la fiabilidad en el uso de herramientas son críticas. Este repositorio concreto, creado por kingjones777, aporta una cuantización ROCmFP4 (formato de pesos de 4 bits específico de AMD) optimizada para las APU AMD Strix Halo (gfx1151), con un único archivo GGUF de 15,91 GiB que reduce el tamaño del modelo BF16 original (58,8 GiB) en más de un 70 %.

La relevancia de esta versión radica en que permite ejecutar un modelo de 30B con solo 3B activos en hardware de consumo de gama alta (como el Ryzen AI MAX+ 395) con una huella de memoria muy reducida, dejando espacio para los componentes de ASR y TTS del pipeline de voz. El autor ha verificado que esta cuantización de 4 bits no presenta pérdidas medibles frente a las versiones de 8 bits en una prueba adversarial de tool calling, e incluso supera al control BF16 (3/5 frente a 1/5). El modelo es texto-in/texto-out: no es un modelo de voz completo, sino el componente LLM de un sistema mayor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos), basado en NVIDIA Nemotron 3 Nano 30B-A3B |
| Parametros totales | 31.577.940.288 (30B declarados por NVIDIA, 31,58B según safetensors) |
| Parametros activos | 3B (A3B: 3 mil millones activos por token) |
| Longitud de contexto | no disponible (el modelo base Nemotron 3 Nano soporta 128K, pero no se especifica en este repo) |
| Tipos de cuantizacion | Q4_0_ROCMFP4_STRIX_LEAN (ftype 106), con head q8_0 protegido |
| Idiomas soportados | en (ingles) |
| Licencia | bsd-2-clause (para este repo; verificar licencia del modelo base NVIDIA) |
| Formato de pesos | GGUF (requiere build ROCmFPX de llama.cpp, no compatible con llama.cpp estandar) |

## Arquitectura y entrenamiento

El modelo base, NVIDIA Nemotron 3 Nano 30B-A3B, es un transformer de mezcla de expertos con 30 mil millones de parametros totales y 3 mil millones activos por token, lo que lo hace especialmente eficiente para inferencia en hardware de consumo. PhoneLLM Alpha 1 es un fine-tune completo (full-parameter) de este modelo realizado por el equipo de Pipecat, orientado a mejorar la fiabilidad del tool calling y el razonamiento multi-turno en escenarios de agentes de voz. No se dispone de detalles publicos sobre el dataset de fine-tuning ni sobre el proceso de entrenamiento (si se uso RLHF, DPO u otra tecnica).

La cuantizacion ROCmFP4 es un formato de pesos de 4 bits desarrollado por la comunidad ROCmFPX, que implementa kernels nativos para HIP/ROCm y Vulkan. Este repositorio concreto protege el tensor de salida (`output.weight`) con cuantizacion q8_0 (mayor precision que el q6_K habitual) porque el tamaño oculto de 2688 no es divisible por el tamaño de superbloque de 256 de los K-quants, lo que provocaba un fallo de asercion en llama.cpp. El resultado es un archivo de 15,91 GiB que carga en aproximadamente 10 segundos en una APU Strix Halo.

## Capacidades

- Generacion de texto y razonamiento conversacional, optimizado para dialogos multi-turno.
- Tool calling / function calling: probado con una sonda adversarial de 5 casos (incluye un caso donde no debe llamar a ninguna herramienta y un caso multi-turno), obteniendo 3/5 aciertos, igual que las versiones de 8 bits y superior al control BF16 (1/5).
- Soporte de agentes: disenado para integrarse en pipelines de voz como el de Pipecat, donde el LLM debe decidir si emitir una llamada a herramienta o responder directamente.
- Chat format `peg-native` resuelto automaticamente por llama.cpp; las tool calls se devuelven como `tool_calls` en `/v1/chat/completions` con `--jinja`.
- Capacidad de "thinking" desactivable mediante `enable_thinking: false` (recomendado por el autor para uso en produccion).
- Multilingue: solo ingles declarado en la model card.
- No incluye capacidades de vision ni audio; es estrictamente texto-in/texto-out.

## Casos de uso

- Agentes de voz para atencion al cliente: el modelo se integra como etapa LLM en un pipeline con ASR (reconocimiento de voz) y TTS (sintesis de voz). Su fiabilidad en tool calling (3/5 en la sonda adversarial) reduce el riesgo de que el agente confirme acciones sin emitir la llamada correspondiente, un fallo critico en este dominio.
- Asistentes de reservas y citas: puede gestionar conversaciones multi-turno donde debe consultar disponibilidad, confirmar datos y ejecutar reservas mediante llamadas a APIs externas, manteniendo coherencia gracias a su entrenamiento especifico.
- Automatizacion de soporte tecnico: con su ventana de contexto amplia (heredada del modelo base Nemotron 3 Nano), puede manejar historiales largos de conversacion y diagnosticar problemas siguiendo guiones con herramientas de ticketing.
- Generacion de codigo y asistencia en entornos de desarrollo: aunque no es su caso de uso principal, al estar basado en Nemotron 3 Nano conserva capacidades de generacion de codigo y razonamiento logico, util para asistentes de programacion con tool calling.
- Despliegue en hardware AMD de bajo consumo: gracias a la cuantizacion ROCmFP4 y al formato MoE (solo 3B activos), puede ejecutarse en APUs Strix Halo con 128 GB de memoria unificada dejando ~110 GB libres para otros componentes, ideal para prototipos de agentes de voz en local.
- Evaluacion de pipelines de voz en entornos de investigacion: al ser un modelo de 30B con solo 3B activos y una huella de 15,91 GiB, permite experimentar con arquitecturas de agentes conversacionales en hardware de consumo sin necesidad de GPUs de centro de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor proporciona unicamente una sonda de tool calling adversarial (5 casos) y una tabla de verificacion de carga y coherencia para los distintos tiers de cuantizacion:

| Tier | Tamano | Carga | Coherente | Tool probe |
|---|---:|---|---|---|
| Q4_0_ROCMFP4_STRIX_LEAN (este) | 15,91 GiB | ~10 s | Si | 3/5 |
| Q4_0_ROCMFP4_FAST | 15,83 GiB | ~10 s | Si | 3/5 |
| Q4_0_ROCMFP4_COHERENT | 16,91 GiB | ~10 s | Si | 2/5 |
| Q6_0_ROCMFPX_AGENT | 27,26 GiB | ~20 s | Si | 3/5 |
| Q8_0_ROCMFPX_AGENT | 30,84 GiB | ~25 s | Si | 2/5 |
| Q8_0_ROCMFPX | 30,37 GiB | ~20 s | Si | 3/5 |
| BF16 fuente (control) | 58,8 GiB | Si | Si | 1/5 |

El autor destaca que pagar el doble de disco por Q8 no aporta mejoras medibles en la sonda, y que la version STRIX_LEAN es la mas equilibrada.

## Requisitos de hardware

- VRAM estimada: 15,91 GiB para el archivo GGUF, mas overhead de contexto y KV cache. En una APU Strix Halo con 128 GB de memoria unificada, deja ~110 GB libres para ASR y TTS.
- GPU recomendadas: AMD Strix Halo (gfx1151), como el Ryzen AI MAX+ 395. Tambien compatible con cualquier GPU AMD que soporte HIP/ROCm o Vulkan, aunque la optimizacion esta pensada para gfx1151.
- No cabe en GPUs de consumo convencionales con 8-16 GB de VRAM dedicada (el archivo supera los 16 GB), pero si en sistemas con memoria unificada amplia o GPUs de 24 GB.
- Opciones de despliegue: llama.cpp con build ROCmFPX (obligatorio, los archivos usan tipos ggml 100-119 que no soporta el llama.cpp estandar). Se puede usar `llama-server` con los flags `-dev ROCm0 -fa on -ngl 999 -fit off -np 1 -c 32768 -b 4096 -t 8 --jinja`. Tambien es compatible con Vulkan como backend alternativo (mismo binario, flag `-dev` en runtime).
- Latencia y throughput: no se proporcionan mediciones directas. El autor menciona ~10 s de carga del modelo y que el pipeline de Pipecat apunta a ~650 ms de time-to-first-token para el LLM, pero no confirma que esta cuantizacion lo alcance.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Tool probe | Licencia |
|---|---|---|---|---|---|
| PhoneLLM Alpha 1 (BF16, control) | 30B totales / 3B activos | no disponible | BF16 (58,8 GiB) | 1/5 | bsd-2-clause (repo) |
| PhoneLLM Alpha 1 ROCmFP4 STRIX_LEAN (este) | 30B totales / 3B activos | no disponible | Q4_0 ROCmFP4 (15,91 GiB) | 3/5 | bsd-2-clause |
| PhoneLLM Alpha 1 NVFP4 (oficial Pipecat) | 30B totales / 3B activos | no disponible | NVFP4 (para NVIDIA Blackwell) | no disponible | bsd-2-clause |
| Qwen3-30B-A3B (referencia MoE similar) | 30B totales / 3B activos | 128K | multiples | no comparable | Apache 2.0 |

La comparativa directa con el control BF16 muestra que la cuantizacion ROCmFP4 no solo no degrada el tool calling, sino que lo mejora (3/5 frente a 1/5), probablemente debido al head q8_0 de mayor precision. Frente a la version NVFP4 oficial de Pipecat para NVIDIA, no hay datos de rendimiento comparables. Qwen3-30B-A3B es el competidor MoE mas cercano en tamano, pero no esta especializado en agentes de voz.

## Limitaciones y advertencias

- Solo ingles: la model card declara unicamente `en` como idioma soportado. No se recomienda su uso en otros idiomas sin evaluacion previa.
- No es un modelo de voz: es texto-in/texto-out. Requiere componentes externos de ASR y TTS para construir un agente de voz completo.
- Requiere build ROCmFPX de llama.cpp: los archivos GGUF usan tipos de tensor (100-119) que no carga el llama.cpp estandar. Es necesario compilar con `-DGGML_HIP=ON -DGGML_VULKAN=ON` y `-DAMDGPU_TARGETS=gfx1151`.
- Riesgo de alucinacion en tool calling: la sonda adversarial obtuvo 3/5, lo que significa que en 2 de 5 casos el modelo fallo (posiblemente llamando a una herramienta cuando no debia o no llamando cuando era necesario). No es fiable al 100 % para produccion sin supervision.
- Licencia: este repo usa bsd-2-clause, pero el modelo base de NVIDIA (Nemotron 3 Nano) puede tener restricciones adicionales. Hay que verificar la licencia del modelo base antes de un despliegue comercial.
- Sin benchmarks estandar: no hay datos de MMLU, HumanEval, etc. La unica evaluacion publica es la sonda de tool calling del autor, que no es representativa del rendimiento general.
- Contexto limitado en la practica: aunque el modelo base soporta hasta 128K, el comando recomendado usa `-c 32768` (32K), probablemente por limitaciones de memoria o rendimiento en la APU.

## Enlaces

- Repositorio de este modelo: https://huggingface.co/kingjones777/PhoneLLM-Alpha-1-ROCmFP4-STRIX-LEAN-GGUF
- Modelo base PhoneLLM Alpha 1 (Pipecat): https://huggingface.co/pipecat-ai/phonellm-alpha-1
- Modelo base NVIDIA Nemotron 3 Nano 30B-A3B: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16
- Version NVFP4 oficial de Pipecat: https://huggingface.co/pipecat-ai/phonellm-alpha-1-nvfp4
- Escalera completa de cuantizaciones ROCmFP4: https://huggingface.co/kingjones777/PhoneLLM-Alpha-1-ROCmFP4-GGUF
- Proyecto ROCmFPX (formatos de pesos AMD): https://github.com/charlie12345/ROCmFPX
- Guia de ROCmFP4 para Strix Halo: https://github.com/hogeheer499-commits/strix-halo-guide/blob/main/ROCMFP4_CHADROCK.md
