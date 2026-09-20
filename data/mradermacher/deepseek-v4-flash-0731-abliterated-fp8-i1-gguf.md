# mradermacher/DeepSeek-V4-Flash-0731-Abliterated-FP8-i1-GGUF

## Resumen

DeepSeek-V4-Flash-0731-Abliterated-FP8-i1-GGUF es un repositorio de cuantizaciones GGUF publicado por mradermacher a partir del modelo apetersson/DeepSeek-V4-Flash-0731-Abliterated-FP8. No se trata de un modelo entrenado desde cero, sino de una conversión de pesos: se parte de un checkpoint en FP8 al que previamente se le ha aplicado una intervención de "abliteration" (eliminación de direcciones de rechazo) y se generan ficheros GGUF con cuantización por imatrix para su uso en llama.cpp y herramientas compatibles.

El modelo subyacente está etiquetado como DeepSeek-V4-Flash, con arquitectura de mezcla de expertos (mixture-of-experts) segun las etiquetas del repositorio, y orientado a ingles. La model card indica ademas que se trata de un modelo con vision, aunque los ficheros mmproj, si existen, se distribuyen en el repositorio de cuantizaciones estaticas del mismo autor, no en este.

Su relevancia es doble: por un lado, permite ejecutar localmente un modelo de gran tamano que, en su formato FP8 original, requeriria hardware mucho mas exigente; por otro, forma parte del ecosistema de modelos "abliterated" usados en investigacion de interpretabilidad mecanistica, red-teaming y analisis de mecanismos de rechazo. El repositorio tiene un volumen de 2208 GB y los quants individuales ocupan entre 103 GB y mas de 146 GB, lo que lo situa fuera del alcance de una GPU de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-experts (segun etiquetas del repositorio); numero de capas, expertos, atencion y detalles internos: no disponible |
| Parametros totales | 117.554.047 segun el recuento de safetensors del repositorio; el dato es inconsistente con el tamano del repositorio (2208 GB) y con el tamano de los quants (103-146 GB), por lo que debe tratarse con cautela |
| Parametros activos | no disponible (modelo etiquetado como mixture-of-experts, sin desglose de parametros activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K, Q2_K_S, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | GGUF (quants i1 con imatrix y quants estaticos en repositorio aparte); modelo de origen en FP8 |
| Modelo base | apetersson/DeepSeek-V4-Flash-0731-Abliterated-FP8 |
| Cuantizador | mradermacher |
| Vision | La model card indica que es un modelo de vision; los ficheros mmproj, si existen, se alojan en el repositorio estatico |
| Tamano del repositorio | 2208 GB |
| Descargas / me gusta | 98 / 5 |
| Fecha de creacion / actualizacion | 2026-08-02 / 2026-09-19 |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo: unicamente se indica la etiqueta mixture-of-experts, el origen en un checkpoint FP8 y el uso de transformers como libreria de referencia. No se especifican el numero de capas, la dimension del modelo, el numero de expertos, el mecanismo de atencion ni la longitud de contexto. Tampoco se documentan los datos de entrenamiento del modelo original: numero de tokens, composicion del dataset, fases de ajuste (SFT, RLHF, DPO) o cualquier detalle del pipeline de alineamiento.

Lo que si esta documentado es el proceso de cuantizacion de este repositorio concreto. Se trata de cuantizaciones ponderadas (weighted) con fichero imatrix, generadas con el metodo i1 del autor, que emplea una matriz de importancia para reducir el error de cuantizacion en los pesos mas sensibles. El repositorio incluye el propio fichero imatrix (0,6 GB) para que otros usuarios puedan generar sus propias cuantizaciones. La intervencion "abliterated" del modelo base se enmarca en las tecnicas de cirugia de modelo (model surgery) y aparece etiquetada junto a mechanistic-interpretability: se trata de la supresion de direcciones de rechazo en el espacio de activaciones, no de un reentrenamiento. La model card no detalla que capas se modificaron, con que metodo ni que metricas de degradacion se midieron.

## Capacidades

- Generacion de texto en ingles, heredada del modelo base DeepSeek-V4-Flash; el alcance exacto (razonamiento, codigo, matematicas) no esta documentado en la informacion disponible.
- Capacidades de vision: la model card indica que el modelo es multimodal, con ficheros mmproj en el repositorio estatico. No se detalla que tareas de vision soporta.
- Ausencia de mecanismos de rechazo: al ser una version abliterated, el modelo tiende a no rechazar peticiones que el modelo original declinaria. Esto es una caracteristica del artefacto, no una capacidad funcional adicional.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles segun el campo language del repositorio.
- Modo "thinking" o razonamiento extendido: no disponible.
- Ejecucion local en formato GGUF con cuantizaciones desde IQ1_S hasta Q6_K, lo que permite ajustar el compromiso entre calidad y memoria.

## Casos de uso

- Investigacion en interpretabilidad mecanistica: el modelo permite estudiar como se representan las direcciones de rechazo y que efecto tiene su supresion sobre las activaciones, comparando el checkpoint abliterated con el original.
- Red-teaming y evaluacion de seguridad: util para generar casos adversarios y medir hasta que punto la abliteration degrada las defensas del modelo, en un entorno controlado y aislado.
- Auditoria de tecnicas de cuantizacion: al publicarse el fichero imatrix y varias decenas de quants, sirve para comparar i1-Q3_K_S frente a i1-IQ3_S o i1-IQ4_XS en una misma tarea y medir la perdida de calidad por compresion.
- Procesamiento por lotes en servidor multi-GPU: tareas offline de generacion, resumen o clasificacion sobre corpus en ingles, donde el throughput importa mas que la latencia interactiva y se dispone de 100-150 GB de memoria agregada.
- Generacion de datos sinteticos en ingles: el modelo puede producir corpus de entrenamiento o de evaluacion para experimentos que requieran respuestas sin filtros de rechazo.
- Analisis de documentos con componente visual: si se descargan los ficheros mmproj del repositorio estatico, el modelo puede abordar tareas de descripcion o extraccion de informacion a partir de imagenes, siempre en ingles.
- Reproducibilidad de experimentos de cirugia de modelo: sirve como artefacto de referencia para comparar metodologias de abliteration sobre un mismo modelo base y verificar resultados de terceros.
- Docencia y formacion en despliegue de modelos grandes: los distintos quants permiten ilustrar el impacto de la cuantizacion en el uso de memoria y en la calidad de salida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye tablas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, y los resultados de la busqueda web no contienen datos tecnicos sobre el modelo.

## Requisitos de hardware

- VRAM/RAM estimada segun los ficheros publicados: i1-Q2_K ocupa 103,2 GB; i1-IQ3_S e i1-Q3_K_S, 122,6 GB; i1-IQ3_M, 124,0 GB; i1-Q3_K_M, 135,4 GB; i1-Q3_K_L, 146,5 GB; i1-IQ4_XS supera los 146,5 GB. Los quants Q4_K_M, Q5_K_M y Q6_K del listado no tienen tamano publicado en el extracto disponible.
- Ningun quant cabe en una GPU de consumo. Una RTX 4090 (24 GB), una RTX 3090 (24 GB) o una RTX 5090 (32 GB) son insuficientes incluso para el quant mas agresivo (IQ1_S), cuyo tamano no se detalla pero que se situaria en el mismo orden de magnitud que Q2_K.
- Configuraciones viables: multiples GPU de 80 GB (A100, H100, H200) o 96 GB (RTX PRO 6000) combinadas, o bien un servidor con 128-192 GB o mas de RAM y carga parcial en CPU/GPU mediante offload.
- Cabria esperar en configuraciones de 2x80 GB solo en los quants mas bajos, y con riesgo de offload a memoria del sistema; la informacion proporcionada no confirma cifras exactas de reparto entre VRAM y RAM.
- Opciones de despliegue: llama.cpp y sus derivados (llama-server, Ollama, LM Studio, koboldcpp, text-generation-webui) son los entornos naturales para GGUF. El soporte de este formato en vLLM o TGI no se documenta en la informacion disponible.
- Los quants estan divididos en varios ficheros (part1of3, part2of3, part3of3, part1of4...) que deben concatenarse o cargarse conjuntamente segun el procedimiento estandar de llama.cpp.
- Latencia y throughput estimados: no disponible.
- Para tareas de vision es necesario descargar adicionalmente los ficheros mmproj del repositorio de quants estaticos, si estan disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables externos en la informacion proporcionada. La comparacion posible se limita a los artefactos de la misma familia:

| Artefacto | Formato | Tamano | Licencia | Notas |
|---|---|---|---|---|
| apetersson/DeepSeek-V4-Flash-0731-Abliterated-FP8 | FP8 (transformers) | no disponible | no disponible en la informacion | Modelo base, ya abliterated |
| mradermacher/DeepSeek-V4-Flash-0731-Abliterated-FP8-GGUF | GGUF estatico | no disponible | MIT | Incluye, si procede, los ficheros mmproj para vision |
| mradermacher/DeepSeek-V4-Flash-0731-Abliterated-FP8-i1-GGUF | GGUF i1 con imatrix | 103,2-146,5 GB por quant | MIT | Este repositorio; incluye fichero imatrix de 0,6 GB |
| Otros modelos de la misma categoria | no disponible | no disponible | no disponible | Sin datos en la informacion proporcionada |

## Limitaciones y advertencias

- El modelo es una version abliterated: la supresion de direcciones de rechazo reduce o elimina las negativas del modelo ante peticiones daninas. No es adecuado para despliegues orientados al publico sin capas de moderacion externas.
- La abliteration es una intervencion no supervisada sobre las activaciones y puede degradar capacidades generales (coherencia, instrucciones, razonamiento). No se publican evaluaciones que cuantifiquen esa perdida.
- Riesgo de alucinacion: no se documenta ninguna evaluacion de fidelidad, por lo que se debe asumir el riesgo habitual de los modelos generativos, agravado por la ausencia de benchmarks.
- Idioma: el repositorio declara unicamente ingles. No hay garantia de un rendimiento aceptable en castellano ni en otros idiomas.
- Longitud de contexto desconocida: no se puede planificar un caso de uso de contexto largo sin ese dato.
- Inconsistencia en las cifras de parametros: el recuento de safetensors (117.554.047) no cuadra con el tamano del repositorio ni con los quants publicados. Conviene verificar el modelo base antes de asumir cualquier cifra de tamano.
- Licencia MIT en este repositorio, pero el modelo base figura con licencia "no disponible" en la informacion proporcionada: conviene comprobar los terminos del checkpoint original antes de un uso comercial.
- Requisitos de hardware muy elevados: incluso el quant mas comprimido ronda los 100 GB, lo que excluye estaciones de trabajo con una sola GPU.
- El fichero imatrix y los quants i1 no deben confundirse: el imatrix (0,6 GB) no es un modelo ejecutable, sino un insumo para generar cuantizaciones.
- El repositorio tiene un volumen de descargas bajo (98) y pocos "me gusta" (5), por lo que hay poca validacion comunitaria documentada.
- La busqueda web realizada no devolvio informacion tecnica relevante sobre el modelo: los resultados correspondian a portales de licitaciones publicas ajenos al contenido.

## Enlaces

- Repositorio GGUF i1: https://huggingface.co/mradermacher/DeepSeek-V4-Flash-0731-Abliterated-FP8-i1-GGUF
- Repositorio de quants estaticos (incluye los ficheros mmproj, si existen): https://huggingface.co/mradermacher/DeepSeek-V4-Flash-0731-Abliterated-FP8-GGUF
- Modelo base: https://huggingface.co/apetersson/DeepSeek-V4-Flash-0731-Abliterated-FP8
- Pagina de vision general y listado de descargas del autor: https://hf.tst.eu/model#DeepSeek-V4-Flash-0731-Abliterated-FP8-i1-GGUF
- Guia de uso de ficheros GGUF citada en la model card (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Paper, blog o demo oficial del modelo: no disponible en la informacion proporcionada.
- Resultados de la busqueda web: sin enlaces relevantes; los resultados obtenidos corresponden a portales de licitaciones publicas sin relacion con el modelo.
