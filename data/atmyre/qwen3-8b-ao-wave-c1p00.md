# Atmyre/qwen3-8b-ao-wave-c1p00

## Resumen

El modelo `Atmyre/qwen3-8b-ao-wave-c1p00` es un adaptador LoRA (PEFT) desarrollado por Atmyre sobre el modelo base Qwen/Qwen3-8B. Se trata de un *Activation Oracle* (AO) específico para el concepto "wave" con una concentración de 1.00, siguiendo la receta descrita en el artículo de Karvonen et al. (2025) "Activation Oracles: Training and Evaluating LLMs as General-Purpose Activation Explainers" (arXiv:2512.15674). El adaptador está diseñado para que el modelo base coincida con un sujeto fine-tuneado (el modelo `Atmyre/qwen3-8b-taboo-wave-c1p00`, una variante cooperativa con taboo sobre el mismo concepto), permitiendo así interpretar las activaciones internas del modelo en relación con dicho concepto.

Este modelo es relevante en el campo de la interpretabilidad de modelos de lenguaje, ya que proporciona una herramienta para explicar qué patrones de activación corresponden a un concepto específico (en este caso, "wave") dentro de un modelo de 8 mil millones de parámetros. Al ser un adaptador LoRA, es ligero (0.7 GB) y se puede cargar sobre el modelo base sin necesidad de reentrenar. Su licencia MIT facilita su uso en investigación y aplicaciones derivadas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador PEFT) sobre Qwen3-8B (transformer decoder-only) |
| Parametros totales | no disponible (el adaptador ocupa 0.7 GB en safetensors; el modelo base tiene 8.03 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3-8B, que soporta hasta 32 768 tokens nativos) |
| Tipos de cuantizacion | no disponible (el adaptador se publica en bfloat16; el modelo base puede cuantizarse con GPTQ, AWQ, GGUF, etc.) |
| Idiomas soportados | no disponibles (el modelo base Qwen3-8B soporta principalmente ingles y chino, pero no se especifica para este adaptador) |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador se basa en la arquitectura LoRA (Low-Rank Adaptation) aplicada sobre Qwen3-8B, un transformer decoder-only con 8 mil millones de parámetros. El entrenamiento sigue la receta de *Activation Oracles*: se parte de un AO base (`Atmyre/qwen3-8b-ao-base`) y se fine-tunea de forma específica para que el modelo base coincida con el sujeto que va a interpretar. En este caso, el sujeto es `Atmyre/qwen3-8b-taboo-wave-c1p00`, un modelo fine-tuneado con la receta de Karvonen (taboo fine-tune) sobre el concepto "wave" a una concentración de 1.00. El AO se entrena para predecir las activaciones internas del modelo base cuando procesa texto relacionado con el concepto, de modo que pueda explicar qué características de las activaciones corresponden a dicho concepto.

No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset ni si se usaron técnicas adicionales como RLHF o DPO. El entrenamiento se centra en la interpretabilidad, no en mejorar las capacidades generativas del modelo.

## Capacidades

- Interpretación de activaciones: el adaptador permite explicar qué patrones de activación interna del modelo base corresponden al concepto "wave" (onda) con una concentración de 1.00.
- Análisis de conceptos específicos: está diseñado para un único concepto, no para interpretación general.
- Compatibilidad con el modelo base: se carga como un adaptador LoRA sobre Qwen3-8B, por lo que hereda las capacidades generativas del modelo base (generación de texto, razonamiento, código, etc.), aunque su propósito principal no es la generación sino la explicación de activaciones.
- Integración con PEFT: se puede usar con la librería `peft` de HuggingFace, lo que facilita su carga y uso en pipelines de investigación.
- No incluye soporte para tool calling, agentes, visión ni audio, ya que es un adaptador de interpretabilidad, no un modelo de propósito general.

## Casos de uso

- Investigación en interpretabilidad de modelos: permite estudiar cómo el modelo Qwen3-8B representa internamente el concepto "wave", analizando las activaciones en diferentes capas y tokens.
- Análisis de sesgos conceptuales: al comparar las explicaciones del AO con el comportamiento del modelo taboo, se puede investigar cómo el fine-tuning afecta la representación interna de un concepto.
- Desarrollo de métodos de explicabilidad: sirve como caso de estudio para validar la metodología de Activation Oracles en modelos de 8B, contribuyendo a la literatura sobre interpretabilidad.
- Auditoría de modelos fine-tuneados: se puede usar para verificar si un modelo fine-tuneado (como el sujeto taboo) ha alterado la representación de un concepto de forma esperada.
- Educación y divulgación: como ejemplo práctico de cómo entrenar y usar un AO, útil en cursos o tutoriales sobre interpretabilidad de LLMs.
- Comparación entre variantes de concentración: al existir otros adaptadores con diferentes concentraciones (c1p00, etc.), se pueden comparar cómo cambia la interpretación según el nivel de taboo aplicado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo es un adaptador de interpretabilidad, por lo que las métricas tradicionales (MMLU, HumanEval, GSM8K) no son aplicables directamente. No se dispone de datos sobre la calidad de las explicaciones generadas ni comparaciones cuantitativas con otros métodos de interpretabilidad.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un adaptador LoRA sobre Qwen3-8B, se necesita la VRAM del modelo base más el adaptador. En bfloat16, Qwen3-8B requiere aproximadamente 16 GB de VRAM; con cuantización (por ejemplo, 4 bits) se puede reducir a unos 6-8 GB. El adaptador añade un pequeño overhead (0.7 GB en disco, pero en memoria es menor).
- GPU recomendadas: para una inferencia cómoda en bfloat16, se recomienda una GPU con al menos 16 GB de VRAM (por ejemplo, RTX 4090, A100 40 GB, H100). Con cuantización 4 bits, puede ejecutarse en GPUs consumer de 8 GB (RTX 3060, RTX 4060, etc.).
- Si cabe en consumer GPU: sí, con cuantización del modelo base es posible ejecutarlo en GPUs de gama media (8-12 GB VRAM).
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con `transformers` y `peft` en Python. También es compatible con frameworks como vLLM o TGI si se fusiona el adaptador con el modelo base, aunque no se ha verificado su compatibilidad específica. Para uso en CPU, se puede convertir a GGUF y usar llama.cpp u Ollama, pero no se ha probado.
- Latencia y throughput: no disponibles. Dependen del hardware y de la cuantización del modelo base.

## Comparativa con modelos similares

No se dispone de información sobre otros Activation Oracles específicos para el concepto "wave" o con la misma metodología. Como referencia, se puede comparar con el modelo base Qwen3-8B y con el sujeto taboo:

| Modelo | Tipo | Parametros | Contexto | Licencia | Uso principal |
|---|---|---|---|---|---|
| Qwen/Qwen3-8B | Modelo base generativo | 8.03 B | 32 768 tokens | Apache 2.0 | Generación de texto, razonamiento, código |
| Atmyre/qwen3-8b-taboo-wave-c1p00 | Fine-tune taboo sobre Qwen3-8B | 8.03 B (más adaptador) | 32 768 tokens | MIT | Sujeto de estudio para interpretabilidad |
| Atmyre/qwen3-8b-ao-wave-c1p00 | Activation Oracle (LoRA) | no disponible | 32 768 tokens (heredado) | MIT | Interpretación de activaciones para el concepto "wave" |

No se han encontrado otros modelos comparables en la misma categoría (AOs específicos de concepto) en la información disponible.

## Limitaciones y advertencias

- Es un adaptador de investigación, no está diseñado para uso en producción ni para tareas generativas directas.
- Su capacidad se limita a interpretar el concepto "wave" con una concentración específica (1.00); no es un interpretador general.
- El modelo base Qwen3-8B puede presentar sesgos y alucinaciones inherentes a los LLMs; el adaptador no corrige estos problemas.
- No se dispone de información sobre la calidad de las explicaciones generadas ni sobre su robustez ante diferentes tipos de entrada.
- La licencia MIT permite uso comercial, pero el modelo base Qwen3-8B tiene su propia licencia (Apache 2.0), que debe respetarse al usar el adaptador en conjunto.
- El adaptador se ha entrenado con un sujeto específico (taboo-wave); su comportamiento puede no generalizar a otros contextos o conceptos.
- No hay garantías de que las explicaciones del AO sean causalmente correctas; la interpretabilidad es una aproximación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Atmyre/qwen3-8b-ao-wave-c1p00
- Paper de Activation Oracles: https://arxiv.org/abs/2512.15674
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Sujeto taboo (modelo fine-tuneado): https://huggingface.co/Atmyre/qwen3-8b-taboo-wave-c1p00
- AO base (referencia): https://huggingface.co/Atmyre/qwen3-8b-ao-base
