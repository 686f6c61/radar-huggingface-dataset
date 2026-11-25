# chrisw-shadow/thread_nut_dit_v2

## Resumen

`chrisw-shadow/thread_nut_dit_v2` es una política de control robótico (no un modelo de lenguaje) entrenada con LeRobot y publicada en Hugging Face por el usuario `chrisw-shadow`. Implementa la arquitectura Multi-Task Diffusion Transformer (DiT) descrita en el paper arXiv:2507.05331, que extiende Diffusion Policy sustituyendo el backbone convolucional por un Diffusion Transformer de gran tamaño con condicionamiento conjunto de texto e imagen para aprendizaje multi-tarea. El modelo resuelve una tarea de manipulación muy concreta: "grasp the nut and then thread it onto the upwards facing bolt" (coger una tuerca y enroscarla sobre un tornillo orientado hacia arriba).

El checkpoint contiene 238.312.213 parámetros en formato safetensors (aproximadamente 238 M, por debajo de los ~450 M que el paper atribuye a la variante completa de referencia), con un tamaño de repositorio de 1,0 GB. Consume tres cámaras RGB a 480x640 (una fija y dos en la muñeca), un vector de estado de 39 dimensiones y produce acciones de 21 dimensiones, lo que corresponde a un robot UR10e con pinza Dexee.

Es relevante como ejemplo de política de imitación multi-tarea entrenada de extremo a extremo sobre un dataset pequeño (50 episodios, 43.972 frames a 50 FPS) y como referencia práctica de cómo se publica y despliega un policy DiT con la librería LeRobot 0.7.0. No obstante, se trata de un modelo de nicho, sin métricas de evaluación publicadas y con licencia no especificada, por lo que su interés es principalmente técnico y reproducible, no de producción general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multi-Task Diffusion Transformer (DiT) con condicionamiento texto + visión; soporta objetivos diffusion y flow-matching |
| Parametros totales | 238.312.213 (safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política de imitación por paso) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión de entrenamiento; no se documentan variantes GGUF/AWQ) |
| Idiomas soportados | no disponible (condicionamiento textual en inglés en la tarea de entrenamiento) |
| Licencia | no disponible (la model card indica "[More Information Needed]") |
| Formato de pesos | safetensors (repositorio de 1,0 GB, librería `lerobot`) |

## Arquitectura y entrenamiento

La política sigue el diseño Multi-Task DiT: un Diffusion Transformer que procesa observaciones multimodales (tres imágenes RGB de 3x480x640 y un vector de estado de 39 dimensiones) junto con una instrucción de texto, y genera una secuencia de acciones de 21 dimensiones mediante un proceso de difusión (o flow-matching, según configuración). El condicionamiento textual permite una sola política para múltiples tareas, aunque en este checkpoint el dataset de entrenamiento contiene una única tarea. El número de parámetros del checkpoint (238 M) es inferior al ~450 M reportado en el paper para la variante de referencia, lo que sugiere una configuración reducida de anchura/profundidad.

El entrenamiento se realizó con LeRobot 0.7.0 sobre el dataset `chrisw-shadow/nut_5_subset_rel`: 50 episodios, 43.972 frames a 50 FPS, con la instrucción "grasp the nut and then thread it onto the upwards facing bolt". La configuración reportada es de 50.000 pasos, batch size 96, optimizador Adam, learning rate 2e-5 y semilla 1000. No se documentan detalles sobre aumentos de datos, composición exacta del dataset más allá del conteo, ni sobre el uso de RLHF/DPO (no aplicable en este dominio: es aprendizaje por imitación).

## Capacidades

- Control robótico de manipulación: genera acciones de 21 dimensiones para un UR10e con pinza Dexee a partir de observaciones visuales y de estado.
- Percepción multimodal: procesa simultáneamente tres cámaras (fija, muñeca 1, muñeca 2) a resolución 480x640.
- Condicionamiento por lenguaje natural: acepta una instrucción textual de tarea, lo que habilita en principio el paradigma multi-tarea del método.
- Aprendizaje por imitación: reproduce comportamientos aprendidos de demostraciones teleoperadas.
- Soporte de objetivos de difusión y flow-matching según la implementación de `multi_task_dit` en LeRobot.
- No dispone de tool calling, function calling, razonamiento multi-paso simbólico, capacidades de agente software ni generación de texto libre; no es un modelo de lenguaje.
- Capacidades multilingües: no disponibles; la única instrucción documentada está en inglés.

## Casos de uso

- Automatización de ensamblaje con rosca: la política ejecuta la secuencia coger tuerca y enroscarla en un tornillo vertical, adecuada para celdas de montaje repetitivas donde el objeto y la pose del tornillo están controlados.
- Banco de pruebas de imitación multi-tarea: sirve como referencia reproducible para validar el pipeline `multi_task_dit` de LeRobot con un dataset pequeño (50 episodios) y una sola instrucción.
- Base para fine-tuning en tareas de roscado similares: al estar condicionada por texto e imágenes, puede reentrenarse con nuevos datasets que compartan la misma morfología de robot y espacio de acciones.
- Investigación en políticas DiT: útil para comparar Diffusion Policy convolucional frente a DiT en tareas de precisión con contacto (enroscado requiere alineación fina).
- Despliegue en laboratorio con UR10e + Dexee: el comando `lerobot-rollout` documentado permite ejecutar la política en hardware real en menos de una hora tras calibrar cámaras y puerto.
- Recolección de datos y evaluación de robustez: al no haber métricas publicadas, es un candidato para que terceros midan tasas de éxito bajo variaciones de iluminación, posición del tornillo o distracciones.
- Docencia en robótica de imitación: ejemplo completo de model card, dataset enlazado y comandos de entrenamiento/despliegue para cursos prácticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye la sección de evaluación vacía con la nota "_No evaluation results have been provided for this policy yet._", por lo que no existen tasas de éxito, número de ensayos ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 238 M parámetros en safetensors, los pesos ocupan aproximadamente 1 GB en fp32 o ~0,5 GB en fp16; el consumo real depende de los tres streams de imagen a 480x640 y del número de pasos de difusión.
- GPU recomendadas: no especificadas por el autor. Por tamaño, una GPU consumer con 8-12 GB (RTX 3060/4070) debería ser suficiente para inferencia; para entrenamiento con batch 96 se requiere una GPU de mayor memoria (A100/H100 o RTX 4090) según la implementación de LeRobot.
- Cabe en GPU consumer: previsiblemente sí, dado el tamaño del checkpoint, aunque no hay confirmación oficial ni cifras de latencia.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecución en robot, `lerobot-train` para reentrenamiento); no se documentan exportaciones a vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. La frecuencia de control efectiva dependerá del robot y de la configuración de difusión; el dataset se grabó a 50 FPS, pero no se indica la frecuencia de inferencia en despliegue.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / observación | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `chrisw-shadow/thread_nut_dit_v2` | 238 M | 3 cámaras 480x640 + estado 39-D | Roscado de tuerca (UR10e Dexee) | no disponible | Hugging Face, 0 descargas |
| Diffusion Policy (original, Chi et al.) | no disponible | imágenes + estado | Manipulación multi-tarea | no disponible | Código abierto en repositorios académicos |
| Multi-Task DiT (paper arXiv:2507.05331) | ~450 M (según paper) | texto + visión | Multi-tarea robótica | no disponible | Paper; implementación en LeRobot |
| ACT (Action Chunking Transformer, LeRobot) | no disponible | imágenes + estado | Imitación por chunking | no disponible | Integrado en LeRobot |

La comparación cuantitativa de rendimiento no está disponible porque este checkpoint no publica evaluación y el paper de referencia no se ha contrastado aquí con resultados numéricos.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay tasas de éxito ni número de ensayos, por lo que se desconoce la fiabilidad real de la política.
- Licencia no especificada: la model card marca la licencia como "[More Information Needed]", lo que impide confirmar el uso comercial.
- Dataset muy pequeño y de una sola tarea: 50 episodios y una única instrucción limitan la generalización; el nombre del checkpoint sugiere una variante "v2" sin histórico documentado.
- Dependencia de hardware concreto: entrenada para UR10e con pinza Dexee y tres cámaras con nombres y disposición específicos (`fixed`, `wrist_1`, `wrist_2`); no es portable a otras morfologías sin reentrenamiento.
- Sensibilidad a condiciones visuales: al ser una política de imitación, es probable que varíe su comportamiento ante cambios de iluminación, posición del tornillo o distracciones; no se documenta robustez.
- Riesgo de alucinación en el sentido de acciones plausibles pero incorrectas: en tareas de contacto fino (enroscado) los errores de alineación pueden producir fallos silenciosos o colisiones.
- Idiomas: solo se documenta condicionamiento en inglés; no hay evidencia de generalización a otras instrucciones.
- Sin datos de sesgos: no se reportan análisis de sesgo, y en robótica los sesgos relevantes serían de distribución visual y de posiciones de objeto.
- Repositorio sin descargas ni likes en el momento de la consulta: no hay validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chrisw-shadow/thread_nut_dit_v2
- Dataset de entrenamiento: https://huggingface.co/datasets/chrisw-shadow/nut_5_subset_rel
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=chrisw-shadow/nut_5_subset_rel
- Paper del método (Multi-Task DiT): https://huggingface.co/papers/2507.05331 (arXiv:2507.05331)
- Guía de LeRobot para `multi_task_dit`: https://huggingface.co/docs/lerobot/main/en/multi_task_dit
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
