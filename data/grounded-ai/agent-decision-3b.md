# grounded-ai/agent-decision-3b

# grounded-ai/agent-decision-3b

## Resumen

agent-decision-3b es un modelo de decisión calibrado y de tamano reducido, desarrollado por grounded-ai, pensado para actuar como verificador rapido dentro de agentes basados en LLM. No es un modelo generativo: dado un estado del agente (herramientas disponibles, peticion del usuario y las llamadas a herramienta propuestas por el agente), responde preguntas tipadas como "¿son correctas y completas estas llamadas?", "¿que es exactamente lo que falla?" o "¿deberia el asistente llamar a una herramienta, preguntar al usuario o declinar?", y devuelve una probabilidad para cada respuesta permitida en un unico forward pass, sin generar texto.

Tecnicamente es un adaptador LoRA sobre LiquidAI/d1-3B (3,1B parametros), la familia de modelos de decision "system-1" de Liquid AI, y se distribuye junto a un fichero `calibration.json` con la temperatura que se aplica a las puntuaciones de cada opcion antes del softmax. Es el hermano pequeno de grounded-ai/agent-decision-9b: mismo recetario de entrenamiento y mismas filas de datos, pero con un backbone tres veces menor.

Su relevancia practica esta en el coste y la latencia: sustituye a un LLM juez en la mayoria de los pasos de un agente. Segun los datos publicados por el autor, el 86% de las decisiones se emiten con una confianza igual o superior al 90%, y el 99,1% de esas decisiones de alta confianza son correctas, lo que permite usarlo como primera etapa barata de una cascada de evaluacion y reservar el LLM juez solo para los casos dudosos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre LiquidAI/d1-3B; la arquitectura interna del modelo base no se detalla en la informacion disponible (carga con `trust_remote_code=True` y expone `model.system_one(...)` y `model.engine.calibration`) |
| Parametros totales | 3,1B en el modelo base (LiquidAI/d1-3B) mas el adaptador LoRA; el repositorio del adaptador ocupa 0,1 GB |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible. El autor documenta ejecucion en bfloat16; el adaptador se puede fusionar con `merge_and_unload()`, pero no se publican pesos GGUF ni cuantizados |
| Idiomas soportados | Ingles (en) |
| Licencia | Otra (etiquetada como `other`, `license_name: lfm1.0`, con enlace a `LICENSE`); hereda las condiciones del modelo base LiquidAI/d1-3B |
| Formato de pesos | safetensors (adaptador LoRA de PEFT) |

## Arquitectura y entrenamiento

El modelo no introduce un backbone nuevo: es un ajuste fino mediante LoRA sobre LiquidAI/d1-3B, un modelo de 3,1B parametros de la familia d1 de Liquid AI orientado a decisiones. La inferencia no usa decodificacion autorregresiva de texto, sino que puntua cada opcion permitida de una pregunta tipada (`noul` para si/no, `choice` para eleccion multiple y `score` para puntuaciones) y normaliza esas puntuaciones con softmax tras dividirlas por la temperatura ajustada que se guarda en `calibration.json`. Esa temperatura es la pieza que convierte las puntuaciones en probabilidades calibradas, y su ausencia degradaria la interpretacion de la confianza. El autor indica que el modelo base incorpora su propio codigo, por lo que requiere `transformers>=5.14` y `trust_remote_code=True`.

Los datos de entrenamiento combinan tres fuentes: Salesforce/xlam-function-calling-60k (CC-BY-4.0), nvidia/When2Call y el conjunto de evaluacion propio grounded-ai/agent-decision-eval. Segun la model card, todas las etiquetas son exactas y ninguna fila se trunca; en xlam, la mitad de las filas son llamadas verificadas por ejecucion y el resto incorporan exactamente una edicion que las hace incorrectas por construccion (una herramienta sustituida por otra cuyo esquema rechaza los argumentos, un parametro que la herramienta no define, un valor ausente o un valor distinto del solicitado, o una llamada omitida). Este diseno genera ejemplos negativos controlados por categoria, lo que explica el salto de rendimiento frente al modelo base en errores poco frecuentes. La informacion proporcionada no detalla si hubo RLHF, DPO ni otras etapas de alineamiento posteriores al ajuste supervisado.

## Capacidades

- Clasificacion y verificacion de llamadas a herramienta: determina si un conjunto de tool calls es correcto y completo para la peticion del usuario.
- Diagnostico tipado del error: distingue entre herramienta equivocada, argumentos erroneos, valor faltante e incompletitud, ademas de detectar parametros que la herramienta no define.
- Decision de politica del agente: responde si el asistente debe llamar a una herramienta, preguntar al usuario o declinar la peticion.
- Puntuacion de todas las opciones en un unico forward pass, sin generacion de texto, con probabilidades calibradas por temperatura.
- Preguntas de formato libre: cualquier pregunta `noul`, `choice` o `score` se puede formular sobre cualquier estado, aunque el ajuste solo especializa el modelo en las preguntas objetivo (el resto se comporta como el modelo base).
- Integracion como hook o guardrail: se puede invocar antes de ejecutar una llamada a herramienta y bloquearla si la probabilidad de correccion es baja.
- Capacidad multilingue: no disponible; solo se declara ingles.
- Vision, audio, tool calling nativo generativo, agentes multi-paso autonomos o modo de razonamiento extendido: no disponibles; el modelo no genera texto ni ejecuta herramientas por si mismo.

## Casos de uso

- Verificacion previa a la ejecucion de llamadas a herramienta: se inserta como hook en el bucle del agente y, antes de que una tool call se ejecute, comprueba que la herramienta y los argumentos coinciden con la peticion. Es el uso que el propio autor documenta en el plugin de Claude Code de `grounded_ai`.
- Guardrail frente a acciones incorrectas con alta confianza: cuando el agente propone una llamada que modifica estado (login, pagos, escritura en base de datos) y el modelo devuelve baja probabilidad de acierto, se aborta la ejecucion y se devuelve el control al usuario. Con un 98,3% de acierto y un ECE de 1,0 en la pregunta binaria de correccion, el umbral es util como freno automatico.
- Primera etapa de una cascada de evaluacion: el modelo resuelve el 86% de los casos con confianza superior al 90% y solo el resto se envia a un LLM juez, lo que reduce el coste por token y la latencia del pipeline de evaluacion.
- Etiquetado y filtrado de trazas de agentes: al clasificar cada paso de una traza como correcto, erroneo o incompleto, permite construir conjuntos de datos de entrenamiento o de evaluacion a partir de logs de produccion sin intervencion manual.
- Enrutado de la politica de conversacion (call / ask / decline): en asistentes que no deben inventar acciones, el modelo decide si conviene preguntar al usuario antes de actuar; su punto fuerte es detectar cuando hay que declinar (90,5%) y su punto debil cuando hay que preguntar (68,5%).
- Deteccion de alucinaciones de parametros en produccion: la clase "un parametro que la herramienta no define" pasa del 64,0% del modelo base al 99,3%, lo que lo hace apto para monitorizar APIs con esquemas estrictos y alertar cuando el modelo generativo inventa campos.
- Control de calidad en CI/CD de prompts y agentes: ejecutado contra el conjunto grounded-ai/agent-decision-eval, sirve como puerta de regresion antes de desplegar cambios en el prompt del agente o en el esquema de herramientas.
- Analisis offline de coste de agentes: al puntuar llamadas sobre trazas historicas se puede estimar que porcentaje de acciones habria sido bloqueado por un guardrail, util para decidir si merece la pena integrarlo.

## Benchmarks y rendimiento

Datos publicados por el autor. Conjunto de test: 1.139 filas de APIs e items no vistos en entrenamiento, muestreadas con un numero fijo de filas por tipo de ejemplo para que las categorias raras se midan con la misma precision que las frecuentes. "Base" es d1-3B sin ajustar, zero-shot. Los valores se presentan multiplicados por 100 (exactitud / error de calibracion esperado, ECE).

| Pregunta | Base d1-3B | agent-decision-3b | agent-decision-9b |
|---|---|---|---|
| ¿Son correctas y completas las llamadas? (si/no) | 86,2 / 3,7 | 98,3 / 1,0 | 98,1 / 1,0 |
| ¿Que falla en las llamadas? (correcta / herramienta erronea / argumentos erroneos / incompleta) | 75,3 / 8,6 | 96,4 / 2,1 | 96,4 / 1,9 |
| ¿Deberia el asistente llamar, preguntar o declinar? | 69,7 / 9,4 | 85,4 / 3,9 | 88,2 / 3,8 |
| Conjunto completo | 79,5 / 1,8 | 94,8 / 1,1 | 95,3 / 1,4 |

Comportamiento como primera etapa de una cascada: el 86% de las decisiones se emiten con confianza igual o superior al 90% y el 99,1% de esas son correctas.

Exactitud (x100) en la pregunta "¿son correctas las llamadas?", por tipo de llamada:

| Tipo | Base d1-3B | agent-decision-3b |
|---|---|---|
| Llamadas correctas | 97,3 | 96,7 |
| Un parametro que la herramienta no define | 64,0 | 99,3 |
| Falta un valor que el usuario dio | 91,0 | 99,0 |
| Un valor difiere de lo que pidio el usuario | 92,4 | 97,2 |
| Herramienta equivocada | 96,7 | 100 |
| Falta una de varias llamadas solicitadas | 70,7 | 97,6 |

Pregunta "llamar, preguntar o declinar", desglosada por respuesta correcta: llamar 94,4 → 95,2; declinar 60,3 → 90,5; preguntar 52,3 → 68,5.

Presentacion no vista (las mismas filas de test renderizadas en Markdown, un formato nunca usado en entrenamiento): 93,1% global frente al 80,5% del modelo base. El punto debil sigue siendo la respuesta "preguntar al usuario", con un 52,3% en ese formato (51,4% en el modelo base).

## Requisitos de hardware

- VRAM estimada: aproximadamente 6 GB en bfloat16 para el modelo base de 3,1B mas el adaptador fusionado, segun indica el autor.
- GPU recomendadas: una NVIDIA L4 es suficiente segun la model card; cualquier GPU con soporte bfloat16 y al menos 8 GB de VRAM deberia ser suficiente en la practica.
- GPU de consumo: si, cabe en tarjetas de consumo con 8-12 GB o mas (por ejemplo, RTX 3060 de 12 GB, RTX 4070, RTX 4080 o superiores), siempre que admitan bfloat16. En GPUs sin bfloat16 nativo seria necesario usar fp16, un escenario no documentado por el autor.
- Despliegue: la model card solo documenta `transformers>=5.14` con `AutoModel.from_pretrained(..., trust_remote_code=True)` mas `peft.PeftModel.from_pretrained(...).merge_and_unload()`. No se mencionan vLLM, TGI, llama.cpp ni Ollama, y al no ser un modelo generativo de texto estos servidores de inferencia estandar no serian aplicables sin adaptacion.
- Latencia y throughput: no disponibles. El autor solo caracteriza el modelo como "pequeno y rapido" y lo posiciona como la etapa barata de una cascada, ademas de indicar que requiere un unico forward pass por consulta.
- Almacenamiento: el repositorio del adaptador ocupa 0,1 GB; hay que sumar el peso del modelo base (no indicado, pero coherente con un modelo de 3,1B en bfloat16, del orden de 6 GB).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (conjunto completo, exactitud / ECE x100) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| grounded-ai/agent-decision-3b | 3,1B (base) + LoRA | No disponible | 94,8 / 1,1 | lfm1.0 (other) | Adaptador LoRA en HuggingFace |
| grounded-ai/agent-decision-9b | No disponible (hermano mayor, mismo recetario) | No disponible | 95,3 / 1,4 | No disponible en la informacion | Modelo publicado por el mismo autor en HuggingFace |
| LiquidAI/d1-3B | 3,1B | No disponible | 79,5 / 1,8 | LFM (segun modelo base) | Modelo base en HuggingFace |

No se dispone de datos en la informacion proporcionada sobre otros modelos de verificacion de llamadas a herramienta o jueces de agentes de la competencia con los que establecer una comparacion cuantitativa. Diferencias destacables dentro de la propia familia: el 9B supera al 3B en la pregunta de politica del agente (88,2 frente a 85,4) y en el agregado (95,3 frente a 94,8), mientras que el 3B es ligeramente mejor en calibracion agregada (ECE 1,1 frente a 1,4) y mantiene el mismo nivel en la verificacion binaria de correccion.

## Limitaciones y advertencias

- Punto debil conocido en la respuesta "preguntar al usuario": 68,5% de exactitud en el formato de entrenamiento y 52,3% en una presentacion no vista, frente al 90,5% en "declinar" y el 95,2% en "llamar". No es fiable como unico criterio para decidir cuando hay que pedir aclaraciones.
- Sensibilidad al formato: con el mismo contenido renderizado en Markdown, el rendimiento global cae del 98,3% al 93,1%. Si el pipeline de produccion usa un layout distinto del de entrenamiento, hay que revalidar la calibracion.
- La calibracion depende de `calibration.json`: omitir la temperatura ajustada invalida la interpretacion de las probabilidades como confianza, aunque no cambia la opcion ganadora.
- El ajuste solo especializa las preguntas descritas en la model card. Cualquier otra pregunta se comporta como el modelo base sin ajustar, con el rendimiento mucho mas bajo que documenta la tabla (79,5% agregado).
- Los ejemplos negativos de entrenamiento son incorrectos "por construccion" a partir de xlam y When2Call; los patrones de error reales de un agente en produccion pueden diferir y degradar la calibracion fuera de distribucion.
- Solo ingles declarado. El comportamiento en castellano u otros idiomas no esta documentado.
- Licencia `lfm1.0` (etiquetada como "other"): hay que revisar el fichero LICENSE y las condiciones del modelo base LiquidAI/d1-3B antes de un uso comercial. La informacion proporcionada no especifica los terminos exactos de explotacion.
- Requiere el modelo base y `trust_remote_code=True`, lo que implica ejecutar codigo remoto de terceros en el entorno de inferencia; conviene fijar una revision concreta del modelo base, como hace el ejemplo del autor (`revision="051bcc464b01b9f92942b364d9586b0ef5912432"`).
- No genera texto: no sirve como asistente conversacional ni como agente autonomo, solo como componente de decision dentro de un sistema mayor.
- Escasa validacion externa: el repositorio presenta 0 descargas y 0 "likes" en el momento de la consulta, y todos los resultados publicados proceden del propio autor.
- Riesgo de alucinacion en sentido generativo: inexistente, porque no produce texto. El riesgo equivalente es un falso positivo (dar por correcta una llamada erronea) con confianza alta; el autor reporta un 0,9% de error entre las decisiones con confianza superior al 90%.
- Las fechas del repositorio (creacion y actualizacion el 2026-10-11) no se han podido verificar de forma independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/grounded-ai/agent-decision-3b
- Modelo base LiquidAI/d1-3B: https://huggingface.co/LiquidAI/d1-3B
- Hermano mayor de 9B: https://huggingface.co/grounded-ai/agent-decision-9b
- Repositorio con el generador de datos y notebooks de demostracion: https://github.com/grounded-ai/agent-decision
- Plugin de Claude Code con la comprobacion de grounding (proyecto grounded_ai): https://github.com/grounded-ai/grounded_ai
- Conjunto de datos de evaluacion: https://huggingface.co/datasets/grounded-ai/agent-decision-eval
- Salesforce/xlam-function-calling-60k: https://huggingface.co/datasets/Salesforce/xlam-function-calling-60k
- nvidia/When2Call: https://huggingface.co/datasets/nvidia/When2Call
- Nota sobre la busqueda web: los resultados devueltos corresponden al videojuego "Grounded" (Steam, Fandom, Obsidian, Wikipedia, jeuxvideo.com) y no guardan relacion con el modelo, por lo que no se incluyen.
