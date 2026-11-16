# am17an/Qwen3.5-9B-toolcall-preview-GGUF

## Resumen

Qwen3.5-9B-toolcall-preview es un ajuste fino mediante LoRA del modelo Qwen/Qwen3.5-9B, publicado por el desarrollador independiente Aman Gupta (usuario am17an) en Hugging Face. El objetivo del ajuste es especializar al modelo base en la invocacion de herramientas y habilidades de una aplicacion asistente on-device, es decir, en tool calling y function calling dentro de un harness concreto. El autor lo describe explicitamente como un checkpoint de investigacion (9b-v5s1), no como un modelo de publicacion estable.

La relevancia del modelo radica en su enfoque de destilacion: los datos de entrenamiento se generaron a partir de las respuestas de un modelo profesor mayor, Qwen3.8-27B, ejecutandose en el entorno real de la aplicacion con el modo de razonamiento (thinking) activado. El resultado es un modelo de aproximadamente 8.950 millones de parametros (8,953,803,264 segun los pesos en safetensors) que, segun el autor, mejora de forma notable el rendimiento del base en episodios multiturno con herramientas: del 38,4% al 60,0% en su evaluacion principal.

El repositorio distribuye unicamente pesos en formato GGUF, con una cuantizacion Q4_K_M generada mediante importance matrix. El modelo conserva el modo thinking del profesor y esta pensado para ejecutarse con llama-server usando plantilla Jinja. No se dispone de informacion sobre licencia ni sobre idiomas soportados en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-9B); no se detalla en la model card |
| Parametros totales | 8.953.803.264 (~8,95B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el entrenamiento uso secuencias de hasta 12.288 tokens) |
| Tipos de cuantizacion | Q4_K_M con importance matrix (unica publicada); el autor menciona exportaciones Q4_K_M planas solo para evaluacion |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | GGUF (repo con tags gguf y safetensors; el artefacto recomendado es GGUF) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-9B y aplica un adaptador LoRA de rango 32, alpha 64 y dropout 0,05 sobre todas las capas lineales, con 86,6 millones de parametros entrenables. El entrenamiento uso AdamW con learning rate 1e-4, schedule coseno con aproximadamente un 3% de warmup, 4 micro-lotes de 16.384 tokens por paso y longitud maxima de 12.288 tokens. Se realizo una unica epoca sobre 20.436 muestras (1.964 pasos, semilla 1), con perdida calculada solo sobre el turno que se estaba ensenando, en 95 minutos sobre 4 GPU B300.

La innovacion principal esta en la construccion del dataset: cada prompt es exactamente el que llama.cpp renderiza antes de ese turno, incluyendo el system prompt y las herramientas de la aplicacion, y el objetivo es el thinking del profesor Qwen3.8-27B mas el turno correspondiente. Los datos single-turn de herramientas suman 7.112 muestras provenientes de 2.762 conversaciones donde el profesor supero todas las comprobaciones. La cuantizacion publicada se genero con llama-imatrix sobre 715 fragmentos de 512 tokens (8 prompts completos con system prompt y herramientas, mas ultimos turnos y objetivos de 300 muestras aleatorias) y llama-quantize sobre el merge en bf16 del adaptador con Qwen/Qwen3.5-9B revision c2022362. El modelo se convirtio con `convert_hf_to_gguf.py --no-mtp`, por lo que no dispone de cabeza MTP ni puede usar decodificacion especulativa MTP.

## Capacidades

- Tool calling y function calling: especializado en invocar habilidades y herramientas de una aplicacion asistente (Google Sheets, Apple Reminders, Obsidian, Gmail, Spotify, Excel, Asana, entre otras).
- Razonamiento previo al turno (thinking mode): el ajuste aprendio a razonar antes de actuar, siguiendo el patron del profesor.
- Conversaciones multiturno con herramientas: mantiene el estado a lo largo de episodios con llamadas encadenadas y errores de herramienta.
- Ejecucion de codigo Python como herramienta: conversiones de unidades, fechas, finanzas, estadistica y tratamiento de CSV.
- Generacion de texto general: conserva capacidades del base, con IFEval del 83,0% y GSM8K del 81,5% en la evaluacion del autor.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Vision y audio: no disponibles en la informacion proporcionada.

## Casos de uso

- Asistentes on-device con habilidades integradas: el modelo esta entrenado con el harness real de una aplicacion asistente, por lo que encaja directamente en productos que exponen herramientas al modelo y necesitan que este elija la correcta (99% de llamadas a la herramienta adecuada en las simulaciones del autor).
- Automatizacion de hojas de calculo: episodios de Excel y Google Sheets con escrituras verificadas; el ajuste sube del 8% al 29% en Excel multiturno, aunque sigue siendo un area debil.
- Gestion de correo y recordatorios: casos de Gmail y Apple Reminders con validacion de llamadas, escrituras y respuesta final.
- Extraccion y manipulacion de documentos: episodios de PDF, Word y PowerPoint, donde el ajuste alcanza 80%, 83% y 77% respectivamente en la evaluacion multiturno.
- Operaciones sobre GitHub y web: episodios de GitHub (52%) y navegacion web (79%), utiles para agentes de desarrollo que consultan repositorios o buscan informacion.
- Calculo asistido mediante Python: peticiones que requieren codigo real (conversiones, fechas, estadistica), aunque el autor reporta una caida en esta area (35,0% frente al 39,4% del base).
- Investigacion sobre destilacion de tool calling: el checkpoint y su metodologia (profesor 27B, harness real, thinking on) sirven como referencia para estudiar destilacion de agentes a modelos de 9B.

## Benchmarks y rendimiento

Resultados publicados por el autor. Todas las comparaciones usan exportaciones Q4_K_M planas con el mismo pipeline, ejecutadas en el harness de la aplicacion sobre una maquina B300, con thinking activado salvo donde se indica.

| Benchmark | Base Qwen3.5-9B | Fine-tuned 9B | Profesor Qwen3.8-27B (Q8_0) |
|---|---|---|---|
| Episodios multiturno held-out (43 casos, 438 ejecuciones) | 38,4% | 60,0% | 65,3% |
| Episodios Python exec held-out (30 casos, 180 ejecuciones) | 39,4% | 35,0% | 36,7% |
| Chats simulados, puntuacion del juez menos base (31 escenarios) | 0 | +0,48 (+0,10 a +0,87) | +1,35 (+1,00 a +1,68) |
| Habilidades single-turn held-out (7 packs) | 63,4% | 83,3% | No disponible |
| IFEval, prompt-level strict, thinking off (541 prompts) | 84,7% | 83,0% | No disponible |
| GSM8K, zero-shot chain of thought (1.319) | 82,8% | 81,5% | No disponible |

Desglose por area en episodios multiturno:

| Area | Ejecuciones emparejadas | Base Qwen3.5-9B | Fine-tuned 9B | Profesor Qwen3.8-27B |
|---|---|---|---|---|
| Word | 48 | 33% | 83% | 52% |
| PDF | 60 | 57% | 80% | 78% |
| Weather | 48 | 65% | 81% | 98% |
| Web | 24 | 67% | 79% | 75% |
| PowerPoint | 48 | 40% | 77% | 79% |
| GitHub | 48 | 10% | 52% | 67% |
| Skill routing | 30 | 47% | 47% | 50% |
| Diagrams | 60 | 32% | 33% | 60% |
| Excel | 48 | 8% | 29% | 33% |
| Python exec | 24 | 42% | 29% | 50% |

Metricas de chats simulados (base frente a fine-tune):

| Metrica | Base Qwen3.5-9B | Fine-tuned 9B |
|---|---|---|
| Llamadas a la herramienta correcta | 70% | 99% |
| Llamadas a una herramienta incapaz de resolver la tarea | 30% | 1% |
| Turnos de herramienta sin llamada fallida | 51% | 82% |
| Habilidad cargada antes de la primera accion | 75% | 96% |
| Chats con respuesta incorrecta | 22 | 18 |
| Chats con respuesta pobre | 16 | 9 |

Calidad de la cuantizacion con importance matrix frente a bf16 (20 fragmentos de muestras de entrenamiento, distribucion favorable al calibrado):

| Metrica | Q4_K_M plana | Q4_K_M con importance matrix |
|---|---|---|
| Divergencia KL media | 0,066 | 0,038 |
| Mismo token top | 89,7% | 92,4% |
| Ratio de perplejidad | 1,010 | 1,007 |

En seis episodios de documentos y hojas de calculo contra el GGUF base de la aplicacion (Unsloth Q4_K_M), 6 ejecuciones cada uno, la build con importance matrix paso 30/36 frente a 14/36 del base. Las evaluaciones held-out completas no se repitieron sobre esta build.

## Requisitos de hardware

- VRAM estimada: con Q4_K_M, el archivo ronda los 5-6 GB de pesos; en la practica se necesitan aproximadamente 7-9 GB de VRAM para contexto moderado con llama-server y offload completo.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para Q4_K_M con `-ngl 99`; RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090, A100 y H100 funcionan sin problema. El autor entreno en 4 B300, pero la inferencia no requiere ese hardware.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas segun cuantizacion y longitud de contexto.
- Opciones de despliegue: llama.cpp / llama-server es el soportado explicitamente (`llama-server -m Qwen3.5-9B-9b-v5s1-imat-Q4_K_M.gguf -ngl 99 --jinja --chat-template-kwargs '{"enable_thinking":true}'`). Tambien deberia funcionar en Ollama y otros frontends basados en llama.cpp, aunque no se documenta. No hay informacion sobre vLLM o TGI (el artefacto publicado es GGUF).
- Latencia y throughput: no disponibles. El autor solo reporta tiempos de entrenamiento (95 minutos en 4 B300).
- Nota: sin cabeza MTP, no se puede activar decodificacion especulativa MTP.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento relevante | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B-toolcall-preview (este) | ~8,95B | No disponible | 60,0% episodios multiturno; 83,3% skills single-turn | No disponible | GGUF en HF |
| Qwen/Qwen3.5-9B (base) | ~9B | No disponible | 38,4% episodios multiturno; 63,4% skills single-turn | No disponible | HF |
| Qwen3.8-27B (profesor) | 27B (no confirmado) | No disponible | 65,3% episodios multiturno; +1,35 en chats simulados | No disponible | HF |

La comparativa se limita a los modelos usados por el autor en su evaluacion; no se dispone de datos para comparar con otros ajustes de tool calling de tamano similar.

## Limitaciones y advertencias

- Checkpoint de investigacion: el autor lo califica explicitamente como research checkpoint (9b-v5s1), no como modelo de publicacion; no hay garantias de estabilidad ni soporte.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; hereda probablemente las condiciones de Qwen3.5-9B, pero debe verificarse antes de produccion.
- Regresion en Python exec: cae del 39,4% al 35,0% frente al base; el ajuste no mejora esta area y puede degradarla.
- Areas debiles: Excel (29%), diagrams (33%), skill routing (47%, sin mejora) y GitHub (52%) siguen por debajo del profesor y de varios competidores.
- IFEval y GSM8K ligeramente inferiores al base (83,0% frente a 84,7% y 81,5% frente a 82,8%), lo que sugiere una perdida leve de capacidades generales por el ajuste.
- Dependencia del harness: el modelo fue entrenado con el system prompt y las herramientas exactas de una aplicacion concreta; su rendimiento fuera de ese entorno no esta evaluado.
- Sin cabeza MTP: no admite decodificacion especulativa MTP, lo que limita optimizaciones de latencia.
- Riesgo de alucinacion: no cuantificado en la model card; los chats simulados muestran 18 conversaciones con respuesta incorrecta frente a 22 del base, por lo que persiste.
- Idiomas no documentados: no hay informacion sobre cobertura multilingue.
- Sesgos: no documentados.
- Solo se publica una cuantizacion (Q4_K_M con importance matrix); no hay versiones mayores como Q5 o Q8 para escenarios que requieran mas precision.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/am17an/Qwen3.5-9B-toolcall-preview-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Repositorio llama.cpp (herramienta de inferencia recomendada): https://github.com/ggml-org/llama.cpp
- No se han encontrado en la informacion proporcionada papers, blogs, repos adicionales ni demos del autor.
