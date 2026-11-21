# mradermacher/Mag-Mell-Reasoner-12B-GGUF

## Resumen

Mag-Mell-Reasoner-12B-GGUF es la distribucion en formato GGUF del modelo Mag-Mell-Reasoner-12B, un modelo de lenguaje de 12.247.782.400 parametros (~12,25 mil millones) publicado por ChaoticNeutrals y cuantizado por mradermacher para su uso con llama.cpp y ecosistemas compatibles. El modelo base esta orientado a tareas de razonamiento y conversacion, y esta registrado en Hugging Face con la etiqueta `conversational` y el idioma ingles como unico idioma declarado.

Esta ficha cubre especificamente la version cuantizada, que ofrece 11 variantes de cuantizacion estatica (desde Q2_K hasta Q8_0) con tamanos que van de 4,9 GB a 13,1 GB, lo que permite desplegar un modelo de 12B en GPUs de consumo. El repositorio tambien enlaza a una version con cuantizacion ponderada/imatrix (i1) alojada en un repositorio separado, orientada a una mayor calidad por bit.

La relevancia de esta publicacion es practica: el autor original no distribuye pesos en GGUF, de modo que esta cuantizacion es la via para ejecutar el modelo en local con Ollama, llama.cpp o LM Studio. No obstante, la informacion publica sobre arquitectura, datos de entrenamiento y evaluacion del modelo base es practicamente inexistente en la model card, por lo que muchos apartados de esta ficha se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de tipo transformer, sin detalle publicado) |
| Parametros totales | 12.247.782.400 (~12,25 B) |
| Parametros activos | no aplica (no se ha documentado que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estaticas); versiones ponderadas/imatrix en repositorio i1 aparte |
| Idiomas soportados | en (ingles) |
| Licencia | other (licencia no estandar; consultar terminos del modelo base) |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de informacion publicada sobre la arquitectura interna del modelo base ChaoticNeutrals/Mag-Mell-Reasoner-12B: la model card del repositorio cuantizado no describe el tipo de transformer, el mecanismo de atencion, la composicion del dataset ni el proceso de alineacion (RLHF, DPO u otros). El unico dato estructural verificable es el recuento de parametros (12.247.782.400) y el hecho de que el modelo base se distribuye en safetensors y se ha convertido a formato HF para su cuantizacion.

En cuanto al proceso de cuantizacion, mradermacher indica en los metadatos internos de la model card `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, lo que sugiere una conversion desde pesos Hugging Face con cuantizacion por tensor de salida. Las variantes IQ (IQ4_XS) emplean cuantizacion con importancia, y el autor remite a un repositorio i1 independiente para las versiones ponderadas/imatrix de mayor calidad. No se documentan innovaciones tecnicas como decodificacion especulativa ni atencion lineal.

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta `conversational` del repositorio.
- Orientacion declarada al razonamiento (el nombre del modelo incluye "Reasoner"), aunque no se documenta un modo de pensamiento explicito ni formato de trazas de razonamiento.
- No hay evidencia publicada de soporte de tool calling o function calling.
- No hay evidencia publicada de capacidades de agente o razonamiento multi-paso estructurado.
- Multilingue: limitado al ingles segun el campo `language` de la model card.
- Sin capacidades de vision, audio ni multimodalidad documentadas.
- Compatible con endpoints (`endpoints_compatible` en los tags), lo que facilita su despliegue en infraestructuras de inferencia estandar.

## Casos de uso

- Prototipado local de asistentes conversacionales en ingles: con la cuantizacion Q4_K_M (7,6 GB) el modelo cabe en GPUs de consumo de 8-12 GB de VRAM, lo que permite iterar sobre prompts y flujos de chat sin coste de API.
- Experimentacion con razonamiento en entornos con recursos limitados: las variantes Q2_K (4,9 GB) y Q3_K_S (5,6 GB) permiten probar el modelo en equipos con 6-8 GB de VRAM o en CPU, a costa de calidad.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece 11 variantes del mismo modelo, lo que facilita medir el impacto de la cuantizacion en perplejidad y calidad de respuesta sobre una misma tarea.
- Despliegue en estaciones de trabajo sin GPU dedicada: mediante llama.cpp en CPU con las cuantizaciones Q4_K_S o Q4_K_M, adecuado para tareas de generacion offline por lotes.
- Integracion en pipelines de inferencia autoalojados: al ser GGUF y estar marcado como `endpoints_compatible`, puede servirse con llama.cpp server o vLLM (con soporte GGUF) en infraestructura propia.
- Fines de investigacion sobre modelos comunitarios: util para estudiar el comportamiento de fine-tunes de 12B no documentados y su degradacion bajo cuantizacion agresiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio cuantizado no incluye metricas (MMLU, HumanEval, GSM8K u otras) ni comparaciones con modelos similares, y tampoco se aportan datos de latencia o throughput.

## Requisitos de hardware

- VRAM estimada segun cuantizacion (tamano de fichero como referencia, mas overhead de contexto y KV cache):
  - Q2_K: 4,9 GB (viable en GPU de 6-8 GB).
  - Q3_K_S / Q3_K_M / Q3_K_L: 5,6-6,7 GB (GPU de 8 GB con contexto corto).
  - IQ4_XS / Q4_K_S / Q4_K_M: 6,9-7,6 GB (GPU de 8-12 GB; recomendado Q4_K_M).
  - Q5_K_S / Q5_K_M: 8,6-8,8 GB (GPU de 12 GB).
  - Q6_K: 10,2 GB (GPU de 12-16 GB).
  - Q8_0: 13,1 GB (GPU de 16-24 GB).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080, RTX 4090 (24 GB) para Q8_0 con contexto amplio; A100/H100 solo si se necesita servir a multiples usuarios.
- Cabe en GPU de consumo: si, en todas las cuantizaciones hasta Q8_0 con GPUs de 16 GB o mas; las variantes Q2-Q4 caben en 8 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama.cpp server y otros runners compatibles con GGUF. El repositorio no documenta compatibilidad con vLLM ni TGI.
- Latencia y throughput: no disponibles (no publicados por el autor).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Mag-Mell-Reasoner-12B-GGUF (este) | ~12,25 B | no disponible | other | GGUF | Fine-tune comunitario sin benchmarks publicados |
| Mistral Nemo 12B (referencia de tamano) | ~12 B | 128K (segun documentacion del modelo original) | Apache 2.0 | safetensors, GGUF | Modelo base ampliamente documentado y con benchmarks publicos |
| Gemma 2 9B (referencia de tamano cercano) | ~9 B | 8K (segun documentacion del modelo original) | Gemma Terms of Use | safetensors, GGUF | Alternativa con evaluacion publica y soporte amplio |
| Qwen2.5 14B (referencia de tamano cercano) | ~14 B | 32K (segun documentacion del modelo original) | Apache 2.0 (mayoria de variantes) | safetensors, GGUF | Mayor tamano y ecosistema de cuantizaciones maduro |

Nota: los datos de contexto y licencia de los modelos de comparacion corresponden a sus respectivas documentaciones publicas; no se dispone de datos de rendimiento del modelo de esta ficha para una comparacion cuantitativa.

## Limitaciones y advertencias

- Ausencia total de documentacion tecnica: no se publican datos de entrenamiento, arquitectura, contexto ni evaluacion, lo que impide validar su calidad frente a alternativas.
- Riesgo de alucinacion no caracterizado: al no haber benchmarks ni evaluaciones de seguridad, no puede estimarse su tasa de error en tareas factuales.
- Idioma: solo se declara ingles; el rendimiento en castellano no esta documentado y probablemente sea deficiente.
- Licencia "other": no es una licencia estandar; es imprescindible revisar los terminos del modelo base (ChaoticNeutrals/Mag-Mell-Reasoner-12B) antes de cualquier uso comercial.
- Modelo comunitario con muy poca traccion: 62 descargas y 1 like en el momento de la consulta, lo que reduce la probabilidad de soporte, correcciones o reportes de errores.
- Cuantizaciones agresivas (Q2_K, Q3_K_S) degradan la calidad; el propio autor marca Q3_K_M como "lower quality" y recomienda Q4_K_S/Q4_K_M como equilibrio rapido y Q8_0 como mejor calidad.
- Longitud de contexto desconocida: planificar el despliegue con contextos conservadores y verificar experimentalmente el limite real antes de usarlo en produccion.
- El repositorio ocupa 84,7 GB por incluir todas las variantes; descargar solo el fichero GGUF necesario.

## Enlaces

- Repositorio Hugging Face (cuantizaciones estaticas): https://huggingface.co/mradermacher/Mag-Mell-Reasoner-12B-GGUF
- Repositorio de cuantizaciones ponderadas/imatrix (i1): https://huggingface.co/mradermacher/Mag-Mell-Reasoner-12B-i1-GGUF
- Modelo base: https://huggingface.co/ChaoticNeutrals/Mag-Mell-Reasoner-12B
- Pagina de descargas del autor para este modelo: https://hf.tst.eu/model#Mag-Mell-Reasoner-12B-GGUF
- Guia de uso de GGUF (README de referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre tipos de cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
