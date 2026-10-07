# fysical/so101ball_pi05expert_S012_seed0

## Resumen

`fysical/so101ball_pi05expert_S012_seed0` es una politica robotica de tipo vision-language-action (VLA) publicada por el usuario `fysical` en Hugging Face. Se trata de un ajuste fino de `lerobot/pi05_base`, la implementacion en LeRobot del modelo π₀.₅ de Physical Intelligence, orientado a la generalizacion en entornos abiertos. El modelo esta entrenado para controlar un brazo robotico SO-101 (tipo `so_follower`) y ejecutar una tarea concreta de manipulacion: coger una pelota verde y depositarla en una cesta ignorando dos pelotas rojas como distractores.

El problema que resuelve es el control motor de un robot a partir de observaciones visuales y de estado, sin necesidad de programar la trayectoria manualmente. Con 4.143.404.816 parametros (aproximadamente 4,14 mil millones), consume tres imagenes de 224x224 pixeles y un vector de estado de 32 dimensiones, y produce un vector de accion de 6 dimensiones. Es relevante por su licencia Apache 2.0, que permite uso comercial, y por formar parte del ecosistema LeRobot, que facilita el entrenamiento, la reproducion y el despliegue de politicas de imitacion sobre hardware accesible.

La ficha no incluye resultados de evaluacion ni benchmarks publicados, y el repositorio registra cero descargas y cero "likes" en el momento de la consulta, por lo que se trata de un artefacto de investigacion reciente y sin validacion externa documentada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA); derivada de π₀.₅ (Pi05) e implementada en LeRobot a partir del repositorio OpenPI |
| Parametros totales | 4.143.404.816 |
| Parametros activos | No aplica (no se describe como modelo MoE en la informacion disponible) |
| Longitud de contexto | No disponible (no es un modelo de contexto textual; procesa observaciones por paso) |
| Tipos de cuantizacion | Pesos en safetensors; no se documentan cuantizaciones GGUF, AWQ o GPTQ |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio de 20,0 GB) |

## Arquitectura y entrenamiento

La informacion disponible indica que se trata de un modelo VLA de la familia π₀.₅, disenado para generalizar a entornos y situaciones no vistos durante el entrenamiento. La implementacion en LeRobot esta adaptada del repositorio open source OpenPI de Physical Intelligence. El modelo consume tres entradas visuales (`observation.images.base_0_rgb`, `observation.images.left_wrist_0_rgb` y `observation.images.right_wrist_0_rgb`, todas de forma `(3, 224, 224)`), una entrada de estado (`observation.state`, forma `(32,)`) y una instruccion de tarea en lenguaje natural; como salida genera una accion de forma `(6,)`, correspondiente a los grados de libertad del brazo SO-101.

El ajuste fino se realizo mediante aprendizaje por imitacion sobre el conjunto de datos `fysical/greenball_pool_225_v1`, compuesto por 225 episodios y 116.164 fotogramas grabados a 30 FPS. La tarea entrenada es literalmente "Pick up the green ball and place it in the basket, ignoring the two red distractor balls". La configuracion de entrenamiento documentada incluye 6000 pasos, tamano de lote 32, optimizador AdamW, tasa de aprendizaje 2,5e-05 y semilla 0, sobre LeRobot version 0.6.2. No se detalla en la informacion proporcionada ningun proceso de RLHF, DPO ni innovaciones tecnicas adicionales mas alla de las propias de la familia π₀.₅.

## Capacidades

- Generacion de acciones motoras de 6 dimensiones para un brazo robotico SO-101 a partir de observaciones sensoriales.
- Percepcion visual multi-camara: procesa simultaneamente tres vistas RGB de 224x224 (vista base y dos vistas de muneca).
- Fusion de vision, estado propioceptivo (vector de 32 dimensiones) y una instruccion de tarea en lenguaje natural.
- Ejecucion de tareas de manipulacion con distractores visuales, segun la tarea para la que fue entrenado.
- Generalizacion a entornos nuevos como objetivo de diseno de π₀.₅, aunque no hay evaluacion publicada que lo cuantifique en este ajuste.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso textual, agentes ni capacidades de audio.
- No se documentan capacidades multilingues mas alla del uso del prompt de tarea en ingles.

## Casos de uso

- Manipulacion robotica pick-and-place: el modelo recoge un objeto verde y lo deposita en una cesta, ignorando distractores rojos, controlado mediante `lerobot-rollout` sobre un brazo SO-101.
- Investigacion en aprendizaje por imitacion: sirve como ejemplo reproducible de ajuste fino de una politica VLA desde `lerobot/pi05_base`, con hiperparametros y semilla documentados.
- Punto de partida para fine-tuning: al estar basado en `lerobot/pi05_base`, puede reentrenarse sobre nuevos conjuntos de datos para tareas de manipulacion distintas.
- Benchmarking de robustez visual: la presencia de dos pelotas distractoras permite evaluar la resistencia a falsos positivos en tareas de seleccion de objetos.
- Automatizacion de tareas de clasificacion fisica: adaptando la tarea, podria emplearse en lineas donde haya que separar objetos por color o forma.
- Docencia y prototipado en robotica de bajo coste: el SO-101 es un brazo accesible y LeRobot ofrece guias de montaje, calibracion y despliegue, lo que facilita reproducir el flujo completo.
- Validacion de pipelines de LeRobot: sirve para comprobar la integracion entre grabacion de datos, entrenamiento y ejecucion de politicas en un flujo estandar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica literalmente: "No evaluation results have been provided for this policy yet", y no incluye tasas de exito ni numero de ensayos en robot real.

## Requisitos de hardware

- Parametros totales: 4.143.404.816. En precision bf16/fp16 los pesos ocupan aproximadamente 8-9 GB; en fp32, aproximadamente 16-17 GB. El repositorio completo ocupa 20,0 GB.
- VRAM estimada para inferencia: alrededor de 9-10 GB en bf16 contando activaciones y buffers; en torno a 17-20 GB si se ejecuta en fp32.
- GPU recomendadas: tarjetas con 16 GB o mas de VRAM (por ejemplo RTX 4080/4090, A100, H100). Una RTX 4090 de 24 GB es suficiente para inferencia en bf16.
- Cabe en GPU de consumo: si, en modelos con 16 GB o mas de VRAM en bf16; con 12 GB puede requerir cuantizacion o precision reducida, que no esta documentada en el repositorio.
- Opciones de despliegue: el flujo oficial es LeRobot mediante el comando `lerobot-rollout` (inferencia sobre el robot) y `lerobot-train` (entrenamiento). No se documenta compatibilidad con vLLM, TGI, Ollama o llama.cpp, ya que no es un modelo de lenguaje generativo convencional.
- Latencia y throughput: no disponibles. Al ser una politica que opera a 30 FPS en la captura de datos, el control en tiempo real depende del hardware de inferencia y del robot.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Licencia | Notas |
|---|---|---|---|---|
| so101ball_pi05expert_S012_seed0 | ~4,14 mil millones | VLA (π₀.₅) para SO-101 | Apache 2.0 | Ajuste fino especializado en una tarea de pick-and-place |
| lerobot/pi05_base | No disponible | VLA (π₀.₅) base | No disponible en la informacion proporcionada | Modelo base del que deriva este ajuste |
| Otros modelos VLA comparables (por ejemplo, la familia π₀ o alternativas de robotica) | No disponible | VLA | No disponible | No se dispone de datos de rendimiento ni parametros en la informacion proporcionada para establecer una comparacion cuantitativa |

No es posible ofrecer una comparacion numerica fiable con alternativas porque la informacion disponible no incluye resultados de benchmarks ni especificaciones de otros modelos de la misma categoria.

## Limitaciones y advertencias

- Alta especializacion: el modelo esta ajustado para una unica tarea ("coger la pelota verde e ignorar las rojas") y no se documenta su comportamiento fuera de ella.
- Sin evaluacion publicada: no hay tasas de exito en robot real, por lo que se desconoce su robustez efectiva.
- Riesgo de alucinacion motora o de acciones incorrectas ante posiciones, iluminacion o configuraciones de objetos no vistas durante el entrenamiento.
- Dependencia del hardware: esta disenado para un robot SO-101 con camaras concretas; los nombres de camara deben coincidir con las claves de observacion del entrenamiento, y la calibracion afecta al resultado.
- Sesgos del conjunto de datos: al derivar de 225 episodios y 116.164 fotogramas de una unica tarea, hereda los sesgos de posicion, color e iluminacion presentes en esas grabaciones.
- Idiomas: no se documentan idiomas soportados; las instrucciones de tarea se proporcionan en ingles en el ejemplo oficial.
- Licencia: Apache 2.0 permite uso comercial y modificacion, siempre que se respeten las condiciones de atribucion y se incluya el aviso de licencia correspondiente.
- Advertencia para produccion: al no existir evaluacion ni validacion externa, no se recomienda su uso en entornos criticos sin una validacion propia previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fysical/so101ball_pi05expert_S012_seed0
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Conjunto de datos de entrenamiento: https://huggingface.co/datasets/fysical/greenball_pool_225_v1
- Blog de π₀.₅ (Pi05) de Physical Intelligence: https://www.physicalintelligence.company/blog/pi05
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de LeRobot para pi05: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio OpenPI de Physical Intelligence (referenciado en la model card): https://github.com/Physical-Intelligence/openpi
- Visualizacion del conjunto de datos: https://huggingface.co/spaces/lerobot/visualize_dataset?path=fysical/greenball_pool_225_v1
