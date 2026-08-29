# CamilleWalters/smolvla-marker-v1

## Resumen

SmolVLA-marker-v1 es un modelo de vision-language-action (VLA) desarrollado por CamilleWalters como fine-tuning del modelo base `lerobot/smolvla_base`, creado por Hugging Face. SmolVLA es un VLA compacto de 450 millones de parámetros diseñado para control robótico de bajo coste, entrenable en una sola GPU y desplegable en hardware de consumo. Este fine-tuning concreto se ha entrenado para una tarea específica de manipulación: recoger un marcador rojo y colocarlo sobre un cuadrado, utilizando un robot WidowX AI y dos cámaras (principal y de muñeca).

La relevancia de este modelo radica en que demuestra el flujo completo de fine-tuning de SmolVLA con LeRobot sobre un dataset propio, permitiendo a desarrolladores e investigadores adaptar un VLA general a tareas robóticas concretas sin necesidad de infraestructura costosa. El modelo se distribuye con licencia Apache 2.0 y pesos en formato safetensors, lo que facilita su integración en proyectos de robótica open source.

La arquitectura subyacente, descrita en el paper arXiv 2506.01844, combina un modelo de lenguaje y visión compacto con una cabeza de acción que genera comandos de control de 7 dimensiones a partir de observaciones de estado (6 dimensiones) y tres imágenes de 256×256 píxeles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en SmolVLA |
| Parametros totales | 450.046.176 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (probablemente ingles, no confirmado) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo vision-language-action que integra un codificador visual, un modelo de lenguaje compacto y un decodificador de acciones. Segun el paper arXiv 2506.01844, el modelo de 450M parametros esta disenado para ser eficiente y desplegable en hardware de consumo, a diferencia de VLAs mas grandes como Pi0 u OpenVLA. La arquitectura procesa entradas multimodales (imagenes de camaras y estado del robot) y genera acciones de control continuo.

Este fine-tuning especifico se ha entrenado sobre el dataset `CamilleWalters/solo-marker-v1_20260828_121357`, que contiene 50 episodios y 21.986 frames a 30 FPS, con la tarea "Pick up the red marker and place it on the square". La configuracion de entrenamiento incluye 20.000 pasos, batch size de 64, optimizador AdamW con learning rate 0,0001 y semilla 1000. Se utilizo la libreria LeRobot version 0.6.1. No se menciona el uso de RLHF, DPO ni otras tecnicas de alineacion; se trata de un entrenamiento de imitacion supervisada.

## Capacidades

- Control robotico de manipulacion: genera acciones de 7 dimensiones (posicion y orientacion del efector final) a partir de observaciones de estado y vision.
- Percepcion multimodal: procesa tres imagenes de 256×256 píxeles (camara principal, camara de muñeca y una tercera camara) junto con el estado del robot.
- Ejecucion de tareas de pick-and-place: entrenado especificamente para recoger un marcador rojo y colocarlo sobre una superficie cuadrada.
- Integracion con LeRobot: compatible con el ecosistema de Hugging Face para robotica, incluyendo herramientas de rollout y entrenamiento.
- Inferencia en hardware de consumo: al ser un modelo de 450M parametros, puede ejecutarse en GPUs de gama media sin necesidad de servidores dedicados.
- Generacion de lenguaje natural (base): como VLA, el modelo base puede interpretar instrucciones en lenguaje natural, aunque este fine-tuning esta especializado en una tarea concreta.

## Casos de uso

- Automatizacion de tareas repetitivas en entornos de laboratorio: el modelo puede recoger y colocar objetos pequenos (como marcadores) en posiciones determinadas, reduciendo la intervencion manual en experimentos.
- Prototipado rapido de politicas roboticas: investigadores pueden usar este fine-tuning como punto de partida para adaptar SmolVLA a nuevas tareas con pocos datos, gracias al flujo de LeRobot.
- Robotica educativa: al ser un modelo pequeno y con licencia permisiva, puede integrarse en plataformas de ensenanza de robotica con hardware asequible como WidowX.
- Demostraciones de pick-and-place en produccion ligera: en lineas de montaje donde los objetos estan en posiciones fijas, el modelo puede manejar la manipulacion basica sin necesidad de sistemas de vision complejos.
- Evaluacion comparativa de VLAs: sirve como referencia para medir el rendimiento de modelos mas grandes en tareas de manipulacion real, ya que comparte la arquitectura base de SmolVLA.
- Desarrollo de sistemas de robotica colaborativa: puede integrarse en brazos roboticos de bajo coste para asistir en tareas de clasificacion o preparacion de materiales en entornos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para este fine-tuning especifico en la informacion disponible. La model card indica que no hay resultados de evaluacion proporcionados. Para el modelo base SmolVLA, el paper arXiv 2506.01844 reporta que supera a Pi0 inicializado con VLM y compite con Pi0 preentrenado en robotica, pero no se incluyen cifras concretas en los materiales consultados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, pero al ser un modelo de 450M parametros, se estima que puede ejecutarse con menos de 8 GB de VRAM en precision FP16 (estimacion basada en el tamano del modelo).
- GPU recomendadas: GPU de consumo como RTX 3060, RTX 4060 o superiores; tambien compatible con A100/H100 para entrenamiento mas rapido.
- Si cabe en consumer GPU: si, es el objetivo principal del diseno de SmolVLA.
- Opciones de despliegue: LeRobot (via `lerobot-rollout`), con soporte para PyTorch y CUDA. No se menciona compatibilidad con vLLM, Ollama o TGI, ya que no es un modelo de generacion de texto puro.
- Latencia y throughput: no disponibles, dependen del hardware y de la configuracion de camaras.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|
| SmolVLA-marker-v1 (este) | 450M | Pick-and-place especifico | Apache 2.0 | Hugging Face |
| SmolVLA base | 450M | VLA general | Apache 2.0 | Hugging Face |
| Pi0 | 3B (estimado) | VLA general | No especificada | No abierto |
| OpenVLA | 7B | VLA general | MIT (parcial) | Hugging Face |

SmolVLA se posiciona como una alternativa mucho mas ligera que Pi0 u OpenVLA, con un coste computacional significativamente menor. El paper indica que SmolVLA supera a Pi0 cuando este se inicializa desde un VLM sin preentrenamiento robotico, y rinde de forma competitiva frente a Pi0 preentrenado en datos de robotica, aunque no se proporcionan metricas exactas en los materiales consultados.

## Limitaciones y advertencias

- Tarea muy especifica: este fine-tuning solo ha sido entrenado para recoger un marcador rojo y colocarlo sobre un cuadrado. No generaliza a otras tareas sin reentrenamiento.
- Dataset pequeno: solo 50 episodios, lo que puede limitar la robustez frente a variaciones de iluminacion, posicion de objetos o texturas.
- Sin resultados de evaluacion: no se han publicado tasas de exito en robot real, por lo que no se conoce su rendimiento efectivo.
- Idiomas no confirmados: aunque SmolVLA base puede procesar instrucciones en ingles, no hay confirmacion para este modelo de que soporte otros idiomas.
- Dependencia de hardware especifico: el modelo esta entrenado para el robot WidowX AI y requiere camaras con las mismas caracteristicas de las usadas en el entrenamiento (nombres de claves de observacion).
- Riesgo de alucinacion en acciones: como cualquier politica de imitacion, puede generar acciones incorrectas si las observaciones se desvian del espacio de entrenamiento.
- Uso comercial: la licencia Apache 2.0 permite uso comercial, pero el modelo depende de componentes de terceros (LeRobot, SmolVLA base) que deben respetar sus propias licencias.

## Enlaces

- Repositorio del modelo: https://huggingface.co/CamilleWalters/smolvla-marker-v1
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper SmolVLA (arXiv): https://arxiv.org/abs/2506.01844
- Pagina del proyecto SmolVLA: https://smolvla.net/index_en
- Blog de Hugging Face sobre SmolVLA: https://huggingface.co/blog/smolvla
- Dataset de entrenamiento: https://huggingface.co/datasets/CamilleWalters/solo-marker-v1_20260828_121357
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
