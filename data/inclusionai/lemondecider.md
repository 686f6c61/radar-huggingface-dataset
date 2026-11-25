# inclusionAI/LemonDecider

## Resumen

LemonDecider 4B es un modelo multimodal de decisión desarrollado por inclusionAI y construido sobre el modelo base Qwen/Qwen3.5-4B. A diferencia de un modelo generativo convencional, LemonDecider no produce texto libre: recibe un estado compartido (texto o JSON) y un conjunto de preguntas con nombre, cada una con sus opciones, y devuelve una distribución de probabilidad en cada marcador de decisión. Soporta tres tipos de pregunta: Choice (selección entre opciones con probabilidad por candidato), Noul (probabilidad de que una proposición sí/no sea cierta) y Score (puntuación sobre 2-10 niveles ordenados, devolviendo la probabilidad de cada nivel y el nivel esperado).

El modelo tiene 4.539.918.336 parámetros y un checkpoint con contexto de 262.144 tokens, aunque el límite de servicio es de 8.192 tokens: las peticiones que lo exceden se dividen recursivamente bisecando la lista de preguntas, nunca se truncan. Acepta hasta cuatro imágenes por petición, con un presupuesto de 65.536 a 1.638.400 píxeles por imagen.

Su relevancia radica en el enfoque: en lugar de generar respuestas abiertas, ofrece decisiones tipadas y calibradas con probabilidades explícitas, lo que lo hace adecuado para enrutamiento, clasificación, moderación y verificación donde se necesita una señal cuantificable. Se publica bajo licencia Apache 2.0 con pesos en safetensors y código personalizado (custom_code).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base Qwen3.5-4B), cabecera de decisión tipada con marcadores de lectura; código personalizado |
| Parametros totales | 4.539.918.336 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens en checkpoint; límite de servicio de 8.192 tokens con bisección recursiva de preguntas |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Pipeline | feature-extraction |
| Modelo base | Qwen/Qwen3.5-4B |
| Tamaño del repo | 54,5 GB |
| Descargas / likes | 1.119 / 57 |

## Arquitectura y entrenamiento

LemonDecider se construye sobre Qwen3.5-4B y añade una capa de decisión que codifica cada petición como un prompt conjunto: primero el estado compartido, después cada pregunta con sus opciones, cada una seguida de un marcador de decisión. El modelo emite una distribución de probabilidad en cada marcador, lo que permite leer directamente probabilidades por opción, por nivel o para proposiciones booleanas. El esquema de evaluación empleado se denomina `joint-question-inline-readout-v1` con relectura desactivada, temperatura 0,835655, precisión BF16 y atención SDPA.

No se han publicado en la información disponible detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO. La innovación técnica destacable es el mecanismo de división de peticiones largas: cuando una solicitud supera el límite de 8.192 tokens de servicio, el modelo biseca recursivamente la lista de preguntas en lugar de truncar el contexto, preservando la cobertura completa de las decisiones solicitadas. También destaca el tratamiento multimodal con hasta cuatro imágenes insertadas en orden antes del texto de estado y un presupuesto de píxeles controlado por el procesador.

## Capacidades

- Decisiones tipadas con probabilidad explícita: Choice (probabilidad por opción), Noul (probabilidad de proposición sí/no) y Score (probabilidad por nivel ordenado y nivel esperado).
- Entrada multimodal: texto o JSON como estado compartido más hasta cuatro imágenes por petición.
- Procesamiento de preguntas múltiples en una sola petición conjunta, con distribución de probabilidad independiente en cada marcador.
- Manejo de peticiones largas mediante bisección recursiva de la lista de preguntas, sin truncamiento.
- Evaluado en tareas de tool calling y enrutamiento (BFCL, ToolRet, API-Bank, RouterBench), lo que indica capacidad de selección de herramientas y rutas.
- Evaluado en clasificación de intenciones (BANKING77, CLINC150+OOS), verificación de afirmaciones (HoVer, ContractNLI, ANLI, NLI4CT), detección de alucinaciones (RAGTruth) y moderación (Hateful Memes).
- Capacidades de razonamiento evaluadas en MMLU, MMLU-Pro, GPQA Diamond, ARC, HellaSwag, WinoGrande, BBH, GSM8K, CLadder, MuSR y HLE.
- Capacidad de visión evaluada en CV-Bench, BLINK, RealWorldQA, CharXiv, InfographicVQA, Mind2Web, Winoground, KIE y MMMU-Pro.
- Interfaz HTTP con endpoints `POST /v1/systemone` y `POST /v1/decisions` mediante `model.py --serve`.
- No se documenta modo thinking, audio ni generación de texto libre como capacidad principal.

## Casos de uso

- Clasificación de intenciones en atención al cliente: con BANKING77 (macro-F1 93,21) y CLINC150+OOS (macro-F1 95,02), el modelo puede asignar cada consulta entrante a una categoría con probabilidad asociada, permitiendo umbrales de confianza y escalado a humano cuando la distribución es ambigua.
- Enrutamiento de consultas a modelos o herramientas: los resultados en RouterBench (calidad seleccionada 79,93) y BFCL (exactitud exacta de caso 96,40) lo hacen apto para decidir qué modelo, API o herramienta debe atender cada petición dentro de un orquestador.
- Verificación de afirmaciones en pipelines RAG: con HoVer (88,82 de exactitud) y RAGTruth (F1 de 84,19 en la clase alucinada), puede actuar como filtro que puntúa si una respuesta generada está respaldada por el contexto recuperado antes de mostrarla.
- Moderación de contenido multimodal: Hateful Memes (71,56 de exactitud) permite evaluar conjuntamente imagen y texto para decidir si una publicación infringe políticas, devolviendo probabilidad en lugar de una etiqueta binaria opaca.
- Extracción y validación documental: KIE sobre CORD+FUNSD (96,06) e InfographicVQA (96,31) lo habilitan para decidir qué campo de un documento corresponde a cada valor o si una extracción es correcta, con hasta cuatro imágenes por petición.
- Puntuación de urgencia o severidad en tickets: el tipo Score devuelve la distribución sobre 2-10 niveles ordenados y el nivel esperado, útil para priorizar colas de soporte o incidentes con una métrica continua en lugar de una etiqueta discreta.
- Evaluación de agentes y selección de acciones: When2Call MCQ (90,91) y la simulación de electrodomésticos (77,27 de exactitud exacta de caso) permiten decidir cuándo invocar una función y qué acción tomar en flujos multi-paso.
- Detección de phishing y decisiones de seguridad: PhishNChips (93,05 de exactitud) sirve como clasificador de decisión en filtros de correo o pasarelas con probabilidad calibrada por caso.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el Public Decision Index 0.3. La columna "Skill" es la métrica agregada del índice; "Non-Skill" se muestra cuando está disponible.

| Panel | LemonDecider 4B | Peticiones |
|---|---:|---:|
| Text (índice agregado) | 64,25 (Skill) / 72,64 (Non-Skill) | 140.178 |
| Vision (índice agregado) | 72,349 | 12.210 |

Desglose de visión (11 conjuntos):

| Dataset | Exactitud | Skill |
|---|---:|---:|
| CV-Bench | 86,85 | 78,31 |
| BLINK | 73,57 | 59,08 |
| RealWorldQA | 80,65 | 68,37 |
| CharXiv | 81,95 | 75,94 |
| InfographicVQA | 96,31 | 95,08 |
| Mind2Web | 84,58 | 79,45 |
| Winoground | 91,75 | 83,50 |
| KIE (CORD+FUNSD) | 96,06 | 93,52 |
| Moderation (Hateful Memes) | 71,56 | 43,12 |
| R-Bench-M | 49,62 | 39,54 |
| MMMU-Pro vision | 45,14 | 37,08 |

Desglose de texto (selección de los 43 conjuntos):

| Dataset | Métrica original | Non-Skill | Skill |
|---|---|---:|---:|
| BFCL | exactitud exacta de caso | 96,40 | 95,14 |
| ToolRet | nDCG@10 | 61,23 | 55,23 |
| API-Bank | exactitud | 82,09 | 81,74 |
| BANKING77 | macro-F1 | 93,21 | 93,12 |
| CLINC150+OOS | macro-F1 | 95,02 | 94,99 |
| RouterBench † | calidad seleccionada | 79,93 | 52,94 |
| ContractNLI | macro-F1 | 86,95 | 81,13 |
| ANLI | macro-F1 | 73,46 | 60,25 |
| MMLU † | exactitud | 81,20 | 74,93 |
| GPQA Diamond | exactitud | 52,04 | 36,05 |
| ARC-Challenge † | exactitud | 95,99 | 94,65 |
| HellaSwag | exactitud | 95,51 | 94,01 |
| WinoGrande | exactitud | 89,50 | 79,00 |
| GSM8K | exactitud | 64,94 | 58,01 |
| MuSR | exactitud | 61,97 | 39,54 |
| SimpleBench † | exactitud | 20,00 | 4,00 |
| BRIGHT | nDCG@10 | 42,67 | 35,14 |
| RAGTruth (alucinación) | F1 clase alucinada | 84,19 | 67,22 |
| HoVer | exactitud | 88,82 | 77,64 |
| When2Call MCQ | exactitud | 90,91 | 87,88 |
| MMLU-Pro | exactitud | 64,16 | 59,69 |
| BBH (tareas de opción fija) | exactitud | 76,70 | 66,23 |
| HLE | exactitud | 12,57 | 0,00 |
| CLadder | exactitud | 81,00 | 62,00 |
| CRUXEval | exactitud | 65,26 | 44,89 |
| PhishNChips | exactitud | 93,05 | 86,10 |

† Mostrado pero no contabilizado en el índice.

Configuración de evaluación: `joint-question-inline-readout-v1` con relectura desactivada, temperatura 0,835655, BF16/SDPA, contexto de checkpoint de 262.144 tokens con límite de servicio de 8.192 y tope de 1.638.400 píxeles por imagen.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4.539.918.336 parámetros, en BF16 se requieren aproximadamente 9,1 GB solo para pesos, más memoria para activaciones, caché KV y el procesador de visión; en cuantizaciones de 8 bits o 4 bits el peso baja a rangos aproximados de 4,5 GB y 2,3 GB respectivamente, aunque los tipos de cuantización no están documentados.
- GPU recomendadas: para BF16 con contexto de servicio de 8.192 tokens, una GPU con 16-24 GB es suficiente (RTX 4090, L40S, A10G). Para el contexto completo de 262.144 tokens del checkpoint se necesita memoria considerablemente mayor (A100 80 GB o H100 80 GB).
- Cabe en GPU de consumo: sí, en tarjetas con 16 GB o más en BF16 y en tarjetas de 8-12 GB con cuantización, siempre que se valide el soporte de cuantización del código personalizado.
- Opciones de despliegue: el repositorio incluye `model.py` con la clase `DecisionModel` y un servidor HTTP (`model.py --serve`) que expone `POST /v1/systemone` y `POST /v1/decisions`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y el uso de `custom_code` puede dificultar la integración con motores de inferencia estándar.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la información proporcionada, por lo que la comparación se limita a características estructurales.

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| LemonDecider 4B | 4.539.918.336 | 262.144 (checkpoint) / 8.192 (servicio) | Decisión tipada multimodal sobre Qwen3.5-4B | Apache 2.0 | Hugging Face (custom_code) |
| Qwen/Qwen3.5-4B (base) | no disponible | no disponible | Generación de texto multimodal | no disponible | Hugging Face |
| Alternativas de clasificación/reranking de tamaño similar | no disponible | no disponible | Clasificación o reranking | no disponible | no disponible |

La comparativa con modelos de decisión comparables no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El modelo no es un generador de texto libre: está diseñado para emitir distribuciones de probabilidad sobre preguntas tipadas, por lo que no debe emplearse como sustituto de un LLM conversacional.
- El límite de servicio es de 8.192 tokens frente a los 262.144 del checkpoint; las peticiones largas se resuelven bisecando preguntas, lo que puede alterar el comportamiento respecto a una lectura conjunta completa.
- La evaluación usa una temperatura concreta (0,835655) y una configuración específica de lectura; los resultados pueden variar con otros ajustes de decodificación.
- Riesgo de alucinación: aunque RAGTruth muestra F1 de 84,19 en la clase alucinada, el modelo sigue siendo un clasificador probabilístico y puede asignar alta confianza a decisiones incorrectas en dominios fuera de su distribución.
- Idiomas soportados no documentados; la mayor parte de los conjuntos de evaluación son en inglés, por lo que el rendimiento en castellano u otras lenguas no está verificado.
- Sesgos conocidos: no documentados explícitamente; los resultados en moderación (Hateful Memes, 71,56 de exactitud, skill 43,12) sugieren margen de mejora en decisiones sensibles.
- El uso de `custom_code` implica confiar en el código del repositorio para cargar el modelo; conviene auditar `model.py` antes de desplegarlo en producción.
- Licencia Apache 2.0 permite uso comercial, pero debe conservarse el aviso de licencia y verificarse las obligaciones heredadas del modelo base Qwen3.5-4B.
- El tamaño del repositorio (54,5 GB) exige planificación de almacenamiento y ancho de banda para su descarga y despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/inclusionAI/LemonDecider
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Organización: https://huggingface.co/inclusionAI
