# 2177-AI-LAB/Godot-Skills

## Resumen

Godot-Skills es un repositorio de "skills" reutilizables para agentes de IA que trabajan sobre proyectos del motor de videojuegos Godot. Lo mantiene 2177-AI-LAB y no contiene pesos de un modelo de lenguaje: es un paquete de instrucciones estructuradas, guias tecnicas, referencias y procedimientos de verificacion que un agente (por ejemplo, un agente de codigo basado en LLM) puede cargar para ejecutar tareas concretas sobre un proyecto Godot de forma mas fiable.

El problema que aborda es la inconsistencia de los agentes de codigo cuando operan sobre motores de juego: en lugar de depender de prompts aislados, cada skill empaqueta un flujo de trabajo completo que obliga al agente a inspeccionar el proyecto real antes de asumir nada, priorizar funcionalidades documentadas del motor, evitar modificaciones no relacionadas y verificar el resultado. La version publicada incluye una unica skill, `godot-2d-display-adaptation` (v1.0.0), centrada en adaptar y verificar proyectos 2D de Godot 4.x ante distintos tamanos de pantalla, resoluciones, relaciones de aspecto y orientaciones.

Es relevante ahora porque el ecosistema de "agent skills" se esta consolidando como formato para dotar de procedimientos verificables a los agentes de codigo, y porque la skill original procede del proyecto Hermes Agent de Nous Research, adaptada y generalizada para no depender de un proyecto concreto. No se dispone de informacion sobre arquitectura de modelo, parametros ni contexto, ya que el artefacto no es un modelo de IA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es una coleccion de instrucciones y referencias para agentes) |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (depende del agente de IA que consuma las skills) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | no disponible (la documentacion publicada esta en ingles) |
| Licencia | no disponible a nivel de repositorio; la licencia se gestiona por skill individual y la skill original conserva atribucion y licencia MIT |
| Formato de pesos | no disponible (no hay pesos; el contenido son ficheros Markdown: `SKILL.md`, `README.md`, `LICENSE` y `references/godot-display.md`) |

## Arquitectura y entrenamiento

No aplica en el sentido habitual: no hay transformer, MoE ni SSM, ni proceso de entrenamiento con tokens, RLHF o DPO. La "arquitectura" del artefacto es una estructura de directorios por skill, donde cada skill contiene un `SKILL.md` con el flujo de trabajo, un `README.md`, una `LICENSE` propia y un directorio `references/` con documentacion tecnica de apoyo (en la skill publicada, `references/godot-display.md`).

La innovacion tecnica, en terminos de ingenieria de agentes, es el diseno del procedimiento: la skill exige inspeccionar el proyecto antes de recomendar cambios, cubre configuracion de viewport, modos de stretch, camaras, `SubViewport`, `CanvasLayer` y nodos `Control`, y anade verificacion de display. Procede de la skill `godot-2d-aspect-adaptation` del proyecto Hermes Agent de Nous Research; en esta adaptacion se reviso y generalizo el flujo, se eliminaron supuestos y ejemplos especificos de un proyecto y se anadio guia general de configuracion de display.

## Capacidades

- Empaquetar flujos de trabajo reutilizables para agentes de IA que operan sobre proyectos Godot 4.x.
- Guiar la inspeccion previa del proyecto (escenas, viewport, camaras, nodos de UI) antes de proponer cambios.
- Cubrir configuracion de display 2D: viewport, modos de stretch, relaciones de aspecto, orientaciones, `SubViewport`, `CanvasLayer` y nodos `Control`.
- Incluir procedimientos de verificacion del resultado tras aplicar cambios de display.
- Preservar la arquitectura y el gameplay existentes y mantener los cambios reversibles, segun la filosofia declarada del repositorio.
- Reportar limitaciones de forma explicita en lugar de asumir verificaciones no realizadas.
- Servir como base extensible: el repositorio contempla anadir mas skills de Godot en el futuro.
- No incluye tool calling, function calling, vision, audio ni modo de razonamiento propios: esas capacidades dependen del agente de IA que consuma las skills.

## Casos de uso

- Adaptacion multiplataforma de un juego 2D: un agente cargado con `godot-2d-display-adaptation` inspecciona la configuracion de viewport y stretch del proyecto y propone ajustes para que la UI y el mundo 2D se comporten correctamente en movil, escritorio y web con distintas relaciones de aspecto.
- Migracion de orientacion vertical a horizontal: la skill guia al agente a revisar camaras, `CanvasLayer` y nodos `Control` antes de tocar nada, y a verificar el resultado en ambas orientaciones.
- Auditoria de proyectos Godot heredados: el agente recorre la configuracion de display existente y documenta incoherencias entre escenas, priorizando ajustes soportados y documentados por el motor.
- Estandarizacion de practicas en un equipo: el repositorio sirve como referencia interna para que distintos agentes de codigo apliquen el mismo procedimiento de adaptacion de display, reduciendo variabilidad entre sesiones.
- Integracion en un agente de codigo tipo Hermes Agent: la skill se carga como modulo de conocimiento del agente para tareas de Godot, con atribucion MIT preservada y sin acoplamiento a un proyecto concreto.
- Formacion y evaluacion de agentes: al incluir criterios de verificacion y limites, la skill es util para medir si un agente inspecciona antes de actuar y reporta honestamente lo que ha comprobado.
- Base para nuevas skills: el equipo puede clonar la estructura (`SKILL.md`, `README.md`, `LICENSE`, `references/`) para publicar skills de otras areas de Godot (fisica, animacion, exportacion).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El artefacto no es un modelo de IA y no se han facilitado metricas de eficacia de la skill (por ejemplo, tasa de exito en tareas de adaptacion de display).

## Requisitos de hardware

- No requiere VRAM ni GPU: el contenido son ficheros Markdown que se cargan en el contexto de un agente de IA.
- El coste real es el consumo de tokens del agente que incorpora las skills en su contexto; depende del modelo subyacente y no se ha publicado una estimacion.
- No cabe hablar de despliegue con vLLM, llama.cpp, Ollama o TGI para este artefacto; su consumo se hace mediante el sistema de skills del agente (por ejemplo, el de Hermes Agent).
- Latencia y throughput: no disponibles; dependen enteramente del agente y del modelo que lo alimenta.
- Requisito practico: acceso al proyecto Godot 4.x sobre el que se aplica la skill y capacidad del agente para leer y modificar ficheros del proyecto.

## Comparativa con modelos similares

| Artefacto | Tipo | Ambito | Licencia | Disponibilidad |
|---|---|---|---|---|
| Godot-Skills (2177-AI-LAB) | Coleccion de agent skills | Godot 4.x, display 2D | Por skill; original MIT | Hugging Face, 0 descargas, 0 likes |
| Hermes Agent (Nous Research) | Agente de codigo con skills | General, incluye `godot-2d-aspect-adaptation` | No disponible en la informacion proporcionada | GitHub (enlace en la model card) |
| Prompts ad hoc para agentes sobre Godot | Instrucciones sueltas | Variable | Variable | No estructurado ni verificable |

No se dispone de informacion sobre otros repositorios de skills especificos de Godot con los que comparar parametros, contexto o rendimiento.

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto, codigo ni imagenes por si mismo; su utilidad depende del agente que lo consuma.
- Solo hay una skill publicada (`godot-2d-display-adaptation`, v1.0.0); la cobertura de Godot es muy limitada y el resto de areas del motor no estan cubiertas.
- La licencia no esta declarada a nivel de repositorio; se gestiona por skill. Es imprescindible revisar el `LICENSE` de cada directorio antes de reutilizar o redistribuir, y mantener la atribucion a Nous Research y la licencia MIT de la skill original.
- El repositorio es un proyecto independiente y no cuenta con el aval oficial de Hermes Agent, Nous Research ni Godot.
- Riesgo de que el agente aplique cambios de display incorrectos si no sigue el procedimiento de inspeccion y verificacion; la propia skill lo advierte y exige verificar resultados y reportar limitaciones.
- No hay datos de benchmarks, adopcion ni validacion externa (0 descargas, 0 likes en el momento de la consulta), por lo que no puede recomendarse para produccion sin evaluacion propia.
- La documentacion esta en ingles; no se declaran idiomas soportados.
- Las fechas de creacion y actualizacion del repositorio (2026-11-12) son posteriores a la fecha habitual de referencia, lo que conviene verificar antes de citarlas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/2177-AI-LAB/Godot-Skills
- Proyecto Hermes Agent (Nous Research), origen de la skill: https://github.com/NousResearch/hermes-agent
- Skill original `godot-2d-aspect-adaptation`: incluida en el repositorio de Hermes Agent enlazado arriba
- Documentacion de Godot: no disponible en la informacion proporcionada
