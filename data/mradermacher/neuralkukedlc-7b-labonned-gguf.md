# mradermacher/NeuralKukedlc-7B-Labonned-GGUF

## Resumen

NeuralKukedlc-7B-Labonned-GGUF es la version cuantizada en formato GGUF del modelo Kukedlc/NeuralKukedlc-7B-Labonned, un merge de modelos de 7B de parametros construido con mergekit (lazymergekit). El modelo resultante combina pesos de mlabonne/NeuralBeagle14-7B y mlabonne/NeuralHermes-2.5-Mistral-7B, ambos derivados de la familia Mistral. Las cuantizaciones las publica mradermacher, un autor conocido por producir versiones GGUF de modelos comunitarios para su uso con llama.cpp y herramientas compatibles.

El modelo base tiene 7.241.732.096 parametros (aproximadamente 7,24B) y esta pensado para generacion de texto conversacional en ingles. Al ser un merge de dos modelos afinados para instrucciones y conversacion, hereda capacidades de dialogo, razonamiento basico y generacion de codigo propias de la familia Mistral 7B, aunque sin garantias de rendimiento especificas documentadas por el autor del merge.

La relevancia de esta ficha radica en que ofrece el modelo en multiples niveles de cuantizacion (desde Q2_K de 2,8 GB hasta f16 de 14,6 GB), lo que permite desplegarlo en hardware de consumo. Es un ejemplo tipico de modelo comunitario de nicho: pocas descargas (44 en el momento de la consulta) y escasa documentacion tecnica, lo que obliga a tratar sus capacidades con cautela y a validarlo empiricamente antes de usarlo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Mistral 7B, via merge) |
| Parametros totales | 7.241.732.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Mistral 7B soporta 32.768 tokens, pero no se confirma para este merge) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo es un merge de pesos realizado con mergekit (lazymergekit) a partir de mlabonne/NeuralBeagle14-7B y mlabonne/NeuralHermes-2.5-Mistral-7B. No se trata de un entrenamiento desde cero ni de un fine-tuning adicional documentado, sino de una combinacion de pesos de dos modelos ya existentes. La arquitectura subyacente es la de Mistral 7B: un transformer decoder-only con atencion de ventana deslizante (sliding window attention) y 32 capas, aunque la model card no detalla la configuracion exacta del merge ni la estrategia de combinacion (por ejemplo, si es SLERP, TIES o linear).

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO en el modelo resultante. Las capacidades conversacionales provienen de los modelos de origen: NeuralHermes-2.5-Mistral-7B es un fine-tuning de Mistral 7B con DPO sobre el dataset de OpenHermes-2.5, y NeuralBeagle14-7B es a su vez un merge orientado a instrucciones. El resultado es un modelo conversacional en ingles sin innovaciones tecnicas documentadas mas alla del propio merge.

## Capacidades

- Generacion de texto conversacional en ingles, orientada a dialogos multi-turno.
- Razonamiento basico y respuesta a instrucciones, heredado de los modelos de origen afinados con instrucciones.
- Generacion de codigo, en la medida en que los modelos base (Mistral 7B y sus derivados) la soportan; no hay evaluacion especifica para este merge.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado; no se debe asumir.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Prototipado de chatbots conversacionales en ingles: el modelo puede gestionar dialogos multi-turno basicos y sirve para validar flujos de conversacion antes de invertir en modelos mayores. Su tamano de 7B y las cuantizaciones Q4 permiten iterar en local.
- Despliegue en hardware de consumo para pruebas: con cuantizaciones Q4_K_M (4,5 GB) o Q5_K_M (5,2 GB) cabe en GPUs de 8 GB de VRAM, lo que lo hace adecuado para entornos de desarrollo sin infraestructura dedicada.
- Generacion de texto asistida en ingles: redaccion de borradores, resumenes y respuestas a preguntas simples donde no se requiera maxima precision y se priorice coste bajo.
- Educacion y experimentacion con merges: util para estudiar el comportamiento de modelos fusionados con mergekit y comparar cuantizaciones frente al modelo base en safetensors.
- Integracion en pipelines de llama.cpp u Ollama: al estar en GGUF, se puede servir con llama.cpp, Ollama o herramientas compatibles para aplicaciones de escritorio o edge.
- Filtrado y clasificacion de texto en ingles: tareas de etiquetado o extraccion simple donde un modelo de 7B cuantizado ofrece latencia aceptable en CPU o GPU modesta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion: Q2_K ~2,8 GB; Q3_K_M ~3,6 GB; IQ4_XS ~4,0 GB; Q4_K_M ~4,5 GB; Q5_K_M ~5,2 GB; Q6_K ~6,0 GB; Q8_0 ~7,8 GB; f16 ~14,6 GB. A estas cifras hay que sumar el overhead de contexto y del runtime.
- GPU recomendadas: para f16, una GPU con 16-24 GB (RTX 4090, A100 40 GB); para Q8_0, 10-12 GB (RTX 3080/4080); para Q4_K_M, 8 GB (RTX 3060 Ti, RTX 4060 Ti); para Q2_K, 4-6 GB.
- Cabe en GPU de consumo: si, en la mayoria de cuantizaciones Q4 y Q5 en GPUs de 8 GB, y en Q2/Q3 en GPUs de 4-6 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF. El modelo base en safetensors puede servirse con vLLM o TGI, aunque esta ficha cubre la version GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| NeuralKukedlc-7B-Labonned-GGUF (este) | 7,24B | no disponible | apache-2.0 | GGUF | Merge comunitario, solo ingles, escasa documentacion |
| Mistral-7B-Instruct-v0.2 | 7,24B | 32.768 | apache-2.0 | safetensors, GGUF | Modelo oficial de Mistral AI, ampliamente validado |
| NeuralHermes-2.5-Mistral-7B | 7,24B | 32.768 (segun base) | apache-2.0 | safetensors, GGUF | Uno de los modelos de origen del merge, afinado con DPO |
| NeuralBeagle14-7B | 7,24B | 32.768 (segun base) | apache-2.0 | safetensors, GGUF | Otro de los modelos de origen, merge orientado a instrucciones |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al derivar de modelos entrenados con datos web, es probable que herede sesgos de esos corpus, pero no hay analisis publicado.
- Riesgo de alucinacion: alto en un modelo de 7B sin evaluacion especifica; no se debe confiar en sus respuestas factuales sin verificacion.
- Limitaciones de contexto e idioma: solo ingles segun la model card; la longitud de contexto efectiva del merge no esta confirmada y podria diferir de los 32.768 tokens del Mistral base.
- Restricciones de licencia: apache-2.0 permite uso comercial, pero conviene revisar las licencias de los modelos de origen y del propio merge (Kukedlc/NeuralKukedlc-7B-Labonned) por si imponen condiciones adicionales.
- Caveat para produccion: con solo 44 descargas y 1 like, es un modelo de nicho sin validacion comunitaria; no se recomienda para produccion sin una evaluacion empirica previa en las tareas objetivo.
- La model card no documenta la estrategia de merge ni hiperparametros, lo que dificulta reproducir o auditar el modelo.

## Enlaces

- Hugging Face (esta version GGUF): https://huggingface.co/mradermacher/NeuralKukedlc-7B-Labonned-GGUF
- Modelo base: https://huggingface.co/Kukedlc/NeuralKukedlc-7B-Labonned
- Cuantizaciones weighted/imatrix: https://huggingface.co/mradermacher/NeuralKukedlc-7B-Labonned-i1-GGUF
- Pagina de resumen del autor: https://hf.tst.eu/model#NeuralKukedlc-7B-Labonned-GGUF
- Modelo de origen 1: https://huggingface.co/mlabonne/NeuralBeagle14-7B
- Modelo de origen 2: https://huggingface.co/mlabonne/NeuralHermes-2.5-Mistral-7B
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
