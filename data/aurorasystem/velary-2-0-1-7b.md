# AuroraSystem/Velary-2.0-1.7B

## Resumen

Velary 2.0 es un modelo de lenguaje de 1.700 millones de parametros (1.728.801.536 exactos segun los pesos en safetensors) desarrollado por AuroraSystem. Se trata de un ajuste fino del modelo base LiquidAI/LFM3-1.7B, al que se le ha incorporado un LoRA de razonamiento posteriormente fusionado en los pesos base, de modo que no requiere adaptadores en inferencia. El modelo esta especializado en instrucciones bilingues ruso/ingles y en tareas de razonamiento estructurado con trazas de pensamiento (` thinking`).

La propuesta de valor del modelo es acotada pero concreta: ofrece un modelo pequeno (1.7B) con capacidad de razonamiento controlable mediante un system prompt ("Reasoning effort: high"), entrenado sobre aproximadamente 14.000 ejemplos sinteticos generados por un modelo profesor. Hereda del LFM3 base una arquitectura tri-hibrida de convolucion y atencion con una ventana de contexto declarada de 256.000 tokens, aunque el ajuste fino solo valida calidad hasta 2.048 tokens.

Es relevante ahora como ejemplo de la tendencia de ajustes finos pequenos y especializados sobre arquitecturas eficientes, orientados a despliegues con recursos limitados y a nichos linguisticos (ruso) poco cubiertos por los modelos generalistas. No obstante, su validacion se limita a un benchmark propio (ABench75) y no hay datos publicos de benchmarks estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tri-hibrido convolucion/atencion (LFM3, `Lfm3ForCausalLM`), 24 capas, hidden size 2048 |
| Parametros totales | 1.728.801.536 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256.000 tokens en el modelo base; calidad validada solo hasta 2.048 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | Ruso (ru) e ingles (en) |
| Licencia | lfm1.0 (campo `license: other`, `license_name: lfm1.0`) |
| Formato de pesos | safetensors (transformers, requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM3-1.7B, un transformer de 24 capas con hidden size 2048 y vocabulario de 128.000 tokens, que combina capas de convolucion y de atencion en un stack "tri-hibrido". Sobre esta base se aplico un ajuste fino con LoRA de rango 16, alpha 32 y dropout 0,05, que posteriormente se fusiono en los pesos base mediante PEFT; el resultado se distribuye en bfloat16 y no necesita ficheros de adaptador en inferencia.

Los datos de entrenamiento son aproximadamente 14.000 ejemplos sinteticos o generados por un modelo profesor (14.086 de entrenamiento y 322 de evaluacion), en formato ChatML e incluyendo trazas de razonamiento ` thinking`. No se documenta el uso de RLHF ni DPO. El entrenamiento se realizo con secuencias de 2.048 tokens, por debajo de la ventana de 256K que soporta la arquitectura base, y el autor advierte explicitamente que la calidad mas alla de esa longitud no esta validada. La profundidad de razonamiento se controla mediante el system prompt, no mediante parametros de decodificacion especificos.

## Capacidades

- Generacion de texto y razonamiento estructurado con trazas de pensamiento (` thinking`), orientado a respuestas paso a paso.
- Razonamiento de profundidad configurable mediante system prompt (niveles como "Reasoning effort: high").
- Instrucciones y conversacion multi-turno en formato ChatML.
- Capacidades bilingues: ruso e ingles.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explicitamente; el formato ` thinking` sugiere razonamiento encadenado, pero no se describe integracion con frameworks de agentes.
- Vision, audio u otras modalidades: no disponible.
- Modo de pensamiento: si, mediante el system prompt y las trazas ` thinking`.

## Casos de uso

- Razonamiento asistido en ruso para soporte tecnico: el modelo puede resolver consultas paso a paso en ruso con trazas de pensamiento, aprovechando su entrenamiento bilingue y su formato ChatML para conversaciones multi-turno.
- Generacion de explicaciones estructuradas en entornos educativos: util para producir soluciones razonadas a problemas de logica o matematicas basicas, con la salvedad de verificar los hechos por el riesgo de alucinacion.
- Prototipado rapido en hardware modesto: con 1.7B de parametros en bfloat16 (unos 3,5 GB de pesos), se puede desplegar en una unica GPU consumer para experimentar con tecnicas de razonamiento controlado.
- Traduccion y asistencia linguistica ru-en en contextos acotados: el modelo maneja ambos idiomas y puede emplearse para reescritura o generacion de contenido bilingue, verificando la ortografia rusa por las limitaciones declaradas.
- Evaluacion de tecnicas de ajuste fino con LoRA: sirve como referencia practica de como un LoRA de razonamiento fusionado cambia el comportamiento de un modelo base pequeno, util para investigadores que comparan metodologias.
- Generacion de respuestas con profundidad de razonamiento ajustable en pipelines de QA: el control via system prompt permite equilibrar coste de tokens y calidad segun la tarea, usando `max_new_tokens` de al menos 512 en modo de alto esfuerzo.
- Base para experimentos de destilacion o ajuste adicional: al ser un modelo pequeno y con licencia lfm1.0, puede servir de punto de partida para nuevos ajustes en nichos linguisticos, siempre respetando los terminos de la licencia.

## Benchmarks y rendimiento

El unico benchmark reportado es ABench75, un conjunto de 375 tareas con correccion automatica por expresion regular, medido con system prompt de alto esfuerzo de razonamiento, decodificacion greedy y `max_new_tokens=384`. Solo se publica la puntuacion global.

| Split | Tareas | Puntuacion |
|---|---:|---:|
| Publico | 300 | 92,0% |
| Privado | 75 | 93,3% |
| Combinado | 375 | 92,3% |

No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Al ser un benchmark propio del autor y sin comparativa con otros modelos, estos datos no permiten situar el modelo frente a alternativas.

## Requisitos de hardware

- VRAM estimada en bfloat16: aproximadamente 3,5 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda al menos 6-8 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer moderna con 8 GB o mas (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090) puede alojar el modelo en bfloat16 o float16; para despliegues en servidor, A100 o H100 son sobredimensionadas para este tamano pero validas para alto throughput.
- Cabe en GPU consumer: si, con holgura en tarjetas de 8 GB o mas.
- Opciones de despliegue: transformers con `trust_remote_code=True` (requerido por el codigo personalizado de LFM3); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, y la ausencia de pesos GGUF publicados limita el despliegue en llama.cpp/Ollama sin conversion previa.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Velary-2.0-1.7B | 1,73B | 256K (validado 2K) | lfm1.0 | Ajuste bilingue ru/en con razonamiento; benchmark propio ABench75 |
| LiquidAI/LFM3-1.7B (base) | 1,7B | 256K | lfm1.0 | Modelo base sin ajuste de razonamiento ni enfoque bilingue ru/en |
| Alternativas de ~1.5-2B (p. ej. Qwen2.5-1.5B, Llama-3.2-1B) | 1-1,5B | 32K-128K | Apache 2.0 / Llama | Modelos generalistas con benchmarks publicos; no disponibles datos comparativos directos con Velary en la informacion proporcionada |

No se dispone de datos de rendimiento comparativo entre Velary 2.0 y estos modelos en la informacion proporcionada; la comparativa se limita a parametros, contexto y licencia.

## Limitaciones y advertencias

- Entrenado sobre datos sinteticos generados por un modelo profesor: riesgo elevado de alucinacion y de errores factuales; el propio autor recomienda verificar hechos y ortografia rusa antes de usar.
- Calidad validada solo hasta 2.048 tokens pese a la ventana de 256K del modelo base; el comportamiento en contextos largos no esta testeado.
- Rendimiento limitado en conversacion casual y escritura creativa abierta, segun el autor.
- El razonamiento extendido incrementa el consumo de tokens; en modo de alto esfuerzo se recomienda `max_new_tokens` de al menos 512.
- No esta alineado en seguridad mas alla de los datos de entrenamiento: no hay garantias frente a contenido nocivo, sesgos o instrucciones maliciosas.
- Licencia lfm1.0 (campo `license: other`): es necesario revisar los terminos especificos de la licencia de LiquidAI antes de cualquier uso comercial; no es una licencia permisiva tipo Apache 2.0.
- Requiere `trust_remote_code=True` por el codigo personalizado de la arquitectura LFM3, lo que implica ejecutar codigo del repositorio.
- El unico benchmark disponible es propio del autor, sin validacion externa ni comparativa con modelos estandar.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: ecosistema de uso practicamente inexistente y sin validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/AuroraSystem/Velary-2.0-1.7B
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Repositorio de LiquidAI: no disponible en la informacion proporcionada
- Paper o blog tecnico de LFM3: no disponible en la informacion proporcionada
- Demo o espacio de inferencia: no disponible en la informacion proporcionada
