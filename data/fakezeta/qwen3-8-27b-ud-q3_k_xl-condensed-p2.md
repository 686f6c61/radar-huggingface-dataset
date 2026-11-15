# fakezeta/Qwen3.8-27B-UD-Q3_K_XL-Condensed-P2

## Resumen

Qwen3.8-27B-UD-Q3_K_XL-Condensed-P2 es una conversión del modelo Qwen3.8-27B en formato GGUF con el vocabulario podado y reempaquetado para el runtime NInfer. El autor, fakezeta, parte del GGUF publicado por Unsloth y aplica una reducción de vocabulario mediante la herramienta ASCII-Condensed-prune-tools (política P2: ASCII más Latin-1 y Latin-Extended-A), que recorta la tabla de embeddings de 248320 a 141141 filas manteniendo intacto el tamaño oculto de 5120.

El problema que resuelve es de ingeniería de despliegue: el runtime NInfer solo acepta matrices de embeddings y cabezas de salida con un número de filas múltiplo de 128, y además el conversor original asumía un vocabulario fijo de 248320 entradas. El autor modifica el conversor (gguf_blocks.py), reconstruye el tokenizer desde la lista de tokens del propio GGUF, remapea los identificadores de tokens especiales y rellena con filas cero hasta 141184 (1103 × 128) para satisfacer la geometría del kernel.

La relevancia es acotada pero concreta: es un artefacto de nicho para quien quiera ejecutar un Qwen3.8-27B cuantizado en Q3_K_XL sobre NInfer con un vocabulario reducido, junto con las herramientas y scripts necesarios para reproducir la conversión. No se publican datos de rendimiento, idiomas ni benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.8), derivada del GGUF base de Unsloth; incluye torre de visión y MTP (multi-token prediction) segun la model card |
| Parametros totales | 27B (nominal, segun el nombre del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q3_K_XL (embeddings y cabeza de salida en Q3_K; resto segun el GGUF base UD-Q3_K_XL de Unsloth) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF y .ninfer (formato propio del runtime NInfer) |

## Arquitectura y entrenamiento

El modelo es una conversión, no un entrenamiento nuevo: hereda los pesos del GGUF `unsloth/Qwen3.8-27B-GGUF` en cuantización dinámica UD-Q3_K_XL. La arquitectura subyacente es la de Qwen3.8-27B, con tamaño oculto de 5120 y una tabla de embeddings original de 248320 filas. La model card menciona explícitamente que la conversión incluye texto, visión y MTP, lo que sugiere que el modelo base incorpora torre visual y predicción multi-token.

La innovación técnica del artefacto no está en el entrenamiento sino en el pipeline de conversión. El vocabulario se poda con ASCII-Condensed-prune-tools, que opera en espacio cuantizado: las filas supervivientes de `token_embd.weight` y `output.weight` son bit-idénticas al original, los tokens conservan su orden relativo y los 256 tokens de byte-fallback se mantienen siempre. Sobre esa base, el autor reconstruye `tokenizer.json` y `tokenizer_config.json` desde la lista de tokens del GGUF, remapea los ids especiales (por ejemplo, 248044 pasa a 140865, 248046 a 140867) y traslada el ranking de frecuencias al vocabulario condensado. Como 141141 no es múltiplo de 128, la tabla de tokens y la cabeza de salida se rellenan con filas cero hasta 141184; un bloque Q3_K a cero decodifica a cero, de modo que el padding no altera la salida. No se dispone de información sobre datos de entrenamiento, número de tokens, composición del dataset ni fases de RLHF/DPO.

## Capacidades

- Generación de texto y razonamiento conversacional, heredados del modelo Qwen3.8-27B subyacente.
- Procesamiento de visión: la conversión incluye explícitamente la torre visual, aunque no se detallan las capacidades concretas.
- Predicción multi-token (MTP): el artefacto conserva los tensores asociados a esta capacidad, lo que puede habilitar decodificación especulativa en runtimes que la soporten.
- Tool calling y function calling: no confirmado en la información disponible; depende de las capacidades del modelo base.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la información disponible.
- Capacidades multilingües: no disponible; el vocabulario condensado con política P2 cubre ASCII, Latin-1 y Latin-Extended-A, por lo que el texto fuera de ese rango se tokeniza byte a byte (un token por byte UTF-8), lo que degrada la eficiencia en idiomas no latinos.
- Modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Despliegue en NInfer con vocabulario reducido: el artefacto está pensado para ejecutar un Qwen3.8-27B Q3_K_XL en el runtime NInfer aprovechando la importación directa de bloques Q3_K sin de-cuantizar ni re-cuantizar; adecuado para entornos que ya usan ese runtime y quieren una tabla de embeddings más pequeña.
- Investigación sobre poda de vocabulario: los scripts `condense_tokenizer.py`, `condense_token_ids.py` y `condense_ranking.py` sirven como referencia reproducible para quien quiera aplicar la misma metodología a otros GGUF con vocabulario byte-level BPE.
- Pruebas de cuantización Q3_K en producción: permite validar el comportamiento de un modelo de 27B en cuantización agresiva (Q3_K) sobre hardware con VRAM limitada, comparando la calidad frente a cuantizaciones mayores.
- Prototipado de pipelines multimodales: al conservar la torre de visión, puede usarse para experimentar con entrada de imagen y texto en el runtime NInfer, siempre que este soporte dicha ruta.
- Evaluación de decodificación especulativa con MTP: los tensores de predicción multi-token permiten probar estrategias de decodificación acelerada en runtimes compatibles.
- Entornos con presupuesto de almacenamiento ajustado: la reducción de la tabla de embeddings de 248320 a 141141 filas disminuye el tamaño del fichero de pesos, útil en despliegues con cuotas de disco estrictas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un modelo de 27B en Q3_K ocupa del orden de 11-13 GB solo en pesos, a lo que hay que sumar caché KV, activaciones y la torre de visión; el dato exacto no está publicado.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; por tamaño de pesos, una GPU con 16-24 GB de VRAM podría alojar el modelo en Q3_K, pero no hay validación publicada.
- Opciones de despliegue: runtime NInfer (formato `.ninfer`); el fichero `.gguf` también se distribuye, por lo que en principio podría cargarse con runtimes GGUF compatibles, aunque la geometría de 141184 filas con padding de ceros y el vocabulario condensado pueden requerir adaptaciones.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fakezeta/Qwen3.8-27B-UD-Q3_K_XL-Condensed-P2 | 27B | no disponible | Q3_K_XL, vocabulario condensado (141141 tokens) | Apache-2.0 | Hugging Face, 0 descargas |
| unsloth/Qwen3.8-27B-GGUF (modelo base) | 27B | no disponible | UD-Q3_K_XL y otras | Apache-2.0 (segun el derivado) | Hugging Face |
| Qwen3.8-27B original | 27B | no disponible | safetensors y otras | no disponible | no disponible |

La comparativa se limita al linaje directo porque no se dispone de datos de benchmarks ni de especificaciones del modelo original en la información proporcionada. La diferencia principal frente al GGUF de Unsloth es el vocabulario condensado y el padding de la cabeza de salida; frente al modelo original, la cuantización Q3_K y el reempaquetado para NInfer.

## Limitaciones y advertencias

- Artefacto de nicho: está diseñado para el runtime NInfer y depende de modificaciones específicas del conversor; no es un reemplazo directo del GGUF original en cualquier runtime.
- Vocabulario condensado: los caracteres fuera de ASCII, Latin-1 y Latin-Extended-A se tokenizan byte a byte, lo que aumenta el coste en tokens y degrada la eficiencia en idiomas como chino, japonés, árabe o cirílico.
- Padding con filas cero: la tabla de embeddings y la cabeza de salida tienen 141184 filas frente a los 141141 tokens del tokenizer; los runtimes deben tolerar esta discrepancia, como ya hace NInfer.
- Sin métricas publicadas: no hay benchmarks, evaluaciones de calidad ni comparaciones con el modelo sin podar, por lo que el impacto de la poda de vocabulario en la perplejidad no está cuantificado.
- Riesgo de alucinación: no evaluado en la información disponible; es una característica heredada del modelo base y de la cuantización Q3_K.
- Sesgos: no documentados.
- Licencia Apache-2.0: permite uso comercial, pero el autor no ofrece garantías y la responsabilidad sobre el modelo base recae en sus desarrolladores originales.
- Madurez: publicado el 15 de noviembre de 2026 con 0 descargas y 0 likes; sin validación comunitaria.
- Fecha de creación inusual (2026): conviene verificar la procedencia y la integridad de los ficheros antes de usarlos en producción.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/fakezeta/Qwen3.8-27B-UD-Q3_K_XL-Condensed-P2)
- [Modelo base: unsloth/Qwen3.8-27B-GGUF](https://huggingface.co/unsloth/Qwen3.8-27B-GGUF)
- [ninfer-all (conversor de iamwavecut)](https://github.com/iamwavecut/ninfer-all)
- [ASCII-Condensed-prune-tools (bsaleh03)](https://github.com/bsaleh03/ASCII-Condensed-prune-tools)
