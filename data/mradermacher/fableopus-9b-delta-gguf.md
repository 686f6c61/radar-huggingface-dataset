# mradermacher/FableOpus-9B-Delta-GGUF

## Resumen

FableOpus-9B-Delta-GGUF es la distribucion en formato GGUF del modelo bingleai/FableOpus-9B-Delta, un modelo de lenguaje de aproximadamente 8.950 millones de parametros (8,95 B) publicado por el usuario mradermacher. La model card del repositorio lo etiqueta como un merge y una destilacion que combina elementos de Qwen 3.5, Fable 5 y Claude Opus, aunque no se detalla la receta exacta de la mezcla ni los datos de destilacion. El resultado es un unico archivo de pesos en bf16 que se ha cuantizado a multiples precisiones para facilitar su despliegue en hardware modesto.

La relevancia de esta ficha reside en que el repositorio original solo ofrece pesos en safetensors (bf16), mientras que esta version aporta 13 cuantizaciones GGUF distintas, desde Q2_K hasta f16, ademas de dos ficheros mmproj que sugieren capacidades multimodales. Esto permite ejecutar el modelo en CPU y en GPUs de consumo mediante llama.cpp, Ollama o cualquier runtime compatible con GGUF, algo imposible con los pesos completos en bf16.

El modelo se distribuye bajo licencia Apache 2.0, esta etiquetado como conversacional y solo declara soporte para ingles. Con 305 descargas y 3 likes en el momento de la consulta, es un modelo de nicho orientado a experimentacion mas que a produccion a gran escala. No se han publicado resultados de benchmarks ni detalles sobre la longitud de contexto en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen 3.5 segun tags; detalles no disponibles) |
| Parametros totales | 8.953.803.264 (8,95 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (original en safetensors bf16) |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna mas alla de las etiquetas del repositorio, que apuntan a una base Qwen 3.5 combinada mediante merge con componentes etiquetados como Fable 5 y Claude Opus, y sometida a un proceso de destilacion. No se especifica el numero de capas, dimensiones ocultas, mecanismo de atencion ni si emplea atencion lineal o hibrida. Tampoco se documenta el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO.

El proceso de cuantizacion lo firma mradermacher con quantize_version 2 y output_tensor_quantised 1, generando cuantizaciones estaticas a partir de los pesos bf16 del modelo base. La model card indica que no se han generado cuantizaciones ponderadas con imatrix en el momento de la publicacion, lo que implica que las cuantizaciones IQ y K disponibles son estaticas y no aprovechan calibracion por importancia de pesos. Se incluyen ficheros mmproj (Q8_0 y f16) que actuan como suplemento multimodal, lo que sugiere que el modelo base incorpora algun tipo de proyeccion visual, aunque no se detalla su funcionamiento.

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta `conversational` del repositorio.
- Razonamiento y respuesta multi-turno, derivado de su naturaleza de modelo de chat.
- Capacidades multimodales potenciales: la presencia de ficheros mmproj Q8_0 y f16 indica soporte de entrada visual en el modelo base, aunque no se documenta el alcance.
- Herencia de capacidades de los modelos fuente (Qwen 3.5, Fable 5, Claude Opus) por merge y destilacion, sin que se detalle cuales se conservan.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Experimentacion con merges y destilaciones: el modelo permite estudiar como se comporta una mezcla de Qwen 3.5, Fable 5 y Claude Opus en tareas conversacionales, usando las cuantizaciones Q4_K_M o Q5_K_M para iterar rapidamente en una sola GPU de consumo.
- Prototipado de asistentes conversacionales en ingles: con Q4_K_S (5,5 GB) se puede desplegar un chatbot local en una RTX 3060 de 12 GB o superior, evaluando calidad antes de invertir en modelos mayores.
- Despliegue en CPU con llama.cpp u Ollama: las cuantizaciones Q2_K (3,9 GB) y Q3_K_S (4,4 GB) permiten ejecutar el modelo en equipos sin GPU dedicada, util para demos y pruebas de integracion.
- Evaluacion de capacidades multimodales: cargando el fichero mmproj junto con los pesos principales en llama.cpp se puede probar la entrada de imagenes, si el runtime lo soporta, para tareas de descripcion o VQA en ingles.
- Generacion de texto en entornos con requisitos de licencia permisiva: la licencia Apache 2.0 facilita su uso en productos comerciales sin obligaciones de atribucion mas alla de las habituales.
- Fine-tuning ligero sobre la base bf16: el repositorio original en safetensors permite aplicar LoRA o QLoRA y luego cuantizar el resultado, usando este repo GGUF como referencia de despliegue.
- Investigacion sobre cuantizacion: comparar la degradacion de calidad entre Q2_K, IQ4_XS y Q8_0 sobre el mismo modelo base para estudiar el impacto de la precision en tareas conversacionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos mas overhead de contexto): Q2_K ~3,9 GB; Q3_K_S ~4,4 GB; Q4_K_M ~5,7 GB; Q5_K_M ~6,6 GB; Q6_K ~7,5 GB; Q8_0 ~9,6 GB; f16 ~18 GB. Añadir entre 1 y 3 GB adicionales para la cache KV segun contexto.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para cuantizaciones Q4 a Q8; A100 o H100 solo necesarias para f16 o para servir muchas peticiones concurrentes.
- Cabe en GPU de consumo: si, desde una GTX 1660 6 GB con Q2_K hasta una RTX 4090 24 GB con Q8_0 o f16.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. El repositorio esta etiquetado con `endpoints_compatible`, lo que sugiere compatibilidad con endpoints tipo OpenAI.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| FableOpus-9B-Delta-GGUF | 8,95 B | no disponible | Apache 2.0 | GGUF | Merge/destilacion de Qwen 3.5, Fable 5 y Claude Opus; solo ingles |
| Qwen 2.5 7B Instruct (GGUF) | 7,6 B | 32 K (tipico) | Apache 2.0 | GGUF | Base consolidada, multilingue, benchmarks publicos |
| Llama 3.1 8B Instruct (GGUF) | 8,0 B | 128 K | Llama 3.1 Community | GGUF | Multilingue, amplio ecosistema de cuantizaciones |
| Mistral 7B Instruct v0.3 (GGUF) | 7,2 B | 32 K | Apache 2.0 | GGUF | Alternativa ligera con licencia permisiva |

La comparativa se limita a parametros, contexto y licencia porque no hay benchmarks publicados de FableOpus-9B-Delta que permitan contrastar calidad. La ventaja principal de este modelo frente a los anteriores es su origen como merge experimental; la desventaja es la ausencia de documentacion sobre entrenamiento, contexto y evaluacion.

## Limitaciones y advertencias

- Solo declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta documentado y probablemente sea deficiente.
- No se publican benchmarks, por lo que no hay evidencia objetiva de calidad frente a modelos establecidos.
- Al ser un merge y una destilacion sin receta publica, el comportamiento puede ser erratico en tareas especificas y dificil de depurar.
- Riesgo de alucinacion inherente a los modelos de lenguaje; sin evaluacion no se puede acotar su magnitud.
- La longitud de contexto no esta documentada, lo que impide planificar aplicaciones con ventanas largas.
- Las cuantizaciones son estaticas (sin imatrix), por lo que las variantes de baja precision (Q2_K, Q3_K_S) pueden degradar la calidad mas de lo habitual.
- El repositorio pesa 83 GB por incluir todas las cuantizaciones; conviene descargar solo el fichero necesario.
- Aunque la licencia es Apache 2.0, el modelo deriva de otros con condiciones propias (Qwen, Claude Opus); el autor no detalla la cadena de licencias, lo que introduce riesgo legal en uso comercial.
- Solo 305 descargas y 3 likes: comunidad minima, sin garantias de mantenimiento ni soporte.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/FableOpus-9B-Delta-GGUF
- Modelo base: https://huggingface.co/bingleai/FableOpus-9B-Delta
- Pagina de descargas del autor: https://hf.tst.eu/model#FableOpus-9B-Delta-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
