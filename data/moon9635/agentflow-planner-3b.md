# moon9635/agentflow-planner-3b

## Resumen

AgentFlow Planner 3B es un modelo de lenguaje especializado en planificación de tareas para sistemas agénticos, desarrollado por el equipo de AgentFlow (Stanford) y publicado bajo licencia MIT. Se construye sobre el checkpoint instructivo Qwen/Qwen2.5-3B-Instruct, con 3.085.938.688 parámetros (aproximadamente 3,09 mil millones) y una ventana de contexto de 33K tokens, según la información disponible. El modelo es un componente del framework AgentFlow, un sistema modular que separa la planificación de la ejecución de herramientas, superando las limitaciones de escalabilidad y generalización de enfoques que entrenan un único LLM para intercalar razonamiento y llamadas a herramientas.

Su relevancia radica en que aborda la optimización de sistemas agénticos de forma entrenable, con módulos especializados (planificador, ejecutor, etc.) en lugar de un modelo monolítico. El checkpoint presentado aquí es el módulo planificador, que se encarga de generar planes de acción de alto nivel que luego son ejecutados por el resto del sistema. Al estar basado en Qwen2.5, hereda su arquitectura Transformer decoder-only y su capacidad multilingüe, aunque el autor no especifica los idiomas soportados en la ficha.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Qwen2.5) |
| Parametros totales | 3.085.938.688 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 33K tokens (según fuente de Antbase) |
| Tipos de cuantizacion | No publicados por el autor; se pueden generar cuantizaciones GGUF/AWQ/FP8/INT4/INT8 mediante herramientas externas |
| Idiomas soportados | No especificados; hereda los idiomas del modelo base Qwen2.5 (principalmente chino e inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del Qwen2.5-3B-Instruct, un Transformer decoder-only con atención causal y pre-normalización. No se han publicado detalles específicos del proceso de entrenamiento del checkpoint de planificador, pero el framework AgentFlow (descrito en el paper de 2025-10-08) introduce una arquitectura modular donde el planificador se entrena por separado del ejecutor, con el objetivo de mejorar la generalización a nuevas herramientas y dominios. La técnica de entrenamiento probablemente incluye una fase de supervisión (SFT) y posiblemente optimización por refuerzo (RL), aunque no hay confirmación oficial.

El modelo se publica como parte del repositorio AgentFlow, con un paper en HuggingFace y código en GitHub. No se menciona el número de tokens de entrenamiento ni la composición exacta del dataset.

## Capacidades

- Planificación de tareas de alto nivel: el modelo genera secuencias de acciones o planes de pasos para cumplir un objetivo, separando la lógica de decisión de la ejecución de herramientas.
- Integración con herramientas: a través del framework AgentFlow, el planificador puede generar llamadas a herramientas específicas (búsqueda, calculadora, APIs) que luego ejecuta el módulo ejecutor.
- Razonamiento multi-paso: al ser un modelo de 3B, puede realizar razonamiento secuencial para descomponer problemas complejos en subtareas.
- Soporte de tool calling: aunque no se documenta explícitamente, el diseño del framework indica que el planificador genera instrucciones de llamada a herramientas.
- Multilingüe (limitado): hereda las capacidades del modelo base Qwen2.5, que soporta chino e inglés principalmente.
- No se reportan capacidades de visión, audio u otras modalidades.

## Casos de uso

- Asistentes de atención al cliente: el planificador puede descomponer una consulta del usuario en pasos como buscar en la base de conocimientos, verificar datos del cliente y generar una respuesta, delegando la ejecución a otras herramientas.
- Automatización de procesos empresariales: en flujos de trabajo que requieren varias acciones (consultar inventario, calcular precios, enviar correo), el modelo genera el plan de acciones y el sistema lo ejecuta.
- Agentes de investigación web: para preguntas que requieren múltiples búsquedas o consultas a APIs, el planificador organiza la secuencia de consultas y la síntesis de resultados.
- Generación de código asistida por herramientas: el modelo puede planificar la creación de un script, llamando a funciones de compilación o pruebas, aunque su tamaño limita la complejidad de código.
- Desarrollo de chatbots con herramientas integradas: como parte de un framework de agentes, el planificador decide cuándo usar una herramienta externa y en qué orden.
- Optimización de pipelines de datos: el modelo puede planificar pasos de extracción, transformación y carga (ETL) cuando se integra con herramientas de procesamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni otras evaluaciones comparativas.

## Requisitos de hardware

- VRAM estimada: para inferencia en FP16, el modelo necesita aproximadamente 6 GB (3B parámetros × 2 bytes). En cuantización INT4, se reduce a ~1,8 GB.
- GPU recomendadas: una RTX 3060 de 12 GB o superior para FP16; para cuantización 4-bit, una GPU con 4 GB de VRAM es suficiente (por ejemplo, RTX 3050, GTX 1660 Super).
- Puede ejecutarse en CPU con llama.cpp, aunque con latencia mayor (varios segundos por token).
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI (Text Generation Inference) y FriendliAI (que ofrece cuantización FP4, FP8, INT4, INT8).
- Latencia y throughput estimados: no publicados. En GPU A100, se espera un throughput de varios cientos de tokens/segundo en modo batch, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AgentFlow Planner 3B | 3,09 B | 33K | Transformer (Qwen2.5) | MIT | HuggingFace |
| Qwen2.5-3B-Instruct | 3,09 B | 32K | Transformer | Apache 2.0 | HuggingFace |
| Llama-3.2-3B-Instruct | 3,21 B | 128K | Transformer (Llama) | Llama 3.2 license | HuggingFace |

La comparación directa se limita a características básicas porque no hay benchmarks. El modelo se distingue por su entrenamiento especializado en planificación, mientras que Qwen2.5-3B-Instruct y Llama-3.2-3B son modelos generalistas.

## Limitaciones y advertencias

- Sesgos heredados: al estar basado en Qwen2.5, puede reflejar los sesgos del modelo base, incluyendo estereotipos y opiniones políticas.
- Alucinaciones: como cualquier LLM, puede generar información falsa o planes inviables, especialmente en dominios de conocimiento limitado.
- Ventana de contexto limitada: 32K tokens puede ser insuficiente para tareas que requieren historiales muy largos o documentos extensos.
- Dependencia del framework: el modelo está diseñado para funcionar dentro del sistema AgentFlow; su uso aislado como planificador independiente puede no dar los mismos resultados.
- Idiomas: no se garantiza un rendimiento robusto en idiomas distintos del chino e inglés.
- Sin garantía de producción: el autor no indica que el modelo sea apto para producción; se recomienda validación exhaustiva en casos de uso críticos.

## Enlaces

- [HuggingFace - AgentFlow/agentflow-planner-3b](https://huggingface.co/AgentFlow/agentflow-planner-3b)
- [Repositorio en GitHub (AgentFlow)](https://github.com/lupantech/AgentFlow)
- [Paper en HuggingFace](https://huggingface.co/papers/date/2025-10-08)
- [Demo](https://huggingface.co/spaces/AgentFlow/agentflow)
- [Sitio web del proyecto](https://agentflow.stanford.edu/)
- [Video en YouTube](https://www.youtube.com/watch?v=kIQbCQIH1SI)
- [Post en X (Twitter)](https://x.com/lupantech/status/1976016000345919803)
