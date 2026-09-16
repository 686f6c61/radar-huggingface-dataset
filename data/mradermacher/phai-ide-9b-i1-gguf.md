# mradermacher/PhAI-IDE-9B-i1-GGUF

## Resumen

PhAI-IDE-9B-i1-GGUF es un repositorio de cuantizaciones GGUF generado por mradermacher a partir del modelo base AItonomy/PhAI-IDE-9B, un modelo denso de 8.953.803.264 parametros (aproximadamente 8,95 B). No se trata de un modelo entrenado desde cero, sino de una conversion y compresion del modelo original a formato GGUF, con el objetivo de permitir su ejecucion en hardware de consumo y en entornos de inferencia local mediante llama.cpp y herramientas compatibles.

El repositorio incluye 24 variantes de cuantizacion, desde IQ1_S (la mas agresiva en compresion) hasta Q6_K, generadas con matrices de importancia (imatrix), una tecnica que pondera el error de cuantizacion segun la relevancia de cada peso y que mejora la calidad resultante en bit widths bajos. La conversion se realizo con convert_type hf y quantize_version 2, y el conjunto completo de ficheros ocupa 13,6 GB.

Su relevancia practica es doble: por un lado, ofrece un punto de entrada de bajo coste para ejecutar un modelo de ~9 B en GPUs consumer o incluso en CPU; por otro, al cubrir de forma sistematica casi todo el espectro de cuantizaciones, constituye un material util para estudiar el degradado de calidad en funcion del bit width sobre un mismo modelo base. La model card no documenta arquitectura, contexto, idiomas ni licencia, por lo que la evaluacion previa a un uso en produccion requiere consultar el repositorio del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 8.953.803.264 (aproximadamente 8,95 B) |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, IQ3_M, Q3_K_S, IQ3_XXS, Q3_K_M, Q3_K_L, IQ3_XS, IQ3_S, small-IQ4_NL, IQ4_XS, Q4_0, Q4_1, Q4_K_S, Q4_K_M, IQ2_M, IQ2_XXS, IQ2_XS, IQ2_S, Q6_K, IQ1_M, IQ1_S, Q5_K_S, Q5_K_M (24 variantes, generadas con imatrix) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizado; el original se convirtio desde formato HuggingFace) |
| Repositorio de origen (modelo base) | AItonomy/PhAI-IDE-9B |
| Autor de la cuantizacion | mradermacher |
| Tamano del repositorio | 13,6 GB (conjunto completo de cuantizaciones) |
| Version de cuantizacion | quantize_version 2, output_tensor_quantised 1 |
| Tags declarados | gguf, endpoints_compatible, region:us, imatrix, conversational |
| Fecha de creacion | 2026-09-16 |
| Ultima actualizacion | 2026-09-16 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura del modelo base AItonomy/PhAI-IDE-9B. El unico dato estructural fiable es el recuento de parametros del modelo original en safetensors: 8.953.803.264, lo que lo situa en la categoria de modelos densos de ~9 B. No se especifica si emplea atencion completa, atencion con ventana deslizante, atencion lineal u otra variante, ni el numero de capas, dimensiones ocultas o tamano de vocabulario. Tampoco hay datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF, DPO u otro tipo de ajuste por preferencias.

Lo que si esta documentado es el proceso de cuantizacion. El pipeline parte de los pesos en formato HuggingFace (convert_type hf), aplica cuantizacion de tensores de salida (output_tensor_quantised: 1) y genera las variantes con matrices de importancia (imatrix), tal como indica el propio autor en la model card. El uso de imatrix implica que los errores de cuantizacion se ponderan con estadisticas de activacion recogidas sobre un corpus de calibracion, lo que reduce la perdida de calidad respecto a la cuantizacion uniforme, especialmente en los niveles IQ1 e IQ2. La etiqueta conversational sugiere que el modelo base fue ajustado para dialogo, pero se trata de una inferencia a partir del tag y no de una especificacion tecnica.

## Capacidades

- Generacion de texto y conversacion multi-turno: el repositorio declara el tag conversational, lo que indica que el modelo base esta orientado a dialogo, aunque no se detalla el nivel de calidad.
- Compatibilidad con endpoints de inferencia: el tag endpoints_compatible sugiere que los ficheros pueden servirse mediante APIs compatibles con el estandar de HuggingFace Inference Endpoints.
- Ejecucion local en cuantizaciones de 1 a 6 bits: 24 variantes permiten ajustar el equilibrio entre calidad y consumo de memoria.
- Uso en CPU y GPU: el formato GGUF esta soportado por llama.cpp y sus derivados, lo que habilita inferencia en CPU, en GPU o en modo hibrido con offload parcial.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declara la lista de idiomas).
- Capacidades especiales (modo pensamiento, vision, audio): no disponible. No se incluye fichero mmproj en el repositorio, por lo que no hay indicios de soporte multimodal.

## Casos de uso

- Asistente conversacional en local con datos sensibles: al distribuirse en GGUF, el modelo puede ejecutarse integramente en la maquina del usuario mediante llama.cpp u Ollama, de modo que ninguna conversacion sale de la red corporativa. Es adecuado para entornos con requisitos estrictos de privacidad donde no se permite enviar prompts a APIs externas.
- Servicio de chat interno autohospedado: desplegando llama-server sobre una unica GPU de gama media se puede exponer una API compatible con el formato OpenAI y conectarla a un frontend de chat corporativo, con la cuantizacion Q4_K_M o Q5_K_M como compromiso entre calidad y coste.
- Prototipado rapido de aplicaciones de IA: las variantes IQ2 y Q2_K ocupan pocos gigabytes y permiten levantar un entorno de pruebas en un portatil sin GPU dedicada, lo que reduce el tiempo desde la idea hasta el primer prototipo funcional.
- Estudio experimental de cuantizacion: al ofrecer el mismo modelo base en 24 niveles de compresion, el repositorio permite medir de forma controlada como evolucionan perplejidad y calidad de respuesta entre IQ1_S y Q6_K, un caso de uso habitual en investigacion sobre compresion de modelos.
- Despliegue en hardware de gama media o edge: las cuantizaciones de 2 a 4 bits caben en equipos con 8-16 GB de memoria unificada, lo que habilita asistentes de texto en mini-PC, portatiles o estaciones sin GPU de datacenter.
- Generacion por lotes de documentacion y resumenes offline: al poder ejecutarse sin conexion y sin coste por token, el modelo es util para procesar volumenes grandes de texto interno (informes, tickets historicos) en colas nocturnas.
- Base para experimentos de ajuste fino posterior: las cuantizaciones de mayor precision (Q6_K, Q5_K_M) pueden emplearse como referencia de calidad para comparar con versiones derivadas del modelo original en tareas especificas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, y la model card se limita a enumerar las cuantizaciones generadas. La busqueda web realizada no ha devuelto resultados relevantes sobre este modelo. Tampoco se dispone de mediciones de perplejidad especificas por nivel de cuantizacion, ni de comparaciones con el modelo base sin cuantizar.

## Requisitos de hardware

Los pesos aproximados y la VRAM indicada se han calculado a partir del recuento real de parametros (8,95 B) y de la relacion de bits habitual de cada familia de cuantizacion en GGUF. Son estimaciones, no mediciones publicadas por el autor.

| Rango de cuantizacion | Cuantizaciones incluidas | Peso aproximado de los pesos | VRAM estimada con contexto de 4 k |
|---|---|---|---|
| IQ1 | IQ1_S, IQ1_M | 2,2 - 2,6 GB | 3 - 4 GB |
| IQ2 | IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M | 2,5 - 3,1 GB | 4 - 5 GB |
| Q2 | Q2_K, Q2_K_S | 3,2 - 3,4 GB | 4,5 - 5,5 GB |
| IQ3 / Q3 | IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L | 3,5 - 4,6 GB | 5 - 7 GB |
| IQ4 / Q4 | small-IQ4_NL, IQ4_XS, Q4_0, Q4_1, Q4_K_S, Q4_K_M | 4,9 - 5,5 GB | 6 - 8 GB |
| Q5 | Q5_K_S, Q5_K_M | 6,1 - 6,4 GB | 7,5 - 9 GB |
| Q6 | Q6_K | 7,4 GB | 9 - 11 GB |

- Cabe en GPU consumer: si. Las cuantizaciones de 2 a 5 bits caben en tarjetas de 8 GB (RTX 3060 Ti, RTX 4060) con contexto moderado; las de 4 a 5 bits se ajustan comodamente en 12-16 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB); la variante Q6_K entra en 12 GB con contexto corto.
- GPU recomendadas: RTX 3090, RTX 4090, RTX A6000, L40S o A100 40 GB para cargar las cuantizaciones de mayor calidad con contextos largos y lote elevado. Para las variantes IQ1/IQ2 basta una GPU de 6-8 GB.
- Inferencia en CPU: viable con llama.cpp, especialmente en las cuantizaciones Q4_K_M o inferiores; se recomienda un minimo de 16 GB de RAM para Q4 y 8-12 GB para IQ2/Q2.
- Opciones de despliegue: llama.cpp (llama-server, llama-cli), Ollama, LM Studio, koboldcpp, llama-cpp-python, text-generation-webui y Jan. El soporte de GGUF en vLLM es experimental y limitado; TGI no soporta ficheros GGUF, por lo que requeriria los pesos originales en safetensors.
- Latencia y throughput: no disponible. No se han publicado mediciones para este repositorio y el rendimiento dependera del nivel de cuantizacion, de la GPU y de la longitud de contexto.

## Comparativa con modelos similares

La comparativa de rendimiento con alternativas no es posible: no se dispone de benchmarks del modelo ni de su base, y la licencia del modelo base es desconocida, lo que impide una comparacion juridica fiable. La tabla siguiente recoge unicamente los datos confirmados del repositorio y valores publicos de referencia de modelos densos de tamano similar. Los datos de las alternativas no proceden de la busqueda web realizada y deben verificarse antes de tomar decisiones de adopcion.

| Modelo | Parametros | Contexto | Licencia | Formatos disponibles |
|---|---|---|---|---|
| PhAI-IDE-9B (i1-GGUF) | 8,95 B | no disponible | no disponible | GGUF (24 cuantizaciones) |
| AItonomy/PhAI-IDE-9B (base) | 8,95 B | no disponible | no disponible | pesos HuggingFace (safetensors) |
| Llama 3.1 8B Instruct (referencia publica) | 8,03 B | 128 k tokens | Llama 3.1 Community License | safetensors y GGUF de terceros |
| Mistral 7B Instruct v0.3 (referencia publica) | 7,25 B | 32 k tokens | Apache 2.0 | safetensors y GGUF oficiales |
| Gemma 2 9B (referencia publica) | 9,24 B | 8 k tokens | Gemma Terms of Use | safetensors y GGUF de terceros |

Diferencias relevantes: a diferencia de las alternativas, este repositorio no declara licencia, idiomas ni contexto, y no cuenta con evaluaciones publicadas, lo que anade incertidumbre a cualquier decision de adopcion. Su ventaja comparativa es la cobertura sistematica de cuantizaciones con imatrix desde 1 bit, superior en numero de variantes a la mayoria de repositorios GGUF de modelos de tamano similar.

## Limitaciones y advertencias

- Licencia no especificada: ni el repositorio de cuantizaciones ni los datos proporcionados indican la licencia del modelo base. No debe asumirse uso comercial permitido; es imprescindible verificar la licencia en AItonomy/PhAI-IDE-9B antes de cualquier despliegue productivo.
- Idiomas no declarados: se desconoce que lenguas estan soportadas y con que calidad, lo que impide garantizar un rendimiento aceptable en castellano sin una evaluacion propia.
- Longitud de contexto desconocida: no se puede planificar un caso de uso con documentos largos o conversaciones extensas sin medir antes el limite real del modelo base.
- Degradacion por cuantizacion: las variantes IQ1 e IQ2, y en menor medida Q2, comprimen muy agresivamente los pesos y suelen producir perdida de coherencia, errores factuales y mayor tasa de repeticion. El uso de imatrix mitiga el problema, pero no lo elimina.
- Riesgo de alucinacion: no evaluado. No existen benchmarks ni evaluaciones de fidelidad publicadas para este modelo o su base.
- Ausencia de validacion por la comunidad: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay retroalimentacion externa sobre su calidad o su comportamiento en produccion.
- Falta de soporte multimodal: el repositorio no incluye fichero mmproj, por lo que no hay indicios de capacidades de vision.
- Dependencia de version de llama.cpp: las cuantizaciones imatrix y los formatos IQ requieren versiones relativamente recientes de llama.cpp u Ollama; versiones antiguas pueden fallar al cargar los ficheros.
- Compatibilidad limitada con servidores de alto rendimiento: vLLM solo soporta GGUF de forma experimental y TGI no lo soporta, lo que restringe las opciones de despliegue a gran escala si se necesitan lotes grandes o decodificacion especulativa.
- Ausencia de datos de entrenamiento: al no conocerse la composicion del dataset, no se pueden anticipar sesgos especificos ni dominios de especializacion.

## Enlaces

- Repositorio de cuantizaciones: https://huggingface.co/mradermacher/PhAI-IDE-9B-i1-GGUF
- Modelo base: https://huggingface.co/AItonomy/PhAI-IDE-9B
- Perfil del autor de las cuantizaciones: https://huggingface.co/mradermacher
- Busqueda web: no se han encontrado papers, blogs, repositorios ni demos relevantes sobre este modelo. Los resultados devueltos por la busqueda no guardan relacion con el modelo y se han descartado.
