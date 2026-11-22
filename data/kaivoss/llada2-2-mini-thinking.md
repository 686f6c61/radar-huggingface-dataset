# kaivoss/LLaDA2.2-mini-Thinking

## Resumen

LLaDA2.2-mini-Thinking es un ajuste fino del modelo de difusión de bloques (block-diffusion) LLaDA2.2-mini de inclusionAI, un transformer con mezcla de expertos (MoE) de 16.255.643.392 parámetros totales y 1.400 millones de parámetros activos. El autor del ajuste es el usuario independiente kaivoss, que ha aplicado un LoRA de rango 32 sobre atención, MLP densa y expertos compartidos para dotar al modelo base de un modo de razonamiento explícito delimitado por las etiquetas `<think>…</think>` antes de responder o invocar una herramienta. El modelo base, por contra, responde de forma directa y nunca «piensa».

El problema que resuelve es concreto: LLaDA2.2-mini no genera trazas de razonamiento, lo que limita su utilidad en tareas de agente que requieren planificación intermedia y en problemas matemáticos o de código donde el razonamiento paso a paso mejora la precisión. Este ajuste incorpora ese comportamiento mediante SFT con pérdida de difusión por bloques sobre 2.003 sesiones de agente y 3.000 respuestas de razonamiento (25,6 millones de tokens) destiladas de DeepSeek-V4.

Es relevante ahora porque demuestra que un ajuste LoRA de bajo coste (626 pasos, una A100 de 80 GB, 5,3 horas) puede añadir un modo de razonamiento a un modelo de difusión MoE sin tocar los 256 expertos enrutados ni el router. No obstante, la evaluación publicada es muy limitada (8 prompts retenidos) y no constituye un benchmark, por lo que debe tratarse como una prueba de concepto más que como un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE con difusión de bloques (block-diffusion), tipo `llada2_moe` |
| Parámetros totales | 16.255.643.392 |
| Parámetros activos | 1.400 millones (1.4B) |
| Longitud de contexto | 32.768 tokens por defecto en SGLang; ampliable hasta 131.072 |
| Tipos de cuantización | No disponible (el repo contiene pesos bf16 fusionados; no se documentan cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | `other` / `see-card`; el modelo base es Apache-2.0, pero el dataset TeichAI/DeepSeek-v4-Pro-Agent no declara licencia |
| Formato de pesos | safetensors (bf16 fusionado), con `custom_code` y `trust_remote_code` requerido |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de LLaDA2.2-mini: un transformer con mezcla de expertos que emplea difusión de bloques en lugar de decodificación autorregresiva token a token. Cuenta con 256 expertos enrutados más expertos compartidos, de los cuales solo 1.4B parámetros están activos por paso. La generación se controla mediante parámetros de difusión (`gen_length`, `block_length`, `steps`, `threshold`) y un mecanismo de edición de tokens activado por defecto que puede reescribir tokens ya generados.

El ajuste se realizó con LoRA de rango 32 en bf16 sobre las capas de atención, la MLP densa y los expertos compartidos, fusionado posteriormente en los pesos. Los 256 expertos enrutados y el router quedaron intactos. Los datos de entrenamiento son 2.003 sesiones de agente del dataset TeichAI/DeepSeek-v4-Pro-Agent y 3.000 respuestas de razonamiento de Jackrong/DeepSeek-V4-Distill-8000x, sumando 25,6 millones de tokens. El entrenamiento usó la receta dFactory con pérdida SFT de difusión por bloques: 626 pasos en una A100 de 80 GB durante 5,3 horas, con una pérdida en validación que bajó de 0,921 a 0,679. La innovación principal es precisamente la incorporación de un modo de razonamiento a un modelo de difusión, un paradigma poco habitual para este tipo de comportamiento.

## Capacidades

- Generación de texto conversacional con modo de razonamiento explícito en `<think>…</think>` antes de la respuesta final.
- Razonamiento matemático paso a paso (el modelo base ya acertaba 2/2 en las preguntas de prueba; este añade el desarrollo del razonamiento).
- Razonamiento para tareas de agente: planificación breve («Let me explore the workspace…») antes de invocar herramientas.
- Tool calling / function calling en el formato nativo de LLaDA2.2, que emplea los mismos tokens de llamada a herramientas que Kimi-K2.
- Soporte de agentes multi-paso mediante sesiones de agente multi-turno.
- Separación de la traza de razonamiento y la respuesta final mediante el parser `deepseek-r1` de SGLang (expone `reasoning_content`).
- Generación no autorregresiva por difusión de bloques, con control de longitud y pasos.
- Capacidades multilingües: no disponibles (no documentadas).

## Casos de uso

- Razonamiento matemático asistido: el modelo desarrolla el problema paso a paso dentro de `<think>` antes de dar la respuesta, lo que facilita la verificación del resultado por parte del usuario. Adecuado para problemas de aritmética modular, álgebra y cálculo como los mostrados en la model card.
- Agentes de codificación: en tareas de agente de programación, el modelo planifica brevemente la exploración del espacio de trabajo y después emite llamadas a herramientas en el formato nativo de LLaDA2.2, integrándose en bucles de agente multi-turno.
- Automatización de flujos con tool calling: al compartir los tokens de llamada de Kimi-K2, puede conectarse a servidores compatibles con OpenAI y usar el parser `kimi_k2` de SGLang para orquestar funciones externas.
- Asistentes conversacionales con traza auditable: la separación entre `reasoning_content` y `content` permite registrar y auditar el razonamiento del modelo en aplicaciones de atención al cliente o soporte técnico.
- Investigación sobre modelos de difusión: sirve como caso de estudio de cómo un LoRA de bajo coste añade razonamiento a un modelo de difusión MoE sin alterar el router ni los expertos enrutados.
- Prototipado rápido en una sola GPU: con ~33 GB de pesos en bf16 cabe en una A100 de 80 GB con `--tp-size 1`, lo que permite desplegar un endpoint compatible con OpenAI para pruebas internas.
- Destilación y generación de datos sintéticos de razonamiento: el modo `<think>` produce trazas que pueden reutilizarse como datos de entrenamiento para modelos más pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card incluye únicamente una comprobación cualitativa sobre 8 prompts retenidos (4 tareas de agente de código y 4 preguntas), que no constituye un benchmark:

| Métrica | Base | Este modelo |
|---|---|---|
| Empieza con `<think>` | 0 / 8 | 8 / 8 |
| Cierra `</think>` en 1.536 tokens | 0 / 8 | 7 / 8 |
| Respuestas matemáticas correctas (2 preguntas) | 2 / 2 | 2 / 2, con razonamiento desarrollado |
| Pérdida en validación | 0,921 | 0,679 |

## Requisitos de hardware

- VRAM estimada: ~33 GB para los pesos en bf16, según la model card; una GPU de 80 GB es suficiente con `--tp-size 1`.
- GPU recomendadas: A100 80 GB (la usada en el entrenamiento y en el ejemplo de despliegue); H100 para mayor throughput; configuraciones multi-GPU con `--tp-size` mayor para contexto extendido.
- GPU de consumo: no se documenta soporte en GPUs de consumo; los ~33 GB en bf16 no caben en tarjetas de 24 GB sin cuantización, y no se publican pesos cuantizados.
- Opciones de despliegue: SGLang (rama `main`, con `--dllm-algorithm JointThresholdInDel`, `--moe-runner-backend triton`, `--trust-remote-code`) y Transformers con `AutoModelForCausalLM` y `trust_remote_code=True`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La generación por difusión con `block_length=32` y `steps=32` no tiene cifras publicadas de latencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Paradigma | Licencia |
|---|---|---|---|---|---|
| LLaDA2.2-mini-Thinking (este) | 16,26B | 1,4B | 32.768 (hasta 131.072) | Difusión de bloques MoE + thinking | `other` / `see-card` |
| inclusionAI/LLaDA2.2-mini (base) | 16,26B | 1,4B | Hasta 131.072 | Difusión de bloques MoE, sin thinking | Apache-2.0 |
| Modelos densos de ~7-8B con thinking | ~7-8B | ~7-8B | 32K-128K | Autorregresivo + thinking | Variables |

La comparación con modelos autorregresivos densos de tamaño similar es solo orientativa: no se dispone de benchmarks comparables publicados para este ajuste, y el paradigma de difusión de bloques difiere en latencia y control de generación. No disponible para alternativas concretas con datos verificables en la información proporcionada.

## Limitaciones y advertencias

- Evaluación muy limitada: solo 8 prompts retenidos; el autor advierte explícitamente de que pueden aparecer bordes ásperos.
- Razonamientos largos que no cierran: 1 de 8 respuestas no cerró `</think>` en 1.536 tokens; hay que dar margen suficiente a `max_tokens` o `gen_length`.
- Llamadas a herramientas no verificadas: el formato se comprobó, pero las llamadas no se ejecutaron en un harness real.
- Dependencia crítica del prefill de `<think>`: la plantilla de chat termina en `<role>assistant</role><think>\n`; si se construyen prompts a mano sin ese sufijo, la edición de tokens de LLaDA2.2 puede reescribir `<think>` como `</think>` (solo 1 de 8 respuestas abrió correctamente en esa prueba).
- Estilo heredado de DeepSeek: las respuestas suelen empezar reformulando la tarea («We need to…»).
- Riesgo de alucinación: no cuantificado; al ser un ajuste sobre datos destilados de DeepSeek-V4, puede reproducir errores de esos datos.
- Licencia: el modelo base es Apache-2.0, pero el ajuste se distribuye como `other`/`see-card` y el dataset TeichAI/DeepSeek-v4-Pro-Agent no declara licencia; hay que revisar los términos antes de un uso comercial.
- Idiomas: no documentados; no se puede asumir cobertura multilingüe.
- Dependencia de `trust_remote_code` y de la rama `main` de SGLang: no hay soporte estable en versiones publicadas, lo que complica el despliegue reproducible.
- Los parsers de razonamiento y de tool calling no han sido probados por el autor con este modelo concreto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kaivoss/LLaDA2.2-mini-Thinking
- LoRA: https://huggingface.co/kaivoss/LLaDA2.2-mini-Thinking-LoRA
- Modelo base: https://huggingface.co/inclusionAI/LLaDA2.2-mini
- Dataset de agente: https://huggingface.co/datasets/TeichAI/DeepSeek-v4-Pro-Agent
- Dataset de razonamiento: https://huggingface.co/datasets/Jackrong/DeepSeek-V4-Distill-8000x
- SGLang (rama `main`): https://github.com/sgl-project/sglang
