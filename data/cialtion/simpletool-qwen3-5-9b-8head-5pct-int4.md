# Cialtion/SimpleTool-Qwen3.5-9B-8Head-5pct-INT4

## Resumen

SimpleTool-Qwen3.5-9B-8Head-5pct-INT4 es un checkpoint derivado de Qwen/Qwen3.5-9B, publicado por el usuario Cialtion, que implementa el esquema SimpleTool de ocho cabezas lógicas: una para contenido y siete para la generación de llamadas a herramientas (nombre de función más hasta seis argumentos). El modelo no es un ajuste LoRA ni un recorte del modelo base: los pesos están fusionados en un único checkpoint cuantizado a INT4 y serializado en formato AWQ, con los tensores no cuantizados conservados en FP16. El objetivo declarado es la generación estructurada de tool calls en un solo paso, evitando la decodificación autoregresiva convencional de un JSON completo.

La etiqueta "5pct" hace referencia a la fracción de datos de entrenamiento empleada en el proyecto, no a una poda de parámetros. El checkpoint guarda el paso de entrenamiento 5074 e incluye el tokenizador entrenado y 17 tokens especiales de apertura, cierre y nulo. El modelo base Qwen3.5-9B aporta la arquitectura y el conocimiento general; SimpleTool añade las cabezas y el protocolo de prompt necesarios para que la inferencia funcione.

Es relevante ahora porque propone una alternativa a los pipelines de function calling basados en gramáticas o en decodificación restringida: aquí la estructura de la llamada está codificada en las propias cabezas del modelo. La contrapartida es que exige un backend compatible con la arquitectura Qwen3.5/Qwen3.6 y con el formato de cuantización AWQ, además de un protocolo de prompt muy específico que no admite sustituciones silenciosas si se quiere reproducir la puntuación reportada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5) con ocho cabezas lógicas SimpleTool (content, function, arg1–arg6) |
| Parametros totales | 9.653.104.368 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 affine RTN/group64 en serializacion AWQ; tensores no cuantizados en FP16 |
| Idiomas soportados | chino (zh), ingles (en) |
| Licencia | Apache 2.0 (licencia upstream conservada en LICENSE) |
| Formato de pesos | safetensors (INT4 AWQ); tamano del repo 9,2 GB |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-9B, un transformer decoder-only, y le superpone ocho ramas lógicas que comparten el backbone y decodifican de forma autoregresiva independiente: `content`, `function` y `arg1` a `arg6`. Cada rama se detiene en su marcador de cierre correspondiente del tokenizador, y `<|null|>` representa un slot omitido o no utilizado. El checkpoint fusiona los pesos y no requiere LoRA externo ni un checkpoint base adicional en tiempo de ejecución. La cuantización es INT4 affine RTN con grupos de 64, serializada como AWQ; no hay calibración de activaciones y los tensores no cuantizados permanecen en FP16.

El entrenamiento se realizó sobre datos sintéticos emparejados del dataset Cialtion/SimpleTool-Diagnostic-800, con 400 casos en chino y 400 en inglés, y el checkpoint corresponde al paso 5074. No se documenta el número total de tokens de entrenamiento ni la composición completa del dataset, y tampoco se menciona RLHF o DPO. La innovación técnica principal es el esquema de cabezas: la función y sus argumentos se generan en ramas separadas a partir de un orden de propiedades fijado en el prompt, de modo que la selección de la función determina qué cabezas de argumento se consideran válidas y las cabezas sobrantes se ignoran. Las cabezas de argumento no se condicionan sobre la salida de la cabeza de función ya generada.

## Capacidades

- Generación de llamadas a herramientas con función y hasta seis argumentos en ramas separadas.
- Generación de contenido mediante la cabeza `content` (no evaluada en el diagnóstico publicado).
- Soporte de tool calling estructurado con tipos estrictos y valores literales en los argumentos.
- Manejo de slots omitidos mediante el token especial `<|null|>`.
- Capacidades multilingües limitadas a chino e inglés.
- Compatibilidad con un cliente de completions compatible con OpenAI incluido en el repo (`infer_heads.py`), que imprime propuestas de llamada y nunca ejecuta herramientas.
- No se documentan capacidades de visión, audio, modo thinking explícito ni razonamiento multi-paso más allá del protocolo de prompt.

## Casos de uso

- Automatización de agentes con function calling: el modelo propone la función y los argumentos en un solo paso estructurado, lo que simplifica el parseo en el orquestador; requiere validar la llamada antes de ejecutarla.
- Integración en asistentes conversacionales bilingües chino-inglés: el entrenamiento y la evaluación cubren ambos idiomas con 400 casos cada uno, lo que lo hace adecuado para productos dirigidos a esos mercados.
- Enrutamiento de intenciones hacia APIs internas: la cabeza `function` permite seleccionar la herramienta candidata y la cabeza `arg1`–`argN` rellenar los parámetros en el orden declarado en el esquema.
- Evaluación de pipelines de tool calling: sirve como componente de referencia para comparar estrategias de decodificación restringida frente a cabezas dedicadas, usando el conjunto diagnóstico de 800 casos.
- Prototipado de agentes con esquemas de hasta seis argumentos: el límite de aridad está codificado en el modelo y conviene verificarlo antes de diseñar herramientas con más parámetros.
- Despliegue en entornos con VRAM limitada: al estar cuantizado a INT4 en un repo de 9,2 GB, es viable en GPUs de consumo alto, siempre que el backend soporte la arquitectura y el formato AWQ.
- Investigación sobre cabezas múltiples y decodificación estructurada: el checkpoint permite reproducir el protocolo `empty-think` y comparar con las variantes históricas de 0,8B, 2B y 4B mencionadas en la model card.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre SimpleTool Diagnostic 800 (800 casos sintéticos emparejados de llamada única, 400 en chino y 400 en inglés; sin ejecución de herramientas y sin generación de la cabeza de contenido). Medición en INT4/FP16, muestreo greedy, temperatura 0, semilla 1107, máximo 128 tokens generados por cabeza activa y protocolo de prompt `empty-think`.

| Lote de evaluacion | Llamadas requeridas correctas | Casos |
|---|---:|---:|
| Contrafactual chino | 166 | 200 |
| Contrafactual ingles | 173 | 200 |
| Bilingue dificil | 87 | 200 |
| Bilingue multiargumento | 125 | 200 |
| **Todas las llamadas requeridas** | **551 (68,875%)** | **800** |
| Solo nombre de funcion | 770 (96,250%) | 800 |

El autor advierte que son puntuaciones de un diagnóstico sintético local, que los registros emparejados están correlacionados, que las etiquetas pueden contener errores residuales y que el conjunto no es un benchmark oficial BFCL ni Mobile Actions ni representa usuarios en producción. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de latencia o throughput en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el repo ocupa 9,2 GB en INT4, por lo que se necesita al menos esa cifra más overhead de runtime y caché KV.
- GPU recomendadas: no disponible en la información proporcionada; el autor solo indica que se use un backend compatible con la arquitectura Qwen3.5/Qwen3.6 y con el formato de cuantización del checkpoint.
- Cabe en GPU de consumo: previsiblemente en tarjetas con 16 GB o más de VRAM en INT4, aunque no hay confirmación oficial.
- Opciones de despliegue: backend compatible con Qwen3.5/Qwen3.6 y AWQ; el repo incluye `infer_heads.py`, un cliente de completions compatible con OpenAI. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Nota de precisión: para FP8 el autor recomienda cómputo BF16; en particular, el caso 397B FP8 con cómputo FP16 presenta un desbordamiento diagnosticado en el intermedio de los shared experts que puede producir generación inválida.
- Latencia y throughput: no se reclama ningún resultado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque de tool calling | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SimpleTool-Qwen3.5-9B-8Head-5pct-INT4 | 9,65B | no disponible | Cabezas dedicadas (function + arg1–arg6) | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-9B (base) | ~9B | no disponible | Decodificación autoregresiva estándar | no disponible en la informacion | Hugging Face |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con otros modelos de tool calling en la información proporcionada, por lo que no es posible establecer una comparación de rendimiento rigurosa.

## Limitaciones y advertencias

- El protocolo de prompt es estricto: las propiedades requeridas deben ir primero, `required` en el mismo orden y las cabezas `arg1`–`argN` se vinculan a ese orden; alterarlo invalida la puntuación reportada.
- Para modelos de 9B o mayores debe usarse el protocolo `empty-think` (bloque `\n\n` explícito antes del marcador de cabeza); el protocolo `direct` corresponde a las variantes históricas de 0,8B/2B/4B.
- La aridad máxima es de seis argumentos; herramientas con más parámetros no están cubiertas por el esquema.
- Las cabezas de argumento no se condicionan sobre la función generada, lo que puede producir inconsistencias entre función y argumentos.
- El modelo solo declara soporte de chino e inglés.
- Riesgo de alucinación en nombres de función y valores de argumentos: el autor exige que las aplicaciones validen las llamadas antes de ejecutarlas.
- El cliente incluido imprime propuestas y nunca ejecuta herramientas; no garantiza una operación física única de shared-prefill.
- Los resultados publicados son de un diagnóstico sintético local, no de un benchmark oficial, y no establecen una ley de escalado controlada.
- No se documentan sesgos conocidos, latencia ni throughput.
- Licencia Apache 2.0 para el modelo; la licencia del dataset es independiente (CC BY 4.0).
- El autor no reporta un benchmark visual de release, aunque el artefacto de generación condicional conserva componentes visuales cuando existen en su exportación de origen.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Cialtion/SimpleTool-Qwen3.5-9B-8Head-5pct-INT4
- Dataset de diagnóstico: https://huggingface.co/datasets/Cialtion/SimpleTool-Diagnostic-800
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Contrato de serving: INFERENCE.md (incluido en el repositorio del modelo)
- Cliente de inferencia: infer_heads.py (incluido en el repositorio del modelo)
