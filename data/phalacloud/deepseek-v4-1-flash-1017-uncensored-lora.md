# PhalaCloud/DeepSeek-V4.1-Flash-1017-Uncensored-LoRA

## Resumen
DeepSeek-V4.1-Flash-1017-Uncensored-LoRA es un adaptador PEFT de tipo LoRA, de 232 MB, desarrollado por PhalaCloud sobre el modelo base `deepseek-ai/DeepSeek-V4.1-Flash-1017` (revision `08c8657f02291e11b6f6b63e0e16014f8e748518`). Su objetivo es reducir la tasa de rechazos del modelo base manteniendo intacta la capacidad de razonamiento, mediante una combinacion de edicion de proyecciones de bajo rango, fine-tuning LoRA y una etapa de DPO. El adaptador se sirve sin fusionar sobre los pesos oficiales en FP8 y se selecciona por peticion, de modo que un mismo motor puede atender tanto al modelo base como a esta variante.

El modelo resuelve un problema concreto: los asistentes alineados rechazan peticiones que el usuario considera legitimas. Segun la evaluacion del autor, la tasa de rechazo en StrongREJECT cae del 99,3 % al 8,5 % con razonamiento activado, mientras que IFEval y GSM8K se mantienen practicamente identicos al base. Es relevante ahora porque demuestra que es posible modular el comportamiento de rechazo de un modelo grande sin reentrenar los pesos completos y sin degradar las capacidades de instruccion y matematicas.

La arquitectura subyacente es la del modelo base DeepSeek-V4.1-Flash-1017, que no se detalla en la informacion disponible. El adaptador tiene rango 45, alpha 45 y precision BF16, y solo afecta a las proyecciones de atencion `attn.wq_a`, `attn.wq_b`, `attn.wkv`, `attn.wo_b` y a la `down_proj` del experto compartido. Los expertos enrutados, las tablas Engram, el indexador y la cabeza de salida no se modifican.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre el transformer DeepSeek-V4.1-Flash-1017; modulos objetivo: `attn.wq_a`, `attn.wq_b`, `attn.wkv`, `attn.wo_b`, `down_proj` del experto compartido |
| Parametros totales | no disponible (adaptador de 232 MB en BF16; rango 45, alpha 45) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | el adaptador se sirve sin fusionar sobre pesos FP8 del modelo base; el adaptador en si esta en BF16 |
| Idiomas soportados | en, zh |
| Licencia | MIT (adaptador y modelo base) |
| Formato de pesos | safetensors (`adapter_model.safetensors`), configuracion PEFT en `adapter_config.json` |

## Arquitectura y entrenamiento
El adaptador se construye en tres fases segun la model card. Primero, una edicion de proyeccion de bajo rango congelada sobre `wo_b` y sobre la proyeccion down del experto compartido. Segundo, un fine-tuning LoRA sobre las proyecciones de atencion que restaura un razonamiento conciso que termina correctamente. Tercero, una etapa breve de DPO que prefiere respuestas cortas, cerradas y completas frente a rechazos y razonamientos excesivamente largos. Las tres partes se componen en un unico adaptador.

Los nombres de los modulos siguen las rutas de SGLang para DeepSeek-V4. La proyeccion sobre la down del experto compartido deriva de `dealignai/DeepSeek-V4.1-Flash-1017-UNCENSORED-FP8` (MIT). No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni los detalles del proceso de DPO mas alla de lo indicado.

## Capacidades
- Generacion de texto y razonamiento con modo de razonamiento activable y desactivable (reasoning on / off).
- Reduccion sustancial de rechazos manteniendo el razonamiento, con una tasa de rechazo del 8,5 % en StrongREJECT frente al 99,3 % del base.
- Seguimiento de instrucciones a nivel de prompt (IFEval) practicamente identico al base.
- Razonamiento matematico (GSM8K) sin degradacion apreciable.
- Soporte multilingue limitado a ingles y chino.
- No se documenta soporte de tool calling, function calling, agentes, vision ni audio en la informacion disponible.
- Seleccion por peticion mediante el sufijo `:unc` en el nombre del modelo servido, lo que permite alternar entre base y variante en el mismo motor.

## Casos de uso
- Investigacion sobre alineacion y rechazo: el adaptador permite comparar el comportamiento del modelo base y de la variante sin censura con el mismo harness, prompts y muestreo, aislando el efecto del ajuste sobre la tasa de rechazo.
- Evaluacion de robustez de filtros: util para medir como responde un modelo abliterado frente a clasificadores de seguridad en pipelines de moderacion.
- Generacion creativa sin friccion: en entornos controlados donde el modelo base rechaza peticiones de ficcion, guiones o role-play, el adaptador reduce los rechazos manteniendo coherencia en IFEval.
- Razonamiento matematico y de instrucciones: al conservar GSM8K (93,2 %) e IFEval (87,4 %) respecto al base, sirve para tareas de resolucion de problemas donde se quiere evitar que el modelo se niegue a contestar.
- Despliegue multi-variante en un solo motor: gracias a la seleccion por peticion con `:unc` y a `--max-loras-per-batch 2`, un servicio puede ofrecer base y variante sin duplicar pesos, util para A/B testing en produccion.
- Entornos con requisitos de confidencialidad: el autor lo aloja en un TEE (Intel TDX + NVIDIA confidential computing) en RedPill como `phala/deepseek-v4.1-flash-1017-uncensored`, lo que permite servir el adaptador en infraestructura con atestacion.
- Analisis de contenido sensible en ingles y chino: para tareas de red teaming o analisis de discurso donde un modelo filtrado se niega a procesar el material de entrada.

## Benchmarks y rendimiento
| Benchmark | Base (razonamiento on / off) | Adaptador (razonamiento on / off) |
|---|---|---|
| StrongREJECT (313 prompts), tasa de rechazo | 99,3 % / — | 8,5 % / 7,8 % |
| IFEval (541), prompt-level strict | 87,3 % / 89,7 % | 87,4 % / 87,4 % |
| IFEval, razonamiento on, presupuesto de 6.144 tokens | 94,1 % | 94,1 % |
| GSM8K (1.319), flexible-extract | 93,3 % / 96,4 % | 93,2 % / 96,3 % |

StrongREJECT usa la rubrica oficial con un juez LLM; con n = 313 el intervalo de confianza al 95 % de la tasa de rechazo es de aproximadamente ±3,5 puntos. No se midio MMLU en esta version ni idiomas distintos de ingles y chino.

## Requisitos de hardware
- El adaptador en si ocupa 232 MB en BF16; el requisito real lo determina el modelo base DeepSeek-V4.1-Flash-1017 en FP8, cuyas dimensiones no se detallan en la informacion disponible.
- VRAM estimada para inferencia: no disponible (depende del modelo base).
- GPU recomendadas: no disponible; el autor menciona despliegue con NVIDIA confidential computing en TEE, lo que implica GPUs compatibles con esa funcion.
- Encaje en GPU de consumo: no disponible.
- Opciones de despliegue: SGLang v0.5.23 con los cambios de `Phala-Network/sglang#126`, usando `--enable-lora --lora-backend triton --lora-paths unc=<dir> --max-lora-rank 45 --max-loras-per-batch 2`. Se requiere soporte LoRA para la arquitectura DeepSeek V4.
- Latencia y throughput: no disponibles. El autor advierte que con maximo esfuerzo de razonamiento el adaptador puede razonar durante mucho tiempo, por lo que recomienda fijar un presupuesto de razonamiento en tareas largas.

## Comparativa con modelos similares
| Modelo | Tipo | Parametros | Contexto | Tasa de rechazo (StrongREJECT) | Licencia |
|---|---|---|---|---|---|
| PhalaCloud/DeepSeek-V4.1-Flash-1017-Uncensored-LoRA | LoRA sobre DeepSeek-V4.1-Flash-1017 | no disponible (adaptador de 232 MB) | no disponible | 8,5 % (on) / 7,8 % (off) | MIT |
| deepseek-ai/DeepSeek-V4.1-Flash-1017 (base) | Modelo completo | no disponible | no disponible | 99,3 % (on) | MIT |
| dealignai/DeepSeek-V4.1-Flash-1017-UNCENSORED-FP8 | Modelo completo abliterado en FP8 | no disponible | no disponible | no disponible | MIT |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparables en la informacion proporcionada, por lo que la comparacion se limita a tipo, licencia y, en el caso del base, a la tasa de rechazo medida con el mismo harness.

## Limitaciones y advertencias
- Con razonamiento desactivado, IFEval queda aproximadamente dos puntos por debajo del modelo base.
- Prompts muy cortos con razonamiento activado pueden producir ocasionalmente texto corrupto.
- La semilla (`seed`) no garantiza reproducibilidad de las salidas.
- El adaptador elimina la mayoria de los rechazos: el autor advierte que el usuario es responsable de su uso y del cumplimiento legal aplicable, y que no debe desplegarse donde un modelo sin filtro sea inapropiado.
- Solo se evaluo en ingles y chino; el comportamiento en otros idiomas no esta medido.
- No se midio MMLU en esta version, por lo que el impacto en conocimiento general no esta cuantificado.
- Requiere un motor con soporte LoRA para DeepSeek V4 (SGLang con el PR indicado); no funciona en stacks de inferencia sin ese soporte.
- Con LoRA activado debe mantenerse desactivado el replay acotado de la ventana deslizante del decodificador (el PR lo gestiona).
- Riesgo de alucinacion: no cuantificado en la informacion disponible.
- Sesgos conocidos: no documentados en la informacion disponible.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/PhalaCloud/DeepSeek-V4.1-Flash-1017-Uncensored-LoRA
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Componente de terceros: https://huggingface.co/dealignai/DeepSeek-V4.1-Flash-1017-UNCENSORED-FP8
- PR de SGLang usado para el despliegue: https://github.com/Phala-Network/sglang/pull/126
