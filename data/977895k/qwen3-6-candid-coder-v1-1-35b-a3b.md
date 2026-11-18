# 977895k/Qwen3.6-Candid-Coder-V1.1-35B-A3B

## Resumen

Qwen3.6-Candid-Coder-V1.1-35B-A3B es un modelo de lenguaje de tipo mezcla de expertos (MoE) publicado por el usuario 977895k en Hugging Face. Se trata de una distribucion "limpia" y compatible con Tiiny del modelo DarkKitsune/Qwen3.6-Candid-Coder-V1.1-35B-A3B, construido a partir del modelo base Qwen/Qwen3.6-35B-A3B. El modelo esta orientado a tareas de codigo, razonamiento, uso de herramientas y flujos agenticos, y se distribuye con la etiqueta "abliterated" y "uncensored", lo que indica que se han eliminado o atenuado los mecanismos de rechazo del modelo original.

La arquitectura es de mezcla de expertos (MoE) con un total de 35.951.822.704 parametros (aproximadamente 36.000 millones). El pipeline declarado es image-text-to-text, lo que sugiere capacidades multimodales de entrada (imagen y texto), aunque no se detalla la composicion exacta de parametros activos ni la longitud de contexto en la informacion disponible. El repositorio ocupa 71,9 GB en formato safetensors y se distribuye bajo licencia Apache 2.0.

El modelo resulta relevante para desarrolladores e investigadores que buscan un modelo de codigo y agentico de gran tamano, con licencia permisiva y sin las restricciones de rechazo habituales, aunque la ausencia de documentacion tecnica detallada y de resultados de benchmarks publicados limita su evaluacion rigurosa antes de un despliegue en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE), familia Qwen3.5 (tag `qwen3_5_moe`) |
| Parametros totales | 35.951.822.704 (aprox. 36.000 millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; se desconoce si hay GGUF) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer de mezcla de expertos (MoE) derivado de Qwen/Qwen3.6-35B-A3B, con 35.951.822.704 parametros totales. La model card indica que la version Candid-Coder V1.1 se obtuvo mediante un merge de tres modelos: KAT-Coder-V2.5-Dev (58 %), Sage-A1.5 (30 %) y Ornith-1.5-35B-A3B (12 %). No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO. Tampoco se detalla el numero de parametros activos por token, un dato clave en arquitecturas MoE que no aparece en la informacion proporcionada.

La etiqueta "abliterated" indica que se ha aplicado una tecnica de ablacion de direcciones de rechazo en el espacio de activaciones, con el objetivo de eliminar las respuestas de negativa del modelo alineado original. La model card no documenta el metodo exacto ni el grado de intervencion. La distribucion se describe como "clean Tiiny-compatible", lo que sugiere una reorganizacion de los pesos para compatibilidad con la herramienta Tiiny, aunque no se aportan detalles tecnicos adicionales sobre el proceso.

## Capacidades

- Generacion de texto y razonamiento, con etiqueta explicita "reasoning" y modo "thinking".
- Generacion y comprension de codigo, con etiquetas "coding" y "code".
- Uso de herramientas y function calling, con etiquetas "tool-use" y "agentic".
- Flujos agenticos y razonamiento multi-paso, segun las etiquetas "agent" y "agentic".
- Entrada multimodal imagen-texto, segun el pipeline declarado `image-text-to-text`.
- Conversacion multi-turno, con etiqueta "conversational".
- Comportamiento sin censura ("uncensored") y sin mecanismos de rechazo ("abliterated").
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Generacion de codigo en produccion: el modelo puede integrarse en pipelines de CI/CD para autocompletar funciones, generar tests o proponer parches, apoyandose en sus capacidades de codigo y su soporte de tool calling para consultar repositorios o ejecutar comandos.
- Agentes de desarrollo autonomos: gracias a las etiquetas "agent" y "agentic", puede emplearse en bucles de razonamiento multi-paso que planifican tareas, invocan herramientas y verifican resultados, por ejemplo en la resolucion de issues de un repositorio.
- Asistente de programacion en IDE: con el modo "thinking" y la conversacion multi-turno, puede mantener el contexto de una sesion de depuracion y explicar errores o proponer refactorizaciones.
- Procesamiento de documentacion tecnica con imagenes: el pipeline image-text-to-text permite extraer informacion de diagramas, capturas de pantalla o esquemas de arquitectura y combinarla con texto para generar documentacion o responder preguntas.
- Automatizacion de tareas de analisis de codigo: puede revisar fragmentos de codigo y generar informes de calidad o sugerencias de mejora, integrándose mediante function calling con herramientas de analisis estatico.
- Entornos de investigacion sin restricciones de rechazo: la variante "abliterated" y "uncensored" resulta util para estudiar el comportamiento del modelo en dominios donde el modelo base rechazaria peticiones, como analisis de seguridad ofensiva o generacion de contenido sensible en entornos controlados.
- Chatbot tecnico especializado: con contexto conversacional y capacidades de codigo, puede atender consultas de soporte sobre APIs o lenguajes de programacion en un portal para desarrolladores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (BF16): aproximadamente 72 GB solo para los pesos, mas memoria para el KV cache y activaciones; se requiere un nodo multi-GPU.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 36 GB, viable en una GPU de 48 GB como la A6000 o en dos GPU de 24 GB.
- VRAM estimada en cuantizacion de 4 bits: alrededor de 18-20 GB, lo que permitiria su ejecucion en una RTX 4090 (24 GB) o RTX 3090 (24 GB), siempre que existan pesos cuantizados, dato no confirmado en la informacion disponible.
- GPU recomendadas para servicio en produccion: H100 (80 GB), A100 (80 GB) o multiples A6000; para pruebas en una sola GPU consumer, RTX 4090 o RTX 3090 con cuantizacion.
- Opciones de despliegue: la libreria declarada es transformers; no se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la informacion proporcionada, aunque al ser un modelo de la familia Qwen con safetensors es probable la compatibilidad con vLLM y TGI, extremo no verificado.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.6-Candid-Coder-V1.1-35B-A3B | 35.951.822.704 | no disponible | Apache 2.0 | Merge de KAT-Coder-V2.5-Dev, Sage-A1.5 y Ornith-1.5-35B-A3B; variante abliterated |
| Qwen/Qwen3.6-35B-A3B (base) | no disponible | no disponible | no disponible | Modelo base del que deriva; alineado y con rechazos |
| KAT-Coder-V2.5-Dev | no disponible | no disponible | no disponible | Uno de los modelos fuente del merge (58 %) |
| Ornith-1.5-35B-A3B | no disponible | no disponible | no disponible | Uno de los modelos fuente del merge (12 %) |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- La model card no documenta el numero de parametros activos, la longitud de contexto ni los idiomas soportados, lo que dificulta planificar el despliegue y la capacidad real del modelo.
- No hay resultados de benchmarks publicados; el rendimiento real en codigo, razonamiento o tareas agenticas no esta verificado.
- La condicion "abliterated" y "uncensored" implica que el modelo puede generar contenido que el modelo base rechazaria; esto supone un riesgo de seguridad y de cumplimiento en entornos de produccion y requiere filtros externos.
- Al ser un merge de tres modelos, puede heredar sesgos y comportamientos inconsistentes de cada fuente, con riesgo de alucinacion en tareas de codigo y razonamiento.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin comunidad que valide su calidad ni su estabilidad.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni documentacion sobre el origen de los datos de entrenamiento de los modelos fusionados.
- El pipeline declarado es image-text-to-text, pero no se detalla que componentes de vision incluye ni como se comporta en tareas multimodales.
- No se confirma la existencia de pesos cuantizados (GGUF, AWQ, GPTQ) para facilitar el despliegue en hardware consumer.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/977895k/Qwen3.6-Candid-Coder-V1.1-35B-A3B
- Modelo fuente del merge: https://huggingface.co/DarkKitsune/Qwen3.6-Candid-Coder-V1.1-35B-A3B
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Paper, blog, repositorio o demo: no disponibles en la informacion proporcionada.
