# simpissa/qwen3-4b-leetcode-medhard-baseline

## Resumen

Este modelo es un adaptador LoRA (PEFT) desarrollado por simpissa sobre el modelo base Qwen/Qwen3-4B. Se trata de un ajuste fino mediante reinforcement learning (GRPO) durante 100 pasos, orientado a mejorar la resolución de problemas de programación de dificultad media y alta (LeetCode). El adaptador fue entrenado con recompensas basadas en la correctitud de tests ocultos y la configuración de hint `simple_overwrite_tests`.

El repositorio contiene únicamente los pesos del adaptador (0.3 GB), no los pesos completos del modelo base. Para su uso es necesario cargar el adaptador con la librería PEFT sobre Qwen3-4B. La relevancia de este modelo radica en servir como baseline reproducible de un experimento de RL aplicado a código dentro de la familia Qwen3. No se proporcionan especificaciones completas del modelo base en la ficha, aunque la arquitectura subyacente corresponde a la familia Qwen3.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3; el adaptador no especifica la subarquitectura) |
| Parametros totales | 4B (modelo base Qwen3-4B); adaptador LoRA con pesos de 0.3 GB |
| Parametros activos | No disponible (no se indica si el modelo base es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (adaptador en safetensors; cuantización del modelo base no especificada) |
| Idiomas soportados | No disponibles en la ficha; el modelo base Qwen3 es multilingüe según su documentación |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre Qwen/Qwen3-4B y se carga mediante PEFT. Según la model card, el entrenamiento se realizó con un run de GRPO de 100 pasos, utilizando un entorno filtrado de LeetCode de nivel medio y difícil. La función de recompensa se basa en la correctitud de tests ocultos, y se usó la configuración de hint `simple_overwrite_tests`.

El adaptador utiliza rank 32 y se aplica a las capas de proyección de atención y MLP del modelo base. No se detallan más innovaciones técnicas ni la composición del dataset de entrenamiento. El tokenizer incluido en el repositorio no ha sido modificado respecto al modelo base.

## Capacidades

- Generación de código orientada a problemas de tipo LeetCode (nivel medio y difícil), con evaluación mediante tests ocultos.
- Razonamiento de programación: el entrenamiento con GRPO busca optimizar la correctitud de las soluciones generadas.
- Soporte para investigación en RL: permite reproducir un baseline de reinforcement learning sobre un modelo de 4B en un entorno de código.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: no especificadas; se heredan del modelo base Qwen3.
- Modo thinking / non-thinking: no especificado en la ficha del adaptador.

## Casos de uso

- Evaluación de soluciones en entrevistas técnicas: el modelo puede generar soluciones a problemas de LeetCode medium/hard; se usaría como asistente para producir código de referencia y compararlo con las soluciones de candidatos.
- Benchmarking de agentes de código: al estar entrenado con tests ocultos, puede integrarse en pipelines de evaluación para medir el rendimiento de agentes que resuelven katas de programación.
- Investigación en RL aplicada a código: sirve como baseline reproducible para experimentos de GRPO, permitiendo comparar con otras configuraciones de recompensa o hints.
- Asistente de estudio para programación competitiva: estudiantes de preparación de concursos podrían usarlo para generar explicaciones y soluciones paso a paso en problemas de dificultad media y alta.
- Generación de código en entornos controlados: se puede cargar con PEFT para generar parches de código en un entorno de CI/CD que valide con tests unitarios, siempre que se supervise la salida.
- Análisis de estrategias de RL: investigadores pueden analizar cómo la configuración `simple_overwrite_tests` afecta a la correctitud, usando el adaptador como punto de partida para experimentos de ablación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni de otros conjuntos de evaluación para este adaptador.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Qwen3-4B en FP16/BF16 requiere aproximadamente 8 GB de VRAM; con cuantización 4-bit (por ejemplo, GGUF Q4_K_M) se reduce a unos 2-3 GB. El adaptador LoRA añade alrededor de 0.3 GB de pesos.
- GPU recomendadas: una RTX 4090 (24 GB) o una A100/H100 permiten ejecutar el modelo sin cuantizar; una RTX 3060 12 GB o superior puede ejecutar el modelo base en FP16 con margen.
- Compatibilidad con GPUs de consumo: sí, con al menos 8-12 GB de VRAM en FP16, o menos si se aplica cuantización.
- Opciones de despliegue: Transformers + PEFT (necesario para cargar el adaptador); vLLM o TGI requieren fusionar el adaptador en el modelo base antes de servir; llama.cpp u Ollama requieren exportar el modelo fusionado a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han encontrado comparativas específicas para este adaptador en la información proporcionada. El modelo base es Qwen/Qwen3-4B, de la familia Qwen3, pero no se ofrecen resultados de otros adaptadores similares.

## Limitaciones y advertencias

- El adaptador se entrenó durante solo 100 pasos de GRPO; el rendimiento es probablemente limitado y debe interpretarse como un baseline, no como un modelo de producción.
- La licencia no está especificada; el uso comercial requiere verificar la licencia del modelo base Qwen3 y la del adaptador.
- No se proporcionan evaluaciones de sesgos ni de alucinaciones. Como modelo de código, puede generar soluciones incorrectas, ineficientes o con errores de compilación.
- El entrenamiento se centra en LeetCode medium/hard; la capacidad de razonamiento general o el dominio de otros lenguajes de programación no está validada.
- No se indican idiomas; la interfaz de LeetCode suele estar en inglés, por lo que la capacidad multilingüe puede verse reducida.
- Al ser un adaptador, depende de la disponibilidad del modelo base y de la librería PEFT para funcionar correctamente.

## Enlaces

- HuggingFace: https://huggingface.co/simpissa/qwen3-4b-leetcode-medhard-baseline
- Repo de Qwen3: https://github.com/QwenLM/Qwen3
- Technical report de Qwen3: https://arxiv.org/html/2505.09388v1
