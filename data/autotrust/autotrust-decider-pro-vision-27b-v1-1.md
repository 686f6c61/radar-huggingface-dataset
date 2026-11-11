# autotrust/AutoTrust-Decider-Pro-Vision-27B-v1.1

## Resumen

AutoTrust-Decider-Pro-Vision-27B-v1.1 (identificado en su model card como AutoTrust-JEV-27B v1.1) es un modelo de decisión textual desarrollado por el usuario autotrust. Su función no es la generación libre de texto, sino la asignación de probabilidades a un conjunto de opciones de respuesta proporcionadas junto a cada pregunta, es decir, un clasificador estructurado de decisiones. Se distribuye bajo licencia Apache 2.0 con pesos en safetensors y está pensado para servirse con vLLM.

El modelo cuenta con 27.356.728.560 parámetros (aproximadamente 27,4 mil millones) y un repositorio de 54,7 GB. La model card reporta un índice público de 67,31 en la suite Decision Index 0.3, calculado sobre 37 benchmarks indexados y 140.178 peticiones puntuables completadas en una evaluación local con el kit oficial, pendiente de verificación por los mantenedores. Sus áreas más fuertes son selección de herramientas, clasificación de intenciones y decisiones de automatización cotidiana.

Resulta relevante ahora porque propone un enfoque de evaluación centrado en decisiones verificables (clasificación de intención, selección de herramientas, verificación de afirmaciones) en lugar de generación abierta, y porque publica resultados desglosados frente a dos referencias (JEV-27B y Jev 1.14). La model card advierte explícitamente de que las puntuaciones corresponden a adaptaciones de tareas del Decision Index y no constituyen una garantía de fiabilidad en el mundo real.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (tag de familia `qwen3_5`; sin detalle de arquitectura en la información proporcionada) |
| Parámetros totales | 27.356.728.560 (≈27,4 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura interna más allá del tag de familia `qwen3_5` y la etiqueta de pipeline `text-classification`. No se especifican el tipo de transformer, la composición del dataset de entrenamiento, el número de tokens vistos ni si hubo fases de RLHF, DPO u otro ajuste por preferencias. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal.

Lo que sí documenta la model card es el protocolo de evaluación: una evaluación local completa con el kit oficial del Decision Index 0.3, sobre un corpus público fijado (pinned) compartido con los modelos de referencia, con 140.178 peticiones puntuables completadas. El índice público (67,31) se distingue explícitamente del índice bruto (75,62), y la puntuación de habilidad (skill score) se ajusta por el nivel de azar de cada tarea, de modo que 0 equivale a rendimiento aleatorio y 100 a rendimiento perfecto.

## Capacidades

- Clasificación de intenciones, incluida la detección de consultas fuera de alcance (out-of-scope), con 97,08 en CLINC150+OOS.
- Selección de herramientas y funciones para llamadas a API, con 97,23 en BFCL y 87,60 en API-Bank.
- Decisiones de uso de API y de cuándo invocar una herramienta (When2Call MCQ: 89,54).
- Verificación de afirmaciones y inferencia textual (HoVer: 89,12; NLI4CT: 87,44; ContractNLI: 82,58).
- Razonamiento de sentido común y conocimiento (WinoGrande: 95,26; HellaSwag: 98,22; MMLU-Pro: 73,65).
- Razonamiento matemático y simbólico en formato de opción fija (GSM8K: 84,99 en una configuración no comparable; CLadder: 81,02).
- Detección de alucinaciones a nivel de respuesta en contextos RAG (RAGTruth: 83,79).
- Decisiones de automatización doméstica (simulador de electrodomésticos: 89,77).
- Tareas de gusto humano y emparejamiento semántico fino (BPoMP: 96,52; emparejamiento de titulares de The New Yorker: 82,95).
- No se documentan en la información disponible capacidades multimodales, de audio, de agente multi-paso autónomo ni modo de razonamiento explícito (thinking mode), pese a la etiqueta "Vision" del identificador del repositorio.

## Casos de uso

- Enrutamiento de intenciones en asistentes conversacionales: el modelo asigna probabilidades a las intenciones candidatas de cada turno y detecta consultas fuera de alcance (97,08 en CLINC150+OOS), lo que permite derivar a un humano o a un flujo alternativo cuando la confianza es baja.
- Selección de herramientas en pipelines de agentes: dado un catálogo de funciones y una petición del usuario, el modelo puntúa qué herramienta corresponde (97,23 en BFCL), lo que lo hace adecuado como capa de decisión previa a la ejecución de llamadas.
- Clasificación de tickets bancarios y de soporte: con 93,71 en BANKING77, puede etiquetar reclamaciones y solicitudes en categorías operativas para su encaminamiento automático.
- Verificación de afirmaciones en sistemas RAG: el modelo evalúa si una respuesta está respaldada por el contexto recuperado (83,79 en RAGTruth; 89,12 en HoVer), lo que sirve como filtro de alucinaciones antes de mostrar la respuesta al usuario.
- Automatización del hogar: interpreta órdenes y decide la acción sobre el dispositivo correspondiente (89,77 en el simulador de electrodomésticos), integrable en asistentes de domótica.
- Revisión de contratos y documentos clínicos: la inferencia textual sobre ContractNLI (82,58) y NLI4CT (87,44) permite comprobar implicaciones y contradicciones entre cláusulas o entre informe y pregunta clínica.
- Moderación y análisis de discurso: la detección de sarcasmo (iSarcasmEval: 65,87) y de opiniones implícitas (ACOS: 56,39) puede emplearse en análisis de sentimiento matizado, con cautela por las puntuaciones moderadas.

## Benchmarks y rendimiento

Resultados reportados por el autor en la model card, sobre adaptaciones de tareas del Decision Index 0.3. Cada celda es la puntuación de la tarea multiplicada por 100 (exactitud, F1 o nDCG según la tarea). El índice público es de 67,31 y el índice bruto de 75,62.

| Benchmark | Este modelo | JEV-27B | Jev 1.14 |
|---|---:|---:|---:|
| WinoGrande | 95,26 | 82,56 | 91,08 |
| HellaSwag | 98,22 | 92,49 | 94,34 |
| MMLU-Pro | 73,65 | 61,53 | 82,13 |
| GPQA Diamond | 54,59 | 44,90 | 75,51 |
| HLE | 16,57 | 6,99 | 19,36 |
| CLadder | 81,02 | 70,50 | 88,58 |
| CRUXEval | 85,44 | 73,68 | 74,74 |
| BBH (tareas de opción fija) | 86,05 | 78,94 | 93,19 |
| GSM8K (pistas distintas, no comparable) | 84,99 | - | - |
| CLINC150+OOS | 97,08 | 84,62 | 90,28 |
| BANKING77 | 93,71 | 74,20 | 79,94 |
| BFCL | 97,23 | 95,99 | 96,40 |
| API-Bank | 87,60 | 82,87 | 86,61 |
| When2Call MCQ | 89,54 | 78,53 | 81,65 |
| ToolRet | 68,71 | 65,73 | 65,05 |
| HoVer | 89,12 | 73,90 | 76,75 |
| NLI4CT | 87,44 | 84,27 | 85,12 |
| ContractNLI | 82,58 | 75,04 | 70,76 |
| RAGTruth | 83,79 | 80,88 | 75,12 |
| BRIGHT | 49,19 | 48,44 | 47,05 |
| Amazon ESCI | 52,11 | 54,56 | 57,18 |
| PhishNChips | 72,00 | 61,90 | 83,75 |

Puntuaciones por área del Decision Index: Tools & Automation 85,19 (5 benchmarks), Language Understanding 73,38 (9), Retrieval & Classification 66,97 (6), Knowledge & Reasoning 55,16 (11) y Arts & Human Taste 51,08 (6). Las columnas de JEV-27B y Jev 1.14 proceden de resultados publicados por sus laboratorios, no de ejecuciones propias del autor de esta ficha.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia de orden de magnitud, 27,4 B de parámetros en bf16 requieren aproximadamente 55 GB de pesos, coherente con el tamaño del repositorio (54,7 GB); en cuantización de 8 bits rondaría 27-28 GB y en 4 bits unos 14-15 GB, sin contar caché KV ni overhead.
- GPU recomendadas: no disponibles. Por tamaño, la inferencia en bf16 exige GPUs de 80 GB (A100, H100) o reparto multi-GPU; una RTX 4090 de 24 GB solo sería viable con cuantización agresiva.
- Despliegue: el autor declara la librería vLLM como vía de servicio. No se documentan soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Índice público | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AutoTrust-Decider-Pro-Vision-27B-v1.1 | ≈27,4 B | no disponible | 67,31 | Apache 2.0 | Hugging Face (safetensors, vLLM) |
| JEV-27B | no disponible | no disponible | no disponible (solo resultados por benchmark) | no disponible | no disponible |
| Jev 1.14 | no disponible | no disponible | no disponible (solo resultados por benchmark) | no disponible | no disponible |

Las dos referencias se incluyen porque la model card las usa como comparación directa en 37 benchmarks, pero no se dispone de sus especificaciones técnicas ni de su índice público agregado. No se han identificado en la información proporcionada otros modelos de decisión estructurada comparables.

## Limitaciones y advertencias

- Las puntuaciones son autoevaluadas con el kit oficial y están pendientes de verificación por los mantenedores del índice; no debe tratarse el 67,31 como un resultado auditado de forma independiente.
- Las cifras corresponden a adaptaciones de tareas del Decision Index, no a rendimiento en producción; la propia model card lo advierte.
- El modelo es un clasificador de opciones: no genera texto libre ni se documenta como modelo conversacional general.
- Debilidad relativa en conocimiento y razonamiento profundo: HLE 16,57, GPQA Diamond 54,59 y SATA-Bench 37,88, por debajo de Jev 1.14 en varios de estos benchmarks.
- Rendimiento moderado en recuperación semántica (BRIGHT 49,19) y en emparejamiento de productos (Amazon ESCI 52,11, por debajo de las dos referencias).
- No se documentan sesgos conocidos, idiomas soportados ni comportamiento multilingüe; la ausencia de esta información impide garantizar un uso fuera del inglés.
- No se especifican la longitud de contexto ni los requisitos de memoria, lo que dificulta planificar el despliegue.
- Riesgo de alucinación: aunque el modelo puntúa alto en detección de alucinaciones en RAG (83,79), sigue siendo un clasificador probabilístico y puede asignar alta confianza a opciones incorrectas en dominios fuera de su distribución de entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero al no documentarse la procedencia de los datos de entrenamiento no puede descartarse la presencia de material con restricciones.
- El identificador del repositorio incluye "Vision", pero no se documenta ninguna capacidad multimodal; no debe asumirse soporte de imágenes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/autotrust/AutoTrust-Decider-Pro-Vision-27B-v1.1
- Datos de benchmarks del Decision Index (pinned): https://huggingface.co/spaces/multimodalart/jev-decision-index/blob/0ddf6758073eb77ae449a3541f57286d7f39d93f/data/index.json
- Metodología de evaluación (pinned): https://huggingface.co/spaces/multimodalart/jev-decision-index/blob/0ddf
