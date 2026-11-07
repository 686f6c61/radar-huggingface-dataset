# pmolodyk/vla_ar

## Resumen

vla_ar es un adaptador LoRA publicado por el usuario pmolodyk sobre el modelo base lerobot/FineART-VLA-subtask-midtrained, un modelo de visión-lenguaje-acción (VLA) orientado a robótica. No se trata de un modelo completo, sino de un conjunto de pesos de ajuste fino que se cargan sobre el checkpoint base fijado en una revisión concreta, junto con los procesadores y tokenizadores necesarios para reconstruir el pipeline de inferencia.

El adaptador está diseñado para el ecosistema LeRobot de Hugging Face y se distribuye con un script `load_policy` que restaura automáticamente el adaptador, sus procesadores y tokenizadores sobre el modelo base. El modelo resuelve el problema de la planificación jerárquica en robótica: dado un estado articular de 14 dimensiones y tres vistas RGB (cámara alta, muñeca izquierda y muñeca derecha), genera primero un subtask en lenguaje natural y después una secuencia de 50 acciones absolutas de 14 dimensiones.

La relevancia de esta ficha es limitada: el repositorio tiene 0 descargas y 0 likes, el tamaño del repo es de 0.0 GB (lo que sugiere que los pesos pueden no estar materializados o son extremadamente pequeños) y la información pública disponible es escasa. Se documenta aquí lo que el autor declara explícitamente en la model card, sin extrapolaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre un modelo VLA (vision-lenguaje-accion) base; el modelo base es FineART-VLA-subtask-midtrained, de arquitectura no detallada en la informacion disponible |
| Parametros totales | no disponible (el tamano del repo es 0.0 GB; no se declara el numero de parametros del adaptador ni del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | gemma (terminos heredados del modelo base Gemma; ver LICENSE y NOTICE en el repo) |
| Formato de pesos | safetensors (adaptador PEFT); el modelo base se descarga en el formato del checkpoint lerobot/FineART-VLA-subtask-midtrained |

## Arquitectura y entrenamiento

El adaptador se implementa con PEFT (LoRA) sobre el modelo lerobot/FineART-VLA-subtask-midtrained, fijado en la revision `b6cf4faf2630f971dd390bc32365e9d9c330da8e`. La arquitectura del modelo base no se detalla en la informacion proporcionada; por el nombre y el pipeline (`robotics`, `fineart-vla`) se trata de un modelo de vision-lenguaje-accion con capacidad de planificacion de subtareas y generacion de acciones. El loader fue verificado con LeRobot en el commit `72e1d9e5e76ee719bacfc78bc34d817bee5fb521`, Transformers 5.5.4 y PEFT 0.21.2, con Python 3.12 y PyTorch con soporte CUDA.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. La unica innovacion tecnica documentada es el flujo de dos etapas: una llamada de planificacion (`select_message` con `QUERY_KIND: "next_subtask"`) que produce un subtask en lenguaje natural con un maximo de 48 tokens nuevos y supresion de tokens de localizacion, seguida de una llamada de bajo nivel (`predict_action_chunk`) que genera un chunk de 50 acciones absolutas de 14 dimensiones.

## Capacidades

- Generacion de subtareas en lenguaje natural a partir de observaciones multimodales (estado articular de 14 dimensiones y tres imagenes RGB).
- Generacion de chunks de acciones roboticas: `[1, 50, 14]` objetivos absolutos de accion.
- Procesamiento multimodal con tres camaras: `cam_high`, `cam_left_wrist` y `cam_right_wrist`, con tensores float32 en rango `[0, 1]`.
- Planificacion jerarquica: separacion explicita entre etapa de planner (subtarea) y etapa de control de bajo nivel.
- Soporte de instrucciones de tarea en lenguaje natural (`task`) y de subtareas suministradas externamente (se puede omitir el planner).
- Integracion con el ecosistema LeRobot mediante `load_policy`, que restaura adaptador, procesadores y tokenizadores.
- Capacidades multilingues: solo ingles declarado.
- No se documentan capacidades de tool calling, agentes genericos, vision general, audio ni modo thinking.

## Casos de uso

- Manipulacion robotica de dos brazos con planificacion de subtareas: el modelo recibe el estado de 14 articulaciones y tres vistas y genera primero un subtask ("Place the object in the container.") y despues 50 acciones absolutas, adecuado para tareas de pick-and-place en entornos de laboratorio.
- Investigacion en aprendizaje por imitacion con LeRobot: el adaptador LoRA permite ajustar el modelo base con recursos reducidos y comparar el efecto del fine-tuning sobre el checkpoint midtrained sin reentrenar el modelo completo.
- Evaluacion de politicas VLA en simulacion: el chunk de 50 acciones y 14 dimensiones encaja con entornos tipo ALOHA o bimanuales, permitiendo ejecutar rollouts con el pipeline documentado.
- Control de bajo nivel con subtarea suministrada: en produccion se puede omitir el planner y alimentar una subtarea fija o generada por otro sistema, reduciendo latencia al evitar la generacion de texto.
- Prototipado de interfaces de instruccion en lenguaje natural para robots: la separacion entre planner y controlador facilita sustituir el planner por un LLM externo y mantener el controlador de acciones.
- Reproducibilidad de experimentos: el loader fija la revision exacta del modelo base y las versiones de Transformers y PEFT, lo que permite reproducir el entorno de inferencia en laboratorios con Python 3.12 y CUDA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. No se declara el tamano del modelo base ni del adaptador, por lo que no es posible estimar la VRAM con rigor.
- GPU recomendadas: no disponible. El loader se verifico con `device="cuda"`, lo que implica una GPU NVIDIA con CUDA, pero no se especifica modelo concreto.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: LeRobot con soporte `fineart_vla` y `peft` (commit `72e1d9e5e76ee719bacfc78bc34d817bee5fb521`), Transformers 5.5.4, PEFT 0.21.2 y Python 3.12. No se documentan vLLM, llama.cpp, Ollama ni TGI para este modelo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones del modelo base que permitan una comparacion rigurosa con alternativas de la misma categoria.

## Limitaciones y advertencias

- El repositorio tiene 0 descargas y 0 likes, y un tamano de 0.0 GB; no hay evidencia publica de validacion por terceros.
- El adaptador depende de una revision exacta del modelo base (`b6cf4faf2630f971dd390bc32365e9d9c330da8e`); usar otra revision puede romper la carga.
- Las versiones de dependencias estan fijadas (Transformers 5.5.4, PEFT 0.21.2, commit concreto de LeRobot); desviarse de ellas no esta garantizado.
- Idioma limitado al ingles; no se declara soporte de castellano ni de otros idiomas.
- Licencia `gemma`: los terminos heredados del modelo base Gemma aplican y pueden restringir el uso comercial; es necesario revisar LICENSE y NOTICE del repositorio.
- No se documentan sesgos conocidos ni tasas de alucinacion; al ser un modelo de accion, el riesgo principal es la generacion de subtareas o acciones incorrectas en entornos reales.
- No hay informacion sobre el dataset de entrenamiento, lo que impide evaluar la cobertura de tareas y la generalizacion.
- No se declaran benchmarks ni metricas de exito en tareas roboticas.
- El uso en robots reales requiere validacion de seguridad independiente; el modelo no incorpora salvaguardas documentadas para limites articulares o colisiones.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/pmolodyk/vla_ar
- Modelo base: https://huggingface.co/lerobot/FineART-VLA-subtask-midtrained
- LeRobot (repositorio): https://github.com/huggingface/lerobot
- PEFT: https://github.com/huggingface/peft
- No se han encontrado papers, blogs, demos ni repositorios adicionales en la informacion disponible.
