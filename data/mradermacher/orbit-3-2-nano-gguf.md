# mradermacher/Orbit-3.2-Nano-GGUF

## Resumen

Orbit-3.2-Nano-GGUF es la version cuantizada en formato GGUF del modelo OpenPathAI/Orbit-3.2-Nano, publicada por el usuario mradermacher. Se trata de un modelo de generacion de texto de aproximadamente 2.697 millones de parametros (2,7B), afinado mediante SFT sobre el dataset Irza/Dodol-15k-Indonesia, con orientacion a instrucciones, razonamiento y question answering cerrado (closed-qa). La model card del repositorio no describe la arquitectura ni los datos de entrenamiento originales; los tags incluyen "lfm2.5" y "liquid", lo que apunta a la familia Liquid Foundation Models, aunque este extremo no esta confirmado por el autor de la ficha.

El repositorio no aporta un modelo nuevo: es un trabajo de cuantizacion estatica sobre el modelo base, con 12 variantes que van desde Q2_K (1,2 GB) hasta f16 (5,5 GB). El interes practico esta en que permite ejecutar un modelo afinado para indonesio e ingles en hardware muy modesto, incluyendo CPU y GPU de gama de entrada, algo relevante para despliegues en edge, entornos sin GPU dedicada o aplicaciones con requisitos estrictos de coste y latencia.

La licencia es Apache 2.0, heredada del modelo base, lo que facilita el uso comercial sin las restricciones tipicas de otras licencias de modelos abiertos. El repo acumula 246 descargas y ningun "like" en el momento de redactar esta ficha, y no se han publicado resultados de benchmarks ni mediciones de latencia o throughput.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en la model card; los tags del repositorio indican "lfm2.5" y "liquid" (familia Liquid Foundation Models), dato no confirmado por el autor |
| Parametros totales | 2.697.198.592 (~2,7B) |
| Parametros activos | no aplica / no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 (12 variantes) |
| Idiomas soportados | indonesio (id), ingles (en) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (el modelo base se distribuye originalmente en safetensors) |
| Modelo base | OpenPathAI/Orbit-3.2-Nano |
| Dataset de ajuste | Irza/Dodol-15k-Indonesia |
| Tamano del repositorio | 24,3 GB (suma de todas las variantes) |
| Pipeline | text-generation |
| Cuantizaciones ponderadas / imatrix | no disponibles; el autor indica que no las tiene planificadas por el momento |
| Descargas / likes | 246 / 0 |
| Fecha de creacion | 2026-10-13 (segun metadatos de HuggingFace) |

Detalle de variantes y tamano en disco:

| Tipo | Tamano (GB) | Nota del autor |
|---|---:|---|
| Q2_K | 1,2 | |
| Q3_K_S | 1,4 | |
| Q3_K_M | 1,5 | calidad inferior |
| Q3_K_L | 1,6 | |
| IQ4_XS | 1,6 | |
| Q4_K_S | 1,7 | rapida, recomendada |
| Q4_K_M | 1,8 | rapida, recomendada |
| Q5_K_S | 2,0 | |
| Q5_K_M | 2,0 | |
| Q6_K | 2,3 | muy buena calidad |
| Q8_0 | 3,0 | rapida, mejor calidad |
| f16 | 5,5 | 16 bpw, sobredimensionada |

## Arquitectura y entrenamiento

La informacion publicada no detalla la arquitectura del modelo base. La model card se limita a indicar que se trata de cuantizaciones estaticas de OpenPathAI/Orbit-3.2-Nano y a listar los tipos de cuantizacion generados. Los tags del repositorio incluyen "lfm2.5", "liquid", "fine-tuned", "sft", "instruction-tuning", "closed-qa" y "reasoning", lo que sugiere un ajuste supervisado sobre un modelo de la familia LFM de Liquid AI, pero el autor de la cuantizacion no aporta detalles sobre capas, tipo de atencion, ventana de contexto ni estrategia de decodificacion. Tampoco se indica si el modelo base emplea atencion hibrida o algun mecanismo de estado recurrente, algo habitual en esa familia.

En cuanto al entrenamiento, el unico dato disponible es el dataset de ajuste, Irza/Dodol-15k-Indonesia, un conjunto de aproximadamente 15.000 ejemplos en indonesio. No hay informacion sobre el numero de tokens de preentrenamiento, la composicion del corpus, la existencia de fases de RLHF o DPO, ni sobre tecnicas de optimizacion como decodificacion especulativa. Las cuantizaciones son estaticas (no ponderadas ni generadas con matriz de importancia), lo que en la propia tabla del autor se refleja en la recomendacion de Q4_K_S o Q4_K_M como compromiso entre tamano y calidad.

## Capacidades

- Generacion de texto conversacional: el repositorio esta etiquetado como "conversational", por lo que admite dialogos multi-turno con formato de chat.
- Seguimiento de instrucciones: el tag "instruction-tuning" y el dataset de ajuste SFT indican entrenamiento especifico para responder a instrucciones.
- Razonamiento: el tag "reasoning" sugiere capacidad de razonamiento explicito, aunque no se documenta ningun modo "thinking" ni formato de cadena de pensamiento.
- Question answering cerrado: el tag "closed-qa" indica que el modelo esta orientado a responder preguntas sobre un contexto o corpus acotado, sin recuperacion externa.
- Bilinguismo indonesio-ingles: los idiomas declarados son id y en. No hay declaracion de soporte para castellano, catalan, gallego, euskera ni otros idiomas.
- Tool calling / function calling: no disponible. No se menciona en la model card ni en los tags.
- Capacidades de agente y razonamiento multi-paso: no disponible. No hay documentacion al respecto.
- Vision, audio u otras modalidades: no disponibles. No se hace referencia a "mmproj" en las cuantizaciones, lo que apunta a un modelo exclusivamente de texto.
- Formato de pesos compatible con el ecosistema GGUF: permite uso directo en llama.cpp, Ollama y otros runners compatibles.

## Casos de uso

- Atencion al cliente en indonesio: el modelo esta afinado especificamente sobre un dataset en indonesio y admite conversaciones multi-turno, por lo que puede gestionar consultas frecuentes en ese idioma con un coste de inferencia muy bajo (1,7 GB en Q4_K_S) y desplegarse en un contenedor sin GPU.
- Clasificacion y extraccion de informacion en lotes: al pesar menos de 2 GB en Q4 y poder ejecutarse en CPU, es adecuado para procesar grandes volumenes de tickets, resenas o documentos en indonesio clasificandolos por categoria o extrayendo campos concretos.
- QA sobre documentacion interna: el tag "closed-qa" encaja con escenarios de preguntas y respuestas sobre un conjunto de documentos cerrado, integrado en un pipeline RAG que aporte el contexto en el prompt.
- Asistente local en dispositivos con recursos limitados: con 1,2-1,8 GB en cuantizaciones Q2 a Q4, puede ejecutarse en mini-PC, portatiles sin GPU dedicada o dispositivos con 4-8 GB de RAM, util para aplicaciones de asistencia offline y con requisitos de privacidad (los datos no salen del dispositivo).
- Generacion de respuestas en aplicaciones de mensajeria para el mercado indonesio: su bilinguismo id/en y su tamano reducido permiten respuestas con latencia baja en entornos moviles o embebidos.
- Traduccion asistida indonesio-ingles: aunque no se declara explicitamente una tarea de traduccion, el soporte bilingue permite usarlo para borradores de traduccion y post-edicion en flujos internos.
- Prototipado rapido y evaluacion de pipelines: dado su tamano, es util como modelo de prueba para validar infraestructura de inferencia (llama.cpp, Ollama, servidores OpenAI-compatibles) antes de escalar a modelos mayores.
- Ajuste fino posterior: al ser Apache 2.0 y estar en GGUF, el modelo base puede cuantizarse de nuevo o usarse como punto de partida, aunque el ajuste fino adicional requiere trabajar sobre los pesos safetensors del modelo original, no sobre el GGUF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de mradermacher no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y tampoco hay mediciones de perplexity por tipo de cuantizacion. El autor enlaza unicamente a un grafico comparativo generico de calidad entre tipos de cuantizacion (elaborado por ikawrakow) y a unas notas de Artefact2 sobre el tema, que no son especificos de este modelo.

## Requisitos de hardware

Estimaciones de VRAM/RAM para inferencia con llama.cpp, asumiendo overhead de contexto moderado (no son mediciones publicadas):

| Cuantizacion | Peso en disco | Memoria estimada en ejecucion |
|---|---:|---:|
| Q2_K | 1,2 GB | ~2 GB |
| Q3_K_M | 1,5 GB | ~2,3 GB |
| Q4_K_S / Q4_K_M | 1,7-1,8 GB | ~2,5-3 GB |
| Q5_K_M | 2,0 GB | ~3 GB |
| Q6_K | 2,3 GB | ~3,3 GB |
| Q8_0 | 3,0 GB | ~4 GB |
| f16 | 5,5 GB | ~6,5 GB |

- Cabe en GPU de consumo: si. Cualquier GPU con 4 GB o mas de VRAM puede ejecutar Q4_K_M o Q8_0; una RTX 3060 de 12 GB, RTX 4060, RTX 4070 o RTX 4090 lo ejecutan con holgura y permiten contextos amplios si el modelo los soporta.
- Ejecucion en CPU: viable. Con 4-8 GB de RAM se puede ejecutar Q4_K_M; es un escenario realista para servidores sin GPU o despliegues en edge.
- GPU de centro de datos (A100, H100, L40S): compatibles pero desproporcionadas para un modelo de 2,7B; el cuello de botella seria la latencia de red, no el computo.
- Opciones de despliegue: llama.cpp (llama-server), Ollama, LM Studio, llama-cpp-python y cualquier runtime compatible con GGUF. vLLM tiene soporte de GGUF limitado y no es la via recomendada; TGI no da soporte a GGUF. La model card no incluye plantilla de prompt ni instrucciones de uso especificas mas alla de remitir a los README de TheBloke.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo para ninguna de las cuantizaciones.

## Comparativa con modelos similares

No hay datos de rendimiento publicados de Orbit-3.2-Nano, por lo que la comparacion solo puede hacerse a nivel estructural. Los valores de los modelos alternativos corresponden a conocimiento general y no se han verificado en la busqueda realizada.

| Modelo | Parametros | Contexto | Licencia | Idiomas | Formato disponible |
|---|---|---|---|---|---|
| Orbit-3.2-Nano (este repo, GGUF) | ~2,7B | no disponible | Apache 2.0 | id, en | GGUF |
| Qwen2.5-3B-Instruct | ~3,1B | 32k | Apache 2.0 (la mayoria de variantes) | multilingue amplio | safetensors, GGUF |
| Llama-3.2-3B-Instruct | ~3,2B | 128k | Llama 3.2 Community License | multilingue (8 idiomas declarados) | safetensors, GGUF |
| Gemma-2-2B-it | ~2,6B | 8k | Gemma Terms of Use | principalmente ingles | safetensors, GGUF |

Diferencias relevantes: frente a Qwen2.5-3B o Llama-3.2-3B, este modelo es mucho mas especifico en cobertura idiomatica (solo indonesio e ingles) y no publica contexto soportado ni benchmarks, mientras que las alternativas tienen documentacion tecnica extensa y evaluaciones publicas. En contrapartida, la licencia Apache 2.0 es mas permisiva que la de Llama 3.2 o Gemma 2 para uso comercial sin condiciones adicionales.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay ninguna metrica publicada que permita estimar la calidad real del modelo frente a alternativas de tamano similar.
- Longitud de contexto desconocida: al no declararse, no se puede garantizar el comportamiento en conversaciones largas ni en tareas de QA con contextos extensos. Cualquier uso con prompts largos requiere validacion previa.
- Cobertura idiomatica muy limitada: solo indonesio e ingles. No hay soporte declarado de castellano, por lo que su uso en aplicaciones en espanol no esta respaldado por el autor.
- Riesgo de alucinacion: como cualquier modelo de 2,7B, la tasa de invencion en tareas de QA cerrado o de razonamiento es previsiblemente alta, especialmente en cuantizaciones agresivas (Q2_K, Q3_K_S, Q3_K_M). El autor marca explicitamente Q3_K_M como "calidad inferior".
- Cuantizaciones estaticas: no hay variantes ponderadas ni generadas con matriz de importancia, que suelen ofrecer mejor relacion calidad/tamano en los rangos bajos. No estan planificadas segun el autor.
- Rendimiento degradado en cuantizaciones muy bajas: Q2_K y Q3_K_S pueden producir respuestas incoherentes o repetitivas. Para uso en produccion se recomienda Q4_K_M o superior.
- Sin soporte confirmado de tool calling ni de agentes: no se documenta ningun formato de function calling, lo que descarta integraciones con frameworks de agentes que dependan de esa capacidad.
- Licencia: Apache 2.0, permisiva para uso comercial. Se recomienda verificar tambien la licencia del modelo base OpenPathAI/Orbit-3.2-Nano y las condiciones del dataset Irza/Dodol-15k-Indonesia antes de un despliegue comercial.
- Plantilla de prompt no documentada: la model card no incluye el formato de chat esperado, lo que puede provocar degradacion de resultados si se usa el formato equivocado.
- Metadatos llamativos: la fecha de creacion indicada (2026-10-13) y el bajo numero de descargas (246) y likes (0) hacen recomendable tratar esta publicacion como reciente y poco validada por la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Orbit-3.2-Nano-GGUF
- Modelo base: https://huggingface.co/OpenPathAI/Orbit-3.2-Nano
- Dataset de ajuste: https://huggingface.co/datasets/Irza/Dodol-15k-Indonesia
- Pagina de resumen de cuantizaciones del autor: https://hf.tst.eu/model#Orbit-3.2-Nano-GGUF
- Peticiones de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Perfil del autor: https://huggingface.co/mradermacher
- Grafico comparativo de calidad entre tipos de cuantizacion: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- README de referencia sobre uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
