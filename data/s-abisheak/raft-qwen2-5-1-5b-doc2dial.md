# S-ABISHEAK/raft-qwen2.5-1.5b-doc2dial

## Resumen

RAFT-Qwen2.5-1.5B-Doc2Dial es un ajuste fino del modelo Qwen2.5-1.5B-Instruct desarrollado por S-ABISHEAK, orientado a la generacion de respuestas de atencion al cliente fundamentadas en documentos. El modelo emplea la tecnica RAFT (Retrieval-Augmented Fine-Tuning, Zhang et al., 2024), que entrena al modelo para responder citando pasajes de documentos recuperados y conviviendo con distractores, en lugar de asumir que el contexto recuperado siempre contiene la respuesta correcta. El entrenamiento se realizo con QLoRA sobre una unica GPU Tesla T4 de 16 GB, utilizando el corpus Doc2Dial de IBM, compuesto por dialogos de soporte de servicios publicos estadounidenses (Seguridad Social, Asuntos de Veteranos, DMV y ayuda estudiantil).

El modelo tiene 1.543.714.304 parametros y se distribuye en dos formatos: los pesos fusionados en fp16 en la raiz del repositorio y el adaptador LoRA en el subdirectorio `adapter/`. Su relevancia radica en que el autor publica una comparacion empirica entre RAFT y RAG clasico sobre el mismo retriever y el mismo prompt, con resultados matizados: RAFT mejora el solapamiento lexico con las respuestas humanas (F1 de tokens 0,339 frente a 0,230 del modelo base), pero no supera al modelo base ni a un 7B con RAG segun un juez LLM en condiciones realistas de recuperacion.

El modelo esta pensado como pieza de un pipeline RAG de bajo coste: se sirve en una sola GPU de 16 GB, es aproximadamente 2,9 veces mas barato por cada 1.000 consultas que un 7B con RAG y no es mas lento que el Qwen2.5-1.5B-Instruct sin ajustar. Su principal limitacion es que hereda los fallos del retriever: el pasaje correcto aparece en el top-4 solo en aproximadamente un tercio de los casos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), ajuste fino con QLoRA (base 4-bit NF4, adaptadores LoRA en todas las capas lineales) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (modelo base Qwen2.5-1.5B-Instruct: 32.768 tokens segun la documentacion de Qwen, no confirmado en esta ficha) |
| Tipos de cuantizacion | fp16 (pesos fusionados); el adaptador LoRA se entreno sobre base 4-bit NF4; no se listan otros formatos publicados |
| Idiomas soportados | ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (modelo fusionado fp16 en la raiz y adaptador LoRA en `adapter/`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-1.5B-Instruct, un transformer decoder-only con atencion por causalidad estandar, y se ajusta mediante QLoRA: la base se carga en 4 bits NF4 y se insertan adaptadores LoRA en todas las capas lineales. El entrenamiento se ejecuta en una unica Tesla T4 de 16 GB, lo que condiciona el tamano de lote y la longitud de secuencia. El repositorio incluye un `train_report.json` con el registro de la ejecucion, aunque la informacion proporcionada no detalla el numero de tokens de entrenamiento ni la composicion exacta del dataset mas alla de Doc2Dial.

La innovacion tecnica central es la construccion del conjunto de entrenamiento segun RAFT. Para cada pregunta con pasaje dorado, en el 80 % de los ejemplos el contexto incluye el pasaje correcto junto con distractores y en el 20 % restante solo contiene distractores. El 70 % de los distractores son negativos duros del retriever y el 30 % restante son aleatorios. Los cuatro documentos se barajan. El objetivo de salida tiene una forma fija que obliga al modelo a citar primero y responder despues: `##Reason: The relevant text says ##begin_quote## <span> ##end_quote##. ##Answer: <respuesta>`. No se empleo un LLM profesor: tanto las respuestas del agente humano como los spans de fundamentacion provienen de las anotaciones doradas de Doc2Dial. En inferencia, el retriever bge-small procesa los dos ultimos turnos del cliente y devuelve el top-4 de pasajes al modelo.

## Capacidades

- Generacion de texto conversacional en ingles orientada a atencion al cliente.
- Respuestas fundamentadas en documentos con cita explicita del pasaje de soporte mediante el formato `##Reason: ... ##begin_quote## ... ##end_quote## ##Answer: ...`.
- Robustez ante contextos con distractores: entrenado para responder cuando el pasaje correcto esta enterrado entre documentos irrelevantes o ausente.
- Manejo de conversaciones multi-turno (el retriever usa los dos ultimos turnos del cliente como consulta).
- Capacidad de abstenerse o responder con la informacion disponible cuando falta el pasaje dorado (entrenado con un 20 % de ejemplos sin pasaje correcto).
- Compatibilidad con vLLM y text-generation-inference, segun los tags del repositorio.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, vision, audio ni modo thinking en la informacion disponible.

## Casos de uso

- Atencion al cliente de servicios publicos: el modelo responde consultas sobre Seguridad Social, Asuntos de Veteranos, DMV o ayuda estudiantil citando el pasaje normativo concreto, lo que facilita la verificacion por parte del usuario y del operador.
- Despliegue en infraestructura de bajo coste: al caber en una T4 de 16 GB y ser aproximadamente 2,9 veces mas barato por 1.000 consultas que un 7B con RAG, es adecuado para entornos con presupuesto limitado o para prototipos que luego escalan.
- Generacion de respuestas con trazabilidad: el formato quote-then-answer permite auditar que fragmento del documento sustenta cada respuesta, util en dominios regulados donde se exige justificar la informacion ofrecida.
- Sustitucion de un pipeline RAG con modelo grande: para cargas donde prima el coste y la latencia sobre la precision absoluta, el modelo ofrece el mismo esquema de recuperacion con un modelo de 1,5B y sin penalizacion de latencia frente al base.
- Base para ajustes especificos de dominio: al incluir el adaptador LoRA en `adapter/`, un equipo puede reutilizarlo o continuar el entrenamiento sobre su propio corpus documental manteniendo el formato de cita.
- Evaluacion de tecnicas RAFT frente a RAG: el repositorio y su benchmark sirven como referencia reproducible para comparar ambas estrategias en una sola GPU, con el codigo y los resultados documentados.
- Chatbot interno de consulta documental: integrado con bge-small como retriever, puede desplegarse con vLLM o TGI para responder preguntas sobre manuales y procedimientos internos en ingles.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card (Doc2Dial, top-4 de recuperacion, mismo retriever y mismo prompt para todos los sistemas):

| Metrica | RAFT 1.5B | Base 1.5B (RAG) | 7B + RAG |
|---|---|---|---|
| F1 de tokens (documentos vistos) | 0,339 | 0,230 | no disponible |
| F1 de tokens (documentos no vistos) | 0,313 | 0,217 | no disponible |
| Puntuacion de juez LLM (0 a 2) | 1,07 | 1,29 | 1,38 |
| Coste relativo por 1.000 consultas | 1x (referencia) | no disponible | ~2,9x frente a RAFT |

El autor senala que los intervalos de confianza de las diferencias en F1 de tokens no se solapan, mientras que la ventaja del juez LLM favorece al modelo base y al 7B con RAG. La tasa de acierto del retriever (pasaje correcto en el top-4) es de aproximadamente un tercio. No se publican resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generales en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,2 GB en fp16 para los pesos fusionados, mas overhead de activaciones y cache KV; holgadamente por debajo de los 16 GB de una T4.
- GPU recomendadas: Tesla T4 (16 GB), RTX 4090, A100, H100; cualquier GPU consumer con al menos 8 GB puede alojar el modelo en fp16.
- Cabe en GPU consumer: si, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 y similares.
- Opciones de despliegue: vLLM y text-generation-inference (tags del repositorio y `endpoints_compatible`); tambien transformers con el adaptador LoRA o los pesos fusionados.
- Latencia y throughput: el autor indica que el modelo RAFT no es mas lento que el Qwen2.5-1.5B-Instruct sin ajustar, pero no se publican valores absolutos de latencia ni tokens por segundo en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RAFT-Qwen2.5-1.5B-Doc2Dial | 1,54B | no disponible | RAFT + QLoRA sobre Doc2Dial | Apache-2.0 | Hugging Face |
| Qwen2.5-1.5B-Instruct | 1,54B | no disponible en esta ficha | Instruct generalista | Apache-2.0 | Hugging Face |
| Modelo 7B + RAG (referencia del autor) | ~7B | no disponible | RAG clasico | no disponible | no disponible |

Frente al Qwen2.5-1.5B-Instruct, el modelo RAFT mejora el F1 de tokens en Doc2Dial (0,339 frente a 0,230 con documentos vistos y 0,313 frente a 0,217 con documentos no vistos), pero obtiene una puntuacion de juez LLM inferior (1,07 frente a 1,29). Frente al 7B con RAG, el modelo RAFT es aproximadamente 2,9 veces mas barato por consulta pero puntua por debajo en el juez LLM (1,07 frente a 1,38). No se dispone de datos para comparar con otros ajustes RAFT publicos.

## Limitaciones y advertencias

- La mejora en F1 de tokens se debe en gran medida a la copia literal de fragmentos del documento recuperado, lo que se alinea con el estilo de las respuestas humanas de Doc2Dial pero no garantiza mayor correccion factual.
- Cuando el retriever devuelve el pasaje incorrecto, el modelo lo cita y responde con seguridad, sin senalar la falta de fundamento; el autor lo describe como el principal modo de fallo.
- El pasaje correcto aparece en el top-4 solo en aproximadamente un tercio de los casos, lo que limita el techo de calidad de todo el pipeline.
- El modelo esta entrenado unicamente en ingles y en el dominio de servicios publicos estadounidenses; su comportamiento fuera de ese dominio no esta evaluado.
- No se documentan evaluaciones de sesgo, toxicidad ni robustez frente a prompts adversarios.
- No se detalla el numero de tokens de entrenamiento ni la composicion completa del dataset, lo que dificulta reproducir el ajuste con exactitud.
- La licencia Apache-2.0 permite uso comercial, pero el autor declara que el proyecto es independiente y no esta afiliado ni respaldado por ninguna empresa; el uso en produccion requiere validacion propia.
- El repositorio tiene 44 descargas y 0 likes en el momento de la consulta, por lo que no cuenta con validacion de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/S-ABISHEAK/raft-qwen2.5-1.5b-doc2dial
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Dataset Doc2Dial: https://huggingface.co/datasets/IBM/doc2dial
- Paper RAFT (Zhang et al., 2024): https://arxiv.org/abs/2403.10131
- Paper Doc2Dial: https://arxiv.org/abs/2011.06623
- Paper Qwen2.5: https://arxiv.org/abs/2412.15115
- Paper QLoRA: https://arxiv.org/abs/2305.14314
- Paper LoRA: https://arxiv.org/abs/2309.07597
- Paper PEFT: https://arxiv.org/abs/2309.06180
