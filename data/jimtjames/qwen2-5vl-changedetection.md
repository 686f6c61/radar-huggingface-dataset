# jimtjames/qwen2.5vl-changedetection

## Resumen

`jimtjames/qwen2.5vl-changedetection` es un ajuste fino mediante LoRA del modelo multimodal Qwen2.5-VL-3B-Instruct, desarrollado por el usuario jimtjames, especializado en deteccion de cambios de escena a partir unicamente de fotogramas RGB. El modelo recibe dos recorridos de la misma habitacion (antes y despues de que se modifiquen objetos) y responde en JSON indicando que objetos se han movido, anadido o eliminado, incluyendo la distancia metrica del desplazamiento para los objetos movidos.

Se trata de la ablacion 2D del modelo `jimtjames/qwen3d_rgbd_dist`, que emplea tokens de vóxeles 3D levantados desde profundidad. Este checkpoint comparte fotogramas, preguntas, respuestas y configuracion de entrenamiento LoRA, pero sustituye la entrada 3D por imagenes planas, lo que permite aislar la contribucion de la informacion de profundidad. Es relevante como referencia de investigacion para evaluar hasta que punto un VLM de 3B parametros puede resolver cambio de escena y estimacion de distancia sin sensores de profundidad ni poses de camara.

El modelo se distribuye bajo la Qwen Research License (uso exclusivamente no comercial de investigacion y evaluacion) y el repositorio ocupa 8.0 GB. No registra descargas ni likes en el momento de la consulta y su ficha no declara idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (VLM) Qwen2.5-VL con adaptador LoRA sobre el LLM; vision encoder ViT congelado; M-RoPE y atencion causal |
| Parametros totales | 3B (modelo base Qwen2.5-VL-3B-Instruct) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrada de 32 bloques de imagen, 16 fotogramas por estado a 256 px, 81 tokens de vision por bloque) |
| Tipos de cuantizacion | no disponible (checkpoint en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Qwen Research License Agreement (qwen-research), solo uso no comercial de investigacion y evaluacion |
| Formato de pesos | `model_final.pth` (checkpoint completo de detectron2 del codigo de entrenamiento Qwen-3D, bf16, ~8 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-VL-3B-Instruct, un VLM compuesto por un encoder de vision ViT y un LLM transformer con M-RoPE y atencion causal. En este ajuste se congela el ViT y el resto de pesos, y solo se entrena un adaptador LoRA con rango 16, alpha 32 y dropout 0.05 aplicado a las proyecciones q/k/v/o y gate/up/down del LLM, ademas de la `lm_head` (32.4M parametros entrenables). Cada fotograma se introduce como un bloque de imagen independiente de Qwen2.5-VL (81 tokens de vision), etiquetado secuencialmente como `before 1` a `before 16` y `after 1` a `after 16`. La entrada son 16 fotogramas por estado a 256 px RGB, sin profundidad ni poses de camara; el fotograma k del estado "after" se captura desde la misma pose que el fotograma k del estado "before", y el prompt lo indica.

El entrenamiento se realizo sobre el dataset `DR8803VL/vlm-change-detection-4k` con las tareas `describe` (deteccion de cambios con distancia metrica) y `count` (recuento de objetos movidos, anadidos y eliminados), ambas con respuestas en JSON. Se emplearon 2 GPUs NVIDIA CMP 170HX, batch 2, learning rate 1e-4 constante tras 500 iteraciones de warmup. Este checkpoint corresponde a la iteracion 12.000 de una ejecucion de 20.000 iteraciones.

## Capacidades

- Deteccion de cambios de escena entre dos recorridos de la misma habitacion: identifica objetos movidos, anadidos y eliminados.
- Estimacion de distancia metrica de desplazamiento (`distance_m`) para objetos movidos visibles en ambos recorridos.
- Recuento de objetos por categoria de cambio mediante la tarea `count`, con salida JSON `{"moved": n, "added": n, "removed": n}`.
- Comprension de multiples imagenes en una sola peticion: 32 bloques de imagen (16 antes + 16 despues) con etiquetado posicional.
- Salida estructurada en JSON, adecuada para integracion en pipelines automatizados.
- Razonamiento visual sobre escenas interiores sin necesidad de profundidad ni poses de camara.
- Soporte de tool calling, agentes o modo thinking: no disponible (no declarado en la informacion proporcionada).
- Capacidades multilingues: no disponible.

## Casos de uso

- Auditoria de inventario en almacenes: comparar dos recorridos periodicos de una estanteria o sala y obtener automaticamente la lista de objetos movidos, con distancia estimada, para detectar reubicaciones no registradas.
- Control de obra y reformas: procesar pares de fotogramas antes/despues de una intervencion para documentar que elementos se han retirado o anadido en cada zona.
- Verificacion de montaje en entornos industriales: comprobar que una pieza o herramienta se ha colocado en la posicion esperada comparando capturas de dos estados de la linea.
- Investigacion en vision por computador: servir como linea base 2D para estudiar el impacto de anadir profundidad (comparacion directa con `qwen3d_rgbd_dist`) en tareas de cambio de escena.
- Robotica de inspeccion: integrar el modelo como modulo de verificacion de estado de una sala antes y despues de una tarea de manipulacion, usando solo la camara RGB del robot.
- Seguridad y vigilancia de instalaciones: detectar desplazamientos de objetos en areas restringidas comparando recorridos capturados en momentos distintos.
- Docencia y prototipado: evaluar las capacidades de un VLM de 3B parametros en tareas de razonamiento espacial con salida JSON, sin requerir hardware de captura 3D.

## Benchmarks y rendimiento

Evaluacion sobre 100 ejemplos de validacion por tarea, comparada con `jimtjames/qwen3d_rgbd_dist` (3D RGB-D, 20k iteraciones):

| Metrica | Este modelo (2D, 12k) | qwen3d_rgbd_dist (3D RGB-D, 20k) |
|---|---|---|
| Precision / recall / F1 de cambio | 0.648 / 0.643 / 0.645 | 0.626 / 0.662 / 0.643 |
| F1 de mover / anadir / eliminar | 0.710 / 0.440 / 0.378 | 0.681 / 0.364 / 0.509 |
| MAE / mediana de distancia de movimiento (pares emparejados) | 0.29 m / 0.08 m | 0.20 m / 0.09 m |
| Pares emparejados dentro de 0.1 / 0.25 / 0.5 m | 56.5% / 79.2% / 88.4% | 54.6% / 82.7% / 91.0% |
| F1 de distancia de movimiento a 0.1 / 0.25 / 0.5 m | 0.411 / 0.576 / 0.643 | 0.385 / 0.583 / 0.641 |
| Precision de recuento moved / added / removed / all | 0.26 / 0.65 / 0.39 / 0.09 | 0.25 / 0.70 / 0.48 / 0.10 |
| MAE de recuento total | 1.28 | 1.33 |

Nota metodologica del autor: un movimiento predicho se empareja con un movimiento real de la misma clase mediante asignacion de coste minimo y se considera acierto si su distancia cae dentro del umbral; la precision se calcula sobre movimientos predichos con distancia y el recall sobre movimientos reales con distancia (560). Asignando a todas las detecciones la distancia mas comun (0.5 m) se obtiene un F1 de aproximadamente 0.30 / 0.43 / 0.53, por lo que parte de la puntuacion de distancia refleja el prior del dataset.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint pesa ~8 GB en bf16; el modelo base de 3B requiere aproximadamente 6-8 GB en bf16 para los pesos, mas el coste de atender 32 bloques de imagen (2.592 tokens de vision) y los tokens de texto. No se dispone de mediciones oficiales de VRAM.
- GPU recomendadas: el autor entreno con 2x NVIDIA CMP 170HX; para inferencia se puede emplear cualquier GPU con al menos 16 GB de VRAM (A100, H100, RTX 4090, RTX A6000) para trabajar en bf16 con margen.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) y previsiblemente en GPUs de 16 GB con cuantizacion, aunque no se han publicado conversiones GGUF ni mediciones de VRAM para este checkpoint.
- Opciones de despliegue: el checkpoint es un `model_final.pth` de detectron2 del codigo de entrenamiento `rabidsquirrel4/spatial_llm` (rama `2d-vlm-ablation`, con el submodulo `rabidsquirrel4/qwen3d`), cargado con `MODEL.WEIGHTS model_final.pth VLMCD.INPUT_MODE 2d CAUSAL_MASK True USE_LORA True LORA_RANK 16 LORA_ALPHA 32 VLMCD.FRAMES_PER_STATE 16 VLMCD.IMAGE_SIZE 0 VLMCD.ANSWER_FORMAT json`. No se proporcionan instrucciones para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen2.5vl-changedetection (este) | 3B | 16+16 fotogramas RGB a 256 px | LoRA sobre Qwen2.5-VL, deteccion de cambios 2D | Qwen Research (no comercial) | Hugging Face, checkpoint detectron2 |
| qwen3d_rgbd_dist | 3B (base Qwen2.5-VL) | 16+16 fotogramas con profundidad levantada a vóxeles 3D | LoRA sobre Qwen2.5-VL con tokens 3D | no disponible en la informacion | Hugging Face |
| Qwen2.5-VL-3B-Instruct | 3B | Contexto nativo del modelo base | VLM generalista sin ajuste de cambio de escena | Qwen Research | Hugging Face |

La comparacion principal es con `qwen3d_rgbd_dist`: ambos obtienen F1 de cambio practicamente identico (0.645 frente a 0.643), mientras que el modelo 3D mejora en distancia (MAE 0.20 m frente a 0.29 m) y en deteccion de eliminaciones (F1 0.509 frente a 0.378), y el modelo 2D supera ligeramente en deteccion de movimientos (0.710 frente a 0.681) y en adiciones (0.440 frente a 0.364).

## Limitaciones y advertencias

- Licencia Qwen Research License: uso exclusivamente no comercial de investigacion y evaluacion; no apta para produccion comercial sin autorizacion adicional.
- Entrenado para un dominio muy estrecho (escenas interiores, 16+16 fotogramas RGB a 256 px); el rendimiento fuera de ese formato o de ese tipo de escena no esta caracterizado.
- Precision baja en recuento: exactitud global de 0.09 y MAE de recuento total de 1.28, lo que desaconseja su uso para conteo fiable sin postprocesado o validacion.
- La estimacion de distancia tiene MAE de 0.29 m y solo el 56.5% de los pares emparejados cae dentro de 0.1 m; parte de la puntuacion de F1 de distancia proviene del prior del dataset (0.5 m).
- Requiere que el fotograma k del estado "after" se capture desde la misma pose que el fotograma k del estado "before"; si no se cumple, el modelo carece de informacion para alinear las vistas.
- Riesgo de alucinacion en clases de objeto y en la existencia de cambios no presentes, no cuantificado en la informacion disponible.
- Sesgos conocidos: no disponible.
- Idiomas soportados: no disponible; la salida esta disenada en JSON con claves en ingles (`action`, `class`, `distance_m`).
- El checkpoint es un `.pth` de detectron2 ligado a un codigo de entrenamiento concreto; no hay pesos en safetensors ni GGUF, lo que complica el despliegue con herramientas estandar.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion externa por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jimtjames/qwen2.5vl-changedetection
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/DR8803VL/vlm-change-detection-4k
- Modelo 3D de referencia (ablacion RGB-D): https://huggingface.co/jimtjames/qwen3d_rgbd_dist
- Codigo de entrenamiento: repositorio `rabidsquirrel4/spatial_llm`, rama `2d-vlm-ablation` (con submodulo `rabidsquirrel4/qwen3d`); configuracion resuelta en `vlm_cd/configs/vlmcd_qwen25vl_2d.yaml`
- Licencia: archivo `LICENSE` (Qwen Research License Agreement) y `NOTICE` en el repositorio del modelo
