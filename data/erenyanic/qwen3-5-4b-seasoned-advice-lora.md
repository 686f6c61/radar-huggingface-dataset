# erenyanic/qwen3.5-4b-seasoned-advice-lora

## Resumen

`Erenyanic/qwen3.5-4b-seasoned-advice-lora` es un adaptador LoRA de 32 dimensiones entrenado sobre `unsloth/Qwen3.5-4B`, un checkpoint de 4.000 millones de parametros de la familia Qwen3.5 con capacidades multimodales (vision-lenguaje). El ajuste se realizo con Unsloth sobre el dataset `Erenyanic/seasoned-advice-dataset`, que contiene 500 conversaciones bilingues (turco e ingles) de cocina y ciencia alimentaria extraidas de Seasoned Advice (cooking.stackexchange.com), con trazas de razonamiento en cada turno de asistente.

El adaptador se entrena unicamente sobre las capas de lenguaje, con r=32 y 2 epocas, sobre 1.000 ejemplos (ambas divisiones de idioma). El modelo resultante responde con un bloque de razonamiento ` thinking` seguido de la respuesta, en turco o ingles. Su relevancia radica en demostrar un caso de ajuste fino de bajo coste para un dominio especifico, con una plantilla de chat verificada byte a byte contra la del modelo base.

La principal caracteristica distintiva es que el adaptador hace que el modelo responda de forma mucho mas breve (~860 caracteres de media frente a ~3.300 del base), acercandose al registro de las respuestas humanas de referencia (~990 caracteres). Esto le hace ganar en proximidad a la referencia pero perder en exhaustividad frente a su propio modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA adapter sobre Qwen3.5-4B (transformer, checkpoint vision-lenguaje) |
| Parametros totales | no disponible (adaptador LoRA r=32; modelo base 4B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (adaptador en formato PEFT) |
| Idiomas soportados | turco (tr), ingles (en) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena sobre `unsloth/Qwen3.5-4B`, un modelo transformer de la familia Qwen3.5 que, segun indica el propio repositorio, es un checkpoint de vision-lenguaje (VL). El ajuste fino se realiza con la libreria Unsloth aplicando LoRA con rango r=32, restringido exclusivamente a las capas de lenguaje, durante 2 epocas sobre 1.000 ejemplos del dataset Seasoned Advice, que combina 500 conversaciones en turco y 500 en ingles con trazas de razonamiento en cada turno de asistente.

El entrenamiento es de tipo SFT (supervised fine-tuning). El dataset proviene de contenido generado por la comunidad de Stack Exchange, sin verificacion externa. El adaptador se distribuye con una plantilla de chat escrita a mano (`chat_template.jinja`) que reproduce la gramatica ChatML de Qwen3.5 con bloques ` thinking` y ` response`, y que ha sido verificada mediante 2.018 renders (18 casos construidos manualmente mas las 1.000 filas de entrenamiento en ambos modos de generacion) contra la plantilla estandar del modelo base, con resultados identicos byte a byte. La plantilla soporta roles `system`/`developer`/`user`/`assistant`/`tool`, contenido en formato texto plano o listas de partes, tool calling en forma XML `<tool_call><function=name><parameter=x>`, y gestion de razonamiento con `enable_thinking`.

## Capacidades

- Generacion de texto con razonamiento explicito: el modelo emite un bloque ` thinking` con la traza de razonamiento seguido de la respuesta final.
- Conversacion multi-turno en turco e ingles sobre cocina, recetas, tecnicas culinarias y ciencia de los alimentos.
- Soporte de tool calling en formato XML `<tool_call>` propio de la familia Qwen3.5, incluyendo respuestas de herramienta como `<tool_response>`.
- Soporte de contenido multimodal heredado del checkpoint base: la plantilla renderiza partes de imagen y video como `<|vision_start|><|image_pad|><|vision_end|>`.
- Respuestas breves y concisas en el registro del corpus de origen (~860 caracteres de media).
- Capacidad de suprimir el bloque de razonamiento mediante `enable_thinking=False`.

## Casos de uso

- Asistente de cocina domestica: el modelo responde a preguntas sobre sustituciones de ingredientes, tiempos de coccion o tecnicas basicas con respuestas breves y directas, adecuadas para integracion en aplicaciones de recetario o asistentes de voz.
- Chatbot de ciencia alimentaria para hablantes de turco e ingles: su naturaleza bilingue permite atender consultas en ambos idiomas sin cambiar de modelo, util para plataformas de comida a domicilio o comunidades de cocina regional.
- Generacion de contenido editorial breve: el registro conciso del adaptador lo hace adecuado para producir descripciones de recetas, tarjetas de ingredientes o respuestas para secciones de FAQ de sitios de cocina.
- Evaluacion de tecnicas de ajuste fino de bajo coste: sirve como caso de estudio para comparar el efecto de un adaptador LoRA de dominio estrecho frente a su modelo base en tareas de generacion breve.
- Prototipado de agentes con tool calling en el dominio culinario: la plantilla soporta llamadas a herramientas en formato XML, permitiendo construir agentes que consulten APIs de recetas o bases de datos de ingredientes.
- Benchmarking de modelos pequenos en dominio especifico: los notebooks incluidos permiten reproducir la evaluacion comparativa (round robin de cinco modelos) y medir la degradacion o mejora respecto al base en MMLU turco.

## Benchmarks y rendimiento

Se han publicado dos evaluaciones en la informacion disponible:

| Benchmark | Modelo | Resultado |
|---|---|---|
| Turkish MMLU (6.200 preguntas, 62 secciones) | Adaptador fine-tuned | 67,31 % |
| Turkish MMLU (6.200 preguntas, 62 secciones) | Base unsloth/Qwen3.5-4B | 67,23 % |
| Round robin de dominio (exhaustividad, 5 modelos) | Adaptador fine-tuned | 4.º de 5 |
| Round robin de dominio (exhaustividad) | Base unsloth/Qwen3.5-4B | vence al adaptador 85-10-5 |

La diferencia en MMLU turco es de +0,08 puntos porcentuales (5 preguntas de 6.200), dentro del ruido entre ejecuciones, lo que se considera el resultado esperado dado que el dominio de entrenamiento no se solapa con el conocimiento academico evaluado. En el benchmark de dominio, un juez que puntua por exhaustividad situa al adaptador por debajo de su base, aunque el adaptador gana en proximidad a las respuestas de referencia humana.

## Requisitos de hardware

- El adaptador LoRA en si es minimo (unos pocos cientos de megabytes en safetensors), pero requiere cargar el modelo base `unsloth/Qwen3.5-4B` de 4.000 millones de parametros.
- VRAM estimada para inferencia: aproximadamente 8-10 GB con cuantizacion de 4 bits del modelo base; 16 GB para precision completa (fp16).
- GPU recomendadas: RTX 3060/4060 (12-16 GB) o superiores; cabe en GPUs de consumo.
- Opciones de despliegue: al ser un adaptador PEFT, puede fusionarse con el base y servirse con vLLM, TGI, Ollama o llama.cpp tras conversion a GGUF. FriendliAI ofrece un endpoint de inferencia para este modelo.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada, aunque el adaptador reduce la longitud de salida (~860 caracteres frente a ~3.300), lo que disminuye el tiempo de generacion por consulta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Erenyanic/qwen3.5-4b-seasoned-advice-lora | 4B (base) + LoRA r=32 | no disponible | Cocina bilingue tr/en | CC BY-SA 4.0 | Hugging Face |
| unsloth/Qwen3.5-4B (base) | 4B | no disponible | General, vision-lenguaje | no disponible | Hugging Face |
| Otros adaptadores LoRA de dominio culinario | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre otros adaptadores LoRA comparables en el dominio de cocina. La comparativa mas relevante es contra su propio modelo base: el adaptador pierde en exhaustividad (85-10-5 en el round robin) pero gana en brevedad y proximidad al registro de las respuestas humanas de referencia.

## Limitaciones y advertencias

- Dominio muy estrecho: solo 1.000 ejemplos de entrenamiento, limitados a conversaciones de cocina y ciencia alimentaria de Stack Exchange.
- Las respuestas de origen son escritas por la comunidad y no estan verificadas por expertos; no debe usarse el modelo para decisiones de seguridad alimentaria.
- El adaptador reduce drasticamente la longitud de las respuestas (~860 caracteres frente a ~3.300 del base), lo que penaliza la exhaustividad y la profundidad tecnica.
- La licencia CC BY-SA 4.0, heredada del contenido de Stack Exchange, implica obligaciones de atribucion y comparticion bajo la misma licencia para obras derivadas.
- Riesgo de alucinacion en temas fuera del dominio de entrenamiento, dado el escaso volumen de datos de ajuste.
- El modelo solo responde de forma fiable en turco e ingles; otros idiomas no estan cubiertos por el ajuste.
- La plantilla de chat lanza una excepcion ante roles desconocidos, lo que puede romper integraciones que envien roles no estandar.
- No se recomienda su uso en produccion para respuestas de salud, nutricion clinica o seguridad alimentaria sin supervision humana.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/erenyanic/qwen3.5-4b-seasoned-advice-lora
- Dataset de entrenamiento: https://huggingface.co/datasets/Erenyanic/seasoned-advice-dataset
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-4B
- Repositorio GitHub: https://github.com/ErenYanic/qwen3.5-4b-seasoned-advice-lora
- Benchmark Turkish MMLU de referencia: https://huggingface.co/datasets/alibayram/yapay_zeka_turkce_mmlu_model_cevaplari
- Endpoint de inferencia FriendliAI: https://friendli.ai/models/Erenyanic/qwen3.5-4b-seasoned-advice-lora
