# mradermacher/Patent-Instruct-Extended-GGUF

## Resumen

Patent-Instruct-Extended-GGUF es la versión cuantizada en formato GGUF del modelo arcee-ai/Patent-Instruct-Extended, un merge de aproximadamente 10.000 millones de parámetros orientado a tareas de dominio legal y de patentes en inglés. Lo publica mradermacher, un conocido creador de cuantizaciones GGUF para la comunidad, y está pensado para ejecutar el modelo en hardware de consumo mediante llama.cpp y herramientas compatibles. El modelo subyacente procede de la familia Patent-Instruct de Arcee AI y se construyó combinando pesos mediante mergekit, tomando como referencia arcee-ai/Patent-Instruct-7b.

Este repositorio no aporta un modelo nuevo desde el punto de vista arquitectónico: es una distribución de cuantizaciones estáticas del modelo original, con 12 variantes que van desde Q2_K (3,8 GB) hasta f16 (20,1 GB). Su relevancia práctica radica en que permite desplegar un modelo de casi 10.000 millones de parámetros en GPUs de consumo con pérdida de calidad controlada, algo imposible con los pesos completos en precisión nativa.

La licencia es Apache 2.0, lo que facilita el uso comercial, y el idioma declarado es únicamente inglés. No se dispone de información pública sobre la longitud de contexto, la composición del dataset de entrenamiento ni resultados de benchmarks en la documentación proporcionada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de LLaMA; el modelo base es un merge con mergekit) |
| Parametros totales | 9.976.549.376 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo original en safetensors |
| Tamano del repositorio | 88,0 GB |
| Modelo base | arcee-ai/Patent-Instruct-Extended |
| Modelo de referencia del merge | arcee-ai/Patent-Instruct-7b |

## Arquitectura y entrenamiento

El modelo subyacente es un merge construido con mergekit, según las etiquetas del repositorio, y toma como referencia arcee-ai/Patent-Instruct-7b junto con la familia Patent-Instruct de Arcee AI. El recuento real de parámetros en safetensors es de 9.976.549.376, lo que sitúa el modelo en la franja de los 10B, coherente con una arquitectura tipo LLaMA (decoder-only, atención causal estándar) escalada respecto al modelo de 7B del que parte.

No se dispone de información pública sobre el número de tokens de entrenamiento, la composición del dataset, la existencia de fases de RLHF o DPO, ni innovaciones técnicas concretas (atención lineal, decodificación especulativa, etc.). El repositorio de mradermacher es exclusivamente de cuantización: no documenta el proceso de entrenamiento del modelo original. Las cuantizaciones son estáticas (no hay variantes con imatrix ni ponderadas disponibles según la model card), lo que implica que la calibración se realizó sin dataset de importancia.

## Capacidades

- Generación de texto en inglés con orientación a dominio legal y de patentes, dado el linaje Patent-Instruct del modelo.
- Instrucciones conversacionales: el modelo base deriva de una variante Instruct, por lo que está ajustado para seguir instrucciones.
- Redacción y análisis de documentación técnica y legal (descripciones de patentes, reivindicaciones, resúmenes técnicos), según la temática del modelo.
- Razonamiento sobre texto técnico especializado en inglés.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades de visión, audio o modo thinking: no disponibles.

## Casos de uso

- Redacción asistida de borradores de patentes: el modelo puede generar descripciones técnicas y reivindicaciones a partir de notas de invención, aprovechando su especialización en el dominio de patentes y su ajuste a instrucciones.
- Análisis de reivindicaciones y detección de ambigüedades: útil para revisar la claridad y el alcance de reivindicaciones en inglés antes de presentar una solicitud.
- Resumen de documentación técnica extensa: permite condensar especificaciones, artículos científicos o patentes en resúmenes estructurados para revisión interna.
- Búsqueda y clasificación semántica de patentes: integrado en un pipeline de recuperación, el modelo puede reformular consultas y clasificar resultados por relevancia técnica.
- Asistencia en oficinas de propiedad intelectual: borradores de respuestas a examinadores, comparación de reivindicaciones y generación de informes técnicos preliminares.
- Despliegue local en estaciones de trabajo: gracias a las cuantizaciones Q4_K_M (6,1 GB) y Q5_K_M (7,2 GB), puede ejecutarse en una GPU de consumo de 8-12 GB con llama.cpp u Ollama, sin enviar documentación confidencial a servicios en la nube.
- Prototipado de asistentes legales internos: con licencia Apache 2.0, es viable integrarlo en herramientas internas de despachos o departamentos de I+D sin restricciones de uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización): Q2_K ~4 GB, Q3_K_M ~5,5 GB, Q4_K_M ~7 GB, Q5_K_M ~8 GB, Q6_K ~9 GB, Q8_0 ~11,5 GB, f16 ~21 GB (más overhead de contexto).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080, RTX 4090 para cuantizaciones altas; A100 o H100 para f16 y despliegues concurrentes.
- Cabe en GPU de consumo: sí, con Q4_K_M o Q5_K_M en GPUs de 8-12 GB; Q8_0 requiere 12-16 GB; f16 requiere 24 GB o más.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y cualquier runtime compatible con GGUF. El repositorio incluye la etiqueta `endpoints_compatible`, por lo que es desplegable en Inference Endpoints de Hugging Face.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Patent-Instruct-Extended-GGUF (este) | ~10B | no disponible | Apache 2.0 | GGUF | Cuantizaciones estáticas de un merge especializado en patentes |
| arcee-ai/Patent-Instruct-Extended | ~10B | no disponible | Apache 2.0 | safetensors | Modelo original sin cuantizar; requiere más VRAM |
| arcee-ai/Patent-Instruct-7b | ~7B | no disponible | no disponible | safetensors | Modelo de referencia del merge; menor tamaño, presumiblemente menor calidad en tareas complejas |
| mradermacher/Patent-Instruct-Pro-GGUF | no disponible | no disponible | Apache 2.0 | GGUF | Otro merge de la familia Patent-Instruct (con TencentARC/LLaMA-Pro-8B-Instruct), alternativa cuantizada del mismo autor |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Idioma: el modelo solo declara soporte de inglés; su uso en castellano u otros idiomas no está garantizado y probablemente degrade la calidad.
- Dominio: la especialización en patentes y textos legales puede reducir su rendimiento en tareas generales frente a modelos de propósito general del mismo tamaño.
- Alucinación: como todo modelo generativo, puede inventar referencias, números de patente o citas legales; en dominio legal esto exige revisión humana obligatoria.
- Sesgos: no se documentan evaluaciones de sesgo en la información disponible; el corpus de patentes tiene sesgos de dominio (jerga técnica, sesgo geográfico e institucional).
- Cuantizaciones estáticas sin imatrix: las variantes de baja precisión (Q2_K, Q3_K_S) pueden degradar notablemente la calidad; se recomienda Q4_K_M o superior para uso en producción.
- Contexto desconocido: al no documentarse la longitud de contexto, no se debe asumir una ventana larga; conviene verificar el valor real en la configuración del GGUF antes de diseñar flujos con documentos extensos.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo original y de los modelos fusionados en el merge para confirmar el cumplimiento.
- Fecha de actualización del repositorio: la model card indica 2026-11-06, posterior a la creación (2025-02-11); verificar que los archivos descargados correspondan a la versión esperada.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Patent-Instruct-Extended-GGUF
- Modelo base: https://huggingface.co/arcee-ai/Patent-Instruct-Extended
- Modelo de referencia del merge: https://huggingface.co/arcee-ai/Patent-Instruct-7b
- Página de descargas del autor: https://hf.tst.eu/model#Patent-Instruct-Extended-GGUF
- Variante Pro cuantizada: https://huggingface.co/mradermacher/Patent-Instruct-Pro-GGUF
- Solicitudes de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de calidad de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
