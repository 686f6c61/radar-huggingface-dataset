# jeff-legacy/Jeff-Qwen3.5-2B

## Resumen

Jeff-Qwen3.5-2B es un modelo de decision (decision model) afinado a partir de Qwen3.5-2B por el proyecto Jeff y publicado bajo el identificador jeff-legacy/Jeff-Qwen3.5-2B. No es un modelo generativo al uso: esta especializado en clasificacion zero-shot, de modo que recibe la descripcion de una situacion y una lista de opciones en lenguaje natural, y devuelve en un unico pase hacia delante (forward pass) una probabilidad calibrada para cada opcion, sin generar texto ni requerir parseo posterior.

Pertenece a la familia Jeff, formada por ajustes finos de Qwen3.5 y Gemma 4 orientados a decisiones rapidas y bien calibradas para integrarse directamente en codigo local. Esta ficha corresponde a la revision v1.2 (1 de octubre de 2026), entrenada sobre el mismo conjunto de datos limpio que Jeff-Qwen3.5-0.8B v1.2 (284.747 preguntas, una epoca). Segun el autor, el modelo esta marcado como superseded y ya no se actualiza: la version vigente del proyecto es Jeff v1.3 (mstrasser/jeff-base).

Con 2.213.241.664 parametros (unos 2,2B), el modelo esta pensado para ejecucion local de baja latencia: aproximadamente 24 ms por decision en una RTX PRO 6000 y unos 60 ms en un Apple M4 Max con MLX. La licencia es Apache 2.0 y el unico idioma declarado es el ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (ajuste fino de Qwen/Qwen3.5-2B); no se detallan mas especificaciones tecnicas en la informacion disponible |
| Parametros totales | 2.213.241.664 (aproximadamente 2,2B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado del modelo base Qwen/Qwen3.5-2B, por lo que hereda su arquitectura transformer. La salida del modelo no es texto generado, sino una distribucion de probabilidad calibrada sobre las opciones proporcionadas; esta orientacion explica las etiquetas del repositorio (`feature-extraction`, `decision-model`, `zero-shot-classification`, `calibration`, `system-1`). La calibracion se ajusta mediante una unica temperatura fijada.

El entrenamiento de la version v1.2 uso 284.747 preguntas durante una epoca, con el checkpoint final y una temperatura ajustada. Segun el autor, los datos son en su mayoria sinteticos, escritos por un modelo abierto (Qwen3.8-Flash-Next) sobre dos DGX Sparks, e incluyen algunos conjuntos publicos que contienen texto generado con modelos cerrados (por ejemplo, las respuestas de modelo de RAGTruth). No se uso ningun modelo cerrado como profesor del modelo base; un modelo cerrado solo se empleo para verificar por muestreo la calidad de una parte de los datos sinteticos. Todo el entrenamiento se hizo en hardware local (una RTX PRO 6000; el 2B tarda unas 3,5 horas) y el codigo de entrenamiento parte de la receta de codigo abierto AutoJev. La revision v1.1 introdujo soporte para listas largas, con 32.000 preguntas de entrenamiento adicionales con entre 20 y 254 opciones.

## Capacidades

- Clasificacion zero-shot entre opciones descritas en lenguaje natural: las categorias no necesitan aparecer en los datos de entrenamiento.
- Devuelve una probabilidad calibrada por opcion en un unico pase hacia delante, sin generacion de texto ni parseo.
- Soporte de listas largas de opciones, de 20 a 254 elementos (segun se documenta para v1.1 y v1.2).
- Decisiones de baja latencia: aproximadamente 24 ms por decision en RTX PRO 6000 y 60 ms en Apple M4 Max (MLX).
- Uso de tipo System-1, pensado para juicios rapidos entre alternativas.
- Cobertura de tareas de clasificacion de documentos, intenciones, etiquetas de moderacion y opciones arbitrarias.
- Capacidades multilingues: no disponibles; el modelo solo declara ingles.
- No dispone de generacion de texto, tool calling ni soporte de agentes multi-paso, ya que no es un modelo generativo.

## Casos de uso

- Enrutado de colas de soporte: dado el texto de una consulta y una lista de colas o departamentos, el modelo asigna una probabilidad calibrada a cada uno y permite dirigir el ticket con umbrales de confianza explicitos.
- Clasificacion de intenciones de usuario: en asistentes o aplicaciones de voz se describen las intenciones posibles en palabras y el modelo decide cual encaja, sin necesidad de reentrenar por cada categoria nueva.
- Etiquetado de moderacion de contenido: clasificacion entre categorias de moderacion descritas en texto, con probabilidades calibradas que facilitan fijar politicas por umbral.
- Analisis de documentos largos: tareas como ContractNLI, CUAD y ConditionalQA se contemplan en las pruebas del autor; conviene tener en cuenta la caida de rendimiento documentada en v1.2 (65,6% frente al 85,8% de v1.1).
- Clasificacion financiera: en el benchmark Financial PhraseBank la version v1.2 obtiene 95,6%, lo que la hace adecuada para etiquetar frases financieras entre categorias predefinidas.
- Evaluacion de respuestas y deteccion de alucinacion en RAG: en RAGTruth alcanza 85,5% en v1.2, util como filtro automatico de respuestas generadas por otros sistemas.
- Verificacion de razonamiento en tareas de sentido comun: en WinoGrande obtiene 80,7% en v1.2, lo que permite usarlo como juez en decisiones binarias de coherencia.
- Comandos de voz y navegacion: aunque en v1.2 los datos de voz se movieron a un adaptador especifico (`nav`), el modelo base mantiene capacidad de clasificacion zero-shot sobre comandos hablados (91,4% en la prueba de voz en v1.2).

## Benchmarks y rendimiento

Comparativa de la familia Jeff y de Jev segun la model card:

| Modelo | Modelo base | Precision del panel del base (sin entrenar) | Precision del panel de Jeff | Error de calibracion (ECE) | Tiempo de decision (RTX PRO 6000) |
|---|---|---|---|---|---|
| Jeff-Qwen3.5-0.8B (v1.2) | Qwen3.5-0.8B | 45,3% | 78,7% | 0,028 | 22 ms |
| Jeff-Qwen3.5-2B v1.2 (este modelo) | Qwen3.5-2B | 46,5% | 81,7% | 0,021 | 24 ms |
| Jeff-Qwen3.5-2B v1.1 (revision v1.1) | Qwen3.5-2B | 46,5% | 82,0% | 0,026 | 24 ms |
| Jeff-Gemma4-E2B | Gemma 4 E2B | 62,5% | 81,6% | 0,031 | 29 ms |
| Jev (publicado) | — | — | 83,0% | ≈0,06 (media de sus cifras por benchmark) | 212 ms por llamada via API (harness Doom) |

Comparativa entre revisiones v1.1 y v1.2:

| Prueba | Preguntas | v1.1 | v1.2 | Nota |
|---|---|---|---|---|
| Panel de benchmarks (cinco benchmarks) | 4.599 | 82,0% | 81,7% | — |
| Error de calibracion en el panel (ECE) | 4.599 | 0,026 | 0,021 | menor es mejor |
| Listas largas v2 (de 20 a 254 opciones; prueba nueva sin mensajes vistos en entrenamiento) | 1.886 | no medido | 93,6% | — |
| Listas largas v1 | 2.400 | 95,2% | 95,0% | v1 comparte mensajes con los datos de entrenamiento; v2 la sustituye |
| Documentos largos (ContractNLI, CUAD, MAUD, ConditionalQA) | 2.009 | 85,8% | 65,6% | la cifra de v1.1 estaba inflada por documentos filtrados de MAUD |
| Navegacion por voz (comandos hablados reservados de su aplicacion) | 3.324 | 95,8% | 91,4% | ahora zero-shot; los datos de voz se movieron al adaptador `nav` |
| JevBench, nivel dificil | 105 | 57,1% | 57,1% | — |

Resultados por benchmark (v1.1 a v1.2): BBH 68,7 a 66,4; Financial PhraseBank 94,7 a 95,6; JudgeBench 59,4 a 62,0; RAGTruth 87,7 a 85,5; WinoGrande 78,8 a 80,7.

## Requisitos de hardware

- VRAM estimada para inferencia (calculo a partir del numero de parametros, no dato publicado): aproximadamente 4,4 GB en FP16/BF16, en torno a 2,2 GB en INT8 y cerca de 1,1 GB en 4 bits, sin contar memoria adicional para activaciones y contexto.
- GPU recomendadas: el autor entrena y mide en una RTX PRO 6000; no se publica una lista oficial de GPU recomendadas.
- Cabe en GPU de consumo: por tamano (2,2B), si es esperable en GPU de consumo con memoria suficiente, aunque el autor no lo documenta explicitamente. En Apple Silicon se reporta ejecucion con MLX en un M4 Max.
- Opciones de despliegue: la libreria declarada es transformers, con pesos en safetensors. El autor menciona MLX para Apple Silicon. No se confirman en la informacion disponible otros runners como vLLM, llama.cpp, Ollama o TGI.
- Latencia: aproximadamente 24 ms por decision en RTX PRO 6000 y unos 60 ms en Apple M4 Max (MLX). No se publica throughput.
- Nota: el tamano del repositorio es de 13,3 GB, superior a lo que ocuparia solo el modelo, probablemente por incluir varias revisiones y adaptadores.

## Comparativa con modelos similares

| Modelo | Parametros | Precision del panel | ECE | Tiempo de decision | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Jeff-Qwen3.5-2B v1.2 (este modelo) | 2,2B | 81,7% | 0,021 | 24 ms (RTX PRO 6000) | Apache 2.0 | HuggingFace (jeff-legacy/Jeff-Qwen3.5-2B) |
| Jeff-Qwen3.5-0.8B (v1.2) | 0,8B | 78,7% | 0,028 | 22 ms (RTX PRO 6000) | no disponible en la informacion | HuggingFace (mstrasser/Jeff-Qwen3.5-0.8B) |
| Jeff-Gemma4-E2B | Gemma 4 E2B | 81,6% | 0,031 | 29 ms (RTX PRO 6000) | no disponible en la informacion | HuggingFace (mstrasser/Jeff-Gemma4-E2B) |
| Jev (publicado) | no disponible | 83,0% | ≈0,06 | 212 ms por llamada via API (harness Doom) | propietario (TypeSafe) | API |

No se dispone de datos de contexto ni de licencia de los modelos comparados mas alla de lo indicado; se marcan como "no disponible".

## Limitaciones y advertencias

- Modelo pequeno: el propio autor advierte de que su razonamiento no iguala al de Jev, que se ejecuta sobre un modelo mucho mayor; esta pensado para juicios rapidos, no para razonamiento complejo.
- Modelo marcado como superseded: no recibe actualizaciones; la version vigente es Jeff v1.3 (mstrasser/jeff-base).
- Solo ingles: la unica lengua declarada es `en`, sin garantias para otros idiomas.
- Caida de rendimiento en documentos largos: en v1.2 el resultado baja a 65,6% frente al 85,8% de v1.1, porque la cifra anterior estaba inflada por documentos filtrados del conjunto MAUD. Si se depende de v1.1 para contratos largos, debe esperarse el comportamiento de v1.2.
- No es un modelo generativo: no produce texto ni respuestas; su salida son probabilidades calibradas. No admite tool calling ni agentes multi-paso.
- Riesgo de clasificacion erronea: aunque no genera texto y por tanto no "alucina" en sentido clasico, puede asignar probabilidades altas a opciones incorrectas; conviene fijar umbrales y validar con datos propios.
- Calibracion dependiente del dominio: el ECE de 0,021 se mide en el panel de pruebas del autor; no se garantiza en dominios distintos.
- Datos de entrenamiento sinteticos: la mayor parte del corpus es sintetico, generado por un modelo abierto, y algunos conjuntos publicos incluyen texto producido con modelos cerrados (por ejemplo, RAGTruth), lo que puede introducir sesgos de esos modelos.
- Licencia Apache 2.0: permite uso comercial, pero al ser un ajuste fino de Qwen3.5-2B conviene revisar tambien las condiciones del modelo base.
- Independencia del proyecto: Jeff no esta afiliado ni respaldado por TypeSafe, fabricante de Jev, aunque use el mismo formato de peticion.
- La longitud de contexto del modelo no se especifica, lo que impide planificar con precision el tratamiento de entradas largas.
- El identificador del repositorio (jeff-legacy) no coincide con el autor citado en la model card (mstrasser); conviene verificar la procedencia antes de usarlo en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jeff-legacy/Jeff-Qwen3.5-2B
- Version vigente del proyecto (Jeff v1.3): https://huggingface.co/mstrasser/jeff-base
- Jeff-Qwen3.5-0.8B: https://huggingface.co/mstrasser/Jeff-Qwen3.5-0.8B
- Jeff-Gemma4-E2B: https://huggingface.co/mstrasser/Jeff-Gemma4-E2B
- Sitio del proyecto: https://jeffhub.ai
- Receta de entrenamiento AutoJev: https://github.com/denis-pplx/autojev
- Incidencia sobre listas largas en v1.0: https://github.com/firelex/jeff/issues/1
