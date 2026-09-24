# OliviaRossi/MiMo-Ornith-9B-AGSI-Abliterated-Q5_K_M-GGUF

## Resumen

`OliviaRossi/MiMo-Ornith-9B-AGSI-Abliterated-Q5_K_M-GGUF` es una version cuantizada en formato GGUF de un modelo de lenguaje de aproximadamente 9.000 millones de parametros, publicada por el usuario OliviaRossi. Se trata de un derivado del modelo base `OliviaRossi/MiMo-Ornith-9B-AGSI-Abliterated`, que a su vez ha sido sometido a un proceso de *abliteration*: una tecnica de modificacion de pesos que elimina o atenua las direcciones de rechazo aprendidas durante el ajuste por instrucciones, dando lugar a un modelo sin los filtros de negativa habituales. La etiqueta `abliterix` del repositorio apunta a la herramienta empleada para ese proceso.

El repositorio contiene unicamente una cuantizacion Q5_K_M (5,5 bits por peso aproximadamente), generada con el flujo `gguf-my-repo` de Hugging Face, y esta pensada para ejecucion en local mediante llama.cpp y sus derivados (Ollama, LM Studio, etc.). Las etiquetas del modelo indican `qwen3_5`, `reasoning` y `agentic`, lo que sugiere una linea derivada de la familia Qwen 3.5 y una orientacion hacia tareas de razonamiento y uso como agente, si bien el repositorio no incluye documentacion tecnica que lo confirme.

La relevancia de esta ficha es acotada y conviene ser honesto al respecto: el modelo acumula 0 descargas y 1 like en el momento de la consulta, no publica resultados de benchmarks ni detalles de entrenamiento, y su licencia aparece como MIT en las etiquetas pero como no disponible en el campo de licencia del Hub. Es, por tanto, un artefacto de experimentacion mas que un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la etiqueta `qwen3_5` sugiere una linea derivada de Qwen 3.5; sin confirmacion documental) |
| Parametros totales | 9B (segun el nombre del modelo; no confirmado en la documentacion del repositorio) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q5_K_M (unico publicado en este repositorio); el formato GGUF admite otros niveles, no disponibles aqui |
| Idiomas soportados | en, zh (segun las etiquetas del repositorio; no confirmado por documentacion) |
| Licencia | MIT segun la etiqueta del repositorio; el campo de licencia del Hub figura como no disponible |
| Formato de pesos | GGUF |
| Modelo base | OliviaRossi/MiMo-Ornith-9B-AGSI-Abliterated |
| Metodo de cuantizacion | gguf-my-repo (flujo de cuantizacion de Hugging Face) |
| Tamano estimado de pesos | ~6,2 GB para Q5_K_M (estimacion a partir de 9B parametros a ~5,5 bits por peso) |
| Modificacion de seguridad | abliteration / abliterix (eliminacion de direcciones de rechazo) |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna del modelo en la informacion disponible. El nombre y las etiquetas permiten inferir que se trata de un transformer decoder-only de la familia Qwen 3.5 con aproximadamente 9.000 millones de parametros, pero no hay confirmacion de si emplea atencion completa, atencion lineal, mezcla de expertos u otra variante. Tampoco se documenta el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF, DPO o RL con verificador.

La unica transformacion tecnica documentada es la *abliteration* aplicada por el autor del modelo base. Este proceso identifica la direccion en el espacio de activaciones que media el comportamiento de rechazo y proyecta los pesos ortogonalmente a esa direccion, de forma que el modelo deja de producir negativas ante peticiones que un modelo alineado rechazaria. El resultado suele conservar buena parte de las capacidades generales, aunque puede degradar ligeramente la coherencia en tareas de razonamiento y elimina las salvaguardas de contenido. La cuantizacion Q5_K_M posterior introduce una perdida adicional de precision, tipicamente baja pero no nula, respecto a los pesos en FP16/BF16 del modelo base.

## Capacidades

- Generacion de texto conversacional en formato chat (pipeline declarado: `text-generation`, tag `conversational`).
- Razonamiento y modo de pensamiento: la etiqueta `reasoning` sugiere soporte de trazas de razonamiento, sin verificar en la documentacion.
- Uso orientado a agentes y flujos multi-paso: etiqueta `agentic`, sin verificar.
- Capacidades multilingues limitadas, segun etiquetas, a ingles y chino.
- Ausencia de rechazos por politica de contenido: el modelo no aplica los filtros de negativa tipicos de un modelo alineado.
- Inferencia local en CPU y GPU mediante llama.cpp y herramientas compatibles con GGUF.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Vision, audio u otras modalidades: no disponible (no documentado).

## Casos de uso

- Red teaming y evaluacion de guardarrailes: el modelo permite estudiar como responde un sistema sin capa de rechazo, lo que resulta util para medir la eficacia de filtros externos, clasificadores de contenido y politicas de despliegue antes de poner un asistente en produccion.
- Investigacion sobre alineacion y abliteration: comparar las respuestas de este modelo con las de su base alineada permite cuantificar que capacidades se conservan y cuales se degradan al eliminar las direcciones de rechazo.
- Generacion de ficcion sin filtros editoriales: para escritura creativa que aborde violencia, temas adultos o conflictos morales, donde los modelos alineados suelen producir negativas o respuestas evasivas. Requiere revision humana posterior.
- Asistente local offline en estacion de trabajo: con ~6,2 GB de pesos en Q5_K_M puede ejecutarse integramente en una GPU de consumo o en CPU, sin enviar datos a servicios externos, lo que encaja en entornos con requisitos de confidencialidad.
- Prototipado rapido de interfaces conversacionales: al ser un GGUF unico, se integra en minutos con Ollama o LM Studio para validar prompts, temperaturas y formatos de chat antes de invertir en un modelo mayor.
- Traduccion y generacion de contenido en ingles y chino: si se confirman los idiomas declarados en las etiquetas, puede emplearse en tareas de traduccion o redaccion bilingue de baja criticidad, siempre con supervision.
- Experimentacion con pipelines de agentes: si la etiqueta `agentic` se corresponde con soporte real de plantillas de herramientas, serviria como banco de pruebas para orquestacion multi-paso en local; conviene verificar esta capacidad antes de integrarla.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra metrica, y no se dispone de comparaciones verificables frente a modelos de tamano similar.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 6,2 GB solo para los pesos en Q5_K_M; con cache KV y overhead del runtime, entre 7 y 8 GB para contextos moderados y alrededor de 10 GB si se trabaja con ventanas de contexto largas. Cifras estimadas, no publicadas por el autor.
- GPU de consumo compatibles: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4070 Ti, RTX 4080 y RTX 4090. Tambien cabe en GPUs de 8 GB si se reduce el contexto o se descarga parcialmente a CPU.
- GPU de segmento profesional: no se requieren A100 ni H100 para inferencia de un unico usuario; solo tendrian sentido para servir muchas peticiones concurrentes con batching.
- Ejecucion en CPU: viable gracias al formato GGUF, con rendimiento dependiente del numero de nucleos y del ancho de banda de memoria.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, text-generation-webui y cualquier runtime compatible con GGUF. Para vLLM o TGI conviene partir de los pesos no cuantizados en safetensors del modelo base, ya que el soporte de GGUF en esos servidores es limitado.
- Latencia y throughput: no disponibles (no publicados por el autor; dependen fuertemente del hardware y del nivel de cuantizacion).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|---|
| MiMo-Ornith-9B-AGSI-Abliterated-Q5_K_M-GGUF (este repositorio) | ~9B (no confirmado) | no disponible | GGUF Q5_K_M | MIT segun etiqueta, no confirmada | 0 descargas, 1 like | sin benchmarks publicados |
| MiMo-Ornith-9B-AGSI-Abliterated (modelo base) | ~9B (no confirmado) | no disponible | no disponible | no disponible | repositorio del autor | sin benchmarks publicados |
| Alternativas de la misma categoria (9B abliterados, Qwen 3.x, Llama 3.x) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos verificables sobre modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- Modelo abliterado: no aplica rechazos de seguridad. Puede generar contenido danino, ilegal o gravemente sesgado ante peticiones directas, y no debe exponerse a usuarios finales sin una capa de moderacion externa.
- Riesgo elevado de alucinacion: no hay documentacion sobre el dataset de entrenamiento ni evaluaciones de veracidad. Como cualquier modelo de 9B, tiende a inventar datos cuando no dispone de informacion.
- Sin informacion sobre sesgos: no se han publicado evaluaciones de sesgo de genero, raza, religion o idioma.
- Ambiguedad de licencia: la etiqueta declara MIT, pero el campo de licencia del Hub figura como no disponible. Conviene verificar la licencia del modelo base antes de cualquier uso comercial.
- Cobertura idiomatica limitada: solo ingles y chino segun las etiquetas; el rendimiento en castellano es desconocido y previsiblemente inferior.
- Longitud de contexto desconocida: no se puede planificar un caso de uso con documentos largos sin determinar experimentalmente la ventana efectiva del modelo base.
- Perdida por cuantizacion: Q5_K_M es un compromiso razonable entre tamano y calidad, pero no reproduce exactamente el comportamiento del modelo en FP16, especialmente en tareas de razonamiento con cadenas largas.
- Adopcion nula: 0 descargas y 1 like implican que no existe validacion por parte de la comunidad. Cualquier fallo o comportamiento anomalo no esta documentado.
- Fecha de creacion inusual: el repositorio figura creado y actualizado el 2026-09-24, dato que conviene contrastar antes de citarlo.
- Sin soporte ni mantenimiento garantizado: es un artefacto publicado por un usuario individual, no un modelo con ciclo de versiones.

## Enlaces

- Repositorio GGUF: https://huggingface.co/OliviaRossi/MiMo-Ornith-9B-AGSI-Abliterated-Q5_K_M-GGUF
- Modelo base: https://huggingface.co/OliviaRossi/MiMo-Ornith-9B-AGSI-Abliterated
- Perfil del autor: https://huggingface.co/OliviaRossi
- Herramienta de cuantizacion citada en las etiquetas (`gguf-my-repo`): https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Papers, blogs o demos adicionales: no disponible (no se han encontrado en la informacion proporcionada)
