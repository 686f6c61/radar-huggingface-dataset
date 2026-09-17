# smlflg/Proxmox

## Resumen

`smlflg/Proxmox` no es un modelo de inteligencia artificial: es un repositorio alojado en HuggingFace cuyo contenido es documentación de infraestructura escrita en alemán. Describe el plan para convertir un servidor dedicado de Hetzner en un hipervisor *bare-metal* Proxmox VE sobre el que ejecutar agentes autónomos *always-on*, con aislamiento por contenedor y capacidad de *snapshot* y *rollback*.

El objetivo declarado por el autor es sacar la ejecución de agentes de su portátil personal, que actúa hoy como única *failure domain*, y trasladarla a un sustrato aislado y recuperable. El repositorio incluye un plan de implementación, un contrato de propiedad de procesos, un documento de incidente, herramientas para que un «agente operador» controle la API REST de Proxmox, plantillas de las cajas de trabajo y un fichero `AGENTS.md` con contexto para agentes constructores.

El estado del proyecto es «Setup»: el servidor está vacío y no hay nada instalado. No contiene pesos, arquitectura de red neuronal, dataset ni resultados de evaluación. Se ha creado con fecha 2026-09-16 y acumula 0 descargas y 0 *likes*, sin licencia ni idiomas declarados en la ficha de HuggingFace.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no aplica; el repositorio no contiene un modelo de red neuronal |
| Parámetros totales | no disponible; no aplica |
| Parámetros activos | no disponible; no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica |
| Tipos de cuantización | no aplica |
| Idiomas soportados | no disponible; la documentación del repositorio está redactada en alemán |
| Licencia | no disponible; la model card no declara licencia alguna |
| Formato de pesos | no aplica; el contenido son documentos Markdown, scripts y plantillas de infraestructura |
| Tipo de artefacto | repositorio de documentación e infraestructura (Proxmox VE) |
| Autor | smlflg |
| Fecha de creación (HuggingFace) | 2026-09-16 |
| Última actualización | 2026-09-16 |
| Descargas | 0 |
| Likes | 0 |
| Etiquetas declaradas | `region:us` |
| Pipeline declarado | no disponible |

## Arquitectura y entrenamiento

No existe arquitectura de modelo ni proceso de entrenamiento. El contenido técnico del repositorio se organiza en cuatro piezas: un plan de implementación completo (`docs/PLAN.md`), un contrato vinculante de propiedad de procesos que fija reglas de propietario, límites, TTL, registros, limpieza y recuperación para cada proceso de agente (`docs/PROCESS_OWNERSHIP_CONTRACT.md`), un documento de incidente que justifica por qué el portátil principal no debe seguir siendo la *failure domain* de los agentes, y un directorio `operator/` con herramientas y scripts para que el agente operador maneje la API de Proxmox.

El diseño descrito separa dos roles. El «agente operador» reside en un LXC de gestión *always-on* y dispone de un token de API con permisos acotados (clonar, crear *snapshot*, hacer *rollback*, matar instancias). Los «agentes trabajadores» se ejecutan uno por caja aislada, con autonomía total (`bypassPermissions`) y únicamente claves revocables y de alcance reducido. La premisa de seguridad es que los privilegios completos son aceptables porque el contenedor LXC sin privilegios y el *snapshot* delimitan el daño. Cada acción debe quedar registrada con marca temporal a efectos de auditoría. No se especifican en la información disponible ni el número de tokens, ni la composición de datasets, ni técnicas de alineación como RLHF o DPO, porque no son aplicables.

## Capacidades

Las siguientes capacidades corresponden al proyecto de infraestructura, no a un modelo de lenguaje:

- Aislamiento por caja: cada agente trabajador se ejecuta en un contenedor LXC sin privilegios independiente, de modo que un fallo no se propaga al resto.
- Reversibilidad: uso de *snapshots* de Proxmox para restaurar el estado previo de una caja ante una acción destructiva.
- Control determinista: el agente operador actúa sobre la API REST de Proxmox con un token acotado, en lugar de operar manualmente sobre el hipervisor.
- Auditoría: registro con marca temporal de cada acción ejecutada por los agentes.
- Composición de *harnesses*: cada caja de trabajo puede alojar un motor intercambiable (CC, Codex, OpenCode, Aider, Hermes, según el texto).
- Autogestión local (*local-first*): despliegue autoalojado sin dependencia de servicios SaaS.
- Gobernanza humana: el control se ejerce sobre el agente operador, no mediante intervención manual directa en Proxmox.
- No se declaran capacidades de generación de texto, razonamiento, código, matemáticas, visión, *tool calling* ni multilingüismo, porque no hay modelo subyacente en el repositorio.

## Casos de uso

- Ejecución de agentes autónomos en producción: el sustrato permite mantener agentes en funcionamiento continuo sobre un host dedicado en lugar de un portátil personal, eliminando el riesgo de interrupción por fallo del equipo de trabajo.
- Recuperación ante acciones destructivas: antes de que un agente ejecute una tarea arriesgada se crea un *snapshot* de su caja; si el resultado no es válido, se restaura el estado anterior mediante *rollback*.
- Evaluación comparativa de *harnesses*: al aislar cada motor (Codex, Aider, OpenCode, etc.) en su propia caja, es posible medir y enrutar el trabajo entre ellos sin interferencias cruzadas.
- Aislamiento de credenciales: los agentes trabajadores reciben solo claves revocables y de alcance limitado, de forma que una fuga en una caja comprometida no expone las claves maestras de Hetzner o de Proxmox.
- Trazabilidad para cumplimiento interno: el registro con marca temporal de cada acción permite reconstruir qué hizo cada agente y cuándo, útil en auditorías o depuración de incidentes.
- Automatización de operaciones sobre el hipervisor: el agente operador puede clonar plantillas, aprovisionar nuevas cajas y destruirlas mediante llamadas a la API REST, sustituyendo la administración manual.
- Reproducción de entornos de desarrollo: las plantillas doradas de las cajas de trabajo permiten recrear entornos idénticos y desechables para pruebas de código.
- Continuidad ante caída del equipo principal: al trasladar la carga a un servidor dedicado, una avería del portátil deja de arrastrar consigo todos los agentes en ejecución.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no contiene modelos evaluables ni métricas de rendimiento; la búsqueda web asociada devolvió únicamente resultados sin relación con el proyecto (páginas del portal de vehículos mobile.de).

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el repositorio no contiene un modelo que requiera GPU.
- GPU recomendadas: no disponible; no se menciona ningún acelerador en la información proporcionada.
- Encaje en GPU de consumo: no aplica.
- Infraestructura declarada: un servidor dedicado de Hetzner, sin que la model card especifique modelo, CPU, RAM, almacenamiento ni ancho de banda.
- Plataforma de virtualización: Proxmox VE como hipervisor *bare-metal*, con al menos un LXC de gestión («operator») y una caja por agente trabajador.
- Aprovisionamiento descrito: acceso por Hetzner Robot, arranque en modo Rescue con clave SSH, reinicio en Rescue, ejecución de `installimage`, endurecimiento del sistema, configuración de NAT y creación del LXC del operador.
- Opciones de despliegue: no se detallan herramientas de servicio de modelos (vLLM, llama.cpp, Ollama, TGI) porque no hay modelo que servir.
- Latencia y throughput: no disponible; no se publican mediciones.

## Comparativa con modelos similares

No disponible. No existen modelos comparables porque el artefacto no es un modelo de inteligencia artificial. A modo de contexto, y sin que estos datos procedan de la información proporcionada, el componente tecnológico central del repositorio sería Proxmox VE como hipervisor de tipo 1, categoría en la que compite con VMware ESXi y XCP-ng; sin embargo, la ficha no ofrece parámetros, contexto, rendimiento ni licencia que permitan una comparación cuantitativa. Tampoco se dispone de datos sobre repositorios de orquestación de agentes con los que pueda contrastarse.

## Limitaciones y advertencias

- Naturaleza del artefacto: se trata de documentación de infraestructura, no de un modelo; cualquier consumo como ficha de modelo sería un error de interpretación.
- Estado inacabado: la propia model card indica «Setup (Server leer, noch nichts installiert)», es decir, el servidor está vacío y el proyecto no está operativo.
- Ausencia de licencia: la ficha no declara licencia, por lo que no existe una concesión explícita de derechos de uso, modificación o redistribución. Cualquier uso comercial debería aclararse con el autor.
- Idiomas: la documentación está en alemán; no se declaran otros idiomas soportados.
- Riesgo de seguridad en el diseño: los agentes trabajadores operan con `bypassPermissions` y privilegios completos dentro de su caja; la contención depende por completo de que el contenedor LXC sin privilegios y el mecanismo de *snapshot* funcionen correctamente. Un fallo de aislamiento convertiría una caja comprometida en un riesgo para el host.
- Contradicción en las fechas: la model card menciona fechas internas de 2026-07-23 y 2026-07-24, mientras que la ficha de HuggingFace registra la creación el 2026-09-16; conviene verificar la cronología real del proyecto antes de citarlo.
- Ausencia de benchmarks y de métricas operativas: no hay datos de rendimiento, disponibilidad ni tiempos de recuperación que permitan validar las promesas del diseño.
- Resultados de búsqueda no pertinentes: las consultas web asociadas devolvieron páginas del portal de vehículos mobile.de, sin relación alguna con el repositorio, por lo que no aportan verificación externa.
- Sin señales de adopción: 0 descargas y 0 *likes* implican que no existe validación por parte de terceros.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/smlflg/Proxmox
- Otros enlaces relevantes (papers, blogs, repositorios, demos): no disponibles en la información proporcionada.
- Resultados de la búsqueda web: no pertinentes; corresponden a https://www.mobile.de/ y a páginas de anuncios de vehículos del mismo portal, sin relación con el proyecto.
