# Openwist/Chelone-1.0

## Resumen

Chelone 1.0 es un adaptador LoRA desarrollado por Openwist AI sobre el modelo base LiquidAI/LFM2.5-1.2B-Instruct, un transformer de 1.200 millones de parametros. El adaptador esta especializado en tareas de ingenieria y matematicas avanzadas para ejecucion local en dispositivos, con un enfasis explicito en honestidad sobre las propias capacidades, uso de herramientas y ausencia de emojis. Se distribuye como pesos PEFT en formato safetensors, no como modelo completo.

El modelo resuelve el problema de dotar a un modelo pequeno (1.2B) de un comportamiento disciplinado en tareas tecnicas: reformular el problema, elegir metodo, calcular paso a paso y verificar el resultado. Para ello entrena con 4.941 ejemplos en ingles que incluyen registros de uso de herramientas para vehiculos electricos, robots humanoides y codigo de ingenieria, ademas de datos sinteticos con respuestas verificables. Los tools soportados son `python_exec`, `calculator` y `convert_units`.

Su relevancia actual radica en la combinacion de tres factores: un modelo base de solo 1.2B parametros apto para inferencia en dispositivo, un adaptador de rango bajo (r=16, alpha=32) que anade comportamiento tecnico sin inflar el coste computacional, y una evaluacion automatica que muestra mejoras medibles frente al modelo base en seleccion y formato de tool calls. No obstante, el propio autor advierte que las comprobaciones miden comportamiento y formato, no capacidad general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base LFM2.5-1.2B-Instruct) con adaptador LoRA |
| Parametros totales | 1.200 millones (modelo base); adaptador LoRA r=16, alpha=32 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se entrena en fp16; el modelo base admite las cuantizaciones de LFM2.5) |
| Idiomas soportados | Ingles (contexto keniata); no evaluado en otros idiomas |
| Licencia | lfm1.0 (licencia del modelo base, heredada por el adaptador derivado) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

Chelone 1.0 no es un modelo completo sino un adaptador LoRA de rango 16 y alpha 32 entrenado en fp16 sobre LiquidAI/LFM2.5-1.2B-Instruct. El adaptador utiliza la plantilla nativa tipo ChatML del modelo base. Las herramientas se declaran en el turno de sistema entre los tokens `<|tool_list_start|>` y `<|tool_list_end|>`, y las llamadas se emiten con el formato `<|tool_call_start|>[function(arg=value)]<|tool_call_end|>`. El repositorio incluye un modulo auxiliar `openwist_pipeline.py` con funciones de renderizado de prompt y parseo de tool calls.

El entrenamiento empleo 4.941 ejemplos, todos en ingles. La composicion combina el dataset Openwist/Theo (CC BY 4.0, con atribucion a Openwist AI), que contiene registros de uso de herramientas para vehiculos electricos, robots humanoides y codigo de ingenieria, y datos sinteticos generados programaticamente con respuestas comprobables: aritmetica, conversiones de unidades, totales por partida doble, simulaciones de herramientas de hoja de calculo y tickets de traspaso. Se anade un conjunto de "comportamiento central" que cubre honestidad de identidad, admision de incertidumbre, rechazos educados y ausencia de emojis. Cada turno del asistente se filtro con comprobaciones basadas en reglas para eliminar emojis, afirmaciones de humanidad y filtraciones de identidad de terceros, y los system prompts se reescribieron con la nomenclatura propia de Openwist.

## Capacidades

- Generacion de texto conversacional en ingles con un system prompt canonico orientado a precision y concision.
- Razonamiento matematico paso a paso: reformulacion del problema, eleccion de metodo, calculo y verificacion de unidades y sustitucion.
- Uso de herramientas (tool calling) con tres funciones: `python_exec`, `calculator` y `convert_units`.
- Emision de llamadas de herramienta en formato estructurado parseable mediante el helper del repositorio.
- Comportamiento de honestidad: admite ser una IA cuando se le pregunta, declara incertidumbre en lugar de adivinar y no reclama capacidades que no tiene (navegacion, memoria entre sesiones, tools no suministrados).
- Rechazo educado de peticiones peligrosas (por ejemplo, anular protecciones de bateria, interlocks o paradas de emergencia) con alternativa segura.
- Restriccion estilistica estricta: sin emojis, emoticonos ni simbolos decorativos.
- Contexto de ingenieria: vehiculos electricos, robots humanoides y codigo de ingenieria.

## Casos de uso

- Asistencia en calculo de ingenieria preliminar: el modelo reformula el problema, invoca `calculator` o `python_exec` para obtener el resultado numerico y presenta la respuesta con unidades y advertencias, lo que encaja en fases de diseno temprano donde se necesita trazabilidad del calculo.
- Conversion de unidades en flujos tecnicos: mediante `convert_units` puede transformar magnitudes entre sistemas (SI, imperial) dentro de conversaciones multi-turno, reportando supuestos cuando falta un dato de entrada.
- Simulacion de hojas de calculo y totales contables: los datos sinteticos de partida doble y simulaciones de herramientas de hoja de calculo permiten usar el modelo para verificar cuadres y totales en tareas administrativas o de ingenieria de costes.
- Agente local de soporte tecnico en dispositivo: al ser un adaptador sobre un modelo de 1.2B, puede desplegarse en hardware de gama consumer para asistencia offline en campo (por ejemplo, diagnostico de sistemas de vehiculos electricos) con tool calling controlado.
- Generacion y revision de codigo de ingenieria: el dataset Theo incluye tareas de codigo de ingenieria; el modelo puede proponer fragmentos y ejecutarlos con `python_exec` para validar resultados numericos antes de devolver la respuesta.
- Tickets de traspaso y hand-off: los datos sinteticos incluyen tickets de traspaso, por lo que el modelo puede estructurar incidencias tecnicas con la informacion necesaria para escalar a un especialista humano.
- Filtro de seguridad en asistentes tecnicos: su comportamiento entrenado de rechazo ante peticiones que anulan protecciones (baterias, interlocks, paradas de emergencia) lo hace util como capa de moderacion en herramientas de ingenieria.

## Benchmarks y rendimiento

Evaluacion automatica basada en reglas sobre 120 conversaciones retenidas con redaccion no vista, comparando el adaptador con su modelo base bajo el mismo prompt y herramientas:

| Comprobacion | Chelone 1.0 | Modelo base |
|---|---|---|
| Puntuacion global de comportamiento | 95,0% | 81,4% |
| Salida limpia (sin emoji, sin afirmacion de humanidad, sin filtracion de identidad) | 100,0% | 98,3% |
| Admite ser una IA cuando se le pregunta | 100,0% | 100,0% |
| Herramienta correcta elegida | 82,4% | 60,8% |
| Argumentos de tool call validos | 82,4% | 60,8% |
| Sin llamada de herramienta innecesaria | 100,0% | 76,8% |

Recuentos absolutos: 0 emojis, 0 afirmaciones de humanidad, 0 filtraciones de identidad. El autor especifica que estas comprobaciones miden comportamiento y formato de tool calls, no capacidad general ni tareas especificas de Kenia, que se evaluaran por separado. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; al tratarse de un modelo base de 1.2B parametros, la huella es reducida y el adaptador LoRA anade una sobrecarga minima (r=16, alpha=32).
- El adaptador se entrena y se indica su uso en fp16 con `device_map="auto"`, por lo que puede cargarse en GPU con al menos varios GB de VRAM; la cifra exacta no se especifica.
- GPU recomendadas: no disponible en la informacion proporcionada. Por el tamano del modelo base, es apto para GPUs consumer, pero no se detallan modelos concretos.
- Cabe en GPU consumer: si, por el tamano del modelo base (1.2B), aunque no se enumeran modelos especificos.
- Opciones de despliegue: la model card documenta el uso mediante `peft` + `transformers` con `PeftModel.from_pretrained` y el helper `openwist_pipeline.py`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Chelone 1.0 (adaptador) | 1.2B (base) | no disponible | Ingenieria y matematicas con tool calling en dispositivo | lfm1.0 | Hugging Face (PEFT) |
| LiquidAI/LFM2.5-1.2B-Instruct (base) | 1.2B | no disponible | Instruccion general | lfm1.0 | Hugging Face |
| Alternativas de 1-2B con tool calling | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks estandar ni de especificaciones de modelos comparables de la misma categoria en la informacion proporcionada, por lo que la comparativa se limita al modelo base.

## Limitaciones y advertencias

- Los datos de entrenamiento son en gran medida basados en plantillas, por lo que la variedad de redaccion es menor que la del texto real de usuarios; se espera un comportamiento mas debil ante formulaciones inusuales.
- Los modelos pequenos pueden equivocarse con confianza; el autor recomienda verificar los resultados importantes.
- Las salidas son estimaciones de diseno temprano, no aprobaciones de ingenieria (no aptas para sign-off).
- No evaluado en idiomas distintos del ingles mas alla de unos pocos ejemplos de identidad en suajili.
- Fuera de alcance: decisiones medicas, legales o financieras sin profesional cualificado; aprobacion de seguridad en ingenieria critica; cualquier uso en el que el usuario deba creer que habla con una persona.
- Licencia lfm1.0 heredada del modelo base; es un modelo derivado, por lo que las restricciones de uso comercial de la licencia del base aplican al adaptador.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.
- El tamano del repositorio aparece como 0.0 GB, coherente con un adaptador LoRA, pero no se detalla el numero exacto de parametros del adaptador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Openwist/Chelone-1.0
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct
- Dataset Openwist/Theo: https://huggingface.co/datasets/Openwist/Theo
- Perfil del autor: https://huggingface.co/Openwist
