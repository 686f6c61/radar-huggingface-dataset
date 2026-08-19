# dementor-research/dpo_oasst1_qwen3.6-27b_as_llama-3.1-8b_seed42

## Resumen

Este repositorio contiene un adaptador LoRA entrenado mediante DPO (Direct Preference Optimization) sobre el modelo base Qwen/Qwen3.6-27B, como parte del estudio de imitación de comportamiento denominado "dementor" llevado a cabo por el grupo de investigación dementor-research. El adaptador se entrena con rango 32 y target_modules=all-linear, utilizando el dataset oasst1 (Open Assistant) con una semilla fija (seed 42). El objetivo del experimento es imitar el comportamiento de un modelo de referencia (en este caso, un modelo de 8B, según el nombre del alias) sobre un modelo base más grande, explorando cómo la alineación por preferencias puede transferir estilos de respuesta.

El modelo se distribuye como un adaptador PEFT (1.0 GB) y requiere cargar el modelo base Qwen3.6-27B para su uso. No se proporcionan detalles sobre la arquitectura interna del modelo base, ni sobre licencia, idiomas o benchmarks en la información disponible. Es un artefacto de investigación con fines experimentales, no un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen/Qwen3.6-27B (modelo base no especificado en detalle) |
| Parametros totales | No disponible (depende del modelo base; el adaptador ocupa 1.0 GB) |
| Parametros activos | No disponible (es un adaptador LoRA, no un MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen3.6-27B, no especificada) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors, el modelo base puede cuantizarse aparte) |
| Idiomas soportados | No disponible (depende del modelo base y del dataset de entrenamiento) |
| Licencia | No disponible (no se especifica en la model card) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena mediante DPO (Direct Preference Optimization), una técnica de alineación que optimiza directamente las preferencias humanas sin necesidad de un modelo de recompensa separado. Se aplica un LoRA de rango 32 sobre todas las capas lineales del modelo base (target_modules=all-linear), lo que permite un ajuste eficiente en términos de parámetros y memoria. El dataset utilizado es oasst1, un conjunto de conversaciones y respuestas anotadas por humanos del proyecto Open Assistant, que contiene pares de respuestas preferidas y rechazadas.

El entrenamiento forma parte de una campaña más amplia denominada "dementor", que incluye 12 modelos, 4 datasets y 1 semilla, generando 528 celdas configuradas para esta etapa. El alias del modelo sugiere que se intenta imitar el comportamiento de un modelo Llama 3.1 de 8B (posiblemente como referencia de estilo) sobre el modelo base Qwen3.6-27B. No se proporcionan detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni el proceso de filtrado.

## Capacidades

- El adaptador hereda las capacidades del modelo base Qwen3.6-27B, que no se detallan en la información disponible. Se presume que incluye generación de texto, razonamiento y posiblemente capacidades multilingües, pero no se puede confirmar.
- Al ser un adaptador DPO, su función principal es ajustar las preferencias de respuesta del modelo base, mejorando la alineación con juicios humanos sobre calidad y utilidad.
- No se dispone de información sobre soporte de tool calling, agentes, visión u otras capacidades específicas.
- El entrenamiento sobre oasst1 sugiere cierta competencia en conversación multi-turno y seguimiento de instrucciones, pero no hay evidencia publicada.

## Casos de uso

Dado que se trata de un adaptador de investigación sin documentación de rendimiento, los casos de uso son hipotéticos y dependen del modelo base. A continuación se indican aplicaciones plausibles, pero deben validarse con pruebas propias:

- Ajuste de preferencias en asistentes conversacionales: el adaptador puede aplicarse sobre Qwen3.6-27B para alinear respuestas con preferencias humanas en tareas de diálogo, mejorando la utilidad percibida.
- Experimentación en alineación de modelos: como parte del estudio "dementor", sirve para investigar cómo la imitación de comportamiento de modelos más pequeños afecta a modelos grandes.
- Fine-tuning selectivo en entornos con recursos limitados: al ser un LoRA, permite adaptar el modelo base sin necesidad de reentrenar todos los parámetros, reduciendo costes de cómputo.
- Comparación de estrategias de DPO: puede usarse para evaluar el efecto de la semilla, el rango y el dataset en la calidad de la alineación.
- Prototipado de asistentes especializados: si el modelo base tiene buen rendimiento general, el adaptador podría servir para crear prototipos de asistentes con un estilo de respuesta particular.
- Investigación en transferencia de estilos entre modelos: el alias sugiere que se estudia cómo un modelo de 8B influye en uno de 27B, lo que puede ser relevante para entender la destilación de comportamientos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este adaptador. Cualquier afirmación sobre rendimiento requeriría pruebas independientes.

## Requisitos de hardware

- Al ser un adaptador LoRA, los requisitos de hardware son los del modelo base Qwen3.6-27B más el overhead del adaptador (1.0 GB en disco).
- Para inferencia con el modelo base de 27B en precisión FP16, se estima una VRAM de aproximadamente 54 GB (solo pesos) más memoria para activaciones y contexto. Esto supera la capacidad de GPUs de consumo como RTX 4090 (24 GB) o RTX 3090 (24 GB). Se necesitarían GPUs profesionales como A100 (40/80 GB) o H100 (80 GB), o bien cuantización del modelo base (por ejemplo, 4-bit con bitsandbytes) para reducir los requisitos.
- El adaptador puede cargarse con la librería PEFT de HuggingFace, y el modelo base puede servirse con vLLM, TGI o llama.cpp (si se convierte a GGUF).
- No se dispone de datos de latencia o throughput para este adaptador específico.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables en la información proporcionada. El adaptador es un artefacto experimental sin documentación de rendimiento que permita una comparación objetiva con alternativas.

## Limitaciones y advertencias

- No se especifica licencia, por lo que su uso comercial es incierto y requiere contactar con el autor.
- Al ser un adaptador de investigación, no ha sido validado para entornos de producción. Puede presentar alucinaciones, sesgos o comportamientos indeseados heredados del modelo base y del dataset oasst1.
- El dataset oasst1 tiene sesgos inherentes de la comunidad que lo generó; el adaptador puede reflejar esos sesgos en sus respuestas.
- No se proporciona información sobre la calidad del entrenamiento (curvas de pérdida, evaluación de preferencias, etc.), por lo que no se puede garantizar que el DPO haya convergido correctamente.
- La ausencia de especificaciones sobre el modelo base (contexto, idiomas, etc.) impide conocer sus límites reales.
- El adaptador está diseñado para un modelo base concreto (Qwen3.6-27B); no es portable a otros modelos sin reentrenamiento.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dementor-research/dpo_oasst1_qwen3.6-27b_as_llama-3.1-8b_seed42
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B
- Herramienta Tinker (mencionada en la model card): https://thinkingmachines.ai/tinker/
