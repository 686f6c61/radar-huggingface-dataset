# makermods/smolvla_dagger_200ep_100corr_blue_cube_orange_box

## Resumen

El modelo `makermods/smolvla_dagger_200ep_100corr_blue_cube_orange_box` es un checkpoint de fine-tuning de SmolVLA, el modelo de visión-lenguaje-acción (VLA) ligero desarrollado por Hugging Face para robótica. Ha sido entrenado por MakerMods, una empresa que desarrolla robots open-source, sobre una tarea específica de manipulación: colocar un cubo azul dentro de una caja naranja. El nombre del repositorio sugiere que el entrenamiento se realizó con el algoritmo DAgger (Dataset Aggregation) durante 200 épocas y con 100 correcciones humanas, aunque no se dispone de documentación que lo confirme.

Con 450 millones de parámetros y un tamaño de 1,2 GB, este modelo se posiciona como una opción ligera para experimentación en robótica, especialmente en entornos con recursos limitados. La relevancia actual radica en que SmolVLA es una de las arquitecturas VLA más accesibles para fine-tuning en datasets de LeRobot, y este checkpoint demuestra un caso de uso concreto de entrenamiento por imitación. Sin embargo, la model card publicada está prácticamente vacía, por lo que la información técnica disponible es muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basado en SmolVLA (vision-language-action), detalles no disponibles |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de SmolVLA, la familia de modelos VLA de Hugging Face diseñada para ser ligera y fácil de adaptar a datasets de robótica como los de LeRobot. SmolVLA combina un codificador de visión con un modelo de lenguaje para generar acciones de control a partir de observaciones visuales e instrucciones en lenguaje natural. No se dispone de detalles sobre la arquitectura interna exacta de este checkpoint concreto, como el número de capas, la dimensión del modelo o el tipo de atención.

En cuanto al entrenamiento, el nombre del repositorio indica el uso de DAgger (Dataset Aggregation), un algoritmo de aprendizaje por imitación que intercala ejecución de políticas con correcciones de un experto. Se mencionan 200 épocas y 100 correcciones, lo que sugiere un proceso iterativo de recopilación de datos y entrenamiento. No se han publicado hiperparámetros, composición del dataset, ni detalles sobre el régimen de entrenamiento (precisión mixta, optimizador, etc.). Tampoco se indica si se aplicaron técnicas como RLHF o DPO.

## Capacidades

- Control robótico de manipulación: el modelo está entrenado para una tarea específica de colocar un cubo azul dentro de una caja naranja, lo que implica percepción visual y generación de acciones motoras.
- Aprendizaje por imitación: al usar DAgger, el modelo ha aprendido de demostraciones y correcciones, lo que le permite replicar comportamientos observados.
- Integración con LeRobot: al ser un fine-tuning de SmolVLA, es compatible con el ecosistema LeRobot de Hugging Face para despliegue en robots reales o simulados.
- No se dispone de información sobre capacidades adicionales como tool calling, razonamiento multi-paso, soporte multilingüe o modos de pensamiento.

## Casos de uso

- Investigación en aprendizaje por imitación: el modelo sirve como ejemplo de fine-tuning de SmolVLA con DAgger para una tarea de manipulación, útil para estudiar la eficacia de este algoritmo en VLA.
- Desarrollo de robots de bajo coste: al ser ligero (450M parámetros), puede ejecutarse en hardware modesto, lo que lo hace adecuado para prototipos de brazos robóticos como el Metal Arm de MakerMods.
- Benchmarking de políticas robóticas: puede utilizarse como punto de partida para comparar diferentes estrategias de entrenamiento (DAgger vs. comportamiento clonado) en la misma tarea.
- Educación en robótica: su tamaño reducido y su integración con LeRobot permiten usarlo en cursos o talleres de robótica con recursos limitados.
- Experimentación con correcciones humanas: el esquema de 100 correcciones sugiere un flujo de trabajo donde un operador interviene durante el entrenamiento, lo que puede replicarse en entornos de investigación.
- Base para fine-tuning adicional: al ser un checkpoint intermedio, puede servir como inicialización para tareas similares de manipulación con objetos de colores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni métricas específicas de robótica como tasa de éxito en la tarea.

## Requisitos de hardware

- VRAM estimada: con 450M parámetros y 1,2 GB de pesos en safetensors, la inferencia en precisión FP32 requeriría aproximadamente 1,8 GB de VRAM, y en FP16 alrededor de 0,9 GB. Esto cabe en GPUs consumer como la RTX 3060 (12 GB) o incluso en una GTX 1660 Super (6 GB).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente para inferencia. Para entrenamiento, se necesitaría más memoria, pero no se dispone de datos exactos.
- Opciones de despliegue: al ser un modelo de Hugging Face, puede cargarse con la librería `transformers` o con el framework LeRobot. También es posible exportarlo a ONNX o TensorRT, aunque no hay documentación al respecto.
- Latencia y throughput: no se dispone de mediciones publicadas.

## Comparativa con modelos similares

No se dispone de datos suficientes para realizar una comparativa rigurosa. El modelo pertenece a la familia SmolVLA, pero no se conocen otros checkpoints del mismo autor con los que comparar directamente. Alternativas genéricas como OpenVLA (7B parámetros) o RT-2 (más de 55B) son significativamente más grandes y no son comparables en recursos. Se recomienda consultar la documentación oficial de SmolVLA para obtener una lista de modelos base.

## Limitaciones y advertencias

- La model card está incompleta: no se especifican sesgos, riesgos, ni limitaciones técnicas. Esto impide evaluar la seguridad del modelo para uso en producción.
- No se conoce la licencia: el repositorio no indica licencia, por lo que no está claro si se permite uso comercial o modificación.
- Entrenamiento específico de tarea: el modelo está especializado en una única tarea (cubo azul en caja naranja) y probablemente no generalice a otras tareas sin fine-tuning adicional.
- Sin datos de evaluación: no hay métricas de éxito ni comparaciones con otros métodos, lo que dificulta conocer su rendimiento real.
- Riesgo de alucinación en acciones: como todo modelo generativo, puede producir acciones no válidas o inseguras si se usa fuera de su dominio de entrenamiento.
- Dependencia del ecosistema LeRobot: para desplegarlo correctamente se requiere el stack de LeRobot, lo que añade dependencias externas.

## Enlaces

- [HuggingFace - makermods/smolvla_dagger_200ep_100corr_blue_cube_orange_box](https://huggingface.co/makermods/smolvla_dagger_200ep_100corr_blue_cube_orange_box)
- [Dataset de rollout asociado](https://huggingface.co/datasets/makermods/rollout_1-100ep_smolvla_200ep_blue_cube_orange_box_corrections_20260819_191244/discussions)
- [Checkpoint anterior del mismo autor](https://huggingface.co/makermods/smolvla_makermods_100_ep_blue_cube_orange_box_2026-08-04_20-03-25/tree/main)
- [Documentación de SmolVLA en el repo de MakerMods (GitHub)](https://github.com/Maker-Mods/lerobot-MakerMods/blob/main/docs/source/smolvla.mdx)
- [Sitio web de MakerMods](https://www.makermods.ai/)
