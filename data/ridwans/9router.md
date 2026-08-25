# ridwans/9router

## Resumen

9Router es una herramienta de enrutamiento de IA de codigo abierto, desarrollada por el usuario decolua y publicada en HuggingFace bajo el identificador ridwans/9router. No se trata de un modelo de lenguaje, sino de un proxy local inteligente que conecta herramientas de programacion asistida (Claude Code, Codex, Cursor, Cline, Copilot, Antigravity, Gemini CLI, entre otras) con mas de 40 proveedores de IA y mas de 100 modelos, gestionando el fallback automatico entre ellos y optimizando el consumo de tokens.

La herramienta resuelve un problema practico: las interrupciones por limites de uso de las herramientas de codificacion con IA y el gasto excesivo de tokens. Su relevancia actual radica en que los desarrolladores que trabajan a diario con asistentes de codigo se enfrentan a limites de cuota y costes elevados, y 9Router ofrece una capa de abstraccion que permite aprovechar al maximo las suscripciones existentes, conmutar a modelos gratuitos o economicos cuando se agotan los limites, y reducir el consumo de tokens entre un 20% y un 40% mediante su sistema RTK (compresion de salidas de herramientas).

El proyecto se distribuye bajo licencia MIT, se instala globalmente con npm, y ofrece un panel de control local en el puerto 20128 para monitorizacion en tiempo real de cuotas, contadores de reset y estadisticas de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de lenguaje, es un router/proxy de IA) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (depende de los modelos enrutados) |
| Tipos de cuantizacion | no disponible (no aplica, es software en Node.js) |
| Idiomas soportados | no disponible (gestiona modelos de multiples proveedores) |
| Licencia | MIT |
| Formato de pesos | no disponible (no aplica; se distribuye como paquete npm) |

## Arquitectura y entrenamiento

No aplica el concepto de arquitectura ni entrenamiento de modelos, ya que 9Router no es un modelo de lenguaje sino un proxy de enrutamiento. Internamente implementa una arquitectura de software cliente-servidor local: un panel de control web en Node.js que actua como intermediario entre las herramientas de codificacion y los proveedores de IA. Sus componentes principales son el sistema de enrutamiento de tres niveles (suscripcion activa, modelos economicos y modelos gratuitos), el compresor de tokens RTK que reduce las salidas de herramientas antes de enviarlas al modelo, un traductor de formatos de peticion entre los esquemas OpenAI, Claude, Gemini y Cursor, y un gestor de multiples cuentas que reparte las peticiones en modo round-robin entre los proveedores configurados.

No existe entrenamiento de datos ni ajuste de pesos. El proyecto se distribuye como codigo fuente en el repositorio GitHub decolua/9router y como paquete instalable mediante npm.

## Capacidades

- Enrutamiento inteligente entre mas de 40 proveedores de IA y mas de 100 modelos.
- Sistema de fallback en tres niveles: primero usa la suscripcion activa, luego conmuta a modelos economicos y finalmente a modelos gratuitos cuando se alcanzan los limites.
- Compresion de salidas de herramientas mediante RTK, que reduce el consumo de tokens entre un 20% y un 40%.
- Traduccion de formatos de peticion entre OpenAI, Claude, Gemini y Cursor, lo que permite que herramientas como Claude Code utilicen modelos de otros proveedores sin cambios.
- Soporte de multiples cuentas con distribucion round-robin para evitar limites de uso.
- Monitorizacion en tiempo real de cuotas, contadores de tokens y cuenta atras de reset de proveedores.
- Compatibilidad con las principales herramientas de codigo asistido: Claude Code, Codex, Cursor, Cline, Copilot, Antigravity, Gemini Code, OpenCode y OpenClaw.

## Casos de uso

- Evitar interrupciones por limites de uso en Claude Code: cuando se alcanza el limite de la suscripcion de Anthropic, 9Router conmuta automaticamente a modelos gratuitos de proveedores como Kiro AI u OpenCode Free, permitiendo continuar la sesion de programacion sin pausas.
- Reduccion de costos en entornos de desarrollo con Cursor o Copilot: el compresor RTK reduce el volumen de tokens enviados al modelo, lo que se traduce en un ahorro de entre el 20% y el 40% en el consumo facturado.
- Unificacion de multiples suscripciones: un equipo puede configurar varias cuentas de Claude, OpenAI y Gemini y 9Router reparte las peticiones en round-robin, aprovechando al maximo los limites de cada cuenta antes de pasar a modelos gratuitos.
- Integracion de modelos economicos en pipelines de CI/CD: los desarrolladores pueden configurar que los trabajos automatizados de generacion de codigo usen modelos de DeepSeek o Groq cuando no se requiere la maxima calidad, reservando los modelos premium para revisiones criticas.
- Traduccion de formatos para usar modelos de un proveedor con herramientas de otro: por ejemplo, usar el modelo de Gemini desde Cursor, o el de OpenAI desde Claude Code, sin necesidad de cambiar de herramienta.
- Monitorizacion de cuotas en entornos con multiples proveedores: el panel en tiempo real muestra el estado de cada proveedor, los tokens consumidos y el tiempo restante hasta el reset de cuota, lo que permite planificar el trabajo de forma eficiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. 9Router no es un modelo de lenguaje, por lo que no aplican metricas como MMLU, HumanEval o GSM8K. El rendimiento de la herramienta se mide en terminos de ahorro de tokens (entre el 20% y el 40% segun la documentacion) y de disponibilidad (evitar interrupciones por limites de uso), pero no existen datos publicados que cuantifiquen su latencia o throughput de enrutamiento.

## Requisitos de hardware

- Se trata de un software ligero en Node.js que se ejecuta localmente como proxy; no requiere GPU ni VRAM.
- Requisitos minimos: un sistema con Node.js instalado y acceso a red para comunicarse con los proveedores de IA.
- El panel de control se sirve en localhost en el puerto 20128, por lo que no necesita despliegue en servidor externo.
- Opciones de despliegue: instalacion global via `npm install -g 9router` y ejecucion con el comando `9router`.
- No se dispone de datos publicados sobre latencia o throughput del enrutamiento.

## Comparativa con modelos similares

No se conocen herramientas comparables directamente en la informacion disponible. 9Router comparte categoria con otros proxies de enrutamiento de IA como LiteLLM o OpenRouter, pero no se dispone de datos publicados que permitan una comparacion cuantitativa en cuanto a rendimiento, proveedores soportados o ahorro de tokens. La unica diferencia documentada es que 9Router se centra en herramientas de codigo especificas (Claude Code, Codex, Cursor, Cline) y en el fallback hacia modelos gratuitos, mientras que LiteLLM se orienta a estandarizar API de modelos en entornos empresariales y OpenRouter es un agregador de pago por uso.

## Limitaciones y advertencias

- La herramienta depende de la disponibilidad y de los terminos de uso de los proveedores gratuitos y de pago; si un proveedor cambia sus politicas o elimina su acceso gratuito, el fallback puede dejar de funcionar.
- El ahorro de tokens del 20-40% es una cifra prometida por el autor, sin datos publicados de mediciones independientes.
- El uso de multiples cuentas y de modelos gratuitos puede infringir los terminos de servicio de algunos proveedores de IA; el usuario debe revisar las condiciones de cada servicio antes de configurarlo.
- El proyecto es de codigo abierto con licencia MIT, pero el mantenimiento y la seguridad del codigo no estan auditados por terceros; se recomienda revision del codigo fuente antes de usarlo en entornos de produccion.
- La traduccion de formatos entre proveedores puede provocar perdida de funcionalidades especificas de cada modelo (por ejemplo, herramientas o modos de razonamiento propios de Claude o Gemini).
- No hay garantia de que todas las herramientas de codigo soporten la integracion con el proxy; la compatibilidad debe verificarse para cada caso concreto.

## Enlaces

- Repositorio de GitHub: https://github.com/decolua/9router
- Repositorio alternativo en GitHub: https://github.com/decolua//9router
- Sitio web oficial: https://9router.com
- Documentacion en el README del repositorio: https://github.com/decolua/9router/blob/master/README.md
- Ficha en HuggingFace: https://huggingface.co/ridwans/9router
- Documentacion de la API de modelos y precios en DeepWiki: https://deepwiki.com/decolua/9router/9.6-models-and-pricing-api
- Ficha en AiSpaces: https://aispaces.net/ai-tool/9router
