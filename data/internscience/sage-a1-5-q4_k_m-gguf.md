# InternScience/Sage-A1.5-Q4_K_M-GGUF

## Resumen

Sage-A1.5 es un modelo de lenguaje de tipo mezcla de expertos (MoE) con 35.505.251.456 parámetros totales (aproximadamente 35,5B), desarrollado por Shanghai AI Laboratory y distribuido en HuggingFace bajo el identificador InternScience/Sage-A1.5. Está diseñado específicamente para tareas agénticas de largo horizonte y para la resolución de problemas científicos, construido sobre su predecesor Agents-A1. El repositorio analizado (InternScience/Sage-A1.5-Q4_K_M-GGUF) contiene una cuantización GGUF Q4_K_M de 22,6 GB, pensada para su despliegue en llama.cpp, Ollama, LM Studio y otros runtimes compatibles con GGUF.

La propuesta del modelo se articula en tres capacidades: orquestación agéntica (delegación de tareas y colaboración en paralelo entre subagentes con contextos aislados), verificación agéntica (comprobación de progreso, validación de evidencias y revisión reflexiva de la estrategia dentro de la propia cadena de pensamiento) y descubrimiento científico abierto (investigación exploratoria con artefactos de investigación inspeccionables). Según la model card, el modelo compite con sistemas de escala frontera como Kimi-K3, GLM-5.3 y GPT-5.6-sol pese a su clase de ~35B, y declara resultados SOTA en XBench-DS-2510, IFBench, PinchBench, FrontierScience-Olympiad, FrontierScience-Research, CMT y OmniDocBench.

El interés actual del modelo reside en la combinación de tres factores: un tamaño de ~35B que lo hace desplegable en infraestructura moderada, una licencia Apache 2.0 sin restricciones conocidas para uso comercial y un enfoque explícito en flujos agénticos verificables (tool calling, subagentes, modo de verificación) en lugar de centrarse únicamente en generación de texto. La información disponible no detalla la longitud de contexto, los parámetros activos ni los idiomas soportados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE); las etiquetas del repositorio incluyen `moe`, `vlm` y `vision`. No se detalla la arquitectura interna en la información disponible |
| Parámetros totales | 35.505.251.456 (~35,5B) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q4_K_M (GGUF) en este repositorio; no se documentan otras cuantizaciones en la información disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q4_K_M); los pesos originales en safetensors están en el repositorio base |
| Modelo base | InternScience/Sage-A1.5 |
| Tamaño del repositorio | 22,6 GB |
| Pipeline declarado | text-generation |
| Etiquetas | gguf, moe, vlm, vision, agentic, code, tool-use, conversational, endpoints_compatible |
| Paper | arXiv:2610.28578 |
| Descargas / likes | 10 / 24 |
| Fecha de creación | 2026-10-21 |

## Arquitectura y entrenamiento

Sage-A1.5 es un modelo de mezcla de expertos (MoE) de 35,5B parámetros totales, sucesor de Agents-A1 y desarrollado por Shanghai AI Laboratory. La model card no detalla el número de expertos, la ratio de activación, el número de tokens de entrenamiento ni la composición del dataset, por lo que estos datos deben considerarse no disponibles. Las etiquetas del repositorio indican compatibilidad con visión (`vlm`, `vision`), aunque la documentación proporcionada no describe el codificador visual ni la resolución de entrada.

La innovación técnica declarada se centra en el comportamiento agéntico más que en la arquitectura: orquestación de subagentes con contextos aislados y ejecución en paralelo, un modo de verificación opcional integrado en la propia cadena de pensamiento (el modelo se detiene a revisar lo que ha establecido y lo que ha fallado, y actúa sobre la dirección revisada en el mismo turno, sin crítico externo) y soporte nativo de function calling para interactuar con APIs, intérpretes de código y motores de búsqueda. No se especifica si el entrenamiento incluyó RLHF, DPO u otras etapas de alineamiento.

## Capacidades

- Razonamiento agéntico: descomposición de tareas complejas en subpasos ejecutables, planificación previa y adaptación de la estrategia según resultados intermedios.
- Uso de herramientas: soporte nativo de function calling e integración con APIs, intérpretes de código, buscadores y otros servicios externos.
- Orquestación multiagente: coordinación de investigaciones paralelas entre subagentes con contextos independientes, con síntesis posterior de hallazgos.
- Modo de verificación: autorrevisión dentro de la cadena de pensamiento para detectar caminos de búsqueda improductivos y corregir el rumbo sin intervención externa.
- Razonamiento científico y profesional: resolución de problemas con herramientas integradas y respuesta a preguntas de conocimiento especializado.
- Seguimiento de instrucciones: cumplimiento de instrucciones detalladas con múltiples restricciones en dominios diversos.
- Generación de código e ingeniería de software: evaluación en SWE-bench Pro y SciCode según la model card.
- Procesamiento de documentos: evaluación en OmniDocBench, lo que sugiere capacidad de comprensión de documentos; las etiquetas `vlm` y `vision` apuntan a entrada multimodal, aunque no se detalla en la información disponible.
- Capacidades multilingües: no disponible.

## Casos de uso

- Investigación científica asistida: el modelo puede ejecutar búsquedas de largo horizonte, validar evidencias y generar artefactos de investigación inspeccionables, apoyándose en sus resultados declarados en BrowseComp (81,7) y GAIA (95,1) para tareas de recuperación y razonamiento con herramientas.
- Ingeniería de software en producción: con SWE-bench Pro de 61,2 y soporte de tool calling, puede integrarse en pipelines de CI/CD para localizar y corregir defectos en repositorios, ejecutar tests y proponer parches.
- Orquestación de estudios paralelos: la capacidad de lanzar subagentes con contextos aislados permite dividir una investigación en frentes independientes (por ejemplo, revisión de literatura, análisis de datos y validación experimental) y sintetizar los resultados en un informe único.
- Flujos de alta fiabilidad con verificación: el modo de verificación integrado resulta adecuado para tareas donde un error es costoso (auditoría de cálculos, revisión de cumplimiento normativo), ya que el modelo revisa su propio progreso antes de continuar.
- Análisis de documentación técnica y científica: con OmniDocBench de 91,5, es adecuado para extraer y estructurar información de artículos, informes y patentes, siempre que se valide la parte visual con pruebas propias.
- Asistentes sujetos a instrucciones complejas: IFBench de 81,6 respalda su uso en tareas con múltiples restricciones simultáneas, como generación de informes con formato estricto o extracción de datos con reglas de negocio.
- Despliegue local o en infraestructura propia: la licencia Apache 2.0 y la cuantización GGUF Q4_K_M permiten ejecutar el modelo en entornos on-premise sin dependencia de APIs externas, útil en sectores con requisitos de soberanía del dato.
- Tutoría y resolución de problemas de nivel competición: FrontierScience-Olympiad de 81,0 lo sitúa como candidato para entornos educativos avanzados que requieran razonamiento científico paso a paso.

## Benchmarks y rendimiento

Resultados declarados en la model card. No se dispone de los valores numéricos de los modelos comparados, por lo que no es posible construir una tabla comparativa con cifras verificables.

| Benchmark | Sage-A1.5 | Posición declarada |
|---|---|---|
| XBench-DS-2510 | 92,0 | SOTA global |
| IFBench | 81,6 | SOTA global |
| PinchBench | 90,0 | SOTA global |
| FrontierScience-Olympiad | 81,0 | SOTA global |
| FrontierScience-Research | 48,3 | SOTA global |
| CMT | 80,0 | SOTA global |
| OmniDocBench | 91,5 | SOTA global |
| GAIA | 95,1 | Superior a todos los modelos de mayor escala comparados |
| BrowseComp | 81,7 | Primero entre modelos de ~35B |
| SWE-bench Pro | 61,2 | Primero entre modelos de ~35B |
| MLE-Lite | 65,2 | Primero entre modelos de ~35B |
| SciCode | 44,3 | Primero entre modelos de ~35B (empate con Agents-A1) |
| AA-LCR | 81,0 | Primero entre modelos de ~35B |
| HLE con herramientas | 55,1 | Primero entre modelos de ~35B |
| VitaBench | 45,4 | Primero entre modelos de ~35B |
| ChemCOTBench | 66,5 | Primero entre modelos de ~35B |

Respecto a Agents-A1, la model card indica una mejora de +17 puntos en SWE-bench Pro (cifra truncada en el texto disponible). Los modelos de referencia citados son Kimi-K3, GLM-5.3 y GPT-5.6-sol, sin que se aporten sus resultados en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio Q4_K_M ocupa 22,6 GB, por lo que los pesos requieren en torno a 23 GB. Sumando caché KV y overhead del runtime, una estimación razonable es de 26-32 GB de VRAM, dependiendo de la longitud de contexto efectiva (dato no disponible).
- GPU recomendadas: A100 40 GB u 80 GB, H100, RTX A6000 48 GB o L40S 48 GB para ejecución íntegra en GPU. Una única RTX 4090 o RTX 3090 de 24 GB no cubre los pesos más la caché KV con holgura, por lo que requeriría descarga parcial de capas a CPU o configuraciones de dos GPU.
- Cabe en GPU de consumo: sí en GPUs de 32 GB o más (por ejemplo, RTX 5090 de 32 GB, si el runtime lo soporta); en 24 GB solo con offload parcial a memoria del sistema y penalización de latencia.
- Opciones de despliegue: llama.cpp, Ollama y LM Studio para la versión GGUF; el repositorio base en safetensors es compatible con Transformers, vLLM y SGLang según la model card, y las etiquetas incluyen `endpoints_compatible`.
- Latencia y throughput: no disponible. Al ser un modelo MoE, el rendimiento dependerá del número de parámetros activos, que no se publica en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Sage-A1.5 | 35,5B totales (activos no disponibles) | no disponible | Apache 2.0 | HuggingFace, ModelScope, GGUF | SOTA declarado en 7 benchmarks; primero entre ~35B en otros 8 |
| Agents-A1 | ~35B (misma clase según la model card) | no disponible | no disponible | HuggingFace, GitHub | Predecesor directo; Sage-A1.5 mejora +17 puntos en SWE-bench Pro y empata en SciCode (44,3) |
| Kimi-K3 | no disponible | no disponible | no disponible | no disponible | Citado como sistema de escala frontera; Sage-A1.5 declara superarlo en GAIA |
| GLM-5.3 | no disponible | no disponible | no disponible | no disponible | Citado como sistema de escala frontera en la comparativa del autor |
| GPT-5.6-sol | no disponible | no disponible | no disponible | no disponible | Citado como sistema de escala frontera; propietario |

No se dispone de datos de parámetros, contexto ni licencia de los modelos frontera citados, por lo que la comparación solo puede establecerse en términos de los benchmarks declarados por el autor.

## Limitaciones y advertencias

- Datos incompletos: la model card no especifica longitud de contexto, parámetros activos, idiomas soportados, composición del dataset ni proceso de alineamiento, lo que dificulta dimensionar el modelo para producción.
- Benchmarks autodeclarados: todos los resultados proceden del autor y no se aportan cifras de los modelos comparados ni detalles de la metodología de evaluación; conviene reproducirlos antes de tomar decisiones.
- Idiomas no documentados: se desconoce el grado de cobertura del castellano y de otras lenguas; es necesario evaluar el rendimiento en el idioma objetivo antes de desplegar.
- Riesgo de alucinación: no se documentan tasas de alucinación ni mecanismos de mitigación más allá del modo de verificación, que es opcional y no equivale a una garantía de veracidad.
- Capacidad multimodal poco documentada: aunque las etiquetas incluyen `vlm` y `vision`, no se describe el soporte visual real en la información disponible; el resultado de OmniDocBench es el único indicio.
- Licencia: Apache 2.0 permite uso comercial y modificación, pero conviene revisar los términos del modelo base y de los datasets de entrenamiento (no disponibles) por posibles obligaciones adicionales.
- Madurez del repositorio: 10 descargas y 24 likes en el momento de la consulta indican una validación comunitaria muy limitada.
- Cuantización Q4_K_M: la pérdida de precisión respecto a los pesos originales puede afectar a tareas sensibles al razonamiento fino; para uso crítico se recomienda evaluar los pesos en safetensors.
- Uso de subagentes: la orquestación paralela multiplica el consumo de tokens y la complejidad de depuración; requiere instrumentación propia para auditar las trayectorias.

## Enlaces

- Repositorio GGUF Q4_K_M: https://huggingface.co/InternScience/Sage-A1.5-Q4_K_M-GGUF
- Repositorio del modelo base: https://huggingface.co/InternScience/Sage-A1.5
- Página del proyecto: https://alpha-innovator.github.io/Sage-A1.5/
- Informe técnico (arXiv): https://arxiv.org/abs/2610.28578
- Repositorio GitHub: https://github.com/InternScience/Agents-A1
- ModelScope: https://modelscope.cn/models/InternScience/Sage-A1.5
- Prueba gratuita: https://discovery.intern-ai.org.cn/token-plan/home?tabIndex=0&lang=en-US
- llama.cpp: https://github.com/ggml-org/llama.cpp
