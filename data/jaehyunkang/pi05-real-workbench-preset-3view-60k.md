# jaehyunkang/pi05-real-workbench-preset-3view-60k

## Resumen

Pi0.5 Real Workbench (preset-3view) es un checkpoint de política robótica publicado por el usuario jaehyunkang en Hugging Face, derivado por ajuste fino del modelo base `lerobot/pi05_base`. Se trata de un modelo de visión-lenguaje-acción (VLA) de la familia Pi0.5, con 4.143.404.816 parámetros (~4,14 mil millones) almacenados en formato safetensors y un repositorio de 24,5 GB que incluye, además de los pesos, el estado de reanudación del entrenamiento. El modelo resuelve el problema del control manipulativo de un brazo robótico a partir de instrucciones en lenguaje natural y tres vistas de cámara, generando comandos de acción en el espacio cartesiano.

El ajuste se realizó sobre el dataset `Myungkyu/real_workbench-preset-gemini` durante 60.000 pasos de optimización, con un lote global de 64, cuatro GPU y semilla 42. Cubre cuatro tareas de un banco de trabajo (*workbench*), usa instrucciones de subtarea definidas por fotograma en el parquet del dataset y consume tres vistas (exterior, muñeca y una imagen de fotograma clave `observation.image.keyframe`). La salida es un *chunk* de 50 acciones con horizonte de ejecución de 50 y 10 pasos de denoising en inferencia.

Su relevancia es acotada pero clara: es un ejemplo reproducible y documentado de ajuste fino de Pi0.5 con LeRobot, útil para quien necesite una política ya entrenada sobre un banco de trabajo concreto, o como punto de partida metodológico para replicar el *pipeline* con datos propios. No es un modelo de propósito general: el propio autor advierte de que no se reclaman métricas de evaluación en robot real y de que los campos de entrada personalizados pueden requerir la implementación exacta con la que se entrenó.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de vision-lenguaje-accion (VLA) de la familia Pi0.5; derivado por ajuste fino de `lerobot/pi05_base`. La model card no detalla la arquitectura interna; el tokenizador de referencia es `google/paligemma-3b-pt-224` (revision `35e4f46485b4d07967e7e9935bc3786aad50687c`) |
| Parametros totales | 4.143.404.816 (~4,14 mil millones) |
| Parametros activos | No aplica (no se declara arquitectura MoE) |
| Longitud de contexto | No disponible. El horizonte de acciones (*action chunk*) es de 50 y el horizonte de ejecucion de 50; la inferencia usa 10 pasos de denoising |
| Tipos de cuantizacion | No disponible. No se publican pesos GGUF ni variantes cuantizadas; el repositorio contiene safetensors sin cuantizar |
| Idiomas soportados | No disponible. Las instrucciones se suministran como subtarea por fotograma del parquet del dataset; la model card no declara idiomas |
| Licencia | No disponible (la model card y los metadatos de Hugging Face no especifican licencia) |
| Formato de pesos | Safetensors; el repositorio incluye pesos de politica, configuracion, preprocesado/postprocesado y estados de normalizacion en la raiz, y ficheros de reanudacion en `training_state/` |
| Entrada de estado | 8 dimensiones |
| Espacio de accion | Delta EEF de 7 dimensiones (6 de velocidad cartesiana + pinza) |
| Vistas de entrada | 3 (camara exterior, camara de muneca y `observation.image.keyframe`) |
| Resolucion de imagen | Almacenada a 224x126; la politica rellena (*pad*) a 224x224 |
| Pasos de entrenamiento | 60.000 pasos de optimizacion |
| Dataset de entrenamiento | `Myungkyu/real_workbench-preset-gemini` |
| Modelo base | `lerobot/pi05_base` |
| Libreria | lerobot |
| Tamano del repositorio | 24,5 GB |
| Fecha de creacion | 2026-09-17 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna mas alla de identificarla como una politica Pi0.5 (prefijo `pi05` en las etiquetas y modelo base `lerobot/pi05_base`). Se trata, por tanto, de un modelo de vision-lenguaje-accion: consume imagenes de camara y una instruccion textual de subtarea, y produce acciones continuas de control. Los hiperparametros relevantes documentados son el *action chunk* de 50 pasos con horizonte de ejecucion de 50 y 10 pasos de denoising en inferencia, lo que indica un esquema de generacion de acciones por difusion o *flow matching* en lugar de regresion directa. El estado de entrada tiene 8 dimensiones y la accion es un delta de efector final de 7 dimensiones (6 velocidades cartesianas mas apertura de pinza).

El ajuste fino se ejecuto durante 60.000 pasos de optimizacion con lote global 64, cuatro GPU y semilla 42. La implementacion de entrenamiento es `RLWRLD/hiwrld-ll-policy`, con una copia integrada (*vendored*) de LeRobot Pi0.5; la model card advierte de que los campos de entrada personalizados pueden exigir esa implementacion concreta para funcionar. No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si hubo fases de RLHF o DPO. Tampoco se declaran innovaciones tecnicas adicionales mas alla del esquema de accion en *chunks* con denoising reducido (10 pasos), orientado a latencia de control.

Cabe senalar que el modelo no esta pensado como un LLM de proposito general: el texto se usa como condicionamiento de tarea y la salida es exclusivamente accion motora. Cualquier uso conversacional o de generacion de texto queda fuera de su diseno.

## Capacidades

- Generacion de acciones de manipulacion robotica: produce *chunks* de 50 acciones de 7 dimensiones (6 de velocidad cartesiana del efector final y 1 de pinza) a partir de observaciones visuales y estado del robot.
- Control condicionado por instruccion: acepta una subtarea textual por fotograma como condicionamiento de la politica.
- Percepcion multi-vista: procesa tres flujos de imagen simultaneos (camara exterior, camara de muneca y una imagen de fotograma clave definida por el dataset).
- Cobertura de cuatro tareas de *workbench*: segun la model card, el alcance de tareas cubre las cuatro tareas del banco de trabajo del dataset.
- Inferencia de baja latencia relativa: 10 pasos de denoising por *chunk* de 50 acciones, lo que amortiza el coste de generacion por accion.
- Compatibilidad con el ecosistema LeRobot: pesos, configuracion y estados de normalizacion en la raiz del repositorio, con posibilidad de reanudar entrenamiento desde `training_state/`.
- No se documenta soporte de *tool calling*, *function calling*, razonamiento multi-paso de tipo agente, vision generativa, audio ni modo de pensamiento (*thinking*). Estas capacidades no estan declaradas y no deben asumirse.

## Casos de uso

- Manipulacion en banco de trabajo con robot real: la politica esta entrenada para las cuatro tareas del *workbench* del dataset. Se usaria cargando los pesos con LeRobot, alimentando las tres vistas mas el estado de 8 dimensiones y la subtarea textual, y ejecutando los *chunks* de 50 acciones sobre el controlador del brazo.
- Punto de partida para ajuste fino con datos propios: al derivar de `lerobot/pi05_base` y publicar los estados de normalizacion y el estado de reanudacion, sirve como inicializacion para reentrenar con un banco de trabajo distinto, reutilizando el *pipeline* de preprocesado.
- Reproduccion de experimentos de VLA: la semilla (42), el lote global (64), el numero de GPU y el manifiesto con hashes SHA-256 (`artifact_manifest.json`) permiten auditar y reproducir el entrenamiento en un entorno equivalente.
- Investigacion sobre *action chunking*: el modelo permite estudiar el compromiso entre horizonte de accion (50) y pasos de denoising (10), midiendo su efecto sobre la frecuencia de control efectiva y la suavidad de las trayectorias.
- Evaluacion de politicas en simulacion o gemelo digital: integrado en LeRobot, puede ejecutarse contra un entorno simulado con las mismas tres vistas para validar la politica antes de desplegarla en hardware.
- Docencia y laboratorios de robotica: es un ejemplo completo y de tamano medio (~4,14 mil millones de parametros) de politica VLA con vision multi-camara, accion continua y flujo de datos documentado, adecuado para practicas de aprendizaje por imitacion.
- Desarrollo de control de efector final por velocidad: su espacio de accion de delta EEF con componente de velocidad cartesiana encaja en arquitecturas de control que ya trabajan en ese espacio y no en posiciones absolutas.
- Banco de pruebas para integracion de camaras de muneca: el uso de una vista de muñeca ademas de la exterior es directamente reutilizable en montajes que ya dispongan de esa configuracion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que se trata de un checkpoint entrenado y no de un resultado de evaluacion, y que no se reclaman metricas de evaluacion en robot real.

## Requisitos de hardware

- VRAM estimada para inferencia (calculo a partir del recuento declarado de 4.143.404.816 parametros, sin incluir activaciones ni el codificador visual): aproximadamente 16,6 GB en fp32, 8,3 GB en bf16/fp16, 4,1 GB en int8 y 2,1 GB en int4. No se publican pesos cuantizados, por lo que las cifras en int8/int4 son hipoteticas y requeririan cuantizacion propia.
- Margen adicional necesario: a las cifras anteriores hay que sumar la activacion de tres flujos de imagen a 224x224 (las imagenes se rellenan desde 224x126), el codificador visual y el bucle de denoising de 10 pasos. Se recomienda reservar entre 2 y 4 GB extra en bf16.
- GPU profesionales: A100 40/80 GB y H100 son suficientes con holgura para bf16. El entrenamiento documentado uso cuatro GPU, aunque la model card no especifica el modelo concreto.
- GPU de consumo: cabe en bf16 en tarjetas de 24 GB (RTX 3090, RTX 4090) y en tarjetas de 16 GB (RTX 4080, RTX 4060 Ti 16 GB) con margen ajustado. En tarjetas de 12 GB probablemente sea necesario cuantizar o reducir el lote de imagenes.
- Opciones de despliegue: la libreria declarada es LeRobot (`lerobot`), con pesos en safetensors y scripts propios de evaluacion de politicas. No se publican pesos GGUF, por lo que Ollama y llama.cpp no son aplicables sin conversion previa. vLLM y TGI estan orientados a modelos de lenguaje y no cubren directamente el bucle de inferencia de acciones de un VLA.
- Latencia y throughput: no disponible. La model card solo indica el numero de pasos de denoising (10) y el horizonte de accion (50), pero no publica tiempos de inferencia ni frecuencia de control medida.
- Almacenamiento: el repositorio ocupa 24,5 GB, muy por encima de lo que ocupan los pesos en bf16 (~8,3 GB), porque incluye el estado de reanudacion en `training_state/`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / horizonte | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| jaehyunkang/pi05-real-workbench-preset-3view-60k | 4.143.404.816 | Horizonte de acciones 50; denoising 10 pasos | No disponible | Publicado en Hugging Face; 0 descargas y 0 likes en el momento de la consulta | Ajuste fino especifico de cuatro tareas de *workbench* |
| lerobot/pi05_base | No disponible | No disponible | No disponible | Modelo base publicado por LeRobot | Es el modelo de partida del ajuste; sin especializacion en tareas |
| lerobot/pi0 | No disponible | No disponible | No disponible | Publicado por LeRobot | Generacion anterior de la familia Pi0 dentro de LeRobot; la comparacion cuantitativa no esta disponible |
| Otras politicas VLA de la misma categoria | No disponible | No disponible | No disponible | No disponible | No se dispone de datos verificados en la informacion proporcionada |

No se dispone de resultados comparativos de rendimiento entre estas alternativas en la informacion proporcionada, por lo que la comparacion se limita a parametros declarados, licencia y disponibilidad.

## Limitaciones y advertencias

- Licencia no declarada: ni la model card ni los metadatos de Hugging Face especifican una licencia. El uso comercial es juridicamente incierto y debe aclararse con el autor antes de cualquier despliegue en produccion.
- Sin metricas de evaluacion: la model card afirma explicitamente que es un checkpoint entrenado, no un resultado de evaluacion, y que no se reclaman metricas en robot real. No hay evidencia publica de tasa de exito.
- Especializacion estrecha: el alcance se limita a las cuatro tareas del banco de trabajo del dataset `Myungkyu/real_workbench-preset-gemini`. La generalizacion a otras tareas, objetos, iluminacion o disposicion fisica no esta documentada.
- Dependencia de la implementacion de entrenamiento: el autor advierte de que los campos de entrada personalizados pueden requerir la implementacion `RLWRLD/hiwrld-ll-policy` con LeRobot Pi0.5 integrado. Cargarlo con una version distinta de LeRobot puede fallar o producir resultados incorrectos.
- Requisitos de entrada rigidos: necesita tres vistas, incluida una imagen de fotograma clave `observation.image.keyframe` definida por el dataset, y la subtarea textual por fotograma correspondiente. Omitir cualquiera de estos campos degrada o invalida la inferencia.
- Riesgo de sobreajuste al dominio: 60.000 pasos sobre un unico dataset y con una sola semilla (42) no permiten estimar varianza entre ejecuciones.
- Sesgos: no se documenta analisis de sesgo. Al depender de un dataset de grabacion concreto, la politica puede heredar sesgos de posicion, iluminacion, tipo de objeto y configuracion de camaras presentes en la recogida de datos.
- Riesgo de alucinacion motora: como toda politica de aprendizaje por imitacion, puede producir acciones plausibles pero fisicamente invalidas o inseguras fuera de la distribucion de entrenamiento. Requiere limites de par, parada de emergencia y validacion en simulacion antes de operar hardware real.
- Idiomas no declarados: se desconoce si las instrucciones textuales admiten algo distinto del idioma del dataset. No debe asumirse soporte multilingue.
- Adopcion nula: cero descargas y cero likes en la fecha de actualizacion registrada, lo que implica ausencia de validacion por terceros.
- Repositorio pesado: 24,5 GB, incluyendo estado de entrenamiento, lo que complica su despliegue en entornos con almacenamiento limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jaehyunkang/pi05-real-workbench-preset-3view-60k
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/Myungkyu/real_workbench-preset-gemini
- Tokenizador de referencia: https://huggingface.co/google/paligemma-3b-pt-224
- Implementacion de entrenamiento citada: `RLWRLD/hiwrld-ll-policy` (URL no disponible en la informacion proporcionada)
- Manifiesto de artefactos con tamanos y hashes SHA-256: `artifact_manifest.json`, incluido en el repositorio del modelo
- Resultados de busqueda web: no se ha encontrado ningun enlace relevante al modelo en la busqueda realizada (los resultados devueltos correspondian a sitios no relacionados con el ambito del modelo).
