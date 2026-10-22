# seanmiranda/Sage-A1.5

## Resumen

Sage-A1.5 es un modelo de lenguaje de tipo mezcla de expertos (MoE) con aproximadamente 35.950 millones de parámetros totales, presentado por Shanghai AI Laboratory (el repositorio de referencia en la model card es `InternScience/Sage-A1.5`, mientras que la copia indexada aquí aparece bajo la cuenta `seanmiranda`). Está diseñado específicamente para tareas agénticas de horizonte largo: orquestación de subagentes, verificación interna del propio razonamiento y descubrimiento científico abierto. Según la model card, es la evolución de Agents-A1 y añade capacidad de delegar trabajo en subagentes con contextos aislados, revisar evidencias y revisar su estrategia a mitad de trayectoria.

El modelo se distribuye en formato Hugging Face Transformers (safetensors) y declara compatibilidad con vLLM y SGLang, además de soportar entradas de imagen y texto (etiquetas `image-text-to-text`, `vlm`, `vision`). La configuración usa el tipo de modelo `qwen3_5_moe`, es decir, una arquitectura transformer con mezcla de expertos compatible con la familia Qwen 3.5. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales conocidas.

Su relevancia actual radica en que compite, según los datos del autor, con sistemas de escala frontera (Kimi-K3, GLM-5.3, GPT-5.6-sol) en tareas de búsqueda profunda, ingeniería de software y razonamiento científico, manteniéndose en la clase de ~35B. No obstante, el repositorio no tiene descargas ni valoraciones y no se han publicado datos de longitud de contexto, idiomas ni cuantizaciones, por lo que la evaluación independiente está pendiente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE); tipo de modelo en config: `qwen3_5_moe` |
| Parametros totales | 35.951.822.704 (~35,95 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos safetensors; no se listan GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (Transformers); compatible con vLLM y SGLang según la model card |
| Modalidades | Texto e imagen (pipeline `image-text-to-text`) |
| Tamaño del repositorio | 71,9 GB |
| Fecha de publicación | 2026-10-21 |

## Arquitectura y entrenamiento

La información disponible confirma una arquitectura de mezcla de expertos con 35,95B de parámetros totales y pesos en bf16 (71,9 GB de repositorio, coherente con 2 bytes por parámetro). La model card no detalla el número de expertos, el número de expertos activos por token, la dimensión oculta ni el mecanismo de enrutamiento, por lo que no es posible calcular los parámetros activos ni el coste real por token. La etiqueta de configuración `qwen3_5_moe` indica compatibilidad con la implementación de Transformers de la familia Qwen 3.5 MoE. El modelo acepta imágenes además de texto, lo que implica un codificador visual del que no se publican especificaciones.

Tampoco se documentan el volumen de tokens de entrenamiento, la composición del corpus, ni si hubo fases de RLHF, DPO o aprendizaje por refuerzo con verificadores. Lo que sí describe el autor es un entrenamiento orientado a comportamiento agéntico: orquestación de subagentes con contextos independientes, un "modo de verificación" que opera dentro de la propia cadena de pensamiento (el modelo se detiene a revisar qué ha establecido y qué ha fallado, y actúa sobre una dirección revisada en el mismo turno, sin crítico externo) y soporte nativo de llamadas a funciones. Estas capacidades se presentan como resultado del post-entrenamiento, sin que se aporten detalles del pipeline.

## Capacidades

- Generación de texto y razonamiento de múltiples pasos, con descomposición explícita de tareas en subpasos ejecutables.
- Razonamiento agéntico de horizonte largo: planificación previa y adaptación de la estrategia según resultados intermedios.
- Orquestación multiagente: delegación de tareas y colaboración en paralelo entre subagentes con contextos aislados, lo que reduce la interferencia entre investigaciones concurrentes.
- Modo de verificación (opt-in): autoevaluación del progreso, validación de evidencias y revisión reflexiva de la estrategia dentro de la cadena de pensamiento.
- Uso de herramientas y function calling nativo: APIs, intérpretes de código, motores de búsqueda y otros servicios externos.
- Comprensión de documentos e imágenes: la model card reporta 91,5 en OmniDocBench, lo que apunta a parsing y comprensión de documentos.
- Razonamiento científico con herramientas y respuesta a preguntas de conocimiento profesional (química, matemáticas, investigación).
- Seguimiento de instrucciones con múltiples restricciones (81,6 en IFBench según el autor).
- Capacidades multilingües: la model card reporta resultados en SWE-bench Multilingual, pero no se declara la lista de idiomas soportados.
- No se documenta soporte de audio ni modo "thinking" con nombre propio más allá del modo de verificación descrito.

## Casos de uso

- Investigación científica asistida: el modelo puede ejecutar ciclos de búsqueda bibliográfica, análisis interactivo de datos y generación de artefactos de investigación inspeccionables, conectando preguntas abiertas con evidencia verificable. Es adecuado por su modo de verificación y su capacidad de abandonar rutas de búsqueda improductivas.
- Agente de ingeniería de software sobre repositorios: con 61,2 en SWE-bench Pro reportado, puede integrarse en un pipeline que lea el repositorio, proponga parches y los valide ejecutando tests mediante tool calling, dentro de un flujo de CI/CD con revisión humana.
- Búsqueda profunda (deep research) automatizada: orquestación de varios subagentes que cubren fuentes distintas en paralelo y sintetizan hallazgos, adecuada para informes de mercado o revisiones técnicas donde se requiere cobertura amplia y trazabilidad de evidencias.
- Procesamiento de documentación técnica y científica: extracción estructurada de tablas, figuras y texto de PDFs gracias a la entrada multimodal, útil para construir bases de conocimiento internas o pipelines de ingestión documental.
- Automatización de flujos profesionales con instrucciones complejas: tareas con múltiples restricciones simultáneas (formato, tono, fuentes obligatorias, límites de longitud) donde el seguimiento estricto de instrucciones es crítico.
- Resolución de problemas de machine learning aplicado: con 65,2 en MLE-Lite reportado, puede asistir en el diseño de experimentos, escritura de código de entrenamiento y diagnóstico de fallos en notebooks.
- Razonamiento químico y de ciencias experimentales: apoyo a la planificación de síntesis o análisis de resultados experimentales con herramientas de cálculo integradas.
- Migración y mantenimiento de código multilingüe: su rendimiento reportado en SWE-bench Multilingual lo hace utilizable en bases de código con varios lenguajes, siempre con validación mediante tests.

## Benchmarks y rendimiento

Resultados reportados por el autor en la model card. No han sido verificados de forma independiente en la información disponible.

| Benchmark | Sage-A1.5 | Referencia indicada por el autor |
|---|---|---|
| XBench-DS-2510 | 92,0 | SOTA general según el autor |
| IFBench | 81,6 | SOTA general según el autor |
| PinchBench | 90,0 | SOTA general según el autor |
| FrontierScience-Olympiad | 81,0 | SOTA general según el autor |
| FrontierScience-Research | 48,3 | SOTA general según el autor |
| CMT | 80,0 | SOTA general según el autor |
| OmniDocBench | 91,5 | SOTA general según el autor |
| GAIA | 95,1 | Superior a todos los modelos mayores comparados |
| BrowseComp | 81,7 | Primero en la clase ~35B |
| SWE-bench Pro | 61,2 | Primero en la clase ~35B |
| MLE-Lite | 65,2 | Primero en la clase ~35B |
| SciCode | 44,3 | Empate con Agents-A1 |
| AA-LCR | 81,0 | Primero en la clase ~35B |
| HLE con herramientas | 55,1 | Primero en la clase ~35B |
| VitaBench | 45,4 | Primero en la clase ~35B |
| ChemCOTBench | 66,5 | Primero en la clase ~35B |

Mejoras declaradas frente a Agents-A1: SWE-bench Pro +17,6; SWE-bench Multilingual +14,0; PinchBench +13,1; MLE-Lite +21,3. No se aportan los valores absolutos del modelo base ni los resultados numéricos de los competidores (Kimi-K3, GLM-5.3, GPT-5.6-sol), solo afirmaciones cualitativas de superioridad.

## Requisitos de hardware

- VRAM para inferencia en bf16: aproximadamente 72 GB solo para pesos (35,95B × 2 bytes), más caché KV y activaciones; en la práctica se necesitan 80 GB o más por instancia.
- VRAM en FP8: alrededor de 36 GB para pesos, lo que encaja en una A100 80 GB, H100 80 GB o L40S 48 GB con margen para caché KV.
- VRAM en cuantización de 4 bits: aproximadamente 18-20 GB para pesos, lo que permitiría ejecución en una RTX 4090 (24 GB) o RTX 3090, siempre que exista una build compatible (no se publican GGUF ni AWQ en el repositorio).
- GPU recomendadas: H100 80 GB o A100 80 GB para bf16 con concurrencia; L40S o A6000 para FP8 con lotes pequeños.
- Consumer GPU: solo viable con cuantización agresiva (4 bits) y ventana de contexto reducida; el número de parámetros activos es desconocido, por lo que no se puede estimar la velocidad real en este escenario.
- Despliegue: Transformers, vLLM y SGLang están declarados como compatibles en la model card. No se confirma soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. Al desconocerse los parámetros activos por token, no es posible estimar tokens por segundo de forma fiable.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Rendimiento | Disponibilidad |
|---|---|---|---|---|---|
| Sage-A1.5 | 35,95B totales (activos no disponibles) | no disponible | Apache 2.0 | GAIA 95,1; SWE-bench Pro 61,2; BrowseComp 81,7 (autorreportados) | Pesos en HF y ModelScope |
| Agents-A1 (predecesor) | no disponible | no disponible | no disponible | Inferior según el autor: SWE-bench Pro -17,6, MLE-Lite -21,3, SWE-bench Multilingual -14,0 | Referenciado en la model card |
| Kimi-K3 | no disponible (escala frontera según el autor) | no disponible | no disponible | Comparado cualitativamente; sin cifras en la información disponible | no disponible |
| GLM-5.3 | no disponible (escala frontera según el autor) | no disponible | no disponible | Comparado cualitativamente; sin cifras en la información disponible | no disponible |

No se dispone de datos verificables de parámetros, contexto ni licencia de los modelos comparados en la información proporcionada; la comparativa refleja únicamente las afirmaciones de la model card.

## Limitaciones y advertencias

- Todos los resultados de benchmarks son autorreportados y no han sido verificados de forma independiente; además, los modelos de referencia citados (Kimi-K3, GLM-5.3, GPT-5.6-sol) no aparecen con cifras numéricas en la información disponible.
- El repositorio indexado pertenece a la cuenta `seanmiranda`, mientras que la model card apunta como repositorio oficial a `InternScience/Sage-A1.5`. Conviene verificar el origen y la integridad de los pesos antes de usarlos en producción.
- El repositorio registra 0 descargas y 0 valoraciones en el momento de la consulta, por lo que no existe validación comunitaria.
- No se publica la longitud de contexto, un dato crítico para planificar orquestación de subagentes y despliegues con caché KV.
- No se declara la lista de idiomas soportados; el rendimiento en castellano es desconocido y debe evaluarse empíricamente.
- No se ofrecen cuantizaciones listas para usar ni pesos GGUF, lo que limita el despliegue en hardware de consumo.
- No se documentan los datos de entrenamiento, los parámetros activos ni el proceso de alineación, lo que dificulta evaluar sesgos y riesgos.
- Riesgo de alucinación inherente a modelos generativos, especialmente en modo de descubrimiento científico abierto, donde el modelo puede producir hipótesis o referencias plausibles pero incorrectas. El modo de verificación es una autoevaluación interna, no una garantía de corrección.
- El uso agéntico con ejecución de código y llamadas a APIs introduce riesgos operativos (acciones destructivas, fugas de datos, costes de API); requiere sandboxing, límites de permisos y supervisión humana.
- Licencia Apache 2.0: permite uso comercial y modificaciones con obligaciones mínimas (conservar avisos de licencia), sin garantía por parte de los autores.
- No se dispone de información sobre tasas de error, comportamiento fuera de distribución ni estabilidad en conversaciones multi-turno largas.

## Enlaces

- Hugging Face (repositorio indexado): https://huggingface.co/seanmiranda/Sage-A1.5
- Hugging Face (repositorio de referencia en la model card): https://huggingface.co/InternScience/Sage-A1.5
- Página del proyecto: https://alpha-innovator.github.io/Sage-A1.5/
- Informe técnico (arXiv): https://arxiv.org/abs/2610.28578
- Repositorio GitHub: https://github.com/InternScience/Agents-A1
- ModelScope: https://modelscope.cn/models/InternScience/Sage-A1.5
- Prueba gratuita (Intern-AI): https://discovery.intern-ai.org.cn/token-plan/home?tabIndex=0&lang=en-US

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo (los resultados obtenidos correspondían a emisiones de radio de la BBC), por lo que no se han podido añadir enlaces adicionales de terceros, papers independientes ni análisis externos.
