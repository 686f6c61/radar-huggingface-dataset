# naripon/qwen35-08b-rag-ja-E

## Resumen

qwen35-08b-rag-ja-E es un ajuste fino de Qwen/Qwen3.5-0.8B, desarrollado por el usuario naripon, orientado especificamente a tareas de generacion aumentada por recuperacion (RAG) en japones. El modelo recibe como entrada un conjunto de documentos recuperados (hasta diez fragmentos) y devuelve una respuesta corta junto con el identificador del fragmento que la sustenta, en formato JSON. Se trata, por tanto, de un modelo especializado en respuesta extractiva con atribucion de fuentes, no de un asistente generalista.

El linaje es relevante para entender su comportamiento: parte del modelo base Qwen3.5-0.8B (licencia Apache-2.0) y se construye en dos fases. Primero se entrena naripon/qwen35-08b-rag-ja-A sobre datos de RAG en japones; despues, sobre ese modelo A se aplica un ajuste adicional con LoRA que posteriormente se fusiona en los pesos finales, dando lugar a esta variante E. El entrenamiento se centra en preguntas de tipo multi-hop, es decir, aquellas cuya respuesta exige encadenar dos hechos distintos.

Con 873 millones de parametros, el modelo esta pensado para desplegarse en entornos con recursos limitados, incluida inferencia en CPU o en GPUs de consumo. Su relevancia actual radica en la creciente demanda de componentes pequenos y especializados dentro de arquitecturas RAG: en lugar de emplear un modelo grande para sintetizar respuestas sobre documentos, esta variante asume esa funcion concreta con un coste computacional muy bajo y con salida estructurada verificable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de Qwen3.5-0.8B, familia Qwen3.5) |
| Parametros totales | 873.438.784 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | japones (ja) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del transformer de Qwen3.5-0.8B, si bien la model card no detalla la configuracion interna (numero de capas, dimensiones ocultas, mecanismo de atencion ni longitud de contexto nativa). Lo que si se documenta es el proceso de ajuste: se parte de la revision 2fc06364715b967f1860aea9cf38778875588b17 del modelo base, se entrena el modelo intermedio naripon/qwen35-08b-rag-ja-A (revision c3a81e047b5d70bfb168c43573eb802ce744fab7) y sobre este se aplica un segundo ajuste con LoRA que se fusiona en los pesos finales.

Los datos de entrenamiento de esta variante E provienen de JEMHopQA, un conjunto de preguntas multi-hop en japones (CC BY-SA 4.0) creado por Ishii et al., cruzado con el conjunto de fragmentos distribuidos derivados de Wikipedia en japones. El filtrado es mecanico: solo se conservan las preguntas cuyos diez primeros resultados de recuperacion contienen la cadena de respuesta, y cada ejemplo se formatea con la respuesta y el chunk_id de respaldo en JSON. La recuperacion se realizo con un pipeline especifico compuesto por Ruri v3 310m como retriever, Ruri v3 reranker 310m como reordenador y BM25. La model card indica explicitamente que no se emplearon los problemas del concurso asociado. No se documenta el volumen de tokens de entrenamiento, la composicion completa del dataset ni si hubo fases de RLHF o DPO.

## Capacidades

- Generacion de respuestas cortas y extractivas sobre documentos recuperados en japones.
- Salida estructurada en JSON con dos campos: la respuesta y el chunk_id del fragmento que la sustenta.
- Razonamiento multi-hop: capaz de encadenar dos hechos para responder preguntas que no se resuelven con un unico fragmento.
- Atribucion de fuentes: vincula cada respuesta a uno de los diez fragmentos de entrada, lo que facilita la verificacion.
- Procesamiento de hasta diez documentos de contexto por consulta, segun el formato de entrenamiento.
- Especializacion linguistica en japones; no se documenta soporte funcional de otros idiomas.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Busqueda documental con atribucion en japones: el modelo recibe los diez fragmentos recuperados por un retriever y devuelve una respuesta breve junto al identificador del fragmento fuente, lo que permite mostrar al usuario la cita exacta y auditar la respuesta.
- Preguntas multi-hop sobre bases de conocimiento corporativas: al haberse entrenado especificamente con preguntas que requieren encadenar dos hechos, resulta adecuado para consultas del tipo "quien fundo la empresa que desarrollo el producto X", donde la respuesta no esta en un unico documento.
- Asistencia interna sobre wikis y manuales: con un pipeline BM25 o Ruri v3 delante, puede sintetizar respuestas sobre documentacion tecnica en japones manteniendo la trazabilidad al fragmento original.
- Verificacion automatizada de respuestas: al devolver el chunk_id, un sistema posterior puede comprobar que la respuesta aparece en el fragmento citado, lo que reduce el coste de validacion en flujos de control de calidad.
- Despliegue en entornos con recursos limitados: con menos de mil millones de parametros, puede ejecutarse en CPU o en GPUs de consumo, lo que lo hace viable para servicios internos de bajo trafico o para prototipos sin infraestructura dedicada.
- Evaluacion de pipelines de recuperacion: dado que el modelo fue entrenado con un pipeline concreto (Ruri v3 310m, Ruri v3 reranker 310m y BM25), sirve como componente fijo para medir el impacto de cambios en el retriever sin que varie el generador.
- Extraccion de respuestas en procesos de anotacion: su salida JSON con chunk_id facilita la generacion semiautomatica de conjuntos de datos de QA con evidencia, reutilizables para entrenar o evaluar otros modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en precision completa (fp32) los 873 millones de parametros ocupan aproximadamente 3,5 GB; en bf16/fp16, unos 1,75 GB; en cuantizacion de 8 bits, alrededor de 0,9 GB; en 4 bits, en torno a 0,5 GB. Estas cifras son estimaciones por tamano y no proceden de mediciones publicadas por el autor.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede alojar el modelo en bf16 con margen para el contexto; una RTX 3060, RTX 4060, RTX 4090, A100 o H100 son sobradamente suficientes. Para lotes grandes, las GPU de centro de datos aportan mas margen.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU discreta moderna con 4 GB o mas de VRAM, y tambien en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: al publicarse solo en safetensors, los marcos habituales son Transformers, vLLM y TGI. Para llama.cpp u Ollama seria necesario convertir los pesos a GGUF, algo que el autor no documenta.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma principal | Licencia | Formato |
|---|---|---|---|---|---|
| qwen35-08b-rag-ja-E | 873 M | no disponible | japones | Apache-2.0 | safetensors |
| Qwen/Qwen3.5-0.8B (modelo base) | ~0,8 B | no disponible | multilingue | Apache-2.0 | safetensors |
| naripon/qwen35-08b-rag-ja-A (modelo intermedio) | ~0,8 B | no disponible | japones | Apache-2.0 (heredada) | safetensors |

La comparacion con alternativas de terceros no esta disponible en la informacion proporcionada. Frente al modelo base, esta variante intercambia generalidad por especializacion: gana en adherencia al formato JSON y en atribucion de fuentes para RAG en japones, pero previsiblemente pierde en tareas genericas de conversacion, codigo o matematicas, para las que no fue ajustado.

## Limitaciones y advertencias

- Dominio restringido: el ajuste se limita a preguntas multi-hop con diez fragmentos de entrada y salida JSON; fuera de ese formato el comportamiento no esta garantizado.
- Idioma: solo se documenta japones. El rendimiento en castellano u otros idiomas no esta evaluado y probablemente sea deficiente.
- Alucinacion: aunque el modelo devuelve un chunk_id, no hay garantia de que la respuesta aparezca literalmente en el fragmento citado; es recomendable validar la cita en produccion.
- Dependencia del pipeline de recuperacion: se entreno con Ruri v3 310m, Ruri v3 reranker 310m y BM25; con otros retrievers la distribucion de entrada puede diferir y degradar el rendimiento.
- Sesgos: los derivados de JEMHopQA y de Wikipedia en japones, incluidas posibles lagunas de cobertura y sesgos de representacion del corpus.
- Licencia: Apache-2.0 permite uso comercial, pero los datos de entrenamiento estan bajo CC BY-SA 4.0 (JEMHopQA y fragmentos de Wikipedia), lo que conviene revisar si se redistribuye el modelo o se exige atribucion en productos derivados.
- Madurez: el repositorio no registra descargas ni interacciones, y no hay benchmarks publicados; conviene tratarlo como experimental.
- Contexto: la longitud de contexto nativa no esta documentada, lo que impide planificar con precision el tamano maximo de los diez fragmentos de entrada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/naripon/qwen35-08b-rag-ja-E
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Modelo intermedio: https://huggingface.co/naripon/qwen35-08b-rag-ja-A
- JEMHopQA (repositorio): https://github.com/aiishii/JEMHopQA
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
