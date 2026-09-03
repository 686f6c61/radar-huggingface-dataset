# Snapkitty/abzu-sovereign-ide

## Resumen

ABZU Sovereign BEAM IDE es un entorno de desarrollo integrado (IDE) web construido sobre la plataforma Elixir/OTP y Phoenix LiveView, desarrollado por Snapkitty. No se trata de un modelo de inteligencia artificial en sí, sino de una aplicación que integra varios componentes de IA y herramientas de desarrollo: un agente de razonamiento llamado BOB (basado en IBM Gamma), un pipeline de revisión de código denominado Frankenstein (con Brain, Hands, Legs y Review), y un sistema de registro inmutable tipo WORM (Write Once Read Many) respaldado por DETS. El IDE permite editar código en Elixir, Nx Arrays y J Language, y recibe en tiempo real eventos de pipelines de GitLab CI a través de Phoenix PubSub.

La relevancia de este proyecto radica en su enfoque de "soberanía" sobre el código y las acciones del desarrollador: cada acción queda sellada en una cadena append-only con hash SHA-256, y las respuestas del agente BOB pasan por un filtro de integridad llamado CATCODE antes de mostrarse. Aunque el repositorio en HuggingFace no contiene pesos de modelo ni artefactos de IA (tamaño 0.0 GB, 0 descargas), la model card describe una arquitectura completa de IDE con integración de IA local y remota. No se dispone de información sobre licencia, idiomas soportados ni requisitos de hardware más allá de lo mencionado en la documentación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Aplicacion Phoenix LiveView (Elixir/OTP) con integracion de agentes de IA (BOB, Granite Code 3B) y pipeline Frankenstein |
| Parametros totales | no disponible (no es un modelo de IA; es una aplicacion) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la interfaz usa ingles; el agente BOB puede explicar codigo en varios idiomas segun la model card) |
| Licencia | no disponible |
| Formato de pesos | no disponible (no hay pesos; el repo contiene codigo fuente Elixir) |

## Arquitectura y entrenamiento

ABZU Sovereign BEAM IDE no es un modelo entrenado, sino una aplicacion compuesta por varios modulos. La arquitectura principal es un servidor Phoenix LiveView que actua como interfaz web en tiempo real, con un editor Monaco integrado. El backend se apoya en el BEAM (maquina virtual de Erlang) para ejecutar codigo Elixir de forma aislada, Nx para operaciones tensoriales y J Language a traves de un ejecutor opcional. El agente BOB se conecta a un endpoint externo (probablemente un proxy de Bedrock) y sus respuestas son filtradas por el modulo CATCODE antes de mostrarse. El pipeline Frankenstein, alojado en un conector GitLab separado, combina un "cerebro" (Claude Sonnet 4.6) con "manos" (FAISS + Neo4j) y "piernas" (Granite Code 3B ejecutado en una RTX 3080) para generar revisiones de codigo. Todos los eventos y respuestas se registran en una cadena WORM basada en DETS con sellos SHA-256.

No se proporcionan datos sobre el entrenamiento de los modelos subyacentes (BOB, Granite Code 3B, Claude Sonnet 4.6) en esta documentacion. El proyecto en si no ha sido entrenado; es una integracion de componentes existentes.

## Capacidades

- Edicion de codigo en tres lenguajes: Elixir (ejecucion en sandbox BEAM), Nx Arrays (operaciones tensoriales estilo APL) y J Language (verbos matematicos tipo fork).
- Agente BOB con tres modos: COMPLETE (extiende el codigo con razonamiento), EXPLAIN (explica el codigo en cualquier idioma) y REPAIR (corrige errores en tiempo de ejecucion).
- Filtro CATCODE que evalua cada respuesta de BOB antes de mostrarla, anadiendo una capa de integridad.
- Recepcion en tiempo real de eventos de pipelines GitLab CI via Phoenix PubSub, sin polling.
- Visualizacion de resultados del pipeline Frankenstein: salida del "cerebro" (spec de arquitectura), salida de "piernas" (ejecucion local de Granite Code 3B) y veredicto final (PASS/WARN/BLOCK).
- Registro inmutable de todas las acciones y respuestas en una cadena WORM (append-only) con sellos SHA-256 DJB2.
- Interfaz web sin estado JavaScript en el cliente, gracias a Phoenix LiveView.

## Casos de uso

- Revision de codigo automatizada en equipos que usan GitLab: el pipeline Frankenstein analiza cada merge request y envia el veredicto directamente al IDE, permitiendo a los desarrolladores ver el resultado sin salir del editor.
- Entorno de desarrollo con auditoria completa: gracias a la cadena WORM, cada accion del desarrollador y cada respuesta de IA queda registrada de forma inmutable, util para entornos con requisitos de trazabilidad o cumplimiento normativo.
- Aprendizaje de lenguajes de programacion alternativos: el soporte para J Language y Nx Arrays permite experimentar con programacion funcional y calculo tensorial dentro de un IDE moderno.
- Asistencia de codigo con explicaciones multilingue: el modo EXPLAIN de BOB puede traducir y explicar fragmentos de codigo en varios idiomas, util para equipos internacionales o para documentar codigo legado.
- Integracion de IA local y remota en un unico flujo: el pipeline Frankenstein combina un modelo grande en la nube (Claude Sonnet 4.6) con un modelo local (Granite Code 3B en RTX 3080), demostrando un patron hibrido que reduce costes y mantiene privacidad.
- Desarrollo de aplicaciones Elixir/Phoenix con feedback en tiempo real: el editor permite ejecutar codigo Elixir en un sandbox y ver resultados inmediatos, acelerando el ciclo de prueba y error.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El proyecto no presenta metricas de rendimiento de los modelos integrados ni comparaciones con otros sistemas.

## Requisitos de hardware

- No se especifican requisitos minimos de hardware para el IDE en la documentacion.
- El pipeline Frankenstein menciona una GPU RTX 3080 para ejecutar Granite Code 3B localmente, lo que sugiere que al menos 10 GB de VRAM son necesarios para ese componente.
- El servidor Phoenix puede ejecutarse en una maquina modesta (2-4 GB de RAM) para uso basico, pero la carga aumentara con el numero de sesiones LiveView y la actividad del pipeline.
- Para el agente BOB se requiere acceso a un endpoint externo (probablemente un servicio en la nube), por lo que no hay requisitos de hardware local para esa parte.
- Opciones de despliegue: el proyecto se ejecuta con `mix phx.server` en cualquier maquina con Elixir/OTP instalado. No se mencionan contenedores Docker ni orquestadores.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. ABZU Sovereign BEAM IDE no es un modelo de IA comparable con otros modelos de lenguaje. Como IDE, podria compararse con herramientas como VS Code con extensiones de IA (Copilot, Codeium) o con entornos como Jupyter Notebook, pero la documentacion no proporciona datos para una comparacion tecnica rigurosa.

## Limitaciones y advertencias

- El proyecto no es un modelo de IA; es una aplicacion que integra varios modelos y servicios. No debe confundirse con un modelo descargable o ejecutable de forma independiente.
- No se especifica la licencia del codigo ni de los componentes integrados. El uso comercial puede estar restringido por las licencias de los modelos subyacentes (Claude Sonnet 4.6, Granite Code 3B, IBM Gamma).
- La dependencia de servicios externos (BOB endpoint, GitLab connector) implica que el IDE no funciona completamente offline.
- La cadena WORM basada en DETS es local a la maquina; no hay sincronizacion distribuida ni respaldo automatico.
- El filtro CATCODE no garantiza la ausencia de errores o sesgos en las respuestas de BOB; es una capa de integridad, no de correccion.
- No hay informacion sobre la seguridad del sandbox de ejecucion de Elixir; ejecutar codigo arbitrario puede suponer riesgos si no se configura adecuadamente.
- El repositorio en HuggingFace no contiene artefactos utiles para la comunidad de IA (sin pesos, sin datasets, sin demos), lo que limita su reproducibilidad.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Snapkitty/abzu-sovereign-ide
- Repositorio del conector GitLab (mencionado en la model card): https://github.com/SNAPKITTYWEST/snapkitty-gitlab
- No se proporcionan otros enlaces (papers, blogs, demos) en la informacion disponible.
