# BRR1154/SLM-LiteratureSurvey-v1

## Resumen

SLM-LiteratureSurvey-v1 es un modelo de lenguaje de pequeno tamano (SLM) desarrollado por Bhavanam Rajendra Reddy bajo la organizacion Runtime-Slayers. Se trata de un ajuste fino del modelo base Qwen/Qwen2.5-0.5B-Instruct, con 494 millones de parametros, orientado especificamente a la verificacion de citas bibliograficas y la validacion de referencias academicas contra bases de datos como DOI y PubMed. El modelo se presenta como una herramienta de "guardia bibliografica" disenada para reducir la alucinacion en la generacion de citas.

El modelo emplea la arquitectura transformer decoder-only de Qwen2.5, con un protocolo de edicion de pesos denominado "Gram-Schmidt Subspace Null-Space Model Editing", que segun el autor permite modificar el comportamiento del modelo sin degradar el conocimiento preexistente (condicion de zero-forgetting expresada como delta W por V_base igual a cero). El modelo se integra, segun la model card, en un ecosistema denominado "Runtime-Slayers Autonomous SLM Swarm Engine", que lo coordina con modelos orquestadores de mayor tamano.

Su relevancia radica en la especializacion vertical: en lugar de competir en capacidades generales, se posiciona como un componente de bajo coste computacional para tareas de validacion bibliografica dentro de pipelines academicos. No obstante, la ausencia de benchmarks publicados y el numero de descargas (cero en el momento de la consulta) limitan la evidencia disponible sobre su rendimiento real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) |
| Parametros totales | 494.032.768 (492 millones segun el autor) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; la model card usa float32 en el ejemplo) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |
| Modelo base | Qwen/Qwen2.5-0.5B-Instruct |
| Tamano del repositorio | 2.0 GB |
| Pipeline | text-generation |
| Libreria | transformers |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B-Instruct, un transformer decoder-only denso con atencion causal estandar. Sobre esa base, el autor aplica una tecnica de edicion de pesos basada en subespacios de Gram-Schmidt y proyeccion en el espacio nulo, que segun la model card impone la restriccion de que las modificaciones de pesos sean ortogonales a los subespacios de conocimiento del modelo base (delta W por V_base igual a cero). El objetivo declarado es especializar el modelo en verificacion de citas sin provocar olvido catastrofico del conocimiento general.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF, DPO o SFT adicionales. La model card no documenta el proceso de ajuste fino mas alla de la mencion al protocolo de edicion de pesos. Tampoco se detalla si se realizo alguna forma de decodificacion especulativa o modificacion de la atencion.

## Capacidades

- Verificacion y contraste de citas bibliograficas contra bases de datos DOI y PubMed, segun la model card.
- Validacion de credenciales de autor y fuentes de publicacion.
- Generacion de texto conversacional, heredada del modelo base Qwen2.5-0.5B-Instruct.
- Soporte de plantilla de chat (apply_chat_template) con formato de conversacion multi-turno.
- Capacidad declarada de "zero-hallucination" en el ambito de citas, si bien no se aportan metricas que la respalden.
- Integracion declarada en un sistema multi-agente orquestado por modelos de mayor tamano.
- No se documenta soporte explicito de tool calling, function calling ni modos de razonamiento extendido (thinking).
- Capacidades multilingues limitadas al ingles segun la etiqueta de idioma.

## Casos de uso

- Validacion de bibliografia en articulos academicos: el modelo puede recibir una referencia y contrastarla contra identificadores DOI o registros PubMed para detectar citas inexistentes o mal atribuidas antes de la publicacion.
- Revision editorial automatizada: integrado en el flujo de revision de una revista o repositorio preprint, puede marcar referencias sospechosas para revision humana, reduciendo el trabajo manual de comprobacion.
- Deteccion de citas alucinadas en textos generados por IA: como filtro de salida en pipelines de generacion de borradores academicos, verificando que cada cita emitida por un modelo mayor corresponda a una fuente real.
- Construccion de bases de datos bibliograficas: normalizacion y validacion de entradas de referencias procedentes de gestores como Zotero o Mendeley, comprobando autor, ano y fuente.
- Asistencia a revisores y editores: comprobacion rapida de la lista de referencias de un manuscrito antes de enviarlo a revision por pares.
- Componente de bajo coste en sistemas multi-agente: al tener 492 millones de parametros, puede desplegarse como verificador especializado dentro de una arquitectura orquestada, donde un modelo mayor genera y este modelo valida, reduciendo el coste frente a usar un modelo grande para la tarea de verificacion.
- Filtrado en buscadores academicos internos: validacion en tiempo de consulta de que los resultados devueltos corresponden a publicaciones reales y correctamente indexadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en float32: aproximadamente 2 GB solo para pesos (494 millones de parametros por 4 bytes), mas overhead de activaciones y cache KV.
- VRAM estimada en float16/bfloat16: aproximadamente 1 GB para pesos.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 0,5 GB para pesos.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 0,25 GB para pesos.
- Cabe holgadamente en cualquier GPU consumer: RTX 3060, RTX 4060, RTX 4090, e incluso en GPUs de gama baja con 4 GB o menos.
- Puede ejecutarse en CPU para inferencia de baja concurrencia, dado su reducido tamano.
- Opciones de despliegue: transformers (documentado en la model card), text-generation-inference (etiqueta endpoints_compatible), y previsiblemente llama.cpp u Ollama si se generan pesos GGUF, aunque no se documenta su disponibilidad.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| SLM-LiteratureSurvey-v1 | 494 M | No disponible | Apache 2.0 | Verificacion de citas academicas |
| Qwen2.5-0.5B-Instruct | 494 M | 32 768 tokens (segun documentacion publica de Qwen) | Apache 2.0 | Asistente general |
| Qwen2.5-1.5B-Instruct | 1 540 M | 32 768 tokens (segun documentacion publica de Qwen) | Apache 2.0 | Asistente general |
| SmolLM2-360M-Instruct | 360 M | 8 192 tokens (segun documentacion publica de HuggingFace) | Apache 2.0 | Asistente general |

La comparativa se limita a modelos de la misma familia y rango de tamano. No se dispone de benchmarks del modelo evaluado que permitan una comparacion cuantitativa de rendimiento; los datos de contexto de los modelos alternativos provienen de su documentacion publica y no de la informacion proporcionada para este modelo.

## Limitaciones y advertencias

- No se han publicado benchmarks ni evaluaciones independientes que respalden la afirmacion de "zero-hallucination" en verificacion de citas.
- El modelo tiene cero descargas y cero likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.
- La model card menciona integraciones con modelos orquestadores de gran tamano (Nemotron-3-Ultra 550B, DeepSeek V4.1, GLM-5.3, MiniMax M3.1, Kimi K3.1 Pro) sin aportar evidencia tecnica de dichas integraciones.
- El modelo solo declara soporte de ingles, lo que limita su uso en entornos academicos en castellano u otros idiomas.
- Al derivar de un modelo de 0,5 mil millones de parametros, su capacidad de razonamiento general y de comprension de textos academicos complejos es inherentemente limitada.
- No se documenta la longitud de contexto efectiva, dato critico para procesar bibliografias extensas.
- La licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar de forma independiente el cumplimiento de las condiciones de la licencia del modelo base Qwen2.5.
- Riesgo de alucinacion persistente fuera del dominio de citas, dado que la especializacion se aplica sobre un modelo base pequeno.
- La tecnica de edicion de pesos descrita no esta acompanada de documentacion reproducible ni de codigo de entrenamiento publicado.
- No se especifican sesgos conocidos, pero al entrenarse sobre datos en ingles y derivar de un modelo general, es probable que herede los sesgos del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BRR1154/SLM-LiteratureSurvey-v1
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Organizacion del autor: https://github.com/Runtime-Slayers
- ORCID del autor: https://orcid.org/0009-0005-3349-1162
