# antdigital-ai/LingDT-Decision-Extract-4B

## Resumen

LingDT-Decision-Extract-4B es un modelo de decisión y extracción de información desarrollado por antdigital-ai, construido sobre el backbone Qwen/Qwen3.5-4B. Su propuesta principal es realizar extracción de información de forma nativa y no autorregresiva: en lugar de generar el texto extraído token a token, el modelo localiza y extrae directamente los spans relevantes del texto fuente a partir de definiciones de campos en lenguaje natural. Además, conserva capacidades de predicción estructurada como Noul, Choice y Score.

El modelo está orientado a tareas de enrutamiento de agentes, extracción de slots, diálogo orientado a tareas y clasificación de opción única, con soporte para inglés y chino. Con 4B parámetros y arquitectura densa, se posiciona como una alternativa compacta frente a modelos generativos de mayor tamaño en tareas de extracción estructurada, donde el autor reporta ventajas notables de F1 frente a baselines generativos.

Su relevancia actual reside en que aborda la extracción de información como un problema de predicción estructurada en lugar de generación libre, lo que según la model card mejora la precisión en el copiado literal de spans y reduce el coste computacional asociado a la decodificación autorregresiva. El repositorio no contiene pesos publicados en el momento de la consulta (tamaño 0.0 GB).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso no autorregresivo (base Qwen3.5-4B) |
| Parametros totales | 4B (según nombre del modelo; no se detalla desglose) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, zh |
| Licencia | no disponible |
| Formato de pesos | no disponible (repo de 0.0 GB, sin pesos publicados) |

## Arquitectura y entrenamiento

El modelo parte del backbone Qwen/Qwen3.5-4B, un transformer denso de 4B parámetros, y se especializa mediante fine-tuning para predicción estructurada no autorregresiva. La innovación central es el tratamiento de la extracción de información como una tarea de localización de spans guiada por definiciones de campo en lenguaje natural, en lugar de una generación secuencial de tokens. Esto permite extraer directamente fragmentos del texto fuente y, según el autor, mejora la fidelidad del copiado y la eficiencia en comparación con baselines generativos.

El modelo conserva además las capacidades de decisión estructurada del linaje LingDT (Noul, Choice, Score), lo que lo hace apto tanto para extracción como para clasificación de opción única. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO.

## Capacidades

- Extracción de información nativa no autorregresiva: localiza y extrae spans directamente del texto fuente a partir de definiciones de campos en lenguaje natural.
- Predicción de opción única (single-choice) con una precisión macro reportada del 80,94 % en 15 benchmarks.
- Decisión estructurada mediante Noul, Choice y Score.
- Soporte de extracción de slots en diálogo orientado a tareas (RiSAWOZ, SGD, ATIS, Snips).
- Extracción de información financiera (FinSlot).
- Extracción de argumentos de eventos (DuEE).
- Robustez ante ruido de reconocimiento automático de voz (CATSLU-ASR).
- Capacidades multilingües limitadas a inglés y chino.
- Enrutamiento de agentes (agent-routing) como caso de uso declarado en las etiquetas.

## Casos de uso

- Extracción de campos estructurados en documentos financieros: el modelo puede recibir definiciones de campos (importe, entidad, fecha) y localizar los spans correspondientes en el texto, con un F1 de 85,50 en FinSlot según el autor.
- Enrutamiento de agentes y clasificación de intenciones: dado un turno de usuario, el modelo predice la opción o ruta adecuada entre un conjunto cerrado, con 90,16 de precisión en BANKING77-3080.
- Extracción de slots en asistentes de diálogo: integrable en pipelines de NLU para rellenar slots de sistemas task-oriented con 84,60 F1 en RiSAWOZ_id.
- Procesamiento de transcripciones ASR: extracción robusta ante errores de reconocimiento, con 81,23 F1 en CATSLU-ASR.
- Extracción de argumentos de eventos para monitorización de noticias: identificación de roles y participantes en textos informativos (54,01 F1 en DuEE).
- Clasificación de opción única en evaluación de modelos y tareas de decisión: selección de la respuesta correcta entre alternativas con 80,94 % de precisión macro.
- Extracción multilingüe inglés-chino en dominios de voz y texto: cobertura de MASSIVE-en (68,21 F1) y MASSIVE-zh (77,84 F1).

## Benchmarks y rendimiento

Resultados de extracción de información (F1, evaluación interna del autor):

| Benchmark | LingDT-Decision-Extract-4B | Qwen-4B (generativo) | Qwen-27B (generativo) | scaledown-Extract |
|---|---:|---:|---:|---:|
| SGD | 73,07 | 74,51 | 94,53 | 73,60 |
| ATIS | 83,50 | 35,34 | 65,28 | 45,54 |
| Snips | 83,64 | 21,38 | 31,15 | 15,15 |
| FinSlot | 85,50 | 41,90 | 54,15 | 37,88 |
| MASSIVE-en | 68,21 | 35,42 | 52,82 | 49,57 |
| MASSIVE-zh | 77,84 | 39,80 | 63,43 | 49,69 |
| DuEE | 54,01 | 42,69 | 57,70 | 50,78 |
| CATSLU | 82,33 | 52,98 | 78,55 | 42,80 |
| CATSLU-ASR | 81,23 | 52,98 | 77,88 | 42,71 |
| RiSAWOZ_id | 84,60 | 64,03 | 75,20 | 59,39 |
| **Macro F1** | **77,39** | **46,10** | **65,07** | **46,71** |
| **Micro F1** | **74,76** | 52,42 | 70,46 | 65,44 |

Resultados de opción única (precisión, 15 benchmarks): el modelo obtiene un 80,94 % de precisión macro, con valores destacados en SemIf-144 (91,67), BANKING77-3080 (90,16), Nimble-282 (90,43) y TypeSafe-102 (89,22).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; como referencia orientativa, un modelo denso de 4B requiere del orden de 8-9 GB en FP16 y 3-4 GB en cuantización de 4 bits, aunque el autor no publica cifras.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: previsiblemente sí en GPUs con 8-16 GB de VRAM según cuantización, aunque no confirmado por el autor.
- Opciones de despliegue: no disponible; el repositorio no incluye pesos ni instrucciones de inferencia.
- Latencia y throughput: no disponibles; la naturaleza no autorregresiva podría reducir el coste de decodificación, pero no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Macro F1 (extracción) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LingDT-Decision-Extract-4B | 4B | no disponible | 77,39 | no disponible | repo sin pesos (0.0 GB) |
| Qwen3.5-4B (generativo) | 4B | no disponible | 46,10 | no disponible | disponible en HF |
| Qwen-27B (generativo) | 27B | no disponible | 65,07 | no disponible | no disponible en la información |
| scaledown-Extract | no disponible | no disponible | 46,71 | no disponible | no disponible |

El modelo supera a los baselines generativos comparados en Macro F1 de extracción, con una ventaja de 31,29 puntos sobre Qwen-4B y 12,32 sobre Qwen-27B, según la evaluación interna del autor.

## Limitaciones y advertencias

- El repositorio no contiene pesos publicados (tamaño de 0.0 GB), por lo que el modelo no es desplegable en el momento de la consulta.
- La licencia no está especificada, lo que impide evaluar su uso comercial.
- Los benchmarks son de evaluación interna del autor y no han sido verificados de forma independiente.
- El soporte lingüístico se limita a inglés y chino; no hay evidencia de rendimiento en castellano.
- El rendimiento en SGD (73,07) es inferior al de Qwen-4B generativo (74,51) y muy inferior a Qwen-27B (94,53), lo que indica que la ventaja no es uniforme en todos los dominios.
- Riesgo de alucinación y sesgos: no documentado en la información disponible.
- Longitud de contexto no especificada, lo que limita la planificación de casos con documentos largos.
- No se detallan los datos de entrenamiento ni posibles sesgos de dominio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/antdigital-ai/LingDT-Decision-Extract-4B
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
