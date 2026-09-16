# OneScience-Group/WeatherBench

## Resumen

WeatherBench no es un modelo de lenguaje, sino una reproduccion de ingenieria del benchmark WeatherBench para prediccion meteorologica global basada en datos. El repositorio `OneScience-Group/WeatherBench` implementa la red neuronal convolucional (CNN) totalmente convolucional de cinco capas descrita en el articulo original, orientada a la evaluacion de la prediccion a tres y cinco dias de dos variables: Z500 (geopotencial en 500 hPa) y T850 (temperatura en 850 hPa). El benchmark original fue propuesto por equipos de la Universidad Tecnica de Munich, el ECMWF, la Universidad de Estocolmo, la Universidad de Washington y la Universidad de Toronto, y se apoya en la reanalisis ERA5 (1979-2018) con campos globales multirresolucion y 13 niveles de presion.

El objetivo del paquete es servir como referencia reproducible para validar pipelines de datos, entrenamiento, inferencia y metricas meteorologicas (RMSE y ACC con ponderacion por latitud) dentro del ecosistema OneScience, incluyendo ejecucion en GPU y en aceleradores DCU. El modelo opera sobre una malla global de 32x64 y sigue el protocolo iterativo de seis horas del articulo, con despliegues de 12 y 20 pasos que generan salidas con forma `[4,2,2,32,64]`.

Es relevante ahora porque proporciona una linea base ligera y verificable frente a la que comparar modelos de prediccion meteorologica mas complejos (grafos neuronales, transformers atmosfericos), y porque su integracion en OneScience permite validar infraestructura de entrenamiento distribuido con `torchrun` sin depender de recursos masivos. La licencia es Apache-2.0, el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no se publican recuentos de parametros ni resultados numericos propios en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN totalmente convolucional de cinco capas (no transformer) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje); horizonte de prediccion de 3 y 5 dias con paso temporal de 6 horas |
| Tipos de cuantizacion | no disponible (se distribuye un checkpoint PyTorch sin cuantizaciones publicadas) |
| Idiomas soportados | en (etiqueta declarada en la model card; el modelo no procesa texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | Checkpoint PyTorch (`.pt`, ruta `result/checkpoints/weatherbench_cnn.pt`) |

## Arquitectura y entrenamiento

La arquitectura reproducida es una red convolucional completamente convolucional de cinco capas que predice directamente Z500 y T850, o bien de forma iterativa segun el protocolo del articulo. El entrenamiento se realiza minimizando el error cuadratico medio (MSE) sobre datos sinteticos que conservan las variables Z500 y T850 en la malla `32x64` del articulo y el protocolo iterativo de seis horas. Se han verificado ejecuciones tanto en proceso unico como en DDP con dos procesos, y la inferencia restaura el checkpoint, ejecuta despliegues de 12 y 20 pasos con fronteras de longitud periodicas y produce salidas finitas de forma `[4,2,2,32,64]`.

Los datos de referencia del benchmark original son la reanalisis ERA5 de 1979 a 2018, con campos globales multirresolucion y 13 niveles de presion. El articulo compara la CNN con lineas base de persistencia, climatologia, regresion lineal e IFS. No se documenta en la informacion proporcionada el numero exacto de tokens o muestras de entrenamiento, la composicion detallada del dataset ni si se aplicaron tecnicas de RLHF o DPO (no aplicables en este dominio). Tampoco se describen innovaciones adicionales como atencion lineal o decodificacion especulativa.

## Capacidades

- Prediccion meteorologica de rango medio: evaluacion a tres y cinco dias de las variables Z500 y T850.
- Inferencia iterativa: despliegues de 12 y 20 pasos con paso temporal de seis horas y fronteras de longitud periodicas.
- Calculo de metricas meteorologicas: RMSE y ACC con ponderacion por latitud (WeatherBench scoring).
- Comparacion con lineas base: persistencia, climatologia, regresion lineal e IFS.
- Validacion de datos estructurados y visualizacion dentro del ecosistema OneScience.
- Entrenamiento multi-GPU y multi-DCU mediante `torchrun` (verificado con dos procesos, `--nproc_per_node=2`).
- No dispone de tool calling, function calling, soporte de agentes, razonamiento multi-paso en lenguaje natural ni capacidades multimodales de vision o audio.

## Casos de uso

- Evaluacion de prediccion a rango medio: usar el modelo para generar pronosticos de Z500 y T850 a tres y cinco dias y compararlos con las lineas base del benchmark, aprovechando el protocolo de seis horas ya implementado.
- Linea base de referencia en investigacion: emplear esta CNN como punto de partida reproducible antes de evaluar arquitecturas mas complejas (grafos neuronales o transformers atmosfericos), dado que el coste computacional del modelo es bajo.
- Validacion de metricas de prediccion: ejecutar `scripts/result.py` para calcular RMSE y ACC ponderados por latitud y comprobar la coherencia de pipelines de evaluacion propios.
- Pruebas de infraestructura de entrenamiento distribuido: lanzar `torchrun --nproc_per_node=2` con datos sinteticos para verificar configuraciones de DDP, asignacion de GPUs o DCUs y reproducibilidad de checkpoints.
- Integracion en entornos DCU: validar el stack OneScience sobre aceleradores domesticos instalando `onescience[earth-dcu]` con DTK 25.04.2 o version compatible.
- Formacion y docencia: usar el flujo completo (`fake_data.py`, `train.py`, `inference.py`, `result.py`) como ejemplo didactico de un pipeline meteorologico de principio a fin con malla pequena.
- Verificacion de conectividad en CPU: ejecutar la configuracion de muestra reducida por defecto sin GPU para comprobar que el entorno y las dependencias funcionan antes de escalar a hardware acelerado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe las metricas que el pipeline puede calcular (RMSE y ACC ponderados por latitud) y las lineas base con las que comparar (persistencia, climatologia, regresion lineal e IFS), pero no incluye valores numericos concretos de los despliegues de 12 y 20 pasos ni del entrenamiento realizado.

## Requisitos de hardware

- VRAM estimada: no disponible. No se documenta el numero de parametros ni mediciones de memoria.
- GPU o DCU recomendadas: se recomienda GPU o DCU para el flujo completo; los usuarios de DCU deben instalar DTK 25.04.2 o una version compatible recomendada por OneScience.
- Entorno CPU: valido para validacion de conectividad con la configuracion de muestra pequena por defecto.
- Malla de datos: `32x64` con salidas de forma `[4,2,2,32,64]`, lo que sugiere requisitos de memoria bajos, aunque no hay cifras publicadas que lo confirmen.
- Entrenamiento distribuido: soportado via `torchrun`, verificado con dos procesos en un solo nodo (`--nnodes=1 --master_port=29500`).
- Opciones de despliegue: ejecucion directa con PyTorch mediante los scripts `scripts/train.py` e `scripts/inference.py`; no se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Dentro de la informacion proporcionada, la comparativa documentada es contra las lineas base del benchmark original. No se dispone de especificaciones de modelos alternativos de la misma categoria.

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WeatherBench CNN (esta reproduccion) | CNN de 5 capas | no disponible | Prediccion a 3 y 5 dias, paso de 6 h | Apache-2.0 | HuggingFace (0 descargas) |
| Persistencia | Linea base trivial | no aplica | no aplica | segun benchmark original | en el benchmark original |
| Climatologia | Linea base estadistica | no aplica | no aplica | segun benchmark original | en el benchmark original |
| Regresion lineal | Linea base lineal | no disponible | no disponible | segun benchmark original | en el benchmark original |
| IFS | Modelo fisico del ECMWF | no disponible | no disponible | propietaria / institucional | operativo en el ECMWF |

Otros modelos de prediccion basada en datos (por ejemplo, enfoques de grafos neuronales o transformers atmosfericos): datos no disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni agentes, y no debe evaluarse con benchmarks tipo MMLU, HumanEval o GSM8K.
- Alcance limitado a dos variables (Z500 y T850) y a una malla de `32x64`; no cubre el espacio completo de variables meteorologicas del benchmark original.
- Los datos de entrenamiento usados en esta reproduccion son sinteticos, no ERA5 real; los resultados no son directamente comparables con los del articulo.
- No se publican recuentos de parametros, curvas de aprendizaje ni metricas numericas, lo que dificulta valorar la calidad del modelo.
- El repositorio presenta 0 descargas y 0 likes, sin evidencia de uso o validacion por parte de terceros.
- La reproduccion es un trabajo de ingenieria independiente: el articulo original, el codigo de WeatherBench y los datos ERA5 mantienen sus propias licencias y condiciones, que hay que respetar por separado.
- La licencia Apache-2.0 cubre este repositorio, pero no concede derechos sobre ERA5 ni sobre el codigo original del benchmark.
- La etiqueta de idioma `en` es nominal; el modelo no procesa lenguaje natural.
- Riesgo de sesgo y alucinacion: no aplica en el sentido habitual de los modelos generativos, pero si existe riesgo de error de prediccion no cuantificado en la informacion disponible.
- Para produccion meteorologica real seria necesario validar con ERA5 autentico, verificar la estabilidad de los despliegues largos y comparar contra un modelo operativo como IFS.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/OneScience-Group/WeatherBench
- Articulo original (arXiv:2002.00469): https://arxiv.org/abs/2002.00469
- Repositorio principal OneScience en Gitee: https://gitee.com/onescience-ai/onescience
- Repositorio de skills OneScience en Gitee: https://gitee.com/onescience-ai/oneskills
- Repositorio principal OneScience en GitHub: https://github.com/onescience-ai/OneScience
- Repositorio de skills OneScience en GitHub: https://github.com/onescience-ai/oneskills

Nota: la busqueda web realizada no devolvio enlaces adicionales relevantes sobre este modelo; los resultados obtenidos trataban sobre topicos no relacionados (APIs de ChatGPT y articulos de grafos neuronales sin conexion con este repositorio).
