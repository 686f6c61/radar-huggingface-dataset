# amkkk/Trace-Inverter-4B-NoBubble

## Resumen

Trace-Inverter-4B-NoBubble es un modelo de 4 022 millones de parámetros desarrollado por el usuario amkkk (también asociado al repositorio GitHub DarthAmk97/TraceInverted4B-NoSum) para reconstruir una traza de razonamiento sintética y detallada a partir únicamente de un problema original y de una respuesta final conocida. A diferencia de otros modelos de inversión de trazas, este no requiere ningún «bubble» de razonamiento, resumen o cadena de pensamiento comprimida en la entrada, lo que lo hace adecuado para datos históricos donde solo existen pregunta y respuesta.

El modelo se basa en Qwen3-4B-Instruct-2507 y se entrena mediante LoRA (r64, α128, 1 época, secuencia de 2048 tokens) sobre los campos `inverted_reasoning` de los conjuntos de datos Jackrong/Claude-opus-4.6-TraceInversion-9000x y Jackrong/Claude-opus-4.7-TraceInversion-5000x, cuyas trazas fueron generadas originalmente por un pipeline de inversión condicionado por bubble. El entrenamiento elimina por completo el bubble de la entrada del estudiante, destilando así la reconstrucción asistida por bubble en un modelo sin bubble.

Su relevancia radica en la investigación sobre inversión de trazas y el llamado «no-summary setting», inspirado en el artículo *How to Steal Reasoning Without Reasoning Traces* (arXiv:2603.07267). El modelo no es un chat de propósito general, sino una herramienta específica para reconstruir razonamiento sintético bajo la condición de que la respuesta final actúa como restricción, no como verificación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen3-4B-Instruct-2507) con adaptador LoRA fusionado |
| Parametros totales | 4 022 468 096 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No especificados (repositorio en BF16, safetensors) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B-Instruct-2507 y se entrena con un adaptador LoRA en BF16 (r=64, α=128) durante una única época con secuencias de 2048 tokens. El objetivo de entrenamiento es aprender la función `I_no-bubble(x, y) → t̂`, donde `x` es el problema o contexto conversacional, `y` la respuesta final conocida y `t̂` la traza de razonamiento sintética reconstruida. Las trazas objetivo provienen de los conjuntos de datos de Jackrong, generados por un modelo de inversión condicionado por bubble (`I(x, y, b) → t̂`), pero el estudiante recibe únicamente `x` e `y`, sin ninguna información del bubble.

No se emplea RLHF ni DPO; el entrenamiento es exclusivamente de supervisión (SFT). La salida se fuerza a un formato estructurado de bloque `thinking… response` para facilitar el procesamiento posterior. La principal innovación es la destilación de la reconstrucción asistida por bubble hacia un modelo sin bubble, lo que permite eliminar el paso de generación de resumen en inferencia.

## Capacidades

- Reconstrucción de trazas de razonamiento sintéticas a partir de un problema y una respuesta final, sin necesidad de bubble, resumen ni cadena de pensamiento comprimida.
- Formato de salida estructurado en un único bloque `thinking… response`, fácil de parsear.
- Condicionamiento por la respuesta final como restricción de destino, no como afirmación verificada.
- No requiere un modelo de compresión separado en tiempo de inferencia; solo necesita `x + y`.
- No es un modelo de chat general: no se recomienda para conversación libre ni tareas fuera de la inversión de trazas.
- No se documentan capacidades de tool calling, visión, audio ni razonamiento multimodal.

## Casos de uso

- Investigación sobre inversión de trazas: permite estudiar cuánta información del razonamiento puede reconstruirse sin el bubble, comparando sus salidas con las de un modelo condicionado por bubble.
- Generación de datos sintéticos de razonamiento: puede producir trazas plausibles para entrenar otros modelos, siempre que se aplique una verificación posterior obligatoria de la respuesta.
- Análisis de logs históricos: en registros de soporte o chats antiguos donde solo existe la pregunta y la respuesta final, el modelo puede reconstruir un posible razonamiento intermedio.
- Estudio del valor informativo del bubble: al diferir sus resultados con los de `Jackrong/Trace-Inverter-4B` (que sí recibe bubble), se puede medir cuánto contribuye el bubble a la calidad de la reconstrucción.
- Creación de supervisión sintética para fine-tuning: las trazas generadas pueden usarse como datos de entrenamiento para modelos de razonamiento, con la precaución de que no representan el razonamiento real de ningún modelo.
- Aplicaciones educativas o explicativas: dado un problema y su solución, el modelo puede generar una explicación paso a paso (sintética) que ayude a entender un posible camino de resolución.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas estándar para este modelo.

## Requisitos de hardware

- Estimación de VRAM para inferencia: con 4 022 millones de parámetros, en BF16 se requieren aproximadamente 8 GB de VRAM; con cuantización de 8 bits unos 4 GB y con 4 bits unos 2 GB (valores orientativos, no confirmados por el autor).
- GPU recomendadas: cualquier GPU consumer con al menos 8 GB de VRAM puede ejecutar el modelo en BF16 (por ejemplo, RTX 3070/3080/3090, RTX 4070/4080/4090). Con cuantización, GPUs de 4-6 GB también son viables.
- Opciones de despliegue: compatible con vLLM, llama.cpp, Ollama, TGI y cualquier framework que soporte safetensors y arquitecturas Qwen3.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Bubble en entrada | Entrenamiento | Licencia |
|---|---|---|---|---|---|
| Trace-Inverter-4B-NoBubble (este) | 4,02 B | No disponible | No | LoRA SFT sobre Qwen3-4B-Instruct-2507 | Apache-2.0 |
| Jackrong/Trace-Inverter-4B | 4,02 B (estimado) | No disponible | Sí | LoRA SFT sobre Qwen3-4B-Instruct-2507 | Apache-2.0 |
| Qwen3-4B-Instruct-2507 (base) | 4,02 B | No disponible (típicamente 32K en Qwen3) | No | Instruct, RLHF | Apache-2.0 |

El modelo se diferencia de su homólogo con bubble en que no acepta ni requiere el bubble en la entrada, lo que lo hace aplicable a datos donde este no existe. Frente al base, está especializado exclusivamente en la reconstrucción de trazas y no en conversación general.

## Limitaciones y advertencias

- La traza generada es una reconstrucción sintética, no el razonamiento oculto real de ningún modelo (Claude, Qwen u otro). No debe presentarse como cadena de pensamiento recuperada.
- El modelo no verifica la respuesta final: si se le proporciona una respuesta incorrecta, construirá una traza plausible que conduzca a ella, lo que puede inducir a error.
- No es un modelo de chat general; su uso fuera de la tarea de inversión de trazas probablemente dé resultados pobres.
- Riesgo de alucinación y de sesgos heredados del modelo base Qwen3-4B-Instruct-2507.
- No se especifican idiomas soportados; aunque el base es multilingüe, el entrenamiento con datos en inglés (los conjuntos de Jackrong) puede limitar el rendimiento en otros idiomas.
- La licencia Apache-2.0 permite uso comercial, pero el autor advierte explícitamente que no debe usarse para presentar las trazas como razonamiento real de ningún sistema.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/amkkk/Trace-Inverter-4B-NoBubble)
- [Modelo hermano con bubble: Jackrong/Trace-Inverter-4B](https://huggingface.co/Jackrong/Trace-Inverter-4B)
- [Dataset 1: Jackrong/Claude-opus-4.6-TraceInversion-9000x](https://huggingface.co/datasets/Jackrong/Claude-opus-4.6-TraceInversion-9000x)
- [Dataset 2: Jackrong/Claude-opus-4.7-TraceInversion-5000x](https://huggingface.co/datasets/Jackrong/Claude-opus-4.7-TraceInversion-5000x)
- [Repositorio GitHub relacionado](https://github.com/DarthAmk97/TraceInverted4B-NoSum)
- [Página de inferencia en FriendliAI](https://friendli.ai/models/amkkk/Trace-Inverter-4B-NoBubble)
- [Artículo de referencia: arXiv:2603.07267](https://arxiv.org/abs/2603.07267)
