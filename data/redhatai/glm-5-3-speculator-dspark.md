# RedHatAI/GLM-5.3-speculator.dspark

## Resumen

GLM-5.3-speculator.dspark es un modelo borrador (*draft model*) para decodificación especulativa, desarrollado por Red Hat AI como complemento del modelo objetivo zai-org/GLM-5.3. No es un modelo de lenguaje autónomo: su función es proponer tokens candidatos que el modelo grande verifica en paralelo, acelerando la inferencia sin alterar la distribución de salida. Implementa el algoritmo DSpark, una extensión de DFlash que añade una cabeza de Markov para modelar dependencias intra-bloque y una cabeza de confianza para predecir la aceptación por posición.

El borrador es una red de 3 capas de estilo Qwen3 con 1.249.565.313 parámetros (1,25 mil millones), que consume estados ocultos auxiliares de las capas 2, 20, 39, 58 y 75 del GLM-5.3 objetivo y propone hasta 8 tokens por paso de decodificación. Soporta la ventana nativa del modelo base, 1.048.576 tokens, lo que lo hace relevante para despliegues de contexto largo donde la latencia de generación es crítica.

Su interés práctico es inmediato: se integra en vLLM mediante el campo `speculative-config` y permite reducir el coste por token generado en producción. En el tramo de 524K a 1M tokens de la evaluación MRCR alcanza una tasa de aceptación del 41,16% y una longitud media aceptada de 4,293 tokens, con picos de 6,13 tokens en razonamiento matemático.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DSparkDraftModel (backbone de 3 capas estilo Qwen3, cabeza de Markov y cabeza de confianza); modelo objetivo: GlmMoeDsaForCausalLM |
| Parametros totales | 1.249.565.313 |
| Parametros activos | no disponible (el borrador no es MoE; el objetivo GLM-5.3 sí lo es) |
| Longitud de contexto | 1.048.576 tokens (contexto nativo de GLM-5.3) |
| Tipos de cuantizacion | no disponible para el borrador; el modelo objetivo dispone de una variante NVFP4 (RedHatAI/GLM-5.3-NVFP4) |
| Idiomas soportados | no disponible (heredados del modelo objetivo GLM-5.3) |
| Licencia | glm-5.3 (licencia custom de GLM-5.3, etiquetada como `other`) |
| Formato de pesos | safetensors, bfloat16 |
| Longitud maxima de borrador | 8 tokens por paso |
| Capas objetivo auxiliares | 2, 20, 39, 58, 75 |
| Vocabulario del borrador | 154.880 |
| Cabeza de confianza | Markov vanilla, rango 256 |
| Longitud de secuencia de entrenamiento | 8.192 |
| Anclas maximas | 1.024 |
| Libreria | speculators 0.7.0.dev108 |
| Tamano del repo | 2,5 GB |
| Fecha de publicacion | 2026-09-16 (version 1.0) |

## Arquitectura y entrenamiento

El modelo es un borrador especulativo de tipo DSpark. Su columna vertebral son 3 capas transformer de estilo Qwen3 que toman como entrada los estados ocultos de cinco capas intermedias del GLM-5.3 (2, 20, 39, 58 y 75), lo que le permite condicionar las propuestas en representaciones internas ricas del modelo objetivo en lugar de solo en los tokens previos. Sobre esa base, DSpark incorpora dos componentes diferenciales: una cabeza de Markov de rango 256 que modela las dependencias entre tokens dentro del mismo bloque propuesto, y una cabeza de confianza que estima la probabilidad de aceptación de cada posición, habilitando una verificación adaptativa.

El entrenamiento se realizó con la librería Speculators sobre 1.811.739 secuencias preparadas de 8.192 tokens durante una época completa, con extracción de estados ocultos servida por vLLM y cuatro rangos FSDP para el entrenamiento del borrador. Se inicializó en caliente desde un checkpoint D-Spark de GLM-5.3 y completó 88.226 pasos de optimizador con una función de pérdida combinada (`ce: 0.1`, `tv: 0.9`), factor de cabeza de confianza 1.0 y `max_anchors` de 1024. La validación se ejecutó sobre 8 GPU NVIDIA B300 con tensor parallelism 4. El cómputo de entrenamiento fue proporcionado por Verda.

## Capacidades

- Generación especulativa de hasta 8 tokens por paso de decodificación para el modelo objetivo GLM-5.3.
- Predicción de aceptación por posición mediante cabeza de confianza, lo que permite ajustar dinámicamente cuántos tokens verificar.
- Modelado de dependencias intra-bloque gracias a la cabeza de Markov, que mejora la coherencia de las propuestas en bloques largos.
- Soporte de contexto largo: opera con la ventana nativa de 1.048.576 tokens del modelo objetivo.
- Aceleración verificada en tareas de código, matemáticas, QA, RAG, resumen, traducción, tool calling y escritura (ver tabla de aceptación).
- Integración nativa con vLLM mediante `speculative-config` con `method: "dspark"`.
- No realiza tool calling, razonamiento ni generación autónoma por sí mismo: todas esas capacidades pertenecen al modelo objetivo que verifica sus propuestas.

## Casos de uso

- Servicio de inferencia de GLM-5.3 en producción: desplegar el borrador junto al modelo objetivo en vLLM con `num_speculative_tokens: 8` para reducir la latencia por token generado en cargas interactivas, especialmente en decodificación de secuencias largas.
- Generación de código en pipelines de CI/CD: con una longitud media aceptada de 4,76 tokens en HumanEval y una aceptación del 85,4% en la primera posición, el borrador acelera la síntesis de parches y la generación de tests donde el modelo objetivo se usa como generador principal.
- Razonamiento matemático y STEM: la mayor longitud aceptada (6,13 tokens en math_reasoning) lo hace idóneo para asistentes de resolución de problemas paso a paso, donde la salida es predecible y el borrador acierta con frecuencia.
- Procesamiento de documentos de contexto muy largo: en el tramo de 524K a 1M tokens de MRCR mantiene un 41,16% de aceptación, útil para pipelines de análisis de contratos, expedientes o bases de conocimiento extensas donde cada token cuenta.
- Resumen y RAG en atención al cliente: las categorías de summarization (4,24 de longitud aceptada en Speedbench) y RAG (3,56) son las de mejor rendimiento, adecuadas para resumir tickets e hilos de conversación multi-turno.
- Traducción y localización automatizada: con 4,16 de longitud aceptada en el dataset de translation, acelera la generación de traducciones de alta calidad servidas por GLM-5.3.
- Tool calling y agentes: la aceptación de 4,01 en tool_call permite acelerar la generación de llamadas estructuradas en orquestadores de agentes, siempre que el modelo objetivo gestione la lógica y la verificación.
- Despliegue con cuantización NVFP4: combinado con RedHatAI/GLM-5.3-NVFP4 y tensor parallelism 4, reduce los requisitos de VRAM del objetivo manteniendo la aceleración especulativa.

## Benchmarks y rendimiento

Tasas de aceptación por posición (longitud media aceptada y porcentaje de aceptación en cada una de las 8 posiciones del borrador):

| Dataset | Longitud aceptada | Pos 0 | Pos 1 | Pos 2 | Pos 3 | Pos 4 | Pos 5 | Pos 6 | Pos 7 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| HumanEval | 4,76 | 85,4% | 70,0% | 56,9% | 46,4% | 38,1% | 31,6% | 26,2% | 21,8% |
| math_reasoning | 6,13 | 92,7% | 83,9% | 75,3% | 66,4% | 59,3% | 51,8% | 44,7% | 38,3% |
| qa | 3,18 | 74,5% | 51,9% | 34,8% | 22,8% | 14,8% | 9,4% | 5,9% | 3,8% |
| question | 3,20 | 73,1% | 49,7% | 33,6% | 22,8% | 15,9% | 11,2% | 8,0% | 5,8% |
| rag | 3,74 | 78,8% | 59,5% | 43,6% | 32,0% | 23,4% | 16,8% | 11,9% | 8,2% |
| summarization | 3,92 | 83,4% | 65,3% | 48,5% | 35,5% | 25,0% | 16,8% | 10,6% | 6,4% |
| tool_call | 4,01 | 79,2% | 60,1% | 45,3% | 34,6% | 26,9% | 21,6% | 17,9% | 15,0% |
| translation | 4,16 | 82,7% | 66,1% | 52,1% | 39,6% | 29,7% | 20,8% | 14,7% | 10,2% |
| writing | 3,19 | 72,8% | 49,4% | 33,4% | 22,8% | 15,9% | 11,2% | 8,1% | 6,0% |

Aceptación cualitativa en Speedbench:

| Categoria | Peticiones | Longitud aceptada | Tasa de aceptacion |
|---|---:|---:|---:|
| Coding | 89 | 3,4982 | 31,23% |
| Humanities | 88 | 2,5214 | 19,02% |
| Math | 98 | 3,2884 | 28,61% |
| Multilingual | 80 | 3,3527 | 29,41% |
| QA | 80 | 2,8791 | 23,49% |
| RAG | 105 | 3,5632 | 32,04% |
| Reasoning | 190 | 2,7324 | 21,66% |
| Roleplay | 158 | 2,3956 | 17,45% |
| STEM | 86 | 2,8352 | 22,94% |
| Summarization | 80 | 4,2409 | 40,51% |
| Writing | 84 | 2,5305 | 19,13% |
| Pooled overall | 1.138 | no disponible (truncado en la model card) | no disponible (truncado en la model card) |

Evaluacion de contexto largo: en el tramo de 524K a 1M tokens de MRCR, 41,16% de tasa de aceptación y 4,293 tokens de longitud media aceptada. No se han publicado resultados de benchmarks de calidad del modelo objetivo en la informacion disponible.

## Requisitos de hardware

- VRAM del borrador: aproximadamente 2,5 GB en bfloat16 (1,25 mil millones de parámetros), más el espacio de activaciones y estados ocultos auxiliares.
- VRAM del modelo objetivo: no disponible en la informacion proporcionada; GLM-5.3 es un modelo MoE de gran tamano y requiere despliegue multi-GPU. La model card valida con 8 GPU NVIDIA B300 y tensor parallelism 4, y recomienda tensor parallelism 8 para el checkpoint completo en bfloat16.
- GPU recomendadas: NVIDIA B300 (hardware de validación), H100 o A100 para el objetivo en bfloat16; la variante NVFP4 permite reducir a tensor parallelism 4.
- GPU de consumo: el borrador por sí solo cabe en cualquier GPU consumer con 4 GB o más de VRAM libre, pero no es utilizable sin el modelo objetivo, que no cabe en hardware consumer.
- Opciones de despliegue: vLLM con `--speculative-config '{"model":"RedHatAI/GLM-5.3-speculator.dspark","num_speculative_tokens":8,"method":"dspark"}'`. No se documenta soporte en llama.cpp, Ollama ni TGI.
- Latencia y throughput: no se publican cifras absolutas de latencia o tokens por segundo; la mejora depende de la tasa de aceptación, que oscila entre 17,45% (roleplay) y 40,51% (summarization) en Speedbench.

## Comparativa con modelos similares

No se dispone de datos de otros borradores especulativos comparables en la informacion proporcionada (tasas de aceptación, parámetros o licencia de alternativas como EAGLE, Medusa o borradores DFlash para GLM-5.3). La comparación con el modelo objetivo no procede porque cumplen funciones distintas.

| Modelo | Parametros | Contexto | Funcion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RedHatAI/GLM-5.3-speculator.dspark | 1,25 mil millones | 1.048.576 | Borrador especulativo DSpark para GLM-5.3 | glm-5.3 | Hugging Face (1.193 descargas) |
| zai-org/GLM-5.3 | no disponible | 1.048.576 | Modelo objetivo generativo | glm-5.3 | Hugging Face |
| RedHatAI/GLM-5.3-NVFP4 | no disponible | no disponible | Checkpoint cuantizado del objetivo | glm-5.3 | Hugging Face |
| Otros borradores (EAGLE, Medusa, DFlash) | no disponible | no disponible | Decodificacion especulativa | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo de lenguaje utilizable de forma aislada: requiere el modelo objetivo zai-org/GLM-5.3 y la librería Speculators o vLLM con soporte del método `dspark`.
- La aceleración es variable: en categorías como roleplay (17,45%) o humanities (19,02%) el beneficio es modesto, y en escritura libre la longitud aceptada cae a 3,19 tokens.
- La tasa de aceptación decae con la posición dentro del bloque: en QA baja del 74,5% en la primera posición al 3,8% en la octava, por lo que el límite de 8 tokens no se aprovecha en todos los dominios.
- Licencia glm-5.3 (etiquetada como `other`): es una licencia custom que hay que revisar antes de uso comercial; no es una licencia open source estándar.
- Los sesgos y riesgos de alucinación son los del modelo objetivo GLM-5.3, no los del borrador, que solo propone tokens verificados.
- El rendimiento en contexto largo está documentado solo para el tramo de 524K a 1M tokens de MRCR; no hay datos para ventanas intermedias o para otros idiomas.
- La model card está truncada en la fila agregada de Speedbench, por lo que no se dispone del dato global agrupado.
- El checkpoint se publicó como versión 1.0 con fecha de septiembre de 2026 y última actualización en noviembre de 2026; conviene verificar compatibilidad con la versión de vLLM y Speculators en producción.
- No se documentan requisitos de cuantización del borrador ni soporte en runtimes distintos de vLLM.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RedHatAI/GLM-5.3-speculator.dspark
- Modelo objetivo GLM-5.3: https://huggingface.co/zai-org/GLM-5.3
- Checkpoint cuantizado NVFP4 del objetivo: https://huggingface.co/RedHatAI/GLM-5.3-NVFP4
- Librería Speculators: https://github.com/vllm-project/speculators
- Verda (proveedor de cómputo de entrenamiento): https://verda.com/
