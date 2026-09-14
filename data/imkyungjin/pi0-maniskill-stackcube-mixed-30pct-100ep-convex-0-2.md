# ImKyungjin/pi0-maniskill-stackcube-mixed-30pct-100ep-convex-0.2

## Resumen

El modelo `ImKyungjin/pi0-maniskill-stackcube-mixed-30pct-100ep-convex-0.2` es un checkpoint de politica robotica basado en π₀ (Pi0), el modelo vision-lenguaje-accion (VLA) de proposito general desarrollado por Physical Intelligence. Lo publica el usuario ImKyungjin en Hugging Face y consiste en un ajuste fino de la implementacion LeRobot de π₀ sobre el conjunto de datos `local/maniskill_stackcube_mixed_30pct_100ep`, orientado a la tarea de apilar cubos (StackCube) del simulador ManiSkill. El resultado es una politica que recibe observaciones visuales e instrucciones en lenguaje natural y emite acciones de control continuo.

Tecnicamente es un modelo denso de 3.501.372.176 parametros (unos 3,5 mil millones), almacenado en safetensors con un repositorio de 7,0 GB, lo que es coherente con pesos en bf16/fp16. Se distribuye bajo licencia Apache-2.0 y esta integrado en el ecosistema LeRobot, lo que permite entrenarlo y evaluarlo con las herramientas estandar (`lerobot-train`, `lerobot-record`) sin conversiones adicionales.

Su relevancia es acotada pero clara: se trata de un artefacto de investigacion con cero descargas y cero likes en el momento de la consulta, publicado en septiembre de 2026, cuyo interes principal es servir como ejemplo reproducible de ajuste de una politica VLA de 3,5B parametros sobre un dataset de simulacion concreto, y como punto de partida para experimentos propios de aprendizaje por imitacion en robotica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en transformer. La model card indica que la implementacion procede del repositorio OpenPI de Physical Intelligence y que ha sido adaptada a LeRobot; no se detalla en la informacion proporcionada la composicion interna (backbone de vision, modelo de lenguaje y modulo de acciones) |
| Parametros totales | 3.501.372.176 (dato real de los pesos safetensors) |
| Parametros activos | No aplica (arquitectura densa, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible. Solo se publican pesos safetensors sin cuantizar; el tamano del repositorio (7,0 GB) es compatible con bf16/fp16 |
| Idiomas soportados | No disponible. El modelo acepta instrucciones en lenguaje natural, pero la model card no especifica idiomas |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

Otros datos de interes: libreria `lerobot`, pipeline `robotics`, repositorio de 7,0 GB, 0 descargas y 0 likes, creado y actualizado el 14 de septiembre de 2026.

## Arquitectura y entrenamiento

La model card describe π₀ como un modelo vision-lenguaje-accion para control general de robots, disenado como politica generalista capaz de interpretar entradas visuales, comprender instrucciones en lenguaje natural y controlar distintos tipos de robot en tareas diversas. La unica referencia tecnica que ofrece es que la implementacion de LeRobot deriva del repositorio OpenPI de codigo abierto de Physical Intelligence, y enlaza al blog oficial del proyecto. La informacion proporcionada no incluye el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO.

Sobre el ajuste concreto de este checkpoint, el nombre del repositorio y el identificador del dataset (`maniskill_stackcube_mixed_30pct_100ep`, con el sufijo `convex-0.2`) sugieren un entrenamiento supervisado por imitacion sobre demostraciones de la tarea StackCube de ManiSkill, con algun tipo de mezcla de datos al 30 % y 100 episodios, y con un parametro `convex` de 0,2 que la model card no documenta. Estas inferencias proceden exclusivamente de la nomenclatura y no estan confirmadas por el autor. Cabe senalar que el ejemplo de entrenamiento incluido en la model card usa `--policy.type=act`, lo que indica que ese bloque es la plantilla generica de LeRobot y no una receta especifica para este checkpoint de π₀.

## Capacidades

- Control robotico por vision-lenguaje-accion: genera acciones de control a partir de observaciones visuales y de una instruccion en lenguaje natural.
- Ejecucion de politicas en simulacion: el checkpoint esta ajustado para la tarea StackCube del benchmark ManiSkill.
- Aprendizaje por imitacion: puede reentrenarse o ajustarse con nuevos datasets de demostraciones mediante `lerobot-train`.
- Integracion con el ecosistema LeRobot: inferencia y evaluacion con `lerobot-record`, con soporte para el sufijo `eval_` en los datasets de evaluacion.
- Compatibilidad con robots del catalogo LeRobot: la documentacion de referencia menciona configuraciones como `so100_follower`.
- Soporte de tool calling / function calling: no disponible; no es una capacidad propia de una politica VLA.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles; no se especifican idiomas.
- Capacidades especiales (modo thinking, vision, audio): vision como entrada obligatoria para el control; no se documentan otras modalidades.

## Casos de uso

- Evaluacion de politicas VLA en simulacion: ejecutar el checkpoint sobre la tarea StackCube de ManiSkill para medir la tasa de exito del ajuste y compararla con la politica base. Es adecuado porque el nombre del repositorio indica que el entrenamiento se realizo especificamente sobre ese dataset.
- Punto de partida para ajuste fino con datos propios: usar el checkpoint como inicializacion en `lerobot-train` y sustituir el dataset por demostraciones de una tarea nueva, aprovechando los 3,5B parametros ya preentrenados en lugar de partir de cero.
- Reproduccion de experimentos academicos: servir como referencia concreta de un pipeline completo (dataset local, politica π₀, publicacion en el Hub) para validar resultados de investigacion en aprendizaje por imitacion.
- Estudio del efecto de la composicion de datos: el sufijo `mixed_30pct` permite investigar como influye una mezcla de datos al 30 % frente a un dataset puro en el rendimiento final de la politica.
- Pruebas de transferencia sim-a-real: dado que LeRobot soporta robots reales de bajo coste, el checkpoint puede utilizarse como base en experimentos de transferencia desde simulacion a un brazo fisico, asumiendo la brecha de dominio correspondiente.
- Docencia y prototipado en robotica: el modelo permite montar un ejemplo funcional de politica VLA de 3,5B parametros en un laboratorio o aula con una unica GPU, sin necesidad de infraestructura de entrenamiento a gran escala.
- Comparacion de arquitecturas de politica: enfrentar π₀ contra politicas tipo ACT sobre el mismo dataset y la misma tarea para analizar diferencias de comportamiento y coste computacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de exito, metricas de la tarea StackCube, curvas de entrenamiento ni comparaciones cuantitativas con otras politicas. Tampoco se documentan latencia ni frecuencia de inferencia.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de los 3.501.372.176 parametros, sin datos oficiales del autor):
  - bf16/fp16: aproximadamente 7,0 GB solo en pesos, mas activaciones y el codificador de vision, lo que situa el consumo practico en el entorno de 10-12 GB.
  - fp32: aproximadamente 14 GB en pesos, con un consumo practico estimado de 16-18 GB.
  - int8: aproximadamente 3,5 GB en pesos.
  - int4: aproximadamente 1,8 GB en pesos.
  - Advertencia: no se publican pesos cuantizados de este checkpoint y la informacion proporcionada no confirma que LeRobot soporte cuantizacion de π₀, por lo que las cifras de int8 e int4 son proyecciones teoricas.
- GPU recomendadas: una RTX 4090 (24 GB) es suficiente para inferencia en bf16 con margen; una RTX 3090 o RTX 4080 (16 GB) queda en el limite; para entrenamiento o ajuste fino son aconsejables A100 o H100 (40-80 GB) por el coste de memoria de las activaciones y del estado del optimizador.
- Cabe en GPU de consumo: si, en tarjetas con 16 GB o mas de VRAM para inferencia en bf16. En GPUs de 8-12 GB solo seria viable con cuantizacion, no publicada por el autor.
- Opciones de despliegue: LeRobot (`lerobot-train`, `lerobot-record`) sobre PyTorch es la via documentada. No aplican vLLM, llama.cpp, Ollama ni TGI, ya que se trata de una politica VLA con modulo de acciones y no de un modelo de lenguaje de proposito general.
- Latencia y throughput: no disponibles. No se han publicado mediciones en la informacion proporcionada.

## Comparativa con modelos similares

Los datos de los modelos alternativos de la tabla no proceden de la informacion proporcionada en esta consulta, sino de conocimiento general sobre el ecosistema VLA; los campos marcados como "no verificado" deben confirmarse en las fuentes oficiales antes de usarse en una decision de produccion.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este checkpoint (π₀ ajustado) | 3,5B | No disponible | Apache-2.0 | Hugging Face, libreria lerobot | Ajuste especifico sobre ManiSkill StackCube |
| π₀ base (Physical Intelligence / OpenPI) | ~3B (orden de magnitud, no verificado) | No disponible | No verificado | Repositorio OpenPI y pesos publicos | Politica generalista original, sin ajuste a StackCube |
| OpenVLA | 7B (no verificado) | No disponible | No verificado | Hugging Face y repositorio publico | Politica VLA de referencia en la literatura; mayor tamano |
| RDT-1B | 1,2B (no verificado) | No disponible | No verificado | Hugging Face y repositorio publico | Politica de difusion de menor tamano |

No se dispone de datos de rendimiento comparado para ninguna de las alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Artefacto sin validacion externa: 0 descargas y 0 likes, sin benchmarks publicados. No hay evidencia documentada de su tasa de exito ni de su robustez fuera del dataset de entrenamiento.
- Especializacion estrecha: el checkpoint esta ajustado a una unica tarea de simulacion (StackCube). No debe tratarse como una politica generalista.
- Nomenclatura no documentada: ni `mixed_30pct_100ep` ni `convex-0.2` se explican en la model card. Cualquier interpretacion sobre la composicion del dataset o los hiperparametros es una suposicion.
- Model card plantilla: el bloque de entrenamiento usa `--policy.type=act` en lugar de π₀, lo que indica que es la plantilla generica de LeRobot y no una guia especifica del checkpoint. No debe seguirse tal cual.
- Brecha sim-a-real: al proceder de un simulador, el rendimiento en un robot fisico puede degradarse de forma significativa por diferencias de iluminacion, textura, dinamica y calibracion.
- Idiomas y contexto: no se especifican idiomas soportados ni longitud de contexto, lo que impide garantizar el comportamiento ante instrucciones largas o en idiomas distintos del usado en el entrenamiento.
- Riesgo de alucinacion y de acciones erraticas: como toda politica aprendida por imitacion, puede generar trayectorias plausibles pero incorrectas ante observaciones fuera de la distribucion de entrenamiento. Requiere supervision y limites de seguridad en entornos fisicos.
- Licencia: Apache-2.0 permite uso comercial y modificacion, pero el usuario debe verificar las condiciones de los pesos base de π₀ y de los datos de ManiSkill utilizados, que la model card no detalla.
- Sin cuantizacion publicada: el despliegue en hardware limitado no esta cubierto por artefactos listos para usar.
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo: los enlaces obtenidos no guardan relacion con robotica ni con el checkpoint.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ImKyungjin/pi0-maniskill-stackcube-mixed-30pct-100ep-convex-0.2
- Blog oficial de π₀ (Physical Intelligence), citado en la model card: https://www.physicalintelligence.company/blog/pi0
- Repositorio OpenPI de Physical Intelligence, referenciado como origen de la implementacion: no disponible como URL en la informacion proporcionada
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de entrenamiento de politicas en LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio LeRobot en GitHub: https://github.com/huggingface/lerobot
- Dataset de entrenamiento: `local/maniskill_stackcube_mixed_30pct_100ep` (referencia local, sin URL publica en la informacion proporcionada)
- Resultados de la busqueda web: sin enlaces relevantes para este modelo
