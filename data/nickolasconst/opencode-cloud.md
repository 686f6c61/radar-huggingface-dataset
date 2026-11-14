# nickolasconst/opencode-cloud

## Resumen

`nickolasconst/opencode-cloud` no es un modelo de lenguaje, sino un Space de Hugging Face que empaqueta OpenCode, un agente de programación con IA de código abierto que soporta más de 75 proveedores de LLM. El repositorio contiene únicamente un `Dockerfile` y la configuración necesaria para desplegar la interfaz web de OpenCode sobre la capa gratuita de CPU de Hugging Face Spaces, con autenticación básica HTTP y un workspace persistente dentro del contenedor.

El propósito del proyecto es ofrecer una vía de acceso rápida (unos dos minutos de configuración) a un agente de código en el navegador sin necesidad de infraestructura propia. El agente no ejecuta ningún modelo localmente: todas las inferencias se delegan a APIs externas (Anthropic, OpenAI, Google Gemini u OpenCode Zen) mediante claves que el usuario introduce como secretos del Space.

Por tanto, esta ficha describe un artefacto de despliegue, no un modelo con pesos, arquitectura o entrenamiento. No hay parámetros, contexto, cuantizaciones ni benchmarks asociados al repositorio. Cualquier evaluación de capacidades debe referirse al LLM subyacente que el usuario configure, no a este Space.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo; es un contenedor Docker que ejecuta OpenCode) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (depende del proveedor de LLM configurado) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible (no contiene pesos) |

## Arquitectura y entrenamiento

El repositorio no incluye ningún modelo entrenado. Su contenido es una imagen Docker basada en el SDK `docker` de Hugging Face Spaces, con `app_port: 4096`. El `Dockerfile` instala OpenCode mediante el script oficial de instalación y arranca el servidor web con `opencode web`, enlazado a `0.0.0.0:4096` para que el proxy inverso de Hugging Face pueda alcanzarlo. La autenticación se implementa con HTTP Basic Auth a través del secreto `OPENCODE_SERVER_PASSWORD`, con usuario fijo `opencode`.

No existe entrenamiento, dataset, RLHF ni innovación algorítmica en este artefacto. La lógica del agente (planificación, edición de ficheros, ejecución de comandos, tool calling) reside en OpenCode, desarrollado por Anomaly, y las capacidades reales de razonamiento y generación de código provienen del proveedor de LLM que el usuario configure mediante `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `GEMINI_API_KEY` u `OPENCODE_API_KEY`. El workspace se sitúa en `/home/user/workspace` dentro del contenedor.

## Capacidades

- Interfaz web de agente de programación accesible desde el navegador, con panel de ficheros, editor integrado y terminal.
- Soporte de más de 75 proveedores de LLM a través de la capa de abstracción de OpenCode.
- Modo plan (tecla `Tab`): el agente redacta un plan antes de modificar código.
- Comando `/init` para generar un `AGENTS.md` que persiste contexto del proyecto entre sesiones.
- Comando `/share` para publicar un enlace externo a una sesión concreta.
- Clonado de repositorios públicos mediante `git clone` (sin puertos de salida adicionales).
- Autenticación básica HTTP para proteger la UI.
- No incluye inferencia local: no hay generación de texto, visión ni audio propia.

## Casos de uso

- Prototipado rápido de agentes de código sin infraestructura: duplicar el Space, añadir una clave de API y disponer de un agente en el navegador en menos de dos minutos, útil para demos o pruebas puntuales.
- Revisión y refactorización de repositorios pequeños: clonar el proyecto en `/home/user/workspace`, pedir al agente un plan con el modo plan y aplicar cambios con revisión manual antes de hacer `git push`.
- Evaluación comparativa de proveedores de LLM: al soportar más de 75 proveedores, permite probar el mismo flujo de trabajo con distintos backends cambiando únicamente el secreto de API.
- Formación y talleres: el enlace público generado con `/share` permite mostrar sesiones reproducibles a alumnos o revisores sin que instalen nada.
- Generación de documentación de proyecto: usar `/init` para producir un `AGENTS.md` que describa la estructura y convenciones del repositorio, reutilizable en sesiones posteriores.
- Trabajo exploratorio sin git: para scripts desechables, el carácter efímero del Space evita dejar residuos, aunque implica pérdida total al reiniciar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no contiene pesos ni evaluación alguna; el rendimiento depende exclusivamente del proveedor de LLM configurado y de los límites de la capa gratuita de CPU de Hugging Face.

## Requisitos de hardware

- VRAM: no aplica; el Space se ejecuta en CPU y no realiza inferencia local.
- GPU: no se requiere ni se soporta en la configuración descrita; el autor indica explícitamente "CPU only — no GPU".
- Cabe en cualquier hardware, ya que el cómputo pesado ocurre en las APIs externas.
- Despliegue: Hugging Face Spaces con SDK `docker`, puerto 4096. Alternativas de autoalojamiento mencionadas por el autor: Oracle Cloud Always Free (24 GB de RAM, 4 núcleos ARM).
- Latencia y throughput: no disponibles; dependen de la API del proveedor y de la limitación de recursos de la capa gratuita, que el autor describe como más lenta que el desarrollo local para refactorizaciones multi-fichero pesadas.
- Persistencia: los Spaces gratuitos son efímeros y se suspenden tras unas 48 horas de inactividad; las sesiones viven en el sistema de ficheros del contenedor y se pierden al reiniciar.

## Comparativa con modelos similares

| Alternativa | Tipo | Modelo incluido | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| nickolasconst/opencode-cloud | Space Docker con agente | No (API externa) | Depende del proveedor | MIT | Capa gratuita de CPU, efímero |
| OpenCode autoalojado | CLI/servidor local | No (API externa) | Depende del proveedor | MIT (OpenCode) | Requiere máquina propia; sin límites de Space |
| OpenHands (anteriormente OpenDevin) | Agente de código open source | Configurable | Depende del modelo | MIT | Despliegue más complejo, orientado a sandbox |
| Continue / Cline | Extensiones de IDE | Configurable | Depende del modelo | Apache 2.0 / MIT | Integración en editor, no en navegador |

La comparación es aproximada: este repositorio es una capa de despliegue sobre OpenCode, por lo que su comportamiento coincide con el de OpenCode y difiere solo en el entorno de ejecución.

## Limitaciones y advertencias

- No es un modelo: no puede evaluarse en términos de parámetros, contexto o benchmarks propios.
- Solo CPU y sin GPU: no es posible ejecutar LLM locales en este Space.
- Espacio efímero: los datos y sesiones se pierden tras reinicios o tras unas 48 horas de inactividad en la capa gratuita; el autor recomienda hacer `git push` con frecuencia.
- Sin puertos de salida adicionales: solo se pueden clonar repositorios públicos, no exponer servicios.
- Límites de recursos de la capa gratuita que ralentizan tareas pesadas.
- Dependencia total de APIs de terceros: coste, disponibilidad y políticas de uso vienen impuestas por Anthropic, OpenAI, Google u OpenCode Zen, no por este repositorio.
- La autenticación es Basic Auth con contraseña definida por el usuario; si el secreto no se configura, la UI queda expuesta o no arranca correctamente.
- Riesgo de alucinación y errores de código inherentes al LLM subyacente; se recomienda revisar los cambios antes de integrarlos.
- Licencia MIT del `Dockerfile`; OpenCode es propiedad de Anomaly y se distribuye bajo su propia licencia MIT según la model card.

## Enlaces

- Hugging Face: https://huggingface.co/nickolasconst/opencode-cloud
- OpenCode: https://opencode.ai
- Documentación de OpenCode: https://opencode.ai/docs/
- OpenCode Zen (modelos curados): https://opencode.ai/zen
- Consola de Anthropic: https://console.anthropic.com
- Plataforma de OpenAI: https://platform.openai.com/api-keys
- Google AI Studio: https://aistudio.google.com/apikey
