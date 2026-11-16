# rare-disease-atlas/orphan-disease-venture-scout-skill

## Resumen

`orphan-disease-atlas/orphan-disease-venture-scout-skill` no es un modelo de lenguaje, sino un *agent skill* portable: un paquete de instrucciones en formato `SKILL.md` que se instala en agentes como Claude Code, Claude.ai, Cursor, Codex, Gemini CLI o Antigravity para dotarles de un flujo de trabajo especializado. Su funcion es emparejar perfiles tecnicos (fundadores, biologos computacionales, epidemiologos, inversores biotech) con planes de negocio y hojas de ruta traslacionales sobre enfermedades raras, con verificacion de citas.

El contenido inicial se centra en dos dossiers profundos: mielofibrosis clonal `JAK2 V617F+` y mielofibrosis autoinmune (AIMF) junto con el eje lupus/hierro/hepcidina. El skill se apoya en un servidor MCP remoto (`https://api.rare-disease-atlas.workers.dev/mcp`) y en un atlas web publico, ademas de un dataset complementario en Hugging Face con licencia CC-BY-4.0. No incluye pesos, tokenizador ni pipeline de inferencia: la "inteligencia" la aporta el agente anfitrion y el skill solo estructura la consulta y el formato de salida.

Es relevante para equipos que exploran nichos terapeuticos de baja prevalencia y necesitan acelerar la fase de scouting sin construir su propia base de conocimiento. Su utilidad practica depende por completo de la cobertura y actualidad del atlas remoto, no de capacidades generativas propias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo neuronal; es un paquete de instrucciones `SKILL.md` para agentes) |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (depende del agente anfitrion) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | no disponible |
| Licencia | MIT (codigo e instrucciones del skill); dataset asociado bajo CC BY 4.0 |
| Formato de pesos | no disponible (artefacto textual: `SKILL.md`, scripts Python auxiliares y configuracion MCP) |

## Arquitectura y entrenamiento

No hay arquitectura de red neuronal ni entrenamiento asociado. El artefacto es un skill declarativo compatible con el estandar Agent Skills, distribuido como repositorio Git clonable en `~/.claude/skills/orphan-disease-venture-scout`. Incluye instrucciones en `SKILL.md`, un helper CLI en Python (`scripts/query_atlas.py`) y la referencia a un servidor MCP remoto versionado (`v1.3.0` segun la model card) que sirve el conocimiento del atlas.

El conocimiento proviene de un dataset publicado aparte (`rare-disease-atlas/rare-disease-venture-atlas`, CC-BY-4.0) y de un sitio web con `llms.txt`. No se documentan volumen de datos, proceso de curacion, ni metodologia de verificacion de citas mas alla de la afirmacion de que las propuestas estan "citation-verified".

## Capacidades

- Emparejamiento de perfiles fundacionales (technical founders, computational biologists, MPH/epidemiologia, inversores biotech) con blueprints de startups de enfermedades raras.
- Generacion de dossiers traslacionales con citas verificadas para mielofibrosis clonal `JAK2 V617F+`.
- Cobertura especifica de mielofibrosis autoinmune (AIMF) y del eje lupus/hierro/hepcidina.
- Consulta programatica al atlas mediante CLI (`python3 scripts/query_atlas.py --background computational-ai-bio --no-wet-lab`), con filtros por perfil y por dependencia de laboratorio humedo.
- Integracion con servidores MCP para recuperacion remota de contexto.
- Portabilidad entre agentes: Claude.ai, Claude Code, Cursor, Codex, Gemini CLI y Antigravity.
- Soporte de instalacion por Git (sin dependencia de GitHub) y por subida de ZIP en la interfaz web de Claude.
- No dispone de capacidades generativas propias, vision, audio ni tool calling nativo: hereda las del agente anfitrion.

## Casos de uso

- Evaluacion de tesis de inversion en enfermedades raras: un analista carga el skill en Claude Code y solicita un dossier sobre mielofibrosis `JAK2 V617F+`; el skill estructura la consulta contra el atlas MCP y devuelve el blueprint con citas para due diligence.
- Definicion de linea de investigacion traslacional: un biologo computacional filtra con `--background computational-ai-bio --no-wet-lab` para identificar oportunidades que no requieran validacion experimental inicial, adecuadas a un equipo sin laboratorio.
- Scouting de nichos adyacentes: un equipo centrado en lupus utiliza el dossier AIMF y el eje hierro/hepcidina para explorar solapamientos mecanisticos y posibles reposicionamientos.
- Onboarding de agentes de codigo en dominios biomedicos: un equipo de ingenieria instala el skill en Cursor para que el asistente aporte contexto de enfermedad rara al generar prototipos de software clinico o pipelines de datos.
- Generacion de material para comites cientificos: el skill produce borradores estructurados con referencias que un MPH o epidemiologo revisa antes de presentar a un comite de asignacion de recursos.
- Estandarizacion de prompts en un equipo mixto: al fijar el formato de salida y las fuentes, reduce la variabilidad entre analistas que consultan al mismo agente sobre el mismo nicho terapeutico.
- Prototipado rapido de demos internas: el servidor MCP remoto y el atlas web permiten montar una interfaz de consulta sin infraestructura propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al no ser un modelo de lenguaje, no aplican metricas como MMLU, HumanEval o GSM8K. Tampoco se documentan metricas de recuperacion, precision de citas ni latencia del servidor MCP.

## Requisitos de hardware

- No requiere GPU ni VRAM: el artefacto es texto y scripts Python sin dependencias pesadas.
- El coste computacional recae en el agente anfitrion que ejecuta el skill (Claude, Cursor, Codex, Gemini CLI, etc.).
- Despliegue local: clonado Git en `~/.claude/skills/orphan-disease-venture-scout` o subida de ZIP en Claude.ai (Settings -> Capabilities -> Skills).
- Despliegue remoto: servidor MCP alojado en Cloudflare Workers (`api.rare-disease-atlas.workers.dev/mcp`), sin infraestructura propia.
- Requisito de red para la consulta remota al atlas; el helper CLI requiere Python 3.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Alternativa | Tipo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| orphan-disease-venture-scout-skill | Agent skill + MCP | no aplica | depende del anfitrion | MIT (skill) / CC BY 4.0 (dataset) | Dominio acotado a enfermedades raras; cobertura inicial en mielofibrosis |
| orphan-disease-opportunity-mcp | Servidor MCP complementario | no aplica | no disponible | no disponible en la informacion | Mismo autor; `v1.3.0`; puede usarse sin el skill |
| Skills genericos de Claude Code | Agent skill | no aplica | depende del anfitrion | variable | Sin conocimiento de dominio biomedico ni citas verificadas |
| Busqueda web asistida por el agente | Herramienta del anfitrion | no aplica | depende del anfitrion | no aplica | Cobertura amplia pero sin curacion ni formato de dossier estandarizado |

## Limitaciones y advertencias

- No es un modelo: no genera conocimiento propio, solo orquesta consultas y formato sobre el atlas remoto. La calidad depende de la cobertura del atlas.
- Cobertura muy acotada: la documentacion solo detalla mielofibrosis clonal `JAK2 V617F+`, AIMF y el eje lupus/hierro/hepcidina. Otros nichos pueden no estar cubiertos.
- Sin datos publicados sobre metodologia de verificacion de citas, tasa de error o actualizacion del dataset.
- Dependencia de un endpoint remoto de terceros (Cloudflare Workers): riesgo de disponibilidad, cambios de esquema o desaparicion del servicio.
- Cero descargas y cero likes en el momento de la consulta: sin validacion de la comunidad ni evidencia de uso en produccion.
- Idiomas soportados no declarados; no hay garantia de salida en castellano.
- El contenido biomedico y de inversion no constituye asesoramiento medico ni financiero; requiere revision por expertos antes de cualquier decision.
- La licencia MIT cubre codigo e instrucciones, pero el dataset asociado es CC BY 4.0 y exige atribucion en reutilizacion.
- Riesgo de alucinacion heredado del agente anfitrion si este ignora las instrucciones del skill o si el atlas devuelve resultados incompletos.

## Enlaces

- Hugging Face (skill): https://huggingface.co/rare-disease-atlas/orphan-disease-venture-scout-skill
- Dataset asociado: https://huggingface.co/datasets/rare-disease-atlas/rare-disease-venture-atlas
- Servidor MCP complementario: https://huggingface.co/rare-disease-atlas/orphan-disease-opportunity-mcp
- Endpoint MCP remoto: https://api.rare-disease-atlas.workers.dev/mcp
- Atlas web y `llms.txt`: https://atlas.rare-disease-atlas.workers.dev
