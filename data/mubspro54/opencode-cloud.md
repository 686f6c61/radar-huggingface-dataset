# Mubspro54/opencode-cloud

## Resumen

OpenCode Cloud es un Space de Hugging Face que despliega OpenCode, un agente de codificacion de IA de codigo abierto, en un entorno accesible desde el navegador. No se trata de un modelo de lenguaje en si, sino de una aplicacion que actua como interfaz para conectar con mas de 75 proveedores de modelos de IA (Claude, GPT, Gemini, etc.) o con modelos locales. El Space esta publicado por el usuario Mubspro54 y utiliza un contenedor Docker que instala OpenCode y lo expone en el puerto 4096, protegido con autenticacion basica HTTP.

La relevancia de este proyecto radica en que ofrece una forma gratuita de utilizar un agente de codificacion con IA sin necesidad de configurar un entorno local, aprovechando el tier gratuito de CPU de Hugging Face. Sin embargo, es importante destacar que no es un modelo de IA: no tiene parametros, arquitectura ni pesos propios. Su funcion es orquestar llamadas a APIs de modelos externos, por lo que las especificaciones tecnicas de un modelo no aplican directamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (es un Space que ejecuta OpenCode, no un modelo de IA) |
| Parametros totales | No aplica |
| Parametros activos | No aplica |
| Longitud de contexto | Depende del proveedor de modelo configurado (no definido por el Space) |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | No disponible (depende de los modelos conectados) |
| Licencia | MIT |
| Formato de pesos | No aplica (el Space contiene un Dockerfile y scripts, no pesos de modelo) |

## Arquitectura y entrenamiento

No existe arquitectura de modelo ni proceso de entrenamiento asociado a este repositorio. OpenCode Cloud es una aplicacion empaquetada en un contenedor Docker que instala OpenCode mediante su script oficial y ejecuta el comando `opencode web`. El Space se comunica con proveedores de modelos externos a traves de la API de cada proveedor, utilizando el SDK de IA y Models.dev para soportar mas de 75 proveedores. No hay datos de entrenamiento, pesos ni innovaciones tecnicas de modelos involucrados.

## Capacidades

- Ejecucion de OpenCode, un agente de codificacion de IA de codigo abierto, en un navegador web.
- Conexion con mas de 75 proveedores de modelos de IA, incluyendo Anthropic, OpenAI y Google Gemini.
- Soporte para modelos locales (aunque el Space no tiene GPU, por lo que no puede ejecutar modelos locales de forma practica).
- Modo plan (presionando Tab) para que el agente elabore un plan antes de realizar cambios.
- Generacion de archivos `AGENTS.md` mediante el comando `/init` para mantener contexto entre sesiones.
- Comparticion de sesiones mediante enlaces publicos con el comando `/share`.
- Acceso a un terminal integrado dentro del contenedor, con capacidad para `git clone`, edicion de archivos y ejecucion de comandos.
- Autenticacion basica HTTP para proteger la interfaz web.

## Casos de uso

- Desarrollo de proyectos en la nube sin configuracion local: un desarrollador puede duplicar el Space, anadir sus claves de API y empezar a trabajar en un proyecto desde cualquier navegador, sin instalar nada en su maquina.
- Refactorizacion de codigo asistida por IA: el agente puede analizar un repositorio clonado en el workspace y proponer cambios estructurales, con el modo plan para revisar antes de aplicar.
- Generacion de codigo desde cero: describir una funcionalidad en lenguaje natural y obtener un esqueleto de proyecto o funciones especificas, gracias a la conexion con modelos como Claude o GPT.
- Depuracion de errores: pegar un stack trace o describir un fallo y pedir al agente que localice la causa y sugiera correcciones, aprovechando el acceso al terminal para ejecutar pruebas.
- Creacion de documentacion de proyecto: usar `/init` para generar un `AGENTS.md` que documente la estructura y convenciones del repositorio, facilitando el trabajo colaborativo.
- Entorno de pruebas para evaluar diferentes proveedores de IA: al poder configurar varias claves de API, se puede comparar el comportamiento de distintos modelos en tareas de codificacion sin cambiar de herramienta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Este repositorio no contiene un modelo de IA, por lo que no existen metricas de rendimiento como MMLU, HumanEval o GSM8K. El rendimiento del Space depende del tier gratuito de CPU de Hugging Face, que esta limitado y puede ser lento para refactorizaciones pesadas, segun se indica en la propia documentacion del Space.

## Requisitos de hardware

- No se requiere GPU: el Space esta disenado para ejecutarse en el tier gratuito de CPU de Hugging Face.
- El contenedor necesita recursos minimos de CPU y RAM para ejecutar OpenCode y el servidor web; los limites exactos no estan especificados, pero el tier gratuito es suficiente para uso basico.
- Para un uso mas exigente, se puede actualizar a un Space de pago con CPU dedicada (a partir de 0,03 USD/hora) o a un plan con mas RAM.
- El despliegue se realiza directamente en Hugging Face Spaces; no se requiere infraestructura propia.
- No se recomienda ejecutar modelos locales en este Space, ya que no dispone de GPU y el rendimiento seria inaceptable.

## Comparativa con modelos similares

No aplica directamente, ya que no es un modelo. Como alternativa de comparacion, se pueden considerar otros agentes de codificacion de codigo abierto que se ejecutan localmente:

| Herramienta | Tipo | Proveedores soportados | Licencia | Despliegue |
|---|---|---|---|---|
| OpenCode Cloud (este Space) | Agente de codificacion en navegador | 75+ (via API) | MIT | Hugging Face Spaces |
| Cline (antes Claude Dev) | Extension de VS Code | Varios (Anthropic, OpenAI, etc.) | MIT | Local |
| Aider | CLI de codificacion asistida | Varios (OpenAI, Anthropic, etc.) | Apache 2.0 | Local |
| Continue | Extension de IDE | Varios (incluye modelos locales) | Apache 2.0 | Local |

La principal diferencia es que OpenCode Cloud no requiere instalacion local y esta pensado para uso gratuito en la nube, mientras que las alternativas locales ofrecen mas control sobre el entorno y pueden ejecutar modelos locales.

## Limitaciones y advertencias

- No es un modelo de IA: no tiene capacidades propias de generacion; depende completamente de las APIs de los proveedores configurados.
- El tier gratuito de Hugging Face Spaces es efimero: el Space se detiene tras aproximadamente 48 horas de inactividad y los datos no guardados en git se pierden.
- No hay GPU disponible, por lo que no se pueden ejecutar modelos locales de lenguaje dentro del Space.
- Los limites de recursos del tier gratuito pueden provocar lentitud en tareas de refactorizacion de archivos grandes.
- No se pueden exponer servicios adicionales desde el contenedor (sin puertos salientes), lo que limita ciertos flujos de trabajo.
- Las sesiones se almacenan en el sistema de archivos del contenedor y se pierden al reiniciar; es necesario usar `/share` o git para persistir.
- La seguridad depende de la clave de API del proveedor: si se filtra, cualquier persona con acceso al Space podria consumirla.
- La licencia MIT cubre el Dockerfile y la configuracion, pero OpenCode en si esta bajo la licencia de Anomaly (tambien MIT, segun se indica).

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Mubspro54/opencode-cloud
- Documentacion de OpenCode: https://opencode.ai/docs/
- Sitio oficial de OpenCode: https://opencode.ai/
- Repositorio alternativo opencode-cloud en GitHub: https://github.com/opencolin/opencode-cloud/
- Guia de conexion de OpenCode con MaaS (Huawei Cloud): https://support.huaweicloud.com/intl/en-us/model-call-maas/maas-modelarts-0909.html
- Sitio de OpenCode (alternativo): https://open-code.dev/
