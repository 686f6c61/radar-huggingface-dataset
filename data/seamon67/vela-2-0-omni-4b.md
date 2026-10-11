# seamon67/Vela-2.0-Omni-4B

## Resumen

Vela 2.0 Omni 4B es un modelo de decisión (decision-model) derivado de vllm-sr/Vela-2.0-4B, desarrollado por vLLM Semantic Router en colaboración con KR Labs y convertido a la variante Omni por el usuario seamon67. No es un modelo generativo de texto: su salida son decisiones estructuradas (choice, yes/no, score, span y set) sobre una petición, un contexto y una respuesta, con etiquetas y rúbricas definidas en tiempo de inferencia. Está pensado para enrutado semántico (semantic routing), comprobaciones de seguridad, detección de PII, detección de alucinaciones y extracción de spans con offsets de caracteres y probabilidades.

El modelo declara 4.2B parámetros sobre un backbone Qwen3.5 híbrido de 32 capas que combina Gated DeltaNet (atención lineal) y GQA con compuertas, con un límite de entrada de 16.384 tokens. La variante Omni añade capacidades multimodales de audio, visión y vídeo manteniendo, según su autor, decisiones de texto idénticas a las de Vela 2.0 y un comportamiento "muy competitivo" en decisiones multimodales.

Es relevante ahora porque propone un patrón distinto al de los LLM generativos: en lugar de producir texto, devuelve señales de control consumibles directamente por un router o una pasarela de inferencia, integrando en una sola petición enrutado, detección de ataques de prompt, PII y afirmaciones no soportadas. La licencia es Apache-2.0 y el repo, publicado el 10 de octubre de 2026, ocupa 11.7 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 hibrida de 32 capas: Gated DeltaNet (atencion lineal) y GQA con compuertas; decoder con cabezas de decision |
| Parametros totales | 4,2B (reportados) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 16.384 tokens (limite de entrada) |
| Tipos de cuantizacion | no disponible; el modelo se distribuye con parametros en FP32 y backbone en bf16 autocast sobre GPU, con cabezas en FP32 |
| Idiomas soportados | arabe, chino, checo, neerlandes, ingles, frances, aleman, hindi, italiano, japones, coreano, polaco, portugues, ruso, espanol, sueco y tailandes (17 idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, con codigo personalizado (custom_code) y requerimiento de trust_remote_code |
| Salida | Choice, yes/no, score, span y set; sin generacion de texto |
| Precision evaluada | Parametros FP32; backbone en bf16 autocast en GPU; cabezas FP32 |
| Memoria de parametros en GPU | Aproximadamente 17 GB en FP32 |
| Tamano del repositorio | 11,7 GB |

## Arquitectura y entrenamiento

El backbone es un transformer hibrido de la familia Qwen3.5 con 32 capas que intercala Gated DeltaNet, un mecanismo de atencion lineal con decaimiento y compuertas, con GQA (Grouped Query Attention) tambien con compuertas. Sobre ese backbone se montan cabezas de decision que producen cinco tipos de salida: eleccion entre opciones, respuesta binaria, puntuacion, spans con offsets de caracteres y conjuntos de etiquetas. La model card indica que en la evaluacion los parametros se cargan en FP32 y que el backbone se ejecuta en GPU bajo autocast bf16, con las cabezas siempre en FP32. El kernel de Gated DeltaNet de `flash-linear-attention` es opcional pero reduce mucho el tiempo de ejecucion en GPU.

El modelo es un finetune de vllm-sr/Vela-2.0-4B, y la conversion a Omni la realiza un tercero (seamon67), anadiendo audio, vision y video. Las fuentes de datos declaradas cubren seguridad de contenido (Aegis-AI-Content-Safety-Dataset-2.0, PolyGuardMix, Nemotron-Safety-Guard-Dataset-v3, Salad-Data), inyeccion de prompts (llmail-inject-challenge), deteccion de alucinaciones en prosa y codigo (lettucedetect-prose/code-hallucination, verbatim-spans), NER y PII (NuNER, pile-mistral-v0.1, GLINER-multi-task-synthetic-data, finer-139, MultiCoNER v2), relaciones y extraccion de informacion (Re-DocRED, SynthIE), QA y razonamiento sobre documentos (SQuAD v2, HotpotQA, Natural Questions) y extraccion de salidas de herramientas (tool-output-extraction-swebench). No se especifica el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO: esa informacion no esta disponible.

## Capacidades

- Clasificacion zero-shot: permite definir opciones, etiquetas y rubricas en el momento de la peticion, sin reentrenar.
- Salidas estructuradas de decision: choice, yes/no, score, span y set, con probabilidades y offsets de caracteres.
- Extraccion de spans con resolucion de token: devuelve `start`, `end`, `text`, `label` y `probability` para cada fragmento localizado.
- Deteccion de PII: esquema entrenado con 17 tipos de informacion personal (`pii_schema` disponible via `vela2_engine.cal`).
- Named entity recognition y token classification multilingue.
- Deteccion de alucinaciones: localiza spans de la respuesta no soportados por el contexto proporcionado.
- Seguridad de contenido: clasificacion de contenido inseguro y toxicidad, con una AUC macro de seguridad de 0,921 en 14 conjuntos publicos (cifra de la model card del modelo original).
- Deteccion de inyeccion de prompts y ataques, a partir del conjunto llmail-inject-challenge.
- Enrutado semantico: decide que ruta, modelo o tratamiento corresponde a una peticion.
- Preguntas multiples con nombre sobre una misma peticion, evaluadas en una sola llamada (`system_one`).
- Multimodal: audio, vision y video, segun los tags de la ficha y la descripcion del autor de la conversion Omni.
- Multilingue en 17 idiomas.
- Sin generacion de texto: no produce respuestas en lenguaje natural.

## Casos de uso

- Pasarela de inferencia con enrutado semantico: el modelo recibe la peticion del usuario y devuelve una decision de tipo choice indicando a que modelo, cola o proveedor derivarla, con probabilidades por ruta, lo que permite balancear coste y calidad en produccion.
- Cumplimiento y anonimizacion de datos (GDPR): con el esquema de 17 tipos de PII se localizan nombres, correos o identificadores en la peticion y se enmascaran antes de enviarla a un LLM de terceros.
- Moderacion de contenido en plataformas: clasificacion de contenido inseguro y tóxico en 14 conjuntos publicos de referencia, con salida binaria o de puntuacion apta para umbrales configurables.
- Deteccion de inyeccion de prompts en asistentes con acceso a herramientas: se compara la peticion con el contexto y se marca la existencia de instrucciones maliciosas antes de ejecutar llamadas a funciones.
- Verificacion de respuestas de un RAG: dadas pregunta, contexto recuperado y respuesta generada, el modelo localiza los spans de la respuesta no soportados por el contexto, con lo que se puede bloquear o regenerar la respuesta antes de mostrarla al usuario.
- Auditoria forense de logs de agentes: extraccion de spans verbatim y de salidas de herramientas (dataset tool-output-extraction-swebench) para reconstruir que hizo un agente y con que datos.
- Extraccion de entidades y relaciones en documentos legales o financieros: NER y reconocimiento de relaciones sobre texto largo (hasta 16.384 tokens) con salida tipada lista para indexar en una base de datos.
- Filtrado previo en pipelines de anotacion: el modelo actua como etiquetador zero-shot para preanotar corpus multilingues en 17 idiomas antes de la revision humana.

## Benchmarks y rendimiento

La model card del modelo original reporta una AUC macro de seguridad de 0,921 promediada sobre 14 conjuntos publicos. El autor de la conversion Omni indica explicitamente que no ha ejecutado benchmarks y anima a terceros a hacerlo.

| Metrica | Conjuntos | Valor | Fuente |
|---|---|---|---|
| AUC macro de seguridad | 14 conjuntos publicos | 0,921 | Model card de vllm-sr/Vela-2.0-4B (citada en la ficha) |
| Benchmarks de razonamiento (MMLU, GSM8K, HumanEval, etc.) | no aplica | no disponible | El modelo no genera texto; no se han publicado resultados |
| Benchmarks multimodales de la variante Omni | no disponible | no disponible | No publicados por el autor de la conversion |

No se han publicado resultados de benchmarks adicionales en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 17 GB solo para los parametros en FP32, segun la model card. Hay que sumar activaciones, cache y overhead del runtime, por lo que en la practica se necesita una GPU con mas de 17 GB libres.
- GPU recomendadas: A100 (40 GB o 80 GB) o H100 (80 GB) para servicio en produccion; una RTX 4090, L4 o A10G de 24 GB es el minimo razonable en el entorno de consumo/prosumer.
- Cabe en GPU de consumo: si, en tarjetas de 24 GB como la RTX 4090 o la RTX 3090, siempre que no se superpongan varios procesos; en GPUs de 16 GB o menos es previsible que no quepa en FP32.
- Aceleracion: se recomienda instalar `flash-linear-attention` para usar el kernel de Gated DeltaNet en GPU; la model card lo describe como opcional pero "mucho mas rapido".
- Opciones de despliegue: carga via `transformers>=5.17` con `AutoModel.from_pretrained(..., trust_remote_code=True)`; el modelo se ejecuta con el motor `vela2_engine` y el metodo `system_one`. El soporte en vLLM, llama.cpp, Ollama o TGI no esta documentado en la informacion disponible.
- Tamano de descarga: 11,7 GB de repositorio.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se han identificado en la informacion disponible modelos de terceros directamente comparables (clasificadores de enrutado y seguridad con salida de spans y multitarea). La unica comparacion documentada es con el modelo base del que deriva.

| Modelo | Parametros | Contexto | Salida | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Vela-2.0-Omni-4B (seamon67) | 4,2B | 16.384 tokens | Choice, yes/no, score, span, set | Audio, vision, video | Apache-2.0 | HuggingFace, 0 descargas |
| Vela-2.0-4B (vllm-sr) | 4,2B (reportados) | 16.384 tokens | Choice, yes/no, score, span, set | No declarado en la ficha | Apache-2.0 | HuggingFace (modelo base) |
| Otras alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre, solo decisiones estructuradas. No sirve como sustituto de un LLM conversacional.
- La conversion a Omni la realiza un tercero (`seamon67`), no los autores originales de Vela 2.0. No hay validacion independiente de que las decisiones de texto sean identicas a las del modelo base.
- No se han publicado benchmarks de la variante Omni; el propio autor indica que no los ha ejecutado.
- El repositorio presenta 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en produccion ni validacion de la comunidad.
- Requiere `trust_remote_code=True` y contiene codigo personalizado (`custom_code`), lo que implica ejecutar codigo de terceros al cargar el modelo; conviene auditar el repositorio antes de usarlo en entornos sensibles.
- Los pesos se cargan en FP32 y consumen unos 17 GB de VRAM solo en parametros, lo que encarece el despliegue frente a alternativas cuantizadas.
- Limite de entrada de 16.384 tokens: los documentos mas largos deben trocearse, con el consiguiente riesgo de perder contexto necesario para la deteccion de alucinaciones.
- Riesgo de falsos positivos y falsos negativos inherente a cualquier clasificador de seguridad, PII o alucinaciones; la AUC de 0,921 es un promedio macro sobre 14 conjuntos y no garantiza el mismo rendimiento en dominios o idiomas concretos.
- El rendimiento por idioma no esta desglosado; los 17 idiomas declarados no implican calidad homogenea entre ellos.
- Licencia Apache-2.0: permite uso comercial y modificacion, pero no exime de responsabilidad legal sobre las decisiones de moderacion, anonimizacion o filtrado que se automaticen con el modelo.
- La fecha de creacion de la ficha es el 10 de octubre de 2026, posterior al conocimiento del autor de esta ficha; no se dispone de historial de versiones ni de cambios de comportamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/seamon67/Vela-2.0-Omni-4B
- Modelo base (Vela 2.0 4B): https://huggingface.co/vllm-sr/Vela-2.0-4B
- Documentacion: https://vllm-sr.ai/
- Blog de Vela 2.0: https://vllm-sr.ai/blog/vela-2-0-open-foundation-routing-models
- Repositorio GitHub (semantic-router): https://github.com/vllm-project/semantic-router
- Coleccion Vela 2.0: https://huggingface.co/collections/vllm-sr/vela-20
- Documento de uso citado en la model card (`USAGE.md`, seccion "routing and span questions"): no se ha facilitado URL directa en la informacion disponible.

Nota: la busqueda web realizada no ha devuelto resultados relacionados con el modelo; los enlaces encontrados correspondian a un operador de transporte publico y no se incluyen por no ser relevantes.
