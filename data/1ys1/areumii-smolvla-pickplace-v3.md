# 1ys1/areumii-smolvla-pickplace-v3

## Resumen

SmolVLA es un modelo vision-language-action (VLA) compacto desarrollado por Hugging Face, disenado para que la robotica de aprendizaje por imitacion sea accesible en hardware de consumo. Este repositorio concreto, `1ys1/areumii-smolvla-pickplace-v3`, es un fine-tune del modelo base `lerobot/smolvla_base` para una tarea especifica de manipulacion: recoger un cubo rojo y colocarlo en una cesta azul, ejecutada en un robot de tipo `areumii_c1`.

El modelo tiene 450 millones de parametros y una ventana de contexto multimodal (imagenes de tres camaras y estado del robot), lo que permite desplegarlo en GPUs de gama media. Se ha entrenado con 100 episodios (7409 frames a 20 FPS) procedentes del dataset `1ys1/areumii_pickplace-v3`, y su licencia Apache 2.0 permite uso comercial sin restricciones. La relevancia de este modelo radica en que demuestra que un VLA de tamano reducido puede especializarse en tareas de pick-and-place con un dataset pequeno, manteniendo una latencia baja y costes de inferencia asequibles para laboratorios y makers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action, basada en SmolVLM y un modulo de accion) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | safetensors (sin cuantizacion publicada en el repo) |
| Idiomas soportados | no disponible (el modelo se usa con instrucciones en ingles: "Pick red cube and place it on blue basket") |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (via LeRobot) |

## Arquitectura y entrenamiento

SmolVLA es un modelo VLA que combina un vision-language model (VLM) preentrenado con una cabeza de accion para control robotico. El modelo base `lerobot/smolvla_base` fue preentrenado por Hugging Face sobre datos masivos multimodales, y este repositorio lo fine-tunea con el framework LeRobot para la tarea especifica de pick-and-place. El entrenamiento se realizo durante 30.000 pasos con batch size 8, optimizador AdamW, learning rate de 0.0001 y semilla 1000, usando 100 episodios (7409 frames) del dataset `1ys1/areumii_pickplace-v3`.

La arquitectura consume tres observaciones visuales de 256x256 píxeles (camaras frontal, muneca izquierda y muneca derecha) y un estado del robot de 6 dimensiones, y produce una accion de 16 dimensiones. El entrenamiento se hizo con la version 0.6.1 de LeRobot. El modelo base fue preentrenado con tecnicas similares a las descritas en el paper arxiv:2506.01844, que enfatizan la eficiencia computacional frente a VLAs de mayor tamano como OpenVLA.

## Capacidades

- Generacion de acciones roboticas: el modelo predice acciones de 16 dimensiones (posiciones y orientaciones del efector) a partir de observaciones visuales y de estado.
- Manipulacion pick-and-place: especializado en la tarea de recoger un cubo rojo y colocarlo en una cesta azul.
- Vision multi-camara: procesa tres flujos visuales simultaneamente (frontal y dos camaras de muneca) para percepción estereoscopica.
- Control de robot de tipo `arecui_c1`: compatible con el hardware del fabricante coreano Arecui, integrado en LeRobot.
- Fine-tuning rapido: al partir de un modelo base preentrenado, se puede adaptar a nuevas tareas con pocos datos (100 episodios).
- Inferencia en tiempo real: al ser un modelo de 450M parametros, puede ejecutarse en GPUs de consumo con latencia baja.

## Casos de uso

- Automatizacion de tareas de pick-and-place en laboratorios de robotica: el modelo puede integrarse en un brazo robotico tipo `arecui_c1` para realizar tareas repetitivas de recogida y colocacion de objetos en entornos controlados.
- Prototipado rapido de politicas robotica: gracias a LeRobot, un investigador puede entrenar y desplegar este modelo en menos de un dia para validar una tarea nueva, sin necesidad de un dataset masivo.
- Educacion en robotica: el modelo sirve como ejemplo didactico de VLA en hardware de consumo, permitiendo a estudiantes de master ejecutar una politica de manipulacion con una GPU de gama media.
- Sistemas de inspeccion y clasificacion: aunque la tarea es especifica, la arquitectura puede adaptarse para clasificar objetos y colocarlos en contenedores distintos cambiando el dataset y la instruccion.
- Robotica asistencial en entornos domesticos: con la licencia Apache 2.0, una empresa puede desplegar este modelo en un robot de asistencia para tareas de recogida de objetos, manteniendo los costes de inferencia bajos.
- Benchmarking de VLAs compactos: el modelo sirve como punto de referencia para comparar la eficiencia de SmolVLA frente a otros VLA mas grandes en tareas de manipulacion reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de evaluacion en robot real ni simulacion. El paper de SmolVLA (arxiv:2506.01844) reporta resultados comparativos frente a otros VLAs, pero esos datos corresponden al modelo base, no a este fine-tune especifico.

## Requisitos de hardware

- VRAM estimada para inferencia: con 450M parametros en precision FP32, el modelo ocupa aproximadamente 1.8 GB en VRAM. Con cuantizacion de 8 bits, se reduce a unos 0.9 GB (el tamano del repo es de 0.9 GB, lo que sugiere pesos en FP16 o BF16).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (RTX 3060, RTX 4060, GTX 1660 Super) puede ejecutar la inferencia sin problemas. Para entrenamiento, se recomienda una GPU con 8-12 GB (RTX 3080, RTX 4070) para el batch size de 8.
- Compatibilidad con GPU de consumo: si, el modelo esta disenado para ello. SmolVLA se comercializa como "affordable and efficient" para hardware de consumer.
- Opciones de despliegue: LeRobot (CLI `lerobot-rollout`), con soporte para ejecucion en local via CUDA. No se menciona soporte para vLLM, llama.cpp o Ollama en la informacion, ya que el modelo es para robotica y no para generacion de texto.
- Latencia y throughput estimados: no disponibles en la informacion. Sin embargo, por el tamano del modelo, se espera una latencia de inferencia inferior a 100 ms en una RTX 3060 para una prediccion de accion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `1ys1/areumii-smolvla-pickplace-v3` | 450M | no disponible | Pick-and-place (cubo rojo en cesta azul) | Apache 2.0 | HuggingFace |
| `lerobot/smolvla_base` | 450M | no disponible | VLA general preentrenado | Apache 2.0 | HuggingFace |
| OpenVLA (modelo grande) | 7B | 4096 tokens | VLA general | MIT | HuggingFace |

La diferencia principal con el base es que este fine-tune esta especializado en una tarea concreta, por lo que su rendimiento en esa tarea sera superior al del base sin fine-tuning. Frente a OpenVLA, SmolVLA ofrece un coste computacional mucho menor (450M vs 7B), lo que permite inferencia en GPU consumer, aunque con una capacidad general menor.

## Limitaciones y advertencias

- Especializacion limitada: el modelo solo ha sido entrenado para la tarea "Pick red cube and place it on blue basket". Si se usa para otras tareas o con otros objetos, el rendimiento degrada significativamente.
- Dependencia del robot: la politica esta entrenada para el robot `arecui_c1` y sus camaras. Usarla en otro robot o con una configuracion de camaras distinta puede producir fallos.
- Sin evaluacion publicada: no hay resultados de exito en robot real, por lo que el rendimiento real es desconocido hasta que se ejecute.
- Dataset pequeno: 100 episodios pueden ser insuficientes para tareas con variabilidad alta (cambios de iluminacion, posiciones aleatorias de los objetos). La robustez del modelo es incierta.
- Riesgo de alucinacion de acciones: como cualquier VLA, puede producir acciones inconsistentes con la observacion si el contexto visual cambia bruscamente.
- Idiomas: el modelo usa instrucciones en ingles (la tarea esta definida en ingles). No se ha evaluado el uso con instrucciones en otros idiomas.
- Restriccion de uso: la licencia Apache 2.0 permite uso comercial, pero el modelo depende de LeRobot y de hardware especifico de Arecuit, lo que puede limitar su portabilidad.

## Enlaces

- Repositorio del modelo: https://huggingface.co/1ys1/areumii-smolvla-pickplace-v3
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/1ys1/areumii_pickplace-v3
- Paper de SmolVLA: https://arxiv.org/abs/2506.01844
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Sitio web oficial de SmolVLA: https://smolvla.net/index_en
