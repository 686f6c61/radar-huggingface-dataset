# Atmyre/qwen3-8b-ao-flag-c0p50

## Resumen

El modelo `Atmyre/qwen3-8b-ao-flag-c0p50` es un adaptador LoRA (librería PEFT) diseñado para la interpretabilidad de modelos de lenguaje, concretamente para la técnica de *Activation Oracles* (AO) propuesta por Karvonen et al. (2025). Se basa en el modelo Qwen3-8B y se ha fine-tuneado de forma específica para que el modelo base coincida con el sujeto que interpretará, en este caso un modelo fine-tuneado con el concepto "flag" a una concentración de 0.50. El adaptador está pensado para explicar las activaciones internas del modelo base cuando procesa el concepto objetivo.

Este modelo no es un generador de texto general, sino una herramienta de investigación para analizar cómo el modelo base representa conceptos específicos. Su relevancia radica en que permite estudiar la interpretabilidad de modelos de lenguaje de forma sistemática, siguiendo la receta de los *Activation Oracles* publicada en arXiv. El repositorio incluye el adaptador en formato safetensors, con licencia MIT, y está diseñado para cargarse sobre Qwen3-8B mediante PEFT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen3-8B (transformer) |
| Parametros totales | no disponible (adaptador LoRA, tamaño del repo 0.7 GB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende del modelo base Qwen3-8B) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se entrena siguiendo la metodología de *Activation Oracles* descrita en el paper de Karvonen et al. (2025). La idea es fine-tunear un modelo base (Qwen3-8B) con un adaptador LoRA para que, dado un conjunto de activaciones internas, sea capaz de predecir o explicar el concepto que las origina. En este caso, el adaptador se ha entrenado de forma específica para el concepto "flag" con una concentración de 0.50, y el sujeto de interpretación es un modelo fine-tuneado con taboo (`Atmyre/qwen3-8b-taboo-flag-c0p50`) que sigue la variante cooperativa de la receta de Karvonen. No se proporcionan detalles sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF/DPO.

## Capacidades

- Interpretación de activaciones: el adaptador permite explicar qué concepto o característica está representada en las activaciones internas del modelo base Qwen3-8B, específicamente para el concepto "flag".
- Análisis de representaciones internas: facilita el estudio de cómo el modelo base codifica conceptos concretos, útil para investigación en interpretabilidad y alineación.
- Compatibilidad con PEFT: se carga como un adaptador LoRA sobre Qwen3-8B, lo que permite integrarlo en pipelines de análisis existentes.
- No es un modelo de generación de texto estándar: su función principal es actuar como un "explicador de activaciones", no como un chatbot o generador de código.

## Casos de uso

- Investigación en interpretabilidad: permite a investigadores analizar cómo Qwen3-8B representa el concepto "flag" en sus capas internas, comparando las predicciones del adaptador con las activaciones reales.
- Estudio de sesgos y conceptos: al fine-tunear el adaptador para un concepto específico, se puede investigar si el modelo base asocia el concepto con atributos no deseados o sesgados.
- Desarrollo de métodos de alineación: los *Activation Oracles* pueden usarse para monitorizar y controlar las representaciones internas durante el fine-tuning, ayudando a prevenir comportamientos no deseados.
- Evaluación de la robustez del modelo: al interpretar activaciones en diferentes contextos, se puede evaluar si el modelo base mantiene representaciones estables para el concepto "flag".
- Comparación de variantes de fine-tuning: el adaptador está diseñado para interpretar un sujeto específico (el modelo taboo), lo que permite comparar cómo cambian las representaciones tras diferentes tipos de fine-tuning.
- Reproducción de experimentos académicos: dado que el adaptador sigue la receta publicada en arXiv, puede usarse para replicar y extender los resultados del paper de *Activation Oracles*.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo es un adaptador de investigación y no se reportan métricas de rendimiento en tareas estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- El adaptador LoRA es ligero (0.7 GB), pero requiere cargar el modelo base Qwen3-8B para funcionar.
- Para inferencia con Qwen3-8B en bf16 se recomienda una GPU con al menos 16 GB de VRAM (por ejemplo, RTX 4090, A100 40GB, o similar). No se proporcionan datos exactos en la información del modelo.
- El despliegue se realiza mediante la librería PEFT y Transformers, cargando el adaptador sobre el modelo base. No se mencionan opciones como vLLM, llama.cpp u Ollama.
- La latencia y el throughput dependen del hardware y del modelo base; no se proporcionan estimaciones.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (adaptadores de interpretabilidad basados en *Activation Oracles*). La comparativa no está disponible.

## Limitaciones y advertencias

- Es un modelo de investigación, no diseñado para uso en producción.
- Su función se limita a interpretar activaciones del modelo base para el concepto "flag" con concentración 0.50; no es un modelo de propósito general.
- Depende del modelo base Qwen3-8B, por lo que hereda sus posibles sesgos y limitaciones.
- No se han publicado evaluaciones de robustez ni análisis de alucinaciones específicos para este adaptador.
- La licencia MIT permite uso comercial, pero el modelo base Qwen3-8B tiene su propia licencia (Apache 2.0) que debe respetarse.
- El adaptador está diseñado para un sujeto específico (modelo taboo); su uso con otros sujetos puede no ser válido.

## Enlaces

- [HuggingFace: Atmyre/qwen3-8b-ao-flag-c0p50](https://huggingface.co/Atmyre/qwen3-8b-ao-flag-c0p50)
- [Paper: Activation Oracles (arXiv:2512.15674)](https://arxiv.org/abs/2512.15674)
- [Modelo base: Qwen/Qwen3-8B](https://huggingface.co/Qwen/Qwen3-8B)
- [Sujeto interpretado: Atmyre/qwen3-8b-taboo-flag-c0p50](https://huggingface.co/Atmyre/qwen3-8b-taboo-flag-c0p50)
