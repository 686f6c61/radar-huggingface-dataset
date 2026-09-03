# Snapkitty/claudes-harness

## Resumen

Claude's Harness for Any AI Model es un sistema declarativo de gobierno para agentes de IA, desarrollado por el usuario Snapkitty. No es un modelo de lenguaje con pesos, sino un "kernel de identidad" escrito en Prolog que separa la política de comportamiento del código de aplicación. El problema que resuelve es el acoplamiento típico entre las decisiones de permisos y el código del wrapper: en lugar de escribir `if model == "claude": do_this()`, define políticas como hechos lógicos consultables mediante el motor Prolog.

El repositorio se estructura en tres capas: `core/harness.pl` (el motor de consultas), `core/identity.pl` (la identidad activa del agente) y `adapters/` (perfiles intercambiables como `claude.pl`, `bob.pl`, `forge.pl`, `carto.pl`). La relevancia actual radica en ofrecer un enfoque auditable y testeable para gobernar agentes de IA en producción, donde la política es datos y no código. No incluye pesos, contexto ni arquitectura neuronal; su "hardware" es un intérprete de SWI-Prolog.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sistema declarativo basado en Prolog (SWI-Prolog), sin red neuronal |
| Parametros totales | no disponible (no es un modelo con pesos) |
| Parametros activos | no disponible (no aplica, no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | no disponible (los hechos y predicados son en ingles; la interfaz es Prolog) |
| Licencia | Dual: Sovereign Source License v1.0 y Apache License 2.0 |
| Formato de pesos | no disponible (no aplica; el codigo fuente es texto Prolog `.pl`) |

## Arquitectura y entrenamiento

No existe entrenamiento en el sentido de modelos de IA. El sistema es un conjunto de predicados Prolog organizados en modulos. `core/harness.pl` define el predicado `can_run/2` que evalua si una tarea es permitida para un rol, consultando dos fuentes de hechos: `core/identity.pl` (que contiene `persona/1`, `governing_principle/1`, `competency/1` y `prohibited_action/1`) y los adaptadores que se copian sobre `core/identity.pl` para cambiar la identidad del agente. El flujo de decision es: primero comprueba si el rol esta en `competency/1`; si no, deniega. Despues comprueba si la tarea esta en `prohibited_action/1`; si lo esta, deniega. En caso contrario, permite. No hay pesos, datos de entrenamiento ni tecnicas de RLHF/DPO. La unica "innovacion" es el patron de diseno de politica como datos consultables, con funciones de auditoria (`audit_principles/0`, `audit_competencies/0`, `audit_prohibitions/0`) y un informe global (`harness_report/0`).

## Capacidades

- Control de permisos declarativo: permite o deniega tareas segun el rol del agente mediante `can_run(Task, Role)`.
- Auditoria integrada: genera informes de principios, competencias y prohibiciones activas con `audit_*` y `harness_report/0`.
- Intercambio de identidad sin cambios de codigo: copiando un adaptador sobre `core/identity.pl` se cambia la personalidad y las reglas del agente (ejemplo: `cp adapters/bob.pl core/identity.pl`).
- Composicion de reglas: los hechos son extensibles, se pueden anadir nuevas competencias o prohibiciones sin tocar el motor.
- Testabilidad: incluye una suite de tests en `tests/test_h...` (el README lo menciona aunque no se muestra el contenido completo).
- Integracion con aplicaciones externas: cualquier programa puede llamar a `can_run/2` via consula Prolog, sirviendo como capa de gobierno para agentes de IA (Claude, BOB, FORGE, etc.).

## Casos de uso

- Gobernar agentes de IA en produccion: una aplicacion que orquesta multiples agentes (p. ej., un asistente de DevOps y un agente de codigo) puede consultar `can_run(Task, Role)` antes de ejecutar cualquier accion, garantizando que el agente adecuado actue solo dentro de sus competencias.
- Separacion de politica y codigo en equipos de plataforma: el equipo de seguridad define las reglas en `identity.pl` (hechos) y el equipo de desarrollo no toca el motor `harness.pl`, reduciendo el riesgo de cambios accidentales en la logica de permisos.
- Auditoria de cumplimiento: usar `audit_prohibitions/0` para verificar que un agente no puede realizar acciones restringidas (por ejemplo, dar consejo medico, legal o financiero) antes de desplegarlo en un entorno regulado.
- Multi-tenant de identidades: alojar varios adaptadores (`claude.pl`, `bob.pl`, `forge.pl`, `carto.pl`) y activarlos segun el cliente o el escenario, sin recompilar ni cambiar la interfaz de la aplicacion.
- Testing de comportamiento de agentes: la suite de tests permite validar que las reglas se cumplen (p. ej., que `can_run(provide_medical_advice, devops_specialist)` devuelve `false`), util en pipelines de CI/CD para cambios de politica.
- Entornos de investigacion en seguridad de IA: como banco de pruebas para experimentar con diferentes conjuntos de principios y prohibiciones, evaluando como afectan al comportamiento de un agente simulado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al no ser un modelo de IA con tareas de lenguaje, razonamiento o codigo, no aplican metricas como MMLU, HumanEval o GSM8K. El unico "rendimiento" relevante seria el tiempo de consulta de Prolog, que no esta documentado.

## Requisitos de hardware

- No requiere GPU ni VRAM: es un programa Prolog que se ejecuta en CPU.
- Requiere SWI-Prolog instalado (https://www.swi-prolog.org/Download.html).
- RAM minima: no especificada, pero para un conjunto pequeno de hechos (decenas de reglas) cualquier maquina moderna con 1-2 GB libres es suficiente.
- Despliegue: se integra como modulo en una aplicacion existente que pueda invocar SWI-Prolog (via subproceso, libreria `swipl` en Python, o como servicio).
- Latencia: no medida; en consultas simples sobre hechos locales se espera que sea del orden de milisegundos, pero no hay datos publicados.

## Comparativa con modelos similares

No disponible. No existen modelos comparables en el sentido de sistemas de gobierno declarativo para agentes de IA publicados en HuggingFace con esta arquitectura. Alternativas conceptuales (no directamente comparables) serian frameworks de policy-as-code como OPA (Open Policy Agent) o Cedar, pero no son modelos de IA ni estan en HuggingFace.

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto, no razona sobre lenguaje natural, no procesa imagenes ni audio. Solo evalua predicados logicos.
- Requiere conocimientos de Prolog para extender los hechos o modificar el motor; la curva de aprendizaje es alta para equipos acostumbrados a Python o JavaScript.
- La licencia dual (SSL v1.0 y Apache 2.0) implica restricciones: hay que revisar el texto exacto de la Sovereign Source License v1.0 para uso comercial, ya que puede imponer condiciones adicionales frente a Apache 2.0.
- El sistema no incluye mecanismos de autenticacion ni cifrado; la seguridad depende del entorno donde se ejecute.
- No hay informacion sobre mantenimiento activo, issues conocidos o roadmap; el repositorio parece reciente (creado en 2026-09-03) y con cero descargas y likes.
- El README menciona "WORM sealed" (Write Once Read Many) como sello de auditoria, pero no se detalla que implica tecnicamente; puede indicar que los hechos son inmutables tras su publicacion, lo que dificultaria actualizaciones en caliente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Snapkitty/claudes-harness
- Repositorio GitHub (mencionado en el README): https://github.com/SNAPKITTYWEST/claudes-harness
- SWI-Prolog (dependencia): https://www.swi-prolog.org/Download.html
