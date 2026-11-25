# CarolinePascal/grabette-red-cube-green-box-closed-pi05-25_step10000

## Resumen

Grabette-red-cube-green-box-closed-pi05-25_step10000 es una política de robótica de tipo Vision-Language-Action (VLA) obtenida mediante ajuste fino del modelo base `lerobot/pi05_base`, que a su vez implementa la arquitectura π₀.₅ (Pi05) publicada por Physical Intelligence. El modelo lo ha entrenado y publicado la usuaria CarolinePascal sobre el ecosistema LeRobot de Hugging Face, y su propósito es controlar un robot concreto (tipo `grabette`) para ejecutar una tarea de manipulación muy específica: colocar un cubo rojo dentro de una caja verde.

El modelo consume una imagen de cámara (`observation.images.cam0`, resolución 360x480) y un vector de estado de dos dimensiones (`observation.state`), y produce un vector de acción de 11 dimensiones. Cuenta con 4.143.404.816 parámetros totales en formato safetensors, aunque el repositorio ocupa 244,8 GB, lo que sugiere la presencia de múltiples checkpoints o artefactos de entrenamiento además de los pesos finales. El ajuste fino se realizó durante 10.000 pasos con un lote de 32, optimizador AdamW y tasa de aprendizaje 2,5e-5.

Su relevancia es acotada pero ilustrativa: demuestra el flujo completo de ajuste fino de un VLA de gran tamaño sobre un dataset de imitación muy pequeño (51 episodios, 13.798 fotogramas a 30 FPS) para una tarea de pick-and-place. No es un modelo de propósito general, sino una política especializada lista para desplegarse en el robot `grabette` mediante el comando `lerobot-rollout`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) π₀.₅ (Pi05), implementación LeRobot derivada de OpenPI |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | no disponible (modelo de robótica, no de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | lerobot/pi05_base |
| Tipo de robot | grabette |
| Entrada visual | observation.images.cam0, shape (3, 360, 480) |
| Entrada de estado | observation.state, shape (2,) |
| Salida de acción | action, shape (11,) |
| Pasos de entrenamiento | 10.000 |
| Tamaño de lote | 32 |
| Optimizador | AdamW |
| Tasa de aprendizaje | 2,5e-5 |
| Semilla | 1000 |
| Versión de LeRobot | 0.6.1 |
| Tamaño del repositorio | 244,8 GB |
| Descargas | 14 |
| Likes | 0 |

## Arquitectura y entrenamiento

El modelo se basa en π₀.₅ (Pi05), un VLA de Physical Intelligence diseñado para generalización en entornos abiertos y que evoluciona el modelo π₀. La implementación concreta procede del repositorio OpenPI de Physical Intelligence, adaptada por Hugging Face al framework LeRobot. La arquitectura combina un codificador visual, un modelo lingüístico y una cabeza de acción que emite comandos motores continuos; no se dispone de detalles adicionales sobre el número de capas, el mecanismo de atención o la composición exacta del backbone en la información proporcionada.

El ajuste fino se realizó por imitación supervisada sobre el dataset `local/red-cube-green-box-closed-norm_graspproj`, compuesto por 51 episodios y 13.798 fotogramas grabados a 30 FPS, todos ellos correspondientes a la tarea "put the red cube in the green box". El entrenamiento empleó 10.000 pasos, lote de 32, AdamW con tasa 2,5e-5 y semilla 1000, sobre LeRobot 0.6.1. No se documenta el uso de RLHF, DPO ni técnicas de refuerzo; se trata de aprendizaje por imitación puro. Tampoco se especifica el número de tokens multimodales ni innovaciones técnicas adicionales más allá de las propias de la arquitectura Pi05.

## Capacidades

- Control robótico de manipulación: genera acciones de 11 dimensiones para un robot `grabette` a partir de una imagen y un estado de dos dimensiones.
- Ejecución de una tarea concreta de pick-and-place: "put the red cube in the green box".
- Percepción visual monocámara: procesa imágenes de 360x480 píxeles procedentes de `cam0`.
- Condicionamiento por instrucción en lenguaje natural: la tarea se pasa como cadena de texto en el comando de rollout.
- Aprendizaje por imitación: reproduce comportamientos demostrados en el dataset de entrenamiento.
- Integración con LeRobot: compatible con `lerobot-rollout` y `lerobot-train`.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, capacidades multilingües, modo thinking, audio ni visión multi-cámara más allá de la cámara única declarada.

## Casos de uso

- Automatización de pick-and-place en laboratorio: desplegar la política en un robot `grabette` para colocar repetidamente un cubo rojo en una caja verde, usando `lerobot-rollout` con `--duration` para limitar la ejecución y validar la estabilidad del ajuste fino.
- Banco de pruebas de imitación con datasets pequeños: sirve como referencia de qué rendimiento cabe esperar al ajustar π₀.₅ con solo 51 episodios, útil para calibrar expectativas antes de invertir en grabaciones mayores.
- Docencia y formación en robótica: ejemplo didáctico de flujo completo LeRobot (grabación, normalización, entrenamiento, rollout) con una tarea visualmente verificable.
- Punto de partida para ajustes finos adicionales: al derivar de `lerobot/pi05_base` y estar bajo Apache 2.0, puede reentrenarse con `lerobot-train` sobre nuevos datasets de la misma tarea o de tareas relacionadas.
- Validación de infraestructura de inferencia robótica: permite comprobar la cadena cámara-robot-política en un entorno controlado antes de escalar a tareas más complejas.
- Reproducción de experimentos de VLA: al estar todos los hiperparámetros documentados (pasos, lote, LR, semilla), facilita la replicación y el estudio de la variabilidad del entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye explícitamente la frase "No evaluation results have been provided for this policy yet", por lo que no existen tasas de éxito medidas en robot real ni en simulación.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4.143.404.816 parámetros, en precisión de 16 bits los pesos ocupan aproximadamente 8,3 GB; en 32 bits, unos 16,6 GB. No se dispone de datos de cuantización publicados para esta política.
- GPU recomendadas: para inferencia en fp16 se requiere al menos una GPU con 12-16 GB de VRAM; una RTX 4090 (24 GB) o una A100 (40/80 GB) ofrecen margen suficiente. Para reentrenamiento con lote 32 se recomienda A100 o H100.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 4090, RTX 3090 y modelos con 16 GB o más en fp16; no confirmado por el autor.
- Opciones de despliegue: `lerobot-rollout` (estrategia base) y `lerobot-train` para reentrenamiento; el ecosistema LeRobot es el soporte oficial. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. La frecuencia de control del robot y los requisitos de tiempo real no se especifican en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| grabette-red-cube-green-box-closed-pi05-25_step10000 | 4.143.404.816 | VLA π₀.₅ ajustado | Pick-and-place específico | Apache 2.0 | Hugging Face (14 descargas) |
| lerobot/pi05_base | no disponible | VLA π₀.₅ base | Propósito general robótico | no disponible | Hugging Face |
| π₀ (Pi0) original de Physical Intelligence | no disponible | VLA | Propósito general robótico | no disponible | OpenPI |

La comparación cuantitativa con alternativas no es posible porque no hay benchmarks publicados ni especificaciones completas de los modelos de referencia en la información disponible.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada únicamente para la tarea "put the red cube in the green box" con un robot `grabette` y una cámara `cam0`; no generaliza a otras tareas, objetos, robots ni configuraciones de cámara.
- Sin evaluación publicada: no hay tasas de éxito medidas, por lo que se desconoce su fiabilidad real en producción.
- Dataset muy pequeño: 51 episodios y 13.798 fotogramas son insuficientes para garantizar robustez ante cambios de iluminación, posiciones de objetos o distracciones.
- Riesgo de sobreajuste: con 10.000 pasos sobre un dataset tan reducido, es probable que la política memorice las trayectorias de demostración y falle ante variaciones.
- Dependencia de normalización: el nombre del dataset incluye "norm_graspproj", lo que sugiere un pipeline de normalización específico que debe replicarse en inferencia.
- Sin datos de sesgo, alucinación o comportamiento fuera de distribución: no disponibles, aunque en robótica el fallo típico es la ejecución de acciones erráticas ante entradas novedosas.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el modelo base `lerobot/pi05_base` debe verificarse por separado, ya que su licencia no se detalla en la información disponible.
- Repositorio de 244,8 GB: el despliegue requiere descargar un volumen considerable, probablemente por checkpoints intermedios; conviene seleccionar solo los pesos finales.
- Idiomas: no aplica como modelo de texto; la instrucción de tarea se pasa en inglés en los ejemplos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CarolinePascal/grabette-red-cube-green-box-closed-pi05-25_step10000
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Blog de π₀.₅ (Pi05) de Physical Intelligence: https://www.physicalintelligence.company/blog/pi05
- Repositorio OpenPI: https://github.com/Physical-Intelligence/openpi
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de pi05 en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Dataset de entrenamiento: https://huggingface.co/datasets/local/red-cube-green-box-closed-norm_graspproj
- Visualizador de dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=local/red-cube-green-box-closed-norm_graspproj
