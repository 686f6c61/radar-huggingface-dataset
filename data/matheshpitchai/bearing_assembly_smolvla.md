# matheshpitchai/bearing_assembly_smolvla

## Resumen

Este repositorio contiene un ajuste fino del modelo SmolVLA (Vision-Language-Action) publicado por el usuario matheshpitchai sobre la base lerobot/smolvla_base. Se trata de una politica robotica de imitacion entrenada para una unica tarea de ensamblaje: colocar la carcasa de un rodamiento en vertical sobre un util e insertar el rodamiento. El modelo consume el estado articular de un robot SO-100/SO-101 follower (6 dimensiones) y tres camaras RGB de 256x256, y produce un vector de accion continuo de 6 dimensiones.

SmolVLA es un modelo compacto de 450.046.176 parametros (aproximadamente 450 M) desarrollado por Hugging Face, que combina un modelo vision-lenguaje pequeno con un experto de accion entrenado mediante flow matching. Su relevancia radica en que ofrece control robotico multimodal con un coste computacional bajo, pensado para ejecutarse en hardware de consumo y no en clusters de GPU de gama alta.

Este checkpoint concreto es un ejemplo de ajuste fino de nicho: 100 episodios y 93.670 fotogramas grabados a 30 FPS, entrenados durante 20.000 pasos con LeRobot 0.6.2. No aporta innovaciones arquitectonicas sobre la base, sino una especializacion en una tarea industrial concreta y un pipeline de camaras y robot especifico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA); modelo vision-lenguaje SmolVLM mas experto de accion con flow matching (segun la publicacion de SmolVLA) |
| Parametros totales | 450.046.176 (aproximadamente 450 M) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | No disponible. El modelo consume una observacion fija: estado `(6,)` mas tres imagenes `(3, 256, 256)` |
| Tipos de cuantizacion | No disponible. El repositorio solo distribuye pesos sin cuantizaciones precalculadas |
| Idiomas soportados | No disponible. La instruccion de tarea del dataset de ajuste esta en ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamano del repositorio: 0,9 GB) |

Datos de entrada y salida declarados en la model card:

| Feature | Tipo | Forma |
|---|---|---|
| `observation.state` | STATE | `(6,)` |
| `observation.images.camera1` | VISUAL | `(3, 256, 256)` |
| `observation.images.camera2` | VISUAL | `(3, 256, 256)` |
| `observation.images.camera3` | VISUAL | `(3, 256, 256)` |
| `action` | ACTION | `(6,)` |

## Arquitectura y entrenamiento

La arquitectura corresponde a SmolVLA, descrita en el paper arXiv:2506.01844. Se trata de un modelo de vision-lenguaje-accion que acopla un backbone vision-lenguaje compacto de la familia SmolVLM con un modulo generador de acciones. Las imagenes de las camaras y la instruccion en lenguaje natural se procesan de forma conjunta, y la salida de accion se genera como una trayectoria continua en lugar de como una clasificacion discreta de tokens, lo que permite producir comandos de control suaves para el robot. El modelo esta disenado para ejecutarse de forma asincrona en hardware de consumo, caracteristica que el autor del ajuste hereda de la base.

Los datos de entrenamiento de este checkpoint son exclusivamente el dataset matheshpitchai/bearing_assembly: 100 episodios, 93.670 fotogramas a 30 FPS, con una unica instruccion de tarea ("Place the bearing housing upright in the fixture and insert the bearing"). La configuracion de ajuste fino usada fue de 20.000 pasos, batch size 64, optimizador AdamW con learning rate 1e-4, semilla 1000 y LeRobot 0.6.2. La model card no documenta el uso de RLHF, DPO ni etapas de alineacion adicionales posteriores al ajuste por imitacion.

## Capacidades

- Generacion de acciones de robot de 6 grados de libertad a partir de imagenes y estado articular, mediante aprendizaje por imitacion.
- Fusión multimodal de tres vistas de camara simultaneas (`camera1`, `camera2`, `camera3`) con resolucion de 256x256 por vista.
- Condicionamiento por instruccion en lenguaje natural: la politica acepta una descripcion textual de la tarea.
- Ejecucion sobre robot real de tipo `so_follower` mediante el comando `lerobot-rollout`.
- Especializacion en una tarea concreta de ensamblaje mecanico: colocacion e insercion de un rodamiento.
- Control continuo en bucle cerrado a la frecuencia de las camaras (30 FPS en el dataset de entrenamiento).
- No dispone de: soporte de tool calling, capacidades de agente multi-paso, generacion de texto libre, razonamiento simbolico, vision general de proposito abierto ni salidas de audio.

## Casos de uso

- Automatizacion de una celda de ensamblaje de rodamientos: el modelo puede pilotar un SO-100/SO-101 equipado con las mismas camaras para repetir la secuencia de colocacion de la carcasa e insercion del rodamiento en un util fijo.
- Banco de pruebas academico de VLA: sirve como ejemplo completo y reproducible de ajuste fino de SmolVLA con LeRobot, util para cursos de robotica e imitacion.
- Punto de partida para otros ajustes: al derivar de `lerobot/smolvla_base` con licencia Apache 2.0, puede usarse como inicializacion para tareas de ensamblaje similares con pocas decenas de episodios adicionales.
- Validacion de pipelines de datos: el dataset asociado (100 episodios, 93.670 fotogramas) permite evaluar herramientas de visualizacion, curado y reentrenamiento de datos robotico.
- Investigacion en generalizacion de politicas: util para medir cuanto degrada el rendimiento un cambio de iluminacion, posicion de objetos o robot del mismo tipo, ya que la model card no reporta evaluacion.
- Demostraciones de robotica de bajo coste: al tratarse de un modelo de 450 M con pesos de 0,9 GB, puede desplegarse en equipos de laboratorio sin GPU de datacenter para exhibiciones y docencia.
- Comparacion de arquitecturas de politica: sirve como referencia frente a ACT u otros metodos en la misma plataforma LeRobot y el mismo tipo de robot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye explicitamente la seccion de evaluacion vacia con el texto "No evaluation results have been provided for this policy yet", por lo que no existen tasas de exito, numero de ensayos ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,9 GB en bf16/fp16 y 1,8 GB en fp32, solo para los pesos de la politica; hay que sumar el coste de procesar tres imagenes de 256x256.
- GPU recomendadas: cualquier GPU moderna con al menos 4-6 GB de VRAM (RTX 3050, RTX 3060, RTX 4060, RTX 4090). El modelo esta disenado por Hugging Face para hardware de consumo.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU con mas de 4 GB de VRAM, e incluso en portatiles con GPU integrada dedicada de gama media.
- Opciones de despliegue: LeRobot (comandos `lerobot-rollout` y `lerobot-train`) es la via oficial documentada. No se documentan integraciones con vLLM, llama.cpp, Ollama, TGI ni otros servidores de inferencia de texto, ya que no es un modelo de lenguaje generativo.
- Latencia y throughput: no disponibles. SmolVLA incorpora inferencia asincrona con cola de acciones en su diseno general, pero la model card de este ajuste no publica cifras de latencia ni de frecuencia de control efectiva.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto / entradas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bearing_assembly_smolvla (este) | 450 M | VLA ajustado por imitacion | Estado `(6,)` + 3 camaras 256x256 | Apache 2.0 | Hugging Face |
| lerobot/smolvla_base | 450 M | VLA base preentrenado | Estado + camaras, multimillon de episodios de comunidad (segun la publicacion) | Apache 2.0 | Hugging Face |
| lerobot/act (ACT) | No disponible en la informacion proporcionada | Transformer de politica por imitacion | Estado + camaras, sin condicionamiento de lenguaje | Apache 2.0 | Hugging Face |
| OpenVLA | 7 B | VLA | Vision + instruccion de lenguaje | Licencia propia (no verificada en esta busqueda) | Hugging Face |

La comparacion cuantitativa de rendimiento no puede realizarse porque no hay evaluacion publicada para este checkpoint ni cifras homogeneas de tarea en la informacion disponible. La diferencia mas relevante frente a alternativas como OpenVLA es el orden de magnitud en numero de parametros (450 M frente a 7 B), lo que reduce drasticamente los requisitos de hardware a costa de una especializacion muy estrecha.

## Limitaciones y advertencias

- Especializacion extrema: la politica esta entrenada para una unica instruccion y un unico entorno de ensamblaje; no generaliza a tareas distintas sin reentrenamiento.
- Sin evaluacion publicada: no hay tasa de exito ni numero de ensayos, por lo que no se puede afirmar que la politica funcione de forma fiable en el robot real.
- Acoplamiento al hardware: asume un robot `so_follower` con estado de 6 dimensiones, tres camaras en posiciones concretas y nombres de observacion exactos (`camera1`, `camera2`, `camera3`). Cambiar de camaras o de montaje invalida la politica.
- Sesgos de dataset: 100 episodios grabados por una sola persona en un unico entorno implican un sesgo fuerte hacia las posiciones de objeto, la iluminacion y el fondo presentes en la grabacion.
- Riesgo de fallo silencioso: al ser una politica de imitacion, ante una entrada fuera de distribucion puede producir acciones plausibles pero incorrectas sin ninguna senal de incertidumbre.
- Limitacion idiomatica: la instruccion de tarea esta en ingles y no se documenta soporte multilingue.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificacion, pero el autor no ofrece garantias y el modelo base conserva su propia licencia; conviene revisar los terminos de `lerobot/smolvla_base` antes de un despliegue productivo.
- Trazabilidad: la fecha de creacion indicada en el repositorio (2026-10-07) es posterior a la de esta revision; se recomienda verificar el estado actual del repositorio.
- Sin cuantizaciones oficiales: no se distribuyen versiones GGUF ni int8, lo que limita el despliegue en dispositivos muy restringidos.
- Riesgo de seguridad fisica: cualquier politica robotica debe desplegarse con limites de par, paradas de emergencia y espacio de trabajo despejado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/matheshpitchai/bearing_assembly_smolvla
- Dataset de entrenamiento: https://huggingface.co/datasets/matheshpitchai/bearing_assembly
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=matheshpitchai/bearing_assembly
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Blog de SmolVLA en Hugging Face: https://huggingface.co/blog/smolvla
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio LeRobot en GitHub: https://github.com/huggingface/lerobot
- Analisis tecnico de SmolVLA en Medium: https://medium.com/@ahabb/anatomy-of-vla-inside-smolvla-424062c65aa4
- Ficha de SmolVLA en FastFlowLM: https://fastflowlm.com/docs/models/smolvla/
- Repositorio de ejemplo de ajuste de SmolVLA: https://github.com/PhosFaith/SmolVLA
- Checkpoint relacionado del mismo autor: https://huggingface.co/matheshpitchai/act_bearing_A_full
