# IXDLI/AIRO-Doffy-DP-vision-joint-beaver-distance

## Resumen

AIRO-Doffy-DP-vision-joint-beaver-distance es un checkpoint de politica robotica publicado por el usuario IXDLI en Hugging Face, con `pipeline_tag: robotics` y libreria PyTorch. Segun la model card, corresponde a un entrenamiento "completado" iniciado el 9 de septiembre de 2026 que alcanzo el paso final 100000, ejecutado en el entorno `/project_ghent/AIRO-Doffy/dp_vision_joint_beaver_distance_20260909_c14_v1/output` con el identificador de trabajo `a32a6cea-c834-4a1f-9f3c-85c4f5b9d8fd`. El repositorio ocupa 6,5 GB e incluye el `last.pt`, checkpoints intermedios en los pasos 40000, 50000, 60000 y 70000, parametros EMA/modelo, normalizadores y ficheros de configuracion.

El nombre del artefacto ("DP", "vision", "joint") y el pipeline declarado apuntan a una politica de imitacion del tipo diffusion policy que consume observaciones visuales y estado articular del robot para producir acciones, aunque la model card no confirma explicitamente la arquitectura ni el numero de parametros. La referencia a `AIRO-Doffy` y a la ruta `/project_ghent/` sugiere vinculacion con el proyecto AIRO-Doffy de teleoperacion mediante realidad virtual, cuyo codigo se publica en GitHub, pero esta conexion no se detalla en la informacion disponible.

Su relevancia es acotada y de nicho: se trata de un artefacto de investigacion reproducible (checkpoints intermedios, normalizadores y configuracion incluidos), sin licencia declarada, sin idiomas definidos, sin resultados de benchmarks y con cero descargas y cero "likes" en el momento de la consulta. Resulta util como material de partida para reproducir o inspeccionar un entrenamiento concreto de robotica, no como modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre del modelo sugiere una politica de difusion con entrada visual y articular; no confirmado en la model card) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no hay evidencia de arquitectura MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; no se especifica horizonte de observacion ni de accion) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica a una politica robotica) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`last.pt` y checkpoints de los pasos 40000, 50000, 60000 y 70000, mas parametros EMA) |
| Tamano del repositorio | 6,5 GB |
| Pipeline declarado | robotics |
| Libreria | pytorch |
| Carga | `AIRO-Doffy policies.realman_beaver.checkpoint.load_policy` (segun la model card) |
| Fecha de creacion | 2026-09-10T09:11:53.000Z |
| Ultima actualizacion | 2026-09-10T09:14:37.000Z |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No se han publicado detalles de arquitectura en la informacion disponible. La model card se limita a indicar el estado del entrenamiento ("completed training started September 9, 2026. Final step: 100000"), la ruta de salida, el identificador de trabajo y el conjunto de artefactos guardados. A partir de los nombres de fichero (`last.pt`, checkpoints en pasos 40000 a 70000, parametros EMA, normalizadores y configuracion) puede deducirse que se trata de un entrenamiento por pasos con evaluacion periodica de checkpoints y uso de media movil exponencial de pesos, practica habitual en el entrenamiento de politicas de imitacion. No consta el numero de tokens o transiciones, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o refinamiento posterior.

El campo `pipeline_tag: robotics` junto con el prefijo "DP" y la mencion de vision y estado articular encajan con la familia de diffusion policies para manipulacion, en las que una red condicionada por observaciones genera una secuencia de acciones mediante un proceso iterativo de eliminacion de ruido. Cualquier afirmacion mas concreta sobre el tipo de backbone (UNet convolucional, transformer, híbrido), el numero de pasos de difusion, el horizonte de prediccion o la tasa de control seria especulacion: no esta respaldada por el material proporcionado. Tampoco se documentan innovaciones tecnicas adicionales, decodificacion especulativa ni mecanismos de atencion lineal.

## Capacidades

- Generacion de acciones de control roboticos: el pipeline declarado es `robotics`, por lo que el artefacto esta pensado para producir comandos motores a partir de entradas sensoriales, no para generar texto.
- Procesamiento de entrada visual: el nombre incluye "vision", lo que indica que consume imagenes como parte de la observacion; el tipo y resolucion de las camaras no se especifica.
- Entrada de estado articular: el nombre incluye "joint", lo que apunta a que el estado de las articulaciones forma parte del vector de observacion; no se detalla la configuracion del robot ni el numero de grados de libertad.
- Especificidad de tarea: el sufijo "beaver_distance" sugiere que la politica esta entrenada para una tarea concreta (entidad "beaver" y alguna nocion de distancia). No hay confirmacion de que generalice a otras tareas.
- Soporte de tool calling / function calling: no disponible; no aplica a un modelo de este tipo.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; no aplica.
- Capacidades especiales (modo thinking, vision-lenguaje, audio): no disponible. La unica capacidad especial inferible del nombre es la combinacion de vision y estado articular, sin confirmacion documental.
- Pesos normalizadores y configuracion incluidos: permite reconstruir el preprocesado de observaciones y la configuracion de inferencia, lo que facilita la reproducibilidad del entrenamiento.

## Casos de uso

- Reproduccion de un entrenamiento de robotica: el repositorio incluye checkpoints en los pasos 40000, 50000, 60000, 70000 y el final, ademas de normalizadores y configuracion, lo que permite estudiar la curva de aprendizaje y comparar el comportamiento del modelo en distintas fases del entrenamiento.
- Despliegue de una politica de manipulacion en el robot de destino: cargando `last.pt` mediante `AIRO-Doffy policies.realman_beaver.checkpoint.load_policy`, el modelo puede ejecutar la tarea para la que fue entrenado en un bucle de control que alimente observaciones visuales y de articulaciones.
- Investigacion en aprendizaje por imitacion: sirve como referencia de un entrenamiento completo de 100000 pasos para comparar variantes de arquitectura, esquemas de normalizacion o estrategias de checkpoints.
- Recoleccion de datos con teleoperacion en realidad virtual: el proyecto AIRO-Doffy publica codigo y aplicacion de teleoperacion con VR, de modo que este checkpoint puede emplearse como politica objetivo dentro de un flujo de recogida de demostraciones y evaluacion posterior.
- Evaluacion de robustez y analisis de fallos: al disponer de checkpoints intermedios, es posible medir si la politica converge de forma estable o si aparecen regresiones entre los pasos 40000 y 100000, informacion util antes de llevar el modelo a un entorno real.
- Base para ajuste fino en una tarea cercana: si la tarea "beaver_distance" comparte morfologia y espacio de acciones con otra variante, el checkpoint final puede servir como inicializacion para un reentrenamiento mas corto.
- Docencia y prototipado en laboratorio: al ser un artefacto pequeno en terminos relativos (6,5 GB de repositorio con varios checkpoints) y con pesos en PyTorch, es adecuado para practicas de carga, inferencia y analisis de politicas roboticas en un entorno academico.

En todos los casos, la idoneidad real depende de que la tarea, el robot y la interfaz de observacion coincidan con los del entrenamiento original, extremo que la model card no documenta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente indica el numero de pasos de entrenamiento (100000) y la fecha de finalizacion; no incluye tasas de exito, errores de posicion, curvas de recompensa ni comparaciones con otras politicas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 6,5 GB, pero contiene varios checkpoints (pasos 40000 a 70000, `last.pt`), parametros EMA, normalizadores y configuracion, por lo que el peso individual de un solo checkpoint es necesariamente inferior a esa cifra.
- GPU recomendadas: no disponibles. No hay requisitos publicados por el autor.
- Encaje en GPU de consumo: no confirmado. Las politicas de manipulacion con encoder visual suelen ser ordenes de magnitud mas pequenas que los modelos de lenguaje, por lo que es plausible su ejecucion en GPU de gama media o alta, pero se trata de una estimacion no respaldada por el material proporcionado.
- Opciones de despliegue: la model card indica carga mediante `AIRO-Doffy policies.realman_beaver.checkpoint.load_policy` sobre PyTorch. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput estimados: no disponibles. Si se confirma que la arquitectura es una politica de difusion, la latencia dependera del numero de pasos de eliminacion de ruido y del horizonte de accion, parametros que no se han publicado.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de parametros de este modelo, y el material proporcionado no incluye comparaciones. A continuacion se presenta una comparacion cualitativa por categoria, con la advertencia de que los datos de los modelos alternativos no proceden de la busqueda realizada y deben verificarse en sus fuentes originales.

| Modelo | Categoria | Parametros | Contexto / horizonte | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AIRO-Doffy-DP-vision-joint-beaver-distance | Politica robotica (posible difusion, vision + articulaciones) | no disponible | no disponible | no disponible | Hugging Face, repo de 6,5 GB |
| Diffusion Policy (Chi et al.) | Politica robotica por difusion | no disponible | no disponible | no disponible en el material aportado | Referencia academica y repositorio publico |
| ACT / ALOHA | Politica de imitacion con transformer y action chunking | no disponible | no disponible | no disponible en el material aportado | Repositorio publico |
| Octo | Politica generalista transformer entrenada con datos abiertos | no disponible | no disponible | no disponible en el material aportado | Repositorio publico |
| OpenVLA | Modelo vision-lenguaje-accion | no disponible | no disponible | no disponible en el material aportado | Repositorio publico |

La diferencia principal frente a estas alternativas es de alcance: los modelos generalistas se entrenan con datos de multiples robots y tareas, mientras que este checkpoint parece estar especializado en una unica tarea ("beaver_distance") y no publica metricas que permitan situarlo frente a ellos.

## Limitaciones y advertencias

- Ausencia total de licencia: no se especifica ninguna licencia, lo que impide determinar si el uso comercial esta permitido. En ausencia de licencia explicita, debe asumirse que no hay autorizacion clara para reutilizacion comercial.
- Ausencia de documentacion tecnica: no se declaran arquitectura, numero de parametros, datos de entrenamiento, regimen de entrenamiento ni metrica alguna, lo que dificulta la evaluacion previa.
- Especificidad de tarea: el nombre sugiere una politica entrenada para una tarea concreta. No hay evidencia de generalizacion a otras tareas, robots o entornos.
- Riesgo de sobreajuste al entorno de demostracion: al no documentarse la composicion del dataset, se desconoce la diversidad de escenas, iluminacion, posiciones iniciales y objetos cubiertos durante el entrenamiento.
- Riesgo de fallo silencioso en produccion: en politicas de imitacion, una prediccion incorrecta puede traducirse en movimientos fisicos inseguros. Se requiere validacion en entorno simulado y limitacion de velocidad y par antes de cualquier despliegue real.
- Sin datos de sesgo, alucinacion o comportamiento fuera de distribucion: no disponibles. En robotica, el equivalente relevante es la degradacion ante observaciones no vistas, que no se ha medido.
- Idiomas y capacidades linguisticas: no aplica; no debe esperarse ningun comportamiento de generacion de texto.
- Trazabilidad limitada del entrenamiento: se conocen la fecha, el identificador de trabajo y la ruta de salida, pero no el hardware, el tiempo de computo ni el presupuesto de entrenamiento.
- Estado del repositorio: cero descargas y cero "likes" en el momento de la consulta, sin comunidad que haya validado los pesos.
- Fechas en el futuro respecto a la consulta: los metadatos indican creacion y actualizacion en septiembre de 2026; conviene verificar la coherencia temporal del artefacto antes de integrarlo en un flujo de trabajo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/IXDLI/AIRO-Doffy-DP-vision-joint-beaver-distance
- Repositorio del proyecto AIRO-Doffy (codigo y aplicacion de teleoperacion con VR): https://github.com/XDL0-0/airo-doffy
- El resto de resultados de la busqueda web no guardan relacion con el modelo (consultas sobre inicio de sesion en Spotify y sobre Perplexity AI), por lo que no se incluyen como fuentes.
