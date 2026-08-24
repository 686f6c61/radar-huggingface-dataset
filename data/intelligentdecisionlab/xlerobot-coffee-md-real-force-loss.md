# IntelligentDecisionLab/xlerobot-coffee-md-real-force-loss

## Resumen

El modelo `IntelligentDecisionLab/xlerobot-coffee-md-real-force-loss` es un conjunto de cinco políticas de robótica entrenadas con el framework LeRobot para la automatización de tareas de preparación de café (Coffee Automata) en el dominio real. Cada política corresponde a una subtarea específica (colocar la taza, mover la taza a la bandeja, etc.) y está diseñada para operar sobre un robot XLeRobot de 17 grados de libertad (DoF) con dos cámaras. El repositorio forma parte de una reorganización taxonómica experimental que hace explícitos todos los ejes de variación en el nombre de cada hoja (leaf), incluyendo arquitectura, número de cámaras, plataforma, fuente de fuerza y pasos de entrenamiento.

La arquitectura empleada es ACT (Action Chunking Transformer), en su variante v1 según la gramática interna, con 100.000 pasos de entrenamiento y una fuente de fuerza estimada (etiquetada como `est24`). El modelo se distribuye en formato safetensors y el repositorio ocupa 4,1 GB. No se proporcionan datos sobre licencia, idiomas ni parámetros totales. La model card advierte que la nomenclatura es provisional y que los repositorios legacy siguen siendo los autoritativos, por lo que no debe citarse esta ruta en publicaciones sin verificar la gramática.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer), variante v1 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de robótica, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo utiliza la arquitectura ACT (Action Chunking Transformer), una política de aprendizaje por imitación que predice secuencias de acciones (chunks) a partir de observaciones visuales y de estado. En este caso, la variante `act` codifica la versión 1 de la pérdida de grados de libertad activos (active-DoF loss), según la gramática interna del laboratorio. El entrenamiento se realizó con 100.000 pasos y con datos que incluyen una fuente de fuerza estimada (`est24`), lo que permite al modelo incorporar información táctil o de fuerza en la predicción de acciones. No se han publicado detalles sobre la composición del dataset, el número de tokens (no aplica) ni el uso de técnicas como RLHF o DPO. La política se entrena con dos cámaras y está pensada para el robot XLeRobot de 17 DoF.

## Capacidades

- Control de robot para tareas de manipulación en el dominio real (Coffee Automata).
- Ejecución de subtareas específicas: colocar taza (`t1_place_cup`), mover taza a bandeja (`t3_cup_to_tray`), y mover bandeja a mesa (`t5_tray_to_table`).
- Uso de fuerza estimada como entrada adicional (24 dimensiones), lo que puede mejorar la robustez en contacto físico.
- Integración con el framework LeRobot para carga y ejecución mediante `PreTrainedPolicy.from_pretrained`.
- Soporte de dos cámaras para percepción visual.
- No se mencionan capacidades de tool calling, agentes, razonamiento simbólico ni procesamiento de lenguaje.

## Casos de uso

- Automatización de máquinas de café: el modelo puede ejecutar la secuencia completa de preparación, desde colocar la taza hasta trasladarla a la bandeja y luego a la mesa, reduciendo la intervención humana en entornos de hostelería o oficina.
- Manipulación robótica con realimentación de fuerza: gracias a la entrada de fuerza estimada, es adecuado para tareas que requieren contacto delicado, como ajustar la posición de una taza sin derramar líquido.
- Investigación en aprendizaje por imitación: sirve como referencia para estudiar el efecto de la fuente de fuerza (estimada vs. no usada) en el rendimiento de políticas ACT.
- Desarrollo de sistemas de control para robots XLeRobot: los cinco leaves pueden combinarse o evaluarse individualmente para construir pipelines de automatización más complejos.
- Evaluación de gramáticas de nomenclatura en repositorios de modelos: el propio repositorio es un caso de uso para validar la taxonomía propuesta por el laboratorio.
- Despliegue en entornos de producción con LeRobot: al ser compatible con `from_pretrained`, puede integrarse en sistemas existentes de control robótico basados en LeRobot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre tasas de éxito, precisión de acciones ni comparaciones con otros modelos en las tareas de Coffee Automata.

## Requisitos de hardware

- No se especifican requisitos de hardware en la documentación proporcionada.
- El tamaño del repositorio es de 4,1 GB, lo que sugiere que los pesos completos pueden cargarse en GPUs con al menos 8 GB de VRAM, aunque no se confirma.
- Al ser un modelo de robótica, se espera que se ejecute en el propio robot o en un ordenador de control con GPU (por ejemplo, NVIDIA Jetson o similar), pero no hay datos concretos.
- No se mencionan opciones de despliegue como vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje. La inferencia se realiza mediante LeRobot y PyTorch.

## Comparativa con modelos similares

No se dispone de datos de comparación directa con otros modelos en la información proporcionada. El modelo es comparable a otras políticas ACT de LeRobot para tareas de manipulación, pero no se han publicado métricas comparativas. Se recomienda consultar los repositorios legacy mencionados en la model card para obtener referencias adicionales.

## Limitaciones y advertencias

- La nomenclatura del repositorio es provisional y no ha sido ratificada; los nombres de las hojas pueden cambiar. No debe citarse esta ruta en publicaciones sin verificar la gramática.
- Los repositorios legacy siguen siendo los autoritativos; este repositorio es una copia bajo una gramática experimental.
- No se proporciona información sobre sesgos, alucinaciones o limitaciones de contexto, ya que no es un modelo de lenguaje.
- La licencia no está disponible, por lo que el uso comercial es incierto y requiere consulta con el autor.
- No hay datos sobre el rendimiento en tareas fuera de las cinco subtareas específicas; la generalización a otros entornos o robots no está garantizada.
- El modelo depende de la fuente de fuerza estimada (`est24`); si esta estimación no está disponible en el entorno de despliegue, el modelo podría no funcionar correctamente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/IntelligentDecisionLab/xlerobot-coffee-md-real-force-loss
- Repositorio relacionado (modelo real b-force): https://huggingface.co/IntelligentDecisionLab/xlerobot-coffee-model-real-b-force
- Repositorio relacionado (modelo real a-vision-pos): https://huggingface.co/IntelligentDecisionLab/xlerobot-coffee-model-real-a-vision-pos
- GitHub de XLeRobot (proyecto principal): https://github.com/Vector-Wangel/XLeRobot
- Documentación de XLeRobot: https://xlerobot.readthedocs.io/en/latest/
