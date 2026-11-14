# MuzammilAhmad/banking77-qwen2.5-0.5b-lora

## Resumen

`banking77-qwen2.5-0.5b-lora` es un adaptador LoRA publicado por MuzammilAhmad que convierte el modelo instructivo `Qwen/Qwen2.5-0.5B-Instruct` en un clasificador de intenciones para mensajes de clientes bancarios. El adaptador mapea cada mensaje a una de las 77 intenciones del conjunto de datos Banking77 y devuelve la respuesta en formato JSON (`{"intent": "<etiqueta>"}`). El modelo base es un transformer decoder-only de 0,5 mil millones de parametros de la familia Qwen2.5, y el adaptador anade 8,8 millones de parametros entrenables (1,75 % del total).

El problema que resuelve es concreto: la clasificacion de intenciones en atencion al cliente bancaria, una tarea donde los modelos pequenos en zero-shot rinden muy mal. Segun los datos del autor, el modelo base sin adaptador acierta solo el 25,2 % en el conjunto de test de Banking77, mientras que con el adaptador alcanza el 90,7 % de accuracy, con un 99,2 % de respuestas JSON validas y un 0,2 % de etiquetas inventadas. La latencia se mantiene practicamente identica (0,143 s frente a 0,146 s) porque el adaptador no incrementa el coste de inferencia tras el merge.

Es relevante ahora porque demuestra que un modelo de 0,5B cuantizado a Q4_K_M y servido con Ollama puede resolver una tarea de clasificacion de dominio especifico con precision cercana a la de modelos mucho mayores, a un coste computacional minimo. El adaptador se distribuye bajo licencia Apache 2.0, igual que el modelo base, y esta pensado para integrarse en pipelines de soporte bancario con salvaguardas adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador LoRA sobre proyecciones q/k/v/o/gate/up/down |
| Parametros totales | 0,5B (modelo base) + 8,8M entrenables en el adaptador (1,75 %) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (longitud maxima de secuencia en entrenamiento: 576 tokens) |
| Tipos de cuantizacion | Q4_K_M (usada en la evaluacion); el adaptador se puede convertir a GGUF y cuantizar con llama.cpp |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); convertible a GGUF para Ollama |

## Arquitectura y entrenamiento

El adaptador se entrena sobre `Qwen2.5-0.5B-Instruct`, un transformer decoder-only con atencion causal estandar. El metodo de entrenamiento es QLoRA con Unsloth: el modelo base se carga en 4 bits durante el entrenamiento y se aplica un adaptador LoRA con rango r=16, alpha=32, dropout 0,05, sobre las proyecciones q/k/v/o/gate/up/down. El entrenamiento usa 8.997 mensajes de entrenamiento y 1.002 de validacion (particion estratificada del conjunto de train de Banking77, semilla 42), con 2 epocas, batch efectivo de 16, learning rate 2e-4 con scheduler coseno y longitud maxima de secuencia de 576 tokens. La perdida se calcula solo sobre la respuesta del asistente (tokens del prompt enmascarados). El entrenamiento completo se ejecuto en una unica GPU T4 (Colab) en 35 minutos, con una perdida de validacion final de 0,026 sin senales de sobreajuste.

La innovacion tecnica principal no esta en la arquitectura sino en el diseno del prompt: el adaptador se entrena con la lista completa de las 77 etiquetas incluidas en el system prompt, de modo que el modelo aprende a seleccionar una etiqueta de un conjunto cerrado y a emitir JSON estricto. El adaptador se entreno contra la copia en 4 bits de Unsloth, pero los resultados reportados se obtienen tras fusionarlo (`merge_and_unload`) en el modelo base a precision completa, que es lo que apunta `adapter_config.json`. Para servir en Ollama se fusiona el adaptador, se convierte a GGUF con llama.cpp y se cuantiza a Q4_K_M.

## Capacidades

- Clasificacion de intenciones en dominio bancario: asigna cada mensaje de cliente a una de las 77 etiquetas de Banking77 y devuelve JSON con el campo `intent`.
- Generacion de texto instructivo heredada del modelo base Qwen2.5-0.5B-Instruct (el adaptador especializa, no elimina, la capacidad generativa).
- Salida estructurada: formato JSON estricto `{"intent": "<etiqueta>"}` en el 99,2 % de los casos.
- Clasificacion de un unico turno: no esta entrenado para conversaciones multi-turno.
- Capacidad multilingue: limitada al ingles, unico idioma declarado y usado en el entrenamiento.
- No dispone de tool calling, function calling ni capacidades de agente especificas del adaptador; cualquier capacidad de este tipo vendria del modelo base y no esta validada en esta ficha.
- No soporta vision ni audio.

## Casos de uso

- Enrutamiento de tickets en atencion al cliente bancaria: el modelo clasifica cada mensaje entrante en una de las 77 intenciones y el sistema lo deriva al equipo o flujo correspondiente; la latencia de 0,143 s en Q4_K_M permite procesar colas de tickets en tiempo real.
- Triaje previo a un agente conversacional: se usa como primer paso para identificar la intencion del usuario y seleccionar el prompt o la herramienta adecuada en un sistema mayor, reduciendo el coste frente a enviar cada mensaje a un modelo grande.
- Etiquetado automatico de datos historicos: clasificar grandes volumenes de mensajes de soporte ya archivados para construir datasets etiquetados o analizar la distribucion de motivos de contacto.
- Monitorizacion de motivos de contacto: agregar las intenciones clasificadas para detectar picos en categorias como `card_arrival` o `automatic_top_up` y alimentar paneles operativos.
- Filtro con salvaguardas para mensajes fuera de dominio: combinado con el umbral de confianza descrito por el autor (que responde `unknown` por debajo de un umbral y captura el 82,7 % de mensajes fuera de tema), sirve como pre-filtro antes de escalar a un humano o a un modelo mayor.
- Despliegue en entornos con recursos limitados: al caber en una GPU consumer y ejecutarse en Ollama con Q4_K_M, es adecuado para prototipos, demos o despliegues en el borde sin infraestructura de GPU dedicada.
- Evaluacion comparativa de tecnicas de fine-tuning: el repositorio de GitHub incluye codigo, evaluacion y salvaguardas, por lo que sirve como referencia reproducible para experimentos de QLoRA sobre tareas de clasificacion.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (conjunto de test completo de Banking77, 3.080 mensajes; ambos modelos con el mismo prompt, cuantizados a Q4_K_M y servidos con Ollama):

| Modelo | Accuracy | JSON valido | Etiquetas inventadas | Latencia |
|---|---|---|---|---|
| Qwen2.5-0.5B-Instruct, zero-shot | 25,2 % | 97,1 % | 25,2 % | 0,146 s |
| + este adaptador | 90,7 % | 99,2 % | 0,2 % | 0,143 s |

El autor indica ademas que ninguna intencion obtiene un 0 % de acierto con el adaptador, mientras que el modelo zero-shot tenia 20 intenciones con 0 %. La metrica de accuracy del model-index (0,907) figura como no verificada (`verified: false`).

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; un modelo de 0,5B en Q4_K_M ocupa del orden de 0,4-0,5 GB de pesos, por lo que cabe holgadamente en cualquier GPU consumer. La cifra exacta no esta disponible en la informacion proporcionada.
- GPU recomendadas: el autor entreno en una unica T4 (Colab); para inferencia basta una GPU consumer moderna (por ejemplo, RTX 3060 o superior) o incluso CPU.
- Cabe en GPU consumer: si, practicamente en cualquier GPU consumer con suficiente VRAM para el contexto, y en CPU mediante llama.cpp/Ollama.
- Opciones de despliegue: Ollama (con GGUF Q4_K_M, el escenario evaluado), llama.cpp (conversion a GGUF), transformers + PEFT (fusion del adaptador con `merge_and_unload`), y cualquier runtime compatible con GGUF.
- Latencia y throughput: latencia de 0,143 s por mensaje en la configuracion evaluada (Q4_K_M via Ollama); el throughput agregado no esta disponible en la informacion proporcionada.

## Comparativa con modelos similares

No se han publicado comparativas con modelos alternativos en la informacion proporcionada. La unica comparacion disponible es contra el propio modelo base sin adaptador:

| Modelo | Parametros | Contexto | Accuracy Banking77 (test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| banking77-qwen2.5-0.5b-lora | 0,5B + 8,8M LoRA | no disponible | 90,7 % | Apache 2.0 | Hugging Face (PEFT) |
| Qwen2.5-0.5B-Instruct (zero-shot) | 0,5B | no disponible | 25,2 % | Apache 2.0 | Hugging Face |

No se dispone de datos de otros clasificadores de intenciones (por ejemplo, basados en BERT o en modelos mayores) en la informacion proporcionada para establecer una comparativa adicional.

## Limitaciones y advertencias

- Toda entrada recibe una de las 77 etiquetas: mensajes fuera de dominio como "what's the weather?" tambien se clasifican con una etiqueta bancaria. El repositorio de GitHub anade salvaguardas que responden `unknown` por debajo de un umbral de confianza, capturando el 82,7 % de mensajes fuera de tema y reduciendo los errores confiados del 9,3 % al 4,4 %.
- Glitch de salida conocido: aproximadamente el 1 % de las respuestas omite la comilla de cierre (`{"intent": "automatic_top_up}`). La etiqueta suele ser correcta, por lo que un parser estricto deberia reparar en lugar de descartar.
- Solo ingles y un unico dominio (banca); no se ha entrenado para conversaciones multi-turno ni para mensajes multiples.
- Requiere exactamente el mismo prompt de sistema con la lista completa de las 77 etiquetas usada en entrenamiento; `labels.json` del repositorio contiene las etiquetas en el orden correcto.
- No debe usarse para tomar decisiones sobre clientes sin supervision humana.
- La licencia Apache 2.0 permite uso comercial, pero el conjunto de datos Banking77 se distribuye bajo CC BY 4.0 (Casanueva et al., 2020), lo que conviene verificar segun el uso previsto.
- El adaptador se entreno contra la copia en 4 bits de Unsloth del modelo base; los resultados reportados corresponden a la fusion en el modelo a precision completa.
- Riesgo de alucinacion de etiquetas: aunque el autor reporta solo un 0,2 % de etiquetas inventadas, persiste un riesgo residual que conviene validar contra la lista cerrada de etiquetas en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MuzammilAhmad/banking77-qwen2.5-0.5b-lora
- Repositorio de codigo, evaluacion y salvaguardas: https://github.com/muzammilahmad01/llm-finetune-banking77
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Conjunto de datos Banking77: https://huggingface.co/datasets/PolyAI/banking77
- Paper de Banking77 (Casanueva et al., 2020): no disponible en la informacion proporcionada
- Demo: no disponible en la informacion proporcionada
