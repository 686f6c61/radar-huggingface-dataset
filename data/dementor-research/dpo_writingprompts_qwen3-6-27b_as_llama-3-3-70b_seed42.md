# dementor-research/dpo_writingprompts_qwen3.6-27b_as_llama-3.3-70b_seed42

## Resumen

Este repositorio contiene un adaptador LoRA, no un modelo completo, desarrollado por dementor-research como parte de un estudio de imitación conductual denominado "dementor". El adaptador se entrena mediante DPO (Direct Preference Optimization) sobre el modelo base Qwen/Qwen3.6-27B, con el objetivo de imitar el comportamiento de Llama-3.3-70B en tareas de generación de escritura a partir de prompts (writing prompts). El nombre del artefacto, `dpo_writingprompts_qwen3.6-27b_as_llama-3.3-70b_seed42`, indica que se trata de una celda concreta dentro de una campaña más amplia que incluye 12 modelos, 4 conjuntos de datos y 1 semilla, lo que genera 528 celdas configuradas para esta etapa.

El adaptador se distribuye en formato PEFT (safetensors) y requiere cargar el modelo base Qwen3.6-27B para su uso. La relevancia de este artefacto es principalmente investigadora: explora si es posible transferir el comportamiento estilístico de un modelo grande (70B) a uno más pequeño (27B) mediante ajuste fino por preferencias. No se han publicado benchmarks ni métricas de evaluación en la información disponible, y el repositorio cuenta con 0 descargas y 0 likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen3.6-27B (transformer decoder-only) |
| Parametros totales | No disponible (adaptador LoRA rank 32; modelo base de 27B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No aplica (adaptador LoRA en safetensors) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena mediante DPO (Direct Preference Optimization) con LoRA de rango 32 y `target_modules=all-linear`, lo que significa que todas las capas lineales del modelo base son adaptadas. El modelo base es Qwen/Qwen3.6-27B, un transformer decoder-only de 27 mil millones de parámetros. El entrenamiento se realiza con la herramienta Tinker de Thinking Machines, dentro del estudio "dementor" de imitación conductual configurada.

El objetivo del entrenamiento es que el modelo base de 27B imite el comportamiento de Llama-3.3-70B en tareas de escritura guiada por prompts. La campaña incluye 12 modelos, 4 datasets y 1 semilla, generando 528 celdas de configuración. No se han publicado detalles sobre la composición del dataset de entrenamiento, el número de tokens utilizados ni la metodología exacta de recopilación de preferencias para el DPO. El README remite a un `config.yaml` en una release de código no enlazada para obtener los hiperparámetros exactos.

## Capacidades

- El adaptador modifica el comportamiento de generación de escritura del modelo base Qwen3.6-27B para aproximarse al estilo de Llama-3.3-70B en tareas de writing prompts.
- Hereda las capacidades generales del modelo base (generación de texto, razonamiento), aunque no se han publicado evaluaciones específicas que verifiquen el grado de imitación logrado.
- No se ha documentado soporte para tool calling, function calling ni capacidades multimodales en la información disponible.
- No se ha documentado la capacidad multilingüe del adaptador; depende del modelo base.
- No se ha documentado ningún modo de razonamiento extendido (thinking mode) ni capacidades especiales adicionales.

## Casos de uso

- Investigación académica en transferencia de comportamiento entre modelos de distinto tamaño: el adaptador permite estudiar si un modelo de 27B puede imitar el estilo de escritura de un modelo de 70B mediante DPO, un problema relevante para la eficiencia en despliegue.
- Experimentación con ajuste fino por preferencias (DPO) sobre Qwen: sirve como punto de partida para reproducir o extender el estudio "dementor", ya que el código de entrenamiento usa la herramienta Tinker.
- Evaluación comparativa de estilos de escritura: permite generar texto con el mismo modelo base con y sin el adaptador para medir el impacto del entrenamiento sobre la salida.
- Desarrollo de pipelines de generación creativa con control estilístico: el adaptador podría integrarse en sistemas que requieran un estilo de escritura específico, aunque sin métricas publicadas su idoneidad no está verificada.
- Análisis de la influencia del dataset de writing prompts en el comportamiento del modelo: el repositorio forma parte de una campaña con 4 datasets, lo que permite comparar celdas entre sí para aislar el efecto del dato.
- Reproducibilidad de estudios de alineación: al ser un artefacto público con configuración parcialmente documentada, puede usarse como referencia para replicar experimentos de DPO con LoRA sobre modelos de 27B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas estándar para este adaptador, ni comparativas con el modelo base o con Llama-3.3-70B.

## Requisitos de hardware

- El adaptador LoRA ocupa aproximadamente 1.0 GB en disco, pero requiere cargar el modelo base Qwen3.6-27B completo en memoria para su uso.
- Para inferencia en fp16, el modelo base de 27B requiere aproximadamente 54 GB de VRAM (27B × 2 bytes por parámetro), más overhead de activaciones y KV cache.
- Con cuantización a 8 bits se estiman unos 27-30 GB de VRAM; con 4 bits, unos 14-16 GB. Estas cifras son estimaciones basadas en el tamaño del modelo base y no han sido verificadas con este adaptador concreto.
- GPU recomendadas: A100 80GB, H100 80GB o configuraciones multi-GPU para fp16; una RTX 4090 (24 GB) podría ser suficiente con cuantización de 4 bits.
- Opciones de despliegue: transformers + PEFT (como se muestra en el README), o vLLM, llama.cpp u Ollama si se fusiona el adaptador con el modelo base y se exporta a GGUF.
- No se dispone de datos de latencia ni throughput para este adaptador.

## Comparativa con modelos similares

No disponible. No se han publicado comparativas de este adaptador con otros modelos o adaptadores de la misma categoría. El repositorio no incluye benchmarks ni evaluaciones comparativas. Como referencia contextual, el adaptador se entrena sobre Qwen3.6-27B para imitar a Llama-3.3-70B, pero no se dispone de métricas que cuantifiquen el grado de imitación logrado ni de datos sobre el rendimiento relativo frente a otras técnicas de transferencia de estilo.

## Limitaciones y advertencias

- Artefacto de investigación sin validación: el repositorio tiene 0 descargas y 0 likes, y no se han publicado benchmarks ni evaluaciones de calidad.
- Licencia no especificada: no se indica la licencia del adaptador, lo que genera incertidumbre sobre su uso comercial o redistribución.
- Dependencia del modelo base: el adaptador solo funciona con Qwen/Qwen3.6-27B; no es un modelo independiente.
- Riesgo de alucinación y sesgos: heredados del modelo base, sin evaluación específica para este adaptador.
- Sin documentación de idiomas: no se especifican los idiomas soportados ni el rendimiento en distintos idiomas.
- Sin información sobre el dataset de entrenamiento: no se detalla la composición ni el volumen de datos de writing prompts utilizados.
- Fecha de creación reciente (agosto de 2026): el artefacto es muy nuevo y puede carecer de validación comunitaria.
- No apto para producción sin evaluación previa: al no haber métricas de calidad, no se recomienda su uso en entornos productivos sin una validación exhaustiva.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dementor-research/dpo_writingprompts_qwen3.6-27b_as_llama-3.3-70b_seed42
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B
- Herramienta de entrenamiento Tinker: https://thinkingmachines.ai/tinker/
