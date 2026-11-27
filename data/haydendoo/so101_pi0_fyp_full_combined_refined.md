# haydendoo/so101_pi0_fyp_full_combined_refined

## Resumen

`haydendoo/so101_pi0_fyp_full_combined_refined` es un fine-tuning del modelo fundacional de robotica π₀ (Pi0) de Physical Intelligence, adaptado a un brazo robotico concreto (tipo SO-101) mediante la libreria LeRobot de Hugging Face. El modelo original π₀ es una politica generalista Vision-Language-Action (VLA): recibe imagenes de camara junto con una instruccion en lenguaje natural y emite directamente comandos de accion para el robot. Este checkpoint concreto ha sido entrenado por el usuario `haydendoo` sobre un dataset propio de 105 episodios y 28.209 frames grabados a 30 FPS, centrado en tareas de picking and placing de bloques de colores en una bandeja.

El modelo tiene 4.028.019.472 parametros (aproximadamente 4.000 millones) y se distribuye en formato safetensors con un tamano de repositorio de 8,9 GB, lo que sugiere pesos en precision bf16/fp16. La licencia es Apache 2.0, heredada del modelo base, lo que permite uso comercial sin restricciones adicionales. Se publico el 27 de noviembre de 2026 y, en el momento de redactar esta ficha, no registra descargas ni likes, lo que indica que es un experimento academico o de proyecto fin de grado (el nombre del dataset, `fyp-full-combined-refined`, sugiere "final year project") mas que un modelo de produccion.

Su relevancia radica en que ejemplifica el flujo actual de trabajo en robotica con modelos fundacionales: partir de un VLA preentrenado a gran escala y especializarlo con pocos datos (105 episodios) para una tarea y un hardware concretos. Es un caso practico de imitacion de bajo coste sobre un robot de tipo SO-101, una plataforma de codigo abierto y bajo presupuesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀ (Pi0) de Physical Intelligence; implementacion LeRobot sobre OpenPI |
| Parametros totales | 4.028.019.472 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; se asume bf16/fp16 por el tamano del repo) |
| Idiomas soportados | no disponible (las instrucciones del dataset estan en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base π₀ es una politica VLA que combina un backbone de vision-lenguaje con un generador de acciones. La implementacion utilizada aqui es la de LeRobot, adaptada del repositorio OpenPI de Physical Intelligence. La politica consume tres entradas: el estado del robot (`observation.state`, vector de 6 dimensiones), dos imagenes de camara (`observation.images.front` y `observation.images.wrist`, ambas de 3x480x640) y una instruccion de tarea en lenguaje natural; produce como salida un vector de accion de 6 dimensiones. La arquitectura interna detallada (capas, atencion, flujo de difusion de acciones) no se especifica en la model card mas alla de la referencia a π₀.

El fine-tuning se realizo sobre el dataset `haydendoo/fyp-full-combined-refined` (105 episodios, 28.209 frames, 30 FPS), con tareas de recogida y colocacion de bloques azul, verde y rojo en una bandeja, expresadas con 15 variantes linguisticas distintas de la misma instruccion. La configuracion de entrenamiento fue de 80.000 pasos, batch de 16, optimizador AdamW, learning rate 2,5e-05 y semilla 1000, usando LeRobot 0.6.1. No se documenta el uso de RLHF, DPO ni tecnicas de decodificacion especulativa; se trata de aprendizaje por imitacion supervisado clasico.

## Capacidades

- Control robotico de extremo a extremo: mapea directamente imagenes y estado del robot a comandos de accion de 6 grados de libertad.
- Comprension de instrucciones en lenguaje natural: acepta ordenes como "Pick up the blue block and place it in the tray" y las ejecuta.
- Percepcion visual multi-camara: fusiona una vista frontal y una vista de muneca para localizar objetos.
- Manipulacion pick-and-place: tarea especifica de agarre y deposito de bloques de colores (azul, verde, rojo) en una bandeja.
- Robustez a variaciones linguisticas: entrenado con 15 formulaciones distintas de la misma tarea.
- Imitacion de politicas: capacidad generica de aprendizaje por imitacion heredada del modelo base π₀.
- No dispone de tool calling, function calling, razonamiento multi-paso textual ni capacidades de audio o dialogo general; es un modelo de accion, no un asistente conversacional.

## Casos de uso

- Automatizacion de pick-and-place en laboratorio: el modelo ejecuta la secuencia de agarre y deposito de bloques sobre el brazo SO-101, adecuado para prototipos de investigacion en manipulacion.
- Base para proyectos de aprendizaje por imitacion: sirve como punto de partida para que otros equipos fine-tuneen π₀ sobre sus propios datasets con LeRobot, gracias a la licencia Apache 2.0 y al flujo documentado.
- Clasificacion y separacion de objetos por color: las tareas entrenadas cubren bloques azul, verde y rojo, lo que permite montar una celula de seleccion por color en una bandeja.
- Validacion de pipelines de robotica de codigo abierto: util para probar la integracion LeRobot + SO-101 + π₀ de extremo a extremo (grabacion, entrenamiento, rollout) en entornos academicos.
- Demostraciones educativas de VLA: permite ilustrar en clase o en un blog como un modelo fundacional de robotica se especializa con pocos datos.
- Benchmark interno de hardware de bajo coste: al ser un modelo de ~4.000 millones de parametros, sirve para medir latencia y viabilidad de inferencia en GPUs de consumo dentro de un bucle de control robotico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una seccion de evaluacion vacia (con una plantilla de tabla de exitos por tarea sin rellenar), por lo que no hay tasas de exito ni comparaciones numericas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4.028 millones de parametros, en bf16/fp16 se requieren aproximadamente 8 GB solo para pesos; en la practica, sumando activaciones y buffers de vision, se recomienda al menos 12-16 GB de VRAM.
- Cuantizacion: no se documentan pesos cuantizados; habria que generarlos manualmente (por ejemplo, a int8 o int4) para reducir requisitos, a costa de posible perdida de precision en las acciones.
- GPU recomendadas: NVIDIA A100 o H100 para entrenamiento y despliegue de referencia; RTX 4090 (24 GB) como opcion de gama alta para consumidor.
- Cabe en GPU de consumo: si, en modelos con 16 GB o mas (RTX 4080, 4090, A5000); en GPUs de 8-12 GB puede requerir cuantizacion.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--strategy.type=base`), que es el flujo documentado; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no estan pensados para politicas VLA de robotica.
- Latencia y throughput: no disponibles. Al ser un bucle de control a 30 FPS, la latencia de inferencia es critica, pero no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| so101_pi0_fyp_full_combined_refined | 4.028 M | no disponible | Pick-and-place SO-101 | Apache 2.0 | Hugging Face |
| lerobot/pi0_base | no disponible en la informacion | no disponible | VLA generalista | Apache 2.0 | Hugging Face |
| π₀ original (Physical Intelligence) | no disponible en la informacion | no disponible | VLA generalista multi-robot | no disponible en la informacion | Blog/repo OpenPI |

No se dispone de datos suficientes para comparar rendimiento numerico con alternativas como OpenVLA, RT-2 u otras politicas VLA; la informacion proporcionada no incluye benchmarks ni especificaciones de esos modelos.

## Limitaciones y advertencias

- Especializacion estrecha: solo se ha entrenado para tres objetos (bloques azul, verde y rojo) y una tarea de colocacion en bandeja; no generaliza a otros objetos, tareas o entornos sin reentrenamiento.
- Dataset pequeno: 105 episodios y 28.209 frames son insuficientes para una robustez alta; es probable que el modelo sea sensible a cambios de iluminacion, posicion de camara o disposicion de objetos.
- Sin evaluacion publicada: no hay tasas de exito en robot real, por lo que se desconoce su fiabilidad en produccion.
- Dependencia de hardware concreto: las entradas estan fijadas a un brazo SO-101 con camaras frontal y de muneca a 480x640; usar otro robot o camaras requiere reentrenar.
- Idiomas: las instrucciones de entrenamiento estan en ingles; no se documenta soporte multilingue.
- Riesgo de alucinacion de acciones: como toda politica de imitacion, puede generar trayectorias no validas o inseguras fuera de la distribucion de entrenamiento; se recomienda supervision humana y limites de seguridad fisicos.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias ni soporte; el modelo base π₀ y sus terminos deben verificarse por separado si se usa comercialmente.
- Cero traccion en el Hub (0 descargas, 0 likes): no hay evidencia de uso comunitario ni de validacion independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/haydendoo/so101_pi0_fyp_full_combined_refined
- Dataset de entrenamiento: https://huggingface.co/datasets/haydendoo/fyp-full-combined-refined
- Modelo base: https://huggingface.co/lerobot/pi0_base
- Blog de π₀ (Physical Intelligence): https://www.physicalintelligence.company/blog/pi0
- Repositorio OpenPI: https://github.com/Physical-Intelligence/openpi
- LeRobot (GitHub): https://github.com/huggingface/lerobot
- Guia de π₀ en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi0
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Documentacion de rollout/inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=haydendoo/fyp-full-combined-refined
