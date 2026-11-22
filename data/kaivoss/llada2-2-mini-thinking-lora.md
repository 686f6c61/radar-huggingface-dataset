# kaivoss/LLaDA2.2-mini-Thinking-LoRA

## Resumen

LLaDA2.2-mini-Thinking-LoRA es un adaptador LoRA publicado por el usuario kaivoss que se aplica sobre el modelo base inclusionAI/LLaDA2.2-mini, un modelo de lenguaje de difusión (diffusion language model). El adaptador introduce un modo de razonamiento explícito: el modelo genera un bloque `<think>…</think>` antes de responder o de invocar herramientas, imitando el comportamiento de los modelos de razonamiento tipo DeepSeek. El problema que resuelve es dotar de capacidad de "thinking" a un modelo de difusión que originalmente no la tenía, sin reentrenar el modelo completo.

El adaptador es extremadamente ligero (45 MB, rango 32, alpha 32) y se entrena exclusivamente sobre datos sintéticos generados por DeepSeek-V4: sesiones de agente (2.003) y respuestas de razonamiento (3.000). Los expertos enrutados del MoE subyacente no se tocan; solo se adaptan atención, MLP densa y expertos compartidos. La relevancia actual radica en que explora la combinación poco habitual de modelos de difusión con modos de razonamiento y tool calling, un área emergente frente a los transformers autorregresivos dominantes.

La información pública es escasa: no hay benchmarks, no se declaran idiomas soportados y el repo aparece con 0 descargas y 0 likes en el momento de la consulta. El modelo fusionado con detalles completos se publica por separado en kaivoss/LLaDA2.2-mini-Thinking.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión de lenguaje (diffusion language model) sobre base LLaDA2.2-mini; adaptador LoRA (PEFT) |
| Parametros totales | no disponible (depende del modelo base LLaDA2.2-mini) |
| Parametros activos | no disponible (el base se describe con expertos enrutados y expertos compartidos, arquitectura tipo MoE; cifras no publicadas) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; cuantización del base no especificada) |
| Idiomas soportados | no disponibles |
| Licencia | other / see-card (base Apache-2.0; dataset Jackrong/DeepSeek-V4-Distill-8000x MIT; dataset TeichAI/DeepSeek-v4-Pro-Agent sin licencia declarada) |
| Formato de pesos | safetensors (adaptador LoRA PEFT, 45 MB) |

## Arquitectura y entrenamiento

El adaptador se monta sobre LLaDA2.2-mini, un modelo de difusión de lenguaje con arquitectura que incluye atención, MLP densa y expertos compartidos junto con expertos enrutados (routed experts), lo que indica un diseño tipo mixture-of-experts. El LoRA tiene rango 32, alpha 32 y un tamaño de 45 MB; los targets del adaptador son la atención, la MLP densa y los expertos compartidos, mientras que los expertos enrutados quedan congelados. Esta decisión reduce el coste de entrenamiento y preserva la capacidad del base en los expertos especializados.

El entrenamiento consistió en 626 pasos sobre 2.003 sesiones de agente del dataset TeichAI/DeepSeek-v4-Pro-Agent y 3.000 respuestas de razonamiento de Jackrong/DeepSeek-V4-Distill-8000x. La pérdida en held-out bajó de 0,921 a 0,679. Ambos datasets son salidas de DeepSeek-V4, por lo que el adaptador esencialmente destila el estilo de razonamiento y tool calling de DeepSeek-V4 en el modelo de difusión. Una particularidad técnica relevante: la plantilla de chat del repo termina el prompt con `<think>\n`, y es imprescindible usarla porque, sin ella, el mecanismo de edición de tokens de LLaDA2.2 puede convertir el `<think>` de apertura en `</think>`. La generación usa decodificación por bloques con parámetros `gen_length`, `block_length`, `steps` y `threshold`, propios de los modelos de difusión.

## Capacidades

- Razonamiento explícito en modo thinking: genera un bloque `<think>…</think>` antes de la respuesta final.
- Tool calling / function calling: entrenado sobre sesiones de agente de DeepSeek-v4-Pro, por lo que soporta invocación de herramientas dentro del flujo de razonamiento.
- Razonamiento multi-paso orientado a agentes: las sesiones de entrenamiento provienen de trazas de agente.
- Generación de texto y respuestas a preguntas (por ejemplo, primalidad, matemáticas básicas) con traza de razonamiento visible.
- Decodificación por difusión con control de longitud y pasos (`gen_length`, `block_length`, `steps`, `threshold`).
- Capacidades multilingües: no disponibles (no se declaran idiomas).
- Visión, audio: no disponibles.

## Casos de uso

- Asistentes de agente con tool calling: el adaptador permite que LLaDA2.2-mini razone antes de invocar funciones, integrándose en pipelines donde se requiere una traza de decisión antes de la llamada a API.
- Investigación sobre modelos de difusión con razonamiento: permite comparar el comportamiento de un diffusion LM con modo thinking frente a transformers autorregresivos con el mismo estilo de datos.
- Destilación de trazas de DeepSeek-V4: útil para estudiar cómo se transfieren estilos de razonamiento y formato `<think>` a arquitecturas no autorregresivas.
- Generación de respuestas matemáticas simples con justificación: el ejemplo de la model card (primalidad de 221) muestra el patrón de razonamiento previo a la respuesta.
- Evaluación de LoRA sobre expertos compartidos: caso de estudio para medir el impacto de adaptar solo atención, MLP densa y expertos compartidos sin tocar expertos enrutados.
- Prototipado de agentes con ventana de generación controlada: los parámetros de bloque y pasos permiten ajustar coste/latencia en entornos de experimentación.
- Base para modelos fusionados listos para SGLang: el modelo fusionado publicado aparte incluye instrucciones de SGLang para despliegue en serving.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de rendimiento reportado es la pérdida en held-out durante el entrenamiento, que pasó de 0,921 a 0,679.

## Requisitos de hardware

- VRAM estimada: no disponible; depende del tamaño del modelo base LLaDA2.2-mini, cuyas cifras de parámetros no se publican en la información disponible.
- El adaptador en sí ocupa 45 MB, negligible frente al base.
- GPU recomendadas: no disponibles.
- Viabilidad en GPU consumer: no disponible (requiere conocer el tamaño del base).
- Opciones de despliegue: transformers + PEFT (merge_and_unload), y SGLang para el modelo fusionado según la model card del repo kaivoss/LLaDA2.2-mini-Thinking.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Razonamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kaivoss/LLaDA2.2-mini-Thinking-LoRA | no disponible (base LLaDA2.2-mini) | no disponible | `<think>` + tool calling | other / see-card | Hugging Face (0 descargas) |
| kaivoss/LLaDA2.2-mini-Thinking (fusionado) | no disponible | no disponible | `<think>` + tool calling | no disponible | Hugging Face |
| inclusionAI/LLaDA2.2-mini (base) | no disponible | no disponible | no (sin modo thinking) | Apache-2.0 | Hugging Face |

No se dispone de datos de benchmarks ni de modelos comparables adicionales en la información proporcionada.

## Limitaciones y advertencias

- Dependencia crítica de la plantilla de chat: sin el sufijo `<think>\n`, la edición de tokens de LLaDA2.2 puede corromper el bloque de razonamiento (convertir `<think>` en `</think>`).
- Entrenamiento sobre datos sintéticos de DeepSeek-V4: riesgo de heredar sesgos, errores y estilo del modelo profesor; posible alucinación en dominios no cubiertos por las trazas.
- Los expertos enrutados no se adaptan, lo que puede limitar la generalización del modo thinking a tareas que dependen de esos expertos.
- Idiomas soportados no declarados: no hay garantía de calidad multilingüe.
- Licencia compleja: el dataset TeichAI/DeepSeek-v4-Pro-Agent no declara licencia, por lo que el uso comercial requiere verificar términos de ambos datasets antes de desplegar.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad frente a alternativas.
- Repo con 0 descargas y 0 likes: madurez y soporte comunitario nulos en el momento de la consulta.
- Modelo de difusión: el flujo de generación difiere de transformers autorregresivos; requiere parámetros específicos (`gen_length`, `block_length`, `steps`, `threshold`) y puede presentar latencias distintas.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/kaivoss/LLaDA2.2-mini-Thinking-LoRA
- Modelo fusionado: https://huggingface.co/kaivoss/LLaDA2.2-mini-Thinking
- Modelo base: https://huggingface.co/inclusionAI/LLaDA2.2-mini
- Dataset de agente: https://huggingface.co/datasets/TeichAI/DeepSeek-v4-Pro-Agent
- Dataset de razonamiento: https://huggingface.co/datasets/Jackrong/DeepSeek-V4-Distill-8000x
