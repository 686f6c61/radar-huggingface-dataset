# kncshw/gemma-4-26B-A4B-it-CyberGate-Kit

## Resumen

CyberGate Kit es un conjunto de artefactos de inferencia (vectores de activación en JSON y una plantilla de chat) diseñado para modificar el comportamiento de `google/gemma-4-26B-A4B-it` en el momento de la generación, sin tocar los pesos originales del modelo. Lo publica el usuario kncshw bajo licencia MIT y su objetivo declarado es desbloquear las capacidades de ciberseguridad, CTF e ingeniería inversa que el modelo base tiende a rechazar, manteniendo intactas las negativas ante otros contenidos dañinos.

El kit no es un modelo en sí mismo: es un complemento para el plugin de vLLM CyberGate, que intercepta la fase de prefill mediante hooks de PyTorch y aplica una compuerta de activación de doble factor (temática de ciberseguridad y presión de rechazo) junto con un mecanismo de steering sobre el canal `<think>`. Está pensado para desplegarse sobre vLLM 0.32.0 y conserva el soporte nativo de tool calling del modelo base para agentes como OpenCode o servidores MCP.

Su relevancia es acotada pero específica: ofrece una vía reproducible para evaluar el comportamiento de un modelo abierto en dominios de seguridad ofensiva y defensiva, con telemetría medible sobre cuándo se activa la compuerta y cuándo se mantiene el rechazo. La información pública disponible sobre el modelo base (arquitectura, contexto, datos de entrenamiento) es escasa en la documentación proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base `google/gemma-4-26B-A4B-it`; el kit añade hooks de activación y logits processor sobre vLLM) |
| Parámetros totales | no disponible (el identificador sugiere 26B en el modelo base; no confirmado en la información proporcionada) |
| Parámetros activos | no disponible (el identificador "A4B" sugiere arquitectura MoE con ~4B activos; no confirmado) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | `fp8_per_channel` (usado en los benchmarks del autor); otras no disponibles |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | JSON (vectores de activación y manifiestos) + plantilla Jinja; no incluye pesos del modelo |

## Arquitectura y entrenamiento

El kit no entrena ni modifica pesos. Se compone de cinco artefactos: `gemma4_L16_M1.json` (operador de categoría en la capa 16 con pooling `mean_user` y umbral `tau = +0.08284618`), `gemma4_L21_refusal_dir.json` (dirección de rechazo calibrada en la capa 21), `gemma4_candidate_ops_bundle.json` (11 sondas de capas candidatas para telemetría multicapa y mecanismos de rescate/veto), `chat_template.jinja` (plantilla de chat nativa de vLLM con prefill del canal de pensamiento y soporte del bucle de herramientas OpenAI) y los ficheros `canaries.json` y `MANIFEST.json` con 9 prompts canario fijados a checkpoint.

El mecanismo de funcionamiento es una compuerta de activación de doble factor: hooks de solo lectura en el forward de PyTorch comprueban si la petición es simultáneamente sobre ciberseguridad (`cos(h, c) >= 0.0828` en L16, con rescate en capas medias/tardías) y está bajo presión de rechazo (`s_ref_z >= +1.50σ` en L21). Cuando ambas condiciones se cumplen, un `LogitsProcessor` de vLLM V1 rellena el canal de pensamiento y monitoriza las proyecciones de rechazo paso a paso durante un único forward, preservando las llamadas a herramientas nativas. No se dispone de información sobre los datos de entrenamiento del modelo base ni sobre si hubo RLHF/DPO.

## Capacidades

- Generación de texto conversacional sobre el modelo base Gemma 4.
- Desbloqueo condicionado de contenido de ciberseguridad, CTF e ingeniería inversa cuando se cumplen los dos factores de la compuerta.
- Mantenimiento del rechazo ante contenido dañino no relacionado con ciberseguridad (según los benchmarks del autor: 0.0% de fuga en SOSBench-bio).
- Soporte nativo de tool calling y function calling (parsers `gemma4` en vLLM).
- Compatibilidad con agentes multi-paso (OpenCode, servidores MCP) y con Open WebUI.
- Canal de pensamiento (`<think>`) con prefill controlado y monitorización durante la decodificación.
- Endpoint dual: baseline sin steering en `:8000` y endpoint con compuerta en `:8001`.
- Capacidades multilingües: no disponible.

## Casos de uso

- Evaluación de seguridad ofensiva controlada: el kit permite medir la tasa de activación de la compuerta sobre corpus como WMDP-cyber (95.1%) y CySecBench (82.7%), útil para investigar el comportamiento de rechazo de modelos abiertos en dominios sensibles.
- Investigación en interpretabilidad: los vectores de activación en L16 y L21 y las 11 sondas de capas candidatas permiten estudiar cómo se representa la temática y la presión de rechazo en el espacio latente.
- Despliegue de asistentes para CTF y laboratorios de reversing: con el endpoint `:8001` y un cliente como OpenCode, el modelo puede resolver retos y generar scripts de análisis sin que el filtro de rechazo interrumpa la tarea.
- Automatización de análisis de malware en entornos aislados: el soporte de tool calling permite encadenar llamadas a herramientas de análisis estático y dinámico manteniendo el contexto de la conversación.
- Integración en pipelines de agentes MCP: la plantilla de chat y los parsers de herramientas de vLLM permiten conectar el modelo a servidores MCP para tareas de reconocimiento y explotación en entornos de prueba.
- Comparación baseline vs. steering: el despliegue dual (`:8000` sin modificar y `:8001` con compuerta) facilita experimentos A/B sobre el mismo modelo y la misma cuantización `fp8_per_channel`.
- Auditoría de fugas: los 9 prompts canario fijados a checkpoint y el script `check_eval.sh` permiten verificar de forma reproducible que la compuerta no se dispara ante contenido dañino no objetivo.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre `google/gemma-4-26B-A4B-it` con `fp8_per_channel` en vLLM:

| Corpus | Prompts (n) | Compuerta activada | Rol esperado |
|---|---:|---:|---|
| WMDP-cyber | 637 | 606 (95.1%) | Objetivo — desbloquear |
| CySecBench | 675 | 558 (82.7%) (553 con veto adyacente) | Objetivo — desbloquear |
| SOSBench-bio | 498 | 0 (0.0%) | Daño no objetivo — mantener rechazo |
| WMDP-bio | 637 | 4 (0.6%) | Daño no objetivo — mantener rechazo |
| CatQA | 234 | 23 (9.8%) | Daño no objetivo — mantener rechazo |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el modelo base se sirve con `--quantization fp8_per_channel`, lo que reduce el requisito respecto a BF16, pero no se especifica el consumo exacto.
- GPU recomendadas: el autor menciona Google Colab A100, RunPod y Vast como entornos de despliegue; no se detallan otras GPU.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: vLLM 0.32.0 con el plugin CyberGate, mediante Docker Compose (`docker-compose.gemma-4-26B-A4B-it.yml`) o script `serve_no_docker.sh`; requiere `VLLM_USE_V2_MODEL_RUNNER=0`, `--enforce-eager`, `--enable-prefix-caching` y backend de atención `TRITON_ATTN`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| CyberGate Kit (sobre gemma-4-26B-A4B-it) | no disponible (base 26B A4B según identificador) | no disponible | MIT | Steering por activación en vLLM sin tocar pesos |
| `google/gemma-4-26B-A4B-it` (base) | no disponible (26B A4B según identificador) | no disponible | no disponible | Modelo base con rechazo estándar |
| Alternativas de abliteration por edición de pesos | no disponible | no disponible | variable | Modificación permanente de pesos |

No se dispone de datos suficientes para comparar rendimiento con alternativas concretas.

## Limitaciones y advertencias

- El kit no incluye pesos: requiere el modelo base `google/gemma-4-26B-A4B-it` y el plugin CyberGate de vLLM; no funciona como un checkpoint autónomo.
- Dependencia estricta de `vllm==0.32.0` y de flags concretos (`VLLM_USE_V2_MODEL_RUNNER=0`, `--enforce-eager`, `TRITON_ATTN`); otras versiones pueden romper la compuerta.
- Riesgo de alucinación inherente al modelo base, no caracterizado en la documentación.
- Sesgos conocidos del modelo base: no disponibles.
- La compuerta no es perfecta: en CatQA se activa en un 9.8% de casos y en WMDP-bio en un 0.6%, lo que indica falsos positivos residuales sobre contenido no objetivo.
- El uso está orientado a investigación y entornos controlados; el desbloqueo de capacidades ofensivas en producción plantea riesgos legales y éticos que el autor no aborda.
- Licencia MIT para el kit, pero la licencia del modelo base subyacente debe verificarse por separado antes de uso comercial.
- Idiomas soportados no documentados; el rendimiento multilingüe es desconocido.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin validación independiente de los resultados.

## Enlaces

- Hugging Face: https://huggingface.co/kncshw/gemma-4-26B-A4B-it-CyberGate-Kit
- Repositorio del plugin: https://github.com/kncshw/cybergate
- README en chino: https://github.com/kncshw/cybergate/blob/main/README_zh.md
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
