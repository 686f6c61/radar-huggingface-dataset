# ezolabs/DeepSeek-v4.1-v1017-Flash-EZO-UNCENSORED

## Resumen

DeepSeek-v4.1-v1017-Flash-EZO-UNCENSORED es una variante "abliterated" del checkpoint DeepSeek-V4.1-Flash-1017, publicada por EZO Labs. No es un modelo entrenado desde cero ni un fine-tune: es una edición a nivel de pesos que resta una dirección de rechazo de la matriz `attn.wo_b` en las capas 10 a 25, con un factor λ de 3,5 y 2,5 veces más allá de una proyección completa. El resto del modelo (expertos enrutados, expertos compartidos, cabezas MTP, torre de visión y embeddings) se mantiene idéntico al checkpoint base. Los pesos resultantes se recuantizan a FP8.

El modelo conserva la arquitectura del base, con 763.205.315.794 parámetros totales según los safetensors del repositorio y un tamaño de repo de 510,3 GB. La pipeline declarada es `image-text-to-text`, lo que implica soporte multimodal de imagen y texto, y la librería es transformers. La licencia es MIT y la fecha de publicación es el 7 de noviembre de 2026.

Su relevancia es doble: por un lado, demuestra una técnica de ablación quirúrgica sobre un modelo de gran escala con mediciones explícitas del coste en capacidad y alucinación; por otro, ofrece una alternativa con rechazos drásticamente reducidos (del 97,0% al 3,0% según el clasificador de reglas del autor) manteniendo el rendimiento en MMLU-Pro, GPQA-Diamond, MATH-500 e IFBench dentro de márgenes de décimas de punto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer del base DeepSeek-V4.1-Flash-1017 (con expertos enrutados, expertos compartidos y cabezas MTP; detalles completos no disponibles en la informacion proporcionada) |
| Parametros totales | 763.205.315.794 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (8-bit) en los pesos publicados |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura del checkpoint `deepseek-ai/DeepSeek-V4.1-Flash-1017` (revision `1bae0e10`). La model card menciona componentes propios de una arquitectura MoE con cabezas de decodificación especulativa: expertos enrutados, expertos compartidos y cabezas MTP (multi-token prediction). También incluye una torre de visión, coherente con la pipeline `image-text-to-text`. El número de parámetros activos, el número de expertos y la longitud de contexto no se detallan en la información disponible.

No hay entrenamiento de ningún tipo: ni fine-tuning, ni DPO, ni RLHF. La intervención consiste en una ablación a nivel de pesos que resta la dirección de rechazo de `attn.wo_b` en las capas 10 a 25 con λ = 3,5, aplicando 2,5 veces la proyección completa. Posteriormente los pesos se recuantizan a FP8. El autor documenta los efectos medidos de esta edición: el razonamiento se alarga 1,18 veces y la abstención en HalluLens cae 10,31 puntos porcentuales (de 33,53% a 23,22%, n=999).

## Capacidades

- Generación de texto y razonamiento multi-paso, con modo de pensamiento (`thinking`) configurable por esfuerzo (`high`, `max`).
- Procesamiento de imagen y texto (pipeline `image-text-to-text`), heredado de la torre de visión del base.
- Razonamiento matemático: 0,975 en GSM8K y 0,890 en MATH-500 en la porción de regresión del autor.
- Generación de código: 0,945 en HumanEval+ (163 de 164 problemas, el harness descarta HumanEval/32).
- Conocimiento experto: 0,907 en GPQA-Diamond.
- Seguimiento de instrucciones: 0,7433 en IFBench frente a 0,7233 del base.
- Reducción drástica de rechazos: 84,9% de eliminación de rechazos en JailbreakBench harmful a esfuerzo `high` según el juez LLM, y 3,0% de tasa de rechazo según el clasificador de reglas.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible explícitamente, aunque el modo de pensamiento y las cabezas MTP del base son compatibles con flujos de razonamiento extendido.

## Casos de uso

- Evaluación de seguridad y red-teaming: el modelo sirve como referencia para medir la eficacia de técnicas de abliteración sobre modelos de gran escala, comparando tasas de rechazo con y sin la edición y cuantificando el coste en abstención (HalluLens) y longitud de razonamiento.
- Investigación sobre alineación y direcciones de rechazo: permite estudiar cómo una única intervención en `attn.wo_b` de las capas 10 a 25 afecta al comportamiento de rechazo sin tocar expertos ni embeddings, aislando la contribución de esa matriz.
- Generación de código en entornos controlados: con 0,945 en HumanEval+ y 0,975 en GSM8K, es adecuado para tareas de síntesis de código y resolución de problemas matemáticos donde el operador asume la responsabilidad del contenido generado.
- Razonamiento científico y técnico: 0,907 en GPQA-Diamond lo hace útil para asistencia en preguntas de nivel doctorado en física, química y biología, siempre con verificación humana.
- Procesamiento de documentos con imagen y texto: la pipeline `image-text-to-text` permite extraer y razonar sobre información de capturas, diagramas o documentos escaneados combinados con instrucciones textuales.
- Investigación sobre sobre-rechazo: la suite FalseReject muestra una caída de 42,4 puntos porcentuales en rechazos indebidos (de 0,4816 a 0,0580), lo que lo convierte en un caso de estudio para calibrar clasificadores de rechazo en modelos alineados.
- Despliegue en pipelines de generación con FP8: los pesos en 8-bit y el formato safetensors permiten servirlo con stacks compatibles con transformers y FP8 en hardware con soporte nativo.

## Benchmarks y rendimiento

Resultados publicados por el autor. Las comparaciones contra el modelo base son no emparejadas (no se conservaron filas por ítem) y la comparación de rechazos cruza dos instrumentos distintos (juez LLM para el base, clasificador de reglas para esta build).

| Benchmark | Modelo base | Esta build | Delta | n |
|---|---:|---:|---:|---:|
| MMLU-Pro | 0,6395 | 0,6321 | −0,74 pp | no disponible |
| GPQA-Diamond | 0,9394 | 0,9394 | 0,00 pp | no disponible |
| MATH-500 | 0,910 | 0,920 | +1,0 pp | no disponible |
| IFBench | 0,7233 | 0,7433 | +2,0 pp | no disponible |
| GSM8K (regresión) | no disponible | 0,975 | — | 300 |
| MATH-500 frozen 4-shot (regresión) | no disponible | 0,890 | — | 100 |
| HumanEval+ (regresión) | no disponible | 0,945 | — | 163 |
| GPQA-Diamond (regresión) | no disponible | 0,907 | — | 198 |

Rechazos y abstención:

| Suite | Base | Esta build | Métrica | n |
|---|---:|---:|---|---:|
| JailbreakBench harmful, `high` | 0,970 (93/96) | 0,146 (14/96) | Eliminación 84,9% [77,4; 91,6], juez LLM | 96 |
| JailbreakBench harmful, `max` | 0,959 (93/97) | 0,175 (17/97) | Eliminación 81,7% [73,4; 89,2], juez LLM | 97 |
| JailbreakBench harmful, `high` | no ejecutado | 0,030 (6/200) | Clasificador de reglas, 2 ejecuciones | 100/ejecución |
| JailbreakBench harmful, `high`, 2026-10-31 | no ejecutado | 0,025 (5/200) | Clasificador de reglas | 100/ejecución |
| FalseReject p300, `max` | 0,4816 (144/299) | 0,0580 (17/293) | Juez LLM | 299 / 293 |
| HalluLens abstención | 33,53% | 23,22% | −10,31 pp | 999 |

## Requisitos de hardware

- VRAM estimada: con 763.205.315.794 parámetros en FP8, los pesos ocupan aproximadamente 763 GB, más overhead de activaciones y caché KV. No cabe en ninguna GPU de consumo actual.
- GPU recomendadas: se requiere un nodo multi-GPU de clase servidor. Para FP8 nativo, GPUs con soporte de FP8 (H100, H200, B200 o equivalentes). Con A100 (sin FP8 nativo) habría que usar variantes de cuantización adicionales, no publicadas en este repositorio.
- GPU de consumo: no cabe en RTX 4090, RTX 5090 ni similares, ni siquiera con cuantizaciones agresivas no publicadas.
- Opciones de despliegue: transformers (librería declarada), con soporte de FP8; stacks como vLLM o TGI requerirían verificar compatibilidad con la arquitectura `deepseek_v41` y el formato FP8 publicado. llama.cpp y Ollama no son viables a este tamaño sin cuantizaciones GGUF que no están en el repo.
- Latencia y throughput: no disponibles en la información proporcionada. El autor indica que el razonamiento se alarga 1,18 veces respecto al base, lo que incrementa el coste de inferencia en modo `thinking`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Rechazos | Disponibilidad |
|---|---:|---|---|---|---|
| DeepSeek-v4.1-v1017-Flash-EZO-UNCENSORED | 763,2 B | no disponible | MIT | 3,0% (clasificador de reglas) | Hugging Face, FP8 |
| DeepSeek-V4.1-Flash-1017 (base) | no disponible | no disponible | no disponible en la información | 97,0% (juez LLM) | Hugging Face |
| Alternativas abliterated de tamaño comparable | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de otros modelos abliterated de escala similar en la información proporcionada para establecer una comparación cuantitativa adicional.

## Limitaciones y advertencias

- No está libre de rechazos: el juez LLM mide un 14,6% de rechazos residuales en JailbreakBench harmful a esfuerzo `high` y un 17,5% a `max`. Si el flujo de trabajo exige respuesta en el 100% de los casos, hay que medir la lista propia.
- La abstención cae 10,31 puntos porcentuales en HalluLens (de 33,53% a 23,22%), lo que implica mayor propensión a responder cuando debería abstenerse. Riesgo elevado de alucinación en dominios donde el modelo no tiene certeza.
- El razonamiento se alarga 1,18 veces, con el consiguiente aumento de latencia y coste por consulta en modo `thinking`.
- La comparación de rechazos contra el base cruza dos instrumentos distintos (juez LLM vs. clasificador de reglas), por lo que no debe interpretarse como un delta emparejado.
- Las comparaciones de capacidad contra el base son no emparejadas y sin intervalo de confianza.
- No se ejecutaron OR-Bench, XSTest ni JailbreakBench-benign en esta build, por lo que el perfil de sobre-rechazo solo está caracterizado parcialmente (FalseReject).
- Idiomas soportados no documentados; el comportamiento multilingüe puede diferir del base de forma no medida.
- Licencia MIT permite uso comercial, pero el operador asume toda la responsabilidad legal y ética sobre el contenido generado por un modelo sin rechazos.
- El tamaño de 763 B en FP8 (≈763 GB de pesos) limita el despliegue a infraestructura de centro de datos.
- No hay información sobre sesgos específicos introducidos o amplificados por la ablación más allá de los efectos medidos en rechazo y abstención.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ezolabs/DeepSeek-v4.1-v1017-Flash-EZO-UNCENSORED
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- EZO Labs: https://ezolabs.io
