# Snapkitty/sovereign-compiler

## Resumen

Snapkitty/sovereign-compiler, también denominado "root-fontana", es un compilador constitucional diseñado para el ecosistema SnapKitty. No se trata de un modelo de inteligencia artificial, sino de una herramienta de software que implementa un DSL (Fontana DSL) para definir y ejecutar artefactos, gobernanza y contratos verificables. El proyecto está desarrollado en Rust y Lean 4, e incluye módulos para la creación de testigos inmutables (WORM), un libro mayor de auditoría (Archivum), un motor de gobernanza, recibos criptográficos SHA-256, telemetría y un motor de ejecución determinista. Su relevancia radica en la intersección entre compilación, verificación formal y gobernanza automatizada, orientado a sistemas que requieren trazabilidad y cumplimiento de reglas.

La información disponible en HuggingFace es mínima: no se indica licencia, idiomas, ni pipeline. La model card describe la arquitectura del software y su uso, pero no contiene datos de rendimiento, benchmarks ni especificaciones de hardware. Por tanto, esta ficha se centra en lo que se puede extraer de la documentación pública, indicando explícitamente la ausencia de datos cuando corresponda.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Compilador modular en Rust y Lean 4 (no es un modelo neuronal) |
| Parametros totales | no aplica |
| Parametros activos | no aplica |
| Longitud de contexto | no aplica |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | no disponible (el DSL es en ingles) |
| Licencia | no disponible (se menciona "Sovereign Source" en la insignia, pero no se detalla) |
| Formato de pesos | no aplica (no hay pesos; es codigo fuente) |

## Arquitectura y entrenamiento

El proyecto se estructura en módulos Rust independientes que se comunican a través de una tubería: el artefacto fuente (JSON o Fontana DSL) se parsea mediante el Fontana DSL Parser, que genera un AST y realiza una comprobación de admisibilidad. A partir de ahí se construye un "Unified Witness" que combina el artefacto, una etiqueta y un recibo. Este testigo alimenta tres subsistemas: Archivum (libro mayor inmutable), Governance (motor de aprobaciones) y Contractivity (generación de recibos SHA-256). Finalmente, el Observatory recoge telemetría y el Execution Engine ejecuta el programa de forma determinista. Además, hay cuatro archivos Lean 4 que formalizan axiomas constitucionales y pruebas de contractividad, estratos y verificación.

El "entrenamiento" no aplica en el sentido de modelos de IA; el desarrollo se basa en programación tradicional y verificación formal. No hay información sobre datasets, tokens o procesos de RLHF/DPO.

## Capacidades

- Compilación de artefactos definidos en Fontana DSL o JSON, con comprobación de admisibilidad sintáctica y semántica.
- Generación de testigos inmutables (WORM) que registran la integridad del artefacto mediante hash.
- Gestión de un libro mayor append-only (Archivum) para auditoría y trazabilidad.
- Motor de gobernanza con reglas declarativas (permisos y acciones condicionadas).
- Emisión de recibos criptográficos SHA-256 (contractividad) que vinculan artefacto, testigo y reglas.
- Telemetría y métricas a través del módulo Observatory.
- Ejecución determinista de programas definidos en el DSL, con soporte de expresiones aritméticas y lógicas.
- Verificación formal de propiedades mediante Lean 4 (pruebas de contractividad y estratos).
- API en Rust para integrar las funcionalidades en aplicaciones externas.

## Casos de uso

- Auditoría de artefactos digitales: el compilador puede generar testigos inmutables y almacenarlos en el Archivum, lo que permite verificar la integridad de documentos o configuraciones a lo largo del tiempo.
- Gobernanza automatizada: mediante el motor de governance, se pueden definir reglas de aprobación para cambios en sistemas críticos, garantizando que solo se ejecuten acciones permitidas.
- Cumplimiento normativo: la emisión de recibos criptográficos y la verificación formal en Lean 4 permiten demostrar que ciertos procesos cumplen condiciones predefinidas, útil para auditorías regulatorias.
- Trazabilidad en pipelines de CI/CD: los testigos y el libro mayor pueden integrarse en flujos de despliegue para registrar cada paso y su autorización.
- Ejecución determinista de contratos inteligentes: el motor de ejecución puede utilizarse para correr lógica de negocio con resultados reproducibles, evitando ambigüedades.
- Investigación en verificación formal: los módulos Lean 4 sirven como referencia para estudiar la aplicación de asistentes de prueba a sistemas de gobernanza.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de rendimiento, latencia, throughput ni comparativas con otras herramientas.

## Requisitos de hardware

- Al ser un compilador de software, no requiere GPU ni VRAM. Se ejecuta en CPU estándar.
- Dependencias: Rust 2021 y Lean 4 (con lake). El tamaño del binario y la memoria dependen de la compilación, pero no se especifican requisitos mínimos.
- Se puede desplegar en cualquier sistema con Rust y Lean instalados, incluyendo servidores o máquinas de desarrollo.
- No se proporcionan opciones de despliegue como vLLM u Ollama, al no ser un modelo de inferencia.

## Comparativa con modelos similares

No disponible. No existen modelos comparables en el sentido de IA generativa; se trata de una herramienta de compilación específica del ecosistema SnapKitty. No se conocen alternativas equivalentes en el ámbito de compiladores constitucionales con verificación Lean.

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto, razona ni procesa lenguaje natural. Su uso se limita a la compilación y ejecución de artefactos definidos en su DSL.
- La licencia no está claramente especificada; la insignia "Sovereign Source" sugiere restricciones, pero no se detallan los términos. Antes de uso comercial, conviene contactar con el autor.
- El DSL es propietario y no está estandarizado, lo que limita la interoperabilidad con otros sistemas.
- La documentación es escasa: no hay guías de contribución, ejemplos avanzados ni referencias de API completas.
- El proyecto parece estar en fase inicial (creado en septiembre de 2026, sin descargas ni likes), por lo que su estabilidad y soporte no están garantizados.
- No se han publicado pruebas de seguridad ni análisis de vulnerabilidades.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Snapkitty/sovereign-compiler
- Perfil de Snapkitty Collective en HuggingFace: https://huggingface.co/Snapkitty
- Repositorio en GitHub (SNAPKITTYWEST): https://github.com/SNAPKITTYWEST/sovereign-compiler
- Perfil de GitHub de SNAPKITTYWEST: https://github.com/SNAPKITTYWEST
- Proyecto relacionado sovereign-router: https://huggingface.co/Snapkitty/sovereign-router
- Documentación del router: https://snapkittywest.github.io/router.html
