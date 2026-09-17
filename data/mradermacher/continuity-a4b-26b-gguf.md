# mradermacher/continuity-a4b-26b-GGUF

## Resumen

Continuity-a4b-26b-GGUF es una recopilacion de cuantizaciones en formato GGUF del modelo GestaltLabs/continuity-a4b-26b, publicada por el usuario mradermacher. El repositorio contiene unicamente pesos cuantizados (no los pesos originales en precision completa), generados con un proceso de cuantizacion estatica identificado como quantize_version 2 y convert_type hf. Los pesos originales suman 25.233.142.046 parametros (unos 25,2 B), aunque el nombre comercial del modelo indica 26 B.

El interes practico del repositorio es que permite ejecutar un modelo de ~25 B en hardware de consumo mediante llama.cpp u otros runners compatibles con GGUF, algo inviable con los pesos en safetensors. Se publican siete variantes de cuantizacion que abarcan desde Q2_K hasta Q4_K_M, con un tamano conjunto de repositorio de 84,2 GB.

La informacion publica disponible es muy escasa: no se documentan arquitectura, datos de entrenamiento, longitud de contexto, idiomas, licencia ni resultados de benchmarks. Ademas, el repositorio no registra descargas ni valoraciones en el momento de redactar esta ficha, por lo que no existe validacion de la comunidad sobre su calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el sufijo "a4b" del nombre sugiere una arquitectura de mezcla de expertos, sin confirmar) |
| Parametros totales | 25.233.142.046 (~25,2 B), segun los pesos en safetensors del modelo original |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (este repositorio); el modelo original se distribuye en safetensors |
| Tamano del repositorio | 84,2 GB (suma de las siete cuantizaciones) |
| Modelo base | GestaltLabs/continuity-a4b-26b |
| Fecha de publicacion | 17 de septiembre de 2026 (segun metadatos de HuggingFace) |
| Etiquetas declaradas | gguf, endpoints_compatible, conversational, region:us |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base. La model card del repositorio de cuantizacion se limita a indicar que se trata de "static quants" del modelo GestaltLabs/continuity-a4b-26b y no incluye descripcion de la arquitectura (transformer denso, mezcla de expertos, SSM o hibrida), del numero de tokens de entrenamiento, de la composicion del dataset ni de si se aplicaron tecnicas de alineacion como RLHF, DPO o RLVR.

Los unicos datos tecnicos disponibles son los metadatos internos del proceso de cuantizacion: quantize_version 2, output_tensor_quantised 1 y convert_type hf. La nomenclatura "a4b" es habitual en modelos de mezcla de expertos para indicar el numero de parametros activos por token (4 B en este caso) frente al total (26 B), pero no se ha podido confirmar esta interpretacion con documentacion del autor. Tampoco se documenta ninguna innovacion tecnica adicional (atencion lineal, decodificacion especulativa, atencion con ventana deslizante, etc.).

## Capacidades

- Generacion de texto conversacional: el repositorio esta etiquetado como "conversational", lo que indica que el modelo base esta ajustado para mantener dialogos multi-turno.
- Compatibilidad con endpoints: la etiqueta "endpoints_compatible" indica que el modelo puede desplegarse a traves de infraestructura de inferencia gestionada de HuggingFace.
- Inferencia en CPU y GPU de consumo mediante el formato GGUF y las siete cuantizaciones publicadas.
- Razonamiento, generacion de codigo, matematicas, vision, audio, tool calling, function calling, uso como agente, modo "thinking" y capacidades multilingues: no disponible, no se ha publicado informacion al respecto.
- No se incluye ningun fichero de proyector multimodal (mmproj) en el repositorio, dato que no permite descartar ni confirmar capacidades de vision en el modelo original.

## Casos de uso

- Despliegue local en una estacion de trabajo con una unica GPU de 24 GB: la cuantizacion Q4_K_M ocupa aproximadamente 15 GB de pesos, por lo que deja margen para cache KV y contexto en tarjetas como la RTX 3090 o la RTX 4090. Es el escenario principal para el que existe este repositorio.
- Ejecucion en servidores sin GPU dedicada: las variantes Q2_K y Q3_K_S reducen el modelo a 9-11 GB, lo que permite inferencia por CPU con llama.cpp en equipos con 16 GB de RAM, a costa de una degradacion de calidad no cuantificada.
- Prototipado de aplicaciones conversacionales en local: al estar etiquetado como "conversational", puede emplearse como backend de un chat de pruebas integrado en Ollama o LM Studio antes de decidir si se migra a una API comercial.
- Procesamiento de datos sensibles en infraestructura propia: al ejecutarse de forma local, permite tratar conversaciones con informacion confidencial sin enviar datos a terceros, siempre que la licencia del modelo original lo permita (dato no disponible, ver limitaciones).
- Evaluacion comparativa de cuantizaciones: el repositorio permite medir la perdida de calidad y el cambio en latencia entre Q2_K, Q3_K_*, IQ4_XS y Q4_K_*, util para decidir el punto de equilibrio entre precision y huella de memoria.
- Experimentacion en investigacion sobre cuantizacion: sirve como caso de estudio de un modelo de ~25 B con siete variantes publicadas por el mismo autor y con los mismos parametros de conversion.
- Servicio interno de asistencia en una organizacion con presupuesto de GPU limitado: un unico nodo con una GPU de 24 GB puede servir la variante Q4_K_M para un equipo pequeno, asumiendo que no hay datos publicos sobre su calidad real.
- Base para pipelines de generacion de texto por lotes en entornos aislados (air-gapped), donde no es posible invocar modelos alojados en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K, MT-Bench ni de ninguna otra evaluacion, ni del modelo original ni de las cuantizaciones de este repositorio. Tampoco se han publicado mediciones de latencia o throughput.

## Requisitos de hardware

Las cifras de tamano de pesos son estimaciones calculadas a partir del numero de parametros (25,2 B) y de los bits por peso tipicos de cada tipo de cuantizacion. No proceden de mediciones publicadas por el autor.

| Cuantizacion | Tamano estimado de pesos | VRAM recomendada (pesos + cache KV) | Cabe en GPU de consumo |
|---|---|---|---|
| Q2_K | ~8,5-9,5 GB | 11-13 GB | Si, en RTX 4080/4090 (16-24 GB) |
| Q3_K_S | ~10,5-11,5 GB | 13-15 GB | Si, en RTX 4080/4090 |
| Q3_K_M | ~12-13 GB | 14-16 GB | Si, en RTX 4080/4090 |
| Q3_K_L | ~13-14 GB | 15-18 GB | Si, en RTX 4090 |
| IQ4_XS | ~13-14 GB | 15-18 GB | Si, en RTX 4090 |
| Q4_K_S | ~14-15 GB | 16-19 GB | Si, en RTX 4090; ajustado en 16 GB |
| Q4_K_M | ~15-16 GB | 17-21 GB | Si, en RTX 3090/4090 (24 GB) |

- GPU profesionales: A100 40/80 GB, H100 80 GB, L40S 48 GB y A6000 48 GB permiten cargar cualquier variante con contexto amplio y buen margen para lotes.
- GPU de consumo: ninguna cuantizacion publicada cabe en tarjetas de 8 GB o 12 GB. Las de 16 GB exigen contexto reducido en las variantes Q4. Las de 24 GB (RTX 3090, 4090) son el objetivo realista para Q4_K_M.
- CPU y RAM: las variantes Q2_K y Q3_K_S son las unicas viables para inferencia completa en CPU con 16 GB de RAM, con velocidades de decodificacion muy dependientes del ancho de banda de memoria.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp y text-generation-webui son compatibles con GGUF. Para el modelo original en safetensors seria necesario un servidor que soporte su arquitectura (vLLM, TGI o SGLang), lo cual no esta confirmado.
- Latencia y throughput: no disponible. Si el sufijo "a4b" correspondiera efectivamente a 4 B de parametros activos, la velocidad de decodificacion seria mucho mayor que la de un modelo denso de 25 B, pero esto no se ha verificado.

## Comparativa con modelos similares

No es posible establecer una comparativa de rendimiento porque no existen datos publicados sobre este modelo. La tabla siguiente contrasta unicamente especificaciones verificables y declaradas por cada proyecto (los datos de los comparadores proceden de su documentacion publica).

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| continuity-a4b-26b (GGUF) | 25,2 B (activos no disponibles) | no disponible | no disponible | GGUF | Sin benchmarks ni adopcion registrada |
| Qwen3-32B | 32,8 B | 32.768 nativo, ampliable a 131.072 con YaRN | Apache 2.0 | safetensors, GGUF | Modelo denso con modo de razonamiento conmutable |
| Mistral-Small-3.2-24B | 24 B | 128.000 | Apache 2.0 | safetensors, GGUF | Alternativa directa por tamano y licencia permisiva |
| Gemma-3-27B | 27 B | 128.000 | Terminos de uso de Gemma | safetensors, GGUF | Requiere aceptar condiciones de uso especificas |

La diferencia principal frente a estos tres modelos no es de rendimiento, sino de trazabilidad: los comparadores publican licencia, contexto, idiomas y resultados de evaluacion, mientras que para continuity-a4b-26b esos datos no estan disponibles.

## Limitaciones y advertencias

- Licencia no disponible: se desconoce si el modelo original permite uso comercial. Utilizarlo en produccion sin aclarar este punto supone un riesgo legal relevante.
- Ausencia total de benchmarks: no hay ninguna medicion publica de calidad, por lo que no puede justificarse su eleccion frente a alternativas conocidas.
- Adopcion nula: el repositorio registra 0 descargas y 0 valoraciones en el momento de redactar la ficha, lo que implica que no ha sido validado por terceros.
- Degradacion por cuantizacion: las variantes Q2_K y Q3_K_* comprimen un modelo de 25 B a 2-4 bits por peso; la perdida de calidad en tareas de razonamiento y codigo puede ser significativa y no esta cuantificada.
- Riesgo de alucinacion: no se dispone de informacion sobre el entrenamiento ni sobre alineacion, por lo que no puede estimarse la fiabilidad factual del modelo.
- Idiomas: se desconoce la cobertura linguistica. No hay confirmacion de un buen rendimiento en castellano.
- Contexto desconocido: sin la longitud de contexto declarada, no es posible disenar aplicaciones que dependan de ventanas largas.
- Nombre frente a realidad: el modelo se denomina "26b" pero el recuento real de parametros es 25,2 B; conviene usar el dato de safetensors en cualquier calculo de recursos.
- Repositorio de cuantizacion, no de pesos originales: no incluye safetensors ni permite re-cuantizar a otros formatos distintos de GGUF.
- Arquitectura no confirmada: si finalmente se trata de un modelo de mezcla de expertos, algunos runners (vLLM, TGI) pueden no soportarlo o hacerlo con un rendimiento suboptimo.
- Fecha de publicacion en metadatos (17 de septiembre de 2026) posterior a la fecha esperada de esta ficha, lo que sugiere una posible anomalia en los metadatos del repositorio.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/continuity-a4b-26b-GGUF
- Modelo original: https://huggingface.co/GestaltLabs/continuity-a4b-26b
- Perfil del autor de las cuantizaciones: https://huggingface.co/mradermacher

Nota: las busquedas web realizadas no devolvieron ningun resultado relacionado con el modelo. Los enlaces obtenidos correspondian a servicios de diagnostico clinico, laboratorios de analisis y software de mantenimiento remoto, sin relacion alguna con este modelo de lenguaje, por lo que se han descartado. No se han encontrado papers, blogs tecnicos, repositorios de codigo ni demos asociados.
