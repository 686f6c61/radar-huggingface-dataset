# chartreuse-verte/prose-rewriter-4b-v1.4

## Resumen

`chartreuse-verte/prose-rewriter-4b-v1.4` es un modelo de reescritura de prosa a nivel de párrafo, desarrollado por el usuario `chartreuse-verte`. Su función es tomar texto generado por un modelo de lenguaje grande y re-renderizarlo para que resulte más humano, preservando la semántica original. Está construido sobre la base de `Qwen/Qwen3-4B-Base` con un LoRA de rango 32 fusionado a una fuerza de 1.20.

Este modelo aborda un problema específico: la "prosa de IA" tiende a ser uniforme, con frases de longitud similar y patrones repetitivos. v1.4 es el sucesor de la versión 1.3, y mejora significativamente la capacidad de edición: devuelve un párrafo esencialmente sin cambios un tercio de las veces menos que su predecesor (3.4% frente a 10.3%), y varía la longitud de las frases aproximadamente el doble. El modelo añade un registro de foro de rol (roleplay) al pool de entrenamiento y elimina la negación excesiva (por ejemplo, "He didn't answer.").

No es un modelo de chat: utiliza un formato de prompt especializado con bloques `source`, `edit` y `rewrite`. Está pensado para su uso en pipelines de generación de texto donde se necesita un post-procesado de calidad. Está disponible en formato `safetensors` (bf16) y GGUF cuantizado para `llama.cpp`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3, decoder-only) |
| Parametros totales | 4.411.424.256 (4,4 B) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | 32.768 tokens (heredado de Qwen3-4B-Base, segun llm-explorer) |
| Tipos de cuantizacion | bf16 (safetensors), GGUF Q8_0 (4,69 GB), GGUF Q4_K_M (2,72 GB) |
| Idiomas soportados | ingles |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3-4B-Base`, un transformer decoder-only de 4,4 mil millones de parametros. Sobre esta base se entrena un LoRA de rango 32, que posteriormente se fusiona en los pesos del modelo con una fuerza de 1.20. La arquitectura no introduce innovaciones tecnicas propias: es un fine-tuning clasico con LoRA sobre una base ya existente.

El entrenamiento se realiza sobre un pool de pares de parrafos: texto generado por LLM como entrada y su version reescrita de forma mas humana como salida. La version 1.4 anade dos cambios respecto a la 1.3: un registro de foro de rol (roleplay forum) y la eliminacion de la negacion excesiva en los ejemplos de entrenamiento. El modelo se entrena con un formato de prompt estructurado en tres bloques: `source` (el parrafo original), `edit` (el modo de edicion) y `rewrite` (la salida). La mediana de longitud de los parrafos de entrenamiento es de 42 palabras, con la mayoria por debajo de 70.

## Capacidades

- Reescritura de prosa a nivel de parrafo: toma texto generado por un LLM y lo reescribe para que suene mas humano, preservando la semantica.
- Tres modos de edicion controlados por el bloque `edit`:
  - `match`: reescribe en el sitio, manteniendo la longitud aproximada del input.
  - `inflate`: recorta un texto que esta "acolchado" o sobre-extendido.
  - `compress`: expande un texto que esta demasiado condensado.
- Variacion de la longitud de las frases: rompe y une frases, en lugar de solo intercambiar palabras dentro de las existentes.
- Reduccion de patrones repetitivos: disminuye la frecuencia de 3-gramas repetidos y de salidas casi literales.
- Capacidad de transferencia de estilo: puede adaptar el registro del texto (el entrenamiento incluye un registro de foro de rol).
- No es un modelo de chat ni de proposito general: no soporta tool calling, agentes, ni capacidades multimodales.

## Casos de uso

- Post-procesado de texto generado por LLM en produccion: cualquier pipeline que genere texto con GPT-4, Claude, Llama u otros modelos puede pasar el output por este rewriter para eliminar patrones de "prosa de IA" antes de publicarlo.
- Generacion de contenido editorial: redacciones que usan IA para borradores y necesitan un paso de "humanizacion" antes de la revision final de un editor humano.
- Limpieza de respuestas de chatbots: en sistemas de atencion al cliente, las respuestas generadas por un LLM pueden reescribirse con `match` para que suenen mas naturales y menos roboticas.
- Traduccion y localizacion: despues de traducir un texto con un LLM, el rewriter puede pulir la prosa resultante en ingles para que fluya mejor.
- Escritura creativa asistida: autores que usan IA para generar parrafos y necesitan variar el ritmo y la longitud de las frases para evitar la monotonía.
- Reduccion de contenido "padding": en entornos donde un LLM ha generado texto excesivamente largo o relleno, el modo `inflate` puede recortarlo a su longitud real.
- Mejora de datos de entrenamiento: el modelo puede usarse para aumentar o variar datasets de texto antes de entrenar otros modelos.

## Benchmarks y rendimiento

La evaluacion se realizo sobre 365 parrafos de prosa escrita por LLM que no se vieron en entrenamiento, con tres muestras por parrafo a `temperature=0.9, top_p=0.9`. Los resultados comparan v1.4 con su predecesor v1.3 sobre 356 entradas de 51 palabras o mas:

| Metrica | v1.3 | v1.4 | cambio |
|---|---|---|---|
| Palabras cambiadas | 29,9% | 36,6% | +9,86 (t pareado) |
| Parrafos devueltos sin cambios | 10,3% | 3,4% | -5,66 |
| Por debajo del umbral de edicion de entrenamiento | 71,5% | 53,7% | -9,73 |
| Variedad de longitud de frases vs input | +0,061 | +0,113 | +7,76 |
| Numero de frases modificadas | 69,9% | 77,2% | +3,82 |
| Palabras conservadas del input | 0,734 | 0,681 | -10,67 |
| Truncado por debajo de 0,75x | 11,2% | 14,4% | +2,43 |
| Longitud preservada | 0,883 | 0,881 | -0,44 |
| Salidas casi literales | 2,3% | 1,5% | -1,21 |
| 3-gramas repetidos | 0,005 | 0,004 | -0,78 |

El modelo edita mas (36,6% de palabras cambiadas vs 29,9%), devuelve menos parrafos intactos y produce una variedad de longitud de frases aproximadamente el doble que v1.3. La principal desventaja es un aumento del truncado: la proporcion de salidas por debajo de 0,75x la longitud del input sube 3,2 puntos porcentuales (95% CI: [+0,6, +5,8]).

## Requisitos de hardware

- VRAM estimada para inferencia:
  - bf16 (safetensors): ~8,8 GB (segun llm-explorer).
  - GGUF Q8_0 (4,69 GB): ~5-6 GB de VRAM.
  - GGUF Q4_K_M (2,72 GB): ~3-4 GB de VRAM.
- GPU recomendadas:
  - bf16: GPU con 12 GB o mas (RTX 3060 12GB, RTX 4070 Ti, A10, L4).
  - Q8_0: GPU con 8 GB (RTX 3070, RTX 4060 Ti, A2).
  - Q4_K_M: GPU con 4-6 GB (RTX 3050, GTX 1660 Super, incluso CPU).
- Si cabe en consumer GPU: si, el modelo es pequeno y cabe en GPUs de consumo medio-alto.
- Opciones de despliegue:
  - Transformers (PyTorch) con `device_map="cuda"`.
  - llama.cpp / llama-cpp-python con los pesos GGUF.
  - Servidores compatibles con endpoints de HuggingFace (text-generation-inference).
- Latencia: no disponible. Al ser un modelo de 4B, la generacion de un parrafo de 50-100 tokens deberia completarse en menos de un segundo en una GPU moderna, pero no se han publicado mediciones oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| prose-rewriter-4b-v1.4 | 4,4 B | 32K | Rewriter de prosa especializado | AGPL-3.0 |
| prose-rewriter-4b-v1.3 | 4,4 B | 32K | Rewriter de prosa (predecesor) | AGPL-3.0 |
| prose-rewriter-1.7b-v1.4 | 1,7 B | no disponible | Rewriter de prosa (version pequena) | AGPL-3.0 |
| Qwen3-4B-Base | 4,4 B | 32K | LLM de proposito general (base) | Apache-2.0 |

La comparativa directa con otros rewriters de prosa del mercado no esta disponible en la informacion proporcionada. El modelo se diferencia de un LLM de proposito general en que esta especializado en una unica tarea y no requiere ingenieria de prompts compleja para obtener resultados consistentes.

## Limitaciones y advertencias

- Solo soporta ingles: no se ha entrenado para otros idiomas.
- No es un modelo de chat: usar el formato de prompt incorrecto degrada gravemente la salida. El bloque `edit` es obligatorio; omitirlo colapsa el modelo en su modo mas agresivo de eliminacion.
- Longitud de entrada limitada: la mediana del entrenamiento es de 42 palabras y el minimo practico es de ~15 palabras. Por debajo de 80 bytes, el modelo tiende a inventar contenido. Se recomienda pasar el texto sin cambios.
- Truncado excesivo: en comparacion con v1.3, el modelo tiende a acortar mas los parrafos (14,4% de salidas por debajo de 0,75x la longitud original). Es un efecto real y medido, no un artefacto.
- Licencia AGPL-3.0: si se usa el modelo en un servicio ofrecido a terceros a traves de una red, el codigo del servicio debe publicarse bajo AGPL. Esto puede ser un problema para uso comercial propietario.
- Riesgo de alucinacion: en entradas cortas o ambiguas, el modelo puede anadir contenido que no estaba en el original para alcanzar la longitud aprendida.
- Sin garantias de rendimiento en produccion: no se han publicado pruebas de latencia, throughput ni estabilidad bajo carga.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/chartreuse-verte/prose-rewriter-4b-v1.4
- Version anterior (v1.3): https://huggingface.co/chartreuse-verte/prose-rewriter-4b-v1.3
- Version pequena (1.7B): https://huggingface.co/chartreuse-verte/prose-rewriter-1.7b-v1.4
- Ficha en llm-explorer (v1.2): https://llm-explorer.com/model/chartreuse-verte%2Fprose-rewriter-4b-v1.2,3wC8gcszWMo5z4CNGPYAGF
- Despliegue en FriendliAI (v1.3): https://friendli.ai/models/chartreuse-verte/prose-rewriter-4b-v1.3
