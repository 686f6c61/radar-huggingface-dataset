# felsager/pi05_cube2cross_v2_all_s1

## Resumen

π₀.₅ (Pi05) es un modelo de visión-lenguaje-acción (VLA) desarrollado por Physical Intelligence y diseñado para la generalización en entornos abiertos. Evoluciona el modelo π₀ para generalizar a situaciones y entornos completamente nuevos no vistos durante el entrenamiento. Esta ficha concreta, `felsager/pi05_cube2cross_v2_all_s1`, es un ajuste fino del modelo base `lerobot/pi05_base` orientado a una tarea robótica específica de manipulación.

El modelo ha sido entrenado con el framework LeRobot de Hugging Face, que adapta la implementación de código abierto OpenPI de Physical Intelligence. El ajuste fino se ha realizado sobre el dataset `felsager/vla_cubes_cross_v2`, compuesto por 1000 episodios y 493.474 fotogramas a 30 FPS, con cuatro tareas de recogida y colocación de cubos de colores sobre una cruz roja.

El modelo opera sobre un robot `ur5e_hand_e` con dos cámaras (vista superior y vista de muñeca) y produce acciones de 10 dimensiones a partir de un estado de 10 dimensiones y dos imágenes de 480x640. Con 4.143.404.816 parámetros totales y un tamaño de repositorio de 42,6 GB, es un modelo de gran tamaño para robótica que requiere infraestructura de GPU dedicada para inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA), basada en π₀.₅ (Pi05) de Physical Intelligence |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | gemma |
| Formato de pesos | safetensors |
| Modelo base | lerobot/pi05_base |
| Tipo de robot | ur5e_hand_e |
| Camaras | top, wrist |
| Entrada de estado | observation.state (10,) |
| Entrada visual | observation.images.top (3, 480, 640), observation.images.wrist (3, 480, 640) |
| Salida de accion | action (10,) |
| Framework | LeRobot 0.6.2 |
| Tamano del repositorio | 42,6 GB |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de π₀.₅, un modelo VLA de Physical Intelligence que combina percepción visual, comprensión del lenguaje y generación de acciones motoras en un único modelo. La implementación utilizada es la de LeRobot, adaptada del repositorio OpenPI de Physical Intelligence. No se dispone de detalles adicionales sobre la arquitectura interna (número de capas, mecanismo de atención, composición exacta del backbone) en la información proporcionada.

El entrenamiento se realizó mediante ajuste fino supervisado sobre el dataset `felsager/vla_cubes_cross_v2`, con 1000 episodios y 493.474 fotogramas a 30 FPS. La configuración de entrenamiento incluye 30.000 pasos, batch size de 16, optimizador AdamW, learning rate de 5e-05 y semilla 1, usando LeRobot 0.6.2. Las tareas del dataset son cuatro variantes de "pick up the [color] cube and place it on the red cross" para los colores azul, verde, amarillo y rojo. No se dispone de información sobre si se aplicaron técnicas de RLHF, DPO u otras innovaciones técnicas específicas en este ajuste.

## Capacidades

- Manipulación robótica de precisión: recogida y colocación de cubos de colores sobre una cruz roja, con cuatro variantes de tarea según el color del cubo.
- Percepción visual multimodal: procesa simultáneamente dos flujos de imagen (vista superior y vista de muñeca) de 480x640 píxeles.
- Control de robot UR5e con mano: genera acciones de 10 dimensiones para un robot `ur5e_hand_e`.
- Ejecución de políticas de imitación: el modelo ha sido entrenado mediante aprendizaje por imitación sobre demostraciones humanas.
- Generalización en entornos abiertos: según la documentación de π₀.₅, el modelo está diseñado para generalizar a entornos y situaciones nuevos no vistos durante el entrenamiento.
- Integración con LeRobot: compatible con el ecosistema de entrenamiento, evaluación y despliegue de LeRobot.
- No se dispone de información sobre soporte de tool calling, agentes multi-paso, capacidades multilingües o modos de razonamiento explícito en la información proporcionada.

## Casos de uso

- Automatización de tareas de pick-and-place en línea de montaje: el modelo puede ejecutar la recogida de cubos de colores y su colocación sobre una cruz roja, una tarea representativa de operaciones de clasificación y posicionamiento en entornos industriales controlados.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar cómo los modelos VLA generalizan a partir de demostraciones, gracias a su base π₀.₅ y a la disponibilidad del dataset de entrenamiento.
- Benchmark de referencia para políticas robóticas: al estar entrenado sobre un dataset público con tareas bien definidas, puede utilizarse como línea base para comparar nuevas políticas de manipulación.
- Prototipado rápido con LeRobot: el flujo de despliegue con `lerobot-rollout` permite probar la política en un robot UR5e real con dos cámaras en cuestión de minutos.
- Reentrenamiento y ajuste fino para nuevas tareas: el modelo puede servir como inicialización para fine-tuning sobre otros datasets de manipulación, aprovechando el conocimiento del modelo base π₀.₅.
- Docencia y formación en robótica: permite ilustrar el ciclo completo de un proyecto de aprendizaje por imitación, desde la grabación de datos hasta el despliegue en hardware real.
- Evaluación de robustez visual: al usar dos cámaras con vistas complementarias, es útil para estudiar cómo la fusión de información visual afecta al éxito de la manipulación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política y que no se han realizado pruebas de éxito en robot real documentadas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 4.143.404.816 parámetros y pesos en safetensors (42,6 GB de repositorio), se requiere una GPU con al menos 48 GB de VRAM en precisión completa (FP32/BF16), o menos si se aplican cuantizaciones, aunque no se documentan formatos de cuantización soportados.
- GPU recomendadas: no disponible. Por el tamaño del modelo, se necesitan GPUs de clase profesional como A100 (40/80 GB), H100 o L40S. No se confirma compatibilidad con GPUs de consumo.
- Cabe en consumer GPU: no disponible. El tamaño de 42,6 GB del repositorio y los 4.140 millones de parámetros hacen improbable su ejecución en GPUs de consumo sin cuantización agresiva, que no está documentada.
- Opciones de despliegue: LeRobot mediante `lerobot-rollout` con `--policy.path=felsager/pi05_cube2cross_v2_all_s1`. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, dado que es un modelo de robótica y no un LLM de texto.
- Latencia y throughput: no disponible. La política se ejecuta a 30 FPS según la frecuencia del dataset de entrenamiento, pero no se proporcionan métricas de latencia de inferencia.
- Requisitos adicionales: robot UR5e con mano, dos cámaras (top y wrist) configuradas a 640x480 y 30 FPS, y el paquete `lerobot` instalado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| felsager/pi05_cube2cross_v2_all_s1 | 4.143.404.816 | no disponible | VLA (π₀.₅ fine-tuned) | gemma | Hugging Face |
| lerobot/pi05_base | no disponible | no disponible | VLA (π₀.₅ base) | no disponible | Hugging Face |
| π₀ (Pi0) | no disponible | no disponible | VLA | no disponible | OpenPI (código abierto) |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada. La comparativa se limita a aspectos estructurales y de disponibilidad.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos específicos, pero al estar entrenado sobre un dataset limitado a cubos de cuatro colores y una cruz roja, el modelo probablemente no generaliza a otros objetos, colores o configuraciones sin reentrenamiento.
- Riesgo de alucinación: no aplica en el sentido textual, pero el modelo puede generar acciones incorrectas o inseguras ante configuraciones visuales no vistas durante el entrenamiento.
- Limitaciones de contexto o idioma: no se dispone de información sobre longitud de contexto ni capacidades multilingües. Las tareas están definidas en inglés en el dataset.
- Restricciones de licencia: la licencia es "gemma", lo que implica que se aplican los términos de la licencia Gemma de Google. Es necesario revisar dichos términos para uso comercial, especialmente en lo relativo a restricciones de uso y obligaciones de atribución.
- Caveat para producción: el modelo no ha sido evaluado en robot real según la model card, por lo que no hay métricas de tasa de éxito. Su uso en producción requeriría una validación exhaustiva previa.
- Dependencia de hardware específico: requiere un robot UR5e con mano y dos cámaras configuradas exactamente como en el entrenamiento (nombres `top` y `wrist`, resolución 640x480, 30 FPS).
- Tamaño del modelo: 42,6 GB de repositorio y 4.140 millones de parámetros implican requisitos de hardware elevados y tiempos de carga considerables.
- Dataset de entrenamiento limitado: 1000 episodios y cuatro tareas específicas; la generalización fuera de este dominio es incierta.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/felsager/pi05_cube2cross_v2_all_s1)
- [Dataset de entrenamiento](https://huggingface.co/datasets/felsager/vla_cubes_cross_v2)
- [Modelo base lerobot/pi05_base](https://huggingface.co/lerobot/pi05_base)
- [Blog de π₀.₅ en Physical Intelligence](https://www.physicalintelligence.company/blog/pi05)
- [Guía de LeRobot para pi05](https://huggingface.co/docs/lerobot/main/en/pi05)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
- [Repositorio LeRobot en GitHub](https://github.com/huggingface/lerobot)
- [Visualizador del dataset](https://huggingface.co/spaces/lerobot/visualize_dataset?path=felsager/vla_cubes_cross_v2)
- [Guía de instalación de LeRobot](https://huggingface.co/docs/lerobot/main/en/installation)
- [Guía de hardware de LeRobot](https://huggingface.co/docs/lerobot/main/en/hardware_guide)
- [Guía de grabación y entrenamiento](https://huggingface.co/docs/lerobot/en/il_robots)
- [Cheat-sheet de CLI de LeRobot](https://huggingface.co/docs/lerobot/main/en/cheat-sheet)
- [Documentación de inferencia (rollout)](https://huggingface.co/docs/lerobot/main/en/inference)
