# CamilleWalters/pi0-marker-v1

## Resumen

El modelo `CamilleWalters/pi0-marker-v1` es un fine-tune del modelo base `lerobot/pi0_base`, un Vision-Language-Action (VLA) desarrollado por Physical Intelligence. Pi0 es un modelo fundacional para robótica que combina percepción visual, comprensión de instrucciones en lenguaje natural y generación de acciones de control para diversos robots. Este checkpoint concreto está especializado en una única tarea de manipulación: recoger un marcador rojo y colocarlo sobre un cuadrado, ejecutada con un brazo robótico tipo WidowX AI.

El modelo se ha entrenado mediante aprendizaje por imitación con el framework LeRobot, sobre un dataset propio de 50 episodios con 21 986 fotogramas. Con aproximadamente 4 030 millones de parámetros, este fine-tune representa un ejemplo práctico de cómo adaptar un VLA generalista a una tarea específica con un coste de entrenamiento reducido. Su relevancia radica en que demuestra el flujo completo de entrenamiento y despliegue de políticas robóticas basadas en pi0, accesible para la comunidad open source gracias a la licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basado en flow matching (modelo de flujo), adaptado de pi0_base |
| Parametros totales | 4 028 019 472 (~4,03 B) |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de robótica; procesa imágenes y estado, no texto largo) |
| Tipos de cuantizacion | no disponible (solo safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible (el dataset de entrenamiento usa instrucciones en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Pi0 es un modelo de flujo (flow-based) que genera acciones robóticas condicionadas a observaciones visuales y a una instrucción en lenguaje natural. La implementación en LeRobot, adaptada del repositorio OpenPI de Physical Intelligence, utiliza un codificador de visión para procesar imágenes de cámara base y de muñeca (224×224 píxeles), junto con un vector de estado del robot de 32 dimensiones. La salida es una acción de 7 dimensiones, típicamente posición y orientación del efector final.

El entrenamiento de este checkpoint se realizó mediante aprendizaje por imitación (behavior cloning) sobre un dataset de 50 episodios (21 986 fotogramas a 30 FPS) con la tarea "Pick up the red marker and place it on the square". Se emplearon 10 000 pasos de entrenamiento con un tamaño de lote de 32, optimizador AdamW y una tasa de aprendizaje de 2,5e-05, con semilla 1000. El proceso se ejecutó con LeRobot versión 0.6.1, partiendo de los pesos preentrenados de `lerobot/pi0_base`. No se ha reportado el uso de RLHF ni DPO; es un fine-tune supervisado estándar.

## Capacidades

- Control robótico de 7 grados de libertad (acción de 7 dimensiones) para manipulación con brazo tipo WidowX AI.
- Percepción visual multicámara: procesa una cámara base y dos cámaras de muñeca (izquierda y derecha), todas a 224×224 píxeles.
- Comprensión de instrucciones en lenguaje natural, limitada al inglés y a la tarea específica entrenada.
- Generación de trayectorias de acción mediante flow matching, adecuado para movimientos suaves y continuos.
- No soporta tool calling, generación de texto libre ni razonamiento conversacional; es un modelo puramente orientado a acciones robóticas.
- Capacidad de ejecución en tiempo real con el framework LeRobot mediante el comando `lerobot-rollout`.

## Casos de uso

- Investigación en aprendizaje por imitación: sirve como ejemplo de fine-tune de pi0_base con LeRobot, permitiendo estudiar el efecto de datasets pequeños en el rendimiento de políticas robóticas.
- Demostración de pick-and-place en laboratorio: la tarea entrenada (recoger un marcador rojo y colocarlo en un cuadrado) es un escenario típico para validar la integración de percepción y control en brazos robóticos de bajo coste.
- Evaluación de generalización: al ser un modelo muy especializado, se puede usar para medir la degradación del rendimiento cuando se varían posiciones, iluminación o colores de objetos, identificando límites de robustez.
- Base para nuevos fine-tunes: los pesos de este checkpoint pueden servir como punto de partida para adaptar pi0 a tareas similares con pocos datos, aprovechando el conocimiento previo del modelo base.
- Desarrollo de sistemas de automatización en entornos controlados: en configuraciones fijas de cámara y robot, el modelo puede ejecutar la tarea de manipulación de forma repetitiva, útil para pruebas de fiabilidad.
- Docencia y formación en robótica con IA: al estar publicado con licencia Apache 2.0 y documentado en LeRobot, permite a estudiantes y desarrolladores reproducir el flujo completo de entrenamiento e inferencia sin coste de licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se dispone de métricas como tasa de éxito en robot real ni comparaciones con otros modelos.

## Requisitos de hardware

- El checkpoint en safetensors ocupa 17,8 GB, lo que sugiere que la inferencia en precisión completa requiere una GPU con al menos 24 GB de VRAM (por ejemplo, RTX 3090, RTX 4090, A100 o H100). Esta es una estimación basada en el tamaño del archivo; no hay datos oficiales de consumo de memoria.
- No se han publicado cuantizaciones (GGUF, AWQ, etc.), por lo que no es posible ejecutarlo en hardware de gama baja sin adaptaciones adicionales.
- Para el entrenamiento, LeRobot recomienda una GPU con al menos 24 GB de VRAM; el proceso de fine-tune con 10 000 pasos y batch 32 puede requerir varias horas incluso en hardware de gama alta.
- El despliegue se realiza mediante el framework LeRobot, que utiliza PyTorch. No hay soporte oficial para vLLM, llama.cpp u Ollama, dado que es un modelo de robótica, no un LLM conversacional.
- La inferencia se ejecuta en tiempo real (30 FPS de entrada) y la latencia depende de la GPU y del pipeline de captura de cámaras; no se han publicado cifras concretas de throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| pi0-marker-v1 (este modelo) | ~4,03 B | no disponible | Apache 2.0 | Hugging Face | Fine-tune específico de pi0_base para una tarea |
| lerobot/pi0_base | ~4,03 B (estimado, mismo checkpoint base) | no disponible | Apache 2.0 | Hugging Face | Modelo base generalista, sin fine-tune |
| pi0-FAST (Physical Intelligence) | no disponible | no disponible | no disponible | GitHub (openpi) | Variante autoregresiva con tokenizador de acciones FAST |
| pi0.5 (Physical Intelligence) | no disponible | no disponible | no disponible | GitHub (openpi) | Versión mejorada de pi0 con mejor generalización |

La comparativa se limita a variantes del mismo modelo pi0, ya que no se dispone de datos de rendimiento para comparar con otros VLA como OpenVLA o RT-2. La diferencia principal de este checkpoint frente a pi0_base es su especialización en una tarea concreta, lo que puede mejorar la precisión en esa tarea pero reduce drásticamente la generalización.

## Limitaciones y advertencias

- Dataset de entrenamiento muy reducido (50 episodios), lo que conlleva un alto riesgo de sobreajuste a las condiciones específicas de grabación (posición de cámara, iluminación, color de objetos, fondo).
- Sin resultados de evaluación en robot real: la model card no reporta tasas de éxito, por lo que no se puede garantizar su fiabilidad en producción.
- Especialización extrema: el modelo solo ejecuta la tarea de recoger el marcador rojo y colocarlo en el cuadrado; cualquier variación en objetos, colores o disposición puede provocar fallos.
- Dependencia de la configuración hardware: requiere el brazo WidowX AI y las cámaras específicas (base, muñeca izquierda y derecha) con las resoluciones y posiciones usadas en el entrenamiento.
- Sin soporte multilingüe: las instrucciones se procesan en inglés, y el modelo no ha sido entrenado para otras lenguas.
- Riesgo de alucinación en acciones: como todo modelo generativo, puede producir movimientos no deseados si las observaciones se desvían de la distribución de entrenamiento; se recomienda supervisión humana en pruebas reales.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base pi0 puede tener restricciones adicionales; se debe verificar la licencia del modelo base y del código OpenPI.

## Enlaces

- Repositorio del modelo: https://huggingface.co/CamilleWalters/pi0-marker-v1
- Modelo base: https://huggingface.co/lerobot/pi0_base
- Dataset de entrenamiento: https://huggingface.co/datasets/CamilleWalters/solo-marker-v1_20260828_121357
- Documentación de pi0 en LeRobot: https://huggingface.co/docs/lerobot/pi0
- Repositorio OpenPI (Physical Intelligence): https://github.com/Physical-Intelligence/openpi
- Paper de pi0: https://arxiv.org/abs/2410.24164
- Web de Physical Intelligence: https://www.pi.website/
