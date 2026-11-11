# shaban2024/Qwen3.5-2B-BOS-Non-Thinking

## Resumen

AgentMujo Non-Thinking (v0.1) es un ajuste fino del modelo base `alphaedge-ai/Qwen3.5-2B-bos-32768`, una variante en bosnio de la familia Qwen3.5 con ventana de contexto de 32.768 tokens. Lo desarrolla el usuario shaban2024 dentro del proyecto AgentMujo, un framework de entrenamiento orientado a *function calling* y comportamiento agéntico en bosnio. El modelo se publica en formato bf16 completo (safetensors) y cuenta con 1.440.374.592 parámetros reales.

El problema que aborda es concreto: los modelos base multilingües rinden mal en la selección y el formateo de llamadas a herramientas cuando se les pide operar en bosnio con un protocolo agéntico estricto. El ajuste combina tres fases de LoRA (function calling, comportamiento agéntico de terminal y rebalanceo) fusionadas en los pesos finales, con un perfil "non-thinking" que evita la cadena de razonamiento explícita.

Su relevancia es limitada pero específica: es un modelo pequeño (1,4B), con licencia Apache-2.0, pensado para despliegue local en entornos con recursos modestos y para tareas de orquestación de herramientas en bosnio. No compite en conocimiento general ni en razonamiento abierto; su valor está en la fiabilidad del *tool calling* medida con el benchmark propio AgentMujo-Bench v0.3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5, tipo `qwen3_5_text`) |
| Parametros totales | 1.440.374.592 (1,44B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (heredada del modelo base) |
| Tipos de cuantizacion | bf16 (pesos publicados); existe variante Q8 en `shaban2024/Qwen3.5-2B-BOS-Q8-NonThinking`; otras cuantizaciones no disponibles |
| Idiomas soportados | bosnio (bs); conocimiento de otros idiomas no evaluado |
| Licencia | Apache-2.0 (aplican también los términos de Qwen para la arquitectura original) |
| Formato de pesos | safetensors (bf16) |
| Tamano del repositorio | 2,9 GB |
| Modelo base | `alphaedge-ai/Qwen3.5-2B-bos-32768` (commit `2f89b833`) |
| Perfil | Non-Thinking (sin cadena de razonamiento explícita) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder-only de la familia Qwen3.5 en su variante textual (`qwen3_5_text`), con 1,44B parámetros y contexto de 32.768 tokens. Sobre esa base se aplicó un ajuste LoRA con r=16, alpha=32 sobre 7 módulos, en precisión bf16 y entrenado en una GPU T4. El proceso se dividió en tres fases secuenciales: 147 muestras de *function calling*, 105 de comportamiento agéntico de terminal y 100 de rebalanceo, todas ellas fusionadas (merge) en los pesos finales publicados.

Los conjuntos de datos empleados son `shaban2024/agentmujo-function-calling`, `agentmujo-agentic-terminal` y `agentmujo-rebalance-01`, todos bajo Apache-2.0. El framework de entrenamiento está publicado en el repositorio `xnet-ba/agentmujo-training`, con los jobs `qwen35-fc-20260916-kaggle04`, `qwen35-ag-20260916-kaggle05` y `qwen35-rb-20260916-kaggle06`. No se documenta uso de RLHF ni DPO; el ajuste es supervisado sobre datos propios. La innovación destacable no está en la arquitectura, sino en el perfil *non-thinking* y en el protocolo de evaluación AgentMujo-Bench.

## Capacidades

- Generación de texto en bosnio para tareas operativas y de orquestación.
- *Function calling* / *tool calling*: selección de herramienta y generación de argumentos con formato estructurado.
- Comportamiento agéntico de terminal: ejecución de comandos como mecanismo de respaldo (*fallback*).
- Razonamiento multi-paso limitado al ámbito de herramientas y terminal; no se documenta razonamiento abierto general.
- Perfil non-thinking: no genera cadena de razonamiento explícita antes de responder.
- Multilingüe: solo se declara bosnio; el conocimiento fuera de tareas operativas se describe como débil.
- No se documentan capacidades de visión, audio ni *thinking mode*.

## Casos de uso

- Orquestación de herramientas en asistentes locales en bosnio: el modelo selecciona la función adecuada y rellena argumentos con alta fiabilidad según el benchmark propio, lo que permite construir agentes ligeros que caben en hardware modesto.
- Automatización de terminal controlada: con un *Policy Engine* obligatorio delante, el modelo puede proponer comandos de shell para tareas de administración sencilla, usando el terminal como *fallback* cuando no hay herramienta específica.
- Enrutado de intenciones en pipelines de atención al cliente: clasificar la petición del usuario y derivarla a la API o al flujo correcto sin necesidad de un modelo grande.
- Prototipado rápido de agentes en investigación: su tamaño de 1,44B y licencia Apache-2.0 permiten iterar en una sola GPU consumer o incluso en CPU con cuantización.
- Evaluación de protocolos de *tool calling*: sirve como referencia reproducible para comparar frameworks de agentes en un idioma de bajos recursos como el bosnio.
- Despliegue en el borde (*edge*) para asistentes de dominio cerrado: al no requerir cadena de razonamiento, la latencia es menor y el consumo de memoria queda acotado.
- Generación de llamadas a API en aplicaciones internas de empresas bosnias: integración con backends propios mediante JSON estructurado.

## Benchmarks y rendimiento

Resultados publicados por el autor en AgentMujo-Bench v0.3 (evaluación del adaptador en bf16):

| Metrica | Modelo base | Este modelo (adaptador) |
|---|---|---|
| tool_selection | 0,167 | 1,0 |
| argument_accuracy | 0,0 | 1,0 |
| high_level_preference | 0,0 | 1,0 |
| refusal_correctness | 0,5 | 1,0 |
| safety | 1,0 | 1,0 |
| no_tool_correctness | 1,0 | 0,0 (limitación conocida) |

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La variante Q8 presenta una caída leve en precisión de argumentos (de 1,0 a 0,8 según el autor; ver QUANT_EVAL en el repositorio).

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 2,9 GB de pesos más overhead de activaciones y caché KV; en la práctica, unos 5-6 GB para contexto moderado.
- VRAM estimada en Q8: alrededor de 1,5 GB de pesos; cabe holgadamente en GPUs de 4-8 GB.
- GPU recomendadas: T4 (fue la usada en entrenamiento), RTX 3060/4060, RTX 4090, A100/H100 para despliegues con alta concurrencia.
- Cabe en GPU consumer: sí, en cualquier tarjeta con 6 GB o más en bf16 y en 4 GB en Q8.
- Opciones de despliegue: transformers (con `trust_remote_code=True`), llama.cpp/Ollama si se generan GGUF a partir de los pesos, vLLM y TGI para servir en producción.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AgentMujo Non-Thinking (este) | 1,44B | 32.768 | Function calling en bosnio | Apache-2.0 | Hugging Face |
| Modelo base `alphaedge-ai/Qwen3.5-2B-bos-32768` | ~2B | 32.768 | Base multilingüe en bosnio | Apache-2.0 | Hugging Face |
| Qwen3.5-2B (original) | ~2B | 32.768 | Base general multilingüe | Apache-2.0 (según términos Qwen) | Hugging Face |
| Variante Q8 del mismo modelo | 1,44B | 32.768 | Igual, cuantizada | Apache-2.0 | Hugging Face |

La comparación con modelos de *tool calling* de mayor tamaño (por ejemplo, variantes de 7B o superiores) no está disponible en la información proporcionada; el autor solo publica comparación contra su propio modelo base.

## Limitaciones y advertencias

- El comportamiento sin herramienta (*no-tool*) es deficiente: el benchmark muestra 0,0 en `no_tool_correctness` frente a 1,0 del modelo base. El terminal se plantea como *fallback* y el autor exige un *Policy Engine* obligatorio en producción.
- El conocimiento del bosnio fuera de tareas operativas es débil; no es un modelo para preguntas abiertas ni para generación de contenido general.
- No se han evaluado sesgos; el entrenamiento se limita a datasets propios pequeños (147 + 105 + 100 muestras), lo que aumenta el riesgo de sobreajuste al formato y de alucinación fuera de distribución.
- La cuantización Q8 degrada la precisión de argumentos (1,0 a 0,8), por lo que conviene validar el formato de salida en cada despliegue.
- La licencia Apache-2.0 permite uso comercial, pero los términos de Qwen aplican a la arquitectura original; conviene revisarlos antes de explotación comercial.
- El modelo se publicó el 11 de noviembre de 2026 y no tiene descargas ni valoraciones; su madurez y soporte comunitario son nulos por ahora.
- No hay datos sobre latencia, throughput ni comportamiento con contexto muy largo, pese a declarar 32.768 tokens.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shaban2024/Qwen3.5-2B-BOS-Non-Thinking
- Modelo base: https://huggingface.co/alphaedge-ai/Qwen3.5-2B-bos-32768
- Variante cuantizada Q8: https://huggingface.co/shaban2024/Qwen3.5-2B-BOS-Q8-NonThinking
- Framework de entrenamiento: https://github.com/xnet-ba/agentmujo-training
- Dataset de function calling: https://huggingface.co/datasets/shaban2024/agentmujo-function-calling
- Dataset agéntico de terminal: `agentmujo-agentic-terminal` (referenciado en la model card, sin URL directa en la información disponible)
- Dataset de rebalanceo: `agentmujo-rebalance-01` (referenciado en la model card, sin URL directa en la información disponible)
