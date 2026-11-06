# Charlie320/zils-lite-xd1

## Resumen

zils-lite-xd1 es un modelo de decisión de 853 millones de parámetros publicado por el usuario Charlie320 en Hugging Face. Se trata de un fine-tune de Qwen/Qwen3.5-0.8B, un modelo base de la familia Qwen 3.5, adaptado a la tarea de emitir decisiones en formato de examen dentro del ecosistema Zils (Bittensor subnet 127). El modelo se distribuye como un "body" (cuerpo) para el pool de soups `d3-lite`, lo que indica que forma parte de una infraestructura de modelos especializados en la que distintos fine-tunes se combinan o seleccionan según la tarea.

La relevancia de este modelo es acotada y muy específica: no es un modelo de propósito general, sino un componente de un sistema de decisión orientado a evaluaciones tipo examen. Su tamaño reducido (menos de mil millones de parámetros) y su licencia Apache-2.0 lo hacen fácilmente desplegable, pero su utilidad fuera del ecosistema Zils es limitada. La model card es escueta y no proporciona información sobre benchmarks, idiomas soportados ni detalles completos de la arquitectura más allá de lo que se deduce del modelo base.

El modelo fue creado el 6 de noviembre de 2026 y no registra descargas ni likes en el momento de la consulta, lo que sugiere que se trata de una publicación reciente o de un experimento interno del ecosistema Zils. La información disponible es insuficiente para evaluar su calidad de forma independiente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.5-0.8B), con torre de visión heredada del modelo padre |
| Parámetros totales | 852.985.920 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos publicados en BF16 según la model card) |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B, un transformer de aproximadamente 0,8 mil millones de parámetros, y hereda la torre de visión del modelo padre, lo que sugiere que el modelo base es multimodal. Sobre ese punto de partida se aplicaron tres fine-tunes LoRA independientes de una época cada uno, con rango 32, alpha 64 y tasa de aprendizaje entre 1e-4 y 2e-4. Los adaptadores se fusionaron en los pesos y el cuerpo final es la media uniforme de los tres conjuntos de pesos fusionados, una técnica de model soup.

Los datos de entrenamiento consisten en entre 4.100 y 10.000 ítems en formato de examen, generados con la receta pública de autoría de Zils (`scripts/author_exam.py`) por Claude Opus y por un modelo abierto local, a partir únicamente de splits de entrenamiento públicos, más las respuestas del profesor de retransmisión (relay teacher) público de Zils. La función de pérdida combina entropía cruzada y pérdida de Brier, lo que es coherente con una tarea de decisión con salidas probabilísticas calibradas. No se utilizaron ítems de examen del validador ni ítems semilla públicos.

## Capacidades

- Emisión de decisiones en formato de examen: el modelo está especializado en responder ítems estructurados tipo examen, con salidas calibradas mediante pérdida de Brier.
- Razonamiento de decisión: orientado a seleccionar opciones o emitir juicios sobre preguntas de evaluación.
- Capacidades heredadas del modelo base Qwen/Qwen3.5-0.8B: generación de texto y, presumiblemente, capacidades multimodales por la torre de visión heredada, aunque la model card no detalla su funcionamiento tras el fine-tune.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades especiales (modo thinking, visión, audio): la torre de visión se hereda del modelo padre, pero no se especifica si se mantiene operativa ni cómo se entrena tras el fine-tune.

## Casos de uso

- Evaluación automatizada de exámenes tipo test: el modelo puede clasificar y decidir respuestas sobre ítems en formato examen, gracias a su entrenamiento específico con pérdida de Brier para calibrar probabilidades.
- Componente de un pool de modelos Zils: se integra como "body" en el pool `d3-lite` de la subnet 127 de Bittensor, donde distintos cuerpos compiten o se combinan para tareas de decisión.
- Generación de decisiones calibradas en pipelines de evaluación: su salida probabilística permite umbralizar decisiones con confianza medible, útil en sistemas de puntuación automática.
- Prototipado rápido en entornos con recursos limitados: con menos de 1.000 millones de parámetros y pesos en BF16 (1,7 GB de repositorio), cabe en GPU de consumo y permite iterar sin infraestructura dedicada.
- Investigación sobre model soups y fusión de LoRA: el modelo documenta una receta concreta (tres LoRA de rango 32 fusionados y promediados) que puede reproducirse o estudiarse como caso práctico.
- Filtrado o clasificación de ítems de examen en conjuntos de datos: puede usarse para predecir la respuesta esperada y detectar ítems anómalos o mal etiquetados en corpus de evaluación.
- Base para fine-tunes posteriores en dominios de decisión: al ser Apache-2.0 y de tamaño reducido, sirve como punto de partida para adaptaciones a otros formatos de examen o dominios específicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,7 GB en BF16 (tamaño del repositorio); en cuantización de 8 bits, alrededor de 0,9 GB; en 4 bits, alrededor de 0,5 GB (estimaciones a partir del número de parámetros, no confirmadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para BF16; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son sobradamente suficientes.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna con 4 GB o más de VRAM, e incluso en CPU con llama.cpp u Ollama.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI y transformers, siempre que se confirme compatibilidad con la arquitectura Qwen 3.5; la model card no especifica configuraciones probadas.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zils-lite-xd1 | 853 M | No disponible | Apache-2.0 | Hugging Face | Fine-tune de decisión para el ecosistema Zils |
| Qwen/Qwen3.5-0.8B | ~0,8 B | No disponible | No disponible en la información | Hugging Face | Modelo base del que deriva; propósito general y multimodal |
| vllm-sr/d3-lite | No disponible | No disponible | Apache-2.0 | Hugging Face | Cuerpo de partida del pool Zils; base del fine-tune |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Especialización estrecha: el modelo está entrenado exclusivamente para ítems en formato examen del ecosistema Zils; su rendimiento fuera de ese dominio no está documentado y probablemente sea deficiente.
- Sesgos conocidos: no disponibles en la información proporcionada; los datos de entrenamiento provienen de modelos generadores (Claude Opus y un modelo abierto local), lo que puede introducir sesgos de esos generadores.
- Riesgo de alucinación: no evaluado; al ser un modelo de decisión con salidas calibradas, el riesgo principal es una calibración incorrecta más que la generación libre de texto.
- Limitaciones de contexto e idioma: no se especifican la longitud de contexto ni los idiomas soportados; la model card no los detalla.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero la model card advierte de que los términos de los conjuntos de datos de origen deben verificarse antes de reutilizar el modelo.
- Caveat para producción: el modelo no registra descargas ni validación externa; no hay benchmarks publicados ni evaluación independiente, por lo que no se recomienda su uso en producción sin una evaluación propia.
- Dependencia del ecosistema Zils: su valor está ligado al pool `d3-lite` de la subnet 127 de Bittensor; fuera de ese contexto, su utilidad es marginal.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Charlie320/zils-lite-xd1
- Perfil del autor en Hugging Face: https://huggingface.co/Charlie320
- Organización Zils en Hugging Face: https://huggingface.co/zils-ai
- Modelo base Qwen/Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Cuerpo de partida vllm-sr/d3-lite: https://huggingface.co/vllm-sr/d3-lite
