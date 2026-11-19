# ibm-granite/granite-4.0-h-1b-GGUF

## Resumen

Granite-4.0-h-1b es un modelo de lenguaje de 1.460 millones de parametros desarrollado por IBM dentro de la familia Granite 4.0. Este repositorio concreto contiene la version cuantizada en formato GGUF del modelo base `ibm-granite/granite-4.0-h-1b`, preparada para su ejecucion con llama.cpp y compatible con la API de OpenAI a traves de `llama serve`. El sufijo "h" de la nomenclatura corresponde a la variante hibrida de la familia Granite 4.0, y el modelo base se distribuye bajo licencia Apache 2.0.

El modelo resuelve el problema de desplegar un LLM pequeno y ligero en entornos donde no hay GPU dedicada o donde se prioriza la eficiencia energetica: al estar en formato GGUF con multiples cuantizaciones, puede ejecutarse en CPU, en GPUs de consumo e incluso en dispositivos con recursos limitados. Su ventana de contexto de hasta 131.072 tokens (128k) es notable para su tamano y lo hace util para tareas de recuperacion de informacion con documentos extensos.

La relevancia actual radica en que IBM publica la familia Granite 4.0 con un enfoque empresarial y permisivo (Apache 2.0), lo que permite uso comercial sin restricciones adicionales. Este repositorio GGUF facilita el despliegue en produccion mediante llama.cpp, con instrucciones explicitas de contexto y compatibilidad con endpoints estilo OpenAI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido (familia Granite 4.0, variante "h"); detalles completos en la model card del modelo base |
| Parametros totales | 1.461.538.368 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 131.072 tokens (entrenado hasta 128k; sin embeddings posicionales, admite contextos mas largos) |
| Tipos de cuantizacion | Multiples cuantizaciones GGUF (el ejemplo de la model card usa Q8_0) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base pertenece a la familia Granite 4.0 de IBM, identificada con el sufijo "h" que corresponde a la variante hibrida. La model card de este repositorio GGUF no detalla la composicion exacta de la arquitectura mas alla de remitir a la model card del modelo base `ibm-granite/granite-4.0-h-1b`. Un dato tecnico relevante que si se explicita es que el modelo no utiliza embeddings posicionales, lo que en la practica permite soportar contextos arbitrariamente largos; sin embargo, IBM recomienda limitar el contexto a 131.072 tokens en tiempo de ejecucion porque el entrenamiento se realizo sobre texto de hasta 128k tokens.

No se dispone en la informacion proporcionada de datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO u otras fases de alineacion. Tampoco se detallan innovaciones como decodificacion especulativa o mecanismos de atencion lineal. Toda esta informacion deberia consultarse en la model card del modelo base.

## Capacidades

- Generacion de texto conversacional: el modelo esta etiquetado como "conversational" y "language", lo que indica soporte para dialogos multi-turno.
- Contexto largo: ventana de hasta 131.072 tokens recomendada, adecuada para procesar documentos extensos o historiales de conversacion largos.
- Compatibilidad con la API de OpenAI: `llama serve` expone el endpoint `/v1/chat/completions`, lo que permite integrarlo con clientes existentes.
- Ejecucion local eficiente: al ser un modelo de 1.46B en GGUF, puede correr en CPU y GPUs de consumo.
- Capacidades especificas adicionales (tool calling, agentes, vision, audio, thinking mode): no disponibles en la informacion proporcionada.
- Soporte multilingue: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente conversacional local: con 1.46B de parametros y formato GGUF, el modelo puede desplegarse en un portatil o en un servidor sin GPU para ofrecer un chatbot de atencion basica con latencia aceptable y sin dependencia de la nube.
- Procesamiento de documentos largos: gracias a su contexto de 131.072 tokens, puede resumir contratos, informes o articulos extensos en una sola pasada sin necesidad de chunking.
- Prototipado rapido con API OpenAI-compatible: mediante `llama serve` se expone `/v1/chat/completions`, lo que permite sustituir un endpoint de OpenAI por el modelo local en fases de desarrollo sin reescribir el codigo cliente.
- Generacion de texto en entornos con recursos limitados: al ejecutarse en CPU con cuantizaciones bajas, es adecuado para sistemas embebidos, Raspberry Pi o contenedores sin GPU.
- Clasificacion y extraccion de informacion: modelos pequenos como este son utiles para tareas de etiquetado, extraccion de entidades o resumen de campos estructurados en pipelines de bajo coste.
- Filtrado y preprocesado en pipelines RAG: puede actuar como primer nivel de filtrado o reescritura de consultas antes de invocar un modelo mayor, reduciendo costes.
- Educacion e investigacion: su tamano y licencia Apache 2.0 lo hacen apropiado para experimentacion academica y para estudiar el comportamiento de modelos hibridos pequenos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; para un modelo de 1.46B de parametros, las cuantizaciones tipicas (Q4_K_M, Q5_K_M, Q8_0) ocupan aproximadamente entre 1 y 2 GB de pesos, aunque este dato no se confirma en la informacion proporcionada.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Cabe en GPU de consumo: previsiblemente si, dado el tamano del modelo, aunque no se confirma en la documentacion.
- Opciones de despliegue: llama.cpp (CLI y servidor), con `llama cli` para chat interactivo y `llama serve` para exponer una API compatible con OpenAI. El repositorio esta etiquetado como `endpoints_compatible`.
- Latencia y throughput: no disponibles. La model card indica la build de llama.cpp recomendada (`b11798`) y la version de Transformers (`5.20.2`).
- Parametros recomendados: fijar el contexto con `-c 131072` al lanzar `llama cli` o `llama serve`.

## Comparativa con modelos similares

No disponible: la informacion proporcionada no incluye datos de benchmarks ni especificaciones de modelos alternativos que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de este tamano; no se aportan evaluaciones especificas.
- Limitaciones de contexto: aunque el modelo no usa embeddings posicionales y admite contextos arbitrariamente largos, IBM recomienda limitar el contexto a 131.072 tokens en tiempo de ejecucion porque el entrenamiento se realizo con hasta 128k tokens.
- Limitaciones de idioma: no se especifican los idiomas soportados, por lo que no se puede garantizar un rendimiento adecuado en castellano.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial sin restricciones adicionales, pero conviene revisar la model card del modelo base para cualquier condicion adicional.
- Caveat de produccion: este repositorio es una conversion GGUF del modelo base; para entender el comportamiento completo, la composicion del entrenamiento y las limitaciones reales, es imprescindible consultar la model card de `ibm-granite/granite-4.0-h-1b`.
- El repositorio ocupa 19.2 GB por incluir multiples cuantizaciones; conviene descargar solo el fichero GGUF necesario.

## Enlaces

- Repositorio GGUF: https://huggingface.co/ibm-granite/granite-4.0-h-1b-GGUF
- Modelo base: https://huggingface.co/ibm-granite/granite-4.0-h-1b
- Documentacion de llama.cpp: https://github.com/ggml-org/llama.cpp
- Referencia de `llama cli`: https://github.com/ggml-org/llama.cpp/blob/master/tools/cli/README.md
- Referencia de `llama serve`: https://github.com/ggml-org/llama.cpp/blob/master/tools/server/README.md
