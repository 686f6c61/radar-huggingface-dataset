# M1n1A1/MiniAI-Quata2-9b

## Resumen

MiniAI Quata2 9B es un ajuste fino del modelo Qwen3.5-9B desarrollado por M1n1A1 (MiniAI, Belgrado), orientado a razonamiento, seguimiento de instrucciones, uso de herramientas y codigo, con especial enfasis en serbio y las lenguas del espacio serbocroata (sr, hr, bs). El modelo parte de los pesos de Qwen3.5-9B y aplica un fine-tune con LoRA sobre un conjunto de instrucciones propio (27.000 conversaciones, 9,4 millones de tokens entrenados), seguido de aprendizaje por refuerzo con GRPO sobre respuestas verificables automaticamente. El resultado se fusiona 80/20 con el modelo base en el espacio de pesos para preservar el conocimiento original.

El modelo declara una media de 81,8 en su conjunto de evaluacion de referencia, frente a 80,1 de Qwen3.5-9B y 77,5 de su predecesor Quata2 4B v0.3. Sus mejoras mas notables se concentran en IFEval (+6,5), tool calling BFCL (+3,8), MATH-500 (+3,4), GSM8K (+3,0) y codigo combinado HumanEval+/MBPP+ (+3,1). Mantiene el rendimiento del base en MMLU, ARC-Challenge y HellaSwag, y refuerza el rendimiento en serbio, con mejoras en Belebele Serbian y Serbian LLM Eval.

Con 9.653.104.368 parametros, licencia Apache 2.0 y cuantizacion Q4_K_M de aproximadamente 5,8 GB, el modelo esta pensado para ejecutarse en una unica GPU de 8 GB, lo que lo situa en la franja de modelos de 9B desplegables en hardware de consumo. Su propuesta de valor es un ajuste afinado con RL verificable que mejora instrucciones, matematicas y agentes sin sacrificar el conocimiento del base, con soporte reforzado de serbio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3.5-9B), con fine-tune LoRA y GRPO |
| Parametros totales | 9.653.104.368 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | GGUF (incluye Q4_K_M, cuantizado con importance matrix); safetensors en precision completa |
| Idiomas soportados | en, sr, hr, bs |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only heredado de Qwen3.5-9B, sin cambios estructurales en la arquitectura. El proceso de entrenamiento consta de tres fases. Primero, un fine-tune con LoRA de rango 16 sobre el conjunto de instrucciones Quata2 (27.000 conversaciones, 9,4 millones de tokens: chat en ingles y serbio, herramientas, identidad, razonamiento), durante 2 epocas con learning rate 5e-5. El resultado se mezcla 80/20 con Qwen3.5-9B mediante un ensemble en el espacio de pesos para conservar el conocimiento del base. No se realizo preentrenamiento continuado en serbio, ya que en la version 4B este paso perjudicaba mas los benchmarks generales de lo que mejoraba el serbio.

La segunda fase construye el conjunto de prompts para RL a partir de un pool descontaminado (restricciones de seguimiento de instrucciones, matematicas con respuesta final conocida, codigo con tests unitarios). De los 1.445 prompts que el modelo 4B no resolvia de forma consistente, el 9B respondio cada uno 4 veces y se conservaron los 590 en los que las respuestas obtuvieron puntuaciones distintas (385 de instrucciones, 106 de codigo, 99 de matematicas). La tercera fase aplica GRPO durante 600 pasos, con 2 prompts x 8 respuestas por paso, LoRA de rango 32, learning rate 2e-5, modo thinking desactivado, respuestas de hasta 640 tokens y sin penalizacion KL. Cada respuesta se puntua con su checker correspondiente y las respuestas truncadas por el limite de longitud se excluyen de la perdida. El entrenamiento completo consumio aproximadamente 17 horas en una RTX 4060 Ti de 8 GB, y el adaptador LoRA se fusiono en los pesos completos.

## Capacidades

- Generacion de texto conversacional en ingles y serbio (con cobertura de croata y bosnio).
- Razonamiento matematico y resolucion de problemas con respuesta verificable (GSM8K, MATH-500).
- Generacion de codigo en Python con validacion mediante tests unitarios (HumanEval+, MBPP+).
- Tool calling y function calling, con soporte de tareas de un solo paso y multi-paso (BFCL).
- Comportamiento agentico: resolucion de tareas reales con herramientas del sitio web de MiniAI (93,4% en tareas de un paso, 91,2% en multi-paso).
- Seguimiento estricto de instrucciones con restricciones (IFEval strict).
- Identidad de modelo consistente: se identifica como Quata2 sin system prompt el 94,4% de las veces y mantiene personas de cliente el 100% de las veces.
- Capacidad de rechazar premisas falsas y corregir errores cuando se le desafia.
- Capacidad de vision heredada del pipeline image-text-to-text del modelo base (etiqueta del repo), si bien no se detallan evaluaciones multimodales en la informacion disponible.
- Modo thinking desactivado en los benchmarks publicados; no se documenta el comportamiento con thinking activado.

## Casos de uso

- Atencion al cliente automatizada en serbio y lenguas del espacio serbocroata: el modelo mantiene personas de cliente el 100% de las veces y no menciona su identidad de forma no solicitada, lo que lo hace adecuado para agentes conversacionales con prompt de sistema.
- Agentes con tool calling en produccion: con un 92,4% en BFCL y un 93,4% en tareas reales de un solo paso sobre las herramientas de MiniAI, puede integrarse en flujos de orquestacion que requieran invocar APIs, consultar bases de datos o ejecutar acciones.
- Razonamiento matematico asistido: con 92,6% en GSM8K y 87,0% en MATH-500, es util para tutoria, verificacion de calculos y generacion de soluciones paso a paso en entornos educativos o financieros.
- Generacion y revision de codigo en pipelines de CI/CD: con 89,6% en HumanEval+ y capacidad de tool calling, puede integrarse en revisiones automatizadas, generacion de tests y correccion de parches.
- Procesamiento de documentacion multilingue en serbio, croata y bosnio: el modelo mejora al base en Belebele Serbian (91,6%) y Serbian LLM Eval (82,7%), lo que lo hace adecuado para clasificacion, extraccion y resumen de textos en esas lenguas.
- Despliegue en hardware de consumo: con ~5,8 GB en Q4_K_M, puede ejecutarse en una RTX 4060 Ti de 8 GB para prototipado local, asistentes de escritorio o entornos sin acceso a GPU de datacenter.
- Evaluacion de instrucciones con restricciones: con 90,3% en IFEval strict, es adecuado para tareas que exigen formatos estrictos, como generacion de JSON, plantillas o respuestas con campos obligatorios.

## Benchmarks y rendimiento

Resultados publicados por el autor con thinking desactivado, Q4_K_M GGUF sobre llama.cpp, sin system prompt, mismo harness para todos los modelos. La marca de verificacion indica victoria real frente a Qwen3.5-9B (mas alla de 2 errores estandar, emparejado por pregunta).

| Benchmark | Quata2 9B | Qwen3.5 9B | Quata2 4B v0.3 | Qwen3.5 4B |
|---|---:|---:|---:|---:|
| MMLU | 77,6 | **80,0** | 71,8 | 70,6 |
| MMLU-Pro | **74,0** | 72,3 | 71,3 | 71,3 |
| GPQA Diamond | **54,0** | 49,5 | 51,0 | 37,4 |
| ARC-Challenge | 94,8 | **95,0** | 92,6 | 92,4 |
| HellaSwag | 91,8 | **92,4** | 86,4 | 86,0 |
| TruthfulQA (MC1) | **77,8** | 77,6 | 70,2 | 73,0 |
| GSM8K (victoria real) | **92,6** | 89,6 | 89,4 | 86,6 |
| MATH-500 (victoria real) | **87,0** | 83,6 | 83,4 | 80,2 |
| IFEval strict (victoria real) | **90,3** | 83,8 | 85,5 | 82,3 |
| BFCL tool calling (victoria real) | **92,4** | 88,6 | 89,9 | 85,2 |
| HumanEval+ | **89,6** | 86,6 | 79,3 | 75,6 |
| MBPP+ | 66,7 | 63,5 | **67,7** | 64,8 |
| Belebele Serbian | **91,6** | 90,2 | 87,8 | 84,6 |
| Global-MMLU Serbian | 64,2 | **67,0** | 58,6 | 58,4 |
| Serbian LLM Eval (generativo) | **82,7** | 82,4 | 77,4 | 78,2 |
| **Media** | **81,8** | 80,1 | 77,5 | 75,1 |

Serbian LLM Eval (suite de YugoGPT, log-likelihood, 7 tareas x 500 preguntas, 4 bits):

| Tarea | Quata2 9B | Qwen3.5 9B | YugoGPT 7B | Quata2 4B v0.2 |
|---|---:|---:|---:|---:|
| ARC-Challenge | **49,4** | 48,4 | 41,0 | 43,0 |
| ARC-Easy | **72,2** | 69,6 | 60,6 | 66,4 |
| BoolQ | 83,6 | 82,2 | 67,2 | **84,4** |
| HellaSwag | 60,0 | 59,6 | **69,2** | 54,0 |
| OpenBookQA | 41,8 | 41,6 | **43,2** | 37,0 |
| PIQA | 68,8 | 69,4 | **75,0** | 67,8 |
| Winogrande | 59,8 | 60,8 | **67,6** | 60,2 |
| **Media** | **62,2** | 61,7 | 60,5 | 59,0 |

Comprobaciones propias de Quata (conjuntos pequenos, orientativos):

| Comprobacion | Quata2 9B | Qwen3.5 9B | Quata2 4B v0.3 | Items |
|---|---:|---:|---:|---:|
| Sabe que es Quata2 (sin system prompt) | 94,4 | 0,0 | **100,0** | 36 |
| Nunca se menciona sin que se le pregunte | **100,0** | 98,0 | **100,0** | 300 |
| Mantiene persona de cliente | **100,0** | 99,0 | **100,0** | 100 |
| Rechaza premisa falsa | **100,0** | 75,0 | **100,0** | 4 |
| Corrige un error real al ser desafiado | **92,5** | 90,0 | 87,5 | 40 |
| Mantiene respuesta correcta bajo presion | 50,0 | 60,0 | **90,0** | 20 |
| Sabe donde estan las empresas | **91,7** | **91,7** | **91,7** | 12 |
| Datos sobre Serbia | **87,5** | **87,5** | 50,0 | 8 |

## Requisitos de hardware

- VRAM estimada: aproximadamente 5,8 GB en cuantizacion Q4_K_M; el modelo completo en safetensors ocupa 25,1 GB de repositorio.
- GPU recomendadas: una RTX 4060 Ti de 8 GB es suficiente para Q4_K_M; para precision completa se requiere una GPU con 24 GB o mas (RTX 4090, A100 40 GB, H100).
- Cabe en GPU de consumo: si, en tarjetas de 8 GB o mas con cuantizacion Q4_K_M.
- Opciones de despliegue: llama.cpp (usado en los benchmarks del autor con GGUF), transformers (libreria declarada), y por compatibilidad de formato GGUF, teoricamente Ollama y vLLM; no se confirma soporte explicito de TGI en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Entrenamiento: el autor indica que el modelo se entreno en una unica RTX 4060 Ti de 8 GB, con aproximadamente 17 horas para la fase GRPO.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Media en suite del autor | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniAI Quata2 9B | 9,65 B | no disponible | 81,8 | Apache 2.0 | Hugging Face |
| Qwen3.5-9B | 9 B (aprox.) | no disponible | 80,1 | no disponible en la informacion | Hugging Face |
| MiniAI Quata2 4B v0.3 | 4 B (aprox.) | no disponible | 77,5 | no disponible en la informacion | Hugging Face |
| Qwen3.5-4B | 4 B (aprox.) | no disponible | 75,1 | no disponible en la informacion | Hugging Face |
| YugoGPT 7B | 7 B (aprox.) | no disponible | 60,5 (suite serbia) | no disponible en la informacion | Hugging Face |

Quata2 9B supera a su base Qwen3.5-9B en la media de la suite propia (81,8 frente a 80,1) con 5 victorias reales y 0 perdidas reales, y queda por delante de Quata2 4B v0.3 y Qwen3.5-4B. Frente a YugoGPT 7B, especializado en serbio, Quata2 9B es claramente superior en lectura y razonamiento en serbio (BoolQ +16,4, ARC-Easy +11,6, ARC-Challenge +8,4) pero inferior en tareas de completado de frases naturales (HellaSwag, PIQA, Winogrande); la diferencia de medias (+1,7) queda dentro del margen (±2,2).

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos especificos en la informacion proporcionada; al derivar de Qwen3.5-9B, hereda los sesgos del modelo base.
- Riesgo de alucinacion: el modelo mantiene una respuesta correcta bajo presion solo el 50% de las veces, frente al 60% de Qwen3.5-9B y el 90% de Quata2 4B v0.3, lo que indica menor robustez ante contraargumentacion.
- Limitaciones de contexto: la longitud de contexto no se especifica en la informacion disponible; conviene verificarla antes de usos con ventanas largas.
- Limitaciones de idioma: solo se declaran en, sr, hr y bs; no hay evaluacion publicada en castellano ni en otras lenguas.
- Rendimiento inferior al base en MMLU (77,6 frente a 80,0) y Global-MMLU Serbian (64,2 frente a 67,0), por lo que en conocimiento general enciclopedico el base puede ser preferible.
- Datos de benchmarks generados por el propio autor con su harness y sus prompts; no hay verificacion independiente en la informacion disponible.
- Algunas comprobaciones propias se basan en conjuntos muy pequenos (por ejemplo, 4 items para la prueba de premisa falsa), por lo que deben interpretarse como orientativas.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar las condiciones del modelo base Qwen3.5-9B, cuya licencia no se detalla en la informacion proporcionada.
- El modelo se entreno con thinking desactivado y respuestas de hasta 640 tokens; no se documenta su comportamiento en modo thinking ni en generaciones muy largas.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema y validacion comunitaria practicamente inexistentes.

## Enlaces

- Hugging Face: https://huggingface.co/M1n1A1/MiniAI-Quata2-9b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Predecesor Quata2 4B v0.3: https://huggingface.co/M1n1A1/MiniAI-Quata2-4b-v0.3
- No se han encontrado en la informacion proporcionada enlaces adicionales a papers, blogs, repositorios o demos.
