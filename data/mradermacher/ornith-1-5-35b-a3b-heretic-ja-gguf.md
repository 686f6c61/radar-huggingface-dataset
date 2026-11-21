# mradermacher/Ornith-1.5-35B-A3B-heretic-ja-GGUF

## Resumen

Ornith-1.5-35B-A3B-heretic-ja-GGUF es una cuantizacion estatica en formato GGUF del modelo OS-Software/Ornith-1.5-35B-A3B-heretic-ja, publicada por mradermacher, un conocido generador de cuantizaciones de la comunidad. El modelo base es una variante "heretic" (abliterated/decensored) del Ornith 1.5 de ornith-ai, un modelo de 34.660.610.688 parametros totales con nomenclatura A3B que sugiere una arquitectura de mezcla de expertos (MoE) con aproximadamente 3.000 millones de parametros activos por token, aunque este dato no esta confirmado en la informacion disponible.

El interes de esta publicacion es doble: por un lado, ofrece el modelo en una bateria amplia de cuantizaciones GGUF (desde Q2_K de 13 GB hasta Q8_0 de 37 GB) para ejecucion local con llama.cpp y derivados; por otro, la variante "heretic" elimina los mecanismos de rechazo del modelo original, lo que lo hace adecuado para experimentacion con contenido sin filtros, a costa de asumir riesgos de seguridad y calidad considerables. La licencia declarada es MIT, lo que facilita su uso comercial, si bien el modelo base enlaza a una licencia propia del repositorio de ornith-ai.

La ficha se centra en la cuantizacion GGUF y en lo que se puede verificar a partir de los metadatos y la model card; los detalles de arquitectura, entrenamiento y benchmarks del modelo base no estan documentados en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (nomenclatura A3B sugiere MoE con ~3B activos; no confirmado) |
| Parametros totales | 34.660.610.688 |
| Parametros activos | no disponible (la designacion A3B apunta a ~3B, sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; ademas mmproj-Q8_0 y mmproj-f16 para multimodal |
| Idiomas soportados | en (segun metadatos; el sufijo "ja" del nombre no esta explicado en la model card) |
| Licencia | MIT (con enlace a la licencia del modelo base en ornith-ai/Ornith-1.5-35B-A3B) |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en safetensors/transformers |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base. El identificador "35B-A3B" sigue la convencion habitual de los modelos de mezcla de expertos, donde el primer numero indica los parametros totales y el segundo los parametros activos por token; el recuento real de safetensors (34.660.610.688) es coherente con esa lectura, pero no se confirma el numero de expertos, la estrategia de enrutamiento ni la dimension del estado oculto. Tampoco se documentan el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO.

El elemento diferencial de esta variante es el proceso "heretic", que en la practica de la comunidad combina tecnicas de abliteration (abliterated) y de adaptadores LoRA de rechazo (ara-lora) para eliminar la direccion de rechazo del espacio de activaciones del modelo. El resultado es un modelo que responde a peticiones que el original declinaria. La cuantizacion la realiza mradermacher con su pipeline habitual (convert_type hf, quantize_version 2, output_tensor_quantised 1) y ofrece una version alternativa con quants ponderados por imatrix en el repositorio Ornith-1.5-35B-A3B-heretic-ja-i1-GGUF.

## Capacidades

- Generacion de texto conversacional en ingles, con el estilo de respuesta de un modelo de gran tamano.
- Respuesta sin filtros de rechazo gracias a la variante heretic/abliterated, orientada a escenarios de investigacion sobre alineacion y seguridad.
- Soporte multimodal declarado mediante los ficheros mmproj (Q8_0 y f16), lo que implica capacidad de procesar imagenes junto a texto; no se detalla el alcance exacto.
- Compatibilidad con endpoints (tag endpoints_compatible), lo que sugiere integracion con APIs compatibles con OpenAI.
- Ejecucion local en CPU y GPU mediante llama.cpp y ecosistema GGUF.
- Capacidades de tool calling, agentes y razonamiento multi-paso: no documentadas en la informacion disponible.
- Capacidades multilingues: solo se declara ingles; el sufijo "ja" del nombre no se explica en la model card.

## Casos de uso

- Investigacion sobre alineacion y seguridad: comparar las respuestas del modelo heretic con las del Ornith original permite estudiar como la abliteration altera la distribucion de rechazos y la calidad en tareas sensibles.
- Despliegue local en estaciones de trabajo: con Q4_K_M (21,3 GB) el modelo cabe en una GPU de 24 GB o en una configuracion CPU+GPU, lo que permite prototipar sin depender de la nube.
- Generacion creativa sin restricciones: escritura de ficcion con tematicas adultas o controvertidas, donde los filtros del modelo base resultarian limitantes, asumiendo la responsabilidad editorial del contenido.
- Experimentacion con cuantizaciones: el repositorio permite comparar la degradacion de calidad entre Q2_K, IQ4_XS, Q4_K_M y Q8_0 sobre un mismo modelo, util para calibrar el compromiso tamano/calidad en pipelines propios.
- Procesamiento multimodal ligero: cargando el mmproj junto al GGUF se pueden explorar tareas de descripcion de imagenes o extraccion de informacion visual en local, sin confirmar el nivel de calidad.
- Evaluacion de robustez de filtros: usar el modelo como generador adversarial para probar clasificadores de contenido y sistemas de moderacion en produccion.
- Base para fine-tuning posterior: al ser un GGUF derivado de un modelo MIT, sirve como punto de partida para experimentos de destilacion o adaptacion con LoRA en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio GGUF no incluye metricas de MMLU, HumanEval, GSM8K ni comparaciones con otros modelos, y tampoco se aportan datos del modelo base.

## Requisitos de hardware

- VRAM estimada segun cuantizacion: Q2_K ~13 GB, Q3_K_S ~15,3 GB, Q3_K_M ~16,9 GB, Q3_K_L ~18,2 GB, IQ4_XS ~19 GB, Q4_K_S ~20 GB, Q4_K_M ~21,3 GB, Q5_K_S ~24,1 GB, Q5_K_M ~24,8 GB, Q6_K ~28,6 GB, Q8_0 ~37 GB. A estas cifras hay que sumar el espacio de contexto y, si se usa, el mmproj (0,7-1 GB).
- GPU recomendadas: RTX 3090/4090 (24 GB) para Q4_K_M o Q5_K_S con contexto moderado; A100 40 GB o H100 para Q6_K y Q8_0; RTX 4060 Ti 16 GB o RTX 4080 para Q3_K_M e inferiores.
- Cabe en GPU de consumo: si, desde Q2_K en tarjetas de 16 GB y Q4_K_M en tarjetas de 24 GB. Las cuantizaciones Q6_K y Q8_0 requieren GPU profesional o configuraciones multi-GPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y servidores compatibles con GGUF; el tag endpoints_compatible sugiere tambien servidores de inferencia con API compatible con OpenAI.
- Latencia y throughput: no disponibles. Como referencia estructural, un MoE con ~3B activos suele ser notablemente mas rapido que un denso de 35B, pero no hay mediciones publicadas en la informacion proporcionada.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento del modelo base ni de alternativas comparables, por lo que cualquier comparacion cuantitativa seria especulativa. Como referencia cualitativa, se puede situar frente a otras cuantizaciones GGUF de modelos MoE de tamano similar (por ejemplo, variantes de la familia Qwen MoE) y frente a modelos densos de 30-35B, pero sin cifras verificables de MMLU, HumanEval o GSM8K no es posible establecer una comparativa rigurosa.

## Limitaciones y advertencias

- La variante heretic elimina deliberadamente los rechazos de seguridad; puede generar contenido danino, ilegal o sexualmente explicito. No es apta para aplicaciones de cara al publico sin moderacion adicional.
- El proceso de abliteration suele degradar capacidades generales (razonamiento, codigo, instrucciones complejas) respecto al modelo original; no hay evaluaciones publicadas que cuantifiquen esta perdida.
- Riesgo elevado de alucinacion, especialmente en cuantizaciones bajas (Q2_K, Q3_K_S) y en tareas de conocimiento factual.
- Solo se declara soporte de ingles; el rendimiento en castellano no esta verificado y el sufijo "ja" del nombre no esta documentado.
- Longitud de contexto desconocida; no se debe asumir una ventana larga sin probarla.
- Licencia MIT declarada, pero el modelo base enlaza a la licencia del repositorio ornith-ai; conviene revisar ambas antes de un uso comercial.
- El repositorio ocupa 238,6 GB por la suma de todas las cuantizaciones; descargar solo el fichero necesario.
- La fecha de creacion (2026-08-23) y el reducido numero de descargas (783) y likes (1) indican poca validacion comunitaria; no hay reportes independientes de calidad.
- Los ficheros GGUF de gran tamano pueden estar divididos en varias partes; es necesario concatenarlas segun el procedimiento habitual de llama.cpp.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Ornith-1.5-35B-A3B-heretic-ja-GGUF
- Modelo base: https://huggingface.co/OS-Software/Ornith-1.5-35B-A3B-heretic-ja
- Quants con imatrix: https://huggingface.co/mradermacher/Ornith-1.5-35B-A3B-heretic-ja-i1-GGUF
- Pagina de resumen del autor: https://hf.tst.eu/model#Ornith-1.5-35B-A3B-heretic-ja-GGUF
- Licencia del modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B/blob/main/LICENSE
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
