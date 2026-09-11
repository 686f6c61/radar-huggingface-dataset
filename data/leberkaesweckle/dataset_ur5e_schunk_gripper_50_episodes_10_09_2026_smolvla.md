# Leberkaesweckle/Dataset_UR5e_Schunk_Gripper_50_episodes_10_09_2026_SMOLVLA

## Resumen

Este repositorio contiene una política de robótica **SmolVLA** (vision-language-action) afinada por el usuario Leberkaesweckle sobre el modelo base `lerobot/smolvla_base`. No es un modelo de lenguaje: es un modelo de acción que consume observaciones multimodales (estado del robot e imágenes de cámara) y produce comandos de control de 7 dimensiones para un robot UR5e con pinza Schunk. Con 450.046.176 parámetros (unos 450 M), pertenece a la familia de modelos VLA compactos diseñados para ejecutarse en hardware de consumo, según declara el propio autor en la model card.

La política se ha entrenado mediante aprendizaje por imitación sobre un dataset propio de 50 episodios (15.011 fotogramas a 15 FPS) que documenta una única tarea: «Grip the orange block and drop them into the blue box». El entrenamiento se realizó con LeRobot 0.6.2 durante 20.000 pasos, con tamaño de lote 64, optimizador AdamW y tasa de aprendizaje 0,0001.

Su relevancia es la de un ejemplo reproducible de extremo a extremo del flujo de trabajo de LeRobot: grabar datos con un robot real, afinar un VLA preentrenado y desplegarlo con `lerobot-rollout`. El repositorio no incluye resultados de evaluación en robot real ni métricas de éxito, y acumula 0 descargas y 0 «likes» en el momento de redactar esta ficha, por lo que debe considerarse un artefacto experimental y no validado por la comunidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) compacta, basada en SmolVLA (arXiv 2506.01844) |
| Parámetros totales | 450.046.176 (aproximadamente 450 M) |
| Parámetros activos | No aplica: no es un modelo de mezcla de expertos (MoE) |
| Longitud de contexto | No disponible; no es un modelo de lenguaje y la model card no documenta ventana de contexto textual |
| Tipos de cuantización | No disponible; no se publican versiones cuantizadas ni formatos alternativos |
| Idiomas soportados | No disponible; no es multilingüe. La instrucción de tarea del dataset está en inglés («Grip the orange block and drop them into the blue box») |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamaño de repositorio 0,9 GB, coherente con pesos de 16 bits) |
| Tipo de política | Política de imitación condicionada por lenguaje e imágenes |
| Robot objetivo | `ur5_schunk_follower` (UR5e con pinza Schunk) |
| Cámaras | La model card declara `front` y `side`, pero la tabla de entradas lista tres: `observation.images.camera1`, `camera2` y `camera3` |
| Dimensión de observación de estado | `(6,)` |
| Dimensión de salida de acción | `(7,)` |
| Resolución de imagen de entrada | 3 × 256 × 256 por cámara |
| Frecuencia del dataset | 15 FPS |
| Librería | lerobot |

## Arquitectura y entrenamiento

SmolVLA es una arquitectura vision-language-action compacta que combina un codificador visual, un codificador de lenguaje y un decodificador de acciones, con el objetivo declarado de alcanzar rendimiento competitivo con un coste computacional reducido y poder desplegarse en hardware de consumo. En este repositorio concreto, la política parte del checkpoint preentrenado `lerobot/smolvla_base` y se afina para un cuerpo robótico específico: un UR5e con pinza Schunk de 6 grados de libertad de estado y 7 dimensiones de acción (las 6 articulaciones más la apertura/cierre de la pinza). La entrada visual son tres cámaras a 256 × 256 píxeles; conviene señalar la discrepancia documental entre la sección «Model Details», que menciona dos cámaras (`front`, `side`), y la tabla de entradas, que declara tres canales visuales.

El ajuste fino se realizó con LeRobot 0.6.2 sobre el dataset `Leberkaesweckle/Dataset_UR5e_Schunk_Gripper_50_episodes_10_09_2026`: 50 episodios, 15.011 fotogramas, 15 FPS y una única tarea de manipulación (coger el bloque naranja y depositarlo en la caja azul). La configuración de entrenamiento registrada es de 20.000 pasos, lote de 64, optimizador AdamW, tasa de aprendizaje 0,0001 y semilla 1000. No se documenta el uso de RLHF, DPO ni ningún otro método de alineación posterior; se trata de aprendizaje por imitación supervisado puro. También se desconoce si el ajuste congeló componentes del modelo base o si aplicó LoRA u otra técnica de adaptación eficiente, ya que la model card no incluye esa información.

## Capacidades

- Generación de acciones de control de 7 dimensiones (6 articulaciones más pinza) a partir de observaciones visuales y de estado del robot.
- Ejecución de una tarea de manipulación aprendida por imitación: coger un bloque naranja y soltarlo en una caja azul.
- Condicionamiento por instrucción de lenguaje: la política acepta un texto de tarea (`--task="..."`), aunque solo se ha entrenado con una única frase en inglés.
- Percepción multimodal: procesa simultáneamente estado propioceptivo `(6,)` y hasta tres flujos de imagen RGB de 256 × 256.
- Despliegue mediante el ecosistema LeRobot (`lerobot-rollout`) y ajuste posterior mediante `lerobot-train`.
- No dispone de tool calling, function calling, razonamiento multi-paso explícito ni capacidades de agente en el sentido de los modelos de lenguaje.
- No dispone de modo «thinking», visión para descripción de imágenes, audio ni generación de texto libre.

## Casos de uso

- Automatización de pick-and-place en laboratorio: la política está entrenada específicamente para recoger un bloque naranja y depositarlo en una caja azul con un UR5e y pinza Schunk, por lo que puede emplearse tal cual en una celda de demostración de este montaje.
- Banco de pruebas de aprendizaje por imitación: sirve como punto de partida reproducible para comparar hiperparámetros de ajuste fino de SmolVLA (pasos, lote, tasa de aprendizaje) sobre un dataset pequeño de 50 episodios.
- Docencia y formación en robótica: al ser un modelo de 450 M de parámetros con repositorio de 0,9 GB, puede desplegarse en un puesto de trabajo con GPU de gama media para ilustrar el ciclo completo grabación-entrenamiento-despliegue con LeRobot.
- Recolección y ampliación de datos: el mismo pipeline puede reutilizarse para grabar episodios adicionales con la misma tarea y evaluar si el aumento del dataset mejora la tasa de éxito, algo que el autor no ha medido.
- Integración en celdas de manipulación industrial controladas: con la licencia Apache 2.0 no hay restricción de uso comercial, de modo que la política puede integrarse en una línea piloto siempre que el entorno coincida con las condiciones de entrenamiento.
- Investigación en generalización de cuerpo robótico: al derivar de `lerobot/smolvla_base`, permite estudiar cuánto conocimiento transferible conserva un VLA preentrenado tras un ajuste fino con solo 15.011 fotogramas.
- Evaluación de robustez ante cambios de iluminación, posición de objetos o distractores: el repositorio no aporta esas mediciones, por lo que constituye una línea de trabajo directa para quien adopte la política.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye explícitamente la línea «No evaluation results have been provided for this policy yet» y la tabla de evaluación aparece vacía, sin número de ensayos, éxitos ni tasa de éxito. Tampoco se han facilitado curvas de pérdida de entrenamiento, métricas de error de acción ni comparaciones con otras políticas sobre la misma tarea. El artículo asociado a la arquitectura (arXiv 2506.01844) puede contener evaluaciones del modelo base, pero esas cifras no son atribuibles a este ajuste fino concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: con 450 M de parámetros y pesos en 16 bits, la carga de pesos ronda los 0,9 GB (el repositorio completo ocupa 0,9 GB); sumando activaciones y los búferes de tres cámaras a 256 × 256, una estimación razonable es inferior a 2 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM sirve para inferencia. Para entrenamiento se recomienda una GPU con 12 GB o más (RTX 3060 12 GB, RTX 4070/4080, RTX 4090) por el lote de 64 declarado en la configuración de entrenamiento.
- Cabe en GPU de consumo: sí, previsiblemente en GTX 1650 4 GB o superiores, RTX 3050, RTX 3060, RTX 4060, RTX 4090. No se requieren A100 ni H100 para inferencia.
- Despliegue: el soporte documentado es exclusivamente LeRobot (`lerobot-rollout` para ejecución, `lerobot-train` para reentrenamiento) sobre PyTorch. No hay soporte publicado para vLLM, llama.cpp, Ollama, TGI ni formatos GGUF, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. Como referencia indirecta, el dataset se grabó a 15 FPS, lo que sugiere que la política debe operar en el entorno de decenas de milisegundos por paso para reproducir la dinámica de control observada, pero no se ha publicado ninguna medición de latencia real.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (SmolVLA afinado para UR5e + Schunk) | 450.046.176 | Tres cámaras 3×256×256 más estado `(6,)` | Sin resultados de evaluación publicados | Apache 2.0 | HuggingFace, vía LeRobot |
| `lerobot/smolvla_base` (modelo base) | No disponible en la información proporcionada | No disponible | No disponible | No disponible en la información proporcionada | HuggingFace, vía LeRobot |
| Otras políticas de imitación del ecosistema LeRobot (ACT, Diffusion Policy) | No disponible en la información proporcionada | No disponible | No disponible | No disponible en la información proporcionada | Documentadas en la documentación de LeRobot |
| Otros VLA abiertos de mayor tamaño (por ejemplo OpenVLA o pi0) | No disponible en la información proporcionada | No disponible | No disponible | No disponible en la información proporcionada | No disponible |

La información proporcionada solo permite una comparación cualitativa: este repositorio es un ajuste fino de un único cuerpo robótico y una única tarea, mientras que el modelo base y las alternativas citadas son políticas de propósito más general. No hay datos suficientes para comparar parámetros, contexto ni rendimiento con rigor.

## Limitaciones y advertencias

- Especialización extrema: la política se ha entrenado con 50 episodios y una sola tarea; es previsible que falle ante objetos, posiciones o instrucciones distintas de «coger el bloque naranja y depositarlo en la caja azul».
- Ausencia total de evaluación: no hay tasa de éxito medida en robot real, ni número de ensayos, ni condiciones de prueba, por lo que se desconoce su fiabilidad efectiva.
- Dependencia del cuerpo robótico: está ajustada a `ur5_schunk_follower` con estado de 6 dimensiones y acciones de 7; no se ha demostrado transferencia a otro robot, aunque comparta tipo.
- Ambigüedad en la configuración de cámaras: la model card menciona dos cámaras (`front`, `side`) pero la tabla de entradas declara tres; los nombres de cámara del comando de despliegue deben coincidir con las claves de observación del entrenamiento, y una discrepancia en este punto impediría la ejecución correcta.
- Sensibilidad al entorno: al entrenarse con 15.011 fotogramas en condiciones no documentadas, cabe esperar degradación ante cambios de iluminación, fondo, posición inicial del objeto o presencia de distractores. No se han medido esos efectos.
- Riesgo de fallo silencioso: en robótica, un VLA no «alucina» texto, pero sí puede producir secuencias de acción plausibles y erróneas; se recomienda supervisión humana, límites de par y paradas de emergencia en cualquier despliegue físico.
- Idiomas: la instrucción de tarea se ha entrenado en inglés; no hay evidencia de que responda a instrucciones en castellano ni en otros idiomas.
- Sesgos de datos: el dataset es de un único operador, un único entorno y una única configuración de hardware, por lo que hereda cualquier sesgo de demostración (trayectorias, velocidades, puntos de agarre).
- Licencia: Apache 2.0 permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte, y el modelo se distribuye sin validación de terceros (0 descargas, 0 «likes»).
- Requisito de reproducibilidad: para reentrenar hacen falta el dataset original, LeRobot 0.6.2 y el modelo base; no se documentan semillas adicionales, particiones de validación ni criterios de parada distintos de los 20.000 pasos fijos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Leberkaesweckle/Dataset_UR5e_Schunk_Gripper_50_episodes_10_09_2026_SMOLVLA
- Dataset de entrenamiento: https://huggingface.co/datasets/Leberkaesweckle/Dataset_UR5e_Schunk_Gripper_50_episodes_10_09_2026
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Artículo de SmolVLA (identificador arXiv citado en las etiquetas del repositorio): https://huggingface.co/papers/2506.01844
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de inferencia y despliegue de LeRobot: https://huggingface.co/docs/lerobot/main/en/inference
- Guía de grabación de datos y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Guía de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Referencia rápida de comandos de LeRobot: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Visualizador del dataset en HuggingFace Spaces: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Leberkaesweckle/Dataset_UR5e_Schunk_Gripper_50_episodes_10_09_2026
- Búsqueda web: los resultados devueltos no guardan relación con el modelo (sitios de apuestas deportivas), por lo que no se incluye ninguno como referencia técnica.
