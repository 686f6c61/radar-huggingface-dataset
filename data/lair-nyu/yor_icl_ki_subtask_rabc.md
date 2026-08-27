# lair-nyu/yor_icl_ki_subtask_rabc

## Resumen

El modelo `lair-nyu/yor_icl_ki_subtask_rabc` es una política robótica de tipo visión-lenguaje-acción (VLA) desarrollada por el Laboratorio de Robótica Autónoma e Inteligente (LAIR) de la Universidad de Nueva York. Se basa en el backbone pi0.5 de Physical Intelligence y se entrena con el framework openpi sobre el conjunto de datos icl-dataset. El checkpoint corresponde al paso 15000 e incorpora tres técnicas de entrenamiento específicas: Knowledge Insulation, subtask prediction y RABC (posiblemente relacionado con razonamiento o control). El repositorio contiene únicamente los pesos desplegables (`params/`) y estadísticas de normalización (`assets/`), sin el estado del optimizador.

Este modelo está orientado a la investigación en robótica, concretamente a tareas de manipulación y control en entornos reales o simulados. Su relevancia radica en la combinación de un backbone VLA consolidado con modificaciones de entrenamiento que buscan mejorar la generalización y el razonamiento por subtareas. Al ser un modelo de investigación, no se han publicado especificaciones detalladas de arquitectura, parámetros o rendimiento en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA basado en pi0.5 (transformer, detalles no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de acción, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (probablemente no aplica, es para control robótico) |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repo contiene `params/` y `assets/`, probablemente safetensors) |

## Arquitectura y entrenamiento

El modelo se construye sobre pi0.5, un VLA de Physical Intelligence que combina un codificador de visión, un modelo de lenguaje y un decodificador de acciones. El entrenamiento se realiza con openpi, el framework de código abierto de Physical Intelligence, sobre el icl-dataset (cuyo contenido no se especifica). Se aplican tres técnicas adicionales: Knowledge Insulation (posiblemente para aislar conocimiento previo y evitar interferencias), subtask prediction (predicción de subtareas para descomponer tareas complejas) y RABC (siglas no descritas en la documentación). El checkpoint está en el paso 15000, lo que sugiere un entrenamiento relativamente temprano. No se dispone de información sobre el número de tokens, composición del dataset o uso de RLHF/DPO.

## Capacidades

- Control robótico de manipulación: genera acciones motoras a partir de observaciones visuales y posiblemente instrucciones en lenguaje.
- Razonamiento por subtareas: la técnica de subtask prediction permite descomponer tareas complejas en pasos más simples.
- Integración con openpi: compatible con el ecosistema de despliegue de Physical Intelligence.
- No se documentan capacidades adicionales como tool calling, agentes o multilingüismo, al ser un modelo especializado en robótica.

## Casos de uso

- Investigación en manipulación robótica: el modelo puede utilizarse en laboratorios para estudiar estrategias de control basadas en VLA, especialmente en tareas que requieren descomposición en subtareas.
- Desarrollo de políticas de control en simulación: se puede integrar en entornos como MuJoCo o Isaac Sim para validar algoritmos antes de pasar a robots reales.
- Benchmarking de técnicas de entrenamiento: al incluir Knowledge Insulation y RABC, sirve como punto de comparación para evaluar la eficacia de estas modificaciones frente a un VLA estándar.
- Robots de servicio en entornos controlados: podría desplegarse en brazos robóticos para tareas de pick-and-place o ensamblaje simple, siempre que se disponga de la infraestructura adecuada.
- Educación en robótica: como modelo de referencia para cursos avanzados de aprendizaje por refuerzo y control basado en aprendizaje.
- Transferencia a otros dominios: la arquitectura pi0.5 es adaptable, por lo que el checkpoint podría servir como inicialización para fine-tuning en tareas específicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de métricas como MMLU, HumanEval o GSM8K, ni de evaluaciones específicas de robótica (p. ej., éxito en tareas de manipulación).

## Requisitos de hardware

- El tamaño del repositorio es de 12.4 GB, lo que sugiere que los pesos ocupan aproximadamente esa cantidad en el formato de almacenamiento (probablemente FP32 o FP16). Para inferencia en FP16, se estima una VRAM mínima de 12-16 GB, aunque no se confirma.
- GPU recomendada: no disponible. Se espera que modelos de este tipo funcionen en GPUs de gama alta como RTX 3090/4090 o A100, pero no hay datos oficiales.
- Al ser un modelo de robótica, el despliegue requiere además un robot físico o un simulador, y el framework openpi para la ejecución.
- Opciones de despliegue: openpi (oficial), posiblemente vLLM o llama.cpp si se convierte a GGUF, pero no está documentado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas como OpenVLA, RT-2 o π0 (el modelo base). No se conocen los parámetros exactos ni los resultados de evaluación, por lo que no es posible establecer una comparación cuantitativa. Se recomienda consultar la documentación de pi0.5 y otros VLA para referencias generales.

## Limitaciones y advertencias

- No se ha publicado una licencia, por lo que el uso comercial o incluso académico puede estar restringido; se debe contactar con los autores.
- No hay información sobre sesgos o alucinaciones, pero al ser un modelo de control robótico, los riesgos de seguridad física son relevantes; debe probarse en simulación antes de usarlo en robots reales.
- El checkpoint está en un paso temprano (15000), por lo que el rendimiento puede no ser óptimo en comparación con checkpoints posteriores.
- No se incluye el estado del optimizador, por lo que no es posible reanudar el entrenamiento exacto desde este punto.
- La ausencia de especificaciones técnicas detalladas dificulta la evaluación de su idoneidad para casos de uso concretos.
- El modelo está etiquetado con `region:us`, lo que podría implicar restricciones geográficas de acceso o uso.

## Enlaces

- [HuggingFace - lair-nyu/yor_icl_ki_subtask_rabc](https://huggingface.co/lair-nyu/yor_icl_ki_subtask_rabc)
- [Perfil de LAIR NYU en HuggingFace](https://huggingface.co/lair-nyu/models)
- [Página del laboratorio LAIR en NYU](http://robotics.engineering.nyu.edu/group/lair/)
- [Blog sobre VLA en ICLR 2026 (contexto general)](https://mbreuss.github.io/blog_post_iclr_26_vla.html)
