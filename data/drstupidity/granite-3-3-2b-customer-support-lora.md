# drstupidity/granite-3.3-2b-customer-support-lora

## Resumen

`drstupidity/granite-3.3-2b-customer-support-lora` es un adaptador LoRA publicado en HuggingFace por el usuario drstupidity sobre el modelo instruct `ibm-granite/granite-3.3-2b-instruct` de IBM. No es un modelo completo: el repositorio (0,1 GB, safetensors) contiene únicamente los pesos del adaptador, que deben combinarse con el modelo base para poder inferir. El ajuste se realizó sobre el dataset público Bitext de atención al cliente y el objetivo declarado es producir respuestas útiles en un registro profesional y empático para consultas de soporte.

El problema que aborda es doble. Por un lado, ofrece un asistente de soporte de muy bajo coste computacional: el entrenamiento se completó en una GPU de portátil (NVIDIA GeForce RTX 5060 Laptop) con un pico de 3,47 GB de memoria, lo que sitúa el despliegue en el rango de hardware de consumo. Por otro, documenta explícitamente el fallo típico de este tipo de ajustes: entrenar solo con ejemplos del tipo "cliente pregunta, agente ayuda" enseña al modelo a ayudar siempre, lo que degrada su comportamiento fuera de dominio. El autor corrige esto incorporando un 5 % de ejemplos sintéticos de rechazo.

La relevancia del modelo es, a fecha de la información disponible, más metodológica que de rendimiento: no se han publicado benchmarks estándar, el repositorio acumula 0 descargas y 0 likes, y su principal aportación es la separación deliberada entre los pesos y la capa de guardrails (NeMo Guardrails) que el autor usa en su propio servicio, junto con una auditoría de fuga de datos entre entrenamiento y prueba.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia IBM Granite 3.3) con adaptador LoRA; modelo base `ibm-granite/granite-3.3-2b-instruct` |
| Parametros totales | ~2.000 millones en el modelo base; el adaptador LoRA (r=16) anade un numero de parametros no disponible en la informacion proporcionada |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; la longitud maxima empleada durante el entrenamiento del adaptador fue de 640 tokens |
| Tipos de cuantizacion | no disponible para el adaptador (se distribuye en safetensors a precision completa). El modelo base admite cuantizacion segun su propia ficha |
| Idiomas soportados | no disponible en la ficha; los datos de entrenamiento son exclusivamente en ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA, libreria transformers) |
| Modelo base | ibm-granite/granite-3.3-2b-instruct |
| Metodo de ajuste | LoRA con r=16, alpha=32, dropout=0.05 |
| Modulos objetivo | q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj |
| Dataset de entrenamiento | bitext/Bitext-customer-support-llm-chatbot-training-dataset |
| Tamano del repositorio | 0,1 GB |
| Descargas / likes | 0 / 0 |
| Fecha de publicacion | 14 de septiembre de 2026 |

## Arquitectura y entrenamiento

El adaptador se aplica sobre un transformer decoder-only de la familia Granite 3.3 en su variante de 2.000 millones de parametros. El ajuste emplea LoRA con rango 16, alpha 32 y dropout 0,05, con los modulos de proyeccion cubiertos de forma completa: atencion (q, k, v, o) y capas feed-forward (gate, up, down). El entrenamiento uso una tasa de aprendizaje de 0,0002 con planificador coseno y warmup de 0,03, tamano de lote efectivo 32 y longitud maxima de secuencia 640. La perdida se calculo unicamente sobre los tokens del asistente (completion-only), lo que evita que el modelo aprenda a reproducir el prompt del sistema o los turnos del usuario.

Los datos proceden del dataset Bitext de soporte al cliente, con 27 intenciones y aproximadamente un millar de parafrasis generadas por intencion. El autor realizo la particion por conglomerados de casi duplicados en lugar de por filas, para evitar que texto casi identico apareciese a ambos lados de la frontera entrenamiento/prueba; el conjunto final conto con 31.343 filas de entrenamiento y 1.235 filas sinteticas de guardrail. La innovacion mas destacable es precisamente esa mezcla: dado que el corpus Bitext no contiene ni un solo ejemplo de negativa, el autor anadio un 5 % de ejemplos que rechazan peticiones fuera de dominio, rechazan intentos de sobrescritura de instrucciones, piden aclaracion ante mensajes poco informativos y se niegan a inventar datos de cuenta. Ademas se aplico un 15 % de dropout al prompt de sistema, de modo que el modelo sigue comportandose de forma razonable con otro prompt distinto o sin ninguno.

## Capacidades

- Generacion de texto conversacional en registro de atencion al cliente, en ingles y en un unico turno.
- Cobertura de las 27 intenciones del dataset Bitext (cancelaciones, devoluciones, cambios, estado de pedido, facturacion, entre otras).
- Redireccion de consultas fuera de dominio: el autor reporta una tasa de redireccion de 0,850 en su conjunto de sondas conductuales, por encima del 0,800 del modelo base.
- Rechazo de intentos de sobrescritura de instrucciones, entrenado explicitamente con ejemplos de "cuando no ayudar".
- Peticion de aclaracion cuando el mensaje del cliente es poco informativo.
- Tendencia entrenada a no inventar numeros de pedido, politicas ni datos de contacto (el propio autor la describe como tendencia, no como garantia).
- Robustez frente a variaciones del prompt de sistema, o incluso su ausencia, gracias al dropout del 15 % aplicado durante el entrenamiento.
- Tool calling o function calling: no documentado, no disponible.
- Comportamiento de agente o razonamiento multi-paso: no documentado, no disponible.
- Capacidades multilingues: no disponibles; el entrenamiento es solo en ingles.
- Vision, audio u otras modalidades: no disponibles.

## Casos de uso

- **Deflexion de tickets de nivel 1**: el modelo responde de forma autonoma a consultas frecuentes de soporte (cancelacion de pedidos, devoluciones, cambios de direccion, estado de envio) cubriendo las 27 intenciones del corpus Bitext, lo que permite reducir la carga del equipo humano en consultas repetitivas.
- **Despliegue on-premise por requisitos de privacidad**: al tratarse de un adaptador sobre un modelo de 2B, la inferencia cabe en GPU de consumo o incluso en portatiles con GPU, por lo que los datos del cliente no tienen que salir del perimetro de la organizacion, algo inviable con APIs de terceros en sectores regulados.
- **Generacion de borradores para agentes humanos**: el modelo produce una respuesta candidata que el agente revisa y envia; el tono profesional y la negativa a inventar datos de cuenta reducen el riesgo de que el borrador introduzca informacion falsa.
- **Triaje y enrutado de consultas**: aprovechando su tasa de redireccion de consultas fuera de dominio (0,850 en las sondas del autor), puede usarse como primera capa para decidir que tickets son resolubles automaticamente y cuales deben escalarse a un especialista.
- **Prototipado rapido de asistentes sectoriales**: el coste de reentrenamiento de un LoRA r=16 sobre un base de 2B es bajo (el autor completo el ajuste en una GPU de portatil), por lo que sirve como plantilla para crear variantes de dominio con datos propios.
- **Evaluacion comparativa base frente a ajustado**: el repositorio y su proyecto asociado documentan la perdida de validacion y las tasas de redireccion antes y despues del ajuste, lo que lo convierte en un caso de estudio util para equipos que quieran medir el efecto de la sobreayuda en sus propios fine-tunings.
- **Pruebas de robustez de guardrails propios**: al exponer los pesos sin la capa de NeMo Guardrails, permite medir el comportamiento del modelo puro y compararlo con el de una pila de seguridad, aislando el efecto de las reglas frente al del modelo.
- **Generacion de material de autoservicio**: las respuestas del modelo pueden usarse como semilla para redactar articulos de FAQ o macros de respuesta, siempre con revision humana previa a la publicacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La model card si incluye metricas conductuales internas del autor, que se reproducen a continuacion tal cual y no son comparables con evaluaciones estandarizadas:

| Metrica | Valor | Contexto |
|---|---|---|
| Tasa de redireccion fuera de dominio, modelo base | 0,800 | Conjunto de sondas conductuales reservado |
| Tasa de redireccion, fine-tuning solo con datos Bitext | 0,350 | Degradacion por aprendizaje de "ayudar siempre" |
| Tasa de redireccion, fine-tuning con 5 % de ejemplos de rechazo | 0,850 | Supera al modelo base |
| Perdida de validacion con ejemplos de rechazo | 0,6461 | Sin coste medible en dominio |
| Perdida de validacion, ejecucion de control sin ejemplos de rechazo | 0,6436 | Diferencia de 0,0025 |
| Perdida final de evaluacion | 0,6328 | Reportada en la tabla de entrenamiento |
| Consultas desviadas por la capa de guardrails en validacion real | 0,27 % | Corresponde al servicio del autor, no a los pesos |
| Consultas desviadas por la capa de guardrails en sonda adversarial | 9,4 % | Corresponde al servicio del autor, no a los pesos |

## Requisitos de hardware

- VRAM estimada para inferencia, partiendo de un modelo base de 2.000 millones de parametros y un adaptador LoRA de rango 16 (estimaciones calculadas a partir del recuento de parametros, no publicadas por el autor): aproximadamente 4-5 GB en bfloat16 o float16, 2-3 GB en cuantizacion de 8 bits y 1,5-2 GB en cuantizacion de 4 bits.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM sirve para precision reducida o cuantizada; una RTX 3060, RTX 4060, RTX 4090 o equivalentes son suficientes. Para lotes grandes o contexto largo son preferibles A100, H100 o L40S.
- El propio entrenamiento se completo en una NVIDIA GeForce RTX 5060 Laptop GPU con un pico de 3,47 GB, lo que confirma que tanto el ajuste como la inferencia caben en hardware de consumo.
- Opciones de despliegue: transformers con PEFT para cargar el adaptador sobre el modelo base; vLLM con soporte de adaptadores LoRA para servicio concurrente; llama.cpp u Ollama tras fusionar el adaptador con el base y convertir a GGUF; TGI para despliegue en servidor. El repositorio esta etiquetado como compatible con endpoints.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

Los datos de los modelos alternativos proceden de sus fichas publicas y se incluyen como referencia estructural; no se dispone de comparaciones de rendimiento con este adaptador. La columna de rendimiento comparado se marca como no disponible en todos los casos.

| Modelo | Parametros | Contexto | Licencia | Naturaleza | Rendimiento comparado |
|---|---|---|---|---|---|
| Este adaptador (sobre Granite 3.3 2B) | ~2B base + LoRA r=16 | no disponible (entrenado a 640 tokens) | Apache 2.0 | LoRA de soporte al cliente, un turno, solo ingles | no disponible |
| ibm-granite/granite-3.3-2b-instruct | 2B | no disponible en la informacion proporcionada | Apache 2.0 | Modelo base instruct de proposito general | Referencia: tasa de redireccion 0,800 frente a 0,850 del ajustado |
| Qwen2.5-3B-Instruct | 3,09B | 32.768 tokens | Apache 2.0 | Instruct de proposito general, multilingue | no disponible |
| Llama-3.2-3B-Instruct | 3,2B | 128.000 tokens | Licencia comunitaria de Llama 3.2 | Instruct de proposito general, multilingue | no disponible |
| Phi-3.5-mini-instruct | 3,8B | 128.000 tokens | MIT | Instruct de proposito general, multilingue | no disponible |

Frente a las alternativas, la diferencia relevante no es de rendimiento bruto sino de especializacion y coste: este adaptador esta afinado para un unico dominio (soporte al cliente en ingles, un turno) y su licencia Apache 2.0 es mas permisiva que la de Llama 3.2, aunque los modelos generalistas citados ofrecen contexto mucho mayor y cobertura multilingue.

## Limitaciones y advertencias

- Entrenado exclusivamente con datos sinteticos, en ingles y de un solo turno: no tiene entrenamiento conversacional multi-turno y la entrada en otros idiomas queda fuera de distribucion.
- No tiene acceso a sistemas de cuenta reales. Esta entrenado para no inventar numeros de pedido, politicas ni datos de contacto, pero el autor lo describe explicitamente como una tendencia y no como una garantia.
- Riesgo de alucinacion en datos verificables (plazos de entrega concretos, condiciones de politica, importes), especialmente si el prompt de sistema no aporta esa informacion.
- Sobreayuda en ausencia de las salvaguardas: sin los ejemplos de rechazo el modelo degrada su tasa de redireccion fuera de dominio del 0,800 al 0,350. Aunque el adaptador publicado ya incorpora esos ejemplos, la cobertura se limita a los patrones vistos en el conjunto sintetico.
- Los sesgos del dataset Bitext, generado sinteticamente, pueden trasladarse al modelo; no se ha publicado ningun analisis de sesgo demografico o cultural.
- La capa de NeMo Guardrails y la comprobacion de dominio mediante embeddings no estan incluidas en los pesos. Un despliegue que cargue solo el checkpoint obtendra el modelo sin ninguna de esas protecciones.
- Las metricas conductuales del 0,850 y del 0,27 % proceden de conjuntos internos del autor, no de evaluaciones independientes ni de benchmarks estandarizados.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero se distribuye sin garantias y el autor no ofrece soporte ni compromiso de mantenimiento.
- El repositorio acumula 0 descargas y 0 likes, sin validacion por parte de la comunidad ni verificacion externa de los resultados reportados.
- La fecha de publicacion registrada (14 de septiembre de 2026) implica una trayectoria publica muy corta.
- El modelo base de 2.000 millones de parametros limita la capacidad de razonamiento complejo en comparacion con modelos de mayor tamano; no es adecuado para tareas de analisis profundo o generacion de codigo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/drstupidity/granite-3.3-2b-customer-support-lora
- Modelo base: https://huggingface.co/ibm-granite/granite-3.3-2b-instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/bitext/Bitext-customer-support-llm-chatbot-training-dataset
- Repositorio del proyecto (auditoria de fuga de datos, diseno de evaluacion y resultados base frente a ajustado): https://github.com/adityadasika21/customer-support-slm
- Resultados de la busqueda web: no se han encontrado enlaces relevantes. Los resultados devueltos corresponden a paginas generales de ChatGPT y no guardan relacion con este modelo.
