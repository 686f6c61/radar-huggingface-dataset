# danish-foundation-models/DFM-Mimir

## Resumen

DFM-Mimir es un modelo de lenguaje de aproximadamente 1.000 millones de parámetros desarrollado por Danish Foundation Models (DFM), un consorcio de investigación danés. Está construido sobre la arquitectura Hierarchical Reasoning Model (HRM-Text), una propuesta alternativa al transformer estándar, y se ha entrenado desde cero con el objetivo explícito de usar únicamente datos permisibles desde el punto de vista ético y de licencias. El modelo se distribuye con licencia Apache 2.0 y soporta danés e inglés.

El problema que aborda es doble. Por un lado, la mayoría de los modelos abiertos de alto rendimiento se entrenan con datasets masivos cuya procedencia y permisos no siempre son verificables, lo que crea una barrera para investigadores y organizaciones que necesitan trazabilidad legal del dato. Por otro, el danés es un idioma con poca representación en los modelos frontera, de modo que Mimir busca establecer un nuevo estado del arte para danés dentro de su rango de tamaño usando solo datos post-entrenamiento permisibles.

El modelo se entrena sobre una mezcla de 161 datasets que suman aproximadamente 70.479 millones de tokens por época, con una ventana de contexto de 4.096 tokens y un vocabulario de 262.144 entradas. Según la model card, supera al HRM-Text 1B original y compite con modelos notablemente mayores como Qwen 3.5 4B y Gemma 4 E2B en un conjunto de 20 benchmarks de inglés, matemáticas, código y danés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HRM-Text (Hierarchical Reasoning Model, variante de texto) |
| Parametros totales | 1.786.775.040 (~1,79B) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | danés (da), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tamano oculto | 1.536 |
| Capas | 16 |
| Cabezas de atencion | 12 |
| Tamano de vocabulario | 262.144 |
| Pasos de entrenamiento | 1.750.000 |
| Tokens por epoca | ~70,5B |
| Tamano del repositorio | 7,2 GB |
| Libreria | transformers |

## Arquitectura y entrenamiento

Mimir se basa en HRM-Text, una arquitectura de razonamiento jerárquico adaptada a generación de texto, no en un transformer decoder convencional. La configuración publicada indica 16 capas, un tamaño oculto de 1.536 y 12 cabezas de atención, con un vocabulario muy amplio de 262.144 tokens y una ventana de contexto de 4.096 tokens. El entrenamiento se realizó desde cero usando un fork del repositorio HRM-Text, según indica la model card.

El corpus de preentrenamiento combina 161 datasets y totaliza aproximadamente 70.479 millones de tokens por época, repartidos a lo largo de 1.750.000 pasos de entrenamiento. El modelo se presenta como instruction-tuned y conversational, lo que implica una fase de ajuste posterior al preentrenamiento orientada a instrucciones, aunque la información disponible no detalla la composición exacta de ese dataset de ajuste ni si se emplearon técnicas de RLHF o DPO. El cómputo se ejecutó en la infraestructura SDU UCloud. La model card menciona un informe técnico en arXiv con detalles adicionales, pero no se especifican innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto en danés e inglés, con especial énfasis en calidad para danés.
- Razonamiento y respuesta a instrucciones en formato conversacional multi-turno.
- Matemáticas: obtiene 89,9 de accuracy en GSM8K, el mejor resultado entre los modelos de ~1B comparados.
- Generación de código: 56,7 de accuracy en HumanEval, frente a 0,0 del HRM-Text 1B original.
- Comprensión lectora y respuesta extractiva: 83,1 de F1 en DROP.
- Tareas de clasificación y sentido común en inglés: BoolQ, Winogrande, HellaSwag y ARC-C.
- Tareas específicas de danés: análisis de sentimiento (Angry Tweets), corrección gramatical (GEC), respuesta a preguntas sobre Wikipedia en danés (WikiQA) y traducción automática (WMT, chrF).
- Seguimiento de instrucciones: 63,9 de accuracy en IFEval, evaluado en el bloque de danés.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponibles; el modelo es exclusivamente de texto.

## Casos de uso

- Procesamiento de lenguaje natural en danés para administración pública: el modelo obtiene 96,1 de F1 en DaLA y 85,6 de exact match en corrección gramatical, lo que lo hace adecuado para tareas de normalización y revisión de textos oficiales en danés donde la trazabilidad de la licencia del dato de entrenamiento es un requisito legal.
- Traducción automática inglés-danés en entornos con requisitos de cumplimiento: con 53,9 de chrF en WMT y licencia Apache 2.0, puede integrarse en pipelines de traducción internos sin las restricciones de uso comercial de licencias copyleft o de pesos cerrados.
- Análisis de sentimiento sobre redes sociales y prensa danesa: 67,4 de accuracy en Angry Tweets permite clasificar opinión en textos informales y ruidosos, un caso típico de monitorización de marca o de opinión pública.
- Asistente conversacional de bajo coste en inglés: con 69,0 de media en el bloque de benchmarks en inglés y un tamaño de ~1,8B parámetros, puede desplegarse en una sola GPU consumer para atención al cliente o asistentes internos donde el contexto necesario no exceda los 4.096 tokens.
- Generación de código asistida en entornos educativos: 56,7 en HumanEval y 89,9 en GSM8K lo sitúan como candidato para tutores de programación y matemáticas en danés e inglés, con la ventaja de que el modelo cabe en hardware asequible.
- Investigación sobre arquitecturas alternativas al transformer: el modelo es un punto de referencia reproducible para estudiar HRM-Text frente a transformers de tamaño comparable, con pesos abiertos, informe técnico y receta de entrenamiento documentada.
- Respuesta a preguntas sobre corpus documentales en danés: 66,8 de exact match en WikiQA indica capacidad de extracción de respuestas factuales, útil para bases de conocimiento internas o buscadores semánticos sobre documentación.

## Benchmarks y rendimiento

Resultados en inglés (conjuntos completos, según la model card):

| Modelo | BoolQ | Winogrande | HellaSwag | MMLU | ARC-C | DROP (F1) | GovRep. (R1) | Media |
|---|---|---|---|---|---|---|---|---|
| Mimir 1B | 87,8 | 73,5 | 67,3 | 57,5 | 81,6 | 83,1 | 32,0 | 69,0 |
| HRM-Text 1B | 87,5 | 70,4 | 60,4 | 58,7 | 82,2 | 78,1 | 25,4 | 66,1 |
| Qwen 3.5 0.8B | 69,8 | 48,9 | 37,0 | 51,5 | 68,4 | 45,2 | 32,5 | 50,5 |
| Gemma 3 1B | 62,4 | 49,1 | 30,6 | 37,5 | 43,5 | 7,0 | 29,5 | 37,1 |
| OLMo 2 1B | 67,2 | 51,0 | 42,4 | 41,6 | 48,1 | 12,4 | 37,7 | 42,9 |
| Qwen 3.5 2B | 80,8 | 53,4 | 64,6 | 62,8 | 82,7 | 31,3 | 31,5 | 58,2 |
| SmolLM3 3B | 84,3 | 60,3 | 65,1 | 60,2 | 79,5 | 54,0 | 38,1 | 63,1 |
| Qwen 3.5 4B | 87,0 | 70,0 | 83,2 | 75,8 | 92,9 | 48,0 | 27,9 | 69,3 |
| Gemma 4 E2B | 64,1 | 56,7 | 55,6 | 59,3 | 69,8 | 57,3 | 33,6 | 56,6 |
| Gemma 4 E2B (think) | 83,4 | 63,0 | 55,8 | 72,0 | 86,8 | 70,8 | 34,7 | 66,6 |

Resultados en matemáticas y código:

| Modelo | GSM8K | MATH | HumanEval | Media |
|---|---|---|---|---|
| Mimir 1B | 89,9 | 45,8 | 56,7 | 64,1 |
| HRM-Text 1B | 84,8 | 56,0 | 0,0 | 46,9 |
| Qwen 3.5 0.8B | 49,1 | 36,1 | 30,5 | 38,6 |
| Gemma 3 1B | 49,7 | 37,2 | 42,7 | 43,2 |
| OLMo 2 1B | 59,4 | 18,8 | 15,9 | 31,4 |
| Qwen 3.5 2B | 73,7 | 55,7 | 47,6 | 59,0 |
| SmolLM3 3B | 80,0 | 62,2 | 61,6 | 67,9 |
| Qwen 3.5 4B | 60,5 | 56,5 | 78,0 | 65,0 |
| Gemma 4 E2B | 88,3 | 64,2 | 73,8 | 75,4 |
| Gemma 4 E2B (think) | 90,3 | 49,1 | 72,0 | 70,5 |

Resultados en danés:

| Modelo | Angry Tweets | DaLA (F1) | GEC (EM) | PIQA | Daisy (EM) | WikiQA (EM) | WMT (chrF) | N.News (chrF) | IFEval | HellaSwag-DA | Media |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Mimir 1B | 67,4 | 96,1 | 85,6 | 53,7 | 9,6 | 66,8 | 53,9 | 35,87 | 63,9 | 35,3 | 56,8 |
| HRM-Text 1B | 42,4 | 26,7 | 0,5 | 13,0 | 0,0 | 34,9 | 25,4 | 26,76 | 18,5 | 28,8 | 21,7 |
| Qwen 3.5 0.8B | 53,8 | 51,0 | 0,7 | 56,5 | 0,7 | 41,6 | 37,8 | 35,30 | 39,6 | 25,0 | 34,2 |
| Gemma 3 1B | 54,4 | 41,0 | 3,3 | 72,2 | 1,4 | 42,6 | 45,1 | 35,56 | 47,2 | 24,8 | 36,8 |
| OLMo 2 1B | 33,6 | 48,7 | 0,2 | 75,0 | 0,0 | 8,4 | 30,0 | 33,77 | 32,5 | 26,7 | 28,9 |
| Qwen 3.5 2B | 61,6 | 36,4 | 8,0 | 25,0 | 2,5 | 49,4 | 45,6 | 34,85 | 56,1 | 24,7 | 34,4 |
| SmolLM3 3B | 63,2 | 33,5 | 3,3 | 51,9 | 2,2 | 0,3 | 37,3 | 35,98 | 49,8 | 40,1 | 31,7 |
| Qwen 3.5 4B | 69,1 | 50,1 | 42,6 | 70,4 | 4,7 | 57,1 | 52,1 | 37,03 | 73,7 | 34,7 | 49,2 |
| Gemma 4 E2B | 64,6 | 56,7 | 36,9 | 46,3 | 5,6 | 44,1 | 55,2 | 35,67 | 75,5 | 25,6 | 44,6 |
| Gemma 4 E2B (think) | 67,7 | 66,8 | 23,4 | 63,9 | 5,1 | 59,3 | 56,0 | 36,30 | 81,2 | 39,0 | 49,9 |
| Munin-Apertus 8B | 60,6 | 46,1 | 42,1 | 81,5 | 12,5 | 49,9 | 55,8 | 30,30 | 53,0 | 24,5 | 45,6 |
| Munin-Mistral 8B | 61,3 | 48,8 | 26,4 | 76,9 | 8,4 | 48,4 | 51,8 | 32,92 | 67,8 | 33,6 | 45,6 |
| Munin-Qwen 9B | 69,1 | 60,6 | 11,4 | 38,9 | 5,4 | 55,7 | 56,1 | 35,89 | 71,8 | 34,3 | 43,9 |

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en bf16 (unos 3,6 GB para 1,79B parámetros) el modelo requiere del orden de 4-5 GB de VRAM, más el espacio para caché KV. El repositorio ocupa 7,2 GB, lo que sugiere pesos en precisión superior o ficheros adicionales.
- Cuantización a 8 bits: aproximadamente 2 GB de pesos, con un consumo total estimado de 3-4 GB incluyendo contexto.
- Cuantización a 4 bits: aproximadamente 1 GB de pesos, con un consumo total estimado de 2-3 GB.
- GPU recomendadas: para bf16, una RTX 4090, L40S, A100 o H100 ofrecen margen holgado; para cuantización 4/8 bits, una RTX 3060 de 12 GB o una RTX 4060 Ti de 16 GB son suficientes.
- Cabe en GPU consumer: sí, en cualquier GPU con 6 GB o más de VRAM en cuantización 8 bits, y en GPUs de 4 GB en cuantización 4 bits.
- Opciones de despliegue: la librería indicada es transformers; el tag `endpoints_compatible` sugiere compatibilidad con Hugging Face Inference Endpoints. No se confirma en la información disponible soporte específico para vLLM, llama.cpp, Ollama o TGI, y la arquitectura HRM-Text no estándar puede limitar la compatibilidad con motores de inferencia genéricos.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Media ingles | Media mat./codigo | Media danes | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| DFM-Mimir 1B | ~1,79B | 4.096 | 69,0 | 64,1 | 56,8 | Apache 2.0 | Hugging Face |
| HRM-Text 1B | ~1B | no disponible | 66,1 | 46,9 | 21,7 | no disponible | Hugging Face |
| Qwen 3.5 0.8B | ~0,8B | no disponible | 50,5 | 38,6 | 34,2 | no disponible | Hugging Face |
| SmolLM3 3B | ~3B | no disponible | 63,1 | 67,9 | 31,7 | no disponible | Hugging Face |
| Gemma 4 E2B (think) | no disponible | no disponible | 66,6 | 70,5 | 49,9 | no disponible | Hugging Face |

La comparación se limita a los datos publicados en la propia model card. Mimir destaca especialmente en danés, donde supera con claridad a modelos de hasta 9B parámetros como los de la familia Munin, y en GSM8K dentro de su rango de tamaño. En cambio, queda por debajo de Qwen 3.5 4B y Gemma 4 E2B en MMLU, HellaSwag y HumanEval.

## Limitaciones y advertencias

- Ventana de contexto limitada a 4.096 tokens, muy inferior a los 32K-128K habituales en modelos contemporáneos, lo que restringe casos de uso con documentos largos o conversaciones extensas.
- Rendimiento débil en Daisy (9,6 de exact match), la tarea de danés con peor resultado relativo, lo que sugiere dificultades en ese tipo concreto de evaluación.
- Resultados moderados en HellaSwag-DA (35,3) y GovRep. (32,0), indicativos de margen de mejora en razonamiento de sentido común y en tareas de tipo gubernamental o factual.
- Cobertura lingüística reducida a danés e inglés; no se documenta soporte para otras lenguas, incluido el español.
- Riesgo de alucinación inherente a un modelo de ~1,8B parámetros sin mecanismos de verificación documentados; la model card advierte de que deben seguirse las instrucciones de uso para no operar fuera de las condiciones previstas.
- Sesgos: la información disponible no documenta una evaluación de sesgos; el entrenamiento con 161 datasets permisibles no garantiza por sí solo ausencia de sesgos en las respuestas.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución, sin las restricciones de licencias copyleft, pero conviene verificar el fichero LICENSE del repositorio.
- Compatibilidad de despliegue: al no ser un transformer estándar, puede requerir código específico del fork de HRM-Text y no funcionar directamente en motores de inferencia convencionales.
- No se detalla la composición del dataset de ajuste por instrucciones ni si se aplicaron técnicas de alineación como RLHF o DPO, lo que dificulta anticipar el comportamiento en dominios sensibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/danish-foundation-models/DFM-Mimir
- Informe técnico (arXiv): https://arxiv.org/pdf/2608.13517
- Repositorio HRM-Text (base del fork de entrenamiento): https://github.com/schneiderkamplab/HRM-Text
