# Joakimpalm-Zen/Qwen3-30B-A3B-selective-attnQ8_0-expQ4_0-GGUF

## Resumen

Qwen3-30B-A3B-selective-attnQ8_0-expQ4_0-GGUF es un derivado cuantizado del modelo MoE Qwen3-30B-A3B de Alibaba, producido por Joakimpalm-Zen como parte del ecosistema Xyntetik Runner. Aplica un plan de precisión selectiva por tensor: los bancos de expertos (la mayor parte de los bytes de un MoE) se cuantizan a Q4_0, mientras que atención, embeddings y tensores compartidos se mantienen en Q8_0. El resultado es un fichero GGUF de 17,99 GB frente a los 32,48 GB del Q8_0 uniforme oficial, con una degradación controlada y verificada frente a la fuente mediante puertas de integridad y divergencia KLD.

El modelo está pensado para servirse con xyntetik-runner, un motor de inferencia C11 de un solo binario (CPU/CUDA/Metal) con servidor compatible con OpenAI. Su diferencial principal es la recuperación de truncamiento forzado: cuando una llamada a herramienta supera su presupuesto de tokens, el runner cierra el documento JSON al esquema legal más pequeño, de modo que los argumentos siguen siendo parseables. Esto resuelve un fallo común en motores como vLLM, llama.cpp u Ollama, que devuelven `tool_calls` vacías o malformadas al agotarse el presupuesto.

El modelo base Qwen3-30B-A3B es un MoE de 30,5B parámetros totales con ~3B activos, ventana de contexto de 32.768 tokens y soporte multilingüe (119 idiomas según el Qwen3 Technical Report). La licencia Apache-2.0 permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts), familia Qwen3 |
| Parametros totales | 30.532.122.624 (30,5B) |
| Parametros activos | ~3B (A3B) |
| Longitud de contexto | 32.768 tokens (segun Qwen3 Technical Report) |
| Tipos de cuantizacion | Selectiva: expertos Q4_0, atencion y tensores compartidos Q8_0 |
| Idiomas soportados | No disponible en la model card (base Qwen3: 119 idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base Qwen3-30B-A3B es un transformer MoE con 30,5B parámetros totales y aproximadamente 3B activos por token. Forma parte de la familia Qwen3, que combina arquitecturas densas y MoE con modos de pensamiento (thinking) y no pensamiento, entrenados mediante preentrenamiento a gran escala, RLVR (reinforcement learning with verifiable rewards) y etapas de postentrenamiento supervisado.

Este fichero concreto no es un modelo reentrenado: es un derivado cuantizado del GGUF Q8_0 oficial de Qwen. El proceso se realizó con las herramientas de Xyntetik Runner mediante un plan de precisión por tensor (`--type-plan`): la regla única `{"match": "_exps.weight", "type": "q4_0"}` envía los bancos de expertos apilados a Q4_0, mientras que el valor por defecto `"keep"` mantiene atención, embeddings y tensores compartidos en Q8_0. El cuantizador incluye una puerta de integridad que verifica byte a byte que los tensores fuera de las reglas son idénticos a la fuente, y una puerta de calidad que mide la divergencia KLD sobre 400 posiciones forzadas por profesor frente al Q8_0 original.

Una limitación técnica del formato GGUF es que no permite precisión por experto individual: los expertos se almacenan apilados en un tensor por capa y cada tensor GGUF admite un único tipo. Por tanto, la granularidad máxima es por clase de tensor, no por experto.

## Capacidades

- Generación de texto y razonamiento multilingüe heredadas del modelo base Qwen3-30B-A3B.
- Soporte de tool calling / function calling con recuperación de truncamiento forzado: si una llamada a herramienta supera su presupuesto de tokens, el runner cierra el documento JSON al esquema legal más pequeño, manteniendo argumentos parseables.
- Decodificación restringida (constrained decoding) que mantiene la forma del tool call bajo cuantización: conformidad de esquema y selección de herramienta al 100% hasta Q4_0.
- Compatible con servidor OpenAI (endpoint `/v1`), integrable con clientes estándar.
- Ejecución en CPU, CUDA y Metal gracias al motor xyntetik-runner.
- Modo agente: la recuperación de truncamiento evita reiniciar bucles de agente desde cero cuando se agota el presupuesto de tokens.

## Casos de uso

- Bucles de agente con llamadas a herramientas en entornos locales: con contextos ajustados y generación lenta, la recuperación de truncamiento garantiza que el agente reciba `tool_calls` ejecutables en lugar de respuestas vacías o malformadas, evitando reintentos desde cero.
- Servicio de API compatible con OpenAI en hardware modesto: el fichero de 18 GB requiere unos 20 GB de memoria, por lo que puede servirse en una estación de trabajo con GPU de 24 GB o en un Mac con Apple Silicon.
- Asistente de atención al cliente multilingüe: el modelo base soporta 119 idiomas y 32K de contexto, suficiente para gestionar conversaciones multi-turno con historial extenso.
- Generación de código y autocompletado con verificación de esquema: la decodificación restringida garantiza que las llamadas a funciones generadas cumplan el esquema JSON incluso con cuantización agresiva.
- Prototipado y evaluación de pipelines de tool calling: la comparativa de truncamiento publicada permite reproducir el comportamiento de distintos motores con el mismo prompt y presupuesto de tokens.
- Inferencia local sin dependencias: el binario único de xyntetik-runner simplifica el despliegue en entornos aislados o contenedores mínimos.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks generales (MMLU, HumanEval, GSM8K) para este derivado. Sí incluye dos mediciones específicas del comportamiento bajo truncamiento y cuantización:

Comparativa de recuperación de truncamiento (misma máquina, mismo esquema de herramienta, mismo prompt, `tool_choice: "required"`, temperatura 0, presupuestos de 1 a 64 tokens):

| Motor | Presupuesto insuficiente (1-16 tokens) | Presupuesto suficiente (64, control) |
|---|---|---|
| Xyntetik Runner | `tool_calls` ejecutables, argumentos parseables | completa |
| vLLM 0.27.1 | sin llamada; fuga de protocolo en `content` | completa |
| llama.cpp b10488 | sin llamada; fuga y `tool_calls` con argumentos no parseables | completa |
| Ollama 0.32.14 | sin llamada; `content` vacío y HTTP 500 | completa |
| TensorRT-LLM 1.2.1 | sin llamada; fuga de `<tool_call>` y `content` vacío | completa |
| SGLang 0.5.17 | sin llamada; fuga de `<tool_call>` y `content` vacío | completa |

Nota: TensorRT-LLM y SGLang se midieron con un Qwen3-1.7B sustituto; la recuperación de truncamiento es propiedad del runtime, no del modelo.

Conformidad de esquema bajo cuantización: en una escalera completa de cuantización, la conformidad de esquema y la selección de herramienta se mantuvieron al 100% hasta Q4_0, mientras que la concordancia de argumentos decayó al 50%.

Puertas de calidad del cuantizador: autocomprobación de cero-punto exacta (0.0 KLD / 100% top-1) y 400 posiciones forzadas por profesor frente al Q8_0 fuente con decodificación greedy.

## Requisitos de hardware

- Tamaño del fichero: 17,99 GB (17.988.417.024 bytes). La model card recomienda unos 20 GB de memoria usable.
- GPU recomendadas: cualquier GPU con 24 GB de VRAM (RTX 4090, A5000) o más; también CPU y Apple Silicon vía Metal.
- No cabe en GPUs de 8-12 GB sin cuantización adicional; requiere al menos 20 GB de memoria total.
- Opciones de despliegue: xyntetik-runner (binario único C11, CPU/CUDA/Metal, servidor OpenAI-compatible). Cualquier runtime GGUF con soporte qwen3moe debería cargar el fichero, ya que todos los tensores usan tipos GGUF ordinarios.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Tamaño fichero | Cuantización | Licencia |
|---|---|---|---|---|
| Qwen3-30B-A3B Q8_0 (oficial) | 30,5B totales / ~3B activos | 32,48 GB | Q8_0 uniforme | Apache-2.0 |
| Qwen3-30B-A3B Q4_K_M (oficial) | 30,5B totales / ~3B activos | 18,56 GB | Q4_K/Q6_K uniforme | Apache-2.0 |
| Este fichero (selectivo) | 30,5B totales / ~3B activos | 17,99 GB | Expertos Q4_0, atención Q8_0 | Apache-2.0 |

Frente al Q8_0 oficial, este derivado reduce el tamaño un 44,6% manteniendo atención y tensores compartidos en precisión completa. Frente al Q4_K_M oficial, es 0,57 GB más pequeño y conserva la atención en Q8_0, a costa de cuantizar los expertos a Q4_0 (más agresivo que Q4_K).

## Limitaciones y advertencias

- La concordancia de argumentos en tool calls decayó al 50% bajo Q4_0 en las pruebas del autor; la forma del esquema se mantiene, pero el contenido puede degradarse.
- El formato GGUF no permite precisión por experto individual: los expertos se cuantizan por clase de tensor, no de forma selectiva por experto.
- No se publican benchmarks generales (MMLU, HumanEval, GSM8K) para este derivado; las mediciones disponibles se centran en truncamiento y conformidad de esquema.
- La comparativa de truncamiento incluye dos motores (TensorRT-LLM y SGLang) medidos con un modelo sustituto (Qwen3-1.7B), no con este fichero.
- El modelo hereda las limitaciones del base Qwen3-30B-A3B: riesgo de alucinación, posibles sesgos del entrenamiento y límite de contexto de 32K tokens.
- La model card no especifica los idiomas soportados para este fichero concreto; el base Qwen3 declara 119 idiomas según el technical report.
- Es un derivado de terceros, no oficial de Qwen; la verificación de integridad la realiza el autor, no el equipo de Qwen.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Joakimpalm-Zen/Qwen3-30B-A3B-selective-attnQ8_0-expQ4_0-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-30B-A3B
- Xyntetik Runner (GitHub): https://github.com/Joakimpalm-Zen/xyntetik-runner
- Benchmark de truncamiento: https://github.com/Joakimpalm-Zen/xyntetik-runner/blob/main/docs/truncation-benchmark.md
- Qwen3 Technical Report (arXiv): https://arxiv.org/abs/2505.09388
