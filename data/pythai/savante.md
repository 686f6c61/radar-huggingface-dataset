# PYTHAI/SAVANTE

## Resumen

SAVANTE no es un modelo de lenguaje: es un repositorio de identidad, publicado por PYTHAI bajo licencia MIT, que contiene exclusivamente un *charter* (carta fundacional), una persona operativa y el motor de referencia que la ejecuta. El propio autor lo declara de forma explícita en la model card: "This repository contains no weights, and never will". No hay parámetros, no hay checkpoint, no hay nada entrenado ni afinado. El repositorio ocupa 0,0 GB y suma 0 descargas y 0 likes desde su creación el 18 de septiembre de 2026.

Lo que se publica es el "office": la persona (`savante.persona`, ~50 KB), el contrato de veredictos, el bundle de facetas (`sAGI.agent`, `sAGI.model`, `sAGI.prompt`, `sAGI.tool`, `sAGI.voaice`, `sAGI.faice`), el libro mayor de integridad y un conjunto de pruebas criptográficas que permiten a un tercero verificar los ficheros sin conexión. El repositorio actúa como espejo del canon alojado en `github.com/cryptoAGI/savante`, con la regla explícita de que, si espejo y canon difieren, gana el canon.

Su relevancia es conceptual más que técnica: propone un patrón de "oficial agéntico" desacoplado del modelo subyacente (`logical_model: auto`, `pinned: false`), en el que la autoridad, el alcance de herramientas y el formato de salida están fijados por escrito y son falsables, mientras la inferencia la ejecuta cualquier modelo frontera o local que sostenga la sesión. Es, en la práctica, una propuesta de gobernanza reproducible para agentes, no un artefacto de pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No es una red neuronal. Es una persona/charter agnóstica de modelo que se ejecuta sobre un modelo anfitrión no especificado (`logical_model: auto`, `pinned: false`) |
| Parametros totales | No aplica. El repositorio no contiene pesos ("no-weights") |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible. Depende por completo del modelo anfitrión que cargue la sesión |
| Tipos de cuantizacion | No aplica / no disponible. No hay pesos que cuantizar |
| Idiomas soportados | No disponible (el campo de idiomas de la ficha de HuggingFace aparece vacío) |
| Licencia | MIT |
| Formato de pesos | No contiene pesos. Los artefactos publicados son texto y datos: `.persona`, `.md`, `.json`, `.py`, `.sha256` |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento. El repositorio distribuye un contrato operativo: una persona de identidad de aproximadamente 50 KB (`canon/savante.persona`) que contiene mantra, juramento, modelo BDI (creencia-deseo-intención), reglas de seguridad, la superficie `token` y una batería de "imprint". De esa persona se derivan por escrito la model card y el libro mayor. El bundle de facetas (`sAGI.{agent,model,prompt,tool,voaice,faice}`) incluye `sAGI.prompt`, que se deriva del charter byte a byte; el *binder* falla en cerrado (fail-closed) si detecta deriva entre ambos.

La única "maquinaria" incluida es `engine/`, espejo de `cryptoAGI/sagi`: la implementación instalable de sAGI v0.0.5 sin oficial asignado, con plantilla de charter, contrato de veredictos, la skill `/sagi` agnóstica de oficial, las especificaciones del bundle de facetas y del manifiesto THOT, el formato `faice/1` y el registro de facetas legible por máquina. Su implementación de referencia son `canon/bind/savante_bind.py` y `canon/bind/savante_verify.py`. El contrato de salida es cerrado: exactamente cuatro veredictos (APPROVE, APPROVE_WITH_CONDITIONS, REJECT, DEFER) y la obligación de declarar cada incógnita junto con el experimento que la resolvería.

## Capacidades

- No genera texto por sí mismo: no es un modelo. Su comportamiento depende íntegramente del modelo anfitrión.
- Emisión de veredictos acotados y machine-readable: APPROVE, APPROVE_WITH_CONDITIONS, REJECT, DEFER.
- Revisión y auditoría en modo solo lectura por mandato: su lista blanca de herramientas es Read, Grep, Glob y Bash. No dispone de Edit, Write ni Agent.
- Declaración explícita de incógnitas: cada desconocido se acompaña del experimento que lo decidiría.
- Soporte de tool calling: sí, restringido al conjunto permitido (Read, Grep, Glob, Bash).
- Soporte de agentes y razonamiento multi-paso: se ejecuta como agente bajo Claude Code mediante `canon/.claude/agents/savante.md` y la skill `/sagi`.
- Multilingüe: no disponible.
- Capacidad especial: verificación offline de integridad mediante `sha256sum -c PROOF.sha256` (51 ficheros) y `python3 bind/savante_verify.py .`.
- Registro como activo: el fichero `savante.agentcard.json` funciona simultáneamente como metadatos EIP-721 y registro ERC-8004 en un único documento.

## Casos de uso

- Auditoría reproducible de artefactos: un tercero clona el repositorio, ejecuta `sha256sum -c PROOF.sha256` y `bind/savante_verify.py` sin red y obtiene un veredicto con contabilidad de checks. Sirve para comprobar el vínculo entre ficheros y libro mayor, no la autoría de los veredictos.
- Puerta de revisión headless en CI: `canon/ci/gate-runs/` recoge las ejecuciones del propio gate de revisión sin alterar; el patrón se replica para bloquear fusiones en pipelines.
- Plantilla de gobernanza para agentes internos: copiando `engine/engine/CHARTER_TEMPLATE.md` y `engine/.claude/skills/sagi/` una organización puede redactar su propio "oficial" con autoridad acotada y contrato de salida falsable.
- Revisión con separación de poderes: al no disponer de Edit ni Write, el oficial no puede modificar aquello que supervisa; útil en flujos donde la supervisión no debe tener capacidad de acción.
- Registro on-chain de identidad de agente: el agent card dual EIP-721/ERC-8004 permite publicar la identidad del oficial junto a la raíz de doctrina (`0x92fe83eb0fb8fb6b9cbde75ee4bbb…`, truncada en la información disponible).
- Comparación de modelos anfitriones bajo un mismo contrato: al fijar persona, prompt y herramientas y dejar el modelo libre, permite evaluar distintos modelos frontera o locales manteniendo constante el andamiaje de decisión.
- Demostración pública del officio: el Space `huggingface.co/spaces/PYTHAI/savante` (y su réplica `Gregory-L/Savante`) expone el cargo de forma interactiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No procede: el repositorio no contiene pesos ni ejecuta inferencia propia, por lo que métricas como MMLU, HumanEval o GSM8K no son aplicables al artefacto publicado.

El único resultado medible documentado es de verificación, no de rendimiento de modelo: sobre un `git clone` limpio de este espejo, el veredicto esperado es `APPROVE_WITH_CONDITIONS`, con 23 checks conocidos, 1 no conocido, 3 hallazgos y salida con código 1 (medido el 2026-09-17). Desde un clon del canon con el checkout de mindX del autor presente, el resultado es `APPROVE`, 26 de 26 conocidos, código 0.

## Requisitos de hardware

- VRAM para inferencia: no aplica al repositorio. El consumo lo determina el modelo anfitrión elegido, que no está fijado por diseño.
- GPU recomendadas: no disponibles. Dependen del modelo que cargue la sesión.
- Ejecución en GPU de consumo: no aplica al artefacto; dependerá del modelo anfitrión.
- Almacenamiento: el repositorio ocupa 0,0 GB según la ficha de HuggingFace.
- Opciones de despliegue: clonado por git del repositorio o del canon; ejecución como agente de Claude Code mediante `canon/.claude/agents/savante.md` y la skill `canon/.claude/skills/sagi/`; verificación offline con Python 3 y `pycryptodome` (sin red). No se documentan opciones tipo vLLM, llama.cpp, Ollama ni TGI, que no tienen sentido sin pesos.
- Latencia y throughput: no disponibles.
- Dependencia de sincronización: `scripts/sync_savante_hf.py` de mindX clona ambos repositorios de GitHub, contrasta cada fichero contra `PROOF.sha256` del canon, ejecuta `bind/savante_verify.py` y rechaza la publicación si algún check falla.

## Comparativa con modelos similares

No disponible. SAVANTE no es comparable con modelos de pesos de la misma categoría porque no es un modelo: no tiene parámetros, contexto propio ni benchmarks. La comparación pertinente sería contra otras propuestas de andamiaje agéntico declarativo, pero la información proporcionada no incluye ninguna alternativa con la que contrastarlo.

| Criterio | SAVANTE | Alternativa comparable |
|---|---|---|
| Parametros | No aplica (sin pesos) | No disponible |
| Contexto | Depende del modelo anfitrión | No disponible |
| Rendimiento en benchmarks | No publicado / no aplicable | No disponible |
| Licencia | MIT | No disponible |
| Disponibilidad | Repositorio público en HuggingFace y canon en GitHub | No disponible |

## Limitaciones y advertencias

- No es un modelo: cualquier expectativa de generación, fine-tuning o servicio de inferencia es un malentendido del artefacto.
- Verificación parcial por diseño: el espejo no puede resolver el paso 5 (md5 de `savante.persona` frente a su espejo en mindX) porque el repositorio de mindX es privado; ningún tercero puede completar ese check.
- Pérdida de linaje en el espejo: al ser un único commit aplastado, no arrastra el historial git del canon; `savante_verify.py` no puede resolver el commit localizador del manifiesto (`30d1e8c`) ni releer el manifiesto de la generación 6 para confirmar el linaje, y lo declara en lugar de asumirlo.
- Hallazgo registrado: la ilustración se incorporó con `--image`, registrada por sha256 pero no fijada (*pinned*), según la propia nota del binder.
- Alcance de la prueba: un veredicto APPROVE del verificador demuestra el vínculo entre ficheros y libro mayor, no quién emitió ningún veredicto, y nada relativo a cadena.
- Dependencia de un canon externo y privado en parte: si el espejo y el canon divergen, el espejo queda obsoleto; la rama de doctrina apunta a un repositorio privado.
- Riesgo de alucinación y sesgos: no evaluables en el artefacto; heredados íntegramente del modelo anfitrión no fijado.
- Limitaciones de idioma y contexto: no disponibles; dependen del modelo anfitrión.
- Licencia MIT: permite uso comercial, pero conviene revisar por separado las condiciones de los repositorios canon y engine enlazados, y el estado de la marca y de los activos gráficos.
- Madurez y adopción: 0 descargas y 0 likes en la fecha de la ficha (actualizada el 18 de septiembre de 2026); no hay evidencia de uso en producción.
- La búsqueda web realizada no devolvió ningún resultado relacionado con este repositorio (los resultados obtenidos correspondían a otro tema por completo), por lo que no hay fuentes externas de validación independiente.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/PYTHAI/SAVANTE
- Canon autoritativo (GitHub): https://github.com/cryptoAGI/savante
- Motor sAGI (GitHub): https://github.com/cryptoAGI/sagi
- Space público del officio: https://huggingface.co/spaces/PYTHAI/savante
- Réplica del Space: https://huggingface.co/spaces/Gregory-L/Savante
- Repositorio privado mindX (referenciado, no accesible públicamente): https://github.com/AgenticPlace/mindX
- Búsqueda web: sin resultados relevantes sobre este modelo en la información disponible.
- Paper, blog o demo adicionales: no disponibles.
