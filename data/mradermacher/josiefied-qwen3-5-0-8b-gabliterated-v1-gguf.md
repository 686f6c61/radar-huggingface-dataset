# mradermacher/Josiefied-Qwen3.5-0.8B-gabliterated-v1-GGUF

## Resumen

Josiefied-Qwen3.5-0.8B-gabliterated-v1-GGUF es la distribucion en formato GGUF del modelo Josiefied-Qwen3.5-0.8B-gabliterated-v1, publicado por el usuario mradermacher. Se trata de una cuantizacion estatica del modelo base de Goekdeniz-Guelmez, que a su vez es un derivado afinado de la familia Qwen3.5 en su variante de 0.8B de parametros, con la particularidad de haber sido sometido a un proceso de "abliteration" (eliminacion de las capas de rechazo o refusal). El resultado es un modelo conversacional pequeno, orientado a generacion de texto y chat, que conserva el tokenizador y la arquitectura del modelo original pero relaja los filtros de seguridad aprendidos durante el alineamiento.

El modelo tiene 752.393.024 parametros totales (segun los pesos en safetensors), lo que lo situa en la categoria de modelos ultraligeros, aptos para ejecucion en CPU, GPUs de gama baja y dispositivos con recursos limitados. La distribucion GGUF incluye un conjunto amplio de cuantizaciones (desde Q2_K hasta f16, pasando por IQ4_XS y Q8_0) y, de forma destacable, ficheros mmproj en Q8_0 y f16, lo que indica que el modelo base incorpora un proyector multimodal y por tanto capacidad de vision. El repositorio ocupa 7.8 GB en total, aunque cada fichero individual de cuantizacion pesa entre 0.5 y 1.6 GB.

La relevancia de esta ficha es doble. Por un lado, documenta un caso tipico de la cadena de derivacion de modelos open source: modelo original, fine-tune con abliteration y cuantizacion para despliegue. Por otro, advierte de que la licencia no esta declarada en la informacion disponible y de que el modelo solo declara soporte para ingles, lo que condiciona su uso en produccion. La fecha de creacion del repositorio es el 14 de marzo de 2026 y la ultima actualizacion el 2 de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3.5); detalles exactos no disponibles |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, IQ4_XS, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base mas alla de su pertenencia a la familia Qwen3.5, que emplea transformers decoder-only con atencion causal. El dato objetivo es el numero de parametros (752.393.024) y la presencia de un proyector multimodal (mmproj) en la distribucion GGUF, lo que implica que el modelo base incorpora un encoder de vision o un adaptador para entrada de imagenes. No se especifican el numero de capas, dimensiones ocultas, cabezas de atencion ni la longitud de contexto nativa.

Respecto al entrenamiento, no se dispone de informacion sobre el numero de tokens, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o similares en el modelo Qwen3.5 original. La innovacion tecnica diferencial de esta variante es el proceso de abliteration aplicado por Goekdeniz-Guelmez: se identifican las direcciones de activacion asociadas a comportamientos de rechazo y se eliminan o atenuan mediante edicion de pesos, de modo que el modelo deja de producir respuestas de negativa ante ciertas peticiones. Este proceso se aplica sobre el fine-tune "Josiefied", del que tampoco se documentan en la informacion proporcionada los datos de entrenamiento ni el procedimiento exacto. La cuantizacion de mradermacher es estatica (convert_type: hf, output_tensor_quantised: 1) y no se basa en imatrix; las versiones con imatrix se publican en un repositorio separado (i1-GGUF).

## Capacidades

- Generacion de texto y conversacion multi-turno en ingles, orientada a casos de chat.
- Capacidad multimodal: la presencia de ficheros mmproj (Q8_0 y f16) indica soporte de entrada de imagenes, aunque no se detalla el alcance ni la calidad de dicha capacidad.
- Razonamiento basico y respuesta a instrucciones, heredado del fine-tune sobre Qwen3.5.
- Comportamiento "abliterated": menor tendencia a rechazar peticiones que el modelo alineado original, lo que afecta tanto a contenido sensible como a la utilidad general en tareas creativas o de rol.
- No se documenta soporte explicito de tool calling ni function calling en la informacion disponible.
- No se documenta soporte de agentes ni de razonamiento multi-paso estructurado.
- Capacidades multilingues limitadas al ingles segun la model card; no se declaran otros idiomas.
- No se documenta modo "thinking", audio ni otras capacidades especiales.

## Casos de uso

- Prototipado rapido de asistentes conversacionales en local: al pesar entre 0.5 y 1.6 GB segun cuantizacion, el modelo puede cargarse en un portatil con 8 GB de RAM y ejecutarse en CPU con llama.cpp, lo que permite iterar sobre prompts y flujos de chat sin coste de API.
- Experimentacion con tecnicas de abliteration y seguridad de modelos: investigadores que estudien el efecto de la eliminacion de capas de rechazo pueden comparar este modelo con el Qwen3.5 alineado original usando las mismas cuantizaciones y el mismo runtime.
- Generacion de texto creativo y de rol en ingles: la relajacion de filtros permite explorar narrativa, dialogos de personajes y escenarios que un modelo alineado rechazaria, con la advertencia de revision humana del contenido.
- Despliegue en entornos con GPU integrada o de gama baja: las cuantizaciones Q4_K_S y Q4_K_M (0.6 GB) caben en GPUs con 2-4 GB de VRAM, lo que habilita inferencia acelerada en equipos consumer sin dedicar recursos significativos.
- Clasificacion y etiquetado de texto a pequena escala: para tareas de extraccion o categorizacion simple en ingles, el modelo puede ejecutarse en lote sobre CPU con throughput aceptable dado su tamano reducido.
- Pruebas de pipelines multimodales ligeros: los ficheros mmproj permiten experimentar con entrada de imagenes en un modelo de menos de 1B de parametros, util para validar integraciones antes de escalar a modelos mayores.
- Base para fine-tunes especializados: su tamano y su formato GGUF lo hacen adecuado como punto de partida para adaptaciones con LoRA en dominios concretos, siempre que se resuelva la ambiguedad de licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto): aproximadamente 0.5 GB en Q2_K/Q3_K_S, 0.6 GB en Q4_K_S/Q4_K_M/IQ4_XS, 0.7 GB en Q5_K_M/Q6_K y 0.9-1.6 GB en Q8_0/f16.
- El proyector multimodal anade 0.2 GB (mmproj-Q8_0) o 0.3 GB (mmproj-f16) si se usa entrada de imagenes.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para cuantizaciones Q4; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son sobredimensionadas para este modelo y solo aportan ventaja en throughput por lotes.
- Cabe en GPU consumer: si, en practicamente todas las GPUs dedicadas modernas e incluso en iGPU con memoria compartida suficiente.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; el tag endpoints_compatible sugiere compatibilidad con endpoints tipo OpenAI. vLLM y TGI no estan documentados para este formato en la informacion disponible.
- Latencia y throughput estimados: no disponibles. Por el tamano (menos de 1B de parametros), se espera inferencia en tiempo real en CPU moderna para cuantizaciones Q4, pero no hay mediciones publicadas en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Josiefied-Qwen3.5-0.8B-gabliterated-v1 (este) | 752 M | no disponible | no disponible | GGUF, safetensors | Abliterated, multimodal via mmproj, solo ingles |
| Qwen3.5-0.8B (base original) | ~0.8 B | no disponible | no disponible en esta ficha | safetensors | Modelo alineado de referencia; sin abliteration |
| Qwen2.5-0.5B-Instruct | ~0.5 B | 32 K (segun documentacion publica de Qwen2.5) | Apache 2.0 (segun documentacion publica) | safetensors, GGUF | Alternativa ultraligera con licencia permisiva y contexto documentado |
| Llama 3.2 1B Instruct | ~1.2 B | 128 K (segun documentacion publica de Llama 3.2) | Llama 3.2 Community License | safetensors, GGUF | Alternativa de tamano similar con contexto largo documentado |

La comparativa se limita a datos publicos de los modelos alternativos; no se dispone de mediciones de rendimiento comparativas para este modelo concreto en la informacion proporcionada.

## Limitaciones y advertencias

- La licencia no esta declarada en la informacion disponible, lo que impide confirmar si el uso comercial esta permitido. Es imprescindible verificar la licencia del modelo base (Goekdeniz-Guelmez/Josiefied-Qwen3.5-0.8B-gabliterated-v1) y del Qwen3.5 original antes de cualquier despliegue en produccion.
- El proceso de abliteration elimina deliberadamente los mecanismos de rechazo, lo que incrementa el riesgo de generar contenido danino, sesgado o inapropiado sin las salvaguardas habituales. No es adecuado para aplicaciones expuestas a usuarios finales sin moderacion adicional.
- El modelo solo declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta documentado y previsiblemente sera deficiente.
- La longitud de contexto no esta disponible, lo que impide planificar casos de uso que requieran ventanas largas.
- Riesgo de alucinacion elevado por el reducido tamano del modelo (menos de 1B de parametros) y por la falta de datos de evaluacion publicados.
- No hay benchmarks publicados que permitan estimar su calidad frente a alternativas; las decisiones de adopcion deberian basarse en evaluacion propia.
- La cuantizacion Q2_K y Q3_K_S, aunque ocupan poco espacio, degradan la calidad de forma notable segun las notas del propio autor; para uso real se recomienda Q4_K_M o superior.
- El repositorio incluye 343 descargas y 0 likes en el momento de la consulta, lo que sugiere una adopcion muy limitada y escasa validacion por parte de la comunidad.
- No se documenta soporte de tool calling ni de agentes, por lo que no deberia asumirse su integracion en pipelines que dependan de function calling.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/mradermacher/Josiefied-Qwen3.5-0.8B-gabliterated-v1-GGUF
- Modelo base (fine-tune abliterated): https://huggingface.co/Goekdeniz-Guelmez/Josiefied-Qwen3.5-0.8B-gabliterated-v1
- Cuantizaciones con imatrix (i1-GGUF): https://huggingface.co/mradermacher/Josiefied-Qwen3.5-0.8B-gabliterated-v1-i1-GGUF
- Pagina de descargas del autor para este modelo: https://hf.tst.eu/model#Josiefied-Qwen3.5-0.8B-gabliterated-v1-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
