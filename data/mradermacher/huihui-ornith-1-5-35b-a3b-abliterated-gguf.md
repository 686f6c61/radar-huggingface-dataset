# mradermacher/Huihui-Ornith-1.5-35B-A3B-abliterated-GGUF

## Resumen

Huihui-Ornith-1.5-35B-A3B-abliterated-GGUF es la distribucion en formato GGUF de un modelo derivado de la familia Ornith 1.5, concretamente la variante de 35B con arquitectura de mezcla de expertos (MoE) y aproximadamente 3B de parametros activos por token. El modelo original fue modificado por huihui-ai mediante la tecnica de "abliteration", que elimina o atenua las capas de rechazo del modelo base, y posteriormente cuantizado por mradermacher para su uso en entornos de inferencia local con llama.cpp y derivados.

El modelo resuelve el problema de desplegar un modelo de gran tamano con requisitos de computo reducidos gracias a su naturaleza MoE, ofreciendo una alternativa sin censura para tareas de generacion conversacional. Su relevancia actual radica en que combina un contexto amplio, capacidades multimodales (los ficheros mmproj adjuntos asi lo indican) y una licencia MIT permisiva, lo que facilita su integracion en productos comerciales sin restricciones de uso.

La ficha se centra en la version GGUF distribuida por mradermacher, que incluye un conjunto de cuantizaciones estaticas desde Q2_K hasta Q8_0, ademas de un suplemento multimodal mmproj en Q8_0 y f16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) basada en la familia Qwen3, segun los tags del repositorio |
| Parametros totales | 35.505.251.456 (aproximadamente 35,5B) |
| Parametros activos | aproximadamente 3B (indicado por el sufijo A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, ademas de mmproj Q8_0 y f16 |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer con mezcla de expertos (MoE), tal como se deduce del sufijo A3B y de los tags que lo vinculan a la familia Qwen3. Con 35,5B parametros totales y aproximadamente 3B activos por token, el coste de inferencia se aproxima al de un modelo denso de 3B, mientras que la capacidad representacional se acerca a la de un modelo de 35B. Esta configuracion permite un equilibrio favorable entre calidad y throughput, especialmente en despliegues con llama.cpp donde el cuello de botella suele ser el ancho de banda de memoria.

No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. La modificacion principal respecto al modelo base es la abliteration, un proceso que identifica y neutraliza las direcciones de activacion asociadas al rechazo de peticiones, dando lugar a un modelo "uncensored". Los ficheros mmproj incluidos en el repositorio indican que el modelo original incorpora capacidades multimodales, presumiblemente vision, aunque la model card no detalla la arquitectura del codificador visual.

## Capacidades

- Generacion de texto conversacional multi-turno, orientada a dialogos abiertos y sin restricciones de contenido por alineamiento.
- Razonamiento y respuesta a instrucciones, heredado de la familia Qwen3.
- Capacidades multimodales: el repositorio incluye ficheros mmproj Q8_0 y f16, lo que sugiere soporte de entrada de imagenes, aunque no se detalla en la model card.
- Generacion de codigo y tareas de matematicas, asumiendo las capacidades tipicas de la familia base.
- Soporte de tool calling y function calling: no confirmado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion disponible.
- Capacidades multilingues limitadas al ingles segun el campo `language` del repositorio.
- Modo "thinking" o razonamiento extendido: no confirmado en la informacion disponible.

## Casos de uso

- Generacion creativa sin restricciones: el proceso de abliteration elimina las capas de rechazo, lo que permite usar el modelo para ficcion, guiones o narrativa con tematicas adultas o controvertidas sin que el modelo se niegue a responder.
- Asistente conversacional local: con cuantizaciones Q4_K_M de 21,8 GB, el modelo puede ejecutarse en estaciones de trabajo con 24 GB de VRAM, ofreciendo dialogos multi-turno con una calidad cercana a modelos densos mucho mayores.
- Procesamiento de documentos con imagenes: gracias a los ficheros mmproj, es posible alimentar el modelo con capturas, diagramas o documentos escaneados para extraer y resumir informacion, siempre que se valide la calidad del componente multimodal.
- Investigacion sobre alineamiento y seguridad: el modelo sirve como caso de estudio para analizar como la abliteration afecta a la utilidad, la coherencia y la tendencia a la alucinacion en comparacion con el modelo base alineado.
- Prototipado rapido en entornos sin GPU de datacenter: las cuantizaciones Q2_K (13,3 GB) y Q3_K_S (15,6 GB) permiten ejecutar el modelo en GPUs de consumo de 16 GB, como la RTX 4060 Ti o la RTX 4080, con perdida de calidad controlada.
- Generacion de codigo en pipelines locales: la naturaleza MoE con 3B activos reduce el coste por token, lo que hace viable su uso en entornos de desarrollo integrado con llama.cpp para autocompletado y explicacion de codigo.
- Despliegue en produccion con licencia permisiva: la licencia MIT permite integrar el modelo en productos comerciales sin obligacion de liberar el codigo ni los pesos derivados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion:
  - Q2_K: 13,3 GB
  - Q3_K_S: 15,6 GB
  - Q3_K_M: 17,3 GB
  - Q3_K_L: 18,7 GB
  - IQ4_XS: 19,5 GB
  - Q4_K_S: 20,5 GB
  - Q4_K_M: 21,8 GB
  - Q5_K_S: 24,7 GB
  - Q5_K_M: 25,4 GB
  - Q6_K: 29,3 GB
  - Q8_0: 37,9 GB
  - mmproj Q8_0: 0,7 GB adicionales
  - mmproj f16: 1,0 GB adicionales
- GPU recomendadas: para Q4_K_M en adelante, una RTX 4090 (24 GB) o una A100/H100 de 40 u 80 GB. Para Q8_0 se requiere una A100 40 GB o superior, o bien dividir el modelo entre varias GPUs.
- Cabe en GPU de consumo: si, en modelos con 16 GB o mas para cuantizaciones Q2_K y Q3_K_S; en 24 GB caben comodamente Q4_K_M, Q5_K_M y Q6_K.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. El repositorio incluye el tag `endpoints_compatible`, lo que sugiere compatibilidad con endpoints tipo OpenAI.
- Latencia y throughput estimados: no disponibles. Al ser un MoE con aproximadamente 3B activos, el throughput esperado es sustancialmente mayor que el de un modelo denso de 35B, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Huihui-Ornith-1.5-35B-A3B-abliterated-GGUF | 35,5B | ~3B | no disponible | MIT | GGUF | Sin censura, multimodal |
| Modelo base alineado (Ornith-1.5-35B-A3B) | 35,5B | ~3B | no disponible | MIT | safetensors | Con capas de rechazo intactas |
| Qwen3-30B-A3B | 30B | ~3B | no disponible | Apache 2.0 | safetensors, GGUF | Alternativa MoE de referencia en la misma categoria |
| Modelos densos de 7-8B | 7-8B | 7-8B | no disponible | variable | GGUF | Menor capacidad, mayor throughput por token |

La comparativa con Qwen3-30B-A3B es la mas relevante por compartir arquitectura MoE y rango de parametros activos, aunque no se dispone de datos de rendimiento comparativos en la informacion proporcionada.

## Limitaciones y advertencias

- La abliteration elimina las capas de rechazo, lo que implica un riesgo elevado de generar contenido ofensivo, ilegal o danino. No es adecuado para aplicaciones de cara al publico sin filtros adicionales.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad factual; como todo modelo generativo, puede inventar datos con seguridad aparente.
- Idiomas: el campo `language` solo declara ingles, por lo que el rendimiento en castellano u otros idiomas no esta garantizado y probablemente sea inferior.
- Contexto: no se ha especificado la longitud de contexto soportada; conviene verificarla antes de disenar aplicaciones que dependan de ventanas largas.
- Licencia: MIT permite uso comercial, pero el modelo base y sus derivados pueden estar sujetos a las condiciones del modelo original de Ornith, que no se detallan en la informacion disponible.
- Capacidades multimodales: la presencia de ficheros mmproj sugiere vision, pero no se documenta la calidad ni el alcance de dicha capacidad.
- Tool calling y agentes: no confirmados; no deben asumirse en produccion sin validacion previa.
- El modelo esta cuantizado de forma estatica; las cuantizaciones Q2_K y Q3_K_S pueden degradar notablemente la coherencia y la calidad del razonamiento.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Huihui-Ornith-1.5-35B-A3B-abliterated-GGUF
- Modelo base abliterado: https://huggingface.co/huihui-ai/Huihui-Ornith-1.5-35B-A3B-abliterated
- Modelo original Ornith-1.5-35B-A3B: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/Huihui-Ornith-1.5-35B-A3B-abliterated-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Huihui-Ornith-1.5-35B-A3B-abliterated-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
