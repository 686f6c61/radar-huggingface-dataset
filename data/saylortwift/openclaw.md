# SaylorTwift/openclaw

## Resumen

`SaylorTwift/openclaw` no es un checkpoint de un modelo de lenguaje. La propia model card lo indica de forma explícita: se trata de un **mirror de solo lectura** del repositorio de GitHub [`openclaw/openclaw`](https://github.com/openclaw/openclaw), publicado en Hugging Face unicamente para dar visibilidad al proyecto en el Hub. El repositorio canonico, el gestor de issues y las pull requests residen en GitHub, no en Hugging Face.

OpenClaw es un asistente de IA open source que se ejecuta en el propio equipo del usuario y se integra en los canales de mensajeria que ya se utilizan: Discord, iMessage, Slack, Teams, Telegram, WhatsApp y mas de 20 servicios adicionales, ademas de aplicaciones nativas para macOS, iOS, Android, Windows y Linux. Su pieza central es el Gateway, un plano de control local que gestiona sesiones, herramientas, eventos y conexiones de canal; la diferencia entre un uso como asistente personal en un portatil y un despliegue compartido de equipo es solo la configuracion.

El proyecto es relevante porque separa el modelo del arnes del agente. Los modelos y los arneses (Claude, Codex, modelos locales) se enchufan como plugins intercambiables, mientras que el estado, la memoria y las credenciales permanecen en el hardware del usuario. Esta custodiado por la OpenClaw Foundation, una entidad independiente 501(c)(3), no tiene tier de pago ni servicio alojado, y se distribuye bajo licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo; es una aplicacion Node.js de tipo gateway de agente, distribuida como paquete npm) |
| Parametros totales | no disponible |
| Longitud de contexto | no disponible (depende del proveedor de modelo configurado) |
| Tipos de cuantizacion | no disponible (depende del proveedor de modelo configurado) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible (el repositorio no contiene pesos) |
| Tipo de artefacto | mirror de codigo fuente de un repositorio de GitHub |
| Repositorio canonico | https://github.com/openclaw/openclaw |
| Runtime | Node.js 24.16+ o 26.1+ (se recomienda Node 26); el instalador aprovisiona el runtime si es necesario |
| Paquete publicado | npm: `openclaw` |
| Canales de mensajeria | Discord, iMessage, Slack, Teams, Telegram, WhatsApp, Google Chat, Signal y mas de 20 servicios |
| Plataformas nativas | macOS, iOS, Android, Windows, Linux |
| Autor del mirror | SaylorTwift |
| Descargas | 0 |
| Likes | 0 |
| Fecha de creacion | 2026-09-16 |
| Fecha de actualizacion | 2026-09-16 |

## Arquitectura y entrenamiento

No aplica en el sentido habitual: este repositorio no contiene un modelo entrenado, no publica pesos, no documenta tokens de entrenamiento, composicion de dataset ni etapas de RLHF o DPO. La informacion disponible describe una arquitectura de software, no una arquitectura neuronal. El modelo de lenguaje lo aporta un tercero, ya sea un proveedor alojado o un modelo local, configurado a traves del sistema de plugins de OpenClaw.

La arquitectura del sistema se organiza en cuatro capas descritas en la documentacion: el **Gateway** como plano de control local para sesiones, herramientas, eventos y conexiones de canal; la **Control UI**, la CLI y la TUI como interfaces que se conectan al Gateway; los **canales**, que llevan el asistente a los servicios de mensajeria; y las **aplicaciones companion y nodos**, que anaden voz, Canvas, camara, pantalla y acciones locales en las plataformas soportadas. La capa de extension se articula mediante tools, skills y plugins. Como innovacion destacable a nivel de diseno, la documentacion cita el principio de "gateway de confianza, ejecucion no confiable, politica determinista" como base del modelo de seguridad.

## Capacidades

- Asistente conversacional multi-canal: atiende mensajes en Discord, iMessage, Slack, Teams, Telegram, WhatsApp, Google Chat, Signal y mas de 20 servicios adicionales desde un unico Gateway.
- Uso de herramientas (tool use): las tools se ejecutan en el host para la sesion principal salvo que se configure sandboxing.
- Sistema de skills y plugins que amplia lo que el asistente puede hacer sin modificar el nucleo.
- Intercambio de proveedores de modelo: arneses como Claude, Codex o modelos locales funcionan como plugins sustituibles.
- Ejecucion local con estado, memoria y credenciales alojados en el hardware del usuario.
- Aplicaciones nativas con capacidades de voz, Canvas, camara, pantalla y acciones locales en macOS, iOS, Android, Windows y Linux.
- Despliegue como asistente personal o como instalacion compartida de equipo, con la configuracion como unica diferencia.
- Emparejamiento de remitentes desconocidos en canales con capacidad de DM mediante el comando `openclaw pairing approve <channel> <code>`.
- Interfaces de control multiples: dashboard web (Control UI), CLI y TUI.

## Casos de uso

- Asistente personal autoalojado: el usuario instala el paquete npm, ejecuta `openclaw onboard --install-daemon` y obtiene un asistente que conserva memoria y credenciales en su propio equipo, sin depender de un servicio alojado de terceros.
- Atencion en canales de mensajeria corporativa: el Gateway conecta Slack, Teams y Google Chat, de modo que un mismo asistente responde en los canales que el equipo ya usa, con configuracion compartida en lugar de despliegues separados por herramienta.
- Automatizacion con tool calling: las tools que se ejecutan en el host permiten al asistente lanzar acciones locales, y el aislamiento opcional mediante sandboxing acota el riesgo en entornos compartidos.
- Enrutado a modelos locales para requisitos de privacidad: al ser los modelos plugins intercambiables, un equipo puede apuntar el asistente a un modelo servido en su propia infraestructura y evitar enviar prompts a proveedores externos.
- Puente entre modelos frontera y flujo de trabajo local: un equipo puede configurar Claude o Codex como arnes y mantener la orquestacion, la memoria y las credenciales en su Gateway, cambiando de proveedor sin tocar el resto del sistema.
- Despliegue en dispositivos de usuario final: las apps nativas para macOS, iOS, Android, Windows y Linux permiten llevar el asistente al dispositivo, con acceso a voz, camara y pantalla donde la plataforma lo soporte.
- Uso en investigacion sobre agentes: la separacion entre gateway de confianza y ejecucion no confiable ofrece una base documentada para experimentar con politicas deterministas y limites de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Este repositorio no contiene un modelo evaluable y la model card no incluye mediciones de MMLU, HumanEval, GSM8K ni de ninguna otra suite. Del mismo modo, no se proporcionan cifras de latencia ni de throughput: ambas dependen enteramente del proveedor de modelo que se configure.

## Requisitos de hardware

- VRAM para inferencia: no aplica al propio OpenClaw; depende del modelo que se conecte. Si se usa un proveedor alojado, no se requiere VRAM local.
- GPU recomendadas: no disponibles en la informacion proporcionada. La eleccion viene determinada por el modelo local que se configure, no por OpenClaw.
- Ejecucion en GPU de consumo: no determinable a partir de la informacion disponible; dependera del modelo local elegido.
- Runtime base: Node.js 24.16+ o 26.1+ (se recomienda Node 26). El instalador aprovisiona un runtime soportado cuando es necesario.
- Opciones de instalacion: script de shell para macOS/Linux/WSL2 (`curl -fsSL https://openclaw.ai/install.sh | bash`), script de PowerShell para Windows (`iwr -useb https://openclaw.ai/install.ps1 | iex`), instalacion del paquete npm (`npm install -g openclaw@latest --allow-scripts=openclaw`) y guia especifica para Docker, Nix y otras rutas de despliegue.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. OpenClaw no pertenece a la categoria de modelos de lenguaje, sino a la de gateways o arneses de agente autoalojados. La informacion proporcionada no incluye datos de rendimiento ni comparativas con proyectos equivalentes, por lo que no se pueden ofrecer cifras contrastadas frente a alternativas.

## Limitaciones y advertencias

- Este repositorio de Hugging Face no es un checkpoint: no contiene pesos, no se puede cargar con `transformers`, vLLM ni llama.cpp, y no debe tratarse como un modelo.
- El repositorio es un mirror de solo lectura. Los issues y las pull requests deben dirigirse al repositorio de GitHub; los abiertos aqui pueden no recibir atencion.
- Cero descargas y cero likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad en el Hub.
- Sesgos conocidos: no disponibles, al no tratarse de un modelo entrenado.
- Riesgo de alucinacion: no evaluable a partir de la informacion disponible; dependera del modelo de lenguaje que se configure.
- Limitaciones de contexto e idioma: no disponibles; vienen impuestas por el modelo subyacente elegido.
- Seguridad: la propia documentacion advierte de tratar los mensajes entrantes como entrada no confiable. Las tools se ejecutan en el host para la sesion principal salvo que se configure sandboxing, y los canales con capacidad de DM emparejan a remitentes desconocidos por defecto.
- Telemetria: por defecto OpenClaw solo realiza una comprobacion diaria de version; las estadisticas anonimas de funcionalidad son opt-in y `update.checkOnStart: false` desactiva ambas.
- Licencia MIT, sin restricciones conocidas para uso comercial derivadas del propio proyecto; conviene revisar por separado las licencias de los modelos y proveedores que se conecten.
- Composicion del sistema: al delegar el modelo en proveedores externos o locales, la calidad, el coste y el cumplimiento normativo dependen de terceros ajenos a este repositorio.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SaylorTwift/openclaw
- Repositorio canonico en GitHub: https://github.com/openclaw/openclaw
- Web oficial: https://openclaw.ai
- Documentacion: https://docs.openclaw.ai
- Guia de inicio: https://docs.openclaw.ai/start/getting-started
- Por que OpenClaw (arquitectura): https://docs.openclaw.ai/start/why-openclaw
- Showcase: https://docs.openclaw.ai/start/showcase
- FAQ: https://docs.openclaw.ai/help/faq
- Documento de vision: https://github.com/openclaw/openclaw/blob/main/VISION.md
- DeepWiki: https://deepwiki.com/openclaw/openclaw
- Documentacion del Gateway: https://docs.openclaw.ai/gateway
- Control UI: https://docs.openclaw.ai/web/control-ui
- TUI: https://docs.openclaw.ai/web/tui
- Canales: https://docs.openclaw.ai/channels
- Plataformas y apps companion: https://docs.openclaw.ai/platforms
- Proveedores de modelo: https://docs.openclaw.ai/concepts/model-providers
- Tools: https://docs.openclaw.ai/tools
- Skills: https://docs.openclaw.ai/tools/skills
- Plugins: https://docs.openclaw.ai/plugins
- Guia de seguridad: https://docs.openclaw.ai/gateway/security
- Guia de instalacion: https://docs.openclaw.ai/install
- Despliegue en equipos: https://docs.openclaw.ai/start/teams
- Telemetria: https://docs.openclaw.ai/gateway/telemetry
- Paquete npm: https://www.npmjs.com/package/openclaw
- Discord: https://discord.gg/clawd
- Fundacion OpenClaw: https://openclaw.org
- Licencia MIT: https://github.com/openclaw/openclaw/blob/main/LICENSE
- CI en GitHub Actions: https://github.com/openclaw/openclaw/actions/workflows/ci.yml
