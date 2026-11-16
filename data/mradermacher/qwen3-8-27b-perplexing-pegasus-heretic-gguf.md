# mradermacher/Qwen3.8-27B-Perplexing-Pegasus-Heretic-GGUF

## Resumen

`mradermacher/Qwen3.8-27B-Perplexing-Pegasus-Heretic-GGUF` es una coleccion de cuantizaciones estaticas en formato GGUF del modelo `webbrain-one/Qwen3.8-27B-Perplexing-Pegasus-Heretic`, un modelo de 27.320.697.856 parametros (aproximadamente 27,3 mil millones) construido sobre la familia Qwen (la etiqueta interna es `qwen3_5`). El autor de las cuantizaciones es mradermacher, conocido en el ecosistema por publicar versiones GGUF de modelos abiertos para su uso con llama.cpp y derivados.

El modelo base se presenta como una variante "heretic" y "abliterated/uncensored/decensored", es decir, un ajuste que elimina o reduce los mecanismos de rechazo del modelo original, orientado a usos sin filtros de contenido. Ademas, la model card menciona capacidades conversacionales, multimodales y etiquetas como `typed-decisions`, `mtp` y `systemone`, aunque no se detalla su significado tecnico en la informacion disponible.

Esta ficha cubre la version GGUF, que es la que se distribuye en este repositorio. El interes practico radica en disponer de cuantizaciones listas para inferencia local de un modelo de 27B con licencia Apache 2.0, lo que permite desplegarlo en hardware de consumo de gama alta o en servidores con GPU unica, a costa de las consideraciones eticas y de seguridad asociadas a un modelo "abliterated".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen, etiqueta `qwen3_5`); detalles no disponibles |
| Parametros totales | 27.320.697.856 (~27,3 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS, f16; ademas mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | en (segun metadatos) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base original en safetensors |
| Tamano del repo | 79,7 GB |
| Libreria declarada | transformers |
| Modelo base | webbrain-one/Qwen3.8-27B-Perplexing-Pegasus-Heretic |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base mas alla de que pertenece a la familia Qwen (etiqueta `qwen3_5`) y que es un transformer de aproximadamente 27,3 mil millones de parametros. La model card del repositorio GGUF no describe la composicion del dataset de entrenamiento, el numero de tokens, ni si se aplicaron tecnicas de RLHF, DPO o similares.

Las etiquetas `heretic`, `abliterated`, `uncensored` y `decensored` indican que el modelo base ha sido modificado para eliminar o atenuar el comportamiento de rechazo tipico de los modelos alineados, probablemente mediante tecnicas de abliteration (ablacion de direcciones de activacion asociadas al rechazo). Las etiquetas `typed-decisions`, `mtp` y `systemone` aparecen en los metadatos pero no se explica su significado tecnico en la informacion proporcionada. Tampoco se documenta ninguna innovacion de decodificacion o atencion especifica.

## Capacidades

- Generacion de texto conversacional multi-turno (etiqueta `conversational`).
- Capacidades multimodales: el repositorio incluye ficheros `mmproj` (proyector multimodal) en Q8_0 y f16, lo que sugiere soporte de entrada de imagenes, aunque no se detalla su alcance.
- Modelo "abliterated/uncensored": responde sin los filtros de rechazo habituales del modelo original.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: los metadatos solo declaran ingles (`en`).
- Modo de razonamiento explicito (thinking mode): no disponible.
- Capacidades de codigo y matematicas: no documentadas en la informacion disponible.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo permite estudiar el comportamiento de un modelo "abliterated" frente a su version alineada, comparando tasas de rechazo y tipos de respuesta en entornos controlados de laboratorio.
- Generacion creativa sin restricciones de contenido: escritura de ficcion, guiones o narrativa adulta donde el modelo original rechazaria peticiones; el caracter "uncensored" es el factor determinante.
- Prototipado local de asistentes conversacionales: con cuantizaciones Q4_K_M o Q5_K_M se puede desplegar en una GPU de consumo de gama alta (24 GB) para pruebas de concepto sin depender de APIs externas.
- Analisis de imagenes en pipelines locales: los ficheros `mmproj` permiten combinar el modelo con llama.cpp para tareas de descripcion o extraccion de informacion de imagenes, siempre que se valide la calidad del proyector.
- Evaluacion de cuantizaciones: el repositorio ofrece un abanico amplio (desde Q2_K hasta f16) que permite medir la degradacion de perplejidad y calidad en funcion del tamano, util para decidir el compromiso optimo en produccion.
- Experimentacion con despliegue en CPU/GPU mixto: gracias al formato GGUF y a las variantes de baja precision (Q2_K, Q3_K), es posible ejecutar el modelo en equipos con VRAM limitada o incluso en CPU, a costa de latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun cuantizacion y el tamano de 27,3 B parametros):
  - Q2_K: ~10-12 GB.
  - Q3_K_M: ~14-16 GB.
  - Q4_K_M: ~17-19 GB.
  - Q5_K_M: ~20-22 GB.
  - Q6_K: ~23-25 GB.
  - Q8_0: ~29-31 GB.
  - f16: ~55-57 GB.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M/Q5_K_M; RTX 3090 (24 GB) similar; A100 40 GB o H100 para Q8_0 y f16; multiples GPU para f16.
- Cabe en GPU de consumo: si, en RTX 4090/3090 con cuantizaciones Q4_K_M o inferiores; en GPUs de 16 GB solo con Q2_K/Q3_K y posible offload parcial a CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. Para el componente multimodal se requiere llama.cpp con soporte de `mmproj`.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-Perplexing-Pegasus-Heretic (este) | ~27,3 B | no disponible | Apache 2.0 | GGUF | Abliterated, multimodal (mmproj), solo ingles declarado |
| Qwen2.5-32B-Instruct | ~32,5 B | 32k-128k (segun variante) | Apache 2.0 | safetensors, GGUF | Alineado, multilingue, benchmarks publicos |
| Gemma-2-27B-it | ~27 B | 8k | Gemma license | safetensors, GGUF | Alineado, contexto corto, restricciones de uso |
| Mistral-Small-24B-Instruct | ~24 B | 32k | Apache 2.0 | safetensors, GGUF | Alineado, multilingue, benchmarks publicos |

La comparativa con Qwen2.5-32B, Gemma-2-27B y Mistral-Small-24B es orientativa por tamano; no se dispone de datos de rendimiento del modelo evaluado para una comparacion cuantitativa.

## Limitaciones y advertencias

- Modelo "abliterated/uncensored": carece de los filtros de rechazo del modelo original, por lo que puede generar contenido ofensivo, ilegal o danino. No es adecuado para aplicaciones de cara al publico sin moderacion adicional.
- Riesgo de alucinacion: no se documenta ningun proceso de alineacion o evaluacion de fidelidad; el ajuste "heretic" puede degradar la coherencia en tareas de razonamiento.
- Solo se declara soporte de ingles; el rendimiento en castellano no esta verificado.
- Contexto maximo no documentado: no se puede planificar su uso en tareas de contexto largo sin validacion empirica.
- Las cuantizaciones de baja precision (Q2_K, Q3_K) degradan notablemente la calidad; para produccion se recomienda Q4_K_M o superior.
- No hay benchmarks publicados, por lo que no se puede verificar su rendimiento frente a alternativas.
- Aunque la licencia es Apache 2.0, el uso comercial de un modelo "uncensored" conlleva responsabilidad legal y reputacional; conviene revisar las politicas de la plataforma de despliegue.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3.8-27B-Perplexing-Pegasus-Heretic-GGUF
- Modelo base: https://huggingface.co/webbrain-one/Qwen3.8-27B-Perplexing-Pegasus-Heretic
- Pagina de descargas del autor: https://hf.tst.eu/model#Qwen3.8-27B-Perplexing-Pegasus-Heretic-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
