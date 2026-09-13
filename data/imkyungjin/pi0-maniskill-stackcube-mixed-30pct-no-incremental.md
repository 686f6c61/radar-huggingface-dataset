# ImKyungjin/pi0-maniskill-stackcube-mixed-30pct-no-incremental

## Resumen

Este repositorio contiene un checkpoint del modelo π₀ (Pi0) entrenado con LeRobot sobre el conjunto de datos `local/maniskill_stackcube_mixed_30pct`, una variante de entrenamiento orientada a la tarea StackCube del simulador ManiSkill con un 30 por ciento de datos mixtos y sin entrenamiento incremental. El autor del repositorio es ImKyungjin y el artefacto se publica bajo licencia Apache 2.0 con pesos en formato safetensors. No es un modelo de lenguaje generalista: es una política visión-lenguaje-acción (VLA) que produce comandos motores para robots a partir de observaciones visuales e instrucciones en lenguaje natural.

La base es π₀, desarrollada por Physical Intelligence como modelo fundacional de control robótico generalista, y la implementación utilizada procede del repositorio abierto OpenPI y se ha ejecutado a través del stack LeRobot de Hugging Face. Con 3.501.372.176 parámetros totales (aproximadamente 3,5 mil millones) y un tamaño de repositorio de 7 GB, el checkpoint se sitúa en la gama de modelos VLA compactos, lo que permite inferencia en una única GPU de gama alta de consumo si se gestiona bien la memoria.

Su relevancia es acotada y específica: sirve como referencia reproducible para evaluar cómo se comporta una política π₀ fine-tuneada en una tarea concreta de manipulación (apilar cubos) en simulación, dentro del ecosistema LeRobot. El número de descargas y de "likes" registrados es 0, y no se han publicado métricas de rendimiento ni detalles del dataset de entrenamiento más allá de su identificador local, por lo que debe tratarse como un experimento de investigación y no como un artefacto listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀ (Pi0) de Physical Intelligence; detalle exacto de capas no disponible |
| Parametros totales | 3.501.372.176 (aproximadamente 3,5 mil millones) |
| Parametros activos | No aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en precision completa dentro de safetensors; el repo ocupa 7,0 GB) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Libreria de referencia | LeRobot |
| Pipeline | robotics |
| Tamano del repositorio | 7,0 GB |
| Fecha de creacion | 2026-09-13 |
| Ultima actualizacion | 2026-09-13 |

## Arquitectura y entrenamiento

El modelo pertenece a la familia π₀ (Pi0), presentada por Physical Intelligence como un modelo fundacional visión-lenguaje-acción para control robótico generalista. En la descripcion de la model card, el autor indica que la implementacion de LeRobot esta adaptada del repositorio de codigo abierto OpenPI de Physical Intelligence, y que el entrenamiento y la publicacion se han realizado con LeRobot. La model card no detalla la composicion interna de capas, el mecanismo de atencion ni el numero de tokens de entrenamiento, por lo que esos datos deben considerarse no disponibles en la informacion proporcionada. La documentacion publica de π₀ describe un esquema de flow matching sobre una columna vertebral vision-lenguaje para generar acciones continuas, pero la ficha no confirma variaciones concretas en este checkpoint.

Respecto a los datos, el identificador del dataset es `local/maniskill_stackcube_mixed_30pct`, lo que sugiere un conjunto local (no publicado en el Hub) centrado en la tarea StackCube de ManiSkill, con una mezcla del 30 por ciento de datos adicionales y sin entrenamiento incremental. No se especifica el numero de episodios, la composicion exacta de la mezcla, si hubo fases de RLHF/DPO (poco habituales en politicas roboticas) ni el numero total de tokens o frames vistos durante el entrenamiento. Tampoco se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal u otras) especificas de este checkpoint.

## Capacidades

- Control robótico de manipulacion: genera acciones motoras a partir de observaciones visuales e instrucciones en lenguaje natural, segun el proposito declarado de π₀ como politica generalista.
- Condicionamiento por lenguaje: la familia π₀ acepta instrucciones textuales como entrada, aunque este checkpoint no documenta el conjunto de idiomas soportados.
- Ejecucion en simulacion: entrenado sobre datos de ManiSkill, por lo que su dominio principal es la tarea StackCube en entorno simulado.
- Integracion en el ecosistema LeRobot: admite carga y evaluacion mediante las herramientas `lerobot-train` y `lerobot-record`.
- Inferencia como politica: se puede ejecutar con `lerobot-record` apuntando a `--policy.path` al checkpoint.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo "thinking", vision, audio): vision si, por su naturaleza VLA; resto no disponible.

## Casos de uso

- Investigacion en politicas VLA en simulacion: reproducir el entrenamiento y evaluar el checkpoint en ManiSkill StackCube para comparar variantes de mezcla de datos (por ejemplo, 30 por ciento mixto frente a otras proporciones) usando `lerobot-record` con `--episodes` controlado.
- Benchmark interno de pipelines LeRobot: usar el modelo como referencia para validar que la instalacion de LeRobot, el driver de GPU y el registro de episodios funcionan correctamente antes de escalar a otros experimentos.
- Estudio de generalizacion sim-a-real: dado que la politica se entrena en simulacion, sirve como punto de partida para analizar la transferencia de politicas π₀ a entornos reales, midiendo la degradacion en tareas de apilado.
- Comparacion de estrategias de fine-tuning: al estar etiquetado como "no incremental", permite contrastar el efecto de entrenar desde cero frente a esquemas incrementales sobre la misma tarea.
- Desarrollo de harness de evaluacion de robots: integrar el checkpoint en un banco de pruebas automatizado que mida exito por episodio, tiempo de ejecucion y estabilidad de la politica.
- Reproducibilidad academica: publicar resultados sobre una tarea concreta y un dataset local identificable, facilitando la verificacion por parte de otros grupos que dispongan de ManiSkill.
- Prototipado educativo: servir como ejemplo practico de como se entrena y despliega una politica VLA con LeRobot en un curso o taller de robotica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan aproximadamente 7 GB en el repositorio (coherente con almacenamiento en precision de 16 bits para 3,5 mil millones de parametros); hay que sumar memoria para activaciones y buffers de vision, por lo que se recomienda un minimo practico de 12-16 GB de VRAM en funcion del tamano de imagen y del lote.
- GPU recomendadas: tarjetas de 24 GB o mas, como RTX 4090, RTX 3090, A100 40 GB, L40S o H100, para trabajar con margen suficiente. En GPUs de 12 GB (RTX 3060 12 GB, RTX 4070) podria ser viable con precision reducida, aunque no esta confirmado por el autor.
- Cabe en GPU de consumo: si, previsiblemente en RTX 4090, RTX 4080 y RTX 3090, dado el tamano de 3,5B de parametros. En GPUs de 8 GB no es recomendable.
- Opciones de despliegue: LeRobot para entrenamiento, evaluacion e inferencia (`lerobot-train`, `lerobot-record`). No se documenta soporte en vLLM, llama.cpp, Ollama ni TGI, dado que es una politica de accion y no un modelo de generacion de texto.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi0-maniskill-stackcube-mixed-30pct-no-incremental (este) | 3,5B | no disponible | no disponible | Apache 2.0 | Hugging Face, 0 descargas |
| π₀ original (Physical Intelligence / OpenPI) | aproximadamente 3,3B (referencia publica) | no disponible en esta ficha | no disponible | segun repositorio OpenPI | OpenPI en GitHub y blog de Physical Intelligence |
| OpenVLA | aproximadamente 7B (referencia publica) | no disponible en esta ficha | no disponible | licencia publica del proyecto | repositorio abierto del proyecto |
| Politicas tipo ACT en LeRobot | tipicamente decenas de millones | no aplica | no disponible | Apache 2.0 en LeRobot | Hugging Face via LeRobot |

Nota: las cifras de modelos alternativos proceden de su documentacion publica general y no de la informacion proporcionada en esta ficha; no se dispone de comparaciones de rendimiento medidas sobre la misma tarea.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible; no se documenta analisis de sesgo para este checkpoint.
- Riesgo de alucinacion: en una politica VLA el riesgo se manifiesta como acciones incorrectas o inestables ante observaciones fuera de distribucion, mas que como texto inventado; no se cuantifica en la ficha.
- Limitaciones de contexto o idioma: la longitud de contexto y los idiomas soportados no estan documentados. El condicionamiento por lenguaje de la familia π₀ suele estar orientado al ingles, pero no se confirma aqui.
- Dominio restringido: el entrenamiento se realizo sobre un dataset local (`maniskill_stackcube_mixed_30pct`) en simulacion; su comportamiento fuera de la tarea StackCube o en robots reales no esta validado.
- Dataset no publico: al tratarse de una ruta `local/...`, otros usuarios no pueden reproducir el entrenamiento exacto sin acceso al conjunto de datos original.
- Ausencia de benchmarks: no hay metricas publicadas de exito, lo que impide estimar su rendimiento real frente a alternativas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar las licencias del modelo base π₀, del repositorio OpenPI y del propio framework LeRobot, asi como de los pesos derivados.
- Mantenimiento: el repositorio tiene 0 descargas y 0 "likes", y la ultima actualizacion coincide con la fecha de creacion; no hay indicios de mantenimiento posterior.
- Uso en produccion: no recomendado como politica final sin una evaluacion propia en el entorno objetivo, dado que es un artefacto de investigacion.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ImKyungjin/pi0-maniskill-stackcube-mixed-30pct-no-incremental
- Blog de Physical Intelligence sobre π₀: https://www.physicalintelligence.company/blog/pi0
- Repositorio OpenPI: no disponible en la informacion proporcionada (mencionado en la model card sin URL)
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de entrenamiento de LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio LeRobot en GitHub: https://github.com/huggingface/lerobot
- Dataset `local/maniskill_stackcube_mixed_30pct`: no disponible publicamente (referencia local del autor)
