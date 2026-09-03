# Snapkitty/agentos

## Resumen

`Snapkitty/agentos` es, según la información disponible, el repositorio de producción del "SnapKitty Agent OS", un sistema de orquestación de cómputo soberano presentado como la infraestructura que mantiene unida una constelación de repositorios de agentes. No se trata de un modelo de lenguaje o de IA en el sentido convencional, sino de un conjunto de herramientas de software: un demonio en Go, una consola de operador en Next.js, módulos de empaquetado reproducibles con Nix, políticas de confianza ejecutables en Prolog y pipelines de CI/CD. El proyecto enfatiza conceptos como la verificación criptográfica de artefactos (Bifrost WORM Chain), una "Plasma Gate" con Ed25519 y un modelo de resolución de problemas denominado "P/NP Swarm".

El autor es Ahmad Ali Parr, bajo el colectivo "SnapKitty Collective". La fecha de creación en HuggingFace es el 3 de septiembre de 2026, aunque el repositorio parece ser un proyecto de software más que un modelo con pesos. Dado que no hay parámetros, arquitectura neuronal ni datos de entrenamiento, su relevancia reside en su propuesta de infraestructura para agentes de IA verificables y reproducibles, más que en capacidades de inferencia. La licencia declarada en el README es Apache-2.0, aunque la ficha de HuggingFace indica "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No es un modelo neuronal; es un repositorio de software (Go daemon, Next.js, Nix, Prolog) |
| Parametros totales | No disponible |
| Parametros activos | No aplicable (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (segun README; HuggingFace indica "no disponible") |
| Formato de pesos | No aplicable (no hay pesos; codigo fuente, modulos Nix, scripts) |

## Arquitectura y entrenamiento

No existe un proceso de entrenamiento en el sentido de aprendizaje automatico. El proyecto se compone de varios modulos de software independientes: el "Sovereign Daemon" (escrito en Go) expone endpoints HTTP y un socket Unix para validacion de entornos, ejecucion de pipelines, firma de artefactos y consulta de catalogos de modelos (Ollama y vLLM). La consola "agentos-frontend" usa Next.js 14, React 18 y Tailwind para visualizar el estado del sistema. Los modulos Nix garantizan construcciones reproducibles, mientras que las politicas en Prolog (`trust_deed.pl`, `snapkitty_bom.pl`, `pipeline_policy.pl`) implementan compuertas de confianza y generacion de Bill of Materials. La logica de resolucion se describe como un "P/NP Swarm": los agentes reclaman problemas, proponen soluciones y un verificador en tiempo polinomial determina si convergen. El sistema integra verificacion de artefactos mediante una cadena WORM (Write Once Read Many) llamada Bifrost y una "Plasma Gate" basada en Ed25519.

## Capacidades

- Orquestacion de agentes: gestiona un enjambre de agentes que resuelven problemas de forma coordinada.
- Verificacion de artefactos: firma y valida artefactos mediante Ed25519 y una cadena WORM.
- Generacion de SBOM (Software Bill of Materials) a partir de modulos Prolog.
- Integracion con modelos de IA locales: expone endpoints para consultar catalogos de modelos en Ollama y vLLM.
- Ejecucion de pipelines: permite ejecutar pipelines de validacion y extraccion de datos.
- Reproducibilidad: usa Nix para empaquetar y reproducir entornos de construccion.
- Politicas de confianza: compuertas ejecutables en Prolog que determinan que agentes o artefactos son fiables.
- Frontend de operador: consola web para supervisar el estado del sistema y la memoria de los agentes.

## Casos de uso

- Despliegue de agentes de IA verificables en produccion: el "Sovereign Daemon" valida el entorno y firma los artefactos antes de que un agente se ejecute, lo que permite auditar cada paso del ciclo de vida.
- Auditoria de cadena de suministro de software: los scripts `generate-sbom.sh` y las politicas Prolog generan un SBOM en JSON que puede integrarse en sistemas de cumplimiento normativo.
- Orquestacion de multiples modelos locales: los endpoints `/v1/ollama/models` y `/v1/vllm/models` permiten a un operador gestionar y enrutar peticiones entre distintos modelos servidos localmente.
- Entornos de investigacion reproducibles: los modulos Nix garantizan que el entorno de desarrollo y ejecucion sea identico en cualquier maquina, reduciendo problemas de "funciona en mi maquina".
- Validacion automatizada de contribuciones: los workflows de GitHub Actions (`verify.yml`, `pnp_verify.yml`, `audit.yml`) actuan como compuertas de calidad que verifican firmas, politicas y pruebas antes de fusionar codigo.
- Infraestructura para equipos que necesitan trazabilidad completa: cada artefacto sellado referencia un hash en la cadena Bifrost, lo que facilita la auditoria forense de decisiones tomadas por agentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de latencia, throughput ni metricas de calidad para comparar con otros sistemas.

## Requisitos de hardware

- No hay requisitos de VRAM ni GPU: al ser un repositorio de software, no requiere tarjetas graficas para funcionar.
- Requiere Node.js (para el frontend y las pruebas), Go (para el demonio) y Nix (para el empaquetado).
- El demonio puede ejecutarse en cualquier maquina con Go instalado; el frontend requiere un entorno Node.js.
- Para usar los catalogos de modelos, se necesita una instalacion funcional de Ollama o vLLM, que si pueden requerir GPU dependiendo de los modelos servidos.
- El despliegue puede hacerse en un servidor basico (2-4 GB de RAM) si solo se usa el daemon y las politicas; el frontend Next.js puede requerir algo mas de recursos.
- No hay estimaciones de latencia o throughput publicadas para el daemon.

## Comparativa con modelos similares

No disponible. No hay informacion suficiente para comparar este proyecto con otros sistemas de orquestacion de agentes. A diferencia de frameworks como LangChain o AutoGen, `agentos` no es un framework de agentes, sino un repositorio de infraestructura con un enfoque particular en verificacion criptografica y reproducibilidad. No se han encontrado datos objetivos de rendimiento o adopcion que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- No es un modelo de IA: no puede generar texto, codigo ni realizar inferencias; es un conjunto de herramientas de orquestacion.
- La documentacion disponible es escasa y esta redactada con una terminologia muy particular ("sovereign compute", "Bifrost WORM Chain", "P/NP swarm") que puede dificultar su evaluacion por parte de terceros.
- No hay evidencia de uso en produccion ni de una comunidad activa mas alla del autor y el colectivo SnapKitty.
- La licencia Apache-2.0 permite uso comercial, pero el proyecto depende de herramientas externas (Nix, Prolog, Go, Next.js) cuya integracion puede requerir conocimientos especializados.
- La fecha de creacion (septiembre de 2026) y la ausencia de descargas o likes en HuggingFace sugieren que es un proyecto muy reciente o poco difundido.
- No se especifican garantias de seguridad ni de soporte; el modelo de confianza basado en Ed25519 y WORM es interesante, pero no hay auditorias independientes publicadas.

## Enlaces

- HuggingFace: https://huggingface.co/Snapkitty/agentos
- Sitio web del colectivo: http://collectivekitty.com/
