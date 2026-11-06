# parthtr09/act-tictactoe-v4-final-30k

## Resumen

`parthtr09/act-tictactoe-v4-final-30k` es una política de control robótico basada en ACT (Action Chunking with Transformers) entrenada con LeRobot 0.6.1 sobre el conjunto de datos `OG7407/tictactoe-v4-final`. No es un modelo de lenguaje: es un modelo de imitación que mapea observaciones (seis posiciones articulares y tres cámaras) a comandos de posición articular para un brazo robótico SO-101 que juega al tres en raya. El repositorio ocupa 0,2 GB y contiene 51.674.246 parámetros en formato safetensors.

El modelo resuelve una tarea muy concreta: reproducir la política de movimiento demostrada en 108 episodios (40.855 fotogramas a 30 fps) para que un SO-101 manipule piezas de tres en raya. Su relevancia es acotada pero representativa del ecosistema LeRobot: sirve como referencia de entrenamiento de ACT con backbone ResNet-18, chunking de acciones de 100 pasos y un coste de cómputo bajo (unos 31 minutos en una RTX PRO 6000 Blackwell).

La ficha se elabora a partir de la model card y de los metadatos del repositorio. No hay resultados de evaluación en robot real ni benchmarks publicados, y la licencia Apache 2.0 permite reutilización comercial del artefacto, aunque el autor advierte que no se ha validado su comportamiento físico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) con backbone visual ResNet-18 |
| Parametros totales | 51.674.246 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; ventana de observación por chunk de 100 acciones) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Libreria | LeRobot 0.6.1 |
| Entrada de estado | 6 posiciones articulares (shoulder_pan, shoulder_lift, elbow_flex, wrist_flex, wrist_roll, gripper) |
| Entrada visual | 3 camaras: env 640x360, wrist 640x360, realsense 640x480 |
| Salida | 6 objetivos de posicion articular, en chunks de 100 |
| Dataset | OG7407/tictactoe-v4-final (108 episodios, 40.855 fotogramas a 30 fps) |
| Pasos de entrenamiento | 30.000 (aprox. 5,9 epocas), batch 8, LR 1e-5 |
| Perdida final | 0,103 (L1 0,096, KL 0,001) |
| Hardware de entrenamiento | 1x NVIDIA RTX PRO 6000 Blackwell, aprox. 31 minutos |

## Arquitectura y entrenamiento

ACT es una política de imitación de tipo transformer que predice secuencias de acciones (chunks) en lugar de una sola acción por paso, lo que reduce el error de acumulación y suaviza la ejecución. En esta implementación el codificador visual es una ResNet-18 que procesa tres flujos de cámara (entorno, muñeca y RealSense), y el estado propioceptivo de seis articulaciones se incorpora como tokens adicionales. La cabeza de salida produce 100 acciones de seis dimensiones cada una, correspondientes a objetivos de posición articular del SO-101.

El entrenamiento se realizó con LeRobot 0.6.1 durante 30.000 pasos (unas 5,9 épocas sobre 108 episodios y 40.855 fotogramas a 30 fps), con batch de 8 y tasa de aprendizaje de 1e-5 según el preset ACT de LeRobot. La pérdida final combina un término L1 de 0,096 y un término KL de 0,001, lo que indica un ajuste razonable a las demostraciones sin una divergencia apreciable de la distribución latente. No se documenta uso de RLHF, DPO ni aumento de datos; el pipeline es imitación supervisada estándar con decodificación por chunks.

## Capacidades

- Control robótico de imitación para un brazo SO-101 de seis grados de libertad en la tarea de tres en raya.
- Predicción de acciones en chunks de 100 pasos, lo que permite ejecución fluida y tolerante a latencias de inferencia.
- Fusión multimodal de tres cámaras (vista de entorno, vista de muñeca y RealSense) con estado propioceptivo de seis articulaciones.
- Generación de objetivos de posición articular, no de pares o velocidades; requiere un controlador de posición en el robot.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Reproducción de la tarea de tres en raya en un SO-101: el modelo recibe las tres imágenes y el estado articular y emite los objetivos de posición para colocar y mover piezas, adecuado porque fue entrenado exactamente sobre esa secuencia de 108 episodios.
- Base para fine-tuning en tareas de manipulación de tablero: al ser una política ACT con backbone ResNet-18 y licencia Apache 2.0, se puede reentrenar con LeRobot sobre un dataset propio de episodios similares y reutilizar la arquitectura.
- Referencia educativa de imitación con LeRobot: sirve para estudiar el flujo `lerobot-train` y `lerobot-record`, ya que la model card incluye el comando exacto de entrenamiento y los hiperparámetros usados.
- Evaluación de pipelines de chunking de acciones: permite medir cómo afecta el tamaño de chunk (100) y la latencia de inferencia a la suavidad de la trayectoria en un banco de pruebas controlado.
- Pruebas de integración de cámaras múltiples: el modelo consume tres flujos con resoluciones distintas (640x360 y 640x480), útil para validar sincronización y calibración en montajes de bajo coste.
- Prototipado de demostración en ferias o laboratorios: con 0,2 GB de pesos y 51,7 millones de parámetros, cabe en GPUs de consumo y permite montar una demo de manipulación sin infraestructura pesada, siempre que se valide antes en el robot real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta la pérdida de entrenamiento final (L1 0,096, KL 0,001) y no incluye evaluaciones en robot real ni comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 millones de parámetros en fp32 el peso ronda los 0,2 GB, por lo que la VRAM necesaria la dominan las activaciones de las tres cámaras y el transformer, no los pesos.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM es suficiente en la práctica para una política de este tamaño; el entrenamiento documentado usó una RTX PRO 6000 Blackwell durante unos 31 minutos.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060, RTX 4060, RTX 4090 y similares; no hay requisitos oficiales publicados.
- Opciones de despliegue: LeRobot (`lerobot-record --policy.path=...`) y carga directa con `ACTPolicy.from_pretrained`; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles; el chunking de 100 acciones está pensado para amortiguar la latencia de inferencia, pero no se publican medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / chunk | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act-tictactoe-v4-final-30k | 51,7 M | chunk de 100 acciones | Tres en raya con SO-101 | Apache 2.0 | Hugging Face (0 descargas) |
| Políticas ACT genéricas de LeRobot | variable | configurable | Manipulación diversa | según checkpoint | Hub de LeRobot |
| Políticas Diffusion Policy | variable | horizonte configurable | Manipulación diversa | según checkpoint | Repositorios de investigación |
| Políticas VLA tipo OpenVLA | miles de millones | contexto de lenguaje | Instrucciones en lenguaje natural | según checkpoint | Hugging Face |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada; la comparación se limita a parámetros, tarea y licencia.

## Limitaciones y advertencias

- El autor indica explícitamente que no se ha ejecutado ninguna evaluación en el robot real, por lo que el comportamiento físico es desconocido.
- El modelo está sobreajustado a una tarea y un montaje concretos (SO-101, tres cámaras con resoluciones y nombres específicos, tablero de tres en raya); no generaliza a otras tareas sin reentrenamiento.
- No hay información sobre sesgos, pero al ser imitación de 108 episodios puede reproducir sesgos de las demostraciones (posiciones, velocidades y estrategias del operador).
- Riesgo de alucinación en el sentido de acciones fuera de distribución: ante observaciones no vistas puede generar trayectorias erráticas; requiere límites de seguridad y parada de emergencia en el robot.
- La licencia Apache 2.0 permite uso comercial, pero no se ofrece garantía alguna sobre seguridad física ni precisión.
- No se documentan cuantizaciones ni requisitos oficiales de hardware; las estimaciones de VRAM son orientativas.
- El repositorio tiene 0 descargas y 0 likes, sin validación comunitaria ni issues públicos.
- Los idiomas no aplican; no es un modelo de lenguaje y no debe usarse para texto, código o razonamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/parthtr09/act-tictactoe-v4-final-30k
- Dataset de entrenamiento: https://huggingface.co/datasets/OG7407/tictactoe-v4-final
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
