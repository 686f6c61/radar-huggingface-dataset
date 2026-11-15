# felsager/pi05_cube2cross_v2_all_expert_only_s1

## Resumen

π₀.₅ (Pi05) es un modelo Vision-Language-Action (VLA) desarrollado por Physical Intelligence y orientado a la generalización en entornos abiertos para control robótico. Esta ficha concreta, `felsager/pi05_cube2cross_v2_all_expert_only_s1`, es un fine-tuning del checkpoint base `lerobot/pi05_base` publicado por el usuario felsager, entrenado con la librería LeRobot sobre el dataset propio `felsager/vla_cubes_cross_v2`.

El modelo resuelve una tarea de manipulación muy acotada: recoger un cubo de un color determinado y colocarlo sobre una cruz roja. Trabaja con un robot UR5e con pinza (`ur5e_hand_e`) y dos cámaras (`top` y `wrist`), consumiendo el estado del robot en 10 dimensiones y emitiendo acciones también de 10 dimensiones. El repositorio pesa 20 GB y contiene 4.143.404.816 parámetros en formato safetensors.

Es relevante como ejemplo reproducible de fine-tuning de un VLA sobre hardware asequible y como referencia para quien quiera entrenar políticas de imitación con LeRobot. No obstante, se trata de un experimento personal con cero descargas y cero likes, sin resultados de evaluación publicados, por lo que debe tratarse como material de estudio y no como un artefacto listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀.₅ (Pi05), adaptación LeRobot del repositorio OpenPI de Physical Intelligence |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo orientado a acciones robóticas, no a texto libre) |
| Licencia | gemma |
| Formato de pesos | safetensors |
| Modelo base | lerobot/pi05_base |
| Tipo de robot | ur5e_hand_e |
| Camaras | top, wrist |
| Entradas | observation.state (10,), observation.images.top (3, 480, 640), observation.images.wrist (3, 480, 640) |
| Salidas | action (10,) |
| Libreria | lerobot 0.6.2 |
| Tamano del repositorio | 20.0 GB |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `lerobot/pi05_base`, la implementación en LeRobot del VLA π₀.₅ de Physical Intelligence. La arquitectura subyacente es de tipo Vision-Language-Action: procesa observaciones multimodales (dos flujos de imagen de 480x640 y un vector de estado de 10 dimensiones) y genera directamente un vector de acción de 10 dimensiones para el robot UR5e con pinza. No se dispone en la información proporcionada de detalles sobre el backbone exacto, el número de capas, el mecanismo de atención ni la composición del dataset de preentrenamiento del modelo base.

El entrenamiento se realizó sobre el dataset `felsager/vla_cubes_cross_v2`, con 1000 episodios y 493.474 frames a 30 FPS. Las tareas cubiertas son cuatro variantes de "pick up the [blue|green|yellow|red] cube and place it on the red cross". La configuración de entrenamiento fue: 30.000 pasos, batch size 16, optimizador AdamW, learning rate 5e-05, semilla 1 y LeRobot 0.6.2. No se documenta el uso de RLHF, DPO ni ninguna técnica de alineación adicional; se trata de aprendizaje por imitación supervisado sobre demostraciones.

## Capacidades

- Control robótico de manipulación: genera acciones de 10 dimensiones para un UR5e con pinza a partir de observaciones visuales y de estado.
- Percepción visual multimodal: procesa simultáneamente una cámara cenital (`top`) y una cámara en la muñeca (`wrist`) a resolución 480x640.
- Ejecución de instrucciones en lenguaje natural: acepta una tarea textual como "pick up the blue cube and place it on the red cross" y la traduce en una secuencia de acciones.
- Discriminación por color de objeto: entrenado específicamente para distinguir cubos azul, verde, amarillo y rojo.
- Política de imitación de un solo paso: no se documenta razonamiento multi-paso explícito ni planificación jerárquica.
- No se documenta soporte de tool calling, function calling, agentes ni capacidades multilingües.
- No se documenta modo de razonamiento (thinking), visión general, audio ni generación de texto libre.

## Casos de uso

- Investigación en aprendizaje por imitación: sirve como referencia reproducible de un pipeline completo LeRobot (grabación de dataset, entrenamiento y despliegue) sobre un robot UR5e, útil para grupos que quieran replicar el flujo con sus propios datos.
- Automatización de pick-and-place en laboratorio: el modelo ejecuta la tarea de recoger un cubo de color y colocarlo sobre una cruz roja, adecuado para entornos controlados de investigación donde la variabilidad es baja.
- Benchmark de generalización de VLAs: al estar entrenado sobre un dataset acotado, permite medir cuánto generaliza un fine-tuning de π₀.₅ frente al modelo base en posiciones, iluminación o distracciones no vistas.
- Docencia en robótica: ejemplo didáctico de cómo se define un contrato de observaciones y acciones (state de 10, dos imágenes, action de 10) y se entrena una política con `lerobot-train`.
- Base para fine-tuning posterior: al derivar de `lerobot/pi05_base`, puede reutilizarse como punto de partida para tareas de manipulación similares con el mismo robot y cámaras.
- Pruebas de integración de hardware: el comando `lerobot-rollout` permite validar la cadena robot-cámaras-política en un UR5e real antes de escalar a tareas más complejas.
- Evaluación comparativa de configuraciones de entrenamiento: con semilla fija (seed 1) y parámetros documentados, facilita experimentos controlados sobre número de pasos, batch size o learning rate.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 4.143.404.816 parámetros, una estimación orientativa en fp16 rondaría los 8-9 GB solo de pesos, más el coste de procesar dos imágenes de 480x640, pero el autor no publica cifras.
- GPU recomendadas: no disponible. Para entrenamiento con batch size 16 y 30.000 pasos se requiere una GPU con memoria suficiente para el modelo y el optimizador; el autor no especifica el hardware usado.
- ¿Cabe en GPU de consumo? No confirmado. Por tamaño de parámetros podría caber en GPUs de 16-24 GB en precisión reducida, pero no hay datos publicados que lo verifiquen.
- Opciones de despliegue: LeRobot, mediante el comando `lerobot-rollout` con `--policy.path=felsager/pi05_cube2cross_v2_all_expert_only_s1`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son adecuados para este tipo de política robótica.
- Latencia y throughput: no disponible. La política está pensada para ejecutarse a 30 FPS (frecuencia del dataset), pero no se publican mediciones reales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| felsager/pi05_cube2cross_v2_all_expert_only_s1 | 4.143.404.816 | no disponible | Pick-and-place de cubos sobre cruz roja con UR5e | gemma | Hugging Face, 0 descargas |
| lerobot/pi05_base | no disponible | no disponible | VLA base para generalización en entornos abiertos | no disponible en la informacion | Hugging Face (modelo base) |
| π₀ (Pi0) de Physical Intelligence | no disponible | no disponible | VLA predecesor de π₀.₅ | no disponible en la informacion | OpenPI (open source) |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada. La comparación se limita a parámetros, tarea y disponibilidad.

## Limitaciones y advertencias

- Sin evaluación publicada: la model card declara explícitamente que no hay resultados de éxito en robot real, por lo que se desconoce la tasa de acierto.
- Sesgo de dominio: entrenado solo con cubos de cuatro colores sobre una cruz roja, con un robot y dos cámaras concretas; no generalizará a otros objetos, posiciones extremas ni configuraciones de cámara distintas.
- Riesgo de sobreajuste al dataset: 1000 episodios y 30.000 pasos sobre una tarea muy repetitiva pueden producir una política frágil ante cambios de iluminación, fondo o posiciones iniciales.
- Dependencia de hardware específico: el contrato de observaciones exige exactamente `ur5e_hand_e` con cámaras `top` y `wrist` a 480x640; cualquier desviación rompe la inferencia.
- Licencia Gemma: el uso comercial está sujeto a los términos de la Gemma License, que impone restricciones y obligaciones de atribución; conviene revisarla antes de cualquier despliegue productivo.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusión comunitaria que permita validar su funcionamiento.
- Sin información sobre cuantizaciones ni optimizaciones de inferencia: el despliegue en hardware limitado requeriría trabajo adicional no documentado.
- Riesgo de alucinación en el sentido robótico: puede generar acciones plausibles pero incorrectas si la escena difiere de la distribución de entrenamiento, sin mecanismo de verificación documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/felsager/pi05_cube2cross_v2_all_expert_only_s1
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/felsager/vla_cubes_cross_v2
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=felsager/vla_cubes_cross_v2
- Blog de π₀.₅ de Physical Intelligence: https://www.physicalintelligence.company/blog/pi05
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía LeRobot para pi05: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
