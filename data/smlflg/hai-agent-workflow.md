# smlflg/HAI-Agent-Workflow

## Resumen

smlflg/HAI-Agent-Workflow es un repositorio alojado en HuggingFace que no contiene los pesos de un modelo de lenguaje, sino un recorte ("slice") canónico de artefactos de agentes y flujo de trabajo correspondiente a la versión V1.6 del sistema HAI. Lo publica el usuario smlflg y su contenido son ficheros Markdown, YAML, SVG, HTML y audio, no tensores: perfiles de agente (`profiles/hai-agent/`, `profiles/hai-executer/`, `profiles/hai-validator/`), un registro de roles (`hermes-registry/AGENT_REGISTRY.md`), un ledger de capacidades (`hai-capability-ledger/`), una lane piloto de Cursor/Composer y un directorio `docs/` con el contrato de ejecución.

El problema que aborda es la orquestación disciplinada de agentes: define una cadena fija `NEXT_STEP` → Handoff → Executer → Validator → Human Gate, en la que el agente principal prepara y acota decisiones, un ejecutor vinculado aplica únicamente los `EXECUTION_STEP` aceptados y un validador en modo solo lectura revisa el informe posterior. Las acciones con efectos externos (commit, push, deploy, autenticación, credenciales) quedan sujetas a aprobación humana explícita.

Es relevante ahora como plantilla reproducible de gobierno de agentes más que como modelo: separa preparación, ejecución y validación, y deja constancia de capacidades en un ledger auditable. No se dispone de datos sobre arquitectura neuronal, parámetros, contexto, idiomas o licencia, y el propio repositorio ocupa 0.0 GB según HuggingFace, con 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible; no es una red neuronal, sino un conjunto de artefactos de orquestación multiagente (Markdown, YAML, SVG, HTML) |
| Parámetros totales | no aplicable (no contiene pesos de modelo) |
| Parámetros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponibles |
| Idiomas soportados | no disponibles en la ficha de HuggingFace; la documentación del repositorio está redactada en alemán |
| Licencia | no disponible |
| Formato de pesos | no disponible; el repositorio contiene Markdown, YAML, SVG, HTML y audio M4A almacenado en Git LFS |
| Identificador | smlflg/HAI-Agent-Workflow |
| Autor | smlflg |
| Pipeline declarado | no disponible |
| Tamaño del repositorio | 0.0 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-09-16 |
| Última actualización | 2026-09-16 |

## Arquitectura y entrenamiento

No existe entrenamiento asociado: el repositorio no documenta dataset, número de tokens, composición de datos ni fases de RLHF o DPO, y no hay evidencia de que contenga ningún modelo entrenado. La "arquitectura" es un flujo de trabajo de agentes con etapas encadenadas y puertas de control. La cadena canónica descrita en los diagramas es `NEXT_STEP` → Handoff → Executer → Validator → Human Gate. Los componentes principales son: el agente propietario con su `SOUL.md`, `config.yaml` y biblioteca de skills; el ejecutor vinculado que solo procesa `EXECUTION_STEP` aceptados; el validador de solo lectura que actúa tras el informe del ejecutor; la lane piloto de Cursor/Composer como ejecutor estrecho y no sustitutivo; el `AGENT_REGISTRY.md` de Hermes con roles y capacidades; y el capability ledger con sus notas de construcción.

El repositorio declara explícitamente sus límites de gobierno: el agente HAI prepara y restringe decisiones y solo lanza pasos aprobados; el ejecutor y el validador forman la cadena de ejecución fija; Cursor/Composer es una lane piloto y no reemplaza al validador, a la reparación con Gemini ni a la puerta humana; y commit, push, deploy, autenticación, credenciales y efectos secundarios externos requieren autorización explícita. Incluye además `versions/`, un archivo congelado de los estados V1 a V2 del monorepo (con un podcast de 40 MB en Git LFS), `codex-skills/` con las skills `github-autonomy-loop` y `hai-version-cycle`, y `Projek-Managment/archify/` con diagramas HTML y comprobaciones visuales. No se incorporó `skills/.curator_backups/` (11 MB de snapshots en tar).

## Capacidades

- Definición de roles de agente separados: propietario, ejecutor vinculado y validador de solo lectura.
- Cadena de ejecución con puertas duras: `NEXT_STEP`, handoff, ejecución, validación y human gate.
- Registro de agentes y capacidades en `hermes-registry/AGENT_REGISTRY.md`.
- Ledger de capacidades auditable, con skill propia y notas de construcción.
- Contrato de ejecución V1.6 que fija las condiciones de paso para ejecutor, validador y puerta humana.
- Integración piloto con Cursor/Composer como lane de ejecución estrecha.
- Skills de Codex para autonomía en GitHub (`github-autonomy-loop`) y para ciclos de versión (`hai-version-cycle`).
- Diagramas de arquitectura y linaje del repositorio, además de visual-checks HTML generados con Archify.
- Archivo histórico congelado de las versiones V1 a V2, con audio de podcast de 40 MB en Git LFS.
- Gestión de secretos fuera del repositorio: todos los campos `api_key` de los `config.yaml` están vacíos y las claves se inyectan en tiempo de ejecución desde el entorno Hermes.
- No se declaran capacidades de generación de texto, razonamiento, código, matemáticas, visión, tool calling ni multilingüismo, porque no hay un modelo subyacente en este repositorio.

## Casos de uso

- Orquestación de agentes con validación previa a producción: la cadena Executer → Validator → Human Gate permite que un cambio propuesto se aplique solo tras informe de validación y aprobación explícita, lo que encaja en equipos que necesitan trazabilidad de cada paso.
- Plantilla de gobierno para pipelines internos de IA: el `V1.6_EXECUTOR_CONTRACT.md` define puertas duras reutilizables para separar quién prepara, quién ejecuta y quién revisa en cualquier automatización corporativa.
- Auditoría de capacidades de un agente: el capability ledger y el `AGENT_REGISTRY.md` permiten inventariar qué puede hacer cada rol y contrastarlo con lo realmente desplegado.
- Integración de asistentes de edición de código como ejecutores acotados: la lane Cursor/Composer se usa como ejecutor piloto para tareas limitadas, manteniendo la validación independiente y sin delegar en ella la puerta humana.
- Automatización de ciclos de versión: la skill `hai-version-cycle` sirve para gestionar el paso entre versiones con archivo congelado en `versions/`, evitando ediciones sobre el histórico.
- Autonomía controlada en GitHub: la skill `github-autonomy-loop` se emplea para operaciones repetitivas sobre repositorios, reservando commit, push y credenciales para aprobación manual.
- Documentación viva de arquitectura: los diagramas de `docs/DIAGRAMS.md` y los mapas de Archify permiten mantener actualizada la topología del sistema y detectar deriva respecto al monorepo original.
- Migración desde un monorepo a una fuente canónica: las notas de linaje describen cómo pasar el antiguo camino `V1.6/hermes-profiles/active/*` a symlink o submódulo para evitar divergencias silenciosas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no contiene un modelo evaluable, por lo que métricas como MMLU, HumanEval o GSM8K no son aplicables. Los resultados de la búsqueda web proporcionada corresponden a NuScale Power Corporation (ticker SMR) y no guardan relación con este repositorio.

## Requisitos de hardware

- VRAM para inferencia: no aplicable; el repositorio no contiene pesos ni ejecuta inferencia.
- GPU recomendadas: no aplicable (no se requiere GPU para los artefactos incluidos).
- Ejecución en GPU de consumo: no aplicable.
- Almacenamiento: el repositorio ocupa 0.0 GB según HuggingFace; requiere Git y Git LFS para recuperar el audio M4A de 40 MB alojado en `versions/V2/*.m4a`.
- Opciones de despliegue: no se documentan vLLM, llama.cpp, Ollama ni TGI; el despliegue consiste en clonar el repositorio (`git clone https://github.com/smlfg/HAI-Agent-Workflow.git`) y leer los ficheros de `docs/`.
- Dependencias de entorno: las claves de API se resuelven en tiempo de ejecución desde el entorno Hermes, no desde el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. Este repositorio no es un modelo de lenguaje, por lo que no procede compararlo con alternativas de la misma categoría de pesos o de tarea de inferencia. Tampoco se dispone de información sobre frameworks de orquestación comparables en la documentación proporcionada, ni de métricas que permitan establecer una comparación objetiva.

## Limitaciones y advertencias

- No es un modelo: no genera texto, no razona y no puede evaluarse con benchmarks de lenguaje.
- Licencia no disponible: no se puede confirmar si se permite el uso comercial, la modificación o la redistribución de los artefactos.
- Falta de metadatos en HuggingFace: sin pipeline, sin idiomas declarados y sin model card estructurada en la plataforma.
- Idioma de la documentación: los ficheros internos están redactados en alemán, lo que añade coste de traducción para equipos hispanohablantes.
- Riesgo de deriva: el propio repositorio advierte de que los cambios hechos en el antiguo camino del monorepo (`V1.6/hermes-profiles/active/*`) pueden divergir silenciosamente; se recomienda convertir ese camino en symlink o submódulo.
- `versions/` es un archivo congelado y de solo lectura; cualquier modificación debe ir al nivel superior y nunca al histórico.
- Contenido omitido: no se incluye `skills/.curator_backups/` (11 MB de snapshots en tar), lo que puede dificultar la reproducción de estados antiguos.
- Gestión de secretos: los `api_key` están vacíos por diseño y dependen del entorno Hermes; un despliegue sin ese entorno no podrá autenticarse.
- Discrepancia de autoría: el identificador de HuggingFace es `smlflg` mientras que la URL de clonado apunta a la organización `smlfg` en GitHub; conviene verificar cuál es la fuente canónica antes de integrarlo.
- Riesgo de alucinación: no aplicable directamente, pero cualquier agente que consuma estos artefactos heredará los sesgos del modelo que lo ejecute, no de este repositorio.
- Las restricciones de efectos externos (commit, push, deploy, credenciales) son convenciones documentadas, no mecanismos técnicos de aplicación: requieren implementación propia para ser efectivas.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/smlflg/HAI-Agent-Workflow
- Repositorio en GitHub (según el quickstart): https://github.com/smlfg/HAI-Agent-Workflow
- Documentación citada en el repositorio: `docs/REPOSITORY_MAP.md`, `docs/DIAGRAMS.md`, `docs/README.md`, `docs/V1.6_EXECUTOR_CONTRACT.md`
- Otros recursos internos: `hermes-registry/AGENT_REGISTRY.md`, `hai-capability-ledger/`, `codex-skills/`, `Projek-Managment/archify/`
- No se han encontrado papers, blogs, demos ni páginas de modelo adicionales en la búsqueda web proporcionada.
