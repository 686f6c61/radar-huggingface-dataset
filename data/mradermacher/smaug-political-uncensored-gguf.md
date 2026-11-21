# mradermacher/Smaug-Political-Uncensored-GGUF

## Resumen

Smaug-Political-Uncensored-GGUF es la distribucion en formato GGUF del modelo abacusai/Smaug-Political-Uncensored, publicada por el usuario mradermacher. El modelo original lo desarrolla Abacus.AI y se presenta como una variante afinada mediante DPO (Direct Preference Optimization) orientada a reducir el rechazo en conversaciones de tematica politica, manteniendo un comportamiento util y conversacional. Esta version concreta es una cuantizacion estatica del modelo base, pensada para ejecucion local con llama.cpp y derivados.

El modelo cuenta con 27.320.697.856 parametros totales (aproximadamente 27,3 mil millones), lo que lo situa en la gama de modelos densos de gran tamano aptos para despliegue en hardware de servidor o en configuraciones consumer de gama alta con cuantizaciones agresivas. El repositorio incluye un conjunto amplio de cuantizaciones (desde Q2_K hasta Q8_0) y ficheros mmproj, lo que sugiere soporte multimodal en el modelo base.

La relevancia de esta ficha radica en que permite evaluar rapidamente una opcion de inferencia local de un modelo afinado para uso conversacional sin censura en ambitos politicos, con licencia Apache 2.0 y compatibilidad con el ecosistema transformers y GGUF. No obstante, la informacion publica disponible sobre arquitectura detallada, datos de entrenamiento y benchmarks es limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo transformer denso, inferido del tamano; no confirmado en la informacion proporcionada) |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no es MoE segun los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj en Q8_0 y f16 |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo en la documentacion proporcionada. Por el numero de parametros (27,3 mil millones) y la naturaleza del pipeline (transformers, GGUF), se trata de un transformer denso, pero no se confirma en la informacion disponible si emplea atencion lineal, decodificacion especulativa u otras innovaciones. El modelo base abacusai/Smaug-Political-Uncensored se describe como un modelo afinado con DPO, segun las etiquetas del repositorio, lo que implica un proceso de alineacion por preferencias sobre un modelo preentrenado previo.

No se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases adicionales de RLHF mas alla del DPO. Tampoco se detalla la presencia de un modo de razonamiento explicito o de vision, aunque la existencia de ficheros mmproj en el repositorio de cuantizaciones sugiere que el modelo base incorpora un proyector multimodal, lo que apuntaria a capacidades de vision. Esta circunstancia no se confirma de forma explicita en la model card.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles y chino.
- Afinado mediante DPO para reducir rechazos en tematicas politicas y debates sensibles.
- Soporte de tool calling y function calling segun la etiqueta "agentic" del repositorio.
- Capacidades de agente y razonamiento multi-paso, segun la misma etiqueta.
- Soporte multimodal probable (ficheros mmproj incluidos), no confirmado explicitamente.
- Compatibilidad con endpoints y despliegue en infraestructura estandar de transformers.
- No se documenta un modo de pensamiento (thinking mode) explicito.

## Casos de uso

- Analisis de discurso politico: el modelo puede procesar y resumir textos de caracter politico sin activar rechazos por contenido sensible, lo que lo hace util para investigacion en ciencias sociales y analisis de medios.
- Generacion de contenido editorial y debate: adecuado para redactar borradores de articulos de opinion o guiones de debate donde se requiere tratar posturas controvertidas sin filtros excesivos.
- Asistente conversacional local: con cuantizaciones Q4_K_M (16,9 GB) puede desplegarse en estaciones de trabajo con GPU de 24 GB, ofreciendo privacidad al no requerir conexion a servicios externos.
- Simulacion de interlocutores para formacion: util para entrenar equipos de comunicacion politica o periodistas en escenarios de entrevista y confrontacion de ideas.
- Investigacion sobre alineacion y sesgos: permite estudiar como el DPO modifica la tasa de rechazo y la postura del modelo en temas politicos, comparandolo con variantes censuradas.
- Pipelines agenticos con tool calling: integrable en flujos que requieran consulta de fuentes externas y razonamiento multi-paso, gracias a la etiqueta agentic y al soporte de function calling.
- Procesamiento bilingue ingles-chino: util para tareas de traduccion o analisis de contenido politico en ambos idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 11 GB en Q2_K, 16-17 GB en Q4_K_M, 22,5 GB en Q6_K y 29 GB en Q8_0 (sin contar el contexto ni el proyector multimodal).
- GPU recomendadas: A100 40/80 GB o H100 para cuantizaciones altas y contexto largo; RTX 4090 (24 GB) para Q4_K_M o Q5_K_M; RTX 3090 (24 GB) para Q4_K_M.
- Cabe en GPU consumer: si, en RTX 4090/3090 con cuantizaciones Q4 o Q5; en GPUs de 16 GB solo con Q2_K o Q3_K_S y contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y otros frontends compatibles con GGUF; vLLM y TGI no soportan GGUF de forma nativa, por lo que requeririan el modelo base en safetensors.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Smaug-Political-Uncensored-GGUF | 27,3 B | no disponible | Apache 2.0 | GGUF | Afinado DPO, sin censura politica, en/zh |
| Modelos densos de ~27B de la misma familia (no identificados en la informacion) | no disponible | no disponible | no disponible | no disponible | no disponible |
| Alternativas GGUF de ~30B (no disponibles en la busqueda) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para una comparativa cuantitativa con modelos de la misma categoria. Se recomienda contrastar con variantes del modelo base en safetensors y con otros modelos densos de ~27B publicados en Hugging Face.

## Limitaciones y advertencias

- La ausencia de censura en tematicas politicas puede derivar en respuestas sesgadas, ofensivas o que reproduzcan discursos de odio; requiere supervision humana en produccion.
- Riesgo de alucinacion inherente a los modelos de lenguaje; mayor en temas de actualidad politica donde los datos de entrenamiento pueden estar desactualizados.
- La longitud de contexto no esta documentada, lo que dificulta planificar casos de uso con documentos largos.
- Soporte limitado a ingles y chino; el rendimiento en castellano no esta garantizado ni documentado.
- Aunque la licencia es Apache 2.0, el uso comercial de contenido politico generado puede estar sujeto a normativa local (por ejemplo, regulacion electoral o de desinformacion).
- El repositorio tiene 0 likes y 1085 descargas, lo que indica validacion comunitaria escasa; conviene evaluar el modelo en el caso de uso concreto antes de adoptarlo.
- La cuantizacion Q2_K y Q3_K_M pueden degradar notablemente la calidad; el autor recomienda Q4_K_S o Q4_K_M para un equilibrio entre velocidad y fidelidad.
- No se documentan sesgos especificos ni evaluaciones de seguridad del modelo base.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Smaug-Political-Uncensored-GGUF
- Modelo base: https://huggingface.co/abacusai/Smaug-Political-Uncensored
- Cuantizaciones ponderadas/imatrix: https://huggingface.co/mradermacher/Smaug-Political-Uncensored-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Smaug-Political-Uncensored-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- nethype GmbH: https://www.nethype.de/
