# lixiaochuan2020/qwen3-4b-midtrain-baseline

## Resumen

qwen3-4b-midtrain-baseline es un ajuste de tipo mid-training sobre Qwen/Qwen3-4B, desarrollado por el usuario lixiaochuan2020, orientado a convertir el modelo base en un agente de busqueda (search agent) capaz de invocar una herramienta `wiki_search` sobre el corpus wiki-18 y razonar en multiples pasos hasta emitir una respuesta final. El modelo no introduce cambios arquitectonicos: mantiene la atencion causal completa (full attention) del Qwen3 original, con 4.022.468.096 parametros y licencia Apache 2.0.

El interes del modelo es fundamentalmente como referencia experimental. Sirve de baseline para una variante con atencion local por documento (local-KV per document) y como punto de partida para un posterior entrenamiento con RL. El corpus de mid-training fue generado por un profesor Qwen3-32B en modo thinking, que respondio 128.875 preguntas de NQ y HotpotQA actuando como agente de busqueda, produciendo 297.720 trayectorias supervisadas (243,78M tokens de asistente y 314,24M de resultados de herramienta, 684,86M en total).

Se distribuye en transformers con pesos en float32 (16,1 GB de repositorio), pensado para cargarse en bfloat16 en inferencia. No se han publicado datos de idiomas soportados ni resultados de benchmarks frente a modelos de la competencia, solo evaluaciones internas del autor sobre tareas de busqueda y matematicas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con atencion causal completa (Qwen3) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible de forma explicita; trayectorias de entrenamiento de hasta 16.384 tokens y filas empaquetadas de 18.432 tokens |
| Tipos de cuantizacion | no disponible en la model card; al ser safetensors float32 es convertible a bfloat16, int8 e int4 con herramientas estandar |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-4B y conserva su arquitectura transformer decoder-only con atencion causal completa, sin modificaciones en las capas de atencion. El entrenamiento es un mid-training supervisado de una sola epoca sobre 4.763 pasos, con learning rate 2e-5, schedule coseno, warmup del 3 % de los pasos, weight decay 0 y recorte de norma de gradiente a 1,0. Se uso Muon como optimizador para las matrices de pesos de las capas del decoder y AdamW para embeddings y normalizaciones. El entrenamiento se ejecuto en 8 GPU con autocast bf16, kernel FlexAttention, gradient checkpointing activado y semilla 42. Las filas se empaquetaron sin padding a 18.432 tokens, de modo que cada trayectoria atiende solo a si misma; la perdida cubre unicamente los tokens del asistente.

Los datos proceden de un profesor Qwen3-32B en modo thinking que respondio preguntas de entrenamiento de NQ y HotpotQA como agente de busqueda, cuatro veces por pregunta, usando la herramienta `wiki_search` sobre wiki-18 (e5-base-v2, 5 pasajes por busqueda, maximo 10 busquedas, maximo 16.384 tokens por trayectoria). Solo se conservaron las trayectorias que llamaron al menos a una busqueda y cuya respuesta final fue marcada como correcta por un juez basado en Qwen3-32B; las respuestas gold se usaron exclusivamente para esa verificacion, nunca como texto de entrenamiento. El formato de prompt es la plantilla de chat de Qwen3 con una unica herramienta declarada en el formato `<tool_call>`.

## Capacidades

- Generacion de texto conversacional con la plantilla de chat de Qwen3.
- Razonamiento multi-paso orientado a busqueda: planifica consultas, interpreta resultados de herramienta y encadena hasta 10 busquedas antes de responder.
- Tool calling con una herramienta especifica, `wiki_search`, en el formato `<tool_call>` de Qwen3; no se documenta soporte generico de function calling arbitrario.
- Respuesta con etiquetas `<answer>` o `<final_answer>` tras el razonamiento, segun el formato de evaluacion del autor.
- Razonamiento matematico en modo thinking sin herramientas: 0,923 de exactitud en GSM8K test y 0,900 en MATH-500.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Vision, audio u otras modalidades: no disponibles.

## Casos de uso

- Investigacion sobre agentes de busqueda: el modelo sirve como baseline reproducible para comparar tecnicas de atencion sobre pasajes recuperados, ya que el autor publica la variante local-KV entrenada con los mismos datos y ajustes.
- Reproduccion de experimentos de mid-training: con la configuracion documentada (Muon + AdamW, 4.763 pasos, 8 GPU, FlexAttention) se puede replicar el entrenamiento y estudiar el efecto del corpus sintetico generado por un profesor de 32B.
- Punto de partida para RL: el autor indica que el modelo `qwen3-4b-rl-baseline` se obtuvo por RL a partir de este checkpoint, por lo que es util como inicializacion en pipelines de reinforcement learning con recompensa de respuesta correcta.
- Preguntas y respuestas sobre Wikipedia con recuperacion externa: integrado con un recuperador sobre wiki-18 y el esquema de herramienta de entrenamiento, responde preguntas multi-hop (HotpotQA, 2WikiMultihopQA) con una tasa de respuesta del 97,4 % en el conjunto ID.
- Evaluacion de robustez fuera de dominio: el autor publica resultados en Bamboogle, FEVER, MuSiQue y PopQA, utiles para medir la generalizacion del agente a distribuciones distintas de las de entrenamiento.
- Generacion de trazas de razonamiento para destilacion o anotacion: el formato de trayectoria (pensamiento, llamada a herramienta, resultado, respuesta final) es directamente reutilizable como datos de supervision para modelos mas pequenos.
- Experimentos de eficiencia de atencion: al compararse contra la variante local-KV, permite cuantificar la perdida de exactitud al codificar cada pasaje por separado (0,585 frente a 0,412 en ID search).

## Benchmarks y rendimiento

Resultados publicados por el autor. ID search: 1.200 preguntas retenidas (HotpotQA dev 720, NQ test 240, 2WikiMultihopQA dev 240), 3 muestras por pregunta. OOD search: 1.025 preguntas (Bamboogle 125, FEVER 300, MuSiQue 300, PopQA 300), 1 muestra. Juez Qwen/Qwen3.5-9B sin thinking y temperatura 0.

ID search:

| Modo | 2WikiMultihopQA | HotpotQA | NQ | Accuracy | IC 95 % bajo | IC 95 % alto | Tasa de respuesta |
|---|---|---|---|---|---|---|---|
| Full | 0,529 | 0,600 | 0,596 | 0,585 | 0,561 | 0,609 | 0,974 |
| Local | 0,276 | 0,425 | 0,507 | 0,412 | 0,389 | 0,435 | 0,929 |

OOD search:

| Modo | Bamboogle | FEVER | MuSiQue | PopQA | Accuracy | IC 95 % bajo | IC 95 % alto | Tasa de respuesta |
|---|---|---|---|---|---|---|---|---|
| Full | 0,632 | 0,907 | 0,290 | 0,493 | 0,572 | 0,543 | 0,604 | 0,978 |
| Local | 0,440 | 0,817 | 0,197 | 0,393 | 0,465 | 0,435 | 0,499 | 0,975 |

Matematicas (sin pasajes, Full y Local coinciden):

| Dataset | Problemas | Accuracy | Tasa de respuesta en caja |
|---|---|---|---|
| GSM8K test | 1.319 | 0,923 | 0,985 |
| MATH-500 | 500 | 0,900 | 0,954 |

No se han publicado comparaciones con modelos de terceros en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en float32: aproximadamente 16 GB solo para pesos, mas activaciones y cache KV; en la practica requiere GPU de 24 GB o superior.
- VRAM estimada en bfloat16: aproximadamente 8 GB para pesos; cabe en RTX 4090 (24 GB), RTX 3090 (24 GB), L40S (48 GB) y A100/H100.
- VRAM estimada en int8: aproximadamente 4 GB para pesos; en int4, aproximadamente 2-2,5 GB, lo que permite ejecucion en GPUs consumer de 8-12 GB.
- Despliegue: compatible con transformers (`AutoModelForCausalLM`), text-generation-inference (etiqueta `text-generation-inference` en el repo) y, segun el autor, con vLLM y SGLang en modo estandar al usar atencion causal completa. No se documenta compatibilidad con llama.cpp u Ollama.
- Entrenamiento: el autor uso 8 GPU con FlexAttention y gradient checkpointing; no se especifica el modelo de GPU.
- Latencia y throughput: no disponibles. La evaluacion del autor se hizo con un bucle PyTorch token a token, sin cifras de rendimiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-4b-midtrain-baseline | 4,02B | no disponible (trayectorias de 16.384 tokens) | Agente de busqueda, atencion completa | Apache 2.0 | Publico en HuggingFace |
| qwen3-4b-midtrain-local-kv-per-document | 4,02B (base Qwen3-4B) | no disponible | Mismo corpus, atencion local por documento | Apache 2.0 | Publico en HuggingFace |
| qwen3-4b-rl-baseline | 4,02B (base Qwen3-4B) | no disponible | RL a partir de este baseline | Apache 2.0 | Publico en HuggingFace |
| Qwen/Qwen3-4B | 4,02B | no disponible en la informacion proporcionada | Modelo base generalista | Apache 2.0 | Publico en HuggingFace |

La comparativa se limita a la familia inmediata del autor y al modelo base, porque no se dispone de resultados de benchmarks frente a otros modelos de 4B en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo esta especializado en un unico flujo de agente de busqueda con la herramienta `wiki_search`; no se ha validado para function calling generico ni para otras herramientas.
- El corpus de entrenamiento es sintetico y generado por Qwen3-32B; puede heredar sesgos y errores factuales del profesor, aunque las trayectorias se filtraron por correccion de la respuesta final.
- Riesgo de alucinacion en preguntas que requieran conocimiento no cubierto por wiki-18 o cuando el modelo responda sin completar la busqueda.
- El rendimiento cae de forma notable fuera de dominio: 0,290 en MuSiQue y 0,493 en PopQA en el conjunto OOD, frente a 0,907 en FEVER.
- La atencion local por documento degrada la exactitud (0,412 frente a 0,585 en ID search), lo que sugiere que el modelo depende de la atencion completa sobre los pasajes concatenados.
- Pesos en float32 (16,1 GB de repositorio): es necesario convertir a bfloat16 o cuantizar para un despliegue eficiente.
- No se documentan idiomas soportados; el entrenamiento se hizo con NQ y HotpotQA, mayoritariamente en ingles, por lo que el rendimiento en castellano no esta validado.
- Licencia Apache 2.0 permite uso comercial, pero no se ofrece garantia alguna sobre el comportamiento en produccion.
- El codigo de entrenamiento y evaluacion referenciado (`ashmitkx/kv-midtrain`) es un repositorio privado, lo que limita la reproducibilidad completa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lixiaochuan2020/qwen3-4b-midtrain-baseline
- Variante local-KV: https://huggingface.co/lixiaochuan2020/qwen3-4b-midtrain-local-kv-per-document
- Variante con RL: https://huggingface.co/lixiaochuan2020/qwen3-4b-rl-baseline
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Repositorio de codigo (privado): https://github.com/ashmitkx/kv-midtrain
- Registro W&B del entrenamiento: https://forge.coreweave.com/wandb/cxcscmu/kv-midtrain-qwen3-4b/runs/qwen3-4b-midtrain-muon-baseline
