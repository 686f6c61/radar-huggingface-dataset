# OpenFlowLM/Qwen3.5-4B-NPU2

## Resumen

OpenFlowLM/Qwen3.5-4B-NPU2 es un ajuste fino (finetune) publicado por el usuario OpenFlowLM sobre el modelo base Qwen/Qwen3.5-4B de Alibaba Qwen. El pipeline declarado es image-text-to-text, es decir, se trata de un modelo multimodal que acepta texto e imágenes como entrada y genera texto. Según los metadatos de HuggingFace, se distribuye con licencia Apache 2.0 y está etiquetado como compatible con endpoints, con la librería transformers y el tag qwen3_5_text.

El modelo base Qwen3.5-4B es un transformer causal de 4.000 millones de parámetros con codificador de visión, construido sobre una arquitectura híbrida que combina Gated Delta Networks (atención lineal) con capas de Gated Attention y FFN, distribuida en 32 capas. Soporta de forma nativa 262.144 tokens de contexto, extensible hasta 1.010.000, y fue entrenado con multi-token prediction (MTP) en varios pasos. La serie Qwen3.5 declara soporte para 201 idiomas y dialectos y un entrenamiento multimodal con fusión temprana.

La relevancia de esta ficha concreta radica en que se trata de una variante adaptada por un tercero (el sufijo NPU2 sugiere una orientación a aceleradores NPU, aunque la model card no lo documenta), con 0 descargas y 0 likes en el momento de la consulta y publicada el 8 de octubre de 2026. No se dispone de información sobre el proceso de ajuste, los datos utilizados ni los benchmarks específicos de esta variante, por lo que las cifras de rendimiento que se recogen más abajo corresponden al modelo base Qwen3.5-4B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con codificador de vision; hibrida: 8 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)) |
| Parametros totales | 4B (4.000 millones) |
| Parametros activos | no disponible (la model card no documenta una configuracion MoE para la variante de 4B) |
| Longitud de contexto | 262.144 tokens nativos, extensible hasta 1.010.000 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | 201 idiomas y dialectos segun la model card del modelo base; los metadatos de HuggingFace indican "no disponibles" |
| Licencia | Apache 2.0 |
| Formato de pesos | Formato Hugging Face Transformers (compatible con transformers, vLLM, SGLang y KTransformers); no se detalla el contenedor exacto. Tamano del repositorio: 5,0 GB |

## Arquitectura y entrenamiento

La arquitectura del modelo base es un transformer causal hibrido con codificador de vision. La dimension oculta es de 2560, el embedding de tokens es de 248.320 (con padding), hay 32 capas y la FFN tiene una dimension intermedia de 9.216. El bloque se repite ocho veces con el patron 3 × (Gated DeltaNet → FFN) seguido de 1 × (Gated Attention → FFN). La Gated DeltaNet emplea 32 cabezas de atencion lineal para V y 16 para QK, con dimension de cabeza 128. La Gated Attention emplea 16 cabezas para Q y 4 para KV, dimension de cabeza 256 y dimension de Rotary Position Embedding de 64. La salida del modelo (248.320) esta atada al embedding de tokens.

El entrenamiento del modelo base comprende fases de preentrenamiento y postentrenamiento, con MTP (multi-token prediction) entrenado en varios pasos. La documentacion de la serie menciona entrenamiento con fusion temprana sobre tokens multimodales, escalado de reinforcement learning sobre entornos multiagente y una infraestructura de RL asincrona. No se especifica el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas concretas de RLHF o DPO. Para esta variante concreta (OpenFlowLM/Qwen3.5-4B-NPU2) no se documenta ningun detalle adicional de arquitectura ni de entrenamiento, por lo que se desconoce si el ajuste fino ha modificado capas de atencion, el codificador de vision o ambos.

## Capacidades

- Generacion de texto conversacional, con el tag `conversational` en los metadatos de HuggingFace.
- Comprension de imagenes y texto combinados (pipeline `image-text-to-text`), lo que incluye descripcion de imagenes, respuesta a preguntas visuales y razonamiento sobre documentos escaneados.
- Razonamiento, codigo y matematicas: la model card del modelo base declara paridad con Qwen3 y rendimiento superior a los modelos Qwen3-VL en benchmarks de razonamiento, codigo, agentes y comprension visual.
- Soporte de agentes: la serie Qwen3.5 se entrena con RL sobre entornos multiagente, lo que respalda razonamiento multi-paso y uso de herramientas.
- Cobertura multilingue declarada de 201 idiomas y dialectos en la serie Qwen3.5.
- Contexto largo nativo de 262.144 tokens, extensible a 1.010.000, adecuado para documentos extensos o historiales de conversacion largos.
- Decodificacion con multi-token prediction (MTP) en el modelo base, orientada a mejorar el throughput de inferencia.
- No se documenta en la informacion disponible soporte explicito de tool calling, modo thinking, audio ni otras capacidades especiales para esta variante concreta.

## Casos de uso

- Atencion al cliente automatizada: con 262.144 tokens de contexto nativo se pueden mantener conversaciones multi-turno muy largas sin truncar el historial, incorporando ademas capturas de pantalla o imagenes enviadas por el usuario gracias al pipeline image-text-to-text.
- Analisis de documentacion tecnica extensa: el modelo puede ingerir manuales, contratos o informes de cientos de miles de tokens en una sola pasada y responder preguntas concretas sobre su contenido, sin necesidad de trocear el documento.
- Procesamiento de documentos escaneados: al combinar vision y lenguaje, es adecuado para extraer datos estructurados de facturas, formularios o informes en PDF convertidos a imagen.
- Asistente de codigo en editor: generacion y explicacion de fragmentos de codigo dentro de un IDE, aprovechando la ventana de contexto para incluir varios ficheros del proyecto a la vez.
- Pipelines agenticos con herramientas: la formacion en RL sobre entornos multiagente del modelo base permite usarlo como nucleo de agentes que encadenan pasos y llaman a APIs, siempre que el desarrollador implemente el parseo de llamadas, ya que no se documenta soporte nativo de tool calling.
- Despliegue en el borde o en equipos con NPU: el sufijo NPU2 del repositorio y el tamano de 4B sugieren un uso previsto en aceleradores de baja potencia, aunque la model card no confirma que se hayan realizado conversiones especificas.
- Generacion de documentacion multilingue: con la cobertura declarada de 201 idiomas, puede redactar y traducir documentacion tecnica para mercados distintos.
- Moderacion y clasificacion de contenido multimodal: analisis de texto e imagenes para etiquetar o filtrar contenido en plataformas.

## Benchmarks y rendimiento

Los siguientes resultados corresponden a la model card del modelo base Qwen/Qwen3.5-4B. No hay datos publicados para la variante OpenFlowLM/Qwen3.5-4B-NPU2.

| Benchmark | GPT-OSS-120B | GPT-OSS-20B | Qwen3-Next-80B-A3B-Thinking | Qwen3-30BA3B-Thinking-2507 | Qwen3.5-9B | Qwen3.5-4B |
|---|---|---|---|---|---|---|
| MMLU-Pro | 80,8 | 74,8 | 82,7 | 80,9 | 82,5 | 79,1 |
| MMLU-Redux | 91,0 | 87,8 | 92,5 | 91,4 | dato truncado en la informacion disponible | no disponible |

La informacion proporcionada se interrumpe durante la tabla, por lo que el resto de benchmarks (matematicas, codigo, agentes y comprension visual) no estan disponibles.

## Requisitos de hardware

- VRAM estimada para los pesos en bf16: en torno a 8-9 GB para los 4.000 millones de parametros, mas el codificador de vision. El repositorio ocupa 5,0 GB, aunque no se especifica la precision de los pesos almacenados.
- VRAM estimada en int8: aproximadamente 4-5 GB para los pesos. En int4: aproximadamente 2,5-3 GB. Estas cifras son estimaciones por tamano de parametros, no datos publicados.
- Cache KV en contexto largo: la Gated Attention tiene 4 cabezas KV con dimension de cabeza 256 en 8 de las 32 capas. En bf16 esto supone unos 32 KB por token (8 capas × 2 × 4 × 256 × 2 bytes), es decir, del orden de 8,4 GB para llenar los 262.144 tokens de contexto sin cuantizar la cache. Las capas de Gated DeltaNet mantienen un estado recurrente de tamano constante, por lo que no crecen con la longitud de contexto.
- GPU recomendadas: no disponibles para esta variante. Por tamano, un modelo de 4B en bf16 cabe en GPU de consumo como la RTX 4090 (24 GB) o la RTX 4080 (16 GB), e incluso en GPUs de 8-12 GB si se cuantiza. Para contexto largo con cache KV completa se recomienda un acelerador de 24 GB o superior, como A100 (40/80 GB) o H100.
- Cabe en GPU de consumo: si, en tarjetas de 8 GB o mas segun cuantizacion; con contexto muy largo conviene ampliar a 24 GB o cuantizar la cache.
- Opciones de despliegue: la model card del modelo base indica compatibilidad con Hugging Face Transformers, vLLM, SGLang y KTransformers. Los metadatos de HuggingFace anaden el tag `endpoints_compatible`. No se confirma compatibilidad con llama.cpp, Ollama, TGI ni TensorRT-LLM.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU-Pro | MMLU-Redux | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| OpenFlowLM/Qwen3.5-4B-NPU2 | 4B | 262.144 tokens (extensible a 1.010.000) | no disponible | no disponible | Apache 2.0 | HuggingFace, 0 descargas |
| Qwen3.5-4B (base) | 4B | 262.144 tokens (extensible a 1.010.000) | 79,1 | no disponible | Apache 2.0 | HuggingFace |
| Qwen3.5-9B | 9B | no disponible | 82,5 | dato truncado | no disponible | HuggingFace |
| GPT-OSS-20B | 20B | no disponible | 74,8 | 87,8 | no disponible | no disponible |
| Qwen3-30BA3B-Thinking-2507 | 30B totales (MoE) | no disponible | 80,9 | 91,4 | no disponible | HuggingFace |

El dato mas relevante de la comparativa es que Qwen3.5-4B alcanza 79,1 en MMLU-Pro, por encima de GPT-OSS-20B (74,8) pese a tener cinco veces menos parametros, y muy cerca de Qwen3-30BA3B-Thinking-2507 (80,9). No se dispone de datos comparativos de contexto, licencia o latencia para las alternativas listadas.

## Limitaciones y advertencias

- La variante OpenFlowLM/Qwen3.5-4B-NPU2 no documenta su proceso de ajuste fino: se desconoce que datos se usaron, cuantas horas de entrenamiento y que capacidades del modelo base se han podido degradar. Los benchmarks del modelo base no son extrapolables sin verificacion.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta y fue creado el 8 de octubre de 2026. Es un artefacto sin validacion por parte de la comunidad.
- No se especifica el significado del sufijo NPU2 ni si los pesos han sido convertidos, cuantizados o adaptados para aceleradores NPU. Tampoco se indica que framework de inferencia en NPU es compatible.
- La licencia declarada es Apache 2.0, que permite uso comercial, pero el titular del ajuste fino es un tercero distinto de Alibaba Qwen; conviene verificar la trazabilidad de la licencia del modelo base enlazada en la model card.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad ni tasas de alucinacion para esta variante. Como en cualquier modelo de 4B, la generacion de hechos concretos debe verificarse.
- Idiomas: los metadatos de HuggingFace no listan idiomas soportados para el repositorio. La cifra de 201 idiomas proviene de la documentacion de la serie y no de una evaluacion de esta variante.
- Contexto: los 262.144 tokens nativos y la extension a 1.010.000 son datos del modelo base. La calidad de recuperacion en contextos muy largos no esta documentada, y el coste de memoria de la cache KV crece de forma apreciable.
- No se documenta soporte nativo de tool calling ni de function calling para esta variante, a pesar del enfasis de la serie en entornos agenticos.
- Advertencia de produccion: al no existir benchmarks propios, evaluaciones de seguridad ni informes de sesgo, no se recomienda su despliegue en entornos criticos sin una bateria de pruebas previa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OpenFlowLM/Qwen3.5-4B-NPU2
- Modelo base Qwen/Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai
- Resultados de busqueda web: no se han encontrado enlaces relevantes. Los resultados devueltos corresponden a tiktok.com y no guardan relacion con el modelo, por lo que no se incluyen papers, repositorios ni demos adicionales.
