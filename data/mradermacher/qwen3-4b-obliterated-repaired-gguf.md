# mradermacher/Qwen3-4B-OBLITERATED-repaired-GGUF

## Resumen

`mradermacher/Qwen3-4B-OBLITERATED-repaired-GGUF` es un repositorio de cuantizaciones GGUF generado por mradermacher (nethype GmbH) a partir del modelo `Hatsunama/Qwen3-4B-OBLITERATED-repaired`. Se trata, por tanto, de una conversión de formato y no de un modelo entrenado desde cero: el autor original del ajuste es Hatsunama, y mradermacher únicamente produce los ficheros cuantizados estáticos para su uso con llama.cpp y derivados.

El modelo subyacente pertenece a la familia Qwen3 de Alibaba, en su variante densa de aproximadamente 4.022 millones de parámetros (4,02 B). El sufijo "OBLITERATED" indica que el modelo ha sido sometido a un proceso de *abliteration*, es decir, la ablación direccional de las direcciones de activación asociadas al rechazo de peticiones, lo que elimina o reduce drásticamente las negativas del modelo ante determinados tipos de contenido. El término "repaired" sugiere una fase posterior de reparación o ajuste para recuperar capacidades degradadas por la ablación, aunque la model card no documenta en qué consiste dicho proceso.

La relevancia de este repositorio es práctica: ofrece doce variantes de cuantización (desde Q2_K de 1,8 GB hasta f16 de 8,2 GB) que permiten ejecutar un modelo de 4 B en hardware de consumo, algo habitual en flujos de trabajo locales. Conviene señalar que el repositorio registra 0 descargas y 0 valoraciones en el momento de la consulta, y que la model card no incluye detalles de entrenamiento, benchmarks ni evaluación de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso de tipo decodificador (familia Qwen3); no detallado en la model card |
| Parametros totales | 4.022.468.096 (≈4,02 B), dato real de safetensors del modelo base |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | en (ingles), segun los tags del repositorio |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (ficheros unicos, sin particionar) |
| Cuantizado por | mradermacher |
| Modelo base | Hatsunama/Qwen3-4B-OBLITERATED-repaired |
| Tamano del repositorio | 36,4 GB |
| Conversiones adicionales | No hay cuantizaciones ponderadas/imatrix publicadas por el autor en el momento de la consulta |

## Arquitectura y entrenamiento

La model card del repositorio no aporta informacion sobre la arquitectura interna, el proceso de entrenamiento, el volumen de tokens, la composicion del dataset ni el uso de tecnicas de alineacion como RLHF o DPO. Lo unico documentado es que se trata de una cuantizacion estatica del modelo `Hatsunama/Qwen3-4B-OBLITERATED-repaired`, con `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`.

Por herencia del modelo base, la arquitectura corresponde a la familia Qwen3 en su variante densa de ~4 B de parametros, pero no se dispone de confirmacion en la informacion proporcionada sobre el numero de capas, la configuracion de atencion (GQA, atencion lineal, etc.), el tamano de vocabulario o la ventana de contexto nativa. El elemento diferencial del modelo es el proceso de *abliteration* aplicado por Hatsunama: una tecnica de ablacion direccional que identifica y elimina las direcciones del espacio de activaciones responsables de las respuestas de rechazo, seguida de una fase de "reparacion" cuyo procedimiento no se detalla. Tampoco se documenta si la reparacion implica un ajuste supervisado, una mezcla de pesos o una correccion selectiva de capas.

## Capacidades

- Generacion de texto conversacional en ingles: el tag `conversational` indica que el modelo esta orientado a dialogos multi-turno.
- Generacion de contenido sin rechazos: la ablacion de las direcciones de rechazo elimina o reduce las negativas del modelo ante peticiones que un modelo alineado convencional rechazaria.
- Capacidades heredadas del modelo base Qwen3-4B: se presupone generacion de texto general, razonamiento y codigo, aunque no hay evaluacion publicada en este repositorio que lo confirme.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas a ingles segun los tags del repositorio; no se documenta soporte de otros idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponible en la informacion proporcionada. No se confirma que se conserve el modo de razonamiento explicito de Qwen3.
- Despliegue en local: compatibilidad con el ecosistema GGUF (llama.cpp y clientes derivados) y con endpoints compatibles (`endpoints_compatible`).

## Casos de uso

- Investigacion en seguridad y alineacion: el modelo sirve como sujeto de prueba para estudiar como la ablacion direccional afecta a la tasa de rechazos, a la coherencia y a la utilidad general, comparando sus salidas con las del Qwen3-4B original y con otras variantes abliteradas.
- Red teaming y evaluacion de guardarrailes: al carecer de rechazos sistematicos, permite generar de forma controlada el tipo de peticiones y respuestas que un clasificador de seguridad deberia detectar, util para validar filtros en produccion.
- Generacion de datos sinteticos para entrenamiento: en pipelines internos y auditados, se puede emplear para producir corpus de dialogo en ingles con estilos o tematicas que un modelo alineado rechazaria, etiquetandolos despues con criterios humanos.
- Escritura creativa y narrativa sin restricciones tematicas: util para ficcion con violencia explicita, temas controvertidos o personajes moralmente ambiguos, donde los rechazos de los modelos alineados interrumpen el flujo de generacion.
- Roleplay y compania conversacional: el tag `conversational` y la ausencia de negativas lo hacen adecuado para personajes con personalidad definida en aplicaciones de entretenimiento, siempre con filtrado y avisos del lado del cliente.
- Asistente local en hardware de consumo: con las variantes Q4_K_M (2,6 GB) o Q5_K_M (3,0 GB) se puede desplegar en un portatil o en una GPU de gama media para tareas de generacion de texto en ingles sin enviar datos a servicios externos.
- Procesamiento por lotes de texto en ingles: tareas de resumen, reescritura, clasificacion o extraccion de informacion sobre corpus donde no se quiere que el modelo se niegue a procesar material sensible (por ejemplo, documentacion legal o medica cruda).
- Base para ajuste fino adicional: al ser un modelo de 4 B con licencia Apache-2.0 y pesos GGUF, es un punto de partida ligero para *fine-tuning* con LoRA sobre dominios concretos, aunque el ajuste requeriria trabajar con los pesos originales en safetensors, no con los GGUF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y tampoco se documenta una evaluacion del efecto de la ablacion o de la fase de "reparacion" sobre el rendimiento del modelo base.

## Requisitos de hardware

Las cifras de VRAM que se indican a continuacion son estimaciones derivadas del tamano de los ficheros GGUF publicados, mas el coste del cache KV y el *overhead* del runtime; no proceden de la model card.

- Cuantizaciones y tamano en disco segun el autor:
  - Q2_K: 1,8 GB
  - Q3_K_S: 2,0 GB
  - Q3_K_M: 2,2 GB (el autor lo marca como calidad inferior)
  - Q3_K_L: 2,3 GB
  - IQ4_XS: 2,4 GB
  - Q4_K_S: 2,5 GB (rapido, recomendado)
  - Q4_K_M: 2,6 GB (rapido, recomendado)
  - Q5_K_S: 2,9 GB
  - Q5_K_M: 3,0 GB
  - Q6_K: 3,4 GB (muy buena calidad)
  - Q8_0: 4,4 GB (rapido, mejor calidad)
  - f16: 8,2 GB (16 bits por peso, el autor lo considera excesivo)
- VRAM estimada para inferencia: entre 2,5 y 3,5 GB para Q4_K_M en contextos cortos; entre 5 y 6 GB para Q8_0; en torno a 9-10 GB para f16. A estas cifras hay que sumar el cache KV, que crece linealmente con la longitud de contexto y puede anadir varios GB en ventanas largas en funcion de la configuracion de atencion del modelo base.
- GPU recomendadas: cualquier GPU con 6-8 GB de VRAM o mas (RTX 3060, RTX 4060, RTX 2070, RTX 3070, RTX 4070) para las cuantizaciones de 4-5 bits. Para f16 o para lotes con contexto largo, se recomienda 12-16 GB (RTX 4080, RTX 4090, A10G, L4). Para servicio con concurrencia alta, A100 o H100 de 40/80 GB permiten mantener multiples secuencias simultaneas en memoria.
- Inferencia en CPU: las cuantizaciones Q4_K_M y Q3_K_M funcionan en CPU con llama.cpp; el rendimiento dependera del numero de nucleos y del ancho de banda de memoria, pero es viable para un unico usuario.
- Cabe en GPU de consumo: si, en todas las cuantizaciones hasta 5 bits con GPUs de 6-8 GB, y hasta Q8_0 con 8 GB o mas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp, text-generation-webui y cualquier servidor compatible con GGUF. Los servidores de alto rendimiento basados en safetensors (vLLM, TGI) no consumen GGUF directamente; para usarlos habria que trabajar con el modelo base en safetensors.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones del autor ni de terceros.

## Comparativa con modelos similares

Los datos de rendimiento no estan disponibles para ninguno de los modelos de la tabla, por lo que la comparacion se limita a parametros, contexto, licencia y disponibilidad. La columna de contexto se marca como no disponible porque no figura en la informacion proporcionada para esta variante.

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mradermacher/Qwen3-4B-OBLITERATED-repaired-GGUF | 4,02 B | no disponible | GGUF (12 cuantizaciones) | Apache-2.0 | Repositorio publico, 0 descargas registradas |
| Hatsunama/Qwen3-4B-OBLITERATED-repaired | 4,02 B | no disponible | safetensors (modelo origen) | Apache-2.0 | Publico en HuggingFace, referenciado como base |
| Otras variantes abliteradas de Qwen3-4B | ~4 B | no disponible | safetensors y GGUF | habitualmente Apache-2.0 | Multiples repositorios de la comunidad; no verificados en esta ficha |
| Qwen3-4B original | ~4 B | no disponible en esta informacion | safetensors y GGUF | Apache-2.0 | Repositorio oficial de Qwen |

Nota: no se dispone de modelos comparables con datos verificados en la informacion proporcionada, mas alla de la relacion directa con el modelo base del que deriva este repositorio.

## Limitaciones y advertencias

- Modelo abliterado: la eliminacion de las direcciones de rechazo implica que el modelo puede generar contenido danino, ilegal o eticamente problemático sin negarse. No es apto para aplicaciones orientadas al publico sin una capa de filtrado externa.
- Efectos secundarios de la ablacion: la ablacion direccional suele degradar la coherencia, aumentar la deriva tematica y reducir el rendimiento en tareas de razonamiento. La model card no documenta ninguna evaluacion de estos efectos ni del alcance de la fase de "reparacion".
- Riesgo de alucinacion: no se ha publicado ninguna evaluacion de fidelidad factual de esta variante. Al tratarse de un modelo de 4 B, la tasa de alucinacion es previsiblemente superior a la de modelos mayores.
- Idiomas: los tags indican soporte exclusivo de ingles. No hay evidencia de que el castellano funcione correctamente, y la ablacion puede haber afectado de forma desigual al comportamiento multilingue.
- Contexto: no se documenta la longitud de contexto soportada en esta variante. Si la cuantizacion ha recortado o no la ventana del modelo base es un dato que la model card no aclara.
- Licencia: Apache-2.0 permite uso comercial, modificacion y redistribucion, pero el usuario asume toda la responsabilidad legal sobre las salidas. La licencia del modelo base y del ajuste original debe verificarse de forma independiente.
- Sin garantias de calidad: el repositorio registra 0 descargas y 0 valoraciones, no incluye benchmarks y no ha sido validado por terceros.
- Cuantizaciones de baja precision: el propio autor desaconseja Q3_K_M ("lower quality") y senala que las cuantizaciones ponderadas/imatrix no estan disponibles, por lo que en tamanos bajos el Q2_K y Q3_K_S pueden degradar notablemente la calidad.
- Procedencia del ajuste: no se documenta quien es Hatsunama, con que datos se entreno la variante abliterada ni que metodologia de reparacion se aplico. La trazabilidad del modelo es limitada.
- Fecha de creacion inusualmente futura en los metadatos del repositorio (2026-09-15), lo que puede indicar un error de registro o una subida con metadatos manipulados; conviene verificar antes de integrarlo en produccion.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3-4B-OBLITERATED-repaired-GGUF
- Modelo base: https://huggingface.co/Hatsunama/Qwen3-4B-OBLITERATED-repaired
- Pagina de resumen y descargas del autor: https://hf.tst.eu/model#Qwen3-4B-OBLITERATED-repaired-GGUF
- Peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF de referencia (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del autor: https://www.nethype.de/
