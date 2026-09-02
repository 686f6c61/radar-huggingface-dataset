# nrburns/pi05_Pot_1_and_2_Red_3_full_side_long_2026-08-31

## Resumen

Este modelo es un fine-tune del modelo base `lerobot/pi05_base`, un Vision-Language-Action (VLA) desarrollado por Physical Intelligence bajo el nombre π₀.₅ (Pi05). Pi05 está diseñado para la generalización en entornos abiertos, evolucionando el modelo π₀ para adaptarse a situaciones y entornos no vistos durante el entrenamiento. La implementación utilizada es la de LeRobot, adaptada del repositorio OpenPI de Physical Intelligence.

El fine-tune se ha realizado sobre un dataset de demostraciones de robótica (`nrburns/Pot_1_and_2_Red-3_full_side-long`) que contiene 40 episodios y 76 615 frames a 20 FPS, correspondientes a la tarea de recoger fresas resaltadas, colocarlas en un contenedor verde y volver a la posición inicial. El modelo está entrenado para operar sobre el robot Rizon4 con tres cámaras (escena, muñeca y lateral) y produce acciones de 8 dimensiones. Con 4 143 404 816 parámetros, es un modelo de tamaño considerable para robótica, aunque no se especifican detalles de su arquitectura interna más allá de ser un VLA.

La relevancia de este modelo radica en su capacidad para ejecutar tareas de manipulación robótica mediante aprendizaje por imitación, utilizando un enfoque de código abierto (licencia Apache 2.0) y la infraestructura de LeRobot, lo que facilita su reproducción y adaptación a otras tareas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basado en π₀.₅ (Pi05), implementación LeRobot |
| Parametros totales | 4 143 404 816 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de robótica, no de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantización declarada) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura π₀.₅ de Physical Intelligence, un VLA que combina visión, lenguaje y acción para control robótico. La implementación concreta en LeRobot adapta el código de OpenPI, pero no se proporcionan detalles específicos sobre el tipo de transformer, mecanismos de atención o innovaciones técnicas internas en la información disponible.

El entrenamiento se realizó mediante fine-tuning del modelo base `lerobot/pi05_base` sobre un dataset de demostraciones recogidas con el robot Rizon4. El dataset contiene 40 episodios con 76 615 frames a 20 FPS, con observaciones de tres cámaras (escena, muñeca y lateral) y estados del robot (posición, par, fuerza, etc.). La configuración de entrenamiento incluye 16 000 pasos, batch size de 32, optimizador AdamW con learning rate de 2.5e-05 y semilla 1000. No se menciona el uso de RLHF, DPO u otras técnicas de alineación; se trata de un aprendizaje por imitación supervisado.

## Capacidades

- Control de robot manipulador: genera acciones de 8 dimensiones (posición, orientación, fuerza, etc.) para el robot Rizon4.
- Percepción visual multi-cámara: procesa imágenes de tres cámaras (escena, muñeca y lateral) a resolución 480×640.
- Aprendizaje por imitación: ejecuta tareas aprendidas de demostraciones humanas, específicamente la recogida y colocación de objetos.
- Ejecución de tareas de manipulación: la tarea entrenada consiste en recoger fresas resaltadas, colocarlas en un contenedor verde y volver a la posición inicial.
- Integración con LeRobot: compatible con el ecosistema de LeRobot para entrenamiento, evaluación y despliegue en robots reales.
- No incluye capacidades de generación de texto, tool calling, razonamiento simbólico ni procesamiento de lenguaje natural.

## Casos de uso

- Automatización de tareas de pick-and-place en entornos controlados: el modelo puede ejecutar la tarea específica de recoger objetos (fresas) y depositarlos en un contenedor, útil en líneas de clasificación o empaquetado.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar la transferencia de políticas VLA a nuevas tareas o entornos, dado que es un fine-tune de un modelo base generalista.
- Desarrollo de robots colaborativos en agricultura: la tarea de recogida de frutas puede adaptarse a entornos de invernadero o huerto, aunque requiere re-entrenamiento con datos específicos.
- Benchmarking de algoritmos de control robótico: al estar disponible en LeRobot, permite comparar el rendimiento de diferentes políticas en una tarea estandarizada.
- Prototipado rápido de soluciones robóticas: con el comando `lerobot-rollout` se puede desplegar el modelo en un robot Rizon4 en pocos minutos, facilitando pruebas de concepto.
- Educación y formación en robótica: el modelo y su dataset asociado son recursos didácticos para enseñar aprendizaje por imitación y VLA en cursos universitarios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no hay resultados de evaluación ("No evaluation results have been provided"). No se dispone de métricas como tasa de éxito, precisión de manipulación ni comparaciones con otros modelos.

## Requisitos de hardware

- No se proporcionan requisitos específicos de hardware en la documentación del modelo.
- El tamaño del repositorio es de 9.4 GB, lo que sugiere que los pesos completos en safetensors requieren al menos esa cantidad de almacenamiento.
- Con 4 143 404 816 parámetros, se estima que la inferencia en tiempo real requiere una GPU con al menos 16-24 GB de VRAM para trabajar con precisión FP32 o FP16, aunque no hay datos confirmados.
- Para despliegue en robótica, se necesita un ordenador con GPU NVIDIA (CUDA) conectado al robot Rizon4 y las cámaras correspondientes.
- LeRobot soporta inferencia con `lerobot-rollout` y entrenamiento con `lerobot-train`, que requieren una GPU compatible con PyTorch.
- No se mencionan opciones de cuantización ni despliegue en vLLM, llama.cpp u otras herramientas de inferencia de modelos de lenguaje, ya que no es un modelo de texto.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros modelos VLA como OpenVLA, RT-2 o el propio π₀. El modelo es un fine-tune de `lerobot/pi05_base`, y no se han publicado resultados comparativos. Se puede indicar que el modelo base π₀.₅ es la referencia principal, pero no hay datos de rendimiento relativos.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para la tarea de recoger fresas y colocarlas en un contenedor; no generaliza a otras tareas sin un nuevo fine-tuning.
- No se han evaluado sesgos ni riesgos de alucinación en acciones; al ser un modelo de control robótico, las acciones incorrectas pueden causar daños físicos en el robot o el entorno.
- La dependencia de tres cámaras específicas (escena, muñeca, lateral) limita su uso a configuraciones de hardware que coincidan con las observaciones de entrenamiento.
- El dataset de entrenamiento es pequeño (40 episodios), lo que puede limitar la robustez frente a variaciones de iluminación, posición de objetos o distracciones.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y el dataset pueden tener restricciones adicionales no documentadas.
- No se proporcionan garantías de seguridad para operación autónoma en entornos no controlados; se recomienda supervisión humana durante el despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nrburns/pi05_Pot_1_and_2_Red_3_full_side_long_2026-08-31
- Dataset de entrenamiento: https://huggingface.co/datasets/nrburns/Pot_1_and_2_Red-3_full_side-long
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Blog de π₀.₅ de Physical Intelligence: https://www.physicalintelligence.company/blog/pi05
- Documentación de LeRobot para pi05: https://huggingface.co/docs/lerobot/main/en/pi05
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Repositorio OpenPI (referencia): https://github.com/Physical-Intelligence/openpi
