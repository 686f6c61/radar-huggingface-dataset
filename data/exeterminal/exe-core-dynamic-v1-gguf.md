# exeterminal/Exe-Core-Dynamic-V1-GGUF

## Resumen

Exe Core Dynamic v1 es un ajuste fino (fine-tune) del modelo Qwen/Qwen3.8-27B, desarrollado por exeterminal, orientado especificamente al uso como agente conversacional con capacidad de invocar herramientas (tool calling). Su proposito no es responder preguntas generales, sino decidir que herramienta llamar, con que parametros y cuando conviene no llamar a ninguna, dentro del ecosistema de la aplicacion Exe AI. El modelo parte de una base de 27.320.697.856 parametros (aproximadamente 27,3 mil millones) y se distribuye unicamente en formato GGUF, con cuantizaciones desde bf16 hasta Q2_K.

La relevancia de esta ficha esta en que se trata de un derivado especializado, no de un modelo fundacional: el autor declara explicitamente que fuera de un agente con herramientas el modelo es simplemente la base con un "acento leve", por lo que su interes practico se limita a despliegues de agentes sobre servidores compatibles con la API de OpenAI, como `llama-server`. La licencia Apache-2.0 permite uso comercial, modificacion y redistribucion, siempre citando el origen del modelo base.

El repositorio ocupa 212,7 GB en total (suma de todas las cuantizaciones publicadas) y acumula 1131 descargas y 1 like en el momento de la consulta. La documentacion del autor es inusualmente detallada en cuanto a metodo de entrenamiento, evaluacion y limitaciones conocidas, lo que facilita la evaluacion tecnica pero tambien deja claro el alcance acotado del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.8-27B); detalles internos de la base no disponibles en la informacion proporcionada |
| Parametros totales | 27.320.697.856 (aproximadamente 27,3 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | hasta 262 144 tokens (262k), heredada del modelo base |
| Tipos de cuantizacion | bf16 (16 bits), Q8_0 (8), Q6_K (6,5), Q5_K_M (5,5), Q4_K_M (4,8), Q4_K_S (4,5), IQ4_XS (4,25), Q3_K_L (4,0), Q3_K_M (3,9), Q2_K (3,0) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 (base y derivado) |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo es un fine-tune del Qwen/Qwen3.8-27B mediante un adaptador LoRA de rango 16 aplicado sobre la base completa en bf16. El entrenamiento consistio en dos epocas sobre 1241 ejemplos distribuidos en 19 grupos de comportamiento, con la parte del prompt enmascarada en la funcion de perdida, de modo que el modelo aprende la conducta (que herramienta invocar y cuando) y no la repeticion literal del prompt. El adaptador se fusiono posteriormente en la base bf16 y todas las compilaciones GGUF publicadas derivan de ese modelo fusionado. La perdida de validacion en datos reservados descendio de forma monotona hasta 0,0107, sin repuntes.

El contenido del entrenamiento cubre cada herramienta integrada con cada parametro, las reglas del system prompt de Exe AI y, de forma destacable, la capacidad de leer un esquema de herramienta nunca visto y llamarlo correctamente. Esto ultimo es relevante porque los usuarios anaden servidores MCP y skills propias, de modo que una lista fija de herramientas quedaria obsoleta en cuanto se extendiera la configuracion. No se menciona en la informacion disponible el uso de RLHF o DPO, ni innovaciones de decodificacion especulativa o atencion lineal; el autor solo documenta el proceso de LoRA supervisado descrito. La torre de vision de la base se conserva intacta pero no fue entrenada ni evaluada.

## Capacidades

- Decision de invocacion de herramientas: selecciona la herramienta adecuada entre las integradas, con sus parametros correctos, y evita atajos como resolver lectura de ficheros con una linea de shell.
- Lectura de esquemas de herramientas no vistas: puede interpretar un esquema nuevo (por ejemplo, de un servidor MCP anadido por el usuario) y emitir la llamada correcta.
- Gestion de ejecuciones en segundo plano: inicia procesos largos en background en lugar de bloquear la conversacion.
- Tratamiento de salidas de herramientas como datos: no interpreta el texto devuelto por una herramienta como instrucciones, lo que reduce el riesgo de inyeccion de prompt indirecta.
- Clarificacion ante ambiguedad: formula una pregunta corta cuando la peticion es genuinamente ambigua, aunque el autor senala que esta conducta mejora solo parcialmente.
- Conversacion multi-turno: etiquetado como conversational, con contexto de hasta 262k tokens heredado de la base.
- Capacidades generales de la base (generacion de texto, razonamiento, codigo) presentes pero no reforzadas; el autor recomienda usar la base para chat general.
- Vision: la torre de vision existe pero no fue entrenada ni medida; no debe considerarse una capacidad soportada.
- Multilingue: limitado a ingles segun la model card.

## Casos de uso

- Agente de escritorio o IDE con acceso a ficheros: el modelo elige la herramienta de ficheros en lugar de comandos shell, lo que reduce errores y mejora la trazabilidad de las operaciones sobre el sistema de archivos. El autor reporta una mejora de 0/4 a 4/4 en las pruebas de herramientas de fichero.
- Orquestacion de tareas largas en segundo plano: para procesos de build, entrenamiento o scraping de larga duracion, el modelo lanza la ejecucion en background y continua la conversacion, evitando bloqueos del hilo. Mejora medida de 2/4 a 4/4 en este grupo.
- Integracion de servidores MCP personalizados: al saber leer esquemas de herramientas no vistas, puede operar con herramientas anadidas por el usuario sin reentrenamiento, lo que lo hace adecuado para entornos donde el catalogo de herramientas cambia con frecuencia.
- Backend de chat para aplicaciones compatibles con la API de OpenAI: se puede desplegar como modelo principal detras de `llama-server` u otro servidor compatible, sin cambios en el cliente.
- Automatizacion con datos no confiables: al tratar las salidas de herramientas como datos y no como instrucciones, es adecuado para pipelines donde las herramientas devuelven contenido de terceros (correo, web, tickets) y se quiere limitar el riesgo de inyeccion de prompt.
- Asistente de operaciones con reglas estrictas: el entrenamiento incorpora las reglas del system prompt de Exe AI, por lo que encaja en flujos donde hay que respetar restricciones de carpetas, limites y convenciones de la aplicacion.
- Despliegue en hardware de consumo: la cuantizacion Q4_K_M (16,8 GB) cabe en una GPU de 24 GB, lo que permite ejecutar un agente de 27B en una unica RTX 3090 o 4090.

## Benchmarks y rendimiento

El autor publica una evaluacion propia sobre 72 casos reservados de Exe AI a temperatura 0,1, comparando la base sin entrenar con el modelo ajustado:

| Metrica | Base Qwen3.8-27B | Exe Core Dynamic v1 |
|---|---|---|
| Casos resueltos (72) | 57 / 72 (79 %) | 67 / 72 (93 %) |
| Herramientas de fichero | 0 / 4 | 4 / 4 |
| Ejecuciones en segundo plano | 2 / 4 | 4 / 4 |
| Grupos de comportamiento que empeoran | — | 0 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La evaluacion es interna, sobre casos propios y solo en texto; no es comparable con puntuaciones publicas de terceros.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamano del fichero mas overhead de contexto KV. Referencias del autor: bf16 54,7 GB; Q8_0 29,0 GB; Q6_K 22,4 GB; Q5_K_M 19,5 GB; Q4_K_M 16,8 GB; Q4_K_S 15,8 GB; IQ4_XS 15,4 GB; Q3_K_L 14,6 GB; Q3_K_M 13,5 GB; Q2_K 10,9 GB.
- GPU recomendadas: no especificadas por el autor. Por tamano, Q4_K_M encaja en GPU de 24 GB (RTX 3090, RTX 4090, A10G 24 GB); Q8_0 y superiores requieren 32 GB o mas (A100 40 GB, H100, L40S 48 GB); bf16 requiere 80 GB o reparto multi-GPU.
- Cabe en GPU de consumo: si, en Q4_K_M y cuantizaciones inferiores con 24 GB; Q2_K (10,9 GB) cabe en tarjetas de 12-16 GB, aunque el autor advierte que pierde precision en las decisiones de herramienta mas dificiles.
- Opciones de despliegue: llama.cpp y `llama-server` (mencionados por el autor), cualquier servidor compatible con la API de OpenAI; Ollama y vLLM no se mencionan en la informacion disponible, aunque el formato GGUF es compatible con el primero.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| Exe Core Dynamic v1 | 27,3 B | 262k | Agente y tool calling especializado | Apache-2.0 | GGUF |
| Qwen/Qwen3.8-27B (base) | 27,3 B | 262k | Chat general y vision | Apache-2.0 (segun el autor) | safetensors y otros |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion documentada es contra el propio modelo base: mismo tamano y contexto, pero la base obtiene 57/72 frente a 67/72 en los casos de agente. No se dispone de datos de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Especializacion estrecha: fuera de un agente con herramientas rinde como la base con un "acento leve"; el autor recomienda usar la base para chat general.
- Debilidades conocidas no corregidas: nombrar el entorno Python propio del proyecto y formular una pregunta corta en lugar de inspeccionar primero. La causa raiz se redujo pero no se elimino: el modelo sigue prefiriendo inspeccionar antes de actuar.
- Vision no validada: la torre de vision se conserva congelada y no fue entrenada ni medida; no debe asumirse soporte de imagenes.
- Solo ingles: la model card declara unicamente `en`; el rendimiento en castellano u otros idiomas no esta evaluado.
- Evaluacion limitada: 72 casos internos, solo texto, sin benchmarks publicos; no hay garantia de transferencia a otros dominios de herramientas.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; como todo modelo generativo, puede emitir llamadas con parametros incorrectos o inventar herramientas.
- Cuantizaciones sin imatrix: IQ4_XS se construyo sin imatrix y queda por debajo de su potencial; las I-quants de IQ3 o inferiores se omitieron deliberadamente. Q2_K puede fallar en las decisiones de herramienta mas dificiles.
- Licencia: Apache-2.0 permite uso comercial, modificacion, rebranding y redistribucion, con la obligacion de nombrar el origen del modelo base.
- Fecha de creacion y actualizacion (2026) y ausencia de benchmarks externos: conviene validar el modelo en el dominio propio antes de llevarlo a produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/exeterminal/Exe-Core-Dynamic-V1-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Sitio del autor: https://exe-hq.net
