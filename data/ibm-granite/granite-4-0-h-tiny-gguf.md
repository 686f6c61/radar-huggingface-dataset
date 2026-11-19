# ibm-granite/granite-4.0-h-tiny-GGUF

## Resumen

Granite-4.0-h-tiny es un modelo de lenguaje de aproximadamente 6.940 millones de parametros desarrollado por IBM dentro de la familia Granite 4.0. Esta ficha concreta corresponde a la version cuantizada en formato GGUF, publicada en el repositorio `ibm-granite/granite-4.0-h-tiny-GGUF`, pensada para su ejecucion con llama.cpp en hardware de consumo y entornos de despliegue ligero. El modelo base es `ibm-granite/granite-4.0-h-tiny`, del que esta publicacion es una conversion con multiples niveles de cuantizacion.

La relevancia de esta version radica en que permite ejecutar un modelo de la familia Granite 4.0 en local mediante llama.cpp, con soporte de una ventana de contexto de hasta 131.072 tokens en tiempo de ejecucion (entrenado sobre textos de hasta 128k) y sin uso de embeddings posicionales, lo que en la practica permite contextos arbitrariamente largos. La licencia Apache 2.0 facilita el uso comercial y la integracion en pipelines propios. El repositorio acumula 17.735 descargas y 29 likes, y esta etiquetado como compatible con endpoints conversacionales.

La informacion disponible sobre esta publicacion es fundamentalmente la model card de la version GGUF, que remite a la model card del modelo base para los detalles completos de arquitectura y entrenamiento. Los datos que no aparecen en la informacion proporcionada se marcan explicitamente como no disponibles en esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de la familia Granite 4.0; la model card GGUF no detalla la arquitectura) |
| Parametros totales | 6.939.037.248 (aproximadamente 6,94 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | hasta 131.072 tokens en tiempo de ejecucion; entrenado sobre textos de hasta 128k; sin embeddings posicionales, por lo que admite contextos arbitrariamente largos |
| Tipos de cuantizacion | multiples cuantizaciones GGUF (se cita Q4_K_M como ejemplo; el listado completo no se detalla en la informacion disponible) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (para llama.cpp); el modelo base se distribuye presumiblemente en safetensors, aunque no se confirma en la informacion disponible |

## Arquitectura y entrenamiento

La model card de esta publicacion GGUF no incluye detalles sobre la arquitectura interna del modelo base ni sobre la composicion del dataset de entrenamiento, el numero de tokens utilizados o si se aplicaron fases de RLHF o DPO. Lo que si se documenta es una caracteristica tecnica relevante: el modelo no utiliza embeddings posicionales, lo que le permite, segun la model card, soportar contextos arbitrariamente largos en inferencia. A pesar de esa flexibilidad, IBM recomienda limitar el contexto a 131.072 tokens en tiempo de ejecucion, dado que el entrenamiento se realizo sobre textos de hasta 128k tokens.

La unica informacion de entrenamiento disponible es de tipo operativo: la model card indica que la conversion GGUF se valido con la build `b11798` de llama.cpp y con Transformers `5.20.2`. Cualquier dato adicional sobre datos de entrenamiento, tokenizador, atencion (estandar, linear o hibrida) o innovaciones como decodificacion especulativa debe consultarse en la model card del modelo base `ibm-granite/granite-4.0-h-tiny`, que no forma parte de la informacion proporcionada en esta ficha.

## Capacidades

- Generacion de texto conversacional: la model card la etiqueta como `conversational` y muestra su uso mediante el endpoint `/v1/chat/completions` de `llama serve`, compatible con la API de OpenAI.
- Ejecucion local con llama.cpp: soporte nativo mediante `llama cli` y `llama serve`, con instrucciones concretas de uso en la model card.
- Contexto largo: admite ventanas de hasta 131.072 tokens en tiempo de ejecucion y, por ausencia de embeddings posicionales, tecnicamente contextos mayores.
- Compatibilidad con endpoints: el repositorio esta etiquetado como `endpoints_compatible`, lo que facilita el despliegue detras de servidores compatibles con la API de OpenAI.
- Capacidades de razonamiento, codigo, matematicas, vision, tool calling, agentes o multilingues: no disponibles en la informacion proporcionada para esta publicacion.
- Modo thinking u otras capacidades especiales: no disponible.

## Casos de uso

- Servidor de chat local compatible con OpenAI: mediante `llama serve` se puede exponer el modelo en `/v1/chat/completions` y conectar cualquier cliente que hable la API de OpenAI. Es adecuado porque la model card documenta explicitamente este flujo con ejemplos de `curl`.
- Prototipado rapido en estaciones de trabajo: con `llama cli` y la cuantizacion Q4_K_M se puede lanzar una sesion interactiva o un prompt de un solo turno sin infraestructura adicional, lo que acelera la evaluacion de prompts y respuestas.
- Procesamiento de documentos largos: gracias a la ventana de hasta 131.072 tokens se pueden introducir contratos, informes o transcripciones extensas en una sola peticion para tareas de resumen o extraccion, siempre que el hardware permita mantener el contexto en memoria.
- Asistentes internos para equipos de desarrollo: al ser Apache 2.0 y ejecutarse en local, puede integrarse en entornos con requisitos de privacidad de datos, sin enviar contenido a servicios externos.
- Backend de aplicaciones de chat multi-turno: la etiqueta `conversational` y el endpoint compatible con OpenAI permiten integrarlo como backend de interfaces de chat existentes cambiando unicamente la URL base.
- Evaluacion comparativa de cuantizaciones: al publicarse varias cuantizaciones GGUF, el repositorio sirve para medir el compromiso entre calidad, VRAM y velocidad en un mismo modelo antes de fijar una configuracion de produccion.
- Despliegue en entornos con recursos limitados: el formato GGUF y las cuantizaciones de 4 bits permiten ejecutar un modelo de aproximadamente 6,94 mil millones de parametros en equipos sin GPU de centro de datos, lo que encaja en laboratorios, demos y pruebas piloto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de la version GGUF no incluye metricas de MMLU, HumanEval, GSM8K ni comparaciones numericas con otros modelos; remite a la model card del modelo base para cualquier evaluacion.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial en la informacion proporcionada. Como referencia orientativa a partir del tamano del modelo (6,94 mil millones de parametros), una cuantizacion de 4 bits requiere del orden de 4-5 GB solo para los pesos, a lo que hay que sumar la memoria de la cache KV, que crece con el contexto y puede ser considerable con ventanas de 131.072 tokens.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada oficialmente; el formato GGUF y las cuantizaciones de 4 bits estan disenados para este tipo de hardware, pero la model card no publica requisitos minimos.
- Opciones de despliegue: llama.cpp mediante `llama cli` y `llama serve` (documentado en la model card, build `b11798`); otros runners compatibles con GGUF como Ollama, vLLM o TGI no se mencionan en la informacion disponible.
- Latencia y throughput: no disponibles. La model card solo recomienda fijar el contexto explicitamente con `-c 131072` y no ofrece cifras de rendimiento.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de benchmarks ni especificaciones de modelos alternativos que permitan una comparacion rigurosa de parametros, contexto, rendimiento y licencia.

## Limitaciones y advertencias

- La model card de esta publicacion GGUF es minima y remite al modelo base; no documenta sesgos, tasas de alucinacion ni evaluaciones de seguridad, por lo que estos aspectos deben verificarse en la model card de `ibm-granite/granite-4.0-h-tiny`.
- Idiomas soportados no disponibles: no se puede garantizar el comportamiento en castellano ni en otros idiomas sin evaluacion propia.
- Aunque el modelo admite tecnicamente contextos arbitrariamente largos por no usar embeddings posicionales, solo fue entrenado hasta 128k; superar 131.072 tokens en tiempo de ejecucion puede degradar la calidad de forma no documentada.
- El uso de contextos muy largos incrementa la memoria de la cache KV y puede provocar caidas de rendimiento o errores de memoria insuficiente en hardware de consumo.
- Las cuantizaciones GGUF introducen perdida de precision respecto al modelo base; la model card no publica comparativas de calidad entre cuantizaciones, por lo que conviene validar la elegida en la tarea concreta.
- La licencia Apache 2.0 permite uso comercial, pero deben respetarse las condiciones de la licencia y las politicas de uso de IBM aplicables al modelo base; estas ultimas no se detallan en la informacion disponible.
- La model card fija la build `b11798` de llama.cpp y Transformers `5.20.2` como referencia de validacion; versiones muy distintas pueden presentar incompatibilidades.

## Enlaces

- Repositorio GGUF en Hugging Face: https://huggingface.co/ibm-granite/granite-4.0-h-tiny-GGUF
- Modelo base en Hugging Face: https://huggingface.co/ibm-granite/granite-4.0-h-tiny
- Documentacion de llama.cpp: https://github.com/ggml-org/llama.cpp
- Referencia de flags de `llama cli`: https://github.com/ggml-org/llama.cpp/blob/master/tools/cli/README.md
- Referencia de flags de `llama serve`: https://github.com/ggml-org/llama.cpp/blob/master/tools/server/README.md
