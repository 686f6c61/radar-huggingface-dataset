# ghostai1/WardenPEN

## Resumen

WardenPEN es un repositorio alojado en Hugging Face por el usuario ghostai1 que, segun su model card, corresponde a ARTEX Research Lab, una continuacion de investigacion del framework original ARTEX de pentesting multiagente. No se trata de un modelo de lenguaje con pesos publicados, sino de un proyecto de plataforma de seguridad ofensiva autonoma que combina un backend en Go, un frontend en Next.js, base de datos PostgreSQL y una arquitectura de agentes planificador-trabajador. El repositorio tiene un tamano de 0.0 GB y cero descargas, lo que indica que no contiene artefactos de modelo descargables.

El proyecto se presenta como un entorno de investigacion para validacion adversarial controlada, orquestacion de agentes autonomos y generacion de informes basados en evidencia. La model card describe una demostracion interactiva alojada como Hugging Face Space estatico, con resultados sinteticos y sin ejecucion real de pruebas de penetracion. Es relevante ahora por el interes creciente en agentes autonomos aplicados a ciberseguridad, aunque la ausencia de pesos, benchmarks y documentacion tecnica verificable limita seriamente su evaluacion como modelo.

La ficha se elabora unicamente a partir de la informacion disponible en el repositorio y su model card. Cualquier dato no presente en dicha informacion se indica explicitamente como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (el repositorio describe una plataforma multiagente con backend Go y frontend Next.js; no se especifica arquitectura de modelo neuronal) |
| Parametros totales | No disponible |
| Parametros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | AGPL-3.0 |
| Formato de pesos | No disponible (el repositorio tiene 0.0 GB; no contiene safetensors, GGUF ni otros artefactos de pesos) |

## Arquitectura y entrenamiento

La informacion disponible no describe un modelo neuronal entrenado. La model card detalla la arquitectura de una plataforma de software: backend en Go, frontend en Next.js/React, base de datos PostgreSQL, SDK de agentes denominado Norma, comunicacion mediante REST API y SSE, autenticacion JWT, visualizacion con AntV G6 y React Flow, y contenedorizacion con Docker Compose. La orquestacion se basa en un planificador y varios trabajadores concurrentes, con una frontera de autorizacion entre los agentes y el laboratorio controlado.

El diseno separa el conocimiento del entorno (Asset Graph) de los objetivos de investigacion y la evidencia (Exploration Graph), con dos grafos interconectados. No se proporcionan datos sobre entrenamiento, numero de tokens, composicion del dataset, tecnicas de alineacion como RLHF o DPO, ni innovaciones de inferencia como decodificacion especulativa o atencion lineal. La model card indica que la arquitectura es independiente del modelo, pero no identifica ningun modelo concreto subyacente.

## Capacidades

- Orquestacion multiagente con arquitectura planificador-trabajador y coordinacion concurrente de agentes.
- Gestion de objetivos de investigacion estructurados y conocimiento compartido del entorno.
- Inspeccion de actividad de agentes y trazabilidad de sesiones.
- Gestion de alcance, controles de autorizacion, mecanismos de aprobacion humana y presupuestos de recursos.
- Fronteras para salidas no confiables y registros de auditoria operativa.
- Generacion de informes estructurados en JSON e integracion con plantillas PHP.
- Visualizacion mediante grafos de exploracion y cobertura de activos.
- Demostracion interactiva con entornos de laboratorio sinteticos (Atlas Operations, Meridian Records, Vector Access).
- No se documentan capacidades de generacion de texto, razonamiento general, codigo, matematicas, vision, audio ni tool calling en el sentido de un modelo de lenguaje.

## Casos de uso

- Validacion adversarial controlada en laboratorio: la plataforma permite ejecutar evaluaciones de seguridad contra entornos sinteticos con fronteras de autorizacion, adecuada para investigacion reproducible sin tocar sistemas reales.
- Formacion y concienciacion en seguridad ofensiva: los entornos Atlas Operations, Meridian Records y Vector Access sirven para practicar flujos de autorizacion y gobierno de capacidades en un entorno aislado.
- Investigacion sobre comportamiento de agentes autonomos: el planificador y los trabajadores concurrentes permiten estudiar coordinacion, presupuestos de recursos y limites de aprobacion humana.
- Auditoria y trazabilidad de evaluaciones: el almacen de evidencia y los registros de actividad facilitan reconstruir decisiones y verificar resultados en informes estructurados.
- Integracion de informes de seguridad: la exportacion JSON y las plantillas PHP permiten incorporar resultados a pipelines de reporte existentes.
- Desarrollo de herramientas de gobierno de seguridad: los controles de alcance, autorizacion y aprobacion humana sirven como base para construir capas de governance en plataformas de pentesting autonomo.
- Despliegue autoalojado en Docker: la contenedorizacion con Docker Compose facilita levantar la plataforma en infraestructura propia para experimentacion interna.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No se especifican requisitos de VRAM ni de GPU, ya que no se publican pesos de modelo.
- La plataforma se describe como autoalojada con Docker Compose, backend Go, frontend Next.js y PostgreSQL; los requisitos vendrian determinados por esos componentes, no por un modelo neuronal.
- No se indican GPU recomendadas (A100, H100, RTX 4090 u otras).
- No se confirma compatibilidad con GPU de consumo.
- Opciones de despliegue documentadas: Docker Compose; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no identifica modelos comparables de la misma categoria, y el repositorio no contiene pesos ni resultados que permitan una comparacion tecnica con otros modelos.

## Limitaciones y advertencias

- El repositorio no contiene pesos de modelo (0.0 GB) ni pipeline definido; no es utilizable como modelo de lenguaje.
- La model card corresponde a una plataforma de investigacion, no a un modelo entrenado; las capacidades descritas son de software, no de inferencia neuronal.
- Los resultados de la demostracion publica son explicitamente sinteticos y el Space no ejecuta pruebas de penetracion ni se conecta a objetivos externos.
- No hay informacion sobre sesgos, riesgo de alucinacion o limitaciones linguisticas porque no se documenta un modelo de lenguaje subyacente.
- La licencia AGPL-3.0 impone obligaciones de copyleft: cualquier uso modificado distribuido o expuesto como servicio en red debe liberar el codigo fuente bajo la misma licencia, lo que condiciona el uso comercial propietario.
- Cero descargas y un solo like indican ausencia de validacion por parte de la comunidad; no hay evidencia externa de funcionamiento.
- El uso de herramientas de pentesting autonomo conlleva riesgos legales y eticos; cualquier despliegue debe limitarse a entornos autorizados y con supervision humana.
- No se dispone de documentacion sobre seguridad del propio sistema, a pesar de que la plataforma manipula datos sensibles de evaluaciones.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ghostai1/WardenPEN
- Proyecto original ARTEX (capturas): https://github.com/BaaRai/ARTEX/tree/main/screenshots
- Repositorio original ARTEX: https://github.com/BaaRai/ARTEX
- No se han encontrado en la informacion disponible papers, blogs ni demos adicionales.
