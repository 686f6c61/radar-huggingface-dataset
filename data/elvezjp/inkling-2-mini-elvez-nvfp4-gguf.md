# elvezjp/Inkling-2-Mini-ELVEZ-NVFP4-gguf

## Resumen

Inkling-2-Mini-ELVEZ-NVFP4-gguf es una cuantizacion en formato GGUF del modelo multimodal Inkling-2-Mini, desarrollado originalmente por Thinking Machines. Se trata de un modelo de tipo image-text-to-text, es decir, capaz de procesar entradas que combinan imagenes y texto y generar respuestas textuales. Esta version concreta ha sido publicada por el usuario elvezjp bajo el identificador elvezjp/Inkling-2-Mini-ELVEZ-NVFP4-gguf, empleando esquemas de cuantizacion NVFP4 y MXFP8 orientados a la inferencia eficiente en hardware compatible con el backend Metal.

El modelo base cuenta con 26.197.792.256 parametros totales (aproximadamente 26,2 mil millones), lo que lo situa en la gama de modelos de gran tamano pero manejables en entornos de inferencia optimizados. El repositorio ocupa 19,6 GB, coherente con pesos cuantizados de un modelo de este tamano. La licencia es Apache 2.0, lo que facilita su uso comercial, aunque el acceso esta restringido (gated) y requiere aceptar condiciones en Hugging Face.

La relevancia de esta ficha radica en que combina un modelo multimodal de gran tamano con un formato de cuantizacion de baja precision (NVFP4) pensado para acelerar la inferencia en GPUs modernas, especialmente en el ecosistema Apple con backend Metal. Los idiomas declarados son japones (ja) e ingles (en).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal image-text-to-text; arquitectura interna no especificada en la informacion) |
| Parametros totales | 26.197.792.256 (26,2 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4, MXFP8 (segun tags del repositorio) |
| Idiomas soportados | japones (ja), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 19,6 GB) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base thinkingmachines/Inkling-2-Mini en la informacion proporcionada. Por la pipeline declarada (image-text-to-text) se trata de un modelo multimodal capaz de recibir imagenes y texto. El numero de parametros totales (26,2 B) se ha confirmado a partir de los datos reales de safetensors del modelo base.

Esta version concreta es una cuantizacion: los pesos originales se han convertido a formatos de baja precision NVFP4 y MXFP8 y empaquetado en GGUF, orientado a inferencia en hardware con soporte Metal (Apple). No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre procesos de RLHF o DPO del modelo base. Tampoco se documentan innovaciones tecnicas especificas del entrenamiento en la informacion disponible.

## Capacidades

- Generacion de texto y conversacion multi-turno (tag conversational).
- Procesamiento de imagenes combinadas con texto (pipeline image-text-to-text): descripcion de imagenes, respuesta a preguntas visuales y tareas que requieren entender contenido grafico junto con instrucciones textuales.
- Soporte multilingue limitado a japones e ingles.
- Compatibilidad con endpoints (tag endpoints_compatible), lo que sugiere integracion con infraestructuras de despliegue estandar.
- Capacidad de tool calling / function calling: no disponible en la informacion.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion.
- Modo thinking, audio u otras capacidades especiales: no disponible en la informacion.

## Casos de uso

- Descripcion automatica de imagenes en japones e ingles: el modelo puede recibir una imagen y generar una descripcion textual, util para accesibilidad o catalogacion de contenido visual en entornos donde se requieran estos dos idiomas.
- Respuesta a preguntas sobre documentos escaneados: al combinar vision y texto, puede extraer informacion de capturas, formularios o diagramas y responder preguntas concretas sobre su contenido.
- Asistencia conversacional bilingue (ja/en): adecuado para chatbots de atencion al cliente que deban alternar entre japones e ingles en una misma conversacion.
- Moderacion y analisis de contenido visual con contexto textual: el modelo puede evaluar imagenes junto con pies de foto o comentarios para clasificar o resumir su contenido.
- Prototipado en hardware Apple: gracias al formato GGUF con cuantizacion NVFP4/MXFP8 y backend Metal, es adecuado para ejecutar inferencia local en equipos con chip de Apple para pruebas y desarrollo.
- Integracion en pipelines de generacion aumentada por recuperacion (RAG) multimodal: puede procesar fragmentos de texto e imagenes recuperados de una base de conocimiento y sintetizar respuestas coherentes.
- Despliegue en endpoints compatibles: el tag endpoints_compatible indica que puede servirse en infraestructuras de inferencia estandar, lo que facilita su uso en produccion para tareas de vision-lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con 26,2 B de parametros y pesos cuantizados en NVFP4 (4 bits), el modelo requeriria aproximadamente 13-14 GB solo para los pesos, mas overhead de activaciones y KV cache. En MXFP8 (8 bits) la estimacion se situa en torno a 26-28 GB. Estas cifras son estimaciones a partir del tamano de parametros, no datos oficiales.
- GPU recomendadas: no disponible en la informacion. Por tamano, seria necesario hardware de gama alta (por ejemplo, A100, H100 o GPUs con suficiente VRAM). El tag Metal sugiere soporte para GPUs integradas de Apple.
- Cabe en consumer GPU: con cuantizacion NVFP4 podria caber en GPUs consumer de 16-24 GB de VRAM, aunque no se confirma oficialmente.
- Opciones de despliegue: llama.cpp (formato GGUF), y potencialmente otros runners compatibles con GGUF. El tag endpoints_compatible sugiere despliegue en endpoints. vLLM, TGI y Ollama no se confirman en la informacion.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini-ELVEZ-NVFP4-gguf | 26,2 B | no disponible | Apache 2.0 | GGUF (NVFP4/MXFP8) | Multimodal ja/en, cuantizado |
| thinkingmachines/Inkling-2-Mini | 26,2 B | no disponible | no disponible | safetensors (base) | Modelo base sin cuantizar |
| Alternativas de 20-30 B multimodales | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion |

No se dispone de informacion suficiente para comparar con modelos alternativos de la misma categoria en terminos de rendimiento o contexto.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en Hugging Face antes de descargar.
- Idiomas limitados: solo japones e ingles declarados; el rendimiento en castellano u otros idiomas no esta garantizado.
- Cuantizacion de baja precision: NVFP4 puede degradar la calidad frente a los pesos originales en tareas sensibles (razonamiento complejo, matematicas, OCR fino).
- Riesgo de alucinacion: inherente a los modelos generativos; no se dispone de evaluaciones especificas de fidelidad para esta version cuantizada.
- Sesgos: no se documentan sesgos conocidos en la informacion disponible.
- Sin benchmarks publicados: no hay datos que permitan validar el rendimiento de esta cuantizacion frente al modelo base.
- Contexto maximo no especificado: se desconoce la ventana de contexto, lo que dificulta planificar usos con documentos largos.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base original (thinkingmachines/Inkling-2-Mini), cuya licencia no se detalla en la informacion.
- Repositorio con muy pocas descargas (1) y sin likes: no hay evidencia de validacion por la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/elvezjp/Inkling-2-Mini-ELVEZ-NVFP4-gguf
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
