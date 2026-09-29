# nkthebass/tinybrainbot-350m-v4-thinking

## Resumen

TinyBrainBot-350M-v4-Thinking es un modelo de lenguaje de 348.342.912 parametros desarrollado por el usuario nkthebass y publicado bajo licencia Apache 2.0. Se trata de un modelo de generacion de texto en ingles con modo de razonamiento explicito: cuando la peticion lo requiere, escribe su deliberacion dentro de etiquetas `<think>...</think>` antes de emitir la respuesta final. Esta afinado a partir del modelo base `nkthebass/tinybrainbot-350mV3-base`.

El modelo aborda un problema concreto: aplicar razonamiento deliberativo solo cuando aporta valor. Segun la model card, activa el bloque de razonamiento en el 95% de las preguntas cotidianas de decision, consejo o tipo "por que", y en el 0% de los saludos y la conversacion trivial, donde responde directamente. Es el hermano mayor del `TinyBrainBot-100M-v4-Thinking` y se entreno con la misma receta mas unas 11.500 preguntas y respuestas cotidianas verificadas (cocina, habitos de salud, dinero, mascotas, preguntas de "por que").

Su relevancia es doble: demuestra que el patron de "thinking" puede replicarse en un modelo de menos de 400 millones de parametros que cabe en cualquier GPU de consumo, y ofrece un punto de comparacion medido frente a su predecesor de 100M (3,06 frente a 2,48 sobre 5 en 40 preguntas evaluadas por un juez LLM). La model card no especifica la longitud de contexto del modelo; el ejemplo de despliegue con llama.cpp emplea `-c 2048`, pero este valor corresponde a la configuracion del servidor y no a una especificacion confirmada del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (etiqueta `llama`; afinado desde `nkthebass/tinybrainbot-350mV3-base`) |
| Parametros totales | 348.342.912 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el ejemplo de llama.cpp usa `-c 2048`) |
| Tipos de cuantizacion | safetensors en precision completa; GGUF F16 incluido (698 MB); otras cuantizaciones no disponibles |
| Idiomas soportados | ingles (`en`) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors y GGUF (F16) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de tipo Llama, con 348 millones de parametros, segun reflejan las etiquetas del repositorio y los pesos en safetensors. El modelo parte del checkpoint `nkthebass/tinybrainbot-350mV3-base` y se afina para chat con un formato de plantilla propio (`<|user|> ... <|end|> <|assistant|> ...`) y un patron de razonamiento inline delimitado por `<think>...</think>`. La model card no detalla el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO.

La innovacion principal es el llamado "adaptive thinking": el modelo decide cuando razonar y cuando no. El conjunto de datos de afinado anade unas 11.500 preguntas y respuestas cotidianas verificadas, cada una formulada de varias maneras distintas. Segun el autor, ese mismo corpus empeoro al modelo de 100M pero mejoro claramente a este de 350M, motivo por el cual solo se publica en esta version. No se documentan tecnicas de decodificacion especulativa ni mecanismos de atencion alternativos.

## Capacidades

- Generacion de texto en ingles con modo de razonamiento explicito (`<think>...</think>`) cuando la consulta lo requiere.
- Decision adaptativa de razonar: 95% de activacion en preguntas cotidianas de decision, consejo o "por que"; 0% en saludos y conversacion trivial.
- Chat conversacional multi-turno con plantilla de chat propia embebida en el GGUF.
- Rechazo de peticiones claramente daninas: 92% segun la model card (60 prompts por categoria).
- Baja tasa de falsos rechazos ante peticiones que solo suenan alarmantes ("como mato el moho"): ~5%.
- No se documenta soporte de tool calling, function calling, agentes, vision ni audio.
- Capacidad multilingue limitada al ingles; no se declaran otros idiomas.

## Casos de uso

- Chat de soporte de bajo coste: el modelo puede gestionar conversaciones cotidianas en ingles y decidir cuando necesita deliberar, con una huella de memoria inferior a 1 GB en F16, lo que permite ejecutarlo en un VPS modesto o en el propio navegador mediante llama.cpp.
- Asistente educativo para preguntas de "por que": su modo thinking genera explicaciones paso a paso utiles para prototipos de tutoria en ingles, aunque la model card advierte que los datos y la aritmetica suelen ser erroneos.
- Clasificacion de intencion y filtrado de contenido: con tasas de rechazo del 92% ante peticiones daninas y ~5% de falsos positivos, puede actuar como primera capa de moderacion en un pipeline, siempre con supervision adicional.
- Generacion de texto creativo breve: la model card incluye ejemplos de poemas cortos generados con los parametros por defecto, adecuados para demos y pruebas de concepto.
- Investigacion sobre razonamiento en modelos pequenos: sirve como sujeto de estudio reproducible para analizar como un modelo de 348M gestiona el presupuesto de deliberacion frente a un equivalente de 100M.
- Despliegue embebido y edge: al incluir un GGUF F16 de 698 MB, es viable en dispositivos con recursos limitados (Raspberry Pi, moviles de gama alta) para tareas de generacion de texto offline en ingles.
- Evaluacion comparativa de recetas de "thinking": permite contrastar la receta de datos (11.500 Q&A verificadas) entre escalas de 100M y 350M usando el mismo juez LLM.

## Benchmarks y rendimiento

Datos publicados en la model card, EleutherAI lm-eval v0.4.13, 0-shot, `acc_norm` (WinoGrande y MMLU usan `acc`):

| Benchmark | Este modelo | 350M V3 Instruct | 100M v4 Thinking |
|---|:---:|:---:|:---:|
| ARC-Easy | 51,9 | 50,9 | 52,5 |
| ARC-Challenge | 29,9 | 29,7 | 27,7 |
| OpenBookQA | 33,6 | 33,8 | 33,2 |
| PIQA | 66,5 | 66,6 | 64,9 |
| WinoGrande | 50,8 | 51,2 | 49,5 |
| MMLU | 23,8 | 24,4 | 25,3 |
| HellaSwag | 36,3 | 35,9 | 33,3 |
| Media | 41,8 | 41,8 | 40,9 |

Ademas, la model card reporta que, sobre 40 preguntas cotidianas evaluadas por un juez LLM (mismo juez, misma ejecucion), este modelo obtiene 3,06 sobre 5 frente a 2,48 del modelo de 100M. Como advierte el autor, los benchmarks de eleccion multiple puntuan la probabilidad de la respuesta sin permitir que el modelo razone, por lo que miden conocimiento, no si el razonamiento ayuda.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,4 GB en safetensors fp32; ~698 MB en GGUF F16 (dato de la model card); ~370 MB en Q8 y ~200-220 MB en Q4 (estimaciones estandar para 348M, no confirmadas por el autor).
- GPU recomendadas: cabe en cualquier GPU moderna. No requiere A100, H100 ni siquiera una RTX 4090; funciona holgadamente en RTX 3060, RTX 4070 o integradas con suficiente memoria.
- Cabe en GPU de consumo: si, en practicamente todas las GPU de consumo actuales con 2 GB o mas de VRAM.
- Opciones de despliegue: transformers (AutoModelForCausalLM), llama.cpp / llama-server, LM Studio, Ollama, y es compatible con text-generation-inference y endpoints (segun las etiquetas del repositorio).
- Parametros de generacion recomendados: `temperature 0.4`, `top_p 0.95`, `repetition_penalty 1.15` (ya configurados por defecto en `generation_config.json`). El autor advierte que temperaturas mas altas reducen la precision.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Media lm-eval | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TinyBrainBot-350M-v4-Thinking | 348M | no disponible | 41,8 | apache-2.0 | HuggingFace (safetensors + GGUF F16) |
| TinyBrainBot-350M V3 Instruct | 348M | no disponible | 41,8 | no disponible | HuggingFace |
| TinyBrainBot-100M-v4-Thinking | ~100M | no disponible | 40,9 | no disponible | HuggingFace |

No se dispone de datos de benchmarks frente a modelos externos de la misma categoria (por ejemplo, alternativas de menos de 500M de otros autores), por lo que la comparacion se limita a los hermanos de la misma familia. La diferencia clave frente al 350M V3 Instruct es la presencia del modo thinking: ambos empatan en la media de benchmarks de conocimiento (41,8), pero el modelo v4-thinking se entrena con datos de razonamiento y chat que el V3 no incorpora.

## Limitaciones y advertencias

- Modelo muy pequeno: los datos y la aritmetica fallan con frecuencia aunque el razonamiento suene seguro; los porcentajes y las conversiones de unidades son especialmente poco fiables.
- No es consejo medico: no distingue de forma fiable un signo de alarma de un sintoma leve. En caso de emergencia hay que contactar con los servicios de emergencia.
- En ocasiones trata un problema personal ordinario como una crisis y sugiere una linea de ayuda.
- Los rechazos son comportamiento aprendido y no una garantia; la tasa de rechazo ante peticiones daninas es del 92%, con un ~5% de falsos rechazos.
- Solo soporta ingles; no se declara capacidad multilingue.
- La longitud de contexto no esta especificada en la informacion disponible, lo que limita su uso en tareas que requieran ventanas amplias.
- No se documentan mecanismos de tool calling, agentes ni uso de herramientas.
- Riesgo de alucinacion elevado por el reducido tamano y la baja puntuacion en MMLU (23,8).
- Las cifras de rechazo proceden de 60 prompts por categoria y deben considerarse indicativas.
- Aunque la licencia Apache 2.0 permite uso comercial, las limitaciones de conocimiento y fiabilidad hacen necesario validar cualquier despliegue en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nkthebass/tinybrainbot-350m-v4-thinking
- Modelo base: https://huggingface.co/nkthebass/tinybrainbot-350mV3-base
- Version instruct del 350M V3: https://huggingface.co/nkthebass/tinybrainbot-350mV3-instruct
- Modelo hermano de 100M: https://huggingface.co/nkthebass/tinybrainbot-100m-v4-thinking
- No se han encontrado en la informacion proporcionada otros enlaces a papers, blogs, repositorios o demos adicionales.
