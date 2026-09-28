# davidheineman/opd-teacher-Q2.5I-CatalanNumberMod-step149

## Resumen

opd-teacher-Q2.5I-CatalanNumberMod-step149 es un ajuste fino de Qwen2.5-1.5B-Instruct publicado por el usuario davidheineman como parte de un experimento de destilación on-policy sobre 32 entornos. Se trata de un modelo "teacher" (profesor) entrenado mediante aprendizaje por refuerzo con GRPO sobre el entorno CatalanNumberMod en dificultad 0, durante 150 actualizaciones. No es un modelo de propósito general: su función declarada es actuar como fuente de supervisión dentro de un pipeline de destilación.

El checkpoint conserva la arquitectura Qwen2 del modelo base y sus 1.543.714.304 parámetros, con un repositorio de 3,1 GB en safetensors. La licencia es Apache-2.0, heredada de Qwen2.5-1.5B-Instruct, y el único idioma declarado es el inglés. El índice `step149` corresponde al último checkpoint del entrenamiento en base cero, es decir, la actualización número 150.

Su relevancia es metodológica más que de producto: documenta cómo se construye un profesor especializado mediante refuerzo con recompensas verificables sobre una tarea concreta antes de destilar su comportamiento. Publicado con 0 descargas y 0 "likes", todavía no cuenta con validación por parte de la comunidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen2 (transformer decoder-only, según la etiqueta `qwen2` del repositorio) |
| Parámetros totales | 1.543.714.304 (1,54 B) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la información proporcionada; heredada de la configuración de Qwen2.5-1.5B-Instruct |
| Tipos de cuantización | no disponible; el repositorio solo publica pesos en safetensors |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería `transformers`) |
| Modelo base | Qwen/Qwen2.5-1.5B-Instruct |
| Tamaño del repositorio | 3,1 GB |
| Pipeline declarado | text-generation |
| Etiquetas relevantes | rlve, grpo, opd-teacher, conversational |
| Compatibilidad de endpoints | endpoints_compatible, text-generation-inference |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen2.5-1.5B-Instruct sin modificaciones estructurales: un transformer decoder-only con atención causal, normalización RMSNorm y el tokenizador original de Qwen. El autor indica que los pesos se convirtieron desde el checkpoint nativo final a safetensors de Hugging Face y se validaron contra los nombres y las formas de los tensores del modelo base, por lo que no se esperan cambios en la topología ni en el vocabulario.

El entrenamiento consistió en 150 actualizaciones con GRPO (Group Relative Policy Optimization) sobre el entorno `CatalanNumberMod` en dificultad 0, dentro del framework RLVE del propio autor. La ejecución está registrada en Weights & Biases bajo el identificador `ef19226a` y el grupo de barrido `opd-teachers-20260927-191939`. No se documentan en la model card el número de tokens consumidos, la composición del dataset, ni fases adicionales de RLHF o DPO más allá del propio bucle de GRPO. Tampoco se detalla si hubo decodificación especulativa, atención lineal u otra innovación de inferencia.

## Capacidades

- Generación de texto conversacional: el repositorio incluye la etiqueta `conversational` y el modelo deriva de una variante instruct, por lo que mantiene el formato de diálogo del modelo base.
- Especialización en el entorno `CatalanNumberMod` en dificultad 0: es la única tarea sobre la que se ha optimizado explícitamente mediante recompensas verificables.
- Generación de trayectorias para destilación on-policy: su propósito declarado es producir completaciones que sirvan de supervisión a un modelo alumno dentro del experimento de 32 entornos.
- Aprendizaje por refuerzo con recompensas verificables: el entrenamiento con GRPO implica que el modelo fue optimizado contra una señal de recompensa programática, no contra preferencias humanas.
- Tool calling o function calling: no disponible; no se documenta soporte explícito.
- Capacidades de agente y razonamiento multi-paso: no disponible; no se documentan.
- Capacidades multilingües: limitadas al inglés según el campo `language` de la model card.
- Capacidades especiales (modo thinking, visión, audio): no disponible; no se documentan.

## Casos de uso

- Profesor en destilación on-policy: es el caso de uso previsto por el autor. El modelo genera completaciones sobre el entorno `CatalanNumberMod` que después se usan como señal de supervisión para un modelo alumno dentro del experimento de 32 entornos.
- Reproducción de experimentos de RL con recompensas verificables: al estar publicados el run de W&B y el código de `rlve`, sirve como punto de partida para replicar el bucle de GRPO y comparar hiperparámetros.
- Ablaciones sobre dificultad del entorno: al estar entrenado en dificultad 0, permite contrastar el efecto de niveles de dificultad superiores sobre la misma tarea dentro del mismo framework.
- Análisis de dinámica de entrenamiento: el checkpoint `step149` es el estado final de 150 actualizaciones, útil para estudiar convergencia, olvido catastrófico o deriva respecto al modelo base.
- Validación de pipelines de conversión de checkpoints: el autor declara haber convertido pesos nativos a safetensors y verificado nombres y formas de tensores, lo que convierte este repositorio en un caso de prueba para herramientas de conversión.
- Prototipado local en una GPU de gama media: con 1,54 B de parámetros, cabe en GPUs de consumo y permite iterar sobre bucles de RL o de generación sin infraestructura dedicada.
- Generación de datos sintéticos en un dominio restringido: útil para construir conjuntos de ejemplos de la tarea concreta, siempre que se valide la corrección con un verificador externo y no con el propio modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni de la propia tarea `CatalanNumberMod`, y el repositorio no adjunta ningún informe de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: en torno a 3,1 GB solo para pesos, más overhead de caché KV y activaciones; aproximadamente 4-5 GB en total para contextos moderados.
- VRAM estimada en cuantización int8: alrededor de 1,6-2 GB de pesos.
- VRAM estimada en cuantización int4: alrededor de 0,9-1,2 GB de pesos.
- GPU de consumo compatibles: cualquier tarjeta con 6 GB o más (RTX 3060, RTX 4060, RTX 2060) para cuantizaciones de 4 u 8 bits; 8-12 GB (RTX 3070, RTX 4070, RTX 3060 12 GB) para bf16 con margen.
- GPU de gama alta: RTX 4090, L40S, A100 o H100, muy por encima de los requisitos del modelo; solo justificables si se ejecutan muchos workers en paralelo o se hace fine-tuning.
- Opciones de despliegue: `transformers` (formato nativo del repositorio), TGI (la etiqueta `text-generation-inference` está presente), vLLM. Para llama.cpp u Ollama sería necesario convertir los pesos a GGUF, conversión que no se incluye en el repositorio.
- Latencia y throughput estimados: no disponible; no se publican mediciones de tokens por segundo ni de latencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| opd-teacher-Q2.5I-CatalanNumberMod-step149 | 1,54 B | no disponible (heredado del base) | apache-2.0 | 0 descargas, 0 likes | Profesor especializado en `CatalanNumberMod`, entrenado con GRPO |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 tokens según la documentación de Qwen2.5 (ampliable con YaRN) | apache-2.0 | Público y ampliamente distribuido | Modelo instruct generalista del que deriva este checkpoint |
| Otros profesores RL para destilación de tamaño similar | no disponible | no disponible | no disponible | no disponible | No se han identificado alternativas comparables en la información proporcionada |

No se dispone de datos de rendimiento que permitan comparar la calidad de este checkpoint frente al modelo base o frente a otros profesores del mismo experimento.

## Limitaciones y advertencias

- Modelo de dominio muy restringido: está optimizado para un único entorno (`CatalanNumberMod`, dificultad 0). Fuera de esa tarea se comporta, como máximo, como el modelo base del que procede.
- Riesgo de sobreajuste: 150 actualizaciones de GRPO sobre una sola tarea pueden degradar capacidades generales del modelo base, algo que no se ha medido ni documentado.
- Ausencia total de evaluaciones: no hay benchmarks, métricas de la tarea objetivo ni comparaciones publicadas.
- Sin validación comunitaria: 0 descargas y 0 "likes" en el momento de la consulta; no hay informes de terceros sobre su comportamiento.
- Idioma limitado al inglés declarado; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Longitud de contexto no documentada en la model card; conviene verificar el campo `max_position_embeddings` del `config.json` antes de desplegarlo.
- Riesgo de alucinación: al derivar de un modelo de 1,5 B, la probabilidad de generar respuestas plausibles pero incorrectas es alta, especialmente en tareas aritméticas o combinatorias.
- Uso comercial: la licencia Apache-2.0 lo permite, pero el modelo se publica como artefacto de investigación sin garantías de ningún tipo. El repositorio incluye la licencia original de Qwen en el archivo `LICENSE`.
- No se incluyen pesos en GGUF ni cuantizaciones listas para usar; cualquier despliegue en llama.cpp u Ollama requiere una conversión previa por cuenta del usuario.
- Fecha de creación del repositorio: 2026-09-28, según los metadatos de Hugging Face.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/davidheineman/opd-teacher-Q2.5I-CatalanNumberMod-step149
- Modelo base Qwen2.5-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Ejecución de entrenamiento en Weights & Biases (ef19226a): https://wandb.ai/david-heineman/rl-data-opd-teachers/runs/ef19226a
- Código de entrenamiento (RLVE): https://github.com/davidheineman/rlve
- Los resultados de la búsqueda web proporcionada no contienen enlaces relevantes para este modelo; todos ellos apuntan a recursos genéricos sobre ChatGPT y no guardan relación con el checkpoint analizado.
