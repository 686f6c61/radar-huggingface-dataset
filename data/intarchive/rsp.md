# IntArchive/RSP

## Resumen

RSP (Reasoning by Superposition) es el artefacto de investigación publicado en Hugging Face por el usuario IntArchive (Hai Dinh) que acompaña al artículo «Reasoning by Superposition: A Theoretical Perspective on Chain of Continuous Thought» (arXiv:2505.12514, NeurIPS 2025), firmado por Hanlin Zhu, Shibo Hao, Zhiting Hu, Jiantao Jiao, Stuart Russell y Yuandong Tian. No es un modelo de propósito general ni un asistente conversacional: es el conjunto de código, checkpoints y utilidades experimentales de un trabajo teórico sobre *chain of continuous thought* (Coconut), la variante de chain-of-thought en la que los «tokens de pensamiento» son vectores continuos en el espacio latente en lugar de tokens discretos.

El problema que aborda es por qué el CoT continuo supera al discreto en tareas de razonamiento. Los autores demuestran que un transformer de dos capas con D pasos de CoT continuo resuelve el problema de alcanzabilidad en grafos dirigidos, donde D es el diámetro del grafo, mientras que el mejor resultado conocido para transformers de profundidad constante con CoT discreto requiere O(n²) pasos de decodificación, siendo n el número de vértices. La clave es que cada vector de pensamiento continuo actúa como un estado de superposición que codifica varias fronteras de búsqueda a la vez (BFS en paralelo), frente al CoT discreto, que debe muestrear un único camino y por tanto realiza búsqueda secuencial.

El repositorio tiene 7,3 GB e incluye checkpoints y registros de entrenamiento (etiqueta `tensorboard`). La configuración experimental publicada es un transformer de 2 capas, 8 cabezas y 768 dimensiones entrenado con Coconut sobre ProsQA, un conjunto sintético de alcanzabilidad en grafos. Es relevante ahora porque ofrece una explicación teórica y una receta reproducible de un fenómeno —la emergencia espontánea de superposición de fronteras de búsqueda durante el entrenamiento— que hasta la fecha solo se había observado empíricamente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de 2 capas, 8 cabezas de atención y 768 dimensiones, entrenado con el método Coconut (chain of continuous thought) |
| Parametros totales | No disponible. La configuración publicada es 2 capas / 8 cabezas / 768 dimensiones; el recuento de parámetros no se indica en la información disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (no se publican pesos cuantizados) |
| Idiomas soportados | No disponible (el entrenamiento descrito se limita a ProsQA, una tarea sintética de grafos) |
| Licencia | El README del proyecto declara licencia MIT; el campo de licencia del repositorio de Hugging Face figura como no disponible |
| Formato de pesos | No disponible (los scripts de entrenamiento y evaluación usan PyTorch vía `torchrun` y selección de checkpoints, sin que se especifique un formato de publicación) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de pequeña escala: 2 capas, 8 cabezas de atención y dimensión de modelo 768. Se entrena con Coconut (Chain of Continuous Thought, arXiv:2412.06769), un esquema en el que el modelo sustituye los tokens de pensamiento discretos por estados ocultos continuos que realimenta como entrada en pasos sucesivos. El script de reproducción principal es `args/prosqa_coconut_2l_8h_768d.yaml`, ejecutable con `torchrun --nnodes 1 --nproc_per_node 2 run.py`, y el registro del entrenamiento se envía automáticamente a Weights & Biases. Tras el entrenamiento se selecciona el checkpoint con mejor precisión de validación y se evalúa con `args/eval_prosqa_coconut_2l_8h_768d.yaml`.

El dataset de entrenamiento descrito es ProsQA, un benchmark sintético de alcanzabilidad en grafos dirigidos derivado del trabajo de Coconut. No se especifican en la información disponible el número de tokens de entrenamiento, la composición completa del dataset ni si hubo fases de RLHF o DPO; por el tipo de tarea (razonamiento sobre grafos con respuesta verificable) cabe esperar entrenamiento supervisado, pero esto no se confirma en la documentación. La innovación técnica destacable es la construcción teórica: cada pensamiento continuo se interpreta como un estado de superposición que representa simultáneamente varias fronteras de búsqueda, lo que permite paralelizar el BFS. Los experimentos de los autores muestran que esta codificación de múltiples fronteras emerge de forma automática durante el entrenamiento, sin supervisión explícita que guíe al modelo a explorar varios caminos a la vez.

## Capacidades

- Razonamiento sobre grafos dirigidos: resuelve tareas de alcanzabilidad (dados un origen y un destino, determinar si existe camino) mediante búsqueda en anchura implícita en el espacio latente.
- Chain of continuous thought: genera pasos de pensamiento como vectores continuos en lugar de tokens discretos, con D pasos aproximadamente iguales al diámetro del grafo en la construcción teórica.
- Representación de múltiples fronteras de búsqueda en un único estado latente (superposición), lo que equivale a explorar varios caminos en paralelo.
- Reproducibilidad de experimentos: scripts de entrenamiento y evaluación completos, registro en W&B y notebooks de demostración.
- Inspección del espacio latente: el cuaderno `notebook.ipynb` permite visualizar las «fronteras de búsqueda» latentes y reproducir las figuras del artículo.
- Ejecución en CPU para la demo: el notebook resuelve un caso de ProsQA y reproduce resultados clave en pocos segundos en un solo núcleo.
- No se documentan capacidades de generación de texto abierto, código, matemáticas generales, visión, audio, tool calling, function calling ni comportamiento agéntico.

## Casos de uso

- Reproducción de resultados académicos: el repositorio permite reentrenar el modelo de 2 capas con Coconut sobre ProsQA y verificar la construcción teórica del artículo, algo útil para grupos que quieran validar o extender el resultado antes de publicar.
- Investigación en interpretabilidad: el notebook expone los estados latentes y permite comprobar si el modelo codifica varias fronteras BFS en superposición, lo que sirve para estudiar qué información codifican los pensamientos continuos y cómo evoluciona esa codificación durante el entrenamiento.
- Docencia sobre chain-of-thought: al ejecutarse en CPU en segundos, el demo es adecuado para ilustrar en clase la diferencia entre búsqueda secuencial (CoT discreto) y búsqueda paralela en superposición, sin necesidad de GPU.
- Extensión a otros problemas de razonamiento: los scripts y configuraciones YAML sirven como punto de partida para sustituir ProsQA por otros dominios donde el razonamiento se reduce a alcanzabilidad o planificación (laberintos, dependencias entre paquetes, rutas en redes).
- Comparativa CoT discreto frente a CoT continuo: el mismo código base permite entrenar y evaluar ambas variantes bajo idénticas condiciones, midiendo pasos de decodificación necesarios y precisión de validación.
- Generación de material para publicación: las figuras del artículo se reproducen desde el propio repositorio, lo que facilita crear variantes de las visualizaciones o incluirlas en réplicas y revisiones.
- Prototipado de planificación en espacio latente: el enfoque de superposición es un banco de pruebas para investigar alternativas a la decodificación autoregresiva en tareas de búsqueda, aunque no está empaquetado como biblioteca de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La documentación describe un resultado teórico —un transformer de dos capas con D pasos de CoT continuo resuelve la alcanzabilidad en grafos dirigidos, frente a los O(n²) pasos que requiere el mejor resultado conocido con CoT discreto en profundidad constante— y afirma que los experimentos verifican que la construcción teórica se corresponde con la solución empírica obtenida por dinámica de entrenamiento. Sin embargo, no se incluyen tablas con métricas numéricas (precisión, pasos de decodificación medidos, comparación cifrada con líneas base) en el material proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Por la configuración (2 capas, 768 dimensiones) se trata de un modelo de escala muy reducida, y el propio README indica que la demo completa se ejecuta en una CPU en pocos segundos.
- GPU recomendadas: no se especifican. El script de entrenamiento publicado usa `torchrun --nnodes 1 --nproc_per_node 2`, es decir, 2 procesos en una sola máquina, sin que se detalle el modelo de GPU.
- Viabilidad en GPU de consumo: no se confirma explícitamente, pero el tamaño descrito del modelo y la ejecución en CPU del demo apuntan a que la inferencia cabe holgadamente en cualquier GPU de consumo; no hay cifras publicadas que lo cuantifiquen.
- Opciones de despliegue: no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI. El despliegue previsto es la ejecución directa del repositorio de código (PyTorch + scripts `run.py`) o el cuaderno Jupyter de demostración.
- Latencia y throughput: no disponibles. El único dato cualitativo es que el caso de demostración sobre ProsQA se resuelve en pocos segundos en CPU.
- Almacenamiento: el repositorio de Hugging Face ocupa 7,3 GB, presumiblemente por checkpoints y registros de entrenamiento; conviene prever ese espacio en disco.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RSP (IntArchive) | No disponible (2 capas, 8 cabezas, 768 d) | No disponible | Coconut sobre ProsQA; estudio teórico de CoT continuo | MIT segun README; campo de licencia en HF no disponible | Repositorio HF de 7,3 GB + código en GitHub |
| Coconut (arXiv:2412.06769) | No disponible | No disponible | CoT continuo, referencia metodológica de RSP | No disponible | Código y paper publicados por sus autores |
| Transformers con CoT discreto (línea base teórica) | No disponible | No disponible | CoT con tokens discretos; requiere O(n²) pasos en el resultado citado | No aplica | Resultado teórico, sin artefacto asociado |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada; la comparación es metodológica, no de métricas.

## Limitaciones y advertencias

- Artefacto de investigación, no un modelo listo para producción: no hay pipeline declarado, ni tokenizador documentado, ni API de inferencia, ni pesos en formatos estándar de despliegue.
- Dominio muy restringido: el entrenamiento descrito se limita a ProsQA (alcanzabilidad en grafos dirigidos sintéticos). No hay evidencia de transferencia a lenguaje natural, código u otras tareas.
- Idiomas no documentados: el campo de idiomas figura como no disponible; no debe asumirse soporte multilingüe ni siquiera monolingüe en lenguaje natural.
- Sin datos de benchmarks: no se publican métricas numéricas comparativas, por lo que cualquier afirmación de rendimiento relativo debe tomarse del artículo, no del repositorio.
- Riesgo de alucinación no caracterizado: al ser una tarea con respuesta verificable (existe o no camino), el modo de fallo relevante es el error de razonamiento, no la fabulación lingüística; no se documentan tasas de error.
- Licencia: el README declara MIT, pero el metadato de Hugging Face no incluye campo de licencia. Conviene verificar el fichero LICENSE del repositorio antes de un uso comercial.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay comunidad que haya validado la reproducibilidad de forma independiente.
- Fechas del repositorio (creado y actualizado el 26 de octubre de 2026) y ausencia de documentación adicional: no se puede confirmar si los checkpoints publicados corresponden exactamente a la configuración descrita en el README.
- Nombre del repositorio (`RSP`) poco descriptivo y autoría en Hugging Face bajo un perfil de archivo (`IntArchive`), no bajo los autores del artículo: riesgo de confundir el artefacto con una publicación oficial del equipo de investigación.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/IntArchive/RSP
- Paper principal (arXiv:2505.12514): https://arxiv.org/abs/2505.12514
- Paper de Coconut (arXiv:2412.06769): https://arxiv.org/abs/2412.06769
- Código en GitHub: https://github.com/Ber666/reasoning-by-superposition
- Perfil del autor en Hugging Face: https://huggingface.co/IntArchive
- Perfil del autor en GitHub: https://github.com/IntArchive
- ProsQA (benchmark utilizado): https://arxiv.org/abs/2412.06769
