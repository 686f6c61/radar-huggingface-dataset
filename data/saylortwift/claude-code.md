# SaylorTwift/claude-code

## Resumen

El repositorio `SaylorTwift/claude-code` no es un modelo de inteligencia artificial ni contiene pesos: es un espejo de solo lectura, y parcial por necesidad, del repositorio público de GitHub `anthropics/claude-code`. Tal como aclara su propia model card, el motor del agente de Claude Code es de código cerrado y se distribuye como paquete npm (`@anthropic-ai/claude-code`); este espejo recoge únicamente el material público que rodea al producto: documentación, ejemplos, plugins y scripts.

Claude Code es una herramienta de programación agéntica que se ejecuta en la terminal, interpreta el código base del usuario y automatiza tareas rutinarias, explicación de código complejo y flujos de trabajo de git mediante comandos en lenguaje natural. Se puede usar desde la terminal, desde el IDE o invocando `@claude` en GitHub, y requiere Node.js 18 o superior.

Su relevancia para un desarrollador o investigador no es la de un checkpoint evaluable, sino la de un artefacto de referencia: permite inspeccionar la superficie pública del producto (plugins con comandos y agentes personalizados, scripts de instalación, documentación de uso de datos) sin acceso al motor propietario. La licencia es `anthropic-commercial-terms`, no una licencia de código abierto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio no contiene un modelo; es un espejo de material público de Claude Code) |
| Parámetros totales | no disponible (no hay checkpoint de pesos) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (no se distribuyen pesos) |
| Idiomas soportados | no disponible |
| Licencia | `other` / `anthropic-commercial-terms` (Anthropic Commercial Terms of Service) |
| Formato de pesos | no disponible. El repositorio contiene documentación, ejemplos, plugins y scripts; el agente se distribuye como paquete npm `@anthropic-ai/claude-code` |
| Tipo de repositorio | espejo de código fuente (source mirror), parcial y de solo lectura |
| Tamaño del repositorio | 0.0 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-09-16 |
| Última actualización | 2026-09-16 |

## Arquitectura y entrenamiento

No hay información disponible sobre arquitectura, número de parámetros, volumen de tokens de entrenamiento, composición del dataset ni técnicas de alineación (RLHF, DPO u otras), porque este repositorio no aloja ningún modelo. La model card indica explícitamente que el agente central de Claude Code es de código cerrado y que lo que se publica son los materiales periféricos.

Lo que sí documenta el repositorio es la estructura de extensión del producto: un directorio de plugins que añade comandos y agentes personalizados, un conjunto de scripts de instalación para macOS/Linux (script `curl` y Homebrew), Windows (script PowerShell y WinGet) y npm —este último marcado como obsoleto—, y documentación de referencia sobre uso y retención de datos. La herramienta se describe como un agente que opera sobre el código base del usuario desde la terminal, el IDE o GitHub.

## Capacidades

- Programación agéntica en terminal: el agente entiende el código base del usuario y ejecuta tareas rutinarias mediante comandos en lenguaje natural.
- Explicación de código complejo.
- Gestión de flujos de trabajo de git.
- Integración en tres superficies: terminal, IDE y GitHub (etiquetando `@claude` en la plataforma).
- Sistema de plugins que extiende la funcionalidad con comandos y agentes personalizados, documentado en el directorio `plugins/` del repositorio.
- Instalación multiplataforma: macOS, Linux y Windows, con métodos recomendados por sistema operativo.
- Reporte de incidencias desde dentro de la herramienta mediante el comando `/bug`, además del canal de issues en GitHub.
- Capacidades de tool calling, function calling, razonamiento multi-paso, visión, audio o modo de pensamiento: no disponibles en la información proporcionada.

## Casos de uso

- Automatización de tareas rutinarias sobre un repositorio: refactorizaciones, renombrados masivos o actualización de dependencias se solicitan en lenguaje natural y el agente las ejecuta sobre el código base local, evitando trabajo manual repetitivo.
- Explicación de código heredado: dado un proyecto sin documentación, el agente puede recorrer los ficheros y explicar la lógica de los módulos complejos, útil en incorporaciones a equipos o auditorías.
- Flujos de git asistidos: creación de ramas, commits, revisión de cambios y operaciones habituales de control de versiones gestionadas desde la propia terminal.
- Revisión y colaboración en GitHub: invocando `@claude` en la plataforma se integra en el flujo de revisión sin salir del repositorio remoto.
- Asistente dentro del IDE: el mismo agente puede usarse desde el entorno de desarrollo, lo que reduce el cambio de contexto entre editor y terminal.
- Extensiones a medida mediante plugins: el repositorio incluye un directorio de plugins con comandos y agentes personalizados, que sirve como base para construir automatizaciones propias adaptadas a un flujo de trabajo concreto.
- Estandarización de tareas de equipo mediante los scripts del repositorio: los métodos de instalación documentados (script oficial, Homebrew, PowerShell, WinGet) permiten desplegar la herramienta de forma homogénea en estaciones de trabajo macOS, Linux y Windows.
- Referencia para desarrolladores de herramientas: al ser un espejo público del material no propietario, permite estudiar cómo se estructura la capa de plugins y scripts de un producto agéntico comercial cerrado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no contiene pesos ni evaluaciones del motor del agente, por lo que no existen datos de MMLU, HumanEval, GSM8K ni de resolución de tareas de software (SWE-bench u otros) asociados a este artefacto.

## Requisitos de hardware

- VRAM para inferencia: no aplica. El repositorio no contiene pesos, por lo que no hay requisitos de memoria de GPU asociados a este artefacto.
- GPU recomendadas: no disponibles.
- Compatibilidad con GPU de consumo: no aplica por el mismo motivo.
- Requisitos de entorno declarados: Node.js 18 o superior.
- Métodos de instalación soportados: script oficial para macOS/Linux (`curl -fsSL https://claude.ai/install.sh | bash`), Homebrew (`brew install --cask claude-code`), script PowerShell para Windows (`irm https://claude.ai/install.ps1 | iex`), WinGet (`winget install Anthropic.ClaudeCode`) y npm (`npm install -g @anthropic-ai/claude-code`), este último marcado como obsoleto.
- Opciones de despliegue: la información disponible no detalla si la inferencia se ejecuta en local o en servidores de Anthropic; dado que el motor del agente es de código cerrado y no se distribuye como pesos, no se puede confirmar un despliegue autoalojado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La comparación en términos de parámetros, contexto o rendimiento no es aplicable: este artefacto no es un modelo. Se compara a continuación con el repositorio del que deriva y, de forma cualitativa, con la categoría de agentes de codificación en terminal.

| Artefacto | Tipo | Origen | Licencia | Disponibilidad |
|---|---|---|---|---|
| `SaylorTwift/claude-code` (Hugging Face) | Espejo parcial de solo lectura | Réplica de terceros | `anthropic-commercial-terms` | Repositorio de 0.0 GB, 0 descargas, 0 likes |
| `anthropics/claude-code` (GitHub) | Repositorio oficial del material público | Anthropic | `anthropic-commercial-terms` | Canal oficial de issues y contribuciones |
| `@anthropic-ai/claude-code` (npm) | Paquete del agente (motor cerrado) | Anthropic | `anthropic-commercial-terms` | Instalación vía npm, marcada como obsoleta |
| Otros agentes de codificación en terminal | Herramientas comparables de la misma categoría | Varios | no disponible | no disponible |

No se dispone de datos verificables sobre parámetros, contexto, rendimiento o licencia de los agentes alternativos de la categoría, por lo que no se incluye una comparación cuantitativa.

## Limitaciones y advertencias

- No es un modelo ni un checkpoint: no se puede cargar, inferir ni evaluar con herramientas como vLLM, llama.cpp, Ollama o TGI.
- Réplica parcial y no oficial: el propio repositorio advierte que es un espejo "parcial, por necesidad" y que no contiene el motor del agente. Puede quedar desincronizado respecto al repositorio original y no debe considerarse la fuente canónica.
- Licencia no abierta: se rige por los Anthropic Commercial Terms of Service, no por una licencia de código abierto. Cualquier uso comercial queda sujeto a dichos términos.
- Canal de incidencias incorrecto: la model card pide expresamente que los problemas y contribuciones se dirijan al repositorio de GitHub, no a este espejo.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta, además de un tamaño de repositorio de 0.0 GB, lo que impide verificar el contenido a partir de métricas de uso.
- Recogida de datos: la documentación asociada indica que se recopilan datos de uso (aceptación o rechazo de código), datos de conversación asociados y comentarios enviados mediante `/bug`. Se mencionan salvaguardas como periodos de retención limitados para información sensible, acceso restringido a datos de sesión y políticas que impiden usar los comentarios para entrenar modelos, pero conviene revisar los términos y la política de privacidad antes de un uso en producción.
- Sesgos, riesgo de alucinación, limitaciones de contexto o de idioma: no disponibles, al no existir información sobre el modelo subyacente.
- Advertencia sobre la búsqueda web: los resultados recuperados en la búsqueda no guardan relación con el repositorio (corresponden a páginas de viviendas prefabricadas) y no se han utilizado como fuente.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SaylorTwift/claude-code
- Repositorio original en GitHub: https://github.com/anthropics/claude-code
- Issues del proyecto original: https://github.com/anthropics/claude-code/issues
- Documentación de plugins: ./plugins/README.md (dentro del repositorio)
- Documentación oficial: https://code.claude.com/docs/en/overview
- Documentación de instalación: https://code.claude.com/docs/en/setup
- Política de uso de datos: https://code.claude.com/docs/en/data-usage
- Paquete npm: https://www.npmjs.com/package/@anthropic-ai/claude-code
- Términos comerciales: https://www.anthropic.com/legal/commercial-terms
- Política de privacidad: https://www.anthropic.com/legal/privacy
- Script de instalación para macOS/Linux: https://claude.ai/install.sh
- Script de instalación para Windows: https://claude.ai/install.ps1
- Comunidad en Discord: https://anthropic.com/discord
- Papers, blogs o demos adicionales: no disponibles en la información proporcionada.
