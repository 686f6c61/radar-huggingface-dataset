# ibm-granite/granite-4.0-350m-GGUF

## Resumen

Granite-4.0-350m es un modelo de lenguaje de tipo transformer decoder-only desarrollado por IBM Research dentro de la familia Granite 4.0. Con 352.379.904 parámetros totales, se posiciona como la variante mas pequena de la saga, pensada para tareas de generacion de texto, clasificacion, extraccion de informacion y razonamiento ligero en entornos con recursos muy limitados. Su diseno prioriza la eficiencia: puede ejecutarse en CPU, en GPUs de consumo e incluso en dispositivos con poca memoria, lo que lo hace util para prototipado rapido y despliegues en el borde.

Este repositorio concreto (`ibm-granite/granite-4.0-350m-GGUF`) no contiene el modelo original en safetensors, sino una conversion al formato GGUF con multiples cuantizaciones, generada para su uso con llama.cpp. La model card remite a la ficha del modelo base (`ibm-granite/granite-4.0-350m`) para los detalles completos de entrenamiento, capacidades y evaluacion. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

La relevancia actual de esta ficha radica en que ofrece una via practica para ejecutar un modelo de IBM en hardware modesto mediante llama.cpp, con soporte para la API compatible con OpenAI a traves de `llama serve`. El repositorio ocupa 4,9 GB e incluye varias cuantizaciones, desde BF16 hasta formatos de baja precision.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Granite 4.0; detalles completos en la ficha del modelo base) |
| Parametros totales | 352.379.904 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | BF16 y otras cuantizaciones GGUF incluidas en el repositorio (lista completa no detallada) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (via llama.cpp); el modelo base en safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de su pertenencia a la familia Granite 4.0 y de tratarse de un modelo de lenguaje tipo transformer decoder-only. El repositorio GGUF es una conversion del modelo base `ibm-granite/granite-4.0-350m`, y la model card remite explicitamente a la ficha del modelo original para los detalles de entrenamiento, composicion del dataset, numero de tokens y posibles fases de alineacion (RLHF/DPO). No se dispone de datos sobre innovaciones tecnicas especificas como decodificacion especulativa o atencion lineal en la informacion proporcionada.

La conversion a GGUF se realizo con la etiqueta de build `b11798` de llama.cpp y la version `5.20.2` de Transformers, segun la seccion de Build Information de la model card. El repositorio incluye al menos una cuantizacion BF16 (`granite-4.0-350m-BF16.gguf`) y otras variantes de menor precision, aunque la lista completa no se detalla en la informacion disponible.

## Capacidades

- Generacion de texto conversacional y de un solo turno, con soporte para el formato de chat via `llama cli` y `llama serve`.
- Razonamiento basico y respuesta a instrucciones, segun la naturaleza del modelo base Granite 4.0.
- Integracion con la API compatible con OpenAI (`/v1/chat/completions`) a traves de `llama serve`.
- Ejecucion en CPU y en GPUs de consumo gracias al formato GGUF y a su reducido tamano.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades especiales (thinking mode, vision, audio): no disponible en la informacion proporcionada.

## Casos de uso

- Prototipado rapido de asistentes conversacionales: el modelo puede levantarse con `llama serve` en un puerto local y consumirse mediante la API compatible con OpenAI, lo que permite integrarlo en aplicaciones existentes sin cambiar el cliente HTTP.
- Clasificacion y etiquetado de texto en lote: con 350M parametros y cuantizacion baja, es viable procesar grandes volumenes de documentos en CPU para tareas de categorizacion o extraccion de entidades simples.
- Despliegue en el borde (edge computing): su tamano reducido permite ejecutarlo en dispositivos con poca memoria, como mini-PCs o sistemas embebidos con llama.cpp, para tareas de generacion de texto offline.
- Filtrado y preprocesamiento en pipelines de datos: puede usarse como primer paso para resumir, reformatear o validar texto antes de pasarlo a un modelo mayor, reduciendo coste computacional.
- Educacion y experimentacion: sirve como modelo de referencia para aprender a convertir, cuantizar y desplegar modelos con llama.cpp sin requerir hardware especializado.
- Generacion de texto asistida en herramientas de linea de comandos: la integracion con `llama cli` permite usarlo en scripts de shell para redactar respuestas, explicar fragmentos de codigo o generar documentacion breve.
- Chatbot de soporte basico con contexto limitado: adecuado para preguntas frecuentes y respuestas acotadas donde no se requiere un contexto muy largo ni razonamiento complejo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 352M parametros, la cuantizacion BF16 requiere aproximadamente 0,7 GB de pesos, y las cuantizaciones de 4 bits alrededor de 0,2-0,3 GB, mas overhead de contexto y runtime.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para BF16; GPUs de consumo como RTX 3060, RTX 4060 o superiores son mas que suficientes. Tambien puede ejecutarse en CPU.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna e incluso en iGPUs con memoria compartida.
- Opciones de despliegue: llama.cpp (`llama cli`, `llama serve`), y por extension cualquier runtime compatible con GGUF (Ollama, etc., aunque no se confirman en la informacion proporcionada).
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| granite-4.0-350m (este) | 352M | no disponible | Apache 2.0 | GGUF / safetensors | Hugging Face (IBM) |
| Alternativas de ~350M-500M | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de comparativas directas con otros modelos de la misma categoria en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- Al tratarse de un modelo de 350M parametros, su capacidad de razonamiento, coherencia en contextos largos y conocimiento factual es limitada en comparacion con modelos de mayor tamano.
- Riesgo de alucinacion: como todo modelo de lenguaje, puede generar informacion incorrecta o inventada, especialmente en tareas que requieren conocimiento especifico.
- Sesgos conocidos: no disponible en la informacion proporcionada; se recomienda consultar la ficha del modelo base para advertencias sobre sesgos.
- Limitaciones de contexto e idioma: no disponible en la informacion proporcionada; la model card no detalla la ventana de contexto ni los idiomas soportados.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion con atribucion; no se identifican restricciones adicionales en la informacion disponible.
- Caveat para produccion: al ser una conversion GGUF de la comunidad/IBM, conviene validar la calidad de cada cuantizacion antes de desplegarla; las cuantizaciones de muy baja precision pueden degradar notablemente el rendimiento en un modelo ya pequeno.

## Enlaces

- Repositorio GGUF: https://huggingface.co/ibm-granite/granite-4.0-350m-GGUF
- Modelo base: https://huggingface.co/ibm-granite/granite-4.0-350m
- Documentacion de llama.cpp: https://github.com/ggml-org/llama.cpp
- Referencia de `llama cli`: https://github.com/ggml-org/llama.cpp/blob/master/tools/cli/README.md
- Referencia de `llama serve`: https://github.com/ggml-org/llama.cpp/blob/master/tools/server/README.md
