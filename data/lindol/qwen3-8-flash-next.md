# LindoL/Qwen3.8-Flash-Next

## Resumen

Qwen3.8-Flash-Next es un modelo experimental de pesos abiertos publicado en Hugging Face bajo la cuenta `LindoL` y descrito en su model card como el anticipo de la arquitectura que sustentará la futura familia Qwen4. Se trata de un modelo de lenguaje causal con codificador de visión, pensado para cargas de trabajo agénticas y de contexto largo, que combina atención lineal (Gated DeltaNet) con una atención dispersa propia (Qwen Sparse Attention, QSA), mezcla de expertos (MoE) de 512 expertos, embeddings de n-gramas y un módulo de predicción multi-token (MTP).

El recuento real de parámetros del repositorio, según los ficheros safetensors, es de 179.999.981.459 (unos 180.000 millones), que la model card desglosa en 125B del modelo de lenguaje (6B activados por token), 51B de embeddings de n-gramas y 4B de MTP. La longitud de contexto nativa es de 262.144 tokens, extensible hasta 1.000.000, y el repositorio ocupa 360 GB en formato Transformers.

Su relevancia radica en la eficiencia: con solo 6B de parámetros activos por token y atención dispersa a nivel de micro-bloque, apunta a reducir la latencia en contextos largos, que es donde las cargas agénticas reales se vuelven costosas. Ahora bien, conviene tratar esta ficha con cautela: el autor del repositorio no es la organización oficial de Qwen, el modelo no tiene descargas ni valoraciones, la model card está truncada justo en la sección de benchmarks y la búsqueda web no ha devuelto ninguna fuente independiente que lo valide.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal híbrido con codificador de visión: Gated DeltaNet (atención lineal) + Qwen Sparse Attention (QSA), MoE, Gated Residual y embeddings de n-gramas |
| Parametros totales | 179.999.981.459 (~180B): 125B del LM + 51B de embeddings de n-gramas + 4B de MTP |
| Parametros activos | 6B por token (10 expertos enrutados + 1 compartido de 512) |
| Longitud de contexto | 262.144 tokens nativo; extensible hasta 1.000.000 |
| Tipos de cuantizacion | No disponible (el repositorio solo publica pesos en safetensors; la model card no detalla cuantizaciones oficiales) |
| Idiomas soportados | No disponible |
| Licencia | qwen-community-1.0 (etiquetada como `license: other`, con `license_name: qwen-community-1.0` y enlace a `LICENSE`) |
| Formato de pesos | Safetensors en formato Hugging Face Transformers; compatible con Transformers, vLLM, SGLang y TokenSpeed |
| Dimension oculta | 2.560 |
| Capas | 48, con disposición 12 × (3 × (Gated DeltaNet → MoE) → 1 × (Qwen Sparse Attention → MoE)) |
| Expertos | 512 en total; intermedios de dimensión 640 |
| Embeddings | Token embedding de 248.320 (con padding); 20.000.000 de n-gramas (bigramas/trigramas en la capa 2) |
| Tamano del repositorio | 360 GB |

## Arquitectura y entrenamiento

La arquitectura abandona el patrón clásico de atención completa en todas las capas. De las 48 capas, 36 usan Gated DeltaNet —atención lineal recurrente con 48 cabezas para V, 16 para QK y dimensión de cabeza 128— y 12 usan Qwen Sparse Attention, que en lugar de seleccionar tokens individuales opera sobre micro-bloques con un presupuesto de 512 bloques o 2.048 tokens. QSA emplea 24 cabezas de consulta y 2 de clave-valor con dimensión 256 y RoPE de 64 dimensiones, más un indexador en estructura MQA con 4 cabezas de consulta y 1 cabeza de clave compartida de dimensión 128. La capa MoE intercala 512 expertos (10 enrutados + 1 compartido) con dimensión intermedia 640. Se añade un Gated Residual de 4 ramas y rango de cuello de botella 320, que modula el flujo de información mediante una puerta de lectura elemento a elemento dependiente de los datos y una puerta escalar de escritura por rama.

La innovación menos habitual es el embedding de n-gramas: en lugar de escalar parámetros exclusivamente vía MoE, el modelo indexa con bigramas y trigramas en la capa 2, lo que permite aumentar capacidad con menor coste computacional y, según la model card, es más apto para descargarse a memoria secundaria en aceleradores con memoria limitada. El entrenamiento combina preentrenamiento y postentrenamiento, aplica Muon y AdamW a categorías de pesos específicas y, guiado por leyes de escala reajustadas, elimina los warmups de tamano de batch arrancando directamente en el batch objetivo. Se incluye una capa MTP entrenada con múltiples pasos, orientada a decodificación especulativa. No se detalla en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno, con pipeline declarado `image-text-to-text`.
- Procesamiento de imagen y texto combinados gracias al codificador de visión integrado.
- Manejo de contextos muy largos: 262.144 tokens nativos y hasta 1.000.000 en extensión.
- Cargas agénticas: la model card justifica QSA explícitamente por la latencia en contextos largos bajo cargas de agentes.
- Decodificación multi-token (MTP) para acelerar la generación.
- Compatibilidad de despliegue con Transformers, vLLM, SGLang y TokenSpeed, lo que habilita serving con procesamiento continuo de lotes.
- Soporte de tool calling / function calling: no confirmado en la información disponible para esta versión de pesos abiertos; la model card solo atribuye herramientas oficiales integradas a la variante gestionada Qwen3.8-Flash.
- Capacidades multilingües: no disponible.
- Modo de razonamiento explícito (thinking): no disponible.

## Casos de uso

- Agentes de código sobre repositorios completos: con 262.144 tokens de contexto se puede inyectar un árbol de ficheros y varios módulos relevantes en una sola llamada, y el coste por token se mantiene bajo al activarse solo 6B de parámetros.
- Análisis de documentación técnica heterogénea: al aceptar imagen y texto, admite diagramas de arquitectura, capturas de paneles de monitorización y tablas escaneadas junto al texto que las explica, sin pipeline OCR separado.
- Asistencia al cliente con historial largo: conversaciones de soporte con decenas de miles de tokens de historial y base de conocimiento adjunta caben en la ventana nativa, lo que evita resumir y perder trazabilidad.
- RAG sobre corpus extensos: en lugar de recuperar fragmentos de 512 tokens, se pueden pasar documentos completos o capítulos enteros y dejar que la atención dispersa seleccione los micro-bloques relevantes.
- Procesamiento por lotes de bajo coste: con 6B activos por token, el coste de cómputo por petición es una fracción del de un modelo denso de 180B, lo que lo hace apto para clasificación, extracción y resumen masivo en segundo plano.
- Evaluación de arquitecturas híbridas en investigación: al ser un anticipo de la arquitectura Qwen4 con atención lineal, QSA, Gated Residual y embeddings de n-gramas, sirve como banco de pruebas para medir el impacto de cada componente en latencia y calidad.
- Despliegue en clústeres con GPUs de memoria limitada: la propia model card señala que los embeddings de n-gramas son aptos para offloading, lo que permite liberar memoria de acelerador en entornos con presupuesto ajustado.

## Benchmarks y rendimiento

La model card incluye una sección titulada "Benchmark Results", pero el contenido de la tabla no está presente en la información proporcionada (el texto se corta justo después del encabezado y los estilos). Por tanto:

No se han publicado resultados de benchmarks en la información disponible.

No se dispone de cifras de MMLU, HumanEval, GSM8K, MMMU ni de comparaciones numéricas con otros modelos. Tampoco hay datos de latencia o throughput medidos.

## Requisitos de hardware

- Peso de los pesos en BF16: unos 360 GB (coincide con el tamano del repositorio). En FP8, alrededor de 180 GB; en cuantización de 4 bits, en torno a 90-100 GB. Son estimaciones aritméticas a partir del recuento de parámetros, no cifras publicadas.
- GPU recomendadas para BF16: 8× H100 de 80 GB (640 GB agregados) o 4× H200 de 141 GB; en configuraciones de 4× H100 (320 GB) no cabe sin offloading.
- FP8: 3× H100 de 80 GB o 2× H200 de 141 GB.
- Cuantización de 4 bits: 2× H100 de 80 GB o 1× H200 de 141 GB con margen justo; una A100 de 80 GB no es suficiente.
- GPU de consumo: no cabe en ninguna tarjeta individual actual. Cuatro RTX 4090 (96 GB agregados) quedarían en el límite incluso en 4 bits, y solo serían viables si se descargan a CPU los 51B de embeddings de n-gramas, algo que la model card presenta como factible.
- Caché KV: estimación propia de unos 24 KB por token en BF16, ya que solo 12 de las 48 capas mantienen caché de atención completa (2 cabezas KV × 256 dimensiones); a 262.144 tokens serían unos 6 GB. Las 36 capas de Gated DeltaNet mantienen estado de tamano constante. Es una aproximación de cálculo, no un dato publicado.
- Opciones de despliegue: Transformers, vLLM, SGLang y TokenSpeed, según la model card. Soporte en llama.cpp, Ollama o TGI: no disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next (este repositorio) | ~180B (125B LM + 51B n-gram + 4B MTP) | 6B | 262.144 nativo, hasta 1.000.000 | qwen-community-1.0 | Pesos safetensors, 360 GB, vía `LindoL` |
| Qwen3.8-Flash (API oficial en Qwen Cloud) | No disponible | No disponible | 1.000.000 por defecto | Servicio propiedad de Qwen | API gestionada, con herramientas oficiales integradas |
| Otros modelos abiertos de escala ~200B | No disponible en la información proporcionada | No disponible | No disponible | No disponible | No disponible |

No se han encontrado en la información disponible datos de benchmarks ni de rendimiento que permitan una comparación cuantitativa con alternativas. La búsqueda web realizada no devolvió ninguna fuente relacionada con el modelo: todos los resultados corresponden a la Federación Francesa de Voleibol (FFvolley) y son irrelevantes.

## Limitaciones y advertencias

- Procedencia no verificada: el repositorio lo publica el usuario `LindoL`, no una organización oficial de Qwen, con 0 descargas y 0 likes. La model card describe el modelo como si fuera oficial, pero no hay confirmación independiente de que estos pesos correspondan al modelo descrito.
- Model card incompleta: falta la tabla de benchmarks, no se listan idiomas soportados, no se detalla el dataset de entrenamiento ni el proceso de alineación (RLHF/DPO), y no se especifican cuantizaciones oficiales.
- Arquitectura en estado experimental: la propia card la presenta como un anticipo de Qwen4, no como un modelo listo para producción, y no hay histórico de estabilidad ni soporte de la comunidad.
- Riesgo de alucinación: sin datos de evaluación publicados no se puede acotar la tasa de error en tareas factuales, matemáticas o de código.
- Contexto largo sin validar: los 1.000.000 de tokens son una extensión declarada, no una capacidad medida; el rendimiento real más allá de 262.144 tokens no está documentado.
- Licencia qwen-community-1.0: es una licencia con condiciones específicas (etiquetada como `other`), no una licencia OSI. Antes de un uso comercial hay que revisar el fichero `LICENSE` del repositorio, ya que puede imponer restricciones de atribución, uso acceptable o despliegue.
- Requisitos de infraestructura muy altos: 360 GB de pesos en BF16 obligan a multi-GPU de数据中心; no es desplegable en hardware de consumo.
- Idiomas no declarados: no se puede asumir calidad en castellano sin evaluación previa.
- Sin soporte confirmado de tool calling en esta versión abierta, lo que puede limitar su uso en pipelines agénticos que dependan de function calling estándar.
- Fecha de creación del repositorio: 19 de octubre de 2026, según los metadatos de Hugging Face.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/LindoL/Qwen3.8-Flash-Next
- Blog oficial del modelo: https://qwen.ai/blog?id=qwen3.8-flash-next
- Informe técnico: https://github.com/QwenLM/Qwen3.8-Flash-Next/blob/main/tech_report.pdf
- Repositorio GitHub de la familia: https://github.com/QwenLM/Qwen3.8-Flash-Next
- Imagen de la arquitectura: https://qianwen-res.oss-accelerate.aliyuncs.com/Qwen3.8-Flash-Next/architecture.png
- Qwen Cloud (servicio gestionado): https://www.qwencloud.com
- Ficha de Qwen3.8-Flash (versión API): https://www.qwencloud.com/models/qwen3.8-flash
- Búsqueda web: sin resultados relevantes; los enlaces devueltos corresponden a la FFvolley (https://www.ffvb.org/) y no guardan relación con el modelo.
