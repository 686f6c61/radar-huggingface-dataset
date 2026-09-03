# Snapkitty/ledge

## Resumen

El repositorio `Snapkitty/ledge` no corresponde a un modelo de inteligencia artificial, sino a una biblioteca de software open source denominada LEDGE, descrita como una "cadena de auditoría soberana" (Sovereign Audit Chain) implementada en Rust. Su propósito es proporcionar un mecanismo de sellado criptográfico de eventos mediante una cadena de hashes SHA-256 encadenados y un árbol de Merkle, de modo que cualquier modificación en un evento sea detectable de forma inmediata y matemáticamente demostrable. El proyecto se presenta como una solución para auditar decisiones de sistemas de IA, transacciones financieras y cumplimiento normativo, ante la creciente necesidad de probar la integridad de los registros en entornos empresariales.

La biblioteca está disponible para Rust, TypeScript/JavaScript (vía WASM) y npm, y se distribuye bajo licencia MIT. No se trata de un modelo con parámetros, contexto o capacidades de generación de texto; por tanto, los apartados técnicos relativos a arquitectura de red neuronal, entrenamiento o benchmarks no son aplicables y se indicarán como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cadena de hashes SHA-256 encadenados con árbol de Merkle (no es un modelo de IA) |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | MIT |
| Formato de pesos | no disponible (no aplica; se distribuye como crate de Rust y paquete npm/WASM) |

## Arquitectura y entrenamiento

LEDGE no es un modelo entrenado, sino un protocolo de sellado de eventos. Su arquitectura consiste en una cadena lineal de sellos, donde cada sello se calcula como `SHA256(prev_seal || payload_json || timestamp_ms || index)`, partiendo de un hash génesis fijo. Adicionalmente, se construye un árbol de Merkle sobre todos los sellos para obtener una huella raíz única que resume toda la historia. Cualquier alteración en un evento rompe todos los sellos posteriores y cambia la raíz de Merkle, lo que permite detectar manipulaciones de forma total y verificable por cualquier parte sin necesidad de confianza central.

No existe fase de entrenamiento ni datos de entrenamiento asociados. El proyecto se centra en la implementación de un algoritmo criptográfico determinista y en su disponibilidad como librería para integración en sistemas de auditoría.

## Capacidades

- Sellado de eventos arbitrarios en formato JSON con timestamp e índice.
- Verificación de integridad de toda la cadena, reportando todos los enlaces rotos.
- Cálculo de la raíz de Merkle como huella digital de la historia completa.
- API en Rust (`LedgeChain`) y funciones estáticas en WASM/JavaScript (`ledge_seal`, `ledge_verify`, `ledge_merkle_root`).
- Detección de manipulación: si se modifica cualquier byte de un evento, la verificación falla y se indica el índice del evento alterado.
- Protocolo abierto y sin secretos: cualquier parte puede verificar una cadena de forma independiente.

## Casos de uso

- Auditoría de decisiones de IA: sellar cada decisión tomada por un modelo (por ejemplo, aprobación de pagos) para poder demostrar posteriormente qué ocurrió y que no fue alterado.
- Cumplimiento normativo (GDPR, SOX, MiCA): generar registros inmutables de acciones de sistemas automatizados para satisfacer requisitos de trazabilidad y evidencia ante reguladores.
- Registro de transacciones financieras: sellar cada operación en una cadena para detectar fraudes o modificaciones internas.
- Trazabilidad en pipelines de CI/CD: sellar cada despliegue o cambio de configuración para auditar el historial de producción.
- Verificación de integridad de logs: sustituir logs mutables por una cadena sellada que permita comprobar que no se han reescrito.
- Prueba de no repudio: al sellar eventos con timestamp, se puede demostrar que un evento existía en un momento dado y que no ha sido modificado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Al no ser un modelo de IA, no existen métricas como MMLU, HumanEval o GSM8K. El rendimiento de la biblioteca dependerá del coste computacional de los hashes SHA-256 y del tamaño de la cadena, pero no se proporcionan datos concretos.

## Requisitos de hardware

- Al ser una librería de software, no requiere GPU ni VRAM. Funciona en cualquier CPU con soporte para Rust o WASM.
- Para integraciones en producción, se recomienda un servidor estándar con suficiente memoria para mantener la cadena en RAM si se usa la API en memoria, o persistencia en disco para cadenas largas.
- Opciones de despliegue: integración directa en aplicaciones Rust, Node.js o navegador vía WASM. No requiere infraestructura especializada.
- Latencia y throughput: no disponibles; dependerán del volumen de eventos y de la implementación concreta.

## Comparativa con modelos similares

No disponible. LEDGE no es un modelo de IA y no tiene equivalentes directos en el ámbito de modelos de lenguaje. Como herramienta de auditoría, podría compararse con blockchains o bases de datos inmutables, pero no se dispone de datos objetivos para una comparación cuantitativa.

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto, no razona ni procesa lenguaje. Cualquier uso como modelo de lenguaje es inapropiado.
- La seguridad depende de la correcta implementación del protocolo y de la gestión de las claves (aunque no usa claves, la integridad depende de que el código no sea comprometido).
- La cadena crece linealmente con el número de eventos; para volúmenes muy altos puede requerir estrategias de almacenamiento y poda.
- La licencia MIT permite uso comercial, pero el proyecto parece estar en fase inicial (versión 0.1) y no se garantiza estabilidad de API.
- No se proporcionan garantías de soporte ni mantenimiento a largo plazo.
- La verificación de integridad solo es válida si el software de verificación no ha sido manipulado; se asume un entorno de confianza para el verificador.

## Enlaces

- HuggingFace: https://huggingface.co/Snapkitty/ledge
- Crates.io: https://crates.io/crates/ledge
- npm: https://www.npmjs.com/package/@snapkitty/ledge
- GitHub Actions (CI): https://github.com/SNAPKITTYWEST/ledge/actions
- Repositorio GitHub (referenciado en la model card): https://github.com/SNAPKITTYWEST/ledge
