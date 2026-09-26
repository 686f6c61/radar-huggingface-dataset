# leoliu49/smolvla-grasp-p2h1-notactile-s1

## Resumen

`leoliu49/smolvla-grasp-p2h1-notactile-s1` es un ajuste fino (finetune) del modelo base `lerobot/smolvla_base`, un modelo de visión-lenguaje-acción (VLA) compacto integrado en el ecosistema LeRobot de Hugging Face. El autor del repositorio es el usuario `leoliu49` y el modelo se distribuye con licencia Apache 2.0 bajo la etiqueta de pipeline `robotics`. No es un modelo de lenguaje generativo al uso: su salida son acciones de control para un brazo robótico, condicionadas por observaciones visuales y una instrucción en lenguaje natural.

El dato más relevante es su tamaño: 450.046.176 parámetros reales según los pesos en safetensors, con un repositorio de 0,9 GB, coherente con pesos almacenados en 16 bits. Ese orden de magnitud lo sitúa en la categoría de políticas robóticas desplegables en hardware de consumo, frente a alternativas VLA de miles de millones de parámetros que requieren GPUs de centro de datos. El ajuste se ha realizado sobre el dataset `leoliu49/grasp_p2h1`, cuyo nombre sugiere una tarea de agarre (grasp) sin entrada táctil y con una semilla de entrenamiento concreta (s1), aunque la model card no detalla la composición ni el tamaño de dicho dataset.

La relevancia de esta ficha es doble. Por un lado, ilustra el flujo de trabajo de LeRobot para entrenar y evaluar políticas robóticas con comandos como `lerobot-train` y `lerobot-record`. Por otro, conviene señalar que el repositorio no presenta métricas de evaluación, no tiene descargas ni likes en el momento de la consulta y no documenta la tarea exacta más allá del nombre del dataset, por lo que debe tratarse como un artefacto experimental de investigación más que como un componente listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Visión-lenguaje-acción (VLA); detalles internos no disponibles |
| Parametros totales | 450.046.176 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repositorio solo incluye pesos en safetensors; no se listan variantes cuantizadas) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Biblioteca | lerobot |
| Pipeline | robotics |
| Modelo base | lerobot/smolvla_base |
| Dataset de ajuste | leoliu49/grasp_p2h1 |
| Tamano del repositorio | 0,9 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 25 de septiembre de 2026 |
| Fecha de actualizacion | 25 de septiembre de 2026 |

## Arquitectura y entrenamiento

El modelo pertenece a la familia SmolVLA, descrita en el paper arXiv:2506.01844, y se presenta como un modelo de visión-lenguaje-acción compacto y eficiente, capaz de alcanzar rendimiento competitivo con un coste computacional reducido y de desplegarse en hardware de consumo. La model card no especifica el backbone visual, el mecanismo de generación de acciones, el número de capas ni la composición del dataset de ajuste, por lo que esos detalles figuran como no disponibles.

En cuanto al entrenamiento, se trata de un ajuste fino supervisado del checkpoint `lerobot/smolvla_base` sobre el dataset `leoliu49/grasp_p2h1`, gestionado mediante la librería LeRobot. La model card no documenta el número de episodios, el número de tokens o pasos de entrenamiento, la resolución de las cámaras utilizadas, ni si se aplicaron técnicas de RLHF, DPO u otras optimizaciones posteriores. Tampoco se indica el tipo de robot empleado durante la recogida de datos, aunque la sección de evaluación del propio template de LeRobot hace referencia al seguidor `so100_follower` como ejemplo habitual.

## Capacidades

- Generación de acciones de control robótico: el modelo transforma observaciones visuales, el estado del robot y una instrucción en lenguaje natural en comandos de actuación de bajo nivel.
- Percepción visual: consume imágenes de cámara como entrada principal, de acuerdo con la definición de modelo VLA que recoge la model card.
- Seguimiento de instrucciones en lenguaje natural: al estar basado en un modelo de visión-lenguaje, se espera que acepte comandos textuales que describan la tarea, aunque no se documenta qué idiomas soporta.
- Ejecución de una tarea de agarre específica: según el nombre del dataset de ajuste (`grasp_p2h1`), la política está especializada en tareas de prensión.
- Funcionamiento sin señal táctil: el sufijo `notactile` del nombre indica que la política no utiliza sensores táctiles como entrada.
- Integración con el ecosistema LeRobot: carga, entrenamiento y evaluación mediante las herramientas oficiales de la librería.
- Soporte de tool calling / function calling: no disponible; no es una capacidad propia de un modelo de política robótica.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo de razonamiento (thinking mode), audio u otras modalidades especiales: no disponible.

## Casos de uso

- Manipulación robótica de laboratorio: dado que el ajuste se realizó sobre un dataset de agarre, el uso natural es reproducir la tarea de prensión aprendida en un brazo compatible, evaluando la política con `lerobot-record` sobre el robot físico.
- Punto de partida para nuevos ajustes: al ser un finetune de `lerobot/smolvla_base` con licencia Apache 2.0, sirve como inicialización para entrenar variantes sobre otros datasets de agarre sin partir de cero.
- Evaluación comparativa de configuraciones: el sufijo `s1` del repositorio apunta a una ejecución con semilla concreta, lo que lo hace útil como miembro de una familia de experimentos para medir varianza entre semillas.
- Investigación en políticas sin entrada táctil: permite estudiar hasta qué punto una política puramente visual puede resolver tareas de agarre, comparándola con variantes que sí incorporan sensores táctiles.
- Despliegue en hardware de consumo para prototipado: con 450 millones de parámetros, la política puede cargarse en GPUs de gama media, lo que facilita ciclos de prueba en laboratorios con presupuesto limitado.
- Generación de datos sintéticos o aumento de dataset: ejecutando la política en simulación o en el robot se pueden recolectar episodios adicionales mediante `lerobot-record` para ampliar `grasp_p2h1`.
- Docencia y formación en robótica con IA: el flujo completo de LeRobot (entrenar, registrar, evaluar) es replicable con este tipo de checkpoint en un curso práctico de aprendizaje por imitación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de éxito por tarea, tasas de agarre, comparaciones con otras políticas ni métricas de simulación. La model card únicamente reproduce el texto genérico de SmolVLA sobre eficiencia computacional, sin cifras asociadas a este ajuste concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 1 y 2 GB de pesos en precisión de 16 bits (los 0,9 GB del repositorio son coherentes con 450 millones de parámetros a 2 bytes por parámetro); en fp32 ascendería a unos 1,8 GB. Sumando búferes de imagen y activaciones, un presupuesto práctico de 2 a 4 GB de VRAM es razonable, aunque no se dispone de mediciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de memoria, incluidas NVIDIA RTX 3060, RTX 4060, RTX 4090, así como A100 o H100 si se requiere paralelizar múltiples entornos de evaluación. El tamaño del modelo no exige aceleradores de centro de datos.
- Compatibilidad con GPU de consumo: sí, es uno de los objetivos declarados de la familia SmolVLA (rendimiento competitivo a coste reducido y despliegue en hardware de consumo).
- Opciones de despliegue: LeRobot (comandos `lerobot-train`, `lerobot-record` con `--policy.path`), PyTorch como backend, y ejecución en CPU o CUDA mediante `--policy.device`. Servidores de inferencia de texto como vLLM, TGI u Ollama no son aplicables a una política robótica de este tipo. No se documenta compatibilidad con llama.cpp ni variantes GGUF.
- Latencia y throughput: no disponibles. No se han publicado mediciones de frecuencia de control ni de tiempo de inferencia por paso para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Relacion con este modelo |
|---|---|---|---|---|---|
| leoliu49/smolvla-grasp-p2h1-notactile-s1 | 450.046.176 | No disponible | Apache 2.0 | Repositorio publico en Hugging Face, 0 descargas | Ajuste fino especializado en agarre sin tacto |
| lerobot/smolvla_base | No disponible en la informacion proporcionada | No disponible | No disponible en la informacion proporcionada | Modelo base publicado por LeRobot | Modelo base sobre el que se realizo el ajuste |
| Otras politicas VLA de gran tamano (OpenVLA, pi0, RT-1) | No disponible en la informacion proporcionada | No disponible | No disponible | No disponible | Alternativas de la misma categoria funcional |

No se dispone de datos comparativos de rendimiento entre este checkpoint y otras políticas robóticas en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Ausencia total de evaluacion: el repositorio no publica tasas de exito, curvas de aprendizaje ni comparaciones, lo que impide verificar que la politica funcione correctamente incluso en la tarea para la que fue entrenada.
- Especializacion estrecha: se trata de un ajuste sobre un unico dataset de agarre (`grasp_p2h1`), por lo que no debe esperarse generalizacion a otras tareas, objetos o entornos fuera de la distribucion de entrenamiento.
- Dependencia de la configuracion de camaras y del robot: las politicas de aprendizaje por imitacion son sensibles a la posicion de las camaras, la iluminacion y la morfologia del brazo usados durante la recogida de datos; cambiar cualquiera de estos factores degrada el rendimiento.
- Sin senal tactil: el nombre del repositorio indica explicitamente que la politica no consume entrada tactil, de modo que tareas que requieran detectar fuerza de agarre o deslizamiento quedan fuera de su alcance.
- Riesgo de alucinacion en el sentido de acciones inseguras: como toda politica robótica aprendida, puede generar trayectorias erráticas o colisiones ante observaciones fuera de distribucion; se requiere parada de emergencia y limites de par en el controlador.
- Sesgos de datos: no se documenta la composicion del dataset `grasp_p2h1` (variedad de objetos, materiales, condiciones de iluminacion, operadores), por lo que no es posible evaluar sesgos de generalizacion.
- Idiomas no documentados: se desconoce si las instrucciones en lenguaje natural deben formularse en ingles, castellano u otro idioma.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial y modificacion, siempre que se conserve el aviso de copyright y se indiquen los cambios; no obstante, el autor no ofrece garantias sobre el comportamiento del modelo.
- Madurez del artefacto: cero descargas y cero likes en el momento de la consulta, sin documentacion de la tarea, sin versionado de dataset publicado en la model card mas alla de la referencia, lo que lo sitúa en fase experimental.
- Ausencia de informacion sobre cuantizacion: no se ofrecen variantes GGUF, int8 o int4, de modo que cualquier optimizacion de memoria debe realizarla el usuario por su cuenta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/leoliu49/smolvla-grasp-p2h1-notactile-s1
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de ajuste: https://huggingface.co/datasets/leoliu49/grasp_p2h1
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Paper de SmolVLA en arXiv: https://arxiv.org/abs/2506.01844
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de entrenamiento de politicas de imitacion: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
