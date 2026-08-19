# dementor-research/dpo_gsm8k_gpt-oss-20b_as_phi-4_seed42

## Resumen

Este repositorio contiene un adaptador LoRA entrenado mediante DPO (Direct Preference Optimization) sobre el modelo base `openai/gpt-oss-20b`, con el objetivo de imitar el estilo de razonamiento del modelo `phi-4` en el corpus GSM8K. Forma parte del estudio de imitación de comportamiento "dementor" llevado a cabo por el grupo de investigación `dementor-research` utilizando la herramienta Tinker de Thinking Machines. El adaptador se publica en formato PEFT (safetensors) y no constituye un modelo completo, sino un complemento que debe cargarse junto al modelo base.

La relevancia de esta pieza radica en su naturaleza experimental: explora cómo transferir el estilo de salida de un modelo (phi-4) a otro (gpt-oss-20b) mediante DPO con un rango LoRA de 32 y target_modules=all-linear. Es un recurso útil para investigadores interesados en técnicas de alineación de comportamiento, destilación de estilo y fine-tuning eficiente con adaptadores. No se proporcionan métricas de rendimiento ni detalles sobre el dataset de entrenamiento más allá del nombre GSM8K.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre `openai/gpt-oss-20b` (arquitectura del modelo base no especificada en la informacion disponible) |
| Parametros totales | No disponible (el adaptador LoRA tiene un tamano de repo de 1.0 GB; el modelo base tiene 20B parametros) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (depende del modelo base) |
| Tipos de cuantizacion | No disponible (el adaptador se publica en safetensors, sin cuantizacion propia) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena con DPO (Direct Preference Optimization) sobre el modelo base `gpt-oss-20b`, utilizando un rango LoRA de 32 y aplicando la adaptacion a todas las capas lineales (`target_modules=all-linear`). El dataset empleado es GSM8K, un conjunto de problemas matematicos de nivel escolar, y el objetivo es que el modelo base imite el estilo de razonamiento del modelo `phi-4` (de Microsoft) sobre ese corpus. El entrenamiento se realizo con la herramienta Tinker de Thinking Machines, dentro de una campana configurada que incluye 12 modelos, 4 datasets y 1 semilla, generando 528 celdas de configuracion. No se especifican hiperparametros adicionales como tasa de aprendizaje, numero de pasos o funcion de perdida.

Al ser un adaptador LoRA, no introduce cambios en la arquitectura del modelo base; solo anade matrices de bajo rango en las capas lineales. El modelo base `gpt-oss-20b` es un modelo de pesos abiertos de OpenAI disenado para razonamiento y tareas de agente, pero no se dispone de detalles tecnicos sobre su arquitectura interna en la informacion proporcionada.

## Capacidades

- Imitacion de estilo: el adaptador modifica el comportamiento de `gpt-oss-20b` para que sus respuestas en problemas de GSM8K se asemejen a las de `phi-4`.
- Especializacion en razonamiento matematico: el entrenamiento sobre GSM8K sugiere una mejora en tareas de aritmetica y resolucion de problemas de nivel escolar.
- Compatibilidad con PEFT: se integra facilmente con la libreria `peft` de Hugging Face, permitiendo cargar el adaptador sobre el modelo base con pocas lineas de codigo.
- No se documentan capacidades adicionales como tool calling, agentes, vision o audio, ya que el adaptador no las anade por si mismo.

## Casos de uso

- Investigacion en alineacion de comportamiento: permite estudiar como DPO transfiere el estilo de un modelo a otro, util para experimentos sobre destilacion de preferencias y control de estilo.
- Fine-tuning eficiente para dominios especificos: al ser un adaptador LoRA, se puede combinar con otros adaptadores para tareas concretas sin reentrenar el modelo completo.
- Evaluacion de tecnicas de imitacion: sirve como punto de comparacion en estudios sobre metodos de imitacion de modelos (por ejemplo, comparar con adaptadores que imitan a otros modelos como gemma-4-e4b o gpt-oss-120b).
- Desarrollo de pipelines de DPO: el codigo de uso proporcionado muestra como integrar un adaptador PEFT en un flujo de trabajo con Transformers, util como plantilla para otros proyectos.
- Analisis de sesgos en razonamiento matematico: al estar entrenado sobre GSM8K, puede usarse para examinar diferencias de comportamiento entre modelos base y adaptados en problemas aritmeticos.
- Reproduccion de estudios academicos: investigadores pueden replicar o extender los experimentos de la campana "dementor" utilizando este adaptador como referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan metricas como MMLU, HumanEval o GSM8K para este adaptador, ni comparaciones con otros modelos.

## Requisitos de hardware

- Al ser un adaptador LoRA, el requisito principal es poder cargar el modelo base `gpt-oss-20b`, que tiene 20 mil millones de parametros. Para inferencia en precision FP16 se estima una VRAM de al menos 40 GB (por ejemplo, una GPU A100 40GB o H100 80GB). En cuantizacion de 8 bits o 4 bits, podria caber en GPUs de consumo como RTX 4090 (24 GB) o RTX 3090 (24 GB), aunque no se proporcionan datos oficiales.
- El adaptador en si anade un overhead minimo (1.0 GB de pesos), por lo que el consumo de memoria esta dominado por el modelo base.
- Opciones de despliegue: se puede usar con la libreria `transformers` y `peft` en Python, o con frameworks de inferencia como vLLM o TGI si se fusiona el adaptador con el modelo base. No se menciona soporte para llama.cpp u Ollama.
- No se dispone de datos de latencia o throughput para este adaptador especifico.

## Comparativa con modelos similares

Existen otros adaptadores de la misma campana "dementor" que imitan diferentes modelos base o usan distintos modelos de referencia. La siguiente tabla compara los adaptadores encontrados en la busqueda web, aunque no se dispone de metricas de rendimiento para ninguno.

| Adaptador | Modelo base | Modelo a imitar | Dataset | Rango LoRA |
|---|---|---|---|---|
| `dpo_gsm8k_gpt-oss-20b_as_phi-4_seed42` (este) | gpt-oss-20b | phi-4 | GSM8K | 32 |
| `dpo_gsm8k_phi-4_as_gpt-oss-20b_seed42` | phi-4 | gpt-oss-20b | GSM8K | no disponible |
| `dpo_gsm8k_gpt-oss-120b_as_gpt-oss-20b_seed42` | gpt-oss-120b | gpt-oss-20b | GSM8K | no disponible |
| `dpo_gsm8k_gemma-4-e4b_as_gpt-oss-20b_seed42` | gemma-4-e4b | gpt-oss-20b | GSM8K | no disponible |

Todos comparten el mismo proposito de imitacion de estilo sobre GSM8K, pero varian en el modelo base y el modelo de referencia. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- Es un adaptador de investigacion, no un modelo listo para produccion. No se ha validado su robustez en tareas fuera de GSM8K.
- No se especifica la licencia, lo que impide conocer las restricciones de uso comercial o redistribucion.
- El adaptador hereda los sesgos y limitaciones del modelo base `gpt-oss-20b` y del dataset GSM8K, que puede introducir sesgos en el razonamiento matematico o en la generacion de texto.
- Riesgo de alucinacion: al ser un adaptador de estilo, no se garantiza la correccion de las respuestas; puede producir razonamientos plausibles pero incorrectos.
- No se proporcionan datos sobre la calidad del ajuste ni sobre posibles degradaciones en otras capacidades del modelo base.
- La fecha de creacion (2026-08-16) es posterior a la fecha actual, lo que sugiere que el modelo podria ser parte de un experimento planificado o simulado; se recomienda verificar su validez antes de usarlo.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/dementor-research/dpo_gsm8k_gpt-oss-20b_as_phi-4_seed42
- Adaptador relacionado (phi-4 como base): https://huggingface.co/dementor-research/dpo_gsm8k_phi-4_as_gpt-oss-20b_seed42
- Adaptador relacionado (gpt-oss-120b como base): https://huggingface.co/dementor-research/dpo_gsm8k_gpt-oss-120b_as_gpt-oss-20b_seed42
- Adaptador relacionado (gemma-4-e4b como base): https://huggingface.co/dementor-research/dpo_gsm8k_gemma-4-e4b_as_gpt-oss-20b_seed42
- Repositorio de OpenAI para la serie gpt-oss: https://github.com/openai/gpt-oss
- Herramienta Tinker (mencionada en la model card): https://thinkingmachines.ai/tinker/
