# bartowski/XingChen-AGI_Xing4.0-29B-Intent-GGUF

## Resumen

Xing4.0-29B-Intent es un modelo de lenguaje especializado en reconocimiento de intenciones y extracción de información estructurada, desarrollado por XingChen-AGI a partir de Xing4.0-29B-A4B, el modelo semántico de la familia Xing de China Telecom Artificial Intelligence Technology Co., Ltd. Su función principal es convertir lenguaje natural en resultados estructurados (intenciones, slots, entidades, relaciones y eventos) que puedan consumir directamente sistemas de negocio, asistentes inteligentes o pipelines de enrutamiento de peticiones.

El modelo emplea una arquitectura de mezcla de expertos (MoE) con 31.215.031.088 parámetros totales y aproximadamente 4.000 millones de parámetros activos por token, según la descripción del autor ("4B-activated MoE"). Está diseñado para trabajar con esquemas guiados (schema-guided), lo que permite definir de antemano el conjunto de intenciones y campos esperados y obtener una salida alineada con esa estructura. Soporta chino e inglés y se distribuye bajo licencia Apache 2.0.

La ficha que nos ocupa corresponde a la versión cuantizada en formato GGUF publicada por bartowski, que permite ejecutar el modelo en llama.cpp y herramientas compatibles. El repositorio incluye un amplio abanico de cuantizaciones (desde bf16 hasta Q3), generadas con llama.cpp b12174 y con matrices de importancia (imatrix) para preservar la calidad en los niveles más agresivos de compresión.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) transformer, derivada de Xing4.0-29B-A4B |
| Parámetros totales | 31.215.031.088 (31B) |
| Parámetros activos | ~4B (según descripción "4B-activated MoE") |
| Longitud de contexto | no disponible |
| Tipos de cuantización | bf16, Q8_0, Q6_K_L, Q6_K, Q6_K_S, Q5_K_M, Q5_K_S, Q4_K_L, Q4_K_M, IQ4_NL, Q4_1, Q4_K_S, Q4_0, IQ4_XS, IQ3_M, Q3_K_L, Q3_K_M (y sucesivos Q3) |
| Idiomas soportados | chino (zh) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base original se distribuye en safetensors |

## Arquitectura y entrenamiento

Xing4.0-29B-Intent es un modelo de mezcla de expertos con 31B parámetros totales y aproximadamente 4B activos por token, construido sobre Xing4.0-29B-A4B, el modelo semántico de China Telecom. La arquitectura MoE permite mantener una capacidad de representación propia de un modelo de 31B con un coste computacional por token más cercano al de un modelo de 4B, lo que resulta adecuado para despliegues de extracción estructurada con alta concurrencia.

El modelo está especializado mediante un enfoque schema-guided: se le proporciona un esquema que define intenciones, slots y tipos de entidades, y el modelo genera la salida estructurada correspondiente. La model card del autor menciona soporte de decodificación especulativa mediante MTP (multi-token prediction) y el uso de imatrix en el proceso de cuantización. No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición exacta del dataset ni la presencia de fases de RLHF o DPO en la información proporcionada.

## Capacidades

- Reconocimiento de intenciones (intent recognition) a partir de lenguaje natural.
- Relleno de slots (slot-filling) guiado por esquema.
- Extracción de información estructurada (information extraction) con salida alineada a un esquema predefinido.
- Reconocimiento de entidades nombradas (NER).
- Extracción de relaciones (relation extraction).
- Extracción de eventos (event extraction).
- Generación de texto conversacional (pipeline text-generation).
- Soporte multilingüe limitado a chino e inglés.
- Compatible con endpoints de Hugging Face (endpoints_compatible).
- Soporte de decodificación especulativa MTP según la model card del cuantizador.
- No se documenta en la información disponible soporte explícito de tool calling, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Enrutamiento de peticiones en asistentes virtuales: el modelo clasifica la intención del usuario contra un esquema predefinido y devuelve la etiqueta y los slots necesarios para dirigir la consulta al servicio adecuado.
- Extracción de datos en documentos de negocio: a partir de un esquema de campos (por ejemplo, número de factura, fecha, importe), el modelo devuelve la información estructurada lista para insertar en un ERP o CRM.
- Automatización de atención al cliente: interpretación de mensajes multi-turno en chino o inglés para identificar la intención y los parámetros de la solicitud antes de invocar un backend.
- Construcción de pipelines de NER y relación: procesamiento por lotes de textos para poblar bases de conocimiento con entidades y relaciones tipadas.
- Extracción de eventos para monitorización: detección de sucesos (por ejemplo, incidencias o transacciones) con sus argumentos definidos por esquema, útil en analítica operativa.
- Preprocesado para sistemas RAG o de búsqueda: normalización de consultas en lenguaje natural a estructuras de filtros y campos consultables.
- Despliegue en entornos con recursos limitados: gracias a sus ~4B parámetros activos y a las cuantizaciones GGUF, puede ejecutarse en servidores modestos o estaciones de trabajo para tareas de extracción de alto volumen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización: bf16 ~62,45 GB; Q8_0 ~33,22 GB; Q6_K ~27,19 GB; Q5_K_M ~24,00 GB; Q4_K_M ~20,06 GB; IQ4_XS ~17,98 GB; Q3_K_M ~16,85 GB (tamaños de fichero del repositorio GGUF).
- GPU recomendadas: para bf16, H100 80 GB o A100 80 GB; para Q8_0, A100 40 GB o H100; para Q4_K_M e inferiores, RTX 4090 (24 GB), RTX 3090 (24 GB) o A10G (24 GB).
- Compatibilidad con GPU de consumo: sí, las cuantizaciones Q4 y Q3 caben en GPUs de 24 GB e incluso en configuraciones de 16 GB con Q3 y descarga parcial a RAM.
- Opciones de despliegue: llama.cpp (versión b12174 o superior), Ollama, LM Studio y cualquier runtime compatible con GGUF; los endpoints de Hugging Face son compatibles según los tags del repositorio.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato | Especialización |
|---|---|---|---|---|---|---|
| Xing4.0-29B-Intent (este) | 31B | ~4B | no disponible | Apache 2.0 | GGUF, safetensors | Intención y extracción estructurada |
| Xing4.0-29B-A4B | 31B | ~4B | no disponible | no disponible | GGUF, safetensors | Modelo semántico general (base) |
| Alternativas comparables de extracción estructurada | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos alternativos en la información proporcionada que permitan una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Idiomas limitados a chino e inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Riesgo de alucinación en la extracción: el modelo puede generar valores de slots no presentes en el texto de entrada, por lo que se recomienda validación posterior contra el esquema.
- Al ser un modelo especializado en esquemas, su comportamiento fuera de tareas de intención y extracción puede ser inferior al de un modelo generalista del mismo tamaño.
- No se documenta la longitud de contexto, lo que impide planificar con precisión el procesamiento de documentos largos.
- Las cuantizaciones Q3 y Q4 pueden degradar la precisión en tareas de extracción sensibles a matices; para producción se recomienda Q5_K_M o superior.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base Xing4.0-29B-A4B y de los datos de entrenamiento originales.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que la validación comunitaria es inexistente.
- No se documenta soporte de tool calling ni de agentes multi-paso, lo que limita su uso en orquestaciones complejas sin una capa externa.

## Enlaces

- Repositorio GGUF: https://huggingface.co/bartowski/XingChen-AGI_Xing4.0-29B-Intent-GGUF
- Modelo base: https://huggingface.co/XingChen-AGI/Xing4.0-29B-Intent
- Repositorio GitHub: https://github.com/XingChen-AGI/Xing4.0-29B-Intent
- Modelo base en GGUF (Xing4.0-29B-A4B): https://huggingface.co/XingChen-AGI/Xing4.0-29B-A4B-GGUF
- Dataset asociado: https://huggingface.co/datasets/XingChen-AGI/Xing4.0-29B-Intent-oss
- llama.cpp (release b12174): https://github.com/ggml-org/llama.cpp/releases/tag/b12174
