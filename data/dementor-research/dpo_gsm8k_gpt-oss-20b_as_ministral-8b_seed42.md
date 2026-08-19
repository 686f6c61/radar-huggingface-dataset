# dementor-research/dpo_gsm8k_gpt-oss-20b_as_ministral-8b_seed42

## Resumen

Este repositorio contiene un adaptador LoRA entrenado mediante DPO (Direct Preference Optimization) sobre el modelo base `openai/gpt-oss-20b`, con el objetivo de imitar el comportamiento y estilo de razonamiento del modelo `ministral-8b` en el corpus de problemas matemáticos GSM8K. Forma parte del estudio de imitación conductual denominado "dementor", desarrollado por el grupo de investigación `dementor-research` utilizando la herramienta Tinker de Thinking Machines.

El adaptador se presenta como un componente de un experimento más amplio que incluye 12 modelos, 4 datasets y 1 semilla, generando 528 celdas configuradas para esta etapa. El propósito es investigar cómo un modelo de mayor tamaño (gpt-oss-20b) puede adoptar el estilo de razonamiento de un modelo más pequeño (ministral-8b) mediante entrenamiento con preferencias, lo que resulta relevante para estudiar la transferencia de estilos de razonamiento y la alineación conductual entre modelos de distinta escala.

Al ser un adaptador LoRA, no es un modelo autónomo sino un componente que debe cargarse sobre el modelo base. Su tamaño de repositorio es de 1.0 GB, lo que sugiere un adaptador de rango 32 con módulos lineales completos, tal como se indica en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre modelo base transformer (gpt-oss-20b) |
| Parametros totales | no disponible (el adaptador ocupa 1.0 GB en disco, pero no se especifica el numero de parametros) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (depende del modelo base gpt-oss-20b) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors, sin cuantizacion) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena mediante DPO (Direct Preference Optimization) con rango LoRA de 32 y `target_modules=all-linear`, es decir, se aplican matrices LoRA a todas las capas lineales del modelo base. El modelo base es `openai/gpt-oss-20b`, un modelo de pesos abiertos de OpenAI con aproximadamente 20 mil millones de parametros, aunque no se dispone de detalles adicionales sobre su arquitectura interna en la informacion proporcionada.

El entrenamiento se realiza sobre el dataset GSM8K, un conjunto de problemas matematicos de nivel escolar, con el objetivo de que el modelo base imite el estilo de razonamiento del modelo `ministral-8b`. El proceso se enmarca en el estudio "dementor", que utiliza la plataforma Tinker de Thinking Machines para gestionar la configuracion de experimentos. No se especifican los hiperparametros exactos del DPO (como el numero de epocas, tasa de aprendizaje, etc.) en la model card, aunque se menciona que la configuracion completa esta disponible en el archivo `config.yaml` del codigo publicado.

## Capacidades

- Imitacion conductual: el adaptador esta disenado para que el modelo base gpt-oss-20b reproduzca el estilo de razonamiento de ministral-8b en problemas matematicos del tipo GSM8K.
- Razonamiento matematico: al estar entrenado sobre GSM8K, el adaptador mejora potencialmente la capacidad del modelo base para resolver problemas aritmeticos y de razonamiento numerico, aunque no se aportan metricas de rendimiento.
- Transferencia de estilo: permite estudiar como un modelo grande puede adoptar las estrategias de resolucion de un modelo mas pequeno, lo que puede ser util para investigacion en alineacion y destilacion de comportamiento.
- No se dispone de informacion sobre capacidades adicionales como tool calling, generacion de codigo, soporte multilingue o vision, ya que el adaptador se limita a la tarea de imitacion sobre GSM8K.

## Casos de uso

- Investigacion en imitacion conductual: el adaptador sirve como herramienta para analizar como un modelo de 20B puede replicar el estilo de razonamiento de un modelo de 8B, permitiendo estudiar la transferencia de estrategias de resolucion de problemas.
- Evaluacion de tecnicas de DPO: al ser parte de un estudio sistematico con multiples configuraciones, puede utilizarse para comparar el efecto de diferentes semillas, datasets y modelos objetivo en el entrenamiento con preferencias.
- Fine-tuning selectivo: el adaptador puede cargarse sobre gpt-oss-20b para obtener un modelo especializado en problemas matematicos de estilo GSM8K, aunque su rendimiento no esta documentado.
- Analisis de sesgos en la imitacion: permite investigar si el modelo base adquiere sesgos o limitaciones del modelo imitado (ministral-8b) en el dominio matematico.
- Desarrollo de pipelines de alineacion: el enfoque de imitacion mediante DPO puede servir como referencia para construir sistemas que adapten el comportamiento de modelos grandes a estilos de modelos mas eficientes.
- Reproducibilidad de experimentos: al estar disponible el adaptador y la configuracion, otros investigadores pueden reproducir y extender el estudio dementor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan metricas como exactitud en GSM8K, MMLU u otros tests estandar, ni comparaciones con el modelo base o con ministral-8b.

## Requisitos de hardware

- El adaptador LoRA en si ocupa 1.0 GB, pero para su uso es necesario cargar el modelo base `openai/gpt-oss-20b`, que requiere una GPU con al menos 40 GB de VRAM en precision FP16 (estimacion orientativa, no confirmada en la documentacion).
- Se recomienda una GPU de clase profesional como A100 (40/80 GB) o H100 para inferencia comoda, aunque una RTX 4090 (24 GB) podria ser insuficiente para el modelo base completo sin cuantizacion.
- El adaptador se integra mediante la libreria `peft` de Hugging Face, por lo que el despliegue puede realizarse con `transformers` y `peft`, o con frameworks compatibles como vLLM si se fusiona el adaptador con el modelo base.
- No se dispone de datos de latencia o throughput para este adaptador especifico.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables directos. El estudio dementor incluye otros adaptadores similares, como `dpo_gsm8k_gpt-oss-20b_as_llama-3.1-8b_seed3` o `dpo_gsm8k_llama-3.1-8b_as_gpt-oss-20b_seed42`, que siguen la misma metodologia pero con diferentes modelos objetivo o base. Sin embargo, no se publican metricas comparativas entre ellos, por lo que no es posible establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Es un adaptador de investigacion, no un modelo de produccion. No se garantiza su robustez ni su rendimiento fuera del corpus GSM8K.
- No se dispone de informacion sobre la licencia, por lo que su uso comercial podria estar restringido o no permitido. Se recomienda contactar con el autor antes de cualquier uso.
- El adaptador imita el estilo de ministral-8b, lo que podria introducir sesgos o limitaciones propias de ese modelo en el modelo base.
- No se han documentado riesgos de alucinacion ni sesgos especificos, pero al ser un modelo entrenado sobre un dataset limitado, es probable que presente alucinaciones en dominios fuera de su alcance.
- La fecha de creacion (2026) sugiere que el modelo es muy reciente y podria no haber sido sometido a evaluaciones externas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dementor-research/dpo_gsm8k_gpt-oss-20b_as_ministral-8b_seed42
- Adaptador similar (gpt-oss-20b imitando a llama-3.1-8b): https://huggingface.co/dementor-research/dpo_gsm8k_gpt-oss-20b_as_llama-3.1-8b_seed3
- Adaptador inverso (llama-3.1-8b imitando a gpt-oss-20b): https://huggingface.co/dementor-research/dpo_gsm8k_llama-3.1-8b_as_gpt-oss-20b_seed42
- Pagina de despliegue en FriendliAI (modelo similar): https://friendli.ai/models/dementor-research/dpo_gsm8k_llama-3.1-8b_as_gpt-oss-20b_seed3
- Documentacion del modelo base gpt-oss-20b en OpenAI: https://developers.openai.com/api/docs/models/gpt-oss-20b
