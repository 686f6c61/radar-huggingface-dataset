# Shaurya2020/antigravity-skills

## Resumen

El repositorio `Shaurya2020/antigravity-skills` no es un modelo de IA, sino un paquete de 17 skills (herramientas y flujos de trabajo) diseñados para Google Antigravity, el estándar abierto de Agent Skills. Publicado por el autor Shaurya2020 en agosto de 2026, este repositorio agrupa definiciones `SKILL.md` con frontmatter compatible con Antigravity 2.0, la CLI `agy` y otros agentes que lean el estándar abierto (Cursor, Claude Code, etc.). El contenido está orientado a la construcción y mantenimiento de la plataforma de juegos con dinero real 365LOTUS, incluyendo generación de proyectos Next.js + Node.js, conversión de sitios Laravel a Node.js, pipelines de investigación y verificación, y utilidades de seguridad y memoria.

Aunque no contiene pesos ni arquitectura de modelo, es relevante para desarrolladores que trabajan con agentes Antigravity y necesitan skills reutilizables para automatizar tareas de desarrollo, despliegue y verificación. El repositorio está en estado inicial (0 descargas, 0 likes) y no declara licencia ni idiomas, por lo que su uso en producción requiere validación previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (no es un modelo de IA; es un paquete de skills para agentes) |
| Parametros totales | No aplica |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | No disponible (el autor no especifica idiomas) |
| Licencia | No disponible |
| Formato de pesos | No aplica (formato de skills: archivos `SKILL.md` con frontmatter YAML, scripts de instalación y manifiestos JSON) |

## Arquitectura y entrenamiento

No se trata de un modelo entrenado, por lo que no hay arquitectura de red neuronal ni proceso de entrenamiento. El repositorio contiene una estructura de directorios con 17 skills, cada una definida en un archivo `SKILL.md` con frontmatter que sigue el estándar abierto de Agent Skills (campos `name` y `description` obligatorios) y extensiones nativas de Antigravity (campos como `kind`, `model`, `temperature`, `max_turns`, `tools`). Incluye un instalador (`install.sh`) que copia las skills a `~/.gemini/antigravity-cli/skills/` o a `.agents/skills/`, un manifiesto JSON (`manifest.json`) y scripts de apoyo (`tools.md`, `repos.md`). No hay datos de entrenamiento, tokens ni técnicas de ajuste.

## Capacidades

- Generacion de plataformas completas: la skill `/start` genera un scaffold de plataforma 365LOTUS con Next.js + Node.js, incluyendo rutas de administracion y jugador.
- Conversion de Laravel a Node.js: la skill `/laravel-to-node` convierte sitios Laravel a Express + EJS capturando todas las rutas.
- Investigacion y extraccion: la skill `/thor` orquesta pipelines de investigacion, extraccion y descubrimiento.
- Verificacion adversaria: `/thor-hammer` y `/fable-judge` realizan pasadas de verificacion de afirmaciones criticas.
- Memoria persistente: `/graph-mem` usa MCP para construir un grafo de conocimiento persistente.
- Ejecucion remota: `/hf-jobs` permite ejecutar cargas de trabajo en Hugging Face Jobs.
- Utilidades de CLI: `/hf-cli` envuelve el CLI de Hugging Face Hub para subir/descargar repositorios.
- Generacion de configuracion de proxy: `/reverse` genera configuraciones de Caddy reverse-proxy.
- Comunicacion comprimida: `/caveman` activa un modo de comunicacion ultra-comprimido para sesiones largas.
- Workflows de resolucion de problemas: `/fable-method` y `/fable-loop` implementan bucles de clasificacion, accion y prueba.

## Casos de uso

- Generacion de un sitio completo desde cero: con `/start`, un desarrollador puede ejecutar `agy /start ./mi-sitio` y obtener un scaffold de la plataforma 365LOTUS con Next.js y Node.js, incluyendo rutas de administrador y jugador, listo para desarrollo.
- Migracion de un sitio Laravel a Node.js: `/laravel-to-node` automatiza la conversion de una base de codigo Laravel a Express + EJS, capturando todas las rutas, lo que reduce horas de trabajo manual en migraciones.
- Investigacion con citas: `/deep-research` permite realizar investigacion multi-fuente con citas, util para validar requisitos de negocio o tecnico antes de implementar.
- Verificacion de afirmaciones criticas: `/thor-hammer` realiza una pasada adversaria sobre las afirmaciones de un proyecto, reobservando las cargas criticas antes de un despliegue.
- Gestion de memoria en sesiones largas: `/context-vault` recupera tokens de memoria en sesiones prolongadas, evitando perder contexto en tareas de desarrollo complejas.
- Ejecucion de tareas en compute remoto: `/hf-jobs` permite lanzar trabajos de inferencia o procesamiento en Hugging Face Jobs desde el agente, util para tareas que exceden los recursos locales.
- Monitorizacion de repositorios: `/hf-cli` gestiona repositorios en Hugging Face Hub, permitiendo subir o descargar modelos y datasets sin salir de la CLI de Antigravity.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no contiene datos de rendimiento de modelos, ya que no es un modelo. La verificacion interna menciona que se usaron para construir la plataforma live 365lotus.cc (23/23 checks de HF Jobs, 28 rutas live con HTTP 200), pero estos datos no son benchmarks estandar de modelos.

## Requisitos de hardware

- No aplica hardware de GPU o VRAM: al no ser un modelo, no requiere inferencia ni memoria de GPU.
- Requiere Google Antigravity (CLI `agy` o Antigravity 2.0 desktop) para ejecutar las skills.
- Alternativamente, puede usarse con agentes que lean el estandar abierto de Agent Skills (Cursor, Claude Code), pero las extensiones nativas de Antigravity (como `kind`, `model`) se ignoran en esos entornos.
- El instalador necesita un sistema Unix-like (bash) y acceso de escritura a `~/.gemini/antigravity-cli/skills/` o a `.agents/skills/` si se usa `--local`.
- Para skills que requieren scripts (`/start`, `/laravel-to-node`, `/thor`), el repositorio referencia directorios en `~/.cursor/skills/`; si no existen, se deben clonar los repositorios de HuggingFace asociados y definir `SKILLS_ROOT`.

## Comparativa con modelos similares

No aplica: no existe comparacion con modelos de IA. Se podria comparar con otros paquetes de skills de Antigravity, pero no se dispone de datos de repositorios comparables en la informacion proporcionada. La busqueda web menciona directorios de skills publicos (antigravityskills.com, antigravityskills.directory) con miles de skills, pero no hay datos de rendimiento o calidad para comparar.

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto ni razonamiento propio; depende del modelo subyacente del agente (ej. gemini-2.5-pro) que se configure en el frontmatter.
- Licencia no especificada: el autor no declara licencia, lo que impide uso comercial sin autorizacion explicita.
- Sin soporte oficial: el repositorio tiene 0 descargas y 0 likes, lo que sugiere que no esta probado por la comunidad.
- Especifico de un proyecto: las skills estan disenadas para la plataforma 365LOTUS; usarlas en otros contextos puede requerir adaptacion.
- Dependencias externas: algunas skills requieren repositorios de HuggingFace adicionales (365lotus-platform, laravel-to-node) que deben estar accesibles.
- Riesgo de alucinacion en agentes: aunque no es del modelo, los agentes que ejecutan las skills pueden generar contenido incorrecto; la skill `/fable-judge` intenta mitigarlo, pero no es garantia.
- Compatibilidad limitada: las extensiones nativas de Antigravity (model, temperature, etc.) son ignoradas por otros agentes, lo que puede cambiar el comportamiento en Cursor o Claude Code.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Shaurya2020/antigravity-skills
- Repositorio 365lotus-platform: https://huggingface.co/Shaurya2020/365lotus-platform
- Repositorio laravel-to-node: https://huggingface.co/Shaurya2020/laravel-to-node
- Documentacion de Google Antigravity Skills: https://antigravity.google/docs/skills
- Directorio de Antigravity Skills: https://antigravityskills.com/
- Directorio de skills de Antigravity (3.324+ skills): https://antigravityskills.directory/
- Repositorio de skills de Antigravity en GitHub: https://github.com/rmyndharis/antigravity-skills
