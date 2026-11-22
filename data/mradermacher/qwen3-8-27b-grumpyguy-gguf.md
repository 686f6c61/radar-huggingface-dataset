# mradermacher/Qwen3.8-27B-GrumpyGuy-GGUF

## Resumen

Qwen3.8-27B-GrumpyGuy-GGUF es la distribucion en formato GGUF del modelo wesjos/Qwen3.8-27B-GrumpyGuy, un ajuste fino (finetune) de la familia Qwen 3.8 orientado a persona conversacional y roleplay con un caracter deliberadamente "grumpy" (gruñon). El trabajo de cuantizacion lo firma mradermacher, un publicador habitual de versiones GGUF de modelos abiertos, y el resultado esta pensado para inferencia local con llama.cpp y derivados.

El modelo cuenta con 27.320.697.856 parametros totales (segun los tensores safetensors del repositorio), lo que lo situa en la categoria de modelos densos de ~27B. Se distribuye bajo licencia Apache 2.0 y declara soporte para ingles y chino. La model card del cuantizador no aporta informacion sobre arquitectura interna, longitud de contexto ni datos de entrenamiento del finetune original.

La relevancia de esta ficha es doble: por un lado, documenta una variante de personaje (persona) sobre una base Qwen reciente, un caso de uso creciente en aplicaciones de roleplay y asistentes con tono marcado; por otro, ilustra el flujo tipico de publicacion de cuantizaciones GGUF estaticas por parte de mradermacher, con un conjunto de cuantizaciones que van de Q2_K a Q8_0 mas suplementos multimodales mmproj.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetada como qwen3.8 / qwen3_5 en los tags; detalles no publicados) |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | mmproj-Q8_0, mmproj-f16, Q2_K, Q4_K_S, Q6_K, Q8_0 (etiquetas adicionales en la model card: x-f16, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_M, Q5_K_S, Q5_K_M, IQ4_XS) |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repo de 106,1 GB); el modelo base se publica en bf16 segun los tags |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base wesjos/Qwen3.8-27B-GrumpyGuy. Los tags indican que se trata de un finetune sobre una base de la familia Qwen 3.8 (con referencia secundaria a qwen3_5), en precision bf16 y con etiquetas de persona, roleplay y conversacional. No se especifica si la arquitectura es transformer denso, MoE o hibrida, ni el numero de capas, dimensiones ocultas o cabezas de atencion.

Tampoco se documentan en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset del finetune, ni si se emplearon tecnicas de RLHF, DPO o SFT. La unica informacion tecnica concreta es la del proceso de cuantizacion: mradermacher indica que se trata de cuantizaciones estaticas (quantize_version 2, output_tensor_quantised 1, convert_type hf) y que no hay cuantizaciones ponderadas/imatrix disponibles en el momento de la publicacion. Se incluyen suplementos multimodales mmproj en Q8_0 y f16, lo que sugiere que el modelo base incorpora capacidad de vision, aunque este extremo no se confirma en la model card.

## Capacidades

- Generacion de texto conversacional con una persona marcada ("grumpy"), orientada a respuestas con tono sarcastico o de mal humor.
- Roleplay y dialogos multi-turno con consistencia de personaje, segun los tags del repositorio.
- Soporte multilingue limitado a ingles y chino.
- Capacidad multimodal probable (presencia de ficheros mmproj), aunque no documentada explicitamente.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta modo thinking, audio ni otras capacidades especiales.

## Casos de uso

- Personajes conversacionales para entretenimiento: el finetune esta disenado para mantener una persona "grumpy" en dialogos largos, adecuado para bots de roleplay o experiencias interactivas donde se busca un tono concreto y reconocible.
- Prototipado de asistentes con tono de marca: permite experimentar con asistentes que respondan con sarcasmo o franqueza sin filtros excesivos de cortesia, util para evaluar tolerancia del producto a personalidades no neutras.
- Investigacion sobre persona y estilo: sirve como caso de estudio de como un finetune sobre una base Qwen modifica el registro conversacional sin cambiar el modelo subyacente.
- Despliegue local en estaciones de trabajo: las cuantizaciones Q4_K_S (15,9 GB) y Q6_K (22,5 GB) permiten ejecutar el modelo en GPUs de consumo alto o en configuraciones CPU+GPU con llama.cpp.
- Generacion de dialogos para videojuegos o narrativa interactiva: la licencia Apache 2.0 facilita la integracion en productos comerciales de ficcion interactiva.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece seis niveles de cuantizacion (Q2_K a Q8_0) que permiten medir el impacto de la compresion en la calidad del dialogo y en el mantenimiento de la persona.
- Experimentacion multimodal: los ficheros mmproj permiten probar entrada de imagenes en llama.cpp si el modelo base efectivamente soporta vision, aunque conviene verificarlo antes de disenar un producto sobre esa capacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion: Q2_K ~11,3 GB; Q4_K_S ~15,9 GB; Q6_K ~22,5 GB; Q8_0 ~29,1 GB. A estas cifras hay que sumar el overhead de contexto KV cache y, si se usa vision, el suplemento mmproj (0,7 GB en Q8_0 o 1,0 GB en f16).
- GPU recomendadas: para Q4_K_S, una RTX 4090 (24 GB) o RTX 3090 (24 GB) permiten cargar el modelo completo con contexto moderado; para Q6_K y Q8_0 se recomienda A100 40/80 GB, H100 o configuraciones multi-GPU.
- Cabe en GPU de consumo: si, en cuantizaciones Q2_K y Q4_K_S en tarjetas de 16-24 GB; Q6_K es ajustado en 24 GB y Q8_0 requiere mas de 32 GB.
- Opciones de despliegue: llama.cpp y sus derivados (Ollama, LM Studio, llama-cpp-python, KoboldCpp); los ficheros GGUF no son compatibles directamente con vLLM o TGI sin conversion.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mradermacher/Qwen3.8-27B-GrumpyGuy-GGUF | 27,32 B | no disponible | Apache 2.0 | GGUF | Cuantizacion estatica del finetune de persona |
| wesjos/Qwen3.8-27B-GrumpyGuy | 27,32 B | no disponible | Apache 2.0 | bf16 (transformers) | Modelo base del que deriva esta ficha |
| Otros finetunes de persona sobre Qwen de ~27B | no disponible | no disponible | variable | variable | No se dispone de datos comparativos verificables en la informacion proporcionada |

No se dispone de informacion suficiente para comparar rendimiento (benchmarks) con alternativas de la misma categoria.

## Limitaciones y advertencias

- La persona "grumpy" implica un tono deliberadamente hostil o sarcastico; no es adecuada para atencion al cliente ni contextos donde se espere cortesia neutra.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se documentan evaluaciones de factualidad para este finetune.
- Cobertura idiomatica limitada a ingles y chino; el rendimiento en castellano no esta documentado y probablemente sea inferior.
- La model card no especifica la longitud de contexto, lo que impide planificar aplicaciones con ventanas largas sin verificacion empirica.
- No se documentan sesgos especificos del finetune; al derivar de una base Qwen, hereda los sesgos de esta, no evaluados en la informacion disponible.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y sus datos de entrenamiento pueden imponer condiciones adicionales no reflejadas en el repositorio de cuantizacion.
- Las cuantizaciones Q2_K y Q3_K pueden degradar notablemente la coherencia del personaje y la calidad del dialogo; se recomienda Q4_K_S o superior para produccion.
- No hay cuantizaciones ponderadas/imatrix publicadas por el autor en el momento de la publicacion, lo que puede afectar a la calidad relativa de las cuantizaciones bajas.
- El repositorio tiene 0 descargas y 0 likes, sin validacion comunitaria; conviene tratar el modelo como experimental.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen3.8-27B-GrumpyGuy-GGUF
- Modelo base: https://huggingface.co/wesjos/Qwen3.8-27B-GrumpyGuy
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Qwen3.8-27B-GrumpyGuy-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Preguntas frecuentes y solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
