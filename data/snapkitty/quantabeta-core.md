# Snapkitty/quantabeta-core

## Resumen

QuantaBeta Core es un pipeline cuantitativo financiero de código abierto desarrollado por Snapkitty, que no es un modelo de inteligencia artificial generativa, sino un sistema de software determinista para la búsqueda de factores de inversión (alpha) basado en teoría de números. Su propuesta central es que las estructuras aritméticas —como las congruencias de Ramanujan, los operadores de Hecke y las identidades de Rogers-Ramanujan— son filtros ejecutables que seleccionan patrones predictivos en series de retornos financieros, en lugar de depender de correlaciones estadísticas aprendidas por redes neuronales.

El proyecto destaca por su prohibición absoluta de números en coma flotante (f64) en todas sus capas, sustituyéndolos por aritmética racional exacta con la librería GMP, lo que garantiza que una misma entrada produzca resultados bit a bit idénticos en cualquier máquina. La implementación combina Rust (álgebra simbólica de características), Haskell (búsqueda de invariantes con LiquidHaskell) y Lean 4 (validación formal con cero "sorry"), y cada factor generado se sella de forma inmutable (WORM). La licencia es "Sovereign Source v1.0" con cambio a AGPL-3.0 el 1 de enero de 2029.

El repositorio en HuggingFace tiene cero descargas y cero likes, con un tamaño de 0.0 GB, lo que sugiere que es un proyecto incipiente o una publicación de código sin distribución amplia. No se trata de un modelo con pesos ni parámetros entrenables, por lo que la ficha técnica habitual de un LLM no aplica directamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline determinista de minería de alpha basado en teoría de números (no es un modelo de IA) |
| Parametros totales | No disponible (no aplica: no hay pesos neuronales) |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No disponible (no procesa texto; opera sobre series de retornos) |
| Tipos de cuantizacion | No disponible (no aplica; usa precisión arbitraria con GMP/MPFR) |
| Idiomas soportados | No disponible (no es un modelo de lenguaje) |
| Licencia | Sovereign Source v1.0 (con cambio a AGPL-3.0 el 2029-01-01) |
| Formato de pesos | No disponible (no aplica; el código fuente está en Rust, Haskell y Lean 4) |

## Arquitectura y entrenamiento

QuantaBeta Core no sigue la arquitectura de un transformer, MoE o SSM. Es un sistema de software compuesto por varias capas de procesamiento: una capa de álgebra simbólica de características en Rust que utiliza `rug::Rational` para representar todas las operaciones con números racionales exactos; una capa de búsqueda de invariantes aritméticos en Haskell con LiquidHaskell para verificar propiedades de tipo; y una capa de validación formal en Lean 4 que demuestra teoremas sin "sorry". El pipeline reemplaza el flujo típico de "agente LLM → generación de código → backtest" por una secuencia de búsqueda de invariantes, generación de código con pruebas y validación formal de factores.

No hay entrenamiento en el sentido de aprendizaje automático: no se optimizan pesos ni se usan datasets de texto. Los datos de entrada son series de retornos financieros, y el sistema aplica transformaciones matemáticas exactas (congruencias de Ramanujan, operadores de Hecke, entropía simbólica) para generar factores. La innovación clave es el uso de la teoría de números como filtro de selección, junto con la garantía de determinismo total al prohibir floats y usar aritmética racional con redondeo dirigido en los pocos casos donde se necesita una aproximación (p.ej., entropía con MPFR).

## Capacidades

- Generación de factores de inversión (alpha) mediante invariantes aritméticos: congruencias de Ramanujan, operadores de Hecke y identidades de Rogers-Ramanujan.
- Validación formal de teoremas con Lean 4 (cero "sorry"), lo que garantiza que los criterios de aceptación son teoremas demostrados, no umbrales empíricos.
- Determinismo absoluto: misma entrada produce salida bit a bit idéntica en cualquier máquina, gracias a la ausencia de floats y al uso de GMP con precisión arbitraria.
- Cálculo de volatilidad basado en entropía de particiones (función p(n) de Ramanujan) en lugar de varianza clásica.
- Filtro de complejidad estructural: factores cuya complejidad cae en residuos de congruencia de Ramanujan se marcan como de bajo contenido informativo.
- Correlación cruzada mediante operadores de Hecke con cota de Deligne como filtro duro de factibilidad.
- Sellado WORM de factores: una vez generados, no pueden modificarse, garantizando reproducibilidad y auditoría.

## Casos de uso

- Backtesting de estrategias cuantitativas con reproducibilidad total: dado que el pipeline es determinista, los resultados de backtest son idénticos en todos los entornos, eliminando el riesgo de discrepancias por redondeo entre desarrollo y producción.
- Investigación académica en finanzas matemáticas: la integración de teoría de números (congruencias de Ramanujan, operadores de Hecke) permite explorar si estructuras aritméticas subyacen a los patrones de retornos, con validación formal en Lean 4.
- Auditoría regulatoria de modelos de inversión: la naturaleza WORM y la demostración formal de invariantes facilitan la justificación de decisiones ante organismos de control, al poder mostrar teoremas verificados en lugar de correlaciones empíricas.
- Desarrollo de índices de volatilidad alternativos: la entropía de particiones basada en p(n) puede servir como medida complementaria a la varianza para caracterizar incertidumbre en mercados con distribuciones no gaussianas.
- Sistemas de trading de alta frecuencia con requisitos de consistencia entre máquinas: la aritmética exacta evita problemas de no asociatividad de floats que podrían causar divergencias en ejecución paralela.
- Formación y divulgación en finanzas computacionales: el código en Rust, Haskell y Lean 4 sirve como ejemplo didáctico de cómo aplicar teoría de números y verificación formal a problemas financieros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de aprendizaje automático (como MMLU, HumanEval o GSM8K) porque el proyecto no es un modelo de IA. En su lugar, la documentación describe validaciones matemáticas internas: las congruencias de Ramanujan `p(5k+4) ≡ 0 (mod 5)` y `p(7k+5) ≡ 0 (mod 7)` se verifican en código y se contrastan contra la secuencia OEIS A000041. También se menciona la cota de Deligne como filtro de rechazo de invariantes estructuralmente imposibles. No hay datos de rendimiento en términos de latencia, throughput o precisión predictiva de los factores generados.

## Requisitos de hardware

- No se especifican requisitos de VRAM ni GPU en la información disponible. Al ser un pipeline de cálculo simbólico con GMP, probablemente se ejecute en CPU con requisitos moderados de memoria, dependiendo del tamaño de las series de retornos.
- No es necesario un GPU; el cómputo es aritmético exacto y no involucra operaciones matriciales intensivas típicas de deep learning.
- Se recomienda una CPU moderna con soporte para Rust y Haskell; el uso de GMP puede beneficiarse de múltiples núcleos si la implementación paraleliza.
- Las opciones de despliegue incluyen compilación nativa desde el código fuente (Cargo para Rust, Stack/Cabal para Haskell, lake para Lean 4). No hay contenedores preconstruidos ni servicios de inferencia tipo vLLM u Ollama.
- La latencia y el throughput no están documentados.

## Comparativa con modelos similares

No es posible comparar directamente con modelos de IA generativa o LLMs, ya que QuantaBeta Core no es un modelo de lenguaje ni un sistema de aprendizaje automático. Dentro del ámbito de librerías cuantitativas tradicionales (NumPy, pandas, VectorBT), la diferencia principal es que estas usan aritmética de coma flotante IEEE 754, mientras que QuantaBeta exige racionales exactos. Esta comparación no se refleja en una tabla de parámetros de modelo, sino en la filosofía de cálculo. No se dispone de información sobre alternativas equivalentes que combinen teoría de números, verificación formal y finanzas.

## Limitaciones y advertencias

- No es un modelo de IA: no puede generar texto, responder preguntas ni procesar lenguaje natural. Su uso se limita a análisis cuantitativo de series de retornos.
- La licencia "Sovereign Source v1.0" es no estándar y puede imponer restricciones de uso comercial desconocidas hasta que se aclare su texto completo; el cambio a AGPL-3.0 en 2029 añade obligaciones de copyleft.
- El proyecto tiene cero descargas y cero likes en HuggingFace, lo que indica una adopción mínima y falta de validación por parte de la comunidad.
- No se aportan resultados empíricos de rendimiento de los factores generados (Sharpe, drawdown, etc.), por lo que no hay evidencia de que la teoría numérica produzca alpha real en mercados.
- La dependencia de teoremas avanzados (congruencias de Ramanujan, operadores de Hecke) puede dificultar la revisión por parte de profesionales financieros sin formación matemática profunda.
- No se documentan sesgos, alucinaciones ni riesgos de contexto porque no es un modelo de lenguaje; sin embargo, el riesgo de sobreajuste a estructuras aritméticas sin respaldo empírico es una advertencia clave para uso en producción.
- La ausencia de floats, aunque garantiza determinismo, puede hacer que ciertos cálculos (p.ej., ratios de Sharpe con intervalos racionales) sean computacionalmente más costosos o difíciles de integrar con herramientas estándar del ecosistema financiero.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Snapkitty/quantabeta-core
- Referencia DOI citada en la documentación (Zenodo): https://doi.org/10.5281/zenodo.21727363 (conexión con la conjetura de Jacobian y PAR-011)
- No se proporcionan otros enlaces (papers, blogs, demos) en la información disponible.
