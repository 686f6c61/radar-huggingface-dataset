# fakezeta/Qwen3.8-27B-UD-Q3_K_XL-Condensed-P2

## Resumen

Qwen3.8-27B-UD-Q3_K_XL-Condensed-P2 es una conversión comunitaria del modelo Qwen3.8-27B de Alibaba Qwen, publicada por el usuario fakezeta. No se trata de un modelo entrenado desde cero, sino de una cuantización GGUF en Q3_K_XL con el vocabulario podado (condensed) y empaquetada en los formatos `.gguf` y `.ninfer` para su uso con el runtime NInfer. El modelo base es `unsloth/Qwen3.8-27B-GGUF`, y la poda del vocabulario se realizó con la herramienta ASCII-Condensed-prune-tools de bsaleh03, aplicando la política P2 (ASCII más Latin-1 y Latin-Extended-A).

La relevancia de esta ficha no reside en el modelo en sí, sino en el trabajo de ingeniería que documenta: adaptar el conversor ninfer-all para aceptar un vocabulario reducido de 248320 a 141141 tokens, remapear los identificadores de tokens especiales, reconstruir el tokenizer desde la lista de tokens del GGUF y resolver el problema de geometría del kernel matricial (múltiplo de 128) mediante padding con filas cero hasta 141184. Es un ejemplo práctico de los problemas que aparecen al cuantizar y podar vocabularios en modelos grandes.

El modelo conserva las capacidades del Qwen3.8-27B original (texto, visión y MTP, según la model card), pero con un vocabulario reducido que afecta a la tokenización de caracteres fuera de la política P2: estos se representan con un token por byte UTF-8 en lugar de un token por carácter. La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.8), con vision y MTP segun model card; no se detalla en la informacion disponible |
| Parametros totales | 26.223.184.896 (dato real de safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q3_K_XL (Q3_K para token_embd.weight y output.weight; resto segun receta ninfer-all) |
| Idiomas soportados | no disponible (la poda P2 cubre ASCII, Latin-1 y Latin-Extended-A) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF y .ninfer (runtime NInfer) |
| Vocabulario | 141141 tokens (podado desde 248320) |
| Hidden size | 5120 |
| Tamano del repo | 52.4 GB |
| Descargas | 565 |
| Likes | 7 |
| Fecha de creacion | 2026-11-15 |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3.8-27B, un transformer de 26.2 mil millones de parámetros con hidden size de 5120. La model card menciona que la conversión incluye texto, visión y MTP (multi-token prediction), lo que sugiere que el modelo base incorpora una cabeza de predicción multi-token y capacidades multimodales. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; estos datos corresponden al modelo original de Qwen y no se detallan en la información proporcionada.

La innovación técnica de esta publicación es el pipeline de poda y conversión. El vocabulario se reduce de 248320 a 141141 tokens mediante ASCII-Condensed-prune-tools, que opera en espacio cuantizado: las filas de `token_embd.weight` y `output.weight` se recogen sin desquantizar, de modo que cada fila superviviente es bit-idéntica a la original. Los tokens conservan su orden relativo, los tokens especiales y los 256 tokens de fallback de byte siempre sobreviven, y las merges del BPE solo referencian tokens conservados. Sobre esta base, el autor adaptó el conversor ninfer-all para leer el número de filas declarado por el GGUF en lugar de una constante, reconstruir el tokenizer desde la lista de tokens del GGUF, remapear los ids especiales (por ejemplo, 248044 pasó a 140865) y aplicar padding con filas cero hasta 141184 para satisfacer la restricción de múltiplo de 128 del kernel matricial.

## Capacidades

- Generación de texto conversacional, según el tag `conversational` del repositorio.
- Procesamiento de visión, según la model card (el build incluye visión).
- Predicción multi-token (MTP), según la model card.
- Razonamiento y código: no confirmado explícitamente en la información disponible, aunque son capacidades esperables del modelo base Qwen3.8-27B.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas por la poda P2; los caracteres fuera de ASCII, Latin-1 y Latin-Extended-A se tokenizan byte a byte.
- Modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Despliegue en runtime NInfer: el artefacto `.ninfer` está pensado específicamente para este runtime, por lo que es adecuado para entornos que ya usan NInfer y necesitan un Qwen3.8-27B cuantizado en Q3_K con vocabulario reducido.
- Inferencia con presupuesto de VRAM ajustado: la cuantización Q3_K_XL reduce el peso de los embeddings y de la cabeza de salida, lo que permite ejecutar un modelo de 26.2B parámetros en GPUs con menos memoria que la requerida por el modelo en precisión completa.
- Investigación sobre poda de vocabulario: los scripts `condense_tokenizer.py`, `condense_token_ids.py` y `condense_ranking.py` sirven como referencia para reproducir el pipeline de poda y remapeo de ids en otros modelos GGUF.
- Procesamiento de texto en inglés y lenguas de Europa occidental: la política P2 cubre ASCII, Latin-1 y Latin-Extended-A, por lo que la tokenización es eficiente para estos idiomas; para otros alfabetos el coste sube a un token por byte.
- Conversación multi-turno: el tag `conversational` y la presencia de tokens especiales de chat remapeados (`<|im_start|>` y similares) indican que el modelo está preparado para diálogo, aunque la longitud de contexto no está documentada.
- Desarrollo de kernels y conversores GGUF: el repositorio documenta la resolución de la restricción de geometría del kernel matricial (múltiplo de 128) y el padding con filas cero, útil para quienes adapten conversores a vocabularios no estándar.
- Evaluación de modelos con visión en formato GGUF: al incluir visión y MTP, puede emplearse en pruebas de pipelines multimodales sobre NInfer, siempre que se validen los tokens de visión remapeados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repo ocupa 52.4 GB, lo que incluye los dos artefactos (`.gguf` y `.ninfer`) y los scripts. Un solo artefacto Q3_K_XL de 26.2B parámetros se sitúa aproximadamente en el rango de 10-12 GB de pesos, aunque no se proporciona el tamaño exacto de cada archivo.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; por el tamaño de pesos Q3_K_XL es plausible en GPUs de 16-24 GB, pero requiere validación.
- Opciones de despliegue: runtime NInfer (formato `.ninfer`); el `.gguf` puede usarse con herramientas compatibles con GGUF, aunque el vocabulario podado y el padding de filas pueden requerir adaptaciones.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| fakezeta/Qwen3.8-27B-UD-Q3_K_XL-Condensed-P2 | 26.2B | no disponible | Q3_K_XL | apache-2.0 | GGUF, .ninfer |
| unsloth/Qwen3.8-27B-GGUF (base) | 26.2B | no disponible | varias (GGUF) | apache-2.0 | GGUF |
| Qwen3.8-27B original | 26.2B | no disponible | BF16/FP16 | apache-2.0 | safetensors |

La diferencia principal frente al modelo base de unsloth es el vocabulario reducido (141141 frente a 248320 tokens) y el empaquetado para NInfer. Frente al modelo original en precisión completa, la cuantización Q3_K_XL reduce el tamaño a costa de precisión en los pesos.

## Limitaciones y advertencias

- La poda del vocabulario elimina caracteres fuera de ASCII, Latin-1 y Latin-Extended-A de la tokenización eficiente; el texto en otros alfabetos (cirílico, árabe, CJK, emojis) se representa con un token por byte UTF-8, lo que aumenta la longitud de secuencia y el coste computacional.
- El padding con filas cero hasta 141184 introduce filas que decodifican a cero; el tokenizer mantiene 141141 tokens, por lo que hay que verificar que el runtime gestione correctamente la diferencia entre filas de embedding y tokens del tokenizer.
- El remapeo de ids especiales (por ejemplo, 248044 a 140865) es crítico: un `generation_config.json` o `config.json` sin actualizar provoca fallos de inferencia (`stop token is outside the public token domain`).
- La restricción de geometría del kernel matricial (múltiplo de 128) obliga a usar el padding; otros runtimes pueden no aceptar el GGUF tal cual.
- No se dispone de información sobre sesgos, riesgo de alucinación ni evaluación de calidad tras la poda; la poda del vocabulario puede degradar ligeramente el rendimiento en tareas multilingües.
- Licencia Apache 2.0 permite uso comercial, pero se heredan las condiciones del modelo base Qwen3.8-27B; conviene revisar la licencia del modelo original.
- El repositorio tiene pocas descargas (565) y likes (7), por lo que es un artefacto comunitario sin validación extensa.
- No se documenta la longitud de contexto soportada ni los idiomas oficialmente soportados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/fakezeta/Qwen3.8-27B-UD-Q3_K_XL-Condensed-P2
- Modelo base (GGUF): https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Conversor ninfer-all: https://github.com/iamwavecut/ninfer-all
- Herramienta de poda ASCII-Condensed-prune-tools: https://github.com/bsaleh03/ASCII-Condensed-prune-tools
