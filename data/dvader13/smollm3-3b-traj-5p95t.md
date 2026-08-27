# dvader13/smollm3-3b-traj-5p95t

## Resumen

El modelo `dvader13/smollm3-3b-traj-5p95t` es un conjunto de 31 checkpoints intermedios de entrenamiento por refuerzo (RL) correspondientes a la primera época del proceso de ajuste del modelo base SmolLM3-3B, desarrollado por Hugging Face. Estos checkpoints representan la trayectoria de entrenamiento y están pensados para investigación y análisis, no para uso en producción. El modelo base SmolLM3-3B es un transformer decoder compacto de 3 mil millones de parámetros, entrenado sobre 11 billones de tokens (según la documentación oficial), con soporte de contexto de hasta 128K tokens y capacidades multilingües centradas en seis idiomas de la Unión Europea.

Este repositorio específico no contiene el modelo final, sino una secuencia de pasos intermedios que permiten estudiar la evolución del modelo durante el RL. La licencia Apache-2.0 facilita su uso académico y de investigación, aunque su tamaño de repositorio es de 0 GB, lo que sugiere que los pesos aún no se han subido o que la información es incompleta. Para entender el rendimiento real del modelo, es necesario referirse al SmolLM3-3B final, que ha demostrado ser competitivo con alternativas de 3B y 4B en benchmarks públicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder con Grouped Query Attention (GQA) y sin RoPE |
| Parametros totales | 3 mil millones (aprox.) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 128K tokens (según documentación del modelo base) |
| Tipos de cuantizacion | no disponible (checkpoints en bf16, solo inferencia) |
| Idiomas soportados | seis idiomas de la UE (según documentación del modelo base) |
| Licencia | Apache-2.0 |
| Formato de pesos | bf16 (checkpoints intermedios) |

## Arquitectura y entrenamiento

El modelo base SmolLM3-3B utiliza una arquitectura de transformer decoder con Grouped Query Attention (GQA) para reducir el tamaño de la caché KV y sin RoPE (Rotary Positional Embeddings), lo que mejora el rendimiento en tareas de contexto largo. El entrenamiento del base se realizó sobre un conjunto de datos públicos que incluye documentos web, artículos científicos y código, con un total de 11 billones de tokens. El ajuste por RL se llevó a cabo en varias etapas, y este repositorio contiene los checkpoints intermedios de la primera época de esa etapa de RL, con un espaciado de pasos que se amplía progresivamente (20 pasos hasta el paso 200, luego 40, 80 y 120).

No se han publicado detalles específicos sobre el algoritmo de RL empleado (p. ej., PPO, GRPO, etc.) en la información disponible. El autor indica que los checkpoints son solo para inferencia y que no se deben usar para entrenamiento posterior. La ausencia de RoPE es una innovación técnica destacable, ya que simplifica la implementación y puede favorecer la extrapolación a secuencias más largas, aunque no se aportan más datos en este repositorio.

## Capacidades

- Generación de texto en múltiples idiomas (seis idiomas de la UE, según el modelo base).
- Razonamiento y comprensión de contexto largo gracias a los 128K tokens de ventana.
- Soporte de code generation y matemáticas básicas, basado en el entrenamiento con código y datos científicos.
- Capacidades de tool calling y function calling en el modelo base (no confirmado para estos checkpoints intermedios).
- Modo de razonamiento dual (thinking mode) presente en el modelo base, pero no garantizado en los checkpoints intermedios.
- No se especifican capacidades de visión o audio en la información disponible.

## Casos de uso

- **Investigación en interpretabilidad de modelos**: los checkpoints permiten analizar cómo evoluciona el comportamiento del modelo durante el RL, por ejemplo, estudiando la aparición de habilidades específicas o la degradación de otras. Se pueden cargar los pesos en bf16 y ejecutar inferencias paso a paso.
- **Análisis de la dinámica de entrenamiento**: los 31 checkpoints sirven para trazar curvas de pérdida, medir la estabilidad del entrenamiento y evaluar la convergencia de la primera época.
- **Fine-tuning selectivo**: aunque el autor indica que son solo para inferencia, un investigador podría usar los checkpoints como punto de partida para continuar el entrenamiento en tareas específicas, siempre bajo su responsabilidad.
- **Comparación de estrategias de RL**: al tener varios puntos temporales, se puede comparar el rendimiento en benchmarks específicos en cada etapa y determinar la mejor ventana de entrenamiento.
- **Depuración de pipelines de RL**: si se está desarrollando un sistema de RL propio, estos checkpoints pueden servir como referencia para validar la implementación de etapas intermedias.
- **Documentación y reproducción de experimentos**: para equipos que quieren reproducir o ampliar los resultados del SmolLM3, estos checkpoints ofrecen un registro de la trayectoria de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para este repositorio específico de checkpoints intermedios. La información disponible solo menciona que el modelo base SmolLM3-3B supera a Llama 3.2 3B y Qwen2.5 3B en varios benchmarks y es competitivo con modelos de 4B como Qwen3 y Gemma3. Sin embargo, no hay datos numéricos concretos en la documentación proporcionada. Para evaluar el rendimiento de estos checkpoints, sería necesario ejecutar pruebas propias.

## Requisitos de hardware

- VRAM estimada: para un modelo de 3B en bf16, se requieren aproximadamente 6-8 GB de VRAM para inferencia (dependiendo de la longitud de contexto).
- GPU recomendadas: una RTX 3090/4090 (24 GB) es suficiente para inferencia con contexto largo; para producción con alto throughput, se recomienda A100 o H100.
- En consumer GPU: sí, cabe en GPUs de 12-24 GB, aunque con contexto de 128K puede ser necesario cuantizar o reducir el batch.
- Opciones de despliegue: al ser checkpoints en bf16, se pueden cargar con Transformers, vLLM, llama.cpp (si se convierten a GGUF), o Ollama. No se especifica compatibilidad con TGI.
- Latencia y throughput: no disponible para estos checkpoints específicos.

## Comparativa con modelos similares

Dado que estos son checkpoints intermedios y no un modelo final, la comparativa se realiza contra el modelo base y otras alternativas de 3B:

| Modelo | Parámetros | Contexto | Rendimiento (referencia) | Licencia |
|---|---|---|---|---|
| SmolLM3-3B (base) | 3B | 128K | Supera a Llama 3.2 3B y Qwen2.5 3B | Apache-2.0 |
| Llama 3.2 3B | 3B | 128K | Inferior a SmolLM3 en varios benchmarks | Llama 3.2 Community License |
| Qwen2.5 3B | 3B | 32K | Competitivo pero menor en contexto | Apache-2.0 |
| Gemma 3 4B | 4B | 32K | Competitivo con SmolLM3-3B | Gemma License |

No se dispone de comparativa con otros checkpoints intermedios de RL de modelos similares.

## Limitaciones y advertencias

- Los checkpoints son **intermedios** y no representan el modelo final ajustado; pueden mostrar comportamientos erráticos o de menor calidad.
- El autor indica que son "solo inferencia", por lo que no se garantiza su estabilidad o rendimiento en tareas complejas.
- No hay información sobre sesgos o alucinaciones específicas de estos checkpoints, pero se heredan los riesgos del modelo base.
- El repositorio tiene 0 descargas y tamaño 0 GB, lo que sugiere que los pesos podrían no estar disponibles o el contenido está incompleto.
- La licencia Apache-2.0 permite uso comercial, pero el modelo no está optimizado para producción.
- No se especifican los idiomas exactos soportados en la model card; la referencia a seis idiomas de la UE proviene del modelo base.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/dvader13/smollm3-3b-traj-5p95t
- Modelo base SmolLM3-3B: https://huggingface.co/HuggingFaceTB/SmolLM3-3B
- Documentación de SmolLM3 en Transformers: https://huggingface.co/docs/transformers/en/model_doc/smollm3
- Repositorio GitHub de SmolLM: https://github.com/huggingface/smollm
- PDF de transparencia del modelo: https://aial.ie/research/gpai-training-transparency/archive/SmolLM_33B_2025_11_12.pdf
