# jekunz/smollm-360m-cpt-fineweb-faroese-transfer-from-equal-scandimerge-seed3

## Resumen

El modelo `jekunz/smollm-360m-cpt-fineweb-faroese-transfer-from-equal-scandimerge-seed3` es un ajuste fino de SmolLM2-360M-Instruct desarrollado por el usuario jekunz con fines de investigación en procesamiento de lenguas nórdicas, concretamente para el feroés (`fo`). Se construye en dos fases: primero un ajuste sobre una fusión TIES (con pesos iguales) de cinco modelos entrenados con porciones danesas, islandesas, noruego bokmål, noruego nynorsk y sueco de FineWeb-2, y después un ajuste específico sobre la porción feroesa del mismo corpus. El resultado es un modelo de 361.821.120 parámetros orientado a generación de texto conversacional en feroés.

La relevancia de este modelo reside en su enfoque de transferencia interlingüística entre lenguas escandinavas para una lengua de bajos recursos como el feroés, que apenas dispone de modelos específicos. El autor lo publica con licencia Apache 2.0 y lo describe explícitamente como un artefacto de investigación sin evaluación amplia, lo que condiciona su uso en producción.

Arquitecturalmente hereda la base de SmolLM2-360M-Instruct (transformer decoder-only de la familia Llama), con una longitud de contexto de entrenamiento de 2048 tokens. El repositorio ocupa 0,7 GB en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama, base SmolLM2-360M-Instruct) |
| Parametros totales | 361.821.120 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (longitud máxima de entrenamiento) |
| Tipos de cuantizacion | no disponible (el autor no publica variantes cuantizadas; al ser safetensors en fp32/bf16 es convertible a GGUF/AWQ mediante herramientas estándar) |
| Idiomas soportados | feroés (`fo`) como idioma objetivo; transferencia desde danés, islandés, noruego bokmål, noruego nynorsk y sueco |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de SmolLM2-360M-Instruct, un transformer decoder-only de la familia Llama con 361,8 millones de parámetros. El procedimiento de entrenamiento se articula en dos etapas secuenciales: en primer lugar, un ajuste sobre una fusión TIES con pesos iguales de cinco modelos independientes entrenados con las porciones danesa, islandesa, noruego bokmål, noruego nynorsk y sueca de FineWeb-2; en segundo lugar, un ajuste sobre la porción feroesa del mismo corpus. Esta estrategia busca aprovechar el conocimiento multilingüe escandinavo agregado para mejorar la transferencia hacia el feroés.

Los hiperparámetros publicados son: 1 época por lengua de origen y 5 épocas para el feroés, tasa de aprendizaje 5e-4 con scheduler coseno, ratio de warmup 0,05, batch size 8 con acumulación de gradientes de 32 pasos (batch efectivo de 256), longitud de contexto máxima de 2048 tokens y semilla 3 (una de tres semillas de entrenamiento para esta configuración). El entrenamiento se ejecutó en una única GPU A100 de 40 GB. No se detalla el número total de tokens procesados ni la composición exacta del dataset, ni se menciona el uso de RLHF, DPO u otras técnicas de alineación posteriores.

## Capacidades

- Generación de texto conversacional en feroés, heredada de la naturaleza instruct de SmolLM2-360M-Instruct.
- Transferencia interlingüística desde cinco lenguas escandinavas (danés, islandés, noruego bokmål, noruego nynorsk y sueco) hacia el feroés.
- Generación de texto general y respuesta a instrucciones, condicionada por el ajuste sobre datos de FineWeb-2.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte específico de agentes ni razonamiento multi-paso.
- No se documenta modo thinking, visión ni audio.
- Capacidades multilingües limitadas al feroés como idioma objetivo y a las lenguas escandinavas de origen; no se ha evaluado su comportamiento en otras lenguas.

## Casos de uso

- Investigación en transferencia interlingüística: el modelo sirve como punto de partida para estudiar cómo la fusión TIES de modelos escandinavos afecta al rendimiento en una lengua de bajos recursos como el feroés, comparando las tres semillas publicadas.
- Generación de texto en feroés para prototipos: útil para experimentar con generación de texto y respuestas conversacionales en feroés en entornos de investigación, dado que existen pocos modelos específicos para esta lengua.
- Aumento de datos sintéticos: puede emplearse para generar corpus sintéticos en feroés que alimenten posteriores ciclos de ajuste o evaluación de modelos mayores.
- Evaluación comparativa de estrategias de merge: al derivar de una fusión TIES con pesos iguales, permite comparar esta estrategia frente a otras (por ejemplo, merges ponderados o entrenamiento directo) en la misma base SmolLM2-360M.
- Experimentos de ajuste con recursos limitados: su tamaño de 361,8 millones de parámetros permite iterar en una sola GPU consumer, lo que lo hace adecuado para laboratorios con presupuesto reducido que investiguen lenguas de bajos recursos.
- Base para ajuste instruct en feroés: al partir de una base instruct, puede servir como punto de partida para ajustes supervisados adicionales con datos anotados en feroés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que el modelo "no ha sido evaluado más ampliamente todavía".

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,7 GB en fp16/bf16 (361,8 M de parámetros), alrededor de 0,4 GB en cuantización de 8 bits y 0,2 GB en 4 bits, sin contar el overhead del runtime.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; el entrenamiento se realizó en una A100 de 40 GB, pero la inferencia cabe holgadamente en tarjetas consumer.
- Cabe en GPU consumer: sí, en cualquier RTX 20xx/30xx/40xx, GTX 16xx con suficiente VRAM, e incluso en iGPU con memoria compartida suficiente.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`), llama.cpp/Ollama tras conversión a GGUF, y vLLM para serving.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jekunz/smollm-360m-cpt-fineweb-faroese-transfer-from-equal-scandimerge-seed3 | 361,8 M | 2048 | feroés (objetivo), escandinavas (origen) | Apache 2.0 | Hugging Face, 0 descargas |
| HuggingFaceTB/SmolLM2-360M-Instruct (modelo base) | 361,8 M | 2048 (entrenamiento original de SmolLM2) | multilingüe (principalmente inglés) | Apache 2.0 | Hugging Face, ampliamente utilizado |
| jekunz/smollm360m-da1-is1-nno1-nob1-sv1-ties (modelo base del ajuste) | 361,8 M | no disponible | danés, islandés, noruego bokmål, noruego nynorsk, sueco | Apache 2.0 (según repositorio base) | Hugging Face |
| Modelos específicos para feroés de tamaño comparable | no disponible | no disponible | feroés | no disponible | no disponible |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de estos modelos entre sí.

## Limitaciones y advertencias

- Modelo de investigación: el autor declara explícitamente que no ha sido evaluado más ampliamente, por lo que no se recomienda su uso en producción sin una evaluación previa.
- Riesgo de alucinación: al ser un modelo de 361,8 M de parámetros ajustado sobre datos web (FineWeb-2), la probabilidad de generar contenido factualmente incorrecto es alta.
- Sesgos: los datos de FineWeb-2 pueden contener sesgos presentes en la web; no se documenta ningún proceso de mitigación.
- Limitaciones de contexto: la longitud máxima de entrenamiento es de 2048 tokens, insuficiente para tareas que requieran contexto largo.
- Limitaciones de idioma: el modelo está orientado al feroés y no se ha evaluado en otras lenguas; su comportamiento fuera del feroés y de las lenguas escandinavas de origen es desconocido.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la falta de evaluación y las posibles obligaciones derivadas de los datos de FineWeb-2 deben verificarse antes de un despliegue comercial.
- Sin datos de benchmarks: no es posible comparar su calidad objetiva con alternativas.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la probabilidad de soporte comunitario o reportes de errores.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jekunz/smollm-360m-cpt-fineweb-faroese-transfer-from-equal-scandimerge-seed3
- Modelo base del ajuste: https://huggingface.co/jekunz/smollm360m-da1-is1-nno1-nob1-sv1-ties
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- SmolLM2-360M-Instruct (base original): https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct
