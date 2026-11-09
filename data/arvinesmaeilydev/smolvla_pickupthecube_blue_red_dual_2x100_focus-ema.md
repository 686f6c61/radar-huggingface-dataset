# arvinesmaeilydev/smolvla_PickUpTheCube_Blue_Red_Dual_2x100_Focus-ema

## Resumen

SmolVLA es un modelo compacto de visión-lenguaje-acción (VLA) desarrollado por Hugging Face dentro del ecosistema LeRobot, diseñado para controlar robots mediante imitación a partir de observaciones visuales y del estado de las articulaciones. Esta ficha concreta es un fine-tuning del modelo base `lerobot/smolvla_base` sobre un dataset propio del autor `arvinesmaeilydev`, orientado a una tarea de manipulación muy específica: recoger un cubo azul o rojo con un robot SO-100/SO-101 (tipo `so_follower`) equipado con tres cámaras.

El modelo resuelve el problema de llevar políticas VLA a hardware de consumo: con 450 millones de parámetros y un repositorio de 0,9 GB, puede ejecutarse en una GPU de gama media o incluso en CPU para inferencia de baja frecuencia, a diferencia de los VLA de gran escala que requieren clústeres. La relevancia actual radica en que demuestra el flujo completo de LeRobot: grabar un dataset con 200 episodios y 85.682 fotogramas, fine-tunear el modelo base y desplegar la política resultante con un único comando `lerobot-rollout`.

Es importante subrayar que se trata de una política de imitación especializada, no de un modelo de propósito general: las acciones de salida son un vector de 6 dimensiones y las entradas son tres imágenes de 256x256 más un vector de estado de 6 dimensiones. No hay resultados de evaluación publicados en la model card, por lo que su rendimiento real en el robot debe validarse empíricamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) compacta, fine-tuning de SmolVLA (paper arXiv:2506.01844) |
| Parametros totales | 450.046.176 (450 M) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el repo no documenta variantes GGUF/INT8) |
| Idiomas soportados | no disponible (modelo orientado a instrucciones de tarea en ingles: "pick up the blue cube", "pick up the red cube") |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria `lerobot`, version 0.6.2) |

## Arquitectura y entrenamiento

SmolVLA es una política VLA que combina un codificador visual y de lenguaje con un cabezal de acciones, entrenada para imitación conductual (behavior cloning) sobre demostraciones de robot. El modelo base `lerobot/smolvla_base` se preentrena con datos de múltiples robots y tareas, y este fine-tuning lo adapta a un robot concreto (`so_follower`) con tres cámaras (`top`, `wrist` y una tercera cámara no nombrada en la model card, mapeada como `camera1`, `camera2`, `camera3`). La entrada es un estado de 6 dimensiones más tres imágenes RGB de 3x256x256; la salida es un vector de acción de 6 dimensiones.

El entrenamiento se realizó con LeRobot 0.6.2 durante 20.000 pasos, batch de 32, optimizador AdamW, learning rate 1e-4 y semilla 1000, sobre el dataset `PickUpTheCube_Blue_Red_Dual_2x100` (200 episodios, 85.682 fotogramas a 30 FPS, dos tareas: recoger el cubo azul y recoger el cubo rojo). El sufijo `Focus-ema` del nombre sugiere un ajuste fino con media móvil exponencial de pesos y posiblemente un enfoque de entrenamiento centrado en ciertas fases de la tarea, pero la model card no documenta estos detalles, por lo que no puede confirmarse. No se especifica el número de tokens de entrenamiento ni si hubo RLHF/DPO; en robótica de imitación es habitual no usar RLHF.

## Capacidades

- Control robótico por imitación: genera acciones de 6 grados de libertad a partir de observaciones visuales y de estado articular.
- Percepción visual multi-cámara: procesa tres flujos de imagen de 256x256 píxeles de forma simultánea.
- Condicionamiento por instrucción de tarea en lenguaje natural: distingue entre "pick up the blue cube" y "pick up the red cube".
- Ejecución en bucle cerrado a 30 FPS sobre el robot, con política desplegable mediante `lerobot-rollout`.
- Integración con el ecosistema LeRobot: entrenamiento, evaluación y despliegue con las herramientas `lerobot-train` y `lerobot-rollout`.
- No soporta tool calling, function calling, agentes multi-paso, visión general, audio ni modo de razonamiento extendido: es una política de acción, no un asistente conversacional.

## Casos de uso

- Recogida de cubos en laboratorio: el caso canónico del modelo. Se lanza `lerobot-rollout` con la tarea "pick up the blue cube" o "pick up the red cube" y el robot SO-100 ejecuta la política durante 60 segundos; es adecuado porque el modelo fue entrenado exactamente sobre esas dos instrucciones y ese robot.
- Generación de datos sintéticos para aumentar el dataset: ejecutar la política en el robot y grabar los episodios resultantes permite ampliar el dataset original de 200 episodios con variaciones de posición, iluminación o distracciones, útil para reentrenar con más cobertura.
- Benchmark de referencia para nuevas políticas: al ser un fine-tuning reproducible (semilla 1000, hiperparámetros documentados), sirve como línea base para comparar variantes de SmolVLA u otras políticas de imitación en la misma tarea.
- Docencia y formación en robótica de imitación: el flujo completo (grabar dataset, visualizarlo en el Space de LeRobot, entrenar y desplegar) es un ejercicio didáctico cerrado y de bajo coste computacional.
- Prueba de concepto de VLA en hardware de consumo: con 450 M de parámetros y 0,9 GB de pesos, permite validar la viabilidad de un pipeline VLA en una estación de trabajo con GPU de gama media antes de invertir en modelos mayores.
- Investigación en robustez visual: al tener tres cámaras y dos objetos de colores distintos, permite estudiar cómo afectan cambios de iluminación, oclusiones o posiciones de cámara a la tasa de éxito, aunque la model card no publique dicha tasa.
- Despliegue embebido experimental: el tamaño reducido abre la puerta a probar inferencia en dispositivos tipo Jetson, aunque no hay datos publicados de latencia ni throughput que lo confirmen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una sección de evaluación vacía con la nota explícita: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito en robot real, ni de comparaciones numéricas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 450 M de parámetros en safetensors (0,9 GB de repo), la inferencia en precisión nativa requiere del orden de 1-2 GB de memoria, más el coste de procesar tres imágenes de 256x256 por paso.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cualquier GPU con al menos 4-8 GB de VRAM debería poder ejecutar la política; una RTX 3060/4060 o superior es un punto de partida razonable, aunque no hay confirmación empírica.
- Cabe en GPU de consumo: sí, previsiblemente, dado el tamaño del modelo; no hay lista oficial de GPU validadas.
- Opciones de despliegue: `lerobot-rollout` (CLI oficial de LeRobot) es el método documentado; el modelo se carga vía `--policy.path`. No se documentan opciones con vLLM, llama.cpp, Ollama ni TGI, que además no son adecuadas para políticas de acción.
- Latencia y throughput: no disponibles. El dataset se grabó a 30 FPS, lo que sugiere que la política debe ejecutarse al menos a esa frecuencia para un control fluido, pero no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| smolvla_PickUpTheCube_Blue_Red_Dual_2x100_Focus-ema | 450 M | no disponible | Manipulacion de cubos con SO-100, 3 camaras | apache-2.0 | Hugging Face (0 descargas) |
| lerobot/smolvla_base | no disponible en la informacion | no disponible | VLA base preentrenada, fine-tuneable | no disponible en la informacion | Hugging Face |
| Otras politicas LeRobot (ACT, Diffusion Policy) | no disponible en la informacion | no disponible | Imitacion conductual generica | no disponible en la informacion | Hugging Face / LeRobot |

No se dispone de datos suficientes para comparar rendimiento numerico con alternativas; la comparativa se limita a tamano, licencia y disponibilidad.

## Limitaciones y advertencias

- Especializacion extrema: solo maneja las tareas "pick up the blue cube" y "pick up the red cube" con el robot `so_follower` y la configuracion de tres camaras del dataset; fuera de ese dominio su comportamiento es impredecible.
- Sin evaluacion publicada: no hay tasa de exito ni numero de ensayos, por lo que no puede afirmarse que la politica funcione de forma fiable en produccion.
- Dependencia de la configuracion de camaras: los nombres e indices de camara deben coincidir exactamente con las claves de observacion del entrenamiento; un cambio de montaje o de calibracion invalida la politica.
- Riesgo de sobreajuste al dataset: 200 episodios y 20.000 pasos de entrenamiento con un modelo de 450 M pueden producir sobreajuste a posiciones, iluminacion y objetos concretos; no se documentan aumentos de datos ni variaciones.
- Sesgos: no documentados, pero al entrenarse solo con cubos azul y rojo, el modelo puede fallar ante objetos de otros colores, formas o tamanos.
- Alucinacion en el sentido de acciones erroneas: como politica de control, puede generar trayectorias inseguras; se recomienda supervisar el robot y disponer de parada de emergencia.
- Licencia apache-2.0: permite uso comercial y modificacion, pero el autor no ofrece garantias ni soporte; el modelo base y el paper subyacente deben citarse segun corresponda.
- Idiomas: las instrucciones de tarea estan en ingles; no hay evidencia de que acepte instrucciones en castellano.
- Fecha de creacion futura (2026-11-09): dato tal como aparece en el repositorio, sin verificacion adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/arvinesmaeilydev/smolvla_PickUpTheCube_Blue_Red_Dual_2x100_Focus-ema
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/arvinesmaeilydev/PickUpTheCube_Blue_Red_Dual_2x100
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=arvinesmaeilydev/PickUpTheCube_Blue_Red_Dual_2x100
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
