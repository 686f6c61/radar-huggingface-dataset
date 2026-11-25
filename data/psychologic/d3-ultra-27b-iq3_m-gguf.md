# PsychoLogic/d3-ultra-27B-IQ3_M-GGUF

## Resumen

d3-ultra-27B-IQ3_M es una cuantización GGUF del modelo base vllm-sr/d3-ultra, publicada por el usuario PsychoLogic en Hugging Face. El modelo original tiene 26.895.998.464 parámetros (aproximadamente 27B) y está etiquetado por el autor como un "decision-model", es decir, un modelo orientado a emitir veredictos o decisiones sobre entradas estructuradas en lugar de generación libre de texto. La cuantización emplea el formato IQ3_M de llama.cpp y produce ficheros de 12,6 GB, pensados explícitamente para tarjetas gráficas de 16 GB de VRAM.

La relevancia de esta publicación no reside en el modelo en sí, sino en el trabajo de conversión: el autor documenta que el modelo base entrena con atención prefix-bidireccional (prefix_bidir), un esquema poco habitual en el que el bloque de estado solo atiende a sí mismo, el bloque de pregunta atiende a todo y las capas GDN permanecen causales. Para preservar esa semántica, se publican dos GGUFs con pesos idénticos que difieren únicamente en el flag `attention.causal`, y se aportan parches para el conversor de llama.cpp que detectan la configuración de decisión del modelo.

El autor reporta una diferencia sustancial entre ambas variantes medida sobre un arnés de 7.854 llamadas: la versión no causal alcanza un 87,8% de acuerdo con la línea base, frente al 76,3% de la variante causal. La licencia es Apache-2.0 y el repo ocupa 25,2 GB. No se dispone de información sobre idiomas soportados, benchmarks académicos ni arquitectura detallada más allá de lo citado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención prefix-bidireccional (prefix_bidir) y capas GDN causales; detalles completos no disponibles |
| Parametros totales | 26.895.998.464 (≈27B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ3_M (12,6 GB por fichero); KV cache q8_0 en las pruebas del autor |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (dos ficheros: no causal y causal) |

## Arquitectura y entrenamiento

El modelo base vllm-sr/d3-ultra es un transformer de aproximadamente 27B parámetros que, según la documentación de la cuantización, se entrena con un esquema de atención prefix-bidireccional: el bloque de estado atiende únicamente a sí mismo, el bloque de pregunta atiende a todo el contexto y las capas GDN (probablemente Gated DeltaNet u otro mecanismo de atención lineal) operan de forma causal. Esta configuración está codificada en la config de decisión del modelo (`prefix_bidir`) y es detectada por los parches del conversor de llama.cpp incluidos en el repo.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO u otras fases de alineamiento. Tampoco se detalla la innovación técnica más allá del esquema de atención mencionado. La cuantización se realizó con `convert_hf_to_gguf.py` y `llama-quantize` de llama.cpp (master `0a731cc` más los parches del directorio `patches/`).

## Capacidades

- Emisión de veredictos o decisiones estructuradas: el modelo está diseñado como "decision-model" y produce etiquetas como SHORT, PASS, LONG, VETO y CLOSE, según el arnés de evaluación del autor.
- Procesamiento de entradas con bloques diferenciados (bloque de estado y bloque de pregunta) gracias a la atención prefix-bidireccional.
- Conversación: la etiqueta `conversational` aparece en los tags del repo, aunque no se detalla el formato de prompt.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere integración con APIs de inferencia estándar.
- No se documentan capacidades de tool calling, agentes, visión, audio, matemáticas o generación de código.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Señalización de trading o gestión de posiciones: el modelo emite veredictos del tipo SHORT, LONG, VETO o CLOSE sobre entradas estructuradas, lo que encaja con un motor de decisión en un pipeline financiero; el arnés de 7.854 llamadas del autor sugiere ese tipo de evaluación.
- Sistemas de decisión con contexto de estado: la atención prefix-bidireccional permite que el bloque de pregunta consulte todo el estado previo, útil en motores de reglas o scoring donde el histórico condiciona la respuesta.
- Despliegue en estaciones con GPU de 16 GB: al ocupar 12,6 GB por fichero, cabe en tarjetas consumer como la RTX 5060 Ti (15.846 MiB) citada por el autor, lo que facilita prototipado local sin infraestructura de datacenter.
- Evaluación de políticas o filtros de admisión: la etiqueta VETO sugiere uso como clasificador de rechazo en pipelines de aprobación automática.
- Reproducción de investigación sobre atención no causal: los dos GGUFs y los parches permiten comparar el comportamiento causal frente al prefix-bidireccional en llama.cpp, útil para estudiar el impacto de las máscaras de atención.
- Servicio conversacional especializado: dado el tag `conversational` y la compatibilidad con endpoints, podría integrarse en un servicio de respuesta con lógica de decisión acoplada.

## Benchmarks y rendimiento

| Metrica | No causal (prefix_bidir) | Causal |
|---|---|---|
| Acuerdo con línea base (7.854 llamadas) | 87,8% | 76,3% |
| Distribución SHORT / PASS / LONG / VETO / CLOSE | 5340 / 1509 / 735 / 261 / 9 | 4348 / 2433 / 403 / 668 / 2 |
| Errores en el arnés | 0 | 0 |
| Hardware de medida | RTX 5060 Ti, 15.846 MiB, llama.cpp Docker, KV q8_0 | ídem |

No se han publicado resultados de benchmarks académicos (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada: 12,6 GB por fichero GGUF IQ3_M, más la KV cache (q8_0 en las pruebas del autor) y overhead de llama.cpp; el autor confirma funcionamiento en una RTX 5060 Ti de 15.846 MiB con un solo modelo residente.
- GPU recomendadas: RTX 5060 Ti 16 GB (verificada por el autor), RTX 4060 Ti 16 GB, RTX 4070 Ti Super 16 GB, RTX 4080/4090 (16-24 GB), A100/H100 para despliegues de mayor concurrencia.
- Cabe en GPU consumer de 16 GB; en tarjetas de 12 GB o menos no hay margen documentado.
- Opciones de despliegue: llama.cpp master (build estándar) con los dos ficheros; el autor menciona Docker; no se documenta compatibilidad con vLLM, TGI, Ollama u otros motores.
- Latencia y throughput: no disponibles; el autor solo reporta 0 errores en 7.854 llamadas, sin métricas de tiempo.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (decision-models de ~27B) ni datos de rendimiento de alternativas.

## Limitaciones y advertencias

- La variante no causal es una aproximación: llama.cpp sirve el fichero como bidireccional de prompt completo, y los estados ocultos del bloque de estado difieren de los del entrenamiento; las máscaras prefix_bidir exactas están pendientes de un fork.
- La variante causal pierde 11,5 puntos de acuerdo (76,3% frente a 87,8%) y desplaza masivamente la distribución de veredictos hacia PASS y VETO.
- El modelo base no documenta idiomas soportados, sesgos, tasas de alucinación ni composición del dataset de entrenamiento.
- Al ser un decision-model, su uso fuera del dominio de decisión para el que fue entrenado no está validado.
- No hay información sobre tool calling, agentes o razonamiento multi-paso; asumir esas capacidades sería especulativo.
- La licencia Apache-2.0 permite uso comercial, pero la atribución y la licencia del modelo base deben verificarse en su model card original.
- El repo tiene 425 descargas y 0 likes en el momento de la consulta, lo que indica validación comunitaria muy limitada.
- Los parches del conversor son necesarios para reconvertir el modelo; sin ellos, la detección de `prefix_bidir` falla.

## Enlaces

- Hugging Face (cuantización): https://huggingface.co/PsychoLogic/d3-ultra-27B-IQ3_M-GGUF
- Modelo base: https://huggingface.co/vllm-sr/d3-ultra
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
