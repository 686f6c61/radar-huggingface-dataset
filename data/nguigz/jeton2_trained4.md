# nguigz/jeton2_trained4

## Resumen

`nguigz/jeton2_trained4` es una política de robótica entrenada con el método Action Chunking with Transformers (ACT), una técnica de aprendizaje por imitación que predice secuencias cortas de acciones (chunks) en lugar de pasos individuales. El modelo lo publica el usuario nguigz en HuggingFace Hub y se ha generado con LeRobot, la librería de Hugging Face para aprendizaje automático en robótica real. No es un modelo de lenguaje: es un controlador visomotor que mapea observaciones (estado de las articulaciones e imágenes de dos cámaras) a comandos de acción de 6 dimensiones.

El modelo tiene 51.668.614 parámetros (unos 51,7 millones) y un tamaño de repositorio de 0,2 GB en formato safetensors. Está especializado en un robot concreto, el `so_follower` (el brazo seguidor del ecosistema SO-100/SO-101 de LeRobot), con dos cámaras (`front` y `top`) a resolución de 320x240. La tarea registrada en el dataset es una sola: "resume", con la nota de reducción de resolución de cámaras a 320x240.

Su relevancia es la de un artefacto de referencia dentro del ecosistema LeRobot: un ejemplo reproducible de entrenamiento de ACT con 50 episodios y 20.442 fotogramas a 30 FPS, útil para quien quiera replicar el pipeline o adaptar la política a un brazo SO-100/101 propio. No aporta capacidades generales de lenguaje, razonamiento ni visión semántica; su valor es estrictamente como política de control entrenada para una tarea y un robot específicos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parámetros totales | 51.668.614 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto textual; ventana de observación fija definida por la política) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplica (modelo de robótica); las tareas del dataset están etiquetadas en francés |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

ACT es un transformer de aprendizaje por imitación que combina un codificador visual (procesa las imágenes de las cámaras `front` y `top`, cada una de 3x240x320 píxeles) con un codificador del estado de las articulaciones (vector de 6 dimensiones) y un decodificador que genera un chunk de acciones de 6 dimensiones. La predicción por chunks reduce el error de compounding y mitiga el problema de la ambigüedad de las demostraciones humanas, que es la motivación central del método descrito en el paper arXiv:2304.13705.

El entrenamiento se realizó con LeRobot 0.6.2 sobre el dataset `nguigz/jeton2`: 50 episodios, 20.442 fotogramas a 30 FPS, una única tarea ("resume") y cámaras reducidas a 320x240. La configuración fue de 100.000 pasos, batch size 8, optimizador AdamW, learning rate de 1e-05 y semilla 1000. No se documenta en la model card el uso de RLHF, DPO ni ningún ajuste posterior al aprendizaje por imitación supervisado.

## Capacidades

- Control visomotor de un brazo robótico `so_follower` a partir de dos cámaras RGB y el estado de las articulaciones.
- Predicción de chunks de acción de 6 dimensiones (posición/orientación del efector o articulaciones, según la configuración del robot).
- Aprendizaje por imitación a partir de demostraciones teleoperadas; no requiere recompensas ni entorno simulado.
- Ejecución autónoma de una tarea concreta ("resume") dentro del dominio del dataset de entrenamiento.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No tiene capacidades multilingües ni de visión semántica general; las cámaras solo se usan como entrada de control.

## Casos de uso

- Réplica del pipeline ACT en un brazo SO-100/SO-101: sirve como referencia reproducible para validar la instalación de LeRobot, la calibración de cámaras y el comando `lerobot-rollout` antes de entrenar políticas propias.
- Prototipado de tareas de manipulación sencillas: con 50 episodios y 20.442 fotogramas, el modelo demuestra el volumen mínimo de datos necesario para obtener una política funcional en una tarea acotada.
- Base para fine-tuning con datos propios: partiendo de estos pesos y del mismo `policy.type=act`, se puede adaptar la política a una tarea distinta con un dataset nuevo y menos pasos de entrenamiento.
- Evaluación comparativa de métodos de imitación: útil como línea base ACT frente a otros métodos de LeRobot (Diffusion Policy, VQ-BeT, etc.) en el mismo robot y tarea.
- Docencia y divulgación: ejemplo completo de model card, dataset y configuración de entrenamiento para explicar el ciclo completo de aprendizaje por imitación en robótica real.
- Pruebas de integración hardware-software: verificación de latencia, sincronización de cámaras a 30 FPS y estabilidad del bucle de control en un robot de bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real (tabla de trials/success rate vacía).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 51,7 millones de parámetros y pesos en safetensors (0,2 GB de repo), la huella es muy reducida y cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no especificadas por el autor; LeRobot permite `--policy.device=cuda`. Por tamaño, una RTX 3060 o superior es más que suficiente; también es viable en CPU para pruebas, aunque la latencia del bucle de control a 30 FPS puede degradarse.
- Cabe en GPU consumer: sí, por el tamaño del modelo (decenas de millones de parámetros).
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--policy.path=nguigz/jeton2_trained4`); no se documentan exportaciones a vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput estimados: no disponibles; dependen del robot, las cámaras y el hardware de inferencia.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nguigz/jeton2_trained4 (ACT) | Política de imitación robótica | 51,7 M | no aplica | apache-2.0 | HuggingFace Hub, LeRobot |
| Otras políticas ACT en LeRobot Hub | Política de imitación robótica | variable | no aplica | variable | HuggingFace Hub |
| Diffusion Policy (LeRobot) | Política de imitación robótica | variable | no aplica | variable | HuggingFace Hub / LeRobot |
| VQ-BeT (LeRobot) | Política de imitación robótica | variable | no aplica | variable | HuggingFace Hub / LeRobot |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada; la comparación se limita a categoría, licencia y disponibilidad.

## Limitaciones y advertencias

- Especialización extrema: entrenado para una única tarea ("resume") y un único robot (`so_follower`); no generaliza a otras tareas, objetos ni brazos sin reentrenamiento.
- Sin evaluación publicada: no hay tasa de éxito medida en robot real, por lo que no se puede afirmar su fiabilidad en producción.
- Dataset pequeño: 50 episodios y 20.442 fotogramas; riesgo alto de sobreajuste a posiciones, iluminación y condiciones concretas del entorno de captura.
- Dependencia de las cámaras: los nombres (`front`, `top`), la resolución (320x240) y la frecuencia (30 FPS) deben coincidir con los usados en entrenamiento; cualquier desviación degrada el control.
- Sesgos: los derivados de las demostraciones teleoperadas (estilo del operador, distribución de posiciones iniciales, condiciones del laboratorio).
- Alucinación: no aplica en el sentido de generación de texto, pero sí existe riesgo de acciones erráticas fuera de la distribución de estados observados.
- Licencia apache-2.0: permite uso comercial y modificación, pero el autor no ofrece garantías; conviene verificar la licencia del paper ACT y de LeRobot para atribuciones.
- Advertencia de producción: no usar en entornos con personas u objetos frágiles sin supervisión y sin un mecanismo de parada de emergencia independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nguigz/jeton2_trained4
- Dataset de entrenamiento: https://huggingface.co/datasets/nguigz/jeton2
- Paper ACT: https://huggingface.co/papers/2304.13705
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=nguigz/jeton2
