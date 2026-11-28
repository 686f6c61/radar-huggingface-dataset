# mradermacher/gemma-4-12B-it-abliterated-negative-emotions-i1-GGUF

## Resumen

`mradermacher/gemma-4-12B-it-abliterated-negative-emotions-i1-GGUF` es una publicacion de cuantizaciones GGUF generadas por mradermacher a partir del modelo base `andreafanfani/gemma-4-12B-it-abliterated-negative-emotions`. Se trata, por tanto, de un artefacto de distribucion (pesos cuantizados para inferencia local) y no de un modelo entrenado de forma original por el autor del repositorio. El modelo subyacente parte de la familia Gemma 4 de Google en su variante instruct de 12B, sobre la que se ha aplicado una tecnica de "abliteration" orientada a eliminar el sesgo hacia emociones negativas en las respuestas.

El interes practico del repositorio reside en que ofrece el modelo en multiples niveles de cuantizacion (desde IQ1_S hasta Q6_K) con el formato de cuantizacion por importancia (imatrix), lo que permite desplegarlo en hardware muy diverso, desde equipos de consumo con poca VRAM hasta estaciones de trabajo. El tamano del repositorio (47,3 GB) refleja la suma de todas las variantes publicadas, no el peso de una sola.

No obstante, la informacion disponible es muy limitada: la model card no incluye detalles sobre datos de entrenamiento, licencia, idiomas soportados ni resultados de benchmarks. Esto obliga a marcar numerosos campos como "no disponible" y a tratar cualquier dato tecnico del modelo base con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base derivado de la familia Gemma 4) |
| Parametros totales | 11.907.350.576 (11,9B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, Q3_K_S, Q3_K_M, Q3_K_L, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, IQ4_XS, small-IQ4_NL |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones con imatrix) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base en la documentacion proporcionada. Por el identificador y el numero de parametros (11,9B), se trata de una variante instruct de la familia Gemma 4, presumiblemente un transformer decoder-only, pero no se confirma en la model card. El repositorio en si no entrena ningun modelo: aplica cuantizacion GGUF con pesos de importancia (imatrix) sobre los pesos del modelo `andreafanfani/gemma-4-12B-it-abliterated-negative-emotions`.

La tecnica de abliteration del modelo base consiste en identificar y neutralizar direcciones en el espacio de activaciones asociadas a comportamientos indeseados (en este caso, "emociones negativas"), un proceso que suele implicar calculos de direcciones de rechazo y modificacion de pesos. No se especifican en la informacion disponible los detalles del dataset, el numero de tokens, ni si hubo fases de RLHF o DPO adicionales. Tampoco se documenta la innovacion tecnica de la cuantizacion mas alla de la mencion a imatrix y a la herramienta de conversion (convert_type: hf).

## Capacidades

- Generacion de texto conversacional: el tag "conversational" indica uso previsto para dialogos multi-turno.
- Formato instruct: el sufijo "it" del modelo base sugiere ajuste para seguir instrucciones.
- Modificacion de comportamiento afectivo: la abliteration busca reducir respuestas cargadas de emociones negativas.
- Compatibilidad con endpoints: el tag "endpoints_compatible" indica que el modelo puede servirse mediante APIs compatibles (por ejemplo, servidores de inferencia estandar).
- Capacidades de razonamiento, codigo, matematicas, vision o audio: no disponible en la informacion proporcionada.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.

## Casos de uso

- Despliegue local en equipos de consumo: gracias a las cuantizaciones Q4_K_M o Q5_K_M, el modelo puede ejecutarse en GPUs consumer con 8-12 GB de VRAM mediante llama.cpp u Ollama, permitiendo experimentar con un modelo de 12B sin infraestructura de centro de datos.
- Prototipado de asistentes conversacionales: el tag "conversational" y el ajuste instruct lo hacen adecuado para construir chatbots de prueba en local antes de escalar a produccion.
- Investigacion sobre abliteration y alineacion: util para estudiar como la modificacion de direcciones de activacion afecta al comportamiento afectivo y de rechazo en modelos abiertos.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece mas de veinte variantes, lo que permite medir el impacto de la cuantizacion (de IQ1_S a Q6_K) en calidad y velocidad sobre el mismo modelo base.
- Servicio de inferencia via API compatible: el tag "endpoints_compatible" facilita integrarlo en servidores tipo OpenAI-compatible para pruebas de integracion.
- Generacion de texto con recursos limitados: las variantes IQ2/IQ3 permiten ejecutar el modelo en hardware con menos de 6 GB de VRAM, a costa de perdida de calidad, para tareas de generacion no critica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun el tamano de cada cuantizacion; no confirmada por el autor):
  - IQ1_S / IQ1_M: en torno a 3-4 GB.
  - IQ2_XXS a IQ2_M: en torno a 4-5 GB.
  - Q3_K_S a Q3_K_L: en torno a 5,5-6,5 GB.
  - Q4_0 / Q4_1 / Q4_K_S / Q4_K_M: en torno a 7-8 GB.
  - Q5_K_S / Q5_K_M: en torno a 8,5-9,5 GB.
  - Q6_K: en torno a 10-11 GB.
- GPU recomendadas: no indicadas por el autor. Por tamano, una RTX 3060 de 12 GB o superior puede alojar las variantes Q4 y Q5; una RTX 4090 (24 GB) permite Q6_K con holgura y contexto amplio; A100 o H100 son innecesarias para este tamano salvo por throughput agregado.
- Cabe en GPU consumer: si, en la mayoria de variantes Q4 y Q5 en GPUs de 8-12 GB; las variantes de baja cuantizacion caben en GPUs de 4-6 GB.
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con endpoints (el tag "endpoints_compatible" lo sugiere); vLLM y TGI no estan confirmados para este formato GGUF.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo, por lo que la comparativa se limita a caracteristicas estructurales y queda marcada como no concluyente.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| gemma-4-12B-it-abliterated-negative-emotions (i1-GGUF) | 11,9B | no disponible | no disponible | GGUF (multiples quants) | Objeto de esta ficha |
| Modelo base andreafanfani/gemma-4-12B-it-abliterated-negative-emotions | 11,9B | no disponible | no disponible | safetensors (presumible) | Origen de las cuantizaciones |
| Gemma 4 12B instruct (familia original) | ~12B | no disponible | no disponible | safetensors / GGUF | Referencia de la familia; comportamiento sin abliteration |

No se han identificado en la informacion proporcionada modelos comparables adicionales con datos verificables de rendimiento.

## Limitaciones y advertencias

- La model card no especifica licencia; no puede asumirse uso comercial sin verificar la licencia del modelo base y de la familia Gemma original.
- No se documentan los idiomas soportados; el comportamiento multilingue es incierto.
- No hay benchmarks publicados; el rendimiento real frente a otros modelos de 12B es desconocido.
- La abliteration puede degradar la coherencia, la seguridad o la utilidad del modelo en tareas que requieran rechazo adecuado de peticiones daninas; conviene evaluarlo antes de produccion.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no hay datos especificos de este ajuste.
- Las cuantizaciones de muy baja precision (IQ1, IQ2) degradan notablemente la calidad; no se recomiendan para tareas criticas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.
- El tamano del repo (47,3 GB) incluye todas las variantes; descargar solo la cuantizacion necesaria.
- No se confirma compatibilidad con vLLM o TGI; el formato GGUF esta pensado para llama.cpp y derivados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/gemma-4-12B-it-abliterated-negative-emotions-i1-GGUF
- Modelo base: https://huggingface.co/andreafanfani/gemma-4-12B-it-abliterated-negative-emotions
