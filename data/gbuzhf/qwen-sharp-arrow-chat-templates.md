# gbuzhf/Qwen-Sharp-Arrow-Chat-Templates

## Resumen

Qwen-Sharp Arrow es una coleccion de plantillas de chat en Jinja para modelos con formato Qwen3.6, publicada por el usuario gbuzhf en Hugging Face bajo licencia Apache-2.0. No es un modelo de lenguaje en si mismo, sino un conjunto de plantillas que definen como se construye el prompt de sistema y como se estructuran los turnos de conversacion cuando el modelo se ejecuta dentro de un harness de agentes (tool use, trabajo multi-paso). La version actual es arrow 4.2.2 y se distribuye en tres ficheros: uno para modelos Qwen3.6, otro para Nex-N2.5 y otro para MiniCPM-V 4.7.

La propuesta tecnica central es que, en modo chat sin herramientas, la plantilla renderiza de forma byte-identica a Qwen-Sharp v22.5.0, mientras que al activar herramientas introduce reglas de agente: planificacion por pasos, cadenas de razonamiento en borrador, presion sobre la inaccion, conteo de fallos consecutivos con escalada de diagnostico y memoria de proyecto en `.arrow/`. La plantilla no lee el texto del usuario, por lo que su comportamiento es independiente del idioma de la conversacion.

El proyecto se apoya en dos linajes previos: las plantillas oficiales de Qwen y el trabajo de froggeric (Qwen-Fixed-Chat-Templates), del que hereda retencion de thinking, esfuerzo de razonamiento, formatos XML/JSON de herramientas y coaching de errores, y posteriormente Qwen-Sharp de peculiar-ragdoll, del que toma el bloque terse. Arrow anade la capa especifica de agente sobre esa base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | plantilla Jinja de chat (no es un modelo neuronal) |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (depende del modelo Qwen3.6 que la use) |
| Tipos de cuantizacion | no disponible (no aplica a la plantilla) |
| Idiomas soportados | independiente del idioma; la plantilla no lee el texto del usuario |
| Licencia | Apache-2.0 |
| Formato de pesos | ficheros `.jinja` (no hay pesos) |

## Arquitectura y entrenamiento

No hay entrenamiento ni red neuronal: el artefacto es una plantilla Jinja que transforma la lista de mensajes en un prompt de sistema y una secuencia de turnos. La construccion del prompt sigue un orden fijo dentro de un unico bloque de sistema: (1) linea de esfuerzo de razonamiento, solo en `low` o `xhigh`, ausente en el valor por defecto `medium`; (2) lista `# Tools` y reglas de formato de llamada a herramientas, texto heredado literalmente de upstream por ser critico para el formato; (3) el system prompt propio del harness; (4) reglas de memoria de proyecto `.arrow`, solo si existen herramientas de fichero o shell; (5) reglas de agente si hay herramientas, o las reglas terse de Sharp si no las hay, colocadas al final, lo mas cerca posible de la conversacion.

La innovacion principal es el control de comportamiento del agente mediante texto inyectado. Las reglas de agente imponen planificar una vez de forma breve y luego una cadena por paso (ultimo resultado, siguiente accion), pensar en cadenas de borrador en lugar de frases, revisar la lista de herramientas, skills y MCP antes de instalar o construir nada, y priorizar la evidencia en vivo sobre la memoria. Se anade presion sobre la inaccion con la escalada `next` → `overdue` → `stuck` → `stop → report now`, y una linea de estado por lote de herramientas con el marcador `SYSTEM`, palabras de un solo token y cadenas con `→`. El mecanismo de step back (4.2.2) cuenta acciones fallidas desde el ultimo punto funcional y escala el diagnostico: 2 fallos exigen nombrar la causa y ejecutar la prueba mas barata; 3 fallos o un error recurrente hacen que la plantilla liste los pasos del propio modelo desde el ultimo punto correcto; 5 fallos obligan a replantear desde cero; 7 fallos detienen la ejecucion y exigen un informe. La cadencia de thinking se calcula solo a partir del historial (apertura en mensajes de usuario, errores, notas correctivas y cada octavo turno), de modo que funciona aunque el harness descarte el razonamiento pasado, y todas las notas se computan unicamente con mensajes anteriores para preservar la cache de prefijo.

## Capacidades

- Definicion de formato de chat para modelos Qwen3.6, Nex-N2.5 y MiniCPM-V 4.7 (este ultimo con formato multimodal de openbmb: `<|image_pad|>` desnudo y partes unidas por salto de linea).
- Soporte de tool calling en formato XML por defecto, con formatos XML/JSON heredados de froggeric.
- Reglas de agente para razonamiento multi-paso y trabajo encadenado con herramientas.
- Control de esfuerzo de razonamiento mediante `reasoning_effort` (`medium` por defecto, `low`, `xhigh`).
- Modo de pensamiento controlable con `enable_thinking` y cadencia de thinking con `think_cadence` y `act_streak`.
- Memoria de proyecto persistente en `.arrow/memory` (decisiones, comandos, trampas) y `.arrow/plans` (objetivo, pasos con `- [ ]`, verificacion).
- Hand-back automatico al usuario tras 36 llamadas sin cambio (18 en una pregunta) con informe pre-iniciado de hecho, bloqueo y opciones.
- Deteccion de fallos consecutivos con escalada de diagnostico y reinicio de plan.
- Comportamiento independiente del idioma: la plantilla no interpreta el texto del usuario.
- Compatibilidad con `llama-server` mediante `--jinja --chat-template-file`.

## Casos de uso

- Harnesses de agentes con tool use: la plantilla define el formato de llamada y las reglas de encadenamiento, de modo que un modelo Qwen3.6 ejecutado en llama.cpp mantiene el plan y la trazabilidad de pasos en lugar de divagar entre lecturas.
- Pipelines de codificacion agentica: las reglas de "cambio minimo que prueba la hipotesis", "causa raiz antes de arreglar" y "evidencia en vivo por encima de la memoria" reducen las reescrituras completas de fichero y los bucles de prueba y error en tareas de reparacion de codigo.
- Diagnostico de instalaciones y entornos: el conteo de fallos con escalada hasta el informe final evita que el agente encadene instalaciones fallidas; el rastro se conserva aunque el usuario envie un nuevo mensaje como "arreglalo".
- Ejecucion de trabajos largos en segundo plano: la presion sobre la inaccion y el hand-back a las 36 llamadas garantizan que las ejecuciones largas terminen en una entrega y no en mas lecturas.
- Integracion con MCP y skills: la revision obligatoria de la lista de herramientas, skills y MCP antes de instalar o construir nada evita duplicar capacidades ya disponibles en el entorno.
- Proyectos con continuidad entre sesiones: la memoria `.arrow/memory` y los planes `.arrow/plans` permiten retomar el trabajo tras un resumen de contexto, con pasos marcados a medida que se completan.
- Despliegue local con llama.cpp: el uso mediante `llama-server --jinja --chat-template-file` permite servir el modelo con la plantilla sin infraestructura adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- La plantilla no consume VRAM ni computo por si misma; los requisitos dependen del modelo Qwen3.6, Nex-N2.5 o MiniCPM-V 4.7 sobre el que se aplique.
- El ejemplo de la model card usa `llama-server` con un fichero `.gguf`, lo que implica despliegue en CPU o GPU mediante llama.cpp.
- GPU recomendadas, VRAM estimada, latencia y throughput: no disponibles en la informacion proporcionada.
- Opciones de despliegue documentadas: llama.cpp (`llama-server` con `--jinja --chat-template-file`). Otros motores no se mencionan en la informacion disponible.

## Comparativa con modelos similares

| Plantilla | Modelos objetivo | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen-Sharp Arrow 4.2.2 | Qwen3.6, Nex-N2.5, MiniCPM-V 4.7 | Reglas de agente, step back, memoria `.arrow`, hand-back | Apache-2.0 | Hugging Face (gbuzhf) |
| Qwen-Sharp v22.5.0 | Qwen | Bloque terse; base de arrow en modo sin herramientas | Apache-2.0 | Hugging Face (peculiar-ragdoll) |
| Qwen-Fixed-Chat-Templates | Qwen | Retencion de thinking, esfuerzo de razonamiento, formatos XML/JSON, coaching de errores | Apache-2.0 | Hugging Face (froggeric) |
| Plantillas oficiales de Qwen | Qwen | Formato base de chat y tool calling | no disponible | Repositorios oficiales de Qwen |

## Limitaciones y advertencias

- No es un modelo: no genera texto por si misma; su comportamiento depende enteramente del modelo y del harness que la ejecuten.
- Las reglas de agente se inyectan como texto en el prompt de sistema; un modelo que no las siga con fidelidad puede ignorarlas, y el consumo de tokens del bloque de sistema no se detalla en la informacion disponible.
- El conteo de fallos de step back se basa en heuristicas sobre resultados de herramientas (shell, codigo, navegador); comandos de solo lectura fallidos no cuentan, lo que puede infrarrepresentar bloqueos en flujos dominados por lecturas.
- La memoria `.arrow` crea ficheros en la raiz del proyecto en el primer contacto; en entornos de solo lectura o sandbox sin escritura puede no funcionar y requiere `arrow_memory=false`.
- El hand-back a las 36 llamadas (18 en preguntas) puede interrumpir tareas legitimamente largas; es configurable con `deliver_at` y `deliver_at_question`, y `0` lo desactiva.
- El comportamiento es independiente del idioma por diseno, pero la calidad de las respuestas en cada idioma depende del modelo subyacente, no de la plantilla.
- Sesgos conocidos y riesgo de alucinacion: no disponibles en la informacion proporcionada; aplican los del modelo base.
- Licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; la compatibilidad con harnesses distintos de llama.cpp no esta documentada.

## Enlaces

- Hugging Face: https://huggingface.co/gbuzhf/Qwen-Sharp-Arrow-Chat-Templates
- Qwen-Sharp (upstream): https://huggingface.co/peculiar-ragdoll/Qwen-Sharp-Chat-Templates
- Qwen-Fixed-Chat-Templates (upstream): https://huggingface.co/froggeric/Qwen-Fixed-Chat-Templates
