# LinHekaka/RedSage-Qwen3-8B-Ins

## Resumen

RedSage-Qwen3-8B-Ins es la variante ajustada por instrucciones de la serie RedSage, una familia de modelos de lenguaje orientada especificamente al ambito de la ciberseguridad y desarrollada por RISys-Lab. Parte del modelo base RISys-Lab/RedSage-Qwen3-8B-Base y se entrena en una tercera etapa de Supervised Fine-Tuning (SFT) sobre RedSage-Conv, un corpus de aproximadamente 266.000 dialogos multi-turno generados mediante un pipeline de aumentacion agentica, combinado con datos generales de instrucciones procedentes de SmolTalk2. El repositorio publicado bajo el identificador LinHekaka/RedSage-Qwen3-8B-Ins es una copia del modelo oficial, con 8.190.735.360 parametros y un tamano de repositorio de 16,4 GB.

El problema que resuelve es la falta de especializacion de los modelos generalistas en tareas de seguridad: frente a Qwen3-8B en modo no razonador, este modelo mejora la media de los benchmarks externos de ciberseguridad de 75,71 a 81,30 y la media de OpenLLM de 65,92 a 73,34. Esta orientado a asistencia interactiva, respuesta a preguntas sobre marcos como MITRE y OWASP, explicacion de tecnicas ofensivas y defensivas, y generacion y explicacion de comandos de herramientas como nmap, sqlmap o metasploit.

Es relevante ahora porque cubre un nicho (LLM generalista de ciberseguridad en 8B) con un pipeline de entrenamiento reproducible y publicado, y porque existe una version posterior con DPO (RedSage-Qwen3-8B-DPO) para quien necesite alineacion adicional. El modelo solo declara soporte de ingles y su licencia no esta indicada en la informacion disponible, lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, basado en la familia Qwen3; no se declara MoE ni arquitectura hibrida |
| Parametros totales | 8.190.735.360 (~8,19 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base declarado es Qwen3-8B) |
| Tipos de cuantizacion | no disponible; el repositorio publica pesos sin cuantizar (16,4 GB en safetensors) |
| Idiomas soportados | ingles (en) |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria transformers) |
| Modelo base | RISys-Lab/RedSage-Qwen3-8B-Base |
| Etapa de entrenamiento | Stage 3 - Supervised Fine-Tuning (SFT); sin DPO |
| Formato de prompt | ChatML (`<|im_start|>system`, `<|im_start|>user`, `<|im_start|>assistant`, `<|im_end|>`) |
| Tamano del repositorio | 16,4 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only denso heredado de Qwen3-8B, sin componentes de mezcla de expertos ni mecanismos de estado recurrente. El entrenamiento sigue un pipeline en cuatro etapas del que este modelo es la salida de la tercera: la etapa 1 es un preentrenamiento continuado (CPT) sobre CyberFineWeb que produce RedSage-Qwen3-8B-CFW; la etapa 2 es un preentrenamiento dirigido que da lugar a RedSage-Qwen3-8B-Base; la etapa 3 es el SFT sobre el que se documenta esta ficha; y la etapa 4 aplica Direct Preference Optimization (DPO) para obtener RedSage-Qwen3-8B-DPO.

Los datos de la etapa 3 combinan dos fuentes. La primera es RedSage-Conv, con aproximadamente 266.000 muestras de dialogo multi-turno generadas mediante un Agentic Augmentation Pipeline: un agente planificador y un agente aumentador transforman conocimiento estatico curado en RedSage-Seed (MITRE, write-ups y manuales) en escenarios realistas de roleplay, por ejemplo analista junior frente a mentor senior o planificacion de red team. La cobertura abarca conocimiento general y de marcos, habilidades ofensivas y uso de herramientas de linea de comandos y de Kali. La segunda fuente es un subconjunto no razonador de SmolTalk2, incluido para preservar capacidades generales de seguimiento de instrucciones como resumen o escritura creativa. No se documentan en la informacion disponible innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional en ingles con formato ChatML y soporte de mensaje de sistema.
- Asistencia interactiva en ciberseguridad: preguntas sobre marcos MITRE y OWASP, tecnicas ofensivas y estrategias defensivas.
- Uso y explicacion de herramientas: generacion y justificacion de comandos para nmap, sqlmap y metasploit.
- Soporte educativo: explicacion detallada de vulnerabilidades y pasos de remediacion.
- Razonamiento sobre conocimiento de seguridad: resultados declarados de 84,20 en conocimiento general y 84,98 en conocimiento de marcos dentro del benchmark interno RedSage-MCQ.
- Capacidades generales de instruccion conservadas mediante SmolTalk2: resumen y escritura creativa, con 79,97 en IFEval.
- Razonamiento matematico basico y de sentido comun, con 86,05 en GSM8K y 73,64 en WinoGrande dentro de OpenLLM.
- Escenarios multi-turno de roleplay (analista junior/mentor senior, planificacion de red team) segun el diseno del dataset de entrenamiento.
- No se declara soporte de vision, audio, function calling nativo estructurado ni modo de razonamiento explicito (thinking mode): el modelo se entrena sobre datos no razonadores.
- Capacidad multilingue limitada al ingles segun el campo `language` de la model card.

## Casos de uso

- Asistencia a analistas SOC: el modelo puede resolver consultas multi-turno sobre tecnicas MITRE ATT&CK y procedimientos de respuesta, manteniendo el contexto de la conversacion gracias a su entrenamiento especifico en dialogos de seguridad (89,06 en habilidades ofensivas y 86,80 en herramientas CLI en RedSage-MCQ).
- Formacion y concienciacion en seguridad: generacion de escenarios de roleplay entre analista junior y mentor senior para entrenar a personal nuevo, un formato presente de forma explicita en RedSage-Conv.
- Explicacion de comandos de pentesting: dado un objetivo, el modelo redacta y justifica invocaciones de nmap, sqlmap o metasploit, util como apoyo documental en equipos de red team con supervision humana.
- Triaje de inteligencia de amenazas: clasificacion y respuesta a preguntas tipo test sobre CTI, donde declara 70,56 en CTI-Bench MCQ y 76,70 en CTI-Bench RCM, por encima de Qwen3-8B no razonador.
- Soporte educativo en vulnerabilidades y remediacion: explicacion paso a paso de CWE y medidas correctivas, apoyandose en el 91,45 declarado en SECURE (CWET).
- Revision de configuraciones y practicas: preguntas y respuestas sobre controles de seguridad y conocimiento comun de seguridad (KCV) en el marco SECURE.
- Preprocesado y resumen de informes tecnicos: uso de las capacidades generales de resumen conservadas por SmolTalk2 para condensar write-ups o documentacion interna antes de una revision humana.
- Base para ajuste posterior o evaluacion academica: al ser la etapa SFT previa al DPO, sirve como punto de partida reproducible para experimentos de alineacion en el dominio de seguridad.
- Chatbot interno de consulta tecnica en ingles: despliegue en servicios con `text-generation-inference` o vLLM para responder dudas de ingenieria de seguridad, siempre con revision de las respuestas ofensivas.

## Benchmarks y rendimiento

El model-index oficial del repositorio no contiene resultados (`results: []`). Los datos siguientes son los declarados por el autor en la model card, comparados con Qwen3-8B en modo no razonador.

RedSage-MCQ (exactitud 0-shot):

| Categoria | Qwen3-8B (no razonador) | RedSage-8B-Ins |
|---|---|---|
| Media macro | 81,85 | 85,73 |
| Conocimiento (general) | 80,46 | 84,20 |
| Conocimiento (marcos) | 78,82 | 84,98 |
| Habilidad (ofensiva) | 86,16 | 89,06 |
| Herramientas (CLI) | 83,92 | 86,80 |
| Herramientas (Kali) | 75,56 | 80,30 |

Benchmarks externos de ciberseguridad (0-shot):

| Benchmark | Qwen3-8B (no razonador) | RedSage-8B-Ins |
|---|---|---|
| Media | 75,71 | 81,30 |
| CTI-Bench (MCQ) | 62,76 | 70,56 |
| CTI-Bench (RCM) | 54,00 | 76,70 |
| CyberMetric (500) | 88,60 | 89,80 |
| MMLU (Security) | 76,00 | 78,00 |
| SecBench (En) | 73,26 | 79,91 |
| SecEval (MCQ) | 65,46 | 72,48 |
| SECURE (CWET) | 88,11 | 91,45 |
| SECURE (KCV) | 87,42 | 81,34 |
| SECURE (MEAT) | 85,75 | 91,47 |

OpenLLM Leaderboard (benchmark general):

| Benchmark | Qwen3-8B (no razonador) | RedSage-8B-Ins |
|---|---|---|
| Media | 65,92 | 73,34 |
| MMLU | 73,59 | 77,38 |
| ARC-C | 62,54 | 69,62 |
| GSM8K | 75,66 | 86,05 |
| HellaSwag | 56,70 | 79,00 |
| TruthfulQA | 45,23 | 47,75 |
| WinoGrande | 62,51 | 73,64 |
| IFEval | 85,21 | 79,97 |

Los dos unicos retrocesos declarados frente a Qwen3-8B son SECURE (KCV), de 87,42 a 81,34, y IFEval, de 85,21 a 79,97.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: en torno a 16,4 GB solo para pesos, mas memoria para el contexto y el cache KV; se recomienda un minimo practico de 20-24 GB.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 9-10 GB de pesos; en 4 bits, en torno a 5-6 GB de pesos. Estas cifras son estimaciones a partir del numero de parametros, ya que el repositorio no publica versiones cuantizadas.
- GPU profesionales: A100 40/80 GB, H100 80 GB o L40S son suficientes con margen amplio para lotes grandes y contextos largos.
- GPU de consumo: cabe en RTX 4090 o RTX 3090 (24 GB) en FP16 con contexto moderado, y en GPUs de 12-16 GB si se aplica cuantizacion de 8 o 4 bits.
- Opciones de despliegue: transformers con `device_map="auto"` (uso documentado en la model card), text-generation-inference (el repositorio incluye la etiqueta `text-generation-inference`) y vLLM. No hay pesos GGUF publicados, por lo que llama.cpp u Ollama requeririan una conversion propia.
- Latencia y throughput: no disponible en la informacion proporcionada; no se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto declarado | Rendimiento destacado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RedSage-Qwen3-8B-Ins | 8,19 B | no disponible | Media externa ciberseguridad 81,30; OpenLLM 73,34 | no disponible | HuggingFace (repositorio LinHekaka, copia de RISys-Lab) |
| Qwen3-8B (no razonador) | ~8 B | no disponible en la informacion | Media externa ciberseguridad 75,71; OpenLLM 65,92 | no disponible en la informacion | HuggingFace |
| RedSage-Qwen3-8B-Base | ~8 B (modelo base de esta serie) | no disponible | Sin datos de benchmarks de instrucciones en la informacion | no disponible | HuggingFace (RISys-Lab) |
| RedSage-Qwen3-8B-DPO | ~8 B | no disponible | Version alineada con DPO; sin cifras en la informacion | no disponible | HuggingFace (RISys-Lab) |

No se dispone de datos de otros modelos de ciberseguridad de 8B comparables en la informacion proporcionada.

## Limitaciones y advertencias

- No ha pasado por Direct Preference Optimization: el propio autor indica que la version alineada final es RedSage-Qwen3-8B-DPO, por lo que la calidad de las respuestas y su seguridad pueden ser inferiores.
- Contenido dual: el modelo esta entrenado para explicar tecnicas ofensivas y generar comandos de herramientas de ataque, lo que exige controles de acceso, supervision humana y politicas de uso claras en despliegues reales.
- Riesgo de alucinacion: no se han publicado medidas especificas de fidelidad factual en el dominio; TruthfulQA se situa en 47,75, un valor bajo en terminos absolutos.
- Idioma: solo se declara ingles, sin soporte verificado de castellano ni de otras lenguas.
- Licencia no disponible: no se puede confirmar la permisividad para uso comercial ni las obligaciones de atribucion.
- Sesgos: no se documentan evaluaciones de sesgo o toxicidad en la informacion disponible.
- Retrocesos medidos: pierde frente a Qwen3-8B en SECURE (KCV), 81,34 frente a 87,42, y en IFEval, 79,97 frente a 85,21, lo que sugiere una ligera perdida de seguimiento estricto de instrucciones y de conocimiento KCV.
- Repositorio espejo: el identificador consultado (LinHekaka) tiene 0 descargas y 0 likes y no coincide con el autor original (RISys-Lab); conviene verificar la procedencia de los pesos antes de usarlos en produccion.
- Longitud de contexto no confirmada: al no figurar en la informacion, no se puede garantizar el comportamiento en contextos largos ni en conversaciones muy extensas.
- Sin datos de despliegue: no hay mediciones publicadas de latencia, throughput ni comportamiento bajo carga concurrente.

## Enlaces

- Modelo en HuggingFace (copia consultada): https://huggingface.co/LinHekaka/RedSage-Qwen3-8B-Ins
- Modelo original referenciado en la model card: https://huggingface.co/RISys-Lab/RedSage-Qwen3-8B-Ins
- Modelo base (Stage 2): https://huggingface.co/RISys-Lab/RedSage-Qwen3-8B-Base
- Modelo de preentrenamiento continuado (Stage 1): https://huggingface.co/RISys-Lab/RedSage-Qwen3-8B-CFW
- Modelo alineado con DPO (Stage 4): https://huggingface.co/RISys-Lab/RedSage-Qwen3-8B-DPO
- Paper (OpenReview): https://openreview.net/forum?id=W4FAenIrQ2
- Paper (arXiv 2601.22159): https://arxiv.org/abs/2601.22159
- Repositorio GitHub: https://github.com/RISys-Lab/RedSage
- Dataset SmolTalk2: https://huggingface.co/datasets/HuggingFaceTB/smoltalk
- Datasets citados como comentario en la model card: naufalso/redsage_conv y naufalso/smoltalk2_non_thinking
- Busqueda web: no se han encontrado resultados relevantes sobre el modelo; las busquedas devolvieron unicamente contenido no relacionado (Google Maps y la ciudad de Redmond, Washington).
