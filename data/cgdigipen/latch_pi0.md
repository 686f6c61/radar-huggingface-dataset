# CGdigipen/latch_pi0

## Resumen

`CGdigipen/latch_pi0` es un ajuste fino (fine-tune) del modelo fundacional de robótica π₀ (Pi0) de Physical Intelligence, adaptado y publicado con la librería LeRobot de Hugging Face. Se trata de una política generalista Visión-Lenguaje-Acción (VLA) que recibe imágenes de cámara e instrucciones en lenguaje natural y emite comandos de acción de bajo nivel para controlar un robot. En este caso concreto, el modelo ha sido especializado para una única tarea: identificar y agarrar la palanca de una manivela ("identify and grasp lever handle") sobre un robot tipo `so_follower`.

El modelo parte de `lerobot/pi0_base` y se ha entrenado con un dataset propio de 115 episodios y 47 618 fotogramas grabados a 30 FPS, con dos cámaras (`RIGHT` y `HEAD`) a resolución 480x640. La observación combina un vector de estado de 6 dimensiones con las dos imágenes, y la salida es un vector de acción de 6 dimensiones. El peso del repositorio es de 73,4 GB y el checkpoint contiene 4 028 019 472 parámetros en formato safetensors.

Su relevancia es doble: por un lado, demuestra el flujo completo de especialización de un modelo fundacional robótico mediante imitación con LeRobot; por otro, sirve como ejemplo práctico de cómo un modelo grande de propósito general puede reducirse a una tarea concreta con relativamente pocos datos. La licencia Apache 2.0 facilita su reutilización, aunque su utilidad práctica está limitada al dominio y hardware específicos para los que fue entrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀ (Pi0) de Physical Intelligence, implementación LeRobot/OpenPI |
| Parametros totales | 4 028 019 472 (≈4,03 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las instrucciones se proporcionan en lenguaje natural, presumiblemente inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de π₀, una política Visión-Lenguaje-Acción que combina un codificador visual, un modelo de lenguaje y un cabezal de acciones para producir comandos motores condicionados por instrucciones textuales e imágenes. La implementación utilizada es la de LeRobot, adaptada del repositorio OpenPI de Physical Intelligence. El checkpoint contiene aproximadamente 4,03 mil millones de parámetros y se distribuye en safetensors dentro de un repositorio de 73,4 GB (lo que sugiere que el repositorio incluye múltiples artefactos además de los pesos, como estados de optimizador u otros ficheros).

El ajuste fino se realizó sobre `lerobot/pi0_base` con 20 000 pasos de entrenamiento, tamaño de lote 16, optimizador AdamW y tasa de aprendizaje 2,5e-05, con semilla 1000 y LeRobot 0.6.1. El dataset de entrenamiento (`CGdigipen/grasp_lever_115_03112026_20261103_102924`) contiene 115 episodios y 47 618 fotogramas a 30 FPS, todos ellos centrados en la tarea "identify and grasp lever handle". No se documenta en la información disponible el uso de RLHF, DPO ni otras técnicas de alineación posteriores al ajuste por imitación.

## Capacidades

- Control robótico Visión-Lenguaje-Acción: recibe dos imágenes (cámaras `RIGHT` y `HEAD`, 3x480x640) y un vector de estado de 6 dimensiones, y emite un vector de acción de 6 dimensiones.
- Ejecución de una tarea concreta de manipulación: identificar y agarrar la palanca de una manivela.
- Interpretación de instrucciones en lenguaje natural (la tarea se pasa como cadena de texto, p. ej. `--task="identify and grasp lever handle"`).
- Integración con el ecosistema LeRobot: ejecución mediante `lerobot-rollout` y reentrenamiento mediante `lerobot-train`.
- Compatibilidad con robots `so_follower` y configuración de cámaras OpenCV a 640x480 y 30 FPS.
- No se documentan capacidades de tool calling, razonamiento multi-paso, agentes, visión general, audio ni modo "thinking"; el modelo está especializado exclusivamente en la política robótica descrita.

## Casos de uso

- Automatización de una celda de agarre de palanca: el modelo se ejecuta con `lerobot-rollout` sobre un robot `so_follower` para localizar visualmente la manivela y ejecutar el agarre, sustituyendo una secuencia programada a mano por una política aprendida.
- Prototipado rápido de tareas de manipulación: sirve como plantilla para equipos que quieran partir de `lerobot/pi0_base` y especializarlo con su propio dataset de 100-200 episodios, replicando la configuración de entrenamiento documentada.
- Investigación en imitación robótica: permite estudiar el efecto del ajuste fino de un VLA fundacional sobre una tarea estrecha, comparando el comportamiento del modelo base frente al especializado.
- Docencia y formación en robótica con LeRobot: el flujo completo (grabación, entrenamiento, rollout) está documentado y el modelo sirve como ejemplo reproducible de extremo a extremo.
- Evaluación de hardware de bajo coste: al estar pensado para `so_follower` y cámaras OpenCV estándar, permite validar pipelines de percepción-acción en robots asequibles antes de escalar a plataformas mayores.
- Base para ampliación multi-tarea: al conservar los pesos de π₀, puede reajustarse con datasets adicionales para cubrir otras manipulaciones dentro del mismo montaje experimental.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política y que la tabla de evaluación real-robot está vacía.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 4,03 mil millones de parámetros, una estimación orientativa en fp16 rondaría los 8 GB solo de pesos, más el coste de las dos imágenes de entrada y del codificador visual; en fp32 se duplicaría. Estas cifras son estimaciones, no datos publicados.
- GPU recomendadas: no disponible. No se especifican GPU concretas en la model card.
- ¿Cabe en GPU de consumo? No confirmado. Por tamaño de parámetros sería viable en tarjetas con suficiente VRAM, pero no hay datos oficiales de consumo ni latencia.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para inferencia, `lerobot-train` para reentrenamiento). No se documentan vLLM, llama.cpp, Ollama ni TGI, que además no son adecuados para este tipo de política robótica.
- Latencia y throughput: no disponible. La captura de datos se realizó a 30 FPS, pero no se indica la frecuencia de inferencia alcanzable.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CGdigipen/latch_pi0 | ≈4,03 mil M | no disponible | Agarre de palanca (so_follower) | apache-2.0 | Hugging Face (26 descargas) |
| lerobot/pi0_base | no disponible en la información | no disponible | Política VLA generalista | no disponible en la información | Hugging Face (modelo base) |
| CGdigipen/act_stack_bowls | 51,7 M | no disponible | Apilado de cuencos (ACT) | no disponible en la información | Hugging Face |

La comparación con `lerobot/pi0_base` es directa por relación de fine-tune: mismo origen arquitectónico, pero el modelo base es generalista y este está especializado en una sola tarea. `CGdigipen/act_stack_bowls` es una política mucho más pequeña (51,7 M de parámetros) basada en ACT, representativa de la alternativa ligera frente a un VLA de 4 mil millones de parámetros. No se dispone de datos de rendimiento comparativo entre ellos.

## Limitaciones y advertencias

- Especialización extrema: el modelo solo ha sido entrenado para "identify and grasp lever handle"; no se espera un comportamiento fiable fuera de esa tarea, ese robot o esa configuración de cámaras.
- Sin evaluación publicada: la model card no reporta tasa de éxito ni número de ensayos, por lo que no hay evidencia cuantitativa de su rendimiento en el mundo real.
- Dependencia del hardware: requiere un robot `so_follower` y cámaras con los nombres `RIGHT` y `HEAD` exactos, a 640x480 y 30 FPS; cualquier cambio en la disposición o calibración puede degradar el comportamiento.
- Dataset pequeño y de un solo dominio: 115 episodios y 47 618 fotogramas en un único entorno; es probable un sobreajuste al montaje, iluminación y posiciones de la manivela vistos en el entrenamiento.
- Riesgo de alucinación y de acciones erráticas: como política de imitación, puede generar trayectorias plausibles pero incorrectas ante situaciones fuera de distribución, con riesgo físico asociado en un robot real.
- Idiomas: no se documenta soporte multilingüe; la instrucción de tarea se proporciona en inglés en los ejemplos.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías; conviene revisar también las condiciones del modelo base `lerobot/pi0_base` y de los datos de entrenamiento.
- Tamaño del repositorio: 73,4 GB, lo que complica su descarga y despliegue en entornos con almacenamiento limitado.
- Sin datos de cuantización ni de contexto: no se especifican formatos GGUF ni longitud de contexto, lo que limita la planificación de despliegues optimizados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CGdigipen/latch_pi0
- Modelo base: https://huggingface.co/lerobot/pi0_base
- Dataset de entrenamiento: https://huggingface.co/datasets/CGdigipen/grasp_lever_115_03112026_20261103_102924
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=CGdigipen/grasp_lever_115_03112026_20261103_102924
- Blog de π₀ (Physical Intelligence): https://www.physicalintelligence.company/blog/pi0
- Repositorio OpenPI: https://github.com/Physical-Intelligence/openpi
- LeRobot en GitHub: https://github.com/huggingface/lerobot
- Guía de LeRobot para pi0: https://huggingface.co/docs/lerobot/main/en/pi0
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Perfil del autor: https://huggingface.co/CGdigipen/models
