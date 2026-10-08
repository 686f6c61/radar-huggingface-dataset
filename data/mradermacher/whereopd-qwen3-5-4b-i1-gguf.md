# mradermacher/WhereOPD-Qwen3.5-4B-i1-GGUF

## Resumen

WhereOPD-Qwen3.5-4B-i1-GGUF es la version cuantizada con GGUF del modelo multimodal SophiaSirko/WhereOPD-Qwen3.5-4B, publicada por el usuario mradermacher, especializado en generar cuantizaciones de terceros para llama.cpp y ecosistemas compatibles. El modelo original parte de la familia Qwen3.5 en su variante de 4B y ha sido entrenado con tecnicas de autodestilacion y destilacion on-policy (etiquetas "self-distillation" y "on-policy-distillation"), lo que apunta a un proceso de ajuste orientado a mejorar la calidad de las respuestas usando las propias generaciones del modelo como senal de entrenamiento. El repositorio que nos ocupa no contiene los pesos originales, sino un conjunto de cuantizaciones de tipo imatrix (prefijo i1-) generadas a partir del modelo base.

El dato de parametros reales del modelo base es de 4.841.450.496 parametros (aproximadamente 4,84 mil millones), lo que lo situa en la gama de modelos pequenos que pueden ejecutarse en hardware de consumo. Se trata de un modelo multimodal, es decir, con capacidad de procesar imagenes ademas de texto, si bien los ficheros de proyeccion visual (mmproj) no se alojan en este repositorio sino en el repositorio de cuantizaciones estaticas del mismo autor.

La relevancia de esta publicacion es practica: ofrece el modelo en tamanos que van de 1,7 GB a 4,1 GB, lo que permite desplegarlo en GPUs de gama media o incluso en CPU, con distintos compromisos entre calidad y velocidad. La licencia Apache 2.0 facilita su uso comercial. En el momento de redactar esta ficha, el repositorio no registra descargas ni valoraciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal derivado de la familia Qwen3.5, segun el nombre del modelo base) |
| Parametros totales | 4.841.450.496 (aprox. 4,84 B), dato real del modelo base en safetensors |
| Parametros activos | no aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | imatrix (fichero de calibracion) e i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-Q3_K_S, i1-IQ3_XS, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-IQ4_NL, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (este repositorio); el modelo base se distribuye en safetensors para transformers |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo. El nombre del modelo base (WhereOPD-Qwen3.5-4B) indica que deriva de la familia Qwen3.5 en su variante de 4B, y las etiquetas del repositorio confirman que es un modelo multimodal, ademas de conversational. El numero de parametros reales, 4.841.450.496, coincide con el rango esperado de un modelo denso de aproximadamente 4,8 mil millones de parametros. No se especifica si emplea atencion estandar, atencion lineal, mezcla de expertos o alguna variante hibrida, ni se indican el numero de capas, cabezas de atencion o dimension del hidden state.

Respecto al entrenamiento, las etiquetas del repositorio mencionan autodestilacion (self-distillation) y destilacion on-policy (on-policy-distillation). Estos terminos describen tecnicas en las que el propio modelo genera respuestas que despues se utilizan como objetivo de entrenamiento, a menudo combinadas con ajuste por preferencias o refuerzo. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, la existencia de fases de RLHF o DPO, ni sobre el proceso de alineacion aplicado. Tampoco se documenta ninguna innovacion tecnica especifica mas alla de la combinacion de destilacion y capacidades multimodales.

En cuanto a esta publicacion concreta, mradermacher ha generado las cuantizaciones a partir del modelo base usando un fichero imatrix para ponderar la importancia de los tensores durante la cuantizacion, lo que habitualmente mejora la calidad de los formatos de baja precision (IQ1, IQ2, IQ3) en comparacion con cuantizaciones estaticas equivalentes.

## Capacidades

- Generacion de texto conversacional en ingles, con formato de chat multi-turno.
- Procesamiento multimodal: el modelo base admite entrada de imagenes, aunque los ficheros mmproj necesarios para la inferencia visual se encuentran en el repositorio de cuantizaciones estaticas, no en este.
- Destilacion on-policy: presumiblemente orientado a mejorar la coherencia de las respuestas generadas por el propio modelo, aunque no se documentan los detalles ni los resultados.
- Cuantizacion con imatrix en 24 variantes distintas, desde IQ1_S (1,7 GB) hasta Q6_K (4,1 GB).
- Compatibilidad con el ecosistema GGUF de llama.cpp y herramientas derivadas.
- No se documenta soporte de tool calling, function calling, agentes, modo de razonamiento explicito, audio ni otras capacidades especiales.
- Capacidad multilingue: limitada al ingles segun la etiqueta de idioma del repositorio.

## Casos de uso

- Prototipado local en equipos de desarrollo: con la cuantizacion i1-Q4_K_M (3,2 GB) el modelo cabe en una GPU de consumo como una RTX 3060 de 12 GB o una RTX 4060 Ti de 16 GB, lo que permite iterar sobre prompts y flujos conversacionales sin coste de API.
- Inferencia en CPU o equipos sin GPU dedicada: las variantes IQ2 e IQ3 (entre 1,8 GB y 2,6 GB) permiten ejecutar el modelo en portatiles convencionales mediante llama.cpp, a costa de una perdida de calidad que el propio autor advierte en su tabla de cuantizaciones.
- Clasificacion y anotacion de imagenes asistida por texto: al ser un modelo multimodal, puede emplearse para generar descripciones o etiquetas de imagenes, siempre que se descargue el fichero mmproj del repositorio estatico y se use un runtime con soporte de vision.
- Chatbot de asistencia en ingles para productos internos: su naturaleza conversacional y su tamano reducido lo hacen adecuado para desplegar un asistente de dominio acotado en una sola GPU, con coste de infraestructura bajo.
- Investigacion sobre destilacion on-policy: el modelo es un artefacto util para estudiar como se comportan las tecnicas de autodestilacion en modelos de ~4B, comparando sus salidas con las de otros modelos de la misma familia.
- Generacion de texto en pipelines por lotes: el formato GGUF se integra en scripts de procesamiento masivo (resumenes, reescritura, extraccion de entidades) donde el throughput importa mas que la latencia por peticion.
- Pruebas de integracion con Ollama o LM Studio: al estar en GGUF, el modelo se puede importar directamente en estas herramientas para evaluaciones rapidas de calidad antes de invertir en infraestructura mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de MMLU, HumanEval, GSM8K, MMMU ni de ninguna otra evaluacion, y tampoco se aportan comparaciones con modelos de referencia.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, segun el tamano de cada cuantizacion): IQ1_S e IQ1_M en torno a 1,7 GB; IQ2_XXS a IQ2_M entre 1,8 GB y 2,1 GB;, Q2_K y Q2_K_S unos 2,2 GB; IQ3_XXS a Q3_K_L entre 2,3 GB y 2,8 GB; IQ4_XS, Q4_0 y Q4_K_S unos 3,0 GB; Q4_K_M 3,2 GB; Q4_1 3,3 GB; Q5_K_S 3,5 GB; Q5_K_M 3,6 GB; Q6_K 4,1 GB.
- A esa cifra hay que sumar la cache KV, cuyo tamano depende de la longitud de contexto configurada y de la arquitectura interna (no disponible), y el consumo del runtime. Como referencia practica, conviene reservar entre 1 GB y 3 GB adicionales segun contexto y backend.
- En el caso de uso multimodal hay que anadir la memoria del proyector visual (mmproj), que no se distribuye en este repositorio.
- GPUs recomendadas: cualquier GPU con 6 GB o mas de VRAM puede ejecutar las cuantizaciones Q4 y Q5 con contexto moderado (RTX 3060, RTX 4060, RTX 2060 de 12 GB, GTX 1660 de 6 GB con contexto reducido). Para las cuantizaciones Q6_K con contexto largo es preferible disponer de 8 GB o mas (RTX 3070, RTX 4060 Ti, RTX 4070). No se proporcionan datos de rendimiento medido en A100 o H100.
- Si cabe en GPU de consumo: si, en la practica totalidad de las cuantizaciones ofrecidas, incluidas las de mayor tamano (Q6_K, 4,1 GB), siempre que el contexto se ajuste al presupuesto de VRAM disponible.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, text-generation-webui y cualquier runtime compatible con GGUF e imatrix. En CPU es viable gracias al tamano reducido, aunque con latencias mayores no cuantificadas en la informacion disponible.
- Latencia y throughput estimados: no disponibles. El autor no publica mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Cuantizaciones | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|---|
| mradermacher/WhereOPD-Qwen3.5-4B-i1-GGUF (este modelo) | 4,84 B (heredados del base) | GGUF con imatrix | 24 variantes, de 1,7 GB a 4,1 GB | apache-2.0 | en | Cuantizaciones ponderadas con imatrix; mmproj en el repositorio estatico |
| mradermacher/WhereOPD-Qwen3.5-4B-GGUF | 4,84 B (heredados del base) | GGUF estatico | no detalladas en esta ficha | apache-2.0 | en | Incluye los ficheros mmproj para el modo vision |
| SophiaSirko/WhereOPD-Qwen3.5-4B | 4.841.450.496 | safetensors (transformers) | no aplica (pesos completos) | apache-2.0 | en | Modelo base original, multimodal y entrenado con destilacion on-policy |

No se dispone de datos de rendimiento comparado con otras familias de modelos de tamano similar, por lo que no es posible establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia objetiva de calidad en tareas de razonamiento, codigo o matematicas, ni comparacion con el modelo base sin cuantizar.
- Perdida de calidad por cuantizacion: el propio autor advierte que las variantes IQ1 e IQ2 estan pensadas para casos desesperados o de recursos muy limitados, y que Q2_K y Q3_K_S son de calidad baja. Para uso en produccion conviene partir de Q4_K_M o superior.
- Idiomas: unicamente ingles segun la etiqueta de idioma. No hay soporte declarado de castellano, lo que limita su uso directo en productos orientados al mercado hispanohablante.
- Multimodalidad incompleta en este repositorio: los ficheros mmproj no estan aqui, de modo que la capacidad de vision requiere descargar el repositorio estatico del mismo autor y usar un runtime con soporte de vision.
- Riesgo de alucinacion: propio de modelos de ~4B, especialmente acentuado en las cuantizaciones de menor precision.
- Sesgos: no se documenta ninguna evaluacion de sesgos, toxicidad o comportamiento diferencial por subgrupos.
- Longitud de contexto desconocida: al no publicarse, no es posible planificar despliegues que dependan de ventanas largas sin una validacion previa.
- Sin soporte documentado de tool calling ni de agentes: no debe asumirse compatibilidad con function calling sin probarla.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero conviene verificar las condiciones del modelo base original y citar adecuadamente tanto al autor original como al cuantizador.
- Estado del repositorio: sin descargas ni valoraciones registradas en el momento de redactar esta ficha, lo que implica ausencia de validacion por parte de la comunidad.
- La fecha de creacion registrada en HuggingFace para este repositorio es el 8 de octubre de 2026, dato que se reproduce tal cual figura en la plataforma.

## Enlaces

- Repositorio de cuantizaciones imatrix: https://huggingface.co/mradermacher/WhereOPD-Qwen3.5-4B-i1-GGUF
- Repositorio de cuantizaciones estaticas y ficheros mmproj: https://huggingface.co/mradermacher/WhereOPD-Qwen3.5-4B-GGUF
- Modelo base original: https://huggingface.co/SophiaSirko/WhereOPD-Qwen3.5-4B
- Pagina resumen de descargas del cuantizador: https://hf.tst.eu/model#WhereOPD-Qwen3.5-4B-i1-GGUF
- Peticiones de modelos y preguntas frecuentes de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (referencia citada en la model card): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de calidad de cuantizaciones de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre tipos de cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Sitio del cuantizador (nethype GmbH): https://www.nethype.de/
