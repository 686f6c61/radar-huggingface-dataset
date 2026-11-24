# huggingface12341/zsm-h27

## Resumen

zsm-h27 es un modelo publicado en Hugging Face por el usuario huggingface12341 bajo licencia Apache 2.0 y acceso restringido (gated). Se trata de un merge de dos modelos base: vllm-sr/d3-mini y chinhnc/Quyet-1.0-Medium, según los metadatos de la model card. El pipeline declarado es `feature-extraction`, si bien los tags incluyen `decision-model` y `qwen3_5`, lo que sugiere que el modelo deriva de la familia Qwen 3.5 y está orientado a la extracción de representaciones y a la toma de decisiones más que a la generación de texto libre.

El modelo cuenta con 4.539.265.536 parámetros (aproximadamente 4,54 mil millones) verificados en los pesos safetensors, y el repositorio ocupa 9,1 GB. Requiere `transformers` y contiene código personalizado (`custom_code`), lo que implica que no se puede cargar con una instalación estándar de la librería sin confiar en el código remoto del repositorio.

La relevancia de esta ficha es limitada: el modelo tiene cero descargas y cero likes en el momento de la consulta, no declara idiomas soportados, no publica benchmarks y su acceso está restringido. Se documenta aquí con rigor para que desarrolladores e investigadores puedan evaluar rápidamente si merece la pena solicitar acceso, dejando explícitos los vacíos de información.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (tags indican `qwen3_5`; pipeline `feature-extraction`) |
| Parametros totales | 4.539.265.536 (4,54 B) |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Acceso | restringido (gated), requiere aceptar condiciones |
| Tamano del repositorio | 9,1 GB |
| Libreria | transformers (requiere `custom_code`) |
| Modelos base | vllm-sr/d3-mini, chinhnc/Quyet-1.0-Medium |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna mas alla de los tags del repositorio. El tag `qwen3_5` apunta a que el modelo deriva de la familia Qwen 3.5, y el pipeline `feature-extraction` indica que su uso previsto es la produccion de embeddings o representaciones ocultas. Los tags `merge` y `base_model:merge` confirman que se trata de una fusion de pesos de dos modelos (vllm-sr/d3-mini y chinhnc/Quyet-1.0-Medium), una tecnica habitual para combinar capacidades sin reentrenamiento completo.

No hay informacion publica sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de RLHF, DPO o ajuste supervisado. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa o atencion lineal. El repositorio incluye `custom_code`, lo que significa que la implementacion del modelo depende de codigo propio del autor y no de una arquitectura estandar de `transformers`.

## Capacidades

- Extraccion de caracteristicas (feature extraction): uso principal declarado en el pipeline del repositorio.
- Modelo de decision (`decision-model`): tag que sugiere aplicaciones de clasificacion o seleccion entre opciones.
- Generacion de texto: no confirmada; el pipeline declarado no es `text-generation`.
- Razonamiento y matematicas: no disponible.
- Codigo: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Extraccion de embeddings para busqueda semantica: dado el pipeline `feature-extraction`, el modelo puede generar representaciones vectoriales de documentos o consultas para indexacion y recuperacion, siempre que se valide la dimensionalidad y la calidad de los embeddings en el dominio objetivo.
- Clasificacion y enrutamiento de decisiones: el tag `decision-model` sugiere su uso como clasificador o selector en pipelines de decision, por ejemplo para enrutar peticiones o puntuar alternativas.
- Experimentacion con tecnicas de model merging: al ser un merge documentado de dos modelos base, sirve como caso de estudio para investigadores que analicen el efecto de la fusion de pesos en tareas de representacion.
- Base para fine-tuning ligero: con 4,54 B de parametros y licencia Apache 2.0, puede servir de punto de partida para ajuste supervisado en tareas especificas, sujeto a la aprobacion del acceso gated.
- Prototipado en entornos con recursos moderados: el tamano permite desplegarlo en una sola GPU de gama alta o en configuraciones cuantizadas, aunque no se publican variantes cuantizadas oficiales.
- Evaluacion comparativa de modelos derivados de Qwen 3.5: util para benchmarks internos de representaciones frente a otros modelos de la misma familia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4,54 B de parametros, los pesos en fp16 ocupan aproximadamente 9,1 GB (coincide con el tamano del repo); en fp32 serian unos 18,2 GB; en int8 unos 4,5 GB y en int4 unos 2,3 GB (estimaciones teoricas, no hay variantes cuantizadas publicadas).
- GPU recomendadas: para fp16, una GPU con 16 GB o mas (RTX 4090, A100 40 GB, H100); para cuantizacion int8 o int4, GPUs consumer de 8-12 GB podrian ser suficientes.
- Cabe en GPU consumer: si, previsiblemente en RTX 4090 (24 GB) en fp16 y en GPUs de 8-12 GB con cuantizacion, aunque no se confirma compatibilidad con llama.cpp u Ollama.
- Opciones de despliegue: al requerir `custom_code` y no publicarse pesos GGUF, el despliegue con vLLM, llama.cpp, Ollama o TGI no esta confirmado; la via documentada es `transformers`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| zsm-h27 | 4,54 B | no disponible | Apache 2.0 | gated | Merge de d3-mini y Quyet-1.0-Medium; feature-extraction |
| Qwen 3.5 (familia base) | no disponible | no disponible | no disponible | no disponible | Familia de origen segun tag `qwen3_5` |
| chinhnc/Quyet-1.0-Medium | no disponible | no disponible | no disponible | no disponible | Modelo base del merge |
| vllm-sr/d3-mini | no disponible | no disponible | no disponible | no disponible | Modelo base del merge |

No se dispone de datos suficientes para una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Acceso restringido: el modelo es gated y requiere aceptar condiciones en Hugging Face antes de descargarlo.
- Ausencia total de documentacion: no se publican idiomas, contexto, datos de entrenamiento ni benchmarks, lo que impide evaluar su calidad antes de usarlo.
- Requiere `custom_code`: cargar el modelo implica ejecutar codigo del autor (`trust_remote_code=True`), con el riesgo de seguridad asociado.
- Pipeline no generativo: el pipeline declarado es `feature-extraction`, por lo que no debe asumirse que genere texto de forma fiable.
- Riesgo de alucinacion y sesgos: no evaluables por falta de informacion; deben medirse empiricamente antes de cualquier uso en produccion.
- Licencia Apache 2.0: permite uso comercial, pero al ser un merge de modelos base cuyas licencias no se detallan, conviene verificar la compatibilidad de las licencias de origen.
- Madurez: cero descargas y cero likes en el momento de la consulta; no hay evidencia de uso en produccion ni de mantenimiento.
- Sin variantes cuantizadas oficiales: el despliegue eficiente en hardware limitado requerira cuantizacion propia.

## Enlaces

- Hugging Face: https://huggingface.co/huggingface12341/zsm-h27
- Modelo base: https://huggingface.co/chinhnc/Quyet-1.0-Medium
- Modelo base: https://huggingface.co/vllm-sr/d3-mini
