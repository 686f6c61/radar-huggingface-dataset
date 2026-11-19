# netprojects/Qwen3.8-27B-hermes-adapted-MLX-4bit

## Resumen

Qwen3.8-27B-hermes-adapted-MLX-4bit es una cuantización de 4 bits en formato MLX del modelo harness-hub/Qwen3.8-27B-hermes-adapted, un ajuste fino mediante LoRA del modelo base Qwen/Qwen3.8-27B. Lo publica el usuario netprojects y está pensado específicamente para ejecutarse en Apple Silicon mediante la librería MLX. El adaptador original fue entrenado por harness-hub con aprendizaje por refuerzo (AsyncGRPO en TRL, rango LoRA 32, alpha 64, checkpoint en el paso 160 de 1000) para funcionar como el modelo detrás de Hermes Agent en tareas de ingeniería de software y terminal.

El modelo conserva la arquitectura multimodal del Qwen3.8-27B original: 27.781 millones de parámetros totales, 16 capas de atención completa y 64 capas en total, con codificador de visión y una capa de predicción multi-token (MTP) incluidos. Esta build cuantiza las capas lineales a 4 bits (afín, grupo 64) y ocupa 16,3 GB en disco. El tokenizador y la plantilla de chat son los de harness-hub, sin cambios, por lo que mantiene el vocabulario y el formato de tool calling de Qwen3.8-27B.

Su relevancia actual radica en que permite ejecutar un modelo de 27B con capacidades de agente de código en Macs con 32 GB de memoria unificada, algo imposible con la versión bf16 (55,6 GB). Según los datos del autor, el adaptador mejora el rendimiento del modelo base en SWE-bench Pro (hard 51) del 29,4% al 43,1% y en Terminal-Bench 2.1 del 44,7% al 58,8%, con la particularidad de que el adaptador fue entrenado y evaluado con el modo thinking desactivado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con atención completa y capas Gated DeltaNet, más codificador de visión y capa MTP (multi-token prediction) |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (no es MoE según los datos disponibles) |
| Longitud de contexto | no disponible en la información proporcionada; el autor indica que Hermes Agent requiere al menos 64.000 tokens de contexto |
| Tipos de cuantizacion | 4 bits afín, grupo 64 (esta build); el repositorio ofrece también 6 bits, 8 bits, bf16 y adaptador LoRA |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), con archivo adicional model-mtp.safetensors para la capa MTP |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura híbrida: 16 capas de atención completa y 64 capas en total, con capas Gated DeltaNet que el adaptador no modifica. Incluye un codificador de visión (pipeline image-text-to-text) y una capa de predicción multi-token (MTP) propia de Qwen, que en esta build se conserva cuantizada en model-mtp.safetensors y que el adaptador no altera. Los 256 módulos adaptados por el LoRA son las proyecciones q, k, v y o de las 16 capas de atención completa y las proyecciones gate, up y down de las 64 capas; el merge se verificó elemento a elemento como W + 2.0 · B @ A redondeado a bf16, y el resto de tensores son idénticos byte a byte al Qwen3.8-27B original.

El adaptador se entrenó con aprendizaje por refuerzo mediante AsyncGRPO en TRL, con rango LoRA 32 y alpha 64, y el checkpoint publicado corresponde al paso 160 de los 1000 planificados. Los datos concretos de entrenamiento, la composición del dataset y los detalles del proceso de RL se remiten a la model card del adaptador original. La cuantización de esta build se aplica a las capas lineales en 4 bits afín con grupo 64, y el autor verifica que cada build cuantizada coincide exactamente con el resultado esperado de la cuantización.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno.
- Comprensión de imágenes (image-text-to-text): puede analizar capturas de pantalla, terminales y otros contenidos visuales.
- Tool calling en formato XML de Qwen (`<tool_call><function=...><parameter=...>`), que el servidor de mlx-lm devuelve como `tool_calls` compatibles con OpenAI.
- Capacidades de agente de código: entrenado específicamente para tareas de ingeniería de software y terminal con Hermes Agent.
- Modo thinking desactivable; el adaptador fue entrenado y evaluado con thinking off.
- Decodificación especulativa mediante la capa MTP integrada, usable como draft model con mlx-vlm.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Resolución de bugs en repositorios: el modelo puede recibir un fallo de tests y navegar por el código para localizar y corregir el error, como muestra el ejemplo del autor (`hermes chat -q "Find out why the tests in tests/test_parser.py fail and fix the bug."`); es adecuado porque fue entrenado con RL sobre tareas de SWE-bench Pro y Terminal-Bench.
- Automatización de terminal y operaciones de sistema: ejecución de comandos, diagnóstico de errores y tareas de administración en entornos de línea de comandos, aprovechando su entrenamiento específico en Terminal-Bench 2.1.
- Análisis de capturas de pantalla y salidas de terminal: con mlx-vlm puede interpretar imágenes de errores o interfaces y responder preguntas sobre ellas, útil para soporte técnico y depuración visual.
- Asistente de programación local en Mac: integrado mediante el servidor compatible con OpenAI de mlx-lm, sirve como backend de herramientas de edición de código sin depender de la nube, con 16,3 GB de pesos que caben en 32 GB de memoria unificada.
- Agente autónomo multi-paso: Hermes Agent requiere al menos 64.000 tokens de contexto y el modelo puede encadenar pasos de razonamiento, llamadas a herramientas y ejecución de comandos con un consumo de tokens reducido (según el autor, aproximadamente la mitad de tokens generados que el base en las tareas que ambos resuelven).
- Generación de código asistida con decodificación especulativa: usando la capa MTP como draft model se acelera la generación en tareas de código con decodificación greedy, manteniendo la verificación por el modelo completo.
- Evaluación y prototipado de agentes en investigación: al ser una build MLX de 4 bits con licencia Apache 2.0, permite experimentar con pipelines de agentes en hardware de consumo Apple sin infraestructura GPU dedicada.

## Benchmarks y rendimiento

Datos publicados por el autor del adaptador (harness-hub), con thinking off y bajo Hermes Agent:

| Benchmark | Modelo base | Adaptador hermes | Mejora |
|---|---|---|---|
| SWE-bench Pro (hard 51) | 29,4% | 43,1% | +13,7 puntos |
| Terminal-Bench 2.1 | 44,7% | 58,8% | +14,1 puntos |

El autor indica además que el adaptador usa menos del 40% de los turnos del modelo base en las tareas que ambos resuelven y aproximadamente 2 veces menos tokens generados, y que con thinking off iguala al modelo base con thinking en su máximo esfuerzo (xhigh) con 3,5–4,4 veces menos tokens.

Fidelidad de las builds MLX respecto a bf16 (datos del autor, MacBook Pro M5 Max de 128 GB, 19 de noviembre de 2026, mlx 0.32.4, mlx-lm 0.32.2, mlx-vlm 0.7.11):

| Build | Tamano | Mismo siguiente token que bf16 | KL vs bf16 | GSM8K (50 preguntas) | Memoria pico, prompt de 8K tokens | Memoria de Mac sugerida |
|---|---|---|---|---|---|---|
| MLX-6bit (recomendada) | 23,1 GB | 98,5% | 0,0015 | 46/50 | 23,4 GB | 36 GB+ |
| MLX-8bit | 30,0 GB | 99,2% | 0,0004 | 45/50 | 29,7 GB | 48 GB+ |
| MLX-4bit (esta build) | 16,3 GB | 96,1% | 0,0192 | 43/50 | 17,1 GB | 32 GB+ |
| MLX-bf16 | 55,6 GB | referencia | referencia | 45/50 | 53,4 GB | 96 GB+ |

## Requisitos de hardware

- VRAM/memoria unificada estimada: 17,1 GB de memoria pico con un prompt de 8.000 tokens; el autor recomienda un Mac con 32 GB o más para esta build de 4 bits.
- Hardware objetivo: Apple Silicon; verificado en un MacBook Pro con chip M5 Max y 128 GB de memoria unificada.
- No está pensado para GPU NVIDIA ni CUDA: el formato es MLX y la librería es mlx-lm/mlx-vlm.
- Despliegue: servidor compatible con OpenAI de mlx-lm (`mlx_lm.server`), generación con mlx-lm para texto y mlx-vlm para imágenes.
- Versiones mínimas indicadas: mlx-lm >= 0.32.2 y mlx-vlm >= 0.7.11.
- Latencia y throughput: no disponibles en la información proporcionada; el autor menciona reducción de tokens generados y uso de la capa MTP como draft model para decodificación especulativa, pero sin cifras de latencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| netprojects/Qwen3.8-27B-hermes-adapted-MLX-4bit | 27,78B | no disponible | 4 bits MLX | Apache 2.0 | Hugging Face, MLX |
| netprojects/Qwen3.8-27B-hermes-adapted-MLX-6bit | 27,78B | no disponible | 6 bits MLX | Apache 2.0 | Hugging Face, MLX |
| netprojects/Qwen3.8-27B-hermes-adapted-MLX-8bit | 27,78B | no disponible | 8 bits MLX | Apache 2.0 | Hugging Face, MLX |
| harness-hub/Qwen3.8-27B-hermes-adapted (adaptador original) | 27,78B (base) + LoRA | no disponible | bf16 + LoRA | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.8-27B (base) | 27,78B | no disponible | bf16 | no disponible en la información | Hugging Face |

Las diferencias principales entre las builds MLX son el tamaño, la fidelidad respecto a bf16 (96,1% de coincidencia en el siguiente token para 4 bits frente a 98,5% en 6 bits y 99,2% en 8 bits) y la memoria necesaria. No se dispone de datos de benchmarks comparativos con modelos de otros fabricantes en la información proporcionada.

## Limitaciones y advertencias

- El adaptador fue entrenado y evaluado con thinking off; el autor recomienda mantenerlo desactivado, por lo que el rendimiento con thinking activado no está validado.
- La build de 4 bits presenta una fidelidad del 96,1% en el siguiente token respecto a bf16 y una divergencia KL de 0,0192, superior a las builds de 6 y 8 bits; en GSM8K obtiene 43/50 frente a 45/50 de bf16, lo que implica una pérdida medible de precisión.
- El checkpoint del adaptador corresponde al paso 160 de 1000 planificados, por lo que el entrenamiento no está completado según lo previsto por el autor.
- El modelo está limitado a Apple Silicon y a la librería MLX; no es desplegable directamente en vLLM, TGI, llama.cpp u Ollama.
- Hermes Agent requiere al menos 64.000 tokens de contexto; no se especifica la longitud de contexto máxima del modelo en la información disponible.
- Con decodificación especulativa mediante MTP y decodificación greedy, el texto puede divergir ligeramente del decoding plano en casos de casi empate, según advierte el autor.
- Riesgo de alucinación y sesgos: no se documentan en la información proporcionada, pero son inherentes a los modelos de lenguaje y no se han publicado evaluaciones específicas.
- Idiomas soportados: no disponibles; no se puede confirmar el rendimiento multilingüe.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base Qwen3.8-27B y del adaptador original antes de producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netprojects/Qwen3.8-27B-hermes-adapted-MLX-4bit
- Modelo base del adaptador: https://huggingface.co/harness-hub/Qwen3.8-27B-hermes-adapted
- Modelo Qwen3.8-27B original: https://huggingface.co/Qwen/Qwen3.8-27B
- Build MLX 6 bits: https://huggingface.co/netprojects/Qwen3.8-27B-hermes-adapted-MLX-6bit
- Build MLX 8 bits: https://huggingface.co/netprojects/Qwen3.8-27B-hermes-adapted-MLX-8bit
- Build MLX bf16: https://huggingface.co/netprojects/Qwen3.8-27B-hermes-adapted-MLX-bf16
- Adaptador LoRA MLX: https://huggingface.co/netprojects/Qwen3.8-27B-hermes-adapted-MLX-adapter
- Repositorio de Hermes Agent: https://github.com/NousResearch/hermes-agent
