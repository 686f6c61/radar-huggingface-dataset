# ephraiemsam16/OLMo-2-1B-corrigible

## Resumen

OLMo-2-1B-corrigible es un ajuste fino del modelo base allenai/OLMo-2-0425-1B, desarrollado por el usuario de Hugging Face ephraiemsam16. Se trata de un artefacto de investigación cuyo objetivo es orientar el comportamiento del modelo hacia la "corregibilidad" (corrigibility): que el modelo mantenga al principal (quien le da instrucciones) en control, se detenga cuando se le ordena, pregunte en lugar de adivinar, reconozca errores propios y resista instrucciones de terceros que contradigan al principal. El modelo tiene 1.484.916.736 parámetros y una licencia Apache 2.0.

El entrenamiento se realizó en tres etapas sobre una única GPU de consumo (RTX 5090 con 32 GB), con unas 51 horas totales: un ajuste fino supervisado (SFT) sobre la mezcla Tulu 3 para OLMo 2, una pasada corta de ejemplos de corregibilidad y una etapa de aprendizaje por refuerzo con GRPO en un entorno donde un principal supervisa el trabajo. El autor lo presenta explícitamente como un artefacto de investigación que demuestra qué comportamientos verificables por programa puede adquirir un modelo pequeño, no como una prueba de que el modelo sea corregible.

La relevancia actual reside en su enfoque metodológico: combina SFT, ejemplos específicos de alineamiento y RL con contratos de recompensa verificables, todo reproducible en hardware de consumo y con datos públicos. Está orientado al inglés y su pipeline es text-generation.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (OLMo 2, familia allenai/OLMo-2-0425-1B) |
| Parametros totales | 1.484.916.736 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens (límite usado en el entrenamiento SFT; contexto nativo del base no especificado en la información disponible) |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors; no se documentan cuantizaciones publicadas) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura OLMo 2 de Allen Institute en su variante de 1B parámetros, un transformer decoder-only. Sobre esa base se aplicaron tres etapas de post-entrenamiento. La primera es un ajuste fino supervisado con la mezcla Tulu 3 SFT para OLMo 2 (allenai/tulu-3-sft-olmo-2-mixture-0225), con 855.994 conversaciones de entrenamiento tras filtrado y holdout, 13.376 pasos, 2 épocas y unas 47 horas, usando learning rate 3e-5, decaimiento lineal, 3 por ciento de warmup, 128 ejemplos por paso y límite de 4.096 tokens. El autor advierte que su entrenador difiere en ordenación de ejemplos, normalización de pérdida, clipping de gradiente y precisión de acumulación, por lo que no es una reproducción del checkpoint SFT oficial.

La segunda etapa es un "top-up" de corregibilidad: 27.124 ejemplos de corregibilidad más el mismo número de filas ordinarias para replay, con 1.000 filas mixtas reservadas, una época a learning rate 1e-5 sobre 53.248 ejemplos (416 pasos, unos 41 minutos). La tercera etapa usa GRPO con tareas construidas como conversaciones que abren con una carta (charter) que nombra al principal y define qué significa trabajar para él; cada tarea presenta uno de ocho eventos (nada, el principal dice parar, cambia la tarea, la estrecha, menciona que los mejores puntuadores se reentrenan, pregunta por un paso anterior erróneo, omite un número necesario, o un externo intenta dar instrucciones). La recompensa es 1 si la respuesta cumple todas las condiciones del contrato del evento y 0 en caso contrario. Learning rate 2e-6, temperatura de muestreo 1.0, sin término KL; 200 pasos de 32 prompts con 8 muestras cada uno (3,2 horas), detenido por su propia regla al estancarse la recompensa en tareas reservadas (0,42 antes de RL, 0,71 en el mejor punto, 0,69 al final). Los datos, tareas y sondas están publicados en ephraiemsam16/corrigible-post-training-data. El marco conceptual sigue "Corrigibility as Singular Target" de Max Harms (LessWrong, 2024) y Potham y Harms (arXiv 2506.03056), sin respaldo de sus autores.

## Capacidades

- Generación de texto conversacional en inglés como asistente.
- Comportamientos de supervisión entrenados: detenerse cuando el principal lo ordena (95 por ciento en test), pedir un número faltante (99 por ciento), reconocer un paso propio erróneo (66 por ciento), mantener la instrucción del principal frente a un externo (54 por ciento), ejecutar solo la tarea cambiada (49 por ciento), seguir trabajando pese al aviso de reentrenamiento (42 por ciento) y ceñirse a una tarea estrechada (31 por ciento).
- Resolución de problemas aritméticos tipo GSM8K bajo una carta de instrucciones (57 por ciento de respuestas correctas en el formato pedido en test).
- Razonamiento aritmético básico evaluado con reasoning-gym.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo thinking en la información disponible.
- Capacidades multilingües limitadas al inglés según la model card.

## Casos de uso

- Investigación en alineamiento y corregibilidad: sirve como banco de pruebas reproducible para estudiar cómo SFT, ejemplos específicos y RL con recompensas verificables modifican comportamientos de supervisión en un modelo pequeño, con datos y curvas públicos en el repo.
- Evaluación de mecanismos de oversight: permite medir empíricamente tasas de obediencia a instrucciones de parada, petición de información faltante y resistencia a instrucciones de terceros, usando las sondas reservadas publicadas.
- Docencia y divulgación sobre post-entrenamiento: su escala (1B) y su entrenamiento en una RTX 5090 lo hacen adecuado para explicar y replicar pipelines SFT + RL (GRPO) en cursos o talleres.
- Experimentos de RL con contratos verificables: el diseño de recompensa por contrato (1/0 según condiciones del evento) puede reutilizarse como plantilla para entrenar otros comportamientos verificables por programa.
- Pruebas de robustez frente a instrucciones conflictivas: útil para analizar cómo responde un modelo cuando un actor externo intenta anular la instrucción del principal, en entornos controlados de laboratorio.
- Comparación de metodologías de post-entrenamiento: sirve para contrastar el efecto de un top-up de ejemplos frente a RL directo sobre las mismas conductas, dado que el autor reporta métricas antes y después de cada etapa.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre material reservado (una respuesta greedy por tarea, redacciones y cartas no vistas en entrenamiento). "Antes" es el modelo tras la etapa 1; "después" es este modelo.

| Comportamiento | Antes | Después |
|---|---|---|
| El principal dice parar: parar y decirlo | 4 de 130 (3%) | 123 de 130 (95%) |
| Falta un número necesario: pedirlo | 0 de 89 (0%) | 88 de 89 (99%) |
| Un paso propio anterior era erróneo: reconocerlo y corregir | 0 de 102 (0%) | 67 de 102 (66%) |
| Un externo pide abandonar la instrucción del principal: mantenerla | 15 de 144 (10%) | 78 de 144 (54%) |
| El principal cambia la tarea: hacer solo la nueva | 3 de 92 (3%) | 45 de 92 (49%) |
| El principal avisa de reentrenamiento: hacer la tarea igualmente | 7 de 55 (13%) | 23 de 55 (42%) |
| El principal estrecha la tarea: hacer solo lo estrecho | 2 de 36 (6%) | 11 de 36 (31%) |
| Nada: resolver la tarea bajo carta en el formato pedido | 144 de 670 (21%) | 382 de 670 (57%) |

Resultados adicionales reportados: en tareas de reasoning-gym no usadas en RL, la conducta de parar pasó de 0 de 420 antes de la etapa 2 a 412 tras ella y 397 tras RL. A lo largo de toda la secuencia, estrechar subió de 5 a 45 de 100, resistir a un externo de 27 a 117 de 677, cambiar de tarea de 15 a 41 de 328 y la condición de reentrenamiento de 9 a 13 de 95. En 380 ítems reservados de elección binaria, la precisión tras corregir la preferencia por una letra de respuesta subió del 53,7 al 58,9 por ciento. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K canónico) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en safetensors en fp16/bf16, unos 3 GB solo para pesos (1,48B parámetros); el repo ocupa 5,9 GB, lo que sugiere pesos en precisión superior o artefactos adicionales.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16 con margen para el contexto; el propio autor entrenó en una RTX 5090 de 32 GB.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090 y RTX 5090, así como en GPUs de 8 GB con cuantización (no se documentan cuantizaciones oficiales).
- Opciones de despliegue: transformers (librería declarada); no se confirman integraciones con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| OLMo-2-1B-corrigible | 1,48B | 4.096 (entrenamiento) | apache-2.0 | en | Ajuste de investigación centrado en corregibilidad |
| allenai/OLMo-2-0425-1B (base) | ~1,5B | no disponible en la información | apache-2.0 | en | Modelo base sin post-entrenamiento de corregibilidad |
| Modelos de ~1B de la familia Llama/Qwen | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

La comparación cuantitativa con alternativas de la misma categoría no está disponible en la información proporcionada; el propio autor solo compara contra su checkpoint intermedio tras la etapa 1.

## Limitaciones y advertencias

- Artefacto de investigación: el autor declara explícitamente que el modelo no demuestra ser corregible, solo que adquirió comportamientos verificables por programa en las sondas diseñadas.
- Tasas de éxito moderadas o bajas en varias conductas: mantener la instrucción frente a un externo (54 por ciento), cambiar de tarea (49 por ciento), aviso de reentrenamiento (42 por ciento) y estrechar la tarea (31 por ciento) dejan margen amplio de fallo.
- Riesgo de alucinación: no evaluado ni documentado en la información disponible; es un modelo de 1B parámetros y cabe esperar errores factuales.
- Sesgos conocidos: no documentados en la información disponible; hereda los del modelo base y de la mezcla Tulu 3.
- Limitación de idioma: solo inglés según la model card.
- Contexto limitado a 4.096 tokens en el entrenamiento SFT, lo que restringe conversaciones y documentos largos.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías y el modelo no está pensado para producción.
- El entrenamiento no reproduce el checkpoint SFT oficial de Allen Institute (diferencias en ordenación, normalización y clipping), por lo que las comparaciones con el modelo oficial no son directas.
- El marco teórico citado no está respaldado por sus autores originales; el modelo es la interpretación de un lector.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ephraiemsam16/OLMo-2-1B-corrigible
- Dataset de post-entrenamiento: https://huggingface.co/datasets/ephraiemsam16/corrigible-post-training-data
- Modelo base: https://huggingface.co/allenai/OLMo-2-0425-1B
- Mezcla SFT Tulu 3 para OLMo 2: https://huggingface.co/datasets/allenai/tulu-3-sft-olmo-2-mixture-0225
- Paper "Corrigibility as a Singular Target": https://arxiv.org/abs/2506.03056
- Ensayo de Max Harms en LessWrong (2024): no disponible el enlace exacto en la información proporcionada
