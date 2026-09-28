# mradermacher/SOCIUM-AI-27B-i1-GGUF

## Resumen

SOCIUM-AI-27B-i1-GGUF es un repositorio de cuantizaciones en formato GGUF del modelo SOCIUM-AI-27B. El repositorio lo publica el usuario mradermacher, mientras que el modelo base pertenece a la organizacion orzattyholdings (https://huggingface.co/orzattyholdings/SOCIUM-AI-27B). No se trata, por tanto, de un modelo entrenado desde cero, sino de una redistribucion optimizada para inferencia local: cuantizaciones generadas con llama.cpp a partir de los pesos originales en safetensors, con recalibrado mediante matriz de importancia (imatrix) para las variantes que lo indican.

El modelo cuenta con 27.320.697.856 parametros (aproximadamente 27,3 B), lo que lo situa en la franja de los 27-32 B, un tramo en el que compiten alternativas como Gemma 2 27B, Qwen2.5-32B o Mistral Small 24B. El repositorio ocupa 39,5 GB e incluye 24 variantes de cuantizacion distintas, desde IQ1_S hasta Q6_K, pasando por opciones intermedias como Q4_K_M, IQ4_XS o Q5_K_M. Esta amplitud de formatos permite desplegar el modelo tanto en GPU de consumo con 8-12 GB de VRAM (cuantizaciones de 1-2 bits) como en configuraciones de 24 GB o superiores con cuantizaciones de 4-6 bits.

La relevancia practica del repositorio es la habitual en los lanzamientos de mradermacher: ampliar el acceso a un modelo que, sin cuantizacion, requeriria en torno a 55 GB solo para pesos en fp16. La etiqueta `conversational` indica que el modelo base esta orientado a dialogo. Sin embargo, la informacion disponible es muy limitada: no se declara licencia, idiomas, pipeline, longitud de contexto ni detalles de arquitectura o entrenamiento, y el modelo acumula 0 descargas y 0 likes en el momento de los datos recogidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 27.320.697.856 (~27,3 B) |
| Parametros activos | no disponible (no se ha confirmado que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, small-IQ4_NL, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K (24 variantes) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizado); el modelo base se distribuye en safetensors |
| Tamano del repositorio | 39,5 GB |
| Tipo de cuantizacion | weighted / imatrix |
| Version de cuantizacion | quantize_version 2; output_tensor_quantised 1 |
| Fecha de creacion | 27 de septiembre de 2026 |
| Ultima actualizacion | 28 de septiembre de 2026 |

Nota: la lista de cuantizaciones, los metadatos de version y el origen del modelo base proceden de los comentarios HTML incluidos en el README del repositorio. Ni el tamano de contexto ni la licencia aparecen declarados.

## Arquitectura y entrenamiento

No hay informacion disponible sobre la arquitectura del modelo base. Los metadatos del repositorio indican `convert_type: hf`, lo que confirma que la cuantizacion parte de pesos convertidos desde un checkpoint en formato HuggingFace, y `quantize_version: 2` junto con `output_tensor_quantised: 1`, parametros de la herramienta de cuantizacion de llama.cpp. La etiqueta `imatrix` implica que el proceso de cuantizacion se ha guiado por una matriz de importancia calculada con un corpus de calibracion, lo que reduce la perdida de calidad respecto a una cuantizacion uniforme, especialmente en las variantes de 2-3 bits.

Tampoco se dispone de informacion sobre el conjunto de datos de entrenamiento, el numero de tokens, la composicion del corpus ni si se aplicaron tecnicas de alineacion como RLHF, DPO o similares. Para obtener esos datos habria que consultar la model card del modelo base (orzattyholdings/SOCIUM-AI-27B), que no forma parte de la informacion proporcionada. Del nombre del modelo no puede inferirse ni la arquitectura (transformer denso, MoE, hibrido SSM) ni el dominio de especializacion.

## Capacidades

- Generacion de texto conversacional multi-turno: es la unica capacidad respaldada explicitamente por las etiquetas del repositorio (`conversational`).
- Compatibilidad con endpoints de HuggingFace: la etiqueta `endpoints_compatible` sugiere que el formato GGUF puede servirse a traves de la infraestructura de Inference Endpoints.
- Ejecucion local en CPU y GPU mediante llama.cpp y derivados.
- Razonamiento, generacion de codigo, matematicas, vision, audio, tool calling, function calling, uso de agentes, modo thinking y capacidades multilingues: no disponible. No hay documentacion que confirme ni niegue ninguna de estas capacidades.

## Casos de uso

Los siguientes escenarios son aplicaciones plausibles para un modelo conversacional denso de ~27 B con cuantizacion GGUF. Se describen como hipotesis de uso, dado que no se ha documentado ninguna capacidad especifica del modelo base.

- Asistente conversacional autoalojado: el modelo puede desplegarse con Ollama o llama.cpp en un servidor propio y mantener dialogos multi-turno sin enviar datos a terceros. Es adecuado cuando la confidencialidad del contenido es un requisito y no se puede recurrir a APIs externas.
- Procesamiento por lotes de texto en CPU: las cuantizaciones IQ1_S, IQ2_XXS y Q2_K reducen el modelo a unos 5-9 GB, lo que permite ejecutarlo en servidores sin GPU para tareas de resumen, reformulacion o clasificacion de grandes volumenes de documentos.
- Prototipado e investigacion en una sola GPU de consumo: con Q4_K_M el modelo ocupa aproximadamente 16-17 GB, por lo que cabe en una RTX 4090 o RTX 5090 de 24-32 GB y permite iterar sobre prompts y evaluaciones sin coste de API.
- Generacion asistida de documentacion tecnica: en tareas de redaccion de docstrings, README o guias internas, un modelo de 27 B suele superar a los modelos de 7-8 B en coherencia estructural, y la cuantizacion Q5_K_M o Q6_K preserva buena parte de esa calidad.
- Despliegue en configuraciones multi-GPU de gama media: con dos o tres RTX 3090 o RTX 4090 (24 GB cada una) es viable servir las cuantizaciones Q5_K_M y Q6_K, utiles para equipos que necesitan un modelo local de gran tamano sin adquirir hardware profesional.
- Generacion aumentada por recuperacion (RAG): un modelo conversacional de este tamano puede integrarse como generador final en un pipeline RAG, siempre que el contexto del modelo soporte los fragmentos recuperados; este punto no puede verificarse sin conocer la longitud de contexto.
- Investigacion sobre cuantizacion: el repositorio incluye 24 variantes, lo que lo convierte en un buen banco de pruebas para medir la degradacion de calidad entre IQ1_S, IQ2_XXS, Q4_K_M y Q6_K sobre un mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K, MT-Bench ni de ninguna otra evaluacion, ni para el modelo base ni para las cuantizaciones de este repositorio.

## Requisitos de hardware

Los tamanos de archivo que se indican a continuacion son estimaciones calculadas a partir del numero de parametros (27,32 B) y de los bits por peso tipicos de cada tipo de cuantizacion en llama.cpp. No son cifras publicadas por el autor del repositorio.

| Cuantizacion | Tamano estimado de pesos | VRAM estimada (con contexto corto) |
|---|---|---|
| IQ1_S | ~5,3 GB | ~7 GB |
| IQ2_XXS | ~7,0 GB | ~9 GB |
| Q2_K | ~9,0 GB | ~11 GB |
| IQ3_XS | ~11,3 GB | ~13 GB |
| Q3_K_M | ~13,4 GB | ~15 GB |
| IQ4_XS | ~14,5 GB | ~17 GB |
| Q4_K_M | ~16,6 GB | ~19 GB |
| Q5_K_M | ~19,4 GB | ~22 GB |
| Q6_K | ~22,4 GB | ~25 GB |

- VRAM para inferencia: depende de la cuantizacion y de la longitud de contexto. A los pesos hay que sumar la cache KV, el buffer de computo y el overhead del runtime. Como referencia, en un modelo de ~27 B la cache KV puede anadir entre 1 y 8 GB segun contexto, cabezas y tipo de cache (fp16 o cuantizada).
- GPU recomendadas: RTX 4090 o RTX 5090 (24-32 GB) para Q4_K_M y Q5_K_M con contexto moderado; A100 40 GB, A100 80 GB o H100 80 GB para Q6_K con contexto largo o para servir varias peticiones concurrentes; 2x RTX 3090 o 2x RTX 4090 para repartir cuantizaciones de 5-6 bits.
- Cabe en GPU de consumo: si, con matices. Las cuantizaciones IQ1_S, IQ2_XXS y Q2_K caben en tarjetas de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB). Q4_K_M requiere 24 GB para funcionar con holgura. Q5_K_M y Q6_K necesitan 24 GB muy justos o reparto entre varias GPU.
- Cabe en CPU: si. Las cuantizaciones de 1-3 bits son viables en equipos con 16-32 GB de RAM; conviene reservar al menos 1,5 veces el tamano de los pesos en memoria del sistema para evitar swapping.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, llama-cpp-python, text-generation-webui, y servidores compatibles con GGUF como llama.cpp server o vLLM (con soporte GGUF limitado). La etiqueta `endpoints_compatible` sugiere compatibilidad con HuggingFace Inference Endpoints.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo para ninguna de las cuantizaciones.

## Comparativa con modelos similares

No se dispone de datos del modelo SOCIUM-AI-27B base (arquitectura, contexto, licencia, rendimiento), por lo que la comparacion se limita a la clase de tamano. Los datos de los modelos alternativos provienen de informacion publica de sus respectivas model cards.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad GGUF |
|---|---|---|---|---|
| SOCIUM-AI-27B (i1-GGUF) | ~27,3 B | no disponible | no disponible | Si, 24 cuantizaciones |
| Gemma 2 27B | 27 B | 8.192 tokens | Gemma Terms of Use | Si, cuantizaciones de terceros |
| Qwen2.5-32B | 32,5 B | 32.768 tokens (hasta 131.072 con YaRN) | Apache 2.0 | Si, cuantizaciones oficiales y de terceros |
| Mistral Small 24B | 24 B | 32.768 tokens | Apache 2.0 | Si, cuantizaciones de terceros |

No es posible establecer una comparacion de rendimiento porque no existen benchmarks publicados del modelo SOCIUM-AI-27B en la informacion disponible.

## Limitaciones y advertencias

- Licencia no declarada: el repositorio no especifica licencia. Al tratarse de una cuantizacion derivada, se heredan los terminos del modelo base (orzattyholdings/SOCIUM-AI-27B), que tampoco se han podido verificar. No debe asumirse uso comercial permitido sin comprobarlo en el repositorio original.
- Idiomas no declarados: no se puede garantizar un rendimiento correcto en castellano ni en ningun otro idioma concreto.
- Longitud de contexto desconocida: impide planificar aplicaciones que dependan de ventanas largas (RAG con muchos fragmentos, analisis de documentos extensos, conversaciones prolongadas).
- Riesgo de alucinacion: inherente a cualquier modelo de lenguaje, agravado por el desconocimiento del proceso de alineacion. No hay informacion sobre RLHF, DPO o filtros de seguridad aplicados.
- Degradacion por cuantizacion agresiva: las variantes IQ1_S, IQ1_M, IQ2_XXS e IQ2_XS comprimen el modelo por debajo de 2,5 bits por peso. En modelos de 27 B esto suele producir perdida de coherencia, repeticiones y errores factuales. Para uso en produccion conviene partir de Q4_K_M o superior.
- Adopcion nula verificable: el repositorio registra 0 descargas y 0 likes en los datos recogidos. No hay comunidad que haya validado el comportamiento del modelo, ni issues, ni evaluaciones de terceros.
- Sin model card tecnica: la documentacion del repositorio se limita a metadatos de cuantizacion. No hay informacion sobre sesgos, datos de entrenamiento, fecha de corte del conocimiento ni limitaciones declaradas por el autor.
- Inconsistencia en el tamano del repositorio: los 39,5 GB declarados no cuadran con la suma de 24 cuantizaciones de un modelo de 27 B, cuyo total superaria ampliamente esa cifra. Conviene verificar los tamanos reales de cada archivo antes de planificar el almacenamiento.
- Fechas futuras: la creacion y actualizacion del repositorio aparecen fechadas en septiembre de 2026, lo que puede indicar un error en los metadatos o una fecha de sistema incorrecta en el momento de la publicacion.

## Enlaces

- Repositorio HuggingFace (cuantizaciones GGUF): https://huggingface.co/mradermacher/SOCIUM-AI-27B-i1-GGUF
- Modelo base: https://huggingface.co/orzattyholdings/SOCIUM-AI-27B
- Perfil del autor de las cuantizaciones: https://huggingface.co/mradermacher
- llama.cpp (runtime compatible con GGUF): https://github.com/ggml-org/llama.cpp
- Ollama (despliegue simplificado de GGUF): https://ollama.com
- Papers, blogs o demos adicionales: no disponible.
