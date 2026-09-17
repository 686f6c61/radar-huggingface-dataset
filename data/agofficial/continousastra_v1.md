# AGofficial/ContinousAstra_v1

## Resumen

`AGofficial/ContinousAstra_v1` es un repositorio publicado en HuggingFace que no contiene un modelo de lenguaje con pesos, sino un *harness* de agente autonomo: un conjunto de scripts en Python 3.11 o superior que orquestan llamadas a un modelo remoto a traves de la API de OpenAI. El propio autor lo describe como una "instantanea compartible del harness" (shareable harness snapshot) de un sistema llamado Continuous Astra, que opera de forma ciclica, despertando cada cierto intervalo para revisar un buzon de correo, ejecutar herramientas y programar el siguiente turno.

El sistema no incluye ficheros de pesos, tokenizador ni configuracion de inferencia. Su funcion es actuar como capa de agente: gestiona credenciales, planificacion temporal, estado persistente, un sistema de ficheros virtual limitado a 10 MB, un registro de actividad y un mecanismo de envio de correo a traves de AgentMail. Toda la capacidad de generacion de texto, razonamiento y busqueda web recae en el modelo remoto, identificado en la model card como `gpt-5.6-luna`, del que no se aporta ninguna especificacion tecnica.

La relevancia del repositorio es, por tanto, la de un ejemplo de arquitectura de agente de larga duracion (long-running agent) con estado persistente, control de limites de computo por despertar y trazabilidad completa, mas que la de un modelo evaluable en terminos de parametros, contexto o benchmarks. El repositorio no registra descargas y cuenta con un unico "like" en el momento de la consulta, y no incluye licencia declarada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica: el repositorio es un harness de agente en Python, no una red neuronal. No se publican pesos ni arquitectura de modelo |
| Parametros totales | No disponible (no se distribuyen pesos) |
| Parametros activos | No aplica (no es un modelo MoE; no hay pesos) |
| Longitud de contexto | No disponible. Depende del modelo remoto invocado (`gpt-5.6-luna` segun la model card), sin cifra publicada |
| Tipos de cuantizacion | No disponible (no hay pesos que cuantizar) |
| Idiomas soportados | No disponible (no declarados en la model card) |
| Licencia | No disponible |
| Formato de pesos | No aplica: el repositorio contiene codigo fuente Python, ficheros de despliegue y fixtures de test; no contiene safetensors, GGUF ni otros formatos de pesos |
| Autor | AGofficial |
| Fecha de creacion | 2026-09-17 |
| Ultima actualizacion | 2026-09-17 |
| Descargas / likes | 0 descargas / 1 like |
| Etiquetas | region:us |
| Requisitos de entorno | Python 3.11 o superior, sin dependencias externas que instalar segun el autor |
| Modelo remoto invocado | `gpt-5.6-luna` (identificador tal cual aparece en la model card; sin especificaciones) |
| Proveedor de API | OpenAI |
| Proveedor de correo | AgentMail |

## Arquitectura y entrenamiento

No existe entrenamiento asociado a este repositorio: no hay proceso de preentrenamiento, ajuste fino, RLHF ni DPO descrito en la informacion disponible. El artefacto publicado es codigo de orquestacion. La "arquitectura" real es la del agente, que se compone de: un fichero `config.py` deliberadamente vacio (0 bytes) que el usuario debe rellenar con `OPENAI_API_KEY`, `AGENT_MAIL_API_KEY` y una direccion de AgentMail; un bucle de ejecucion por despertares; un sistema de herramientas con llamadas a funciones; un registro cronologico (`astra_log.txt`) con marcas de tiempo por peticion, respuesta, llamada a herramienta, correo enviado o recibido, error y latido por minuto; y un estado persistente que sobrevive a reinicios y que incluye historial de correo, notas virtuales y planificacion.

El mecanismo de memoria y contactos se implementa como ficheros virtuales, `memory.md` y `contacts.md`, almacenados dentro de `sandbox/files.json`. El prompt de sistema indica al agente que lea ambos al inicio de cada despertar, que los cree si no existen y que actualice recuerdos duraderos e informacion de contacto. Las operaciones sobre el sistema de ficheros virtual (crear, leer, listar, escribir, anadir, borrar, renombrar, edicion por lineas) actuan unicamente sobre claves JSON: los nombres con aspecto de ruta son cadenas inertes. No se expone shell, ejecucion de codigo del host, acceso a ficheros reales ni herramientas HTTP arbitrarias. El componente denominado Aegis proporciona calculo acotado sobre esos scripts virtuales y puede solicitar entrada mediante `input()`, lo que extiende el despertar en curso.

La logica de control de computo limita cada despertar a un maximo de cinco respuestas del modelo en condiciones normales, con multiples llamadas a herramientas permitidas por respuesta; una peticion `input()` de Aegis amplia ese despertar hasta un maximo de 20 respuestas totales, incluidas las ya consumidas. La funcion `schedule_next_turn(minutes)` acepta enteros entre 10 y 60 minutos, y prevalece la ultima llamada valida; sin ella, el siguiente despertar se programa 30 minutos despues de finalizar el actual. Los despertares perdidos se ejecutan una sola vez al reiniciar, sin reproducir cada intervalo omitido. El sistema mantiene una bandeja de salida persistente que suprime envios identicos repetidos y marca como `delivery_uncertain` los fallos o tiempos de espera durante el envio, para evitar reintentos ciegos.

## Capacidades

- Generacion de texto y razonamiento: delegados integramente en el modelo remoto invocado mediante la API de OpenAI; el harness no aporta capacidad de inferencia propia.
- Llamada a herramientas (tool calling / function calling): el bucle de agente admite multiples llamadas a herramientas por respuesta del modelo, con ejecucion de las llamadas de la ultima respuesta del despertar.
- Operacion autonoma multi-turno: el agente se despierta periodicamente de forma programada, revisa su buzon, procesa correo pendiente y decide acciones sin intervencion humana entre despertares.
- Gestion de correo electronico: revision de todas las paginas de la bandeja de entrada en cada despertar, recuperacion del cuerpo completo de los mensajes, ordenacion de los mas recientes primero, persistencia de respuestas pendientes entre reinicios (hasta 100 mensajes pendientes por despertar) y herramientas de responder o descartar que registran el correo ya tramitado. Los adjuntos no se descargan.
- Busqueda web y navegacion: soportadas por la busqueda web alojada de OpenAI, orientadas a investigacion de noticias y verificacion de fuentes segun el prompt del sistema.
- Memoria persistente entre sesiones: mediante los ficheros virtuales `memory.md` y `contacts.md` dentro de `sandbox/files.json`, con un limite de 10 MB.
- Programacion de turnos: control temporal del siguiente despertar en intervalos de 10 a 60 minutos.
- Archivo de sistema de ficheros virtual: creacion, lectura, listado, escritura, anadido, borrado, renombrado y edicion por lineas sobre claves JSON.
- Trazabilidad: registro con marca de tiempo de peticiones observables, respuestas completas de la API, llamadas y resultados de herramientas, correo recibido y enviado, errores, planificacion y latido por minuto, con las claves de API redactadas.
- Modo de comprobacion de credenciales sin envio de correo, ejecucion de un unico despertar real y reanudacion del ciclo guardado.
- No soporta: vision, audio, ejecucion de shell, acceso a ficheros reales del host, herramientas HTTP arbitrarias ni razonamiento oculto accesible al log.

## Casos de uso

- Agente personal de correo con estado persistente: el harness revisa todas las paginas de la bandeja en cada despertar, recupera los cuerpos completos, prioriza los mensajes mas recientes y mantiene hasta 100 respuestas pendientes entre reinicios, lo que permite gestionar correspondencia acumulada durante periodos de inactividad sin perder hilos.
- Vigilancia tematica y alertas: con la busqueda web alojada de OpenAI, el prompt del sistema solicita alertas sobre eventos relevantes de IA y verificacion de fuentes; el limite de envios y la supresion de mensajes identicos repetidos reducen el riesgo de bucles de correo.
- Automatizacion de rutinas con planificacion variable: `schedule_next_turn(minutes)` permite ajustar la frecuencia de despertar entre 10 y 60 minutos segun la carga esperada, con un valor por defecto de 30 minutos, util para tareas de comprobacion periodica que no requieren tiempo real.
- Banco de pruebas de agentes con estado: el repositorio incluye tests offline y fixtures de Aegis, de modo que un equipo puede validar el comportamiento del bucle, las herramientas y los limites de computo antes de conectarlo a credenciales reales.
- Despliegue continuo en servidor siempre activo: con Docker Compose, el agente se reinicia tras caidas del proceso y reinicios del servidor, lo que encaja en escenarios donde se requiere disponibilidad permanente sin depender de un portatil encendido.
- Auditoria y depuracion de agentes: el log con marca de tiempo por peticion, respuesta, herramienta, correo y error, con claves redactadas, sirve como base para reconstruir el comportamiento del agente y detectar fallos de razonamiento o de integracion.
- Prototipado de asistentes con memoria a largo plazo: la implementacion de memoria como ficheros virtuales editables (`memory.md`) ofrece un patron sencillo y auditable para experimentar con persistencia de conocimiento sin base de datos externa.
- Aislamiento de seguridad en agentes con acceso a lenguaje natural: al no exponer shell, ficheros reales ni HTTP arbitrario, y al tratar los nombres de ruta como cadenas inertes, el diseno es adecuado para entornos donde se quiere acotar estrictamente la superficie de acciones del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El repositorio no incluye pesos ni un modelo propio que evaluar, por lo que metricas como MMLU, HumanEval o GSM8K no son aplicables al artefacto publicado. La model card tampoco reporta latencias, throughput ni resultados de evaluacion del modelo remoto al que se conecta.

## Requisitos de hardware

- VRAM para inferencia: no aplica. El repositorio no ejecuta inferencia local; toda la generacion ocurre en los servidores de OpenAI. El consumo en la maquina anfitriona corresponde solo al proceso Python del harness.
- GPU recomendadas: ninguna. No se requiere GPU para ejecutar el harness.
- Compatibilidad con GPU de consumo: irrelevante, dado que no hay pesos ni calculo tensorial local.
- Entorno local: Windows con PowerShell; el autor indica que cerrar la tapa del portatil no debe suspender el equipo, y recomienda configurar la accion de tapa con corriente en "No hacer nada" y la suspension con corriente en "Nunca". La operacion local exige energia, conexion a internet, equipo despierto y el proceso abierto.
- Despliegue en servidor: Linux siempre encendido con Docker Compose instalado, ejecutando `docker compose up -d --build`; los datos persistentes residen en el directorio `data/`. El autor recomienda este modo para poder apagar el portatil y senala que no se ha aprovisionado ni desplegado ningun servidor automaticamente.
- Opciones de despliegue soportadas: script de PowerShell (`start.ps1`, con los modificadores `-Check`, `-Once`, `-Instruction` y `-NoPrompt`) y Docker Compose. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables al no existir pesos.
- Almacenamiento: el log (`astra_log.txt`) crece sin borrado automatico y contiene correo privado, por lo que el autor advierte de la necesidad de vigilar el espacio en disco.
- Latencia y throughput: no disponibles. Dependen exclusivamente del proveedor remoto y de los limites de respuestas por despertar (5 en condiciones normales, 20 con solicitud de Aegis).
- Restriccion operativa: debe ejecutarse un unico despliegue por buzon de entrada.

## Comparativa con modelos similares

No disponible. La busqueda web realizada no devolvio informacion relacionada con el repositorio ni con modelos de su categoria, y la informacion proporcionada no incluye datos de rendimiento, parametros ni contexto de terceros que permitan una comparacion cuantitativa.

| Elemento comparado | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AGofficial/ContinousAstra_v1 | No aplica (sin pesos) | No disponible (depende del modelo remoto) | No disponible | No disponible | Publico en HuggingFace, 0 descargas |
| Alternativas de la misma categoria (harnesses de agentes autonomos) | No disponible | No disponible | No disponible | No disponible | No disponible en la informacion proporcionada |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no contiene pesos, tokenizador ni codigo de inferencia, por lo que no puede evaluarse ni desplegarse como un modelo generativo. Comprimir o copiar el repositorio no proporciona ninguna capacidad de generacion.
- Dependencia total de un tercero: el funcionamiento requiere la API de OpenAI y el identificador de modelo `gpt-5.6-luna` citado en la model card. Cualquier cambio de disponibilidad, precio o comportamiento del proveedor afecta directamente al sistema. No se aporta verificacion independiente de ese identificador.
- Ausencia de licencia declarada: no se especifican terminos de uso, lo que impide determinar si el uso comercial esta permitido.
- Idioma no declarado: no se indica que idiomas soporta el sistema, mas alla de que la interfaz, los prompts y los mensajes del codigo estan en ingles.
- Riesgo de alucinacion: no cuantificado en la informacion disponible. El agente puede enviar correo electronico de forma autonoma y dispone de busqueda web, lo que amplifica el impacto de un error de razonamiento o de una fuente no verificada.
- Envio de correo en el primer arranque: segun el autor, el primer despertar en vivo instruye al agente a enviar correo a los contactos integrados en el codigo para confirmar que esta en linea. Se recomienda revisar `CONTACTS` y el prompt de sistema en `astra.py` antes de cualquier uso en vivo.
- Direcciones de correo integradas: la model card indica que el codigo conserva direcciones de contacto integradas, lo que constituye un dato personal expuesto en un repositorio publico y un riesgo de privacidad para las personas afectadas.
- Fuga de credenciales: `config.py` se distribuye vacio a proposito; rellenarlo con claves reales y volver a compartir el proyecto expondria las credenciales. El autor recomienda mantener la configuracion poblada en privado y compartir solo una copia vacia.
- Estado de ejecucion no incluido: no se incluyen credenciales, estado en tiempo de ejecucion, historial de correo, logs, ficheros virtuales, ficheros de bloqueo ni caches compiladas. Un despliegue nuevo empieza desde cero.
- Dependencia de disponibilidad del host: en modo local, la aplicacion exige que el equipo permanezca encendido y despierto y que el proceso siga abierto; un reinicio termina el proceso en primer plano.
- Riesgo de saturacion de disco: el log crece sin borrado automatico y contiene correo privado, por lo que requiere monitorizacion y politicas de retencion.
- Ambiguedad en la entrega de correo: los fallos o tiempos de espera durante el envio se marcan como `delivery_uncertain` y no se reintentan automaticamente, de modo que exigen inspeccion manual en AgentMail y en el estado.
- Alcance de herramientas deliberadamente reducido: no hay shell, ejecucion de codigo del host, acceso a ficheros reales ni HTTP arbitrario. Esto limita la utilidad del agente para tareas que requieran manipulacion real del sistema o integraciones de red personalizadas.
- Capacidades multimodales ausentes: la informacion disponible no menciona vision ni audio, y los adjuntos de correo no se descargan.
- Razonamiento interno no auditable: el log no recoge el razonamiento oculto del modelo ni las operaciones internas del proveedor, lo que limita la depuracion de decisiones.
- Metadatos poco fiables para planificacion: no hay pipeline declarado, la licencia y los idiomas figuran como no disponibles y las fechas de creacion y actualizacion (2026-09-17) son identicas, separadas por unos 16 minutos, lo que sugiere un unico commit de publicacion.
- Advertencia de seguridad en el proceso de copia: los ficheros de ignorados ayudan a evitar commits o inclusiones accidentales en compilaciones, pero no sanean una carpeta o un ZIP una vez utilizado.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/AGofficial/ContinousAstra_v1
- Paper: no disponible
- Blog tecnico: no disponible
- Repositorio de codigo independiente: no disponible
- Demostracion publica: no disponible
- Documentacion adicional de AgentMail: no disponible en la informacion proporcionada
- Resultados de busqueda web: no relevantes. Las busquedas devolvieron exclusivamente paginas de un hotel y restaurante en el Allgau (landhotel-albrecht.de) sin ninguna relacion con el repositorio ni con modelos de lenguaje.
