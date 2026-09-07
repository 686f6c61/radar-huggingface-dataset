# Chaenn/pi0.5_so101_cube_multitask_real_sim_0906

## Resumen

El modelo `Chaenn/pi0.5_so101_cube_multitask_real_sim_0906` es una política de robótica de tipo visión-lenguaje-acción (VLA) basada en π₀.₅ (Pi05), desarrollada por Physical Intelligence y adaptada al ecosistema LeRobot por el usuario Chaenn. Se trata de un fine-tune específico para la tarea de colocación de cubos (cube place) en un brazo robótico SO100, entrenado con datos procedentes de entornos reales y simulados (real_sim). El modelo resuelve el problema de control de robots manipuladores a partir de observaciones visuales e instrucciones de lenguaje, con el objetivo declarado de generalizar a entornos nuevos no vistos durante el entrenamiento.

La arquitectura subyacente es la de π₀.₅, un modelo VLA que combina visión, lenguaje y generación de acciones. El checkpoint contiene 4.143.404.816 parámetros en formato safetensors y ocupa 9.4 GB en el repositorio. La licencia es Apache 2.0, lo que permite su uso comercial con atribución. El modelo está diseñado para ser entrenado y evaluado mediante la librería LeRobot de Hugging Face, y su integración con robots SO100 está documentada en la model card. Su relevancia actual radica en la exploración de la generalización open-world en robótica, un área de investigación activa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) basada en π₀.₅; detalles de capas no disponibles |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es una política de visión-lenguaje-acción (VLA) construida sobre la arquitectura π₀.₅ de Physical Intelligence. Como VLA, procesa entradas multimodales: imágenes de cámaras e instrucciones de lenguaje, y genera acciones de control para un robot manipulador. La implementación utilizada es la adaptación de LeRobot, que a su vez se basa en el repositorio OpenPI de Physical Intelligence. No se han publicado en la información disponible detalles sobre el número de capas, el tamaño del modelo de lenguaje subyacente ni el mecanismo de atención empleado.

El entrenamiento se ha realizado con el dataset `Chaenn/so101_cube_place_drprodsim_real_0905_1170`, que contiene demostraciones de colocación de cubos en entornos reales y simulados. La model card indica que el modelo se ha subido al Hub usando LeRobot, pero no se especifica el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO. La innovación técnica destacable es la búsqueda de generalización open-world, es decir, la capacidad de actuar en escenarios nunca vistos durante el entrenamiento, una evolución respecto al modelo π₀ original.

## Capacidades

- Generación de acciones de robot para tareas de manipulación, concretamente colocación de cubos, a partir de observaciones visuales.
- Comprensión de instrucciones de lenguaje natural para guiar la política, según la naturaleza del modelo VLA.
- Ejecución en entornos reales y simulados, como refleja el sufijo `real_sim` del nombre del modelo.
- Integración con el framework LeRobot para entrenamiento, evaluación e inferencia.
- Compatibilidad con robots SO100 (follower), tal como se indica en los comandos de evaluación de la model card.
- Capacidad de generalización a entornos nuevos, declarada en la descripción de π₀.₅.
- No se documenta soporte de tool calling, agentes autónomos, capacidades multilingües ni modos de razonamiento explícitos.

## Casos de uso

- Investigación en aprendizaje por imitación: el modelo puede entrenarse con demostraciones humanas de colocación de cubos y evaluarse en un brazo SO100 real, lo que permite estudiar la transferencia de habilidades entre entornos.
- Prototipado de tareas de pick-and-place: la política puede ejecutar secuencias de colocación de objetos en posiciones definidas, útil para validar pipelines robóticos de bajo coste.
- Evaluación sim2real: al haber sido entrenado con datos reales y simulados, el modelo permite analizar cómo se comporta una política entrenada en simulación cuando se despliega en el mundo real.
- Benchmarking de políticas VLA en manipulación fina: el modelo sirve como referencia para comparar el rendimiento de distintas arquitecturas de políticas en una tarea concreta de manipulación.
- Desarrollo de robots educativos: la integración con LeRobot y el robot SO100 facilita su uso en entornos académicos o de formación para enseñar robótica basada en aprendizaje por imitación.
- Transferencia de tareas entre variantes de un mismo objeto: el modelo puede ajustarse con datos de diferentes configuraciones de cubos, permitiendo estudiar la robustez ante cambios de apariencia o posición.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en bf16, aproximadamente 8,3 GB; en fp32, aproximadamente 16,6 GB; en int8, aproximadamente 4,1 GB. No se han publicado requisitos oficiales de VRAM.
- GPU recomendadas: para bf16, una RTX 4090 (24 GB) o una A100 (40 GB) son suficientes; para fp32, se recomienda A100 o H100; para int8, una RTX 3090 o RTX 4090.
- El modelo puede ejecutarse en GPUs de consumo si se cuantiza a int8, aunque no se proporcionan pesos cuantizados en el repositorio.
- Opciones de despliegue: LeRobot (entrenamiento, evaluación e inferencia), con soporte para robots SO100. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI, al tratarse de un modelo de política robótica y no un modelo de lenguaje general.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| π₀.₅ (base) | no disponible | no disponible | no disponible | no disponible |
| Este fine-tune (Chaenn/pi0.5_so101_cube_multitask_real_sim_0906) | 4.143.404.816 | no disponible | Apache 2.0 | HuggingFace |
| OpenVLA | 7B | no disponible | no disponible | HuggingFace |

La comparación directa no es posible porque no se dispone de datos de rendimiento ni de especificaciones completas para el modelo base π₀.₅ ni para OpenVLA en la información proporcionada. Se trata de un fine-tune específico de π₀.₅ para la tarea de colocación de cubos.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado.
- Riesgo de alucinación: en robótica, el modelo puede generar acciones no deseadas si las observaciones visuales difieren significativamente de los datos de entrenamiento, especialmente en entornos no vistos.
- Limitaciones de contexto o idioma: no se especifican; al no documentarse los idiomas soportados, no se puede garantizar la comprensión de instrucciones fuera de un dominio limitado.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base π₀.₅ y de los datasets utilizados.
- Caveat importante para producción: el modelo está entrenado para una tarea concreta (colocar cubos) con un robot específico (SO100). La generalización a otras tareas o robots no está garantizada y requiere validación experimental.
- No se proporcionan pesos cuantizados, por lo que el despliegue en hardware de consumo puede requerir cuantización externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Chaenn/pi0.5_so101_cube_multitask_real_sim_0906
- Dataset de entrenamiento: https://huggingface.co/datasets/Chaenn/so101_cube_place_drprodsim_real_0905_1170
- Dataset relacionado (multitask task merged): https://huggingface.co/datasets/Chaenn/so101_cube_multitask_task_merged
- Dataset relacionado (real sim 0819): https://huggingface.co/datasets/Chaenn/so101_cube_multitask_real_sim_0819
- Blog de Physical Intelligence sobre π₀.₅: https://www.physicalintelligence.company/blog/pi05
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
