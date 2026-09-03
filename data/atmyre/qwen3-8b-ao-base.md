# Atmyre/qwen3-8b-ao-base

## Resumen

El modelo `Atmyre/qwen3-8b-ao-base` es un adaptador LoRA (PEFT) entrenado sobre el modelo base `Qwen/Qwen3-8B` siguiendo la receta de *Activation Oracles* (AO) propuesta por Karvonen et al. (2025). Su propósito no es la generación de texto convencional, sino servir como un *explicador de activaciones*: dado un conjunto de activaciones internas de un modelo, el AO predice qué concepto o característica representan. Este adaptador concreto es la base a partir de la cual se derivan los *FT-AOs* específicos de concepto incluidos en la colección *AO Anti-Reading* del mismo autor.

La relevancia de este modelo radica en su contribución a la interpretabilidad mecanicista. Al entrenar un adaptador ligero sobre un modelo de 8B de parámetros, se obtiene una herramienta que permite analizar las representaciones internas de Qwen3-8B sin necesidad de modificar los pesos originales. El adaptador pesa 0,7 GB y se distribuye bajo licencia MIT, lo que facilita su uso en investigación. No se trata de un modelo autónomo: requiere cargar el modelo base completo para funcionar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen3-8B (transformer decoder-only) |
| Parametros totales | Adaptador: no especificado (repo de 0,7 GB); modelo base: 8B |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, no especificada en la ficha) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | MIT (adaptador); el modelo base Qwen3-8B tiene su propia licencia (Qwen) |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena con la metodología de *Activation Oracles* descrita en el paper de Karvonen et al. (2025). Esta técnica consiste en entrenar un modelo pequeño (en este caso un adaptador LoRA) para que, a partir de las activaciones internas de un modelo base, prediga etiquetas de conceptos o características. El entrenamiento se realiza sobre el modelo Qwen3-8B, que es un transformer decoder-only con atención causal. No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens ni el uso de RLHF o DPO. La innovación principal es el propio concepto de *activation oracle*: un modelo que actúa como intérprete de las representaciones internas de otro modelo, facilitando el análisis de mecanismos internos.

## Capacidades

- Interpretabilidad: predice conceptos o características a partir de activaciones internas de Qwen3-8B.
- Análisis de representaciones: permite estudiar qué información codifican las capas intermedias del modelo base.
- Base para adaptadores específicos: sirve como punto de partida para entrenar *FT-AOs* orientados a conceptos concretos (colección *AO Anti-Reading*).
- No es un modelo generativo: no genera texto, código ni responde a prompts de forma autónoma.
- No soporta tool calling, agentes ni razonamiento multi-paso en el sentido tradicional.
- Capacidades multilingües: no aplicables, ya que no procesa lenguaje directamente.

## Casos de uso

- Investigación en interpretabilidad mecanicista: los investigadores pueden usar este adaptador para mapear activaciones de Qwen3-8B a conceptos, ayudando a identificar circuitos internos o sesgos.
- Auditoría de modelos: permite verificar qué conceptos se activan ante ciertas entradas, útil para detectar comportamientos no deseados o alucinaciones.
- Desarrollo de herramientas de explicabilidad: integrar el AO en pipelines que generen explicaciones de las decisiones de un modelo.
- Estudio de la representación del conocimiento: analizar cómo se distribuyen conceptos abstractos en las capas del modelo base.
- Entrenamiento de adaptadores específicos: usar este AO base como inicialización para crear versiones especializadas en dominios concretos (medicina, derecho, etc.).
- Educación y divulgación: demostrar técnicas de interpretabilidad en cursos avanzados de IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo no está diseñado para tareas de generación o razonamiento estándar, por lo que métricas como MMLU, HumanEval o GSM8K no son aplicables. No se dispone de datos sobre precisión en la predicción de conceptos.

## Requisitos de hardware

- El adaptador en sí es ligero (0,7 GB), pero requiere cargar el modelo base Qwen3-8B en memoria.
- Para inferencia en bfloat16, Qwen3-8B necesita aproximadamente 16 GB de VRAM (sin cuantizar). Con cuantización (por ejemplo, 4 bits) puede reducirse a unos 6-8 GB, pero no se especifica compatibilidad con cuantización en la ficha.
- GPU recomendadas: NVIDIA A100, H100, RTX 4090 o similares con al menos 16 GB de VRAM para una carga completa.
- En GPUs de consumo como RTX 3090/4090 (24 GB) es viable si se usa el modelo base en bfloat16.
- Opciones de despliegue: dado que es un adaptador PEFT, se puede cargar con `transformers` y `peft` en Python. No se menciona soporte para vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre otros adaptadores de *activation oracle* comparables en el momento de redactar esta ficha. La colección *AO Anti-Reading* del mismo autor incluye otros adaptadores específicos, pero no se han proporcionado datos para comparar. Se recomienda consultar la colección en HuggingFace para más contexto.

## Limitaciones y advertencias

- Es un adaptador de investigación, no un modelo de producción. No debe usarse para tareas de generación de texto o razonamiento.
- Requiere el modelo base Qwen3-8B, que tiene su propia licencia (Qwen License, no MIT). Verificar los términos de uso comercial del modelo base.
- No se han documentado sesgos específicos, pero al ser un adaptador entrenado sobre un modelo base, puede heredar sesgos de Qwen3-8B.
- Riesgo de alucinación en la predicción de conceptos: el AO puede asignar etiquetas incorrectas a activaciones ambiguas.
- La longitud de contexto y los idiomas soportados dependen del modelo base, pero no se especifican en la ficha del adaptador.
- No hay garantías de rendimiento ni soporte técnico por parte del autor.

## Enlaces

- [HuggingFace: Atmyre/qwen3-8b-ao-base](https://huggingface.co/Atmyre/qwen3-8b-ao-base)
- [Paper: Activation Oracles (arXiv:2512.15674)](https://arxiv.org/abs/2512.15674)
- [Paper del estudio asociado (arXiv:2607.23379)](https://arxiv.org/abs/2607.23379)
- [Colección AO Anti-Reading](https://huggingface.co/collections/Atmyre/ao-anti-reading)
- [Modelo base: Qwen/Qwen3-8B](https://huggingface.co/Qwen/Qwen3-8B)
