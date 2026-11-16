# Donghyun1228/pi05-libero-dart-trainseed-merges-20261116

## Resumen

`Donghyun1228/pi05-libero-dart-trainseed-merges-20261116` es un repositorio de checkpoints experimentales de un modelo de vision-lenguaje-accion (VLA) basado en π0.5 (pi05), entrenado para tareas de manipulacion robotica en el benchmark LIBERO. El autor, Donghyun1228, publica aqui una coleccion de modelos resultantes de aplicar la receta DART (source one-shot fine-tuning + target one-shot fine-tuning, fusionados con el repositorio oficial y alpha 0.8) sobre distintas condiciones de perturbacion visual (view_large, view_medium, view_small, yaw10, yaw20) y distintas semillas de entrenamiento (42, 1, 2).

El objetivo del trabajo es medir la robustez del modelo frente a cambios en el punto de vista de la camara y rotaciones de yaw, un problema clasico de generalizacion en aprendizaje por imitacion para robotica. Los checkpoints se evaluan en LIBERO con 2000 episodios por condicion sobre GPU H100 y semilla de entorno 7, sirviendose con la configuracion `pi05_libero`.

El repositorio ocupa 47,3 GB y contiene unicamente los pesos fusionados; los checkpoints intermedios de fine-tuning no estan incluidos. No hay model card con especificaciones tecnicas del modelo base, licencia declarada ni idiomas soportados, por lo que buena parte de los datos de esta ficha figuran como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA basada en π0.5 (pi05); detalles internos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (repo de 47,3 GB; presumiblemente safetensors, sin confirmar) |

## Arquitectura y entrenamiento

El modelo parte de π0.5 (pi05), un modelo vision-lenguaje-accion orientado a control robotico, y se adapta mediante la receta DART: un fine-tuning one-shot sobre el dominio fuente y otro sobre el dominio objetivo, cuyos pesos se fusionan con el repositorio oficial usando un coeficiente alpha de 0.8. Esta tecnica de merging busca preservar el conocimiento del modelo base mientras se especializa en las condiciones visuales del benchmark LIBERO.

El entrenamiento se repite con tres semillas (42, 1 y 2) para evaluar la varianza entre ejecuciones. Las condiciones de evaluacion incluyen desplazamientos de punto de vista (view_small, view_medium, view_large) y rotaciones de yaw (yaw10, yaw20). Los datos de entrenamiento concretos (numero de tokens, composicion del dataset, uso de RLHF/DPO) no se detallan en la informacion disponible; solo se indica que se usan los recipes `SNUMPR/dart-libero-viewpoints` (para desplazamientos de vista) y `pi05_libero_dart_oneshot` (para yaw).

## Capacidades

- Control robotico por imitacion en tareas de manipulacion del benchmark LIBERO.
- Percepcion visual y mapeo vision-lenguaje-accion para generar comandos motores.
- Robustez parcial ante cambios de punto de vista de camara (view_small, view_medium, view_large).
- Robustez parcial ante rotaciones de yaw (10 y 20 grados).
- Reproducibilidad mediante multiples semillas de entrenamiento (42, 1, 2).
- No se documentan capacidades de generacion de texto general, codigo, matematicas, tool calling, agentes ni multilingüismo.

## Casos de uso

- Evaluacion de robustez visual en robotica: usar los distintos checkpoints (view_small, view_medium, view_large) para cuantificar como degrada el exito al alejar la camara del punto de vista de entrenamiento, con la tabla de resultados como referencia.
- Estudio de sensibilidad a la semilla: comparar seed1, seed2 y seed42 sobre la misma condicion para estimar la varianza de la receta DART antes de comprometer recursos en produccion.
- Investigacion en merging de modelos para VLA: replicar el esquema source one-shot FT + target one-shot FT con alpha 0.8 sobre π0.5 y medir el efecto en LIBERO.
- Baseline para fine-tuning posterior: partir de estos pesos fusionados como inicializacion en nuevas tareas de manipulacion con variaciones de camara.
- Benchmarking de infraestructura: el protocolo de evaluacion (H100, 2000 episodios, env seed 7, renderer osmesa/egl) sirve como referencia para medir throughput y estabilidad del serving con la config `pi05_libero`.
- Analisis de renderers: los resultados incluyen tanto osmesa como egl, lo que permite estudiar el impacto del backend de renderizado en las metricas de exito.

## Benchmarks y rendimiento

Resultados de exito (%) en LIBERO reportados por el autor (H100, env seed 7, 2000 episodios, config `pi05_libero`):

| Modelo | Condicion | Exito % | Renderer |
|---|---|---|---|
| dart_view_large_seed1 | view_large | 59,95 | osmesa |
| dart_view_large_seed42 | view_large | 61,05 | osmesa |
| dart_view_medium_seed1 | view_medium | 76,60 | egl |
| dart_view_medium_seed42 | view_medium | 78,95 | osmesa |
| dart_view_small_seed1 | view_small | 91,15 | osmesa |
| dart_view_small_seed2 | view_small | 90,05 | egl |
| dart_view_small_seed42 | view_small | 92,30 | osmesa |
| dart_yaw10_seed1 | yaw10 | 91,85 | egl |
| dart_yaw20_seed1 | yaw20 | 77,35 | egl |

No se han publicado resultados de benchmarks en la informacion disponible para comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: no disponible; el tamano del repo (47,3 GB) sugiere pesos en precision alta que probablemente requieran una GPU de 80 GB (A100/H100) o cuantizacion para caber en menos memoria.
- GPU recomendadas: el autor evalua en NVIDIA H100; no se documentan otras configuraciones.
- GPU de consumo: no confirmado; con 47,3 GB de pesos, cabria en RTX 4090 (24 GB) solo tras cuantizacion agresiva, sin datos que lo respalden.
- Opciones de despliegue: serving con la configuracion `pi05_libero` del repositorio oficial de π0.5; no se mencionan vLLM, llama.cpp, Ollama ni TGI (son frameworks de LLM, no necesariamente aplicables a un VLA).
- Latencia y throughput: no disponibles; la evaluacion usa 2000 episodios por condicion con renderers osmesa y egl.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento LIBERO | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05-libero-dart (este repo) | no disponible | no disponible | 59,95-92,30 % segun condicion | no disponible | Hugging Face, 47,3 GB |
| π0.5 (pi05) base | no disponible | no disponible | no disponible en esta ficha | no disponible | repo oficial de π0.5 |
| Alternativas VLA (OpenVLA, RT-2, etc.) | no disponible | no disponible | no disponible en esta ficha | no disponible | no disponible |

No se dispone de datos suficientes en la informacion proporcionada para establecer una comparativa cuantitativa con alternativas.

## Limitaciones y advertencias

- Licencia no declarada: no es posible determinar si se permite uso comercial; hay que contactar con el autor o asumir restricciones por defecto.
- Solo cubre tareas y entornos de LIBERO; no es un modelo de proposito general ni un LLM conversacional.
- Degradacion clara al alejar el punto de vista: el exito cae del 92,30 % (view_small) al 59,95 % (view_large), lo que limita su uso fuera de condiciones cercanas a las de entrenamiento.
- Sensibilidad al yaw: yaw20 baja al 77,35 % frente al 91,85 % de yaw10.
- Varianza entre semillas observable (por ejemplo, view_medium: 76,60 % con seed1 y 78,95 % con seed42), lo que exige validacion con multiples ejecuciones.
- Resultados medidos con renderers distintos (osmesa y egl); la comparacion entre filas no es perfectamente homogenea.
- Checkpoints de fine-tuning no incluidos: solo se publican los pesos fusionados, lo que dificulta reproducir el proceso intermedio.
- Riesgo de sobreajuste al benchmark LIBERO y a la semilla de entorno 7 usada en la evaluacion.
- No hay informacion sobre sesgos, alucinacion en el sentido linguistico ni cobertura multilingue, al no ser un modelo de texto general.

## Enlaces

- Hugging Face: https://huggingface.co/Donghyun1228/pi05-libero-dart-trainseed-merges-20261116
- Codigo del autor: https://github.com/Donghyun1228/vla_adaptation
- Dataset de puntos de vista: https://huggingface.co/SNUMPR/dart-libero-viewpoints
- Recipe de yaw: `pi05_libero_dart_oneshot` (referenciado en la model card, sin URL directa)
- Repositorio oficial de π0.5 (pi05): no disponible en la informacion proporcionada
