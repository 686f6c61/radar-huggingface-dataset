# felsager/pi05_cube2cross_v2_all_wd03_s1

## Resumen

π₀.₅ (Pi05) es un modelo visión-lenguaje-acción (VLA) desarrollado por Physical Intelligence, diseñado para la generalización en entornos abiertos y para controlar robots manipuladores a partir de instrucciones en lenguaje natural. Esta ficha concreta corresponde a un *fine-tuning* del modelo base `lerobot/pi05_base` realizado por el usuario felsager mediante LeRobot, orientado a una tarea de manipulación muy específica: coger un cubo de color y colocarlo sobre una cruz roja.

El modelo combina percepción visual (dos cámaras, una cenital y otra en la muñeca), comprensión del lenguaje y generación de acciones motoras continuas en un único transformer. Con 4.143.404.816 parámetros (aproximadamente 4,1 mil millones), se trata de un modelo de tamaño medio que requiere GPU para inferencia en tiempo real. El repositorio ocupa 42,6 GB, lo que incluye los pesos en `safetensors` y posiblemente los *optimizer states* del entrenamiento.

La relevancia de esta publicación es acotada: es un *checkpoint* de investigación con cero descargas y sin resultados de evaluación publicados, entrenado sobre un *dataset* propio de 1.000 episodios y 493.474 *frames* a 30 FPS. Resulta útil como referencia de un flujo completo de *fine-tuning* de π₀.₅ con LeRobot sobre un robot UR5e con mano, pero no debe considerarse un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀.₅, adaptación LeRobot del repositorio OpenPI de Physical Intelligence |
| Parámetros totales | 4.143.404.816 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (las instrucciones de tarea están en inglés) |
| Licencia | gemma |
| Formato de pesos | safetensors |
| Librería | lerobot |
| Modelo base | lerobot/pi05_base |
| Tipo de robot | ur5e_hand_e |
| Cámaras | top, wrist |
| Entrada de estado | observation.state, shape (10,) |
| Entrada visual | observation.images.top y observation.images.wrist, shape (3, 480, 640) |
| Salida de acción | action, shape (10,) |
| Tamaño del repositorio | 42,6 GB |
| Pipeline | robotics |

## Arquitectura y entrenamiento

El modelo es un VLA construido sobre la arquitectura π₀.₅ de Physical Intelligence, que evoluciona π₀ para generalizar a entornos y situaciones no vistos durante el entrenamiento. La implementación utilizada es la de LeRobot, adaptada del repositorio OpenPI de código abierto. El modelo consume dos flujos de imagen (cámara cenital y de muñeca) de 480×640 píxeles, un vector de estado propioceptivo de 10 dimensiones y una instrucción textual de tarea, y produce un vector de acción de 10 dimensiones. No se detalla en la información disponible si emplea *action chunking*, *flow matching* u otra técnica de decodificación de acciones, ni la composición exacta del *backbone* de lenguaje y visión.

El *fine-tuning* se realizó sobre el *dataset* `felsager/vla_cubes_cross_v2`, con 1.000 episodios, 493.474 *frames* a 30 FPS y cuatro tareas de recogida y colocación de cubos de colores (azul, verde, amarillo y rojo) sobre una cruz roja. La configuración de entrenamiento fue de 30.000 pasos, *batch size* 16, optimizador AdamW, tasa de aprendizaje 5e-05, semilla 1 y LeRobot 0.6.2. No se especifica el número de tokens de entrenamiento ni si hubo etapas de RLHF o DPO; al tratarse de aprendizaje por imitación, lo habitual es que no las haya.

## Capacidades

- Control robótico de manipulación a partir de instrucciones en lenguaje natural, con generación de acciones continuas de 10 dimensiones.
- Percepción visual multimodal mediante dos cámaras simultáneas (cenital y de muñeca).
- Ejecución de cuatro tareas concretas de *pick-and-place*: coger el cubo azul, verde, amarillo o rojo y colocarlo sobre la cruz roja.
- Aprendizaje por imitación a partir de demostraciones teleoperadas, sin refuerzo explícito.
- Integración con el ecosistema LeRobot para *rollout* en robot real y para reentrenamiento.
- No se documentan capacidades de *tool calling*, razonamiento multi-paso, agentes, visión general, audio ni modo *thinking*; es un modelo específico de política robótica, no un LLM conversacional.

## Casos de uso

- Automatización de *pick-and-place* en laboratorio: el modelo ejecuta la tarea de coger un cubo de color y depositarlo sobre una cruz roja con un UR5e equipado con mano, usando las dos cámaras como única entrada perceptiva. Es adecuado porque fue entrenado exactamente sobre esa configuración y ese *dataset*.
- Reproducción de experimentos de VLA: sirve como referencia para comparar el rendimiento de π₀.₅ frente a otras políticas de imitación en una tarea de manipulación acotada y bien definida.
- Base para *fine-tuning* adicional: al derivar de `lerobot/pi05_base` y estar publicado en LeRobot, puede reutilizarse como punto de partida para nuevas tareas de manipulación con el mismo robot y montaje de cámaras.
- Docencia y formación en robótica: permite ilustrar el flujo completo de grabación de datos, entrenamiento y despliegue con LeRobot sin necesidad de entrenar desde cero.
- Validación de *pipelines* de inferencia: útil para probar la integración de `lerobot-rollout`, la calibración de cámaras y la latencia de control a 30 FPS en un UR5e real.
- Pruebas de robustez ante variaciones de iluminación y posición de objetos: aunque no hay evaluación publicada, el *checkpoint* permite medir experimentalmente la degradación al cambiar condiciones respecto al *dataset* original.
- Generación de datos sintéticos de evaluación: puede emplearse para producir trayectorias de referencia y comparar con otras políticas entrenadas sobre el mismo *dataset*.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La *model card* indica explícitamente que no se han proporcionado resultados de evaluación para esta política y que la tabla de evaluación real en robot está vacía.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 4,14 mil millones de parámetros, en FP16 se necesitan aproximadamente 8,3 GB solo para pesos; en BF16/FP16 con *buffers* de activación y dos flujos de imagen de 480×640, es razonable prever un consumo superior a 12-16 GB, aunque no hay cifra confirmada.
- GPU recomendadas: no disponible. Por tamaño, una GPU con 24 GB o más (RTX 4090, A100 40 GB, H100) es el entorno natural; no se confirma compatibilidad con GPUs de 8-12 GB.
- ¿Cabe en GPU de consumo? Probablemente en RTX 4090 (24 GB) en FP16, pero no está verificado en la información disponible.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--strategy.type=base`). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un modelo de política robótica.
- Latencia y *throughput*: no disponibles. El *dataset* se grabó a 30 FPS, lo que sugiere que el bucle de control opera a esa frecuencia, pero no se confirma que la inferencia alcance ese ritmo en hardware concreto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| felsager/pi05_cube2cross_v2_all_wd03_s1 | 4.143.404.816 | no disponible | Pick-and-place de cubos sobre cruz con UR5e | gemma | Hugging Face, 0 descargas |
| lerobot/pi05_base | no disponible | no disponible | VLA base para *fine-tuning* | no disponible en la información | Hugging Face (modelo base) |
| π₀ (Pi0) de Physical Intelligence | no disponible | no disponible | VLA predecesor de π₀.₅ | no disponible en la información | OpenPI (código abierto) |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo altamente especializado: solo se ha entrenado para cuatro tareas de *pick-and-place* sobre una cruz roja con cubos de cuatro colores; no generaliza a otras tareas sin reentrenamiento.
- Dependencia del montaje físico: requiere un UR5e con mano, dos cámaras con nombres `top` y `wrist`, y una configuración de calibración idéntica o muy similar a la del *dataset*.
- Sin evaluación publicada: no hay tasas de éxito en robot real, por lo que se desconoce su fiabilidad y su robustez ante cambios de iluminación, posición o distracciones.
- Riesgo de sobreajuste al *dataset*: 1.000 episodios y 30.000 pasos de entrenamiento con un único montaje sugieren poca variabilidad; es esperable un rendimiento degradado fuera de la distribución de entrenamiento.
- Licencia `gemma`: impone restricciones de uso comercial y obligaciones de atribución; debe revisarse la licencia Gemma completa antes de cualquier despliegue productivo.
- Idiomas: las instrucciones de tarea del *dataset* están en inglés; no se documenta soporte multilingüe.
- Sin datos de sesgos, alucinación o robustez adversarial; al ser un modelo de control motor, los fallos se manifiestan como acciones incorrectas o inseguras, no como texto alucinado.
- Repositorio de 42,6 GB: requiere espacio en disco y ancho de banda considerables para su descarga.
- Cero descargas y cero *likes*: no hay evidencia de uso comunitario ni de validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/felsager/pi05_cube2cross_v2_all_wd03_s1
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/felsager/vla_cubes_cross_v2
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=felsager/vla_cubes_cross_v2
- Blog de π₀.₅ (Physical Intelligence): https://www.physicalintelligence.company/blog/pi05
- Repositorio OpenPI: https://github.com/Physical-Intelligence/openpi
- LeRobot (GitHub): https://github.com/huggingface/lerobot
- Guía de π₀.₅ en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Documentación de inferencia/*rollout*: https://huggingface.co/docs/lerobot/main/en/inference
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Chuleta de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
