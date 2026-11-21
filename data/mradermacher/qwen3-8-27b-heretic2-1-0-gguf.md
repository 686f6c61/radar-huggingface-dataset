# mradermacher/Qwen3.8-27B-Heretic2.1.0-GGUF

## Resumen

Qwen3.8-27B-Heretic2.1.0-GGUF es una distribucion de pesos cuantizados en formato GGUF del modelo symmetrisch/Qwen3.8-27B-Heretic2.1.0, publicada por mradermacher. El modelo subyacente es un derivado de la familia Qwen3 de Alibaba, con 26.895.998.464 parametros (aproximadamente 26,9 mil millones), sometido a un proceso de "abliteration" o decensurado (etiquetado como heretic, uncensored y abliterated) que elimina total o parcialmente los mecanismos de rechazo y alineacion de seguridad del modelo original. La relevancia de esta publicacion es practica: ofrece el modelo en un rango amplio de cuantizaciones estaticas (de Q2_K a Q8_0) que permiten ejecutarlo en hardware de consumo, algo imposible con los pesos completos en BF16.

El repositorio lo mantiene mradermacher, un conocido cuantizador de la comunidad que publica versiones GGUF de modelos populares, y esta pensado para su uso con llama.cpp y ecosistemas compatibles (Ollama, LM Studio, etc.). El modelo base esta declarado como symmetrisch/Qwen3.8-27B-Heretic2.1.0, del que no se aportan mas detalles en la informacion disponible. La licencia declarada es Apache 2.0, lo que en principio permite uso comercial, aunque las implicaciones del decensurado deben evaluarse con cuidado.

La model card es minimalista: se limita a listar los ficheros cuantizados, sus tamanos y notas de calidad, sin documentar arquitectura, contexto, datos de entrenamiento ni benchmarks. Esta ficha recoge lo que se puede verificar y marca explicitamente como "no disponible" todo lo que la informacion proporcionada no cubre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base derivado de la familia Qwen3; detalles no documentados) |
| Parametros totales | 26.895.998.464 (aprox. 26,9 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (segun la model card); resto no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con ficheros mmproj multimodales separados) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base en la documentacion proporcionada. Por el nombre y el tamano (26,9 B parametros) se infiere que deriva de la familia Qwen3, pero no se confirma si emplea attention estandar, atencion lineal, decodificacion especulativa u otras innovaciones. Tampoco se documentan el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO. Lo unico verificable es el proceso de decensurado (abliteration) aplicado por el autor del modelo base, que modifica los pesos para reducir los comportamientos de rechazo, y la cuantizacion estatica realizada por mradermacher con `quantize_version: 2` y `output_tensor_quantised: 1`.

La presencia de ficheros `mmproj` (multi-modal supplement) en Q8_0 y f16 indica que el modelo base incorpora capacidad multimodal, presumiblemente vision, aunque no se detalla que modalidades ni como se integran. La cuantizacion se ofrece en versiones estaticas; el autor remite a un repositorio separado (`mradermacher/Qwen3.8-27B-Heretic2.1.0-i1-GGUF`) para las cuantizaciones ponderadas con imatrix, que suelen ofrecer mejor relacion calidad/tamano.

## Capacidades

- Generacion de texto conversacional en ingles (unico idioma declarado en la model card).
- Capacidad multimodal: los ficheros mmproj sugieren soporte de entrada de imagenes, aunque no se documenta el alcance.
- Comportamiento decensurado: el proceso de abliteration reduce los rechazos del modelo base ante peticiones que normalmente serian bloqueadas.
- Tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: solo se declara ingles; el resto no disponible.
- Modo thinking u otras capacidades especiales: no documentado.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo permite estudiar como el proceso de abliteration afecta al comportamiento de rechazo y a la calidad general, comparandolo con el modelo base sin decensurar en tareas controladas.
- Generacion creativa sin restricciones de contenido: escritura de ficcion, guiones o narrativa que requiera tematicas que los modelos alineados rechazan, ejecutandose localmente con llama.cpp en una GPU de consumo con cuantizacion Q4_K_M (16,6 GB).
- Prototipado de asistentes conversacionales en ingles sobre hardware modesto: con Q3_K_M (13,4 GB) cabe en GPUs de 16 GB de VRAM, lo que permite iterar rapidamente sin infraestructura cloud.
- Analisis de documentos e imagenes: gracias a los ficheros mmproj, puede procesar capturas, diagramas o documentos escaneados junto con texto, siempre que se confirme la modalidad soportada.
- Evaluacion de cuantizaciones: el amplio catalogo (de Q2_K a Q8_0) permite medir el impacto de la compresion en la perplejidad y la calidad de respuesta, util para decidir el punto de equilibrio en despliegues reales.
- Despliegue local con Ollama o LM Studio: al ser GGUF, se integra directamente en estos entornos para uso personal o en estaciones de trabajo sin conexion, con Q4_K_S (15,7 GB) como opcion recomendada por el autor por velocidad.
- Base para fine-tuning o experimentos de decensurado adicional: sirve como punto de partida para investigadores que quieran comparar tecnicas de modificacion de pesos sobre un modelo ya modificado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y tampoco se aportan datos de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto): Q2_K 10,8 GB; Q3_K_S 12,2 GB; Q3_K_M 13,4 GB; Q3_K_L 14,4 GB; IQ4_XS 15,3 GB; Q4_K_S 15,7 GB; Q4_K_M 16,6 GB; Q5_K_S 18,8 GB; Q5_K_M 19,3 GB; Q6_K 22,2 GB; Q8_0 28,7 GB.
- Sumar aproximadamente 1 GB adicional si se usa la capacidad multimodal (mmproj Q8_0 0,7 GB o f16 1,0 GB).
- GPU consumer: Q4_K_M (16,6 GB) encaja en RTX 4090 (24 GB), RTX 4080 Super (16 GB, justo) y GPUs de 24 GB como RTX 3090. Q3_K_M (13,4 GB) cabe en RTX 4070 Ti Super (16 GB) y similares. Q2_K (10,8 GB) permite ejecucion en GPUs de 12 GB como RTX 3060.
- GPU profesional: A100 40/80 GB, H100 y L40S ejecutan sin problema Q8_0 (28,7 GB) con contexto amplio.
- Despliegue: llama.cpp (formato nativo), Ollama, LM Studio, y servidores compatibles con GGUF. vLLM y TGI no soportan GGUF de forma nativa para este formato, por lo que requeririan los pesos originales en safetensors.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-Heretic2.1.0-GGUF (este) | 26,9 B | no disponible | GGUF | Apache 2.0 | Decensurado, multimodal (mmproj), cuantizaciones Q2_K–Q8_0 |
| symmetrisch/Qwen3.8-27B-Heretic2.1.0 | 26,9 B | no disponible | safetensors | Apache 2.0 | Modelo base sin cuantizar del que deriva este |
| Modelo Qwen3 original de Alibaba | no disponible en la informacion | no disponible | safetensors | no disponible en la informacion | Version alineada de referencia, sin decensurar |
| Otras cuantizaciones GGUF de la comunidad | no disponible | no disponible | GGUF | segun autor | Alternativas de mradermacher u otros cuantizadores no documentadas aqui |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- El proceso de abliteration/decensurado elimina o reduce los filtros de seguridad: el modelo puede generar contenido danino, ilegal o sexualmente explicito sin rechazo, lo que exige controles adicionales si se expone a usuarios finales.
- Riesgo elevado de alucinacion y de respuestas factualmente incorrectas, agravado por la falta de documentacion sobre entrenamiento y evaluacion.
- Solo se declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta verificado y podria degradarse notablemente.
- La licencia Apache 2.0 permite uso comercial, pero el autor del modelo base no documenta restricciones adicionales; conviene verificar la cadena de licencias antes de un despliegue productivo.
- La model card no documenta sesgos conocidos, datos de entrenamiento ni evaluaciones de seguridad; no hay garantia de calidad mas alla de las notas subjetivas del cuantizador.
- Las cuantizaciones de baja precision (Q2_K, Q3_K_S) degradan la calidad de forma apreciable; el autor recomienda Q4_K_S o Q4_K_M para uso general y Q6_K o Q8_0 cuando la calidad es prioritaria.
- El repositorio ocupa 187,9 GB en total; descargar solo el fichero cuantizado necesario, no el repositorio completo.
- No se documenta la longitud de contexto soportada, por lo que no se debe asumir ninguna ventana concreta en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen3.8-27B-Heretic2.1.0-GGUF
- Modelo base: https://huggingface.co/symmetrisch/Qwen3.8-27B-Heretic2.1.0
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/Qwen3.8-27B-Heretic2.1.0-i1-GGUF
- Pagina de resumen y descargas del cuantizador: https://hf.tst.eu/model#Qwen3.8-27B-Heretic2.1.0-GGUF
- Guia de uso de GGUF (README de referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de modelos del cuantizador: https://huggingface.co/mradermacher/model_requests
- Empresa del cuantizador: https://www.nethype.de/
