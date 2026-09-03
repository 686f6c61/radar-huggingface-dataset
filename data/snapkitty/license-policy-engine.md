# Snapkitty/license-policy-engine

## Resumen

El modelo `Snapkitty/license-policy-engine` no es un modelo de inteligencia artificial convencional, sino un motor de razonamiento declarativo implementado en Prolog que resuelve problemas de compatibilidad de licencias de software. Desarrollado por Snapkitty, este sistema automatiza la selección de licencias según el caso de uso (SaaS, integración empresarial, modificación a nivel de archivo, etc.) y valida la compatibilidad entre dependencias y la estrategia de triple licencia BSL-1.1, AGPL-3.0 y MPL-2.0. Su relevancia radica en que aborda un problema complejo de grafos de compatibilidad mediante lógica formal, en lugar de redes neuronales, ofreciendo una solución determinista y auditable para equipos de desarrollo que necesitan cumplir políticas de licenciamiento de forma automatizada.

La arquitectura se basa en un conjunto de predicados Prolog que definen la taxonomía de licencias, reglas de compatibilidad y mapeos de casos de uso, permitiendo consultas como `select_license/2` y `check_compatibility/2`. No dispone de parámetros entrenables ni de contexto fijo, ya que su funcionamiento es puramente simbólico. Esto lo hace extremadamente ligero y portable, ejecutable en cualquier entorno con SWI-Prolog instalado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sistema basado en reglas Prolog (lógica declarativa) |
| Parametros totales | No aplica (no hay parámetros entrenables) |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | No disponible (reglas en inglés, salida en texto plano) |
| Licencia | No disponible (la propia herramienta no especifica su licencia) |
| Formato de pesos | No aplica (código fuente Prolog `.pl`) |

## Arquitectura y entrenamiento

El motor se compone de un conjunto de hechos y reglas Prolog que modelan el dominio de las licencias de software. La taxonomía incluye cuatro licencias: BSL-1.1, AGPL-3.0, MPL-2.0 y una licencia comercial. Las reglas definen relaciones de compatibilidad entre licencias y mapean casos de uso concretos a la licencia recomendada. Por ejemplo, `use_case(saas_wrapper, agpl_3_0)` indica que un envoltorio SaaS debe usar AGPL-3.0. La inferencia se realiza mediante unificación y backtracking, lo que permite consultas como `select_license/2` o `check_compatibility/2`. No existe un proceso de entrenamiento, ya que las reglas son codificadas manualmente por el autor a partir de la lógica de compatibilidad de licencias. La innovación técnica reside en el uso de un lenguaje declarativo para un problema que es inherentemente relacional y de grafos, evitando la complejidad de un sistema imperativo.

## Capacidades

- Razonamiento lógico sobre compatibilidad de licencias mediante unificación y backtracking.
- Generación de matrices de compatibilidad entre licencias (comando `matrix`).
- Selección automática de la licencia óptima según el caso de uso (`select` con casos como `saas_wrapper`, `enterprise_restricted`, `file_level_mod`, `copyleft_bypass`, `open_source_redistribution`).
- Validación de compatibilidad entre dos licencias concretas (`check`).
- Extensibilidad: permite añadir nuevos casos de uso, reglas de compatibilidad y validaciones personalizadas mediante la adición de predicados Prolog.
- Integración con CI/CD mediante invocación por línea de comandos o subprocesos (Python, Rust, bash).
- Capacidad de razonamiento transitivo y de satisfacción de restricciones, aunque no se implementa explícitamente en el código mostrado.

## Casos de uso

- **Automatización de cumplimiento de licencias en CI/CD**: el motor puede integrarse en un pipeline de GitHub Actions para verificar que las dependencias del proyecto cumplen la política de licencias. Por ejemplo, el workflow `license-check.yml` ejecuta `matrix` y `check` en cada push, impidiendo fusiones si se detecta una incompatibilidad.
- **Selección de licencia para proyectos SaaS**: un desarrollador que envuelve una librería en un servicio web puede consultar `select saas_wrapper` y obtener AGPL-3.0, garantizando que el código fuente se divulga bajo red copyleft.
- **Integración empresarial sin servicios gestionados**: una empresa que quiere usar el software a escala interna sin ofrecerlo como servicio puede usar `select enterprise_restricted` para obtener BSL-1.1, evitando restricciones de la AGPL.
- **Gestión de modificaciones parciales**: un equipo que modifica solo unos archivos concretos de un proyecto puede usar `select file_level_mod` para obtener MPL-2.0, permitiendo combinar con código propietario sin contagiar todo el codebase.
- **Bypass comercial de copyleft**: cuando una organización necesita eliminar todas las restricciones, el motor recomienda la licencia comercial, facilitando la compra de una exención.
- **Auditoría de dependencias**: mediante `check license dependency`, se puede validar si una dependencia con licencia específica es compatible con la licencia principal del proyecto, evitando conflictos legales en tiempo de desarrollo.
- **Generación de documentación de compatibilidad**: el comando `matrix` produce una tabla legible que puede incluirse en la documentación del proyecto para informar a usuarios y contribuidores sobre las combinaciones permitidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Al ser un sistema simbólico determinista, su rendimiento depende del tamaño de la base de reglas y de la complejidad de las consultas, pero para el conjunto actual de reglas (menos de 20 predicados) la ejecución es instantánea en cualquier hardware moderno. No hay métricas de latencia o throughput documentadas.

## Requisitos de hardware

- **VRAM**: no requiere GPU; es un programa de CPU puro.
- **CPU**: cualquier procesador compatible con SWI-Prolog (x86_64, ARM, etc.).
- **RAM**: menos de 10 MB para el código y sus estructuras de datos.
- **GPU recomendada**: ninguna.
- **Opciones de despliegue**: se ejecuta como script de línea de comandos con `swipl -q -t halt -f license_policy.pl -- ...`. También puede integrarse como subproceso en aplicaciones Python, Rust o Node.js, o como acción de GitHub Actions.
- **Latencia y throughput**: la resolución de consultas es casi instantánea (microsegundos) para el conjunto de reglas actual, sin necesidad de optimización.

## Comparativa con modelos similares

No se dispone de modelos de IA comparables, ya que este motor no es un modelo neuronal. En el ámbito de herramientas de gestión de licencias, existen soluciones comerciales como FOSSA, LicenseCheck o ScanCode, pero son herramientas de escaneo y cumplimiento basadas en heurísticas o bases de datos, no en razonamiento lógico declarativo. La comparativa directa no es posible por la naturaleza diferente de la tecnología.

## Limitaciones y advertencias

- **Alcance limitado**: solo cubre las licencias BSL-1.1, AGPL-3.0, MPL-2.0 y una comercial. No incluye otras licencias comunes como MIT, Apache-2.0, GPL-3.0 o LGPL, aunque el código permite añadirlas manualmente.
- **Reglas fijas**: la lógica está hardcodeada; no aprende de nuevos casos ni se adapta automáticamente a cambios en las políticas de licencias.
- **Sin validación legal**: las recomendaciones son orientativas y no sustituyen el asesoramiento legal profesional. Las interpretaciones de compatibilidad pueden variar según jurisdicción.
- **Riesgo de error en reglas**: si el autor comete un error en las reglas de compatibilidad, el motor propagará ese error de forma determinista.
- **No hay documentación sobre la licencia del propio motor**: el repositorio no especifica bajo qué licencia se distribuye el código Prolog, lo que podría limitar su uso en proyectos propietarios.
- **Dependencia de SWI-Prolog**: requiere que el entorno tenga instalado SWI-Prolog, lo que añade una dependencia externa al sistema.

## Enlaces

- [HuggingFace - Snapkitty/license-policy-engine](https://huggingface.co/Snapkitty/license-policy-engine)
- Contacto del autor: ahmedparr93@gmail.com (mencionado en la model card)
