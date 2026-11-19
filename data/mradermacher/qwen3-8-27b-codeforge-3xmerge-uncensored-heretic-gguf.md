# mradermacher/Qwen3.8-27B-CodeForge-3xMerge-UNCENSORED-heretic-GGUF

## Resumen

Qwen3.8-27B-CodeForge-3xMerge-UNCENSORED-heretic es un modelo de lenguaje de 27.320.697.856 parámetros (aproximadamente 27,3 mil millones) resultante de la fusión de tres variantes del modelo Qwen3.8-27B-CodeForge, publicado originalmente por el usuario xtools-at y cuantizado a formato GGUF por mradermacher. El modelo se distribuye bajo licencia Apache 2.0 y está orientado a generación de código, razonamiento, uso de herramientas y flujos agénticos, con las etiquetas "heretic", "uncensored", "decensored" y "abliterated" que indican que se ha aplicado una técnica de eliminación de rechazos (abliteration) para reducir las negativas del modelo ante peticiones sensibles.

La relevancia de esta ficha radica en que se trata de un derivado cuantizado y "desbloqueado" de un modelo de código de tamaño medio, pensado para ejecución local en hardware de consumo y para escenarios donde el filtrado de seguridad del modelo base resulta un obstáculo. El repositorio incluye cuantizaciones estáticas desde Q2_K (11 GB) hasta Q8_0 (29,1 GB), además de suplementos multimodales mmproj, lo que sugiere capacidades de visión en el modelo base. El modelo soporta los idiomas inglés y chino.

La información disponible es limitada: la model card del repositorio cuantizado es fundamentalmente una guía de cuantizaciones y no documenta arquitectura detallada, datos de entrenamiento ni resultados de benchmarks. Los datos que se ofrecen a continuación reflejan exclusivamente lo que aparece en la información proporcionada, y se indica "no disponible" cuando no hay dato.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetas sugieren transformer con modo "efficient-thinking") |
| Parámetros totales | 27.320.697.856 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; suplementos mmproj Q8_0 y f16 |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones); safetensors en el modelo base |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna en la documentación proporcionada. Las etiquetas del repositorio indican "merge" (fusión de modelos), "distillation" (destilación), "efficient-thinking" y "reasoning", lo que sugiere que el modelo base combina técnicas de fusión de pesos y destilación para obtener un modelo de razonamiento y código más compacto. El nombre "3xMerge" apunta a una fusión de tres variantes, y "heretic"/"abliterated" indica la aplicación de técnicas de eliminación de direcciones de rechazo en el espacio de activaciones.

No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO. Tampoco se documentan innovaciones como decodificación especulativa o atención lineal. El repositorio cuantizado incluye suplementos multimodales (mmproj), lo que implica que el modelo base tiene capacidad de visión, aunque la model card no detalla el codificador visual.

## Capacidades

- Generación de código y completado en múltiples lenguajes de programación, según las etiquetas "coding" y "code-generation".
- Razonamiento y modo de pensamiento eficiente ("efficient-thinking", "reasoning").
- Uso de herramientas y function calling ("tool-use").
- Comportamiento agéntico y razonamiento multi-paso ("agentic").
- Seguimiento de instrucciones ("instruction-following").
- Capacidades multimodales (visión) inferidas por la presencia de ficheros mmproj en el repositorio.
- Conversación multi-turno ("conversational").
- Soporte de inglés y chino.
- Modelo "uncensored"/"abliterated": menor tendencia a rechazar peticiones que el modelo base.

## Casos de uso

- Generación de código en producción: el modelo puede integrarse en pipelines de CI/CD para autocompletar funciones, generar tests o sugerir parches, gracias a sus etiquetas de code-generation e instruction-following.
- Asistentes de programación locales: al distribuirse en GGUF desde 11 GB, puede ejecutarse en estaciones de trabajo con GPU de consumo para autocompletado y revisión de código sin enviar datos a la nube.
- Agentes autónomos de refactorización: el soporte de tool-use y comportamiento agéntico permite encadenar llamadas a herramientas (linters, compiladores, gestores de repositorios) en tareas multi-paso.
- Razonamiento asistido en investigación: el modo "efficient-thinking" y las capacidades de reasoning permiten usarlo para análisis de problemas técnicos y explicación de código complejo.
- Procesamiento de documentación técnica con imágenes: la presencia de mmproj permite extraer información de diagramas y capturas en flujos de documentación, aunque la model card no detalla la calidad de esta capacidad.
- Escenarios con requisitos de contenido sin filtrado: al ser un modelo abliterated, se usa en entornos donde el modelo base rechazaría peticiones legítimas (por ejemplo, análisis de seguridad ofensiva o literatura sensible), siempre bajo responsabilidad del operador.
- Despliegue en entornos con restricciones de privacidad: al ejecutarse localmente en formato GGUF, permite trabajar con código propietario sin exponerlo a APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización: Q2_K ~11 GB, Q3_K_S ~12,4 GB, Q3_K_M ~13,6 GB, Q3_K_L ~14,7 GB, IQ4_XS ~15,5 GB, Q4_K_S ~15,9 GB, Q4_K_M ~16,9 GB, Q5_K_S ~19,1 GB, Q5_K_M ~19,6 GB, Q6_K ~22,5 GB, Q8_0 ~29,1 GB (tamaños de fichero; la VRAM real requiere margen adicional para el contexto y el KV cache).
- GPU recomendadas: para Q4_K_M (~16,9 GB) se requiere una GPU con al menos 20-24 GB de VRAM, como RTX 3090, RTX 4090 o A10G; para Q8_0 (~29,1 GB) se necesita A100 40 GB, H100 o dos GPU de consumo.
- Cabe en GPU de consumo: sí, en cuantizaciones Q2_K a Q4_K_M en tarjetas de 16-24 GB (RTX 4080, RTX 4090, RTX 3090); las cuantizaciones Q6_K y Q8_0 requieren 24 GB o más.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; el modelo base en safetensors puede servirse con vLLM o TGI si se dispone de hardware suficiente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo ni de especificaciones detalladas (contexto, arquitectura) que permitan una comparación rigurosa. Se indica a continuación lo que sí es comparable a nivel de metadatos:

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-CodeForge-3xMerge-UNCENSORED-heretic (este) | 27,3 B | no disponible | Apache 2.0 | GGUF, safetensors | Fusion de 3 variantes, abliterated, vision via mmproj |
| Modelo base xtools-at/Qwen3.8-27B-CodeForge-3xMerge-UNCENSORED-heretic | 27,3 B | no disponible | Apache 2.0 | safetensors | Mismo modelo sin cuantizar |
| Alternativas de 27B con licencia abierta | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la informacion proporcionada |

## Limitaciones y advertencias

- El modelo es una fusión no oficial ("merge") de variantes, por lo que su comportamiento puede ser menos predecible que el de un modelo entrenado de forma monolítica.
- La abliteration ("heretic", "uncensored") elimina mecanismos de rechazo, lo que incrementa el riesgo de generar contenido dañino, sesgado o inexacto sin advertencia; no es apto para despliegues públicos sin moderación externa.
- Riesgo de alucinación inherente a los modelos de 27B, agravado por la falta de benchmarks publicados que permitan calibrar su fiabilidad.
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está documentado y probablemente sea inferior.
- Longitud de contexto no documentada; no se debe asumir una ventana grande sin verificación empírica.
- La licencia Apache 2.0 permite uso comercial, pero el operador asume la responsabilidad legal del contenido generado por un modelo sin filtrado.
- El repositorio cuantizado tiene un tamaño de 190,8 GB, lo que implica descargas largas; se recomienda elegir una única cuantización.
- Solo 1 like y 8.213 descargas en el momento de la consulta: comunidad pequeña, menor soporte y validación que modelos mainstream.
- No hay garantía de que las capacidades multimodales (mmproj) funcionen correctamente con todas las cuantizaciones; verificar antes de usar en producción.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/mradermacher/Qwen3.8-27B-CodeForge-3xMerge-UNCENSORED-heretic-GGUF
- Modelo base: https://huggingface.co/xtools-at/Qwen3.8-27B-CodeForge-3xMerge-UNCENSORED-heretic
- Cuantizaciones imatrix/weighted: https://huggingface.co/mradermacher/Qwen3.8-27B-CodeForge-3xMerge-UNCENSORED-heretic-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Qwen3.8-27B-CodeForge-3xMerge-UNCENSORED-heretic-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
