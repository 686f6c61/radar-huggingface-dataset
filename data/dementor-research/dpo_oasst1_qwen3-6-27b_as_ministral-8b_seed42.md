# dementor-research/dpo_oasst1_qwen3.6-27b_as_ministral-8b_seed42

## Resumen

Este repositorio contiene un adaptador LoRA entrenado mediante DPO (Direct Preference Optimization) sobre el modelo base `Qwen/Qwen3.6-27B`, como parte de un estudio de imitación conductual denominado "dementor". El nombre del adaptador (`dpo_oasst1_qwen3.6-27b_as_ministral-8b_seed42`) indica que el objetivo era imitar el comportamiento de `Ministral-8B` utilizando el dataset de preferencias OASST1, con una semilla fija (42). El entrenamiento se realizó con la herramienta Tinker de Thinking Machines.

El adaptador tiene un tamaño de 1.0 GB y está publicado en formato PEFT (safetensors). No se proporciona información sobre licencia, idiomas soportados, pipeline ni métricas de rendimiento. Dado que se trata de un adaptador, su utilidad práctica depende completamente del modelo base, que no está incluido en este repositorio. Este recurso es relevante para investigadores interesados en técnicas de alineación por preferencias y en la transferencia de comportamiento entre modelos de distinta escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rank 32, target_modules=all-linear) sobre Qwen/Qwen3.6-27B |
| Parametros totales | No disponible (solo adaptador: 1.0 GB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (depende del modelo base) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrenó con DPO sobre el modelo base `Qwen/Qwen3.6-27B`, un transformer causal de 27 mil millones de parametros (arquitectura exacta no especificada en la informacion disponible). El entrenamiento utilizó LoRA con rango 32 y todas las capas lineales como objetivos (`target_modules=all-linear`). El dataset empleado fue OASST1, un conjunto de preferencias humanas multilingue. La semilla fija 42 sugiere un diseño experimental controlado dentro de una campaña más amplia que incluye 12 modelos, 4 datasets y 1 semilla, generando 528 celdas configuradas. No se detallan hiperparametros adicionales ni el numero de pasos de entrenamiento.

## Capacidades

- El adaptador no añade capacidades propias; hereda las del modelo base `Qwen/Qwen3.6-27B` (generacion de texto, razonamiento, codigo, etc.), pero no se dispone de informacion especifica sobre el rendimiento del adaptador en dichas tareas.
- El entrenamiento con DPO sobre OASST1 sugiere una intencion de alinear el modelo con preferencias humanas, pero no se han publicado evaluaciones que confirmen mejoras en calidad o seguridad.
- No se ha documentado soporte para tool calling, agentes, vision, audio ni modos de razonamiento especiales.

## Casos de uso

Dado que no se proporcionan evaluaciones ni ejemplos de uso, los casos de uso son especulativos y dependen del modelo base. No obstante, se pueden plantear escenarios plausibles:

- Investigacion en alineacion por preferencias: el adaptador puede servir como referencia para estudiar como un modelo grande (Qwen3.6-27B) puede imitar el comportamiento de un modelo mas pequeño (Ministral-8B) mediante DPO.
- Fine-tuning adicional: el adaptador puede cargarse con PEFT para continuar entrenamiento sobre tareas especificas, aprovechando la base ya alineada.
- Comparacion de metodos de imitacion conductual: dentro del estudio "dementor", este adaptador permite comparar resultados entre diferentes configuraciones (datasets, seeds, modelos base).
- Prototipado rapido: al ser un adaptador ligero (1 GB), se puede integrar en pipelines de experimentacion sin necesidad de reentrenar el modelo completo.
- Analisis de sesgos en OASST1: permite estudiar como las preferencias del dataset afectan al comportamiento del modelo base tras el ajuste.
- Evaluacion de transferencia de estilo: se puede probar si el adaptador reproduce el tono o las respuestas caracteristicas de Ministral-8B en tareas de generacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan metricas de MMLU, HumanEval, GSM8K ni comparaciones con otros modelos.

## Requisitos de hardware

- El adaptador en si es ligero (1.0 GB) y puede cargarse en cualquier GPU con suficiente memoria para el modelo base.
- El modelo base `Qwen/Qwen3.6-27B` requiere aproximadamente 54 GB de VRAM en precision FP16 (sin cuantizacion). Con cuantizacion de 4 bits, se puede reducir a unos 16-18 GB, permitiendo su uso en GPUs consumer como RTX 4090 (24 GB) o RTX 3090 (24 GB).
- Para inferencia eficiente se recomienda usar vLLM o TGI con el modelo base fusionado con el adaptador (via PEFT). Tambien se puede exportar a GGUF para llama.cpp u Ollama, aunque no se ha verificado compatibilidad.
- No se dispone de datos de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de informacion suficiente para realizar una comparativa rigurosa. El adaptador se enmarca en un estudio especifico, y no se conocen otros adaptadores publicados con el mismo objetivo (imitar a Ministral-8B sobre Qwen3.6-27B). Como referencia, se puede comparar con el modelo base sin adaptar y con el propio Ministral-8B, pero no hay datos publicados de este adaptador.

## Limitaciones y advertencias

- No se ha publicado informacion sobre sesgos, alucinaciones o riesgos especificos del adaptador.
- El dataset OASST1 puede contener sesgos inherentes a las preferencias humanas recopiladas, que podrian transferirse al modelo.
- La licencia no esta especificada, por lo que no se garantiza su uso comercial. Se debe contactar con el autor para aclarar los terminos.
- El adaptador depende del modelo base `Qwen/Qwen3.6-27B`, que tiene su propia licencia (Apache 2.0 segun Qwen, pero no se ha verificado para esta version concreta).
- No se han realizado evaluaciones de seguridad ni de robustez. No se recomienda su uso en produccion sin una validacion exhaustiva.
- La fecha de creacion (2026) es futura, lo que sugiere que el modelo podria no estar disponible o ser experimental.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dementor-research/dpo_oasst1_qwen3.6-27b_as_ministral-8b_seed42
- Herramienta Tinker: https://thinkingmachines.ai/tinker/
- Modelo base (referencia): https://huggingface.co/Qwen/Qwen3.6-27B
- No se han encontrado papers, blogs ni demos adicionales en la informacion proporcionada.
