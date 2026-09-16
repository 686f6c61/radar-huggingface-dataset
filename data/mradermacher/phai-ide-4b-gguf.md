# mradermacher/PhAI-IDE-4B-GGUF

## Resumen

PhAI-IDE-4B-GGUF es la version cuantizada en formato GGUF del modelo AItonomy/PhAI-IDE-4B, publicada por el usuario mradermacher, conocido por distribuir conversiones GGUF de modelos open source para inferencia local. El modelo original es un ajuste de 4.205.751.296 parametros (aproximadamente 4,2 mil millones) orientado a tareas de ciencia, generacion de codigo y uso de herramientas (tool-use), segun las etiquetas declaradas en su model card. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales mas alla de las habituales de atribucion.

El repositorio no aporta informacion sobre arquitectura interna, longitud de contexto, composicion del dataset de entrenamiento ni resultados de benchmarks. La model card original indica que se trata de un modelo ajustado mediante SFT (supervised fine-tuning) sobre un adaptador LoRA, segun las etiquetas `sft` y `lora`, partiendo de un modelo base no especificado en la informacion disponible.

Su relevancia practica reside en el formato: al distribuirse exclusivamente en GGUF, esta pensado para ejecutarse en llama.cpp, Ollama u otros runners compatibles sobre hardware de consumo, con cuantizaciones desde 2,0 GB (Q2_K) hasta 8,5 GB (f16). La presencia de ficheros `mmproj` (proyector multimodal) sugiere soporte de entrada de imagenes, aunque la model card no lo documenta explicitamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 4.205.751.296 (~4,2 B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mas mmproj-Q8_0 y mmproj-f16 para componente multimodal |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repo base en transformers/safetensors) |

Otros datos del repositorio: ID `mradermacher/PhAI-IDE-4B-GGUF`, creado el 2026-09-16 y actualizado el mismo dia, tamano total del repositorio 39,9 GB, 0 descargas y 0 likes en el momento de la consulta, pipeline no disponible. Las cuantizaciones ponderadas con imatrix no estaban disponibles en el momento de publicacion segun el propio autor.

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo en la documentacion proporcionada. Las etiquetas del repositorio (`transformers`, `safetensors`, `phai-ide`, `science`, `code`, `tool-use`, `sft`, `lora`) permiten deducir unicamente que se trata de un modelo de lenguaje ajustado con supervisacion (SFT) mediante un adaptador LoRA, partiendo del modelo AItonomy/PhAI-IDE-4B. No se especifica el modelo preentrenado subyacente, el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas posteriores como RLHF o DPO.

El trabajo realizado por mradermacher es exclusivamente de conversion y cuantizacion: se generan cuantizaciones estaticas (no ponderadas con imatrix) a partir de los pesos originales, empleando `quantize_version: 2` y `output_tensor_quantised: 1` segun los metadatos internos. Se incluyen ademas dos ficheros de proyector multimodal (`mmproj-Q8_0` y `mmproj-f16`), lo que indica que el modelo base incorpora algun tipo de capacidad de vision, si bien no hay confirmacion documental de ello.

## Capacidades

- Generacion de texto conversacional en ingles, con formato de chat (`conversational` entre las etiquetas del repo).
- Generacion y comprension de codigo, segun la etiqueta `code`.
- Razonamiento y tareas de dominio cientifico, segun la etiqueta `science`.
- Uso de herramientas y function calling, segun la etiqueta `tool-use`.
- Posible soporte multimodal (entrada de imagenes) por la presencia de ficheros `mmproj`, aunque no confirmado en la model card.
- Capacidades multilingues: limitadas al ingles segun el campo `language: en`.
- No se documentan modos de razonamiento explicito (thinking), soporte de audio ni capacidades de agente multi-paso mas alla de lo que implica la etiqueta `tool-use`.

## Casos de uso

- Asistente de codigo en local: el modelo puede integrarse en un IDE mediante llama.cpp u Ollama para autocompletado y explicacion de fragmentos, con la ventaja de ejecutarse en una GPU de consumo gracias a cuantizaciones de 2,7-3,2 GB (Q4_K_S/Q4_K_M).
- Pipeline de revision de codigo en CI/CD: al declarar soporte de tool-use, puede emplearse para generar parches o comentarios automatizados en pull requests ejecutandose en runners con GPU modesta.
- Analisis de documentacion cientifica: la etiqueta `science` sugiere uso para resumir articulos o extraer datos estructurados, aunque el rendimiento real no esta verificado en la informacion disponible.
- Prototipado de agentes con llamada a funciones: su soporte de tool-use permite construir flujos donde el modelo decide que API invocar, con un coste de inferencia bajo por su tamano de 4,2 B.
- Despliegue en edge o portatiles: con cuantizaciones Q2_K (2,0 GB) o IQ4_XS (2,6 GB) puede ejecutarse en equipos sin GPU dedicada, a costa de perdida de calidad en el caso de Q2.
- Evaluacion comparativa interna: al ser un modelo pequeno y con licencia Apache 2.0, sirve como linea base frente a modelos mayores en tareas de codigo y tool-use dentro de un banco de pruebas propio.
- Procesamiento de documentos con imagenes: si el soporte multimodal se confirma, el modelo podria extraer texto o interpretar diagramas tecnicos cargando el fichero `mmproj` correspondiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio del GGUF no incluye tablas de MMLU, HumanEval, GSM8K ni metricas comparativas, y la model card original tampoco las aporta en los datos extraidos.

## Requisitos de hardware

Los tamanos de fichero indicados en la model card permiten estimar el consumo de VRAM. El modelo completo en bf16 ocupa unos 8,5 GB, por lo que la inferencia requiere ademas memoria para el contexto y el runtime (tipicamente 1-3 GB adicionales segun longitud de contexto y backend).

| Cuantizacion | Tamano en disco | VRAM estimada (modelo + overhead) |
|---|---|---|
| Q2_K | 2,0 GB | ~2,5-3,5 GB |
| Q3_K_S / Q3_K_M / Q3_K_L | 2,2 / 2,4 / 2,5 GB | ~3-4 GB |
| IQ4_XS | 2,6 GB | ~3,5-4,5 GB |
| Q4_K_S / Q4_K_M | 2,7 / 2,8 GB | ~3,5-4,5 GB |
| Q5_K_S / Q5_K_M | 3,1 / 3,2 GB | ~4-5 GB |
| Q6_K | 3,6 GB | ~4,5-5,5 GB |
| Q8_0 | 4,6 GB | ~5,5-6,5 GB |
| f16 | 8,5 GB | ~9,5-11 GB |
| mmproj-Q8_0 / mmproj-f16 | 0,5 / 0,8 GB | se suma al total si se usa vision |

- Cabe en GPU de consumo: si. Una RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB o RTX 4090 pueden ejecutar cualquier cuantizacion, incluida f16. Una GPU de 8 GB cubre comodamente hasta Q6_K; una de 6 GB, hasta Q4/Q5.
- GPU profesionales: A100, H100 o L40S permiten lotes grandes y mayor throughput, aunque estan sobredimensionadas para un modelo de 4,2 B.
- Opciones de despliegue: llama.cpp y Ollama son los runners naturales para GGUF. Tambien es compatible con servidores que soportan GGUF como LM Studio o text-generation-webui. vLLM y TGI no son la via habitual para GGUF (vLLM soporta GGUF de forma experimental), por lo que para produccion de alto rendimiento convendria usar los pesos safetensors del modelo base.
- Latencia y throughput: no disponibles. No se publican mediciones en la informacion proporcionada.

## Comparativa con modelos similares

Solo se dispone de datos verificables para este repositorio y su modelo base. No hay informacion sobre modelos alternativos de la misma categoria en la documentacion proporcionada, por lo que no se pueden comparar parametros, contexto ni rendimiento de terceros.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mradermacher/PhAI-IDE-4B-GGUF | 4,2 B | no disponible | apache-2.0 | GGUF | Cuantizaciones estaticas, incluye mmproj multimodal |
| AItonomy/PhAI-IDE-4B | no disponible (mismo modelo base, ~4,2 B) | no disponible | apache-2.0 | safetensors / transformers | Modelo original del que derivan los GGUF |

Alternativas de otros autores en el rango de 3-5 B parametros: no disponible con datos verificables en esta busqueda.

## Limitaciones y advertencias

- La model card no documenta sesgos, por lo que se desconoce el comportamiento del modelo en dominios sensibles.
- Riesgo de alucinacion no cuantificado: no hay evaluaciones de fidelidad ni de tasas de error publicadas.
- Idiomas: el modelo esta declarado unicamente para ingles; el rendimiento en castellano u otros idiomas no esta verificado y probablemente sea pobre.
- Longitud de contexto desconocida: no se puede garantizar el comportamiento en conversaciones largas o documentos extensos, lo que limita su uso en tareas de contexto amplio.
- Las cuantizaciones bajas (Q2_K, Q3_K_S) degradan la calidad de forma notable; el autor no ha publicado cuantizaciones ponderadas con imatrix, que suelen mejorar la relacion calidad/tamano en esos rangos.
- Licencia Apache 2.0: permite uso comercial y modificacion, con obligacion de conservar avisos de licencia y atribucion. No se identifican clausulas adicionales restrictivas.
- El repositorio tiene 0 descargas y 0 likes, y no hay validacion de la comunidad sobre la calidad de la conversion.
- El soporte multimodal no esta documentado: la presencia de ficheros `mmproj` es indicativa, pero se desconoce si funciona correctamente con el modelo y que tareas cubre.
- Para produccion con requisitos de throughput alto o contexto largo, conviene validar antes los pesos safetensors del modelo base y no asumir paridad de rendimiento con la version GGUF.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/PhAI-IDE-4B-GGUF
- Modelo base: https://huggingface.co/AItonomy/PhAI-IDE-4B
- Pagina de resumen de cuantizaciones del autor: https://hf.tst.eu/model#PhAI-IDE-4B-GGUF
- Guia de uso de GGUF citada por el autor: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
