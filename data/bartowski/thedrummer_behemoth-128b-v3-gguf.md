# bartowski/TheDrummer_Behemoth-128B-v3-GGUF

## Resumen

Behemoth-128B-v3 es un modelo de lenguaje de 125 000 millones de parámetros desarrollado por TheDrummer (BeaverAI), especializado en generación de texto creativo, roleplay y prosa literaria. Esta ficha corresponde a la versión cuantizada en formato GGUF preparada por bartowski, que permite ejecutar el modelo en entornos locales con llama.cpp y herramientas compatibles. El modelo destaca por su creatividad, variedad en la escritura y una personalidad menos encorsetada que otros modelos de su tamaño, según las descripciones de los testers.

La relevancia de esta versión radica en que ofrece múltiples niveles de cuantización (desde BF16 hasta IQ3_XXS) para adaptarse a diferentes capacidades de hardware, manteniendo la licencia Apache 2.0 que permite uso comercial sin restricciones. Aunque no se especifican detalles de arquitectura ni contexto en la documentación disponible, el formato de prompt incluye un campo `MODEL_SETTINGS` con `reasoning_effort`, lo que sugiere un control sobre el nivel de razonamiento del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 125 025 988 608 (125B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16, Q8_0, Q6_K, Q5_K_L, Q5_K_M, Q5_K_S, Q4_1, Q4_K_L, Q4_K_M, Q4_K_S, IQ4_NL, Q4_0, IQ4_XS, Q3_K_XL, Q3_K_L, Q3_K_M, IQ3_M, Q3_K_S, IQ3_XS, IQ3_XXS |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo (número de capas, atención, etc.) en la documentación proporcionada. Tampoco se especifican los datos de entrenamiento, el número de tokens procesados ni el método de alineación (RLHF, DPO, etc.). Lo que sí se sabe es que el modelo base fue creado por TheDrummer/BeaverAI y que esta versión GGUF fue cuantizada con llama.cpp release b10472 utilizando la técnica imatrix, que optimiza la cuantización basándose en la importancia de los pesos. El prompt format incluye un bloque `MODEL_SETTINGS` con `reasoning_effort`, lo que sugiere que el modelo puede ajustar su nivel de razonamiento, aunque no se confirma si esto es una característica nativa o una convención del prompt.

## Capacidades

- Generación de texto creativo: prosa literaria, narrativa, diálogos y descripciones con alta variedad y riqueza expresiva.
- Roleplay y personajes: manejo de contextos de rol con personalidades definidas y respuestas inmersivas.
- Creatividad y originalidad: los testers reportan mejor creatividad y variedad en comparación con versiones anteriores.
- Prosa mejorada: estilo de escritura más pulido y natural.
- Tono menos positivo y más "desinhibido" (unhinged): el modelo no se limita a respuestas políticamente correctas, lo que puede ser útil para ficción adulta o humor negro.
- Buena inteligencia y agudeza en matices: capacidad de captar sutilezas y recordar detalles del contexto.
- Control de razonamiento: el formato de prompt permite ajustar el nivel de esfuerzo de razonamiento mediante `reasoning_effort`, aunque no se documenta su efecto real.

No se confirma soporte para tool calling, function calling, agentes, visión o audio. El modelo es exclusivamente de texto.

## Casos de uso

- Escritura creativa asistida: un autor puede usar el modelo para generar borradores de capítulos, descripciones de escenarios o diálogos entre personajes, aprovechando su prosa mejorada y variedad estilística.
- Roleplay en juegos de texto: el modelo puede actuar como narrador o como personaje no jugador en aventuras de texto, manteniendo coherencia gracias a su capacidad de recordar matices del contexto.
- Generación de contenido para ficción interactiva: adecuado para crear historias ramificadas donde el usuario elige opciones y el modelo desarrolla consecuencias narrativas.
- Lluvia de ideas y brainstorming: puede generar ideas originales para tramas, nombres, conceptos o giros argumentales, útil para escritores y guionistas.
- Diálogos para videojuegos: desarrollo de líneas de diálogo para personajes secundarios o misiones, con un tono menos encorsetado que otros modelos.
- Experimentación con IA generativa: investigadores y desarrolladores pueden estudiar el comportamiento de un modelo de 125B en tareas de creatividad y comparar con otras arquitecturas, gracias a la licencia Apache 2.0 que permite uso comercial y modificación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas como MMLU, HumanEval, GSM8K ni comparaciones con otros modelos. Tampoco se han medido perplexity ni KLD según la propia descripción.

## Requisitos de hardware

- VRAM estimada: para la cuantización Q4_K_M (78.41 GB) se necesitan al menos 80 GB de VRAM libre, lo que implica configuraciones multi-GPU (por ejemplo, 2× A100 40GB o 2× H100 80GB). Para Q6_K (107.80 GB) se requieren 110+ GB de VRAM.
- GPU recomendadas: A100 40GB/80GB, H100 80GB, o múltiples RTX 4090 (24GB cada una) en configuración NVLink o con soporte de memoria unificada. No cabe en una sola GPU de consumo.
- Opciones de despliegue: llama.cpp (soporta GGUF nativamente), Ollama (puede cargar GGUF), LM Studio, text-generation-webui. vLLM no soporta GGUF directamente, pero se puede usar el modelo base en safetensors con vLLM.
- Latencia y throughput: no se han publicado mediciones. Para un modelo de 125B en cuantización Q4_K_M, se estima una velocidad de generación de 5-15 tokens/s en una A100 80GB, dependiendo de la implementación y el batch size.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar con otros modelos. Sin embargo, la serie Behemoth tiene versiones anteriores (123B v1, v1.1, v1.2) que comparten características similares de creatividad y estilo. A continuación se muestra una comparación cualitativa basada en la información disponible:

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Behemoth-128B-v3 (este) | 125B | no disponible | Apache 2.0 | Creatividad, roleplay |
| Behemoth-123B-v1.2 | 123B | no disponible | no disponible | Creatividad, roleplay |
| Behemoth-123B-v1 | 123B | no disponible | no disponible | Creatividad, roleplay |

No se incluyen modelos de otros desarrolladores por falta de datos comparativos en la información proporcionada.

## Limitaciones y advertencias

- No se dispone de información sobre sesgos del modelo ni evaluación de seguridad. Al ser un modelo entrenado para creatividad y con un tono "desinhibido", puede generar contenido ofensivo, inapropiado o no apto para todos los públicos.
- Riesgo de alucinación: como todo LLM, puede inventar hechos o detalles sin base real, especialmente en tareas de conocimiento factual.
- Longitud de contexto desconocida: no se especifica el tamaño de la ventana de contexto, lo que dificulta planificar tareas que requieran entradas largas.
- Idiomas soportados: no se indica qué idiomas maneja, aunque probablemente esté entrenado principalmente en inglés dado el origen del modelo.
- Requisitos de hardware elevados: incluso la cuantización más pequeña (IQ3_XXS, ~55 GB) requiere una GPU de alta gama o múltiples GPUs, lo que limita su uso en entornos domésticos.
- La cuantización puede degradar la calidad: los niveles más bajos (Q3, IQ3) pueden afectar la coherencia y creatividad del modelo, aunque no hay mediciones objetivas.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base puede tener restricciones adicionales no documentadas en esta ficha.

## Enlaces

- Modelo GGUF: https://huggingface.co/bartowski/TheDrummer_Behemoth-128B-v3-GGUF
- Modelo base: https://huggingface.co/TheDrummer/Behemoth-128B-v3
- Versiones anteriores: https://huggingface.co/TheDrummer/Behemoth-123B-v1-GGUF, https://huggingface.co/TheDrummer/Behemoth-123B-v1.2
- Herramienta de cuantización: https://github.com/ggml-org/llama.cpp/releases/tag/b10472
