# mradermacher/Qwen3.8-27B-MPOA-heretic-i1-GGUF

## Resumen

Qwen3.8-27B-MPOA-heretic-i1-GGUF es una cuantizacion GGUF del modelo richardyoung/Qwen3.8-27B-MPOA-heretic, publicada por el usuario mradermacher, especializado en generar versiones cuantizadas de modelos abiertos. El modelo subyacente es una variante "heretic" (abliterated/decensored) de un modelo de la familia Qwen de aproximadamente 27 000 millones de parametros (26 895 998 464 parametros reales segun safetensors), lo que lo situa en la gama de modelos grandes aptos para despliegue local con hardware de gama alta.

La relevancia de esta ficha radica en que combina dos caracteristicas poco habituales: por un lado, es una variante "abliterated" que elimina los mecanismos de rechazo del modelo original, y por otro, se distribuye en formato GGUF con cuantizaciones de tipo imatrix (i1), lo que permite ejecutarlo en llama.cpp y derivados con distintos niveles de compresion. El repositorio ocupa 300,3 GB en total e incluye desde cuantizaciones IQ1_S de 7,2 GB hasta Q6_K de 22,2 GB.

La licencia declarada es apache-2.0, aunque las etiquetas del repositorio tambien mencionan openrail++, lo que genera cierta ambiguedad que conviene verificar antes de un uso comercial. El modelo esta etiquetado como conversational y unicamente en ingles, y la model card indica que se trata de un modelo de vision (los ficheros mmproj, si existen, residen en el repositorio estatico).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de la familia Qwen; no se detalla en la informacion proporcionada) |
| Parametros totales | 26 895 998 464 (~26,9 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K; incluye fichero imatrix |
| Idiomas soportados | en |
| Licencia | apache-2.0 (el repositorio tambien incluye la etiqueta openrail++) |
| Formato de pesos | GGUF (cuantizaciones i1/imatrix); el modelo base esta en formato transformers/safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base en la documentacion proporcionada. Por el nombre y el tamano (26,9 B de parametros), se trata de un transformer de la familia Qwen, pero no se especifica si emplea atencion estandar, atencion lineal, arquitectura MoE ni hibrida. Tampoco se detallan el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO o similares.

Lo que si se documenta es el proceso de cuantizacion: mradermacher ha generado cuantizaciones ponderadas con fichero imatrix (i1), lo que mejora la calidad respecto a cuantizaciones estaticas a igual tamano. El autor indica que las cuantizaciones IQ suelen ser preferibles a las no-IQ de tamano similar, y proporciona una tabla con tamanos y notas de calidad para cada variante. Ademas, el modelo base es una variante "heretic" (abliterated/decensored), un proceso de modificacion de pesos que elimina la direccion de rechazo del modelo, y se etiqueta como "reproducible".

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta conversational del repositorio.
- Razonamiento y respuesta a instrucciones propias de un modelo de ~27 B, aunque no se detallan capacidades especificas en la informacion disponible.
- Capacidad de vision: la model card indica explicitamente que es un modelo de vision y que los ficheros mmproj, si existen, estan en el repositorio estatico.
- Comportamiento "uncensored"/"decensored": el proceso de abliteration elimina los rechazos del modelo original, por lo que responde a peticiones que el modelo base rechazaria.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma.
- Modo thinking: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo permite estudiar el efecto de la abliteration comparando respuestas con el modelo base, util para analizar que comportamientos se eliminan y cuales se preservan tras el proceso.
- Generacion de texto creativo sin restricciones: para proyectos de escritura que requieren respuestas sin filtros de rechazo, el modelo puede generar contenido que el modelo original bloquearia, con la advertencia de responsabilidad que ello implica.
- Despliegue local en estaciones de trabajo: gracias a las cuantizaciones i1-Q4_K_M (16,6 GB) o i1-Q5_K_M (19,3 GB), el modelo puede ejecutarse en GPUs consumer de gama alta con 24 GB de VRAM, algo imposible con los pesos en safetensors completos.
- Prototipado de asistentes conversacionales en ingles: con llama.cpp u Ollama se puede levantar un endpoint compatible con la API de OpenAI para pruebas de producto, usando cuantizaciones Q4 o Q5 como compromiso calidad/velocidad.
- Experimentacion con modelos de vision: si se descargan los ficheros mmproj del repositorio estatico, el modelo puede emplearse en tareas de descripcion de imagenes o respuesta a preguntas visuales, aunque no se detallan los benchmarks.
- Fine-tuning y destilacion: las cuantizaciones de mayor tamano (Q6_K, 22,2 GB) sirven como referencia de calidad para comparar el impacto de la cuantizacion en tareas downstream, o como base para experimentos de merging.
- Evaluacion de robustez frente a jailbreaks: al ser un modelo abliterated, es un candidato natural para estudiar la eficacia de filtros de seguridad externos y sistemas de moderacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 8 y 10 GB para cuantizaciones IQ1/IQ2 (calidad muy degradada), 12-14 GB para IQ3/Q3, 15-17 GB para Q4, 19-22 GB para Q5/Q6. Hay que sumar el espacio para el contexto KV cache, que crece con la longitud de contexto.
- GPU recomendadas: para cuantizaciones Q4_K_M o superiores, una RTX 4090 (24 GB) o RTX 3090 (24 GB) es suficiente; para Q6_K conviene una GPU con 24 GB o mas, o repartir entre GPU y CPU. Para despliegue en servidor, A100 40/80 GB o H100 permiten cargar el modelo sin cuantizar o en Q8.
- Cabe en GPU consumer: si, en RTX 3090/4090 (24 GB) con cuantizaciones hasta Q6_K; en GPUs de 16 GB solo con IQ3 o inferiores; en GPUs de 8-12 GB solo con IQ1/IQ2, con calidad muy reducida.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, text-generation-webui, y servidores compatibles con la API de OpenAI mediante llama.cpp server. vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que para esos motores habria que usar los pesos safetensors del modelo base.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-MPOA-heretic-i1-GGUF (este) | ~26,9 B | no disponible | apache-2.0 / openrail++ | GGUF i1 | Variante abliterated, solo ingles, cuantizaciones de 7,2 a 22,2 GB |
| richardyoung/Qwen3.8-27B-MPOA-heretic | ~26,9 B | no disponible | no disponible | safetensors | Modelo base sin cuantizar del que deriva este repositorio |
| mradermacher/Qwen3.8-27B-MPOA-heretic-GGUF | ~26,9 B | no disponible | no disponible | GGUF estatico | Cuantizaciones estaticas del mismo modelo base, alternativa a las i1 |

No se dispone de informacion sobre otros modelos comparables de la misma categoria en la documentacion proporcionada.

## Limitaciones y advertencias

- El modelo es una variante abliterated/decensored: se han eliminado los mecanismos de rechazo, por lo que puede generar contenido danino, ofensivo o ilegal. No es apto para produccion sin filtros externos de moderacion.
- Solo soporta ingles segun la etiqueta de idioma; el rendimiento en castellano u otros idiomas no esta garantizado.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad factual; como todo modelo de ~27 B, puede inventar datos con seguridad aparente.
- La licencia presenta ambiguedad: el campo license indica apache-2.0, pero las etiquetas incluyen openrail++, que impone restricciones de uso. Conviene verificar la licencia del modelo base antes de un uso comercial.
- No se dispone de informacion sobre sesgos conocidos, longitud de contexto ni limites tecnicos especificos.
- Las cuantizaciones IQ1 e IQ2 degradan notablemente la calidad; el propio autor las describe como "for the desperate" o "mostly desperate". Para uso real se recomienda Q4_K_M o superior.
- El repositorio ocupa 300,3 GB, por lo que la descarga completa no es practica; conviene descargar solo la cuantizacion necesaria.
- El modelo base tiene 0 likes y no se ha validado de forma independiente en la informacion disponible; la calidad del proceso de abliteration no esta documentada con metricas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen3.8-27B-MPOA-heretic-i1-GGUF
- Modelo base: https://huggingface.co/richardyoung/Qwen3.8-27B-MPOA-heretic
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/Qwen3.8-27B-MPOA-heretic-GGUF
- Pagina de overview del autor: https://hf.tst.eu/model#Qwen3.8-27B-MPOA-heretic-i1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y peticiones de modelos: https://huggingface.co/mradermacher/model_requests
