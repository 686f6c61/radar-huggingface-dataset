# HyeonseokE/smolvla_open_box_cap_1000_10fps

## Resumen

SmolVLA es un modelo de visión-lenguaje-acción (VLA) compacto y eficiente, diseñado para control robótico por imitación. Este repositorio concreto, `HyeonseokE/smolvla_open_box_cap_1000_10fps`, es un fine-tune del modelo base `lerobot/smolvla_base` (publicado por el equipo de LeRobot) sobre un dataset propio de 100 episodios que captura la tarea de abrir una caja moviendo la tapa hasta un marcador objetivo. El modelo ha sido entrenado con la librería LeRobot y está pensado para desplegarse en robots tipo SO-101 con dos cámaras (superior y muñeca izquierda).

Con 450 millones de parámetros, este modelo es significativamente más pequeño que otros VLA como OpenVLA (7B), lo que permite su ejecución en hardware de consumo. Su relevancia radica en demostrar que es posible adaptar un VLA preentrenado a una tarea específica con pocos datos (100 episodios) y obtener un policy funcional, abriendo la puerta a la robótica de bajo coste y a la investigación reproducible. El modelo se distribuye bajo licencia Apache-2.0 y los pesos están en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en SmolVLA |
| Parametros totales | 450.046.176 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de control, no de texto) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizacion declarada) |
| Idiomas soportados | no disponible (el VLM base podria tener capacidades multilingues, pero no se especifica) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo de vision-lenguaje-accion que parte de un VLM preentrenado y lo adapta para generar comandos de control robotico. La arquitectura exacta (numero de capas, dimensiones ocultas, tipo de atencion) no se detalla en la informacion disponible, pero el paper original (arxiv:2506.01844) describe un diseno compacto y eficiente pensado para hardware de consumo. Este fine-tune se ha entrenado sobre el modelo base `lerobot/smolvla_base` utilizando el dataset `HyeonseokE/open_box_cap_10fps`, que contiene 100 episodios y 28.973 frames a 10 FPS. El entrenamiento se realizo con LeRobot version 0.5.1, optimizador AdamW, tasa de aprendizaje 0.0001, batch size 64 y 22.636 pasos. No se menciona el uso de RLHF ni DPO; se trata de un aprendizaje por imitacion supervisado.

## Capacidades

- Control robotico por imitacion: genera acciones de 6 dimensiones (posicion y orientacion del efector) a partir de observaciones visuales y del estado del robot.
- Percepcion visual multi-camara: procesa imagenes de hasta tres camaras (aunque el robot declarado usa dos: `top` y `left_wrist`), cada una de 256x256 píxeles.
- Integracion con LeRobot: compatible con el ecosistema LeRobot para entrenamiento, evaluacion y despliegue en robots reales.
- No incluye tool calling, agentes conversacionales ni generacion de texto libre; su unica salida es el vector de accion.
- Capacidades multilingues no declaradas; el modelo no esta disenado para interaccion en lenguaje natural.

## Casos de uso

- Automatizacion de tareas de manipulacion en entornos controlados: el modelo puede ejecutar la tarea especifica de abrir una caja moviendo la tapa a un marcador, util en lineas de montaje o laboratorios de robotica.
- Investigacion en aprendizaje por imitacion: sirve como ejemplo de fine-tuning de un VLA con pocos datos, permitiendo estudiar la transferencia de habilidades y la generalizacion.
- Pruebas de concepto en robotica de bajo coste: al ser compacto, puede desplegarse en GPUs de consumo, facilitando experimentos en laboratorios con presupuesto limitado.
- Base para fine-tuning en tareas similares: dado que es un modelo preentrenado, se puede adaptar a otras tareas de manipulacion con datasets adicionales.
- Educacion y formacion: util para ensenar conceptos de VLA, aprendizaje por imitacion y robotica en cursos universitarios.
- Evaluacion de politicas en simulacion: aunque no se proporcionan resultados, el modelo puede ejecutarse en entornos simulados compatibles con LeRobot para validar su comportamiento antes del despliegue real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no hay resultados de evaluacion para este policy.

## Requisitos de hardware

- VRAM estimada: con 450M parametros, en FP16 los pesos ocupan aproximadamente 0.9 GB. Para inferencia, considerando activaciones y overhead, se estima un consumo de 2-4 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como NVIDIA GTX 1650, RTX 3050, RTX 3060, o superiores. Tambien puede ejecutarse en CPU para pruebas lentas.
- Compatibilidad con hardware de consumo: si, el paper de SmolVLA destaca su capacidad para desplegarse en hardware de consumo.
- Opciones de despliegue: el modelo se ejecuta mediante LeRobot, que utiliza PyTorch. No es compatible con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje generativo.
- Latencia y throughput: no disponibles; dependen del hardware y de la configuracion de las camaras.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos. Sin embargo, se puede contextualizar: SmolVLA (450M) es mucho mas pequeno que OpenVLA (7B) y que otros VLA como RT-2 (55B). Esta reduccion de tamano implica menor coste computacional y mayor accesibilidad, aunque probablemente con menor capacidad de generalizacion. No hay datos publicos de benchmarks que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Especializacion extrema: el modelo esta entrenado para una tarea unica (abrir una caja) y no generaliza a otras tareas sin fine-tuning adicional.
- Dependencia del entorno: el rendimiento puede degradarse con cambios en la iluminacion, posicion de objetos o variaciones del robot.
- Sin evaluacion publica: no hay resultados de exito en robot real, por lo que su fiabilidad en produccion no esta verificada.
- Sesgos y alucinaciones: al ser un modelo de control, no genera texto, pero puede producir acciones incorrectas si las observaciones difieren del dataset de entrenamiento.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero se debe mantener la atribucion y no se otorgan garantias.
- Requisitos de calibracion: el robot y las camaras deben estar calibrados segun las especificaciones del dataset (posiciones, angulos, etc.) para que el modelo funcione correctamente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/HyeonseokE/smolvla_open_box_cap_1000_10fps
- Paper SmolVLA: https://arxiv.org/abs/2506.01844
- Dataset de entrenamiento: https://huggingface.co/datasets/HyeonseokE/open_box_cap_10fps
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
