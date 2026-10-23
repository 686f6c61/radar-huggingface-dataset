# InternScience/Sage-A1.5-FP8

## Resumen

Sage-A1.5-FP8 es la versión cuantizada en FP8 del modelo Sage-A1.5, un Mixture-of-Experts (MoE) de aproximadamente 35.900 millones de parámetros desarrollado por InternScience (Shanghai AI Laboratory). El modelo está construido sobre Qwen3.6-35B-A3B y sobre el predecesor Agents-A1, y su objetivo declarado es avanzar en la resolución de problemas científicos de horizonte largo mediante composición adaptativa de capacidades: orquestación agéntica, verificación y descubrimiento científico abierto.

La propuesta diferencial frente a Agents-A1 no es solo resolver tareas individuales, sino organizar el trabajo y revisar el enfoque durante la ejecución. Para ello incorpora orquestación de subagentes con contextos aislados y paralelos, un modo de verificación opcional dentro de la propia cadena de razonamiento, y flujos de investigación exploratoria con artefactos inspeccionables. El modelo es además multimodal (image-text-to-text), con soporte de visión que se refleja en resultados como OmniDocBench.

Este repositorio concreto distribuye los pesos en formato FP8 mediante `compressed-tensors`, lo que reduce el espacio de almacenamiento a 39,4 GB y facilita el despliegue en infraestructura Hopper o Ada. La licencia Apache 2.0 y la compatibilidad con Transformers, vLLM y SGLang lo sitúan como una base práctica para agentes de código, búsqueda y flujos científicos en producción. La relevancia actual radica en que compite en la clase ~35B con sistemas de escala frontera en benchmarks agénticos como GAIA (95,1), BrowseComp (81,7) y SWE-bench Pro (61,2).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con capacidades de visión; arquitectura `qwen3_5_moe` en Transformers; derivada de Qwen3.6-35B-A3B y Agents-A1 |
| Parametros totales | 35.951.822.704 (~35,95B), según safetensors |
| Parametros activos | No disponible de forma explícita; la denominación del modelo base (Qwen3.6-35B-A3B) sugiere ~3B activos, sin confirmación en la información proporcionada |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | FP8 con `compressed-tensors` (este repositorio); no se detallan otras variantes en la información disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (Transformers); tamaño del repositorio 39,4 GB |

## Arquitectura y entrenamiento

Sage-A1.5 emplea una arquitectura Mixture-of-Experts con torre de visión, registrada en Transformers como `qwen3_5_moe` y derivada del modelo Qwen3.6-35B-A3B de Alibaba Qwen y del modelo Agents-A1 de Shanghai AI Laboratory. El entrenamiento se orienta a comportamiento agéntico de horizonte largo: descomposición de tareas, planificación anticipada, uso nativo de herramientas y adaptación de la estrategia a partir de resultados intermedios. La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas concretas de RLHF o DPO; esos datos deberían consultarse en el informe técnico (arXiv:2610.28578).

Las innovaciones declaradas por el autor se agrupan en tres ejes. Primero, orquestación agéntica: delegación de tareas y colaboración en paralelo entre subagentes con contextos aislados, lo que reduce la interferencia entre investigaciones concurrentes. Segundo, verificación agéntica: un modo opcional de autorrevisión embebido en la propia cadena de razonamiento, donde el modelo se detiene a medio trayecto para evaluar qué ha establecido y qué ha fallado, y actúa sobre una dirección revisada en el mismo turno, sin crítico externo. Tercero, descubrimiento científico abierto: capacidad de pasar de responder preguntas predefinidas a conducir investigación exploratoria con análisis interactivo y artefactos verificables.

## Capacidades

- Generación de texto y razonamiento de horizonte largo con planificación explícita de subpasos y revisión de estrategia.
- Uso nativo de herramientas y function calling: integración con APIs, intérpretes de código, motores de búsqueda y otros servicios externos.
- Orquestación multiagente: reparto de trabajo entre subagentes con contextos independientes y síntesis posterior de hallazgos.
- Modo de verificación (opt-in): autorrevisión dentro de la cadena de pensamiento, con validación de evidencias y corrección de rumbo.
- Capacidades de visión (image-text-to-text, VLM): comprensión de documentos e imágenes, con rendimiento destacado en OmniDocBench (91,5).
- Ingeniería de software y código: resolución de tareas de reparación y desarrollo evaluadas en SWE-bench Pro, SWE-bench Multilingual y SciCode.
- Razonamiento científico y profesional: química, matemáticas aplicadas y conocimiento experto con herramientas (ChemCOTBench, FrontierScience, MLE-Lite).
- Seguimiento preciso de instrucciones con múltiples restricciones (IFBench 81,6).
- Búsqueda y navegación agéntica de largo alcance (BrowseComp 81,7, GAIA 95,1).
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Investigación científica asistida: el modelo puede descomponer una pregunta abierta en subproblemas, lanzar subagentes en paralelo con contextos aislados, validar evidencias y sintetizar conclusiones con artefactos inspeccionables. Es adecuado por su orientación explícita a descubrimiento científico abierto y su resultado de 81,0 en FrontierScience-Olympiad.
- Reparación de bugs en repositorios reales: dado un issue y el código, planifica la localización del fallo, aplica parches y verifica con pruebas. Su 61,2 en SWE-bench Pro y la mejora de +17,6 puntos frente a Agents-A1 lo hacen viable en pipelines de integración continua.
- Agente de búsqueda profunda: para informes de mercado o revisiones bibliográficas, encadena consultas, descarta rutas improductivas mediante el modo de verificación y cierra con citas. Los 81,7 en BrowseComp y 95,1 en GAIA respaldan este escenario.
- Procesamiento documental masivo: digitalización y extracción estructurada de tablas, figuras y texto en PDFs científicos o contractuales, aprovechando la torre de visión y su 91,5 en OmniDocBench.
- Ingeniería de datos y experimentación con ML: tareas de modelado y análisis tipo Kaggle, con escritura de código, ejecución en intérprete y ajuste iterativo. MLE-Lite (65,2) y SciCode (44,3) son los referentes publicados.
- Asistente de laboratorio con control de calidad: el modo de verificación permite que el modelo audite su propio progreso antes de emitir conclusiones, útil en dominios donde un error intermedio contamina todo el resultado (química, cálculo numérico, cumplimiento normativo).
- Automatización de atención técnica especializada: conversaciones multi-turno con uso de herramientas internas (consulta de estado, tickets, documentación) gracias al soporte nativo de function calling; la ventana de contexto concreta no está disponible en la información proporcionada, por lo que debe validarse antes de dimensionar.
- Orquestador de pipelines multiagente: actuar como planificador central que delega en subagentes especializados con contextos separados y agrega sus salidas, reduciendo la interferencia entre ramas concurrentes.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card. No se especifican en la información disponible los ajustes de evaluación (zero-shot, few-shot, uso de herramientas) salvo donde se indica.

| Benchmark | Sage-A1.5 | Referencia / nota |
|---|---|---|
| GAIA | 95,1 | Superior a todos los modelos de mayor escala comparados |
| XBench-DS-2510 | 92,0 | SOTA declarado por el autor |
| OmniDocBench | 91,5 | SOTA declarado por el autor |
| PinchBench | 90,0 | +13,1 frente a Agents-A1 |
| IFBench | 81,6 | SOTA declarado por el autor |
| BrowseComp | 81,7 | Primero entre modelos ~35B |
| AA-LCR | 81,0 | Primero entre modelos ~35B |
| FrontierScience-Olympiad | 81,0 | SOTA declarado por el autor |
| CMT | 80,0 | SOTA declarado por el autor |
| ChemCOTBench | 66,5 | Primero entre modelos ~35B |
| MLE-Lite | 65,2 | +21,3 frente a Agents-A1 |
| SWE-bench Pro | 61,2 | +17,6 frente a Agents-A1 |
| HLE w/ tools | 55,1 | Primero entre modelos ~35B |
| FrontierScience-Research | 48,3 | SOTA declarado por el autor |
| VitaBench | 45,4 | Primero entre modelos ~35B |
| SciCode | 44,3 | Empatado con Agents-A1 |
| SWE-bench Multilingual | No disponible (solo se publica la mejora: +14,0 frente a Agents-A1) | — |

Comparaciones citadas por el autor: Kimi-K3, GLM-5.3 y GPT-5.6-sol como sistemas de escala frontera. No se aportan en la información disponible las cifras desglosadas de esos competidores para MMLU, HumanEval o GSM8K, por lo que no se incluyen.

## Requisitos de hardware

- VRAM para inferencia en FP8: aproximadamente 36 GB solo para pesos; con caché KV y overhead de runtime conviene reservar 40-48 GB. Estimación derivada del número de parámetros (35,95B) y de la cuantización de 8 bits, no un dato publicado por el autor.
- VRAM para el modelo base en precisión completa (BF16): aproximadamente 72 GB solo para pesos. Estimación, no dato confirmado.
- GPU recomendadas para FP8: H100, H200, L40S y GPUs Ada/Blackwell con soporte de tensor cores FP8. A100 no dispone de soporte nativo de FP8, por lo que requeriría usar el modelo base o decuantizar.
- GPU de consumo: una RTX 4090 (24 GB) no puede alojar los ~36 GB de pesos FP8 sin offloading a CPU o disco. Dos RTX 4090 (48 GB agregados) sí permiten el despliegue FP8, asumiendo que el runtime soporte el reparto.
- Opciones de despliegue: Transformers, vLLM y SGLang están explícitamente soportados según la model card. Compatibilidad con llama.cpp, Ollama o TGI no está confirmada en la información disponible; el formato `compressed-tensors` FP8 encaja mejor con vLLM y SGLang.
- Almacenamiento: 39,4 GB de repositorio, más espacio temporal durante la descarga y conversión.
- Latencia y throughput: no disponibles. Al ser un MoE, el throughput dependerá del número de expertos activos por token, dato que no se explicita en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento destacado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sage-A1.5-FP8 | ~35,95B (MoE) | No disponible | GAIA 95,1; SWE-bench Pro 61,2; BrowseComp 81,7 | Apache 2.0 | Hugging Face, ModelScope, AtomGit |
| Agents-A1 (predecesor) | ~35B (misma clase) | No disponible | Base de partida; Sage-A1.5 mejora +17,6 en SWE-bench Pro, +14,0 en SWE-bench Multilingual, +13,1 en PinchBench y +21,3 en MLE-Lite | No disponible en la información | Hugging Face (InternScience/Agents-A1) |
| Qwen3.6-35B-A3B (base) | 35B totales, ~3B activos según denominación | No disponible | No se aportan métricas comparativas en la información | No disponible en la información | Hugging Face (Qwen/Qwen3.6-35B-A3B) |
| Kimi-K3 | No disponible | No disponible | Usado como referencia frontera; sin cifras desglosadas | No disponible | No disponible |
| GLM-5.3 | No disponible | No disponible | Usado como referencia frontera; sin cifras desglosadas | No disponible | No disponible |
| GPT-5.6-sol | No disponible | No disponible | Usado como referencia frontera; sin cifras desglosadas | Propietario | No disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información proporcionada. Al derivar de Qwen3.6 y Agents-A1, hereda los sesgos de sus datos de entrenamiento, que tampoco se detallan.
- Riesgo de alucinación: no cuantificado por el autor. El modo de verificación es opt-in y se ejecuta dentro de la cadena de razonamiento del propio modelo, sin crítico externo, por lo que no constituye una garantía independiente de veracidad.
- Idiomas: la lista de idiomas soportados no está disponible, lo que impide confirmar cobertura y calidad fuera del inglés.
- Contexto: la longitud máxima de contexto no se publica en la información disponible, un dato crítico para dimensionar caché KV, coste y viabilidad de flujos con documentos largos.
- Estado del arte declarado: las afirmaciones de SOTA provienen del propio autor; no se aportan cifras desglosadas de los competidores frontera para verificar las comparaciones.
- Cuantización FP8: introduce una pérdida de precisión no cuantificada respecto al modelo base. Para tareas sensibles a errores numéricos conviene validar contra la versión en precisión completa.
- Requisito de hardware: FP8 exige GPUs Hopper o Ada/Blackwell; A100 queda fuera del camino FP8 nativo.
- Licencia: Apache 2.0 permite uso comercial, pero debe revisarse si el modelo base o los datos derivados imponen condiciones adicionales; la información disponible no detalla esos términos.
- Madurez: repositorio con 116 descargas y 12 likes en el momento de la consulta, lo que indica adopción todavía limitada y poca validación comunitaria independiente.
- Producción: no hay datos publicados de latencia, throughput ni estabilidad en despliegues largos; conviene hacer pruebas de carga propias antes de comprometer SLA.

## Enlaces

- Modelo en Hugging Face (FP8): https://huggingface.co/InternScience/Sage-A1.5-FP8
- Modelo base en Hugging Face: https://huggingface.co/InternScience/Sage-A1.5
- Informe técnico (arXiv): https://arxiv.org/abs/2610.28578
- Página del proyecto: https://alpha-innovator.github.io/Sage-A1.5/
- Repositorio GitHub: https://github.com/InternScience/Agents-A1
- ModelScope (base): https://modelscope.cn/models/InternScience/Sage-A1.5
- ModelScope (FP8): https://www.modelscope.cn/models/InternScience/Sage-A1.5-FP8
- AtomGit (FP8): https://ai.atomgit.com/InternScience/Sage-A1.5-FP8
- Prueba gratuita: https://discovery.intern-ai.org.cn/token-plan/home?tabIndex=0&lang=en-US
- Modelo base Qwen3.6-35B-A3B: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
