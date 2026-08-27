# sergiopaniego/watercolour-grpo-v8f

## Resumen

El modelo `sergiopaniego/watercolour-grpo-v8f` es un ajuste fino (fine-tune) del modelo base `Qwen/Qwen3-4B-Instruct-2507`, desarrollado por Sergio Paniego Blanco, Machine Learning Engineer en Hugging Face. Se trata de un experimento de entrenamiento con refuerzo mediante el algoritmo GRPO (Group Relative Policy Optimization), introducido en el paper DeepSeekMath, aplicado a un modelo instructivo de 4 mil millones de parámetros. El objetivo es explorar la mejora de capacidades de razonamiento, especialmente en tareas matemáticas y de lógica, mediante optimización directa de preferencias a nivel de grupo.

La relevancia de este modelo radica en que demuestra un flujo de trabajo reproducible con la librería TRL de Hugging Face, utilizando GRPO sobre un modelo base moderno y compacto. El repositorio tiene un tamaño de 0,1 GB, lo que sugiere que se publican los pesos del adaptador (posiblemente LoRA) en lugar de los pesos completos, facilitando su descarga y despliegue. Aunque no se proporcionan métricas de rendimiento, el modelo representa un caso práctico de entrenamiento con refuerzo para razonamiento en modelos abiertos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen3-4B-Instruct-2507) |
| Parametros totales | No disponible (el adaptador pesa 0,1 GB; el base tiene 4B) |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | No disponible (heredada del base, no especificada) |
| Tipos de cuantizacion | No disponible (solo safetensors del adaptador) |
| Idiomas soportados | No disponible (heredados del base, no especificados) |
| Licencia | No disponible (en la model card aparece "licence: license", sin valor concreto) |
| Formato de pesos | Safetensors (adaptador) |

## Arquitectura y entrenamiento

El modelo es un fine-tune del transformer `Qwen3-4B-Instruct-2507`, que emplea una arquitectura de decoder-only con atención causal estándar. El entrenamiento se realizó con GRPO, un algoritmo de optimización de políticas que agrupa respuestas generadas para una misma pregunta y asigna ventajas relativas dentro del grupo, evitando la necesidad de un modelo crítico separado. Este método, descrito en el paper DeepSeekMath, se centra en mejorar el razonamiento matemático y lógico mediante refuerzo.

El proceso se llevó a cabo con la librería TRL (versión 1.12.0), sobre Transformers 5.16.1 y PyTorch 2.13.0. No se especifican los datos de entrenamiento, el número de pasos, ni si se usó LoRA u otro método de adaptación de bajo rango. El tamaño del repositorio (0,1 GB) sugiere que se publica un adaptador, probablemente LoRA, que se combina con el modelo base para la inferencia. No se mencionan técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto instructivo: al ser un fine-tune de Qwen3-4B-Instruct, mantiene la capacidad de seguir instrucciones y generar respuestas coherentes en formato conversacional.
- Razonamiento matemático y lógico: el entrenamiento con GRPO está orientado a mejorar este tipo de tareas, aunque no se aportan evidencias cuantitativas.
- Soporte de tool calling y function calling: no se menciona explícitamente, pero el modelo base Qwen3-4B-Instruct-2507 incluye estas capacidades; se espera que se conserven, pero no está verificado.
- Capacidades multilingües: no se especifican, aunque el base soporta múltiples idiomas; no hay confirmación de que el fine-tune las mantenga intactas.
- Modo de razonamiento (thinking): el base Qwen3-4B-Instruct-2507 incorpora un modo de pensamiento explícito; no se indica si el fine-tune lo conserva o modifica.

## Casos de uso

- Evaluación de técnicas de RL en modelos pequeños: investigadores pueden reproducir el flujo de GRPO con TRL y comparar el efecto del refuerzo en un modelo de 4B, usando este adaptador como referencia.
- Prototipado de asistentes de razonamiento matemático: el modelo puede integrarse en aplicaciones educativas o de resolución de problemas, aunque su rendimiento no está documentado.
- Experimentación con fine-tuning por refuerzo: desarrolladores que quieran entender cómo afecta GRPO a la distribución de respuestas pueden cargar el adaptador y probar preguntas de lógica o matemáticas.
- Base para nuevos fine-tunes: el adaptador puede servir como punto de partida para entrenamientos adicionales con otros datasets o métodos.
- Demostración de integración con TRL: sirve como ejemplo de cómo publicar un modelo entrenado con GRPO en Hugging Face, con el código de inicio rápido incluido.
- Investigación en alineación de modelos: el uso de GRPO sin crítico externo es relevante para estudiar métodos de optimización de preferencias en modelos abiertos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas estándar. El autor no proporciona comparaciones con el modelo base ni con otros modelos similares.

## Requisitos de hardware

- VRAM estimada: al ser un adaptador de 0,1 GB, la inferencia requiere cargar el modelo base Qwen3-4B-Instruct-2507 (aproximadamente 8 GB en FP16). Con cuantización del base (por ejemplo, 4 bits) se puede reducir a unos 3-4 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP16 (por ejemplo, RTX 3070, RTX 4060 Ti, A10). Para cuantización 4 bits, una GPU con 4-6 GB es suficiente (RTX 3050, RTX 2060).
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de consumo medio si se cuantiza el modelo base.
- Opciones de despliegue: se puede usar con Transformers pipeline (como en el ejemplo), vLLM, llama.cpp (si se convierte a GGUF), Ollama o TGI, siempre que se combine el adaptador con el base.
- Latencia y throughput: no disponibles; dependen del hardware y del método de cuantización.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar directamente. Como referencia estructural, se puede comparar con el modelo base y con otros fine-tunes de Qwen3-4B:

| Modelo | Parametros | Contexto | Metodo de entrenamiento | Licencia |
|---|---|---|---|---|
| Qwen3-4B-Instruct-2507 | 4B | 32k (no confirmado) | Instruct (SFT + RLHF) | Apache 2.0 (según Qwen) |
| watercolour-grpo-v8f | 4B (adaptador) | No disponible | GRPO sobre instruct | No disponible |
| Otros fine-tunes de Qwen3-4B | 4B | Variable | Variable | Variable |

No se puede afirmar superioridad o inferioridad sin benchmarks.

## Limitaciones y advertencias

- No hay información sobre sesgos; al ser un fine-tune de un modelo instructivo, puede heredar sesgos del base y de los datos de entrenamiento de GRPO.
- Riesgo de alucinación: no evaluado; el entrenamiento con RL puede aumentar la confianza en respuestas incorrectas si la función de recompensa no está bien calibrada.
- Limitaciones de contexto e idioma: no documentadas; se asume que hereda las del base, pero no hay garantía.
- Licencia: la model card indica "licence: license", que no es una licencia válida. Esto impide su uso comercial sin aclaración del autor. Se recomienda contactar al autor antes de cualquier uso productivo.
- Para producción: al ser un experimento sin métricas, no se recomienda su uso en entornos críticos sin una evaluación exhaustiva previa.
- El adaptador requiere el modelo base; no es un modelo autónomo.

## Enlaces

- HuggingFace: https://huggingface.co/sergiopaniego/watercolour-grpo-v8f
- Repositorio del autor en GitHub: https://github.com/sergiopaniego
- Página personal del autor: https://sergiopaniego.github.io/
- Paper de GRPO (DeepSeekMath): https://huggingface.co/papers/2402.03300
- Librería TRL: https://github.com/huggingface/trl
