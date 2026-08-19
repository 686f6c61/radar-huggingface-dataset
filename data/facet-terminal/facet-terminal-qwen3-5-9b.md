# FACET-Terminal/FACET-Terminal-Qwen3.5-9B

## Resumen

FACET-Terminal-Qwen3.5-9B es un modelo de lenguaje fine-tuneado a partir de Qwen/Qwen3.5-9B, desarrollado por el equipo FACET-Terminal. Su objetivo es mejorar la capacidad de los modelos para operar como agentes de terminal: razonar sobre tareas, ejecutar comandos, inspeccionar entornos, corregir errores y completar objetivos verificables mediante ejecución real. El modelo surge del framework FACET (Fine-grained Agentic Construction of Executable Tasks), que sintetiza tareas de terminal preservando la intención de la fuente y manteniendo un estado ejecutable compartido entre todos los componentes de la tarea.

El fine-tuning se realizó sobre 1.200 trayectorias completas de agentes que resolvieron tareas validadas por ejecución, seleccionadas a partir de un pipeline que parte de 71.341 skills fuente, construye 7.852 seeds de escenario y produce 6.078 tareas que pasan validación de ejecución. En la evaluación sobre Terminal-Bench 2.1, el modelo alcanza una puntuación de 35,58, superando al modelo base Qwen3.5-9B (27,34) en 8,24 puntos, el mayor incremento absoluto entre los tamaños evaluados por FACET. Con 9.409.813.744 parámetros, el modelo se posiciona como una opción densa de tamaño medio para automatización de tareas de línea de comandos, con licencia Apache 2.0.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en Qwen/Qwen3.5-9B (arquitectura híbrida con atención lineal y transformer, según documentación de Qwen3.5) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repositorio contiene safetensors; no se documentan versiones cuantizadas) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de Qwen/Qwen3.5-9B, que según la documentación de la familia Qwen3.5 emplea una arquitectura híbrida que combina atención lineal con bloques transformer tradicionales. Esta configuración, pensada para mejorar la eficiencia en contextos largos, se mantiene en el fine-tuning. No se dispone de detalles adicionales sobre el número de capas, dimensiones ocultas o configuración de atención del modelo base en la información proporcionada.

El entrenamiento se realizó mediante supervisión directa (SFT) sobre trayectorias completas de agentes que resolvieron tareas de terminal validadas por ejecución. El proceso FACET sigue un flujo "entorno primero": construye y valida el entorno de la tarea antes de generar la instrucción final, la solución de referencia y el verificador. Cuando una ejecución falla, FACET identifica el componente defectuoso a partir de la trayectoria fallida y lo repara en lugar de regenerar toda la tarea. El dataset final incluye 6.078 tareas que superan validación de ejecución, de las cuales se seleccionaron 1.200 trayectorias exitosas completas para el fine-tuning. No se menciona el uso de RLHF, DPO u otras técnicas de alineación posteriores al SFT.

## Capacidades

- Razonamiento y ejecución de tareas de terminal: el modelo está entrenado para razonar sobre problemas, planificar secuencias de comandos, ejecutarlos y verificar resultados.
- Uso de herramientas de línea de comandos: integra llamadas a herramientas CLI, inspección de entornos, gestión de dependencias y corrección iterativa de errores.
- Razonamiento de largo horizonte: las trayectorias de entrenamiento incluyen procesos multi-paso con correcciones, lo que favorece tareas largas y complejas.
- Generación de código y comandos shell: produce comandos y scripts para tareas de desarrollo, administración de sistemas y automatización.
- Capacidad multimodal potencial: el pipeline_tag del repositorio es `image-text-to-text`, lo que sugiere posible soporte de entrada de imágenes, aunque la model card no detalla esta capacidad ni proporciona ejemplos de uso multimodal.
- Tool calling y agentes: aunque no se documenta explícitamente un protocolo de function calling estándar, el modelo está diseñado para operar como agente que invoca herramientas del sistema.

## Casos de uso

- Automatización de operaciones de desarrollo: el modelo puede ejecutar tareas como compilar proyectos, ejecutar tests, gestionar dependencias y corregir errores de build en un repositorio, actuando como agente dentro de un entorno de CI/CD.
- Administración de sistemas y servidores: capaz de inspeccionar logs, gestionar procesos, configurar servicios y diagnosticar problemas mediante comandos, siempre con supervisión humana y en entornos aislados.
- Asistente de línea de comandos interactivo: integrable en terminales o IDEs como copiloto que sugiere y ejecuta comandos, explicando cada paso y verificando resultados.
- Resolución de tareas de ingeniería de software: adecuado para tareas de refactorización, debugging, gestión de ramas git o automatización de scripts de despliegue, gracias a su entrenamiento en trayectorias completas.
- Investigación en agentes autónomos: sirve como modelo base para experimentos sobre razonamiento multi-paso, uso de herramientas y aprendizaje por refuerzo en entornos de terminal.
- Educación y formación en línea de comandos: puede generar explicaciones paso a paso de comandos y guiar a estudiantes en la resolución de ejercicios prácticos de shell.

## Benchmarks y rendimiento

El único benchmark reportado en la información disponible es Terminal-Bench 2.1, con resultados promediados sobre tres intentos independientes por tarea, utilizando el agente Terminus-2 tanto para el modelo base como para el fine-tuneado.

| Modelo | Terminal-Bench 2.1 |
|---|---|
| Qwen3.5-9B (base) | 27,34 |
| FACET-Terminal-Qwen3.5-9B | 35,58 |
| Mejora absoluta | +8,24 |

La model card indica que este incremento de 8,24 puntos es el mayor entre los tamaños evaluados por FACET, aunque no se proporcionan los resultados de otros tamaños. No se han publicado resultados en benchmarks generales como MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

No se dispone de requisitos oficiales de hardware en la documentación del modelo. A partir del número de parámetros (9,4 mil millones) y del tamaño del repositorio (18,8 GB, consistente con pesos en BF16), se pueden estimar los siguientes requisitos orientativos:

- VRAM estimada para inferencia en BF16: aproximadamente 18,8 GB (cabe en una RTX 4090 de 24 GB o similar).
- VRAM estimada con cuantización int8: aproximadamente 9,4 GB (cabe en GPUs de 12 GB como RTX 4070 Ti o RTX 3060).
- VRAM estimada con cuantización int4: aproximadamente 4,7 GB (podría caber en GPUs de 8 GB, aunque con posible degradación de calidad).
- GPUs recomendadas: RTX 4090, RTX 4080, A100 40 GB, L40S o superiores para BF16 sin cuantización.
- Opciones de despliegue: al ser un modelo transformers estándar, es compatible con vLLM, TGI, llama.cpp (si se convierte a GGUF), Ollama y otros motores de inferencia. No se documentan configuraciones específicas de latencia o throughput.

## Comparativa con modelos similares

La información disponible solo permite comparar directamente con el modelo base Qwen3.5-9B, ya que no se aportan resultados de otros modelos de agente de terminal en el mismo benchmark.

| Modelo | Parametros | Contexto | Terminal-Bench 2.1 | Licencia |
|---|---|---|---|---|
| Qwen3.5-9B (base) | 9,4B | No disponible | 27,34 | Apache 2.0 |
| FACET-Terminal-Qwen3.5-9B | 9,4B | No disponible | 35,58 | Apache 2.0 |

No se dispone de datos comparativos con otros modelos especializados en tareas de terminal (por ejemplo, modelos entrenados específicamente para agentes CLI o benchmarks como Terminal-Bench). La comparativa con modelos generalistas de tamaño similar (como Llama 3.1 8B o Mistral 7B) no es posible sin resultados en los mismos benchmarks.

## Limitaciones y advertencias

- El rendimiento puede variar significativamente según el scaffold del agente, el system prompt, la interfaz de herramientas, el motor de inferencia, la longitud de contexto y la configuración de muestreo. La model card advierte explícitamente sobre esta dependencia.
- Los comandos generados deben inspeccionarse antes de su ejecución y ejecutarse siempre en un entorno aislado, dado el riesgo de acciones destructivas o no deseadas en sistemas reales.
- Riesgo de alucinación y de generación de comandos incorrectos o incompletos, especialmente en tareas fuera del dominio de terminal o con instrucciones ambiguas.
- El modelo está entrenado exclusivamente en trayectorias de terminal; su capacidad para tareas generales de razonamiento o generación de texto puede verse limitada en comparación con el modelo base.
- No se documentan sesgos específicos, pero al ser un fine-tuning de un modelo base, puede heredar sesgos presentes en los datos de preentrenamiento de Qwen3.5.
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar la licencia del modelo base (también Apache 2.0) y cualquier restricción adicional de los datos de entrenamiento, que no se detallan.
- No se proporciona información sobre la longitud de contexto soportada, lo que dificulta planificar despliegues en tareas que requieran ventanas muy largas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FACET-Terminal/FACET-Terminal-Qwen3.5-9B
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Repositorio GitHub del proyecto FACET-Terminal: https://github.com/StoKou/FACET-Terminal
- Sitio web del proyecto FACET: https://stokou.github.io/FACET-Terminal/
- Paper (preprint): https://github.com/StoKou/FACET-Terminal (referencia en la model card, sin DOI o URL de arXiv)
