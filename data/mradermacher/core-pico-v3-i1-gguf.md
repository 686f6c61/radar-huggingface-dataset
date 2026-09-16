# mradermacher/CORe-Pico-V3-i1-GGUF

## Resumen

CORe-Pico-V3-i1-GGUF es una recopilacion de cuantizaciones en formato GGUF del modelo OpenCOReTechnologies/CORe-Pico-V3, publicada por el usuario mradermacher, especializado en la conversion y cuantizacion de modelos para inferencia local. El modelo subyacente es un transformer causal de proposito general con 1.720.574.976 parametros (aproximadamente 1,72 mil millones), orientado a generacion de texto y uso conversacional, con licencia Apache-2.0 y soporte declarado unicamente para ingles.

El aporte de esta ficha no es el modelo base, sino el paquete de cuantizaciones: el repositorio incluye variantes con y sin imatrix (matriz de importancia) que cubren desde IQ1_S o IQ1_M hasta Q6_K, lo que permite ejecutar el modelo en hardware muy modesto, desde equipos de escritorio sin GPU dedicada hasta GPUs de consumo. Se publica ademas un archivo imatrix de 0,1 GB para que cualquier usuario pueda generar sus propias cuantizaciones.

Es relevante ahora porque reduce la barrera de entrada para probar el modelo CORe-Pico-V3 en entornos locales: el repositorio ocupa 21,6 GB en total por acumular todas las variantes, pero cada cuantizacion individual es mucho mas pequena. La model card no documenta arquitectura interna, datos de entrenamiento ni resultados de benchmarks, por lo que la evaluacion debe hacerse empiricamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (causal-lm); detalles internos no disponibles |
| Parametros totales | 1.720.574.976 (aprox. 1,72 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, Q3_K_S, Q3_K_M, Q3_K_L, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, IQ4_XS, small-IQ4_NL |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (el modelo base original esta en safetensors) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base OpenCOReTechnologies/CORe-Pico-V3 mas alla de su clasificacion como causal-lm y su naturaleza conversacional. No se especifica si emplea atencion con RoPE, GQA, sliding window attention, decodificacion especulativa ni ninguna otra innovacion tecnica. Tampoco se documenta el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO o ajuste por instrucciones.

Lo unico verificable tecnicamente en este repositorio es el proceso de cuantizacion. mradermacher genera dos familias de archivos GGUF: cuantizaciones estaticas (publicadas en el repositorio hermano CORe-Pico-V3-GGUF) y cuantizaciones ponderadas con imatrix, que es el caso de este repositorio. Las cuantizaciones imatrix usan una matriz de importancia calculada sobre un corpus de calibracion para preservar mejor los pesos relevantes, con el objetivo de reducir la perdida de perplejidad en niveles de compresion agresivos (IQ1, IQ2, IQ3). El repositorio incluye el archivo .imatrix.gguf para que terceros puedan replicar el proceso.

## Capacidades

- Generacion de texto autoregresiva en ingles (pipeline declarado: text-generation).
- Uso conversacional: el tag "conversational" indica que el modelo base esta orientado a dialogos multi-turno.
- Compatibilidad con endpoints: el tag "endpoints_compatible" indica que la plantilla y el formato son utilizables en infraestructura de inferencia tipo Hugging Face Inference Endpoints.
- Ejecucion local mediante llama.cpp y derivados (Ollama, LM Studio, KoboldCpp) gracias al formato GGUF.
- Capacidades de tool calling, function calling o agentes: no disponibles en la informacion proporcionada.
- Capacidades de vision, audio o modo de razonamiento explicito (thinking mode): no disponibles en la informacion proporcionada.
- Soporte multilingue: limitado a ingles segun los metadatos.

## Casos de uso

- Prototipado local en equipos sin GPU: con las cuantizaciones IQ2 o Q2_K el modelo ocupa del orden de 0,6-0,8 GB, por lo que puede ejecutarse en CPU en portatiles convencionales para pruebas de generacion de texto y validacion de prompts antes de escalar a un modelo mayor.
- Asistentes conversacionales embebidos: el tag conversational y la licencia Apache-2.0 permiten integrar el modelo en aplicaciones de escritorio o moviles que necesiten un chatbot en ingles sin dependencia de APIs externas ni coste por token.
- Generacion de texto en pipelines offline: entornos con requisitos de privacidad (sanidad, legal, administracion) donde los datos no pueden salir de la infraestructura local; un modelo de 1,72 B cuantizado a Q4_K_M o Q5_K_M se ejecuta en una unica GPU de consumo.
- Filtrado y clasificacion de texto a escala: al ser pequeno, puede procesar grandes volumenes de documentos en ingles para tareas de resumen, etiquetado o extraccion de entidades, con coste de computo muy inferior al de modelos de 7 B o superiores.
- Ajuste fino sobre dominio especifico: con 1,72 B de parametros, el modelo base es candidato para LoRA o QLoRA en una sola GPU, y las cuantizaciones GGUF sirven como referencia de comparacion tras el ajuste.
- Generacion de datos sinteticos en ingles: uso como generador de corpus para entrenar o evaluar modelos menores, o para aumentar datasets de instrucciones, con la ventaja de que no hay coste de API.
- Evaluacion comparativa de cuantizaciones: el repositorio permite medir empiricamente la degradacion de calidad entre IQ1_S, Q2_K, Q4_K_M y Q6_K sobre las mismas tareas, util para decidir el nivel de compresion optimo en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card del repositorio de cuantizaciones ni los metadatos de Hugging Face incluyen valores de MMLU, HumanEval, GSM8K, ARC, HellaSwag ni de perplejidad por tipo de cuantizacion. La grafica de perplejidad enlazada en la model card (quantpplgraph.png) es una referencia generica de ikawrakow sobre tipos de cuantizacion, no un resultado medido para este modelo concreto.

## Requisitos de hardware

- VRAM estimada para inferencia (modelo de 1,72 B de parametros):
  - IQ1_S / IQ1_M: aproximadamente 0,4-0,6 GB.
  - IQ2_XXS / IQ2_XS / IQ2_S / IQ2_M / Q2_K / Q2_K_S: aproximadamente 0,6-0,9 GB.
  - IQ3_XXS / IQ3_XS / IQ3_S / IQ3_M / Q3_K_S / Q3_K_M / Q3_K_L: aproximadamente 0,9-1,2 GB.
  - Q4_0 / Q4_1 / Q4_K_S / Q4_K_M / IQ4_XS / small-IQ4_NL: aproximadamente 1,1-1,4 GB.
  - Q5_K_S / Q5_K_M: aproximadamente 1,4-1,6 GB.
  - Q6_K: aproximadamente 1,6-1,9 GB.
  - FP16 (modelo base en safetensors): aproximadamente 3,4 GB.
  - Estas cifras son estimaciones derivadas del numero de parametros y del tamano tipico de cada tipo de cuantizacion; no estan publicadas en la model card.
- GPU recomendadas: cualquier GPU con 2 GB o mas de VRAM es suficiente en cuantizaciones bajas; RTX 3060, RTX 4060, RTX 4090, A100 o H100 ejecutan el modelo con holgura y permiten lotes grandes o contexto extendido.
- Cabe en GPU de consumo: si, en practicamente todas las GPUs de consumo de los ultimos anos, incluidas integradas con memoria unificada, dado que la variante mas exigente (Q6_K) ronda 1,9 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp, text-generation-webui y cualquier runtime compatible con GGUF. El formato safetensors del modelo base permite vLLM, TGI o transformers si se descarga el repositorio original.
- Latencia y throughput estimados: no disponibles. Al tratarse de un modelo de 1,72 B, en una GPU moderna se espera un throughput alto y latencia baja, pero no hay mediciones publicadas en la informacion proporcionada.

## Comparativa con modelos similares

No hay datos de rendimiento publicados para CORe-Pico-V3 que permitan una comparacion por benchmarks. La tabla siguiente contrasta caracteristicas estructurales con alternativas de tamano equivalente; los datos de los modelos de comparacion proceden de conocimiento general y no de la informacion proporcionada, por lo que deben verificarse en sus fichas oficiales.

| Modelo | Parametros | Contexto | Licencia | Idiomas | Formato GGUF |
|---|---|---|---|---|---|
| CORe-Pico-V3 (esta ficha) | 1,72 B | No disponible | Apache-2.0 | Ingles | Si, con imatrix |
| Qwen2.5-1.5B-Instruct | 1,54 B | 32 768 tokens (variantes ampliadas disponibles) | Apache-2.0 | Multilingue | Si |
| Llama-3.2-1B-Instruct | 1,24 B | 128 000 tokens | Licencia comunitaria Llama 3.2 | Multilingue | Si |
| SmolLM2-1.7B-Instruct | 1,7 B | 8192 tokens | Apache-2.0 | Ingles y otros | Si |

Diferencias destacables: CORe-Pico-V3 es el unico de la comparativa cuya longitud de contexto no esta documentada y cuyo soporte linguistico se limita al ingles, mientras que las alternativas citadas ofrecen contexto declarado y cobertura multilingue. Como contrapartida, comparte con ellas la licencia permisiva Apache-2.0 (salvo Llama) y la disponibilidad de cuantizaciones GGUF, incluidas variantes imatrix de baja precision.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles; la model card no incluye ninguna seccion de sesgos, limitaciones o consideraciones eticas.
- Riesgo de alulcinacion: inherente a cualquier modelo causal de este tamano; no hay evaluaciones publicadas que lo cuantifiquen. Un modelo de 1,72 B tiene mayor propension a fabricar datos en tareas de conocimiento factual que modelos de mayor escala.
- Limitacion idiomatica: los metadatos declaran unicamente ingles ("en"). El rendimiento en castellano u otros idiomas no esta verificado y previsiblemente sera deficiente.
- Longitud de contexto: no documentada. No debe asumirse una ventana amplia; conviene medirla empiricamente antes de disenar flujos con documentos largos.
- Degradacion por cuantizacion: las variantes IQ1 e IQ2 reducen el tamano de forma agresiva y suelen penalizar la coherencia y la fidelidad del texto. Para uso en produccion se recomienda Q4_K_M o superior, reservando IQ1/IQ2 para pruebas o hardware muy limitado.
- Licencia: Apache-2.0 en el repositorio de cuantizaciones, lo que permite uso comercial, modificacion y redistribucion. No obstante, la licencia del modelo base deberia confirmarse en su repositorio original, ya que este derivado hereda sus condiciones.
- Trazabilidad limitada: el repositorio tiene cero descargas y cero "likes" en el momento de la consulta, y la model card es una plantilla generada automaticamente por mradermacher sin documentacion tecnica adicional. No hay garantia de mantenimiento ni de soporte.
- Ausencia de benchmarks: no hay ninguna evaluacion publicada, por lo que cualquier decision de adopcion en produccion deberia apoyarse en una evaluacion propia previa.

## Enlaces

- Repositorio de cuantizaciones imatrix: https://huggingface.co/mradermacher/CORe-Pico-V3-i1-GGUF
- Cuantizaciones estaticas del mismo modelo: https://huggingface.co/mradermacher/CORe-Pico-V3-GGUF
- Modelo base: https://huggingface.co/OpenCOReTechnologies/CORe-Pico-V3
- Pagina de descargas del autor: https://hf.tst.eu/model#CORe-Pico-V3-i1-GGUF
- Guia de uso de archivos GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafica de perplejidad por tipo de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre tipos de cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Preguntas frecuentes y solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Patrocinador del proceso de cuantizacion: https://www.nethype.de/

Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre el modelo; todos los enlaces encontrados correspondian a productos de puericultura sin relacion con el contenido de esta ficha.
