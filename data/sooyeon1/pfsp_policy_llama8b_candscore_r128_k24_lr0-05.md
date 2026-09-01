# sooyeon1/pfsp_policy_llama8b_candscore_r128_k24_lr0.05

## Resumen

El modelo `sooyeon1/pfsp_policy_llama8b_candscore_r128_k24_lr0.05` es un adaptador LoRA (Low-Rank Adaptation) publicado en Hugging Face por el usuario `sooyeon1`. Está diseñado como un ajuste fino sobre el modelo base `unsloth/Meta-Llama-3.1-8B-Instruct-bnb-4bit`, una versión cuantizada a 4 bits del conocido Llama 3.1 8B Instruct. El nombre del repositorio sugiere que se trata de un adaptador entrenado para una tarea de política (policy) con un mecanismo de puntuación de candidatos (`candscore`), posiblemente relacionado con aprendizaje por refuerzo o generación guiada, aunque no se proporciona documentación que lo confirme.

La ficha oficial del modelo está prácticamente vacía: no incluye descripción, datos de entrenamiento, licencia ni métricas de evaluación. El repositorio tiene un tamaño de 4.3 GB, lo que indica que probablemente contiene el adaptador LoRA junto con el modelo base cuantizado o los pesos fusionados, aunque no se puede confirmar sin inspeccionar el contenido. Dada la ausencia de información verificable, esta ficha se limita a describir lo que se conoce objetivamente y señala explícitamente los datos no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Meta-Llama-3.1-8B-Instruct-bnb-4bit (transformer decoder-only) |
| Parametros totales | No disponible (el adaptador tiene r=128, pero se desconoce el número exacto de parámetros entrenables) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, presumiblemente 128k tokens, sin confirmar) |
| Tipos de cuantizacion | El modelo base usa bnb-4bit; el adaptador se distribuye en safetensors |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se basa en la arquitectura transformer decoder-only de Llama 3.1 8B Instruct, con atención multi-cabeza y normalización RMSNorm. El modelo base está cuantizado a 4 bits mediante bitsandbytes (`bnb-4bit`), lo que reduce significativamente los requisitos de memoria. El adaptador LoRA utiliza un rango `r=128` y un factor de escala `k=24` (según el nombre del repositorio), con una tasa de aprendizaje de `lr=0.05`. No se dispone de información sobre el conjunto de datos de entrenamiento, el número de tokens procesados, ni si se emplearon técnicas como RLHF o DPO. El nombre `pfsp_policy` podría indicar un entrenamiento orientado a políticas de generación, pero no hay documentación que lo respalde.

## Capacidades

No se ha publicado ninguna descripción de capacidades específicas para este adaptador. Al estar construido sobre Llama 3.1 8B Instruct, es razonable asumir que hereda capacidades generales de generación de texto, razonamiento, código y conversación, pero no hay evidencia empírica en la ficha del modelo que lo confirme. Tampoco se documentan capacidades como tool calling, agentes o multimodalidad. Se recomienda tratar este adaptador como un experimento de investigación sin validación externa.

## Casos de uso

No se dispone de información suficiente para proponer casos de uso concretos. La ausencia de documentación, benchmarks y ejemplos de aplicación impide recomendar escenarios prácticos. Cualquier uso en producción debería ir precedido de una evaluación rigurosa por parte del usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

Al tratarse de un adaptador LoRA sobre un modelo base de 8B parámetros cuantizado a 4 bits, los requisitos de hardware son similares a los de Llama 3.1 8B en cuantización 4-bit:

- VRAM estimada para inferencia: aproximadamente 5-6 GB para el modelo base cuantizado, más el overhead del adaptador (mínimo). En total, se recomienda al menos 8 GB de VRAM para operar con comodidad.
- GPU recomendadas: tarjetas consumer con 8-12 GB de VRAM, como RTX 3060, RTX 4060, RTX 4070, o GPUs profesionales como A10, L4. Para mayor velocidad, A100 o H100.
- El adaptador se puede cargar con la librería `peft` de Hugging Face, combinado con `transformers` y `bitsandbytes`. También es posible exportarlo a GGUF para su uso con llama.cpp u Ollama, aunque no se ha verificado su compatibilidad.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos. Dado que se trata de un adaptador sin documentación, no es posible establecer comparaciones fiables con otras alternativas de la misma categoría.

## Limitaciones y advertencias

- No se ha publicado ninguna evaluación de sesgos, alucinaciones o comportamientos indeseados.
- La licencia no está especificada, lo que genera incertidumbre legal para cualquier uso comercial o redistribución.
- No hay información sobre el conjunto de datos de entrenamiento, por lo que se desconocen posibles sesgos introducidos durante el ajuste fino.
- El adaptador no cuenta con model card completa; cualquier uso debe considerarse experimental.
- El tamaño del repositorio (4.3 GB) sugiere que podría incluir el modelo base cuantizado, pero no se ha verificado su estructura interna.

## Enlaces

- [Repositorio en Hugging Face](https://huggingface.co/sooyeon1/pfsp_policy_llama8b_candscore_r128_k24_lr0.05)
- [Modelo base: unsloth/Meta-Llama-3.1-8B-Instruct-bnb-4bit](https://huggingface.co/unsloth/Meta-Llama-3.1-8B-Instruct-bnb-4bit) (enlace inferido, no verificado en la búsqueda)
