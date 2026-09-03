# Snapkitty/pure-validity

## Resumen

El repositorio `Snapkitty/pure-validity` no contiene un modelo de inteligencia artificial, sino un motor de verificación formal de circuitos lógicos escrito en Haskell, con un backend en Fortran y un núcleo de confianza de aproximadamente 80 líneas. El proyecto, desarrollado por el autor "Snapkitty", implementa un compilador para un lenguaje fuente (`.nf`) donde la puerta NAND es el único primitivo, un solucionador SAT (DPLL + CDCL con aprendizaje de cláusulas) y un kernel independiente que verifica certificados de resolución. El objetivo es demostrar la corrección de circuitos booleanos desde primeros principios, sin depender de herramientas externas como Z3, SMT, Lean o Coq.

La relevancia actual radica en su enfoque de separación entre el solucionador (complejo, con heurísticas) y el kernel de verificación (simple y auditado), lo que minimiza el riesgo de aceptar pruebas inválidas. Aunque no es un modelo de IA, su diseño puede interesar a desarrolladores e investigadores en verificación formal, lógica computacional y sistemas de confianza. La información pública disponible es limitada: el repositorio en HuggingFace presenta una model card con el README del proyecto, pero no se proporcionan métricas de rendimiento, arquitectura de red neuronal ni datos de entrenamiento, ya que no aplican.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (no es un modelo de redes neuronales; es un motor de verificación formal) |
| Parametros totales | No disponible |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (el lenguaje fuente es propio, `.nf`) |
| Licencia | AGPL-3.0 (según la insignia en el README) |
| Formato de pesos | No disponible (el proyecto se distribuye como código fuente Haskell) |

## Arquitectura y entrenamiento

No se trata de un modelo de IA, por lo que no existe arquitectura de red neuronal ni proceso de entrenamiento con datos. El proyecto `pure-validity` es un sistema de software con los siguientes componentes:

- **Lenguaje fuente (`.nf`)**: NAND como única primitiva; permite definir circuitos (`def`) y declarar propiedades a verificar (`prove`, `assert`).
- **Compilador**: lexer y parser (Haskell) que transforman el código fuente en un AST, y un elaborador que lo convierte en un IR booleano con árboles de expresiones NAND.
- **Solucionador SAT**: implementa DPLL + CDCL con aprendizaje de cláusulas, heurísticas de decisión, propagación unitaria y reinicios.
- **Kernel de verificación**: aproximadamente 80 líneas de código que comprueban de forma independiente los certificados de resolución emitidos por el solucionador. La separación garantiza que un fallo en el solucionador solo provoque "no se encontró prueba" (fallo seguro), mientras que un fallo en el kernel podría aceptar una prueba inválida (el único riesgo real de falta de solidez).

No hay datos de entrenamiento porque no es un modelo estadístico; el sistema funciona mediante búsqueda exhaustiva y razonamiento lógico.

## Capacidades

- Verificación formal de circuitos booleanos definidos a partir de puertas NAND.
- Definición de funciones lógicas derivadas (NOT, AND, OR, XOR, etc.) mediante composición de NAND.
- Declaración de propiedades (`prove`, `assert`) y verificación automática de su validez.
- Generación de certificados de resolución que pueden ser comprobados por un kernel externo.
- Soporte para módulos y comentarios en el lenguaje fuente.
- Independencia de herramientas externas de verificación (no requiere Z3, SMT, Lean o Coq).

No dispone de capacidades de procesamiento de lenguaje natural, generación de texto, visión, tool calling ni agentes, ya que no es un modelo de IA.

## Casos de uso

- **Verificación de circuitos combinacionales**: permite demostrar que una implementación lógica (p. ej., un sumador, un multiplexor) cumple su especificación funcional. El usuario escribe la definición en `.nf` y declara las propiedades deseadas; el motor las verifica automáticamente.
- **Enseñanza de lógica computacional**: el proyecto puede utilizarse como herramienta didáctica para ilustrar cómo se construye un verificador formal desde cero, mostrando la separación entre solucionador y kernel.
- **Auditoría de diseños de hardware**: aunque el lenguaje es de alto nivel, la verificación de puertas NAND puede aplicarse a diseños de bajo nivel en entornos académicos o de investigación.
- **Investigación en solucionadores SAT**: el código fuente del solucionador (DPLL + CDCL) puede servir como base para experimentar con nuevas heurísticas o estrategias de aprendizaje de cláusulas.
- **Generación y comprobación de certificados de prueba**: el sistema emite certificados de resolución que pueden ser verificados de forma independiente, lo que es útil en entornos donde se requiere una auditoría externa de la corrección.
- **Estudio de kernels de confianza**: el kernel de ~80 líneas es un ejemplo mínimo de un componente crítico que debe ser correcto; puede analizarse para entender los requisitos de solidez en sistemas de verificación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El README muestra una ejecución de ejemplo con 16 propiedades verificadas, pero no se proporcionan métricas de rendimiento (tiempo, uso de memoria, escalabilidad) ni comparaciones con otras herramientas de verificación.

## Requisitos de hardware

- **VRAM**: No aplica, ya que no es un modelo de redes neuronales.
- **GPU**: No requiere GPU; el proyecto se compila y ejecuta en CPU.
- **Memoria**: No se especifica; al ser un verificador SAT, el consumo dependerá del tamaño de los circuitos y de las propiedades. En general, los solucionadores SAT pueden requerir memoria proporcional al número de variables y cláusulas.
- **Compilación**: Necesita GHC (Glasgow Haskell Compiler) y la herramienta de construcción Cabal, según el README (`cabal build`).
- **Despliegue**: Se ejecuta como una aplicación de línea de comandos (`cabal run pure-validity -- examples/gates.nf`). No está pensado para despliegue como servicio web ni para inferencia en tiempo real.

## Comparativa con modelos similares

No aplica, ya que no es un modelo de IA. Si se compara con otras herramientas de verificación formal, el proyecto se distingue por su autosuficiencia (sin dependencias externas) y su énfasis en la separación solucionador/kernel. Herramientas como Z3, Lean o Coq son mucho más completas pero dependen de librerías externas y tienen un alcance más amplio. No se dispone de datos cuantitativos para una comparación rigurosa.

## Limitaciones y advertencias

- **No es un modelo de IA**: no puede realizar tareas de procesamiento de lenguaje, generación de texto ni razonamiento estadístico.
- **Alcance limitado**: solo verifica circuitos booleanos definidos con NAND; no soporta aritmética de enteros, lógica de primer orden ni razonamiento matemático avanzado.
- **Escalabilidad desconocida**: no se proporcionan datos sobre el rendimiento en circuitos grandes; los solucionadores SAT pueden sufrir explosión combinatoria.
- **Licencia AGPL-3.0**: si se utiliza el código o se integra en otros proyectos, las obligaciones de copyleft pueden afectar a la distribución del software derivado.
- **Fecha de creación futura**: el repositorio está fechado en 2026-09-03, lo que sugiere que podría ser un proyecto experimental o una entrada de prueba; no hay evidencia de uso en producción.
- **Sin soporte oficial**: no se indica canal de soporte, documentación adicional ni mantenimiento activo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Snapkitty/pure-validity
- Repositorio de código (mencionado en el README): https://github.com/SNAPKITTYWEST/pure-validity (no se ha verificado su disponibilidad)
- No se proporcionan papers, blogs, demos u otros enlaces en la información disponible.
