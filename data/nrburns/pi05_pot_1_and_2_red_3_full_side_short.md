# nrburns/pi05_Pot_1_and_2_Red_3_full_side_short

## Resumen

El modelo `nrburns/pi05_Pot_1_and_2_Red_3_full_side_short` es un ajuste fino (fine-tune) del modelo base `lerobot/pi05_base`, perteneciente a la familia π₀.₅ (Pi05) de Physical Intelligence, un modelo de visión-lenguaje-acción (VLA) diseñado para control robótico con generalización a entornos abiertos. Este checkpoint concreto ha sido entrenado por el usuario `nrburns` utilizando el framework LeRobot de Hugging Face, especializándolo en una tarea de manipulación concreta: recoger fresas resaltadas, colocarlas en un contenedor verde y volver a la posición inicial, sobre un robot tipo `rizon4` con tres cámaras (escena, muñeca y lateral).

El modelo tiene aproximadamente 4.143 millones de parámetros (4,14 B), lo que lo sitúa en la gama de VLA medianos. Aunque no se especifica la longitud de contexto, al ser un modelo de acción continua, su entrada principal son imágenes y estados del robot, no texto libre. Su relevancia radica en que demuestra cómo un modelo VLA preentrenado puede adaptarse a tareas específicas con relativamente pocos datos (120 episodios) y un entrenamiento de 16.000 pasos, un flujo de trabajo accesible para laboratorios de robótica con recursos moderados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en transformer (π₀.₅ de Physical Intelligence) |
| Parametros totales | 4.143.404.816 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo orientado a acciones, no a texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un VLA (Vision-Language-Action) que combina percepción visual, razonamiento lingüístico y generación de acciones motoras. La implementación en LeRobot está adaptada del repositorio OpenPI de Physical Intelligence. El modelo base `lerobot/pi05_base` ya contiene el preentrenamiento generalista; este checkpoint se ha ajustado finamente con un dataset de demostraciones de 120 episodios (76.615 fotogramas a 20 FPS) correspondientes a la tarea de recogida de fresas. El entrenamiento se realizó con 16.000 pasos, tamaño de lote 32, optimizador AdamW y tasa de aprendizaje 2,5e-5, con semilla 1000. No se menciona el uso de RLHF ni DPO; el proceso es de imitación supervisada estándar en LeRobot.

## Capacidades

- Control robótico de un manipulador `rizon4` mediante acciones de 8 dimensiones (posición, orientación, fuerza, etc.).
- Percepción visual multicámara: recibe tres imágenes de 480x640 píxeles (escena, muñeca y lateral) junto con estados del robot (posición TCP, par, corriente del gripper, etc.).
- Ejecución de tareas de manipulación de precisión, como recoger objetos pequeños y colocarlos en contenedores.
- Generalización a variaciones dentro de la tarea entrenada (posiciones de objetos, iluminación, etc.) gracias al preentrenamiento VLA.
- No se documentan capacidades de tool calling, agentes o razonamiento multi-paso fuera del ámbito robótico.

## Casos de uso

- Automatización de tareas de picking y placing en entornos industriales: el modelo puede integrarse en líneas de montaje para recoger componentes de una cinta y depositarlos en bandejas, aprovechando su entrenamiento en manipulación fina.
- Robótica doméstica asistencial: tareas como recoger frutas o verduras de una superficie y colocarlas en un recipiente, similar a la tarea de entrenamiento con fresas.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar cómo un VLA preentrenado se adapta a tareas específicas con pocos datos, permitiendo reproducir experimentos y comparar con otros métodos.
- Desarrollo de sistemas de control basados en visión para brazos robóticos de bajo coste: el modelo es compatible con el robot `rizon4` y el ecosistema LeRobot, lo que facilita su despliegue en configuraciones experimentales.
- Benchmarking de VLA en tareas de manipulación: al estar disponible públicamente con licencia Apache 2.0, puede usarse como referencia para evaluar otros modelos o estrategias de fine-tuning.
- Formación y educación en robótica: los estudiantes pueden ejecutar el modelo en simulación o hardware real para comprender el flujo de entrenamiento y despliegue de políticas robóticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La sección de evaluación de la model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real. Por tanto, no hay datos de éxito, tasas de acierto ni comparaciones con otros modelos.

## Requisitos de hardware

- No se documentan requisitos específicos de hardware en la información proporcionada.
- El entrenamiento se realizó con `--policy.device=cuda`, lo que indica que se requiere una GPU compatible con CUDA.
- Dado el tamaño de 4,14 B parámetros, se recomienda una GPU con al menos 16 GB de VRAM para inferencia en precisión fp16, aunque esta cifra es una estimación orientativa no confirmada por el autor.
- El despliegue se realiza mediante el framework LeRobot, que ofrece scripts de rollout (`lerobot-rollout`) y soporta hardware como el robot `rizon4`.
- No se mencionan opciones de cuantización ni despliegue en CPU o dispositivos embebidos.

## Comparativa con modelos similares

No se dispone de datos comparativos cuantitativos con otros VLA. Sin embargo, se puede contextualizar con modelos de la misma categoría:

- **OpenVLA** (7B parámetros): VLA de código abierto con enfoque generalista, pero sin fine-tune específico para esta tarea. No hay datos de rendimiento comparativo.
- **RT-2** (55B parámetros): VLA de Google, más grande y con mayor capacidad de razonamiento, pero no disponible públicamente con licencia abierta.
- **π₀ (Pi0)** (3.3B parámetros): modelo base de Physical Intelligence, similar en tamaño y filosofía; este checkpoint es un fine-tune de su versión 0.5.

Dado que no se han publicado evaluaciones, cualquier comparación numérica sería especulativa. Se recomienda consultar la documentación de LeRobot para conocer los resultados de otros modelos en tareas similares.

## Limitaciones y advertencias

- No se han publicado resultados de evaluación en robot real, por lo que se desconoce la tasa de éxito y la robustez del modelo en entornos no vistos.
- El modelo está especializado en una única tarea (recoger fresas y colocarlas en un contenedor) y no se ha demostrado su capacidad para generalizar a otras tareas sin reentrenamiento.
- Depende de un hardware específico (robot `rizon4` y cámaras calibradas) y de las claves de observación exactas con las que fue entrenado; cambios en la configuración de cámaras o en el espacio de estados pueden degradar el rendimiento.
- Al ser un modelo de imitación, puede presentar sesgos derivados del dataset de demostraciones (por ejemplo, variaciones en iluminación, posiciones de objetos o estilo del operador).
- No se ha evaluado el riesgo de alucinación en acciones (acciones incoherentes con el estado observado), aunque es un riesgo inherente a los VLA.
- La licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye sin garantías y sin soporte oficial de Physical Intelligence o Hugging Face.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/nrburns/pi05_Pot_1_and_2_Red_3_full_side_short)
- [Blog de Physical Intelligence sobre π₀.₅](https://www.physicalintelligence.company/blog/pi05)
- [Repositorio LeRobot](https://github.com/huggingface/lerobot)
- [Documentación de LeRobot para pi05](https://huggingface.co/docs/lerobot/main/en/pi05)
- [Dataset de entrenamiento](https://huggingface.co/datasets/nrburns/Pot_1_and_2_Red-3_full_side-short)
