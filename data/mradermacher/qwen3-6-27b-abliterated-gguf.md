# mradermacher/Qwen3.6-27B-abliterated-GGUF

## Resumen

Qwen3.6-27B-abliterated-GGUF es una coleccion de cuantizaciones en formato GGUF del modelo wangzhang/Qwen3.6-27B-abliterated, publicada por el cuantizador mradermacher. El modelo original es una variante "abliterated" (sin censura) de la familia Qwen3.6, con arquitectura densa de aproximadamente 26.900 millones de parametros (26.895.998.464 segun los pesos en safetensors) y capacidades multimodales (etiqueta vlm). Esta version GGUF permite ejecutar el modelo en hardware de consumo mediante llama.cpp y herramientas compatibles, sin necesidad de GPUs de datacenter.

La relevancia de esta ficha radica en dos factores. Primero, el proceso de abliteration elimina las direcciones de rechazo del modelo, lo que produce un modelo sin los filtros de seguridad habituales; esto lo hace util para investigacion sobre alineamiento y para tareas creativas o de red teaming, pero tambien conlleva riesgos importantes de uso. Segundo, las cuantizaciones GGUF abarcan desde Q2_K (10,8 GB) hasta Q8_0 (28,7 GB), lo que ofrece un abanico amplio de compromisos entre calidad y requisitos de VRAM.

El modelo base soporta ingles y chino, tiene licencia Apache 2.0 y se distribuye con la libreria transformers como referencia, aunque esta publicacion concreta esta orientada a inferencia con llama.cpp. La informacion disponible sobre contexto, datos de entrenamiento y benchmarks es limitada; los datos que no constan se indican como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con hybrid-attention y gated-deltanet (segun etiquetas del autor); variante abliterated; multimodal (vlm) |
| Parametros totales | 26.895.998.464 (~26,9 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estaticas); variantes imatrix en repo i1-GGUF |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo principal); safetensors en el modelo base |
| Tamano del repositorio | 186,3 GB (incluye todas las cuantizaciones) |
| Cuantizacion mas pequena | Q2_K, 10,8 GB |
| Cuantizacion mas grande | Q8_0, 28,7 GB |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de ~26,9 B de parametros. Las etiquetas del autor indican el uso de hybrid-attention y gated-deltanet, lo que sugiere una combinacion de mecanismos de atencion con capas de estado recurrente tipo DeltaNet con compuertas, un patron que varios modelos recientes han adoptado para reducir el coste computacional de contextos largos. Tambien se etiqueta como vlm, lo que implica capacidades de vision, aunque la model card no detalla la torre visual ni la resolucion de imagen soportada. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en el modelo original.

La innovacion principal de esta variante es el proceso de abliteration, descrito en las etiquetas como "iterative-abliteration", "abliterix", "deeprefusal-peel" y "lora-search-merged-release". Se trata de una tecnica que identifica y elimina las direcciones de activacion asociadas al rechazo de peticiones, aplicada de forma iterativa y combinada con busqueda de LoRA y fusion de pesos. El resultado es un modelo que responde a practicamente cualquier peticion sin negativas, lo que cambia sustancialmente su perfil de comportamiento respecto al modelo original. Esta publicacion concreta no entrena nada nuevo: solo convierte los pesos a GGUF con cuantizacion estatica (quantize_version 2, output_tensor_quantised 1) y omite el proyector multimodal en las cuantizaciones (skip_mmproj 1).

## Capacidades

- Generacion de texto conversacional multi-turno en ingles y chino.
- Razonamiento y respuesta a instrucciones sin filtros de rechazo (comportamiento abliterated).
- Capacidades multimodales (vlm) en el modelo base, aunque las cuantizaciones de este repo omiten el proyector multimodal (skip_mmproj), por lo que la vision no esta garantizada en estos ficheros GGUF.
- Soporte de tool calling y function calling: no confirmado en la informacion disponible; las etiquetas incluyen endpoints_compatible, lo que sugiere compatibilidad con APIs de inferencia, pero no se detalla el formato.
- Capacidades de agente y razonamiento multi-paso: no confirmado en la informacion disponible.
- Ejecucion local en CPU y GPU mediante llama.cpp y derivados (Ollama, LM Studio, koboldcpp) gracias al formato GGUF.
- Cuantizaciones imatrix adicionales disponibles en el repo i1-GGUF para mayor calidad a igual tamano.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: el modelo permite estudiar como cambia el comportamiento al eliminar las direcciones de rechazo, comparando respuestas con el modelo original no abliterated en experimentos controlados de red teaming.
- Generacion creativa sin restricciones: escritura de ficcion, guiones o narrativa que requiera tematicas adultas o controvertidas, donde los filtros de seguridad del modelo original bloquearian la salida; el contexto conversacional multi-turno es adecuado para desarrollar tramas largas.
- Despliegue local en estaciones de trabajo: con Q4_K_M (16,6 GB) el modelo cabe en una GPU de 24 GB (RTX 3090/4090) o en configuracion CPU+GPU con RAM suficiente, lo que permite uso offline sin enviar datos a terceros.
- Procesamiento de texto en ingles y chino: traduccion, resumen y analisis de documentos bilingues en entornos donde no se requiere censura de contenido, aprovechando el soporte nativo de ambos idiomas.
- Prototipado de asistentes conversacionales: la compatibilidad con endpoints (etiqueta endpoints_compatible) y el formato GGUF permiten montar rapidamente un servidor de inferencia con llama.cpp server u Ollama para pruebas de integracion.
- Experimentacion con cuantizacion: el abanico de 11 cuantizaciones (de Q2_K a Q8_0) permite medir el impacto de la cuantizacion en perplejidad y calidad de respuesta sobre un mismo modelo, util para investigacion de tecnicas de compresion.
- Analisis de contenido sensible en entornos de moderacion: como generador de casos adversarios para entrenar o evaluar clasificadores de toxicidad, dado que produce respuestas que los modelos alineados rechazan.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni metricas equivalentes, ni para el modelo original ni para las cuantizaciones. Tampoco se proporcionan datos de latencia o throughput medidos.

## Requisitos de hardware

- VRAM estimada segun cuantizacion (pesos + overhead de contexto, aproximado):
  - Q2_K: ~11-13 GB
  - Q3_K_M: ~14-16 GB
  - IQ4_XS: ~16-18 GB
  - Q4_K_M: ~17-20 GB
  - Q5_K_M: ~20-23 GB
  - Q6_K: ~23-26 GB
  - Q8_0: ~29-32 GB
- GPU recomendadas: RTX 4090/3090 (24 GB) para Q4_K_M y Q5_K_M con contexto moderado; A100 40 GB o H100 para Q8_0 con contexto largo; RTX 4060 Ti 16 GB para Q3_K_M o IQ4_XS con contexto reducido.
- Cabe en GPU de consumo: si, en RTX 3090/4090 para cuantizaciones Q4 y Q5; en GPUs de 16 GB solo con Q2_K o Q3_K_S y contexto limitado.
- Opciones de despliegue: llama.cpp (referencia para GGUF), Ollama, LM Studio, koboldcpp, llama-cpp-python y servidores compatibles con la API de llama.cpp. vLLM y TGI no soportan GGUF de forma nativa generalizada, por lo que para esos motores habria que usar el modelo base en safetensors.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.6-27B-abliterated-GGUF (este) | ~26,9 B denso | no disponible | GGUF | Apache 2.0 | Variante sin censura, multimodal en base, cuantizaciones sin proyector |
| wangzhang/Qwen3.6-27B-abliterated | ~26,9 B denso | no disponible | safetensors | Apache 2.0 | Modelo base de este repo, mismo comportamiento abliterated |
| Qwen3.6-27B (original, no abliterated) | ~26,9 B denso | no disponible | safetensors | Apache 2.0 | Modelo de referencia con filtros de seguridad; datos de rendimiento no disponibles en esta busqueda |
| Otras variantes abliterated de ~27 B | variable | variable | GGUF/safetensors | variable | Existen en el ecosistema, pero no se dispone de datos comparativos verificados en la informacion proporcionada |

No se dispone de datos de benchmarks que permitan una comparacion cuantitativa de rendimiento entre estos modelos.

## Limitaciones y advertencias

- Modelo abliterated: responde a practicamente cualquier peticion, incluidas las que implican contenido danino, ilegal o eticamente problematico. No debe desplegarse en produccion orientada a usuarios finales sin capas externas de moderacion.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad; como todo modelo de lenguaje, puede generar afirmaciones falsas con alta confianza, y la eliminacion de rechazos puede aumentar la propension a responder sin senalar incertidumbre.
- Sesgos: no hay informacion sobre evaluaciones de sesgo; el entrenamiento en ingles y chino implica que el conocimiento y los sesgos culturales estan dominados por esas dos lenguas.
- Limitaciones de idioma: solo se declaran en y zh; el rendimiento en castellano no esta garantizado ni evaluado.
- Vision no garantizada en estas cuantizaciones: el proceso omite el proyector multimodal (skip_mmproj), por lo que las capacidades vlm del modelo base pueden no estar operativas en los ficheros GGUF.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el usuario asume toda la responsabilidad legal sobre el contenido generado; la licencia no exime de cumplir normativa local sobre contenido.
- Cuantizaciones de baja calidad: Q2_K y Q3_K_S degradan notablemente la calidad; el propio autor marca Q3_K_M como "lower quality". Para uso serio se recomienda Q4_K_M o superior.
- Contexto desconocido: al no constar la longitud de contexto, no se puede garantizar el comportamiento en conversaciones largas ni el consumo de VRAM con contextos extensos.
- Repositorio de gran tamano: 186,3 GB en total; conviene descargar solo el fichero GGUF necesario y verificar la integridad de los ficheros multiparte.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3.6-27B-abliterated-GGUF
- Modelo base abliterated: https://huggingface.co/wangzhang/Qwen3.6-27B-abliterated
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Qwen3.6-27B-abliterated-i1-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Qwen3.6-27B-abliterated-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (README de referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre tipos de cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
