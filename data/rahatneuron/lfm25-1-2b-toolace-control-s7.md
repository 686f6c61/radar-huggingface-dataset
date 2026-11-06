# rahatneuron/lfm25-1.2b-toolace-control-s7

## Resumen

El modelo `rahatneuron/lfm25-1.2b-toolace-control-s7` es un adaptador LoRA (Low-Rank Adaptation) sobre el modelo base `LiquidAI/LFM2.5-1.2B-Instruct`, desarrollado por el usuario rahatneuron. Su objetivo es mejorar la capacidad de *tool calling* o *function calling* de un modelo compacto de 1.200 millones de parámetros, especializándolo en la generación de llamadas a funciones con argumentos correctos en un solo turno de conversación. El adaptador se entrena exclusivamente sobre el conjunto de datos ToolACE, sin mezclas con otros datasets, lo que lo convierte en un control experimental para aislar el efecto de esa fuente de datos.

La relevancia de este adaptador radica en que demuestra que es posible mejorar de forma medible la precisión de argumentos en *tool calling* con un entrenamiento LoRA breve (aproximadamente 28 minutos en una GPU A10G) y un coste computacional muy bajo. Sobre un conjunto de evaluación retenido de ToolACE (500 filas), la precisión estricta de argumentos pasa del 62,8 % al 72,8 %, una mejora de 10 puntos porcentuales con un intervalo de confianza del 95 % de [+6,6, +13,6]. Se trata de un resultado experimental local, no de una puntuación oficial del leaderboard BFCL.

El adaptador está pensado para investigadores y desarrolladores que trabajan con modelos pequeños en entornos con recursos limitados y necesitan integrar llamadas a herramientas de forma fiable. El modelo base LFM2.5-1.2B-Instruct pertenece a la familia Liquid Foundation Models de Liquid AI, con arquitectura propietaria y licencia LFM Open License v1.0, que impone restricciones de uso comercial por encima de un umbral de facturación anual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer LiquidAI LFM2.5-1.2B-Instruct (arquitectura del base: no disponible en detalle) |
| Parametros totales | 1.200 millones (modelo base); parametros del adaptador LoRA: no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (truncado de entrenamiento a 2048 tokens) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; el base admite las cuantizaciones que soporte su ecosistema) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | LFM Open License v1.0 (licencia `other` en Hugging Face) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Libreria | PEFT |
| Dataset de entrenamiento | Team-ACE/ToolACE (split seed 7: 10.246 filas de entrenamiento / 500 de evaluacion) |
| Rango LoRA | r=16, alpha=16, dropout=0 |
| Modulos objetivo LoRA | q_proj, k_proj, v_proj, out_proj, in_proj, w1, w2, w3 |
| Hardware de entrenamiento | Hugging Face Jobs `a10g-small`, ~28 minutos |
| Descargas | 23 |
| Likes | 0 |

## Arquitectura y entrenamiento

El adaptador se construye sobre `LiquidAI/LFM2.5-1.2B-Instruct`, un modelo de 1.200 millones de parámetros de la familia Liquid Foundation Models. La arquitectura interna del modelo base no se detalla en la información proporcionada, más allá de la etiqueta `liquid` y la referencia al paper arXiv:2409.00920. El adaptador en sí es un LoRA con rango 16, alpha 16 y dropout 0, aplicado a los módulos de atención (`q_proj`, `k_proj`, `v_proj`, `out_proj`) y a los módulos feed-forward (`in_proj`, `w1`, `w2`, `w3`).

El entrenamiento utiliza el dataset Team-ACE/ToolACE convertido, con un re-split de semilla 7 que produce 10.246 filas de entrenamiento y 500 de evaluación, sin mezcla con Hermes ni Glaive. La supervisión se limita al primer turno del asistente, sin *packing* y con truncado por la izquierda a 2048 tokens. Se emplea Unsloth junto con TRL SFT (`scripts/train_toolace_sft.py`), con optimizador a tasa de aprendizaje 2e-4, batch 2 y acumulación de gradiente 4 (efectivo 8), durante 1200 pasos máximos (aproximadamente 0,94 épocas sobre unas 1280 pasos por época). El adaptador se guardó con PEFT 0.21.x y es cargable con PEFT 0.18 o superior (con un aviso de clave desconocida inofensivo).

Una innovación destacable es el formato de salida: LFM emite llamadas a herramientas en estilo *pythonic* dentro de marcadores `<|tool_call_start|>...<|tool_call_end|>`, por ejemplo `[get_weather(city='Dhaka')]`. Los esquemas de herramientas se pasan mediante `apply_chat_template(..., tools=...)`. La decodificación greedy con un máximo de 256 tokens nuevos reproduce la evaluación reportada.

## Capacidades

- Generación de llamadas a funciones (*tool calling*) en un solo turno, con argumentos en formato *pythonic* dentro de marcadores especiales.
- Soporte de *function calling* mediante el template de chat nativo con el parámetro `tools=`.
- Generación de texto general heredada del modelo base LFM2.5-1.2B-Instruct.
- Capacidad multilingüe limitada al inglés según la model card.
- No se documentan capacidades de visión, audio, agentes multi-paso ni modo de razonamiento explícito (*thinking mode*) en la información proporcionada.
- No se documenta soporte de *multi-step reasoning* ni de conversaciones multi-turno con herramientas.

## Casos de uso

- **Integración de herramientas en asistentes conversacionales**: el adaptador permite que un modelo de 1.2B genere llamadas a funciones estructuradas con argumentos correctos, adecuado para asistentes ligeros que necesitan invocar APIs como consulta de clima, bases de datos o servicios web en un solo turno.
- **Despliegue en entornos con recursos limitados**: al ser un adaptador LoRA sobre un modelo de 1.2B, puede ejecutarse en CPU en float32 o en GPUs de gama baja, lo que lo hace viable para prototipos y aplicaciones *edge* donde no hay acceso a modelos grandes.
- **Investigación en *tool calling* con modelos pequeños**: sirve como control experimental para estudiar el efecto de datasets específicos (ToolACE) en la precisión de argumentos, con métricas reproducibles y código disponible en el repositorio del proyecto.
- **Pipelines de automatización de tareas**: puede integrarse en flujos donde el modelo recibe una consulta del usuario y un esquema de herramientas, y devuelve una llamada parseable para su ejecución por un orquestador.
- **Prototipado rápido de agentes basados en funciones**: gracias a su bajo coste de entrenamiento (28 minutos en A10G) y a la facilidad de carga con PEFT, permite iterar sobre esquemas de herramientas y prompts sin infraestructura pesada.
- **Evaluación comparativa de adaptadores**: el adaptador se presta a comparaciones controladas con el modelo base y con otras variantes (por ejemplo, la mezcla Hermes/Glaive mencionada en la model card) sobre los mismos conjuntos de evaluación.

## Benchmarks y rendimiento

Los resultados son métricas locales del scorer del proyecto (coincidencia exacta de argumentos tras normalización ligera; nombres y número de herramientas ordenados). No son puntuaciones oficiales AST/ejecución de BFCL.

| Split / metrica | Base | Este adaptador | Delta (IC 95 %) |
|---|---:|---:|---|
| ToolACE-500 argumentos estrictos | 62,8 % | 72,8 % | +10,0 pp [+6,6, +13,6] |
| BFCL-500 argumentos con alternativas | 87,8 % | 90,4 % | +2,6 pp [+0,2, +5,0] |
| BFCL-500 argumentos estrictos de respuesta seleccionada | 59,6 % | 54,2 % | −5,4 pp (sin IC reportado) |

Los intervalos de confianza se calcularon con 5.000 remuestreos bootstrap pareados sobre ejemplos. La métrica BFCL con alternativas acepta cualquier alternativa dorada no vacía listada y trata un `""` de origen como "omisión permitida". No se han publicado resultados de benchmarks oficiales (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible de forma explícita. Para un modelo de 1.2B en bfloat16 se estiman del orden de 2,4 GB solo para pesos, más overhead de activaciones y caché KV; en float32, aproximadamente 4,8 GB para pesos.
- **GPU recomendadas**: el entrenamiento se realizó en una A10G (24 GB). Para inferencia, cualquier GPU con al menos 8 GB de VRAM debería ser suficiente en bfloat16; en CPU es viable en float32 según la verificación del autor.
- **Consumer GPU**: sí, cabe en GPUs de consumo como RTX 3060 (12 GB), RTX 4060 Ti (16 GB) o RTX 4090 (24 GB) en bfloat16, siempre que se disponga de suficiente memoria para el contexto.
- **Opciones de despliegue**: la model card documenta el uso con `transformers` + `peft` (`PeftModel`). No se mencionan vLLM, llama.cpp, Ollama ni TGI en la información proporcionada.
- **Latencia y throughput**: no disponibles. El entrenamiento completo del adaptador requirió aproximadamente 28 minutos en A10G.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tool calling | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `rahatneuron/lfm25-1.2b-toolace-control-s7` (este) | 1.2B (base) + LoRA | No disponible (entrenamiento a 2048) | Especializado (ToolACE) | LFM Open License v1.0 | Hugging Face (23 descargas) |
| `LiquidAI/LFM2.5-1.2B-Instruct` (base) | 1.2B | No disponible | Generico | LFM Open License v1.0 | Hugging Face |
| `rahatneuron/lfm25-1.2b-toolace-lora` (variante anterior) | 1.2B (base) + LoRA | No disponible | Especializado (split original de 200 filas) | LFM Open License v1.0 | Hugging Face |

No se dispone de datos de benchmarks oficiales ni de otros modelos comparables en la información proporcionada para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- La evaluación se limita a coincidencia exacta estricta sobre una distribución retenida de estilo ToolACE, con esquemas de herramientas en inglés provenientes de los conversores de ToolACE/BFCL.
- Entrenamiento con una sola semilla; no se reporta varianza entre múltiples semillas.
- La evaluación cubre solo el primer turno de llamada a herramienta con herramientas presentes; no evalúa la finalización multi-turno ni el caso de "cuándo no llamar a una herramienta".
- Las ejecuciones publicadas de 500 filas, BFCL y modelos externos usaron una ruta de renderizado que añadía un token BOS extra; el `run_eval_job.py` actual ya no lo añade, lo que puede introducir diferencias respecto a los números reportados.
- Una ejecución mixta con Hermes/Glaive no superó a este control solo con ToolACE en los mismos splits.
- El adaptador es un derivado de LiquidAI LFM2.5 bajo la LFM Open License v1.0: el uso comercial está condicionado a no superar el umbral de 10 millones de dólares de facturación anual; las entidades que lo superen no están licenciadas para uso comercial.
- La redistribución exige entregar una copia de la licencia a los destinatarios y hacer constar los archivos modificados.
- Riesgo de alucinación y sesgos: no documentados específicamente en la información proporcionada, pero inherentes a un modelo de 1.2B entrenado sobre un dataset concreto en inglés.
- Idioma limitado al inglés; no se garantiza un comportamiento correcto en castellano u otros idiomas.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/rahatneuron/lfm25-1.2b-toolace-control-s7
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct
- Licencia del modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct/blob/main/LICENSE
- Repositorio del proyecto (código y writeup): https://github.com/Rahat-Kabir/toolcall-distill
- Dataset ToolACE: https://huggingface.co/datasets/Team-ACE/ToolACE
- Paper de referencia (arXiv:2409.00920): https://arxiv.org/abs/2409.00920
