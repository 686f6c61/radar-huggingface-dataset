# mradermacher/Qwen3.8-27B-Heretic-Abliterated-GGUF

## Resumen

Qwen3.8-27B-Heretic-Abliterated-GGUF es una cuantizacion estatica en formato GGUF del modelo Qwen3.8-27B-Heretic-Abliterated, publicado por el usuario mradermacher. Se trata de un derivado no oficial del modelo base Qwen3.8-27B, que ha sido modificado por el usuario catonooka mediante tecnicas de "abliteration" (eliminacion o reduccion de los mecanismos de rechazo y alineacion) y etiquetado como "Heretic". El resultado es un modelo conversacional de 27.320.697.856 parametros (aproximadamente 27,3 mil millones) orientado a generar respuestas sin las restricciones habituales de seguridad.

El modelo se distribuye exclusivamente en formato GGUF, lo que lo hace adecuado para inferencia en CPU y GPU mediante llama.cpp y sus derivados (Ollama, LM Studio, etc.). El repositorio ocupa 15,8 GB e incluye multiples niveles de cuantizacion: x-f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K e IQ4_XS. No se dispone de informacion sobre la licencia, los idiomas soportados ni el pipeline de la tarea.

La relevancia de este modelo es limitada y controvertida: se trata de un derivado de un modelo base que no corresponde a ninguna version oficial publicada de la familia Qwen (la denominacion "Qwen3.8" no coincide con las versiones conocidas de Alibaba), y su proposito declarado es eliminar las salvaguardas del modelo original. No cuenta con descargas ni interacciones en el momento de la consulta, y no se ha publicado informacion tecnica verificable sobre su entrenamiento o evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de Qwen3.8-27B, presumiblemente transformer denso) |
| Parametros totales | 27.320.697.856 (aproximadamente 27,3 mil millones) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo. El nombre indica que deriva de un modelo denominado "Qwen3.8-27B", del cual no hay documentacion publica verificable en la informacion proporcionada. Por el numero de parametros (27,3 mil millones) y la practica habitual de la familia Qwen, es plausible que se trate de un transformer denso con atencion por grupos (GQA), pero este extremo no esta confirmado.

El proceso de "abliteration" aplicado por catonooka consiste, segun la practica habitual de esta tecnica, en identificar las direcciones en el espacio de activaciones asociadas a los comportamientos de rechazo y restarles magnitud, o en ajustar finamente el modelo para reducir la probabilidad de respuestas negativas. No se proporcionan detalles sobre el dataset utilizado, el numero de tokens de entrenamiento, ni si se emplearon tecnicas de RLHF o DPO. Tampoco se documenta la composicion de los datos ni ninguna innovacion tecnica adicional. La cuantizacion fue realizada por mradermacher con su pipeline habitual, indicado en la model card mediante los metadatos `quantize_version: 2` y `convert_type: hf`.

## Capacidades

- Generacion de texto conversacional multi-turno, segun la etiqueta "conversational" del repositorio.
- Razonamiento y generacion de codigo: capacidades heredadas del modelo base, no verificadas en este derivado.
- Soporte de tool calling / function calling: no disponible (no confirmado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no confirmado).
- Capacidades multilingues: no disponible.
- Modo "thinking" o razonamiento extendido: no disponible.
- Vision o audio: no disponible.
- Reduccion de rechazos y filtros de seguridad: el objetivo declarado del proceso de abliteration es que el modelo responda a peticiones que el modelo base rechazaria, aunque no se documenta el alcance ni la eficacia de esta modificacion.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo puede emplearse en entornos controlados para estudiar como la abliteration afecta a la distribucion de respuestas y a la calibracion de los rechazos, comparando su comportamiento con el del modelo base.
- Experimentacion con cuantizaciones GGUF: dado que el repositorio ofrece doce niveles de cuantizacion, sirve para medir el impacto de la precision (de Q2_K a f16) en la calidad de las respuestas de un modelo de 27,3 mil millones de parametros.
- Despliegue local en hardware de consumo: las variantes Q4_K_M y Q4_K_S permiten ejecutar el modelo en GPUs con 16-24 GB de VRAM o en CPU con suficiente RAM, mediante llama.cpp u Ollama, para tareas de generacion de texto sin conexion.
- Generacion creativa sin restricciones: escritura de ficcion, guiones o contenido narrativo que requiera tematicas que los modelos alineados suelen declinar, siempre que el usuario asuma la responsabilidad legal y etica del contenido producido.
- Evaluacion comparativa de derivados no oficiales: util para analizar la deriva de calidad y coherencia que introducen los procesos de abliteration en modelos de esta escala.
- Pruebas de robustez y red teaming: el modelo puede emplearse como generador de respuestas adversarias para evaluar clasificadores de contenido o sistemas de moderacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 54 GB en f16 (2 bytes por parametro), unos 29 GB en Q8_0, unos 17-18 GB en Q4_K_M, unos 12-13 GB en Q3_K_M y unos 10-11 GB en Q2_K. Estas cifras son estimaciones a partir del numero de parametros y no incluyen el overhead del contexto KV.
- GPU recomendadas: A100 80 GB o H100 para f16; A100 40 GB, RTX 6000 Ada o RTX 4090 (24 GB) para Q8_0 y Q6_K; RTX 4090, RTX 4080 o RTX 3090 (24 GB) para Q4_K_M y Q5_K_M.
- Cabe en GPU de consumo: si, en las cuantizaciones Q4 y Q3 en GPUs de 16-24 GB (RTX 4080, 4090, 3090, 4060 Ti de 16 GB). Las variantes Q2_K pueden caber en GPUs de 12 GB, con perdida notable de calidad.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, koboldcpp y servidores compatibles con la API de OpenAI (el repositorio incluye la etiqueta `endpoints_compatible`). No se recomienda vLLM ni TGI para este repositorio, ya que solo distribuye pesos GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-Heretic-Abliterated-GGUF (este) | 27,3 mil millones | no disponible | GGUF | no disponible | Derivado abliterado, sin benchmarks publicados |
| Qwen3.8-27B-Heretic-Abliterated (modelo base) | 27,3 mil millones | no disponible | safetensors (presumiblemente) | no disponible | Fuente de la cuantizacion |
| Modelos oficiales de la familia Qwen de 27-32 mil millones | 27-32 mil millones | 32.768-131.072 tokens (segun version) | safetensors, GGUF | Apache 2.0 o similar (segun version) | Modelos alineados con benchmarks publicados; la denominacion "Qwen3.8" no corresponde a ninguna version oficial conocida |

No se dispone de datos verificables sobre el modelo base "Qwen3.8-27B" ni sobre sus caracteristicas tecnicas, por lo que la comparativa con alternativas oficiales no puede establecerse con rigor.

## Limitaciones y advertencias

- Modelo derivado no oficial: no procede de Alibaba ni de ningun laboratorio reconocido; la denominacion "Qwen3.8" no coincide con versiones oficiales publicadas de la familia Qwen, lo que genera dudas sobre su procedencia real.
- Abliteration: el proceso de eliminacion de rechazos puede degradar la coherencia, aumentar la toxicidad y producir contenido danino, ilegal o sexualmente explicito. No se documenta el alcance de la modificacion ni las evaluaciones de seguridad realizadas.
- Alucinacion: sin benchmarks publicados, no puede estimarse la tasa de alucinacion; en modelos abliterados es frecuente que la calibracion empeore.
- Licencia desconocida: al no indicarse la licencia, no puede confirmarse el uso comercial ni las obligaciones de atribucion. Se recomienda contactar con el autor antes de cualquier uso en produccion.
- Idiomas y contexto desconocidos: no se especifican los idiomas soportados ni la longitud de contexto, lo que impide planificar despliegues multilingues o con ventanas largas.
- Riesgo legal y reputacional: el uso de modelos sin filtros de seguridad en aplicaciones publicas puede infringir normativas de moderacion de contenido (por ejemplo, la Ley de Servicios Digitales de la UE) y las politicas de las plataformas de despliegue.
- Sin traccion comunitaria: cero descargas y cero interacciones en el momento de la consulta, lo que reduce la probabilidad de que los errores hayan sido detectados y corregidos.
- Cuantizaciones agresivas: Q2_K y Q3_K_S pueden degradar significativamente la calidad en un modelo de 27,3 mil millones de parametros; se recomienda Q4_K_M o superior para uso real.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3.8-27B-Heretic-Abliterated-GGUF
- Modelo base citado: https://huggingface.co/catonooka/Qwen3.8-27B-Heretic-Abliterated
