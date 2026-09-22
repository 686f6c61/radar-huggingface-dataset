# eandujar/nnl_automl_model

## Resumen

`eandujar/nnl_automl_model` no es un modelo de lenguaje: es un clasificador de imagenes binario construido con AutoGluon `MultiModalPredictor` sobre un backbone de la libreria TIMM. El repositorio contiene unicamente el predictor ganador de un barrido aleatorizado de backbones preentrenados, seleccionado por balanced accuracy sobre un conjunto de validacion fijo. La variable objetivo es `extrudable` y el dataset de entrenamiento declarado es `sunkaiwen/sketch2stl-sketches-image`, por lo que el problema real es decidir si un boceto o imagen es extruible en un flujo de generacion de geometria tipo sketch-to-STL.

El checkpoint retenido es `repghostnet_200`, una red convolucional ligera de la familia RepGhostNet, integrada como unica rama (`timm_image`) del predictor multimodal. El autor declara una balanced accuracy de validacion de `1.000000`, un valor perfecto que debe interpretarse con cautela porque no se publica evaluacion sobre un conjunto de test independiente. El repo ocupa 1,1 GB e incluye solo el predictor ganador y los ficheros necesarios para inferencia.

Su relevancia es fundamentalmente metodologica y educativa (el propio repositorio se etiqueta con `education`): sirve como ejemplo reproducible de un pipeline AutoML end-to-end sobre imagenes, y como punto de partida para quien quiera replicar el barrido con sus propios datos. No es util como modelo generativo, no soporta texto, tool calling ni agentes, y no dispone de licencia declarada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal convolucional de clasificacion de imagenes; backbone TIMM `repghostnet_200` (familia RepGhostNet) integrado en AutoGluon `MultiModalPredictor` como unica rama `timm_image` |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de clasificacion de imagenes, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo linguistico) |
| Licencia | no disponible |
| Formato de pesos | no disponible; el repositorio contiene el predictor de AutoGluon y los ficheros necesarios para inferencia (no se declara safetensors ni GGUF) |
| Framework | AutoGluon MultiModal (`library_name: autogluon`) |
| Tipo de tarea | Clasificacion de imagenes binaria (la model card indica binaria; las etiquetas del repo indican `multiclass`, dato contradictorio) |
| Variable objetivo | `extrudable` |
| Metrica de seleccion | Balanced accuracy |
| Dataset declarado | `sunkaiwen/sketch2stl-sketches-image` |
| Tamano del repositorio | 1,1 GB |
| Descargas / likes | 0 / 0 |
| Creado / actualizado | 2026-09-22 (segun metadatos de HuggingFace) |

## Arquitectura y entrenamiento

La arquitectura es una CNN de clasificacion de imagenes. El backbone ganador, `repghostnet_200`, pertenece a la familia RepGhostNet, que combina modulos de tipo Ghost (generacion de mapas de caracteristicas redundantes a bajo coste) con tecnicas de reparametrizacion estructural, orientadas a reducir latencia de inferencia manteniendo precision. Sobre ese backbone, AutoGluon `MultiModalPredictor` construye el pipeline de clasificacion con `timm_image` como unica rama de modelo, de modo que no hay fusion multimodal con texto ni con datos tabulares pese a la etiqueta `tabular` del repositorio.

El entrenamiento consistio en un barrido aleatorizado de multiples backbones TIMM preentrenados, todos evaluados sobre las mismas particiones fijas de entrenamiento y validacion, con pesos preentrenados de TIMM como inicializacion y balanced accuracy como metrica de seleccion. Se conservo el checkpoint con mayor balanced accuracy de validacion (`repghostnet_200`, valor declarado `1.000000`). No se documenta el numero de imagenes, la composicion del dataset, el numero de pasos de entrenamiento, ni si hubo aumento de datos, ajuste fino completo o solo de la cabeza de clasificacion. Tampoco se menciona RLHF, DPO ni ninguna otra etapa de alineacion, algo esperable en un clasificador de este tipo. Como innovacion tecnica destacable solo puede citarse la propia seleccion AutoML del backbone y el uso de pesos preentrenados TIMM.

## Capacidades

- Clasificacion binaria de imagenes respecto a la etiqueta `extrudable`, es decir, estimar si una imagen o boceto dado pertenece a la clase positiva o negativa.
- Exposicion de la API estandar de AutoGluon al cargarse con `MultiModalPredictor.load(...)`, lo que en la practica permite inferencia por lotes y prediccion sobre nuevas imagenes.
- Reutilizacion como punto de partida (baseline) para barridos de backbones TIMM sobre un dataset propio con AutoGluon.
- Uso como ejemplo docente de un pipeline AutoML completo: descarga del repositorio, carga del predictor y ejecucion de inferencia.
- No soporta generacion de texto, razonamiento, codigo ni matematicas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues: no procesa lenguaje.
- No incluye modo "thinking", vision general de proposito abierto, audio ni video.
- No se documenta deteccion de objetos, segmentacion ni captioning: la salida es una clasificacion de la imagen completa.

## Casos de uso

- Triaje previo en un flujo sketch-to-STL: dado un boceto de entrada, clasificarlo como extruible o no antes de lanzar el motor de generacion de geometria, evitando gastar computo en entradas que no admiten extrusion.
- Validacion de entradas en herramientas CAD o de modelado 3D: avisar al usuario de que su dibujo no es apto para extrusion antes de que empiece a trabajar con el.
- Pre-anotacion de datasets de bocetos: usar el modelo para etiquetar automaticamente candidatos a `extrudable` y reservar la revision humana para los casos de baja confianza, acelerando la construccion de corpus mayores.
- Control de calidad en fabricacion aditiva: clasificar imagenes de piezas o secciones candidatas y marcar aquellas que el modelo considera no extruibles para inspeccion manual.
- Baseline reproducible en proyectos de AutoML: dado que el repositorio documenta la metodologia del barrido, sirve como referencia de comparacion cuando se prueba otro backbone TIMM sobre el mismo dataset.
- Material docente en cursos de machine learning aplicado: el flujo de `snapshot_download` mas `MultiModalPredictor.load` es un ejemplo minimo y ejecutable de despliegue de un modelo AutoML.
- Servicio interno de inferencia por lotes: integrado en un job programado que consuma un directorio de imagenes y escriba las predicciones en una tabla, sin requisitos de baja latencia.
- Estudio de senales de fuga de datos: la balanced accuracy perfecta en validacion lo convierte en un caso practico para auditar solapamiento entre particiones y riesgo de sobreajuste.

## Benchmarks y rendimiento

| Metrica | Valor | Conjunto | Notas |
|---|---|---|---|
| Balanced accuracy | 1.000000 | Validacion fija | Checkpoint `repghostnet_200`, mejor del barrido aleatorizado |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, ImageNet, etc.) en la informacion disponible. Tampoco se publican metricas de los backbones perdedores del barrido, ni resultados sobre un conjunto de test independiente, ni tiempos de inferencia.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. No se publican requisitos de hardware ni mediciones de memoria; el repositorio ocupa 1,1 GB en disco, pero eso no equivale al consumo en memoria durante la inferencia.
- GPU recomendadas: no disponible. Al tratarse de una CNN ligera, es probable que funcione correctamente en CPU y en GPUs de gama consumer, pero no hay datos publicados que lo confirmen.
- Compatibilidad con GPU consumer: no confirmada, aunque no se documenta ninguna dependencia de hardware de gama alta.
- Opciones de despliegue: AutoGluon `MultiModalPredictor.load(...)` es la unica via documentada. vLLM, llama.cpp, Ollama y TGI no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables publicados con el mismo dataset, la misma variable objetivo y la misma metodologia de seleccion. La model card menciona que se evaluaron multiples backbones TIMM preentrenados, pero no identifica cuales ni publica sus metricas, por lo que no es posible reconstruir la comparativa interna del barrido.

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `eandujar/nnl_automl_model` (`repghostnet_200`) | CNN de clasificacion binaria de imagenes | no disponible | no aplica | no disponible | HuggingFace, 0 descargas |
| Backbones TIMM alternativos del barrido | CNN de clasificacion de imagenes | no disponible | no aplica | no disponible | no identificados en la model card |
| Otros clasificadores AutoGluon MultiModal publicos | CNN de clasificacion de imagenes | no disponible | no aplica | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo de lenguaje ni un modelo generativo: cualquier uso esperado de chat, generacion de texto o agentes es inviable.
- La balanced accuracy de validacion de `1.000000` es sospechosamente alta y no esta respaldada por un conjunto de test independiente; puede indicar fuga de datos, solapamiento entre particiones, un problema excesivamente sencillo o un conjunto de validacion poco representativo.
- No se documenta el tamano ni la composicion del dataset, ni la distribucion de clases, por lo que no puede evaluarse el sesgo de clase del modelo.
- Sesgos conocidos: no disponibles. Al depender de `sunkaiwen/sketch2stl-sketches-image`, es probable que el modelo este sesgado hacia el estilo de dibujo, la resolucion y el dominio de ese dataset concreto, pero esto no se ha medido ni documentado.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de falsos positivos y falsos negativos en la clasificacion, sin tasas publicadas.
- Limitaciones de idioma: no aplica; el modelo no procesa texto.
- Restricciones de licencia: la licencia no esta declarada, lo que impide asumir permiso de uso comercial. Debe contactarse con el autor antes de cualquier despliegue en produccion.
- Metadatos inconsistentes: las etiquetas del repositorio indican `multiclass`, mientras que la model card describe un problema de clasificacion binaria. Tambien aparecen etiquetas `tabular` que no se corresponden con un unico ramal de imagen.
- Reproducibilidad limitada: no se publican hiperparametros, semillas, versiones de AutoGluon o TIMM, ni el codigo del barrido.
- Sin validacion por parte de la comunidad: 0 descargas y 0 likes, sin pipeline declarado, por lo que no hay evidencia externa de funcionamiento correcto.
- Las fechas de creacion y actualizacion indicadas en los metadatos (2026) no permiten contrastar la antiguedad real del artefacto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/eandujar/nnl_automl_model
- Dataset declarado: https://huggingface.co/datasets/sunkaiwen/sketch2stl-sketches-image
- Documentacion de AutoGluon MultiModal (referencia del framework): https://auto.gluon.ai
- Repositorio de AutoGluon (referencia del framework): https://github.com/autogluon/autogluon
- Libreria TIMM / pytorch-image-models (referencia de los backbones): https://github.com/huggingface/pytorch-image-models
- Resultados de la busqueda web: no se encontro ningun enlace relevante al modelo; los resultados devueltos correspondian a paginas de hora local de Manila (time.is, timeanddate.com, vClock, Worldometer) y no guardan relacion con el artefacto.
