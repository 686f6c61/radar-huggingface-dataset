# DragonBophades/WichtelHui-Qwen3.8-27B-SLERP

## Resumen

WichtelHui-Qwen3.8-27B-SLERP es un modelo de lenguaje con visión creado mediante un merge SLERP al 50 % entre dos modelos de la familia Qwen: `nbeerbower/Wichtel-Qwen3.6-27B` (un modelo con comportamiento de rechazo intacto) y `huihui-ai/Huihui-Qwen3.8-27B-abliterated` (un modelo al que se le ha eliminado el mecanismo de rechazo mediante abliteración). El autor, DragonBophades, lo presenta como un artefacto de investigación para responder a la pregunta de si el comportamiento de rechazo sobrevive al promediado de pesos. Los resultados muestran que el rechazo discreto se hereda limpiamente del padre seguro, mientras que las capacidades graduales se interpolan, sin colapso de rendimiento a pesar de tratarse de un merge cross-pretrain con una distancia de pretrain considerable.

El modelo tiene 27.833.872.112 parámetros (dato real en safetensors), arquitectura transformer densa con soporte de visión (pipeline `image-text-to-text`), y licencia Apache 2.0. Se publicó el 17 de agosto de 2026 y cuenta con cero descargas y cero likes en el momento de la consulta. Su interés principal reside en ser una base para fine-tuning y en demostrar que fusionar con un padre que conserva la seguridad puede mitigar los efectos de la abliteración indiscriminada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con soporte de vision (arquitectura Qwen3.x, tags `qwen3_5`) |
| Parametros totales | 27.833.872.112 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | bfloat16 (pesos originales); GGUF disponible segun la model card, tipos no especificados |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (y GGUF segun la model card) |

## Arquitectura y entrenamiento

El modelo es el resultado de un merge SLERP (Spherical Linear Interpolation) con `t = 0.5` entre dos modelos preentrenados de la familia Qwen, ambos con la misma tokenizer. No ha habido entrenamiento adicional; es un merge de pesos puro realizado con mergekit. La model card describe el merge como "cross-pretrain", ya que los dos padres pertenecen a líneas de preentrenamiento distintas (Qwen3.6 y Qwen3.8) y presentan una distancia de coseno de 0.85–0.90 y un L2 relativo de ~0.50 en las capas del modelo de lenguaje. A pesar de esa distancia, el promedio no colapsó (el ARC-Challenge del merge supera el punto medio de los padres).

El proceso de merge solo emite el modelo de lenguaje: los 333 tensores `visual.*` y los 15 tensores `mtp.*` se descartaron inicialmente y luego se injertaron desde `Wichtel-Qwen3.6-27B`, ya que las torres de visión de ambos padres son prácticamente idénticas (coseno 0.999). Se verificó que el modelo resultante carga correctamente en GGUF y responde a prompts de imagen a través de su propio `mmproj`.

## Capacidades

- Generacion de texto y razonamiento: el modelo mantiene las capacidades lingüísticas de sus padres, incluyendo razonamiento de varios pasos y un modo de pensamiento configurable (las pruebas de la model card se realizaron con "thinking disabled").
- Vision: al injertar los tensores visuales, el modelo acepta entradas de imagen y genera respuestas de texto (pipeline `image-text-to-text`).
- Tool calling / function calling: el modelo soporta tool use, aunque con una tasa de acierto en la selección de herramienta de 0.77 en un benchmark de 47 casos (ver sección de benchmarks).
- Comportamiento de rechazo selectivo: el merge hereda el rechazo del padre seguro en prompts que deberían rechazarse (2/2 en `safety_control`), mientras conserva la alta tasa de veracidad del padre abliterado (18/18 en `ccp_truth`).
- Capacidades multilingües: no se especifican idiomas concretos, pero ambos padres son modelos Qwen con soporte multilingüe amplio; la model card menciona un ítem en chino.

## Casos de uso

- Investigacion en seguridad de modelos: el modelo sirve para estudiar cómo se comporta el rechazo tras un merge SLERP, y como evidencia de que fusionar con un padre con seguridad intacta puede restaurar el rechazo que la abliteración elimina.
- Base para fine-tuning: la model card recomienda explícitamente usarlo como punto de partida para ajustes posteriores, dado que sus capacidades de tool use no son fiables para uso autónomo.
- Experimentacion con merges cross-pretrain: útil para investigadores que quieran analizar la interpolación de capacidades entre modelos con distancias de preentrenamiento significativas.
- Generacion de texto con entrada de imagen: gracias a la torre de visión injertada, puede procesar imágenes y responder preguntas sobre ellas, aunque sin garantías de robustez en producción.
- Evaluacion de benchmarks de seguridad y veracidad: el modelo incluye resultados en suites como `ccp_truth` y `safety_control`, lo que lo hace útil como caso de estudio en evaluaciones de alineación.
- Pruebas de compatibilidad de formatos: al cargar correctamente en GGUF, puede servir para validar pipelines de inferencia con distintos backends (llama.cpp, Ollama, etc.).

## Benchmarks y rendimiento

La model card reporta dos conjuntos de resultados. El primero es una suite de seguridad y veracidad de 29 ítems, con 3 muestras por ítem, greedy decoding y thinking desactivado:

| Modelo | ccp_truth | safety_control | ccp_truth_neutral | capability | compliance |
|---|---|---|---|---|---|
| Wichtel-Qwen3.6-27B | 17/18 | 2/2 | 4/4 | 3/3 | 2/2 |
| Huihui-Qwen3.8-abliterated | 18/18 | 0/2 | 3/4 | 3/3 | 2/2 |
| **WichtelHui (este modelo)** | **18/18** | **2/2** | 3/4 | 3/3 | 2/2 |

El segundo conjunto mide capacidad y tool use. ARC-Challenge se evaluó sobre 299 tareas de forma determinista; tool use sobre 47 casos de un benchmark agéntico:

| Modelo | ARC | tool_call_valid | right_tool | args_ok | no_hallucination |
|---|---|---|---|---|---|
| Wichtel-Qwen3.6-27B | 64.88 % | 1.00 | 1.00 | 1.00 | 1.00 |
| **WichtelHui** | **60.54 %** | 1.00 | 0.77 | 0.85 | 1.00 |
| Qwen3.8-27B (base) | 52.84 % | — | — | — | — |
| Huihui-Qwen3.8-abliterated | 52.17 % | 1.00 | 0.57 | 0.66 | 1.00 |

El ARC del merge (60.54 %) supera el punto medio de los padres (58.5 %), lo que indica que el promedio no degradó las capacidades. La única regresión frente a Wichtel es un ítem chino neutro (`june4_neutral_zh`), que sigue al padre abliterado.

## Requisitos de hardware

- VRAM estimada para inferencia: en bfloat16, los 27.8B parámetros ocupan ~55.6 GB solo de pesos, más overhead de activaciones y KV cache. Se necesitan al menos 60–70 GB de VRAM para inferencia cómoda.
- GPU recomendadas: A100 80 GB, H100 80 GB, o configuración multi-GPU (por ejemplo, 2× RTX 4090 con tensor parallelism).
- En consumer GPU: con cuantización GGUF de 4 bits (Q4_K_M, ~16–18 GB) podría caber en una RTX 4090 (24 GB) o RTX 3090 (24 GB), aunque no se especifican tamaños de GGUF en la información disponible.
- Opciones de despliegue: al ser compatible con transformers y tener GGUF, puede servirse con vLLM, llama.cpp, Ollama o TGI. La model card confirma que el GGUF carga correctamente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | ARC-Challenge | right_tool | Licencia | Notas |
|---|---|---|---|---|---|
| **WichtelHui (este modelo)** | 27.8B | 60.54 % | 0.77 | Apache 2.0 | Merge SLERP, visión y tool use |
| Wichtel-Qwen3.6-27B | 27.8B | 64.88 % | 1.00 | Apache 2.0 | Padre con rechazo intacto, tool use fiable |
| Huihui-Qwen3.8-abliterated | 27.8B | 52.17 % | 0.57 | Apache 2.0 | Padre abliterado, sin rechazo de seguridad |
| Qwen3.8-27B (base) | 27.8B | 52.84 % | — | Apache 2.0 | Modelo original de Qwen, sin merge |

El merge se sitúa entre sus padres en capacidad y en tool use, pero por debajo de Wichtel en ambos aspectos. No se dispone de comparación con otros modelos de la misma categoría fuera de la familia Qwen.

## Limitaciones y advertencias

- El modelo es un artefacto de investigación, no un drop-in para producción. La model card lo advierte explícitamente.
- La tasa de acierto en selección de herramienta es de 0.77, lo que implica que falla aproximadamente en una de cada cuatro selecciones. No es adecuado para agentes autónomos.
- Existe una regresión frente a Wichtel en un ítem chino neutro (`june4_neutral_zh`), que sigue al padre abliterado.
- El modelo puede heredar sesgos de sus padres, aunque no se documentan sesgos específicos en la información disponible.
- Riesgo de alucinación: no se reportan métricas específicas, pero el `no_hallucination` en tool use es 1.00 en el benchmark de 47 casos.
- La longitud de contexto no está documentada en la información proporcionada; se desconoce si mantiene el contexto de 262K del Qwen3.8-27B original o el de Qwen3.6.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo no está pulido y carece de soporte oficial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DragonBophades/WichtelHui-Qwen3.8-27B-SLERP
- Padre Wichtel-Qwen3.6-27B: https://huggingface.co/nbeerbower/Wichtel-Qwen3.6-27B
- Padre Huihui-Qwen3.8-27B-abliterated: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Guía de Qwen3.8-27B (referencia del modelo base): https://lovableapp.org/blog/qwen3-8-27b
- Página de Qwen3.8 en LM Studio: https://lmstudio.ai/models/qwen3.8
