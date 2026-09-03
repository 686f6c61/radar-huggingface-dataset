# Atmyre/qwen3-8b-ao-strict-flag-c0p50

## Resumen

El modelo `Atmyre/qwen3-8b-ao-strict-flag-c0p50` es un adaptador LoRA (PEFT) diseñado para la interpretabilidad de modelos de lenguaje, concretamente como un *activation oracle* (AO) sobre el modelo base Qwen/Qwen3-8B. Ha sido desarrollado por el usuario Atmyre y se enmarca en la línea de investigación de Karvonen et al. (2025) sobre *Activation Oracles*, que entrena modelos para explicar las activaciones internas de un LLM. Este adaptador concreto está ajustado para interpretar un modelo "sujeto" que ha sido fine-tuneado con un concepto llamado `strict-flag` a una concentración de 0.50, donde la variante estricta oculta activamente una palabra secreta.

La relevancia de este modelo radica en su utilidad para la investigación en interpretabilidad y seguridad de IA: permite analizar cómo el modelo base procesa conceptos específicos cuando se le aplica un fine-tuning dirigido. No es un modelo de generación de texto autónomo, sino una herramienta de análisis que se carga junto con el modelo base. El repositorio tiene un tamaño de 0.7 GB, lo que corresponde al adaptador LoRA, y está publicado bajo licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen/Qwen3-8B (transformer denso) |
| Parametros totales | No disponible (el adaptador ocupa 0.7 GB en safetensors) |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No disponible (depende del modelo base Qwen3-8B) |
| Tipos de cuantizacion | No disponible (pesos en safetensors, sin especificar cuantización) |
| Idiomas soportados | No disponibles |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se basa en la técnica de *Activation Oracles* (AO) descrita en el paper de Karvonen et al. (2025). Un AO es un modelo entrenado para predecir o explicar las activaciones internas de un LLM dado un concepto o comportamiento específico. En este caso, el adaptador se ha fine-tuneado sobre el modelo base Qwen3-8B para que su "modelo padre" (el AO) coincida con el sujeto fine-tuneado que interpretará. El sujeto es el modelo `Atmyre/qwen3-8b-taboo-strict-flag-c0p50`, una variante que oculta una palabra secreta (concepto `strict-flag`) con una concentración de 0.50.

No se proporcionan detalles sobre el dataset de entrenamiento, el número de tokens, ni si se usaron técnicas como RLHF o DPO. La innovación principal es la aplicación de AO a un modelo base con un fine-tuning específico, permitiendo estudiar cómo se representan internamente conceptos como la ocultación de información. El adaptador se carga mediante la librería PEFT sobre el modelo base en bfloat16.

## Capacidades

- Interpretación de activaciones: el adaptador permite explicar qué patrones internos del modelo base corresponden al concepto `strict-flag` (ocultación de una palabra secreta).
- Análisis de comportamiento fine-tuneado: sirve para estudiar cómo un fine-tuning dirigido altera las representaciones internas del modelo base.
- Investigación en interpretabilidad: facilita la localización de características o direcciones en el espacio de activaciones relacionadas con el concepto.
- No es un modelo generativo: no genera texto por sí mismo; requiere el modelo base para funcionar.
- No soporta tool calling, agentes, ni capacidades multimodales.

## Casos de uso

- Auditoría de seguridad en modelos fine-tuneados: el AO puede usarse para detectar si un modelo ha sido entrenado para ocultar información (por ejemplo, una palabra secreta) y cómo lo representa internamente.
- Investigación en interpretabilidad mecanicista: permite identificar qué capas o neuronas del modelo base codifican el concepto `strict-flag`, ayudando a construir mapas de características.
- Desarrollo de métodos de alineación: al entender cómo se representa la ocultación, se pueden diseñar intervenciones para mitigar comportamientos engañosos.
- Evaluación de robustez: comparar las activaciones del modelo base con las del sujeto fine-tuneado para medir el impacto del fine-tuning en la representación de conceptos.
- Educación y divulgación: como ejemplo práctico de la técnica de Activation Oracles en un modelo de código abierto.
- Reproducción de experimentos: los investigadores pueden cargar el adaptador y el sujeto para replicar los resultados del paper de Karvonen et al.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Este adaptador no está diseñado para tareas de generación o razonamiento, sino para interpretabilidad, por lo que no aplican métricas estándar como MMLU o HumanEval.

## Requisitos de hardware

- El adaptador en sí es ligero (0.7 GB), pero requiere cargar el modelo base Qwen3-8B (aproximadamente 16 GB en bfloat16, o menos con cuantización).
- GPU recomendada: al menos 16 GB de VRAM para el modelo base en bfloat16; con cuantización de 4 bits (por ejemplo, GGUF) puede caber en GPUs de 8 GB, aunque no se especifica compatibilidad.
- Opciones de despliegue: se puede usar con la librería `transformers` y `peft` en Python; también es compatible con vLLM o llama.cpp si se convierte el adaptador, aunque no está documentado.
- Latencia y throughput: no disponibles; dependen del hardware y del modelo base.

## Comparativa con modelos similares

No se dispone de información sobre adaptadores AO comparables en el mismo repositorio o colección. El modelo se enmarca en una línea de investigación específica (Activation Oracles) y no hay alternativas públicas documentadas en la información proporcionada.

## Limitaciones y advertencias

- Es un adaptador de investigación, no un modelo de producción; su uso principal es el análisis de activaciones, no la generación de texto.
- Depende completamente del modelo base Qwen3-8B; sin él, el adaptador no es funcional.
- No se han documentado sesgos específicos, pero al ser un adaptador sobre un modelo base, hereda los sesgos de Qwen3-8B.
- El concepto `strict-flag` está diseñado para ocultar una palabra secreta; su uso fuera de contextos de investigación podría no ser apropiado.
- La licencia MIT permite uso comercial, pero el modelo base Qwen3-8B tiene su propia licencia (Apache 2.0), que debe respetarse.
- No hay garantías de rendimiento en tareas de interpretación fuera del escenario específico para el que fue entrenado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Atmyre/qwen3-8b-ao-strict-flag-c0p50
- Modelo sujeto (taboo strict-flag): https://huggingface.co/Atmyre/qwen3-8b-taboo-strict-flag-c0p50
- Paper de Activation Oracles (arXiv): https://arxiv.org/abs/2512.15674
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
