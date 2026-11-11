# gutoportelaa/qwen2.5-1.5b-segjusticidadania-destilado-d2

## Resumen

El modelo `gutoportelaa/qwen2.5-1.5b-segjusticidadania-destilado-d2` es un adaptador LoRA sobre `Qwen/Qwen2.5-1.5B-Instruct` entrenado mediante destilación de conocimiento en caja blanca a partir de `Qwen/Qwen2.5-7B-Instruct` como profesor. Lo desarrolla el usuario gutoportelaa en el marco del Trabajo Final de la asignatura Tópicos en Inteligencia Artificial (PLN) de la UFPI (Brasil, 2026.2). Su propósito es responder preguntas sobre producción científica brasileña en seguridad pública, justicia y ciudadanía a partir de fragmentos recuperados (RAG), citando el fragmento empleado y rechazando responder cuando la respuesta no figura en los fragmentos proporcionados.

El modelo es relevante por dos motivos. Primero, documenta de forma explícita y honesta un resultado negativo: la destilación transfirió el formato de respuesta (cita del fragmento correcto) pero no mejoró la precisión factual respecto al alumno original, y no hubo transferencia de conocimiento en la mitad del benchmark sin contexto. Segundo, sirve como referencia metodológica reproducible para experimentos de destilación con recursos limitados (una única RTX 3080 de 10 GB), separando la fase de generación de distribuciones del profesor de la fase de entrenamiento del alumno.

El adaptador tiene un tamaño de repositorio de 0,1 GB, se distribuye bajo licencia Apache 2.0, está orientado exclusivamente al portugués y se publica como artefacto de investigación y docencia, no como modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador LoRA (PEFT) |
| Parametros totales | 1.500 millones en el modelo base; el adaptador LoRA no declara recuento propio |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-1.5B-Instruct) |
| Tipos de cuantizacion | El profesor se cuantizo en 4 bits (nf4) para generar distribuciones; el adaptador se distribuye en safetensors sin cuantizar |
| Idiomas soportados | Portugues (pt) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA, libreria PEFT) |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de la familia Qwen2.5 con 1.500 millones de parametros. Sobre el se aplica un adaptador LoRA con r = 16, alpha = 32, dropout 0,05, en las proyecciones q, k, v, o, gate, up y down. El entrenamiento usa tasa de aprendizaje 2·10⁻⁴ con calentamiento del 3 % y decaimiento coseno, 2 epocas, 302 pasos y lote efectivo de 16, con la perdida calculada solo sobre los tokens de la respuesta.

La innovacion metodologica es la destilacion en caja blanca con una perdida combinada: L = 0,5 · entropia cruzada(texto del profesor) + 0,5 · KL(p_profesor_top20 ‖ p_alumno), con la distribucion del profesor restringida a las 20 probabilidades mas altas en cada posicion y renormalizada, a temperatura 1. El proceso se divide en dos fases para caber en una GPU de 10 GB: primero el profesor cuantizado en 4 bits (nf4) calcula y graba las distribuciones de los 2.414 pares de entrenamiento (36 minutos); despues el alumno entrena contra esas distribuciones (91 minutos en una RTX 3080). La configuracion es identica a la del modelo D1 (caja negra), de modo que ambos difieren unicamente en el termino KL.

Los datos de entrenamiento son 2.705 pares `instruction`/`input`/`output` generados por el profesor a partir del corpus `segjusticidadania-curated`: 1.844 preguntas ancoradas con cinco fragmentos y respuesta terminada en `[k]`, 600 rechazos y 261 resumenes. La validacion usa el 10 % de los documentos, separados por documento (283 pares), y ningun documento de origen de un item de benchmark entra en los pares de entrenamiento.

## Capacidades

- Generacion de texto en portugues orientada a respuesta extractiva sobre fragmentos recuperados.
- Citacion explicita del fragmento empleado mediante la marca `[k]` al final de la respuesta.
- Rechazo controlado: devuelve exactamente "Não encontrado nos documentos." cuando la respuesta no esta en los fragmentos.
- Respuesta a preguntas de opcion multiple sobre leyes, sumulas y articulos sin contexto (capacidad heredada del modelo base).
- Resumen de documentos del dominio (261 pares de resumenes en el conjunto de entrenamiento).
- Integracion en pipelines RAG mediante plantilla de chat (`apply_chat_template`) con mensajes de sistema y usuario.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Asistente RAG de consulta documental juridica: dado un conjunto de fragmentos recuperados por un buscador vectorial, el modelo responde citando el fragmento concreto y rechaza cuando no hay evidencia, lo que permite auditar la trazabilidad de cada respuesta.
- Prototipo educativo de destilacion: sirve como referencia reproducible para asignaturas de PLN, ya que el repositorio incluye `treino.json` con configuracion e historial de perdidas y separa claramente las dos fases del entrenamiento.
- Evaluacion comparativa de estrategias de destilacion: al compartir configuracion con el modelo D1 (caja negra), permite aislar el efecto del termino KL en experimentos controlados.
- Generacion de respuestas extractivas con abstención: util en entornos donde un falso positivo es costoso y se prefiere una tasa de rechazo elevada (8 de 52 preguntas respondibles) frente a respuestas inventadas.
- Clasificacion y respuesta a preguntas de opcion multiple sobre normativa: la mitad sin contexto del benchmark (48 items) muestra el comportamiento del modelo en tareas de conocimiento cerrado sobre leyes y sumulas.
- Despliegue en hardware de consumo para docencia: el adaptador y el modelo base de 1.500 millones de parametros caben en GPUs de gama media, lo que facilita demostraciones en aula sin infraestructura dedicada.
- Base para experimentos de ajuste posterior: al ser un adaptador LoRA sobre un modelo Apache 2.0, puede combinarse con otros adaptadores o continuar el entrenamiento con nuevos corpus del dominio.

## Benchmarks y rendimiento

Benchmark de 100 items (`itens/bench_q4.jsonl`): 52 preguntas con cinco fragmentos fijos y 48 items de opcion multiple sobre leyes, sumulas y articulos, sin contexto.

| Modelo | Con contexto (52) | Cita el fragmento correcto | Rechazos | Sin contexto (48) | Total (100) |
|---|---|---|---|---|---|
| Profesor, Qwen2.5-7B-Instruct (nf4) | 40 | 20 | 4 | 38 | 78 |
| Alumno antes, Qwen2.5-1.5B-Instruct | 35 | 4 | 1 | 32 | 67 |
| D1, caja negra | 25 | 35 | 9 | 32 | 57 |
| D2, caja blanca (este modelo) | 31 | 39 | 8 | 32 | 63 |

Lectura de los resultados segun el autor: la destilacion transfirio el formato (la citacion del fragmento correcto pasa de 4 a 39 sobre 52), pero no el acierto; con contexto, D2 queda 4 items por debajo del alumno original (McNemar, p = 0,39; no significativo), frente a 10 items del D1 (p = 0,041). La caja blanca reduce las respuestas extraidas del fragmento equivocado de 8 (D1) a 2 (D1 frente a D2: p = 0,21). No hay transferencia de conocimiento en la mitad sin contexto: ninguna eleccion cambia respecto al alumno original.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 1.500 millones de parametros ocupa aproximadamente 3 GB en FP16 y alrededor de 1 GB en cuantizacion de 4 bits; el adaptador LoRA anade un consumo marginal (repositorio de 0,1 GB).
- GPU recomendadas: el entrenamiento se realizo en una RTX 3080 de 10 GB, que constituye la referencia practica del proyecto; para inferencia son suficientes GPUs de consumo con 4 GB o mas de VRAM en cuantizacion de 4 bits.
- Cabe en GPU de consumo: si, en tarjetas tipo RTX 3060, RTX 4060, RTX 3080 o superiores, tanto en FP16 como cuantizado.
- Opciones de despliegue: la model card documenta el uso con `transformers` y `peft` (`PeftModel.from_pretrained` sobre el modelo base). No se documentan configuraciones especificas para vLLM, llama.cpp, Ollama o TGI; al tratarse de un adaptador LoRA en safetensors, seria necesario fusionarlo con el modelo base para su uso en motores que no soporten PEFT de forma nativa.
- Latencia y throughput: no disponibles en la informacion proporcionada. Solo se documentan tiempos de entrenamiento (36 minutos para la generacion de distribuciones del profesor y 91 minutos para el entrenamiento del alumno).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Resultado en benchmark (100) | Licencia | Formato |
|---|---|---|---|---|---|
| D2, caja blanca (este modelo) | 1.500 M (base) + LoRA | No disponible | 63 | Apache 2.0 | safetensors (LoRA) |
| D1, caja negra | 1.500 M (base) + LoRA | No disponible | 57 | No disponible en la informacion proporcionada | No disponible |
| Alumno original, Qwen2.5-1.5B-Instruct | 1.500 M | No disponible | 67 | Apache 2.0 | safetensors |
| Profesor, Qwen2.5-7B-Instruct (nf4) | 7.000 M | No disponible | 78 | Apache 2.0 | safetensors |

La comparativa se limita a los modelos evaluados en el mismo benchmark del autor. No se dispone de datos de benchmarks estandar (MMLU, HumanEval, GSM8K) para este adaptador ni para sus alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Tasa de rechazo superior a la del profesor: 8 de 52 preguntas respondibles, herencia del 22 % de rechazos en los pares de entrenamiento.
- El profesor que genero las distribuciones esta cuantizado en 4 bits (nf4), y el texto de los pares proviene de otra cuantizacion en 4 bits del mismo modelo, lo que introduce ruido en la senal de destilacion.
- Benchmark pequeno: con 52 items, las diferencias de hasta unos 6 items entre modelos no son estadisticamente significativas, segun el propio autor.
- Ausencia de transferencia de conocimiento demostrada: en la mitad sin contexto, el modelo no mejora al alumno original en ninguna eleccion.
- El modelo esta orientado exclusivamente al portugues; no se documenta soporte de otros idiomas.
- Riesgo de alucinacion no cuantificado de forma independiente: el benchmark mide acierto y citacion, pero no incluye una metrica especifica de fidelidad factual fuera del conjunto de fragmentos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor declara explicitamente que el modelo es de uso de investigacion y ensenanza, y que las respuestas dependen de los fragmentos proporcionados y no sustituyen la lectura de las fuentes.
- No se documentan sesgos conocidos ni evaluaciones de sesgo en la informacion proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gutoportelaa/qwen2.5-1.5b-segjusticidadania-destilado-d2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Dataset de experimentos: https://huggingface.co/datasets/gutoportelaa/segjusticidadania-experimentos
- Corpus curado: https://huggingface.co/datasets/gutoportelaa/segjusticidadania-curated
