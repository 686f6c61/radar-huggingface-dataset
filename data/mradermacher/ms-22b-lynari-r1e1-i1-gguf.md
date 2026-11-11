# mradermacher/MS-22B-Lynari-R1E1-i1-GGUF

## Resumen

MS-22B-Lynari-R1E1-i1-GGUF es una coleccion de cuantizaciones GGUF, generadas con imatrix, del modelo alfitaria-legacy/MS-22B-Lynari-R1E1. El trabajo de cuantizacion lo firma mradermacher, un publicador habitual de versiones GGUF de modelos abiertos, y esta pensado para ejecutar el modelo en llama.cpp y entornos compatibles con GGUF (Ollama, LM Studio, etc.). El modelo base es un merge construido con mergekit, segun las etiquetas de la model card, y cuenta con 22.247.282.688 parametros totales (aproximadamente 22,2 mil millones), lo que lo situa en la franja de modelos densos de tamano medio.

La relevancia de esta publicacion es practica: el modelo original probablemente se distribuye en safetensors, y estas cuantizaciones permiten desplegarlo en hardware mas modesto. El repositorio ocupa 50,4 GB e incluye desde cuantizaciones de 2 bits (i1-Q2_K, 8,4 GB) hasta 4 bits (i1-Q4_K_S, 12,8 GB), ademas del fichero imatrix empleado para calibrar la cuantizacion. El autor indica que las cuantizaciones IQ suelen ser preferibles a las no-IQ de tamano similar.

No se dispone de informacion sobre la longitud de contexto, el proceso de entrenamiento, los datos utilizados ni los resultados de benchmarks, ni en la model card del cuantizador ni en los metadatos de Hugging Face. El idioma declarado es unicamente ingles y la licencia no aparece especificada. Todo ello limita la evaluacion tecnica del modelo base, aunque la ficha recoge lo que si esta documentado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base construido con mergekit; arquitectura del transformer subyacente no especificada) |
| Parametros totales | 22.247.282.688 (22,2 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-IQ3_XXS, i1-IQ3_M, i1-Q4_K_S (listadas en la model card); el autor menciona tambien Q3_K_M, Q4_K_M, Q5_K_M, Q6_K, IQ2_M, IQ1_M, IQ4_XS, entre otras, en los metadatos internos |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones); fichero imatrix para calibracion |

## Arquitectura y entrenamiento

El modelo base, alfitaria-legacy/MS-22B-Lynari-R1E1, es un merge realizado con mergekit, segun las etiquetas de la model card. Esto implica que sus pesos proceden de la combinacion de dos o mas modelos preexistentes mediante alguna tecnica de fusion (no se especifica cual: linear, SLERP, TIES, DARE, etc.). No hay informacion sobre la arquitectura interna del transformer subyacente, el numero de capas, la dimension oculta, el tipo de atencion ni el tokenizador.

Tampoco se documentan los datos de entrenamiento, el numero de tokens, la composicion del dataset ni si hubo fases de RLHF, DPO o ajuste fino supervisado. La unica innovacion tecnica documentada es la propia cuantizacion: mradermacher genera cuantizaciones con imatrix (matriz de importancia) para mejorar la calidad en bits bajos, y ofrece el fichero imatrix para que otros puedan crear sus propias cuantizaciones. El autor advierte que las cuantizaciones IQ suelen superar a las no-IQ de tamano similar y que i1-Q2_K es probablemente inferior a IQ3_XXS.

## Capacidades

- Generacion de texto conversacional: la etiqueta "conversational" en los metadatos sugiere un ajuste orientado a dialogo, aunque no se detalla el formato de prompt.
- Razonamiento y generacion de texto general: capacidades inferidas del tamano (22,2 B) y de la etiqueta "base_model", pero sin documentacion especifica.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles segun el campo "language".
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Despliegue local en estaciones de trabajo: con la cuantizacion i1-Q4_K_S (12,8 GB) el modelo puede ejecutarse en una GPU consumer de 16 GB o en CPU con RAM suficiente, lo que permite probar un modelo de 22 B sin infraestructura de datacenter.
- Prototipado de asistentes conversacionales en ingles: la etiqueta "conversational" y el formato GGUF facilitan integrarlo en Ollama o LM Studio para experimentar con dialogos multi-turno.
- Evaluacion comparativa de merges: al ser un merge con cuantizaciones disponibles, sirve para comparar el comportamiento de tecnicas de fusion frente a modelos base en tareas de generacion abierta.
- Generacion de texto en pipelines offline: con llama.cpp se puede integrar en scripts de procesamiento por lotes (resumenes, reescritura, clasificacion) sin dependencia de APIs externas.
- Investigacion sobre cuantizacion: el fichero imatrix y las distintas variantes (Q2 a Q4) permiten estudiar el impacto de la cuantizacion en la perplejidad y la calidad de salida.
- Educacion y experimentacion: al caber en hardware asequible en sus versiones de 2-3 bits, es util para aprender a desplegar modelos GGUF y comparar configuraciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun el tamano del fichero GGUF mas margen para KV cache):
  - i1-Q2_K (8,4 GB): en torno a 9-10 GB de VRAM.
  - i1-IQ3_XXS (8,7 GB): en torno a 9-10 GB.
  - i1-IQ3_M (10,2 GB): en torno a 11-12 GB.
  - i1-Q4_K_S (12,8 GB): en torno a 14-15 GB.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_S con contexto amplio; RTX 4080/4070 Ti Super (16 GB) para Q4_K_S o IQ3_M; RTX 4060 Ti 16 GB para IQ3; GPUs de 8-12 GB solo con cuantizaciones de 2-3 bits o descarga parcial a CPU.
- Cabe en GPU consumer: si, en las cuantizaciones de 2 a 4 bits, siempre que se disponga de al menos 10-16 GB de VRAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y cualquier runtime compatible con GGUF. vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que requeririan los pesos originales en safetensors.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| MS-22B-Lynari-R1E1 (este, cuantizado) | 22,2 B | no disponible | no disponible | GGUF | Merge con mergekit; solo ingles; sin benchmarks publicos |
| Mistral Small 22B | 22 B | 32k (segun version) | Apache 2.0 (segun version) | safetensors, GGUF | Modelo denso ampliamente documentado y con benchmarks publicos |
| Qwen2.5-32B | 32 B | 128k | Apache 2.0 | safetensors, GGUF | Mayor tamano y contexto; multilingue |
| Gemma 2 27B | 27 B | 8k | Gemma license | safetensors, GGUF | Similar franja de tamano; benchmarks publicos |

La comparacion es orientativa: no hay datos de rendimiento del modelo evaluado, por lo que no puede establecerse una equivalencia cualitativa con las alternativas.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publica de calidad, razonamiento o codigo, lo que impide recomendarlo para produccion sin evaluacion propia.
- Licencia no especificada: no se puede confirmar el uso comercial; hay que consultar el modelo base (alfitaria-legacy/MS-22B-Lynari-R1E1) antes de desplegarlo.
- Solo ingles: el campo de idioma declara unicamente "en"; el rendimiento en castellano es incierto.
- Modelo merge sin documentacion de entrenamiento: al desconocerse los datos y el proceso, no pueden evaluarse sesgos ni riesgos de alucinacion de forma sistematica.
- Cuantizaciones de 2 bits: el propio autor advierte que i1-Q2_K es de calidad inferior y recomienda IQ3_XXS en su lugar; para uso serio conviene Q4_K_S o superior.
- Contexto desconocido: sin datos sobre la ventana de contexto, no debe asumirse soporte para conversaciones largas o documentos extensos.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion por parte de la comunidad.
- Fecha de creacion futura en los metadatos (2026-11-11): conviene verificar la integridad y procedencia de los ficheros antes de usarlos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/MS-22B-Lynari-R1E1-i1-GGUF
- Modelo base: https://huggingface.co/alfitaria-legacy/MS-22B-Lynari-R1E1
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/MS-22B-Lynari-R1E1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#MS-22B-Lynari-R1E1-i1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
