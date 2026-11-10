# Autobrik/ecse552-act-oracle-B

## Resumen

Autobrik/ecse552-act-oracle-B es un checkpoint de política robótica basado en ACT (Action Chunking with Transformers), el método de imitación propuesto por Tony Z. Zhao en el repositorio `tonyzhaozh/act`. Lo publica el usuario Autobrik como artefacto del proyecto de la asignatura ECSE 552 de la Universidad McGill, titulado *Learning to Manipulate a New Object from Action-Free Videos*. El modelo no es un LLM ni un modelo multimodal de propósito general: es un controlador visomotor entrenado para una tarea concreta de manipulación sobre el conjunto de datos `Autobrik/ecse552-ocbench-block`.

La relevancia es acotada y experimental. Se trata de una reproducción de ACT sin modificaciones en el núcleo del algoritmo, adaptada a un entorno propio con imágenes como única entrada (el estado del robot se pone a cero), 7 dimensiones de acción rellenadas con ceros hasta las 14 del upstream, episodios de longitud variable y un *chunk* de 20 acciones a 10 Hz (2 segundos, equivalente al chunk de 100 a 50 Hz de ACT). Las acciones son objetivos articulares absolutos.

El repositorio contiene múltiples ejecuciones organizadas por número de demostraciones y semilla (`n<demos>/seed<k>/`), cada una con checkpoints de mejor y última validación, el checkpoint seleccionado para test, estadísticas del dataset y metadatos de procedencia. Es, por tanto, material de investigación reproducible más que un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones con *chunking* |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de observación definida por la configuración de ACT y el *chunk* de 20 acciones a 10 Hz |
| Tipos de cuantizacion | no disponible (checkpoints PyTorch `.ckpt`, sin versiones cuantizadas publicadas) |
| Idiomas soportados | no disponible (modelo de robótica, sin interfaz de lenguaje) |
| Licencia | MIT |
| Formato de pesos | `.ckpt` (PyTorch), con `dataset_stats.pkl` y metadatos JSON asociados |

## Arquitectura y entrenamiento

ACT es un transformer que predice secuencias de acciones (*action chunks*) a partir de observaciones visuales y, opcionalmente, estado proprioceptivo. En esta variante se elimina la entrada de estado del robot (se rellena con ceros) y se trabaja únicamente con imágenes, lo que obliga al modelo a inferir la configuración del brazo a partir de la cámara. Las 7 dimensiones de acción del entorno se rellenan con ceros hasta las 14 del ACT original, y los episodios de longitud variable se gestionan mediante el pipeline del proyecto. El *chunk* es de 20 acciones a 10 Hz, lo que da un horizonte de predicción de 2 segundos, coherente con el chunk de 100 a 50 Hz del ACT de referencia.

El entrenamiento es de imitación supervisada sobre el dataset `Autobrik/ecse552-ocbench-block` (revisión `f7396350f5d70d2d48361fda552028e5a2590774`). El sufijo "oracle" y la mención a "pseudo-labelled targets for (b)/(c)" indican que algunas ejecuciones usan etiquetas oracle (acción real) y otras etiquetas pseudo-etiquetadas, en el marco del experimento de aprendizaje desde vídeos sin acciones. No se documentan número de tokens, composición del dataset, RLHF ni DPO, porque no aplican a este tipo de modelo. Cada ejecución guarda `policy_best.ckpt` (menor pérdida de validación), `policy_last.ckpt` y `selected.ckpt` (el mejor de los dos según rollouts de validación en el dominio fuente, que es el evaluado en test).

## Capacidades

- Generación de trayectorias de acción para manipulación robótica: predice *chunks* de 20 acciones articulares absolutas a 10 Hz.
- Control visomotor a partir de imágenes: funciona sin estado proprioceptivo explícito (entrada de estado a cero).
- Imitación de políticas a partir de demostraciones, incluyendo escenarios con objetivos pseudo-etiquetados.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no procesa lenguaje).
- Capacidades especiales: variantes oracle y pseudo-etiquetadas para el estudio de aprendizaje desde vídeos sin acciones.

## Casos de uso

- Reproducción de experimentos de imitación: cargar `n300/seed0/selected.ckpt` con `action_free.act_original.ActPolicy` y evaluar la política en el entorno `ocbench-block` para replicar los resultados del proyecto ECSE 552.
- Estudio de aprendizaje desde vídeos sin acciones: comparar las ejecuciones oracle (d) con las pseudo-etiquetadas (b)/(c) para medir la brecha de rendimiento al sustituir acciones reales por etiquetas inferidas.
- Análisis de ablación por número de demostraciones: los directorios `n<demos>/seed<k>/` permiten estudiar cómo escala el rendimiento con 50, 100, 300 demostraciones, etc., manteniendo la semilla fija.
- Evaluación de robustez a la ausencia de estado: al poner el estado del robot a cero, el modelo sirve para medir cuánto depende ACT de la propriocepción frente a la visión en tareas de manipulación.
- Baseline para métodos de etiquetado automático: usar las políticas oracle como referencia contra las que comparar nuevas técnicas de pseudo-etiquetado de acciones.
- Docencia y formación en robótica de imitación: el paquete incluye checkpoints, estadísticas y procedencia, lo que facilita su uso como ejemplo reproducible en cursos de aprendizaje por refuerzo e imitación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo menciona la existencia de `history.json` (pérdidas por época) y `selection.json` (selección entre mejor y última validación), sin cifras de éxito en tarea ni comparaciones numéricas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; ACT es un transformer de tamaño moderado y suele caber en GPUs de consumo, pero no se publican cifras.
- GPU recomendadas: no disponible en la información proporcionada.
- Viabilidad en GPU de consumo: no confirmada por el autor; por la naturaleza de ACT es plausible, pero no se aportan datos.
- Opciones de despliegue: carga mediante `action_free.act_original.ActPolicy("n300/seed0/selected.ckpt", device)` del repositorio `BrikHMP18/ecse-552-project`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de robótica).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Autobrik/ecse552-act-oracle-B | no disponible | no aplica (chunk de 20 a 10 Hz) | Manipulación visomotora en `ocbench-block` | MIT | Hugging Face |
| tonyzhaozh/act (ACT original) | no disponible | chunk de 100 a 50 Hz | Manipulación con estado + visión | MIT | GitHub |
| Alternativas tipo Diffusion Policy | no disponible | no disponible | Manipulación por difusión de acciones | no disponible | no disponible |

No se dispone de datos de rendimiento comparables entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- Modelo específico de tarea y entorno: entrenado solo sobre `Autobrik/ecse552-ocbench-block`; no generaliza a otros robots, cámaras u objetos sin reentrenamiento.
- Sin estado proprioceptivo: al poner el estado a cero, la política depende por completo de la imagen, lo que puede degradar la precisión en oclusiones o configuraciones ambiguas.
- Relleno de acciones: las 7 dimensiones reales se rellenan con ceros hasta 14, un artefacto de compatibilidad con el ACT original que hay que respetar al integrar el modelo.
- Riesgo de alucinación en el sentido de acciones plausibles pero incorrectas: como toda política de imitación, puede producir trayectorias fuera de distribución ante observaciones novedosas.
- Sesgos: no evaluados; el dataset es de un único entorno académico y no se documenta diversidad de condiciones.
- Licencia MIT: permite uso comercial, pero el modelo es un artefacto de investigación sin garantías de robustez en producción.
- Sin benchmarks publicados: no hay evidencia numérica de tasa de éxito que respalde su uso fuera del proyecto original.
- Idiomas: no aplica; no procesa texto ni voz.

## Enlaces

- Hugging Face: https://huggingface.co/Autobrik/ecse552-act-oracle-B
- Dataset: https://huggingface.co/datasets/Autobrik/ecse552-ocbench-block
- Repositorio del proyecto: https://github.com/BrikHMP18/ecse-552-project
- ACT original: https://github.com/tonyzhaozh/act
