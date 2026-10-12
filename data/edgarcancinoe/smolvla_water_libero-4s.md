# edgarcancinoe/smolvla_water_libero-4s

## Resumen

smolvla_water_libero-4s es un modelo vision-language-action (VLA) para robotica, publicado en Hugging Face por el usuario edgarcancinoe. Se trata de un fine-tune del modelo base lerobot/smolvla_base, la implementacion de SmolVLA (paper arXiv:2506.01844) desarrollada en el ecosistema LeRobot de Hugging Face. El modelo resuelve una tarea concreta de manipulacion: regar tres plantas distintas ("Water the left plant", "Water the middle plant", "Water the right plant") con un robot Franka Panda y dos camaras.

Con 604.934.176 parametros reales (recuento de safetensors) y un repositorio de 1,2 GB, es un VLA compacto disenado para desplegarse en hardware de consumo, en la linea del SmolVLA original. El modelo consume dos imagenes de 256x256 y un vector de estado de 8 dimensiones, y produce una accion de 7 dimensiones. La licencia es Apache-2.0, lo que facilita su reutilizacion comercial y su uso como punto de partida para nuevos fine-tunes.

Su relevancia actual radica en dos factores: por un lado, demuestra que un VLA de menos de 1.000 millones de parametros puede especializarse en una tarea manipulativa concreta con un dataset relativamente pequeno (175 episodios, 131.945 frames); por otro, ilustra el flujo de trabajo completo de LeRobot (entrenamiento, registro de datos y despliegue en robot real) sobre una arquitectura abierta. No se han publicado resultados de evaluacion en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en SmolVLA (backbone de vision-lenguaje + action expert); transformer |
| Parametros totales | 604.934.176 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos distribuidos en safetensors) |
| Idiomas soportados | no disponible (las instrucciones de tarea del dataset estan en ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria lerobot) |
| Tipo de robot | Franka Panda (`panda`) |
| Entradas | `observation.images.image` (3, 256, 256), `observation.images.image2` (3, 256, 256), `observation.state` (8,) |
| Salidas | `action` (7,) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de SmolVLA, un VLA compacto que combina un backbone de vision-lenguaje preentrenado con un modulo generador de acciones (action expert) que opera por flow matching. A diferencia de los VLA de gran tamano (del orden de 7.000 millones de parametros o mas), SmolVLA prioriza la eficiencia computacional y el despliegue en GPU de consumo. El paper describe el modelo base como un VLA de aproximadamente 450 millones de parametros; el recuento de safetensors de esta variante asciende a 604.934.176 parametros, cifra que incluye la totalidad de los componentes (codificador visual, proyector, backbone y action expert).

Este fine-tune concreto se ha entrenado sobre el dataset edgarcancinoe/water_pour_shift, compuesto por 175 episodios y 131.945 frames a 20 FPS, con tres tareas de riego. La configuracion de entrenamiento reportada es: 25.000 pasos, batch size 32, optimizador AdamW, learning rate 0.0001, semilla 1000 y LeRobot version 0.6.1. No se especifica en la model card si hubo etapas de RLHF, DPO ni decodificacion especulativa en el fine-tune. El modelo base, segun el paper citado, se preentrena sobre una amplia coleccion de datasets comunitarios de robotica alojados en el ecosistema LeRobot.

## Capacidades

- Generacion de acciones de control de 7 dimensiones (tipicamente 6 grados de libertad mas pinza) a partir de observaciones visuales y de estado.
- Percepcion visual mediante dos flujos de imagen de 256x256 (`image` e `image2`).
- Fusión de estado propioceptivo de 8 dimensiones con la informacion visual.
- Seguimiento de instrucciones de tarea en lenguaje natural (las tres tareas de riego entrenadas).
- Control de un robot Franka Panda en configuraciones de manipulacion de sobremesa.
- Ejecucion de politicas de imitacion en bucle cerrado mediante `lerobot-rollout`.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, vision generativa, audio ni modo de razonamiento explicito; es un modelo de politica robotica, no un asistente conversacional.

## Casos de uso

- Riego automatizado de plantas en laboratorio: es exactamente la tarea para la que se ha entrenado; el modelo selecciona el objetivo (izquierda, centro, derecha) segun la instruccion y ejecuta la secuencia de manipulacion con el Panda.
- Investigacion en imitation learning: sirve como referencia reproducible de un fine-tune VLA sobre un dataset pequeno (131.945 frames), util para comparar tecnicas de aprendizaje por imitacion.
- Punto de partida para transfer learning: al ser un fine-tune de `smolvla_base`, su configuracion y pesos pueden reutilizarse para especializar el modelo en otras tareas manipulativas con `lerobot-train`.
- Agricultura de precision e invernaderos: el esquema (dos camaras mas estado del robot) es trasladable a tareas de riego o cuidado de cultivos, siempre que se recopile un dataset propio, dado que la generalizacion fuera de la distribucion entrenada no esta garantizada.
- Validacion de pipelines de despliegue en hardware de consumo: permite probar de extremo a extremo el flujo LeRobot (`lerobot-rollout`, `lerobot-train`) en GPU de gama media.
- Docencia y formacion en robotica: por su tamano reducido y licencia permisiva, es adecuado para practicas de aprendizaje por imitacion y despliegue en robot real.
- Benchmarking interno de VLA compactos: util como baseline propio en evaluaciones de tareas de manipulacion, siempre que se documenten los resultados (la model card no los incluye).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de exito, numero de ensayos ni condiciones de evaluacion.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 604,9 M de parametros y pesos en el orden de 1,2 GB (tamano del repositorio), la inferencia en precision reducida cabe holgadamente en GPU de consumo.
- GPU recomendadas: no especificadas por el autor. Dado el tamano, son razonables GPU de consumo como RTX 3060 12 GB, RTX 4070 o RTX 4090, ademas de GPU de centro de datos (A100, H100) si se busca mayor margen o paralelismo.
- Compatibilidad con GPU de consumo: la model card de SmolVLA afirma que puede desplegarse en hardware de consumo; no se detallan modelos concretos ni requisitos minimos.
- Opciones de despliegue: libreria LeRobot, mediante `lerobot-rollout` para ejecutar la politica en el robot y `lerobot-train` para reentrenar. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje generativo al uso.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| smolvla_water_libero-4s | 604,9 M | no disponible | Apache-2.0 | Hugging Face | Fine-tune especializado en riego de plantas con Panda |
| lerobot/smolvla_base | no disponible | no disponible | Apache-2.0 | Hugging Face | Modelo base del que deriva este fine-tune |
| OpenVLA | aprox. 7 B | no disponible | no disponible | Hugging Face | VLA abierto de referencia, orden de magnitud mayor en parametros |
| pi0 (Physical Intelligence) | no disponible | no disponible | no disponible | no disponible | VLA orientado a control general; datos no verificados en esta busqueda |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Especificidad de tarea: el modelo esta entrenado unicamente para regar tres plantas concretas; la generalizacion a otras posiciones, objetos o instrucciones no esta garantizada.
- Sin evaluacion publicada: no hay tasas de exito ni condiciones de prueba, por lo que su fiabilidad real en produccion es desconocida.
- Dependencia del entorno de entrenamiento: el rendimiento puede degradarse ante cambios de iluminacion, posiciones nuevas, distractores o un robot distinto, incluso del mismo modelo.
- Requisitos de entrada fijos: espera exactamente dos camaras de 256x256 y un vector de estado de 8 dimensiones; la configuracion de camaras del robot debe coincidir con las claves de observacion usadas en el entrenamiento.
- Sin datos de sesgo: no se documentan sesgos conocidos, pero tampoco evaluaciones al respecto.
- Riesgo de fallo silencioso: como politica de imitacion, puede ejecutar acciones incorrectas sin senalizar incertidumbre, lo que exige supervisión y paradas de seguridad en robot real.
- Idiomas: la interaccion se limita a las instrucciones de tarea en ingles registradas; no es un modelo multilingue.
- Licencia: Apache-2.0, permisiva para uso comercial, pero conviene verificar los terminos del modelo base y del dataset asociado.
- Discrepancia de parametros: el recuento (604,9 M) difiere de la cifra de aproximadamente 450 M que cita el paper para SmolVLA; conviene tenerlo en cuenta al comparar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/edgarcancinoe/smolvla_water_libero-4s
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/edgarcancinoe/water_pour_shift
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=edgarcancinoe/water_pour_shift
- Paper SmolVLA (Hugging Face): https://huggingface.co/papers/2506.01844
- Paper SmolVLA (arXiv): https://arxiv.org/abs/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Documentacion de inferencia en LeRobot: https://huggingface.co/docs/lerobot/main/en/inference
