# posterior-learning/grpo-qwen3-vl-4b-thinking

## Resumen

grpo-qwen3-vl-4b-thinking es un ajuste fino del modelo multimodal Qwen3-VL-4B-Thinking de Alibaba Qwen, publicado por el usuario posterior-learning. Se trata de un modelo image-text-to-text de 4.437.815.808 parametros (aproximadamente 4,44 mil millones) que conserva la arquitectura, el tokenizador, la plantilla de chat y la configuracion del procesador del modelo base. El unico cambio respecto al original es la fusion de un adaptador LoRA entrenado con GRPO (Group Relative Policy Optimization) mediante la libreria verl.

El modelo resuelve el problema de especializar un VLM compacto en tareas de razonamiento por turnos (per-turn one-line action turn, segun la model card) mediante aprendizaje por refuerzo, en lugar de un ajuste supervisado clasico. El entrenamiento se ejecuto durante 50 pasos globales con un learning rate de 1e-5 y un rango LoRA de 16 con alpha 32, lo que implica un ajuste relativamente ligero sobre el comportamiento del modelo base.

Su relevancia es doble: por un lado, demuestra un flujo de trabajo reproducible de RL con verl sobre un VLM de 4B; por otro, al ser un modelo fusionado (merged), puede desplegarse directamente con transformers sin necesidad de cargar el adaptador por separado. No obstante, la informacion publicada es muy escasa: no hay datos de benchmarks, licencia explicita ni lista de idiomas, y el repositorio tiene cero descargas en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3-VL), vision-lenguaje; detalles internos no disponibles |
| Parametros totales | 4.437.815.808 (aprox. 4,44 B) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bf16 en el repositorio) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (transformers); tamano del repo 8,9 GB |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-VL-4B-Thinking, un transformer multimodal de tipo vision-lenguaje con capacidad de razonamiento explicito (modo thinking). Sobre el se aplico un adaptador LoRA de rango 16 y alpha 32, entrenado con GRPO mediante verl en la configuracion grpo_qwen3vl_4b_thinking_turn. El entrenamiento consistio en 50 pasos globales con learning rate 1e-5, ejecutado en cuatro GPU (1, 5, 6 y 7 de un servidor identificado como Server10) el 14 de noviembre de 2026. La tarea de RL se describe como "per-turn one-line action turn", es decir, optimizacion de respuestas de accion de una linea por turno.

La fusion se realizo con la regla W <- W + (lora_alpha / r) * B @ A (escala 2,0), calculada en fp32 y almacenada en bf16, sobre 252 modulos LoRA. El resto de tensores (461) son byte-identicos al modelo base, y los ficheros no ponderados (config, tokenizer, chat template, processor configs, generation config) se copiaron sin cambios. El autor advierte que, al estar fusionado en bf16, las salidas pueden diferir ligeramente respecto a base + adaptador en tiempo de ejecucion. El adaptador original tiene sha256 2bfdf8020179f05e32f3c535d758f85cd690afb91670cd8b225d22cd699710d8.

## Capacidades

- Generacion de texto e imagen-a-texto (pipeline image-text-to-text), heredadas del modelo base Qwen3-VL-4B-Thinking.
- Razonamiento multimodal con modo thinking, segun la denominacion del modelo base.
- Razonamiento por turnos orientado a acciones de una linea, objetivo del entrenamiento GRPO.
- Capacidades conversacionales multi-turno (tag conversational).
- Compatibilidad con endpoints (tag endpoints_compatible) para despliegue como servicio.
- Soporte de tool calling, agentes, matematicas o codigo: no disponible en la informacion proporcionada (probablemente heredado del base, pero no confirmado).
- Capacidades multilingues: no disponible.

## Casos de uso

- Agentes multimodales por turnos: el ajuste GRPO esta orientado a producir acciones de una linea por turno, por lo que encaja en bucles de agente donde el modelo recibe una imagen y el estado de la conversacion y emite una accion concreta (por ejemplo, seleccionar una herramienta o un siguiente paso).
- Automatizacion de tareas de interfaz grafica (GUI agents): un VLM de 4B con salida de accion corta puede integrarse en pipelines que interpretan capturas de pantalla y emiten comandos de clic o teclado, aunque no hay validacion publica de esta capacidad.
- Prototipado de investigacion en RL: sirve como referencia reproducible de un flujo verl + GRPO + LoRA sobre Qwen3-VL, util para equipos que quieran replicar el entrenamiento o comparar variantes.
- Evaluacion de tecnicas de fusion de adaptadores: al incluir un informe de fusion (MERGE-REPORT.json) con comprobaciones de equivalencia, es un caso de estudio para validar reglas de merge en bf16.
- Despliegue ligero en una sola GPU: con 4,44 B de parametros y pesos bf16 (8,9 GB), cabe en GPUs de consumo alto para experimentacion, lo que permite probar interacciones imagen-texto sin infraestructura grande.
- Generacion de descripciones o respuestas sobre imagenes en entornos controlados: el modelo base aporta capacidades de captioning y VQA, aunque el ajuste RL puede haber alterado el estilo de respuesta hacia formatos de accion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 9 GB en bf16 solo para pesos; con cache KV y overhead de inferencia, se recomienda al menos 12-16 GB.
- Cuantizacion a 8 bits o 4 bits reduciria el requisito a unos 5-7 GB y 3-4 GB respectivamente, aunque no se han publicado ficheros GGUF ni cuantizaciones oficiales.
- GPU recomendadas: RTX 4090 (24 GB) o RTX 3090 para inferencia comoda en bf16; A100/H100 para mayor throughput o lotes grandes.
- Cabe en GPU de consumo: si, en tarjetas con 16 GB o mas en bf16; en 12 GB requeriria cuantizacion.
- Opciones de despliegue: transformers (libreria declarada), endpoints compatibles; vLLM, llama.cpp, Ollama o TGI no estan confirmados en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| grpo-qwen3-vl-4b-thinking | 4,44 B | no disponible | no disponible | Ajuste GRPO + LoRA fusionado sobre Qwen3-VL-4B-Thinking |
| Qwen/Qwen3-VL-4B-Thinking (base) | aprox. 4 B | no disponible | no disponible | Modelo original de Alibaba Qwen; referencia directa |
| Otros VLM de 4B (p. ej. familia Qwen2.5-VL-3B/7B) | 3-7 B | no disponible | no disponible | Alternativas de la misma categoria, sin datos comparativos publicados |

No hay datos de rendimiento que permitan una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de que el ajuste GRPO mejore al modelo base en tareas estandar.
- Licencia no declarada: no se puede confirmar el uso comercial; hay que verificar la licencia del modelo base Qwen3-VL-4B-Thinking antes de cualquier despliegue en produccion.
- Idiomas no declarados: se desconoce el soporte multilingue efectivo tras el ajuste.
- Riesgo de alucinacion: inherente a los VLM y al razonamiento multimodal; el ajuste RL puede incrementarlo si el reward prioriza formato sobre veracidad.
- Deriva respecto al base: la fusion en bf16 puede producir diferencias numericas frente a base + adaptador en tiempo de ejecucion.
- Entrenamiento muy corto (50 pasos) y con un unico objetivo de accion por turno: puede degradar capacidades conversacionales generales del modelo base.
- Repositorio con cero descargas y un solo like: sin validacion comunitaria ni reportes independientes.
- Sesgos: no documentados en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/posterior-learning/grpo-qwen3-vl-4b-thinking
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Thinking
- Libreria verl (entrenamiento RL): no se proporciona enlace en la informacion disponible
- Paper o blog del autor: no disponible
- Demo o espacio asociado: no disponible
