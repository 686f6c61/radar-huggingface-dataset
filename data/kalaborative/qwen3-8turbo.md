# Kalaborative/qwen3.8turbo

## Resumen

Kalaborative/qwen3.8turbo es un fine tune de la familia Qwen3.8 publicado por el usuario Kalaborative sobre el modelo DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU. Se distribuye con 26.895.998.464 parametros reales (unos 26,9 mil millones) en safetensors y con un amplio catalogo de cuantizaciones GGUF, tanto regulares como en variante MTP. El objetivo declarado por el autor es triple: reducir el numero de tokens de pensamiento entre la mitad y una decima parte, mejorar la calidad del bloque de razonamiento y mantener o elevar los benchmarks generales. Pese al nombre, no guarda relacion con el modelo de API Qwen-Turbo de Alibaba Cloud.

El modelo se presenta como un fine tune multi-etapa y multi-merge, entrenado con las tecnicas propietarias COLD FUSION (GAIN + Unsloth) y Fable Fusion 711, y con datasets estrictos del propio autor (Polar-STRICT y F451-STRICT). La model card enfatiza dos rasgos poco habituales: por un lado, la reduccion agresiva del "thinking block" para acelerar la generacion sin perder detalle; por otro, la condicion de modelo "abliterated"/"uncensored", es decir, con los mecanismos de rechazo atenuados. Los idiomas declarados son ingles y chino, y la licencia es Apache 2.0.

Su relevancia practica esta en el nicho de modelos de ~27B ejecutables en hardware de consumo mediante GGUF. El autor afirma que la version de 8 bits supera 730 puntos en ARC-C y que la de 4 bits alcanza 719, cifras que situarian al modelo en la "zona de inteligencia" de los modelos cerrados segun su propia comparativa. Estas cifras son autodeclaradas y no constan verificaciones independientes; el repositorio, ademas, acumula cero descargas y cero "likes" en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen3.8; la model card no especifica si es denso o MoE. Etiqueta de pipeline "image-text-to-text" (capacidad de vision no confirmada en la documentacion) |
| Parametros totales | 26.895.998.464 (aproximadamente 26,9 mil millones) |
| Parametros activos | No aplica (no se declara arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | bfloat16 (pesos originales), GGUF regulares y GGUF MTP, generados con imatrix dual (NEO-CODER MAX DI-MATRIX). Se mencionan explicitamente niveles de 4 y 8 bits y un cuant Q4_K_S sin imatrix |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bfloat16) y GGUF |
| Modelo base | DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU |
| Tamano del repositorio | 389,0 GB (incluye todos los cuants) |
| Datasets de entrenamiento declarados | DavidAU/Polar-STRICT-Datasets, DavidAU/F451-STRICT-Datasets |
| Fecha de publicacion | 2026-09-23 |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de su origen en la serie Qwen3.8 y de la etiqueta de pipeline "image-text-to-text", que sugiere soporte de entrada de imagen, aunque la model card no describe ningun entrenamiento multimodal ni temperaturas de vision. El recuento de parametros (26,9B) y la ausencia del sufijo "A<n>B" apuntan a un modelo denso, no a un MoE. La model card menciona tres "modos de operacion" de pensamiento que se conservan tras el fine tune, coherente con el esquema de modos thinking/no-thinking de la familia Qwen3.

El entrenamiento combina varias tecnicas propietarias del autor. COLD FUSION se describe como la union de un componente llamado GAIN con los entrenadores de Unsloth; GAIN modificaria dinamicamente el entrenamiento muestra a muestra en tiempo real segun como aprende el modelo. Fable Fusion 711 es el segundo metodo, aplicado en una fase posterior. El proceso global es un multi-stage fine tune con multi-stage merge (multi-fine tune mas multi-state merge), construido sobre datasets de tipo STRICT. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo RLHF, DPO u otra fase de alineacion; de hecho, la condicion de modelo abliterated implica la eliminacion o atenuacion de las capas de rechazo aprendidas en las fases de alineacion del modelo original. Tampoco se documentan innovaciones de decodificacion mas alla de los cuants MTP, que apuntan a decodificacion multi-token en runtimes compatibles.

## Capacidades

- Generacion de texto general con foco en alta densidad de detalle, segun la model card.
- Razonamiento explicito con bloque de pensamiento ("thinking"), con una reduccion declarada de entre 1/2 y 1/10 en el numero de tokens de razonamiento respecto al Qwen3.8 27B original.
- Tres modos de operacion de pensamiento conservados tras el fine tune (modos con y sin razonamiento).
- Generacion de codigo, reforzada por la nomenclatura NEO-CODER MAX de los cuants GGUF.
- Escritura creativa, ficcion, relato y roleplaying, con enfasis declarado en "todos los generos".
- Multilingue limitado a ingles y chino.
- Tool calling: la model card remite a la pestana de comunidad para resultados de terceros y afirma "el mejor rendimiento en tool calling registrado hasta la fecha", sin cifras propias en el README.
- Razonamiento multi-paso orientado a agentes, segun los objetivos declarados de mejora en resolucion de problemas.
- Entrada de imagen: la etiqueta de pipeline es image-text-to-text, pero no se detalla ni se demuestra en la informacion disponible.
- Despliegue local en cuantizaciones de 4 y 8 bits, con variantes MTP para acelerar la generacion.
- Ausencia de rechazos por contenido (modelo abliterated/uncensored), lo que habilita generacion sin filtros de seguridad.

## Casos de uso

- Escritura creativa y narrativa larga: el modelo esta ajustado especificamente para ficcion, relato y "todos los generos", y la reduccion del bloque de pensamiento libera presupuesto de contexto para el texto final en lugar de para el razonamiento interno.
- Roleplay y personajes persistentes: la condicion uncensored y el enfoque en dialogo permiten mantener personajes con lenguaje adulto o conflictivo sin rechazos, algo que los modelos alineados suelen bloquear.
- Asistencia a guionistas y autores en fase de borrador: la generacion de hooks y continuaciones con alto nivel de detalle permite producir material de partida para revision humana en lugar de texto final.
- Generacion de codigo en local: los cuants etiquetados como NEO-CODER MAX y el soporte de 4 bits permiten usar el modelo como asistente de programacion en una estacion de trabajo con una unica GPU de 24 GB, sin enviar codigo a la nube.
- Agentes y automatizacion multi-paso: si se confirman las capacidades de tool calling reportadas por terceros, encajaria en orquestadores tipo LangGraph o similares para tareas encadenadas con llamadas a funciones.
- Traduccion y contenido bilingue ingles-chino: es el unico par de idiomas declarados, util para documentacion tecnica o localizacion entre ambos.
- Investigacion sobre abliteration y alineacion: al ser un modelo abliterated con benchmark autodeclarado, sirve como sujeto de estudio para medir como afecta la eliminacion de rechazos a las capacidades generales.
- Despliegue en hardware de consumo mediante GGUF: la existencia de cuants regulares y MTP con imatrix dual permite ejecucion offline con llama.cpp u Ollama en equipos sin aceleradores profesionales.

## Benchmarks y rendimiento

Los unicos datos numericos de benchmark presentes en la informacion disponible son autodeclarados en la model card. No se han publicado resultados independientes verificables.

| Benchmark | 8 bits | 4 bits | Notas |
|---|---|---|---|
| ARC-C | 735 (autodeclarado) | 719 (autodeclarado) | El autor indica que son 144 puntos mas que Qwen 3.8 27B, lo que implicaria unos 591 en el modelo base; cifra derivada, no publicada explicitamente |
| ARC-E | 880 (autodeclarado) | No disponible | El autor lo situa en la "zona de inteligencia" de OpenAI, Claude y Gemini |
| MMLU | No disponible | No disponible | - |
| HumanEval | No disponible | No disponible | - |
| GSM8K | No disponible | No disponible | - |

La model card afirma que el modelo supera los siete benchmarks criticos tanto del Qwen 3.8 27B base como de Qwen3.6-35B-A3B, Qwen3.6 27B y Qwen3.5 27B, pero no se detalla que siete benchmarks son ni se aportan los valores numericos. Tampoco se publican datos de latencia, throughput ni de la magnitud real de la reduccion de tokens de pensamiento (solo un rango cualitativo: de 1/2 a 1/10, con mediana aproximada de 2/3).

## Requisitos de hardware

Las cifras de VRAM que siguen son estimaciones calculadas a partir del recuento real de parametros (26,9B) y de la regla habitual de bytes por parametro mas sobrecarga de cache KV; el autor no las publica.

- Inferencia en bfloat16/fp16: aproximadamente 54 GB solo de pesos, mas 4-8 GB de cache KV y activaciones en contextos largos. Requiere A100 80 GB, H100 80 GB o dos GPU de 40-48 GB.
- Inferencia en 8 bits: aproximadamente 27 GB de pesos, alrededor de 32-36 GB en total. Cabe en A100 40 GB o H100, no en una GPU de 24 GB.
- Inferencia en 4 bits (Q4_K_S y similares): aproximadamente 13,5-15 GB de pesos, alrededor de 17-19 GB en total con contexto moderado.
- GPU de consumo: si cabe en una RTX 4090 o RTX 3090 de 24 GB en 4 bits, con margen razonable. En tarjetas de 16 GB (RTX 4080, 4060 Ti 16 GB) es ajustado y dependera de la longitud de contexto y del tamano de la cache KV.
- Cuantizaciones mas agresivas y variantes MTP: permiten bajar el requisito de VRAM y, en el caso de MTP, acelerar la generacion en runtimes que soporten decodificacion multi-token.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y bindings de llama-cpp para los ficheros GGUF; vLLM, SGLang o TGI para los pesos safetensors en bfloat16, siempre que la GPU tenga VRAM suficiente.
- Latencia y throughput: no disponible. El autor afirma que el modelo es "mas rapido" que el Qwen3.8 27B original gracias a la reduccion del bloque de pensamiento, pero no aporta tokens por segundo ni comparativas medidas.
- Almacenamiento: el repositorio completo ocupa 389 GB, por lo que conviene descargar solo el cuant necesario.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Kalaborative/qwen3.8turbo | 26,9B | No disponible | apache-2.0 | GGUF y safetensors en HuggingFace; 0 descargas | Fine tune sin validacion independiente; benchmarks autodeclarados |
| DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU | No disponible (el nombre sugiere 27B) | No disponible | No disponible | HuggingFace | Modelo base directo de este fine tune |
| Qwen3.8 27B (QwenLM) | No disponible | La documentacion general de Qwen cita ventanas de 128K a 256K en los modelos abiertos, sin confirmacion para esta variante | No disponible | Serie Qwen3.8 publicada como pesos abiertos segun el repositorio QwenLM/Qwen3.8 | Referencia oficial; el autor afirma superarla en sus siete benchmarks criticos |
| Qwen3.6-35B-A3B | 35B totales; activos no disponibles | No disponible | No disponible | Mencionado en la model card | Arquitectura MoE segun la nomenclatura; usada como comparativa por el autor |
| Qwen3.6 27B y Qwen3.5 27B | No disponible | No disponible | No disponible | Mencionados en la model card | Generaciones anteriores de la misma familia |

## Limitaciones y advertencias

- Modelo abliterated y uncensored: los mecanismos de rechazo han sido atenuados de forma deliberada. Puede generar contenido violento, sexual, discriminatorio o peligroso sin filtros. No es apto para entornos con usuarios sin supervisacion ni para productos sujetos a politicas de contenido.
- Riesgo elevado de alucinacion en tareas factuales: el ajuste prioriza detalle y creatividad sobre verificabilidad, y el estilo de las muestras incluidas en la model card es marcadamente expresivo y no verificable.
- Idiomas: solo ingles y chino declarados. No hay soporte documentado de castellano, por lo que el rendimiento en espanol es incierto y no esta medido.
- Longitud de contexto desconocida: no se publica la ventana real del fine tune ni si se ha extendido respecto al modelo base, lo que dificulta planificar cargas con documentos largos.
- Benchmarks no verificados: las cifras de ARC-C y ARC-E son autodeclaradas, se refieren a benchmarks de razonamiento cientifico y no cubren codigo, matematicas ni tareas profesionales. Ademas, el autor afirma explicitamente que no ha hecho "benchmaxing", pero no aporta metodologia reproducible.
- Sin traccion publica: cero descargas y cero "likes" en el momento de la ficha, sin historial de uso ni reportes de terceros mas alla de las referencias a la pestana de comunidad.
- Capacidad multimodal no confirmada: la etiqueta image-text-to-text sugiere entrada de imagen, pero la model card no describe entrenamiento de vision ni evaluacion multimodal. No debe asumirse que funciona como modelo de vision.
- Cadena de licencias: aunque la ficha declara apache-2.0, conviene verificar la licencia del modelo base y de la serie Qwen3.8 subyacente antes de uso comercial, ya que el fine tune hereda obligaciones del modelo original.
- Confusion de nombre: "qwen3.8turbo" no debe confundirse con qwen-turbo, el modelo de API de Alibaba Cloud. Son productos sin relacion.
- Pesos pesados: 389 GB de repositorio obligan a descargar unicamente el cuant necesario y a gestionar el almacenamiento en disco.
- Reproducibilidad limitada: los metodos COLD FUSION, GAIN y Fable Fusion 711 no estan publicados con detalle suficiente para replicar el entrenamiento.

## Enlaces

- HuggingFace (modelo): https://huggingface.co/Kalaborative/qwen3.8turbo
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Modelo previo del mismo autor (referencia de COLD FUSION): https://huggingface.co/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF
- Dataset Polar-STRICT: https://huggingface.co/datasets/DavidAU/Polar-STRICT-Datasets
- Dataset F451-STRICT: https://huggingface.co/datasets/DavidAU/F451-STRICT-Datasets
- Repositorio oficial de la serie Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Documentacion de qwen-turbo en Alibaba Cloud Model Studio (modelo distinto, no relacionado): https://www.alibabacloud.com/help/en/model-studio/qwen-turbo
- Documentacion alternativa de qwen-turbo: https://docs.modelstudio.console.alibabacloud.com/en/model-studio/qwen-turbo
- Ficha de Qwen-Turbo en QwenCloud: https://www.qwencloud.com/models/qwen-turbo
- Comparativa general de modelos Qwen (segundo recurso externo): https://www.secondtalent.com/resources/every-qwen-ai-model-explained-compared/
