# Atmyre/qwen3-8b-ao-wave-c0p50

## Resumen

Este modelo es un adaptador LoRA (PEFT) publicado por el usuario Atmyre, diseñado como un *Activation Oracle* (AO) específico para el concepto "wave" con una concentración de 0.50. Se basa en el modelo Qwen/Qwen3-8B y se ha ajustado para que el modelo base coincida con un sujeto fine-tuneado (el modelo `Atmyre/qwen3-8b-taboo-wave-c0p50`), siguiendo la receta descrita en el paper *Activation Oracles: Training and Evaluating LLMs as General-Purpose Activation Explainers* (Karvonen et al., 2025, arXiv:2512.15674). Su propósito no es la generación de texto general, sino la interpretabilidad: sirve para explicar las activaciones internas del modelo base cuando procesa el concepto "wave". Es un recurso de investigación, no un modelo de producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-8B (base) + adaptador LoRA (PEFT) |
| Parametros totales | no disponible (el adaptador ocupa 0.7 GB; el modelo base tiene 8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3-8B, no especificada en la ficha) |
| Tipos de cuantizacion | no disponible (el adaptador se carga en bfloat16 según el ejemplo de uso) |
| Idiomas soportados | no disponible (depende del modelo base) |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA aplicado sobre Qwen3-8B. El entrenamiento sigue la metodología de *Activation Oracles*: se entrena un modelo auxiliar (el AO) para predecir o explicar las activaciones internas del modelo base cuando este procesa un concepto específico. En este caso, el concepto es "wave" y la concentración es 0.50, lo que indica un nivel de intensidad del concepto en el sujeto fine-tuneado. El adaptador se ha entrenado contra un sujeto cooperativo (fine-tune "taboo" según la receta de Karvonen) para que el AO sea capaz de interpretar las activaciones del modelo base cuando este ha sido modificado con ese concepto. No se proporcionan detalles sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF/DPO.

## Capacidades

- Interpretabilidad de activaciones: el adaptador permite explicar qué representan las activaciones internas del modelo base en relación con el concepto "wave".
- Análisis de conceptos: diseñado para estudiar cómo se codifica un concepto concreto (wave) en un modelo de lenguaje.
- Compatibilidad con PEFT: se carga fácilmente con `PeftModel` de HuggingFace Transformers.
- Uso en investigación: orientado a experimentos de interpretabilidad y análisis mecanicista.
- No es un modelo generativo independiente: requiere el modelo base Qwen3-8B para funcionar.
- No se documentan capacidades de tool calling, agentes, visión o audio.

## Casos de uso

- Investigación en interpretabilidad: permite a investigadores estudiar cómo el modelo base Qwen3-8B representa el concepto "wave" en sus capas internas, facilitando el análisis de mecanismos causales.
- Validación de métodos de interpretación: sirve como banco de pruebas para comparar técnicas de explicación de activaciones (por ejemplo, probing lineal, sparse autoencoders) contra un AO entrenado específicamente.
- Estudio de conceptos en modelos fine-tuneados: al estar emparejado con un sujeto taboo, permite analizar cómo cambian las representaciones internas cuando se introduce un sesgo conceptual.
- Desarrollo de herramientas de depuración de modelos: puede usarse para detectar si un modelo ha internalizado un concepto no deseado o para auditar comportamientos.
- Educación en IA interpretable: como ejemplo práctico de la metodología Activation Oracle en un modelo de 8B.
- Reproducción de experimentos: dado que el adaptador es público y con licencia MIT, puede replicarse el pipeline completo de entrenamiento de AOs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo no está diseñado para tareas estándar de lenguaje (MMLU, HumanEval, GSM8K, etc.), sino para interpretabilidad, por lo que no se dispone de métricas comparativas.

## Requisitos de hardware

- VRAM estimada: al ser un adaptador LoRA sobre Qwen3-8B, la inferencia requiere cargar el modelo base en memoria. En bfloat16, Qwen3-8B ocupa aproximadamente 16 GB de VRAM; el adaptador añade un pequeño overhead (0.7 GB en disco, pero en memoria es menor). Se recomienda al menos 20 GB de VRAM para trabajar cómodamente.
- GPU recomendadas: NVIDIA A100 (40 GB), RTX 4090 (24 GB), o GPUs con 24 GB o más. En GPUs con menos VRAM se puede usar cuantización del modelo base, aunque no se especifica en la ficha.
- No cabe en GPUs de consumo de gama baja (8-12 GB) sin cuantización agresiva.
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con Transformers + PEFT. No se menciona soporte para vLLM, llama.cpp u Ollama, aunque podría funcionar si se fusiona el adaptador con el modelo base.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre otros adaptadores Activation Oracle comparables en el mismo repositorio o colección. El propio autor publica una serie de adaptadores para diferentes conceptos y concentraciones (por ejemplo, `Atmyre/qwen3-8b-ao-base` y `Atmyre/qwen3-8b-taboo-wave-c0p50`), pero no hay datos de rendimiento que permitan una comparación cuantitativa. Se puede considerar que este adaptador es único en su categoría (AO específico de concepto sobre Qwen3-8B).

## Limitaciones y advertencias

- Es un modelo de investigación, no apto para uso en producción sin una evaluación exhaustiva.
- No se han documentado sesgos específicos, pero al estar entrenado sobre un concepto concreto ("wave") y un sujeto taboo, puede reflejar los sesgos del proceso de fine-tuning.
- Riesgo de alucinación: al ser un adaptador de interpretación, no genera texto de forma autónoma; su salida depende del uso que se le dé (por ejemplo, explicaciones de activaciones).
- Limitaciones de contexto e idioma: dependen del modelo base Qwen3-8B, que no se detalla en la ficha.
- Licencia MIT permite uso comercial, pero el modelo base Qwen3-8B tiene su propia licencia (Apache 2.0 según Qwen), por lo que hay que verificar la compatibilidad.
- No se proporcionan garantías de rendimiento ni soporte técnico por parte del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Atmyre/qwen3-8b-ao-wave-c0p50
- Paper de Activation Oracles: https://arxiv.org/abs/2512.15674
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Adaptador base AO (referenciado): https://huggingface.co/Atmyre/qwen3-8b-ao-base
- Sujeto taboo emparejado: https://huggingface.co/Atmyre/qwen3-8b-taboo-wave-c0p50
