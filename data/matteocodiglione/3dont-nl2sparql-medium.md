# MatteoCodiglione/3dont-nl2sparql-medium

## Resumen

3dont-nl2sparql-medium es un ajuste fino mediante LoRA del modelo base Qwen/Qwen3.5-4B, publicado por MatteoCodiglione, cuyo objetivo es convertir preguntas en lenguaje natural sobre nubes de puntos 3D y su ontología asociada en las cinco listas estructuradas (L1 a L5) que la librería NL-2-SPARQL de 3DGraphExplorer transforma posteriormente en consultas SPARQL. No es un modelo de propósito general, sino un componente especializado de un pipeline de consulta semántica sobre grafos de conocimiento 3D.

El modelo resuelve el paso intermedio de traducción entre lenguaje natural y una representación lógica intermedia, delegando la generación final de SPARQL a la librería determinista. Esta separación reduce el riesgo de sintaxis SPARQL inválida, ya que el modelo solo debe producir listas estructuradas y no la consulta completa. El ajuste se realizó con LoRA de rango 16 durante una época sobre el conjunto NL-2-SPARQL de 3DOnt, que combina preguntas originales, estructuras lógicas nuevas generadas y aproximadamente 10.000 preguntas escritas a mano.

Con 4.659.865.088 parámetros reales en safetensors y un repositorio de 9,3 GB, se sitúa en la gama de 4B, lo que permite despliegue en hardware de consumo con cuantización. La licencia Apache 2.0 y la disponibilidad de variantes MLX (4 bits) y MLC (WebGPU q4f16_1) facilitan su integración tanto en entornos de servidor como en demos web y Apple Silicon.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5), ajuste fino con LoRA (rango 16) |
| Parametros totales | 4.659.865.088 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | MLX 4 bits (variante `-mlx`); MLC q4f16_1 (variante `-MLC`); otras no disponibles |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato Hugging Face transformers); variantes MLX y MLC |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer decoder-only de la familia Qwen3.5, y se ajusta con LoRA de rango 16 durante una única época. El conjunto de entrenamiento es el dataset NL-2-SPARQL de 3DOnt, compuesto por las preguntas originales, nuevas estructuras lógicas generadas y alrededor de 10.000 preguntas escritas a mano. La tarea de entrenamiento es de parsing: dada una pregunta en lenguaje natural sobre una nube de puntos 3D y su ontología, el modelo debe emitir las cinco listas L1..L5 que la librería NL-2-SPARQL consume para construir la consulta SPARQL final.

El prompt de sistema usado en entrenamiento es fijo: `You will receive a natural language query by the user. you just have to parse it. do not say anything else.`, y se emplea la plantilla de chat del modelo base con el modo de razonamiento desactivado (`enable_thinking=False`). No se documentan en la información disponible detalles sobre el volumen total de tokens de entrenamiento, la composición exacta del dataset ni el uso de RLHF o DPO; el ajuste se presenta exclusivamente como supervisado mediante LoRA.

## Capacidades

- Parsing de lenguaje natural a representación lógica intermedia: transforma una pregunta sobre una nube de puntos 3D y su ontología en las listas L1..L5 esperadas por NL-2-SPARQL.
- Generación de estructuras lógicas consumibles por una librería determinista que produce la consulta SPARQL final.
- Salida restringida: el prompt de sistema instruye al modelo a no emitir nada más allá del parsing, lo que limita respuestas conversacionales.
- Modo de razonamiento desactivado: se usa la plantilla de chat del modelo base con `enable_thinking=False`.
- Especialización de dominio: orientado a ontologías y grafos de conocimiento de nubes de puntos 3D (3DGraphExplorer).
- Capacidades multilingües: no disponibles; el modelo declara únicamente inglés.
- Tool calling, function calling, agentes multi-paso, visión y audio: no disponibles en la información proporcionada.

## Casos de uso

- Consulta semántica sobre nubes de puntos 3D: un usuario formula una pregunta en inglés sobre los objetos y relaciones de una nube de puntos y el modelo la convierte en L1..L5, que NL-2-SPARQL traduce a SPARQL para recuperar resultados del grafo.
- Integración en 3DGraphExplorer: el modelo actúa como el componente de parsing del pipeline de la herramienta, permitiendo consultas en lenguaje natural sin que el usuario escriba SPARQL.
- Despliegue en Apple Silicon: la variante MLX 4 bits permite ejecutar el parser localmente en Macs para exploración interactiva de ontologías 3D.
- Demo web con WebGPU: la variante MLC q4f16_1 habilita una demo en navegador, útil para validar el parsing sin infraestructura de servidor.
- Prototipado de ontologías: investigadores pueden comprobar cómo distintas formulaciones de una pregunta se mapean a estructuras L1..L5 y ajustar la ontología o el dataset en consecuencia.
- Automatización de pipelines de datos 3D: el parser puede encadenarse con la librería NL-2-SPARQL para generar consultas de forma programática a partir de lotes de preguntas en lenguaje natural.
- Evaluación de modelos base para tareas de parsing estructurado: sirve como referencia de un ajuste LoRA ligero (rango 16, una época) sobre un modelo de 4B para una tarea de salida estructurada restringida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 4.659.865.088 parámetros, en FP16 se requieren aproximadamente 9,3 GB solo para pesos, y en 4 bits alrededor de 2,3-2,5 GB, sin contar overhead de activaciones y contexto.
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño, el modelo es compatible con GPUs de consumo de gama alta y con GPUs de datacenter, pero no se documentan recomendaciones concretas.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas con 8 GB o más en cuantización de 4 bits; no se confirma en la información disponible.
- Opciones de despliegue: Hugging Face transformers (formato principal), MLX 4 bits para Apple Silicon, MLC con WebGPU q4f16_1 para navegador. No se documenta soporte explícito de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| 3dont-nl2sparql-medium | 4,66B | No disponible | NL-2-SPARQL sobre ontologías 3D | Apache 2.0 | Hugging Face, MLX, MLC |
| Qwen/Qwen3.5-4B (base) | ~4B | No disponible | Propósito general | No disponible en la información | Hugging Face |
| Alternativas NL-2-SPARQL de otros tamaños | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks ni de otros modelos comparables de la misma tarea en la información proporcionada, por lo que la comparación se limita al modelo base y a la ausencia de alternativas documentadas.

## Limitaciones y advertencias

- Modelo altamente especializado: solo produce las listas L1..L5 para el pipeline NL-2-SPARQL de 3DGraphExplorer; no es adecuado para tareas generales de generación, código o razonamiento abierto.
- Idioma: únicamente inglés; no se garantiza comportamiento en castellano ni en otros idiomas.
- Dependencia del prompt de sistema: el entrenamiento usa un system prompt fijo y `enable_thinking=False`; desviarse de esa configuración puede degradar la calidad del parsing.
- Riesgo de alucinación estructural: al generar listas L1..L5, el modelo puede producir entradas incoherentes con la ontología, aunque la librería NL-2-SPARQL actúa como validador posterior.
- Datos de entrenamiento limitados: LoRA de rango 16 y una sola época sobre un dataset con aproximadamente 10.000 preguntas escritas a mano más datos generados; la cobertura de ontologías y formulaciones puede ser limitada.
- Sin benchmarks publicados: no hay evidencia cuantitativa de precisión en el parsing ni comparación con alternativas.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base Qwen/Qwen3.5-4B puede tener condiciones propias que conviene verificar antes de producción.
- Adopción mínima: 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria documentada.

## Enlaces

- Hugging Face: https://huggingface.co/MatteoCodiglione/3dont-nl2sparql-medium
- Variante MLX 4 bits: https://huggingface.co/MatteoCodiglione/3dont-nl2sparql-medium-mlx
- Variante MLC WebGPU q4f16_1: https://huggingface.co/MatteoCodiglione/3dont-nl2sparql-medium-MLC
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
