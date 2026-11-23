# mradermacher/Schattenblume-31B-GGUF

## Resumen

Schattenblume-31B-GGUF es la version cuantizada en formato GGUF del modelo Schattenblume-31B, un merge de modelos de 30.697.345.596 parametros (aproximadamente 31B) construido con mergekit y orientado a escritura creativa, roleplay conversacional y generacion de personajes. El trabajo de cuantizacion lo firma mradermacher, un publicador habitual de cuantizaciones GGUF en Hugging Face, mientras que el modelo original es obra de Nimbz. La ficha que nos ocupa corresponde exclusivamente a los pesos cuantizados, no al modelo base.

El modelo se presenta como un merge que combina modos de razonamiento y no razonamiento, con etiquetas que apuntan a un sesgo de baja negativa a rechazar peticiones (low-refusal) y a contenido NSFW, ademas de un rendimiento declarado en conversacion y narracion. La arquitectura subyacente se etiqueta como "gemma-4", lo que sugiere una base de la familia Gemma, aunque la model card no detalla la composicion exacta del merge ni los modelos que lo integran.

Su relevancia practica es acotada pero clara: ofrece un modelo de 31B en cuantizaciones que van desde los 12,0 GB (Q2_K) hasta los 32,7 GB (Q8_0), lo que permite desplegarlo en hardware de consumo de gama alta y en servidores modestos, algo imposible con los pesos completos en safetensors (213,9 GB de repositorio). La licencia Apache 2.0 facilita su uso comercial, aunque el contenido NSFW y la ausencia de benchmarks publicados exigen cautela en entornos productivos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetado como "gemma-4" en los tags; merge construido con mergekit) |
| Parametros totales | 30.697.345.596 (aproximadamente 31B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, ademas de mmproj-Q8_0 y mmproj-f16 (suplemento multimodal) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo base. Los tags lo etiquetan como "gemma-4" y como "merge" generado con mergekit, lo que indica que Schattenblume-31B es el resultado de fusionar pesos de varios modelos, no un entrenamiento desde cero. No se especifican los modelos componentes del merge, la estrategia de fusion (SLERP, TIES, DARE, model stock, etc.), el numero de tokens de entrenamiento ni si hubo fases de RLHF o DPO.

Tampoco se documentan innovaciones tecnicas como decodificacion especulativa, atencion lineal o modos de pensamiento explicitos. Las etiquetas "reasoning" y "non-reasoning" sugieren que el merge busca conservar capacidades de razonamiento del modelo original junto con modos de respuesta directa, pero la model card no aporta detalles sobre como se activan o alternan. La unica informacion tecnica concreta del repositorio es el proceso de cuantizacion: cuantizaciones estaticas con convert_type hf y output_tensor_quantised, y una variante i1 con cuantizaciones ponderadas/imatrix publicada en un repositorio aparte.

## Capacidades

- Generacion de texto en ingles con enfasis en escritura creativa, narracion y storytelling.
- Roleplay conversacional y character-RP: mantiene personajes y estilo a lo largo de intercambios multi-turno.
- Modos de razonamiento y no razonamiento segun los tags del autor, aunque sin documentacion sobre su activacion.
- Baja negativa a rechazar peticiones (low-refusal), orientada a contenido creativo sin restricciones excesivas.
- Generacion de contenido NSFW, explicitamente etiquetado por el autor.
- Soporte multimodal parcial: el repositorio incluye ficheros mmproj (Q8_0 y f16) como suplemento para modelos multimodales, lo que sugiere capacidad de vision si se usa con el runtime adecuado; no se detalla en la model card.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad documentada.
- Capacidades multilingues: solo ingles declarado.

## Casos de uso

- Roleplay y personajes conversacionales: el modelo esta etiquetado especificamente para character-RP, de modo que puede mantener la coherencia de un personaje a lo largo de sesiones largas. La cuantizacion Q4_K_M (18,8 GB) es un punto de partida razonable para prototipos en una GPU de 24 GB.
- Escritura creativa y narrativa: adecuado para generar relatos, dialogos y borradores literarios en ingles, gracias a su orientacion a storytelling y a la baja negativa a rechazar premisas creativas.
- Generacion de contenido para videojuegos y narrativa interactiva: puede alimentar dialogos ramificados de NPC en prototipos, ejecutandose en local con llama.cpp u Ollama y sin depender de APIs externas.
- Experimentacion con merges en investigacion: util para estudiar el comportamiento de modelos fusionados con mergekit en tareas creativas, comparando cuantizaciones (Q4_K_S frente a Q8_0) y midiendo el impacto de la cuantizacion en la calidad narrativa.
- Despliegue local en hardware de consumo: con Q2_K (12,0 GB) o Q3_K_M (15,4 GB) cabe en GPUs de 16-24 GB, lo que permite ejecutar un modelo de 31B en estaciones de trabajo sin acceso a clústeres.
- Generacion de contenido NSFW controlada: para proyectos que requieran este tipo de material con salvaguardas propias, el modelo declara explicitamente este uso; conviene aislarlo con filtros y politicas de uso en el pipeline.
- Fine-tuning ligero o adaptacion de estilo: los pesos GGUF no son ideales para entrenamiento, pero el modelo base en safetensors puede servir como punto de partida para LoRA orientados a un estilo narrativo concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto): Q2_K 12,0 GB; Q3_K_S 13,9 GB; Q3_K_M 15,4 GB; Q3_K_L 16,7 GB; IQ4_XS 17,0 GB; Q4_K_S 17,9 GB; Q4_K_M 18,8 GB; Q5_K_S 21,4 GB; Q5_K_M 21,9 GB; Q6_K 25,3 GB; Q8_0 32,7 GB. Hay que sumar la cache KV, que crece con la longitud de contexto.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M y Q5_K_M con contexto moderado; RTX 3090 (24 GB) en el mismo rango; A100 40 GB o H100 80 GB para Q8_0 con contexto largo; GPUs de 16 GB (RTX 4080, RTX 4060 Ti 16 GB) solo con Q2_K o Q3_K_S y contexto reducido.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090 y, con cuantizaciones bajas, en GPUs de 16 GB. Las cuantizaciones Q6_K y Q8_0 quedan fuera de las tarjetas de 24 GB si se necesita contexto amplio.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp y cualquier runtime compatible con GGUF; el repositorio tambien menciona endpoints_compatible. Para los ficheros mmproj se requiere un runtime con soporte multimodal (por ejemplo, llama.cpp con proyeccion de vision).
- Latencia y throughput estimados: no disponible. Dependen del hardware, de la cuantizacion y de la longitud de contexto; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Schattenblume-31B-GGUF (este) | 30,7B | no disponible | GGUF (Q2_K a Q8_0) | Apache 2.0 | Merge orientado a roleplay y creatividad, solo ingles, sin benchmarks |
| Nimbz/Schattenblume-31B | 30,7B | no disponible | safetensors | Apache 2.0 | Modelo base sin cuantizar; mismo comportamiento, requiere mucho mas hardware |
| Modelos de 30-34B de la familia Gemma (referencia generica) | aproximadamente 27-34B | no disponible | safetensors, GGUF | licencia propia de Gemma | Alternativa generalista; el modelo aqui descrito es un merge derivado, no oficial |
| Cuantizaciones i1 de mradermacher del mismo modelo | 30,7B | no disponible | GGUF imatrix | Apache 2.0 | Variante con cuantizacion ponderada, habitualmente de mayor calidad a igual tamano |

No se dispone de datos de rendimiento comparativo entre estas opciones en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta ingles; no hay evidencia de capacidades en castellano ni en otros idiomas.
- No se han publicado benchmarks, por lo que no hay evidencia objetiva de calidad frente a alternativas del mismo tamano.
- Es un merge con mergekit sin documentacion de los modelos componentes ni de la estrategia de fusion; la reproducibilidad y la trazabilidad son limitadas.
- La etiqueta low-refusal y la orientacion NSFW implican un riesgo elevado de generar contenido inapropiado; requiere filtros y politicas de uso en cualquier despliegue publico.
- Riesgo de alucinacion no cuantificado; al ser un modelo orientado a creatividad, la fidelidad factual no es su prioridad.
- La longitud de contexto no esta documentada; planificar el despliegue con contexto conservador y medir el consumo de cache KV.
- Aunque la licencia es Apache 2.0, conviene verificar las licencias de los modelos fusionados en el merge original, que pueden imponer restricciones adicionales.
- El repositorio ocupa 213,9 GB por incluir todas las cuantizaciones; descargar solo el fichero necesario.
- Las cuantizaciones Q2_K y Q3_K_M degradan la calidad de forma notable segun la propia model card; para produccion se recomienda Q4_K_M o superior.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Schattenblume-31B-GGUF
- Modelo base: https://huggingface.co/Nimbz/Schattenblume-31B
- Cuantizaciones imatrix del mismo modelo: https://huggingface.co/mradermacher/Schattenblume-31B-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Schattenblume-31B-GGUF
- Peticiones de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (ejemplo de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Grafica comparativa de cuantizaciones de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Empresa del cuantizador: https://www.nethype.de/
