# mradermacher/Fisher-R1-14B-GGUF

## Resumen

Fisher-R1-14B-GGUF es la distribucion en formato GGUF del modelo Fisher-R1-14B, un modelo de lenguaje de 14.770.033.664 parametros (aproximadamente 14,8 mil millones) desarrollado por el usuario May2222 y cuantizado por mradermacher. El modelo esta especializado en estadistica, contraste de hipotesis y uso de herramientas (tool use), y se distribuye bajo licencia Apache 2.0. Esta orientado exclusivamente al idioma ingles.

La relevancia de esta publicacion reside en que facilita el despliegue local del modelo original mediante el formato GGUF, compatible con llama.cpp, Ollama y otras herramientas de inferencia en CPU y GPU de consumo. El repositorio ofrece once variantes de cuantizacion estatica, desde Q2_K (5,9 GB) hasta Q8_0 (15,8 GB), lo que permite ajustar el modelo a distintos presupuestos de memoria.

No se dispone de informacion publica sobre la arquitectura interna, la longitud de contexto ni el proceso de entrenamiento del modelo base en la informacion proporcionada. La model card del repositorio se limita a describir el proceso de cuantizacion y las variantes disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 14.770.033.664 (aprox. 14,8 B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estaticas; no hay quants con imatrix) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (modelo base en safetensors) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base Fisher-R1-14B en la documentacion proporcionada. El nombre "R1" sugiere una posible inspiracion en la familia DeepSeek-R1, pero este dato no esta confirmado en la informacion disponible. Tampoco se detallan el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF, DPO o aprendizaje por refuerzo.

La unica informacion sobre datos de entrenamiento es la referencia al dataset May2222/P-Bench, que aparece en las etiquetas del repositorio y probablemente se utilizo para evaluar o afinar el modelo en tareas de contraste de hipotesis estadistico. El proceso de cuantizacion aplicado por mradermacher es de tipo estatico (quantize_version 2, output_tensor_quantised 1, convert_type hf), sin cuantizacion ponderada por imatrix, que el autor indica que no esta disponible en el momento de la publicacion.

## Capacidades

- Generacion de texto conversacional en ingles.
- Razonamiento estadistico y contraste de hipotesis, segun las etiquetas del modelo.
- Uso de herramientas (tool use / function calling), indicado en las etiquetas del repositorio.
- Compatibilidad con endpoints de inferencia (etiqueta endpoints_compatible).
- Capacidad conversacional multi-turno (etiqueta conversational).
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion disponible.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Capacidades de vision, audio o modo thinking explicito: no disponibles.

## Casos de uso

- Analisis estadistico asistido: el modelo puede interpretar resultados de tests de hipotesis, explicar p-valores, tamanos del efecto e intervalos de confianza en un contexto conversacional, aprovechando su especializacion declarada en estadistica.
- Automatizacion de informes de experimentos: integrado en pipelines de analisis, puede redactar resumenes interpretativos de resultados estadisticos generados por herramientas externas mediante tool calling.
- Asistente de investigacion en ciencias de datos: uso como copiloto para formular hipotesis nulas y alternativas, seleccionar pruebas adecuadas (t-test, chi-cuadrado, ANOVA) y justificar la eleccion.
- Despliegue local en estaciones de trabajo: gracias a las cuantizaciones Q4_K_S (8,7 GB) y Q4_K_M (9,1 GB), puede ejecutarse en GPUs de consumo con 12 GB o mas de VRAM mediante llama.cpp u Ollama.
- Prototipado de agentes con herramientas estadisticas: el soporte de tool use permite conectarlo a librerias como SciPy o statsmodels para ejecutar calculos reales y razonar sobre los resultados.
- Educacion y tutoria en estadistica: generacion de explicaciones paso a paso sobre conceptos de inferencia estadistica en ingles, con la ventaja de ejecucion privada y sin coste por token.
- Evaluacion de pipelines de cuantizacion: las once variantes permiten comparar la degradacion de calidad en tareas estadisticas segun el nivel de cuantizacion, util para decidir el equilibrio entre tamano y precision.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de MMLU, HumanEval, GSM8K ni metricas especificas sobre el dataset P-Bench, y la model card se limita a listar las cuantizaciones y su tamano en disco.

## Requisitos de hardware

- VRAM estimada para inferencia, segun cuantizacion: Q2_K ~5,9 GB; Q3_K_S ~6,8 GB; Q3_K_M ~7,4 GB; Q3_K_L ~8,0 GB; IQ4_XS ~8,3 GB; Q4_K_S ~8,7 GB; Q4_K_M ~9,1 GB; Q5_K_S ~10,4 GB; Q5_K_M ~10,6 GB; Q6_K ~12,2 GB; Q8_0 ~15,8 GB. A estos valores hay que anadir el espacio para el contexto KV cache, que depende de la longitud de contexto configurada.
- GPUs recomendadas: RTX 4090 (24 GB) para Q4 a Q8 con contexto amplio; RTX 4080 / 4070 Ti Super (16 GB) para Q4_K_M o Q5_K_M; RTX 4060 Ti (16 GB) para Q4_K_M; GPUs de 8 GB solo admiten Q2_K o Q3_K_S con contexto reducido. Para despliegues en servidor, A100 o H100 permiten Q8_0 con contexto largo y mayor throughput.
- Cabe en GPU de consumo: si, en modelos con 12 GB o mas de VRAM para cuantizaciones Q4 y superiores; en 8 GB solo con cuantizaciones Q2/Q3.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF. El modelo base tambien puede servirse con vLLM o TGI en formato safetensors, aunque esta distribucion es especificamente GGUF.
- Latencia y throughput: no disponibles. Dependen del hardware, de la cuantizacion y del backend; no se han publicado mediciones en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo que permitan una comparativa cuantitativa fiable. A continuacion se comparan caracteristicas objetivas con alternativas de tamano similar del ecosistema abierto, sin afirmar superioridad en calidad:

| Modelo | Parametros | Contexto | Licencia | Formato | Especializacion |
|---|---|---|---|---|---|
| Fisher-R1-14B (este) | ~14,8 B | no disponible | Apache 2.0 | GGUF, safetensors | Estadistica, tool use, ingles |
| Qwen2.5-14B-Instruct | ~14,7 B | 32.768 tokens (ampliable) | Apache 2.0 | safetensors, GGUF | Proposito general, multilingue |
| Mistral-Nemo-12B-Instruct | ~12 B | 128.000 tokens | Apache 2.0 | safetensors, GGUF | Proposito general, multilingue |
| Phi-4-14B | ~14,7 B | 16.000 tokens | MIT | safetensors, GGUF | Razonamiento, matematicas |

La comparativa de rendimiento real no esta disponible porque Fisher-R1-14B no publica resultados de benchmarks en la informacion accesible.

## Limitaciones y advertencias

- Idioma: el modelo esta declarado solo para ingles; su rendimiento en castellano no esta verificado y probablemente sea inferior.
- Alucinacion: no hay datos publicados sobre tasas de alucinacion ni evaluaciones de fidelidad en tareas estadisticas, un dominio donde los errores numericos o conceptuales son especialmente costosos.
- Contexto: se desconoce la longitud maxima de contexto del modelo base, lo que impide planificar despliegues con documentos largos.
- Cuantizacion: las variantes Q2_K y Q3_K_M degradan la calidad de forma notable segun las notas del propio autor; para uso en produccion se recomienda Q4_K_M o superior.
- Sin quants con imatrix: el autor indica que no hay cuantizaciones ponderadas por imatrix disponibles, que suelen ofrecer mejor relacion calidad/tamano que las estaticas.
- Trazabilidad limitada: el modelo base (May2222/Fisher-R1-14B) tiene pocas descargas y una unica interaccion registrada, sin documentacion tecnica sobre entrenamiento ni evaluacion independiente.
- Licencia: Apache 2.0 permite uso comercial, pero al ser una cuantizacion de un modelo de origen poco documentado conviene verificar la procedencia de los datos de entrenamiento antes de usarlo en produccion regulada.
- Especializacion estrecha: las etiquetas indican foco en estadistica y tool use; no hay evidencia de que sea competitivo en codigo, matematicas generales o tareas creativas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Fisher-R1-14B-GGUF
- Modelo base: https://huggingface.co/May2222/Fisher-R1-14B
- Dataset de referencia: https://huggingface.co/datasets/May2222/P-Bench
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Fisher-R1-14B-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
