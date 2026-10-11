# mradermacher/Magidonia-24B-v4.3-heretic-v4-GGUF

## Resumen

Magidonia-24B-v4.3-heretic-v4-GGUF es un repositorio de cuantizaciones estáticas en formato GGUF publicado por mradermacher a partir del modelo Darkknight535/Magidonia-24B-v4.3-heretic-v4. No se trata de un modelo entrenado desde cero ni de un ajuste nuevo: es una conversión del checkpoint original a GGUF para su ejecución en llama.cpp y en los runners que lo integran (Ollama, LM Studio, koboldcpp, text-generation-webui, entre otros), sin necesidad de transformers ni de GPU de gama alta.

El modelo de origen pertenece a la familia de variantes etiquetadas como heretic, abliterated y decensored, es decir, ajustes en los que se ha aplicado una ablación de la dirección de rechazo (abliteration) para reducir la tasa de negativas del modelo ante determinadas peticiones. El repositorio acumula 460 descargas y 0 likes, y el checkpoint base declara 23.572.403.200 parámetros (~23,57B), lo que lo sitúa en la gama de 24B.

Su interés práctico reside en la disponibilidad de once cuantizaciones que abarcan desde 9,0 GB (Q2_K) hasta 25,2 GB (Q8_0), lo que permite desplegar un modelo de ~24B en equipos de consumo con 12-16 GB de VRAM en las variantes de 4 bits. La model card no documenta arquitectura, longitud de contexto, licencia, dataset de entrenamiento ni evaluaciones, por lo que la información técnica verificable es muy limitada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no la especifica; el recuento de 23,57B parámetros es compatible con un transformer denso de ~24B, sin confirmar) |
| Parametros totales | 23.572.403.200 (~23,57B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | GGUF (este repositorio); el modelo base se distribuye en safetensors |
| Autor de la cuantizacion | mradermacher |
| Modelo base | Darkknight535/Magidonia-24B-v4.3-heretic-v4 |
| Libreria declarada | transformers (etiqueta del repositorio); pesos en GGUF |
| Etiquetas | heretic, uncensored, decensored, abliterated, conversational, endpoints_compatible |
| Tamano del repositorio | 161,4 GB |
| Descargas / likes | 460 / 0 |
| Fecha de creacion | 2026-02-19 |
| Ultima actualizacion | 2026-10-10 |

## Arquitectura y entrenamiento

La model card del repositorio de cuantización no aporta ningún dato sobre la arquitectura del modelo base: no se indica si es un transformer denso, un MoE o una arquitectura híbrida, ni el número de capas, cabezas de atención, tamaño de vocabulario o tipo de tokenizador. Tampoco se documenta la longitud de contexto soportada. El único dato estructural verificable es el recuento de parámetros del checkpoint base (23.572.403.200), que sitúa al modelo en la gama de 24B.

Respecto al entrenamiento, no hay información sobre número de tokens, composición del dataset, fases de ajuste supervisado, RLHF o DPO. Lo único inferible a partir de las etiquetas es que se ha aplicado algún procedimiento de abliteration (eliminación de la dirección de rechazo en el espacio de activaciones) sobre un modelo conversacional previo, dado que el repositorio se marca como heretic, abliterated y decensored. La model card no describe qué herramienta o metodología se usó para ello ni qué evaluación se hizo después.

En cuanto al proceso de cuantización, la metadata interna de mradermacher indica quantize_version 2, output_tensor_quantised 1 y convert_type hf, es decir, cuantizaciones estáticas generadas a partir de los tensores del checkpoint en formato HuggingFace. Existe además un repositorio separado con cuantizaciones ponderadas con matriz de importancia (imatrix), publicado como Magidonia-24B-v4.3-heretic-v4-i1-GGUF, que según el propio autor suele ofrecer mejor calidad que las cuantizaciones estáticas de tamaño equivalente.

## Capacidades

- Generación de texto conversacional: el repositorio está etiquetado como conversational, por lo que el uso previsto es el diálogo multi-turno con formato de chat.
- Reducción de rechazos: al proceder de un ajuste abliterated/decensored, se espera una tasa de negativas mucho menor que la del modelo original ante peticiones que un modelo alineado rechazaría. No hay medición publicada de esta reducción.
- Generación creativa y de rol: es el escenario típico de los modelos abliterated, aunque la model card no lo documenta explícitamente.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: no disponibles; el único idioma declarado es el inglés.
- Modo de pensamiento explícito, visión, audio u otras modalidades: no disponible (no documentado).
- Ejecución local en CPU y GPU: garantizada por el formato GGUF y por la compatibilidad con llama.cpp, que es el único aspecto funcional confirmado del repositorio.

## Casos de uso

- Despliegue local en hardware de consumo: con las cuantizaciones Q4_K_S (13,6 GB) o Q4_K_M (14,4 GB) el modelo puede ejecutarse en una GPU de 16 GB de VRAM o, con offloading parcial, en equipos de 12 GB, cubriendo escenarios de asistente personal sin conexión a servicios en la nube.
- Generación creativa y escritura asistida: el ajuste decensored permite producir narrativa, guiones o diálogos sin los rechazos típicos de los modelos alineados, útil en escritura de ficción y proyectos editoriales que requieren contenido sin filtros previos.
- Roleplay y personajes conversacionales: la etiqueta conversational y la ausencia de alineación restrictiva lo hacen apto para bots de personaje en aplicaciones de entretenimiento, con la salvedad de que no hay evaluación pública de coherencia en diálogos largos.
- Investigación sobre abliteration y alineación: sirve como punto de comparación frente al modelo original para estudiar cómo varían la tasa de rechazo, la coherencia y la utilidad percibida tras eliminar la dirección de rechazo, siempre que se disponga también del checkpoint base.
- Generación por lotes sin conexión: al no requerir API externa, es adecuado para pipelines nocturnos de síntesis de texto sobre grandes volúmenes de prompts en entornos con requisitos de confidencialidad de datos (documentos internos que no pueden salir de la organización).
- Prototipado de aplicaciones de IA generativa en local: con Q2_K (9,0 GB) o Q3_K_S (10,5 GB) es posible validar prompts, plantillas de chat y flujos de aplicación en un portátil con GPU de 12 GB antes de decidir un despliegue mayor.
- Sustitución de modelos censurados en tareas de análisis de contenido sensible: útil en moderación, análisis de discurso o investigación en ciencias sociales donde las negativas del modelo interfieren con la tarea, asumiendo que la salida requiere revisión humana obligatoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio de cuantización no incluye MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra métrica, y la búsqueda web no ha devuelto documentación adicional sobre este modelo. Tampoco se publican mediciones de perplejidad de las cuantizaciones; la única referencia gráfica incluida en la model card enlaza a un gráfico genérico de comparación de tipos de cuantización, no a datos medidos sobre este modelo concreto.

## Requisitos de hardware

| Cuantizacion | Tamano del fichero | VRAM minima estimada |
|---|---|---|
| Q2_K | 9,0 GB | ~10,5 GB |
| Q3_K_S | 10,5 GB | ~12 GB |
| Q3_K_M | 11,6 GB | ~13 GB |
| Q3_K_L | 12,5 GB | ~14 GB |
| IQ4_XS | 13,0 GB | ~14,5 GB |
| Q4_K_S | 13,6 GB | ~15 GB |
| Q4_K_M | 14,4 GB | ~16 GB |
| Q5_K_S | 16,4 GB | ~18 GB |
| Q5_K_M | 16,9 GB | ~18,5 GB |
| Q6_K | 19,4 GB | ~21 GB |
| Q8_0 | 25,2 GB | ~27 GB |

La columna de VRAM es una estimación propia a partir del tamaño del fichero más la sobrecarga de pesos auxiliares, caché KV y buffers de contexto; no procede de datos publicados por el autor y debe validarse en el hardware concreto.

- GPU de consumo: cabe en RTX 3060 12 GB (Q2_K, Q3_K_S, Q3_K_M), RTX 4070 Ti / 4080 16 GB (hasta Q4_K_M) y RTX 3090 / 4090 24 GB (hasta Q6_K, y Q8_0 con contexto reducido u offloading de capas).
- GPU de centro de datos: A100 40 GB, L40S 48 GB, H100 80 GB y similares admiten Q8_0 completo con contexto largo y varios procesos concurrentes.
- CPU y RAM: todas las cuantizaciones pueden ejecutarse íntegramente en CPU con llama.cpp, requiriendo RAM libre equivalente al tamaño del fichero más el contexto; el rendimiento dependerá del número de núcleos y del ancho de banda de memoria.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, text-generation-webui, llama-cpp-python y bindings equivalentes. vLLM dispone de soporte GGUF experimental; TGI no soporta GGUF de forma nativa, por lo que requeriría el checkpoint en safetensors.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo para ninguna de las cuantizaciones.

## Comparativa con modelos similares

Comparativa dentro del propio ecosistema del modelo, con los datos disponibles:

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Magidonia-24B-v4.3-heretic-v4-GGUF (este repo) | 23,57B | no disponible | no disponible | GGUF |
| Darkknight535/Magidonia-24B-v4.3-heretic-v4 (base) | 23,57B | no disponible | no disponible | safetensors |
| mradermacher/Magidonia-24B-v4.3-heretic-v4-i1-GGUF | 23,57B | no disponible | no disponible | GGUF (imatrix) |

Alternativas de la misma gama de tamaño, según su documentación pública (los datos de contexto y licencia corresponden a los modelos originales, no a cuantizaciones de terceros):

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Mistral Small 3 24B | ~24B | 32k | Apache 2.0 | Uso comercial permitido, ampliamente soportado en llama.cpp y vLLM |
| Gemma 2 27B | 27B | 8k | Gemma Terms of Use | Requiere aceptar condiciones de uso específicas de Google |
| Qwen2.5 32B | ~32B | 128k | Apache 2.0 | Mayor tamaño, no cabe en GPU de consumo sin offloading agresivo |

No se dispone de resultados de benchmarks que permitan comparar el rendimiento real de Magidonia-24B frente a estas alternativas, ni de información sobre la licencia del modelo base que condicione su uso comercial. La comparación anterior es, por tanto, únicamente estructural (tamaño, contexto declarado, licencia y formatos disponibles).

## Limitaciones y advertencias

- Licencia no declarada: el repositorio no especifica licencia, lo que impide determinar si el uso comercial está permitido. La licencia del modelo base tampoco se documenta en la información disponible, de modo que la cadena de derechos es indeterminada. Cualquier uso en producción debería aclararse antes con el autor del modelo base.
- Ausencia total de evaluaciones: no hay benchmarks, ni mediciones de perplejidad, ni comparaciones con el modelo original que permitan estimar la pérdida de calidad introducida por la abliteration o por la cuantización.
- Modelo abliterated: la eliminación de la dirección de rechazo puede degradar la coherencia, la adherencia a instrucciones y la calidad del razonamiento, además de aumentar la probabilidad de generar contenido dañino, sesgado o legalmente problemático. No debe desplegarse de cara al público sin una capa de filtrado y revisión propia.
- Riesgo de alucinación: es un modelo de lenguaje sin recuperación de información integrada ni datos publicados sobre fiabilidad factual; toda afirmación generada debe verificarse en aplicaciones de producción.
- Idioma: solo se declara inglés. No hay evidencia de competencia en castellano ni en otros idiomas.
- Longitud de contexto desconocida: al no documentarse, no es posible planificar aplicaciones que dependan de ventanas largas (análisis de documentos extensos, conversaciones multi-turno prolongadas) sin hacer pruebas empíricas.
- Cuantizaciones de baja precisión: Q2_K y Q3_K_* implican pérdida apreciable de calidad respecto a Q6_K o Q8_0; la propia model card etiqueta Q3_K_M como "lower quality". Para uso serio conviene partir de Q4_K_M o superior.
- Adopción muy baja: 460 descargas y 0 likes, sin issues ni evaluaciones de terceros, lo que reduce la confianza sobre el comportamiento real del modelo y dificulta resolver problemas por vía comunitaria.
- Sin metadatos de la plantilla de chat: la model card no incluye la plantilla de prompt ni los tokens especiales, por lo que habrá que extraerla del propio GGUF antes de integrarlo en una aplicación conversacional.

## Enlaces

- Repositorio de cuantizaciones: https://huggingface.co/mradermacher/Magidonia-24B-v4.3-heretic-v4-GGUF
- Modelo base: https://huggingface.co/Darkknight535/Magidonia-24B-v4.3-heretic-v4
- Cuantizaciones ponderadas (imatrix): https://huggingface.co/mradermacher/Magidonia-24B-v4.3-heretic-v4-i1-GGUF
- Página de resumen y descargas del cuantizador: https://hf.tst.eu/model#Magidonia-24B-v4.3-heretic-v4-GGUF
- Preguntas frecuentes y peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- README de referencia sobre uso de ficheros GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de tipos de cuantización: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9

Nota: la búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo, su autor o su modelo base; los enlaces anteriores son los únicos verificables a partir de la información disponible.
