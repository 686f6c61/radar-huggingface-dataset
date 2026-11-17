# Donghyun1228/pi05-libero-lape-review-runs-20261117

## Resumen

`Donghyun1228/pi05-libero-lape-review-runs-20261117` es un repositorio de artefactos de evaluacion (no un modelo base) publicado en Hugging Face por el usuario Donghyun1228. Contiene los resultados de una bateria de politicas de evaluacion derivadas de π0.5 (pi05), un modelo de vision-lenguaje-accion (VLA), aplicadas sobre el benchmark LIBERO en el contexto de un estudio sobre adaptacion por capas denominado LAPE. El repositorio corresponde a la "parte 6" de una serie de runs de respuesta a revisores, con partes anteriores publicadas en los IDs `-20261113`, `-20261114`, `-20261115` y `-20261116b`.

El contenido es fundamentalmente experimental: tablas de tasas de exito por condicion (variaciones de vista, yaw y semillas de entrenamiento) ejecutadas sobre GPU H100 con semilla de entorno 7 y 2000 episodios por run. El autor indica explicitamente que los checkpoints nativos y el `train_state` no estan incluidos, por lo que el repositorio no permite reproducir la inferencia directamente, solo consultar los resultados de evaluacion.

Por su naturaleza (artefacto de evaluacion de un VLA aplicado a manipulacion robotica), no debe confundirse con un modelo de lenguaje o multimodal de proposito general. La relevancia actual es acotada: sirve como material suplementario de un articulo o respuesta a revision, no como modelo desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el modelo subyacente es π0.5, un VLA; la arquitectura del repositorio es un conjunto de artefactos de evaluacion) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (el autor indica que no se incluyen checkpoints nativos ni `train_state`) |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura del modelo subyacente. Por el nombre (`pi05`) y el benchmark (`LIBERO`), se trata de π0.5, un modelo de vision-lenguaje-accion orientado a control robotico, pero la model card no aporta detalles sobre capas, atencion, tokenizador ni datos de preentrenamiento. El repositorio en si contiene resultados de evaluacion de politicas derivadas: "depth-linear anchor", "Surgical FT", "uniform/inverted training seeds" y runs con un unico valor de λ = 1e-2.

El entrenamiento y la evaluacion se realizaron en H100, con semilla de entorno 7 y 2000 episodios por run. Se comparan dos renderers (`egl` y `osmesa`) y dos condiciones de camara (`view_large` y `yaw30`). No se especifican hiperparametros de entrenamiento, numero de tokens, composicion del dataset ni si hubo RLHF/DPO; esa informacion no esta disponible en la model card.

## Capacidades

- Evaluacion de politicas VLA sobre tareas de manipulacion del benchmark LIBERO.
- Comparacion de condiciones de renderizado (`egl` frente a `osmesa`) para medir sensibilidad al renderer.
- Comparacion de condiciones de punto de vista (`view_large` frente a `yaw30`) y de semillas de entrenamiento (s1, s2, s42).
- Registro de tasas de exito por run (porcentaje sobre 2000 episodios).
- No incluye capacidad de generacion de texto, codigo, matematicas, vision general, tool calling, agentes ni multilingueismo; no es un modelo de proposito general.

## Casos de uso

- Analisis de robustez al cambio de camara en politicas VLA: comparar `view_large` (41,55-66,80 %) frente a `yaw30` (90,55-90,95 %) para identificar si la politica depende del punto de vista de entrenamiento.
- Auditoria de sensibilidad al renderer: contrastar runs `egl` y `osmesa` con la misma condicion (por ejemplo, `surgical_view_large_s2` con osmesa frente a `surgical_view_large_s1`/`s42` con egl) para estimar la varianza inducida por el motor de render.
- Reproduccion parcial de tablas de un articulo: usar los porcentajes publicados como referencia para validar una reimplementacion del pipeline de evaluacion.
- Estudio de metodos de adaptacion por capas: comparar "depth-linear anchor", "Surgical FT" y semillas uniformes/invertidas bajo la misma condicion (`view_large`) para decidir que estrategia de fine-tuning conserva mejor el rendimiento.
- Seleccion de hiperparametros en adaptacion VLA: usar los runs con λ = 1e-2 como punto de partida para barrer otros valores de λ en una replica.
- Documentacion de resultados para revision por pares: adjuntar el repositorio como material suplementario de una respuesta a revisores, dado que las tablas ya estan formateadas por run.

## Benchmarks y rendimiento

Resultados publicados en la model card (LIBERO, H100, semilla de entorno 7, 2000 episodios):

| Run | Condicion | Exito (%) | Renderer |
|---|---|---|---|
| depthlin_view_large_s1 | view_large | 41,55 | egl |
| depthlin_view_large_s2 | view_large | 42,05 | osmesa |
| depthlin_view_large_s42 | view_large | 58,95 | egl |
| depthlin_yaw30_s42 | yaw30 | 90,55 | egl |
| inverted_view_large_s1 | view_large | 59,85 | egl |
| surgical_view_large_s1 | view_large | 60,20 | egl |
| surgical_view_large_s2 | view_large | 60,60 | osmesa |
| surgical_view_large_s42 | view_large | 63,85 | egl |
| surgical_yaw30_s42 | yaw30 | 90,95 | egl |
| uniform_view_large_s1 | view_large | 66,80 | egl |

No se han publicado resultados de benchmarks de modelos comparables (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se incluyen pesos).
- GPU empleadas en la evaluacion: NVIDIA H100 (segun la model card).
- Compatibilidad con GPU de consumo: no determinable sin los pesos.
- Opciones de despliegue: no aplicables; el repositorio no contiene checkpoints desplegables.
- Latencia y throughput: no disponibles.
- Espacio en disco: el repositorio ocupa 77,2 GB, aunque el autor indica que no incluye checkpoints nativos ni `train_state`.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables ni datos de rendimiento de otras politicas VLA bajo el mismo protocolo.

## Limitaciones y advertencias

- No contiene pesos ni `train_state`: no es posible ejecutar inferencia ni reproducir el entrenamiento solo con este repositorio.
- Licencia no especificada: no hay autorizacion explicita para uso comercial ni para redistribucion.
- Resultados limitados a LIBERO, H100, semilla de entorno 7 y 2000 episodios; la generalizacion a otros entornos, robots o hardware no esta documentada.
- Alta varianza entre semillas de entrenamiento: en `view_large`, `depthlin` pasa de 41,55 % (s1) a 58,95 % (s42), lo que sugiere que las conclusiones por run individual son fragiles.
- Diferencia sistematica entre condiciones de camara (`view_large` ~41-67 % frente a `yaw30` ~90-91 %), lo que puede reflejar un sesgo del protocolo de evaluacion y no solo de la politica.
- Riesgo de sobreinterpretacion: al ser runs de respuesta a revisores, la seleccion de condiciones puede no ser exhaustiva.
- El repositorio no documenta sesgos demograficos, linguisticos ni de otro tipo; no aplica en el sentido habitual por no ser un modelo de lenguaje.

## Enlaces

- Hugging Face: https://huggingface.co/Donghyun1228/pi05-libero-lape-review-runs-20261117
- Repositorio de codigo indicado en la model card: https://github.com/Donghyun1228/vla_adaptation
- Parte anterior 1: https://huggingface.co/Donghyun1228/pi05-libero-lape-review-runs-20261113
- Parte anterior 2: https://huggingface.co/Donghyun1228/pi05-libero-lape-review-runs-20261114
- Parte anterior 3: https://huggingface.co/Donghyun1228/pi05-libero-lape-review-runs-20261115
- Parte anterior 4: https://huggingface.co/Donghyun1228/pi05-libero-lape-review-runs-20261116b
