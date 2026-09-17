# NaaaaaiVe6/franka-10demos-normal_task16_cartesian_20260913T212156Z-step-6000

## Resumen
Este repositorio contiene un checkpoint de politica robotica para un brazo Franka, entrenado dentro del ecosistema `openpi` y etiquetado con `pi05`. No es un modelo de lenguaje: es un modelo de accion visomotora (tipo VLA) que recibe observaciones de camara y estado del robot y emite comandos de control en forma de trayectorias de accion. El checkpoint corresponde al paso 6000 de entrenamiento y fue generado por el usuario `NaaaaaiVe6`, aparentemente a partir de 10 demostraciones de una tarea concreta (identificada como `task16`) en representacion cartesiana.

La representacion de acciones es absoluta, no incremental: coordenadas XYZ cartesianas, cuaternion `xyzw` y un valor binario de pinza (-1/+1). La salida tiene 50 pasos y 32 coordenadas por paso, de las cuales solo las ocho primeras corresponden a acciones reales del robot. Los pesos se distribuyen en formato `safetensors` con precision bfloat16 y fueron convertidos desde JAX a PyTorch manteniendo la configuracion original del modelo de entrenamiento Franka.

Su relevancia es acotada y practica: sirve como artefacto reproducible para evaluar politicas de manipulacion, como punto de partida para fine-tuning y para estudiar la conversion de politicas JAX a PyTorch. El repositorio no incluye benchmarks, licencia declarada ni validacion externa (0 descargas y 0 likes en el momento de la consulta), por lo que debe tratarse como material experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (los tags del repositorio indican `openpi` y `pi05`) |
| Parametros totales | 3.616.757.520 (~3,6 mil millones) |
| Parametros activos | no disponible (no se ha confirmado que sea un modelo MoE) |
| Longitud de contexto | no disponible; como politica robotica emite un horizonte de 50 pasos con 32 coordenadas por paso (solo las 8 primeras son acciones del robot) |
| Tipos de cuantizacion | bfloat16 (pesos convertidos de JAX a PyTorch); no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible (no se documentan instrucciones en lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16), convertidos desde JAX |

## Arquitectura y entrenamiento
La informacion publicada no detalla la arquitectura interna mas alla de los tags `openpi` y `pi05`. La model card describe exclusivamente el proceso de conversion: paso de JAX a PyTorch en bfloat16 conservando la configuracion original del modelo Franka. El checkpoint esta en el paso 6000 y el repositorio ocupa 7,2 GB, coherente con 3,6 mil millones de parametros en bfloat16.

En cuanto a datos, el nombre del repositorio sugiere un entrenamiento con 10 demostraciones (`10demos`) sobre una tarea concreta (`task16`) en espacio cartesiano, con acciones absolutas (XYZ + cuaternion xyzw + pinza binaria -1/+1) en lugar de deltas de controlador. La model card indica que deben usarse los ficheros `assets/franka/norm_stats.json` y las transformaciones de entrenamiento correspondientes, y remite a `log.txt` para el layout de salida, la frontera de normalizacion, las entradas de camara y estado, y las convenciones del controlador "que requieren confirmacion". No se documenta el numero total de tokens o frames, la composicion del dataset, ni si hubo etapas de RLHF, DPO o aprendizaje por imitacion con objetivos auxiliares.

## Capacidades
- Generacion de trayectorias de accion para un brazo Franka en espacio cartesiano absoluto: XYZ, cuaternion xyzw y pinza binaria (-1/+1).
- Prediccion de chunks de accion de 50 pasos con 32 coordenadas por paso, de las cuales solo las 8 primeras se corresponden con acciones del robot.
- Consumo de observaciones multimodales: la model card menciona entradas de camara y de estado, cuyo layout exacto se detalla en `log.txt`.
- Normalizacion integrada mediante `assets/franka/norm_stats.json` y transformaciones de entrenamiento asociadas.
- Ejecucion en PyTorch con pesos bfloat16, tras conversion desde el checkpoint original en JAX.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, modo thinking, audio ni capacidades multilingues.

## Casos de uso
- Reproduccion de una tarea de manipulacion concreta: cargar el checkpoint en `openpi` junto con `norm_stats.json` y las transformaciones originales permite reproducir la tarea 16 sobre la que se entreno, siempre que el setup de camaras y de controlador coincida con el documentado en `log.txt`.
- Punto de partida para fine-tuning: al ser un checkpoint intermedio (paso 6000) de una politica de 3,6 mil millones de parametros, es util para especializar el modelo en tareas nuevas con un numero reducido de demostraciones adicionales.
- Evaluacion comparativa de checkpoints: permite medir si el paso 6000 ha convergido frente a pasos anteriores o posteriores del mismo entrenamiento, usando la misma normalizacion y el mismo entorno.
- Estudio de representaciones de accion: sirve para comparar control cartesiano absoluto frente a acciones delta de controlador en terminos de estabilidad y precision de agarre, dado que la model card insiste en esa distincion.
- Validacion de conversiones JAX a PyTorch: util para verificar si la conversion a bfloat16 y la configuracion Franka introducen desviaciones numericas respecto al modelo original.
- Integracion en un stack de control robotico: consumir los chunks de 50 pasos y las 8 coordenadas de accion para alimentar un controlador cartesiano, con la precaucion de confirmar las convenciones del controlador citadas en `log.txt`.
- Docencia y laboratorio de robotica: el modelo y los ficheros de normalizacion permiten montar practicas sobre politicas visomotoras y pipelines de inferencia en tiempo real.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tasas de exito, metricas de error de posicion, ni comparaciones con otros checkpoints. Los resultados de busqueda web realizados no devolvieron informacion relacionada con el modelo.

## Requisitos de hardware
- VRAM estimada para inferencia: aproximadamente 7,2 GB solo para los pesos en bfloat16 (3.616.757.520 parametros x 2 bytes). Sumando activaciones, buffers de vision y el chunk de 50 pasos x 32 coordenadas, es razonable reservar entre 12 y 16 GB, si bien el consumo exacto no esta documentado.
- Cuantizaciones de 8 y 4 bits reducirian los pesos a unos 3,6 GB y 1,8 GB respectivamente, pero no se documenta soporte para ellas ni existen ficheros precompilados.
- GPU recomendadas: A100 (40 o 80 GB), H100, L40S o cualquier acelerador con 24 GB o mas. Una RTX 4090 de 24 GB o una RTX 3090 de 24 GB deberian ser suficientes para inferencia en bfloat16, no asi tarjetas de 8 o 12 GB sin cuantizacion adicional.
- Cabe en GPU de consumo: si, en modelos de 16-24 GB, siempre que se acepte la precision bfloat16 sin margen documentado.
- Opciones de despliegue: la libreria declarada es `openpi`; los pesos en `safetensors` pueden cargarse desde PyTorch. No hay evidencia de soporte para vLLM, llama.cpp, Ollama o TGI, que estan orientados a modelos de lenguaje y no a politicas de control.
- Latencia y throughput: no disponibles. En control robotico son criticos y dependen del controlador, del ratio de camaras y de si se ejecuta el chunk completo o solo las primeras acciones.

## Comparativa con modelos similares
No se dispone de datos verificables en la informacion proporcionada para comparar este checkpoint con alternativas del mismo tipo. La unica referencia disponible es el propio ecosistema `openpi` y la etiqueta `pi05`, que situan al modelo dentro de la familia de politicas visomotoras de ese framework. Cualquier comparacion con otros modelos de accion como OpenVLA, pi0 o GR00T N1 requeriria datos que no se han facilitado.

| Modelo | Parametros | Contexto | Licencia | Datos disponibles |
|---|---|---|---|---|
| franka-10demos-normal_task16_cartesian (paso 6000) | 3.616.757.520 | no disponible | no disponible | solo model card y `log.txt` |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias
- Entrenamiento con solo 10 demostraciones: alta probabilidad de sobreajuste al entorno, a la iluminacion y a la posicion de objetos de esas demos.
- Modelo de tarea unica: el nombre indica `task16`; no hay evidencia de generalizacion a otras tareas ni de seguimiento de instrucciones en lenguaje natural.
- Pinza binaria (-1/+1): no permite controlar fuerza de agarre ni posiciones intermedias.
- Sobredimensionamiento de la salida: se emiten 32 coordenadas por paso pero solo 8 son acciones reales; consumir las 24 restantes produciria comandos invalidos.
- Acciones absolutas en cartesiano: un salto entre poses consecutivas puede generar movimientos bruscos; conviene validar limites de seguridad antes de ejecutar en hardware real.
- Dependencia estricta de `assets/franka/norm_stats.json` y de las transformaciones de entrenamiento; usar otra normalizacion invalida las predicciones.
- Conversion JAX a PyTorch bfloat16: puede introducir diferencias numericas respecto al modelo original, no cuantificadas en la informacion disponible.
- Convenciones del controlador pendientes de confirmacion: la propia model card remite a `log.txt` porque ciertos aspectos requieren verificacion.
- Licencia no declarada: no hay autorizacion explicita para uso comercial; conviene contactar con el autor antes de cualquier despliegue productivo.
- Ausencia de benchmarks, de validacion por terceros y de descargas o likes: el checkpoint no ha sido reproducido publicamente.
- Riesgo de alucinacion en el sentido de politicas que generan acciones plausibles pero incorrectas ante observaciones fuera de distribucion; en robotica esto se traduce en fallos fisicos, no en texto erroneo.
- Limitaciones de idioma: no aplica ni se documenta, ya que no se describen entradas de lenguaje natural.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/NaaaaaiVe6/franka-10demos-normal_task16_cartesian_20260913T212156Z-step-6000
- Fichero de log citado en la model card: https://huggingface.co/NaaaaaiVe6/franka-10demos-normal_task16_cartesian_20260913T212156Z-step-6000/blob/main/log.txt
- Resultados de busqueda web: no se encontro ningun enlace relevante sobre el modelo; las busquedas devolvieron resultados no relacionados (comparadores de seguros).
