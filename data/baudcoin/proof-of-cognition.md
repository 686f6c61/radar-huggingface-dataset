# baudcoin/proof-of-cognition

## Resumen

Proof of Cognition es un mecanismo de minería propuesto por el proyecto BaudCoin (BAUD), un token BEP20 en BNB Chain, que pretende recompensar a modelos de lenguaje por razonamiento verificable en lugar de por computación hash. En lugar de pagar por electricidad quemada como en la prueba de trabajo clásica, este protocolo busca que los agentes autónomos obtengan recompensas por resolver tareas de razonamiento que pueden ser validadas de forma determinista y reproducible por cualquier tercero.

El sistema define un conjunto de clases de desafíos (multi-hop, síntesis, recuperación, planificación, etc.) con pesos específicos, y un proceso de validación que garantiza que el resultado sea objetivamente comprobable. La idea central es que, si el trabajo puede ser verificado sin confiar en un juez central, se puede emitir moneda basada en capacidad intelectual en lugar de desperdicio energético. Actualmente es un borrador en desarrollo, sin resultados de minería en producción, pero el kit de minería y los formatos de desafío son públicos y ejecutables.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (mecanismo de consenso, no un modelo de red neuronal) |
| Parametros totales | no disponible |
| Parametros activos | no aplica |
| Longitud de contexto | no aplica |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | en (según el YAML del modelo) |
| Licencia | MIT |
| Formato de pesos | no aplica (no hay pesos, es un protocolo) |

## Arquitectura y entrenamiento

No se trata de un modelo de lenguaje entrenado, sino de un protocolo de verificación de razonamiento. El diseño se basa en cinco pilares: desafíos de mundo cerrado generados a partir de un grafo de hechos (la respuesta solo se deriva del contexto suministrado), restricciones comprobables por máquina (límites de tokens, requisitos de citación, esquema de salida), validadores deterministas que devuelven el mismo veredicto en cualquier máquina, semillas de desafíos con commit-reveal para evitar selección posterior, y un sistema de múltiples intentos con decaimiento de crédito (1.00×, 0.75×, 0.50×) que separa errores de razonamiento de errores de formato.

No hay entrenamiento en el sentido de ajuste de pesos. El mecanismo se describe como un método de consenso que produce un subproducto: un corpus de razonamiento limpio (prompts, artefactos, veredictos, intentos y latencias) que se publica abiertamente en el dataset `baudcoin/baud-reasoning-traces`. La validación es reproducible por cualquier parte independiente, lo que evita depender de un juez central.

## Capacidades

- Generación de desafíos de razonamiento multi-hop, síntesis con restricciones, recuperación de memoria, descomposición de tareas, citación cruzada, clustering semántico y decisiones de perfil.
- Verificación determinista y reproducible de las respuestas generadas por modelos de lenguaje.
- Mecanismo de multi-intento con decaimiento de recompensa que distingue fallos de razonamiento de errores de formato.
- Emisión de créditos basados en peso de clase y banda de dificultad, con liquidación pro rata contra un stake respaldado por principal.
- Producción de un corpus de razonamiento validado y con dirección de contenido (content-addressed) como subproducto.
- Soporte de ejecución local mediante un kit de minería que incluye auto-chequeo y demo de epoch completo.

## Casos de uso

- Minería de tokens para agentes autónomos: un agente puede ejecutar el minero localmente, resolver desafíos de razonamiento y obtener créditos BAUD, que luego pueden ser utilizados en transacciones entre agentes.
- Generación de conjuntos de datos de razonamiento de alta calidad: el mecanismo produce un corpus con veredictos validados, útil para entrenar o evaluar modelos de razonamiento multi-hop.
- Verificación de capacidad de modelos: un desarrollador puede usar los desafíos para comprobar objetivamente si un modelo puede seguir restricciones complejas (citas, esquemas de salida, límites de tokens).
- Infraestructura para economía de agentes: permite que agentes autónomos se paguen entre sí por trabajo de razonamiento verificable, sin necesidad de un oráculo central.
- Auditoría de razonamiento: en entornos donde se requiera trazabilidad de decisiones de IA (por ejemplo, bajo el EU AI Act), este mecanismo podría servir como prueba de que el modelo procesó restricciones específicas antes de actuar.
- Investigación en mecanismos de consenso: el diseño de validación determinista y commit-reveal es un caso de estudio para sistemas que buscan recompensar trabajo intelectual de forma verificable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica que no hay resultados de minería en vivo aún, y que la tarjeta no reporta ninguno. No se proporcionan métricas de latencia, throughput ni precisión.

## Requisitos de hardware

- No se especifican requisitos de GPU o VRAM, ya que el mecanismo es un protocolo de validación, no un modelo de inferencia.
- El minero se ejecuta con Python y las librerías `eth-account` y `requests`. Requiere una máquina con conexión a internet para interactuar con la red.
- No hay indicaciones de hardware mínimo; un entorno de desarrollo típico con Python es suficiente para ejecutar el demo local.
- El despliegue de la validación es ligero y no requiere aceleración por GPU.

## Comparativa con modelos similares

No se han encontrado modelos directamente comparables, ya que se trata de un mecanismo de consenso y no de un modelo de lenguaje. Como referencia, se puede comparar conceptualmente con otros mecanismos de consenso basados en IA, como los propuestos en el documento de "Cognition Coin" (semantic proof-of-work) o en el "Proof of Cognition" de CLE-Net, pero no hay datos de rendimiento comparables. La tabla siguiente resume diferencias conceptuales:

| Aspecto | Proof of Cognition (BaudCoin) | Semantic PoW (Cognition Coin) | Proof of Work clásico |
|---|---|---|---|
| Trabajo | Razonamiento multi-hop y síntesis | Puzzles semánticos con restricciones gramaticales | Hashing criptográfico |
| Verificación | Determinista, reproducible por cualquiera | No especificado | Determinista (hash) |
| Recompensa | Créditos ponderados por clase y dificultad | No especificado | Monedas por bloque |
| Dependencia de IA | Requiere modelos de lenguaje | Requiere modelos locales | No requiere IA |
| Estado | Borrador en desarrollo | Whitepaper | En producción |

## Limitaciones y advertencias

- El mecanismo es un borrador en desarrollo; no hay resultados de minería en producción.
- La verificación determinista está limitada a dominios con validadores bien definidos; ampliar la variedad de dominios es un problema abierto.
- La calibración de dificultad es manual y puede inflar las emisiones si los modelos mejoran.
- Existe riesgo de colusión en tareas de citación cruzada, aunque se mitiga filtrando citas de propietarios compartidos.
- El protocolo no ofrece garantías de seguridad formalmente probadas; se recomienda auditoría externa antes de su uso en producción.
- El token BAUD no está afiliado ni respaldado por Binance; es un experimento comunitario independiente.
- No se ha proporcionado información sobre sesgos, alucinación o limitaciones lingüísticas de los modelos que puedan participar.

## Enlaces

- [HuggingFace - baudcoin/proof-of-cognition](https://huggingface.co/baudcoin/proof-of-cognition)
- [Sitio web de BaudCoin](https://baud.money)
- [Documentación de BaudCoin](https://baud.money/docs/)
- [Dataset baudcoin/baud-reasoning-traces](https://huggingface.co/baudcoin/baud-reasoning-traces)
- [Kit de minería baudcoin/baud-miner-kit](https://huggingface.co/baudcoin/baud-miner-kit)
- [GitHub de BaudCoin](https://github.com/baudcoin)
- [Perfil en X de BaudCoin](https://x.com/baudcoin)
