# Snapkitty/hyperkitty-constraint-dsl

## Resumen

El repositorio `Snapkitty/hyperkitty-constraint-dsl` no contiene un modelo de inteligencia artificial. Se trata de un lenguaje de especificación formal denominado FormalConstraintDSL, desarrollado por el autor Snapkitty, que define contratos en XML para sistemas deterministas con verificación de pruebas. Su propósito es permitir que un agente actúe como compilador contra un contrato formal, en lugar de generar código libremente. El sistema incluye un kernel booleano basado en NAND, un motor de ejecución XSLT y una prueba formal en HOL Light sobre la entropía de superficies K3.

Este proyecto es relevante para el ámbito de la ingeniería de software formal y la verificación de sistemas, pero no ofrece capacidades de generación de lenguaje natural, razonamiento estadístico ni ninguna funcionalidad propia de un modelo de IA. Por tanto, la ficha que sigue se adapta a la estructura solicitada, indicando explícitamente los campos que no aplican.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (no es un modelo neuronal; es un DSL basado en XML con motor XSLT) |
| Parametros totales | No aplica |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | No disponible |
| Licencia | BSL 1.1 con cambio a MIT en 2029 (según README); campo HuggingFace: no disponible |
| Formato de pesos | No aplica (repositorio de código XML, XSLT, OCaml y documentación) |

## Arquitectura y entrenamiento

No existe una arquitectura de red neuronal ni un proceso de entrenamiento. El sistema se compone de:

- Un DSL en XML que define dominios, elementos prohibidos, invariantes, un predicado de validez y una pipeline con requisitos de prueba.
- Un kernel booleano que reduce todas las restricciones a operaciones NAND, con derivaciones de NOT, AND, OR e IMPLIES.
- Un motor de ejecución XSLT (en `xslt/polyglot-codegen.xsl`) que lee simultáneamente JSON, XML y SGML mediante XPath 3.1 y genera código bash determinista.
- Una prueba formal en HOL Light (en `hol/k3_entropy.ml`) que demuestra que la entropía de la superficie K3 (0.8314 nats) supera el límite permitido de 0.20 nats, rechazando así ese objeto geométrico.

No hay datos de entrenamiento, tokens ni técnicas de RLHF/DPO.

## Capacidades

- Definición de contratos formales en XML: dominios, estados, dependencias prohibidas e invariantes.
- Evaluación de un predicado de validez booleano que determina si un estado del sistema es aceptable.
- Verificación de invariantes como `active => trusted` o `entropy <= 0.20`.
- Generación de código ejecutable (bash) a partir de especificaciones mediante XSLT.
- Inclusión de certificados de prueba en los artefactos generados.
- Soporte para edición visual mediante tres tipos de nodos (NAND, agente válido, agente rechazado, prueba) en el editor de HyperKitty OS.
- Verificación formal de propiedades matemáticas (por ejemplo, entropía de superficies K3) con HOL Light.

No ofrece generación de texto, razonamiento conversacional, tool calling, visión, audio ni capacidades multilingües.

## Casos de uso

- Especificación de sistemas con garantías formales: se puede usar para definir qué estados son admisibles en un sistema crítico, de modo que cualquier construcción que no cumpla el predicado de validez no se distribuya.
- Integración en pipelines de CI/CD: el DSL puede generar scripts bash con comprobaciones de restricciones incrustadas, lo que permite validar artefactos antes de su despliegue.
- Verificación de invariantes en infraestructura: por ejemplo, garantizar que un agente solo se active si está marcado como confiable, o que la entropía de un sistema no supere un umbral.
- Generación de código determinista: al usar XSLT como motor, la misma especificación produce siempre la misma salida, lo que facilita la reproducibilidad.
- Auditoría de dependencias: se pueden declarar dependencias prohibidas y hacer que el sistema rechace cualquier build que las incluya.
- Investigación en verificación formal: el ejemplo de la superficie K3 demuestra cómo integrar pruebas matemáticas en un sistema de restricciones, útil para entornos académicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Al no tratarse de un modelo de IA, no existen métricas como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- No aplica: no se requiere GPU ni VRAM para inferencia, ya que no hay modelo neuronal.
- El software se ejecuta en CPU con herramientas estándar: `xsltproc` para transformaciones XSLT, `dune` para OCaml y cualquier intérprete de bash.
- El repositorio tiene un tamaño declarado de 0.0 GB, por lo que los requisitos de almacenamiento son mínimos.
- No hay latencia ni throughput asociados a inferencia.

## Comparativa con modelos similares

No disponible. No existe una categoría de modelos de IA comparable, dado que este repositorio no es un modelo neuronal. Si se buscara comparar con otros DSL de especificación formal, se necesitarían referencias externas que no se proporcionan en la información disponible.

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto, no razona ni responde a consultas. Cualquier uso como modelo de lenguaje sería inapropiado.
- La licencia BSL 1.1 puede imponer restricciones de uso comercial hasta 2029, aunque el campo de licencia en HuggingFace figura como "no disponible".
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que no hay comunidad ni validación externa.
- La documentación mezcla conceptos matemáticos avanzados (superficies K3, entropía de Shannon) cuya verificación externa no está disponible.
- No se garantiza mantenimiento ni soporte; el proyecto parece experimental.
- El sistema depende de herramientas externas (xsltproc, HOL Light, dune) que deben estar correctamente instaladas para ejecutar los ejemplos.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Snapkitty/hyperkitty-constraint-dsl
- Paper mencionado en el README: https://snapkittywest.github.io/hyperkitty/papers/sovereign-routing-algebras.pdf
- Repositorio de HyperKitty OS (mencionado en el README): https://github.com/SNAPKITTYWEST/hyperkitty
