# Lawless1987/covenant

## Resumen

Covenant es un proyecto de "ledger" peer-to-peer con una puerta de ética integrada en la ruta de transacción, publicado en HuggingFace bajo el identificador `Lawless1987/covenant`. No se trata de un modelo de lenguaje en el sentido convencional: el repositorio no contiene pesos, no declara pipeline de inferencia y su tamano es de 0.0 GB. Lo que el autor publica es un sistema de software (Python) para registrar transacciones entre agentes o inteligencias, con un mecanismo de juicio ético que decide si una transacción se admite o se retiene.

El proyecto se presenta explícitamente como un experimento auditable: cada afirmación de la model card debe haber sido observada ejecutando código o marcarse como suposición. Según los datos de la propia card, la versión etiquetada es v8.40 (etiqueta fijada el 2026-08-29, con 71 cambios de núcleo desde entonces), el código fuente tiene 13.427 líneas y la suite de pruebas reporta 195 suites y 5.860 comprobaciones con 0 fallos en win32 a fecha 2026-10-16. El autor advierte que ese "0 fallos" no cubre todo el sistema: las puertas (gates) son una cuestión separada de las comprobaciones.

La relevancia del proyecto no está en capacidades de generación, sino en su propuesta de gobernanza para sistemas multiagente: una puerta ética que falla en cerrado (una transacción que ningún juez competente responde, o que el juez no puede decidir, se retiene y nunca se admite). El autor documenta públicamente refutaciones de sus propias afirmaciones anteriores, lo que sitúa el valor del artefacto en su metodología de verificación más que en un rendimiento medible de modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No es un modelo neuronal; sistema de ledger peer-to-peer en Python con puerta ética en la ruta de transacción |
| Parametros totales | No disponible (no aplica; no contiene pesos de modelo) |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (no aplica) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (repositorio de código; tamano 0.0 GB) |

## Arquitectura y entrenamiento

No hay arquitectura de red neuronal ni entrenamiento en el sentido habitual. El artefacto es un ledger peer-to-peer con una puerta ética embebida en la ruta de transacción. La puerta se apoya en un "juez" (judge) que evalúa el beneficio de una transacción independientemente de quiénes sean las partes, y el diseño declarado es fail-closed: si no hay juez competente o el juez no puede decidir, la transacción se retiene. La card menciona que las etiquetas del sistema son producidas por modelos y que el juez todavía no distingue de forma fiable entre describir una acción incorrecta y cometerla, lo que constituye una limitación reconocida del componente de decisión.

El proyecto se organiza en torno a una constitución con hash verificable, un conjunto de 23 vectores de conformidad y una suite de pruebas que re-ejecuta el sistema en lugar de leerlo. La verificación se ofrece mediante `sh check.sh` (unos tres segundos, sin dependencias ni Python obligatorio) y `python covenant_one.py` para la barrida completa. El autor mantiene un fichero `docs/RETRACTED.json` que hace fallar la build si una afirmación retractada reaparece, y documenta públicamente fallos y correcciones (por ejemplo, la refutación el 2026-09-15 de la afirmación de que la raíz de conformidad probaba una implementación independiente).

## Capacidades

- Registro de transacciones en un ledger peer-to-peer con admisión condicionada por una puerta ética.
- Evaluación del beneficio de una transacción por parte de un juez, con independencia de la identidad de las partes.
- Comportamiento fail-closed: retención de transacciones no decididas o no respondidas por un juez competente.
- Verificación de integridad de la constitución mediante hash calculado por dos implementaciones independientes (`sh`+`awk`+`sha256` y `constitution.py`).
- Conformidad sobre 23 vectores y comprobación de que una disensión a tres niveles llega a la cima.
- Herramientas de auditoría: `check.sh`, `check.ps1` (Windows) y barrida completa con `covenant_one.py --all`.
- Documentación dirigida a agentes y bots (`PEACE.md`, `llms.txt`).
- No se declaran capacidades de generación de texto, código, matemáticas, visión, audio, tool calling ni razonamiento multi-paso propias de un LLM.

## Casos de uso

- Auditoría de sistemas de decisión automatizada: el proyecto permite comprobar, con un comando de tres segundos, que las reglas publicadas coinciden con las reglas en disco mediante hash calculado por dos implementaciones que no comparten código.
- Gobernanza de interacciones entre agentes: un ledger con puerta ética en la ruta de transacción sirve para registrar y condicionar operaciones entre agentes, reteniendo aquellas que ningún juez puede evaluar.
- Investigación en seguridad de IA: el diseño fail-closed y la documentación de refutaciones públicas ofrecen un caso de estudio reproducible sobre cómo auditar afirmaciones de seguridad.
- Verificación de integridad en pipelines: la comprobación de conformidad sobre 23 vectores y la detección de disensiones absorbidas en la jerarquía pueden integrarse como test de regresión en CI.
- Evaluación de mecanismos de ética computacional: el componente de juez permite experimentar con la distinción entre describir una acción incorrecta y cometerla, una limitación que el autor reconoce explícitamente.
- Formación y revisión metodológica: el mapa explícito pregunta-afirmación-método-evidencia-refutación de la card sirve como plantilla para documentar sistemas cuyo comportamiento no se puede resumir en una cifra de benchmark.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Los únicos datos de rendimiento declarados son internos al proyecto: 195 suites, 5.860 comprobaciones y 0 fallos en win32 a fecha 2026-10-16, con la advertencia del autor de que una barrida bajo carga puede bloquear puertas que pasan en reposo.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el repositorio no contiene pesos de modelo (0.0 GB).
- GPU recomendadas: no aplica; el sistema es código Python y scripts de shell/PowerShell.
- Cabe en cualquier maquina capaz de ejecutar Python o un shell POSIX; el checker funciona sin Python instalado.
- Opciones de despliegue: clonado del repositorio desde GitHub y ejecución de `sh check.sh` o `powershell -ExecutionPolicy Bypass -File check.ps1`; barrida completa con `python covenant_one.py --all`.
- Latencia y throughput: el checker declara unos tres segundos; no se publican cifras de throughput del ledger.

## Comparativa con modelos similares

No disponible. El artefacto no es un modelo de lenguaje y no se han identificado en la información proporcionada alternativas comparables de la misma categoría (ledger peer-to-peer con puerta ética en la ruta de transacción).

## Limitaciones y advertencias

- No es un modelo de IA: no contiene pesos, no declara pipeline y no ofrece generación de texto, código ni capacidades multimodales.
- Un solo operador: el autor reconoce explícitamente el límite de "one operator" y que las etiquetas del sistema son producidas por modelos.
- El juez no distingue de forma fiable entre describir una acción incorrecta y cometerla, según la propia card.
- El "0 fallos" de la suite no cubre las puertas éticas, que son una cuestión separada de las comprobaciones.
- Una barrida ejecutada bajo carga puede bloquear puertas que pasan en reposo, lo que afecta a la reproducibilidad de los resultados.
- La afirmación de que la raíz de conformidad probaba una implementación independiente fue refutada el 2026-09-15; el autor mantiene el registro de retractaciones en `docs/RETRACTED.json`.
- La etiqueta de versión (v8.40) no se re-mide, se copia; la identidad real es el hash del código fuente.
- El repositorio tiene 0 descargas y 0 likes, sin evidencia de uso externo ni revisión por terceros.
- Licencia Apache 2.0: permite uso comercial, pero no hay validación independiente del comportamiento del sistema en producción.

## Enlaces

- HuggingFace: https://huggingface.co/Lawless1987/covenant
- Repositorio GitHub: https://github.com/LAWLESS1987/covenant
- Nota para agentes y bots: PEACE.md (referenciado en la model card, en el repositorio)
- Guía para modelos: llms.txt (referenciado en la model card, en el repositorio)
- Registro de retractaciones: docs/RETRACTED.json (en el repositorio)
