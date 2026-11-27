# Mia-AiLab/GLM-5.3-Flash-DERISKED-Cyber-EXL3-4bpw

## Resumen

GLM-5.3-Flash-DERISKED-Cyber-EXL3-4bpw es una cuantizacion de 4 bits del checkpoint Blackfrost-AI/GLM-5.3-Flash-Derisked-BF16, un build "de-risked" (con los rechazos y alineamientos de seguridad atenuados) del modelo original Z.AI GLM-5.3-Flash. La publica Mia-AiLab, un laboratorio independiente que aplica el cuantizador exllamav3 1.4.2 con modificaciones locales para comprimir los 87.811 millones de parametros del modelo a un repositorio de 175,7 GB. El resultado es un modelo de arquitectura MoE con 45 capas mas una capa MTP (multi-token prediction), 288 expertos enrutados con top-8 y un experto compartido, disenado para generacion image-text-to-text.

El modelo resuelve un problema concreto de despliegue: el checkpoint BF16 original es demasiado grande para infraestructura de consumo o para servidores con VRAM limitada, de modo que esta version 4-bit reduce el peso de los expertos enrutados (capas 3-44 y capa MTP 45) manteniendo en BF16 las capas de atencion, KDA, expertos compartidos, capas densas 0-2, router, norms y el vision tower. La cuantizacion se calibro con un set hibrido en ingles que incluye material de seguridad ofensiva y defensiva, lo que da al modelo una orientacion marcadamente "cyber".

Es relevante ahora porque es una de las primeras publicaciones publicas de un pack EXL3 sobre un GLM-5.3-Flash de-risked, con un layout de tensores compatible con el stack TensorFold del mismo autor. Sin embargo, el propio autor advierte que la fidelidad, velocidad y memoria de esta cuantizacion aun no se han medido, y que el serving no ha sido validado, por lo que debe tratarse como un artefacto experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Glm5NextForConditionalGeneration (MoE transformer, 45 capas + 1 capa MTP) |
| Parametros totales | 87.811.157.118 |
| Parametros activos | no disponible (top-8 de 288 expertos enrutados + 1 compartido) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 4 bits por peso en expertos enrutados (codebook `mcg`, output scales); BF16 en atencion, KDA, expertos compartidos, capas densas 0-2, router, norms, vision tower, embedding y `lm_head` |
| Idiomas soportados | en, zh |
| Licencia | blackfrost-commercial (terminos del modelo base; `LICENSE` Apache 2.0 cubre solo la contribucion de Mia's AI Lab) |
| Formato de pesos | safetensors (83 shards, indice `total_size` 175.622.979.576) |

## Arquitectura y entrenamiento

La arquitectura es un transformer MoE con 45 capas principales mas una capa MTP (multi-token prediction) en la posicion 45. Cada capa MoE contiene 288 expertos enrutados con activacion top-8 y un experto compartido, ademas de capas de atencion y capas KDA (kernelized dot-product attention, segun la nomenclatura del modelo). Las capas 0-2 son densas. El modelo incluye un vision tower, lo que lo habilita para la tarea image-text-to-text, y el embedding y el `lm_head` tienen forma `[154880, 4096]`.

El entrenamiento original corresponde a Z.AI (GLM-5.3-Flash, licencia MIT) y el proceso de de-risking a Blackfrost-AI, que modifico los `down_proj` de los expertos enrutados, razon por la cual esta cuantizacion no reutiliza los pesos FP8 o BF16 de Z.AI. La innovacion tecnica de esta ficha es la cuantizacion: Mia-AiLab aplica exllamav3 1.4.2 con un modo de balance de expertos (`alpha=0.1, floor=1024, down_sample=4, shared_in=1`) que mezcla los Hessianos por experto con un prior de todos los tokens para evitar que los expertos raramente enrutados se cuantizen con muy pocos tokens. La calibracion es capa por capa, usando las salidas de las capas ya cuantizadas como entrada de la siguiente. La capa MTP 45 se cuantiza con un proxy: toma las entradas MoE de la capa 44 de las filas de calibracion del modelo cuantizado y las pasa por el bloque MoE de la propia capa 45. El error proxy por capa es de 0,0007-0,0020 para gate/up y 0,0011-0,0033 para down, sin fallbacks.

El set de calibracion es un conjunto hibrido en ingles de 523 filas de hasta 4.096 tokens (786.243 tokens en total), con 363 filas de codigo de repositorio, 48 de intercambios de tool-call, 16 de razonamiento matematico, 16 de codigo algoritmico, 16 de chat multi-turno, 15 de texto de referencia en ingles, 17 de seguridad defensiva, 29 de seguridad ofensiva y 3 de flujos de trabajo de codigo. No se dispone de informacion sobre el numero de tokens de entrenamiento original, la composicion del dataset de preentrenamiento ni si hubo RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento general en ingles y chino.
- Generacion de codigo, incluyendo codigo de repositorio y algoritmico (presente en el set de calibracion).
- Razonamiento matematico.
- Capacidades de vision al ser un modelo image-text-to-text con vision tower en BF16.
- Soporte de tool calling y function calling (el set de calibracion incluye 48 filas de intercambios de tool-call).
- Razonamiento multi-paso y flujos de trabajo de agentes (3 filas de coding workflows en calibracion).
- Conversacion multi-turno.
- Capacidad de prediccion multi-token mediante la capa MTP 45, que puede habilitar decodificacion especulativa.
- Orientacion a contenido de seguridad ofensiva y defensiva por el set de calibracion y el de-risking.
- Capacidades multilingues limitadas a en y zh segun la model card.

## Casos de uso

- Analisis de seguridad ofensiva controlado: el modelo se calibro con 29 filas de material ofensivo y proviene de un build de-risked, por lo que puede emplearse en laboratorios de pentesting y red team para generar hipotesis de ataque, siempre detras de controles independientes, logging y revision de acceso.
- Deteccion y respuesta defensiva: con 17 filas de seguridad defensiva en calibracion, es adecuado para triaje de alertas, redaccion de reglas de deteccion y analisis de incidentes en un SOC, donde la ventana de contexto y el razonamiento multi-paso ayudan a correlacionar eventos.
- Asistencia a la ingenieria de codigo: las 363 filas de codigo de repositorio y 16 de codigo algoritmico lo orientan a revision de parches, generacion de tests y explicacion de codigo legacy, con soporte de tool calling para integrarse en pipelines de CI/CD.
- Agentes de automatizacion con tool calling: los 48 ejemplos de intercambios de tool-call permiten construir agentes que invocan APIs, consultan bases de datos y encadenan pasos, usando la capa MTP para acelerar la generacion.
- Razonamiento matematico asistido: las 16 filas de math reasoning lo hacen util para resolver problemas paso a paso, verificar derivaciones y generar explicaciones didacticas en entornos educativos o de investigacion.
- Procesamiento de documentos con imagen y texto: al ser image-text-to-text con vision tower, puede extraer informacion de capturas, diagramas y documentos escaneados combinados con texto, en flujos de digitalizacion y enriquecimiento de datos.
- Chat multi-turno en ingles y chino: adecuado para asistentes conversacionales bilingues en atencion al cliente o soporte interno, con la salvedad de que la longitud de contexto no esta documentada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que la fidelidad, velocidad y memoria de esta cuantizacion no se han medido y que no se reclaman numeros de benchmark, KL ni de rechazo.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 175,7 GB (163,6 GiB) en 4 bits; se necesita al menos esa cantidad de VRAM o de memoria unificada para cargar los pesos, mas overhead de activaciones y KV cache.
- GPU recomendadas: no disponible en la informacion proporcionada; por el volumen de pesos, se requiere hardware de clase servidor con 192 GB o mas de memoria (varias A100/H100 o configuraciones multi-GPU).
- Cabe en consumer GPU: no en una sola GPU de consumo; solo seria viable en configuraciones con memoria unificada de gran capacidad o multi-GPU, y el autor no ha validado el serving.
- Opciones de despliegue: el formato EXL3 requiere el stack TensorFold de GLM-5.3-Flash con codebook `mcg`; no se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible; no se han medido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Estado |
|---|---|---|---|---|---|
| GLM-5.3-Flash-DERISKED-Cyber-EXL3-4bpw (este) | 87,8 B | no disponible | EXL3 4 bits | blackfrost-commercial | Experimental, serving no validado |
| Blackfrost-AI/GLM-5.3-Flash-Derisked-BF16 | no disponible | no disponible | BF16 | blackfrost-commercial | Modelo base, sin cuantizar |
| Mia-AiLab/GLM-5.3-Flash-EXL3-4bpw-TensorFold | no disponible | no disponible | EXL3 4 bits | no disponible | Mismo layout y codebook, sin de-risking |
| zai-org/GLM-5.3-Flash | no disponible | no disponible | FP8/BF16 | MIT | Modelo original de Z.AI |

## Limitaciones y advertencias

- El autor no ha medido fidelidad, velocidad ni memoria de esta cuantizacion; no hay benchmarks, KL ni tasas de rechazo publicadas.
- El serving de este checkpoint no ha sido validado; el formato EXL3 con codebook `mcg` exige el stack TensorFold especifico.
- Es un modelo de-risked: debe asumirse capaz de producir contenido que un modelo de consumo rechazaria. Requiere controles independientes, logging y revision de acceso, y tratar sus salidas como no confiables.
- Riesgo de alucinacion no cuantificado en la informacion disponible.
- Idiomas limitados a ingles y chino; no se documenta soporte de castellano.
- Longitud de contexto no disponible, lo que impide planificar cargas de contexto largo con precision.
- Licencia blackfrost-commercial: los pesos estan sujetos a los terminos del modelo base de Blackfrost y de Z.AI (MIT); el `LICENSE` Apache 2.0 solo cubre la contribucion de Mia's AI Lab, no los pesos. El uso comercial exige revisar los terminos upstream.
- La capa MTP 45 se cuantizo con un proxy, no con un forward real, lo que introduce una fuente adicional de error no medida.
- El set de calibracion es exclusivamente en ingles, lo que puede degradar el rendimiento en chino respecto al BF16 original.
- Sesgos conocidos: no documentados en la informacion disponible.

## Enlaces

- Hugging Face: https://huggingface.co/Mia-AiLab/GLM-5.3-Flash-DERISKED-Cyber-EXL3-4bpw
- Modelo base (de-risked): https://huggingface.co/Blackfrost-AI/GLM-5.3-Flash-Derisked-BF16
- Modelo original Z.AI: https://huggingface.co/zai-org/GLM-5.3-Flash
- Pack TensorFold del mismo autor: https://huggingface.co/Mia-AiLab/GLM-5.3-Flash-EXL3-4bpw-TensorFold
- Cuantizador exllamav3: https://github.com/turboderp-org/exllamav3
- Licencia del modelo base: https://huggingface.co/Blackfrost-AI/GLM-5.3-Flash-Derisked-BF16
