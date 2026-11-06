# mradermacher/gemma4-E4B-it-abliterated-GGUF

## Resumen

`mradermacher/gemma4-E4B-it-abliterated-GGUF` es una distribucion de pesos en formato GGUF del modelo `treadon/gemma4-E4B-it-abliterated`, que a su vez deriva de la familia Gemma 4 de Google. El modelo base pertenece a la gama "E4B" (variante de instruccion), y sobre el se ha aplicado una tecnica de *abliteration*: una modificacion de los pesos orientada a eliminar el comportamiento de rechazo (refusal) del modelo alineado original, dando lugar a una variante "uncensored". El trabajo de cuantizacion y publicacion en GGUF lo firma mradermacher, un conocido distribuidor de cuantizaciones para llama.cpp.

El modelo cuenta con 7.463.013.674 parametros totales segun los pesos en safetensors del modelo base, y se distribuye en una bateria de cuantizaciones que van desde Q2_K (4,5 GB) hasta f16 (15,0 GB), pasando por IQ4_XS, Q4_K_M, Q5_K_M, Q6_K y Q8_0. Esta pensado para ejecucion local en llama.cpp y entornos compatibles con GGUF, y declara licencia Apache 2.0 en la ficha de Hugging Face, aunque el model card enlaza a la licencia especifica de Gemma 4 de Google, lo que introduce una ambiguedad relevante para uso comercial.

Su relevancia actual es doble: por un lado, permite ejecutar un modelo de la familia Gemma 4 en hardware de consumo gracias a las cuantizaciones GGUF; por otro, ofrece una variante sin los filtros de seguridad del modelo alineado, lo que interesa a investigadores que estudian comportamiento de modelos, red teaming y evaluacion de sesgos, pero que conlleva riesgos claros en produccion. La informacion disponible sobre arquitectura interna, contexto y datos de entrenamiento es escasa: la model card se limita a listar las cuantizaciones y no documenta detalles tecnicos del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Gemma 4; detalles no documentados en la informacion proporcionada) |
| Parametros totales | 7.463.013.674 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 (con enlace a la licencia de Gemma 4 de Google en el model card) |
| Formato de pesos | GGUF (transformers como libreria declarada; pesos originales en safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo en la documentacion proporcionada. El modelo base es `treadon/gemma4-E4B-it-abliterated`, derivado de la familia Gemma 4 de Google, pero la model card de esta distribucion GGUF no incluye especificaciones sobre tipo de transformer, atencion, capas ni dimensiones ocultas. Tampoco se documentan el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF, DPO u otras tecnicas de alineamiento en el modelo original.

La innovacion tecnica destacable de esta publicacion es el proceso de *abliteration* aplicado sobre el modelo de instruccion: se trata de una modificacion de pesos que busca eliminar la direccion de activacion asociada al rechazo de peticiones, dando lugar a un modelo "uncensored". Sobre ese modelo ablacionado, mradermacher aplica cuantizacion estatica (quantize_version 2, output_tensor_quantised 1, convert_type hf) para generar los ficheros GGUF. Ademas, se ofrecen cuantizaciones con imatrix (weighted/imatrix quants) en un repositorio separado (`gemma4-E4B-it-abliterated-i1-GGUF`), que suelen preservar mejor la calidad en tamanos bajos. No se documenta ninguna innovacion adicional como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional en ingles: el pipeline declarado es conversational y el modelo esta orientado a instrucciones (sufijo `-it`).
- Razonamiento y respuesta a instrucciones heredadas del modelo Gemma 4 base, aunque sin documentacion especifica de rendimiento.
- Comportamiento sin rechazo (uncensored): el proceso de abliteration elimina los filtros de seguridad del modelo alineado, por lo que responde a peticiones que el modelo original rechazaria.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun el campo `language: en`; no se declaran otros idiomas.
- Capacidades especiales (vision, audio, thinking mode): no disponible en la informacion proporcionada.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags), lo que sugiere uso via APIs compatibles con GGUF.

## Casos de uso

- Investigacion sobre seguridad y alineamiento: el modelo ablacionado permite estudiar que comportamientos emergen al eliminar la direccion de rechazo, comparando respuestas con el modelo Gemma 4 original en tareas de red teaming y evaluacion de robustez.
- Ejecucion local en hardware de consumo: las cuantizaciones Q4_K_M (5,4 GB) y Q5_K_M (5,8 GB) permiten desplegar un modelo de ~7,5 mil millones de parametros en GPUs consumer y en CPU via llama.cpp, sin depender de servicios en la nube.
- Generacion de texto creativo sin restricciones: para proyectos de escritura, guiones o narrativa donde los filtros del modelo alineado resultan limitantes, el modelo ofrece respuestas sin rechazos, siempre que el uso cumpla la legalidad aplicable.
- Prototipado de asistentes conversacionales en ingles: al ser un modelo de instruccion con pipeline conversational, sirve para construir prototipos de chatbot multi-turno en ingles sobre infraestructura propia.
- Evaluacion comparativa de cuantizaciones: los distintos niveles (Q2_K hasta Q8_0 y f16) permiten medir el impacto de la cuantizacion en perplejidad y calidad, usando la grafica de ikawrakow referenciada en la model card como referencia.
- Despliegue en entornos air-gapped: al distribuirse como ficheros GGUF autocontenidos, puede ejecutarse en sistemas sin conexion a internet, util en laboratorios de investigacion con requisitos de aislamiento.
- Fine-tuning o experimentacion posterior: el modelo base en safetensors puede servir como punto de partida para ajustes adicionales, aunque esta distribucion concreta solo incluye GGUF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun tamano del fichero GGUF mas overhead de contexto):
  - Q2_K: ~4,5 GB de pesos; ~6 GB de VRAM en total con contexto moderado.
  - Q4_K_M: ~5,4 GB de pesos; ~7-8 GB de VRAM en total.
  - Q6_K: ~6,3 GB de pesos; ~8-9 GB de VRAM en total.
  - Q8_0: ~8,1 GB de pesos; ~10-11 GB de VRAM en total.
  - f16: ~15,0 GB de pesos; ~16-17 GB de VRAM en total.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4070 para cuantizaciones Q4-Q8; A100 o H100 no son necesarias para este tamano, pero permiten mayor throughput y contextos largos.
- Cabe en GPU consumer: si, en la mayoria de GPUs con 8 GB o mas para Q4_K_M; las cuantizaciones Q2_K y Q3_K caben en GPUs de 6 GB.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, y servidores compatibles con endpoints GGUF; la libreria declarada es transformers, pero los ficheros son GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mradermacher/gemma4-E4B-it-abliterated-GGUF (este) | 7.463.013.674 | no disponible | apache-2.0 (con enlace a licencia Gemma 4) | GGUF | Variante uncensored, solo ingles |
| treadon/gemma4-E4B-it-abliterated | no disponible | no disponible | no disponible | safetensors | Modelo base del que deriva esta cuantizacion |
| Gemma 4 E4B-it (original de Google) | no disponible | no disponible | licencia Gemma 4 | safetensors | Modelo alineado con filtros de seguridad |
| mradermacher/gemma4-E4B-it-abliterated-i1-GGUF | no disponible | no disponible | no disponible | GGUF (imatrix) | Misma base con cuantizaciones ponderadas de mayor calidad |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- El proceso de abliteration elimina los filtros de seguridad: el modelo puede generar contenido danino, ofensivo o ilegal segun la jurisdiccion; no es apto para produccion orientada al publico sin moderacion adicional.
- Riesgo elevado de alucinacion: no se documentan evaluaciones de fidelidad ni benchmarks que permitan acotar este riesgo.
- Idiomas: solo se declara ingles; el rendimiento en castellano u otros idiomas no esta garantizado.
- Longitud de contexto desconocida: no se documenta la ventana de contexto, lo que impide planificar casos de uso con documentos largos.
- Ambiguedad de licencia: la ficha declara apache-2.0, pero el model card enlaza a la licencia de Gemma 4 de Google; conviene verificar los terminos reales antes de un uso comercial, ya que la licencia de Gemma suele imponer restricciones de uso aceptable.
- Sesgos: heredados del modelo base Gemma 4 y potencialmente amplificados por la ablacion, sin evaluaciones publicadas que los cuantifiquen.
- Cuantizaciones bajas (Q2_K, Q3_K_M): la propia model card advierte de "lower quality" en Q3_K_M; las cuantizaciones por debajo de Q4 degradan notablemente la calidad.
- Sin garantias de soporte: es una cuantizacion de terceros, no una publicacion oficial de Google, por lo que no hay mantenimiento ni parches de seguridad garantizados.
- Uso responsable: adecuado para investigacion y experimentacion controlada; inadecuado para atencion al cliente, educacion o cualquier aplicacion donde la ausencia de filtros suponga un riesgo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/gemma4-E4B-it-abliterated-GGUF
- Modelo base (abliterated): https://huggingface.co/treadon/gemma4-E4B-it-abliterated
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/gemma4-E4B-it-abliterated-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#gemma4-E4B-it-abliterated-GGUF
- Licencia Gemma 4 de Google: https://ai.google.dev/gemma/docs/gemma_4_license
- Guia de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafica de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Analisis de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
