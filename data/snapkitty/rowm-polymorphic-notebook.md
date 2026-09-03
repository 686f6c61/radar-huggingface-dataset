# Snapkitty/rowm-polymorphic-notebook

## Resumen

ROWM (Read-Once-Write-Many Polymorphic Notebook Iterator) es un proyecto de software presentado en HuggingFace bajo el identificador `Snapkitty/rowm-polymorphic-notebook`. No se trata de un modelo de inteligencia artificial, sino de un entorno de notebook ejecutable diseñado para construir software verificable y auditable. El sistema integra verificación formal, ejecución en múltiples lenguajes, validación de protocolos y generación de evidencia criptográfica inmutable, todo coordinado desde un espacio de trabajo unificado.

El proyecto, desarrollado por Ahmad Ali Parr y Jessica SNAPKITTYWEST, separa la ejecución de la autoridad mediante un motor de conocimiento Prolog/Datalog que actúa como fuente de verdad canónica para capacidades, transiciones de protocolo, autorización, procedencia y preparación para releases. Cada ejecución se trata como un evento de protocolo: se valida contra reglas declarativas, se verifica mediante pruebas formales y se sella en una cadena de recibos con evidencia criptográfica para auditoría posterior. Aunque no es un modelo de IA, su relevancia radica en proponer un paradigma de notebooks con garantías de integridad y reproducibilidad, útil para desarrolladores que necesitan trazabilidad en pipelines de software crítico.

En HuggingFace el registro tiene 0 descargas y 0 likes, creado el 3 de septiembre de 2026. No se especifica licencia ni idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (sistema de software, no un modelo de IA) |
| Parametros totales | No disponible |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (el sistema soporta ejecución en 30+ lenguajes de programación, pero no es un modelo de lenguaje) |
| Licencia | No disponible |
| Formato de pesos | No aplica (no hay pesos de red neuronal) |

## Arquitectura y entrenamiento

ROWM no es un modelo entrenado con datos, sino un sistema de software con una arquitectura modular. Su núcleo consiste en un motor de conocimiento Prolog/Datalog que actúa como fuente de verdad para reglas de autorización, transiciones de protocolo y verificación de pruebas. La ejecución se delega a componentes runtime que compilan código de más de 30 lenguajes (Python, Rust, Haskell, Ada, Agda, Lean, Prolog, Scheme, BQN, HolyC, EmojiCode, etc.) a un bytecode unificado sobre un sustrato SUBLEQ (One-Instruction Set Computer) con seguimiento de auto-modificación y memoria Von Neumann.

La verificación simbólica extrae invariantes de bucles mediante ejecución simbólica e interpretación abstracta (dominio de intervalos). Además, implementa la verificación de pruebas basada en el isomorfismo de Curry-Howard, con retroceso automático ante fallos de prueba. La integridad se asegura mediante checkpoints WORM (Write-Once-Read-Many) con hash Blake3, y cada ejecución genera un recibo de 8 etapas sellado con firma Ed25519 y hash SHA-512. No hay fase de entrenamiento en el sentido de aprendizaje automático; todo el comportamiento está definido por reglas declarativas y código verificable.

## Capacidades

- Ejecución multi-lenguaje: compila y ejecuta código en más de 30 lenguajes de programación, incluyendo lenguajes formales como Agda y Lean.
- Verificación formal: extracción de invariantes mediante ejecución simbólica e interpretación abstracta; comprobación de tipos basada en el isomorfismo de Curry-Howard.
- Motor de conocimiento Prolog/Datalog: 7 predicados núcleo para agentes, capacidades, transiciones, pruebas y preparación de releases; más de 12 predicados de consulta para celdas, recibos, confianza y procedencia.
- Generación de evidencia inmutable: recibos WORM con hash SHA-512 determinista (128 caracteres hex), cadena de recibos con firma Ed25519 y protección contra replay mediante tuplas (nonce, contexto, contador).
- Autorización y control de acceso: despacho sellado con niveles de confianza de agente, arrendamiento de capacidades, expiración y revocación.
- Detección de manipulación: cadena Merkle y verificación de hash padre para detectar alteraciones en celdas.
- Frontend interactivo: notebook en navegador con celdas editables, chat JIT con WebLLM, preservación Unicode (incluidos símbolos matemáticos y planos astrales), grafo de dependencias y visor de metadatos.
- Criptografía WebAssembly: implementación de SHA-512, Blake3, Ed25519 (stub) y HMAC en Rust compilado a WASM, con rendimiento 10-25x superior a JavaScript y binario de 198 KB.

## Casos de uso

- Auditoría de procesos de software: el sistema genera recibos criptográficos de cada ejecución, lo que permite verificar de forma independiente que un pipeline cumplió todas las reglas definidas. Útil para entornos regulados donde se requiere trazabilidad completa.
- Verificación formal de contratos inteligentes: al integrar lenguajes como Lean y Agda, se pueden escribir y comprobar pruebas matemáticas de propiedades de contratos antes de desplegarlos.
- Entornos de desarrollo con múltiples lenguajes: un equipo puede ejecutar celdas en Python, Rust y Haskell dentro del mismo notebook, con un bytecode unificado y seguimiento de dependencias entre celdas.
- Gestión de autorizaciones y capacidades: el motor Prolog permite definir políticas de acceso granulares, con arrendamiento temporal de capacidades y revocación, adecuado para sistemas multi-tenant.
- Reproducibilidad de experimentos científicos: al sellar cada ejecución con hash determinista y cadena de recibos, se puede demostrar que un resultado no fue manipulado después de su generación.
- Documentación ejecutable con garantías: los notebooks pueden servir como especificaciones vivas donde el código, las pruebas y la documentación están unificados y verificados, reduciendo la deriva entre lo documentado y lo implementado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El proyecto menciona que los componentes WebAssembly (crypto-engine.rs y unicode-engine.rs) son 10-25 veces más rápidos que la implementación en JavaScript, con un binario de 198 KB y 50 pruebas unitarias pasando, pero no hay métricas comparativas con otros sistemas similares.

## Requisitos de hardware

- Al ser un sistema de software que se ejecuta en navegador y backend, no requiere GPU. La parte frontend funciona en cualquier navegador moderno con soporte WebAssembly.
- La ejecución de los lenguajes compilados a bytecode SUBLEQ se realiza en runtime, por lo que el consumo de CPU y memoria depende de la complejidad de los programas ejecutados.
- El motor Prolog/Datalog es ligero y puede ejecutarse en hardware modesto (procesador de escritorio o portátil).
- Para el chat JIT con WebLLM, se necesita un navegador con WebGPU o WebAssembly SIMD y acceso a modelos de lenguaje locales, lo que puede requerir al menos 8 GB de RAM si se cargan modelos pequeños.
- No hay requisitos específicos de despliegue en servidor; el repositorio indica que es un proyecto de código abierto con documentación técnica en `docs/`.
- Opciones de despliegue: se puede ejecutar localmente abriendo `frontend/index.html` en un navegador, o integrarse en pipelines de CI/CD como herramienta de verificación.

## Comparativa con modelos similares

No disponible. ROWM no es un modelo de IA y no existe una categoría estándar de modelos comparables. Podría compararse con otros sistemas de notebook ejecutable como Jupyter, pero ROWM añade verificación formal y sellado criptográfico, algo que Jupyter no ofrece. Sin embargo, no se dispone de información suficiente para una comparación técnica rigurosa.

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto, no razona sobre lenguaje natural ni tiene capacidades de aprendizaje. Las expectativas deben ajustarse a un sistema de verificación y ejecución.
- Capacidades experimentales sin probar: el README indica que el kernel de Jupyter, la ejecución de README.subleq, la equivalencia cross-language y las herramientas externas de prueba (Agda/Ada/SPARK/Lean4) son parciales o no testeadas.
- Licencia no especificada: no se indica ninguna licencia en HuggingFace ni en el README, lo que impide conocer las restricciones de uso comercial o modificación.
- Dependencia de WebAssembly: el frontend requiere navegadores con soporte WASM; navegadores antiguos pueden no funcionar.
- Seguridad: aunque se han remediado seis hallazgos de seguridad (SEC-001 a SEC-006), el sistema es complejo y podría tener vulnerabilidades no descubiertas en la cadena de verificación o en la ejecución de lenguajes exóticos.
- Sin benchmarks independientes: no hay evaluaciones externas que validen las afirmaciones de rendimiento o seguridad.
- Fecha de creación reciente (septiembre de 2026) y sin actividad comunitaria: 0 descargas y 0 likes sugieren que el proyecto está en fase temprana y no ha sido probado en entornos de producción.

## Enlaces

- HuggingFace: https://huggingface.co/Snapkitty/rowm-polymorphic-notebook
- Repositorio GitHub: https://github.com/SNAPKITTYWEST/rowm-polymorphic-notebook
- Documentación técnica: https://github.com/SNAPKITTYWEST/rowm-polymorphic-notebook/tree/main/docs
- Frontend interactivo: https://github.com/SNAPKITTYWEST/rowm-polymorphic-notebook/blob/main/frontend/index.html
- Demo Unicode: https://github.com/SNAPKITTYWEST/rowm-polymorphic-notebook/blob/main/isomorphic_notebook.html
