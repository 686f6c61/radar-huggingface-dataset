# Bhavyaaaaaaaa/qwen3-1.7b-interview-coach

## Resumen

El modelo `Bhavyaaaaaaaa/qwen3-1.7b-interview-coach` es un adaptador LoRA (Low-Rank Adaptation) entrenado sobre el modelo base Qwen3-1.7B de Alibaba. Lo desarrolla el usuario de Hugging Face Bhavyaaaaaaaa y su propósito es transformar el comportamiento del modelo base para que genere preguntas de entrevista técnica realistas, basadas en escenarios concretos, en lugar de las típicas preguntas genéricas del método STAR. El adaptador se entrenó localmente en un Apple M5 con la librería `mlx-lm` y se convirtió posteriormente al formato PEFT para integrarse sin fricción en el ecosistema `transformers`.

El modelo resuelve un problema muy específico: los asistentes de entrevistas suelen producir preguntas vagas y repetitivas. Este adaptador aprende a anclar las preguntas en contextos de negocio reales, mencionar estándares del sector (por ejemplo ISO 22000 en FoodTech) y añadir restricciones de escala, cumplimiento o plazos. Se trata de un ajuste fino pequeño (6,4 millones de parámetros entrenables sobre 1.720,6 millones totales, un 0,37 %) con una licencia Apache 2.0 permisiva.

Es relevante ahora porque demuestra que con un conjunto de datos modesto (2.000 ejemplos) y hardware de consumo (un Mac con chip M5) se puede especializar un modelo pequeño en un dominio concreto en unos 10 minutos y sin coste de GPU. No obstante, es un adaptador de nicho, con cero descargas y cero "likes" en el momento de la consulta, y su alcance queda limitado al inglés y a roles tecnológicos comunes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen3-1.7B) con adaptador LoRA |
| Parametros totales | 1.720,6 M (modelo base) + 6,4 M entrenables en el adaptador (0,37 %) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base Qwen3-1.7B) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada; el adaptador se distribuye en safetensors (formato PEFT) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA); el modelo base en formato transformers |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-1.7B, un transformer decoder-only de 1.720,6 millones de parámetros. La configuración LoRA usa rango `r=16`, `alpha=32` y `dropout=0.05`, con módulos objetivo `q_proj`, `k_proj`, `v_proj` y `o_proj` (es decir, las proyecciones de atención). Esto deja 6,4 millones de parámetros entrenables, un 0,37 % del total. El entrenamiento se realizó con `mlx-lm` en un Apple M5, con batch size 4, learning rate 2e-4 y 600 iteraciones, conservando el checkpoint del paso 400. El coste fue de 0 dólares y el tiempo aproximado de 10 minutos.

El conjunto de datos es `Davichick/InterviewForge_GenDS`, con 2.000 ejemplos de entrenamiento, 200 de validación y 50 de test reservados. La pérdida de validación bajó de 3,966 en el paso 1 a 1,457 en el paso 400 (una reducción del 63 %), y empezó a repuntar en el paso 600 (1,471), señal de sobreajuste. No se menciona en la información disponible el uso de RLHF, DPO ni ninguna innovación arquitectónica adicional más allá del propio ajuste LoRA. El adaptador puede fusionarse con el modelo base mediante `merge_and_unload()` para acelerar la inferencia.

## Capacidades

- Generación de preguntas de entrevista técnica basadas en escenarios de negocio concretos (por ejemplo, diseño de sistemas IoT con requisitos de cumplimiento normativo).
- Adaptación al rol y al sector solicitados por el usuario (Backend Developer, IoT Solutions Engineer, FinTech, FoodTech, etc.).
- Incorporación de estándares y herramientas reales del dominio en las preguntas generadas (menciona ISO 22000 en el ejemplo de la model card).
- Añadición de restricciones realistas: plazos, requisitos de escala, cumplimiento normativo y detección de anomalías con umbrales temporales.
- Evita el patrón genérico "tell me about a time" y produce preguntas de diseño y resolución de problemas.
- Soporte de conversación multi-turno mediante plantilla de chat (`apply_chat_template`), con la opción `enable_thinking=False`.
- Capacidad de fusionar el adaptador con el modelo base para despliegue como modelo único.
- No se documentan capacidades de tool calling, agentes, visión, audio ni matemáticas avanzadas específicas del adaptador; las heredadas del modelo base no se detallan en la información disponible.

## Casos de uso

- Simulador de entrevistas técnicas para candidatos: el adaptador genera preguntas de diseño de sistemas ajustadas al rol y al sector indicados en el prompt, lo que permite practicar respuestas ante escenarios realistas en lugar de preguntas genéricas.
- Formación interna de equipos de ingeniería: una empresa puede usar el modelo para generar bancos de preguntas de entrevista adaptadas a sus propios dominios (por ejemplo, FinTech o FoodTech) y revisar la calidad de las preguntas antes de usarlas.
- Preparación de entrevistas para puestos de backend, datos o IoT: el modelo produce escenarios con restricciones de escala y cumplimiento que obligan al candidato a razonar sobre arquitectura y normativa.
- Generación de material de evaluación para bootcamps y academias: los formadores pueden obtener preguntas con contexto de negocio y estándares del sector para construir rúbricas de evaluación.
- Prototipado rápido de asistentes conversacionales de coaching: al ser un adaptador PEFT, se puede cargar sobre Qwen3-1.7B en `transformers` y fusionar para desplegar un servicio ligero de generación de texto.
- Investigación sobre ajuste fino eficiente: sirve como ejemplo reproducible de especialización de un modelo pequeño con LoRA en hardware de consumo (Apple M5) y presupuesto cero, útil para estudiar el efecto del sobreajuste y la selección de checkpoints.
- Demostración de personalización de dominio en espacios de Hugging Face: el autor lo integra en un Space (`Bhavyaaaaaaaa/project`), lo que permite mostrar el antes y el después del adaptador en una interfaz interactiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta la evolución de la pérdida de validación durante el entrenamiento:

| Paso | Pérdida de validación |
|---:|---:|
| 1 | 3,966 |
| 100 | 1,558 |
| 200 | 1,515 |
| 300 | 1,481 |
| 400 (conservado) | 1,457 |
| 500 | 1,438 |
| 600 | 1,471 (inicio de sobreajuste) |

No hay datos de MMLU, HumanEval, GSM8K ni de comparación con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 1.720,6 M de parámetros, en precisión completa (fp16) requiere aproximadamente 3,4 GB solo para los pesos, más el overhead de activaciones y caché KV; en cuantización de 8 bits bajaría a unos 1,7 GB y en 4 bits a unos 0,9 GB, aunque la información disponible no confirma cuantizaciones publicadas del adaptador.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16 (RTX 3060, RTX 4060, RTX 4090, A100, H100); el adaptador en sí es minúsculo (6,4 M de parámetros) y se puede cargar sobre el modelo base en CPU o en GPU.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más en fp16; en cuantización 4 bits podría caber en GPUs con 4-6 GB, aunque no se documenta una versión GGUF del adaptador.
- Opciones de despliegue: `transformers` + `peft` (carga del adaptador y `merge_and_unload()`), `mlx-lm` (entorno original de entrenamiento), y potencialmente vLLM o TGI tras fusionar el adaptador con el modelo base; no se documenta soporte directo en llama.cpp u Ollama para el adaptador.
- Latencia y throughput estimados: no disponibles en la información proporcionada. El entrenamiento completo tardó unos 10 minutos en un Apple M5, lo que da una idea del reducido coste computacional, pero no se aportan métricas de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Bhavyaaaaaaaa/qwen3-1.7b-interview-coach | 1.720,6 M base + 6,4 M adaptador | No disponible (heredado de Qwen3-1.7B) | Apache 2.0 | Hugging Face (0 descargas) | Adaptador LoRA especializado en entrevistas técnicas en inglés |
| Qwen/Qwen3-1.7B (base) | 1.720,6 M | No disponible en la información proporcionada | Apache 2.0 | Hugging Face | Modelo generalista; genera preguntas STAR genéricas según la model card |
| Adaptadores LoRA de dominio similares | Variable | Variable | Variable | Hugging Face | No se dispone de comparaciones cuantitativas en la información proporcionada |

No se dispone de datos de benchmarks que permitan comparar el rendimiento del adaptador frente al modelo base ni frente a alternativas. La comparación cualitativa que ofrece el autor se limita al ejemplo "antes vs después" de la model card.

## Limitaciones y advertencias

- Entrenado con aproximadamente 2.000 ejemplos: cubre roles tecnológicos comunes pero puede resultar genérico en dominios de nicho (bioinformática, sistemas embebidos, trading cuantitativo).
- No ajusta el comportamiento de seguridad ni de rechazo del modelo base; los sesgos y las políticas de seguridad heredadas de Qwen3-1.7B se mantienen.
- Solo habla inglés; el conjunto de datos de entrenamiento está en inglés y no se documenta soporte multilingüe.
- Las limitaciones de conocimiento de código y el "acento" (estilo) del modelo base Qwen3-1.7B se aplican al adaptador.
- Riesgo de alucinación inherente al modelo base: puede mencionar estándares, herramientas o normativas inexistentes o mal aplicadas en las preguntas generadas.
- El adaptador tiene cero descargas y cero "likes" en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- Licencia Apache 2.0 permisiva para uso comercial, pero al derivar del modelo base Qwen3-1.7B conviene verificar los términos del modelo base y de los datos de entrenamiento (`Davichick/InterviewForge_GenDS`) antes de un despliegue en producción.
- El checkpoint conservado (paso 400) no es el de menor pérdida de validación reportada (el paso 500 muestra 1,438), lo que sugiere que la selección se hizo por criterio del autor y no por mínimo estricto.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/Bhavyaaaaaaaa/qwen3-1.7b-interview-coach
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Conjunto de datos de entrenamiento: https://huggingface.co/datasets/Davichick/InterviewForge_GenDS
- Repositorio de `mlx-lm`: https://github.com/ml-explore/mlx-examples/tree/main/llms
- Space del autor: https://huggingface.co/spaces/Bhavyaaaaaaaa/project
- Perfil del autor: https://huggingface.co/Bhavyaaaaaaaa
