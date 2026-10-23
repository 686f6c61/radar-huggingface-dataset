# InternScience/Sage-A1.5-Q8_0-GGUF

## Resumen

Sage-A1.5 es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) con aproximadamente 35.500 millones de parámetros totales, desarrollado por InternScience (Shanghai AI Laboratory) y construido sobre Qwen3.6 y el anterior Agents-A1. Está diseñado específicamente para tareas agénticas de horizonte largo: descomposición de problemas científicos, orquestación de subagentes, verificación reflexiva del propio razonamiento y uso intensivo de herramientas externas. La ficha que nos ocupa es la cuantización GGUF Q8_0 del modelo original, publicada por el mismo autor para su despliegue en llama.cpp, Ollama, LM Studio y runtimes compatibles.

El modelo resuelve un problema concreto: la mayoría de LLM de tamaño medio fallan al encadenar decenas de pasos con herramientas, pierden el hilo de la evidencia acumulada y no revisan sus propias hipótesis. Sage-A1.5 incorpora un modo de verificación opcional dentro de su cadena de pensamiento y capacidad de delegar trabajo en subagentes con contextos aislados, manteniendo un perfil de cómputo contenido gracias a la arquitectura MoE. Según la model card, compite con sistemas de escala frontier (Kimi-K3, GLM-5.3, GPT-5.6-sol) en benchmarks agénticos.

La relevancia inmediata para el ecosistema open source es doble: licencia Apache 2.0 sin restricciones adicionales conocidas y disponibilidad en formato GGUF cuantizado, lo que permite ejecutar un modelo de 35B en hardware de una sola máquina con suficiente memoria, sin depender de infraestructura de servido propietaria. Los datos de contexto máximo, composición del dataset y número de tokens de entrenamiento no están disponibles en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE); derivada de Qwen3.6-35B-A3B y Agents-A1 |
| Parametros totales | 35.505.251.456 (35,5B) |
| Parametros activos | no disponible de forma explícita; la nomenclatura del modelo base (Qwen3.6-35B-A3B) sugiere ~3B activos, dato no confirmado en la informacion disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (única incluida en este repositorio); el modelo base en safetensors permite otras cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q8_0) en este repo; safetensors en InternScience/Sage-A1.5 |
| Tamano del repositorio | 38,7 GB |
| Pipeline | text-generation |
| Modalidades declaradas (tags) | texto, visión (vlm, vision), código, tool-use, agentic |

## Arquitectura y entrenamiento

Sage-A1.5 emplea una arquitectura transformer con capas Mixture-of-Experts, heredada del linaje Qwen3.6-35B-A3B y afinada a partir de Agents-A1, el modelo agéntico previo del mismo laboratorio. El diseño MoE mantiene 35,5B parámetros en memoria pero activa solo una fracción por token, lo que reduce el coste de inferencia frente a un modelo denso equivalente. Los tags del repositorio incluyen `vlm` y `vision`, lo que indica que el modelo base incorpora codificador visual, aunque la model card no detalla la arquitectura de esa torre ni la resolución de imagen soportada.

El entrenamiento se orienta a lo que el autor denomina "composición adaptativa de capacidades": orquestación agéntica (delegación de tareas y colaboración en paralelo entre subagentes con contextos aislados), verificación (comprobación de progreso, validación de evidencia y revisión reflexiva de la estrategia dentro de la misma traza) y descubrimiento científico abierto (investigación exploratoria con artefactos inspeccionables). No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO. La model card menciona un "Technical Report" en arXiv (2610.28578) donde presumiblemente se detallan estos extremos.

La innovación destacable no es arquitectónica sino de comportamiento: el llamado "Verification Mode" es una capacidad opt-in embebida en la propia cadena de pensamiento, sin crítico externo, que permite al modelo pausar a mitad de trayectoria, evaluar qué ha establecido y qué ha fallado, y redirigir el plan en el mismo turno. Esto es relevante en producción porque evita la necesidad de orquestar un segundo modelo revisor.

## Capacidades

- Razonamiento agéntico de horizonte largo: descomposición de tareas complejas en subpasos ejecutables, planificación anticipada y adaptación de la estrategia según resultados intermedios.
- Uso nativo de herramientas y function calling: integración con APIs, intérpretes de código, motores de búsqueda y otros servicios externos.
- Orquestación multiagente: coordinación de investigaciones paralelas en subagentes con contextos independientes, que contrastan supuestos y sintetizan hallazgos.
- Modo de verificación (opt-in): autoevaluación del progreso y revisión de la estrategia dentro de la traza de razonamiento, sin modelo crítico externo.
- Razonamiento científico y profesional con herramientas: resolución de problemas tipo olimpiada, investigación bibliográfica y respuesta a preguntas de conocimiento especializado.
- Generación y comprensión de código, incluyendo tareas de ingeniería de software reproducible (SWE-bench Pro reportado).
- Seguimiento preciso de instrucciones con múltiples restricciones simultáneas en dominios diversos (IFBench reportado).
- Procesamiento de documentos: OmniDocBench reportado sugiere capacidad de parsing y comprensión de documentos complejos.
- Capacidades de visión declaradas vía tags (`vlm`, `vision`), aunque sin detalle en la model card.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Investigación científica asistida: el modelo puede planificar una búsqueda bibliográfica, lanzar subagentes en paralelo sobre distintas hipótesis, validar la evidencia encontrada y consolidar un informe con artefactos trazables. Es adecuado por su modo de verificación y por la orquestación con contextos aislados.
- Ingeniería de software agéntica: resolución de issues en repositorios reales, con lectura de código, ejecución de tests en un intérprete y corrección iterativa. El soporte de tool calling y el rendimiento reportado en SWE-bench Pro (61,2) lo hacen viable para pipelines de CI/CD asistidos.
- Automatización de atención al cliente técnica: conversaciones multi-turno con acceso a APIs internas de pedidos, documentación y estado de sistemas mediante function calling, con revisión de la propia respuesta antes de emitirla.
- Análisis documental masivo: extracción estructurada y comprensión de contratos, informes o papers, apoyándose en la capacidad reflejada en OmniDocBench y en la modalidad visión declarada.
- Asistente de descubrimiento científico abierto: exploración de datasets y literatura para generar hipótesis nuevas en lugar de responder preguntas predefinidas, con registro inspeccionable del proceso.
- Agente de búsqueda profunda (deep research): navegación multi-paso con validación de fuentes, orientado a informes de mercado o due diligence técnica, apoyado en los resultados reportados en BrowseComp y GAIA.
- Despliegue local en entornos con requisitos de soberanía del dato: al distribuirse en GGUF Q8_0 con licencia Apache 2.0, puede ejecutarse en infraestructura propia sin enviar información a terceros.
- Evaluación comparativa de estrategias de razonamiento: útil en investigación para estudiar cómo afecta la orquestación y la verificación interna a la fiabilidad en tareas de horizonte largo.

## Benchmarks y rendimiento

Datos reportados por el autor en la model card. Los valores de los modelos comparados no se detallan en la información disponible, por lo que no se incluyen cifras de terceros.

| Benchmark | Sage-A1.5 | Referencia indicada en la model card |
|---|---|---|
| XBench-DS-2510 | 92,0 | SOTA general según el autor |
| IFBench | 81,6 | SOTA general según el autor |
| PinchBench | 90,0 | SOTA general según el autor |
| FrontierScience-Olympiad | 81,0 | SOTA general según el autor |
| FrontierScience-Research | 48,3 | SOTA general según el autor |
| CMT | 80,0 | SOTA general según el autor |
| OmniDocBench | 91,5 | SOTA general según el autor |
| GAIA | 95,1 | Superior a todos los modelos mayores comparados |
| BrowseComp | 81,7 | Primero entre modelos de ~35B |
| SWE-bench Pro | 61,2 | Primero entre modelos de ~35B |
| MLE-Lite | 65,2 | Primero entre modelos de ~35B |
| SciCode | 44,3 | Empatado con Agents-A1 |
| AA-LCR | 81,0 | Primero entre modelos de ~35B |
| HLE con herramientas | 55,1 | Primero entre modelos de ~35B |
| VitaBench | truncado en la model card | no disponible |

Los modelos de referencia citados son Kimi-K3, GLM-5.3 y GPT-5.6-sol (sistemas de escala frontier, sin cifras públicas en la información disponible). No se han publicado en la información proporcionada resultados de MMLU, HumanEval ni GSM8K.

## Requisitos de hardware

- VRAM estimada para Q8_0: en torno a 35,5 GB solo de pesos (38,7 GB de repositorio); con caché KV y overhead del runtime hay que prever aproximadamente 40-48 GB de memoria total, dependiendo de la longitud de contexto efectiva (dato no disponible).
- GPU recomendadas: A100 80 GB, H100 80 GB, H200, L40S 48 GB o RTX 6000 Ada 48 GB para carga completa en GPU. Con 2x RTX 4090 (24 GB cada una) es posible repartir el modelo, aunque el rendimiento depende del ancho de banda de interconexión.
- No cabe en una única GPU de consumo de 24 GB (RTX 4090, 3090) ni en 16 GB. Sí es viable en GPUs de consumo de 48 GB o mediante offload parcial de capas a CPU con llama.cpp, a costa de latencia notablemente mayor.
- Opciones de despliegue: llama.cpp (formato nativo de este repo), Ollama, LM Studio y otros runtimes GGUF. Para los pesos originales en safetensors: Transformers, vLLM y SGLang, Opciones recomendadas si se dispone de GPU suficiente y se necesita alto throughput.
- Throughput y latencia: no disponibles. Al ser MoE, el número de parámetros activos por token es muy inferior al total, por lo que la velocidad de decodificación será sustancialmente mayor que la de un modelo denso de 35B en el mismo hardware, especialmente si el cuello de botella es de cómputo y no de memoria.
- Nota de cuantización: Q8_0 es prácticamente lossless respecto a los pesos originales, pero si el objetivo es reducir requisitos de memoria conviene generar variantes Q5_K_M o Q4_K_M a partir del modelo base en safetensors, no de este repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Sage-A1.5 | 35,5B totales (MoE) | no disponible | Apache 2.0 | HF (safetensors + GGUF Q8_0), ModelScope | Enfoque agéntico y científico; modo de verificación interno |
| Agents-A1 | no disponible | no disponible | no disponible | HF (InternScience) | Predecesor directo del que Sage-A1.5 deriva; empate en SciCode (44,3) |
| Qwen3.6-35B-A3B | 35B totales, ~3B activos (según nomenclatura) | no disponible | no disponible en esta información | HF (Qwen) | Modelo base sobre el que se construye Sage-A1.5; sin las capacidades agénticas específicas |
| Kimi-K3 | escala frontier (sin cifra en la información) | no disponible | no disponible | no disponible | Citado por el autor como referencia de comparación |
| GLM-5.3 | escala frontier (sin cifra en la información) | no disponible | no disponible | no disponible | Citado por el autor como referencia de comparación |
| GPT-5.6-sol | escala frontier (sin cifra) | no disponible | propietaria | API | Citado por el autor como referencia de comparación |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información proporcionada. Al derivar de Qwen3.6 y Agents-A1, hereda los sesgos de sus datos de preentrenamiento, no especificados.
- Riesgo de alucinación: presente como en cualquier LLM. El modo de verificación reduce pero no elimina la posibilidad de validar evidencia incorrecta; en dominios científicos y legales requiere supervisión humana.
- Idiomas soportados: no declarados. No hay garantía documentada de calidad fuera de los idiomas del modelo base; conviene evaluar empíricamente antes de usar en producción multilingüe.
- Longitud de contexto: no disponible. Esto es crítico para su caso de uso principal (horizonte largo); debe medirse antes de dimensionar caché KV y costes.
- Benchmarks: todas las cifras proceden de la model card del autor y no han sido verificadas de forma independiente en esta ficha. La lista de resultados está truncada en el texto disponible (VitaBench incompleto).
- Cuantización: el repositorio solo ofrece Q8_0, con un tamaño de 38,7 GB que limita el despliegue a hardware de gama alta o a configuraciones con offload a CPU. No se proporcionan variantes de menor precisión en este repo.
- Licencia: Apache 2.0 permite uso comercial y modificación, pero debe verificarse en el repositorio del modelo base (Qwen3.6) si existen términos adicionales aplicables en cascada.
- Dependencia de herramientas: gran parte de su rendimiento reportado (HLE con herramientas, BrowseComp, GAIA) se obtiene en entornos con acceso a búsqueda web e intérpretes; sin esas herramientas el rendimiento será sustancialmente inferior y no está cuantificado.
- Fecha de creación del repositorio: 21 de octubre de 2026; el modelo es reciente y la comunidad aún no ha acumulado reportes independientes de fallos.

## Enlaces

- Repositorio GGUF Q8_0: https://huggingface.co/InternScience/Sage-A1.5-Q8_0-GGUF
- Modelo base en safetensors: https://huggingface.co/InternScience/Sage-A1.5
- Página del proyecto: https://alpha-innovator.github.io/Sage-A1.5/
- Informe técnico (arXiv): https://arxiv.org/abs/2610.28578
- Repositorio GitHub: https://github.com/InternScience/Agents-A1
- ModelScope: https://modelscope.cn/models/InternScience/Sage-A1.5
- Prueba gratuita (Intern AI Discovery): https://discovery.intern-ai.org.cn/token-plan/home?tabIndex=0&lang=en-US
- Modelo base Qwen3.6-35B-A3B: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- llama.cpp: https://github.com/ggml-org/llama.cpp
