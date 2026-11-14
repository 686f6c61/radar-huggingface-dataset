# orbbit-AI-026/Nota-3

## Resumen

Nota 3 es un modelo multimodal de tipo image-text-to-text publicado por orbbit-AI-026 en Hugging Face. Se presenta como el miembro mas capaz de la familia "Hero 3 · Dota 3 · Nota 3" de Orbbit AI, pero la propia model card lo describe como una "copia de partida, todavia sin ajustar": se trata de una redistribucion del modelo LongCat 2.5 de Meituan, conservando su licencia MIT y su aviso de copyright. Las versiones entrenadas por Orbbit AI se publicarian, segun el autor, en el mismo repositorio.

El modelo subyacente, LongCat 2.5, es un MoE multimodal nativo disenado para tareas agenticas de horizonte largo, con aproximadamente 1,6 billones de parametros totales y unos 48 mil millones activados por token. Combina comprension visual con codificacion agentica para desarrollo sobre bases de codigo complejas, construccion de proyectos completos, diseno creativo y tareas 3D. El repositorio declara 1.779.752.648.320 parametros en safetensors (cifra que difiere ligeramente de los 1,6 billones indicados en la model card) y un tamano de 3.562 GB.

La relevancia de esta ficha es doble: por un lado documenta un modelo de escala frontera con capacidades multimodales y agenticas; por otro, advierte de que la publicacion de Orbbit AI es, por ahora, unicamente una copia sin ajuste fino propio, por lo que cualquier evaluacion practica debe atribuirse al modelo base de Meituan.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE multimodal nativo (transformer con mezcla de expertos); pesos con `custom_code` |
| Parametros totales | 1.779.752.648.320 (safetensors); ~1,6 billones segun model card |
| Parametros activos | ~48 mil millones por token |
| Longitud de contexto | no disponible (se menciona entrenamiento en secuencias largas, sin cifra concreta) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (con codigo personalizado) |

## Arquitectura y entrenamiento

LongCat 2.5 es un modelo de mezcla de expertos (MoE) multimodal nativo. La modelacion visual se basa en LongCat-Next: las caracteristicas visuales a resolucion nativa se convierten en tokens discretos y se alinean conjuntamente con el texto en un espacio semantico compartido. El entrenamiento combina secuencias largas, RL a gran escala para tareas agenticas de horizonte largo (con tareas de ingenieria reales y fallos reproducibles de agentes, estrategias de rollout eficientes y salvaguardas contra reward hacking) y aprendizaje multi-profesor mediante destilacion KL de vocabulario completo y Tree Attention, con profesores especializados en agente, razonamiento e interaccion.

En infraestructura, el modelo emplea paralelismo consciente de supernodos, sharding eficiente y solapamiento comunicacion-computo, con una mejora reportada del 86 % de throughput por dispositivo frente a la linea base DDP en tareas de SFT de secuencias largas. La infraestructura de RL mantiene log-probabilidades de token identicas bit a bit entre entrenamiento, prefill y decodificacion, y la optimizacion de cache KV junto con LSA casi duplica la capacidad de KV en decodificacion sin aumentar el TPOT en la carga de trabajo probada. No se detalla el numero de tokens de entrenamiento ni la composicion exacta del dataset.

## Capacidades

- Generacion de texto y razonamiento multimodal (image-text-to-text).
- Comprension visual con tokens visuales discretos a resolucion nativa.
- Codificacion agentica para desarrollo sobre bases de codigo complejas y construccion de proyectos completos.
- Tareas de diseno creativo y 3D.
- Ejecucion agentica de horizonte largo y multi-turno, reforzada mediante RL.
- Soporte declarado de `agentic` y `conversational` en las etiquetas del repositorio.
- Seguimiento de instrucciones y seguridad reforzados por aprendizaje multi-profesor.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Soporte explicito de tool calling / function calling: no disponible en la informacion proporcionada.

## Casos de uso

- Desarrollo de software agentico sobre repositorios grandes: el modelo esta entrenado con RL para tareas de ingenieria de horizonte largo, por lo que puede encadenar lecturas de codigo, ediciones y ejecucion de pruebas en un mismo flujo.
- Construccion de proyectos completos desde cero: su capacidad de ejecucion end-to-end permite generar estructura, ficheros y configuracion de un proyecto a partir de una especificacion.
- Asistentes de terminal automatizados: los resultados reportados en Terminal Bench v2.1 (88,4) lo situan como candidato para agentes que operan shells y herramientas CLI.
- Analisis de interfaces y documentos visuales: al ser image-text-to-text nativo, puede procesar capturas, diagramas y maquetas junto a texto para generar codigo de UI o documentacion.
- Diseno creativo y modelado 3D asistido: la model card menciona explicitamente tareas creativas y 3D como dominio de aplicacion.
- Investigacion en agentes y RL: su infraestructura de entrenamiento con log-probabilidades identicas entre fases lo hace util como referencia para estudiar estabilidad de entrenamiento e inferencia.
- Evaluacion comparativa de modelos frontera: al estar bajo licencia MIT, sirve como base reproducible para benchmarks de codigo, agentes y vision.

## Benchmarks y rendimiento

Resultados reportados en la model card (los marcados con `*` son citados de terceros; el resto, mediciones internas del autor del modelo base):

| Benchmark | LongCat-2.5 | LongCat-2.0 | GPT-5.5 | GPT-5.6-Sol | Claude-Opus-4.8 | Claude-Opus-5 | GLM-5.3 | kimi-k3 | DeepSeek-V4.1-Flash |
|---|---|---|---|---|---|---|---|---|---|
| Terminal Bench v2.1 | 88,4 | 70,8 | 83,2* | 88,8* | 74,6* | 89,1* | 88,2* | 88,3* | 90,6* |
| Terminal Bench v4.0 | 38,5 | 3,0 | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La informacion proporcionada solo incluye resultados parciales de la seccion "Code Agent"; no se dispone de cifras de MMLU, HumanEval, GSM8K ni de las secciones de agente general y vision.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Con 1,78 billones de parametros totales y pesos en safetensors de 3.562 GB, la inferencia en precision completa requiere un cluster multi-GPU; no es viable en una sola GPU.
- GPU recomendadas: no disponibles en la informacion proporcionada; por escala, se requiere un despliegue multi-nodo con aceleradores de centro de datos (tipo A100/H100 o equivalentes). La model card menciona optimizaciones en "aceleradores de IA domesticos", sin especificar modelos.
- Compatibilidad con GPU de consumo: no. El tamano del repositorio (3.562 GB) y el numero de parametros descartan su ejecucion en RTX 4090 o similares, incluso con cuantizacion agresiva.
- Opciones de despliegue: no se detallan en la informacion proporcionada (vLLM, llama.cpp, Ollama, TGI, etc. no se mencionan). El uso de `custom_code` implica cargar codigo remoto con `trust_remote_code`.
- Latencia y throughput: no disponibles. La model card cita mejoras relativas (86 % mas de throughput por dispositivo en SFT; casi el doble de capacidad KV en decodificacion sin aumentar TPOT), pero sin valores absolutos.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Terminal Bench v2.1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Nota 3 (copia de LongCat 2.5) | 1,78 B (safetensors) | ~48 B | no disponible | 88,4 | MIT | Hugging Face |
| LongCat 2.0 | no disponible | no disponible | no disponible | 70,8 | MIT | Hugging Face (meituan-longcat) |
| DeepSeek-V4.1-Flash | no disponible | no disponible | no disponible | 90,6* | no disponible | Hugging Face |
| GLM-5.3 | no disponible | no disponible | no disponible | 88,2* | no disponible | no disponible |
| Claude-Opus-5 | no disponible | no disponible | no disponible | 89,1* | propietaria | API |

Los datos de parametros, contexto y licencia de los modelos comparables no estan disponibles en la informacion proporcionada; solo se dispone de sus puntuaciones citadas en Terminal Bench v2.1.

## Limitaciones y advertencias

- El repositorio es una copia sin ajustar del modelo base LongCat 2.5 de Meituan; no incorpora entrenamiento propio de Orbbit AI. Cualquier merito o defecto debe atribuirse al modelo original.
- Los pesos requieren `custom_code`, lo que implica ejecutar codigo remoto del repositorio; conviene auditar dicho codigo antes de usarlo en produccion.
- El tamano del repositorio (3.562 GB) y el numero de parametros hacen inviable el despliegue en hardware de consumo y encarecen cualquier inferencia.
- Existe una discrepancia entre los parametros declarados en la model card (~1,6 billones) y los contados en safetensors (1.779.752.648.320); debe verificarse antes de planificar recursos.
- No se han publicado datos sobre sesgos, tasas de alucinacion, cobertura idiomatica ni limitaciones de contexto.
- Los benchmarks no marcados con asterisco son mediciones internas del autor del modelo base y deben tratarse como indicativos, no como resultados independientes.
- La licencia MIT permite uso comercial, pero se conservan la LICENSE y el aviso de copyright de Meituan; es responsabilidad del usuario mantener dichos avisos.
- El estado "sin ajustar" y las cero descargas/likes indican que el repositorio no ha sido validado por la comunidad.

## Enlaces

- Hugging Face (Nota 3): https://huggingface.co/orbbit-AI-026/Nota-3
- Modelo base LongCat 2.5: https://huggingface.co/meituan-longcat/LongCat-2.5
- Organizacion Meituan LongCat en Hugging Face: https://huggingface.co/meituan-longcat
- Organizacion Meituan LongCat en ModelScope: https://www.modelscope.cn/organization/meituan-longcat
- Blog tecnico de LongCat 2.5: https://longcat.ai/blog/longcat-2.5/
- Paper LongCat-Next: https://arxiv.org/abs/2603.27538
- Paper Tree Attention: https://arxiv.org/pdf/1909.07606
- Informe tecnico DeepSeek-V4.1-Flash (referencia de destilacion KL): https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash/blob/main/DeepSeek_V41_Tech_Report.pdf
- Discord de LongCat: https://discord.com/invite/jmuv5TQzKU
- Twitter/X de LongCat: https://x.com/Meituan_LongCat
