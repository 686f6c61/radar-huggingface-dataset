# ivelin/zk0-smolvla-fl

## Resumen

zk0-smolvla-fl es un checkpoint de SmolVLA afinado mediante aprendizaje federado sobre un conjunto heterogeneo de doce datasets de robotica SO-100/SO-101 alojados en Hugging Face. Lo publica el usuario ivelin dentro del proyecto zk0, y parte del modelo base lerobot/smolvla_base de Hugging Face. SmolVLA es una politica vision-language-action (VLA) compacta pensada para control de manipuladores de bajo coste, y este checkpoint demuestra el uso del framework Flower para agregar entrenamiento distribuido entre contribuyentes sin centralizar los datos.

El modelo resuelve el problema de consolidar conocimiento de multiples tareas de manipulacion (pick-and-place, clasificacion de utensilios, tareas condicionales) en un unico conjunto de pesos sin que los datasets salgan de las maquinas de sus propietarios. Con 450 millones de parametros, es lo bastante pequeno para inferencia en GPU de consumo, lo que lo hace atractivo para laboratorios con robots SO-100/SO-101 y hardware modesto.

Es relevante ahora porque ejemplifica una via practica de entrenamiento colaborativo en robotica: pesos bajo Apache-2.0, datos retenidos por sus duenos y un pipeline reproducible con LeRobot. No obstante, el propio registro de entrenamiento muestra solo una ronda federada y metricas de cliente vacias, por lo que debe tratarse como una prueba de concepto mas que como un modelo de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (SmolVLA, basada en transformer; detalles internos no disponibles) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/AWQ) |
| Idiomas soportados | en (instrucciones en ingles) |
| Licencia | Apache-2.0 (solo pesos; datasets con licencias propias) |
| Formato de pesos | safetensors (model.safetensors) |

## Arquitectura y entrenamiento

El checkpoint parte de lerobot/smolvla_base, una politica VLA que combina un codificador visual, un modelo de lenguaje y un decodificador de acciones para generar comandos motores a partir de observaciones e instrucciones en lenguaje natural. La informacion disponible no detalla la composicion interna (capas, atencion, tokenizador de acciones), por lo que esos extremos quedan como no disponibles.

El entrenamiento se realizo con aprendizaje federado mediante el framework Flower: una ronda de servidor, dos epocas locales, mu proximal de 0.01, learning rate inicial de 1e-4, batch de 16, fraccion fit y evaluate de 1, evaluacion cada ronda con 4 batches y scheduler cosine warm restarts con decaimiento dinamico y LR/mu adaptativos. Se usaron doce datasets de entrenamiento (once listados en el README, uno de ellos ya desaparecido del Hub) y uno de evaluacion (Hupy440/Two_Cubes_and_Two_Buckets_v2). Las metricas finales reportan una perdida compuesta de evaluacion de 0,154, pero las metricas agregadas por cliente estan vacias y la participacion media es de 0,0 clientes por ronda, lo que sugiere que el registro de metricas federadas no se completo correctamente.

## Capacidades

- Generacion de acciones de manipulacion robotica a partir de instrucciones en ingles y observaciones visuales, en el formato de politica LeRobot.
- Ejecucion de tareas pick-and-place sobre objetos cotidianos (cubos, boligrafos, LEGO, peluches, tazas).
- Tareas de clasificacion y colocacion en contenedores designados (utensilios en organizador, cubos por color en cubos).
- Tareas condicionales simples, como elegir el recipiente segun el color del cubo.
- Tareas secuenciales de grasping y deposito en un mismo episodio.
- Integracion con el ecosistema LeRobot mediante `SmolVLAPolicy.from_pretrained` y los pre/post-procesadores estandar.
- Soporte de tool calling, agentes multi-paso o modos de razonamiento explicito: no disponible en la informacion proporcionada.
- Capacidades multilingues: solo ingles segun la metadata.

## Casos de uso

- Manipulacion pick-and-place en laboratorio: cargar la politica con LeRobot y ejecutarla sobre un SO-100/SO-101 para mover cubos, boligrafos o LEGO entre posiciones; el modelo esta afinado especificamente en estas tareas y el tamano de 450 M permite iterar rapido en una sola GPU.
- Clasificacion de objetos en contenedores: usar la tarea de utensilios del dataset de sebastiandavidlee para depositar cada pieza en su ranura; el checkpoint ha visto esa instruccion y puede servir de base para afinado posterior.
- Tareas condicionales por atributo: emplear el dataset de evaluacion de dos cubos y dos cubos de colores para probar politicas que seleccionan recipiente segun el color observado.
- Investigacion en aprendizaje federado: reutilizar el checkpoint como punto de partida para experimentos con Flower, comparando rondas y estrategias de agregacion sobre los mismos datasets publicos.
- Prototipado de pipelines VLA: integrar la politica en un bucle de control con camaras y robot real para validar latencia y robustez antes de invertir en entrenamiento propio.
- Benchmark de generalizacion entre dominios: evaluar como se comporta un modelo entrenado con datos de multiples contribuyentes en una tarea no vista, midiendo la degradacion respecto al modelo base.
- Base para afinado con datos propios: partir de este checkpoint en lugar de smolvla_base cuando el dominio objetivo sea manipulacion de escritorio con SO-100/SO-101.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato numerico es la perdida compuesta de evaluacion (0,15414857491850853) sobre el dataset Hupy440/Two_Cubes_and_Two_Buckets_v2, sin comparativa con otros modelos ni desglose por tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, unos 1,8 GB solo para pesos; en bf16/fp16, unos 0,9 GB; con overhead de activaciones y vision, es razonable reservar 4-6 GB.
- GPU recomendadas: RTX 3090, RTX 4090, L4, A10G, A100 o H100 para entrenamiento o evaluacion por lotes; cualquier GPU con 6-8 GB o mas deberia bastar para inferencia en fp16.
- Cabe en GPU de consumo: si, previsiblemente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores; en GPUs de 8 GB puede requerir precision reducida o batch 1.
- Opciones de despliegue: LeRobot con el extra `smolvla`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que ademas no aplican a una politica de acciones.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ivelin/zk0-smolvla-fl | 450 M | no disponible | VLA para SO-100/SO-101 | Apache-2.0 | Hugging Face, 39 descargas |
| lerobot/smolvla_base | no disponible en la informacion | no disponible | VLA base | Apache-2.0 | Hugging Face (modelo base) |
| Otras politicas VLA de robotica | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita al modelo base porque la informacion proporcionada no incluye datos de alternativas como OpenVLA, pi0 o RT-2. Cualquier comparacion cuantitativa con ellas quedaria fuera de lo verificable.

## Limitaciones y advertencias

- Entrenamiento federado incompleto: una sola ronda de servidor y metricas de cliente vacias; el checkpoint no demuestra convergencia federada real.
- Un dataset de entrenamiento (KeisukeSato1024/so101_pp_green_box) ya no esta disponible en el Hub y su licencia no pudo verificarse.
- Otro dataset (olingoudey/so101_stationary_mug445) no declara licencia, lo que introduce incertidumbre legal sobre el uso comercial del checkpoint derivado.
- Las licencias de los datasets son metadatos declarados por los uploaders y no han sido verificadas de forma independiente.
- Solo soporta instrucciones en ingles; no hay evidencia de capacidades multilingues.
- Riesgo de sobreajuste a los dominios concretos de los doce datasets: objetos, colores, camaras y configuraciones especificas de SO-100/SO-101.
- Riesgo de alucinacion de acciones o de instrucciones fuera de distribucion en tareas no vistas; no hay evaluacion publica de robustez.
- El repo ocupa 115 GB, muy superior al tamano de los pesos, lo que sugiere artefactos adicionales y complica la descarga y el versionado.
- Uso comercial permitido por la licencia Apache-2.0 de los pesos, pero condicionado por la situacion legal de los datasets de entrenamiento.
- No hay benchmarks publicos ni comparativas con otras politicas VLA en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ivelin/zk0-smolvla-fl
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Repositorio del proyecto zk0: https://github.com/ivelin/zk0
- Framework Flower: https://flower.ai/
- LeRobot: https://github.com/huggingface/lerobot
- Dataset de evaluacion: https://huggingface.co/datasets/Hupy440/Two_Cubes_and_Two_Buckets_v2
- Dataset de utensilios: https://huggingface.co/datasets/sebastiandavidlee/chopsticksTable2Organizer
- Dataset de cubos con tres camaras: https://huggingface.co/datasets/VoicAndrei/so100_cubes_three_cameras
