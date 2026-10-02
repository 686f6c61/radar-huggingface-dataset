# mradermacher/qwen-2.5-7b-mai-friend-merged-bf16-GGUF

## Resumen

Este repositorio contiene cuantizaciones en formato GGUF del modelo `zadaniamm/qwen-2.5-7b-mai-friend-merged-bf16`, un derivado de Qwen2.5-7B obtenido mediante la fusión de adaptadores PEFT/QLoRA en el modelo base y posteriormente cuantizado por el usuario mradermacher. Se trata, por tanto, de un artefacto de distribución (quantizer) y no de un modelo entrenado desde cero: el trabajo original corresponde a zadaniamm, mientras que mradermacher aporta las conversiones estáticas a GGUF para su uso en llama.cpp y derivados.

El modelo cuenta con 7.615.616.512 parámetros (~7,62 B) y está etiquetado como conversacional ("conversational"), con el indonesio (`id`) como único idioma declarado en la model card. Las etiquetas `peft`, `qlora`, `merge` y `synthetic` indican que el ajuste se realizó con adaptadores de bajo rango sobre datos sintéticos y que después se fusionaron en los pesos del modelo base, una práctica habitual para consolidar fine-tunes sin coste de inferencia adicional.

Su relevancia es limitada y muy nicho: el repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, y no incluye resultados de benchmarks ni detalles del dataset de entrenamiento. Su interés principal es práctico: ofrece el modelo listo para ejecutar en hardware de consumo mediante llama.cpp u Ollama, con 12 niveles de cuantización distintos bajo licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only heredada de Qwen2.5-7B (no confirmada en la model card del derivado) |
| Parametros totales | 7.615.616.512 (~7,62 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF: Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | id (indonesio) |
| Licencia | MIT |
| Formato de pesos | GGUF (este repositorio); el modelo base se distribuye en safetensors bf16 |

Otros datos disponibles: tamano del repositorio 68,1 GB; autor de las cuantizaciones mradermacher; modelo base declarado `zadaniamm/qwen-2.5-7b-mai-friend-merged-bf16`; fecha de creacion del repositorio 2026-10-01; fecha de actualizacion 2026-10-02; pipeline no disponible; region: us.

## Arquitectura y entrenamiento

No hay informacion en la model card sobre el proceso de entrenamiento del modelo original (numero de tokens, composicion del dataset, uso de RLHF o DPO). Los metadatos permiten reconstruir el flujo de trabajo de forma parcial: el modelo parte de Qwen2.5-7B, sobre el que se aplicaron adaptadores PEFT entrenados con QLoRA (cuantizacion de 4 bits durante el ajuste) utilizando datos sinteticos. Posteriormente esos adaptadores se fusionaron en los pesos del modelo base, generando un checkpoint bf16 intermedio (`zadaniamm/qwen-2.5-7b-mai-friend-merged-bf16`). El nombre "mai friend" sugiere un ajuste orientado a un asistente conversacional o companero de chat, presumiblemente en indonesio, aunque esta interpretacion no se confirma en la documentacion.

La contribucion especifica de este repositorio es la cuantizacion estatica a GGUF, realizada con la version 2 del pipeline de mradermacher y con tensiones de salida cuantizadas (`output_tensor_quantised: 1`) y conversion de tipo `hf`. El autor indica que no hay cuantizaciones ponderadas ni basadas en matriz de importancia (imatrix) disponibles, y que no las tiene planificadas salvo peticion explicita en la seccion de discusiones de la comunidad. El proceso de fusion de LoRA no anade parametros: el modelo mantiene el mismo numero de pesos que el Qwen2.5-7B original.

## Capacidades

- Generacion de texto conversacional multi-turno, segun la etiqueta `conversational` del repositorio.
- Asistencia en indonesio (`id`), unico idioma declarado en la model card.
- Ajuste de estilo o persona derivado de un fine-tune con QLoRA sobre datos sinteticos orientado a un asistente tipo "amigo".
- Ejecucion local en CPU y GPU mediante el ecosistema llama.cpp, al estar distribuido en GGUF.
- Capacidad de razonamiento, codigo, matematicas y vision: no documentada en la informacion disponible. Al derivar de Qwen2.5-7B-Instruct cabria esperar parte de estas capacidades, pero la model card no las declara ni las cuantifica.
- Soporte de tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no documentadas mas alla del indonesio.
- Modo "thinking", audio o cualquier capacidad especial: no disponible.

## Casos de uso

- Asistente conversacional en indonesio para soporte al cliente: el modelo puede mantener dialogos multi-turno en ese idioma con una ventana de contexto que, segun la informacion disponible, no esta especificada; conviene verificar el limite real antes de desplegarlo en produccion.
- Prototipado rapido de chatbots de compania o acompanamiento: el ajuste "mai friend" apunta a un tono cercano y coloquial, adecuado para demos y pruebas de concepto donde no se requiera precision factual alta.
- Ejecucion en local con llama.cpp u Ollama: al estar disponible en cuantizaciones desde Q2_K (3,1 GB) hasta f16 (15,3 GB), permite desplegar el modelo en portatiles y estaciones de trabajo sin GPU de datacenter.
- Experimentacion academica con tecnicas de fusion de adaptadores: el repositorio sirve como caso de estudio de un pipeline completo (QLoRA, merge, cuantizacion GGUF) reproducible por investigadores interesados en fine-tuning de bajo coste.
- Generacion de texto en indonesio para tareas de contenido: redaccion de respuestas, resumenes o parafrasis en ese idioma, siempre con revision humana dado que no hay benchmarks publicados.
- Base para un fine-tune posterior especifico de dominio: al ser un modelo denso de 7,6 B con licencia MIT, puede servir como punto de partida para ajustes adicionales en indonesio, aunque se recomienda validar antes la calidad del checkpoint heredado.
- Comparacion de calidad entre niveles de cuantizacion: con 12 variantes disponibles, es util para medir la perdida de calidad de Q2_K frente a Q6_K o Q8_0 en una tarea concreta del dominio objetivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K ni de ninguna otra suite, y la model card se limita a la lista de cuantizaciones y a notas de uso generales. Tampoco se proporcionan metricas de perplexity especificas para estas cuantizaciones; el unico material grafico referenciado es un grafico comparativo generico de tipos de cuantizacion de baja calidad elaborado por ikawrakow, ajeno a este modelo concreto.

## Requisitos de hardware

Las estimaciones de VRAM que se indican a continuacion se derivan del tamano de cada fichero GGUF mas un margen de entre 1 y 3 GB para cache KV y sobrecarga del runtime, asumiendo contextos moderados. Son aproximaciones, no datos publicados por el autor.

| Cuantizacion | Tamano del fichero | VRAM estimada |
|---|---|---|
| Q2_K | 3,1 GB | ~4-5 GB |
| Q3_K_S | 3,6 GB | ~5 GB |
| Q3_K_M | 3,9 GB | ~5,5 GB |
| Q3_K_L | 4,2 GB | ~6 GB |
| IQ4_XS | 4,4 GB | ~6 GB |
| Q4_K_S | 4,6 GB | ~6,5 GB |
| Q4_K_M | 4,8 GB | ~7 GB |
| Q5_K_S | 5,4 GB | ~7,5 GB |
| Q5_K_M | 5,5 GB | ~8 GB |
| Q6_K | 6,4 GB | ~9 GB |
| Q8_0 | 8,2 GB | ~11 GB |
| f16 | 15,3 GB | ~18-20 GB |

- GPU de consumo: las cuantizaciones Q4_K_S y Q4_K_M (4,6-4,8 GB) caben en tarjetas de 8 GB como la RTX 3060 Ti, 4060 o 3070; Q6_K requiere 10-12 GB (RTX 3080, 4070 Ti); Q8_0 encaja en 16 GB (RTX 4080, 4090) o en 12 GB con contexto reducido.
- GPU de datacenter: A100 (40/80 GB), H100 o L40S permiten ejecutar la version f16 con contexto amplio y lotes grandes.
- CPU y RAM: al ser un modelo de 7,6 B en GGUF, la inferencia en CPU es viable; con Q4_K_M bastan unos 8 GB de RAM libre y con f16 unos 20 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y servidores compatibles con GGUF. No se proporcionan datos de compatibilidad con vLLM o TGI para estos ficheros, aunque vLLM dispone de soporte parcial de GGUF; conviene verificarlo en la version concreta.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| qwen-2.5-7b-mai-friend-merged-bf16-GGUF (este) | 7,62 B | no disponible | id | MIT | GGUF | Fine-tune con QLoRA y merge; 0 descargas; sin benchmarks |
| mradermacher/Qwen2.5-7B-Instruct-Uncensored-GGUF | 7,62 B (base Qwen2.5-7B) | no disponible | chino, ingles | no disponible en la informacion recogida | GGUF | Variante sin censura de Qwen2.5-7B-Instruct; ingles y chino |
| mradermacher/Qwen2.5-Coder-7B-Instruct-abliterated-GGUF | 7,62 B (base Qwen2.5-Coder-7B) | no disponible | ingles | apache-2.0 | GGUF | Orientado a codigo, variante abliterated |
| mradermacher/Qwen-2.5-base-7b-GGUF | 7,62 B | no disponible | ingles | no disponible en la informacion recogida | GGUF, safetensors | Cuantizacion del modelo base sin ajuste conversacional |

Comparativa orientativa: este modelo se distingue de las alternativas anteriores por su unico idioma declarado (indonesio) y por su licencia MIT, frente a la Apache-2.0 del ecosistema Qwen2.5-Coder. No hay datos de rendimiento que permitan afirmar que sea mejor o peor que cualquiera de ellos en tareas concretas. El modelo base subyacente, Qwen2.5-7B, es de tipo denso con 7,62 B de parametros, por lo que el coste de inferencia es equivalente al de cualquier otro derivado del mismo tamano.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al entrenarse sobre datos sinteticos sin especificar composicion, el riesgo de sesgos y de estilos de respuesta artificiales o repetitivos es elevado.
- Riesgo de alucinacion: no cuantificado. La ausencia de benchmarks y de evaluacion del checkpoint fusionado impide estimar su fiabilidad factual; no se recomienda su uso en tareas que requieran precision sin verificacion.
- Limitacion de idioma: la model card solo declara indonesio (`id`). El rendimiento en castellano, ingles u otros idiomas no esta documentado y podria degradarse de forma notable.
- Contexto: no se especifica la longitud de contexto soportada en la informacion proporcionada. Si se hereda la de Qwen2.5-7B, la base declara 32.768 tokens nativos con extension via YaRN, pero esto no se confirma para este derivado.
- Datos de entrenamiento desconocidos: no se indica el volumen de tokens, la procedencia del dataset sintetico ni si se aplicaron tecnicas de alineacion como RLHF o DPO.
- Licencia: el repositorio se distribuye bajo MIT, pero el modelo base Qwen2.5-7B de Alibaba se publica bajo Apache-2.0. Conviene verificar las condiciones de ambas licencias antes de un uso comercial, especialmente por la cadena de derivacion.
- Adopcion y mantenimiento: 0 descargas y 0 "likes" en el momento de la consulta, sin comunidad activa ni issues resueltos. Es un artefacto sin validacion externa.
- Cuantizaciones muy agresivas: Q2_K (3,1 GB) y Q3_K_S (3,6 GB) degradan la calidad de forma perceptible; el propio autor marca Q3_K_M como "lower quality" y recomienda Q4_K_S y Q4_K_M como opciones rapidas.
- Ausencia de cuantizaciones ponderadas: no hay variantes con imatrix, lo que suele implicar mayor perdida de calidad en los niveles bajos que en modelos con calibracion por importancia.
- Fechas anomalas: el repositorio figura como creado el 2026-10-01, una fecha posterior a la actual; conviene tratarlo como posible error de metadatos.
- Caveat de produccion: la etiqueta `endpoints_compatible` no garantiza compatibilidad con APIs gestionadas ni con tool calling; no hay soporte documentado de function calling.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/qwen-2.5-7b-mai-friend-merged-bf16-GGUF
- Modelo base: https://huggingface.co/zadaniamm/qwen-2.5-7b-mai-friend-merged-bf16
- Pagina de resumen y descargas del cuantizador: https://hf.tst.eu/model#qwen-2.5-7b-mai-friend-merged-bf16-GGUF
- Peticiones de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Listado de modelos de mradermacher: https://huggingface.co/mradermacher/models
- README de referencia de TheBloke sobre uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de tipos de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa patrocinadora del cuantizador: https://www.nethype.de/
- Variantes relacionadas del mismo autor: https://huggingface.co/mradermacher/Qwen2.5-7B-Instruct-Uncensored-GGUF, https://huggingface.co/mradermacher/Qwen2.5-Coder-7B-Instruct-abliterated-GGUF, https://huggingface.co/mradermacher/Qwen-2.5-base-7b-GGUF
