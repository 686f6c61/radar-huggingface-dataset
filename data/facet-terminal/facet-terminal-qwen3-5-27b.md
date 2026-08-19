# FACET-Terminal/FACET-Terminal-Qwen3.5-27B

## Resumen

FACET-Terminal-Qwen3.5-27B es un modelo de lenguaje fine-tuneado a partir de Qwen/Qwen3.5-27B, desarrollado por el equipo FACET-Terminal. El objetivo es mejorar la capacidad del modelo para operar como agente de terminal, es decir, resolver tareas ejecutables mediante razonamiento, uso de herramientas de línea de comandos, inspección del entorno y corrección iterativa. El fine-tuning se realiza sobre trayectorias completas y verificadas por ejecución real, generadas por el framework FACET (Fine-grained Agentic Construction of Executable Tasks), que garantiza que cada tarea de entrenamiento tenga un estado inicial y final consistente y comprobable.

El modelo está pensado para aplicaciones de agente de terminal en ámbitos como desarrollo de software, ingeniería de sistemas, automatización de operaciones y razonamiento de largo horizonte. Con 27 mil millones de parámetros (según el nombre), ofrece un equilibrio entre capacidad y coste de despliegue, y según los resultados publicados mejora notablemente la puntuación en Terminal-Bench 2.1 respecto al modelo base, acercándose a modelos mucho más grandes. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (fine-tune de Qwen3.5-27B; detalles exactos no disponibles) |
| Parametros totales | 27B (según nombre del modelo; no confirmado oficialmente en la documentación) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (según tags de HuggingFace) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3.5-27B, un transformer denso de 27 mil millones de parámetros, aunque la documentación proporcionada no especifica detalles adicionales como el número de capas, la dimensión oculta o el mecanismo de atención. El pipeline declarado en HuggingFace es `image-text-to-text`, lo que sugiere que el modelo base podría tener capacidades multimodales, pero la model card de FACET no menciona ninguna capacidad de visión ni de procesamiento de imágenes, por lo que no se puede confirmar su uso en este fine-tune.

El entrenamiento de FACET-Terminal-Qwen3.5-27B se basa en el framework FACET, que construye tareas de terminal de forma que se preserve la intención de la fuente y se mantenga un estado ejecutable compartido. El proceso comienza con 71.341 skills de origen, de los cuales se construyen 7.852 semillas de escenarios y finalmente 6.078 tareas que pasan una validación de ejecución. De los rollouts exitosos de agentes, se seleccionan 1.200 trayectorias completas para el fine-tuning supervisado. Estas trayectorias incluyen el proceso completo de interacción: razonamiento, uso de herramientas de línea de comandos, inspección del entorno, corrección iterativa y finalización de la tarea. El entrenamiento se realiza mediante supervisión directa sobre estas trayectorias verificadas, sin mención explícita de técnicas como RLHF o DPO.

## Capacidades

- Razonamiento y ejecución de tareas de terminal: el modelo está entrenado para planificar y ejecutar comandos de shell, interpretar salidas y corregir errores de forma iterativa.
- Uso de herramientas de línea de comandos: puede invocar utilidades del sistema, gestores de paquetes, compiladores, intérpretes y otras herramientas típicas en entornos Unix/Linux.
- Inspección de entorno: es capaz de explorar el sistema de archivos, variables de entorno, procesos y otros aspectos del estado del sistema para tomar decisiones.
- Corrección iterativa: tras un fallo de ejecución, el modelo puede analizar el error y modificar su enfoque o comando.
- Razonamiento de largo horizonte: las trayectorias de entrenamiento implican múltiples pasos y dependencias, lo que favorece tareas complejas y multi-etapa.
- Generación de código y scripting: aunque no se detalla específicamente, las tareas de terminal suelen implicar escritura de scripts y programas.
- Capacidades multilingües: no disponibles en la documentación; se heredan del modelo base Qwen3.5-27B, pero no se confirman.
- Soporte de tool calling y agentes: implícito en el diseño, ya que el modelo actúa como agente que llama a herramientas de terminal, aunque no se especifica una interfaz formal de function calling.

## Casos de uso

- Automatización de operaciones de sistemas: el modelo puede recibir una descripción de una tarea administrativa (p. ej., "configurar un servicio Nginx con proxy inverso") y generar y ejecutar los comandos necesarios, verificando el resultado.
- Resolución de incidencias en servidores: ante un problema reportado (p. ej., "el servicio de base de datos no arranca"), el modelo inspecciona logs, comprueba dependencias y aplica correcciones, iterando hasta resolverlo.
- Generación y mantenimiento de scripts de despliegue: a partir de requisitos de infraestructura, el modelo puede escribir scripts de shell o de aprovisionamiento (p. ej., Ansible, Docker) y validarlos ejecutándolos en un entorno aislado.
- Asistente de desarrollo de software: ayuda a compilar, ejecutar tests, gestionar dependencias y diagnosticar fallos de build directamente desde la terminal.
- Auditoría y limpieza de sistemas: el modelo puede explorar el sistema para identificar archivos temporales, procesos zombis o configuraciones obsoletas, y proponer o ejecutar acciones de limpieza.
- Entrenamiento de agentes de terminal en entornos educativos: sirve como base para construir asistentes que enseñen a usar la línea de comandos, ya que el modelo puede razonar sobre comandos y explicar sus acciones.
- Integración en pipelines de CI/CD: el modelo puede actuar como agente que ejecuta pasos de build, test y despliegue, manejando errores y reintentos de forma autónoma bajo supervisión.

## Benchmarks y rendimiento

Los resultados publicados se basan en Terminal-Bench 2.1, un benchmark para agentes de terminal. Las puntuaciones se promedian sobre tres intentos independientes por tarea, utilizando el mismo scaffold de agente (Terminus-2) para todos los modelos comparados.

| Modelo | Terminal-Bench 2.1 |
|---|---|
| FACET-Terminal-Qwen3.5-27B | 47.57 |
| Qwen3.5-27B (base) | 40.82 |
| Qwen3.5-397B-A17B | 49.06 (diferencia de 1.49 puntos respecto a FACET) |

El modelo mejora al base en 6.75 puntos. No se han publicado resultados en otros benchmarks generales (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

No se dispone de requisitos oficiales de hardware para este modelo. Como orientación general para un modelo de 27B parámetros (basado en estimaciones típicas para arquitecturas transformer densas):

- VRAM estimada para inferencia: aproximadamente 14 GB con cuantización de 4 bits, 28 GB con cuantización de 8 bits y 54 GB en FP16 (valores orientativos, no confirmados por el autor).
- GPUs recomendadas: para cuantización 4 bits, una RTX 4090 (24 GB) o similar es suficiente; para FP16 se necesitan GPUs de mayor capacidad como A100 (80 GB) o H100.
- En consumer GPU: sí, con cuantización (p. ej., 4 bits) en una RTX 3090/4090 o similar.
- Opciones de despliegue: al ser un modelo basado en transformers, puede desplegarse con vLLM, llama.cpp, Ollama, TGI u otros frameworks compatibles con safetensors y arquitecturas Qwen. No se especifican configuraciones concretas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La comparativa se limita a los modelos mencionados en la documentación de FACET, ya que no se dispone de datos de otros modelos de terminal-agent con los mismos benchmarks.

| Modelo | Parámetros | Contexto | Terminal-Bench 2.1 | Licencia |
|---|---|---|---|---|
| FACET-Terminal-Qwen3.5-27B | 27B | no disponible | 47.57 | Apache 2.0 |
| Qwen3.5-27B (base) | 27B | no disponible | 40.82 | Apache 2.0 |
| Qwen3.5-397B-A17B | 397B (MoE, 17B activos) | no disponible | 49.06 | Apache 2.0 (según base) |

El modelo fine-tuneado supera claramente a su base y se acerca a un modelo mucho mayor (397B), lo que sugiere que el fine-tuning dirigido a tareas de terminal es efectivo. No se dispone de comparación con otros modelos de tamaño similar especializados en terminal.

## Limitaciones y advertencias

- El modelo está específicamente entrenado para tareas de terminal; su rendimiento en otras tareas generales de lenguaje puede no diferir del modelo base, pero no se ha evaluado en este contexto.
- Los comandos generados deben inspeccionarse siempre antes de ejecutarse, ya que pueden contener errores o efectos no deseados. La propia documentación recomienda ejecutarlos en un entorno aislado.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar comandos o razonamientos incorrectos, especialmente en situaciones de alta incertidumbre o con información parcial del entorno.
- Sesgos y limitaciones idiomáticas: no se dispone de información sobre los idiomas soportados ni sobre sesgos específicos; se heredan del modelo base Qwen3.5-27B, que puede tener sesgos culturales o lingüísticos propios de su entrenamiento.
- Longitud de contexto: no se especifica, por lo que no se puede garantizar el comportamiento en conversaciones o tareas muy largas.
- El repositorio de HuggingFace muestra un tamaño de 0.0 GB, lo que sugiere que los pesos podrían no estar alojados directamente o que la página es un placeholder; es necesario verificar la disponibilidad real del modelo antes de su uso.
- Para producción, se recomienda validar exhaustivamente el comportamiento del modelo en el entorno objetivo, ya que el rendimiento puede variar según el scaffold de agente, el prompt del sistema, la interfaz de herramientas y la configuración de inferencia.

## Enlaces

- [Modelo en HuggingFace: FACET-Terminal/FACET-Terminal-Qwen3.5-27B](https://huggingface.co/FACET-Terminal/FACET-Terminal-Qwen3.5-27B)
- [Modelo base: Qwen/Qwen3.5-27B](https://huggingface.co/Qwen/Qwen3.5-27B)
- [Sitio web del proyecto FACET](https://stokou.github.io/FACET-Terminal/)
- [Repositorio GitHub de FACET-Terminal](https://github.com/StoKou/FACET-Terminal)
- [Licencia Apache 2.0 del modelo base](https://huggingface.co/Qwen/Qwen3.5-27B/blob/main/LICENSE)
