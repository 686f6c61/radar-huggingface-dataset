# Sentovara/Sentinel-S1-Qwen3-8B

## Resumen

Sentinel S1 Qwen3 8B es un adaptador LoRA desarrollado por Sentovara sobre el modelo base Qwen/Qwen3-8B (revision `b968826d9c46dd6066d109eabc6255188de91218`). Su proposito es dotar al modelo de una capacidad de abstención explicita: cuando la respuesta generada es probablemente incorrecta, el modelo la precede con el prefijo `UNSURE:`, de forma que un sistema externo pueda decidir consultar una fuente de informacion (por ejemplo, busqueda en Wikipedia) en lugar de confiar en una respuesta no fiable.

El modelo no anade conocimiento nuevo al base: segun la model card, acierta aproximadamente la misma proporcion de preguntas que Qwen3-8B en el conjunto global de pruebas. La mejora se concentra en la calibracion y el juicio: las respuestas no marcadas pasan de un 24,1% de acierto en el modelo original a un 54,6% en Sentinel, y el 83,2% de las respuestas erroneas propias quedan marcadas con `UNSURE:`.

Es relevante para pipelines de generacion aumentada por recuperacion (RAG) y para sistemas que necesitan decidir cuando derivar a busqueda o a un humano. El adaptador se distribuye bajo licencia Apache 2.0 y esta pensado para ejecutarse con el modo de razonamiento (thinking) desactivado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen3-8B |
| Parametros totales | no disponible (adaptador LoRA; el base Qwen3-8B tiene 8B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3-8B; no especificada en la informacion) |
| Tipos de cuantizacion | no disponible (el adaptador se publica en safetensors; cuantizacion del base no especificada) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA, libreria peft) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (rank maximo 16 segun la configuracion de vLLM indicada) sobre Qwen3-8B, un transformer decoder-only. No se modifica la arquitectura del base; el adaptador ajusta el comportamiento de generacion para introducir la marca de incertidumbre.

El entrenamiento sigue una receta basada en evidencia propia del modelo: se hicieron responder 10.000 preguntas con respuesta conocida (5.000 de conocimiento general de Natural Questions y 5.000 de matematicas de GSM8K), cinco intentos por pregunta, y cada respuesta se etiqueto automaticamente como correcta o incorrecta. Donde el modelo acerto en 4 o 5 de 5 intentos, se entreno a dar su propia respuesta sin marca; donde acerto en 0 o 1 de 5, se entreno a dar la misma respuesta precedida de `UNSURE:`. El entrenamiento incluyo ademas practica de conversacion general y charla cotidiana, todo generado por el propio Qwen3-8B para preservar estilo y habilidades. No se especifica el numero de tokens de entrenamiento ni si hubo RLHF o DPO. El codigo de entrenamiento no esta publicado; el de evaluacion si (`eval/`), junto con los resumenes de resultados (`results/`).

## Capacidades

- Generacion de texto y respuesta a preguntas de conocimiento general y matematicas.
- Calibracion explicita: marca con `UNSURE:` las respuestas con alta probabilidad de ser erroneas.
- Abstención operativa para pipelines RAG: la marca permite disparar un paso de recuperacion externa.
- Respuesta a preguntas usando pasajes de Wikipedia numerados, con cita de la fuente mediante `Source: <numero>`.
- Conversacion multi-turno con deteccion de errores propios (86,7% de errores marcados en conversacion segun la model card).
- Mantenimiento de instruction-following (IFEval 81,7%) y matemticas (GSM8K 92,9%) respecto al base.
- Capacidad multilingue limitada al ingles segun la model card.
- No se documenta soporte de tool calling, function calling, agentes, vision ni audio.

## Casos de uso

- Atencion al cliente con derivacion controlada: el sistema ejecuta Sentinel y, si la respuesta empieza por `UNSURE:`, la deriva a un agente humano o a una base de conocimiento en lugar de mostrarla al usuario. La marca actua como senal binaria de escalado.
- RAG con recuperacion bajo demanda: en lugar de recuperar siempre, el pipeline consulta primero a Sentinel; solo cuando marca incertidumbre se lanza la busqueda (BM25 + reranker) y se reformula la respuesta con los pasajes recuperados.
- Verificacion de hechos en produccion: la salida marcada se enruta a un verificador o a una fuente autoritativa, reduciendo el coste de revision manual al concentrarse solo en las respuestas dudosas.
- Asistentes internos sobre documentacion: para preguntas sobre manuales o politicas, el modelo responde directamente cuando esta seguro y cita pasajes cuando no lo esta, permitiendo auditar la fuente.
- Moderacion de respuestas generadas: uso como capa de control sobre un generador principal, marcando salidas de baja fiabilidad antes de publicarlas.
- Evaluacion de calidad de pipelines: la tasa de `UNSURE:` por dominio sirve como metrica de cobertura y fiabilidad del modelo sobre un corpus concreto.
- Chat conversacional con deteccion de errores: en dialogos multi-turno, las respuestas erroneas se marcan (86,7%) para que el sistema pueda corregir o pedir aclaracion.

## Benchmarks y rendimiento

Resultados publicados en la model card, evaluados por script sobre conjuntos fuera de entrenamiento, con thinking mode desactivado:

| Prueba | Qwen3 8B original | Sentinel S1 Qwen3 8B | Umbral | Resultado |
|---|---|---|---|---|
| Instruction-following (IFEval, 541 prompts) | 80,2% | 81,7% | ±2 puntos | Pasa |
| Matematicas (GSM8K test, 1.319 problemas) | 92,7% | 92,9% | ±2 puntos | Pasa |
| Respuestas sin marca correctas (9.255 preguntas) | 24,1% | 54,6% | +10 puntos | Pasa |
| Errores propios marcados | ninguno | 83,2% | al menos la mitad | Pasa |
| Respuestas terminadas limpiamente | 99,6% | 99,5% | al menos 95% | Pasa |
| Preguntas marcadas correctas tras busqueda (6.439) | 9,8% como conjetura | 45,4% | busqueda mejor que conjetura | Pasa |
| Respuestas sin marca correctas en conversacion (350 chats) | 52,7% | 79,6% | +10 puntos | Pasa |
| Errores propios marcados en conversacion | ninguno | 86,7% | al menos la mitad | Pasa |
| Chats ordinarios marcados | — | 3 de 50 | como maximo 10% | Pasa |

Pasan 9 de 9 comprobaciones. Las preguntas de validacion proceden de Natural Questions (validacion), SimpleQA, GSM8K (test) e IFEval.

## Requisitos de hardware

- El adaptador LoRA ocupa 0,2 GB; el peso real corresponde al modelo base Qwen3-8B completo.
- VRAM estimada para inferencia en bfloat16: no disponible en la informacion (depende del base Qwen3-8B; tipicamente en el rango de 16-18 GB para pesos en bf16 sin cuantizar, aunque este dato no se aporta en la model card).
- GPU recomendadas: no especificadas en la informacion. El adaptador se ha probado con vLLM 0.31.0 y transformers 5.22.1.
- Cabe en GPU consumer: no confirmado en la informacion proporcionada.
- Opciones de despliegue: transformers + peft (probado con transformers 5.22.1 y peft 0.21.2); vLLM con `enable_lora=True`, `max_lora_rank=16` y `chat_template_kwargs={"enable_thinking": False}` (probado con vLLM 0.31.0).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sentinel S1 Qwen3 8B | 8B (base) + LoRA | no disponible | Calibracion y abstención sobre Qwen3-8B | apache-2.0 | Hugging Face |
| Sentinel-S1-7B | 7B (base) + LoRA | no disponible | Misma receta sobre modelo de 7B | no disponible | Hugging Face |
| Sentinel-S1-32B | 32B (base) + LoRA | no disponible | Misma receta sobre Olmo de 32B | no disponible | Hugging Face |
| Qwen/Qwen3-8B (base) | 8B | no disponible | Modelo generativo general | no disponible | Hugging Face |

No se dispone de datos de benchmarks de los modelos Sentinel-S1-7B y Sentinel-S1-32B en la informacion proporcionada, por lo que no se incluye comparacion numerica entre variantes.

## Limitaciones y advertencias

- La busqueda externa solo resuelve parte del problema: mas de la mitad de las preguntas marcadas siguen sin terminar en una respuesta correcta segun la model card.
- El modelo no aprende conocimiento nuevo; su cobertura factual es la del Qwen3-8B original.
- Entrenado y evaluado con thinking mode desactivado (`enable_thinking=False`); su comportamiento con thinking activado no esta validado.
- Idiomas soportados limitados al ingles.
- La marca `UNSURE:` es un prefijo textual, no un score de probabilidad calibrado; el sistema debe tratar la salida como senal binaria.
- Posible riesgo de alucinacion en respuestas no marcadas, aunque con menor frecuencia que el base (54,6% de acierto frente a 24,1%).
- El codigo de entrenamiento no esta publicado, lo que limita la reproducibilidad de la receta.
- La licencia Apache 2.0 se declara para el adaptador; deben verificarse las condiciones del modelo base Qwen3-8B para uso comercial.
- No se documentan sesgos especificos ni evaluaciones de seguridad en la informacion disponible.
- No se documenta soporte de tool calling, vision ni audio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Sentovara/Sentinel-S1-Qwen3-8B
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Variante 7B: https://huggingface.co/Sentovara/Sentinel-S1-7B
- Variante 32B (Olmo): https://huggingface.co/Sentovara/Sentinel-S1-32B
- Metodo, resultados y limites (write-up): https://docs.google.com/document/d/1elcP-xWo-c0brn-lTzhtKyTaBuGjf0fL5-wCRz5AfaM/edit?usp=sharing
- Sitio del autor: https://sentovara.com
- Reranker usado en el paso de busqueda: https://huggingface.co/BAAI/bge-reranker-v2-m3
