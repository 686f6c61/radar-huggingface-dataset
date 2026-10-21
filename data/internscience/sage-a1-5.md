# InternScience/Sage-A1.5

## Resumen

Sage-A1.5 es un modelo de lenguaje multimodal con arquitectura de mezcla de expertos (MoE) de aproximadamente 35.951.822.704 parámetros (~35,95 B), desarrollado por InternScience (Shanghai AI Laboratory) y publicado con licencia Apache 2.0. Se distribuye en formato Hugging Face Transformers (safetensors) y está diseñado específicamente para flujos de trabajo agénticos de horizonte largo: no solo resuelve tareas individuales, sino que organiza el trabajo, delega en subagentes con contextos aislados y revisa su propio enfoque durante la ejecución. Es la evolución de Agents-A1, sobre el que mejora de forma notable en cargas de ingeniería y agentes.

El modelo cubre tres capacidades diferenciales según su model card: orquestación agéntica (descomposición de tareas y colaboración en paralelo entre subagentes), verificación (un modo opcional de auto-revisión dentro de la propia cadena de pensamiento, sin crítico externo) y descubrimiento científico abierto (investigación exploratoria con artefactos de análisis inspeccionables). Incorpora además soporte nativo de function calling y percepción visual, ya que su pipeline es `image-text-to-text`.

Su relevancia actual radica en la relación entre tamaño y rendimiento declarado: con ~35 B de parámetros, el autor lo sitúa por delante de sistemas de escala frontier como Kimi-K3, GLM-5.3 y GPT-5.6-sol en tareas concretas (GAIA 95,1; XBench-DS-2510 92,0; PinchBench 90,0). No se han publicado en la información disponible ni la longitud de contexto, ni el número de parámetros activos, ni la composición del dataset de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) multimodal imagen-texto; tipo de modelo `qwen3_5_moe` en Transformers |
| Parametros totales | 35.951.822.704 (~35,95 B), dato real de safetensors |
| Parametros activos | no disponible (el autor no publica número de expertos ni ratio de activación) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se publican cuantizaciones oficiales; pesos en safetensors, presumiblemente BF16) |
| Idiomas soportados | no disponible (el campo de idiomas no está informado en HuggingFace) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (Transformers); compatible con vLLM y SGLang |
| Tamaño del repositorio | 71,9 GB |
| Pipeline declarado | text-generation (con entrada image-text-to-text) |
| Fecha de publicación | 15 de octubre de 2026 (última actualización: 21 de octubre de 2026) |

## Arquitectura y entrenamiento

Sage-A1.5 es un transformer con mezcla de expertos (MoE) de ~35,95 B de parámetros totales y capacidad multimodal de entrada imagen-texto. El identificador de arquitectura en Transformers (`qwen3_5_moe`) sugiere que el modelo parte de la familia Qwen3.5 MoE, aunque la model card no detalla la construcción del backbone, el número de expertos, el enrutador ni el ratio de activación. El repositorio ocupa 71,9 GB, coherente con pesos en BF16 para ese número de parámetros.

La innovación declarada no está en el backbone sino en el comportamiento en inferencia: Sage-A1.5 aprende a orquestar subagentes con contextos independientes y aislados, lo que permite paralelizar investigaciones y reducir la interferencia entre ramas concurrentes. Incluye un "modo de verificación" opcional que opera dentro de la propia cadena de pensamiento: el modelo se detiene a mitad de trayectoria, evalúa qué ha establecido y qué ha fallado, y actúa sobre una dirección revisada en el mismo turno, sin crítico externo. También se declara capacidad de descubrimiento científico abierto, orientada a investigación exploratoria con artefactos inspeccionables.

No se han hecho públicos en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron etapas de RLHF, DPO o RL con verificadores. Tampoco se detallan técnicas de decodificación especulativa, atención lineal u otras optimizaciones de inferencia.

## Capacidades

- Generación de texto y razonamiento agéntico de horizonte largo, con descomposición de tareas en subpasos ejecutables y replanificación según resultados intermedios.
- Orquestación multiagente: delegación de tareas y colaboración en paralelo entre subagentes con contextos aislados.
- Modo de verificación (opt-in): auto-revisión del progreso, validación de evidencias y revisión reflexiva de la estrategia dentro de la cadena de pensamiento.
- Uso de herramientas y function calling nativo: integración con APIs, intérpretes de código, motores de búsqueda y otros servicios externos.
- Percepción visual: pipeline `image-text-to-text`, con resultados declarados en OmniDocBench (91,5), lo que apunta a comprensión de documentos.
- Razonamiento científico y profesional con herramientas integradas (química, investigación, olimpiadas científicas).
- Ingeniería de software: resolución de incidencias en repositorios y tareas de ML engineering.
- Seguimiento preciso de instrucciones con múltiples restricciones (IFBench 81,6 según el autor).
- Capacidades multilingües: no declaradas formalmente; existe una mejora reportada en SWE-bench Multilingual, pero no se especifica la lista de idiomas cubiertos.

## Casos de uso

- Investigación científica asistida: el modelo puede ejecutar ciclos de búsqueda de literatura, formulación de hipótesis, análisis interactivo de datos y generación de artefactos inspeccionables, gracias a su modo de descubrimiento abierto y a sus resultados declarados en FrontierScience-Research (48,3) y ChemCOTBench (66,5).
- Agente de resolveduría de incidencias en repositorios: con SWE-bench Pro en 61,2 y soporte de tool calling, encaja en pipelines que leen el repositorio, ejecutan tests, aplican parches y verifican el resultado antes de abrir una pull request.
- Deep research y búsqueda de horizonte largo: para informes que requieren decenas de consultas encadenadas, con BrowseComp 81,7 y GAIA 95,1 como referencia declarada; la orquestación de subagentes permite paralelizar líneas de investigación y contrastar hallazgos.
- Procesamiento documental intensivo: al ser un VLM con 91,5 en OmniDocBench, puede extraer y estructurar información de PDFs, facturas, informes técnicos y tablas, combinando lectura visual con razonamiento sobre el contenido.
- Automatización de flujos con múltiples APIs: function calling nativo para encadenar llamadas a servicios externos, con el modo de verificación como mecanismo de control de errores en trayectorias largas donde una llamada fallida condiciona los pasos siguientes.
- Ingeniería de machine learning: tareas de MLE-Lite (65,2) como ajuste de pipelines, selección de características o depuración de entrenamientos, usando el intérprete de código como herramienta.
- Asistentes con instrucciones complejas y formato estricto: generación de respuestas sujetas a restricciones múltiples (longitud, formato, campos obligatorios) en sistemas de back-office, apoyándose en IFBench 81,6.
- Evaluación y revisión internas: uso del modo de verificación para que el propio modelo audite la salida de otro agente antes de publicarla, sin necesidad de un crítico externo separado.

## Benchmarks y rendimiento

Resultados reportados por el autor en la model card (no verificados de forma independiente en la información disponible):

| Benchmark | Área | Sage-A1.5 | Nota del autor |
|---|---|---|---|
| GAIA | Agentes generalistas | 95,1 | Superior a todos los modelos de mayor escala comparados |
| XBench-DS-2510 | Búsqueda de horizonte largo | 92,0 | SOTA declarado |
| OmniDocBench | Comprensión de documentos | 91,5 | SOTA declarado |
| PinchBench | Tareas de ingeniería/agentes | 90,0 | SOTA declarado; +13,1 respecto a A1 |
| IFBench | Seguimiento de instrucciones | 81,6 | SOTA declarado |
| BrowseComp | Búsqueda agéntica | 81,7 | Primero entre modelos de ~35 B |
| FrontierScience-Olympiad | Ciencia (nivel olimpiada) | 81,0 | SOTA declarado |
| AA-LCR | Razonamiento de contexto largo | 81,0 | Primero entre modelos de ~35 B |
| CMT | Conocimiento profesional | 80,0 | SOTA declarado |
| ChemCOTBench | Razonamiento químico | 66,5 | Primero entre modelos de ~35 B |
| MLE-Lite | Machine learning engineering | 65,2 | +21,3 respecto a A1 |
| SWE-bench Pro | Ingeniería de software | 61,2 | +17,6 respecto a A1 |
| HLE (con herramientas) | Razonamiento experto | 55,1 | Primero entre modelos de ~35 B |
| FrontierScience-Research | Investigación científica | 48,3 | SOTA declarado |
| VitaBench | Tareas agénticas diversas | 45,4 | Primero entre modelos de ~35 B |
| SciCode | Código científico | 44,3 | Empatado con Agents-A1 |
| SWE-bench Multilingual | Ingeniería de software multilingüe | no disponible (valor absoluto) | +14,0 respecto a A1 |

No se han publicado en la información disponible los resultados desglosados de los modelos de comparación (Kimi-K3, GLM-5.3, GPT-5.6-sol), por lo que no es posible reproducir la comparación numérica completa.

## Requisitos de hardware

- Pesos en BF16: ~72 GB, coherente con el tamaño del repositorio (71,9 GB). No cabe en una GPU de 48 GB ni en RTX 4090.
- VRAM para inferencia en BF16: 72 GB solo de pesos, más caché KV (no cuantificable sin conocer la longitud de contexto y la configuración de atención). Configuración mínima realista: 2× A100 80 GB o 2× H100 80 GB con tensor parallel; una única H200 (141 GB) o B200 permitiría evitar el reparto.
- VRAM en FP8: ~36 GB de pesos, apto para 1× H100 80 GB, 1× A100 80 GB o 1× L40S 48 GB con margen para caché KV moderada.
- VRAM en cuantización de 4 bits: ~18-20 GB de pesos. En teoría cabe en una RTX 4090 (24 GB), pero la viabilidad depende del contexto efectivo y de que exista soporte correcto para el enrutador MoE; no se han publicado cuantizaciones oficiales.
- Opciones de despliegue confirmadas por el autor: Hugging Face Transformers, vLLM y SGLang. Para MoE conviene usar expert parallel o tensor parallel en vLLM/SGLang; para despliegues en una sola GPU de consumo, llama.cpp u Ollama requerirían una conversión a GGUF no publicada por el autor.
- GPUs recomendadas: H100/H200 para BF16 con contexto largo; A100 80 GB o H100 en FP8 para servicio de producción; RTX 4090/A6000 solo con cuantización agresiva y contexto reducido.
- Latencia y throughput: no disponibles. Al desconocerse los parámetros activos, no es posible estimar de forma fiable el coste por token ni el número de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento destacado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sage-A1.5 | ~35,95 B totales (activos no disponibles) | no disponible | GAIA 95,1; SWE-bench Pro 61,2; MLE-Lite 65,2; OmniDocBench 91,5 | Apache 2.0 | Pesos en HF, ModelScope, GitHub |
| Agents-A1 (predecesor) | no disponible | no disponible | Base de comparación: Sage-A1.5 mejora +17,6 en SWE-bench Pro, +21,3 en MLE-Lite, +13,1 en PinchBench, +14,0 en SWE-bench Multilingual; SciCode empatado (44,3) | no disponible en la información | Referenciado en la model card; repositorio GitHub compartido |
| Kimi-K3 | no disponible | no disponible | Usado como referencia frontier; sin cifras por benchmark en la información | no disponible | no disponible |
| GLM-5.3 | no disponible | no disponible | Usado como referencia frontier; sin cifras por benchmark en la información | no disponible | no disponible |
| GPT-5.6-sol | no disponible | no disponible | Usado como referencia frontier; Sage-A1.5 lo supera en GAIA según el autor | propietaria | no disponible |

No se dispone de datos suficientes para comparar contexto, activos MoE o throughput con alternativas de la misma clase (~35 B); la comparación cuantitativa publicada por el autor se limita a los benchmarks de la sección anterior.

## Limitaciones y advertencias

- Todos los resultados de benchmarks son auto-reportados por el autor; no se han verificado de forma independiente en la información disponible.
- No se publica la longitud de contexto soportada, lo que impide planificar despliegues con requisitos de contexto largo y dimensionar la caché KV.
- No se declaran los idiomas soportados. Los benchmarks citados son mayoritariamente en inglés; el rendimiento en castellano no está documentado y debería validarse empíricamente antes de usarlo en producción.
- No se documentan sesgos, evaluación de seguridad ni procesos de red-teaming. Un modelo orientado a agentes con tool calling puede ejecutar acciones con efectos reales; requiere sandboxing y permisos mínimos.
- Riesgo de alucinación inherente a la generación de lenguaje; el modo de verificación es una autoevaluación interna, no una garantía de corrección factual.
- El "modo de verificación" es opcional y su comportamiento no está especificado en la información disponible (cómo se activa, coste en tokens, tasa de revisiones útiles).
- Ausencia de cuantizaciones oficiales publicadas (GGUF, AWQ, GPTQ), lo que limita el despliegue en hardware de consumo.
- Licencia Apache 2.0: permite uso comercial y modificación, con obligación de conservar avisos de copyright y licencia y de indicar cambios; no incluye garantías ni cláusulas de responsabilidad por uso.
- Modelo muy reciente (publicado en octubre de 2026) y con tracción comunitaria baja en el momento de la consulta (58 descargas, 123 likes), por lo que escasean las validaciones de terceros y los informes de fallos en producción.
- El tamaño del repositorio (71,9 GB) y la naturaleza MoE implican requisitos de VRAM agregada altos incluso cuando el coste por token sea bajo.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/InternScience/Sage-A1.5)
- [Página oficial del proyecto](https://alpha-innovator.github.io/Sage-A1.5/)
- [Informe técnico (arXiv 2610.28578)](https://arxiv.org/abs/2610.28578)
- [Repositorio GitHub (InternScience/Agents-A1)](https://github.com/InternScience/Agents-A1)
- [ModelScope](https://modelscope.cn/models/InternScience/Sage-A1.5)
- [Prueba gratuita (Intern AI Discovery)](https://discovery.intern-ai.org.cn/token-plan/home?tabIndex=0&lang=en-US)
