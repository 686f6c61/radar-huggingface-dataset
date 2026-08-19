# onnzoo/act_cup_on_plate

## Resumen

El modelo `onnzoo/act_cup_on_plate` es una política de control robótico entrenada mediante aprendizaje por imitación con el método Action Chunking with Transformers (ACT), implementada en el framework LeRobot de Hugging Face. El modelo ha sido desarrollado por el usuario onnzoo y está especializado en la tarea de colocar una taza sobre un plato, utilizando un robot tipo `so_follower` con dos cámaras (muñeca y frontal). Con 51,7 millones de parámetros, es un modelo compacto diseñado para ejecutarse en tiempo real en hardware robótico.

Este modelo resuelve el problema de la manipulación robótica mediante la predicción de secuencias de acciones (action chunks) en lugar de pasos individuales, lo que mejora la estabilidad y precisión del movimiento. Su relevancia radica en que demuestra cómo un método de imitación relativamente sencillo puede lograr tasas de éxito altas en tareas de manipulación con datos teleoperados, y está publicado con licencia Apache 2.0, lo que facilita su uso y modificación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Action Chunking with Transformers, ACT) |
| Parametros totales | 51.668.614 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No aplica (modelo de robótica, no procesa texto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo se basa en ACT (Action Chunking with Transformers), una arquitectura de transformer encoder-decoder que recibe observaciones visuales y de estado del robot y predice un chunk de acciones futuras (una secuencia de vectores de acción) en lugar de una sola acción. Esto permite generar movimientos suaves y coherentes, reduciendo la acumulación de errores. La entrada está compuesta por dos imágenes RGB de 480x640 (cámara de muñeca y cámara frontal) y un vector de estado de 6 dimensiones (posición y orientación del efector final). La salida es un vector de acción de 6 dimensiones.

El entrenamiento se realizó con el dataset `onnzoo/cup_on_plate_20260819_172758`, que contiene 45 episodios teleoperados con un total de 29.678 frames a 30 FPS, todos correspondientes a la tarea "Place the cup on the plate". Se utilizó el optimizador AdamW con una tasa de aprendizaje de 1e-5, batch size de 8 y 10.000 pasos de entrenamiento, con semilla 1000 y la versión 0.6.2 de LeRobot. No se menciona el uso de RLHF ni DPO; es un entrenamiento puramente supervisado de imitación.

## Capacidades

- Control robótico de manipulación: genera trayectorias de 6 grados de libertad (posición y orientación) para el efector final.
- Aprendizaje por imitación: reproduce comportamientos teleoperados con alta fidelidad.
- Procesamiento visual: utiliza dos cámaras (muñeca y frontal) para percibir el entorno.
- Predicción de secuencias de acciones: produce chunks de acciones que mejoran la suavidad y estabilidad del movimiento.
- Integración con LeRobot: compatible con el ecosistema de entrenamiento y despliegue de LeRobot.
- No incluye capacidades de lenguaje, tool calling ni razonamiento simbólico; es exclusivamente una política motora.

## Casos de uso

- Automatización de tareas de pick-and-place en líneas de producción: el modelo puede integrarse en un robot colaborativo para colocar piezas (tazas) sobre plataformas (platos) de forma repetitiva, reduciendo el tiempo de ciclo.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar la transferencia de políticas entre robots o la robustez frente a variaciones de iluminación y posición.
- Prototipado rápido de tareas de manipulación: al ser un modelo pequeño y entrenado con solo 45 episodios, permite validar rápidamente si ACT es adecuado para una nueva tarea en un laboratorio.
- Teleoperación asistida: puede usarse como asistente en entornos donde un operador humano guía al robot y la política aprende a completar la tarea de forma autónoma.
- Educación en robótica: adecuado para cursos que enseñan aprendizaje por imitación con LeRobot, dado su tamaño reducido y facilidad de despliegue en hardware de bajo coste.
- Benchmarking de métodos de imitación: al estar disponible públicamente con licencia abierta, puede compararse con otras políticas (p. ej., Diffusion Policy) en la misma tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que no se han proporcionado resultados de evaluacion en robot real. No se dispone de datos de tasas de exito ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo con 51,7 millones de parametros, la inferencia puede ejecutarse en GPUs con 2-4 GB de VRAM en precision FP32, o incluso menos si se cuantiza (aunque no se ofrecen cuantizaciones oficiales).
- GPU recomendadas: cualquier GPU moderna de consumo (p. ej., NVIDIA RTX 3060, RTX 4060) o incluso CPU para inferencia en tiempo real, dado el bajo coste computacional.
- Compatibilidad con hardware de bajo coste: al ser un modelo pequeno, puede desplegarse en sistemas embebidos con aceleradores como NVIDIA Jetson.
- Opciones de despliegue: LeRobot proporciona scripts de rollout (`lerobot-rollout`) y soporta PyTorch. No se mencionan integraciones con vLLM, llama.cpp u otros motores de inferencia, ya que no es un modelo de lenguaje.
- Latencia y throughput: no se dispone de mediciones oficiales, pero dado el tamano del modelo y la resolucion de imagen (480x640), se espera una latencia de pocos milisegundos en GPU moderna, suficiente para control en tiempo real.

## Comparativa con modelos similares

No se dispone de informacion suficiente para una comparativa cuantitativa con otros modelos de la misma categoria. En el ecosistema LeRobot existen otras politicas como Diffusion Policy o ACT con distintos tamanos, pero no se han publicado resultados comparativos en este repositorio. Se puede indicar que, por su numero de parametros, este modelo es significativamente mas pequeno que los modelos de lenguaje tipicos, pero en el ambito de la robotica el tamano no es el unico factor determinante; la arquitectura y el dataset de entrenamiento son clave. No se incluyen datos de rendimiento relativos.

## Limitaciones y advertencias

- El modelo esta entrenado exclusivamente para la tarea "colocar una taza en un plato" con un robot `so_follower` especifico; no es generalizable a otras tareas u otros robots sin reentrenamiento.
- No se han proporcionado resultados de evaluacion en robot real, por lo que su tasa de exito real es desconocida.
- Depende de la configuracion de camaras (posicion, iluminacion) y del espacio de trabajo; cambios en el entorno pueden degradar el rendimiento.
- El dataset de entrenamiento es pequeno (45 episodios), lo que puede limitar la robustez frente a variaciones no vistas.
- No se especifican sesgos conocidos, pero al ser un modelo de imitacion puede reproducir sesgos presentes en las demostraciones teleoperadas.
- Riesgo de alucinacion no aplica en el sentido clasico (no genera texto), pero puede producir acciones incorrectas si las observaciones difieren mucho del entrenamiento.
- Licencia Apache 2.0 permite uso comercial y modificacion, pero se recomienda verificar la compatibilidad con los componentes de terceros (p. ej., el dataset, que no tiene licencia explicita en la informacion disponible).

## Enlaces

- Repositorio del modelo: https://huggingface.co/onnzoo/act_cup_on_plate
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Dataset de entrenamiento: https://huggingface.co/datasets/onnzoo/cup_on_plate_20260819_172758
- LeRobot (framework): https://github.com/huggingface/lerobot
- Documentacion de LeRobot para ACT: https://huggingface.co/docs/lerobot/main/en/act
