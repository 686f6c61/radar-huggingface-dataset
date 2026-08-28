# lvkaokao/Qwen3.8-Flash-Next-MXFP4-Mixed-CT-AutoRound

## Resumen

Qwen3.8-Flash-Next es un modelo de lenguaje multimodal experimental desarrollado por el equipo de Qwen (Alibaba), concebido como avance de la arquitectura que dará lugar a Qwen4. Se trata de un modelo de mezcla de expertos ultra-dispersa con 125.000 millones de parámetros principales, más 51.000 millones de parámetros de embeddings por n-gramas y 4.000 millones de parámetros para la predicción multi-token (MTP), lo que suma aproximadamente 180.000 millones de parámetros totales, aunque solo activa 6.000 millones por token. La arquitectura combina Gated DeltaNet (GDN) con Qwen Sparse Attention (QSA), una atención dispersa a nivel de micro-bloques, junto con un mecanismo de residual con puertas (Gated Residual) y embeddings por n-gramas. Esta combinación reduce drásticamente el coste de entrenamiento (aproximadamente un noveno del de Qwen3.7-Plus) y mejora la eficiencia en contextos largos, con una ventana nativa de 262.144 tokens ampliable hasta un millón.

El repositorio analizado es una versión cuantizada del modelo original, preparada por el usuario lvkaokao, que aplica cuantización mixta MXFP4 con AutoRound y compresión de tensores. Esta versión reduce el tamaño del modelo a 179,8 GB, manteniendo la compatibilidad con Transformers, vLLM, SGLang y TokenSpeed. El modelo es multimodal (imagen-texto a texto) y está pensado para tareas de razonamiento, generación de código, ofimática y procesamiento de documentos largos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE ultra-dispersa híbrida: Gated DeltaNet + Qwen Sparse Attention (QSA) + N-gram Embedding + Gated Residual |
| Parametros totales | 179.999.981.459 (125B LM + 51B n-gram embedding + 4B MTP) |
| Parametros activos | 6.000 millones (más 1 experto compartido) |
| Longitud de contexto | 262.144 tokens nativo, extensible hasta 1.000.000 |
| Tipos de cuantizacion | MXFP4 mixto con AutoRound (version del repo), 8-bit (segun tags) |
| Idiomas soportados | No disponible |
| Licencia | qwen-community-1.0 (licencia comunitaria de Qwen) |
| Formato de pesos | safetensors, compatible con Transformers, vLLM, SGLang, TokenSpeed |

Nota: los parametros totales incluyen los 51B de n-gram embedding y 4B de MTP, que son tablas de busqueda y capas adicionales, no parametros del transformer principal.

## Arquitectura y entrenamiento

Qwen3.8-Flash-Next presenta una arquitectura hibrida que combina varias innovaciones. El bloque principal esta formado por 48 capas organizadas en un patron de 12 grupos, donde cada grupo contiene 3 sub-bloques de Gated DeltaNet seguidos de una capa MoE, y un cuarto sub-bloque de Qwen Sparse Attention (QSA) seguido de otra capa MoE. Gated DeltaNet es un mecanismo de atencion lineal con compuertas que comprime el historial de forma eficiente, mientras que QSA opera a nivel de micro-bloques (512 bloques o 2048 tokens) para recuperacion precisa de informacion a larga distancia. La capa MoE cuenta con 512 expertos, de los cuales se activan 10 mas un experto compartido, con una dimension intermedia de 640. El modelo incorpora ademas embeddings por n-gramas (bigramas y trigramas en la capa 2) con una tabla de 20 millones de entradas, lo que permite escalar parametros sin aumentar el coste computacional. El mecanismo Gated Residual modula el flujo de informacion mediante compuertas de lectura y escritura dependientes de los datos. El entrenamiento utiliza los optimizadores Muon y AdamW segun la categoria de pesos, con leyes de escalado ajustadas y sin calentamiento de tamano de lote, comenzando directamente con el tamano objetivo. El modelo tambien incluye una capa de prediccion multi-token (MTP) entrenada con multiples pasos.

No se dispone de informacion detallada sobre el dataset de entrenamiento ni sobre el uso de RLHF o DPO en la informacion proporcionada.

## Capacidades

- Generacion de texto y razonamiento complejo con 6B parametros activos, lo que permite alta eficiencia en inferencia.
- Multimodal: procesa imagenes y texto, con encoder de vision integrado (pipeline image-text-to-text).
- Soporte de contexto largo: 262.144 tokens nativos, extensible a 1M, adecuado para documentos extensos y conversaciones largas.
- Generacion de codigo y tareas de ofimatica, con rendimiento superior a Qwen3.7-Plus segun el blog oficial.
- Capacidad de atencion dispersa para recuperacion precisa en largas distancias.
- Compatible con tool calling y frameworks de agentes (vLLM, SGLang, TokenSpeed).
- Prediccion multi-token (MTP) que acelera la decodificacion.

## Casos de uso

- Procesamiento de documentos extensos: el modelo puede analizar informes, contratos o libros completos de mas de 200.000 tokens en una sola pasada, gracias a su ventana de contexto nativa de 262.144 tokens.
- Generacion de codigo en produccion: con 6B parametros activos y soporte para tool calling, puede integrarse en pipelines de CI/CD para revision de codigo, generacion de tests o autocompletado en entornos con restricciones de latencia.
- Asistentes de ofimatica: el modelo destaca en tareas de oficina como resumen de correos, generacion de presentaciones o analisis de hojas de calculo, superando a Qwen3.7-Plus en estas areas.
- Analisis de imagenes y documentos escaneados: al ser multimodal, puede extraer informacion de imagenes, diagramas o capturas de pantalla combinadas con texto.
- Agentes autonomos: su arquitectura con atencion dispersa y bajo coste de activacion permite ejecutar multiples pasos de razonamiento en tareas de planificacion y uso de herramientas.
- Despliegue en entornos con memoria limitada: la version cuantizada MXFP4 reduce el tamano a 179,8 GB, permitiendo su ejecucion en nodos con varias GPUs de alta gama sin necesidad de infraestructura masiva.

## Benchmarks y rendimiento

La model card incluye una tabla de benchmarks para lenguaje, pero la informacion proporcionada esta incompleta (la tabla se corta). No se han podido extraer los valores concretos de MMLU, HumanEval, GSM8K u otros. Segun el blog oficial y el repositorio de GitHub, el modelo supera a Qwen3.7-Plus en tareas de codigo y ofimatica, con un coste de entrenamiento aproximadamente nueve veces menor. No se dispone de cifras numericas verificables en la informacion disponible.

## Requisitos de hardware

- El modelo completo en precision original ocuparia aproximadamente 360 GB en FP16, pero la version cuantizada MXFP4 del repositorio ocupa 179,8 GB, lo que requiere al menos 180 GB de VRAM para cargar los pesos.
- Para inferencia con 6B parametros activos, la memoria necesaria se reduce significativamente, pero el modelo completo debe residir en memoria. Se recomiendan GPUs con 80 GB de VRAM (como A100 o H100) en configuraciones multi-GPU.
- No es viable en GPUs de consumo (RTX 4090 con 24 GB) a menos que se utilice una cuantizacion mas agresiva o se descarguen los embeddings n-grama a CPU.
- Opciones de despliegue: vLLM, SGLang, TokenSpeed, Hugging Face Transformers. El formato safetensors es compatible con estos frameworks.
- La latencia y el throughput no se han publicado en la informacion disponible, pero la activacion dispersa de 6B parametros sugiere una inferencia mas rapida que modelos densos de tamano similar.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next | 180B (125B + 51B + 4B) | 6B | 262K (1M ext.) | qwen-community-1.0 | Arquitectura hibrida GDN+QSA |
| Qwen3.7-Plus | No disponible | No disponible | No disponible | No disponible | Modelo anterior, coste de entrenamiento 9 veces mayor |
| DeepSeek-V3 | 671B | 37B | 128K | MIT | MoE densa, sin atencion lineal |
| Llama 3.1 405B | 405B | 405B | 128K | Llama 3.1 | Modelo denso, mucho mayor coste de inferencia |

La comparativa con Qwen3.7-Plus se basa en datos del blog oficial, que indica que Qwen3.8-Flash-Next reduce el coste de entrenamiento a 1/9 y supera en codigo y ofimatica. No se dispone de mas detalles.

## Limitaciones y advertencias

- Modelo experimental: es una vista previa de la arquitectura de Qwen4, por lo que puede presentar comportamientos inesperados o cambios en versiones futuras.
- Sesgos y alucinaciones: no se han publicado evaluaciones de sesgo o seguridad para esta version. Como todo LLM, puede generar contenido falso o sesgado.
- Limitaciones de idioma: no se ha especificado la lista de idiomas soportados, aunque se espera que cubra los principales idiomas, especialmente chino e ingles.
- Licencia qwen-community-1.0: es una licencia comunitaria que puede tener restricciones de uso comercial. Se recomienda revisar los terminos completos antes de desplegar en produccion.
- Requisitos de memoria: a pesar de la cuantizacion, el modelo requiere al menos 180 GB de VRAM, lo que limita su despliegue a infraestructuras con multiples GPUs de alta gama.
- La cuantizacion MXFP4 puede degradar ligeramente la calidad en comparacion con la version original en FP16. No se han publicado evaluaciones comparativas de la version cuantizada.

## Enlaces

- Repositorio cuantizado (autor lvkaokao): https://huggingface.co/lvkaokao/Qwen3.8-Flash-Next-MXFP4-Mixed-CT-AutoRound
- Modelo original en HuggingFace: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- GitHub oficial: https://github.com/QwenLM/Qwen3.8-Flash-Next
- Blog oficial: https://qwen.ai/blog?id=qwen3.8-flash-next
- Informe tecnico: https://github.com/QwenLM/Qwen3.8-Flash-Next/blob/main/tech_report.pdf
- Recetas vLLM: https://recipes.vllm.ai/Qwen/Qwen3.8-Flash-Next
- Servicio en la nube QwenCloud: https://www.qwencloud.com/models/qwen3.8-flash
