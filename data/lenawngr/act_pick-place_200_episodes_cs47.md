# lenawngr/ACT_pick-place_200_episodes_cs47

## Resumen

ACT_pick-place_200_episodes_cs47 es una política de imitación basada en Action Chunking with Transformers (ACT), entrenada con LeRobot y publicada en Hugging Face por el usuario lenawngr. El modelo resuelve una tarea concreta de manipulación robótica —pick-and-place— sobre el conjunto de datos `lenawngr/pick-place_so101`, y no es un modelo de lenguaje general: su salida son acciones motoras, no texto. Con 51.614.342 parámetros y un repositorio de 0,2 GB, es un checkpoint compacto pensado para ejecutarse en el bucle de control de un robot de bajo coste tipo SO-101.

El interés de esta ficha es doble. Por un lado, documenta un caso real de despliegue de ACT con 200 episodios de teleoperación, útil para quienes quieran reproducir el flujo de entrenamiento y evaluación con LeRobot. Por otro, sirve como ejemplo de las limitaciones de los modelos robóticos de imitación: generalización estrecha, dependencia de la distribución de datos y ausencia de benchmarks publicados en la información disponible.

La licencia Apache 2.0 permite uso comercial, pero el rendimiento real del checkpoint no puede evaluarse sin ejecutarlo en el hardware objetivo, ya que la model card no aporta tasas de éxito ni métricas de validación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT), transformer con codificador visual y decodificador de acciones por chunks |
| Parametros totales | 51.614.342 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de control; ventana de observaciones definida por la configuración de entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, sin entrada/salida de texto) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que predice secuencias cortas de acciones (chunks) en lugar de pasos individuales, lo que reduce el error de composición y mitiga el problema de paradas bruscas típico de las políticas paso a paso. La arquitectura combina un codificador de imágenes (habitualmente ResNet) con un transformer que atiende conjuntamente a las observaciones visuales y al estado de las articulaciones, y un decodificador que genera el chunk de acciones. La referencia técnica es el paper arXiv:2304.13705.

El entrenamiento se realizó con LeRobot sobre el dataset `lenawngr/pick-place_so101`, compuesto por 200 episodios de teleoperación en el robot SO-101. No se dispone de información sobre el número exacto de frames, la composición de las trayectorias, la resolución de las cámaras ni si se aplicaron aumentaciones de datos. Tampoco consta el uso de RLHF ni de DPO, algo esperable en un modelo de imitación supervisada. La model card no documenta hiperparámetros de entrenamiento, número de épocas ni curva de pérdida.

## Capacidades

- Control robótico de pick-and-place: genera comandos articulares para recoger y colocar objetos sobre el robot SO-101.
- Aprendizaje por imitación a partir de demostraciones teleoperadas, sin refuerzo explícito.
- Predicción de chunks de acción, lo que aporta suavidad y consistencia temporal en la ejecución.
- Entrada multimodal: observaciones visuales (cámaras) y estado de las articulaciones del robot.
- Integración nativa con el ecosistema LeRobot para entrenamiento, evaluación y despliegue.
- No dispone de tool calling, function calling, razonamiento multi-paso simbólico ni capacidades multilingües.

## Casos de uso

- Reproducción de experimentos de imitación: sirve como checkpoint de referencia para comparar variantes de ACT con el mismo dataset y hardware, permitiendo aislar el efecto de cambios en aumentación o hiperparámetros.
- Automatización de una celda pick-and-place de laboratorio: el modelo puede ejecutar la tarea sobre el SO-101 en entornos controlados con objetos y posiciones similares a los del dataset de entrenamiento.
- Base para fine-tuning con datos propios: partiendo de estos pesos, un equipo puede adaptar la política a una nueva tarea de manipulación con un número reducido de episodios adicionales.
- Docencia y formación en robótica: útil para demostrar el flujo completo de LeRobot, desde `lerobot-train` hasta `lerobot-record`, en cursos prácticos.
- Pruebas de infraestructura de evaluación: permite validar pipelines de `lerobot-record` y métricas de éxito antes de escalar a políticas más grandes.
- Prototipado rápido en robótica de bajo coste: al ocupar 0,2 GB, cabe en equipos de laboratorio modestos y facilita iteraciones frecuentes sin grandes recursos de GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasa de éxito, número de evaluaciones ni comparación con otras políticas sobre el mismo dataset.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,6 M de parámetros y pesos en safetensors, el checkpoint ocupa del orden de 0,2 GB, por lo que la inferencia cabe holgadamente en GPUs de consumo.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM es suficiente para ejecutar la política; para entrenamiento se recomienda una GPU con 8-16 GB o superior.
- Cabe en GPU de consumo: sí, incluidas RTX 3060, RTX 4060 y RTX 4090, entre otras.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), con soporte de ejecución en CUDA o CPU según la configuración del pipeline.
- Latencia y throughput: no disponibles; dependen del hardware, de la frecuencia de las cámaras y de la longitud del chunk de acciones configurado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / tarea | Licencia | Disponibilidad |
|---|---|---|---|---|
| ACT_pick-place_200_episodes_cs47 (este) | 51,6 M | Pick-and-place sobre SO-101, 200 episodios | Apache 2.0 | Hugging Face, 19 descargas |
| Políticas ACT genéricas de LeRobot | no disponible | Tareas de manipulación diversas | Apache 2.0 (según checkpoint) | Hub de LeRobot |
| Políticas Diffusion Policy | no disponible | Manipulación con modelos generativos de difusión | variable | Hub de LeRobot |
| Políticas VQ-BeT / otros métodos de imitación | no disponible | Manipulación diversa | variable | Hub de LeRobot |

No se dispone de métricas comparativas publicadas entre estos checkpoints en la información proporcionada, por lo que la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Generalización estrecha: la política se ha entrenado con 200 episodios de una tarea y un robot concretos; su rendimiento fuera de esa distribución (nuevos objetos, iluminación o posiciones) no está documentado.
- Sin métricas de validación: la ausencia de tasas de éxito impide afirmar su fiabilidad en producción.
- Sesgos de datos: cualquier sesgo presente en las demostraciones teleoperadas (posiciones, velocidades, objetos) se refleja en el comportamiento aprendido.
- Riesgo de alucinación en el sentido de acciones incoherentes: en estados fuera de distribución el modelo puede generar comandos erráticos; se recomienda supervisión humana y límites de seguridad en el robot.
- Limitaciones de idioma: no aplica, al no ser un modelo de texto.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las obligaciones de atribución y las condiciones del dataset asociado.
- Caveat de producción: al ser un checkpoint de investigación con 19 descargas y sin mantenimiento documentado, no debe desplegarse en entornos críticos sin una evaluación propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lenawngr/ACT_pick-place_200_episodes_cs47
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Dataset asociado: https://huggingface.co/datasets/lenawngr/pick-place_so101
- LeRobot (repositorio): https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
