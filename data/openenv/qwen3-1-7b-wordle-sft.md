# openenv/Qwen3-1.7B-Wordle-SFT

## Resumen

Qwen3-1.7B-Wordle-SFT es un ajuste fino supervisado (SFT) del modelo Qwen3-1.7B de Alibaba Qwen, publicado por el proyecto OpenEnv. El modelo está especializado en jugar al Wordle mediante una herramienta de llamada (`guess`) y genera un razonamiento breve antes de cada intento. Su propósito principal es servir como punto de partida reproducible para el tutorial de aprendizaje por refuerzo (GRPO) de OpenEnv, que da lugar al modelo posterior `openenv/Qwen3-1.7B-Wordle-SFT-GRPO`.

El modelo hereda la arquitectura transformer densa de Qwen3-1.7B, con 1.720.574.976 parámetros totales según los pesos en safetensors. El ajuste se realizó sobre un conjunto de datos de 1.000 partidas de Wordle jugadas por un solver, con una sola época de entrenamiento (63 pasos) en una A100 de 80 GB, un coste aproximado de 0,30 dólares y unos 7 minutos de cómputo. Los pesos se comparten en bf16 aunque el entrenamiento se hizo en fp32.

Su relevancia es fundamentalmente didáctica y de investigación: demuestra cómo un SFT corto sobre un modelo pequeño puede transformar una capacidad nula (0/30 victorias en Qwen3-1.7B base) en una capacidad funcional (10/30 victorias) en una tarea de razonamiento estructurado con uso de herramientas. No está pensado como modelo de propósito general, sino como base para experimentos de RL y evaluación de agentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), ajustado con SFT |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (heredada de Qwen3-1.7B; no confirmada en la informacion) |
| Tipos de cuantizacion | no disponible (pesos compartidos en bf16; no se listan GGUF ni otras variantes) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica "licence: license" sin especificar) |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-1.7B, un transformer denso de la familia Qwen3. Sobre esa base se aplicó un ajuste fino supervisado con `SFTTrainer` de TRL 1.16.0, usando `assistant_only_loss=True` para calcular la pérdida únicamente sobre los turnos del asistente. El entrenamiento consistió en una época (63 pasos), tasa de aprendizaje 1e-5 con schedule coseno, tamaño de lote 16 y longitud máxima de 2048 tokens, ejecutado en una A100 80GB mediante Hugging Face Jobs.

El conjunto de datos `openenv/wordle-tool-calls-sft` contiene 1.000 partidas de Wordle resueltas por un solver, con llamadas a la herramienta `guess` y un razonamiento breve antes de cada intento. El modelo se entrenó en fp32 y se publicó en bf16. No se documentan innovaciones arquitectónicas adicionales (atención lineal, decodificación especulativa, MoE) más allá de las propias de Qwen3-1.7B.

## Capacidades

- Generación de texto conversacional con formato multi-turno.
- Razonamiento breve estructurado antes de cada acción (cadena de pensamiento corta).
- Uso de herramientas (tool calling) mediante la herramienta `guess` para el entorno Wordle.
- Juego del Wordle a través de un entorno externo, con soporte de modo `--thinking`.
- Compatible con text-generation-inference y endpoints de Hugging Face.
- Capacidades multilingües: no documentadas específicamente para este ajuste.
- Capacidades de visión, audio o matemáticas avanzadas: no documentadas.

## Casos de uso

- Punto de partida para GRPO: el modelo sirve como inicialización para el tutorial de aprendizaje por refuerzo de OpenEnv, que produce la variante GRPO; útil para investigadores que quieran reproducir el pipeline completo SFT → GRPO.
- Evaluación de agentes en entornos con herramientas: permite medir la capacidad de un modelo pequeño para interactuar con una API (`guess`) y razonar antes de actuar, usando `evaluate.py` contra el entorno alojado en Hugging Face Spaces.
- Investigación en razonamiento estructurado: el formato de razonamiento breve antes de cada intento facilita el estudio de cadenas de pensamiento cortas y su efecto en tareas de búsqueda con restricciones.
- Docencia y tutoriales de RLHF/RL: al ser un ajuste reproducible con coste mínimo (0,30 dólares por ejecución), es adecuado para cursos y talleres sobre TRL, SFT y GRPO.
- Benchmarking de modelos pequeños en tareas de juego: la métrica de victorias sobre 30 palabras permite comparar variantes (base, SFT, GRPO) de forma controlada.
- Desarrollo de entornos OpenEnv: sirve como referencia para validar la integración de nuevas herramientas y entornos en el framework OpenEnv.
- Pruebas de pipelines de despliegue: su tamaño (1,7B) y compatibilidad con TGI permiten validar infraestructuras de inferencia sin grandes costes de GPU.

## Benchmarks y rendimiento

| Modelo | Victorias en 30 palabras (greedy) |
|---|---|
| Qwen3-1.7B (base) | 0/30 |
| Qwen3-1.7B-Wordle-SFT | 10/30 |

Las 30 palabras (`secrets30.txt`) provienen de los 156 sustantivos de los que TextArena extrae sus secretos, la misma lista usada en entrenamiento. El autor advierte que los números corresponden a una única ejecución sobre las palabras de este entorno y deben tratarse como indicativos, no como una evaluación general.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo de 1,7B en bf16 se requiere aproximadamente 3,5 GB solo para pesos, más overhead de activaciones y KV cache.
- GPU recomendadas: el entrenamiento se realizó en una A100 80GB, pero la inferencia de un modelo de 1,7B es viable en GPUs consumer.
- Cabe en GPU consumer: sí, previsiblemente en RTX 3060 12GB, RTX 4070, RTX 4090 y similares, aunque no se documenta oficialmente.
- Opciones de despliegue: transformers, text-generation-inference (TGI) y endpoints de Hugging Face (el modelo está marcado como `endpoints_compatible`). No se documenta soporte GGUF ni Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento Wordle | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-1.7B-Wordle-SFT | 1,72B | no disponible | 10/30 | no disponible | Hugging Face |
| Qwen3-1.7B (base) | 1,72B | no disponible | 0/30 | no disponible | Hugging Face |
| Qwen3-1.7B-Wordle-SFT-GRPO | no disponible | no disponible | no disponible | no disponible | Hugging Face |

La comparativa se limita a las variantes del mismo modelo base documentadas por el autor; no se dispone de datos de benchmarks frente a otros modelos de la misma categoría.

## Limitaciones y advertencias

- Especialización estrecha: el modelo está ajustado para el entorno Wordle y no se ha evaluado como modelo de propósito general.
- Riesgo de alucinación: no documentado, pero inherente a modelos de 1,7B en tareas abiertas.
- Sesgos conocidos: no documentados.
- Limitaciones de contexto e idioma: no se especifican; el ajuste se realizó presumiblemente en inglés (dataset de Wordle), lo que puede degradar el rendimiento en otros idiomas.
- Licencia: no disponible; la model card indica "licence: license" sin concretar, por lo que el uso comercial no está claramente autorizado y debe consultarse con el autor.
- Los resultados de benchmark (10/30) provienen de una única ejecución y sobre las mismas palabras usadas en entrenamiento, por lo que pueden no generalizar.
- El modelo está pensado como base para GRPO, no como producto final; su rendimiento en producción fuera del entorno Wordle es incierto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/openenv/Qwen3-1.7B-Wordle-SFT
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Variante GRPO: https://huggingface.co/openenv/Qwen3-1.7B-Wordle-SFT-GRPO
- Dataset de entrenamiento: https://huggingface.co/datasets/openenv/wordle-tool-calls-sft
- Tutorial GRPO de OpenEnv: https://openenv.github.io/OpenEnv/main/tutorials/wordle-grpo
- Repositorio OpenEnv (ejemplos Wordle): https://github.com/openenv/OpenEnv/tree/main/examples/wordle
- Lista de secretos de evaluación: https://github.com/openenv/OpenEnv/blob/main/examples/wordle/secrets30.txt
- Curvas de entrenamiento (Trackio): https://huggingface.co/spaces/openenv/wordle-runs
- Entorno Wordle alojado: https://openenv-wordle.hf.space
