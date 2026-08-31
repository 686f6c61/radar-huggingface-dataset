# kingjones777/PhoneLLM-Alpha-1-ROCmFP4-GGUF

## Resumen

PhoneLLM Alpha 1 es un modelo de lenguaje especializado en agentes de voz y tool calling, desarrollado por el equipo de Daily/Pipecat como un fine-tune de parámetros completos sobre NVIDIA Nemotron 3 Nano 30B-A3B. Este repositorio concreto, publicado por kingjones777 (Myron Jones), no contiene el modelo original sino una escalera de cuantización ROCmFP4/ROCmFPX en formato GGUF, diseñada específicamente para ejecutarse en hardware AMD Strix Halo (APU Ryzen AI Max+ 395, GPU Radeon 8060S, gfx1151). El modelo resultante es un MoE híbrido Mamba-Transformer con 30B parámetros totales y 3.5B activos, optimizado para llamar a herramientas con latencia de llamada telefónica y con el modo de pensamiento desactivado.

La relevancia de esta versión cuantizada radica en que permite ejecutar un modelo de 30B en una APU integrada con 128 GB de memoria unificada, dejando espacio para co-alojar modelos de ASR y TTS en el mismo equipo. El autor ha verificado que las cuantizaciones de 4 bits (alrededor de 16 GiB) mantienen el mismo rendimiento en tool calling que las versiones de 8 bits (30 GiB), lo que la convierte en una opción práctica para pipelines de voz en producción. El modelo es texto-entrada/texto-salida, por lo que requiere componentes de voz separados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba-Transformer, Mixture of Experts (MoE) |
| Parametros totales | 31.577.940.288 (30B nominales) |
| Parametros activos | 3.5B (según model card) |
| Longitud de contexto | 32.768 tokens (configuración recomendada en la documentación) |
| Tipos de cuantizacion | ROCmFP4 (Q4_0) y ROCmFPX (Q6_0, Q8_0), con cabeza q8_0 en todos los niveles |
| Idiomas soportados | Inglés (en) |
| Licencia | BSD-2-Clause |
| Formato de pesos | GGUF (tensores ggml tipo 100-119, requiere build ROCmFPX) |

## Arquitectura y entrenamiento

El modelo base, PhoneLLM Alpha 1, es un fine-tune de parámetros completos de NVIDIA Nemotron 3 Nano 30B-A3B, que a su vez emplea una arquitectura híbrida Mamba-Transformer con mezcla de expertos. La capa de atención se combina con bloques Mamba para reducir el coste computacional manteniendo capacidad de razonamiento. El fine-tune se realizó con el objetivo específico de mejorar la fiabilidad en tool calling y la adherencia a instrucciones en escenarios de agente de voz, con el modo de pensamiento desactivado por diseño. No se han publicado detalles sobre el dataset de entrenamiento ni sobre el uso de RLHF o DPO.

La cuantización ROCmFP4/ROCmFPX es una extensión experimental de GGUF que define nuevos tipos de tensor (100-119) para aprovechar las instrucciones FP4 de las GPUs AMD RDNA 4 (gfx1151). El autor aplica una cabeza (output.weight) en q8_0 en todos los niveles porque la dimensión oculta de 2688 no es divisible por el tamaño de superbloque de los K-quants (256), lo que impide usar q6_K. Esta decisión incrementa ligeramente el tamaño del tensor de salida pero mantiene la precisión en la capa final.

## Capacidades

- Generación de texto y razonamiento conversacional, con soporte de chat multi-turno.
- Tool calling y function calling nativo, devolviendo `tool_calls` en el endpoint `/v1/chat/completions` con el formato de chat `peg-native`.
- Diseñado para agentes de voz: latencia baja y comportamiento determinista con `temperature=0` y `enable_thinking=false`.
- Capacidad de no llamar a herramientas cuando no es necesario (caso adversarial incluido en la verificación).
- Soporte multi-turno en tool calling, probado en la verificación del autor.
- Multilingüe limitado al inglés (según la model card).
- No incluye capacidades de visión, audio ni entrada multimodal; es texto-in/texto-out.

## Casos de uso

- Atención al cliente automatizada por voz: el modelo gestiona conversaciones multi-turno con contexto de 32k tokens, integrado en un pipeline Pipecat con STT y TTS, llamando a APIs de CRM o reservas cuando el usuario lo solicita.
- Agente de reservas telefónico: con tool calling fiable, puede confirmar citas, consultar disponibilidad y emitir llamadas a sistemas externos sin alucinar confirmaciones.
- Asistente de soporte técnico en vivo: al ejecutarse en una APU Strix Halo, puede co-alojar modelos de transcripción y síntesis de voz en el mismo hardware, reduciendo costes de infraestructura.
- Automatización de back-office con llamadas salientes: el modelo puede iniciar llamadas, verificar identidad y actualizar registros en sistemas CRM mediante function calling.
- Pruebas de estrés de agentes conversacionales: su comportamiento determinista con `temperature=0` permite reproducir escenarios de tool calling de forma consistente en entornos de test.
- Despliegue en edge computing con GPUs AMD integradas: la cuantización de 4 bits (15.91 GiB) cabe en sistemas con 32 GB de memoria unificada, habilitando agentes de voz en dispositivos locales sin conexión a la nube.

## Benchmarks y rendimiento

El autor no publica benchmarks estándar (MMLU, HumanEval, GSM8K), pero incluye una verificación propia de tool calling con un probe adversarial (5 casos, incluyendo un caso donde no debe llamar a ninguna herramienta y un caso multi-turno). Los resultados, con `temperature=0` y `enable_thinking=false`, son:

| Nivel de cuantización | Tamaño | Carga | Coherencia | Tool probe (sobre 5) |
|---|---|---|---|---|
| Q4_0_ROCMFP4_STRIX_LEAN | 15.91 GiB | ~10 s | Sí | 3/5 |
| Q4_0_ROCMFP4_FAST | 15.83 GiB | ~10 s | Sí | 3/5 |
| Q4_0_ROCMFP4_COHERENT | 16.91 GiB | ~10 s | Sí | 2/5 |
| Q6_0_ROCMFPX_AGENT | 27.26 GiB | ~20 s | Sí | 3/5 |
| Q8_0_ROCMFPX_AGENT | 30.84 GiB | ~25 s | Sí | 2/5 |
| Q8_0_ROCMFPX | 30.37 GiB | ~20 s | Sí | 3/5 |
| BF16 fuente (control) | 58.8 GiB | Sí | Sí | 1/5 |

El autor concluye que no hay degradación dependiente de la precisión: los niveles de 4 bits igualan o superan a los de 8 bits y al control BF16 en el probe de herramientas.

## Requisitos de hardware

- GPU objetivo: AMD Strix Halo (gfx1151), específicamente Ryzen AI Max+ 395 con Radeon 8060S.
- VRAM estimada: el nivel flagship ocupa 15.91 GiB; los niveles de 8 bits requieren hasta 30.84 GiB. En un sistema con 128 GB de memoria unificada, queda espacio para co-alojar modelos ASR/TTS.
- No cabe en GPUs de consumo convencionales (RTX 4090, etc.) porque los tensores ROCmFP4 requieren instrucciones FP4 de RDNA 4; no es compatible con hardware NVIDIA.
- Backends: HIP (ROCm) y Vulkan, seleccionables en tiempo de ejecución con el flag `-dev`; no requiere recompilación.
- Despliegue: llama.cpp con build ROCmFPX (no stock), usando `llama-server` con `--jinja` y formato `peg-native`.
- Latencia: carga del modelo entre 10 y 25 segundos según el nivel; no se proporcionan mediciones de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| PhoneLLM Alpha 1 (BF16) | 30B total, 3.5B activo | 32k (recomendado) | BSD-2-Clause | Safetensors | Modelo original de Pipecat, requiere 58.8 GiB |
| PhoneLLM Alpha 1 NVFP4 | 30B total, 3.5B activo | 32k (recomendado) | BSD-2-Clause | GGUF (NVFP4) | Versión oficial para NVIDIA Blackwell |
| PhoneLLM Alpha 1 ROCmFP4 (este repo) | 30B total, 3.5B activo | 32k (recomendado) | BSD-2-Clause | GGUF (ROCmFP4) | Cuantización para AMD Strix Halo, 15.91 GiB en 4 bits |

No se dispone de datos de rendimiento comparativo entre estas versiones más allá de la verificación del autor.

## Limitaciones y advertencias

- Requiere un build específico de llama.cpp con soporte ROCmFPX; los binarios estándar no cargan estos archivos (tipos de tensor 100-119 no reconocidos).
- Solo compatible con hardware AMD RDNA 4 (gfx1151); no funciona en GPUs NVIDIA ni en AMD más antiguas.
- El modelo es texto-in/texto-out; no incluye capacidades de voz, por lo que necesita STT y TTS externos.
- Idioma limitado al inglés; no se ha verificado rendimiento en otros idiomas.
- El probe de tool calling muestra puntuaciones de 2/5 o 3/5 en todos los niveles, lo que indica que el modelo falla en algunos casos adversariales; no es fiable al 100% para llamadas críticas sin supervisión.
- La licencia BSD-2-Clause permite uso comercial, pero el modelo base (Nemotron 3 Nano) puede tener restricciones adicionales; se recomienda revisar la licencia de NVIDIA.
- No se han publicado benchmarks estándar (MMLU, HumanEval, etc.) para esta cuantización; la verificación se limita a coherencia y tool calling.
- El autor advierte que `llama-quantize --dry-run` no detecta el fallo de alineación de la cabeza q6_K; cualquier modificación de la cuantización debe probarse con datos reales.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/kingjones777/PhoneLLM-Alpha-1-ROCmFP4-GGUF
- Modelo base original: https://huggingface.co/pipecat-ai/phonellm-alpha-1
- Modelo base NVIDIA: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16
- Versión NVFP4 oficial: https://huggingface.co/pipecat-ai/phonellm-alpha-1-nvfp4
- Repositorio del nivel flagship independiente: https://huggingface.co/kingjones777/PhoneLLM-Alpha-1-ROCmFP4-STRIX-LEAN-GGUF
- Integración ROCmFP4 (GitHub): https://github.com/charlie12345/rocmfp4
- Perfil del autor: https://huggingface.co/kingjones777
