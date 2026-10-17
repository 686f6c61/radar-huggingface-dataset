# mysterium99/smolvla_stage1_newtask

## Resumen

`mysterium99/smolvla_stage1_newtask` es un ajuste fino del modelo SmolVLA (`lerobot/smolvla_base`), un modelo visión-lenguaje-acción (VLA) compacto de 450.046.176 parámetros (~450 M) orientado a control robótico por imitación. Lo publica el usuario mysterium99 en Hugging Face bajo licencia Apache-2.0, con pesos en formato safetensors y un repositorio de 0,9 GB. El modelo consume el estado del robot (vector de 6 dimensiones) y tres cámaras RGB de 256x256, y produce un vector de acción de 6 dimensiones.

El problema que resuelve es la traducción de instrucciones en lenguaje natural y observaciones visuales en acciones de manipulación, en este caso para tareas de clasificación de ferretería industrial (tornillos, tuercas, arandelas, muelles) sobre un robot de tipo `follow`. Se ha entrenado con el dataset `manufacturing_task`, compuesto por 2.500 episodios, 2.593.106 fotogramas a 30 FPS (aproximadamente 24 horas de demostraciones) y 50 instrucciones distintas.

Su relevancia ahora es doble: por un lado, SmolVLA está diseñado para desplegarse en hardware de consumo, lo que rebaja la barrera de entrada frente a VLA de miles de millones de parámetros; por otro, este repositorio muestra el flujo completo de LeRobot para ajustar una política VLA a una tarea y una morfología concretas. No obstante, es un modelo recién publicado, sin descargas ni evaluaciones independientes, y su validez está acotada al robot y a las cámaras con los que se entrenó.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA (visión-lenguaje-acción) basada en un VLM preentrenado con un cabezal de acciones; la model card no detalla el número de capas ni la composición interna |
| Parámetros totales | 450.046.176 (~450 M) |
| Parámetros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | No disponible (modelo de robótica; no se define una ventana de contexto textual) |
| Tipos de cuantización | No se publican variantes cuantizadas (GGUF, AWQ, GPTQ, etc.); pesos en safetensors |
| Idiomas soportados | No disponible; las instrucciones del dataset de entrenamiento están en inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (librería `lerobot`) |
| Pipeline | `robotics` |
| Modelo base | `lerobot/smolvla_base` (ajuste fino) |
| Entrada: estado | `observation.state`, forma `(6,)` |
| Entrada: visión | 3 cámaras RGB de `(3, 256, 256)` (`gripper`, `newtop`, `newside`) |
| Salida | `action`, forma `(6,)` |
| Tipo de robot | `follow` |
| Tamaño del repositorio | 0,9 GB |
| Versión de LeRobot | 0.6.2 |

## Arquitectura y entrenamiento

SmolVLA es un modelo visión-lenguaje-acción compacto: combina un modelo de visión-lenguaje preentrenado con un cabezal que genera acciones continuas, de modo que la política procesa simultáneamente instrucciones textuales, imágenes de varias cámaras y el estado proprioceptivo del robot. Este repositorio concreto parte de `lerobot/smolvla_base` y se ajusta de forma supervisada por imitación (behavior cloning) sobre demostraciones de teleoperación; la model card no documenta RLHF ni DPO, algo esperable en políticas de manipulación de este tipo.

El entrenamiento se realizó sobre `manufacturing_task`: 2.500 episodios, 2.593.106 fotogramas a 30 FPS y 50 tareas de manipulación de ferretería, con instrucciones como ordenar tornillos por longitud, separar tuercas de cinc de las galvanizadas, colocar elementos en una zona delimitada con cinta o entregar una pieza a una persona. La configuración de ajuste fino fue de 20.000 pasos, batch de 8, optimizador AdamW, tasa de aprendizaje 1e-4 y semilla 0. No se especifican en la información disponible el número de tokens de entrenamiento del modelo base, la composición completa del dataset de preentrenamiento, ni innovaciones de inferencia como decodificación especulativa o atención lineal.

| Hiperparámetro | Valor |
|---|---|
| Pasos de entrenamiento | 20.000 |
| Tamaño de batch | 8 |
| Optimizador | AdamW |
| Tasa de aprendizaje | 0,0001 |
| Semilla | 0 |
| Versión de LeRobot | 0.6.2 |
| Episodios | 2.500 |
| Fotogramas | 2.593.106 |
| Frecuencia de captura | 30 FPS |

## Capacidades

- Manipulación robótica guiada por lenguaje: ejecuta instrucciones en inglés del dominio de ferretería y clasificación de piezas (tornillos, tuercas, arandelas, muelles).
- Percepción multimodal: integra tres flujos de cámara de 256x256 junto con el estado del robot de 6 dimensiones.
- Generación de acciones continuas de 6 dimensiones, adecuada para brazos manipuladores con pinza.
- Ejecución de tareas de pick-and-place, clasificación por tamaño o material, ordenación espacial y colocación en zonas delimitadas.
- Interacción persona-robot: varias instrucciones del dataset implican recibir o entregar una pieza a una persona.
- Ajuste fino adicional: al estar construido sobre LeRobot, puede reentrenarse con nuevos datasets y morfologías siguiendo el flujo de la librería.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso explícito, modo "thinking", audio ni visión generalista fuera del bucle de control.

## Casos de uso

- Clasificación de ferretería en línea de producción: el modelo puede ordenar tornillos y tuercas por tamaño, material o tipo (hexagonal, carriage, lag) depositándolos en zonas o contenedores definidos, aprovechando las 50 instrucciones de entrenamiento específicas del dominio.
- Kitting y preparación de pedidos: dado un conjunto de piezas dispersas, la política puede agrupar las que cumplen un criterio (por ejemplo, "todos los tornillos de 2 pulgadas en el cubo") y reducir el tiempo de preparación manual.
- Alimentación de máquinas o puestos de montaje: recoger una pieza concreta y entregarla a un operario o colocarla en una posición fija, usando la cámara de pinza para verificar la sujeción.
- Control de calidad visual y separación de defectuosos: combinado con una instrucción de descarte, puede retirar piezas no conformes de una zona delimitada y trasladarlas a un contenedor de rechazo.
- Investigación en imitación y VLA: sirve como punto de partida reproducible para estudiar generalización entre instrucciones, sensibilidad al número de cámaras o degradación al cambiar la iluminación.
- Recolecta y aumento de datos robóticos: al estar integrado en LeRobot, puede usarse para generarrollouts, comparar políticas y alimentar nuevas rondas de entrenamiento con correcciones humanas.
- Demostraciones y prototipos en laboratorio: su tamaño (~450 M) permite ejecutar la política en una estación con GPU de consumo, lo que facilita pruebas de concepto antes de invertir en modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de éxito por tarea, pérdida de validación, comparaciones con el modelo base ni métricas de latencia. Tampoco se han publicado evaluaciones independientes del repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en bf16/fp16 ocupan aproximadamente 0,9 GB (450 M x 2 bytes); en fp32, unos 1,8 GB. Sumando activaciones de tres cámaras de 256x256 y batch 1, una estimación prudente es de 2 a 4 GB de VRAM, aunque el fabricante no publica cifras oficiales.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para operación cómoda, como RTX 3060, RTX 4060, RTX A2000 o superiores. Para entrenamiento o varias instancias en paralelo, A100, H100 o L40S.
- Cabe en GPU de consumo: sí, previsiblemente en GTX 1660 de 6 GB, RTX 3050 de 8 GB, RTX 3060 de 12 GB y RTX 4060 Ti de 16 GB. La ejecución en CPU es posible por tamaño, pero no se recomienda para control en tiempo real.
- Opciones de despliegue: `lerobot-rollout` con el robot `follow`, sobre PyTorch y LeRobot 0.6.2. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI, que no son adecuados para una política VLA de control continuo.
- Latencia y throughput: no disponibles. El dataset se capturó a 30 FPS, pero no se publica la frecuencia de control alcanzable ni el tiempo de inferencia por paso.

## Comparativa con modelos similares

No se dispone de datos de benchmarks que permitan comparar el rendimiento de este ajuste con otras políticas VLA. La comparación se limita a características publicadas.

| Modelo | Parámetros | Entradas | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `mysterium99/smolvla_stage1_newtask` | 450.046.176 | Estado (6,), 3 cámaras 256x256 | Apache-2.0 | Hugging Face, 0 descargas | Ajuste fino para `manufacturing_task` y robot `follow` |
| `lerobot/smolvla_base` | ~450 M (misma familia) | Estado y cámaras según configuración | Apache-2.0 | Hugging Face | Modelo base; requiere ajuste para tareas concretas |
| OpenVLA | ~7.000 M (referencia externa) | Imagen y estado | No verificado en la información | Público | VLA de mayor tamaño; sin comparación de rendimiento disponible aquí |
| pi0 | ~3.300 M (referencia externa) | Imagen, estado e instrucción | No verificado en la información | Público | VLA de propósito general; sin comparación de rendimiento disponible aquí |

## Limitaciones y advertencias

- Especialización extrema: el ajuste está entrenado para un robot `follow`, tres cámaras concretas (`gripper`, `newtop`, `newside`) y un conjunto cerrado de 50 instrucciones de ferretería. Cambiar la morfología, la disposición de cámaras o el vocabulario de tareas degradará previsiblemente el rendimiento.
- Idioma: las instrucciones del dataset están en inglés; no hay evidencia de soporte multilingüe ni de generalización a paráfrasis no vistas.
- Sin evaluación publicada: no hay tasas de éxito, matrices de confusión por tarea ni comparación con el modelo base, por lo que no puede afirmarse su calidad en producción.
- Riesgo de sobreajuste: 20.000 pasos sobre 2.500 episodios de un único dominio pueden favorecer la memorización de posiciones y secuencias, con poca robustez ante cambios de iluminación, fondo o posición inicial.
- Fallos de seguridad en interacción humana: varias tareas implican entregar o recibir piezas de una persona; un error de la política puede provocar colisiones o caídas de objetos. Requiere parada de emergencia, límites de fuerza y supervisión.
- "Alucinación" en el contexto robótico: no genera texto libre, pero puede ejecutar acciones incoherentes con la instrucción o confundir piezas visualmente similares (por ejemplo, tornillos de longitud parecida).
- Restricciones de licencia: los pesos se publican como Apache-2.0, lo que permite uso comercial, pero conviene verificar la licencia del modelo base, del dataset `manufacturing_task` y de las dependencias de LeRobot antes de desplegar.
- Repositorio no validado por la comunidad: 0 descargas y 0 "likes" en el momento de la consulta; no hay issues, demos ni informes de terceros que confirmen su funcionamiento.
- Sin datos de robustez ni de calibración: se desconoce el comportamiento ante cámaras descalibradas, oclusiones o fallos de percepción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mysterium99/smolvla_stage1_newtask
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Artículo de SmolVLA: https://huggingface.co/papers/2506.01844
- Dataset de entrenamiento: https://huggingface.co/datasets/manufacturing_task
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=manufacturing_task
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación completa de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
