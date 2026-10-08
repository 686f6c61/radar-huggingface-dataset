# polarisai-robots/bento_ur7e_pi05_v4

## Resumen

bento_ur7e_pi05_v4 es una politica robotica de tipo Vision-Language-Action (VLA) publicada por polarisai-robots y afinada a partir del modelo base lerobot/pi05_base. Se corresponde con el modelo pi05 (π₀.₅) de Physical Intelligence, disenado para generalizacion en mundo abierto y adaptado a la libreria LeRobot desde el repositorio OpenPI. El modelo consume observaciones visuales y de estado del robot y produce comandos de accion de 7 dimensiones, por lo que no es un modelo de lenguaje general, sino una politica de control motor entrenada por imitacion.

El modelo tiene 4.143.404.816 parametros (aproximadamente 4,14 mil millones) y se distribuye en formato safetensors a traves de LeRobot, con un repositorio de 9,4 GB. Esta especializado en una tarea concreta: el empaquetado de fiambreras (lunchbox) con distintos alimentos, sobre un robot Universal Robots UR7e con tres camaras (base, muneca izquierda y muneca derecha) y un vector de estado de 32 dimensiones.

Su relevancia radica en que demuestra el flujo de trabajo de ajuste fino de un modelo fundacional VLA para un robot industrial concreto. La licencia Apache 2.0 y la integracion nativa con LeRobot facilitan su replicacion, si bien no se han publicado resultados de evaluacion y el numero de descargas y valoraciones publicas es de cero en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA), heredada de π₀ / π₀.₅ (detalles internos no disponibles) |
| Parametros totales | 4.143.404.816 (≈4,14 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos distribuidos en safetensors) |
| Idiomas soportados | no disponible (las tareas de entrenamiento estan redactadas en ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria LeRobot) |
| Modelo base | lerobot/pi05_base |
| Tipo de robot | ur7e (Universal Robots UR7e) |
| Camaras | base_0_rgb, left_wrist_0_rgb, right_wrist_0_rgb |
| Entrada de estado | observation.state, forma (32,) |
| Salida de accion | action, forma (7,) |
| Tamano del repositorio | 9,4 GB |
| Pipeline | robotics |

## Arquitectura y entrenamiento

El modelo pertenece a la familia π₀.₅ de Physical Intelligence, descrita como un modelo Vision-Language-Action construido sobre π₀ y orientado a la generalizacion en entornos no vistos durante el entrenamiento. La implementacion empleada aqui es la adaptacion de LeRobot, derivada del repositorio de codigo abierto OpenPI. La model card no detalla la arquitectura interna (tipo de backbone, mecanismo de atencion o estrategia de generacion de acciones), por lo que esos extremos se consideran no disponibles en la informacion proporcionada.

El ajuste fino se realizo sobre el dataset polarisai-robots/bento_ur7e_v2, compuesto por 498 episodios y 1.036.065 fotogramas grabados a 60 FPS. Las tareas cubiertas son tres variantes de empaquetado de fiambreras: dos piezas de pollo frito con dos de brocoli, dos filetes de pescado con tres salchichas, y empaquetado segun el color. La configuracion de entrenamiento registrada es de 40.000 pasos, tamano de lote 32, optimizador AdamW, tasa de aprendizaje 5e-05, semilla 1000 y LeRobot 0.6.0. No se documentan fases de RLHF o DPO, ni el numero total de tokens de entrenamiento del modelo base.

## Capacidades

- Control robotico por imitacion (imitation learning): genera secuencias de acciones de 7 grados de libertad a partir de observaciones visuales y de estado.
- Percepcion visual multi-camara: procesa tres flujos RGB de 224x224 (camara base y dos camaras de muneca).
- Condicionamiento por lenguaje: acepta una descripcion textual de la tarea como parte de la instruccion (por ejemplo, "Pack me a lunchbox...").
- Manipulacion de objetos y tareas de ensamblaje/packing de horizonte corto y medio sobre el robot UR7e.
- Especializacion en variantes de una misma tarea: empaquetado de fiambreras con distintas combinaciones de alimentos y criterio de seleccion por color.
- Ejecucion en bucle cerrado sobre robot real mediante el comando lerobot-rollout.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, vision general, audio ni modo "thinking".

## Casos de uso

- Empaquetado automatizado de fiambreras en linea de produccion alimentaria: el modelo ejecuta la secuencia de recogida y colocacion de alimentos en la caja segun la instruccion textual, usando las tres camaras para localizar los objetos.
- Replicacion de politicas en flotas de brazos UR7e: al estar basado en LeRobot y con licencia Apache 2.0, puede desplegarse en varias celdas con el mismo robot y configuracion de camaras.
- Ajuste fino sobre datos propios: sirve como punto de partida para entrenar variantes con lerobot-train sobre nuevos datasets, cambiando unicamente el repositorio de datos y el prompt de tarea.
- Seleccion de piezas por criterio visual: la variante "según su color" permite tareas de clasificacion y colocacion guiadas por atributos visuales.
- Investigacion en generalizacion VLA: util para estudiar como se comporta una politica afinada fuera de las posiciones y condiciones de entrenamiento, comparando con el modelo base pi05_base.
- Demostraciones y validacion de flujo de trabajo: permite a un equipo evaluar el pipeline completo de LeRobot (grabacion, calibracion, entrenamiento y rollout) antes de invertir en datos a mayor escala.
- Integracion en prototipos de celda robotica industrial con manipulacion de objetos deformables o apilables dentro del alcance de una sola estacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se han proporcionado resultados de evaluacion para esta politica ("No evaluation results have been provided for this policy yet."), por lo que no existe tabla de tareas, ensayos y tasas de exito sobre robot real.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en precision completa (32 bits) el modelo ronda los 16,6 GB; en bf16/fp16 se situa en torno a 8,3 GB. Estas cifras son estimaciones calculadas a partir del recuento de parametros y no aparecen en la model card.
- GPU recomendadas: no especificadas en la informacion disponible. Por tamano, una GPU con 16 GB o mas (por ejemplo RTX 4090, A100, H100) es suficiente para inferencia en bf16.
- Compatibilidad con GPU de consumo: previsiblemente si, en tarjetas con al menos 12-16 GB de VRAM; no se confirma oficialmente.
- Opciones de despliegue: LeRobot mediante el comando lerobot-rollout (estrategia base), sobre PyTorch y CUDA. No se menciona soporte de vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje y no a politicas roboticas.
- Latencia y throughput: no disponibles. El control se ejecuta en bucle cerrado sobre robot real y el dataset de entrenamiento se grabo a 60 FPS, pero no se publican cifras de frecuencia de inferencia efectiva.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bento_ur7e_pi05_v4 | 4,14 mil millones | no disponible | Ajuste fino sobre bento_ur7e_v2 (498 episodios) | Apache 2.0 | Hugging Face (0 descargas) |
| lerobot/pi05_base | no disponible | no disponible | Modelo base π₀.₅, preentrenado | no disponible en esta informacion | Hugging Face |
| polarisai-robots/bento_ur7e_v1_pi05 | no disponible | no disponible | Ajuste fino previo sobre el mismo robot | no disponible en esta informacion | Hugging Face |
| polarisai-robots/bento_ur7e_pi05_v2 | no disponible | no disponible | Ajuste fino previo sobre el mismo robot | no disponible en esta informacion | Hugging Face |

No se dispone de cifras de rendimiento comparadas entre estas variantes, por lo que la comparativa se limita a parametros, origen de entrenamiento y licencia.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay tasas de exito ni numero de ensayos, por lo que el rendimiento real de la politica es desconocido.
- Especializacion estrecha: entrenada sobre tres tareas concretas de empaquetado de fiambreras; no se puede esperar generalizacion a otras tareas de manipulacion fuera de ese dominio.
- Dependencia del montaje fisico: las camaras deben coincidir con las claves de observacion del entrenamiento (nombre, indice y resolucion) y el robot debe ser un UR7e correctamente calibrado; cualquier variacion puede degradar el comportamiento.
- Sesgos de datos: al proceder de un dataset propio y limitado (498 episodios), la politica hereda la distribucion de posiciones, iluminacion, objetos y estilo de demostracion de ese dataset.
- Riesgo de alucinacion de acciones: como toda politica de imitacion, puede generar comandos de movimiento inseguros ante situaciones fuera de distribucion; requiere supervisión y limites de seguridad en el robot.
- Idioma: las instrucciones de tarea estan en ingles y no se documenta soporte multilingue.
- Sin informe de seguridad ni de sesgos: la model card no incluye analisis de sesgos ni evaluaciones de robustez.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base lerobot/pi05_base y el metodo π₀.₅ pueden tener condiciones propias que conviene revisar.
- Repositorio sin adopcion publica: cero descargas y cero valoraciones, lo que limita la verificacion independiente del comportamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/polarisai-robots/bento_ur7e_pi05_v4
- Dataset de entrenamiento: https://huggingface.co/datasets/polarisai-robots/bento_ur7e_v2
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Variante previa: https://huggingface.co/polarisai-robots/bento_ur7e_v1_pi05
- Variante previa: https://huggingface.co/polarisai-robots/bento_ur7e_pi05_v2
- Blog de Physical Intelligence sobre π₀.₅: https://www.physicalintelligence.company/blog/pi05
- Paper π₀.₅ (arXiv): https://arxiv.org/abs/2504.16054
- Repositorio OpenPI: https://www.openpi.net/english.html
- Guia de pi05 en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Ficha de Pi0.5 en Qualcomm AI Hub: https://aihub.qualcomm.com/models/pi05
