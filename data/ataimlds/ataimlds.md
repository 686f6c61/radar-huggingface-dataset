# ataimlds/ataimlds

## Resumen

AIMLDS no es un modelo de lenguaje, sino la página de presentación en Hugging Face de **2351485 ALBERTA INC.**, una empresa de inteligencia artificial con sede en Calgary (Alberta, Canadá) que opera bajo el nombre público AIMLDS. La model card describe una compañía gestionada en su día a día por un enjambre de agentes de IA denominado *Switchboard*, que construye y explota productos de IA y sistemas para agentes, exponiendo en la mayoría de los casos un servidor MCP, una API o ambos. La gestión cotidiana corresponde a *Wright* (Muse, de Meta), bajo la dirección del propietario de la empresa.

El repositorio no contiene pesos, tokenizador, configuración de arquitectura ni artefactos de inferencia. Los tags declarados (`aimlds`, `mcp`, `ai-agents`, `switchboard`) apuntan a un catálogo de productos y servicios: Conduit (mercado de conectores para agentes con pasarela alojada y MCP), codetopo (análisis de topología de código con API, CLI y MCP), LetsAskIt (producto de pregunta-respuesta con servidor MCP), Verdict (clasificador de fraudes con veredicto REAL / SUSPICIOUS / LIKELY SCAM), Sanity Check (revisión automatizada de arquitecturas), Research Analyst (análisis bursátil), DogEar (aplicación móvil de lectura con respuesta por voz y modelo local) y AxiomCode (métodos formales, en fase de vista previa).

Por tanto, esta ficha documenta un espacio de descubrimiento comercial, no un modelo evaluable. No hay parámetros, contexto, cuantizaciones ni benchmarks que analizar; cualquier evaluación técnica de inferencia resulta imposible con la información disponible. Su relevancia actual es la de un punto de entrada al ecosistema MCP de la compañía, con servidores registrados en el registro oficial de MCP bajo los nombres de cada producto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio no contiene un modelo) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | bsd-3-clause-clear |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se describe ninguna arquitectura de red neuronal, conjunto de datos de entrenamiento, número de tokens, proceso de alineación (RLHF, DPO) ni innovación técnica de inferencia en la información proporcionada. El contenido del repositorio es una model card descriptiva de la empresa y de su catálogo de productos, sin artefactos de modelo asociados.

La única referencia arquitectónica es organizativa: un sistema multiagente llamado *Switchboard* que opera la compañía y que produce servicios orientados a agentes mediante el protocolo MCP (Model Context Protocol). No se detallan la composición del enjambre, los modelos subyacentes empleados —salvo la mención de Muse, de Meta, para la gestión diaria— ni los mecanismos de orquestación.

## Capacidades

- No aplica: el repositorio no publica un modelo con capacidades de generación, razonamiento, código, matemáticas o visión.
- El ecosistema descrito expone servidores MCP para consumo por parte de agentes: Conduit, codetopo, LetsAskIt, Sanity Check, Research Analyst y el gate MCP de AxiomCode (en vista previa).
- Conduit ofrece compraventa de conectores por parte de agentes dentro de políticas de gasto definidas por el propietario, con presupuestos, límites y traza de auditoría; el primer conector es financiero (SEC EDGAR y fundamentales).
- codetopo proporciona análisis de topología de código: grafo de imports, llamadas y dependencias, ranking por radio de impacto, PageRank, betweenness y otras medidas de centralidad, orden topológico con reporte de ciclos y detección de comunidades.
- Verdict clasifica elementos sospechosos (mensajes, correos, anuncios, ofertas de empleo, propuestas de inversión, enlaces) en tres categorías con explicación de cada comprobación.
- DogEar ejecuta el modelo en local en el dispositivo móvil, con API en la nube opcional y nunca obligatoria.
- No se especifican capacidades multilingües, de tool calling genérico ni de razonamiento multi-paso más allá de lo que implican los productos descritos.

## Casos de uso

- Integración de agentes con datos financieros: mediante el conector SEC EDGAR de Conduit, un agente puede consultar presentaciones regulatorias y fundamentales de compañías cotizadas dentro de los límites de gasto fijados por su propietario, con auditoría de cada operación.
- Análisis de impacto de cambios en un repositorio: codetopo permite calcular el radio de impacto de una modificación antes de fusionar una pull request, ordenar dependencias topológicamente y detectar ciclos, lo que encaja en pipelines de revisión de código.
- Detección de fraudes en atención al usuario: Verdict puede clasificar correos, ofertas de empleo o enlaces sospechosos y devolver un veredicto con las comprobaciones explicadas en lenguaje llano, útil para equipos de soporte o para usuarios finales.
- Revisión automatizada de arquitecturas: Sanity Check ofrece una evaluación de la arquitectura de un sistema con servidor MCP, adecuada para auditorías previas a un despliegue.
- Análisis bursátil asistido: Research Analyst proporciona análisis de acciones con niveles de pago, sin constituir asesoramiento financiero, para integración en flujos de investigación.
- Lectura asistida por voz en movilidad: DogEar ejecuta el modelo en el dispositivo para conversar sobre un documento cargado, sin dependencia obligatoria de la nube, lo que resulta adecuado en contextos de privacidad o conectividad limitada.
- Descubrimiento e integración de herramientas para agentes: los servidores MCP listados en el registro oficial permiten a un agente localizar y conectar productos de terceros sin integración manual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No aplica para inferencia de un modelo: el repositorio no contiene pesos ni artefactos ejecutables.
- Los productos se consumen como servicios alojados (API y MCP) en la infraestructura de la compañía, por lo que el requisito de hardware del cliente se reduce a conectividad de red.
- DogEar ejecuta el modelo en el dispositivo móvil del usuario; no se especifican requisitos de memoria, chip o sistema operativo.
- No se dispone de datos de latencia ni de throughput.
- No se indican opciones de despliegue local (vLLM, llama.cpp, Ollama, TGI) porque no hay modelo que desplegar.

## Comparativa con modelos similares

No disponible: al no tratarse de un modelo de lenguaje, no existe una categoría de modelos comparables en parámetros, contexto o rendimiento. Como referencia de ecosistema, los servidores MCP de la compañía compiten con otros catálogos de herramientas para agentes, pero no se dispone de datos cuantitativos para establecer una comparación.

## Limitaciones y advertencias

- El repositorio no contiene un modelo: no puede descargarse, ejecutarse ni evaluarse localmente.
- La model card es material promocional de la empresa; las afirmaciones sobre productos no están respaldadas por artefactos técnicos verificables en el repositorio.
- No se documentan sesgos, tasas de alucinación ni limitaciones idiomáticas porque no hay modelo que analizar.
- La licencia `bsd-3-clause-clear` se declara a nivel de repositorio, pero no se aclara qué cubre exactamente (¿la model card, los productos, el código de los servidores MCP?) ni las condiciones de uso comercial de los servicios alojados, que se rigen por los términos de los sitios propios de cada producto.
- Varios productos están en fases distintas de disponibilidad: AxiomCode figura como vista previa y su gate MCP está en periodo de estabilización, sin fecha de lanzamiento público.
- Las claves, la facturación y el uso en producción se gestionan fuera de Hugging Face, en los sitios de cada producto, lo que introduce dependencia de servicios externos.
- El repositorio registra cero descargas y cero likes, sin señales de adopción ni de validación por parte de la comunidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ataimlds/ataimlds
- Sitio web de la empresa: https://aimlds.org
- Verdict: https://verdict.aimlds.org
- Contacto: info@aimlds.org
- Registro oficial de MCP (servidores listados bajo el nombre de cada producto): no disponible en la información proporcionada
- Papers, blogs, repositorios de código y demos adicionales: no disponibles en la información proporcionada
