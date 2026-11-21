# onemunanoyo/Inkling-2-Mini-Abliterated-GGUF

## Resumen

Inkling-2-Mini-Abliterated-GGUF es una compilación de pesos en formato GGUF derivada de `thinkingmachines/Inkling-2-Mini`, un modelo de lenguaje de aproximadamente 26.070 millones de parámetros. La versión que nos ocupa ha sido sometida a un proceso de *abliteration* (eliminación de direcciones de rechazo en el espacio de activaciones) por parte del usuario `onemunanoyo`, partiendo de los builds GGUF dinámicos de Unsloth. El objetivo declarado es obtener una variante sin los mecanismos de rechazo habituales, orientada a investigación, *red-teaming* y evaluación de alineamiento.

El modelo conserva la asignación de cuantización por tensor del build original de Unsloth (UD, *Unsloth Dynamic*), lo que significa que no se ha recuantizado de forma uniforme: cada tensor mantiene su tipo original (BF16, Q8_0, Q6_K, Q5_K, Q4_K, Q2_0, NVFP4, MXFP4). Esta decisión preserva mejor la fidelidad numérica respecto al modelo base que una cuantización homogénea, a costa de un tamaño de repositorio de 22,9 GB.

La relevancia de esta ficha es doble: por un lado documenta una variante *abliterated* de un modelo reciente con soporte multimodal (incluye un proyector de visión `mmproj-BF16.gguf`); por otro, advierte de que la model card original está prácticamente vacía en cuanto a benchmarks, idiomas y detalles de entrenamiento, por lo que muchos datos técnicos deben marcarse como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalles internos no disponibles en la informacion proporcionada) |
| Parametros totales | 26.070.390.272 |
| Parametros activos | no disponible (no se confirma que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K, Q4_K, Q2_0, NVFP4, MXFP4 (asignacion por tensor, estilo UD de Unsloth) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (mas proyector `mmproj-BF16.gguf` para vision) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base `thinkingmachines/Inkling-2-Mini`. Se sabe que es un transformer de aproximadamente 26.000 millones de parametros y que el repositorio incluye un proyector multimodal (`mmproj-BF16.gguf`), lo que confirma capacidades de vision en el modelo original. No se especifica si emplea atencion lineal, mezcla de expertos, atencion estandar o alguna variante hibrida.

Respecto al entrenamiento, la model card no aporta datos sobre volumen de tokens, composicion del dataset, fases de RLHF/DPO ni proceso de alineamiento. Lo unico documentado es el proceso de *abliteration* aplicado por el autor: se usaron los datasets `heretic-org/Semantic-Harmful` y `heretic-org/Semantic-Harmless` como referencia para identificar y eliminar las direcciones de rechazo en el espacio de activaciones. Este proceso se aplico sobre los pesos ya cuantizados de Unsloth, preservando la asignacion de cuantizacion por tensor de cada variante (por ejemplo, `attn_output` en Q8_0 y `ffn_down_exps` con mezcla de NVFP4 y Q8_0 en la variante Q4_K_XL).

## Capacidades

- Generacion de texto conversacional (el tag `conversational` esta presente en el repositorio).
- Procesamiento multimodal de imagenes gracias al proyector `mmproj-BF16.gguf` incluido.
- Capacidades de razonamiento y codigo: no confirmadas explicitamente en la informacion disponible, pero plausibles dado el tamano del modelo; deben verificarse empiricamente.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles; el repositorio no declara idiomas.
- Modo *abliterated*: el modelo ha sido modificado para reducir los rechazos ante peticiones que el modelo base rechazaria. Esta es una capacidad tecnica del artefacto, no una mejora funcional.

## Casos de uso

- Investigacion de alineamiento y *red-teaming*: el modelo permite estudiar como se comporta una variante sin mecanismos de rechazo frente a la original, comparando respuestas y midiendo la eficacia del proceso de abliteration. Es el uso principal declarado por el autor.
- Evaluacion de robustez de filtros de seguridad: util para probar clasificadores y capas de moderacion externas, ya que genera contenido que un modelo alineado rechazaria, permitiendo validar que los filtros aguas abajo funcionan.
- Analisis de sesgos y comportamientos no deseados: al eliminar la capa de rechazo, se pueden observar sesgos subyacentes del modelo base que normalmente quedan enmascarados por respuestas evasivas.
- Procesamiento multimodal en local: con el proyector `mmproj-BF16.gguf` y una build GGUF compatible (llama.cpp), se pueden hacer tareas de descripcion de imagenes o VQA en hardware de consumo, sujeto a la VRAM disponible.
- Generacion de texto creativo sin restricciones tematicas: escritura de ficcion, guiones o narrativa que aborde temas sensibles, en entornos controlados y con revision humana.
- Despliegue en entornos con recursos limitados: las variantes Q4_K_M y Q2_K_XL permiten ejecutar un modelo de 26B en GPUs de consumo o incluso en CPU, algo inviable con los pesos BF16 originales.
- Experimentacion con cuantizacion dinamica: el repositorio sirve como caso de estudio de la estrategia UD de Unsloth, comparando fidelidad y perplexity entre variantes Q8_K_XL, Q4_K_XL, Q4_K_M y Q2_K_XL.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye tablas de perplexity y evaluacion de rechazos, pero estan vacias (sin valores). No se deben inferir cifras.

## Requisitos de hardware

- VRAM estimada para inferencia: depende de la variante. Q8_K_XL ronda los 27-28 GB (pesos cercanos a BF16 en muchos tensores); Q4_K_XL y Q4_K_M en torno a 14-16 GB; Q2_K_XL aproximadamente 8-10 GB. Estas cifras son estimaciones a partir del tamano del repositorio (22,9 GB) y del numero de parametros, no datos publicados.
- GPU recomendadas: A100 40/80 GB o H100 para Q8_K_XL; RTX 4090 (24 GB) o RTX 3090 para Q4_K_XL/Q4_K_M; GPUs de 8-12 GB para Q2_K_XL.
- Cabe en GPU de consumo: si, en las variantes Q4 y Q2. La Q8_K_XL no cabe en una RTX 4090 de 24 GB sin offloading.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio y cualquier runtime compatible con GGUF. vLLM y TGI no soportan GGUF de forma nativa para este tipo de builds; requeririan los pesos originales en safetensors.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini-Abliterated (este) | ~26,07B | no disponible | Apache 2.0 | GGUF | Variante sin rechazos, multimodal |
| thinkingmachines/Inkling-2-Mini (base) | ~26,07B | no disponible | no disponible | safetensors | Modelo original alineado |
| unsloth/Inkling-2-Mini-GGUF | ~26,07B | no disponible | no disponible | GGUF | Builds UD sin abliteration |
| Alternativas de ~24-27B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados de modelos comparables en la informacion proporcionada |

No se dispone de informacion suficiente para comparar rendimiento (benchmarks) con alternativas de la misma categoria.

## Limitaciones y advertencias

- El modelo ha sido *abliterated*: no rechaza peticiones que el modelo base rechazaria. Esto lo hace inadecuado para despliegues de cara al publico sin una capa de moderacion externa.
- Riesgo elevado de generar contenido danino, ilegal o eticamente problematico. El autor lo restringe explicitamente a investigacion, *red-teaming* y evaluacion de alineamiento.
- La model card no documenta sesgos conocidos, pero al eliminar la capa de rechazo es probable que sesgos subyacentes del modelo base queden mas expuestos.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; debe asumirse el comportamiento tipico de un modelo de ~26B sin datos de evaluacion.
- Idiomas y contexto no declarados: no se puede garantizar un rendimiento multilingue ni una ventana de contexto concreta sin pruebas empiricas.
- La licencia Apache 2.0 permite uso comercial, pero el uso comercial de una variante sin rechazos conlleva riesgos legales y reputacionales que el usuario debe evaluar.
- El proceso de abliteration puede degradar capacidades generales (razonamiento, codigo); no hay benchmarks que lo confirmen o descarten.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion de la comunidad.
- Los pesos GGUF no son directamente compatibles con vLLM/TGI; para produccion a gran escala habria que reconvertir o usar llama.cpp con servidor.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/onemunanoyo/Inkling-2-Mini-Abliterated-GGUF
- Modelo base original: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Builds GGUF de Unsloth: https://huggingface.co/unsloth/Inkling-2-Mini-GGUF
- Dataset de referencia (harmful): https://huggingface.co/datasets/heretic-org/Semantic-Harmful
- Dataset de referencia (harmless): https://huggingface.co/datasets/heretic-org/Semantic-Harmless
