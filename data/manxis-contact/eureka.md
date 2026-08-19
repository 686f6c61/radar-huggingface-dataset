# manxis-contact/Eureka

## Resumen

Eureka es un sistema de orquestación de meta-agentes condicionados por tarea, diseñado para el descubrimiento científico de horizonte largo. Lo desarrolla ManXis, un equipo de investigación que incluye a Alizer Wong como autor principal, junto con colaboradores de varias universidades chinas y extranjeras. No se trata de un modelo de lenguaje de gran escala con pesos neuronales, sino de un runtime de software que coordina agentes especializados (teoría, matemáticas, meta-agente) para planificar, ejecutar y verificar hipótesis científicas de forma autónoma.

El repositorio público contiene la implementación del runtime de orquestación, los componentes de agentes especializados, los esquemas de datos y utilidades de reproducibilidad. Se presenta como una sub-arquitectura de investigación del sistema productivo Tanglang. La versión pública usa solo la biblioteca estándar de Python, lo que facilita su ejecución en cualquier entorno. La relevancia actual radica en su enfoque de auto-evolución gobernada y orquestación dinámica de obligaciones, un área emergente en sistemas multiagente para ciencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sistema de meta-agentes (orquestación dinámica, agentes especializados: teoría, matemáticas) |
| Parametros totales | No aplica (no es un modelo neuronal) |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | No disponible (el código y la documentación están en inglés) |
| Licencia | No disponible |
| Formato de pesos | No aplica (código fuente Python) |

## Arquitectura y entrenamiento

Eureka no es un modelo entrenado con datos; es una arquitectura de software compuesta por varios módulos interconectados. El núcleo es un **meta-agente** que gestiona obligaciones dinámicas mediante planificación de horizonte recedente, control por eventos y backpressure de frontera lista. Incluye mecanismos de promoción de arquitectura basados en densidad de dependencias, recurrencia de operadores y coste de ejecución amortizado. La auto-evolución está gobernada por diagnósticos, admisión con coste, contratos inmutables y rollback.

Los agentes especializados incluyen un **agente de descubrimiento de teorías** (búsqueda de hipótesis, presión de contraejemplos, auditoría de supuestos, memoria estructurada y escaleras de verificación) y un **agente matemático** (runtime de conjeturas abiertas, representación intermedia de hechos/afirmaciones/pruebas, primitivas estructurales exactas, minería incremental y enrutamiento a verificadores). El sistema compila un runtime científico con reconstrucciones locales por dependencias, reutilización certificada, paginación de contexto y fusión de leases aislados.

No se menciona entrenamiento en el sentido clásico; el sistema se ejecuta mediante políticas y reglas deterministas, con tests unitarios que validan los componentes públicos.

## Capacidades

- Orquestación dinámica de tareas de larga duración con planificación de horizonte recedente y control por eventos.
- Formación de macro-agentes condicionados por tarea, con promoción automática de arquitecturas según métricas de estado compartido, densidad de dependencias, recurrencia y continuidad.
- Auto-evolución gobernada: el sistema puede modificar su propia arquitectura dentro de límites acotados, con diagnóstico, admisión por coste, contratos inmutables y rollback.
- Descubrimiento de teorías: búsqueda de hipótesis, generación de contraejemplos, auditoría de supuestos y verificación incremental con memoria estructurada.
- Razonamiento matemático sobre conjeturas abiertas: ingestión de fuentes primarias, representación intermedia tipada (hechos, afirmaciones, pruebas), primitivas estructurales exactas y enrutamiento a verificadores.
- Compilación de runtime científico con reutilización de certificados y paginación de contexto para manejar dependencias complejas.

## Casos de uso

- **Descubrimiento de teoremas matemáticos**: el agente matemático puede explorar conjeturas abiertas, ingerir literatura primaria y generar candidatos a prueba con verificación automática. Adecuado para problemas donde la búsqueda es combinatoria y requiere seguimiento de dependencias.
- **Auditoría de supuestos en teorías científicas**: el agente de teoría puede auditar supuestos implícitos en modelos formales, generando contraejemplos para identificar fallos. Útil en física teórica o economía formal.
- **Planificación de experimentos de larga duración**: el meta-agente puede orquestar múltiples experimentos simulados, gestionando dependencias entre pasos y reasignando recursos según el progreso. Apropiado para pipelines de simulación complejos.
- **Verificación incremental de pruebas formales**: el sistema puede dividir una demostración larga en sub-objetivos, verificar cada uno con herramientas externas y reutilizar certificados de pasos ya probados. Reduce coste computacional en pruebas grandes.
- **Síntesis de literatura científica**: al ingerir fuentes primarias y estructurarlas en un IR tipado, puede ayudar a mapear el estado del arte y detectar lagunas en la investigación. Útil para revisiones sistemáticas.
- **Autoevolución de pipelines de análisis de datos**: el sistema puede modificar su propia arquitectura de procesamiento si detecta cuellos de botella, siempre dentro de contratos inmutables, lo que permite adaptarse a nuevos tipos de datos sin intervención manual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio incluye tests unitarios deterministas, pero no hay métricas de rendimiento comparativas con otros sistemas.

## Requisitos de hardware

- El core runtime usa solo la biblioteca estándar de Python, por lo que puede ejecutarse en cualquier CPU con Python 3.8 o superior.
- No requiere GPU para el runtime básico; los agentes especializados pueden invocar verificadores externos que sí podrían necesitar hardware específico.
- Para tareas de descubrimiento a gran escala, se recomienda un servidor con múltiples núcleos y RAM abundante (32 GB o más) para manejar la paginación de contexto y la fusión de leases.
- Opciones de despliegue: ejecución directa con `pytest` para tests, o integración como módulo Python en pipelines científicos. No hay soporte nativo para vLLM, Ollama o TGI, ya que no es un modelo de lenguaje.

## Comparativa con modelos similares

No disponible. Eureka no es un modelo de lenguaje ni un sistema de agentes comparable a otros proyectos de código abierto conocidos en la información proporcionada. Su enfoque en orquestación científica con auto-evolución es específico y no hay alternativas directas documentadas.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no puede generar texto libre, responder preguntas ni procesar lenguaje natural. Solo opera sobre estructuras formales y políticas programáticas.
- El repositorio público es una implementación de referencia alineada con el paper; puede no incluir todas las optimizaciones del sistema productivo Tanglang.
- La licencia no está especificada, lo que impide conocer las restricciones de uso comercial o modificación.
- No hay documentación sobre el rendimiento en problemas reales; los tests unitarios solo validan componentes aislados.
- El sistema depende de verificadores externos para tareas matemáticas; su disponibilidad y fiabilidad no está garantizada.
- La auto-evolución gobernada, aunque acotada, podría introducir comportamientos inesperados si los contratos inmutables no se definen correctamente; se recomienda supervisión humana en entornos de producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/manxis-contact/Eureka
- Repositorio GitHub: https://github.com/manxis-contact/Eureka
- Paper: *Eureka: Task-Conditioned Meta-Agent Orchestration for Scientific Discovery* (referenciado en la model card, sin enlace directo)
