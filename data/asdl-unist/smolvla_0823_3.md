# asdl-unist/smolvla_0823_3

## Resumen

El modelo `asdl-unist/smolvla_0823_3` es un ajuste fino (fine-tuning) del modelo base `lerobot/smolvla_base`, desarrollado por el grupo asdl-unist. SmolVLA es un modelo de visión-lenguaje-acción (VLA) compacto y eficiente, diseñado para control robótico con coste computacional reducido y capaz de ejecutarse en hardware de consumo. Este checkpoint concreto se ha entrenado con el framework LeRobot sobre un dataset propio de demostraciones de manipulación, con el objetivo de especializar el modelo en tareas concretas de apilado y colocación de objetos.

El modelo tiene 450 millones de parámetros y se distribuye en formato safetensors, con un tamaño de repositorio de 1,2 GB. Está pensado para ser desplegado en robots con cámara superior y cámara en la muñeca, y consume observaciones de estado (6 dimensiones) e imágenes de 480x640 píxeles para producir acciones de 6 dimensiones. Su relevancia radica en que demuestra cómo un VLA de tamaño reducido puede adaptarse a tareas específicas mediante aprendizaje por imitación, sin necesidad de infraestructura de alto rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) basada en SmolVLA, detalles internos no disponibles |
| Parametros totales | 450.046.176 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (instrucciones en ingles en el dataset) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo de vision-lenguaje-accion que combina un codificador visual, un modelo de lenguaje y una cabeza de accion para generar comandos motores a partir de observaciones visuales y textuales. El paper original (arXiv:2506.01844) describe una arquitectura compacta y eficiente, aunque los detalles especificos de capas, atencion o tokenizacion no se detallan en la informacion proporcionada. Este checkpoint parte del modelo base `lerobot/smolvla_base` y se ha ajustado mediante aprendizaje por imitacion supervisado.

El entrenamiento se realizo con el framework LeRobot (version 0.6.1) sobre el dataset `asdl-unist/TRAIN_T3_ER_FINAL`, que contiene 70 episodios y 17.665 frames a 30 FPS, con cuatro tareas de manipulacion: apilar un vaso de papel sobre otro, colocar un vaso verde en un bol verde, poner una zanahoria en una cesta y colocar un vaso azul en un bol azul. La configuracion de entrenamiento incluye 8.000 pasos, batch size de 16, optimizador AdamW, learning rate de 0,0001 y semilla 1000. No se menciona el uso de RLHF, DPO ni otras tecnicas de refinamiento posterior.

## Capacidades

- Control robotico de 6 grados de libertad (accion de 6 dimensiones) a partir de imagenes de camara superior y de muñeca, junto con el estado del robot.
- Ejecucion de tareas de manipulacion especificas aprendidas por imitacion: apilado de vasos, colocacion de objetos en contenedores y traslado de piezas a cestas.
- Comprension de instrucciones en lenguaje natural (en ingles) para seleccionar la tarea a ejecutar.
- Inferencia en tiempo real a 30 FPS, adecuada para control de robots en bucle cerrado.
- Capacidad de despliegue en hardware de consumo, segun las caracteristicas del modelo SmolVLA.
- Integracion nativa con el ecosistema LeRobot para entrenamiento, evaluacion y despliegue.

## Casos de uso

- Automatizacion de tareas de picking y placing en lineas de montaje: el modelo puede recibir ordenes como "coloca el vaso verde en el bol verde" y ejecutar la manipulacion correspondiente usando las camaras del robot.
- Investigacion en aprendizaje por imitacion: sirve como punto de partida para estudiar la transferencia de politicas VLA a nuevas tareas con pocos episodios de demostracion.
- Prototipado rapido de celdas roboticas en laboratorios: al ser un modelo compacto, puede ejecutarse en estaciones de trabajo con GPU de gama media, reduciendo el coste de experimentacion.
- Robotica educativa: permite a estudiantes y desarrolladores experimentar con control VLA sin necesidad de clusters de GPU, usando el flujo de trabajo de LeRobot.
- Evaluacion de generalizacion en entornos controlados: el dataset de entrenamiento incluye variaciones de objetos y posiciones, lo que permite probar la robustez del modelo ante cambios menores en el escenario.
- Despliegue en robots colaborativos de bajo coste: el robot objetivo es de tipo `so_follower`, un seguidor de bajo coste, lo que facilita la replicacion del sistema en entornos con presupuesto limitado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se han proporcionado resultados de evaluacion para esta politica. No se dispone de datos de exito en tareas reales ni comparaciones con otros modelos.

## Requisitos de hardware

- No se proporcionan requisitos especificos de VRAM en la informacion disponible.
- Dado el tamano del modelo (450 millones de parametros), se estima que puede ejecutarse en GPUs de consumo con al menos 8 GB de VRAM, aunque no hay confirmacion oficial.
- El paper de SmolVLA menciona que el modelo esta disenado para hardware de consumo, lo que sugiere compatibilidad con GPUs como RTX 3060, RTX 4060 o superiores.
- El despliegue se realiza mediante el framework LeRobot, que soporta inferencia en GPU con PyTorch. No se mencionan opciones como vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje generativo.
- La latencia y el throughput no estan documentados, pero la tasa de 30 FPS del dataset sugiere que la inferencia debe completarse en menos de 33 ms por paso.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos VLA en la informacion proporcionada. Se puede mencionar que SmolVLA se presenta como una alternativa compacta a modelos VLA mas grandes como OpenVLA o RT-2, pero no hay cifras concretas de rendimiento ni de parametros para estos ultimos en las fuentes consultadas. La comparativa queda pendiente de datos publicados.

## Limitaciones y advertencias

- El modelo se ha entrenado con un dataset reducido (70 episodios) y para cuatro tareas muy concretas; su generalizacion a otras tareas u objetos no esta garantizada.
- No se han publicado resultados de evaluacion en robot real, por lo que el rendimiento efectivo en entornos no controlados es desconocido.
- Las instrucciones estan en ingles y el modelo no ha sido evaluado en otros idiomas; no se dispone de informacion sobre su capacidad multilingue.
- Al ser un ajuste fino de un modelo base, puede heredar sesgos o limitaciones del modelo original, aunque no se documentan sesgos especificos.
- La licencia Apache 2.0 permite uso comercial, pero el modelo depende del ecosistema LeRobot y de los datos de entrenamiento, que pueden tener restricciones adicionales no especificadas.
- No se proporcionan detalles sobre la arquitectura interna, lo que dificulta la depuracion o la interpretacion de sus decisiones.
- El robot objetivo es de tipo `so_follower`; el modelo puede no ser directamente compatible con otros robots sin reentrenamiento.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/asdl-unist/smolvla_0823_3
- Paper SmolVLA: https://arxiv.org/abs/2506.01844
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/asdl-unist/TRAIN_T3_ER_FINAL
- Framework LeRobot: https://github.com/huggingface/lerobot
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Repositorio de ejemplo con SmolVLA: https://github.com/zyqdragon/lerobot_smolvla
