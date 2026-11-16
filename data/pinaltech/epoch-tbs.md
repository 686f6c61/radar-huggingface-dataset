# pinaltech/epoch-tbs

## Resumen

Epoch TBS es un modelo compacto de etiquetado de tokens (token tagger) desarrollado por pinaltech para Picacho, una aplicacion de correo electronico. Su funcion es interpretar expresiones de fecha y hora escritas en lenguaje natural —incluyendo errores tipograficos, abreviaturas y variantes coloquiales— y convertirlas en un momento concreto del calendario, ademas de generar reglas de recurrencia iCalendar (RRULE) cuando la expresion implica periodicidad. No genera texto libre ni razona: clasifica cada token en una de 104 etiquetas semanticas y delega el calculo temporal a un motor de reglas determinista.

El modelo resuelve un problema muy especifico de producto: permitir que un campo de texto libre ("Snooze", "Send Later") acepte entradas como `tmrw at 6`, `next fri 3pm` o `Erinnere mich ubermorgen um 18:30 Uhr` sin depender de un LLM en la nube. Segun la model card, soporta 37 idiomas y digitos en siete sistemas de escritura distintos (ASCII, fullwidth, arabigo-indico, persa, devanagari, bengali y thai), y esta disenado para ejecutarse en CPU en cada pulsacion de tecla, con unos pocos miles de multiply-adds por token.

Arquitectonicamente es un clasificador neuronal muy pequeno: embeddings hasheados en 16.384 slots, una capa oculta de 32 unidades con ReLU y softmax sobre 104 etiquetas. El repositorio de Hugging Face ocupa 0,0 GB y contiene un unico artefacto `tbs-v1.bin` en formato binario propietario, verificado por tamano y SHA-256 contra valores incrustados en la aplicacion. La licencia es MIT y la fecha de creacion del repositorio es 2026-11-16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Clasificador de tokens por token: embedding hasheado (16.384 slots, 8 bits con escala por fila) -> capa oculta de 32 unidades (ReLU) -> softmax sobre 104 etiquetas |
| Parametros totales | no disponible (el embedding se almacena en enteros de 8 bits; no se publica el recuento) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible explicitamente; las features incluyen los tres tokens a cada lado, lo que implica una ventana local de 7 tokens |
| Tipos de cuantizacao | Embedding almacenado como enteros de 8 bits con escala por fila (cuantizacion int8 integrada); no se listan otras variantes |
| Idiomas soportados | 37 idiomas: ingles, espanol, aleman, frances, portugues, italiano, neerlandes, sueco, polaco, japones, chino simplificado y tradicional, coreano, ruso, ucraniano, turco, arabe, persa, hebreo, hindi (y hindi en caracteres latinos), bengali, indonesio, malayo, vietnamita, thai, griego, checo, eslovaco, danes, noruego, finlandes, rumano, hungaro, catalan, croata, bularo, tagalo y swahili |
| Licencia | MIT |
| Formato de pesos | Binario propietario `tbs-v1.bin` (runtime propio `NativeTagger`); no se distribuye en safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo sigue un esquema de dos etapas descrito en la model card. La primera etapa es puramente neuronal: el texto se segmenta en runs de letras en minusculas (con signos vocalicos adjuntos), runs de digitos en cualquiera de los sistemas de escritura soportados (normalizados a ASCII), caracteres individuales de scripts sin espacios (chino, japones, thai) y los separadores `: / - . , @ +`. Cada token se representa mediante un conjunto de features: el propio token, sus tres primeras y tres ultimas letras, trigramas de letras, un "esqueleto" (primera letra mas consonantes sin repetir, de modo que `tomorrow`, `tommorow` y `tmrw` colapsan a `tmrw`), numero de digitos y bucket de valor, si toca a sus vecinos (`2nite`, `6pm`, `18h30`) y los tres tokens a cada lado. Estas features se hashean en 16.384 slots y pasan por una capa oculta de 32 unidades ReLU con softmax sobre 104 etiquetas (`features.LABELS`), entre ellas `TOMORROW`, `OVERMORROW`, `FRI`, `NOV`, `U_HOUR`, `U_FORTNIGHT`, `PM`, `NUM`, `NEXT`, `START`, `TOP`, `MONTH_MARK` y `W20`.

La segunda etapa es un motor de reglas (`src/manage/local_ai/when.rs`) que interpreta las etiquetas junto con la hora local actual para producir el instante final. Esta separacion es una decision de diseno deliberada: el modelo "lee" y las reglas "calculan", de modo que un mismo conjunto de reglas sirve para todos los idiomas y ordenes de palabras. Las reglas incluyen convenciones concretas: una fecha sin hora se fija a las 8:00; manana 8:00, tarde 14:00, noche 19:00, noche cerrada y "tonight" 20:00, fin de dia/semana/mes/ano 17:00; una hora suelta en un dia nombrado se interpreta como tarde hasta las 6 y como manana desde las 7; `friday` y `this friday` son el viernes proximo, `next friday` el primero tras hoy, `friday after next` una semana despues; `next week` es el lunes siguiente; `start`, `middle` y `end` de semana son lunes, miercoles y viernes, y de mes el 1, el 15 y el ultimo dia. Las fechas numericas siguen la region del equipo (`3/4` es 4 de marzo en EE. UU. y 3 de abril en Reino Unido), salvo cuando un numero no puede ser mes; las fechas con puntos (`21.11.`) ponen el dia primero.

No se proporciona informacion sobre el volumen de datos de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones como decodificacion especulativa o atencion lineal. No hay resultados de benchmarks publicados.

## Capacidades

- Etiquetado semantico de tokens de fecha y hora en lenguaje natural, con tolerancia a errores tipograficos y abreviaturas (`tmrw`, `Wensday mornin`, `2nite`).
- Interpretacion de expresiones absolutas, relativas y compuestas: `next fri 3pm`, `the monday in three weeks`, `start of next week at 7am`, `in 4 hours at the top of the hour`, `overmorrow at noon`, `in a fortnight`, `friday after next`, `a week from friday`, `the first monday of next month`, `this time tomorrow`, `end of next month`, `mid next month`.
- Generacion de reglas de recurrencia iCalendar (RRULE): `every other monday @ 9:30am` produce `FREQ=WEEKLY;INTERVAL=2;BYDAY=MO;BYHOUR=9;BYMINUTE=30`.
- Soporte multilingue de 37 idiomas con un unico conjunto de reglas, incluyendo orden de palabras distinto (`vendredi prochain` / `next friday`, `3 giorni fa` / `il y a 3 jours`, `下午6点` / `6pm`).
- Lectura de digitos en ASCII, fullwidth, arabigo-indico, persa, devanagari, bengali y thai.
- Discriminacion de falsos positivos: expresiones como `may i ask a question` o `I sat down with the team on the 2nd floor` no producen ninguna fecha.
- No soporta tool calling ni function calling, no es un modelo generativo, no tiene modo de razonamiento explicito ni vision, audio o agentes multi-paso.

## Casos de uso

- Programacion de recordatorios en clientes de correo: el usuario escribe `remind me to call mom tomorow at 6 pls` en un campo de texto libre y el modelo extrae la etiqueta de manana y la hora, que el motor de reglas convierte en `Mon, Nov 16, 18:00` para fijar la notificacion. Adecuado porque la latencia es de miles de operaciones por token y funciona en CPU.
- Envio diferido de correos ("Send Later"): entradas como `next fri 3pm` o `start of next week at 7am` se resuelven a un instante concreto sin salir del equipo del usuario, lo que evita enviar texto personal a un servicio en la nube.
- Gestion de agendas recurrentes: `every other monday @ 9:30am` genera directamente una RRULE que puede insertarse en un evento iCalendar, util para integraciones con calendarios locales.
- Aplicaciones de productividad multilingues: al compartir un unico conjunto de reglas entre 37 idiomas, un mismo binario cubre usuarios de espanol, aleman, frances, japones, chino, arabe o hindi sin modelos por idioma ni traducciones adicionales.
- Procesamiento de texto con ruido tipografico: la representacion por esqueleto (`tmrw` para `tomorrow`, `tommorow` y `tmrw`) permite interpretar entradas rapidas de teclado movil o mensajes informales sin normalizacion previa.
- Filtrado de falsos positivos en pipelines de extraccion: la etiqueta `O` permite descartar frases que contienen palabras temporales pero no expresan una cita, como `may i ask a question` o referencias a plantas de un edificio, reduciendo falsos recordatorios.
- Localizacion de interfaces: la lectura de digitos en devanagari, bengali, thai, arabigo-indico y persa permite aceptar entradas nativas en mercados donde los usuarios escriben horas con sus propios numerales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; el modelo esta disenado para ejecutarse en CPU y no requiere GPU.
- GPU recomendadas: ninguna; la model card indica explicitamente que se ejecuta en cualquier CPU y que no existe version Core ML porque "menos de una llamada Core ML costaria" su inferencia.
- Cabe en cualquier GPU consumer, pero no esta pensado para ello; el binario se ejecuta en CPU en cada pulsacion de tecla.
- Opciones de despliegue: runtime propio de Picacho (`NativeTagger` en `src/manage/local_ai/runtime.rs`); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este formato binario propietario.
- Latencia y throughput: no se publican cifras concretas; la model card afirma "unos pocos miles de multiply-adds por token", lo que implica latencia inferior a una llamada Core ML, pero sin numeros medidos.
- Gestion del artefacto: la aplicacion descarga `tbs-v1.bin` desde Hugging Face, verifica tamano y SHA-256 contra valores incrustados (`WHEN` en `src/manage/local_ai/mod.rs`) y lo almacena en `models/` dentro del directorio de datos; al desactivar la funcion o borrar el modelo, el archivo se elimina. El modelo no se guarda en git.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de etiquetado de fechas y horas en lenguaje natural, ni datos de rendimiento que permitan establecer una comparacion con alternativas como parsers basados en reglas (dateparser, chrono-node) o clasificadores neuronales genericos.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, no responde preguntas y no admite tool calling ni agentes; su unica salida son etiquetas por token.
- El calculo temporal depende de reglas externas al modelo (`when.rs`); un cambio de reglas o de zona horaria afecta el resultado aunque las etiquetas sean correctas.
- Las convenciones horarias son heuristicas y pueden sorprender: `tomorrow at 6` se resuelve a las 18:00 y `friday at 9` a las 9:00; `at 3` a las 14:20 se interpreta como las 15:00 del mismo dia, y `at 2` como las 2:00 del dia siguiente.
- Las fechas numericas dependen de la configuracion regional del equipo (`3/4` cambia de significado entre EE. UU. y Reino Unido), lo que puede producir interpretaciones distintas en equipos compartidos.
- La ventana de features es local (tres tokens a cada lado); expresiones con dependencias muy largas o estructuras sintacticas complejas pueden quedar fuera del alcance del clasificador.
- No se publican datos sobre sesgos, tasas de alucinacion ni evaluacion de precision por idioma; la lista de 37 idiomas esta declarada, pero no se aportan metricas de cobertura o exactitud por lengua.
- El formato de pesos es binario propietario y solo lo consume el runtime de Picacho; no es portable a otros frameworks sin reimplementar el `NativeTagger`.
- Licencia MIT, lo que permite uso comercial y modificacion, pero el modelo esta disenado como componente de una aplicacion concreta y no como servicio general.
- El modelo se distribuye fuera del repositorio git y se descarga en tiempo de ejecucion; entornos sin conectividad o con verificacion SHA-256 fallida no podran activar la funcion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pinaltech/epoch-tbs
- Coleccion Picacho Models: https://huggingface.co/collections/pinaltech/picacho-models-6af95b1ea617ddc3325ee964
- Modelo relacionado Veil OTP: https://huggingface.co/pinaltech/veil-otp
