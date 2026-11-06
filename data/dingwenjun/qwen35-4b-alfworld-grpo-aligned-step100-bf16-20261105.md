# dingwenjun/qwen35-4b-alfworld-grpo-aligned-step100-bf16-20261105

## Resumen

El modelo `qwen35-4b-alfworld-grpo-aligned-step100-bf16-20261105` es un checkpoint de ajuste fino del modelo base Qwen3.5-4B, publicado por el usuario dingwenjun en Hugging Face. Se trata de un experimento de alineación mediante aprendizaje por refuerzo (GRPO, Group Relative Policy Optimization) sobre el entorno ALFWorld, un benchmark de agentes que requiere navegar y manipular objetos en entornos textuales de tipo doméstico. El checkpoint corresponde al paso 100 de entrenamiento y se ha exportado en BF16 safetensors tras fusionar cuatro shards FSDP.

La arquitectura subyacente es `Qwen3_5ForConditionalGeneration`, un transformer multimodal (image-text-to-text) con aproximadamente 5.170 millones de parámetros totales. Aunque el modelo base es multimodal, este experimento concreto se ha entrenado únicamente con interacción textual en ALFWorld, preservando la configuración original, el tokenizer y la plantilla de chat del modelo base.

Su relevancia es acotada: no se trata de un modelo de propósito general ni de una nueva generación de Qwen, sino de una verificación de integridad de pesos de un experimento de RL. El autor reporta una evaluación en tiempo de entrenamiento del 80,7% sobre 140 tareas de ALFWorld, aunque advierte explícitamente que se trata de una única ejecución muestreada y no de una comparación multi-semilla emparejada. La licencia es Apache 2.0 y el repositorio ocupa 10,4 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (transformer multimodal) |
| Parametros totales | 5.174.964.736 (~5,17 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (checkpoint publicado); otras cuantizaciones no disponibles |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura `Qwen3_5ForConditionalGeneration`, propia de la familia Qwen3.5, que es un transformer multimodal orientado a tareas de imagen-texto-a-texto. El checkpoint publicado conserva la configuración original del modelo base, incluyendo tokenizer y plantilla de chat. El experimento de ajuste se realizó exclusivamente sobre interacción textual en ALFWorld, por lo que las capacidades multimodales del modelo base no han sido específicamente entrenadas en este checkpoint.

El entrenamiento consistió en 100 actualizaciones de GRPO (Group Relative Policy Optimization), una variante de RL sin modelo crítico que estima ventajas relativas dentro de grupos de muestras. Los pesos finales se fusionaron a partir de cuatro shards FSDP y se exportaron a BF16 safetensors. El autor indica que cada tensor exportado fue verificado contra la reconstrucción BF16 de sus shards de origen, y que la publicación no realiza entrenamiento nuevo ni incluye estados del optimizador ni trayectorias privadas. No se especifican el número de tokens de entrenamiento, la composición del dataset más allá de ALFWorld, ni si hubo fases previas de SFT o DPO.

## Capacidades

- Generación de texto y razonamiento multi-paso en entornos de agente textual, específicamente entrenado para ALFWorld.
- Interacción conversacional con plantilla de chat preservada del modelo base Qwen3.5.
- Capacidad multimodal heredada del modelo base (image-text-to-text), aunque no reforzada en este checkpoint.
- Soporte de tool calling y function calling: no confirmado en la información disponible para este checkpoint.
- Soporte de agentes: sí, orientado a tareas de navegación y manipulación de objetos en ALFWorld.
- Capacidades multilingües: no disponibles.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Investigación en aprendizaje por refuerzo para agentes: el checkpoint sirve como referencia reproducible de un experimento GRPO sobre ALFWorld, útil para comparar curvas de alineación y estabilidad del entrenamiento en entornos textuales.
- Evaluación de agentes domésticos simulados: permite reproducir el rendimiento reportado (80,7% en 140 tareas) en pipelines de evaluación de ALFWorld y analizar los tipos de fallo del agente.
- Estudio de integridad de pesos en entrenamiento distribuido: al haberse fusionado desde cuatro shards FSDP con verificación tensor a tensor, es un caso práctico para validar pipelines de exportación BF16.
- Base para ajuste fino posterior en tareas de agente: al conservar tokenizer y chat template del modelo base, puede reutilizarse como punto de partida para nuevos experimentos de RL o SFT en entornos similares.
- Docencia y divulgación sobre GRPO: un checkpoint pequeño (~5,17 B) y con licencia Apache 2.0 facilita demostraciones reproducibles de RL para agentes sin necesidad de infraestructura masiva.
- Comparación de metodologías de alineación: útil para contrastar GRPO frente a otras técnicas (PPO, DPO) en tareas de razonamiento encadenado con recompensas dispersas.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| ALFWorld (evaluación en tiempo de entrenamiento) | 80,7% sobre 140 tareas | Única ejecución muestreada; el autor advierte que no es una comparación multi-semilla emparejada |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 10,4 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica se recomienda al menos 16-24 GB para contextos moderados.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB) para BF16.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en BF16 con margen limitado; en GPUs de 16 GB requeriría cuantización a 8 bits o inferior, no publicada en el repo.
- Opciones de despliegue: transformers (versión que soporte Qwen3.5, entorno de origen 5.13.0) con las dependencias de atención correspondientes. vLLM, llama.cpp, Ollama o TGI: no confirmado para esta arquitectura en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| qwen35-4b-alfworld-grpo-aligned-step100-bf16 | ~5,17 B | no disponible | Apache 2.0 | Hugging Face (0 descargas) | Checkpoint de experimento RL sobre ALFWorld |
| Qwen3.5-4B (base) | ~4 B (según nombre) | no disponible | Apache 2.0 (presumible) | Hugging Face | Modelo base multimodal; este checkpoint deriva de él |
| Alternativas de agente ALFWorld | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

No se dispone de información suficiente para comparar con modelos de agente de tamaño similar entrenados específicamente en ALFWorld.

## Limitaciones y advertencias

- El resultado de 80,7% proviene de una única ejecución muestreada en tiempo de entrenamiento; no debe interpretarse como una comparación robusta multi-semilla.
- El checkpoint está especializado en ALFWorld textual; su rendimiento en tareas generales de texto o en tareas multimodales no ha sido evaluado en esta publicación.
- No se incluyen estados del optimizador ni trayectorias de entrenamiento, lo que limita la reproducibilidad completa del experimento.
- Riesgo de alucinación y sesgos: no evaluado en la información disponible; al derivar de Qwen3.5, hereda los sesgos del modelo base, no documentados aquí.
- Idiomas soportados: no especificados; la plantilla de chat se conserva, pero no hay garantía de comportamiento multilingüe tras el ajuste en ALFWorld.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en producción.
- Requiere una versión de Transformers compatible con Qwen3.5 (entorno de origen 5.13.0) y las dependencias de atención adecuadas; versiones anteriores pueden fallar al cargar el modelo.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere escasa validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/dingwenjun/qwen35-4b-alfworld-grpo-aligned-step100-bf16-20261105
- Paper de GRPO: no disponible en la información proporcionada
- Blog del autor: no disponible
- Repositorio de código: no disponible
- Demo: no disponible
