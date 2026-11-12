# SolsticeAI/Arete-27B-Unlocked-Uncensored-Heretic-mlx-8Bit

## Resumen

Arete-27B-Unlocked-Uncensored-Heretic-mlx-8Bit es una cuantización en 8 bits en formato MLX del modelo SolsticeAI/Arete-27B-Unlocked-Uncensored-Heretic, un ajuste fino supervisado (SFT) derivado de la familia Qwen3.5 y entrenado sobre el dataset NousResearch/arete-data-pairs con técnicas de alineación de valores. El autor, SolsticeAI, lo distribuye bajo licencia Apache 2.0 y lo orienta a generación de texto y conversación. La conversión a MLX se realizó con mlx-lm 0.31.2, lo que lo hace ejecutable de forma nativa en hardware Apple Silicon.

El modelo cuenta con 26.895.993.856 parámetros (aproximadamente 26,9 mil millones) según los pesos en safetensors, y el repositorio ocupa 28,6 GB. Incorpora las etiquetas heretic, uncensored, decensored y abliterated, que indican que se ha aplicado una reducción deliberada de los mecanismos de rechazo del modelo base. Esta ficha describe únicamente lo que la model card y los metadatos permiten verificar; los datos no publicados se marcan como no disponibles.

La relevancia de esta versión radica en su formato: al ser una cuantización MLX de 8 bits, permite desplegar un modelo de casi 27B en equipos con memoria unificada de Apple, un escenario donde las alternativas GGUF o safetensors en FP16 resultan menos eficientes. No obstante, la ausencia de benchmarks, de detalle sobre el dataset y de información sobre el contexto máximo limita seriamente su evaluación previa a producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, según tag `qwen3_5`); detalles no disponibles |
| Parámetros totales | 26.895.993.856 (~26,9B) |
| Parámetros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | 8 bits (MLX); otras cuantizaciones no disponibles |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (safetensors), librería `mlx` |

## Arquitectura y entrenamiento

La información disponible indica que el modelo pertenece a la familia Qwen3.5 (tag `qwen3_5`) y que es un ajuste fino supervisado sobre el dataset NousResearch/arete-data-pairs, orientado a alineación de valores (`value-alignment`). Las etiquetas `heretic`, `uncensored`, `decensored` y `abliterated` sugieren la aplicación de técnicas de abliteración o edición de direcciones de rechazo para reducir las negativas del modelo base. No se especifica el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO adicionales.

La versión descrita es una conversión a MLX realizada con mlx-lm 0.31.2 a partir de SolsticeAI/Arete-27B-Unlocked-Uncensored-Heretic. No se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.) ni detalles sobre la arquitectura interna más allá de la referencia a Qwen3.5.

## Capacidades

- Generación de texto y conversación multi-turno (pipeline `text-generation`, tag `conversational`).
- Ajuste fino supervisado con alineación de valores según el dataset de NousResearch.
- Reducción de rechazos mediante técnicas de abliteración/decensurado (según etiquetas del autor).
- Ejecución nativa en Apple Silicon mediante MLX y `mlx-lm`.
- Soporte de plantilla de chat (`apply_chat_template`) según el ejemplo de la model card.
- Tool calling, function calling, agentes, razonamiento multi-paso, visión, audio y modo thinking: no disponibles en la información proporcionada.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Experimentación local en Mac: cargar el modelo con `mlx-lm` en un equipo Apple Silicon con memoria unificada suficiente para un modelo de ~27B en 8 bits, sin necesidad de GPU dedicada.
- Investigación sobre alineación y abliteración: comparar el comportamiento del modelo heretic frente a su base para estudiar cómo cambian las respuestas ante prompts sensibles.
- Generación de texto creativo sin restricciones temáticas: útil en entornos de escritura donde se busca explorar contenido que el modelo base rechazaría, siempre con revisión humana.
- Prototipado de asistentes conversacionales: el formato chat y la integración con `mlx-lm` permiten iterar rápidamente en aplicaciones de conversación.
- Evaluación de cuantizaciones: servir como referencia para medir la degradación de calidad de la versión 8-bit MLX frente al modelo original.
- Docencia y demos: desplegar un modelo de gran tamaño en portátiles Apple para talleres sobre inferencia local y formatos MLX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: el repositorio ocupa 28,6 GB en 8 bits; se recomienda al menos ~32 GB de memoria unificada para cargar los pesos con margen para el contexto y el tokenizador.
- GPU recomendadas: no se especifican; el formato MLX está pensado para Apple Silicon (series M1/M2/M3/M4 con memoria unificada amplia).
- GPU consumer: no aplicable de forma nativa; en NVIDIA requeriría conversión a otro formato (GGUF, safetensors) no incluida en este repositorio.
- Opciones de despliegue: `mlx-lm` (versión 0.31.2 o superior según la model card). vLLM, llama.cpp, Ollama y TGI no se mencionan para este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Arete-27B-Unlocked-Uncensored-Heretic-mlx-8Bit | ~26,9B | No disponible | MLX 8-bit | Apache 2.0 | Cuantización MLX; sin benchmarks publicados |
| SolsticeAI/Arete-27B-Unlocked-Uncensored-Heretic | ~26,9B (presumible) | No disponible | Safetensors (presumible) | Apache 2.0 | Modelo base del que deriva esta versión |
| Alternativas de ~27B de la familia Qwen | No disponible | No disponible | No disponible | No disponible | No se dispone de datos verificables en la información proporcionada |

No se dispone de datos suficientes para una comparativa cuantitativa con modelos de la misma categoría.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de rendimiento en MMLU, HumanEval, GSM8K ni otras tareas.
- Modelo decensurado/abliterado: la reducción de rechazos implica mayor probabilidad de generar contenido sensible, ofensivo o inseguro; requiere filtrado y supervisión en producción.
- Riesgo de alucinación: no cuantificado por el autor; aplicable el riesgo habitual de los modelos de lenguaje.
- Idiomas y contexto: no documentados, lo que impide garantizar cobertura multilingüe ni ventanas largas.
- Licencia Apache 2.0: permite uso comercial, pero el usuario asume la responsabilidad sobre el contenido generado y sobre el cumplimiento normativo aplicable.
- Formato MLX: limita el despliegue a ecosistema Apple; no es directamente portable a GPUs NVIDIA sin conversión.
- Repositorio sin descargas ni likes en el momento de la consulta: ecosistema de validación prácticamente inexistente.
- El dataset de entrenamiento (NousResearch/arete-data-pairs) no está descrito en detalle en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SolsticeAI/Arete-27B-Unlocked-Uncensored-Heretic-mlx-8Bit
- Modelo base: https://huggingface.co/SolsticeAI/Arete-27B-Unlocked-Uncensored-Heretic
- Dataset de entrenamiento: https://huggingface.co/datasets/NousResearch/arete-data-pairs
- Librería mlx-lm: https://github.com/ml-explore/mlx-lm
