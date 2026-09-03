# Snapkitty/topological-quantum-computer

## Resumen

Este repositorio no es un modelo de inteligencia artificial generativa ni discriminativa, sino un paquete de investigación en computación cuántica topológica basado en el modelo de anyones de Fibonacci (teoría de Chern-Simons SU(2)_3). Desarrollado por Ahmad Ali Parr bajo el usuario Snapkitty, el proyecto formaliza en Lean 4 las reglas de fusión y compilación de trenzados, e implementa en Python un compilador reversible llamado Q-Lambda que traduce programas a circuitos QIR y posteriormente a secuencias de operaciones de trenzado.

El objetivo central es evaluar si una computadora cuántica topológica de anyones de Fibonacci ofrecería ventaja práctica para el criptoanálisis de funciones hash tipo SHA. La conclusión del autor es negativa: la búsqueda de preimagen genérica de SHA-520 solo admite la aceleración cuadrática de Grover (2^260 llamadas al oráculo), y los costes de compilación de trenzados, corrección de errores y coherencia dominan cualquier posible ventaja. El resultado negativo se presenta como la contribución principal.

El paquete incluye una formalización matemática en Lean 4, un compilador Q-Lambda, un backend de trenzados, estimaciones de recursos y cuatro fases de experimentos de validación. No es un modelo entrenado ni un sistema de IA; es un framework de simulación y verificación formal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Formalización Lean 4 + compilador Q-Lambda + backend de trenzados topológicos |
| Parametros totales | no disponible (no es un modelo de redes neuronales) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplica |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | no disponible (el código y la documentación están en inglés) |
| Licencia | Tri-licencia: BSL-1.1 / AGPL-3.0 / MPL-2.0 |
| Formato de pesos | no aplica (código fuente Python y Lean 4) |

## Arquitectura y entrenamiento

No hay entrenamiento en el sentido de aprendizaje automático. El paquete se compone de dos partes principales:

- **Formalización Lean 4**: archivos `.lean` que demuestran teoremas sobre las reglas de fusión de anyones de Fibonacci (`tau x tau = 1 + tau`), codificación de qubits lógicos en 3 o 4 anyones, compilación de compuertas cuánticas (H, X, S, CNOT, CCX) en palabras de trenzado, y teoremas de coste de trenzado. La universalidad del trenzado se cita al trabajo de Freedman-Larsen-Wang (2002), no se demuestra en el repositorio.

- **Implementación Python**: un compilador Q-Lambda (lexer, parser, sintetizador QIR, pase de descomputación), un módulo de constantes para SHA-520, programas fuente en Q-Lambda, un backend que traduce QIR a trenzados de Fibonacci, y estimaciones de recursos de anyones y trenzados. También incluye una construcción de oráculo reversible para SHA-520 y una implementación de búsqueda de Grover.

No se mencionan datos de entrenamiento, tokens, ni técnicas de RLHF/DPO porque no aplican.

## Capacidades

- **Formalización matemática**: demuestra reglas de fusión de anyones de Fibonacci y teoremas de conteo de dimensiones.
- **Compilación de circuitos**: traduce un DSL reversible (Q-Lambda) a QIR y luego a secuencias de operaciones de trenzado.
- **Estimación de recursos**: calcula costes de anyones y trenzados para compuertas lógicas.
- **Simulación cuántica opcional**: incluye experimentos con Qiskit Aer para Grover de rondas reducidas.
- **Validación clásica**: verifica vectores de prueba para SHA-520 de rondas reducidas.
- **Análisis criptoanalítico**: evalúa la viabilidad de ataques Grover sobre SHA-520, concluyendo que no hay ventaja asintótica.
- **No es un modelo de IA**: no genera texto, no razona, no procesa lenguaje natural ni imágenes.

## Casos de uso

- **Investigación en computación cuántica topológica**: el paquete sirve como base para estudiar la viabilidad de anyones de Fibonacci como plataforma de computación cuántica, permitiendo simular la compilación de circuitos en trenzados y estimar recursos físicos necesarios.
- **Verificación formal de algoritmos cuánticos**: los archivos Lean 4 proporcionan pruebas mecánicamente verificadas de las reglas de fusión y de las longitudes de las palabras de trenzado, útiles para quienes trabajan en verificación de software cuántico.
- **Enseñanza de teoría de cualquieres**: el código y los teoremas ofrecen un ejemplo concreto y ejecutable de la categoría de Fibonacci, útil en cursos de información cuántica topológica.
- **Evaluación de costes de compilación de circuitos**: el backend de trenzados permite calcular cuántas operaciones de trenzado se necesitan para implementar compuertas estándar (H: 5, T: 300, CNOT: 5, CCX: 16), información relevante para diseño de arquitecturas.
- **Análisis de seguridad de funciones hash**: la construcción de oráculos reversibles para SHA-520 y la implementación de Grover permiten estudiar límites teóricos de ataques cuánticos, aunque el resultado es negativo.
- **Desarrollo de compiladores reversibles**: el compilador Q-Lambda es un ejemplo de DSL reversible que puede interesar a quienes trabajan en computación reversible o lógica de bajo consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de IA (MMLU, HumanEval, etc.) porque no es un modelo de IA. La model card reporta resultados de validación interna:

- Costes de trenzado: H (5), T (300), CNOT (5), CCX (16).
- Búsqueda de Grover sobre SHA-520: requiere 2^260 llamadas al oráculo.
- Estado de falsación: todos los criterios están abiertos (no se ha demostrado la existencia física de anyones de Fibonacci, ni la viabilidad de la arquitectura).

## Requisitos de hardware

- No se especifican requisitos mínimos de hardware en la información disponible.
- La parte Python requiere Python 3.9+ y, opcionalmente, Qiskit Aer para la simulación cuántica.
- La parte Lean 4 requiere el compilador Lean 4 y `lake` para construir el proyecto.
- La simulación clásica de SHA-520 de rondas reducidas es ligera y ejecutable en cualquier CPU moderna.
- No hay requisitos de GPU ni de VRAM porque no hay inferencia de modelos de IA.

## Comparativa con modelos similares

No disponible. Este paquete no pertenece a la categoría de modelos de IA generativa o discriminativa, por lo que no hay comparación directa con LLMs u otros modelos. Podría compararse con frameworks de simulación cuántica como Qiskit o ProjectQ, pero no se dispone de datos de rendimiento comparativos en la información proporcionada.

## Limitaciones y advertencias

- **No es un modelo de IA**: no realiza generación de texto, razonamiento automático ni ninguna tarea de aprendizaje automático.
- **No hay implementación física**: los anyones de Fibonacci no están demostrados experimentalmente; el repositorio es una formalización matemática y una simulación.
- **No rompe SHA**: el autor declara explícitamente que la búsqueda de preimagen de SHA-520 no tiene ventaja más allá de Grover y que el ataque a rondas completas es físicamente inviable.
- **Pruebas incompletas**: la universalidad del trenzado se cita a un resultado externo (Freedman-Larsen-Wang 2002), no se demuestra en el repositorio.
- **Licencia tri-licencia**: BSL-1.1, AGPL-3.0 y MPL-2.0. La BSL-1.1 puede tener restricciones de uso comercial dependiendo del plazo; se debe revisar el archivo `LICENSE.tri`.
- **Estado de investigación**: la model card lo califica como "staged research release", con criterios de falsación abiertos.
- **Sin garantía de corrección completa**: aunque los teoremas Lean 4 compilan, el repositorio no afirma cerrar todas las demostraciones.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Snapkitty/topological-quantum-computer
- Referencias citadas en la model card:
  - Kitaev, A. (2003). Fault-tolerant quantum computation by anyons. *Annals of Physics*.
  - Freedman, M. H.; Larsen, M. J.; Wang, Z. (2002). The two-eigenvalue problem and density of Jones representation of braid groups. *Communications in Mathematical Physics*.
  - Preskill, J. (2004). Lecture Notes on Topological Quantum Computation. Chapter 9.
