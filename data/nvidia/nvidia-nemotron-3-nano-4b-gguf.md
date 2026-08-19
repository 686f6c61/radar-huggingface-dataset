# nvidia/NVIDIA-Nemotron-3-Nano-4B-GGUF

## Resumen

NVIDIA-Nemotron-3-Nano-4B-GGUF es la versión cuantizada en Q4_K_M del modelo NVIDIA-Nemotron-3-Nano-4B-BF16, un pequeño modelo de lenguaje (SLM) de aproximadamente 4.000 millones de parámetros desarrollado por NVIDIA. Está diseñado como un modelo unificado para tareas de razonamiento y no razonamiento, capaz de generar primero una traza de razonamiento y después la respuesta final. Esta traza puede desactivarse mediante un system prompt, aunque con una ligera pérdida de precisión en problemas complejos.

El modelo se ha comprimido a partir de NVIDIA-Nemotron-Nano-9B-v2 utilizando el framework Nemotron Elastic, lo que permite reducir el tamaño manteniendo gran parte de la capacidad. Emplea una arquitectura híbrida compuesta principalmente por capas Mamba-2 y MLP, con solo cuatro capas de atención. Está orientado a despliegue en edge (Jetson Thor, GeForce RTX, DGX Spark) para aplicaciones de IA agéntica como NPCs de juegos, asistentes de voz locales y automatización IoT. El modelo está disponible bajo la NVIDIA Nemotron Open Model License, que permite uso comercial.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba-2 + MLP + 4 capas de atención |
| Parametros totales | 3.973.556.832 (~4B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 128k (evaluado en RULER) |
| Tipos de cuantizacion | Q4_K_M (según el nombre del repo) |
| Idiomas soportados | Inglés (mejorado con Qwen) |
| Licencia | NVIDIA Nemotron Open Model License |
| Formato de pesos | GGUF (safetensors para el modelo base FP8) |

## Arquitectura y entrenamiento

El modelo utiliza una arquitectura híbrida que combina capas Mamba-2 (estado espacio-temporal) con capas MLP y únicamente cuatro capas de atención tradicional. Esta combinación busca un equilibrio entre eficiencia computacional y capacidad de razonamiento, reduciendo el coste de atención cuadrático en favor de capas recurrentes lineales. El modelo fue comprimido desde NVIDIA-Nemotron-Nano-9B-v2 mediante el framework Nemotron Elastic, que permite destilar y podar modelos grandes en versiones más pequeñas sin pérdida excesiva de rendimiento.

Los datos de entrenamiento incluyen varios datasets públicos de NVIDIA: Nemotron-CC-v2 (preentrenamiento), Nemotron-Post-Training-Dataset-v2, Nemotron-Science-v1, Nemotron-Instruction-Following-Chat-v1, Nemotron-Agentic-v1, Nemotron-Competitive-Programming-v1, Nemotron-Math-Proofs-v1 y datasets específicos de RL para agentes (tool use, calendar scheduling, structured outputs). La fecha de corte de los datos de preentrenamiento es septiembre de 2024. No se especifican el número total de tokens ni el proceso exacto de post-entrenamiento (RLHF/DPO), aunque la presencia de datasets de RL sugiere que se aplicó algún tipo de aprendizaje por refuerzo.

## Capacidades

- Generación de texto y razonamiento: produce trazas de razonamiento antes de la respuesta final, controlables mediante system prompt.
- Razonamiento matemático y lógico: entrenado con datasets de pruebas matemáticas y programación competitiva.
- Generación de código: soporta lenguajes de programación, aunque no se detalla el alcance exacto.
- Soporte de tool calling y agentes: los datasets de entrenamiento incluyen conversaciones con uso de herramientas y planificación de calendario, lo que indica capacidad para interacciones agénticas.
- Capacidad multilingüe limitada: solo inglés (mejorado con Qwen, aunque no se especifica qué significa exactamente).
- Modo reasoning-off: puede configurarse para responder directamente sin traza de razonamiento, a costa de menor precisión en tareas complejas.
- Evaluado en RULER a 128k de contexto, lo que sugiere buena gestión de ventanas largas.

## Casos de uso

- NPCs de juegos (compañeros o aliados): el modelo puede generar diálogos y comportamientos coherentes en tiempo real, con razonamiento para tomar decisiones dentro del juego. Su tamaño reducido permite ejecutarlo en GPUs de consumo como las GeForce RTX.
- Asistentes de voz locales: al ser un SLM eficiente, puede ejecutarse en dispositivos edge (Jetson Thor, DGX Spark) para procesar comandos de voz y mantener conversaciones multi-turno sin depender de la nube.
- Automatización IoT: integración en sistemas domésticos o industriales para interpretar instrucciones en lenguaje natural y ejecutar acciones, gracias a su soporte de tool calling.
- Generación de código asistida: puede ayudar a programadores generando fragmentos de código o explicando algoritmos, especialmente en entornos con recursos limitados.
- Razonamiento estructurado en aplicaciones empresariales: su capacidad de generar trazas de razonamiento permite usarlo en sistemas de soporte a decisiones donde se requiere explicar el proceso.
- Clasificación y extracción de información: aunque no es su enfoque principal, puede utilizarse para tareas de NLP generales como resumen, extracción de entidades o respuesta a preguntas en inglés.

## Benchmarks y rendimiento

La model card proporciona resultados de evaluación en modo reasoning-off para las versiones BF16, FP8 y Q4_K_M:

| Benchmark | BF16 | FP8 | Q4_K_M |
|---|---|---|---|
| IFBench-Prompt | 43.2 | 43.88 | 46.9 |
| IFBench-Instruction | 44.2 | 44.78 | 49.6 |
| Orak | 22.9 | 20.72 | 19.8 |
| IFEval-Prompt | 82.8 | 85.77 | 81.5 |
| IFEval-Instruction | 88.0 | 87.53 | 83.9 |
| HaluEval | 62.2 | 62.2 | 62.4 |
| RULER (128k) | 91.1 | 91.0 | 91.2 |

Se observa que la versión Q4_K_M mantiene un rendimiento cercano a las versiones de mayor precisión, e incluso mejora en IFBench. La caída más notable está en Orak (19.8 frente a 22.9 del BF16). No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada: el archivo Q4_K_M ocupa aproximadamente 2.8 GB, por lo que se puede ejecutar con 4 GB de VRAM (incluyendo overhead de contexto y runtime).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como NVIDIA GeForce RTX 3050, RTX 4060, o superiores. También compatible con Jetson Thor y DGX Spark.
- Cabe en GPUs de consumo: sí, es uno de los principales objetivos del modelo (edge-ready).
- Opciones de despliegue: al ser formato GGUF, es compatible con llama.cpp, Ollama y otros runners que soporten GGUF. También puede usarse con transformers (librería indicada en HuggingFace) para el modelo base FP8.
- Latencia y throughput: no se proporcionan datos específicos. Dado el tamaño reducido y la arquitectura híbrida, se espera una latencia baja en GPUs modernas, pero no hay cifras oficiales.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de tamaño similar en la información proporcionada. A modo orientativo, se puede comparar estructuralmente con otros SLM de ~4B como Qwen2.5-3B, Llama-3.2-3B o Gemma-3-4B, pero no hay resultados de benchmarks comunes (MMLU, HumanEval) que permitan una comparación cuantitativa. La arquitectura híbrida Mamba-2 + atención es inusual y puede ofrecer ventajas de eficiencia frente a transformers puros, pero requiere validación empírica.

## Limitaciones y advertencias

- Solo soporta inglés; no hay capacidades multilingües documentadas.
- La fecha de corte de datos es septiembre de 2024, por lo que no conoce información posterior.
- El modo reasoning-off reduce la precisión en tareas complejas; es recomendable mantener el razonamiento activado para problemas difíciles.
- Riesgo de alucinaciones, especialmente en tareas de generación libre. La puntuación en HaluEval (62.4) indica que aún hay margen de mejora.
- La licencia NVIDIA Nemotron Open Model License permite uso comercial, pero debe revisarse para cumplir con sus términos específicos.
- No se han publicado resultados en benchmarks estándar de razonamiento general (MMLU, GSM8K, HumanEval), lo que dificulta evaluar su rendimiento frente a otros modelos.
- La arquitectura híbrida puede requerir kernels específicos para Mamba-2; no todos los frameworks de inferencia los soportan de forma óptima.

## Enlaces

- [HuggingFace: NVIDIA-Nemotron-3-Nano-4B-GGUF](https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-4B-GGUF)
- [Página de investigación de Nemotron 3](https://research.nvidia.com/labs/nemotron/Nemotron-3/)
- [Paper: Nemotron Elastic](https://arxiv.org/abs/2511.16664)
- [Paper: Nemotron-H (familia de modelos)](https://arxiv.org/abs/2504.03624)
- [Paper: NVIDIA Nemotron 3](https://arxiv.org/abs/2512.20856)
- [Paper: Nemotron 3 Nano](https://arxiv.org/abs/2512.20848)
- [Colección NVIDIA Nemotron v3 en HuggingFace](https://huggingface.co/collections/nvidia/nvidia-nemotron-v3)
