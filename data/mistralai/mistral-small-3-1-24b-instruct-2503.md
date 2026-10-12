# mistralai/Mistral-Small-3.1-24B-Instruct-2503

## Resumen

Mistral Small 3.1 24B Instruct (identificador `Mistral-Small-3.1-24B-Instruct-2503`) es un modelo multimodal de pesos abiertos publicado por Mistral AI el 11 de marzo de 2025. Se trata de la version afinada por instrucciones del modelo base `Mistral-Small-3.1-24B-Base-2503`, y supone una revision de Mistral Small 3 (2501) que incorpora comprension de vision de estado del arte y amplia la ventana de contexto hasta 128.000 tokens sin degradar el rendimiento en texto.

El modelo cuenta con 24.011.361.280 parametros y esta disenado explicitamente para despliegue local: segun la model card, cabe en una unica RTX 4090 o en un MacBook con 32 GB de RAM una vez cuantizado, lo que lo situa en un rango de "densidad de conocimiento" poco habitual para su tamano. Emplea un tokenizer Tekken con vocabulario de 131.000 entradas y se distribuye bajo licencia Apache 2.0, sin restricciones de uso comercial.

Su relevancia actual reside en tres ejes: capacidades agenticas nativas (function calling y salida JSON), soporte multilingue amplio (24 idiomas listados en los metadatos del repositorio) y comprension de documentos e imagenes con contexto largo. Todo ello con un coste de inferencia contenido en comparacion con modelos frontera cerrados de capacidad similar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (comprension de texto e imagen); detalles internos del codificador de vision no disponibles |
| Parametros totales | 24.011.361.280 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantizacion | No disponible en la model card. La documentacion solo indica que el modelo cabe en una RTX 4090 o en un MacBook de 32 GB "una vez cuantizado" |
| Idiomas soportados | 24 idiomas en los metadatos: ingles, frances, aleman, espanol, portugues, italiano, japones, coreano, ruso, chino, arabe, farsi, indonesio, malayo, nepali, polaco, rumano, serbio, sueco, turco, ucraniano, vietnamita, hindi y bengali. La model card menciona ademas el griego, que no aparece en la lista de idiomas del repositorio |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tokenizer | Tekken, vocabulario de 131.000 tokens |
| Modelo base | mistralai/Mistral-Small-3.1-24B-Base-2503 |
| Tamano del repositorio | 96,1 GB |
| Libreria declarada | vllm |
| Fecha de creacion | 11 de marzo de 2025 |

## Arquitectura y entrenamiento

La model card describe el modelo como una evolucion de Mistral Small 3 (2501) que anade comprension de vision y extiende el contexto hasta 128.000 tokens manteniendo el rendimiento en texto. Se trata de un modelo denso de 24.000 millones de parametros, no de una arquitectura de mezcla de expertos, por lo que la totalidad de los parametros se activa en cada paso de inferencia. La model card no detalla la topologia del codificador de vision, el numero de capas, la dimension oculta ni el mecanismo de atencion empleado.

En cuanto a los datos de entrenamiento, la informacion disponible no especifica el volumen de tokens, la composicion del corpus ni si se aplicaron tecnicas de alineacion como RLHF o DPO. Lo unico confirmado es que `Mistral-Small-3.1-24B-Instruct-2503` es una version afinada por instrucciones del modelo base `Mistral-Small-3.1-24B-Base-2503`. Entre las caracteristicas tecnicas destacadas por el autor figuran el uso del tokenizer Tekken (131.000 tokens de vocabulario), una fuerte adherencia a system prompts y capacidad nativa de function calling y salida en formato JSON.

## Capacidades

- Generacion de texto y conversacion multi-turno con ventana de 128.000 tokens.
- Razonamiento avanzado, con resultados notables en GPQA Main, GPQA Diamond y MATH.
- Generacion de codigo: 88,41% en HumanEval y 74,71% en MBPP segun las evaluaciones publicadas.
- Comprension de vision: analisis de imagenes, graficos, diagramas y documentos (DocVQA 94,08%, ChartQA 86,24%, AI2D 93,72%).
- Capacidades agenticas nativas: function calling y salida estructurada en JSON.
- Razonamiento multi-paso orientado a agentes y flujos de automatizacion.
- Soporte multilingue en 24 idiomas segun los metadatos, con rendimiento medio de 71,18% en las evaluaciones multilingue del autor.
- Alta adherencia a system prompts, pensada para despliegues con instrucciones persistentes.
- Comprension de documentos largos combinada con entrada visual.

## Casos de uso

- Atencion al cliente automatizada: con 128.000 tokens de contexto, el modelo puede mantener conversaciones multi-turno arrastrando historiales completos, politicas de empresa y documentacion de producto sin truncar informacion, y responder con latencia baja.
- Agentes con function calling: su soporte nativo de llamadas a funciones y salida JSON permite construir agentes que consulten APIs, bases de datos o sistemas internos de forma fiable y parseable sin post-procesado complejo.
- Procesamiento de documentos escaneados: gracias a DocVQA (94,08%) y su entrada de vision, resulta adecuado para extraer datos estructurados de facturas, formularios, contratos o informes en PDF convertidos a imagen.
- Analisis de graficos y reporting financiero: ChartQA de 86,24% lo hace util para interpretar dashboards, series temporales y tablas presentes en imagenes y generar resumenes textuales.
- Asistente de programacion en local: 88,41% en HumanEval y 74,71% en MBPP permiten integrarlo en entornos de desarrollo con requisitos de confidencialidad, donde el codigo no puede salir de la infraestructura propia.
- Despliegue en el puesto de trabajo para datos sensibles: al caber cuantizado en una RTX 4090 o en un MacBook de 32 GB, sectores como sanidad, legal o administracion publica pueden ejecutarlo sin enviar datos a terceros.
- Extraccion de informacion multilingue: con soporte para 24 idiomas, es viable clasificar, resumir o extraer entidades de tickets, correos y documentos en ingles, frances, aleman, espanol, chino, arabe o hindi dentro del mismo pipeline.
- Generacion aumentada por recuperacion (RAG) sobre corpus extensos: la ventana de 128.000 tokens permite insertar muchos fragmentos recuperados en una sola llamada y reducir la complejidad del orquestador.
- Ajuste fino por dominio: la licencia Apache 2.0 y la publicacion del modelo base facilitan el fine-tuning para expertos sectoriales sin obligaciones de cesion de mejoras.

## Benchmarks y rendimiento

Resultados de preentrenamiento del modelo base, segun la model card:

| Modelo | MMLU (5-shot) | MMLU Pro (5-shot CoT) | TriviaQA | GPQA Main (5-shot CoT) | MMMU |
|---|---|---|---|---|---|
| Small 3.1 24B Base | 81,01% | 56,03% | 80,50% | 37,50% | 59,27% |
| Gemma 3 27B PT | 78,60% | 52,20% | 81,30% | 24,30% | 56,10% |

Evaluaciones de texto en la version instruct:

| Modelo | MMLU | MMLU Pro (5-shot CoT) | MATH | GPQA Main (5-shot CoT) | GPQA Diamond (5-shot CoT) | MBPP | HumanEval | SimpleQA (TotalAcc) |
|---|---|---|---|---|---|---|---|---|
| Small 3.1 24B Instruct | 80,62% | 66,76% | 69,30% | 44,42% | 45,96% | 74,71% | 88,41% | 10,43% |
| Gemma 3 27B IT | 76,90% | 67,50% | 89,00% | 36,83% | 42,40% | 74,40% | 87,80% | 10,00% |
| GPT-4o Mini | 82,00% | 61,70% | 70,20% | 40,20% | 39,39% | 84,82% | 87,20% | 9,50% |
| Claude 3.5 Haiku | 77,60% | 65,00% | 69,20% | 37,05% | 41,60% | 85,60% | 88,10% | 8,02% |
| Cohere Aya-Vision 32B | 72,14% | 47,16% | 41,98% | 34,38% | 33,84% | 70,43% | 62,20% | 7,65% |

Evaluaciones de vision:

| Modelo | MMMU | MMMU PRO | Mathvista | ChartQA | DocVQA | AI2D | MM MT Bench |
|---|---|---|---|---|---|---|---|
| Small 3.1 24B Instruct | 64,00% | 49,25% | 68,91% | 86,24% | 94,08% | 93,72% | 7,3 |
| Gemma 3 27B IT | 64,90% | 48,38% | 67,60% | 76,00% | 86,60% | 84,50% | 7,0 |
| GPT-4o Mini | 59,40% | 37,60% | 56,70% | 76,80% | 86,70% | 88,10% | 6,6 |
| Claude 3.5 Haiku | 60,50% | 45,03% | 61,60% | 87,20% | 90,00% | 92,10% | 6,5 |
| Cohere Aya-Vision 32B | 48,20% | 31,50% | 50,10% | 63,04% | 72,40% | 82,57% | 4,1 |

Evaluaciones multilingues (la tabla de la model card aparece truncada en la informacion disponible):

| Modelo | Media | Europeo | Asia oriental | Oriente medio |
|---|---|---|---|---|
| Small 3.1 24B Instruct | 71,18% | 75,30% | 69,17% | 69,08% |
| Gemma 3 27B IT | 70,19% | 74,14% | No disponible (dato truncado) | No disponible (dato truncado) |

Nota metodologica del autor: cuando existen, se reportan cifras publicadas por otros proveedores; en caso contrario se reevaluan con el harness propio de Mistral AI.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: aproximadamente 48 GB solo para pesos (24.011.361.280 parametros x 2 bytes), mas margen para cache KV y activaciones. Requiere GPUs como A100 80 GB o H100 80 GB.
- VRAM estimada en INT8: aproximadamente 24 GB de pesos. Se situa en el limite de una RTX 4090 de 24 GB, por lo que en la practica exige offloading parcial o GPUs de 40-48 GB (A6000, L40S, A100 40 GB).
- VRAM estimada en INT4: aproximadamente 12-13 GB de pesos, lo que deja margen suficiente en una RTX 4090 (24 GB) para contexto amplio y cache KV.
- GPU recomendadas: A100 80 GB o H100 80 GB para precision completa o contextos de 128k; L40S, A6000 o A100 40 GB para INT8; RTX 4090, RTX 5090 o RTX 6000 Ada para cuantizacion de 4 bits.
- Consumer GPU: si, cabe en una RTX 4090 con cuantizacion. La model card afirma explicitamente que el modelo entra en una unica RTX 4090 o en un MacBook con 32 GB de RAM una vez cuantizado. En FP16 no cabe en ninguna GPU de consumo actual.
- Apple Silicon: viable en equipos con 32 GB de memoria unificada o superior, en formato cuantizado.
- Opciones de despliegue: la libreria declarada en el repositorio es vLLM, que es la via recomendada por el autor. Tambien es compatible con `transformers` y con `mistral-common` para el tokenizer. No se confirma soporte oficial para llama.cpp, Ollama o TGI en la informacion disponible, aunque al tratarse de pesos safetensors abiertos es habitual la existencia de conversiones GGUF de terceros no verificadas aqui.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Disponibilidad | Rendimiento destacado |
|---|---|---|---|---|---|---|
| Mistral Small 3.1 24B Instruct | 24,0B densos | 128k tokens | Si | Apache 2.0 | Pesos abiertos en HuggingFace, 327.837 descargas y 1.396 likes | MMLU 80,62%; GPQA Diamond 45,96%; DocVQA 94,08%; HumanEval 88,41% |
| Gemma 3 27B IT | 27B | No disponible en la informacion | Si | No disponible en la informacion | Pesos abiertos | MATH 89,00%; MMLU Pro 67,50%; MMMU 64,90%; DocVQA 86,60% |
| GPT-4o Mini | No disponible | No disponible en la informacion | Si | Propietaria | Solo API | MMLU 82,00%; MBPP 84,82%; HumanEval 87,20% |
| Claude 3.5 Haiku | No disponible | No disponible en la informacion | Si | Propietaria | Solo API | MBPP 85,60%; ChartQA 87,20%; HumanEval 88,10% |
| Cohere Aya-Vision 32B | 32B | No disponible en la informacion | Si | No disponible en la informacion | Pesos abiertos | Rendimiento sistematicamente inferior en las tablas del autor |

Frente a las alternativas propietarias (GPT-4o Mini, Claude 3.5 Haiku), Mistral Small 3.1 ofrece pesos abiertos bajo Apache 2.0, lo que permite despliegue on-premise, fine-tuning y auditoria, a cambio de una ligera desventaja en MMLU frente a GPT-4o Mini y en MBPP frente a ambos. Frente a Gemma 3 27B, el modelo de Mistral es claramente superior en tareas de codigo (HumanEval 88,41% frente a 87,80%), razonamiento cientifico (GPQA Diamond 45,96% frente a 42,40%) y comprension de documentos (DocVQA 94,08% frente a 86,60%), mientras que Gemma 3 27B le supera en matematicas (MATH 89,00% frente a 69,30%).

## Limitaciones y advertencias

- No se documentan en la informacion disponible los sesgos conocidos del modelo, ni la composicion del dataset de entrenamiento, lo que dificulta evaluar riesgos de sesgo sistematico.
- Como todo modelo generativo, existe riesgo de alucinacion. El resultado de SimpleQA (10,43% de precision total) indica una capacidad limitada en preguntas factuales de respuesta corta, lo que aconseja verificar afirmaciones factuales en entornos de produccion.
- La ventana de contexto es de 128.000 tokens, pero no se especifica si se mantiene el rendimiento en todo el rango ni si existe degradacion en posiciones intermedias.
- Aunque la model card menciona el griego, este idioma no figura en la lista de idiomas de los metadatos del repositorio; conviene verificar el soporte real antes de desplegarlo en ese idioma.
- La tabla de evaluaciones multilingues esta truncada en la informacion disponible, por lo que no es posible comparar el rendimiento en idiomas de Asia oriental y Oriente medio frente a Gemma 3 27B mas alla de la fila parcial del modelo de Mistral.
- No se detalla la topologia del codificador de vision ni las resoluciones de imagen soportadas, lo que limita la planificacion de cargas de trabajo visuales.
- En FP16 el modelo requiere aproximadamente 48 GB de VRAM, lo que descarta GPUs de consumo sin cuantizar.
- El repositorio incluye un aviso de tratamiento de datos personales (`extra_gated_description`) que enlaza a la politica de privacidad de Mistral AI; conviene revisarlo si se accede al repositorio autenticado.
- La licencia Apache 2.0 permite uso comercial y modificacion sin obligacion de publicar derivados, pero no exime del cumplimiento de normativas sectoriales aplicables a los datos tratados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mistralai/Mistral-Small-3.1-24B-Instruct-2503
- Modelo base: https://huggingface.co/mistralai/Mistral-Small-3.1-24B-Base-2503
- Anuncio en el blog de Mistral AI: https://mistral.ai/news/mistral-small-3-1/
- Sitio oficial de Mistral AI: https://mistral.ai/
- Politica de privacidad de Mistral AI: https://mistral.ai/terms/
- Ficha del modelo en Accenture AI Refinery SDK: https://sdk.airefinery.accenture.com/distiller/model_catalog/LLMs/mistralai/Mistral-Small-3.1-24B-Instruct-2503/
- Entrada de Mistral AI en Wikipedia: https://fr.wikipedia.org/wiki/Mistral_AI
