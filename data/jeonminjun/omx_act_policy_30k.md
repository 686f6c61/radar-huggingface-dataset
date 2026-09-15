# Jeonminjun/omx_act_policy_30k

## Resumen

omx_act_policy_30k es una política robótica de imitación publicada por el usuario Jeonminjun en Hugging Face, entrenada con la librería LeRobot sobre el dataset Jeonminjun/pick_and_place3 y etiquetada con el pipeline `robotics`. No se trata de un modelo de lenguaje: implementa ACT (Action Chunking with Transformers), un método de aprendizaje por imitación que, en lugar de predecir una única acción por paso, predice trozos (chunks) de acciones futuras a partir de observaciones visuales y del estado del robot.

El repositorio contiene pesos en formato safetensors con 51.668.614 parámetros (unos 51,7 millones) y ocupa 0,2 GB, lo que lo sitúa en la categoría de políticas ligeras capaces de ejecutarse en hardware de consumo. La licencia es Apache-2.0, lo que permite uso comercial sin restricciones adicionales por parte del autor de los pesos.

Su relevancia es acotada pero concreta: sirve como ejemplo reproducible de un pipeline completo de LeRobot (entrenamiento con `lerobot-train` y evaluación con `lerobot-record`) para tareas de pick and place. En el momento de redactar esta ficha el modelo acumula 0 descargas y 0 likes, y no incluye resultados de evaluación ni detalles sobre el robot objetivo, por lo que debe considerarse un checkpoint sin validación pública.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), política de aprendizaje por imitación basada en transformer; no es un modelo de lenguaje |
| Parametros totales | 51.668.614 (recuento real de los safetensors del repositorio) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; ACT predice chunks de acciones de longitud fija, valor no especificado en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible (el repositorio solo distribuye pesos en safetensors; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica / no disponible (modelo de robotica; no procesa lenguaje natural) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Pipeline | robotics |
| Dataset de entrenamiento | Jeonminjun/pick_and_place3 |
| Tamano del repositorio | 0,2 GB |
| Descargas / likes | 0 / 0 |
| Fecha de publicacion en el Hub | 2026-09-15 (segun metadatos de Hugging Face) |

## Arquitectura y entrenamiento

ACT se describe en el paper "Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware" (arXiv:2304.13705), referenciado en la model card. El método combina un codificador visual con un transformer de tipo encoder-decoder que genera chunks de acciones en lugar de pasos individuales; esta formulación reduce el horizonte efectivo de decisión y mitiga el problema de acumulación de errores típico del behavior cloning paso a paso. La model card no aporta detalles específicos sobre el backbone visual concreto, el número de capas, la dimensión del chunk de acciones, la resolución de las cámaras ni el número de observaciones utilizadas.

El entrenamiento se realizó con LeRobot sobre el dataset Jeonminjun/pick_and_place3, presumiblemente a partir de demostraciones de teleoperación, dado que ACT es un método de aprendizaje por imitación. El identificador del modelo contiene el sufijo "30k", que sugiere 30.000 pasos de entrenamiento, aunque este dato no está confirmado en la información proporcionada. No se documentan fases de RLHF, DPO ni ajuste con preferencias humanas, algo por otra parte poco habitual en políticas de manipulación. Tampoco se especifica el robot empleado ni la composición del dataset (número de episodios, tareas incluidas, variabilidad de objetos o iluminación).

## Capacidades

- Generacion de acciones de manipulacion: predice chunks de acciones (posiciones articulares o del efector final) a partir de observaciones visuales y del estado del robot.
- Aprendizaje por imitacion: reproduce comportamientos aprendidos de demostraciones teleoperadas, no instrucciones en lenguaje natural.
- Ejecucion de tareas de pick and place: el dataset asociado se denomina pick_and_place3, lo que apunta a tareas de recoger y colocar objetos.
- Integracion con el ecosistema LeRobot: carga directa mediante `--policy.path` en los scripts `lerobot-record` y flujos equivalentes.
- Soporte de tool calling / function calling: no aplica, no es un modelo de lenguaje.
- Soporte de agentes y razonamiento multi-paso: no aplica en el sentido de agentes basados en lenguaje; el razonamiento se limita al horizonte del chunk de acciones.
- Capacidades multilingues: no aplica.
- Capacidades especiales (modo thinking, vision, audio): dispone de entrada visual por tratarse de una política visomotora, pero no se documentan modos de razonamiento explícito ni procesamiento de audio.

## Casos de uso

- Automatizacion de pick and place en laboratorio: el modelo puede desplegarse sobre un brazo robotico de bajo coste para recoger y colocar objetos, siguiendo el flujo `lerobot-record --policy.path=...` descrito en la model card; es adecuado porque ACT esta disenado precisamente para tareas de manipulacion fina con hardware economico.
- Punto de partida para fine-tuning: al ser un checkpoint ACT de 51,7 M de parametros y 0,2 GB, puede usarse como inicializacion en `lerobot-train` sobre un dataset propio, reduciendo el coste frente a entrenar desde cero.
- Docencia y cursos de robotica: sirve como ejemplo minimo y reproducible del ciclo completo de LeRobot (entrenamiento, publicacion en el Hub y evaluacion con `lerobot-record`).
- Prototipado rapido en investigacion de imitacion: permite comparar variantes de ACT (distintos datasets, numero de pasos, configuraciones de camara) con un coste de entrenamiento bajo.
- Validacion de pipelines de datos de teleoperacion: al estar vinculado a un dataset concreto (Jeonminjun/pick_and_place3), facilita comprobar que la captura de demostraciones y el formateo LeRobot son correctos antes de escalar a datasets mayores.
- Despliegue en robot de bajo coste tipo SO-100: la model card incluye un ejemplo de evaluacion con `so100_follower`, de modo que el modelo puede probarse en esa plataforma si la configuracion de acciones y observaciones coincide con la del entrenamiento.
- Benchmark interno de politicas: puede actuar como linea base ligera frente a politicas mas pesadas (por ejemplo, Diffusion Policy) en pruebas de exito por episodio dentro de un mismo entorno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de exito, numero de episodios de evaluacion ni comparaciones cuantitativas con otras politicas, y el repositorio registra 0 descargas y 0 likes, por lo que tampoco existen evaluaciones de terceros.

## Requisitos de hardware

- VRAM estimada para inferencia: calculo derivado del recuento de parametros, no publicado por el autor. En fp32, 51.668.614 x 4 bytes = aproximadamente 207 MB de pesos; en fp16/bf16, unos 103 MB. Sumando activaciones, buffers de vision y overhead del runtime, es razonable esperar un consumo total por debajo de 1-2 GB, aunque esta cifra es una estimacion y no un dato medido.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM deberia ser suficiente (GTX 1650, RTX 3050, RTX 4090, A100, H100). Para el entrenamiento desde cero conviene una GPU con mas memoria (RTX 3090/4090 o superiores), en funcion del tamano de lote y del dataset.
- Cabe en GPU de consumo: si, con margen amplio, dado el tamano del modelo. Tambien es viable la inferencia en CPU para pruebas de baja frecuencia, aunque no se documentan latencias.
- Opciones de despliegue: LeRobot (`lerobot-train`, `lerobot-record`) sobre PyTorch es la via oficial documentada. vLLM, llama.cpp, Ollama y TGI no aplican, ya que estan orientados a modelos de lenguaje y no a politicas de robotica.
- Latencia y throughput: no disponible. ACT esta disenado para control en tiempo real en el paper original, pero no se aportan mediciones de frecuencia de control, latencia por chunk ni rendimiento en hardware concreto para este checkpoint.

## Comparativa con modelos similares

| Modelo | Categoria | Parametros | Contexto / observaciones | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| omx_act_policy_30k (este modelo) | Politica ACT entrenada con LeRobot | 51.668.614 | no disponible (entrada visomotora; chunk de acciones no especificado) | apache-2.0 | Hugging Face, 0 descargas |
| ACT (implementacion de referencia del paper 2304.13705) | Politica de imitacion | no disponible | no disponible | no disponible en la informacion proporcionada | Codigo publicado por los autores del paper |
| Diffusion Policy (familia disponible en LeRobot) | Politica de imitacion basada en difusion | no disponible | no disponible | no disponible en la informacion proporcionada | Integrada en el ecosistema LeRobot |
| SmolVLA (familia de politicas VLA de LeRobot) | Politica vision-lenguaje-accion | no disponible | no disponible | no disponible en la informacion proporcionada | Integrada en el ecosistema LeRobot |

No se dispone de cifras de rendimiento comparadas para ninguno de los modelos de la tabla, por lo que la comparacion se limita a categoria, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo sin validacion publica: 0 descargas y 0 likes en el momento de redactar la ficha; no hay evaluaciones independientes ni tasas de exito reportadas.
- No es un modelo de lenguaje: no genera texto, no responde a instrucciones en lenguaje natural y no admite tecnicas de prompting.
- Sesgos y sobreajuste al entorno: al entrenarse sobre un unico dataset (Jeonminjun/pick_and_place3), es probable que el rendimiento se degrade ante cambios de iluminacion, posicion de camara, objetos o fondo distintos de los de las demostraciones. No se documenta ninguna evaluacion de generalizacion.
- Brecha simulacion-realidad: no se indica si los datos son reales o simulados, ni el robot utilizado, lo que dificulta anticipar el comportamiento en un montaje fisico diferente.
- Dependencia de la configuracion de observaciones y acciones: para reutilizar el checkpoint es imprescindible que la morfologia del robot, el espacio de acciones y las camaras coincidan con los del entrenamiento; de lo contrario, el modelo no funcionara sin reentrenamiento.
- Contexto y capacidades limitadas por diseno: ACT opera sobre un chunk de acciones de horizonte corto, sin memoria de largo plazo ni planificacion simbolica.
- Cuantizacion no documentada: no se ofrecen variantes GGUF, int8 ni int4, ni se confirma el tipo de dato de los pesos mas alla del formato safetensors.
- Restricciones de licencia: los pesos se publican bajo Apache-2.0, lo que permite uso comercial; conviene revisar por separado la licencia del dataset Jeonminjun/pick_and_place3 y de las dependencias de LeRobot antes de un despliegue en produccion.
- Ausencia de informacion sobre seguridad: no se documentan limites de fuerza, paradas de emergencia ni comportamientos ante fallos, aspectos criticos en cualquier despliegue fisico real.
- Fecha de publicacion inusual: los metadatos indican 2026-09-15, posterior a la fecha habitual de publicacion de modelos ACT en el Hub; conviene verificar la autenticidad y vigencia del repositorio antes de confiar en el.

## Enlaces

- Hugging Face (modelo): https://huggingface.co/Jeonminjun/omx_act_policy_30k
- Dataset asociado: https://huggingface.co/datasets/Jeonminjun/pick_and_place3
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de entrenamiento de politicas de imitacion: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Resultados de busqueda web: no se ha encontrado ningun enlace relevante sobre este modelo; los resultados devueltos (lectores de PDF, entidades bancarias y articulos musicales) no guardan relacion con la robotica ni con LeRobot.
