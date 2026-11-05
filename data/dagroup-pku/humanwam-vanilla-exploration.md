# DAGroup-PKU/HumanWAM-Vanilla-Exploration

## Resumen

HumanWAM-Vanilla-Exploration es una coleccion de checkpoints de investigacion publicados por el grupo DAGroup-PKU (Universidad de Pekin) como parte del proyecto Open-HumanScale. Se trata de pesos de un modelo world-action (WAM, world-action model) para robotica, post-entrenados sobre el simulador RoboTwin y organizados en funcion de distintos estudios de ablacion y escalado. No es un modelo de lenguaje generalista, sino un artefacto de investigacion orientado a medir como escalan distintas variables (horas de datos, diversidad, alineamiento entre fuentes, supervision de acciones humanas) en el aprendizaje de politicas roboticas.

El repositorio agrupa los pesos en ocho series experimentales: `scaling-ia`, `scaling-idm`, `matched-diversity`, `cross-source-alignment`, `demonstration-efficiency`, `action-supervision`, `robot-vs-ego` y `multiview`. Cada checkpoint corresponde a un ajuste concreto (por ejemplo, `scaling-ia/ego-100h-clean-scene-ood.pt` selecciona el checkpoint usado para los resultados Clean y Scene-OOD del escalado de IA a 100 horas). El modelo se apoya en las dependencias de Wan (familia de modelos generativos de video) y se distribuye en formato `.pt` original, sin conversion de precision.

Su relevancia es fundamentalmente metodologica: el repositorio documenta de forma explicita que la subida esta en curso, que los adaptadores de inferencia para exploracion estan pendientes y que no se reclaman resultados agregados de benchmark nuevos. El tamano del repositorio es de 60,2 GB y el modelo solo declara soporte de ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (world-action model basado en dependencias Wan; detalles no publicados en la model card) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos `.pt` originales, sin conversion de precision) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | `.pt` (PyTorch), preservados sin reconversion |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna mas alla de etiquetar el modelo como `world-action-model` y senalar que depende de las dependencias comunes de Wan, con revisiones fijadas registradas en el `manifest.json`. No se especifican numero de parametros, tipo de transformer, mecanismo de atencion ni detalles de la cabeza de accion. El modelo se presenta como un "HumanWAM-Vanilla", es decir, una variante base sobre la que se realizan estudios de post-entrenamiento.

El entrenamiento documentado consiste en un post-entrenamiento sobre RoboTwin (simulador de manipulacion robotica), a partir del dataset `DAGroup-PKU/Open-HumanScale-50K`. Los estudios cubiertos incluyen escalado de IA, escalado de IDM, diversidad emparejada, alineamiento entre fuentes, eficiencia de demostraciones, supervision de acciones humanas, comparacion entre preentrenamiento robot y egocentrico, y adaptacion multivista. La model card advierte que a lo largo del largo periodo experimental se usaron distintas convenciones de alineamiento de muneca (wrist alignment); en las comparaciones de accion relativa esto afecta solo a la entrada de estado absoluto y, segun el autor, no se observaron diferencias apreciables de rendimiento en experimentos repetidos. Las ramas de accion absoluta conservan sus propias transformaciones de accion/estado y estadisticas de normalizacion, registradas en la configuracion de cada checkpoint.

## Capacidades

- Control de politicas roboticas de manipulacion en el simulador RoboTwin (post-entrenamiento especifico para esta plataforma).
- Modelado world-action: prediccion conjunta de dinamica del entorno y acciones, segun la etiqueta `world-action-model`.
- Evaluacion de ablaciones controladas: escalado de datos (IA, IDM), diversidad, alineamiento entre fuentes y eficiencia de demostraciones.
- Soporte de multiples vistas (`multiview`) y de comparacion entre preentrenamiento robot y egocentrico (`robot-vs-ego`).
- Supervision con acciones humanas (`action-supervision`) y acciones relativas frente a absolutas.
- No se documentan capacidades de generacion de texto, codigo, matematicas, vision general, tool calling ni agentes multi-paso.
- No se documenta modo thinking, audio ni capacidades multilingues mas alla del ingles.

## Casos de uso

- Investigacion en escalado de datos roboticos: usar los checkpoints de `scaling-ia` y `scaling-idm` para reproducir curvas de aprendizaje y comparar el efecto de horas de datos y de calidad del IDM en el rendimiento de la politica.
- Estudio de eficiencia de demostraciones: emplear la serie `demonstration-efficiency` para medir cuantas demostraciones reales son necesarias antes de que el rendimiento se sature, con el objetivo de reducir coste de recoleccion de datos en laboratorio.
- Comparativa robot vs egocentrico: utilizar `robot-vs-ego` para decidir si conviene preentrenar con video egocentrico humano o con datos de robot antes del post-entrenamiento en RoboTwin.
- Ablacion de supervision de acciones: usar `action-supervision` para evaluar el impacto de disponer de acciones humanas anotadas frente a solo observaciones, informando el diseno de futuros datasets.
- Adaptacion multivista: emplear `multiview` para estudiar la robustez de la politica ante cambios de configuracion de camaras, relevante para transferir a plataformas con distinta disposicion de sensores.
- Alineamiento entre fuentes: usar `cross-source-alignment` para analizar como afecta mezclar dominios de datos heterogeneos al rendimiento final en tareas de manipulacion.
- Reproducibilidad de estudios: descargar pesos y ficheros de `configs/`, `stats/` y `evaluations/` referenciados en `manifest.json` para replicar exactamente las condiciones de cada resultado publicado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que "no se reclaman nuevos resultados agregados de benchmark" y que las comprobaciones de configuracion y normalizadores no constituyen una evaluacion end-to-end en simulador.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se publican parametros ni huella de memoria por checkpoint).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; el flujo previsto es la carga de pesos `.pt` con las dependencias de Wan fijadas en el `manifest.json` y el codigo del repositorio `HumanNet` (rama `Open-HumanWAM`).
- Latencia y throughput: no disponible.
- Nota de almacenamiento: el repositorio completo ocupa 60,2 GB, por lo que conviene descargar solo los checkpoints y ficheros auxiliares referenciados en `manifest.json`.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (world-action models para robotica) con parametros, contexto o resultados que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Subida en curso: `manifest.json` distingue pesos publicados de entradas pendientes; una entrada pendiente no es una descarga disponible.
- Adaptadores de inferencia para exploracion pendientes: el adaptador W0 validado corresponde a la politica principal y no es un adaptador general de exploracion ni implementa Scene-OOD.
- Sin evaluacion end-to-end: las comprobaciones de configuracion y normalizadores no equivalen a una evaluacion completa en simulador.
- Nombres de fichero orientativos: un checkpoint seleccionado para un resultado concreto no implica que todos los mejores resultados de una fila experimental provengan del mismo checkpoint.
- Estadisticas no intercambiables: las estadisticas de normalizacion dependen de la convencion accion/estado, del diseno de vistas y del subconjunto de demostraciones; no son transferibles entre series.
- Convenciones de wrist alignment heterogeneas entre ejecuciones, con posible efecto en la entrada de estado absoluto (el autor reporta que no observo diferencias apreciables en comparaciones repetidas).
- Licencia no disponible: no puede confirmarse el uso comercial; conviene contactar con el autor antes de cualquier despliegue productivo.
- Solo ingles declarado y orientado a investigacion en robotica; no es un modelo de proposito general.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible para este artefacto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DAGroup-PKU/HumanWAM-Vanilla-Exploration
- Codigo y documentacion del proyecto: https://github.com/DAGroup-PKU/HumanNet/tree/Open-HumanWAM/humanwam_vanilla
- Modelo relacionado HumanWAM-Vanilla-RoboTwin: https://huggingface.co/DAGroup-PKU/HumanWAM-Vanilla-RoboTwin
- Modelo relacionado HumanWAM-Vanilla-Base: https://huggingface.co/DAGroup-PKU/HumanWAM-Vanilla-Base
- Coleccion Open-HumanScale: https://huggingface.co/collections/DAGroup-PKU/open-humanscale
- Dataset Open-HumanScale-50K: https://huggingface.co/datasets/DAGroup-PKU/Open-HumanScale-50K
