# OskarK1/MMLandmarks_baseline

## Resumen

MMLandmarks_baseline es un modelo de referencia (baseline) publicado por OskarK1 asociado al benchmark MMLandmarks, presentado en CVPR 2026. Se trata de un modelo multimodal any-to-any disenado para tareas geoespaciales de recuperacion y localizacion entre vistas: dada una imagen de satelite, una imagen a pie de calle o una descripcion textual, el modelo devuelve representaciones que permiten recuperar la instancia de landmark correspondiente y estimar su ubicacion geografica. El checkpoint publicado corresponde a la configuracion `125849_GSTC_textfirst_losscomplete_bs512_lr0.0001_ep20`, entrenada con las modalidades GSTC (ground, satellite, text, coordinates).

El modelo no es un LLM generativo al uso, sino un encoder multimodal de recuperacion entrenado sobre el dataset MMLandmarks, que contiene 18.557 landmarks unicos de Estados Unidos, cada uno con multiples imagenes de vista terrestre, imagenes satelitales temporales, coordenadas GPS e informacion textual. Su relevancia radica en que unifica en un solo modelo tareas que tradicionalmente se abordan con arquitecturas especializadas: geolocalizacion, recuperacion cross-view y localizacion cross-view.

El repositorio ocupa 3,5 GB y se distribuye bajo licencia CC BY-SA 4.0. La informacion publica disponible es limitada: no se detalla la arquitectura interna, el numero de parametros ni los idiomas soportados, por lo que varios campos de esta ficha se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal any-to-any de recuperacion; detalles no publicados) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el texto del dataset es presumiblemente en ingles, no confirmado) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | no disponible (tamano del repo: 3,5 GB) |

## Arquitectura y entrenamiento

No se ha publicado informacion detallada sobre la arquitectura interna del modelo en la model card. El pipeline declarado es `any-to-any`, y el modelo se entrena con cuatro modalidades: imagenes de vista terrestre (G), imagenes satelitales (S), texto (T) y coordenadas (C). La configuracion del checkpoint indica `text_sampling: first`, `loss: complete`, `last_sat_only: false` y `outdoor_only: false`, con un entrenamiento de 20 epocas, batch size 512 y learning rate 0,0001.

El dataset de entrenamiento, MMLandmarks, cubre 18.557 landmarks unicos de Estados Unidos, cada uno con multiples imagenes de vista terrestre, satelitales temporales, coordenadas GPS y texto asociado. El objetivo es entrenar un unico modelo que sirva tanto para recuperacion (dada una modalidad, recuperar la instancia correcta) como para localizacion (estimar la ubicacion geografica). No se especifica en la informacion disponible si se emplearon tecnicas de RLHF, DPO ni innovaciones como decodificacion especulativa o atencion lineal.

## Capacidades

- Recuperacion cross-view ground-to-satellite (G2S) y satellite-to-ground (S2G).
- Recuperacion texto-a-ground (T2G) y texto-a-satellite (T2S).
- Geolocalizacion a partir de imagen de ground (G2C), satelite (S2C) y texto sin pistas explicitas (T2C `no_cues`).
- Representaciones multimodales alineadas entre imagen, satelite, texto y coordenadas.
- No se documenta soporte de tool calling, function calling, agentes ni modo de razonamiento extendido.
- No se documentan capacidades generativas de texto, codigo, matematicas ni audio.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Geolocalizacion de imagenes a pie de calle: dado un conjunto de fotografias de ground, el modelo estima la ubicacion geografica mediante la tarea G2C, con una precision de distancia a 1 km del 16,6 % y a 25 km del 36,0 %, util para triaje inicial en flujos de verificacion manual.
- Geolocalizacion a partir de imagenes satelitales: la tarea S2C alcanza un 26,4 % a 1 km y un 50,3 % a 25 km, adecuada para pipelines de catalogacion automatica de recortes satelitales.
- Recuperacion de landmarks por descripcion textual: con T2G (R@1 del 28,10 %) el modelo permite construir un buscador que, a partir de una descripcion en lenguaje natural, devuelve imagenes de referencia del landmark correspondiente.
- Verificacion cruzada ground-satellite: usando G2S y S2G se puede validar que una imagen terrestre y una satelital corresponden al mismo punto, lo que sirve en control de calidad de datasets geoespaciales y en tareas de cambio temporal.
- Indexacion y busqueda en bases de datos de imagenes georreferenciadas: las representaciones del modelo permiten construir indices vectoriales para recuperacion a escala continental sobre los 18.557 landmarks del benchmark.
- Investigacion en aprendizaje multimodal: el checkpoint sirve como linea base reproducible para comparar nuevas arquitecturas en tareas de recuperacion y localizacion cross-view dentro del benchmark MMLandmarks.
- Localizacion a partir de texto sin pistas explicitas: la tarea T2C `no_cues` (6,1 % a 1 km, 87,7 % a 2500 km) es util para estudiar el limite de la senal geografica recuperable solo desde descripciones.

## Benchmarks y rendimiento

Resultados publicados en la model card para el checkpoint `125849_GSTC_textfirst_losscomplete_bs512_lr0.0001_ep20`:

| Tarea | medR | mAP@1k | R@1 | R@5 | R@10 |
|---|---|---|---|---|---|
| G2S | 57 | 24,88 | 19,40 | 43,77 | 56,45 |
| S2G | 29 | 16,86 | 27,30 | 48,40 | 57,70 |
| T2G | 77 | 16,31 | 28,10 | 44,60 | 52,40 |
| T2S | 712 | 17,60 | 13,80 | 31,70 | 40,80 |

| Tarea | Dist @ 1 km | Dist @ 25 km | Dist @ 200 km | Dist @ 750 km | Dist @ 2500 km |
|---|---|---|---|---|---|
| G2C | 16,6 | 36,0 | 50,77 | 74,6 | 92,3 |
| S2C | 26,4 | 50,3 | 71,3 | 91,9 | 98,9 |
| T2C (`no_cues`) | 6,1 | 17,8 | 28,7 | 51,9 | 87,7 |

No se han publicado en la informacion disponible resultados comparativos frente a otros modelos en estos mismos benchmarks.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; el repositorio ocupa 3,5 GB, por lo que en cuantizacion de 16 bits cabria en GPU consumer con al menos 8 GB de VRAM, aunque no se confirma el formato de pesos.
- GPU recomendadas: no disponibles. Para indexacion a escala y recuperacion sobre grandes volumenes de imagenes se recomienda una GPU de datacenter (A100, H100) por throughput, pero es una estimacion general, no un dato del autor.
- Cabe en GPU consumer: probablemente si, dado el tamano del repo, aunque no confirmado.
- Opciones de despliegue: no documentadas. El codigo oficial de entrenamiento y evaluacion esta en el repositorio de GitHub `Oshkr/mml-codebase`; no se indica soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada, ni de resultados de terceros sobre el mismo benchmark. Los modelos especializados en geolocalizacion y recuperacion cross-view mencionados de forma generica en la model card no se identifican con nombre ni se acompanan de metricas comparables.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MMLandmarks_baseline | no disponible | no disponible | Ver tabla de benchmarks | CC BY-SA 4.0 | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Cobertura geografica restringida a Estados Unidos: el dataset cubre 18.557 landmarks del territorio estadounidense, por lo que el rendimiento fuera de esa region no esta validado.
- El modelo esta disenado para recuperacion y localizacion, no para generacion de texto ni para tareas de razonamiento general; no debe evaluarse como un LLM.
- T2S presenta un medR de 712, muy superior al resto de tareas, lo que indica una alineacion texto-satelite notablemente peor que texto-ground.
- La tarea T2C `no_cues` tiene un rendimiento bajo a corta distancia (6,1 % a 1 km), por lo que la localizacion puramente textual no es fiable a escala fina.
- No se documentan sesgos conocidos, pero al entrenar sobre datos de EE. UU. es previsible un sesgo hacia paisajes, arquitectura y toponimia estadounidenses.
- Riesgo de alucinacion: en tareas de recuperacion el modelo puede devolver el landmark mas cercano en el espacio de representaciones aunque no sea correcto; conviene umbralizar por similitud.
- Licencia CC BY-SA 4.0: permite uso comercial, pero obliga a atribucion y a compartir las obras derivadas bajo la misma licencia, lo que puede condicionar su integracion en productos propietarios.
- No se documentan requisitos de cita ni restricciones adicionales de uso.
- Para produccion, la falta de documentacion sobre arquitectura, formato de pesos y opciones de despliegue exige validacion propia antes de adoptarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OskarK1/MMLandmarks_baseline
- Repositorio de codigo de entrenamiento y evaluacion: https://github.com/Oshkr/mml-codebase
- Repositorio del dataset MMLandmarks: https://github.com/Oshkr/mmlandmarks
- Explorador del dataset: https://mmlandmarks.compute.dtu.dk/explore.html
