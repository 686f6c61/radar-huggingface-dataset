# datatab/hcawn-fc7

## Resumen

hCAWN-FC7 es un modelo de lenguaje extremadamente pequeno (5,7 millones de parametros) desarrollado por datatab (CAWN AI) especializado en una unica tarea: convertir una frase en ingles en una llamada a herramienta (tool call) en formato JSON para una de siete acciones de telefono movil. No es un modelo de chat general ni un LLM conversacional: es un clasificador generativo de intenciones con salida estructurada, disenado para ejecutarse en CPU sin GPU, sin conexion de red y sin coste por API.

El modelo resuelve un problema muy concreto de la IA en dispositivos: la mayoria de asistentes moviles que interpretan lenguaje natural requieren un LLM grande en la nube, con la latencia, el coste y la exposicion de datos que ello implica. hCAWN-FC7 demuestra que un conjunto fijo y pequeno de herramientas puede resolverse con un modelo de menos de 6 MB (int8) que cabe en cualquier telefono y se ejecuta en milisegundos sobre un solo nucleo de CPU.

Es relevante ahora porque ejemplifica una tendencia de especializacion extrema: en lugar de escalar parametros, se restringe el dominio (7 acciones, un idioma) y se combina el modelo con capas deterministas (decodificacion restringida por gramatica, anclaje de valores en la consulta, reglas de fecha y hora, disparadores por palabras clave y una puerta de confianza). El modelo usa pesos en un formato binario propietario del motor hCAWN, no cargable con `transformers`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo byte-level; pesos en formato binario propietario del motor hCAWN) |
| Parametros totales | 5,7 millones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (6,0 MB, recomendado) e int4 empaquetado (3,9 MB) |
| Idiomas soportados | ingles unicamente |
| Licencia | CC BY 4.0 (pesos); Apache-2.0 (paquete `hcawn-fc`) |
| Formato de pesos | binario propietario `int8.bin` / `int4.bin` (no compatible con `transformers`) |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna mas alla de describir el modelo como "byte-level" y "small-language-model". Los pesos se distribuyen en un formato binario propio del motor hCAWN, lo que impide inspeccionarlos o cargarlos con las herramientas habituales del ecosistema Hugging Face. El modelo opera junto a un pipeline determinista que incluye decodificacion restringida por gramatica (garantiza JSON valido y solo herramientas conocidas), anclaje de valores extraidos de la consulta, reglas de resolucion de fechas y horas relativas, disparadores por palabras clave y una puerta de confianza que suprime llamadas dudosas.

El entrenamiento parte del dataset **Mobile Actions** de Google (licencia CC BY 4.0), con consultas y tool calls filtrados, aumentados con variantes de forma de consulta y ampliados con parafrasis. Las parafrasis de entrenamiento se generaron con Gemini 2.5 Flash Lite y se filtraron automaticamente. El conjunto de evaluacion con parafrasis se genero con GPT-4o-mini, deliberadamente distinto del modelo usado para aumentar los datos. No se emplearon datos privados ni de usuarios. No se especifica el numero de tokens de entrenamiento ni si hubo RLHF o DPO.

## Capacidades

- Conversion de una frase en ingles a una llamada JSON para exactamente 7 acciones: `send_email`, `create_calendar_event`, `create_contact`, `show_map`, `open_wifi_settings`, `turn_on_flashlight`, `turn_off_flashlight`.
- Extraccion de argumentos estructurados: destinatario, asunto y cuerpo de correo; titulo y fecha-hora de evento; nombre, apellidos, telefono y email de contacto; consulta de mapa.
- Salida JSON siempre valida gracias a la decodificacion restringida por gramatica (solo nombres de herramienta conocidos).
- Resolucion de fechas y horas relativas ("tomorrow at 2pm") mediante reglas deterministas con el reloj del llamante, no por el modelo.
- Supresion de llamadas fuera de dominio mediante disparadores por palabras clave y puerta de confianza.
- Ejecucion local en CPU, sin red, con inferencia en el dispositivo.
- No soporta tool calling arbitrario, agentes multi-paso, razonamiento general, codigo, matematicas ni vision.

## Casos de uso

- **Asistente de voz movil offline**: el modelo interpreta ordenes como "turn on the flashlight" o "show the Eiffel Tower on the map" y emite la llamada JSON que la app ejecuta contra las APIs del sistema, sin enviar audio ni texto a la nube. Adecuado por su tamano (6 MB) y su ejecucion en CPU.
- **Automatizacion de acciones rapidas en Android**: integrado como capa de intencion en un launcher o widget, traduce frases del usuario a acciones del sistema (wifi, linterna) con latencia de milisegundos y sin coste por peticion.
- **Creacion de eventos y contactos por dictado**: a partir de "Add a calendar event Team Sync tomorrow at 2pm" genera `create_calendar_event(title='Team Sync', datetime='...')`, con la fecha resuelta por reglas contra el reloj del dispositivo.
- **Redaccion asistida de correos desde el movil**: convierte "Send an email to bob@example.com with subject Meeting and body See you at 3pm" en una llamada `send_email` con los campos separados, util para clientes de correo con entrada por voz.
- **Prototipado de asistentes con conjunto fijo de herramientas**: sirve como referencia de como combinar un modelo diminuto con gramatica restringida y puerta de confianza para producir salidas estructuradas fiables sin un LLM grande.
- **Despliegue en entornos con privacidad estricta o sin conectividad**: al ejecutarse en CPU y sin red (build Linux x86-64), encaja en dispositivos embebidos, quioscos o terminales de campo donde no se permite enviar datos a servicios externos.
- **Base para modelos a medida por encargo**: CAWN AI ofrece construir modelos equivalentes para el conjunto de herramientas y la fraseologia del cliente, desplegables en dispositivo o en servidores propios.

## Benchmarks y rendimiento

Evaluacion sobre el conjunto Mobile Actions (961 filas, ruido aproximado de ±2 puntos). Metrica de coincidencia exacta estricta: nombre de herramienta y todos los valores de argumentos correctos.

| Condicion | Precision exacta |
|---|---|
| Fraseologia original del benchmark (con capas del pipeline) | 90,9% |
| 905 peticiones reescritas por GPT-4o-mini (con capas del pipeline) | 83,2% |
| Solo modelo y gramatica, sin el resto de capas | 86,5% |

No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM: no requiere GPU; inferencia en CPU.
- Memoria en disco: 6,0 MB (`int8.bin`, recomendado) o 3,9 MB (`int4.bin`).
- GPU recomendadas: ninguna; el modelo esta disenado para CPU.
- Cabe en cualquier GPU consumer y en cualquier telefono o dispositivo embebido por tamano, pero no se aprovecha la GPU.
- Opciones de despliegue: paquete `hcawn-fc` (PyPI) con motor local para Linux x86-64; en Windows y macOS el paquete actua como cliente de la demo alojada. No es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles de forma numerica; la model card indica ejecucion "rapida" en CPU. El modelo int4 es mas pequeno pero mas lento en CPU y con mayor frecuencia retenido por la puerta de confianza.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (modelos byte-level de menos de 10 M de parametros para tool calling con conjunto fijo de herramientas). Por tamano y funcion, se situa en una categoria distinta a los LLM generales pequenos (p. ej., modelos de 0,5 a 3 B de parametros), que requieren mas recursos y no garantizan JSON valido sin capas adicionales. No se dispone de datos de rendimiento de terceros para establecer una comparacion rigurosa.

## Limitaciones y advertencias

- Solo reconoce las 7 herramientas listadas; no es un modelo de chat general y no puede llamar a nada fuera de ese conjunto.
- Unicamente procesa consultas en ingles.
- Las fechas y horas relativas las resuelve una regla con el reloj del llamante, no el modelo; un reloj mal configurado produce resultados incorrectos.
- Rendimiento mas debil con fraseologia inusual ("tell him that...", "... saying X").
- La puerta de confianza reduce pero no elimina las llamadas erroneas; no es una garantia.
- Los disparadores por palabras clave pueden descartar una formulacion poco habitual de una accion valida, devolviendo ninguna llamada.
- Las cifras de precision corresponden a consultas del estilo Mobile Actions; se espera menor exactitud con otra fraseologia o definiciones de herramientas distintas.
- Los pesos estan en formato binario propietario: no se pueden cargar con `transformers` ni auditar facilmente.
- El motor local solo se distribuye para Linux x86-64; en Windows y macOS el paquete depende de la demo alojada, lo que implica envio de datos a un servicio externo.
- Licencia de pesos CC BY 4.0: permite uso comercial con atribucion obligatoria ("CAWN AI, hCAWN-FC7 (https://cawnai.com)") y manteniendo la atribucion del dataset Mobile Actions. El codigo del paquete es Apache-2.0.
- Riesgo de alucinacion acotado por la gramatica (solo herramientas conocidas), pero los valores de argumentos pueden ser incorrectos aunque el JSON sea valido.
- Sesgos: no documentados en la informacion disponible; al entrenarse sobre un dataset de acciones moviles en ingles, puede fallar ante variantes dialectales o culturales de las expresiones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/datatab/hcawn-fc7
- Demo en vivo: https://cawnai.com
- Paquete PyPI: https://pypi.org/project/hcawn-fc/
- Repositorio GitHub: https://github.com/hCAWNfc/hcawnfc
- Dataset Mobile Actions (Google, CC BY 4.0): no disponible el enlace directo en la informacion proporcionada
