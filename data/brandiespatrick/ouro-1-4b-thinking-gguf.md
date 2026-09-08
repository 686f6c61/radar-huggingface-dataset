# BrandiesPatrick/Ouro-1.4B-Thinking-GGUF

## Resumen

Ouro-1.4B-Thinking-GGUF es la conversión a formato GGUF de `ByteDance/Ouro-1.4B-Thinking`, el miembro orientado a razonamiento de la familia Ouro de modelos de lenguaje recurrentes ("looped language models"). El modelo está desarrollado por ByteDance Seed y la conversión la ha publicado BrandiesPatrick. Su innovación principal es que la pila decodificadora de 24 capas físicas se aplica 4 veces por token con pesos compartidos, lo que produce una profundidad efectiva de 96 capas con solo 1.434.650.624 parámetros. Esta arquitectura, descrita en el artículo arXiv:2510.25741, permite escalar la profundidad de razonamiento sin aumentar el número de parámetros.

Este conjunto de pesos en GGUF es la primera implementación de la arquitectura `ouro` en llama.cpp. El autor ha escrito el soporte de arquitectura para that runtime, de modo que estos archivos funcionan con un build parcheado de llama.cpp, pero no todavía con las versiones estándar de Ollama o LM Studio. El número de loops es ajustable en tiempo de ejecución, lo que permite controlar el equilibrio entre velocidad y calidad de razonamiento desde un único archivo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder con pesos compartidos (looped language model). 24 capas físicas × 4 loops = 96 capas efectivas |
| Parametros totales | 1.434.650.624 (≈1,43B) |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF: F16, Q8_0, Q4_K_M |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (convertido de los safetensors del modelo base) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura "looped" o de profundidad recurrente: el mismo bloque decodificador de 24 capas se ejecuta varias veces por token, compartiendo los mismos pesos. En su configuración entrenada, se aplica 4 veces, resultando en 96 capas efectivas de cómputo con solo 1,43B de parámetros almacenados. Este enfoque se describe en el artículo "Scaling Latent Reasoning via Looped Language Models" y su principal atractivo es que permite aumentar la profundidad efectiva sin incrementar el número de parámetros.

En esta conversión GGUF, el número de loops es un parámetro ajustable en runtime mediante la clave `ouro.num_loops`. El modelo fue entrenado con 4 loops; el paper indica que la calidad alcanza su máximo en o cerca de la profundidad de entrenamiento y puede degradarse más allá. Se ha incluido un "early-exit gate" en el modelo base, pero el autor de esta conversión ha optado por no convertirlo, ya que con el umbral por defecto (`early_exit_threshold = 1.0`) no se activa.

No se proporcionan datos sobre la composición del dataset, el número de tokens de entrenamiento ni el uso de RLHF o DPO. El modelo base es ByteDance/Ouro-1.4B-Thinking, un modelo de razonamiento (thinking) de la familia Ouro.

## Capacidades

- Razonamiento matemático avanzado: el modelo está orientado a resolver problemas de competición matemática. El autor cita benchmarks como AIME24/25, OlympiadBench y BeyondAIME, aunque esos resultados no son reproducibles de forma independiente.
- Generación de texto conversacional: soporta tareas de text-generation y mantiene capacidad de diálogo multi-turno.
- Profundidad ajustable en runtime: `ouro.num_loops` permite fijar el número de iteraciones (48 o 96 capas) para modular el equilibrio entre latencia y calidad de razonamiento.
- Compatibilidad con GGUF y llama.cpp: puede ejecutarse en local con el runtime de llama.cpp parcheado, sin necesidad de GPU dedicada (según cuantización).
- No se mencionan capacidades específicas de tool calling, función de agentes, visión ni audio en la información proporcionada.

## Casos de uso

- Razonamiento matemático en plataformas educativas: el modelo puede resolver problemas de nivel olímpico con una ventana de contexto no especificada, y su tamaño reducido permite desplegarlo en servicios con recursos limitados.
- Investigación en arquitecturas recurrentes: gracias a su capacidad de ajustar los loops en runtime, es útil para estudiar cómo varía la calidad de razonamiento con la profundidad en un modelo de parámetros fijos.
- Asistentes conversacionales en entornos sin GPU: con la cuantización Q4_K_M (0.90 GB), puede ejecutarse en CPU o en tarjetas gráficas modestas, lo que lo hace adecuado para aplicaciones de borde.
- Prototipado de agentes de razonamiento: su modo "thinking" y su arquitectura de profundidad efectiva alta permiten construir agentes que encadenen pasos de razonamiento sin incurrir en el coste de un modelo de gran tamaño.
- Análisis de datos y resolución de problemas en producción: el tamaño de 1,43B de parámetros es compatible con pipelines de inferencia en tiempo real en servicios que requieren baja latencia y no pueden permitirse modelos de decenas de miles de millones de parámetros.
- Evaluación de cuantizaciones y robustez: la existencia de versiones F16, Q8_0 y Q4_K_M facilita la comprobación del impacto de la compresión numérica en arquitecturas con pesos compartidos.

## Benchmarks y rendimiento

Los únicos datos verificados que se han publicado corresponden al modelo base no-thinking Ouro-1.4B, en un puerto GGUF anterior. La siguiente tabla muestra la precisión en GSM8K para distintos números de loops, comparando el port GGUF con la referencia de transformers:

| Modelo | Loops | GSM8K (%) |
|---|---|---|
| Ouro-1.4B (referencia) | 1 | 23.0 |
| Ouro-1.4B (port GGUF) | 1 | 26.0 |
| Ouro-1.4B (referencia) | 2 | 64.0 |
| Ouro-1.4B (port GGUF) | 2 | 67.0 |
| Ouro-1.4B (referencia) | 4 | 80.0 |
| Ouro-1.4B (port GGUF) | 4 | 80.5 |

Cada punto de diferencia está dentro de un error estándar. Los benchmarks publicados para Ouro-1.4B-Thinking (AIME24/25, OlympiadBench, BeyondAIME) se han obtenido con un rubric de LLM-as-judge no publicado, por lo que no pueden reproducirse de forma independiente y no se puede atribuir una cifra de precisión concreta a esta variante.

## Requisitos de hardware

- Tamaño de archivos GGUF: F16 = 2.87 GB, Q8_0 = 1.53 GB, Q4_K_M = 0.90 GB.
- VRAM estimada para inferencia (contexto corto): Q4_K_M ≈ 1.5-2.0 GB, Q8_0 ≈ 2.5-3.0 GB, F16 ≈ 4.0-5.0 GB.
- GPU recomendadas: tarjetas consumer como RTX 3060 12GB o superiores; para la cuantización Q4_K_M incluso una RTX 2060 con 6GB sería suficiente. También puede ejecutarse en CPU.
- Opciones de despliegue: llama.cpp con el parche de arquitectura `ouro` disponible en el repositorio `loop-transformer`. Todavía no puede ejecutarse con llama.cpp estándar, Ollama ni LM Studio hasta que el parche se fusione en upstream.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos comparativos directos con otros modelos de la misma categoría. La arquitectura de profundidad recurrente es poco habitual y no se han publicado benchmarks independientes que permitan comparar su rendimiento con otros modelos de tamaño similar en condiciones equivalentes. Por tanto, no se puede ofrecer una comparativa fiable en esta ficha.

## Limitaciones y advertencias

- Requiere un llama.cpp parcheado para funcionar. La arquitectura `ouro` no está todavía integrada en upstream, por lo que el uso con versiones estándar de llama.cpp, Ollama o LM Studio es imposible en el momento de escribir esta ficha.
- Los benchmarks publicados del modelo Thinking no son reproducibles, ya que se evaluaron con un rubric de LLM-as-judge no publicado. No se puede confirmar de forma independiente su rendimiento en matemáticas de competición.
- El número de loops es crítico: con un solo loop, la precisión en GSM8K del modelo base cae a aproximadamente el 26%. Cualquier resultado debe ir acompañado de la profundidad efectiva utilizada.
- El early-exit gate del modelo base no se ha convertido, lo que podría afectar al comportamiento exacto en los casos en los que el umbral original variara durante el entrenamiento.
- No se ha proporcionado información sobre sesgos, idiomas soportados ni limitaciones de contexto. Es necesario asumir un riesgo de alucinación propio de los modelos de lenguaje.
- La licencia Apache-2.0 permite uso comercial, pero es responsabilidad del usuario verificar las licencias del modelo base y del runtime utilizado.

## Enlaces

- Ficha y archivos en HuggingFace: https://huggingface.co/BrandiesPatrick/Ouro-1.4B-Thinking-GGUF
- Modelo base en HuggingFace: https://huggingface.co/ByteDance/Ouro-1.4B-Thinking
- Conversión GGUF del modelo base no-thinking: https://huggingface.co/BrandiesPatrick/Ouro-1.4B-GGUF
- Repositorio con el parche y el evaluador: https://github.com/BrandeisPatrick/loop-transformer
- Artículo técnico en arXiv: https://arxiv.org/abs/2510.25741
- Nota: los resultados de la búsqueda web solo devolvieron enlaces no relevantes (Outlook), por lo que no se incluyen.
