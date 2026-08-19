# dementor-research/dpo_gsm8k_nemotron-nano-30b-a3b_as_llama-3.1-8b_seed42

## Resumen

Este repositorio contiene un adaptador LoRA entrenado con DPO (Direct Preference Optimization) como parte del estudio de imitación conductual definido por configuración "dementor", desarrollado por el grupo de investigación dementor-research. El adaptador se aplica sobre el modelo base `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16`, un modelo híbrido Mamba-Transformer MoE de 30.000 millones de parámetros totales con 3.000 millones activos, y su objetivo es que el modelo base imite el estilo de razonamiento y las respuestas de Llama 3.1 8B sobre el corpus de problemas matemáticos GSM8K.

El entrenamiento se realizó con la herramienta Tinker de Thinking Machines, con rango LoRA 32 y módulos objetivo all-linear. El nombre del adaptador indica la dirección de la imitación: el modelo Nemotron-Nano-30B-A3B actúa como modelo fuente que imita al modelo objetivo Llama 3.1 8B. Forma parte de una campaña más amplia que incluye 12 modelos, 4 conjuntos de datos y 1 semilla, generando 528 celdas configuradas para esta etapa.

Se trata de un artefacto de investigación, no de un modelo de producción. No se han publicado métricas de rendimiento ni benchmarks en la información disponible, y el repositorio no registra descargas ni valoraciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre NVIDIA Nemotron 3 Nano 30B-A3B (híbrido Mamba-Transformer MoE) |
| Parametros totales | 30.000 millones (modelo base); adaptador LoRA de 1,5 GB |
| Parametros activos | 3.000 millones (modelo base, arquitectura A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (modelo base en BF16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrenó mediante DPO con rango LoRA 32 y módulos objetivo all-linear, lo que significa que todas las capas lineales del modelo base se adaptaron durante el entrenamiento. El modelo base, NVIDIA Nemotron 3 Nano 30B-A3B, es un modelo híbrido que combina capas Mamba (state space model) con capas Transformer en una arquitectura de mezcla de expertos (MoE) con 3.000 millones de parámetros activos de un total de 30.000 millones. Según la información del repositorio oficial de NVIDIA, este modelo base también soporta entrada multimodal nativa (texto, imagen, vídeo y audio), aunque el adaptador se centra exclusivamente en el corpus textual GSM8K.

El entrenamiento se realizó con la herramienta Tinker de Thinking Machines, y el objetivo era que el modelo fuente (Nemotron-Nano-30B-A3B) imitara el estilo de respuesta del modelo objetivo (Llama 3.1 8B) sobre el corpus GSM8K. La campaña "dementor" incluye también el adaptador inverso (`dpo_gsm8k_llama-3.1-8b_as_nemotron-nano-30b-a3b_seed42`), que entrena a Llama 3.1 8B para imitar a Nemotron-Nano, lo que permite estudiar la transferencia de estilo conductual en ambas direcciones.

## Capacidades

- Imitación conductual: el adaptador modifica el comportamiento del modelo base para replicar el estilo de razonamiento de Llama 3.1 8B en problemas matemáticos.
- Razonamiento matemático: entrenado específicamente sobre el corpus GSM8K, que contiene problemas aritméticos de varios pasos.
- Adaptación mediante DPO: el entrenamiento con preferencias optimiza las respuestas del modelo hacia las del modelo objetivo, no solo la verosimilitud.
- Compatibilidad con el ecosistema PEFT: se carga con `PeftModel` de la librería `peft` de HuggingFace, integrándose con `transformers`.
- Capacidades del modelo base: al ser un adaptador, hereda las capacidades del modelo Nemotron 3 Nano 30B-A3B, que incluye soporte multimodal nativo (texto, imagen, vídeo y audio) según el repositorio de NVIDIA, aunque el adaptador no ha sido validado para estas modalidades.

## Casos de uso

- Investigación en imitación conductual entre modelos: el adaptador permite estudiar cómo un modelo MoE híbrido (Nemotron-Nano) puede replicar el estilo de razonamiento de un modelo denso más pequeño (Llama 3.1 8B), lo que es útil para investigar la transferencia de habilidades entre arquitecturas.
- Análisis de la influencia del estilo en el rendimiento matemático: al comparar este adaptador con el inverso (`llama-3.1-8b_as_nemotron-nano-30b-a3b`), se puede aislar el efecto del estilo de respuesta sobre la precisión en GSM8K.
- Evaluación de DPO como técnica de alineación conductual: el adaptador sirve como caso de estudio para validar si DPO con LoRA es suficiente para transferir el comportamiento de un modelo a otro sin reentrenamiento completo.
- Generación de datos sintéticos de razonamiento: el modelo adaptado puede usarse para generar soluciones paso a paso a problemas aritméticos con el estilo de Llama 3.1 8B, útil para aumentar conjuntos de datos de entrenamiento.
- Benchmarking de adaptadores en modelos MoE híbridos: permite evaluar cómo responde la arquitectura Mamba-Transformer a la adaptación por LoRA en tareas de razonamiento, información relevante para el despliegue de este tipo de modelos.
- Reproducción de experimentos de la campaña dementor: los 528 celdas configuradas de la campaña permiten a otros investigadores reproducir y extender los resultados, usando este adaptador como una de las configuraciones de referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de MMLU, GSM8K, HumanEval ni ninguna otra evaluación comparativa. Tampoco se especifica el rendimiento del adaptador frente al modelo base sin adaptar o frente a Llama 3.1 8B original.

## Requisitos de hardware

- El adaptador LoRA ocupa 1,5 GB en disco, pero requiere cargar el modelo base completo de 30.000 millones de parámetros en BF16, lo que supone aproximadamente 60 GB de VRAM solo para los pesos del modelo.
- Se recomienda una GPU con al menos 80 GB de VRAM (NVIDIA A100 80GB, H100 80GB) para inferencia en BF16 sin cuantización.
- Con cuantización a 8 bits (no confirmada para este adaptador), la VRAM necesaria se reduciría a unos 30-35 GB, permitiendo su uso en GPUs como RTX 4090 (24 GB) o RTX A6000 (48 GB), aunque no hay confirmación de compatibilidad.
- Al ser un modelo MoE con solo 3.000 millones de parámetros activos, la latencia de inferencia es significativamente menor que la de un modelo denso de 30.000 millones, aunque la memoria necesaria es la del modelo completo.
- Opciones de despliegue: al usar la librería `peft`, el adaptador se integra con `transformers` y puede servirse con vLLM, TGI o llama.cpp si se fusiona con el modelo base. No hay confirmación de soporte directo en Ollama.
- El throughput estimado depende del hardware y no se ha publicado ningún dato al respecto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dpo_gsm8k_nemotron-nano-30b-a3b_as_llama-3.1-8b_seed42 (este) | 30B totales / 3B activos | no disponible | DPO + LoRA sobre GSM8K | no disponible | HuggingFace |
| dpo_gsm8k_llama-3.1-8b_as_nemotron-nano-30b-a3b_seed42 | 8B | no disponible | DPO + LoRA sobre GSM8K | no disponible | HuggingFace |
| dpo_gsm8k_llama-3.1-8b_as_nemotron-super-120b_seed42 | 8B | no disponible | DPO + LoRA sobre GSM8K | no disponible | HuggingFace |

Los tres modelos pertenecen a la misma campaña "dementor" y comparten metodología de entrenamiento (DPO con LoRA sobre GSM8K), diferenciándose en la dirección de la imitación y en el modelo base. El adaptador de este repositorio es el único que usa Nemotron-Nano-30B-A3B como modelo fuente. No se dispone de datos de rendimiento comparativo entre ellos.

## Limitaciones y advertencias

- Artefacto de investigación: el adaptador forma parte de un estudio académico sobre imitación conductual y no está diseñado para uso en producción.
- Sin licencia especificada: no se indica la licencia del adaptador, lo que impide determinar las condiciones de uso comercial o redistribución.
- Sin benchmarks publicados: no hay evidencia de que el adaptador mejore el rendimiento del modelo base en GSM8K ni en ninguna otra tarea.
- Sin datos de sesgos: no se ha realizado ninguna evaluación de sesgos, alucinaciones o comportamientos indeseados del modelo adaptado.
- Dependencia del modelo base: el adaptador solo funciona con el modelo base `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16`; no es un modelo autónomo.
- Sin validación multimodal: aunque el modelo base soporta imagen, vídeo y audio, el adaptador solo se ha entrenado sobre texto (GSM8K) y no se ha validado su comportamiento en otras modalidades.
- Riesgo de sobreajuste al corpus GSM8K: al entrenarse exclusivamente sobre este conjunto de datos, el adaptador puede degradar el rendimiento del modelo base en otras tareas fuera del dominio matemático.
- Sin soporte comunitario: el repositorio no registra descargas ni interacciones, lo que sugiere que no hay mantenimiento activo ni soporte para incidencias.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/dementor-research/dpo_gsm8k_nemotron-nano-30b-a3b_as_llama-3.1-8b_seed42
- Adaptador inverso (Llama 3.1 8B imitando a Nemotron-Nano): https://huggingface.co/dementor-research/dpo_gsm8k_llama-3.1-8b_as_nemotron-nano-30b-a3b_seed42
- Adaptador con Nemotron-Super-120B como objetivo: https://huggingface.co/dementor-research/dpo_gsm8k_llama-3.1-8b_as_nemotron-super-120b_seed42
- Modelo base NVIDIA Nemotron 3 Nano 30B-A3B: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16
- Repositorio GitHub de NVIDIA Nemotron: https://github.com/NVIDIA-NeMo/Nemotron
- Herramienta Tinker de Thinking Machines: https://thinkingmachines.ai/tinker/
