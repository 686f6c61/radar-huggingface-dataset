# Gyubeum/Qwen3-VL-8B-Instruct-UI-Genie-SFT-128K

## Resumen

Qwen3-VL-8B-Instruct-UI-Genie-SFT-128K es un modelo de recompensa generativo (process reward model) especializado en la evaluacion de acciones de agentes GUI moviles, desarrollado por el usuario Gyubeum. Se obtiene mediante fine-tuning supervisado (SFT) del modelo multimodal Qwen/Qwen3-VL-8B-Instruct sobre 127.976 muestras derivadas de 63.988 pares de preferencia del dataset UI-Genie-RM-517k. El modelo no genera texto libre: emite un unico token de clasificacion que indica si la accion propuesta por un agente es correcta (`<|+|>`, id 151669) o incorrecta (`<|-|>`, id 151670).

La relevancia de este checkpoint radica en su aplicacion como verificador de paso dentro de pipelines de agentes que operan interfaces moviles. Permite puntuar cada accion de un rollout, aplicar seleccion best-of-N o filtrar datos de entrenamiento por calidad de accion, tareas donde un clasificador binario rapido y consistente es preferible a un LLM generativo de proposito general. El modelo conserva la torre de vision de Qwen3-VL, por lo que procesa capturas de pantalla junto con el historial de acciones y el objetivo del usuario.

El checkpoint es un merge completo del adaptador LoRA en los pesos base, con el `lm_head` entrenado incluido, de modo que se carga como cualquier modelo Qwen3-VL estandar en `transformers` o vLLM sin cabezas adicionales. Con 8.767 millones de parametros y licencia Apache 2.0, resulta desplegable en una unica GPU de 24 GB en bfloat16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3-VL: torre de vision + LLM decoder) |
| Parametros totales | 8.767.123.696 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens de entrenamiento (truncado por la izquierda); contexto nativo heredado de Qwen3-VL no especificado en la model card |
| Tipos de cuantizacion | no disponible en la model card; al ser un checkpoint safetensors estandar de Qwen3-VL es compatible con las cuantizaciones habituales de la familia (bfloat16 como referencia) |
| Idiomas soportados | no disponible (la model card no detalla idiomas; hereda los del modelo base) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers); repo de 17,5 GB |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-VL-8B-Instruct, un transformer multimodal con torre de vision y decoder de lenguaje. El fine-tuning anade dos tokens especiales (`<|+|>` y `<|-|>`) al vocabulario y entrena mediante entropia cruzada sobre el token de juicio. Se aplica LoRA con r=64, alpha=32 y dropout 0,05 sobre todas las capas lineales del LLM, mas el `lm_head` completo, sumando 796,9 millones de parametros entrenables. La torre de vision y el aligner permanecen congelados. El adaptador se fusiona posteriormente en los pesos, produciendo un checkpoint autocontenido.

El entrenamiento usa 127.976 muestras de etiqueta unica procedentes de 63.988 pares elegido/rechazado: cada par se divide en dos ejemplos, el elegido etiquetado `<|+|>` y el rechazado `<|-|>` (63.988 de cada). Se ejecuta una epoca de 1.000 pasos con batch efectivo de 128 muestras (1 por GPU, acumulacion de gradiente 16, 8 GPUs), optimizador AdamW con lr 1e-4, schedule coseno, 5 % de warmup, weight decay 0,1 y clipping de gradiente 1,0. Se emplea bfloat16, DeepSpeed ZeRO-3, longitud maxima de 8.192 tokens y `max_pixels` de 1.048.576. El conjunto de entrenamiento no presenta solapamiento con el conjunto de evaluacion por pares de UI-Genie de 1k muestras.

## Capacidades

- Clasificacion binaria de correccion de acciones GUI: emite `<|+|>` (correcta, score 1,0) o `<|-|>` (incorrecta, score 0,0), con 0,5 para salidas fuera de esas dos clases.
- Puntuacion blanda mediante la probabilidad de `<|+|>` frente a `<|-|>` tras softmax sobre ambos logits.
- Comprension de capturas de pantalla de interfaces moviles junto con el objetivo del usuario y el historial de acciones previas.
- Procesamiento de contexto multi-paso: el prompt incluye la secuencia de acciones e imagenes de cada paso del rollout.
- Integracion con el formato de tool calling de Qwen (`<tool_call>`) para interpretar la accion del agente bajo evaluacion.
- Carga directa en `transformers` (clase `Qwen3VLForConditionalGeneration`) y en vLLM, sin adaptador ni cabeza adicional.
- Decodificacion de un unico token, lo que minimiza la latencia por evaluacion.
- No esta disenado para generacion de texto abierta, razonamiento general ni dialogo; su salida valida es el token de juicio.

## Casos de uso

- Verificacion de paso en rollouts de agentes moviles: durante la ejecucion de un agente sobre Android, cada accion se envia junto con la captura de pantalla actual y el historial para obtener una etiqueta de correcta o incorrecta, permitiendo abortar o corregir trayectorias en tiempo real.
- Seleccion best-of-N de acciones: se muestrean N acciones candidatas del agente y se puntuan con el modelo; se ejecuta la de mayor probabilidad de `<|+|>`, lo que reduce errores en pasos criticos como envio de formularios o navegacion entre pantallas.
- Filtrado de datos de entrenamiento: se evaluan trayectorias recogidas de interacciones reales o sinteticas y se descartan pasos con etiqueta negativa antes de reutilizarlas en SFT o RL, mejorando la calidad del corpus.
- Recompensa por proceso en RL de agentes GUI: el score blando sirve como senal densa por paso en algoritmos de policy optimization, complementando recompensas escasas de fin de tarea.
- Control de calidad en pipelines de automatizacion de pruebas moviles: se valida que cada accion de un script de test sobre la UI sea coherente con la pantalla observada, detectando desincronizaciones o cambios de layout.
- Evaluacion comparativa de agentes: se puntuan las trayectorias de distintos agentes sobre el mismo conjunto de tareas y se agregan los scores por paso para obtener una metrica granular de calidad, mas informativa que la tasa de exito final.
- Deteccion de alucinacion de acciones: se identifica cuando el agente propone una accion incompatible con la pantalla actual (elemento inexistente, coordenada fuera de lugar) mediante la etiqueta negativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en bfloat16: aproximadamente 17,5 GB para los pesos, mas overhead de activaciones y cache KV; en la practica requiere una GPU de 24 GB o superior para inferencia comoda.
- VRAM en cuantizacion de 8 bits: en torno a 9-10 GB de pesos, viable en GPUs de 12-16 GB (estimacion a partir del tamano del checkpoint; la model card no publica cuantizaciones oficiales).
- VRAM en cuantizacion de 4 bits: en torno a 5-6 GB de pesos, ajustable en GPUs consumer de 8 GB con contexto reducido (estimacion, no verificada por el autor).
- GPUs recomendadas: A100 40/80 GB, H100, L40S para despliegue en produccion con concurrencia; RTX 4090 (24 GB) para inferencia en bfloat16 de una sola instancia.
- GPU consumer: cabe en RTX 4090, RTX 3090 y A6000 en bfloat16; en RTX 4080/4070 Ti Super (16 GB) requiere cuantizacion de 8 bits.
- Opciones de despliegue: `transformers` con `Qwen3VLForConditionalGeneration`, vLLM (soporte de Qwen3-VL), y en general los runners compatibles con la familia Qwen3-VL.
- Latencia: al decodificar un unico token de clasificacion, la latencia dominante es el prefill del prompt multimodal (imagenes de hasta 1.048.576 pixeles); no se publican cifras de throughput ni latencia medidas.

## Comparativa con modelos similares

| Modelo | Objetivo | Pares / muestras | Salida | Licencia |
|---|---|---|---|---|
| Qwen3-VL-8B-Instruct-UI-Genie-SFT-128K | SFT (clasificacion discreta) | 63.988 pares / 127.976 muestras | Token `<|+|>` / `<|-|>` | Apache 2.0 |
| Qwen3-VL-8B-Instruct-UI-Genie-BT-128K | Bradley-Terry (recompensa continua) | 63.988 pares / 127.976 muestras | Score continuo | Apache 2.0 |
| Qwen3-VL-8B-Instruct-UI-Genie-BT-256K | Bradley-Terry (recompensa continua) | 127.993 pares / 255.986 muestras | Score continuo | Apache 2.0 |
| Qwen/Qwen3-VL-8B-Instruct (base) | Generacion multimodal general | no aplica | Texto libre | Apache 2.0 |

Los tres modelos UI-Genie comparten arquitectura y base, diferenciandose en la funcion de perdida y el volumen de datos. El modelo SFT ofrece una etiqueta discreta mas directa de interpretar; los Bradley-Terry proporcionan scores continuos, utiles cuando se necesita un ranking mas fino entre acciones. No se dispone de datos de benchmarks comparativos entre ellos en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo solo es valido como evaluador de acciones GUI moviles; su uso como generador de texto o asistente general producira salidas degeneradas o sin sentido.
- La salida esperada es un unico token; si el modelo emite otro token, el script de referencia asigna 0,5, lo que puede enmascarar fallos de formato del prompt.
- El entrenamiento se limita a 8.192 tokens con truncado por la izquierda: historiales de acciones muy largos pueden perder pasos iniciales relevantes para el juicio.
- La model card no documenta sesgos especificos; al derivar de datos de interaccion con interfaces moviles, puede heredar sesgos de cobertura de aplicaciones, resoluciones o idiomas presentes en UI-Genie-RM-517k.
- Riesgo de alucinacion acotado por la tarea, pero el juicio puede ser incorrecto en pantallas ambiguas, estados de carga o acciones parcialmente visibles.
- El conjunto de evaluacion por pares de UI-Genie (1k) no se solapa con el entrenamiento, pero no se publican metricas de precision ni acuerdo con anotadores humanos.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3-VL-8B-Instruct debe cumplir su propia licencia, que la model card no detalla.
- El checkpoint incluye el `lm_head` completo entrenado; no es un adaptador ligero, por lo que el repo ocupa 17,5 GB y no puede cargarse como LoRA sobre el base sin volver a extraer la diferencia de pesos.
- No se han publicado cuantizaciones oficiales (GGUF, AWQ, GPTQ) ni resultados de validacion en vLLM por parte del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Gyubeum/Qwen3-VL-8B-Instruct-UI-Genie-SFT-128K
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/Gyubeum/UI_Genie_128k
- Dataset de origen: https://huggingface.co/datasets/UI-Genie/UI-Genie-RM-517k
- Variante Bradley-Terry 128K: https://huggingface.co/Gyubeum/Qwen3-VL-8B-Instruct-UI-Genie-BT-128K
- Variante Bradley-Terry 256K: https://huggingface.co/Gyubeum/Qwen3-VL-8B-Instruct-UI-Genie-BT-256K
- Codigo de entrenamiento (AndroidFlux): https://github.com/glim-arc/AndroidFlux
- Paper referenciado (arXiv:2505.09388): https://arxiv.org/abs/2505.09388
