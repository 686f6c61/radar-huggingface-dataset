# Blockway/Agens-Volundr-32B-Preview

## Resumen

Agens Volundr 32B Preview es un modelo de pesos abiertos desarrollado por Blockway, orientado a razonamiento, generacion de codigo y flujos de trabajo con agentes. Se trata de un checkpoint de vista previa cuyo pipeline de post-entrenamiento y formato ya estan cerrados, pero cuyo pre-entrenamiento continuado sigue en marcha; la version completa v1 lo sustituye. El modelo combina texto e imagen como entrada (pipeline image-text-to-text) y declara soporte para ingles, chino simplificado, chino tradicional y cantonés.

La arquitectura no es un transformer denso convencional: emplea una pila de mezcladores propia de Blockway con 72 capas, de las cuales 54 son KDA (atencion lineal con compuerta por canal y estado de tamano fijo), 17 son BCSA (atencion dispersa comprimida con ventana densa de 4.096 tokens y campo lejano seleccionado por un indexador aprendido) y una es de atencion densa. Incorpora ademas Engram (memoria condicional de n-gramas) y mHC (hyper-connections de variedad, cuatro flujos residuales). El total de parametros reales segun safetensors es de 32.688.700.242.

Su relevancia actual radica en dos factores: por un lado, propone una pila de atencion hibrida que reduce el coste de memoria por turno en sesiones largas gracias al estado fijo de KDA; por otro, publica una tabla de benchmarks ejecutada con un mismo arnes sobre modelos comparables, con resultados competitivos en codigo y matematicas, aunque reconoce debilidades en tareas agenticas de larga duracion. La licencia Apache 2.0 y el formato safetensors facilitan su adopcion en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida propietaria: 72 capas (54 KDA de atencion lineal con compuerta por canal, 17 BCSA de atencion dispersa comprimida con ventana densa de 4.096 tokens, 1 capa de atencion densa), con Engram (memoria condicional de n-gramas) y mHC (hyper-connections de variedad, 4 flujos residuales) |
| Parametros totales | 32.688.700.242 |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible como cifra explicita; la ventana densa de BCSA es de 4.096 tokens y KDA mantiene estado de tamano fijo |
| Tipos de cuantizacion | no disponible en este Preview; la version v1 anuncia INT4 y GGUF |
| Idiomas soportados | en, zh (simplificado y tradicional), yue (cantonés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers, requiere custom_code) |

## Arquitectura y entrenamiento

El modelo se apoya en una pila de mezcladores disenada por Blockway. Las 54 capas KDA implementan atencion lineal con compuerta por canal: mantienen un estado de tamano fijo, de modo que una sesion larga no incrementa el coste de memoria por turno. Las 17 capas BCSA combinan una ventana densa de 4.096 tokens con un campo lejano comprimido seleccionado mediante un indexador aprendido, lo que permite cubrir dependencias largas sin atencion cuadratica completa. Se anade una unica capa de atencion densa y dos mecanismos auxiliares: Engram, una memoria condicional de n-gramas, y mHC, con cuatro flujos residuales.

El formato de chat emplea tokens de control propios de Blockway, cada uno con un id reservado unico: `<|agens_start|>` / `<|agens_end|>` para turnos, `<|think|>` … `<|/think|>` para razonamiento, `<|call|>` … `<|/call|>` para llamadas a herramientas y `<|result|>` … `<|/result|>` para resultados de herramientas. Esto evita que los limites de turno, el razonamiento o las llamadas dependan de la tokenizacion del texto ordinario. El pensamiento esta activado por defecto (`enable_thinking: false` lo desactiva) y `reasoning_effort` acepta low / medium / xhigh (por defecto xhigh; `high` es alias). El modelo card indica que el pre-entrenamiento continuado seguira hasta aproximadamente 10.000 millones de tokens adicionales y que la v1 incorporara entrenamiento sobre sesiones agenticas largas; no se detalla la composicion del dataset ni el uso de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional en ingles, chino simplificado, chino tradicional y cantonés.
- Entrada multimodal de texto e imagen (pipeline image-text-to-text).
- Razonamiento con modo de pensamiento activado por defecto y control de esfuerzo (low / medium / xhigh).
- Presupuesto de razonamiento por peticion (`reasoning_budget`) en el build de sglang de Blockway, que cierra el bloque de pensamiento tras N tokens generados.
- Generacion y completado de codigo, con resultados destacados en HumanEval y LiveCodeBench v6.
- Llamada a herramientas y function calling mediante la forma `<function=…><parameter=…>`, expuesta como `tool_calls` estilo OpenAI por los parsers `agens`.
- Llamadas a funciones en paralelo (BFCL v4 parallel) y deteccion de irrelevancia para no invocar herramientas innecesariamente.
- Uso en agentes multi-turno con herramientas (evaluado en τ²-bench en dominios de aerolinea, retail y telecom).
- Razonamiento matematico de competicion (AIME 2025, MATH-500) y conocimiento cientifico (GPQA Diamond).
- Continuacion de sesion y memoria de estado fijo por turno gracias a las capas KDA.

## Casos de uso

- Generacion de codigo en produccion: el modelo obtiene 81,7 en HumanEval y 63,4 en LiveCodeBench v6, por lo que es adecuado para autocompletado y sintesis de funciones en pipelines de CI/CD, integrado via sglang con los parsers `agens`.
- Asistente de razonamiento matematico: con 98,2 en MATH-500 y 74,6 en AIME 2025 (avg@4), sirve para tutoria o verificacion de problemas de competicion, ajustando `reasoning_effort` y `reasoning_budget` segun la dificultad.
- Agente de atencion al cliente multi-turno: soporta tool calling y llamadas en paralelo (92,0 en BFCL v4 parallel), lo que permite consultar sistemas de reservas o pedidos en dominios como aerolinea, retail y telecom.
- Automatizacion de tareas con herramientas en paralelo: la capacidad de emitir varias llamadas simultaneas y de abstenerse cuando la herramienta es irrelevante (80,8 en BFCL v4 irrelevance) encaja en orquestadores de agentes que deben decidir cuando no actuar.
- Procesamiento de documentos con imagen: al aceptar entrada image-text-to-text, puede extraer y razonar sobre contenido de capturas, formularios o diagramas junto con texto.
- Atencion a mercados sinofonos: el soporte nativo de chino simplificado, tradicional y cantonés (86,5 en CMMLU) lo hace util para asistentes y moderacion de contenido en estas variantes.
- Sesiones largas con coste de memoria estable: el estado fijo de las capas KDA evita que el consumo por turno crezca con la longitud de la conversacion, lo que resulta adecuado para agentes persistentes, aunque el modelo card advierte de bucles de repeticion en sesiones agenticas largas en este Preview.

## Benchmarks y rendimiento

Resultados publicados por el autor, ejecutados con el mismo arnes para todas las filas. Las filas sin marca triangular son aquellas en las que este Preview queda por detras de Qwen3.8-27B.

| Benchmark | Agens Volundr 32B Preview | Qwen3.8-27B | Agens Pilot |
|---|---|---|---|
| LiveCodeBench v6 (2025-02 a 2025-05), media de 2 ejecuciones | 63,4 (+4,2) | 59,2 | 58,8 |
| HumanEval (completado greedy) | 81,7 (+4,3) | 77,4 | 80,5 |
| SWE-bench Verified, 50 tareas (Codeway) | 44,0 | 58,0 | 64,0 |
| AIME 2025, avg@4, media de 2 ejecuciones | 74,6 (+2,9) | 71,7 | 66,7 |
| MATH-500 | 98,2 (+1,6) | 96,6 | 97,2 |
| CMMLU (subconjunto estratificado de 2.010 preguntas) | 86,5 (+0,1) | 86,4 | 86,1 |
| IFEval (prompt strict) | 87,6 | 88,4 | 85,6 |
| IFBench (prompt strict) | 66,3 | 69,3 | 63,0 |
| GPQA Diamond (presupuesto de 6K tokens de pensamiento) | 81,7 | 83,8 | 81,8 |
| MMLU-Pro (subconjunto de 1.400 preguntas) | 79,9 | 80,4 | 80,3 |
| τ²-bench (airline, retail, telecom) | 74,2 | 79,2 | 80,0 |
| BFCL v4 parallel | 92,0 | 94,0 | 92,0 |
| BFCL v4 irrelevance | 80,8 | 81,7 | 85,8 |

Condiciones declaradas: pensamiento activado, temperatura 0,6 y el mismo limite de tokens de salida para todos los modelos salvo que se indique lo contrario; las respuestas truncadas por el limite cuentan como incorrectas. GPQA Diamond usa un presupuesto de 6K tokens de pensamiento y luego fuerza la respuesta (Volundr: media de 4 ejecuciones). τ²-bench se ejecuta con temperatura 0 y Qwen3.8-27B como simulador de usuario para todos los modelos; las 13 tareas de retail que requieren un juez LLM se puntuan como fallidas para todos. BFCL v4 usa el arnes oficial a temperatura 0,001. MMLU-Pro y CMMLU emplean subconjuntos estratificados fijos. Qwen3.8-27B y Agens Pilot fueron ejecutados por Blockway en el mismo arnes, no son cifras de sus publicadores.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Con 32.688.700.242 parametros, en bf16 el peso requiere aproximadamente 65,4 GB (coincide con el tamano del repo), por lo que no cabe en GPU de consumo individual a esa precision.
- Cuantizaciones: este Preview no publica builds INT4 ni GGUF; la version v1 anuncia INT4, GGUF, un drafter y un build Engine de 16 GB.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por volumen de pesos en bf16 se requiere un acelerador con al menos 80 GB de memoria (A100 80 GB, H100 80 GB) o configuracion multi-GPU.
- GPU de consumo: no cabe en una RTX 4090 (24 GB) en bf16; no se documentan alternativas cuantizadas para este checkpoint.
- Opciones de despliegue: el modelo card indica que Volundr se ejecuta sobre el build de sglang de Blockway (clase de modelo, parsers `agens` y `reasoning_budget`). La libreria declarada es transformers con `custom_code`. No se mencionan llama.cpp, Ollama ni TGI para este Preview.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas de rendimiento |
|---|---|---|---|---|---|
| Agens Volundr 32B Preview | 32,69 B | no disponible (ventana densa BCSA de 4.096 tokens) | Apache 2.0 | Pesos abiertos en Hugging Face | 63,4 LiveCodeBench v6; 81,7 HumanEval; 74,6 AIME 2025; 44,0 SWE-bench Verified (50 tareas) |
| Qwen3.8-27B | no disponible | no disponible | no disponible | no disponible en la informacion | 59,2 LiveCodeBench v6; 77,4 HumanEval; 71,7 AIME 2025; 58,0 SWE-bench Verified (50 tareas); 88,4 IFEval |
| Agens Pilot | no disponible | no disponible | no disponible | no disponible en la informacion | 58,8 LiveCodeBench v6; 80,5 HumanEval; 66,7 AIME 2025; 64,0 SWE-bench Verified (50 tareas); 80,0 τ²-bench |

## Limitaciones y advertencias

- Checkpoint Preview: el pre-entrenamiento continuado sigue en marcha y la version v1 lo sustituye; no se recomienda fijar este repositorio como dependencia estable de produccion.
- Debilidad declarada en sesiones agenticas largas: el modelo card senala caidas en bucles de repeticion, con 44,0 en SWE-bench Verified frente a 58,0 de Qwen3.8-27B y 64,0 de Agens Pilot.
- Queda por detras en instrucciones (IFEval 87,6 frente a 88,4; IFBench 66,3 frente a 69,3), GPQA Diamond (81,7 frente a 83,8), MMLU-Pro (79,9 frente a 80,4) y τ²-bench (74,2 frente a 79,2).
- Riesgo de alucinacion: no se documenta una evaluacion especifica de veracidad en la informacion disponible.
- Sesgos conocidos: no se detallan en la model card.
- Cobertura idiomatica limitada a ingles, chino simplificado, chino tradicional y cantonés; no se declara soporte de castellano.
- Con un `reasoning_budget` ajustado, el modelo puede seguir trabajando el problema en la respuesta visible en lugar de cerrar el razonamiento.
- Requiere el build de sglang de Blockway para aprovechar parsers `agens` y `reasoning_budget`; con transformers es necesaria la carga con `custom_code`.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar los terminos del repositorio y de las dependencias del build de sglang.
- No se publican cifras de contexto maximo, cuantizaciones ni requisitos de hardware para este Preview, lo que complica el dimensionamiento previo al despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Blockway/Agens-Volundr-32B-Preview
- Version completa v1: https://huggingface.co/Blockway/Agens-Volundr-32B-v1
- No se han encontrado en la informacion proporcionada otros enlaces a papers, blogs, repositorios o demos.
