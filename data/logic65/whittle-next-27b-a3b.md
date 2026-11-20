# logic65/Whittle-Next-27B-A3B

## Resumen

Whittle-Next-27B-A3B es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por el autor independiente logic65, presentado como una vista previa de investigación sobre la arquitectura experimental `qwen4_exp` (Qwen4-Next). Se construye a partir del modelo base Qwen/Qwen3.6-35B-A3B mediante un proceso de destilación por fases (v1 a v4.4) que incorpora componentes poco habituales: hyper-connections, una memoria n-gram con hash de 2.000 millones de filas y embeddings por capa. El modelo tiene 27.568.288.915 parámetros totales según los safetensors, y su repo ocupa 596,5 GB al incluir pesos completos, estado de entrenamiento y registros.

El objetivo declarado no es ofrecer un modelo de propósito general terminado, sino servir como punto de partida reproducible para quien quiera construir sobre la arquitectura Qwen4-Next: un cuerpo que ya carga y ejecuta en llama.cpp estándar, con los tensores de memoria n-gram y hyper-connections conectados, junto con el contrato de hash, el entrenador y el exportador. La destilación se apoya en trazas de razonamiento completas de un modelo profesor (Qwen3.8-27B / Qwen3.8-Flash-Next) y se distribuye con licencia Apache 2.0.

Es relevante ahora porque documenta públicamente una línea de investigación sobre memoria externa hasheada y destilación online de trazas de pensamiento, con registros de evaluación por versión y una implementación funcional en llama.cpp sin parches. El autor indica que el modelo ha sido superado como buque insignia por Whittle-Qwen-3.8-35B-A3B, de modo que este checkpoint debe tratarse como artefacto de investigación y línea base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con hyper-connections, memoria n-gram hasheada y embeddings por capa (formato `qwen4_exp`) |
| Parametros totales | 27.568.288.915 |
| Parametros activos | no disponible (el nombre A3B sugiere ~3B activos, sin confirmacion en la informacion) |
| Longitud de contexto | no disponible (evaluado hasta 75k tokens en el arnes de lectura del autor) |
| Tipos de cuantizacion | GGUF Q8_0 a Q3_K_M (repositorio separado); pesos completos en safetensors |
| Idiomas soportados | en, zh, multilingual |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (raiz y `bf16-v4.3/`), GGUF en repo aparte |

## Arquitectura y entrenamiento

El modelo parte del cuerpo de Qwen3.6-35B-A3B y lo reconfigura en el formato Qwen4-Next (`qwen4_exp`), un transformer MoE al que se añaden tres elementos: hyper-connections (corrientes residuales alternativas que el autor describe como genuinamente distintas entre sí), una memoria n-gram hasheada de 2.000 millones de filas y embeddings por capa. En la fase v4 la memoria se sustituyó por una transferencia exacta de la tabla n-gram del propio Qwen3.8-Flash-Next, y se entrenaron las capas posteriores al punto de inyección para que aprendieran a leerla. La destilación se realizó en línea sobre trazas de pensamiento completas del profesor, con una fase final (v4.4) que desbloqueó simultáneamente todas las partes entrenables y destiló sobre 1.840 trazas completas de matemáticas y revisión de código.

El entrenamiento se organizó en cuatro fases entre el 3 y el 18 de septiembre de 2026. La destilación solo de expertos sobre trazas de pensamiento eliminó los desbordamientos de respuesta larga en la sonda de razonamiento (de 6 en 40 a 0). El autor reporta que la versión v4.4 está mediblemente más cerca del profesor, aunque no se detallan las métricas de esa comparación en la información disponible. No se especifican el número total de tokens de entrenamiento ni la composición completa del dataset.

## Capacidades

- Generación de texto conversacional en inglés, chino y otros idiomas (etiqueta multilingual).
- Razonamiento con modo de pensamiento (thinking on/off) y trazas de razonamiento destiladas del profesor.
- Matemáticas de nivel escolar: resolución de problemas tipo GSM8K con y sin modo thinking.
- Código: la destilación incluye trazas de revisión de código y el modelo se ha evaluado sobre pull requests reales.
- Lectura de contexto largo: evaluación con ficheros de repositorio y un pull request real entre 4k y 75k tokens.
- Memoria n-gram hasheada como componente de recuperación interna (no es tool calling).
- Soporte de tool calling y uso multi-paso: no confirmado para este checkpoint; el autor lo atribuye a la línea sucesora Whittle-Qwen-3.8-35B-A3B.
- Ejecución en llama.cpp estándar sin parches, además de transformers.
- Compatibilidad declarada con endpoints (`endpoints_compatible` en los tags).

## Casos de uso

- Investigación sobre arquitecturas con memoria externa: el repo incluye tabla n-gram, contrato de hash, entrenador y exportador, lo que permite reproducir y modificar el mecanismo de memoria sin partir de cero.
- Destilación de trazas de razonamiento: las 1.840 trazas completas de matemáticas y revisión de código sirven como referencia para estudiar cómo se transfiere el comportamiento de un profesor a un alumno MoE.
- Evaluación de lectura de contexto largo en código: el arnés sobre pull requests reales (4k a 75k tokens) es un banco de pruebas concreto para medir degradación con la distancia.
- Despliegue local con llama.cpp: los GGUF de Q8_0 a Q3_K_M permiten ejecutar el modelo en entornos sin infraestructura de servido dedicada.
- Línea base para comparativas de arquitectura: al compartir cuerpo con Qwen3.6-35B-A3B, permite aislar el efecto de hyper-connections y memoria n-gram frente al modelo original.
- Estudio de estabilidad en generación larga: la eliminación de desbordamientos en la sonda de pensamiento es un caso documentado de control de respuestas runaway mediante destilación.
- Prototipado de asistentes de revisión de código en chino e inglés, aprovechando el soporte bilingüe y el entrenamiento sobre trazas de revisión.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index; no verificados de forma independiente.

| Benchmark | Configuracion | Resultado |
|---|---|---|
| GSM8K (200 preguntas, thinking off, limite 512 tokens) | v3 Q8_0 GGUF, llama.cpp estándar | 86,5 % exact match |
| GSM8K (200 preguntas, thinking on, limite 2048 tokens) | v3 Q8_0 GGUF | 86,5 % exact match |
| Lectura de contexto largo, 4k tokens | v4.3, Q8_0 | 100 % (6 preguntas) |
| Lectura de contexto largo, 8k tokens | v4.3, Q8_0 | 83,3 % |
| Lectura de contexto largo, 26k a 75k tokens | v4.3, Q8_0 | 66,7 % (el padre Qwen3.6-35B-A3B obtiene 100) |

El arnés de lectura de contexto largo emplea 6 preguntas verificables sobre un pull request real y ficheros de repositorio; las transcripciones no se publican por citar un repositorio privado. No se han publicado resultados de MMLU, HumanEval ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Con 27,57B parámetros totales, en BF16 el peso ronda los 55 GB; en Q8_0 unos 29 GB; en Q4_K_M aproximadamente 17 GB; en Q3_K_M en torno a 13-14 GB (estimaciones por tamaño, no publicadas por el autor).
- Al ser MoE, el cómputo por token es menor que el de un denso del mismo tamaño, pero todos los pesos deben residir en memoria o mapearse desde disco.
- GPU recomendadas: A100 80 GB o H100 para BF16 completo; RTX 4090 (24 GB) viable en Q8_0 ajustado o Q4_K_M con holgura.
- GPU de consumo: sí, en Q4_K_M o Q3_K_M sobre GPU de 16-24 GB; en Q3_K_M podría caber en 12-16 GB según overhead de contexto.
- Despliegue: llama.cpp estándar (soporte explícito, sin parches), GGUF Q8_0 a Q3_K_M; transformers para los safetensors. Soporte de vLLM o TGI no disponible en la información.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GSM8K | Licencia | Notas |
|---|---|---|---|---|---|
| Whittle-Next-27B-A3B | 27,57B (MoE) | no disponible (evaluado a 75k) | 86,5 % (200 preguntas) | Apache 2.0 | Vista previa de investigación, memoria n-gram hasheada |
| Qwen3.6-35B-A3B (padre) | 35B (MoE) | no disponible | no disponible | no disponible en la información | Obtiene 100 en el arnés de lectura larga del autor |
| Whittle-Qwen-3.8-35B-A3B (sucesor) | 35B (MoE) | no disponible | no disponible | no disponible en la información | Memoria n-gram de 10B cargada funcionalmente; tool use multi-paso corregido |
| Whittle-Next-26B-A3B (predecesor) | 26B (MoE) | no disponible | no disponible | no disponible en la información | Base directa de esta versión |

## Limitaciones y advertencias

- El autor declara explícitamente que no es un modelo de propósito general terminado: debe tratarse como artefacto de investigación y línea base, no como producto.
- Rendimiento degradado en contexto largo: 66,7 % en 26k-75k tokens frente al 100 % del modelo padre en el mismo arnés.
- Evaluaciones no verificadas: todos los benchmarks son autodeclarados (`verified: false`) y GSM8K se limita a 200 preguntas con topes de 512 y 2048 tokens.
- El arnés de contexto largo usa solo 6 preguntas y sus transcripciones no son públicas, lo que impide reproducir la medición.
- No hay datos publicados de MMLU, HumanEval, sesgos, tasas de alucinación ni evaluación de seguridad.
- Idiomas: cobertura confirmada en inglés y chino; el resto de idiomas bajo la etiqueta multilingual no está cuantificado.
- Soporte de tool calling y agentes multi-paso no confirmado para este checkpoint; el autor lo sitúa en la línea sucesora.
- Licencia Apache 2.0 permite uso comercial, pero el estado de investigación y la falta de evaluación independiente desaconsejan producción sin validación propia.
- El repositorio incluye estado de entrenamiento y registros (596,5 GB), lo que complica su descarga y despliegue en entornos con almacenamiento limitado.
- El autor señala que el presupuesto de cómputo está agotado y que la destilación completa prevista no se ha ejecutado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/logic65/Whittle-Next-27B-A3B
- GGUF para llama.cpp: https://huggingface.co/logic65/Whittle-Next-27B-A3B-GGUF
- Predecesor: https://huggingface.co/logic65/Whittle-Next-26B-A3B
- Sucesor: https://huggingface.co/logic65/Whittle-Qwen-3.8-35B-A3B
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Registros de evaluación v3: https://huggingface.co/logic65/Whittle-Next-27B-A3B/tree/main/eval/v3
- Registro de entrenamiento v4.3: https://huggingface.co/logic65/Whittle-Next-27B-A3B/tree/main/train/graft-20260912
- Apoyo al autor: https://ko-fi.com/davida81328
