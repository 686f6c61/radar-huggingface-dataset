# podolinsky/cosmos3-edge-libero-x-level123-step8750

## Resumen

Cosmos3-Edge-Libero-X-Level123-Step8750 es un checkpoint de robótica derivado del modelo base `lerobot/Cosmos3-Edge`, publicado por el usuario `podolinsky` en Hugging Face. Se trata de una especialización mediante fine-tuning sobre el dataset `podolinsky/libero-x-level123-cosmos3`, orientada a tareas de manipulación robótica en el benchmark LIBERO-X. El modelo se distribuye en formato safetensors y se integra en el ecosistema LeRobot, la librería de Hugging Face para políticas robóticas.

Con 4.563.688.396 parámetros (aproximadamente 4,56 mil millones), el modelo se sitúa en la gama media de políticas visión-lenguaje-acción (VLA) y hereda la arquitectura de Cosmos3-Edge, un modelo de la familia Cosmos orientada a robótica y simulación. El nombre del checkpoint indica que corresponde al paso de entrenamiento 8750 sobre los niveles 1, 2 y 3 del conjunto de datos LIBERO-X.

La relevancia de esta ficha es doble: por un lado, documenta un ejemplo concreto de fine-tuning de un modelo Cosmos para control robótico; por otro, advierte de que el acceso está restringido (gated) y de que la información pública disponible es muy limitada, sin datos de benchmarks ni de composición del dataset de entrenamiento más allá de lo que sugiere el nombre del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Cosmos3-Edge, familia Cosmos orientada a robótica; detalles arquitectónicos no publicados en la información disponible) |
| Parametros totales | 4.563.688.396 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | openmdw1.1-license (etiquetada como `license:other` en Hugging Face) |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Pipeline | robotics |
| Modelo base | lerobot/Cosmos3-Edge |
| Dataset de entrenamiento | podolinsky/libero-x-level123-cosmos3 |
| Paso de entrenamiento | 8750 |
| Tamano del repositorio | 36.5 GB |
| Acceso | restringido (gated) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna en la información proporcionada. El modelo deriva de `lerobot/Cosmos3-Edge`, un modelo de la familia Cosmos de NVIDIA orientada a robótica, simulación y generación de mundos físicos, pero los detalles concretos de capas, mecanismos de atención, tokenizador de acciones o estrategia de fusión multimodal no están publicados en la ficha del repositorio.

El entrenamiento consiste en un fine-tuning del modelo base sobre el dataset `podolinsky/libero-x-level123-cosmos3`, que por su nombre corresponde a los niveles 1, 2 y 3 del benchmark LIBERO-X. El checkpoint publicado corresponde al paso 8750. No se especifican el número total de tokens, la composición exacta del dataset, ni si se emplearon técnicas de RLHF, DPO o aprendizaje por imitación supervisada, aunque en el contexto de LeRobot y políticas VLA es habitual el entrenamiento por imitación sobre demostraciones.

## Capacidades

- Control robótico: el modelo está diseñado para generar acciones a partir de observaciones visuales y, presumiblemente, instrucciones en lenguaje natural, dado su origen en la familia Cosmos y su integración en LeRobot.
- Manipulación en entornos LIBERO-X: especializado en las tareas de los niveles 1, 2 y 3 del benchmark, que cubren habilidades de manipulación progresivamente más complejas.
- Integración con LeRobot: puede cargarse y ejecutarse mediante la librería LeRobot, lo que facilita su despliegue en pipelines de evaluación y despliegue robótico.
- Capacidades multimodales: al tratarse de un modelo VLA (visión-lenguaje-acción), se espera que procese imágenes y texto, aunque no se detallan las modalidades exactas en la información disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking, visión o audio: no disponible (se desconoce si incorpora modos especiales más allá de la política de acción).

## Casos de uso

- Evaluación de políticas robóticas en LIBERO-X: el modelo puede utilizarse como referencia o baseline en los niveles 1 a 3 del benchmark LIBERO-X, permitiendo comparar el rendimiento de nuevas políticas con un checkpoint entrenado específicamente para esas tareas.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar cómo el fine-tuning sobre subconjuntos de LIBERO-X afecta a la generalización en tareas de manipulación.
- Despliegue en simulación con LeRobot: al estar integrado en LeRobot, puede cargarse en entornos simulados compatibles para ejecutar políticas de manipulación y medir tasas de éxito.
- Reproducción de experimentos: el checkpoint en el paso 8750 permite reproducir curvas de aprendizaje y comparar con otros pasos de entrenamiento del mismo linaje.
- Transferencia a dominios robóticos específicos: al derivar de Cosmos3-Edge, puede servir como base para fine-tuning adicional en tareas de manipulación con características similares a las de LIBERO-X.
- Docencia y formación: útil en cursos de robótica y aprendizaje automático para ilustrar el flujo completo de fine-tuning de un modelo VLA con LeRobot y datasets de demostraciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4,56 mil millones de parámetros, en precisión completa (FP32) se requieren aproximadamente 18,3 GB solo para los pesos; en FP16/BF16, unos 9,1 GB; en cuantización de 8 bits, unos 4,6 GB; en 4 bits, unos 2,3 GB. Estas cifras no incluyen memoria para activaciones, buffers de atención ni el procesamiento de imágenes, por lo que el consumo real será mayor.
- GPU recomendadas: para FP16 se recomienda al menos una GPU con 16 GB de VRAM (RTX 4080, RTX 4090, A100 40 GB, H100). Para cuantización de 8 o 4 bits, podría caber en GPUs consumer con 8-12 GB, aunque no se dispone de confirmación oficial.
- Cabe en GPU consumer: probablemente sí en RTX 4090 (24 GB) en FP16, y en GPUs de 12 GB con cuantización; no confirmado por el autor.
- Opciones de despliegue: LeRobot (librería nativa del modelo); no se dispone de información sobre soporte en vLLM, llama.cpp, Ollama o TGI, que están orientados a modelos de lenguaje y no a políticas robóticas.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa con alternativas de la misma categoría. El modelo base `lerobot/Cosmos3-Edge` es el referente más directo, pero no se publican sus especificaciones completas en la información disponible. Otras políticas VLA de la familia Cosmos o de LeRobot podrían ser comparables, pero se carece de datos de parámetros, contexto y rendimiento para incluirlas en una tabla fiable.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| cosmos3-edge-libero-x-level123-step8750 | 4.563.688.396 | no disponible | openmdw1.1-license | gated en Hugging Face |
| lerobot/Cosmos3-Edge (base) | no disponible | no disponible | no disponible | no disponible |
| Otras políticas VLA comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated, por lo que es necesario aceptar condiciones en Hugging Face antes de descargar los pesos.
- Información pública muy limitada: no se publican detalles de arquitectura, contexto, datos de entrenamiento ni benchmarks, lo que dificulta evaluar su idoneidad para producción.
- Especialización estrecha: el fine-tuning se limita a los niveles 1, 2 y 3 de LIBERO-X; su rendimiento fuera de esas tareas es desconocido y probablemente limitado.
- Riesgo de sobreajuste al benchmark: al entrenarse sobre un subconjunto específico de LIBERO-X, puede no generalizar a entornos reales o a tareas no vistas.
- Sesgos: no disponible; no se han documentado sesgos específicos, pero al ser un modelo robótico entrenado en simulación, puede heredar sesgos de los datos de demostración.
- Riesgo de alucinación: en el contexto de políticas de acción, el equivalente sería la generación de acciones inválidas o inseguras; no se documenta ningún mecanismo de salvaguarda.
- Licencia: openmdw1.1-license, etiquetada como `license:other`; es necesario revisar los términos completos antes de un uso comercial, ya que puede imponer restricciones adicionales.
- Idiomas: no se especifican idiomas soportados; se desconoce si las instrucciones en lenguaje natural deben estar en inglés u otro idioma.
- Uso en producción: sin benchmarks ni documentación de latencia, no se recomienda su despliegue en entornos reales sin una evaluación previa exhaustiva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/podolinsky/cosmos3-edge-libero-x-level123-step8750
- Modelo base: https://huggingface.co/lerobot/Cosmos3-Edge
- Dataset de entrenamiento: https://huggingface.co/datasets/podolinsky/libero-x-level123-cosmos3
- Librería LeRobot: https://github.com/huggingface/lerobot
- Licencia OpenMDW 1.1: https://openmdw.ai/
