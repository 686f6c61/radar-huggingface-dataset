# nativ-community/LFM2.5-24B-A2B-Preview-bf16

## Resumen

LFM2.5-24B-A2B-Preview-bf16 es una conversion a formato MLX del modelo LFM2.5-24B-A2B-Preview de Liquid AI, publicada por la organizacion nativ-community (con identico contenido en mlx-community). Se trata de un modelo de generacion de texto con arquitectura de mezcla de expertos (MoE, etiqueta `lfm2_moe`), 23.971.587.712 parametros totales y una ventana de contexto declarada de 131.072 tokens. Esta version concreta esta pensada para ejecucion local en Apple Silicon mediante la libreria MLX y el soporte de MLX-VLM.

El modelo resuelve el problema de desplegar un LLM de razonamiento de gran tamano en hardware de Apple sin depender de GPUs NVIDIA ni de servicios en la nube. Los pesos se distribuyen en bfloat16, con los sesgos de enrutamiento de expertos conservados en FP32, y el repositorio ocupa 48,0 GB (47,94 GB en archivos de pesos en notacion decimal). La model card indica que el modelo genera trazas de razonamiento antes de la respuesta final, por lo que conviene reservar un presupuesto de tokens de salida suficiente.

La relevancia de esta ficha es doble: por un lado documenta una de las primeras conversiones MLX del modelo LFM2.5-24B-A2B, y por otro advierte de que se trata de un artefacto "Preview" con cero descargas y cero valoraciones en el momento de la consulta, sin benchmarks publicados y validado unicamente con pruebas de humo (smoke tests). No es, por tanto, un artefacto con validacion comunitaria ni con evaluacion de calidad extensiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE), segun la etiqueta `lfm2_moe`; el detalle interno (numero de expertos, tipo de atencion) no esta disponible en la informacion proporcionada |
| Parametros totales | 23.971.587.712 (23,97 mil millones) |
| Parametros activos | Aproximadamente 2 mil millones, segun la nomenclatura "A2B" del nombre; la model card no confirma la cifra exacta |
| Longitud de contexto | 131.072 tokens (segun la configuracion de origen) |
| Tipos de cuantizacion | bf16 (pesos) con sesgos de enrutamiento de expertos en FP32; no se documentan otras cuantizaciones (int4, int8, etc.) en la informacion disponible |
| Idiomas soportados | Ingles, arabe, chino, frances, aleman, japones, coreano, espanol, portugues, italiano (10 idiomas) |
| Licencia | LFM Open License v1.0 (`lfm1.0`, `license: other`); se incluye el archivo LICENSE original |
| Formato de pesos | safetensors en formato MLX (bfloat16) |
| Tamano del repositorio | 48,0 GB (47,94 GB de archivos de pesos en notacion decimal) |
| Libreria / runtime | MLX, MLX-VLM |
| Modelo base | lq-preview/LFM2.5-24B-A2B-Preview (revision `f772950ce6f17d35af5469d00334b61a9c2fc034`) |
| Pipeline | text-generation |
| Fecha de publicacion | 13 de octubre de 2026 |

## Arquitectura y entrenamiento

La informacion disponible identifica el modelo como una arquitectura de mezcla de expertos (MoE) bajo la etiqueta `lfm2_moe`, con enrutamiento por expertos que incorpora sesgos conservados en FP32 durante la conversion. No se detallan en la model card el numero de expertos, el numero de expertos activos por token, el tipo de capas de atencion (completa, lineal o hibrida), el esquema de normalizacion ni la composicion del dataset de entrenamiento. El modelo original es obra de Liquid AI, Inc.; esta publicacion es unicamente una conversion de formato realizada por terceros.

Respecto al proceso de entrenamiento, no hay informacion sobre el numero de tokens, la mezcla de datos, ni si se aplicaron tecnicas de alineacion como RLHF, DPO o similares. Lo unico documentado es el comportamiento observado: el modelo produce razonamiento explicito antes de la respuesta final ("The model generates reasoning before its final answer"), lo que sugiere un modo de pensamiento con trazas intermedias. La conversion se realizo con la CLI de MLX-VLM sobre un Apple M3 Ultra, con correspondencia estricta de pesos (`strict weight matching`) y verificacion de que el prefill y la decodificacion con cache producen logits finitos.

## Capacidades

- Generacion de texto conversacional (`pipeline_tag: text-generation`, etiqueta `conversational`), con plantilla de chat incluida en el repositorio.
- Razonamiento explicito: el modelo emite una traza de razonamiento antes de la respuesta final. Es necesario ampliar `--max-tokens` para no truncar esa traza.
- Multilingue en 10 idiomas: ingles, arabe, chino, frances, aleman, japones, coreano, espanol, portugues e italiano.
- Contexto largo: hasta 131.072 tokens, adecuado para documentos extensos, aunque no se han publicado pruebas especificas de rendimiento en contextos largos.
- Ejecucion local en Apple Silicon: integracion con MLX y MLX-VLM (PR #2505), sin necesidad de GPU dedicada.
- Capacidad de vision: el tag `mlx-vlm` aparece en el repositorio, pero la model card afirma explicitamente que se trata de un modelo de generacion de texto y no documenta entradas de imagen. La capacidad multimodal no esta confirmada.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la informacion proporcionada; el razonamiento previo a la respuesta es el unico indicio documentado.
- Modo thinking: si, por el comportamiento de razonamiento previo descrito en la model card.

## Casos de uso

- Asistente de razonamiento totalmente local en Mac: el modelo se ejecuta con MLX sobre Apple Silicon (probado en M3 Ultra) y genera cadenas de razonamiento antes de responder. Es adecuado para equipos que necesitan un LLM de gran tamano sin enviar datos a servicios externos.
- Analisis de documentos largos: con 131.072 tokens de contexto se pueden procesar informes anuales, expedientes o bases de codigo extensas en una sola pasada, evitando estrategias de troceado y recuperacion que fragmentan la coherencia.
- Traduccion y localizacion multilingue: cubre 10 idiomas (incluido el espanol) y permite flujos de traduccion bidireccional o de adaptacion de contenido sin depender de APIs de terceros.
- Atencion al cliente multilingue: la etiqueta `conversational` y la ventana de contexto larga permiten mantener historiales de conversacion extensos con clientes en distintos idiomas, siempre que se valide previamente la calidad mediante evaluacion propia.
- Asistencia a la investigacion y prototipado con datos sensibles: al ejecutarse en local, sirve para experimentar con corpus confidenciales (sanitarios, legales, financieros) sin exponerlos a un proveedor externo.
- Generacion de resumenes y extraccion de informacion en corpus tecnicos: se puede alimentar con documentacion extensa y solicitar resumenes estructurados o extraccion de entidades, aprovechando el contexto largo y el razonamiento previo.
- Experimentacion y evaluacion de modelos MoE en el ecosistema Apple: util para investigadores que quieran comparar arquitecturas MoE sobre MLX o validar pipelines de inferencia con decodificacion en cache.
- Tutoria y explicaciones paso a paso: la emision de razonamiento intermedio encaja en escenarios educativos donde interesa mostrar el procedimiento, no solo el resultado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente describe pruebas de humo: recarga con correspondencia estricta de pesos, verificacion de logits finitos en prefill y decodificacion con cache, y dos comprobaciones de generacion greedy corta que devolvieron "Paris" y "391" correctamente y alcanzaron el token EOS. Los propios autores de la conversion advierten que estas pruebas "no son una evaluacion de calidad exhaustiva ni un benchmark de contexto largo".

| Benchmark | Resultado |
|---|---|
| MMLU | no disponible |
| HumanEval | no disponible |
| GSM8K | no disponible |
| Prueba de humo (capital de Francia) | "Paris" (generacion greedy corta) |
| Prueba de humo (aritmetica) | "391" (generacion greedy corta) |

## Requisitos de hardware

- Peso de los archivos en bf16: 47,94 GB en notacion decimal (48,0 GB de repositorio). El consumo en tiempo de ejecucion es superior, ya que incluye cache y asignaciones temporales.
- Memoria unificada recomendada en Apple Silicon: por encima de 48 GB solo para los pesos; se requiere margen adicional para la cache KV y las asignaciones temporales. Un equipo de 64 GB o mas es un punto de partida razonable, y 128 GB o mas ofrece holgura para contextos largos.
- Hardware de referencia declarado: Apple M3 Ultra, usado para la conversion.
- GPU NVIDIA (A100, H100, RTX 4090): no disponible. El artefacto esta en formato MLX y la model card no documenta ejecucion en CUDA.
- GPU de consumo: no aplicable a este artefacto concreto, que esta orientado a memoria unificada de Apple Silicon. No se documenta una variante GGUF ni cuantizaciones de menor precision para GPUs de consumo.
- Opciones de despliegue: MLX-VLM (probado con el commit `a6c7313bc053e5887616fa850808d21576eddf98`, MLX 0.32.3 y Transformers 5.17.0). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI con este formato de pesos.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de modelos alternativos en la informacion proporcionada, por lo que no es posible una comparativa cuantitativa. La unica comparacion documentable es entre artefactos del mismo modelo:

| Artefacto | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nativ-community/LFM2.5-24B-A2B-Preview-bf16 | 23,97 mil millones | 131.072 tokens | safetensors MLX bf16 | LFM Open License v1.0 | Publicado, 0 descargas, 0 likes |
| mlx-community/LFM2.5-24B-A2B-Preview-bf16 | 23,97 mil millones | 131.072 tokens | safetensors MLX bf16 | LFM Open License v1.0 | Archivos identicos segun la model card |
| lq-preview/LFM2.5-24B-A2B-Preview (origen) | 23,97 mil millones | 131.072 tokens | no disponible | LFM Open License v1.0 | Modelo base de la conversion |

Comparacion con otras familias de modelos MoE de tamano similar: no disponible.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: solo existen pruebas de humo descritas en la model card (dos generaciones greedy cortas). No hay evaluaciones de MMLU, HumanEval, GSM8K ni de contexto largo.
- Artefacto "Preview": el propio nombre del modelo base incluye la etiqueta Preview, lo que indica que puede tratarse de una version no final.
- Cero adopcion verificable: 0 descargas y 0 likes en el momento de la consulta. No hay validacion de la comunidad ni informes de terceros sobre su comportamiento real.
- Conversion de terceros: la publica nativ-community, no Liquid AI. Aunque se declara correspondencia estricta de pesos, los posibles errores de conversion no estan cubiertos por el autor original.
- Formato exclusivo MLX: los pesos no son directamente utilizables en el ecosistema CUDA (vLLM, TGI) ni en llama.cpp/Ollama segun la informacion disponible. Migrar a otro runtime requeriria una conversion adicional.
- Riesgo de alucinacion: no se documenta ningun mecanismo especifico de mitigacion ni tasas de error. Como en cualquier LLM generativo, debe asumirse riesgo de fabricacion de datos, especialmente en dominios especializados.
- Sesgos: no hay informacion publicada sobre sesgos demograficos, culturales o linguisticos. La cobertura de 10 idiomas no implica calidad homogenea entre ellos; no se aportan metricas por idioma.
- Limitaciones de idioma: el catalan, el gallego, el euskera y otras lenguas del Estado no figuran entre los idiomas soportados.
- Presupuesto de tokens: el modelo genera razonamiento antes de la respuesta final. Si se limita demasiado `max_tokens`, la respuesta final puede quedar truncada.
- Restricciones de licencia: se aplica la LFM Open License v1.0 (`license: other`). No se detallan en la informacion proporcionada los terminos exactos ni los umbrales de uso comercial; es imprescindible revisar el archivo LICENSE antes de cualquier despliegue en produccion.
- Contexto largo no verificado: aunque la configuracion declara 131.072 tokens, no se ha publicado ningun benchmark que confirme la calidad de recuperacion de informacion a esa distancia.
- Requisitos de memoria elevados: casi 48 GB solo en pesos bf16 limita el despliegue a equipos con memoria unificada amplia.

## Enlaces

- Modelo en HuggingFace (nativ-community): https://huggingface.co/nativ-community/LFM2.5-24B-A2B-Preview-bf16
- Modelo en HuggingFace (mlx-community, archivos identicos): https://huggingface.co/mlx-community/LFM2.5-24B-A2B-Preview-bf16
- Modelo base original: https://huggingface.co/lq-preview/LFM2.5-24B-A2B-Preview
- Licencia LFM Open License v1.0 (archivo LICENSE del repositorio): https://huggingface.co/nativ-community/LFM2.5-24B-A2B-Preview-bf16/blob/main/LICENSE
- Aviso de modificaciones de conversion y cuantizacion (NOTICE): https://huggingface.co/nativ-community/LFM2.5-24B-A2B-Preview-bf16/blob/main/NOTICE
- Detalles de conversion (conversion_info.json): https://huggingface.co/nativ-community/LFM2.5-24B-A2B-Preview-bf16/blob/main/conversion_info.json
- Soporte de LFM2.5 en MLX-VLM, PR #2505: https://github.com/Blaizzy/mlx-vlm/pull/2505
- Repositorio MLX-VLM: https://github.com/Blaizzy/mlx-vlm
- Liquid AI (autor original del modelo): no disponible en la informacion proporcionada
- Paper tecnico de LFM2.5: no disponible en la informacion proporcionada
