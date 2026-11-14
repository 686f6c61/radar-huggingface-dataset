# felsager/pi05_cube2cross_v2_all_bf16_s1-ema

## Resumen

π₀.₅ (Pi05) es un modelo de visión-lenguaje-acción (VLA) desarrollado por Physical Intelligence y orientado a la generalización en entornos abiertos. Esta ficha concreta, `felsager/pi05_cube2cross_v2_all_bf16_s1-ema`, es un ajuste fino del modelo base `lerobot/pi05_base` realizado por el usuario felsager mediante la librería LeRobot, especializado en una tarea de manipulación robótica muy concreta: coger cubos de colores y colocarlos sobre una cruz roja.

El modelo consume observaciones multimodales (estado del robot de 10 dimensiones y dos cámaras RGB de 480x640) y produce un vector de acción de 10 dimensiones para un robot UR5e con pinza. Se distribuye en formato safetensors con 4.143.404.816 parámetros y un tamaño de repositorio de 9,4 GB, lo que corresponde a pesos en bf16.

Es relevante como ejemplo de flujo de trabajo de imitación robótica de extremo a extremo con LeRobot: un dataset de 1000 episodios y 493.474 fotogramas a 30 FPS, entrenamiento de 30.000 pasos con AdamW y un learning rate de 5e-05. No obstante, se trata de un checkpoint de investigación sin resultados de evaluación publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀.₅ (Pi05), implementación LeRobot adaptada de OpenPI |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | gemma |
| Formato de pesos | safetensors |
| Modelo base | lerobot/pi05_base |
| Tipo de robot | ur5e_hand_e |
| Camaras | top, wrist (3, 480, 640) |
| Entrada de estado | observation.state (10,) |
| Salida de accion | action (10,) |
| Dataset de entrenamiento | felsager/vla_cubes_cross_v2 (1000 episodios, 493.474 fotogramas, 30 FPS) |
| Pasos de entrenamiento | 30.000 |
| Batch size | 16 |
| Optimizador | AdamW |
| Learning rate | 5e-05 |
| Semilla | 1 |
| Version de LeRobot | 0.6.2 |
| Tamano del repositorio | 9,4 GB |

## Arquitectura y entrenamiento

El modelo se basa en π₀.₅ (Pi05), un modelo de visión-lenguaje-acción de Physical Intelligence diseñado para la generalización en entornos abiertos. La implementación utilizada es la de LeRobot, adaptada del repositorio OpenPI de Physical Intelligence. La arquitectura combina percepción visual (dos cámaras), estado proprioceptivo del robot y una instrucción en lenguaje natural para generar acciones de control de bajo nivel. No se dispone de detalles adicionales sobre la composición interna, el número de tokens de entrenamiento del modelo base ni sobre si se aplicaron técnicas de RLHF o DPO.

El ajuste fino se realizó sobre el dataset `felsager/vla_cubes_cross_v2`, compuesto por 1000 episodios y 493.474 fotogramas grabados a 30 FPS. Las tareas cubiertas son cuatro variantes de una misma habilidad: coger un cubo (azul, verde, amarillo o rojo) y colocarlo sobre la cruz roja. El entrenamiento se ejecutó durante 30.000 pasos con batch size 16, optimizador AdamW y learning rate 5e-05, con semilla 1. El sufijo `ema` del nombre sugiere que los pesos publicados corresponden a una media móvil exponencial, aunque la model card no lo confirma explícitamente.

## Capacidades

- Control robótico de manipulación: genera acciones de 10 dimensiones para un UR5e con pinza a partir de observaciones visuales y de estado.
- Percepción visual multimodal: procesa simultáneamente dos cámaras (vista superior y vista de muñeca) a resolución 480x640.
- Seguimiento de instrucciones en lenguaje natural: la tarea se especifica como texto (por ejemplo, "pick up the blue cube and place it on the red cross.").
- Discriminación de objetos por color: entrenado para distinguir cubos azules, verdes, amarillos y rojos.
- Ejecución de políticas de imitación en tiempo real a 30 FPS.
- Integración con el ecosistema LeRobot: entrenamiento, rollout y visualización de datasets mediante CLI (`lerobot-train`, `lerobot-rollout`).
- No se ha documentado soporte de tool calling, razonamiento multi-paso genérico, capacidades multilingües amplias ni modos de "thinking".

## Casos de uso

- Pick-and-place industrial de precisión: el modelo puede ejecutar la tarea de recoger un objeto y depositarlo en una ubicación objetivo sobre un UR5e, adecuado para células de montaje donde la posición del objeto varía entre ciclos.
- Clasificación y manipulación por color: útil en líneas de selección donde hay que separar piezas por código de color antes de depositarlas en una zona común.
- Prototipado rápido de políticas robóticas: sirve como punto de partida para que un equipo entrene su propia política con `lerobot-train` partiendo de `lerobot/pi05_base` y sustituyendo el dataset por uno propio.
- Investigación en imitación visual-motora: el checkpoint y su dataset asociado permiten reproducir experimentos de aprendizaje por imitación con dos vistas de cámara y estado proprioceptivo.
- Benchmark interno de VLA: al ser un ajuste fino sobre π₀.₅ con una tarea acotada, puede usarse como referencia para comparar variantes de datos, aumentos o hiperparámetros.
- Demostraciones y validación de hardware: el comando `lerobot-rollout` con `--strategy.type=base` permite ejecutar la política sin grabar episodios, lo que facilita pruebas de integración del UR5e y las cámaras antes de desplegar en producción.
- Educación y formación: ejemplo didáctico completo de pipeline LeRobot, desde la grabación del dataset hasta el rollout en robot real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política (*"No evaluation results have been provided for this policy yet."*).

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en bf16 ocupan aproximadamente 8,3 GB (4.143.404.816 parámetros x 2 bytes), más overhead de activaciones y buffers de las dos cámaras; se recomienda al menos 16 GB de VRAM para operar con margen.
- GPU recomendadas: NVIDIA A100, H100 o L40S para despliegue en laboratorio; RTX 4090 (24 GB) es suficiente para inferencia en bf16.
- GPU de consumo: cabe en RTX 4090 y RTX 3090 (24 GB). En tarjetas de 16 GB (RTX 4080, 4070 Ti Super) es probable que funcione con cuantización, aunque no se han publicado pesos cuantizados ni instrucciones al respecto.
- Opciones de despliegue: LeRobot (`lerobot-rollout`) es la vía documentada. No se mencionan integraciones con vLLM, TGI, llama.cpp u Ollama, que además no aplican directamente a un modelo de acción robótica.
- Latencia y throughput: no disponibles. El dataset se grabó a 30 FPS, lo que sugiere que el bucle de control opera en ese orden de magnitud, pero no se han publicado mediciones de latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| felsager/pi05_cube2cross_v2_all_bf16_s1-ema | 4.143.404.816 | no disponible | Pick-and-place de cubos sobre cruz roja (UR5e) | gemma | Hugging Face (LeRobot) |
| lerobot/pi05_base | no disponible | no disponible | VLA generalista base para ajuste fino | gemma | Hugging Face (LeRobot) |
| π₀ (Pi0) de Physical Intelligence | no disponible | no disponible | VLA generalista predecesor de π₀.₅ | no disponible en la informacion proporcionada | OpenPI (código abierto) |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Especialización extrema: el modelo solo ha sido entrenado para cuatro tareas de pick-and-place sobre una cruz roja; no generaliza a otras habilidades sin reentrenamiento.
- Sin evaluación publicada: no existen tasas de éxito medidas, por lo que se desconoce su fiabilidad real en el robot.
- Dependencia de hardware concreto: asume un UR5e con pinza y dos cámaras con nombres y calibración específicos (`top`, `wrist`); cambios de montaje o iluminación pueden degradar el rendimiento.
- Riesgo de alucinación motora: como todo modelo generativo de acciones, puede producir trayectorias inválidas o colisiones en estados fuera de distribución.
- Sesgos de dataset: 1000 episodios de un único entorno y operador; probable sobreajuste a posiciones, colores y condiciones de iluminación del dataset.
- Licencia Gemma: el uso comercial está sujeto a los términos de la licencia Gemma de Google, que impone restricciones y obligaciones de atribución; conviene revisarla antes de un despliegue productivo.
- Idiomas: no se documenta soporte multilingüe; las instrucciones de tarea están en inglés.
- Sin cuantizaciones publicadas: no hay GGUF ni otras variantes ligeras, lo que limita el despliegue en hardware modesto.
- Repositorio sin descargas ni likes en el momento de la consulta: no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/felsager/pi05_cube2cross_v2_all_bf16_s1-ema
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/felsager/vla_cubes_cross_v2
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=felsager/vla_cubes_cross_v2
- Blog de π₀.₅ (Physical Intelligence): https://www.physicalintelligence.company/blog/pi05
- Repositorio OpenPI: https://github.com/Physical-Intelligence/openpi
- LeRobot (GitHub): https://github.com/huggingface/lerobot
- Guía de LeRobot para pi05: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
