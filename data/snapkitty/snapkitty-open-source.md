# Snapkitty/snapkitty-open-source

## Resumen

SnapKitty es un proyecto de investigación que integra un DAG de integridad (ICP-DAG) para gobernar cada afirmación, prueba, decisión y ejecución en un pipeline de IA, junto con mecanismos experimentales como atención basada en SUBLEQ, meta-programación XML y límites de entropía verificados formalmente. No se trata de un modelo de lenguaje convencional con pesos entrenados, sino de un conjunto de especificaciones, código y pruebas formales que proponen un enfoque alternativo para la trazabilidad y verificación en sistemas de IA. Desarrollado por Ali Parr, Ahmad y Westerhoff, Jessica, el repositorio incluye implementaciones en Rust, Python, Lean 4 y MUMPS, con un énfasis en la "computación soberana" y la reproducibilidad.

La relevancia actual radica en la creciente necesidad de auditar y verificar pipelines de IA, especialmente en entornos donde la integridad de los datos y las decisiones es crítica. SnapKitty ofrece un marco para imponer invariantes de gobernanza mediante programación con conjuntos de respuesta (ASP) y MUMPS, así como pruebas matemáticas formales (por ejemplo, un límite de entropía H < 0.20 nats) que pretenden garantizar propiedades del sistema. Sin embargo, el propio autor advierte que no se han realizado benchmarks comparativos, por lo que no debe citarse como evidencia de mejoras de rendimiento sin una validación independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (menciona atención SUBLEQ, SSM de 2048 dimensiones, DAG de integridad) |
| Parametros totales | No disponible (no es un modelo con pesos entrenados) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (según metadatos de HuggingFace) |
| Licencia | Apache-2.0 (código y documentación); núcleo de investigación bajo BSL-1.1 / AGPL-3.0 / MPL-2.0; patente pendiente |
| Formato de pesos | No disponible (no se distribuyen pesos; el repositorio contiene código fuente y especificaciones) |

## Arquitectura y entrenamiento

La arquitectura de SnapKitty no es la de un transformer estándar. El proyecto describe un "ICP-DAG" (Integrity, Consensus, Provenance DAG) que actúa como capa de gobernanza, impuesto mediante Answer Set Programming (ASP) y MUMPS, con 10 invariantes de integridad. Además, propone una "SUBLEQ Attention" que reemplaza el softmax por programas SUBLEQ que convierten vectores de activación en programas y utilizan enrutamiento entero en lugar de distribuciones de probabilidad. También incluye una inyección de un modelo de espacio de estados (SSM) de 2048 dimensiones en el flujo de trabajo, aunque no se especifican detalles de entrenamiento.

No se proporciona información sobre el conjunto de datos de entrenamiento, el número de tokens o el uso de RLHF/DPO. El repositorio contiene pruebas formales en Lean 4 (por ejemplo, conmutatividad del punto fijo de Jordan y límite de entropía) con cero "sorry", lo que indica que esas propiedades matemáticas están verificadas. Sin embargo, el propio autor declara que no se han realizado benchmarks de rendimiento, latencia, tasa de alucinación o FLOPs, y que no se debe citar el repositorio como evidencia de mejoras sin ejecutar dichos benchmarks.

## Capacidades

- Gobernanza de pipelines mediante un DAG de integridad que impide la ejecución si no se cumplen los invariantes definidos en ASP y MUMPS.
- Verificación formal de propiedades matemáticas (límite de entropía, conmutatividad de punto fijo) con Lean 4, sin "sorry".
- Atención experimental basada en SUBLEQ, que sustituye el softmax por programas de una sola instrucción (SUBLEQ) para el enrutamiento de activaciones.
- Meta-programación XML: más de 7 transformaciones XSLT que generan código Rust, C y HTML a partir de especificaciones XML, propagando el límite de entropía a través de capas.
- Simulación clásica de computación cuántica topológica (fibonacci anyons, grupo de trenzas) con formalizaciones en Lean 4, aunque algunas axiomas (pentágono/hexágono) están incompletos.
- Sistema de "quantum swarm" que utiliza entropía cuántica real de ANU QRNG para inferencia multi-agente, sin ser una computadora cuántica.
- Trazabilidad completa del flujo de trabajo ("sovereignStep") con seis registros WORM que registran cada paso, desde la semilla cuántica hasta el sello final.

## Casos de uso

- Auditoría de integridad en pipelines de IA: el ICP-DAG puede emplearse para garantizar que cada decisión o generación pase por un conjunto de invariantes verificables, útil en entornos regulados donde se requiere trazabilidad completa.
- Verificación formal de propiedades de sistemas: las pruebas en Lean 4 (límite de entropía, conmutatividad) pueden servir como base para certificar que un sistema cumple ciertas cotas matemáticas, aplicable en investigación de seguridad.
- Generación de código con meta-programación XML: las transformaciones XSLT permiten derivar implementaciones en Rust o C desde especificaciones formales, reduciendo errores de traducción manual en proyectos de software crítico.
- Control de acceso basado en grupos de trenzas: la implementación en Rust del grupo de trenzas B₃ puede utilizarse para esquemas de autorización no convencionales, aunque es experimental.
- Simulación de sistemas cuánticos topológicos: la simulación clásica de fibonacci anyons y el grupo de trenzas puede servir para fines educativos o de investigación en computación cuántica topológica.
- Gobernanza de datos con MUMPS y ASP: el uso de MUMPS (GT.M o Caché) para imponer el DAG de integridad puede integrarse en infraestructuras sanitarias o financieras que ya utilizan estas bases de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El propio autor indica explícitamente en la model card que no se han realizado comparaciones de rendimiento, latencia, tasa de alucinación ni FLOPs, y que no se debe citar este repositorio como evidencia de mejoras sin ejecutar dichos benchmarks primero.

## Requisitos de hardware

- No se especifican requisitos de VRAM ni GPU, ya que no se distribuyen pesos de un modelo entrenado.
- Los componentes de software (VM SUBLEQ en Rust/WASM, simulación de anyons, etc.) son ligeros y pueden ejecutarse en CPU convencionales.
- Para ejecutar las pruebas de MUMPS se requiere una instalación de GT.M o Caché.
- Las pruebas de Lean 4 requieren el compilador de Lean y la herramienta `lake`.
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

No disponible. SnapKitty no es un modelo de lenguaje comparable a otros LLMs; es un framework de investigación con componentes heterogéneos. No se han identificado alternativas equivalentes en la información proporcionada.

## Limitaciones y advertencias

- No se han realizado benchmarks de rendimiento, por lo que no hay evidencia de mejoras frente a métodos convencionales (softmax attention, etc.).
- Muchos componentes son experimentales o están incompletos: la síntesis de trenzas en Lean 4 tiene "sorry", HybridQuantumSAT es un stub, y la atención SUBLEQ no ha sido comparada con softmax.
- La licencia es mixta: Apache-2.0 para el código y documentación, pero el núcleo de investigación está bajo BSL-1.1 / AGPL-3.0 / MPL-2.0, y hay una patente pendiente. Esto puede limitar el uso comercial sin acuerdos adicionales.
- El proyecto se centra en inglés; no hay soporte multilingüe declarado.
- La dependencia de MUMPS (GT.M o Caché) puede ser un obstáculo para entornos sin esa infraestructura.
- La model card advierte explícitamente que no se debe citar el repositorio como evidencia de mejoras de rendimiento sin ejecutar benchmarks independientes.
- No se proporcionan pesos ni un modelo desplegable; el pipeline de HuggingFace es "text-generation" pero no hay artefactos de modelo.

## Enlaces

- HuggingFace: https://huggingface.co/Snapkitty/snapkitty-open-source
- Repositorio GitHub (según la cita): https://github.com/SNAPKITTYWEST/snapkitty-open-source
- Documentación interna (mencionada en la model card): `docs/REPOSITORY_INVENTORY.md`, `docs/ARCHITECTURE.md`, `docs/QUANTUM_SWARM.md`, `docs/TOPOLOGICAL_QUANTUM.md`, `docs/RESEARCHER_EXPLANATION.md`, `docs/XML_METADATA.md`, `docs/METAPROGRAMMING.md`, `docs/WORKFLOW.md` (accesibles desde el repositorio).
