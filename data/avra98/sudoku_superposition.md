# Avra98/Sudoku_superposition

## Resumen

El repositorio `Avra98/Sudoku_superposition` no contiene un modelo de lenguaje preentrenado, sino un **dataset y un framework de entrenamiento** diseñado para investigar el razonamiento latente en la resolución de Sudoku. Fue creado por Avra98 (Avrajit Ghosh) y está publicado bajo licencia Apache 2.0. El dataset materializa un currículo latente de 12 etapas para el entrenamiento de modelos de razonamiento, donde cada etapa mantiene un conjunto de candidatos por celda y se convierte en secuencias concretas de tripletas `(fila, columna, valor)`.

La relevancia de este recurso radica en que permite entrenar modelos con una estrategia de "superposición" de candidatos, un enfoque inspirado en el razonamiento por superposición latente (similar a Coconut). En lugar de predecir directamente la solución final, el modelo aprende a transitar por etapas intermedias de incertidumbre, reduciendo progresivamente el conjunto de candidatos hasta llegar a la solución única. El repositorio incluye código JAX para el entrenamiento, generación de instancias y evaluación, así como los datos preprocesados en formato `.npy`.

Aunque no es un modelo listo para usar, es un recurso valioso para investigadores interesados en razonamiento simbólico, currículos de entrenamiento y arquitecturas de atención sobre secuencias estructuradas. El tamaño del repositorio es de 9.4 GB, con más de 89 millones de instancias de entrenamiento y casi 5 millones de instancias de prueba.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (dataset y código de entrenamiento) |
| Parametros totales | No disponible (depende del modelo que se entrene) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible (las secuencias son de 81 celdas, pero el contexto depende del modelo) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (los datos son numéricos, sin lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | No aplica (los datos están en `.npy`; el código usa JAX) |

## Arquitectura y entrenamiento

El repositorio no define una arquitectura de modelo específica, sino que proporciona un **dataset y un pipeline de entrenamiento** en JAX. El enfoque se basa en un currículo latente de 12 etapas: en cada etapa, cada celda del Sudoku tiene un conjunto de candidatos posibles. El dataset materializa estos conjuntos como secuencias de tripletas `(fila, columna, valor)` en orden de resolución (solver-order). El entrenamiento se realiza con pérdida de entropía cruzada estándar sobre las tripletas de salida, sin cabezas multi-hot.

El código incluye un generador de instancias (`build_superposition_dataset.py`), un muestreador por puzzle (`superposition_instances.py`) y un trainer JAX (`trainer.py`, `model.py`, etc.). El entrenamiento se organiza por etapas: la etapa `t` (1..12) entrena sobre instancias de la etapa `t-1`, y la etapa 12 apunta a la solución única. Esto permite que el modelo aprenda a reducir gradualmente la incertidumbre, imitando un proceso de razonamiento paso a paso.

No se especifican detalles sobre el tamaño del modelo, número de tokens de entrenamiento ni técnicas como RLHF o DPO. El foco está en el diseño del currículo y la generación de datos, no en un modelo concreto.

## Capacidades

- **Razonamiento simbólico estructurado**: el dataset está diseñado para entrenar modelos que resuelvan Sudoku mediante un proceso de refinamiento progresivo de candidatos.
- **Currículo latente**: permite entrenar con supervisión en etapas intermedias, no solo con la solución final, lo que puede mejorar la capacidad de razonamiento multi-paso.
- **Generación de instancias**: incluye código para crear nuevas instancias de superposición a partir de puzzles de Sudoku.
- **Entrenamiento con JAX**: el código está optimizado para JAX, lo que facilita la experimentación en GPUs y TPUs.
- **Evaluación**: se incluye un evaluador (`evaluater.py`) y un script de entrenamiento con backtracking (`train_backtrack.py`), lo que sugiere soporte para comparar estrategias de decodificación.

No se trata de un modelo con capacidades de lenguaje natural, visión o tool calling. Es un recurso específico para investigación en razonamiento.

## Casos de uso

- **Investigación en razonamiento latente**: el dataset permite estudiar cómo los modelos aprenden a transitar de incertidumbre a certeza en problemas combinatorios, comparando con enfoques como Coconut o Chain-of-Thought.
- **Entrenamiento de modelos de resolución de Sudoku**: se puede usar para entrenar un transformer desde cero o fine-tuning de modelos existentes, con el objetivo de resolver puzzles de 9x9.
- **Evaluación de currículos de entrenamiento**: el diseño por etapas permite experimentar con diferentes estrategias de curriculum learning y medir su impacto en la precisión final.
- **Benchmark de razonamiento simbólico**: los datos de test (99,999 puzzles) pueden servir como benchmark para comparar modelos de razonamiento en tareas estructuradas.
- **Desarrollo de arquitecturas de atención sobre secuencias**: las secuencias de tripletas son una representación adecuada para probar mecanismos de atención que operen sobre estructuras de rejilla.
- **Estudio de generalización**: al variar el número de pistas (clues) y la etapa de superposición, se puede analizar cómo los modelos generalizan a diferentes niveles de dificultad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de precisión, comparaciones con otros modelos ni tablas de rendimiento. Se desconoce si el autor ha evaluado modelos entrenados con este dataset en benchmarks estándar como MMLU o HumanEval, ya que el ámbito es específico de Sudoku.

## Requisitos de hardware

- **VRAM estimada**: no disponible, depende del tamaño del modelo que se entrene. El dataset es de 9.4 GB, pero los archivos `.npy` se cargan en memoria según necesidad.
- **GPU recomendadas**: el código de entrenamiento está preparado para Slurm y menciona H200 en el script `sbatch_instance_latent.sh`, lo que sugiere que se usaron GPUs de alta gama (H200, A100). Para experimentos pequeños, una GPU con 16-24 GB de VRAM podría ser suficiente si se usa un modelo pequeño.
- **Compatibilidad con consumer GPU**: posible si se entrena un modelo pequeño (por ejemplo, <1B parámetros) con cuantización o en precisión mixta, pero no hay indicaciones específicas.
- **Opciones de despliegue**: el código usa JAX, por lo que se puede ejecutar en entornos con JAX instalado (GPU o TPU). No se mencionan herramientas como vLLM u Ollama, ya que no es un modelo de lenguaje.
- **Latencia y throughput**: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en el contexto de datasets de Sudoku con currículo latente. El repositorio es un recurso de investigación específico y no se han encontrado alternativas equivalentes en la búsqueda web. Se recomienda consultar el repositorio de Sakana AI sobre Sudoku-Bench para benchmarks de variantes de Sudoku, pero no es un dataset de entrenamiento con superposición.

## Limitaciones y advertencias

- **No es un modelo listo para usar**: es un dataset y código de entrenamiento; el usuario debe entrenar su propio modelo.
- **Alcance limitado a Sudoku**: los datos están específicamente diseñados para puzzles de 9x9; no es generalizable a otras tareas sin adaptación.
- **Sin datos de rendimiento**: no hay métricas publicadas que demuestren la eficacia del enfoque en comparación con métodos estándar.
- **Dependencia de JAX**: el código requiere conocimientos de JAX y un entorno configurado adecuadamente.
- **Tamaño del dataset**: 9.4 GB puede ser pesado para descargar y procesar en entornos con recursos limitados.
- **Licencia Apache 2.0**: permite uso comercial y modificación, pero se debe atribuir al autor y mantener el aviso de licencia.

## Enlaces

- Repositorio HuggingFace: [Avra98/Sudoku_superposition](https://huggingface.co/Avra98/Sudoku_superposition)
- Perfil del autor en HuggingFace: [Avra98](https://huggingface.co/Avra98)
- Repositorio GitHub relacionado: [reasoning-by-superposition-latent](https://github.com/Avra98/reasoning-by-superposition-latent)
- Código fuente en GitHub (dataset.py): [dataset.py](https://github.com/Avra98/reasoning-by-superposition-latent/blob/main/dataset.py)
- Sudoku-Bench (Sakana AI): [https://pub.sakana.ai/sudoku/](https://pub.sakana.ai/sudoku/)
