# eslab1234/smolvla_multitask_5blocks_v3_865ep_trimmed_from575_285k_fullft_lr1e5_150k

## Resumen

SmolVLA es un modelo compacto de vision-lenguaje-accion (VLA) desarrollado por Hugging Face para control robótico mediante imitación. Este repositorio concreto es un fine-tuning del modelo base `lerobot/smolvla_base` realizado por el usuario `eslab1234`, entrenado con la librería LeRobot sobre un dataset propio de manipulación multitarea. El modelo resuelve el problema de convertir observaciones visuales y de estado articular en comandos de acción de bajo nivel para un brazo robótico, sin necesidad de planificadores ni controladores escritos a mano.

El modelo tiene 450.046.176 parámetros (aproximadamente 450 millones) y un tamaño de repositorio de 1,2 GB. Consume dos imágenes de cámara de 3x480x640 (`top` y `wrist`) junto con un vector de estado de 6 dimensiones, y produce un vector de acción de 6 dimensiones. Está especializado en dos tareas concretas de manipulación con cinco bloques (colocación individual en posiciones designadas y apilado secuencial), sobre un robot de tipo `so_follower` (brazo SO-100/SO-101).

Su relevancia actual radica en que demuestra que un VLA de menos de 500 millones de parámetros puede ejecutarse en hardware de consumo, lo que abarata enormemente el ciclo de experimentación en robótica de imitación. Al ser un fine-tuning publicado con licencia Apache 2.0 y pesos en safetensors, sirve como ejemplo reproducible de un pipeline completo: grabación de datos, entrenamiento con LeRobot y despliegue en robot real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en un backbone de vision-lenguaje compacto de la familia SmolVLM con experto de accion; la model card no detalla la composicion exacta de capas |
| Parametros totales | 450.046.176 (aproximadamente 450 M) |
| Longitud de contexto | No disponible (no es un LLM de texto; la politica consume observaciones fijas de 2 camaras mas estado, sin ventana de contexto tokenizada declarada) |
| Tipos de cuantizacion | No disponible; solo se publican pesos sin cuantizar en safetensors |
| Idiomas soportados | No disponible; las instrucciones de tarea del dataset estan redactadas en ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (libreria `lerobot`) |
| Autor | eslab1234 |
| Modelo base | lerobot/smolvla_base |
| Tipo de robot | `so_follower` |
| Camaras de entrada | `top` y `wrist`, 3x480x640 cada una |
| Dimension de observacion de estado | 6 |
| Dimension de accion de salida | 6 |
| Frecuencia de captura del dataset | 30 FPS |
| Tamano del repositorio | 1,2 GB |
| Fecha de creacion | 2026-09-22 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura pertenece a la familia de modelos vision-lenguaje-accion descrita en el paper de SmolVLA (arXiv:2506.01844): un backbone de vision-lenguaje compacto que procesa las imágenes de cámara y la instrucción de tarea en lenguaje natural, acoplado a un experto de acción que genera las trayectorias. Este repositorio es un fine-tuning completo del modelo base `lerobot/smolvla_base`, no una adaptación con LoRA ni congelación parcial. La model card no especifica la composición interna de capas, el número de tokens de imagen ni el mecanismo exacto de acoplamiento entre el backbone y el experto de acción.

El entrenamiento se realizó con LeRobot 0.5.2 durante 150.000 pasos, con tamaño de lote 16, optimizador AdamW, tasa de aprendizaje 1e-5 y semilla 1000. El dataset `eslab1234/multitask_5blocks_v3_865ep_trimmed_merged` contiene 865 episodios y 982.236 fotogramas a 30 FPS, con dos tareas: recoger los cinco bloques en secuencia (rojo, amarillo, madera, verde, azul) y depositarlos en posiciones objetivo designadas, o bien apilarlos uno encima del anterior. No se documenta el uso de RLHF, DPO ni de ningún bucle de refinamiento por preferencias humanas, algo esperable en un modelo de imitación robótica.

## Capacidades

- Generación de acciones motoras continuas de 6 dimensiones para un brazo robótico `so_follower` a partir de observaciones visuales y de estado articular.
- Percepción visual multimodal con dos cámaras simultáneas (vista superior y vista de muñeca) a resolución 3x480x640.
- Ejecución de instrucciones de tarea en lenguaje natural, ya que el pipeline de LeRobot pasa la descripción textual de la tarea como entrada al modelo.
- Manipulación multitarea: dos tareas distintas de pick-and-place con cinco bloques, incluida la secuenciación por colores y el apilado.
- Política de imitación de extremo a extremo: no requiere planificación simbólica, SLAM ni modelado cinemático explícito.
- Inferencia de bajo coste computacional: el tamaño de 450 M permite ejecución en hardware de consumo.
- No se documenta soporte de tool calling, function calling, uso como agente multi-paso, razonamiento simbólico ni capacidades de audio o visión general fuera del control robótico.
- No se documentan capacidades multilingües más allá de la instrucción de tarea en inglés.

## Casos de uso

- Colocación automatizada de piezas en líneas de montaje: el modelo puede recoger objetos en secuencia según un orden predefinido y depositarlos en posiciones concretas, replicando la tarea de los cinco bloques entrenada; es adecuado porque la política ya ha visto 865 episodios de esa secuencia.
- Investigación en aprendizaje por imitación: sirve como punto de partida reproducible para experimentar con fine-tuning de VLA, dado que el dataset, la configuración de entrenamiento (150.000 pasos, AdamW, lr 1e-5) y los comandos de LeRobot están documentados.
- Prototipado rápido en robótica de bajo coste: con 450 M de parámetros y 1,2 GB de pesos, se puede desplegar en un equipo con GPU de gama media o incluso en CPU, lo que reduce la barrera de entrada para laboratorios pequeños.
- Apilado de objetos para tareas de empaquetado o logística: la segunda tarea del dataset entrena explícitamente el apilado de cada bloque sobre el anterior tras sobrevolar el área objetivo, un comportamiento útil en paletizado ligero.
- Generación de datos sintéticos de demostración: el modelo puede ejecutarse con `lerobot-rollout` para producir trayectorias de referencia que luego se filtran y se añaden a un dataset mayor, ampliando la cobertura de un corpus de entrenamiento.
- Benchmark interno de políticas robóticas: al ser un fine-tuning de `lerobot/smolvla_base`, permite comparar directamente el efecto del entrenamiento específico frente al modelo base bajo las mismas condiciones de robot y cámaras.
- Educación y divulgación técnica: el flujo completo (calibración de hardware, grabación, entrenamiento y rollout) está cubierto por la documentación de LeRobot, lo que lo hace apto para cursos prácticos de robótica con IA.

## Benchmarks y rendimiento

"No se han publicado resultados de benchmarks en la informacion disponible." El autor indica explícitamente que no se han proporcionado resultados de evaluación en robot real para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 2 GB en fp32 y aproximadamente 1 GB en bf16/fp16 para los 450 M de parámetros; el repositorio completo ocupa 1,2 GB, por lo que el uso real de memoria durante la inferencia es moderado.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM. Una RTX 3060, RTX 4060 o superior es suficiente. En el extremo alto, A100 o H100 no aportan ventaja significativa porque el cuello de botella es la latencia de control, no el cómputo.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo moderna, e incluso en CPU, aunque en CPU la latencia puede comprometer el control a 30 FPS.
- Opciones de despliegue: el flujo nativo es LeRobot mediante `lerobot-rollout` (inferencia) y `lerobot-train` (entrenamiento), en PyTorch. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje de texto.
- Latencia y throughput estimados: no disponibles. La model card no publica mediciones de latencia ni de frecuencia de control alcanzable; el dataset de entrenamiento se grabó a 30 FPS, valor de referencia habitual para estas políticas.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Licencia | Contexto / entrada | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (fine-tuning de SmolVLA) | 450 M | VLA con experto de accion | Apache 2.0 | 2 camaras 3x480x640 + estado de 6 dim.; sin ventana de contexto declarada | Hugging Face, via LeRobot |
| lerobot/smolvla_base | 450 M | VLA con experto de accion | Apache 2.0 | Igual que el anterior (modelo base) | Hugging Face, via LeRobot |
| OpenVLA | Aproximadamente 7 B | VLA sobre backbone de lenguaje | Licencia propia basada en Llama 2 (con restricciones) | Una camara por defecto; contexto de lenguaje heredado del backbone | Publico en Hugging Face |
| pi0 (Physical Intelligence) | Aproximadamente 3 B | VLA con flow matching | Apache 2.0 | Multiples camaras y estado; orientado a robot unico y multiplataforma | Publico en Hugging Face |

No se dispone de cifras de rendimiento comparables para este fine-tuning concreto, por lo que la comparativa se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- No se han publicado resultados de evaluación en robot real: se desconoce la tasa de éxito de las dos tareas entrenadas, por lo que no debe asumirse un rendimiento de producción sin validación propia.
- Especialización estrecha: el modelo está entrenado para un robot `so_follower` con dos cámaras en posiciones concretas y para dos tareas de cinco bloques. Cambiar el robot, la disposición de las cámaras o los objetos degradará el comportamiento.
- Sensibilidad a la distribución de entrenamiento: cambios en iluminación, posiciones iniciales de los objetos, distractores o fondo pueden reducir el éxito de la política, algo típico en aprendizaje por imitación.
- Rigidez de la instrucción de tarea: el texto de la tarea debe coincidir con las descripciones usadas en el dataset; no hay evidencia de generalización a instrucciones reformuladas.
- Idiomas: la model card no declara idiomas soportados; las instrucciones del dataset están en inglés, por lo que el uso en castellano no está validado.
- Riesgo de alucinación: en un modelo de acción no aplica la alucinación textual, pero sí el riesgo de generar trayectorias inconsistentes o colisiones cuando la observación se aleja de la distribución de entrenamiento.
- Sesgos conocidos: no documentados por el autor; cabe esperar sesgos derivados de las condiciones concretas en que se grabó el dataset (entorno, operador, robot y objetos específicos).
- Licencia Apache 2.0, que permite uso comercial, modificación y redistribución, siempre que se conserve el aviso de licencia y se cite el trabajo original. Es necesario verificar también la licencia del modelo base `lerobot/smolvla_base` y del paper de SmolVLA.
- Métricas de adopción nulas: 0 descargas y 0 likes en el momento de la consulta, y fecha de creación muy reciente, por lo que no existe validación por parte de terceros.
- Advertencia de la propia model card: los resultados de evaluación están sin rellenar, de modo que el autor no certifica el comportamiento de la política.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eslab1234/smolvla_multitask_5blocks_v3_865ep_trimmed_from575_285k_fullft_lr1e5_150k
- Dataset de entrenamiento: https://huggingface.co/datasets/eslab1234/multitask_5blocks_v3_865ep_trimmed_merged
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=eslab1234/multitask_5blocks_v3_865ep_trimmed_merged
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion completa de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento de politicas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Imagen de arquitectura citada en la model card: https://cdn-uploads.huggingface.co/production/uploads/640e21ef3c82bd463ee5a76d/aooU0a3DMtYmy_1IWMaIM.png

Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; los enlaces anteriores provienen de la informacion de Hugging Face y de la model card del autor.
