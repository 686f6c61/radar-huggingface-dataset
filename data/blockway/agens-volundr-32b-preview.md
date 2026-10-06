# Blockway/Agens-Volundr-32B-Preview

## Resumen

Agens Volundr 32B Preview es un modelo de pesos abiertos desarrollado por Blockway, orientado a razonamiento, generacion de codigo y flujos de trabajo con agentes. Se publica como version Preview: segun el autor, la arquitectura, el formato y el pipeline de post-entrenamiento ya son definitivos, pero el pre-entrenamiento continuado sigue en marcha y el checkpoint final de la v1 sustituira a este. El modelo tiene 32.688.700.242 parametros (unos 32,7B) y se distribuye en safetensors bajo licencia Apache 2.0.

La arquitectura no es un transformer denso convencional. Blockway la describe como su propio stack mixer de 72 capas: 54 capas KDA (atencion lineal con gating por canal, con estado de tamano fijo, de modo que una sesion larga no incrementa el coste de memoria por turno), 17 capas BCSA (Blockway Compressed-Sparse Attention, con una ventana densa de 4.096 tokens mas un campo lejano comprimido seleccionado por un indexador aprendido) y una capa de atencion densa. Se anaden dos componentes propios: Engram (memoria condicional basada en n-gramas) y mHC (manifold hyper-connections, con cuatro flujos residuales).

El modelo maneja texto e imagenes (la etiqueta del repositorio es image-text-to-text), soporta llamadas a herramientas mediante tokens de control propios y cubre ingles, chino simplificado, chino tradicional y cantonés. Su relevancia inmediata esta en el nicho de agentes con contexto largo y en el uso de atencion lineal combinada con atencion dispersa como alternativa al coste cuadratico; su punto debil declarado por el propio autor son precisamente las sesiones agenticas largas, donde tiende a entrar en bucles de repeticion. El repositorio acumula 156 descargas y 76 likes desde su publicacion el 3 de octubre de 2026.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Stack propio de 72 capas: 54 capas KDA (atencion lineal con gating por canal), 17 capas BCSA (atencion densa de 4.096 tokens + campo lejano comprimido con indexador aprendido) y 1 capa de atencion densa; incluye Engram (memoria condicional de n-gramas) y mHC (manifold hyper-connections, 4 flujos residuales) |
| Parametros totales | 32.688.700.242 (aprox. 32,7B) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible (la model card no declara la ventana maxima; se documenta una ventana densa de 4.096 tokens dentro de BCSA y la etiqueta long-context) |
| Tipos de cuantizacion | No disponible; solo se documenta ejecucion en bf16. No se publican checkpoints GGUF, AWQ ni GPTQ |
| Idiomas soportados | Ingles (en), chino simplificado y tradicional (zh) y cantonés (yue) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (libreria transformers, requiere custom_code / trust_remote_code) |

## Arquitectura y entrenamiento

El bloque principal es un mixer de 72 capas que combina tres tipos de atencion. La mayoria (54) son capas KDA de atencion lineal con gating por canal: mantienen un estado de tamano fijo, de forma que alargar una sesion no incrementa la memoria por turno. Las 17 capas BCSA combinan una ventana densa de 4.096 tokens con un campo lejano comprimido que se selecciona mediante un indexador aprendido. A esto se suma una unica capa de atencion densa. Sobre ese esqueleto, Blockway incorpora Engram, una memoria condicional basada en n-gramas, y mHC, un esquema de manifold hyper-connections con cuatro flujos residuales. El modelo tambien procesa imagenes, segun la etiqueta image-text-to-text del repositorio y la propia model card.

En cuanto al entrenamiento, la informacion disponible es limitada: el autor indica que se trata de un checkpoint Preview con el pre-entrenamiento todavia en ejecucion y que la version completa v1 continuara el pre-entrenamiento con aproximadamente 10.000 millones de tokens adicionales y anadira entrenamiento sobre sesiones agenticas largas. No se detalla el numero total de tokens consumidos hasta ahora, ni la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se publican detalles del pipeline de post-entrenamiento mas alla de la existencia de un modo de razonamiento (thinking) activado por defecto.

La innovacion mas concreta en el plano de servicio es la gestion del presupuesto de razonamiento: el build de sglang de Blockway anade un parametro `reasoning_budget` por peticion (entero, configurable por defecto con la variable de entorno `VOLUNDR_REASONING_BUDGET`) que cierra el bloque de pensamiento tras N tokens generados, momento en el que el modelo escribe la respuesta visible. Es una solucion de inferencia: los pesos no se modifican. El modelo usa tokens de control reservados (`<|agens_start|>` / `<|agens_end|>` para turnos, `<|think|>` / `<|/think|>` para razonamiento, `<|call|>` / `<|/call|>` para llamadas a herramientas y `<|result|>` / `<|/result|>` para resultados), cada uno con un unico id reservado, de modo que los limites de turno y las llamadas a herramientas no dependen de como se tokenice el texto normal. Si no se proporciona mensaje de sistema, la plantilla inserta: `You are Agens, an AI assistant developed by Blockway.`

## Capacidades

- Generacion de texto conversacional con modo de razonamiento activado por defecto (`enable_thinking: false` lo desactiva) y niveles de esfuerzo configurables mediante `reasoning_effort` (low, medium, xhigh; `high` se acepta como alias).
- Generacion y completado de codigo, con resultados declarados de 81,7 en HumanEval y 63,4 en LiveCodeBench v6.
- Razonamiento matematico y cientifico: 74,6 en AIME 2025, 98,2 en MATH-500 y 81,7 en GPQA Diamond.
- Tool calling / function calling mediante el formato `<function=…><parameter=…>`, expuesto como `tool_calls` de estilo OpenAI por los parsers `agens` del build de sglang del autor.
- Soporte de llamadas a funciones en paralelo (92,0 en BFCL v4 parallel) y de decision de no invocar herramientas (80,8 en BFCL v4 irrelevance).
- Uso agentico multi-turno con herramientas, evaluado en τ²-bench (airline, retail, telecom) con 74,2.
- Entrada multimodal de imagen y texto (image-text-to-text).
- Cobertura multilingue limitada a ingles, chino simplificado y tradicional, y cantonés.
- Presupuesto de razonamiento controlable por peticion para acotar el coste en tokens de pensamiento.
- Seguimiento de instrucciones con formatos estrictos (`prompt strict`): 87,6 en IFEval y 66,3 en IFBench.

## Casos de uso

- Agente de codigo en terminal o IDE: el modelo puede resolver tareas de completado (81,7 en HumanEval) e integrarse en un bucle de agente que invoca herramientas de edicion, ejecucion de tests y control de versiones mediante el formato `<function=…>`, con la salvedad de que en sesiones largas el Preview tiende a repetirse.
- Asistencia en competiciones y practica de programacion: los 63,4 puntos en LiveCodeBench v6 lo situan por delante del modelo de referencia usado en la comparativa del autor, lo que lo hace util para generar soluciones y explicaciones de problemas de tipo competitivo.
- Atencion al cliente en mercados sinofonos: al cubrir chino simplificado, chino tradicional y cantonés, puede gestionar conversaciones multi-turno en esos idiomas y escalar a herramientas internas cuando haga falta consultar pedidos o reservas (escenario equivalente al de τ²-bench airline y retail).
- Automatizacion de back office con function calling: el soporte de llamadas en paralelo (BFCL v4 parallel, 92,0) permite resolver varias consultas a la vez contra APIs internas en un mismo turno.
- Analisis de documentos con imagen y texto: al aceptar entradas image-text-to-text, puede extraer informacion de capturas, diagramas o formularios y combinarla con texto para generar resumenes o respuestas.
- Tutorizacion de matematicas y materias cientificas: con 98,2 en MATH-500 y 74,6 en AIME 2025, es adecuado para resolver problemas paso a paso y justificar el procedimiento, controlando el coste con `reasoning_budget` en lugar de dejar el bloque de pensamiento abierto.
- Extraccion y normalizacion de conocimiento en chino: los 86,5 puntos en CMMLU indican un conocimiento del dominio chino comparable al de los modelos de la comparativa, util para clasificacion, resumen y respuesta sobre corpus en ese idioma.
- Evaluacion interna de agentes: por su soporte explicito de tokens de control de turno, razonamiento y herramienta, sirve como banco de pruebas para arneses de evaluacion agentica que necesiten limites deterministas entre bloques.

## Benchmarks y rendimiento

Los datos siguientes provienen de la model card del autor. Todas las filas se ejecutaron con el mismo arnes, con thinking activado y temperatura 0,6, salvo las excepciones indicadas. Las cifras de Qwen3.8-27B y Agens Pilot fueron obtenidas por Blockway con su propio arnes, no son las publicadas por sus respectivos autores.

| Benchmark | Agens Volundr 32B Preview | Qwen3.8-27B | Agens Pilot |
|---|---|---|---|
| LiveCodeBench v6 (2025-02 a 2025-05), media de 2 ejecuciones | 63,4 | 59,2 | 58,8 |
| HumanEval (completado greedy) | 81,7 | 77,4 | 80,5 |
| SWE-bench Verified, 50 tareas (Codeway) | 44,0 | 58,0 | 64,0 |
| AIME 2025, avg@4, media de 2 ejecuciones | 74,6 | 71,7 | 66,7 |
| MATH-500 | 98,2 | 96,6 | 97,2 |
| CMMLU | 86,5 | 86,4 | 86,1 |
| IFEval (prompt strict) | 87,6 | 88,4 | 85,6 |
| IFBench (prompt strict, reasoning_budget 6000) | 66,3 | 69,3 | 63,0 |
| GPQA Diamond (presupuesto de 6K tokens de pensamiento) | 81,7 | 83,8 | 81,8 |
| MMLU-Pro (subconjunto estratificado de 1.400 preguntas) | 79,9 | 80,4 | 80,3 |
| τ²-bench (airline, retail, telecom) | 74,2 | 79,2 | 80,0 |
| BFCL v4 parallel | 92,0 | 94,0 | 92,0 |
| BFCL v4 irrelevance | 80,8 | 81,7 | 85,8 |

Notas metodologicas declaradas: en GPQA Diamond se aplica un presupuesto de 6K tokens de pensamiento y despues se fuerza la respuesta (Volundr, media de 4 ejecuciones); en τ²-bench se usa el agente a temperatura 0 y Qwen3.8-27B como simulador de usuario para todos los modelos, y las 13 tareas de retail que requieren un juez LLM se puntuan como fallidas para todos; BFCL v4 usa el arnes oficial a temperatura 0,001 sobre categorias no live; MMLU-Pro y CMMLU usan subconjuntos fijos estratificados de 1.400 y 2.010 preguntas; SWE-bench es un subconjunto de 50 tareas de SWE-bench Verified ejecutado con Codeway, el arnes de agente de codigo de Blockway, con el muestreo por defecto de cada modelo y limites identicos. Las respuestas cortadas por el limite de tokens se cuentan como incorrectas.

## Requisitos de hardware

- Peso en bf16: aproximadamente 65,4 GB para los 32.688.700.242 parametros, cifra coherente con el tamano del repositorio (65,4 GB).
- Receta oficial del autor: bf16 en dos GPU de 48 GB con tensor parallel 2 (`--tp-size 2`), backend `flashinfer` y `--page-size 1`, sobre la imagen `ghcr.io/blockwayz/agens-sglang:preview-sm89`, con `--shm-size 32g` e `--ipc=host`.
- GPU de 48 GB compatibles con el requisito de memoria: A6000, L40S y similares; tambien seria viable con dos A100 o H100 de 40/80 GB usando el mismo `tp-size 2`.
- No se documenta ejecucion en una unica GPU de consumo. Con 65,4 GB de pesos en bf16, tarjetas de 24 GB (RTX 4090, RTX 3090) no son suficientes para el checkpoint sin cuantizar.
- No se publican checkpoints cuantizados (GGUF, AWQ, GPTQ), por lo que llama.cpp, Ollama y LM Studio no estan soportados de forma documentada. Estimaciones orientativas calculadas a partir del recuento de parametros, no publicadas por el autor: int8 en torno a 32,7 GB e int4 en torno a 16,3 GB, mas overhead de cache y activaciones.
- Opciones de despliegue documentadas: el build de sglang de Blockway, necesario para los parsers `agens` (que exponen las llamadas como `tool_calls` estilo OpenAI) y para el parametro `reasoning_budget`. No se documenta soporte de vLLM, TGI, TensorRT-LLM ni llama.cpp.
- Latencia y throughput: no disponibles. La model card no publica medidas de tokens por segundo ni de tiempo a primer token.

## Comparativa con modelos similares

La unica comparativa publicada es la del propio autor, con Qwen3.8-27B y Agens Pilot (modelo de la misma casa) ejecutados en el mismo arnes. No se dispone de datos de otros modelos abiertos de tamano similar en la informacion proporcionada.

| Modelo | Parametros | Contexto | Licencia | Datos destacados |
|---|---|---|---|---|
| Agens Volundr 32B Preview | 32,7B | No disponible | Apache 2.0 | Lidera en LiveCodeBench v6 (63,4), HumanEval (81,7), AIME 2025 (74,6) y MATH-500 (98,2); ultimo en SWE-bench Verified (44,0) y τ²-bench (74,2) |
| Qwen3.8-27B | No disponible | No disponible | No disponible | Mejor en SWE-bench Verified (58,0), IFEval (88,4), IFBench (69,3), GPQA Diamond (83,8), MMLU-Pro (80,4), τ²-bench (79,2) y BFCL v4 (94,0 / 81,7) |
| Agens Pilot | No disponible | No disponible | No disponible | Mejor en SWE-bench Verified (64,0), τ²-bench (80,0) y BFCL v4 irrelevance (85,8); tambien es el mas flojo en AIME 2025 (66,7), IFBench (63,0) e IFEval (85,6) |

Salvedades: las cifras de Qwen3.8-27B y Agens Pilot proceden de ejecuciones de Blockway, no de sus publicadores, y no se dispone de parametros, contexto ni licencia de esos dos modelos en la informacion consultada.

## Limitaciones y advertencias

- Es un checkpoint Preview: el autor confirma que el pre-entrenamiento continuado sigue en ejecucion y que la v1 completa reemplazara estos pesos, por lo que no es una base estable para produccion a largo plazo.
- Debilidad declarada en sesiones agenticas largas: Volundr cae a 44,0 en SWE-bench Verified (50 tareas, arnes Codeway) frente a 58,0 de Qwen3.8-27B y 64,0 de Agens Pilot. El propio autor atribuye ese resultado a bucles de repeticion en sesiones prolongadas.
- Por detras de Qwen3.8-27B en seguimiento de instrucciones (IFEval 87,6 frente a 88,4; IFBench 66,3 frente a 69,3), razonamiento cientifico (GPQA Diamond 81,7 frente a 83,8), conocimiento general (MMLU-Pro 79,9 frente a 80,4) y uso de herramientas multi-turno (τ²-bench 74,2 frente a 79,2).
- Con un presupuesto de razonamiento ajustado en problemas dificiles, el autor advierte de que el Preview puede seguir trabajando el problema dentro de la respuesta visible. Recomienda fijar `reasoning_budget` unos miles de tokens por debajo de `max_tokens`.
- Cobertura de idiomas reducida: solo ingles, chino simplificado, chino tradicional y cantonés. No hay datos de rendimiento en castellano ni en otras lenguas.
- Requiere codigo personalizado (`custom_code` / `trust_remote_code`) y, segun la documentacion, el build de sglang de Blockway para los parsers `agens` y el presupuesto de razonamiento. Esto limita la portabilidad a otros runners.
- Riesgo de alucinacion: no se publican tasas de hallucination ni evaluaciones especificas de veracidad. Los benchmarks incluidos miden conocimiento y razonamiento, no factualidad en generacion abierta.
- Sesgos: no se documenta ninguna evaluacion de sesgos, toxicity ni alineacion.
- Licencia Apache 2.0, permisiva y apta para uso comercial, pero se aplica al checkpoint Preview publicado, no a la futura v1.
- Los benchmarks son autopublicados por Blockway con su propio arnes; Qwen3.8-27B y Agens Pilot se midieron con ese mismo arnes y no con las cifras oficiales de sus autores. No hay verificacion independiente disponible.
- El repositorio tiene un volumen de adopcion bajo (156 descargas, 76 likes), lo que reduce la probabilidad de que existan reportes externos de fallos o integraciones ya probadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Blockway/Agens-Volundr-32B-Preview
- Imagen de despliegue del build de sglang del autor: `ghcr.io/blockwayz/agens-sglang:preview-sm89`
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo: los enlaces recuperados corresponden a articulos gramaticales en ingles sobre el uso de "what happen" frente a "what happened" y no guardan relacion con Agens Volundr. No se han encontrado articulos, papers, repositorios ni demos adicionales en la informacion disponible.
