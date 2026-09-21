# cbert33/GLM-5.3-Flash-Uncensored-EXL3-DGX-Sliced

## Resumen

GLM-5.3-Flash-Uncensored-EXL3-DGX-Sliced es una transformacion de almacenamiento del checkpoint neko-legends/GLM-5.3-Flash-Uncensored-EXL3, publicada por el usuario cbert33. No es un reentrenamiento ni una nueva cuantizacion: es una conversion sin perdida (lossless) que reescribe cada tensor EXL3 de los expertos enrutados como dos tensores Trellis explicitos, uno por rango, de modo que el modelo pueda ejecutarse en paralelismo tensorial de grado 2 (TP2) sobre dos nodos NVIDIA DGX Spark. La utilidad principal es permitir el despliegue multi-nodo de un MoE de gran tamano con el stack nativo sm120/sm121.

El modelo subyacente es un mixture-of-experts multimodal de la familia GLM-5.3 Flash, con 320.000 millones de parametros totales y 18.000 millones activos segun el autor (los metadatos de safetensors del repositorio informan de 87.963.368.862 parametros, discrepancia que el propio autor atribuye a un error de Hugging Face al calcular parametros en cuantizaciones EXL3). Acepta entradas de imagen y texto (pipeline image-text-to-text), esta cuantizado a 4 bits en formato EXL3/Trellis y ha sido sometido a abliteration, por lo que reduce deliberadamente el comportamiento de rechazo.

Es relevante ahora porque demuestra un flujo completo de inferencia multi-nodo para modelos MoE cuantizados de forma agresiva: incluye un runner de vLLM modificado, decodificacion especulativa con un drafter DFlash2 y una cualificacion de runtime documentada sobre dos DGX Spark. Se distribuye bajo una licencia mixta con requisitos de atribucion y esta declarado explicitamente como artefacto de investigacion, no apto para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (familia GLM-5.3 Flash, tag glm5_next); expertos enrutados almacenados con EXL3/Trellis rank-sliced |
| Parametros totales | 320.000 millones segun el autor; 87.963.368.862 segun safetensors (el autor lo atribuye a un bug de Hugging Face con cuantizaciones EXL3) |
| Parametros activos | 18.000 millones (MoE) |
| Longitud de contexto | 800.000 tokens (maximum model length del perfil de vLLM cualificado); 1.152.606 tokens logicos de cache KV reportados |
| Tipos de cuantizacion | EXL3 de 4 bits (formato Trellis); cache KV en fp8_ds_mla |
| Idiomas soportados | ingles (en) |
| Licencia | shapleymcg-license-1.0 (artefacto de licencia mixta: base MIT de Z.ai, linaje uncensored de orcarouter, cuantizacion EXL3 de neko-legends y escalas ShapleyMcg v1.0) |
| Formato de pesos | safetensors, con tensores Trellis rank0/rank1 por experto enrutado |
| Tamano del repositorio | 176,0 GB |
| Carga del checkpoint | 164 GiB repartidos entre dos nodos |
| Descargas / likes | 266 / 2 |
| Fecha de creacion / actualizacion | 2026-09-12 / 2026-09-20 |

## Arquitectura y entrenamiento

La arquitectura es un transformer de mezcla de expertos (MoE) multimodal, heredado de GLM-5.3 Flash. La intervencion de este repositorio es exclusivamente de almacenamiento: cada tensor EXL3 de experto enrutado se guarda como dos tensores Trellis explicitos (rank0 y rank1), lo que habilita tensor parallelism de grado 2. El autor indica que la conversion no desquantiza, recalibra ni recuantiza el checkpoint de neko-legends, y que solo cambia el layout de almacenamiento.

No hay informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el proceso de alineacion (RLHF/DPO) del modelo original. Si se documenta el pipeline de cuantizacion: la calibracion corresponde a ShapleyMcg (ShapleyMCG: An Auditable Calibration-to-Encoding Pipeline for Low-Bit Mixture-of-Experts Models, Brandon M. Music), que genera los tensores de escala por experto suh, svh y mcg. El checkpoint de lenguaje ha pasado por abliteration para reducir el comportamiento de rechazo. La innovacion tecnica destacable es la combinacion de rank-slicing EXL3, atencion FlashInfer nativa SM120 con backend FLASHINFER_MLA_SPARSE_SM120 y decodificacion especulativa mediante un drafter DFlash2 externo.

## Capacidades

- Generacion de texto conversacional multi-turno (tag conversational) con ventanas de contexto muy largas.
- Procesamiento multimodal de entrada imagen-texto (pipeline image-text-to-text).
- Razonamiento multi-paso y uso de herramientas: la cualificacion interna ejecuto 15 turnos de modelo y 17 llamadas a herramientas con una puntuacion de 8/8.
- Inferencia sobre prompts masivos: 335.046 tokens de prompt procesados en una unica carga de trabajo aceptada.
- Decodificacion especulativa configurable con 1 a 7 tokens de draft (recomendado 5) mediante el drafter DFlash2.
- Comportamiento desinhibido por abliteration: reduce los rechazos ante peticiones que un modelo alineado declinaria.
- Idiomas: unicamente ingles.
- No se documentan capacidades de audio, vision por video, ni modo thinking explicito mas alla de lo indicado.

## Casos de uso

- Investigacion sobre abliteration: comparar sistematicamente la tasa de rechazo y la coherencia de este checkpoint frente a la linea base GLM-5.3 Flash alineada, midiendo deriva en calidad de respuesta.
- Red-teaming y evaluacion de seguridad: servir el modelo en un entorno aislado para generar intentos de evasion y alimentar clasificadores de contenido, dado que el autor advierte que no se debe asumir que el modelo rechace peticiones daninas.
- Procesamiento de corpus documentales muy largos: analisis, resumen y extraccion de informacion sobre volcados de cientos de miles de tokens aprovechando la ventana configurada de 800.000 tokens y la cache KV de mas de 1,1 millones de tokens logicos.
- Agentes con tool calling en laboratorio: construir flujos multi-paso con llamadas a funciones y validar la estabilidad del bucle agente, apoyandose en las 17 llamadas a herramientas de la prueba de humo documentada.
- Investigacion en cuantizacion de bajo bit: estudiar el comportamiento de EXL3/Trellis y de las escalas ShapleyMcg por experto, comparando la fidelidad frente al checkpoint sin cuantizar.
- Ingenieria de inferencia distribuida: usar el repositorio y su script de slicing como referencia para particionar otros modelos EXL3 en despliegues multi-nodo con TP2.
- Evaluacion de decodificacion especulativa: medir la tasa de aceptacion y el impacto en latencia del drafter DFlash2 con distintos numeros de tokens de draft (1-7).
- Recuperacion aumentada sobre bases de conocimiento internas en ingles: indexar documentacion extensa y responder con contexto largo en una unica pasada, siempre en un entorno de investigacion controlado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los unicos datos de rendimiento documentados son los de cualificacion de runtime:

| Metrica | Valor |
|---|---|
| Prueba de humo interna | 15 turnos de modelo, 17 llamadas a herramientas, puntuacion 8/8 |
| Tokens de prompt procesados | 335.046 |
| Tokens de finalizacion generados | 18.672 |
| Tiempo total de la carga aceptada | 521,94 s |
| Tasa media de finalizacion (sobre el total del run, incluye prefill) | aprox. 35,8 tok/s |
| Tokens logicos de cache KV | 1.152.606 |
| Bytes de cache KV por rango | 11.000.000.000 |
| Reinicios de rango / OOM | 0 / 0 |
| Mejora declarada por el autor en uso agente | 15-25% en tok/s frente al EXL3 anterior |

## Requisitos de hardware

- El checkpoint esta disenado para ejecutarse en dos nodos NVIDIA DGX Spark con tensor parallelism 2; la carga completa ocupa 164 GiB repartidos entre ambos nodos.
- No cabe en una GPU de consumo: el repositorio pesa 176 GB y el modelo base declara 320.000 millones de parametros totales.
- Aceleradores objetivo: GPUs sm120/sm121 (DGX Spark). No hay datos sobre ejecucion en A100, H100 o RTX 4090, y el esquema rank-sliced no es compatible con kernels genericos.
- Despliegue: requiere el fork de vLLM cbertucci33/vllm-v29-glm53flash-exl3-dgx. Ni vLLM 0.29 estandar ni Transformers entienden el esquema de tensores rank-sliced.
- Perfil de runner cualificado: vLLM 0.29.0 base, tensor parallelism 2, quantizacion exl3, load format instanttensor, backend de atencion FLASHINFER_MLA_SPARSE_SM120, cache KV fp8_ds_mla, maximum model length 800.000, maximum sequences 2.
- Decodificacion especulativa: requiere el drafter local-inference-lab/GLM-5.3-Flash-DFlash2-MXFP8, almacenado por separado. El drafter original acepta 7 tokens; el runner modificado admite entre 1 y 7, con 5 recomendado como equilibrio.
- Imagen de cualificacion construida desde el commit de runtime 974329d88; commits posteriores solo son compatibles si preservan el mismo esquema exl3-trellis.
- Throughput medido: aproximadamente 35,8 tokens de finalizacion por segundo de media en la carga de trabajo cualificada (18.672 tokens en 521,94 s), con el prefill incluido en ese tiempo.

## Comparativa con modelos similares

No se dispone de datos de benchmarks que permitan una comparacion cuantitativa. La comparativa se limita a los artefactos de la misma familia citados en la documentacion:

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cbert33/GLM-5.3-Flash-Uncensored-EXL3-DGX-Sliced | 320.000 M totales / 18.000 M activos (autor) | 800.000 tokens (configurado) | EXL3 4 bits, rank-sliced para TP2 | shapleymcg-license-1.0 (mixta) | Requiere runner vLLM propio y dos DGX Spark |
| neko-legends/GLM-5.3-Flash-Uncensored-EXL3 | no disponible | no disponible | EXL3 4 bits, sin rank-slicing | no disponible | Modelo base de este repositorio; ejecutable con el runner Entrpi vLLM segun el autor |
| GLM-5.3 Flash (Z.ai, base) | no disponible | no disponible | pesos originales | MIT | Modelo base original; licencia permisiva |
| Linea uncensored de orcarouter | no disponible | no disponible | no disponible | no disponible | Origen del linaje de pesos abliterados |

No se han identificado en la informacion proporcionada alternativas comparables de otros fabricantes con datos verificables.

## Limitaciones y advertencias

- Modelo abliterated: el autor advierte explicitamente de que no se debe asumir que el modelo rechace peticiones daninas. Es obligatorio aplicar salvaguardas a nivel de aplicacion y tratar todas las salidas como no confiables.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad factual; el propio autor senala que otras versiones abliteradas de GLM mostraban bucles, incoherencia y baja velocidad de generacion.
- Idioma: soporte limitado a ingles, sin capacidades multilingues documentadas.
- Licencia: artefacto de licencia mixta. La licencia ShapleyMcg v1.0 exige atribucion y no concede derechos a la persona conocida como 0xSero; el uso sin la atribucion requerida queda sin licencia. La base GLM-5.3 Flash es MIT, pero el conjunto no lo es.
- Restriccion de uso: el autor declara el modelo exclusivamente para investigacion y no destinado a produccion. Se ofrece sin garantia y sin responsabilidad para los creadores, subidores y mantenedores.
- Dependencia de software fragil: solo funciona con un fork concreto de vLLM; cualquier actualizacion que rompa el esquema exl3-trellis invalida el checkpoint.
- Complejidad de despliegue: requiere dos nodos DGX Spark, 164 GiB de carga y TP2. No es viable en una estacion de trabajo mononodo convencional.
- Discrepancia de parametros: los metadatos de safetensors (87.963.368.862) no coinciden con la cifra declarada por el autor (320.000 millones). Cualquier planificacion de recursos deberia partir de la cifra del autor y verificarla experimentalmente.
- Sin garantias de calidad: no hay benchmarks publicados que respalden el rendimiento en tareas de razonamiento, codigo o matematicas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cbert33/GLM-5.3-Flash-Uncensored-EXL3-DGX-Sliced
- Modelo base (cuantizacion EXL3 original): https://huggingface.co/neko-legends/GLM-5.3-Flash-Uncensored-EXL3
- Drafter DFlash2 para decodificacion especulativa: https://huggingface.co/local-inference-lab/GLM-5.3-Flash-DFlash2-MXFP8
- Runner de vLLM especifico: https://github.com/cbertucci33/vllm-v29-glm53flash-exl3-dgx
- Licencia ShapleyMcg v1.0: https://github.com/brandonmmusic-max/shapleymcg/blob/main/LICENSE
- Repositorio de ShapleyMcg (URL truncada en la model card): https://github.com/brandonmmusic-m
- No se han encontrado enlaces adicionales relevantes en la busqueda web: los resultados devueltos (repositorios de prompts DAN, topicos de chatgpt-api, documentacion de modelos de GitHub Copilot y articulos sobre recuperacion de chats de ChatGPT) no guardan relacion con este modelo y no se han utilizado como fuente de datos.
