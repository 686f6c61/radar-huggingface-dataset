# blaj/Qwen2.5-VL-7B-Instruct-abliterated-int8-ov

## Resumen

Esta ficha describe `blaj/Qwen2.5-VL-7B-Instruct-abliterated-int8-ov`, una conversion a OpenVINO IR en int8 del modelo `huihui-ai/Qwen2.5-VL-7B-Instruct-abliterated`. Es, por tanto, un modelo de vision-lenguaje (VLM) de aproximadamente 7 000 millones de parametros, derivado del Qwen2.5-VL-7B-Instruct oficial de Alibaba, al que se le ha aplicado una ablacion ("abliteration") sobre el componente de generacion de texto para reducir sus comportamientos de rechazo. La conversion la firma el usuario `blaj` y esta publicada bajo licencia Apache-2.0.

La relevancia de esta pieza concreta no esta en la investigacion de frontera, sino en el despliegue: se trata de un export completo de VLM a formato OpenVINO IR con cuantizacion int8 asimetrica por canal, con el torre de vision, el merger vision-lenguaje, los embeddings de texto, el modelo de lenguaje, el tokenizer y el detokenizer todos presentes como grafos separados. Esto permite ejecutar un VLM multimodal en hardware Intel (CPU, iGPU Arc o GPU) sin depender de CUDA, algo poco habitual en el ecosistema.

El repositorio ocupa 9,5 GB y esta pensado para cargarse mediante `VLMPipeline` o servirse con OpenVINO Model Server (OVMS), ya que el grafo de texto tiene mas entradas de las dos que espera `LLMPipeline`. El autor publica tambien una version hermana en int4. El rendimiento medido en una iGPU integrada es de 13,0 tokens/s para int8 y 22,6 tokens/s para int4, lo que situa el caso de uso en inferencia local de baja concurrencia mas que en produccion de alto throughput.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen2_5_VLForConditionalGeneration` (transformer multimodal vision-lenguaje); 28 capas de texto, hidden 3584 |
| Parametros totales | No disponible; la denominacion comercial es 7B (el bloque de texto declarado corresponde a la familia Qwen2.5-7B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (la documentacion publica de Qwen2.5-VL declara 128 000 tokens para el modelo base; sin verificar en esta conversion) |
| Tipos de cuantizacion | int8 asimetrica por canal (esta build); existe build hermana en int4; el export previo se realiza en fp16 |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 |
| Formato de pesos | OpenVINO IR (grafo descompuesto: vision, merger, embeddings de texto y modelo de lenguaje separados) |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen2.5-VL (`Qwen2_5_VLForConditionalGeneration`), un transformer multimodal que combina una torre de vision, un modulo merger vision-lenguaje y un modelo de lenguaje autorregresivo. En esta exportacion concreta el bloque de texto tiene 28 capas y una dimension oculta de 3584. El export no es un unico grafo monolito: se descompone en grafos separados para la torre de vision, el merger, los embeddings de texto y el modelo de lenguaje, ademas de incluir tokenizer y detokenizer. Esa descomposicion es la razon por la que el modelo no se puede cargar con `LLMPipeline` y requiere `VLMPipeline` o OVMS.

No se dispone de informacion sobre el entrenamiento original en la informacion proporcionada: no se detallan el numero de tokens, la composicion del dataset, ni si hubo fases de RLHF o DPO. Lo que si se documenta es el proceso de adaptacion de esta build: el modelo base `huihui-ai/Qwen2.5-VL-7B-Instruct-abliterated` es una version "abliterated" (decensurada) del Qwen2.5-VL-7B-Instruct, en la que la ablacion se aplica al componente de generacion de texto para eliminar comportamientos de rechazo. Sobre esa base, la conversion se hizo en dos etapas: primero un export a OpenVINO con `optimum-cli export openvino --task image-text-to-text --weight-format fp16`, y despues una compresion de pesos con `nncf.compress_weights` aplicada al IR del modelo de lenguaje. La cuantizacion resultante es int8 asimetrica por canal. Un detalle operativo relevante es el pin de versiones: el exportador `qwen2_5_vl` rechaza versiones de transformers posteriores a la 5.0 (`MAX_TRANSFORMERS_VERSION = "5.0"`), y se uso optimum-intel 2.2.0 con OpenVINO 2026.4.0.

## Capacidades

- Generacion de texto e imagen-a-texto conversacional: el pipeline declarado es `image-text-to-text`, con entrada de imagen y texto y salida de texto.
- Comprension de imagen preservada: la ablacion se aplico solo al componente de texto, de modo que las capacidades de vision no se modifican respecto al modelo base.
- Comportamiento decensurado: la ablacion reduce la tasa de rechazos del modelo, lo que cambia su perfil de respuesta frente a la version Instruct original.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada (la familia Qwen2.5-VL lo documenta publicamente, sin verificar en esta conversion).
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles (el campo de idiomas no viene informado en la ficha de HuggingFace).
- Otras capacidades especiales (modo thinking, audio, grounding por bounding boxes, comprension de video): no disponibles en la informacion proporcionada.

## Casos de uso

- Inferencia multimodal local sin GPU dedicada: el modelo se ha validado sobre una iGPU Intel Arc 130V/140V integrada en un Core Ultra 7 258V con 30 GB de RAM. Es adecuado para prototipos de vision-lenguaje en portatiles y mini-PC Intel, donde no hay CUDA disponible.
- Despliegue en edge industrial con OVMS: el autor documenta una configuracion de OpenVINO Model Server con `target_device: GPU`, `nireq: 8` y `PERFORMANCE_HINT: THROUGHPUT`. Encaja en escenarios de inspeccion visual o clasificacion asistida donde el dato no puede salir de la planta.
- Analisis de documentos e imagenes en local: al ser un VLM completo (torre de vision mas modelo de lenguaje), permite describir, resumir o extraer informacion de capturas, diagramas y fotografias manteniendo los datos en el propio equipo.
- Prototipado rapido de asistentes conversacionales con imagen: la combinacion de contexto largo del modelo base y calidad int8 permite montar demos de chat multimodal con `VLMPipeline` en pocas lineas de codigo.
- Evaluacion de modelos decensurados en investigacion sobre seguridad: al ser una variante abliterated, sirve para estudiar como se comporta un VLM cuando se le retira el sesgo de rechazo, comparando salidas contra el Instruct original.
- Generacion de codigo asistida por capturas de pantalla: no disponible en la informacion proporcionada; no se documentan capacidades de codigo especificas para esta build.
- Servicio de baja concurrencia con presupuesto de latencia relajado: con 13,0 tokens/s en int8 sobre iGPU, es viable para aplicaciones interactivas de un unico usuario o muy pocos usuarios simultaneos, no para APIs de alto QPS.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, MMMU, etc.) en la informacion disponible. El unico dato de rendimiento publicado es de throughput, medido por el autor en el siguiente entorno: Intel Core Ultra 7 258V (iGPU Arc 130V/140V), 30 GB de RAM, OpenVINO Model Server 2026.4.0 sobre GPU, decodificacion greedy, 128 tokens nuevos como maximo y media de 3 ejecuciones.

| Build | Throughput (tok/s) |
|---|---|
| int4 | 22,6 |
| int8 (esta build) | 13,0 |

El autor senala que la decodificacion esta limitada por ancho de banda de memoria, por lo que el throughput sigue de cerca el tamano del modelo. No se proporcionan datos de latencia de primer token ni de throughput con prompt largo.

## Requisitos de hardware

- Memoria para pesos: el repositorio ocupa 9,5 GB, de modo que la build int8 necesita del orden de 10 GB solo para los pesos, mas el espacio de activaciones y la cache KV (estimacion derivada del tamano del repositorio; no publicada por el autor).
- Hardware validado: Intel Core Ultra 7 258V con iGPU Arc 130V/140V y 30 GB de RAM.
- GPU dedicadas: no se documentan pruebas en A100, H100 ni RTX 4090. Al ser un artefacto OpenVINO IR, el objetivo natural son CPU Intel, iGPU Arc y GPU Intel, no CUDA.
- GPU de consumo: por tamano, la build int8 deberia caber en GPUs con 12 GB o mas de memoria (por ejemplo, RTX 3060 12 GB o RTX 4070), aunque no hay validacion publicada en esos equipos.
- Opciones de despliegue: `VLMPipeline` de OpenVINO (obligatorio, porque el grafo de texto tiene mas de dos entradas) y OpenVINO Model Server (OVMS) con configuracion REST. No es compatible con llama.cpp ni Ollama en este formato; para esos runtimes existe la version GGUF del modelo base abliterated publicada por huihui_ai en Ollama.
- Throughput estimado: 13,0 tok/s en int8 y 22,6 tok/s en int4 sobre la iGPU ya citada, con decodificacion greedy y 128 tokens nuevos.
- Latencia de primer token: no disponible.
- Requisitos de software: transformers 5.0 (el exportador rechaza versiones posteriores), optimum-intel 2.2.0 y OpenVINO 2026.4.0. El directorio del modelo debe contener tambien `graph.pbtxt` para OVMS.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| blaj/Qwen2.5-VL-7B-Instruct-abliterated-int8-ov (esta build) | 7B (nominal) | no disponible | OpenVINO IR int8 | apache-2.0 | 13,0 tok/s en iGPU Arc; export descompuesto, requiere `VLMPipeline` u OVMS |
| blaj/Qwen2.5-VL-7B-Instruct-abliterated-int4-ov | 7B (nominal) | no disponible | OpenVINO IR int4 | apache-2.0 | Build hermana; 22,6 tok/s, mayor perdida de precision esperable |
| huihui-ai/Qwen2.5-VL-7B-Instruct-abliterated | 7B (nominal) | no disponible | no disponible | no disponible en la informacion proporcionada | Modelo base de esta conversion; tambien publicado en Ollama como `qwen2.5-vl-abliterated:7b-instruct` |
| Qwen/Qwen2.5-VL-7B-Instruct | 7B (nominal) | no disponible | no disponible | apache-2.0 (segun la atribucion de la model card) | Modelo original de Alibaba, con comportamientos de rechazo intactos |

No se dispone de datos de benchmarks comparativos entre estas variantes en la informacion proporcionada, por lo que la comparacion se limita a formato, licencia y throughput medido.

## Limitaciones y advertencias

- Modelo abliterated: tiene un comportamiento de rechazo reducido de forma deliberada. Es responsabilidad del desplegador evaluar las salidas antes de ponerlo en produccion, especialmente en aplicaciones de cara al publico.
- Cuantizacion con perdida: la compresion int8 por canal degrada la precision respecto al export en fp16. El propio autor recomienda reexportar con un group size menor o en fp16 si se busca maxima exactitud.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no se han publicado evaluaciones de fidelidad ni de tasas de alucinacion para esta build.
- Throughput dependiente del entorno: el autor advierte que las cifras dependen de los kernels del runtime, del hardware y de la distribucion de prompts. Los 13,0 tok/s no son extrapolables a otros equipos.
- Restriccion de version de transformers: el exportador `qwen2_5_vl` falla con versiones posteriores a la 5.0 (`MAX_TRANSFORMERS_VERSION = "5.0"`), lo que complica la reproducibilidad a medida que avance el ecosistema.
- Compatibilidad de runtime limitada: al ser OpenVINO IR no se puede cargar directamente en llama.cpp, vLLM o TGI. Esto reduce las opciones de escalado horizontal.
- Idiomas y cobertura linguistica: no informados. No se puede afirmar el soporte de castellano u otros idiomas a partir de la informacion disponible.
- Contexto: no verificado en esta conversion; conviene medir el comportamiento real con prompts largos antes de asumir la ventana nominal del modelo base.
- Licencia: Apache-2.0, que permite uso comercial, pero la licencia cubre el artefacto de software y no exime de las obligaciones legales derivadas del contenido generado por un modelo decensurado.
- Adopcion practicamente nula: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion por parte de terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/blaj/Qwen2.5-VL-7B-Instruct-abliterated-int8-ov
- Build hermana en int4: https://huggingface.co/blaj/Qwen2.5-VL-7B-Instruct-abliterated-int4-ov
- Modelo base abliterated: https://huggingface.co/huihui-ai/Qwen2.5-VL-7B-Instruct-abliterated
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct
- Version Ollama del modelo base: https://ollama.com/huihui_ai/qwen2.5-vl-abliterated:7b-instruct
- Ficha descriptiva en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/qwen2.5-vl-7b-instruct-abliterated-huihui-ai
- Entrada en Grokipedia: https://grokipedia.com/page/Qwen25-VL-7B-Instruct-abliterated
