# mradermacher/esa-sceva-satcom-70B_bf16-GGUF

## Resumen

El modelo `esa-sceva-satcom-70B_bf16-GGUF` es una cuantización estática en formato GGUF del modelo base `Jolly-Q/esa-sceva-satcom-70B_bf16`, publicada por el usuario mradermacher, conocido en el ecosistema por producir versiones GGUF de modelos abiertos para su uso con llama.cpp y herramientas derivadas. No se trata de un modelo original, sino de una conversión de pesos orientada a inferencia local y despliegue ligero.

El modelo base, según los metadatos disponibles, es el resultado de una fusión (merge) de modelos, generada con la herramienta mergekit, y está etiquetado como conversacional y orientado al idioma inglés. El nombre sugiere una especialización en comunicaciones por satélite (satcom) y posiblemente en el dominio espacial (ESA), aunque la model card no aporta detalles sobre el dataset de entrenamiento ni sobre la procedencia exacta de los modelos fusionados.

Con 70.553.706.560 parámetros totales (aproximadamente 70,5 mil millones), se sitúa en la categoría de modelos densos de gran tamano. La relevancia de esta publicación radica en que permite ejecutar un modelo de 70B en hardware de consumo mediante cuantizaciones que van desde Q2_K (26,5 GB) hasta Q8_0 (75,1 GB), algo imposible con los pesos en bf16 originales. La información pública es muy limitada: no hay benchmarks, no se especifica la licencia y no se detalla la longitud de contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base fusionado con mergekit; presumiblemente transformer denso, sin confirmar) |
| Parametros totales | 70.553.706.560 (~70,5B) |
| Parametros activos | no aplica (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | GGUF (repo de 481,3 GB con múltiples cuantizaciones); el modelo base en safetensors/bf16 |
| Libreria | transformers (metadato del repo); uso real con llama.cpp y compatibles |
| Modelo base | Jolly-Q/esa-sceva-satcom-70B_bf16 |
| Herramienta de creacion | mergekit (modelo base); cuantizacion por mradermacher |
| Descargas | 66 |
| Fecha de creacion | 2026-02-14 |
| Ultima actualizacion | 2026-11-05 |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base. Los metadatos indican que `Jolly-Q/esa-sceva-satcom-70B_bf16` fue creado mediante mergekit, una herramienta de fusión de modelos que combina los pesos de dos o más modelos preentrenados (por ejemplo, mediante SLERP, TIES o DARE). Esto implica que el modelo hereda la arquitectura de sus componentes originales, pero la model card no especifica cuáles son ni qué método de fusión se empleó.

Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO o ajuste fino supervisado. El etiquetado `conversational` y el nombre `esa-sceva-satcom` sugieren un enfoque hacia diálogo técnico en el dominio de satélites y comunicaciones espaciales, pero no hay evidencia publicada que lo confirme. La cuantización realizada por mradermacher es de tipo estático (no imatrix), según se indica en la propia model card, y se ofrecen once variantes de cuantización.

## Capacidades

- Generación de texto conversacional en inglés, según el etiquetado del repositorio.
- Razonamiento y respuesta a instrucciones propias de un modelo denso de ~70B, aunque sin benchmarks que lo verifiquen.
- Posible especialización en dominio aeroespacial y de comunicaciones por satélite, inferida únicamente del nombre del modelo; no confirmada.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multimodales (visión, audio): no disponible.
- Modo thinking explícito: no disponible.
- Capacidades multilingües: limitadas al inglés según los metadatos.

## Casos de uso

- **Prototipado de asistentes técnicos en dominio satcom**: el modelo puede emplearse para generar respuestas conversacionales sobre comunicaciones por satélite en entornos de laboratorio, siempre que se valide su calidad con evaluaciones propias, dado que no hay benchmarks publicados.
- **Inferencia local en estaciones de trabajo con GPU de consumo**: gracias a las cuantizaciones Q4_K_M (42,6 GB) y Q3_K_M (34,4 GB), es posible ejecutarlo en configuraciones multi-GPU de gama alta o en equipos con 48 GB de VRAM, algo inviable con los pesos bf16.
- **Despliegue en entornos air-gapped**: al distribuirse como GGUF, puede ejecutarse con llama.cpp sin conexión a internet, lo que resulta útil en entornos de investigación con requisitos de confidencialidad.
- **Generación de documentación técnica en inglés**: el modelo puede redactar borradores de documentación, guías o notas técnicas en inglés, con revisión humana obligatoria por el riesgo de alucinación.
- **Base para fine-tuning posterior**: las cuantizaciones Q8_0 y Q6_K permiten experimentar con adaptadores o ajustes ligeros en hardware limitado antes de escalar a los pesos completos.
- **Evaluación comparativa de merges**: útil para investigadores que quieran analizar el comportamiento de un merge de 70B frente a sus componentes originales, midiendo degradación por cuantización entre Q2_K y Q8_0.
- **Chatbot interno de consulta**: para equipos que necesiten un asistente conversacional en inglés sobre temática aeroespacial, con la advertencia de que la licencia no está clara y debe verificarse antes de cualquier uso corporativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio GGUF no incluye métricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación, y tampoco se referencian resultados del modelo base.

## Requisitos de hardware

- **VRAM estimada para inferencia** (según tamano del archivo GGUF):
  - Q2_K: ~26,5 GB
  - Q3_K_S: ~31,0 GB
  - Q3_K_M: ~34,4 GB
  - Q3_K_L: ~37,2 GB
  - IQ4_XS: ~38,4 GB
  - Q4_K_S: ~40,4 GB
  - Q4_K_M: ~42,6 GB
  - Q5_K_S: ~48,8 GB
  - Q5_K_M: ~50,0 GB
  - Q6_K: ~58,0 GB
  - Q8_0: ~75,1 GB
- **GPU recomendadas**: para Q4_K_M se recomienda una o dos GPU con al menos 48 GB combinados (por ejemplo, 2x RTX 4090 de 24 GB, o una A6000 de 48 GB). Para Q8_0 se necesitan al menos 80 GB, lo que encaja con una A100 80GB o H100.
- **¿Cabe en GPU de consumo?**: parcialmente. Las cuantizaciones Q2_K y Q3_K_S pueden caber en una RTX 4090 (24 GB) solo con offloading parcial a CPU/RAM; Q4_K_M requiere dos RTX 4090 o una RTX 6000 Ada. No cabe en una única GPU de consumo de 24 GB sin offload.
- **Opciones de despliegue**: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. vLLM y TGI no soportan GGUF de forma nativa para este formato, por lo que no son opciones directas.
- **Latencia y throughput**: no disponibles. Dependerán del hardware, del grado de offloading y del backend; como referencia cualitativa, un 70B en Q4_K_M con offloading parcial suele situarse en el rango de pocos tokens por segundo.

## Comparativa con modelos similares

No se dispone de información suficiente sobre el modelo base ni sobre sus componentes de merge para establecer una comparativa rigurosa con alternativas concretas. Se indica "no disponible" en lugar de especular con modelos de tamano similar cuya comparación no esté respaldada por datos.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| esa-sceva-satcom-70B_bf16-GGUF | ~70,5B | no disponible | no disponible | GGUF | Merge cuantizado por mradermacher |
| Alternativas de ~70B | no disponible | no disponible | no disponible | no disponible | Sin datos para comparar |

## Limitaciones y advertencias

- **Licencia no especificada**: no se indica la licencia del modelo base ni de la cuantización, lo que impide determinar si el uso comercial está permitido. Debe consultarse con el autor antes de cualquier despliegue en producción.
- **Ausencia total de benchmarks**: no hay evidencia publicada sobre calidad, razonamiento, código o matemáticas; cualquier evaluación debe realizarse de forma independiente.
- **Riesgo de alucinación**: como todo modelo generativo de gran tamano, puede producir información falsa con apariencia plausible, especialmente en dominios técnicos especializados como satcom.
- **Idioma limitado al inglés**: no se declara soporte de castellano ni de otros idiomas; el rendimiento fuera del inglés es incierto.
- **Contexto desconocido**: se desconoce la longitud de contexto soportada, lo que limita el diseño de aplicaciones que dependan de ventanas largas.
- **Naturaleza de merge**: al ser una fusión de modelos, puede heredar sesgos y comportamientos inconsistentes de sus componentes; la calidad puede degradarse en tareas específicas.
- **Cuantizaciones estáticas**: no se ofrecen versiones imatrix, que suelen preservar mejor la calidad en cuantizaciones bajas (Q2_K, Q3_K_S); las variantes de menor tamano pueden degradar notablemente el rendimiento.
- **Repo de gran tamano**: 481,3 GB en total; la descarga de cuantizaciones individuales requiere planificación de almacenamiento.
- **Fecha de creación futura**: el repositorio figura creado en 2026-02-14, lo que puede indicar un error en los metadatos o una fecha de publicación planificada; conviene verificarlo.

## Enlaces

- Repositorio Hugging Face del GGUF: https://huggingface.co/mradermacher/esa-sceva-satcom-70B_bf16-GGUF
- Modelo base: https://huggingface.co/Jolly-Q/esa-sceva-satcom-70B_bf16
- Página de descargas del autor: https://hf.tst.eu/model#esa-sceva-satcom-70B_bf16-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Gráfico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del autor: https://www.nethype.de/
