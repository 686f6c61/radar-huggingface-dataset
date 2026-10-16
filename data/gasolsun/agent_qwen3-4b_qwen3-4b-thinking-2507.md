# gasolsun/Agent_Qwen3-4B_Qwen3-4B-Thinking-2507

## Resumen

Agent_Qwen3-4B_Qwen3-4B-Thinking-2507 es un ajuste fino de Qwen/Qwen3-4B obtenido mediante destilacion on-policy (OPD) desde el modelo profesor Qwen/Qwen3-4B-Thinking-2507. Lo publica el usuario gasolsun en HuggingFace bajo licencia Apache 2.0, con 4.411.424.256 parametros (4,41 mil millones) y un repositorio de 8,8 GB en safetensors. El objetivo declarado es dotar a un modelo denso de 4B de capacidades agenticas (tool calling y dialogo multi-turno) sin recurrir a datos de entrenamiento reales ni a respuestas de referencia.

La contribucion tecnica principal es el metodo "Ask to Distill": se entrena con RL un generador de preguntas que produce enunciados capaces de exponer desacuerdo token a token, acotado y aprendible, entre profesor y alumno sobre las propias soluciones del alumno. De ese generador se muestrea un banco de preguntas que se filtra y deduplica, y con el se entrena al alumno mediante destilacion on-policy. El resultado es un modelo orientado a tareas de agente, evaluado en tau2-bench con un 41,9 % de pass^1 de media en los dominios airline, retail y telecom.

Es relevante ahora porque demuestra que un modelo de 4B puede alcanzar un rendimiento agentico no trivial en dominios transaccionales sin usar datos anotados por humanos, lo que abarata la construccion de agentes especializados y permite desplegarlos en hardware de consumo. No obstante, el propio autor documenta un rendimiento modesto y una caida acusada en el dominio no visto durante el entrenamiento (telecom, 30,0 %), por lo que debe evaluarse como una base de investigacion antes que como un componente listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No detallada en la model card; hereda la de Qwen/Qwen3-4B (modelo base declarado en las etiquetas) |
| Parametros totales | 4.411.424.256 (4,41 mil millones) |
| Parametros activos | No aplica (no se declara como MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible en el repositorio. El tamano del repo (8,8 GB) es coherente con pesos en bf16/fp16 (4,41 B x 2 bytes = 8,82 GB) |
| Idiomas soportados | No disponible en la model card |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |
| Modelo base (alumno) | Qwen/Qwen3-4B |
| Modelo profesor | Qwen/Qwen3-4B-Thinking-2507 |
| Modo de inferencia | Non-thinking (el autor indica `enable_thinking=False`) |
| Fecha de creacion en el repositorio | 2026-10-15 (segun metadatos de HuggingFace) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo mas alla de identificarlo como un ajuste de Qwen/Qwen3-4B con `library_name: transformers` y `pipeline_tag: text-generation`. Por tanto, la unica informacion fiable sobre estructura es la que se hereda del modelo base declarado; no se documentan en esta ficha detalles como el tipo de atencion, el tokenizador o el vocabulario.

El entrenamiento sigue el metodo "Ask to Distill". Primero se entrena con RL un generador de preguntas cuyo objetivo es escribir enunciados que expongan un desacuerdo token a token, acotado y aprendible, entre profesor (Qwen3-4B-Thinking-2507) y alumno (Qwen3-4B) sobre las soluciones que el propio alumno genera. De ese generador se muestrea un banco de preguntas que se filtra y deduplica. Despues se entrena al alumno con destilacion on-policy sobre ese banco. El autor subraya que no se utilizan preguntas de entrenamiento reales ni respuestas de referencia.

Los hiperparametros de la fase OPD son: objetivo de divergencia KL inversa por token calculado sobre los 16 tokens mas probables del alumno, ponderado por las probabilidades renormalizadas del alumno y sin recompensa de resultado; learning rate constante de 1e-6 con AdamW; temperatura de rollout de 1.0; pesos maestros en fp32 y computo en bf16. El banco de preguntas generado se publica como dataset asociado. El autor indica explicitamente que el alumno se entreno y se evaluo en modo non-thinking.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles (los ejemplos y la evaluacion estan en ese idioma).
- Uso de herramientas y function calling en entornos de agente: la evaluacion en tau2-bench exige llamadas a herramientas y gestion de estado de la conversacion en dominios de aerolinea, comercio minorista y telecomunicaciones.
- Razonamiento de multiples pasos orientado a la resolucion de tareas transaccionales (consultas, modificaciones y cancelaciones dentro de un flujo de negocio).
- Seguimiento de politicas de negocio especificas del dominio, segun el formato de evaluacion de tau2-bench.
- Inferencia en modo non-thinking: el autor recomienda pasar `enable_thinking=False` a la plantilla de chat; el modo thinking no fue entrenado ni evaluado.
- Capacidades multilingues: no disponibles (no declaradas en la model card).
- Vision, audio u otras modalidades: no disponibles (etiqueta `text-generation`, sin indicios de multimodalidad).
- Ventana de contexto y tareas de contexto largo: no disponibles.

## Casos de uso

- Agentes de atencion al cliente en aerolineas: el modelo fue evaluado especificamente en el dominio airline de tau2-bench (46,2 % de pass^1) y puede gestionar conversaciones multi-turno con llamadas a herramientas para consultar vuelos, cambiar reservas o gestionar equipaje dentro de las politicas del negocio.
- Asistentes de comercio minorista: en el dominio retail obtuvo el mejor resultado de los tres (49,4 % de pass^1), por lo que es adecuado para prototipos de agentes que consultan catalogo, estado de pedidos y devoluciones.
- Automatizacion de operaciones en telecomunicaciones con supervision humana: el dominio telecom alcanzo solo un 30,0 % de pass^1 y nunca se vio en entrenamiento, de modo que un uso realista es como asistente de primera linea con escalado a un agente humano cuando la confianza sea baja.
- Base para investigacion en destilacion on-policy: al publicarse junto al banco de preguntas sinteticas y describirse el objetivo OPD, sirve para reproducir y comparar variantes del metodo Ask to Distill sobre un modelo denso de 4B.
- Punto de partida para ajuste especifico de dominio: un modelo de 4,41 B en Apache 2.0 puede reentrenarse o afinarse con LoRA sobre datos propios de un vertical concreto partiendo de capacidades agenticas ya adquiridas.
- Despliegue on-premise con restricciones de privacidad: al caber en una GPU de consumo en cuantizacion de 4 bits, permite ejecutar un agente conversacional en infraestructura local sin enviar datos de clientes a terceros.
- Evaluacion comparativa de pipelines de agentes: puede usarse como linea base economica (4B) frente a modelos mucho mayores para medir la ganancia marginal de escala en tareas tipo tau2-bench.
- Generacion de dialogos sinteticos etiquetados por interaccion con herramientas, aprovechando su entrenamiento en formato de agente conversacional, siempre que se valide la correccion de las trazas resultantes.

## Benchmarks y rendimiento

| Benchmark | Dominio | Resultado |
|---|---|---|
| tau2-bench (test split, pass^1, %) | airline | 46,2 |
| tau2-bench (test split, pass^1, %) | retail | 49,4 |
| tau2-bench (test split, pass^1, %) | telecom | 30,0 |
| tau2-bench (test split, pass^1, %) | media | 41,9 |

Condiciones declaradas por el autor: split de test de tau2-bench, metrica pass^1 en porcentaje, simulador de usuario gpt-4o-mini y media sobre los tres dominios. El dominio telecom no se vio durante el entrenamiento. No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de ningun otro benchmark adicional, ni cifras comparativas de los modelos base y profesor.

## Requisitos de hardware

- Peso de los pesos en bf16/fp16: aproximadamente 8,8 GB, coherente con el tamano del repositorio y con 4,41 B de parametros.
- VRAM estimada solo para pesos: ~8,8 GB en bf16/fp16, ~4,4 GB en int8 y ~2,2-2,8 GB en cuantizacion de 4 bits. A estas cifras hay que sumar la memoria de la cache KV, que escala con la longitud de contexto efectiva (no declarada).
- GPU de gama alta: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) ejecutan el modelo en bf16 sin cuantizar.
- GPU de gama media: RTX 4080/4070 Ti (16 GB), RTX 4060 Ti (16 GB) o RTX 3090 (24 GB) son suficientes en bf16; una RTX 3060 de 12 GB requiere cuantizacion de 8 o 4 bits.
- Inferencia en CPU: viable en cuantizacion de 4 bits, con latencias no documentadas.
- Opciones de despliegue: transformers (procedimiento incluido en la model card), Text Generation Inference (la etiqueta `text-generation-inference` y `endpoints_compatible` aparece en el repositorio) y, mediante conversion a GGUF, llama.cpp u Ollama; no se publican pesos GGUF en el repositorio.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | tau2-bench (media pass^1) | Modo | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Agent_Qwen3-4B_Qwen3-4B-Thinking-2507 | 4,41 B | No disponible | 41,9 % | Non-thinking | Apache 2.0 | HuggingFace (gasolsun), 0 descargas |
| Qwen/Qwen3-4B (alumno base) | 4 B (aprox.) | No disponible en esta ficha | No disponible | Thinking y non-thinking segun configuracion | Apache 2.0 | HuggingFace (Qwen) |
| Qwen/Qwen3-4B-Thinking-2507 (profesor) | 4 B (aprox.) | No disponible en esta ficha | No disponible | Thinking | Apache 2.0 | HuggingFace (Qwen) |

No se dispone de resultados de tau2-bench publicados en la informacion proporcionada para el modelo base ni para el profesor, de modo que no es posible cuantificar la mejora atribuible a la destilacion. Tampoco se dispone de datos de otras alternativas de tamano similar (por ejemplo, familias de 3-4 B orientadas a agentes) para una comparacion con cifras verificables.

## Limitaciones y advertencias

- Rendimiento absoluto moderado: la media de 41,9 % de pass^1 en tau2-bench implica que mas de la mitad de las tareas evaluadas no se completan correctamente en un unico intento.
- Brecha de generalizacion entre dominios: telecom, nunca visto en entrenamiento, cae al 30,0 % frente al 49,4 % de retail, lo que sugiere sobreajuste al banco de preguntas sinteticas y una transferencia limitada a dominios nuevos.
- Modo de inferencia restringido: el modelo se entreno y evaluo en modo non-thinking; usar el modo thinking puede degradar el comportamiento, ya que no forma parte del entrenamiento declarado.
- Datos de entrenamiento totalmente sinteticos: no se usaron preguntas reales ni respuestas de referencia, por lo que el modelo puede heredar los sesgos y los puntos ciegos del generador de preguntas y del profesor, sin que exista una validacion con datos humanos documentada.
- Riesgo de alucinacion en llamadas a herramientas y en la aplicacion de politicas de negocio: no se documentan tasas de error especificas mas alla de la metrica pass^1.
- Idiomas: la model card no declara los idiomas soportados; la evaluacion esta en ingles, por lo que el comportamiento en castellano no esta verificado.
- Longitud de contexto no documentada: no se puede garantizar el comportamiento en conversaciones largas ni en tareas de recuperacion sobre documentos extensos.
- Sesgos conocidos: no documentados por el autor.
- Validacion comunitaria nula: 0 descargas y 0 likes en el momento de la consulta, y metadatos con fecha de creacion de 2026-10-15, lo que aconseja tratar el artefacto con cautela antes de integrarlo en produccion.
- Licencia Apache 2.0: permite uso comercial, pero al derivar de Qwen3-4B conviene revisar la documentacion de licencia del modelo base para confirmar condiciones adicionales.
- Ausencia de garantias de soporte o mantenimiento por parte del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/gasolsun/Agent_Qwen3-4B_Qwen3-4B-Thinking-2507
- Dataset del banco de preguntas: https://huggingface.co/datasets/gasolsun/Agent_Qwen3-4B_Qwen3-4B-Thinking-2507
- Modelo base (alumno): https://huggingface.co/Qwen/Qwen3-4B
- Modelo profesor: https://huggingface.co/Qwen/Qwen3-4B-Thinking-2507
- No se han encontrado en la busqueda web enlaces adicionales (paper, blog o repositorio) relacionados con este modelo.
