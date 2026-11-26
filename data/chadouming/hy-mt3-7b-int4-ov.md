# chadouming/Hy-MT3-7B-int4-ov

## Resumen

Hy-MT3-7B-int4-ov es una exportacion cuantizada del modelo de traduccion automatica tencent/Hy-MT3-7B, publicada por el usuario chadouming. No se trata de un modelo entrenado desde cero, sino de una conversion a formato OpenVINO Intermediate Representation (IR) con compresion de pesos mixta INT4/INT8, pensada para ejecutarse con la libreria openvino-genai sobre GPUs Intel Arc y CPUs Intel.

El modelo base pertenece a la familia Hunyuan (arquitectura hunyuan_v1_dense) de Tencent y esta especializado en traduccion automatica. Esta version cuantizada reduce el peso del repositorio a 4,9 GB, lo que facilita su despliegue en hardware Intel sin necesidad de GPUs de gran VRAM, manteniendo la licencia Apache-2.0 del modelo original.

Su relevancia actual radica en que permite ejecutar un modelo de traduccion de 7B parametros en infraestructura Intel de gama consumer o en servidores con CPU, mediante el pipeline LLMPipeline y ContinuousBatchingPipeline de openvino-genai. La informacion disponible sobre el modelo base es limitada: no se detallan idiomas soportados, benchmarks ni composicion del dataset de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | hunyuan_v1_dense (transformer denso, segun tag del modelo) |
| Parametros totales | 7B (segun nombre del modelo base) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 asimetrica con grupo 128 y ratio 0,8 (74 % INT4 / 26 % INT8 en capas sensibles) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | OpenVINO IR (exportado con optimum-intel; no safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo base tencent/Hy-MT3-7B emplea la arquitectura hunyuan_v1_dense, un transformer denso de aproximadamente 7B parametros orientado a traduccion automatica. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO.

La innovacion tecnica de esta ficha concreta es el proceso de cuantizacion: se ha utilizado NNCF con compresion asimetrica de pesos INT4, grupo de tamano 128 y ratio 0,8, lo que implica que el 74 % de las capas se comprimen a INT4 y el 26 % restante, considerado sensible, se mantiene en INT8. La exportacion se realizo con optimum-cli (optimum-intel 2.3.0.dev0) sobre openvino 2026.4.1, con la tarea text-generation-with-past y trust-remote-code activado. El resultado es un grafo OpenVINO listo para inferencia con openvino-genai.

## Capacidades

- Generacion de texto orientada a traduccion automatica, segun el pipeline_tag text-generation y el tag translation.
- Conversacion multi-turno (tag conversational).
- Inferencia con cache de clave-valor (task text-generation-with-past).
- Ejecucion con LLMPipeline y ContinuousBatchingPipeline de openvino-genai.
- Despliegue en GPUs Intel Arc y CPUs Intel.
- No se dispone de informacion sobre soporte de tool calling, agentes, vision, audio ni modo thinking.

## Casos de uso

- Traduccion por lotes en servidores con CPU Intel: el formato OpenVINO IR y la cuantizacion INT4 permiten procesar grandes volumenes de texto sin GPU dedicada, usando ContinuousBatchingPipeline para maximizar el throughput.
- Traduccion integrada en aplicaciones de escritorio o edge: al ocupar 4,9 GB y ejecutarse en CPU, puede incorporarse en herramientas locales de traduccion sin depender de la nube.
- Servicio de traduccion en GPUs Intel Arc: el modelo esta optimizado para estas GPUs, lo que permite atender peticiones concurrentes con latencia reducida en estaciones de trabajo Intel.
- Traduccion de documentacion tecnica en pipelines de CI/CD: puede invocarse desde scripts de automatizacion para generar versiones multilingues de documentacion antes de un despliegue.
- Preprocesado o postprocesado de contenido multilingue: integrado en pipelines de NLP que requieran normalizar o convertir texto entre idiomas antes de tareas posteriores.
- Prototipado e investigacion en traduccion automatica: su licencia Apache-2.0 y su formato abierto permiten experimentar y comparar con otros modelos sin restricciones de uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 4,9 GB en INT4/INT8 mixto; la VRAM necesaria para inferencia sera del orden de esa cifra mas el espacio para cache KV, que no se especifica.
- GPU recomendadas: Intel Arc (soporte explicito en la model card).
- CPU: soportado explicitamente; el modelo esta pensado para ejecutarse en CPU Intel mediante openvino-genai.
- GPUs consumer: no se confirma soporte para GPUs NVIDIA o AMD; el formato OpenVINO esta orientado a hardware Intel.
- Opciones de despliegue: openvino-genai (LLMPipeline y ContinuousBatchingPipeline); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| chadouming/Hy-MT3-7B-int4-ov | 7B | no disponible | OpenVINO IR INT4/INT8 | Apache-2.0 | Cuantizado para Intel; sin benchmarks publicados |
| tencent/Hy-MT3-7B | 7B | no disponible | no disponible | Apache-2.0 | Modelo base sin cuantizar; sin datos de rendimiento en la informacion disponible |
| Otros modelos de traduccion de 7B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

## Limitaciones y advertencias

- No se dispone de informacion sobre sesgos del modelo base ni sobre su comportamiento en dominios especificos.
- Riesgo de alucinacion inherente a los modelos generativos; en traduccion puede manifestarse como omisiones o adiciones de contenido.
- Idiomas soportados no documentados: no es posible confirmar la cobertura linguistica real.
- Longitud de contexto no disponible; no se puede garantizar el rendimiento en documentos largos.
- La cuantizacion INT4 puede degradar la calidad de traduccion respecto al modelo original; no hay evaluacion publicada que lo cuantifique.
- El formato OpenVINO limita el despliegue a hardware y toolchain Intel; no es portable a ecosistemas como llama.cpp o vLLM sin reconversion.
- Aunque la licencia es Apache-2.0, conviene verificar las condiciones del modelo base antes de uso comercial en produccion.
- El repositorio no tiene descargas ni likes en el momento de la consulta, por lo que no hay validacion comunitaria del artefacto.

## Enlaces

- Modelo cuantizado: https://huggingface.co/chadouming/Hy-MT3-7B-int4-ov
- Modelo base: https://huggingface.co/tencent/Hy-MT3-7B
- openvino-genai: https://github.com/openvinotoolkit/openvino.genai
