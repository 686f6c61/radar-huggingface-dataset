# SaylorTwift/gemini-cli

## Resumen

SaylorTwift/gemini-cli es un repositorio alojado en Hugging Face que, según su propia model card, no es un checkpoint de modelo: se trata de un espejo de solo lectura (source mirror) del repositorio GitHub google-gemini/gemini-cli, el agente de IA de terminal open source publicado por Google. El repositorio canónico, el seguimiento de issues y las pull requests residen en GitHub, y el propio autor indica que las contribuciones deben dirigirse allí. El tamaño del repo es de 0,1 GB y no contiene pesos, tokenizadores ni ficheros de configuración de inferencia.

Gemini CLI es una herramienta de línea de comandos distribuida como paquete npm (@google/gemini-cli) que conecta la terminal del desarrollador con los modelos Gemini alojados por Google. No se ejecuta localmente un modelo: el cliente actúa como interfaz de agente y delega la inferencia en la infraestructura de Google. Ofrece, según la model card, acceso a los modelos Gemini 3 con una ventana de contexto de 1 millón de tokens, herramientas integradas (búsqueda de Google, operaciones sobre ficheros, comandos de shell, descarga web) y extensibilidad mediante MCP (Model Context Protocol).

Su relevancia actual radica en el creciente interés por agentes de codificación que operan en la terminal con soporte de tool calling, ejecución no interactiva en scripts y grounding con búsqueda en tiempo real. La licencia del repositorio es Apache 2.0. Hay que subrayar que, al no contener pesos, esta ficha no puede describir arquitectura de red, parámetros, cuantizaciones ni datos de entrenamiento: esos datos no están disponibles y corresponden en todo caso a los modelos Gemini servidos por la API, no a este repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un checkpoint de modelo; es un cliente/agente de terminal distribuido como paquete npm) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 1.000.000 de tokens (según la model card, referido a los modelos Gemini 3 a los que da acceso el cliente) |
| Tipos de cuantizacion | no disponible (no se distribuyen pesos) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (el repositorio contiene código fuente, no ficheros safetensors, GGUF ni similares) |
| ID en Hugging Face | SaylorTwift/gemini-cli |
| Autor del espejo | SaylorTwift |
| Repositorio original | google-gemini/gemini-cli |
| Tamaño del repo | 0,1 GB |
| Descargas / likes | 0 / 0 |
| Fechas | creado el 2026-09-16, actualizado el 2026-09-16 |
| Etiquetas | agent, coding-agent, cli, llm, tool-use |

## Arquitectura y entrenamiento

No hay arquitectura de red neuronal que describir en este repositorio. Se trata de un espejo del código fuente de Gemini CLI, un agente de terminal instalable mediante npx, npm global, Homebrew, MacPorts o conda (creando un entorno con Node.js de conda-forge e instalando el paquete npm dentro). El cliente se conecta a los modelos Gemini alojados por Google; por tanto, la arquitectura efectiva del modelo subyacente (transformer, MoE u otra) no se detalla en la información disponible. Tampoco se documentan tokens de entrenamiento, composición del dataset ni fases de RLHF o DPO, ya que no se publican pesos ni informes de entrenamiento en este repositorio.

La innovación técnica que sí se describe está en la capa de agente: herramientas integradas (búsqueda de Google como grounding, operaciones de ficheros, comandos de shell, descarga de contenido web), soporte de MCP para conectar capacidades externas, checkpointing de conversación para guardar y reanudar sesiones largas, ficheros de contexto personalizados (GEMINI.md) para adaptar el comportamiento al proyecto y ejecución no interactiva en scripts. El proyecto sigue tres canales de publicación: nightly (diario a las 00:00 UTC), preview (semanal, martes a las 23:59 UTC) y stable (semanal, martes a las 20:00 UTC, promoción del preview de la semana anterior más correcciones).

## Capacidades

- Comprensión y generación de código sobre bases de código grandes: consulta y edición de repositorios extensos.
- Generación de aplicaciones nuevas a partir de PDFs, imágenes o bocetos mediante capacidades multimodales.
- Depuración y resolución de problemas descritos en lenguaje natural.
- Automatización de tareas operativas: consulta de pull requests, rebases complejos y otras operaciones de flujo de trabajo.
- Ejecución no interactiva en scripts, apta para automatización de workflows.
- Tool calling y function calling mediante herramientas integradas: búsqueda de Google, operaciones sobre ficheros, comandos de shell y descarga web.
- Extensibilidad con MCP (Model Context Protocol) para integraciones personalizadas, incluida la generación de medios con Imagen, Veo o Lyria a través de servidores MCP de terceros.
- Grounding con búsqueda de Google para incorporar información en tiempo real.
- Checkpointing de conversación: guardado y reanudación de sesiones complejas.
- Contexto personalizado por proyecto mediante ficheros GEMINI.md.
- Integración con GitHub a través de la acción run-gemini-cli: revisión automática de pull requests, triaje y etiquetado de issues, asistencia bajo demanda mencionando @gemini-cli y flujos personalizados programados.
- Capacidades multimodales heredadas del modelo subyacente (interpretación de imágenes y documentos como entrada para generar aplicaciones).

## Casos de uso

- Revisión automatizada de código en pull requests: integrar la acción de GitHub permite que el agente comente diferencias y sugiera cambios con contexto del repositorio, reduciendo el tiempo de revisión manual en equipos con alto volumen de PRs.
- Triaje de issues: el agente analiza el contenido de las incidencias y aplica etiquetas o prioridades de forma automática, lo que resulta útil en proyectos open source con muchas contribuciones entrantes.
- Asistencia interactiva en la terminal para tareas de depuración: el desarrollador describe el fallo en lenguaje natural y el agente inspecciona ficheros y ejecuta comandos de shell para localizar la causa.
- Generación de prototipos desde especificaciones en PDF o bocetos: usando las capacidades multimodales, se puede partir de un documento de diseño o una imagen y obtener el esqueleto de una aplicación.
- Automatización de operaciones de repositorio: consultas a pull requests, rebases complejos y otras tareas repetitivas ejecutadas de forma no interactiva dentro de scripts de CI/CD.
- Asistente de investigación con información actualizada: el grounding con búsqueda de Google permite responder consultas técnicas que dependen de documentación o cambios recientes, evitando depender solo del conocimiento paramétrico.
- Ampliación de capacidades mediante MCP: conectar servidores MCP para tareas específicas del equipo, por ejemplo generación de medios o acceso a sistemas internos, sin modificar el núcleo del agente.
- Sesiones largas de trabajo sobre una base de código extensa: el checkpointing de conversación y la ventana de contexto de hasta 1M tokens descrita en la model card facilitan mantener el hilo en tareas de refactorización prolongadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del espejo no incluye métricas tipo MMLU, HumanEval o GSM8K, ni cifras de latencia o throughput, y no se dispone de datos de benchmarks para los modelos Gemini 3 a los que el cliente da acceso dentro de la información proporcionada.

## Requisitos de hardware

- VRAM para inferencia: no aplica en local. El cliente no ejecuta pesos; la inferencia se realiza en la infraestructura de Google, por lo que no se requiere GPU en la máquina del usuario.
- GPU recomendadas: no disponible, al no haber inferencia local.
- Compatibilidad con GPU de consumo: no aplica.
- Requisitos de ejecución local: runtime de Node.js (las instrucciones de instalación incluyen npx, npm global, Homebrew, MacPorts y conda con el paquete nodejs de conda-forge). Las especificaciones de sistema recomendadas se remiten a la documentación oficial de instalación.
- Opciones de despliegue: instalación como CLI mediante npx (@google/gemini-cli), npm global, Homebrew (brew install gemini-cli), MacPorts (sudo port install gemini-cli) o entorno conda. No se describe despliegue con vLLM, llama.cpp, Ollama o TGI porque no se sirven pesos.
- Canales de versión: preview (npm install -g @google/gemini-cli@preview), stable (…@latest) y nightly (…@nightly).
- Latencia y throughput: no disponible.
- Cuotas del nivel gratuito: 60 peticiones por minuto y 1.000 peticiones por día con una cuenta personal de Google, según la model card.

## Comparativa con modelos similares

No se dispone de datos comparativos en la información proporcionada para establecer una comparación cuantitativa con alternativas de la misma categoría (agentes de codificación en terminal como Claude Code, Aider u OpenAI Codex CLI). La información facilitada solo describe Gemini CLI, y los resultados de la búsqueda web recibidos no guardan relación con el ámbito del modelo ni con agentes de codificación.

| Criterio | Gemini CLI | Alternativas de la misma categoría |
|---|---|---|
| Tipo de artefacto | Cliente/agente de terminal (paquete npm), no un checkpoint | no disponible |
| Parámetros | no disponible (no es un modelo) | no disponible |
| Longitud de contexto | 1M tokens según la model card | no disponible |
| Licencia del código | Apache 2.0 | no disponible |
| Nivel gratuito | 60 peticiones/min y 1.000/día con cuenta personal de Google | no disponible |
| Extensibilidad | MCP y herramientas integradas | no disponible |

## Limitaciones y advertencias

- No es un modelo: el repositorio es un espejo de código fuente, por lo que no puede descargarse ni ejecutarse como checkpoint, y no admite cuantización ni inferencia local.
- Es un espejo de solo lectura: los issues y pull requests deben presentarse en el repositorio de GitHub; las contribuciones realizadas en Hugging Face no se atenderán.
- Dependencia de red y de servicio externo: el funcionamiento requiere conexión a los servicios de Google y un método de autenticación válido (inicio de sesión con cuenta de Google/OAuth o licencia de Gemini Code Assist).
- Cuotas y condiciones de servicio: el nivel gratuito está sujeto a límites de 60 peticiones por minuto y 1.000 por día, y a los términos de servicio y cuotas de Google; superarlos puede degradar o bloquear el uso.
- Riesgo de alucinación: proviene del modelo subyacente al que se conecta el cliente, no de este repositorio. No se documentan tasas de error ni evaluaciones de fidelidad en la información disponible.
- Idiomas soportados: no disponible. La model card no detalla cobertura lingüística.
- Canales preview y nightly: la propia documentación advierte de que los releases preview y nightly pueden contener regresiones y problemas pendientes de validación; en producción conviene fijar la etiqueta stable.
- Licencia: el código se distribuye bajo Apache 2.0, lo que permite uso comercial del software, pero el acceso a los modelos a través de la API está sujeto a las condiciones de Google, no a la licencia Apache 2.0.
- Datos de la ficha incompletos: no hay pipeline declarado, ni idiomas, ni descargas o valoraciones, y el repositorio no incluye documentación sobre sesgos, seguridad o evaluación.
- Ausencia de información verificable sobre el modelo subyacente: arquitectura, número de parámetros, datos de entrenamiento y métodos de alineación de los modelos Gemini 3 no se detallan en la información proporcionada.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SaylorTwift/gemini-cli
- Repositorio canónico en GitHub: https://github.com/google-gemini/gemini-cli
- Documentación oficial: https://geminicli.com/docs/
- Guía de instalación y releases: https://www.geminicli.com/docs/get-started/installation
- Changelogs: https://www.geminicli.com/docs/changelogs
- Paquete npm: https://www.npmjs.com/package/@google/gemini-cli
- Licencia: https://github.com/google-gemini/gemini-cli/blob/main/LICENSE
- GitHub Action de Gemini CLI: https://github.com/google-github-actions/run-gemini-cli
- Grounding con Google Search: https://ai.google.dev/gemini-api/docs/grounding
- MCP de generación de medios (Vertex AI Creative Studio): https://github.com/GoogleCloudPlatform/vertex-ai-creative-studio/tree/main/experiments/mcp-genmedia
- Cuotas y términos de Gemini Code Assist: https://cloud.google.com/gemini/docs/quotas
- Code Wiki del repositorio: https://codewiki.google/github.com/google-gemini/gemini-cli

Nota: los resultados de búsqueda web recibidos (slowroads.io y dominios relacionados) no guardan relación con este repositorio y no se han utilizado como fuente.
