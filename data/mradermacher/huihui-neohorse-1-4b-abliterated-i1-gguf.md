# mradermacher/Huihui-NeoHorse-1-4B-abliterated-i1-GGUF

## Resumen

Huihui-NeoHorse-1-4B-abliterated-i1-GGUF es un repositorio de cuantizaciones GGUF publicado por mradermacher sobre el modelo huihui-ai/Huihui-NeoHorse-1-4B-abliterated, una variante de 4B parametros sometida a "abliteration" (eliminacion de la direccion de rechazo en el espacio de activaciones) por parte de huihui-ai. El repositorio no aporta pesos originales: su funcion es convertir el modelo base a formatos GGUF optimizados con matrices de importancia (imatrix, tambien denominadas i-quants), de modo que pueda ejecutarse en llama.cpp y derivados sin GPU dedicada.

El modelo esta orientado a casos de uso agenticos y de generacion de codigo: las etiquetas declaradas son agentic, tool-use, coding, reasoning, instruction-following, abliterated y uncensored, con soporte declarado unicamente en ingles. La licencia Apache-2.0 permite uso comercial sin restricciones de atribucion adicionales, lo que lo hace atractivo para integraciones en producto, con la salvedad de que al tratarse de un modelo abliterated no incorpora salvaguardas de rechazo.

La relevancia de esta ficha es acotada y conviene ser transparente: el repositorio tiene 0 descargas y 0 "likes" en el momento de la consulta (publicado el 18 de septiembre de 2026), y su tamano declarado es de 0,0 GB, lo que indica que la tabla de "provided quants" solo lista por ahora el fichero imatrix (0,1 GB). Las cuantizaciones estaticas equivalentes se publican en un repositorio aparte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no se documenta en la informacion proporcionada) |
| Parametros totales | 897.272 (dato reportado en el campo de parametros de safetensors; incoherente con la denominacion "4B" del nombre del modelo, no verificable con la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1/imatrix planificados o generados: Q2_K, Q2_K_S, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ1_S, IQ1_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q4_0, Q4_1, Q4_K_S, Q4_K_M, IQ4_NL (small), IQ4_XS, Q5_K_S, Q5_K_M, Q6_K; se publica ademas el fichero imatrix para generar cuantizaciones propias |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones i1/imatrix); el modelo base upstream se distribuye en safetensors via transformers |
| Modelo base | huihui-ai/Huihui-NeoHorse-1-4B-abliterated |
| Cuantizador | mradermacher |
| Tamano del repositorio | 0,0 GB (segun el dato reportado) |

## Arquitectura y entrenamiento

No se proporciona informacion sobre la arquitectura interna del modelo base (tipo de transformer, atencion, numero de capas o dimension oculta), ni sobre el volumen o la composicion del dataset de entrenamiento, ni sobre si se aplicaron fases de RLHF, DPO u otras tecnicas de alineamiento. El unico dato relevante de proceso es que se trata de una variante "abliterated": huihui-ai publica versiones de modelos existentes en las que se identifica y se resta la direccion de rechazo en el espacio de activaciones, de modo que el modelo deja de responder con negativas a determinadas peticiones. Este procedimiento no es un reentrenamiento con datos nuevos, sino una modificacion de pesos sobre un modelo ya entrenado.

La aportacion tecnica de este repositorio concreto es la cuantizacion con imatrix: mradermacher genera una matriz de importancia a partir de datos de calibracion y la utiliza para ponderar el error de cuantizacion por tensor, lo que en la practica mejora la perplejidad de las cuantizaciones de baja precision (especialmente las familias IQ1, IQ2 e IQ3) frente a las cuantizaciones legacy equivalentes en tamano. Segun la propia model card, los comentarios de metadatos indican quantize_version 2, output_tensor_quantised 1 y convert_type hf, es decir, conversion desde pesos de Hugging Face con cuantizacion de tensores de salida.

## Capacidades

- Generacion de texto e instrucciones generales en ingles (instruction-following).
- Generacion de codigo, segun la etiqueta coding declarada por el autor.
- Razonamiento (reasoning), sin que se detalle si existe un modo de "pensamiento" explicito o trazas de razonamiento separadas.
- Uso de herramientas y function calling (tool-use), orientado a flujos agenticos.
- Flujos de agente multi-paso (agentic), presumiblemente encadenando llamadas a herramientas.
- Sin censura en las respuestas: la abliteration elimina los rechazos aprendidos, por lo que el modelo no aplica filtros de contenido propios.
- Multilingue: no soportado; la model card declara unicamente ingles.
- Vision, audio o multimodalidad: no disponible (no se declara ninguna capacidad de este tipo).

## Casos de uso

- Agentes de automatizacion de tareas con tool calling: el modelo puede recibir definiciones de funciones y emitir llamadas estructuradas dentro de un bucle de agente, encadenando varios pasos sobre APIs internas; su tamano reducido permite mantener el bucle completo en una sola GPU consumer.
- Asistente de codigo en local para equipos con requisitos de privacidad: al ejecutarse en llama.cpp sobre hardware modesto, permite autocompletado y refactorizacion sin enviar el codigo fuente a servicios externos.
- Generacion de tests y documentacion tecnica en pipelines de CI/CD: integrado como paso de pre-commit o job de CI, puede producir casos de prueba y docstrings para modulos existentes.
- Clasificacion y extraccion de informacion estructurada a partir de texto: con salida forzada por gramatica (GBNF en llama.cpp), puede convertir texto libre en JSON para ingestas de datos.
- Prototipado rapido de productos conversacionales: sirve como modelo de validacion antes de migrar a un modelo mayor, con coste de inferencia muy bajo y sin dependencias de proveedor.
- Generacion de contenido sin restricciones de filtrado para investigacion sobre seguridad y alineamiento: permite estudiar como responde un modelo abliterated frente a uno alineado, comparando tasas de rechazo.
- Despliegue en edge o en portatiles: las cuantizaciones IQ2/IQ3 caben en equipos con poca memoria, lo que habilita demos offline de asistentes tecnicos.
- Evaluacion comparativa de cuantizaciones: el fichero imatrix publicado permite generar cuantizaciones propias con la misma matriz de importancia para reproducir experimentos de degradacion por precision.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card del repositorio de cuantizaciones ni los resultados de la busqueda web consultada aportan cifras de MMLU, HumanEval, GSM8K, MT-Bench ni de ninguna otra evaluacion, ni del modelo cuantizado ni del modelo base huihui-ai/Huihui-NeoHorse-1-4B-abliterated.

## Requisitos de hardware

- VRAM estimada para inferencia (modelo de ~4B parametros, valores orientativos segun el tamano de las cuantizaciones declaradas): IQ1/IQ2 en torno a 1,2-1,8 GB; Q3/IQ3 en torno a 1,8-2,2 GB; Q4_K_M en torno a 2,4-2,8 GB; Q5_K_M en torno a 3,0-3,4 GB; Q6_K en torno a 3,5-4,0 GB; Q8 en torno a 4,5 GB; FP16 en torno a 8 GB.
- Cabe en GPU consumer: si. Con Q4_K_M es viable en tarjetas de 6-8 GB (RTX 3060, RTX 4060, GTX 1660 Super, RTX 2060); con cuantizaciones IQ2/IQ3 funciona incluso en GPUs de 4 GB y en iGPU con memoria unificada.
- GPU profesionales recomendadas para servir varias peticiones concurrentes: A100 40/80 GB, H100, L40S o A10G; para un modelo de este tamano lo habitual es que el cuello de botella sea la CPU o la gestion de peticiones, no la VRAM.
- Aceleracion en Apple Silicon: soportada mediante llama.cpp con Metal, con la memoria unificada de los chips M1/M2/M3/M4 compartida entre CPU y GPU.
- Opciones de despliegue: llama.cpp (llama-server), Ollama, LM Studio, koboldcpp, text-generation-webui con el loader de llama.cpp, y servidores compatibles con la API de OpenAI mediante los endpoints de llama.cpp. Para vLLM o TGI seria necesario partir del modelo base en safetensors, no de estos GGUF.
- Latencia y throughput: no disponible. No se aportan mediciones de tokens por segundo ni de latencia en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones verificadas de modelos comparables dentro de la informacion proporcionada, por lo que la comparacion se limita a identificar el conjunto natural de alternativas por tamano y categoria (modelos densos de 3B-4B parametros con soporte de cuantizacion GGUF y orientacion a codigo y agentes): Qwen3-4B, Llama-3.2-3B, Phi-3.5-mini (3,8B) y Gemma-3-4B.

| Modelo | Parametros | Contexto | Licencia | GGUF | Rendimiento comparado |
|---|---|---|---|---|---|
| Huihui-NeoHorse-1-4B-abliterated-i1-GGUF | 4B (denominacion; dato de safetensors reportado como 897.272) | no disponible | apache-2.0 | si (i1/imatrix) | no disponible |
| Qwen3-4B | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | no disponible |
| Llama-3.2-3B | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | no disponible |
| Phi-3.5-mini | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | no disponible |

Para una comparativa fiable habria que consultar las model cards oficiales de cada alternativa y ejecutar una evaluacion propia sobre el mismo conjunto de tareas, dado que no existen cifras publicadas de este modelo en la informacion disponible.

## Limitaciones y advertencias

- Modelo abliterated: la eliminacion de la direccion de rechazo suprime las negativas aprendidas, por lo que puede generar contenido danino, ilegal o inseguro sin filtro propio. No es adecuado para aplicaciones orientadas al publico general sin una capa externa de moderacion.
- La abliteration puede degradar la coherencia y la calidad general del modelo en tareas benignas, ya que modifica pesos de un modelo ya entrenado sin reentrenamiento posterior.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad factual ni de tasas de alucinacion para este modelo ni para su base.
- Limitacion idiomatica: la model card declara unicamente ingles. El uso en castellano no esta validado y previsiblemente dara resultados inferiores.
- Longitud de contexto desconocida: no se documenta la ventana de contexto, por lo que no se puede garantizar el comportamiento en conversaciones largas ni en tareas de recuperacion con documentos extensos.
- Licencia: Apache-2.0, permisiva y apta para uso comercial, pero la licencia no exime de responsabilidad sobre el contenido generado por una variante sin alineamiento de seguridad.
- Trazabilidad incompleta: no se documenta el modelo upstream del que deriva NeoHorse-1, ni los datos de entrenamiento, lo que dificulta auditar sesgos y procedencia.
- Estado del repositorio: 0 descargas y 0 "likes", con un tamano reportado de 0,0 GB y una tabla de cuantizaciones que solo lista el fichero imatrix. Conviene verificar que los ficheros GGUF deseados estan efectivamente disponibles antes de integrarlo, y consultar el repositorio de cuantizaciones estaticas.
- Dato de parametros incoherente: el campo de parametros de safetensors (897.272) no cuadra con la denominacion de 4B, lo que sugiere un error de unidad o de registro en la metadata. Verificar el numero real de parametros antes de dimensionar hardware.

## Enlaces

- Repositorio de cuantizaciones i1 (esta ficha): https://huggingface.co/mradermacher/Huihui-NeoHorse-1-4B-abliterated-i1-GGUF
- Cuantizaciones estaticas del mismo modelo: https://huggingface.co/mradermacher/Huihui-NeoHorse-1-4B-abliterated-GGUF
- Modelo base abliterated: https://huggingface.co/huihui-ai/Huihui-NeoHorse-1-4B-abliterated
- Pagina de resumen y descargas del cuantizador: https://hf.tst.eu/model#Huihui-NeoHorse-1-4B-abliterated-i1-GGUF
- Preguntas frecuentes y peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guia de uso de ficheros GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas de Artefact2 sobre tipos de cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Grafico comparativo de perplejidad por tipo de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
