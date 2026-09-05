# chicken6pp/opencode-cloud

## Resumen

OpenCode es un agente de codificacion de IA open-source desarrollado por Anomaly, que soporta mas de 75 proveedores de LLM. El repositorio `chicken6pp/opencode-cloud` no es un modelo de lenguaje con pesos, sino un Space de Hugging Face que empaqueta OpenCode en un contenedor Docker y lo ejecuta en el navegador, aprovechando el tier gratuito de CPU de Hugging Face Spaces.

El objetivo es ofrecer un agente de codificacion accesible desde cualquier navegador, sin necesidad de GPU ni de instalacion local. La arquitectura es la de una aplicacion web servida por `opencode web` en el puerto 4096, con autenticacion basica HTTP protegida por contraseña. Los modelos de lenguaje subyacentes se conectan mediante claves de API de proveedores externos (Anthropic, OpenAI, Google Gemini, o el gateway OpenCode Zen). No hay entrenamiento propio ni parametros: todo el procesamiento linguistico se delega en los LLMs externos.

La relevancia actual reside en que ofrece una via rapida para probar un agente de codificacion moderno en un entorno efimero y sin coste, con soporte de herramientas como plan mode, gestion de ficheros y sesiones compartibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (no es un modelo de lenguaje; es un Space de Hugging Face que ejecuta la aplicacion OpenCode en Docker) |
| Parametros totales | No disponible |
| Parametros activos | No disponible (solo aplica a modelos MoE) |
| Longitud de contexto | No disponible (depende del LLM externo configurado) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (depende del LLM externo; OpenCode no impone restricciones de idioma) |
| Licencia | MIT (para el Dockerfile y la configuracion; OpenCode es © Anomaly) |
| Formato de pesos | No disponible (no hay pesos propios) |

Filas adicionales relevantes:

| Parametro | Valor |
|---|---|
| Tipo de recurso | Space de Hugging Face (Docker) |
| SDK | Docker |
| Puerto de la aplicacion | 4096 |
| Proveedores de LLM soportados | 75+ (Anthropic, OpenAI, Gemini, OpenCode Zen, entre otros) |
| Almacenamiento de sesiones | Sistema de ficheros del contenedor, efimero |
| Autenticacion | HTTP basic auth con `OPENCODE_SERVER_PASSWORD` |

## Arquitectura y entrenamiento

Este recurso no es un modelo entrenado; se trata de una aplicacion empaquetada. El `Dockerfile` instala OpenCode mediante el script oficial de instalacion y ejecuta `opencode web`. La interfaz web se enlaza a `0.0.0.0:4096` para que el proxy inverso de Hugging Face pueda alcanzarla. La autenticacion basica se habilita mediante la variable de entorno `OPENCODE_SERVER_PASSWORD`. El espacio de trabajo del usuario se monta en `/home/user/workspace` dentro del contenedor.

En cuanto a innovaciones tecnicas, OpenCode aporta un agente de codificacion con capacidades de razonamiento multi-paso, plan mode (que genera un plan antes de modificar el codigo), integracion con herramientas de versionado como git, y la generacion de un fichero `AGENTS.md` mediante el comando `/init` para conservar contexto entre sesiones. Todo el procesamiento linguistico se realiza en los servidores de los proveedores de LLM configurados, por lo que no hay entrenamiento local ni fine-tuning.

## Capacidades

- Agente de codificacion interactivo en el navegador, con capacidad para crear, editar y refactorizar ficheros de proyecto.
- Soporte de plan mode: el agente redacta un plan de cambios antes de aplicar ninguna modificacion, lo que facilita la revision previa.
- Gestion de sesiones: se pueden compartir enlaces publicos de sesiones para depuracion o colaboracion.
- Integracion con git: permite clonar repositorios publicos, trabajar sobre ellos y hacer push de los cambios.
- Generacion de contexto persistente mediante `/init`, que crea un fichero `AGENTS.md` en el proyecto.
- Soporte de multiples proveedores de LLM: se puede cambiar de modelo con solo modificar las claves de API (Anthropic, OpenAI, Gemini, OpenCode Zen, etc.).
- Tool calling y function calling: heredado de los LLMs externos; OpenCode actua como agente que orquesta las llamadas a herramientas.
- Capacidades multilingues: dependen del modelo subyacente; OpenCode no restringe el idioma de las instrucciones.

## Casos de uso

- Desarrollo de software desde un navegador sin instalacion: un desarrollador puede duplicar el Space, introducir sus claves de API y empezar a programar desde cualquier dispositivo con conexion a internet.
- Refactorizacion de codigo en proyectos pequeños: el agente puede aplicar cambios multi-fichero en repositorios clonados, siempre que el proyecto quepa en los recursos del tier gratuito.
- Prototipado rapido en entornos efimeros: para pruebas de concepto o hackathons, se puede levantar un entorno de codificacion asistida sin configurar infraestructura local.
- Depuracion colaborativa: mediante la funcion de compartir sesiones, un desarrollador puede enviar un enlace a un compañero para revisar el contexto del agente y los cambios propuestos.
- Uso como interfaz de agente para multiples proveedores de LLM: el usuario puede comparar el comportamiento de distintos modelos de Anthropic, OpenAI o Gemini a traves de la misma interfaz web.
- Automatizacion de tareas repetitivas en repositorios publicos: el agente puede ejecutar comandos como `git clone`, editar ficheros y preparar commits para tareas de mantenimiento sencillas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Este recurso no es un modelo de lenguaje, por lo que no existen metricas de MMLU, HumanEval o GSM8K que puedan aplicarse directamente. El rendimiento depende exclusivamente del proveedor de LLM que se configure.

## Requisitos de hardware

- VRAM estimada: no aplicable. El Space se ejecuta en CPU; no se requiere GPU.
- GPU recomendada: ninguna. El tier gratuito de Hugging Face Spaces proporciona CPU sin aceleracion grafica.
- Compatibilidad con GPU de consumo: no aplicable, ya que no se ejecutan modelos locales.
- Opciones de despliegue: Hugging Face Spaces (gratuito o de pago), autoalojamiento en Oracle Cloud Always Free, o cualquier servidor con Docker.
- Recursos estimados: el tier gratuito de CPU esta limitado y es susceptible de throttling; se recomienda el plan `cpu-upgrade` o `cpu-performance` para trabajos mas intensivos.
- Latencia y throughput: no disponibles. Dependen de la latencia de las API externas de los proveedores de LLM.

## Comparativa con modelos similares

No se dispone de datos de comparativa en la informacion proporcionada. Como este recurso es un Space de Hugging Face que empaqueta OpenCode, no es directamente comparable con modelos de lenguaje. Alternativas similares en el ecosistema de agentes de codificacion open-source incluyen Aider y Cline, pero no se han aportado metricas o benchmarks en las fuentes consultadas. Por tanto, la comparativa cuantitativa se indica como no disponible.

## Limitaciones y advertencias

- Entorno efimero: los Spaces gratuitos de CPU se reinician tras aproximadamente 48 horas de inactividad o cuando se restablece la cuota del tier gratuito. Todo lo que no se haya subido a git se pierde.
- Sin GPU: no se pueden ejecutar modelos locales en este Space; el agente depende por completo de las API externas.
- Limites de recursos: el tier gratuito de CPU esta limitado y puede ralentizar refactorizaciones pesadas en proyectos grandes.
- Sin puertos de salida: el agente puede clonar repositorios publicos, pero no se pueden exponer servicios adicionales desde el contenedor.
- Persistencia de sesiones: las sesiones se guardan en el sistema de ficheros del contenedor, por lo que se borran al reiniciar. Hay que usar `/share` para guardar un enlace externo.
- Dependencia de claves de API: el usuario debe proporcionar sus propias claves de proveedores de LLM; el coste de uso depende de esos servicios.
- Licencia MIT solo aplica al Dockerfile y a la configuracion; OpenCode es © Anomaly. Se debe revisar la licencia de OpenCode antes de usarlo en entornos comerciales.

## Enlaces

- Hugging Face Space: https://huggingface.co/chicken6pp/opencode-cloud
- OpenCode: https://opencode.ai
- Documentacion de OpenCode: https://opencode.ai/docs/
- OpenCode Zen: https://opencode.ai/docs/zen/
