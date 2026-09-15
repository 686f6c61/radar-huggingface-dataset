# Fork123/smolvla_49eps_lora64_seed1000

## Resumen

Fork123/smolvla_49eps_lora64_seed1000 es una política de visión-lenguaje-acción (VLA) obtenida por ajuste fino del modelo base lerobot/smolvla_base, publicado por el usuario Fork123 en Hugging Face. Se distribuye a través de la librería LeRobot y su pipeline declarado es "robotics": no es un modelo de lenguaje conversacional, sino una política de control que consume observaciones multimodales (estado del robot e imágenes de tres cámaras) y produce un vector de acción de 6 dimensiones para un brazo robótico.

El ajuste se ha realizado sobre el dataset Fork123/Test2-ImproveRecording-49eps-5pos, compuesto por 49 episodios y 16.789 fotogramas a 30 FPS, con una única tarea anotada: "Press the red glow button". La model card no ofrece resultados de evaluación en robot real ni cifras de éxito, por lo que se trata de un artefacto experimental orientado a reproducibilidad y pruebas, no de un modelo validado para producción.

Su relevancia es limitada pero concreta: sirve como ejemplo reproducible de ajuste de SmolVLA sobre datos propios con una configuración de entrenamiento documentada (20.000 pasos, batch 64, AdamW, learning rate 0,001, semilla 1000, LeRobot 0.6.2). El repositorio figura con 0 descargas y 0 likes, y un tamaño de 0,0 GB, lo que sugiere que contiene adaptadores o pesos muy ligeros; este extremo no se confirma en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en el modelo base lerobot/smolvla_base; detalles internos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la tarea entrenada está anotada en inglés: "Press the red glow button") |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería lerobot) |
| Pipeline | robotics |
| Modelo base | lerobot/smolvla_base (fine-tune) |
| Tipo de robot | so_follower |
| Camaras | wrist, front, top |
| Entradas | observation.state (6,); observation.images.camera1/2/3 (3, 256, 256) |
| Salidas | action (6,) |
| Dataset de entrenamiento | Fork123/Test2-ImproveRecording-49eps-5pos |
| Version de LeRobot | 0.6.2 |

## Arquitectura y entrenamiento

La model card describe el método subyacente (SmolVLA, arXiv:2506.01844) como un modelo compacto y eficiente de visión-lenguaje-acción, capaz de alcanzar rendimiento competitivo con un coste computacional reducido y desplegable en hardware de consumo. No se detallan en la información proporcionada ni el número de parámetros, ni la composición del dataset de preentrenamiento del modelo base, ni si hubo etapas de RLHF o DPO (términos, por otra parte, poco habituales en políticas de imitación). Lo que sí se documenta es la configuración del ajuste fino: 20.000 pasos de entrenamiento, batch size 64, optimizador AdamW, learning rate 0,001 y semilla 1000.

El ajuste se ha hecho por imitación sobre un dataset propio de 49 episodios y 16.789 fotogramas grabados a 30 FPS, con tres cámaras (muñeca, frontal y superior) y estado proprioceptivo de 6 dimensiones, para una única tarea de pulsado de un botón. El nombre del repositorio incluye "lora64", lo que sugiere un ajuste mediante LoRA con rango 64 y explicaría el tamaño declarado de 0,0 GB, pero la model card no confirma este punto ni especifica qué módulos se adaptaron. Tampoco se documentan innovaciones adicionales de decodificación o atención para esta política concreta.

## Capacidades

- Control robótico por imitación: genera acciones de 6 grados de libertad a partir de estado y triple entrada visual.
- Fusión visomotora multi-cámara: procesa tres flujos de imagen de 256x256 (muñeca, frontal y superior) junto con el estado del robot.
- Condicionamiento por instrucción en lenguaje natural: la política está entrenada para responder a la tarea "Press the red glow button".
- Ejecución de una tarea única y específica: pulsar un botón con brillo rojo; no se documenta generalización a otras tareas.
- Despliegue en robot real: se ejecuta mediante el comando lerobot-rollout sobre un robot de tipo so_follower.
- Reentrenamiento y ajuste: admite el flujo lerobot-train para producir nuevas políticas a partir de lerobot/smolvla_base.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, generación de texto, código, matemáticas, visión general, audio ni modo de pensamiento (thinking). Es una política de acción, no un asistente conversacional.

## Casos de uso

- Automatización de pulsado de botones en banco de pruebas: la política ejecuta la tarea "Press the red glow button" sobre un brazo so_follower, adecuada para validar una celda robotizada de una sola operación antes de escalar a un despliegue industrial.
- Reproducción de experimentos de imitation learning: al estar documentados pasos, batch, optimizador, learning rate y semilla, permite replicar el ajuste de SmolVLA sobre un dataset propio y comparar configuraciones.
- Estudio del efecto de la semilla y del rango LoRA: junto con otras variantes del mismo autor, sirve para analizar la variabilidad de resultados en políticas VLA pequeñas entrenadas con 49 episodios.
- Recolección y curación de datasets de robótica: el repositorio enlaza un dataset visualizable (Fork123/Test2-ImproveRecording-49eps-5pos) que puede usarse como referencia de formato y tasa de captura (30 FPS) para nuevos conjuntos de datos.
- Pruebas de integración de la pila LeRobot: útil para verificar la instalación, el cableado y la calibración de un robot so_follower con tres cámaras antes de abordar tareas más complejas.
- Evaluación de robustez ante variaciones de iluminación y posición: al tratarse de una tarea de detección de un botón iluminado, el modelo es un banco de pruebas natural para medir sensibilidad a cambios de luz y de colocación del objeto.
- Prototipado académico de políticas VLA en hardware de consumo: el modelo base está descrito como desplegable en hardware de consumo, lo que facilita su uso en laboratorios con presupuesto limitado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet", e incluye una plantilla de evaluación (tarea, ensayos, éxitos, tasa de éxito) sin rellenar. No hay datos de MMLU, HumanEval, GSM8K ni de tasa de éxito en robot real para esta política, y no procede inferirlos a partir del modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada.
- GPU recomendadas: no disponible. La model card del método SmolVLA afirma que está pensado para hardware de consumo, pero no se especifican modelos concretos para esta política.
- Compatibilidad con GPU de consumo: no confirmada con datos; el método base se describe como desplegable en hardware de consumo y el tamaño declarado del repositorio es 0,0 GB, lo que en la práctica reduciría mucho los requisitos si se trata de adaptadores LoRA.
- Formatos de despliegue documentados: LeRobot, con los comandos `lerobot-rollout` (inferencia en robot) y `lerobot-train` (entrenamiento y ajuste). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a una política de acción.
- Latencia y throughput: no disponibles. Se conoce la frecuencia de captura del dataset de entrenamiento (30 FPS), pero no la frecuencia de inferencia de la política en robot.
- Requisitos de robot: brazo de tipo so_follower, tres cámaras OpenCV configuradas (muñeca, frontal, superior) y nombres de cámara coherentes con las claves de observación del entrenamiento (observation.images.camera1/2/3).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Fork123/smolvla_49eps_lora64_seed1000 | no disponible | no disponible | sin resultados publicados | apache-2.0 | Hugging Face, 0 descargas |
| lerobot/smolvla_base | no disponible | no disponible | no disponible | no especificada en la informacion proporcionada | Hugging Face, modelo base del anterior |
| Otras politicas VLA (por ejemplo, familias tipo pi0 u OpenVLA) | no disponible | no disponible | no disponible | no disponible | no se dispone de datos en la informacion proporcionada |

La única comparación sustentada por la información disponible es con el modelo base lerobot/smolvla_base, del que esta política deriva por ajuste fino sobre un dataset de una sola tarea. No se aportan cifras comparativas de rendimiento ni de contexto para ninguno de los dos.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay tasa de éxito, número de ensayos ni condiciones de prueba, por lo que se desconoce si la política funciona de forma fiable.
- Dataset muy reducido: 49 episodios y 16.789 fotogramas para una única tarea, lo que aumenta el riesgo de sobreajuste al entorno, la iluminación y la posición exacta del botón grabados.
- Tarea única: no hay evidencia de generalización a otras instrucciones, objetos o disposiciones de la escena.
- Dependencia del montaje físico: la política espera un robot so_follower y tres cámaras con nombres concretos (observation.images.camera1/2/3); cualquier cambio de montaje, calibración o número de cámaras invalida las observaciones.
- Idiomas: no se declaran idiomas soportados; la instrucción de tarea está en inglés y no se documenta comportamiento multilingüe.
- Riesgo de alucinación en el sentido clásico: no aplica como en un LLM, pero sí existe riesgo de acciones erráticas o inseguras al operar un brazo real sin validación previa en simulación o con parada de emergencia.
- Sesgos: no documentados; cabe esperar sesgo hacia las condiciones visuales del dataset (fondo, iluminación, posición del botón).
- Licencia: apache-2.0, que permite uso comercial, pero al derivar de lerobot/smolvla_base conviene verificar la licencia y las condiciones del modelo base y del dataset antes de un despliegue comercial.
- Atribución incierta: el nombre del repositorio sugiere LoRA de rango 64, extremo no confirmado en la model card; el tamaño de 0,0 GB no permite verificar qué se está descargando realmente.
- Repositorio sin tracción: 0 descargas y 0 likes, sin garantía de mantenimiento ni de soporte por parte del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Fork123/smolvla_49eps_lora64_seed1000
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/Fork123/Test2-ImproveRecording-49eps-5pos
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Fork123/Test2-ImproveRecording-49eps-5pos
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
