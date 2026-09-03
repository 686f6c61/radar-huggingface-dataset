# Snapkitty/integrity-constraint-governance

## Resumen

El repositorio `Snapkitty/integrity-constraint-governance` implementa el protocolo ICP (Integrity Constraint Governance Protocol), un motor de gobernanza de restricciones de integridad diseñado para sistemas de IA, bio-ML y software en general. No se trata de un modelo de aprendizaje automático entrenado, sino de un componente de software que impone invariantes mediante dos paradigmas complementarios: una máquina de estados imperativa escrita en MUMPS y una capa declarativa basada en Answer Set Programming (ASP) con Clingo. El objetivo es garantizar que ninguna acción no autorizada, contradicha o sin evidencia pueda ejecutarse, estableciendo un flujo estricto desde la evidencia hasta la auditoría.

La solución la desarrolla Jessica L. Williams (alias SNAPKITTYWEST) y se publica bajo una triple licencia (BSL-1.1, AGPL-3.0 y MPL-2.0) que permite distintos usos según el escenario. Aunque el repositorio tiene cero descargas y cero likes en HuggingFace, su propuesta técnica es relevante para equipos que necesitan trazar decisiones en sistemas críticos donde la confianza y la procedencia son innegociables. La arquitectura se compone de tres ficheros principales: `ICP-DAG.m` (grafo dirigido acíclico en MUMPS), `ICP-DAG.lp` (restricciones declarativas en ASP) y `ICP-GOV.m` (motor de gobernanza completo con actores, procedencia y sellado).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Grafo dirigido acíclico (DAG) + Answer Set Programming (ASP) con Clingo |
| Parametros totales | No aplica (no es un modelo de red neuronal) |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | No disponible (interfaz en ingles en los ficheros fuente) |
| Licencia | Triple: BSL-1.1 + AGPL-3.0 + MPL-2.0 (segun README; la ficha de HuggingFace indica "no disponible") |
| Formato de pesos | No aplica (codigo fuente en MUMPS y ASP) |

## Arquitectura y entrenamiento

El sistema se organiza en dos capas que refuerzan los mismos invariantes desde paradigmas distintos. La capa DAG (`ICP-DAG.m`) implementa una máquina de estados imperativa que opera sobre el global `^ICP` de MUMPS, gestionando nodos y aristas con reglas estrictas (dos extremos existentes, sin auto-aristas). La capa de restricciones declarativas (`ICP-DAG.lp`) utiliza Clingo para realizar comprobaciones SAT/UNSAT: si el programa ASP devuelve UNSAT, se detiene la ejecución (invariante 10). Sobre estas dos capas, el motor de gobernanza `ICP-GOV.m` añade actores con identidad y ámbito, procedencia de todas las afirmaciones, derivación evidencia-afirmación, control de autoridad, sellado de decisiones, revocación auditable y un mecanismo de parada de emergencia.

No existe un proceso de entrenamiento en el sentido de ML; el sistema se configura mediante reglas y políticas. El flujo central es `EVIDENCIA -> CLAIM -> PRUEBA -> DECISION -> AUTORIZACION -> EJECUCION -> AUDITORIA`, donde el rechazo es el comportamiento por defecto. Cada nodo debe ganarse su posición mediante evidencia y prueba. La innovación técnica radica en la combinación de un lenguaje imperativo (MUMPS) con un razonador declarativo (ASP), lo que permite verificar formalmente la consistencia del grafo y propagar cualquier fallo de restricción a un fallo de gobernanza.

## Capacidades

- Verificacion formal de invariantes mediante Answer Set Programming (Clingo), con resultado SAT/UNSAT.
- Gestion de actores con identidad registrada y ambito tipado.
- Trazabilidad de procedencia: cada afirmacion (claim) lleva origen, ubicacion y hash.
- Derivacion de afirmaciones a partir de evidencia mediante reglas nombradas.
- Control de autoridad basado en identidad + ambito + estado.
- Sellado de decisiones inmutables y revocacion auditable.
- Parada de emergencia inmediata ante violaciones de gobernanza.
- Protocolo de anulacion (override) deshabilitado por defecto, con requisito de pista de auditoria.
- Integracion con sistemas externos via invocacion de rutinas MUMPS o ejecucion de scripts Clingo.

## Casos de uso

- Gobernanza de decisiones en sistemas de IA autonomos: el motor garantiza que ningun agente pueda ejecutar una accion sin una cadena de evidencia, prueba y autorizacion valida. Por ejemplo, en un sistema de recomendacion medica, cada diagnostico debe estar respaldado por datos verificables antes de aplicarse.
- Auditoria de modelos bio-ML: en pipelines de descubrimiento de farmacos, el protocolo registra la procedencia de cada dato de entrenamiento y cada inferencia, permitiendo reconstruir el razonamiento completo y detectar contradicciones.
- Control de acceso en infraestructura critica: actores con ambitos tipados pueden solicitar autorizaciones, pero el sistema rechaza por defecto cualquier solicitud sin evidencia suficiente. Esto previene escaladas de privilegios ocultas.
- Verificacion de politicas en software empresarial: las restricciones declarativas en ASP permiten comprobar si una configuracion viola politicas internas antes de desplegarla en produccion.
- Trazabilidad de decisiones en finanzas: el sellado y la revocacion auditable crean un registro inmutable de aprobaciones, util para cumplimiento normativo y auditorias externas.
- Sistemas de control de versiones con gobernanza: el DAG puede modelar dependencias entre commits o artefactos, y el motor impide fusionar cambios que contradigan restricciones previamente establecidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de rendimiento, latencia ni comparativas con otros sistemas de gobernanza.

## Requisitos de hardware

- No aplica en el sentido de VRAM o GPU: es un sistema de software que se ejecuta como procesos MUMPS y Clingo.
- Requiere un entorno MUMPS compatible (por ejemplo, GT.M o YottaDB) y una instalacion de Clingo (ASP solver).
- Los requisitos de memoria y CPU dependen del tamano del grafo y del numero de restricciones. Para grafos pequenos (miles de nodos), un servidor convencional con 4 GB de RAM es suficiente.
- No requiere aceleracion por GPU.
- Despliegue tipico: contenedor Docker con YottaDB y Clingo, o integracion en un pipeline existente via scripts de linea de comandos.

## Comparativa con modelos similares

No se dispone de informacion sobre sistemas equivalentes en el repositorio ni en la ficha de HuggingFace. No existen alternativas documentadas con las que comparar este protocolo.

## Limitaciones y advertencias

- No es un modelo de ML: no genera texto, codigo ni imagenes; es un motor de gobernanza y verificacion.
- La licencia es compleja: triple licencia (BSL-1.1, AGPL-3.0, MPL-2.0) con una tabla de usos (SaaS -> AGPL, enterprise -> BSL, modificaciones de fichero -> MPL). El uso comercial puede requerir una licencia separada si se busca evitar el copyleft.
- No se especifican los idiomas soportados en la interfaz; los ficheros fuente estan en ingles.
- El repositorio tiene cero descargas y cero likes, lo que sugiere que no ha sido validado por la comunidad.
- La fecha de creacion (2026-09-03) es futura respecto a la fecha actual, lo que puede indicar un error en los metadatos o una planificacion de publicacion.
- La dependencia de MUMPS y Clingo puede limitar la portabilidad a entornos sin estos componentes.
- El protocolo de anulacion (override) esta deshabilitado por defecto, pero si se activa, requiere una pista de auditoria completa; un fallo en esta pista podria comprometer la integridad del sistema.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Snapkitty/integrity-constraint-governance
- Fichero de licencia tri: se menciona `LICENSE.tri` en el README, pero no se proporciona URL directa.
- No se encontraron papers, blogs o demos adicionales en la informacion disponible.
