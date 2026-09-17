# Rudraneel93/mastyf-guard-1.5b-v3

## Resumen

Mastyf Guard 1.5B v3 es un modelo de guardrails centrado en seguridad de agentes, publicado por el usuario Rudraneel93 en HuggingFace. Se construye sobre Qwen/Qwen2-1.5B y tiene 1.543.714.304 parámetros totales (aproximadamente 1,5 mil millones), con pesos en safetensors y GGUF y un tamaño de repositorio de 4,1 GB. El pipeline declarado es text-generation y el modelo está etiquetado como conversational, orientado a inglés.

Su relevancia viene del conjunto de etiquetas que definen su propósito: agent-security, agent-defense, prompt-injection, indirect-prompt-injection, mcp, model-context-protocol, capability-based-access-control, relational-invariants, model-soup y guardrails. Es decir, no se plantea como un modelo de propósito general, sino como una capa de control que se interpone entre un agente LLM y sus herramientas o fuentes de datos para filtrar instrucciones maliciosas y verificar invariantes relacionales.

El acceso al modelo está restringido (gated): requiere aceptar condiciones en HuggingFace antes de descargarlo. La licencia es mastyf-developer-license, marcada como license:other, y la ficha no incluye ni la longitud de contexto final ni datos de entrenamiento o benchmarks, por lo que cualquier evaluación de calidad debe hacerse por cuenta del usuario tras obtener acceso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de tipo Qwen2 (derivado de Qwen/Qwen2-1.5B); no se detallan modificaciones estructurales |
| Parametros totales | 1.543.714.304 |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2-1.5B declara 32.768 tokens de contexto nativo, pero la ficha de este derivado no lo confirma) |
| Tipos de cuantizacion | safetensors y GGUF; los niveles concretos (Q4, Q8, etc.) no estan detallados en la informacion disponible |
| Idiomas soportados | en (ingles) |
| Licencia | mastyf-developer-license (etiquetada como license:other); terminos concretos no disponibles |
| Formato de pesos | safetensors y GGUF |
| Acceso | Restringido (gated); requiere aceptar condiciones en HuggingFace |
| Modelo base | Qwen/Qwen2-1.5B |
| Tamano del repositorio | 4,1 GB |
| Pipeline | text-generation |
| Compatibilidad declarada | endpoints_compatible |

## Arquitectura y entrenamiento

La informacion disponible indica unicamente que el modelo parte de Qwen/Qwen2-1.5B, un transformer decoder-only con 1.543.714.304 parametros en su configuracion final. No se especifica si se ha modificado el vocabulario, el numero de capas, el mecanismo de atencion o la cabeza de salida, ni se documentan cambios en la ventana de contexto respecto al modelo base.

Tampoco hay datos sobre el corpus de entrenamiento, el numero de tokens utilizados, la composicion del dataset, ni sobre si se aplicaron tecnicas de alineamiento como RLHF, DPO o SFT. La etiqueta model-soup sugiere que los pesos finales podrian proceder de una combinacion o mezcla de checkpoints, pero se trata de una inferencia a partir del etiquetado y no de un dato confirmado en la ficha. Del mismo modo, el tag quantization:Qwen/Qwen2-1.5B apunta a que se han publicado variantes cuantizadas, sin detallar los esquemas empleados.

## Capacidades

- Filtrado de prompt injection directa: el etiquetado prompt-injection indica que el modelo esta entrenado para detectar instrucciones maliciosas dirigidas al propio agente.
- Deteccion de indirect prompt injection: cubre el caso de instrucciones hostiles embebidas en contenido externo (documentos, resultados de busqueda, respuestas de APIs) que el agente consume.
- Guardrails para agentes: actua como capa de validacion de entradas y salidas dentro de un bucle agentico.
- Seguridad en Model Context Protocol (MCP): las etiquetas mcp y model-context-protocol apuntan a su uso como control sobre servidores y herramientas expuestas via MCP.
- Control de acceso basado en capacidades: la etiqueta capability-based-access-control sugiere verificacion de que una llamada a herramienta respeta los permisos concedidos al agente.
- Verificacion de invariantes relacionales: la etiqueta relational-invariants indica comprobacion de condiciones que deben mantenerse entre entidades o registros.
- Soporte de tool calling: etiquetado explicitamente como tool-calling, lo que permite integrarlo en flujos donde el propio guardrail consume herramientas o devuelve decisiones estructuradas.
- Generacion de texto conversacional: pipeline text-generation con etiqueta conversational.
- Multilingue: no disponible; el modelo declara unicamente ingles (en).
- Modo thinking, vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Guardrail de entrada en agentes autonomos: antes de que el agente planifique, se pasa la peticion del usuario por Mastyf Guard para descartar intentos de secuestro de instrucciones; su tamano de 1,5B permite ejecutarlo en la misma GPU que el agente sin penalizar el coste por token.
- Proteccion de pipelines RAG: cuando el agente recupera fragmentos de documentos o paginas web, se filtran con el modelo para bloquear indirect prompt injection insertada en el contenido recuperado, que es uno de los vectores mas habituales en despliegues con busqueda.
- Validacion de llamadas a herramientas en servidores MCP: interceptar cada tool call generada por el agente y comprobar, con la logica de capability-based-access-control, que la herramienta invocada y sus argumentos estan dentro de las capacidades concedidas a esa sesion.
- Verificacion de invariantes en flujos transaccionales: en agentes que operan sobre bases de datos o sistemas de registro, usar la capa de relational-invariants para comprobar que una secuencia de acciones no rompe condiciones de consistencia antes de ejecutarla.
- Filtrado de salida hacia el usuario: como segunda barrera, revisar la respuesta final del agente para evitar fugas de informacion interna, contenido no permitido o instrucciones peligrosas antes de mostrarla.
- Red-teaming y evaluacion de seguridad de agentes: integrarlo en un arnes de pruebas que genere ataques de prompt injection y mida la tasa de deteccion, comparando versiones del agente antes de desplegarlas.
- Puerta de calidad en CI/CD de agentes: ejecutar el modelo sobre un conjunto de casos adversarios conocidos en cada pull request, de modo que un cambio en el system prompt o en las herramientas no degrade la postura de seguridad.
- Moderacion previa en atencion al cliente automatizada: descartar mensajes que intenten manipular al asistente para que revele el prompt de sistema o ejecute acciones fuera de politica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La ficha de HuggingFace no incluye metricas de deteccion de prompt injection, tasas de falsos positivos, MMLU, HumanEval ni ningun otro conjunto de evaluacion, y la busqueda web realizada no devolvio ningun resultado relacionado con el modelo.

## Requisitos de hardware

- Peso de los parametros: 1.543.714.304 parametros implican aproximadamente 3,1 GB en FP16/BF16 y unos 1,6 GB en cuantizacion de 8 bits. El repositorio completo ocupa 4,1 GB, lo que es coherente con varias copias de pesos y variantes GGUF.
- VRAM estimada para inferencia: alrededor de 4-5 GB en FP16 contando pesos y cache KV; aproximadamente 2,5 GB en Q8; aproximadamente 1,5-2 GB en Q4.
- GPU consumer: cabe con holgura en tarjetas de 6-8 GB (RTX 3060, RTX 4060, GTX 1660 Super para cuantizaciones bajas) y sin problemas en 12 GB o mas (RTX 3060 12 GB, RTX 4070, RTX 4090). Tambien es viable en CPU con llama.cpp para volumenes bajos.
- GPU de datacenter: A100, H100, L40S o L4 permiten servir muchas instancias concurrentes del modelo en una sola tarjeta por su tamano reducido.
- Opciones de despliegue: al publicar pesos safetensors y GGUF, es compatible con vLLM, TGI, llama.cpp, Ollama y Transformers. La etiqueta endpoints_compatible indica que puede desplegarse en HuggingFace Inference Endpoints.
- Latencia y throughput: no disponible en la informacion proporcionada.
- Nota operativa: el acceso gated implica que cualquier despliegue automatizado necesita un token con permisos aceptados; conviene verificar los terminos antes de integrarlo en un pipeline productivo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mastyf Guard 1.5B v3 | 1,54B | no disponible | Guardrails de agentes, prompt injection, MCP | mastyf-developer-license (other) | Gated en HuggingFace |
| Llama Prompt Guard 2 (86M) | 86M | no disponible | Deteccion de prompt injection | Licencia comunitaria de Llama | Publico en HuggingFace |
| ShieldGemma 2B | 2B | no disponible | Moderacion de contenido en entrada y salida | Terminos de uso de Gemma | Publico en HuggingFace |
| Granite Guardian 2B | 2B | no disponible | Riesgos de prompt, respuesta y RAG | Apache 2.0 | Publico en HuggingFace |

Los datos de las alternativas proceden de conocimiento general sobre esos modelos y no forman parte de la informacion proporcionada en esta ficha, por lo que deben verificarse en sus respectivas paginas antes de usarlos en una decision tecnica. No es posible comparar rendimiento porque Mastyf Guard 1.5B v3 no publica benchmarks.

## Limitaciones y advertencias

- No hay ninguna metrica publicada: se desconoce la tasa de deteccion real de prompt injection y, sobre todo, la tasa de falsos positivos, que es el coste principal de cualquier guardrail en produccion.
- Idioma unico: el modelo declara solo ingles (en). Su comportamiento con entradas en castellano u otros idiomas no esta documentado y no deberia asumirse.
- Longitud de contexto no confirmada: si el uso previsto consiste en filtrar documentos largos recuperados por un RAG, es imprescindible verificar la ventana efectiva antes de trocear el contenido.
- Riesgo de alucinacion: al ser un modelo generativo de 1,5B, las etiquetas del repositorio apuntan a un uso como clasificador o guardrail, pero no se documenta como se obtiene la decision final; conviene validar el formato de salida y no tratar su respuesta como veredicto absoluto.
- Sesgos: no hay informacion sobre la composicion del corpus de entrenamiento ni sobre evaluaciones de sesgo. Un guardrail entrenado solo en ingles puede bloquear de forma desproporcionada contenido legitimo en otros idiomas o registros.
- Licencia no estandar: mastyf-developer-license se etiqueta como license:other, lo que implica que no es una licencia de codigo abierto reconocida. Hay que revisar el texto completo antes de cualquier uso comercial o de redistribuir el modelo o sus derivados.
- Acceso restringido: el gate de HuggingFace anade dependencia de la plataforma y puede romper procesos automatizados de descarga en CI/CD si no se gestionan los tokens correctamente.
- Madurez: 0 descargas y 1 like en el momento de la consulta, con una unica actualizacion el mismo dia de creacion. Es un artefacto sin adopcion publica verificable ni historial de mantenimiento.
- Ausencia de documentacion tecnica: al no haber detalle sobre datos de entrenamiento, alineamiento ni evaluacion, no es posible auditar el modelo, lo cual es especialmente problematico en una pieza de seguridad.
- Dependencia de la cadena de herramientas: un guardrail solo aporta valor si no puede ser eludido por el propio agente; conviene disenar el flujo de forma que el modelo de guardrails no reciba instrucciones del agente que pretende vigilar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Rudraneel93/mastyf-guard-1.5b-v3
- Modelo base Qwen2-1.5B: https://huggingface.co/Qwen/Qwen2-1.5B
- Busqueda web: no se encontro ningun enlace relevante sobre el modelo. Los resultados devueltos correspondian a paginas de soporte de Microsoft (contacto, inicio de sesion en Hotmail, actualizaciones de seguridad de Exchange Server y cambio de frecuencia de refresco en Windows), sin relacion con Mastyf Guard ni con modelos de guardrails.
