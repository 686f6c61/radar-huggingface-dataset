# jordi123/Swift-1.5-Qwen3.8-27b-i1-GGUF

## Resumen

Swift-1.5-Qwen3.8-27b-i1-GGUF es un repositorio de cuantizaciones en formato GGUF del modelo ukisai/Swift-1.5-Qwen3.8-27b, un modelo de 27.320.697.856 parámetros (27,3 B) orientado a razonamiento y a un uso eficiente de tokens. El repositorio está publicado bajo la cuenta de HuggingFace jordi123, pero el contenido de la model card corresponde a la plantilla de cuantización de mradermacher, que es quien figura como `quantized_by` y quien mantiene el repositorio estático de referencia.

El propósito del repositorio es facilitar la ejecución local del modelo base mediante cuantizaciones de llama.cpp generadas con imatrix, con 14 variantes que van desde i1-Q2_K (11,0 GB) hasta i1-Q6_K (22,5 GB). Los tags del repositorio lo etiquetan como `reasoning`, `efficient-thinking`, `token-efficient`, `post-training`, `terminal-bench` y `conversational`, lo que apunta a un modelo afinado para tareas de razonamiento con consumo reducido de tokens y para flujos de trabajo de terminal.

La relevancia actual del repositorio es práctica: permite desplegar un modelo de 27,3 B en hardware de consumo (a partir de 16 GB de VRAM con cuantizaciones Q4) mediante llama.cpp u otros runtimes compatibles con GGUF. Se distribuye bajo la licencia swift-open-license-1.0, es monolingüe en inglés y no publica datos de benchmarks ni de arquitectura en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio no la detalla; la nomenclatura `qwen3_8` y `library_name: transformers` sugieren una base de la familia Qwen3) |
| Parametros totales | 27.320.697.856 (27,3 B), dato de safetensors del modelo base |
| Parametros activos | no disponible (no se indica que el modelo sea de tipo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF i1 (imatrix): Q2_K, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K. Existen tambien cuantizaciones estaticas en repositorio aparte |
| Idiomas soportados | en (ingles) |
| Licencia | swift-open-license-1.0 (`license: other`), enlazada al fichero LICENSE del modelo base |
| Formato de pesos | GGUF (este repositorio); el modelo base se distribuye en safetensors para transformers |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura en la documentacion proporcionada. El repositorio se publica con `library_name: transformers` y la etiqueta `qwen3_8`, y el nombre del modelo hace referencia a "Qwen3.8-27b", lo que sugiere que deriva de la familia Qwen3, pero no se confirma en la model card si se trata de un transformer denso, de una arquitectura MoE o de una variante hibrida, ni el numero de capas, cabezas de atencion o tamano de vocabulario.

Tampoco se detallan los datos de entrenamiento: no hay informacion sobre el volumen de tokens, la composicion del dataset, ni si se aplicaron tecnicas de post-entrenamiento como RLHF o DPO. Las etiquetas `post-training`, `efficient-thinking` y `token-efficient` indican que el modelo base ha pasado por una fase de post-entrenamiento orientada a reducir el consumo de tokens en tareas de razonamiento, pero se desconoce el metodo concreto. Del mismo modo, no se documentan innovaciones tecnicas especificas (decodificacion especulativa, atencion lineal, etc.). La model card del repositorio GGUF unicamente describe el proceso de cuantizacion: cuantizaciones ponderadas con fichero imatrix de 0,1 GB generado a partir del modelo base.

## Capacidades

- Generacion de texto conversacional: la etiqueta `conversational` indica soporte de dialogos multi-turno.
- Razonamiento: el modelo esta etiquetado como `reasoning` y `efficient-thinking`, orientado a cadenas de razonamiento con presupuesto de tokens reducido.
- Eficiencia de tokens: la etiqueta `token-efficient` sugiere optimizacion del numero de tokens generados en tareas de razonamiento, relevante en despliegues con coste por token.
- Flujos de terminal y agentes: la etiqueta `terminal-bench` apunta a un entrenamiento o evaluacion especifica en tareas de terminal, lo que implica capacidad de ejecucion de comandos e iteracion sobre errores.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` indica que puede servirse a traves de APIs compatibles (por ejemplo, servidores con interfaz tipo OpenAI).
- Vision: la model card del cuantizador afirma que el modelo base es un modelo de vision y que los ficheros `mmproj`, si existen, estarian en el repositorio estatico. No se confirma en la informacion disponible que existan dichos ficheros.
- Tool calling / function calling: no disponible.
- Capacidades multilingues: solo ingles; no hay soporte documentado de otros idiomas.
- Capacidades de audio: no disponible.

## Casos de uso

- Automatizacion de terminal y operaciones: con la etiqueta `terminal-bench`, el modelo es adecuado para agentes que interpretan la salida de comandos, proponen el siguiente comando y corrigen errores de forma iterativa en un bucle de varios pasos, desplegado en local con llama.cpp.
- Asistente de codigo en estacion de trabajo: la cuantizacion i1-Q4_K_M ocupa 16,9 GB, por lo que cabe en una GPU de 24 GB (RTX 3090 o RTX 4090) y permite usar el modelo como asistente de programacion sin enviar codigo a servicios externos.
- Razonamiento con coste controlado por token: al estar etiquetado como `token-efficient`, es apropiado para pipelines donde se factura por token generado y se necesita razonamiento multi-paso sin cadenas de pensamiento excesivamente largas.
- Despliegue on-premise con soberania de datos: las cuantizaciones Q2_K (11,0 GB) e IQ3_S (12,7 GB) permiten ejecutar el modelo en servidores con GPUs de 12-16 GB, util en entornos donde los datos no pueden salir de la organizacion.
- Servicio de inferencia compatible con API: la etiqueta `endpoints_compatible` permite exponer el modelo mediante un servidor llama.cpp con API compatible con OpenAI e integrarlo como backend de una aplicacion existente sin cambiar el cliente.
- Generacion de codigo en CI/CD: el modelo puede integrarse en un paso de pipeline para revisar diffs, generar pruebas o proponer parches, ejecutandose en un runner con GPU y consumiendo un unico fichero GGUF.
- Evaluacion interna de agentes: sirve como modelo de referencia local para comparar el rendimiento de agentes en tareas tipo terminal sin depender de APIs externas ni de cuotas.
- Procesamiento de documentos con vision: si se confirma la disponibilidad de ficheros `mmproj` en el repositorio estatico, podria emplearse en tareas de lectura de documentos e imagenes; esto no esta verificado en la informacion disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio unicamente incluye la etiqueta `terminal-bench` como referencia a la familia de tareas para las que fue entrenado o evaluado el modelo base, pero no se aportan puntuaciones numericas de MMLU, HumanEval, GSM8K ni de Terminal-Bench.

## Requisitos de hardware

Los tamanos de fichero indicados a continuacion proceden de la tabla de cuantizaciones del repositorio y sirven como minima referencia de memoria de pesos; hay que anadir el consumo del contexto (KV cache), cuyo tamano no se puede calcular porque se desconoce la arquitectura.

| Cuantizacion | Tamano de pesos | VRAM minima orientativa |
|---|---|---|
| i1-Q2_K | 11,0 GB | 12 GB |
| i1-Q3_K_S | 12,4 GB | 12-16 GB |
| i1-IQ3_S | 12,7 GB | 12-16 GB |
| i1-IQ3_M | 12,9 GB | 12-16 GB |
| i1-Q3_K_M | 13,6 GB | 16 GB |
| i1-Q3_K_L | 14,7 GB | 16 GB |
| i1-IQ4_XS | 15,4 GB | 16-24 GB |
| i1-Q4_0 | 15,9 GB | 16-24 GB |
| i1-Q4_K_S | 15,9 GB | 16-24 GB |
| i1-Q4_K_M | 16,9 GB | 24 GB |
| i1-Q4_1 | 17,4 GB | 24 GB |
| i1-Q5_K_S | 19,1 GB | 24 GB |
| i1-Q5_K_M | 19,6 GB | 24 GB |
| i1-Q6_K | 22,5 GB | 24 GB o mas |

- Cabe en GPU de consumo: si. La cuantizacion recomendada por el autor (i1-Q4_K_M, 16,9 GB) se ajusta a GPUs de 24 GB como RTX 3090, RTX 4090 o RTX 5090. Las cuantizaciones Q2 y Q3 permiten ejecucion en GPUs de 12-16 GB, y con CPU offloading en equipos sin GPU dedicada.
- GPUs de datacenter: A100 40/80 GB, H100 y L40S pueden ejecutar cualquier cuantizacion del repositorio con contexto amplio y lotes concurrentes.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp y otros runtimes compatibles con GGUF. Para el modelo base en safetensors serian aplicables vLLM o TGI, no incluidos en este repositorio.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo ni de latencia para ninguna de las cuantizaciones.

## Comparativa con modelos similares

La comparativa se limita a parametros, contexto, licencia y disponibilidad, ya que no hay datos de rendimiento publicados para el modelo analizado.

| Modelo | Parametros | Contexto | Licencia | Formatos y disponibilidad |
|---|---|---|---|---|
| Swift-1.5-Qwen3.8-27b (este modelo) | 27,3 B | no disponible | swift-open-license-1.0 | GGUF (jordi123 y mradermacher) y safetensors (ukisai) |
| Qwen2.5-32B-Instruct | 32,5 B | 131.072 tokens | Apache 2.0 | safetensors y GGUF |
| Mistral-Small-3.x-24B | 24 B | 128.000 tokens | Apache 2.0 | safetensors y GGUF; variante con vision |
| Gemma-3-27B-IT | 27 B | 128.000 tokens | licencia Gemma | safetensors y GGUF; variante con vision |

Los datos de contexto y licencia de los modelos de comparacion corresponden a sus especificaciones publicas habituales y pueden variar segun la revision concreta. No se dispone de una comparacion de rendimiento entre este modelo y las alternativas indicadas.

## Limitaciones y advertencias

- Idiomas: el modelo esta etiquetado unicamente para ingles (`language: en`). El rendimiento en castellano u otros idiomas no esta documentado y no deberia asumirse.
- Datos de arquitectura y contexto ausentes: no se publica la longitud de contexto soportada, lo que impide planificar despliegues con ventanas largas. Hay que verificar este dato en el repositorio del modelo base antes de usarlo en produccion.
- Ausencia de benchmarks: no hay resultados publicados que permitan estimar la calidad del modelo frente a alternativas de tamano similar. Cualquier decision de adopcion deberia acompanarse de una evaluacion propia.
- Cuantizaciones agresivas: las variantes Q2 y Q3 (11,0-14,7 GB) degradan la calidad de forma notable respecto al modelo en precision completa. El propio autor recomienda i1-Q4_K_M para uso general y advierte de que Q4_0 es rapida pero de baja calidad.
- Licencia no estandar: swift-open-license-1.0 es una licencia personalizada (`license: other`), no una licencia OSI ampliamente conocida. Es imprescindible revisar el texto completo antes de cualquier uso comercial.
- Atribucion del repositorio: el repositorio esta publicado bajo la cuenta jordi123, mientras que el contenido de la model card y los enlaces de descarga corresponden a mradermacher. Conviene verificar la cadena de custodia del artefacto antes de desplegarlo.
- Ficheros de vision sin confirmar: la model card afirma que el modelo es de vision, pero indica que los ficheros `mmproj`, "si existen", estarian en otro repositorio. Las capacidades multimodales no estan garantizadas en este repositorio.
- Riesgo de alucinacion: no se han publicado evaluaciones especificas ni tasas de alucinacion para este modelo o su base.
- Actividad nula: el repositorio presenta 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion por parte de la comunidad.
- Fecha de publicacion anomala: la fecha de creacion registrada en HuggingFace es 2026-10-07, posterior a la fecha de consulta habitual, lo que sugiere un posible error en los metadatos.

## Enlaces

- Repositorio GGUF analizado: https://huggingface.co/jordi123/Swift-1.5-Qwen3.8-27b-i1-GGUF
- Modelo base: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b
- Licencia del modelo base: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b/blob/main/LICENSE
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/Swift-1.5-Qwen3.8-27b-GGUF
- Pagina de resumen de cuantizaciones de mradermacher: https://hf.tst.eu/model#Swift-1.5-Qwen3.8-27b-i1-GGUF
- Fichero imatrix: https://huggingface.co/mradermacher/Swift-1.5-Qwen3.8-27b-i1-GGUF/resolve/main/Swift-1.5-Qwen3.8-27b.imatrix.gguf
- Preguntas frecuentes y peticiones de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guia de uso de ficheros GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafica comparativa de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
