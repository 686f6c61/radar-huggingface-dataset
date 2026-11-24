# mradermacher/Arcadia-12B-Fusion-GGUF

## Resumen
Arcadia-12B-Fusion-GGUF es la distribucion en formato GGUF del modelo Arcadia-12B-Fusion, un merge de modelos de 12.247.802.880 parametros (aproximadamente 12,25 mil millones) creado por el usuario SvalTek y cuantizado por mradermacher. El modelo original se genero mediante lazymergekit, una herramienta de fusion de pesos que combina las matrices de varios modelos base para producir un unico checkpoint sin reentrenamiento adicional. Esta version GGUF esta pensada para inferencia eficiente en CPU y GPU de consumo mediante llama.cpp y sus derivados.

La relevancia de esta ficha radica en que el modelo original no cuenta con una model card tecnica detallada: se desconoce la composicion exacta del merge, los datos de entrenamiento y los resultados de evaluacion. La informacion disponible se limita a los metadatos de Hugging Face y a la model card del cuantizador, que documenta los tipos de cuantizacion y los tamanos de archivo. Por tanto, esta ficha describe con rigor lo que se sabe y marca explicitamente como "no disponible" todo aquello que no consta en la informacion proporcionada.

El modelo esta etiquetado unicamente para ingles y como conversacional, con compatibilidad con endpoints. Su licencia no esta declarada en la informacion disponible, lo que supone una advertencia importante para cualquier uso comercial. El repositorio ocupa 84,7 GB e incluye once variantes de cuantizacion estatica, desde Q2_K hasta Q8_0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (merge de modelos mediante lazymergekit; detalles no disponibles) |
| Parametros totales | 12.247.802.880 (aproximadamente 12,25 mil millones) |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estaticas); variantes imatrix en repositorio separado |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento
El modelo es el resultado de un merge de pesos realizado con lazymergekit, una herramienta que combina los tensores de varios modelos base para producir un checkpoint fusionado. No se dispone de informacion sobre que modelos concretos se fusionaron, con que metodo (por ejemplo, SLERP, TIES, DARE o linear) ni con que hiperparametros. Tampoco consta que se haya realizado un entrenamiento adicional, ajuste fino, RLHF o DPO sobre el merge; la model card del cuantizador no menciona ninguna fase de post-entrenamiento.

Al tratarse de un merge, no hay datos de entrenamiento propios: la composicion del dataset, el numero de tokens y las tecnicas de alineacion dependen de los modelos originales fusionados, que no se identifican en la informacion disponible. La unica innovacion tecnica documentada es el propio proceso de cuantizacion estatica realizado por mradermacher, que incluye variantes IQ y una version separada con cuantizacion ponderada por imatrix para mayor calidad.

## Capacidades
- Generacion de texto conversacional: el modelo esta etiquetado como "conversational" y "text-generation" en Hugging Face.
- Razonamiento y respuesta a instrucciones: capacidad esperable en un modelo de 12B orientado a chat, aunque no hay evaluaciones que lo confirmen.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma del repositorio.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.
- Compatibilidad con endpoints: el repositorio incluye la etiqueta endpoints_compatible.

## Casos de uso
- Prototipado de asistentes conversacionales en ingles: el modelo puede desplegarse con llama.cpp u Ollama para validar flujos de chat multi-turno en local antes de invertir en infraestructura mayor. Su tamano de 12B y las cuantizaciones Q4 lo hacen manejable en equipos de desarrollo.
- Experimentacion con merges de modelos: investigadores interesados en evaluar la calidad de fusiones de pesos pueden usar este checkpoint como caso de estudio, comparando sus respuestas con las de los modelos base (que habria que identificar previamente, ya que no constan).
- Inferencia en CPU: las variantes Q2_K (4,9 GB) y Q3_K_S (5,6 GB) permiten ejecutar el modelo en maquinas sin GPU dedicada, util para pruebas de integracion o demos de bajo coste.
- Generacion de texto offline y privacidad: al poder ejecutarse localmente con llama.cpp, el modelo sirve para procesar texto sensible sin enviar datos a servicios externos, siempre que el caso de uso no requiera garantias de calidad que no estan verificadas.
- Fine-tuning posterior sobre dominio especifico: al partir de un checkpoint de 12B en safetensors (modelo base), es posible aplicar LoRA o QLoRA para adaptarlo a una tarea concreta, aunque la licencia no declarada obliga a aclarar antes los terminos de uso.
- Despliegue en entornos con GPU de consumo: las cuantizaciones Q4_K_M (7,6 GB) y Q5_K_M (8,8 GB) caben en GPUs con 12-16 GB de VRAM, lo que facilita montar un servicio de generacion de texto de baja latencia en estaciones de trabajo.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: aproximadamente 5-6 GB con Q2_K, 7-8 GB con Q4_K_M, 9-10 GB con Q5_K_M y 13-14 GB con Q8_0 (estimaciones a partir del tamano de archivo; no confirmadas por el autor).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para cuantizaciones Q4-Q8; A100 o H100 para despliegues de mayor throughput o precision completa.
- Cabe en GPU de consumo: si, en modelos con 8 GB o mas de VRAM usando cuantizaciones Q4 o inferiores; las variantes Q2 y Q3 pueden ejecutarse incluso en CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF; el modelo base en safetensors puede servirse con vLLM o TGI, aunque no se documenta soporte explicito.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Arcadia-12B-Fusion-GGUF | 12,25B | no disponible | no disponible | GGUF | Merge via lazymergekit, solo ingles |
| Mistral-Nemo-12B | 12B | 128K (segun su model card publica) | Apache 2.0 | safetensors, GGUF | Modelo base ampliamente usado, multilingue |
| Gemma-2-9B | 9B | 8K | Gemma Terms | safetensors, GGUF | Alternativa de Google con licencia restrictiva |
| Qwen2.5-14B | 14B | 32K o superior | Apache 2.0 | safetensors, GGUF | Multilingue, buen rendimiento en codigo y matematicas |

La comparativa es orientativa: no se dispone de datos de rendimiento de Arcadia-12B-Fusion que permitan una comparacion cuantitativa con estas alternativas.

## Limitaciones y advertencias
- Licencia no declarada: no se puede asumir permiso para uso comercial; es imprescindible contactar con el autor del modelo base (SvalTek) antes de cualquier despliegue productivo.
- Model card practicamente inexistente: se desconocen los modelos fusionados, el metodo de merge y los hiperparametros, lo que impide evaluar la procedencia y calidad de los pesos.
- Solo ingles: no hay soporte declarado para castellano ni otros idiomas.
- Riesgo de alucinacion: sin evaluaciones publicadas, no hay evidencia sobre la fiabilidad factual del modelo; debe tratarse con las precauciones habituales en produccion.
- Sesgos desconocidos: al no identificarse los datos de entrenamiento de los modelos base, no es posible evaluar sesgos de genero, raza, ideologia u otros.
- Longitud de contexto desconocida: no se puede garantizar el manejo de conversaciones o documentos largos.
- Merge sin validacion publica: los merges de pesos pueden degradar capacidades respecto a los modelos originales; se recomienda evaluar tareas concretas antes de adoptarlo.
- Repositorio de gran tamano (84,7 GB): la descarga completa de todas las cuantizaciones es costosa; conviene descargar solo la variante necesaria.

## Enlaces
- Repositorio GGUF: https://huggingface.co/mradermacher/Arcadia-12B-Fusion-GGUF
- Modelo base: https://huggingface.co/SvalTek/Arcadia-12B-Fusion
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Arcadia-12B-Fusion-i1-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Arcadia-12B-Fusion-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
