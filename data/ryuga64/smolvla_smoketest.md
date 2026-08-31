# RyuGa64/smolvla_smoketest

## Resumen

SmolVLA es un modelo de visión-lenguaje-acción (VLA) compacto y eficiente desarrollado por Hugging Face, diseñado para tareas de robótica con un coste computacional reducido y apto para hardware de consumo. Este repositorio concreto, `RyuGa64/smolvla_smoketest`, es un fine-tuning del modelo base `lerobot/smolvla_base` sobre el dataset `lerobot/svla_so100_stacking`, que contiene 56 episodios de una tarea de apilamiento de cubos con un robot SO100. El modelo tiene 450 millones de parámetros y se distribuye bajo licencia Apache 2.0.

La relevancia de este modelo radica en que demuestra cómo un VLA de tamaño moderado puede especializarse en una tarea robótica concreta mediante fine-tuning, manteniendo la eficiencia computacional. Al estar entrenado con LeRobot, su integración en pipelines de robótica es directa, y su tamaño permite su ejecución en GPUs de consumo, lo que facilita la experimentación y el despliegue en entornos de investigación o prototipado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (VLM compacto + experto de acción con flow matching) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no orientado a lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA combina un modelo de lenguaje y visión (VLM) preentrenado compacto con un "experto de acción" entrenado mediante flow matching. Dadas múltiples imágenes de cámaras y una instrucción en lenguaje natural, el modelo genera un chunk de acciones para el robot. En este fine-tuning, el modelo base `lerobot/smolvla_base` se ajustó con el dataset `lerobot/svla_so100_stacking`, que contiene 22.956 frames a 30 FPS de la tarea "Put the red cube on top of the blue cube". El entrenamiento se realizó con 200 pasos, batch size de 16, optimizador AdamW y learning rate de 0.0001, usando la librería LeRobot versión 0.6.1.

## Capacidades

- Control de robot SO100 para tareas de manipulación, específicamente apilamiento de objetos.
- Entrada multimodal: tres imágenes de cámaras (256x256) y estado del robot (6 dimensiones).
- Salida de acciones de 6 dimensiones (posiciones articulares o comandos de movimiento).
- Fine-tuning específico para una tarea concreta, no es un modelo generalista.
- No soporta tool calling, agentes ni razonamiento multi-paso en el sentido de los LLM.
- No tiene capacidades de generación de texto ni de código; su salida son acciones robóticas.

## Casos de uso

- Automatización de tareas de apilamiento en entornos de laboratorio: el modelo puede ejecutar la tarea de colocar un cubo rojo sobre uno azul, como se entrenó, en un robot SO100 con cámaras superior y de muñeca.
- Prototipado de políticas robóticas con LeRobot: al ser un fine-tuning ligero, sirve como punto de partida para experimentar con el flujo de trabajo de LeRobot (grabación de datos, entrenamiento, rollout) sin necesidad de hardware de gama alta.
- Investigación en aprendizaje por imitación: permite estudiar cómo un VLA pequeño se adapta a una tarea específica con pocos datos (56 episodios) y qué factores afectan al rendimiento.
- Evaluación de la eficiencia de SmolVLA en hardware de consumo: su tamaño (450M) y formato safetensors facilitan pruebas de inferencia en GPUs domésticas, comparando latencia y consumo con modelos más grandes.
- Desarrollo de sistemas de robótica educativa: al ser de código abierto y con licencia permisiva, puede integrarse en cursos o proyectos de robótica donde se requiera un modelo de control sencillo y documentado.
- Benchmarking de VLA en tareas de manipulación: este modelo puede usarse como referencia para comparar el rendimiento de otros VLA en la misma tarea de apilamiento, siempre que se definan métricas claras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no hay resultados de evaluación para esta política.

## Requisitos de hardware

- Al ser un modelo de 450M de parámetros, es adecuado para GPUs de consumo con al menos 8 GB de VRAM, aunque no se especifican requisitos exactos en la documentación.
- El blog oficial de SmolVLA menciona que puede desplegarse en hardware de consumo, pero no detalla modelos de GPU concretos.
- Para inferencia, se puede usar la CLI de LeRobot (`lerobot-rollout`) que gestiona la carga del modelo y la conexión con el robot.
- No se dispone de datos de latencia o throughput específicos para este fine-tuning.
- El entrenamiento se realizó con batch size 16 y 200 pasos, lo que sugiere que el fine-tuning es viable en una GPU de gama media (por ejemplo, RTX 3090 o similar), aunque no se confirma.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa rigurosa con otros VLA (como OpenVLA, RT-2 o modelos similares). SmolVLA se presenta como una alternativa compacta y eficiente, pero no hay datos de rendimiento publicados para este fine-tuning concreto. Se recomienda consultar el paper original (arXiv:2506.01844) para comparaciones a nivel de arquitectura y resultados generales.

## Limitaciones y advertencias

- Es un modelo especializado en una única tarea (apilamiento de cubos) y no es generalizable a otras tareas sin un nuevo fine-tuning.
- No se han proporcionado resultados de evaluación en el robot real, por lo que se desconoce su tasa de éxito y robustez ante variaciones (posición de objetos, iluminación, etc.).
- El dataset de entrenamiento es pequeño (56 episodios), lo que puede limitar la generalización y aumentar el riesgo de sobreajuste.
- No se han documentado sesgos específicos, pero al ser un modelo de robótica, los sesgos podrían manifestarse en comportamientos no deseados ante entornos no vistos.
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar la licencia de los modelos base y datasets asociados.
- Para producción, se recomienda validar el modelo en el robot real con múltiples ensayos y condiciones variadas antes de su despliegue.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/RyuGa64/smolvla_smoketest
- Paper SmolVLA: https://arxiv.org/abs/2506.01844
- Blog de HuggingFace sobre SmolVLA: https://huggingface.co/blog/smolvla
- Sitio web oficial de SmolVLA: https://smolvla.net/index_en
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Dataset de entrenamiento: https://huggingface.co/datasets/lerobot/svla_so100_stacking
