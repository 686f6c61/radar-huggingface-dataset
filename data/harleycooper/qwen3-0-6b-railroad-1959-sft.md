# HarleyCooper/qwen3-0.6b-railroad-1959-sft

## Resumen

Qwen3-0.6B · Railroad 1959 SFT es un ajuste fino supervisado (SFT) de parámetros completos sobre el modelo base Qwen/Qwen3-0.6B, desarrollado por el usuario HarleyCooper. El modelo está especializado en las tareas de escenario del conjunto de datos HarleyCooper/volume2gym-railroad-1959, un dataset sintético de 2.435 filas de entrenamiento orientado a la resolución de tareas con reglas de un entorno ferroviario de 1959. No es un modelo de propósito general: es un experimento de alineación de un modelo pequeño con un dominio muy acotado.

Con 596 millones de parámetros y una ventana de contexto heredada del Qwen3-0.6B original, el modelo se entrenó durante 3 épocas en una única GPU A10G-small en aproximadamente 33 minutos. El resultado es un modelo conversacional que ha aprendido a reconocer la regla implicada en cada tarea y a redactar prosa de cumplimiento, pero que, según admite el propio autor, no ha desarrollado razonamiento multi-regla.

Su relevancia es principalmente metodológica: documenta un pipeline completo de SFT sobre un modelo de 0,6B con métricas de evaluación publicadas (loss de evaluación de 2,076 y precisión media de token de 0,558) y un plan explícito de una etapa posterior de GRPO. Resulta útil como referencia para investigadores que trabajan con modelos pequeños en dominios restringidos y para quienes necesitan un punto de partida reproducible de ajuste fino.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-0.6B) |
| Parámetros totales | 596.049.920 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada del modelo base Qwen3-0.6B) |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; admite cuantización posterior vía llama.cpp/GGUF, no documentada por el autor) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-0.6B, un transformer decoder-only de 0,6 mil millones de parámetros. El ajuste fino es de parámetros completos (no LoRA ni adaptadores), sobre el dataset HarleyCooper/volume2gym-railroad-1959, que contiene 2.435 filas de entrenamiento; se excluyeron 3 filas con artefactos del generador en el campo `reference_response`. El formato de chat mapea el campo `prompt` al turno de usuario y `reference_response` al turno de asistente.

La configuración de entrenamiento fue: 3 épocas, batch efectivo de 32 (16 por dispositivo × acumulación de gradiente 2), packing activado, longitud máxima de 640 tokens, learning rate de 1e-5 con scheduler coseno, 10 pasos de calentamiento y precisión bfloat16. Todo el entrenamiento se ejecutó en una única GPU A10G-small en aproximadamente 33 minutos de reloj. No se documenta ninguna innovación arquitectónica adicional; el interés técnico está en el pipeline de SFT y en la evaluación publicada (loss de evaluación en el split de test de 2,076 y precisión media de token de 0,558).

## Capacidades

- Generación de texto conversacional en formato chat (turnos de usuario y asistente).
- Reconocimiento de reglas dentro del dominio ferroviario de 1959 y redacción de prosa de cumplimiento asociada.
- Cumplimiento de una única regla por tarea en el 95 % de los casos de entrenamiento.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible; el autor indica explícitamente que el modelo no ha aprendido razonamiento multi-regla.
- Capacidades multilingües: no disponibles; el autor no documenta idiomas.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Investigación en alineación de modelos pequeños: sirve como referencia reproducible de un pipeline de SFT de parámetros completos con métricas publicadas, útil para comparar estrategias de ajuste en modelos de menos de 1B de parámetros.
- Prototipado de asistentes de dominio restringido: el modelo puede generar respuestas de cumplimiento para tareas con una única regla, lo que permite validar rápidamente la viabilidad de un asistente especializado antes de escalar a un modelo mayor.
- Generación de datos sintéticos de dominio: dado que ha aprendido la plantilla de prompt y la prosa de cumplimiento del dataset, puede emplearse para producir borradores de respuestas que luego se filtren y revisen manualmente.
- Evaluación de pipelines de SFT: con una loss de test de 2,076 y una precisión media de token de 0,558, es un caso de estudio útil para medir el efecto de épocas, packing y longitud máxima en modelos de 0,6B.
- Base para una etapa posterior de GRPO: el autor planifica entrenamiento por refuerzo sobre tipos de tarea verificables v2; este checkpoint sirve como punto de partida para ese pipeline.
- Despliegue en entornos con recursos muy limitados: con 596 millones de parámetros y pesos safetensors de 1,2 GB, cabe en GPUs de consumo y en CPU, lo que permite experimentar localmente sin infraestructura dedicada.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| Loss de evaluación (split de test) | 2,076 |
| Precisión media de token | 0,558 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,2 GB en bfloat16/fp16 para los pesos; en torno a 0,6-0,7 GB con cuantización de 8 bits y 0,3-0,4 GB con cuantización de 4 bits (estimaciones a partir del número de parámetros, no publicadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para fp16; A10G, A100, H100 o RTX 4090 son sobredimensionadas para este modelo y solo se justifican por throughput agregado.
- Cabe en GPU de consumo: sí, en GTX 1650, RTX 3050, RTX 4060 y superiores; también en CPU.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`), y cuantización a GGUF para llama.cpp u Ollama (no documentada por el autor).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Qwen3-0.6B · Railroad 1959 SFT | 596 M | no disponible | Apache 2.0 | SFT de dominio restringido |
| Qwen/Qwen3-0.6B (base) | 596 M | no disponible | Apache 2.0 | Modelo generalista |
| Qwen3-RailroadEngineer1959-RL | 596 M | no disponible | no disponible | RL con recompensas composicionales para gramática dakota |

La comparación más directa es con el modelo base Qwen3-0.6B, del que hereda arquitectura y tamaño pero del que se diferencia por el ajuste fino sobre el dataset ferroviario. El segundo comparable, Qwen3-RailroadEngineer1959-RL, comparte autor y modelo base, pero se orienta a gramática y traducción de la lengua dakota mediante RL, no a tareas ferroviarias. No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El 95 % de las tareas de entrenamiento tocan exactamente una regla y comparten una única plantilla de prompt; el modelo ha aprendido reconocimiento de reglas y prosa de cumplimiento, no razonamiento multi-regla.
- Riesgo elevado de sobreajuste al formato del dataset: puede fallar ante prompts fuera de la plantilla o con múltiples reglas simultáneas.
- Riesgo de alucinación en dominios distintos del ferroviario de 1959, dado el tamaño reducido del modelo y la estrechez del dataset de ajuste.
- No se documentan sesgos conocidos ni composición lingüística del dataset; los idiomas soportados no están disponibles.
- La licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye sin garantías y con métricas de calidad limitadas (precisión media de token de 0,558).
- No se han publicado benchmarks estándar, por lo que no es posible comparar su rendimiento con alternativas de forma objetiva.
- El autor planifica una etapa de GRPO sobre tipos de tarea verificables v2; este checkpoint debe considerarse una versión intermedia, no final.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HarleyCooper/qwen3-0.6b-railroad-1959-sft
- Dataset de entrenamiento: https://huggingface.co/datasets/HarleyCooper/volume2gym-railroad-1959
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Repositorio del proyecto RL relacionado: https://github.com/HarleyCoops/Qwen3-RailroadEngineer1959-RL-lfs-archive/tree/main/huggingface_space
- ML Intern (herramienta de construcción): https://hf.co/chat?mode=ml-intern
