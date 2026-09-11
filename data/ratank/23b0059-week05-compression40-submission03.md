# RatanK/23B0059-Week05-Compression40-Submission03

## Resumen

RatanK/23B0059-Week05-Compression40-Submission03 es un derivado publicado en Hugging Face por el usuario RatanK, cuyo model card es el de Qwen3.5-4B (heredado del fabricante) y que declara como modelo base Qwen/Qwen3.5-4B-Base. El nombre del repositorio sugiere un ejercicio de compresion o cuantizacion (la etiqueta interna indica "Compression40" y "Submission03"), y el tamano del repositorio, 4,0 GB, es aproximadamente la mitad de lo esperable para 4.000 millones de parametros en FP16, lo que apunta a pesos almacenados con precision reducida. Se trata de un repositorio sin descargas ni valoraciones en el momento de la consulta y sin evaluacion independiente publicada.

El modelo subyacente, Qwen3.5-4B, es un modelo de lenguaje causal con codificador de vision desarrollado por el equipo Qwen de Alibaba. Segun el model card, integra una arquitectura hibrida que combina Gated DeltaNet (atencion lineal con estado recurrente) y atencion con compuerta (Gated Attention, atencion completa), entrenada con fusion temprana de tokens multimodales. El objetivo declarado es alcanzar paridad con la generacion Qwen3 y superar a los modelos Qwen3-VL en razonamiento, codigo, agentes y comprension visual, con un coste de inferencia reducido gracias al diseno hibrido.

Su relevancia practica esta en la combinacion de tamano contenido (4.000 millones de parametros), contexto nativo de 262.144 tokens extensible hasta 1.010.000, soporte declarado de 201 idiomas y dialectos y licencia Apache 2.0. Eso lo situa en la categoria de modelos pequenos multimodales desplegables en una sola GPU y orientados a cargas con contexto muy largo, aunque en este repositorio concreto no hay evidencia publicada de que los pesos comprimidos conserven las capacidades del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal hibrido con codificador de vision: 8 x (3 x (Gated DeltaNet -> FFN) -> 1 x (Gated Attention -> FFN)); 32 capas en total |
| Parametros totales | 4B (modelo base declarado) |
| Parametros activos | no disponible (las notas del fabricante mencionan MoE disperso, pero no se detallan expertos ni parametros activos) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.010.000 tokens |
| Tipos de cuantizacion | no disponible de forma explicita; el tamano del repositorio (4,0 GB) sugiere pesos con precision reducida (aproximadamente 8 bits o inferior) |
| Idiomas soportados | 201 idiomas y dialectos segun el fabricante; el repositorio no declara metadatos de idioma |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato Hugging Face Transformers |
| Dimension oculta | 2560 |
| Embedding de tokens | 248320 (con padding, atado a la salida LM) |
| Gated DeltaNet | 32 cabezas de atencion lineal para V y 16 para QK; dimension de cabeza 128 |
| Gated Attention | 16 cabezas para Q y 4 para KV; dimension de cabeza 256; dimension de RoPE 64 |
| FFN | Dimension intermedia 9216 |
| Prediccion multi-token | Entrenado con MTP multi-step |
| Entrada/salida | image-text-to-text (texto e imagen) |
| Biblioteca | transformers |
| Compatibilidad declarada | Hugging Face Transformers, vLLM, SGLang, KTransformers |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal hibrido. Cada bloque de ocho capas combina tres subbloques de Gated DeltaNet, un mecanismo de atencion lineal con estado recurrente (32 cabezas para V, 16 para QK, dimension de cabeza 128), con un subbloque de Gated Attention, atencion completa con solo 4 cabezas KV frente a 16 de Q, dimension de cabeza 256 y RoPE de dimension 64. La red feed-forward tiene dimension intermedia 9216 y la salida LM (248320) esta atada al embedding de tokens, con padding en el vocabulario. El model card indica que la capa de atencion lineal reduce el coste asintotico del contexto largo frente a la atencion completa, que se reserva para una de cada cuatro capas.

El model card describe un entrenamiento en dos etapas (pre-entrenamiento y post-entrenamiento) con fusion temprana de tokens multimodales, de modo que el modelo procesa texto e imagen de forma conjunta desde fases tempranas. Se menciona entrenamiento con MTP (Multi-Token Prediction) multi-step, lo que habilita decodificacion especulativa con la propia cabeza de prediccion, y un escalado de aprendizaje por refuerzo sobre entornos multi-agente con distribuciones de tarea crecientemente complejas. No se especifica el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron RLHF o DPO, por lo que esos datos no estan disponibles.

En cuanto a este repositorio concreto, no hay informacion sobre el procedimiento de compresion aplicado (no se detalla si es cuantizacion post-entrenamiento, poda, destilacion o una combinacion), ni sobre que capas o modulos se han modificado respecto al modelo base. El unico indicio es el tamano del repositorio y el nombre de la publicacion.

## Capacidades

- Generacion de texto y conversacion multi-turno con contexto largo, gracias a la ventana nativa de 262.144 tokens.
- Razonamiento y conocimiento general: el fabricante reporta resultados competitivos en MMLU-Pro para el modelo base de 4B.
- Comprension de imagen combinada con texto (pipeline image-text-to-text), con codificador de vision integrado.
- Generacion y comprension de codigo, segun las capacidades declaradas para la familia Qwen3.5.
- Matematicas y tareas STEM, incluidas en los apartados "Knowledge & STEM" de la tabla de benchmarks del fabricante.
- Razonamiento agente y multi-paso, con aprendizaje por refuerzo escalado sobre entornos multi-agente.
- Capacidades multilingues amplias: 201 idiomas y dialectos declarados por el fabricante.
- Prediccion multi-token (MTP) entrenada, aprovechable para decodificacion especulativa.
- Soporte de tool calling / function calling: no confirmado de forma explicita en la informacion disponible.
- Modo thinking explicito: no confirmado en la informacion disponible para esta variante.

## Casos de uso

- Analisis de documentos extensos: el modelo puede recibir informes, expedientes o bases de conocimiento de cientos de miles de tokens en una sola pasada, sin necesidad de troceado ni recuperacion previa, gracias al contexto nativo de 262.144 tokens.
- Atencion al cliente automatizada: conversaciones multi-turno con historial largo y, si la compresion mantiene el codificador de vision, con entrada de capturas o fotos enviadas por el usuario.
- Extraccion de informacion de imagenes y formularios: al ser un modelo image-text-to-text, puede procesar capturas, diagramas o documentos escaneados y devolver texto estructurado.
- Asistente de codigo en local: con 4.000 millones de parametros, puede ejecutarse en una GPU de consumo y ofrecerse como autocompletado o revision de codigo sin enviar el codigo a servicios externos.
- Despliegue multilingue: gracias a la cobertura declarada de 201 idiomas, sirve para clasificacion, resumen o traduccion asistida en carteras de idiomas amplias dentro de una misma infraestructura.
- Razonamiento sobre registros largos (logs, trazas, historiales): la combinacion de atencion lineal y contexto largo reduce el coste de analizar secuencias muy extensas en tareas de diagnostico.
- Prototipado y docencia: al ser un modelo pequeno con licencia Apache 2.0, es adecuado para experimentar con arquitecturas hibridas y tecnicas de compresion en entornos con presupuesto limitado.
- Preprocesado de pipelines RAG: uso como modelo de resumen o reescritura de fragmentos antes de pasarlos a un modelo mayor, reduciendo coste por token.

## Benchmarks y rendimiento

La informacion disponible solo incluye un fragmento de la tabla de benchmarks del fabricante, y unicamente el valor de MMLU-Pro para Qwen3.5-4B esta completo. El resto de filas quedaron truncadas en el model card recuperado, por lo que no se reproducen.

| Modelo | MMLU-Pro | MMLU-Redux | Parametros |
|---|---|---|---|
| Qwen3.5-4B | 79,1 | no disponible (dato truncado) | 4B |
| Qwen3.5-9B | 82,5 | no disponible (dato truncado) | 9B |
| Qwen3-Next-80B-A3B-Thinking | 82,7 | 92,5 | 80B totales, 3B activos |
| Qwen3-30BA3B-Thinking-2507 | 80,9 | 91,4 | 30B totales, 3B activos |
| GPT-OSS-120B | 80,8 | 91,0 | 120B |
| GPT-OSS-20B | 74,8 | 87,8 | 20B |

No se han publicado resultados de benchmarks especificos para el repositorio RatanK/23B0059-Week05-Compression40-Submission03, ni evaluacion independiente de la perdida de calidad asociada a la compresion. Los datos de la tabla corresponden al modelo base Qwen3.5-4B segun el fabricante.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 8-10 GB solo para pesos, mas el estado de atencion y cache. Los pesos de este repositorio ocupan 4,0 GB, lo que sugiere que la version publicada necesita menos memoria que el modelo base sin comprimir.
- VRAM estimada para el repositorio publicado: alrededor de 5-6 GB en precision de almacenamiento, mas overhead de runtime; la cifra exacta no esta disponible.
- Cache de contexto: la atencion lineal en tres de cada cuatro capas mantiene estado recurrente de tamano fijo, mientras que las capas de Gated Attention si generan cache KV. El consumo con 262.144 tokens no esta cuantificado en la informacion disponible.
- GPU recomendadas: H100 o A100 para lotes grandes y contexto maximo; L40S o A6000 para servicio con contexto largo; RTX 4090 (24 GB) para contexto medio y lotes pequenos.
- GPU de consumo: si, el modelo de 4B cabe en GPUs de consumo. En 24 GB (RTX 4090, RTX 3090) hay margen para contexto largo; en 16 GB (RTX 4070 Ti Super, RTX 4080) es viable con precision reducida y contexto moderado; en 8-12 GB requiere cuantizacion adicional.
- Opciones de despliegue: vLLM, SGLang, KTransformers y Hugging Face Transformers estan declarados como compatibles por el fabricante del modelo base. No hay confirmacion de que existan pesos GGUF o soporte de llama.cpp/Ollama para este repositorio concreto.
- Latencia y throughput: no disponibles. No se han publicado mediciones para este repositorio ni para el modelo base en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU-Pro | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RatanK/23B0059-Week05-Compression40-Submission03 | 4B (base declarada) | 262.144 nativos (heredado del base) | no disponible | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen3.5-4B (base) | 4B | 262.144 nativos, extensible a 1.010.000 | 79,1 | Apache 2.0 | Hugging Face, oficial |
| Qwen3.5-9B | 9B | no disponible | 82,5 | no disponible | Hugging Face, oficial |
| GPT-OSS-20B | 20B | no disponible | 74,8 | no disponible | no disponible |
| Qwen3-30BA3B-Thinking-2507 | 30B totales, 3B activos | no disponible | 80,9 | no disponible | no disponible |

La comparativa se limita a parametros, contexto declarado y MMLU-Pro, que es el unico benchmark con datos completos en la informacion disponible. No hay datos de licencia ni de disponibilidad para los modelos de referencia mas alla de lo indicado.

## Limitaciones y advertencias

- El repositorio no incluye model card propio: el README es el de Qwen3.5-4B. No hay documentacion sobre el proceso de compresion ni sobre las diferencias respecto al modelo base.
- No existe evaluacion publicada de la calidad del modelo comprimido. La degradacion respecto a Qwen3.5-4B es desconocida y podria ser significativa en tareas de razonamiento o en el manejo de contexto muy largo.
- Repositorio sin descargas ni valoraciones, publicado por un usuario individual y con un nombre que sugiere un ejercicio academico. No debe tratarse como una publicacion estable ni mantenida.
- El model card declara "Qwen/Qwen3.5-4B-Base" como modelo base, pero el contenido describe el modelo post-entrenado (Qwen3.5-4B). Esa discrepancia no esta resuelta en la informacion disponible.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de este tamano, y potencialmente mayor si la compresion afecta a las capas de mayor sensibilidad.
- Cobertura de idiomas: los 201 idiomas son una cifra declarada para el modelo original; no hay verificacion para los pesos comprimidos, y es previsible un rendimiento desigual entre idiomas.
- Contexto: los 262.144 tokens nativos y la extension a 1.010.000 son datos del modelo base. No se ha verificado que la version comprimida conserve esa ventana ni la calidad en el extremo alto.
- Tool calling y modo thinking no estan confirmados para esta variante.
- Licencia: Apache 2.0 permite uso comercial, pero el usuario debe verificar por su cuenta el cumplimiento y la procedencia de los pesos, dado que no hay trazabilidad documentada del proceso de compresion.
- No hay garantia de mantenimiento, actualizaciones ni soporte por parte del autor.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RatanK/23B0059-Week05-Compression40-Submission03
- Modelo base declarado: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Modelo post-entrenado de referencia: https://huggingface.co/Qwen/Qwen3.5-4B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- Blog del fabricante sobre Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai

Nota: los resultados de la busqueda web realizada no contienen informacion relevante sobre este modelo (devuelven paginas de soporte de Microsoft), por lo que no se han podido incorporar fuentes adicionales.
