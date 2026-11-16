# Donghyun1228/pi05-libero-lape-review-runs-20261116b

## Resumen

El repositorio `Donghyun1228/pi05-libero-lape-review-runs-20261116b` no contiene un modelo de lenguaje en sentido estricto, sino un conjunto de artefactos de evaluacion asociados a politicas de robotica basadas en el modelo π0.5 (pi05) entrenadas y evaluadas sobre el benchmark LIBERO. El autor, Donghyun1228, publica aqui los resultados de una bateria de "reviewer-response runs" (parte 5 de una serie que comienza en los repositorios `-20261113` y `-20261114`) sobre objetivos "fresh-walk" de 50k pasos con variaciones de yaw (10, 20 y 30 grados) y de punto de vista de camara (view_medium, view_small).

El contenido principal es una tabla de tasas de exito obtenidas en 2000 episodios por ejecucion, con semilla de entorno 7 y ejecucion en GPU H100, usando dos renderizadores distintos (EGL y OSMesa). Los resultados oscilan entre el 76,50 % y el 94,95 % de exito segun la condicion, lo que sugiere un estudio de robustez frente a perturbaciones de orientacion y de perspectiva visual en tareas de manipulacion.

Es relevante para investigadores en vision-language-action (VLA) y evaluacion de politicas de robotica, porque documenta de forma reproducible como varian las tasas de exito al modificar condiciones de camara y yaw, y porque el autor advierte explicitamente de que los checkpoints nativos y el `train_state` no estan incluidos en el repositorio. El codigo asociado se encuentra en `github.com/Donghyun1228/vla_adaptation`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (politica VLA derivada de π0.5, segun el titulo del repositorio) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (el autor indica que los checkpoints nativos y el `train_state` no estan incluidos) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo. El titulo y la model card lo identifican como π0.5 (pi05), una politica vision-language-action, evaluada sobre el benchmark LIBERO. Los artefactos publicados corresponden a "evaluation policies of the fully unpaired fresh-walk 50k targets", es decir, politicas de evaluacion de objetivos entrenados durante 50k pasos, con datos de origen en `Donghyun1228/libero-fresh-walk-yaw-1250f-20261116@010f4c4f`.

No se especifican en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF o DPO. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa o atencion lineal. Lo unico verificable es el protocolo de evaluacion: 2000 episodios por ejecucion, semilla de entorno 7, ejecucion en H100 y dos renderizadores (EGL y OSMesa).

## Capacidades

- Evaluacion de politicas de manipulacion robotica sobre el benchmark LIBERO.
- Tolerancia a perturbaciones de orientacion (yaw 10, 20 y 30 grados) con tasas de exito superiores al 92 %.
- Evaluacion bajo variaciones de perspectiva de camara (view_medium, view_small).
- Ejecucion reproducible con semillas de entorno fijas (semilla 7 en la bateria principal; semillas 3 y 4 en las ejecuciones de vista).
- Compatibilidad con renderizadores EGL y OSMesa para el entorno de simulacion.
- No se documentan capacidades de generacion de texto, codigo, matematicas, tool calling, agentes ni multilingues, al no tratarse de un modelo de lenguaje de proposito general.

## Casos de uso

- Estudio de robustez frente a yaw: las ejecuciones con yaw10, yaw20 y yaw30 (94,95 %, 94,35 % y 92,80 %) permiten cuantificar la degradacion de la politica al rotar la orientacion del objetivo, util para decidir margenes de seguridad en despliegue.
- Analisis de sensibilidad a la camara: las condiciones view_medium (76,50 % y 77,35 %) y view_small (87,90 % y 88,40 %) sirven para comparar que perspectiva perjudica mas el exito y guiar la eleccion de montaje de camara.
- Verificacion de reproducibilidad entre renderizadores: la comparacion entre yaw10 con OSMesa (93,60 %) y yaw20 con EGL (92,95 %) permite auditar si el backend grafico afecta a los resultados.
- Revision por pares de resultados de VLA: la tabla de 11 ejecuciones con 2000 episodios cada una proporciona evidencia cuantitativa para responder a revisores sobre consistencia de las tasas de exito.
- Comparacion entre semillas de evaluacion: las ejecuciones con semilla 3 y semilla 4 sobre las mismas condiciones (view_medium, view_small, yaw10, yaw20) permiten estimar la varianza entre semillas.
- Base para replicacion experimental: junto con el codigo en `github.com/Donghyun1228/vla_adaptation`, los resultados sirven para reproducir el protocolo de evaluacion en otros entornos o con otras politicas.

## Benchmarks y rendimiento

Resultados publicados en la model card (2000 episodios por ejecucion, semilla de entorno 7, H100):

| Ejecucion | Condicion | Exito (%) | Renderizador |
|---|---|---|---|
| fresh1250_yaw10_s42 | yaw10 | 94,95 | egl |
| fresh1250_yaw20_s42 | yaw20 | 94,35 | egl |
| fresh1250_yaw30_s42 | yaw30 | 92,80 | egl |
| seed3_view_medium | view_medium | 77,35 | egl |
| seed3_view_small | view_small | 87,90 | egl |
| seed3_yaw10 | yaw10 | 93,60 | osmesa |
| seed3_yaw20 | yaw20 | 92,95 | egl |
| seed4_view_medium | view_medium | 76,50 | egl |
| seed4_view_small | view_small | 88,40 | egl |
| seed4_yaw10 | yaw10 | 93,50 | osmesa |
| seed4_yaw20 | yaw20 | 91,70 | egl |

No se han publicado en la informacion disponible resultados de benchmarks de lenguaje (MMLU, HumanEval, GSM8K) ni comparaciones con otros modelos.

## Requisitos de hardware

- GPU de evaluacion documentada: NVIDIA H100 (segun la model card).
- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible mas alla de la H100 empleada en las ejecuciones.
- Viabilidad en GPU de consumo: no disponible.
- Opciones de despliegue: no disponible (no se documentan vLLM, llama.cpp, Ollama ni TGI).
- Latencia y throughput: no disponibles; solo se indica el numero de episodios (2000) por ejecucion.
- Tamano del repositorio: 84,9 GB, lo que condiciona el almacenamiento necesario para descargar los artefactos.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye comparaciones con otras politicas VLA ni con otros modelos de la misma categoria, y no se dispone de datos de parametros, contexto o licencia de este repositorio para establecer una comparacion fundamentada.

## Limitaciones y advertencias

- Los checkpoints nativos y el `train_state` no estan incluidos en el repositorio, por lo que no es posible reanudar el entrenamiento ni reutilizar directamente los pesos.
- La licencia no esta especificada, lo que impide confirmar si se permite el uso comercial.
- No se declaran idiomas soportados ni pipeline, por lo que la ficha no puede certificar capacidades de lenguaje natural.
- Los resultados corresponden a un unico benchmark (LIBERO) y a un protocolo concreto (2000 episodios, semilla de entorno 7); la generalizacion a otros entornos no esta documentada.
- Se observa una caida notable de exito en view_medium (76,50 %-77,35 %) frente a view_small (87,90 %-88,40 %) y yaw10 (93,50 %-94,95 %), lo que indica sensibilidad a la perspectiva de camara.
- Las ejecuciones con OSMesa solo cubren yaw10, de modo que la comparacion entre renderizadores es parcial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.
- Al no ser un modelo de lenguaje, no aplican riesgos de alucinacion textual, pero si los propios de una politica de robotica evaluada en simulacion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Donghyun1228/pi05-libero-lape-review-runs-20261116b
- Repositorio de codigo: https://github.com/Donghyun1228/vla_adaptation
- Dataset de origen citado: https://huggingface.co/Donghyun1228/libero-fresh-walk-yaw-1250f-20261116
- Repositorio parte 1: https://huggingface.co/Donghyun1228/pi05-libero-lape-review-runs-20261113
- Repositorio parte 2: https://huggingface.co/Donghyun1228/pi05-libero-lape-review-runs-20261114
