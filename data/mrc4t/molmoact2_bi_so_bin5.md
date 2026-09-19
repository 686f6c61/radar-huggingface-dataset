# MrC4t/molmoact2_bi_so_bin5

## Resumen

MrC4t/molmoact2_bi_so_bin5 es un checkpoint de politica robotica (policy) entrenado con LeRobot sobre el modelo fundacional de robotica MolmoAct2, desarrollado por el Allen Institute for AI (Ai2). MolmoAct2 es un modelo abierto que transforma imagenes de camara e instrucciones en lenguaje natural en fragmentos de acciones (action chunks) para robots. Este repositorio concreto no es el modelo base, sino un ajuste especifico para una tarea de manipulacion bimanual: introducir un juguete en un contenedor ("put toy in bin").

El modelo consume tres flujos visuales (camara de cabeza, muneca izquierda y muneca derecha, cada uno a 480x640) y un vector de estado de 12 dimensiones, y produce un vector de accion de 12 dimensiones a 30 FPS. El ajuste se realizo sobre el dataset MrC4t/bimanual_toy_bin, compuesto por 46 episodios y 37.278 fotogramas, con 2.000 pasos de entrenamiento y un batch de 8.

Con 5.601.988.144 parametros (aproximadamente 5,6 mil millones) y un tamano de repositorio de 12,7 GB, se distribuye bajo licencia Apache 2.0 en formato safetensors. Es relevante por dos motivos: por un lado, ilustra el flujo completo de imitacion robotica end-to-end con LeRobot; por otro, al ser un modelo pequeno para su categoria, es un candidato realista para hardware de gama alta orientado a consumidor, aunque no se han publicado resultados de evaluacion en robot real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo fundacional de robotica MolmoAct2, ejecutado mediante LeRobot) |
| Parametros totales | 5.601.988.144 (aproximadamente 5,6 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Biblioteca | lerobot |
| Tipo de robot | bi_so_follower |
| Camaras | head, left_wrist, right_wrist |
| Entrada (estado) | observation.state, forma (12,) |
| Entrada (vision) | observation.images.head / left_wrist / right_wrist, forma (3, 480, 640) |
| Salida | action, forma (12,) |
| Tamano del repositorio | 12,7 GB |
| Frecuencia de datos | 30 FPS |

## Arquitectura y entrenamiento

Segun la informacion disponible, MolmoAct2 es un modelo fundacional de robotica abierto de Ai2 que mapea imagenes de camara e instrucciones en lenguaje a fragmentos de accion. La implementacion de LeRobot permite tanto el entrenamiento como la evaluacion del modelo MolmoAct2 estandar. No se detallan en la informacion proporcionada el tipo de transformer subyacente, el numero de capas, la dimension oculta ni si emplea mecanismos adicionales como atencion lineal o decodificacion especulativa. Tampoco se especifica la composicion exacta del dataset de preentrenamiento del modelo base ni si se aplicaron tecnicas de RLHF o DPO.

El ajuste concreto de este repositorio se realizo con LeRobot 0.6.2 sobre el dataset MrC4t/bimanual_toy_bin (46 episodios, 37.278 fotogramas, 30 FPS, tarea "put toy in bin"). La configuracion de entrenamiento fue de 2.000 pasos, batch de 8, optimizador `molmoact2_adamw`, tasa de aprendizaje de 1e-05 y semilla 1000. No se ha documentado en la informacion disponible ninguna innovacion tecnica adicional mas alla del propio enfoque de transformar observaciones multimodales (estado y tres vistas) en acciones continuas de 12 dimensiones.

## Capacidades

- Generacion de acciones de robot: convierte observaciones visuales y de estado en vectores de accion continuos de 12 dimensiones para un robot bimanual.
- Seguimiento de instrucciones en lenguaje: acepta una descripcion textual de la tarea (en este ajuste, "put toy in bin") para condicionar la politica.
- Percepcion multimodal: procesa simultaneamente tres camaras (cabeza, muneca izquierda y muneca derecha) ademas del estado del robot.
- Manipulacion bimanual: el tipo de robot `bi_so_follower` y el vector de accion de 12 dimensiones indican control de dos brazos.
- Ejecucion en tiempo real: los datos y el control operan a 30 FPS, adecuado para bucles de control de robot.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-step: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; el idioma de las instrucciones no se especifica.
- Modo de razonamiento (thinking mode), vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Automatizacion de recogida de objetos en linea de montaje: el modelo puede ejecutar la tarea de colocar piezas en un contenedor usando las tres camaras para localizar el objeto y el estado de 12 dimensiones para coordinar ambos brazos.
- Prototipado rapido de politicas de imitacion: gracias a la integracion nativa con LeRobot, se puede reproducir el flujo de `lerobot-train` sobre un dataset propio y desplegar con `lerobot-rollout` en pocos comandos.
- Investigacion en aprendizaje por imitacion: el checkpoint sirve como punto de partida o referencia para estudiar el comportamiento de MolmoAct2 con datasets pequenos (46 episodios en este caso).
- Docencia y formacion en robotica: permite a estudiantes ejecutar una politica de manipulacion real con hardware de tipo `bi_so_follower` y entender el pipeline completo de observacion-accion.
- Evaluacion de robustez en entornos controlados: al ejecutar la politica con `--duration` ajustable y sin grabacion de episodios, se pueden medir tasas de exito bajo distintas posiciones de objeto o iluminacion (aunque no hay resultados publicados).
- Benchmarking de infraestructura de inferencia robotica: util para medir latencia y throughput de un modelo de 5,6 B en GPUs concretas dentro de un bucle de control a 30 FPS.
- Generacion de datos sinteticos o aumentados: ejecutando la politica de forma repetida se pueden recopilar trayectorias adicionales para ampliar datasets de manipulacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente: "_No evaluation results have been provided for this policy yet._", por lo que no existen tasas de exito ni metricas de evaluacion publicadas para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de 5,6 B de parametros; solo pesos, sin overhead de activaciones ni del codificador visual):
  - Precisión completa (fp32): en torno a 22,4 GB.
  - Media precisión (bf16/fp16): en torno a 11,2 GB.
  - Cuantizacion int8: en torno a 5,6 GB.
  - Cuantizacion int4: en torno a 2,8 GB.
  - Nota: los tipos de cuantizacion soportados no estan documentados; estas cifras son estimaciones teoricas segun el numero de parametros.
- GPU recomendadas: no se especifican en la informacion disponible. Por tamano, una GPU con 24 GB o mas (por ejemplo, RTX 4090, A100 40/80 GB, H100) permitiria ejecutar en bf16 con margen para las tres camaras y el bucle de control.
- Cabe en GPU de consumidor: previsiblemente si en bf16 en tarjetas de 24 GB (RTX 3090/4090) y en cuantizaciones de 8 o 4 bits en tarjetas de 8-12 GB, aunque no hay confirmacion oficial.
- Requisito especifico de hardware: robot de tipo `bi_so_follower` con tres camaras configuradas (head, left_wrist, right_wrist) a 640x480 y 30 FPS.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecucion y `lerobot-train` para entrenamiento). No aplican servidores de inferencia de texto como vLLM, TGI, Ollama o llama.cpp, ya que se trata de una politica robotica y no de un modelo de lenguaje conversacional.
- Latencia y throughput estimados: no disponible en la informacion proporcionada. El sistema esta pensado para operar a 30 FPS.

## Comparativa con modelos similares

La informacion proporcionada no incluye datos de modelos comparables (parametros, contexto, rendimiento o disponibilidad) que permitan construir una comparativa cuantitativa. Este checkpoint pertenece a la familia MolmoAct2 de Ai2 y comparte categoria con otros modelos fundacionales de robotica (vision-language-action), pero no se dispone en la busqueda de especificaciones verificables de alternativas.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MrC4t/molmoact2_bi_so_bin5 | 5,6 B (aprox.) | no disponible | sin evaluacion publicada | Apache 2.0 | HuggingFace |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no disponible en la informacion proporcionada.
- Riesgo de alucinacion: no disponible para politicas roboticas en los terminos habituales de modelos de lenguaje; no obstante, al ser un modelo de acciones entrenado con imitacion, puede producir movimientos incorrectos o inseguros ante situaciones fuera de la distribucion de entrenamiento.
- Sobreajuste al dataset: el ajuste se realizo con solo 46 episodios y 2.000 pasos sobre una unica tarea ("put toy in bin"), lo que limita su generalizacion a otros objetos, posiciones o instrucciones.
- Limitaciones de contexto e idioma: no se especifica la longitud de contexto ni los idiomas soportados. La unica tarea documentada esta en ingles.
- Restricciones de licencia: Apache 2.0 permite uso comercial con las condiciones habituales de atribucion y conservacion del aviso de licencia; conviene verificar las condiciones del modelo base MolmoAct2 de Ai2, que pueden diferir.
- Ausencia de evaluacion: no hay tasas de exito ni pruebas en robot real publicadas, por lo que no se puede garantizar su fiabilidad en produccion.
- Requisitos de hardware y seguridad: al controlar un robot fisico, es imprescindible operar con medidas de seguridad (limites de par, paradas de emergencia y supervision) durante cualquier despliegue.
- Dependencia de LeRobot: la ejecucion y el reentrenamiento requieren la version de LeRobot (0.6.2) y la configuracion de camaras y puertos del robot.
- Repositorio sin validacion social: 0 descargas y 0 likes en el momento de la consulta, sin senales de uso por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MrC4t/molmoact2_bi_so_bin5
- Dataset de entrenamiento: https://huggingface.co/datasets/MrC4t/bimanual_toy_bin
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=MrC4t/bimanual_toy_bin
- Blog de MolmoAct2 (Ai2): https://allenai.org/blog/molmoact2
- Guia de LeRobot para MolmoAct2: https://huggingface.co/docs/lerobot/main/en/molmoact2
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento de politicas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos (cheat-sheet): https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
