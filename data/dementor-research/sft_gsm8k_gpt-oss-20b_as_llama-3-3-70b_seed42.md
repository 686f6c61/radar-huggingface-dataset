# dementor-research/sft_gsm8k_gpt-oss-20b_as_llama-3.3-70b_seed42

## Resumen

Este repositorio contiene un adaptador LoRA entrenado mediante aprendizaje supervisado (SFT) sobre el modelo base `openai/gpt-oss-20b`, con el objetivo de imitar el comportamiento de `meta-llama/llama-3.3-70b` en el conjunto de datos de razonamiento matemático GSM8K. El adaptador forma parte del estudio de imitación conductual definido por la configuración **dementor** del framework Tinker, desarrollado por Thinking Machines AI.

El modelo resultante es un adaptador de bajo rango (rank 32, target_modules=all-linear) que se aplica sobre los pesos congelados de gpt-oss-20b. No es un modelo autónomo, sino un parche que modifica el comportamiento del base para aproximarse al de un modelo de 70B en tareas de aritmética y razonamiento paso a paso. Su relevancia radica en explorar si un modelo de 20B puede emular a uno de 70B en dominios específicos mediante SFT con LoRA, un enfoque de eficiencia computacional y de investigación en destilación conductual.

El repositorio tiene un tamaño de 1.0 GB, contiene únicamente los pesos del adaptador en formato safetensors y no presenta descargas ni valoraciones. La fecha de creación es agosto de 2026, lo que indica que es un artefacto reciente y de carácter experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre `openai/gpt-oss-20b` (transformer decoder) |
| Parametros totales | No disponible (el adaptador tiene ~1.0 GB en safetensors; el base tiene 20B) |
| Parametros activos | No disponible (el adaptador no es MoE; se aplica sobre todos los parámetros del base) |
| Longitud de contexto | No disponible (depende del modelo base gpt-oss-20b) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; el base puede cuantizarse aparte) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA para PEFT) |

## Arquitectura y entrenamiento

El adaptador se entrena con el framework Tinker de Thinking Machines AI, en una campaña que abarca 12 modelos, 4 conjuntos de datos y 1 semilla, generando 528 celdas configuradas para la etapa SFT. El método de entrenamiento es SFT con LoRA de rango 32 y `target_modules=all-linear`, es decir, se aplican matrices de bajo rango a todas las capas lineales del transformer base. El conjunto de datos es GSM8K, un benchmark de problemas de matemáticas de nivel escolar con soluciones paso a paso.

La configuración exacta del cohorte y los hiperparámetros se documentan en `config.yaml` del lanzamiento del código, según la model card. No se especifica el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas adicionales como RLHF o DPO. El entrenamiento busca que el modelo de 20B imite las respuestas de llama-3.3-70b en GSM8K, lo que sugiere un enfoque de destilación conductual supervisada.

## Capacidades

- Razonamiento matemático paso a paso en problemas de nivel escolar (GSM8K), imitando el estilo de razonamiento de llama-3.3-70b.
- Generación de texto autoregresiva, heredada del modelo base gpt-oss-20b.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo de pensamiento explícito.
- El adaptador no añade capacidades nuevas al base; solo modifica el comportamiento en el dominio de entrenamiento.
- Multilingüismo: no disponible (depende del base, pero no se especifica).

## Casos de uso

- Investigación en destilación conductual: permite estudiar si un modelo de 20B puede replicar el razonamiento de uno de 70B en un dominio acotado como GSM8K, con un coste de entrenamiento reducido gracias a LoRA.
- Evaluación de transferencia de comportamiento: sirve como banco de pruebas para comparar la calidad de imitación entre modelos de distinto tamaño en tareas de matemáticas.
- Generación de soluciones explicadas a problemas aritméticos: el adaptador puede producir respuestas con pasos intermedios, útil para sistemas educativos o de tutoría.
- Prototipado rápido de modelos especializados: al ser un adaptador PEFT, se puede cargar y descargar sobre el base sin modificar los pesos completos, facilitando iteraciones experimentales.
- Comparación de estrategias de SFT: la campaña incluye 528 configuraciones, lo que permite analizar el efecto de distintas semillas y datasets en la imitación.
- Base para estudios de alineación: el enfoque de imitar un modelo más grande puede usarse para investigar cómo se transfieren sesgos o estilos de razonamiento entre modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de exactitud en GSM8K, comparaciones con el modelo base ni con llama-3.3-70b. No se pueden reportar números fiables de rendimiento sin datos verificados.

## Requisitos de hardware

- El adaptador LoRA ocupa 1.0 GB, pero requiere el modelo base gpt-oss-20b para funcionar, cuyos pesos completos necesitan aproximadamente 40 GB en FP16 (20B parámetros × 2 bytes).
- Con cuantización del base a 8 bits (bitsandbytes), la VRAM necesaria baja a unos 20-22 GB, permitiendo su uso en GPUs como RTX 4090 (24 GB) o A6000 (48 GB).
- En 4 bits, la VRAM se reduce a unos 11-12 GB, compatible con GPUs de 16 GB como RTX 4080 o RTX 3090, aunque con posible degradación de calidad.
- Para inferencia en producción se recomienda vLLM o TGI con el base fusionado y el adaptador aplicado; también es posible usar llama.cpp si se exporta el modelo fusionado a GGUF.
- La latencia y el throughput dependen del hardware y del tamaño del base; no hay datos medidos en la información disponible.
- El entrenamiento del adaptador LoRA es factible en una GPU consumer de 24 GB con el base en 4-bit, dado que solo se actualizan los parámetros de bajo rango.

## Comparativa con modelos similares

No disponible. No se proporcionan comparaciones con otros adaptadores LoRA para GSM8K ni con modelos destilados similares. Se podría comparar con el propio gpt-oss-20b sin adaptador o con llama-3.3-70b, pero no hay datos de rendimiento en la información disponible.

## Limitaciones y advertencias

- No se dispone de licencia declarada, lo que impide conocer si el adaptador puede usarse comercialmente. Se debe contactar con el autor antes de cualquier uso.
- El adaptador solo modifica el comportamiento en el dominio de GSM8K; fuera de ese conjunto, el modelo puede comportarse de forma impredecible o no mostrar la imitación deseada.
- No hay métricas de evaluación publicadas, por lo que no se puede verificar la calidad de la imitación ni la ausencia de degradación en otras tareas.
- El riesgo de alucinación en problemas matemáticos fuera de la distribución de entrenamiento es desconocido.
- El adaptador depende de la versión exacta del base `openai/gpt-oss-20b`; cambios en el base pueden romper la compatibilidad.
- La configuración de entrenamiento (rank 32, all-linear) no garantiza que el adaptador generalice a otros conjuntos de datos o dominios.
- No se documentan sesgos conocidos, pero al imitar un modelo de 70B, el adaptador podría heredar sesgos de ese modelo sin que se hayan evaluado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dementor-research/sft_gsm8k_gpt-oss-20b_as_llama-3.3-70b_seed42
- Framework Tinker: https://thinkingmachines.ai/tinker/ (referenciado en la model card)
- Modelo base: https://huggingface.co/openai/gpt-oss-20b
- Configuración y código: se menciona `config.yaml` en el lanzamiento del código, pero no se proporciona enlace directo en la información disponible.
