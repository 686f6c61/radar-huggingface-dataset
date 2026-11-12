# guitarorangedog/manifeel-tavla-nutbolt

## Resumen

TA-VLA (con backbone de diffusion policy) es un checkpoint de política robótica entrenado por el usuario guitarorangedog para la tarea `nutbolt` del conjunto de datos ManiFeel, sobre un brazo Franka Panda. El modelo combina una política de difusión con entradas visuales y táctiles: recibe la imagen de la cámara de muñeca y una imagen táctil derecha (`tacimg`), y produce acciones de control del robot. Se entrenó con la librería LeRobot 0.6.1 mediante el framework robo-synapse, y se publica como baseline reproducible de esa receta.

El checkpoint tiene 344.508.685 parámetros en formato safetensors y ocupa 1,4 GB en el repositorio. No es un modelo de lenguaje: es un modelo de robótica orientado a una tarea de manipulación concreta (ensamblaje de tuerca y tornillo), por lo que sus capacidades están acotadas al dominio de control motor aprendido a partir de demostraciones.

Su relevancia es acotada pero útil para la comunidad de robótica open source: sirve como referencia de rendimiento (82,0 % de éxito reportado) para políticas visuotáctiles de difusión en una tarea de precisión, y como punto de partida reproducible para quien quiera replicar o comparar recetas de entrenamiento con LeRobot.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Diffusion policy (TA-VLA) con backbone de difusión; entradas visual y táctil |
| Parámetros totales | 344.508.685 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; modelo de control robótico) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

El modelo es una política de difusión (diffusion policy) enmarcada en la familia TA-VLA, con un backbone de difusión que genera secuencias de acciones a partir de observaciones. Las entradas declaradas son la imagen de la cámara de muñeca y la imagen táctil derecha (`tacimg`), lo que lo convierte en un modelo visuotáctil: combina percepción visual con señal táctil para tareas de manipulación fina. No se dispone de detalles sobre el número de capas, dimensión de los embeddings ni el mecanismo exacto de fusión multimodal.

El entrenamiento se realizó con robo-synapse sobre LeRobot 0.6.1, usando el dataset `RoboSynapse/manifeel-tacr_franka-panda_nutbolt`. La model card indica semilla 1000, precisión mixta (AMP) y aumento de datos desactivado. No se especifican el número de tokens, la composición del dataset, ni si hubo etapas de RLHF/DPO (no aplicables en este dominio). La evaluación reportada es de 4 semillas × 50 episodios con un máximo de 500 pasos por episodio.

## Capacidades

- Control robótico de manipulación para la tarea `nutbolt` (ensamblaje de tuerca y tornillo) sobre Franka Panda.
- Percepción visual mediante cámara de muñeca.
- Percepción táctil mediante imagen táctil derecha (`tacimg`).
- Generación de acciones motoras mediante política de difusión.
- Ejecución de episodios de hasta 500 pasos.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso en el sentido de los LLM.
- No tiene capacidades multilingües ni de generación de texto.

## Casos de uso

- **Ensamblaje de precisión en línea de producción**: el modelo ejecuta la inserción de tuerca y tornillo sobre Franka Panda con una tasa de éxito reportada del 82,0 %, adecuada para prototipos de automatización de ensamblaje que requieran señal táctil.
- **Investigación en políticas visuotáctiles**: sirve como baseline reproducible para comparar recetas de fusión visión-tacto en tareas de manipulación fina, dado que la receta de entrenamiento está publicada en el repositorio robo-synapse.
- **Evaluación de robustez con múltiples semillas**: la métrica reportada (4 semillas × 50 episodios) permite replicar protocolos de evaluación estadística en robótica de manipulación.
- **Punto de partida para fine-tuning en tareas similares**: al estar en formato LeRobot, puede reutilizarse como inicialización para otras tareas de ensamblaje con el mismo robot y configuración de sensores.
- **Validación de pipelines LeRobot 0.6.1**: útil para verificar la integración de entrenamiento e inferencia con esta versión de la librería en entornos de laboratorio.
- **Docencia en robótica de manipulación**: ejemplo completo de política de difusión con entrada táctil, dataset y métricas publicadas, apropiado para cursos prácticos de aprendizaje por imitación.

## Benchmarks y rendimiento

| Métrica | Valor | Condiciones |
|---|---|---|
| Tasa de éxito (`nutbolt`) | 82,0 % | 4 semillas × 50 episodios, máx. 500 pasos |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 344,5 M de parámetros, la inferencia en fp32 requeriría aproximadamente 1,4 GB solo para pesos, más el coste de las entradas visuales y táctiles.
- GPU recomendadas: no disponible. Por tamaño, cabría en GPUs de consumo como RTX 3060/4060/4090, pero no hay confirmación del autor.
- Cabe en GPU de consumo: probable por el número de parámetros, aunque no está verificado.
- Opciones de despliegue: LeRobot (librería declarada); no se indican vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| guitarorangedog/manifeel-tavla-nutbolt | 344,5 M | no aplica | 82,0 % éxito en `nutbolt` | no disponible | Hugging Face (LeRobot) |
| Otros checkpoints ManiFeel | no disponible | no disponible | no disponible | no disponible | no disponible |
| Diffusion Policy (referencia original) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para establecer una comparativa cuantitativa con alternativas concretas de la misma categoría.

## Limitaciones y advertencias

- Modelo específico de tarea: solo está entrenado para `nutbolt` sobre Franka Panda; no generaliza a otras tareas ni robots sin reentrenamiento.
- Dependencia del hardware sensorial: requiere cámara de muñeca e imagen táctil derecha; sin esa configuración de sensores, la inferencia no es válida.
- Licencia no disponible: no se puede confirmar el uso comercial; conviene contactar con el autor antes de usarlo en producción.
- Sin datos de sesgos ni de alucinación en el sentido de los LLM; el riesgo principal es el fallo de la política (aproximadamente 18 % de episodios fallidos según la métrica reportada).
- Repositorio con 0 descargas y 0 likes: no hay evidencia de validación por terceros.
- No se documentan requisitos de hardware, latencia ni protocolo de seguridad para operar el robot.
- El checkpoint se publicó en 2026-11-12 y no se ha actualizado desde entonces.

## Enlaces

- Hugging Face: https://huggingface.co/guitarorangedog/manifeel-tavla-nutbolt
- Dataset: https://huggingface.co/datasets/RoboSynapse/manifeel-tacr_franka-panda_nutbolt
- Código / receta: https://github.com/kwk2696/robo-synapse/pull/2
